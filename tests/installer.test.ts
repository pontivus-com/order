import { spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  symlinkSync,
  mkdtempSync,
  mkdirSync,
  renameSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
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
      () => {},
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
        () => {},
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
  failRename?: "app-backup" | "launcher-backup" | "app-activation" | "launcher-activation" | "unit-publication" | "unit-restoration" | "marker-publication" | "predecessor-app" | "predecessor-state" | "predecessor-db" | "predecessor-wal" | "predecessor-shm";
  interruptAtReadiness?: boolean;
  interruptAt?: "app-activation" | "service-start" | "health";
  failMarkerWrite?: boolean;
  manifestDrift?: "bytes" | "identity" | "symlink";
  manifestFault?: "open" | "partial-write" | "file-sync" | "observation" | "close" | "validation-scan" | "replacement" | "mode-drift" | "root-drift" | "unlink" | "unlink-replacement";
  failRestart?: boolean;
  failService?: "daemon-reload" | "enable";
  priorEnablement?: "enabled" | "disabled";
  unitDrift?: "before-publication" | "bytes" | "identity" | "symlink";
  deploymentDrift?: "application" | "launcher" | "application-backup" | "launcher-backup";
  readinessDrift?: "application" | "launcher" | "unit" | "config";
  markerDrift?: "launcher" | "unit" | "config";
  markerTemporaryDrift?: "identity" | "bytes" | "symlink";
  failRestoreService?: "disable" | "daemon-reload" | "enable";
  failPredecessorRetirement?: boolean;
  failStaging?: boolean;
  stopMode?: "stuck" | "unknown" | "failed-inactive";
  readinessStatus?: number;
  readinessError?: "timeout" | "redirect";
  failFinalization?: boolean;
  failCleanup?: "config" | "application" | "launcher" | "unit";
  readinessToken?: "missing" | "invalid";
  bind?: string;
  legacyDatabaseVersion?: 1 | 2 | 3;
  repositoryNativeV2?: Readonly<{ root: string; activeExecution: boolean }>;
  legacyRootInWal?: boolean;
  loseDatabaseArchive?: boolean;
  databaseFault?: "archive" | "copy" | "partial-copy" | "restore" | "copy-and-restore" | "unlink" |
    "archive-drift" | "archive-symlink" | "candidate-drift" | "copy-replaced" | "candidate-drift-after-health" | "pre-start-replaced" |
    "pre-start-content-drift" | "pre-start-disappearance" | "marker-sidecar-replaced" | "sidecar-alias";
  gracefulCandidateStop?: boolean;
  databaseFaultSuffix?: "" | "-wal" | "-shm";
  databaseSidecars?: boolean;
  versionInWal?: 1 | 2 | 3;
  absentOriginalSidecar?: "-wal" | "-shm";
  candidateSidecars?: boolean;
  driftConfig?: boolean;
  configFault?: "snapshot-sync" | "publication" | "publication-sync" | "restore" | "restore-sync" | "retire" |
    "snapshot-file-sync" | "snapshot-changed" | "publication-write" | "publication-file-sync" |
    "publication-target-drift" | "publication-temp-replaced" | "publication-readback-drift" | "restore-write" | "restore-file-sync";
  configOwnerMismatch?: boolean;
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
    const binDir = path.join(fixture.home, ".local/bin");
    const launcher = path.join(binDir, "order");
    const unitPath = path.join(fixture.home, ".config/systemd/user/pontivus-order.service");
    const marker = path.join(installRoot, "SOURCE_COMMIT");
    const configPath = path.join(fixture.stateRoot, "config.json");
    const legacyInstall = path.join(fixture.home, ".local/share/gateweft");
    const legacyState = path.join(fixture.home, ".local/state/gateweft");
    const legacyUnit = path.join(fixture.home, ".config/systemd/user/gateweft.service");
    const archive = new Uint8Array([1, 2, 3, 4]);
    const digest = crypto.createHash("sha256").update(archive).digest("hex");
    const originalSpawn = Bun.spawnSync.bind(Bun);
    const originalFetch = globalThis.fetch;
    const sourceCommit = new TextDecoder().decode(originalSpawn(["git", "rev-parse", "HEAD"], { cwd: sourceRoot }).stdout).trim();
    const events = [];
    const prompts = [];
    let activity = fs.existsSync(unitPath) ? "active" : "inactive";
    let legacyActivity = fs.existsSync(legacyUnit) ? "active" : "inactive";
    let enablement = fs.existsSync(unitPath) ? fixture.priorEnablement ?? "enabled" : "";
    let restartFailed = false;
    let serviceFailed = false;
    let candidateStarted = false;
    const readIdentity = target => {
      const entry = fs.lstatSync(target, { throwIfNoEntry: false, bigint: true });
      return entry === undefined ? null : String(entry.dev) + ":" + String(entry.ino);
    };
    const readBytes = target => fs.lstatSync(target, { throwIfNoEntry: false })?.isFile()
      ? fs.readFileSync(target).toString("base64") : null;
    const priorApplicationIdentity = readIdentity(installRoot);
    const priorLauncherIdentity = readIdentity(launcher);
    const priorUnitBytes = readBytes(unitPath);
    const expectedUnit = Buffer.from(installer.buildUserServiceUnit(launcher)).toString("base64");
    const expectedLauncher = Buffer.from(installer.buildLauncherScript({
      installRoot, stateRoot: fixture.stateRoot, bind: process.env.PONTIVUS_ORDER_BIND,
    })).toString("base64");
    const restartObservations = [];
    const databasePath = path.join(fixture.stateRoot, "order.sqlite3");
    const { Database } = await import("bun:sqlite");
    const databaseSuffixes = ["", "-wal", "-shm"];
    const faultPath = databasePath + (fixture.databaseFaultSuffix ?? (fixture.databaseFault === "unlink" ? "-wal" : ""));
    const readDatabaseNamespace = () => databaseSuffixes.map(suffix => readBytes(databasePath + suffix));
    const { spawnSync: spawnFixtureProcess } = await import("node:child_process");
    let walFixtureFailure = null;
    const populateWal = (statement, expectedValue, expectedVersion) => {
      // The fixture process proves the committed data and live sidecars while
      // SQLite is open, then terminates by SIGKILL, bypassing graceful close
      // and its checkpoint. spawnSync joins the process before installer work.
      const source = [
        "import { Database } from 'bun:sqlite';",
        "import { statSync, writeSync } from 'node:fs';",
        "const path = " + JSON.stringify(databasePath) + ";",
        "const db = new Database(path, { create: true, strict: true });",
        "if (db.query('PRAGMA journal_mode=WAL').get().journal_mode !== 'wal') throw new Error('fixture WAL mode unavailable');",
        "db.exec('PRAGMA wal_autocheckpoint=0;');",
        "db.exec(" + JSON.stringify(statement) + ");",
        "const value = db.query('SELECT value FROM sentinel').get().value;",
        "const version = db.query('PRAGMA user_version').get().user_version;",
        "if (value !== " + JSON.stringify(expectedValue) + " || version !== " + expectedVersion + ") throw new Error('fixture committed data mismatch');",
        "if (statSync(path + '-wal').size <= 32 || statSync(path + '-shm').size <= 0) throw new Error('fixture sidecars not populated');",
        "writeSync(1, 'WAL_FIXTURE_COMMITTED');",
        "process.kill(process.pid, 'SIGKILL');",
        "throw new Error('fixture SIGKILL did not terminate');",
      ].join(" ");
      const child = spawnFixtureProcess(process.execPath, ["--eval", source], {
        encoding: "utf8", timeout: 15_000, killSignal: "SIGKILL",
      });
      if (child.error || child.signal !== "SIGKILL" || child.stdout !== "WAL_FIXTURE_COMMITTED") {
        throw new Error("WAL fixture failed: " + JSON.stringify({
          status: child.status, signal: child.signal, stdout: child.stdout,
          stderr: child.stderr, error: child.error?.message,
        }));
      }
      // The child is gone: inspect the actual retained files, not synthetic
      // sidecars or a database reopened (and potentially checkpointed) here.
      for (const suffix of ["-wal", "-shm"]) {
        if (!fs.existsSync(databasePath + suffix) || fs.statSync(databasePath + suffix).size === 0) {
          throw new Error("WAL fixture missing " + suffix);
        }
      }
      const wal = fs.readFileSync(databasePath + "-wal");
      const magic = wal.readUInt32BE(0);
      if ((magic !== 0x377f0682 && magic !== 0x377f0683) || wal.length <= 32) {
        throw new Error("WAL fixture has no valid WAL header and frames");
      }
    };
    const leaveWal = (...args) => {
      try { populateWal(...args); }
      catch (error) { walFixtureFailure = String(error); throw error; }
    };
    const migrationWorkItem = "work_11111111-1111-4111-8111-111111111111";
    const migrationTarget = "docs/order/work-items/" + migrationWorkItem + "/work-request.md";
    let migrationObservation = null;
    if (fixture.repositoryNativeV2 !== undefined) {
      const { openOrderDatabase } = await import("./src/shell/sqlite.ts");
      const { renderWorkItemSourceMarkdown } = await import("./src/core/work-item-source.ts");
      const markdown = renderWorkItemSourceMarkdown({
        formatVersion: 1, id: migrationWorkItem, projectId: "installer-fixture", concernIds: [],
        schemaId: "change-v1",
      }, "Migration fixture");
      fs.writeFileSync(path.join(fixture.repositoryNativeV2.root, "legacy.md"), markdown);
      const sha = "sha256:" + crypto.createHash("sha256").update(markdown).digest("hex");
      const db = openOrderDatabase(fixture.stateRoot);
      try {
        db.exec("ALTER TABLE workItems DROP COLUMN archived; PRAGMA user_version = 2;");
        db.query("INSERT INTO workItems VALUES (?1,'installer-fixture',?2,'Migration fixture','origin',?3,'ACTIVE',NULL,'[]','2026-11-11T03:30:00.000Z')")
          .run(migrationWorkItem, fixture.project, fixture.repositoryNativeV2.activeExecution ? "EXECUTION" : "PLAN");
        db.query("INSERT INTO workItemSources VALUES (?1,'change-v1','legacy.md',?2,NULL)").run(migrationWorkItem, sha);
        db.exec("CREATE TABLE sentinel(value TEXT NOT NULL) STRICT; INSERT INTO sentinel VALUES ('original');");
      } finally { db.close(); }
      if (fixture.databaseSidecars) leaveWal("UPDATE sentinel SET value='original WAL';", "original WAL", 2);
    } else if (fixture.legacyDatabaseVersion !== undefined) {
      const db = new Database(databasePath, { create: true, strict: true });
      db.exec("CREATE TABLE sentinel(value TEXT NOT NULL) STRICT; INSERT INTO sentinel VALUES (\'original\'); PRAGMA user_version = " + fixture.legacyDatabaseVersion + ";");
      if (fixture.legacyRootInWal) db.exec("CREATE TABLE workItems(repositoryRoot TEXT NOT NULL) STRICT;");
      db.close();
      if (fixture.databaseSidecars) {
        leaveWal("UPDATE sentinel SET value='original WAL';" +
          (fixture.legacyRootInWal ? "INSERT INTO workItems(repositoryRoot) VALUES ('" +
            fixture.project.replaceAll("'", "''") + "');" : "") +
          (fixture.versionInWal === undefined ? "" : "PRAGMA user_version=" + fixture.versionInWal + ";"),
          "original WAL", fixture.versionInWal ?? fixture.legacyDatabaseVersion);
        if (fixture.absentOriginalSidecar) fs.unlinkSync(databasePath + fixture.absentOriginalSidecar);
      }
    }
    const originalNamespace = readDatabaseNamespace();
    const originalDatabase = readBytes(databasePath);
    const originalConfig = readBytes(configPath);
    const originalConfigIdentity = readIdentity(configPath);
    const originalConfigMode = fs.lstatSync(configPath, { throwIfNoEntry: false })?.mode ?? null;
    let retainedArchive = null;
    const token = "a".repeat(64);
    const result = (stdout = "", exitCode = 0) => ({
      stdout: Buffer.from(stdout), stderr: Buffer.from(exitCode === 0 ? "" : "injected host failure"),
      exitCode, success: exitCode === 0,
    });
    Bun.spawnSync = (argv, options = {}) => {
      // Node-compatible child_process delegates to Bun's object-form spawn.
      // Fixture processes are real external effects, never host-command stubs.
      if (!Array.isArray(argv)) return originalSpawn(argv);
      if (argv[0] === "systemctl") {
        events.push({ command: argv.slice(2), marker: fs.existsSync(marker) });
        const verb = argv[2];
        const legacyService = argv.includes("gateweft.service");
        if (legacyService) {
          if (verb === "show") return result(legacyActivity + "\\n");
          if (verb === "stop") { legacyActivity = "inactive"; return result(); }
          if (verb === "restart") { legacyActivity = "active"; return result(); }
          if (verb === "disable") return fixture.failPredecessorRetirement ? result("", 1) : result();
          throw new Error("unexpected predecessor command " + JSON.stringify(argv));
        }
        if (verb === fixture.failService && !serviceFailed) { serviceFailed = true; return result("", 1); }
        if (candidateStarted && verb === fixture.failRestoreService) return result("", 1);
        if (verb === "daemon-reload") {
          if (!fs.existsSync(unitPath)) enablement = "";
          return result();
        }
        if (verb === "show-environment") return result();
        if (verb === "show") {
          if (argv[3] === "--property=ActiveState") return result(activity + "\\n");
          if (argv[3] === "--property=UnitFileState") return result(enablement + "\\n");
          throw new Error("unexpected systemctl property " + argv[3]);
        }
        if (verb === "stop") {
          if (fixture.stopMode === "stuck") return result("", 1);
          if (fixture.stopMode === "unknown") { activity = "unknown"; return result("", 1); }
          activity = "inactive";
          if (candidateStarted && fixture.deploymentDrift) {
            const app = fixture.deploymentDrift.startsWith("application");
            const target = app ? installRoot : launcher;
            const changed = fixture.deploymentDrift.endsWith("-backup")
              ? path.join(path.dirname(target), fs.readdirSync(path.dirname(target)).find(name =>
                  name.startsWith(path.basename(target) + ".previous.")))
              : target;
            fs.renameSync(changed, changed + ".external-original");
            if (app) {
              fs.mkdirSync(changed);
              fs.writeFileSync(path.join(changed, "external"), "external application");
            } else fs.writeFileSync(changed, "external launcher", { mode: 0o755 });
          }
          if (candidateStarted && fixture.unitDrift && fixture.unitDrift !== "before-publication") {
            if (fixture.unitDrift === "bytes") fs.appendFileSync(unitPath, "# external edit");
            else {
              const bytes = fs.readFileSync(unitPath);
              fs.renameSync(unitPath, unitPath + ".external");
              if (fixture.unitDrift === "identity") fs.writeFileSync(unitPath, bytes, { mode: 0o644 });
              else fs.symlinkSync(unitPath + ".external", unitPath);
            }
          }
          if (candidateStarted && fixture.gracefulCandidateStop) {
            const db = new Database(databasePath, { create: false, strict: true });
            try { db.exec("PRAGMA wal_checkpoint(TRUNCATE);"); } finally { db.close(); }
          }
          if (candidateStarted && fixture.databaseFault === "candidate-drift") {
            fs.renameSync(faultPath, faultPath + ".retained-candidate");
            fs.writeFileSync(faultPath, "unexpected replacement");
          }
          return fixture.stopMode === "failed-inactive" ? result("", 1) : result();
        }
        if (verb === "enable") { enablement = "enabled"; return result(); }
        if (verb === "disable") { enablement = "disabled"; return result(); }
        if (verb === "restart") {
          // A compensating restart can be the first restart of the invocation.
          // Classify from the actual deployment, not command order or history answers.
          const prior = priorApplicationIdentity !== null && priorLauncherIdentity !== null &&
            priorUnitBytes !== null && readIdentity(installRoot) === priorApplicationIdentity &&
            readIdentity(launcher) === priorLauncherIdentity && readBytes(unitPath) === priorUnitBytes;
          const candidate = readIdentity(installRoot) !== null &&
            readIdentity(installRoot) !== priorApplicationIdentity &&
            readIdentity(launcher) !== null && readIdentity(launcher) !== priorLauncherIdentity &&
            readBytes(unitPath) === expectedUnit && readBytes(launcher) === expectedLauncher &&
            readBytes(path.join(installRoot, "app/src/cli.ts")) === readBytes(path.join(sourceRoot, "src/cli.ts"));
          if (prior === candidate) throw new Error("restart deployment identity is ambiguous");
          restartObservations.push({
            deployment: prior ? "prior" : "candidate",
            databaseMatchesOriginal: readBytes(databasePath) === originalDatabase,
            configMatchesOriginal: readBytes(configPath) === originalConfig,
          });
          activity = "active";
          if (prior) return result();
          if (fixture.readinessToken !== "missing") {
            fs.writeFileSync(path.join(fixture.stateRoot, "daemon-token"),
              fixture.readinessToken === "invalid" ? "invalid-secret-token" : token, { mode: 0o600 });
          }
          if (!candidateStarted) {
            candidateStarted = true;
            if (fixture.repositoryNativeV2 !== undefined) {
              const db = new Database(databasePath, { create: false, readonly: true, strict: true });
              try {
                migrationObservation = {
                  version: db.query("PRAGMA user_version").get().user_version,
                  workItem: db.query("SELECT stage, archived FROM workItems WHERE id=?1").get(migrationWorkItem),
                  source: db.query("SELECT sourcePath, sourceSha256 FROM workItemSources WHERE workItemId=?1").get(migrationWorkItem),
                  document: readBytes(path.join(fixture.project, migrationTarget)),
                };
              } finally { db.close(); }
            } else if (fixture.legacyDatabaseVersion === 1 || fixture.legacyDatabaseVersion === 2) {
              const statement = "CREATE TABLE IF NOT EXISTS sentinel(value TEXT NOT NULL) STRICT; DELETE FROM sentinel; INSERT INTO sentinel VALUES ('candidate'); PRAGMA user_version = 3;";
              if (fixture.candidateSidecars) leaveWal(statement, "candidate", 3);
              else {
                const db = new Database(databasePath, { create: true, strict: true });
                db.exec(statement);
                db.close();
              }
              if (fixture.databaseFault === "archive-drift" || fixture.databaseFault === "archive-symlink") {
                const name = fs.readdirSync(fixture.stateRoot).find(name => name.startsWith(path.basename(faultPath) + ".legacy-v"));
                if (!name) throw new Error("expected archive for " + faultPath);
                const archived = path.join(fixture.stateRoot, name);
                if (fixture.databaseFault === "archive-drift") fs.appendFileSync(archived, "unexpected archive bytes");
                else {
                  retainedArchive = archived + ".retained";
                  fs.renameSync(archived, retainedArchive);
                  fs.symlinkSync(retainedArchive, archived);
                }
              }
              if (fixture.loseDatabaseArchive) {
                const name = fs.readdirSync(fixture.stateRoot).find(name => /^order\\.sqlite3\\.legacy-v[12]\\./.test(name));
                if (!name) throw new Error("expected actual database archive");
                retainedArchive = path.join(fixture.stateRoot, name + ".retained");
                fs.renameSync(path.join(fixture.stateRoot, name), retainedArchive);
              }
            }
            if (fixture.databaseFault === "sidecar-alias") {
              fs.unlinkSync(databasePath + "-shm");
              fs.linkSync(databasePath + "-wal", databasePath + "-shm");
            }
            if (fixture.databaseFault === "unlink" && !fixture.candidateSidecars) fs.writeFileSync(faultPath, "invocation-created sidecar");
            if (fixture.driftConfig) fs.appendFileSync(configPath, " ");
            if (fixture.manifestDrift) {
              const manifest = path.join(fixture.project, "pontivus-order.toml");
              const bytes = fs.readFileSync(manifest);
              if (fixture.manifestDrift === "bytes") fs.appendFileSync(manifest, "# operator edit");
              else {
                fs.renameSync(manifest, manifest + ".retained");
                if (fixture.manifestDrift === "identity") fs.writeFileSync(manifest, bytes);
                else fs.symlinkSync(manifest + ".retained", manifest);
              }
            }
          }
          if (fixture.interruptAt === "service-start") process.exit(77);
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
        if (fixture.interruptAt === "health") process.exit(77);
        return result("", activity === "active" ? 0 : 1);
      }
      return originalSpawn(argv, options);
    };
    const replaceDeploymentMember = (member, suffix) => {
      const target = member === "application" ? installRoot :
        member === "launcher" ? launcher : member === "unit" ? unitPath : configPath;
      const bytes = member === "application" ? null : fs.readFileSync(target);
      fs.renameSync(target, target + suffix);
      if (bytes === null) {
        fs.mkdirSync(target);
        fs.writeFileSync(path.join(target, "external"), "unexpected application");
      } else fs.writeFileSync(target, bytes, { mode: member === "config" ? 0o600 :
        member === "launcher" ? 0o755 : 0o644 });
    };
    globalThis.fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.hostname === "nodejs.org") {
        if (fixture.failStaging) throw new Error("injected staging failure");
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
        if (fixture.readinessDrift) replaceDeploymentMember(fixture.readinessDrift, ".readiness-external");
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
        const kind = from === legacyInstall && to === installRoot ? "predecessor-app" :
          from === legacyState && to === fixture.stateRoot ? "predecessor-state" :
          from === path.join(fixture.stateRoot, "gateweft.sqlite3") ? "predecessor-db" :
          from === path.join(fixture.stateRoot, "gateweft.sqlite3-wal") ? "predecessor-wal" :
          from === path.join(fixture.stateRoot, "gateweft.sqlite3-shm") ? "predecessor-shm" :
          from === installRoot && String(to).startsWith(installRoot + ".previous.") ? "app-backup" :
          from === launcher && String(to).startsWith(launcher + ".previous.") ? "launcher-backup" :
          String(from).includes("/.pontivus-order-install.") && to === installRoot ? "app-activation" :
          String(from).includes("/.pontivus-order.") && to === launcher ? "launcher-activation" :
          String(from).startsWith(unitPath + ".tmp.") && to === unitPath ? "unit-publication" :
          String(from).startsWith(unitPath + ".restore.") && to === unitPath ? "unit-restoration" :
          String(from).startsWith(marker + ".tmp.") && to === marker ? "marker-publication" : null;
        if (kind === "marker-publication" && fixture.databaseFault === "candidate-drift-after-health") {
          fs.renameSync(faultPath, faultPath + ".retained-candidate");
          fs.writeFileSync(faultPath, "unexpected replacement");
          throw new Error("injected candidate replacement before commit");
        }
        if (!injected && kind !== null && kind === fixture.failRename) {
          injected = true;
          throw new Error("injected rename failure: " + kind);
        }
        fs.renameSync(from, to);
        if (kind === "launcher-activation" && fixture.unitDrift === "before-publication") fs.appendFileSync(unitPath, "# external edit");
        if (kind === "app-activation" && fixture.interruptAt === "app-activation") process.exit(77);
        if (kind === "unit-publication" && fixture.databaseFault === "pre-start-replaced") {
          if (fs.existsSync(faultPath)) fs.renameSync(faultPath, faultPath + ".retained-candidate");
          fs.writeFileSync(faultPath, "unexpected pre-start file");
        }
        if (kind === "unit-publication" && fixture.databaseFault === "pre-start-content-drift") fs.appendFileSync(faultPath, "unexpected same-inode bytes");
        if (kind === "unit-publication" && fixture.databaseFault === "pre-start-disappearance") fs.renameSync(faultPath, faultPath + ".retained-candidate");
        if (kind === "marker-publication" && fixture.failCleanup === "config") {
          const name = fs.readdirSync(fixture.stateRoot).find(name => name.startsWith("config.json.installer-recovery."));
          if (!name) throw new Error("expected configuration recovery copy");
          fs.appendFileSync(path.join(fixture.stateRoot, name), " ");
        }
      };
      const remove = (target, options) => {
        if ((fixture.failCleanup === "application" && String(target).startsWith(installRoot + ".previous.")) ||
            (fixture.failCleanup === "launcher" && String(target).startsWith(launcher + ".previous.")) ||
            (fixture.failCleanup === "unit" && String(target).startsWith(unitPath + ".previous."))) {
          throw new Error("injected cleanup failure: " + target);
        }
        fs.rmSync(target, options);
      };
      const databaseEffects = {
        rename: (from, to) => {
          if (fixture.databaseFault === "archive" && from === faultPath) throw new Error("injected archive rename");
          if ((fixture.databaseFault === "restore" || fixture.databaseFault === "copy-and-restore") &&
              String(from).includes(".legacy-v") && to === faultPath) throw new Error("injected archive restoration");
          fs.renameSync(from, to);
        },
        copy: (source, target, from, to) => {
          if (fixture.databaseFault === "copy" && to === faultPath) throw new Error("injected database copy");
          if (fixture.databaseFault === "copy-replaced" && to === faultPath) {
            fs.renameSync(to, to + ".retained-candidate");
            fs.writeFileSync(to, "unexpected replacement");
          }
          if ((fixture.databaseFault === "partial-copy" || fixture.databaseFault === "copy-and-restore") && to === faultPath) {
            fs.writeFileSync(target, "partial candidate");
            throw new Error("injected partial database copy");
          }
          fs.writeFileSync(target, fs.readFileSync(source));
          fs.fsyncSync(target);
        },
        unlink: target => {
          if (fixture.databaseFault === "unlink" && target === faultPath) throw new Error("injected candidate unlink");
          fs.unlinkSync(target);
        },
      };
      let configPhase = "snapshot";
      let injectedConfigSync = false;
      let configFilePhase = "snapshot";
      const configEffects = {
        write: (descriptor, bytes) => {
          const target = fs.readlinkSync("/proc/self/fd/" + descriptor);
          configFilePhase = target.includes(".installer-recovery.") ? "snapshot" :
            target.includes(".installer-restore.") ? "restore" : "publication";
          if (fixture.configFault === configFilePhase + "-write") {
            fs.writeFileSync(descriptor, bytes.subarray(0, 8));
            throw new Error("injected configuration " + configFilePhase + " write");
          }
          if (fixture.configFault === "publication-temp-replaced" && configFilePhase === "publication") {
            fs.renameSync(target, target + ".retained-original");
            fs.writeFileSync(target, "unexpected temporary", { mode: 0o600 });
          }
          fs.writeFileSync(descriptor, bytes);
        },
        rename: (from, to) => {
          if (to === configPath && String(from).includes(".installer-restore.")) {
            if (fixture.configFault === "restore") throw new Error("injected configuration restoration");
            fs.renameSync(from, to);
            configPhase = "restore";
          } else {
            if (fixture.configFault === "publication") throw new Error("injected configuration publication");
            fs.renameSync(from, to);
            configPhase = "publication";
          }
        },
        fsync: descriptor => {
          const directory = fs.fstatSync(descriptor).isDirectory();
          const phase = directory ? configPhase : configFilePhase;
          if (!injectedConfigSync && fixture.configFault === phase + (directory ? "-sync" : "-file-sync")) {
            injectedConfigSync = true;
            throw new Error("injected configuration " + phase + " fsync");
          }
          if ((directory && configPhase === "snapshot" && fixture.configFault === "snapshot-changed") ||
              (!directory && configFilePhase === "publication" && fixture.configFault === "publication-target-drift")) {
            fs.renameSync(configPath, configPath + ".retained-original");
            fs.writeFileSync(configPath, Buffer.from(originalConfig, "base64"), { mode: 0o600 });
          }
          fs.fsyncSync(descriptor);
          if (directory && configPhase === "publication" && fixture.configFault === "publication-readback-drift") {
            const bytes = fs.readFileSync(configPath);
            fs.renameSync(configPath, configPath + ".retained-publication");
            fs.writeFileSync(configPath, bytes, { mode: 0o600 });
          }
        },
        unlink: target => {
          if (fixture.configFault === "retire" && String(target).includes(".installer-recovery.")) {
            throw new Error("injected configuration retirement");
          }
          fs.unlinkSync(target);
        },
      };
      const actualGetuid = process.getuid;
      if (fixture.configOwnerMismatch) process.getuid = () => actualGetuid() + 1;
      try {
        const writeMarker = (descriptor, bytes) => {
          if (fixture.failMarkerWrite) {
            fs.writeFileSync(descriptor, bytes.slice(0, 8), "utf8");
            throw new Error("injected partial marker temporary write");
          }
          fs.writeFileSync(descriptor, bytes, "utf8");
          if (fixture.markerTemporaryDrift) {
            const target = fs.readlinkSync("/proc/self/fd/" + descriptor);
            if (fixture.markerTemporaryDrift === "bytes") {
              fs.writeFileSync(target, "unexpected marker bytes");
            } else {
              fs.renameSync(target, target + ".retained");
              if (fixture.markerTemporaryDrift === "identity") fs.writeFileSync(target, bytes, { mode: 0o644 });
              else fs.symlinkSync(target + ".retained", target);
            }
          }
          if (fixture.markerDrift) replaceDeploymentMember(fixture.markerDrift, ".marker-external");
          if (fixture.databaseFault === "marker-sidecar-replaced") {
            fs.renameSync(faultPath, faultPath + ".retained-candidate");
            fs.writeFileSync(faultPath, "unexpected replacement");
          }
        };
        const manifestEffects = {
          open: (target, flags, mode) => {
            if (fixture.manifestFault === "open") throw new Error("injected manifest open");
            return fs.openSync(target, flags, mode);
          },
          read: (descriptor, bytes, offset, length, position) => {
            if (fixture.manifestFault === "observation") throw new Error("injected manifest observation");
            return fs.readSync(descriptor, bytes, offset, length, position);
          },
          close: descriptor => {
            fs.closeSync(descriptor);
            if (fixture.manifestFault === "close") throw new Error("injected manifest close");
            if (fixture.manifestFault === "validation-scan") {
              // Inject a failure at the authority-directory enumeration effect,
              // not at the canonical validation or installer transaction owner.
              const scan = Bun.Glob.prototype.scan;
              Bun.Glob.prototype.scan = function(options) {
                if (options?.cwd === fixture.project) throw new Error("injected manifest authority scan");
                return scan.call(this, options);
              };
            }
          },
          write: (descriptor, bytes) => {
            if (fixture.manifestFault === "partial-write") {
              fs.writeFileSync(descriptor, bytes.subarray(0, 8));
              throw new Error("injected manifest partial write");
            }
            fs.writeFileSync(descriptor, bytes);
            if (fixture.manifestFault === "mode-drift") fs.fchmodSync(descriptor, 0o600);
            if (fixture.manifestFault === "root-drift") {
              fs.renameSync(fixture.project, fixture.project + ".retained-root");
              fs.mkdirSync(fixture.project);
              fs.writeFileSync(path.join(fixture.project, "pontivus-order.toml"), "unexpected new root");
            }
            if (fixture.manifestFault === "replacement") {
              const manifest = path.join(fixture.project, "pontivus-order.toml");
              fs.renameSync(manifest, manifest + ".retained");
              fs.writeFileSync(manifest, bytes);
            }
          },
          fsync: descriptor => {
            if (fixture.manifestFault === "file-sync") throw new Error("injected manifest fsync");
            fs.fsyncSync(descriptor);
          },
          unlink: target => {
            if (fixture.manifestFault === "unlink") throw new Error("injected manifest unlink");
            fs.unlinkSync(target);
            if (fixture.manifestFault === "unlink-replacement") fs.writeFileSync(target, "unexpected replacement after unlink");
          },
        };
        await installer.runInstaller({ sourceRoot, sourceCommit }, process.env, question, rename, remove, databaseEffects, configEffects, writeMarker, manifestEffects);
      } finally { process.getuid = actualGetuid; }
    } catch (error) { failure = String(error); }
    if (walFixtureFailure !== null) throw new Error("SQLite fixture infrastructure failure: " + walFixtureFailure);
    console.log("ORDER_TRANSACTION_RESULT " + JSON.stringify({
      failure, prompts, events, restartObservations, activity, enablement, legacyActivity, sourceCommit,
      marker: fs.lstatSync(marker, { throwIfNoEntry: false })?.isFile() ? fs.readFileSync(marker, "utf8") : null,
      config: (() => { try { const bytes = readBytes(configPath); return bytes === null ? null : JSON.parse(Buffer.from(bytes, "base64").toString("utf8")); } catch { return null; } })(),
      app: fs.existsSync(installRoot), launcher: fs.existsSync(launcher), unit: fs.existsSync(unitPath),
      originalDatabase, originalConfig, retainedArchive, originalNamespace, migrationObservation,
      databaseNamespace: readDatabaseNamespace(),
      database: fs.existsSync(databasePath) ? fs.readFileSync(databasePath).toString("base64") : null,
      configBytes: readBytes(configPath), originalConfigIdentity, originalConfigMode,
      configIdentity: readIdentity(configPath), configMode: fs.lstatSync(configPath, { throwIfNoEntry: false })?.mode ?? null,
      stateEntries: fs.existsSync(fixture.stateRoot) ? fs.readdirSync(fixture.stateRoot) : [],
      appBackups: fs.existsSync(path.dirname(installRoot)) ? fs.readdirSync(path.dirname(installRoot)).filter(name => name.startsWith("pontivus-order.previous.")) : [],
      launcherBackups: fs.existsSync(binDir) ? fs.readdirSync(binDir).filter(name => name.startsWith("order.previous.")) : [],
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
      PONTIVUS_ORDER_BIND: fixture.bind ?? "127.0.0.1:7347",
    },
  });
  if ((fixture.interruptAtReadiness || fixture.interruptAt) && result.status === 77) return { interrupted: true, stdout: result.stdout };
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

