import type {
  ArtifactRef,
  EvidencePath,
  Run,
  RunEvent,
  RunEventId,
  WorkItem,
} from "../../src/core/contracts.ts";

export type WorkItemMode =
  | "DOCUMENTS"
  | "ACTIVITY"
  | "REVIEW"
  | "EXECUTION"
  | "EVIDENCE"
  | "RESULT";

export type ProposalSelection = Readonly<{
  runId: Run["id"];
  eventId: RunEventId;
}>;

export type EvidenceSelection =
  | Readonly<{
      kind: "ARTIFACT";
      artifactId: ArtifactRef["id"];
      label: string;
    }>
  | Readonly<{
      kind: "EVIDENCE";
      runId: Run["id"];
      relativePath: EvidencePath;
    }>;

export type WorkflowStepPresentation = Readonly<{
  stage: WorkItem["stage"];
  label: string;
  purpose: string;
}>;

export type WorkflowDocumentTarget =
  | "SOURCE"
  | "R1"
  | "R2"
  | "DESIGN"
  | "PLAN"
  | "R3";

export type WorkflowInspectionTarget =
  | Readonly<{ kind: "DOCUMENT"; document: WorkflowDocumentTarget }>
  | Readonly<{ kind: "MODE"; mode: "REVIEW" | "EXECUTION" | "RESULT" }>
  | Readonly<{ kind: "UNREACHED"; step: WorkItem["stage"] }>;

export const workflowSteps: readonly WorkflowStepPresentation[] = [
  { stage: "IDEA", label: "Work request", purpose: "Define the work that needs attention" },
  { stage: "R1", label: "Research", purpose: "Establish what is actually true" },
  { stage: "R2", label: "Requirements", purpose: "Define the required outcome" },
  { stage: "DESIGN", label: "Solution design", purpose: "Decide the correct technical solution" },
  { stage: "PLAN", label: "Implementation plan", purpose: "Define exactly how the change will be made" },
  { stage: "R3", label: "Readiness review", purpose: "Independently verify that the work is ready" },
  { stage: "AWAITING_SIGNOFF", label: "Approval", purpose: "Review and authorize the exact package" },
  { stage: "EXECUTION", label: "Implementation", purpose: "Execute and verify the approved change" },
  { stage: "COMPLETE", label: "Complete", purpose: "Inspect the final outcome" },
];

export const workflowPresentation = (
  stage: WorkItem["stage"],
): WorkflowStepPresentation => {
  const found = workflowSteps.find((step) => step.stage === stage);
  if (!found) throw new TypeError(`unknown WorkItem stage: ${stage}`);
  return found;
};

export const workflowInspectionTarget = (
  workItem: Pick<WorkItem, "stage" | "outcome">,
  step: WorkflowStepPresentation,
): WorkflowInspectionTarget => {
  const currentIndex = workflowSteps.findIndex((item) => item.stage === workItem.stage);
  const targetIndex = workflowSteps.findIndex((item) => item.stage === step.stage);
  if (currentIndex < 0 || targetIndex < 0) {
    throw new TypeError("unknown workflow presentation stage");
  }
  if (targetIndex > currentIndex) {
    return { kind: "UNREACHED", step: step.stage };
  }
  switch (step.stage) {
    case "IDEA":
      return { kind: "DOCUMENT", document: "SOURCE" };
    case "R1":
    case "R2":
    case "DESIGN":
    case "PLAN":
    case "R3":
      return { kind: "DOCUMENT", document: step.stage };
    case "AWAITING_SIGNOFF":
      return { kind: "MODE", mode: "REVIEW" };
    case "EXECUTION":
      return { kind: "MODE", mode: "EXECUTION" };
    case "COMPLETE":
      return {
        kind: "MODE",
        mode: workItem.outcome === "CANDIDATE_DONE" ? "EXECUTION" : "RESULT",
      };
  }
};

export const runIsActive = (
  run: Pick<Run, "status">,
): boolean =>
  run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT";

export const runNeedsAttention = (
  run: Pick<Run, "status">,
): boolean =>
  run.status === "BLOCKED" || run.status === "FAILED";

