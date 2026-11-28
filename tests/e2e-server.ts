import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join } from "node:path";
import { tmpdir } from "node:os";

import {
  ApprovalSchema,
  ArtifactRefSchema,
  ExecutionTaskIdSchema,
  ExecutionTaskSchema,
  RunEventIdSchema,
  RunEventSchema,
  RunIdSchema,
  RunSchema,
  WorkItemIdSchema,
  WorkItemSchema,
  type RunEventPayload,
  type CandidateReviewEventPayload,
  type CandidateMembers,
  type RunId,
  type StageCompletion,
  type WorkItemId,
} from "../src/core/contracts.ts";
import { canonicalApprovalPackageJson } from "../src/core/canonical.ts";
import { candidateMembershipCanonicalJson } from "../src/core/lifecycle.ts";
import { renderWorkItemSourceMarkdown } from "../src/core/work-item-source.ts";
import { startOrderDaemon } from "../src/daemon/server.ts";
import { createCoordinatorRuntime } from "../src/daemon/runtime.ts";
import {
  currentFileArtifact,
  getWorkItem,
  listExecutionTasks,
  resolveStageContext,
  signOffWorkItem,
  signoffPackageForWorkItem,
  observeCurrentCandidateReview,
  acceptanceObservationCodeForFailure,
  staleAuthorityOwnerForFailure,
} from "../src/daemon/authority.ts";
import {
  appendRunEvent,
  getRun,
  insertRun,
  nextAttempt,
  updateRun,
} from "../src/daemon/run.ts";
import { writeOrderConfig } from "../src/shell/config.ts";
import { captureCandidate, createFreshCheckout, resolveHeadCommit } from "../src/shell/repository.ts";
import {
  createWorkItemSourceFile,
  readWorkItemSource,
} from "../src/shell/work-item-source.ts";
import {
  newApprovalId,
  newArtifactRefId,
  newCandidateReviewEventId,
  newExecutionTaskId,
  newRunEventId,
  newRunId,
  newWorkItemId,
  nowIsoDateTime,
  sha256,
  sha256Text,
  statePaths,
  writeRunEvidenceBytes,
} from "../src/shell/runtime.ts";
import {
  openOrderDatabase,
  storeApproval,
  storeArtifact,
  storeArtifactDependency,
  storeCandidateReviewEvent,
  storeExecutionTask,
  storeRun,
  storeRunEvent,
  storeWorkItem,
  setExecutionTaskState,
  updateWorkItemLifecycle,
  withTransaction,
} from "../src/shell/sqlite.ts";

const requiredEnvironment = (name: string): string => {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new TypeError(`${name} is required for browser certification`);
  }
  return value;
};

const stateRoot = requiredEnvironment("PONTIVUS_ORDER_TEST_STATE_ROOT");
if (!isAbsolute(stateRoot)) {
  throw new TypeError("PONTIVUS_ORDER_TEST_STATE_ROOT must be absolute");
}
requiredEnvironment("PONTIVUS_ORDER_OPENCODE_BIN");

mkdirSync(stateRoot, { recursive: true });
const paths = statePaths(stateRoot);
for (const path of [
  paths.database,
  `${paths.database}-wal`,
  `${paths.database}-shm`,
  paths.daemonToken,
  paths.config,
  paths.evidence,
  paths.workspaces,
]) {
  rmSync(path, { recursive: true, force: true });
}

const repositoryRoot = stateRoot + "-e2e-project";
rmSync(repositoryRoot, { recursive: true, force: true });
mkdirSync(join(repositoryRoot, "docs"), { recursive: true });
mkdirSync(join(repositoryRoot, "src"), { recursive: true });

const workItemsRoot = "docs/order/work-items";
const workItemRoot = join(repositoryRoot, "docs", "order", "work-items");
mkdirSync(workItemRoot, { recursive: true });

const orderConfig = writeOrderConfig(stateRoot, {
  version: 4,
  model: { providerID: "opencode", id: "glm-5.3-flash-free" },
  repositoryRoots: [repositoryRoot],
  referenceRoots: [],
});

const researchText = `# Research

## Current state

The current repository behavior and constraints have been inspected.

## Findings

The change is confirmed and the governing evidence is recorded.

## Evidence

- repository state inspected
- workflow ownership confirmed
`;
const changeResearchText = `# Research

## Current state / absence

The requested change is not currently realized.

## Evidence

Repository evidence proves the current state.

## Governing authority

Canonical product and functional authority define the requested change.

## Affected producer→consumer path

The producing and consuming boundaries are identified.

## Downstream invariants

Existing behavior outside the requested change remains governed.

## Unresolved facts

None.

## Verdict

CONFIRMED
`;
const defectResearchText = `# Research

## Observed symptom / reproduction

The defect is reproducible from the recorded evidence.

## Proven root cause

The producing boundary is proven.

## Producer→carrier→consumer path

The defect propagation path is explicit.

## Downstream effects / invariants

Regression and preservation effects are recorded.

## Governing authority

Expected behavior is grounded in canonical authority.

## Unresolved facts

None.

## Verdict

CONFIRMED
`;
const investigationResearchText = `# Research

## Question

What does the evidence establish?

## Evidence for / against

The material evidence is recorded on both sides.

## Findings

The investigation findings are explicit.

## Unresolved questions

None.

## Conclusion

The investigation can terminate from Research.
`;
const auditResearchText = `# Research

## Target / criteria

The audited target and governing criteria are explicit.

## Evidence by criterion

Evidence is organized against each criterion.

## Findings

Audit findings are recorded.

## Verdict

The audit can terminate from Research.
`;
const changeRequirementsContractText = `# Requirements

## Requested outcome

The requested outcome remains the governing change intent.

## Proven current-state / absence basis

Research proves the existing absence that motivates the change.

## Required observable outcome / delta

The exact required delta is defined.

## Acceptance criteria

The requested outcome must be observably satisfied.

## Scope / exclusions

Only the governed change is in scope.

## Failure / negative behavior

Invalid or incomplete realization must not be accepted.
`;
const defectRequirementsContractText = `# Requirements

## Proven defect / root cause

Requirements remain traceable to the reproduced defect and proven root cause.

## Expected corrected behavior

The original defect must be corrected.

## Behavior that must remain unchanged

Unrelated behavior is a preservation obligation.

## Acceptance proving the original defect

Verification must reproduce and close the original failure.

## Regression / preservation acceptance

Regression and preservation checks are mandatory.

## Scope / exclusions

Only the governed remediation is in scope.
`;

const changeDesignContractText = `# Solution design

## Requested outcome

The design remains traceable to the requested outcome.

## Proven current-state / absence basis

The chosen solution addresses the confirmed current-state absence.

## Solution boundary

Only the governed change is designed.
`;
const defectDesignContractText = `# Solution design

## Proven root cause / producing boundary

The solution is anchored to the proven producing boundary.

## Preservation invariants

Unchanged behavior remains an explicit design constraint.

## Remediation design

The defect is corrected at its owning boundary.
`;
const changePlanContractText = `# Implementation plan

## Requested outcome

The implementation tasks remain traceable to the requested outcome.

## Proven current-state / absence basis

The task set closes the confirmed current-state absence.

## Planned change

Only the governed delta is implemented and verified.
`;
const defectPlanContractText = `# Implementation plan

## Exact remediation

The plan repairs the proven defect at its producing boundary.

## Reproduction verification

The original failure is reproduced and closed.

## Regression verification

The remediation is checked for regression.

## Preservation verification

Behavior required to remain unchanged is explicitly verified.
`;

const requirementsText = `# Requirements

## Purpose / product model

The operator can see where the work is, what requires attention and what action is valid next.

## Work type × workflow step × current interaction

Task purpose, available information, expected output and valid actions are derived from the canonical work type and lifecycle state.

## Information hierarchy

Primary work and current attention outrank supporting context, agent activity, history/evidence and technical detail.

## Pre-signoff interaction

Dialogue, proposal Review, governed Document and Evidence share one current-attention owner.

## Supporting services

Queue, Create, Settings, Context and Evidence remain coherent with the same task model.
`;
const designText = `# Solution design

## 1. Context / governing constraints

The governed Workbench requirements and reviewed reference set define the presentation contract.

## 2. Goals / non-goals

Preserve canonical workflow semantics while implementing the accepted information hierarchy and interaction composition.

## 3. Canonical owner / affected boundaries

Shared Workbench primitives own shell, attention, Dialogue, Document, Review and Evidence composition.

## 4. Data / control flow

Canonical WorkItem, Run, RunEvent and artifact facts are projected directly into the browser without duplicate workflow state.

## 5. Decisions / rationale / alternatives

Current task material remains primary; supporting authority and technical identity stay subordinate.

## 6. Failure behavior

Mutation conflicts, blockers, stale authority and provider failures remain visible in the same stable task geometry.

## 7. Preservation / downstream invariants

Responsive changes preserve the same semantic hierarchy and action ownership.

## 8. Validation obligations

Mechanical gates and direct SVG comparison must both pass before the phase closes.
`;
const planText = `# Implementation plan

## Exact task units and dependencies

Implement the shared Workbench foundation before the pre-signoff workflow surfaces.

## Requirement and authority traceability

Each task maps to the accepted Workbench requirements, solution design and reviewed SVG references.

## Change surface

Modify only canonical presentation owners proven to diverge from the accepted references.

## Deletions, additions and modifications

Remove superseded presentation paths, refine shared primitives and preserve existing semantic contracts.

## Validation sequence

Run typecheck, architecture, unit tests, build, browser behavior and direct SVG comparison.

## Canonical order-tasks block

\`\`\`order-tasks
{"version":1,"tasks":[{"id":"T1","objective":"Prove the browser candidate surface","dependsOn":[],"scope":["src/a.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/a.ts"],"gateIds":[],"authorityRefs":[],"concernIds":[]}]}
\`\`\`
`;
const historicalSelectionPlanText = `# Implementation plan

## Canonical order-tasks block

\`\`\`order-tasks
{"version":1,"tasks":[{"id":"T1","objective":"Completed prerequisite","dependsOn":[],"scope":["src/a.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/a.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":[]},{"id":"T2","objective":"Current implementation task","dependsOn":["T1"],"scope":["src/b.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/b.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":[]}]}
\`\`\`
`;
const r3Text = `# Readiness review

## Verdict

READY_FOR_SIGNOFF

## Findings

No unresolved defect blocks the exact governed package.

## Package judgment

The current package is coherent and ready for Approval.

## Adversarial findings

The review assessed contradictory authority and missing verification evidence.

## Evidence

The exact conformed artifact identifies the reviewed package.
`;
const manifestText = `version = 1
projectId = "order-e2e"

[authority]
p1 = []
p2 = []
p3 = ["docs/authority-p3.md"]
p4 = ["docs/authority-p4.md"]
p5 = []
p6 = ["docs/authority-p6.md"]

[refs]
GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1 = "docs/authority-p3.md"
GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2 = "docs/authority-p3.md"
GW-DOC-WORK-LIFECYCLE-V1 = "docs/authority-p3.md"
GW-DOC-LIFECYCLE-CONTEXT-V1 = "docs/authority-p3.md"
GW-DOC-LIFECYCLE-CONTEXT-V2 = "docs/authority-p3.md"
GW-DOC-SPECIFICATION-STANDARD-V1 = "docs/authority-p3.md"
GW-DOC-SPECIFICATION-STANDARD-V2 = "docs/authority-p3.md"
GW-DOC-VALIDATION-STANDARD-V1 = "docs/authority-p3.md"
GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION = "docs/authority-p3.md"
GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW = "docs/authority-p3.md"
GW-DOC-TECHNICAL-ARCHITECTURE-V1 = "docs/authority-p4.md"
GW-DOC-TECHNICAL-ARCHITECTURE-V2 = "docs/authority-p4.md"
GW-DOC-CANONICAL-CONTRACTS-V1 = "docs/authority-p6.md"
GW-DOC-CANONICAL-CONTRACTS-V2 = "docs/authority-p6.md"

[concerns.browser]
authority = []
paths = ["src/**"]
gates = []
`;

