import { spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

const run = (argv: readonly string[], cwd: string): void => {
  const result = spawnSync(argv[0]!, argv.slice(1), {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
    },
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
};

const createProject = (): string => {
  const root = tempDir("order-installer-project-");
  writeFileSync(join(root, "AGENTS.md"), "# project authority\n");
  writeFileSync(join(root, "pontivus-order.toml"), [
    "version = 1",
    'projectId = "installer-fixture"',
    "",
    "[authority]",
    'p1 = ["AGENTS.md"]',
    "p2 = []",
    "p3 = []",
    "p4 = []",
    "p5 = []",
    "p6 = []",
    "",
  ].join("\n"));
  run(["git", "init", "-q"], root);
  run(["git", "config", "user.name", "Order Test"], root);
  run(["git", "config", "user.email", "order@example.invalid"], root);
  run(["git", "add", "."], root);
  run(["git", "commit", "-qm", "fixture"], root);
  return root;
};

const fakeOpenCodeSource = `#!/usr/bin/env bun
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const configPath = join(dirname(process.argv[1]), ".fake-installer-opencode.json");
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, "utf8"))
  : {};
const record = (value) => {
  if (config.recordPath) appendFileSync(config.recordPath, JSON.stringify(value) + "\\n");
};

if (args.length === 1 && args[0] === "--version") {
  console.log("opencode v2.2.6");
  process.exit(0);
}

if (
  args.length === 3 &&
  args[0] === "--standalone" &&
  args[1] === "auth" &&
  args[2] === "login"
) {
  record({ kind: "login", args, cwd: process.cwd() });
  if (config.loginMarkerPath) writeFileSync(config.loginMarkerPath, "started\\n");
  if (config.loginMode === "hang") await Bun.sleep(60_000);
  process.exit(config.loginExitCode ?? 0);
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

record({ kind: "serve", args, cwd: process.cwd() });
const json = (value) =>
  new Response(JSON.stringify(value), {
    headers: { "content-type": "application/json" },
  });
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/info") {
      return json({ version: "2.2.6" });
    }
    if (request.method === "GET" && url.pathname === "/api/model") {
      return json({
        location: { directory: process.cwd() },
        data: [{
          providerID: "opencode",
          id: "glm-5.3-flash-free",
          enabled: true,
        }],
      });
    }
    return json({ message: "not found" }, 404);
  },
});
console.log("server listening on http://127.0.0.1:" + server.port);
await new Promise(() => {});
`;

const createFakeOpenCode = (
  root: string,
  config: Readonly<Record<string, unknown>>,
): string => {
  const binary = join(root, "fake-installer-opencode.ts");
  writeFileSync(binary, fakeOpenCodeSource, { mode: 0o755 });
  chmodSync(binary, 0o755);
  writeFileSync(
    join(root, ".fake-installer-opencode.json"),
    JSON.stringify(config),
  );
  return binary;
};

const setupEnvironment = (
  home: string,
  stateRoot: string,
  binary: string,
): Record<string, string | undefined> => ({
  ...process.env,
  HOME: home,
  PONTIVUS_ORDER_STATE_ROOT: stateRoot,
  PONTIVUS_ORDER_OPENCODE_BIN: binary,
});

const runSetup = (
  home: string,
  stateRoot: string,
  binary: string,
  answers: Readonly<Record<string, string>>,
  established = false,
): Readonly<{
  code: number;
  config: unknown;
  stdout: string;
  prompts: readonly string[];
}> => {
  const code = `
    const setup = await import("./src/shell/setup.ts");
    const cfg = await import("./src/shell/config.ts");
    const stdout = [];
    const prompts = [];
    const answers = ${JSON.stringify(answers)};
    const result = await setup.runInstallerGuidedSetup(
      ${JSON.stringify(setupEnvironment(home, stateRoot, binary))},
      (value) => stdout.push(value),
      async (prompt) => {
        prompts.push(prompt);
        const answer = answers[prompt];
        if (answer === undefined) throw new Error("unexpected prompt: " + prompt);
        return answer;
      },
      ${JSON.stringify(established)},
      { snapshot: cfg.captureInstallerConfigSnapshot(${JSON.stringify(stateRoot)}), onPublished: () => {} },
    );
    console.log(JSON.stringify({
      code: result,
      config: cfg.readOrderConfigIfPresent(${JSON.stringify(stateRoot)}),
      stdout: stdout.join(""),
      prompts,
    }));
  `;
  const result = spawnSync("bun", ["--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: setupEnvironment(home, stateRoot, binary),
    timeout: 30_000,
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout.trim());
};

describe("guided productive installer setup", () => {
  it("preserves the current database when its required original archive is missing", () => {
    const root = tempDir("order-installer-archive-");
    const script = `
      const fs = await import("node:fs");
      const { Database } = await import("bun:sqlite");
      const r = await import("./src/shell/runtime.ts");
      const s = await import("./src/shell/sqlite.ts");
      const stateRoot = ${JSON.stringify(root)};
      const path = r.statePaths(stateRoot).database;
      const legacy = new Database(path, { create: true, strict: true });
      legacy.exec("PRAGMA user_version = 1;");
      legacy.close();
      const archive = s.prepareOrderDatabaseForInstall(stateRoot);
      const candidate = s.openOrderDatabase(stateRoot);
      candidate.close();
      const observed = fs.readFileSync(path);
      fs.renameSync(archive.archiveDatabase, archive.archiveDatabase + ".retained");
      let blocked = false;
      try { s.restoreOrderDatabaseAfterFailedInstall(archive); } catch { blocked = true; }
      console.log(JSON.stringify({ blocked, candidatePreserved: fs.readFileSync(path).equals(observed),
        originalPreserved: fs.existsSync(archive.archiveDatabase + ".retained") }));
    `;
    const result = spawnSync("bun", ["--eval", script], { cwd: process.cwd(), encoding: "utf8", timeout: 30_000 });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout);
    expect(JSON.parse(result.stdout.trim())).toEqual({
      blocked: true, candidatePreserved: true, originalPreserved: true,
    });
  });

  it("retains exact private config custody and refuses to overwrite unexpected publication drift", () => {
    const state = tempDir("order-installer-config-custody-");
    const script = `
      const fs = await import("node:fs");
      const cfg = await import("./src/shell/config.ts");
      const stateRoot = ${JSON.stringify(state)};
      const target = stateRoot + "/config.json";
      const config = { version: 4, model: null, repositoryRoots: [], referenceRoots: [] };
      const absent = cfg.captureInstallerConfigSnapshot(stateRoot);
      let published = null;
      cfg.writeOrderConfig(stateRoot, config, { snapshot: absent, onPublished: (value) => published = value });
      cfg.restoreInstallerConfig(absent, published);
      const absentRestored = !fs.existsSync(target);
      const raw = "  " + JSON.stringify(config) + "\\n";
      fs.writeFileSync(target, raw, { mode: 0o600 });
      const original = cfg.captureInstallerConfigSnapshot(stateRoot);
      published = null;
      cfg.writeOrderConfig(stateRoot, config, { snapshot: original, onPublished: (value) => published = value });
      cfg.restoreInstallerConfig(original, published);
      const exact = fs.readFileSync(target, "utf8") === raw;
      const released = !fs.existsSync(original.recoveryPath);
      const drift = cfg.captureInstallerConfigSnapshot(stateRoot);
      published = null;
      cfg.writeOrderConfig(stateRoot, config, { snapshot: drift, onPublished: (value) => published = value });
      fs.appendFileSync(target, " ");
      let blocked = false;
      try { cfg.restoreInstallerConfig(drift, published); } catch { blocked = true; }
      const retained = fs.readFileSync(drift.recoveryPath, "utf8") === raw;
      fs.unlinkSync(target);
      fs.symlinkSync(stateRoot + "/missing", target);
      let symlinkBlocked = false;
      try { cfg.captureInstallerConfigSnapshot(stateRoot); } catch { symlinkBlocked = true; }
      console.log(JSON.stringify({ absentRestored, exact, released, blocked, retained, symlinkBlocked }));
    `;
    const result = spawnSync("bun", ["--eval", script], { cwd: process.cwd(), encoding: "utf8", timeout: 30_000 });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout);
    expect(JSON.parse(result.stdout.trim())).toEqual({
      absentRestored: true, exact: true, released: true, blocked: true, retained: true, symlinkBlocked: true,
    });
  });

  it("established admission retains unavailable v3 choices and handles proven absent config without provider work", () => {
    const home = tempDir("order-established-home-");
    const stateRoot = tempDir("order-established-state-");
    const absentState = tempDir("order-established-absent-");
    const fakeRoot = tempDir("order-established-provider-");
    const recordPath = join(fakeRoot, "calls.jsonl");
    const binary = createFakeOpenCode(fakeRoot, { recordPath });
    const old = {
      version: 3,
      model: { providerID: "retained-provider", id: "retained-model" },
      repositoryRoots: [join(home, "unavailable-repository")],
      referenceRoots: [join(home, "unavailable-reference")],
    };
    writeFileSync(join(stateRoot, "config.json"), JSON.stringify(old) + "\n", { mode: 0o600 });
    const retained = runSetup(home, stateRoot, binary, {}, true);
    expect(retained.code).toBe(0);
    expect(retained.prompts).toEqual([]);
    expect(retained.config).toEqual({ ...old, version: 4 });
    const absent = runSetup(home, absentState, binary, {}, true);
    expect(absent.code).toBe(0);
    expect(absent.prompts).toEqual([]);
    expect(absent.config).toEqual({ version: 4, model: null, repositoryRoots: [], referenceRoots: [] });
    expect(existsSync(recordPath)).toBe(false);
  });

  it("fresh retained configuration repairs unavailable roots before any provider process", () => {
    const home = tempDir("order-repair-home-");
    const stateRoot = tempDir("order-repair-state-");
    const project = createProject();
    const missingTarget = join(home, "missing-target");
    const missingReference = join(home, "missing-reference");
    const fakeRoot = tempDir("order-repair-provider-");
    const recordPath = join(fakeRoot, "calls.jsonl");
    const binary = createFakeOpenCode(fakeRoot, { recordPath });
    const model = { providerID: "opencode", id: "glm-5.3-flash-free" };
    writeFileSync(join(stateRoot, "config.json"), JSON.stringify({
      version: 4, model, repositoryRoots: [missingTarget], referenceRoots: [missingReference],
    }) + "\n", { mode: 0o600 });
    const output = runSetup(home, stateRoot, binary, {
      ["Replacement for " + missingTarget + " (blank removes): "]: project,
      ["Replacement for " + missingReference + " (blank removes): "]: "",
      "Retain saved OpenCode credentials or login again? [retain/login]: ": "login",
      "Select model [1]: ": "",
    });
    expect(output.code).toBe(0);
    expect(output.config).toEqual({ version: 4, model, repositoryRoots: [project], referenceRoots: [] });
    expect(output.prompts.slice(0, 2)).toEqual([
      "Replacement for " + missingTarget + " (blank removes): ",
      "Replacement for " + missingReference + " (blank removes): ",
    ]);
    const calls = readFileSync(recordPath, "utf8").trim().split("\n").map(line => JSON.parse(line));
    expect(calls.some(call => call.kind === "login")).toBe(true);
    expect(calls.every(call => call.cwd === project)).toBe(true);
  });

  it("fresh success completes provider, model and repository choices before returning zero", () => {
    const home = tempDir("order-installer-home-");
    const stateRoot = tempDir("order-installer-state-");
    const project = createProject();
    const fakeRoot = tempDir("order-installer-opencode-");
    const recordPath = join(fakeRoot, "calls.jsonl");
    const binary = createFakeOpenCode(fakeRoot, { recordPath });

    const output = runSetup(home, stateRoot, binary, {
      "Select model: ": "1",
      "Target repository root: ": project,
      "Add another target repository root (blank to continue): ": "",
      "STAGE reference root (blank for none): ": "",
    });

    expect(output.code).toBe(0);
    expect(output.config).toEqual({
      version: 4,
      model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [project],
      referenceRoots: [],
    });
    expect(output.prompts).toEqual([
      "Target repository root: ",
      "Add another target repository root (blank to continue): ",
      "STAGE reference root (blank for none): ",
      "Select model: ",
    ]);
    expect(output.stdout).toContain("Order configuration complete.");
    expect(output.stdout).not.toContain("requires operator action");
    expect(output.stdout).not.toContain("browser Settings");

    const calls = readFileSync(recordPath, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { kind: string });
    expect(calls.some((call) => call.kind === "login")).toBe(true);
    expect(calls.some((call) => call.kind === "serve")).toBe(true);
  });

  it("fresh provider failure cannot persist deferred Settings configuration", () => {
    const home = tempDir("order-installer-failure-home-");
    const stateRoot = tempDir("order-installer-failure-state-");
    const fakeRoot = tempDir("order-installer-failure-opencode-");
    const binary = createFakeOpenCode(fakeRoot, { loginExitCode: 2 });

    const output = runSetup(home, stateRoot, binary, {
      "Target repository root: ": createProject(),
      "Add another target repository root (blank to continue): ": "",
      "STAGE reference root (blank for none): ": "",
    });
    expect(output.code).toBe(2);
    expect(output.config).toBeNull();
    expect(output.prompts).toEqual([
      "Target repository root: ",
      "Add another target repository root (blank to continue): ",
      "STAGE reference root (blank for none): ",
    ]);
    expect(output.stdout).not.toContain("requires operator action");
  });

  it("fresh provider cancellation returns 130 without persisting deferred configuration", async () => {
    const home = tempDir("order-installer-cancel-home-");
    const stateRoot = tempDir("order-installer-cancel-state-");
    const fakeRoot = tempDir("order-installer-cancel-opencode-");
    const marker = join(fakeRoot, "login-started");
    const binary = createFakeOpenCode(fakeRoot, {
      loginMode: "hang",
      loginMarkerPath: marker,
    });
    const project = createProject();
    const code = `
      const setup = await import("./src/shell/setup.ts");
      const cfg = await import("./src/shell/config.ts");
      const result = await setup.runInstallerGuidedSetup(
        ${JSON.stringify(setupEnvironment(home, stateRoot, binary))},
        () => {},
        async (prompt) => {
          if (prompt === "Target repository root: ") return ${JSON.stringify(project)};
          if (prompt === "Add another target repository root (blank to continue): " || prompt === "STAGE reference root (blank for none): ") return "";
          throw new Error("unexpected prompt: " + prompt);
        },
        false,
        { snapshot: cfg.captureInstallerConfigSnapshot(${JSON.stringify(stateRoot)}), onPublished: () => {} },
      );
      console.log(JSON.stringify({
        code: result,
        config: cfg.readOrderConfigIfPresent(${JSON.stringify(stateRoot)}),
      }));
    `;

    const child = spawn("bun", ["--eval", code], {
      cwd: process.cwd(),
      env: setupEnvironment(home, stateRoot, binary),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (value) => { stdout += value; });
    child.stderr.on("data", (value) => { stderr += value; });

    const deadline = Date.now() + 10_000;
    while (!existsSync(marker) && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    expect(existsSync(marker)).toBe(true);
    child.kill("SIGINT");

    const exitCode = await new Promise<number | null>((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error("cancelled setup did not settle"));
      }, 10_000);
      child.once("exit", (value) => {
        clearTimeout(timeout);
        resolve(value);
      });
    });
    if (exitCode !== 0) throw new Error(stderr || stdout);

    const output = JSON.parse(stdout.trim()) as {
      code: number;
      config: unknown;
    };
    expect(output.code).toBe(130);
    expect(output.config).toBeNull();
  });
});


