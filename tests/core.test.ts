import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { orderVersion } from "../src/version.ts";

import {
  ArtifactRefSchema,
  EvidencePathSchema,
  OrderConfigSchema,
  IsoDateTimeSchema,
  ProjectManifestSchema,
  RepositoryPathSchema,
  RepositoryPatternSchema,
  RunEventPayloadSchema,
  RunEventSchema,
  RunSchema,
  SignedTaskBlockSchema,
  WorkItemSchema,
  type ApprovalId,
  type ArtifactRef,
  type ArtifactRefId,
  type ExecutionTask,
  type ExecutionTaskId,
  type Run,
  type RunEventId,
  type Sha256,
  type WorkItem,
} from "../src/core/contracts.ts";
import {
  buildApprovalPackageProjection,
  canonicalApprovalPackageJson,
  canonicalJson,
  canonicalUtf8,
  compareArtifactSemanticIdentity,
  isIsoDateTime,
  normalizeRepositoryPath,
  uniqueSortedRepositoryPaths,
} from "../src/core/canonical.ts";
import {
  approvalMaterialIsFresh,
  canonicalAbsolutePathIsWithinRoot,
  conformanceEventMatchesRun,
  invalidatedArtifactIds,
  resolveApplicableArtifactIds,
  resolveConcernIds,
} from "../src/core/governance.ts";
import {
  artifactReturnOwner,
  evaluateStageCompletion,
  routeApprovalStale,
  routeValidationFailure,
} from "../src/core/lifecycle.ts";
import {
  allowedR1CompletionsForSchema,
  classifyExistingWorkItemSource,
  defaultSchemaForKind,
  duplicateWorkItemSourceIds,
  linkedRemediationIsAllowed,
  parseWorkItemSourceMarkdown,
  renderWorkItemSourceMarkdown,
  unresolvedConcernIdsForProject,
  workItemKindForSchema,
  workItemSchemaCatalog,
} from "../src/core/work-item-source.ts";
import {
  aggregateTaskCompletion,
  decideOperationalRecovery,
  dependencyIsSatisfied,
  executionResumeIsAllowed,
  executionTaskIsEligible,
  materializeExecutionTasks,
  providerEventIsAdmitted,
  semanticRepairIsAllowed,
} from "../src/core/execution.ts";

const uuidA = "11111111-1111-4111-8111-111111111111";
const uuidB = "22222222-2222-4222-8222-222222222222";
const uuidC = "33333333-3333-4333-8333-333333333333";
const uuidD = "44444444-4444-4444-8444-444444444444";
const commitA = "a".repeat(40);
const commitB = "b".repeat(40);
const hashA = `sha256:${"a".repeat(64)}` as Sha256;
const hashB = `sha256:${"b".repeat(64)}` as Sha256;
const hashC = `sha256:${"c".repeat(64)}` as Sha256;

const artifact = (
  idSuffix: string,
  repositoryPath: string,
  role: ArtifactRef["role"],
  authorityLayer: ArtifactRef["authorityLayer"],
  sha256: Sha256,
  gitCommit = commitA,
): ArtifactRef =>
  ArtifactRefSchema.parse({
    id: `artifact_${idSuffix}`,
    workItemId: `work_${uuidA}`,
    repositoryPath,
    role,
    authorityLayer,
    sha256,
    gitCommit,
  });

const baseWorkItem = (): WorkItem =>
  WorkItemSchema.parse({
    id: `work_${uuidA}`,
    projectId: "order",
    repositoryRoot: "/repo",
    title: "Test",
    origin: "test",
    schemaId: "change-v1",
    sourcePath: `work_${uuidA}.md`,
    sourceSha256: hashA,
    derivedFromWorkItemId: null,
    stage: "R1",
    status: "ACTIVE",
    outcome: null,
    concernIds: ["core"],
    createdAt: "2026-11-11T03:30:00.000Z",
  });

const baseTask = (
  id: string,
  state: ExecutionTask["state"],
  dependsOn: readonly string[] = [],
): ExecutionTask => ({
  id: id as ExecutionTaskId,
  approvalId: `approval_${uuidA}` as ApprovalId,
  planTaskId: id,
  objective: "",
  dependsOn: dependsOn as readonly ExecutionTaskId[],
  scope: ["src/**"],
  exclusions: [],
  acceptanceRefs: [],
  changeSurface: ["src/core/contracts.ts"],
  gateIds: ["test"],
  authorityRefs: [],
  concernIds: ["core"],
  state,
});

