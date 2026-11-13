import {
  ArtifactRefSchema,
  CreateWorkItemSourceSchema,
  ExpectedHashMarkdownWriteSchema,
  ExpectedHashWriteResultSchema,
  SetWorkItemArchivedSchema,
  UpdateWorkItemTitleSchema,
  WorkItemSchema,
  WorkItemSourceDiagnosticSchema,
  WorkItemSourceSnapshotSchema,
  WorkItemSourceReconciliationSchema,
  type CreateWorkItemSource,
  type ExpectedHashMarkdownWrite,
  type ExpectedHashWriteResult,
  type ProjectId,
  type SetWorkItemArchived,
  type UpdateWorkItemTitle,
  type WorkItem,
  type WorkItemId,
  type WorkItemSourceDiagnostic,
  type WorkItemSourceReconciliation,
  type WorkItemSourceSnapshot,
} from "../core/contracts.ts";
import {
  classifyExistingWorkItemSource,
  duplicateWorkItemSourceIds,
  isUnsupportedWorkItemSchemaFailure,
  linkedRemediationIsAllowed,
  parseWorkItemSourceMarkdown,
  renderWorkItemSourceMarkdown,
  rewriteWorkItemSourceTitle,
  workItemDocumentPath,
  unresolvedConcernIdsForProject,
  type WorkItemSourceDisposition,
} from "../core/work-item-source.ts";
import { sourceChangeLifecycleState } from "../core/lifecycle.ts";
import {
  loadConfiguredProjects,
  resolveConfiguredProject,
  type ConfiguredProject,
} from "../shell/project.ts";
import {
  createWorkItemSourceFile,
  isWorkItemRootAccessFailure,
  readWorkItemArchived,
  readWorkItemSource,
  replaceWorkItemSourceFile,
  scanWorkItemSources,
  setWorkItemArchivedFile,
  type ParsedWorkItemSource,
} from "../shell/work-item-source.ts";
import { readCommittedFile, readWorkingTreeFile, resolveHeadCommit } from "../shell/repository.ts";
import { newArtifactRefId, newWorkItemId, nowIsoDateTime, sha256 } from "../shell/runtime.ts";
import {
  blockExecutionTasksForApproval,
  findArtifactSnapshot,
  loadCurrentApprovalForWorkItem,
  loadRunsForWorkItem,
  loadWorkItem,
  loadWorkItems,
  storeArtifact,
  storeWorkItem,
  updateWorkItemArchivedProjection,
  updateWorkItemSourceProjection,
  withTransaction,
} from "../shell/sqlite.ts";
import { type CoordinatorRuntime } from "./runtime.ts";

const SOURCE_BOUNDARY_FAILURE = "WORK_ITEM_SOURCE_BOUNDARY";

type SourceBoundaryFailure = TypeError & Readonly<{
  orderCode: typeof SOURCE_BOUNDARY_FAILURE;
  sourceDiagnostic: WorkItemSourceDiagnostic;
}>;

const sourceBoundaryFailure = (
  sourceDiagnostic: WorkItemSourceDiagnostic,
): SourceBoundaryFailure =>
  Object.assign(new TypeError(sourceDiagnostic.detail), {
    orderCode: SOURCE_BOUNDARY_FAILURE as typeof SOURCE_BOUNDARY_FAILURE,
    sourceDiagnostic: WorkItemSourceDiagnosticSchema.parse(sourceDiagnostic),
  });

const operationalSourceReadFailure = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  return typeof error.code === "string" &&
    ["EACCES", "EPERM", "EIO", "EMFILE", "ENFILE"].includes(error.code);
};

export const isSourceBoundaryFailure = (
  error: unknown,
): error is SourceBoundaryFailure =>
  error instanceof TypeError &&
  "orderCode" in error &&
  (error as { orderCode?: unknown }).orderCode === SOURCE_BOUNDARY_FAILURE &&
  "sourceDiagnostic" in error;

export const sourceDiagnosticForFailure = (
  error: unknown,
): WorkItemSourceDiagnostic | null =>
  isSourceBoundaryFailure(error)
    ? WorkItemSourceDiagnosticSchema.parse(error.sourceDiagnostic)
    : null;

