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
  type StageCompletion,
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
  version: 4,
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
const planSha = sha256(new Uint8Array(readFileSync(join(repositoryRoot, "docs", "plan.md"))));
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
  status: "WAITING_FOR_INPUT",
  attempt: 2,
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
const proposalInputRequest = persistEvent(proposalRun.id, 3, {
  tag: "HUMAN_INPUT_REQUESTED",
  category: "INFORMATION",
  question: "Confirm the proposal should be reviewed.",
});
persistEvent(proposalRun.id, 4, {
  tag: "HUMAN_INPUT_RECEIVED",
  requestEventId: proposalInputRequest.id,
  text: "Review the proposal.",
});
const proposalPath = `${workItemsRoot}/${proposalItem.id}/implementation-plan.md`;
const proposal = persistEvent(proposalRun.id, 5, {
  tag: "ARTIFACT_PROPOSAL_CREATED",
  targetPath: proposalPath,
  baseSha256: null,
  role: "PLAN",
  authorityLayer: "P7",
  unifiedDiff:
    "--- /dev/null\n+++ b/" + proposalPath + "\n@@ -0,0 +1 @@\n+proposal\n",
  rationale: "Exercise the canonical proposal disposition surface.",
});
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
  status: "WAITING_FOR_INPUT",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("proposal-rejection-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
storeRun(database, rejectionRun);
persistEvent(rejectionRun.id, 1, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: rejectionRun.contextHash,
});
persistEvent(rejectionRun.id, 2, {
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

const adoptionPendingItem = workItem(
  "Proposal adoption in progress",
  "PLAN",
  "ACTIVE",
  null,
);
storeWorkItem(database, adoptionPendingItem);
const adoptionPendingRun = RunSchema.parse({
  id: newRunId(),
  workItemId: adoptionPendingItem.id,
  executionTaskId: null,
  stage: "PLAN",
  mode: "INTERACTIVE",
  role: "STAGE",
  triggerEventId: null,
  status: "RUNNING",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("proposal-adoption-pending-context"),
  providerSessionId: null,
  terminalClassification: null,
  startedAt: stamp,
  endedAt: null,
});
storeRun(database, adoptionPendingRun);
persistEvent(adoptionPendingRun.id, 1, {
  tag: "STAGE_STARTED",
  stage: "PLAN",
  mode: "INTERACTIVE",
  contextHash: adoptionPendingRun.contextHash,
});
const adoptionPendingProposal = persistEvent(adoptionPendingRun.id, 2, {
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
});
persistEvent(adoptionPendingRun.id, 3, {
  tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
  proposalEventId: adoptionPendingProposal.id,
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

const seedConformance = async (
  item: ReturnType<typeof workItem>,
  stage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3",
  output: Awaited<ReturnType<typeof currentFileArtifact>>,
  completion?: StageCompletion,
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
    if (completion) {
      appendRunEvent(seedRuntime, run.id, {
        tag: "STAGE_COMPLETED",
        completion,
        artifactRefIds: [output.id],
      });
    }
  });
};

const seedLifecycle = async (
  item: ReturnType<typeof workItem>,
  planPath: "docs/plan.md" | "docs/long-wide-plan.md" | "docs/long-narrow-plan.md" = "docs/plan.md",
) => {
  const outputs = {
    R1: await currentFileArtifact(seedRuntime, item, "docs/r1.md", "R1", "P1"),
    R2: await currentFileArtifact(seedRuntime, item, "docs/r2.md", "R2", "P3"),
    DESIGN: await currentFileArtifact(seedRuntime, item, "docs/design.md", "DESIGN", "P6"),
    PLAN: await currentFileArtifact(seedRuntime, item, planPath, "PLAN", "P7"),
    R3: await currentFileArtifact(seedRuntime, item, "docs/r3.md", "R3", "P7"),
  };
  await seedConformance(item, "R1", outputs.R1);
  await seedConformance(item, "R2", outputs.R2);
  await seedConformance(item, "DESIGN", outputs.DESIGN);
  await seedConformance(item, "PLAN", outputs.PLAN);
  await seedConformance(item, "R3", outputs.R3);
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
  tag: "HUMAN_INPUT_REQUESTED",
  category: "INFORMATION",
  question: "Which constraint should the plan prioritize?",
});

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
    packageHash: sha256Text(title + "-package"),
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
  status: "FAILED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("failed-builder-context"),
  providerSessionId: null,
  terminalClassification: "TEST_FAILURE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, failedBuilderRun);
persistEvent(failedBuilderRun.id, 1, {
  tag: "GATE_PASSED",
  gateId: "typecheck",
  evidence: [],
});
const failedGateEvent = persistEvent(failedBuilderRun.id, 2, {
  tag: "GATE_FAILED",
  gateId: "test",
  classification: "TEST_FAILURE",
  evidence: [],
});

const failedReviewerRun = RunSchema.parse({
  id: newRunId(),
  workItemId: failedExecution.item.id,
  executionTaskId: failedExecution.task.id,
  stage: "EXECUTION",
  mode: "UNATTENDED",
  role: "REVIEWER",
  triggerEventId: failedGateEvent.id,
  status: "FAILED",
  attempt: 1,
  baselineCommit,
  contextHash: sha256Text("failed-reviewer-context"),
  providerSessionId: null,
  terminalClassification: "REVIEW_FAILURE",
  startedAt: stamp,
  endedAt: stamp,
});
storeRun(database, failedReviewerRun);
persistEvent(failedReviewerRun.id, 1, {
  tag: "REVIEW_FAILED",
  classification: "REVIEW_FAILURE",
  summary: "Independent review rejected the candidate.",
  evidence: [],
});
persistEvent(failedReviewerRun.id, 2, {
  tag: "VALIDATION_FAILED",
  stage: "V4",
  classification: "REVIEW_FAILURE",
  summary: "Semantic review failed.",
  evidence: [],
});

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
