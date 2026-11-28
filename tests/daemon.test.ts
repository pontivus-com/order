import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { stageTemplateForSchema } from "../src/core/work-item-source.ts";
import { orderVersion } from "../src/version.ts";

describe("productive invocation failure origin", () => {
  it("persists local admission failure without fabricating PROVIDER_FAILED", () => {
    const state = tempDir("order-daemon-local-admission-");
    const repository = createRepository();

    const output = JSON.parse(execFileSync("bun", ["-e", `
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const shellRuntime = await import("./src/shell/runtime.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const workItem = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "Local admission failure origin",
        concernIds: ["shell"],
      });
      const run = runStore.insertRun(runtime, {
        id: shellRuntime.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
        contextHash: "sha256:" + "a".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-14T00:00:00.000Z",
        endedAt: null,
      });
      const failed = runStore.failRunForProductiveInvocation(
        runtime,
        run.id,
        "PRECONDITION_FAILED",
        new TypeError("instruction closure mismatch"),
      );
      const events = runStore.listRunEvents(runtime, run.id).map((event) => event.event);
      console.log(JSON.stringify({
        status: failed.status,
        terminalClassification: failed.terminalClassification,
        productive: events.find((event) => event.tag === "PRODUCTIVE_INVOCATION_FAILED") ?? null,
        provider: events.find((event) => event.tag === "PROVIDER_FAILED") ?? null,
      }));
      database.close();
    `], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: "pipe",
    })) as {
      status: string;
      terminalClassification: string | null;
      productive: {
        tag: string;
        classification: string;
        detail: string;
        evidence: unknown[];
      } | null;
      provider: unknown | null;
    };

    expect(output.status).toBe("FAILED");
    expect(output.terminalClassification).toBe("PRECONDITION_FAILED");
    expect(output.productive).toEqual({
      tag: "PRODUCTIVE_INVOCATION_FAILED",
      classification: "PRECONDITION_FAILED",
      detail: "instruction closure mismatch",
      evidence: [],
    });
    expect(output.provider).toBeNull();
  });
});

describe("bounded agent activity persistence", () => {
  it("caps, coalesces, and schema-validates persisted activity", () => {
    const state = tempDir("order-daemon-agent-activity-");
    const repository = createRepository();

    const output = JSON.parse(execFileSync("bun", ["-e", `
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const shellRuntime = await import("./src/shell/runtime.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const workItem = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "bounded activity",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, workItem.id);
      const run = runStore.insertRun(runtime, {
        id: shellRuntime.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
        contextHash: "sha256:" + "b".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-17T00:00:00.000Z",
        endedAt: null,
      });

      const record = runStore.createAgentActivityRecorder(runtime, run.id);
      let unsafeResourceRejected = false;
      try {
        record({
          tag: "AGENT_ACTIVITY_RECORDED",
          category: "READING",
          summary: "Unsafe resource",
          resource: "../secret.txt",
        });
      } catch {
        unsafeResourceRejected = true;
      }
      record({
        tag: "AGENT_ACTIVITY_RECORDED",
        category: "READING",
        summary: "Reading repository material",
        resource: "docs/r1.md",
      });
      record({
        tag: "AGENT_ACTIVITY_RECORDED",
        category: "READING",
        summary: "Reading repository material",
        resource: "docs/r1.md",
      });
      for (let index = 0; index < 40; index += 1) {
        record({
          tag: "AGENT_ACTIVITY_RECORDED",
          category: index % 2 === 0 ? "SEARCHING" : "RUNNING_CHECKS",
          summary: "Bounded activity " + index,
          resource: index % 2 === 0 ? "src/core/lifecycle.ts" : null,
        });
      }
      const activities = runStore.listRunEvents(runtime, run.id)
        .filter((event) => event.event.tag === "AGENT_ACTIVITY_RECORDED")
        .map((event) => event.event);
      console.log(JSON.stringify({
        count: activities.length,
        duplicateCount: activities.filter((event) =>
          event.tag === "AGENT_ACTIVITY_RECORDED" &&
          event.summary === "Reading repository material"
        ).length,
        unsafeResourceRejected,
      }));
      database.close();
    `], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: "pipe",
    })) as {
      count: number;
      duplicateCount: number;
      unsafeResourceRejected: boolean;
    };

    expect(output.count).toBe(32);
    expect(output.duplicateCount).toBe(1);
    expect(output.unsafeResourceRejected).toBe(true);
  });
});

