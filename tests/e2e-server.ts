import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join } from "node:path";

import {
  ApprovalSchema,
  ArtifactRefSchema,
  ExecutionTaskSchema,
  RunEventSchema,
  RunSchema,
  WorkItemSchema,
  type RunEventPayload,
  type RunId,
  type WorkItemId,
} from "../src/core/contracts.ts";
import { renderWorkItemSourceMarkdown } from "../src/core/work-item-source.ts";
import { startOrderDaemon } from "../src/daemon/server.ts";
import { createCoordinatorRuntime } from "../src/daemon/runtime.ts";
import {
  currentFileArtifact,
  resolveStageContext,
} from "../src/daemon/authority.ts";
import {
  appendRunEvent,
  insertRun,
  nextAttempt,
  updateRun,
} from "../src/daemon/run.ts";
import { writeOrderConfig } from "../src/shell/config.ts";
import { resolveHeadCommit } from "../src/shell/repository.ts";
import {
  createWorkItemSourceFile,
  readWorkItemSource,
} from "../src/shell/work-item-source.ts";
import {
  newApprovalId,
  newArtifactRefId,
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
  storeExecutionTask,
  storeRun,
  storeRunEvent,
  storeWorkItem,
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
  version: 3,
  model: { providerID: "opencode", id: "glm-5.3-flash-free" },
  repositoryRoots: [repositoryRoot],
  referenceRoots: [],
});

const planText = `# Browser certification plan

\`\`\`order-tasks
{"version":1,"tasks":[{"id":"T1","objective":"Prove the browser candidate surface","dependsOn":[],"scope":["src/a.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/a.ts"],"gateIds":[],"authorityRefs":[],"concernIds":[]}]}
\`\`\`
`;
const r3Text = "# R3\n\nREADY_FOR_SIGNOFF\n";
const manifestText = `version = 1
projectId = "order-e2e"

[authority]
p1 = []
p2 = []
p3 = []
p4 = []
p5 = []
p6 = []

[concerns.browser]
authority = []
paths = ["src/**"]
gates = []
`;

writeFileSync(join(repositoryRoot, "pontivus-order.toml"), manifestText);
writeFileSync(join(repositoryRoot, "docs", "r1.md"), "# R1 confirmed\n");
writeFileSync(join(repositoryRoot, "docs", "r2.md"), "# R2 accepted\n");
writeFileSync(join(repositoryRoot, "docs", "design.md"), "# DESIGN accepted\n");
writeFileSync(join(repositoryRoot, "docs", "plan.md"), planText);
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
const planSha = sha256(new Uint8Array(readFileSync(join(repositoryRoot, "docs", "plan.md"))));
const r3Sha = sha256(new Uint8Array(readFileSync(join(repositoryRoot, "docs", "r3.md"))));

