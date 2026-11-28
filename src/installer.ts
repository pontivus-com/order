import { createInterface } from "node:readline/promises";
import {
  chmodSync,
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  openSync,
  realpathSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";

import type { InstallerConfigPublication, InstallerConfigSnapshot, InstallerManifestCustody, InstallerManifestEffects } from "./shell/setup.ts";
import type { InstallerDatabaseCustody, LegacyDatabaseArchive } from "./shell/sqlite.ts";

const bunVersion = "1.4.4";
const nodeVersion = "26.13.0";
const openCodeVersion = "2.2.6";

type InstallerArguments = Readonly<{
  sourceRoot: string;
  sourceCommit: string;
}>;

type InstallerSourceKind = "GIT_CHECKOUT" | "RELEASE_BUNDLE";

type InstallerLocations = Readonly<{
  home: string;
  installRoot: string;
  binDir: string;
  stateRoot: string;
  bind: string;
  userConfigHome: string;
}>;

const fail = (message: string): never => {
  throw new TypeError(message);
};

const decode = (bytes: Uint8Array | undefined): string =>
  bytes === undefined ? "" : new TextDecoder("utf-8", { fatal: true }).decode(bytes);

const runCommand = (
  argv: readonly string[],
  cwd: string,
  environment: NodeJS.ProcessEnv = process.env,
  terminal = false,
): string => {
  const result = Bun.spawnSync([...argv], {
    cwd,
    env: { ...environment },
    stdin: terminal ? "inherit" : "ignore",
    stdout: terminal ? "inherit" : "pipe",
    stderr: terminal ? "inherit" : "pipe",
  });
  if (result.exitCode !== 0) {
    const stderr = terminal ? "" : decode(result.stderr).trim();
    const detail = stderr.length === 0 ? "" : ": " + stderr;
    fail("command failed (" + argv.join(" ") + ")" + detail);
  }
  return terminal ? "" : decode(result.stdout);
};

const commandSucceeds = (
  argv: readonly string[],
  cwd: string,
  environment: NodeJS.ProcessEnv = process.env,
): boolean => {
  const result = Bun.spawnSync([...argv], {
    cwd,
    env: { ...environment },
    stdin: "ignore",
    stdout: "ignore",
    stderr: "ignore",
  });
  return result.exitCode === 0;
};

const requireHostCommand = (name: string, cwd: string): void => {
  if (!commandSucceeds(["sh", "-c", "command -v " + name], cwd)) {
    fail("required host command is unavailable: " + name);
  }
};

const requireAbsolute = (name: string, value: string): string => {
  if (!isAbsolute(value) || value.includes("\0") || value.includes("\n") || value.includes("\r")) {
    fail(name + " must be a safe absolute path");
  }
  return value;
};

const parseArguments = (argv: readonly string[]): InstallerArguments => {
  if (
    argv.length !== 4 ||
    argv[0] !== "--source-root" ||
    argv[2] !== "--source-commit" ||
    argv[1] === undefined ||
    argv[3] === undefined
  ) {
    fail("installer requires --source-root <absolute-path> --source-commit <git-commit>");
  }
  return {
    sourceRoot: requireAbsolute("source root", argv[1]),
    sourceCommit: argv[3],
  };
};

const resolveLocations = (environment: NodeJS.ProcessEnv): InstallerLocations => {
  const home = environment.HOME;
  if (home === undefined || home.length === 0) {
    throw new TypeError("HOME is required");
  }
  const absoluteHome = requireAbsolute("HOME", home);
  const installRoot = requireAbsolute(
    "PONTIVUS_ORDER_INSTALL_ROOT",
    environment.PONTIVUS_ORDER_INSTALL_ROOT ?? join(absoluteHome, ".local", "share", "pontivus-order"),
  );
  const binDir = requireAbsolute(
    "PONTIVUS_ORDER_BIN_DIR",
    environment.PONTIVUS_ORDER_BIN_DIR ?? join(absoluteHome, ".local", "bin"),
  );
  const stateRoot = requireAbsolute(
    "PONTIVUS_ORDER_STATE_ROOT",
    environment.PONTIVUS_ORDER_STATE_ROOT ??
      join(environment.XDG_STATE_HOME ?? join(absoluteHome, ".local", "state"), "pontivus-order"),
  );
  const userConfigHome = requireAbsolute(
    "XDG_CONFIG_HOME",
    environment.XDG_CONFIG_HOME ?? join(absoluteHome, ".config"),
  );
  return {
    home: absoluteHome,
    installRoot,
    binDir,
    stateRoot,
    bind: environment.PONTIVUS_ORDER_BIND ?? "127.0.0.1:7347",
    userConfigHome,
  };
};

const downloadBytes = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    fail("download failed: " + url + " (HTTP " + response.status + ")");
  }
  return new Uint8Array(await response.arrayBuffer());
};

const downloadText = async (url: string): Promise<string> =>
  new TextDecoder("utf-8", { fatal: true }).decode(await downloadBytes(url));

const sha256Hex = (bytes: Uint8Array): string => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(bytes);
  return hasher.digest("hex");
};

const shellQuote = (value: string): string =>
  "'" + value.replaceAll("'", "'\"'\"'") + "'";

const systemdQuote = (value: string): string =>
  '"' + value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("%", "%%") + '"';

export const buildLauncherScript = (
  locations: Pick<InstallerLocations, "installRoot" | "stateRoot" | "bind">,
): string => {
  const bun = join(locations.installRoot, "runtime", "bun", "bin", "bun");
  const nodeBin = join(locations.installRoot, "runtime", "node", "bin");
  const bunBin = join(locations.installRoot, "runtime", "bun", "bin");
  const openCode = join(locations.installRoot, "runtime", "opencode", "opencode");
  const cli = join(locations.installRoot, "app", "src", "cli.ts");
  return [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "export PATH=" + shellQuote(nodeBin) + ":" + shellQuote(bunBin) + ':"$PATH"',
    "export PONTIVUS_ORDER_OPENCODE_BIN=" + shellQuote(openCode),
    "export PONTIVUS_ORDER_STATE_ROOT=" + shellQuote(locations.stateRoot),
    "export PONTIVUS_ORDER_BIND=" + shellQuote(locations.bind),
    "exec " + shellQuote(bun) + " " + shellQuote(cli) + ' "$@"',
    "",
  ].join("\n");
};

export const buildUserServiceUnit = (launcher: string): string =>
  [
    "[Unit]",
    "Description=Pontivus Order local daemon",
    "After=default.target",
    "",
    "[Service]",
    "Type=simple",
    "ExecStart=" + systemdQuote(launcher) + " daemon",
    "Restart=on-failure",
    "RestartSec=2",
    "",
    "[Install]",
    "WantedBy=default.target",
    "",
  ].join("\n");

const terminalQuestion = async (prompt: string): Promise<string> => {
  const input = createInterface({ input: process.stdin, output: process.stdout });
  const cancellation = new AbortController();
  const cancel = () => cancellation.abort();
  input.once("close", cancel);
  input.once("SIGINT", cancel);
  try {
    return await input.question(prompt, { signal: cancellation.signal });
  } finally {
    input.removeListener("close", cancel);
    input.removeListener("SIGINT", cancel);
    input.close();
  }
};

const step = (message: string): void => {
  process.stdout.write("\nOrder installer — " + message + "\n");
};

const writeProfilePath = (home: string, binDir: string): void => {
  if (binDir !== join(home, ".local", "bin")) return;
  const profile = join(home, ".profile");
  const marker = "# Order user-local launcher";
  if (existsSync(profile)) {
    const current = readFileSync(profile, "utf8");
    if (current.includes(marker)) return;
    if (current.includes("# Gateweft user-local launcher")) {
      writeFileSync(profile, current.replace("# Gateweft user-local launcher", marker), "utf8");
      return;
    }
  }
  const addition = [
    "",
    marker,
    'case ":$PATH:" in',
    '  *":$HOME/.local/bin:"*) ;;',
    '  *) PATH="$HOME/.local/bin:$PATH" ;;',
    "esac",
    "export PATH",
    "",
  ].join("\n");
  writeFileSync(profile, addition, { encoding: "utf8", flag: "a" });
};

