import {
  type Approval,
  type ExecutionTask,
  type ExecutionTaskId,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunEventPayload,
  type RunId,
  type RunRole,
  RunSchema,
  type Sha256,
  type ValidationStage,
  type WorkItem,
  type WorkItemId,
} from "../core/contracts.ts";
import {
  canonicalJson,
} from "../core/canonical.ts";
import {
  aggregateTaskCompletion,
  decideOperationalRecovery,
  executionTaskIsEligible,
  isPostSignoffRole,
  semanticRepairIsAllowed,
} from "../core/execution.ts";
import {
  routeApprovalStale,
  routeValidationFailure,
} from "../core/lifecycle.ts";
import {
  loadValidatedProjectManifest,
  resolveGovernanceGateIds,
} from "../shell/project.ts";
import {
  type CandidateCapture,
  captureCandidate,
  createFreshCheckout,
  replayAndVerifyCandidate,
} from "../shell/repository.ts";
import {
  createOpenCodeSession,
  runOpenCodeTurn,
  startOpenCodeServer,
  stopOpenCodeServer,
} from "../shell/opencode.ts";
import {
  byteEqual,
  newRunId,
  nowIsoDateTime,
  readRunEvidenceBytes,
  sha256,
  workspacePathForRun,
} from "../shell/runtime.ts";
import {
  blockExecutionTasksForApproval,
  countRunningExecutionTasks,
  loadApprovals,
  loadRunningExecutionTaskLinks,
  loadRunningRunForExecutionTask,
  loadRunsForExecutionTask,
  reconstructExecutionTask,
  setExecutionTaskState,
  setWorkItemStatus,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import { type ActiveProvider, type CoordinatorRuntime } from "./runtime.ts";
import {
  appendRunEvent,
  failRunForProvider,
  getRun,
  getRunEvent,
  insertRun,
  listRunEvents,
  nextAttempt,
  persistProviderEvents,
  readEvidenceRef,
  renderArtifacts,
  stopActiveProvider,
  updateRun,
  writeRunEvidence,
} from "./run.ts";
import {
  approvalChangedOwners,
  approvalClosure,
  currentMaterialFresh,
  approvalContext,
  canonicalTasksForApproval,
  getApproval,
  getWorkItem,
  signedPlanBytes,
  type ResolvedContext,
} from "./authority.ts";
import {
  appendValidationFailed,
  appendValidationPassed,
  preflightExecutionRun,
  runRequiredGates,
  validateChangedPaths,
  validationStages,
} from "./validation.ts";

export const executionPrompt = async (
  workItem: WorkItem,
  role: Exclude<RunRole, "STAGE">,
  task: ExecutionTask,
  context: ResolvedContext,
  failure?: RunEvent,
  reviewerInputs?: string,
): Promise<string> => {
  const roleInstruction =
    role === "BUILDER"
      ? "Before editing, inspect the signed task against the fresh baseline. If the required outcome is already satisfied, make no edits and emit TASK_ALREADY_SATISFIED with a concise factual summary. Otherwise implement exactly the signed task and do not emit TASK_ALREADY_SATISFIED. Edit only the permitted changeSurface. Preserve declared module responsibilities; do not absorb a new responsibility into an existing module merely to stay inside the file list. At every P7-defined architecture feedback checkpoint, run the applicable resolved architecture fitness gate before proceeding to the next architecture-affecting step; a failing gate permits only correction within the signed design, otherwise stop for upstream resolution. Do not redesign."
      : role === "REVIEWER"
        ? "Independently review the replayed candidate against the signed task and resolved authority. Explicitly check module cohesion/decomposition: fail if an orchestration or boundary module has absorbed policy, persistence, effect or transport mechanics, or if a required same-layer split was avoided merely to stay inside the signed file list. File length alone is not the criterion. Do not edit. Emit REVIEW_PASSED or REVIEW_FAILED."
        : "Correct only the proven triggering failure in the replayed candidate. Preserve declared module responsibilities and do not broaden scope.";
  return [
    `Order execution role: ${role}`,
    roleInstruction,
    "Return only a JSON array of canonical provider-emittable RunEventPayload values for this role.",
    `ExecutionTask: ${canonicalJson(task)}`,
    failure === undefined ? "" : `Triggering failure: ${canonicalJson(failure)}`,
    reviewerInputs ?? "",
    "Resolved canonical sources:",
    await renderArtifacts(workItem, context.artifacts),
  ].filter((value) => value.length > 0).join("\n\n");
};

export const workspaceForRun = (
  runtime: CoordinatorRuntime,
  runId: RunId,
): string => workspacePathForRun(runtime.stateRoot, runId);

export const getCandidateEvent = (
  runtime: CoordinatorRuntime,
  eventId: RunEventId,
): RunEvent => {
  const event = getRunEvent(runtime, eventId);
  if (event.event.tag !== "CANDIDATE_STATE_RECORDED") {
    throw new TypeError("Run trigger does not identify a candidate state");
  }
  return event;
};

export const candidateForRun = (
  runtime: CoordinatorRuntime,
  run: Run,
): RunEvent | null => {
  if (run.role === "BUILDER") return null;
  if (run.triggerEventId === null) {
    throw new TypeError("post-builder Run requires a triggerEventId");
  }
  if (run.role === "REVIEWER") return getCandidateEvent(runtime, run.triggerEventId);

  const failure = getRunEvent(runtime, run.triggerEventId);
  const failureRun = getRun(runtime, failure.runId);
  if (failureRun.role !== "REVIEWER" || failureRun.triggerEventId === null) {
    throw new TypeError("REMEDIATOR failure lineage does not resolve to a REVIEWER candidate");
  }
  return getCandidateEvent(runtime, failureRun.triggerEventId);
};

export const loadCandidateCapture = (
  runtime: CoordinatorRuntime,
  event: RunEvent,
): CandidateCapture => {
  if (event.event.tag !== "CANDIDATE_STATE_RECORDED") {
    throw new TypeError("expected candidate-state event");
  }
  return {
    patch: readEvidenceRef(runtime, event.runId, event.event.patch),
    patchSha256: event.event.patch.sha256,
    changedPaths: event.event.changedPaths,
  };
};

export const markTaskState = (
  runtime: CoordinatorRuntime,
  taskId: ExecutionTaskId,
  state: ExecutionTask["state"],
): void => {
  setExecutionTaskState(runtime.database, taskId, state);
};

export const setWorkItemExecutionBlocked = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): void => {
  setWorkItemStatus(runtime.database, workItemId, "BLOCKED");
};

