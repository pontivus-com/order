import { existsSync, mkdirSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import {
  OpenCode,
  type OpenCodeClient,
  type PermissionRule,
  type SessionInfo,
  type SessionMessageInfo,
} from "@opencode/client";
import {
  OpenCodeModelRefSchema,
  ProviderDiagnosticRecordSchema,
  ProviderTurnOutcomeSchema,
  RunEventPayloadJsonSchemaText,
  RunEventPayloadSchema,
  type ExecutionTask,
  type OpenCodeModelRef,
  type ProviderDiagnosticRecord,
  type ProviderTurnOutcome,
  type RepositoryPath,
  type Run,
  type RunEventId,
  type RunEventPayload,
  type RunRole,
} from "../core/contracts.ts";
import { canonicalJson } from "../core/canonical.ts";
import {
  builderProviderTags,
  providerEventIsAdmitted,
  reviewerProviderTags,
  stageProviderTags,
} from "../core/execution.ts";
import { enumerateAgentInstructions } from "./repository.ts";
import {
  processOutputLimitBytes,
  runProcess,
  runTerminalProcess,
  startManagedProcess,
  type ManagedProcess,
  type TerminalProcessResult,
} from "./process.ts";
import { nowIsoDateTime, secureTokenHex, sha256TextHex } from "./runtime.ts";

const openCodeVersion = "2.2.6";
const openCodeVersionOutput = `opencode v${openCodeVersion}`;
const startupTimeoutMillis = 60_000;
const productiveTurnTimeoutMillis = 3_600_000;
const terminalPollMillis = 250;
const postInterruptPollMillis = 5_000;
const diagnosticStderrHeadBytes = 8 * 1024;
const diagnosticStderrTailBytes = 8 * 1024;
const diagnosticLineCharacterLimit = 16 * 1024;
const diagnosticTruncationMarker = new TextEncoder().encode("\n...[stderr truncated]...\n");
const diagnosticEncoder = new TextEncoder();
const sensitiveEnvironmentName = /(?:TOKEN|SECRET|PASSWORD|API_?KEY|CREDENTIAL|AUTH)/i;

const runtimeEnvironmentNames = [
  "PATH",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "TMPDIR",
  "TMP",
  "TEMP",
  "TERM",
  "COLORTERM",
  "NO_COLOR",
] as const;

type DiagnosticStderrCapture = Readonly<{
  reset: () => void;
  record: (line: string) => void;
  snapshot: () => Uint8Array | null;
  redact: (text: string) => string;
}>;

export type OpenCodeServer = Readonly<{
  client: OpenCodeClient;
  process: ManagedProcess;
  model: OpenCodeModelRef;
  workspace: string;
  diagnosticStderr: DiagnosticStderrCapture;
}>;

const concatBytes = (
  left: Uint8Array,
  right: Uint8Array,
): Uint8Array => {
  const result = new Uint8Array(left.byteLength + right.byteLength);
  result.set(left);
  result.set(right, left.byteLength);
  return result;
};

const knownDiagnosticSecrets = (
  sourceEnvironment: NodeJS.ProcessEnv,
  password: string,
): readonly string[] =>
  [...new Set([
    password,
    basicAuthorization(password),
    ...Object.entries(sourceEnvironment)
      .flatMap(([name, value]) =>
        sensitiveEnvironmentName.test(name) &&
        value !== undefined &&
        value.length > 0
          ? [value]
          : []
      ),
  ])].filter((value) => value.length > 0);

const redactDiagnosticText = (
  text: string,
  secrets: readonly string[],
): string =>
  text
    .split(/\r?\n/)
    .map((line) =>
      secrets.some((secret) => line.includes(secret))
        ? "[REDACTED SECRET LINE]"
        : line
    )
    .join("\n");

const boundedDiagnosticLine = (line: string): string => {
  if (line.length <= diagnosticLineCharacterLimit) return line;
  const half = Math.floor(diagnosticLineCharacterLimit / 2);
  return `${line.slice(0, half)}...[line truncated]...${line.slice(-half)}`;
};

const createDiagnosticStderrCapture = (
  secrets: readonly string[],
): DiagnosticStderrCapture => {
  let complete = new Uint8Array();
  let head = new Uint8Array();
  let tail = new Uint8Array();
  let truncated = false;

  const reset = (): void => {
    complete = new Uint8Array();
    head = new Uint8Array();
    tail = new Uint8Array();
    truncated = false;
  };

  const record = (line: string): void => {
    const redacted = redactDiagnosticText(boundedDiagnosticLine(line), secrets);
    const chunk = diagnosticEncoder.encode(redacted + "\n");
    if (!truncated) {
      const combined = concatBytes(complete, chunk);
      if (combined.byteLength <= diagnosticStderrHeadBytes + diagnosticStderrTailBytes) {
        complete = combined;
        return;
      }
      head = combined.slice(0, diagnosticStderrHeadBytes);
      tail = combined.slice(-diagnosticStderrTailBytes);
      complete = new Uint8Array();
      truncated = true;
      return;
    }
    tail = concatBytes(tail, chunk).slice(-diagnosticStderrTailBytes);
  };

  const snapshot = (): Uint8Array | null => {
    const bytes = truncated
      ? concatBytes(concatBytes(head, diagnosticTruncationMarker), tail)
      : complete;
    return bytes.byteLength === 0 ? null : bytes.slice();
  };

  return {
    reset,
    record,
    snapshot,
    redact: (text) => redactDiagnosticText(text, secrets),
  };
};

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

const requireAbsoluteStateRoot = (stateRoot: string): string => {
  if (!isAbsolute(stateRoot)) throw new TypeError("OpenCode state root must be absolute");
  return stateRoot;
};

const requireNonEmpty = (name: string, value: string | undefined): string => {
  if (value === undefined || value.length === 0 || value.includes("\0")) {
    throw new TypeError(`${name} must be non-empty`);
  }
  return value;
};

export const resolveOpenCodeBinary = (
  environment: NodeJS.ProcessEnv = process.env,
): string => {
  const value = environment.PONTIVUS_ORDER_OPENCODE_BIN;
  return value === undefined ? "opencode" : requireNonEmpty("PONTIVUS_ORDER_OPENCODE_BIN", value);
};

const copyRuntimeEnvironment = (
  source: NodeJS.ProcessEnv,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const name of runtimeEnvironmentNames) {
    const value = source[name];
    if (value !== undefined) result[name] = value;
  }
  return result;
};

