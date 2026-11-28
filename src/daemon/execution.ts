import {
  type Approval,
  type CandidateReviewEvent,
  CandidateReviewEventSchema,
  CandidateMembersSchema,
  type EvidenceRef,
  type ExecutionTask,
  type ExecutionTaskId,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunEventPayload,
  type RunId,
  type RunRole,
  type RepositoryPath,
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
  builderCheckpointRequestForTurn,
  decideOperationalRecovery,
  executionTaskIsEligible,
  isPostSignoffRole,
  qaReviewAssessmentsAreAdmitted,
  semanticRepairIsAllowed,
} from "../core/execution.ts";
import {
  deriveExecutionOwner,
  candidateSubmissionEvents,
  initialCandidateMembers,
  admittedCandidateMember,
  candidateMembershipCanonicalJson,
  reconstructCandidateRounds,
  verifyCandidateRoundHashes,
  candidateFindingDispositions,
  deriveAcceptanceDecision,
  linkedSubmission,
  routeApprovalStale,
  routeValidationFailure,
  transitionWorkItem,
} from "../core/lifecycle.ts";
import {
  loadValidatedProjectManifest,
  resolveGovernanceGateIds,
  resolveVerificationGate,
} from "../shell/project.ts";
import {
  type CandidateCapture,
  captureCandidate,
  createFreshCheckout,
  replayAndVerifyCandidate,
} from "../shell/repository.ts";
import {
  admitProductiveOpenCode,
  productiveInvocationFailure,
  productiveInvocationFailureClassification,
  runOpenCodeTurn,
} from "../shell/opencode.ts";
import {
  byteEqual,
  newCandidateReviewEventId,
  newRunId,
  nowIsoDateTime,
  readRunEvidenceBytes,
  sha256,
  sha256Text,
  workspacePathForRun,
} from "../shell/runtime.ts";
import {
  blockExecutionTasksForApproval,
  countRunningExecutionTasks,
  loadApprovals,
  loadCandidateReviewEvents,
  loadTaskStatesForApproval,
  loadRunningExecutionTaskLinks,
  loadRunningRunForExecutionTask,
  loadRunsForExecutionTask,
  reconstructExecutionTask,
  setExecutionTaskState,
  storeCandidateReviewEvent,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import { type ActiveProvider, type CoordinatorRuntime, withWorkItemOperatorMutation } from "./runtime.ts";
import {
  appendRunEvent,
  createAgentActivityRecorder,
  failRunForProductiveInvocation,
  failRunForProvider,
  getRun,
  getRunEvent,
  insertRun,
  listRunEvents,
  listRuns,
  nextAttempt,
  persistProviderEvents,
  readEvidenceRef,
  recordProviderDiagnostics,
  renderArtifacts,
  stopActiveProvider,
  updateRun,
  writeRunEvidence,
} from "./run.ts";
import {
  approvalChangedOwners,
  approvalClosure,
  currentMaterialFresh,
  currentApprovalForWorkItem,
  approvalContext,
  approvalContextForRun,
  observeCurrentCandidateReview,
  requireCurrentAcceptanceIdentity,
  acceptanceObservationCodeForFailure,
  staleAuthorityOwnerForFailure,
  canonicalTasksForApproval,
  getApproval,
  getWorkItem,
  signedPlanBytes,
  type ResolvedContext,
} from "./authority.ts";
import { isSourceBoundaryFailure } from "./work-item-source.ts";
import {
  appendValidationFailed,
  appendValidationPassed,
  forecastVariancePaths,
  preflightExecutionRun,
  runCheckpointGate,
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
      ? "Before editing, inspect the signed task against the fresh baseline. If the required outcome is already satisfied, make no edits and emit TASK_ALREADY_SATISFIED with a concise factual summary. Otherwise implement exactly the signed task and do not emit TASK_ALREADY_SATISFIED. Stay within signed scope/exclusions; changeSurface is the reviewed physical forecast, not permission to avoid a minimum same-layer split required by the signed design. Preserve declared module responsibilities. At every P7-defined architecture feedback checkpoint, emit GATE_CHECKPOINT_REQUESTED with the applicable signed gateId as the terminal action of the turn. The coordinator executes the gate; continue only from its GATE_PASSED/GATE_FAILED result in this same Run/session. Do not use shell/execute for checkpoints and do not redesign."
      : role === "REVIEWER"
        ? "Independently review the replayed candidate against the signed task and resolved authority. Compare the exact actual changed paths with the signed changeSurface forecast. Any unforecast production path is acceptable only when it is the minimum same-layer physical decomposition needed to preserve an already-resolved responsibility/effect boundary with no semantic-owner, public-contract, state, dependency, validation-contract or behavior change; otherwise fail. Explicitly check module cohesion/decomposition and minimum change. File length alone is not the criterion. Do not edit. If V4 semantics fail, emit REVIEW_FAILED. If V4 semantics pass, emit REVIEW_PASSED with minimumChange=MINIMUM_SUFFICIENT and minimumChangeSummary=null when no removable surface exists, or minimumChange=CHANGE_BLOAT with a non-empty minimumChangeSummary identifying the removable surface when the candidate is semantically correct but unnecessarily large."
        : "Correct only the proven triggering failure in the replayed candidate. Preserve declared module responsibilities and do not broaden scope.";
  const { state: _mutableState, ...immutableTask } = task;
  return [
    `Order execution role: ${role}`,
    roleInstruction,
    "Return only a JSON array of canonical provider-emittable RunEventPayload values for this role.",
    `ExecutionTask: ${canonicalJson(context.qa === undefined ? task : immutableTask)}`,
    context.qa === undefined ? "" : [
      "Exact QA correction trigger: " + context.qa.triggerEventId,
      "Immutable submitted QA events (original report and any preceding failed retest; historical observations are not automatically current evidence):",
      canonicalJson(context.qa.events),
      role === "REVIEWER"
        ? "Independently assess every submitted finding exactly once in qaAssessments with verdict, rationale and verified evidence. PASS requires all findings SATISFIED or NOT_REPRODUCED and the ordinary V4 review to pass. Route UPSTREAM findings to BLOCKED_FOR_REANALYSIS, FAIL_REPAIRABLE to REVIEW_FAILURE unless upstream is required. Ordinary V4 may fail an independent obligation even if all findings pass. Do not edit or issue human disposition."
        : "Correct only the proven triggering failure and retain exact submitted finding context; do not issue reviewer assessment or human disposition.",
    ].join("\n"),
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

const reviewerCandidateForRun = (runtime: CoordinatorRuntime, run: Run, approval: Approval): RunEvent => {
  if (run.triggerEventId === null || run.role !== "REVIEWER") throw new TypeError("REVIEWER requires exact trigger");
  const trigger = getRunEvent(runtime, run.triggerEventId);
  if (trigger.event.tag === "CANDIDATE_STATE_RECORDED") return trigger;
  if (trigger.event.tag !== "CANDIDATE_RECORDED") throw new TypeError("Run trigger does not identify a candidate state");
  const history = loadCandidateReviewEvents(runtime.database, approval.id);
  const starts = history.filter(value => value.event.tag === "REVIEW_STARTED" && value.event.runId === run.id);
  const start = starts[0];
  if (starts.length !== 1 || start?.event.tag !== "REVIEW_STARTED") throw new TypeError("candidate replay requires exact QA admission");
  const input = candidateSubmissionEvents(approval.id, history, start.event.submissionId);
  const prior = getRun(runtime, trigger.runId);
  if (prior.role !== "REVIEWER" || prior.status !== "COMPLETED" || prior.terminalClassification !== "CANDIDATE_DONE" ||
      prior.workItemId !== run.workItemId || prior.executionTaskId !== run.executionTaskId ||
      prior.baselineCommit !== run.baselineCommit || prior.attempt >= run.attempt ||
      input.some(value => value.event.tag === "REPORT" && value.event.taskId !== run.executionTaskId)) {
    throw new TypeError("QA replay trigger has foreign candidate lineage");
  }
  const candidate = getCandidateEvent(runtime, trigger.event.candidateStateEventId);
  const owner = getRun(runtime, candidate.runId);
  if (owner.workItemId !== run.workItemId || owner.executionTaskId !== run.executionTaskId ||
      owner.baselineCommit !== run.baselineCommit || owner.attempt >= prior.attempt ||
      (owner.role !== "BUILDER" && owner.role !== "REMEDIATOR")) throw new TypeError("QA replay candidate state is foreign");
  return candidate;
};

export const candidateForRun = (
  runtime: CoordinatorRuntime,
  run: Run,
  approval: Approval,
): RunEvent | null => {
  if (run.role === "BUILDER") return null;
  if (run.triggerEventId === null) {
    throw new TypeError("post-builder Run requires a triggerEventId");
  }
  if (run.role === "REVIEWER") return reviewerCandidateForRun(runtime, run, approval);

  const failure = getRunEvent(runtime, run.triggerEventId);
  const failureRun = getRun(runtime, failure.runId);
  if (failureRun.role !== "REVIEWER" || failureRun.triggerEventId === null) {
    throw new TypeError("REMEDIATOR failure lineage does not resolve to a REVIEWER candidate");
  }
  return reviewerCandidateForRun(runtime, failureRun, approval);
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

const runAcceptsFinalization = (
  runtime: CoordinatorRuntime,
  runId: RunId,
): boolean => getRun(runtime, runId).status === "RUNNING";

const persistExecutionProviderEvents = (
  runtime: CoordinatorRuntime,
  run: Run,
  payloads: readonly RunEventPayload[],
): readonly RunEvent[] | null =>
  withTransaction(runtime.database, () => {
    const current = getRun(runtime, run.id);
    if (current.status === "CANCELLED") return null;
    if (current.status !== "RUNNING") {
      throw new TypeError(
        `execution Run cannot accept provider result from status ${current.status}`,
      );
    }
    return persistProviderEvents(runtime, current, payloads);
  });

export const setWorkItemExecutionBlocked = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): void => {
  const current = getWorkItem(runtime, workItemId);
  const transition = transitionWorkItem(current, {
    tag: "BLOCK_CURRENT_OWNER",
  });
  updateWorkItemLifecycle(runtime.database, workItemId, transition);
};

// Called inside the same transaction that finalizes the task/Run.
const completeExecutionAggregate = (
  runtime: CoordinatorRuntime, approval: Approval, plan: Uint8Array, finalizedRun: Run, member?: RunEvent,
): void => {
  const tasks = loadTaskStatesForApproval(runtime.database,approval.id).map(([id])=>reconstructExecutionTask(runtime.database,id,plan));
  const aggregate = aggregateTaskCompletion(tasks);
  if(!aggregate.complete||aggregate.outcome===null) return;
  const current = getWorkItem(runtime,approval.workItemId);
  if(current.stage!=="EXECUTION"||current.status!=="ACTIVE"||currentApprovalForWorkItem(runtime,current.id)?.id!==approval.id) throw new TypeError("execution aggregate owner changed");
  const history=loadCandidateReviewEvents(runtime.database,approval.id);
  if(aggregate.outcome==="CANDIDATE_DONE") {
    const runs=listRuns(runtime,current.id);
    const events=runs.flatMap(run=>listRunEvents(runtime,run.id));
    let event: CandidateReviewEvent;
    if(history.length===0) {
      const members=initialCandidateMembers(approval,tasks,runs,events,history);
      event=CandidateReviewEventSchema.parse({id:newCandidateReviewEventId(),approvalId:approval.id,sequence:1,occurredAt:nowIsoDateTime(),actor:null,event:{tag:"OPENED",candidateHash:sha256Text(candidateMembershipCanonicalJson(approval.id,members))}});
    } else {
      const submissionId=linkedSubmission(finalizedRun,runs,events,history);
      if(submissionId===null||member===undefined||member.event.tag!=="CANDIDATE_RECORDED") throw new TypeError("Acceptance return requires exact QA candidate");
      const priorRounds=reconstructCandidateRounds(approval,tasks,runs,events,history);
      const prior=Array.from(priorRounds.values()).at(-1);
      if(prior===undefined) throw new TypeError("prior Acceptance round missing");
      const replacement=admittedCandidateMember(approval,tasks,runs,events,member.id);
      const members=CandidateMembersSchema.parse(prior.map(value=>value[0]===replacement[0]?replacement:value));
      event=CandidateReviewEventSchema.parse({id:newCandidateReviewEventId(),approvalId:approval.id,sequence:history.length+1,occurredAt:nowIsoDateTime(),actor:null,event:{tag:"REVIEW_COMPLETED",submissionId,candidateHash:sha256Text(candidateMembershipCanonicalJson(approval.id,members)),candidateEventId:member.id}});
    }
    const next=[...history,event];
    const rounds=reconstructCandidateRounds(approval,tasks,runs,events,next);
    verifyCandidateRoundHashes(next,new Map([...rounds].map(([id,members])=>[id,sha256Text(candidateMembershipCanonicalJson(approval.id,members))])));
    candidateFindingDispositions(next,rounds,tasks,runs,events);
    storeCandidateReviewEvent(runtime.database,event);
  } else if(aggregate.outcome!=="ALREADY_SATISFIED"||history.length!==0) {
    throw new TypeError("invalid execution aggregate outcome");
  }
  updateWorkItemLifecycle(runtime.database,current.id,transitionWorkItem(current,{tag:"EXECUTION_COMPLETED",outcome:aggregate.outcome}));
};

export const blockOldApprovalAndReturn = (
  runtime: CoordinatorRuntime,
  approval: Approval,
  targetStage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
): void => {
  const current = getWorkItem(runtime, approval.workItemId);
  const transition = transitionWorkItem(current, {
    tag: "EXECUTION_RETURN",
    owner: targetStage,
  });
  blockExecutionTasksForApproval(runtime.database, approval.id);
  updateWorkItemLifecycle(runtime.database, approval.workItemId, transition);
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
    const current = getRun(runtime, run.id);
    if (current.status === "CANCELLED") {
      throw new TypeError("cancelled execution Run cannot publish a candidate");
    }
    if (current.status !== "RUNNING") {
      throw new TypeError(
        `execution Run cannot publish a candidate from status ${current.status}`,
      );
    }
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
  protectedPaths: readonly RepositoryPath[] = [],
): Promise<ActiveProvider> => {
  const configuredModel = runtime.config.model;
  if (configuredModel === null) {
    throw productiveInvocationFailure(
      "ENVIRONMENT_BLOCKED",
      new TypeError("a configured OpenCode model is required for productive execution work"),
    );
  }
  const admission = await admitProductiveOpenCode(
    runtime.stateRoot,
    workspace,
    configuredModel,
    runtime.environment,
    run.role,
    task,
    context.artifacts,
    runtime.config.referenceRoots,
    protectedPaths,
  );
  updateRun(runtime, run.id, { providerSessionId: admission.sessionId });
  const active: ActiveProvider = {
    server: admission.server,
    sessionId: admission.sessionId,
    trustedAccountId: admission.trustedAccountId,
    stageMaterialIdentity: null,
  };
  runtime.activeProviders.set(run.id, active);
  return active;
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
  const context = await approvalContextForRun(runtime, approval, task, run);
  const workspace = workspaceForRun(runtime, run.id);
  const closure = approvalClosure(runtime, approval);
  const protectedPaths = [
    closure.plan,
    closure.r3,
    ...closure.material,
  ].map((artifact) => artifact.repositoryPath);
  const parentCandidate = candidateForRun(runtime, run, approval);
  try {
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
  } catch (error) {
    failRunForProductiveInvocation(
      runtime,
      run.id,
      "PRECONDITION_FAILED",
      error,
    );
    return;
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
  let persisted: readonly RunEvent[] = [];
  let diagnosticEvidence: readonly EvidenceRef[] = [];
  try {
    const active = await startProviderForExecutionRun(
      runtime,
      run,
      task,
      context,
      workspace,
      protectedPaths,
    );
    const failure = run.role === "REMEDIATOR" && run.triggerEventId !== null
      ? getRunEvent(runtime, run.triggerEventId)
      : undefined;
    let triggeringEvent = trigger;
    let prompt = await executionPrompt(workItem, run.role, task, context, failure);
    let checkpointOrdinal = 0;

    while (true) {
      const payloads = await runOpenCodeTurn(
        active.server,
        active.sessionId,
        run,
        triggeringEvent.id,
        run.role,
        task,
        runtime.config.referenceRoots,
        prompt,
        (record, stderr) => {
          diagnosticEvidence = recordProviderDiagnostics(
            runtime,
            run.id,
            record,
            stderr,
          );
        },
        createAgentActivityRecorder(runtime, run.id),
      );

      const checkpointRequest = builderCheckpointRequestForTurn(run.role, payloads);
      if (checkpointRequest !== null) {
        if (!task.gateIds.includes(checkpointRequest.gateId)) {
          throw new TypeError(
            `BUILDER requested unsigned checkpoint gate: ${checkpointRequest.gateId}`,
          );
        }
        if (!(await executionAuthorityIsFreshForSuccess(runtime, run, approval, task))) {
          return;
        }
        const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
        resolveVerificationGate(manifest, checkpointRequest.gateId);

        const checkpointCapture = await captureCandidate(workspace);
        const scopeError = validateChangedPaths(
          task,
          checkpointCapture.changedPaths,
          protectedPaths,
        );
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
      }

      const accepted = persistExecutionProviderEvents(runtime, run, payloads);
      if (accepted === null) return;
      persisted = accepted;
      if (checkpointRequest === null) break;

      checkpointOrdinal += 1;
      const result = await runCheckpointGate(
        runtime,
        getRun(runtime, run.id),
        checkpointRequest.gateId,
        workspace,
        checkpointOrdinal,
      );
      triggeringEvent = result;
      prompt = [
        "Coordinator checkpoint result:",
        canonicalJson(result.event),
        result.event.tag === "GATE_PASSED"
          ? "The signed checkpoint passed. Continue the signed task in this same Run/session. Request the next signed checkpoint only when the PLAN requires it."
          : "The signed checkpoint failed. Correct only within the signed design and scope, then request the required signed checkpoint again if needed; otherwise emit STAGE_BLOCKED for EXECUTION. Do not redesign or broaden scope.",
      ].join("\n\n");
    }
  } catch (error) {
    const classification = productiveInvocationFailureClassification(error);
    if (classification === null) {
      failRunForProvider(runtime, run.id, error, diagnosticEvidence);
    } else {
      failRunForProductiveInvocation(
        runtime,
        run.id,
        classification,
        error,
        diagnosticEvidence,
      );
    }
    return;
  } finally {
    await stopActiveProvider(runtime, run.id);
  }

  if (!runAcceptsFinalization(runtime, run.id)) return;

  const stageBlocked = persisted.findLast((event) => event.event.tag === "STAGE_BLOCKED");
  if (stageBlocked !== undefined) {
    withTransaction(runtime.database, () => {
      if (!runAcceptsFinalization(runtime, run.id)) return;
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
        diagnosticEvidence,
      );
      return;
    }
    if (!(await executionAuthorityIsFreshForSuccess(runtime, run, approval, task))) {
      return;
    }
    const plan = await signedPlanBytes(runtime,approval);
    const finalized = withTransaction(runtime.database, () => {
      if (!runAcceptsFinalization(runtime, run.id)) return false;
      updateRun(runtime, run.id, {
        status: "COMPLETED",
        terminalClassification: "ALREADY_SATISFIED",
        endedAt: nowIsoDateTime(),
      });
      markTaskState(runtime, task.id, "ALREADY_SATISFIED");
      completeExecutionAggregate(runtime,approval,plan,getRun(runtime,run.id));
      return true;
    });
    if (!finalized) return;
    return;
  }
  if (run.role === "BUILDER" && capture.changedPaths.length === 0) {
    failRunForProvider(
      runtime,
      run.id,
      new TypeError(
        "zero-diff BUILDER Run did not explicitly classify the task as already satisfied",
      ),
      diagnosticEvidence,
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
  if (!runAcceptsFinalization(runtime, run.id)) return;
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
      if (!runAcceptsFinalization(runtime, run.id)) return;
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
    if (!runAcceptsFinalization(runtime, run.id)) return;
    const returnTo = owners.length === 0 ? "PLAN" : routeApprovalStale(owners);
    withTransaction(runtime.database, () => {
      if (!runAcceptsFinalization(runtime, run.id)) return;
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
    if (!runAcceptsFinalization(runtime, run.id)) return;
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
  const candidateEvent = candidateForRun(runtime, run, approval);
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

  const closure = approvalClosure(runtime, approval);
  const protectedPaths = [
    closure.plan,
    closure.r3,
    ...closure.material,
  ].map((artifact) => artifact.repositoryPath);
  const scopeError = validateChangedPaths(task, capture.changedPaths, protectedPaths);
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

  const context = await approvalContextForRun(runtime, approval, task, run);
  let reviewEvents: readonly RunEvent[];
  let diagnosticEvidence: readonly EvidenceRef[] = [];
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
      (record, stderr) => {
        diagnosticEvidence = recordProviderDiagnostics(
          runtime,
          run.id,
          record,
          stderr,
        );
      },
      createAgentActivityRecorder(runtime, run.id),
    );
    const submission = context.qa?.events[0];
    const submitted = submission?.event.tag === "SUBMIT" ? submission.event.findingIds : null;
    const results = payloads.filter(value => value.tag === "REVIEW_PASSED" || value.tag === "REVIEW_FAILED");
    if (results.length !== 1 || !qaReviewAssessmentsAreAdmitted(results[0]!, submitted)) {
      throw new TypeError("REVIEWER result lacks exact admitted QA assessment set");
    }
    const accepted = persistExecutionProviderEvents(runtime, run, payloads);
    if (accepted === null) return;
    reviewEvents = accepted;
  } catch (error) {
    await stopActiveProvider(runtime, run.id);
    const classification = productiveInvocationFailureClassification(error);
    if (classification === null) {
      failRunForProvider(runtime, run.id, error, diagnosticEvidence);
    } else {
      failRunForProductiveInvocation(
        runtime,
        run.id,
        classification,
        error,
        diagnosticEvidence,
      );
    }
    return;
  }
  await stopActiveProvider(runtime, run.id);
  if (!runAcceptsFinalization(runtime, run.id)) return;
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
      diagnosticEvidence,
    );
    return;
  }
  if (reviewPass.event.tag !== "REVIEW_PASSED") {
    throw new TypeError("expected REVIEW_PASSED");
  }
  if (
    reviewPass.event.minimumChange === undefined ||
    reviewPass.event.minimumChangeSummary === undefined
  ) {
    throw new TypeError(
      "current REVIEW_PASSED requires explicit minimum-change evidence",
    );
  }
  const reviewEvidence = reviewPass.event.evidence;
  const v4 = appendValidationPassed(runtime, run.id, "V4", reviewEvidence);

  const authorityPaths = new Set(protectedPaths);
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

  const forecastVariance = forecastVariancePaths(task, capture.changedPaths);
  const varianceEvidence = writeRunEvidence(
    runtime,
    run.id,
    "validation/v6-change-surface.json",
    new TextEncoder().encode(canonicalJson({
      forecast: task.changeSurface,
      actual: capture.changedPaths,
      unforecast: forecastVariance,
    })),
    "application/json",
  );
  const v6Evidence = [...reviewEvidence, varianceEvidence];
  if (reviewPass.event.minimumChange === "CHANGE_BLOAT") {
    if (reviewPass.event.minimumChangeSummary === null) {
      throw new TypeError("CHANGE_BLOAT review pass requires a summary");
    }
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V6",
      "CHANGE_BLOAT",
      reviewPass.event.minimumChangeSummary,
      v6Evidence,
    );
    await reviewFailureReaction(runtime, run, approval, task, failure);
    return;
  }
  const v6 = appendValidationPassed(
    runtime,
    run.id,
    "V6",
    v6Evidence,
  );

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

  const plan=await signedPlanBytes(runtime,approval);
  const finalized = withTransaction(runtime.database, () => {
    if (!runAcceptsFinalization(runtime, run.id)) return false;
    const member=appendRunEvent(runtime, run.id, {
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
    completeExecutionAggregate(runtime,approval,plan,getRun(runtime,run.id),member);
    return true;
  });
  if (!finalized) return;
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
  const qaHistory = loadCandidateReviewEvents(runtime.database, approval.id);
  const submissionId = qaHistory.length === 0 ? null : linkedSubmission(last, history,
    history.flatMap(value => listRunEvents(runtime, value.id)), qaHistory);
  const createContinuation = async (
    role: Exclude<RunRole, "STAGE">, triggerEventId: RunEventId | null, operationalReplacement = false,
  ): Promise<Run> => {
    if (submissionId !== null && triggerEventId === null) throw new TypeError("QA continuation lacks exact trigger");
    const context = await approvalContext(runtime, approval, task, role, submissionId === null ? undefined :
      { submissionId, triggerEventId: triggerEventId! });
    const replacesDirect = operationalReplacement && submissionId !== null && qaHistory.some(value =>
      value.event.tag === "REVIEW_STARTED" && value.event.runId === last.id && value.event.submissionId === submissionId);
    return withTransaction(runtime.database, () => {
      const current = getWorkItem(runtime, workItem.id);
      if (current.stage !== "EXECUTION" || current.status !== "ACTIVE" || currentApprovalForWorkItem(runtime, workItem.id)?.id !== approval.id ||
          latestRunForTask(runtime, task.id)?.id !== last.id || activeExecutionRun(runtime, task.id) !== null) {
        throw new TypeError("execution continuation identity changed");
      }
      const currentReview = loadCandidateReviewEvents(runtime.database, approval.id);
      if (canonicalJson(currentReview) !== canonicalJson(qaHistory)) throw new TypeError("QA continuation review sequence changed");
      const next = createExecutionRun(runtime, current, task, approval, role, triggerEventId, context.contextHash);
      if (replacesDirect && submissionId !== null) {
        storeCandidateReviewEvent(runtime.database, {
          id: newCandidateReviewEventId(), approvalId: approval.id, sequence: currentReview.length + 1,
          occurredAt: nowIsoDateTime(), actor: null,
          event: { tag: "REVIEW_STARTED", submissionId, runId: next.id },
        });
      }
      return next;
    });
  };

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
    return createContinuation(lastRole, last.triggerEventId, true);
  }

  const candidate = listRunEvents(runtime, last.id)
    .findLast((event) => event.event.tag === "CANDIDATE_STATE_RECORDED");
  if (candidate !== undefined) {
    return createContinuation("REVIEWER", candidate.id);
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
    return createContinuation("REMEDIATOR", failure.id);
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

export const startExactExecutionTask = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  executionTaskId: ExecutionTaskId,
): Promise<Readonly<{
  workItem: WorkItem;
  approval: Approval;
  task: ExecutionTask;
  run: Run;
}>> => {
  const workItem = getWorkItem(runtime, workItemId);
  if (workItem.stage !== "EXECUTION" || workItem.status !== "ACTIVE") {
    throw new TypeError("manual execution start requires EXECUTION / ACTIVE WorkItem");
  }

  const approval = currentApprovalForWorkItem(runtime, workItem.id);
  if (approval === null) {
    throw new TypeError("manual execution start requires current Approval");
  }
  const tasks = await canonicalTasksForApproval(runtime, approval);
  const task = tasks.find((candidate) => candidate.id === executionTaskId);
  if (task === undefined) {
    throw new TypeError("execution task does not belong to current Approval");
  }

  const owner = deriveExecutionOwner(tasks, listRuns(runtime, workItem.id));
  if (owner.tag !== "CURRENT_TASK" || owner.taskId !== task.id) {
    throw new TypeError("execution task is not the canonical current task");
  }
  if (!executionTaskIsEligible(task, tasks)) {
    throw new TypeError("execution task is not currently eligible");
  }
  if (!(await currentMaterialFresh(runtime, approval))) {
    throw new TypeError("current Approval material is stale");
  }

  const context = await approvalContext(runtime, approval, task, "BUILDER");
  const run = withTransaction(runtime.database, () => {
    const currentWorkItem = getWorkItem(runtime, workItem.id);
    if (
      currentWorkItem.stage !== "EXECUTION" ||
      currentWorkItem.status !== "ACTIVE"
    ) {
      throw new TypeError("WorkItem changed before manual execution start");
    }
    const currentApproval = currentApprovalForWorkItem(runtime, workItem.id);
    if (currentApproval?.id !== approval.id) {
      throw new TypeError("Approval changed before manual execution start");
    }
    if (countRunningExecutionTasks(runtime.database) !== 0) {
      throw new TypeError("another ExecutionTask became RUNNING");
    }
    markTaskState(runtime, task.id, "RUNNING");
    return createExecutionRun(
      runtime,
      currentWorkItem,
      { ...task, state: "RUNNING" },
      approval,
      "BUILDER",
      null,
      context.contextHash,
    );
  });

  return {
    workItem,
    approval,
    task: { ...task, state: "RUNNING" },
    run,
  };
};

export const startEligibleTask = async (
  runtime: CoordinatorRuntime,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<Readonly<{
  workItem: WorkItem;
  approval: Approval;
  task: ExecutionTask;
  run: Run;
}> | null> => {
  const approvals = loadApprovals(runtime.database);

  for (const approval of approvals) {
    const workItem = getWorkItem(runtime, approval.workItemId);
    if (!repositoryRoots.includes(workItem.repositoryRoot)) continue;
    if (workItem.status !== "ACTIVE" || currentApprovalForWorkItem(runtime, workItem.id)?.id !== approval.id) continue;
    if (workItem.stage==="AWAITING_ACCEPTANCE") {
      const history=loadCandidateReviewEvents(runtime.database,approval.id);
      const submission=history.findLast(value=>value.event.tag==="SUBMIT");
      if(submission?.event.tag!=="SUBMIT"||history.some(value=>value.event.tag==="REVIEW_COMPLETED"&&value.event.submissionId===submission.id)) continue;
      const started=await withWorkItemOperatorMutation(runtime,workItem.id,async()=>{
        let proof: Awaited<ReturnType<typeof observeCurrentCandidateReview>>;
        try { proof=await observeCurrentCandidateReview(runtime,workItem.id,approval.id,history.length); }
        catch(error) { if(acceptanceObservationCodeForFailure(error)!==null||staleAuthorityOwnerForFailure(error)!==null||isSourceBoundaryFailure(error)) return null; throw error; }
        const decision=deriveAcceptanceDecision({...proof,current:true,coherent:true,mutationConflict:false,currentProof:proof.history,diagnostic:null});
        if(decision.tag!=="QUEUED"||decision.submissionId!==submission.id) throw new TypeError("queued QA submission changed");
        const input=candidateSubmissionEvents(approval.id,proof.history,submission.id);
        const report=input.find(value=>value.event.tag==="REPORT");
        if(report?.event.tag!=="REPORT") throw new TypeError("queued QA report missing");
        const taskId=report.event.taskId;
        const task=proof.tasks.find(value=>value.id===taskId);
        const member=Array.from(proof.rounds.values()).at(-1)?.find(value=>value[0]===taskId);
        if(task===undefined||task.state!=="CANDIDATE_DONE"||member===undefined) throw new TypeError("queued QA member is not eligible");
        const context=await approvalContext(runtime,approval,task,"REVIEWER",{submissionId:submission.id,triggerEventId:member[1]});
        const rechecked=await observeCurrentCandidateReview(runtime,workItem.id,approval.id,history.length);
        if(canonicalJson(rechecked.history)!==canonicalJson(proof.history)||canonicalJson(rechecked.tasks)!==canonicalJson(proof.tasks)) throw new TypeError("queued QA admission changed");
        return withTransaction(runtime.database,()=>{
          const current=requireCurrentAcceptanceIdentity(runtime,workItem.id,approval.id,history.length);
          if(canonicalJson(current.history)!==canonicalJson(history)||countRunningExecutionTasks(runtime.database)!==0) throw new TypeError("queued QA identity or global execution owner changed");
          markTaskState(runtime,task.id,"RUNNING");
          const run=createExecutionRun(runtime,current.workItem,{...task,state:"RUNNING"},approval,"REVIEWER",member[1],context.contextHash);
          storeCandidateReviewEvent(runtime.database,{id:newCandidateReviewEventId(),approvalId:approval.id,sequence:history.length+1,occurredAt:nowIsoDateTime(),actor:null,event:{tag:"REVIEW_STARTED",submissionId:submission.id,runId:run.id}});
          const updated=transitionWorkItem(current.workItem,{tag:"QA_REVIEW_STARTED"});
          updateWorkItemLifecycle(runtime.database,workItem.id,updated);
          return {workItem:{...current.workItem,...updated},approval,task:{...task,state:"RUNNING" as const},run};
        });
      });
      if(started!==null) return started;
      continue;
    }
    if(workItem.stage!=="EXECUTION") continue;
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const task = tasks.find((candidate) => executionTaskIsEligible(candidate, tasks));
    if (task === undefined) continue;
    if(!(await currentMaterialFresh(runtime,approval))) continue;
    const plan = await signedPlanBytes(runtime, approval);
    const context = await approvalContext(runtime, approval, task, "BUILDER");

    const run = withTransaction(runtime.database, () => {
      const current = getWorkItem(runtime, workItem.id);
      const currentTasks = tasks.map(value => reconstructExecutionTask(runtime.database, value.id, plan));
      if (current.stage !== "EXECUTION" || current.status !== "ACTIVE" ||
          currentApprovalForWorkItem(runtime, workItem.id)?.id !== approval.id ||
          currentTasks.find(value => executionTaskIsEligible(value, currentTasks))?.id !== task.id) {
        throw new TypeError("ordinary task admission identity or eligibility changed");
      }
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