const runtimeEnvironment = (
  locations: InstallerLocations,
): NodeJS.ProcessEnv => ({
  ...process.env,
  PATH:
    join(locations.installRoot, "runtime", "node", "bin") +
    ":" +
    join(locations.installRoot, "runtime", "bun", "bin") +
    ":" +
    (process.env.PATH ?? ""),
  PONTIVUS_ORDER_OPENCODE_BIN: join(
    locations.installRoot,
    "runtime",
    "opencode",
    "opencode",
  ),
  PONTIVUS_ORDER_STATE_ROOT: locations.stateRoot,
  PONTIVUS_ORDER_BIND: locations.bind,
});

const verifySource = (
  sourceRoot: string,
  sourceCommit: string,
): InstallerSourceKind => {
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
    fail("installer source commit must be an exact lowercase Git commit");
  }

  const repositoryRoot = commandSucceeds(
    ["git", "-C", sourceRoot, "rev-parse", "--show-toplevel"],
    sourceRoot,
  )
    ? runCommand(
        ["git", "-C", sourceRoot, "rev-parse", "--show-toplevel"],
        sourceRoot,
      ).trim()
    : null;

  if (repositoryRoot === sourceRoot) {
    if (
      runCommand(["git", "-C", sourceRoot, "rev-parse", "HEAD"], sourceRoot).trim() !==
        sourceCommit
    ) {
      fail("installer source commit changed after bootstrap");
    }
    if (!commandSucceeds(["git", "-C", sourceRoot, "diff", "--quiet", "--"], sourceRoot)) {
      fail("refusing to install from a checkout with unstaged changes");
    }
    if (
      !commandSucceeds(
        ["git", "-C", sourceRoot, "diff", "--cached", "--quiet", "--"],
        sourceRoot,
      )
    ) {
      fail("refusing to install from a checkout with staged changes");
    }
    return "GIT_CHECKOUT";
  }

  const releaseManifestPath = join(sourceRoot, "RELEASE.json");
  if (!existsSync(releaseManifestPath)) {
    fail("installer source must be a clean Order Git checkout or extracted Order release bundle");
  }

  let releaseManifest: unknown;
  try {
    releaseManifest = JSON.parse(readFileSync(releaseManifestPath, "utf8"));
  } catch {
    fail("release bundle contains an invalid RELEASE.json");
  }
  if (
    releaseManifest === null ||
    typeof releaseManifest !== "object" ||
    Array.isArray(releaseManifest)
  ) {
    fail("release bundle contains an invalid RELEASE.json");
  }
  const releaseRecord = releaseManifest as Record<string, unknown>;
  if (
    Object.keys(releaseRecord).sort().join(",") !== "gitCommit,version" ||
    typeof releaseRecord.version !== "string" ||
    !/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(releaseRecord.version) ||
    typeof releaseRecord.gitCommit !== "string" ||
    !/^[0-9a-f]{40}$/.test(releaseRecord.gitCommit)
  ) {
    fail("release bundle contains an invalid RELEASE.json");
  }
  if (releaseRecord.gitCommit !== sourceCommit) {
    fail("release bundle commit does not match bootstrap source commit");
  }

  let packageJson: unknown;
  try {
    packageJson = JSON.parse(readFileSync(join(sourceRoot, "package.json"), "utf8"));
  } catch {
    fail("release bundle contains an invalid package.json");
  }
  if (
    packageJson === null ||
    typeof packageJson !== "object" ||
    Array.isArray(packageJson) ||
    (packageJson as Record<string, unknown>).version !== releaseRecord.version
  ) {
    fail("release bundle version does not match package.json");
  }
  if (!existsSync(join(sourceRoot, "dist", "index.html"))) {
    fail("release bundle is missing certified dist/index.html");
  }

  return "RELEASE_BUNDLE";
};

const installNode = async (staging: string, sourceRoot: string): Promise<string> => {
  const nodeArch = process.arch === "x64"
    ? "x64"
    : process.arch === "arm64"
      ? "arm64"
      : fail("unsupported Linux architecture: " + process.arch);
  const archive = "node-v" + nodeVersion + "-linux-" + nodeArch + ".tar.xz";
  const base = "https://nodejs.org/dist/v" + nodeVersion;
  const downloads = join(staging, "downloads");
  const archivePath = join(downloads, archive);
  const manifest = await downloadText(base + "/SHASUMS256.txt");
  const line = manifest.split(/\r?\n/).find((value) => value.endsWith("  " + archive));
  const expected = line?.trim().split(/\s+/)[0];
  if (expected === undefined || !/^[0-9a-f]{64}$/.test(expected)) {
    fail("Node checksum manifest does not contain " + archive);
  }
  const bytes = await downloadBytes(base + "/" + archive);
  if (sha256Hex(bytes) !== expected) fail("Node archive SHA-256 verification failed");
  writeFileSync(archivePath, bytes);
  const nodeRoot = join(staging, "runtime", "node");
  mkdirSync(nodeRoot, { recursive: true });
  runCommand(["tar", "-xJf", archivePath, "--strip-components=1", "-C", nodeRoot], sourceRoot);
  const node = join(nodeRoot, "bin", "node");
  if (runCommand([node, "--version"], sourceRoot).trim() !== "v" + nodeVersion) {
    fail("installed Node version does not match v" + nodeVersion);
  }
  return node;
};

const installOpenCode = (
  staging: string,
  sourceRoot: string,
  bun: string,
  node: string,
): string => {
  const runtime = join(staging, "runtime");
  const home = join(runtime, "home");
  const config = join(runtime, "config");
  const cache = join(runtime, "cache");
  const global = join(runtime, "opencode", "global");
  const bin = join(runtime, "opencode", "bin");
  for (const path of [home, config, cache, global, bin]) mkdirSync(path, { recursive: true });
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    HOME: home,
    XDG_CONFIG_HOME: config,
    BUN_INSTALL_GLOBAL_DIR: global,
    BUN_INSTALL_BIN: bin,
    BUN_INSTALL_CACHE_DIR: cache,
    PATH: dirname(bun) + ":" + dirname(node) + ":" + (process.env.PATH ?? ""),
  };
  runCommand(
    [bun, "install", "-g", "--trust", "@opencode/cli@" + openCodeVersion],
    sourceRoot,
    environment,
    true,
  );
  const installed = join(bin, "opencode");
  if (!existsSync(installed)) fail("OpenCode install did not produce the expected binary");
  const materialized = join(runtime, "opencode", "opencode");
  copyFileSync(installed, materialized);
  chmodSync(materialized, 0o755);
  if (runCommand([materialized, "--version"], sourceRoot).trim() !== "opencode v" + openCodeVersion) {
    fail("installed OpenCode version does not match opencode v" + openCodeVersion);
  }
  return materialized;
};