const prepareOpenCodeState = (stateRoot: string): Readonly<{
  home: string;
  config: string;
  data: string;
  state: string;
  cache: string;
  database: string;
}> => {
  const root = join(requireAbsoluteStateRoot(stateRoot), "opencode");
  const directories = {
    home: join(root, "home"),
    config: join(root, "config"),
    data: join(root, "data"),
    state: join(root, "state"),
    cache: join(root, "cache"),
  };
  mkdirSync(root, { recursive: true, mode: 0o700 });
  for (const directory of Object.values(directories)) {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
  }
  return { ...directories, database: join(root, "opencode.db") };
};

export const buildOpenCodeEnvironment = (
  stateRoot: string,
  source: NodeJS.ProcessEnv = process.env,
  password?: string,
): Readonly<Record<string, string>> => {
  const paths = prepareOpenCodeState(stateRoot);
  return {
    ...copyRuntimeEnvironment(source),
    HOME: paths.home,
    XDG_CONFIG_HOME: paths.config,
    XDG_DATA_HOME: paths.data,
    XDG_STATE_HOME: paths.state,
    XDG_CACHE_HOME: paths.cache,
    OPENCODE_DB: paths.database,
    OPENCODE_DISABLE_PROJECT_CONFIG: "1",
    OPENCODE_DISABLE_CLAUDE_CODE: "1",
    OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: "1",
    OPENCODE_DISABLE_AUTOUPDATE: "1",
    ...(password === undefined ? {} : { OPENCODE_PASSWORD: password }),
  };
};

export const assertNoOpenCodeSystemConfig = (
  path = "/etc/opencode",
): void => {
  if (existsSync(path)) {
    throw new TypeError(`OpenCode system configuration exists at ${path}`);
  }
};

const decodeText = (bytes: Uint8Array): string =>
  new TextDecoder("utf-8", { fatal: true }).decode(bytes);

