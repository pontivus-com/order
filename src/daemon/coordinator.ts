import {
  type Approval,
  type ArtifactRef,
  ArtifactRefSchema,
  ExpectedHashMarkdownWriteSchema,
  ExpectedHashWriteResultSchema,
  type ExpectedHashMarkdownWrite,
  type ExpectedHashWriteResult,
  type ArtifactRefId,
  type ExecutionTaskId,
  type Run,
  type RunId,
  type WorkItem,
  type WorkItemId,
  WorkItemSchema,
} from "../core/contracts.ts";
import {
  executionResumeIsAllowed,
} from "../core/execution.ts";
import {
  artifactDirectEditIsAllowed,
  artifactReturnOwner,
} from "../core/lifecycle.ts";
import { workItemSchemaCatalog } from "../core/work-item-source.ts";
import {
  repositoryRootIsAllowed,
} from "../core/governance.ts";
import {
  loadConfiguredProjects,
} from "../shell/project.ts";
import {
  readCommittedFile,
  readWorkingTreeFile,
  replaceWorkingTreeMarkdown,
} from "../shell/repository.ts";
import {
  newArtifactRefId,
  nowIsoDateTime,
  sha256,
} from "../shell/runtime.ts";
import {
  loadRunningRuns,
  loadWorkItems,
  setWorkItemStatus,
  storeArtifact,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import { createCoordinatorRuntime, type CoordinatorRuntime } from "./runtime.ts";
import {
  getRun,
  listRunEvents,
  listRuns,
  readReferencedEvidence,
  stopActiveProvider,
  updateRun,
} from "./run.ts";
import {
  canonicalTasksForApproval,
  currentApprovalForWorkItem,
  currentLifecycleArtifacts,
  currentMaterialFresh,
  getArtifact,
  getWorkItem,
  listArtifacts,
  listExecutionTasks,
  signoffPackageForWorkItem,
  signOffWorkItem,
} from "./authority.ts";
import {
  adoptArtifactProposal,
  reconcilePendingArtifactProposals,
  rejectArtifactProposal,
  startStageRun,
  submitRunInput,
} from "./stage.ts";
import {
  activeExecutionRun,
  continuationForRunningTask,
  currentRunningTask,
  executePostSignoffRun,
  markTaskState,
  reconcileInterruptedCandidate,
  setWorkItemExecutionBlocked,
  startEligibleTask,
} from "./execution.ts";
import {
  commitWorkItemDocumentation,
  documentationGitStatus,
} from "./work-item-documentation.ts";
import {
  createWorkItemFromSource,
  currentWorkItemSource,
  reconcileWorkItemSources,
  revalidateWorkItemSource,
  saveWorkItemSource,
  saveWorkItemSourceBody,
  sourceDiagnosticForFailure as sourceDiagnosticForSourceFailure,
  setWorkItemArchived,
  updateWorkItemTitle,
  workItemSourceDiagnostics,
} from "./work-item-source.ts";

export const listWorkItems = (
  runtime: CoordinatorRuntime,
  includeArchived = false,
): readonly WorkItem[] =>
  loadWorkItems(runtime.database)
    .filter((workItem) => includeArchived || !workItem.archived);

export const createWorkItem = createWorkItemFromSource;

export const sourceDiagnosticForFailure = sourceDiagnosticForSourceFailure;

export const listWorkItemSchemas = () => workItemSchemaCatalog;

export const listProjects = async (
  runtime: CoordinatorRuntime,
) => (await loadConfiguredProjects(runtime.config.repositoryRoots))
  .map((project) => project.manifest);

export const listCurrentLifecycleArtifacts = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<readonly ArtifactRef[]> =>
  currentLifecycleArtifacts(runtime, workItemId);

export const getWorkItemSource = currentWorkItemSource;
export const getWorkItemSourceDiagnostics = workItemSourceDiagnostics;
export const reconcileSources = reconcileWorkItemSources;
export const saveSource = saveWorkItemSource;
export const saveSourceBody = saveWorkItemSourceBody;
export const updateTitle = updateWorkItemTitle;
export const setArchived = setWorkItemArchived;
export const getDocumentationGitStatus = documentationGitStatus;
export const commitDocumentation = commitWorkItemDocumentation;

export type TickResult = Readonly<{
  result: "NO_WORK" | "STARTED";
  executionTaskId: ExecutionTaskId | null;
  runId: RunId | null;
}>;

export const runCoordinatorTick = async (
  runtime: CoordinatorRuntime,
): Promise<TickResult> => {
  if (runtime.tickActive) throw new TypeError("TICK_ALREADY_ACTIVE");
  runtime.tickActive = true;
  let startedTaskId: ExecutionTaskId | null = null;
  let firstRunId: RunId | null = null;

  try {
    await reconcilePendingArtifactProposals(runtime);
    let current = await currentRunningTask(runtime);
    if (current === null) {
      const started = await startEligibleTask(runtime);
      if (started === null) {
        return { result: "NO_WORK", executionTaskId: null, runId: null };
      }
      current = {
        workItem: started.workItem,
        approval: started.approval,
        task: started.task,
      };
      startedTaskId = started.task.id;
      firstRunId = started.run.id;
      await executePostSignoffRun(
        runtime,
        started.run,
        started.task,
        started.approval,
      );
    } else {
      startedTaskId = current.task.id;
    }

    while (true) {
      const refreshed = await currentRunningTask(runtime);
      if (refreshed === null || refreshed.task.id !== startedTaskId) break;
      const active = activeExecutionRun(runtime, refreshed.task.id);
      if (active !== null) {
        if (active.id !== firstRunId) firstRunId ??= active.id;
        await executePostSignoffRun(
          runtime,
          active,
          refreshed.task,
          refreshed.approval,
        );
        continue;
      }
      const continuation = await continuationForRunningTask(
        runtime,
        refreshed.workItem,
        refreshed.task,
        refreshed.approval,
      );
      if (continuation === null) break;
      firstRunId ??= continuation.id;
      await executePostSignoffRun(
        runtime,
        continuation,
        refreshed.task,
        refreshed.approval,
      );
    }

    return firstRunId === null
      ? { result: "NO_WORK", executionTaskId: null, runId: null }
      : { result: "STARTED", executionTaskId: startedTaskId, runId: firstRunId };
  } finally {
    runtime.tickActive = false;
  }
};

export const recoverInterruptedRuns = async (
  runtime: CoordinatorRuntime,
): Promise<void> => {
  const running = loadRunningRuns(runtime.database);
  for (const run of running) {
    if (await reconcileInterruptedCandidate(runtime, run)) continue;
    withTransaction(runtime.database, () => {
      updateRun(runtime, run.id, {
        status: "FAILED",
        terminalClassification: "COORDINATOR_INTERRUPTED",
        endedAt: nowIsoDateTime(),
        providerSessionId: null,
      });
    });
  }
};

export const cancelRun = async (
  runtime: CoordinatorRuntime,
  runId: RunId,
): Promise<Run> => {
  const run = getRun(runtime, runId);
  if (run.status !== "RUNNING" && run.status !== "WAITING_FOR_INPUT") {
    throw new TypeError("Run is not cancellable");
  }
  const active = runtime.activeProviders.get(run.id);
  if (active !== undefined) {
    await active.server.client.session
      .interrupt({ sessionID: active.sessionId, resume: false })
      .catch(() => undefined);
    await stopActiveProvider(runtime, run.id);
  }

  return withTransaction(runtime.database, () => {
    const cancelled = updateRun(runtime, run.id, {
      status: "CANCELLED",
      endedAt: nowIsoDateTime(),
      providerSessionId: null,
    });
    if (run.executionTaskId !== null) {
      markTaskState(runtime, run.executionTaskId, "BLOCKED");
      setWorkItemExecutionBlocked(runtime, run.workItemId);
    }
    return cancelled;
  });
};

export const resumeWorkItem = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<WorkItem> => {
  const stored = getWorkItem(runtime, workItemId);
  const workItem = stored.stage === "EXECUTION"
    ? stored
    : (await revalidateWorkItemSource(runtime, workItemId)).workItem;
  if (workItem.status !== "BLOCKED") {
    throw new TypeError("WorkItem is not blocked");
  }

  if (workItem.stage !== "EXECUTION") {
    setWorkItemStatus(runtime.database, workItem.id, "ACTIVE");
    return getWorkItem(runtime, workItem.id);
  }

  const approval = currentApprovalForWorkItem(runtime, workItem.id);
  if (approval === null) throw new TypeError("blocked execution has no Approval");
  const tasks = await canonicalTasksForApproval(runtime, approval);
  const blocked = tasks.filter((task) => task.state === "BLOCKED");
  if (blocked.length !== 1) {
    throw new TypeError("execution resume requires exactly one blocked task");
  }
  const task = blocked[0];
  if (task === undefined) throw new TypeError("blocked execution task is missing");
  const current = await currentMaterialFresh(runtime, approval);
  if (!executionResumeIsAllowed({
    workItemStatus: workItem.status,
    taskState: task.state,
    approvalCurrent: current,
    blockerResolved: true,
  })) {
    throw new TypeError("execution resume preconditions are not satisfied");
  }

  withTransaction(runtime.database, () => {
    markTaskState(runtime, task.id, "TODO");
    setWorkItemStatus(runtime.database, workItem.id, "ACTIVE");
  });
  return getWorkItem(runtime, workItem.id);
};

export const schedulerIntervalMillis = 3_600_000;

export const armScheduler = (
  runtime: CoordinatorRuntime,
): void => {
  if (runtime.schedulerStopped || runtime.schedulerTimer !== null) return;
  runtime.schedulerTimer = setTimeout(() => {
    runtime.schedulerTimer = null;
    if (runtime.schedulerStopped) return;
    const run = runtime.tickActive
      ? Promise.resolve()
      : runCoordinatorTick(runtime).then(() => undefined, () => undefined);
    void run.finally(() => armScheduler(runtime));
  }, schedulerIntervalMillis);
};

export const startCoordinatorScheduler = async (
  runtime: CoordinatorRuntime,
): Promise<void> => {
  runtime.schedulerStopped = false;
  await recoverInterruptedRuns(runtime);
  await runCoordinatorTick(runtime);
  armScheduler(runtime);
};

export const stopCoordinatorScheduler = async (
  runtime: CoordinatorRuntime,
): Promise<void> => {
  runtime.schedulerStopped = true;
  if (runtime.schedulerTimer !== null) {
    clearTimeout(runtime.schedulerTimer);
    runtime.schedulerTimer = null;
  }
  for (const runId of [...runtime.activeProviders.keys()]) {
    await stopActiveProvider(runtime, runId);
  }
};

export const readArtifactContent = async (
  runtime: CoordinatorRuntime,
  artifactRefId: ArtifactRefId,
): Promise<Uint8Array> => {
  const artifact = getArtifact(runtime, artifactRefId);
  const workItem = getWorkItem(runtime, artifact.workItemId);
  if (artifact.gitCommit !== null) {
    const bytes = await readCommittedFile(
      workItem.repositoryRoot,
      artifact.gitCommit,
      artifact.repositoryPath,
    );
    if (sha256(bytes) !== artifact.sha256) {
      throw new TypeError("ArtifactRef committed bytes no longer match");
    }
    return bytes;
  }
  const bytes = readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath);
  if (sha256(bytes) !== artifact.sha256) {
    throw new TypeError("ArtifactRef working-tree bytes no longer match");
  }
  return bytes;
};

