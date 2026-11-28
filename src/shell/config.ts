import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, normalize } from "node:path";

import { canonicalAbsolutePathIsWithinRoot } from "../core/governance.ts";

import {
  OrderConfigSchema,
  OrderConfigStateSchema,
  LegacyOrderConfigV2Schema,
  LegacyOrderConfigV3Schema,
  LegacyPredecessorConfigV1Schema,
  OpenCodeModelRefSchema,
  type OrderConfig,
  type OrderConfigState,
  type LegacyOrderConfigV2,
  type LegacyOrderConfigV3,
  type LegacyPredecessorConfigV1,
  type OpenCodeModelRef,
  type Sha256,
} from "../core/contracts.ts";
import { ensureSupportedStateRoot, sha256, statePaths } from "./runtime.ts";

const asErrorCode = (error: unknown): string | null =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : null;

const canonicalDirectory = (value: string): string => {
  const canonical = realpathSync(value);
  if (!statSync(canonical).isDirectory()) {
    throw new TypeError("configured root is not a directory: " + value);
  }
  return canonical;
};

const canonicalRoots = (
  values: readonly string[],
  requireNonEmpty: boolean,
): readonly string[] => {
  const roots = [...new Set(values.map(canonicalDirectory))].sort();
  if (requireNonEmpty && roots.length === 0) {
    throw new TypeError("at least one repository root is required");
  }
  return roots;
};

export const proveConfiguredDirectoryRoots = (
  values: readonly string[],
): readonly string[] => {
  const roots = values.map(canonicalDirectory);
  if (new Set(roots).size !== roots.length) {
    throw new TypeError("configured directory roots must resolve uniquely");
  }
  return [...roots].sort();
};

const rootsOverlap = (left: string, right: string): boolean =>
  canonicalAbsolutePathIsWithinRoot(left, right) ||
  canonicalAbsolutePathIsWithinRoot(right, left);

const assertDisjointRoots = (
  repositoryRoots: readonly string[],
  referenceRoots: readonly string[],
  stateRoot?: string,
): void => {
  const groups = [
    ...repositoryRoots.map((root) => ["target repository", root] as const),
    ...referenceRoots.map((root) => ["reference root", root] as const),
    ...(stateRoot === undefined ? [] : [["state root", stateRoot] as const]),
  ];
  for (let left = 0; left < groups.length; left += 1) {
    for (let right = left + 1; right < groups.length; right += 1) {
      const a = groups[left]!;
      const b = groups[right]!;
      if (rootsOverlap(a[1], b[1])) {
        throw new TypeError(`${a[0]} and ${b[0]} must be path-disjoint: ${a[1]} / ${b[1]}`);
      }
    }
  }
};

const canonicalStoredPath = (value: string): string => {
  const canonical = normalize(value);
  if (!canonical.startsWith("/") || canonical !== value) {
    throw new TypeError("configured root must use canonical absolute path syntax: " + value);
  }
  return value;
};

const storedRoots = (values: readonly string[]): readonly string[] => {
  const roots = values.map(canonicalStoredPath);
  if (new Set(roots).size !== roots.length) {
    throw new TypeError("configured roots must be unique");
  }
  return roots;
};

export const buildOrderConfig = (
  model: OpenCodeModelRef | null,
  repositoryRoots: readonly string[],
  referenceRoots: readonly string[],
): OrderConfig => {
  const targets = canonicalRoots(repositoryRoots, false);
  const references = canonicalRoots(referenceRoots, false);
  assertDisjointRoots(targets, references);
  return OrderConfigSchema.parse({
    version: 4,
    model: model === null ? null : OpenCodeModelRefSchema.parse(model),
    repositoryRoots: targets,
    referenceRoots: references,
  });
};