describe("candidate changed-path instruction immutability", () => {
  it("rejects AGENTS.md through the production validator under the Bun runtime", () => {
    const script = `
      import { ExecutionTaskSchema } from "./src/core/contracts.ts";
      import { forecastVariancePaths, validateChangedPaths } from "./src/daemon/validation.ts";

      const task = ExecutionTaskSchema.parse({
        id: "task_11111111-1111-4111-8111-111111111111",
        approvalId: "approval_22222222-2222-4222-8222-222222222222",
        planTaskId: "T1",
        objective: "fixture",
        dependsOn: [],
        scope: ["**"],
        exclusions: [],
        acceptanceRefs: [],
        changeSurface: ["src/target.ts"],
        gateIds: ["test"],
        authorityRefs: [],
        concernIds: ["shell"],
        state: "RUNNING",
      });

      for (const path of ["AGENTS.md", "nested/AGENTS.md"]) {
        const result = validateChangedPaths(task, [path]);
        if (result === null || !result.includes("immutable repository instruction")) process.exit(1);
      }
      if (validateChangedPaths(task, ["src/target.ts"]) !== null) process.exit(2);
      if (validateChangedPaths(task, ["src/unforecast.ts"]) !== null) process.exit(3);
      if (JSON.stringify(forecastVariancePaths(task, ["src/target.ts", "src/unforecast.ts"])) !== JSON.stringify(["src/unforecast.ts"])) process.exit(4);

      const bounded = ExecutionTaskSchema.parse({
        ...task,
        scope: ["src/**"],
        exclusions: ["src/excluded.ts"],
      });
      if (!validateChangedPaths(bounded, ["docs/outside.md"])?.includes("outside signed scope")) process.exit(5);
      if (!validateChangedPaths(bounded, ["src/excluded.ts"])?.includes("excluded path")) process.exit(6);
      if (!validateChangedPaths(bounded, ["src/target.ts"], ["src/target.ts"])?.includes("signed authority/governance/verification")) process.exit(7);
    `;

    expect(() =>
      execFileSync("bun", ["-e", script], {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});

const temporary: string[] = [];
let distOwned = false;

const tempDir = (prefix: string): string => {
  const value = mkdtempSync(join(tmpdir(), prefix));
  temporary.push(value);
  return value;
};

afterEach(() => {
  for (const path of temporary.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
  if (distOwned) {
    rmSync(join(process.cwd(), "dist"), { recursive: true, force: true });
    distOwned = false;
  }
});

const runGit = (cwd: string, ...args: string[]): string =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const fixturePlan = `# fixture plan

\`\`\`order-tasks
{"version":1,"tasks":[{"id":"T1","objective":"make the target correct","dependsOn":[],"scope":["src/target.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/target.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":["shell"]}]}
\`\`\`
`;

const currentV2StageFixture = (stage: "R1" | "R2" | "DESIGN" | "PLAN" | "R3"): string => {
  const template = stageTemplateForSchema("change-v2", stage);
  if (template === null) throw new TypeError("missing current-v2 stage template");
  return stage === "R2"
    ? template.replace("|  |  |  |", "| Fixture requirement | LOCAL | — |")
    : template;
};

const currentV2PlanTemplate = stageTemplateForSchema("change-v2", "PLAN");
if (currentV2PlanTemplate === null) {
  throw new TypeError("missing current-v2 PLAN template");
}
const vacuousCurrentV2Plan =
  currentV2PlanTemplate +
  '\n```order-tasks\n{"version":1,"tasks":[]}\n```\n';
const currentV2R3Template = stageTemplateForSchema("change-v2", "R3");
if (currentV2R3Template === null) {
  throw new TypeError("missing current-v2 R3 template");
}

const fixtureManifest = `version = 1
projectId = "fixture"

[authority]
p1 = ["AGENTS.md"]
p2 = []
p3 = []
p4 = []
p5 = []
p6 = []

[refs]
GW-DOC-WORK-LIFECYCLE-V1 = "AGENTS.md"
GW-DOC-LIFECYCLE-CONTEXT-V1 = "AGENTS.md"
GW-DOC-LIFECYCLE-CONTEXT-V2 = "AGENTS.md"
GW-DOC-SPECIFICATION-STANDARD-V1 = "AGENTS.md"
GW-DOC-SPECIFICATION-STANDARD-V2 = "AGENTS.md"
GW-DOC-TECHNICAL-ARCHITECTURE-V1 = "AGENTS.md"
GW-DOC-TECHNICAL-ARCHITECTURE-V2 = "AGENTS.md"
GW-DOC-CANONICAL-CONTRACTS-V1 = "AGENTS.md"
GW-DOC-CANONICAL-CONTRACTS-V2 = "AGENTS.md"
GW-DOC-VALIDATION-STANDARD-V1 = "AGENTS.md"
GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION = "AGENTS.md"
GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW = "AGENTS.md"

[governance.fitness]
GW-P1-FCIS = ["architecture"]

[concerns.shell]
authority = ["AGENTS.md"]
paths = ["src/**"]
gates = ["test"]

[verification.architecture]
argv = ["bash", "-c", "test -f AGENTS.md"]
cwd = "."
timeoutSeconds = 30
inheritEnv = ["PATH"]
materialRefs = ["AGENTS.md"]

[verification.test]
argv = ["bash", "-c", "test -f src/target.ts"]
cwd = "."
timeoutSeconds = 30
inheritEnv = ["PATH"]
materialRefs = ["AGENTS.md"]
`;

const createRepository = (projectId = "fixture"): string => {
  const root = tempDir("order-daemon-repo-");
  mkdirSync(join(root, "docs"), { recursive: true });
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "AGENTS.md"), "# fixture authority\n");
  writeFileSync(
    join(root, "pontivus-order.toml"),
    fixtureManifest.replace('projectId = "fixture"', `projectId = "${projectId}"`),
  );
  writeFileSync(join(root, "docs", "r1.md"), "# R1 confirmed\n");
  writeFileSync(join(root, "docs", "r2.md"), "# R2 accepted\n");
  writeFileSync(join(root, "docs", "design.md"), "# DESIGN accepted\n");
  writeFileSync(join(root, "docs", "plan.md"), fixturePlan);
  writeFileSync(join(root, "docs", "r3.md"), "# READY_FOR_SIGNOFF\n");
  writeFileSync(join(root, "src", "target.ts"), "original\n");
  runGit(root, "init");
  runGit(root, "config", "user.email", "fixture@example.com");
  runGit(root, "config", "user.name", "Fixture");
  runGit(root, "add", ".");
  runGit(root, "commit", "-m", "fixture baseline");
  return root;
};

const fakeOpenCode = `#!/usr/bin/env bun
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const own = dirname(fileURLToPath(import.meta.url));
const mode = existsSync(join(own, "mode"))
  ? readFileSync(join(own, "mode"), "utf8").trim()
  : "fix";

if (args.length === 1 && args[0] === "--version") {
  console.log("opencode v2.2.6");
  process.exit(0);
}

if (
  args.length === 4 &&
  args[0] === "--standalone" &&
  args[1] === "auth" &&
  args[2] === "login"
) {
  process.exit(0);
}

if (
  args.length !== 5 ||
  args[0] !== "serve" ||
  args[1] !== "--hostname" ||
  args[2] !== "127.0.0.1" ||
  args[3] !== "--port" ||
  args[4] !== "0"
) {
  process.exit(2);
}

const model = { providerID: "opencode", id: "glm-5.3-flash-free" };
const sessions = new Map();
let nextSession = 0;
let nextAssistant = 0;
let accountConnections = existsSync(join(own, "account-removed"))
  ? []
  : [{
      type: "credential",
      id: "credential_fixture",
      method: "oauth",
      label: "fixture@example.com",
    }];

const json = (value, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    if (!request.headers.get("authorization")?.startsWith("Basic ")) {
      return json({ message: "unauthorized" }, 401);
    }
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/info") {
      return json({ version: "2.2.6" });
    }
    const accountIntegration = {
      id: "opencode",
      name: "OpenCode",
      methods: [{ id: "device", type: "oauth", name: "Device" }],
      connections: accountConnections,
    };
    if (request.method === "GET" && url.pathname === "/api/integration") {
      return json({ location: { directory: process.cwd() }, data: [accountIntegration] });
    }
    if (request.method === "GET" && url.pathname === "/api/integration/opencode") {
      return json({ location: { directory: process.cwd() }, data: accountIntegration });
    }
    const credentialMatch = /^\\/api\\/credential\\/([^/]+)$/.exec(url.pathname);
    if (credentialMatch && request.method === "DELETE") {
      const id = decodeURIComponent(credentialMatch[1]);
      const index = accountConnections.findIndex((connection) => connection.id === id);
      if (index < 0) return json({ message: "credential not found" }, 404);
      accountConnections.splice(index, 1);
      writeFileSync(join(own, "account-removed"), "removed");
      return new Response(null, { status: 204 });
    }
    if (request.method === "GET" && url.pathname === "/api/model") {
      return json({
        location: { directory: process.cwd() },
        data: [{ ...model, enabled: true }],
      });
    }
    if (request.method === "GET" && url.pathname === "/api/skill") {
      return json({ location: { directory: process.cwd() }, data: [] });
    }
    if (request.method === "GET" && url.pathname === "/api/mcp") {
      return json({ location: { directory: process.cwd() }, data: [] });
    }
    if (request.method === "POST" && url.pathname === "/api/session") {
      const body = await request.json();
      const id = "ses_" + (++nextSession);
      const session = {
        id,
        location: body.location ?? { directory: process.cwd() },
        time: { created: Date.now(), updated: Date.now() },
        model: undefined,
        permissions: [],
        outcome: undefined,
        messages: [],
      };
      sessions.set(id, session);
      return json({ data: session });
    }

    const match = /^\\/api\\/session\\/([^/]+)(?:\\/(.*))?$/.exec(url.pathname);
    if (!match) return json({ message: "not found" }, 404);
    const session = sessions.get(decodeURIComponent(match[1]));
    if (!session) return json({ message: "not found" }, 404);
    const suffix = match[2] ?? "";

    if (request.method === "POST" && suffix === "model") {
      const body = await request.json();
      session.model = body.model;
      return new Response(null, { status: 204 });
    }
    if (request.method === "PATCH" && suffix === "") {
      const body = await request.json();
      if (body.permissions !== undefined) session.permissions = body.permissions;
      return new Response(null, { status: 204 });
    }
    if (request.method === "GET" && suffix === "") {
      const { messages, ...info } = session;
      return json({ data: info });
    }
    if (request.method === "POST" && suffix === "prompt") {
      const body = await request.json();
      const text = String(body.text ?? "");
      let output;
      const delayedPrompt =
        ((mode === "stage-delay" || mode === "stage-complete-delay") &&
          text.includes("Order lifecycle stage:")) ||
        (mode === "noop-delay" && text.includes("Order execution role: BUILDER"));
      if (delayedPrompt) {
        writeFileSync(join(own, "provider-started"), "started");
        while (!existsSync(join(own, "provider-release"))) {
          await Bun.sleep(10);
        }
      }
      if (text.includes("Order execution role: BUILDER")) {
        if (mode === "noop" || mode === "noop-delay") {
          output = '[{"tag":"TASK_ALREADY_SATISFIED","summary":"baseline already satisfies the signed task"}]';
        } else if (mode === "empty") {
          output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"no candidate produced","evidence":[]}]';
        } else if (mode === "checkpoint" || mode === "checkpoint-fail") {
          writeFileSync(join(process.cwd(), "src", "target.ts"), "needs-review\\n");
          output = '[{"tag":"GATE_CHECKPOINT_REQUESTED","gateId":"test"}]';
        } else if (mode === "checkpoint-outside") {
          writeFileSync(join(process.cwd(), "docs", "outside.ts"), "outside\\n");
          output = '[{"tag":"GATE_CHECKPOINT_REQUESTED","gateId":"test"}]';
        } else if (mode === "bloat") {
          writeFileSync(join(process.cwd(), "src", "target.ts"), "fixed\\n");
          writeFileSync(join(process.cwd(), "src", "extra.ts"), "removable\\n");
          output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"candidate prepared","evidence":[]}]';
        } else if (mode === "checkpoint-unsigned") {
          output = '[{"tag":"GATE_CHECKPOINT_REQUESTED","gateId":"architecture"}]';
        } else {
          writeFileSync(join(process.cwd(), "src", "target.ts"), "needs-review\\n");
          output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"candidate prepared","evidence":[]}]';
        }
      } else if (text.includes("Coordinator checkpoint result:") && mode === "checkpoint-fail") {
        output = '[{"tag":"STAGE_BLOCKED","reason":"signed checkpoint failed","owningStage":"EXECUTION"}]';
      } else if (text.includes("Order execution role: REMEDIATOR")) {
        if (mode === "fix" || mode === "checkpoint") {
          writeFileSync(join(process.cwd(), "src", "target.ts"), "fixed\\n");
        } else if (mode === "bloat") {
          rmSync(join(process.cwd(), "src", "extra.ts"), { force: true });
        }
        output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"repair attempted","evidence":[]}]';
      } else if (text.includes("Order execution role: REVIEWER")) {
        const target = readFileSync(join(process.cwd(), "src", "target.ts"), "utf8");
        const hasV4Inputs =
          text.includes("V4 reviewer inputs supplied by the coordinator:") &&
          text.includes("Exact resulting candidate diff:") &&
          text.includes("Mechanical validation events completed before V4:") &&
          text.includes('"tag":"VALIDATION_PASSED"') &&
          text.includes('"stage":"V3"');
        if (target === "fixed\\n" && hasV4Inputs && mode === "bloat" &&
            existsSync(join(process.cwd(), "src", "extra.ts"))) {
          output = '[{"tag":"REVIEW_PASSED","minimumChange":"CHANGE_BLOAT","minimumChangeSummary":"src/extra.ts is removable","evidence":[]}]';
        } else {
          output = target === "fixed\\n" && hasV4Inputs
            ? '[{"tag":"REVIEW_PASSED","minimumChange":"MINIMUM_SUFFICIENT","minimumChangeSummary":null,"evidence":[]}]'
            : '[{"tag":"REVIEW_FAILED","classification":"REVIEW_FAILURE","summary":"target still needs repair or V4 inputs are incomplete","evidence":[]}]';
        }
      } else if (mode === "stage-durable-history") {
        writeFileSync(join(own, "durable-history-prompt"), text);
        output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"history captured for inspection","evidence":[]}]';
      } else if (mode === "stage-durable-complete") {
        output = text.includes("Human input:")
          ? '[{"tag":"STAGE_COMPLETED","completion":{"stage":"R1","outcome":"CONFIRMED"},"artifactRefIds":[]}]'
          : text.includes("Owning-stage durable decision evidence across attempts") &&
            text.includes("Use the canonical authority.") &&
            text.includes("Which authority governs?") &&
            text.includes("A new attempt, unrelated adoption or prior chat answer alone is not coverage")
            ? '[{"tag":"AGENT_MESSAGE_FINAL","text":"prior durable decision requires current coverage","evidence":[]}]'
            : '[{"tag":"HUMAN_INPUT_REQUESTED","category":"AUTHORITY_DECISION","question":"Which authority governs?"}]';
      } else if (mode === "stage-invalid-batch") {
        output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"one","evidence":[]},{"tag":"AGENT_MESSAGE_FINAL","text":"two","evidence":[]}]';
      } else if (mode === "stage-invalid-r1" || mode === "stage-bound-r1") {
        const bindingPath = join(own, "binding-id");
        const bindingId = existsSync(bindingPath)
          ? readFileSync(bindingPath, "utf8").trim()
          : "";
        output = JSON.stringify([{
          tag: "STAGE_COMPLETED",
          completion: { stage: "R1", outcome: "CONFIRMED" },
          artifactRefIds: bindingId.length === 0 ? [] : [bindingId],
        }]);
      } else if (mode === "stage-empty-output" || mode === "stage-complete-delay") {
        output = '[{"tag":"STAGE_COMPLETED","completion":{"stage":"R1","outcome":"CONFIRMED"},"artifactRefIds":[]}]';
      } else if (mode === "stage-plan-complete") {
        const bindingPath = join(own, "binding-id");
        const bindingId = existsSync(bindingPath)
          ? readFileSync(bindingPath, "utf8").trim()
          : "";
        output = JSON.stringify([{
          tag: "STAGE_COMPLETED",
          completion: { stage: "PLAN", outcome: "ACCEPTED" },
          artifactRefIds: bindingId.length === 0 ? [] : [bindingId],
        }]);
      } else if (mode === "stage-r3-ready") {
        const bindingPath = join(own, "binding-id");
        const bindingId = existsSync(bindingPath)
          ? readFileSync(bindingPath, "utf8").trim()
          : "";
        output = JSON.stringify([{
          tag: "STAGE_COMPLETED",
          completion: { stage: "R3", outcome: "READY_FOR_SIGNOFF" },
          artifactRefIds: bindingId.length === 0 ? [] : [bindingId],
        }]);
      } else {
        output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"ok","evidence":[]}]';
      }

      const now = Date.now();
      session.messages.push({
        id: body.id,
        type: "user",
        text,
        time: { created: now },
      });
      session.messages.push({
        id: "msg_assistant_" + (++nextAssistant),
        type: "assistant",
        agent: "build",
        model: session.model,
        time: { created: now, completed: now },
        content: [{ type: "text", text: output }],
      });
      session.messages.push({
        id: "msg_idle_" + nextAssistant,
        type: "idle",
        outcome: "succeeded",
        time: { created: now },
      });
      session.time.idle = Math.max(now, (session.time.idle ?? 0) + 1);
      session.time.updated = now;
      session.outcome = "succeeded";
      return json({ data: { id: body.id, type: "user", payload: { text } } });
    }
    if (request.method === "GET" && suffix === "context") {
      return json({ data: session.messages });
    }
    if (request.method === "POST" && suffix === "interrupt") {
      session.time.idle = Math.max(Date.now(), (session.time.idle ?? 0) + 1);
      session.outcome = "interrupted";
      return json({ interrupted: true });
    }
    return json({ message: "not found" }, 404);
  },
});

console.log("server listening on http://127.0.0.1:" + server.port);
await new Promise(() => {});
`;

const createFakeOpenCode = (mode = "fix"): string => {
  const root = tempDir("order-daemon-opencode-");
  const binary = join(root, "opencode");
  writeFileSync(binary, fakeOpenCode, { mode: 0o755 });
  chmodSync(binary, 0o755);
  writeFileSync(join(root, "mode"), mode);
  return binary;
};

const bunEval = (
  code: string,
  environment: Record<string, string> = {},
  timeout = 120_000,
): unknown => {
  const result = spawnSync("bun", ["--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, ...environment },
    timeout,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout.trim());
};

const providerEnvironment = (
  binary: string,
  stateRoot: string,
): Record<string, string> => ({
  PONTIVUS_ORDER_STATE_ROOT: stateRoot,
  PONTIVUS_ORDER_OPENCODE_BIN: binary,
  PONTIVUS_ORDER_OPENCODE_MODEL: "opencode/glm-5.3-flash-free",
});

const seedSignoffScript = (
  repositoryRoot: string,
  stateRoot: string,
  beforeSignoff = "",
  approvedBy = "human",
  schemaId: "change-v1" | "change-v2" = "change-v1",
  planMarkdown: string | null = null,
): string => {
  const workItemRoot = join(repositoryRoot, "docs", "order", "work-items");
  mkdirSync(workItemRoot, { recursive: true });
  return `
  const sql = await import("./src/shell/sqlite.ts");
  const sourceCore = await import("./src/core/work-item-source.ts");
  const sourceShell = await import("./src/shell/work-item-source.ts");
  const rt = await import("./src/shell/runtime.ts");
  const repo = await import("./src/shell/repository.ts");
  const coord = await import("./src/daemon/coordinator.ts");
  const authority = await import("./src/daemon/authority.ts");
  const runStore = await import("./src/daemon/run.ts");

  const database = sql.openOrderDatabase(${JSON.stringify(stateRoot)});
  const repositoryRoot = ${JSON.stringify(repositoryRoot)};
  const runtime = coord.createCoordinatorRuntime(
    database,
    ${JSON.stringify(stateRoot)},
    process.env,
    {
      version: 4,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [repositoryRoot],
      referenceRoots: [],
    },
  );
  const work = "work_11111111-1111-4111-8111-111111111111";
  const timestamp = "2026-11-11T04:00:00.000Z";

  const sourceMarkdown = sourceCore.renderWorkItemSourceMarkdown(
    {
      formatVersion: 1,
      id: work,
      projectId: "fixture",
      concernIds: ["shell"],
      schemaId: ${JSON.stringify(schemaId)},
    },
    "fixture",
  );
  const createdSource = sourceShell.createWorkItemSourceFile(
    repositoryRoot,
    "docs/order/work-items",
    work,
    sourceMarkdown,
  );
  const source = sourceShell.readWorkItemSource(
    repositoryRoot,
    createdSource.path,
  );
  const stagePaths = ${schemaId === "change-v2"
    ? `Object.fromEntries(["R1", "R2", "DESIGN", "PLAN", "R3"].map((stage) => [stage, sourceCore.workItemDocumentPath("docs/order/work-items", work, stage)]))`
    : JSON.stringify({ R1: "docs/r1.md", R2: "docs/r2.md", DESIGN: "docs/design.md", PLAN: "docs/plan.md", R3: "docs/r3.md" })};
  ${schemaId === "change-v2"
    ? `for (const [stage, markdown] of Object.entries(${JSON.stringify({
        R1: currentV2StageFixture("R1"), R2: currentV2StageFixture("R2"),
        DESIGN: currentV2StageFixture("DESIGN"), PLAN: planMarkdown ?? vacuousCurrentV2Plan,
        R3: currentV2StageFixture("R3"),
      })})) await Bun.write(repositoryRoot + "/" + stagePaths[stage], markdown);`
    : planMarkdown === null ? "" : `await Bun.write(repositoryRoot + "/docs/plan.md", ${JSON.stringify(planMarkdown)});`}
  for (const argv of [
    ["git", "add", "--", createdSource.path${schemaId === "change-v2" ? ", ...Object.values(stagePaths)" : planMarkdown === null ? "" : ', "docs/plan.md"'}],
    ["git", "commit", "-qm", "seed WorkItem source"],
  ]) {
    const result = Bun.spawnSync(argv, {
      cwd: repositoryRoot,
      stdout: "pipe",
      stderr: "pipe",
    });
    if (result.exitCode !== 0) {
      throw new TypeError(
        "failed to commit WorkItem source fixture: " +
          new TextDecoder().decode(result.stderr),
      );
    }
  }
  const baseline = await repo.resolveHeadCommit(repositoryRoot);
  sql.storeWorkItem(database, {
    id: work,
    projectId: "fixture",
    repositoryRoot,
    title: source.title,
    origin: "DISCOVERED",
    schemaId: source.metadata.schemaId,
    sourcePath: source.path,
    sourceSha256: source.sha256,
    derivedFromWorkItemId: null,
    stage: "AWAITING_SIGNOFF",
    status: "ACTIVE",
    outcome: null,
    concernIds: source.metadata.concernIds,
    createdAt: timestamp,
  });

  const seedWorkItem = coord.getWorkItem(runtime, work);
  const outputs = {
    R1: await authority.currentFileArtifact(runtime, seedWorkItem, stagePaths.R1, "R1", "P1"),
    R2: await authority.currentFileArtifact(runtime, seedWorkItem, stagePaths.R2, "R2", "P3"),
    DESIGN: await authority.currentFileArtifact(runtime, seedWorkItem, stagePaths.DESIGN, "DESIGN", "P6"),
    PLAN: await authority.currentFileArtifact(runtime, seedWorkItem, stagePaths.PLAN, "PLAN", "P7"),
    R3: await authority.currentFileArtifact(runtime, seedWorkItem, stagePaths.R3, "R3", "P7"),
  };

  const conform = async (stage, output) => {
    const state = await authority.resolveStageContextState(runtime, seedWorkItem, stage, true, output);
    if (state.staleStage !== null) throw new TypeError("fixture upstream context is stale: " + state.staleStage);
    const context = state.context;
    const run = runStore.insertRun(runtime, {
      id: rt.newRunId(),
      workItemId: work,
      executionTaskId: null,
      stage,
      mode: "INTERACTIVE",
      role: "STAGE",
      triggerEventId: null,
      status: "COMPLETED",
      attempt: runStore.nextAttempt(runtime, work, stage, null),
      baselineCommit: baseline,
      contextHash: context.contextHash,
      providerSessionId: null,
      terminalClassification: null,
      startedAt: timestamp,
      endedAt: timestamp,
    });
    sql.withTransaction(database, () => {
      for (const dependency of context.artifacts) {
        if (dependency.id !== output.id) {
          sql.storeArtifactDependency(database, output.id, dependency.id);
        }
      }
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_COMPLETED",
        completion: { stage, outcome: stage === "R1" ? "CONFIRMED" : stage === "R3" ? "READY_FOR_SIGNOFF" : "ACCEPTED" },
        artifactRefIds: [output.id],
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "CONFORMANCE_PASSED",
        stage,
        outputArtifactRefIds: [output.id],
        contextHash: context.contextHash,
        evidence: [],
      });
    });
  };

  await conform("R1", outputs.R1);
  await conform("R2", outputs.R2);
  await conform("DESIGN", outputs.DESIGN);
  await conform("PLAN", outputs.PLAN);
  await conform("R3", outputs.R3);

  ${beforeSignoff}

  const prepared = await coord.computeSignoffPackage(runtime, work);
  const approval = await coord.signOffWorkItem(
    runtime,
    work,
    prepared.packageHash,
    ${JSON.stringify(approvedBy)},
  );
`;
};

describe("daemon control plane", () => {
  it("admits only authenticated canonical loopback readiness in the installed setup owner", () => {
    const state = tempDir("order-installer-readiness-");
    const result = bunEval(`
      const setup = await import("./src/shell/setup.ts");
      const runtime = await import("./src/shell/runtime.ts");
      const token = runtime.loadOrCreateDaemonToken(${JSON.stringify(state)});
      let body = { ready: true, blockers: [] };
      let status = 200;
      let redirected = false;
      let authenticated = true;
      const server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
        authenticated &&= request.method === "GET" &&
          new URL(request.url).pathname === "/api/settings/readiness" &&
          request.headers.get("authorization") === "Bearer " + token;
        if (redirected) return Response.redirect("http://127.0.0.1:" + server.port + "/unexpected");
        return Response.json(body, { status });
      } });
      const env = { ...process.env, PONTIVUS_ORDER_STATE_ROOT: ${JSON.stringify(state)},
        PONTIVUS_ORDER_BIND: "127.0.0.1:" + server.port };
      const failures = [];
      const reject = async (environment = env) => {
        try { await setup.requireFreshInstallerReadiness(environment); failures.push(null); }
        catch (error) { failures.push(String(error)); }
      };
      try {
        await setup.requireFreshInstallerReadiness(env);
        body = { ready: false, blockers: ["OPENCODE_ACCOUNT_REQUIRED"] };
        await reject();
        body = { ready: true, blockers: ["MODEL_INVALID"] };
        await reject();
        body = { ready: true, blockers: [], secret: token };
        await reject();
        status = 503;
        await reject();
        status = 200;
        redirected = true;
        await reject();
        redirected = false;
        await reject({ ...env, PONTIVUS_ORDER_BIND: "example.com:7347" });
        await reject({ ...env, PONTIVUS_ORDER_BIND: "127.0.0.1:7347/extra" });
        let report = "";
        await setup.reportEstablishedInstallerReadiness(env, (line) => report += line);
        console.log(JSON.stringify({ failures, authenticated, report, leaked: JSON.stringify(failures).includes(token) || report.includes(token) }));
      } finally { server.stop(true); }
    `) as { failures: (string | null)[]; authenticated: boolean; report: string; leaked: boolean };
    expect(result.authenticated).toBe(true);
    expect(result.failures).toHaveLength(7);
    expect(result.failures.every((failure) => failure !== null)).toBe(true);
    expect(result.failures[0]).toContain("OPENCODE_ACCOUNT_REQUIRED");
    expect(result.report).toContain("could not be confirmed");
    expect(result.leaked).toBe(false);
  }, 30_000);

  it("observes only the exact prospective conformed closure without persisting an Approval", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-prospective-closure-");
    const output = bunEval(seedSignoffScript(repository, state, `
      const changes = () => database.query("SELECT total_changes() AS n").get().n;
      const before = changes();
      const prospective = await coord.computeSignoffPackage(runtime, work);
      const members = await coord.observeSignoffPackageArtifacts(runtime, work, prospective.packageHash);
      const again = await coord.observeSignoffPackageArtifacts(runtime, work, prospective.packageHash);
      let mismatch = false;
      try { await coord.observeSignoffPackageArtifacts(runtime, work, rt.sha256Text("other package")); }
      catch (error) { mismatch = String(error).includes("identity changed"); }
      const proof = {
        ids: members.map(member => member.id).sort(),
        expected: [...new Set([outputs.R3.id, ...authority.dependencyClosure(runtime, outputs.R3.id)])].sort(),
        hasPlan: members.some(member => member.id === outputs.PLAN.id),
        same: JSON.stringify(members) === JSON.stringify(again),
        mismatch,
        observational: before === changes(),
      };
    `) + `
      const beforeSignedRead = changes();
      let unavailableAfterApproval = false;
      try { await coord.observeSignoffPackageArtifacts(runtime, work, prospective.packageHash); }
      catch { unavailableAfterApproval = true; }
      console.log(JSON.stringify({...proof, unavailableAfterApproval, signedReadObservational: beforeSignedRead === changes()}));
      database.close();
    `) as {ids:string[];expected:string[];hasPlan:boolean;same:boolean;mismatch:boolean;observational:boolean;unavailableAfterApproval:boolean;signedReadObservational:boolean};
    expect(output.ids).toEqual(output.expected);
    expect(output.hasPlan).toBe(true);
    expect(output.same).toBe(true);
    expect(output.mismatch).toBe(true);
    expect(output.observational).toBe(true);
    expect(output.unavailableAfterApproval).toBe(true);
    expect(output.signedReadObservational).toBe(true);
  }, 30_000);

  it("observes exact Approval identity, immutable membership and successful final task aggregate", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-approval-observation-");
    const output = bunEval(seedSignoffScript(repository, state) + `
      const current = await coord.observeCurrentApproval(runtime, work);
      const history = coord.observeApprovalHistory(runtime, work);
      const members = await coord.observeApprovalArtifacts(runtime, work, approval.id);
      sql.updateWorkItemLifecycle(database, work, { stage: "PLAN", status: "ACTIVE", outcome: null });
      const returned = await coord.observeCurrentApproval(runtime, work);
      sql.updateWorkItemLifecycle(database, work, { stage: "COMPLETE", status: "COMPLETE", outcome: "ALREADY_SATISFIED" });
      let missing = false;
      try { await coord.observeCurrentApproval(runtime, work); } catch { missing = true; }
      database.query("UPDATE executionTasks SET state = 'ALREADY_SATISFIED' WHERE approvalId = ?1").run(approval.id);
      const final = await coord.observeCurrentApproval(runtime, work);
      const terminalRun = () => {
        const run = runStore.insertRun(runtime, {
          id: rt.newRunId(), workItemId: work, executionTaskId: null,
          stage: "R1", role: "STAGE", mode: "INTERACTIVE", triggerEventId: null,
          status: "COMPLETED", attempt: runStore.nextAttempt(runtime, work, "R1", null),
          baselineCommit: baseline, contextHash: rt.sha256Text("terminal-r1"),
          providerSessionId: null, terminalClassification: null, startedAt: timestamp, endedAt: timestamp,
        });
        runStore.appendRunEvent(runtime, run.id, {
          tag: "STAGE_COMPLETED", completion: { stage: "R1", outcome: "ALREADY_SATISFIED" },
          artifactRefIds: [outputs.R1.id],
        });
        runStore.appendRunEvent(runtime, run.id, {
          tag: "CONFORMANCE_PASSED", stage: "R1", outputArtifactRefIds: [outputs.R1.id],
          contextHash: run.contextHash, evidence: [],
        });
      };
      terminalRun();
      const terminal = await coord.observeCurrentApproval(runtime, work);
      const retainedHistory = coord.observeApprovalHistory(runtime, work).map((value) => value.id);
      terminalRun();
      let ambiguous = false;
      try { await coord.observeCurrentApproval(runtime, work); } catch { ambiguous = true; }
      console.log(JSON.stringify({
        current: current?.id, approval: approval.id, history: history.map((value) => value.id),
        roots: members.some((value) => value.id === approval.planArtifactRefId) &&
          members.some((value) => value.id === approval.r3ArtifactRefId),
        returned, missing, final: final?.id, terminal, retainedHistory, ambiguous,
      }));
      database.close();
    `) as { current: string; approval: string; history: string[]; roots: boolean; returned: null; missing: boolean; final: string; terminal: null; retainedHistory: string[]; ambiguous: boolean };
    expect(output.current).toBe(output.approval);
    expect(output.history).toEqual([output.approval]);
    expect(output.roots).toBe(true);
    expect(output.returned).toBeNull();
    expect(output.missing).toBe(true);
    expect(output.final).toBe(output.approval);
    expect(output.terminal).toBeNull();
    expect(output.retainedHistory).toEqual([output.approval]);
    expect(output.ambiguous).toBe(true);
  }, 30_000);

  it("rejects missing or injected signed closure membership without mutating observations", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-signed-membership-");
    const output = bunEval(seedSignoffScript(repository, state) + `
      const fs = await import("node:fs");
      const members = await coord.observeApprovalArtifacts(runtime, work, approval.id);
      const material = members.find(member => member.role === "VERIFICATION_MATERIAL");
      if (!material) throw new Error("fixture signed verification material missing");
      const edges = database.query("SELECT artifactRefId, dependsOnArtifactRefId FROM artifactDependencies WHERE dependsOnArtifactRefId=?1").all(material.id);
      if (edges.length === 0) throw new Error("fixture signed dependency missing");
      database.query("DELETE FROM artifactDependencies WHERE dependsOnArtifactRefId=?1").run(material.id);
      const changes = () => database.query("SELECT total_changes() AS n").get().n;
      const rejection = async (id = work) => {
        const before = changes();
        let error = null;
        try { await coord.observeApprovalArtifacts(runtime, id, approval.id); }
        catch (failure) { error = String(failure); }
        return { error, observational: changes() === before };
      };
      const missing = await rejection();
      for (const edge of edges) sql.storeArtifactDependency(database, edge.artifactRefId, edge.dependsOnArtifactRefId);
      const extra = await authority.currentFileArtifact(runtime, coord.getWorkItem(runtime, work), "src/target.ts", "GOVERNANCE", "P1");
      sql.storeArtifactDependency(database, approval.r3ArtifactRefId, extra.id);
      const injected = await rejection();
      database.query("DELETE FROM artifactDependencies WHERE artifactRefId=?1 AND dependsOnArtifactRefId=?2")
        .run(approval.r3ArtifactRefId, extra.id);
      const other = await coord.createWorkItem(runtime, {
        projectId: "fixture", schemaId: "change-v1", title: "other work", concernIds: [],
      });
      const foreign = await rejection(other.id);
      sql.updateWorkItemLifecycle(database, work, { stage: "PLAN", status: "ACTIVE", outcome: null });
      fs.appendFileSync(repositoryRoot + "/AGENTS.md", "\\nchanged working authority\\n");
      const before = changes();
      const historical = await coord.observeApprovalArtifacts(runtime, work, approval.id);
      const current = await coord.observeCurrentApproval(runtime, work);
      const unchanged = changes() === before;
      console.log(JSON.stringify({ missing, injected, foreign, current, unchanged,
        sameMembership: JSON.stringify(historical.map(member => member.id).sort()) ===
          JSON.stringify(members.map(member => member.id).sort()),
        stage: coord.getWorkItem(runtime, work).stage }));
      database.close();
    `) as {
      missing: { error: string | null; observational: boolean };
      injected: { error: string | null; observational: boolean };
      foreign: { error: string | null; observational: boolean };
      current: null; unchanged: boolean; sameMembership: boolean; stage: string;
    };
    expect(output.missing.error).toContain("signed package hash");
    expect(output.injected.error).toContain("signed package hash");
    expect(output.foreign.error).toContain("Approval does not exist for WorkItem");
    expect(output.missing.observational && output.injected.observational && output.foreign.observational).toBe(true);
    expect(output.current).toBeNull();
    expect(output.unchanged && output.sameMembership).toBe(true);
    expect(output.stage).toBe("PLAN");
  }, 30_000);

  it.each(["bare", "reversed", "wrong-context", "duplicate", "return"] as const)(
    "does not admit sign-off from defective R3 completion evidence: %s", fault => {
      const repository = createRepository();
      const state = tempDir("order-daemon-exact-r3-");
      const output = bunEval(seedSignoffScript(repository, state, `
        const r3 = outputs.R3;
        const context = await authority.resolveStageContextState(runtime, seedWorkItem, "R3", true, r3);
        const run = runStore.insertRun(runtime, {
          id: rt.newRunId(), workItemId: work, executionTaskId: null,
          stage: "R3", role: "STAGE", mode: "INTERACTIVE", triggerEventId: null,
          status: "COMPLETED", attempt: runStore.nextAttempt(runtime, work, "R3", null),
          baselineCommit: baseline, contextHash: context.context.contextHash,
          providerSessionId: null, terminalClassification: null, startedAt: timestamp, endedAt: timestamp,
        });
        const fault = ${JSON.stringify(fault)};
        const completion = () => runStore.appendRunEvent(runtime, run.id, {
          tag: "STAGE_COMPLETED", completion: { stage: "R3", outcome: fault === "return" ? "RETURN_TO_PLAN" : "READY_FOR_SIGNOFF" },
          artifactRefIds: [r3.id],
        });
        if (fault !== "bare" && fault !== "reversed") completion();
        runStore.appendRunEvent(runtime, run.id, {
          tag: "CONFORMANCE_PASSED", stage: "R3", outputArtifactRefIds: [r3.id],
          contextHash: fault === "wrong-context" ? rt.sha256Text("wrong context") : run.contextHash, evidence: [],
        });
        if (fault === "reversed" || fault === "duplicate") completion();
        let error = null;
        try { await coord.computeSignoffPackage(runtime, work); } catch (failure) { error = String(failure); }
        console.log(JSON.stringify({ error, stage: coord.getWorkItem(runtime, work).stage,
          history: coord.observeApprovalHistory(runtime, work).length }));
        database.close();
        process.exit(0);
      `)) as { error: string | null; stage: string; history: number };
      expect(output.error).toMatch(/conformance is missing or stale|no conformed R3 root/);
      expect(output.stage).toBe("AWAITING_SIGNOFF");
      expect(output.history).toBe(0);
    }, 30_000);

  it("labels configured STAGE reference roots as read-only non-authoritative context", async () => {
    const repository = createRepository();
    const sourceMarkdown = `---
{
  "formatVersion": 1,
  "id": "work_11111111-1111-4111-8111-111111111111",
  "projectId": "fixture",
  "concernIds": [],
  "schemaId": "change-v1"
}
---
# reference roots

## Requested outcome

## Current context

## Constraints/non-goals

## Evidence/references
`;
    const output = bunEval(`
      const stage = await import("./src/daemon/stage.ts");
      const prompt = await stage.stagePrompt(
        {
          id: "work_11111111-1111-4111-8111-111111111111",
          projectId: "fixture",
          repositoryRoot: ${JSON.stringify(repository)},
          title: "reference roots",
          origin: "test",
          schemaId: "change-v1",
          sourcePath: "docs/order/work-items/work_11111111-1111-4111-8111-111111111111/work-request.md",
          sourceSha256: "sha256:" + "a".repeat(64),
          derivedFromWorkItemId: null,
          stage: "R1",
          status: "ACTIVE",
          outcome: null,
          concernIds: [],
          createdAt: "2026-11-11T04:00:00.000Z",
        },
        "R1",
        {
          source: {
            path: "docs/order/work-items/work_11111111-1111-4111-8111-111111111111/work-request.md",
            sha256: "sha256:" + "a".repeat(64),
            metadata: {
              formatVersion: 1,
              id: "work_11111111-1111-4111-8111-111111111111",
              projectId: "fixture",
              concernIds: [],
              schemaId: "change-v1",
            },
            markdown: ${JSON.stringify(sourceMarkdown)},
          },
          authority: {
            layers: [],
            inheritedDefaultRuleIds: [],
            overrides: [],
            extensions: [],
            fitnessGateIdsByDefaultRuleId: [],
            fitnessGateIds: [],
            authorityRefs: [],
          },
          artifacts: [],
          p1Paths: [],
          contextHash: "sha256:" + "a".repeat(64),
        },
        [],
        ["/home/test/reference"],
      );
      console.log(JSON.stringify(prompt));
    `) as string;

    expect(output).toContain("Configured external reference roots (read-only, non-authoritative):");
    expect(output).toContain("/home/test/reference");
    expect(output).toContain("They are not project authority");
  });

  it("accepts only the fixed CLI grammar and loopback bind grammar", () => {
    const output = bunEval(`
      const cli = await import("./src/cli.ts");
      const server = await import("./src/daemon/server.ts");
      const stdout = [];
      const stderr = [];
      const invalid = await cli.runCli(["signoff"], process.env, (x) => stdout.push(x), (x) => stderr.push(x));
      const incomplete = await cli.runCli(["provider", "login"], process.env, (x) => stdout.push(x), (x) => stderr.push(x));
      let nonLoopbackRejected = false;
      try { server.resolveDaemonBind("0.0.0.0:7347"); } catch { nonLoopbackRejected = true; }
      console.log(JSON.stringify({
        invalid,
        incomplete,
        stderr,
        ipv4: server.resolveDaemonBind("127.0.0.1:7347"),
        ipv6: server.resolveDaemonBind("[::1]:7347"),
        nonLoopbackRejected,
      }));
    `) as {
      invalid: number;
      incomplete: number;
      stderr: string[];
      nonLoopbackRejected: boolean;
      ipv4: { hostname: string; port: number };
      ipv6: { hostname: string; port: number };
    };

    expect(output.invalid).toBe(2);
    expect(output.incomplete).toBe(2);
    expect(output.stderr).toHaveLength(2);
    expect(output.ipv4).toMatchObject({ hostname: "127.0.0.1", port: 7347 });
    expect(output.ipv6).toMatchObject({ hostname: "::1", port: 7347 });
    expect(output.nonLoopbackRejected).toBe(true);
  });

  it("classifies canonical HTTP failures without leaking unexpected daemon detail", () => {
    const output = bunEval(`
      const contracts = await import("./src/core/contracts.ts");
      const server = await import("./src/daemon/server.ts");

      const malformed = server.classifyHttpFailure(
        Object.assign(new TypeError("invalid request"), { orderHttpStatus: 400 }),
      );
      const absent = server.classifyHttpFailure(new TypeError("WorkItem does not exist"));
      const conflict = server.classifyHttpFailure(new TypeError("WorkItem is not awaiting sign-off"));
      const unexpected = server.classifyHttpFailure(new Error("secret internal detail"));
      let unexpectedSchema;
      try {
        contracts.WorkItemSchema.parse({});
      } catch (error) {
        unexpectedSchema = server.classifyHttpFailure(error);
      }
      const staleWithoutOwnerAccepted = contracts.OrderHttpErrorSchema.safeParse({
        code: "STALE_AUTHORITY",
        message: "stale",
        sourceDiagnostic: null,
        staleAuthorityOwner: null,
      }).success;
      const mixedRecoveryOwnersAccepted = contracts.OrderHttpErrorSchema.safeParse({
        code: "STALE_AUTHORITY",
        message: "stale",
        sourceDiagnostic: {
          projectId: "fixture",
          path: null,
          workItemId: null,
          code: "MISSING_SOURCE",
          detail: "missing",
        },
        staleAuthorityOwner: "PLAN",
      }).success;
      console.log(JSON.stringify({
        malformed,
        absent,
        conflict,
        unexpected,
        unexpectedSchema,
        staleWithoutOwnerAccepted,
        mixedRecoveryOwnersAccepted,
      }));
    `) as {
      malformed: { status: number; code: string; message: string; sourceDiagnostic: unknown; staleAuthorityOwner: unknown };
      absent: { status: number; code: string; message: string; sourceDiagnostic: unknown; staleAuthorityOwner: unknown };
      conflict: { status: number; code: string; message: string; sourceDiagnostic: unknown; staleAuthorityOwner: unknown };
      unexpected: { status: number; code: string; message: string; sourceDiagnostic: unknown; staleAuthorityOwner: unknown };
      unexpectedSchema: { status: number; code: string; message: string; sourceDiagnostic: unknown; staleAuthorityOwner: unknown };
      staleWithoutOwnerAccepted: boolean;
      mixedRecoveryOwnersAccepted: boolean;
    };

    expect(output.malformed).toMatchObject({
      status: 400,
      code: "INVALID_REQUEST",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.absent).toEqual({
      status: 404,
      code: "NOT_FOUND",
      message: "WorkItem does not exist",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.conflict).toEqual({
      status: 409,
      code: "CURRENT_STATE_CONFLICT",
      message: "WorkItem is not awaiting sign-off",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.unexpected).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Internal daemon error",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.unexpected.message).not.toContain("secret internal detail");
    expect(output.unexpectedSchema).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Internal daemon error",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.staleWithoutOwnerAccepted).toBe(false);
    expect(output.mixedRecoveryOwnersAccepted).toBe(false);
  });

  it("preserves the exact canonical source diagnostic on HTTP conflict classification", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-http-source-conflict-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const server = await import("./src/daemon/server.ts");
      const repository = ${JSON.stringify(repository)};
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "source conflict",
        concernIds: ["shell"],
      });
      fs.unlinkSync(path.join(repository, created.sourcePath));
      let classified = null;
      try {
        await coord.getWorkItemSource(runtime, created.id);
      } catch (error) {
        classified = server.classifyHttpFailure(error);
      }
      console.log(JSON.stringify({ created, classified }));
      database.close();
    `) as {
      created: { id: string; projectId: string; sourcePath: string };
      classified: {
        status: number;
        code: string;
        message: string;
        sourceDiagnostic: {
          projectId: string;
          path: string | null;
          workItemId: string;
          code: string;
          detail: string;
        };
        staleAuthorityOwner: null;
      };
    };

    expect(output.classified).toMatchObject({
      status: 409,
      code: "WORK_ITEM_SOURCE_CONFLICT",
      sourceDiagnostic: {
        projectId: output.created.projectId,
        path: null,
        workItemId: output.created.id,
        code: "MISSING_SOURCE",
      },
      staleAuthorityOwner: null,
    });
    expect(output.classified.message).toBe(output.classified.sourceDiagnostic.detail);
  });

  it("boots with valid incomplete v4 configuration and with a drifted configured repository", () => {
    mkdirSync(join(process.cwd(), "dist"), { recursive: true });
    writeFileSync(join(process.cwd(), "dist", "index.html"), "<!doctype html><title>Order</title>");
    distOwned = true;
    const binary = createFakeOpenCode();

    const emptyState = tempDir("order-daemon-empty-v4-");
    const empty = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const srv = await import("./src/daemon/server.ts");
      cfg.writeOrderConfig(${JSON.stringify(emptyState)}, cfg.buildOrderConfig(null, [], []));
      const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("x") });
      const port = probe.port;
      probe.stop(true);
      const daemon = await srv.startOrderDaemon({
        ...process.env,
        PONTIVUS_ORDER_STATE_ROOT: ${JSON.stringify(emptyState)},
        PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)},
        PONTIVUS_ORDER_BIND: "127.0.0.1:" + port,
      });
      try {
        const readiness = await (await import("./src/daemon/settings.ts")).installationReadiness(
          (await import("./src/daemon/settings.ts")).createCoordinatorRuntimeOwner(daemon.coordinator),
        );
        console.log(JSON.stringify({
          config: daemon.coordinator.config,
          schedulerStopped: daemon.coordinator.schedulerStopped,
          readiness,
        }));
      } finally {
        await daemon.stop();
      }
    `, providerEnvironment(binary, emptyState)) as {
      config: { version: number; model: unknown; repositoryRoots: string[] };
      schedulerStopped: boolean;
      readiness: { ready: boolean; blockers: string[] };
    };
    expect(empty.config).toMatchObject({ version: 4, model: null, repositoryRoots: [] });
    expect(empty.schedulerStopped).toBe(false);
    expect(empty.readiness.ready).toBe(false);
    expect(empty.readiness.blockers).toContain("REPOSITORY_REQUIRED");
    expect(empty.readiness.blockers).toContain("MODEL_INVALID");

    const repository = createRepository("drifted");
    const driftState = tempDir("order-daemon-drift-v4-");
    const driftConfig = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      cfg.writeOrderConfig(
        ${JSON.stringify(driftState)},
        cfg.buildOrderConfig(
          { providerID: "opencode", id: "glm-5.3-flash-free" },
          [${JSON.stringify(repository)}],
          [],
        ),
      );
      console.log(JSON.stringify(cfg.readOrderConfig(${JSON.stringify(driftState)})));
    `) as { version: number };
    expect(driftConfig.version).toBe(4);
    rmSync(repository, { recursive: true, force: true });

    const drift = bunEval(`
      const srv = await import("./src/daemon/server.ts");
      const settings = await import("./src/daemon/settings.ts");
      const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("x") });
      const port = probe.port;
      probe.stop(true);
      const daemon = await srv.startOrderDaemon({
        ...process.env,
        PONTIVUS_ORDER_STATE_ROOT: ${JSON.stringify(driftState)},
        PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)},
        PONTIVUS_ORDER_BIND: "127.0.0.1:" + port,
      });
      try {
        const repositories = await settings.connectedRepositoryStates(daemon.coordinator.config);
        console.log(JSON.stringify({ repositories, schedulerStopped: daemon.coordinator.schedulerStopped }));
      } finally {
        await daemon.stop();
      }
    `, providerEnvironment(binary, driftState)) as {
      repositories: Array<{ status: string; attention: string[] }>;
      schedulerStopped: boolean;
    };
    expect(drift.repositories).toEqual([expect.objectContaining({
      status: "ATTENTION",
      attention: ["REPOSITORY_UNAVAILABLE"],
    })]);
    expect(drift.schedulerStopped).toBe(false);
  });

  it("blocks account removal during active Runs and reports account-required readiness after final removal", () => {
    const repository = createRepository("account-removal");
    const state = tempDir("order-account-removal-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const shellRuntime = await import("./src/shell/runtime.ts");
      const daemonRuntime = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const accounts = await import("./src/daemon/opencode-account.ts");
      const settings = await import("./src/daemon/settings.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const config = cfg.buildOrderConfig(
        { providerID: "opencode", id: "glm-5.3-flash-free" },
        [${JSON.stringify(repository)}],
        [],
      );
      cfg.writeOrderConfig(${JSON.stringify(state)}, config);
      const runtime = daemonRuntime.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        config,
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const created = await coord.createWorkItem(runtime, {
        projectId: "account-removal",
        schemaId: "change-v1",
        title: "Account removal admission",
        concernIds: ["shell"],
      });
      const baseline = await repo.resolveHeadCommit(${JSON.stringify(repository)});
      const active = runStore.insertRun(runtime, {
        id: shellRuntime.newRunId(),
        workItemId: created.id, executionTaskId: null, stage: "R1",
        mode: "INTERACTIVE", role: "STAGE", triggerEventId: null, status: "RUNNING",
        attempt: 1, baselineCommit: baseline, contextHash: "sha256:" + "a".repeat(64),
        providerSessionId: null, terminalClassification: null,
        startedAt: "2026-11-13T09:00:00.000Z", endedAt: null,
      });
      let blocked = null;
      try {
        await accounts.removeSavedOpenCodeAccount(runtime, "credential_fixture", {
          expectedActiveAccountId: "credential_fixture",
        });
      } catch (error) { blocked = error instanceof Error ? error.message : String(error); }
      const afterBlocked = await accounts.openCodeAccountState(runtime);
      runStore.updateRun(runtime, active.id, { status: "CANCELLED", endedAt: "2026-11-13T09:01:00.000Z" });
      const removed = await accounts.removeSavedOpenCodeAccount(runtime, "credential_fixture", {
        expectedActiveAccountId: "credential_fixture",
      });
      const readiness = await settings.installationReadiness(owner);
      console.log(JSON.stringify({ blocked, afterBlocked, removed, readiness }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      blocked: string | null;
      afterBlocked: { accounts: unknown[]; activeAccountId: string | null };
      removed: { accounts: unknown[]; activeAccountId: string | null };
      readiness: { ready: boolean; blockers: string[] };
    };
    expect(output.blocked).toContain("ACTIVE_RUN");
    expect(output.afterBlocked.accounts).toHaveLength(1);
    expect(output.afterBlocked.activeAccountId).toBe("credential_fixture");
    expect(output.removed.accounts).toEqual([]);
    expect(output.removed.activeAccountId).toBeNull();
    expect(output.readiness.ready).toBe(false);
    expect(output.readiness.blockers).toContain("OPENCODE_ACCOUNT_REQUIRED");
  });

  it("keeps ready repository work admissible when an unrelated configured repository needs attention", () => {
    const readyRepository = createRepository("settings-ready");
    const driftedRepository = createRepository("settings-drifted-unrelated");
    const state = tempDir("order-settings-affected-readiness-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");
      const fs = await import("node:fs");

      cfg.writeOrderConfig(
        ${JSON.stringify(state)},
        cfg.buildOrderConfig(
          { providerID: "opencode", id: "glm-5.3-flash-free" },
          [${JSON.stringify(readyRepository)}, ${JSON.stringify(driftedRepository)}],
          [],
        ),
      );
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      fs.rmSync(${JSON.stringify(driftedRepository)}, { recursive: true, force: true });
      const created = await coord.createWorkItem(
        runtime,
        {
          projectId: "settings-ready",
          schemaId: "change-v1",
          title: "Affected readiness only",
          concernIds: ["shell"],
        },
        [${JSON.stringify(readyRepository)}],
      );
      await coord.reconcileSources(runtime, [${JSON.stringify(readyRepository)}]);

      const global = await settings.installationReadiness(owner);
      let stageFailure = null;
      try {
        await settings.requireStageRunReadiness(owner, created.id);
      } catch (error) {
        stageFailure = error instanceof Error ? error.message : String(error);
      }
      const executionRoots = await settings.executionReadyRepositoryRoots(owner);
      console.log(JSON.stringify({
        global,
        stageFailure,
        executionRoots,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      global: { ready: boolean; blockers: string[] };
      stageFailure: string | null;
      executionRoots: string[];
    };

    expect(output.global.ready).toBe(false);
    expect(output.global.blockers).toContain("REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION");
    expect(output.stageFailure).toBeNull();
    expect(output.executionRoots).toEqual([readyRepository]);
  });

  it("activates connected repositories through immutable runtime replacement and rejects stale config identity", () => {
    const repository = createRepository("settings-connect");
    const state = tempDir("order-settings-connect-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(${JSON.stringify(state)}, cfg.buildOrderConfig(null, [], []));
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});
      const activated = await settings.connectRepository(owner, {
        expectedConfigSha256: before.sha256,
        repositoryRoot: ${JSON.stringify(repository)},
      });
      let stale = null;
      try {
        await settings.disconnectRepository(owner, {
          expectedConfigSha256: before.sha256,
          repositoryRoot: ${JSON.stringify(repository)},
        });
      } catch (error) {
        stale = error instanceof Error ? error.message : String(error);
      }
      const after = cfg.readOrderConfigState(${JSON.stringify(state)});
      console.log(JSON.stringify({
        runtimeReplaced: owner.current !== runtime,
        oldSchedulerStopped: runtime.schedulerStopped,
        oldSchedulerArmed: runtime.schedulerTimer !== null,
        candidateSchedulerStopped: owner.current.schedulerStopped,
        candidateSchedulerArmed: owner.current.schedulerTimer !== null,
        mutationActive: owner.settingsMutationActive,
        activated,
        activeConfig: owner.current.config,
        persisted: after,
        stale,
      }));
      await (await import("./src/daemon/coordinator.ts")).stopCoordinatorScheduler(owner.current);
      database.close();
    `, providerEnvironment(binary, state)) as {
      runtimeReplaced: boolean;
      oldSchedulerStopped: boolean;
      oldSchedulerArmed: boolean;
      candidateSchedulerStopped: boolean;
      candidateSchedulerArmed: boolean;
      mutationActive: boolean;
      activeConfig: { repositoryRoots: string[] };
      persisted: { config: { repositoryRoots: string[] } };
      stale: string | null;
    };

    expect(output.runtimeReplaced).toBe(true);
    expect(output.oldSchedulerStopped).toBe(true);
    expect(output.oldSchedulerArmed).toBe(false);
    expect(output.candidateSchedulerStopped).toBe(false);
    expect(output.candidateSchedulerArmed).toBe(true);
    expect(output.mutationActive).toBe(false);
    expect(output.activeConfig.repositoryRoots).toEqual([repository]);
    expect(output.persisted.config.repositoryRoots).toEqual([repository]);
    expect(output.stale).toContain("changed since it was loaded");
  });

  it("retains disconnected repository history while removing it from productive work projection", () => {
    const repository = createRepository("settings-disconnect");
    const state = tempDir("order-settings-disconnect-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(
        ${JSON.stringify(state)},
        cfg.buildOrderConfig(null, [${JSON.stringify(repository)}], []),
      );
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const created = await coord.createWorkItem(runtime, {
        projectId: "settings-disconnect",
        schemaId: "change-v1",
        title: "Retain history",
        concernIds: ["shell"],
      });
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});
      await settings.disconnectRepository(owner, {
        expectedConfigSha256: before.sha256,
        repositoryRoot: ${JSON.stringify(repository)},
      });
      console.log(JSON.stringify({
        createdId: created.id,
        visible: coord.listWorkItems(owner.current).map((item) => item.id),
        stored: sql.loadWorkItems(database).map((item) => item.id),
      }));
      await coord.stopCoordinatorScheduler(owner.current);
      database.close();
    `, providerEnvironment(binary, state)) as {
      createdId: string;
      visible: string[];
      stored: string[];
    };

    expect(output.visible).toEqual([]);
    expect(output.stored).toEqual([output.createdId]);
  });

  it("blocks Settings activation during coordinator admission and leaves persisted config unchanged", () => {
    const repository = createRepository("settings-blocked");
    const state = tempDir("order-settings-blocked-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");
      cfg.writeOrderConfig(${JSON.stringify(state)}, cfg.buildOrderConfig(null, [], []));
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      runtime.tickActive = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});
      let failure = null;
      try {
        await settings.connectRepository(owner, {
          expectedConfigSha256: before.sha256,
          repositoryRoot: ${JSON.stringify(repository)},
        });
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }
      const after = cfg.readOrderConfigState(${JSON.stringify(state)});
      console.log(JSON.stringify({ failure, same: JSON.stringify(before) === JSON.stringify(after) }));
      database.close();
    `, providerEnvironment(binary, state)) as { failure: string | null; same: boolean };

    expect(output.failure).toContain("coordinator work is being admitted");
    expect(output.same).toBe(true);
  });

  it("restores the old config/runtime when activation fails after candidate reconciliation", () => {
    const repository = createRepository("settings-rollback");
    const state = tempDir("order-settings-rollback-");
    const missingBinary = join(state, "missing-opencode");

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(${JSON.stringify(state)}, cfg.buildOrderConfig(null, [], []));
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(missingBinary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});
      let failure = null;
      try {
        await settings.connectRepository(owner, {
          expectedConfigSha256: before.sha256,
          repositoryRoot: ${JSON.stringify(repository)},
        });
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }
      const after = cfg.readOrderConfigState(${JSON.stringify(state)});
      console.log(JSON.stringify({
        failure,
        sameRuntime: owner.current === runtime,
        sameConfig: JSON.stringify(after) === JSON.stringify(before),
        mutationActive: owner.settingsMutationActive,
        schedulerStopped: runtime.schedulerStopped,
      }));
      database.close();
    `) as {
      failure: string | null;
      sameRuntime: boolean;
      sameConfig: boolean;
      mutationActive: boolean;
      schedulerStopped: boolean;
    };

    expect(output.failure).not.toBeNull();
    expect(output.sameRuntime).toBe(true);
    expect(output.sameConfig).toBe(true);
    expect(output.mutationActive).toBe(false);
    expect(output.schedulerStopped).toBe(true);
  });

  it("rejects unavailable model changes without mutating canonical config", () => {
    const state = tempDir("order-settings-model-preflight-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(${JSON.stringify(state)}, cfg.buildOrderConfig(null, [], []));
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});
      let failure = null;
      try {
        await settings.updateConfiguredModel(owner, {
          expectedConfigSha256: before.sha256,
          model: { providerID: "opencode", id: "not-available" },
        });
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }
      const after = cfg.readOrderConfigState(${JSON.stringify(state)});
      console.log(JSON.stringify({
        failure,
        same: JSON.stringify(before) === JSON.stringify(after),
        sameRuntime: owner.current === runtime,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      failure: string | null;
      same: boolean;
      sameRuntime: boolean;
    };

    expect(output.failure).toContain("not currently available");
    expect(output.same).toBe(true);
    expect(output.sameRuntime).toBe(true);
  });

  it("blocks Settings activation during OpenCode login/account mutation", () => {
    const repository = createRepository("settings-account-blocker");
    const state = tempDir("order-settings-account-blocker-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(${JSON.stringify(state)}, cfg.buildOrderConfig(null, [], []));
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});

      runtime.openCodeAccountMutationActive = true;
      let mutationFailure = null;
      try {
        await settings.connectRepository(owner, {
          expectedConfigSha256: before.sha256,
          repositoryRoot: ${JSON.stringify(repository)},
        });
      } catch (error) {
        mutationFailure = error instanceof Error ? error.message : String(error);
      }
      runtime.openCodeAccountMutationActive = false;

      runtime.openCodeAccountLogin = {
        id: "00000000-0000-4000-8000-000000000001",
        providerAttemptId: "provider-attempt",
        process: {},
        label: "fixture@example.com",
        authorizationUrl: "https://opencode.ai/console",
        instructions: "fixture",
        expiresAt: "2026-11-13T08:00:00.000Z",
      };
      let loginFailure = null;
      try {
        await settings.connectRepository(owner, {
          expectedConfigSha256: before.sha256,
          repositoryRoot: ${JSON.stringify(repository)},
        });
      } catch (error) {
        loginFailure = error instanceof Error ? error.message : String(error);
      }
      runtime.openCodeAccountLogin = null;

      const after = cfg.readOrderConfigState(${JSON.stringify(state)});
      console.log(JSON.stringify({
        mutationFailure,
        loginFailure,
        same: JSON.stringify(before) === JSON.stringify(after),
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      mutationFailure: string | null;
      loginFailure: string | null;
      same: boolean;
    };

    expect(output.mutationFailure).toContain("OpenCode account state is changing");
    expect(output.loginFailure).toContain("OpenCode login is active");
    expect(output.same).toBe(true);
  });

  it("rediscovers retained WorkItems after reconnecting the same repository", () => {
    const repository = createRepository("settings-reconnect");
    const state = tempDir("order-settings-reconnect-");
    const binary = createFakeOpenCode();

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(
        ${JSON.stringify(state)},
        cfg.buildOrderConfig(null, [${JSON.stringify(repository)}], []),
      );
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const created = await coord.createWorkItem(runtime, {
        projectId: "settings-reconnect",
        schemaId: "change-v1",
        title: "Reconnect retained work",
        concernIds: ["shell"],
      });

      const first = cfg.readOrderConfigState(${JSON.stringify(state)});
      await settings.disconnectRepository(owner, {
        expectedConfigSha256: first.sha256,
        repositoryRoot: ${JSON.stringify(repository)},
      });
      const hidden = coord.listWorkItems(owner.current).map((item) => item.id);

      const second = cfg.readOrderConfigState(${JSON.stringify(state)});
      await settings.connectRepository(owner, {
        expectedConfigSha256: second.sha256,
        repositoryRoot: ${JSON.stringify(repository)},
      });
      const visible = coord.listWorkItems(owner.current).map((item) => item.id);
      console.log(JSON.stringify({ createdId: created.id, hidden, visible }));
      await coord.stopCoordinatorScheduler(owner.current);
      database.close();
    `, providerEnvironment(binary, state)) as {
      createdId: string;
      hidden: string[];
      visible: string[];
    };

    expect(output.hidden).toEqual([]);
    expect(output.visible).toEqual([output.createdId]);
  });


  it("blocks Settings activation while a Run is active", () => {
    const repository = createRepository("settings-active-run");
    const candidateRepository = createRepository("settings-active-run-candidate");
    const state = tempDir("order-settings-active-run-");

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");

      cfg.writeOrderConfig(
        ${JSON.stringify(state)},
        cfg.buildOrderConfig(null, [${JSON.stringify(repository)}], []),
      );
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const work = await coord.createWorkItem(runtime, {
        projectId: "settings-active-run",
        schemaId: "change-v1",
        title: "Block Settings while active",
        concernIds: ["shell"],
      });
      sql.storeRun(database, {
        id: "run_77777777-7777-4777-8777-777777777777",
        workItemId: work.id,
        executionTaskId: null,
        stage: "IDEA",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: "sha256:" + "7".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-13T08:00:00.000Z",
        endedAt: null,
      });
      const before = cfg.readOrderConfigState(${JSON.stringify(state)});
      let failure = null;
      try {
        await settings.connectRepository(owner, {
          expectedConfigSha256: before.sha256,
          repositoryRoot: ${JSON.stringify(candidateRepository)},
        });
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }
      const after = cfg.readOrderConfigState(${JSON.stringify(state)});
      console.log(JSON.stringify({
        failure,
        same: JSON.stringify(before) === JSON.stringify(after),
        sameRuntime: owner.current === runtime,
      }));
      database.close();
    `) as { failure: string | null; same: boolean; sameRuntime: boolean };

    expect(output.failure).toContain("Order Run is active");
    expect(output.same).toBe(true);
    expect(output.sameRuntime).toBe(true);
  });

  it("serves the replacement runtime immediately after a Settings HTTP mutation", () => {
    const repository = createRepository("settings-http-swap");
    const state = tempDir("order-settings-http-swap-");
    const binary = createFakeOpenCode();
    mkdirSync(join(process.cwd(), "dist"), { recursive: true });
    writeFileSync(join(process.cwd(), "dist", "index.html"), "<!doctype html><title>Order</title>");
    distOwned = true;

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const shellRuntime = await import("./src/shell/runtime.ts");
      const rt = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");
      const srv = await import("./src/daemon/server.ts");

      cfg.writeOrderConfig(${JSON.stringify(state)}, cfg.buildOrderConfig(null, [], []));
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const initial = rt.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        { ...process.env, PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)} },
        cfg.readOrderConfig(${JSON.stringify(state)}),
      );
      initial.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(initial);
      const daemonToken = shellRuntime.loadOrCreateDaemonToken(${JSON.stringify(state)});
      const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("x") });
      const port = probe.port;
      probe.stop(true);
      const bind = srv.resolveDaemonBind("127.0.0.1:" + port);
      const http = srv.startDaemonServer(owner, daemonToken, bind);
      const origin = bind.origin;
      try {
        const minted = await fetch(origin + "/api/auth/connect-token", {
          method: "POST",
          headers: {
            authorization: "Bearer " + daemonToken,
            "content-type": "application/json",
          },
          body: "{}",
        }).then((response) => response.json());
        const connected = await fetch(origin + "/connect?token=" + minted.token, { redirect: "manual" });
        const cookie = connected.headers.get("set-cookie");
        const before = await fetch(origin + "/api/settings/config", { headers: { cookie } }).then(
          (response) => response.json(),
        );
        const readinessPath = origin + "/api/settings/readiness";
        const browserReadiness = await fetch(readinessPath, { headers: { cookie } });
        const bearerReadiness = await fetch(readinessPath, { headers: { authorization: "Bearer " + daemonToken } });
        const sameReadiness = JSON.stringify(await browserReadiness.json()) === JSON.stringify(await bearerReadiness.json());
        const unauthenticated = await fetch(readinessPath);
        const wrongBearer = await fetch(readinessPath, { headers: { authorization: "Bearer invalid" } });
        const otherSettings = await fetch(origin + "/api/settings/config", { headers: { authorization: "Bearer " + daemonToken } });
        const wrongMethod = await fetch(readinessPath, { method: "POST", headers: { authorization: "Bearer " + daemonToken } });
        const unchanged = await fetch(origin + "/api/settings/config", { headers: { cookie } }).then((response) => response.json());
        const readinessProof = {
          browser: browserReadiness.status, bearer: bearerReadiness.status, sameReadiness,
          unauthenticated: unauthenticated.status, wrongBearer: wrongBearer.status,
          otherSettings: otherSettings.status, wrongMethod: wrongMethod.status,
          unchanged: unchanged.sha256 === before.sha256 && owner.current === initial,
        };
        const mutation = await fetch(origin + "/api/settings/repositories/connect", {
          method: "POST",
          headers: { cookie, origin, "content-type": "application/json" },
          body: JSON.stringify({
            expectedConfigSha256: before.sha256,
            repositoryRoot: ${JSON.stringify(repository)},
          }),
        });
        const mutationBody = await mutation.json();
        const after = await fetch(origin + "/api/settings/config", { headers: { cookie } }).then(
          (response) => response.json(),
        );
        console.log(JSON.stringify({
          mutationStatus: mutation.status,
          readinessProof,
          mutationBody,
          runtimeReplaced: owner.current !== initial,
          after,
        }));
      } finally {
        http.server.stop(true);
        await (await import("./src/daemon/coordinator.ts")).stopCoordinatorScheduler(owner.current);
        database.close();
      }
    `, providerEnvironment(binary, state)) as {
      mutationStatus: number;
      readinessProof: { browser: number; bearer: number; sameReadiness: boolean; unauthenticated: number; wrongBearer: number; otherSettings: number; wrongMethod: number; unchanged: boolean };
      runtimeReplaced: boolean;
      after: { config: { repositoryRoots: string[] } };
    };

    expect(output.mutationStatus).toBe(200);
    expect(output.runtimeReplaced).toBe(true);
    expect(output.readinessProof).toMatchObject({
      browser: 200, bearer: 200, sameReadiness: true,
      unauthenticated: 401, wrongBearer: 401, otherSettings: 401, unchanged: true,
    });
    expect(output.readinessProof.wrongMethod).toBeGreaterThanOrEqual(400);
    expect(output.after.config.repositoryRoots).toEqual([repository]);
  });

  it("migrates a repository WorkItem document root without rewriting history or bytes", () => {
    const repository = createRepository("document-root");
    const state = tempDir("order-document-root-migration-");
    const targetRoot = "docs/order/migrated-work-items";

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const core = await import("./src/core/work-item-source.ts");
      const project = await import("./src/shell/project.ts");
      const repo = await import("./src/shell/repository.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const shellRuntime = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");
      const daemonRuntime = await import("./src/daemon/runtime.ts");
      const settings = await import("./src/daemon/settings.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = daemonRuntime.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: null,
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const created = await coord.createWorkItem(runtime, {
        projectId: "document-root",
        schemaId: "change-v1",
        title: "Migrate document root",
        concernIds: ["shell"],
      });

      const oldRoot = "docs/order/work-items";
      const planPath = core.workItemDocumentPath(oldRoot, created.id, "PLAN");
      fs.mkdirSync(path.dirname(path.join(${JSON.stringify(repository)}, planPath)), { recursive: true });
      const planBytes = "# migration plan\\nexact bytes\\n";
      fs.writeFileSync(path.join(${JSON.stringify(repository)}, planPath), planBytes);
      const historical = await authority.currentFileArtifact(
        runtime,
        created,
        planPath,
        "PLAN",
        "P7",
      );
      const baseline = await repo.resolveHeadCommit(${JSON.stringify(repository)});
      const run = runStore.insertRun(runtime, {
        id: shellRuntime.newRunId(),
        workItemId: created.id,
        executionTaskId: null,
        stage: "PLAN",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "COMPLETED",
        attempt: 1,
        baselineCommit: baseline,
        contextHash: "sha256:" + "c".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-13T08:00:00.000Z",
        endedAt: "2026-11-13T08:00:00.000Z",
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_COMPLETED", completion: { stage: "PLAN", outcome: "ACCEPTED" },
        artifactRefIds: [historical.id],
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "CONFORMANCE_PASSED",
        stage: "PLAN",
        outputArtifactRefIds: [historical.id],
        contextHash: run.contextHash,
        evidence: [],
      });

      const beforeManifest = await project.readValidatedProjectManifestSnapshot(
        ${JSON.stringify(repository)},
      );
      const beforeManifestBytes = fs.readFileSync(
        path.join(${JSON.stringify(repository)}, "pontivus-order.toml"),
        "utf8",
      );
      const beforeSource = await coord.getWorkItemSource(runtime, created.id);
      const beforeSourceBytes = fs.readFileSync(
        path.join(${JSON.stringify(repository)}, beforeSource.path),
        "utf8",
      );

      const migrated = await settings.migrateWorkItemDocumentRoot(owner, {
        repositoryRoot: ${JSON.stringify(repository)},
        expectedManifestSha256: beforeManifest.sha256,
        targetWorkItemsRoot: ${JSON.stringify(targetRoot)},
      });

      const after = coord.getWorkItem(runtime, created.id);
      const afterSource = await coord.getWorkItemSource(runtime, created.id);
      const afterSourceBytes = fs.readFileSync(
        path.join(${JSON.stringify(repository)}, afterSource.path),
        "utf8",
      );
      const afterPlanPath = core.workItemDocumentPath(
        ${JSON.stringify(targetRoot)},
        created.id,
        "PLAN",
      );
      const afterPlanBytes = fs.readFileSync(
        path.join(${JSON.stringify(repository)}, afterPlanPath),
        "utf8",
      );
      const diagnostics = (await coord.getWorkItemSourceDiagnostics(runtime))
        .filter((diagnostic) => diagnostic.workItemId === created.id);
      const currentLifecycle = await coord.listCurrentLifecycleArtifacts(runtime, created.id);
      const allArtifacts = coord.listArtifacts(runtime, created.id);
      const afterManifest = await project.readValidatedProjectManifestSnapshot(
        ${JSON.stringify(repository)},
      );
      const afterManifestBytes = fs.readFileSync(
        path.join(${JSON.stringify(repository)}, "pontivus-order.toml"),
        "utf8",
      );

      console.log(JSON.stringify({
        migrated,
        createdId: created.id,
        afterSourcePath: after.sourcePath,
        sourceBytesEqual: beforeSourceBytes === afterSourceBytes,
        planBytesEqual: planBytes === afterPlanBytes,
        oldRootExists: fs.existsSync(path.join(${JSON.stringify(repository)}, oldRoot)),
        targetRootExists: fs.existsSync(path.join(${JSON.stringify(repository)}, ${JSON.stringify(targetRoot)})),
        diagnostics,
        historical: { id: historical.id, path: historical.repositoryPath },
        allArtifacts: allArtifacts.map((artifact) => ({ id: artifact.id, path: artifact.repositoryPath, role: artifact.role })),
        currentLifecycle: currentLifecycle.map((artifact) => ({ id: artifact.id, path: artifact.repositoryPath, role: artifact.role })),
        beforeManifestBytes,
        afterManifestBytes,
        afterManifestRoot: afterManifest.manifest.workItems.root,
      }));
      database.close();
    `) as {
      migrated: { status: string; workItemsRoot: string; manifestSha256: string };
      createdId: string;
      afterSourcePath: string;
      sourceBytesEqual: boolean;
      planBytesEqual: boolean;
      oldRootExists: boolean;
      targetRootExists: boolean;
      diagnostics: unknown[];
      historical: { id: string; path: string };
      allArtifacts: Array<{ id: string; path: string; role: string }>;
      currentLifecycle: Array<{ id: string; path: string; role: string }>;
      beforeManifestBytes: string;
      afterManifestBytes: string;
      afterManifestRoot: string;
    };

    expect(output.migrated).toMatchObject({ status: "READY", workItemsRoot: targetRoot });
    expect(output.afterSourcePath).toBe(
      `${targetRoot}/${output.createdId}/work-request.md`,
    );
    expect(output.sourceBytesEqual).toBe(true);
    expect(output.planBytesEqual).toBe(true);
    expect(output.oldRootExists).toBe(false);
    expect(output.targetRootExists).toBe(true);
    expect(output.diagnostics).toEqual([]);
    expect(output.afterManifestRoot).toBe(targetRoot);
    expect(output.beforeManifestBytes).toContain('projectId = "document-root"');
    expect(output.afterManifestBytes).toContain('projectId = "document-root"');
    expect(output.allArtifacts).toContainEqual(expect.objectContaining(output.historical));
    expect(output.currentLifecycle).toEqual([
      expect.objectContaining({
        path: `${targetRoot}/${output.createdId}/implementation-plan.md`,
        role: "PLAN",
      }),
    ]);
    expect(output.allArtifacts).toContainEqual(expect.objectContaining({
      path: `${targetRoot}/${output.createdId}/implementation-plan.md`,
      role: "PLAN",
    }));
    const migratedPlan = output.allArtifacts.find((artifact) =>
      artifact.role === "PLAN" &&
      artifact.path === `${targetRoot}/${output.createdId}/implementation-plan.md`
    );
    expect(migratedPlan?.id).not.toBe(output.historical.id);
  });

  it("rejects stale/conflicting document-root changes and active repository work without mutation", () => {
    const repository = createRepository("document-root-admission");
    const state = tempDir("order-document-root-admission-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const project = await import("./src/shell/project.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const shellRuntime = await import("./src/shell/runtime.ts");
      const daemonRuntime = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");
      const repo = await import("./src/shell/repository.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = daemonRuntime.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: null,
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const created = await coord.createWorkItem(runtime, {
        projectId: "document-root-admission",
        schemaId: "change-v1",
        title: "Migration admission",
        concernIds: ["shell"],
      });
      const manifest = await project.readValidatedProjectManifestSnapshot(
        ${JSON.stringify(repository)},
      );
      const manifestPath = path.join(${JSON.stringify(repository)}, "pontivus-order.toml");
      const originalManifest = fs.readFileSync(manifestPath, "utf8");

      let stale = null;
      try {
        await settings.migrateWorkItemDocumentRoot(owner, {
          repositoryRoot: ${JSON.stringify(repository)},
          expectedManifestSha256: "sha256:" + "0".repeat(64),
          targetWorkItemsRoot: "docs/order/stale-target",
        });
      } catch (error) {
        stale = error instanceof Error ? error.message : String(error);
      }

      const conflictRoot = path.join(${JSON.stringify(repository)}, "docs/order/conflict-target");
      fs.mkdirSync(conflictRoot, { recursive: true });
      fs.writeFileSync(path.join(conflictRoot, "conflict.txt"), "not the governed tree\\n");
      let conflict = null;
      try {
        await settings.migrateWorkItemDocumentRoot(owner, {
          repositoryRoot: ${JSON.stringify(repository)},
          expectedManifestSha256: manifest.sha256,
          targetWorkItemsRoot: "docs/order/conflict-target",
        });
      } catch (error) {
        conflict = error instanceof Error ? error.message : String(error);
      }
      fs.rmSync(conflictRoot, { recursive: true, force: true });

      sql.updateWorkItemLifecycle(database, created.id, {
        stage: "EXECUTION",
        status: "ACTIVE",
        outcome: null,
      });
      let execution = null;
      try {
        await settings.migrateWorkItemDocumentRoot(owner, {
          repositoryRoot: ${JSON.stringify(repository)},
          expectedManifestSha256: manifest.sha256,
          targetWorkItemsRoot: "docs/order/execution-target",
        });
      } catch (error) {
        execution = error instanceof Error ? error.message : String(error);
      }

      sql.updateWorkItemLifecycle(database, created.id, {
        stage: "PLAN",
        status: "ACTIVE",
        outcome: null,
      });
      const baseline = await repo.resolveHeadCommit(${JSON.stringify(repository)});
      sql.storeRun(database, {
        id: shellRuntime.newRunId(),
        workItemId: created.id,
        executionTaskId: null,
        stage: "PLAN",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "WAITING_FOR_INPUT",
        attempt: 1,
        baselineCommit: baseline,
        contextHash: "sha256:" + "d".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-13T08:00:00.000Z",
        endedAt: null,
      });
      let activeRun = null;
      try {
        await settings.migrateWorkItemDocumentRoot(owner, {
          repositoryRoot: ${JSON.stringify(repository)},
          expectedManifestSha256: manifest.sha256,
          targetWorkItemsRoot: "docs/order/run-target",
        });
      } catch (error) {
        activeRun = error instanceof Error ? error.message : String(error);
      }

      console.log(JSON.stringify({
        stale,
        conflict,
        execution,
        activeRun,
        manifestUnchanged: fs.readFileSync(manifestPath, "utf8") === originalManifest,
        oldRootExists: fs.existsSync(path.join(${JSON.stringify(repository)}, "docs/order/work-items")),
        staleTargetExists: fs.existsSync(path.join(${JSON.stringify(repository)}, "docs/order/stale-target")),
        executionTargetExists: fs.existsSync(path.join(${JSON.stringify(repository)}, "docs/order/execution-target")),
        runTargetExists: fs.existsSync(path.join(${JSON.stringify(repository)}, "docs/order/run-target")),
      }));
      database.close();
    `) as Record<string, unknown>;

    expect(String(output.stale)).toContain("manifest changed");
    expect(String(output.conflict)).toContain("conflicting bytes");
    expect(String(output.execution)).toContain("EXECUTION");
    expect(String(output.activeRun)).toContain("active Run");
    expect(output.manifestUnchanged).toBe(true);
    expect(output.oldRootExists).toBe(true);
    expect(output.staleTargetExists).toBe(false);
    expect(output.executionTargetExists).toBe(false);
    expect(output.runTargetExists).toBe(false);
  });

  it("rolls back repository bytes when activation fails after manifest mutation", () => {
    const repository = createRepository("document-root-rollback");
    const state = tempDir("order-document-root-rollback-");
    const targetRoot = "docs/order/rollback-target";

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const project = await import("./src/shell/project.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const daemonRuntime = await import("./src/daemon/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = daemonRuntime.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: null,
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      runtime.schedulerStopped = true;
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const created = await coord.createWorkItem(runtime, {
        projectId: "document-root-rollback",
        schemaId: "change-v1",
        title: "Rollback migration",
        concernIds: ["shell"],
      });
      const beforeManifest = await project.readValidatedProjectManifestSnapshot(
        ${JSON.stringify(repository)},
      );
      const manifestPath = path.join(${JSON.stringify(repository)}, "pontivus-order.toml");
      const beforeManifestBytes = fs.readFileSync(manifestPath, "utf8");
      const beforeSource = coord.getWorkItem(runtime, created.id);
      database.query(
        "UPDATE workItemSources SET sourcePath='docs/order/work-items/wrong/work-request.md' WHERE workItemId=?1",
      ).run(created.id);

      let failure = null;
      try {
        await settings.migrateWorkItemDocumentRoot(owner, {
          repositoryRoot: ${JSON.stringify(repository)},
          expectedManifestSha256: beforeManifest.sha256,
          targetWorkItemsRoot: ${JSON.stringify(targetRoot)},
        });
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }

      console.log(JSON.stringify({
        failure,
        manifestRestored: fs.readFileSync(manifestPath, "utf8") === beforeManifestBytes,
        oldRootExists: fs.existsSync(path.join(${JSON.stringify(repository)}, "docs/order/work-items")),
        targetExists: fs.existsSync(path.join(${JSON.stringify(repository)}, ${JSON.stringify(targetRoot)})),
        mutationActive: owner.settingsMutationActive,
        storedPath: database.query("SELECT sourcePath FROM workItemSources WHERE workItemId=?1")
          .get(created.id).sourcePath,
        beforeSourcePath: beforeSource.sourcePath,
      }));
      database.close();
    `) as {
      failure: string | null;
      manifestRestored: boolean;
      oldRootExists: boolean;
      targetExists: boolean;
      mutationActive: boolean;
      storedPath: string;
      beforeSourcePath: string;
    };

    expect(output.failure).toContain("persisted WorkItem source path");
    expect(output.manifestRestored).toBe(true);
    expect(output.oldRootExists).toBe(true);
    expect(output.targetExists).toBe(false);
    expect(output.mutationActive).toBe(false);
    // The injected corrupt projection is intentionally retained; rollback must not invent its prior value.
    expect(output.storedPath).toContain("/wrong/work-request.md");
  });

  it("enforces public-health-only, one-time connect, cookie auth, Origin, and no CORS", () => {
    const state = tempDir("order-daemon-http-");
        mkdirSync(join(process.cwd(), "dist"), { recursive: true });
    writeFileSync(join(process.cwd(), "dist", "index.html"), "<!doctype html><title>Order</title>");
    distOwned = true;

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const settings = await import("./src/daemon/settings.ts");
      const srv = await import("./src/daemon/server.ts");

      const state = ${JSON.stringify(state)};
      const database = sql.openOrderDatabase(state);
      const daemonToken = rt.loadOrCreateDaemonToken(state);
      const runtime = coord.createCoordinatorRuntime(
        database,
        state,
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [state],
          referenceRoots: [],
        },
      );
      const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response("x") });
      const port = probe.port;
      probe.stop(true);
      const bind = srv.resolveDaemonBind("127.0.0.1:" + port);
      const owner = settings.createCoordinatorRuntimeOwner(runtime);
      const http = srv.startDaemonServer(owner, daemonToken, bind);
      const origin = bind.origin;
      try {
        const health = await fetch(origin + "/api/health");
        const unauth = await fetch(origin + "/api/work-items");

        const minted = await fetch(origin + "/api/auth/connect-token", {
          method: "POST",
          headers: {
            "authorization": "Bearer " + daemonToken,
            "content-type": "application/json",
          },
          body: "{}",
        });
        const tokenBody = await minted.json();
        const connect = await fetch(origin + "/connect?token=" + tokenBody.token, { redirect: "manual" });
        const cookie = connect.headers.get("set-cookie");
        const reused = await fetch(origin + "/connect?token=" + tokenBody.token, { redirect: "manual" });

        const listed = await fetch(origin + "/api/work-items", { headers: { cookie } });
        const malformed = await fetch(origin + "/api/work-items", {
          method: "POST",
          headers: { cookie, origin, "content-type": "application/json" },
          body: "{",
        });
        const malformedBody = await malformed.json();
        const absent = await fetch(
          origin + "/api/work-items/work_00000000-0000-4000-8000-000000000000",
          { headers: { cookie } },
        );
        const absentBody = await absent.json();
        const invalidAuthorityReconcile = await fetch(
          origin + "/api/work-items/work_00000000-0000-4000-8000-000000000000/reconcile-authority",
          {
            method: "POST",
            headers: { cookie, origin, "content-type": "application/json" },
            body: JSON.stringify({ expectedOwner: "EXECUTION" }),
          },
        );
        const invalidAuthorityReconcileBody = await invalidAuthorityReconcile.json();
        const absentAuthorityReconcile = await fetch(
          origin + "/api/work-items/work_00000000-0000-4000-8000-000000000000/reconcile-authority",
          {
            method: "POST",
            headers: { cookie, origin, "content-type": "application/json" },
            body: JSON.stringify({ expectedOwner: "PLAN" }),
          },
        );
        const absentAuthorityReconcileBody = await absentAuthorityReconcile.json();
        const missingOrigin = await fetch(origin + "/api/tick", {
          method: "POST",
          headers: { cookie, "content-type": "application/json" },
          body: "{}",
        });
        const wrongOrigin = await fetch(origin + "/api/tick", {
          method: "POST",
          headers: { cookie, origin: "http://127.0.0.1:1", "content-type": "application/json" },
          body: "{}",
        });
        const tick = await fetch(origin + "/api/tick", {
          method: "POST",
          headers: { cookie, origin, "content-type": "application/json" },
          body: "{}",
        });
        const cliTick = await fetch(origin + "/api/tick", {
          method: "POST",
          headers: {
            "authorization": "Bearer " + daemonToken,
            "content-type": "application/json",
          },
          body: "{}",
        });

        const expiring = await fetch(origin + "/api/auth/connect-token", {
          method: "POST",
          headers: {
            "authorization": "Bearer " + daemonToken,
            "content-type": "application/json",
          },
          body: "{}",
        }).then((response) => response.json());
        http.sessions.connectTokens.set(expiring.token, Date.now() - 1);
        const expired = await fetch(origin + "/connect?token=" + expiring.token, { redirect: "manual" });

        console.log(JSON.stringify({
          healthStatus: health.status,
          healthBody: await health.json(),
          unauth: unauth.status,
          connectStatus: connect.status,
          location: connect.headers.get("location"),
          cache: connect.headers.get("cache-control"),
          referrer: connect.headers.get("referrer-policy"),
          cookie,
          reused: reused.status,
          listed: listed.status,
          malformedStatus: malformed.status,
          malformedBody,
          absentStatus: absent.status,
          absentBody,
          invalidAuthorityReconcileStatus: invalidAuthorityReconcile.status,
          invalidAuthorityReconcileBody,
          absentAuthorityReconcileStatus: absentAuthorityReconcile.status,
          absentAuthorityReconcileBody,
          missingOrigin: missingOrigin.status,
          wrongOrigin: wrongOrigin.status,
          tickStatus: tick.status,
          tickBody: await tick.json(),
          cliTickStatus: cliTick.status,
          cliTickBody: await cliTick.json(),
          expired: expired.status,
          cors: tick.headers.get("access-control-allow-origin"),
        }));
      } finally {
        http.server.stop(true);
        database.close();
      }
    `) as Record<string, unknown>;

    expect(output.healthStatus).toBe(200);
    expect(output.healthBody).toEqual({ status: "ok", version: orderVersion });
    expect(output.unauth).toBe(401);
    expect(output.connectStatus).toBe(303);
    expect(output.location).toBe("/");
    expect(output.cache).toBe("no-store");
    expect(output.referrer).toBe("no-referrer");
    expect(String(output.cookie)).toMatch(
      /^pontivus_order_session=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Strict$/,
    );
    expect(output.reused).toBe(401);
    expect(output.listed).toBe(200);
    expect(output.malformedStatus).toBe(400);
    expect(output.malformedBody).toEqual({
      code: "INVALID_REQUEST",
      message: "request body must contain valid JSON",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.absentStatus).toBe(404);
    expect(output.absentBody).toEqual({
      code: "NOT_FOUND",
      message: "WorkItem does not exist",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.invalidAuthorityReconcileStatus).toBe(400);
    expect(output.invalidAuthorityReconcileBody).toMatchObject({
      code: "INVALID_REQUEST",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.absentAuthorityReconcileStatus).toBe(404);
    expect(output.absentAuthorityReconcileBody).toEqual({
      code: "NOT_FOUND",
      message: "WorkItem does not exist",
      sourceDiagnostic: null,
      staleAuthorityOwner: null,
    });
    expect(output.missingOrigin).toBe(401);
    expect(output.wrongOrigin).toBe(401);
    expect(output.tickStatus).toBe(401);
    expect(output.tickBody).toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(output.cliTickStatus).toBe(409);
    expect(output.cliTickBody).toMatchObject({
      code: "CURRENT_STATE_CONFLICT",
    });
    expect(output.expired).toBe(401);
    expect(output.cors).toBeNull();
  });

  it("rejects sign-off when a signed task omits a concern-required gate", () => {
    const repository = createRepository();
    writeFileSync(
      join(repository, "docs", "plan.md"),
      fixturePlan.replace('"gateIds":["test"]', '"gateIds":[]'),
    );
    runGit(repository, "add", "docs/plan.md");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-missing-concern-gate-");
    const output = bunEval(`
      try {
        ${seedSignoffScript(repository, state)}
        console.log(JSON.stringify({ error: null }));
      } catch (error) {
        console.log(JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }));
      }
    `) as { error: string | null };

    expect(output.error).toBe("signed task omits concern-required gate: test");
  }, 30_000);

  it("reconciles orphan candidate evidence before charging interruption recovery", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-orphan-candidate-");
    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const execution = await import("./src/daemon/execution.ts");
      const tasks = await coord.listExecutionTasks(runtime, work);
      const task = tasks[0];
      if (!task) throw new Error("missing task");
      sql.setExecutionTaskState(database, task.id, "RUNNING");
      const runningTask = { ...task, state: "RUNNING" };
      const context = await authority.approvalContext(runtime, approval, runningTask, "BUILDER");
      const run = execution.createExecutionRun(
        runtime,
        coord.getWorkItem(runtime, work),
        runningTask,
        approval,
        "BUILDER",
        null,
        context.contextHash,
      );
      const workspace = execution.workspaceForRun(runtime, run.id);
      await repo.createFreshCheckout(repositoryRoot, workspace, approval.baselineCommit);
      await Bun.write(workspace + "/src/target.ts", "recovered candidate\\n");
      const capture = await repo.captureCandidate(workspace);
      rt.writeRunEvidenceBytes(
        ${JSON.stringify(state)},
        run.id,
        "candidate/patch.diff",
        capture.patch,
      );

      await coord.recoverInterruptedRuns(runtime);
      const recovered = coord.getRun(runtime, run.id);
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        status: recovered.status,
        terminalClassification: recovered.terminalClassification,
        candidateEvents: events.filter((event) => event.event.tag === "CANDIDATE_STATE_RECORDED").length,
      }));
    `) as {
      status: string;
      terminalClassification: string | null;
      candidateEvents: number;
    };

    expect(output).toEqual({
      status: "COMPLETED",
      terminalClassification: null,
      candidateEvents: 1,
    });
  }, 30_000);

  it("rejects WorkItems whose project is not one of the exact configured targets", () => {
    const repository = createRepository();
    const allowed = createRepository("allowed");
    const state = tempDir("order-daemon-root-policy-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(allowed)}],
          referenceRoots: [],
        },
      );
      let rejected = false;
      try {
        await coord.createWorkItem(runtime, {
          projectId: "fixture",
          schemaId: "change-v1",
          title: "outside",
          concernIds: ["shell"],
        });
      } catch {
        rejected = true;
      }
      console.log(JSON.stringify({ rejected, count: coord.listWorkItems(runtime).length }));
      database.close();
    `) as { rejected: boolean; count: number };

    expect(output).toEqual({ rejected: true, count: 0 });
    expect(repository).not.toBe(allowed);
  });


  it("returns a stage Run before the OpenCode turn completes", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-stage-start-visibility-");
    const binary = createFakeOpenCode("stage-delay");
    const providerStarted = join(binary, "..", "provider-started");
    const providerRelease = join(binary, "..", "provider-release");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "stage start visibility",
        concernIds: ["shell"],
      });
      const startPromise = coord.startStageRun(runtime, created.id, "INTERACTIVE");
      const result = await Promise.race([
        startPromise.then((run) => ({ returnedBeforeRelease: true, runId: run.id })),
        Bun.sleep(500).then(() => ({ returnedBeforeRelease: false, runId: null })),
      ]);
      const fs = await import("node:fs");
      for (let attempt = 0; attempt < 500 && !fs.existsSync(${JSON.stringify(providerStarted)}); attempt += 1) {
        await Bun.sleep(10);
      }
      const visibleRun = result.runId === null ? null : coord.getRun(runtime, result.runId);
      const startedEvent = visibleRun === null
        ? null
        : coord.listRunEvents(runtime, visibleRun.id)[0]?.event.tag ?? null;
      fs.writeFileSync(${JSON.stringify(providerRelease)}, "release");
      const run = result.runId === null
        ? await startPromise
        : visibleRun;
      await Promise.all([...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)));
      const current = coord.getRun(runtime, run.id);
      if (current.status === "RUNNING" || current.status === "WAITING_FOR_INPUT") {
        await coord.cancelRun(runtime, run.id);
      }
      console.log(JSON.stringify({
        returnedBeforeRelease: result.returnedBeforeRelease,
        startedEvent: startedEvent ?? coord.listRunEvents(runtime, run.id)[0]?.event.tag ?? null,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      returnedBeforeRelease: boolean;
      startedEvent: string | null;
    };

    expect(output).toEqual({
      returnedBeforeRelease: true,
      startedEvent: "STAGE_STARTED",
    });
  }, 30_000);


  it("rejects cross-project IDEA source reclassification outside the owning repository", () => {
    const originalRepository = createRepository("original");
    const reclassifiedRepository = createRepository("reclassified");
    const state = tempDir("order-daemon-r1-reclassification-");
    const workItemRoot = join(originalRepository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      const sourceCore = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [
            ${JSON.stringify(originalRepository)},
            ${JSON.stringify(reclassifiedRepository)},
          ],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "original",
        schemaId: "change-v1",
        title: "reclassify before R1",
        concernIds: ["shell"],
      });
      const source = sourceShell.readWorkItemSource(
        runtime.config.repositoryRoots[0],
        created.sourcePath,
      );
      const changedMarkdown = sourceCore.renderWorkItemSourceMarkdown(
        { ...source.metadata, projectId: "reclassified" },
        source.title,
      );
      sourceShell.replaceWorkItemSourceFile(
        runtime.config.repositoryRoots[0],
        source.path,
        source.sha256,
        changedMarkdown,
      );
      const reconciliation = await coord.reconcileSources(runtime);
      let startError = null;
      try {
        await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      } catch (error) {
        startError = error instanceof Error ? error.message : String(error);
      }
      const updated = coord.getWorkItem(runtime, created.id);
      console.log(JSON.stringify({
        codes: reconciliation.diagnostics.map((item) => item.code),
        projectId: updated.projectId,
        repositoryRoot: updated.repositoryRoot,
        startError,
        runCount: coord.listRuns(runtime, created.id).length,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      codes: string[];
      projectId: string;
      repositoryRoot: string;
      startError: string | null;
      runCount: number;
    };

    expect(output.codes).toContain("UNRESOLVED_PROJECT");
    expect(output.projectId).toBe("original");
    expect(output.repositoryRoot).toBe(originalRepository);
    expect(output.startError).toContain("reconciliation is required");
    expect(output.runCount).toBe(0);
  }, 30_000);

  it.each([
    ["investigation-v1", "INVESTIGATION_COMPLETE"],
    ["audit-v1", "AUDIT_COMPLETE"],
    ["investigation-v2", "DUPLICATE"],
    ["audit-v2", "ALREADY_SATISFIED"],
    ["audit-v2", "DUPLICATE"],
    ["investigation-v2", "ALREADY_SATISFIED"],
  ] as const)("enforces same-project %s %s lineage and delivery-only remediation", (parentSchemaId, parentOutcome) => {
    const repository = createRepository();
    const state = tempDir("order-daemon-remediation-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const sourceCore = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );

      const parentId = rt.newWorkItemId();
      const parentMarkdown = sourceCore.renderWorkItemSourceMarkdown({
        formatVersion: 1,
        id: parentId,
        projectId: "fixture",
        concernIds: ["shell"],
        schemaId: ${JSON.stringify(parentSchemaId)},
      }, "finished investigation");
      const created = sourceShell.createWorkItemSourceFile(runtime.config.repositoryRoots[0], "docs/order/work-items", parentId,
        parentMarkdown,
      );
      const parentSource = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], created.path,
      );
      sql.storeWorkItem(database, {
        id: parentId,
        projectId: "fixture",
        repositoryRoot: ${JSON.stringify(repository)},
        title: parentSource.title,
        origin: "DISCOVERED",
        schemaId: ${JSON.stringify(parentSchemaId)},
        sourcePath: parentSource.path,
        sourceSha256: parentSource.sha256,
        derivedFromWorkItemId: null,
        stage: "COMPLETE",
        status: "COMPLETE",
        outcome: ${JSON.stringify(parentOutcome)},
        concernIds: ["shell"],
        createdAt: rt.nowIsoDateTime(),
      });

      const child = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "remediate finding",
        concernIds: ["shell"],
        derivedFromWorkItemId: parentId,
      });

      let invalidChildRejected = false;
      try {
        await coord.createWorkItem(runtime, {
          projectId: "fixture",
          schemaId: "audit-v1",
          title: "not remediation",
          concernIds: ["shell"],
          derivedFromWorkItemId: parentId,
        });
      } catch {
        invalidChildRejected = true;
      }

      const selfId = rt.newWorkItemId();
      const selfMarkdown = sourceCore.renderWorkItemSourceMarkdown({
        formatVersion: 1,
        id: selfId,
        projectId: "fixture",
        concernIds: ["shell"],
        schemaId: "change-v1",
        derivedFromWorkItemId: selfId,
      }, "self linked");
      sourceShell.createWorkItemSourceFile(runtime.config.repositoryRoots[0], "docs/order/work-items", selfId, selfMarkdown);
      const reconciliation = await coord.reconcileSources(runtime);

      console.log(JSON.stringify({
        childParent: child.derivedFromWorkItemId,
        childSchema: child.schemaId,
        invalidChildRejected,
        selfCodes: reconciliation.diagnostics
          .map((item) => item.code),
      }));
      database.close();
    `) as {
      childParent: string | null;
      childSchema: string;
      invalidChildRejected: boolean;
      selfCodes: string[];
    };

    expect(output.childParent).toMatch(/^work_/);
    expect(output.childSchema).toBe("change-v1");
    expect(output.invalidChildRejected).toBe(true);
    expect(output.selfCodes).toContain("INVALID_SOURCE");
  });

  it("records causal admission evidence and applies no effects for a provider-success invalid STAGE batch", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-invalid-stage-batch-");
    const binary = createFakeOpenCode("stage-invalid-batch");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "invalid batch",
        concernIds: ["shell"],
      });
      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      await Promise.all([...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)));
      const settled = coord.getRun(runtime, run.id);
      const events = coord.listRunEvents(runtime, run.id);
      const diagnosticRefs = events
        .filter((event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED")
        .flatMap((event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED" ? event.event.evidence : []);
      const admissionRef = diagnosticRefs.find((ref) =>
        ref.relativePath.endsWith("/order-stage-batch-admission.json")
      );
      const admission = admissionRef === undefined
        ? null
        : JSON.parse(new TextDecoder().decode(
            rt.readRunEvidenceBytes(runtime.stateRoot, run.id, admissionRef.relativePath),
          ));
      const failure = events.findLast((event) => event.event.tag === "PROVIDER_FAILED");
      console.log(JSON.stringify({
        status: settled.status,
        classification: settled.terminalClassification,
        messages: events.filter((event) => event.event.tag === "AGENT_MESSAGE_FINAL").length,
        admission,
        failure: failure?.event ?? null,
      }));
      database.close();
    `, providerEnvironment(binary, state), 30_000) as {
      status: string;
      classification: string | null;
      messages: number;
      admission: {
        phase: string;
        code: string;
        eventTags: string[];
        truncated: boolean;
      } | null;
      failure: { tag: string; detail: string; evidence: Array<{ relativePath: string }> } | null;
    };

    expect(output.status).toBe("FAILED");
    expect(output.classification).toBe("PROVIDER_FAILURE");
    expect(output.messages).toBe(0);
    expect(output.admission).toEqual({
      phase: "ORDER_STAGE_BATCH_ADMISSION",
      code: "MULTIPLE_AGENT_MESSAGES",
      eventTags: ["AGENT_MESSAGE_FINAL", "AGENT_MESSAGE_FINAL"],
      truncated: false,
    });
    expect(output.failure).toMatchObject({
      tag: "PROVIDER_FAILED",
      detail: "Agent result could not be accepted",
    });
    expect(output.failure?.evidence.some((ref) =>
      ref.relativePath.endsWith("/order-stage-batch-admission.json")
    )).toBe(true);
  }, 30_000);

  it("applies current-v2 task admission in the daemon task-validation owner without changing v1", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-v2-task-admission-");
    const output = bunEval(`
      const authority = await import("./src/daemon/authority.ts");
      const project = await import("./src/shell/project.ts");
      const repositoryRoot = ${JSON.stringify(repository)};
      const manifest = await project.loadValidatedProjectManifest(repositoryRoot);
      const planBytes = new TextEncoder().encode(
        "# plan\\n\\n\`\`\`order-tasks\\n{\\\"version\\\":1,\\\"tasks\\\":[]}\\n\`\`\`\\n",
      );
      const workItem = { repositoryRoot, schemaId: "change-v2" };
      let v2Error = null;
      try {
        await authority.validateTaskDefinitions(workItem, manifest, [], planBytes);
      } catch (error) {
        v2Error = error instanceof Error ? error.message : String(error);
      }
      let v1Error = null;
      try {
        await authority.validateTaskDefinitions(
          { repositoryRoot, schemaId: "change-v1" },
          manifest,
          [],
          planBytes,
        );
      } catch (error) {
        v1Error = error instanceof Error ? error.message : String(error);
      }
      console.log(JSON.stringify({ v2Error, v1Error }));
    `) as { v2Error: string | null; v1Error: string | null };

    expect(output.v2Error).toMatch(/at least one signed task/);
    expect(output.v1Error).toBeNull();
  }, 30_000);

  it("normalizes approval identity before daemon persistence", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-approval-identity-");
    const output = bunEval(
      seedSignoffScript(repository, state, "", "  Human Operator  ") +
        `
          console.log(JSON.stringify({ approvedBy: approval.approvedBy }));
          database.close();
        `,
    ) as { approvedBy: string };

    expect(output.approvedBy).toBe("Human Operator");
  }, 30_000);

  it("rejects whitespace-only approval identity at daemon ingress before persistence", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-approval-identity-blank-");
    const output = bunEval(`
      let error = null;
      try {
        ${seedSignoffScript(repository, state, "", "   ")}
      } catch (cause) {
        error = cause instanceof Error ? cause.message : String(cause);
      }
      console.log(JSON.stringify({ error }));
    `) as { error: string | null };

    expect(output.error).toMatch(/approvedBy must be non-empty/);
  }, 30_000);

  it("rejects a vacuous current-v2 task block at sign-off package ingress", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-v2-signoff-task-admission-");
    const output = bunEval(`
      let error = null;
      try {
        ${seedSignoffScript(
          repository,
          state,
          "",
          "human",
          "change-v2",
          vacuousCurrentV2Plan,
        )}
      } catch (cause) {
        error = cause instanceof Error ? cause.message : String(cause);
      }
      console.log(JSON.stringify({ error }));
    `) as { error: string | null };

    expect(output.error).toMatch(/at least one signed task/);
  }, 30_000);

  it("blocks current-v2 PLAN completion when the signed task block is vacuous", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-plan-v2-task-validation-");
    const binary = createFakeOpenCode("stage-plan-complete");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v2",
        title: "PLAN v2 task validation",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, created.id, {
        stage: "PLAN",
        status: "ACTIVE",
        outcome: null,
      });
      const workItem = coord.getWorkItem(runtime, created.id);
      const root = "docs/order/work-items/" + workItem.id;
      const files = {
        R1: root + "/research.md",
        R2: root + "/requirements.md",
        DESIGN: root + "/solution-design.md",
        PLAN: root + "/implementation-plan.md",
      };
      fs.mkdirSync(path.join(repositoryRoot, root), { recursive: true });
      fs.writeFileSync(path.join(repositoryRoot, files.R1), ${JSON.stringify(currentV2StageFixture("R1"))});
      fs.writeFileSync(path.join(repositoryRoot, files.R2), ${JSON.stringify(currentV2StageFixture("R2"))});
      fs.writeFileSync(path.join(repositoryRoot, files.DESIGN), ${JSON.stringify(currentV2StageFixture("DESIGN"))});
      fs.writeFileSync(
        path.join(repositoryRoot, files.PLAN),
        ${JSON.stringify(vacuousCurrentV2Plan)},
      );

      const outputs = {
        R1: await authority.currentFileArtifact(runtime, workItem, files.R1, "R1", "P1"),
        R2: await authority.currentFileArtifact(runtime, workItem, files.R2, "R2", "P3"),
        DESIGN: await authority.currentFileArtifact(runtime, workItem, files.DESIGN, "DESIGN", "P6"),
        PLAN: await authority.currentFileArtifact(runtime, workItem, files.PLAN, "PLAN", "P7"),
      };
      const repo = await import("./src/shell/repository.ts");
      const baseline = await repo.resolveHeadCommit(repositoryRoot);
      const conform = async (stage, artifact) => {
        const state = await authority.resolveStageContextState(runtime, workItem, stage, true, artifact);
        if (state.staleStage !== null) throw new TypeError("fixture upstream context is stale: " + state.staleStage);
        const context = state.context;
        const row = runStore.insertRun(runtime, {
          id: rt.newRunId(),
          workItemId: workItem.id,
          executionTaskId: null,
          stage,
          mode: "INTERACTIVE",
          role: "STAGE",
          triggerEventId: null,
          status: "COMPLETED",
          attempt: runStore.nextAttempt(runtime, workItem.id, stage, null),
          baselineCommit: baseline,
          contextHash: context.contextHash,
          providerSessionId: null,
          terminalClassification: null,
          startedAt: rt.nowIsoDateTime(),
          endedAt: rt.nowIsoDateTime(),
        });
        sql.withTransaction(database, () => {
          for (const dependency of context.artifacts) {
            if (dependency.id !== artifact.id) {
              sql.storeArtifactDependency(database, artifact.id, dependency.id);
            }
          }
          runStore.appendRunEvent(runtime, row.id, {
            tag: "STAGE_COMPLETED",
            completion: { stage, outcome: stage === "R1" ? "CONFIRMED" : stage === "R3" ? "READY_FOR_SIGNOFF" : "ACCEPTED" },
            artifactRefIds: [artifact.id],
          });
          runStore.appendRunEvent(runtime, row.id, {
            tag: "CONFORMANCE_PASSED",
            stage,
            outputArtifactRefIds: [artifact.id],
            contextHash: context.contextHash,
            evidence: [],
          });
        });
      };
      await conform("R1", outputs.R1);
      await conform("R2", outputs.R2);
      await conform("DESIGN", outputs.DESIGN);

      fs.writeFileSync(
        path.join(path.dirname(process.env.PONTIVUS_ORDER_OPENCODE_BIN), "binding-id"),
        outputs.PLAN.id,
      );
      const run = await coord.startStageRun(runtime, workItem.id, "INTERACTIVE");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const settled = coord.getRun(runtime, run.id);
      const after = coord.getWorkItem(runtime, workItem.id);
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        runStatus: settled.status,
        stage: after.stage,
        failures: events
          .filter((event) => event.event.tag === "CONFORMANCE_FAILED")
          .map((event) => event.event.tag === "CONFORMANCE_FAILED"
            ? event.event.summary
            : ""),
      }));
      database.close();
    `, providerEnvironment(binary, state), 30_000) as {
      runStatus: string;
      stage: string;
      failures: string[];
    };

    expect(output.runStatus).toBe("BLOCKED");
    expect(output.stage).toBe("PLAN");
    expect(output.failures.some((failure) =>
      /at least one signed task/.test(failure)
    )).toBe(true);
  }, 30_000);

  it("blocks R3 READY_FOR_SIGNOFF when signed task definitions are mechanically invalid", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-r3-task-validation-");
    const binary = createFakeOpenCode("stage-r3-ready");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v2",
        title: "R3 task validation",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, created.id, {
        stage: "R3",
        status: "ACTIVE",
        outcome: null,
      });
      const workItem = coord.getWorkItem(runtime, created.id);
      const root = "docs/order/work-items/" + workItem.id;
      const files = {
        R1: root + "/research.md",
        R2: root + "/requirements.md",
        DESIGN: root + "/solution-design.md",
        PLAN: root + "/implementation-plan.md",
        R3: root + "/readiness-review.md",
      };
      fs.mkdirSync(path.join(repositoryRoot, root), { recursive: true });
      fs.writeFileSync(path.join(repositoryRoot, files.R1), ${JSON.stringify(currentV2StageFixture("R1"))});
      fs.writeFileSync(path.join(repositoryRoot, files.R2), ${JSON.stringify(currentV2StageFixture("R2"))});
      fs.writeFileSync(path.join(repositoryRoot, files.DESIGN), ${JSON.stringify(currentV2StageFixture("DESIGN"))});
      fs.writeFileSync(
        path.join(repositoryRoot, files.PLAN),
        ${JSON.stringify(vacuousCurrentV2Plan)},
      );
      fs.writeFileSync(
        path.join(repositoryRoot, files.R3),
        ${JSON.stringify(currentV2R3Template)},
      );

      const outputs = {
        R1: await authority.currentFileArtifact(runtime, workItem, files.R1, "R1", "P1"),
        R2: await authority.currentFileArtifact(runtime, workItem, files.R2, "R2", "P3"),
        DESIGN: await authority.currentFileArtifact(runtime, workItem, files.DESIGN, "DESIGN", "P6"),
        PLAN: await authority.currentFileArtifact(runtime, workItem, files.PLAN, "PLAN", "P7"),
        R3: await authority.currentFileArtifact(runtime, workItem, files.R3, "R3", "P7"),
      };
      const repo = await import("./src/shell/repository.ts");
      const baseline = await repo.resolveHeadCommit(repositoryRoot);
      const conform = async (stage, artifact) => {
        const state = await authority.resolveStageContextState(runtime, workItem, stage, true, artifact);
        if (state.staleStage !== null) throw new TypeError("fixture upstream context is stale: " + state.staleStage);
        const context = state.context;
        const row = runStore.insertRun(runtime, {
          id: rt.newRunId(),
          workItemId: workItem.id,
          executionTaskId: null,
          stage,
          mode: "INTERACTIVE",
          role: "STAGE",
          triggerEventId: null,
          status: "COMPLETED",
          attempt: runStore.nextAttempt(runtime, workItem.id, stage, null),
          baselineCommit: baseline,
          contextHash: context.contextHash,
          providerSessionId: null,
          terminalClassification: null,
          startedAt: rt.nowIsoDateTime(),
          endedAt: rt.nowIsoDateTime(),
        });
        sql.withTransaction(database, () => {
          for (const dependency of context.artifacts) {
            if (dependency.id !== artifact.id) {
              sql.storeArtifactDependency(database, artifact.id, dependency.id);
            }
          }
          runStore.appendRunEvent(runtime, row.id, {
            tag: "STAGE_COMPLETED",
            completion: { stage, outcome: stage === "R1" ? "CONFIRMED" : stage === "R3" ? "READY_FOR_SIGNOFF" : "ACCEPTED" },
            artifactRefIds: [artifact.id],
          });
          runStore.appendRunEvent(runtime, row.id, {
            tag: "CONFORMANCE_PASSED",
            stage,
            outputArtifactRefIds: [artifact.id],
            contextHash: context.contextHash,
            evidence: [],
          });
        });
      };
      await conform("R1", outputs.R1);
      await conform("R2", outputs.R2);
      await conform("DESIGN", outputs.DESIGN);
      await conform("PLAN", outputs.PLAN);

      fs.writeFileSync(
        path.join(path.dirname(process.env.PONTIVUS_ORDER_OPENCODE_BIN), "binding-id"),
        outputs.R3.id,
      );
      const run = await coord.startStageRun(runtime, workItem.id, "INTERACTIVE");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const settled = coord.getRun(runtime, run.id);
      const after = coord.getWorkItem(runtime, workItem.id);
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        runStatus: settled.status,
        stage: after.stage,
        failures: events
          .filter((event) => event.event.tag === "CONFORMANCE_FAILED")
          .map((event) => event.event.tag === "CONFORMANCE_FAILED"
            ? event.event.summary
            : ""),
      }));
      database.close();
    `, providerEnvironment(binary, state), 30_000) as {
      runStatus: string;
      stage: string;
      failures: string[];
    };

    expect(output.runStatus).toBe("BLOCKED");
    expect(output.stage).toBe("R3");
    expect(output.failures.some((failure) =>
      /at least one signed task/.test(failure)
    )).toBe(true);
  }, 30_000);
  it("blocks a stage completion that has no lifecycle output artifact", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-empty-stage-output-");
    const binary = createFakeOpenCode("stage-empty-output");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "empty R1 output",
        concernIds: ["shell"],
      });
      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const settled = coord.getRun(runtime, run.id);
      const after = coord.getWorkItem(runtime, created.id);
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        runStatus: settled.status,
        stage: after.stage,
        completionCount: events.filter((event) =>
          event.event.tag === "STAGE_COMPLETED"
        ).length,
        failures: events
          .filter((event) => event.event.tag === "CONFORMANCE_FAILED")
          .map((event) => event.event.tag === "CONFORMANCE_FAILED"
            ? event.event.summary
            : ""),
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      runStatus: string;
      stage: string;
      completionCount: number;
      failures: string[];
    };

    expect(output).toEqual({
      runStatus: "BLOCKED",
      stage: "R1",
      completionCount: 1,
      failures: ["stage completion requires exactly one current output ArtifactRef; received 0"],
    });
  }, 30_000);

  it("preserves schema-outcome conformance after exact output binding passes", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-kind-invalid-r1-");
    const binary = createFakeOpenCode("stage-invalid-r1");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "audit-v1",
        title: "audit completion mismatch",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const outputPath =
        "docs/order/work-items/" + workItem.id + "/research.md";
      fs.mkdirSync(path.dirname(path.join(repositoryRoot, outputPath)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(repositoryRoot, outputPath), "# Audit research\\n");
      const artifact = await authority.currentFileArtifact(
        runtime,
        workItem,
        outputPath,
        "R1",
        "P1",
      );
      fs.writeFileSync(
        path.join(path.dirname(process.env.PONTIVUS_ORDER_OPENCODE_BIN), "binding-id"),
        artifact.id,
      );
      const priorRun = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "COMPLETED",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
        contextHash: rt.sha256Text("prior-audit-r1-draft"),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: rt.nowIsoDateTime(),
      });
      runStore.appendRunEvent(runtime, priorRun.id, {
        tag: "STAGE_COMPLETED", completion: { stage: "R1", outcome: "AUDIT_COMPLETE" },
        artifactRefIds: [artifact.id],
      });
      runStore.appendRunEvent(runtime, priorRun.id, {
        tag: "CONFORMANCE_PASSED",
        stage: "R1",
        outputArtifactRefIds: [artifact.id],
        contextHash: priorRun.contextHash,
        evidence: [],
      });

      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const settled = coord.getRun(runtime, run.id);
      const after = coord.getWorkItem(runtime, created.id);
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        runStatus: settled.status,
        stage: after.stage,
        failures: events
          .filter((event) => event.event.tag === "CONFORMANCE_FAILED")
          .map((event) => event.event.tag === "CONFORMANCE_FAILED"
            ? event.event.summary
            : ""),
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      runStatus: string;
      stage: string;
      failures: string[];
    };

    expect(output).toEqual({
      runStatus: "BLOCKED",
      stage: "R1",
      failures: ["R1 outcome CONFIRMED is invalid for schema audit-v1"],
    });
  }, 30_000);

  it("promotes only when completion binds the exact current lifecycle artifact", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-bound-r1-");
    const binary = createFakeOpenCode("stage-bound-r1");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "bound R1 output",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const outputPath =
        "docs/order/work-items/" + workItem.id + "/research.md";
      fs.mkdirSync(path.dirname(path.join(repositoryRoot, outputPath)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(repositoryRoot, outputPath), "# Change research\\n");
      const artifact = await authority.currentFileArtifact(
        runtime,
        workItem,
        outputPath,
        "R1",
        "P1",
      );
      fs.writeFileSync(
        path.join(path.dirname(process.env.PONTIVUS_ORDER_OPENCODE_BIN), "binding-id"),
        artifact.id,
      );
      const priorRun = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "COMPLETED",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
        contextHash: rt.sha256Text("prior-change-r1-draft"),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: rt.nowIsoDateTime(),
      });
      runStore.appendRunEvent(runtime, priorRun.id, {
        tag: "STAGE_COMPLETED", completion: { stage: "R1", outcome: "CONFIRMED" },
        artifactRefIds: [artifact.id],
      });
      runStore.appendRunEvent(runtime, priorRun.id, {
        tag: "CONFORMANCE_PASSED",
        stage: "R1",
        outputArtifactRefIds: [artifact.id],
        contextHash: priorRun.contextHash,
        evidence: [],
      });

      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const settled = coord.getRun(runtime, run.id);
      const after = coord.getWorkItem(runtime, created.id);
      const events = coord.listRunEvents(runtime, run.id);
      const conformance = events.findLast((event) =>
        event.event.tag === "CONFORMANCE_PASSED"
      );
      console.log(JSON.stringify({
        runStatus: settled.status,
        stage: after.stage,
        conformanceOutput:
          conformance?.event.tag === "CONFORMANCE_PASSED"
            ? conformance.event.outputArtifactRefIds
            : [],
        expectedArtifact: artifact.id,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      runStatus: string;
      stage: string;
      conformanceOutput: string[];
      expectedArtifact: string;
    };

    expect(output.runStatus).toBe("COMPLETED");
    expect(output.stage).toBe("R2");
    expect(output.conformanceOutput).toEqual([output.expectedArtifact]);
  }, 30_000);

  it("keeps sign-off package inspection read-only when current Markdown diverges", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-signoff-recovery-");

    const output = bunEval(seedSignoffScript(
      repository,
      state,
      `
        const fsForRecovery = await import("node:fs");
        fsForRecovery.writeFileSync(
          repositoryRoot + "/docs/plan.md",
          "plan changed after conformance\\n",
        );
        const beforeWorkItem = coord.getWorkItem(runtime, work);
        const beforeArtifactCount = coord.listArtifacts(runtime, work).length;
        const beforeBytes = fsForRecovery.readFileSync(
          repositoryRoot + "/docs/plan.md",
          "utf8",
        );
        const serverForRecovery = await import("./src/daemon/server.ts");
        let error = null;
        let classified = null;
        try {
          await coord.computeSignoffPackage(runtime, work);
        } catch (caught) {
          error = caught instanceof Error ? caught.message : String(caught);
          classified = serverForRecovery.classifyHttpFailure(caught);
        }
        const recovered = coord.getWorkItem(runtime, work);
        const afterArtifactCount = coord.listArtifacts(runtime, work).length;
        const afterBytes = fsForRecovery.readFileSync(
          repositoryRoot + "/docs/plan.md",
          "utf8",
        );
        let wrongOwnerError = null;
        try {
          await coord.reconcileWorkItemAuthority(runtime, work, "DESIGN");
        } catch (caught) {
          wrongOwnerError = caught instanceof Error ? caught.message : String(caught);
        }
        const afterWrongOwner = coord.getWorkItem(runtime, work);
        const reconciled = await coord.reconcileWorkItemAuthority(runtime, work, "PLAN");
        const finalArtifactCount = coord.listArtifacts(runtime, work).length;
        const finalBytes = fsForRecovery.readFileSync(
          repositoryRoot + "/docs/plan.md",
          "utf8",
        );
        console.log(JSON.stringify({
          error,
          classified,
          stage: recovered.stage,
          status: recovered.status,
          projectionUnchanged:
            JSON.stringify(recovered) === JSON.stringify(beforeWorkItem),
          artifactCountUnchanged: afterArtifactCount === beforeArtifactCount,
          bytesUnchanged: afterBytes === beforeBytes,
          wrongOwnerError,
          wrongOwnerStateUnchanged:
            JSON.stringify(afterWrongOwner) === JSON.stringify(recovered),
          reconciled: {
            stage: reconciled.stage,
            status: reconciled.status,
            outcome: reconciled.outcome,
          },
          recoveryArtifactCountUnchanged: finalArtifactCount === beforeArtifactCount,
          recoveryBytesUnchanged: finalBytes === beforeBytes,
        }));
        database.close();
        process.exit(0);
      `,
    )) as {
      error: string | null;
      classified: {
        status: number;
        code: string;
        message: string;
        sourceDiagnostic: null;
        staleAuthorityOwner: string | null;
      } | null;
      stage: string;
      status: string;
      projectionUnchanged: boolean;
      artifactCountUnchanged: boolean;
      bytesUnchanged: boolean;
      wrongOwnerError: string | null;
      wrongOwnerStateUnchanged: boolean;
      reconciled: { stage: string; status: string; outcome: string | null };
      recoveryArtifactCountUnchanged: boolean;
      recoveryBytesUnchanged: boolean;
    };

    expect(output.error).toMatch(/missing or stale: PLAN/);
    expect(output.classified).toMatchObject({
      status: 409,
      code: "STALE_AUTHORITY",
      sourceDiagnostic: null,
      staleAuthorityOwner: "PLAN",
    });
    expect(output).toMatchObject({ stage: "AWAITING_SIGNOFF", status: "ACTIVE" });
    expect(output.projectionUnchanged).toBe(true);
    expect(output.artifactCountUnchanged).toBe(true);
    expect(output.bytesUnchanged).toBe(true);
    expect(output.wrongOwnerError).toMatch(/owner changed/);
    expect(output.wrongOwnerStateUnchanged).toBe(true);
    expect(output.reconciled).toEqual({
      stage: "PLAN",
      status: "ACTIVE",
      outcome: null,
    });
    expect(output.recoveryArtifactCountUnchanged).toBe(true);
    expect(output.recoveryBytesUnchanged).toBe(true);
  }, 30_000);

  it("does not misclassify an unavailable WorkItem root as semantic approval staleness", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-precondition-");

    const output = bunEval(seedSignoffScript(repository, state) + `
      const fsForFailure = await import("node:fs");
      fsForFailure.rmSync((runtime.config.repositoryRoots[0] + "/docs/order/work-items"), { recursive: true, force: true });
      fsForFailure.writeFileSync((runtime.config.repositoryRoots[0] + "/docs/order/work-items"), "not a directory");
      let threw = false;
      let message = "";
      try {
        await authority.approvalFreshness(runtime, approval);
      } catch (error) {
        threw = true;
        message = error instanceof Error ? error.message : String(error);
      }
      console.log(JSON.stringify({ threw, message }));
      database.close();
    `) as { threw: boolean; message: string };

    expect(output.threw).toBe(false);
    expect(output.message).toBe("");
  });

  it("persists source and archive-marker changes through exact documentation Git commands", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-documentation-git-");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "Git managed source",
        concernIds: ["shell"],
      });

      const sourceStatus = await coord.getDocumentationGitStatus(runtime, created.id);
      const sourceChanged = sourceStatus.paths.filter((path) =>
        path.state === "MODIFIED" || path.state === "UNTRACKED" || path.state === "DELETED"
      );
      const sourceCommit = await coord.commitDocumentation(runtime, created.id, {
        expectedHeadCommit: sourceStatus.headCommit,
        expectedPaths: sourceChanged.map((path) => ({
          repositoryPath: path.repositoryPath,
          sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
        })),
      });

      await coord.setArchived(runtime, created.id, {
        expectedArchived: false,
        archived: true,
      });
      const archiveStatus = await coord.getDocumentationGitStatus(runtime, created.id);
      const archiveChanged = archiveStatus.paths.filter((path) =>
        path.state === "MODIFIED" || path.state === "UNTRACKED" || path.state === "DELETED"
      );
      const archiveCommit = await coord.commitDocumentation(runtime, created.id, {
        expectedHeadCommit: archiveStatus.headCommit,
        expectedPaths: archiveChanged.map((path) => ({
          repositoryPath: path.repositoryPath,
          sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
        })),
      });

      await coord.setArchived(runtime, created.id, {
        expectedArchived: true,
        archived: false,
      });
      const restoreStatus = await coord.getDocumentationGitStatus(runtime, created.id);
      const restoreChanged = restoreStatus.paths.filter((path) =>
        path.state === "MODIFIED" || path.state === "UNTRACKED" || path.state === "DELETED"
      );
      const restoreCommit = await coord.commitDocumentation(runtime, created.id, {
        expectedHeadCommit: restoreStatus.headCommit,
        expectedPaths: restoreChanged.map((path) => ({
          repositoryPath: path.repositoryPath,
          sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
        })),
      });

      const finalStatus = await coord.getDocumentationGitStatus(runtime, created.id);
      console.log(JSON.stringify({
        sourceStatus,
        sourceCommit,
        archiveStatus,
        archiveCommit,
        restoreStatus,
        restoreCommit,
        finalStatus,
      }));
      database.close();
    `) as {
      sourceStatus: { blockers: string[]; paths: Array<{ repositoryPath: string; state: string }> };
      sourceCommit: { repositoryPaths: string[]; gitCommit: string };
      archiveStatus: { paths: Array<{ repositoryPath: string; state: string }> };
      archiveCommit: { repositoryPaths: string[] };
      restoreStatus: { paths: Array<{ repositoryPath: string; state: string }> };
      restoreCommit: { repositoryPaths: string[] };
      finalStatus: { paths: Array<{ repositoryPath: string; state: string }> };
    };

    expect(output.sourceStatus.blockers).toEqual([]);
    expect(output.sourceStatus.paths).toEqual([
      expect.objectContaining({ state: "UNTRACKED", repositoryPath: expect.stringMatching(/work-request\.md$/) }),
    ]);
    expect(output.sourceCommit.repositoryPaths).toHaveLength(1);
    expect(output.archiveStatus.paths).toContainEqual(
      expect.objectContaining({ state: "UNTRACKED", repositoryPath: expect.stringMatching(/\.order-archived$/) }),
    );
    expect(output.archiveCommit.repositoryPaths).toContainEqual(
      expect.stringMatching(/\.order-archived$/),
    );
    expect(output.restoreStatus.paths).toContainEqual(
      expect.objectContaining({ state: "DELETED", repositoryPath: expect.stringMatching(/\.order-archived$/) }),
    );
    expect(output.restoreCommit.repositoryPaths).toContainEqual(
      expect.stringMatching(/\.order-archived$/),
    );
    expect(output.finalStatus.paths.every((path) => path.state === "MATCHES_HEAD")).toBe(true);
  });

  it("edits the canonical title and archives/restores without lifecycle mutation", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-title-archive-");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "Original title",
        concernIds: ["shell"],
      });
      const source = await coord.getWorkItemSource(runtime, created.id);
      const titleWrite = await coord.updateTitle(runtime, created.id, {
        expectedSourceSha256: source.sha256,
        title: "Renamed title",
      });
      const renamed = coord.getWorkItem(runtime, created.id);
      const beforeArchiveLifecycle = {
        stage: renamed.stage,
        status: renamed.status,
        outcome: renamed.outcome,
      };
      const archived = await coord.setArchived(runtime, created.id, {
        expectedArchived: false,
        archived: true,
      });
      const defaultQueue = coord.listWorkItems(runtime).map((item) => item.id);
      const allQueue = coord.listWorkItems(runtime, true).map((item) => item.id);
      const marker = sourceShell.readWorkItemArchived(
        runtime.config.repositoryRoots[0],
        "docs/order/work-items",
        created.id,
      );
      const restored = await coord.setArchived(runtime, created.id, {
        expectedArchived: true,
        archived: false,
      });
      console.log(JSON.stringify({
        titleWrite,
        renamed,
        beforeArchiveLifecycle,
        archived,
        defaultQueue,
        allQueue,
        marker,
        restored,
      }));
      database.close();
    `) as {
      titleWrite: { tag: string; sha256: string };
      renamed: { title: string; stage: string; status: string; outcome: string | null };
      beforeArchiveLifecycle: { stage: string; status: string; outcome: string | null };
      archived: { archived: boolean; stage: string; status: string; outcome: string | null };
      defaultQueue: string[];
      allQueue: string[];
      marker: boolean;
      restored: { archived: boolean; stage: string; status: string; outcome: string | null };
    };

    expect(output.titleWrite.tag).toBe("UPDATED");
    expect(output.renamed.title).toBe("Renamed title");
    expect(output.archived.archived).toBe(true);
    expect(output.marker).toBe(true);
    expect(output.defaultQueue).toEqual([]);
    expect(output.allQueue).toHaveLength(1);
    expect({
      stage: output.archived.stage,
      status: output.archived.status,
      outcome: output.archived.outcome,
    }).toEqual(output.beforeArchiveLifecycle);
    expect(output.restored.archived).toBe(false);
    expect({
      stage: output.restored.stage,
      status: output.restored.status,
      outcome: output.restored.outcome,
    }).toEqual(output.beforeArchiveLifecycle);
  });

  it("discovers an existing source and binds its exact hash into R1 context", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-discovery-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const core = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );

      const id = rt.newWorkItemId();
      const markdown = core.renderWorkItemSourceMarkdown({
        formatVersion: 1,
        id,
        projectId: "fixture",
        concernIds: ["shell"],
        schemaId: "change-v1",
      }, "discovered source");
      const created = sourceShell.createWorkItemSourceFile(runtime.config.repositoryRoots[0], "docs/order/work-items", id,
        markdown,
      );
      const reconciliation = await coord.reconcileSources(runtime);
      const discovered = coord.getWorkItem(runtime, id);
      sql.promoteIdeaToR1(database, id);
      const r1 = coord.getWorkItem(runtime, id);
      const before = await authority.resolveStageContext(runtime, r1, "R1");

      const source = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], discovered.sourcePath,
      );
      const changedMarkdown = source.markdown.replace(
        "# discovered source",
        "# externally changed source",
      );
      const changed = sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], source.path,
        source.sha256,
        changedMarkdown,
      );
      await coord.reconcileSources(runtime);
      const after = await authority.resolveStageContext(
        runtime,
        coord.getWorkItem(runtime, id),
        "R1",
      );
      const updated = coord.getWorkItem(runtime, id);

      console.log(JSON.stringify({
        registered: reconciliation.registered,
        created,
        origin: discovered.origin,
        schemaId: discovered.schemaId,
        sourcePath: discovered.sourcePath,
        sourceSha256: discovered.sourceSha256,
        beforeSourceSha256: before.source.sha256,
        beforeContextHash: before.contextHash,
        changed,
        afterSourceSha256: after.source.sha256,
        afterContextHash: after.contextHash,
        updatedStage: updated.stage,
        updatedTitle: updated.title,
      }));
      database.close();
    `) as {
      registered: string[];
      created: { path: string; sha256: string };
      origin: string;
      schemaId: string;
      sourcePath: string;
      sourceSha256: string;
      beforeSourceSha256: string;
      beforeContextHash: string;
      changed: { tag: string; sha256: string };
      afterSourceSha256: string;
      afterContextHash: string;
      updatedStage: string;
      updatedTitle: string;
    };

    expect(output.registered).toHaveLength(1);
    expect(output.origin).toBe("DISCOVERED");
    expect(output.schemaId).toBe("change-v1");
    expect(output.sourcePath).toBe(output.created.path);
    expect(output.sourceSha256).toBe(output.created.sha256);
    expect(output.beforeSourceSha256).toBe(output.created.sha256);
    expect(output.changed.tag).toBe("UPDATED");
    expect(output.afterSourceSha256).toBe(output.changed.sha256);
    expect(output.afterContextHash).not.toBe(output.beforeContextHash);
    expect(output.updatedStage).toBe("R1");
    expect(output.updatedTitle).toBe("externally changed source");
  });

  it("blocks productive stage start when the canonical source is missing without changing lifecycle state", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-missing-boundary-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "missing source boundary",
        concernIds: ["shell"],
      });
      fs.unlinkSync(path.join(runtime.config.repositoryRoots[0], created.sourcePath));
      let rejected = false;
      try {
        await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      } catch {
        rejected = true;
      }
      const after = coord.getWorkItem(runtime, created.id);
      const diagnostics = await coord.getWorkItemSourceDiagnostics(runtime);
      console.log(JSON.stringify({
        rejected,
        stage: after.stage,
        status: after.status,
        diagnostics: diagnostics
          .filter((item) => item.workItemId === created.id)
          .map((item) => item.code),
      }));
      database.close();
    `) as {
      rejected: boolean;
      stage: string;
      status: string;
      diagnostics: string[];
    };

    expect(output).toEqual({
      rejected: true,
      stage: "IDEA",
      status: "ACTIVE",
      diagnostics: ["MISSING_SOURCE"],
    });
  });

  it("keeps completed source changes diagnostic-only and preserves terminal history", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-completed-source-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "completed immutable source",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, created.id, {
        stage: "COMPLETE",
        status: "COMPLETE",
        outcome: "DUPLICATE",
      });
      const terminal = coord.getWorkItem(runtime, created.id);
      const source = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], terminal.sourcePath,
      );
      const write = sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], source.path,
        source.sha256,
        source.markdown.replace(
          "# completed immutable source",
          "# changed after completion",
        ),
      );
      const reconciliation = await coord.reconcileSources(runtime);
      const after = coord.getWorkItem(runtime, created.id);
      console.log(JSON.stringify({
        write,
        codes: reconciliation.diagnostics
          .filter((item) => item.workItemId === created.id)
          .map((item) => item.code),
        stage: after.stage,
        status: after.status,
        outcome: after.outcome,
        sourceSha256: after.sourceSha256,
        originalSha256: terminal.sourceSha256,
      }));
      database.close();
    `) as {
      write: { tag: string };
      codes: string[];
      stage: string;
      status: string;
      outcome: string | null;
      sourceSha256: string;
      originalSha256: string;
    };

    expect(output.write.tag).toBe("UPDATED");
    expect(output.codes).toContain("COMPLETED_SOURCE_CHANGED");
    expect(output.stage).toBe("COMPLETE");
    expect(output.status).toBe("COMPLETE");
    expect(output.outcome).toBe("DUPLICATE");
    expect(output.sourceSha256).toBe(output.originalSha256);
  });

  it("does not invalidate lifecycle state for an identical-byte source save", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-noop-save-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "no-op source save",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, created.id, {
        stage: "PLAN",
        status: "ACTIVE",
        outcome: null,
      });
      const before = coord.getWorkItem(runtime, created.id);
      const source = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], before.sourcePath,
      );
      const saved = await coord.saveSource(runtime, before.id, {
        expectedSha256: source.sha256,
        markdown: source.markdown,
      });
      const after = coord.getWorkItem(runtime, before.id);
      console.log(JSON.stringify({
        saved,
        beforeStage: before.stage,
        afterStage: after.stage,
        beforeSha: before.sourceSha256,
        afterSha: after.sourceSha256,
      }));
      database.close();
    `) as {
      saved: { tag: string; sha256: string };
      beforeStage: string;
      afterStage: string;
      beforeSha: string;
      afterSha: string;
    };

    expect(output.saved.tag).toBe("UPDATED");
    expect(output.beforeStage).toBe("PLAN");
    expect(output.afterStage).toBe("PLAN");
    expect(output.beforeSha).toBe(output.afterSha);
  });

  it("returns STALE before parsing a stale source-save buffer and never overwrites newer bytes", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-save-stale-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "source stale",
        concernIds: ["shell"],
      });
      const source = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], created.sourcePath,
      );
      const newerMarkdown = source.markdown.replace("# source stale", "# newer source");
      const external = sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], source.path,
        source.sha256,
        newerMarkdown,
      );
      const stale = await coord.saveSource(runtime, created.id, {
        expectedSha256: source.sha256,
        markdown: "this is not valid WorkItem Markdown",
      });
      const exact = fs.readFileSync(
        path.join(runtime.config.repositoryRoots[0], source.path),
        "utf8",
      );
      const after = coord.getWorkItem(runtime, created.id);
      console.log(JSON.stringify({
        external,
        stale,
        exact,
        title: after.title,
        stage: after.stage,
      }));
      database.close();
    `) as {
      external: { tag: string; sha256: string };
      stale: { tag: string; currentSha256: string };
      exact: string;
      title: string;
      stage: string;
    };

    expect(output.external.tag).toBe("UPDATED");
    expect(output.stale).toEqual({
      tag: "STALE",
      currentSha256: output.external.sha256,
    });
    expect(output.exact).toContain("# newer source");
    expect(output.exact).not.toContain("not valid");
    expect(output.title).toBe("newer source");
    expect(output.stage).toBe("IDEA");
  });


  it("saves only WorkItem body Markdown while preserving exact metadata and complete-file concurrency", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-body-save-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "body-only source",
        concernIds: ["shell"],
      });
      const initial = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], created.sourcePath);
      const exactEnvelope = "---\\n" + JSON.stringify(initial.metadata) + "\\n---\\n";
      const externallyFormatted = exactEnvelope + initial.bodyMarkdown;
      const reformatted = sourceShell.replaceWorkItemSourceFile(
        runtime.config.repositoryRoots[0],
        initial.path,
        initial.sha256,
        externallyFormatted,
      );
      if (reformatted.tag !== "UPDATED") throw new Error("fixture metadata reformat failed");
      const current = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], initial.path);
      const proposedBody = current.bodyMarkdown.replace(
        "## Current context\\n",
        "## Current context\\nBody-only edit remains human Markdown.\\n",
      );
      const saved = await coord.saveSourceBody(runtime, created.id, {
        expectedSha256: current.sha256,
        bodyMarkdown: proposedBody,
      });
      const savedBytes = fs.readFileSync(
        path.join(runtime.config.repositoryRoots[0], current.path),
        "utf8",
      );

      let invalid = null;
      try {
        await coord.saveSourceBody(runtime, created.id, {
          expectedSha256: saved.tag === "UPDATED" ? saved.sha256 : current.sha256,
          bodyMarkdown: proposedBody.replace("## Evidence/references", "## Removed evidence"),
        });
      } catch (error) {
        invalid = error instanceof Error ? error.message : String(error);
      }
      const afterInvalid = fs.readFileSync(
        path.join(runtime.config.repositoryRoots[0], current.path),
        "utf8",
      );

      const beforeExternal = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], current.path);
      const externalBytes = beforeExternal.markdown.replace(
        "# body-only source",
        "# externally changed body-only source",
      );
      const external = sourceShell.replaceWorkItemSourceFile(
        runtime.config.repositoryRoots[0],
        current.path,
        beforeExternal.sha256,
        externalBytes,
      );
      if (external.tag !== "UPDATED") throw new Error("fixture external update failed");
      const stale = await coord.saveSourceBody(runtime, created.id, {
        expectedSha256: beforeExternal.sha256,
        bodyMarkdown: proposedBody,
      });
      const finalBytes = fs.readFileSync(
        path.join(runtime.config.repositoryRoots[0], current.path),
        "utf8",
      );

      console.log(JSON.stringify({
        exactEnvelope,
        currentBody: current.bodyMarkdown,
        saved,
        savedBytes,
        invalid,
        unchangedAfterInvalid: afterInvalid === savedBytes,
        external,
        stale,
        finalBytes,
      }));
      database.close();
    `) as {
      exactEnvelope: string;
      currentBody: string;
      saved: { tag: string; sha256: string };
      savedBytes: string;
      invalid: string | null;
      unchangedAfterInvalid: boolean;
      external: { tag: string; sha256: string };
      stale: { tag: string; currentSha256: string };
      finalBytes: string;
    };

    expect(output.currentBody).toMatch(/^# body-only source/);
    expect(output.currentBody).not.toContain('"formatVersion"');
    expect(output.saved.tag).toBe("UPDATED");
    expect(output.savedBytes.startsWith(output.exactEnvelope)).toBe(true);
    expect(output.savedBytes).toContain("Body-only edit remains human Markdown.");
    expect(output.invalid).toContain("missing ordered section");
    expect(output.unchangedAfterInvalid).toBe(true);
    expect(output.stale).toEqual({
      tag: "STALE",
      currentSha256: output.external.sha256,
    });
    expect(output.finalBytes).toContain("# externally changed body-only source");
    expect(output.finalBytes).not.toContain("Removed evidence");
  });

  it("revalidates a waiting STAGE Run before recording human input", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-resume-source-freshness-");

    const output = bunEval(seedSignoffScript(repository, state) + `
      sql.updateWorkItemLifecycle(database, work, {
        stage: "PLAN",
        status: "ACTIVE",
        outcome: null,
      });
      const planWorkItem = coord.getWorkItem(runtime, work);
      const context = await authority.resolveStageContext(runtime, planWorkItem, "PLAN");
      const waiting = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: work,
        executionTaskId: null,
        stage: "PLAN",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "WAITING_FOR_INPUT",
        attempt: runStore.nextAttempt(runtime, work, "PLAN", null),
        baselineCommit: approval.baselineCommit,
        contextHash: context.contextHash,
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, waiting.id, {
        tag: "STAGE_STARTED",
        stage: "PLAN",
        mode: "INTERACTIVE",
        contextHash: context.contextHash,
      });
      const request = runStore.appendRunEvent(runtime, waiting.id, {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "INFORMATION",
        question: "clarify",
      });
      const waitingSource = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], planWorkItem.sourcePath,
      );
      sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], waitingSource.path,
        waitingSource.sha256,
        waitingSource.markdown.replace("# fixture", "# changed while waiting"),
      );

      let rejected = false;
      try {
        await coord.submitRunInput(runtime, waiting.id, "stale answer", request.id);
      } catch {
        rejected = true;
      }
      const beforeRecovery = {
        workItem: coord.getWorkItem(runtime, work),
        run: coord.listRuns(runtime, work).find((candidate) => candidate.id === waiting.id),
        events: coord.listRunEvents(runtime, waiting.id),
      };
      await coord.cancelRun(runtime, waiting.id);
      await coord.reconcileSources(runtime);
      console.log(JSON.stringify({
        rejected,
        beforeRecovery: {
          workItem: beforeRecovery.workItem,
          runStatus: beforeRecovery.run?.status ?? null,
          receivedCount: beforeRecovery.events.filter((event) => event.event.tag === "HUMAN_INPUT_RECEIVED").length,
          conformanceFailures: beforeRecovery.events.filter((event) => event.event.tag === "CONFORMANCE_FAILED").length,
        },
        afterRecovery: coord.getWorkItem(runtime, work),
      }));
      database.close();
    `) as {
      rejected: boolean;
      beforeRecovery: {
        workItem: { stage: string; status: string };
        runStatus: string | null;
        receivedCount: number;
        conformanceFailures: number;
      };
      afterRecovery: { stage: string; status: string };
    };

    expect(output.rejected).toBe(true);
    expect(output.beforeRecovery.workItem).toMatchObject({ stage: "PLAN", status: "ACTIVE" });
    expect(output.beforeRecovery.runStatus).toBe("WAITING_FOR_INPUT");
    expect(output.beforeRecovery.receivedCount).toBe(0);
    expect(output.beforeRecovery.conformanceFailures).toBe(0);
    expect(output.afterRecovery).toMatchObject({ stage: "R1", status: "ACTIVE" });
  });

  it("rejects a resumed STAGE session after a clean source HEAD advance", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-stage-head-freshness-");

    const output = bunEval(seedSignoffScript(repository, state) + `
      const stageOwner = await import("./src/daemon/stage.ts");
      sql.updateWorkItemLifecycle(database, work, {
        stage: "PLAN",
        status: "ACTIVE",
        outcome: null,
      });
      const planWorkItem = coord.getWorkItem(runtime, work);
      const context = await authority.resolveStageContext(runtime, planWorkItem, "PLAN");
      const waiting = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: work,
        executionTaskId: null,
        stage: "PLAN",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: runStore.nextAttempt(runtime, work, "PLAN", null),
        baselineCommit: approval.baselineCommit,
        contextHash: context.contextHash,
        providerSessionId: "session_existing",
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      const trigger = runStore.appendRunEvent(runtime, waiting.id, {
        tag: "OBSERVATION_RECORDED",
        title: "RESUME",
        detail: "resume after external commit",
        evidence: [],
      });
      runtime.activeProviders.set(waiting.id, {
        server: {
          process: { terminate: async () => undefined },
        },
        sessionId: "session_existing",
        trustedAccountId: "cred_existing",
        stageMaterialIdentity: "sha256:" + "a".repeat(64),
      });

      Bun.spawnSync(["git", "config", "user.email", "fixture@example.com"], { cwd: ${JSON.stringify(repository)} });
      Bun.spawnSync(["git", "config", "user.name", "Fixture"], { cwd: ${JSON.stringify(repository)} });
      await Bun.write(${JSON.stringify(repository)} + "/head-advance.txt", "committed change\\n");
      Bun.spawnSync(["git", "add", "head-advance.txt"], { cwd: ${JSON.stringify(repository)} });
      const committed = Bun.spawnSync(["git", "commit", "-m", "advance head"], { cwd: ${JSON.stringify(repository)} });
      if (committed.exitCode !== 0) {
        throw new Error(new TextDecoder().decode(committed.stderr));
      }

      const result = await stageOwner.runStageTurn(runtime, waiting, trigger.id, context);
      const events = runStore.listRunEvents(runtime, waiting.id);
      console.log(JSON.stringify({
        status: result.status,
        classification: result.terminalClassification,
        productiveFailures: events
          .filter((event) => event.event.tag === "PRODUCTIVE_INVOCATION_FAILED")
          .map((event) => event.event),
        providerFailures: events.filter((event) => event.event.tag === "PROVIDER_FAILED").length,
        activeProvider: runtime.activeProviders.has(waiting.id),
      }));
      database.close();
    `) as {
      status: string;
      classification: string | null;
      productiveFailures: Array<{ classification: string; detail: string }>;
      providerFailures: number;
      activeProvider: boolean;
    };

    expect(output.status).toBe("FAILED");
    expect(output.classification).toBe("PRECONDITION_FAILED");
    expect(output.productiveFailures).toEqual([
      expect.objectContaining({
        classification: "PRECONDITION_FAILED",
        detail: expect.stringContaining("source HEAD no longer equals the Run baseline"),
      }),
    ]);
    expect(output.providerFailures).toBe(0);
    expect(output.activeProvider).toBe(false);
  });

  it("routes an externally changed source through approval staleness to R1", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-stale-");

    const output = bunEval(seedSignoffScript(repository, state) + `
      const before = await authority.approvalFreshness(runtime, approval);
      const current = coord.getWorkItem(runtime, work);
      const currentSource = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], current.sourcePath);
      const changed = currentSource.markdown.replace("# fixture", "# changed fixture");
      const write = sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], currentSource.path,
        currentSource.sha256,
        changed,
      );
      const after = await authority.approvalFreshness(runtime, approval);
      await coord.reconcileSources(runtime);
      const updated = coord.getWorkItem(runtime, work);
      const tasks = await coord.listExecutionTasks(runtime, work);
      console.log(JSON.stringify({
        before,
        write,
        after,
        stage: updated.stage,
        status: updated.status,
        taskStates: tasks.map((task) => task.state),
      }));
      database.close();
    `) as {
      before: { fresh: boolean; changedOwners: string[] };
      write: { tag: string };
      after: { fresh: boolean; changedOwners: string[] };
      stage: string;
      status: string;
      taskStates: string[];
    };

    expect(output.before).toEqual({ fresh: true, changedOwners: [] });
    expect(output.write.tag).toBe("UPDATED");
    expect(output.after).toEqual({ fresh: false, changedOwners: ["R1"] });
    expect(output.stage).toBe("R1");
    expect(output.status).toBe("ACTIVE");
    expect(output.taskStates.every((stateValue) => stateValue === "BLOCKED")).toBe(true);
  });

  it("converges created and discovered sources through the same registered WorkItem semantics", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-registration-owner-");
    const output = bunEval(`
      const sourceCore = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );

      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "registration semantics",
        concernIds: ["shell"],
      });

      const discoveredId = rt.newWorkItemId();
      sourceShell.createWorkItemSourceFile(
        ${JSON.stringify(repository)},
        "docs/order/work-items",
        discoveredId,
        sourceCore.renderWorkItemSourceMarkdown({
          formatVersion: 1,
          id: discoveredId,
          projectId: "fixture",
          concernIds: ["shell"],
          schemaId: "change-v1",
        }, "registration semantics"),
      );
      const reconciliation = await coord.reconcileSources(runtime);
      const discovered = coord.getWorkItem(runtime, discoveredId);
      const projection = (item) => ({
        projectId: item.projectId,
        title: item.title,
        schemaId: item.schemaId,
        stage: item.stage,
        status: item.status,
        outcome: item.outcome,
        concernIds: item.concernIds,
        archived: item.archived,
      });
      console.log(JSON.stringify({
        createdOrigin: created.origin,
        discoveredOrigin: discovered.origin,
        sameSemantics:
          JSON.stringify(projection(created)) === JSON.stringify(projection(discovered)),
        registered: reconciliation.registered,
      }));
      database.close();
    `) as {
      createdOrigin: string;
      discoveredOrigin: string;
      sameSemantics: boolean;
      registered: string[];
    };

    expect(output.createdOrigin).toBe("CREATED");
    expect(output.discoveredOrigin).toBe("DISCOVERED");
    expect(output.sameSemantics).toBe(true);
    expect(output.registered).toHaveLength(1);
  });

  it("keeps unresolved project and concern diagnostics as distinct typed source conditions", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-resolution-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const sourceCore = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );

      const unknownProjectId = rt.newWorkItemId();
      sourceShell.createWorkItemSourceFile(runtime.config.repositoryRoots[0], "docs/order/work-items", unknownProjectId,
        sourceCore.renderWorkItemSourceMarkdown({
          formatVersion: 1,
          id: unknownProjectId,
          projectId: "unknown-project",
          concernIds: [],
          schemaId: "change-v1",
        }, "unknown project"),
      );

      const unknownConcernId = rt.newWorkItemId();
      sourceShell.createWorkItemSourceFile(runtime.config.repositoryRoots[0], "docs/order/work-items", unknownConcernId,
        sourceCore.renderWorkItemSourceMarkdown({
          formatVersion: 1,
          id: unknownConcernId,
          projectId: "fixture",
          concernIds: ["missing"],
          schemaId: "change-v1",
        }, "unknown concern"),
      );

      const reconciliation = await coord.reconcileSources(runtime);
      console.log(JSON.stringify({
        codes: reconciliation.diagnostics.map((item) => item.code).sort(),
        count: coord.listWorkItems(runtime).length,
      }));
      database.close();
    `) as { codes: string[]; count: number };

    expect(output.codes).toEqual(["UNRESOLVED_CONCERN", "UNRESOLVED_PROJECT"]);
    expect(output.count).toBe(0);
  });

  it("keeps the deterministic source path authoritative when bytes are moved elsewhere", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-deterministic-boundary-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "deterministic source boundary",
        concernIds: ["shell"],
      });
      const original = path.join(runtime.config.repositoryRoots[0], created.sourcePath);
      const movedPath = path.join(runtime.config.repositoryRoots[0], "moved-work-request.md");
      fs.renameSync(original, movedPath);

      let rejected = false;
      try {
        await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      } catch {
        rejected = true;
      }
      const reconciliation = await coord.reconcileSources(runtime);
      const after = coord.getWorkItem(runtime, created.id);
      console.log(JSON.stringify({
        rejected,
        runCount: coord.listRuns(runtime, created.id).length,
        sourcePath: after.sourcePath,
        codes: reconciliation.diagnostics
          .filter((item) => item.workItemId === created.id)
          .map((item) => item.code),
      }));
      database.close();
    `) as {
      rejected: boolean;
      runCount: number;
      sourcePath: string;
      codes: string[];
    };

    expect(output.rejected).toBe(true);
    expect(output.runCount).toBe(0);
    expect(output.sourcePath).toMatch(
      /^docs\/order\/work-items\/work_.+\/work-request\.md$/,
    );
    expect(output.codes).toContain("MISSING_SOURCE");
  });

  it("does not create duplicate WorkItems when a second repository reuses an existing WorkItem id", () => {
    const repositoryA = createRepository("duplicate-a");
    const repositoryB = createRepository("duplicate-b");
    const state = tempDir("order-daemon-source-duplicate-");

    const output = bunEval(`
      const sourceCore = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositories = [
        ${JSON.stringify(repositoryA)},
        ${JSON.stringify(repositoryB)},
      ];
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: repositories,
          referenceRoots: [],
        },
      );
      const id = rt.newWorkItemId();
      for (const [index, repositoryRoot] of repositories.entries()) {
        const markdown = sourceCore.renderWorkItemSourceMarkdown({
          formatVersion: 1,
          id,
          projectId: index === 0 ? "duplicate-a" : "duplicate-b",
          concernIds: [],
          schemaId: "change-v1",
        }, "duplicate source");
        sourceShell.createWorkItemSourceFile(
          repositoryRoot,
          "docs/order/work-items",
          id,
          markdown,
        );
      }
      const reconciliation = await coord.reconcileSources(runtime);
      console.log(JSON.stringify({
        codes: reconciliation.diagnostics.map((item) => item.code),
        count: coord.listWorkItems(runtime).length,
      }));
      database.close();
    `) as { codes: string[]; count: number };

    expect(output.codes.filter((code) => code === "DUPLICATE_WORK_ITEM_ID")).toHaveLength(2);
    expect(output.count).toBe(0);
  });

  it("materializes current lifecycle Markdown snapshots from latest STAGE lineage", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-current-lifecycle-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });
    writeFileSync(join(repository, "docs", "plan.md"), "plan original\n");

    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const run = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const workItem = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "current lifecycle",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, workItem.id, {
        stage: "R3",
        status: "ACTIVE",
        outcome: null,
      });
      const beforeBytes = new TextEncoder().encode("plan original\\n");
      const plan = {
        id: rt.newArtifactRefId(),
        workItemId: workItem.id,
        repositoryPath: "docs/plan.md",
        role: "PLAN",
        authorityLayer: "P7",
        sha256: rt.sha256(beforeBytes),
        gitCommit: null,
      };
      sql.storeArtifact(database, plan);
      const runRow = run.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "PLAN",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: run.nextAttempt(runtime, workItem.id, "PLAN", null),
        baselineCommit: await (await import("./src/shell/repository.ts")).resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: rt.sha256(new TextEncoder().encode("context")),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      run.appendRunEvent(runtime, runRow.id, {
        tag: "STAGE_COMPLETED",
        completion: { stage: "PLAN", outcome: "ACCEPTED" },
        artifactRefIds: [plan.id],
      });
      fs.writeFileSync(${JSON.stringify(repository)} + "/docs/plan.md", "plan externally changed\\n");

      const current = await coord.listCurrentLifecycleArtifacts(runtime, workItem.id);
      const drafts = await authority.currentStageDraftArtifacts(
        runtime,
        coord.getWorkItem(runtime, workItem.id),
        "PLAN",
      );
      const content = await coord.readArtifactContent(runtime, drafts[0].id);
      console.log(JSON.stringify({
        count: current.length,
        draftCount: drafts.length,
        oldId: plan.id,
        currentId: drafts[0]?.id ?? null,
        currentHash: drafts[0]?.sha256 ?? null,
        text: new TextDecoder().decode(content),
      }));
      database.close();
    `) as {
      count: number;
      draftCount: number;
      oldId: string;
      currentId: string | null;
      currentHash: string | null;
      text: string;
    };

    expect(output.count).toBe(0);
    expect(output.draftCount).toBe(1);
    expect(output.currentId).not.toBe(output.oldId);
    expect(output.currentHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(output.text).toBe("plan externally changed\n");
  });

  it("returns direct PLAN Markdown edits to PLAN and rejects direct R3 mutation", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-direct-edit-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });
    writeFileSync(join(repository, "docs", "plan.md"), "plan before\n");
    writeFileSync(join(repository, "docs", "r3.md"), "r3 before\n");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const stageOwner = await import("./src/daemon/stage.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const workItem = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "direct edit",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, workItem.id, {
        stage: "AWAITING_SIGNOFF",
        status: "ACTIVE",
        outcome: null,
      });
      const planBytes = new TextEncoder().encode("plan before\\n");
      const r3Bytes = new TextEncoder().encode("r3 before\\n");
      const plan = {
        id: rt.newArtifactRefId(),
        workItemId: workItem.id,
        repositoryPath: "docs/plan.md",
        role: "PLAN",
        authorityLayer: "P7",
        sha256: rt.sha256(planBytes),
        gitCommit: null,
      };
      const r3 = {
        id: rt.newArtifactRefId(),
        workItemId: workItem.id,
        repositoryPath: "docs/r3.md",
        role: "R3",
        authorityLayer: null,
        sha256: rt.sha256(r3Bytes),
        gitCommit: null,
      };
      sql.storeArtifact(database, plan);
      sql.storeArtifact(database, r3);
      const priorPlanRun = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "PLAN",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "COMPLETED",
        attempt: 1,
        baselineCommit: "a".repeat(40),
        contextHash: "sha256:" + "a".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-11T04:00:00.000Z",
        endedAt: "2026-11-11T04:00:00.000Z",
      });
      runStore.appendRunEvent(runtime, priorPlanRun.id, {
        tag: "STAGE_COMPLETED", completion: { stage: "PLAN", outcome: "ACCEPTED" },
        artifactRefIds: [plan.id],
      });
      runStore.appendRunEvent(runtime, priorPlanRun.id, {
        tag: "CONFORMANCE_PASSED",
        stage: "PLAN",
        outputArtifactRefIds: [plan.id],
        contextHash: priorPlanRun.contextHash,
        evidence: [],
      });

      const saved = await coord.saveArtifactContent(runtime, plan.id, {
        expectedSha256: plan.sha256,
        markdown: "plan after\\n",
      });
      const after = coord.getWorkItem(runtime, workItem.id);
      const currentLifecycle = await coord.listCurrentLifecycleArtifacts(runtime, workItem.id);
      const currentPlan = currentLifecycle.find((artifact) => artifact.role === "PLAN") ?? null;
      const drafts = await authority.currentStageDraftArtifacts(runtime, after, "PLAN");
      const completionArtifacts = authority.currentStageCompletionArtifacts(
        runtime,
        after,
        "PLAN",
      );
      const contextState = await authority.resolveStageContextState(runtime, after, "PLAN");
      const prompt = await stageOwner.stagePrompt(
        after,
        "PLAN",
        contextState.context,
        drafts,
        [],
        undefined,
        completionArtifacts,
      );
      let r3Rejected = false;
      try {
        await coord.saveArtifactContent(runtime, r3.id, {
          expectedSha256: r3.sha256,
          markdown: "r3 after\\n",
        });
      } catch {
        r3Rejected = true;
      }
      console.log(JSON.stringify({
        saved,
        stage: after.stage,
        originalPlanId: plan.id,
        currentPlanId: currentPlan?.id ?? null,
        currentPlanSha256: currentPlan?.sha256 ?? null,
        draftCount: drafts.length,
        draftSha256: drafts[0]?.sha256 ?? null,
        promptHasDraft:
          prompt.includes("Current stage draft for review") &&
          prompt.includes("plan after"),
        completionArtifactId: completionArtifacts[0]?.id ?? null,
        promptHasCompletionBinding:
          completionArtifacts.length === 1 &&
          prompt.includes(completionArtifacts[0].id),
        conformanceCount: runStore.listRunEvents(runtime, priorPlanRun.id)
          .filter((event) => event.event.tag === "CONFORMANCE_PASSED").length,
        r3Rejected,
      }));
      database.close();
    `) as {
      saved: { tag: string; sha256: string };
      stage: string;
      originalPlanId: string;
      currentPlanId: string | null;
      currentPlanSha256: string | null;
      draftCount: number;
      draftSha256: string | null;
      promptHasDraft: boolean;
      completionArtifactId: string | null;
      promptHasCompletionBinding: boolean;
      conformanceCount: number;
      r3Rejected: boolean;
    };

    expect(output.saved.tag).toBe("UPDATED");
    expect(output.saved.sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(output.stage).toBe("PLAN");
    expect(output.currentPlanId).not.toBeNull();
    expect(output.currentPlanId).not.toBe(output.originalPlanId);
    expect(output.currentPlanSha256).toBe(output.saved.sha256);
    expect(output.draftCount).toBe(1);
    expect(output.draftSha256).toBe(output.saved.sha256);
    expect(output.promptHasDraft).toBe(true);
    expect(output.completionArtifactId).toBe(output.currentPlanId);
    expect(output.promptHasCompletionBinding).toBe(true);
    expect(output.conformanceCount).toBe(1);
    expect(output.r3Rejected).toBe(true);
    expect(readFileSync(join(repository, "docs", "plan.md"), "utf8")).toBe("plan after\n");
    expect(readFileSync(join(repository, "docs", "r3.md"), "utf8")).toBe("r3 before\n");
  });

  it("reconciles a pending deterministic-path proposal from repository facts on the next coordinator pass", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-proposal-reconcile-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const workItem = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "proposal",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, workItem.id);
      const proposalPath =
        "docs/order/work-items/" + workItem.id + "/research.md";
      const absoluteProposal = path.join(${JSON.stringify(repository)}, proposalPath);
      fs.writeFileSync(absoluteProposal, "accepted\\n");
      const proposalDiff = Bun.spawnSync(
        ["git", "diff", "--no-index", "--binary", "--", "/dev/null", proposalPath],
        {
          cwd: ${JSON.stringify(repository)},
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      if (proposalDiff.exitCode !== 1) {
        throw new TypeError("failed to create proposal diff");
      }
      const diff = new TextDecoder().decode(proposalDiff.stdout);
      fs.rmSync(absoluteProposal);

      const baseline = await repo.resolveHeadCommit(${JSON.stringify(repository)});
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: baseline,
        contextHash: "sha256:" + "a".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-11T04:00:00.000Z",
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: "R1",
        mode: "INTERACTIVE",
        contextHash: run.contextHash,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "AGENT_MESSAGE_FINAL",
        text: "proposal ready",
        evidence: [],
      });
      const proposal = runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: proposalPath,
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: diff,
        rationale: "test proposal",
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: proposal.id,
      });
      await repo.adoptProposalPatch(
        ${JSON.stringify(repository)},
        proposalPath,
        null,
        diff,
      );

      const tick = await coord.runCoordinatorTick(runtime);
      const events = coord.listRunEvents(runtime, run.id);
      const disposition = events.find((event) =>
        event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
      );
      console.log(JSON.stringify({
        tick,
        disposition: disposition?.event ?? null,
        content: await Bun.file(absoluteProposal).text(),
        stage: coord.getWorkItem(runtime, workItem.id).stage,
        proposalPath,
      }));
      database.close();
    `) as {
      tick: { result: string };
      disposition: { tag: string; disposition: string } | null;
      content: string;
      stage: string;
      proposalPath: string;
    };

    expect(output.tick.result).toBe("NO_WORK");
    expect(output.disposition).toMatchObject({
      tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
      disposition: "ADOPTED",
    });
    expect(output.content).toBe("accepted\n");
    expect(output.proposalPath).toMatch(/\/research\.md$/);
    expect(output.stage).toBe("R1");
  }, 30_000);

  it("resolves manifest precedence and P1 governance before STAGE provider use", () => {
    const repository = createRepository();
    writeFileSync(join(repository, "docs", "principles.md"), "# project principles\n");
    writeFileSync(join(repository, "docs", "product-a.md"), "# product A\n");
    writeFileSync(join(repository, "docs", "product-b.md"), "# product B\n");
    const manifest = fixtureManifest
      .replace(
        'p1 = ["AGENTS.md"]',
        'p1 = ["AGENTS.md", "docs/principles.md"]',
      )
      .replace(
        "p2 = []",
        'p2 = ["docs/product-a.md", "docs/product-b.md"]',
      )
      .replace(
        "[refs]\n",
        [
          "[refs]",
          'P1-STRICT = "docs/principles.md"',
          'P1-FCIS-EXT = "AGENTS.md"',
          "",
        ].join("\n"),
      )
      .replace(
        "[governance.fitness]\n",
        [
          "[precedence]",
          'p2 = ["docs/product-b.md", "docs/product-a.md"]',
          "",
          "[[governance.overrides]]",
          'defaultRuleId = "GW-P1-STRICT-TYPING"',
          'source = "docs/principles.md"',
          'authorityRef = "P1-STRICT"',
          'gates = ["architecture"]',
          "",
          "[[governance.extensions]]",
          'defaultRuleId = "GW-P1-FCIS"',
          'source = "AGENTS.md"',
          'authorityRef = "P1-FCIS-EXT"',
          'gates = ["test"]',
          "",
          "[governance.fitness]",
          "",
        ].join("\n"),
      );
    writeFileSync(join(repository, "pontivus-order.toml"), manifest);
    runGit(repository, "add", ".");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-resolved-authority-");
    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const stage = await import("./src/daemon/stage.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "resolved authority",
        concernIds: ["shell"],
      });
      const current = coord.getWorkItem(runtime, created.id);
      const [, reachable] = await authority.resolveCurrentStageAuthority(
        current,
        "R1",
      );
      const resolved = await authority.resolveStageContextState(
        runtime,
        current,
        "R1",
      );
      const prompt = await stage.stagePrompt(
        current,
        "R1",
        resolved.context,
        [],
        [],
      );
      const p2Paths = resolved.context.artifacts
        .filter((artifact) => artifact.authorityLayer === "P2")
        .map((artifact) => artifact.repositoryPath);
      const p1 = reachable.layers.find(
        (entry) => entry.layer === "p1",
      );
      const p2 = reachable.layers.find(
        (entry) => entry.layer === "p2",
      );
      const materialP2 = resolved.context.authority.layers.find(
        (entry) => entry.layer === "p2",
      );

      const invalidManifest = fs.readFileSync(
        repositoryRoot + "/pontivus-order.toml",
        "utf8",
      ).replace(
        'p2 = ["docs/product-b.md", "docs/product-a.md"]',
        'p2 = ["docs/product-b.md", "docs/missing.md"]',
      );
      fs.writeFileSync(repositoryRoot + "/pontivus-order.toml", invalidManifest);
      let blockedBeforeRun = false;
      try {
        await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      } catch {
        blockedBeforeRun = coord.listRuns(runtime, created.id).length === 0;
      }
      console.log(JSON.stringify({
        p1,
        p2,
        p2Paths,
        materialP2,
        inherited: resolved.context.authority.inheritedDefaultRuleIds,
        fitness: resolved.context.authority.fitnessGateIds,
        promptHasProjection: prompt.includes("Resolved project authority projection:"),
        blockedBeforeRun,
      }));
      database.close();
    `) as {
      p1: { layer: string; sources: string[]; precedence: string[] };
      p2: { layer: string; sources: string[]; precedence: string[] };
      p2Paths: string[];
      materialP2: { layer: string; sources: string[]; precedence: string[] };
      inherited: string[];
      fitness: string[];
      promptHasProjection: boolean;
      blockedBeforeRun: boolean;
    };

    expect(output.p1.sources).toEqual(["AGENTS.md", "docs/principles.md"]);
    expect(output.p2).toEqual({
      layer: "p2",
      sources: ["docs/product-b.md", "docs/product-a.md"],
      precedence: ["docs/product-b.md", "docs/product-a.md"],
    });
    expect(output.p2Paths).toEqual([]);
    expect(output.materialP2).toEqual({
      layer: "p2",
      sources: [],
      precedence: [],
    });
    // Reachability/precedence remain available to governance while the
    // productive context excludes unrelated selected sources.
    expect(output.inherited).toContain("GW-P1-FCIS");
    expect(output.inherited).not.toContain("GW-P1-STRICT-TYPING");
    expect(output.fitness).toEqual(["architecture", "test"]);
    expect(output.promptHasProjection).toBe(true);
    expect(output.blockedBeforeRun).toBe(true);
  }, 30_000);


  it("binds current-v2 and historical schema pins to their exact lifecycle authority refs", () => {
    const resolve = (schema: "change-v1" | "change-v2") => {
      const repository = createRepository("fixture");
      writeFileSync(join(repository, "docs", "work-lifecycle.md"), "# work lifecycle\n");
      writeFileSync(join(repository, "docs", "lifecycle-context-current.md"), "# current lifecycle context\n");
      writeFileSync(join(repository, "docs", "lifecycle-context-v1.md"), "# retained lifecycle context v1\n");
      const manifestPath = join(repository, "pontivus-order.toml");
      const manifest = readFileSync(manifestPath, "utf8")
        .replace(
          "p3 = []",
          'p3 = ["docs/work-lifecycle.md", "docs/lifecycle-context-current.md", "docs/lifecycle-context-v1.md"]',
        )
        .replace(
          'GW-DOC-WORK-LIFECYCLE-V1 = "AGENTS.md"',
          'GW-DOC-WORK-LIFECYCLE-V1 = "docs/work-lifecycle.md"',
        )
        .replace(
          'GW-DOC-LIFECYCLE-CONTEXT-V1 = "AGENTS.md"',
          'GW-DOC-LIFECYCLE-CONTEXT-V1 = "docs/lifecycle-context-v1.md"',
        )
        .replace(
          'GW-DOC-LIFECYCLE-CONTEXT-V2 = "AGENTS.md"',
          'GW-DOC-LIFECYCLE-CONTEXT-V2 = "docs/lifecycle-context-current.md"',
        );
      writeFileSync(manifestPath, manifest);
      runGit(repository, "add", ".");
      runGit(repository, "commit", "--amend", "--no-edit");

      const state = tempDir("order-daemon-authority-pin-");
      try {
        return bunEval(`
          const sql = await import("./src/shell/sqlite.ts");
          const coord = await import("./src/daemon/coordinator.ts");
          const authority = await import("./src/daemon/authority.ts");
          const database = sql.openOrderDatabase(${JSON.stringify(state)});
          const repositoryRoot = ${JSON.stringify(repository)};
          const runtime = coord.createCoordinatorRuntime(
            database,
            ${JSON.stringify(state)},
            process.env,
            {
              version: 4,
              model: { providerID: "opencode", id: "glm-5.3-flash-free" },
              repositoryRoots: [repositoryRoot],
              referenceRoots: [],
            },
          );
          const created = await coord.createWorkItem(runtime, {
            projectId: "fixture",
            schemaId: ${JSON.stringify(schema)},
            title: "authority pin",
            concernIds: [],
          });
          const current = coord.getWorkItem(runtime, created.id);
          const resolved = await authority.resolveStageContextState(
            runtime,
            current,
            "R1",
          );
          const p3Paths = resolved.context.artifacts
            .filter((artifact) => artifact.authorityLayer === "P3")
            .map((artifact) => artifact.repositoryPath);
          console.log(JSON.stringify({
            staleStage: resolved.staleStage,
            p3Paths,
          }));
          database.close();
        `) as { staleStage: string | null; p3Paths: string[] };
      } finally {
        rmSync(repository, { recursive: true, force: true });
        rmSync(state, { recursive: true, force: true });
      }
    };

    const current = resolve("change-v2");
    expect(current.staleStage).toBeNull();
    expect(current.p3Paths).toEqual([
      "docs/lifecycle-context-current.md",
      "docs/work-lifecycle.md",
    ]);

    const retained = resolve("change-v1");
    expect(retained.staleStage).toBeNull();
    expect(retained.p3Paths).toEqual([
      "docs/lifecycle-context-v1.md",
      "docs/work-lifecycle.md",
    ]);
  }, 60_000);
  it("requires fresh producing context for new exact declarations and excludes prose-only authority", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-producing-authority-");
    const binary = createFakeOpenCode("stage-bound-r1");
    for (const name of ["additional", "dependency", "historical"]) {
      writeFileSync(join(repository, "docs", name + ".md"), "# " + name + "\n");
    }
    const manifestPath = join(repository, "pontivus-order.toml");
    const manifest = readFileSync(manifestPath, "utf8")
      .replace("p3 = []", 'p3 = ["docs/additional.md", "docs/dependency.md", "docs/historical.md"]')
      .replace("[refs]\n", '[refs]\nEXTRA = "docs/additional.md"\nDEPENDENCY = "docs/dependency.md"\nHISTORICAL = "docs/historical.md"\n')
      .replace("[governance.fitness]", '[refDependencies]\nEXTRA = ["DEPENDENCY"]\n\n[governance.fitness]');
    writeFileSync(manifestPath, manifest);
    runGit(repository, "add", ".");
    runGit(repository, "commit", "--amend", "--no-edit");
    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const source = await import("./src/core/work-item-source.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(database, ${JSON.stringify(state)}, process.env, {
        version: 4, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [repositoryRoot], referenceRoots: [],
      });
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture", schemaId: "change-v2", title: "producing authority", concernIds: [],
      });
      const work = coord.getWorkItem(runtime, created.id);
      const outputPath = source.workItemDocumentPath("docs/order/work-items", work.id, "R1");
      fs.writeFileSync(path.join(repositoryRoot, outputPath),
        source.stageTemplateForSchema("change-v2", "R1").replace(" -->", ", EXTRA -->") +
          "\\nHISTORICAL is mentioned only as evidence.\\n");
      const artifact = await authority.currentFileArtifact(runtime, work, outputPath, "R1", "P1");
      fs.writeFileSync(path.join(path.dirname(process.env.PONTIVUS_ORDER_OPENCODE_BIN), "binding-id"), artifact.id);
      const initial = await authority.resolveStageContextState(runtime, work, "R1");
      const candidate = await authority.resolveStageContextState(runtime, work, "R1", false, artifact);
      const settle = async () => {
        const run = await coord.startStageRun(runtime, work.id, "INTERACTIVE");
        await Promise.all([...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)));
        return { run: coord.getRun(runtime, run.id), events: coord.listRunEvents(runtime, run.id) };
      };
      const first = await settle();
      const second = await settle();
      const current = coord.getWorkItem(runtime, work.id);
      const downstream = await authority.resolveStageContextState(runtime, current, "R2", false);
      const paths = (context) => context.artifacts.map((item) => item.repositoryPath);
      console.log(JSON.stringify({
        initial: paths(initial.context), producing: paths(candidate.context),
        firstStatus: first.run.status, secondStatus: second.run.status,
        firstFailed: first.events.some((event) => event.event.tag === "CONFORMANCE_FAILED" &&
          event.event.summary.includes("stage context changed")),
        secondConformed: second.events.some((event) => event.event.tag === "CONFORMANCE_PASSED"),
        stage: current.stage, downstream: paths(downstream.context), outputPath,
        downstreamStale: downstream.staleStage,
      }));
      database.close();
    `, providerEnvironment(binary, state), 60_000) as {
      initial: string[]; producing: string[]; firstStatus: string; secondStatus: string;
      firstFailed: boolean; secondConformed: boolean; stage: string; downstream: string[];
      outputPath: string; downstreamStale: string | null;
    };
    expect(output.initial).not.toContain("docs/additional.md");
    expect(output.producing).toContain("docs/additional.md");
    expect(output.producing).toContain("docs/dependency.md");
    expect(output.producing).not.toContain(output.outputPath);
    expect(output.producing).not.toContain("docs/historical.md");
    expect(output.firstStatus).toBe("BLOCKED");
    expect(output.firstFailed).toBe(true);
    expect(output.secondStatus).toBe("COMPLETED");
    expect(output.secondConformed).toBe(true);
    expect(output.stage).toBe("R2");
    expect(output.downstreamStale).toBeNull();
    expect(output.downstream).toContain("docs/additional.md");
    expect(output.downstream).toContain("docs/dependency.md");
    expect(output.downstream).not.toContain("docs/historical.md");
  }, 60_000);

  it("blocks before provider use when pinned template authority is unresolved", () => {
    const repository = createRepository();
    const manifestPath = join(repository, "pontivus-order.toml");
    writeFileSync(
      manifestPath,
      readFileSync(manifestPath, "utf8").replace(
        'GW-DOC-LIFECYCLE-CONTEXT-V2 = "AGENTS.md"\n',
        "",
      ),
    );
    runGit(repository, "add", "pontivus-order.toml");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-unresolved-template-authority-");
    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v2",
        title: "unresolved template authority",
        concernIds: [],
      });
      let error = null;
      try {
        await authority.resolveStageContextState(
          runtime,
          coord.getWorkItem(runtime, created.id),
          "R1",
        );
      } catch (caught) {
        error = caught instanceof Error ? caught.message : String(caught);
      }
      console.log(JSON.stringify({
        error,
        runCount: coord.listRuns(runtime, created.id).length,
      }));
      database.close();
    `) as { error: string | null; runCount: number };

    expect(output.error).toContain(
      "stage template AuthorityRef is not reachable in R1 context: GW-DOC-LIFECYCLE-CONTEXT-V2",
    );
    expect(output.runCount).toBe(0);
  }, 30_000);
  it.each([
    ["R2", "P2", "ordinary"],
    ["R2", "P2", "before-effect"],
    ["R2", "P2", "after-effect"],
    ["DESIGN", "P4", "before-effect"],
    ["DESIGN", "P4", "after-effect"],
  ] as const)("adopts %s %s permanent authority with %s intent and rejects a stale base", (ownerStage, layer, interruption) => {
    const repository = createRepository();
    writeFileSync(join(repository, "docs", "product.md"), "# product\n");
    writeFileSync(
      join(repository, "pontivus-order.toml"),
      fixtureManifest.replace(layer.toLowerCase() + " = []", layer.toLowerCase() + ' = ["docs/product.md"]'),
    );
    runGit(repository, "add", ".");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-governance-proposal-");
    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const repositoryRoot = ${JSON.stringify(repository)};
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [repositoryRoot],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "governance proposal",
        concernIds: ["shell"],
      });
      sql.updateWorkItemLifecycle(database, created.id, {
        stage: ${JSON.stringify(ownerStage)},
        status: "ACTIVE",
        outcome: null,
      });
      const workItem = coord.getWorkItem(runtime, created.id);
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: ${JSON.stringify(ownerStage)},
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
        contextHash: rt.sha256Text("governance-proposal"),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: ${JSON.stringify(ownerStage)},
        mode: "INTERACTIVE",
        contextHash: run.contextHash,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "AGENT_MESSAGE_FINAL",
        text: "Permanent authority proposal ready",
        evidence: [],
      });
      const productPath = "docs/product.md";
      const base = rt.sha256Text("# product\\n");
      const rejectedPostimages = [];
      // Exercise the real Git patch effect through daemon admission, not a
      // synthetic invalid diff or an already-rejected pathname.
      for (const fault of ["delete", "symlink"]) {
        const absolute = repositoryRoot + "/" + productPath;
        fs.unlinkSync(absolute);
        if (fault === "symlink") fs.symlinkSync("nonexistent.md", absolute);
        const diff = Bun.spawnSync(["git", "diff", "--binary", "--", productPath], {
          cwd: repositoryRoot, stdout: "pipe", stderr: "pipe",
        });
        if (fault === "symlink") fs.unlinkSync(absolute);
        fs.writeFileSync(absolute, "# product\\n");
        if (diff.exitCode !== 0 || diff.stdout.length === 0) throw new Error("failed to generate invalid-postimage fixture");
        const invalid = runStore.appendRunEvent(runtime, run.id, {
          tag: "ARTIFACT_PROPOSAL_CREATED", targetPath: productPath, baseSha256: base,
          role: "GOVERNANCE", authorityLayer: ${JSON.stringify(layer)},
          unifiedDiff: new TextDecoder().decode(diff.stdout), rationale: "Reject nonregular result",
        });
        let error = null;
        try { await coord.adoptArtifactProposal(runtime, invalid.id); }
        catch (failure) { error = String(failure); }
        const preserved = fs.lstatSync(absolute).isFile() &&
          fs.readFileSync(absolute, "utf8") === "# product\\n";
        const intent = coord.listRunEvents(runtime, run.id).some(event =>
          event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" &&
          event.event.proposalEventId === invalid.id);
        rejectedPostimages.push({ fault, error, preserved, intent });
        if (!preserved || intent || error === null) throw new Error("unsafe nonregular proposal admission");
        await coord.rejectArtifactProposal(runtime, invalid.id);
        runStore.appendRunEvent(runtime, run.id, {
          tag: "AGENT_MESSAGE_FINAL", text: "Corrected permanent authority proposal", evidence: [],
        });
      }
      const proposal = runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: productPath,
        baseSha256: base,
        role: "GOVERNANCE",
        authorityLayer: ${JSON.stringify(layer)},
        unifiedDiff:
          "--- a/docs/product.md\\n" +
          "+++ b/docs/product.md\\n" +
          "@@ -1 +1 @@\\n" +
          "-# product\\n" +
          "+# product adopted\\n",
        rationale: "Adopt the durable product decision",
      });
      const manifestPath = repositoryRoot + "/pontivus-order.toml";
      const originalManifest = fs.readFileSync(manifestPath, "utf8");
      const ownerLayer = ${JSON.stringify(layer)}.toLowerCase();
      fs.writeFileSync(manifestPath, originalManifest.replace(ownerLayer + ' = ["docs/product.md"]', ownerLayer + " = []"));
      let changedOwnerError = null;
      try { await coord.adoptArtifactProposal(runtime, proposal.id); }
      catch (error) { changedOwnerError = String(error); }
      fs.writeFileSync(manifestPath, originalManifest);
      // An exact postimage without persisted human intent is still stale.
      await repo.adoptProposalPatch(repositoryRoot, productPath, base, proposal.event.unifiedDiff);
      let noIntentError = null;
      try { await coord.adoptArtifactProposal(runtime, proposal.id); }
      catch (error) { noIntentError = String(error); }
      const noIntentPreserved = fs.readFileSync(repositoryRoot + "/" + productPath, "utf8") === "# product adopted\\n";
      const prematureIntent = coord.listRunEvents(runtime, run.id).some(event =>
        event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" && event.event.proposalEventId === proposal.id);
      fs.writeFileSync(repositoryRoot + "/" + productPath, "# product\\n");
      if (changedOwnerError === null || noIntentError === null || !noIntentPreserved || prematureIntent) {
        throw new Error("unsafe governance adoption without current owner and intent");
      }
      if (${JSON.stringify(interruption)} !== "ordinary") {
        runStore.appendRunEvent(runtime, run.id, {
          tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
          proposalEventId: proposal.id,
        });
      }
      if (${JSON.stringify(interruption)} === "after-effect") {
        await repo.adoptProposalPatch(repositoryRoot, productPath, base, proposal.event.unifiedDiff);
      }
      const adopted = await coord.adoptArtifactProposal(runtime, proposal.id);
      let repeatedError = null;
      try { await coord.adoptArtifactProposal(runtime, proposal.id); }
      catch (error) { repeatedError = String(error); }
      const repeatedPreserved = fs.readFileSync(repositoryRoot + "/" + productPath, "utf8") === "# product adopted\\n";
      const exactDispositions = coord.listRunEvents(runtime, run.id).filter(event =>
        event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" && event.event.proposalEventId === proposal.id).length;
      let driftError = null;
      const driftPath = "docs/drift.md";
      const before = "line one\\nline two\\nline three\\nline four\\nline five\\n";
      const driftPatch = "--- a/docs/drift.md\\n+++ b/docs/drift.md\\n@@ -1,3 +1,3 @@\\n-line one\\n+adopted one\\n line two\\n line three\\n";
      fs.writeFileSync(repositoryRoot + "/" + driftPath, before);
      await repo.adoptProposalPatch(repositoryRoot, driftPath, rt.sha256Text(before), driftPatch);
      fs.appendFileSync(repositoryRoot + "/" + driftPath, "unrelated change\\n");
      const observed = fs.readFileSync(repositoryRoot + "/" + driftPath, "utf8");
      try {
        await repo.adoptProposalPatch(repositoryRoot, driftPath, rt.sha256Text(before), driftPatch, true);
      } catch (error) {
        driftError = error instanceof Error ? error.message : String(error);
      }
      const driftPreserved = fs.readFileSync(repositoryRoot + "/" + driftPath, "utf8") === observed;
      const danglingPath = "docs/dangling.md";
      const danglingTarget = repositoryRoot + "/docs/nonexistent.md";
      fs.symlinkSync(danglingTarget, repositoryRoot + "/" + danglingPath);
      const newPatch = "diff --git a/docs/dangling.md b/docs/dangling.md\\nnew file mode 100644\\n--- /dev/null\\n+++ b/docs/dangling.md\\n@@ -0,0 +1 @@\\n+new\\n";
      let danglingRejected = false;
      try { await repo.adoptProposalPatch(repositoryRoot, danglingPath, null, newPatch, true); }
      catch (error) { danglingRejected = String(error).includes("symlink"); }
      const danglingPreserved = fs.lstatSync(repositoryRoot + "/" + danglingPath).isSymbolicLink() &&
        fs.readlinkSync(repositoryRoot + "/" + danglingPath) === danglingTarget && !fs.existsSync(danglingTarget);

      runStore.appendRunEvent(runtime, run.id, {
        tag: "AGENT_MESSAGE_FINAL",
        text: "Second permanent authority proposal",
        evidence: [],
      });
      const staleBase = rt.sha256Text("# product adopted\\n");
      const stale = runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: productPath,
        baseSha256: staleBase,
        role: "GOVERNANCE",
        authorityLayer: ${JSON.stringify(layer)},
        unifiedDiff:
          "--- a/docs/product.md\\n" +
          "+++ b/docs/product.md\\n" +
          "@@ -1 +1 @@\\n" +
          "-# product adopted\\n" +
          "+# stale attempt\\n",
        rationale: "This base will become stale",
      });
      fs.writeFileSync(repositoryRoot + "/" + productPath, "# external change\\n");
      let staleReadError = null;
      try {
        coord.readArtifactProposalTarget(runtime, stale.id);
      } catch (error) {
        staleReadError = error instanceof Error ? error.message : String(error);
      }
      let staleError = null;
      try {
        await coord.adoptArtifactProposal(runtime, stale.id);
      } catch (error) {
        staleError = error instanceof Error ? error.message : String(error);
      }
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        adopted: {
          role: adopted.role,
          layer: adopted.authorityLayer,
          path: adopted.repositoryPath,
        },
        contentAfterFirstAdoption:
          events.some((event) =>
            event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
            event.event.proposalEventId === proposal.id &&
            event.event.disposition === "ADOPTED"
          ),
        staleReadError,
        staleError,
        driftError,
        driftPreserved, danglingRejected, danglingPreserved, rejectedPostimages,
        changedOwnerError, noIntentError, noIntentPreserved, prematureIntent,
        repeatedError, repeatedPreserved, exactDispositions,
        adoptionRequests: events.filter((event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED"
        ).length,
        stage: coord.getWorkItem(runtime, workItem.id).stage,
      }));
      database.close();
    `) as {
      adopted: { role: string; layer: string; path: string };
      contentAfterFirstAdoption: boolean;
      staleReadError: string | null;
      staleError: string | null;
      driftError: string | null;
      driftPreserved: boolean;
      danglingRejected: boolean;
      danglingPreserved: boolean;
      rejectedPostimages: { fault: string; error: string | null; preserved: boolean; intent: boolean }[];
      changedOwnerError: string | null; noIntentError: string | null; noIntentPreserved: boolean; prematureIntent: boolean;
      repeatedError: string | null; repeatedPreserved: boolean; exactDispositions: number;
      adoptionRequests: number;
      stage: string;
    };

    expect(output.adopted).toEqual({
      role: "GOVERNANCE",
      layer,
      path: "docs/product.md",
    });
    expect(output.contentAfterFirstAdoption).toBe(true);
    expect(output.staleReadError).toContain("baseSha256 is stale");
    expect(output.staleError).toContain("baseSha256 is stale");
    expect(output.adoptionRequests).toBe(1);
    expect(output.stage).toBe(ownerStage);
    expect(output.driftError).toContain("reconstructed base");
    expect(output.driftPreserved).toBe(true);
    expect(output.danglingRejected).toBe(true);
    expect(output.danglingPreserved).toBe(true);
    expect(output.changedOwnerError).toContain("not admitted by current resolved authority");
    expect(output.noIntentError).toContain("baseSha256 is stale");
    expect(output.noIntentPreserved).toBe(true);
    expect(output.prematureIntent).toBe(false);
    expect(output.repeatedError).toContain("already dispositioned");
    expect(output.repeatedPreserved).toBe(true);
    expect(output.exactDispositions).toBe(1);
    expect(output.rejectedPostimages.map(value => value.fault)).toEqual(["delete", "symlink"]);
    for (const value of output.rejectedPostimages) {
      expect(value.error).not.toBeNull();
      expect(value.preserved).toBe(true);
      expect(value.intent).toBe(false);
    }
  }, 30_000);

  it("rejects STAGE completion after durable decision input without later adoption", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-durable-decision-");
    const binary = createFakeOpenCode("stage-durable-complete");
    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "durable decision",
        concernIds: ["shell"],
      });
      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      await Promise.all([...runtime.stageTurnTasks.values()]);
      const request = coord.listRunEvents(runtime, run.id).find(
        (event) => event.event.tag === "HUMAN_INPUT_REQUESTED"
      );
      if (!request || request.event.tag !== "HUMAN_INPUT_REQUESTED") {
        throw new Error("missing durable request");
      }
      await coord.submitRunInput(
        runtime,
        run.id,
        "Use the canonical authority.",
        request.id,
      );
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const finalRun = coord.getRun(runtime, run.id);
      const events = coord.listRunEvents(runtime, run.id);
      const retry = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      await Promise.all([...runtime.stageTurnTasks.values()]);
      const retryEvents = coord.listRunEvents(runtime, retry.id);
      await coord.cancelRun(runtime, retry.id);
      console.log(JSON.stringify({
        status: finalRun.status,
        retryEvidence: retryEvents.some((event) =>
          event.event.tag === "AGENT_MESSAGE_FINAL" &&
          event.event.text === "prior durable decision requires current coverage"
        ),
        terminalClassification: finalRun.terminalClassification,
        completions: events.filter((event) =>
          event.event.tag === "STAGE_COMPLETED"
        ).length,
        providerFailure: events.find((event) =>
          event.event.tag === "PROVIDER_FAILED"
        )?.event ?? null,
        workItem: coord.getWorkItem(runtime, created.id),
      }));
      database.close();
    `, providerEnvironment(binary, state), 30_000) as {
      status: string;
      retryEvidence: boolean;
      terminalClassification: string | null;
      completions: number;
      providerFailure: { tag: string; detail: string } | null;
      workItem: { stage: string; status: string };
    };

    expect(output.status).toBe("FAILED");
    expect(output.terminalClassification).toBe("PROVIDER_FAILURE");
    expect(output.completions).toBe(0);
    expect(output.retryEvidence).toBe(true);
    expect(output.providerFailure?.detail).toContain(
      "later adopted canonical authority proposal",
    );
    expect(output.workItem).toMatchObject({ stage: "R1", status: "ACTIVE" });
  }, 30_000);

  it("carries exact owning-stage decisions and adoption chronology into a fresh Run after explicit source Save", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-decision-history-");
    const binary = createFakeOpenCode("stage-durable-history");
    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const authority = await import("./src/daemon/authority.ts");
      const sourceCore = await import("./src/core/work-item-source.ts");
      const repositoryRoot = ${JSON.stringify(repository)};
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(database, ${JSON.stringify(state)}, process.env, {
        version: 4, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [repositoryRoot], referenceRoots: [],
      });
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture", schemaId: "change-v1", title: "decision history", concernIds: [],
      });
      sql.promoteIdeaToR1(database, created.id);
      const work = coord.getWorkItem(runtime, created.id);
      const baseline = await repo.resolveHeadCommit(repositoryRoot);
      const append = (run, payload) => runStore.appendRunEvent(runtime, run.id, payload);
      const prior = (id, stage, status) => {
        const stamp = rt.nowIsoDateTime();
        const run = runStore.insertRun(runtime, {
          id: rt.newRunId(), workItemId: id, executionTaskId: null,
          stage, mode: "INTERACTIVE", role: "STAGE", triggerEventId: null,
          status: "RUNNING", attempt: runStore.nextAttempt(runtime, id, stage, null),
          baselineCommit: baseline, contextHash: rt.sha256Text("prior decision context"),
          providerSessionId: null, terminalClassification: null, startedAt: stamp, endedAt: null,
        });
        append(run, { tag: "STAGE_STARTED", stage, mode: "INTERACTIVE", contextHash: run.contextHash });
        return { run, finish: () => runStore.updateRun(runtime, run.id, {
          status, terminalClassification: status === "FAILED" ? "PROVIDER_FAILURE" : null, endedAt: rt.nowIsoDateTime(),
        }) };
      };
      const answer = (run, category, question, text) => {
        const request = append(run, { tag: "HUMAN_INPUT_REQUESTED", category, question });
        return append(run, { tag: "HUMAN_INPUT_RECEIVED", requestEventId: request.id, text });
      };
      const first = prior(work.id, "R1", "CANCELLED");
      const firstAnswer = answer(first.run, "AUTHORITY_DECISION", "original decision question", "historical decision alpha");
      answer(first.run, "STAGE_CHOICE", "second decision question", "historical decision beta");
      answer(first.run, "INFORMATION", "ordinary information question", "ordinary information only");
      answer(first.run, "EVIDENCE", "ordinary evidence question", "ordinary evidence only");
      const artifactPath = sourceCore.workItemDocumentPath("docs/order/work-items", work.id, "R1");
      fs.writeFileSync(path.join(repositoryRoot, artifactPath), "unrelated adopted material\\n");
      const artifact = await authority.currentFileArtifact(runtime, work, artifactPath, "R1", "P1");
      const proposed = append(first.run, { tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: artifactPath, baseSha256: null, role: "R1", authorityLayer: "P1",
        unifiedDiff: "--- /dev/null\\n+++ b/" + artifactPath + "\\n@@ -0,0 +1 @@\\n+unrelated adopted material\\n",
        rationale: "unrelated adoption rationale" });
      append(first.run, { tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED", proposalEventId: proposed.id });
      append(first.run, { tag: "ARTIFACT_PROPOSAL_DISPOSITIONED", proposalEventId: proposed.id,
        disposition: "ADOPTED", adoptedArtifactRefId: artifact.id });
      append(first.run, { tag: "HUMAN_INPUT_REQUESTED", category: "AUTHORITY_DECISION", question: "unanswered question excluded" });
      first.finish();
      const failed = prior(work.id, "R1", "FAILED");
      answer(failed.run, "AUTHORITY_CONFLICT", "superseding decision question", "superseding decision gamma");
      failed.finish();
      const otherStage = prior(work.id, "R2", "CANCELLED");
      answer(otherStage.run, "AUTHORITY_DECISION", "foreign-stage question", "foreign-stage decision");
      otherStage.finish();
      const other = await coord.createWorkItem(runtime, {
        projectId: "fixture", schemaId: "change-v1", title: "other item", concernIds: [],
      });
      const otherItem = prior(other.id, "R1", "CANCELLED");
      answer(otherItem.run, "AUTHORITY_DECISION", "foreign-item question", "foreign-item decision");
      otherItem.finish();
      const original = fs.readFileSync(path.join(repositoryRoot, work.sourcePath), "utf8");
      const saved = await coord.saveSource(runtime, work.id, {
        expectedSha256: work.sourceSha256,
        markdown: original + "\\nDurable authority: superseding decision gamma. Retain historical decision beta.\\n",
      });
      const current = coord.getWorkItem(runtime, work.id);
      const fresh = await coord.startStageRun(runtime, work.id, "INTERACTIVE");
      await Promise.all([...runtime.stageTurnTasks.values()]);
      const prompt = fs.readFileSync(path.join(path.dirname(process.env.PONTIVUS_ORDER_OPENCODE_BIN), "durable-history-prompt"), "utf8");
      const events = coord.listRunEvents(runtime, fresh.id);
      await coord.cancelRun(runtime, fresh.id);
      console.log(JSON.stringify({ prompt, saved, sourceHash: current.sourceSha256, artifactId: artifact.id,
        artifactHash: artifact.sha256, firstAnswerId: firstAnswer.id,
        providerObserved: events.some(event => event.event.tag === "AGENT_MESSAGE_FINAL" &&
          event.event.text === "history captured for inspection"),
        completed: events.some(event => event.event.tag === "STAGE_COMPLETED") }));
      database.close();
    `, providerEnvironment(binary, state), 60_000) as {
      prompt: string; saved: { tag: string; sha256: string }; sourceHash: string; artifactId: string;
      artifactHash: string; firstAnswerId: string; providerObserved: boolean; completed: boolean;
    };
    expect(output.saved.tag).toBe("UPDATED");
    expect(output.saved.sha256).toBe(output.sourceHash);
    expect(output.providerObserved).toBe(true);
    expect(output.completed).toBe(false);
    for (const evidence of [
      "historical decision alpha", "historical decision beta", "superseding decision gamma",
      "original decision question", "second decision question", "superseding decision question",
      output.firstAnswerId, output.artifactId, output.artifactHash, output.sourceHash,
      "unrelated adoption rationale", "Durable authority: superseding decision gamma.",
      "A new attempt, unrelated adoption or prior chat answer alone is not coverage",
      "explain any superseded decision using current durable authority",
    ]) expect(output.prompt).toContain(evidence);
    for (const excluded of [
      "ordinary information only", "ordinary evidence only", "unanswered question excluded",
      "foreign-stage decision", "foreign-item decision",
    ]) expect(output.prompt).not.toContain(excluded);
  }, 60_000);

  it("rejects sign-off when material authority changes after R3", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-signoff-stale-");
    const output = bunEval(`
      let rejected = false;
      let message = "";
      try {
        ${seedSignoffScript(
          repository,
          state,
          'await Bun.write(repositoryRoot + "/AGENTS.md", "# changed authority\\n");',
        )}
      } catch (error) {
        rejected = true;
        message = error instanceof Error ? error.message : String(error);
      }
      console.log(JSON.stringify({ rejected, message }));
    `) as { rejected: boolean; message: string };

    expect(output.rejected).toBe(true);
    expect(output.message).toContain("current R3 conformance is missing or stale");
  }, 30_000);

  it("does not stale an Approval for newly reachable but non-material authority", () => {
    const repository = createRepository();
    mkdirSync(join(repository, "docs", "governance"), { recursive: true });
    writeFileSync(
      join(repository, "pontivus-order.toml"),
      fixtureManifest.replace(
        'p1 = ["AGENTS.md"]',
        'p1 = ["AGENTS.md", "docs/governance/*.md"]',
      ),
    );
    runGit(repository, "add", "pontivus-order.toml");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-new-reachable-authority-");
    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await Bun.write(repositoryRoot + "/docs/governance/new.md", "# newly reachable but unreferenced P1 authority\\n");
      const freshness = await authority.approvalFreshness(runtime, approval);
      console.log(JSON.stringify(freshness));
      database.close();
    `) as { fresh: boolean; changedOwners: string[] };

    expect(output).toEqual({ fresh: true, changedOwners: [] });
  }, 30_000);

  it("stales an Approval when material P1 authority changes post-signoff", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-material-authority-stale-");
    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await Bun.write(repositoryRoot + "/AGENTS.md", "# changed material P1 authority\\n");
      const freshness = await authority.approvalFreshness(runtime, approval);
      console.log(JSON.stringify(freshness));
      database.close();
    `) as { fresh: boolean; changedOwners: string[] };

    expect(output.fresh).toBe(false);
    expect(output.changedOwners).toContain("R2");
    expect(output.changedOwners).toContain("PLAN");
    expect(output.changedOwners).not.toContain("R1");
  }, 30_000);

  it("does not let a running execution Run overwrite an observed source-drift return", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-running-source-drift-");
    const binary = createFakeOpenCode("noop-delay");
    const providerStarted = join(binary, "..", "provider-started");
    const providerRelease = join(binary, "..", "provider-release");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const fs = await import("node:fs");
      const tickPromise = coord.runCoordinatorTick(runtime);
      for (
        let attempt = 0;
        attempt < 500 && !fs.existsSync(${JSON.stringify(providerStarted)});
        attempt += 1
      ) {
        await Bun.sleep(10);
      }
      if (!fs.existsSync(${JSON.stringify(providerStarted)})) {
        throw new Error("delayed provider did not start");
      }

      const beforeDrift = coord.getWorkItem(runtime, work);
      const driftSource = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], beforeDrift.sourcePath,
      );
      sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], driftSource.path,
        driftSource.sha256,
        driftSource.markdown.replace("# fixture", "# changed during builder"),
      );
      fs.writeFileSync(${JSON.stringify(providerRelease)}, "release");
      const tick = await tickPromise;

      const tasks = await coord.listExecutionTasks(runtime, work);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const latest = runs.at(-1);
      const events = latest ? coord.listRunEvents(runtime, latest.id) : [];
      console.log(JSON.stringify({
        tick,
        workItem: coord.getWorkItem(runtime, work),
        taskState: tasks[0]?.state ?? null,
        runStatus: latest?.status ?? null,
        terminalClassification: latest?.terminalClassification ?? null,
        staleFailures: events.filter((event) =>
          event.event.tag === "VALIDATION_FAILED" &&
          event.event.classification === "APPROVAL_STALE"
        ).length,
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      tick: { result: string };
      workItem: { stage: string; status: string; outcome: string | null };
      taskState: string | null;
      runStatus: string | null;
      terminalClassification: string | null;
      staleFailures: number;
    };

    expect(output.tick.result).toBe("STARTED");
    expect(output.workItem).toMatchObject({
      stage: "R1",
      status: "ACTIVE",
      outcome: null,
    });
    expect(output.taskState).toBe("BLOCKED");
    expect(output.runStatus).toBe("BLOCKED");
    expect(output.terminalClassification).toBe("APPROVAL_STALE");
    expect(output.staleFailures).toBe(1);
  }, 30_000);

  it("requires explicit semantic classification for zero-diff builder success", () => {
    const acceptedRepository = createRepository();
    const acceptedState = tempDir("order-daemon-explicit-noop-");
    const acceptedBinary = createFakeOpenCode("noop");
    const accepted = bunEval(`
      ${seedSignoffScript(acceptedRepository, acceptedState)}
      await coord.runCoordinatorTick(runtime);
      const tasks = await coord.listExecutionTasks(runtime, work);
      console.log(JSON.stringify({
        workItem: coord.getWorkItem(runtime, work),
        taskState: tasks[0]?.state ?? null,
        runs: coord.listRuns(runtime, work)
          .filter((run) => run.executionTaskId !== null)
          .map((run) => ({
            role: run.role,
            status: run.status,
            terminalClassification: run.terminalClassification,
          })),
      }));
      database.close();
    `, providerEnvironment(acceptedBinary, acceptedState), 180_000) as {
      workItem: { stage: string; status: string; outcome: string | null };
      taskState: string | null;
      runs: Array<{ role: string; status: string; terminalClassification: string | null }>;
    };

    expect(accepted.workItem).toMatchObject({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "ALREADY_SATISFIED",
    });
    expect(accepted.taskState).toBe("ALREADY_SATISFIED");
    expect(accepted.runs).toContainEqual(
      expect.objectContaining({
        role: "BUILDER",
        status: "COMPLETED",
        terminalClassification: "ALREADY_SATISFIED",
      }),
    );

    const rejectedRepository = createRepository();
    const rejectedState = tempDir("order-daemon-silent-noop-");
    const rejectedBinary = createFakeOpenCode("empty");
    const rejected = bunEval(`
      ${seedSignoffScript(rejectedRepository, rejectedState)}
      await coord.runCoordinatorTick(runtime);
      const tasks = await coord.listExecutionTasks(runtime, work);
      const postRuns = coord.listRuns(runtime, work)
        .filter((run) => run.executionTaskId !== null);
      console.log(JSON.stringify({
        workItem: coord.getWorkItem(runtime, work),
        taskState: tasks[0]?.state ?? null,
        failures: postRuns.map((run) => {
          const events = coord.listRunEvents(runtime, run.id);
          const diagnostics = events.find(
            (event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED",
          );
          const providerFailure = events.find(
            (event) => event.event.tag === "PROVIDER_FAILED",
          );
          return {
            role: run.role,
            status: run.status,
            terminalClassification: run.terminalClassification,
            diagnosticEvidence:
              diagnostics?.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED"
                ? diagnostics.event.evidence.map((ref) => ref.relativePath)
                : [],
            failureEvidence:
              providerFailure?.event.tag === "PROVIDER_FAILED"
                ? providerFailure.event.evidence.map((ref) => ref.relativePath)
                : [],
          };
        }),
      }));
      database.close();
    `, providerEnvironment(rejectedBinary, rejectedState), 180_000) as {
      workItem: { stage: string; status: string; outcome: string | null };
      taskState: string | null;
      failures: Array<{
        role: string;
        status: string;
        terminalClassification: string | null;
        diagnosticEvidence: string[];
        failureEvidence: string[];
      }>;
    };

    expect(rejected.workItem).toMatchObject({
      stage: "EXECUTION",
      status: "BLOCKED",
      outcome: null,
    });
    expect(rejected.taskState).toBe("BLOCKED");
    const providerFailures = rejected.failures.filter(
      (run) => run.terminalClassification === "PROVIDER_FAILURE",
    );
    expect(providerFailures).toHaveLength(2);
    expect(providerFailures.every((run) =>
      run.diagnosticEvidence.length > 0 &&
      run.failureEvidence.length > 0 &&
      JSON.stringify(run.failureEvidence) === JSON.stringify(run.diagnosticEvidence)
    )).toBe(true);
  }, 30_000);

  it("manual execution start rejects another eligible task instead of globally retargeting", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-exact-manual-start-");
    const twoTaskPlan = fixturePlan.replace(
      '{"id":"T1","objective":"make the target correct","dependsOn":[],"scope":["src/target.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/target.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":["shell"]}',
      '{"id":"T1","objective":"first task","dependsOn":[],"scope":["src/target.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/target.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":["shell"]},{"id":"T2","objective":"second task","dependsOn":[],"scope":["src/target.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/target.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":["shell"]}',
    );
    writeFileSync(join(repository, "docs", "plan.md"), twoTaskPlan);
    runGit(repository, "add", "docs/plan.md");
    runGit(repository, "commit", "--amend", "--no-edit");

    const output = bunEval(seedSignoffScript(repository, state) + `
      const execOwner = await import("./src/daemon/execution.ts");
      const tasks = await coord.listExecutionTasks(runtime, work);
      let wrongRejected = false;
      let wrongMessage = "";
      try {
        await execOwner.startExactExecutionTask(runtime, work, tasks[1].id);
      } catch (error) {
        wrongRejected = true;
        wrongMessage = error instanceof Error ? error.message : String(error);
      }
      const before = await coord.listExecutionTasks(runtime, work);
      const started = await execOwner.startExactExecutionTask(runtime, work, tasks[0].id);
      const after = await coord.listExecutionTasks(runtime, work);
      console.log(JSON.stringify({
        wrongRejected,
        wrongMessage,
        before: before.map((task) => ({ id: task.id, state: task.state })),
        started: {
          workItemId: started.run.workItemId,
          executionTaskId: started.run.executionTaskId,
          role: started.run.role,
          status: started.run.status,
        },
        after: after.map((task) => ({ id: task.id, state: task.state })),
      }));
      database.close();
    `) as {
      wrongRejected: boolean;
      wrongMessage: string;
      before: Array<{ id: string; state: string }>;
      started: {
        workItemId: string;
        executionTaskId: string | null;
        role: string;
        status: string;
      };
      after: Array<{ id: string; state: string }>;
    };

    expect(output.wrongRejected).toBe(true);
    expect(output.wrongMessage).toContain("canonical current task");
    expect(output.before.map((task) => task.state)).toEqual(["TODO", "TODO"]);
    expect(output.started).toMatchObject({
      workItemId: "work_11111111-1111-4111-8111-111111111111",
      executionTaskId: output.before[0]?.id,
      role: "BUILDER",
      status: "RUNNING",
    });
    expect(output.after[0]?.state).toBe("RUNNING");
    expect(output.after[1]?.state).toBe("TODO");
  }, 30_000);

  it("executes sign-off through BUILDER, one REMEDIATOR, final REVIEWER V0-V7, and aggregate completion", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-execution-");
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const tick = await coord.runCoordinatorTick(runtime);
      const workItem = coord.getWorkItem(runtime, work);
      const tasks = await coord.listExecutionTasks(runtime, work);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const runEvents = Object.fromEntries(runs.map((run) => [run.id, coord.listRunEvents(runtime, run.id)]));
      const finalReviewer = [...runs].reverse().find((run) => run.role === "REVIEWER");
      const finalEvents = finalReviewer ? runEvents[finalReviewer.id] : [];
      const recorded = finalEvents.find((event) => event.event.tag === "CANDIDATE_RECORDED");
      const passes = recorded?.event.tag === "CANDIDATE_RECORDED"
        ? recorded.event.validationEventIds.map((id) =>
            finalEvents.find((event) => event.id === id)?.event.stage ?? "MISSING"
          )
        : [];
      const candidateTrigger = finalReviewer?.triggerEventId ?? null;
      const reviewPassIndex = finalEvents.findIndex((event) => event.event.tag === "REVIEW_PASSED");
      const v4Index = finalEvents.findIndex((event) =>
        event.event.tag === "VALIDATION_PASSED" && event.event.stage === "V4"
      );
      const architectureGatePasses = finalEvents.filter((event) =>
        event.event.tag === "GATE_PASSED" && event.event.gateId === "architecture"
      ).length;
      const providerDiagnostics = runs.flatMap((run) =>
        runEvents[run.id]
          .filter((event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED")
          .flatMap((event) =>
            event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED"
              ? event.event.evidence
                  .filter((ref) => ref.relativePath.endsWith("/diagnostic.json"))
                  .map((ref) =>
                    JSON.parse(new TextDecoder().decode(
                      rt.readRunEvidenceBytes(runtime.stateRoot, run.id, ref.relativePath),
                    ))
                  )
              : []
          )
      );
      const diagnosticsBeforeProviderEvents = runs.every((run) => {
        const events = runEvents[run.id];
        const diagnosticIndex = events.findIndex(
          (event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED",
        );
        const providerEventIndex = events.findIndex((event) =>
          [
            "AGENT_MESSAGE_FINAL",
            "REVIEW_PASSED",
            "REVIEW_FAILED",
            "TASK_ALREADY_SATISFIED",
            "STAGE_BLOCKED",
          ].includes(event.event.tag)
        );
        return diagnosticIndex >= 0 &&
          providerEventIndex >= 0 &&
          diagnosticIndex < providerEventIndex;
      });
      console.log(JSON.stringify({
        tick,
        workItem,
        taskState: tasks[0].state,
        roles: runs.map((run) => run.role),
        runStates: runs.map((run) => ({
          role: run.role,
          status: run.status,
          terminalClassification: run.terminalClassification,
          events: runEvents[run.id].map((event) => event.event),
        })),
        candidateTrigger,
        recordedCandidate:
          recorded?.event.tag === "CANDIDATE_RECORDED"
            ? recorded.event.candidateStateEventId
            : null,
        passes,
        reviewPassBeforeV4: reviewPassIndex >= 0 && reviewPassIndex < v4Index,
        architectureGatePasses,
        providerDiagnostics,
        diagnosticsBeforeProviderEvents,
        remediationCount: runs.filter((run) => run.role === "REMEDIATOR").length,
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      tick: { result: string };
      workItem: { stage: string; status: string; outcome: string };
      taskState: string;
      roles: string[];
      candidateTrigger: string;
      recordedCandidate: string;
      passes: string[];
      reviewPassBeforeV4: boolean;
      architectureGatePasses: number;
      providerDiagnostics: Array<{
        providerId: string;
        modelId: string;
        providerSessionId: string;
        promptId: string;
        outcome: string;
        formatRepairAttempted: boolean;
        formatRepairSucceeded: boolean | null;
        failurePhase: string | null;
        exceptionMessage: string | null;
      }>;
      diagnosticsBeforeProviderEvents: boolean;
      remediationCount: number;
    };

    expect(output.tick.result).toBe("STARTED");
    expect(output.workItem, JSON.stringify(output)).toMatchObject({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "CANDIDATE_DONE",
    });
    expect(output.taskState).toBe("CANDIDATE_DONE");
    expect(output.roles, JSON.stringify(output)).toEqual(["BUILDER", "REVIEWER", "REMEDIATOR", "REVIEWER"]);
    expect(output.remediationCount).toBe(1);
    expect(output.recordedCandidate).toBe(output.candidateTrigger);
    expect(output.passes).toEqual(["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"]);
    expect(output.reviewPassBeforeV4).toBe(true);
    expect(output.architectureGatePasses).toBe(1);
    expect(output.providerDiagnostics).toHaveLength(4);
    expect(output.providerDiagnostics.every((record) =>
      record.providerId === "opencode" &&
      record.modelId === "glm-5.3-flash-free" &&
      record.outcome === "SUCCEEDED" &&
      record.failurePhase === null &&
      record.exceptionMessage === null
    )).toBe(true);
    expect(output.diagnosticsBeforeProviderEvents).toBe(true);
  }, 30_000);

  it("executes signed BUILDER checkpoints and continues the same Run/provider session", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-checkpoint-");
    const binary = createFakeOpenCode("checkpoint");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await coord.runCoordinatorTick(runtime);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const builder = runs.find((run) => run.role === "BUILDER");
      if (!builder) throw new Error("missing builder run");
      const events = coord.listRunEvents(runtime, builder.id);
      const diagnostics = events
        .filter((event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED")
        .flatMap((event) =>
          event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED"
            ? event.event.evidence
                .filter((ref) => ref.relativePath.endsWith("/diagnostic.json"))
                .map((ref) => JSON.parse(new TextDecoder().decode(
                  rt.readRunEvidenceBytes(runtime.stateRoot, builder.id, ref.relativePath),
                )))
            : []
        );
      console.log(JSON.stringify({
        workItem: coord.getWorkItem(runtime, work),
        builder: {
          id: builder.id,
          status: builder.status,
          providerSessionId: builder.providerSessionId,
        },
        eventTags: events.map((event) => event.event.tag),
        checkpointGateIds: events
          .filter((event) => event.event.tag === "GATE_CHECKPOINT_REQUESTED" || event.event.tag === "GATE_PASSED")
          .map((event) => "gateId" in event.event ? event.event.gateId : null),
        diagnosticSessions: diagnostics.map((record) => record.providerSessionId),
        diagnosticPrompts: diagnostics.map((record) => record.promptId),
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      workItem: { stage: string; status: string; outcome: string | null };
      builder: { id: string; status: string; providerSessionId: string | null };
      eventTags: string[];
      checkpointGateIds: Array<string | null>;
      diagnosticSessions: string[];
      diagnosticPrompts: string[];
    };

    expect(output.workItem).toMatchObject({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "CANDIDATE_DONE",
    });
    expect(output.eventTags).toContain("GATE_CHECKPOINT_REQUESTED");
    expect(output.eventTags).toContain("GATE_PASSED");
    expect(output.eventTags.indexOf("GATE_CHECKPOINT_REQUESTED"))
      .toBeLessThan(output.eventTags.indexOf("GATE_PASSED"));
    expect(output.eventTags.indexOf("GATE_PASSED"))
      .toBeLessThan(output.eventTags.indexOf("CANDIDATE_STATE_RECORDED"));
    expect(output.checkpointGateIds).toEqual(["test", "test"]);
    expect(output.diagnosticSessions).toHaveLength(2);
    expect(new Set(output.diagnosticSessions).size).toBe(1);
    expect(new Set(output.diagnosticPrompts).size).toBe(2);
  }, 30_000);

  it("rejects an unsigned BUILDER checkpoint before executing the gate", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-checkpoint-unsigned-");
    const binary = createFakeOpenCode("checkpoint-unsigned");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const execOwner = await import("./src/daemon/execution.ts");
      const tasks = await coord.listExecutionTasks(runtime, work);
      const started = await execOwner.startExactExecutionTask(
        runtime,
        work,
        tasks[0].id,
      );
      await execOwner.executePostSignoffRun(
        runtime,
        started.run,
        started.task,
        started.approval,
      );
      const current = coord.listRuns(runtime, work)
        .filter((run) => run.executionTaskId !== null)
        .find((run) => run.id === started.run.id);
      if (!current) throw new Error("missing builder run");
      const events = coord.listRunEvents(runtime, current.id);
      console.log(JSON.stringify({
        run: {
          status: current.status,
          terminalClassification: current.terminalClassification,
        },
        tags: events.map((event) => event.event.tag),
        checkpointResults: events.filter((event) =>
          event.event.tag === "GATE_PASSED" ||
          event.event.tag === "GATE_FAILED"
        ).length,
        providerFailure: events.find((event) =>
          event.event.tag === "PROVIDER_FAILED"
        )?.event ?? null,
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      run: { status: string; terminalClassification: string | null };
      tags: string[];
      checkpointResults: number;
      providerFailure: { tag: string; detail: string } | null;
    };

    expect(output.run).toMatchObject({
      status: "FAILED",
      terminalClassification: "PROVIDER_FAILURE",
    });
    expect(output.checkpointResults).toBe(0);
    expect(output.tags).not.toContain("GATE_CHECKPOINT_REQUESTED");
    expect(output.providerFailure).toMatchObject({
      tag: "PROVIDER_FAILED",
    });
    expect(output.providerFailure?.detail).toContain(
      "requested unsigned checkpoint gate",
    );
  }, 30_000);

  it("continues a failed signed checkpoint only to an explicit execution block", () => {
    const repository = createRepository();
    const failingManifest = fixtureManifest.replace(
      'argv = ["bash", "-c", "test -f src/target.ts"]',
      'argv = ["bash", "-c", "exit 1"]',
    );
    writeFileSync(join(repository, "pontivus-order.toml"), failingManifest);
    runGit(repository, "add", "pontivus-order.toml");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-checkpoint-fail-");
    const binary = createFakeOpenCode("checkpoint-fail");
    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await coord.runCoordinatorTick(runtime);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const builder = runs.find((run) => run.role === "BUILDER");
      if (!builder) throw new Error("missing builder run");
      const events = coord.listRunEvents(runtime, builder.id);
      const diagnostics = events
        .filter((event) => event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED")
        .flatMap((event) =>
          event.event.tag === "PROVIDER_DIAGNOSTICS_RECORDED"
            ? event.event.evidence
                .filter((ref) => ref.relativePath.endsWith("/diagnostic.json"))
                .map((ref) => JSON.parse(new TextDecoder().decode(
                  rt.readRunEvidenceBytes(runtime.stateRoot, builder.id, ref.relativePath),
                )))
            : []
        );
      console.log(JSON.stringify({
        workItem: coord.getWorkItem(runtime, work),
        builder: { status: builder.status, terminalClassification: builder.terminalClassification },
        tags: events.map((event) => event.event.tag),
        sessions: diagnostics.map((record) => record.providerSessionId),
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      workItem: { stage: string; status: string; outcome: string | null };
      builder: { status: string; terminalClassification: string | null };
      tags: string[];
      sessions: string[];
    };

    expect(output.workItem).toMatchObject({ stage: "EXECUTION", status: "BLOCKED" });
    expect(output.builder).toMatchObject({
      status: "BLOCKED",
      terminalClassification: "PRECONDITION_FAILED",
    });
    expect(output.tags).toContain("GATE_CHECKPOINT_REQUESTED");
    expect(output.tags).toContain("GATE_FAILED");
    expect(output.tags).toContain("STAGE_BLOCKED");
    expect(output.sessions).toHaveLength(2);
    expect(new Set(output.sessions).size).toBe(1);
  }, 30_000);

  it("rejects an out-of-scope checkpoint diff before executing the gate", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-checkpoint-scope-");
    const binary = createFakeOpenCode("checkpoint-outside");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await coord.runCoordinatorTick(runtime);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const events = runs.flatMap((run) => coord.listRunEvents(runtime, run.id));
      console.log(JSON.stringify({
        workItem: coord.getWorkItem(runtime, work),
        gateResults: events.filter((event) =>
          event.event.tag === "GATE_PASSED" || event.event.tag === "GATE_FAILED"
        ).length,
        v2Failures: events
          .filter((event) =>
            event.event.tag === "VALIDATION_FAILED" &&
            event.event.stage === "V2"
          )
          .map((event) => event.event),
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      workItem: { stage: string; status: string };
      gateResults: number;
      v2Failures: Array<{ tag: string; stage: string; classification: string }>;
    };

    expect(output.gateResults).toBe(0);
    expect(output.v2Failures).toHaveLength(1);
    expect(output.v2Failures[0]).toMatchObject({
      tag: "VALIDATION_FAILED",
      stage: "V2",
      classification: "SCOPE_BREACH",
    });
    expect(output.workItem.stage).toBe("PLAN");
  }, 30_000);

  it("classifies a failed V5 governance fitness gate as GOVERNANCE_BREACH", () => {
    const repository = createRepository();
    const failingManifest = fixtureManifest.replace(
      'argv = ["bash", "-c", "test -f AGENTS.md"]',
      'argv = ["bash", "-c", "exit 1"]',
    );
    writeFileSync(join(repository, "pontivus-order.toml"), failingManifest);
    runGit(repository, "add", "pontivus-order.toml");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-governance-breach-");
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await coord.runCoordinatorTick(runtime);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const failures = runs
        .flatMap((run) => coord.listRunEvents(runtime, run.id))
        .filter((event) =>
          event.event.tag === "VALIDATION_FAILED" &&
          event.event.stage === "V5"
        )
        .map((event) => event.event);
      console.log(JSON.stringify({ failures }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      failures: Array<{ tag: string; stage: string; classification: string }>;
    };

    expect(output.failures).toHaveLength(1);
    expect(output.failures[0]).toMatchObject({
      tag: "VALIDATION_FAILED",
      stage: "V5",
      classification: "GOVERNANCE_BREACH",
    });
  }, 30_000);

  it("classifies reviewer-proven removable surface as V6 CHANGE_BLOAT and permits one reduction", () => {
    const repository = createRepository();
    const planPath = join(repository, "docs", "plan.md");
    writeFileSync(
      planPath,
      readFileSync(planPath, "utf8").replace(
        '"scope":["src/target.ts"]',
        '"scope":["src/**"]',
      ),
    );
    runGit(repository, "add", "docs/plan.md");
    runGit(repository, "commit", "--amend", "--no-edit");

    const state = tempDir("order-daemon-change-bloat-");
    const binary = createFakeOpenCode("bloat");
    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await coord.runCoordinatorTick(runtime);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const events = runs.flatMap((run) => coord.listRunEvents(runtime, run.id));
      console.log(JSON.stringify({
        workItem: coord.getWorkItem(runtime, work),
        task: (await coord.listExecutionTasks(runtime, work))[0],
        roles: runs.map((run) => run.role),
        v6Bloat: events.filter((event) =>
          event.event.tag === "VALIDATION_FAILED" &&
          event.event.stage === "V6" &&
          event.event.classification === "CHANGE_BLOAT"
        ).map((event) => event.event),
        v6Passes: events.filter((event) =>
          event.event.tag === "VALIDATION_PASSED" &&
          event.event.stage === "V6"
        ).length,
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      workItem: { stage: string; status: string; outcome: string | null };
      task: { state: string };
      roles: string[];
      v6Bloat: Array<{ tag: string; stage: string; classification: string; summary: string }>;
      v6Passes: number;
    };

    expect(output.v6Bloat).toHaveLength(1);
    expect(output.v6Bloat[0]).toMatchObject({
      tag: "VALIDATION_FAILED",
      stage: "V6",
      classification: "CHANGE_BLOAT",
      summary: "src/extra.ts is removable",
    });
    expect(output.roles).toEqual(["BUILDER", "REVIEWER", "REMEDIATOR", "REVIEWER"]);
    expect(output.v6Passes).toBe(1);
    expect(output.task.state).toBe("CANDIDATE_DONE");
    expect(output.workItem).toMatchObject({
      stage: "COMPLETE",
      status: "COMPLETE",
      outcome: "CANDIDATE_DONE",
    });
  }, 30_000);

  it("blocks after the same semantic failure recurs instead of creating a second remediator", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-repair-exhaustion-");
    const binary = createFakeOpenCode("no-fix");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const tick = await coord.runCoordinatorTick(runtime);
      const workItem = coord.getWorkItem(runtime, work);
      const tasks = await coord.listExecutionTasks(runtime, work);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      console.log(JSON.stringify({
        tick,
        workItem,
        taskState: tasks[0].state,
        roles: runs.map((run) => run.role),
        runStates: runs.map((run) => ({
          role: run.role,
          status: run.status,
          terminalClassification: run.terminalClassification,
          events: coord.listRunEvents(runtime, run.id).map((event) => event.event),
        })),
        remediators: runs.filter((run) => run.role === "REMEDIATOR").length,
        reviewFailures: runs
          .filter((run) => run.role === "REVIEWER")
          .flatMap((run) => coord.listRunEvents(runtime, run.id))
          .filter((event) =>
            event.event.tag === "VALIDATION_FAILED" &&
            event.event.classification === "REVIEW_FAILURE"
          ).length,
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      workItem: { stage: string; status: string };
      taskState: string;
      roles: string[];
      remediators: number;
      reviewFailures: number;
    };

    expect(output.workItem).toMatchObject({ stage: "EXECUTION", status: "BLOCKED" });
    expect(output.taskState).toBe("BLOCKED");
    expect(output.roles).toEqual(["BUILDER", "REVIEWER", "REMEDIATOR", "REVIEWER"]);
    expect(output.remediators).toBe(1);
    expect(output.reviewFailures).toBe(2);
  }, 30_000);

  it("replaces the first operational loss with the same action key and blocks the second", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-operational-");
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const tasks = await coord.listExecutionTasks(runtime, work);
      const task = tasks[0];
      database.query("UPDATE executionTasks SET state='RUNNING' WHERE id=?1").run(task.id);
      const stamp = "2026-11-11T04:05:00.000Z";
      const hash = "sha256:" + "b".repeat(64);
      const first = "run_22222222-2222-4222-8222-222222222222";
      database.query(
        "INSERT INTO runs VALUES (?1,?2,?3,'EXECUTION','UNATTENDED','BUILDER',NULL,'FAILED',1,?4,?5,NULL,'PROVIDER_FAILURE',?6,?6)"
      ).run(first, work, task.id, approval.baselineCommit, hash, stamp);
      const tick = await coord.runCoordinatorTick(runtime);
      const runs = coord.listRuns(runtime, work).filter((run) => run.executionTaskId === task.id);
      console.log(JSON.stringify({
        tick,
        sameActionKey:
          runs[0].role === runs[1].role &&
          runs[0].triggerEventId === runs[1].triggerEventId,
        firstTwoRoles: runs.slice(0, 2).map((run) => run.role),
        runStates: runs.map((run) => ({
          role: run.role,
          status: run.status,
          terminalClassification: run.terminalClassification,
          events: coord.listRunEvents(runtime, run.id).map((event) => event.event),
        })),
        final: coord.getWorkItem(runtime, work),
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      sameActionKey: boolean;
      firstTwoRoles: string[];
      final: { status: string; stage: string };
    };

    expect(output.sameActionKey).toBe(true);
    expect(output.firstTwoRoles).toEqual(["BUILDER", "BUILDER"]);
    expect(output.final, JSON.stringify(output)).toMatchObject({ status: "COMPLETE", stage: "COMPLETE" });

    const repository2 = createRepository();
    const state2 = tempDir("order-daemon-operational-block-");
    const output2 = bunEval(`
      ${seedSignoffScript(repository2, state2)}
      const tasks = await coord.listExecutionTasks(runtime, work);
      const task = tasks[0];
      database.query("UPDATE executionTasks SET state='RUNNING' WHERE id=?1").run(task.id);
      const hash = "sha256:" + "c".repeat(64);
      const stamp = "2026-11-11T04:05:00.000Z";
      for (const [index, id] of [
        "run_33333333-3333-4333-8333-333333333333",
        "run_44444444-4444-4444-8444-444444444444",
      ].entries()) {
        database.query(
          "INSERT INTO runs VALUES (?1,?2,?3,'EXECUTION','UNATTENDED','BUILDER',NULL,'FAILED',?4,?5,?6,NULL,'PROVIDER_FAILURE',?7,?7)"
        ).run(id, work, task.id, index + 1, approval.baselineCommit, hash, stamp);
      }
      const tick = await coord.runCoordinatorTick(runtime);
      const refreshed = await coord.listExecutionTasks(runtime, work);
      console.log(JSON.stringify({
        tick,
        workItem: coord.getWorkItem(runtime, work),
        taskState: refreshed[0].state,
        runCount: coord.listRuns(runtime, work).filter((run) => run.executionTaskId === task.id).length,
      }));
      database.close();
    `, providerEnvironment(binary, state2)) as {
      tick: { result: string };
      workItem: { status: string; stage: string };
      taskState: string;
      runCount: number;
    };

    expect(output2.tick.result).toBe("NO_WORK");
    expect(output2.workItem).toMatchObject({ status: "BLOCKED", stage: "EXECUTION" });
    expect(output2.taskState).toBe("BLOCKED");
    expect(output2.runCount).toBe(2);
  }, 30_000);

  it("cancellation blocks execution and explicit resume returns only the task to TODO", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-cancel-");
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const task = (await coord.listExecutionTasks(runtime, work))[0];
      database.query("UPDATE executionTasks SET state='RUNNING' WHERE id=?1").run(task.id);
      const run = "run_55555555-5555-4555-8555-555555555555";
      const hash = "sha256:" + "d".repeat(64);
      const stamp = "2026-11-11T04:10:00.000Z";
      database.query(
        "INSERT INTO runs VALUES (?1,?2,?3,'EXECUTION','UNATTENDED','BUILDER',NULL,'RUNNING',1,?4,?5,NULL,NULL,?6,NULL)"
      ).run(run, work, task.id, approval.baselineCommit, hash, stamp);
      const cancelled = await coord.cancelRun(runtime, run);
      const afterCancel = {
        workItem: coord.getWorkItem(runtime, work),
        task: (await coord.listExecutionTasks(runtime, work))[0],
      };
      const resumed = await coord.resumeWorkItem(runtime, work);
      const afterResume = {
        workItem: resumed,
        task: (await coord.listExecutionTasks(runtime, work))[0],
        runs: coord.listRuns(runtime, work).filter((value) => value.executionTaskId === task.id),
      };
      console.log(JSON.stringify({ cancelled, afterCancel, afterResume }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      cancelled: { status: string };
      afterCancel: { workItem: { status: string }; task: { state: string } };
      afterResume: {
        workItem: { status: string };
        task: { state: string };
        runs: { status: string }[];
      };
    };

    expect(output.cancelled.status).toBe("CANCELLED");
    expect(output.afterCancel.workItem.status).toBe("BLOCKED");
    expect(output.afterCancel.task.state).toBe("BLOCKED");
    expect(output.afterResume.workItem.status).toBe("ACTIVE");
    expect(output.afterResume.task.state).toBe("TODO");
    expect(output.afterResume.runs).toHaveLength(1);
    expect(output.afterResume.runs[0]?.status).toBe("CANCELLED");
  }, 30_000);

  it("rejects stale upstream context Start without changing lifecycle state", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-stale-context-start-");

    const output = bunEval(seedSignoffScript(
      repository,
      state,
      `
        const fs = await import("node:fs");
        sql.updateWorkItemLifecycle(database, work, {
          stage: "PLAN",
          status: "ACTIVE",
          outcome: null,
        });
        const before = coord.getWorkItem(runtime, work);
        const runCountBefore = coord.listRuns(runtime, work).length;
        fs.writeFileSync(
          repositoryRoot + "/docs/design.md",
          "design changed after conformance\\n",
        );
        let error = null;
        try {
          await coord.startStageRun(runtime, work, "INTERACTIVE");
        } catch (caught) {
          error = caught instanceof Error ? caught.message : String(caught);
        }
        const after = coord.getWorkItem(runtime, work);
        const runCountAfter = coord.listRuns(runtime, work).length;
        console.log(JSON.stringify({
          error,
          before: {
            stage: before.stage,
            status: before.status,
            outcome: before.outcome,
          },
          after: {
            stage: after.stage,
            status: after.status,
            outcome: after.outcome,
          },
          runCountUnchanged: runCountAfter === runCountBefore,
        }));
        database.close();
        process.exit(0);
      `,
    )) as {
      error: string | null;
      before: { stage: string; status: string; outcome: string | null };
      after: { stage: string; status: string; outcome: string | null };
      runCountUnchanged: boolean;
    };

    expect(output.error).toMatch(/upstream conformance is missing or stale: DESIGN/);
    expect(output.after).toEqual(output.before);
    expect(output.after).toEqual({
      stage: "PLAN",
      status: "ACTIVE",
      outcome: null,
    });
    expect(output.runCountUnchanged).toBe(true);
  }, 30_000);

  it("rejects stale upstream context input without changing canonical state", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-stale-context-input-");

    const output = bunEval(seedSignoffScript(
      repository,
      state,
      `
        const fs = await import("node:fs");
        sql.updateWorkItemLifecycle(database, work, {
          stage: "PLAN",
          status: "ACTIVE",
          outcome: null,
        });
        const before = coord.getWorkItem(runtime, work);
        const run = runStore.insertRun(runtime, {
          id: rt.newRunId(),
          workItemId: work,
          executionTaskId: null,
          stage: "PLAN",
          mode: "INTERACTIVE",
          role: "STAGE",
          triggerEventId: null,
          status: "WAITING_FOR_INPUT",
          attempt: runStore.nextAttempt(runtime, work, "PLAN", null),
          baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
          contextHash: rt.sha256Text("stale-input-context"),
          providerSessionId: null,
          terminalClassification: null,
          startedAt: timestamp,
          endedAt: null,
        });
        runStore.appendRunEvent(runtime, run.id, {
          tag: "STAGE_STARTED",
          stage: "PLAN",
          mode: "INTERACTIVE",
          contextHash: run.contextHash,
        });
        const requested = runStore.appendRunEvent(runtime, run.id, {
          tag: "HUMAN_INPUT_REQUESTED",
          category: "INFORMATION",
          question: "Confirm the current implementation constraint.",
        });
        const beforeEvents = coord.listRunEvents(runtime, run.id);
        fs.writeFileSync(
          repositoryRoot + "/docs/design.md",
          "design changed before human input\\n",
        );
        let error = null;
        try {
          await coord.submitRunInput(
            runtime,
            run.id,
            "Use the current constraint.",
            requested.id,
          );
        } catch (caught) {
          error = caught instanceof Error ? caught.message : String(caught);
        }
        const after = coord.getWorkItem(runtime, work);
        const finalRun = coord.getRun(runtime, run.id);
        const afterEvents = coord.listRunEvents(runtime, run.id);
        console.log(JSON.stringify({
          error,
          before: {
            stage: before.stage,
            status: before.status,
            outcome: before.outcome,
          },
          after: {
            stage: after.stage,
            status: after.status,
            outcome: after.outcome,
          },
          runStatus: finalRun.status,
          eventIdsUnchanged:
            JSON.stringify(afterEvents.map((event) => event.id)) ===
            JSON.stringify(beforeEvents.map((event) => event.id)),
        }));
        database.close();
        process.exit(0);
      `,
    )) as {
      error: string | null;
      before: { stage: string; status: string; outcome: string | null };
      after: { stage: string; status: string; outcome: string | null };
      runStatus: string;
      eventIdsUnchanged: boolean;
    };

    expect(output.error).toMatch(/upstream conformance is missing or stale: DESIGN/);
    expect(output.after).toEqual(output.before);
    expect(output.runStatus).toBe("WAITING_FOR_INPUT");
    expect(output.eventIdsUnchanged).toBe(true);
  }, 30_000);

  it("serializes concurrent Start commands to exactly one Run", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-start-start-");
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "concurrent start",
        concernIds: ["shell"],
      });
      const settled = await Promise.allSettled([
        coord.startStageRun(runtime, created.id, "INTERACTIVE"),
        coord.startStageRun(runtime, created.id, "INTERACTIVE"),
      ]);
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const runs = coord.listRuns(runtime, created.id);
      const active = runs.find((run) =>
        run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"
      );
      if (active) await coord.cancelRun(runtime, active.id);
      console.log(JSON.stringify({
        states: settled.map((entry) => entry.status),
        rejected: settled
          .filter((entry) => entry.status === "rejected")
          .map((entry) => String(entry.reason)),
        runCount: runs.length,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      states: string[];
      rejected: string[];
      runCount: number;
    };

    expect(output.states.filter((state) => state === "fulfilled")).toHaveLength(1);
    expect(output.states.filter((state) => state === "rejected")).toHaveLength(1);
    expect(output.runCount).toBe(1);
  }, 30_000);

  it("serializes source Save against Start without partial lifecycle mutation", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-save-start-");
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "save versus start",
        concernIds: ["shell"],
      });
      const source = await coord.getWorkItemSource(runtime, created.id);
      const body = source.bodyMarkdown.replace(
        "## Current context\\n",
        "## Current context\\nSaved before Start wins the mutation guard.\\n",
      );
      const settled = await Promise.allSettled([
        coord.saveSourceBody(runtime, created.id, {
          expectedSha256: source.sha256,
          bodyMarkdown: body,
        }),
        coord.startStageRun(runtime, created.id, "INTERACTIVE"),
      ]);
      const current = coord.getWorkItem(runtime, created.id);
      const saved = await coord.getWorkItemSource(runtime, created.id);
      console.log(JSON.stringify({
        states: settled.map((entry) => entry.status),
        current: { stage: current.stage, status: current.status },
        runCount: coord.listRuns(runtime, created.id).length,
        body: saved.bodyMarkdown,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      states: string[];
      current: { stage: string; status: string };
      runCount: number;
      body: string;
    };

    expect(output.states).toEqual(["fulfilled", "rejected"]);
    expect(output.current).toEqual({ stage: "IDEA", status: "ACTIVE" });
    expect(output.runCount).toBe(0);
    expect(output.body).toContain("Saved before Start wins the mutation guard.");
  }, 30_000);

  it("serializes duplicate human input to one accepted response", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-input-input-");
    const binary = createFakeOpenCode("stage-delay");
    const providerRelease = join(binary, "..", "provider-release");

    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "duplicate input",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const context = await authority.resolveStageContext(runtime, workItem, "R1");
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "WAITING_FOR_INPUT",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: context.contextHash,
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: "R1",
        mode: "INTERACTIVE",
        contextHash: context.contextHash,
      });
      const request = runStore.appendRunEvent(runtime, run.id, {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "INFORMATION",
        question: "Choose once",
      });
      const settled = await Promise.allSettled([
        coord.submitRunInput(runtime, run.id, "first answer", request.id),
        coord.submitRunInput(runtime, run.id, "second answer", request.id),
      ]);
      fs.writeFileSync(${JSON.stringify(providerRelease)}, "release");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const current = coord.getRun(runtime, run.id);
      if (current.status === "RUNNING" || current.status === "WAITING_FOR_INPUT") {
        await coord.cancelRun(runtime, run.id);
      }
      const received = coord.listRunEvents(runtime, run.id)
        .filter((event) => event.event.tag === "HUMAN_INPUT_RECEIVED");
      console.log(JSON.stringify({
        states: settled.map((entry) => entry.status),
        received: received.map((event) =>
          event.event.tag === "HUMAN_INPUT_RECEIVED" ? event.event.text : null
        ),
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      states: string[];
      received: (string | null)[];
    };

    expect(output.states.filter((state) => state === "fulfilled")).toHaveLength(1);
    expect(output.states.filter((state) => state === "rejected")).toHaveLength(1);
    expect(output.received).toEqual(["first answer"]);
  }, 30_000);

  it("serializes human input against Cancel and preserves one command winner", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-input-cancel-");
    const binary = createFakeOpenCode("stage-delay");
    const providerRelease = join(binary, "..", "provider-release");

    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "input versus cancel",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const context = await authority.resolveStageContext(runtime, workItem, "R1");
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "WAITING_FOR_INPUT",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: context.contextHash,
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: "R1",
        mode: "INTERACTIVE",
        contextHash: context.contextHash,
      });
      const request = runStore.appendRunEvent(runtime, run.id, {
        tag: "HUMAN_INPUT_REQUESTED",
        category: "INFORMATION",
        question: "Answer before cancel",
      });
      const input = coord.submitRunInput(runtime, run.id, "accepted answer", request.id);
      const cancel = coord.cancelRun(runtime, run.id);
      const settled = await Promise.allSettled([input, cancel]);
      fs.writeFileSync(${JSON.stringify(providerRelease)}, "release");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const beforeCleanup = coord.getRun(runtime, run.id);
      if (beforeCleanup.status === "RUNNING" || beforeCleanup.status === "WAITING_FOR_INPUT") {
        await coord.cancelRun(runtime, run.id);
      }
      console.log(JSON.stringify({
        states: settled.map((entry) => entry.status),
        receivedCount: coord.listRunEvents(runtime, run.id)
          .filter((event) => event.event.tag === "HUMAN_INPUT_RECEIVED").length,
        beforeCleanupStatus: beforeCleanup.status,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      states: string[];
      receivedCount: number;
      beforeCleanupStatus: string;
    };

    expect(output.states).toEqual(["fulfilled", "rejected"]);
    expect(output.receivedCount).toBe(1);
    expect(output.beforeCleanupStatus).toBe("RUNNING");
  }, 30_000);

  it("rejects Cancel while a current lifecycle proposal owns STAGE attention", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-proposal-cancel-");
    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "proposal cancel",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: created.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: rt.sha256Text("proposal-cancel"),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: "R1",
        mode: "INTERACTIVE",
        contextHash: run.contextHash,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "AGENT_MESSAGE_FINAL",
        text: "Review this proposal",
        evidence: [],
      });
      const proposal = runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/r1.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: "--- a/docs/r1.md\\n+++ b/docs/r1.md\\n@@ -1 +1 @@\\n-old\\n+new\\n",
        rationale: "Update research",
      });
      let pendingError = "";
      try {
        await coord.cancelRun(runtime, run.id);
      } catch (error) {
        pendingError = error instanceof Error ? error.message : String(error);
      }
      runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
        proposalEventId: proposal.id,
        disposition: "REJECTED",
        adoptedArtifactRefId: null,
      });
      const cancelled = await coord.cancelRun(runtime, run.id);
      console.log(JSON.stringify({ pendingError, finalStatus: cancelled.status }));
      database.close();
    `) as { pendingError: string; finalStatus: string };

    expect(output.pendingError).toContain("proposal owns attention");
    expect(output.finalStatus).toBe("CANCELLED");
  });

  it("rejects Cancel when the Run is already terminal", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-cancel-terminal-");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "terminal cancel",
        concernIds: ["shell"],
      });
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: created.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "COMPLETED",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: rt.sha256Text("terminal-cancel"),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: rt.nowIsoDateTime(),
      });
      let error = null;
      try {
        await coord.cancelRun(runtime, run.id);
      } catch (caught) {
        error = caught instanceof Error ? caught.message : String(caught);
      }
      console.log(JSON.stringify({
        error,
        finalStatus: coord.getRun(runtime, run.id).status,
      }));
      database.close();
    `) as { error: string | null; finalStatus: string };

    expect(output.error).toMatch(/Run is not cancellable/);
    expect(output.finalStatus).toBe("COMPLETED");
  });

  it("makes Cancel win over a delayed provider finalization without lifecycle mutation", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-provider-cancel-");
    const binary = createFakeOpenCode("stage-complete-delay");
    const providerStarted = join(binary, "..", "provider-started");
    const providerRelease = join(binary, "..", "provider-release");

    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "provider finalization versus cancel",
        concernIds: ["shell"],
      });
      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      for (
        let attempt = 0;
        attempt < 500 && !fs.existsSync(${JSON.stringify(providerStarted)});
        attempt += 1
      ) {
        await Bun.sleep(10);
      }
      const cancelled = await coord.cancelRun(runtime, run.id);
      fs.writeFileSync(${JSON.stringify(providerRelease)}, "release");
      await Promise.all(
        [...runtime.stageTurnTasks.values()].map((task) => task.catch(() => undefined)),
      );
      const finalRun = coord.getRun(runtime, run.id);
      const finalWorkItem = coord.getWorkItem(runtime, created.id);
      const completions = coord.listRunEvents(runtime, run.id)
        .filter((event) => event.event.tag === "STAGE_COMPLETED").length;
      console.log(JSON.stringify({
        cancelled: cancelled.status,
        finalRun: finalRun.status,
        finalWorkItem: {
          stage: finalWorkItem.stage,
          status: finalWorkItem.status,
        },
        completions,
      }));
      database.close();
    `, providerEnvironment(binary, state), 30_000) as {
      cancelled: string;
      finalRun: string;
      finalWorkItem: { stage: string; status: string };
      completions: number;
    };

    expect(output.cancelled).toBe("CANCELLED");
    expect(output.finalRun).toBe("CANCELLED");
    expect(output.finalWorkItem).toEqual({ stage: "R1", status: "ACTIVE" });
    expect(output.completions).toBe(0);
  }, 30_000);


  it("rejects lifecycle proposal decisions whose role does not match the owning Run", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-proposal-role-owner-");

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "proposal role ownership",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const contextHash = rt.sha256Text("proposal-role-owner");
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash,
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: "R1",
        mode: "INTERACTIVE",
        contextHash,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "AGENT_MESSAGE_FINAL",
        text: "invalid proposal follows",
        evidence: [],
      });
      const proposal = runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath:
          "docs/order/work-items/" + workItem.id + "/requirements.md",
        baseSha256: null,
        role: "R2",
        authorityLayer: "P3",
        unifiedDiff: "--- /dev/null\\n+++ requirements.md\\n@@ -0,0 +1 @@\\n+invalid\\n",
        rationale: "must be rejected because the R1 Run cannot own R2 authority",
      });

      let rejectError = null;
      try {
        coord.rejectArtifactProposal(runtime, proposal.id);
      } catch (caught) {
        rejectError = caught instanceof Error ? caught.message : String(caught);
      }
      let adoptError = null;
      try {
        await coord.adoptArtifactProposal(runtime, proposal.id);
      } catch (caught) {
        adoptError = caught instanceof Error ? caught.message : String(caught);
      }
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        rejectError,
        adoptError,
        dispositions: events.filter((event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
        ).length,
        adoptionRequests: events.filter((event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED"
        ).length,
        stage: coord.getWorkItem(runtime, workItem.id).stage,
      }));
      database.close();
    `) as {
      rejectError: string | null;
      adoptError: string | null;
      dispositions: number;
      adoptionRequests: number;
      stage: string;
    };

    expect(output.rejectError).toMatch(/proposal role must equal owning Run stage/);
    expect(output.adoptError).toMatch(/proposal role must equal owning Run stage/);
    expect(output.dispositions).toBe(0);
    expect(output.adoptionRequests).toBe(0);
    expect(output.stage).toBe("R1");
  });

  it("serializes proposal adoption against free-form input", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-adopt-input-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const repo = await import("./src/shell/repository.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const runStore = await import("./src/daemon/run.ts");

      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "adopt versus input",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const proposalPath =
        "docs/order/work-items/" + workItem.id + "/research.md";
      const absoluteProposal = path.join(${JSON.stringify(repository)}, proposalPath);
      fs.writeFileSync(absoluteProposal, "accepted\\n");
      const proposalDiff = Bun.spawnSync(
        ["git", "diff", "--no-index", "--binary", "--", "/dev/null", proposalPath],
        {
          cwd: ${JSON.stringify(repository)},
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      if (proposalDiff.exitCode !== 1) {
        throw new TypeError("failed to create proposal diff");
      }
      const diff = new TextDecoder().decode(proposalDiff.stdout);
      fs.rmSync(absoluteProposal);

      const contextHash = "sha256:" + "a".repeat(64);
      const run = runStore.insertRun(runtime, {
        id: rt.newRunId(),
        workItemId: workItem.id,
        executionTaskId: null,
        stage: "R1",
        mode: "INTERACTIVE",
        role: "STAGE",
        triggerEventId: null,
        status: "RUNNING",
        attempt: 1,
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash,
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_STARTED",
        stage: "R1",
        mode: "INTERACTIVE",
        contextHash,
      });
      runStore.appendRunEvent(runtime, run.id, {
        tag: "AGENT_MESSAGE_FINAL",
        text: "proposal follows",
        evidence: [],
      });
      const proposal = runStore.appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: proposalPath,
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: diff,
        rationale: "adopt exactly once",
      });

      const settled = await Promise.allSettled([
        coord.adoptArtifactProposal(runtime, proposal.id),
        coord.submitRunInput(runtime, run.id, "must not be accepted", null),
      ]);
      const events = coord.listRunEvents(runtime, run.id);
      console.log(JSON.stringify({
        states: settled.map((entry) => entry.status),
        adoptionRequests: events.filter((event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED"
        ).length,
        dispositions: events.filter((event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
        ).map((event) =>
          event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
            ? event.event.disposition
            : null
        ),
        receivedCount: events.filter((event) =>
          event.event.tag === "HUMAN_INPUT_RECEIVED"
        ).length,
        content: fs.readFileSync(absoluteProposal, "utf8"),
      }));
      database.close();
    `) as {
      states: string[];
      adoptionRequests: number;
      dispositions: (string | null)[];
      receivedCount: number;
      content: string;
    };

    expect(output.states).toEqual(["fulfilled", "rejected"]);
    expect(output.adoptionRequests).toBe(1);
    expect(output.dispositions).toEqual(["ADOPTED"]);
    expect(output.receivedCount).toBe(0);
    expect(output.content).toBe("accepted\n");
  }, 30_000);

  it("serializes sign-off against an upstream source mutation", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-signoff-source-race-");

    const output = bunEval(seedSignoffScript(
      repository,
      state,
      `
        const currentSource = await coord.getWorkItemSource(runtime, work);
        const proposedBody = currentSource.bodyMarkdown.replace(
          "## Current context\\\\n",
          "## Current context\\\\nThis source change must lose to sign-off.\\\\n",
        );
        const inspected = await coord.computeSignoffPackage(runtime, work);
        const settled = await Promise.allSettled([
          coord.signOffWorkItem(
            runtime,
            work,
            inspected.packageHash,
            "race operator",
          ),
          coord.saveSourceBody(runtime, work, {
            expectedSha256: currentSource.sha256,
            bodyMarkdown: proposedBody,
          }),
        ]);
        const finalWorkItem = coord.getWorkItem(runtime, work);
        const finalSource = await coord.getWorkItemSource(runtime, work);
        console.log(JSON.stringify({
          states: settled.map((entry) => entry.status),
          finalWorkItem: {
            stage: finalWorkItem.stage,
            status: finalWorkItem.status,
          },
          sourceUnchanged: finalSource.sha256 === currentSource.sha256,
        }));
        database.close();
        process.exit(0);
      `,
    )) as {
      states: string[];
      finalWorkItem: { stage: string; status: string };
      sourceUnchanged: boolean;
    };

    expect(output.states).toEqual(["fulfilled", "rejected"]);
    expect(output.finalWorkItem).toEqual({
      stage: "EXECUTION",
      status: "ACTIVE",
    });
    expect(output.sourceUnchanged).toBe(true);
  }, 30_000);

  it("serializes duplicate stale-authority reconciliation to one lifecycle return", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-authority-reconcile-race-");

    const output = bunEval(seedSignoffScript(
      repository,
      state,
      `
        const fs = await import("node:fs");
        fs.writeFileSync(
          repositoryRoot + "/docs/plan.md",
          "plan changed before authority reconciliation\\n",
        );
        const settled = await Promise.allSettled([
          coord.reconcileWorkItemAuthority(runtime, work, "PLAN"),
          coord.reconcileWorkItemAuthority(runtime, work, "PLAN"),
        ]);
        const finalWorkItem = coord.getWorkItem(runtime, work);
        console.log(JSON.stringify({
          states: settled.map((entry) => entry.status),
          finalWorkItem: {
            stage: finalWorkItem.stage,
            status: finalWorkItem.status,
            outcome: finalWorkItem.outcome,
          },
        }));
        database.close();
        process.exit(0);
      `,
    )) as {
      states: string[];
      finalWorkItem: {
        stage: string;
        status: string;
        outcome: string | null;
      };
    };

    expect(output.states).toEqual(["fulfilled", "rejected"]);
    expect(output.finalWorkItem).toEqual({
      stage: "PLAN",
      status: "ACTIVE",
      outcome: null,
    });
  }, 30_000);

  it("rejects pre-signoff Resume while a Run remains active", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-resume-active-run-");

    const output = bunEval(seedSignoffScript(
      repository,
      state,
      `
        sql.updateWorkItemLifecycle(database, work, {
          stage: "PLAN",
          status: "BLOCKED",
          outcome: null,
        });
        const active = runStore.insertRun(runtime, {
          id: rt.newRunId(),
          workItemId: work,
          executionTaskId: null,
          stage: "PLAN",
          mode: "INTERACTIVE",
          role: "STAGE",
          triggerEventId: null,
          status: "RUNNING",
          attempt: runStore.nextAttempt(runtime, work, "PLAN", null),
          baselineCommit: await repo.resolveHeadCommit(repositoryRoot),
          contextHash: rt.sha256Text("blocked-active-run"),
          providerSessionId: null,
          terminalClassification: null,
          startedAt: timestamp,
          endedAt: null,
        });
        let error = null;
        try {
          await coord.resumeWorkItem(runtime, work);
        } catch (caught) {
          error = caught instanceof Error ? caught.message : String(caught);
        }
        const finalWorkItem = coord.getWorkItem(runtime, work);
        const finalRun = coord.getRun(runtime, active.id);
        console.log(JSON.stringify({
          error,
          finalWorkItem: {
            stage: finalWorkItem.stage,
            status: finalWorkItem.status,
          },
          runStatus: finalRun.status,
        }));
        database.close();
        process.exit(0);
      `,
    )) as {
      error: string | null;
      finalWorkItem: { stage: string; status: string };
      runStatus: string;
    };

    expect(output.error).toMatch(/cannot resume while a Run is active/);
    expect(output.finalWorkItem).toEqual({
      stage: "PLAN",
      status: "BLOCKED",
    });
    expect(output.runStatus).toBe("RUNNING");
  }, 30_000);

  it("rejects Resume when approval currentness changes during admission", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-resume-currentness-race-");

    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      const fs = await import("node:fs");
      const task = (await coord.listExecutionTasks(runtime, work))[0];
      database.query(
        "UPDATE executionTasks SET state='BLOCKED' WHERE id=?1",
      ).run(task.id);
      sql.updateWorkItemLifecycle(database, work, {
        stage: "EXECUTION",
        status: "BLOCKED",
        outcome: null,
      });

      const resume = coord.resumeWorkItem(runtime, work);
      fs.writeFileSync(
        repositoryRoot + "/docs/plan.md",
        "plan changed during resume admission\\n",
      );
      let error = null;
      try {
        await resume;
      } catch (caught) {
        error = caught instanceof Error ? caught.message : String(caught);
      }
      const finalWorkItem = coord.getWorkItem(runtime, work);
      const finalTask = (await coord.listExecutionTasks(runtime, work))[0];
      console.log(JSON.stringify({
        error,
        finalWorkItem: {
          stage: finalWorkItem.stage,
          status: finalWorkItem.status,
        },
        taskState: finalTask.state,
      }));
      database.close();
    `) as {
      error: string | null;
      finalWorkItem: { stage: string; status: string };
      taskState: string;
    };

    expect(output.error).toMatch(/resume preconditions are not satisfied/);
    expect(output.finalWorkItem).toEqual({
      stage: "EXECUTION",
      status: "BLOCKED",
    });
    expect(output.taskState).toBe("BLOCKED");
  }, 30_000);


  it("keeps source inspection observational across external source drift", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-source-read-purity-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const path = await import("node:path");
      const sql = await import("./src/shell/sqlite.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "source read purity",
        concernIds: ["shell"],
      });
      const source = sourceShell.readWorkItemSource(
        created.repositoryRoot,
        created.sourcePath,
      );
      const changed = sourceShell.replaceWorkItemSourceFile(
        created.repositoryRoot,
        source.path,
        source.sha256,
        source.markdown.replace(
          "# source read purity",
          "# externally changed source read purity",
        ),
      );
      if (changed.tag !== "UPDATED") {
        throw new TypeError("external source fixture update failed");
      }
      const absolute = path.join(created.repositoryRoot, created.sourcePath);
      const bytesBefore = fs.readFileSync(absolute, "utf8");
      const projectionBefore = coord.getWorkItem(runtime, created.id);
      const inspected = await coord.getWorkItemSource(runtime, created.id);
      const projectionAfter = coord.getWorkItem(runtime, created.id);
      const bytesAfter = fs.readFileSync(absolute, "utf8");
      console.log(JSON.stringify({
        inspectedChanged: inspected.sha256 !== projectionBefore.sourceSha256,
        projectionUnchanged:
          JSON.stringify(projectionAfter) === JSON.stringify(projectionBefore),
        bytesUnchanged: bytesAfter === bytesBefore,
        canonicalTitle: projectionAfter.title,
      }));
      database.close();
    `) as {
      inspectedChanged: boolean;
      projectionUnchanged: boolean;
      bytesUnchanged: boolean;
      canonicalTitle: string;
    };

    expect(output.inspectedChanged).toBe(true);
    expect(output.projectionUnchanged).toBe(true);
    expect(output.bytesUnchanged).toBe(true);
    expect(output.canonicalTitle).toBe("source read purity");
  });

  it("keeps lifecycle-artifact inspection from materializing changed repository bytes", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-artifact-read-purity-");

    const output = bunEval(`
      const fs = await import("node:fs");
      const sql = await import("./src/shell/sqlite.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const database = sql.openOrderDatabase(${JSON.stringify(state)});
      const runtime = coord.createCoordinatorRuntime(
        database,
        ${JSON.stringify(state)},
        process.env,
        {
          version: 4,
          model: { providerID: "opencode", id: "glm-5.3-flash-free" },
          repositoryRoots: [${JSON.stringify(repository)}],
          referenceRoots: [],
        },
      );
      const created = await coord.createWorkItem(runtime, {
        projectId: "fixture",
        schemaId: "change-v1",
        title: "artifact read purity",
        concernIds: ["shell"],
      });
      sql.promoteIdeaToR1(database, created.id);
      const workItem = coord.getWorkItem(runtime, created.id);
      const canonical = await authority.currentFileArtifact(
        runtime,
        workItem,
        "docs/r1.md",
        "R1",
        "P1",
      );
      fs.writeFileSync(
        ${JSON.stringify(repository)} + "/docs/r1.md",
        "externally changed r1\\n",
      );
      const bytesBefore = fs.readFileSync(
        ${JSON.stringify(repository)} + "/docs/r1.md",
        "utf8",
      );
      const projectionBefore = coord.getWorkItem(runtime, created.id);
      const artifactCountBefore = coord.listArtifacts(runtime, created.id).length;
      const current = await coord.listCurrentLifecycleArtifacts(runtime, created.id);
      const projectionAfter = coord.getWorkItem(runtime, created.id);
      const artifactCountAfter = coord.listArtifacts(runtime, created.id).length;
      const bytesAfter = fs.readFileSync(
        ${JSON.stringify(repository)} + "/docs/r1.md",
        "utf8",
      );
      console.log(JSON.stringify({
        staleArtifactExcluded: !current.some((artifact) => artifact.id === canonical.id),
        projectionUnchanged:
          JSON.stringify(projectionAfter) === JSON.stringify(projectionBefore),
        artifactCountUnchanged: artifactCountAfter === artifactCountBefore,
        bytesUnchanged: bytesAfter === bytesBefore,
      }));
      database.close();
    `) as {
      staleArtifactExcluded: boolean;
      projectionUnchanged: boolean;
      artifactCountUnchanged: boolean;
      bytesUnchanged: boolean;
    };

    expect(output).toEqual({
      staleArtifactExcluded: true,
      projectionUnchanged: true,
      artifactCountUnchanged: true,
      bytesUnchanged: true,
    });
  });

});

