import {
  repositoryPathNamesAgentInstruction,
  type Approval,
  type EvidenceRef,
  type ExecutionTask,
  type GateId,
  type RepositoryPath,
  type Run,
  type RunEvent,
  type RunId,
  type ValidationClassification,
  type ValidationStage,
} from "../core/contracts.ts";
import {
  canonicalApprovalPackageJson,
  canonicalJson,
} from "../core/canonical.ts";
import {
  dependencyIsSatisfied,
} from "../core/execution.ts";
import {
  loadValidatedProjectManifest,
  repositoryPatternMatches,
} from "../shell/project.ts";
import {
  proveRepositoryRoot,
} from "../shell/repository.ts";
import {
  runVerificationGate,
} from "../shell/process.ts";
import { sha256Text } from "../shell/runtime.ts";
import { type CoordinatorRuntime } from "./runtime.ts";
import { appendRunEvent, writeRunEvidence } from "./run.ts";
import {
  canonicalTasksForApproval,
  currentMaterialFresh,
  getWorkItem,
  verifyApprovalClosureBytes,
} from "./authority.ts";

export const validationStages = [
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
] as const;

export const appendValidationPassed = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  stage: ValidationStage,
  evidence: readonly EvidenceRef[] = [],
): RunEvent => appendRunEvent(runtime, runId, {
  tag: "VALIDATION_PASSED",
  stage,
  evidence,
});

export const appendValidationFailed = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  stage: ValidationStage,
  classification: Exclude<
    ValidationClassification | "PRECONDITION_FAILED" | "BLOCKED_FOR_REANALYSIS",
    "ALREADY_SATISFIED"
  >,
  summary: string,
  evidence: readonly EvidenceRef[] = [],
): RunEvent => appendRunEvent(runtime, runId, {
  tag: "VALIDATION_FAILED",
  stage,
  classification,
  summary,
  evidence,
});

export const preflightExecutionRun = async (
  runtime: CoordinatorRuntime,
  run: Run,
  approval: Approval,
  task: ExecutionTask,
): Promise<readonly RunEvent[]> => {
  const events: RunEvent[] = [];
  try {
    const closure = await verifyApprovalClosureBytes(runtime, approval);
    const packageHash = sha256Text(
      canonicalApprovalPackageJson({
        workItemId: approval.workItemId,
        baselineCommit: approval.baselineCommit,
        sourceSha256: approval.sourceSha256,
        plan: closure.plan,
        r3: closure.r3,
        materialArtifacts: closure.material,
      }),
    );
    if (packageHash !== approval.packageHash) {
      throw new TypeError("Approval packageHash does not match its signed closure");
    }
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const currentTask = tasks.find((candidate) => candidate.id === task.id);
    if (currentTask === undefined) {
      throw new TypeError("ExecutionTask is not materialized from the current Approval");
    }
    const byId = new Map(tasks.map((candidate) => [candidate.id, candidate] as const));
    if (!task.dependsOn.every((id) => {
      const dependency = byId.get(id);
      return dependency !== undefined && dependencyIsSatisfied(dependency.state);
    })) {
      throw new TypeError("ExecutionTask dependencies are not complete");
    }
    events.push(appendValidationPassed(runtime, run.id, "V0"));
  } catch (error) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V0",
      "SPEC_INVALID",
      error instanceof Error ? error.message : String(error),
    );
    events.push(failure);
    return events;
  }

  try {
    await proveRepositoryRoot(getWorkItem(runtime, run.workItemId).repositoryRoot);
    const fresh = await currentMaterialFresh(runtime, approval);
    if (!fresh) {
      const failure = appendValidationFailed(
        runtime,
        run.id,
        "V1",
        "APPROVAL_STALE",
        "current material authority no longer matches the signed Approval closure",
      );
      events.push(failure);
      return events;
    }
    events.push(appendValidationPassed(runtime, run.id, "V1"));
  } catch (error) {
    const failure = appendValidationFailed(
      runtime,
      run.id,
      "V1",
      "PRECONDITION_FAILED",
      error instanceof Error ? error.message : String(error),
    );
    events.push(failure);
  }
  return events;
};

export const validateChangedPaths = (
  task: ExecutionTask,
  changedPaths: readonly RepositoryPath[],
): string | null => {
  for (const path of changedPaths) {
    if (repositoryPathNamesAgentInstruction(path)) {
      return `candidate changed immutable repository instruction path: ${path}`;
    }
    if (!task.changeSurface.includes(path)) {
      return `candidate changed path outside signed changeSurface: ${path}`;
    }
    if (!task.scope.some((pattern) => repositoryPatternMatches(pattern, path))) {
      return `candidate changed path outside signed scope: ${path}`;
    }
    if (task.exclusions.some((pattern) => repositoryPatternMatches(pattern, path))) {
      return `candidate changed excluded path: ${path}`;
    }
  }
  return null;
};

export const gateEvidence = (
  runtime: CoordinatorRuntime,
  run: Run,
  stage: "V3" | "V5" | "V7",
  gateId: string,
  result: Awaited<ReturnType<typeof runVerificationGate>>,
  ordinal: number,
): EvidenceRef => writeRunEvidence(
  runtime,
  run.id,
  `validation/${stage.toLowerCase()}-gate-${ordinal}-${gateId}.json`,
  new TextEncoder().encode(canonicalJson({
    gateId,
    exitCode: result.exitCode,
    timedOut: result.timedOut,
    cancelled: result.cancelled,
    stdout: new TextDecoder().decode(result.stdout),
    stderr: new TextDecoder().decode(result.stderr),
  })),
  "application/json",
);

export const runRequiredGates = async (
  runtime: CoordinatorRuntime,
  run: Run,
  gateIds: readonly GateId[],
  workspace: string,
  stage: "V3" | "V5" | "V7",
): Promise<RunEvent> => {
  const manifest = await loadValidatedProjectManifest(
    getWorkItem(runtime, run.workItemId).repositoryRoot,
  );
  const evidence: EvidenceRef[] = [];
  for (const [index, gateId] of gateIds.entries()) {
    const result = await runVerificationGate(
      workspace,
      manifest,
      gateId,
      runtime.environment,
    );
    const ref = gateEvidence(runtime, run, stage, gateId, result, index + 1);
    evidence.push(ref);
    const classification = stage === "V5" ? "GOVERNANCE_BREACH" : "TEST_FAILURE";
    appendRunEvent(runtime, run.id, result.exitCode === 0 && !result.timedOut && !result.cancelled
      ? { tag: "GATE_PASSED", gateId, evidence: [ref] }
      : { tag: "GATE_FAILED", gateId, classification, evidence: [ref] });
    if (result.exitCode !== 0 || result.timedOut || result.cancelled) {
      return appendValidationFailed(
        runtime,
        run.id,
        stage,
        classification,
        `verification gate failed: ${gateId}`,
        evidence,
      );
    }
  }
  return appendValidationPassed(runtime, run.id, stage, evidence);
};