const assertStateRootDisjoint = (
  config: Readonly<{
    repositoryRoots: readonly string[];
    referenceRoots: readonly string[];
  }>,
  stateRoot: string,
): void => {
  const canonicalStateRoot = realpathSync(stateRoot);
  assertDisjointRoots(
    config.repositoryRoots,
    config.referenceRoots,
    canonicalStateRoot,
  );
};

const validateConfigDescriptor = (descriptor: number): void => {
  const stat = fstatSync(descriptor);
  if (!stat.isFile()) throw new TypeError("config.json must be a regular file");
  if ((stat.mode & 0o077) !== 0) {
    throw new TypeError("config.json must not grant group or other access");
  }
  if (typeof process.getuid === "function" && stat.uid !== process.getuid()) {
    throw new TypeError("config.json must be owned by the current user");
  }
};

const readConfigBytes = (stateRoot: string): Uint8Array => {
  const descriptor = openSync(
    statePaths(stateRoot).config,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    validateConfigDescriptor(descriptor);
    return new Uint8Array(readFileSync(descriptor));
  } finally {
    closeSync(descriptor);
  }
};

const parseConfigBytes = (bytes: Uint8Array): unknown =>
  JSON.parse(new TextDecoder().decode(bytes));

const readConfigValue = (stateRoot: string): unknown =>
  parseConfigBytes(readConfigBytes(stateRoot));

const canonicalLegacyOrderConfig = (value: unknown): LegacyPredecessorConfigV1 => {
  const parsed = LegacyPredecessorConfigV1Schema.parse(value);
  const canonical = LegacyPredecessorConfigV1Schema.parse({
    version: 1,
    model: OpenCodeModelRefSchema.parse(parsed.model),
    repositoryRoots: canonicalRoots(parsed.repositoryRoots, true),
    referenceRoots: canonicalRoots(parsed.referenceRoots, false),
  });
  if (JSON.stringify(canonical) !== JSON.stringify(parsed)) {
    throw new TypeError("legacy config.json roots must remain canonical realpaths");
  }
  return canonical;
};

const canonicalCurrentOrderConfig = (
  stateRoot: string,
  value: unknown,
): OrderConfig => {
  const parsed = OrderConfigSchema.parse(value);
  const canonical = OrderConfigSchema.parse({
    version: 4,
    model: parsed.model,
    repositoryRoots: storedRoots(parsed.repositoryRoots),
    referenceRoots: storedRoots(parsed.referenceRoots),
  });
  assertStateRootDisjoint(canonical, stateRoot);
  if (JSON.stringify(canonical) !== JSON.stringify(parsed)) {
    throw new TypeError("config.json must preserve canonical stored path identities");
  }
  return canonical;
};

const canonicalLegacyOrderConfigV3 = (
  stateRoot: string,
  value: unknown,
): LegacyOrderConfigV3 => {
  const parsed = LegacyOrderConfigV3Schema.parse(value);
  const canonical = LegacyOrderConfigV3Schema.parse({
    version: 3,
    model: OpenCodeModelRefSchema.parse(parsed.model),
    repositoryRoots: storedRoots(parsed.repositoryRoots),
    referenceRoots: storedRoots(parsed.referenceRoots),
  });
  assertStateRootDisjoint(canonical, stateRoot);
  if (JSON.stringify(canonical) !== JSON.stringify(parsed)) {
    throw new TypeError("legacy v3 config.json must preserve canonical stored path identities");
  }
  return canonical;
};

const canonicalLegacyOrderConfigV2 = (
  stateRoot: string,
  value: unknown,
): LegacyOrderConfigV2 => {
  const parsed = LegacyOrderConfigV2Schema.parse(value);
  const targets = canonicalRoots(parsed.repositoryRoots, true);
  const references = canonicalRoots(parsed.referenceRoots, false);
  const sourceRoot = canonicalDirectory(parsed.workItemRoot);
  assertDisjointRoots(targets, references);
  const canonicalStateRoot = realpathSync(stateRoot);
  const legacyGroups = [...targets, ...references, sourceRoot];
  for (const root of legacyGroups) {
    if (rootsOverlap(root, canonicalStateRoot)) {
      throw new TypeError("legacy config.json roots must remain disjoint from state root");
    }
  }
  const canonical = LegacyOrderConfigV2Schema.parse({
    version: 2,
    model: OpenCodeModelRefSchema.parse(parsed.model),
    repositoryRoots: targets,
    referenceRoots: references,
    workItemRoot: sourceRoot,
  });
  if (JSON.stringify(canonical) !== JSON.stringify(parsed)) {
    throw new TypeError("legacy v2 config.json roots must remain canonical realpaths");
  }
  return canonical;
};

