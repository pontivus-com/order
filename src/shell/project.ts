import { closeSync, constants, existsSync, fstatSync, fsyncSync, lstatSync, openSync, readFileSync, readSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

import {
  ConcernIdSchema,
  GateIdSchema,
  ProjectIdSchema,
  ProjectManifestSchema,
  RepositoryPathSchema,
  RepositoryPatternSchema,
  type AuthorityRef,
  type ConcernId,
  type GateId,
  type ProjectManifest,
  type RepositoryPath,
  type RepositoryPattern,
} from "../core/contracts.ts";
import { resolveConcernIds } from "../core/governance.ts";
import { sha256Text } from "./runtime.ts";
import { proveRepositoryRoot } from "./repository.ts";

const authorityLayers = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

const parseToml = (text: string): unknown => {
  try {
    return Bun.TOML.parse(text);
  } catch (error) {
    throw new TypeError("pontivus-order.toml is not valid TOML", { cause: error });
  }
};

export const parseProjectManifestText = (text: string): ProjectManifest =>
  ProjectManifestSchema.parse(parseToml(text));

export const readProjectManifest = (repositoryRoot: string): ProjectManifest => {
  const text = readFileSync(join(repositoryRoot, "pontivus-order.toml"), "utf8");
  return parseProjectManifestText(text);
};

export const repositoryPatternMatches = (
  pattern: RepositoryPattern,
  path: RepositoryPath,
): boolean => {
  const canonicalPattern = RepositoryPatternSchema.parse(pattern);
  const canonicalPath = RepositoryPathSchema.parse(path);
  return new Bun.Glob(canonicalPattern).match(canonicalPath);
};

export const expandRepositoryPattern = async (
  repositoryRoot: string,
  pattern: RepositoryPattern,
): Promise<readonly RepositoryPath[]> => {
  const glob = new Bun.Glob(RepositoryPatternSchema.parse(pattern));
  const matches: RepositoryPath[] = [];

  for await (const match of glob.scan({
    cwd: repositoryRoot,
    dot: true,
    absolute: false,
    followSymlinks: false,
    throwErrorOnBrokenSymlink: true,
    onlyFiles: true,
  })) {
    matches.push(RepositoryPathSchema.parse(match));
  }

  return [...new Set(matches)].sort();
};

export const expandRepositoryPatterns = async (
  repositoryRoot: string,
  patterns: readonly RepositoryPattern[],
): Promise<readonly RepositoryPath[]> => {
  const matches = await Promise.all(
    patterns.map((pattern) => expandRepositoryPattern(repositoryRoot, pattern)),
  );
  return [...new Set(matches.flat())].sort();
};

export const resolveAuthoritySources = async (
  repositoryRoot: string,
  manifest: ProjectManifest,
): Promise<Readonly<Record<(typeof authorityLayers)[number], readonly RepositoryPath[]>>> => {
  const entries = await Promise.all(
    authorityLayers.map(async (layer) => [
      layer,
      await expandRepositoryPatterns(repositoryRoot, manifest.authority[layer]),
    ] as const),
  );
  return Object.fromEntries(entries) as Readonly<
    Record<(typeof authorityLayers)[number], readonly RepositoryPath[]>
  >;
};

export const resolveAuthorityRef = (
  manifest: ProjectManifest,
  authorityRef: AuthorityRef,
): RepositoryPath => {
  const path = manifest.refs[authorityRef];
  if (path === undefined) {
    throw new TypeError(`unresolved AuthorityRef: ${authorityRef}`);
  }
  return path;
};

const requireGate = (manifest: ProjectManifest, gateId: GateId): void => {
  if (manifest.verification[gateId] === undefined) {
    throw new TypeError(`unresolved GateId: ${gateId}`);
  }
};

export const validateProjectManifestResolution = async (
  repositoryRoot: string,
  manifest: ProjectManifest,
): Promise<void> => {
  const sources = await resolveAuthoritySources(repositoryRoot, manifest);
  const allAuthority = new Set(authorityLayers.flatMap((layer) => sources[layer]));

  for (const [authorityRef, source] of Object.entries(manifest.refs)) {
    if (!allAuthority.has(source)) {
      throw new TypeError(
        `AuthorityRef ${authorityRef} source is not selected by authority.p1-p6: ${source}`,
      );
    }
  }

  for (const layer of authorityLayers) {
    const layerSources = new Set(sources[layer]);
    for (const path of manifest.precedence[layer] ?? []) {
      if (!layerSources.has(path)) {
        throw new TypeError(
          `precedence.${layer} path is not selected by authority.${layer}: ${path}`,
        );
      }
    }
  }

  const p1Sources = new Set(sources.p1);
  for (const rule of [
    ...manifest.governance.overrides,
    ...manifest.governance.extensions,
  ]) {
    if (!p1Sources.has(rule.source)) {
      throw new TypeError(`governance source is not selected by authority.p1: ${rule.source}`);
    }
    if (resolveAuthorityRef(manifest, rule.authorityRef) !== rule.source) {
      throw new TypeError(
        `governance authorityRef ${rule.authorityRef} does not resolve to ${rule.source}`,
      );
    }
    for (const gateId of rule.gates) requireGate(manifest, gateId);
  }

  for (const gateIds of Object.values(manifest.governance.fitness)) {
    if (gateIds === undefined) continue;
    for (const gateId of gateIds) requireGate(manifest, gateId);
  }

  for (const concern of Object.values(manifest.concerns)) {
    for (const gateId of concern.gates) requireGate(manifest, gateId);
  }
};

export const loadValidatedProjectManifest = async (
  repositoryRoot: string,
): Promise<ProjectManifest> => {
  const manifest = readProjectManifest(repositoryRoot);
  await validateProjectManifestResolution(repositoryRoot, manifest);
  return manifest;
};

export const readValidatedProjectManifestSnapshot = async (
  repositoryRoot: string,
): Promise<Readonly<{ manifest: ProjectManifest; sha256: import("../core/contracts.ts").Sha256 }>> => {
  const text = readFileSync(join(repositoryRoot, "pontivus-order.toml"), "utf8");
  const manifest = parseProjectManifestText(text);
  await validateProjectManifestResolution(repositoryRoot, manifest);
  return { manifest, sha256: sha256Text(text) };
};

const bootstrapProjectId = (repositoryRoot: string): string => {
  const normalized = basename(repositoryRoot)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[^a-z0-9]+/, "");
  return ProjectIdSchema.parse(normalized);
};