const workItem = (
  title: string,
  stage: "R1" | "PLAN" | "AWAITING_SIGNOFF" | "COMPLETE",
  status: "ACTIVE" | "COMPLETE",
  outcome:
    | "CANDIDATE_DONE"
    | "INVESTIGATION_COMPLETE"
    | "AUDIT_COMPLETE"
    | "DISPROVEN"
    | "DUPLICATE"
    | "ALREADY_SATISFIED"
    | null,
  schemaId: "change-v1" | "investigation-v1" | "audit-v1" = "change-v1",
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

const storePlanArtifacts = (workItemId: WorkItemId) => {
  const plan = ArtifactRefSchema.parse({
    id: newArtifactRefId(),
    workItemId,
    repositoryPath: "docs/plan.md",
    role: "PLAN",
    authorityLayer: "P7",
    sha256: planSha,
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
  return { plan, r3 };
};

const proposalItem = workItem("Proposal review", "PLAN", "ACTIVE", null);
storeWorkItem(database, proposalItem);
const proposalRun = RunSchema.parse({
  id: newRunId(),
  workItemId: proposalItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "WAITING_FOR_INPUT",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("proposal-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
storeRun(database, proposalRun);

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

persistEvent(proposalRun.id, 1, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: proposalRun.contextHash,
});
persistEvent(proposalRun.id, 2, {
  tag: "AGENT_MESSAGE_FINAL",
  text: "The plan is ready for operator review.",
  evidence: [],
});
const proposalPath = `${workItemsRoot}/${proposalItem.id}/implementation-plan.md`;
const proposal = persistEvent(proposalRun.id, 3, {
  tag: "ARTIFACT_PROPOSAL_CREATED",
  targetPath: proposalPath,
  baseSha256: null,
  role: "PLAN",
  authorityLayer: "P7",
  unifiedDiff:
    "--- /dev/null\n+++ b/" + proposalPath + "\n@@ -0,0 +1 @@\n+proposal\n",
  rationale: "Exercise the canonical proposal disposition surface.",
});
const seedRuntime = createCoordinatorRuntime(database, stateRoot, process.env, orderConfig);

const seedConformance = async (
  item: ReturnType<typeof workItem>,
  stage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
  output: Awaited<ReturnType<typeof currentFileArtifact>>,
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
    for (const dependency of context.artifacts) {
      if (dependency.id !== output.id) {
        storeArtifactDependency(database, output.id, dependency.id);
      }
    }
    appendRunEvent(seedRuntime, run.id, {
      tag: "CONFORMANCE_PASSED",
      stage,
      outputArtifactRefIds: [output.id],
      contextHash: context.contextHash,
      evidence: [],
    });
  });
};

const seedLifecycle = async (item: ReturnType<typeof workItem>) => {
  const outputs = {
    R1: await currentFileArtifact(seedRuntime, item, "docs/r1.md", "R1", "P1"),
    R2: await currentFileArtifact(seedRuntime, item, "docs/r2.md", "R2", "P3"),
    DESIGN: await currentFileArtifact(seedRuntime, item, "docs/design.md", "DESIGN", "P6"),
    PLAN: await currentFileArtifact(seedRuntime, item, "docs/plan.md", "PLAN", "P7"),
    R3: await currentFileArtifact(seedRuntime, item, "docs/r3.md", "R3", "P7"),
  };
  await seedConformance(item, "R1", outputs.R1);
  await seedConformance(item, "R2", outputs.R2);
  await seedConformance(item, "DESIGN", outputs.DESIGN);
  await seedConformance(item, "PLAN", outputs.PLAN);
  await seedConformance(item, "R3", outputs.R3);
  return outputs;
};

const signoffItem = workItem("Awaiting sign-off", "AWAITING_SIGNOFF", "ACTIVE", null);
storeWorkItem(database, signoffItem);
const signoffOutputs = await seedLifecycle(signoffItem);

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

git("add", "--", workItemsRoot);
git("commit", "-q", "-m", "browser WorkItem sources");
baselineCommit = await resolveHeadCommit(repositoryRoot);

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
  path: "docs/investigation-result.md" | "docs/audit-result.md",
  outcome: "INVESTIGATION_COMPLETE" | "AUDIT_COMPLETE",
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
  storeWorkItem(database, workItem(title, "COMPLETE", "COMPLETE", outcome));
}

const candidateItem = workItem("Verified candidate", "COMPLETE", "COMPLETE", "CANDIDATE_DONE");
storeWorkItem(database, candidateItem);
const candidateArtifacts = storePlanArtifacts(candidateItem.id);
const approval = ApprovalSchema.parse({
  id: newApprovalId(),
  workItemId: candidateItem.id,
  baselineCommit,
  packageHash: sha256Text("candidate-package"),
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
  attempt: 1,
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
updateRun(daemon.coordinator, proposalRun.id, { status: "RUNNING" });

let stopping = false;
const stop = async (): Promise<void> => {
  if (stopping) return;
  stopping = true;
  await daemon.stop();
  process.exit(0);
};
process.once("SIGINT", () => void stop());
process.once("SIGTERM", () => void stop());

console.log(JSON.stringify({
  status: "ready",
  repositoryRoot,
  proposalEventId: proposal.id,
}));
await new Promise<never>(() => undefined);
