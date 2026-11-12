import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  statfsSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, resolve, sep } from "node:path";

import {
  ApprovalIdSchema,
  ArtifactRefIdSchema,
  EvidencePathSchema,
  ExecutionTaskIdSchema,
  IsoDateTimeSchema,
  RunEventIdSchema,
  RunIdSchema,
  Sha256Schema,
  WorkItemIdSchema,
  type ApprovalId,
  type ArtifactRefId,
  type ExecutionTaskId,
  type EvidencePath,
  type IsoDateTime,
  type RunEventId,
  type RunId,
  type Sha256,
  type WorkItemId,
} from "../core/contracts.ts";

const supportedFilesystemTypes = new Set<number>([
  0x0000ef53,
  0x58465342,
  0x9123683e,
  0xf2f52010,
]);

export const filesystemTypeIsSupported = (type: number): boolean =>
  supportedFilesystemTypes.has(type);

const tokenPattern = /^[0-9a-f]{64}$/;
const utf8 = new TextEncoder();

const asErrorCode = (error: unknown): string | null =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : null;

const generatedId = <T>(
  prefix: string,
  parse: (value: string) => T,
): T => parse(`${prefix}_${crypto.randomUUID()}`);

export const newWorkItemId = (): WorkItemId =>
  generatedId("work", (value) => WorkItemIdSchema.parse(value));

export const newArtifactRefId = (): ArtifactRefId =>
  generatedId("artifact", (value) => ArtifactRefIdSchema.parse(value));

export const newApprovalId = (): ApprovalId =>
  generatedId("approval", (value) => ApprovalIdSchema.parse(value));

export const newExecutionTaskId = (): ExecutionTaskId =>
  generatedId("task", (value) => ExecutionTaskIdSchema.parse(value));

export const newRunId = (): RunId =>
  generatedId("run", (value) => RunIdSchema.parse(value));

export const newRunEventId = (): RunEventId =>
  generatedId("event", (value) => RunEventIdSchema.parse(value));

export const secureTokenHex = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
};

export const sha256Hex = (bytes: Uint8Array): string => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(bytes);
  return hasher.digest("hex");
};

export const sha256 = (bytes: Uint8Array): Sha256 =>
  Sha256Schema.parse(`sha256:${sha256Hex(bytes)}`);

export const sha256TextHex = (text: string): string =>
  sha256Hex(utf8.encode(text));

export const sha256Text = (text: string): Sha256 =>
  Sha256Schema.parse(`sha256:${sha256TextHex(text)}`);

export const isoDateTimeFromEpochMillis = (epochMillis: number): IsoDateTime => {
  if (!Number.isFinite(epochMillis)) throw new TypeError("epochMillis must be finite");
  return IsoDateTimeSchema.parse(new Date(epochMillis).toISOString());
};

export const nowIsoDateTime = (): IsoDateTime =>
  isoDateTimeFromEpochMillis(Date.now());

export type StateRootEnvironment = Readonly<{
  PONTIVUS_ORDER_STATE_ROOT?: string;
  XDG_STATE_HOME?: string;
  HOME?: string;
}>;

const nonEmpty = (value: string | undefined): value is string =>
  value !== undefined && value.length > 0;

const requireAbsolute = (name: string, value: string): string => {
  if (!isAbsolute(value)) {
    throw new TypeError(`${name} must be absolute`);
  }
  return value;
};

export const resolveStateRoot = (
  environment: StateRootEnvironment | NodeJS.ProcessEnv,
): string => {
  if (nonEmpty(environment.PONTIVUS_ORDER_STATE_ROOT)) {
    return requireAbsolute("PONTIVUS_ORDER_STATE_ROOT", environment.PONTIVUS_ORDER_STATE_ROOT);
  }
  if (nonEmpty(environment.XDG_STATE_HOME)) {
    return join(requireAbsolute("XDG_STATE_HOME", environment.XDG_STATE_HOME), "pontivus-order");
  }
  if (nonEmpty(environment.HOME)) {
    return join(requireAbsolute("HOME", environment.HOME), ".local", "state", "pontivus-order");
  }
  throw new TypeError("an absolute Order state root is required");
};

export const assertLinuxRuntime = (platform: NodeJS.Platform = process.platform): void => {
  if (platform !== "linux") {
    throw new TypeError("Order v1 productive runtime requires Linux");
  }
};

export const ensureSupportedStateRoot = (stateRoot: string): void => {
  assertLinuxRuntime();
  if (!isAbsolute(stateRoot)) throw new TypeError("state root must be absolute");
  mkdirSync(stateRoot, { recursive: true });

  const type = statfsSync(stateRoot).type;
  if (!filesystemTypeIsSupported(type)) {
    throw new TypeError(`unsupported state-root filesystem type: 0x${type.toString(16)}`);
  }
};

export const statePaths = (stateRoot: string): Readonly<{
  database: string;
  daemonToken: string;
  config: string;
  opencode: string;
  evidence: string;
  workspaces: string;
}> => ({
  database: join(stateRoot, "order.sqlite3"),
  daemonToken: join(stateRoot, "daemon-token"),
  config: join(stateRoot, "config.json"),
  opencode: join(stateRoot, "opencode"),
  evidence: join(stateRoot, "evidence"),
  workspaces: join(stateRoot, "workspaces"),
});