const bootstrapProjectManifestText = (repositoryRoot: string): string => {
  const p1 = existsSync(join(repositoryRoot, "AGENTS.md"))
    ? '["AGENTS.md"]'
    : "[]";
  return [
    "# Generated by Order during a supported beta update.",
    "# This bootstrap records only deterministic existing repository facts.",
    "# Add project-specific refs, concerns and verification gates under this repository's authority.",
    "version = 1",
    'projectId = "' + bootstrapProjectId(repositoryRoot) + '"',
    "",
    "[authority]",
    "p1 = " + p1,
    "p2 = []",
    "p3 = []",
    "p4 = []",
    "p5 = []",
    "p6 = []",
    "",
  ].join("\n");
};

type ManifestRootIdentity = Readonly<{ device: bigint; inode: bigint; mode: bigint; uid: bigint }>;
type ManifestFileIdentity = ManifestRootIdentity & Readonly<{ bytes: Buffer }>;

export type InstallerManifestCustody = Readonly<{
  path: string;
  root: string;
  rootIdentity: ManifestRootIdentity;
  identity: ManifestFileIdentity | null;
}>;

export type InstallerManifestEffects = Readonly<{
  open: (path: string, flags: number, mode: number) => number;
  read: (descriptor: number, bytes: Buffer, offset: number, length: number, position: number) => number;
  close: typeof closeSync;
  write: (descriptor: number, bytes: Buffer) => void;
  fsync: typeof fsyncSync;
  unlink: typeof unlinkSync;
}>;

