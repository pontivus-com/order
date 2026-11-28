import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { orderVersion } from "../src/version.ts";

import {
  ApprovalSchema,
  ArtifactRefSchema,
  EvidencePathSchema,
  ExecutionTaskSchema,
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
  type RunEvent,
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
  evaluateStageConformance,
  invalidatedArtifactIds,
  permanentAuthorityProposalIsAdmitted,
  projectAuthorityForLayers,
  resolveApplicableArtifactIds,
  resolveConcernIds,
  resolveProjectAuthority,
  resolveAuthorityRefClosure,
} from "../src/core/governance.ts";
import {
  admittedTerminalR1Artifact,
  artifactReturnOwner,
  deriveCurrentAttention,
  deriveExecutionOwner,
  executionTaskRuns,
  terminalExecutionFailureEvent,
  durableDecisionCompletionIsAdmitted,
  artifactHasCurrentStageConformance,
  deriveMaterialPresentationState,
  materialCurrentnessForStage,
  deriveObservationCoherence,
  deriveProposalDecision,
  deriveReachedStages,
  deriveRecoveryDisposition,
  deriveValidationBoundary,
  deriveWorkflowRail,
  evaluateStageCompletion,
  normalizeMaterialCurrentness,
  reachStateForStage,
  routeApprovalStale,
  routeValidationFailure,
  stageInputIsAdmitted,
  stageProviderBatchRejectionCode,
  stageRunCancellationIsAdmitted,
  stageRunInteraction,
  transitionWorkItem,
  validateStageProviderTurn,
} from "../src/core/lifecycle.ts";
import {
  allowedR1CompletionsForSchema,
  authorityDispositionOwnerRefs,
  classifyExistingWorkItemSource,
  defaultSchemaForKind,
  duplicateWorkItemSourceIds,
  linkedRemediationIsAllowed,
  parseWorkItemSourceMarkdown,
  recomposeWorkItemSourceBody,
  renderWorkItemSourceMarkdown,
  rewriteWorkItemSourceTitle,
  stageTemplateForSchema,
  stageDocumentAuthorityRefs,
  unresolvedConcernIdsForProject,
  validateStageDocumentStructure,
  workItemArchiveMarkerPath,
  workItemDocumentPath,
  workItemKindForSchema,
  workItemSchemaCatalog,
} from "../src/core/work-item-source.ts";
import {
  admitSignedTaskBlockForSchema,
  aggregateTaskCompletion,
  builderCheckpointRequestForTurn,
  decideOperationalRecovery,
  dependencyIsSatisfied,
  executionResumeIsAllowed,
  executionTaskIsEligible,
  materializeExecutionTasks,
  parseSignedTaskBlockFromPlan,
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
      version: 4,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: ["/home/test/projects"],
      referenceRoots: [],
    }).success).toBe(true);
    expect(OrderConfigSchema.safeParse({
      version: 4,
      model: null,
      repositoryRoots: [],
      referenceRoots: [],
    }).success).toBe(true);
    expect(OrderConfigSchema.safeParse({
      version: 2,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: ["/home/test/projects"],
      referenceRoots: [],
      workItemRoot: "/home/test/work-items",
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

  it("rewrites only the canonical WorkItem H1 and derives the archive marker path", () => {
    const id = `work_${uuidA}`;
    const metadata = {
      formatVersion: 1 as const,
      id,
      projectId: "order",
      concernIds: ["core"],
      schemaId: "change-v1" as const,
    };
    const original = renderWorkItemSourceMarkdown(metadata, "Original title")
      .replace("## Current context\n", "## Current context\n# Nested heading remains\n");
    const rewritten = rewriteWorkItemSourceTitle(original, "Renamed title");
    expect(rewritten).toContain("# Renamed title\n");
    expect(rewritten).toContain("# Nested heading remains\n");
    expect(rewritten.replace("# Renamed title", "# Original title")).toBe(original);
    expect(workItemArchiveMarkerPath("docs/order/work-items", id))
      .toBe(`docs/order/work-items/${id}/.order-archived`);
  });

  it("derives deterministic repository-native WorkItem document paths", () => {
    const id = `work_${uuidA}`;
    expect(workItemDocumentPath("docs/order/work-items", id, "SOURCE"))
      .toBe(`docs/order/work-items/${id}/work-request.md`);
    expect(workItemDocumentPath("docs/order/work-items", id, "R1"))
      .toBe(`docs/order/work-items/${id}/research.md`);
    expect(workItemDocumentPath(".context/order", id, "R3"))
      .toBe(`.context/order/${id}/readiness-review.md`);
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

    const historicalReviewPass = {
      tag: "REVIEW_PASSED",
      evidence: [],
    } as const;
    expect(RunEventPayloadSchema.safeParse(historicalReviewPass).success).toBe(true);
    expect(providerEventIsAdmitted("REVIEWER", historicalReviewPass)).toBe(false);

    const currentReviewPass = {
      tag: "REVIEW_PASSED",
      minimumChange: "MINIMUM_SUFFICIENT",
      minimumChangeSummary: null,
      evidence: [],
    } as const;
    expect(RunEventPayloadSchema.safeParse(currentReviewPass).success).toBe(true);
    expect(providerEventIsAdmitted("REVIEWER", currentReviewPass)).toBe(true);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "REVIEW_PASSED",
        minimumChange: "CHANGE_BLOAT",
        minimumChangeSummary: null,
        evidence: [],
      }).success,
    ).toBe(false);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "REVIEW_PASSED",
        minimumChange: "CHANGE_BLOAT",
        minimumChangeSummary: "src/extra.ts is removable",
        evidence: [],
      }).success,
    ).toBe(true);

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
        tag: "PRODUCTIVE_INVOCATION_FAILED",
        classification: "PRECONDITION_FAILED",
        detail: "repository instruction closure failed",
        evidence: [],
      }).success,
    ).toBe(true);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "PRODUCTIVE_INVOCATION_FAILED",
        classification: "ENVIRONMENT_BLOCKED",
        detail: "configured model is unavailable",
        evidence: [],
      }).success,
    ).toBe(true);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "PRODUCTIVE_INVOCATION_FAILED",
        classification: "PROVIDER_FAILURE",
        detail: "wrong taxonomy",
        evidence: [],
      }).success,
    ).toBe(false);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "PRODUCTIVE_INVOCATION_FAILED",
        classification: "PRECONDITION_FAILED",
        detail: "",
        evidence: [],
      }).success,
    ).toBe(false);

    expect(
      RunEventPayloadSchema.safeParse({
        tag: "AGENT_ACTIVITY_RECORDED",
        category: "READING",
        summary: "Reading lifecycle state",
        resource: "src/core/lifecycle.ts",
      }).success,
    ).toBe(true);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "AGENT_ACTIVITY_RECORDED",
        category: "READING",
        summary: "",
        resource: null,
      }).success,
    ).toBe(false);
    expect(
      RunEventPayloadSchema.safeParse({
        tag: "AGENT_ACTIVITY_RECORDED",
        category: "READING",
        summary: "x".repeat(161),
        resource: null,
      }).success,
    ).toBe(false);

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

  it("rejects AGENTS.md changeSurface paths in signed and materialized task contracts", () => {
    for (const path of ["AGENTS.md", "nested/AGENTS.md"]) {
      expect(
        SignedTaskBlockSchema.safeParse({
          version: 1,
          tasks: [{ ...task, changeSurface: [path] }],
        }).success,
      ).toBe(false);
      expect(
        ExecutionTaskSchema.safeParse({
          ...baseTask("task_" + uuidA, "TODO"),
          changeSurface: [path],
        }).success,
      ).toBe(false);
    }

    expect(
      SignedTaskBlockSchema.safeParse({
        version: 1,
        tasks: [{ ...task, changeSurface: ["nested/AGENTS.md.bak"] }],
      }).success,
    ).toBe(true);
  });

  it("parses exactly one canonical order-tasks block from PLAN bytes", () => {
    const encoder = new TextEncoder();
    const valid = [
      "# Plan",
      "",
      "```order-tasks",
      JSON.stringify({ version: 1, tasks: [task] }),
      "```",
      "",
    ].join("\n");
    expect(parseSignedTaskBlockFromPlan(encoder.encode(valid))).toEqual({
      version: 1,
      tasks: [task],
    });
    expect(() =>
      parseSignedTaskBlockFromPlan(encoder.encode("# Plan\n"))
    ).toThrow(/exactly one order-tasks block/);
    expect(() =>
      parseSignedTaskBlockFromPlan(
        encoder.encode(valid + "\n" + valid),
      )
    ).toThrow(/exactly one order-tasks block/);
  });

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
    expect(parsed.workItems.root).toBe("docs/order/work-items");
    const overridden = ProjectManifestSchema.parse({
      ...manifest,
      workItems: { root: ".context/order" },
    });
    expect(overridden.workItems.root).toBe(".context/order");
    expect(ProjectManifestSchema.safeParse({
      ...manifest,
      workItems: { root: ".git/order" },
    }).success).toBe(false);
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

  it("resolves project authority before provider inference without implicit same-layer precedence", () => {
    const manifest = ProjectManifestSchema.parse({
      version: 1,
      projectId: "example",
      authority: {
        p1: ["AGENTS.md", "docs/principles.md"],
        p2: ["docs/product.md"],
        p3: ["docs/requirements.md"],
        p4: ["docs/legacy-architecture.md", "docs/architecture.md"],
        p5: [],
        p6: [],
      },
      refs: {
        "P1-STRICT": "docs/principles.md",
        "P1-FCIS-EXT": "AGENTS.md",
        "P2-PRODUCT": "docs/product.md",
        "P4-CURRENT": "docs/architecture.md",
      },
      precedence: {
        p4: ["docs/architecture.md", "docs/legacy-architecture.md"],
      },
      governance: {
        overrides: [{
          defaultRuleId: "GW-P1-STRICT-TYPING",
          source: "docs/principles.md",
          authorityRef: "P1-STRICT",
          gates: ["architecture"],
        }],
        extensions: [{
          defaultRuleId: "GW-P1-FCIS",
          source: "AGENTS.md",
          authorityRef: "P1-FCIS-EXT",
          gates: ["test"],
        }],
        fitness: {
          "GW-P1-FCIS": ["architecture"],
        },
      },
      verification: {
        architecture: {
          argv: ["node", "architecture.js"],
          timeoutSeconds: 10,
          inheritEnv: [],
          materialRefs: [],
        },
        test: {
          argv: ["node", "test.js"],
          timeoutSeconds: 10,
          inheritEnv: [],
          materialRefs: [],
        },
      },
    });
    const sources = {
      p1: ["docs/principles.md", "AGENTS.md"],
      p2: ["docs/product.md"],
      p3: ["docs/requirements.md"],
      p4: ["docs/legacy-architecture.md", "docs/architecture.md"],
      p5: [],
      p6: [],
    } as const;
    const resolved = resolveProjectAuthority(manifest, sources);
    expect(resolved.layers.find((entry) => entry.layer === "p1")).toEqual({
      layer: "p1",
      sources: ["AGENTS.md", "docs/principles.md"],
      precedence: [],
    });
    expect(resolved.layers.find((entry) => entry.layer === "p4")).toEqual({
      layer: "p4",
      sources: ["docs/architecture.md", "docs/legacy-architecture.md"],
      precedence: ["docs/architecture.md", "docs/legacy-architecture.md"],
    });
    expect(resolved.inheritedDefaultRuleIds).toContain("GW-P1-FCIS");
    expect(resolved.inheritedDefaultRuleIds).not.toContain("GW-P1-STRICT-TYPING");
    expect(
      resolved.fitnessGateIdsByDefaultRuleId.find(
        ([ruleId]) => ruleId === "GW-P1-FCIS",
      )?.[1],
    ).toEqual(["architecture", "test"]);
    expect(resolved.fitnessGateIds).toEqual(["architecture", "test"]);

    const r2Authority = projectAuthorityForLayers(
      resolved,
      ["p1", "p2", "p3"],
    );
    expect(r2Authority.layers.map((entry) => entry.layer))
      .toEqual(["p1", "p2", "p3"]);
    expect(r2Authority.authorityRefs).not.toContainEqual(
      ["P4-CURRENT", "docs/architecture.md"],
    );

    expect(() =>
      resolveProjectAuthority(manifest, {
        ...sources,
        p4: ["docs/architecture.md"],
      })
    ).toThrow(/precedence\.p4 path is not selected/);
    expect(() =>
      resolveProjectAuthority(manifest, {
        ...sources,
        p1: ["AGENTS.md"],
      })
    ).toThrow(/source is not selected/);

    expect(permanentAuthorityProposalIsAdmitted(
      "R2",
      {
        role: "GOVERNANCE",
        authorityLayer: "P2",
        targetPath: "docs/product.md",
      },
      r2Authority,
    )).toBe(true);
    expect(permanentAuthorityProposalIsAdmitted(
      "R2",
      {
        role: "GOVERNANCE",
        authorityLayer: "P4",
        targetPath: "docs/architecture.md",
      },
      r2Authority,
    )).toBe(false);
    expect(permanentAuthorityProposalIsAdmitted(
      "R2",
      {
        role: "GOVERNANCE",
        authorityLayer: "P2",
        targetPath: "docs/not-selected.md",
      },
      r2Authority,
    )).toBe(false);
  });

  it("validates additive stage refs and resolves exact transitive dependency identities without precedence", () => {
    const sources = {
      p1: [], p2: ["docs/current.md", "docs/historical.md"],
      p3: ["docs/b.md", "docs/c.md", "docs/d.md"], p4: [], p5: [], p6: [],
    } as const;
    const input = {
      version: 1, projectId: "example", authority: sources,
      refs: {
        CURRENT: "docs/current.md", HISTORICAL: "docs/historical.md",
        B: "docs/b.md", C: "docs/c.md", D: "docs/d.md",
      },
    };
    const absent = ProjectManifestSchema.parse(input);
    const empty = ProjectManifestSchema.parse({ ...input, stageAuthorityRefs: {}, refDependencies: {} });
    expect(absent).toEqual(empty);
    const manifest = ProjectManifestSchema.parse({
      ...input,
      stageAuthorityRefs: { R2: ["CURRENT"] },
      refDependencies: { CURRENT: ["C", "B"], B: ["D"], C: ["D"], D: ["CURRENT"] },
    });
    const resolved = resolveProjectAuthority(manifest, sources);
    expect(resolveAuthorityRefClosure(resolved, manifest.refDependencies, manifest.stageAuthorityRefs.R2 ?? []))
      .toEqual(["B", "C", "CURRENT", "D"]);
    expect(resolveAuthorityRefClosure(resolved, manifest.refDependencies, ["HISTORICAL"]))
      .toEqual(["HISTORICAL"]);
    expect(resolveAuthorityRefClosure(resolved, manifest.refDependencies, [])).toEqual([]);
    expect(resolveAuthorityRefClosure(resolved, manifest.refDependencies, ["D", "CURRENT", "B"]))
      .toEqual(["B", "C", "CURRENT", "D"]);
    expect(resolved.layers).toEqual(resolveProjectAuthority(absent, sources).layers);
    expect(() => resolveAuthorityRefClosure(resolved, manifest.refDependencies, ["MISSING"]))
      .toThrow("unresolved AuthorityRef");
    for (const invalid of [
      { stageAuthorityRefs: { EXECUTION: ["CURRENT"] } },
      { stageAuthorityRefs: { R2: ["MISSING"] } },
      { stageAuthorityRefs: { R2: ["CURRENT", "CURRENT"] } },
      { refDependencies: { MISSING: ["CURRENT"] } },
      { refDependencies: { CURRENT: ["MISSING"] } },
      { refDependencies: { CURRENT: ["B", "B"] } },
    ]) {
      expect(ProjectManifestSchema.safeParse({ ...input, ...invalid }).success).toBe(false);
    }
    expect(() => resolveProjectAuthority(manifest, { ...sources, p3: ["docs/b.md", "docs/c.md"] }))
      .toThrow("source is not selected");
    expect(() => resolveProjectAuthority({
      ...manifest, refDependencies: { MISSING: ["CURRENT"] },
    }, sources)).toThrow("unresolved AuthorityRef");
  });

  it("requires adopted authority after answered durable decision input before completion", () => {
    const run = RunSchema.parse({
      ...baseRun(),
      id: `run_${uuidB}`,
      executionTaskId: null,
      stage: "R2",
      mode: "INTERACTIVE",
      role: "STAGE",
      triggerEventId: null,
      status: "RUNNING",
      attempt: 1,
      terminalClassification: null,
      endedAt: null,
    });
    const started = RunEventSchema.parse({
      id: `event_${uuidA}`,
      runId: run.id,
      sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: {
        tag: "STAGE_STARTED",
        stage: "R2",
        mode: "INTERACTIVE",
        contextHash: hashA,
      },
    });
    const request = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: run.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "AUTHORITY_DECISION",
        question: "Which authority should govern?",
      },
    });
    const answer = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId: request.id,
        text: "Use the canonical P2 owner.",
      },
    });
    expect(durableDecisionCompletionIsAdmitted(
      run,
      [started, request, answer],
    )).toBe(false);

    const proposal = RunEventSchema.parse({
      id: `event_${uuidD}`,
      runId: run.id,
      sequence: 4,
      occurredAt: "2026-11-11T03:30:03.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/product.md",
        baseSha256: hashA,
        role: "GOVERNANCE",
        authorityLayer: "P2",
        unifiedDiff: "--- a/docs/product.md\n+++ b/docs/product.md\n@@ -1 +1 @@\n-old\n+new\n",
        rationale: "Persist the decision in canonical authority",
      },
    });
    const adoptionRequested = RunEventSchema.parse({
      id: "event_55555555-5555-4555-8555-555555555555",
      runId: run.id,
      sequence: 5,
      occurredAt: "2026-11-11T03:30:04.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: proposal.id,
      },
    });
    const adopted = RunEventSchema.parse({
      id: "event_66666666-6666-4666-8666-666666666666",
      runId: run.id,
      sequence: 6,
      occurredAt: "2026-11-11T03:30:05.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "ADOPTED",
        adoptedArtifactRefId: `artifact_${uuidA}`,
      },
    });
    const continuation = RunEventSchema.parse({
      id: "event_77777777-7777-4777-8777-777777777777",
      runId: run.id,
      sequence: 7,
      occurredAt: "2026-11-11T03:30:06.000Z",
      event: {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId: null,
        text: "Continue after adoption.",
      },
    });
    const adoptedHistory = [
      started,
      request,
      answer,
      proposal,
      adoptionRequested,
      adopted,
      continuation,
    ];
    expect(durableDecisionCompletionIsAdmitted(run, adoptedHistory)).toBe(true);
    expect(() =>
      validateStageProviderTurn(
        run,
        adoptedHistory,
        [{
          tag: "STAGE_COMPLETED",
          completion: { stage: "R2", outcome: "ACCEPTED" },
          artifactRefIds: [],
        }],
      )
    ).not.toThrow();

    const rejected = RunEventSchema.parse({
      ...adopted,
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "REJECTED",
        adoptedArtifactRefId: null,
      },
    });
    expect(durableDecisionCompletionIsAdmitted(
      run,
      [started, request, answer, proposal, rejected, continuation],
    )).toBe(false);

    // A stale/pending proposal has no adopted disposition and therefore cannot
    // satisfy the durable-decision completion boundary.
    expect(durableDecisionCompletionIsAdmitted(
      run,
      [started, request, answer, proposal, adoptionRequested],
    )).toBe(false);

    // An unrelated proposal that predates the durable answer cannot become the
    // decision's durable authority merely because it is adopted afterwards.
    const priorProposal = RunEventSchema.parse({
      ...proposal,
      id: "event_66666666-6666-4666-8666-666666666666",
      sequence: 2,
    });
    const laterRequest = RunEventSchema.parse({
      ...request,
      id: "event_77777777-7777-4777-8777-777777777777",
      sequence: 3,
    });
    const laterAnswer = RunEventSchema.parse({
      ...answer,
      id: "event_88888888-8888-4888-8888-888888888888",
      sequence: 4,
      event: {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId: laterRequest.id,
        text: "Use the canonical P2 owner.",
      },
    });
    const priorAdoptionRequested = RunEventSchema.parse({
      ...adoptionRequested,
      id: "event_99999999-9999-4999-8999-999999999999",
      sequence: 5,
      event: {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: priorProposal.id,
      },
    });
    const priorAdopted = RunEventSchema.parse({
      ...adopted,
      id: "event_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      sequence: 6,
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: priorProposal.id,
        disposition: "ADOPTED",
        adoptedArtifactRefId: adopted.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
          ? adopted.event.adoptedArtifactRefId
          : null,
      },
    });
    expect(durableDecisionCompletionIsAdmitted(
      run,
      [
        started,
        priorProposal,
        laterRequest,
        laterAnswer,
        priorAdoptionRequested,
        priorAdopted,
      ],
    )).toBe(false);

    const cancelledRun = RunSchema.parse({
      ...run,
      status: "CANCELLED",
      endedAt: "2026-11-11T03:31:00.000Z",
    });
    expect(() =>
      validateStageProviderTurn(
        cancelledRun,
        [started, request, answer, proposal, adoptionRequested],
        [{
          tag: "STAGE_COMPLETED",
          completion: { stage: "R2", outcome: "ACCEPTED" },
          artifactRefIds: [],
        }],
      )
    ).toThrow(/RUNNING STAGE Run/);

    const informationalRequest = RunEventSchema.parse({
      ...request,
      event: {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "INFORMATION",
        question: "What evidence is available?",
      },
    });
    expect(durableDecisionCompletionIsAdmitted(
      run,
      [started, informationalRequest, answer],
    )).toBe(true);

    const evidenceRequest = RunEventSchema.parse({
      ...request,
      event: {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "EVIDENCE",
        question: "Which evidence should be considered?",
      },
    });
    expect(durableDecisionCompletionIsAdmitted(
      run,
      [started, evidenceRequest, answer],
    )).toBe(true);
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

  it("enforces signed-task non-vacuity only for current v2 Change/Defect", () => {
    const legacyVacuous = SignedTaskBlockSchema.parse({ version: 1, tasks: [] });
    expect(admitSignedTaskBlockForSchema("change-v1", legacyVacuous)).toBe(legacyVacuous);
    expect(admitSignedTaskBlockForSchema("defect-v1", legacyVacuous)).toBe(legacyVacuous);
    expect(() => admitSignedTaskBlockForSchema("change-v2", legacyVacuous))
      .toThrow(/at least one signed task/);

    const currentTask = {
      id: "T1",
      objective: "Implement the governed change",
      dependsOn: [],
      scope: ["src/**"],
      exclusions: [],
      acceptanceRefs: ["FR-1"],
      changeSurface: ["src/a.ts"],
      gateIds: ["test"],
      authorityRefs: ["ADR-1"],
      concernIds: ["core"],
    };
    const admitted = SignedTaskBlockSchema.parse({
      version: 1,
      tasks: [currentTask],
    });
    expect(admitSignedTaskBlockForSchema("change-v2", admitted)).toBe(admitted);
    expect(admitSignedTaskBlockForSchema("defect-v2", admitted)).toBe(admitted);

    for (const [field, value] of [
      ["scope", []],
      ["acceptanceRefs", []],
      ["changeSurface", []],
      ["gateIds", []],
      ["authorityRefs", []],
      ["concernIds", []],
    ] as const) {
      const block = SignedTaskBlockSchema.parse({
        version: 1,
        tasks: [{ ...currentTask, [field]: value }],
      });
      expect(() => admitSignedTaskBlockForSchema("change-v2", block))
        .toThrow(new RegExp("non-empty " + field));
    }

    for (const [field, value] of [
      ["id", "  "],
      ["id", " T1"],
      ["objective", "  "],
      ["objective", "Implement the governed change "],
    ] as const) {
      const block = SignedTaskBlockSchema.parse({
        version: 1,
        tasks: [{ ...currentTask, [field]: value }],
      });
      expect(() => admitSignedTaskBlockForSchema("change-v2", block))
        .toThrow(new RegExp(field + " must be trimmed and non-empty"));
    }
  });

  it("normalizes and validates Approval identity in the canonical schema", () => {
    const input = {
      id: `approval_${uuidA}`,
      workItemId: `work_${uuidA}`,
      baselineCommit: commitA,
      packageHash: hashA,
      planArtifactRefId: `artifact_${uuidA}`,
      r3ArtifactRefId: `artifact_${uuidB}`,
      sourceSha256: hashB,
      approvedAt: "2026-11-11T03:30:00.000Z",
    };
    expect(ApprovalSchema.parse({
      ...input,
      approvedBy: "  Human Operator  ",
    }).approvedBy).toBe("Human Operator");
    expect(ApprovalSchema.safeParse({ ...input, approvedBy: "   " }).success).toBe(false);
    expect(ApprovalSchema.safeParse({ ...input, approvedBy: "human\0operator" }).success).toBe(false);
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

  it("admits exactly one terminal checkpoint request only for BUILDER", () => {
    const checkpoint = RunEventPayloadSchema.parse({
      tag: "GATE_CHECKPOINT_REQUESTED",
      gateId: "architecture",
    });
    expect(providerEventIsAdmitted("BUILDER", checkpoint)).toBe(true);
    expect(providerEventIsAdmitted("REMEDIATOR", checkpoint)).toBe(false);
    expect(providerEventIsAdmitted("REVIEWER", checkpoint)).toBe(false);
    expect(providerEventIsAdmitted("STAGE", checkpoint)).toBe(false);

    expect(builderCheckpointRequestForTurn("BUILDER", [
      { tag: "AGENT_MESSAGE_FINAL", text: "checkpoint", evidence: [] },
      checkpoint,
    ])).toEqual(checkpoint);
    expect(() => builderCheckpointRequestForTurn("BUILDER", [
      checkpoint,
      { tag: "AGENT_MESSAGE_FINAL", text: "not terminal", evidence: [] },
    ])).toThrow("terminal turn action");
    expect(() => builderCheckpointRequestForTurn("BUILDER", [
      checkpoint,
      checkpoint,
    ])).toThrow("at most one");
    expect(() => builderCheckpointRequestForTurn("BUILDER", [
      { tag: "STAGE_BLOCKED", reason: "blocked", owningStage: "EXECUTION" },
      checkpoint,
    ])).toThrow("cannot coexist");
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


describe("stage conformance output closure", () => {
  it("requires exactly one canonical output artifact for promotion", () => {
    const output = ArtifactRefSchema.parse({
      id: `artifact_${uuidA}`,
      workItemId: `work_${uuidB}`,
      repositoryPath: `docs/order/work-items/work_${uuidB}/requirements.md`,
      role: "R2",
      authorityLayer: "P3",
      sha256: hashA,
      gitCommit: null,
    });

    expect(
      evaluateStageConformance("R2", output.workItemId, output.repositoryPath, []),
    ).toMatchObject({ tag: "FAIL" });
    expect(
      evaluateStageConformance(
        "R2",
        output.workItemId,
        output.repositoryPath,
        [output, output],
      ),
    ).toMatchObject({ tag: "FAIL" });
    expect(
      evaluateStageConformance(
        "R2",
        output.workItemId,
        output.repositoryPath,
        [output],
      ),
    ).toEqual({ tag: "PASS", output });
    expect(
      evaluateStageConformance(
        "R2",
        output.workItemId,
        "docs/order/work-items/other/requirements.md",
        [output],
      ),
    ).toMatchObject({ tag: "FAIL" });
  });
});

describe("source-backed WorkItem core", () => {
  it("round-trips the exact schema catalog and derives kind from schemaId only", () => {
    const expected = [
      ["change-v1", "CHANGE", false],
      ["defect-v1", "DEFECT", false],
      ["change-v2", "CHANGE", true],
      ["defect-v2", "DEFECT", true],
      ["investigation-v1", "INVESTIGATION", false],
      ["audit-v1", "AUDIT", false],
      ["investigation-v2", "INVESTIGATION", true],
      ["audit-v2", "AUDIT", true],
    ] as const;
    expect(
      workItemSchemaCatalog.map((entry) => [
        entry.schemaId,
        entry.kind,
        entry.authoringDefault,
      ]),
    ).toEqual(expected);

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

  it("keeps historical R1 authority pins isolated from current v2 delivery authoring", () => {
    const historicalChange = stageTemplateForSchema("change-v1", "R1");
    const historicalDefect = stageTemplateForSchema("defect-v1", "R1");
    const currentChange = stageTemplateForSchema("change-v2", "R1");
    const currentDefect = stageTemplateForSchema("defect-v2", "R1");

    const historicalInvestigation = stageTemplateForSchema("investigation-v1", "R1");
    const historicalAudit = stageTemplateForSchema("audit-v1", "R1");
    const currentInvestigation = stageTemplateForSchema("investigation-v2", "R1");
    const currentAudit = stageTemplateForSchema("audit-v2", "R1");

    expect(historicalChange).toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(historicalDefect).toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(historicalInvestigation).toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(historicalAudit).toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(currentChange).toContain("GW-DOC-LIFECYCLE-CONTEXT-V2");
    expect(currentDefect).toContain("GW-DOC-LIFECYCLE-CONTEXT-V2");
    expect(currentInvestigation).toContain("GW-DOC-LIFECYCLE-CONTEXT-V2");
    expect(currentAudit).toContain("GW-DOC-LIFECYCLE-CONTEXT-V2");
    expect(currentChange).not.toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(currentDefect).not.toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(currentInvestigation).not.toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
    expect(currentAudit).not.toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
  });

  it("extracts exact pinned and explicitly declared stage authority identities", () => {
    const template = stageTemplateForSchema("change-v2", "R1")!;
    const additional = template.replace(" -->", ", POLICY%3Aexact%20version -->");
    expect(stageDocumentAuthorityRefs("change-v2", "R1", additional)).toEqual([
      "GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2", "POLICY:exact version",
    ]);
    expect(() => stageDocumentAuthorityRefs("change-v2", "R1", template.replace("change-r1-v2", "change-r1-v1")))
      .toThrow("exact pinned template");
    expect(() => stageDocumentAuthorityRefs("change-v2", "R1", template.replace(", GW-DOC-LIFECYCLE-CONTEXT-V2", "")))
      .toThrow("missing pinned AuthorityRef");
    expect(() => stageDocumentAuthorityRefs("change-v2", "R1", template.replace(" -->", ", GW-DOC-WORK-LIFECYCLE-V1 -->")))
      .toThrow("duplicate AuthorityRef");
    for (const token of ["%ZZ", "POLICY:raw", "%41", ""]) {
      expect(() => stageDocumentAuthorityRefs("change-v2", "R1", template.replace(" -->", ", " + token + " -->")))
        .toThrow();
    }
  });

  it("binds every current v2 stage template to current lifecycle context", () => {
    for (const schemaId of ["change-v2", "defect-v2"] as const) {
      for (const stage of ["R1", "R2", "DESIGN", "PLAN", "R3"] as const) {
        const template = stageTemplateForSchema(schemaId, stage);
        expect(template).not.toBeNull();
        expect(template).toContain("GW-DOC-LIFECYCLE-CONTEXT-V2");
        expect(template).not.toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
      }
    }
    for (const schemaId of ["investigation-v2", "audit-v2"] as const) {
      const template = stageTemplateForSchema(schemaId, "R1");
      expect(template).toContain("GW-DOC-LIFECYCLE-CONTEXT-V2");
      expect(template).not.toContain("GW-DOC-LIFECYCLE-CONTEXT-V1");
      expect(stageTemplateForSchema(schemaId, "R2")).toBeNull();
    }
  });

  it("carries the complete S7 design-content contract in current delivery templates", () => {
    const change = stageTemplateForSchema("change-v2", "DESIGN");
    const defect = stageTemplateForSchema("defect-v2", "DESIGN");

    expect(change).toContain("## Existing capability/reuse, behavior to replace, and necessary new concepts");
    expect(change).toContain("## Decisions/rationale/rejected alternatives");
    expect(defect).toContain("## Existing capability/reuse, incorrect behavior to delete/replace, and necessary new concepts");
    expect(defect).toContain("## Rejected alternatives/rationale");
  });

  it("carries the complete S8-S10 PLAN contract only in current delivery templates", () => {
    const change = stageTemplateForSchema("change-v2", "PLAN");
    const defect = stageTemplateForSchema("defect-v2", "PLAN");
    const historical = stageTemplateForSchema("change-v1", "PLAN");

    expect(change).not.toBeNull();
    expect(defect).not.toBeNull();
    expect(historical).not.toBeNull();

    for (const heading of [
      "## Requirement/design traceability",
      "## Module ownership/decomposition constraints and architecture-feedback checkpoints",
      "## Expected production and test/validation surface",
      "## Completion evidence",
      "## Minimum-change forecast",
      "## Canonical order-tasks block",
    ]) {
      expect(change).toContain(heading);
      expect(defect).toContain(heading);
    }
    expect(change).toContain("## Verification contract");
    expect(defect).toContain("## Verification contract including reproduction/regression/preservation");
    expect(change).toContain("GW-DOC-SPECIFICATION-STANDARD-V2");
    expect(defect).toContain("GW-DOC-SPECIFICATION-STANDARD-V2");

    expect(historical).not.toContain(
      "## Module ownership/decomposition constraints and architecture-feedback checkpoints",
    );
    expect(historical).not.toContain("## Minimum-change forecast");

    expect(() =>
      validateStageDocumentStructure("change-v2", "PLAN", change!)
    ).not.toThrow();
    expect(() =>
      validateStageDocumentStructure(
        "change-v2",
        "PLAN",
        change!.replace("## Completion evidence\n", ""),
      )
    ).toThrow(/missing ordered section/);
  });

  it("projects the exact human body and preserves exact metadata bytes during body recomposition", () => {
    const metadata = {
      formatVersion: 1 as const,
      id: `work_${uuidA}`,
      projectId: "order",
      concernIds: ["core"],
      schemaId: "change-v1" as const,
    };
    const rendered = renderWorkItemSourceMarkdown(metadata, "Human body");
    const renderedParsed = parseWorkItemSourceMarkdown(
      `work_${uuidA}.md`,
      hashA,
      rendered,
    );
    expect(renderedParsed.bodyMarkdown).toBe(
      rendered.slice(rendered.indexOf("\n---\n") + "\n---\n".length),
    );

    const envelope = [
      "---",
      `{ "schemaId": "change-v1", "concernIds": ["core"], "projectId": "order", "id": "work_${uuidA}", "formatVersion": 1 }`,
      "---",
      "",
    ].join("\n");
    const exact = envelope + renderedParsed.bodyMarkdown;
    const changedBody = renderedParsed.bodyMarkdown.replace(
      "## Current context\n",
      "## Current context\nBody-only edit.\n",
    );
    const recomposed = recomposeWorkItemSourceBody(exact, changedBody);
    expect(recomposed.slice(0, envelope.length)).toBe(envelope);
    expect(recomposed.slice(envelope.length)).toBe(changedBody);
    expect(() => recomposeWorkItemSourceBody(
      exact,
      changedBody.replace("## Evidence/references", "## Missing evidence"),
    )).toThrow(/missing ordered section/);
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

  it("enforces v2 stage structure without reinterpreting v1 pins", () => {
    const valid = [
      stageTemplateForSchema("defect-v2", "R2")!.split("\n")[0]!,
      "# Requirements",
      "",
      "## Proven defect/root cause",
      "",
      "## Functional authority disposition ledger",
      "",
      "| Requirement | Disposition | Canonical owner |",
      "|---|---|---|",
      "| Preserve canonical document ownership | REFERENCE | GW-P1-DOC-CANONICALITY |",
      "",
      "## Expected corrected behavior",
      "",
      "## Behavior that must remain unchanged",
      "",
      "## Acceptance proving the original defect",
      "",
      "## Regression/preservation acceptance",
      "",
      "## Scope/exclusions",
      "",
      "## Open product/authority questions",
      "",
    ].join("\n");
    expect(() =>
      validateStageDocumentStructure("defect-v2", "R2", valid)
    ).not.toThrow();
    expect(() =>
      validateStageDocumentStructure(
        "defect-v2",
        "R2",
        valid.replace("## Functional authority disposition ledger\n", ""),
      )
    ).toThrow(/missing ordered section/);
    expect(() =>
      validateStageDocumentStructure(
        "defect-v2",
        "R2",
        valid.replace(
          "| Preserve canonical document ownership | REFERENCE | GW-P1-DOC-CANONICALITY |",
          "|  |  |  |",
        ),
      )
    ).toThrow(/requires at least one requirement row/);
    expect(() =>
      validateStageDocumentStructure(
        "defect-v2",
        "R2",
        valid.replace("| REFERENCE |", "| COPY |"),
      )
    ).toThrow(/must be REFERENCE, DELTA or LOCAL/);
    expect(() =>
      validateStageDocumentStructure(
        "defect-v2",
        "R2",
        valid.replace(
          "GW-P1-DOC-CANONICALITY",
          "not-a-canonical-owner",
        ),
      )
    ).toThrow(/requires a GW-\* canonical owner/);
    expect(() =>
      validateStageDocumentStructure(
        "defect-v2",
        "R2",
        valid.replace(
          "| Preserve canonical document ownership | REFERENCE | GW-P1-DOC-CANONICALITY |",
          "| Package-local defect acceptance | LOCAL | — |",
        ),
      )
    ).not.toThrow();
    expect(
      authorityDispositionOwnerRefs("defect-v2", "R2", valid),
    ).toEqual(["GW-P1-DOC-CANONICALITY"]);
    expect(
      authorityDispositionOwnerRefs(
        "defect-v2",
        "R2",
        valid.replace(
          "| Preserve canonical document ownership | REFERENCE | GW-P1-DOC-CANONICALITY |",
          "| Package-local defect acceptance | LOCAL | — |",
        ),
      ),
    ).toEqual([]);
    expect(() =>
      validateStageDocumentStructure("defect-v1", "R2", "# legacy\n")
    ).not.toThrow();
  });

  it("owns kind defaults and R1 completion admissibility in the source catalog", () => {
    expect(defaultSchemaForKind("CHANGE")).toBe("change-v2");
    expect(defaultSchemaForKind("DEFECT")).toBe("defect-v2");
    expect(defaultSchemaForKind("INVESTIGATION")).toBe("investigation-v2");
    expect(defaultSchemaForKind("AUDIT")).toBe("audit-v2");
    const investigationOutcomes = [
      "INVESTIGATION_COMPLETE",
      "DUPLICATE",
      "ALREADY_SATISFIED",
    ] as const;
    expect(allowedR1CompletionsForSchema("investigation-v1")).toEqual(investigationOutcomes);
    expect(allowedR1CompletionsForSchema("investigation-v2")).toEqual(investigationOutcomes);
    expect(allowedR1CompletionsForSchema("audit-v1")).not.toContain("CONFIRMED");
    expect(allowedR1CompletionsForSchema("audit-v2")).toEqual([
      "AUDIT_COMPLETE",
      "DUPLICATE",
      "ALREADY_SATISFIED",
    ]);
    expect(stageTemplateForSchema("investigation-v2", "R2")).toBeNull();
    expect(stageTemplateForSchema("audit-v2", "R2")).toBeNull();
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
      tag: "REJECT",
      code: "INVALID_SOURCE",
      detail: "WorkItem source is not at its deterministic repository path",
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
    for (const schemaId of ["investigation-v1", "investigation-v2", "audit-v1", "audit-v2"] as const) {
      const outcomes = allowedR1CompletionsForSchema(schemaId);
      for (const outcome of ["DUPLICATE", "ALREADY_SATISFIED", "INVESTIGATION_COMPLETE", "AUDIT_COMPLETE"] as const) {
        for (const childSchemaId of ["change-v1", "change-v2", "defect-v1", "defect-v2"] as const) {
          expect(linkedRemediationIsAllowed({ ...parent, schemaId, outcome }, "order", childSchemaId))
            .toBe(outcomes.includes(outcome));
        }
      }
    }
    expect(linkedRemediationIsAllowed({ ...parent, stage: "R1", outcome: null }, "order", "change-v2")).toBe(false);
    expect(linkedRemediationIsAllowed({ ...parent, schemaId: "change-v2", outcome: "ALREADY_SATISFIED" }, "order", "change-v2")).toBe(false);
    expect(linkedRemediationIsAllowed({ ...parent, outcome: null }, "order", "change-v2")).toBe(false);

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


describe("closed Workbench workflow-state kernel", () => {
  const stageRun = (
    status: Run["status"] = "RUNNING",
    stage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3" = "R1",
    attempt = 1,
  ): Run =>
    RunSchema.parse({
      ...baseRun(),
      id: `run_${uuidB}`,
      executionTaskId: null,
      stage,
      mode: "INTERACTIVE",
      role: "STAGE",
      triggerEventId: null,
      status,
      attempt,
      terminalClassification: status === "FAILED" ? "PROVIDER_FAILURE" : null,
      endedAt:
        status === "COMPLETED" ||
        status === "BLOCKED" ||
        status === "FAILED" ||
        status === "CANCELLED"
          ? "2026-11-11T03:31:00.000Z"
          : null,
    });

  const stageStarted = (run: Run, sequence = 1) =>
    RunEventSchema.parse({
      id: `event_${uuidA}`,
      runId: run.id,
      sequence,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: {
        tag: "STAGE_STARTED",
        stage: run.stage,
        mode: "INTERACTIVE",
        contextHash: hashA,
      },
    });

  it("routes every lifecycle mutation through the closed transition-cause language", () => {
    const idea = WorkItemSchema.parse({
      ...baseWorkItem(),
      stage: "IDEA",
      status: "ACTIVE",
      outcome: null,
    });
    expect(transitionWorkItem(idea, { tag: "START_RESEARCH" })).toEqual({
      stage: "R1",
      status: "ACTIVE",
      outcome: null,
    });
    expect(transitionWorkItem(idea, { tag: "SOURCE_AUTHORITY_CHANGED" })).toEqual({
      stage: "IDEA",
      status: "ACTIVE",
      outcome: null,
    });
    expect(() =>
      transitionWorkItem(baseWorkItem(), { tag: "START_RESEARCH" }),
    ).toThrow(/IDEA/);

    const research = baseWorkItem();
    const plan = WorkItemSchema.parse({
      ...research,
      stage: "PLAN",
      status: "ACTIVE",
      outcome: null,
    });
    expect(transitionWorkItem(plan, { tag: "SOURCE_AUTHORITY_CHANGED" })).toEqual({
      stage: "R1",
      status: "ACTIVE",
      outcome: null,
    });
    expect(
      transitionWorkItem(plan, {
        tag: "LIFECYCLE_ARTIFACT_CHANGED",
        owner: "DESIGN",
      }),
    ).toEqual({
      stage: "DESIGN",
      status: "ACTIVE",
      outcome: null,
    });
    expect(() =>
      transitionWorkItem(research, {
        tag: "LIFECYCLE_ARTIFACT_CHANGED",
        owner: "R3",
      }),
    ).toThrow(/has not been reached/);

    expect(transitionWorkItem(research, { tag: "BLOCK_CURRENT_OWNER" })).toEqual({
      stage: "R1",
      status: "BLOCKED",
      outcome: null,
    });
    const blocked = WorkItemSchema.parse({ ...research, status: "BLOCKED" });
    expect(transitionWorkItem(blocked, { tag: "RESUME_CURRENT_OWNER" })).toEqual({
      stage: "R1",
      status: "ACTIVE",
      outcome: null,
    });
    expect(() =>
      transitionWorkItem(blocked, { tag: "BLOCK_CURRENT_OWNER" }),
    ).toThrow(/requires ACTIVE/);
    expect(() =>
      transitionWorkItem(research, { tag: "RESUME_CURRENT_OWNER" }),
    ).toThrow(/requires BLOCKED/);
    expect(
      transitionWorkItem(research, {
        tag: "STAGE_COMPLETED",
        completion: { stage: "R1", outcome: "CONFIRMED" },
      }, ["CONFIRMED"]),
    ).toEqual({ stage: "R2", status: "ACTIVE", outcome: null });

    const awaiting = WorkItemSchema.parse({
      ...research,
      stage: "AWAITING_SIGNOFF",
      status: "ACTIVE",
    });
    expect(transitionWorkItem(awaiting, { tag: "SOURCE_AUTHORITY_CHANGED" })).toEqual({
      stage: "R1",
      status: "ACTIVE",
      outcome: null,
    });
    expect(transitionWorkItem(awaiting, { tag: "SIGN_OFF" })).toEqual({
      stage: "EXECUTION",
      status: "ACTIVE",
      outcome: null,
    });
    expect(
      transitionWorkItem(awaiting, {
        tag: "RECONCILE_AUTHORITY",
        owner: "DESIGN",
      }),
    ).toEqual({
      stage: "DESIGN",
      status: "ACTIVE",
      outcome: null,
    });

    const execution = WorkItemSchema.parse({
      ...research,
      stage: "EXECUTION",
      status: "ACTIVE",
    });
    expect(
      transitionWorkItem(execution, { tag: "EXECUTION_RETURN", owner: "DESIGN" }),
    ).toEqual({ stage: "DESIGN", status: "ACTIVE", outcome: null });
    expect(
      transitionWorkItem(execution, {
        tag: "EXECUTION_COMPLETED",
        outcome: "CANDIDATE_DONE",
      }),
    ).toEqual({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "CANDIDATE_DONE",
    });
    expect(() =>
      transitionWorkItem(research, {
        tag: "EXECUTION_RETURN",
        owner: "R1",
      }),
    ).toThrow(/EXECUTION owner/);
    expect(() =>
      transitionWorkItem(research, {
        tag: "EXECUTION_COMPLETED",
        outcome: "ALREADY_SATISFIED",
      }),
    ).toThrow(/EXECUTION owner/);
    expect(() =>
      transitionWorkItem(research, { tag: "SIGN_OFF" }),
    ).toThrow(/AWAITING_SIGNOFF/);
    expect(() =>
      transitionWorkItem(research, {
        tag: "RECONCILE_AUTHORITY",
        owner: "R1",
      }),
    ).toThrow(/AWAITING_SIGNOFF/);
  });

  it("derives PROCESSING, OPEN, REQUIRED_INPUT and CLOSED from canonical Run history", () => {
    const running = stageRun();
    const started = stageStarted(running);
    expect(stageRunInteraction(running, [started])).toEqual({ tag: "PROCESSING" });

    const message = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: running.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: { tag: "AGENT_MESSAGE_FINAL", text: "Ready", evidence: [] },
    });
    expect(stageRunInteraction(running, [started, message])).toEqual({ tag: "OPEN" });
    expect(stageInputIsAdmitted({ tag: "OPEN" }, null)).toBe(true);
    expect(stageInputIsAdmitted({ tag: "OPEN" }, `event_${uuidC}` as RunEventId)).toBe(false);

    const request = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: running.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: { tag: "HUMAN_INPUT_REQUESTED", category: "INFORMATION", question: "Clarify?" },
    });
    const waiting = RunSchema.parse({ ...running, status: "WAITING_FOR_INPUT" });
    expect(stageRunInteraction(waiting, [started, request])).toEqual({
      tag: "REQUIRED_INPUT",
      requestEventId: request.id,
    });
    expect(stageInputIsAdmitted(
      { tag: "REQUIRED_INPUT", requestEventId: request.id },
      request.id,
    )).toBe(true);
    expect(stageInputIsAdmitted(
      { tag: "REQUIRED_INPUT", requestEventId: request.id },
      null,
    )).toBe(false);

    const answer = RunEventSchema.parse({
      id: `event_${uuidD}`,
      runId: running.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: { tag: "HUMAN_INPUT_RECEIVED", requestEventId: request.id, text: "Answer" },
    });
    expect(stageRunInteraction(running, [started, request, answer])).toEqual({
      tag: "PROCESSING",
    });

    const duplicateAnswer = RunEventSchema.parse({
      id: "event_55555555-5555-4555-8555-555555555555",
      runId: running.id,
      sequence: 4,
      occurredAt: "2026-11-11T03:30:03.000Z",
      event: {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId: request.id,
        text: "Duplicate answer",
      },
    });
    expect(() =>
      stageRunInteraction(running, [started, request, answer, duplicateAnswer]),
    ).toThrow(/exact current required request/);

    const unknownAnswer = RunEventSchema.parse({
      id: "event_66666666-6666-4666-8666-666666666666",
      runId: running.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId: "event_77777777-7777-4777-8777-777777777777",
        text: "Unknown answer",
      },
    });
    expect(() =>
      stageRunInteraction(running, [started, unknownAnswer]),
    ).toThrow(/exact current required request/);

    const freeFormDuringRequest = RunEventSchema.parse({
      id: "event_88888888-8888-4888-8888-888888888888",
      runId: running.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId: null,
        text: "Bypass required request",
      },
    });
    expect(() =>
      stageRunInteraction(
        running,
        [started, request, freeFormDuringRequest],
      ),
    ).toThrow(/cannot bypass/);

    const secondRequest = RunEventSchema.parse({
      id: "event_99999999-9999-4999-8999-999999999999",
      runId: running.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "INFORMATION",
        question: "Second unresolved request?",
      },
    });
    expect(() =>
      stageRunInteraction(
        RunSchema.parse({ ...running, status: "WAITING_FOR_INPUT" }),
        [started, request, secondRequest],
      ),
    ).toThrow(/multiple unresolved input requests/);

    const closed = stageRun("CANCELLED");
    expect(stageRunInteraction(closed, [])).toEqual({ tag: "CLOSED" });
  });

  it("rejects contradictory STAGE provider-result batches before persistence", () => {
    const run = stageRun();
    const prior = [stageStarted(run)];
    const completion = {
      tag: "STAGE_COMPLETED",
      completion: { stage: "R1", outcome: "CONFIRMED" },
      artifactRefIds: [],
    } as const;
    const request = {
      tag: "HUMAN_INPUT_REQUESTED",
      category: "INFORMATION",
      question: "Clarify?",
    } as const;
    const proposal = {
      tag: "ARTIFACT_PROPOSAL_CREATED",
      targetPath: "docs/r1.md",
      baseSha256: null,
      role: "R1",
      authorityLayer: "P1",
      unifiedDiff: "--- a/docs/r1.md\n+++ b/docs/r1.md\n@@ -1 +1 @@\n-old\n+new\n",
      rationale: "Update research",
    } as const;

    const message = {
      tag: "AGENT_MESSAGE_FINAL",
      text: "I updated the proposed lifecycle material.",
      evidence: [],
    } as const;

    expect(stageProviderBatchRejectionCode(run, prior, [])).toBe("EMPTY_BATCH");
    expect(() => validateStageProviderTurn(run, prior, [])).toThrow(/non-empty/);
    expect(stageProviderBatchRejectionCode(run, prior, [request, completion]))
      .toBe("MULTIPLE_CONTROLS");
    expect(() =>
      validateStageProviderTurn(run, prior, [request, completion]),
    ).toThrow(/contradictory/);
    expect(stageProviderBatchRejectionCode(run, prior, [request, proposal]))
      .toBe("PROPOSAL_WITH_CONTROL");
    expect(() =>
      validateStageProviderTurn(run, prior, [request, proposal]),
    ).toThrow(/cannot coexist/);
    expect(stageProviderBatchRejectionCode(run, prior, [proposal]))
      .toBe("OPEN_REQUIRES_AGENT_MESSAGE");
    expect(() =>
      validateStageProviderTurn(run, prior, [proposal]),
    ).toThrow(/requires exactly one non-blank agent message/);
    expect(() =>
      validateStageProviderTurn(run, prior, [message, proposal]),
    ).not.toThrow();
    expect(() =>
      validateStageProviderTurn(run, prior, [{
        ...proposal,
        role: "PLAN",
      }, message]),
    ).toThrow(/role must equal/);
    expect(stageProviderBatchRejectionCode(run, prior, [{
      ...message,
      text: "   ",
    }])).toBe("OPEN_REQUIRES_AGENT_MESSAGE");
    expect(stageProviderBatchRejectionCode(run, prior, [message, message]))
      .toBe("MULTIPLE_AGENT_MESSAGES");
  });

  it("derives durable proposal decision and adoption-in-progress from canonical events", () => {
    const run = stageRun();
    const proposal = RunEventSchema.parse({
      id: `event_${uuidA}`,
      runId: run.id,
      sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/r1.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: "--- a/docs/r1.md\n+++ b/docs/r1.md\n@@ -1 +1 @@\n-old\n+new\n",
        rationale: "Update research",
      },
    });
    const requested = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: run.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: proposal.id,
      },
    });
    const adopted = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "ADOPTED",
        adoptedArtifactRefId: `artifact_${uuidA}`,
      },
    });
    const rejected = RunEventSchema.parse({
      id: `event_${uuidD}`,
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "REJECTED",
        adoptedArtifactRefId: null,
      },
    });
    const secondProposal = RunEventSchema.parse({
      id: "event_55555555-5555-4555-8555-555555555555",
      runId: run.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/r1-alt.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: "--- /dev/null\n+++ b/docs/r1-alt.md\n@@ -0,0 +1 @@\n+new\n",
        rationale: "Contradictory second proposal",
      },
    });
    const duplicateAdoption = RunEventSchema.parse({
      id: "event_66666666-6666-4666-8666-666666666666",
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: proposal.id,
      },
    });
    const duplicateDisposition = RunEventSchema.parse({
      id: "event_77777777-7777-4777-8777-777777777777",
      runId: run.id,
      sequence: 4,
      occurredAt: "2026-11-11T03:30:03.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "ADOPTED",
        adoptedArtifactRefId: `artifact_${uuidA}`,
      },
    });
    const unknownControl = RunEventSchema.parse({
      id: "event_88888888-8888-4888-8888-888888888888",
      runId: run.id,
      sequence: 4,
      occurredAt: "2026-11-11T03:30:03.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: "event_99999999-9999-4999-8999-999999999999",
      },
    });

    expect(deriveProposalDecision([proposal])).toEqual({
      tag: "PENDING",
      proposalEventId: proposal.id,
    });
    expect(deriveProposalDecision([proposal, requested])).toEqual({
      tag: "ADOPTION_IN_PROGRESS",
      proposalEventId: proposal.id,
    });
    expect(deriveProposalDecision([proposal, requested, adopted])).toEqual({
      tag: "NONE",
    });
    expect(deriveProposalDecision([proposal, rejected])).toEqual({
      tag: "NONE",
    });
    expect(() =>
      deriveProposalDecision([proposal, secondProposal]),
    ).toThrow(/multiple unresolved/);
    expect(() =>
      deriveProposalDecision([proposal, requested, duplicateAdoption]),
    ).toThrow(/duplicate adoption intent/);
    expect(() =>
      deriveProposalDecision([
        proposal,
        requested,
        adopted,
        duplicateDisposition,
      ]),
    ).toThrow(/duplicate disposition/);
    expect(() =>
      deriveProposalDecision([proposal, requested, rejected]),
    ).toThrow(/rejected proposal cannot have adoption intent/);
    expect(() =>
      deriveProposalDecision([proposal, adopted]),
    ).toThrow(/requires durable adoption intent/);
    expect(() =>
      deriveProposalDecision([proposal, unknownControl]),
    ).toThrow(/unknown proposal/);
  });

  it("keeps coordinator activity observational for STAGE interaction settlement", () => {
    const run = stageRun();
    const started = stageStarted(run);
    const activity = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: run.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: {
        tag: "AGENT_ACTIVITY_RECORDED",
        category: "READING",
        summary: "Reading current lifecycle material",
        resource: "docs/r1.md",
      },
    });
    expect(stageRunInteraction(run, [started, activity])).toEqual({ tag: "PROCESSING" });
  });

  it("admits STAGE cancellation only while no lifecycle proposal owns attention", () => {
    const run = stageRun();
    const started = stageStarted(run);
    expect(stageRunCancellationIsAdmitted(run, [started])).toBe(true);

    const proposal = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: run.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/r1.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: "--- a/docs/r1.md\n+++ b/docs/r1.md\n@@ -1 +1 @@\n-old\n+new\n",
        rationale: "Update research",
      },
    });
    expect(stageRunCancellationIsAdmitted(run, [started, proposal])).toBe(false);

    const disposition = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "REJECTED",
        adoptedArtifactRefId: null,
      },
    });
    expect(stageRunCancellationIsAdmitted(run, [started, proposal, disposition])).toBe(true);
  });

  it("derives lifecycle material maturity only from canonical facts", () => {
    expect(deriveMaterialPresentationState(
      true,
      "UNREACHED",
      { tag: "CURRENT" },
      false,
      false,
    )).toEqual({ tag: "DRAFT" });
    expect(deriveMaterialPresentationState(
      true,
      "CURRENT",
      { tag: "CURRENT" },
      false,
      false,
    )).toEqual({ tag: "UPDATED_VALIDATION_REQUIRED" });
    expect(deriveMaterialPresentationState(
      true,
      "CURRENT",
      { tag: "CURRENT" },
      true,
      false,
    )).toEqual({ tag: "CURRENT" });
    expect(deriveMaterialPresentationState(
      true,
      "REACHED_HISTORICAL",
      { tag: "STALE", owner: "R2" },
      false,
      false,
    )).toEqual({ tag: "STALE", owner: "R2" });
    expect(deriveMaterialPresentationState(
      false,
      "REACHED_HISTORICAL",
      { tag: "CURRENT" },
      true,
      false,
    )).toEqual({ tag: "HISTORICAL" });
    expect(deriveMaterialPresentationState(
      true,
      "REACHED_HISTORICAL",
      { tag: "CURRENT" },
      true,
      true,
    )).toEqual({ tag: "SIGNED_LOCKED" });
    expect(deriveMaterialPresentationState(false, "REACHED_HISTORICAL", { tag: "CURRENT" }, false, true))
      .toEqual({ tag: "SIGNED_LOCKED" });
    expect(() => deriveMaterialPresentationState(false, "UNREACHED", { tag: "CURRENT" }, false, true))
      .toThrow();
  });

  it("scopes stale currentness to the changed owner and downstream stages", () => {
    const stale = { tag: "STALE", owner: "DESIGN" } as const;
    expect(materialCurrentnessForStage(stale, "R1")).toEqual({ tag: "CURRENT" });
    expect(materialCurrentnessForStage(stale, "R2")).toEqual({ tag: "CURRENT" });
    expect(materialCurrentnessForStage(stale, "DESIGN")).toEqual(stale);
    expect(materialCurrentnessForStage(stale, "PLAN")).toEqual(stale);
    expect(materialCurrentnessForStage({ tag: "CURRENT" }, "PLAN"))
      .toEqual({ tag: "CURRENT" });
  });

  it("matches conformance only when the exact current ArtifactRef was covered", () => {
    const current = artifact(uuidA, "docs/r2.md", "R2", "P3", hashA);
    const other = artifact(uuidB, "docs/r2.md", "R2", "P3", hashA);
    const run = stageRun("COMPLETED", "R2");
    const event = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: run.id,
      sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: {
        tag: "CONFORMANCE_PASSED",
        stage: "R2",
        outputArtifactRefIds: [current.id],
        contextHash: run.contextHash,
        evidence: [],
      },
    });
    const completion = RunEventSchema.parse({
      ...event, id: `event_${uuidD}`, sequence: 1,
      event: { tag: "STAGE_COMPLETED", completion: { stage: "R2", outcome: "ACCEPTED" }, artifactRefIds: [current.id] },
    });
    const paired = [{ ...event, sequence: 2 }, completion];
    expect(artifactHasCurrentStageConformance(current, [run], paired)).toBe(true);
    expect(artifactHasCurrentStageConformance(other, [run], paired)).toBe(false);
    expect(artifactHasCurrentStageConformance(current, [run], [event])).toBe(false);
    expect(artifactHasCurrentStageConformance(current, [run], [completion, { ...event, sequence: 0 }])).toBe(false);
    expect(artifactHasCurrentStageConformance(current, [], paired)).toBe(false);
    expect(artifactHasCurrentStageConformance(current, [{ ...run, status: "FAILED" }], paired)).toBe(false);
    expect(artifactHasCurrentStageConformance(current, [{ ...run, workItemId: `work_${uuidB}` }], paired)).toBe(false);
  });

  it("derives reached history only from actual canonical evidence", () => {
    const plan = WorkItemSchema.parse({
      ...baseWorkItem(),
      stage: "PLAN",
      status: "ACTIVE",
      outcome: null,
    });
    const withoutHistory = deriveReachedStages(plan, [], [], [], []);
    expect([...withoutHistory]).toEqual(["IDEA", "PLAN"]);
    expect(withoutHistory.has("R1")).toBe(false);
    expect(withoutHistory.has("R3")).toBe(false);

    const repositoryDraft = artifact(uuidA, "docs/r2.md", "R2", "P3", hashA);
    const withDraftOnly = deriveReachedStages(plan, [], [], [repositoryDraft], []);
    expect(withDraftOnly.has("R2")).toBe(false);

    const readinessRun = stageRun("COMPLETED", "R3");
    const reached = deriveReachedStages(plan, [readinessRun], [], [], []);
    expect(reached.has("R3")).toBe(true);
    expect(reached.has("R2")).toBe(false);

    const readinessCompleted = RunEventSchema.parse({
      id: `event_${uuidD}`,
      runId: readinessRun.id,
      sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: {
        tag: "STAGE_COMPLETED",
        completion: { stage: "R3", outcome: "READY_FOR_SIGNOFF" },
        artifactRefIds: [repositoryDraft.id],
      },
    });
    const readinessConformed = RunEventSchema.parse({
      ...readinessCompleted,
      id: `event_${uuidC}`,
      sequence: 2,
      event: {
        tag: "CONFORMANCE_PASSED", stage: "R3",
        outputArtifactRefIds: [repositoryDraft.id],
        contextHash: readinessRun.contextHash, evidence: [],
      },
    });
    for (const invalid of [
      [],
      [readinessCompleted],
      [readinessConformed],
      [readinessCompleted, { ...readinessConformed, sequence: 0 }],
      [readinessCompleted, { ...readinessConformed, runId: `run_${uuidA}` }],
      [readinessCompleted, { ...readinessConformed, event: {
        tag: "CONFORMANCE_PASSED", stage: "R3", outputArtifactRefIds: [repositoryDraft.id],
        contextHash: hashB, evidence: [],
      } }],
      [readinessCompleted, readinessConformed, { ...readinessCompleted, sequence: 3 }],
      [readinessCompleted, readinessConformed, { ...readinessConformed, sequence: 3 }],
      [readinessCompleted, { ...readinessConformed, event: {
        tag: "CONFORMANCE_PASSED", stage: "R3",
        outputArtifactRefIds: [`artifact_${uuidD}`], contextHash: readinessRun.contextHash, evidence: [],
      } }],
    ]) {
      expect(deriveReachedStages(plan, [readinessRun], invalid as RunEvent[], [], []).has("AWAITING_SIGNOFF")).toBe(false);
    }
    const returnedUpstream = deriveReachedStages(
      plan,
      [readinessRun],
      [readinessCompleted, readinessConformed],
      [],
      [],
    );
    expect(returnedUpstream.has("R3")).toBe(true);
    expect(returnedUpstream.has("AWAITING_SIGNOFF")).toBe(true);
    expect(
      reachStateForStage(plan, returnedUpstream, "AWAITING_SIGNOFF"),
    ).toBe("REACHED_HISTORICAL");
  });

  it("selects exactly one schema-admitted terminal R1 artifact and rejects contradictory provenance", () => {
    const complete = WorkItemSchema.parse({
      ...baseWorkItem(), stage: "COMPLETE", status: "COMPLETE", outcome: "ALREADY_SATISFIED",
    });
    const run = stageRun("COMPLETED", "R1");
    const output = artifact(uuidA, "docs/r1.md", "R1", "P1", hashA);
    const completion = RunEventSchema.parse({
      id: `event_${uuidA}`, runId: run.id, sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: { tag: "STAGE_COMPLETED", completion: { stage: "R1", outcome: "ALREADY_SATISFIED" }, artifactRefIds: [output.id] },
    });
    const conformance = RunEventSchema.parse({
      ...completion, id: `event_${uuidB}`, sequence: 2,
      event: { tag: "CONFORMANCE_PASSED", stage: "R1", contextHash: run.contextHash, outputArtifactRefIds: [output.id], evidence: [] },
    });
    const events = [completion, conformance];
    const allowed = allowedR1CompletionsForSchema(complete.schemaId);
    expect(admittedTerminalR1Artifact(complete, [run], events, [output], allowed)).toEqual(output);
    expect(admittedTerminalR1Artifact(complete, [run], [completion], [output], allowed)).toBeNull();
    expect(() => admittedTerminalR1Artifact(complete, [run], events, [], allowed)).toThrow("exact output");
    expect(() => admittedTerminalR1Artifact(complete, [run], events, [{ ...output, role: "R2" }], allowed)).toThrow("exact output");
    expect(() => admittedTerminalR1Artifact(complete, [run], events, [output], ["DISPROVEN"])).toThrow("inconsistent");
    expect(() => admittedTerminalR1Artifact({ ...complete, outcome: "DUPLICATE" }, [run], events, [output], allowed)).toThrow("inconsistent");
    const other = RunSchema.parse({ ...run, id: `run_${uuidD}`, attempt: 2 });
    const otherEvents = events.map((event) => RunEventSchema.parse({ ...event, runId: other.id }));
    expect(() => admittedTerminalR1Artifact(complete, [run, other], [...events, ...otherEvents], [output], allowed)).toThrow("ambiguous");
  });

  it("derives execution owner and current-candidate validation boundary independently of selection", () => {
    const runningTask = baseTask(`task_${uuidA}`, "RUNNING");
    const run = baseRun({ executionTaskId: runningTask.id });
    const v0 = RunEventSchema.parse({
      id: `event_${uuidA}`,
      runId: run.id,
      sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: { tag: "VALIDATION_PASSED", stage: "V0", evidence: [] },
    });
    const v1 = RunEventSchema.parse({
      id: `event_${uuidB}`,
      runId: run.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:30:01.000Z",
      event: { tag: "VALIDATION_PASSED", stage: "V1", evidence: [] },
    });
    const owner = deriveExecutionOwner([runningTask], [run]);
    expect(owner).toEqual({ tag: "CURRENT_TASK", taskId: runningTask.id });
    expect(deriveValidationBoundary(owner, [runningTask], [run], [v0, v1]))
      .toEqual({ tag: "PASSED_THROUGH", stage: "V1" });

    const blockedTask = { ...runningTask, state: "BLOCKED" as const };
    expect(deriveExecutionOwner([blockedTask], [run])).toEqual({
      tag: "BLOCKED_TASK",
      taskId: blockedTask.id,
    });

    const eligibleTask = baseTask(`task_${uuidB}`, "TODO");
    expect(deriveExecutionOwner([eligibleTask], [])).toEqual({
      tag: "CURRENT_TASK",
      taskId: eligibleTask.id,
    });

    const prerequisiteTask = baseTask(`task_${uuidC}`, "TODO");
    const dependentTask = {
      ...baseTask(`task_${uuidD}`, "TODO"),
      dependsOn: [prerequisiteTask.id],
    };
    expect(deriveExecutionOwner([dependentTask, prerequisiteTask], [])).toEqual({
      tag: "CURRENT_TASK",
      taskId: prerequisiteTask.id,
    });
    expect(deriveExecutionOwner([
      dependentTask,
      { ...prerequisiteTask, state: "CANDIDATE_DONE" },
    ], [])).toEqual({
      tag: "CURRENT_TASK",
      taskId: dependentTask.id,
    });

    expect(deriveExecutionOwner([], [])).toEqual({ tag: "NONE" });
    expect(deriveExecutionOwner([], [{
      ...run,
      status: "COMPLETED",
      endedAt: "2026-11-11T03:30:03.000Z",
    }])).toEqual({ tag: "NONE" });
    expect(deriveValidationBoundary(
      { tag: "NONE" },
      [],
      [],
      [],
    )).toEqual({ tag: "NONE" });

    const failedValidation = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:02.000Z",
      event: {
        tag: "VALIDATION_FAILED",
        stage: "V2",
        classification: "TEST_FAILURE",
        summary: "candidate tests failed",
        evidence: [],
      },
    });
    expect(
      deriveValidationBoundary(
        owner,
        [runningTask],
        [run],
        [v0, v1, failedValidation],
      ),
    ).toEqual({
      tag: "FAILED_AT",
      stage: "V2",
      classification: "TEST_FAILURE",
    });

    const candidateEvent = RunEventSchema.parse({
      id: `event_${uuidD}`,
      runId: run.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:30:03.000Z",
      event: {
        tag: "CANDIDATE_STATE_RECORDED",
        patch: {
          relativePath: "candidate/patch.diff",
          sha256: hashA,
          mediaType: "text/x-diff",
        },
        changedPaths: ["src/core/contracts.ts"],
      },
    });
    const reviewerOne = baseRun({
      id: `run_${uuidB}`,
      executionTaskId: runningTask.id,
      role: "REVIEWER",
      triggerEventId: candidateEvent.id,
      attempt: 2,
      status: "FAILED",
      terminalClassification: "PROVIDER_FAILURE",
      startedAt: "2026-11-11T03:31:00.000Z",
      endedAt: "2026-11-11T03:31:10.000Z",
    });
    const reviewerTwo = baseRun({
      id: "run_55555555-5555-4555-8555-555555555555",
      executionTaskId: runningTask.id,
      role: "REVIEWER",
      triggerEventId: candidateEvent.id,
      attempt: 3,
      startedAt: "2026-11-11T03:32:00.000Z",
    });
    const reviewerPasses = ([
      ["event_66666666-6666-4666-8666-666666666666", reviewerOne.id, 1, "V0"],
      ["event_77777777-7777-4777-8777-777777777777", reviewerOne.id, 2, "V1"],
      ["event_88888888-8888-4888-8888-888888888888", reviewerOne.id, 3, "V2"],
      ["event_99999999-9999-4999-8999-999999999999", reviewerOne.id, 4, "V3"],
      ["event_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", reviewerTwo.id, 1, "V0"],
    ] as const).map(([id, runId, sequence, stage]) =>
      RunEventSchema.parse({
        id,
        runId,
        sequence,
        occurredAt: "2026-11-11T03:32:01.000Z",
        event: { tag: "VALIDATION_PASSED", stage, evidence: [] },
      })
    );
    expect(
      deriveValidationBoundary(
        owner,
        [runningTask],
        [run, reviewerOne, reviewerTwo],
        [candidateEvent, ...reviewerPasses],
      ),
    ).toEqual({ tag: "PASSED_THROUGH", stage: "V0" });
    const staleFailure = RunEventSchema.parse({
      ...reviewerPasses[3],
      id: "event_babababa-baba-4aba-8aba-babababababa",
      sequence: 5,
      event: { tag: "VALIDATION_FAILED", stage: "V4", classification: "REVIEW_FAILURE", summary: "older attempt failed", evidence: [] },
    });
    expect(deriveValidationBoundary(owner, [runningTask], [reviewerTwo, run, reviewerOne],
      [candidateEvent, ...reviewerPasses, staleFailure])).toEqual({ tag: "PASSED_THROUGH", stage: "V0" });
    const wrongBaseline = RunSchema.parse({ ...reviewerTwo, baselineCommit: "b".repeat(40) });
    expect(() => deriveValidationBoundary(owner, [runningTask], [run, wrongBaseline],
      [candidateEvent, ...reviewerPasses])).toThrow(/baseline/);

    const outOfOrder = RunEventSchema.parse({
      ...reviewerPasses[4],
      event: { tag: "VALIDATION_PASSED", stage: "V2", evidence: [] },
    });
    expect(() => deriveValidationBoundary(owner, [runningTask], [run, reviewerTwo],
      [candidateEvent, outOfOrder])).toThrow(/ordered V0/);

    const malformedReviewer = RunSchema.parse({
      ...reviewerTwo,
      triggerEventId: "event_12121212-1212-4212-8212-121212121212",
    });
    expect(() =>
      deriveValidationBoundary(
        owner,
        [runningTask],
        [run, malformedReviewer],
        reviewerPasses.filter((event) => event.runId === reviewerTwo.id),
      ),
    ).toThrow(/CANDIDATE_STATE_RECORDED/);

    const reviewerFailure = RunEventSchema.parse({
      id: "event_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      runId: reviewerTwo.id,
      sequence: 2,
      occurredAt: "2026-11-11T03:32:02.000Z",
      event: {
        tag: "VALIDATION_FAILED",
        stage: "V4",
        classification: "REVIEW_FAILURE",
        summary: "candidate review failed",
        evidence: [],
      },
    });
    const remediator = baseRun({
      id: "run_cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      executionTaskId: runningTask.id,
      role: "REMEDIATOR",
      triggerEventId: reviewerFailure.id,
      attempt: 4,
      startedAt: "2026-11-11T03:33:00.000Z",
    });
    const remediationPreflight = [
      RunEventSchema.parse({
        id: "event_dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        runId: remediator.id,
        sequence: 1,
        occurredAt: "2026-11-11T03:33:01.000Z",
        event: { tag: "VALIDATION_PASSED", stage: "V0", evidence: [] },
      }),
      RunEventSchema.parse({
        id: "event_eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        runId: remediator.id,
        sequence: 2,
        occurredAt: "2026-11-11T03:33:02.000Z",
        event: { tag: "VALIDATION_PASSED", stage: "V1", evidence: [] },
      }),
    ];
    const remediationHistory = [
      candidateEvent,
      ...reviewerPasses,
      reviewerFailure,
      ...remediationPreflight,
    ];
    expect(
      deriveValidationBoundary(
        owner,
        [runningTask],
        [run, reviewerOne, reviewerTwo, remediator],
        remediationHistory,
      ),
    ).toEqual({
      tag: "FAILED_AT",
      stage: "V4",
      classification: "REVIEW_FAILURE",
    });

    const foreignFailure = RunEventSchema.parse({
      id: "event_13131313-1313-4313-8313-131313131313",
      runId: "run_14141414-1414-4414-8414-141414141414",
      sequence: 1,
      occurredAt: "2026-11-11T03:33:04.000Z",
      event: {
        tag: "VALIDATION_FAILED",
        stage: "V4",
        classification: "REVIEW_FAILURE",
        summary: "foreign task failure",
        evidence: [],
      },
    });
    const foreignTriggeredRemediator = RunSchema.parse({
      ...remediator,
      triggerEventId: foreignFailure.id,
    });
    expect(() =>
      deriveValidationBoundary(
        owner,
        [runningTask],
        [run, reviewerOne, reviewerTwo, foreignTriggeredRemediator],
        [candidateEvent, foreignFailure, ...remediationPreflight],
      ),
    ).toThrow(/current ExecutionTask/);

    const replacementCandidate = RunEventSchema.parse({
      id: "event_ffffffff-ffff-4fff-8fff-ffffffffffff",
      runId: remediator.id,
      sequence: 3,
      occurredAt: "2026-11-11T03:33:03.000Z",
      event: {
        tag: "CANDIDATE_STATE_RECORDED",
        patch: {
          relativePath: "candidate/patch.diff",
          sha256: hashB,
          mediaType: "text/x-diff",
        },
        changedPaths: ["src/core/contracts.ts"],
      },
    });
    expect(
      deriveValidationBoundary(
        owner,
        [runningTask],
        [run, reviewerOne, reviewerTwo, remediator],
        [...remediationHistory, replacementCandidate],
      ),
    ).toEqual({ tag: "NONE" });

    const completeTask = {
      ...runningTask,
      state: "CANDIDATE_DONE" as const,
    };
    expect(
      deriveValidationBoundary(
        { tag: "CURRENT_TASK", taskId: completeTask.id },
        [completeTask],
        [run],
        [v0, v1],
      ),
    ).toEqual({ tag: "COMPLETE" });
  });

  it("selects only matching terminal execution failure evidence from the exact task attempt", () => {
    const task = baseTask(`task_${uuidA}`, "BLOCKED");
    const run = baseRun({ status: "BLOCKED", terminalClassification: "PRECONDITION_FAILED", endedAt: "2026-11-11T03:30:10.000Z" });
    const other = baseRun({ id: `run_${uuidB}`, executionTaskId: baseTask(`task_${uuidB}`, "RUNNING").id, attempt: 9 });
    const checkpoint = RunEventSchema.parse({ id: `event_${uuidA}`, runId: run.id, sequence: 1,
      occurredAt: run.startedAt, event: { tag: "GATE_FAILED", gateId: "test", classification: "TEST_FAILURE", evidence: [] } });
    const cause = RunEventSchema.parse({ ...checkpoint, id: `event_${uuidB}`, sequence: 2,
      event: { tag: "STAGE_BLOCKED", owningStage: "EXECUTION", reason: "Required input is unavailable" } });
    const mismatch = RunEventSchema.parse({ ...checkpoint, id: `event_${uuidC}`, sequence: 3,
      event: { tag: "VALIDATION_FAILED", stage: "V3", classification: "TEST_FAILURE", summary: "unrelated classification", evidence: [] } });
    const foreign = RunEventSchema.parse({ ...cause, id: `event_${uuidD}`, runId: other.id, sequence: 4 });
    expect(executionTaskRuns(task.id, [other, run])).toEqual([run]);
    expect(terminalExecutionFailureEvent(run, [foreign, mismatch, cause, checkpoint])).toEqual(cause);
    expect(terminalExecutionFailureEvent(run, [foreign, mismatch, checkpoint])).toBeNull();
    expect(terminalExecutionFailureEvent(baseRun(), [cause, checkpoint])).toBeNull();
    const provider = RunSchema.parse({ ...run, status: "FAILED", terminalClassification: "PROVIDER_FAILURE" });
    const providerFailure = RunEventSchema.parse({ ...cause, event: { tag: "PROVIDER_FAILED", detail: "Provider disconnected", evidence: [] } });
    expect(terminalExecutionFailureEvent(provider, [checkpoint, providerFailure, mismatch])).toEqual(providerFailure);
    expect(terminalExecutionFailureEvent(provider, [cause, mismatch])).toBeNull();
  });

  it("projects every current-attention and rail-marker variant", () => {
    const active = baseWorkItem();
    const requestEventId = `event_${uuidA}` as RunEventId;
    const noneRecovery = { tag: "NONE" } as const;
    const current = { tag: "CURRENT" } as const;
    const noOwner = { tag: "NONE" } as const;
    const baseInput = {
      workItem: active,
      coherence: "COHERENT" as const,
      mutationConflict: false,
      stageInteraction: null,
      proposal: { tag: "NONE" } as const,
      recovery: noneRecovery,
      currentness: current,
      executionOwner: noOwner,
      automaticWorkActive: false,
      ordinaryActionAvailable: false,
    };

    const cases = [
      {
        expected: "CONVERGING" as const,
        input: { ...baseInput, coherence: "CONVERGING" as const },
        marker: "PROCESSING" as const,
      },
      {
        expected: "MUTATION_CONFLICT" as const,
        input: { ...baseInput, mutationConflict: true },
        marker: "ACTION_REQUIRED" as const,
      },
      {
        expected: "REQUIRED_INPUT" as const,
        input: {
          ...baseInput,
          stageInteraction: {
            tag: "REQUIRED_INPUT" as const,
            requestEventId,
          },
        },
        marker: "ACTION_REQUIRED" as const,
      },
      {
        expected: "PROPOSAL_DECISION" as const,
        input: {
          ...baseInput,
          proposal: {
            tag: "PENDING" as const,
            proposalEventId: requestEventId,
          },
        },
        marker: "ACTION_REQUIRED" as const,
      },
      {
        expected: "PROPOSAL_ADOPTION" as const,
        input: {
          ...baseInput,
          proposal: {
            tag: "ADOPTION_IN_PROGRESS" as const,
            proposalEventId: requestEventId,
          },
        },
        marker: "PROCESSING" as const,
      },
      {
        expected: "BLOCKER" as const,
        input: {
          ...baseInput,
          workItem: WorkItemSchema.parse({
            ...active,
            status: "BLOCKED",
          }),
        },
        marker: "BLOCKED" as const,
      },
      {
        expected: "STALE_AUTHORITY" as const,
        input: {
          ...baseInput,
          currentness: { tag: "STALE" as const, owner: "R1" as const },
          recovery: { tag: "RECONCILE_AUTHORITY" as const },
        },
        marker: "STALE" as const,
      },
      {
        expected: "RECOVERY" as const,
        input: {
          ...baseInput,
          recovery: { tag: "RETRY_CURRENT_STAGE" as const },
        },
        marker: "ACTION_REQUIRED" as const,
      },
      {
        expected: "PROCESSING" as const,
        input: {
          ...baseInput,
          stageInteraction: { tag: "PROCESSING" as const },
        },
        marker: "PROCESSING" as const,
      },
      {
        expected: "ACTIONABLE" as const,
        input: { ...baseInput, ordinaryActionAvailable: true },
        marker: "READY" as const,
      },
      {
        expected: "ORDINARY" as const,
        input: baseInput,
        marker: "READY" as const,
      },
    ];

    const reached = deriveReachedStages(active, [], [], [], []);
    for (const item of cases) {
      const attention = deriveCurrentAttention(item.input);
      expect(attention).toBe(item.expected);
      const rail = deriveWorkflowRail(
        item.input.workItem,
        reached,
        attention,
        item.input.recovery,
        item.input.workItem.stage,
      );
      expect(
        rail.find((entry) => entry.stage === item.input.workItem.stage)?.marker,
      ).toBe(item.marker);
    }

    const complete = WorkItemSchema.parse({
      ...active,
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "CANDIDATE_DONE",
    });
    const completeRail = deriveWorkflowRail(
      complete,
      deriveReachedStages(complete, [], [], [], []),
      "ORDINARY",
      noneRecovery,
      "COMPLETE",
    );
    expect(
      completeRail.find((entry) => entry.stage === "COMPLETE")?.marker,
    ).toBe("COMPLETE");

    expect(
      deriveRecoveryDisposition(
        WorkItemSchema.parse({ ...active, status: "BLOCKED" }),
        [],
        current,
      ),
    ).toEqual({ tag: "RESUME_CURRENT_OWNER" });
    expect(deriveRecoveryDisposition(active, [], current)).toEqual({
      tag: "NONE",
    });
    expect(deriveRecoveryDisposition(active, [stageRun("BLOCKED")], current)).toEqual({
      tag: "RETRY_CURRENT_STAGE",
    });
  });

  it("projects coherence, attention, recovery and rail through one canonical owner", () => {
    const active = baseWorkItem();
    const failed = stageRun("FAILED");
    const currentness = normalizeMaterialCurrentness(true, []);
    const recovery = deriveRecoveryDisposition(active, [failed], currentness);
    expect(recovery).toEqual({ tag: "RETRY_CURRENT_STAGE" });

    const attention = deriveCurrentAttention({
      workItem: active,
      coherence: "COHERENT",
      mutationConflict: false,
      stageInteraction: null,
      proposal: { tag: "NONE" },
      recovery,
      currentness,
      executionOwner: { tag: "NONE" },
      automaticWorkActive: false,
      ordinaryActionAvailable: true,
    });
    expect(attention).toBe("RECOVERY");

    const reached = deriveReachedStages(active, [failed], [], [], []);
    const rail = deriveWorkflowRail(active, reached, attention, recovery, "PLAN");
    expect(rail).toHaveLength(9);
    expect(rail.filter((item) => item.reach === "CURRENT")).toHaveLength(1);
    expect(rail.find((item) => item.stage === "R1")?.marker).toBe("ACTION_REQUIRED");
    expect(rail.find((item) => item.stage === "PLAN")?.marker).toBeNull();

    const running = stageRun();
    const completion = RunEventSchema.parse({
      id: `event_${uuidC}`,
      runId: running.id,
      sequence: 1,
      occurredAt: "2026-11-11T03:30:00.000Z",
      event: {
        tag: "STAGE_COMPLETED",
        completion: { stage: "R1", outcome: "CONFIRMED" },
        artifactRefIds: [],
      },
    });
    expect(deriveObservationCoherence(active, [running], [completion], []))
      .toBe("CONVERGING");

    const completedR1 = stageRun("COMPLETED", "R1");
    const settledCompletion = RunEventSchema.parse({
      ...completion,
      runId: completedR1.id,
    });
    expect(
      deriveObservationCoherence(
        active,
        [completedR1],
        [settledCompletion],
        [],
      ),
    ).toBe("COHERENT");

    const idea = WorkItemSchema.parse({
      ...active,
      stage: "IDEA",
      status: "ACTIVE",
      outcome: null,
    });
    expect(deriveObservationCoherence(idea, [running], [], []))
      .toBe("CONVERGING");

    const executionWorkItem = WorkItemSchema.parse({
      ...active,
      stage: "EXECUTION",
      status: "ACTIVE",
      outcome: null,
    });
    const executionTask = baseTask(`task_${uuidA}`, "TODO");
    const executionRun = baseRun();
    expect(
      deriveObservationCoherence(
        executionWorkItem,
        [executionRun],
        [],
        [executionTask],
      ),
    ).toBe("CONVERGING");
    expect(
      deriveObservationCoherence(
        executionWorkItem,
        [executionRun],
        [],
        [{ ...executionTask, state: "RUNNING" }],
      ),
    ).toBe("COHERENT");
    const priorAttempt = baseRun({ id: `run_${uuidC}`, status: "FAILED", terminalClassification: "PROVIDER_FAILURE", endedAt: "2026-11-11T03:30:00.000Z" });
    const retryAttempt = baseRun({ attempt: 2 });
    expect(
      deriveObservationCoherence(
        executionWorkItem,
        [priorAttempt, retryAttempt],
        [],
        [{ ...executionTask, state: "RUNNING" }],
      ),
    ).toBe("COHERENT");
    expect(
      deriveObservationCoherence(
        executionWorkItem,
        [],
        [],
        [{ ...executionTask, state: "RUNNING" }],
      ),
    ).toBe("CONVERGING");
    expect(
      deriveObservationCoherence(
        executionWorkItem,
        [],
        [],
        [{ ...executionTask, state: "BLOCKED" }],
      ),
    ).toBe("CONVERGING");
    expect(
      deriveObservationCoherence(
        WorkItemSchema.parse({
          ...executionWorkItem,
          status: "BLOCKED",
        }),
        [],
        [],
        [executionTask],
      ),
    ).toBe("CONVERGING");

    expect(deriveCurrentAttention({
      workItem: active,
      coherence: "CONVERGING",
      mutationConflict: true,
      stageInteraction: { tag: "REQUIRED_INPUT", requestEventId: completion.id },
      proposal: { tag: "PENDING", proposalEventId: completion.id },
      recovery,
      currentness: { tag: "STALE", owner: "R1" },
      executionOwner: { tag: "NONE" },
      automaticWorkActive: true,
      ordinaryActionAvailable: true,
    })).toBe("CONVERGING");

    const staleCurrentness = normalizeMaterialCurrentness(false, ["PLAN", "R2"]);
    expect(staleCurrentness).toEqual({ tag: "STALE", owner: "R2" });
    const staleRecovery = deriveRecoveryDisposition(active, [], staleCurrentness);
    expect(staleRecovery).toEqual({ tag: "RECONCILE_AUTHORITY" });
    const staleAttention = deriveCurrentAttention({
      workItem: active,
      coherence: "COHERENT",
      mutationConflict: false,
      stageInteraction: null,
      proposal: { tag: "NONE" },
      recovery: staleRecovery,
      currentness: staleCurrentness,
      executionOwner: { tag: "NONE" },
      automaticWorkActive: false,
      ordinaryActionAvailable: true,
    });
    expect(staleAttention).toBe("STALE_AUTHORITY");
    const staleRail = deriveWorkflowRail(
      active,
      reached,
      staleAttention,
      staleRecovery,
      "R1",
    );
    expect(staleRail.find((item) => item.stage === "R1")?.marker).toBe("STALE");
  });
});