type QueuePlan = Readonly<{
  disposition: "REGISTERED" | WorkItemSourceDisposition;
  source: ParsedWorkItemSource;
  workItem: WorkItem;
}>;

const diagnostic = (
  projectId: ProjectId,
  source: ParsedWorkItemSource | null,
  code: WorkItemSourceDiagnostic["code"],
  detail: string,
  workItemId: WorkItemId | null = source?.metadata.id ?? null,
): WorkItemSourceDiagnostic =>
  WorkItemSourceDiagnosticSchema.parse({
    projectId,
    path: source?.path ?? null,
    workItemId,
    code,
    detail,
  });

const resolveSourceProject = async (
  runtime: CoordinatorRuntime,
  source: ParsedWorkItemSource,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<ConfiguredProject> => {
  const matches: ConfiguredProject[] = [];
  for (const repositoryRoot of repositoryRoots) {
    try {
      matches.push(await resolveConfiguredProject(
        [repositoryRoot],
        source.metadata.projectId,
      ));
    } catch {
      // A source reclassification depends only on the uniquely matching
      // healthy configured project; unrelated unavailable/invalid roots
      // remain Settings attention rather than becoming a hidden blocker.
    }
  }
  if (matches.length !== 1) {
    throw new TypeError(
      matches.length === 0
        ? `unresolved configured projectId: ${source.metadata.projectId}`
        : `configured projectId is not unique: ${source.metadata.projectId}`,
    );
  }
  return matches[0]!;
};

const requireResolvedConcerns = (
  project: ConfiguredProject,
  concernIds: readonly WorkItem["concernIds"][number][],
): void => {
  const unresolved = unresolvedConcernIdsForProject(concernIds, project.manifest);
  if (unresolved[0] !== undefined) {
    throw new TypeError(`unresolved concern id: ${unresolved[0]}`);
  }
};

const planExistingSource = (
  runtime: CoordinatorRuntime,
  existing: WorkItem,
  source: ParsedWorkItemSource,
  project: ConfiguredProject,
  archived: boolean,
): Readonly<{ plan: QueuePlan | null; diagnostic: WorkItemSourceDiagnostic | null }> => {
  const classification = classifyExistingWorkItemSource(
    existing,
    source,
    loadRunsForWorkItem(runtime.database, existing.id).some((run) => run.role === "STAGE"),
  );
  if (classification.tag === "REJECT") {
    return {
      plan: null,
      diagnostic: diagnostic(project.manifest.projectId, source, classification.code, classification.detail),
    };
  }

  const disposition = classification.disposition;
  const lifecycle = disposition === "UPDATED"
    ? sourceChangeLifecycleState(existing)
    : { stage: existing.stage, status: existing.status, outcome: existing.outcome };

  return {
    diagnostic: null,
    plan: {
      disposition,
      source,
      workItem: WorkItemSchema.parse({
        ...existing,
        projectId: source.metadata.projectId,
        repositoryRoot: project.repositoryRoot,
        title: source.title,
        schemaId: source.metadata.schemaId,
        sourcePath: source.path,
        sourceSha256: source.sha256,
        derivedFromWorkItemId: source.metadata.derivedFromWorkItemId ?? null,
        concernIds: source.metadata.concernIds,
        archived,
        ...lifecycle,
      }),
    },
  };
};

const lifecycleDrafts = [
  ["R1", "P1"],
  ["R2", "P3"],
  ["DESIGN", "P6"],
  ["PLAN", "P7"],
  ["R3", "P7"],
] as const;

const materializeLifecycleDrafts = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  project: ConfiguredProject,
): Promise<void> => {
  const head = await resolveHeadCommit(project.repositoryRoot);
  for (const [role, authorityLayer] of lifecycleDrafts) {
    const repositoryPath = workItemDocumentPath(
      project.manifest.workItems.root,
      workItem.id,
      role,
    );
    let bytes: Uint8Array;
    try {
      bytes = readWorkingTreeFile(project.repositoryRoot, repositoryPath);
    } catch {
      continue;
    }
    const digest = sha256(bytes);
    let gitCommit: typeof head | null = null;
    try {
      const committed = await readCommittedFile(project.repositoryRoot, head, repositoryPath);
      if (sha256(committed) === digest) gitCommit = head;
    } catch {
      gitCommit = null;
    }
    const candidate = {
      workItemId: workItem.id,
      repositoryPath,
      role,
      authorityLayer,
      sha256: digest,
      gitCommit,
    } as const;
    if (findArtifactSnapshot(runtime.database, candidate) !== null) continue;
    storeArtifact(runtime.database, ArtifactRefSchema.parse({
      id: newArtifactRefId(),
      ...candidate,
    }));
  }
};

