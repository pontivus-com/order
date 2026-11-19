import { resolve, sep } from "node:path";

import {
  GateIdSchema,
  type GateId,
  type ProjectManifest,
} from "../core/contracts.ts";
import { resolveVerificationGate } from "./project.ts";

export const processOutputLimitBytes = 64 * 1024 * 1024;
const terminationGraceMillis = 5_000;
const groupPollMillis = 50;

export type ProcessResult = Readonly<{
  exitCode: number;
  stdout: Uint8Array;
  stderr: Uint8Array;
  timedOut: boolean;
  cancelled: boolean;
}>;

export type TerminalProcessResult = Readonly<{
  exitCode: number;
  cancelled: boolean;
}>;

export type ManagedProcess = Readonly<{
  processGroupId: number;
  stdout: ReadableStream<Uint8Array> | number | undefined;
  stderr: ReadableStream<Uint8Array> | number | undefined;
  exited: Promise<number>;
  terminate: () => Promise<number>;
}>;

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

const asErrorCode = (error: unknown): string | null =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : null;

const processGroupExists = (processGroupId: number): boolean => {
  try {
    process.kill(-processGroupId, 0);
    return true;
  } catch (error) {
    if (asErrorCode(error) === "ESRCH") return false;
    throw error;
  }
};

const signalProcessGroup = (
  processGroupId: number,
  signal: "SIGTERM" | "SIGKILL",
): void => {
  try {
    process.kill(-processGroupId, signal);
  } catch (error) {
    if (asErrorCode(error) === "ESRCH") return;
    throw error;
  }
};

const awaitGroupExit = async (
  processGroupId: number,
  deadlineMillis: number,
): Promise<boolean> => {
  while (Date.now() < deadlineMillis) {
    if (!processGroupExists(processGroupId)) return true;
    await sleep(groupPollMillis);
  }
  return !processGroupExists(processGroupId);
};

const terminateProcessGroup = async (
  processGroupId: number,
  childExit: Promise<number>,
): Promise<number> => {
  signalProcessGroup(processGroupId, "SIGTERM");
  const termDeadline = Date.now() + terminationGraceMillis;
  if (!(await awaitGroupExit(processGroupId, termDeadline))) {
    signalProcessGroup(processGroupId, "SIGKILL");
  }

  const exitCode = await childExit;
  const killDeadline = Date.now() + terminationGraceMillis;
  if (!(await awaitGroupExit(processGroupId, killDeadline))) {
    throw new TypeError("process group still exists after SIGKILL and child settlement");
  }
  return exitCode;
};

const validateProcessRequest = (
  argv: readonly string[],
  cwd: string,
  environment: Readonly<Record<string, string>>,
): void => {
  if (argv.length === 0 || argv[0] === "") {
    throw new TypeError("process argv must contain an executable");
  }
  if (cwd.length === 0) throw new TypeError("process cwd must be non-empty");
  if (process.platform !== "linux") {
    throw new TypeError("Order process-group execution requires Linux");
  }
  for (const [name, value] of Object.entries(environment)) {
    if (name.length === 0 || name.includes("=") || value.includes("\0")) {
      throw new TypeError("process environment contains an invalid entry");
    }
  }
};

export const startManagedProcess = (
  argv: readonly string[],
  cwd: string,
  environment: Readonly<Record<string, string>>,
  options: Readonly<{
    terminal?: boolean;
    stdin?: Uint8Array;
  }> = {},
): ManagedProcess => {
  validateProcessRequest(argv, cwd, environment);
  if (options.terminal && options.stdin !== undefined) {
    throw new TypeError("terminal process cannot also receive buffered stdin");
  }

  const child = Bun.spawn([...argv], {
    cwd,
    env: { ...environment },
    detached: true,
    stdin: options.terminal ? "inherit" : (options.stdin ?? "ignore"),
    stdout: options.terminal ? "inherit" : "pipe",
    stderr: options.terminal ? "inherit" : "pipe",
  });

  const processGroupId = child.pid;
  if (!Number.isInteger(processGroupId) || processGroupId <= 0) {
    throw new TypeError("spawned process did not expose a valid process-group id");
  }

  const exited = child.exited;
  return {
    processGroupId,
    stdout: child.stdout,
    stderr: child.stderr,
    exited,
    terminate: async () =>
      processGroupExists(processGroupId)
        ? terminateProcessGroup(processGroupId, exited)
        : exited,
  };
};

