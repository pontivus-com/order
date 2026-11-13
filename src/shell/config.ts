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
import { dirname } from "node:path";

import { canonicalAbsolutePathIsWithinRoot } from "../core/governance.ts";

import {
  OrderConfigSchema,
  LegacyOrderConfigV2Schema,
  LegacyPredecessorConfigV1Schema,
  OpenCodeModelRefSchema,
  type OrderConfig,
  type LegacyOrderConfigV2,
  type LegacyPredecessorConfigV1,
  type OpenCodeModelRef,
} from "../core/contracts.ts";
import { ensureSupportedStateRoot, statePaths } from "./runtime.ts";

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

export const buildOrderConfig = (
  model: OpenCodeModelRef,
  repositoryRoots: readonly string[],
  referenceRoots: readonly string[],
): OrderConfig => {
  const targets = canonicalRoots(repositoryRoots, true);
  const references = canonicalRoots(referenceRoots, false);
  assertDisjointRoots(targets, references);
  return OrderConfigSchema.parse({
    version: 3,
    model: OpenCodeModelRefSchema.parse(model),
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

const readConfigValue = (stateRoot: string): unknown => {
  const descriptor = openSync(
    statePaths(stateRoot).config,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    validateConfigDescriptor(descriptor);
    return JSON.parse(readFileSync(descriptor, "utf8"));
  } finally {
    closeSync(descriptor);
  }
};

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
  const canonical = buildOrderConfig(
    parsed.model,
    parsed.repositoryRoots,
    parsed.referenceRoots,
  );
  assertStateRootDisjoint(canonical, stateRoot);
  if (JSON.stringify(canonical) !== JSON.stringify(parsed)) {
    throw new TypeError("config.json roots must remain canonical realpaths");
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
): OrderConfig | LegacyOrderConfigV2 | LegacyPredecessorConfigV1 => {
  const value = readConfigValue(stateRoot);
  const current = OrderConfigSchema.safeParse(value);
  if (current.success) return canonicalCurrentOrderConfig(stateRoot, current.data);
  const v2 = LegacyOrderConfigV2Schema.safeParse(value);
  return v2.success
    ? canonicalLegacyOrderConfigV2(stateRoot, v2.data)
    : canonicalLegacyOrderConfig(value);
};

export const readOrderConfigForUpgradeIfPresent = (
  stateRoot: string,
): OrderConfig | LegacyOrderConfigV2 | LegacyPredecessorConfigV1 | null => {
  try {
    return readOrderConfigForUpgrade(stateRoot);
  } catch (error) {
    if (asErrorCode(error) === "ENOENT") return null;
    throw error;
  }
};

export const readOrderConfig = (stateRoot: string): OrderConfig =>
  canonicalCurrentOrderConfig(stateRoot, readConfigValue(stateRoot));

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
  const canonical = OrderConfigSchema.parse(config);
  assertStateRootDisjoint(canonical, stateRoot);
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