const inspectQueue = async (
  runtime: CoordinatorRuntime,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<Readonly<{
  plans: readonly QueuePlan[];
  diagnostics: readonly WorkItemSourceDiagnostic[];
  projects: ReadonlyMap<ProjectId, ConfiguredProject>;
}>> => {
  const configuredProjects = await loadConfiguredProjects(repositoryRoots);
  const projects = new Map(
    configuredProjects.map((project) => [project.manifest.projectId, project] as const),
  );
  const scannedEntries: Array<Readonly<{
    source: ParsedWorkItemSource;
    project: ConfiguredProject;
  }>> = [];
  const diagnostics: WorkItemSourceDiagnostic[] = [];

  for (const project of configuredProjects) {
    const scanned = scanWorkItemSources(
      project.repositoryRoot,
      project.manifest.projectId,
      project.manifest.workItems.root,
    );
    diagnostics.push(...scanned.diagnostics);
    scannedEntries.push(...scanned.sources.map((source) => ({ source, project })));
  }

  const existing = new Map(loadWorkItems(runtime.database).map((item) => [item.id, item] as const));
  const duplicateIds = new Set(
    duplicateWorkItemSourceIds(scannedEntries.map((entry) => entry.source)),
  );
  const seen = new Set<WorkItemId>();
  const plans: QueuePlan[] = [];

  for (const { source, project } of scannedEntries) {
    seen.add(source.metadata.id);
    if (duplicateIds.has(source.metadata.id)) {
      diagnostics.push(diagnostic(
        project.manifest.projectId,
        source,
        "DUPLICATE_WORK_ITEM_ID",
        `duplicate WorkItem id: ${source.metadata.id}`,
      ));
      continue;
    }
    if (source.metadata.projectId !== project.manifest.projectId) {
      diagnostics.push(diagnostic(
        project.manifest.projectId,
        source,
        "UNRESOLVED_PROJECT",
        "WorkItem source projectId does not match the repository project",
      ));
      continue;
    }

    const unresolvedConcerns = unresolvedConcernIdsForProject(
      source.metadata.concernIds,
      project.manifest,
    );
    if (unresolvedConcerns[0] !== undefined) {
      diagnostics.push(diagnostic(
        project.manifest.projectId,
        source,
        "UNRESOLVED_CONCERN",
        `unresolved concern id: ${unresolvedConcerns[0]}`,
      ));
      continue;
    }

    let archived: boolean;
    try {
      archived = readWorkItemArchived(
        project.repositoryRoot,
        project.manifest.workItems.root,
        source.metadata.id,
      );
    } catch (error) {
      diagnostics.push(diagnostic(
        project.manifest.projectId,
        source,
        "INVALID_SOURCE",
        error instanceof Error ? error.message : String(error),
      ));
      continue;
    }

    const prior = existing.get(source.metadata.id);
    if (prior === undefined) {
      plans.push({
        disposition: "REGISTERED",
        source,
        workItem: WorkItemSchema.parse({
          id: source.metadata.id,
          projectId: source.metadata.projectId,
          repositoryRoot: project.repositoryRoot,
          title: source.title,
          origin: "DISCOVERED",
          schemaId: source.metadata.schemaId,
          sourcePath: source.path,
          sourceSha256: source.sha256,
          derivedFromWorkItemId: source.metadata.derivedFromWorkItemId ?? null,
          stage: "IDEA",
          status: "ACTIVE",
          outcome: null,
          concernIds: source.metadata.concernIds,
          archived,
          createdAt: nowIsoDateTime(),
        }),
      });
      continue;
    }

    const planned = planExistingSource(runtime, prior, source, project, archived);
    if (planned.diagnostic !== null) {
      diagnostics.push(WorkItemSourceDiagnosticSchema.parse({
        ...planned.diagnostic,
        projectId: project.manifest.projectId,
      }));
    }
    if (planned.plan !== null) plans.push(planned.plan);
  }

  for (const workItem of existing.values()) {
    if (seen.has(workItem.id)) continue;
    diagnostics.push(diagnostic(
      workItem.projectId,
      null,
      workItem.stage === "COMPLETE" ? "COMPLETED_SOURCE_MISSING" : "MISSING_SOURCE",
      `source is missing for WorkItem ${workItem.id}`,
      workItem.id,
    ));
  }

  return { plans, diagnostics, projects };
};

const applyPlan = (
  runtime: CoordinatorRuntime,
  plan: QueuePlan,
): void => {
  if (plan.disposition === "REGISTERED") {
    storeWorkItem(runtime.database, plan.workItem);
    return;
  }
  updateWorkItemSourceProjection(runtime.database, plan.workItem);
  if (plan.disposition === "UPDATED") {
    const approval = loadCurrentApprovalForWorkItem(runtime.database, plan.workItem.id);
    if (approval !== null) {
      blockExecutionTasksForApproval(runtime.database, approval.id);
    }
  }
};

export const workItemSourceDiagnostics = async (
  runtime: CoordinatorRuntime,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<readonly WorkItemSourceDiagnostic[]> =>
  (await inspectQueue(runtime, repositoryRoots)).diagnostics;

export const reconcileWorkItemSources = async (
  runtime: CoordinatorRuntime,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<WorkItemSourceReconciliation> => {
  const inspected = await inspectQueue(runtime, repositoryRoots);
  withTransaction(runtime.database, () => {
    for (const plan of inspected.plans) applyPlan(runtime, plan);
  });
  for (const plan of inspected.plans) {
    const project = inspected.projects.get(plan.workItem.projectId);
    if (project !== undefined) {
      await materializeLifecycleDrafts(runtime, plan.workItem, project);
    }
  }
  const byDisposition = (
    disposition: "REGISTERED" | WorkItemSourceDisposition,
  ): readonly WorkItemId[] =>
    inspected.plans
      .filter((plan) => plan.disposition === disposition)
      .map((plan) => plan.workItem.id)
      .sort();
  return WorkItemSourceReconciliationSchema.parse({
    registered: byDisposition("REGISTERED"),
    updated: byDisposition("UPDATED"),
    unchanged: byDisposition("UNCHANGED"),
    diagnostics: inspected.diagnostics,
  });
};

export const revalidateWorkItemSource = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<Readonly<{ workItem: WorkItem; source: WorkItemSourceSnapshot }>> => {
  const before = loadWorkItem(runtime.database, workItemId);
  const projectForPath = await resolveConfiguredProject(
    [before.repositoryRoot],
    before.projectId,
  );
  const expectedPath = workItemDocumentPath(
    projectForPath.manifest.workItems.root,
    before.id,
    "SOURCE",
  );
  if (before.sourcePath !== expectedPath) {
    throw sourceBoundaryFailure(WorkItemSourceDiagnosticSchema.parse({
      projectId: before.projectId,
      path: before.sourcePath,
      workItemId: before.id,
      code: "INVALID_SOURCE",
      detail: "persisted WorkItem source path is not deterministic",
    }));
  }

  let current: ParsedWorkItemSource;
  try {
    current = readWorkItemSource(projectForPath.repositoryRoot, expectedPath);
  } catch (error) {
    if (isWorkItemRootAccessFailure(error)) throw error;
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : null;
    if (errorCode === "ENOENT") {
      throw sourceBoundaryFailure(diagnostic(
        before.projectId,
        null,
        before.stage === "COMPLETE" ? "COMPLETED_SOURCE_MISSING" : "MISSING_SOURCE",
        `source is missing for WorkItem ${before.id}`,
        before.id,
      ));
    }
    if (operationalSourceReadFailure(error)) throw error;
    throw sourceBoundaryFailure(WorkItemSourceDiagnosticSchema.parse({
      projectId: before.projectId,
      path: expectedPath,
      workItemId: before.id,
      code: isUnsupportedWorkItemSchemaFailure(error)
        ? "UNSUPPORTED_SCHEMA"
        : "INVALID_SOURCE",
      detail: error instanceof Error ? error.message : String(error),
    }));
  }

  let project: ConfiguredProject;
  try {
    project = await resolveSourceProject(runtime, current);
  } catch (error) {
    throw sourceBoundaryFailure(diagnostic(
      before.projectId,
      current,
      "UNRESOLVED_PROJECT",
      error instanceof Error ? error.message : String(error),
      before.id,
    ));
  }

  const unresolvedConcerns = unresolvedConcernIdsForProject(
    current.metadata.concernIds,
    project.manifest,
  );
  if (unresolvedConcerns[0] !== undefined) {
    throw sourceBoundaryFailure(diagnostic(
      project.manifest.projectId,
      current,
      "UNRESOLVED_CONCERN",
      `unresolved concern id: ${unresolvedConcerns[0]}`,
      before.id,
    ));
  }

  let archived: boolean;
  try {
    archived = readWorkItemArchived(
      project.repositoryRoot,
      project.manifest.workItems.root,
      before.id,
    );
  } catch (error) {
    throw sourceBoundaryFailure(diagnostic(
      project.manifest.projectId,
      current,
      "INVALID_SOURCE",
      error instanceof Error ? error.message : String(error),
      before.id,
    ));
  }

  const planned = planExistingSource(runtime, before, current, project, archived);
  if (planned.diagnostic !== null) {
    throw sourceBoundaryFailure(planned.diagnostic);
  }
  const plan = planned.plan;
  if (plan === null) {
    throw sourceBoundaryFailure(diagnostic(
      project.manifest.projectId,
      current,
      "INVALID_SOURCE",
      "WorkItem source revalidation produced no valid source plan",
      before.id,
    ));
  }

  withTransaction(runtime.database, () => applyPlan(runtime, plan));
  return {
    workItem: loadWorkItem(runtime.database, workItemId),
    source: WorkItemSourceSnapshotSchema.parse({
      path: current.path,
      sha256: current.sha256,
      metadata: current.metadata,
      markdown: current.markdown,
    }),
  };
};

export const currentWorkItemSource = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<WorkItemSourceSnapshot> => {
  const source = (await revalidateWorkItemSource(runtime, workItemId)).source;
  return WorkItemSourceSnapshotSchema.parse({
    path: source.path,
    sha256: source.sha256,
    metadata: source.metadata,
    markdown: source.markdown,
  });
};

export const createWorkItemFromSource = async (
  runtime: CoordinatorRuntime,
  input: CreateWorkItemSource,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<WorkItem> => {
  const command = CreateWorkItemSourceSchema.parse(input);
  const project = await resolveConfiguredProject(repositoryRoots, command.projectId);
  requireResolvedConcerns(project, command.concernIds);

  const parentId = command.derivedFromWorkItemId ?? null;
  if (parentId !== null) {
    const parent = loadWorkItem(runtime.database, parentId);
    if (!linkedRemediationIsAllowed(parent, command.projectId, command.schemaId)) {
      throw new TypeError(
        "derived remediation requires a completed same-project investigation/audit parent and CHANGE/DEFECT child",
      );
    }
  }

  const id = newWorkItemId();
  const metadata = {
    formatVersion: 1 as const,
    id,
    projectId: command.projectId,
    concernIds: [...command.concernIds].sort(),
    schemaId: command.schemaId,
    ...(parentId === null ? {} : { derivedFromWorkItemId: parentId }),
  };
  const markdown = renderWorkItemSourceMarkdown(metadata, command.title);
  const created = createWorkItemSourceFile(
    project.repositoryRoot,
    project.manifest.workItems.root,
    id,
    markdown,
  );
  const source = readWorkItemSource(project.repositoryRoot, created.path);
  const value = WorkItemSchema.parse({
    id,
    projectId: command.projectId,
    repositoryRoot: project.repositoryRoot,
    title: source.title,
    origin: "CREATED",
    schemaId: command.schemaId,
    sourcePath: source.path,
    sourceSha256: source.sha256,
    derivedFromWorkItemId: parentId,
    stage: "IDEA",
    status: "ACTIVE",
    outcome: null,
    concernIds: source.metadata.concernIds,
    archived: false,
    createdAt: nowIsoDateTime(),
  });
  storeWorkItem(runtime.database, value);
  return value;
};

export const saveWorkItemSource = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  input: ExpectedHashMarkdownWrite,
): Promise<ExpectedHashWriteResult> => {
  const command = ExpectedHashMarkdownWriteSchema.parse(input);
  const validated = await revalidateWorkItemSource(runtime, workItemId);
  const existing = validated.workItem;
  if (existing.stage === "EXECUTION" || existing.stage === "COMPLETE") {
    throw new TypeError("WorkItem source is read-only in EXECUTION/COMPLETE");
  }
  if (command.expectedSha256 !== existing.sourceSha256) {
    return ExpectedHashWriteResultSchema.parse({
      tag: "STALE",
      currentSha256: existing.sourceSha256,
    });
  }

  const proposedHash = sha256(new TextEncoder().encode(command.markdown));
  const proposed = parseWorkItemSourceMarkdown(
    existing.sourcePath,
    proposedHash,
    command.markdown,
  );
  const project = await resolveSourceProject(runtime, proposed);
  requireResolvedConcerns(project, proposed.metadata.concernIds);
  const classification = classifyExistingWorkItemSource(
    existing,
    proposed,
    loadRunsForWorkItem(runtime.database, existing.id).some((run) => run.role === "STAGE"),
  );
  if (classification.tag === "REJECT") {
    throw new TypeError(classification.detail);
  }

  const result = replaceWorkItemSourceFile(
    existing.repositoryRoot,
    existing.sourcePath,
    command.expectedSha256,
    command.markdown,
  );
  if (result.tag === "STALE") return result;

  const source = readWorkItemSource(existing.repositoryRoot, existing.sourcePath);
  const lifecycle = classification.disposition === "UPDATED"
    ? sourceChangeLifecycleState(existing)
    : { stage: existing.stage, status: existing.status, outcome: existing.outcome };
  const next = WorkItemSchema.parse({
    ...existing,
    projectId: source.metadata.projectId,
    repositoryRoot: project.repositoryRoot,
    title: source.title,
    schemaId: source.metadata.schemaId,
    sourceSha256: source.sha256,
    derivedFromWorkItemId: source.metadata.derivedFromWorkItemId ?? null,
    concernIds: source.metadata.concernIds,
    ...lifecycle,
  });
  updateWorkItemSourceProjection(runtime.database, next);
  return result;
};

export const updateWorkItemTitle = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  input: UpdateWorkItemTitle,
): Promise<ExpectedHashWriteResult> => {
  const command = UpdateWorkItemTitleSchema.parse(input);
  const validated = await revalidateWorkItemSource(runtime, workItemId);
  if (
    validated.workItem.stage === "EXECUTION" ||
    validated.workItem.stage === "COMPLETE"
  ) {
    throw new TypeError("WorkItem title is read-only in EXECUTION/COMPLETE");
  }
  if (validated.workItem.sourceSha256 !== command.expectedSourceSha256) {
    return ExpectedHashWriteResultSchema.parse({
      tag: "STALE",
      currentSha256: validated.workItem.sourceSha256,
    });
  }
  const markdown = rewriteWorkItemSourceTitle(
    validated.source.markdown,
    command.title,
  );
  return saveWorkItemSource(runtime, workItemId, {
    expectedSha256: command.expectedSourceSha256,
    markdown,
  });
};

export const setWorkItemArchived = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  input: SetWorkItemArchived,
): Promise<WorkItem> => {
  const command = SetWorkItemArchivedSchema.parse(input);
  const validated = await revalidateWorkItemSource(runtime, workItemId);
  const workItem = validated.workItem;
  if (workItem.archived !== command.expectedArchived) {
    throw new TypeError("WorkItem archive state changed");
  }
  if (command.archived === command.expectedArchived) {
    throw new TypeError("WorkItem archive command must change archive state");
  }
  if (workItem.stage === "EXECUTION") {
    throw new TypeError("WorkItem may not be archived or restored during EXECUTION");
  }
  if (
    loadRunsForWorkItem(runtime.database, workItem.id)
      .some((run) => run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
  ) {
    throw new TypeError("WorkItem archive state may not change while a Run is active");
  }
  const project = await resolveConfiguredProject(
    [workItem.repositoryRoot],
    workItem.projectId,
  );
  setWorkItemArchivedFile(
    project.repositoryRoot,
    project.manifest.workItems.root,
    workItem.id,
    command.archived,
  );
  return updateWorkItemArchivedProjection(
    runtime.database,
    workItem.id,
    command.archived,
  );
};