const baseRun = (overrides: Partial<Run> = {}): Run =>
  RunSchema.parse({
    id: `run_${uuidA}`,
    workItemId: `work_${uuidA}`,
    executionTaskId: `task_${uuidA}`,
    stage: "EXECUTION",
    mode: "UNATTENDED",
    role: "BUILDER",
    triggerEventId: null,
    status: "RUNNING",
    attempt: 1,
    baselineCommit: commitA,
    contextHash: hashA,
    providerSessionId: null,
    terminalClassification: null,
    startedAt: "2026-11-11T03:30:00.000Z",
    endedAt: null,
    ...overrides,
  });

describe("productive configuration policy", () => {
  it("keeps configuration strict and path containment component-safe", () => {
    expect(OrderConfigSchema.safeParse({
      version: 2,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: ["/home/test/projects"],
      referenceRoots: [],
      workItemRoot: "/home/test/work-items",
    }).success).toBe(true);
    expect(OrderConfigSchema.safeParse({
      version: 2,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [],
      referenceRoots: [],
      workItemRoot: "/home/test/work-items",
    }).success).toBe(false);
    expect(OrderConfigSchema.safeParse({
      version: 1,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: ["/home/test/projects"],
      referenceRoots: [],
    }).success).toBe(false);
    expect(
      canonicalAbsolutePathIsWithinRoot(
        "/home/test/projects/repository",
        "/home/test/projects",
      ),
    ).toBe(true);
    expect(
      canonicalAbsolutePathIsWithinRoot(
        "/home/test/projects-escape/repository",
        "/home/test/projects",
      ),
    ).toBe(false);
    expect(canonicalAbsolutePathIsWithinRoot("/anything", "/")).toBe(true);
  });
});

describe("canonical scalar and strict ingress contracts", () => {
  it("accepts only canonical repository literal paths and keeps patterns distinct", () => {
    expect(RepositoryPathSchema.safeParse("src/core/contracts.ts").success).toBe(true);
    expect(RepositoryPathSchema.safeParse(".").success).toBe(true);
    expect(RepositoryPathSchema.safeParse("src/**").success).toBe(false);
    expect(RepositoryPathSchema.safeParse("src/../x.ts").success).toBe(false);
    expect(RepositoryPathSchema.safeParse("src/./x.ts").success).toBe(false);
    expect(RepositoryPathSchema.safeParse("/src/x.ts").success).toBe(false);
    expect(RepositoryPatternSchema.safeParse("src/**/*.ts").success).toBe(true);
    expect(() => normalizeRepositoryPath("src/**")).toThrow();
  });

  it("enforces canonical EvidencePath ambiguity rules", () => {
    expect(EvidencePathSchema.safeParse("candidate/patch.diff").success).toBe(true);
    expect(EvidencePathSchema.safeParse("../patch.diff").success).toBe(false);
    expect(EvidencePathSchema.safeParse("a\\b").success).toBe(false);
    expect(EvidencePathSchema.safeParse("").success).toBe(false);
  });

  it("accepts only exact canonical IsoDateTime values", () => {
    expect(isIsoDateTime("2026-11-11T03:30:00.000Z")).toBe(true);
    for (const value of [
      "2026-11-11T03:30:00Z",
      "2026-11-11t03:30:00.000z",
      "2026-11-11T10:30:00.000+07:00",
      "2026-02-30T03:30:00.000Z",
      "+002026-11-11T03:30:00.000Z",
    ]) {
      expect(IsoDateTimeSchema.safeParse(value).success, value).toBe(false);
    }
  });

  it("rejects unknown canonical object keys", () => {
    const value = { ...baseWorkItem(), invented: true };
    expect(WorkItemSchema.safeParse(value).success).toBe(false);
  });

  it("enforces WorkItem complete/status and outcome invariants without inventing non-empty string rules", () => {
    expect(
      WorkItemSchema.safeParse({
        ...baseWorkItem(),
        repositoryRoot: "",
        title: "",
        origin: "",
      }).success,
    ).toBe(true);
    expect(
      WorkItemSchema.safeParse({
        ...baseWorkItem(),
        stage: "COMPLETE",
        status: "ACTIVE",
      }).success,
    ).toBe(false);
    expect(
      WorkItemSchema.safeParse({
        ...baseWorkItem(),
        outcome: "DUPLICATE",
      }).success,
    ).toBe(false);
    expect(
      WorkItemSchema.safeParse({
        ...baseWorkItem(),
        stage: "COMPLETE",
        status: "COMPLETE",
        outcome: null,
      }).success,
    ).toBe(true);
  });

  it("enforces Run role/trigger/status invariants without requiring terminalClassification for pre-signoff completion", () => {
    expect(
      RunSchema.safeParse({
        ...baseRun(),
        id: `run_${uuidB}`,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        status: "COMPLETED",
        endedAt: "2026-11-11T03:31:00.000Z",
      }).success,
    ).toBe(true);
    expect(
      RunSchema.safeParse({
        ...baseRun(),
        role: "REVIEWER",
        triggerEventId: null,
      }).success,
    ).toBe(false);
    expect(
      RunSchema.safeParse({
        ...baseRun(),
        status: "WAITING_FOR_INPUT",
      }).success,
    ).toBe(false);
    expect(
      RunSchema.safeParse({
        ...baseRun(),
        terminalClassification: "PROVIDER_FAILURE",
      }).success,
    ).toBe(false);
  });

  it("enforces RunEvent sequence and event-specific invariants", () => {
    expect(
      RunEventSchema.safeParse({
        id: `event_${uuidA}`,
        runId: `run_${uuidA}`,
        sequence: 0,
        occurredAt: "2026-11-11T03:30:00.000Z",
        event: { tag: "REVIEW_PASSED", evidence: [] },
      }).success,
    ).toBe(false);

    const proposal = {
      tag: "ARTIFACT_PROPOSAL_CREATED",
      targetPath: "docs/r1.md",
      baseSha256: null,
      role: "R1",
      authorityLayer: "P1",
      unifiedDiff: "--- /dev/null\n+++ b/docs/r1.md\n@@ -0,0 +1 @@\n+# R1\n",
      rationale: "Create R1",
    } as const;
    expect(RunEventPayloadSchema.safeParse(proposal).success).toBe(true);
    expect(
      RunEventPayloadSchema.safeParse({
        ...proposal,
        unifiedDiff: proposal.unifiedDiff.slice(0, -1),
      }).success,
    ).toBe(false);

    expect(
      RunEventPayloadSchema.safeParse({
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: `event_${uuidA}`,
        disposition: "ADOPTED",
        adoptedArtifactRefId: null,
      }).success,
    ).toBe(false);

    expect(
      RunEventPayloadSchema.safeParse({
        tag: "VALIDATION_FAILED",
        stage: "V1",
        classification: "PRECONDITION_FAILED",
        summary: "",
        evidence: [],
      }).success,
    ).toBe(false);

    expect(
      RunEventPayloadSchema.safeParse({
        tag: "VALIDATION_FAILED",
        stage: "V3",
        classification: "TEST_FAILURE",
        summary: "",
        evidence: [],
      }).success,
    ).toBe(true);

    expect(
      RunEventPayloadSchema.safeParse({
        tag: "CANDIDATE_STATE_RECORDED",
        patch: { relativePath: "candidate.patch", sha256: hashA, mediaType: "text/x-diff" },
        changedPaths: ["b.ts", "a.ts"],
      }).success,
    ).toBe(false);
  });
});

