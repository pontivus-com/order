import {
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
