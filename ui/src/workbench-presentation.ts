import type {
  ArtifactRef,
  EvidencePath,
  ExecutionTask,
  Run,
  RunEvent,
  RunEventId,
  WorkItem,
} from "../../src/core/contracts.ts";

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


export type WorkflowStepState = "CURRENT" | "HISTORICAL" | "UNREACHED";

export type WorkflowMaterial =
  | Readonly<{ kind: "SOURCE_DOCUMENT" }>
  | Readonly<{ kind: "STAGE_RUN"; runId: Run["id"] }>
  | Readonly<{ kind: "STAGE_DOCUMENT"; artifactId: ArtifactRef["id"] }>
  | Readonly<{ kind: "SUPPORTING_DOCUMENT"; artifactId: ArtifactRef["id"] }>
  | Readonly<{ kind: "PROPOSAL"; runId: Run["id"]; eventId: RunEventId }>
  | Readonly<{ kind: "READINESS_REVIEW" }>
  | Readonly<{ kind: "APPROVAL_PACKAGE" }>
  | Readonly<{
      kind: "EXECUTION_TASK";
      taskId: ExecutionTask["id"];
      runId: Run["id"] | null;
    }>
  | Readonly<{ kind: "EVIDENCE"; selection: EvidenceSelection }>
  | Readonly<{ kind: "TERMINAL_RESULT" }>
  | Readonly<{ kind: "STEP_STATE" }>
  | Readonly<{ kind: "UNREACHED" }>;

export const workflowMaterialLabel = (
  material: WorkflowMaterial,
): string => {
  switch (material.kind) {
    case "SOURCE_DOCUMENT": return "Work request";
    case "STAGE_RUN": return "Workflow attempt";
    case "STAGE_DOCUMENT": return "Governed document";
    case "SUPPORTING_DOCUMENT": return "Supporting document";
    case "PROPOSAL": return "Proposal review";
    case "READINESS_REVIEW": return "Readiness review";
    case "APPROVAL_PACKAGE": return "Approval package";
    case "EXECUTION_TASK": return "Implementation task";
    case "EVIDENCE": return "Evidence";
    case "TERMINAL_RESULT": return "Final outcome";
    case "STEP_STATE": return "Workflow step";
    case "UNREACHED": return "Not yet reached";
  }
};

export const workflowMaterialRunId = (
  material: WorkflowMaterial,
): Run["id"] | null => {
  switch (material.kind) {
    case "STAGE_RUN":
    case "PROPOSAL":
      return material.runId;
    case "EXECUTION_TASK":
      return material.runId;
    case "EVIDENCE":
      return material.selection.kind === "EVIDENCE"
        ? material.selection.runId
        : null;
    default:
      return null;
  }
};

export const workflowMaterialIdentity = (
  material: WorkflowMaterial,
): string => {
  switch (material.kind) {
    case "SOURCE_DOCUMENT":
    case "READINESS_REVIEW":
    case "APPROVAL_PACKAGE":
    case "TERMINAL_RESULT":
    case "STEP_STATE":
    case "UNREACHED":
      return material.kind;
    case "STAGE_RUN":
      return material.kind + ":" + material.runId;
    case "STAGE_DOCUMENT":
    case "SUPPORTING_DOCUMENT":
      return material.kind + ":" + material.artifactId;
    case "PROPOSAL":
      return material.kind + ":" + material.runId + ":" + material.eventId;
    case "EXECUTION_TASK":
      return material.kind + ":" + material.taskId + ":" + (material.runId ?? "none");
    case "EVIDENCE":
      return material.selection.kind === "ARTIFACT"
        ? material.kind + ":ARTIFACT:" + material.selection.artifactId
        : material.kind + ":EVIDENCE:" + material.selection.runId + ":" +
          material.selection.relativePath;
  }
};

export type WorkflowMaterialResolutionInput = Readonly<{
  workItem: Pick<WorkItem, "stage" | "status" | "outcome">;
  selectedStep: WorkItem["stage"];
  runs: readonly Run[];
  artifacts: readonly ArtifactRef[];
  unresolvedInputRunId?: Run["id"] | null;
  pendingProposal?: ProposalSelection | null;
  approvalPackageAvailable?: boolean;
  tasks?: readonly ExecutionTask[];
  selectedTaskId?: ExecutionTask["id"] | null;
  selectedRunId?: Run["id"] | null;
  explicitSelection?: WorkflowMaterial | null;
  dirtyDocument?: boolean;
}>;

const workflowStepIndex = (stage: WorkItem["stage"]): number => {
  const index = workflowSteps.findIndex((step) => step.stage === stage);
  if (index < 0) throw new TypeError(`unknown WorkItem stage: ${stage}`);
  return index;
};

export const workflowStepState = (
  workItem: Pick<WorkItem, "stage">,
  selectedStep: WorkItem["stage"],
): WorkflowStepState => {
  const current = workflowStepIndex(workItem.stage);
  const selected = workflowStepIndex(selectedStep);
  if (selected === current) return "CURRENT";
  return selected < current ? "HISTORICAL" : "UNREACHED";
};

