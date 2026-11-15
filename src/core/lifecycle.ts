import {
  type ArtifactRef,
  type ExecutionTask,
  type ExecutionTaskId,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunEventPayload,
  type StageCompletion,
  type UpstreamReturnStage,
  type ValidationClassification,
  type ValidationStage,
  type WorkItem,
  type WorkStage,
} from "./contracts.ts";
import { executionTaskIsEligible } from "./execution.ts";

export type { UpstreamReturnStage } from "./contracts.ts";

export const directlyEditableArtifactRoles = [
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
] as const;

export const artifactDirectEditIsAllowed = (
  workItem: Pick<WorkItem, "stage" | "status">,
  artifact: Pick<ArtifactRef, "role" | "authorityLayer">,
): boolean => {
  if (workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE") return false;
  if (!directlyEditableArtifactRoles.includes(
    artifact.role as (typeof directlyEditableArtifactRoles)[number],
  )) {
    return false;
  }
  const owner = artifactReturnOwner(artifact);
  return owner !== "R3" && stageRank(owner) <= stageRank(workItem.stage);
};

export const artifactReturnOwner = (
  artifact: Pick<ArtifactRef, "role" | "authorityLayer">,
): UpstreamReturnStage => {
  if (artifact.role === "PROJECT_MANIFEST" || artifact.role === "R1") return "R1";
  if (
    artifact.role === "R2" ||
    artifact.authorityLayer === "P0" ||
    artifact.authorityLayer === "P1" ||
    artifact.authorityLayer === "P2" ||
    artifact.authorityLayer === "P3"
  ) return "R2";
  if (
    artifact.role === "DESIGN" ||
    artifact.authorityLayer === "P4" ||
    artifact.authorityLayer === "P5" ||
    artifact.authorityLayer === "P6"
  ) return "DESIGN";
  if (artifact.role === "R3") return "R3";
  if (
    artifact.role === "PLAN" ||
    artifact.role === "VERIFICATION_MATERIAL" ||
    artifact.authorityLayer === "P7" ||
    artifact.authorityLayer === "P8"
  ) return "PLAN";
  return "DESIGN";
};

export const stageOrder: readonly WorkStage[] = [
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
  "AWAITING_SIGNOFF",
  "EXECUTION",
  "COMPLETE",
];

export const stageRank = (stage: WorkStage): number => stageOrder.indexOf(stage);

export const earliestStage = (stages: readonly WorkStage[]): WorkStage | null => {
  if (stages.length === 0) return null;
  return [...stages].sort((left, right) => stageRank(left) - stageRank(right))[0] ?? null;
};

export const evaluateStageCompletion = (
  workItem: WorkItem,
  completion: StageCompletion,
  allowedR1Completions: readonly StageCompletion["outcome"][] | null,
): Readonly<Pick<WorkItem, "stage" | "status" | "outcome">> => {
  if (workItem.stage !== completion.stage) {
    throw new TypeError(`completion stage ${completion.stage} does not own work item stage ${workItem.stage}`);
  }

  switch (completion.stage) {
    case "R1":
      if (
        allowedR1Completions === null ||
        !allowedR1Completions.includes(completion.outcome)
      ) {
        throw new TypeError(
          `R1 outcome ${completion.outcome} is invalid for schema ${workItem.schemaId}`,
        );
      }
      return completion.outcome === "CONFIRMED"
        ? { stage: "R2", status: "ACTIVE", outcome: null }
        : { stage: "COMPLETE", status: "COMPLETE", outcome: completion.outcome };
    case "R2":
      return { stage: "DESIGN", status: "ACTIVE", outcome: null };
    case "DESIGN":
      return { stage: "PLAN", status: "ACTIVE", outcome: null };
    case "PLAN":
      return { stage: "R3", status: "ACTIVE", outcome: null };
    case "R3":
      switch (completion.outcome) {
        case "READY_FOR_SIGNOFF":
          return { stage: "AWAITING_SIGNOFF", status: "ACTIVE", outcome: null };
        case "RETURN_TO_RESEARCH":
          return { stage: "R1", status: "ACTIVE", outcome: null };
        case "RETURN_TO_REQUIREMENTS":
          return { stage: "R2", status: "ACTIVE", outcome: null };
        case "RETURN_TO_DESIGN":
          return { stage: "DESIGN", status: "ACTIVE", outcome: null };
        case "RETURN_TO_PLAN":
          return { stage: "PLAN", status: "ACTIVE", outcome: null };
      }
  }

  throw new TypeError("unsupported stage completion");
};

const sourceChangeLifecycleState = (
  workItem: WorkItem,
): Readonly<Pick<WorkItem, "stage" | "status" | "outcome">> =>
  workItem.stage === "COMPLETE"
    ? { stage: "COMPLETE", status: "COMPLETE", outcome: workItem.outcome }
    : workItem.stage === "IDEA"
      ? { stage: "IDEA", status: "ACTIVE", outcome: null }
      : { stage: "R1", status: "ACTIVE", outcome: null };

export const routeValidationFailure = (
  classification:
    | ValidationClassification
    | "PRECONDITION_FAILED"
    | "BLOCKED_FOR_REANALYSIS",
  reanalysisReturnTo?: "R1" | "R2" | "DESIGN" | "PLAN",
): UpstreamReturnStage | null => {
  switch (classification) {
    case "SPEC_INVALID":
    case "SCOPE_BREACH":
      return "PLAN";
    case "GOVERNANCE_BREACH":
      return "DESIGN";
    case "APPROVAL_STALE":
      return null;
    case "BLOCKED_FOR_REANALYSIS":
      if (!reanalysisReturnTo) throw new TypeError("reanalysis failure requires returnTo");
      return reanalysisReturnTo;
    default:
      return null;
  }
};

export const routeApprovalStale = (
  changedMaterialOwners: readonly UpstreamReturnStage[],
): UpstreamReturnStage => {
  const earliest = earliestStage(changedMaterialOwners);
  if (
    earliest === "R1" ||
    earliest === "R2" ||
    earliest === "DESIGN" ||
    earliest === "PLAN" ||
    earliest === "R3"
  ) {
    return earliest;
  }
  throw new TypeError("approval-stale routing requires at least one resolved material owner");
};


export type ReachState = "CURRENT" | "REACHED_HISTORICAL" | "UNREACHED";

export type StageRunInteraction =
  | Readonly<{ tag: "PROCESSING" }>
  | Readonly<{ tag: "OPEN" }>
  | Readonly<{ tag: "REQUIRED_INPUT"; requestEventId: RunEventId }>
  | Readonly<{ tag: "CLOSED" }>;

export type ProposalDecision =
  | Readonly<{ tag: "NONE" }>
  | Readonly<{ tag: "PENDING"; proposalEventId: RunEventId }>
  | Readonly<{ tag: "ADOPTION_IN_PROGRESS"; proposalEventId: RunEventId }>;

export type MaterialCurrentness =
  | Readonly<{ tag: "CURRENT" }>
  | Readonly<{ tag: "STALE"; owner: UpstreamReturnStage }>;

export type ExecutionOwner =
  | Readonly<{ tag: "NONE" }>
  | Readonly<{ tag: "CURRENT_TASK"; taskId: ExecutionTaskId }>
  | Readonly<{ tag: "BLOCKED_TASK"; taskId: ExecutionTaskId }>;

export type ValidationBoundary =
  | Readonly<{ tag: "NONE" }>
  | Readonly<{ tag: "PASSED_THROUGH"; stage: ValidationStage }>
  | Readonly<{
      tag: "FAILED_AT";
      stage: ValidationStage;
      classification: Extract<
        RunEventPayload,
        { readonly tag: "VALIDATION_FAILED" }
      >["classification"];
    }>
  | Readonly<{ tag: "COMPLETE" }>;

export type RecoveryDisposition =
  | Readonly<{ tag: "NONE" }>
  | Readonly<{ tag: "RETRY_CURRENT_STAGE" }>
  | Readonly<{ tag: "RESUME_CURRENT_OWNER" }>
  | Readonly<{ tag: "RECONCILE_AUTHORITY" }>;

export type ObservationCoherence = "COHERENT" | "CONVERGING";

export type CurrentAttentionTag =
  | "CONVERGING"
  | "MUTATION_CONFLICT"
  | "REQUIRED_INPUT"
  | "PROPOSAL_DECISION"
  | "PROPOSAL_ADOPTION"
  | "BLOCKER"
  | "RECOVERY"
  | "STALE_AUTHORITY"
  | "PROCESSING"
  | "ACTIONABLE"
  | "ORDINARY";

export type RailMarker =
  | "READY"
  | "PROCESSING"
  | "ACTION_REQUIRED"
  | "BLOCKED"
  | "STALE"
  | "COMPLETE";

export type WorkItemTransitionCause =
  | Readonly<{ tag: "START_RESEARCH" }>
  | Readonly<{ tag: "STAGE_COMPLETED"; completion: StageCompletion }>
  | Readonly<{ tag: "SOURCE_AUTHORITY_CHANGED" }>
  | Readonly<{ tag: "LIFECYCLE_ARTIFACT_CHANGED"; owner: UpstreamReturnStage }>
  | Readonly<{ tag: "BLOCK_CURRENT_OWNER" }>
  | Readonly<{ tag: "RESUME_CURRENT_OWNER" }>
  | Readonly<{ tag: "SIGN_OFF" }>
  | Readonly<{ tag: "RECONCILE_AUTHORITY"; owner: UpstreamReturnStage }>
  | Readonly<{ tag: "EXECUTION_RETURN"; owner: UpstreamReturnStage }>
  | Readonly<{
      tag: "EXECUTION_COMPLETED";
      outcome: "CANDIDATE_DONE" | "ALREADY_SATISFIED";
    }>;

export type WorkflowRailItem = Readonly<{
  stage: WorkStage;
  reach: ReachState;
  selected: boolean;
  marker: RailMarker | null;
}>;

const lifecycleTuple = (
  stage: WorkStage,
  status: WorkItem["status"],
  outcome: WorkItem["outcome"],
): Readonly<Pick<WorkItem, "stage" | "status" | "outcome">> => ({
  stage,
  status,
  outcome,
});

const requireActiveOwner = (workItem: WorkItem): void => {
  if (workItem.stage === "COMPLETE" || workItem.status === "COMPLETE") {
    throw new TypeError("completed WorkItem has no mutable lifecycle owner");
  }
};

export const transitionWorkItem = (
  workItem: WorkItem,
  cause: WorkItemTransitionCause,
  allowedR1Completions: readonly StageCompletion["outcome"][] | null = null,
): Readonly<Pick<WorkItem, "stage" | "status" | "outcome">> => {
  switch (cause.tag) {
    case "START_RESEARCH":
      if (workItem.stage !== "IDEA" || workItem.status !== "ACTIVE") {
        throw new TypeError("START_RESEARCH requires IDEA / ACTIVE");
      }
      return lifecycleTuple("R1", "ACTIVE", null);
    case "STAGE_COMPLETED":
      return evaluateStageCompletion(
        workItem,
        cause.completion,
        allowedR1Completions,
      );
    case "SOURCE_AUTHORITY_CHANGED":
      return sourceChangeLifecycleState(workItem);
    case "LIFECYCLE_ARTIFACT_CHANGED":
      requireActiveOwner(workItem);
      if (cause.owner === "R3" && stageRank(workItem.stage) < stageRank("R3")) {
        throw new TypeError("lifecycle artifact owner has not been reached");
      }
      return lifecycleTuple(cause.owner, "ACTIVE", null);
    case "BLOCK_CURRENT_OWNER":
      requireActiveOwner(workItem);
      if (workItem.status !== "ACTIVE") {
        throw new TypeError("BLOCK_CURRENT_OWNER requires ACTIVE owner");
      }
      return lifecycleTuple(workItem.stage, "BLOCKED", null);
    case "RESUME_CURRENT_OWNER":
      requireActiveOwner(workItem);
      if (workItem.status !== "BLOCKED") {
        throw new TypeError("RESUME_CURRENT_OWNER requires BLOCKED owner");
      }
      return lifecycleTuple(workItem.stage, "ACTIVE", null);
    case "SIGN_OFF":
      if (workItem.stage !== "AWAITING_SIGNOFF" || workItem.status !== "ACTIVE") {
        throw new TypeError("SIGN_OFF requires AWAITING_SIGNOFF / ACTIVE");
      }
      return lifecycleTuple("EXECUTION", "ACTIVE", null);
    case "RECONCILE_AUTHORITY":
      if (workItem.stage !== "AWAITING_SIGNOFF" || workItem.status !== "ACTIVE") {
        throw new TypeError("RECONCILE_AUTHORITY requires AWAITING_SIGNOFF / ACTIVE");
      }
      return lifecycleTuple(cause.owner, "ACTIVE", null);
    case "EXECUTION_RETURN":
      if (workItem.stage !== "EXECUTION") {
        throw new TypeError("EXECUTION_RETURN requires EXECUTION owner");
      }
      return lifecycleTuple(cause.owner, "ACTIVE", null);
    case "EXECUTION_COMPLETED":
      if (workItem.stage !== "EXECUTION") {
        throw new TypeError("EXECUTION_COMPLETED requires EXECUTION owner");
      }
      return lifecycleTuple("COMPLETE", "COMPLETE", cause.outcome);
  }
};

const orderedEvents = (
  run: Pick<Run, "id">,
  events: readonly RunEvent[],
): readonly RunEvent[] => {
  const sorted = [...events].sort(
    (left, right) => left.sequence - right.sequence || left.id.localeCompare(right.id),
  );
  let prior = 0;
  const ids = new Set<RunEventId>();
  for (const event of sorted) {
    if (event.runId !== run.id) {
      throw new TypeError("RunEvent belongs to another Run");
    }
    if (event.sequence <= prior || ids.has(event.id)) {
      throw new TypeError("RunEvent history is not strictly ordered");
    }
    prior = event.sequence;
    ids.add(event.id);
  }
  return sorted;
};

const unresolvedInputRequests = (
  events: readonly RunEvent[],
): readonly RunEvent[] => {
  let pending: RunEvent | null = null;
  for (const event of events) {
    if (event.event.tag === "HUMAN_INPUT_REQUESTED") {
      if (pending !== null) {
        throw new TypeError("STAGE Run has multiple unresolved input requests");
      }
      pending = event;
      continue;
    }
    if (event.event.tag !== "HUMAN_INPUT_RECEIVED") continue;

    if (event.event.requestEventId === null) {
      if (pending !== null) {
        throw new TypeError(
          "free-form human input cannot bypass a required input request",
        );
      }
      continue;
    }
    if (
      pending === null ||
      pending.id !== event.event.requestEventId
    ) {
      throw new TypeError(
        "human input response must bind the exact current required request",
      );
    }
    pending = null;
  }
  return pending === null ? [] : [pending];
};

export const stageRunInteraction = (
  run: Run,
  events: readonly RunEvent[],
): StageRunInteraction => {
  if (run.role !== "STAGE") {
    throw new TypeError("stageRunInteraction requires a STAGE Run");
  }
  const history = orderedEvents(run, events);
  if (
    run.status === "COMPLETED" ||
    run.status === "BLOCKED" ||
    run.status === "FAILED" ||
    run.status === "CANCELLED"
  ) {
    return { tag: "CLOSED" };
  }

  const started = history.filter((event) => event.event.tag === "STAGE_STARTED");
  if (
    started.length !== 1 ||
    started[0]?.event.tag !== "STAGE_STARTED" ||
    started[0].event.stage !== run.stage
  ) {
    throw new TypeError("active STAGE Run requires exactly one matching STAGE_STARTED");
  }

  const unresolved = unresolvedInputRequests(history);
  if (unresolved.length > 1) {
    throw new TypeError("STAGE Run has multiple unresolved input requests");
  }
  if (run.status === "WAITING_FOR_INPUT") {
    const request = unresolved[0];
    if (request === undefined) {
      throw new TypeError("WAITING_FOR_INPUT requires one unresolved request");
    }
    return { tag: "REQUIRED_INPUT", requestEventId: request.id };
  }
  if (unresolved.length !== 0) {
    throw new TypeError("RUNNING STAGE Run cannot have unresolved required input");
  }

  const triggerIndex = history.findLastIndex(
    (event) =>
      event.event.tag === "STAGE_STARTED" ||
      event.event.tag === "HUMAN_INPUT_RECEIVED",
  );
  if (triggerIndex < 0) {
    throw new TypeError("STAGE Run has no provider-turn trigger");
  }
  const result = history
    .slice(triggerIndex + 1)
    .filter((event) => event.event.tag !== "PROVIDER_DIAGNOSTICS_RECORDED");
  if (result.length === 0) return { tag: "PROCESSING" };
  if (
    result.some(
      (event) =>
        event.event.tag === "STAGE_BLOCKED" ||
        event.event.tag === "STAGE_COMPLETED",
    )
  ) {
    throw new TypeError("active STAGE Run contains terminal provider control");
  }
  return { tag: "OPEN" };
};

export const stageInputIsAdmitted = (
  interaction: StageRunInteraction,
  requestEventId: RunEventId | null,
): boolean => {
  switch (interaction.tag) {
    case "OPEN":
      return requestEventId === null;
    case "REQUIRED_INPUT":
      return requestEventId === interaction.requestEventId;
    case "PROCESSING":
    case "CLOSED":
      return false;
  }
};

const lifecycleProposalPayload = (
  run: Run,
  payload: RunEventPayload,
): payload is Extract<RunEventPayload, { tag: "ARTIFACT_PROPOSAL_CREATED" }> => {
  if (payload.tag !== "ARTIFACT_PROPOSAL_CREATED") return false;
  if (
    run.stage !== "R1" &&
    run.stage !== "R2" &&
    run.stage !== "DESIGN" &&
    run.stage !== "PLAN" &&
    run.stage !== "R3"
  ) {
    throw new TypeError("lifecycle proposal requires a lifecycle artifact-owning stage");
  }
  return true;
};

export const deriveProposalDecision = (
  events: readonly RunEvent[],
): ProposalDecision => {
  const created = events.filter(
    (event) => event.event.tag === "ARTIFACT_PROPOSAL_CREATED",
  );
  const dispositions = events.filter(
    (event) => event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED",
  );
  const adoptions = events.filter(
    (event) => event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
  );
  const proposalById = new Map(created.map((proposal) => [proposal.id, proposal] as const));

  for (const control of [...dispositions, ...adoptions]) {
    const proposalEventId =
      control.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" ||
      control.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED"
        ? control.event.proposalEventId
        : null;
    const proposal = proposalEventId === null
      ? undefined
      : proposalById.get(proposalEventId);
    if (proposal === undefined) {
      throw new TypeError("proposal control event references unknown proposal");
    }
    if (control.sequence <= proposal.sequence) {
      throw new TypeError("proposal control event precedes its proposal");
    }
  }

  for (const proposal of created) {
    const proposalDispositions = dispositions.filter(
      (event) =>
        event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
        event.event.proposalEventId === proposal.id,
    );
    const proposalAdoptions = adoptions.filter(
      (event) =>
        event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" &&
        event.event.proposalEventId === proposal.id,
    );
    if (proposalDispositions.length > 1) {
      throw new TypeError("proposal has duplicate disposition");
    }
    if (proposalAdoptions.length > 1) {
      throw new TypeError("proposal has duplicate adoption intent");
    }

    const disposition = proposalDispositions[0];
    const adoption = proposalAdoptions[0];
    if (
      disposition !== undefined &&
      adoption !== undefined &&
      adoption.sequence >= disposition.sequence
    ) {
      throw new TypeError("proposal adoption intent must precede disposition");
    }
    if (
      disposition?.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
      disposition.event.disposition === "ADOPTED" &&
      adoption === undefined
    ) {
      throw new TypeError("adopted proposal requires durable adoption intent");
    }
    if (
      disposition?.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
      disposition.event.disposition === "REJECTED" &&
      adoption !== undefined
    ) {
      throw new TypeError("rejected proposal cannot have adoption intent");
    }
  }

  const unresolved = created.filter(
    (proposal) =>
      !dispositions.some(
        (event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
          event.event.proposalEventId === proposal.id,
      ),
  );
  if (unresolved.length === 0) return { tag: "NONE" };
  if (unresolved.length !== 1) {
    throw new TypeError("Run has multiple unresolved lifecycle proposals");
  }
  const proposal = unresolved[0]!;
  const adoption = adoptions.filter(
    (event) =>
      event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" &&
      event.event.proposalEventId === proposal.id,
  );
  return adoption.length === 1
    ? { tag: "ADOPTION_IN_PROGRESS", proposalEventId: proposal.id }
    : { tag: "PENDING", proposalEventId: proposal.id };
};

export const validateStageProviderTurn = (
  run: Run,
  priorEvents: readonly RunEvent[],
  payloads: readonly RunEventPayload[],
): void => {
  if (run.role !== "STAGE" || run.status !== "RUNNING") {
    throw new TypeError("provider turn requires RUNNING STAGE Run");
  }
  if (payloads.length === 0) {
    throw new TypeError("STAGE provider result must be non-empty");
  }
  if (stageRunInteraction(run, priorEvents).tag !== "PROCESSING") {
    throw new TypeError("STAGE provider result requires PROCESSING interaction");
  }

  const input = payloads.filter((payload) => payload.tag === "HUMAN_INPUT_REQUESTED");
  const blocked = payloads.filter((payload) => payload.tag === "STAGE_BLOCKED");
  const completed = payloads.filter((payload) => payload.tag === "STAGE_COMPLETED");
  const proposals = payloads.filter((payload) => lifecycleProposalPayload(run, payload));
  if (input.length > 1 || blocked.length > 1 || completed.length > 1) {
    throw new TypeError("STAGE provider turn contains duplicate controlling events");
  }
  const controlling = Number(input.length > 0) + Number(blocked.length > 0) +
    Number(completed.length > 0);
  if (controlling > 1) {
    throw new TypeError("STAGE provider turn contains contradictory controlling events");
  }
  if (proposals.length > 1) {
    throw new TypeError("STAGE provider turn contains multiple lifecycle proposals");
  }
  if (proposals.length === 1 && controlling !== 0) {
    throw new TypeError("lifecycle proposal cannot coexist with a controlling event");
  }
  if (
    proposals.length === 1 &&
    deriveProposalDecision(priorEvents).tag !== "NONE"
  ) {
    throw new TypeError("Run already has an unresolved lifecycle proposal");
  }
  const proposal = proposals[0];
  if (
    proposal?.tag === "ARTIFACT_PROPOSAL_CREATED" &&
    proposal.role !== run.stage
  ) {
    throw new TypeError("lifecycle proposal role must equal owning Run stage");
  }
  const completion = completed[0];
  if (
    completion?.tag === "STAGE_COMPLETED" &&
    completion.completion.stage !== run.stage
  ) {
    throw new TypeError("STAGE_COMPLETED stage must equal owning Run stage");
  }
  const block = blocked[0];
  if (
    block?.tag === "STAGE_BLOCKED" &&
    block.owningStage !== run.stage
  ) {
    throw new TypeError("STAGE_BLOCKED owner must equal owning Run stage");
  }
};

const completionDestination = (completion: StageCompletion): WorkStage => {
  switch (completion.stage) {
    case "R1":
      return completion.outcome === "CONFIRMED" ? "R2" : "COMPLETE";
    case "R2":
      return "DESIGN";
    case "DESIGN":
      return "PLAN";
    case "PLAN":
      return "R3";
    case "R3":
      switch (completion.outcome) {
        case "READY_FOR_SIGNOFF": return "AWAITING_SIGNOFF";
        case "RETURN_TO_RESEARCH": return "R1";
        case "RETURN_TO_REQUIREMENTS": return "R2";
        case "RETURN_TO_DESIGN": return "DESIGN";
        case "RETURN_TO_PLAN": return "PLAN";
      }
  }
};

const artifactOwnerStage = (artifact: ArtifactRef): WorkStage | null =>
  artifact.role === "R1" ||
  artifact.role === "R2" ||
  artifact.role === "DESIGN" ||
  artifact.role === "PLAN" ||
  artifact.role === "R3"
    ? artifact.role
    : null;

export const deriveReachedStages = (
  workItem: WorkItem,
  runs: readonly Run[],
  events: readonly RunEvent[],
  artifacts: readonly ArtifactRef[],
  tasks: readonly ExecutionTask[],
): ReadonlySet<WorkStage> => {
  const reached = new Set<WorkStage>(["IDEA", workItem.stage]);
  for (const run of runs) {
    reached.add(run.stage);
    if (run.stage === "EXECUTION") {
      reached.add("AWAITING_SIGNOFF");
      reached.add("EXECUTION");
    }
  }
  for (const artifact of artifacts) {
    const owner = artifactOwnerStage(artifact);
    if (owner !== null) reached.add(owner);
  }
  for (const event of events) {
    if (event.event.tag === "STAGE_COMPLETED") {
      reached.add(event.event.completion.stage);
      reached.add(completionDestination(event.event.completion));
    }
  }
  if (tasks.length > 0) {
    reached.add("AWAITING_SIGNOFF");
    reached.add("EXECUTION");
  }
  if (workItem.stage === "COMPLETE") reached.add("COMPLETE");
  return reached;
};

export const reachStateForStage = (
  workItem: Pick<WorkItem, "stage">,
  reached: ReadonlySet<WorkStage>,
  stage: WorkStage,
): ReachState =>
  stage === workItem.stage
    ? "CURRENT"
    : reached.has(stage)
      ? "REACHED_HISTORICAL"
      : "UNREACHED";

export const normalizeMaterialCurrentness = (
  current: boolean,
  changedMaterialOwners: readonly UpstreamReturnStage[],
): MaterialCurrentness => {
  if (current) return { tag: "CURRENT" };
  const owner = earliestStage(changedMaterialOwners);
  if (
    owner !== "R1" &&
    owner !== "R2" &&
    owner !== "DESIGN" &&
    owner !== "PLAN" &&
    owner !== "R3"
  ) {
    throw new TypeError("stale material requires an owning lifecycle stage");
  }
  return { tag: "STALE", owner };
};

export const deriveExecutionOwner = (
  tasks: readonly ExecutionTask[],
  runs: readonly Run[],
): ExecutionOwner => {
  const blocked = tasks.find((task) => task.state === "BLOCKED");
  if (blocked !== undefined) return { tag: "BLOCKED_TASK", taskId: blocked.id };

  const running = tasks.find((task) => task.state === "RUNNING");
  if (running !== undefined) return { tag: "CURRENT_TASK", taskId: running.id };

  const activeTaskId = [...runs]
    .filter(
      (run) =>
        run.executionTaskId !== null &&
        (run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"),
    )
    .sort((left, right) => right.attempt - left.attempt)
    .at(0)?.executionTaskId ?? null;
  if (activeTaskId !== null) {
    return { tag: "CURRENT_TASK", taskId: activeTaskId };
  }

  const eligible = tasks.find((task) => executionTaskIsEligible(task, tasks));
  return eligible === undefined
    ? { tag: "NONE" }
    : { tag: "CURRENT_TASK", taskId: eligible.id };
};

const validationOrder: readonly ValidationStage[] = [
  "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
];

const validationBoundaryFromEvents = (
  validationEvents: readonly RunEvent[],
): ValidationBoundary => {
  const failure = [...validationEvents]
    .filter((event) => event.event.tag === "VALIDATION_FAILED")
    .at(-1);
  if (failure?.event.tag === "VALIDATION_FAILED") {
    return {
      tag: "FAILED_AT",
      stage: failure.event.stage,
      classification: failure.event.classification,
    };
  }

  const passed = new Set(
    validationEvents.flatMap((event) =>
      event.event.tag === "VALIDATION_PASSED" ? [event.event.stage] : [],
    ),
  );
  let last: ValidationStage | null = null;
  for (const stage of validationOrder) {
    if (!passed.has(stage)) break;
    last = stage;
  }
  return last === null ? { tag: "NONE" } : { tag: "PASSED_THROUGH", stage: last };
};

export const deriveValidationBoundary = (
  owner: ExecutionOwner,
  tasks: readonly ExecutionTask[],
  runs: readonly Run[],
  events: readonly RunEvent[],
): ValidationBoundary => {
  if (owner.tag === "NONE") return { tag: "NONE" };
  const task = tasks.find((candidate) => candidate.id === owner.taskId);
  if (task === undefined) throw new TypeError("execution owner task is missing");
  if (task.state === "CANDIDATE_DONE" || task.state === "ALREADY_SATISFIED") {
    return { tag: "COMPLETE" };
  }

  const taskRuns = [...runs]
    .filter((candidate) => candidate.executionTaskId === task.id)
    .sort(
      (left, right) =>
        left.attempt - right.attempt ||
        left.startedAt.localeCompare(right.startedAt) ||
        left.id.localeCompare(right.id),
    );
  const run = taskRuns.at(-1);
  if (run === undefined) return { tag: "NONE" };
  const runEvents = events
    .filter((event) => event.runId === run.id)
    .sort((left, right) => left.sequence - right.sequence);

  const ownFailure = runEvents.findLast(
    (event) => event.event.tag === "VALIDATION_FAILED",
  );
  if (ownFailure?.event.tag === "VALIDATION_FAILED") {
    return {
      tag: "FAILED_AT",
      stage: ownFailure.event.stage,
      classification: ownFailure.event.classification,
    };
  }

  const candidate = runEvents.findLast(
    (event) => event.event.tag === "CANDIDATE_STATE_RECORDED",
  );
  if (candidate !== undefined) {
    return { tag: "NONE" };
  }

  if (run.role === "REMEDIATOR") {
    if (run.triggerEventId === null) {
      throw new TypeError("REMEDIATOR validation boundary requires triggering failure");
    }
    const trigger = events.find((event) => event.id === run.triggerEventId);
    if (trigger?.event.tag !== "VALIDATION_FAILED") {
      throw new TypeError("REMEDIATOR trigger must identify VALIDATION_FAILED");
    }
    if (!taskRuns.some((taskRun) => taskRun.id === trigger.runId)) {
      throw new TypeError("REMEDIATOR failure must belong to the current ExecutionTask");
    }
    return {
      tag: "FAILED_AT",
      stage: trigger.event.stage,
      classification: trigger.event.classification,
    };
  }

  if (run.role === "REVIEWER") {
    if (run.triggerEventId === null) {
      throw new TypeError("REVIEWER validation boundary requires candidate trigger");
    }
    const candidateEvent = events.find((event) => event.id === run.triggerEventId);
    if (candidateEvent?.event.tag !== "CANDIDATE_STATE_RECORDED") {
      throw new TypeError("REVIEWER trigger must identify CANDIDATE_STATE_RECORDED");
    }
    const candidateRun = taskRuns.find(
      (candidateRun) => candidateRun.id === candidateEvent.runId,
    );
    if (
      candidateRun === undefined ||
      (candidateRun.role !== "BUILDER" && candidateRun.role !== "REMEDIATOR")
    ) {
      throw new TypeError("REVIEWER candidate must belong to the current ExecutionTask");
    }
    const reviewerRuns = taskRuns.filter(
      (candidateRun) =>
        candidateRun.role === "REVIEWER" &&
        candidateRun.triggerEventId === run.triggerEventId,
    );
    const candidateValidationEvents = reviewerRuns.flatMap((candidateRun) =>
      events
        .filter((event) => event.runId === candidateRun.id)
        .sort((left, right) => left.sequence - right.sequence)
    );
    return validationBoundaryFromEvents(candidateValidationEvents);
  }

  return validationBoundaryFromEvents(runEvents);
};

const latestCurrentStageRun = (
  workItem: Pick<WorkItem, "stage">,
  runs: readonly Run[],
): Run | null =>
  [...runs]
    .filter((run) => run.role === "STAGE" && run.stage === workItem.stage)
    .sort(
      (left, right) =>
        right.attempt - left.attempt ||
        right.startedAt.localeCompare(left.startedAt) ||
        right.id.localeCompare(left.id),
    )
    .at(0) ?? null;

export const deriveRecoveryDisposition = (
  workItem: WorkItem,
  runs: readonly Run[],
  currentness: MaterialCurrentness,
): RecoveryDisposition => {
  if (currentness.tag === "STALE") return { tag: "RECONCILE_AUTHORITY" };
  if (workItem.status === "BLOCKED") return { tag: "RESUME_CURRENT_OWNER" };
  const latest = latestCurrentStageRun(workItem, runs);
  if (
    latest !== null &&
    workItem.status === "ACTIVE" &&
    (latest.status === "FAILED" || latest.status === "CANCELLED")
  ) {
    return { tag: "RETRY_CURRENT_STAGE" };
  }
  return { tag: "NONE" };
};

export const deriveObservationCoherence = (
  workItem: WorkItem,
  runs: readonly Run[],
  events: readonly RunEvent[],
  tasks: readonly ExecutionTask[],
): ObservationCoherence => {
  const active = (run: Run): boolean =>
    run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT";

  if (
    runs.some((run) =>
      run.role === "STAGE" &&
      active(run) &&
      run.stage !== workItem.stage
    )
  ) {
    return "CONVERGING";
  }

  const currentStageRun = latestCurrentStageRun(workItem, runs);
  if (currentStageRun !== null) {
    const runEvents = events.filter((event) => event.runId === currentStageRun.id);
    const completion = runEvents.findLast((event) => event.event.tag === "STAGE_COMPLETED");
    if (completion?.event.tag === "STAGE_COMPLETED") {
      return "CONVERGING";
    }
    const block = runEvents.findLast((event) => event.event.tag === "STAGE_BLOCKED");
    if (
      block?.event.tag === "STAGE_BLOCKED" &&
      workItem.status === "ACTIVE"
    ) {
      return "CONVERGING";
    }
  }

  for (const run of runs) {
    if (run.executionTaskId === null) continue;
    const task = tasks.find((candidate) => candidate.id === run.executionTaskId);
    if (active(run)) {
      if (
        workItem.stage !== "EXECUTION" ||
        task === undefined ||
        task.state !== "RUNNING"
      ) {
        return "CONVERGING";
      }
      continue;
    }
    if (task?.state === "RUNNING") return "CONVERGING";
  }

  for (const task of tasks) {
    if (
      task.state === "RUNNING" &&
      !runs.some((run) => run.executionTaskId === task.id && active(run))
    ) {
      return "CONVERGING";
    }
    if (
      task.state === "BLOCKED" &&
      workItem.stage === "EXECUTION" &&
      workItem.status === "ACTIVE"
    ) {
      return "CONVERGING";
    }
  }
  if (
    workItem.stage === "EXECUTION" &&
    workItem.status === "BLOCKED" &&
    !tasks.some((task) => task.state === "BLOCKED")
  ) {
    return "CONVERGING";
  }

  return "COHERENT";
};

export const deriveCurrentAttention = (input: Readonly<{
  workItem: WorkItem;
  coherence: ObservationCoherence;
  mutationConflict: boolean;
  stageInteraction: StageRunInteraction | null;
  proposal: ProposalDecision;
  recovery: RecoveryDisposition;
  currentness: MaterialCurrentness;
  executionOwner: ExecutionOwner;
  automaticWorkActive: boolean;
  ordinaryActionAvailable: boolean;
}>): CurrentAttentionTag => {
  if (input.coherence === "CONVERGING") return "CONVERGING";
  if (input.mutationConflict) return "MUTATION_CONFLICT";
  if (input.stageInteraction?.tag === "REQUIRED_INPUT") return "REQUIRED_INPUT";
  if (input.proposal.tag === "PENDING") return "PROPOSAL_DECISION";
  if (input.proposal.tag === "ADOPTION_IN_PROGRESS") return "PROPOSAL_ADOPTION";
  if (
    input.workItem.status === "BLOCKED" ||
    input.executionOwner.tag === "BLOCKED_TASK"
  ) return "BLOCKER";
  if (input.currentness.tag === "STALE") return "STALE_AUTHORITY";
  if (input.recovery.tag !== "NONE") return "RECOVERY";
  if (
    input.stageInteraction?.tag === "PROCESSING" ||
    input.automaticWorkActive
  ) return "PROCESSING";
  if (input.ordinaryActionAvailable) return "ACTIONABLE";
  return "ORDINARY";
};

const railMarkerForCurrent = (
  workItem: WorkItem,
  attention: CurrentAttentionTag,
  recovery: RecoveryDisposition,
): RailMarker => {
  if (workItem.stage === "COMPLETE") return "COMPLETE";
  if (attention === "STALE_AUTHORITY") return "STALE";
  if (attention === "BLOCKER") return "BLOCKED";
  if (
    attention === "REQUIRED_INPUT" ||
    attention === "PROPOSAL_DECISION" ||
    attention === "MUTATION_CONFLICT" ||
    recovery.tag === "RETRY_CURRENT_STAGE" ||
    recovery.tag === "RESUME_CURRENT_OWNER" ||
    recovery.tag === "RECONCILE_AUTHORITY"
  ) return "ACTION_REQUIRED";
  if (
    attention === "PROCESSING" ||
    attention === "PROPOSAL_ADOPTION" ||
    attention === "CONVERGING"
  ) return "PROCESSING";
  return "READY";
};

export const deriveWorkflowRail = (
  workItem: WorkItem,
  reached: ReadonlySet<WorkStage>,
  attention: CurrentAttentionTag,
  recovery: RecoveryDisposition,
  selectedStage: WorkStage,
): readonly WorkflowRailItem[] =>
  stageOrder.map((stage) => {
    const reach = reachStateForStage(workItem, reached, stage);
    return {
      stage,
      reach,
      selected: stage === selectedStage,
      marker: reach === "CURRENT"
        ? railMarkerForCurrent(workItem, attention, recovery)
        : null,
    };
  });