const manifestEffects: InstallerManifestEffects = {
  open: openSync,
  read: readSync,
  close: closeSync,
  write: (descriptor, bytes) => writeFileSync(descriptor, bytes),
  fsync: fsyncSync,
  unlink: unlinkSync,
};

const manifestIdentity = (entry: import("node:fs").BigIntStats): ManifestRootIdentity =>
  ({ device: entry.dev, inode: entry.ino, mode: entry.mode, uid: entry.uid });

const sameManifestIdentity = (left: ManifestRootIdentity, right: ManifestRootIdentity): boolean =>
  left.device === right.device && left.inode === right.inode &&
  left.mode === right.mode && left.uid === right.uid;

const manifestRootIdentity = (root: string): ManifestRootIdentity => {
  if (realpathSync(root) !== root) throw new TypeError("installer manifest root is not canonical: " + root);
  const entry = lstatSync(root, { bigint: true });
  if (!entry.isDirectory()) throw new TypeError("installer manifest root is not a directory: " + root);
  return manifestIdentity(entry);
};

const requireManifestRoot = (custody: InstallerManifestCustody): void => {
  if (custody.path !== join(custody.root, "pontivus-order.toml") ||
      !sameManifestIdentity(manifestRootIdentity(custody.root), custody.rootIdentity)) {
    throw new TypeError("installer manifest root identity changed: " + custody.path);
  }
};

// Positional reads retain the exclusive creation descriptor as the source
// of partial-write evidence; never reopen the path to attribute its bytes.
const observeManifestDescriptor = (
  descriptor: number,
  maximumBytes: number,
  read: InstallerManifestEffects["read"] = readSync,
): ManifestFileIdentity => {
  const before = fstatSync(descriptor, { bigint: true });
  if (!before.isFile() || before.size > BigInt(maximumBytes)) {
    throw new TypeError("installer manifest descriptor has unexpected type or size");
  }
  const bytes = Buffer.alloc(Number(before.size));
  let offset = 0;
  while (offset < bytes.length) {
    const count = read(descriptor, bytes, offset, bytes.length - offset, offset);
    if (count === 0) throw new TypeError("installer manifest descriptor changed during read");
    offset += count;
  }
  const after = fstatSync(descriptor, { bigint: true });
  if (!sameManifestIdentity(manifestIdentity(before), manifestIdentity(after)) ||
      before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) {
    throw new TypeError("installer manifest descriptor changed during observation");
  }
  return { ...manifestIdentity(after), bytes };
};

export const requireInstallerManifest = (custody: InstallerManifestCustody): void => {
  requireManifestRoot(custody);
  const expected = custody.identity;
  if (expected === null) throw new TypeError("installer manifest custody is unproven: " + custody.path);
  const entry = lstatSync(custody.path, { bigint: true });
  if (!entry.isFile() || !sameManifestIdentity(manifestIdentity(entry), expected)) {
    throw new TypeError("installer manifest identity changed: " + custody.path);
  }
  const descriptor = openSync(custody.path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const observed = observeManifestDescriptor(descriptor, expected.bytes.length);
    const after = lstatSync(custody.path, { bigint: true });
    if (!after.isFile() || !sameManifestIdentity(observed, expected) ||
        !sameManifestIdentity(manifestIdentity(after), expected) || !observed.bytes.equals(expected.bytes)) {
      throw new TypeError("installer manifest identity or bytes changed: " + custody.path);
    }
    requireManifestRoot(custody);
  } finally { closeSync(descriptor); }
};

export const restoreInstallerManifest = (
  custody: InstallerManifestCustody,
  effects: InstallerManifestEffects = manifestEffects,
): void => {
  requireManifestRoot(custody);
  if (lstatSync(custody.path, { throwIfNoEntry: false }) === undefined) return;
  // Synchronous verification and unlink under the documented maintenance
  // boundary; not an atomic compare-and-unlink against arbitrary writers.
  requireInstallerManifest(custody);
  effects.unlink(custody.path);
  requireManifestRoot(custody);
  if (lstatSync(custody.path, { throwIfNoEntry: false }) !== undefined) {
    throw new TypeError("installer manifest remains at " + custody.path);
  }
};

