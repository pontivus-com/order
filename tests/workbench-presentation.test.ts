import { readFileSync } from "node:fs";
import { latestApprovalTasks } from "../src/core/lifecycle.ts";
import { describe, expect, it } from "vitest";

import {
  ArtifactRefSchema,
  ExecutionTaskSchema,
  RunEventSchema,
  RunSchema,
  RunStatusSchema,
  WorkItemSchema,
  type ArtifactRef,
  type ExecutionTask,
  type Run,
  type RunEventPayload,
  type WorkItem,
} from "../src/core/contracts.ts";
import {
  agentActivityRunEvents,
  verifiedCandidateProofEvents,
  conversationRunEvents,
  pendingProposalForEvents,
  resolveWorkflowMaterial,
  resolveContextArtifact,
  selectedContextArtifactId,
  runEventPlane,
  runEventPresentation,
  stageCompletionProductLabel,
  workflowMaterialIdentity,
  bindProspectiveApprovalSelection,
  prospectiveApprovalIsSuperseded,
  exactReadinessPackageDocuments,
  workflowRunEvents,
  readinessOutcomeLabel,
  runStatusLabel,
  runTerminalClassificationLabel,
  workOutcomeProductLabel,
  workflowStepState,
  type ProposalSelection,
  type WorkflowMaterial,
} from "../ui/src/workbench-presentation.ts";

const uuidA = "11111111-1111-4111-8111-111111111111";
const uuidB = "22222222-2222-4222-8222-222222222222";
const uuidC = "33333333-3333-4333-8333-333333333333";
const uuidD = "44444444-4444-4444-8444-444444444444";
const uuidE = "55555555-5555-4555-8555-555555555555";
const uuidF = "66666666-6666-4666-8666-666666666666";
const uuidG = "77777777-7777-4777-8777-777777777777";
const uuidH = "88888888-8888-4888-8888-888888888888";
const uuidI = "99999999-9999-4999-8999-999999999999";
const commit = "a".repeat(40);
const hash = `sha256:${"a".repeat(64)}`;
const stamp = "2026-11-14T00:00:00.000Z";
const reachedAll = new Set<WorkItem["stage"]>([
  "IDEA", "R1", "R2", "DESIGN", "PLAN", "R3",
  "AWAITING_SIGNOFF", "EXECUTION", "COMPLETE",
]);

const workItem = (
  stage: WorkItem["stage"],
  outcome: WorkItem["outcome"] = null,
): WorkItem =>
  WorkItemSchema.parse({
    id: `work_${uuidA}`,
    projectId: "order",
    repositoryRoot: "/repo",
    title: "Presentation policy",
    origin: "test",
    schemaId: "change-v1",
    sourcePath: `work_${uuidA}.md`,
    sourceSha256: hash,
    derivedFromWorkItemId: null,
    stage,
    status: stage === "COMPLETE" ? "COMPLETE" : "ACTIVE",
    outcome,
    concernIds: [],
    archived: false,
    createdAt: stamp,
  });

const stageRun = (
  stage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
  status: Run["status"],
  attempt: number,
  idSuffix: string,
): Run =>
  RunSchema.parse({
    id: `run_${idSuffix}`,
    workItemId: `work_${uuidA}`,
    executionTaskId: null,
    stage,
    mode: "INTERACTIVE",
    role: "STAGE",
    triggerEventId: null,
    status,
    attempt,
    baselineCommit: commit,
    contextHash: hash,
    providerSessionId: null,
    terminalClassification: status === "FAILED" ? "PROVIDER_FAILURE" : null,
    startedAt: stamp,
    endedAt:
      status === "COMPLETED" ||
      status === "BLOCKED" ||
      status === "FAILED" ||
      status === "CANCELLED"
        ? stamp
        : null,
  });

const artifact = (
  role: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
  idSuffix: string,
): ArtifactRef =>
  ArtifactRefSchema.parse({
    id: `artifact_${idSuffix}`,
    workItemId: `work_${uuidA}`,
    repositoryPath: `docs/${role.toLowerCase()}.md`,
    role,
    authorityLayer: "P7",
    sha256: hash,
    gitCommit: commit,
  });

const task = (idSuffix: string, state: ExecutionTask["state"]): ExecutionTask =>
  ExecutionTaskSchema.parse({
    id: `task_${idSuffix}`,
    approvalId: `approval_${uuidB}`,
    planTaskId: "T1",
    objective: "Implement the workbench",
    dependsOn: [],
    scope: ["ui/src/**"],
    exclusions: [],
    acceptanceRefs: [],
    changeSurface: ["ui/src/WorkItemWorkspace.tsx"],
    gateIds: [],
    authorityRefs: [],
    concernIds: [],
    state,
  });

