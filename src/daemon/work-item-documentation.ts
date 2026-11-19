import {
  CommitWorkItemDocumentationSchema,
  WorkItemDocumentationCommitSchema,
  WorkItemDocumentationGitStatusSchema,
  type CommitWorkItemDocumentation,
  type RepositoryPath,
  type WorkItemDocumentationCommit,
  type WorkItemDocumentationExpectedPath,
  type WorkItemDocumentationGitBlocker,
  type WorkItemDocumentationGitStatus,
  type WorkItemId,
} from "../core/contracts.ts";
import { workItemArchiveMarkerPath } from "../core/work-item-source.ts";
import { resolveConfiguredProject } from "../shell/project.ts";
import {
  commitDocumentationPaths,
  inspectDocumentationGit,
} from "../shell/repository.ts";
import { loadRunsForWorkItem } from "../shell/sqlite.ts";
import {
  currentLifecycleArtifacts,
  getWorkItem,
} from "./authority.ts";
import type { CoordinatorRuntime } from "./runtime.ts";

const eligibleStages = new Set([
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
  "AWAITING_SIGNOFF",
]);

const uniqueSorted = <T extends string>(values: readonly T[]): readonly T[] =>
  [...new Set(values)].sort() as readonly T[];

const governedDocumentationPaths = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<Readonly<{
  repositoryRoot: string;
  paths: readonly RepositoryPath[];
  archiveMarkerPath: RepositoryPath;
}>> => {
  const workItem = getWorkItem(runtime, workItemId);
  const project = await resolveConfiguredProject(
    [workItem.repositoryRoot],
    workItem.projectId,
  );
  if (project.repositoryRoot !== workItem.repositoryRoot) {
    throw new TypeError("WorkItem repositoryRoot no longer matches configured project");
  }
  const lifecycle = await currentLifecycleArtifacts(runtime, workItemId);
  const archiveMarkerPath = workItemArchiveMarkerPath(
    project.manifest.workItems.root,
    workItem.id,
  );
  return {
    repositoryRoot: project.repositoryRoot,
    paths: uniqueSorted([
      workItem.sourcePath,
      ...lifecycle
        .filter((artifact) => artifact.repositoryPath.endsWith(".md"))
        .map((artifact) => artifact.repositoryPath),
    ]),
    archiveMarkerPath,
  };
};

export const documentationGitStatus = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<WorkItemDocumentationGitStatus> => {
  const workItem = getWorkItem(runtime, workItemId);
  const governed = await governedDocumentationPaths(runtime, workItemId);
  const candidatePaths = uniqueSorted([
    ...governed.paths,
    governed.archiveMarkerPath,
  ]);
  const inspected = await inspectDocumentationGit(
    governed.repositoryRoot,
    candidatePaths,
  );
  const paths = inspected.paths.filter((path) =>
    path.repositoryPath !== governed.archiveMarkerPath || path.state !== "MISSING"
  );

  const blockers: WorkItemDocumentationGitBlocker[] = [];
  if (!eligibleStages.has(workItem.stage)) blockers.push("LIFECYCLE_INELIGIBLE");
  if (
    loadRunsForWorkItem(runtime.database, workItem.id)
      .some((run) => run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
  ) {
    blockers.push("ACTIVE_RUN");
  }
  if (inspected.branch === null) blockers.push("DETACHED_HEAD");
  if (inspected.operationActive) blockers.push("GIT_OPERATION_ACTIVE");
  if (inspected.authorName === null || inspected.authorEmail === null) {
    blockers.push("MISSING_GIT_IDENTITY");
  }
  if (paths.some((path) => path.state === "MISSING")) blockers.push("MISSING_DOCUMENT");
  if (paths.some((path) => path.state === "IGNORED")) blockers.push("IGNORED_DOCUMENT");
  if (paths.some((path) => path.state === "UNMERGED")) blockers.push("UNMERGED_DOCUMENT");

  return WorkItemDocumentationGitStatusSchema.parse({
    workItemId: workItem.id,
    headCommit: inspected.headCommit,
    branch: inspected.branch,
    authorName: inspected.authorName,
    authorEmail: inspected.authorEmail,
    blockers: uniqueSorted(blockers),
    paths,
  });
};

const reviewedPaths = (
  status: WorkItemDocumentationGitStatus,
): readonly WorkItemDocumentationExpectedPath[] =>
  status.paths
    .filter((path) =>
      path.state === "MODIFIED" ||
      path.state === "UNTRACKED" ||
      path.state === "DELETED"
    )
    .map((path) => ({
      repositoryPath: path.repositoryPath,
      sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
    }))
    .sort((left, right) => left.repositoryPath.localeCompare(right.repositoryPath));

const expectedPathsMatch = (
  current: readonly WorkItemDocumentationExpectedPath[],
  expected: readonly WorkItemDocumentationExpectedPath[],
): boolean =>
  current.length === expected.length &&
  current.every((path, index) => {
    const other = expected[index];
    return other !== undefined &&
      other.repositoryPath === path.repositoryPath &&
      other.sha256 === path.sha256;
  });

export const commitWorkItemDocumentation = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  input: CommitWorkItemDocumentation,
): Promise<WorkItemDocumentationCommit> => {
  const command = CommitWorkItemDocumentationSchema.parse(input);
  const status = await documentationGitStatus(runtime, workItemId);
  if (status.blockers.length !== 0) {
    throw new TypeError(
      "documentation commit is blocked: " + status.blockers.join(","),
    );
  }
  if (status.headCommit !== command.expectedHeadCommit) {
    throw new TypeError("documentation commit HEAD changed");
  }

  const current = reviewedPaths(status);
  const expected = [...command.expectedPaths]
    .map((path) => ({ repositoryPath: path.repositoryPath, sha256: path.sha256 }))
    .sort((left, right) => left.repositoryPath.localeCompare(right.repositoryPath));

  if (!expectedPathsMatch(current, expected)) {
    throw new TypeError("documentation commit reviewed path set changed");
  }
  if (current.length === 0) {
    throw new TypeError("no governed documentation path requires a commit");
  }

  const workItem = getWorkItem(runtime, workItemId);
  const gitCommit = await commitDocumentationPaths(
    workItem.repositoryRoot,
    command.expectedHeadCommit,
    expected,
    `docs(order): save ${workItem.id} documentation`,
  );
  return WorkItemDocumentationCommitSchema.parse({
    workItemId: workItem.id,
    gitCommit,
    repositoryPaths: expected.map((path) => path.repositoryPath),
  });
};