writeFileSync(join(repositoryRoot, "pontivus-order.toml"), manifestText);
writeFileSync(
  join(repositoryRoot, "docs", "authority-p3.md"),
  "# Browser fixture lifecycle/specification authority\n",
);
writeFileSync(
  join(repositoryRoot, "docs", "authority-p4.md"),
  "# Browser fixture technical architecture authority\n",
);
writeFileSync(
  join(repositoryRoot, "docs", "authority-p6.md"),
  "# Browser fixture canonical contracts authority\n",
);
writeFileSync(join(repositoryRoot, "docs", "r1.md"), researchText);
writeFileSync(join(repositoryRoot, "docs", "change-r1.md"), changeResearchText);
writeFileSync(join(repositoryRoot, "docs", "defect-r1.md"), defectResearchText);
writeFileSync(join(repositoryRoot, "docs", "investigation-r1.md"), investigationResearchText);
writeFileSync(join(repositoryRoot, "docs", "audit-r1.md"), auditResearchText);
writeFileSync(join(repositoryRoot, "docs", "r2.md"), requirementsText);
writeFileSync(join(repositoryRoot, "docs", "change-r2.md"), changeRequirementsContractText);
writeFileSync(join(repositoryRoot, "docs", "defect-r2.md"), defectRequirementsContractText);
writeFileSync(join(repositoryRoot, "docs", "change-design.md"), changeDesignContractText);
writeFileSync(join(repositoryRoot, "docs", "defect-design.md"), defectDesignContractText);
writeFileSync(join(repositoryRoot, "docs", "change-plan.md"), changePlanContractText);
writeFileSync(join(repositoryRoot, "docs", "defect-plan.md"), defectPlanContractText);
writeFileSync(join(repositoryRoot, "docs", "design.md"), designText);
writeFileSync(join(repositoryRoot, "docs", "plan.md"), planText);
const nativeAcceptancePlanText = planText.replace('"acceptanceRefs":[]','"acceptanceRefs":["GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW"]');
writeFileSync(join(repositoryRoot, "docs", "native-acceptance-plan.md"), nativeAcceptancePlanText);
writeFileSync(join(repositoryRoot, "docs", "native-acceptance-stale-plan.md"), nativeAcceptancePlanText);
const nativeMixedPlanText=nativeAcceptancePlanText.replace('"concernIds":[]}]}','"concernIds":[]},{"id":"T2","objective":"Verify existing behavior needs no change","dependsOn":[],"scope":["src/b.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/b.ts"],"gateIds":[],"authorityRefs":[],"concernIds":[]}]}');
writeFileSync(join(repositoryRoot,"docs","native-acceptance-mixed-plan.md"),nativeMixedPlanText);
writeFileSync(
  join(repositoryRoot, "docs", "historical-selection-plan.md"),
  historicalSelectionPlanText,
);
writeFileSync(join(repositoryRoot, "docs", "stale-approval-plan.md"), planText);
writeFileSync(join(repositoryRoot, "docs", "long-wide-plan.md"), planText);
writeFileSync(join(repositoryRoot, "docs", "long-narrow-plan.md"), planText);
writeFileSync(join(repositoryRoot, "docs", "r3.md"), r3Text);
writeFileSync(
  join(repositoryRoot, "docs", "invalid-lifecycle.md"),
  "invalid lifecycle\r\nbytes\r\n",
);
writeFileSync(join(repositoryRoot, "src", "a.ts"), "export const a = 1;\n");

const git = (...args: readonly string[]): string => {
  const result = Bun.spawnSync(["git", ...args], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) {
    throw new TypeError(
      `git ${args[0] ?? ""} failed: ${new TextDecoder().decode(result.stderr).trim()}`,
    );
  }
  return new TextDecoder().decode(result.stdout).trim();
};

git("init", "-q");
git("config", "user.name", "Order browser certification");
git("config", "user.email", "order-e2e@example.invalid");
git("add", ".");
git("commit", "-q", "-m", "browser fixture");
let baselineCommit = await resolveHeadCommit(repositoryRoot);

const build = Bun.spawnSync(
  ["node", "node_modules/vite/bin/vite.js", "build"],
  {
    cwd: process.cwd(),
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  },
);
if (build.exitCode !== 0) {
  throw new TypeError("Vite build failed before browser daemon startup");
}

const database = openOrderDatabase(stateRoot);
const stamp = nowIsoDateTime();
const encoder = new TextEncoder();
const requirementsSha = sha256(
  new Uint8Array(readFileSync(join(repositoryRoot, "docs", "r2.md"))),
);
const designSha = sha256(
  new Uint8Array(readFileSync(join(repositoryRoot, "docs", "design.md"))),
);
const planSha = sha256(new Uint8Array(readFileSync(join(repositoryRoot, "docs", "plan.md"))));
const historicalSelectionPlanSha = sha256(
  new Uint8Array(
    readFileSync(join(repositoryRoot, "docs", "historical-selection-plan.md")),
  ),
);
const r3Sha = sha256(new Uint8Array(readFileSync(join(repositoryRoot, "docs", "r3.md"))));

const workItem = (
  title: string,
  stage:
    | "IDEA"
    | "R1"
    | "R2"
    | "DESIGN"
    | "PLAN"
    | "R3"
    | "AWAITING_SIGNOFF"
    | "EXECUTION"
    | "COMPLETE",
  status: "ACTIVE" | "BLOCKED" | "COMPLETE",
  outcome:
    | "CANDIDATE_DONE"
    | "INVESTIGATION_COMPLETE"
    | "AUDIT_COMPLETE"
    | "DISPROVEN"
    | "DUPLICATE"
    | "ALREADY_SATISFIED"
    | null,
  schemaId: "change-v1" | "defect-v1" | "investigation-v1" | "audit-v1" = "change-v1",
) => {
  const id = newWorkItemId();
  const markdown = renderWorkItemSourceMarkdown(
    {
      formatVersion: 1,
      id,
      projectId: "order-e2e",
      concernIds: [],
      schemaId,
    },
    title,
  );
  const created = createWorkItemSourceFile(
    repositoryRoot,
    workItemsRoot,
    id,
    markdown,
  );
  const source = readWorkItemSource(repositoryRoot, created.path);
  return WorkItemSchema.parse({
    id,
    projectId: "order-e2e",
    repositoryRoot,
    title: source.title,
    origin: "DISCOVERED",
    schemaId: source.metadata.schemaId,
    sourcePath: source.path,
    sourceSha256: source.sha256,
    derivedFromWorkItemId: null,
    stage,
    status,
    outcome,
    concernIds: source.metadata.concernIds,
    createdAt: stamp,
  });
};

const storePlanArtifacts = (
  workItemId: WorkItemId,
  planRepositoryPath = "docs/plan.md",
  planDigest = planSha,
) => {
  const plan = ArtifactRefSchema.parse({
    id: newArtifactRefId(),
    workItemId,
    repositoryPath: planRepositoryPath,
    role: "PLAN",
    authorityLayer: "P7",
    sha256: planDigest,
    gitCommit: baselineCommit,
  });
  const r3 = ArtifactRefSchema.parse({
    id: newArtifactRefId(),
    workItemId,
    repositoryPath: "docs/r3.md",
    role: "R3",
    authorityLayer: "P7",
    sha256: r3Sha,
    gitCommit: baselineCommit,
  });
  storeArtifact(database, plan);
  storeArtifact(database, r3);
  storeArtifactDependency(database, r3.id, plan.id);
  return { plan, r3 };
};

const workTypeItems = [
  workItem("Change work type", "IDEA", "ACTIVE", null, "change-v1"),
  workItem("Defect work type", "IDEA", "ACTIVE", null, "defect-v1"),
  workItem("Investigation work type", "IDEA", "ACTIVE", null, "investigation-v1"),
  workItem("Audit work type", "IDEA", "ACTIVE", null, "audit-v1"),
] as const;
for (const item of workTypeItems) storeWorkItem(database, item);

const startResearchItem = workItem("Work request start success", "IDEA", "ACTIVE", null);
storeWorkItem(database, startResearchItem);

