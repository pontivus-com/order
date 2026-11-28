import {
  CandidateMembersSchema,
  CandidateReviewEventSchema,
  type Approval,
  type CandidateMembers,
  type CandidateReviewEvent,
  type CandidateReviewEventId,
  type OrderHttpError,
  type Sha256,
  type ArtifactRef,
  type ExecutionTask,
  type ExecutionTaskId,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunEventPayload,
  type StageCompletion,
  type StageProviderBatchRejectionCode,
  type UpstreamReturnStage,
  type ValidationClassification,
  type ValidationStage,
  type WorkItem,
  type WorkStage,
} from "./contracts.ts";
import { canonicalJson } from "./canonical.ts";
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

export type MaterialPresentationState =
  | Readonly<{ tag: "DRAFT" }>
  | Readonly<{ tag: "UPDATED_VALIDATION_REQUIRED" }>
  | Readonly<{ tag: "CURRENT" }>
  | Readonly<{ tag: "STALE"; owner: UpstreamReturnStage }>
  | Readonly<{ tag: "HISTORICAL" }>
  | Readonly<{ tag: "SIGNED_LOCKED" }>;

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
    .filter(
      (event) =>
        event.event.tag !== "PROVIDER_DIAGNOSTICS_RECORDED" &&
        event.event.tag !== "AGENT_ACTIVITY_RECORDED",
    );
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

type ArtifactProposalPayload = Extract<
  RunEventPayload,
  { tag: "ARTIFACT_PROPOSAL_CREATED" }
>;

type PermanentAuthorityProposalAdmission = (
  proposal: ArtifactProposalPayload,
) => boolean;