export const prepareProjectRootForInstall = async (
  candidate: string,
  onCustody: (custody: InstallerManifestCustody) => void,
  effects: InstallerManifestEffects = manifestEffects,
): Promise<readonly [repositoryRoot: string, createdManifestPath: string | null] | null> => {
  let repositoryRoot: string;
  try {
    repositoryRoot = await proveRepositoryRoot(candidate);
  } catch {
    return null;
  }
  if (repositoryRoot !== candidate) return null;

  const manifestPath = join(repositoryRoot, "pontivus-order.toml");
  const existing = lstatSync(manifestPath, { throwIfNoEntry: false });
  if (existing !== undefined) {
    if (!existing.isFile()) throw new TypeError("project manifest is not a regular file: " + manifestPath);
    await loadValidatedProjectManifest(repositoryRoot);
    return [repositoryRoot, null];
  }

  const legacyManifestPath = join(repositoryRoot, "gateweft.toml");
  if (lstatSync(legacyManifestPath, { throwIfNoEntry: false }) !== undefined) {
    throw new TypeError(
      "target repository uses legacy gateweft.toml; adopt pontivus-order.toml under the target repository's own authority before continuing",
    );
  }

  const text = bootstrapProjectManifestText(repositoryRoot);
  parseProjectManifestText(text);
  const bytes = Buffer.from(text, "utf8");
  let custody: InstallerManifestCustody = {
    path: manifestPath, root: repositoryRoot, rootIdentity: manifestRootIdentity(repositoryRoot), identity: null,
  };
  const descriptor = effects.open(manifestPath,
    constants.O_RDWR | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o644);
  onCustody(custody);
  const failures: unknown[] = [];
  let opened: ManifestRootIdentity | null = null;
  try {
    const entry = fstatSync(descriptor, { bigint: true });
    if (!entry.isFile() || entry.size !== 0n) throw new TypeError("exclusive manifest creation is not an empty regular file: " + manifestPath);
    opened = manifestIdentity(entry);
    effects.write(descriptor, bytes);
    effects.fsync(descriptor);
  } catch (error) { failures.push(error); }
  try {
    const observed = observeManifestDescriptor(descriptor, bytes.length, effects.read);
    if (opened === null || !sameManifestIdentity(observed, opened) ||
        !observed.bytes.equals(bytes.subarray(0, observed.bytes.length))) {
      throw new TypeError("installer manifest descriptor custody changed: " + manifestPath);
    }
    custody = { ...custody, identity: observed };
    onCustody(custody);
  } catch (error) { failures.push(error); }
  try { effects.close(descriptor); } catch (error) { failures.push(error); }
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) {
    throw new AggregateError(failures, "installer manifest creation failed: " + failures.map(String).join("; "));
  }
  if (custody.identity === null || !custody.identity.bytes.equals(bytes)) {
    throw new TypeError("installer manifest creation bytes differ: " + manifestPath);
  }
  requireInstallerManifest(custody);
  await loadValidatedProjectManifest(repositoryRoot);
  requireInstallerManifest(custody);
  return [repositoryRoot, manifestPath];
};

export const resolveSurfaceConcernIds = (
  manifest: ProjectManifest,
  paths: readonly RepositoryPath[],
): readonly ConcernId[] => {
  const concernIds: ConcernId[] = [];
  for (const [rawConcernId, concern] of Object.entries(manifest.concerns)) {
    const concernId = ConcernIdSchema.parse(rawConcernId);
    if (
      paths.some((path) =>
        concern.paths.some((pattern) => repositoryPatternMatches(pattern, path)),
      )
    ) {
      concernIds.push(concernId);
    }
  }
  return [...new Set(concernIds)].sort();
};