export const assertOpenCodeBinaryVersion = async (
  binary: string,
  cwd: string,
  environment: Readonly<Record<string, string>>,
): Promise<void> => {
  const result = await runProcess([binary, "--version"], cwd, environment, 30);
  if (result.timedOut || result.cancelled || result.exitCode !== 0) {
    throw new TypeError("OpenCode binary version probe failed");
  }
  if (decodeText(result.stdout).trim() !== openCodeVersionOutput) {
    throw new TypeError(`OpenCode binary must be exactly ${openCodeVersion}`);
  }
};

const basicAuthorization = (password: string): string =>
  `Basic ${Buffer.from(`opencode:${password}`, "utf8").toString("base64")}`;

const parseLoopbackEndpoint = (line: string): string | null => {
  const match = /^server listening on (http:\/\/127\.0\.0\.1:[0-9]+)$/.exec(line);
  const endpoint = match?.[1];
  if (endpoint === undefined) return null;
  const url = new URL(endpoint);
  const port = Number(url.port);
  if (
    url.protocol !== "http:" ||
    url.hostname !== "127.0.0.1" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new TypeError("OpenCode reported an invalid loopback endpoint");
  }
  return url.origin;
};

const requireReadable = (
  stream: ReadableStream<Uint8Array> | number | undefined,
  name: string,
): ReadableStream<Uint8Array> => {
  if (!(stream instanceof ReadableStream)) {
    throw new TypeError(`OpenCode ${name} is not readable`);
  }
  return stream;
};

const consumeTextStream = async (
  stream: ReadableStream<Uint8Array>,
  onLine: (line: string) => void,
): Promise<void> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let total = 0;
  let pending = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > processOutputLimitBytes) {
        throw new TypeError("OpenCode output exceeded the bounded process-output limit");
      }
      pending += decoder.decode(value, { stream: true });
      while (true) {
        const newline = pending.indexOf("\n");
        if (newline === -1) break;
        const line = pending.slice(0, newline).replace(/\r$/, "");
        pending = pending.slice(newline + 1);
        onLine(line);
      }
    }
    pending += decoder.decode();
    if (pending.length > 0) onLine(pending.replace(/\r$/, ""));
  } finally {
    reader.releaseLock();
  }
};

const startOutputDrain = (
  child: ManagedProcess,
  diagnosticStderr: DiagnosticStderrCapture,
): Readonly<{ endpoint: Promise<string> }> => {
  let settled = false;
  let resolveEndpoint!: (endpoint: string) => void;
  let rejectEndpoint!: (error: unknown) => void;
  const endpoint = new Promise<string>((resolvePromise, rejectPromise) => {
    resolveEndpoint = resolvePromise;
    rejectEndpoint = rejectPromise;
  });

  const stdout = consumeTextStream(
    requireReadable(child.stdout, "stdout"),
    (line) => {
      if (settled) return;
      const parsed = parseLoopbackEndpoint(line);
      if (parsed !== null) {
        settled = true;
        resolveEndpoint(parsed);
      }
    },
  );
  const stderr = consumeTextStream(
    requireReadable(child.stderr, "stderr"),
    diagnosticStderr.record,
  );

  const fail = (error: unknown): void => {
    if (!settled) {
      settled = true;
      rejectEndpoint(error);
    }
    void child.terminate().catch(() => undefined);
  };
  void stdout.then(
    () => {
      if (!settled) fail(new TypeError("OpenCode stdout closed before readiness"));
    },
    fail,
  );
  void stderr.catch(fail);
  void child.exited.then((exitCode) => {
    if (!settled) fail(new TypeError(`OpenCode exited before readiness with code ${exitCode}`));
  });

  return { endpoint };
};

const withDeadlineSignal = (deadline: number, maximumMillis: number): AbortSignal => {
  const remaining = Math.max(1, deadline - Date.now());
  return AbortSignal.timeout(Math.min(remaining, maximumMillis));
};

const waitForServerInfo = async (
  client: OpenCodeClient,
  deadline: number,
): Promise<void> => {
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const info = await client.server.info({
        signal: withDeadlineSignal(deadline, 2_000),
      });
      if (info.version !== openCodeVersion) {
        throw new TypeError(
          `OpenCode server version ${info.version} does not match ${openCodeVersion}`,
        );
      }
      return;
    } catch (error) {
      lastError = error;
      if (error instanceof TypeError && error.message.includes("does not match")) throw error;
      await sleep(100);
    }
  }
  throw new TypeError("OpenCode server readiness timed out", { cause: lastError });
};