const artifactProposalPayload = (
  run: Run,
  payload: RunEventPayload,
): payload is ArtifactProposalPayload => {
  if (payload.tag !== "ARTIFACT_PROPOSAL_CREATED") return false;
  if (
    run.stage !== "R1" &&
    run.stage !== "R2" &&
    run.stage !== "DESIGN" &&
    run.stage !== "PLAN" &&
    run.stage !== "R3"
  ) {
    throw new TypeError("artifact proposal requires a lifecycle artifact-owning stage");
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

export const stageRunCancellationIsAdmitted = (
  run: Run,
  events: readonly RunEvent[],
): boolean => {
  if (
    run.role !== "STAGE" ||
    (run.status !== "RUNNING" && run.status !== "WAITING_FOR_INPUT")
  ) {
    return false;
  }
  const interaction = stageRunInteraction(run, events);
  if (interaction.tag === "CLOSED") return false;
  return deriveProposalDecision(orderedEvents(run, events)).tag === "NONE";
};

export const stageProviderBatchRejectionCode = (
  run: Run,
  priorEvents: readonly RunEvent[],
  payloads: readonly RunEventPayload[],
  permanentAuthorityProposalIsAdmitted: PermanentAuthorityProposalAdmission =
    () => false,
): StageProviderBatchRejectionCode | null => {
  if (payloads.length === 0) return "EMPTY_BATCH";

  const messages = payloads.filter((payload) => payload.tag === "AGENT_MESSAGE_FINAL");
  const input = payloads.filter((payload) => payload.tag === "HUMAN_INPUT_REQUESTED");
  const blocked = payloads.filter((payload) => payload.tag === "STAGE_BLOCKED");
  const completed = payloads.filter((payload) => payload.tag === "STAGE_COMPLETED");
  const proposals = payloads.filter((payload) => artifactProposalPayload(run, payload));

  if (messages.length > 1) return "MULTIPLE_AGENT_MESSAGES";
  if (input.length > 1) return "MULTIPLE_REQUIRED_INPUT";
  if (blocked.length > 1) return "MULTIPLE_STAGE_BLOCK";
  if (completed.length > 1) return "MULTIPLE_STAGE_COMPLETION";

  const controlling =
    Number(input.length > 0) +
    Number(blocked.length > 0) +
    Number(completed.length > 0);
  if (controlling > 1) return "MULTIPLE_CONTROLS";
  if (proposals.length > 1) return "MULTIPLE_LIFECYCLE_PROPOSALS";
  if (proposals.length === 1 && controlling !== 0) return "PROPOSAL_WITH_CONTROL";
  if (proposals.length === 1 && deriveProposalDecision(priorEvents).tag !== "NONE") {
    return "UNRESOLVED_LIFECYCLE_PROPOSAL";
  }

  const proposal = proposals[0];
  if (proposal?.tag === "ARTIFACT_PROPOSAL_CREATED") {
    const lifecycleProposal = proposal.role === run.stage;
    const permanentAuthorityProposal =
      permanentAuthorityProposalIsAdmitted(proposal);
    if (!lifecycleProposal && !permanentAuthorityProposal) {
      return "PROPOSAL_ROLE_MISMATCH";
    }
  }

  const completion = completed[0];
  if (
    completion?.tag === "STAGE_COMPLETED" &&
    completion.completion.stage !== run.stage
  ) {
    return "COMPLETION_STAGE_MISMATCH";
  }

  const block = blocked[0];
  if (block?.tag === "STAGE_BLOCKED" && block.owningStage !== run.stage) {
    return "BLOCK_STAGE_MISMATCH";
  }

  if (
    controlling === 0 &&
    (
      messages.length !== 1 ||
      messages[0]?.tag !== "AGENT_MESSAGE_FINAL" ||
      messages[0].text.trim().length === 0
    )
  ) {
    return "OPEN_REQUIRES_AGENT_MESSAGE";
  }

  return null;
};

const stageProviderBatchRejectionMessage = (
  code: StageProviderBatchRejectionCode,
): string => {
  switch (code) {
    case "EMPTY_BATCH": return "STAGE provider result must be non-empty";
    case "MULTIPLE_AGENT_MESSAGES": return "STAGE provider turn contains multiple agent messages";
    case "MULTIPLE_REQUIRED_INPUT":
    case "MULTIPLE_STAGE_BLOCK":
    case "MULTIPLE_STAGE_COMPLETION":
      return "STAGE provider turn contains duplicate controlling events";
    case "MULTIPLE_CONTROLS": return "STAGE provider turn contains contradictory controlling events";
    case "MULTIPLE_LIFECYCLE_PROPOSALS": return "STAGE provider turn contains multiple lifecycle proposals";
    case "PROPOSAL_WITH_CONTROL": return "lifecycle proposal cannot coexist with a controlling event";
    case "UNRESOLVED_LIFECYCLE_PROPOSAL": return "Run already has an unresolved lifecycle proposal";
    case "PROPOSAL_ROLE_MISMATCH": return "lifecycle proposal role must equal owning Run stage or be an admitted permanent authority target";
    case "COMPLETION_STAGE_MISMATCH": return "STAGE_COMPLETED stage must equal owning Run stage";
    case "BLOCK_STAGE_MISMATCH": return "STAGE_BLOCKED owner must equal owning Run stage";
    case "OPEN_REQUIRES_AGENT_MESSAGE": return "OPEN STAGE provider turn requires exactly one non-blank agent message";
  }
};

export const isDurableDecisionRequest = (
  event: RunEventPayload,
): event is Extract<RunEventPayload, { tag: "HUMAN_INPUT_REQUESTED" }> =>
  event.tag === "HUMAN_INPUT_REQUESTED" &&
  (event.category === "STAGE_CHOICE" ||
    event.category === "AUTHORITY_DECISION" ||
    event.category === "AUTHORITY_CONFLICT");

export const durableDecisionCompletionIsAdmitted = (
  run: Run,
  events: readonly RunEvent[],
): boolean => {
  const history = orderedEvents(run, events);
  const durableRequests = new Set<RunEventId>();
  let latestAnsweredDurableSequence: number | null = null;
  for (const event of history) {
    if (isDurableDecisionRequest(event.event)) {
      durableRequests.add(event.id);
      continue;
    }
    if (
      event.event.tag === "HUMAN_INPUT_RECEIVED" &&
      event.event.requestEventId !== null &&
      durableRequests.has(event.event.requestEventId)
    ) {
      latestAnsweredDurableSequence = event.sequence;
    }
  }
  if (latestAnsweredDurableSequence === null) return true;

  const proposals = history.filter(
    (event) =>
      event.sequence > latestAnsweredDurableSequence &&
      event.event.tag === "ARTIFACT_PROPOSAL_CREATED",
  );
  return proposals.some((proposal) => {
    const adoption = history.find(
      (event) =>
        event.sequence > proposal.sequence &&
        event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" &&
        event.event.proposalEventId === proposal.id,
    );
    if (adoption === undefined) return false;
    return history.some(
      (event) =>
        event.sequence > adoption.sequence &&
        event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
        event.event.proposalEventId === proposal.id &&
        event.event.disposition === "ADOPTED",
    );
  });
};

export const validateStageProviderTurn = (
  run: Run,
  priorEvents: readonly RunEvent[],
  payloads: readonly RunEventPayload[],
  permanentAuthorityProposalIsAdmitted: PermanentAuthorityProposalAdmission =
    () => false,
): void => {
  if (run.role !== "STAGE" || run.status !== "RUNNING") {
    throw new TypeError("provider turn requires RUNNING STAGE Run");
  }
  if (stageRunInteraction(run, priorEvents).tag !== "PROCESSING") {
    throw new TypeError("STAGE provider result requires PROCESSING interaction");
  }

  const rejection = stageProviderBatchRejectionCode(
    run,
    priorEvents,
    payloads,
    permanentAuthorityProposalIsAdmitted,
  );
  if (rejection !== null) {
    throw new TypeError(stageProviderBatchRejectionMessage(rejection));
  }
  if (
    payloads.some((payload) => payload.tag === "STAGE_COMPLETED") &&
    !durableDecisionCompletionIsAdmitted(run, priorEvents)
  ) {
    throw new TypeError(
      "stage completion after durable decision input requires a later adopted canonical authority proposal",
    );
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

// Admission is a same-Run fact, independent of later material freshness.
export const admittedStageCompletion = (
  workItemId: WorkItem["id"],
  run: Run,
  events: readonly RunEvent[],
): Extract<RunEventPayload, { tag: "STAGE_COMPLETED" }> | null => {
  if (run.workItemId !== workItemId || run.role !== "STAGE" || run.status !== "COMPLETED") return null;
  const history = events.filter((event) => event.runId === run.id);
  const completions = history.filter((event) => event.event.tag === "STAGE_COMPLETED");
  const conformances = history.filter((event) => event.event.tag === "CONFORMANCE_PASSED");
  const completion = completions[0];
  const conformance = conformances[0];
  if (completions.length !== 1 || conformances.length !== 1 ||
      completion?.event.tag !== "STAGE_COMPLETED" ||
      conformance?.event.tag !== "CONFORMANCE_PASSED" ||
      history.some((event) => event.event.tag === "CONFORMANCE_FAILED" || event.event.tag === "STAGE_BLOCKED") ||
      completion.sequence >= conformance.sequence ||
      completion.event.completion.stage !== run.stage ||
      conformance.event.stage !== run.stage ||
      conformance.event.contextHash !== run.contextHash ||
      completion.event.artifactRefIds.length !== 1 ||
      conformance.event.outputArtifactRefIds.length !== 1 ||
      completion.event.artifactRefIds[0] !== conformance.event.outputArtifactRefIds[0]) return null;
  return completion.event;
};

// Terminal R1 is absorbing. A historical Approval is not evidence against
// a later admitted terminal R1, but two admitted terminal origins are inconsistent.
export const admittedTerminalR1Artifact = (
  workItem: WorkItem,
  runs: readonly Run[],
  events: readonly RunEvent[],
  artifacts: readonly ArtifactRef[],
  allowedR1Completions: readonly StageCompletion["outcome"][],
): ArtifactRef | null => {
  if (workItem.stage !== "COMPLETE") return null;
  const terminal = runs.flatMap((run) => {
    const completion = admittedStageCompletion(workItem.id, run, events);
    return completion?.completion.stage === "R1" && completion.completion.outcome !== "CONFIRMED"
      ? [completion] : [];
  });
  if (terminal.length === 0) return null;
  const completion = terminal[0]!;
  if (terminal.length !== 1 ||
      !allowedR1Completions.includes(completion.completion.outcome) ||
      completion.completion.outcome !== workItem.outcome) {
    throw new TypeError("ambiguous or inconsistent terminal R1 completion evidence");
  }
  const matches = artifacts.filter((artifact) =>
    artifact.id === completion.artifactRefIds[0] &&
    artifact.workItemId === workItem.id && artifact.role === "R1");
  if (matches.length !== 1) {
    throw new TypeError("terminal R1 completion lacks its exact output ArtifactRef");
  }
  return matches[0]!;
};

export const deriveReachedStages = (
  workItem: WorkItem,
  runs: readonly Run[],
  events: readonly RunEvent[],
  _artifacts: readonly ArtifactRef[],
  tasks: readonly ExecutionTask[],
): ReadonlySet<WorkStage> => {
  const reached = new Set<WorkStage>(["IDEA", workItem.stage]);
  for (const run of runs) {
    if (run.workItemId !== workItem.id) continue;
    reached.add(run.stage);
    if (run.stage === "EXECUTION") {
      reached.add("AWAITING_SIGNOFF");
      reached.add("EXECUTION");
    }
  }
  for (const run of runs) {
    const completion = admittedStageCompletion(workItem.id, run, events);
    if (completion !== null) reached.add(completionDestination(completion.completion));
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

export const deriveMaterialPresentationState = (
  isCurrentSemanticSnapshot: boolean,
  reach: ReachState,
  currentness: MaterialCurrentness,
  hasCurrentConformance: boolean,
  signedLocked: boolean,
): MaterialPresentationState => {
  if (signedLocked) {
    if (reach === "UNREACHED") {
      throw new TypeError("signed material must be reached");
    }
    return { tag: "SIGNED_LOCKED" };
  }
  if (!isCurrentSemanticSnapshot) return { tag: "HISTORICAL" };
  if (currentness.tag === "STALE") {
    return { tag: "STALE", owner: currentness.owner };
  }
  if (hasCurrentConformance) {
    if (reach === "UNREACHED") {
      throw new TypeError("unreached material cannot have current conformance");
    }
    return { tag: "CURRENT" };
  }
  return reach === "UNREACHED"
    ? { tag: "DRAFT" }
    : { tag: "UPDATED_VALIDATION_REQUIRED" };
};

export const materialCurrentnessForStage = (
  currentness: MaterialCurrentness,
  stage: UpstreamReturnStage,
): MaterialCurrentness =>
  currentness.tag === "STALE" &&
    stageRank(stage) >= stageRank(currentness.owner)
    ? currentness
    : { tag: "CURRENT" };

export const artifactHasCurrentStageConformance = (
  artifact: ArtifactRef,
  runs: readonly Run[],
  events: readonly RunEvent[],
): boolean => {
  const owner = artifactOwnerStage(artifact);
  if (
    owner !== "R1" &&
    owner !== "R2" &&
    owner !== "DESIGN" &&
    owner !== "PLAN" &&
    owner !== "R3"
  ) {
    return false;
  }
  return runs.some((run) => {
    if (run.stage !== owner) return false;
    const completion = admittedStageCompletion(artifact.workItemId, run, events);
    return completion !== null && completion.artifactRefIds[0] === artifact.id;
  });
};

// Task API projects approvals in canonical approvedAt/id order; the last group
// is the only authority for an active or successfully completed execution.
export const latestApprovalTasks = (tasks: readonly ExecutionTask[]): readonly ExecutionTask[] => {
  const approval = tasks.at(-1)?.approvalId;
  return approval === undefined ? [] : tasks.filter((task) => task.approvalId === approval);
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
        tasks.some((task) => task.id === run.executionTaskId) &&
        (run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"),
    )
    .sort((left, right) => right.attempt - left.attempt)
    .at(0)?.executionTaskId ?? null;
  if (activeTaskId !== null) {
    return { tag: "CURRENT_TASK", taskId: activeTaskId };
  }

  const successfulTaskIds = new Set(
    tasks
      .filter(
        (task) =>
          task.state === "CANDIDATE_DONE" ||
          task.state === "ALREADY_SATISFIED",
      )
      .map((task) => task.id),
  );
  const eligible = tasks.find(
    (task) =>
      task.state === "TODO" &&
      task.dependsOn.every((dependencyId) => successfulTaskIds.has(dependencyId)),
  );
  return eligible === undefined
    ? { tag: "NONE" }
    : { tag: "CURRENT_TASK", taskId: eligible.id };
};

// Task ordinals span BUILDER, REVIEWER and REMEDIATOR roles. Selection does
// not establish the execution owner or advance the validation boundary.
export const executionTaskRuns = (
  taskId: ExecutionTaskId,
  runs: readonly Run[],
): readonly Run[] => [...runs]
  .filter((run) => run.executionTaskId === taskId && run.stage === "EXECUTION" && run.role !== "STAGE")
  .sort((left, right) => left.attempt - right.attempt || left.id.localeCompare(right.id));

export const terminalExecutionFailureEvent = (
  run: Run,
  events: readonly RunEvent[],
): RunEvent | null => {
  const classification = run.terminalClassification;
  if ((run.status !== "BLOCKED" && run.status !== "FAILED") || classification === null ||
      run.stage !== "EXECUTION" || run.role === "STAGE") return null;
  return events.filter((event) => event.runId === run.id)
    .sort((left, right) => left.sequence - right.sequence)
    .findLast(({ event }) => {
      switch (event.tag) {
        case "VALIDATION_FAILED": return event.classification === classification;
        case "STAGE_BLOCKED": return classification === "PRECONDITION_FAILED" &&
          (run.role === "BUILDER" || run.role === "REMEDIATOR") && event.owningStage === "EXECUTION";
        case "PRODUCTIVE_INVOCATION_FAILED": return event.classification === classification;
        case "PROVIDER_FAILED": return classification === "PROVIDER_FAILURE";
        default: return false;
      }
    }) ?? null;
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

  let last: ValidationStage | null = null;
  let expectedIndex = 0;
  for (const { event } of validationEvents) {
    if (event.tag !== "VALIDATION_PASSED") continue;
    if (event.stage !== validationOrder[expectedIndex]) {
      throw new TypeError("validation passes must follow the current Run's ordered V0–V7 boundary");
    }
    last = event.stage;
    expectedIndex += 1;
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

  const taskRuns = executionTaskRuns(task.id, runs);
  if (new Set(taskRuns.map((candidate) => candidate.attempt)).size !== taskRuns.length) {
    throw new TypeError("current ExecutionTask has ambiguous Run ordinals");
  }
  const run = taskRuns.at(-1);
  if (run === undefined) return { tag: "NONE" };
  const runEvents = events
    .filter((event) => event.runId === run.id)
    .sort((left, right) => left.sequence - right.sequence);

  const causalRun = (trigger: RunEvent): Run => {
    const predecessor = taskRuns.find((candidate) => candidate.id === trigger.runId);
    if (predecessor === undefined || predecessor.attempt >= run.attempt ||
        predecessor.workItemId !== run.workItemId || predecessor.baselineCommit !== run.baselineCommit) {
      throw new TypeError("trigger must belong to an earlier Run of the current ExecutionTask and baseline");
    }
    return predecessor;
  };

  if (run.role === "REVIEWER") {
    const triggers = events.filter((event) => event.id === run.triggerEventId);
    const candidateEvent = triggers[0];
    if (triggers.length !== 1 || candidateEvent?.event.tag !== "CANDIDATE_STATE_RECORDED") {
      throw new TypeError("REVIEWER trigger must identify CANDIDATE_STATE_RECORDED");
    }
    const predecessor = causalRun(candidateEvent);
    if (predecessor.role !== "BUILDER" && predecessor.role !== "REMEDIATOR") {
      throw new TypeError("REVIEWER candidate must belong to the current ExecutionTask builder or remediator");
    }
    // A retry with the same candidate trigger starts its own independent proof.
    return validationBoundaryFromEvents(runEvents);
  }

  const ownFailure = runEvents.findLast(
    (event) => event.event.tag === "VALIDATION_FAILED",
  );
  if (ownFailure?.event.tag === "VALIDATION_FAILED") {
    return validationBoundaryFromEvents(runEvents);
  }

  const candidate = runEvents.findLast(
    (event) => event.event.tag === "CANDIDATE_STATE_RECORDED",
  );
  if (candidate !== undefined) return { tag: "NONE" };

  if (run.role === "REMEDIATOR") {
    const triggers = events.filter((event) => event.id === run.triggerEventId);
    const trigger = triggers[0];
    if (triggers.length !== 1 || trigger?.event.tag !== "VALIDATION_FAILED") {
      throw new TypeError("REMEDIATOR trigger must identify VALIDATION_FAILED");
    }
    causalRun(trigger);
    return {
      tag: "FAILED_AT",
      stage: trigger.event.stage,
      classification: trigger.event.classification,
    };
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
    (latest.status === "FAILED" || latest.status === "CANCELLED" || latest.status === "BLOCKED")
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
  if (currentStageRun !== null && active(currentStageRun)) {
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


// P6 §38.1 — exact successful proof and historical candidate reconstruction.
// No shell, provider, clock or digest computation is part of these decisions.
const requireUnique = <T>(values: readonly T[], reason: string): T => {
  if (values.length !== 1) throw new TypeError(reason);
  return values[0]!;
};

const candidateEventOwner = (
  approval: Approval, tasks: readonly ExecutionTask[], runs: readonly Run[], event: RunEvent,
): Readonly<{ task: ExecutionTask; run: Run }> => {
  const run = requireUnique(runs.filter(value => value.id === event.runId), "candidate Run missing or ambiguous");
  const task = requireUnique(tasks.filter(value => value.id === run.executionTaskId && value.approvalId === approval.id),
    "candidate must belong to exact signed task");
  if (run.workItemId !== approval.workItemId || run.baselineCommit !== approval.baselineCommit ||
      run.stage !== "EXECUTION" || run.status !== "COMPLETED") {
    throw new TypeError("candidate lacks completed exact signed Run");
  }
  return { task, run };
};

export const admittedCandidateMember = (
  approval: Approval, tasks: readonly ExecutionTask[], runs: readonly Run[], events: readonly RunEvent[],
  candidateEventId: RunEventId,
): CandidateMembers[number] => {
  const event = requireUnique(events.filter(value => value.id === candidateEventId), "candidate event missing or ambiguous");
  const { task, run } = candidateEventOwner(approval, tasks, runs, event);
  const ownEvents = orderedEvents(run, events.filter(value => value.runId === run.id));
  if (event.event.tag === "TASK_ALREADY_SATISFIED") {
    if (run.role !== "BUILDER" || run.triggerEventId !== null || run.terminalClassification !== "ALREADY_SATISFIED" ||
        ownEvents.filter(value => value.event.tag === "TASK_ALREADY_SATISFIED").length !== 1 ||
        ownEvents.some(value => value.event.tag === "CANDIDATE_STATE_RECORDED" || value.event.tag === "CANDIDATE_RECORDED")) {
      throw new TypeError("no-op member lacks admitted exact builder proof");
    }
    return [task.id, event.id];
  }
  if (event.event.tag !== "CANDIDATE_RECORDED" || run.role !== "REVIEWER" ||
      run.terminalClassification !== "CANDIDATE_DONE" ||
      ownEvents.filter(value => value.event.tag === "CANDIDATE_RECORDED").length !== 1) {
    throw new TypeError("candidate member lacks admitted exact reviewer proof");
  }
  const proof = event.event;
  const state = requireUnique(events.filter(value => value.id === proof.candidateStateEventId), "candidate state proof missing");
  const stateOwner = candidateEventOwner(approval, tasks, runs, state);
  if (state.event.tag !== "CANDIDATE_STATE_RECORDED" || stateOwner.task.id !== task.id ||
      (stateOwner.run.role !== "BUILDER" && stateOwner.run.role !== "REMEDIATOR") || stateOwner.run.attempt >= run.attempt) {
    throw new TypeError("candidate state has foreign or invalid lineage");
  }
  const trigger = requireUnique(events.filter(value => value.id === run.triggerEventId), "candidate reviewer trigger missing");
  if (trigger.id !== state.id) {
    if (trigger.event.tag !== "CANDIDATE_RECORDED" || trigger.event.candidateStateEventId !== state.id ||
        candidateEventOwner(approval, tasks, runs, trigger).task.id !== task.id) {
      throw new TypeError("candidate reviewer trigger does not identify replayed state");
    }
    const triggerRun = requireUnique(runs.filter(value => value.id === trigger.runId), "candidate trigger Run missing");
    if (triggerRun.attempt >= run.attempt) throw new TypeError("candidate trigger is not an earlier Run");
  }
  const validation = ownEvents.filter(value => value.event.tag === "VALIDATION_PASSED" || value.event.tag === "VALIDATION_FAILED");
  if (validation.length !== validationOrder.length || proof.validationEventIds.length !== validationOrder.length ||
      validation.some((value, index) => value.id !== proof.validationEventIds[index] ||
        value.event.tag !== "VALIDATION_PASSED" || value.event.stage !== validationOrder[index] || value.sequence >= event.sequence)) {
    throw new TypeError("candidate requires exact same-Run ordered V0–V7 proof");
  }
  const reviewPass = requireUnique(ownEvents.filter(value => value.event.tag === "REVIEW_PASSED"), "candidate lacks exact independent review");
  if (reviewPass.sequence >= validation[4]!.sequence) throw new TypeError("V4 requires preceding independent review");
  return [task.id, event.id];
};

const orderedCandidateMembers = (members: readonly CandidateMembers[number][]): CandidateMembers =>
  CandidateMembersSchema.parse([...members].sort((left, right) => left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0));

export const candidateMembershipCanonicalJson = (approvalId: Approval["id"], members: CandidateMembers): string =>
  canonicalJson([approvalId, CandidateMembersSchema.parse(members)]);

export const orderedCandidateReviewEvents = (
  approvalId: Approval["id"], history: readonly CandidateReviewEvent[],
): readonly CandidateReviewEvent[] => {
  const seen = new Set<CandidateReviewEventId>();
  return history.map((value, index) => {
    const event = CandidateReviewEventSchema.parse(value);
    if (event.approvalId !== approvalId || event.sequence !== index + 1 || seen.has(event.id)) {
      throw new TypeError("candidate review stream identity or sequence conflict");
    }
    seen.add(event.id);
    return event;
  });
};

const linkedSubmission = (
  run: Run, runs: readonly Run[], events: readonly RunEvent[], history: readonly CandidateReviewEvent[],
): CandidateReviewEventId | null => {
  const visited = new Set<Run["id"]>();
  let cursor = run;
  for (;;) {
    if (visited.has(cursor.id)) throw new TypeError("cyclic QA Run lineage");
    visited.add(cursor.id);
    const direct = history.filter(value => value.event.tag === "REVIEW_STARTED" && value.event.runId === cursor.id);
    if (direct.length > 0) {
      const entry = requireUnique(direct, "duplicate QA Run admission");
      if (entry.event.tag !== "REVIEW_STARTED") throw new TypeError("invalid QA Run admission");
      return entry.event.submissionId;
    }
    if (cursor.triggerEventId === null) return null;
    const trigger = requireUnique(events.filter(value => value.id === cursor.triggerEventId), "QA lineage trigger missing");
    const previous = requireUnique(runs.filter(value => value.id === trigger.runId), "QA lineage Run missing");
    if (previous.executionTaskId !== run.executionTaskId || previous.workItemId !== run.workItemId ||
        previous.baselineCommit !== run.baselineCommit || previous.attempt >= cursor.attempt) {
      throw new TypeError("QA lineage must follow earlier exact task Run");
    }
    cursor = previous;
  }
};

// The caller hashes the canonical JSON with the existing shell adapter,
// then supplies those exact round hashes to the separate pure comparison.
export const reconstructCandidateRounds = (
  approval: Approval, tasks: readonly ExecutionTask[], runs: readonly Run[], events: readonly RunEvent[],
  history: readonly CandidateReviewEvent[],
): ReadonlyMap<CandidateReviewEventId, CandidateMembers> => {
  const ordered = orderedCandidateReviewEvents(approval.id, history);
  const signedTasks = tasks.filter(task => task.approvalId === approval.id);
  if (signedTasks.length === 0 || new Set(signedTasks.map(task => task.id)).size !== signedTasks.length) {
    throw new TypeError("exact signed candidate tasks required");
  }
  const opened = ordered[0];
  if (opened?.event.tag !== "OPENED" || ordered.filter(value => value.event.tag === "OPENED").length !== 1) {
    throw new TypeError("candidate review requires exactly one initial OPENED event");
  }
  const originals = signedTasks.map(task => {
    const taskRuns = executionTaskRuns(task.id, runs);
    const original = requireUnique(events.filter(event => {
      if (event.event.tag !== "TASK_ALREADY_SATISFIED" && event.event.tag !== "CANDIDATE_RECORDED") return false;
      const run = taskRuns.find(value => value.id === event.runId);
      return run !== undefined && run.status === "COMPLETED" && linkedSubmission(run, runs, events, ordered) === null;
    }), "original signed candidate member missing or ambiguous");
    return admittedCandidateMember(approval, signedTasks, runs, events, original.id);
  });
  if (originals.every(([, eventId]) => events.find(event => event.id === eventId)?.event.tag === "TASK_ALREADY_SATISFIED")) {
    throw new TypeError("all-no-op execution cannot open Acceptance");
  }
  let members = orderedCandidateMembers(originals);
  const rounds = new Map<CandidateReviewEventId, CandidateMembers>([[opened.id, members]]);
  for (const entry of ordered) {
    if (entry.event.tag !== "REVIEW_COMPLETED") continue;
    const completion = entry.event;
    const submission = requireUnique(ordered.filter(value => value.id === completion.submissionId &&
      value.sequence < entry.sequence && value.event.tag === "SUBMIT"), "QA completion lacks prior exact submission");
    if (submission.event.tag !== "SUBMIT") throw new TypeError("invalid QA submission");
    const reports = submission.event.findingIds.map(id => requireUnique(ordered.filter(value => value.id === id &&
      value.sequence < submission.sequence && value.event.tag === "REPORT"), "submission report missing"));
    const taskIds = new Set(reports.map(report => report.event.tag === "REPORT" ? report.event.taskId : null));
    if (taskIds.size !== 1 || taskIds.has(null)) throw new TypeError("submission must own one task");
    const replacement = admittedCandidateMember(approval, signedTasks, runs, events, completion.candidateEventId);
    const replacementEvent = requireUnique(events.filter(event => event.id === replacement[1]), "replacement candidate missing");
    const replacementRun = requireUnique(runs.filter(run => run.id === replacementEvent.runId), "replacement Run missing");
    if (!taskIds.has(replacement[0]) || replacementEvent.event.tag !== "CANDIDATE_RECORDED" ||
        linkedSubmission(replacementRun, runs, events, ordered.filter(value => value.sequence < entry.sequence)) !== submission.id ||
        !members.some(member => member[0] === replacement[0] && member[1] !== replacement[1])) {
      throw new TypeError("replacement is not the exact successful submitted-task candidate");
    }
    members = orderedCandidateMembers(members.map(member => member[0] === replacement[0] ? replacement : member));
    rounds.set(entry.id, members);
  }
  return rounds;
};

export const verifyCandidateRoundHashes = (
  history: readonly CandidateReviewEvent[], verified: ReadonlyMap<CandidateReviewEventId, Sha256>,
): void => {
  const rounds = history.filter(value => value.event.tag === "OPENED" || value.event.tag === "REVIEW_COMPLETED");
  if (rounds.length !== verified.size) throw new TypeError("exact candidate round proof required");
  for (const entry of rounds) {
    if (entry.event.tag !== "OPENED" && entry.event.tag !== "REVIEW_COMPLETED") continue;
    if (verified.get(entry.id) !== entry.event.candidateHash) throw new TypeError("candidate round hash mismatch");
  }
};

export type AcceptanceDecision =
  | Readonly<{ tag: "NONE" }>
  | Readonly<{ tag: "RECONCILE_AUTHORITY"; owner: UpstreamReturnStage }>
  | Readonly<{ tag: "RECONCILE_SOURCE" }>
  | Readonly<{ tag: "REANALYSE_PROOF_UNAVAILABLE" }>
  | Readonly<{ tag: "QUEUED"; submissionId: CandidateReviewEventId }>
  | Readonly<{ tag: "REANALYSE_NO_OP" | "SUBMIT_FINDINGS" | "RETEST"; findingIds: readonly CandidateReviewEventId[] }>
  | Readonly<{ tag: "ACCEPT" }>;

type FindingDisposition = "OPEN" | "RETEST_REQUIRED" | "RETEST_FAILED" | "DISPOSED";

export const candidateFindingDispositions = (
  history: readonly CandidateReviewEvent[], rounds: ReadonlyMap<CandidateReviewEventId, CandidateMembers>,
  tasks: readonly ExecutionTask[],
): ReadonlyMap<CandidateReviewEventId, FindingDisposition> => {
  const findings = new Map<CandidateReviewEventId, FindingDisposition>();
  const reports = new Map<CandidateReviewEventId, Extract<CandidateReviewEvent["event"], { tag: "REPORT" }>>();
  let currentHash: Sha256 | null = null;
  let members: CandidateMembers | null = null;
  let submission: CandidateReviewEvent | null = null;
  let terminal = false;
  for (const entry of history) {
    const event = entry.event;
    if (terminal) throw new TypeError("review history cannot follow a terminal human decision");
    if (event.tag === "OPENED") {
      if (members !== null) throw new TypeError("duplicate review opening");
      members = rounds.get(entry.id) ?? null;
      currentHash = event.candidateHash;
      if (members === null) throw new TypeError("missing initial candidate membership");
      continue;
    }
    if (members === null || currentHash === null) throw new TypeError("review event before initial membership");
    if ("candidateHash" in event && event.tag !== "REVIEW_COMPLETED" &&
        !(event.tag === "REANALYSIS_REQUESTED" && event.reason === "CANDIDATE_PROOF_UNAVAILABLE") &&
        event.candidateHash !== currentHash) throw new TypeError("review event has stale candidate identity");
    const pending = submission?.event.tag === "SUBMIT" ? submission.event : null;
    if (pending !== null && event.tag !== "REVIEW_STARTED" && event.tag !== "REVIEW_COMPLETED" &&
        !(event.tag === "REANALYSIS_REQUESTED" && event.reason === "CANDIDATE_PROOF_UNAVAILABLE")) {
      throw new TypeError("queued correction excludes ordinary QA decisions");
    }
    switch (event.tag) {
      case "REPORT": {
        const task = requireUnique(tasks.filter(value => value.id === event.taskId && value.approvalId === entry.approvalId), "foreign report task");
        if (!members.some(([taskId, eventId]) => taskId === event.taskId && eventId === event.candidateEventId) ||
            !event.acceptanceRefs.every(ref => task.acceptanceRefs.includes(ref))) throw new TypeError("report lacks current signed member or criteria");
        reports.set(entry.id, event); findings.set(entry.id, "OPEN"); break;
      }
      case "SUBMIT": {
        const selected = event.findingIds.map(id => {
          const report = reports.get(id);
          if (report === undefined || (findings.get(id) !== "OPEN" && findings.get(id) !== "RETEST_FAILED")) throw new TypeError("finding is not submittable");
          return report.taskId;
        });
        if (new Set(selected).size !== 1 || tasks.find(task => task.id === selected[0])?.state === "ALREADY_SATISFIED") throw new TypeError("submission requires one candidate-producing task");
        submission = entry; break;
      }
      case "REVIEW_STARTED":
        if (submission?.id !== event.submissionId) throw new TypeError("QA Run starts without exact queued submission");
        break;
      case "REVIEW_COMPLETED": {
        const replacement = rounds.get(entry.id);
        if (submission?.id !== event.submissionId || pending === null || replacement === undefined) throw new TypeError("completion without exact submission and membership");
        const changed = replacement.filter(member => !members!.some(prior => prior[0] === member[0] && prior[1] === member[1]));
        if (changed.length !== 1) throw new TypeError("completion must replace exactly one task member");
        for (const [id, report] of reports) {
          if (report.taskId === changed[0]![0] && (pending.findingIds.includes(id) || findings.get(id) === "DISPOSED")) findings.set(id, "RETEST_REQUIRED");
        }
        members = replacement; currentHash = event.candidateHash; submission = null; break;
      }
      case "RETEST_FAILED":
        if (findings.get(event.findingId) !== "RETEST_REQUIRED") throw new TypeError("failed retest requires reviewed current member");
        findings.set(event.findingId, "RETEST_FAILED"); break;
      case "DISPOSITION": {
        const state = findings.get(event.findingId);
        if (event.outcome === "RESOLVED" ? state !== "RETEST_REQUIRED" : state !== "OPEN" && state !== "RETEST_REQUIRED" && state !== "RETEST_FAILED") {
          throw new TypeError("finding disposition is not admitted");
        }
        findings.set(event.findingId, "DISPOSED"); break;
      }
      case "REANALYSIS_REQUESTED":
        if (event.reason === "NO_OP_CHALLENGE") {
          const unresolvedNoOps = [...reports].filter(([id, report]) => findings.get(id) !== "DISPOSED" &&
            tasks.find(task => task.id === report.taskId)?.state === "ALREADY_SATISFIED").map(([id]) => id);
          if (unresolvedNoOps.length !== event.findingIds.length || !unresolvedNoOps.every(id => event.findingIds.includes(id))) throw new TypeError("no-op return requires exact unresolved no-op finding set");
        }
        terminal = true; break;
      case "ACCEPT":
        if ([...findings.values()].some(value => value !== "DISPOSED") || canonicalJson(event.candidateMembers) !== canonicalJson(members)) {
          throw new TypeError("acceptance requires exact final members and all findings disposed");
        }
        terminal = true; break;
    }
  }
  return findings;
};

// The observation is supplied by the existing typed HTTP/authority boundary.
// History alone never grants a current operator action.
export const deriveAcceptanceDecision = (input: Readonly<{
  current: boolean;
  coherent: boolean;
  mutationConflict: boolean;
  approval: Approval | null;
  history: readonly CandidateReviewEvent[];
  currentProof: readonly CandidateReviewEvent[] | null;
  diagnostic: OrderHttpError | null;
  rounds: ReadonlyMap<CandidateReviewEventId, CandidateMembers>;
  tasks: readonly ExecutionTask[];
}>): AcceptanceDecision => {
  if (!input.current || !input.coherent || input.mutationConflict || input.approval === null) return { tag: "NONE" };
  const error = input.diagnostic;
  if (error !== null) {
    if (error.code === "SOURCE_AUTHORITY_STALE" || (error.code === "WORK_ITEM_SOURCE_CONFLICT" && error.sourceDiagnostic !== null)) return { tag: "RECONCILE_SOURCE" };
    if (error.code === "STALE_AUTHORITY" && error.staleAuthorityOwner !== null) return { tag: "RECONCILE_AUTHORITY", owner: error.staleAuthorityOwner };
    if (error.code === "CANDIDATE_PROOF_UNAVAILABLE") return { tag: "REANALYSE_PROOF_UNAVAILABLE" };
    return { tag: "NONE" };
  }
  const history = orderedCandidateReviewEvents(input.approval.id, input.history);
  if (input.currentProof === null || canonicalJson(input.currentProof) !== canonicalJson(history) ||
      history.length === 0 || history.some(entry => entry.event.tag === "ACCEPT" || entry.event.tag === "REANALYSIS_REQUESTED")) return { tag: "NONE" };
  const findings = candidateFindingDispositions(history, input.rounds, input.tasks);
  const outstanding = history.findLast(entry => entry.event.tag === "SUBMIT");
  if (outstanding !== undefined && !history.some(entry => entry.event.tag === "REVIEW_COMPLETED" && entry.event.submissionId === outstanding.id)) return { tag: "QUEUED", submissionId: outstanding.id };
  const unresolved = history.flatMap(entry => entry.event.tag === "REPORT" && findings.get(entry.id) !== "DISPOSED" ? [entry] : []);
  const noOps = unresolved.filter(entry => {
    const event = entry.event;
    return event.tag === "REPORT" && input.tasks.some(task => task.id === event.taskId && task.state === "ALREADY_SATISFIED");
  });
  if (noOps.length > 0) return { tag: "REANALYSE_NO_OP", findingIds: noOps.map(entry => entry.id) };
  const open = unresolved.filter(entry => findings.get(entry.id) === "OPEN" || findings.get(entry.id) === "RETEST_FAILED");
  if (open.length > 0) return { tag: "SUBMIT_FINDINGS", findingIds: open.map(entry => entry.id) };
  const retest = unresolved.filter(entry => findings.get(entry.id) === "RETEST_REQUIRED");
  if (retest.length > 0) return { tag: "RETEST", findingIds: retest.map(entry => entry.id) };
  return { tag: "ACCEPT" };
};