describe("signed task and manifest contracts", () => {
  const task = {
    id: "T1",
    objective: "Implement",
    dependsOn: [] as string[],
    scope: ["src/**"],
    exclusions: ["src/**/index.ts"],
    acceptanceRefs: ["FR-1"],
    changeSurface: ["src/core/contracts.ts"],
    gateIds: ["test"],
    authorityRefs: ["FR-1"],
    concernIds: ["core"],
  };

  it("rejects duplicate, non-local and cyclic task dependencies", () => {
    expect(SignedTaskBlockSchema.safeParse({ version: 1, tasks: [task, task] }).success).toBe(false);
    expect(
      SignedTaskBlockSchema.safeParse({
        version: 1,
        tasks: [{ ...task, dependsOn: ["MISSING"] }],
      }).success,
    ).toBe(false);
    expect(
      SignedTaskBlockSchema.safeParse({
        version: 1,
        tasks: [
          { ...task, id: "T1", dependsOn: ["T2"] },
          { ...task, id: "T2", dependsOn: ["T1"] },
        ],
      }).success,
    ).toBe(false);
  });

  it("parses the canonical project manifest structure and rejects unknown keys", () => {
    const manifest = {
      version: 1,
      projectId: "example",
      authority: { p1: ["AGENTS.md"], p2: [], p3: [], p4: [], p5: [], p6: ["docs/contracts.md"] },
      refs: { "FR-1": "docs/contracts.md" },
      governance: {
        fitness: { "GW-P1-FCIS": ["architecture"], "GW-P1-DOC-CANONICALITY": ["architecture"] },
      },
      concerns: {
        core: { authority: ["docs/contracts.md"], paths: ["src/core/**"], gates: ["test"] },
      },
      verification: {
        architecture: {
          argv: ["node", "architecture.js"],
          timeoutSeconds: 10,
          inheritEnv: ["PATH"],
          materialRefs: [],
        },
        test: {
          argv: ["node", "test.js"],
          timeoutSeconds: 10,
          inheritEnv: ["PATH"],
          materialRefs: [],
        },
      },
    };
    const parsed = ProjectManifestSchema.parse(manifest);
    expect(parsed.refs["FR-1"]).toBe("docs/contracts.md");
    expect(parsed.governance.fitness["GW-P1-FCIS"]).toEqual(["architecture"]);
    expect(parsed.governance.fitness["GW-P1-DOC-CANONICALITY"]).toEqual(["architecture"]);
    expect(parsed.verification.test?.cwd).toBe(".");
    expect(ProjectManifestSchema.safeParse({ ...manifest, invented: true }).success).toBe(false);
  });
});

