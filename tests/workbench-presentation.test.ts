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
  resolveWorkflowMaterial,
  runEventPresentation,
  runStatusLabel,
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

describe("workflow presentation policy", () => {
  it("projects current, historical and unreached workflow steps", () => {
    const current = workItem("PLAN");
    expect(workflowStepState(current, "PLAN")).toBe("CURRENT");
    expect(workflowStepState(current, "R1")).toBe("HISTORICAL");
    expect(workflowStepState(current, "R3")).toBe("UNREACHED");
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
      workItem: workItem("R1"),
      selectedStep: "R1" as const,
      runs: [failed, waiting, running],
      artifacts: [research],
      unresolvedInputRunId: waiting.id,
      pendingProposal: proposal,
    };

    expect(resolveWorkflowMaterial(base)).toEqual({
      kind: "STAGE_RUN",
      runId: failed.id,
    });
    expect(resolveWorkflowMaterial({
      ...base,
      runs: [waiting, running],
    })).toEqual({
      kind: "STAGE_RUN",
      runId: waiting.id,
    });
    const runningProposal: ProposalSelection = {
      runId: running.id,
      eventId: proposal.eventId,
    };
    expect(resolveWorkflowMaterial({
      ...base,
      runs: [running],
      unresolvedInputRunId: null,
      pendingProposal: runningProposal,
    })).toEqual({
      kind: "PROPOSAL",
      runId: runningProposal.runId,
      eventId: runningProposal.eventId,
    });
    expect(resolveWorkflowMaterial({
      ...base,
      runs: [running],
      unresolvedInputRunId: null,
      pendingProposal: null,
    })).toEqual({
      kind: "STAGE_RUN",
      runId: running.id,
    });
    expect(resolveWorkflowMaterial({
      ...base,
      runs: [],
      unresolvedInputRunId: null,
      pendingProposal: null,
    })).toEqual({
      kind: "STAGE_DOCUMENT",
      artifactId: research.id,
    });
    expect(resolveWorkflowMaterial({
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

    expect(resolveWorkflowMaterial({
      workItem: current,
      selectedStep: "R1",
      runs: [newerRun, oldRun],
      artifacts: [research],
    })).toEqual({
      kind: "STAGE_DOCUMENT",
      artifactId: research.id,
    });

    expect(resolveWorkflowMaterial({
      workItem: current,
      selectedStep: "R1",
      runs: [newerRun, oldRun],
      artifacts: [],
    })).toEqual({
      kind: "STAGE_RUN",
      runId: newerRun.id,
    });
  });

  it("resolves Readiness, Approval, Implementation and Complete without generic modes", () => {
    const blocked = stageRun("R3", "BLOCKED", 1, uuidB);
    expect(resolveWorkflowMaterial({
      workItem: workItem("R3"),
      selectedStep: "R3",
      runs: [blocked],
      artifacts: [],
    })).toEqual({ kind: "STAGE_RUN", runId: blocked.id });

    expect(resolveWorkflowMaterial({
      workItem: workItem("R3"),
      selectedStep: "R3",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "READINESS_REVIEW" });

    expect(resolveWorkflowMaterial({
      workItem: workItem("AWAITING_SIGNOFF"),
      selectedStep: "AWAITING_SIGNOFF",
      runs: [],
      artifacts: [],
      approvalPackageAvailable: true,
    })).toEqual({ kind: "APPROVAL_PACKAGE" });

    const executionTask = task(uuidC, "RUNNING");
    const run = executionRun(executionTask, "RUNNING", uuidD);
    expect(resolveWorkflowMaterial({
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

    expect(resolveWorkflowMaterial({
      workItem: workItem("COMPLETE", "CANDIDATE_DONE"),
      selectedStep: "COMPLETE",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "TERMINAL_RESULT" });
  });

  it("preserves an explicit valid selection and reconciles an invalid one", () => {
    const research = artifact("R1", uuidB);
    const run = stageRun("R1", "RUNNING", 1, uuidC);
    const explicit: WorkflowMaterial = {
      kind: "STAGE_DOCUMENT",
      artifactId: research.id,
    };

    expect(resolveWorkflowMaterial({
      workItem: workItem("R1"),
      selectedStep: "R1",
      runs: [run],
      artifacts: [research],
      explicitSelection: explicit,
      dirtyDocument: true,
    })).toEqual(explicit);

    expect(resolveWorkflowMaterial({
      workItem: workItem("R1"),
      selectedStep: "R1",
      runs: [run],
      artifacts: [],
      explicitSelection: explicit,
      dirtyDocument: true,
    })).toEqual({
      kind: "STAGE_RUN",
      runId: run.id,
    });
  });

  it("returns an explicit unreached material without mutating lifecycle meaning", () => {
    expect(resolveWorkflowMaterial({
      workItem: workItem("R1"),
      selectedStep: "PLAN",
      runs: [],
      artifacts: [],
    })).toEqual({ kind: "UNREACHED" });
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
  });
});
