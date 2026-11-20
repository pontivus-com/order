import { spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
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
  record({ kind: "login", args });
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

record({ kind: "serve", args });
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
      "Select model: ",
      "Target repository root: ",
      "Add another target repository root (blank to continue): ",
      "STAGE reference root (blank for none): ",
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

    const output = runSetup(home, stateRoot, binary, {});
    expect(output.code).toBe(2);
    expect(output.config).toBeNull();
    expect(output.prompts).toEqual([]);
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
    const code = `
      const setup = await import("./src/shell/setup.ts");
      const cfg = await import("./src/shell/config.ts");
      const result = await setup.runInstallerGuidedSetup(
        ${JSON.stringify(setupEnvironment(home, stateRoot, binary))},
        () => {},
        async (prompt) => { throw new Error("cancelled setup must not prompt: " + prompt); },
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