const runOrder = (left: Run, right: Run): number =>
  left.attempt - right.attempt ||
  left.startedAt.localeCompare(right.startedAt) ||
  left.id.localeCompare(right.id);

const latestRun = (
  runs: readonly Run[],
  predicate: (run: Run) => boolean,
): Run | null =>
  [...runs].filter(predicate).sort(runOrder).at(-1) ?? null;

const stageArtifact = (
  artifacts: readonly ArtifactRef[],
  stage: WorkItem["stage"],
): ArtifactRef | null => {
  if (
    stage !== "R1" &&
    stage !== "R2" &&
    stage !== "DESIGN" &&
    stage !== "PLAN" &&
    stage !== "R3"
  ) {
    return null;
  }
  return artifacts.find((artifact) => artifact.role === stage) ?? null;
};

const selectedMaterialIsAvailable = (
  input: WorkflowMaterialResolutionInput,
  selection: WorkflowMaterial,
): boolean => {
  const stepState = workflowStepState(input.workItem, input.selectedStep);
  if (stepState === "UNREACHED") return selection.kind === "UNREACHED";

  switch (selection.kind) {
    case "SOURCE_DOCUMENT":
      return input.selectedStep === "IDEA";
    case "STAGE_RUN":
      return input.runs.some(
        (run) => run.id === selection.runId && run.stage === input.selectedStep,
      );
    case "STAGE_DOCUMENT": {
      const artifact = input.artifacts.find(
        (candidate) => candidate.id === selection.artifactId,
      );
      return artifact !== undefined && artifact.role === input.selectedStep;
    }
    case "SUPPORTING_DOCUMENT":
      return input.artifacts.some(
        (artifact) => artifact.id === selection.artifactId,
      );
    case "PROPOSAL": {
      const proposal = input.pendingProposal ?? null;
      if (
        proposal === null ||
        proposal.runId !== selection.runId ||
        proposal.eventId !== selection.eventId
      ) {
        return false;
      }
      return input.runs.some(
        (run) => run.id === selection.runId && run.stage === input.selectedStep,
      );
    }
    case "READINESS_REVIEW":
      return input.selectedStep === "R3";
    case "APPROVAL_PACKAGE":
      return input.selectedStep === "AWAITING_SIGNOFF" &&
        input.approvalPackageAvailable === true;
    case "EXECUTION_TASK":
      return input.selectedStep === "EXECUTION" &&
        (input.tasks ?? []).some((task) => task.id === selection.taskId) &&
        (
          selection.runId === null ||
          input.runs.some(
            (run) =>
              run.id === selection.runId &&
              run.executionTaskId === selection.taskId,
          )
        );
    case "EVIDENCE":
      return true;
    case "TERMINAL_RESULT":
      return input.selectedStep === "COMPLETE" &&
        input.workItem.stage === "COMPLETE";
    case "STEP_STATE":
      return true;
    case "UNREACHED":
      return false;
  }
};

const latestStageRun = (
  input: WorkflowMaterialResolutionInput,
): Run | null =>
  latestRun(
    input.runs,
    (run) => run.stage === input.selectedStep && run.role === "STAGE",
  );

const selectedStageRun = (
  input: WorkflowMaterialResolutionInput,
  status: "attention" | "active",
): Run | null => {
  const run = latestStageRun(input);
  if (!run) return null;
  if (status === "attention") return runNeedsAttention(run) ? run : null;
  return runIsActive(run) ? run : null;
};

const unresolvedInputRun = (
  input: WorkflowMaterialResolutionInput,
): Run | null => {
  const id = input.unresolvedInputRunId ?? null;
  if (id !== null) {
    return input.runs.find(
      (run) =>
        run.id === id &&
        run.stage === input.selectedStep &&
        run.role === "STAGE" &&
        run.status === "WAITING_FOR_INPUT",
    ) ?? null;
  }
  const current = latestStageRun(input);
  return current?.status === "WAITING_FOR_INPUT" ? current : null;
};

const selectedExecutionTask = (
  input: WorkflowMaterialResolutionInput,
): ExecutionTask | null => {
  const tasks = input.tasks ?? [];
  const selectedTaskId = input.selectedTaskId ?? null;
  if (selectedTaskId !== null) {
    const selected = tasks.find((task) => task.id === selectedTaskId);
    if (selected) return selected;
  }
  const activeTaskRun = latestRun(
    input.runs,
    (run) =>
      run.executionTaskId !== null &&
      (runIsActive(run) || runNeedsAttention(run)),
  );
  if (activeTaskRun?.executionTaskId) {
    const activeTask = tasks.find(
      (task) => task.id === activeTaskRun.executionTaskId,
    );
    if (activeTask) return activeTask;
  }
  return tasks.find((task) => task.state === "RUNNING" || task.state === "BLOCKED") ??
    tasks.at(0) ??
    null;
};

const selectedExecutionRun = (
  input: WorkflowMaterialResolutionInput,
  task: ExecutionTask,
): Run | null => {
  const selectedRunId = input.selectedRunId ?? null;
  if (selectedRunId !== null) {
    const selected = input.runs.find(
      (run) =>
        run.id === selectedRunId &&
        run.executionTaskId === task.id,
    );
    if (selected) return selected;
  }
  return latestRun(
    input.runs,
    (run) => run.executionTaskId === task.id,
  );
};

