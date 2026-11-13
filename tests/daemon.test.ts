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

import { orderVersion } from "../src/version.ts";

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
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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
      connections: [{
        type: "credential",
        id: "credential_fixture",
        method: "oauth",
        label: "fixture@example.com",
      }],
    };
    if (request.method === "GET" && url.pathname === "/api/integration") {
      return json({ location: { directory: process.cwd() }, data: [accountIntegration] });
    }
    if (request.method === "GET" && url.pathname === "/api/integration/opencode") {
      return json({ location: { directory: process.cwd() }, data: accountIntegration });
    }
    if (request.method === "GET" && url.pathname === "/api/model") {
      return json({
        location: { directory: process.cwd() },
        data: [{ ...model, enabled: true }],
      });
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
      if (text.includes("Order execution role: BUILDER")) {
        if (mode === "noop" || mode === "noop-delay") {
          if (mode === "noop-delay") {
            writeFileSync(join(own, "provider-started"), "started");
            while (!existsSync(join(own, "provider-release"))) {
              await Bun.sleep(10);
            }
          }
          output = '[{"tag":"TASK_ALREADY_SATISFIED","summary":"baseline already satisfies the signed task"}]';
        } else if (mode === "empty") {
          output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"no candidate produced","evidence":[]}]';
        } else {
          writeFileSync(join(process.cwd(), "src", "target.ts"), "needs-review\\n");
          output = '[{"tag":"AGENT_MESSAGE_FINAL","text":"candidate prepared","evidence":[]}]';
        }
      } else if (text.includes("Order execution role: REMEDIATOR")) {
        if (mode === "fix") {
          writeFileSync(join(process.cwd(), "src", "target.ts"), "fixed\\n");
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
        output = target === "fixed\\n" && hasV4Inputs
          ? '[{"tag":"REVIEW_PASSED","evidence":[]}]'
          : '[{"tag":"REVIEW_FAILED","classification":"REVIEW_FAILURE","summary":"target still needs repair or V4 inputs are incomplete","evidence":[]}]';
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
      schemaId: "change-v1",
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
  for (const argv of [
    ["git", "add", "--", createdSource.path],
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
    R1: await authority.currentFileArtifact(runtime, seedWorkItem, "docs/r1.md", "R1", "P1"),
    R2: await authority.currentFileArtifact(runtime, seedWorkItem, "docs/r2.md", "R2", "P3"),
    DESIGN: await authority.currentFileArtifact(runtime, seedWorkItem, "docs/design.md", "DESIGN", "P6"),
    PLAN: await authority.currentFileArtifact(runtime, seedWorkItem, "docs/plan.md", "PLAN", "P7"),
    R3: await authority.currentFileArtifact(runtime, seedWorkItem, "docs/r3.md", "R3", "P7"),
  };

  const conform = async (stage, output) => {
    const context = await authority.resolveStageContext(runtime, seedWorkItem, stage);
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
  const approval = await coord.signOffWorkItem(runtime, work, prepared.packageHash, "human");
`;
};

describe("daemon control plane", () => {
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
      console.log(JSON.stringify({ malformed, absent, conflict, unexpected, unexpectedSchema }));
    `) as {
      malformed: { status: number; code: string; message: string; sourceDiagnostic: unknown };
      absent: { status: number; code: string; message: string; sourceDiagnostic: unknown };
      conflict: { status: number; code: string; message: string; sourceDiagnostic: unknown };
      unexpected: { status: number; code: string; message: string; sourceDiagnostic: unknown };
      unexpectedSchema: { status: number; code: string; message: string; sourceDiagnostic: unknown };
    };

    expect(output.malformed).toMatchObject({
      status: 400,
      code: "INVALID_REQUEST",
      sourceDiagnostic: null,
    });
    expect(output.absent).toEqual({
      status: 404,
      code: "NOT_FOUND",
      message: "WorkItem does not exist",
      sourceDiagnostic: null,
    });
    expect(output.conflict).toEqual({
      status: 409,
      code: "CURRENT_STATE_CONFLICT",
      message: "WorkItem is not awaiting sign-off",
      sourceDiagnostic: null,
    });
    expect(output.unexpected).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Internal daemon error",
      sourceDiagnostic: null,
    });
    expect(output.unexpected.message).not.toContain("secret internal detail");
    expect(output.unexpectedSchema).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Internal daemon error",
      sourceDiagnostic: null,
    });
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
        console.log(JSON.stringify({
          config: daemon.coordinator.config,
          schedulerStopped: daemon.coordinator.schedulerStopped,
        }));
      } finally {
        await daemon.stop();
      }
    `, providerEnvironment(binary, emptyState)) as {
      config: { version: number; model: unknown; repositoryRoots: string[] };
      schedulerStopped: boolean;
    };
    expect(empty.config).toMatchObject({ version: 4, model: null, repositoryRoots: [] });
    expect(empty.schedulerStopped).toBe(true);

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
    expect(drift.schedulerStopped).toBe(true);
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
        activated,
        activeConfig: owner.current.config,
        persisted: after,
        stale,
      }));
      await (await import("./src/daemon/coordinator.ts")).stopCoordinatorScheduler(owner.current);
      database.close();
    `, providerEnvironment(binary, state)) as {
      runtimeReplaced: boolean;
      activeConfig: { repositoryRoots: string[] };
      persisted: { config: { repositoryRoots: string[] } };
      stale: string | null;
    };

    expect(output.runtimeReplaced).toBe(true);
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
          missingOrigin: missingOrigin.status,
          wrongOrigin: wrongOrigin.status,
          tickStatus: tick.status,
          tickBody: await tick.json(),
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
    });
    expect(output.absentStatus).toBe(404);
    expect(output.absentBody).toEqual({
      code: "NOT_FOUND",
      message: "WorkItem does not exist",
      sourceDiagnostic: null,
    });
    expect(output.missingOrigin).toBe(403);
    expect(output.wrongOrigin).toBe(403);
    expect(output.tickStatus).toBe(409);
    expect(output.tickBody).toMatchObject({
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


  it("binds first R1 baseline to the repository selected by current IDEA source reclassification", () => {
    const originalRepository = createRepository("original");
    const reclassifiedRepository = createRepository("reclassified");
    const state = tempDir("order-daemon-r1-reclassification-");
    const workItemRoot = join(originalRepository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });
    const binary = createFakeOpenCode("fix");

    const output = bunEval(`
      const sourceCore = await import("./src/core/work-item-source.ts");
      const sourceShell = await import("./src/shell/work-item-source.ts");
      const repo = await import("./src/shell/repository.ts");
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
      const source = sourceShell.readWorkItemSource(runtime.config.repositoryRoots[0], created.sourcePath,
      );
      const changedMarkdown = sourceCore.renderWorkItemSourceMarkdown(
        { ...source.metadata, projectId: "reclassified" },
        source.title,
      );
      sourceShell.replaceWorkItemSourceFile(runtime.config.repositoryRoots[0], source.path,
        source.sha256,
        changedMarkdown,
      );
      const expectedBaseline = await repo.resolveHeadCommit(
        ${JSON.stringify(reclassifiedRepository)},
      );
      const staleBaseline = await repo.resolveHeadCommit(
        ${JSON.stringify(originalRepository)},
      );
      const run = await coord.startStageRun(runtime, created.id, "INTERACTIVE");
      const updated = coord.getWorkItem(runtime, created.id);
      await coord.cancelRun(runtime, run.id);
      console.log(JSON.stringify({
        projectId: updated.projectId,
        repositoryRoot: updated.repositoryRoot,
        baselineCommit: run.baselineCommit,
        expectedBaseline,
        staleBaseline,
      }));
      database.close();
    `, providerEnvironment(binary, state)) as {
      projectId: string;
      repositoryRoot: string;
      baselineCommit: string;
      expectedBaseline: string;
      staleBaseline: string;
    };

    expect(output.projectId).toBe("reclassified");
    expect(output.repositoryRoot).toBe(reclassifiedRepository);
    expect(output.baselineCommit).toBe(output.expectedBaseline);
    expect(output.baselineCommit).not.toBe(output.staleBaseline);
  }, 30_000);

  it("enforces same-project terminal investigation/audit lineage and delivery-only remediation", () => {
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
        schemaId: "investigation-v1",
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
        schemaId: "investigation-v1",
        sourcePath: parentSource.path,
        sourceSha256: parentSource.sha256,
        derivedFromWorkItemId: null,
        stage: "COMPLETE",
        status: "COMPLETE",
        outcome: "INVESTIGATION_COMPLETE",
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

  it("blocks a schema-invalid R1 completion as semantic conformance failure", () => {
    const repository = createRepository();
    const state = tempDir("order-daemon-kind-invalid-r1-");
    const workItemRoot = join(repository, "docs", "order", "work-items");
    mkdirSync(workItemRoot, { recursive: true });

    const output = bunEval(`
      const sql = await import("./src/shell/sqlite.ts");
      const rt = await import("./src/shell/runtime.ts");
      const coord = await import("./src/daemon/coordinator.ts");
      const authority = await import("./src/daemon/authority.ts");
      const stage = await import("./src/daemon/stage.ts");
      const runStore = await import("./src/daemon/run.ts");
      const repo = await import("./src/shell/repository.ts");

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
        schemaId: "audit-v1",
        title: "audit completion mismatch",
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
        status: "RUNNING",
        attempt: runStore.nextAttempt(runtime, workItem.id, "R1", null),
        baselineCommit: await repo.resolveHeadCommit(${JSON.stringify(repository)}),
        contextHash: context.contextHash,
        providerSessionId: null,
        terminalClassification: null,
        startedAt: rt.nowIsoDateTime(),
        endedAt: null,
      });
      const completion = runStore.appendRunEvent(runtime, run.id, {
        tag: "STAGE_COMPLETED",
        completion: { stage: "R1", outcome: "CONFIRMED" },
        artifactRefIds: [],
      });
      const settled = await stage.applyStageCompletion(
        runtime,
        run,
        context,
        completion,
      );
      const after = coord.getWorkItem(runtime, workItem.id);
      const failures = runStore.listRunEvents(runtime, run.id)
        .filter((event) => event.event.tag === "CONFORMANCE_FAILED")
        .map((event) => event.event.tag === "CONFORMANCE_FAILED"
          ? event.event.summary
          : "");
      console.log(JSON.stringify({
        runStatus: settled.status,
        stage: after.stage,
        status: after.status,
        outcome: after.outcome,
        failures,
      }));
      database.close();
    `) as {
      runStatus: string;
      stage: string;
      status: string;
      outcome: string | null;
      failures: string[];
    };

    expect(output).toEqual({
      runStatus: "BLOCKED",
      stage: "R1",
      status: "ACTIVE",
      outcome: null,
      failures: ["R1 outcome CONFIRMED is invalid for schema audit-v1"],
    });
  });

  it("returns AWAITING_SIGNOFF to the stale lifecycle owner when current Markdown diverges", () => {
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
        let error = null;
        try {
          await coord.computeSignoffPackage(runtime, work);
        } catch (caught) {
          error = caught instanceof Error ? caught.message : String(caught);
        }
        const recovered = coord.getWorkItem(runtime, work);
        console.log(JSON.stringify({
          error,
          stage: recovered.stage,
          status: recovered.status,
        }));
        database.close();
        process.exit(0);
      `,
    )) as { error: string | null; stage: string; status: string };

    expect(output.error).toMatch(/missing or stale: PLAN/);
    expect(output).toMatchObject({ stage: "PLAN", status: "ACTIVE" });
  });

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
    expect(output.stage).toBe("R1");
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
      const afterRun = coord.listRuns(runtime, work).find((candidate) => candidate.id === waiting.id);
      const events = coord.listRunEvents(runtime, waiting.id);
      console.log(JSON.stringify({
        rejected,
        workItem: coord.getWorkItem(runtime, work),
        runStatus: afterRun?.status ?? null,
        receivedCount: events.filter((event) => event.event.tag === "HUMAN_INPUT_RECEIVED").length,
        conformanceFailures: events.filter((event) => event.event.tag === "CONFORMANCE_FAILED").length,
      }));
      database.close();
    `) as {
      rejected: boolean;
      workItem: { stage: string; status: string };
      runStatus: string | null;
      receivedCount: number;
      conformanceFailures: number;
    };

    expect(output.rejected).toBe(true);
    expect(output.workItem).toMatchObject({ stage: "R1", status: "ACTIVE" });
    expect(output.runStatus).toBe("BLOCKED");
    expect(output.receivedCount).toBe(0);
    expect(output.conformanceFailures).toBe(1);
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
      const content = await coord.readArtifactContent(runtime, current[0].id);
      console.log(JSON.stringify({
        count: current.length,
        oldId: plan.id,
        currentId: current[0]?.id ?? null,
        currentHash: current[0]?.sha256 ?? null,
        text: new TextDecoder().decode(content),
      }));
      database.close();
    `) as {
      count: number;
      oldId: string;
      currentId: string | null;
      currentHash: string | null;
      text: string;
    };

    expect(output.count).toBe(1);
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
      const drafts = await authority.currentStageDraftArtifacts(runtime, after, "PLAN");
      const contextState = await authority.resolveStageContextState(runtime, after, "PLAN");
      const prompt = await stageOwner.stagePrompt(
        after,
        "PLAN",
        contextState.context,
        drafts,
        [],
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
        draftCount: drafts.length,
        draftSha256: drafts[0]?.sha256 ?? null,
        promptHasDraft:
          prompt.includes("Current stage draft for review") &&
          prompt.includes("plan after"),
        conformanceCount: runStore.listRunEvents(runtime, priorPlanRun.id)
          .filter((event) => event.event.tag === "CONFORMANCE_PASSED").length,
        r3Rejected,
      }));
      database.close();
    `) as {
      saved: { tag: string; sha256: string };
      stage: string;
      draftCount: number;
      draftSha256: string | null;
      promptHasDraft: boolean;
      conformanceCount: number;
      r3Rejected: boolean;
    };

    expect(output.saved.tag).toBe("UPDATED");
    expect(output.saved.sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(output.stage).toBe("PLAN");
    expect(output.draftCount).toBe(1);
    expect(output.draftSha256).toBe(output.saved.sha256);
    expect(output.promptHasDraft).toBe(true);
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
        status: "COMPLETED",
        attempt: 1,
        baselineCommit: baseline,
        contextHash: "sha256:" + "a".repeat(64),
        providerSessionId: null,
        terminalClassification: null,
        startedAt: "2026-11-11T04:00:00.000Z",
        endedAt: "2026-11-11T04:00:00.000Z",
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

  it("routes newly resolved post-signoff authority through APPROVAL_STALE before provider mutation", () => {
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

    const state = tempDir("order-daemon-new-authority-stale-");
    const binary = createFakeOpenCode("fix");
    const output = bunEval(`
      ${seedSignoffScript(repository, state)}
      await Bun.write(repositoryRoot + "/docs/governance/new.md", "# new P1 authority\\n");
      const tick = await coord.runCoordinatorTick(runtime);
      const task = (await coord.listExecutionTasks(runtime, work))[0];
      const postRuns = coord.listRuns(runtime, work).filter((run) => run.executionTaskId !== null);
      const firstRun = postRuns[0];
      const events = firstRun ? coord.listRunEvents(runtime, firstRun.id) : [];
      console.log(JSON.stringify({
        tick,
        workItem: coord.getWorkItem(runtime, work),
        taskState: task?.state ?? null,
        providerSessionId: firstRun?.providerSessionId ?? null,
        failures: events
          .filter((event) => event.event.tag === "VALIDATION_FAILED")
          .map((event) => event.event),
      }));
      database.close();
    `, providerEnvironment(binary, state), 180_000) as {
      workItem: { stage: string; status: string };
      taskState: string | null;
      providerSessionId: string | null;
      failures: Array<{ tag: string; stage: string; classification: string }>;
    };

    expect(output.workItem).toMatchObject({ stage: "R2", status: "ACTIVE" });
    expect(output.taskState).toBe("BLOCKED");
    expect(output.providerSessionId).toBeNull();
    expect(output.failures).toContainEqual(
      expect.objectContaining({
        tag: "VALIDATION_FAILED",
        stage: "V1",
        classification: "APPROVAL_STALE",
      }),
    );
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
      await coord.reconcileSources(runtime);
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
});
