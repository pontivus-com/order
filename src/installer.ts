import { createInterface } from "node:readline/promises";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";

import type {
  LegacyOrderConfigV2,
  OrderConfig,
  RepositoryPath,
  WorkItemSourcePath,
} from "./core/contracts.ts";
import type { LegacyDatabaseArchive } from "./shell/sqlite.ts";

const bunVersion = "1.4.4";
const nodeVersion = "26.13.0";
const openCodeVersion = "2.2.6";

type InstallerArguments = Readonly<{
  sourceRoot: string;
  sourceCommit: string;
}>;

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
  try {
    return await input.question(prompt);
  } finally {
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

const verifySource = (sourceRoot: string, sourceCommit: string): void => {
  const repositoryRoot = runCommand(
    ["git", "-C", sourceRoot, "rev-parse", "--show-toplevel"],
    sourceRoot,
  ).trim();
  if (repositoryRoot !== sourceRoot) fail("installer source must be the Order repository root");
  if (runCommand(["git", "-C", sourceRoot, "rev-parse", "HEAD"], sourceRoot).trim() !== sourceCommit) {
    fail("installer source commit changed after bootstrap");
  }
  if (!commandSucceeds(["git", "-C", sourceRoot, "diff", "--quiet", "--"], sourceRoot)) {
    fail("refusing to install from a checkout with unstaged changes");
  }
  if (!commandSucceeds(["git", "-C", sourceRoot, "diff", "--cached", "--quiet", "--"], sourceRoot)) {
    fail("refusing to install from a checkout with staged changes");
  }
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
  bun: string,
  node: string,
): void => {
  const app = join(staging, "app");
  const downloads = join(staging, "downloads");
  mkdirSync(app, { recursive: true });
  mkdirSync(downloads, { recursive: true });
  const archive = join(downloads, "source.tar");
  runCommand(
    ["git", "-C", sourceRoot, "archive", "--format=tar", "--output=" + archive, sourceCommit],
    sourceRoot,
  );
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
  runCommand([node, "node_modules/vite/bin/vite.js", "build"], app, environment, true);
  if (!existsSync(join(app, "dist", "index.html"))) {
    fail("production build did not create dist/index.html");
  }
  writeFileSync(join(staging, "SOURCE_COMMIT"), sourceCommit + "\n", "utf8");
};

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean => {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
};

const ensureMigrationParent = (
  repositoryRoot: string,
  repositoryPath: RepositoryPath,
): string => {
  const segments = repositoryPath.split("/");
  let current = repositoryRoot;
  for (const segment of segments.slice(0, -1)) {
    current = join(current, segment);
    if (!existsSync(current)) mkdirSync(current, { mode: 0o755 });
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      fail("repository-native WorkItem migration may not traverse a symlink/non-directory");
    }
  }
  return join(repositoryRoot, ...segments);
};