const readBounded = async (
  stream: ReadableStream<Uint8Array> | number | undefined,
  requestStop: () => void,
): Promise<Uint8Array> => {
  if (!(stream instanceof ReadableStream)) return new Uint8Array();

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      length += value.byteLength;
      if (length > processOutputLimitBytes) {
        requestStop();
        throw new TypeError("process output exceeded the bounded capture limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
};

export const runProcess = async (
  argv: readonly string[],
  cwd: string,
  environment: Readonly<Record<string, string>>,
  timeoutSeconds: number,
  cancellationSignal?: AbortSignal,
  stdin?: Uint8Array,
): Promise<ProcessResult> => {
  if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 1 || timeoutSeconds > 86400) {
    throw new TypeError("process timeoutSeconds must be an integer from 1 through 86400");
  }

  const child = startManagedProcess(argv, cwd, environment, { stdin });

  let stopReason: "TIMEOUT" | "CANCELLED" | "OUTPUT_LIMIT" | null = null;
  let resolveStop!: (reason: "TIMEOUT" | "CANCELLED" | "OUTPUT_LIMIT") => void;
  const stopPromise = new Promise<"TIMEOUT" | "CANCELLED" | "OUTPUT_LIMIT">((resolvePromise) => {
    resolveStop = resolvePromise;
  });
  const requestStop = (reason: "TIMEOUT" | "CANCELLED" | "OUTPUT_LIMIT"): void => {
    if (stopReason !== null) return;
    stopReason = reason;
    resolveStop(reason);
  };

  const stdoutPromise = readBounded(child.stdout, () => requestStop("OUTPUT_LIMIT"));
  const stderrPromise = readBounded(child.stderr, () => requestStop("OUTPUT_LIMIT"));
  const timeout = setTimeout(() => requestStop("TIMEOUT"), timeoutSeconds * 1000);
  const abortListener = (): void => requestStop("CANCELLED");
  if (cancellationSignal?.aborted) requestStop("CANCELLED");
  cancellationSignal?.addEventListener("abort", abortListener, { once: true });

  let exitCode: number;
  try {
    const outcome = await Promise.race([
      child.exited.then((code) => ({ kind: "EXIT" as const, code })),
      stopPromise.then((reason) => ({ kind: "STOP" as const, reason })),
    ]);
    exitCode =
      outcome.kind === "EXIT"
        ? outcome.code
        : await child.terminate();

    const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise]);
    return {
      exitCode,
      stdout,
      stderr,
      timedOut: stopReason === "TIMEOUT",
      cancelled: stopReason === "CANCELLED",
    };
  } catch (error) {
    if (processGroupExists(child.processGroupId)) {
      await child.terminate();
    } else {
      await child.exited;
    }
    await Promise.allSettled([stdoutPromise, stderrPromise]);
    throw error;
  } finally {
    clearTimeout(timeout);
    cancellationSignal?.removeEventListener("abort", abortListener);
  }
};

export const runTerminalProcess = async (
  argv: readonly string[],
  cwd: string,
  environment: Readonly<Record<string, string>>,
  cancellationSignal?: AbortSignal,
): Promise<TerminalProcessResult> => {
  const child = startManagedProcess(argv, cwd, environment, { terminal: true });
  let cancelled = false;
  let resolveStop!: () => void;
  const stopPromise = new Promise<void>((resolvePromise) => {
    resolveStop = resolvePromise;
  });
  const requestStop = (): void => {
    if (cancelled) return;
    cancelled = true;
    resolveStop();
  };
  const interrupt = (): void => requestStop();
  const terminate = (): void => requestStop();

  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  const abortListener = (): void => requestStop();
  if (cancellationSignal?.aborted) requestStop();
  cancellationSignal?.addEventListener("abort", abortListener, { once: true });

  try {
    const outcome = await Promise.race([
      child.exited.then((exitCode) => ({ kind: "EXIT" as const, exitCode })),
      stopPromise.then(() => ({ kind: "STOP" as const })),
    ]);
    const exitCode =
      outcome.kind === "EXIT"
        ? outcome.exitCode
        : await child.terminate();
    return { exitCode, cancelled };
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
    cancellationSignal?.removeEventListener("abort", abortListener);
  }
};

const inheritedEnvironment = (
  names: readonly string[],
  source: NodeJS.ProcessEnv,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const name of names) {
    const value = source[name];
    if (value !== undefined) result[name] = value;
  }
  return result;
};

const resolveGateCwd = (repositoryRoot: string, cwd: string): string => {
  const root = resolve(repositoryRoot);
  const target = cwd === "." ? root : resolve(root, cwd);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new TypeError("verification cwd escapes repository root");
  }
  return target;
};

export const runVerificationGate = async (
  repositoryRoot: string,
  manifest: ProjectManifest,
  gateId: GateId,
  environment: NodeJS.ProcessEnv = process.env,
  cancellationSignal?: AbortSignal,
): Promise<ProcessResult> => {
  const canonicalGateId = GateIdSchema.parse(gateId);
  const gate = resolveVerificationGate(manifest, canonicalGateId);
  return runProcess(
    gate.argv,
    resolveGateCwd(repositoryRoot, gate.cwd),
    inheritedEnvironment(gate.inheritEnv, environment),
    gate.timeoutSeconds,
    cancellationSignal,
  );
};