type InstallerTransactionFixture = Readonly<{
  home: string;
  stateRoot: string;
  project: string;
  binary: string;
  readiness: unknown;
  establishedHistory?: string;
  historyAnswers?: readonly string[];
  cancelHistory?: boolean;
  failMarker?: boolean;
  failRename?: "app-backup" | "launcher-backup" | "app-activation" | "launcher-activation" | "unit-publication" | "marker-publication";
  interruptAtReadiness?: boolean;
  failRestart?: boolean;
  failService?: "daemon-reload" | "enable";
  stopMode?: "stuck" | "unknown" | "failed-inactive";
  readinessStatus?: number;
  readinessError?: "timeout" | "redirect";
  failFinalization?: boolean;
}>;

// Execute the production transaction and the installed setup/config/SQLite modules.
// Only runtime download/build processes, host supervision and HTTP responses are
// controlled; deployment, configuration and compensation filesystem effects are real.
const runInstallerTransaction = (fixture: InstallerTransactionFixture) => {
  const script = `
    const fs = await import("node:fs");
    const path = await import("node:path");
    const crypto = await import("node:crypto");
    const installer = await import("./src/installer.ts");
    const fixture = ${JSON.stringify(fixture)};
    const sourceRoot = fs.realpathSync(process.cwd());
    const installRoot = path.join(fixture.home, ".local/share/pontivus-order");
    const launcher = path.join(fixture.home, ".local/bin/order");
    const unitPath = path.join(fixture.home, ".config/systemd/user/pontivus-order.service");
    const marker = path.join(installRoot, "SOURCE_COMMIT");
    const configPath = path.join(fixture.stateRoot, "config.json");
    const archive = new Uint8Array([1, 2, 3, 4]);
    const digest = crypto.createHash("sha256").update(archive).digest("hex");
    const originalSpawn = Bun.spawnSync.bind(Bun);
    const originalFetch = globalThis.fetch;
    const sourceCommit = new TextDecoder().decode(originalSpawn(["git", "rev-parse", "HEAD"], { cwd: sourceRoot }).stdout).trim();
    const events = [];
    const prompts = [];
    let activity = fs.existsSync(unitPath) ? "active" : "inactive";
    let enablement = fs.existsSync(unitPath) ? "enabled" : "";
    let restartFailed = false;
    let serviceFailed = false;
    const token = "a".repeat(64);
    const result = (stdout = "", exitCode = 0) => ({
      stdout: Buffer.from(stdout), stderr: Buffer.from(exitCode === 0 ? "" : "injected host failure"),
      exitCode, success: exitCode === 0,
    });
    Bun.spawnSync = (argv, options = {}) => {
      if (argv[0] === "systemctl") {
        events.push({ command: argv.slice(2), marker: fs.existsSync(marker) });
        const verb = argv[2];
        if (verb === fixture.failService && !serviceFailed) { serviceFailed = true; return result("", 1); }
        if (verb === "show-environment" || verb === "daemon-reload") return result();
        if (verb === "show") {
          if (argv[3] === "--property=ActiveState") return result(activity + "\\n");
          if (argv[3] === "--property=UnitFileState") return result(enablement + "\\n");
          throw new Error("unexpected systemctl property " + argv[3]);
        }
        if (verb === "stop") {
          if (fixture.stopMode === "stuck") return result("", 1);
          if (fixture.stopMode === "unknown") { activity = "unknown"; return result("", 1); }
          activity = "inactive";
          return fixture.stopMode === "failed-inactive" ? result("", 1) : result();
        }
        if (verb === "enable") { enablement = "enabled"; return result(); }
        if (verb === "disable") { enablement = "disabled"; return result(); }
        if (verb === "restart") {
          activity = "active";
          fs.writeFileSync(path.join(fixture.stateRoot, "daemon-token"), token, { mode: 0o600 });
          if (fixture.failRestart && !restartFailed) { restartFailed = true; return result("", 1); }
          return result();
        }
        throw new Error("unexpected systemctl command " + JSON.stringify(argv));
      }
      if (argv[0] === "tar" && argv[1] === "-xJf") {
        const node = path.join(argv[argv.indexOf("-C") + 1], "bin/node");
        fs.mkdirSync(path.dirname(node), { recursive: true });
        fs.writeFileSync(node, "#!/bin/sh\\nexit 0\\n", { mode: 0o755 });
        return result();
      }
      if (argv[0].endsWith("/runtime/node/bin/node") && argv[1] === "--version") return result("v26.13.0\\n");
      if (argv[0].endsWith("/runtime/bun/bin/bun") && argv[1] === "install") {
        const installed = path.join(options.env.BUN_INSTALL_BIN, "opencode");
        fs.copyFileSync(fixture.binary, installed);
        fs.chmodSync(installed, 0o755);
        return result();
      }
      if (argv[0].endsWith("/runtime/opencode/opencode") && argv[1] === "--version") return result("opencode v2.2.6\\n");
      if (argv[0].endsWith("/runtime/bun/bin/bun") && argv[1] === "ci") {
        fs.symlinkSync(path.join(sourceRoot, "node_modules"), path.join(options.cwd, "node_modules"), "dir");
        return result();
      }
      if (argv[0].endsWith("/runtime/node/bin/node") && argv[2] === "build") {
        fs.mkdirSync(path.join(options.cwd, "dist"), { recursive: true });
        fs.writeFileSync(path.join(options.cwd, "dist/index.html"), "<!doctype html>");
        return result();
      }
      if (argv[0] === launcher && argv[1] === "status") {
        events.push({ command: ["status"], marker: fs.existsSync(marker) });
        return result("", activity === "active" ? 0 : 1);
      }
      return originalSpawn(argv, options);
    };
    globalThis.fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.hostname === "nodejs.org") {
        if (url.pathname.endsWith("/SHASUMS256.txt")) {
          const arch = process.arch === "x64" ? "x64" : "arm64";
          return new Response(digest + "  node-v26.13.0-linux-" + arch + ".tar.xz\\n");
        }
        return new Response(archive);
      }
      if (url.pathname === "/api/settings/readiness") {
        events.push({ command: ["readiness"], marker: fs.existsSync(marker),
          auth: new Headers(init?.headers).get("Authorization") === "Bearer " + token });
        if (fixture.interruptAtReadiness) process.exit(77);
        if (fixture.failMarker) fs.mkdirSync(marker);
        if (fixture.readinessError) throw new TypeError("injected " + fixture.readinessError);
        return new Response(JSON.stringify(fixture.readiness), { status: fixture.readinessStatus ?? 200, headers: { "content-type": "application/json" } });
      }
      return originalFetch(input, init);
    };
    if (fixture.failFinalization) fs.mkdirSync(path.join(fixture.home, ".profile"), { recursive: true });
    const historyAnswers = [...(fixture.historyAnswers ?? [])];
    const question = async (prompt) => {
      prompts.push(prompt);
      if (prompt.startsWith("Did installation admission previously complete")) {
        if (fixture.cancelHistory) throw new Error("installation history cancelled");
        return historyAnswers.shift() ?? fixture.establishedHistory ?? "";
      }
      if (prompt === "Retain saved OpenCode credentials or login again? [retain/login]: ") return "retain";
      if (prompt === "Select model [1]: ") return "";
      if (prompt === "Target repository root: ") return fixture.project;
      if (prompt === "Add another target repository root (blank to continue): " || prompt === "STAGE reference root (blank for none): ") return "";
      if (prompt === "Select model: ") return "1";
      throw new Error("unexpected transaction prompt: " + prompt);
    };
    let failure = null;
    try {
      let injected = false;
      const rename = (from, to) => {
        const kind = from === installRoot && String(to).startsWith(installRoot + ".previous.") ? "app-backup" :
          from === launcher && String(to).startsWith(launcher + ".previous.") ? "launcher-backup" :
          String(from).includes("/.pontivus-order-install.") && to === installRoot ? "app-activation" :
          String(from).includes("/.pontivus-order.") && to === launcher ? "launcher-activation" :
          String(from).startsWith(unitPath + ".tmp.") && to === unitPath ? "unit-publication" :
          String(from).startsWith(marker + ".tmp.") && to === marker ? "marker-publication" : null;
        if (!injected && kind !== null && kind === fixture.failRename) {
          injected = true;
          throw new Error("injected rename failure: " + kind);
        }
        fs.renameSync(from, to);
      };
      await installer.runInstaller({ sourceRoot, sourceCommit }, process.env, question, rename);
    } catch (error) { failure = String(error); }
    console.log("ORDER_TRANSACTION_RESULT " + JSON.stringify({
      failure, prompts, events, activity, enablement, sourceCommit,
      marker: fs.existsSync(marker) ? fs.readFileSync(marker, "utf8") : null,
      config: fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : null,
      app: fs.existsSync(installRoot), launcher: fs.existsSync(launcher), unit: fs.existsSync(unitPath),
    }));
  `;
  const result = spawnSync("bun", ["--eval", script], {
    cwd: process.cwd(), encoding: "utf8", timeout: 120_000,
    env: {
      ...process.env,
      HOME: fixture.home, XDG_CONFIG_HOME: join(fixture.home, ".config"),
      XDG_STATE_HOME: join(fixture.home, ".local/state"),
      PONTIVUS_ORDER_INSTALL_ROOT: join(fixture.home, ".local/share/pontivus-order"),
      PONTIVUS_ORDER_BIN_DIR: join(fixture.home, ".local/bin"),
      PONTIVUS_ORDER_STATE_ROOT: fixture.stateRoot,
      PONTIVUS_ORDER_BIND: "127.0.0.1:7347",
    },
  });
  if (fixture.interruptAtReadiness && result.status === 77) return { interrupted: true, stdout: result.stdout };
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || String(result.error));
  const line = result.stdout.split("\n").find(value => value.startsWith("ORDER_TRANSACTION_RESULT "));
  if (line === undefined) throw new Error("actual installer transaction did not settle: " + result.stdout);
  return { ...JSON.parse(line.slice("ORDER_TRANSACTION_RESULT ".length)), stdout: result.stdout };
};