export const maybeCompleteWorkItem = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<void> => {
  const tasks = await canonicalTasksForApproval(runtime, approval);
  const aggregate = aggregateTaskCompletion(tasks);
  if (!aggregate.complete) return;
  updateWorkItemLifecycle(runtime.database, approval.workItemId, {
    stage: "COMPLETE",
    status: "COMPLETE",
    outcome: aggregate.outcome,
  });
};

export const blockOldApprovalAndReturn = (
  runtime: CoordinatorRuntime,
  approval: Approval,
  targetStage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
): void => {
  blockExecutionTasksForApproval(runtime.database, approval.id);
  updateWorkItemLifecycle(runtime.database, approval.workItemId, {
    stage: targetStage,
    status: "ACTIVE",
    outcome: null,
  });
};

export const terminateValidationFailure = (
  runtime: CoordinatorRuntime,
  run: Run,
  approval: Approval,
  failure: RunEvent,
): void => {
  if (failure.event.tag !== "VALIDATION_FAILED") {
    throw new TypeError("expected VALIDATION_FAILED");
  }
  const classification = failure.event.classification;
  const route = routeValidationFailure(
    classification,
    classification === "BLOCKED_FOR_REANALYSIS"
      ? undefined
      : undefined,
  );
  if (route !== null) {
    blockOldApprovalAndReturn(runtime, approval, route);
  } else if (
    classification === "PRECONDITION_FAILED" ||
    classification === "ENVIRONMENT_BLOCKED"
  ) {
    if (run.executionTaskId === null) {
      throw new TypeError("post-signoff validation failure requires an ExecutionTask");
    }
    markTaskState(runtime, run.executionTaskId, "BLOCKED");
    setWorkItemExecutionBlocked(runtime, run.workItemId);
  }
};