export const readOrderConfigForUpgrade = (
  stateRoot: string,
  admittedBytes?: Uint8Array,
): OrderConfig | LegacyOrderConfigV3 | LegacyOrderConfigV2 | LegacyPredecessorConfigV1 => {
  const value = admittedBytes === undefined ? readConfigValue(stateRoot) : parseConfigBytes(admittedBytes);
  const current = OrderConfigSchema.safeParse(value);
  if (current.success) return canonicalCurrentOrderConfig(stateRoot, current.data);
  const v3 = LegacyOrderConfigV3Schema.safeParse(value);
  if (v3.success) return canonicalLegacyOrderConfigV3(stateRoot, v3.data);
  const v2 = LegacyOrderConfigV2Schema.safeParse(value);
  return v2.success
    ? canonicalLegacyOrderConfigV2(stateRoot, v2.data)
    : canonicalLegacyOrderConfig(value);
};

export const readOrderConfigForUpgradeIfPresent = (
  stateRoot: string,
): OrderConfig | LegacyOrderConfigV3 | LegacyOrderConfigV2 | LegacyPredecessorConfigV1 | null => {
  try {
    return readOrderConfigForUpgrade(stateRoot);
  } catch (error) {
    if (asErrorCode(error) === "ENOENT") return null;
    throw error;
  }
};

export const readOrderConfig = (stateRoot: string): OrderConfig =>
  canonicalCurrentOrderConfig(stateRoot, readConfigValue(stateRoot));

export const readOrderConfigState = (stateRoot: string): OrderConfigState => {
  const bytes = readConfigBytes(stateRoot);
  return OrderConfigStateSchema.parse({
    config: canonicalCurrentOrderConfig(stateRoot, parseConfigBytes(bytes)),
    sha256: sha256(bytes),
  });
};

export const readOrderConfigIfPresent = (
  stateRoot: string,
): OrderConfig | null => {
  try {
    return readOrderConfig(stateRoot);
  } catch (error) {
    if (asErrorCode(error) === "ENOENT") return null;
    throw error;
  }
};

// Installer-only rollback custody. These identities live only for this invocation.
type InstallerConfigIdentity = Readonly<{
  device: bigint;
  inode: bigint;
  mode: number;
  sha256: Sha256;
}>;

export type InstallerConfigSnapshot = Readonly<{
  target: string;
  original: InstallerConfigIdentity | null;
  recoveryPath: string | null;
  recoveryIdentity: InstallerConfigIdentity | null;
}>;

type InstallerConfigEffects = Readonly<{
  rename: typeof renameSync;
  fsync: typeof fsyncSync;
  unlink: typeof unlinkSync;
  write?: (descriptor: number, bytes: Uint8Array) => void;
}>;
const installerConfigEffects: InstallerConfigEffects = {
  rename: renameSync, fsync: fsyncSync, unlink: unlinkSync,
};

export type InstallerConfigPublication = Readonly<{
  snapshot: InstallerConfigSnapshot;
  onPublished: (identity: InstallerConfigIdentity) => void;
  effects?: InstallerConfigEffects | undefined;
}>;

type ObservedInstallerConfig = Readonly<{
  identity: InstallerConfigIdentity;
  bytes: Uint8Array;
}>;