describe("canonical JSON and deterministic projections", () => {
  it("sorts object keys recursively while preserving array order and primitive JSON escaping", () => {
    expect(canonicalJson({ z: 1, a: { d: 2, c: ["x", "\n"] } })).toBe(
      '{"a":{"c":["x","\\n"],"d":2},"z":1}',
    );
    expect(canonicalJson([2, 1])).toBe("[2,1]");
  });

  it("rejects non-finite, unsupported, cyclic, sparse and symbol-keyed values", () => {
    expect(() => canonicalJson(Number.NaN)).toThrow();
    expect(() => canonicalJson(BigInt(1))).toThrow();
    expect(() => canonicalJson(new Date())).toThrow();

    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalJson(cyclic)).toThrow();

    const sparse = new Array(2);
    sparse[1] = "x";
    expect(() => canonicalJson(sparse)).toThrow();

    const symbol = Symbol("x");
    expect(() => canonicalJson({ [symbol]: "hidden", x: 1 })).toThrow();
    const symbolArray = ["x"] as unknown[] & { [key: symbol]: string };
    symbolArray[symbol] = "hidden";
    expect(() => canonicalJson(symbolArray)).toThrow();
  });

  it("encodes canonical text as exact UTF-8", () => {
    const value = { text: "ภาษาไทย" };
    expect([...canonicalUtf8(value)]).toEqual([...new TextEncoder().encode(canonicalJson(value))]);
  });

  it("sorts artifact identity by deterministic code-unit comparison", () => {
    const left = artifact(uuidA, "Z.ts", "PLAN", "P7", hashA);
    const right = artifact(uuidB, "a.ts", "R3", "P7", hashB);
    expect(compareArtifactSemanticIdentity(left, right)).toBeLessThan(0);
  });

  it("builds exact approval package projection and rejects duplicate semantic sources", () => {
    const plan = artifact(uuidA, "docs/plan.md", "PLAN", "P7", hashA);
    const r3 = artifact(uuidB, "docs/r3.md", "R3", null, hashB);
    const materialB = artifact(uuidC, "docs/z.md", "GOVERNANCE", "P1", hashC);
    const materialA = artifact(uuidD, "docs/a.md", "GOVERNANCE", "P1", hashB);

    const projection = buildApprovalPackageProjection({
      workItemId: `work_${uuidA}`,
      baselineCommit: commitA,
      sourceSha256: hashA,
      plan,
      r3,
      materialArtifacts: [materialB, materialA],
    });
    expect(projection.materialArtifacts.map((item) => item.repositoryPath)).toEqual([
      "docs/a.md",
      "docs/z.md",
    ]);
    expect(canonicalApprovalPackageJson({
      workItemId: `work_${uuidA}`,
      baselineCommit: commitA,
      sourceSha256: hashA,
      plan,
      r3,
      materialArtifacts: [materialB, materialA],
    })).toBe(canonicalJson(projection));

    expect(() =>
      buildApprovalPackageProjection({
        workItemId: `work_${uuidA}`,
        baselineCommit: commitA,
        sourceSha256: hashA,
        plan,
        r3,
        materialArtifacts: [
          materialA,
          artifact(uuidC, "docs/a.md", "GOVERNANCE", "P1", hashC),
        ],
      }),
    ).toThrow();
  });

  it("sorts and de-duplicates repository paths only at the semantic owner", () => {
    expect(uniqueSortedRepositoryPaths(["b.ts", "a.ts", "b.ts"])).toEqual(["a.ts", "b.ts"]);
  });
});