const requireConfiguredModel = async (
  client: OpenCodeClient,
  workspace: string,
  model: OpenCodeModelRef,
  deadline: number,
): Promise<void> => {
  const result = await client.model.list(
    { location: { directory: workspace } },
    { signal: withDeadlineSignal(deadline, Math.max(1, deadline - Date.now())) },
  );
  if (!result.data.some((candidate) =>
    candidate.enabled &&
    candidate.providerID === model.providerID &&
    candidate.id === model.id
  )) {
    throw new TypeError(
      `configured OpenCode model is unavailable: ${model.providerID}/${model.id}`,
    );
  }
};

type OpenCodeProviderProcess = Readonly<{
  client: OpenCodeClient;
  process: ManagedProcess;
  workspace: string;
  deadline: number;
  diagnosticStderr: DiagnosticStderrCapture;
}>;

const startOpenCodeProviderProcess = async (
  stateRoot: string,
  workspace: string,
  sourceEnvironment: NodeJS.ProcessEnv,
): Promise<OpenCodeProviderProcess> => {
  assertNoOpenCodeSystemConfig();
  const binary = resolveOpenCodeBinary(sourceEnvironment);
  const password = secureTokenHex();
  const environment = buildOpenCodeEnvironment(stateRoot, sourceEnvironment, password);
  await assertOpenCodeBinaryVersion(binary, workspace, environment);

  const child = startManagedProcess(
    [binary, "serve", "--hostname", "127.0.0.1", "--port", "0"],
    workspace,
    environment,
  );
  const diagnosticStderr = createDiagnosticStderrCapture(
    knownDiagnosticSecrets(sourceEnvironment, password),
  );
  const drain = startOutputDrain(child, diagnosticStderr);
  const deadline = Date.now() + startupTimeoutMillis;

  try {
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    const endpoint = await Promise.race([
      drain.endpoint,
      new Promise<never>((_, reject) => {
        const delay = Math.max(1, deadline - Date.now());
        startupTimer = setTimeout(
          () => reject(new TypeError("OpenCode startup timed out")),
          delay,
        );
      }),
    ]).finally(() => {
      if (startupTimer !== undefined) clearTimeout(startupTimer);
    });
    const client = OpenCode.make({
      baseUrl: endpoint,
      headers: { Authorization: basicAuthorization(password) },
    });
    await waitForServerInfo(client, deadline);
    return { client, process: child, workspace, deadline, diagnosticStderr };
  } catch (error) {
    await child.terminate().catch(() => undefined);
    throw error;
  }
};

export const listAvailableOpenCodeModels = async (
  stateRoot: string,
  workspace: string,
  sourceEnvironment: NodeJS.ProcessEnv = process.env,
): Promise<readonly OpenCodeModelRef[]> => {
  const provider = await startOpenCodeProviderProcess(
    stateRoot,
    workspace,
    sourceEnvironment,
  );
  try {
    const result = await provider.client.model.list(
      { location: { directory: workspace } },
      { signal: withDeadlineSignal(provider.deadline, Math.max(1, provider.deadline - Date.now())) },
    );
    const models = new Map<string, OpenCodeModelRef>();
    for (const candidate of result.data) {
      if (!candidate.enabled) continue;
      const model = OpenCodeModelRefSchema.parse({
        providerID: candidate.providerID,
        id: candidate.id,
      });
      models.set(model.providerID + "\0" + model.id, model);
    }
    return [...models.values()].sort((left, right) =>
      (left.providerID + "/" + left.id).localeCompare(right.providerID + "/" + right.id)
    );
  } finally {
    await provider.process.terminate();
  }
};

export const startOpenCodeServer = async (
  stateRoot: string,
  workspace: string,
  model: OpenCodeModelRef,
  sourceEnvironment: NodeJS.ProcessEnv = process.env,
): Promise<OpenCodeServer> => {
  const configuredModel = OpenCodeModelRefSchema.parse(model);
  const provider = await startOpenCodeProviderProcess(
    stateRoot,
    workspace,
    sourceEnvironment,
  );
  try {
    await requireConfiguredModel(
      provider.client,
      workspace,
      configuredModel,
      provider.deadline,
    );
    return {
      client: provider.client,
      process: provider.process,
      model: configuredModel,
      workspace,
      diagnosticStderr: provider.diagnosticStderr,
    };
  } catch (error) {
    await provider.process.terminate().catch(() => undefined);
    throw error;
  }
};
export const stopOpenCodeServer = async (
  server: OpenCodeServer,
): Promise<void> => {
  await server.process.terminate();
};