const observeInstallerConfig = (target: string): ObservedInstallerConfig | null => {
  const entry = lstatSync(target, { bigint: true, throwIfNoEntry: false });
  if (entry !== undefined && !entry.isFile()) {
    throw new TypeError("installer config target must be a regular non-symlink file: " + target);
  }
  let descriptor: number;
  try {
    descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  } catch (error) {
    if (entry === undefined && asErrorCode(error) === "ENOENT" &&
        lstatSync(target, { throwIfNoEntry: false }) === undefined) return null;
    throw error;
  }
  try {
    validateConfigDescriptor(descriptor);
    const stat = fstatSync(descriptor, { bigint: true });
    if (entry === undefined || entry.dev !== stat.dev || entry.ino !== stat.ino || entry.mode !== stat.mode) {
      throw new TypeError("installer config target changed during inspection: " + target);
    }
    const bytes = new Uint8Array(readFileSync(descriptor));
    const after = lstatSync(target, { bigint: true });
    if (after.dev !== stat.dev || after.ino !== stat.ino || after.mode !== stat.mode ||
        after.size !== stat.size || after.mtimeNs !== stat.mtimeNs || after.ctimeNs !== stat.ctimeNs) {
      throw new TypeError("installer config target changed during read: " + target);
    }
    return { identity: { device: stat.dev, inode: stat.ino, mode: Number(stat.mode & 0o777n), sha256: sha256(bytes) }, bytes };
  } finally {
    closeSync(descriptor);
  }
};

const configIdentityMatches = (
  observed: InstallerConfigIdentity | null,
  expected: InstallerConfigIdentity | null,
): boolean => observed === null || expected === null
  ? observed === expected
  : observed.device === expected.device && observed.inode === expected.inode &&
    observed.mode === expected.mode && observed.sha256 === expected.sha256;

const requireInstallerConfigIdentity = (
  target: string,
  expected: InstallerConfigIdentity | null,
): ObservedInstallerConfig | null => {
  const observed = observeInstallerConfig(target);
  if (!configIdentityMatches(observed?.identity ?? null, expected)) {
    throw new TypeError("installer config identity or bytes changed: " + target);
  }
  return observed;
};

// Reuse the installer writer's exact publication proof at final admission.
export const requireInstallerConfigPublication = (
  snapshot: InstallerConfigSnapshot,
  published: InstallerConfigIdentity | null,
): void => {
  if (published === null) throw new TypeError("installer configuration publication unavailable: " + snapshot.target);
  requireInstallerConfigIdentity(snapshot.target, published);
};

const fsyncConfigDirectory = (target: string, sync: typeof fsyncSync = fsyncSync): void => {
  const parentDescriptor = openSync(dirname(target), constants.O_RDONLY | constants.O_DIRECTORY);
  try { sync(parentDescriptor); } finally { closeSync(parentDescriptor); }
};

const writeExclusiveConfigBytes = (
  path: string,
  bytes: Uint8Array,
  mode: number,
  effects: InstallerConfigEffects = installerConfigEffects,
  onCreated: (identity: Pick<InstallerConfigIdentity, "device" | "inode">) => void = () => {},
): InstallerConfigIdentity => {
  const descriptor = openSync(path,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    const created = fstatSync(descriptor, { bigint: true });
    onCreated({ device: created.dev, inode: created.ino });
    (effects.write ?? writeFileSync)(descriptor, bytes);
    fchmodSync(descriptor, mode);
    effects.fsync(descriptor);
    const stat = fstatSync(descriptor, { bigint: true });
    return { device: stat.dev, inode: stat.ino, mode, sha256: sha256(bytes) };
  } finally {
    closeSync(descriptor);
  }
};

const removeOwnedInstallerConfigTemporary = (
  path: string,
  created: Pick<InstallerConfigIdentity, "device" | "inode"> | null,
  effects: InstallerConfigEffects,
): void => {
  const entry = lstatSync(path, { bigint: true, throwIfNoEntry: false });
  if (entry === undefined) return;
  if (created === null || !entry.isFile() || entry.dev !== created.device || entry.ino !== created.inode) {
    throw new TypeError("ambiguous configuration temporary retained: " + path);
  }
  effects.unlink(path);
};