export const publishCandidate = (
  runtime: CoordinatorRuntime,
  run: Run,
  capture: CandidateCapture,
): RunEvent => {
  const patch = writeRunEvidence(
    runtime,
    run.id,
    "candidate/patch.diff",
    capture.patch,
    "text/x-diff",
  );
  return withTransaction(runtime.database, () => {
    const event = appendRunEvent(runtime, run.id, {
      tag: "CANDIDATE_STATE_RECORDED",
      patch,
      changedPaths: capture.changedPaths,
    });
    updateRun(runtime, run.id, {
      status: "COMPLETED",
      providerSessionId: null,
      endedAt: nowIsoDateTime(),
    });
    return event;
  });
};

export const reconcileInterruptedCandidate = async (
  runtime: CoordinatorRuntime,
  run: Run,
): Promise<boolean> => {
  if (run.role !== "BUILDER" && run.role !== "REMEDIATOR") return false;
  try {
    const orphanPatch = readRunEvidenceBytes(
      runtime.stateRoot,
      run.id,
      "candidate/patch.diff",
    );
    const capture = await captureCandidate(workspaceForRun(runtime, run.id));
    if (!byteEqual(orphanPatch, capture.patch)) return false;
    publishCandidate(runtime, run, capture);
    return true;
  } catch {
    return false;
  }
};

export const startProviderForExecutionRun = async (
  runtime: CoordinatorRuntime,
  run: Run,
  task: ExecutionTask,
  context: ResolvedContext,
  workspace: string,
): Promise<ActiveProvider> => {
  const server = await startOpenCodeServer(
    runtime.stateRoot,
    workspace,
    runtime.config.model,
    runtime.environment,
  );
  try {
    const sessionId = await createOpenCodeSession(
      server,
      run.role,
      task,
      context.p1Paths,
      runtime.config.referenceRoots,
    );
    updateRun(runtime, run.id, { providerSessionId: sessionId });
    const active = { server, sessionId };
    runtime.activeProviders.set(run.id, active);
    return active;
  } catch (error) {
    await stopOpenCodeServer(server).catch(() => undefined);
    throw error;
  }
};