const migrateRepositoryNativeV2State = async (
  locations: InstallerLocations,
  legacyConfig: LegacyOrderConfigV2,
  currentConfig: OrderConfig,
  sqliteModule: typeof import("./shell/sqlite.ts"),
): Promise<void> => {
  const moduleUrl = (path: string): string =>
    pathToFileURL(join(locations.installRoot, "app", "src", path)).href;
  const [projectModule, sourceShell, sourceCore, repositoryModule, runtimeModule, fileWriteModule] =
    await Promise.all([
      import(moduleUrl("shell/project.ts")) as Promise<typeof import("./shell/project.ts")>,
      import(moduleUrl("shell/work-item-source.ts")) as Promise<typeof import("./shell/work-item-source.ts")>,
      import(moduleUrl("core/work-item-source.ts")) as Promise<typeof import("./core/work-item-source.ts")>,
      import(moduleUrl("shell/repository.ts")) as Promise<typeof import("./shell/repository.ts")>,
      import(moduleUrl("shell/runtime.ts")) as Promise<typeof import("./shell/runtime.ts")>,
      import(moduleUrl("shell/file-write.ts")) as Promise<typeof import("./shell/file-write.ts")>,
    ]);

  const projects = await projectModule.loadConfiguredProjects(currentConfig.repositoryRoots);
  const projectById = new Map(
    projects.map((project) => [project.manifest.projectId, project] as const),
  );

  const legacySources = sourceShell.scanLegacyV2WorkItemSourcesForInstall(
    legacyConfig.workItemRoot,
  );
  const duplicates = sourceCore.duplicateWorkItemSourceIds(legacySources);
  if (duplicates.length !== 0) {
    fail("v2→v3 migration found duplicate WorkItem ids: " + duplicates.join(", "));
  }
  const sourceById = new Map(
    legacySources.map((source) => [source.metadata.id, source] as const),
  );

  const migrationState = sqliteModule.readOrderV2MigrationStateForInstall(
    locations.stateRoot,
  );
  const sourcePaths = new Map<string, WorkItemSourcePath>();
  const planned = new Map<string, Readonly<{
    repositoryRoot: string;
    repositoryPath: RepositoryPath;
    bytes: Uint8Array;
  }>>();

  const planCopy = (
    repositoryRoot: string,
    repositoryPath: RepositoryPath,
    bytes: Uint8Array,
  ): void => {
    const target = join(repositoryRoot, repositoryPath);
    const prior = planned.get(target);
    if (prior !== undefined) {
      if (!bytesEqual(prior.bytes, bytes)) {
        fail("v2→v3 migration maps different bytes to the same repository path: " + repositoryPath);
      }
      return;
    }
    if (existsSync(target)) {
      const stat = lstatSync(target);
      if (stat.isSymbolicLink() || !stat.isFile()) {
        fail("v2→v3 migration destination is not a regular file: " + repositoryPath);
      }
      if (!bytesEqual(new Uint8Array(readFileSync(target)), bytes)) {
        fail("v2→v3 migration destination already exists with different bytes: " + repositoryPath);
      }
    }
    planned.set(target, { repositoryRoot, repositoryPath, bytes });
  };

  for (const source of legacySources) {
    const project = projectById.get(source.metadata.projectId);
    if (project === undefined) {
      fail("v2→v3 migration cannot resolve projectId: " + source.metadata.projectId);
    }
    const destination = sourceCore.workItemDocumentPath(
      project.manifest.workItems.root,
      source.metadata.id,
      "SOURCE",
    );
    planCopy(
      project.repositoryRoot,
      destination,
      new TextEncoder().encode(source.markdown),
    );
  }

  for (const [workItem, lifecycleArtifacts] of migrationState) {
    const source = sourceById.get(workItem.id);
    if (source === undefined) {
      fail("v2→v3 migration is missing persisted WorkItem source: " + workItem.id);
    }
    if (
      source.path !== workItem.sourcePath ||
      source.sha256 !== workItem.sourceSha256 ||
      source.metadata.projectId !== workItem.projectId
    ) {
      fail("v2→v3 persisted WorkItem source projection is stale: " + workItem.id);
    }
    const project = projectById.get(workItem.projectId);
    if (project === undefined || project.repositoryRoot !== workItem.repositoryRoot) {
      fail("v2→v3 migration cannot resolve exact repository for WorkItem: " + workItem.id);
    }
    const destination = sourceCore.workItemDocumentPath(
      project.manifest.workItems.root,
      workItem.id,
      "SOURCE",
    );
    sourcePaths.set(workItem.id, destination as WorkItemSourcePath);

    for (const artifact of lifecycleArtifacts) {
      if (
        artifact.role !== "R1" &&
        artifact.role !== "R2" &&
        artifact.role !== "DESIGN" &&
        artifact.role !== "PLAN" &&
        artifact.role !== "R3"
      ) {
        continue;
      }
      const bytes = repositoryModule.readWorkingTreeFile(
        workItem.repositoryRoot,
        artifact.repositoryPath,
      );
      if (runtimeModule.sha256(bytes) !== artifact.sha256) {
        fail(
          "v2→v3 lifecycle source bytes differ from current ArtifactRef: " +
            artifact.repositoryPath,
        );
      }
      const lifecycleDestination = sourceCore.workItemDocumentPath(
        project.manifest.workItems.root,
        workItem.id,
        artifact.role,
      );
      planCopy(project.repositoryRoot, lifecycleDestination, bytes);
    }
  }

  for (const copy of planned.values()) {
    const target = join(copy.repositoryRoot, copy.repositoryPath);
    if (!existsSync(target)) {
      ensureMigrationParent(copy.repositoryRoot, copy.repositoryPath);
      fileWriteModule.createRegularFileExclusive(target, copy.bytes);
    }
    const verified = new Uint8Array(readFileSync(target));
    if (!bytesEqual(verified, copy.bytes)) {
      fail("v2→v3 repository copy failed read-back verification: " + copy.repositoryPath);
    }
  }

  sqliteModule.migrateOrderDatabaseV2ToV3(
    locations.stateRoot,
    sourcePaths as ReadonlyMap<import("./core/contracts.ts").WorkItemId, WorkItemSourcePath>,
  );
  process.stdout.write(
    "Order installer — migrated WorkItem documentation into target repositories; retained legacy source root as backup: " +
      legacyConfig.workItemRoot +
      "\n",
  );
};

