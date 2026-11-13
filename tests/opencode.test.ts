import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporary: string[] = [];

const tempDir = (prefix: string): string => {
  const path = mkdtempSync(join(tmpdir(), prefix));
  temporary.push(path);
  return path;
};

afterEach(() => {
  for (const path of temporary.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const bunEval = (
  code: string,
  environment: Record<string, string> = {},
): unknown => {
  const result = spawnSync("bun", ["--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, ...environment },
    timeout: 30_000,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout.trim());
};

const fakeOpenCodeSource = `#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const configPath = join(process.cwd(), ".fake-opencode.json");
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, "utf8"))
  : {};

if (args.length === 1 && args[0] === "--version") {
  console.log("opencode v" + (config.version ?? "2.2.6"));
  process.exit(0);
}

if (
  (args.length === 3 || args.length === 4) &&
  args[0] === "--standalone" &&
  args[1] === "auth" &&
  args[2] === "login"
) {
  if (config.loginRecordPath) {
    writeFileSync(
      config.loginRecordPath,
      JSON.stringify({
        argv: args,
        HOME: process.env.HOME,
        XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
        XDG_DATA_HOME: process.env.XDG_DATA_HOME,
        XDG_STATE_HOME: process.env.XDG_STATE_HOME,
        XDG_CACHE_HOME: process.env.XDG_CACHE_HOME,
        OPENCODE_DB: process.env.OPENCODE_DB,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? null,
      }),
    );
  }
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
  console.error("unexpected argv", JSON.stringify(args));
  process.exit(2);
}

const modelText = config.model ?? "opencode/glm-5.3-flash-free";
const slash = modelText.indexOf("/");
const model = {
  providerID: modelText.slice(0, slash),
  id: modelText.slice(slash + 1),
};
const sessions = new Map();
let sessionCounter = 0;
let promptCounter = 0;

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
      return json({ version: config.serverVersion ?? "2.2.6" });
    }

    if (request.method === "GET" && url.pathname === "/api/model") {
      return json({
        location: { directory: process.cwd() },
        data: config.models ?? [
          {
            providerID: model.providerID,
            id: model.id,
            enabled: config.modelEnabled ?? true,
          },
        ],
      });
    }

    if (request.method === "POST" && url.pathname === "/api/session") {
      const body = await request.json();
      const id = "ses_" + (++sessionCounter);
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
      session.model = { ...body.model, variant: "default" };
      session.time.updated = Date.now();
      return new Response(null, { status: 204 });
    }

    if (request.method === "PATCH" && suffix === "") {
      const body = await request.json();
      if (body.permissions !== undefined) session.permissions = body.permissions;
      session.time.updated = Date.now();
      return new Response(null, { status: 204 });
    }

    if (request.method === "GET" && suffix === "") {
      const { messages, ...info } = session;
      return json({ data: info });
    }

    if (request.method === "POST" && suffix === "prompt") {
      const body = await request.json();
      promptCounter += 1;
      const output =
        config.outputs?.[promptCounter - 1] ??
        '[{"tag":"AGENT_MESSAGE_FINAL","text":"ok","evidence":[]}]';
      const stderrLine = config.stderr?.[promptCounter - 1];
      if (typeof stderrLine === "string") console.error(stderrLine);
      const now = Date.now();
      session.messages.push({
        id: body.id,
        type: "user",
        text: body.text,
        time: { created: now },
      });
      session.messages.push({
        id: "msg_assistant_" + promptCounter,
        type: "assistant",
        agent: "build",
        model: session.model,
        time: { created: now, completed: now },
        content: [{ type: "text", text: output }],
      });
      session.messages.push({
        id: "msg_idle_" + promptCounter,
        type: "idle",
        outcome: "succeeded",
        time: { created: now },
      });
      session.time.idle = Math.max(now, (session.time.idle ?? 0) + 1);
      session.time.updated = now;
      session.outcome = "succeeded";
      return json({ data: { id: body.id, type: "user", payload: { text: body.text } } });
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

const createFakeOpenCode = (
  workspace: string,
  config: Record<string, unknown>,
): string => {
  const binary = join(workspace, "fake-opencode.ts");
  writeFileSync(binary, fakeOpenCodeSource, { mode: 0o755 });
  chmodSync(binary, 0o755);
  writeFileSync(join(workspace, ".fake-opencode.json"), JSON.stringify(config));
  return binary;
};

const providerEnvironment = (
  binary: string,
): Record<string, string> => ({
  PONTIVUS_ORDER_OPENCODE_BIN: binary,
  OPENAI_API_KEY: "must-not-leak",
});

const taskLiteral = `({
  id: "task_11111111-1111-4111-8111-111111111111",
  approvalId: "approval_11111111-1111-4111-8111-111111111111",
  planTaskId: "T1",
  objective: "test",
  dependsOn: [],
  scope: ["src/a.ts", "src/b.ts"],
  exclusions: [],
  acceptanceRefs: [],
  changeSurface: ["src/a.ts", "src/b.ts"],
  gateIds: ["test"],
  authorityRefs: [],
  concernIds: ["shell"],
  state: "TODO",
})`;

describe("OpenCode shell", () => {
  it("builds a private provider environment and preserves slash-bearing model ids", () => {
    const state = tempDir("order-opencode-env-");
    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      const env = o.buildOpenCodeEnvironment(
        ${JSON.stringify(state)},
        {
          PATH: process.env.PATH,
          LANG: "C.UTF-8",
          OPENAI_API_KEY: "secret",
        },
        "a".repeat(64),
      );
      console.log(JSON.stringify({ env }));
    `) as {
      env: Record<string, string>;
    };
    expect(output.env.HOME).toBe(join(state, "opencode", "home"));
    expect(output.env.XDG_CONFIG_HOME).toBe(join(state, "opencode", "config"));
    expect(output.env.XDG_DATA_HOME).toBe(join(state, "opencode", "data"));
    expect(output.env.XDG_STATE_HOME).toBe(join(state, "opencode", "state"));
    expect(output.env.XDG_CACHE_HOME).toBe(join(state, "opencode", "cache"));
    expect(output.env.OPENCODE_DB).toBe(join(state, "opencode", "opencode.db"));
    expect(output.env.OPENCODE_DISABLE_PROJECT_CONFIG).toBe("1");
    expect(output.env.OPENCODE_DISABLE_CLAUDE_CODE).toBe("1");
    expect(output.env.OPENCODE_DISABLE_CLAUDE_CODE_SKILLS).toBe("1");
    expect(output.env.OPENCODE_DISABLE_AUTOUPDATE).toBe("1");
    expect(output.env.OPENCODE_PASSWORD).toBe("a".repeat(64));
    expect(output.env.OPENAI_API_KEY).toBeUndefined();
  });

  it("fails closed on system config, unresolved AGENTS authority, and signed instruction mutation", () => {
    const workspace = tempDir("order-opencode-agents-");
    mkdirSync(join(workspace, "nested"));
    writeFileSync(join(workspace, "AGENTS.md"), "# root\n");
    writeFileSync(join(workspace, "nested", "AGENTS.md"), "# nested\n");
    const marker = join(workspace, "system-opencode");
    mkdirSync(marker);

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      let systemRejected = false;
      let unresolvedRejected = false;
      let mutationRejected = false;
      try { o.assertNoOpenCodeSystemConfig(${JSON.stringify(marker)}); } catch { systemRejected = true; }
      try {
        await o.assertAgentInstructionsResolved(
          ${JSON.stringify(workspace)},
          ["AGENTS.md"],
          null,
        );
      } catch { unresolvedRejected = true; }
      const task = {
        ...${taskLiteral},
        changeSurface: ["src/a.ts", "nested/AGENTS.md"],
      };
      try {
        await o.assertAgentInstructionsResolved(
          ${JSON.stringify(workspace)},
          ["AGENTS.md", "nested/AGENTS.md"],
          task,
        );
      } catch { mutationRejected = true; }
      console.log(JSON.stringify({ systemRejected, unresolvedRejected, mutationRejected }));
    `) as Record<string, boolean>;

    expect(output).toEqual({
      systemRejected: true,
      unresolvedRejected: true,
      mutationRejected: true,
    });
  });

  it("creates deny-first exact-path permission rules for multi-resource patch authorization", () => {
    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      console.log(JSON.stringify(o.openCodePermissionRules("BUILDER", ${taskLiteral}, [])));
    `) as unknown[];

    expect(output).toEqual([
      { action: "*", resource: "*", effect: "deny" },
      { action: "read", resource: "*", effect: "allow" },
      { action: "glob", resource: "*", effect: "allow" },
      { action: "grep", resource: "*", effect: "allow" },
      { action: "edit", resource: "src/a.ts", effect: "allow" },
      { action: "edit", resource: "src/b.ts", effect: "allow" },
    ]);
  });

  it("lists only enabled exact models from the private V2 catalog", () => {
    const workspace = tempDir("order-opencode-models-");
    const state = tempDir("order-opencode-models-state-");
    const binary = createFakeOpenCode(workspace, {
      models: [
        { providerID: "zeta", id: "disabled", enabled: false },
        { providerID: "opencode", id: "glm-5.3-flash-free", enabled: true },
        { providerID: "anthropic", id: "claude", enabled: true },
      ],
    });

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      console.log(JSON.stringify(await o.listAvailableOpenCodeModels(
        ${JSON.stringify(state)},
        ${JSON.stringify(workspace)},
        process.env,
      )));
    `, providerEnvironment(binary)) as unknown[];

    expect(output).toEqual([
      { providerID: "anthropic", id: "claude" },
      { providerID: "opencode", id: "glm-5.3-flash-free" },
    ]);
  });

  it("grants external-directory access only to STAGE reference roots", () => {
    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      console.log(JSON.stringify({
        stage: o.openCodePermissionRules("STAGE", null, ["/home/test/reference"]),
        reviewer: o.openCodePermissionRules("REVIEWER", ${taskLiteral}, ["/home/test/reference"]),
        builder: o.openCodePermissionRules("BUILDER", ${taskLiteral}, ["/home/test/reference"]),
      }));
    `) as { stage: unknown[]; reviewer: unknown[]; builder: unknown[] };

    expect(output.stage).toContainEqual({
      action: "external_directory",
      resource: "/home/test/reference/*",
      effect: "allow",
    });
    expect(output.reviewer).not.toContainEqual(expect.objectContaining({ action: "external_directory" }));
    expect(output.builder).not.toContainEqual(expect.objectContaining({ action: "external_directory" }));
  });

  it("bootstraps exact 2.2.6, binds the configured model, and completes a deterministic productive turn", () => {
    const workspace = tempDir("order-opencode-server-");
    const state = tempDir("order-opencode-state-");
    writeFileSync(join(workspace, "AGENTS.md"), "# authority\n");
    const binary = createFakeOpenCode(workspace, {
      outputs: ['[{"tag":"AGENT_MESSAGE_FINAL","text":"done","evidence":[]}]'],
    });

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      const server = await o.startOpenCodeServer(
        ${JSON.stringify(state)},
        ${JSON.stringify(workspace)},
        { providerID: "opencode", id: "glm-5.3-flash-free" },
        process.env,
      );
      try {
        const sessionID = await o.createOpenCodeSession(
          server,
          "STAGE",
          null,
          ["AGENTS.md"],
          [],
        );
        const run = {
          id: "run_11111111-1111-4111-8111-111111111111",
          contextHash: "sha256:" + "a".repeat(64),
        };
        const eventId = "event_22222222-2222-4222-8222-222222222222";
        const promptId = o.openCodePromptId(run, eventId);
        let diagnostics = null;
        let diagnosticStderr = null;
        const events = await o.runOpenCodeTurn(
          server,
          sessionID,
          run,
          eventId,
          "STAGE",
          null,
          [],
          "Return the canonical event array.",
          (record, stderr) => {
            diagnostics = record;
            diagnosticStderr = stderr === null ? null : new TextDecoder().decode(stderr);
          },
        );
        const session = await server.client.session.get({ sessionID });
        console.log(JSON.stringify({
          promptId,
          events,
          diagnostics,
          diagnosticStderr,
          model: session.model,
          permissions: session.permissions,
          exposedKeys: Object.keys(server).sort(),
        }));
      } finally {
        await o.stopOpenCodeServer(server);
      }
    `, providerEnvironment(binary)) as {
      promptId: string;
      events: unknown[];
      model: unknown;
      diagnostics: {
        providerId: string;
        modelId: string;
        providerSessionId: string;
        promptId: string;
        outcome: string;
        formatRepairAttempted: boolean;
        formatRepairSucceeded: boolean | null;
        failurePhase: string | null;
        exceptionMessage: string | null;
      };
      diagnosticStderr: string | null;
      permissions: unknown[];
      exposedKeys: string[];
    };

    expect(output.promptId).toMatch(/^msg_[0-9a-f]{64}$/);
    expect(output.events).toEqual([
      { tag: "AGENT_MESSAGE_FINAL", text: "done", evidence: [] },
    ]);
    expect(output.diagnostics).toMatchObject({
      providerId: "opencode",
      modelId: "glm-5.3-flash-free",
      promptId: output.promptId,
      outcome: "SUCCEEDED",
      formatRepairAttempted: false,
      formatRepairSucceeded: null,
      failurePhase: null,
      exceptionMessage: null,
    });
    expect(output.diagnosticStderr).toBeNull();
    expect(output.model).toEqual({
      providerID: "opencode",
      id: "glm-5.3-flash-free",
      variant: "default",
    });
    expect(output.permissions).toEqual([
      { action: "*", resource: "*", effect: "deny" },
      { action: "read", resource: "*", effect: "allow" },
      { action: "glob", resource: "*", effect: "allow" },
      { action: "grep", resource: "*", effect: "allow" },
    ]);
    expect(output.exposedKeys).toEqual([
      "client",
      "diagnosticStderr",
      "model",
      "process",
      "workspace",
    ]);
  });

  it("uses exactly one deny-all format repair and restores productive permissions", () => {
    const workspace = tempDir("order-opencode-repair-");
    const state = tempDir("order-opencode-repair-state-");
    writeFileSync(join(workspace, "AGENTS.md"), "# authority\n");
    const binary = createFakeOpenCode(workspace, {
      outputs: [
        '[{"tag":"ARTIFACT_PROPOSAL_CREATED","targetPath":"docs/r1.md","baseSha256":null,"role":"R1","authorityLayer":"P1","unifiedDiff":"--- /dev/null\\n+++ b/docs/r1.md\\n@@ -0,0 +1 @@\\n+# R1","rationale":"Create R1"}]',
        '[{"tag":"ARTIFACT_PROPOSAL_CREATED","targetPath":"docs/r1.md","baseSha256":null,"role":"R1","authorityLayer":"P1","unifiedDiff":"--- /dev/null\\n+++ b/docs/r1.md\\n@@ -0,0 +1 @@\\n+# R1\\n","rationale":"Create R1"}]',
      ],
    });

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      const server = await o.startOpenCodeServer(
        ${JSON.stringify(state)},
        ${JSON.stringify(workspace)},
        { providerID: "opencode", id: "glm-5.3-flash-free" },
        process.env,
      );
      try {
        const sessionID = await o.createOpenCodeSession(
          server,
          "STAGE",
          null,
          ["AGENTS.md"],
          [],
        );
        const run = {
          id: "run_11111111-1111-4111-8111-111111111111",
          contextHash: "sha256:" + "a".repeat(64),
        };
        let diagnostics = null;
        const events = await o.runOpenCodeTurn(
          server,
          sessionID,
          run,
          "event_22222222-2222-4222-8222-222222222222",
          "STAGE",
          null,
          [],
          "Return events.",
          (record) => {
            diagnostics = record;
          },
        );
        const session = await server.client.session.get({ sessionID });
        const context = await server.client.session.context({ sessionID });
        console.log(JSON.stringify({
          events,
          diagnostics,
          permissions: session.permissions,
          userPrompts: context.filter((message) => message.type === "user").length,
        }));
      } finally {
        await o.stopOpenCodeServer(server);
      }
    `, providerEnvironment(binary)) as {
      events: unknown[];
      diagnostics: {
        outcome: string;
        formatRepairAttempted: boolean;
        formatRepairSucceeded: boolean | null;
        failurePhase: string | null;
      };
      permissions: unknown[];
      userPrompts: number;
    };

    expect(output.events).toEqual([
      {
        tag: "ARTIFACT_PROPOSAL_CREATED",
        targetPath: "docs/r1.md",
        baseSha256: null,
        role: "R1",
        authorityLayer: "P1",
        unifiedDiff: "--- /dev/null\n+++ b/docs/r1.md\n@@ -0,0 +1 @@\n+# R1\n",
        rationale: "Create R1",
      },
    ]);
    expect(output.diagnostics).toMatchObject({
      outcome: "SUCCEEDED",
      formatRepairAttempted: true,
      formatRepairSucceeded: true,
      failurePhase: null,
    });
    expect(output.permissions).toEqual([
      { action: "*", resource: "*", effect: "deny" },
      { action: "read", resource: "*", effect: "allow" },
      { action: "glob", resource: "*", effect: "allow" },
      { action: "grep", resource: "*", effect: "allow" },
    ]);
    expect(output.userPrompts).toBe(2);
  });

  it("redacts and bounds provider stderr while recording invalid-output diagnostics", () => {
    const workspace = tempDir("order-opencode-diagnostics-");
    const state = tempDir("order-opencode-diagnostics-state-");
    writeFileSync(join(workspace, "AGENTS.md"), "# authority\n");
    const longTail = "x".repeat(30_000);
    const binary = createFakeOpenCode(workspace, {
      outputs: ["not-json", "still-not-json"],
      stderr: [
        "provider emitted must-not-leak",
        longTail,
      ],
    });

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      const server = await o.startOpenCodeServer(
        ${JSON.stringify(state)},
        ${JSON.stringify(workspace)},
        { providerID: "opencode", id: "glm-5.3-flash-free" },
        process.env,
      );
      try {
        const sessionID = await o.createOpenCodeSession(
          server,
          "STAGE",
          null,
          ["AGENTS.md"],
          [],
        );
        const run = {
          id: "run_11111111-1111-4111-8111-111111111111",
          contextHash: "sha256:" + "a".repeat(64),
        };
        let diagnostics = null;
        let stderrText = null;
        let failure = null;
        try {
          await o.runOpenCodeTurn(
            server,
            sessionID,
            run,
            "event_22222222-2222-4222-8222-222222222222",
            "STAGE",
            null,
            [],
            "Return events.",
            (record, stderr) => {
              diagnostics = record;
              stderrText = stderr === null ? null : new TextDecoder().decode(stderr);
            },
          );
        } catch (error) {
          failure = error instanceof Error ? error.message : String(error);
        }
        console.log(JSON.stringify({ diagnostics, stderrText, failure }));
      } finally {
        await o.stopOpenCodeServer(server);
      }
    `, providerEnvironment(binary)) as {
      diagnostics: {
        outcome: string;
        formatRepairAttempted: boolean;
        formatRepairSucceeded: boolean | null;
        failurePhase: string | null;
        exceptionMessage: string | null;
      };
      stderrText: string | null;
      failure: string | null;
    };

    expect(output.diagnostics).toMatchObject({
      outcome: "INVALID_OUTPUT",
      formatRepairAttempted: true,
      formatRepairSucceeded: false,
      failurePhase: "FORMAT_REPAIR",
    });
    expect(output.stderrText).toContain("[REDACTED SECRET LINE]");
    expect(output.stderrText).not.toContain("must-not-leak");
    expect(new TextEncoder().encode(output.stderrText ?? "").byteLength).toBeLessThan(17_000);
    expect(output.failure).not.toContain("must-not-leak");
  });

  it("executes guided login without preselecting a provider", () => {
    const workspace = tempDir("order-opencode-guided-login-");
    const state = tempDir("order-opencode-guided-login-state-");
    const record = join(workspace, "guided-login-record.json");
    const binary = createFakeOpenCode(workspace, { loginRecordPath: record });

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      const result = await o.loginOpenCodeProviderInteractive(
        ${JSON.stringify(state)},
        ${JSON.stringify(workspace)},
        process.env,
      );
      console.log(JSON.stringify({ result, record: JSON.parse(await Bun.file(${JSON.stringify(record)}).text()) }));
    `, providerEnvironment(binary)) as {
      result: { exitCode: number };
      record: { argv: string[]; OPENCODE_DB: string };
    };

    expect(output.result.exitCode).toBe(0);
    expect(output.record.argv).toEqual(["--standalone", "auth", "login"]);
    expect(output.record.OPENCODE_DB).toBe(join(state, "opencode", "opencode.db"));
  });

  it("completes guided setup and reuses a valid persisted configuration", () => {
    const workspace = tempDir("order-setup-workspace-");
    const state = tempDir("order-setup-state-");
    writeFileSync(join(workspace, "AGENTS.md"), "# fixture authority\n");
    writeFileSync(join(workspace, "pontivus-order.toml"), `version = 1
projectId = "setup-fixture"

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

[concerns.core]
authority = ["AGENTS.md"]
paths = ["src/**"]
gates = ["architecture"]

[verification.architecture]
argv = ["bash", "-c", "true"]
cwd = "."
timeoutSeconds = 30
inheritEnv = ["PATH"]
materialRefs = ["AGENTS.md"]
`);
    spawnSync("git", ["init", "-q"], { cwd: workspace });
    spawnSync("git", ["config", "user.name", "Order Test"], { cwd: workspace });
    spawnSync("git", ["config", "user.email", "order@example.invalid"], { cwd: workspace });
    spawnSync("git", ["add", "."], { cwd: workspace });
    spawnSync("git", ["commit", "-qm", "fixture"], { cwd: workspace });
    const binary = createFakeOpenCode(workspace, {
      models: [{ providerID: "opencode", id: "glm-5.3-flash-free", enabled: true }],
    });

    const output = bunEval(`
      const cli = await import("./src/cli.ts");
      const cfg = await import("./src/shell/config.ts");
      const setup = await import("./src/shell/setup.ts");
      const env = {
        ...process.env,
        HOME: ${JSON.stringify(workspace)},
        PONTIVUS_ORDER_STATE_ROOT: ${JSON.stringify(state)},
        PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)},
      };
      const answers = ["1", ${JSON.stringify(workspace)}, "", ""];
      const stdout = [];
      const first = await cli.runCli(
        ["setup"],
        env,
        (value) => stdout.push(value),
        () => {},
        async () => answers.shift() ?? "",
      );
      const config = cfg.readOrderConfig(${JSON.stringify(state)});
      const second = await cli.runCli(
        ["setup"],
        env,
        (value) => stdout.push(value),
        () => {},
        async () => { throw new Error("valid setup must not prompt"); },
      );
      console.log(JSON.stringify({ first, second, config, stdout }));
    `, providerEnvironment(binary)) as {
      first: number;
      second: number;
      config: {
        version: 3;
        model: { providerID: string; id: string };
        repositoryRoots: string[];
        referenceRoots: string[];
      };
      stdout: string[];
    };

    expect(output.first).toBe(0);
    expect(output.second).toBe(0);
    expect(output.config.model).toEqual({ providerID: "opencode", id: "glm-5.3-flash-free" });
    expect(output.config.version).toBe(3);
    expect(output.config.repositoryRoots).toEqual([workspace]);
    expect(output.config.referenceRoots).toEqual([]);
    expect(output.stdout.join("")).toContain("Order configuration is already valid");
  });

  it("retains an exact v1 target and provisions its missing manifest without prompting", () => {
    const workspace = tempDir("order-setup-upgrade-exact-");
    const home = tempDir("order-setup-upgrade-home-");
    const state = tempDir("order-setup-upgrade-state-");
    writeFileSync(join(workspace, "AGENTS.md"), "# fixture authority\n");
    spawnSync("git", ["init", "-q"], { cwd: workspace });
    spawnSync("git", ["config", "user.name", "Order Test"], { cwd: workspace });
    spawnSync("git", ["config", "user.email", "order@example.invalid"], { cwd: workspace });
    spawnSync("git", ["add", "AGENTS.md"], { cwd: workspace });
    spawnSync("git", ["commit", "-qm", "fixture"], { cwd: workspace });

    const binary = createFakeOpenCode(workspace, {
      models: [{ providerID: "opencode", id: "glm-5.3-flash-free", enabled: true }],
    });
    const configPath = join(state, "config.json");
    writeFileSync(configPath, JSON.stringify({
      version: 1,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [workspace],
      referenceRoots: [],
    }) + "\n", { mode: 0o600 });
    chmodSync(configPath, 0o600);

    const output = bunEval(`
      const cfg = await import("./src/shell/config.ts");
      const project = await import("./src/shell/project.ts");
      const setup = await import("./src/shell/setup.ts");
      const env = {
        ...process.env,
        HOME: ${JSON.stringify(home)},
        PONTIVUS_ORDER_STATE_ROOT: ${JSON.stringify(state)},
        PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)},
      };
      const stdout = [];
      const created = [];
      const code = await setup.runInstallerGuidedSetup(
        env,
        (value) => stdout.push(value),
        async () => { throw new Error("unchanged exact legacy target must not prompt"); },
        (path) => created.push(path),
      );
      console.log(JSON.stringify({
        code,
        created,
        config: cfg.readOrderConfig(${JSON.stringify(state)}),
        manifest: await project.loadValidatedProjectManifest(${JSON.stringify(workspace)}),
        stdout,
      }));
    `, providerEnvironment(binary)) as {
      code: number;
      created: string[];
      config: {
        version: 3;
        model: { providerID: string; id: string };
        repositoryRoots: string[];
        referenceRoots: string[];
      };
      manifest: {
        projectId: string;
        authority: {
          p1: string[];
          p2: string[];
          p3: string[];
          p4: string[];
          p5: string[];
          p6: string[];
        };
      };
      stdout: string[];
    };

    expect(output.code).toBe(0);
    expect(output.created).toEqual([join(workspace, "pontivus-order.toml")]);
    expect(output.config.repositoryRoots).toEqual([workspace]);
    expect(output.config.referenceRoots).toEqual([]);
    expect(output.manifest.projectId).toBe(basename(workspace).toLowerCase());
    expect(output.manifest.authority.p1).toEqual(["AGENTS.md"]);
    expect(output.stdout.join("")).toContain("created missing project manifest");
    expect(output.stdout.join("")).toContain("configuration upgraded to version 3");
  });

  it("upgrades broad v1 target roots from persisted WorkItem repository evidence", () => {
    const legacyRoot = tempDir("order-setup-upgrade-parent-");
    const workspace = join(legacyRoot, "project");
    mkdirSync(workspace);
    const home = tempDir("order-setup-upgrade-home-");
    const state = tempDir("order-setup-upgrade-state-");
    writeFileSync(join(workspace, "AGENTS.md"), "# fixture authority\n");
    writeFileSync(join(workspace, "pontivus-order.toml"), `version = 1
projectId = "setup-upgrade-fixture"

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

[concerns.core]
authority = ["AGENTS.md"]
paths = ["src/**"]
gates = ["architecture"]

[verification.architecture]
argv = ["bash", "-c", "true"]
cwd = "."
timeoutSeconds = 30
inheritEnv = ["PATH"]
materialRefs = ["AGENTS.md"]
`);
    spawnSync("git", ["init", "-q"], { cwd: workspace });
    spawnSync("git", ["config", "user.name", "Order Test"], { cwd: workspace });
    spawnSync("git", ["config", "user.email", "order@example.invalid"], { cwd: workspace });
    spawnSync("git", ["add", "."], { cwd: workspace });
    spawnSync("git", ["commit", "-qm", "fixture"], { cwd: workspace });

    const binary = createFakeOpenCode(workspace, {
      models: [{ providerID: "opencode", id: "glm-5.3-flash-free", enabled: true }],
    });
    const configPath = join(state, "config.json");
    writeFileSync(configPath, JSON.stringify({
      version: 1,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [legacyRoot],
      referenceRoots: [],
    }) + "\n", { mode: 0o600 });
    chmodSync(configPath, 0o600);

    const output = bunEval(`
      const { Database } = await import("bun:sqlite");
      const cli = await import("./src/cli.ts");
      const cfg = await import("./src/shell/config.ts");
      const runtime = await import("./src/shell/runtime.ts");
      const setup = await import("./src/shell/setup.ts");
      const legacy = new Database(
        runtime.statePaths(${JSON.stringify(state)}).database,
        { create: true, strict: true },
      );
      legacy.exec("CREATE TABLE workItems(repositoryRoot TEXT NOT NULL) STRICT;");
      legacy.query("INSERT INTO workItems(repositoryRoot) VALUES (?1);")
        .run(${JSON.stringify(workspace)});
      legacy.exec("PRAGMA user_version = 1;");
      legacy.close();

      const env = {
        ...process.env,
        HOME: ${JSON.stringify(home)},
        PONTIVUS_ORDER_STATE_ROOT: ${JSON.stringify(state)},
        PONTIVUS_ORDER_OPENCODE_BIN: ${JSON.stringify(binary)},
      };
      const stdout = [];
      let cliLegacyError = null;
      try {
        await cli.runCli(
          ["setup"],
          env,
          (value) => stdout.push(value),
          () => {},
          async () => { throw new Error("ordinary setup must reject before prompting"); },
        );
      } catch (error) {
        cliLegacyError = error instanceof Error ? error.message : String(error);
      }
      const code = await setup.runInstallerGuidedSetup(
        env,
        (value) => stdout.push(value),
        async () => { throw new Error("valid legacy installer update must not prompt"); },
      );
      console.log(JSON.stringify({
        code,
        cliLegacyError,
        config: cfg.readOrderConfig(${JSON.stringify(state)}),
        stdout,
      }));
    `, providerEnvironment(binary)) as {
      code: number;
      cliLegacyError: string | null;
      config: {
        version: 3;
        model: { providerID: string; id: string };
        repositoryRoots: string[];
        referenceRoots: string[];
      };
      stdout: string[];
    };

    expect(output.code).toBe(0);
    expect(output.cliLegacyError).not.toBeNull();
    expect(output.config).toEqual({
      version: 3,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [workspace],
      referenceRoots: [],
    });
    expect(output.stdout.join("")).toContain("configuration upgraded to version 3");
  });

  it("executes provider login through exact standalone argv in the private namespace", () => {
    const workspace = tempDir("order-opencode-login-");
    const state = tempDir("order-opencode-login-state-");
    const record = join(workspace, "login-record.json");
    const binary = createFakeOpenCode(workspace, { loginRecordPath: record });

    const output = bunEval(`
      const o = await import("./src/shell/opencode.ts");
      const result = await o.loginOpenCodeProvider(
        ${JSON.stringify(state)},
        ${JSON.stringify(workspace)},
        "openai",
        process.env,
      );
      console.log(JSON.stringify(result));
    `, providerEnvironment(binary)) as { exitCode: number; cancelled: boolean };

    const recordValue = JSON.parse(readFileSync(record, "utf8")) as {
      argv: string[];
      HOME: string;
      XDG_CONFIG_HOME: string;
      XDG_DATA_HOME: string;
      XDG_STATE_HOME: string;
      XDG_CACHE_HOME: string;
      OPENCODE_DB: string;
      OPENAI_API_KEY: string | null;
    };

    expect(output).toEqual({ exitCode: 0, cancelled: false });
    expect(recordValue.argv).toEqual(["--standalone", "auth", "login", "openai"]);
    expect(recordValue.HOME).toBe(join(state, "opencode", "home"));
    expect(recordValue.XDG_CONFIG_HOME).toBe(join(state, "opencode", "config"));
    expect(recordValue.XDG_DATA_HOME).toBe(join(state, "opencode", "data"));
    expect(recordValue.XDG_STATE_HOME).toBe(join(state, "opencode", "state"));
    expect(recordValue.XDG_CACHE_HOME).toBe(join(state, "opencode", "cache"));
    expect(recordValue.OPENCODE_DB).toBe(join(state, "opencode", "opencode.db"));
    expect(recordValue.OPENAI_API_KEY).toBeNull();
  });
});