export const executeMutatingRun = async (
  runtime: CoordinatorRuntime,
  run: Run,
  task: ExecutionTask,
  approval: Approval,
): Promise<void> => {
  if (run.role !== "BUILDER" && run.role !== "REMEDIATOR") {
    throw new TypeError("mutating execution Run must be BUILDER or REMEDIATOR");
  }
  const workItem = getWorkItem(runtime, run.workItemId);
  const context = await approvalContext(runtime, approval, task, run.role);
  const workspace = workspaceForRun(runtime, run.id);
  const parentCandidate = candidateForRun(runtime, run);
  if (parentCandidate === null) {
    await createFreshCheckout(
      workItem.repositoryRoot,
      workspace,
      approval.baselineCommit,
    );
  } else {
    await replayAndVerifyCandidate(
      workItem.repositoryRoot,
      workspace,
      approval.baselineCommit,
      loadCandidateCapture(runtime, parentCandidate),
    );
  }

  const preflight = await preflightExecutionRun(runtime, run, approval, task);
  const preflightFailure = preflight.find(
    (event) => event.event.tag === "VALIDATION_FAILED",
  );
  if (preflightFailure !== undefined) {
    await reviewFailureReaction(runtime, run, approval, task, preflightFailure);
    return;
  }

  const trigger = appendRunEvent(runtime, run.id, {
    tag: "OBSERVATION_RECORDED",
    title: "EXECUTION_CONTEXT_READY",
    detail: `fresh baseline workspace prepared for ${run.role}`,
    evidence: [],
  });
  let persisted: readonly RunEvent[];
  try {
    const active = await startProviderForExecutionRun(
      runtime,
      run,
      task,
      context,
      workspace,
    );
    const failure = run.role === "REMEDIATOR" && run.triggerEventId !== null
      ? getRunEvent(runtime, run.triggerEventId)
      : undefined;
    const payloads = await runOpenCodeTurn(
      active.server,
      active.sessionId,
      run,
      trigger.id,
      run.role,
      task,
      runtime.config.referenceRoots,
      await executionPrompt(workItem, run.role, task, context, failure),
    );
    persisted = persistProviderEvents(runtime, run, payloads);
  } catch (error) {
    await stopActiveProvider(runtime, run.id);
    failRunForProvider(runtime, run.id, error);
    return;
  }
  await stopActiveProvider(runtime, run.id);

  const stageBlocked = persisted.findLast((event) => event.event.tag === "STAGE_BLOCKED");
  if (stageBlocked !== undefined) {
    withTransaction(runtime.database, () => {
      updateRun(runtime, run.id, {
        status: "BLOCKED",
        terminalClassification: "PRECONDITION_FAILED",
        endedAt: nowIsoDateTime(),
      });
      markTaskState(runtime, task.id, "BLOCKED");
      setWorkItemExecutionBlocked(runtime, run.workItemId);
    });
    return;
  }

  const current = getRun(runtime, run.id);
  if (current.status === "CANCELLED") return;
  const capture = await captureCandidate(workspace);
  const alreadySatisfied = persisted.findLast(
    (event) => event.event.tag === "TASK_ALREADY_SATISFIED",
  );
  if (alreadySatisfied !== undefined) {
    if (run.role !== "BUILDER" || capture.changedPaths.length !== 0) {
      failRunForProvider(
        runtime,
        run.id,
        new TypeError("TASK_ALREADY_SATISFIED requires a zero-diff BUILDER Run"),
      );
      return;
    }
    if (!(await executionAuthorityIsFreshForSuccess(runtime, run, approval, task))) {
      return;
    }
    withTransaction(runtime.database, () => {
      updateRun(runtime, run.id, {
        status: "COMPLETED",
        terminalClassification: "ALREADY_SATISFIED",
        endedAt: nowIsoDateTime(),
      });
      markTaskState(runtime, task.id, "ALREADY_SATISFIED");
    });
    await maybeCompleteWorkItem(runtime, approval);
    return;
  }
  if (run.role === "BUILDER" && capture.changedPaths.length === 0) {
    failRunForProvider(
      runtime,
      run.id,
      new TypeError(
        "zero-diff BUILDER Run did not explicitly classify the task as already satisfied",
      ),
    );
    return;
  }
  publishCandidate(runtime, getRun(runtime, run.id), capture);
};

export const reviewFailureReaction = async (
  runtime: CoordinatorRuntime,
  run: Run,
  approval: Approval,
  task: ExecutionTask,
  failure: RunEvent,
): Promise<void> => {
  if (failure.event.tag !== "VALIDATION_FAILED") {
    throw new TypeError("review failure reaction requires VALIDATION_FAILED");
  }
  const classification = failure.event.classification;
  if (
    classification === "TEST_FAILURE" ||
    classification === "REVIEW_FAILURE" ||
    classification === "CHANGE_BLOAT"
  ) {
    updateRun(runtime, run.id, {
      status: "FAILED",
      terminalClassification: classification,
      endedAt: nowIsoDateTime(),
    });
    return;
  }

  if (classification === "BLOCKED_FOR_REANALYSIS") {
    const review = listRunEvents(runtime, run.id)
      .findLast((event) =>
        event.event.tag === "REVIEW_FAILED" &&
        event.event.classification === "BLOCKED_FOR_REANALYSIS"
      );
    if (
      review === undefined ||
      review.event.tag !== "REVIEW_FAILED" ||
      review.event.classification !== "BLOCKED_FOR_REANALYSIS"
    ) {
      throw new TypeError("BLOCKED_FOR_REANALYSIS requires the owning REVIEW_FAILED event");
    }
    const returnTo = review.event.returnTo;
    withTransaction(runtime.database, () => {
      updateRun(runtime, run.id, {
        status: "BLOCKED",
        terminalClassification: "BLOCKED_FOR_REANALYSIS",
        endedAt: nowIsoDateTime(),
      });
      blockOldApprovalAndReturn(runtime, approval, returnTo);
    });
    return;
  }

  if (classification === "APPROVAL_STALE") {
    const owners = await approvalChangedOwners(runtime, approval);
    const returnTo = owners.length === 0 ? "PLAN" : routeApprovalStale(owners);
    withTransaction(runtime.database, () => {
      updateRun(runtime, run.id, {
        status: "BLOCKED",
        terminalClassification: "APPROVAL_STALE",
        endedAt: nowIsoDateTime(),
      });
      blockOldApprovalAndReturn(runtime, approval, returnTo);
    });
    return;
  }

  const route = routeValidationFailure(classification);
  withTransaction(runtime.database, () => {
    updateRun(runtime, run.id, {
      status: "BLOCKED",
      terminalClassification: classification,
      endedAt: nowIsoDateTime(),
    });
    if (route !== null) {
      blockOldApprovalAndReturn(runtime, approval, route);
    } else {
      markTaskState(runtime, task.id, "BLOCKED");
      setWorkItemExecutionBlocked(runtime, run.workItemId);
    }
  });
};