const denyAllRule = (): PermissionRule => ({
  action: "*",
  resource: "*",
  effect: "deny",
});

export const openCodePermissionRules = (
  role: RunRole,
  task: ExecutionTask | null,
  referenceRoots: readonly string[],
): readonly PermissionRule[] => {
  if (role !== "STAGE" && task === null) {
    throw new TypeError("post-signoff OpenCode permissions require an ExecutionTask");
  }

  const rules: PermissionRule[] = [
    denyAllRule(),
    { action: "read", resource: "*", effect: "allow" },
    { action: "glob", resource: "*", effect: "allow" },
    { action: "grep", resource: "*", effect: "allow" },
  ];

  if (role === "STAGE") {
    for (const root of referenceRoots) {
      rules.push({
        action: "external_directory",
        resource: root === "/" ? "/*" : root + "/*",
        effect: "allow",
      });
    }
  }

  if (role === "BUILDER" || role === "REMEDIATOR") {
    if (task === null) {
      throw new TypeError("mutating OpenCode permissions require an ExecutionTask");
    }
    for (const path of task.changeSurface) {
      rules.push({ action: "edit", resource: path, effect: "allow" });
    }
  }
  return rules;
};

const samePermissions = (
  actual: readonly PermissionRule[] | undefined,
  expected: readonly PermissionRule[],
): boolean => canonicalJson(actual ?? []) === canonicalJson(expected);

export const assertAgentInstructionsResolved = async (
  workspace: string,
  resolvedP1Paths: readonly RepositoryPath[],
  task: ExecutionTask | null,
): Promise<void> => {
  const instructions = await enumerateAgentInstructions(workspace);
  const resolved = new Set(resolvedP1Paths);
  const surface = new Set(task?.changeSurface ?? []);

  for (const path of instructions) {
    if (!resolved.has(path)) {
      throw new TypeError(`repository instruction is not resolved material P1 authority: ${path}`);
    }
    if (surface.has(path)) {
      throw new TypeError(`ExecutionTask changeSurface contains signed repository instruction: ${path}`);
    }
  }
};

const requireSessionBinding = (
  session: SessionInfo,
  model: OpenCodeModelRef,
  permissions: readonly PermissionRule[],
): void => {
  if (
    session.model?.providerID !== model.providerID ||
    session.model.id !== model.id
  ) {
    throw new TypeError("OpenCode session did not retain the exact configured model");
  }
  if (!samePermissions(session.permissions, permissions)) {
    throw new TypeError("OpenCode session did not retain the exact permission profile");
  }
};

export const createOpenCodeSession = async (
  server: OpenCodeServer,
  role: RunRole,
  task: ExecutionTask | null,
  resolvedP1Paths: readonly RepositoryPath[],
  referenceRoots: readonly string[],
): Promise<string> => {
  await assertAgentInstructionsResolved(server.workspace, resolvedP1Paths, task);
  const permissions = openCodePermissionRules(role, task, referenceRoots);
  const created = await server.client.session.create({
    location: { directory: server.workspace },
  });
  await server.client.session.switchModel({
    sessionID: created.id,
    model: server.model,
  });
  await server.client.session.update({
    sessionID: created.id,
    permissions,
  });
  const rebound = await server.client.session.get({ sessionID: created.id });
  requireSessionBinding(rebound, server.model, permissions);
  return created.id;
};

export const openCodePromptId = (
  run: Pick<Run, "id" | "contextHash">,
  triggeringRunEventId: RunEventId,
): string =>
  "msg_" +
  sha256TextHex(
    canonicalJson({
      contextHash: run.contextHash,
      runEventId: triggeringRunEventId,
      runId: run.id,
    }),
  );

const formatRepairPromptId = (productivePromptId: string): string =>
  "msg_" +
  sha256TextHex(canonicalJson({ kind: "FORMAT_REPAIR", productivePromptId }));

const idleAdvanced = (
  current: number | undefined,
  prior: number | undefined,
): boolean =>
  current !== undefined && (prior === undefined || current > prior);