const proposalItem = workItem("Proposal review", "PLAN", "ACTIVE", null);
storeWorkItem(database, proposalItem);
const proposalArtifacts = storePlanArtifacts(proposalItem.id);
const historicalProposalRun = RunSchema.parse({
  id: newRunId(),
  workItemId: proposalItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "COMPLETED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("historical-proposal-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, historicalProposalRun);

const proposalRun = RunSchema.parse({
  id: newRunId(),
  workItemId: proposalItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "RUNNING",
  attempt: 2,
  baselineCommit,
  contextHash: sha256Text("proposal-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});

const persistEvent = (
  runId: RunId,
  sequence: number,
  event: RunEventPayload,
) => {
  const value = RunEventSchema.parse({
    id: newRunEventId(),
    runId,
    sequence,
    occurredAt: stamp,
    event,
  });
  storeRunEvent(database, value);
  return value;
};

persistEvent(historicalProposalRun.id, 1, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: historicalProposalRun.contextHash,
});
const historicalProposal = persistEvent(historicalProposalRun.id, 2, {
  tag: "ARTIFACT_PROPOSAL_CREATED",
  targetPath: "docs/plan.md",
  baseSha256: planSha,
  role: "PLAN",
  authorityLayer: "P7",
  unifiedDiff:
    "--- a/docs/plan.md\n+++ b/docs/plan.md\n@@ -1 +1 @@\n-# Browser certification plan\n+# Browser certification plan adopted\n",
  rationale: "Exercise the completed proposal lifecycle.",
});
persistEvent(historicalProposalRun.id, 3, {
  tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
  proposalEventId: historicalProposal.id,
});
persistEvent(historicalProposalRun.id, 4, {
  tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
  proposalEventId: historicalProposal.id,
  disposition: "ADOPTED",
  adoptedArtifactRefId: proposalArtifacts.plan.id,
});

const proposalPath = `${workItemsRoot}/${proposalItem.id}/implementation-plan.md`;
let proposalEventId: string | null = null;
const rejectionItem = workItem("Proposal rejection review", "PLAN", "ACTIVE", null);
storeWorkItem(database, rejectionItem);
const rejectionRun = RunSchema.parse({
  id: newRunId(),
  workItemId: rejectionItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "RUNNING",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("proposal-rejection-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
const adoptionPendingItem = workItem(
  "Proposal adoption in progress",
  "PLAN",
  "ACTIVE",
  null,
);
storeWorkItem(database, adoptionPendingItem);
storePlanArtifacts(adoptionPendingItem.id);
const adoptionPendingRun = RunSchema.parse({
  id: newRunId(),
  workItemId: adoptionPendingItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "WAITING_FOR_INPUT",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("proposal-adoption-pending-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});

const retryItem = workItem("Workflow retry action", "PLAN", "ACTIVE", null);
storeWorkItem(database, retryItem);
const retryRun = RunSchema.parse({
  id: newRunId(),
  workItemId: retryItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "FAILED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("retry-action-context"),
  providerSessionId: null,
  terminalClassification: "PROVIDER_FAILURE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, retryRun);
persistEvent(retryRun.id, 1, {
  tag: "PROVIDER_FAILED",
  detail: "Synthetic provider failure for browser retry certification.",
  evidence: [],
});

const seedRuntime = createCoordinatorRuntime(database, stateRoot, process.env, orderConfig);

for (const [title, schemaId, path] of [
  ["Change research contract", "change-v1", "docs/change-r1.md"],
  ["Defect research contract", "defect-v1", "docs/defect-r1.md"],
  ["Investigation research contract", "investigation-v1", "docs/investigation-r1.md"],
  ["Audit research contract", "audit-v1", "docs/audit-r1.md"],
] as const) {
  const item = workItem(title, "R1", "ACTIVE", null, schemaId);
  storeWorkItem(database, item);
  await currentFileArtifact(seedRuntime, item, path, "R1", "P1");
}

for (const [title, schemaId, path] of [
  ["Change requirements contract", "change-v1", "docs/change-r2.md"],
  ["Defect requirements contract", "defect-v1", "docs/defect-r2.md"],
] as const) {
  const item = workItem(title, "R2", "ACTIVE", null, schemaId);
  storeWorkItem(database, item);
  await currentFileArtifact(seedRuntime, item, path, "R2", "P3");
}

for (const [title, schemaId, path] of [
  ["Change solution design contract", "change-v1", "docs/change-design.md"],
  ["Defect solution design contract", "defect-v1", "docs/defect-design.md"],
] as const) {
  const item = workItem(title, "DESIGN", "ACTIVE", null, schemaId);
  storeWorkItem(database, item);
  await currentFileArtifact(seedRuntime, item, path, "DESIGN", "P6");
}

for (const [title, schemaId, path] of [
  ["Change implementation plan contract", "change-v1", "docs/change-plan.md"],
  ["Defect implementation plan contract", "defect-v1", "docs/defect-plan.md"],
] as const) {
  const item = workItem(title, "PLAN", "ACTIVE", null, schemaId);
  storeWorkItem(database, item);
  await currentFileArtifact(seedRuntime, item, path, "PLAN", "P7");
}

const seedConformance = async (
  item: ReturnType<typeof workItem>,
  stage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
  output: Awaited<ReturnType<typeof currentFileArtifact>>,
  completion: StageCompletion,
): Promise<void> => {
  const context = await resolveStageContext(seedRuntime, item, stage);
  const run = insertRun(seedRuntime, RunSchema.parse({
    id: newRunId(),
    workItemId: item.id,
    executionTaskId: null,
    stage,
    mode: "INTERACTIVE",
    role: "STAGE",
    triggerEventId: null,
    status: "COMPLETED",
    attempt: nextAttempt(seedRuntime, item.id, stage, null),
    baselineCommit,
    contextHash: context.contextHash,
    providerSessionId: null,
    terminalClassification: null,
    startedAt: stamp,
    endedAt: stamp,
  }));
  withTransaction(database, () => {
    appendRunEvent(seedRuntime, run.id, {
      tag: "STAGE_STARTED",
      stage,
      mode: "INTERACTIVE",
      contextHash: context.contextHash,
    });
    for (const dependency of context.artifacts) {
      if (dependency.id !== output.id) {
        storeArtifactDependency(database, output.id, dependency.id);
      }
    }
    appendRunEvent(seedRuntime, run.id, {
      tag: "STAGE_COMPLETED",
      completion,
      artifactRefIds: [output.id],
    });
    appendRunEvent(seedRuntime, run.id, {
      tag: "CONFORMANCE_PASSED",
      stage,
      outputArtifactRefIds: [output.id],
      contextHash: context.contextHash,
      evidence: [],
    });
  });
};

const seedLifecycle = async (
  item: ReturnType<typeof workItem>,
  planPath:
    | "docs/plan.md"
    | "docs/stale-approval-plan.md"
    | "docs/native-acceptance-plan.md"
    | "docs/native-acceptance-stale-plan.md"
    | "docs/native-acceptance-mixed-plan.md"
    | "docs/long-wide-plan.md"
    | "docs/long-narrow-plan.md" = "docs/plan.md",
) => {
  const outputs = {
    R1: await currentFileArtifact(seedRuntime, item, "docs/r1.md", "R1", "P1"),
    R2: await currentFileArtifact(seedRuntime, item, "docs/r2.md", "R2", "P3"),
    DESIGN: await currentFileArtifact(seedRuntime, item, "docs/design.md", "DESIGN", "P6"),
    PLAN: await currentFileArtifact(seedRuntime, item, planPath, "PLAN", "P7"),
    R3: await currentFileArtifact(seedRuntime, item, "docs/r3.md", "R3", "P7"),
  };
  await seedConformance(
    item,
    "R1",
    outputs.R1,
    { stage: "R1", outcome: "CONFIRMED" },
  );
  await seedConformance(
    item,
    "R2",
    outputs.R2,
    { stage: "R2", outcome: "ACCEPTED" },
  );
  await seedConformance(
    item,
    "DESIGN",
    outputs.DESIGN,
    { stage: "DESIGN", outcome: "ACCEPTED" },
  );
  await seedConformance(
    item,
    "PLAN",
    outputs.PLAN,
    { stage: "PLAN", outcome: "ACCEPTED" },
  );
  await seedConformance(
    item,
    "R3",
    outputs.R3,
    { stage: "R3", outcome: "READY_FOR_SIGNOFF" },
  );
  return outputs;
};

const progressionStages = [
  {
    stage: "R1",
    path: "docs/r1.md",
    role: "R1",
    layer: "P1",
    completion: { stage: "R1", outcome: "CONFIRMED" },
  },
  {
    stage: "R2",
    path: "docs/r2.md",
    role: "R2",
    layer: "P3",
    completion: { stage: "R2", outcome: "ACCEPTED" },
  },
  {
    stage: "DESIGN",
    path: "docs/design.md",
    role: "DESIGN",
    layer: "P6",
    completion: { stage: "DESIGN", outcome: "ACCEPTED" },
  },
  {
    stage: "PLAN",
    path: "docs/plan.md",
    role: "PLAN",
    layer: "P7",
    completion: { stage: "PLAN", outcome: "ACCEPTED" },
  },
] as const satisfies readonly Readonly<{
  stage: "R1" | "R2" | "DESIGN" | "PLAN";
  path: string;
  role: "R1" | "R2" | "DESIGN" | "PLAN";
  layer: "P1" | "P3" | "P6" | "P7";
  completion: StageCompletion;
}>[];

const seedProgressionReadyItem = async (
  title: string,
  currentStage: "R2" | "DESIGN" | "PLAN" | "R3",
) => {
  const item = workItem(title, currentStage, "ACTIVE", null);
  storeWorkItem(database, item);
  const currentIndex = ["R2", "DESIGN", "PLAN", "R3"].indexOf(currentStage);
  for (let index = 0; index <= currentIndex; index += 1) {
    const definition = progressionStages[index];
    if (!definition) break;
    const output = await currentFileArtifact(
      seedRuntime,
      item,
      definition.path,
      definition.role,
      definition.layer,
    );
    await seedConformance(
      item,
      definition.stage,
      output,
      definition.completion,
    );
  }
  return item;
};

const seedCurrentStageDocumentItem = async (
  title: string,
  currentStage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
) => {
  const item = workItem(title, currentStage, "ACTIVE", null);
  storeWorkItem(database, item);
  const definitions = [
    { stage: "R1", path: "docs/r1.md", role: "R1", layer: "P1" },
    { stage: "R2", path: "docs/r2.md", role: "R2", layer: "P3" },
    { stage: "DESIGN", path: "docs/design.md", role: "DESIGN", layer: "P6" },
    { stage: "PLAN", path: "docs/plan.md", role: "PLAN", layer: "P7" },
    { stage: "R3", path: "docs/r3.md", role: "R3", layer: "P7" },
  ] as const;
  const currentIndex = definitions.findIndex((definition) => definition.stage === currentStage);
  for (let index = 0; index < currentIndex; index += 1) {
    const definition = definitions[index]!;
    const upstream = await currentFileArtifact(
      seedRuntime,
      item,
      definition.path,
      definition.role,
      definition.layer,
    );
    const completion =
      definition.stage === "R1"
        ? { stage: "R1", outcome: "CONFIRMED" } as const
        : definition.stage === "R2"
          ? { stage: "R2", outcome: "ACCEPTED" } as const
          : definition.stage === "DESIGN"
            ? { stage: "DESIGN", outcome: "ACCEPTED" } as const
            : { stage: "PLAN", outcome: "ACCEPTED" } as const;
    await seedConformance(item, definition.stage, upstream, completion);
  }
  const current = definitions[currentIndex]!;
  // Own-stage material is a draft, not an admitted promotion. Upstream
  // stages above are the only conformed lifecycle inputs for this fixture.
  await currentFileArtifact(
    seedRuntime,
    item,
    current.path,
    current.role,
    current.layer,
  );
  return item;
};

const seedReadinessOutcomeItem = async (
  title: string,
  currentStage: "R1" | "R2" | "DESIGN" | "PLAN",
  outcome:
    | "RETURN_TO_RESEARCH"
    | "RETURN_TO_REQUIREMENTS"
    | "RETURN_TO_DESIGN"
    | "RETURN_TO_PLAN",
): Promise<void> => {
  const item = workItem(title, currentStage, "ACTIVE", null);
  storeWorkItem(database, item);
  const output = await currentFileArtifact(
    seedRuntime,
    item,
    "docs/r3.md",
    "R3",
    "P7",
  );
  const contextHash = sha256Text("readiness-outcome-" + title);
  const run = RunSchema.parse({
    id: newRunId(),
    workItemId: item.id,
    executionTaskId: null,
    stage: "R3",
    mode: "INTERACTIVE",
    role: "STAGE",
    triggerEventId: null,
    status: "COMPLETED",
    attempt: 1,
    baselineCommit,
    contextHash,
    providerSessionId: null,
    terminalClassification: null,
    startedAt: stamp,
    endedAt: stamp,
  });
  storeRun(database, run);
  appendRunEvent(seedRuntime, run.id, {
    tag: "STAGE_STARTED",
    stage: "R3",
    mode: "INTERACTIVE",
    contextHash,
  });
  appendRunEvent(seedRuntime, run.id, {
    tag: "STAGE_COMPLETED",
    completion: { stage: "R3", outcome },
    artifactRefIds: [output.id],
  });
  appendRunEvent(seedRuntime, run.id, {
    tag: "CONFORMANCE_PASSED",
    stage: "R3",
    outputArtifactRefIds: [output.id],
    contextHash,
    evidence: [],
  });
};

const seedBlockedReadinessItem = async (
  title = "Readiness blocked",
  priorReady = false,
): Promise<void> => {
  const item = workItem(title, "R3", "ACTIVE", null);
  storeWorkItem(database, item);
  const output = await currentFileArtifact(
    seedRuntime,
    item,
    "docs/r3.md",
    "R3",
    "P7",
  );
  if (priorReady) {
    const priorContextHash = sha256Text("readiness-prior-ready-" + title);
    const prior = RunSchema.parse({
      id: newRunId(),
      workItemId: item.id,
      executionTaskId: null,
      stage: "R3",
      mode: "INTERACTIVE",
      role: "STAGE",
      triggerEventId: null,
      status: "COMPLETED",
      attempt: 1,
      baselineCommit,
      contextHash: priorContextHash,
      providerSessionId: null,
      terminalClassification: null,
      startedAt: stamp,
      endedAt: stamp,
    });
    storeRun(database, prior);
    appendRunEvent(seedRuntime, prior.id, {
      tag: "STAGE_STARTED",
      stage: "R3",
      mode: "INTERACTIVE",
      contextHash: priorContextHash,
    });
    appendRunEvent(seedRuntime, prior.id, {
      tag: "STAGE_COMPLETED",
      completion: { stage: "R3", outcome: "READY_FOR_SIGNOFF" },
      artifactRefIds: [output.id],
    });
    appendRunEvent(seedRuntime, prior.id, {
      tag: "CONFORMANCE_PASSED",
      stage: "R3",
      outputArtifactRefIds: [output.id],
      contextHash: priorContextHash,
      evidence: [],
    });
  }

  const contextHash = sha256Text("readiness-blocked-" + title);
  const run = RunSchema.parse({
    id: newRunId(),
    workItemId: item.id,
    executionTaskId: null,
    stage: "R3",
    mode: "INTERACTIVE",
    role: "STAGE",
    triggerEventId: null,
    status: "BLOCKED",
    attempt: priorReady ? 2 : 1,
    baselineCommit,
    contextHash,
    providerSessionId: null,
    terminalClassification: "TEST_FAILURE",
    startedAt: stamp,
    endedAt: stamp,
  });
  storeRun(database, run);
  appendRunEvent(seedRuntime, run.id, {
    tag: "STAGE_STARTED",
    stage: "R3",
    mode: "INTERACTIVE",
    contextHash,
  });
  appendRunEvent(seedRuntime, run.id, {
    tag: "STAGE_COMPLETED",
    completion: { stage: "R3", outcome: "READY_FOR_SIGNOFF" },
    artifactRefIds: [output.id],
  });
  appendRunEvent(seedRuntime, run.id, {
    tag: "STAGE_BLOCKED",
    reason: "Readiness review is blocked by a canonical finding.",
    owningStage: "R3",
  });
};

await seedReadinessOutcomeItem(
  "Readiness returned to Research",
  "R1",
  "RETURN_TO_RESEARCH",
);
await seedReadinessOutcomeItem(
  "Readiness returned to Requirements",
  "R2",
  "RETURN_TO_REQUIREMENTS",
);
await seedReadinessOutcomeItem(
  "Readiness returned to Design",
  "DESIGN",
  "RETURN_TO_DESIGN",
);
await seedReadinessOutcomeItem(
  "Readiness returned to Plan",
  "PLAN",
  "RETURN_TO_PLAN",
);
await seedBlockedReadinessItem();
await seedBlockedReadinessItem("Readiness blocked after prior ready", true);

await seedProgressionReadyItem(
  "Requirements ready after Research",
  "R2",
);
await seedProgressionReadyItem(
  "Solution design ready after Requirements",
  "DESIGN",
);
await seedProgressionReadyItem(
  "Implementation plan ready after Design",
  "PLAN",
);
await seedProgressionReadyItem(
  "Readiness ready after Plan",
  "R3",
);
await seedCurrentStageDocumentItem("Requirements document visual", "R2");
await seedCurrentStageDocumentItem("Solution design document visual", "DESIGN");
await seedCurrentStageDocumentItem("Implementation plan document visual", "PLAN");
await seedCurrentStageDocumentItem("Implementation plan safety visual", "PLAN");
await seedCurrentStageDocumentItem("Readiness review document visual", "R3");

const readinessInputItem = await seedProgressionReadyItem(
  "Readiness input required",
  "R3",
);
const readinessInputRun = RunSchema.parse({
  id: newRunId(),
  workItemId: readinessInputItem.id,
  executionTaskId: null,
  stage: "R3",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "WAITING_FOR_INPUT",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("readiness-input-required-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
storeRun(database, readinessInputRun);
persistEvent(readinessInputRun.id, 1, {
  tag: "STAGE_STARTED",
  stage: "R3",
  mode: "INTERACTIVE",
  contextHash: readinessInputRun.contextHash,
});
persistEvent(readinessInputRun.id, 2, {
  tag: "HUMAN_INPUT_REQUESTED",
  category: "INFORMATION",
  question: "Which readiness finding should be resolved before approval?",
});

const feedbackItem = workItem(
  "Workflow failure feedback",
  "PLAN",
  "ACTIVE",
  null,
);
storeWorkItem(database, feedbackItem);
const feedbackPlan = await currentFileArtifact(
  seedRuntime,
  feedbackItem,
  "docs/plan.md",
  "PLAN",
  "P7",
);
const feedbackPriorPlan = ArtifactRefSchema.parse({
  id: newArtifactRefId(),
  workItemId: feedbackItem.id,
  repositoryPath: "docs/plan.md",
  role: "PLAN",
  authorityLayer: "P7",
  sha256: sha256Text("prior feedback plan"),
  gitCommit: baselineCommit,
});
storeArtifact(database, feedbackPriorPlan);

const feedbackRun = (
  attempt: number,
  status: "CANCELLED" | "FAILED" | "BLOCKED",
  terminalClassification:
    | "COORDINATOR_INTERRUPTED"
    | "ENVIRONMENT_BLOCKED"
    | "PROVIDER_FAILURE"
    | "TEST_FAILURE",
) => {
  const run = RunSchema.parse({
    id: newRunId(),
    workItemId: feedbackItem.id,
    executionTaskId: null,
    stage: "PLAN",
    mode: "INTERACTIVE",
    role: "STAGE",
    triggerEventId: null,
    status,
    attempt,
    baselineCommit,
    contextHash: sha256Text("feedback-context-" + attempt),
    providerSessionId: null,
    terminalClassification,
    startedAt: stamp,
    endedAt: stamp,
  });
  storeRun(database, run);
  return run;
};

const cancelledFeedbackRun = feedbackRun(
  1,
  "CANCELLED",
  "COORDINATOR_INTERRUPTED",
);
persistEvent(cancelledFeedbackRun.id, 1, {
  tag: "OBSERVATION_RECORDED",
  title: "Attempt cancelled",
  detail: "The operator cancelled the superseded attempt.",
  evidence: [],
});

const setupFeedbackRun = feedbackRun(
  2,
  "FAILED",
  "ENVIRONMENT_BLOCKED",
);
const setupDiagnostics = {
  relativePath: "provider-diagnostics.json",
  sha256: writeRunEvidenceBytes(
    stateRoot,
    setupFeedbackRun.id,
    "provider-diagnostics.json",
    encoder.encode('{"failure":"agent setup"}\n'),
  ),
  mediaType: "application/json",
};
persistEvent(setupFeedbackRun.id, 1, {
  tag: "PROVIDER_DIAGNOSTICS_RECORDED",
  evidence: [setupDiagnostics],
});
persistEvent(setupFeedbackRun.id, 2, {
  tag: "PRODUCTIVE_INVOCATION_FAILED",
  classification: "ENVIRONMENT_BLOCKED",
  detail: "The productive workspace could not be admitted.",
  evidence: [setupDiagnostics],
});

const providerFeedbackRun = feedbackRun(
  3,
  "FAILED",
  "PROVIDER_FAILURE",
);
persistEvent(providerFeedbackRun.id, 1, {
  tag: "PROVIDER_FAILED",
  detail: "The configured provider failed during execution.",
  evidence: [],
});
persistEvent(providerFeedbackRun.id, 2, {
  tag: "AUTHORITY_CHANGED",
  priorArtifactRefId: feedbackPriorPlan.id,
  newArtifactRefId: feedbackPlan.id,
});
persistEvent(providerFeedbackRun.id, 3, {
  tag: "REPOSITORY_DRIFTED",
  expectedCommit: baselineCommit,
  actualCommit: "b".repeat(40),
});

const blockedFeedbackRun = feedbackRun(
  4,
  "BLOCKED",
  "TEST_FAILURE",
);
persistEvent(blockedFeedbackRun.id, 1, {
  tag: "STAGE_BLOCKED",
  reason: "The current plan cannot proceed.",
  owningStage: "PLAN",
});
persistEvent(blockedFeedbackRun.id, 2, {
  tag: "CONFORMANCE_FAILED",
  stage: "PLAN",
  defectiveLayer: "P7",
  summary: "The current plan failed conformance.",
  evidence: [],
});

const latestFeedbackRun = feedbackRun(
  5,
  "CANCELLED",
  "COORDINATOR_INTERRUPTED",
);
persistEvent(latestFeedbackRun.id, 1, {
  tag: "OBSERVATION_RECORDED",
  title: "Latest attempt cancelled",
  detail: "The latest attempt is terminal and does not demand current recovery.",
  evidence: [],
});

const resumeItem = workItem(
  "Workflow resume action",
  "PLAN",
  "BLOCKED",
  null,
);
storeWorkItem(database, resumeItem);
const resumeRun = RunSchema.parse({
  id: newRunId(),
  workItemId: resumeItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "BLOCKED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("resume-action-context"),
  providerSessionId: null,
  terminalClassification: "TEST_FAILURE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, resumeRun);
persistEvent(resumeRun.id, 1, {
  tag: "STAGE_BLOCKED",
  reason: "Synthetic blocker for browser Resume certification.",
  owningStage: "PLAN",
});

const processingAttentionItem = workItem(
  "Research processing attention visual",
  "IDEA",
  "ACTIVE",
  null,
);
storeWorkItem(database, processingAttentionItem);
const processingDialogueItem = workItem(
  "Research processing dialogue visual",
  "IDEA",
  "ACTIVE",
  null,
);
storeWorkItem(database, processingDialogueItem);

const openContinuationItem = workItem(
  "Research open continuation",
  "R1",
  "ACTIVE",
  null,
);
storeWorkItem(database, openContinuationItem);
await currentFileArtifact(
  seedRuntime,
  openContinuationItem,
  "docs/r1.md",
  "R1",
  "P1",
);
const openContinuationRun = RunSchema.parse({
  id: newRunId(),
  workItemId: openContinuationItem.id,
  executionTaskId: null,
  stage: "R1",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "RUNNING",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("open-continuation-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
const waitingInputItem = workItem(
  "Workflow input required",
  "PLAN",
  "ACTIVE",
  null,
);
storeWorkItem(database, waitingInputItem);
const waitingInputRun = RunSchema.parse({
  id: newRunId(),
  workItemId: waitingInputItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "WAITING_FOR_INPUT",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("waiting-input-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
storeRun(database, waitingInputRun);
persistEvent(waitingInputRun.id, 1, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: waitingInputRun.contextHash,
});
persistEvent(waitingInputRun.id, 2, {
  tag: "HUMAN_INPUT_REQUESTED",
  category: "INFORMATION",
  question: "Which constraint should the plan prioritize?",
});

const signoffItem = workItem("Awaiting sign-off", "AWAITING_SIGNOFF", "ACTIVE", null);
storeWorkItem(database, signoffItem);
const signoffOutputs = await seedLifecycle(signoffItem);

const staleApprovalItem = workItem(
  "Stale approval recovery",
  "AWAITING_SIGNOFF",
  "ACTIVE",
  null,
);
storeWorkItem(database, staleApprovalItem);
await seedLifecycle(
  staleApprovalItem,
  "docs/stale-approval-plan.md",
);

const staleInspectionItem = workItem(
  "Stale approval inspection matrix",
  "AWAITING_SIGNOFF",
  "ACTIVE",
  null,
);
storeWorkItem(database, staleInspectionItem);
await seedLifecycle(
  staleInspectionItem,
  "docs/stale-approval-plan.md",
);

const sourceEditorItem = workItem(
  "Source editing workbench",
  "AWAITING_SIGNOFF",
  "ACTIVE",
  null,
);
storeWorkItem(database, sourceEditorItem);
await seedLifecycle(sourceEditorItem);

const lifecycleEditorItem = workItem(
  "Lifecycle editing workbench",
  "AWAITING_SIGNOFF",
  "ACTIVE",
  null,
);
storeWorkItem(database, lifecycleEditorItem);
await seedLifecycle(lifecycleEditorItem);

for (const [title, planPath] of [
  ["Long source editing workbench wide", "docs/plan.md"],
  ["Long source editing workbench narrow", "docs/plan.md"],
  ["Long lifecycle editing workbench wide", "docs/long-wide-plan.md"],
  ["Long lifecycle editing workbench narrow", "docs/long-narrow-plan.md"],
] as const) {
  const item = workItem(title, "AWAITING_SIGNOFF", "ACTIVE", null);
  storeWorkItem(database, item);
  await seedLifecycle(item, planPath);
}

const nativeAcceptanceItem=workItem("Native Acceptance review","AWAITING_SIGNOFF","ACTIVE",null);
storeWorkItem(database,nativeAcceptanceItem);
await seedLifecycle(nativeAcceptanceItem,"docs/native-acceptance-plan.md");

// Additional exact signed fixtures are needed only by the rendered Acceptance
// matrix. Each fault affects a separate real WorkItem/Approval or evidence owner.
const nativeFaultSpecs = [
  ["SOURCE_AUTHORITY_STALE","Native Acceptance source drift","docs/native-acceptance-plan.md"],
  ["STALE_AUTHORITY","Native Acceptance material drift","docs/native-acceptance-stale-plan.md"],
  ["CANDIDATE_PROOF_UNAVAILABLE","Native Acceptance missing proof","docs/native-acceptance-plan.md"],
] as const;
type NativeFault = typeof nativeFaultSpecs[number][0];
const nativeFaultItems: {fault:NativeFault;item:ReturnType<typeof workItem>}[]=[];
const nativeRendered = process.env.PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR !== undefined &&
  (process.env.PONTIVUS_ORDER_SIGNED_RENDERED_PHASE === undefined ||
   ["IA38","IA39"].includes(process.env.PONTIVUS_ORDER_SIGNED_RENDERED_PHASE));
if(nativeRendered){
  for(const [fault,title,planPath] of nativeFaultSpecs){
    const item=workItem(title,"AWAITING_SIGNOFF","ACTIVE",null);
    storeWorkItem(database,item);
    await seedLifecycle(item,planPath);
    nativeFaultItems.push({fault,item});
  }
}
const nativeHistoryItems=new Map<string,ReturnType<typeof workItem>>();
if(nativeRendered){
  for(const [kind,title] of [
    ["queued","Native Acceptance queued correction"],
    ["running","Native Acceptance running correction"],
    ["blocked","Native Acceptance blocked correction"],
    ["retest","Native Acceptance retest history"],
    ["mixed","Native Acceptance mixed candidate"],
    ["copy","Native Acceptance test copy"],
    ["loading","Native Acceptance pending observation"],
  ] as const){
    const item=workItem(title,"AWAITING_SIGNOFF","ACTIVE",null);
    storeWorkItem(database,item);
    await seedLifecycle(item,kind==="mixed"?"docs/native-acceptance-mixed-plan.md":"docs/native-acceptance-plan.md");
    nativeHistoryItems.set(kind,item);
  }
}
git("add", "--", workItemsRoot);
git("commit", "-q", "-m", "browser WorkItem sources");
baselineCommit = await resolveHeadCommit(repositoryRoot);

const seedNativeCandidate = async (item:ReturnType<typeof workItem>)=>{
  const nativePackage=await signoffPackageForWorkItem(seedRuntime,item.id);
  const nativeApproval=await signOffWorkItem(seedRuntime,item.id,nativePackage.packageHash,"browser-signoff");
  const nativeTasks=await listExecutionTasks(seedRuntime,item.id);
  if(nativeTasks.length<1||nativeTasks.length>2)throw new TypeError("Native Acceptance fixture requires one or two signed tasks");
  const nativeTask=nativeTasks.find(task=>task.planTaskId==="T1")!;
  if(nativeTask===undefined)throw new TypeError("Native Acceptance candidate task missing");
  const noOpTask=nativeTasks.find(task=>task.planTaskId==="T2");
  const nativeBuilder=RunSchema.parse({
    id:newRunId(),workItemId:item.id,executionTaskId:nativeTask.id,stage:"EXECUTION",
    mode:"UNATTENDED",role:"BUILDER",triggerEventId:null,status:"COMPLETED",attempt:1,
    baselineCommit:nativeApproval.baselineCommit,contextHash:sha256Text("native-acceptance-builder"),
    providerSessionId:null,terminalClassification:"CANDIDATE_DONE",startedAt:stamp,endedAt:stamp,
  });
  storeRun(database,nativeBuilder);
  // Capture real patch bytes using the same canonical Git configuration as
  // candidate replay. A hand-written diff omits the exact full-index identity.
  const candidateDirectory=mkdtempSync(join(tmpdir(),"order-browser-candidate-"));
  const candidate=await (async()=>{
    try{
      const workspace=join(candidateDirectory,"checkout");
      await createFreshCheckout(repositoryRoot,workspace,nativeApproval.baselineCommit);
      writeFileSync(join(workspace,"src","a.ts"),"export const a = 2;\n");
      return await captureCandidate(workspace);
    }finally{rmSync(candidateDirectory,{recursive:true,force:true});}
  })();
  const nativeState=persistEvent(nativeBuilder.id,1,{tag:"CANDIDATE_STATE_RECORDED",changedPaths:candidate.changedPaths,patch:{
    relativePath:"candidate.patch",sha256:writeRunEvidenceBytes(stateRoot,nativeBuilder.id,"candidate.patch",candidate.patch),mediaType:"text/x-diff"
  }});
  const nativeReviewer=RunSchema.parse({...nativeBuilder,id:newRunId(),role:"REVIEWER",triggerEventId:nativeState.id,attempt:2,contextHash:sha256Text("native-acceptance-reviewer")});
  storeRun(database,nativeReviewer);
  const nativeValidationIds=[];
  let nativeSequence=1;
  for(const stage of ["V0","V1","V2","V3","V4","V5","V6","V7"] as const){
    if(stage==="V4")persistEvent(nativeReviewer.id,nativeSequence++,{tag:"REVIEW_PASSED",minimumChange:"MINIMUM_SUFFICIENT",minimumChangeSummary:null,evidence:[]});
    nativeValidationIds.push(persistEvent(nativeReviewer.id,nativeSequence++,{tag:"VALIDATION_PASSED",stage,evidence:[]}).id);
  }
  const nativeMember=persistEvent(nativeReviewer.id,nativeSequence,{tag:"CANDIDATE_RECORDED",candidateStateEventId:nativeState.id,validationEventIds:nativeValidationIds});
  const members:CandidateMembers[number][]=[[nativeTask.id,nativeMember.id]];
  let noOpMember:ReturnType<typeof persistEvent>|undefined;
  if(noOpTask!==undefined){
    const noOpRun=RunSchema.parse({...nativeBuilder,id:newRunId(),executionTaskId:noOpTask.id,terminalClassification:"ALREADY_SATISFIED"});
    storeRun(database,noOpRun);
    noOpMember=persistEvent(noOpRun.id,1,{tag:"TASK_ALREADY_SATISFIED",summary:"Existing behavior satisfies the signed task."});
    members.push([noOpTask.id,noOpMember.id]);
    setExecutionTaskState(database,noOpTask.id,"ALREADY_SATISFIED");
  }
  members.sort((left,right)=>left[0]<right[0]?-1:1);
  const nativeHash=sha256Text(candidateMembershipCanonicalJson(nativeApproval.id,members));
  withTransaction(database,()=>{
    setExecutionTaskState(database,nativeTask.id,"CANDIDATE_DONE");
    storeCandidateReviewEvent(database,{id:newCandidateReviewEventId(),approvalId:nativeApproval.id,sequence:1,occurredAt:stamp,actor:null,event:{tag:"OPENED",candidateHash:nativeHash}});
    updateWorkItemLifecycle(database,item.id,{stage:"AWAITING_ACCEPTANCE",status:"ACTIVE",outcome:null});
  });
  await observeCurrentCandidateReview(seedRuntime,item.id,nativeApproval.id,1);
  return {item, approval:nativeApproval, builder:nativeBuilder, reviewer:nativeReviewer, state:nativeState,
    task:nativeTask, member:nativeMember, hash:nativeHash, noOpTask,noOpMember};
};
await seedNativeCandidate(nativeAcceptanceItem);
const nativeFaultFixtures=new Map<WorkItemId,Awaited<ReturnType<typeof seedNativeCandidate>> & {fault:NativeFault}>();
for(const {fault,item} of nativeFaultItems) nativeFaultFixtures.set(item.id,{...await seedNativeCandidate(item),fault});

// Canonical persisted histories: use the real signed package and exact
// builder/reviewer/event lineage, not mocked view models or atlas states.
const liveCorrections:Readonly<{run:ReturnType<typeof RunSchema.parse>;approvalId:ReturnType<typeof newApprovalId>;submissionId:ReturnType<typeof newCandidateReviewEventId>;sequence:number}>[]=[];
for(const [kind,item] of nativeHistoryItems){
  const fixture=await seedNativeCandidate(item);
  if(kind==="copy"||kind==="loading"||kind==="mixed")continue;
  let sequence=1;
  let currentHash=fixture.hash;
  let currentMember=fixture.member;
  let attempt=2;
  const appendQa=(event:CandidateReviewEventPayload,actor:string|null)=>{
    const entry={id:newCandidateReviewEventId(),approvalId:fixture.approval.id,sequence:++sequence,occurredAt:stamp,actor,event};
    storeCandidateReviewEvent(database,entry);
    return entry;
  };
  const report=(observed:string)=>appendQa({tag:"REPORT",candidateHash:currentHash,
    taskId:fixture.task.id,candidateEventId:currentMember.id,acceptanceRefs:fixture.task.acceptanceRefs,
    expected:"The signed candidate meets its acceptance criterion.",observed,reproduction:"Inspect the exact candidate checkout.",
    impact:"The observation requires a human retest.",evidence:[fixture.state.id]},"Fixture operator");
  const submit=(findingId:ReturnType<typeof newCandidateReviewEventId>)=>appendQa({tag:"SUBMIT",candidateHash:currentHash,findingIds:[findingId]},"Fixture operator");
  const dispose=(findingId:ReturnType<typeof newCandidateReviewEventId>,outcome:"RESOLVED"|"WITHDRAWN")=>appendQa({
    tag:"DISPOSITION",candidateHash:currentHash,findingId,outcome,rationale:"The fixture operator recorded the required disposition.",
    followupWorkItemId:null,withdrawalAttestation:outcome==="WITHDRAWN"?"NOT_A_KNOWN_UNMET_OBLIGATION":null},"Fixture operator");
  const correction=(findingId:ReturnType<typeof newCandidateReviewEventId>,mode:"COMPLETED"|"RUNNING"|"BLOCKED")=>{
    const submission=submit(findingId);
    if(kind==="queued")return;
    const run=RunSchema.parse({...fixture.reviewer,id:newRunId(),attempt:++attempt,
      triggerEventId:currentMember.id,status:mode,endedAt:mode==="RUNNING"?null:stamp,
      terminalClassification:mode==="COMPLETED"?"CANDIDATE_DONE":mode==="RUNNING"?null:"REVIEW_FAILURE"});
    if(mode==="RUNNING"){
      // Active attempts must be inserted after daemon restart recovery, just
      // like the existing live STAGE fixtures below.
      liveCorrections.push({run,approvalId:fixture.approval.id,submissionId:submission.id,sequence:sequence+1});
      return;
    }
    storeRun(database,run);
    appendQa({tag:"REVIEW_STARTED",submissionId:submission.id,runId:run.id},null);
    if(mode==="BLOCKED"){
      for(const [index,stage] of (["V0","V1","V2","V3"] as const).entries()){
        persistEvent(run.id,index+1,{tag:"VALIDATION_PASSED",stage,evidence:[]});
      }
      persistEvent(run.id,5,{tag:"REVIEW_FAILED",classification:"REVIEW_FAILURE",
        summary:"The submitted observation still requires repair.",evidence:[]});
      persistEvent(run.id,6,{tag:"VALIDATION_FAILED",stage:"V4",classification:"REVIEW_FAILURE",
        summary:"The submitted observation still requires repair.",evidence:[]});
      setExecutionTaskState(database,fixture.task.id,mode);
      updateWorkItemLifecycle(database,item.id,{stage:"EXECUTION",status:mode==="BLOCKED"?"BLOCKED":"ACTIVE",outcome:null});
      return;
    }
    const bytes=encoder.encode("Independent assessment of the exact submitted finding.\n");
    const proof={relativePath:"successor-review.txt",sha256:writeRunEvidenceBytes(stateRoot,run.id,"successor-review.txt",bytes),mediaType:"text/plain"};
    let ordinal=1;
    const validationIds=[];
    for(const stage of ["V0","V1","V2","V3","V4","V5","V6","V7"] as const){
      if(stage==="V4")persistEvent(run.id,ordinal++,{tag:"REVIEW_PASSED",minimumChange:"MINIMUM_SUFFICIENT",
        minimumChangeSummary:null,evidence:[proof],qaAssessments:[{findingId,verdict:"NOT_REPRODUCED",rationale:"Independent reproduction did not reproduce the reported failure.",evidence:[proof]}]});
      validationIds.push(persistEvent(run.id,ordinal++,{tag:"VALIDATION_PASSED",stage,evidence:[proof]}).id);
    }
    currentMember=persistEvent(run.id,ordinal,{tag:"CANDIDATE_RECORDED",candidateStateEventId:fixture.state.id,validationEventIds:validationIds});
    currentHash=sha256Text(candidateMembershipCanonicalJson(fixture.approval.id,[[fixture.task.id,currentMember.id]]));
    appendQa({tag:"REVIEW_COMPLETED",submissionId:submission.id,candidateHash:currentHash,candidateEventId:currentMember.id},null);
  };
  if(kind==="retest"){
    const historical=report("Previously assessed finding");
    const unassessed=report("Previously withdrawn finding");
    dispose(unassessed.id,"WITHDRAWN");
    correction(historical.id,"COMPLETED");
    dispose(historical.id,"RESOLVED");
    const newest=report("Current independently assessed finding");
    correction(newest.id,"COMPLETED");
  }else{
    const finding=report("Submitted correction finding");
    correction(finding.id,kind==="running"?"RUNNING":kind==="blocked"?"BLOCKED":"COMPLETED");
  }
  if(kind==="queued"||kind==="retest"||kind==="running")await observeCurrentCandidateReview(seedRuntime,item.id,fixture.approval.id,sequence);
}

writeFileSync(
  join(repositoryRoot, "docs", "stale-approval-plan.md"),
  "# Browser certification plan\n\nstale after conformance\n",
);

const invalidLifecycleItem = workItem(
  "Invalid lifecycle Markdown",
  "R1",
  "ACTIVE",
  null,
);
storeWorkItem(database, invalidLifecycleItem);
const invalidLifecycleArtifact = await currentFileArtifact(
  seedRuntime,
  invalidLifecycleItem,
  "docs/invalid-lifecycle.md",
  "R1",
  "P1",
);
const invalidLifecycleContext = await resolveStageContext(
  seedRuntime,
  invalidLifecycleItem,
  "R1",
);
const invalidLifecycleRun = insertRun(seedRuntime, RunSchema.parse({
  id: newRunId(),
  workItemId: invalidLifecycleItem.id,
  executionTaskId: null,
  stage: "R1",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "COMPLETED",
  attempt: nextAttempt(seedRuntime, invalidLifecycleItem.id, "R1", null),
  baselineCommit,
  contextHash: invalidLifecycleContext.contextHash,
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: stamp,
}));
appendRunEvent(seedRuntime, invalidLifecycleRun.id, {
  tag: "CONFORMANCE_PASSED",
  stage: "R1",
  outputArtifactRefIds: [invalidLifecycleArtifact.id],
  contextHash: invalidLifecycleContext.contextHash,
  evidence: [],
});

writeFileSync(
  join(repositoryRoot, "docs", "investigation-result.md"),
  "# Investigation result\n\nEvidence-backed conclusion.\n",
);
writeFileSync(
  join(repositoryRoot, "docs", "audit-result.md"),
  "# Audit result\n\nEvidence-backed audit verdict.\n",
);

const seedTerminalResult = async (
  item: ReturnType<typeof workItem>,
  path: "docs/investigation-result.md" | "docs/audit-result.md" | "docs/r1.md",
  outcome: "INVESTIGATION_COMPLETE" | "AUDIT_COMPLETE" | "DISPROVEN" | "DUPLICATE" | "ALREADY_SATISFIED",
): Promise<void> => {
  storeWorkItem(database, item);
  const output = await currentFileArtifact(seedRuntime, item, path, "R1", "P1");
  const context = await resolveStageContext(seedRuntime, item, "R1");
  const run = insertRun(seedRuntime, RunSchema.parse({
    id: newRunId(),
    workItemId: item.id,
    executionTaskId: null,
    stage: "R1",
    mode: "INTERACTIVE",
    role: "STAGE",
    triggerEventId: null,
    status: "COMPLETED",
    attempt: nextAttempt(seedRuntime, item.id, "R1", null),
    baselineCommit,
    contextHash: context.contextHash,
    providerSessionId: null,
    terminalClassification: null,
    startedAt: stamp,
    endedAt: stamp,
  }));
  appendRunEvent(seedRuntime, run.id, {
    tag: "STAGE_COMPLETED",
    completion: { stage: "R1", outcome },
    artifactRefIds: [output.id],
  });
  appendRunEvent(seedRuntime, run.id, {
    tag: "CONFORMANCE_PASSED",
    stage: "R1",
    outputArtifactRefIds: [output.id],
    contextHash: context.contextHash,
    evidence: [],
  });
};

const investigationItem = workItem(
  "Completed investigation",
  "COMPLETE",
  "COMPLETE",
  "INVESTIGATION_COMPLETE",
  "investigation-v1",
);
await seedTerminalResult(
  investigationItem,
  "docs/investigation-result.md",
  "INVESTIGATION_COMPLETE",
);
// Persist a competing same-role snapshot for a dedicated Result-only fixture.
const competingTerminalItem=workItem("Completed investigation with competing artifact","COMPLETE","COMPLETE","INVESTIGATION_COMPLETE","investigation-v1");
await seedTerminalResult(competingTerminalItem,"docs/investigation-result.md","INVESTIGATION_COMPLETE");
await currentFileArtifact(seedRuntime,competingTerminalItem,"docs/r1.md","R1","P1");

const auditItem = workItem(
  "Completed audit",
  "COMPLETE",
  "COMPLETE",
  "AUDIT_COMPLETE",
  "audit-v1",
);
await seedTerminalResult(
  auditItem,
  "docs/audit-result.md",
  "AUDIT_COMPLETE",
);

for (const [title, outcome] of [
  ["Disproven work", "DISPROVEN"],
  ["Duplicate work", "DUPLICATE"],
  ["Already satisfied work", "ALREADY_SATISFIED"],
] as const) {
  await seedTerminalResult(workItem(title, "COMPLETE", "COMPLETE", outcome), "docs/r1.md", outcome);
}

const seedExecutionFeedback = (
  title: string,
  lifecycle: Readonly<
    | {
        stage: "EXECUTION";
        status: "ACTIVE" | "BLOCKED";
        outcome: null;
      }
    | {
        stage: "COMPLETE";
        status: "COMPLETE";
        outcome: "ALREADY_SATISFIED";
      }
  >,
  taskState: "TODO" | "ALREADY_SATISFIED" | "BLOCKED",
) => {
  const item = workItem(
    title,
    lifecycle.stage,
    lifecycle.status,
    lifecycle.outcome,
  );
  storeWorkItem(database, item);
  const artifacts = storePlanArtifacts(item.id);
  const approvalValue = ApprovalSchema.parse({
    id: newApprovalId(),
    workItemId: item.id,
    baselineCommit,
    packageHash: sha256Text(canonicalApprovalPackageJson({
      workItemId: item.id, baselineCommit, sourceSha256: item.sourceSha256,
      plan: artifacts.plan, r3: artifacts.r3, materialArtifacts: [],
    })),
    planArtifactRefId: artifacts.plan.id,
    r3ArtifactRefId: artifacts.r3.id,
    sourceSha256: item.sourceSha256,
    approvedBy: "browser-certification",
    approvedAt: stamp,
  });
  storeApproval(database, approvalValue);
  const executionTask = ExecutionTaskSchema.parse({
    id: newExecutionTaskId(),
    approvalId: approvalValue.id,
    planTaskId: "T1",
    objective: title,
    dependsOn: [],
    scope: ["src/a.ts"],
    exclusions: [],
    acceptanceRefs: [],
    changeSurface: ["src/a.ts"],
    gateIds: ["test"],
    authorityRefs: [],
    concernIds: [],
    state: taskState,
  });
  storeExecutionTask(database, executionTask);
  return { item, task: executionTask };
};

const implementationReady = seedExecutionFeedback(
  "Implementation action ready",
  {
    stage: "EXECUTION",
    status: "ACTIVE",
    outcome: null,
  },
  "TODO",
);

const historicalSelectionItem = workItem(
  "Implementation historical selection",
  "EXECUTION",
  "ACTIVE",
  null,
);
storeWorkItem(database, historicalSelectionItem);
const historicalSelectionArtifacts = storePlanArtifacts(
  historicalSelectionItem.id,
  "docs/historical-selection-plan.md",
  historicalSelectionPlanSha,
);
const historicalSelectionApproval = ApprovalSchema.parse({
  id: newApprovalId(),
  workItemId: historicalSelectionItem.id,
  baselineCommit,
  packageHash: sha256Text(canonicalApprovalPackageJson({
    workItemId: historicalSelectionItem.id, baselineCommit,
    sourceSha256: historicalSelectionItem.sourceSha256,
    plan: historicalSelectionArtifacts.plan, r3: historicalSelectionArtifacts.r3,
    materialArtifacts: [],
  })),
  planArtifactRefId: historicalSelectionArtifacts.plan.id,
  r3ArtifactRefId: historicalSelectionArtifacts.r3.id,
  sourceSha256: historicalSelectionItem.sourceSha256,
  approvedBy: "browser-certification",
  approvedAt: stamp,
});
storeApproval(database, historicalSelectionApproval);
const historicalSelectionCompletedTask = ExecutionTaskSchema.parse({
  id: newExecutionTaskId(),
  approvalId: historicalSelectionApproval.id,
  planTaskId: "T1",
  objective: "Completed prerequisite",
  dependsOn: [],
  scope: ["src/a.ts"],
  exclusions: [],
  acceptanceRefs: [],
  changeSurface: ["src/a.ts"],
  gateIds: ["test"],
  authorityRefs: [],
  concernIds: [],
  state: "ALREADY_SATISFIED",
});
storeExecutionTask(database, historicalSelectionCompletedTask);
const historicalSelectionCurrentTask = ExecutionTaskSchema.parse({
  id: newExecutionTaskId(),
  approvalId: historicalSelectionApproval.id,
  planTaskId: "T2",
  objective: "Current implementation task",
  dependsOn: [historicalSelectionCompletedTask.id],
  scope: ["src/b.ts"],
  exclusions: [],
  acceptanceRefs: [],
  changeSurface: ["src/b.ts"],
  gateIds: ["test"],
  authorityRefs: [],
  concernIds: [],
  state: "TODO",
});
storeExecutionTask(database, historicalSelectionCurrentTask);

const alreadySatisfied = seedExecutionFeedback(
  "Already satisfied implementation",
  {
    stage: "COMPLETE",
    status: "COMPLETE",
    outcome: "ALREADY_SATISFIED",
  },
  "ALREADY_SATISFIED",
);
const alreadySatisfiedRun = RunSchema.parse({
  id: newRunId(),
  workItemId: alreadySatisfied.item.id,
  executionTaskId: alreadySatisfied.task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role: "BUILDER",
  triggerEventId: null,
  status: "COMPLETED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("already-satisfied-context"),
  providerSessionId: null,
  terminalClassification: "ALREADY_SATISFIED",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, alreadySatisfiedRun);
persistEvent(alreadySatisfiedRun.id, 1, {
  tag: "TASK_ALREADY_SATISFIED",
  summary: "The approved task already matches the repository state.",
});

const failedExecution = seedExecutionFeedback(
  "Failed implementation feedback",
  {
    stage: "EXECUTION",
    status: "BLOCKED",
    outcome: null,
  },
  "BLOCKED",
);
const failedBuilderRun = RunSchema.parse({
  id: newRunId(),
  workItemId: failedExecution.item.id,
  executionTaskId: failedExecution.task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role: "BUILDER",
  triggerEventId: null,
  status: "COMPLETED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("failed-builder-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, failedBuilderRun);
persistEvent(failedBuilderRun.id, 1, {
  tag: "GATE_PASSED",
  gateId: "typecheck",
  evidence: [],
});
persistEvent(failedBuilderRun.id, 2, {
  tag: "GATE_FAILED",
  gateId: "test",
  classification: "TEST_FAILURE",
  evidence: [],
});

// A failed signed checkpoint is not a reviewer trigger. The builder
// corrects within scope and records an actual candidate for independent review.
persistEvent(failedBuilderRun.id, 3, {
  tag: "GATE_PASSED", gateId: "test", evidence: [],
});
const failedCandidatePatch = encoder.encode("diff --git a/src/a.ts b/src/a.ts\n");
const failedCandidate = persistEvent(failedBuilderRun.id, 4, {
  tag: "CANDIDATE_STATE_RECORDED",
  patch: {
    relativePath: "candidate.patch",
    sha256: writeRunEvidenceBytes(stateRoot, failedBuilderRun.id, "candidate.patch", failedCandidatePatch),
    mediaType: "text/x-diff",
  },
  changedPaths: ["src/a.ts"],
});

const failedReviewerRun = RunSchema.parse({
  id: newRunId(),
  workItemId: failedExecution.item.id,
  executionTaskId: failedExecution.task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role: "REVIEWER",
  triggerEventId: failedCandidate.id,
  status: "FAILED",
  attempt: nextAttempt(seedRuntime, failedExecution.item.id, "EXECUTION", failedExecution.task.id),
  baselineCommit,
  contextHash: sha256Text("failed-reviewer-context"),
  providerSessionId: null,
  terminalClassification: "REVIEW_FAILURE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, failedReviewerRun);
for (const [index, stage] of (["V0", "V1", "V2", "V3"] as const).entries()) {
  persistEvent(failedReviewerRun.id, index + 1, { tag: "VALIDATION_PASSED", stage, evidence: [] });
}
persistEvent(failedReviewerRun.id, 5, {
  tag: "REVIEW_FAILED",
  classification: "REVIEW_FAILURE",
  summary: "Independent review rejected the candidate.",
  evidence: [],
});
persistEvent(failedReviewerRun.id, 6, {
  tag: "VALIDATION_FAILED",
  stage: "V4",
  classification: "REVIEW_FAILURE",
  summary: "Semantic review failed.",
  evidence: [],
});

const candidateItem = workItem("Verified candidate", "COMPLETE", "COMPLETE", "CANDIDATE_DONE");
storeWorkItem(database, candidateItem);
const candidateArtifacts = storePlanArtifacts(candidateItem.id);
const candidateRequirements = ArtifactRefSchema.parse({
  id: newArtifactRefId(),
  workItemId: candidateItem.id,
  repositoryPath: "docs/r2.md",
  role: "R2",
  authorityLayer: "P7",
  sha256: requirementsSha,
  gitCommit: baselineCommit,
});
const candidateDesign = ArtifactRefSchema.parse({
  id: newArtifactRefId(),
  workItemId: candidateItem.id,
  repositoryPath: "docs/design.md",
  role: "DESIGN",
  authorityLayer: "P7",
  sha256: designSha,
  gitCommit: baselineCommit,
});
storeArtifact(database, candidateRequirements);
storeArtifact(database, candidateDesign);
storeArtifactDependency(database, candidateArtifacts.r3.id, candidateRequirements.id);
storeArtifactDependency(database, candidateArtifacts.r3.id, candidateDesign.id);
const approval = ApprovalSchema.parse({
  id: newApprovalId(),
  workItemId: candidateItem.id,
  baselineCommit,
  packageHash: sha256Text(canonicalApprovalPackageJson({
    workItemId: candidateItem.id, baselineCommit, sourceSha256: candidateItem.sourceSha256,
    plan: candidateArtifacts.plan, r3: candidateArtifacts.r3,
    materialArtifacts: [candidateRequirements, candidateDesign],
  })),
  planArtifactRefId: candidateArtifacts.plan.id,
  r3ArtifactRefId: candidateArtifacts.r3.id,
  sourceSha256: candidateItem.sourceSha256,
  approvedBy: "browser-certification",
  approvedAt: stamp,
});
storeApproval(database, approval);
const task = ExecutionTaskSchema.parse({
  id: newExecutionTaskId(),
  approvalId: approval.id,
  planTaskId: "T1",
  objective: "Prove the browser candidate surface",
  dependsOn: [],
  scope: ["src/a.ts"],
  exclusions: [],
  acceptanceRefs: [],
  changeSurface: ["src/a.ts"],
  gateIds: [],
  authorityRefs: [],
  concernIds: [],
  state: "CANDIDATE_DONE",
});
storeExecutionTask(database, task);

const builderRun = RunSchema.parse({
  id: newRunId(),
  workItemId: candidateItem.id,
  executionTaskId: task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role: "BUILDER",
  triggerEventId: null,
  status: "COMPLETED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("builder-context"),
  providerSessionId: null,
  terminalClassification: "CANDIDATE_DONE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, builderRun);
const patchBytes = encoder.encode("diff --git a/src/a.ts b/src/a.ts\n");
const patchRef = {
  relativePath: "candidate.patch",
  sha256: writeRunEvidenceBytes(stateRoot, builderRun.id, "candidate.patch", patchBytes),
  mediaType: "text/x-diff",
};
const candidateState = persistEvent(builderRun.id, 1, {
  tag: "CANDIDATE_STATE_RECORDED",
  patch: patchRef,
  changedPaths: ["src/a.ts"],
});

const reviewerRun = RunSchema.parse({
  id: newRunId(),
  workItemId: candidateItem.id,
  executionTaskId: task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role: "REVIEWER",
  triggerEventId: candidateState.id,
  status: "COMPLETED",
  attempt: nextAttempt(seedRuntime, candidateItem.id, "EXECUTION", task.id),
  baselineCommit,
  contextHash: sha256Text("reviewer-context"),
  providerSessionId: null,
  terminalClassification: "CANDIDATE_DONE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, reviewerRun);
const reviewBytes = encoder.encode(
  "<script>window.__orderXss=true</script>\nverification evidence\n",
);
const reviewRef = {
  relativePath: "review.txt",
  sha256: writeRunEvidenceBytes(stateRoot, reviewerRun.id, "review.txt", reviewBytes),
  mediaType: "text/plain",
};
persistEvent(reviewerRun.id, 1, {
  tag: "REVIEW_PASSED",
  minimumChange: "MINIMUM_SUFFICIENT",
  minimumChangeSummary: null,
  evidence: [reviewRef],
});
const validationEventIds = [];
for (const [index, stage] of ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"].entries()) {
  const event = persistEvent(reviewerRun.id, index + 2, {
    tag: "VALIDATION_PASSED",
    stage: stage as "V0" | "V1" | "V2" | "V3" | "V4" | "V5" | "V6" | "V7",
    evidence: [reviewRef],
  });
  validationEventIds.push(event.id);
}
persistEvent(reviewerRun.id, 10, {
  tag: "CANDIDATE_RECORDED",
  candidateStateEventId: candidateState.id,
  validationEventIds,
});
persistEvent(reviewerRun.id, 11, {
  tag: "AGENT_ACTIVITY_RECORDED",
  category: "REVIEWING_RESULTS",
  summary: "Reviewing candidate evidence",
  resource: "src/a.ts",
});

const discoveredId = newWorkItemId();
createWorkItemSourceFile(
  repositoryRoot,
  workItemsRoot,
  discoveredId,
  renderWorkItemSourceMarkdown(
    {
      formatVersion: 1,
      id: discoveredId,
      projectId: "order-e2e",
      concernIds: [],
      schemaId: "investigation-v1",
    },
    "Discovered on startup",
  ),
);
const invalidId = newWorkItemId();
mkdirSync(join(workItemRoot, invalidId), { recursive: true });
writeFileSync(
  join(workItemRoot, invalidId, "work-request.md"),
  "This file is intentionally not valid WorkItem source Markdown.\n",
);

database.close();

const environment: NodeJS.ProcessEnv = {
  ...process.env,
  PONTIVUS_ORDER_STATE_ROOT: stateRoot,
  PONTIVUS_ORDER_BIND: "127.0.0.1:17347",
};
const daemon = await startOrderDaemon(environment);
for(const {run,approvalId,submissionId,sequence} of liveCorrections){
  withTransaction(daemon.coordinator.database,()=>{
    storeRun(daemon.coordinator.database,run);
    storeCandidateReviewEvent(daemon.coordinator.database,{id:newCandidateReviewEventId(),approvalId,sequence,
      occurredAt:nowIsoDateTime(),actor:null,event:{tag:"REVIEW_STARTED",submissionId,runId:run.id}});
    setExecutionTaskState(daemon.coordinator.database,run.executionTaskId!,"RUNNING");
    updateWorkItemLifecycle(daemon.coordinator.database,run.workItemId,{stage:"EXECUTION",status:"ACTIVE",outcome:null});
  });
}
insertRun(daemon.coordinator, openContinuationRun);
appendRunEvent(daemon.coordinator, openContinuationRun.id, {
  tag: "STAGE_STARTED",
  stage: "R1",
  mode: "INTERACTIVE",
  contextHash: openContinuationRun.contextHash,
});
appendRunEvent(daemon.coordinator, openContinuationRun.id, {
  tag: "AGENT_MESSAGE_FINAL",
  text: "The current Research findings are ready for your continuation.",
  evidence: [],
});

insertRun(daemon.coordinator, proposalRun);
appendRunEvent(daemon.coordinator, proposalRun.id, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: proposalRun.contextHash,
});
appendRunEvent(daemon.coordinator, proposalRun.id, {
  tag: "AGENT_MESSAGE_FINAL",
  text: "The plan is ready for operator review.",
  evidence: [],
});
const liveProposalInputRequest = appendRunEvent(daemon.coordinator, proposalRun.id, {
  tag: "HUMAN_INPUT_REQUESTED",
  category: "INFORMATION",
  question: "Confirm the proposal should be reviewed.",
});
appendRunEvent(daemon.coordinator, proposalRun.id, {
  tag: "HUMAN_INPUT_RECEIVED",
  requestEventId: liveProposalInputRequest.id,
  text: "Review the proposal.",
});
const liveProposal = appendRunEvent(daemon.coordinator, proposalRun.id, {
  tag: "ARTIFACT_PROPOSAL_CREATED",
  targetPath: proposalPath,
  baseSha256: null,
  role: "PLAN",
  authorityLayer: "P7",
  unifiedDiff:
    "--- /dev/null\n+++ b/" + proposalPath + "\n@@ -0,0 +1 @@\n+proposal\n",
  rationale: "Exercise the canonical proposal disposition surface.",
});
proposalEventId = liveProposal.id;

insertRun(daemon.coordinator, rejectionRun);
appendRunEvent(daemon.coordinator, rejectionRun.id, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: rejectionRun.contextHash,
});
appendRunEvent(daemon.coordinator, rejectionRun.id, {
  tag: "ARTIFACT_PROPOSAL_CREATED",
  targetPath: `${workItemsRoot}/${rejectionItem.id}/implementation-plan.md`,
  baseSha256: null,
  role: "PLAN",
  authorityLayer: "P7",
  unifiedDiff:
    "--- /dev/null\n+++ b/" +
    `${workItemsRoot}/${rejectionItem.id}/implementation-plan.md` +
    "\n@@ -0,0 +1 @@\n+reject proposal\n",
  rationale: "Exercise the canonical Reject mutation.",
});

insertRun(daemon.coordinator, {
  ...adoptionPendingRun,
  status: "RUNNING",
});
appendRunEvent(daemon.coordinator, adoptionPendingRun.id, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: adoptionPendingRun.contextHash,
});
const liveAdoptionPendingProposal = appendRunEvent(
  daemon.coordinator,
  adoptionPendingRun.id,
  {
    tag: "ARTIFACT_PROPOSAL_CREATED",
    targetPath: `${workItemsRoot}/${adoptionPendingItem.id}/implementation-plan.md`,
    baseSha256: null,
    role: "PLAN",
    authorityLayer: "P7",
    unifiedDiff:
      "--- /dev/null\n+++ b/" +
      `${workItemsRoot}/${adoptionPendingItem.id}/implementation-plan.md` +
      "\n@@ -0,0 +1 @@\n+pending adoption\n",
    rationale: "Certify the canonical adoption-in-progress state.",
  },
);
appendRunEvent(daemon.coordinator, adoptionPendingRun.id, {
  tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
  proposalEventId: liveAdoptionPendingProposal.id,
});

const fixtureControl = Bun.serve({
  hostname: "127.0.0.1",
  port: 17348,
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("fixture mutation requires POST", { status: 405 });
    }
    const url = new URL(request.url);
    const raw = await request.json();
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      return new Response("fixture mutation body must be an object", { status: 400 });
    }
    const body = raw as Record<string, unknown>;

    if (url.pathname === "/start-stage") {
      const workItemId = WorkItemIdSchema.parse(body.workItemId);
      const item = getWorkItem(daemon.coordinator, workItemId);
      const stage = item.stage === "IDEA" ? "R1" : item.stage;
      if (
        stage !== "R1" &&
        stage !== "R2" &&
        stage !== "DESIGN" &&
        stage !== "PLAN" &&
        stage !== "R3"
      ) {
        return new Response("fixture start requires pre-signoff stage", { status: 409 });
      }
      const run = insertRun(daemon.coordinator, RunSchema.parse({
        id: newRunId(),
        workItemId,
        executionTaskId: null,
        stage,
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: nextAttempt(daemon.coordinator, workItemId, stage, null),
        baselineCommit,
        contextHash: sha256Text(
          "browser-success-" + workItemId + "-" + stage,
        ),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: nowIsoDateTime(),
        endedAt: null,
      }));
      if (item.stage === "IDEA") {
        updateWorkItemLifecycle(daemon.coordinator.database, workItemId, {
          stage: "R1",
          status: "ACTIVE",
          outcome: null,
        });
      }
      appendRunEvent(daemon.coordinator, run.id, {
        tag: "STAGE_STARTED",
        stage,
        mode: "INTERACTIVE",
        contextHash: run.contextHash,
      });
      return Response.json(run, { status: 201 });
    }

    if (url.pathname === "/submit-input") {
      const runId = RunIdSchema.parse(body.runId);
      const text = String(body.text ?? "");
      const requestEventId = body.requestEventId === null
        ? null
        : RunEventIdSchema.parse(body.requestEventId);
      const run = getRun(daemon.coordinator, runId);
      const received = appendRunEvent(daemon.coordinator, runId, {
        tag: "HUMAN_INPUT_RECEIVED",
        requestEventId,
        text,
      });
      updateRun(daemon.coordinator, runId, {
        status: "RUNNING",
        endedAt: null,
      });
      return Response.json(received);
    }

    if (url.pathname === "/acceptance-proof-fault") {
      const workItemId=WorkItemIdSchema.parse(body.workItemId);
      const fixture=nativeFaultFixtures.get(workItemId);
      if(fixture===undefined||body.fault!==fixture.fault) return new Response("exact native fault fixture required",{status:409});
      // First establish the signed candidate and exact current sequence. Change
      // only the selected fixture's actual source, signed material or evidence.
      await observeCurrentCandidateReview(daemon.coordinator,workItemId,fixture.approval.id,1);
      if(fixture.fault==="SOURCE_AUTHORITY_STALE"){
        const target=join(repositoryRoot,fixture.item.sourcePath);
        writeFileSync(target,readFileSync(target,"utf8")+"\nFixture source changed after sign-off.\n");
      } else if(fixture.fault==="STALE_AUTHORITY"){
        const target=join(repositoryRoot,"docs","native-acceptance-stale-plan.md");
        writeFileSync(target,readFileSync(target,"utf8")+"\nFixture material changed after sign-off.\n");
      } else {
        rmSync(join(statePaths(stateRoot).evidence,fixture.builder.id,"candidate.patch"));
      }
      try { await observeCurrentCandidateReview(daemon.coordinator,workItemId,fixture.approval.id,1); }
      catch(error) {
        const actual=staleAuthorityOwnerForFailure(error)!==null?"STALE_AUTHORITY":acceptanceObservationCodeForFailure(error);
        if(actual!==fixture.fault) throw error;
        return Response.json({code:actual,approvalId:fixture.approval.id});
      }
      throw new TypeError("fixture fault did not produce the exact typed observation");
    }

    if (url.pathname === "/tick") {
      const workItemId = WorkItemIdSchema.parse(body.workItemId);
      const tasks = await listExecutionTasks(daemon.coordinator, workItemId);
      const requestedTaskId = body.taskId === undefined
        ? null
        : ExecutionTaskIdSchema.parse(body.taskId);
      const task = requestedTaskId === null
        ? tasks[0]
        : tasks.find((candidate) => candidate.id === requestedTaskId);
      if (task === undefined) {
        return new Response("fixture execution task missing", { status: 409 });
      }
      setExecutionTaskState(daemon.coordinator.database, task.id, "RUNNING");
      const run = insertRun(daemon.coordinator, RunSchema.parse({
        id: newRunId(),
        workItemId,
        executionTaskId: task.id,
        stage: "EXECUTION",
        mode: "UNATTENDED",
        role: "BUILDER",
        triggerEventId: null,
        status: "RUNNING",
        attempt: nextAttempt(daemon.coordinator, workItemId, "EXECUTION", task.id),
        baselineCommit,
        contextHash: sha256Text("browser-success-execution-" + task.id),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: nowIsoDateTime(),
        endedAt: null,
      }));
      return Response.json(run);
    }

    return new Response("fixture mutation not found", { status: 404 });
  },
});

let stopping = false;
const stop = async (): Promise<void> => {
  if (stopping) return;
  stopping = true;
  fixtureControl.stop(true);
  await daemon.stop();
  process.exit(0);
};
process.once("SIGINT", () => void stop());
process.once("SIGTERM", () => void stop());

console.log(JSON.stringify({
  status: "ready",
  repositoryRoot,
  proposalEventId,
}));
await new Promise<never>(() => undefined);