export const runStatusLabel = (status: Run["status"]): string => {
  switch (status) {
    case "RUNNING": return "Running";
    case "WAITING_FOR_INPUT": return "Waiting for you";
    case "COMPLETED": return "Completed";
    case "BLOCKED": return "Blocked";
    case "FAILED": return "Failed";
    case "CANCELLED": return "Cancelled";
  }
};

export const runRoleLabel = (role: Run["role"]): string => {
  switch (role) {
    case "STAGE": return "Workflow agent";
    case "BUILDER": return "Implementation agent";
    case "REVIEWER": return "Independent review";
    case "REMEDIATOR": return "Remediation agent";
  }
};

export const runSummaryLabel = (run: Run): string => {
  const step = workflowPresentation(run.stage);
  return `${step.label} · ${runRoleLabel(run.role)} · Attempt ${run.attempt}`;
};

export const proposalDispositionFor = (
  events: readonly RunEvent[],
  proposalId: RunEventId,
): "ADOPTED" | "REJECTED" | null => {
  const found = events.find((event) =>
    event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
    event.event.proposalEventId === proposalId);
  return found?.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
    ? found.event.disposition
    : null;
};

export type RunEventPresentation = Readonly<{
  label: string;
  detail: string;
  tone: "neutral" | "success" | "warning" | "error";
}>;

export const runEventPresentation = (
  event: RunEvent,
): RunEventPresentation => {
  const payload = event.event;
  switch (payload.tag) {
    case "STAGE_STARTED":
      return {
        label: "Work started",
        detail: `${workflowPresentation(payload.stage).label} started`,
        tone: "neutral",
      };
    case "AGENT_MESSAGE_FINAL":
      return { label: "Agent update", detail: payload.text, tone: "neutral" };
    case "HUMAN_INPUT_REQUESTED":
      return { label: "Your input is needed", detail: payload.question, tone: "warning" };
    case "HUMAN_INPUT_RECEIVED":
      return { label: "Your response", detail: payload.text, tone: "neutral" };
    case "ARTIFACT_PROPOSAL_CREATED":
      return { label: "Document change proposed", detail: `${payload.targetPath} — ${payload.rationale}`, tone: "warning" };
    case "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED":
      return { label: "Document review requested", detail: "Review the proposed document change.", tone: "warning" };
    case "ARTIFACT_PROPOSAL_DISPOSITIONED":
      return {
        label: payload.disposition === "ADOPTED" ? "Document change adopted" : "Document change rejected",
        detail: payload.disposition === "ADOPTED"
          ? "The proposed document change was adopted."
          : "The proposed document change was rejected.",
        tone: payload.disposition === "ADOPTED" ? "success" : "neutral",
      };
    case "STAGE_COMPLETED":
      return {
        label: "Workflow step completed",
        detail: `${workflowPresentation(payload.completion.stage).label}: ${payload.completion.outcome.replaceAll("_", " ").toLowerCase()}`,
        tone: "success",
      };
    case "STAGE_BLOCKED":
      return { label: "Work is blocked", detail: payload.reason, tone: "error" };
    case "TASK_ALREADY_SATISFIED":
      return { label: "No change required", detail: payload.summary, tone: "success" };
    case "CONFORMANCE_PASSED":
      return { label: "Conformance check passed", detail: `${workflowPresentation(payload.stage).label} output is conformant.`, tone: "success" };
    case "CONFORMANCE_FAILED":
      return { label: "Conformance check failed", detail: payload.summary, tone: "error" };
    case "PROVIDER_DIAGNOSTICS_RECORDED":
      return { label: "Technical diagnostics recorded", detail: "Provider diagnostic evidence is available.", tone: "neutral" };
    case "PRODUCTIVE_INVOCATION_FAILED":
      return { label: "Agent setup blocked", detail: payload.detail, tone: "error" };
    case "PROVIDER_FAILED":
      return { label: "Agent execution failed", detail: payload.detail, tone: "error" };
    case "GATE_PASSED":
      return { label: "Verification passed", detail: `${payload.gateId} passed.`, tone: "success" };
    case "GATE_FAILED":
      return { label: "Verification failed", detail: `${payload.gateId} failed.`, tone: "error" };
    case "REVIEW_PASSED":
      return { label: "Independent review passed", detail: "The independent review passed.", tone: "success" };
    case "REVIEW_FAILED":
      return { label: "Independent review failed", detail: payload.summary, tone: "error" };
    case "VALIDATION_PASSED":
      return { label: "Validation passed", detail: `${payload.stage} passed.`, tone: "success" };
    case "VALIDATION_FAILED":
      return { label: "Validation failed", detail: payload.summary, tone: "error" };
    case "CANDIDATE_STATE_RECORDED":
      return {
        label: "Candidate state recorded",
        detail: payload.changedPaths.length === 0
          ? "No repository paths changed."
          : payload.changedPaths.join(", "),
        tone: "neutral",
      };
    case "CANDIDATE_RECORDED":
      return { label: "Verified candidate recorded", detail: "The verified candidate and its validation chain were recorded.", tone: "success" };
    case "AUTHORITY_CHANGED":
      return { label: "Approved authority changed", detail: "The approved authority changed and the current execution must be reconciled.", tone: "warning" };
    case "REPOSITORY_DRIFTED":
      return { label: "Repository changed", detail: "The repository baseline changed during execution.", tone: "warning" };
    case "OBSERVATION_RECORDED":
      return { label: payload.title, detail: payload.detail, tone: "neutral" };
  }
};