describe("native QA assessment evidence", () => {
  it("validates nested review evidence before persistence and authorizes its exact persisted Run read", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-qa-evidence-");
    const output = bunEval(`
      ${seedSignoffScript(repository,state)}
      const execution = await import("./src/daemon/execution.ts");
      const task = (await coord.listExecutionTasks(runtime,work))[0];
      const running = {...task,state:"RUNNING"};
      sql.setExecutionTaskState(database,task.id,"RUNNING");
      const context = await authority.approvalContext(runtime,approval,running,"BUILDER");
      const run = execution.createExecutionRun(runtime,coord.getWorkItem(runtime,work),running,approval,"BUILDER",null,context.contextHash);
      const findingId = "review_00000000-0000-4000-8000-000000000001";
      const bytes = new TextEncoder().encode("independent evidence");
      const evidence = runStore.writeRunEvidence(runtime,run.id,"qa/assessment.txt",bytes,"text/plain");
      const review = {tag:"REVIEW_PASSED",minimumChange:"MINIMUM_SUFFICIENT",minimumChangeSummary:null,evidence:[],
        qaAssessments:[{findingId,verdict:"SATISFIED",rationale:"verified",evidence:[evidence]}]};
      const rejected = (fn) => { try { fn(); return false; } catch { return true; } };
      const bad = {...review,qaAssessments:[{...review.qaAssessments[0],evidence:[{...evidence,sha256:"sha256:"+"0".repeat(64)}]}]};
      const missing = {...review,qaAssessments:[{...review.qaAssessments[0],evidence:[{...evidence,relativePath:"qa/missing.txt"}]}]};
      const before = runStore.listRunEvents(runtime,run.id).length;
      const badRejected = rejected(()=>runStore.persistProviderEvents(runtime,run,[bad]));
      const missingRejected = rejected(()=>runStore.persistProviderEvents(runtime,run,[missing]));
      const unchanged = runStore.listRunEvents(runtime,run.id).length===before;
      runStore.persistProviderEvents(runtime,run,[review]);
      const read = new TextDecoder().decode(runStore.readReferencedEvidence(runtime,run.id,"qa/assessment.txt"));
      console.log(JSON.stringify({badRejected,missingRejected,unchanged,read,refs:runStore.evidenceRefsInPayload(review),evidence}));
      database.close();
    `) as {badRejected:boolean;missingRejected:boolean;unchanged:boolean;read:string;refs:unknown[];evidence:unknown};
    expect(output).toMatchObject({badRejected:true,missingRejected:true,unchanged:true,read:"independent evidence"});
    expect(output.refs).toEqual([output.evidence]);
  },30_000);
});