const transactionFixture = (): Omit<InstallerTransactionFixture, "readiness"> => ({
  home: tempDir("order-transaction-home-"),
  stateRoot: tempDir("order-transaction-state-"),
  project: createProject(),
  binary: createFakeOpenCode(tempDir("order-transaction-provider-"), {}),
});

const createPriorDeployment = (fixture: ReturnType<typeof transactionFixture>): void => {
  const root = join(fixture.home, ".local/share/pontivus-order");
  const launcher = join(fixture.home, ".local/bin/order");
  const unit = join(fixture.home, ".config/systemd/user/pontivus-order.service");
  for (const directory of [join(root, "app/src"), join(root, "app/dist"), join(root, "runtime/bun/bin"),
    join(fixture.home, ".local/bin"), join(fixture.home, ".config/systemd/user")]) {
    mkdirSync(directory, { recursive: true });
  }
  writeFileSync(join(root, "SOURCE_COMMIT"), "b".repeat(40) + "\n");
  writeFileSync(join(root, "app/src/cli.ts"), "old application");
  writeFileSync(join(root, "app/dist/index.html"), "old browser");
  writeFileSync(join(root, "runtime/bun/bin/bun"), "old runtime", { mode: 0o755 });
  writeFileSync(launcher, "old launcher", { mode: 0o755 });
  writeFileSync(unit, "old unit", { mode: 0o644 });
  writeFileSync(join(fixture.stateRoot, "config.json"),
    ' { "version": 4, "model": null, "repositoryRoots": [], "referenceRoots": [] }\n', { mode: 0o600 });
};