const configureOrder = async (
  locations: InstallerLocations,
  projectManifestCreated: (path: string) => void,
): Promise<void> => {
  const setupUrl = pathToFileURL(
    join(locations.installRoot, "app", "src", "shell", "setup.ts"),
  ).href;
  const setupModule = await import(setupUrl) as typeof import("./shell/setup.ts");
  const code = await setupModule.runInstallerGuidedSetup(
    runtimeEnvironment(locations),
    (value) => process.stdout.write(value),
    terminalQuestion,
    projectManifestCreated,
  );
  if (code !== 0) fail("Order guided configuration did not complete");
};

const activateService = async (
  locations: InstallerLocations,
  launcher: string,
): Promise<Readonly<{ unitPath: string; previousUnit: string | null }>> => {
  const unitDir = join(locations.userConfigHome, "systemd", "user");
  const unitPath = join(unitDir, "pontivus-order.service");
  mkdirSync(unitDir, { recursive: true });
  const previousUnit = existsSync(unitPath) ? readFileSync(unitPath, "utf8") : null;
  const temporary = unitPath + ".tmp." + process.pid;
  writeFileSync(temporary, buildUserServiceUnit(launcher), { encoding: "utf8", mode: 0o644 });
  renameSync(temporary, unitPath);
  runCommand(["systemctl", "--user", "daemon-reload"], locations.home);
  runCommand(["systemctl", "--user", "enable", "pontivus-order.service"], locations.home);
  runCommand(["systemctl", "--user", "restart", "pontivus-order.service"], locations.home);
  return { unitPath, previousUnit };
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
  unitPath: string,
  previousUnit: string | null,
): void => {
  try {
    runCommand(["systemctl", "--user", "stop", "pontivus-order.service"], locations.home);
  } catch {
    // Rollback continues even if the newly started service already exited.
  }
  if (previousUnit === null) {
    rmSync(unitPath, { force: true });
  } else {
    writeFileSync(unitPath, previousUnit, { encoding: "utf8", mode: 0o644 });
  }
  try {
    runCommand(["systemctl", "--user", "daemon-reload"], locations.home);
  } catch {
    // Preserve the original installation bytes even if host supervision cannot be reloaded.
  }
};