const executionRun = (
  executionTask: ExecutionTask,
  status: Run["status"],
  idSuffix: string,
): Run =>
  RunSchema.parse({
    id: `run_${idSuffix}`,
    workItemId: `work_${uuidA}`,
    executionTaskId: executionTask.id,
    stage: "EXECUTION",
    mode: "UNATTENDED",
    role: "BUILDER",
    triggerEventId: null,
    status,
    attempt: 1,
    baselineCommit: commit,
    contextHash: hash,
    providerSessionId: null,
    terminalClassification: status === "FAILED" ? "PROVIDER_FAILURE" : null,
    startedAt: stamp,
    endedAt:
      status === "COMPLETED" ||
      status === "BLOCKED" ||
      status === "FAILED" ||
      status === "CANCELLED"
        ? stamp
        : null,
  });

type MaterialFixtureInput = Omit<
  Parameters<typeof resolveWorkflowMaterial>[0],
  "currentStageRunId" | "currentAttention" | "stageInteraction" | "executionOwner"
> & Readonly<{
  currentStageRunId?: Run["id"] | null;
  currentAttention?: Parameters<typeof resolveWorkflowMaterial>[0]["currentAttention"];
  stageInteraction?: Parameters<typeof resolveWorkflowMaterial>[0]["stageInteraction"];
  executionOwner?: Parameters<typeof resolveWorkflowMaterial>[0]["executionOwner"];
  unresolvedInputRunId?: Run["id"] | null;
}>;

const resolveFixtureMaterial = (
  input: MaterialFixtureInput,
): WorkflowMaterial => {
  const currentRun = [...input.runs]
    .filter((run) => run.role === "STAGE" && run.stage === input.workItem.stage)
    .sort((left, right) =>
      left.attempt - right.attempt ||
      left.startedAt.localeCompare(right.startedAt) ||
      left.id.localeCompare(right.id))
    .at(-1) ?? null;

  let stageInteraction = input.stageInteraction ?? null;
  let currentAttention = input.currentAttention ?? "ORDINARY";
  if (currentRun !== null && stageInteraction === null) {
    if (
      input.unresolvedInputRunId !== undefined &&
      input.unresolvedInputRunId === currentRun.id
    ) {
      stageInteraction = {
        tag: "REQUIRED_INPUT",
        requestEventId: `event_${uuidI}`,
      };
      if (currentAttention === "ORDINARY") currentAttention = "REQUIRED_INPUT";
    } else if (
      currentRun.status === "RUNNING" ||
      currentRun.status === "WAITING_FOR_INPUT"
    ) {
      stageInteraction = { tag: "OPEN" };
    } else {
      stageInteraction = { tag: "CLOSED" };
    }
  }
  if (currentAttention === "ORDINARY" && currentRun?.status === "BLOCKED") {
    currentAttention = "BLOCKER";
  } else if (
    currentAttention === "ORDINARY" &&
    (currentRun?.status === "FAILED" || currentRun?.status === "CANCELLED")
  ) {
    currentAttention = "RECOVERY";
  } else if (
    currentAttention === "ORDINARY" &&
    input.pendingProposal !== undefined &&
    input.pendingProposal !== null
  ) {
    currentAttention = "PROPOSAL_DECISION";
  }

  const tasks = input.tasks ?? [];
  const executionOwner =
    input.executionOwner ??
    (() => {
      const blocked = tasks.find((task) => task.state === "BLOCKED");
      if (blocked) return { tag: "BLOCKED_TASK" as const, taskId: blocked.id };
      const running = tasks.find((task) => task.state === "RUNNING");
      if (running) return { tag: "CURRENT_TASK" as const, taskId: running.id };
      return { tag: "NONE" as const };
    })();

  return resolveWorkflowMaterial({
    ...input,
    currentStageRunId: input.currentStageRunId ?? currentRun?.id ?? null,
    currentStageRunActive:
      currentRun?.status === "RUNNING" || currentRun?.status === "WAITING_FOR_INPUT",
    currentAttention,
    stageInteraction,
    executionOwner,
  });
};

describe("IA32 execution feedback", () => {
  it("humanizes recorded terminal classification without fabricating a failure event", () => {
    expect(runTerminalClassificationLabel("PRECONDITION_FAILED")).toBe("An execution prerequisite failed.");
    expect(runTerminalClassificationLabel("PROVIDER_FAILURE")).toBe("The agent provider failed.");
    expect(runTerminalClassificationLabel("COORDINATOR_INTERRUPTED")).toBe("The implementation attempt was interrupted.");
    expect(runTerminalClassificationLabel(null)).toContain("no matching terminal failure reason");
  });
});