describe("functional lifecycle and execution policy", () => {
  it("returns adopted R3 artifacts to R3 even when they are P7 material", () => {
    expect(artifactReturnOwner({
      role: "R3",
      authorityLayer: "P7",
    })).toBe("R3");
  });

  it("evaluates lifecycle completions without skipping owning stages", () => {
    expect(evaluateStageCompletion(
      baseWorkItem(),
      { stage: "R1", outcome: "CONFIRMED" },
      allowedR1CompletionsForSchema("change-v1"),
    )).toEqual({
      stage: "R2",
      status: "ACTIVE",
      outcome: null,
    });
    expect(evaluateStageCompletion(
      baseWorkItem(),
      { stage: "R1", outcome: "DUPLICATE" },
      allowedR1CompletionsForSchema("change-v1"),
    )).toEqual({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "DUPLICATE",
    });
    expect(evaluateStageCompletion(
      { ...baseWorkItem(), schemaId: "investigation-v1" },
      { stage: "R1", outcome: "INVESTIGATION_COMPLETE" },
      allowedR1CompletionsForSchema("investigation-v1"),
    )).toEqual({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "INVESTIGATION_COMPLETE",
    });
    expect(() => evaluateStageCompletion(
      { ...baseWorkItem(), schemaId: "audit-v1" },
      { stage: "R1", outcome: "CONFIRMED" },
      allowedR1CompletionsForSchema("audit-v1"),
    )).toThrow(/invalid for schema audit-v1/);
    expect(() =>
      evaluateStageCompletion(
        { ...baseWorkItem(), stage: "PLAN" },
        { stage: "R1", outcome: "CONFIRMED" },
        allowedR1CompletionsForSchema("change-v1"),
      ),
    ).toThrow();
  });

  it("resolves concern and context artifact applicability as deterministic unions", () => {
    expect(resolveConcernIds(["core"], ["ui"], ["core"], ["verification"])).toEqual([
      "core",
      "ui",
      "verification",
    ]);
    expect(
      resolveApplicableArtifactIds(
        [`artifact_${uuidB}` as ArtifactRefId],
        [`artifact_${uuidA}` as ArtifactRefId],
        [`artifact_${uuidB}` as ArtifactRefId],
        [`artifact_${uuidC}` as ArtifactRefId],
      ),
    ).toEqual([
      `artifact_${uuidA}`,
      `artifact_${uuidB}`,
      `artifact_${uuidC}`,
    ]);
  });

  it("computes approval freshness from semantic source identity and bytes, not generated ids or commit id", () => {
    const signed = [artifact(uuidA, "AGENTS.md", "GOVERNANCE", "P1", hashA, commitA)];
    const sameMaterial = [artifact(uuidB, "AGENTS.md", "GOVERNANCE", "P1", hashA, commitB)];
    const changedBytes = [artifact(uuidB, "AGENTS.md", "GOVERNANCE", "P1", hashB, commitB)];
    expect(approvalMaterialIsFresh(signed, sameMaterial)).toBe(true);
    expect(approvalMaterialIsFresh(signed, changedBytes)).toBe(false);
    expect(approvalMaterialIsFresh(signed, [])).toBe(false);
  });

  it("invalidates transitive artifact dependents", () => {
    const a = `artifact_${uuidA}` as ArtifactRefId;
    const b = `artifact_${uuidB}` as ArtifactRefId;
    const c = `artifact_${uuidC}` as ArtifactRefId;
    expect(invalidatedArtifactIds([a], [[b, a], [c, b]])).toEqual([a, b, c]);
  });

  it("materializes signed tasks with generated ids and uses dependencies only for eligibility", () => {
    const block = SignedTaskBlockSchema.parse({
      version: 1,
      tasks: [
        {
          id: "T1",
          objective: "one",
          dependsOn: [],
          scope: ["src/a.ts"],
          exclusions: [],
          acceptanceRefs: [],
          changeSurface: ["src/a.ts"],
          gateIds: ["test"],
          authorityRefs: [],
          concernIds: ["core"],
        },
        {
          id: "T2",
          objective: "two",
          dependsOn: ["T1"],
          scope: ["src/b.ts"],
          exclusions: [],
          acceptanceRefs: [],
          changeSurface: ["src/b.ts"],
          gateIds: ["test"],
          authorityRefs: [],
          concernIds: ["core"],
        },
      ],
    });
    const ids = [`task_${uuidA}`, `task_${uuidB}`] as readonly ExecutionTaskId[];
    const tasks = materializeExecutionTasks(`approval_${uuidA}` as ApprovalId, block, ids);
    expect(tasks[1]?.dependsOn).toEqual([ids[0]]);
    expect(executionTaskIsEligible(tasks[1]!, tasks)).toBe(false);
    const completed = [{ ...tasks[0]!, state: "CANDIDATE_DONE" as const }, tasks[1]!];
    expect(executionTaskIsEligible(completed[1]!, completed)).toBe(true);
    expect("candidate" in completed[1]!).toBe(false);
  });

  it("computes aggregate completion exactly from successful terminal task states", () => {
    expect(dependencyIsSatisfied("CANDIDATE_DONE")).toBe(true);
    expect(dependencyIsSatisfied("ALREADY_SATISFIED")).toBe(true);
    expect(dependencyIsSatisfied("BLOCKED")).toBe(false);
    expect(aggregateTaskCompletion([
      baseTask(`task_${uuidA}`, "ALREADY_SATISFIED"),
      baseTask(`task_${uuidB}`, "ALREADY_SATISFIED"),
    ])).toEqual({ complete: true, outcome: "ALREADY_SATISFIED" });
    expect(aggregateTaskCompletion([
      baseTask(`task_${uuidA}`, "ALREADY_SATISFIED"),
      baseTask(`task_${uuidB}`, "CANDIDATE_DONE"),
    ])).toEqual({ complete: true, outcome: "CANDIDATE_DONE" });
    expect(aggregateTaskCompletion([baseTask(`task_${uuidA}`, "BLOCKED")])).toEqual({
      complete: false,
      outcome: null,
    });
  });

  it("admits provider events only for the current Run role", () => {
    expect(providerEventIsAdmitted("STAGE", { tag: "HUMAN_INPUT_REQUESTED", category: "INFORMATION", question: "" })).toBe(true);
    expect(providerEventIsAdmitted("BUILDER", { tag: "REVIEW_PASSED", evidence: [] })).toBe(false);
    expect(providerEventIsAdmitted("BUILDER", { tag: "STAGE_BLOCKED", reason: "", owningStage: "EXECUTION" })).toBe(true);
    expect(providerEventIsAdmitted("BUILDER", { tag: "STAGE_BLOCKED", reason: "", owningStage: "PLAN" })).toBe(false);
    expect(providerEventIsAdmitted("BUILDER", { tag: "TASK_ALREADY_SATISFIED", summary: "already correct" })).toBe(true);
    expect(providerEventIsAdmitted("REMEDIATOR", { tag: "TASK_ALREADY_SATISFIED", summary: "already correct" })).toBe(false);
    expect(providerEventIsAdmitted("REVIEWER", { tag: "TASK_ALREADY_SATISFIED", summary: "already correct" })).toBe(false);
    expect(providerEventIsAdmitted("REVIEWER", { tag: "REVIEW_FAILED", classification: "REVIEW_FAILURE", summary: "", evidence: [] })).toBe(true);
    expect(providerEventIsAdmitted("REVIEWER", { tag: "VALIDATION_PASSED", stage: "V4", evidence: [] })).toBe(false);
  });

  it("allows one semantic repair per repairable failure class", () => {
    expect(semanticRepairIsAllowed("TEST_FAILURE", [])).toBe(true);
    expect(semanticRepairIsAllowed("TEST_FAILURE", ["TEST_FAILURE"])).toBe(false);
    expect(semanticRepairIsAllowed("CHANGE_BLOAT", [])).toBe(true);
    expect(semanticRepairIsAllowed("ENVIRONMENT_BLOCKED", [])).toBe(false);
  });

  it("allows exactly one operational replacement for the action key", () => {
    const key = {
      executionTaskId: `task_${uuidA}` as ExecutionTaskId,
      role: "BUILDER" as const,
      triggerEventId: null,
    };
    expect(() => decideOperationalRecovery([], key)).toThrow();

    const firstLoss = baseRun({
      status: "FAILED",
      terminalClassification: "PROVIDER_FAILURE",
      endedAt: "2026-11-11T03:31:00.000Z",
    });
    expect(decideOperationalRecovery([firstLoss], key)).toBe("REPLACE");

    const secondLoss = baseRun({
      id: `run_${uuidB}`,
      attempt: 2,
      status: "FAILED",
      terminalClassification: "COORDINATOR_INTERRUPTED",
      endedAt: "2026-11-11T03:32:00.000Z",
    });
    expect(decideOperationalRecovery([firstLoss, secondLoss], key)).toBe("BLOCK");
  });

  it("requires resolved blocker and current approval before execution resume", () => {
    expect(executionResumeIsAllowed({
      workItemStatus: "BLOCKED",
      taskState: "BLOCKED",
      approvalCurrent: true,
      blockerResolved: true,
    })).toBe(true);
    expect(executionResumeIsAllowed({
      workItemStatus: "BLOCKED",
      taskState: "BLOCKED",
      approvalCurrent: false,
      blockerResolved: true,
    })).toBe(false);
  });

  it("routes non-repairable failures to their exact owner", () => {
    expect(routeValidationFailure("SPEC_INVALID")).toBe("PLAN");
    expect(routeValidationFailure("SCOPE_BREACH")).toBe("PLAN");
    expect(routeValidationFailure("GOVERNANCE_BREACH")).toBe("DESIGN");
    expect(routeValidationFailure("PRECONDITION_FAILED")).toBeNull();
    expect(routeValidationFailure("BLOCKED_FOR_REANALYSIS", "R2")).toBe("R2");
    expect(routeApprovalStale(["PLAN", "R2", "DESIGN"])).toBe("R2");
  });

  it("requires conformance evidence to bind the current Run stage and context hash", () => {
    const run = baseRun({
      executionTaskId: null,
      stage: "R1",
      mode: "INTERACTIVE",
      role: "STAGE",
    });
    expect(conformanceEventMatchesRun(run, {
      tag: "CONFORMANCE_PASSED",
      stage: "R1",
      outputArtifactRefIds: [],
      contextHash: hashA,
      evidence: [],
    })).toBe(true);
    expect(conformanceEventMatchesRun(run, {
      tag: "CONFORMANCE_PASSED",
      stage: "R1",
      outputArtifactRefIds: [],
      contextHash: hashB,
      evidence: [],
    })).toBe(false);
  });
});