const executionAuthorityIsFreshForSuccess = async (
  runtime: CoordinatorRuntime,
  run: Run,
  approval: Approval,
  task: ExecutionTask,
): Promise<boolean> => {
  let fresh: boolean;
  try {
    fresh = await currentMaterialFresh(runtime, approval);
  } catch (error) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V1",
      "PRECONDITION_FAILED",
      error instanceof Error ? error.message : String(error),
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return false;
  }
  if (fresh) return true;

  const failure = appendValidationFailed(
    runtime,
    run.id,
    "V1",
    "APPROVAL_STALE",
    "current material authority changed before execution success could be committed",
  );
  await reviewFailureReaction(runtime, run, approval, task, failure);
  return false;
};

const reviewerInputs = (
  runtime: CoordinatorRuntime,
  capture: CandidateCapture,
  mechanicalEvents: readonly RunEvent[],
): string => {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const evidence = mechanicalEvents.flatMap((event) =>
    "evidence" in event.event && Array.isArray(event.event.evidence)
      ? event.event.evidence.map((ref) =>
          [
            `EvidenceRef: ${canonicalJson(ref)}`,
            decoder.decode(readEvidenceRef(runtime, event.runId, ref)),
          ].join("\n")
        )
      : []
  );
  return [
    "V4 reviewer inputs supplied by the coordinator:",
    `Replayed candidate changed paths: ${canonicalJson(capture.changedPaths)}`,
    "Exact resulting candidate diff:",
    decoder.decode(capture.patch),
    "Mechanical validation events completed before V4:",
    ...mechanicalEvents.map((event) => canonicalJson(event.event)),
    evidence.length === 0 ? "" : "Mechanical validation evidence bytes:",
    ...evidence,
    "The mechanical gates above are already executed coordinator evidence. Do not rerun them through shell/execute. Use read/glob/grep only if additional repository inspection is materially required.",
  ].filter((value) => value.length > 0).join("\n\n");
};