const buildApplication = (
  staging: string,
  sourceRoot: string,
  sourceCommit: string,
  sourceKind: InstallerSourceKind,
  bun: string,
  node: string,
): void => {
  const app = join(staging, "app");
  const downloads = join(staging, "downloads");
  mkdirSync(app, { recursive: true });
  mkdirSync(downloads, { recursive: true });
  const archive = join(downloads, "source.tar");

  if (sourceKind === "GIT_CHECKOUT") {
    runCommand(
      ["git", "-C", sourceRoot, "archive", "--format=tar", "--output=" + archive, sourceCommit],
      sourceRoot,
    );
  } else {
    runCommand(["tar", "-cf", archive, "-C", sourceRoot, "."], sourceRoot);
  }
  runCommand(["tar", "-xf", archive, "-C", app], sourceRoot);

  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    HOME: join(staging, "runtime", "home"),
    XDG_CONFIG_HOME: join(staging, "runtime", "config"),
    BUN_INSTALL_CACHE_DIR: join(staging, "runtime", "cache"),
    PATH:
      dirname(bun) +
      ":" +
      dirname(node) +
      ":" +
      join(staging, "runtime", "opencode", "bin") +
      ":" +
      (process.env.PATH ?? ""),
  };
  runCommand([bun, "ci"], app, environment, true);

  if (sourceKind === "GIT_CHECKOUT") {
    runCommand([node, "node_modules/vite/bin/vite.js", "build"], app, environment, true);
  }
  if (!existsSync(join(app, "dist", "index.html"))) {
    fail(
      sourceKind === "RELEASE_BUNDLE"
        ? "release bundle lost certified dist/index.html during installation"
        : "production build did not create dist/index.html",
    );
  }
};

const configureOrder = async (
  locations: InstallerLocations,
  established: boolean,
  publication: InstallerConfigPublication,
  projectManifestCreated: (custody: InstallerManifestCustody) => void,
  question: typeof terminalQuestion,
  onIncompleteDatabaseInspection: () => void,
  manifestEffects?: InstallerManifestEffects,
) => {
  const setupUrl = pathToFileURL(
    join(locations.installRoot, "app", "src", "shell", "setup.ts"),
  ).href;
  const setupModule = await import(setupUrl) as typeof import("./shell/setup.ts");
  const legacyV2Config = setupModule.readLegacyOrderConfigV2ForInstall(
    locations.stateRoot,
    publication.snapshot,
  );
  const code = await setupModule.runInstallerGuidedSetup(
    runtimeEnvironment(locations),
    (value) => process.stdout.write(value),
    question,
    established,
    publication,
    projectManifestCreated,
    onIncompleteDatabaseInspection,
    manifestEffects,
  );
  if (code !== 0) fail("Order guided configuration did not complete");
  return { setupModule, legacyV2Config } as const;
};

// Invocation-local proof shared by installer-owned regular file effects.
const captureInstallerFile = (path: string) => {
  if (realpathSync(path) !== path) fail("installer file path is not canonical: " + path);
  const entry = lstatSync(path, { bigint: true });
  if (!entry.isFile()) fail("installer file is not a regular file: " + path);
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = fstatSync(descriptor, { bigint: true });
    if (!before.isFile() || before.dev !== entry.dev || before.ino !== entry.ino ||
        before.mode !== entry.mode || before.uid !== entry.uid) fail("installer file identity changed: " + path);
    const bytes = readFileSync(descriptor);
    const after = lstatSync(path, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.mode !== after.mode ||
        before.uid !== after.uid || before.size !== after.size ||
        before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) {
      fail("installer file changed during observation: " + path);
    }
    return { device: before.dev, inode: before.ino, mode: before.mode, uid: before.uid, bytes };
  } finally { closeSync(descriptor); }
};

type InstallerFileIdentity = ReturnType<typeof captureInstallerFile>;

const sameInstallerFile = (observed: InstallerFileIdentity, expected: InstallerFileIdentity): boolean =>
  observed.device === expected.device && observed.inode === expected.inode &&
  observed.mode === expected.mode && observed.uid === expected.uid && observed.bytes.equals(expected.bytes);

const requireInstallerFile = (path: string, expected: InstallerFileIdentity | null): void => {
  if (expected === null) {
    if (footprintEntryExists(path)) fail("unexpected installer file at " + path);
  } else if (!footprintEntryExists(path) || !sameInstallerFile(captureInstallerFile(path), expected)) {
    fail("installer file identity or bytes changed: " + path);
  }
};

// The installed application is a managed directory namespace. Prove the
// root identity before moving or recursively removing it; do not adopt
// a replacement root merely because it occupies the expected pathname.
const captureInstallerDirectory = (path: string) => {
  if (realpathSync(path) !== path) throw new TypeError("installer directory is not canonical: " + path);
  const entry = lstatSync(path, { bigint: true });
  if (!entry.isDirectory()) throw new TypeError("installer directory is not a real directory: " + path);
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor, { bigint: true });
    const after = lstatSync(path, { bigint: true });
    if (!opened.isDirectory() || opened.dev !== entry.dev || opened.ino !== entry.ino ||
        opened.dev !== after.dev || opened.ino !== after.ino || opened.uid !== entry.uid ||
        opened.uid !== after.uid || opened.mode !== entry.mode || opened.mode !== after.mode) {
      throw new TypeError("installer directory changed during inspection: " + path);
    }
    return { device: opened.dev, inode: opened.ino, uid: opened.uid, mode: opened.mode };
  } finally { closeSync(descriptor); }
};
type InstallerDirectoryIdentity = ReturnType<typeof captureInstallerDirectory>;

const requireInstallerDirectory = (path: string, expected: InstallerDirectoryIdentity | null): void => {
  if (expected === null) {
    if (footprintEntryExists(path)) throw new TypeError("unexpected installer directory at " + path);
    return;
  }
  const observed = captureInstallerDirectory(path);
  if (observed.device !== expected.device || observed.inode !== expected.inode ||
      observed.uid !== expected.uid || observed.mode !== expected.mode) {
    throw new TypeError("installer directory identity changed: " + path);
  }
};

const writeExclusiveInstallerFile = (path: string, bytes: Uint8Array, mode: number): InstallerFileIdentity => {
  const descriptor = openSync(path,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  let expected: InstallerFileIdentity;
  try {
    writeFileSync(descriptor, bytes);
    fchmodSync(descriptor, mode);
    fsyncSync(descriptor);
    const stat = fstatSync(descriptor, { bigint: true });
    expected = { device: stat.dev, inode: stat.ino, mode: stat.mode, uid: stat.uid, bytes: Buffer.from(bytes) };
  } catch (error) {
    throw new Error("installer file write incomplete; inspect " + path + ": " + String(error), { cause: error });
  } finally { closeSync(descriptor); }
  requireInstallerFile(path, expected);
  return expected;
};

type ServiceRecovery = Readonly<{ path: string; identity: InstallerFileIdentity }>;

const releaseServiceRecovery = (recovery: ServiceRecovery, remove: typeof rmSync = rmSync): void => {
  requireInstallerFile(recovery.path, recovery.identity);
  remove(recovery.path);
  requireInstallerFile(recovery.path, null);
};

const captureServiceState = (
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv,
) => {
  const unitPath = join(locations.userConfigHome, "systemd", "user", "pontivus-order.service");
  const previousUnit = footprintEntryExists(unitPath) ? captureInstallerFile(unitPath) : null;
  const enablement = runCommand(
    ["systemctl", "--user", "show", "--property=UnitFileState", "--value", "pontivus-order.service"],
    locations.home, environment,
  ).trim();
  if (enablement !== "enabled" && enablement !== "disabled" &&
      !(previousUnit === null && enablement === "")) {
    fail("unsupported prior service enablement: " + enablement);
  }
  const activity = observeServiceActivity("pontivus-order.service", locations.home, environment);
  if (previousUnit === null && (activity === "active" || enablement === "enabled")) {
    fail("service exists outside the supported unit path: " + unitPath);
  }
  return { unitPath, previousUnit, enablement, activity } as const;
};

const activateService = (
  locations: InstallerLocations,
  launcher: string,
  prior: ReturnType<typeof captureServiceState>,
  environment: NodeJS.ProcessEnv,
  unitPublished: (identity: InstallerFileIdentity) => void,
  recoveryCreated: (recovery: ServiceRecovery) => void,
  restartAttempted: () => void,
  rename: typeof renameSync,
): void => {
  const unitPath = prior.unitPath;
  mkdirSync(dirname(unitPath), { recursive: true });
  requireInstallerFile(unitPath, prior.previousUnit);
  if (prior.previousUnit !== null) {
    const path = unitPath + ".previous." + crypto.randomUUID();
    const identity = writeExclusiveInstallerFile(path, prior.previousUnit.bytes, Number(prior.previousUnit.mode & 0o777n));
    recoveryCreated({ path, identity });
  }
  const temporary = unitPath + ".tmp." + crypto.randomUUID();
  const identity = writeExclusiveInstallerFile(temporary, Buffer.from(buildUserServiceUnit(launcher)), 0o644);
  try {
    requireInstallerFile(unitPath, prior.previousUnit);
    requireInstallerFile(temporary, identity);
    rename(temporary, unitPath);
    unitPublished(identity);
    requireInstallerFile(unitPath, identity);
  } catch (error) {
    try {
      if (footprintEntryExists(temporary)) {
        requireInstallerFile(temporary, identity);
        rmSync(temporary);
      }
    } catch (failure) {
      throw new AggregateError([error, failure], "service unit publication failed: " + String(error) +
        "; temporary unit retained at " + temporary + ": " + String(failure));
    }
    throw error;
  }
  runCommand(["systemctl", "--user", "daemon-reload"], locations.home, environment);
  runCommand(["systemctl", "--user", "enable", "pontivus-order.service"], locations.home, environment);
  requireInstallerFile(unitPath, identity);
  restartAttempted();
  runCommand(["systemctl", "--user", "restart", "pontivus-order.service"], locations.home, environment);
};

const waitForHealthyDaemon = async (
  locations: InstallerLocations,
  launcher: string,
): Promise<void> => {
  const environment = runtimeEnvironment(locations);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (commandSucceeds([launcher, "status"], locations.home, environment)) return;
    await Bun.sleep(1_000);
  }
  fail("Order daemon did not become healthy after user-service activation");
};