export const captureInstallerConfigSnapshot = (
  stateRoot: string,
  onIncompleteCapture: (recoveryPath: string) => void = () => {},
  effects: InstallerConfigEffects = installerConfigEffects,
): InstallerConfigSnapshot => {
  ensureSupportedStateRoot(stateRoot);
  const target = statePaths(stateRoot).config;
  let original: ObservedInstallerConfig | null;
  try { original = observeInstallerConfig(target); }
  catch (error) {
    onIncompleteCapture(target);
    throw error;
  }
  if (original === null) return { target, original: null, recoveryPath: null, recoveryIdentity: null };
  const recoveryPath = target + ".installer-recovery." + crypto.randomUUID();
  try {
    const recoveryIdentity = writeExclusiveConfigBytes(recoveryPath, original.bytes, original.identity.mode, effects);
    fsyncConfigDirectory(recoveryPath, effects.fsync);
    requireInstallerConfigIdentity(recoveryPath, recoveryIdentity);
    requireInstallerConfigIdentity(target, original.identity);
    return { target, original: original.identity, recoveryPath, recoveryIdentity };
  } catch (error) {
    // Even when capture itself fails, never lose the path of recovery bytes
    // already created or imply the original remained unchanged.
    onIncompleteCapture(recoveryPath);
    throw new Error("installer configuration capture incomplete: " + String(error) + "; inspect " + recoveryPath, { cause: error });
  }
};

export const readInstallerConfigForUpgrade = (
  stateRoot: string,
  snapshot: InstallerConfigSnapshot,
): ReturnType<typeof readOrderConfigForUpgrade> | null => {
  if (snapshot.target !== statePaths(stateRoot).config) throw new TypeError("installer config snapshot belongs to another state root");
  const observed = requireInstallerConfigIdentity(snapshot.target, snapshot.original);
  return observed === null ? null : readOrderConfigForUpgrade(stateRoot, observed.bytes);
};

export const releaseInstallerConfigSnapshot = (
  snapshot: InstallerConfigSnapshot,
  effects: InstallerConfigEffects = installerConfigEffects,
): void => {
  if (snapshot.recoveryPath === null || snapshot.recoveryIdentity === null) return;
  requireInstallerConfigIdentity(snapshot.recoveryPath, snapshot.recoveryIdentity);
  effects.unlink(snapshot.recoveryPath);
  fsyncConfigDirectory(snapshot.recoveryPath, effects.fsync);
};

export const restoreInstallerConfig = (
  snapshot: InstallerConfigSnapshot,
  published: InstallerConfigIdentity | null,
  effects: InstallerConfigEffects = installerConfigEffects,
): void => {
  if (published === null) {
    requireInstallerConfigIdentity(snapshot.target, snapshot.original);
  } else {
    requireInstallerConfigIdentity(snapshot.target, published);
    if (snapshot.original === null) {
      effects.unlink(snapshot.target);
      fsyncConfigDirectory(snapshot.target, effects.fsync);
      requireInstallerConfigIdentity(snapshot.target, null);
    } else {
      if (snapshot.recoveryPath === null || snapshot.recoveryIdentity === null) {
        throw new TypeError("installer original config recovery copy is missing: " + snapshot.target);
      }
      const original = requireInstallerConfigIdentity(snapshot.recoveryPath, snapshot.recoveryIdentity);
      if (original === null || original.identity.sha256 !== snapshot.original.sha256 ||
          original.identity.mode !== snapshot.original.mode) {
        throw new TypeError("installer original config recovery copy is inconsistent: " + snapshot.recoveryPath);
      }
      const temporary = snapshot.target + ".installer-restore." + crypto.randomUUID();
      try {
        const restored = writeExclusiveConfigBytes(temporary, original.bytes, snapshot.original.mode, effects);
        requireInstallerConfigIdentity(temporary, restored);
        requireInstallerConfigIdentity(snapshot.target, published);
        effects.rename(temporary, snapshot.target);
        fsyncConfigDirectory(snapshot.target, effects.fsync);
        requireInstallerConfigIdentity(snapshot.target, restored);
      } catch (error) {
        // Retain original recovery material on every incomplete restore; a
        // partial or replaced temporary is never mistaken for the original.
        const retained = lstatSync(temporary, { throwIfNoEntry: false }) !== undefined
          ? "; restore temporary retained at " + temporary : "";
        throw new Error("configuration restoration failed: " + String(error) + retained +
          "; original recovery at " + snapshot.recoveryPath, { cause: error });
      }
    }
  }
  releaseInstallerConfigSnapshot(snapshot, effects);
};

