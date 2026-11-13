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
  config: OrderConfig,
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
): OrderConfig | LegacyOrderConfigV3 | LegacyOrderConfigV2 | LegacyPredecessorConfigV1 => {
  const value = readConfigValue(stateRoot);
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

export const writeOrderConfig = (
  stateRoot: string,
  config: OrderConfig,
): OrderConfig => {
  ensureSupportedStateRoot(stateRoot);
  const canonical = canonicalCurrentOrderConfig(stateRoot, config);
  const target = statePaths(stateRoot).config;
  const temporary = target + ".tmp." + process.pid + "." + crypto.randomUUID();
  const descriptor = openSync(
    temporary,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    fchmodSync(descriptor, 0o600);
    writeFileSync(descriptor, JSON.stringify(canonical) + "\n", "utf8");
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }

  try {
    renameSync(temporary, target);
  } catch (error) {
    try {
      if (lstatSync(temporary).isFile()) unlinkSync(temporary);
    } catch {
      // The temporary path may already have been consumed.
    }
    throw error;
  }

  const parentDescriptor = openSync(
    dirname(target),
    constants.O_RDONLY | constants.O_DIRECTORY,
  );
  try {
    fsyncSync(parentDescriptor);
  } finally {
    closeSync(parentDescriptor);
  }
  return readOrderConfig(stateRoot);
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
