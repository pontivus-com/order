import {
  CommitWorkItemDocumentationSchema,
  WorkItemDocumentationGitStatusSchema,
  type CommitWorkItemDocumentation,
  type RepositoryPath,
  type WorkItemDocumentationCommit,
  type WorkItemDocumentationGitBlocker,
  type WorkItemDocumentationGitStatus,
  type WorkItemId,
} from "../core/contracts.ts";
import {
  workItemArchiveMarkerPath,
  workItemDocumentPath,
  type WorkItemDocumentRole,
} from "../core/work-item-source.ts";
import { resolveConfiguredProject } from "../shell/project.ts";
import {
  commitDocumentationPaths,
  inspectDocumentationGit,
  isDocumentationCommitVerificationFailure,
} from "../shell/repository.ts";
import {
  loadArtifactsForWorkItem,
  loadRunsForWorkItem,
} from "../shell/sqlite.ts";
import { activeRunStatuses } from "./run.ts";
import { type CoordinatorRuntime } from "./runtime.ts";
import { revalidateWorkItemSource } from "./work-item-source.ts";

const lifecycleRoles = ["R1", "R2", "DESIGN", "PLAN", "R3"] as const satisfies readonly WorkItemDocumentRole[];
const preSignoffStages = new Set([
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
  "AWAITING_SIGNOFF",
] as const);

type DocumentationGitFailure = TypeError & Readonly<{
  orderCode: "DOCUMENTATION_GIT_CONFLICT" | "COMMIT_VERIFICATION_FAILED";
}>;

const documentationGitFailure = (
  orderCode: DocumentationGitFailure["orderCode"],
  detail: string,
): DocumentationGitFailure =>
  Object.assign(new TypeError(detail), { orderCode });

export const isDocumentationGitFailure = (
  error: unknown,
): error is DocumentationGitFailure =>
  error instanceof TypeError &&
  "orderCode" in error &&
  (
    (error as { orderCode?: unknown }).orderCode === "DOCUMENTATION_GIT_CONFLICT" ||
    (error as { orderCode?: unknown }).orderCode === "COMMIT_VERIFICATION_FAILED"
  );

const governedPathSets = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<Readonly<{
  requiredPaths: readonly RepositoryPath[];
  optionalPaths: readonly RepositoryPath[];
  deletablePaths: readonly RepositoryPath[];
}>> => {
  const { workItem } = await revalidateWorkItemSource(runtime, workItemId);
  const project = await resolveConfiguredProject(
    runtime.config.repositoryRoots,
    workItem.projectId,
  );
  const artifacts = loadArtifactsForWorkItem(runtime.database, workItem.id);
  const requiredPaths: RepositoryPath[] = [workItem.sourcePath];
  const optionalPaths: RepositoryPath[] = [];

  for (const role of lifecycleRoles) {
    const path = workItemDocumentPath(
      project.manifest.workItems.root,
      workItem.id,
      role,
    );
    if (artifacts.some((artifact) =>
      artifact.role === role &&
      artifact.repositoryPath === path
    )) {
      requiredPaths.push(path);
    } else {
      optionalPaths.push(path);
    }
  }

  const archiveMarker = workItemArchiveMarkerPath(
    project.manifest.workItems.root,
    workItem.id,
  );
  optionalPaths.push(archiveMarker);
  return {
    requiredPaths: [...new Set(requiredPaths)].sort(),
    optionalPaths: [...new Set(optionalPaths)].sort(),
    deletablePaths: [archiveMarker],
  };
};