const restoreUnit = (
  locations: InstallerLocations,
  prior: ReturnType<typeof captureServiceState>,
  published: InstallerFileIdentity,
  recovery: ServiceRecovery | null,
  environment: NodeJS.ProcessEnv,
  rename: typeof renameSync,
): void => {
  requireInstallerFile(prior.unitPath, published);
  const failures: unknown[] = [];
  const compensate = (label: string, operation: () => void): boolean => {
    try { operation(); return true; }
    catch (error) { failures.push(new Error(label + ": " + String(error), { cause: error })); return false; }
  };
  if (prior.enablement !== "enabled") {
    compensate("prior service disablement", () =>
      runCommand(["systemctl", "--user", "disable", "pontivus-order.service"], locations.home, environment));
  }
  const unitRestored = compensate("prior unit bytes/mode at " + prior.unitPath, () => {
    requireInstallerFile(prior.unitPath, published);
    if (prior.previousUnit === null) {
      rmSync(prior.unitPath);
      requireInstallerFile(prior.unitPath, null);
    } else {
      if (recovery === null) throw new TypeError("prior service recovery copy unavailable: " + prior.unitPath);
      requireInstallerFile(recovery.path, recovery.identity);
      const temporary = prior.unitPath + ".restore." + crypto.randomUUID();
      try {
        const restored = writeExclusiveInstallerFile(temporary, prior.previousUnit.bytes,
          Number(prior.previousUnit.mode & 0o777n));
        requireInstallerFile(prior.unitPath, published);
        requireInstallerFile(temporary, restored);
        rename(temporary, prior.unitPath);
        requireInstallerFile(prior.unitPath, restored);
      } catch (error) {
        throw new Error("service restoration failed: " + String(error) +
          "; original recovery at " + recovery.path +
          (footprintEntryExists(temporary) ? "; restore temporary retained at " + temporary : ""), { cause: error });
      }
    }
  });
  if (unitRestored) {
    const reloaded = compensate("prior service daemon-reload", () =>
      runCommand(["systemctl", "--user", "daemon-reload"], locations.home, environment));
    if (reloaded && prior.enablement === "enabled") {
      compensate("prior service enablement", () =>
        runCommand(["systemctl", "--user", "enable", "pontivus-order.service"], locations.home, environment));
    }
    if (reloaded) compensate("prior service enablement observation", () => {
      const observed = runCommand(
        ["systemctl", "--user", "show", "--property=UnitFileState", "--value", "pontivus-order.service"],
        locations.home, environment,
      ).trim();
      if (observed !== prior.enablement) fail("prior enablement not restored: " + observed);
    });
  }
  if (failures.length > 0) throw new AggregateError(failures,
    "service restoration incomplete: " + failures.map(String).join("; "));
};

const completeDeploymentFootprint = (root: string, launcher: string, unit: string): boolean => {
  try {
    const readRegular = (path: string, executable = false): string | null => {
      if (realpathSync(path) !== path) return null;
      const entry = lstatSync(path);
      if (!entry.isFile() || (executable && (entry.mode & 0o111) === 0)) return null;
      const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      try {
        const opened = fstatSync(descriptor);
        if (!opened.isFile() || opened.dev !== entry.dev || opened.ino !== entry.ino ||
            opened.mode !== entry.mode) return null;
        return path === join(root, "SOURCE_COMMIT") ? readFileSync(descriptor, "utf8") : "";
      } finally { closeSync(descriptor); }
    };
    const marker = readRegular(join(root, "SOURCE_COMMIT"));
    return realpathSync(root) === root && lstatSync(root).isDirectory() &&
      marker !== null && /^[0-9a-f]{40}\n$/.test(marker) &&
      readRegular(join(root, "app", "src", "cli.ts")) !== null &&
      readRegular(join(root, "app", "dist", "index.html")) !== null &&
      readRegular(join(root, "runtime", "bun", "bin", "bun"), true) !== null &&
      readRegular(launcher, true) !== null && readRegular(unit) !== null;
  } catch { return false; }
};

const confirmInstallationHistory = async (
  root: string,
  question: typeof terminalQuestion,
): Promise<boolean> => {
  if (question === terminalQuestion && !process.stdin.isTTY) fail("installation history requires interactive input");
  for (;;) {
    const answer = (await question("Did installation admission previously complete for " + root +
      " (including committed with finalization incomplete)? [y/N] ")).trim().toLowerCase();
    if (answer === "y" || answer === "yes") return true;
    if (["", "n", "no", "unknown"].includes(answer)) return false;
    process.stdout.write("Answer yes, no, or unknown.\n");
  }
};

type LegacyGateweftLocations = Readonly<{
  installRoot: string;
  stateRoot: string;
  launcher: string;
  unitPath: string;
}>;

export type LegacyGateweftMigration = Readonly<{
  locations: LegacyGateweftLocations;
  detected: boolean;
  installMoved: boolean;
  stateMoved: boolean;
  serviceWasActive: boolean;
  databaseMoves: readonly ("" | "-wal" | "-shm")[];
}>;

const legacyGateweftLocations = (
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv,
): LegacyGateweftLocations => ({
  installRoot: join(locations.home, ".local", "share", "gateweft"),
  stateRoot: join(
    environment.XDG_STATE_HOME ?? join(locations.home, ".local", "state"),
    "gateweft",
  ),
  launcher: join(locations.binDir, "gateweft"),
  unitPath: join(locations.userConfigHome, "systemd", "user", "gateweft.service"),
});

const footprintEntryExists = (path: string): boolean =>
  lstatSync(path, { throwIfNoEntry: false }) !== undefined;

const legacyGateweftFootprintExists = (
  locations: LegacyGateweftLocations,
): boolean =>
  [locations.installRoot, locations.stateRoot, locations.launcher, locations.unitPath].some(footprintEntryExists);

const currentOrderFootprintExists = (locations: InstallerLocations): boolean =>
  [locations.installRoot, locations.stateRoot, join(locations.binDir, "order"),
    join(locations.userConfigHome, "systemd", "user", "pontivus-order.service")].some(footprintEntryExists);