export const resolveEffectiveConcernIds = (
  manifest: ProjectManifest,
  workItemConcernIds: readonly ConcernId[],
  upstreamConcernIds: readonly ConcernId[],
  paths: readonly RepositoryPath[],
  taskConcernIds: readonly ConcernId[],
): readonly ConcernId[] =>
  resolveConcernIds(
    workItemConcernIds,
    upstreamConcernIds,
    resolveSurfaceConcernIds(manifest, paths),
    taskConcernIds,
  );

export const resolveConcernAuthoritySources = async (
  repositoryRoot: string,
  manifest: ProjectManifest,
  concernIds: readonly ConcernId[],
): Promise<readonly RepositoryPath[]> => {
  const patterns: RepositoryPattern[] = [];
  for (const concernId of concernIds) {
    const concern = manifest.concerns[ConcernIdSchema.parse(concernId)];
    if (concern === undefined) {
      throw new TypeError(`unresolved ConcernId: ${concernId}`);
    }
    patterns.push(...concern.authority);
  }
  return expandRepositoryPatterns(repositoryRoot, patterns);
};

export const resolveConcernGateIds = (
  manifest: ProjectManifest,
  concernIds: readonly ConcernId[],
): readonly GateId[] => {
  const gateIds: GateId[] = [];
  for (const concernId of concernIds) {
    const concern = manifest.concerns[ConcernIdSchema.parse(concernId)];
    if (concern === undefined) {
      throw new TypeError(`unresolved ConcernId: ${concernId}`);
    }
    gateIds.push(...concern.gates);
  }
  return [...new Set(gateIds.map((gateId) => GateIdSchema.parse(gateId)))].sort();
};

export const resolveGovernanceGateIds = (
  manifest: ProjectManifest,
): readonly GateId[] => {
  const gateIds: GateId[] = [];
  for (const values of Object.values(manifest.governance.fitness)) {
    if (values !== undefined) gateIds.push(...values);
  }
  for (const rule of [
    ...manifest.governance.overrides,
    ...manifest.governance.extensions,
  ]) {
    gateIds.push(...rule.gates);
  }
  return [...new Set(gateIds.map((gateId) => GateIdSchema.parse(gateId)))].sort();
};

export const resolveVerificationGate = (
  manifest: ProjectManifest,
  gateId: GateId,
): ProjectManifest["verification"][string] => {
  const canonicalGateId = GateIdSchema.parse(gateId);
  const verification = manifest.verification[canonicalGateId];
  if (verification === undefined) {
    throw new TypeError(`unresolved GateId: ${canonicalGateId}`);
  }
  return verification;
};


export type ConfiguredProject = Readonly<{
  repositoryRoot: string;
  manifest: ProjectManifest;
}>;

export const loadConfiguredProjects = async (
  repositoryRoots: readonly string[],
): Promise<readonly ConfiguredProject[]> => {
  const projects = await Promise.all(repositoryRoots.map(async (configuredRoot) => {
    const repositoryRoot = await proveRepositoryRoot(configuredRoot);
    if (repositoryRoot !== configuredRoot) {
      throw new TypeError("configured target repository must already be its canonical Git root");
    }
    return {
      repositoryRoot,
      manifest: await loadValidatedProjectManifest(repositoryRoot),
    } satisfies ConfiguredProject;
  }));
  const ids = projects.map((project) => project.manifest.projectId);
  if (new Set(ids).size !== ids.length) {
    throw new TypeError("configured target repositories must have unique projectId values");
  }
  return [...projects].sort((left, right) =>
    left.manifest.projectId.localeCompare(right.manifest.projectId)
  );
};

export const resolveConfiguredProject = async (
  repositoryRoots: readonly string[],
  projectId: ProjectManifest["projectId"],
): Promise<ConfiguredProject> => {
  const projects = await loadConfiguredProjects(repositoryRoots);
  const project = projects.find((candidate) => candidate.manifest.projectId === projectId);
  if (!project) throw new TypeError(`unresolved configured projectId: ${projectId}`);
  return project;
};