export const byteEqual = (left: Uint8Array, right: Uint8Array): boolean =>
  left.byteLength === right.byteLength &&
  left.every((value, index) => value === right[index]);

const runEvidenceTarget = (
  stateRoot: string,
  runId: RunId,
  relativePath: EvidencePath,
): string => {
  const root = join(statePaths(stateRoot).evidence, RunIdSchema.parse(runId));
  mkdirSync(root, { recursive: true, mode: 0o700 });
  if (lstatSync(root).isSymbolicLink()) {
    throw new TypeError("Run evidence root may not be a symlink");
  }

  const parts = EvidencePathSchema.parse(relativePath).split("/");
  let current = root;
  for (const part of parts.slice(0, -1)) {
    current = join(current, part);
    if (!existsSync(current)) mkdirSync(current, { mode: 0o700 });
    const stat = lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new TypeError("evidence parent must be a real directory");
    }
  }

  const target = join(root, relativePath);
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(target);
  if (
    resolvedTarget !== resolvedRoot &&
    !resolvedTarget.startsWith(`${resolvedRoot}${sep}`)
  ) {
    throw new TypeError("evidence path escapes its Run root");
  }
  return target;
};

export const writeRunEvidenceBytes = (
  stateRoot: string,
  runId: RunId,
  relativePath: EvidencePath,
  bytes: Uint8Array,
): Sha256 => {
  const target = runEvidenceTarget(stateRoot, runId, relativePath);
  const digest = sha256(bytes);

  if (existsSync(target)) {
    const stat = lstatSync(target);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new TypeError("existing evidence target is not a regular file");
    }
    const existing = new Uint8Array(readFileSync(target));
    if (!byteEqual(existing, bytes)) {
      throw new TypeError("evidence path is immutable and already contains different bytes");
    }
    return digest;
  }

  const descriptor = openSync(
    target,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }

  const stored = new Uint8Array(readFileSync(target));
  if (!byteEqual(stored, bytes) || sha256(stored) !== digest) {
    throw new TypeError("evidence read-back/hash verification failed");
  }
  return digest;
};

export const readRunEvidenceBytes = (
  stateRoot: string,
  runId: RunId,
  relativePath: EvidencePath,
): Uint8Array => {
  const target = runEvidenceTarget(stateRoot, runId, relativePath);
  if (!existsSync(target)) throw new TypeError("referenced evidence does not exist");
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new TypeError("referenced evidence is not a regular file");
  }
  return new Uint8Array(readFileSync(target));
};

export const workspacePathForRun = (
  stateRoot: string,
  runId: RunId,
): string => {
  const root = statePaths(stateRoot).workspaces;
  mkdirSync(root, { recursive: true, mode: 0o700 });
  return join(root, RunIdSchema.parse(runId));
};

const validateTokenFileDescriptor = (descriptor: number): string => {
  const stat = fstatSync(descriptor);
  if (!stat.isFile()) throw new TypeError("daemon-token must be a regular file");
  if ((stat.mode & 0o077) !== 0) {
    throw new TypeError("daemon-token must not grant group or other access");
  }
  if (typeof process.getuid === "function" && stat.uid !== process.getuid()) {
    throw new TypeError("daemon-token must be owned by the current user");
  }

  const value = readFileSync(descriptor, "utf8");
  if (!tokenPattern.test(value)) {
    throw new TypeError("daemon-token must contain exactly 64 lowercase hexadecimal characters");
  }
  return value;
};

const openExistingToken = (path: string): string => {
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    return validateTokenFileDescriptor(descriptor);
  } finally {
    closeSync(descriptor);
  }
};

const createToken = (path: string): string => {
  const token = secureTokenHex();
  const descriptor = openSync(
    path,
    constants.O_WRONLY |
      constants.O_CREAT |
      constants.O_EXCL |
      constants.O_NOFOLLOW,
    0o600,
  );
  try {
    fchmodSync(descriptor, 0o600);
    writeFileSync(descriptor, token, "utf8");
    fsyncSync(descriptor);
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || (stat.mode & 0o777) !== 0o600) {
      throw new TypeError("new daemon-token file must be owner read/write only");
    }
  } finally {
    closeSync(descriptor);
  }
  return token;
};

export const loadDaemonToken = (stateRoot: string): string => {
  if (!isAbsolute(stateRoot)) throw new TypeError("state root must be absolute");
  return openExistingToken(statePaths(stateRoot).daemonToken);
};

export const loadOrCreateDaemonToken = (stateRoot: string): string => {
  if (!isAbsolute(stateRoot)) throw new TypeError("state root must be absolute");
  const path = statePaths(stateRoot).daemonToken;

  try {
    return openExistingToken(path);
  } catch (error) {
    if (asErrorCode(error) !== "ENOENT") throw error;
  }

  try {
    return createToken(path);
  } catch (error) {
    if (asErrorCode(error) !== "EEXIST") throw error;
    return openExistingToken(path);
  }
};