export const writeOrderConfig = (
  stateRoot: string,
  config: OrderConfig,
  installer?: InstallerConfigPublication,
): OrderConfig => {
  ensureSupportedStateRoot(stateRoot);
  const canonical = canonicalCurrentOrderConfig(stateRoot, config);
  const target = statePaths(stateRoot).config;
  const temporary = target + ".tmp." + process.pid + "." + crypto.randomUUID();
  if (installer !== undefined && installer.snapshot.target !== target) {
    throw new TypeError("installer config snapshot belongs to another state root");
  }
  const bytes = new TextEncoder().encode(JSON.stringify(canonical) + "\n");
  const effects = installer?.effects ?? installerConfigEffects;
  if (installer === undefined) {
    // Preserve the ordinary CLI writer's existing behavior.
    writeExclusiveConfigBytes(temporary, bytes, 0o600);
    try { renameSync(temporary, target); }
    catch (error) {
      try { if (lstatSync(temporary).isFile()) unlinkSync(temporary); } catch {}
      throw error;
    }
    fsyncConfigDirectory(target, effects.fsync);
    return readOrderConfig(stateRoot);
  } else {
    let created: Pick<InstallerConfigIdentity, "device" | "inode"> | null = null;
    let identity: InstallerConfigIdentity;
    try {
      identity = writeExclusiveConfigBytes(temporary, bytes, 0o600, effects,
        value => { created = value; });
      requireInstallerConfigIdentity(temporary, identity);
      requireInstallerConfigIdentity(target, installer.snapshot.original);
      effects.rename(temporary, target);
      installer.onPublished(identity);
    } catch (error) {
      try { removeOwnedInstallerConfigTemporary(temporary, created, effects); }
      catch (failure) {
        throw new AggregateError([error, failure], "installer configuration publication failed: " +
          String(error) + "; " + String(failure) + "; inspect " + temporary);
      }
      throw error;
    }
    fsyncConfigDirectory(target, effects.fsync);
    // Use the already observed exact publication for canonical readback.
    // A syntactically valid replacement must not acquire installer custody.
    const observed = requireInstallerConfigIdentity(target, identity);
    if (observed === null) throw new TypeError("installer configuration publication is absent: " + target);
    return canonicalCurrentOrderConfig(stateRoot, parseConfigBytes(observed.bytes));
  }
};

export type OrderConfigExpectedWriteResult =
  | Readonly<{ tag: "UPDATED"; state: OrderConfigState }>
  | Readonly<{ tag: "STALE"; current: OrderConfigState }>;

export const writeOrderConfigExpected = (
  stateRoot: string,
  expectedSha256: Sha256,
  config: OrderConfig,
): OrderConfigExpectedWriteResult => {
  const current = readOrderConfigState(stateRoot);
  if (current.sha256 !== expectedSha256) {
    return { tag: "STALE", current };
  }
  writeOrderConfig(stateRoot, config);
  return { tag: "UPDATED", state: readOrderConfigState(stateRoot) };
};