const restoreConfigSnapshot = (
  snapshot: Readonly<{ path: string; bytes: Uint8Array | null }>,
): void => {
  if (snapshot.bytes === null) {
    rmSync(snapshot.path, { force: true });
    return;
  }
  writeFileSync(snapshot.path, snapshot.bytes, { mode: 0o600 });
  chmodSync(snapshot.path, 0o600);
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

const legacyGateweftFootprintExists = (
  locations: LegacyGateweftLocations,
): boolean =>
  existsSync(locations.installRoot) ||
  existsSync(locations.stateRoot) ||
  existsSync(locations.launcher) ||
  existsSync(locations.unitPath);

const currentOrderFootprintExists = (locations: InstallerLocations): boolean =>
  existsSync(locations.installRoot) ||
  existsSync(locations.stateRoot) ||
  existsSync(join(locations.binDir, "order")) ||
  existsSync(join(locations.userConfigHome, "systemd", "user", "pontivus-order.service"));

const renameDatabaseNamespace = (
  stateRoot: string,
  fromName: "gateweft.sqlite3" | "order.sqlite3",
  toName: "gateweft.sqlite3" | "order.sqlite3",
): void => {
  for (const suffix of ["", "-wal", "-shm"] as const) {
    const from = join(stateRoot, fromName + suffix);
    if (!existsSync(from)) continue;
    const to = join(stateRoot, toName + suffix);
    if (existsSync(to)) {
      fail("legacy/current database namespaces both exist in " + stateRoot);
    }
    renameSync(from, to);
  }
};

export const migrateLegacyGateweftInstallation = (
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv,
): LegacyGateweftMigration => {
  const legacy = legacyGateweftLocations(locations, environment);
  const detected = legacyGateweftFootprintExists(legacy);
  const empty: LegacyGateweftMigration = {
    locations: legacy,
    detected,
    installMoved: false,
    stateMoved: false,
    serviceWasActive: false,
  };
  if (!detected) return empty;

  if (currentOrderFootprintExists(locations)) {
    fail("Gateweft predecessor and Order productive roots both exist; resolve the conflict before installing");
  }

  const serviceWasActive = commandSucceeds(
    ["systemctl", "--user", "is-active", "--quiet", "gateweft.service"],
    locations.home,
    environment,
  );
  if (serviceWasActive) {
    step("quiescing Gateweft predecessor service");
    runCommand(["systemctl", "--user", "stop", "gateweft.service"], locations.home, environment);
  }

  let installMoved = false;
  let stateMoved = false;
  try {
    if (existsSync(legacy.installRoot)) {
      mkdirSync(dirname(locations.installRoot), { recursive: true });
      renameSync(legacy.installRoot, locations.installRoot);
      installMoved = true;
    }
    if (existsSync(legacy.stateRoot)) {
      mkdirSync(dirname(locations.stateRoot), { recursive: true });
      renameSync(legacy.stateRoot, locations.stateRoot);
      stateMoved = true;
      renameDatabaseNamespace(locations.stateRoot, "gateweft.sqlite3", "order.sqlite3");
    }
    return { locations: legacy, detected: true, installMoved, stateMoved, serviceWasActive };
  } catch (error) {
    if (stateMoved && existsSync(locations.stateRoot)) {
      renameDatabaseNamespace(locations.stateRoot, "order.sqlite3", "gateweft.sqlite3");
      renameSync(locations.stateRoot, legacy.stateRoot);
    }
    if (installMoved && existsSync(locations.installRoot)) {
      renameSync(locations.installRoot, legacy.installRoot);
    }
    if (serviceWasActive) {
      runCommand(["systemctl", "--user", "restart", "gateweft.service"], locations.home, environment);
    }
    throw error;
  }
};

export const rollbackLegacyGateweftMigration = (
  migration: LegacyGateweftMigration,
  locations: InstallerLocations,
  environment: NodeJS.ProcessEnv = process.env,
): void => {
  if (!migration.detected) return;
  if (migration.stateMoved && existsSync(locations.stateRoot)) {
    renameDatabaseNamespace(locations.stateRoot, "order.sqlite3", "gateweft.sqlite3");
    renameSync(locations.stateRoot, migration.locations.stateRoot);
  }
  if (migration.installMoved && existsSync(locations.installRoot)) {
    renameSync(locations.installRoot, migration.locations.installRoot);
  }
  if (migration.serviceWasActive) {
    runCommand(["systemctl", "--user", "restart", "gateweft.service"], locations.home, environment);
  }
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
): Promise<void> => {
  if (process.platform !== "linux") fail("Order v1 productive installation requires Linux");
  if (Bun.version !== bunVersion) fail("installer must run on exact Bun " + bunVersion);
  const locations = resolveLocations(environment);
  const legacyLocations = legacyGateweftLocations(locations, environment);
  const existingInstallation =
    currentOrderFootprintExists(locations) ||
    legacyGateweftFootprintExists(legacyLocations);

  step(existingInstallation ? "updating existing installation" : "starting fresh installation");
  step("verifying host and source");
  for (const command of ["git", "tar", "xz", "systemctl", "sh"]) {
    requireHostCommand(command, args.sourceRoot);
  }
  verifySource(args.sourceRoot, args.sourceCommit);
  if (!commandSucceeds(["systemctl", "--user", "show-environment"], locations.home)) {
    fail("a usable systemd user manager is required for productive Order installation");
  }

  const legacyMigration = migrateLegacyGateweftInstallation(locations, environment);

  mkdirSync(dirname(locations.installRoot), { recursive: true });
  mkdirSync(locations.binDir, { recursive: true });
  const staging = mkdtempSync(join(dirname(locations.installRoot), ".pontivus-order-install."));
  const installedBun = join(staging, "runtime", "bun", "bin", "bun");
  mkdirSync(dirname(installedBun), { recursive: true });
  mkdirSync(join(staging, "runtime", "home"), { recursive: true });
  mkdirSync(join(staging, "runtime", "config"), { recursive: true });
  mkdirSync(join(staging, "runtime", "cache"), { recursive: true });
  mkdirSync(join(staging, "downloads"), { recursive: true });

  let installBackup: string | null = null;
  let launcherBackup: string | null = null;
  let activated = false;
  let serviceState: Readonly<{ unitPath: string; previousUnit: string | null }> | null = null;
  let configSnapshot: Readonly<{ path: string; bytes: Uint8Array | null }> | null = null;
  let databaseArchive: LegacyDatabaseArchive | null = null;
  let sqliteUpgradeModule: typeof import("./shell/sqlite.ts") | null = null;
  let legacyV2Config: LegacyOrderConfigV2 | null = null;
  let priorServiceWasActive = false;
  const createdProjectManifests: string[] = [];
  const launcher = join(locations.binDir, "order");

  try {
    step("installing pinned runtimes");
    copyFileSync(process.execPath, installedBun);
    chmodSync(installedBun, 0o755);
    if (runCommand([installedBun, "--version"], args.sourceRoot).trim() !== bunVersion) {
      fail("materialized Bun version does not match " + bunVersion);
    }
    const node = await installNode(staging, args.sourceRoot);
    installOpenCode(staging, args.sourceRoot, installedBun, node);

    step("installing and building Order");
    buildApplication(staging, args.sourceRoot, args.sourceCommit, installedBun, node);

    const launcherTemporary = join(locations.binDir, ".pontivus-order." + process.pid);
    writeFileSync(launcherTemporary, buildLauncherScript(locations), {
      encoding: "utf8",
      mode: 0o755,
    });
    chmodSync(launcherTemporary, 0o755);

    priorServiceWasActive = commandSucceeds(
      ["systemctl", "--user", "is-active", "--quiet", "pontivus-order.service"],
      locations.home,
    );
    if (priorServiceWasActive) {
      step("quiescing existing service");
      runCommand(["systemctl", "--user", "stop", "pontivus-order.service"], locations.home);
    }

    step("activating application");
    if (existsSync(locations.installRoot)) {
      installBackup = locations.installRoot + ".previous." + process.pid;
      rmSync(installBackup, { recursive: true, force: true });
      renameSync(locations.installRoot, installBackup);
    }
    if (existsSync(launcher)) {
      launcherBackup = launcher + ".previous." + process.pid;
      rmSync(launcherBackup, { force: true });
      renameSync(launcher, launcherBackup);
    }
    renameSync(staging, locations.installRoot);
    renameSync(launcherTemporary, launcher);
    activated = true;

    const runtimeUrl = pathToFileURL(
      join(locations.installRoot, "app", "src", "shell", "runtime.ts"),
    ).href;
    const runtimeModule = await import(runtimeUrl) as typeof import("./shell/runtime.ts");
    const configPath = runtimeModule.statePaths(locations.stateRoot).config;
    configSnapshot = {
      path: configPath,
      bytes: existsSync(configPath) ? new Uint8Array(readFileSync(configPath)) : null,
    };

    const configUrl = pathToFileURL(
      join(locations.installRoot, "app", "src", "shell", "config.ts"),
    ).href;
    const configModule = await import(configUrl) as typeof import("./shell/config.ts");
    const upgradeConfig = configModule.readOrderConfigForUpgradeIfPresent(
      locations.stateRoot,
    );
    legacyV2Config = upgradeConfig?.version === 2 ? upgradeConfig : null;

    step("configuring provider, model and repository access");
    await configureOrder(
      locations,
      (path) => createdProjectManifests.push(path),
    );

    const sqliteUrl = pathToFileURL(
      join(locations.installRoot, "app", "src", "shell", "sqlite.ts"),
    ).href;
    sqliteUpgradeModule = await import(sqliteUrl) as typeof import("./shell/sqlite.ts");
    databaseArchive = sqliteUpgradeModule.prepareOrderDatabaseForInstall(
      locations.stateRoot,
    );
    if (databaseArchive !== null) {
      process.stdout.write(
        "Order installer — retained rollback database archive at " +
          databaseArchive.archiveDatabase +
          "\n",
      );
    }

    if (legacyV2Config !== null) {
      const currentConfig = configModule.readOrderConfig(locations.stateRoot);
      await migrateRepositoryNativeV2State(
        locations,
        legacyV2Config,
        currentConfig,
        sqliteUpgradeModule,
      );
    }

    step("installing and starting user service");
    serviceState = await activateService(locations, launcher);
    await waitForHealthyDaemon(locations, launcher);

    retireLegacyGateweftArtifacts(legacyMigration, locations, environment);
    writeProfilePath(locations.home, locations.binDir);
    if (installBackup !== null) rmSync(installBackup, { recursive: true, force: true });
    if (launcherBackup !== null) rmSync(launcherBackup, { force: true });

    process.stdout.write(
      [
        "",
        existingInstallation ? "Order updated successfully." : "Order installed successfully.",
        "  source:   " + args.sourceCommit,
        "  app:      " + join(locations.installRoot, "app"),
        "  launcher: " + launcher,
        "  state:    " + locations.stateRoot,
        "  service:  " + serviceState.unitPath,
        "  status:   healthy",
        "",
      ].join("\n"),
    );
  } catch (error) {
    if (serviceState !== null) {
      restoreUnit(locations, serviceState.unitPath, serviceState.previousUnit);
    }
    if (databaseArchive !== null && sqliteUpgradeModule !== null) {
      try {
        sqliteUpgradeModule.restoreOrderDatabaseAfterFailedInstall(databaseArchive);
      } catch {
        // Preserve the original installer failure; the retained archive remains recoverable.
      }
    }
    if (configSnapshot !== null) {
      try {
        restoreConfigSnapshot(configSnapshot);
      } catch {
        // Preserve the original installer failure; configuration restoration is best effort.
      }
    }
    for (const path of createdProjectManifests.reverse()) {
      try {
        rmSync(path, { force: true });
      } catch {
        // Preserve the original installer failure; a created manifest remains visible for recovery.
      }
    }
    if (activated) {
      rmSync(locations.installRoot, { recursive: true, force: true });
      if (installBackup !== null && existsSync(installBackup)) {
        renameSync(installBackup, locations.installRoot);
      }
      rmSync(launcher, { force: true });
      if (launcherBackup !== null && existsSync(launcherBackup)) {
        renameSync(launcherBackup, launcher);
      }
    } else {
      rmSync(staging, { recursive: true, force: true });
    }
    if (priorServiceWasActive) {
      try {
        runCommand(["systemctl", "--user", "restart", "pontivus-order.service"], locations.home);
      } catch {
        // Preserve the original installer failure if host supervision cannot be restored.
      }
    }
    try {
      rollbackLegacyGateweftMigration(legacyMigration, locations, environment);
    } catch {
      // Preserve the original installer failure; predecessor recovery remains visible.
    }
    throw error;
  }
};

if (import.meta.main) {
  runInstaller(parseArguments(Bun.argv.slice(2))).catch((error) => {
    process.stderr.write(
      "order install: " + (error instanceof Error ? error.message : String(error)) + "\n",
    );
    process.exitCode = 1;
  });
}
