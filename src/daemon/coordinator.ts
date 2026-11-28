import {
  type Approval,
  type CandidateReviewEvent,
  type CandidateReviewEventPayload,
  type Sha256,
  type RunEventId,
  CandidateReviewEventSchema,
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
  candidateFindingDispositions,
  candidateMemberActionIsAdmitted,
  candidateFindingActionIsAdmitted,
  candidateSubmitIsAdmitted,
  deriveAcceptanceDecision,
  artifactReturnOwner,
  stageRunCancellationIsAdmitted,
  transitionWorkItem,
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
  prepareCandidateTestCopy,
  readWorkingTreeFile,
  replaceWorkingTreeMarkdown,
} from "../shell/repository.ts";
import {
  newArtifactRefId,
  newCandidateReviewEventId,
  nowIsoDateTime,
  sha256,
} from "../shell/runtime.ts";
import {
  loadRunningRuns,
  blockExecutionTasksForApproval,
  storeCandidateReviewEvent,
  loadWorkItems,
  storeArtifact,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import {
  createCoordinatorRuntime,
  type CoordinatorRuntime,
  withWorkItemOperatorMutation,
} from "./runtime.ts";
import {
  getRun,
  getRunEvent,
  validatePayloadEvidence,
  listRunEvents,
  listRuns,
  readReferencedEvidence,
  stopActiveProvider,
  updateRun,
} from "./run.ts";
import {
  canonicalTasksForApproval,
  observeCurrentCandidateReview,
  requireCurrentAcceptanceIdentity,
  acceptanceObservationCodeForFailure,
  currentApprovalForWorkItem,
  currentLifecycleArtifacts,
  currentMaterialFresh,
  getArtifact,
  getWorkItem,
  listArtifacts,
  listExecutionTasks,
  reconcileWorkItemAuthority,
  signoffPackageForWorkItem,
  observeSignoffPackageArtifacts,
  signOffWorkItem,
  staleAuthorityOwnerForFailure,
} from "./authority.ts";
import {
  adoptArtifactProposal,
  reconcilePendingArtifactProposals,
  readArtifactProposalTarget,
  rejectArtifactProposal,
  startStageRun,
  submitRunInput,
} from "./stage.ts";
import {
  activeExecutionRun,
  loadCandidateCapture,
  continuationForRunningTask,
  currentRunningTask,
  executePostSignoffRun,
  markTaskState,
  reconcileInterruptedCandidate,
  setWorkItemExecutionBlocked,
  startEligibleTask,
  startExactExecutionTask,
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
    .filter((workItem) => runtime.config.repositoryRoots.includes(workItem.repositoryRoot))
    .filter((workItem) => includeArchived || !workItem.archived);

export const createWorkItem = (
  runtime: CoordinatorRuntime,
  input: Parameters<typeof createWorkItemFromSource>[1],
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
) => createWorkItemFromSource(runtime, input, repositoryRoots);

export const sourceDiagnosticForFailure = sourceDiagnosticForSourceFailure;
export { staleAuthorityOwnerForFailure };

export const listWorkItemSchemas = () => workItemSchemaCatalog;

export const listProjects = async (
  runtime: CoordinatorRuntime,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
) => (await loadConfiguredProjects(repositoryRoots))
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

// Admission consumes the canonical event payload; ACCEPT membership is server-computed.
type HumanQaPayload = Exclude<CandidateReviewEventPayload, {tag:"OPENED" | "REVIEW_STARTED" | "REVIEW_COMPLETED" | "ACCEPT"}> | Readonly<{tag:"ACCEPT"}>;

export const recordCandidateReviewDecision = (
  runtime: CoordinatorRuntime, workItemId: WorkItemId, approvalId: Approval["id"],
  expectedCandidateHash: Sha256 | null, expectedReviewSequence: number, actor: string,
  payload: HumanQaPayload,
): Promise<CandidateReviewEvent> => withWorkItemOperatorMutation(runtime, workItemId, async () => {
  const identity = requireCurrentAcceptanceIdentity(runtime, workItemId, approvalId, expectedReviewSequence);
  const proofUnavailable = payload.tag === "REANALYSIS_REQUESTED" && payload.reason === "CANDIDATE_PROOF_UNAVAILABLE";
  const commit = (event: CandidateReviewEvent) => withTransaction(runtime.database, () => {
    const current = requireCurrentAcceptanceIdentity(runtime,workItemId,approvalId,expectedReviewSequence);
    if (JSON.stringify(current)!==JSON.stringify(identity)) throw new TypeError("Acceptance identity changed before command commit");
    storeCandidateReviewEvent(runtime.database,event);
    if (event.event.tag === "ACCEPT") updateWorkItemLifecycle(runtime.database,workItemId,transitionWorkItem(current.workItem,{tag:"CANDIDATE_ACCEPTED"}));
    if (event.event.tag === "REANALYSIS_REQUESTED") {
      blockExecutionTasksForApproval(runtime.database,approvalId);
      updateWorkItemLifecycle(runtime.database,workItemId,transitionWorkItem(current.workItem,{tag:"EXECUTION_RETURN",owner:"PLAN"}));
    }
    return event;
  });
  const makeEvent = (event: CandidateReviewEventPayload) => CandidateReviewEventSchema.parse({
    id:newCandidateReviewEventId(),approvalId,sequence:expectedReviewSequence+1,occurredAt:nowIsoDateTime(),actor,event
  });
  if (proofUnavailable) {
    if (expectedCandidateHash !== null) throw new TypeError("proof-unavailable reanalysis requires null candidate hash");
    for (let i=0;i<2;i++) {
      try { await observeCurrentCandidateReview(runtime,workItemId,approvalId,expectedReviewSequence); }
      catch (error) {
        if (acceptanceObservationCodeForFailure(error)==="CANDIDATE_PROOF_UNAVAILABLE") continue;
        throw error;
      }
      throw new TypeError("candidate proof is available; reanalysis not admitted");
    }
    return commit(makeEvent(payload));
  }
  const proof=await observeCurrentCandidateReview(runtime,workItemId,approvalId,expectedReviewSequence);
  const round=proof.history.findLast(value=>value.event.tag==="OPENED"||value.event.tag==="REVIEW_COMPLETED");
  if (round===undefined || (round.event.tag!=="OPENED"&&round.event.tag!=="REVIEW_COMPLETED") ||
      expectedCandidateHash!==round.event.candidateHash) throw new TypeError("expected candidate hash changed");
  const members=proof.rounds.get(round.id);
  if(members===undefined) throw new TypeError("current candidate membership unavailable");
  const input={...proof,current:true,coherent:true,mutationConflict:false,currentProof:proof.history,diagnostic:null};
  const decision=deriveAcceptanceDecision(input);
  switch(payload.tag) {
    case "REPORT":
      if(!candidateMemberActionIsAdmitted(input,true,"REPORT",payload.taskId,payload.candidateEventId)) throw new TypeError("report is not admitted");
      break;
    case "SUBMIT":
      if(!candidateSubmitIsAdmitted(input,true,payload.findingIds)) throw new TypeError("submission is not admitted");
      break;
    case "RETEST_FAILED":
      if(!candidateFindingActionIsAdmitted(input,true,"RETEST",payload.findingId)) throw new TypeError("retest is not admitted");
      break;
    case "DISPOSITION":
      if(!candidateFindingActionIsAdmitted(input,true,payload.outcome==="RESOLVED"?"RETEST":"WITHDRAW",payload.findingId)) throw new TypeError("disposition is not admitted");
      if(payload.followupWorkItemId!==null && getWorkItem(runtime,payload.followupWorkItemId).projectId!==identity.workItem.projectId) throw new TypeError("follow-up must belong to the same project");
      break;
    case "REANALYSIS_REQUESTED":
      if(payload.reason!=="NO_OP_CHALLENGE"||decision.tag!=="REANALYSE_NO_OP"||
          decision.findingIds.length!==payload.findingIds.length||!decision.findingIds.every(id=>payload.findingIds.includes(id))) throw new TypeError("no-op reanalysis requires exact outstanding challenge set");
      break;
    case "ACCEPT":
      if(decision.tag!=="ACCEPT") throw new TypeError("candidate acceptance is not admitted");
      break;
  }
  const event=makeEvent(payload.tag==="ACCEPT"?{tag:"ACCEPT",candidateHash:round.event.candidateHash,candidateMembers:members}:payload);
  candidateFindingDispositions([...proof.history,event],proof.rounds,proof.tasks,proof.runs,proof.runEvents);
  if(event.event.tag==="REPORT"||event.event.tag==="RETEST_FAILED") {
    for(const id of event.event.evidence) {
      const evidence=getRunEvent(runtime,id);
      validatePayloadEvidence(runtime,evidence.runId,evidence.event);
    }
  }
  return commit(event);
});

export const prepareAcceptanceTestCopy = (
  runtime: CoordinatorRuntime, workItemId: WorkItemId, approvalId: Approval["id"],
  expectedCandidateHash: Sha256, expectedReviewSequence: number, taskId: ExecutionTaskId, candidateEventId: RunEventId,
): Promise<string> => withWorkItemOperatorMutation(runtime,workItemId,async () => {
  const proof=await observeCurrentCandidateReview(runtime,workItemId,approvalId,expectedReviewSequence);
  const round=proof.history.findLast(value=>value.event.tag==="OPENED"||value.event.tag==="REVIEW_COMPLETED");
  if(round===undefined||(round.event.tag!=="OPENED"&&round.event.tag!=="REVIEW_COMPLETED")||
      round.event.candidateHash!==expectedCandidateHash||
      !candidateMemberActionIsAdmitted({...proof,current:true,coherent:true,mutationConflict:false,currentProof:proof.history,diagnostic:null},true,"PREPARE_TEST_COPY",taskId,candidateEventId)) throw new TypeError("test copy identity or eligibility changed");
  const member=getRunEvent(runtime,candidateEventId);
  if(member.event.tag!=="CANDIDATE_RECORDED") throw new TypeError("test copy requires candidate proof");
  const workItem=requireCurrentAcceptanceIdentity(runtime,workItemId,approvalId,expectedReviewSequence).workItem;
  return prepareCandidateTestCopy(workItem.repositoryRoot,proof.approval.baselineCommit,loadCandidateCapture(runtime,getRunEvent(runtime,member.event.candidateStateEventId)));
});

export type TickResult = Readonly<{
  result: "NO_WORK" | "STARTED";
  executionTaskId: ExecutionTaskId | null;
  runId: RunId | null;
}>;

const driveExecutionTask = async (
  runtime: CoordinatorRuntime,
  taskId: ExecutionTaskId,
  repositoryRoots: readonly string[],
): Promise<RunId | null> => {
  let firstRunId: RunId | null = null;
  while (true) {
    const refreshed = await currentRunningTask(runtime);
    if (
      refreshed === null ||
      refreshed.task.id !== taskId ||
      !repositoryRoots.includes(refreshed.workItem.repositoryRoot)
    ) {
      break;
    }

    const active = activeExecutionRun(runtime, refreshed.task.id);
    if (active !== null) {
      firstRunId ??= active.id;
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
  return firstRunId;
};

export const runCoordinatorTick = async (
  runtime: CoordinatorRuntime,
  repositoryRoots: readonly string[] = runtime.config.repositoryRoots,
): Promise<TickResult> => {
  if (runtime.tickActive) throw new TypeError("TICK_ALREADY_ACTIVE");
  runtime.tickActive = true;
  try {
    await reconcilePendingArtifactProposals(runtime);
    let current = await currentRunningTask(runtime);
    if (current !== null && !repositoryRoots.includes(current.workItem.repositoryRoot)) {
      return { result: "NO_WORK", executionTaskId: null, runId: null };
    }
    if (current === null) {
      const started = await startEligibleTask(runtime, repositoryRoots);
      if (started === null) {
        return { result: "NO_WORK", executionTaskId: null, runId: null };
      }
      current = {
        workItem: started.workItem,
        approval: started.approval,
        task: started.task,
      };
    }

    const firstRunId = await driveExecutionTask(
      runtime,
      current.task.id,
      repositoryRoots,
    );
    return firstRunId === null
      ? { result: "NO_WORK", executionTaskId: null, runId: null }
      : {
          result: "STARTED",
          executionTaskId: current.task.id,
          runId: firstRunId,
        };
  } finally {
    runtime.tickActive = false;
  }
};

const startCurrentExecutionTaskUnlocked = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  executionTaskId: ExecutionTaskId,
): Promise<Run> => {
  if (runtime.tickActive) throw new TypeError("TICK_ALREADY_ACTIVE");
  runtime.tickActive = true;
  try {
    const started = await startExactExecutionTask(
      runtime,
      workItemId,
      executionTaskId,
    );
    const repositoryRoots = [started.workItem.repositoryRoot];
    void driveExecutionTask(
      runtime,
      started.task.id,
      repositoryRoots,
    ).catch((error: unknown) => {
      console.error("Order manual execution task loop failed", error);
    }).finally(() => {
      runtime.tickActive = false;
    });
    return started.run;
  } catch (error) {
    runtime.tickActive = false;
    throw error;
  }
};

export const startCurrentExecutionTask = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  executionTaskId: ExecutionTaskId,
): Promise<Run> =>
  withWorkItemOperatorMutation(
    runtime,
    workItemId,
    () => startCurrentExecutionTaskUnlocked(runtime, workItemId, executionTaskId),
  );

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

const cancelRunUnlocked = async (
  runtime: CoordinatorRuntime,
  runId: RunId,
): Promise<Run> => {
  const run = getRun(runtime, runId);
  if (run.status !== "RUNNING" && run.status !== "WAITING_FOR_INPUT") {
    throw new TypeError("Run is not cancellable");
  }
  if (
    run.role === "STAGE" &&
    !stageRunCancellationIsAdmitted(run, listRunEvents(runtime, run.id))
  ) {
    throw new TypeError("STAGE Run is not cancellable while a proposal owns attention");
  }
  const active = runtime.activeProviders.get(run.id);
  if (active !== undefined) {
    await active.server.client.session
      .interrupt({ sessionID: active.sessionId, resume: false })
      .catch(() => undefined);
  }

  try {
    return withTransaction(runtime.database, () => {
      const current = getRun(runtime, run.id);
      if (current.status !== "RUNNING" && current.status !== "WAITING_FOR_INPUT") {
        throw new TypeError("Run stopped being cancellable before Cancel commit");
      }
      if (
        current.role === "STAGE" &&
        !stageRunCancellationIsAdmitted(
          current,
          listRunEvents(runtime, current.id),
        )
      ) {
        throw new TypeError(
          "STAGE Run proposal state changed before Cancel commit",
        );
      }
      const cancelled = updateRun(runtime, current.id, {
        status: "CANCELLED",
        endedAt: nowIsoDateTime(),
        providerSessionId: null,
      });
      if (current.executionTaskId !== null) {
        markTaskState(runtime, current.executionTaskId, "BLOCKED");
        setWorkItemExecutionBlocked(runtime, current.workItemId);
      }
      return cancelled;
    });
  } finally {
    if (active !== undefined) {
      await stopActiveProvider(runtime, run.id);
    }
  }
};

export const cancelRun = (
  runtime: CoordinatorRuntime,
  runId: RunId,
): Promise<Run> => {
  const run = getRun(runtime, runId);
  return withWorkItemOperatorMutation(
    runtime,
    run.workItemId,
    () => cancelRunUnlocked(runtime, runId),
  );
};

const resumeWorkItemUnlocked = async (
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
  if (listRuns(runtime, workItem.id).some((run) =>
    run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"
  )) {
    throw new TypeError("WorkItem cannot resume while a Run is active");
  }

  if (workItem.stage !== "EXECUTION") {
    return withTransaction(runtime.database, () => {
      const current = getWorkItem(runtime, workItem.id);
      if (listRuns(runtime, current.id).some((run) =>
        run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"
      )) {
        throw new TypeError("a Run became active before Resume commit");
      }
      const transition = transitionWorkItem(current, {
        tag: "RESUME_CURRENT_OWNER",
      });
      updateWorkItemLifecycle(runtime.database, current.id, transition);
      return getWorkItem(runtime, current.id);
    });
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
  const currentMaterial = await currentMaterialFresh(runtime, approval);
  if (!executionResumeIsAllowed({
    workItemStatus: workItem.status,
    taskState: task.state,
    approvalCurrent: currentMaterial,
    blockerResolved: true,
  })) {
    throw new TypeError("execution resume preconditions are not satisfied");
  }

  return withTransaction(runtime.database, () => {
    const current = getWorkItem(runtime, workItem.id);
    if (listRuns(runtime, current.id).some((run) =>
      run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"
    )) {
      throw new TypeError("a Run became active before Resume commit");
    }
    const transition = transitionWorkItem(current, {
      tag: "RESUME_CURRENT_OWNER",
    });
    markTaskState(runtime, task.id, "TODO");
    updateWorkItemLifecycle(runtime.database, current.id, transition);
    return getWorkItem(runtime, current.id);
  });
};

export const resumeWorkItem = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<WorkItem> =>
  withWorkItemOperatorMutation(
    runtime,
    workItemId,
    () => resumeWorkItemUnlocked(runtime, workItemId),
  );

export const schedulerIntervalMillis = 3_600_000;

export type CoordinatorTick = () => Promise<TickResult>;

const defaultCoordinatorTick = (
  runtime: CoordinatorRuntime,
): CoordinatorTick => () => runCoordinatorTick(runtime);

export const armScheduler = (
  runtime: CoordinatorRuntime,
  tick: CoordinatorTick = defaultCoordinatorTick(runtime),
): void => {
  if (runtime.schedulerStopped || runtime.schedulerTimer !== null) return;
  runtime.schedulerTimer = setTimeout(() => {
    runtime.schedulerTimer = null;
    if (runtime.schedulerStopped) return;
    const run = runtime.tickActive
      ? Promise.resolve()
      : tick().then(() => undefined, () => undefined);
    void run.finally(() => armScheduler(runtime, tick));
  }, schedulerIntervalMillis);
};

export const startCoordinatorScheduler = async (
  runtime: CoordinatorRuntime,
  tick: CoordinatorTick = defaultCoordinatorTick(runtime),
  initialTick: CoordinatorTick = tick,
): Promise<void> => {
  runtime.schedulerStopped = false;
  await recoverInterruptedRuns(runtime);
  await initialTick();
  armScheduler(runtime, tick);
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
  await Promise.all(
    [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
  );
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

const saveArtifactContentUnlocked = async (
  runtime: CoordinatorRuntime,
  artifactRefId: ArtifactRefId,
  input: ExpectedHashMarkdownWrite,
): Promise<ExpectedHashWriteResult> => {
  const command = ExpectedHashMarkdownWriteSchema.parse(input);
  const artifact = getArtifact(runtime, artifactRefId);
  const validated = await revalidateWorkItemSource(runtime, artifact.workItemId);
  const workItem = validated.workItem;

  if (
    listRuns(runtime, workItem.id)
      .some((run) => run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
  ) {
    throw new TypeError("lifecycle Markdown cannot change while a Run is active");
  }
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
    const current = getWorkItem(runtime, workItem.id);
    if (
      listRuns(runtime, current.id)
        .some((run) => run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
    ) {
      throw new TypeError("a Run became active before lifecycle Markdown commit");
    }
    const transition = transitionWorkItem(current, {
      tag: "LIFECYCLE_ARTIFACT_CHANGED",
      owner,
    });
    storeArtifact(runtime.database, nextArtifact);
    updateWorkItemLifecycle(runtime.database, current.id, transition);
  });
  return result;
};

export const saveArtifactContent = (
  runtime: CoordinatorRuntime,
  artifactRefId: ArtifactRefId,
  input: ExpectedHashMarkdownWrite,
): Promise<ExpectedHashWriteResult> => {
  const artifact = getArtifact(runtime, artifactRefId);
  return withWorkItemOperatorMutation(
    runtime,
    artifact.workItemId,
    () => saveArtifactContentUnlocked(runtime, artifactRefId, input),
  );
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
  observeCurrentApproval,
  observeApprovalHistory,
  observeApprovalArtifacts,
  observeCandidateReviewEvents,
  acceptanceObservationCodeForFailure,
  reconcileWorkItemAuthority,
  signoffPackageForWorkItem,
  observeSignoffPackageArtifacts,
  signOffWorkItem,
} from "./authority.ts";
export {
  adoptArtifactProposal,
  readArtifactProposalTarget,
  rejectArtifactProposal,
  startStageRun,
  submitRunInput,
} from "./stage.ts";
