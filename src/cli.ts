import { createInterface } from "node:readline/promises";

import { orderVersion } from "./version.ts";

import {
  loadDaemonToken,
  resolveStateRoot,
} from "./shell/runtime.ts";
import {
  loginOpenCodeProvider,
} from "./shell/opencode.ts";
import {
  runGuidedSetup,
  type SetupQuestion,
} from "./shell/setup.ts";
import {
  resolveDaemonBind,
  startOrderDaemon,
} from "./daemon/server.ts";

const jsonHeaders = {
  "Content-Type": "application/json",
} as const;

const requireSuccess = async (response: Response): Promise<Response> => {
  if (response.ok) return response;
  let detail = `HTTP ${response.status}`;
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      detail = body.message;
    }
  } catch {
    // Keep status detail when the daemon did not return canonical JSON.
  }
  throw new TypeError(detail);
};

const daemonRequest = async (
  environment: NodeJS.ProcessEnv,
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const stateRoot = resolveStateRoot(environment);
  const token = loadDaemonToken(stateRoot);
  const bind = resolveDaemonBind(environment.PONTIVUS_ORDER_BIND);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return requireSuccess(await fetch(`${bind.origin}${path}`, {
    ...init,
    headers,
  }));
};

const waitForSignal = (): Promise<"SIGINT" | "SIGTERM"> =>
  new Promise((resolvePromise) => {
    const onInt = (): void => resolvePromise("SIGINT");
    const onTerm = (): void => resolvePromise("SIGTERM");
    process.once("SIGINT", onInt);
    process.once("SIGTERM", onTerm);
  });

type Question = SetupQuestion;

const terminalQuestion: Question = async (prompt) => {
  const input = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await input.question(prompt);
  } finally {
    input.close();
  }
};

const usage =
  "usage: order --version | daemon | setup [--reconfigure] | open | status | tick | provider login <provider>";

export const runCli = async (
  argv: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
  writeStdout: (value: string) => void = (value) => process.stdout.write(value),
  writeStderr: (value: string) => void = (value) => process.stderr.write(value),
  question: Question = terminalQuestion,
): Promise<number> => {
  if (argv.length === 1 && argv[0] === "--version") {
    writeStdout(`${orderVersion}\n`);
    return 0;
  }

  if (
    (argv.length === 1 && argv[0] === "setup") ||
    (argv.length === 2 && argv[0] === "setup" && argv[1] === "--reconfigure")
  ) {
    return runGuidedSetup(argv.length === 2, environment, writeStdout, question);
  }

  if (argv.length === 1 && argv[0] === "daemon") {
    const daemon = await startOrderDaemon(environment);
    try {
      await waitForSignal();
    } finally {
      await daemon.stop();
    }
    return 0;
  }

  if (argv.length === 1 && argv[0] === "open") {
    const response = await daemonRequest(environment, "/api/auth/connect-token", {
      method: "POST",
      headers: jsonHeaders,
      body: "{}",
    });
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("token" in body) ||
      typeof body.token !== "string"
    ) {
      throw new TypeError("daemon returned an invalid connect-token response");
    }
    const bind = resolveDaemonBind(environment.PONTIVUS_ORDER_BIND);
    writeStdout(`${bind.origin}/connect?token=${body.token}\n`);
    return 0;
  }

  if (argv.length === 1 && argv[0] === "status") {
    const bind = resolveDaemonBind(environment.PONTIVUS_ORDER_BIND);
    const response = await requireSuccess(await fetch(`${bind.origin}/api/health`));
    writeStdout(`${JSON.stringify(await response.json())}\n`);
    return 0;
  }

  if (argv.length === 1 && argv[0] === "tick") {
    const response = await daemonRequest(environment, "/api/tick", {
      method: "POST",
      headers: jsonHeaders,
      body: "{}",
    });
    writeStdout(`${JSON.stringify(await response.json())}\n`);
    return 0;
  }

  if (
    argv.length === 3 &&
    argv[0] === "provider" &&
    argv[1] === "login" &&
    argv[2] !== ""
  ) {
    const stateRoot = resolveStateRoot(environment);
    const result = await loginOpenCodeProvider(
      stateRoot,
      process.cwd(),
      argv[2]!,
      environment,
    );
    return result.cancelled ? 130 : result.exitCode;
  }

  writeStderr(`${usage}\n`);
  return 2;
};

if (import.meta.main) {
  runCli(Bun.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    },
  );
}