type ProviderFailurePhase = Exclude<
  ProviderDiagnosticRecord["failurePhase"],
  null
>;

type ProviderTurnFailure = TypeError & Readonly<{
  providerOutcome: ProviderTurnOutcome;
  providerFailurePhase: ProviderFailurePhase;
}>;

const providerTurnFailure = (
  providerOutcome: ProviderTurnOutcome,
  providerFailurePhase: ProviderFailurePhase,
  error: unknown,
): ProviderTurnFailure => {
  const message = error instanceof Error ? error.message : String(error);
  return Object.assign(new TypeError(message.length === 0 ? "OpenCode provider turn failed" : message), {
    providerOutcome,
    providerFailurePhase,
  });
};

const isProviderTurnFailure = (
  error: unknown,
): error is ProviderTurnFailure =>
  error instanceof TypeError &&
  "providerOutcome" in error &&
  ProviderTurnOutcomeSchema.safeParse(error.providerOutcome).success &&
  "providerFailurePhase" in error &&
  [
    "ADMISSION",
    "TRANSPORT",
    "PROVIDER",
    "COMPLETION",
    "PARSE",
    "FORMAT_REPAIR",
  ].includes(
    typeof error.providerFailurePhase === "string"
      ? error.providerFailurePhase
      : "",
  );

const pollForTerminal = async (
  client: OpenCodeClient,
  sessionID: string,
  priorIdle: number | undefined,
  deadline: number,
): Promise<SessionInfo> => {
  while (Date.now() < deadline) {
    let session: SessionInfo;
    try {
      session = await client.session.get({ sessionID });
    } catch (error) {
      throw providerTurnFailure("TRANSPORT_ERROR", "TRANSPORT", error);
    }
    if (idleAdvanced(session.time.idle, priorIdle) && session.outcome !== undefined) {
      return session;
    }
    await sleep(Math.min(terminalPollMillis, Math.max(1, deadline - Date.now())));
  }
  throw providerTurnFailure(
    "TIMEOUT",
    "COMPLETION",
    new TypeError("OpenCode productive turn did not reach a terminal projection"),
  );
};

const promptWithReconciliation = async (
  client: OpenCodeClient,
  sessionID: string,
  promptId: string,
  text: string,
): Promise<void> => {
  try {
    await client.session.prompt({ sessionID, id: promptId, text });
  } catch {
    try {
      await client.session.prompt({ sessionID, id: promptId, text });
    } catch (error) {
      throw providerTurnFailure("TRANSPORT_ERROR", "ADMISSION", error);
    }
  }
};

const completedAssistantText = (
  context: readonly SessionMessageInfo[],
  promptId: string,
): string => {
  const promptIndex = context.findIndex(
    (message) => message.type === "user" && message.id === promptId,
  );
  if (promptIndex === -1) {
    throw new TypeError("OpenCode final context does not contain the admitted prompt");
  }

  const assistant = [...context.slice(promptIndex + 1)]
    .reverse()
    .find((message) => message.type === "assistant");
  if (assistant === undefined) {
    throw new TypeError("OpenCode final context does not contain a completed assistant message");
  }

  const text = assistant.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
  if (text.length === 0) {
    throw new TypeError("OpenCode completed assistant message has no text content");
  }
  return text;
};

const parseProviderJsonArray = (text: string): readonly unknown[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError("OpenCode assistant output is not JSON", { cause: error });
  }
  if (!Array.isArray(parsed)) {
    throw new SyntaxError("OpenCode assistant output is not a JSON array");
  }
  return parsed;
};

const parseCanonicalProviderEvents = (
  text: string,
): readonly RunEventPayload[] =>
  parseProviderJsonArray(text).map((value) => RunEventPayloadSchema.parse(value));

const validateProviderAdmission = (
  role: RunRole,
  events: readonly RunEventPayload[],
): readonly RunEventPayload[] => {
  for (const event of events) {
    if (!providerEventIsAdmitted(role, event)) {
      throw new TypeError(`OpenCode emitted an event not admitted for role ${role}: ${event.tag}`);
    }
  }
  return events;
};

const providerTagsForRole = (role: RunRole): readonly string[] =>
  role === "STAGE"
    ? [...stageProviderTags]
    : role === "REVIEWER"
      ? [...reviewerProviderTags]
      : [...builderProviderTags];