export const resolveWorkflowMaterial = (
  input: WorkflowMaterialResolutionInput,
): WorkflowMaterial => {
  const stepState = workflowStepState(input.workItem, input.selectedStep);
  if (stepState === "UNREACHED") return { kind: "UNREACHED" };

  const explicit = input.explicitSelection ?? null;
  const explicitIsAvailable =
    explicit !== null && selectedMaterialIsAvailable(input, explicit);
  const explicitIsDirtyDocument =
    input.dirtyDocument === true &&
    explicitIsAvailable &&
    (
      explicit?.kind === "SOURCE_DOCUMENT" ||
      explicit?.kind === "STAGE_DOCUMENT" ||
      explicit?.kind === "SUPPORTING_DOCUMENT"
    );

  if (input.selectedStep === "IDEA") {
    return explicitIsAvailable && explicit?.kind === "SOURCE_DOCUMENT"
      ? explicit
      : { kind: "SOURCE_DOCUMENT" };
  }

  if (
    input.selectedStep === "R1" ||
    input.selectedStep === "R2" ||
    input.selectedStep === "DESIGN" ||
    input.selectedStep === "PLAN"
  ) {
    const artifact = stageArtifact(input.artifacts, input.selectedStep);
    if (stepState === "HISTORICAL") {
      if (explicitIsAvailable && explicit) return explicit;
      if (artifact) return { kind: "STAGE_DOCUMENT", artifactId: artifact.id };
      const historicalRun = latestRun(
        input.runs,
        (run) => run.stage === input.selectedStep && run.role === "STAGE",
      );
      return historicalRun
        ? { kind: "STAGE_RUN", runId: historicalRun.id }
        : { kind: "STEP_STATE" };
    }

    if (explicitIsDirtyDocument && explicit) return explicit;

    const attentionRun = selectedStageRun(input, "attention");
    if (attentionRun) return { kind: "STAGE_RUN", runId: attentionRun.id };

    const inputRun = unresolvedInputRun(input);
    if (inputRun) return { kind: "STAGE_RUN", runId: inputRun.id };

    if (explicitIsAvailable && explicit) return explicit;

    const proposal = input.pendingProposal ?? null;
    if (
      proposal !== null &&
      input.runs.some(
        (run) => run.id === proposal.runId && run.stage === input.selectedStep,
      )
    ) {
      return {
        kind: "PROPOSAL",
        runId: proposal.runId,
        eventId: proposal.eventId,
      };
    }

    const activeRun = selectedStageRun(input, "active");
    if (activeRun) return { kind: "STAGE_RUN", runId: activeRun.id };
    if (artifact) return { kind: "STAGE_DOCUMENT", artifactId: artifact.id };
    return { kind: "STEP_STATE" };
  }

  if (input.selectedStep === "R3") {
    const attentionRun = selectedStageRun(input, "attention");
    if (attentionRun) return { kind: "STAGE_RUN", runId: attentionRun.id };
    const inputRun = unresolvedInputRun(input);
    if (inputRun) return { kind: "STAGE_RUN", runId: inputRun.id };
    if (explicitIsAvailable && explicit) return explicit;
    return { kind: "READINESS_REVIEW" };
  }

  if (input.selectedStep === "AWAITING_SIGNOFF") {
    return input.approvalPackageAvailable === true
      ? { kind: "APPROVAL_PACKAGE" }
      : { kind: "STEP_STATE" };
  }

  if (input.selectedStep === "EXECUTION") {
    if (
      explicitIsAvailable &&
      explicit?.kind === "EVIDENCE"
    ) {
      return explicit;
    }
    const task = selectedExecutionTask(input);
    if (!task) return { kind: "STEP_STATE" };
    const run = selectedExecutionRun(input, task);
    return {
      kind: "EXECUTION_TASK",
      taskId: task.id,
      runId: run?.id ?? null,
    };
  }

  if (explicitIsAvailable && explicit?.kind === "EVIDENCE") {
    return explicit;
  }
  return { kind: "TERMINAL_RESULT" };
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
  const exhaustive: never = status;
  return exhaustive;
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
      return { label: "Document adoption in progress", detail: "The proposed document change is being applied and reconciled.", tone: "warning" };
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
      return { label: "Technical diagnostics available", detail: "Provider diagnostic evidence is available.", tone: "neutral" };
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
  const exhaustive: never = payload;
  return exhaustive;
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

export const lifecycleArtifactLabel = (
  role: ArtifactRef["role"],
): string => {
  switch (role) {
    case "PROJECT_MANIFEST": return "Project manifest";
    case "R1": return workflowPresentation("R1").label;
    case "R2": return workflowPresentation("R2").label;
    case "DESIGN": return workflowPresentation("DESIGN").label;
    case "PLAN": return workflowPresentation("PLAN").label;
    case "R3": return workflowPresentation("R3").label;
    case "GOVERNANCE": return "Governance";
    case "VERIFICATION_MATERIAL": return "Verification material";
  }
};