export const executeReviewerRun = async (
  runtime: CoordinatorRuntime,
  run: Run,
  task: ExecutionTask,
  approval: Approval,
): Promise<void> => {
  if (run.role !== "REVIEWER") throw new TypeError("review execution Run must be REVIEWER");
  const candidateEvent = candidateForRun(runtime, run);
  if (candidateEvent === null) throw new TypeError("REVIEWER requires candidate trigger");
  const capture = loadCandidateCapture(runtime, candidateEvent);
  const workItem = getWorkItem(runtime, run.workItemId);
  const workspace = workspaceForRun(runtime, run.id);

  try {
    await replayAndVerifyCandidate(
      workItem.repositoryRoot,
      workspace,
      approval.baselineCommit,
      capture,
    );
  } catch (error) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V1",
      "PRECONDITION_FAILED",
      error instanceof Error ? error.message : String(error),
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return;
  }

  const preflight = await preflightExecutionRun(runtime, run, approval, task);
  const preflightFailure = preflight.find((event) => event.event.tag === "VALIDATION_FAILED");
  if (preflightFailure !== undefined) {
    await reviewFailureReaction(runtime, run, approval, task, preflightFailure);
    return;
  }

  const scopeError = validateChangedPaths(task, capture.changedPaths);
  if (scopeError !== null) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V2",
      "SCOPE_BREACH",
      scopeError,
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return;
  }
  const v2 = appendValidationPassed(runtime, run.id, "V2");

  const v3 = await runRequiredGates(runtime, run, task.gateIds, workspace, "V3");
  if (v3.event.tag === "VALIDATION_FAILED") {
    await reviewFailureReaction(runtime, run, approval, task, v3);
    return;
  }

  const context = await approvalContext(runtime, approval, task, run.role);
  let reviewEvents: readonly RunEvent[];
  try {
    const active = await startProviderForExecutionRun(
      runtime,
      run,
      task,
      context,
      workspace,
    );
    const payloads = await runOpenCodeTurn(
      active.server,
      active.sessionId,
      run,
      v3.id,
      "REVIEWER",
      task,
      runtime.config.referenceRoots,
      await executionPrompt(
        workItem,
        "REVIEWER",
        task,
        context,
        undefined,
        reviewerInputs(runtime, capture, [...preflight, v2, v3]),
      ),
    );
    reviewEvents = persistProviderEvents(runtime, run, payloads);
  } catch (error) {
    await stopActiveProvider(runtime, run.id);
    failRunForProvider(runtime, run.id, error);
    return;
  }
  await stopActiveProvider(runtime, run.id);
  const reviewFailure = reviewEvents.findLast((event) => event.event.tag === "REVIEW_FAILED");
  if (reviewFailure !== undefined && reviewFailure.event.tag === "REVIEW_FAILED") {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V4",
      reviewFailure.event.classification,
      reviewFailure.event.summary,
      reviewFailure.event.evidence,
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return;
  }
  const reviewPass = reviewEvents.findLast((event) => event.event.tag === "REVIEW_PASSED");
  if (reviewPass === undefined) {
    failRunForProvider(
      runtime,
      run.id,
      new TypeError("REVIEWER did not emit REVIEW_PASSED or REVIEW_FAILED"),
    );
    return;
  }
  if (reviewPass.event.tag !== "REVIEW_PASSED") {
    throw new TypeError("expected REVIEW_PASSED");
  }
  const reviewEvidence = reviewPass.event.evidence;
  const v4 = appendValidationPassed(runtime, run.id, "V4", reviewEvidence);

  const closure = approvalClosure(runtime, approval);
  const authorityPaths = new Set(
    [closure.plan, closure.r3, ...closure.material].map((artifact) => artifact.repositoryPath),
  );
  const governanceViolation = capture.changedPaths.find((path) => authorityPaths.has(path));
  if (governanceViolation !== undefined) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V5",
      "GOVERNANCE_BREACH",
      `candidate mutates signed authority: ${governanceViolation}`,
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return;
  }
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  const v5 = await runRequiredGates(
    runtime,
    run,
    resolveGovernanceGateIds(manifest),
    workspace,
    "V5",
  );
  if (v5.event.tag === "VALIDATION_FAILED") {
    await reviewFailureReaction(runtime, run, approval, task, v5);
    return;
  }

  if (validateChangedPaths(task, capture.changedPaths) !== null) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V6",
      "CHANGE_BLOAT",
      "candidate exceeds the exact signed minimum change surface",
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return;
  }
  const v6 = appendValidationPassed(runtime, run.id, "V6", reviewEvidence);

  const v7 = await runRequiredGates(runtime, run, task.gateIds, workspace, "V7");
  if (v7.event.tag === "VALIDATION_FAILED") {
    await reviewFailureReaction(runtime, run, approval, task, v7);
    return;
  }
  if (!(await executionAuthorityIsFreshForSuccess(runtime, run, approval, task))) {
    return;
  }

  const validationEvents = [
    ...preflight.filter((event) => event.event.tag === "VALIDATION_PASSED"),
    v2,
    v3,
    v4,
    v5,
    v6,
    v7,
  ];
  const byStage = new Map<ValidationStage, RunEvent>();
  for (const event of validationEvents) {
    if (event.event.tag === "VALIDATION_PASSED") byStage.set(event.event.stage, event);
  }
  const ordered = validationStages.map((stage) => {
    const event = byStage.get(stage);
    if (event === undefined) throw new TypeError(`missing final REVIEWER validation pass ${stage}`);
    return event.id;
  });

  withTransaction(runtime.database, () => {
    appendRunEvent(runtime, run.id, {
      tag: "CANDIDATE_RECORDED",
      candidateStateEventId: candidateEvent.id,
      validationEventIds: ordered,
    });
    updateRun(runtime, run.id, {
      status: "COMPLETED",
      terminalClassification: "CANDIDATE_DONE",
      endedAt: nowIsoDateTime(),
    });
    markTaskState(runtime, task.id, "CANDIDATE_DONE");
  });
  await maybeCompleteWorkItem(runtime, approval);
};