// Observe only existing installer backup-name families for diagnostics. Never
// adopt, move, or remove a backup from an earlier invocation automatically.
const retainedDeploymentBackups = (target: string): readonly string[] => {
  const parent = dirname(target);
  if (!footprintEntryExists(parent)) return [];
  const prefix = basename(target) + ".previous.";
  return readdirSync(parent)
    .filter(name => name.startsWith(prefix))
    .map(name => join(parent, name));
};

const predecessorConflict = (locations: InstallerLocations, legacy: LegacyGateweftLocations): never =>
  fail("Gateweft predecessor and Order productive roots both exist; resolve the conflict before installing: " +
    [legacy.installRoot, legacy.stateRoot, legacy.launcher, legacy.unitPath,
      locations.installRoot, locations.stateRoot, join(locations.binDir, "order"),
      join(locations.userConfigHome, "systemd", "user", "pontivus-order.service")]
      .filter(footprintEntryExists).join(", "));

// A successful stop command is not evidence of service quiescence.
const observeServiceActivity = (
  unit: string,
  cwd: string,
  environment: NodeJS.ProcessEnv,
): "active" | "inactive" => {
  const activity = runCommand(
    ["systemctl", "--user", "show", "--property=ActiveState", "--value", unit],
    cwd,
    environment,
  ).trim();
  if (activity !== "active" && activity !== "inactive") {
    throw new TypeError("cannot establish supported service activity for " + unit + ": " + activity);
  }
  return activity;
};

const requireServiceQuiescence = (
  unit: string,
  cwd: string,
  environment: NodeJS.ProcessEnv,
): void => {
  let stopFailure: unknown;
  try {
    runCommand(["systemctl", "--user", "stop", unit], cwd, environment);
  } catch (error) {
    stopFailure = error;
  }
  try {
    if (observeServiceActivity(unit, cwd, environment) !== "inactive") {
      throw new TypeError("service remains active: " + unit);
    }
  } catch (observationFailure) {
    if (stopFailure !== undefined) {
      throw new AggregateError([stopFailure, observationFailure],
        "service quiescence could not be established for " + unit);
    }
    throw observationFailure;
  }
};

const moveDatabaseNamespace = (
  stateRoot: string,
  fromName: "gateweft.sqlite3" | "order.sqlite3",
  toName: "gateweft.sqlite3" | "order.sqlite3",
  suffix: "" | "-wal" | "-shm",
  rename: typeof renameSync,
): void => {
  const from = join(stateRoot, fromName + suffix);
  const to = join(stateRoot, toName + suffix);
  if (!lstatSync(from, { throwIfNoEntry: false })?.isFile() ||
      lstatSync(to, { throwIfNoEntry: false }) !== undefined) {
    fail("cannot establish exclusive database namespace move: " + from + " -> " + to);
  }
  rename(from, to);
};

export const migrateLegacyGateweftInstallation = (
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv,
  rename: typeof renameSync = renameSync,
): LegacyGateweftMigration => {
  const legacy = legacyGateweftLocations(locations, environment);
  const detected = legacyGateweftFootprintExists(legacy);
  const databaseMoves: ("" | "-wal" | "-shm")[] = [];
  const empty: LegacyGateweftMigration = {
    locations: legacy, detected, installMoved: false, stateMoved: false,
    serviceWasActive: false, databaseMoves,
  };
  if (!detected) return empty;
  if (currentOrderFootprintExists(locations)) {
    predecessorConflict(locations, legacy);
  }
  const serviceWasActive = observeServiceActivity("gateweft.service", locations.home, environment) === "active";
  if (serviceWasActive) {
    step("quiescing Gateweft predecessor service");
    requireServiceQuiescence("gateweft.service", locations.home, environment);
  }

  let installMoved = false;
  let stateMoved = false;
  const currentMigration = (): LegacyGateweftMigration => ({
    ...empty, installMoved, stateMoved, serviceWasActive, databaseMoves: [...databaseMoves],
  });
  try {
    if (existsSync(legacy.installRoot)) {
      mkdirSync(dirname(locations.installRoot), { recursive: true });
      rename(legacy.installRoot, locations.installRoot);
      installMoved = true;
    }
    if (existsSync(legacy.stateRoot)) {
      mkdirSync(dirname(locations.stateRoot), { recursive: true });
      rename(legacy.stateRoot, locations.stateRoot);
      stateMoved = true;
      for (const suffix of ["", "-wal", "-shm"] as const) {
        if (lstatSync(join(locations.stateRoot, "gateweft.sqlite3" + suffix), { throwIfNoEntry: false }) === undefined) continue;
        moveDatabaseNamespace(locations.stateRoot, "gateweft.sqlite3", "order.sqlite3", suffix, rename);
        databaseMoves.push(suffix);
      }
    }
    return currentMigration();
  } catch (error) {
    try {
      rollbackLegacyGateweftMigration(currentMigration(), locations, environment, rename);
    } catch (failure) {
      throw new AggregateError([error, failure], "predecessor migration failed: " + String(error) + "; rollback incomplete; retain " +
        [locations.installRoot, locations.stateRoot, legacy.installRoot, legacy.stateRoot].join(", "));
    }
    throw error;
  }
};

export const rollbackLegacyGateweftMigration = (
  migration: LegacyGateweftMigration,
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv = process.env,
  rename: typeof renameSync = renameSync,
): void => {
  if (!migration.detected) return;
  if (observeServiceActivity("gateweft.service", locations.home, environment) !== "inactive") {
    fail("predecessor must remain stopped before rollback");
  }
  const failures: unknown[] = [];
  const compensate = (operation: () => void): void => {
    try { operation(); } catch (failure) { failures.push(failure); }
  };
  if (migration.stateMoved) {
    for (const suffix of [...migration.databaseMoves].reverse()) {
      compensate(() => moveDatabaseNamespace(locations.stateRoot, "order.sqlite3", "gateweft.sqlite3", suffix, rename));
    }
    if (failures.length === 0) compensate(() => {
      if (lstatSync(migration.locations.stateRoot, { throwIfNoEntry: false }) !== undefined) {
        fail("predecessor state destination occupied: " + migration.locations.stateRoot);
      }
      rename(locations.stateRoot, migration.locations.stateRoot);
    });
  }
  if (migration.installMoved) compensate(() => {
    if (lstatSync(migration.locations.installRoot, { throwIfNoEntry: false }) !== undefined) {
      fail("predecessor install destination occupied: " + migration.locations.installRoot);
    }
    rename(locations.installRoot, migration.locations.installRoot);
  });
  if (failures.length === 0 && migration.serviceWasActive) compensate(() =>
    runCommand(["systemctl", "--user", "restart", "gateweft.service"], locations.home, environment));
  if (failures.length > 0) throw new AggregateError(failures,
    "predecessor restoration incomplete; retained roots: " +
    [locations.installRoot, locations.stateRoot, migration.locations.installRoot, migration.locations.stateRoot].join(", "));
};

export const retireLegacyGateweftArtifacts = (
  migration: LegacyGateweftMigration,
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv = process.env,
): void => {
  if (!migration.detected) return;
  if (existsSync(migration.locations.unitPath)) {
    runCommand(["systemctl", "--user", "disable", "gateweft.service"], locations.home, environment);
    rmSync(migration.locations.unitPath, { force: true });
    runCommand(["systemctl", "--user", "daemon-reload"], locations.home);
  }
  rmSync(migration.locations.launcher, { force: true });
};