describe("source-backed WorkItem core", () => {
  it("round-trips the exact schema catalog and derives kind from schemaId only", () => {
    const expected = [
      ["change-v1", "CHANGE"],
      ["defect-v1", "DEFECT"],
      ["investigation-v1", "INVESTIGATION"],
      ["audit-v1", "AUDIT"],
    ] as const;
    expect(workItemSchemaCatalog.map((entry) => [entry.schemaId, entry.kind])).toEqual(expected);

    for (const [schemaId, kind] of expected) {
      const metadata = {
        formatVersion: 1 as const,
        id: `work_${uuidA}`,
        projectId: "order",
        concernIds: ["core"],
        schemaId,
      };
      const markdown = renderWorkItemSourceMarkdown(metadata, "Canonical source");
      const parsed = parseWorkItemSourceMarkdown(
        `work_${uuidA}.md`,
        hashA,
        markdown,
      );
      expect(parsed.metadata).toEqual(metadata);
      expect(parsed.title).toBe("Canonical source");
      expect(workItemKindForSchema(parsed.metadata.schemaId)).toBe(kind);
    }
  });

  it("requires exact ordered section-heading lines rather than fuzzy heading text", () => {
    const metadata = {
      formatVersion: 1 as const,
      id: `work_${uuidA}`,
      projectId: "order",
      concernIds: ["core"],
      schemaId: "change-v1" as const,
    };
    const valid = renderWorkItemSourceMarkdown(metadata, "Exact headings");
    expect(() => parseWorkItemSourceMarkdown(
      `work_${uuidA}.md`,
      hashA,
      valid.replace("## Current context", "paragraph mentioning ## Current context"),
    )).toThrow(/missing ordered section/);
    expect(() => parseWorkItemSourceMarkdown(
      `work_${uuidA}.md`,
      hashA,
      valid.replace(
        "## Current context",
        "## Current context\n\n## Current context",
      ),
    )).toThrow(/duplicate section/);
  });

  it("classifies duplicate stable source ids deterministically", () => {
    const metadata = {
      formatVersion: 1 as const,
      id: `work_${uuidA}`,
      projectId: "order",
      concernIds: ["core"],
      schemaId: "change-v1" as const,
    };
    const markdown = renderWorkItemSourceMarkdown(metadata, "Duplicate");
    const first = parseWorkItemSourceMarkdown(`work_${uuidA}.md`, hashA, markdown);
    const second = parseWorkItemSourceMarkdown("nested/duplicate.md", hashB, markdown);
    expect(duplicateWorkItemSourceIds([first, second])).toEqual([`work_${uuidA}`]);
  });

  it("owns kind defaults and R1 completion admissibility in the source catalog", () => {
    expect(defaultSchemaForKind("CHANGE")).toBe("change-v1");
    expect(defaultSchemaForKind("DEFECT")).toBe("defect-v1");
    expect(defaultSchemaForKind("INVESTIGATION")).toBe("investigation-v1");
    expect(defaultSchemaForKind("AUDIT")).toBe("audit-v1");
    expect(allowedR1CompletionsForSchema("investigation-v1")).toEqual([
      "INVESTIGATION_COMPLETE",
      "DUPLICATE",
      "ALREADY_SATISFIED",
    ]);
    expect(allowedR1CompletionsForSchema("audit-v1")).not.toContain("CONFIRMED");
  });

  it("classifies current source changes without daemon-owned policy", () => {
    const existing = baseWorkItem();
    const metadata = {
      formatVersion: 1 as const,
      id: existing.id,
      projectId: existing.projectId,
      concernIds: existing.concernIds,
      schemaId: existing.schemaId,
    };
    const markdown = renderWorkItemSourceMarkdown(metadata, existing.title);
    const unchanged = parseWorkItemSourceMarkdown(existing.sourcePath, existing.sourceSha256, markdown);
    expect(classifyExistingWorkItemSource(existing, unchanged, false)).toEqual({
      tag: "ACCEPT",
      disposition: "UNCHANGED",
    });
    expect(classifyExistingWorkItemSource(
      existing,
      { ...unchanged, path: "nested/moved.md" },
      false,
    )).toEqual({
      tag: "ACCEPT",
      disposition: "MOVED",
    });
    expect(classifyExistingWorkItemSource(
      existing,
      { ...unchanged, sha256: hashB },
      false,
    )).toEqual({
      tag: "ACCEPT",
      disposition: "UPDATED",
    });
    expect(classifyExistingWorkItemSource(
      { ...existing, stage: "R1" },
      {
        ...unchanged,
        metadata: { ...unchanged.metadata, schemaId: "defect-v1" },
        sha256: hashB,
      },
      true,
    )).toMatchObject({
      tag: "REJECT",
      code: "SOURCE_RECLASSIFICATION_BLOCKED",
    });
    const completed = {
      ...existing,
      stage: "COMPLETE" as const,
      status: "COMPLETE" as const,
      outcome: "DUPLICATE" as const,
    };
    expect(classifyExistingWorkItemSource(
      completed,
      { ...unchanged, sha256: hashB },
      true,
    )).toMatchObject({
      tag: "REJECT",
      code: "COMPLETED_SOURCE_CHANGED",
    });
  });

  it("owns linked-remediation and concern-resolution policy as pure typed rules", () => {
    const parent = {
      ...baseWorkItem(),
      schemaId: "investigation-v1" as const,
      stage: "COMPLETE" as const,
      status: "COMPLETE" as const,
      outcome: "INVESTIGATION_COMPLETE" as const,
    };
    expect(linkedRemediationIsAllowed(parent, "order", "change-v1")).toBe(true);
    expect(linkedRemediationIsAllowed(parent, "order", "defect-v1")).toBe(true);
    expect(linkedRemediationIsAllowed(parent, "order", "audit-v1")).toBe(false);
    expect(linkedRemediationIsAllowed(parent, "other", "change-v1")).toBe(false);

    const manifest = ProjectManifestSchema.parse({
      version: 1,
      projectId: "order",
      authority: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [] },
      refs: {},
      governance: { fitness: {} },
      concerns: {
        core: { authority: [], paths: ["src/core/**"], gates: [] },
      },
      verification: {},
    });
    expect(unresolvedConcernIdsForProject(["core"], manifest)).toEqual([]);
    expect(unresolvedConcernIdsForProject(["missing", "core"], manifest)).toEqual(["missing"]);
  });

  it("rejects persisted kind and unknown metadata from portable source grammar", () => {
    const id = `work_${uuidA}`;
    const invalid = [
      "---",
      JSON.stringify({
        formatVersion: 1,
        id,
        projectId: "order",
        concernIds: ["core"],
        schemaId: "change-v1",
        kind: "CHANGE",
      }, null, 2),
      "---",
      "# Invalid duplicate kind",
      "",
      "## Requested outcome",
      "",
      "## Current context",
      "",
      "## Constraints/non-goals",
      "",
      "## Evidence/references",
      "",
    ].join("\n");
    expect(() => parseWorkItemSourceMarkdown(`${id}.md`, hashA, invalid)).toThrow();
  });

  it("rejects self-linked portable source metadata at the pure parser", () => {
    const id = `work_${uuidA}`;
    expect(() => renderWorkItemSourceMarkdown({
      formatVersion: 1,
      id,
      projectId: "order",
      concernIds: ["core"],
      schemaId: "change-v1",
      derivedFromWorkItemId: id,
    }, "Self linked")).not.toThrow();

    const markdown = renderWorkItemSourceMarkdown({
      formatVersion: 1,
      id,
      projectId: "order",
      concernIds: ["core"],
      schemaId: "change-v1",
      derivedFromWorkItemId: id,
    }, "Self linked");
    expect(() => parseWorkItemSourceMarkdown(id + ".md", hashA, markdown))
      .toThrow(/must not equal/);
  });
});


describe("release version ownership", () => {
  it("derives the runtime version from package.json", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      version: string;
    };
    expect(orderVersion).toBe(packageJson.version);
    expect(orderVersion).toMatch(/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/);
  });
});