describe("workflow presentation policy", () => {
  it("binds Context to exact ArtifactRef identity rather than same-path bytes or a foreign WorkItem", () => {
    const item = workItem("PLAN");
    const historical = artifact("PLAN", uuidB);
    const current = ArtifactRefSchema.parse({ ...historical, id: "artifact_" + uuidC,
      gitCommit: null, sha256: "sha256:" + "b".repeat(64) });
    const foreign = ArtifactRefSchema.parse({ ...historical, workItemId: "work_" + uuidD });
    const reported = { path: current.repositoryPath, sha256: current.sha256, artifactId: current.id };
    const id = selectedContextArtifactId({ kind: "STAGE_DOCUMENT", artifactId: historical.id }, reported);
    expect(id).toBe(historical.id);
    expect(resolveContextArtifact(item.id, id, [foreign, current, historical])).toEqual(historical);
    expect(resolveContextArtifact(item.id, id, [current, foreign])).toBeNull();
    expect(selectedContextArtifactId({ kind: "SOURCE_DOCUMENT" }, reported)).toBeNull();
    expect(selectedContextArtifactId({ kind: "APPROVAL_PACKAGE", artifactId: current.id }, reported)).toBe(current.id);
    expect(selectedContextArtifactId({ kind: "APPROVAL_PACKAGE" }, reported)).toBeNull();
    expect(selectedContextArtifactId({ kind: "APPROVAL_PACKAGE" }, null)).toBeNull();
  });

  it("keeps workflow semantics independent of theme selection", () => {
    const presentation = readFileSync(
      new URL("../ui/src/workbench-presentation.ts", import.meta.url),
      "utf8",
    );
    expect(presentation).not.toMatch(/data-theme|prefers-color-scheme|colorScheme|localStorage/);
  });
  it("binds Approval identity to its exact parent and selected child", () => {
    const first: WorkflowMaterial = { kind: "APPROVAL_PACKAGE", approvalId: `approval_${uuidA}` };
    const second: WorkflowMaterial = { kind: "APPROVAL_PACKAGE", approvalId: `approval_${uuidB}` };
    expect(workflowMaterialIdentity(first)).not.toBe(workflowMaterialIdentity(second));
    expect(workflowMaterialIdentity({ ...first, artifactId: `artifact_${uuidC}` }))
      .not.toBe(workflowMaterialIdentity(first));
    expect(workflowMaterialIdentity({ ...first, taskId: `task_${uuidD}` }))
      .not.toBe(workflowMaterialIdentity(first));
    expect(workflowMaterialIdentity({kind:"APPROVAL_PACKAGE",packageHash:hash}))
      .not.toBe(workflowMaterialIdentity(first));
  });

  it("preserves prospective package and child identity on a superseding observation", () => {
    const first = bindProspectiveApprovalSelection({ kind: "APPROVAL_PACKAGE" }, hash);
    const detail = { ...first, taskId: "T1" };
    const replacementHash = `sha256:${"b".repeat(64)}`;
    expect(bindProspectiveApprovalSelection(detail, replacementHash)).toEqual(detail);
    expect(prospectiveApprovalIsSuperseded(detail, replacementHash)).toBe(true);
    expect(prospectiveApprovalIsSuperseded(detail, hash)).toBe(false);
    expect(bindProspectiveApprovalSelection(detail, null)).toEqual(detail);
    const replacement = bindProspectiveApprovalSelection({ kind: "APPROVAL_PACKAGE" }, replacementHash);
    expect(replacement).toEqual({ kind: "APPROVAL_PACKAGE", packageHash: replacementHash });
    expect(prospectiveApprovalIsSuperseded(replacement, replacementHash)).toBe(false);
  });

  it("admits reviewed documents only from a closure containing the exact R3 root", () => {
    const root = artifact("R3", uuidB);
    const plan = artifact("PLAN", uuidC);
    const competing = ArtifactRefSchema.parse({ ...root, id: "artifact_" + uuidD });
    const foreign = ArtifactRefSchema.parse({ ...plan, workItemId: "work_" + uuidE });
    expect(exactReadinessPackageDocuments(root, [root, plan])).toEqual([plan]);
    expect(exactReadinessPackageDocuments(root, [competing, plan])).toBeNull();
    expect(exactReadinessPackageDocuments(root, [root, foreign])).toBeNull();
    expect(exactReadinessPackageDocuments(root, [root, root, plan])).toBeNull();
    expect(exactReadinessPackageDocuments(root, [plan])).toBeNull();
  });

  it("uses explicit canonical product labels and typed Readiness outcomes", () => {
    expect(stageCompletionProductLabel({stage:"R1",outcome:"CONFIRMED"})).toBe("Research confirmed the work request");
    expect(stageCompletionProductLabel({stage:"R1",outcome:"DISPROVEN"})).toBe("Research disproved the work request");
    expect(stageCompletionProductLabel({stage:"R1",outcome:"DUPLICATE"})).toBe("Duplicate work identified");
    expect(stageCompletionProductLabel({stage:"R1",outcome:"ALREADY_SATISFIED"})).toBe("Work already satisfied");
    expect(stageCompletionProductLabel({stage:"R1",outcome:"INVESTIGATION_COMPLETE"})).toBe("Investigation complete");
    expect(stageCompletionProductLabel({stage:"R1",outcome:"AUDIT_COMPLETE"})).toBe("Audit complete");
    expect(stageCompletionProductLabel({stage:"R2",outcome:"ACCEPTED"})).toBe("Requirements accepted");
    expect(stageCompletionProductLabel({stage:"DESIGN",outcome:"ACCEPTED"})).toBe("Solution design accepted");
    expect(stageCompletionProductLabel({stage:"PLAN",outcome:"ACCEPTED"})).toBe("Implementation plan accepted");
    expect(stageCompletionProductLabel({stage:"R3",outcome:"READY_FOR_SIGNOFF"})).toBe("Ready for sign-off");
    expect(workOutcomeProductLabel(null)).toBe("Complete");
    expect(workOutcomeProductLabel("DISPROVEN")).toBe("Disproven");
    expect(workOutcomeProductLabel("DUPLICATE")).toBe("Duplicate");
    expect(workOutcomeProductLabel("ALREADY_SATISFIED")).toBe("Already satisfied");
    expect(workOutcomeProductLabel("INVESTIGATION_COMPLETE")).toBe("Investigation complete");
    expect(workOutcomeProductLabel("AUDIT_COMPLETE")).toBe("Audit complete");
    expect(workOutcomeProductLabel("CANDIDATE_DONE")).toBe("Verified candidate");

    expect(readinessOutcomeLabel("READY_FOR_SIGNOFF")).toBe("Ready for sign-off");
    expect(readinessOutcomeLabel("RETURN_TO_RESEARCH")).toBe("Return to Research");
    expect(readinessOutcomeLabel("RETURN_TO_REQUIREMENTS")).toBe("Return to Requirements");
    expect(readinessOutcomeLabel("RETURN_TO_DESIGN")).toBe("Return to Solution design");
    expect(readinessOutcomeLabel("RETURN_TO_PLAN")).toBe("Return to Implementation plan");
  });
  it("projects current, historical and unreached workflow steps", () => {
    const current = workItem("PLAN");
    const reached = new Set<WorkItem["stage"]>(["IDEA", "R1", "PLAN"]);
    expect(workflowStepState(current, reached, "PLAN")).toBe("CURRENT");
    expect(workflowStepState(current, reached, "R1")).toBe("HISTORICAL");
    expect(workflowStepState(current, reached, "R3")).toBe("UNREACHED");
  });

  it("shows an unreached persisted lifecycle draft without fabricating reach", () => {
    const plan = artifact("PLAN", uuidB);
    const reached = new Set<WorkItem["stage"]>(["IDEA", "R1", "R2", "DESIGN"]);
    expect(resolveFixtureMaterial({
      reachedStages: reached,
      workItem: workItem("DESIGN"),
      selectedStep: "PLAN",
      runs: [],
      artifacts: [plan],
    })).toEqual({
      kind: "STAGE_DOCUMENT",
      artifactId: plan.id,
    });
    expect(workflowStepState(workItem("DESIGN"), reached, "PLAN"))
      .toBe("UNREACHED");
  });

  it("keeps an unreached lifecycle step empty when no repository draft exists", () => {
    const reached = new Set<WorkItem["stage"]>(["IDEA", "R1", "R2", "DESIGN"]);
    expect(resolveFixtureMaterial({
      reachedStages: reached,
      workItem: workItem("DESIGN"),
      selectedStep: "PLAN",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "UNREACHED" });
  });

  it("resolves current pre-signoff material by the canonical priority", () => {
    const failed = stageRun("R1", "FAILED", 3, uuidB);
    const waiting = stageRun("R1", "WAITING_FOR_INPUT", 2, uuidC);
    const running = stageRun("R1", "RUNNING", 1, uuidD);
    const research = artifact("R1", uuidE);
    const proposal: ProposalSelection = {
      runId: waiting.id,
      eventId: `event_${uuidF}`,
    };

    const base = {
      reachedStages: reachedAll,
      workItem: workItem("R1"),
      selectedStep: "R1" as const,
      runs: [failed, waiting, running],
      artifacts: [research],
      unresolvedInputRunId: waiting.id,
      pendingProposal: proposal,
    };

    expect(resolveFixtureMaterial(base)).toEqual({
      kind: "STAGE_RUN",
      runId: failed.id,
    });
    expect(resolveFixtureMaterial({
      ...base,
      runs: [waiting, running],
    })).toEqual({
      kind: "STAGE_RUN",
      runId: waiting.id,
    });
    expect(resolveFixtureMaterial({
      ...base,
      runs: [waiting],
      unresolvedInputRunId: null,
      pendingProposal: {
        runId: waiting.id,
        eventId: proposal.eventId,
      },
    })).toEqual({
      kind: "PROPOSAL",
      runId: waiting.id,
      eventId: proposal.eventId,
    });
    const runningProposal: ProposalSelection = {
      runId: running.id,
      eventId: proposal.eventId,
    };
    expect(resolveFixtureMaterial({
      ...base,
      runs: [running],
      unresolvedInputRunId: null,
      pendingProposal: runningProposal,
    })).toEqual({
      kind: "PROPOSAL",
      runId: runningProposal.runId,
      eventId: runningProposal.eventId,
    });
    expect(resolveFixtureMaterial({
      ...base,
      runs: [running],
      unresolvedInputRunId: null,
      pendingProposal: null,
    })).toEqual({
      kind: "STAGE_RUN",
      runId: running.id,
    });
    expect(resolveFixtureMaterial({
      ...base,
      runs: [],
      unresolvedInputRunId: null,
      pendingProposal: null,
    })).toEqual({
      kind: "STAGE_DOCUMENT",
      artifactId: research.id,
    });
    expect(resolveFixtureMaterial({
      ...base,
      runs: [],
      artifacts: [],
      unresolvedInputRunId: null,
      pendingProposal: null,
    })).toEqual({ kind: "STEP_STATE" });
  });

  it("defaults historical pre-signoff steps to their governed artifact, then latest Run", () => {
    const current = workItem("PLAN");
    const research = artifact("R1", uuidB);
    const oldRun = stageRun("R1", "COMPLETED", 1, uuidC);
    const newerRun = stageRun("R1", "COMPLETED", 2, uuidD);

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: current,
      selectedStep: "R1",
      runs: [newerRun, oldRun],
      artifacts: [research],
    })).toEqual({
      kind: "STAGE_DOCUMENT",
      artifactId: research.id,
    });

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: current,
      selectedStep: "R1",
      runs: [newerRun, oldRun],
      artifacts: [],
    })).toEqual({
      kind: "STAGE_RUN",
      runId: newerRun.id,
    });
  });

  it("preserves explicit historical inspection across current attention categories", () => {
    const current = stageRun("PLAN", "WAITING_FOR_INPUT", 2, uuidB);
    const historical = stageRun("PLAN", "COMPLETED", 1, uuidC);
    const historicalSelection = { kind: "STAGE_RUN", runId: historical.id } as const;
    const base = {
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "PLAN" as const,
      runs: [historical, current],
      artifacts: [artifact("PLAN", uuidD)],
      currentStageRunId: current.id,
      explicitSelection: historicalSelection,
    };
    for (const currentAttention of [
      "REQUIRED_INPUT",
      "PROPOSAL_DECISION",
      "BLOCKER",
      "RECOVERY",
      "MUTATION_CONFLICT",
    ] as const) {
      expect(resolveFixtureMaterial({
        ...base,
        currentAttention,
        stageInteraction:
          currentAttention === "REQUIRED_INPUT"
            ? { tag: "REQUIRED_INPUT", requestEventId: `event_${uuidI}` }
            : { tag: "OPEN" },
        pendingProposal:
          currentAttention === "PROPOSAL_DECISION"
            ? { runId: current.id, eventId: `event_${uuidF}` }
            : null,
      })).toEqual(historicalSelection);
    }
  });

  it("resolves Readiness, Approval, Implementation and Complete without generic modes", () => {
    const blocked = stageRun("R3", "BLOCKED", 1, uuidB);
    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("R3"),
      selectedStep: "R3",
      runs: [blocked],
      artifacts: [],
    })).toEqual({ kind: "STAGE_RUN", runId: blocked.id });

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("R3"),
      selectedStep: "R3",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "READINESS_REVIEW" });

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("AWAITING_SIGNOFF"),
      selectedStep: "AWAITING_SIGNOFF",
      runs: [],
      artifacts: [],
      approvalPackageAvailable: true,
    })).toEqual({ kind: "APPROVAL_PACKAGE" });

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "AWAITING_SIGNOFF",
      runs: [],
      artifacts: [],
      approvalPackageAvailable: false,
    })).toEqual({ kind: "APPROVAL_PACKAGE" });

    const executionTask = task(uuidC, "RUNNING");
    const run = executionRun(executionTask, "RUNNING", uuidD);
    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("EXECUTION"),
      selectedStep: "EXECUTION",
      runs: [run],
      artifacts: [],
      tasks: [executionTask],
    })).toEqual({
      kind: "EXECUTION_TASK",
      taskId: executionTask.id,
      runId: run.id,
    });

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("COMPLETE", "CANDIDATE_DONE"),
      selectedStep: "COMPLETE",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "TERMINAL_RESULT" });
  });

  it("treats a missing execution-owner task as transport convergence only", () => {
    const executionTask = task(uuidC, "RUNNING");
    const run = executionRun(executionTask, "RUNNING", uuidD);
    const input = {
      workItem: workItem("EXECUTION"),
      selectedStep: "EXECUTION" as const,
      reachedStages: reachedAll,
      runs: [run],
      artifacts: [],
      currentStageRunId: null,
      stageInteraction: null,
      executionOwner: {
        tag: "CURRENT_TASK" as const,
        taskId: executionTask.id,
      },
      tasks: [],
    };

    expect(resolveWorkflowMaterial({
      ...input,
      currentAttention: "CONVERGING",
    })).toEqual({ kind: "STEP_STATE" });

    expect(() => resolveWorkflowMaterial({
      ...input,
      currentAttention: "ORDINARY",
    })).toThrow(/execution owner must identify a loaded ExecutionTask/);
  });

  it("keeps an active current STAGE Run stable during transport convergence", () => {
    const plan = artifact("PLAN", uuidB);
    const running = stageRun("PLAN", "RUNNING", 1, uuidC);
    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "PLAN",
      runs: [running],
      artifacts: [plan],
      currentAttention: "CONVERGING",
      stageInteraction: null,
    })).toEqual({ kind: "STAGE_RUN", runId: running.id });
  });

  it("keeps canonical lifecycle document material stable during transport convergence", () => {
    const plan = artifact("PLAN", uuidB);
    const completed = stageRun("PLAN", "COMPLETED", 1, uuidC);
    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "PLAN",
      runs: [completed],
      artifacts: [plan],
      currentAttention: "CONVERGING",
      stageInteraction: { tag: "CLOSED" },
    })).toEqual({ kind: "STAGE_DOCUMENT", artifactId: plan.id });
  });

  it("preserves available explicit selection independently of current attention", () => {
    const research = artifact("R1", uuidB);
    const running = stageRun("R1", "RUNNING", 1, uuidC);
    const failed = stageRun("R1", "FAILED", 2, uuidD);
    const explicit: WorkflowMaterial = {
      kind: "STAGE_DOCUMENT",
      artifactId: research.id,
    };

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("R1"),
      selectedStep: "R1",
      runs: [running],
      artifacts: [research],
      explicitSelection: explicit,
      dirtyDocument: false,
    })).toEqual(explicit);

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("R1"),
      selectedStep: "R1",
      runs: [failed],
      artifacts: [research],
      explicitSelection: explicit,
      dirtyDocument: false,
    })).toEqual(explicit);

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("R1"),
      selectedStep: "R1",
      runs: [failed],
      artifacts: [research],
      explicitSelection: explicit,
      dirtyDocument: true,
    })).toEqual(explicit);

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("R1"),
      selectedStep: "R1",
      runs: [running],
      artifacts: [],
      explicitSelection: explicit,
      dirtyDocument: true,
    })).toEqual({
      kind: "STAGE_RUN",
      runId: running.id,
    });
  });


  it("keeps explicit proposal inspection valid independently of default proposal priority", () => {
    const running = stageRun("PLAN", "RUNNING", 1, uuidB);
    const explicit: WorkflowMaterial = {
      kind: "PROPOSAL",
      runId: running.id,
      eventId: `event_${uuidC}`,
    };

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "PLAN",
      runs: [running],
      artifacts: [],
      pendingProposal: null,
      explicitSelection: explicit,
    })).toEqual(explicit);
  });

  it("keeps explicit historical inspection while current attention remains independently owned", () => {
    const selectedAttempt = stageRun("PLAN", "FAILED", 2, uuidB);
    const currentBlocker = stageRun("PLAN", "BLOCKED", 4, uuidC);

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "PLAN",
      runs: [selectedAttempt, currentBlocker],
      artifacts: [],
    })).toEqual({
      kind: "STAGE_RUN",
      runId: currentBlocker.id,
    });

    expect(resolveFixtureMaterial({
      reachedStages: reachedAll,
      workItem: workItem("PLAN"),
      selectedStep: "PLAN",
      runs: [selectedAttempt, currentBlocker],
      artifacts: [],
      explicitSelection: {
        kind: "STAGE_RUN",
        runId: selectedAttempt.id,
      },
    })).toEqual({
      kind: "STAGE_RUN",
      runId: selectedAttempt.id,
    });
  });

  it("discovers the latest unresolved canonical proposal from persisted events", () => {
    const proposalA = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: `run_${uuidA}`,
      sequence: 1,
      occurredAt: stamp,
      event: {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/a.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        rationale: "First proposal",
        unifiedDiff: "--- a/docs/a.md\n+++ b/docs/a.md\n",
      },
    });
    const disposedA = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: `run_${uuidA}`,
      sequence: 2,
      occurredAt: stamp,
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposalA.id,
        disposition: "REJECTED",
        adoptedArtifactRefId: null,
      },
    });
    const proposalB = RunEventSchema.parse({
      id: `event_${uuidD}`,
      runId: `run_${uuidA}`,
      sequence: 3,
      occurredAt: stamp,
      event: {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/b.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        rationale: "Current proposal",
        unifiedDiff: "--- a/docs/b.md\n+++ b/docs/b.md\n",
      },
    });

    expect(pendingProposalForEvents([proposalA, disposedA, proposalB]))
      .toEqual({ runId: proposalB.runId, eventId: proposalB.id });
    expect(pendingProposalForEvents([proposalA, disposedA])).toBeNull();
  });

  it("returns an explicit unreached material without mutating lifecycle meaning", () => {
    expect(resolveFixtureMaterial({
      reachedStages: new Set<WorkItem["stage"]>(["IDEA", "R1"]),
      workItem: workItem("R1"),
      selectedStep: "PLAN",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "UNREACHED" });
  });
});