const providerOutputContract = (role: RunRole): string =>
  [
    "Output contract:",
    "Return only a JSON array. Every array item must satisfy the canonical RunEventPayload JSON Schema below.",
    `For role ${role}, only these event tags are admitted: ${providerTagsForRole(role).join(", ")}.`,
    "Do not rename fields, add wrapper keys, or substitute synonyms.",
    role === "STAGE"
      ? "For ARTIFACT_PROPOSAL_CREATED, unifiedDiff must be a complete Git unified diff whose decoded string ends with LF (U+000A); in JSON encode that final LF as \\n immediately before the closing quote. Do not omit it and do not rely on Order to append or normalize patch bytes."
      : "",
    `Canonical RunEventPayload JSON Schema: ${RunEventPayloadJsonSchemaText}`,
  ].filter((value) => value.length > 0).join("\n");

const runPromptToText = async (
  client: OpenCodeClient,
  sessionID: string,
  promptId: string,
  prompt: string,
  timeoutMillis: number,
): Promise<string> => {
  let before: SessionInfo;
  try {
    before = await client.session.get({ sessionID });
  } catch (error) {
    throw providerTurnFailure("TRANSPORT_ERROR", "TRANSPORT", error);
  }

  const deadline = Date.now() + timeoutMillis;
  await promptWithReconciliation(client, sessionID, promptId, prompt);

  let terminal: SessionInfo;
  try {
    terminal = await pollForTerminal(
      client,
      sessionID,
      before.time.idle,
      deadline,
    );
  } catch (error) {
    if (!isProviderTurnFailure(error) || error.providerOutcome !== "TIMEOUT") {
      throw error;
    }
    try {
      await client.session.interrupt({ sessionID, resume: false });
    } catch {
      // The timeout remains the governing failure if interruption cannot be confirmed.
    }
    const interruptDeadline = Date.now() + postInterruptPollMillis;
    const afterInterrupt = await pollForTerminal(
      client,
      sessionID,
      before.time.idle,
      interruptDeadline,
    ).catch(() => undefined);
    if (afterInterrupt?.outcome !== "succeeded") throw error;
    terminal = afterInterrupt;
  }

  if (terminal.outcome !== "succeeded") {
    throw providerTurnFailure(
      terminal.outcome === "interrupted" ? "INTERRUPTED" : "FAILED",
      "PROVIDER",
      new TypeError(`OpenCode productive turn ended with outcome ${terminal.outcome}`),
    );
  }

  let context: readonly SessionMessageInfo[];
  try {
    context = await client.session.context({ sessionID });
  } catch (error) {
    throw providerTurnFailure("TRANSPORT_ERROR", "TRANSPORT", error);
  }
  try {
    return completedAssistantText(context, promptId);
  } catch (error) {
    throw providerTurnFailure("FAILED", "COMPLETION", error);
  }
};

const formatRepairPrompt = (role: RunRole): string =>
  [
    "Re-encode the immediately preceding answer without changing its meaning.",
    "Return only a valid JSON array. Do not add commentary, markdown fences, or new substantive content.",
    providerOutputContract(role),
  ].join("\n\n");