export const saveArtifactContent = async (
  runtime: CoordinatorRuntime,
  artifactRefId: ArtifactRefId,
  input: ExpectedHashMarkdownWrite,
): Promise<ExpectedHashWriteResult> => {
  const command = ExpectedHashMarkdownWriteSchema.parse(input);
  const artifact = getArtifact(runtime, artifactRefId);
  const validated = await revalidateWorkItemSource(runtime, artifact.workItemId);
  const workItem = validated.workItem;

  if (workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE") {
    throw new TypeError("lifecycle Markdown is read-only in EXECUTION/COMPLETE");
  }
  if (!artifactDirectEditIsAllowed(workItem, artifact)) {
    throw new TypeError("ArtifactRef is not directly editable in the current WorkItem state");
  }
  const owner = artifactReturnOwner(artifact);
  if (command.expectedSha256 !== artifact.sha256) {
    return ExpectedHashWriteResultSchema.parse({
      tag: "STALE",
      currentSha256: artifact.sha256,
    });
  }

  const result = replaceWorkingTreeMarkdown(
    workItem.repositoryRoot,
    artifact.repositoryPath,
    command.expectedSha256,
    command.markdown,
  );
  if (result.tag === "STALE") return result;

  const nextArtifact = ArtifactRefSchema.parse({
    ...artifact,
    id: newArtifactRefId(),
    sha256: result.sha256,
    gitCommit: null,
  });
  withTransaction(runtime.database, () => {
    storeArtifact(runtime.database, nextArtifact);
    updateWorkItemLifecycle(runtime.database, workItem.id, {
      stage: owner,
      status: "ACTIVE",
      outcome: null,
    });
  });
  return result;
};

export { createCoordinatorRuntime, type CoordinatorRuntime } from "./runtime.ts";
export {
  getRun,
  listRunEvents,
  listRuns,
  readReferencedEvidence,
} from "./run.ts";
export {
  computeSignoffPackage,
  getWorkItem,
  listArtifacts,
  listExecutionTasks,
  signoffPackageForWorkItem,
  signOffWorkItem,
} from "./authority.ts";
export {
  adoptArtifactProposal,
  rejectArtifactProposal,
  startStageRun,
  submitRunInput,
} from "./stage.ts";