export const eventEvidence = (
  event: RunEvent,
): readonly import("../../src/core/contracts.ts").EvidenceRef[] => {
  const payload = event.event;
  if ("evidence" in payload) return payload.evidence;
  if (payload.tag === "CANDIDATE_STATE_RECORDED") return [payload.patch];
  return [];
};

export const unresolvedHumanInput = (
  events: readonly RunEvent[],
): RunEvent | null => {
  const received = new Set(
    events
      .filter((event) => event.event.tag === "HUMAN_INPUT_RECEIVED")
      .map((event) =>
        event.event.tag === "HUMAN_INPUT_RECEIVED"
          ? event.event.requestEventId
          : null)
      .filter((id): id is RunEventId => id !== null),
  );
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (
      event?.event.tag === "HUMAN_INPUT_REQUESTED" &&
      !received.has(event.id)
    ) return event;
  }
  return null;
};

const lifecycleArtifactRoleOrder: Readonly<Record<ArtifactRef["role"], number>> = {
  PROJECT_MANIFEST: 0,
  R1: 1,
  R2: 2,
  DESIGN: 3,
  PLAN: 4,
  R3: 5,
  GOVERNANCE: 6,
  VERIFICATION_MATERIAL: 7,
};

export const lifecycleArtifactRoleRank = (
  role: ArtifactRef["role"],
): number => lifecycleArtifactRoleOrder[role];

export const workItemInitialMode = (
  workItem: Pick<WorkItem, "stage" | "outcome">,
  runs: readonly Pick<Run, "status">[] = [],
): WorkItemMode => {
  if (runs.some(runIsActive) || runs.some(runNeedsAttention)) return "ACTIVITY";
  if (workItem.stage === "AWAITING_SIGNOFF") return "REVIEW";
  if (workItem.stage === "EXECUTION") return "EXECUTION";
  if (workItem.stage === "COMPLETE") {
    return workItem.outcome === "CANDIDATE_DONE" ? "EXECUTION" : "RESULT";
  }
  return "DOCUMENTS";
};

export const workItemModeIsKnown = (
  value: string,
): value is WorkItemMode =>
  value === "DOCUMENTS" ||
  value === "ACTIVITY" ||
  value === "REVIEW" ||
  value === "EXECUTION" ||
  value === "EVIDENCE" ||
  value === "RESULT";

export const workItemModeLabel = (
  mode: WorkItemMode,
): string => {
  switch (mode) {
    case "DOCUMENTS": return "Documents";
    case "ACTIVITY": return "Activity";
    case "REVIEW": return "Review";
    case "EXECUTION": return "Implementation";
    case "EVIDENCE": return "Evidence";
    case "RESULT": return "Result";
  }
};