export const executePostSignoffRun = async (
  runtime: CoordinatorRuntime,
  run: Run,
  task: ExecutionTask,
  approval: Approval,
): Promise<void> => {
  try {
    if (run.role === "REVIEWER") {
      await executeReviewerRun(runtime, run, task, approval);
    } else {
      await executeMutatingRun(runtime, run, task, approval);
    }
  } catch (error) {
    await stopActiveProvider(runtime, run.id);
    if (getRun(runtime, run.id).status === "CANCELLED") return;
    throw error;
  }
};

export const activeExecutionRun = (
  runtime: CoordinatorRuntime,
  taskId: ExecutionTaskId,
): Run | null => loadRunningRunForExecutionTask(runtime.database, taskId);

export const runHistoryForTask = (
  runtime: CoordinatorRuntime,
  taskId: ExecutionTaskId,
): readonly Run[] => loadRunsForExecutionTask(runtime.database, taskId);

export const latestRunForTask = (
  runtime: CoordinatorRuntime,
  taskId: ExecutionTaskId,
): Run | null => {
  const rows = runHistoryForTask(runtime, taskId);
  return rows.at(-1) ?? null;
};

export const priorSemanticRepairClassifications = (
  runtime: CoordinatorRuntime,
  taskId: ExecutionTaskId,
): readonly string[] =>
  runHistoryForTask(runtime, taskId).flatMap((run) => {
    if (run.role !== "REMEDIATOR" || run.triggerEventId === null) return [];
    const event = getRunEvent(runtime, run.triggerEventId);
    return event.event.tag === "VALIDATION_FAILED"
      ? [event.event.classification]
      : event.event.tag === "REVIEW_FAILED"
        ? [event.event.classification]
        : [];
  });

export const createExecutionRun = (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  task: ExecutionTask,
  approval: Approval,
  role: Exclude<RunRole, "STAGE">,
  triggerEventId: RunEventId | null,
  contextHash: Sha256,
): Run => insertRun(runtime, RunSchema.parse({
  id: newRunId(),
  workItemId: workItem.id,
  executionTaskId: task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role,
  triggerEventId,
  status: "RUNNING",
  attempt: nextAttempt(runtime, workItem.id, "EXECUTION", task.id),
  baselineCommit: approval.baselineCommit,
  contextHash,
  providerSessionId: null,
  terminalClassification: null,
  startedAt: nowIsoDateTime(),
  endedAt: null,
}));