describe("native QA immutable execution context", () => {
  it("binds exact submitted events and trigger without mutable task state or future Run identity", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-qa-context-");
    const output = bunEval(`
      ${seedSignoffScript(repository,state)}
      const execution = await import("./src/daemon/execution.ts");
      const core = await import("./src/core/lifecycle.ts");
      const task = (await coord.listExecutionTasks(runtime,work))[0];
      sql.setExecutionTaskState(database,task.id,"RUNNING");
      const running = {...task,state:"RUNNING"};
      const workItem = coord.getWorkItem(runtime,work);
      const ordinary = await authority.approvalContext(runtime,approval,running,"BUILDER");
      const builder = execution.createExecutionRun(runtime,workItem,running,approval,"BUILDER",null,ordinary.contextHash);
      const patch = runStore.writeRunEvidence(runtime,builder.id,"candidate/patch.diff",new TextEncoder().encode("patch"),"text/x-diff");
      const candidateState = runStore.appendRunEvent(runtime,builder.id,{tag:"CANDIDATE_STATE_RECORDED",patch,changedPaths:["src/target.ts"]});
      runStore.updateRun(runtime,builder.id,{status:"COMPLETED",endedAt:timestamp});
      const ordinaryReview = await authority.approvalContext(runtime,approval,running,"REVIEWER");
      const reviewer = execution.createExecutionRun(runtime,workItem,running,approval,"REVIEWER",candidateState.id,ordinaryReview.contextHash);
      const validations = [];
      for (const stage of ["V0","V1","V2","V3","V4","V5","V6","V7"]) {
        if(stage==="V4") runStore.appendRunEvent(runtime,reviewer.id,{tag:"REVIEW_PASSED",minimumChange:"MINIMUM_SUFFICIENT",minimumChangeSummary:null,evidence:[]});
        validations.push(runStore.appendRunEvent(runtime,reviewer.id,{tag:"VALIDATION_PASSED",stage,evidence:[]}));
      }
      const member = runStore.appendRunEvent(runtime,reviewer.id,{tag:"CANDIDATE_RECORDED",candidateStateEventId:candidateState.id,validationEventIds:validations.map(value=>value.id)});
      runStore.updateRun(runtime,reviewer.id,{status:"COMPLETED",terminalClassification:"CANDIDATE_DONE",endedAt:timestamp});
      sql.setExecutionTaskState(database,task.id,"CANDIDATE_DONE");
      const hash=rt.sha256Text(core.candidateMembershipCanonicalJson(approval.id,[[task.id,member.id]]));
      const append=(sequence,actor,event)=>{const value={id:rt.newCandidateReviewEventId(),approvalId:approval.id,sequence,occurredAt:timestamp,actor,event};sql.storeCandidateReviewEvent(database,value);return value;};
      const opened=append(1,null,{tag:"OPENED",candidateHash:hash});
      const report=append(2,"human",{tag:"REPORT",candidateHash:hash,taskId:task.id,candidateEventId:member.id,acceptanceRefs:[],expected:"expected",observed:"observed",reproduction:"steps",impact:"impact",evidence:[candidateState.id]});
      const submit=append(3,"human",{tag:"SUBMIT",candidateHash:hash,findingIds:[report.id]});
      const qa={submissionId:submit.id,triggerEventId:member.id};
      const done=await authority.approvalContext(runtime,approval,{...task,state:"CANDIDATE_DONE"},"REVIEWER",qa);
      const active=await authority.approvalContext(runtime,approval,running,"REVIEWER",qa);
      const replay=execution.createExecutionRun(runtime,workItem,running,approval,"REVIEWER",member.id,active.contextHash);
      append(4,null,{tag:"REVIEW_STARTED",submissionId:submit.id,runId:replay.id});
      const reloaded=await authority.approvalContextForRun(runtime,approval,running,replay);
      const prompt=await execution.executionPrompt(workItem,"REVIEWER",running,reloaded);
      const rejects=async fn=>{try{await fn();return false;}catch{return true;}};
      const wrongTrigger=await rejects(()=>authority.approvalContext(runtime,approval,running,"REVIEWER",{...qa,triggerEventId:candidateState.id}));
      const wrongHash=await rejects(()=>authority.approvalContextForRun(runtime,approval,running,{...replay,contextHash:ordinaryReview.contextHash}));
      console.log(JSON.stringify({stable:done.contextHash===active.contextHash&&active.contextHash===reloaded.contextHash,
        ordinaryDifferent:ordinaryReview.contextHash!==active.contextHash,
        events:reloaded.qa.events.map(value=>value.id),expected:[submit.id,report.id],
        promptContains:prompt.includes(JSON.stringify(report.id))&&prompt.includes(member.id)&&!prompt.includes('"state":"RUNNING"'),
        wrongTrigger,wrongHash}));
      database.close();
    `) as {stable:boolean;ordinaryDifferent:boolean;events:string[];expected:string[];promptContains:boolean;wrongTrigger:boolean;wrongHash:boolean};
    expect(output).toMatchObject({stable:true,ordinaryDifferent:true,promptContains:true,wrongTrigger:true,wrongHash:true});
    expect(output.events).toEqual(output.expected);
  },30_000);
});