export const runInstaller = async (
  args: InstallerArguments,
  environment: NodeJS.ProcessEnv = process.env,
  question: typeof terminalQuestion = terminalQuestion,
  rename: typeof renameSync = renameSync,
  remove: typeof rmSync = rmSync,
  databaseEffects?: Parameters<typeof import("./shell/sqlite.ts").prepareOrderDatabaseForInstall>[2],
  configEffects?: InstallerConfigPublication["effects"],
  writeMarker: (descriptor: number, bytes: string) => void = (descriptor, bytes) => writeFileSync(descriptor, bytes, "utf8"),
  manifestEffects?: InstallerManifestEffects,
): Promise<void> => {
  if (process.platform !== "linux") fail("Order v1 productive installation requires Linux");
  if (Bun.version !== bunVersion) fail("installer must run on exact Bun " + bunVersion);
  const locations = resolveLocations(environment);
  const legacy = legacyGateweftLocations(locations, environment);
  const launcher = join(locations.binDir, "order");
  const unitPath = join(locations.userConfigHome, "systemd", "user", "pontivus-order.service");
  step("verifying host and source");
  for (const command of ["git", "tar", "xz", "systemctl", "sh"]) requireHostCommand(command, args.sourceRoot);
  const sourceKind = verifySource(args.sourceRoot, args.sourceCommit);
  if (!commandSucceeds(["systemctl", "--user", "show-environment"], locations.home, environment)) {
    fail("a usable systemd user manager is required for productive Order installation");
  }
  const predecessor = legacyGateweftFootprintExists(legacy);
  if (predecessor && currentOrderFootprintExists(locations)) {
    predecessorConflict(locations, legacy);
  }
  const historyRoot = predecessor ? legacy.installRoot : locations.installRoot;
  const established = completeDeploymentFootprint(historyRoot,
    predecessor ? legacy.launcher : launcher, predecessor ? legacy.unitPath : unitPath) &&
    await confirmInstallationHistory(historyRoot, question);
  const retainedBackups = [locations.installRoot, launcher, unitPath].flatMap(retainedDeploymentBackups);
  if (retainedBackups.length > 0) {
    if (!established) fail("installation history is unproven; explicitly resolve retained prior deployment before retry: " +
      retainedBackups.join(", "));
    process.stdout.write("Earlier recovery material is retained for explicit operator disposition: " +
      retainedBackups.join(", ") + "\n");
  }
  step(established ? "updating existing installation" : "starting fresh/unproven installation");

  process.stdout.write("Order installation maintenance: stop other Order instances and external database clients; do not concurrently edit installer-created integration files until installation finishes.\n");
  const prior = captureServiceState(locations, environment);
  let legacyMigration: LegacyGateweftMigration | null = null;
  let staging: string | null = null;
  let stagingIdentity: InstallerDirectoryIdentity | null = null;
  let launcherTemporary: string | null = null;
  let launcherIdentity: InstallerFileIdentity | null = null;
  let installBackup: string | null = null;
  let installBackupIdentity: InstallerDirectoryIdentity | null = null;
  let launcherBackup: string | null = null;
  let launcherBackupIdentity: InstallerFileIdentity | null = null;
  let appActivated = false;
  let launcherActivated = false;
  let priorStopped = false;
  let unitPublished: InstallerFileIdentity | null = null;
  let unitRecovery: ServiceRecovery | null = null;
  let restartAttempted = false;
  let setupModule: typeof import("./shell/setup.ts") | null = null;
  let configSnapshot: InstallerConfigSnapshot | null = null;
  let configCaptureIncomplete: string | null = null;
  let published: Parameters<InstallerConfigPublication["onPublished"]>[0] | null = null;
  let databaseArchive: LegacyDatabaseArchive | null = null;
  let databaseCustody: InstallerDatabaseCustody | null = null;
  const unarchivedDatabase: { custody: InstallerDatabaseCustody | null } = { custody: null };
  let databaseCandidateEffectsStarted = false;
  let databaseCandidates: ReturnType<typeof import("./shell/sqlite.ts").observeInstallerDatabaseCandidates> | undefined;
  let databaseWriterBaseline: typeof databaseCandidates;
  let databaseRestoreIncomplete = false;
  let sqliteUpgradeModule: typeof import("./shell/sqlite.ts") | null = null;
  let configuredSetup: Awaited<ReturnType<typeof configureOrder>> | null = null;
  const createdProjectManifests = new Map<string, InstallerManifestCustody>();
  const marker = join(locations.installRoot, "SOURCE_COMMIT");
  let temporaryMarker: string | null = null;
  let markerIdentity: InstallerFileIdentity | null = null;
  let markerPrepared = false;

  try {
    if (prior.activity === "active") {
      requireServiceQuiescence("pontivus-order.service", locations.home, environment);
      priorStopped = true;
    }
    legacyMigration = migrateLegacyGateweftInstallation(locations, environment, rename);
    mkdirSync(dirname(locations.installRoot), { recursive: true });
    mkdirSync(locations.binDir, { recursive: true });
    staging = mkdtempSync(join(dirname(locations.installRoot), ".pontivus-order-install."));
    stagingIdentity = captureInstallerDirectory(staging);
    const installedBun = join(staging, "runtime", "bun", "bin", "bun");
    for (const directory of [dirname(installedBun), join(staging, "runtime", "home"),
      join(staging, "runtime", "config"), join(staging, "runtime", "cache"), join(staging, "downloads")]) {
      mkdirSync(directory, { recursive: true });
    }
    step("installing pinned runtimes");
    copyFileSync(process.execPath, installedBun);
    chmodSync(installedBun, 0o755);
    if (runCommand([installedBun, "--version"], args.sourceRoot).trim() !== bunVersion) {
      fail("materialized Bun version does not match " + bunVersion);
    }
    const node = await installNode(staging, args.sourceRoot);
    installOpenCode(staging, args.sourceRoot, installedBun, node);
    step("installing and building Order");
    buildApplication(staging, args.sourceRoot, args.sourceCommit, sourceKind, installedBun, node);
    const temporary = join(locations.binDir, ".pontivus-order." + crypto.randomUUID());
    launcherTemporary = temporary;
    launcherIdentity = writeExclusiveInstallerFile(temporary, Buffer.from(buildLauncherScript(locations)), 0o755);

    step("activating application");
    if (footprintEntryExists(locations.installRoot)) {
      const backup = locations.installRoot + ".previous." + crypto.randomUUID();
      installBackupIdentity = captureInstallerDirectory(locations.installRoot);
      requireInstallerDirectory(backup, null);
      rename(locations.installRoot, backup);
      installBackup = backup;
      requireInstallerDirectory(backup, installBackupIdentity);
    }
    if (footprintEntryExists(launcher)) {
      const backup = launcher + ".previous." + crypto.randomUUID();
      launcherBackupIdentity = captureInstallerFile(launcher);
      requireInstallerFile(backup, null);
      rename(launcher, backup);
      launcherBackup = backup;
      requireInstallerFile(backup, launcherBackupIdentity);
    }
    requireInstallerDirectory(staging, stagingIdentity);
    requireInstallerDirectory(locations.installRoot, null);
    rename(staging, locations.installRoot);
    appActivated = true;
    staging = null;
    requireInstallerDirectory(locations.installRoot, stagingIdentity);
    requireInstallerFile(launcherTemporary, launcherIdentity);
    requireInstallerFile(launcher, null);
    rename(launcherTemporary, launcher);
    launcherActivated = true;
    launcherTemporary = null;
    requireInstallerFile(launcher, launcherIdentity);

    setupModule = await import(pathToFileURL(join(locations.installRoot, "app", "src", "shell", "setup.ts")).href) as typeof import("./shell/setup.ts");
    configSnapshot = setupModule.captureInstallerConfigSnapshot(locations.stateRoot,
      path => { configCaptureIncomplete = path; }, configEffects);
    step("configuring provider, model and repository access");
    configuredSetup = await configureOrder(locations, established, {
      snapshot: configSnapshot, onPublished: identity => { published = identity; }, effects: configEffects,
    }, custody => {
      createdProjectManifests.set(custody.path, custody);
    }, question, () => { databaseRestoreIncomplete = true; }, manifestEffects);

    sqliteUpgradeModule = await import(pathToFileURL(join(locations.installRoot, "app", "src", "shell", "sqlite.ts")).href) as typeof import("./shell/sqlite.ts");
    databaseArchive = sqliteUpgradeModule.prepareOrderDatabaseForInstall(locations.stateRoot,
      () => { databaseRestoreIncomplete = true; }, databaseEffects,
      custody => { unarchivedDatabase.custody = custody; });
    databaseCustody = databaseArchive ?? unarchivedDatabase.custody;
    if (databaseCustody === null) {
      databaseRestoreIncomplete = true;
      throw new TypeError("installer database state root custody unavailable: " + locations.stateRoot);
    }
    databaseCandidates = sqliteUpgradeModule.observeInstallerDatabaseCandidates(databaseCustody, false);
    sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, true);
    if (databaseArchive !== null) {
      process.stdout.write("Order installer — retained rollback database archive at " + databaseArchive.archiveDatabase + "\n");
    }
    if (configuredSetup.legacyV2Config !== null) {
      if (databaseCandidates === undefined) throw new TypeError("database candidate custody unavailable before migration");
      sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, true);
      databaseWriterBaseline = databaseCandidates;
      databaseCandidates = undefined;
      databaseCandidateEffectsStarted = true;
      await configuredSetup.setupModule.migrateRepositoryNativeV2StateForInstall(locations.stateRoot, configuredSetup.legacyV2Config);
      databaseCandidates = sqliteUpgradeModule.observeInstallerDatabaseCandidates(databaseCustody, true, databaseWriterBaseline, true);
      sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, false);
      process.stdout.write("Order installer — migrated WorkItem documentation into target repositories; retained legacy source root as backup: " +
        configuredSetup.legacyV2Config.workItemRoot + "\n");
    }
    // v2 transformation above produces v3; direct v3 and transformed v2
    // candidates use the same existing archive and compensation ownership.
    if (databaseArchive !== null && databaseArchive.preparedCandidates.size > 0) {
      if (databaseCandidates === undefined) throw new TypeError("database candidate custody unavailable before v4 migration");
      sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, !databaseCandidateEffectsStarted);
      databaseWriterBaseline = databaseCandidates;
      databaseCandidates = undefined;
      databaseCandidateEffectsStarted = true;
      sqliteUpgradeModule.migrateOrderDatabaseV3ToV4(databaseArchive, databaseWriterBaseline);
      databaseCandidates = sqliteUpgradeModule.observeInstallerDatabaseCandidates(databaseCustody, true, databaseWriterBaseline, true);
      sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, false);
      process.stdout.write("Order installer — verified additive SQLite v4 migration\n");
    }
    step("installing and starting user service");
    activateService(locations, launcher, prior, environment,
      identity => { unitPublished = identity; },
      recovery => { unitRecovery = recovery; }, () => {
        if (databaseCustody === null || sqliteUpgradeModule === null || databaseCandidates === undefined) {
          throw new TypeError("database candidate custody is unavailable before service activation");
        }
        sqliteUpgradeModule.requireInstallerDatabaseCandidates(
          databaseCustody, databaseCandidates, !databaseCandidateEffectsStarted);
        databaseWriterBaseline = databaseCandidates;
        databaseCandidates = undefined;
        restartAttempted = true;
        databaseCandidateEffectsStarted = true;
      }, rename);
    await waitForHealthyDaemon(locations, launcher);
    databaseCandidates = sqliteUpgradeModule.observeInstallerDatabaseCandidates(databaseCustody, true, databaseWriterBaseline);
    sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, false);
    if (!established) await configuredSetup.setupModule.requireFreshInstallerReadiness(runtimeEnvironment(locations));

    // Readiness is an observation of the admitted deployment, not permission
    // to publish a marker into a replacement directory or changed unit/config.
    const requireCommitCustody = (): void => {
      if (stagingIdentity === null || launcherIdentity === null || unitPublished === null ||
          setupModule === null || configSnapshot === null || sqliteUpgradeModule === null ||
          databaseCustody === null || databaseCandidates === undefined) {
        throw new TypeError("installation commit custody unavailable");
      }
      requireInstallerDirectory(locations.installRoot, stagingIdentity);
      requireInstallerFile(launcher, launcherIdentity);
      requireInstallerFile(prior.unitPath, unitPublished);
      setupModule.requireInstallerConfigPublication(configSnapshot, published);
      for (const custody of createdProjectManifests.values()) setupModule.requireInstallerManifest(custody);
      sqliteUpgradeModule.requireInstallerDatabaseCandidates(databaseCustody, databaseCandidates, false);
    };
    requireCommitCustody();

    // Installation commit: all reversible admission conditions have passed.
    if (footprintEntryExists(marker)) fail("unexpected installation commit marker: " + marker);
    temporaryMarker = marker + ".tmp." + crypto.randomUUID();
    const markerDescriptor = openSync(temporaryMarker,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o644);
    try {
      // Establish ownership from the exclusive descriptor before the write,
      // including when the write or sync later fails.
      const opened = fstatSync(markerDescriptor, { bigint: true });
      if (!opened.isFile()) fail("installation commit marker is not a regular file: " + temporaryMarker);
      markerIdentity = { device: opened.dev, inode: opened.ino, mode: opened.mode,
        uid: opened.uid, bytes: Buffer.from(args.sourceCommit + "\n", "utf8") };
      writeMarker(markerDescriptor, args.sourceCommit + "\n");
      markerPrepared = true;
      fsyncSync(markerDescriptor);
      requireInstallerFile(temporaryMarker, markerIdentity);
    } finally { closeSync(markerDescriptor); }
    // Marker preparation is itself an effect. Re-establish the entire
    // admitted deployment's custody before the irreversible publication.
    requireCommitCustody();
    requireInstallerFile(temporaryMarker, markerIdentity);
    if (footprintEntryExists(marker)) fail("unexpected installation commit marker: " + marker);
    rename(temporaryMarker, marker);
  } catch (error) {
    const failures: unknown[] = [];
    const compensate = (label: string, operation: () => void): void => {
      try { operation(); } catch (failure) { failures.push(new Error(label + ": " + String(failure), { cause: failure })); }
    };
    if (databaseCandidates === undefined && databaseCustody !== null && sqliteUpgradeModule !== null) {
      databaseCandidates = sqliteUpgradeModule.observeInstallerDatabaseCandidates(databaseCustody, databaseCandidateEffectsStarted, databaseWriterBaseline, !restartAttempted);
    }
    if (restartAttempted) {
      compensate("cannot prove new service stopped; live deployment and recovery material retained",
        () => requireServiceQuiescence("pontivus-order.service", locations.home, environment));
      if (failures.length > 0) throw new AggregateError([error, ...failures],
        "installation failed: " + String(error) + "; cannot safely restore active deployment; retained paths: " +
        [locations.installRoot, locations.stateRoot, installBackup, launcherBackup, configSnapshot?.recoveryPath, (unitRecovery as ServiceRecovery | null)?.path, ...createdProjectManifests.keys()].filter(Boolean).join(", "));
    }
    if (configCaptureIncomplete !== null) failures.push(new Error("configuration snapshot incomplete; retained material: " + configCaptureIncomplete));
    if (databaseRestoreIncomplete) failures.push(new Error("database inspection or preparation custody incomplete at " + locations.stateRoot));
    if (databaseArchive !== null && sqliteUpgradeModule !== null) {
      const archive = databaseArchive;
      const module = sqliteUpgradeModule;
      compensate("database restoration incomplete: " + archive.archiveDatabase, () => {
        try {
          if (databaseCandidates === undefined) fail("database candidate custody is unavailable");
          module.restoreOrderDatabaseAfterFailedInstall(archive, databaseEffects, databaseCandidates, restartAttempted);
        }
        catch (failure) { databaseRestoreIncomplete = true; throw failure; }
      });
    } else if (databaseCustody !== null && sqliteUpgradeModule !== null) {
      const custody = databaseCustody;
      const module = sqliteUpgradeModule;
      compensate("unarchived database custody incomplete: " + custody.stateRoot, () => {
        try {
          const candidates = databaseCandidates;
          if (candidates === undefined) throw new TypeError("database candidate custody is unavailable");
          module.requireUnarchivedInstallerDatabaseForRestart(custody, candidates, restartAttempted);
        } catch (failure) { databaseRestoreIncomplete = true; throw failure; }
      });
    }
    if (configSnapshot !== null && setupModule !== null) {
      const snapshot = configSnapshot;
      const module = setupModule;
      compensate("configuration restoration incomplete: " + (snapshot.recoveryPath ?? snapshot.target),
        () => module.restoreInstallerConfig(snapshot, published, configEffects));
    }
    for (const custody of [...createdProjectManifests.values()].reverse()) {
      compensate("manifest restoration incomplete: " + custody.path, () => {
        if (setupModule === null) throw new TypeError("installed project effect owner unavailable");
        setupModule.restoreInstallerManifest(custody, manifestEffects);
      });
    }
    if (launcherActivated) compensate("new launcher removal incomplete: " + launcher, () => {
      if (launcherIdentity === null) throw new TypeError("launcher custody unavailable");
      requireInstallerFile(launcher, launcherIdentity);
      rmSync(launcher);
      requireInstallerFile(launcher, null);
    });
    if (launcherBackup !== null) {
      const backup = launcherBackup;
      compensate("launcher restoration incomplete: " + backup, () => {
        if (footprintEntryExists(launcher)) fail("launcher destination occupied: " + launcher);
        if (launcherBackupIdentity === null) throw new TypeError("launcher backup custody unavailable: " + backup);
        requireInstallerFile(backup, launcherBackupIdentity);
        rename(backup, launcher);
        requireInstallerFile(launcher, launcherBackupIdentity);
      });
    }
    if (appActivated) compensate("new application removal incomplete: " + locations.installRoot, () => {
      if (stagingIdentity === null) throw new TypeError("application custody unavailable");
      requireInstallerDirectory(locations.installRoot, stagingIdentity);
      // Recursive removal is a dependent effect: do not destroy an unexpected
      // marker or a replaced/changed temporary merely because the root is ours.
      if (footprintEntryExists(marker)) fail("unexpected installation commit marker retained: " + marker);
      if (temporaryMarker !== null) {
        if (markerIdentity === null) requireInstallerFile(temporaryMarker, null);
        else {
          const observed = captureInstallerFile(temporaryMarker);
          const expected = markerPrepared ? markerIdentity :
            { ...markerIdentity, bytes: markerIdentity.bytes.subarray(0, observed.bytes.length) };
          if (!sameInstallerFile(observed, expected)) {
            fail("installation commit marker temporary custody changed; retained: " + temporaryMarker);
          }
        }
      }
      rmSync(locations.installRoot, { recursive: true });
      requireInstallerDirectory(locations.installRoot, null);
    });
    if (installBackup !== null) {
      const backup = installBackup;
      compensate("application restoration incomplete: " + backup, () => {
        if (footprintEntryExists(locations.installRoot)) fail("application destination occupied: " + locations.installRoot);
        if (installBackupIdentity === null) throw new TypeError("application backup custody unavailable: " + backup);
        requireInstallerDirectory(backup, installBackupIdentity);
        rename(backup, locations.installRoot);
        requireInstallerDirectory(locations.installRoot, installBackupIdentity);
      });
    }
    if (unitPublished !== null) {
      const publishedUnit: InstallerFileIdentity = unitPublished;
      compensate("service unit restoration incomplete: " + prior.unitPath,
        () => restoreUnit(locations, prior, publishedUnit, unitRecovery, environment, rename));
    } else if (priorStopped) {
      compensate("prior service unit custody incomplete: " + prior.unitPath,
        () => requireInstallerFile(prior.unitPath, prior.previousUnit));
    }
    if (failures.length === 0 && unitRecovery !== null) {
      const recovery: ServiceRecovery = unitRecovery;
      compensate("service recovery retirement incomplete: " + recovery.path, () => releaseServiceRecovery(recovery));
    }
    if (staging !== null) {
      const path = staging;
      compensate("staging cleanup incomplete: " + path, () => {
        if (!footprintEntryExists(path)) return;
        if (stagingIdentity === null) throw new TypeError("staging custody unavailable: " + path);
        requireInstallerDirectory(path, stagingIdentity);
        rmSync(path, { recursive: true });
      });
    }
    if (launcherTemporary !== null) {
      const path = launcherTemporary;
      compensate("temporary launcher cleanup incomplete: " + path, () => {
        if (!footprintEntryExists(path)) return;
        if (launcherIdentity === null) throw new TypeError("temporary launcher custody unavailable: " + path);
        requireInstallerFile(path, launcherIdentity);
        rmSync(path);
      });
    }
    if (failures.length === 0 && legacyMigration !== null) {
      const migration = legacyMigration;
      compensate("predecessor restoration incomplete", () => rollbackLegacyGateweftMigration(migration, locations, environment, rename));
    }
    if (failures.length === 0 && priorStopped) compensate("prior service restart failed",
      () => runCommand(["systemctl", "--user", "restart", "pontivus-order.service"], locations.home, environment));
    if (failures.length > 0) throw new AggregateError([error, ...failures],
      "installation failed: " + String(error) + "; rollback incomplete: " + failures.map(String).join("; ") +
      (unitRecovery === null ? "" : "; service recovery: " + (unitRecovery as ServiceRecovery).path));
    throw error;
  }

  // Never roll back a committed installation because finalization failed.
  try {
    if (configSnapshot !== null && setupModule !== null) setupModule.releaseInstallerConfigSnapshot(configSnapshot, configEffects);
    if (unitRecovery !== null) releaseServiceRecovery(unitRecovery, remove);
    if (legacyMigration !== null) retireLegacyGateweftArtifacts(legacyMigration, locations, environment);
    writeProfilePath(locations.home, locations.binDir);
    if (installBackup !== null) {
      if (installBackupIdentity === null) throw new TypeError("application backup custody unavailable: " + installBackup);
      requireInstallerDirectory(installBackup, installBackupIdentity);
      remove(installBackup, { recursive: true });
    }
    if (launcherBackup !== null) {
      if (launcherBackupIdentity === null) throw new TypeError("launcher backup custody unavailable: " + launcherBackup);
      requireInstallerFile(launcherBackup, launcherBackupIdentity);
      remove(launcherBackup);
    }
  } catch (error) {
    throw new Error("installation committed; finalization incomplete: " + String(error) + "; retained material at " +
      [installBackup, launcherBackup, configSnapshot?.recoveryPath, (unitRecovery as ServiceRecovery | null)?.path, legacy.launcher, legacy.unitPath]
        .filter((path): path is string => typeof path === "string" && footprintEntryExists(path)).join(", "),
      { cause: error });
  }
  if (established && configuredSetup !== null) {
    await configuredSetup.setupModule.reportEstablishedInstallerReadiness(runtimeEnvironment(locations), value => process.stdout.write(value));
  }
  process.stdout.write([
    "", established ? "Order updated successfully." : "Order installed successfully.",
    "  source:   " + args.sourceCommit, "  app:      " + join(locations.installRoot, "app"),
    "  launcher: " + launcher, "  state:    " + locations.stateRoot,
    "  service:  " + unitPath, "  status:   healthy", "",
  ].join("\n"));
};

if (import.meta.main) {
  runInstaller(parseArguments(Bun.argv.slice(2))).catch((error) => {
    process.stderr.write(
      "order install: " + (error instanceof Error ? error.message : String(error)) + "\n",
    );
    process.exitCode = 1;
  });
}