const blockersFor = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  stage: string,
  inspection: Awaited<ReturnType<typeof inspectDocumentationGit>>,
): readonly WorkItemDocumentationGitBlocker[] => {
  const blockers = new Set<WorkItemDocumentationGitBlocker>();
  if (!preSignoffStages.has(stage as typeof preSignoffStages extends Set<infer T> ? T : never)) {
    blockers.add("LIFECYCLE_INELIGIBLE");
  }
  if (
    loadRunsForWorkItem(runtime.database, workItemId)
      .some((run) => activeRunStatuses.has(run.status))
  ) {
    blockers.add("ACTIVE_RUN");
  }
  if (inspection.branch === null) blockers.add("DETACHED_HEAD");
  if (inspection.operationActive) blockers.add("GIT_OPERATION_ACTIVE");
  if (inspection.authorName === null || inspection.authorEmail === null) {
    blockers.add("MISSING_GIT_IDENTITY");
  }
  if (inspection.paths.some((path) => path.state === "MISSING")) {
    blockers.add("MISSING_DOCUMENT");
  }
  if (inspection.paths.some((path) => path.state === "IGNORED")) {
    blockers.add("IGNORED_DOCUMENT");
  }
  if (inspection.paths.some((path) => path.state === "UNMERGED")) {
    blockers.add("UNMERGED_DOCUMENT");
  }
  return [...blockers].sort();
};

export const workItemDocumentationGitStatus = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<WorkItemDocumentationGitStatus> => {
  const { workItem } = await revalidateWorkItemSource(runtime, workItemId);
  const paths = await governedPathSets(runtime, workItemId);
  const inspection = await inspectDocumentationGit(
    workItem.repositoryRoot,
    paths.requiredPaths,
    paths.optionalPaths,
    paths.deletablePaths,
  );
  return WorkItemDocumentationGitStatusSchema.parse({
    workItemId,
    headCommit: inspection.headCommit,
    branch: inspection.branch,
    authorName: inspection.authorName,
    authorEmail: inspection.authorEmail,
    blockers: blockersFor(runtime, workItemId, workItem.stage, inspection),
    paths: inspection.paths,
  });
};

const expectedChangedPaths = (
  status: WorkItemDocumentationGitStatus,
): readonly Readonly<{ repositoryPath: RepositoryPath; sha256: string | null }>[] =>
  status.paths
    .filter((path) =>
      path.state === "MODIFIED" ||
      path.state === "UNTRACKED" ||
      path.state === "DELETED"
    )
    .map((path) => ({
      repositoryPath: path.repositoryPath,
      sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
    }));

const sameExpectedPaths = (
  left: readonly Readonly<{ repositoryPath: RepositoryPath; sha256: string | null }>[],
  right: readonly Readonly<{ repositoryPath: RepositoryPath; sha256: string | null }>[],
): boolean =>
  left.length === right.length &&
  left.every((value, index) =>
    value.repositoryPath === right[index]?.repositoryPath &&
    value.sha256 === right[index]?.sha256
  );

export const commitWorkItemDocumentation = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  input: CommitWorkItemDocumentation,
): Promise<WorkItemDocumentationCommit> => {
  const command = CommitWorkItemDocumentationSchema.parse(input);
  const { workItem } = await revalidateWorkItemSource(runtime, workItemId);
  const paths = await governedPathSets(runtime, workItemId);
  const status = await workItemDocumentationGitStatus(runtime, workItemId);
  const expected = expectedChangedPaths(status);

  if (
    status.blockers.length > 0 ||
    status.headCommit !== command.expectedHeadCommit ||
    expected.length === 0 ||
    !sameExpectedPaths(expected, command.expectedPaths)
  ) {
    throw documentationGitFailure(
      "DOCUMENTATION_GIT_CONFLICT",
      `documentation Git preconditions are not current: ${status.blockers.join(", ") || "expected state changed"}`,
    );
  }

  try {
    return await commitDocumentationPaths(
      workItem.repositoryRoot,
      workItemId,
      paths.requiredPaths,
      paths.optionalPaths,
      paths.deletablePaths,
      command,
    );
  } catch (error) {
    if (isDocumentationCommitVerificationFailure(error)) {
      throw documentationGitFailure(
        "COMMIT_VERIFICATION_FAILED",
        error.message,
      );
    }
    throw documentationGitFailure(
      "DOCUMENTATION_GIT_CONFLICT",
      error instanceof Error ? error.message : String(error),
    );
  }
};