export const continuationForRunningTask = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  task: ExecutionTask,
  approval: Approval,
): Promise<Run | null> => {
  if (activeExecutionRun(runtime, task.id) !== null) return null;
  const history = runHistoryForTask(runtime, task.id);
  const last = history.at(-1);
  if (last === undefined) {
    throw new TypeError("RUNNING ExecutionTask has no Run history");
  }
  if (!isPostSignoffRole(last.role)) {
    throw new TypeError("ExecutionTask Run history contains STAGE role");
  }
  const lastRole = last.role;
  const continuationRole: Exclude<RunRole, "STAGE"> =
    last.terminalClassification === "PROVIDER_FAILURE" ||
    last.terminalClassification === "COORDINATOR_INTERRUPTED"
      ? lastRole
      : listRunEvents(runtime, last.id).some((event) => event.event.tag === "CANDIDATE_STATE_RECORDED")
        ? "REVIEWER"
        : "REMEDIATOR";
  const context = await approvalContext(runtime, approval, task, continuationRole);

  if (
    last.terminalClassification === "PROVIDER_FAILURE" ||
    last.terminalClassification === "COORDINATOR_INTERRUPTED"
  ) {
    const decision = decideOperationalRecovery(history, {
      executionTaskId: task.id,
      role: lastRole,
      triggerEventId: last.triggerEventId,
    });
    if (decision === "BLOCK") {
      withTransaction(runtime.database, () => {
        markTaskState(runtime, task.id, "BLOCKED");
        setWorkItemExecutionBlocked(runtime, workItem.id);
      });
      return null;
    }
    return withTransaction(runtime.database, () =>
      createExecutionRun(
        runtime,
        workItem,
        task,
        approval,
        lastRole,
        last.triggerEventId,
        context.contextHash,
      )
    );
  }

  const candidate = listRunEvents(runtime, last.id)
    .findLast((event) => event.event.tag === "CANDIDATE_STATE_RECORDED");
  if (candidate !== undefined) {
    return withTransaction(runtime.database, () =>
      createExecutionRun(
        runtime,
        workItem,
        task,
        approval,
        "REVIEWER",
        candidate.id,
        context.contextHash,
      )
    );
  }

  const failure = listRunEvents(runtime, last.id)
    .findLast((event) => event.event.tag === "VALIDATION_FAILED");
  if (
    failure !== undefined &&
    failure.event.tag === "VALIDATION_FAILED" &&
    (failure.event.classification === "TEST_FAILURE" ||
      failure.event.classification === "REVIEW_FAILURE" ||
      failure.event.classification === "CHANGE_BLOAT")
  ) {
    if (
      !semanticRepairIsAllowed(
        failure.event.classification,
        priorSemanticRepairClassifications(runtime, task.id),
      )
    ) {
      withTransaction(runtime.database, () => {
        markTaskState(runtime, task.id, "BLOCKED");
        setWorkItemExecutionBlocked(runtime, workItem.id);
      });
      return null;
    }
    return withTransaction(runtime.database, () =>
      createExecutionRun(
        runtime,
        workItem,
        task,
        approval,
        "REMEDIATOR",
        failure.id,
        context.contextHash,
      )
    );
  }

  if (task.state === "RUNNING") {
    throw new TypeError("RUNNING ExecutionTask has no deterministic continuation");
  }
  return null;
};

export const currentRunningTask = async (
  runtime: CoordinatorRuntime,
): Promise<Readonly<{
  workItem: WorkItem;
  approval: Approval;
  task: ExecutionTask;
}> | null> => {
  const rows = loadRunningExecutionTaskLinks(runtime.database);
  if (rows.length > 1) throw new TypeError("more than one ExecutionTask is RUNNING");
  const row = rows[0];
  if (row === undefined) return null;
  const [taskId, approvalId, workItemId] = row;
  const approval = getApproval(runtime, approvalId);
  const planBytes = await signedPlanBytes(runtime, approval);
  return {
    workItem: getWorkItem(runtime, workItemId),
    approval,
    task: reconstructExecutionTask(
      runtime.database,
      taskId,
      planBytes,
    ),
  };
};

export const startEligibleTask = async (
  runtime: CoordinatorRuntime,
): Promise<Readonly<{
  workItem: WorkItem;
  approval: Approval;
  task: ExecutionTask;
  run: Run;
}> | null> => {
  const approvals = loadApprovals(runtime.database);

  for (const approval of approvals) {
    const workItem = getWorkItem(runtime, approval.workItemId);
    if (workItem.stage !== "EXECUTION" || workItem.status !== "ACTIVE") continue;
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const task = tasks.find((candidate) => executionTaskIsEligible(candidate, tasks));
    if (task === undefined) continue;
    const context = await approvalContext(runtime, approval, task, "BUILDER");

    const run = withTransaction(runtime.database, () => {
      const existing = countRunningExecutionTasks(runtime.database);
      if (existing !== 0) {
        throw new TypeError("another ExecutionTask became RUNNING");
      }
      markTaskState(runtime, task.id, "RUNNING");
      return createExecutionRun(
        runtime,
        workItem,
        { ...task, state: "RUNNING" },
        approval,
        "BUILDER",
        null,
        context.contextHash,
      );
    });
    return { workItem, approval, task: { ...task, state: "RUNNING" }, run };
  }
  return null;
};