describe("RunEvent presentation planes", () => {
  const event = (sequence: number, payload: RunEventPayload) =>
    RunEventSchema.parse({
      id: `event_00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
      runId: `run_${uuidB}`,
      sequence,
      occurredAt: stamp,
      event: payload,
    });

  it("projects one chronology into conversation, activity and workflow without duplication", () => {
    const events = [
      event(1, { tag: "AGENT_MESSAGE_FINAL", text: "Ready for your reply", evidence: [] }),
      event(2, { tag: "HUMAN_INPUT_RECEIVED", requestEventId: null, text: "Continue" }),
      event(3, { tag: "AGENT_ACTIVITY_RECORDED", category: "READING", summary: "Reading repository material", resource: null }),
      event(4, { tag: "OBSERVATION_RECORDED", title: "Observed", detail: "System evidence", evidence: [] }),
      event(5, { tag: "HUMAN_INPUT_REQUESTED", category: "INFORMATION", question: "Which constraint applies?" }),
    ];

    expect(events.map(runEventPlane)).toEqual([
      "CONVERSATION",
      "CONVERSATION",
      "ACTIVITY",
      "WORKFLOW",
      "CONVERSATION",
    ]);
    expect(conversationRunEvents(events).map((item) => item.sequence)).toEqual([1, 2, 5]);
    expect(agentActivityRunEvents(events).map((item) => item.sequence)).toEqual([3]);
    expect(workflowRunEvents(events).map((item) => item.sequence)).toEqual([4]);
  });
});

describe("Run presentation", () => {
  it("labels every canonical Run status", () => {
    expect(RunStatusSchema.options.map((status) => runStatusLabel(status))).toEqual([
      "Running",
      "Waiting for you",
      "Completed",
      "Blocked",
      "Failed",
      "Cancelled",
    ]);
  });

  it("renders every current RunEvent tag through the production projection", () => {
    const eventId = `event_${uuidB}`;
    const artifactId = `artifact_${uuidC}`;
    const evidence = [{
      relativePath: "evidence.txt",
      sha256: hash,
      mediaType: "text/plain",
    }];
    const validationIds = [
      uuidB, uuidC, uuidD, uuidE, uuidF, uuidG, uuidH, uuidI,
    ].map((value) => `event_${value}`);

    const payloads: readonly RunEventPayload[] = [
      { tag: "STAGE_STARTED", stage: "R1", mode: "INTERACTIVE", contextHash: hash },
      { tag: "AGENT_MESSAGE_FINAL", text: "Done", evidence },
      { tag: "HUMAN_INPUT_REQUESTED", category: "INFORMATION", question: "Clarify?" },
      { tag: "HUMAN_INPUT_RECEIVED", requestEventId: eventId, text: "Answer" },
      {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/r1.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: "--- a/docs/r1.md\n+++ b/docs/r1.md\n@@ -1 +1 @@\n-old\n+new\n",
        rationale: "Update research",
      },
      { tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED", proposalEventId: eventId },
      {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: eventId,
        disposition: "REJECTED",
        adoptedArtifactRefId: null,
      },
      {
        tag: "STAGE_COMPLETED",
        completion: { stage: "R1", outcome: "CONFIRMED" },
        artifactRefIds: [artifactId],
      },
      { tag: "STAGE_BLOCKED", reason: "Blocked", owningStage: "R1" },
      { tag: "TASK_ALREADY_SATISFIED", summary: "Already satisfied" },
      {
        tag: "CONFORMANCE_PASSED",
        stage: "R1",
        outputArtifactRefIds: [artifactId],
        contextHash: hash,
        evidence,
      },
      {
        tag: "CONFORMANCE_FAILED",
        stage: "R1",
        defectiveLayer: "P3",
        summary: "Nonconformant",
        evidence,
      },
      { tag: "PROVIDER_DIAGNOSTICS_RECORDED", evidence },
      {
        tag: "PRODUCTIVE_INVOCATION_FAILED",
        classification: "ENVIRONMENT_BLOCKED",
        detail: "Agent setup unavailable",
        evidence,
      },
      { tag: "PROVIDER_FAILED", detail: "Provider unavailable", evidence },
      { tag: "GATE_CHECKPOINT_REQUESTED", gateId: "test" },
      { tag: "GATE_PASSED", gateId: "test", evidence },
      {
        tag: "GATE_FAILED",
        gateId: "test",
        classification: "TEST_FAILURE",
        evidence,
      },
      { tag: "REVIEW_PASSED", evidence },
      {
        tag: "REVIEW_FAILED",
        classification: "REVIEW_FAILURE",
        summary: "Review failed",
        evidence,
      },
      { tag: "VALIDATION_PASSED", stage: "V0", evidence },
      {
        tag: "VALIDATION_FAILED",
        stage: "V1",
        classification: "TEST_FAILURE",
        summary: "Validation failed",
        evidence,
      },
      {
        tag: "CANDIDATE_STATE_RECORDED",
        patch: evidence[0]!,
        changedPaths: ["ui/src/WorkItemWorkspace.tsx"],
      },
      {
        tag: "CANDIDATE_RECORDED",
        candidateStateEventId: eventId,
        validationEventIds: validationIds,
      },
      {
        tag: "AUTHORITY_CHANGED",
        priorArtifactRefId: artifactId,
        newArtifactRefId: `artifact_${uuidD}`,
      },
      {
        tag: "REPOSITORY_DRIFTED",
        expectedCommit: commit,
        actualCommit: "b".repeat(40),
      },
      {
        tag: "OBSERVATION_RECORDED",
        title: "Observation",
        detail: "Detail",
        evidence,
      },
    ];

    const presentations = payloads.map((payload, index) => {
      const parsed = RunEventSchema.parse({
        id: eventId,
        runId: `run_${uuidA}`,
        sequence: index + 1,
        occurredAt: stamp,
        event: payload,
      });
      return [payload.tag, runEventPresentation(parsed)] as const;
    });

    expect(presentations.map(([tag]) => tag)).toEqual([
      "STAGE_STARTED",
      "AGENT_MESSAGE_FINAL",
      "HUMAN_INPUT_REQUESTED",
      "HUMAN_INPUT_RECEIVED",
      "ARTIFACT_PROPOSAL_CREATED",
      "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
      "ARTIFACT_PROPOSAL_DISPOSITIONED",
      "STAGE_COMPLETED",
      "STAGE_BLOCKED",
      "TASK_ALREADY_SATISFIED",
      "CONFORMANCE_PASSED",
      "CONFORMANCE_FAILED",
      "PROVIDER_DIAGNOSTICS_RECORDED",
      "PRODUCTIVE_INVOCATION_FAILED",
      "PROVIDER_FAILED",
      "GATE_CHECKPOINT_REQUESTED",
      "GATE_PASSED",
      "GATE_FAILED",
      "REVIEW_PASSED",
      "REVIEW_FAILED",
      "VALIDATION_PASSED",
      "VALIDATION_FAILED",
      "CANDIDATE_STATE_RECORDED",
      "CANDIDATE_RECORDED",
      "AUTHORITY_CHANGED",
      "REPOSITORY_DRIFTED",
      "OBSERVATION_RECORDED",
    ]);
    for (const [, presentation] of presentations) {
      expect(presentation.label.length).toBeGreaterThan(0);
      expect(presentation.detail.length).toBeGreaterThan(0);
    }
    expect(
      presentations.find(([tag]) => tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED")?.[1].label,
    ).toBe("Document adoption in progress");
    expect(
      presentations.find(([tag]) => tag === "PROVIDER_DIAGNOSTICS_RECORDED")?.[1].label,
    ).toBe("Technical diagnostics available");
    expect(
      presentations.find(([tag]) => tag === "PRODUCTIVE_INVOCATION_FAILED")?.[1].label,
    ).toBe("Agent setup blocked");
    expect(
      presentations.find(([tag]) => tag === "PROVIDER_FAILED")?.[1].label,
    ).toBe("Agent execution failed");
    expect(
      presentations.find(([tag]) => tag === "GATE_CHECKPOINT_REQUESTED")?.[1],
    ).toEqual({
      label: "Verification checkpoint requested",
      detail: "test is awaiting coordinator verification.",
      tone: "neutral",
    });
  });
});


describe("verified candidate evidence projection", () => {
  it("uses only the final approval's exact candidate state and validation references", () => {
    const historical = task(uuidC, "CANDIDATE_DONE");
    const current = ExecutionTaskSchema.parse({ ...task(uuidD, "CANDIDATE_DONE"), approvalId: "approval_" + uuidE });
    const builder = RunSchema.parse({ ...executionRun(current, "COMPLETED", uuidF), terminalClassification: "CANDIDATE_DONE" });
    const event = (run: Run, sequence: number, identity: number, payload: RunEventPayload) =>
      RunEventSchema.parse({ id: "event_00000000-0000-4000-8000-" + String(identity).padStart(12, "0"), runId: run.id, sequence, occurredAt: stamp, event: payload });
    const state = event(builder, 1, 1, { tag: "CANDIDATE_STATE_RECORDED", patch: { relativePath: "candidate.patch", sha256: hash, mediaType: "text/x-diff" }, changedPaths: ["ui/src/WorkItemWorkspace.tsx"] });
    const reviewer = RunSchema.parse({ ...executionRun(current, "COMPLETED", uuidG), role: "REVIEWER", triggerEventId: state.id, terminalClassification: "CANDIDATE_DONE" });
    const validations = (["V0","V1","V2","V3","V4","V5","V6","V7"] as const).map((stage, i) => event(reviewer, i + 1, i + 2, { tag: "VALIDATION_PASSED", stage, evidence: [] }));
    const record = event(reviewer, 9, 10, { tag: "CANDIDATE_RECORDED", candidateStateEventId: state.id, validationEventIds: validations.map((v) => v.id) });
    const oldRun = executionRun(historical, "FAILED", uuidH);
    const oldEvent = event(oldRun, 1, 11, { tag: "PROVIDER_FAILED", detail: "Unrelated failed attempt", evidence: [] });
    const all = [state, ...validations, record, oldEvent];
    expect(latestApprovalTasks([historical, current])).toEqual([current]);
    expect(verifiedCandidateProofEvents([historical, current], [builder, reviewer, oldRun], all)).toEqual([state, ...validations]);
    expect(verifiedCandidateProofEvents([current], [builder, reviewer], all.filter((v) => v.id !== validations[2]!.id))).toEqual([]);
    expect(verifiedCandidateProofEvents([current], [builder, reviewer], all.filter((v) => v.id !== record.id))).toEqual([]);
  });
});