export const runOpenCodeTurn = async (
  server: OpenCodeServer,
  sessionID: string,
  run: Pick<Run, "id" | "contextHash">,
  triggeringRunEventId: RunEventId,
  role: RunRole,
  task: ExecutionTask | null,
  referenceRoots: readonly string[],
  prompt: string,
  onDiagnostics: (
    record: ProviderDiagnosticRecord,
    stderr: Uint8Array | null,
  ) => void | Promise<void>,
): Promise<readonly RunEventPayload[]> => {
  const productivePermissions = openCodePermissionRules(role, task, referenceRoots);
  const promptId = openCodePromptId(run, triggeringRunEventId);
  const startedAt = nowIsoDateTime();
  server.diagnosticStderr.reset();

  let events: readonly RunEventPayload[] | null = null;
  let failure: ProviderTurnFailure | null = null;
  let formatRepairAttempted = false;
  let formatRepairSucceeded: boolean | null = null;

  try {
    const text = await runPromptToText(
      server.client,
      sessionID,
      promptId,
      [prompt, providerOutputContract(role)].join("\n\n"),
      productiveTurnTimeoutMillis,
    );

    try {
      events = parseCanonicalProviderEvents(text);
    } catch {
      formatRepairAttempted = true;
      formatRepairSucceeded = false;
      try {
        await server.client.session.update({
          sessionID,
          permissions: [denyAllRule()],
        });
      } catch (error) {
        throw providerTurnFailure("TRANSPORT_ERROR", "FORMAT_REPAIR", error);
      }

      const repairedText = await runPromptToText(
        server.client,
        sessionID,
        formatRepairPromptId(promptId),
        formatRepairPrompt(role),
        productiveTurnTimeoutMillis,
      ).catch((error: unknown) => {
        if (isProviderTurnFailure(error)) {
          throw providerTurnFailure(
            error.providerOutcome,
            "FORMAT_REPAIR",
            error,
          );
        }
        throw providerTurnFailure("FAILED", "FORMAT_REPAIR", error);
      });

      try {
        await server.client.session.update({
          sessionID,
          permissions: productivePermissions,
        });
        const rebound = await server.client.session.get({ sessionID });
        requireSessionBinding(rebound, server.model, productivePermissions);
      } catch (error) {
        throw providerTurnFailure("TRANSPORT_ERROR", "FORMAT_REPAIR", error);
      }

      try {
        events = parseCanonicalProviderEvents(repairedText);
      } catch (error) {
        throw providerTurnFailure("INVALID_OUTPUT", "FORMAT_REPAIR", error);
      }
    }

    try {
      events = validateProviderAdmission(role, events);
    } catch (error) {
      throw providerTurnFailure("INVALID_OUTPUT", "ADMISSION", error);
    }
    if (formatRepairAttempted) formatRepairSucceeded = true;
  } catch (error) {
    failure = isProviderTurnFailure(error)
      ? error
      : providerTurnFailure("FAILED", "PROVIDER", error);
  }

  const endedAt = nowIsoDateTime();
  const safeFailureMessage = failure === null
    ? null
    : server.diagnosticStderr.redact(failure.message);
  const diagnostic = ProviderDiagnosticRecordSchema.parse({
    providerId: server.model.providerID,
    modelId: server.model.id,
    providerSessionId: sessionID,
    promptId,
    startedAt,
    endedAt,
    outcome: failure?.providerOutcome ?? "SUCCEEDED",
    formatRepairAttempted,
    formatRepairSucceeded,
    failurePhase: failure?.providerFailurePhase ?? null,
    exceptionMessage: safeFailureMessage,
  });

  await onDiagnostics(
    diagnostic,
    server.diagnosticStderr.snapshot(),
  );

  if (failure !== null) {
    throw new TypeError(
      safeFailureMessage === null || safeFailureMessage.length === 0
        ? "OpenCode provider turn failed"
        : safeFailureMessage,
    );
  }
  if (events === null) {
    throw new TypeError("OpenCode provider turn completed without canonical events");
  }
  return events;
};

export const loginOpenCodeProviderInteractive = async (
  stateRoot: string,
  cwd: string,
  sourceEnvironment: NodeJS.ProcessEnv = process.env,
  cancellationSignal?: AbortSignal,
): Promise<TerminalProcessResult> => {
  assertNoOpenCodeSystemConfig();
  const binary = resolveOpenCodeBinary(sourceEnvironment);
  const environment = buildOpenCodeEnvironment(stateRoot, sourceEnvironment);
  await assertOpenCodeBinaryVersion(binary, cwd, environment);
  return runTerminalProcess(
    [binary, "--standalone", "auth", "login"],
    cwd,
    environment,
    cancellationSignal,
  );
};
export const loginOpenCodeProvider = async (
  stateRoot: string,
  cwd: string,
  provider: string,
  sourceEnvironment: NodeJS.ProcessEnv = process.env,
  cancellationSignal?: AbortSignal,
): Promise<TerminalProcessResult> => {
  assertNoOpenCodeSystemConfig();
  const canonicalProvider = requireNonEmpty("provider", provider);
  const binary = resolveOpenCodeBinary(sourceEnvironment);
  const environment = buildOpenCodeEnvironment(stateRoot, sourceEnvironment);
  await assertOpenCodeBinaryVersion(binary, cwd, environment);
  return runTerminalProcess(
    [binary, "--standalone", "auth", "login", canonicalProvider],
    cwd,
    environment,
    cancellationSignal,
  );
};
