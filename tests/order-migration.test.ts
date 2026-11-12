import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
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

const runBun = (
  lines: readonly string[],
  options: Readonly<{ allowFailure?: boolean }> = {},
) => {
  const result = spawnSync("bun", ["--eval", lines.join("\n")], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
  if (!options.allowFailure && result.status !== 0) {
    throw new Error("bun --eval failed: " + result.stderr);
  }
  return result;
};

describe("Order predecessor cutover boundary", () => {
  it("migrates, rolls back and retires the immediately preceding default footprint under Bun", () => {
    const root = tempDir("order-predecessor-");
    const home = join(root, "home");
    const binDir = join(home, ".local", "bin");
    const configHome = join(home, ".config");
    const fakeBin = join(root, "fake-bin");
    const log = join(root, "systemctl.log");
    for (const path of [binDir, configHome, fakeBin]) mkdirSync(path, { recursive: true });

    const systemctl = join(fakeBin, "systemctl");
    writeFileSync(
      systemctl,
      "#!/bin/sh\nprintf '%s\\n' \"$*\" >> \"$SYSTEMCTL_LOG\"\nexit 0\n",
      { mode: 0o755 },
    );
    chmodSync(systemctl, 0o755);

    const legacyInstall = join(home, ".local", "share", "gateweft");
    const legacyState = join(home, ".local", "state", "gateweft");
    const legacyLauncher = join(binDir, "gateweft");
    const legacyUnit = join(configHome, "systemd", "user", "gateweft.service");
    mkdirSync(legacyInstall, { recursive: true });
    mkdirSync(legacyState, { recursive: true });
    mkdirSync(join(configHome, "systemd", "user"), { recursive: true });
    writeFileSync(join(legacyInstall, "marker"), "old install\n");
    writeFileSync(join(legacyState, "gateweft.sqlite3"), "db");
    writeFileSync(join(legacyState, "gateweft.sqlite3-wal"), "wal");
    writeFileSync(legacyLauncher, "#!/bin/sh\n");
    writeFileSync(legacyUnit, "[Unit]\n");

    const result = runBun([
      'const fs = await import("node:fs");',
      'const path = await import("node:path");',
      'const installer = await import("./src/installer.ts");',
      "const home = " + JSON.stringify(home) + ";",
      "const binDir = " + JSON.stringify(binDir) + ";",
      "const configHome = " + JSON.stringify(configHome) + ";",
      "const fakeBin = " + JSON.stringify(fakeBin) + ";",
      "const log = " + JSON.stringify(log) + ";",
      "const legacyInstall = " + JSON.stringify(legacyInstall) + ";",
      "const legacyState = " + JSON.stringify(legacyState) + ";",
      "const legacyLauncher = " + JSON.stringify(legacyLauncher) + ";",
      "const legacyUnit = " + JSON.stringify(legacyUnit) + ";",
      'const locations = { home, installRoot: path.join(home, ".local", "share", "pontivus-order"), binDir, stateRoot: path.join(home, ".local", "state", "pontivus-order"), bind: "127.0.0.1:7347", userConfigHome: configHome };',
      'const environment = { ...process.env, HOME: home, PATH: fakeBin + ":" + (process.env.PATH ?? ""), SYSTEMCTL_LOG: log };',
      "const first = installer.migrateLegacyGateweftInstallation(locations, environment);",
      'const migrated = { detected:first.detected, installMoved:first.installMoved, stateMoved:first.stateMoved, serviceWasActive:first.serviceWasActive, legacyInstallGone:!fs.existsSync(legacyInstall), legacyStateGone:!fs.existsSync(legacyState), marker:fs.readFileSync(path.join(locations.installRoot,"marker"),"utf8"), db:fs.readFileSync(path.join(locations.stateRoot,"order.sqlite3"),"utf8"), wal:fs.readFileSync(path.join(locations.stateRoot,"order.sqlite3-wal"),"utf8"), launcherRetained:fs.existsSync(legacyLauncher), unitRetained:fs.existsSync(legacyUnit) };',
      "installer.rollbackLegacyGateweftMigration(first, locations, environment);",
      'const rolledBack = { orderInstallGone:!fs.existsSync(locations.installRoot), orderStateGone:!fs.existsSync(locations.stateRoot), marker:fs.readFileSync(path.join(legacyInstall,"marker"),"utf8"), db:fs.readFileSync(path.join(legacyState,"gateweft.sqlite3"),"utf8") };',
      "const second = installer.migrateLegacyGateweftInstallation(locations, environment);",
      "installer.retireLegacyGateweftArtifacts(second, locations, environment);",
      'const retired = { launcherGone:!fs.existsSync(legacyLauncher), unitGone:!fs.existsSync(legacyUnit), orderInstallExists:fs.existsSync(locations.installRoot), orderStateExists:fs.existsSync(locations.stateRoot) };',
      'console.log(JSON.stringify({migrated, rolledBack, retired, log:fs.readFileSync(log,"utf8")}));',
    ]);

    const evidence = result.stdout.trim().split("\n").at(-1);
    if (!evidence) throw new Error("migration proof emitted no JSON evidence");
    const parsed = JSON.parse(evidence);
    expect(parsed.migrated).toEqual({
      detected: true,
      installMoved: true,
      stateMoved: true,
      serviceWasActive: true,
      legacyInstallGone: true,
      legacyStateGone: true,
      marker: "old install\n",
      db: "db",
      wal: "wal",
      launcherRetained: true,
      unitRetained: true,
    });
    expect(parsed.rolledBack).toEqual({
      orderInstallGone: true,
      orderStateGone: true,
      marker: "old install\n",
      db: "db",
    });
    expect(parsed.retired).toEqual({
      launcherGone: true,
      unitGone: true,
      orderInstallExists: true,
      orderStateExists: true,
    });
    expect(parsed.log).toContain("--user stop gateweft.service");
    expect(parsed.log).toContain("--user restart gateweft.service");
    expect(parsed.log).toContain("--user disable gateweft.service");
  });

  it("blocks a legacy target manifest without silently creating current authority", () => {
    const root = tempDir("order-legacy-manifest-");
    writeFileSync(join(root, "AGENTS.md"), "# repository authority\n");
    writeFileSync(join(root, "gateweft.toml"), 'version = 1\nprojectId = "legacy"\n');

    for (const args of [
      ["init", "-q"],
      ["config", "user.name", "Order Test"],
      ["config", "user.email", "order@example.invalid"],
      ["add", "."],
      ["commit", "-qm", "fixture"],
    ] as const) {
      const git = spawnSync("git", [...args], { cwd: root, encoding: "utf8" });
      if (git.status !== 0) throw new Error(git.stderr);
    }

    const result = runBun([
      'const project = await import("./src/shell/project.ts");',
      "await project.prepareProjectRootForInstall(" + JSON.stringify(root) + ");",
    ], { allowFailure: true });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("legacy gateweft.toml");
    expect(result.stderr).toContain("pontivus-order.toml");
    expect(existsSync(join(root, "pontivus-order.toml"))).toBe(false);
  });
});