describe("actual IA25 installer transaction", () => {
  it.each(["app-backup", "launcher-backup", "app-activation", "launcher-activation",
    "unit-publication", "marker-publication"] as const)(
    "restores exact established bytes after failure at %s", (failRename) => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const root = join(fixture.home, ".local/share/pontivus-order");
      const launcher = join(fixture.home, ".local/bin/order");
      const unit = join(fixture.home, ".config/systemd/user/pontivus-order.service");
      const originalConfig = readFileSync(join(fixture.stateRoot, "config.json"));
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, failRename });
      expect(outcome.failure).toContain("injected rename failure: " + failRename);
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(readFileSync(join(root, "app/src/cli.ts"), "utf8")).toBe("old application");
      expect(readFileSync(launcher, "utf8")).toBe("old launcher");
      expect(readFileSync(unit, "utf8")).toBe("old unit");
      expect(readFileSync(join(fixture.stateRoot, "config.json"))).toEqual(originalConfig);
      expect(outcome.activity).toBe("active");
      expect(outcome.enablement).toBe("enabled");
      expect(outcome.stdout).not.toContain("Order updated successfully.");
    }, 120_000);

  it("unproven interrupted update retains prior deployment backup and stops without mutation", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const root = join(fixture.home, ".local/share/pontivus-order");
    const backup = root + ".previous.interrupted";
    mkdirSync(backup);
    writeFileSync(join(backup, "sentinel"), "recoverable prior deployment");
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "no",
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain(backup);
    expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "stop")).toBe(false);
    expect(readFileSync(join(backup, "sentinel"), "utf8")).toBe("recoverable prior deployment");
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
  }, 120_000);
  it("commits only after fresh canonical readiness; established incomplete update retains choices", () => {
    const fixture = transactionFixture();
    const fresh = runInstallerTransaction({ ...fixture, readiness: { ready: true, blockers: [] } });
    expect(fresh.failure).toBeNull();
    expect(fresh.marker).toBe(fresh.sourceCommit + "\n");
    expect(fresh.app && fresh.launcher && fresh.unit).toBe(true);
    expect(fresh.events.find((event: { command: string[] }) => event.command[0] === "readiness")).toEqual({
      command: ["readiness"], marker: false, auth: true,
    });
    expect(fresh.stdout).toContain("Order installed successfully.");
    const incomplete = { version: 4, model: null, repositoryRoots: [], referenceRoots: [] };
    writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify(incomplete) + "\n", { mode: 0o600 });
    const updated = runInstallerTransaction({
      ...fixture, establishedHistory: "yes", readiness: { ready: false, blockers: ["OPENCODE_ACCOUNT_REQUIRED"] },
    });
    expect(updated.failure).toBeNull();
    expect(updated.prompts).toHaveLength(1);
    expect(updated.prompts[0]).toContain("Did installation admission previously complete");
    expect(updated.config).toEqual(incomplete);
    expect(updated.marker).toBe(updated.sourceCommit + "\n");
    expect(updated.events.find((event: { command: string[] }) => event.command[0] === "readiness")).toEqual({
      command: ["readiness"], marker: true, auth: true,
    });
    expect(updated.stdout).toContain("Order updated successfully.");
    expect(updated.stdout).toContain("OPENCODE_ACCOUNT_REQUIRED");
  }, 180_000);

  it("fresh blocker rolls back actual activated paths without publishing a marker", () => {
    const outcome = runInstallerTransaction({
      ...transactionFixture(), readiness: { ready: false, blockers: ["OPENCODE_ACCOUNT_REQUIRED"] },
    });
    expect(outcome.failure).toContain("OPENCODE_ACCOUNT_REQUIRED");
    expect(outcome.marker).toBeNull();
    expect(outcome.config).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.stdout).not.toContain("Order installed successfully.");
  }, 120_000);

  it("partial service restart failure stops before real application and configuration compensation", () => {
    const outcome = runInstallerTransaction({
      ...transactionFixture(), readiness: { ready: true, blockers: [] }, failRestart: true,
    });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.marker).toBeNull();
    expect(outcome.config).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.activity).toBe("inactive");
    const commands = outcome.events.map((event: { command: string[] }) => event.command[0]);
    expect(commands.indexOf("stop")).toBeGreaterThan(commands.indexOf("restart"));
  }, 120_000);

  it.each(["daemon-reload", "enable"] as const)("compensates actual service %s failure", (failService) => {
    const outcome = runInstallerTransaction({ ...transactionFixture(),
      readiness: { ready: true, blockers: [] }, failService });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.marker).toBeNull();
    expect(outcome.config).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "restart")).toBe(false);
  }, 120_000);

  it.each(["stuck", "unknown"] as const)("retains deployed material when failed restart cannot prove quiescence: %s", (stopMode) => {
    const outcome = runInstallerTransaction({ ...transactionFixture(),
      readiness: { ready: true, blockers: [] }, failRestart: true, stopMode });
    expect(outcome.failure).toContain("cannot safely restore active deployment");
    expect(outcome.marker).toBeNull();
    expect(outcome.config).not.toBeNull();
    expect(outcome.app && outcome.launcher && outcome.unit).toBe(true);
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "restart")).toHaveLength(1);
  }, 120_000);

  it("allows compensation only after independently observed inactivity despite stop failure", () => {
    const outcome = runInstallerTransaction({ ...transactionFixture(),
      readiness: { ready: true, blockers: [] }, failRestart: true, stopMode: "failed-inactive" });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.marker).toBeNull();
    expect(outcome.config).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it.each([
    "REPOSITORY_REQUIRED", "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION", "MODEL_INVALID",
    "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION", "OPENCODE_ACCOUNT_REQUIRED",
  ])("blocks fresh commit on canonical readiness blocker %s", (blocker) => {
    const outcome = runInstallerTransaction({ ...transactionFixture(),
      readiness: { ready: false, blockers: [blocker] } });
    expect(outcome.failure).toContain(blocker);
    expect(outcome.marker).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
  }, 120_000);

  it.each([
    { readiness: { ready: true, blockers: ["MODEL_INVALID"] } },
    { readiness: { ready: false, blockers: [] } },
    { readiness: { invalid: true } },
    { readiness: { ready: true, blockers: [] }, readinessStatus: 401 },
    { readiness: { ready: true, blockers: [] }, readinessStatus: 503 },
    { readiness: null, readinessError: "timeout" as const },
    { readiness: null, readinessError: "redirect" as const },
  ])("rejects unproven fresh readiness: %j", (response) => {
    const outcome = runInstallerTransaction({ ...transactionFixture(), ...response });
    expect(outcome.failure).toContain("canonical installed readiness could not be confirmed");
    expect(outcome.marker).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.failure).not.toContain("a".repeat(64));
  }, 120_000);

  it("failed marker publication compensates without ordinary success", () => {
    const outcome = runInstallerTransaction({ ...transactionFixture(),
      readiness: { ready: true, blockers: [] }, failMarker: true });
    expect(outcome.failure).not.toBeNull();
    expect(outcome.marker).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.stdout).not.toContain("Order installed successfully.");
  }, 120_000);

  it("complete-looking deployment still needs affirmative history; cancellation is non-mutating", () => {
    const fixture = transactionFixture();
    const fresh = runInstallerTransaction({ ...fixture, readiness: { ready: true, blockers: [] } });
    expect(fresh.failure).toBeNull();
    const installRoot = join(fixture.home, ".local/share/pontivus-order");
    const originalMarker = readFileSync(join(installRoot, "SOURCE_COMMIT"));
    const originalConfig = readFileSync(join(fixture.stateRoot, "config.json"));
    const cancelled = runInstallerTransaction({ ...fixture,
      readiness: { ready: true, blockers: [] }, cancelHistory: true });
    expect(cancelled.failure).toContain("installation history cancelled");
    expect(cancelled.events.some((event: { command: string[] }) => event.command[0] === "stop")).toBe(false);
    expect(readFileSync(join(installRoot, "SOURCE_COMMIT"))).toEqual(originalMarker);
    expect(readFileSync(join(fixture.stateRoot, "config.json"))).toEqual(originalConfig);
    const declined = runInstallerTransaction({ ...fixture,
      readiness: { ready: false, blockers: ["MODEL_INVALID"] }, historyAnswers: ["invalid", "unknown"] });
    expect(declined.failure).toContain("MODEL_INVALID");
    expect(declined.prompts.filter((prompt: string) => prompt.startsWith("Did installation"))).toHaveLength(2);
    expect(declined.marker).toBe(originalMarker.toString("utf8"));
    expect(readFileSync(join(fixture.stateRoot, "config.json"))).toEqual(originalConfig);
    expect(declined.stdout).not.toContain("Order updated successfully.");
  }, 240_000);

  it("interrupted first installation has no admission marker and must pass fresh readiness on retry", () => {
    const fixture = transactionFixture();
    const stopped = runInstallerTransaction({ ...fixture,
      readiness: { ready: true, blockers: [] }, interruptAtReadiness: true });
    expect(stopped.interrupted).toBe(true);
    const installRoot = join(fixture.home, ".local/share/pontivus-order");
    expect(existsSync(join(installRoot, "SOURCE_COMMIT"))).toBe(false);
    const retried = runInstallerTransaction({ ...fixture,
      readiness: { ready: false, blockers: ["MODEL_INVALID"] }, establishedHistory: "yes" });
    expect(retried.failure).toContain("MODEL_INVALID");
    expect(retried.prompts.some((prompt: string) => prompt.startsWith("Did installation"))).toBe(false);
    expect(retried.stdout).not.toContain("Order updated successfully.");
  }, 180_000);

  it("post-commit finalization failure retains admitted application and marker", () => {
    const outcome = runInstallerTransaction({
      ...transactionFixture(), readiness: { ready: true, blockers: [] }, failFinalization: true,
    });
    expect(outcome.failure).toContain("installation committed; finalization incomplete");
    expect(outcome.marker).toBe(outcome.sourceCommit + "\n");
    expect(outcome.config).not.toBeNull();
    expect(outcome.app && outcome.launcher && outcome.unit).toBe(true);
    expect(outcome.activity).toBe("active");
    expect(outcome.stdout).not.toContain("Order installed successfully.");
  }, 120_000);
});