const createPredecessorDeployment = (fixture: ReturnType<typeof transactionFixture>, withDatabase = false) => {
  createPriorDeployment(fixture);
  const root = join(fixture.home, ".local/share/gateweft");
  const state = join(fixture.home, ".local/state/gateweft");
  mkdirSync(join(fixture.home, ".local/state"), { recursive: true });
  renameSync(join(fixture.home, ".local/share/pontivus-order"), root);
  renameSync(fixture.stateRoot, state);
  renameSync(join(fixture.home, ".local/bin/order"), join(fixture.home, ".local/bin/gateweft"));
  renameSync(join(fixture.home, ".config/systemd/user/pontivus-order.service"),
    join(fixture.home, ".config/systemd/user/gateweft.service"));
  if (withDatabase) {
    for (const suffix of ["", "-wal", "-shm"]) writeFileSync(join(state, "gateweft.sqlite3" + suffix), "prior" + suffix);
  }
  return { root, state };
};

describe("actual IA25 installer transaction", () => {
  it.each(["predecessor-app", "predecessor-state", "predecessor-db", "predecessor-wal", "predecessor-shm", "staging"] as const)(
    "compensates exact predecessor paths after %s failure", failure => {
      const fixture = transactionFixture();
      const legacy = createPredecessorDeployment(fixture, true);
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] },
        ...(failure === "staging" ? { failStaging: true } : { failRename: failure }) });
      expect(outcome.failure).toContain(failure === "staging" ? "injected staging failure" : "injected rename failure: " + failure);
      expect(readFileSync(join(legacy.root, "SOURCE_COMMIT"), "utf8")).toBe("b".repeat(40) + "\n");
      for (const suffix of ["", "-wal", "-shm"]) {
        expect(readFileSync(join(legacy.state, "gateweft.sqlite3" + suffix), "utf8")).toBe("prior" + suffix);
        expect(existsSync(join(legacy.state, "order.sqlite3" + suffix))).toBe(false);
      }
      expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
      expect(outcome.legacyActivity).toBe("active");
      expect(outcome.stdout).not.toContain("Order updated successfully.");
    }, 120_000);

  it("retains committed Order and conflicting predecessor paths after retirement failure", () => {
    const fixture = transactionFixture();
    createPredecessorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failPredecessorRetirement: true });
    expect(outcome.failure).toContain("installation committed; finalization incomplete");
    expect(outcome.marker).toBe(outcome.sourceCommit + "\n");
    expect(outcome.app && outcome.launcher && outcome.unit).toBe(true);
    expect(outcome.legacyActivity).toBe("inactive");
    const retry = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] } });
    expect(retry.failure).toContain("resolve the conflict before installing");
    expect(retry.failure).toContain(join(fixture.home, ".local/bin/gateweft"));
    expect(retry.failure).toContain(join(fixture.home, ".local/bin/order"));
    expect(retry.marker).toBe(outcome.marker);
    expect(retry.events.some((event: { command: string[] }) => event.command[0] === "stop")).toBe(false);
  }, 180_000);

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

  it.each(["stuck", "unknown"] as const)("refuses current installation replacement on unproven prior quiescence: %s", stopMode => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, stopMode });
    expect(outcome.failure).not.toBeNull();
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.appBackups).toHaveLength(0);
    expect(outcome.launcherBackups).toHaveLength(0);
    expect(outcome.restartObservations).toEqual([]);
  }, 120_000);

  it.each(["disable", "daemon-reload", "enable"] as const)("restores independent unit bytes and blocks prior restart when %s compensation fails", failRestoreService => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const unit = join(fixture.home, ".config/systemd/user/pontivus-order.service");
    chmodSync(unit, 0o640);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failRestart: true, failRestoreService,
      priorEnablement: failRestoreService === "disable" ? "disabled" : "enabled" });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("service restoration incomplete");
    expect(outcome.failure).toContain(failRestoreService);
    expect(readFileSync(unit, "utf8")).toBe("old unit");
    expect(statSync(unit).mode & 0o777).toBe(0o640);
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
  }, 120_000);

  it.each(["application", "launcher", "application-backup", "launcher-backup"] as const)(
    "preserves replacement deployment objects on incomplete compensation: %s", deploymentDrift => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const root = join(fixture.home, ".local/share/pontivus-order");
      const launcher = join(fixture.home, ".local/bin/order");
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, deploymentDrift, failRestart: true });
      expect(outcome.failure).toContain("injected host failure");
      expect(outcome.failure).toContain("rollback incomplete");
      expect(outcome.configBytes).toBe(outcome.originalConfig);
      expect(outcome.activity).toBe("inactive");
      expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
      if (deploymentDrift.startsWith("application")) {
        const changed = deploymentDrift === "application" ? root :
          join(fixture.home, ".local/share", outcome.appBackups.find((name: string) => !name.endsWith(".external-original")));
        expect(readFileSync(join(changed, "external"), "utf8")).toBe("external application");
        expect(existsSync(changed + ".external-original")).toBe(true);
        expect(readFileSync(launcher, "utf8")).toBe("old launcher");
      } else {
        const changed = deploymentDrift === "launcher" ? launcher :
          join(fixture.home, ".local/bin", outcome.launcherBackups.find((name: string) => !name.endsWith(".external-original")));
        expect(readFileSync(changed, "utf8")).toBe("external launcher");
        expect(existsSync(changed + ".external-original")).toBe(true);
        expect(readFileSync(join(root, "SOURCE_COMMIT"), "utf8")).toBe("b".repeat(40) + "\n");
      }
    }, 120_000);

  it.each(["before-publication", "bytes", "identity", "symlink"] as const)(
    "preserves externally changed service unit and blocks prior restart: %s", unitDrift => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const unit = join(fixture.home, ".config/systemd/user/pontivus-order.service");
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, unitDrift, failRestart: true });
      expect(outcome.failure).toContain("rollback incomplete");
      expect(outcome.failure).toContain(unit);
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(outcome.configBytes).toBe(outcome.originalConfig);
      expect(outcome.activity).toBe("inactive");
      expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment))
        .toEqual(unitDrift === "before-publication" ? [] : ["candidate"]);
      if (unitDrift === "bytes" || unitDrift === "before-publication") expect(readFileSync(unit, "utf8")).toContain("# external edit");
      else if (unitDrift === "symlink") expect(lstatSync(unit).isSymbolicLink()).toBe(true);
      else expect(readFileSync(unit)).toEqual(readFileSync(unit + ".external"));
      if (unitDrift !== "before-publication") {
        const name = readdirSync(join(fixture.home, ".config/systemd/user")).find(name => name.startsWith("pontivus-order.service.previous."));
        expect(name).toBeDefined();
        expect(readFileSync(join(fixture.home, ".config/systemd/user", name!), "utf8")).toBe("old unit");
      }
    }, 120_000);

  it("retains prior service recovery bytes when restoration rename fails", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const directory = join(fixture.home, ".config/systemd/user");
    const unit = join(directory, "pontivus-order.service");
    chmodSync(unit, 0o640);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failRestart: true, failRename: "unit-restoration" });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("injected rename failure: unit-restoration");
    expect(outcome.failure).toContain("original recovery at");
    const recovery = readdirSync(directory).find(name => name.startsWith("pontivus-order.service.previous."));
    expect(recovery).toBeDefined();
    expect(readFileSync(join(directory, recovery!), "utf8")).toBe("old unit");
    expect(statSync(join(directory, recovery!)).mode & 0o777).toBe(0o640);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
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

  it.each([
    { readinessToken: "missing" as const },
    { readinessToken: "invalid" as const },
    { bind: "0.0.0.0:7347" },
    { bind: "127.0.0.1:99999" },
  ])("rejects unsafe readiness credential or bind before sending a request: %j", fault => {
    const outcome = runInstallerTransaction({ ...transactionFixture(),
      readiness: { ready: true, blockers: [] }, ...fault });
    expect(outcome.failure).toContain("installed");
    expect(outcome.marker).toBeNull();
    expect(outcome.app || outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "readiness")).toBe(false);
    expect(outcome.failure).not.toContain("invalid-secret-token");
    expect(outcome.failure).not.toContain("a".repeat(64));
  }, 120_000);

  it.each(["application", "launcher", "unit", "config"] as const)(
    "readiness cannot admit a replaced %s", readinessDrift => {
      const fixture = transactionFixture();
      const outcome = runInstallerTransaction({ ...fixture, readiness: { ready: true, blockers: [] }, readinessDrift });
      expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "readiness")).toBe(true);
      expect(outcome.failure).toContain("identity");
      expect(outcome.failure).toContain("rollback incomplete");
      expect(outcome.marker).toBeNull();
      expect(outcome.activity).toBe("inactive");
      expect(outcome.stdout).not.toContain("Order installed successfully.");
      const target = readinessDrift === "application" ? join(fixture.home, ".local/share/pontivus-order") :
        readinessDrift === "launcher" ? join(fixture.home, ".local/bin/order") :
        readinessDrift === "unit" ? join(fixture.home, ".config/systemd/user/pontivus-order.service") :
        join(fixture.stateRoot, "config.json");
      expect(existsSync(target + ".readiness-external")).toBe(true);
      if (readinessDrift === "application") expect(readFileSync(join(target, "external"), "utf8")).toBe("unexpected application");
      else expect(readFileSync(target)).toEqual(readFileSync(target + ".readiness-external"));
    }, 120_000);

  it.each(["launcher", "unit", "config"] as const)(
    "refuses commit after marker preparation replaces the %s", markerDrift => {
      const fixture = transactionFixture();
      const outcome = runInstallerTransaction({ ...fixture,
        readiness: { ready: true, blockers: [] }, markerDrift });
      expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "readiness")).toBe(true);
      expect(outcome.failure).toContain("identity");
      expect(outcome.failure).toContain("rollback incomplete");
      expect(outcome.marker).toBeNull();
      expect(outcome.activity).toBe("inactive");
      expect(outcome.stdout).not.toContain("Order installed successfully.");
      const target = markerDrift === "launcher" ? join(fixture.home, ".local/bin/order") :
        markerDrift === "unit" ? join(fixture.home, ".config/systemd/user/pontivus-order.service") :
        join(fixture.stateRoot, "config.json");
      expect(existsSync(target + ".marker-external")).toBe(true);
      expect(readFileSync(target)).toEqual(readFileSync(target + ".marker-external"));
      expect(lstatSync(target).ino).not.toBe(lstatSync(target + ".marker-external").ino);
    }, 120_000);

  it.each([false, true])("compensates partial marker temporary write (established=%s)", established => {
    const fixture = transactionFixture();
    if (established) createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failMarkerWrite: true });
    expect(outcome.failure).toContain("injected partial marker temporary write");
    expect(outcome.marker).toBe(established ? "b".repeat(40) + "\n" : null);
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe(established ? "active" : "inactive");
    expect(outcome.stdout).not.toContain("Order installed successfully.");
    expect(outcome.stdout).not.toContain("Order updated successfully.");
    expect(outcome.appBackups).toHaveLength(0);
    expect(outcome.launcherBackups).toHaveLength(0);
  }, 120_000);

  it.each(["app-activation", "service-start", "health"] as const)(
    "interrupted fresh installation at %s cannot establish prior admission", interruptAt => {
      const fixture = transactionFixture();
      const stopped = runInstallerTransaction({ ...fixture, readiness: { ready: true, blockers: [] }, interruptAt });
      expect(stopped.interrupted).toBe(true);
      expect(existsSync(join(fixture.home, ".local/share/pontivus-order/SOURCE_COMMIT"))).toBe(false);
      expect(stopped.stdout).not.toContain("Order installed successfully.");
      const retried = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: false, blockers: ["MODEL_INVALID"] } });
      expect(retried.failure).toContain("MODEL_INVALID");
      expect(retried.prompts.some((prompt: string) => prompt.startsWith("Did installation"))).toBe(false);
      expect(retried.stdout).not.toContain("Order updated successfully.");
    }, 180_000);

  it.each(["app-activation", "service-start", "health"] as const)(
    "interrupted update at %s retains prior deployment and requires explicit recovery", interruptAt => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const root = join(fixture.home, ".local/share/pontivus-order");
      const stopped = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, interruptAt });
      expect(stopped.interrupted).toBe(true);
      expect(existsSync(join(root, "SOURCE_COMMIT"))).toBe(false);
      const retried = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] } });
      expect(retried.failure).toContain("explicitly resolve retained prior deployment");
      expect(retried.appBackups).toHaveLength(1);
      expect(retried.launcherBackups).toHaveLength(1);
      expect(readFileSync(join(fixture.home, ".local/share", retried.appBackups[0], "SOURCE_COMMIT"), "utf8")).toBe("b".repeat(40) + "\n");
      expect(readFileSync(join(fixture.home, ".local/bin", retried.launcherBackups[0]), "utf8")).toBe("old launcher");
      expect(retried.events.some((event: { command: string[] }) => event.command[0] === "stop")).toBe(false);
    }, 180_000);

  it.each(["unchanged", "bytes", "identity", "symlink"] as const)(
    "only removes an unchanged installer-created manifest during compensation: %s", drift => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const manifest = join(fixture.project, "pontivus-order.toml");
      rmSync(manifest);
      writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify({
        version: 1, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [fixture.project], referenceRoots: [],
      }));
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, failRestart: true,
        ...(drift === "unchanged" ? {} : { manifestDrift: drift }) });
      expect(outcome.failure).toContain("injected host failure");
      expect(outcome.configBytes).toBe(outcome.originalConfig);
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      if (drift === "unchanged") {
        expect(existsSync(manifest)).toBe(false);
        expect(outcome.activity).toBe("active");
      } else {
        expect(outcome.failure).toContain("manifest restoration incomplete");
        expect(outcome.failure).toContain(manifest);
        expect(outcome.activity).toBe("inactive");
        expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
        if (drift === "bytes") expect(readFileSync(manifest, "utf8")).toContain("# operator edit");
        else {
          expect(readFileSync(manifest + ".retained", "utf8")).toContain("Generated by Order");
          if (drift === "symlink") expect(lstatSync(manifest).isSymbolicLink()).toBe(true);
          else expect(readFileSync(manifest)).toEqual(readFileSync(manifest + ".retained"));
        }
      }
    }, 120_000);

  it.each(["open", "partial-write", "file-sync", "observation", "close", "validation-scan", "replacement", "mode-drift", "root-drift", "unlink", "unlink-replacement"] as const)(
    "retains early manifest custody across installer failure: %s", manifestFault => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const manifest = join(fixture.project, "pontivus-order.toml");
      rmSync(manifest);
      if (manifestFault === "root-drift") temporary.push(fixture.project + ".retained-root");
      writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify({
        version: 1, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [fixture.project], referenceRoots: [],
      }));
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, manifestFault,
        failRestart: manifestFault === "unlink" || manifestFault === "unlink-replacement" });
      expect(outcome.failure).not.toBeNull();
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(outcome.configBytes).toBe(outcome.originalConfig);
      if (manifestFault === "open" || manifestFault === "partial-write" || manifestFault === "file-sync" ||
          manifestFault === "close" || manifestFault === "validation-scan") {
        const message = manifestFault === "partial-write" ? "partial write" : manifestFault === "file-sync" ? "fsync" :
          manifestFault === "validation-scan" ? "authority scan" : manifestFault;
        expect(outcome.failure).toContain("injected manifest " + message);
        expect(existsSync(manifest)).toBe(false);
        expect(outcome.activity).toBe("active");
      } else {
        expect(outcome.failure).toContain("manifest restoration incomplete");
        expect(outcome.failure).toContain(manifest);
        expect(outcome.activity).toBe("inactive");
        expect(existsSync(manifest)).toBe(true);
        if (manifestFault === "replacement") {
          expect(readFileSync(manifest)).toEqual(readFileSync(manifest + ".retained"));
        } else if (manifestFault === "mode-drift") {
          expect(outcome.failure).toContain("installer manifest descriptor custody changed");
          expect(lstatSync(manifest).mode & 0o777).toBe(0o600);
        } else if (manifestFault === "observation") {
          expect(outcome.failure).toContain("injected manifest observation");
          expect(outcome.failure).toContain("custody is unproven");
        } else if (manifestFault === "root-drift") {
          expect(readFileSync(manifest, "utf8")).toBe("unexpected new root");
          expect(readFileSync(join(fixture.project + ".retained-root", "pontivus-order.toml"), "utf8")).toContain("Generated by Order");
        } else if (manifestFault === "unlink-replacement") {
          expect(outcome.failure).toContain("installer manifest remains");
          expect(outcome.failure).toContain("injected host failure");
          expect(readFileSync(manifest, "utf8")).toBe("unexpected replacement after unlink");
        } else {
          expect(outcome.failure).toContain("injected manifest unlink");
          expect(outcome.failure).toContain("injected host failure");
        }
      }
    }, 120_000);

  it.each(["existing-invalid", "legacy"] as const)(
    "refuses an existing incompatible project manifest without adopting or deleting it: %s", kind => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const manifest = join(fixture.project, "pontivus-order.toml");
      rmSync(manifest);
      const retained = kind === "legacy" ? join(fixture.project, "gateweft.toml") : manifest;
      const bytes = Buffer.from("version = 999\n");
      writeFileSync(retained, bytes);
      const original = lstatSync(retained);
      writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify({
        version: 1, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [fixture.project], referenceRoots: [],
      }));
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] } });
      expect(outcome.failure).not.toBeNull();
      if (kind === "legacy") {
        expect(outcome.failure).toContain("legacy gateweft.toml");
        expect(existsSync(manifest)).toBe(false);
      }
      expect(readFileSync(retained)).toEqual(bytes);
      expect(lstatSync(retained).ino).toBe(original.ino);
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["prior"]);
      expect(outcome.configBytes).toBe(outcome.originalConfig);
    }, 120_000);

  it("blocks commit of an otherwise healthy deployment when created manifest custody drifts", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const manifest = join(fixture.project, "pontivus-order.toml");
    rmSync(manifest);
    writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify({
      version: 1, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [fixture.project], referenceRoots: [],
    }));
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, manifestDrift: "identity" });
    expect(outcome.failure).toContain("installer manifest identity changed");
    expect(outcome.failure).toContain("manifest restoration incomplete");
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
    expect(outcome.activity).toBe("inactive");
    expect(readFileSync(manifest)).toEqual(readFileSync(manifest + ".retained"));
  }, 120_000);

  it("preserves an unexpected marker object and refuses dependent application removal", () => {
    const fixture = transactionFixture();
    const outcome = runInstallerTransaction({ ...fixture,
      readiness: { ready: true, blockers: [] }, failMarker: true });
    expect(outcome.failure).toContain("unexpected installation commit marker");
    expect(outcome.failure).toContain("rollback incomplete");
    expect(outcome.marker).toBeNull();
    expect(outcome.app).toBe(true);
    expect(outcome.launcher || outcome.unit).toBe(false);
    expect(outcome.activity).toBe("inactive");
    expect(lstatSync(join(fixture.home, ".local/share/pontivus-order/SOURCE_COMMIT")).isDirectory()).toBe(true);
    expect(outcome.stdout).not.toContain("Order installed successfully.");
  }, 120_000);

  it.each([
    { markerTemporaryDrift: "identity" as const, established: false },
    { markerTemporaryDrift: "identity" as const, established: true },
    { markerTemporaryDrift: "bytes" as const, established: false },
    { markerTemporaryDrift: "symlink" as const, established: false },
  ])("preserves unproven marker temporary custody: %j", ({ markerTemporaryDrift, established }) => {
    const fixture = transactionFixture();
    if (established) createPriorDeployment(fixture);
    const root = join(fixture.home, ".local/share/pontivus-order");
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, markerTemporaryDrift });
    expect(outcome.failure).toContain("SOURCE_COMMIT.tmp.");
    expect(outcome.failure).toContain("rollback incomplete");
    expect(outcome.marker).toBeNull();
    expect(outcome.activity).toBe("inactive");
    expect(outcome.stdout).not.toContain("Order installed successfully.");
    expect(outcome.stdout).not.toContain("Order updated successfully.");
    const entries = readdirSync(root).filter(name => name.startsWith("SOURCE_COMMIT.tmp.") && !name.endsWith(".retained"));
    expect(entries).toHaveLength(1);
    const target = join(root, entries[0]!);
    if (markerTemporaryDrift === "bytes") expect(readFileSync(target, "utf8")).toBe("unexpected marker bytes");
    else {
      expect(readFileSync(target + ".retained", "utf8")).toBe(outcome.sourceCommit + "\n");
      if (markerTemporaryDrift === "symlink") expect(lstatSync(target).isSymbolicLink()).toBe(true);
      else {
        expect(readFileSync(target)).toEqual(readFileSync(target + ".retained"));
        expect(lstatSync(target).ino).not.toBe(lstatSync(target + ".retained").ino);
      }
    }
    if (established) {
      expect(outcome.appBackups).toHaveLength(1);
      expect(readFileSync(join(fixture.home, ".local/share", outcome.appBackups[0], "SOURCE_COMMIT"), "utf8")).toBe("b".repeat(40) + "\n");
    }
  }, 120_000);

  it.each(["absent", "config-only", "database-only", "partial", "malformed-marker", "symlink-marker"] as const)(
    "does not infer established admission from an incomplete or unproven footprint: %s", kind => {
      const fixture = transactionFixture();
      const root = join(fixture.home, ".local/share/pontivus-order");
      if (kind === "config-only") {
        writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify({
          version: 4, model: null, repositoryRoots: [], referenceRoots: [],
        }) + "\n", { mode: 0o600 });
      } else if (kind === "partial" || kind === "malformed-marker" || kind === "symlink-marker") {
        createPriorDeployment(fixture);
        if (kind === "partial") rmSync(join(root, "app/dist/index.html"));
        if (kind === "malformed-marker") writeFileSync(join(root, "SOURCE_COMMIT"), "not a source commit\n");
        if (kind === "symlink-marker") {
          renameSync(join(root, "SOURCE_COMMIT"), join(root, "old-source"));
          symlinkSync(join(root, "old-source"), join(root, "SOURCE_COMMIT"));
        }
      }
      const outcome = runInstallerTransaction({ ...fixture,
        ...(kind === "database-only" ? { legacyDatabaseVersion: 3 as const } : {}),
        establishedHistory: "yes", readiness: { ready: false, blockers: ["MODEL_INVALID"] },
      });
      expect(outcome.failure).toContain("MODEL_INVALID");
      expect(outcome.prompts.some((prompt: string) => prompt.startsWith("Did installation"))).toBe(false);
      expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "readiness")).toBe(true);
      expect(outcome.stdout).not.toContain("Order installed successfully.");
      expect(outcome.stdout).not.toContain("Order updated successfully.");
      if (kind === "symlink-marker") {
        expect(lstatSync(join(root, "SOURCE_COMMIT")).isSymbolicLink()).toBe(true);
        expect(readFileSync(join(root, "old-source"), "utf8")).toBe("b".repeat(40) + "\n");
      }
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

  it.each([
    { legacyDatabaseVersion: 1 as const, databaseFault: "archive" as const, error: "injected archive rename" },
    { legacyDatabaseVersion: 2 as const, databaseFault: "copy" as const, error: "injected database copy" },
    { legacyDatabaseVersion: 2 as const, databaseFault: "partial-copy" as const, error: "injected partial database copy" },
  ])("compensates SQLite prepare fault $databaseFault without outer double rollback", ({ legacyDatabaseVersion, databaseFault, error }) => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, legacyDatabaseVersion, databaseFault });
    expect(outcome.failure).toContain(error);
    expect(outcome.failure).not.toContain("rollback incomplete");
    expect(outcome.database).toBe(outcome.originalDatabase);
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("active");
    expect(outcome.stateEntries.some((name: string) => name.includes(".legacy-v"))).toBe(false);
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "restart")).toHaveLength(1);
    expect(outcome.restartObservations).toEqual([
      { deployment: "prior", databaseMatchesOriginal: true, configMatchesOriginal: true },
    ]);
  }, 120_000);

  it.each([
    ...([1, 2] as const).flatMap(legacyDatabaseVersion => (["", "-wal", "-shm"] as const)
      .map(databaseFaultSuffix => ({ legacyDatabaseVersion, databaseFaultSuffix, databaseFault: "archive" as const }))),
    ...(["copy", "partial-copy"] as const).flatMap(databaseFault => (["", "-wal", "-shm"] as const)
      .map(databaseFaultSuffix => ({ legacyDatabaseVersion: 2 as const, databaseFaultSuffix, databaseFault }))),
  ])("restores real SQLite namespace after v$legacyDatabaseVersion $databaseFault fault on '$databaseFaultSuffix'", row => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, databaseSidecars: true, ...row });
    expect(outcome.failure).toContain(row.databaseFault === "archive" ? "injected archive rename" :
      row.databaseFault === "copy" ? "injected database copy" : "injected partial database copy");
    expect(outcome.originalNamespace.every((value: string | null) => value !== null)).toBe(true);
    expect(outcome.databaseNamespace.map((value: string | null, index: number) =>
      value === outcome.originalNamespace[index])).toEqual([true, true, true]);
    expect(outcome.restartObservations).toEqual([
      { deployment: "prior", databaseMatchesOriginal: true, configMatchesOriginal: true },
    ]);
    expect(outcome.stateEntries.some((name: string) => name.includes(".legacy-v"))).toBe(false);
  }, 120_000);

  it.each(["-wal", "-shm"] as const)("isolates version probe and preserves original absence of %s", absentOriginalSidecar => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      databaseSidecars: true, absentOriginalSidecar, databaseFault: "archive", databaseFaultSuffix: "",
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected archive rename");
    expect(outcome.originalNamespace[["", "-wal", "-shm"].indexOf(absentOriginalSidecar)]).toBeNull();
    expect(outcome.databaseNamespace.map((value: string | null, index: number) =>
      value === outcome.originalNamespace[index])).toEqual([true, true, true]);
    expect(outcome.stateEntries.some((name: string) => name.startsWith(".installer-sqlite-probe."))).toBe(false);
    expect(outcome.restartObservations).toEqual([
      { deployment: "prior", databaseMatchesOriginal: true, configMatchesOriginal: true },
    ]);
  }, 120_000);

  it("selects v2 copy from a committed WAL schema version rather than the primary file header", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      databaseSidecars: true, versionInWal: 2, databaseFault: "copy", databaseFaultSuffix: "-wal",
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected database copy");
    expect(Buffer.from(outcome.originalDatabase, "base64").readUInt32BE(60)).toBe(1);
    expect(outcome.databaseNamespace.map((value: string | null, index: number) =>
      value === outcome.originalNamespace[index])).toEqual([true, true, true]);
    expect(outcome.restartObservations).toEqual([
      { deployment: "prior", databaseMatchesOriginal: true, configMatchesOriginal: true },
    ]);
  }, 120_000);

  it.each([false, true])("legacy root discovery preserves exact original SQLite namespace (absent SHM=%s)", absentShm => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify({
      version: 1, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
      repositoryRoots: [fixture.project], referenceRoots: [],
    }));
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      legacyDatabaseVersion: 1, legacyRootInWal: true, databaseSidecars: true,
      ...(absentShm ? { absentOriginalSidecar: "-shm" as const } : {}),
      readiness: { ready: true, blockers: [] }, failRestart: true });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).not.toContain("rollback incomplete");
    expect(outcome.databaseNamespace).toEqual(outcome.originalNamespace);
    expect(outcome.originalNamespace[2] === null).toBe(absentShm);
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.stateEntries.some((name: string) => name.startsWith(".installer-sqlite-probe."))).toBe(false);
    expect(outcome.activity).toBe("active");
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate", "prior"]);
  }, 120_000);

  it.each([1, 2] as const)("refuses v%i startup when an unexpected sidecar appears before service activation", legacyDatabaseVersion => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion,
      databaseSidecars: true, databaseFault: "pre-start-replaced", databaseFaultSuffix: "-wal",
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("installer database identity changed or missing");
    expect(outcome.failure).toContain("ambiguous installer database candidate retained");
    expect(outcome.failure).toContain("rollback incomplete");
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-wal"), "utf8")).toBe("unexpected pre-start file");
    const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3-wal.legacy-v"));
    expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64") === outcome.originalNamespace[1]).toBe(true);
    expect(outcome.databaseNamespace[0] === outcome.originalNamespace[0]).toBe(true);
    expect(outcome.databaseNamespace[2] === outcome.originalNamespace[2]).toBe(true);
    expect(outcome.restartObservations).toEqual([]);
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it.each(["archive-drift", "archive-symlink"] as const)(
    "blocks otherwise healthy installer commit when SQLite archive custody changes: %s", databaseFault => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
        databaseSidecars: true, candidateSidecars: true, databaseFault, databaseFaultSuffix: "-wal",
        readiness: { ready: true, blockers: [] } });
      expect(outcome.failure).not.toBeNull();
      expect(outcome.failure).toContain("database restoration incomplete");
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(outcome.activity).toBe("inactive");
      expect(outcome.stateEntries.some((name: string) => name.startsWith("order.sqlite3-wal.legacy-v1."))).toBe(true);
    }, 120_000);

  it("preserves a replaced candidate after health observation and before commit", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      databaseSidecars: true, candidateSidecars: true, databaseFault: "candidate-drift-after-health",
      databaseFaultSuffix: "-shm", readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected candidate replacement before commit");
    expect(outcome.failure).toContain("ambiguous installer database candidate retained");
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-shm"), "utf8")).toBe("unexpected replacement");
    const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3-shm.legacy-v1."));
    expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64") === outcome.originalNamespace[2]).toBe(true);
    expect(outcome.databaseNamespace[0] === outcome.originalNamespace[0]).toBe(true);
    expect(outcome.databaseNamespace[1] === outcome.originalNamespace[1]).toBe(true);
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it.each(["pre-start-content-drift", "pre-start-disappearance"] as const)(
    "preserves v2 sidecar and original archive after quiesced custody violation: %s", databaseFault => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 2,
        databaseSidecars: true, databaseFault, databaseFaultSuffix: "-wal",
        readiness: { ready: true, blockers: [] } });
      expect(outcome.failure).toContain("database restoration incomplete");
      expect(outcome.restartObservations).toEqual([]);
      expect(outcome.activity).toBe("inactive");
      const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3-wal.legacy-v2."));
      expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64")).toBe(outcome.originalNamespace[1]);
      const candidate = join(fixture.stateRoot, "order.sqlite3-wal");
      if (databaseFault === "pre-start-content-drift") {
        expect(readFileSync(candidate).subarray(-"unexpected same-inode bytes".length).toString()).toBe("unexpected same-inode bytes");
      } else {
        expect(existsSync(candidate)).toBe(false);
        expect(readFileSync(candidate + ".retained-candidate").toString("base64")).toBe(outcome.originalNamespace[1]);
      }
    }, 120_000);

  it.each([1, 2] as const)("restores v%i archive after legitimate WAL/SHM evolution on service stop", legacyDatabaseVersion => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion,
      databaseSidecars: true, candidateSidecars: true, gracefulCandidateStop: true, failRestart: true,
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).not.toContain("rollback incomplete");
    expect(outcome.databaseNamespace).toEqual(outcome.originalNamespace);
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate", "prior"]);
    expect(outcome.activity).toBe("active");
    expect(outcome.stdout.indexOf("Order installation maintenance:")).toBeGreaterThanOrEqual(0);
    expect(outcome.stdout.indexOf("Order installation maintenance:")).toBeLessThan(outcome.stdout.indexOf("installing pinned runtimes"));
  }, 120_000);

  it("refuses a healthy candidate with aliased WAL/SHM paths without deleting either", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      databaseSidecars: true, candidateSidecars: true, databaseFault: "sidecar-alias",
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("database candidate custody unavailable");
    expect(outcome.failure).toContain("database restoration incomplete");
    expect(outcome.activity).toBe("inactive");
    const wal = lstatSync(join(fixture.stateRoot, "order.sqlite3-wal"));
    const shm = lstatSync(join(fixture.stateRoot, "order.sqlite3-shm"));
    expect(wal.ino).toBe(shm.ino);
    for (const suffix of ["-wal", "-shm"]) {
      expect(outcome.stateEntries.some((name: string) => name.startsWith("order.sqlite3" + suffix + ".legacy-v1."))).toBe(true);
    }
  }, 120_000);

  it("rejects sidecar replacement during marker preparation before publication", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      databaseSidecars: true, candidateSidecars: true, databaseFault: "marker-sidecar-replaced", databaseFaultSuffix: "-shm",
      readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("installer database identity changed or missing");
    expect(outcome.failure).toContain("database restoration incomplete");
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
    expect(outcome.activity).toBe("inactive");
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-shm"), "utf8")).toBe("unexpected replacement");
  }, 120_000);

  it.each(["pre-start-replaced", "pre-start-content-drift", "pre-start-disappearance"] as const)(
    "preserves unarchived v3 sidecars and blocks startup on %s", databaseFault => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 3,
        databaseSidecars: true, databaseFault, databaseFaultSuffix: "-wal", readiness: { ready: true, blockers: [] } });
      expect(outcome.failure).toContain("unarchived database custody incomplete");
      expect(outcome.restartObservations).toEqual([]);
      expect(outcome.activity).toBe("inactive");
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(outcome.stateEntries.some((name: string) => name.includes(".legacy-v"))).toBe(false);
      const target = join(fixture.stateRoot, "order.sqlite3-wal");
      if (databaseFault === "pre-start-disappearance") {
        expect(existsSync(target)).toBe(false);
        expect(readFileSync(target + ".retained-candidate").toString("base64")).toBe(outcome.originalNamespace[1]);
      } else if (databaseFault === "pre-start-replaced") {
        expect(readFileSync(target, "utf8")).toBe("unexpected pre-start file");
      } else {
        expect(readFileSync(target).subarray(-"unexpected same-inode bytes".length).toString()).toBe("unexpected same-inode bytes");
      }
    }, 120_000);

  it("blocks v3 prior restart on detectable sidecar replacement during compensation without inventing an archive", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 3,
      databaseSidecars: true, databaseFault: "candidate-drift", databaseFaultSuffix: "-wal",
      failRestart: true, readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("unarchived database custody incomplete");
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.stateEntries.some((name: string) => name.includes(".legacy-v"))).toBe(false);
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-wal"), "utf8")).toBe("unexpected replacement");
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-wal.retained-candidate")).toString("base64")).toBe(outcome.originalNamespace[1]);
  }, 120_000);

  it.each(["success", "migration-rejected", "activation-failed"] as const)(
    "executes actual v2 repository-native migration in the installer: %s", scenario => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const legacyRoot = tempDir("order-transaction-legacy-work-items-");
      const config = { version: 2, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [fixture.project], referenceRoots: [], workItemRoot: legacyRoot };
      writeFileSync(join(fixture.stateRoot, "config.json"), JSON.stringify(config), { mode: 0o600 });
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        repositoryNativeV2: { root: legacyRoot, activeExecution: scenario === "migration-rejected" },
        databaseSidecars: true, failRestart: scenario === "activation-failed",
        readiness: { ready: true, blockers: [] } });
      const source = readFileSync(join(legacyRoot, "legacy.md"));
      const path = "docs/order/work-items/work_11111111-1111-4111-8111-111111111111/work-request.md";
      const document = join(fixture.project, path);
      if (scenario === "migration-rejected") {
        expect(outcome.failure).toContain("migration is prohibited while post-signoff execution is active");
        expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["prior"]);
        expect(existsSync(document)).toBe(false);
      } else {
        expect(outcome.migrationObservation).toMatchObject({ version: 3, workItem: { stage: "R1", archived: 0 },
          source: { sourcePath: path }, document: source.toString("base64") });
        expect(readFileSync(document)).toEqual(source);
      }
      if (scenario === "success") {
        expect(outcome.failure).toBeNull();
        expect(outcome.marker).toBe(outcome.sourceCommit + "\n");
        expect(outcome.config).toEqual({ version: 4, model: config.model,
          repositoryRoots: config.repositoryRoots, referenceRoots: [] });
        for (const [index, suffix] of ["", "-wal", "-shm"].entries()) {
          const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3" + suffix + ".legacy-v2."));
          expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64")).toBe(outcome.originalNamespace[index]);
        }
      } else {
        if (scenario === "activation-failed") expect(outcome.failure).toContain("injected host failure");
        expect(outcome.failure).not.toContain("rollback incomplete");
        expect(outcome.databaseNamespace).toEqual(outcome.originalNamespace);
        expect(outcome.configBytes).toBe(outcome.originalConfig);
        expect(outcome.marker).toBe("b".repeat(40) + "\n");
        expect(outcome.activity).toBe("active");
      }
      expect(readFileSync(join(legacyRoot, "legacy.md"))).toEqual(source);
    }, 120_000);

  it("does not mutate or archive a current v3 database with WAL/SHM present", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 3,
      databaseSidecars: true, failRestart: true, readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.databaseNamespace.map((value: string | null, index: number) =>
      value === outcome.originalNamespace[index])).toEqual([true, true, true]);
    expect(outcome.stateEntries.some((name: string) => name.includes(".legacy-v") || name.startsWith(".installer-sqlite-probe."))).toBe(false);
    expect(outcome.activity).toBe("active");
  }, 120_000);

  it.each(["-wal", "-shm"] as const)("retains exact original after partial copy and compensation failure at %s", databaseFaultSuffix => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 2,
      databaseSidecars: true, databaseFault: "copy-and-restore", databaseFaultSuffix,
      readiness: { ready: true, blockers: [] } });
    const index = ["", "-wal", "-shm"].indexOf(databaseFaultSuffix);
    const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3" + databaseFaultSuffix + ".legacy-v2."));
    expect(outcome.failure).toContain("injected partial database copy");
    expect(outcome.failure).toContain("injected archive restoration");
    expect(outcome.failure).toContain("database inspection or preparation custody incomplete");
    expect(outcome.failure.indexOf("injected partial database copy")).toBeLessThan(outcome.failure.indexOf("injected archive restoration"));
    expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64") === outcome.originalNamespace[index]).toBe(true);
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3" + databaseFaultSuffix), "utf8")).toBe("partial candidate");
    expect(outcome.databaseNamespace.map((value: string | null, j: number) =>
      j === index || value === outcome.originalNamespace[j])).toEqual([true, true, true]);
    expect(outcome.restartObservations).toEqual([]);
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it.each([1, 2] as const)("restores all original v%i DB/WAL/SHM bytes after candidate restart fails", legacyDatabaseVersion => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion,
      databaseSidecars: true, candidateSidecars: true, failRestart: true, readiness: { ready: true, blockers: [] } });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.databaseNamespace.map((value: string | null, index: number) =>
      value === outcome.originalNamespace[index])).toEqual([true, true, true]);
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate", "prior"]);
    expect(outcome.activity).toBe("active");
  }, 120_000);

  it.each(["", "-wal", "-shm"] as const)("restores independent original files after late archive restore fails at '%s'", databaseFaultSuffix => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      databaseSidecars: true, candidateSidecars: true, databaseFault: "restore", databaseFaultSuffix,
      failRestart: true, readiness: { ready: true, blockers: [] } });
    const index = ["", "-wal", "-shm"].indexOf(databaseFaultSuffix);
    const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3" + databaseFaultSuffix + ".legacy-v1."));
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("injected archive restoration");
    expect(outcome.failure.indexOf("injected host failure")).toBeLessThan(outcome.failure.indexOf("injected archive restoration"));
    expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64") === outcome.originalNamespace[index]).toBe(true);
    expect(outcome.databaseNamespace.map((value: string | null, j: number) =>
      j === index || value === outcome.originalNamespace[j])).toEqual([true, true, true]);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
  }, 120_000);

  it.each(["-wal", "-shm"] as const)("retains a newly created sidecar on unlink failure at %s", databaseFaultSuffix => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes", legacyDatabaseVersion: 1,
      candidateSidecars: true, databaseFault: "unlink", databaseFaultSuffix,
      failRestart: true, readiness: { ready: true, blockers: [] } });
    const index = ["", "-wal", "-shm"].indexOf(databaseFaultSuffix);
    expect(outcome.failure).toContain("injected candidate unlink");
    expect(outcome.originalNamespace.slice(1)).toEqual([null, null]);
    expect(outcome.databaseNamespace[index]).not.toBeNull();
    expect(outcome.databaseNamespace[0]).toBe(outcome.originalDatabase);
    expect(outcome.databaseNamespace[index === 1 ? 2 : 1]).toBeNull();
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it.each(["archive-drift", "archive-symlink", "candidate-drift", "copy-replaced"] as const)(
    "preserves ambiguous SQLite recovery material: %s", databaseFault => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const databaseFaultSuffix = "-wal";
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        legacyDatabaseVersion: databaseFault === "copy-replaced" ? 2 : 1,
        databaseSidecars: true, candidateSidecars: true, databaseFault, databaseFaultSuffix,
        failRestart: true, readiness: { ready: true, blockers: [] } });
      expect(outcome.failure).toContain("rollback incomplete");
      expect(outcome.failure).toContain(join(fixture.stateRoot, "order.sqlite3-wal"));
      expect(outcome.databaseNamespace[0] === outcome.originalNamespace[0]).toBe(true);
      expect(outcome.databaseNamespace[2] === outcome.originalNamespace[2]).toBe(true);
      expect(outcome.databaseNamespace[1]).not.toBeNull();
      if (databaseFault === "copy-replaced" || databaseFault === "candidate-drift") {
        expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-wal"), "utf8")).toBe("unexpected replacement");
        expect(existsSync(join(fixture.stateRoot, "order.sqlite3-wal.retained-candidate"))).toBe(true);
      }
      expect(outcome.stateEntries.some((name: string) => name.startsWith("order.sqlite3-wal.legacy-v"))).toBe(true);
      expect(outcome.activity).toBe("inactive");
      expect(outcome.restartObservations.every((entry: { deployment: string }) => entry.deployment === "candidate")).toBe(true);
    }, 120_000);

  it("retains the exact archive and blocks restart after primary copy and secondary compensation failure", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, legacyDatabaseVersion: 2, databaseFault: "copy-and-restore" });
    expect(outcome.failure).toContain("injected partial database copy");
    expect(outcome.failure).toContain("database inspection or preparation custody incomplete");
    const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3.legacy-v2."));
    expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64")).toBe(outcome.originalDatabase);
    expect(readFileSync(join(fixture.stateRoot, "order.sqlite3"), "utf8")).toBe("partial candidate");
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.events.some((event: { command: string[] }) => event.command[0] === "restart")).toBe(false);
  }, 120_000);

  it.each(["restore", "unlink"] as const)("preserves recovery bytes on late SQLite %s failure", databaseFault => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, legacyDatabaseVersion: 1, databaseFault, failRestart: true });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("database restoration incomplete");
    if (databaseFault === "restore") {
      const archive = outcome.stateEntries.find((name: string) => name.startsWith("order.sqlite3.legacy-v1."));
      expect(readFileSync(join(fixture.stateRoot, archive)).toString("base64")).toBe(outcome.originalDatabase);
    } else {
      expect(outcome.database).toBe(outcome.originalDatabase);
      expect(readFileSync(join(fixture.stateRoot, "order.sqlite3-wal"), "utf8")).toBe("invocation-created sidecar");
    }
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "restart")).toHaveLength(1);
  }, 120_000);

  it.each([1, 2, 3] as const)("restores exact database bytes for version %i on established activation failure", legacyDatabaseVersion => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, legacyDatabaseVersion, failRestart: true });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.database).toBe(outcome.originalDatabase);
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
    expect(outcome.activity).toBe("active");
    expect(outcome.stateEntries.some((name: string) => name.includes(".legacy-v"))).toBe(false);
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate", "prior"]);
    expect(outcome.restartObservations[1]).toEqual({
      deployment: "prior", databaseMatchesOriginal: true, configMatchesOriginal: true,
    });
  }, 120_000);

  it.each([1, 2] as const)("preserves candidate and retained v%i archive when database rollback cannot prove original", legacyDatabaseVersion => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, legacyDatabaseVersion, failRestart: true, loseDatabaseArchive: true });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("database restoration incomplete");
    expect(outcome.database).not.toBe(outcome.originalDatabase);
    expect(readFileSync(outcome.retainedArchive).toString("base64")).toBe(outcome.originalDatabase);
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "restart")).toHaveLength(1);
  }, 120_000);

  it.each(["dangling-symlink", "symlink", "directory", "fifo", "insecure-mode", "foreign-owner", "malformed", "legacy-root-absent"] as const)(
    "rejects unsafe or invalid present config without mutation: %s", kind => {
      const fixture = transactionFixture();
      createPriorDeployment(fixture);
      const target = join(fixture.stateRoot, "config.json");
      const original = readFileSync(target);
      if (kind === "dangling-symlink" || kind === "symlink") {
        rmSync(target);
        const link = join(fixture.stateRoot, "config-source");
        if (kind === "symlink") writeFileSync(link, original, { mode: 0o600 });
        symlinkSync(link, target);
      } else if (kind === "directory" || kind === "fifo") {
        rmSync(target);
        if (kind === "directory") mkdirSync(target);
        else run(["mkfifo", target], fixture.stateRoot);
      } else if (kind === "insecure-mode") chmodSync(target, 0o644);
      else if (kind === "malformed") writeFileSync(target, "{invalid");
      else if (kind === "legacy-root-absent") writeFileSync(target, JSON.stringify({
        version: 1, model: { providerID: "opencode", id: "glm-5.3-flash-free" },
        repositoryRoots: [join(fixture.stateRoot, "missing-legacy-root")], referenceRoots: [],
      }));
      const before = lstatSync(target);
      const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
        readiness: { ready: true, blockers: [] }, configOwnerMismatch: kind === "foreign-owner" });
      expect(outcome.failure).not.toBeNull();
      expect(outcome.configIdentity).toBe(outcome.originalConfigIdentity);
      expect(outcome.configMode).toBe(outcome.originalConfigMode);
      expect(outcome.configBytes).toBe(outcome.originalConfig);
      expect(lstatSync(target).ino).toBe(before.ino);
      expect(outcome.marker).toBe("b".repeat(40) + "\n");
      expect(outcome.restartObservations.some((entry: { deployment: string }) => entry.deployment === "candidate")).toBe(false);
      expect(outcome.stdout).not.toContain("Order updated successfully.");
      if (kind === "foreign-owner") expect(outcome.failure).toContain("owned by the current user");
      if (kind === "insecure-mode") expect(outcome.failure).toContain("group or other access");
      if (kind === "legacy-root-absent") expect(outcome.failure).toContain("ENOENT");
      if (kind === "symlink") expect(readFileSync(join(fixture.stateRoot, "config-source"))).toEqual(original);
    }, 120_000);

  it.each(["publication-write", "publication-file-sync"] as const)("removes only owned incomplete configuration temporary: %s", configFault => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const target = join(fixture.stateRoot, "config.json");
    chmodSync(target, 0o400);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault });
    expect(outcome.failure).toContain("injected configuration publication");
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.configIdentity).toBe(outcome.originalConfigIdentity);
    expect(outcome.configMode & 0o777).toBe(0o400);
    expect(outcome.stateEntries.some((name: string) => name.startsWith("config.json.tmp.") || name.includes(".installer-recovery."))).toBe(false);
    expect(outcome.activity).toBe("active");
  }, 120_000);

  it.each(["snapshot-changed", "publication-target-drift"] as const)("preserves original recovery and identical-byte replacement: %s", configFault => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault });
    expect(outcome.failure).toContain("identity or bytes changed");
    expect(outcome.failure).toContain("rollback incomplete");
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.configIdentity).not.toBe(outcome.originalConfigIdentity);
    const recovery = outcome.stateEntries.find((name: string) => name.startsWith("config.json.installer-recovery."));
    expect(readFileSync(join(fixture.stateRoot, recovery)).toString("base64")).toBe(outcome.originalConfig);
    expect(outcome.restartObservations).toEqual([]);
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it("rejects valid identical-byte publication replacement before canonical readback", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault: "publication-readback-drift" });
    expect(outcome.failure).toContain("identity or bytes changed");
    expect(outcome.failure).toContain("rollback incomplete");
    expect(outcome.restartObservations).toEqual([]);
    expect(outcome.activity).toBe("inactive");
    const recovery = outcome.stateEntries.find((name: string) => name.startsWith("config.json.installer-recovery."));
    expect(readFileSync(join(fixture.stateRoot, recovery)).toString("base64")).toBe(outcome.originalConfig);
    expect(readFileSync(join(fixture.stateRoot, "config.json.retained-publication"))).toEqual(
      readFileSync(join(fixture.stateRoot, "config.json")));
  }, 120_000);

  it("retains an unexpectedly replaced publication temporary without deleting it", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault: "publication-temp-replaced" });
    expect(outcome.failure).toContain("ambiguous configuration temporary retained");
    expect(outcome.configIdentity).toBe(outcome.originalConfigIdentity);
    const replacement = outcome.stateEntries.find((name: string) => name.startsWith("config.json.tmp.") && !name.endsWith(".retained-original"));
    expect(readFileSync(join(fixture.stateRoot, replacement), "utf8")).toBe("unexpected temporary");
    expect(outcome.activity).toBe("active");
  }, 120_000);

  it.each(["restore-write", "restore-file-sync"] as const)("retains exact original recovery when restore temporary fails: %s", configFault => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault, failRestart: true });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("restore temporary retained at");
    expect(outcome.failure).toContain("injected configuration restore");
    const recovery = outcome.stateEntries.find((name: string) => name.startsWith("config.json.installer-recovery."));
    expect(readFileSync(join(fixture.stateRoot, recovery)).toString("base64")).toBe(outcome.originalConfig);
    expect(outcome.stateEntries.some((name: string) => name.startsWith("config.json.installer-restore."))).toBe(true);
    expect(outcome.restartObservations.map((entry: { deployment: string }) => entry.deployment)).toEqual(["candidate"]);
    expect(outcome.activity).toBe("inactive");
  }, 120_000);

  it.each(["publication", "publication-sync"] as const)("preserves original config bytes after %s failure", configFault => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault });
    expect(outcome.failure).toContain("injected configuration publication");
    expect(outcome.configBytes).toBe(outcome.originalConfig);
    expect(outcome.marker).toBe("b".repeat(40) + "\n");
    expect(outcome.activity).toBe("active");
    expect(outcome.stateEntries.some((name: string) => name.startsWith("config.json.installer-recovery."))).toBe(false);
  }, 120_000);

  it.each(["snapshot-sync", "snapshot-file-sync", "restore", "restore-sync"] as const)("retains private recovery bytes and prevents restart after %s failure", configFault => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault, failRestart: true });
    expect(outcome.failure).toContain("configuration");
    expect(outcome.failure).toContain("rollback incomplete");
    const recovery = outcome.stateEntries.find((name: string) => name.startsWith("config.json.installer-recovery."));
    expect(readFileSync(join(fixture.stateRoot, recovery)).toString("base64")).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "restart"))
      .toHaveLength(configFault.startsWith("snapshot") ? 0 : 1);
  }, 120_000);

  it("configuration recovery unlink failure after commit is non-destructive", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, configFault: "retire" });
    expect(outcome.failure).toContain("installation committed; finalization incomplete");
    expect(outcome.failure).toContain("injected configuration retirement");
    expect(outcome.marker).toBe(outcome.sourceCommit + "\n");
    expect(outcome.activity).toBe("active");
    const recovery = outcome.stateEntries.find((name: string) => name.startsWith("config.json.installer-recovery."));
    expect(readFileSync(join(fixture.stateRoot, recovery)).toString("base64")).toBe(outcome.originalConfig);
  }, 120_000);

  it("blocks prior service restart when configuration publication identity drifts", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failRestart: true, driftConfig: true });
    expect(outcome.failure).toContain("injected host failure");
    expect(outcome.failure).toContain("configuration restoration incomplete");
    expect(outcome.configBytes).not.toBe(outcome.originalConfig);
    const recovery = outcome.stateEntries.find((name: string) => name.startsWith("config.json.installer-recovery."));
    expect(readFileSync(join(fixture.stateRoot, recovery)).toString("base64")).toBe(outcome.originalConfig);
    expect(outcome.activity).toBe("inactive");
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "restart")).toHaveLength(1);
  }, 120_000);

  it("retains service recovery after post-commit retirement failure", () => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failCleanup: "unit" });
    expect(outcome.failure).toContain("installation committed; finalization incomplete");
    const directory = join(fixture.home, ".config/systemd/user");
    const recovery = readdirSync(directory).find(name => name.startsWith("pontivus-order.service.previous."));
    expect(recovery).toBeDefined();
    expect(outcome.failure).toContain(join(directory, recovery!));
    expect(readFileSync(join(directory, recovery!), "utf8")).toBe("old unit");
    expect(outcome.marker).toBe(outcome.sourceCommit + "\n");
    expect(outcome.activity).toBe("active");
    expect(outcome.appBackups).toHaveLength(1);
    expect(outcome.launcherBackups).toHaveLength(1);
  }, 120_000);

  it.each(["config", "application", "launcher"] as const)("keeps committed deployment after %s retirement fails", failCleanup => {
    const fixture = transactionFixture();
    createPriorDeployment(fixture);
    const outcome = runInstallerTransaction({ ...fixture, establishedHistory: "yes",
      readiness: { ready: true, blockers: [] }, failCleanup });
    expect(outcome.failure).toContain("installation committed; finalization incomplete");
    expect(outcome.marker).toBe(outcome.sourceCommit + "\n");
    expect(outcome.app && outcome.launcher && outcome.unit).toBe(true);
    expect(outcome.activity).toBe("active");
    expect(outcome.stdout).not.toContain("Order updated successfully.");
    expect(outcome.appBackups).toHaveLength(failCleanup === "launcher" ? 0 : 1);
    expect(outcome.launcherBackups).toHaveLength(1);
    expect(outcome.stateEntries.some((name: string) => name.startsWith("config.json.installer-recovery."))).toBe(failCleanup === "config");
    expect(outcome.events.filter((event: { command: string[] }) => event.command[0] === "stop")).toHaveLength(1);
  }, 120_000);

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
