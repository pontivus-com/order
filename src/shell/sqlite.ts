import { Database } from "bun:sqlite";
import { closeSync, constants, existsSync, fstatSync, fsyncSync, lstatSync, mkdtempSync, openSync, readSync, realpathSync, renameSync, rmSync, unlinkSync, writeSync } from "node:fs";
import { join } from "node:path";

import {
  ApprovalIdSchema,
  ApprovalSchema,
  CandidateReviewEventSchema,
  type CandidateReviewEvent,
  ArtifactRefIdSchema,
  ArtifactRefSchema,
  ExecutionTaskIdSchema,
  ExecutionTaskSchema,
  ExecutionTaskStateSchema,
  RunEventIdSchema,
  RunEventSchema,
  RunIdSchema,
  RunSchema,
  Sha256Schema,
  WorkItemIdSchema,
  WorkItemSchema,
  WorkItemSchemaIdSchema,
  WorkItemSourcePathSchema,
  type Approval,
  type ApprovalId,
  type ArtifactRef,
  type ArtifactRefId,
  type ExecutionTask,
  type ExecutionTaskId,
  type ExecutionTaskState,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunId,
  type RepositoryPath,
  type Sha256,
  type WorkItem,
  type WorkItemId,
  type WorkItemSchemaId,
  type WorkItemSourcePath,
  type WorkStage,
} from "../core/contracts.ts";
import { canonicalJson } from "../core/canonical.ts";
import { parseSignedTaskBlockFromPlan } from "../core/execution.ts";
import { workItemSourcePathForId } from "../core/work-item-source.ts";
import { ensureSupportedStateRoot, sha256, statePaths } from "./runtime.ts";

const candidateReviewSchemaSql = `
CREATE TABLE candidateReviewEvents (
  id TEXT PRIMARY KEY,
  approvalId TEXT NOT NULL REFERENCES approvals(id),
  sequence INTEGER NOT NULL CHECK (sequence >= 1),
  occurredAt TEXT NOT NULL,
  actor TEXT CHECK (actor IS NULL OR length(trim(actor)) > 0),
  eventJson TEXT NOT NULL CHECK (json_valid(eventJson)),
  UNIQUE (approvalId, sequence)
) STRICT;
`;

const schemaSql = `
CREATE TABLE workItems (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  repositoryRoot TEXT NOT NULL,
  title TEXT NOT NULL,
  origin TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  outcome TEXT,
  concernIdsJson TEXT NOT NULL CHECK (json_valid(concernIdsJson)),
  archived INTEGER NOT NULL CHECK (archived IN (0, 1)),
  createdAt TEXT NOT NULL
) STRICT;

CREATE TABLE artifactRefs (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  repositoryPath TEXT NOT NULL,
  role TEXT NOT NULL,
  authorityLayer TEXT,
  sha256 TEXT NOT NULL,
  gitCommit TEXT
) STRICT;

CREATE INDEX artifactRefs_workItemId ON artifactRefs(workItemId);

CREATE TABLE artifactDependencies (
  artifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  dependsOnArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  PRIMARY KEY (artifactRefId, dependsOnArtifactRefId),
  CHECK (artifactRefId <> dependsOnArtifactRefId)
) STRICT;

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  baselineCommit TEXT NOT NULL,
  packageHash TEXT NOT NULL,
  planArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  r3ArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  sourceSha256 TEXT NOT NULL,
  approvedBy TEXT NOT NULL,
  approvedAt TEXT NOT NULL
) STRICT;

CREATE UNIQUE INDEX approvals_packageHash ON approvals(packageHash);

CREATE TABLE workItemSources (
  workItemId TEXT PRIMARY KEY REFERENCES workItems(id),
  schemaId TEXT NOT NULL,
  sourcePath TEXT NOT NULL,
  sourceSha256 TEXT NOT NULL,
  derivedFromWorkItemId TEXT
) STRICT;

CREATE TABLE executionTasks (
  id TEXT PRIMARY KEY,
  approvalId TEXT NOT NULL REFERENCES approvals(id),
  planTaskId TEXT NOT NULL,
  state TEXT NOT NULL,
  UNIQUE (approvalId, planTaskId)
) STRICT;

CREATE INDEX executionTasks_state ON executionTasks(state);

CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  executionTaskId TEXT REFERENCES executionTasks(id),
  stage TEXT NOT NULL,
  mode TEXT NOT NULL,
  role TEXT NOT NULL,
  triggerEventId TEXT REFERENCES runEvents(id),
  status TEXT NOT NULL,
  attempt INTEGER NOT NULL CHECK (attempt >= 1),
  baselineCommit TEXT NOT NULL,
  contextHash TEXT NOT NULL,
  providerSessionId TEXT,
  terminalClassification TEXT,
  startedAt TEXT NOT NULL,
  endedAt TEXT
) STRICT;

CREATE INDEX runs_workItemId ON runs(workItemId);
CREATE INDEX runs_executionTaskId ON runs(executionTaskId);

CREATE TABLE runEvents (
  id TEXT PRIMARY KEY,
  runId TEXT NOT NULL REFERENCES runs(id),
  sequence INTEGER NOT NULL CHECK (sequence >= 1),
  occurredAt TEXT NOT NULL,
  eventJson TEXT NOT NULL CHECK (json_valid(eventJson)),
  UNIQUE (runId, sequence)
) STRICT;
${candidateReviewSchemaSql}
`;

const recordRow = (value: unknown): Readonly<Record<string, unknown>> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("SQLite query did not return an object row");
  }
  return value as Readonly<Record<string, unknown>>;
};

const queryScalar = (
  database: Database,
  sql: string,
  key: string,
  ...bindings: readonly (string | number | null)[]
): unknown => {
  const value = database.query(sql).get(...bindings);
  if (value === null) {
    throw new TypeError(`SQLite scalar query did not return ${key}`);
  }
  const row = recordRow(value);
  if (!(key in row)) {
    throw new TypeError(`SQLite scalar query did not return ${key}`);
  }
  return row[key];
};

const queryTextScalar = (
  database: Database,
  sql: string,
  key: string,
  ...bindings: readonly (string | number | null)[]
): string => {
  const value = queryScalar(database, sql, key, ...bindings);
  if (typeof value !== "string") {
    throw new TypeError(`SQLite scalar ${key} must be text`);
  }
  return value;
};

const queryIntegerScalar = (
  database: Database,
  sql: string,
  key: string,
  ...bindings: readonly (string | number | null)[]
): number => {
  const value = queryScalar(database, sql, key, ...bindings);
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`SQLite scalar ${key} must be an integer`);
  }
  return value;
};

const configureDatabase = (database: Database): void => {
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA synchronous = FULL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA busy_timeout = 5000;");

  const journalMode = queryTextScalar(database, "PRAGMA journal_mode;", "journal_mode").toLowerCase();
  const synchronous = queryIntegerScalar(database, "PRAGMA synchronous;", "synchronous");
  const foreignKeys = queryIntegerScalar(database, "PRAGMA foreign_keys;", "foreign_keys");
  const busyTimeout = queryIntegerScalar(database, "PRAGMA busy_timeout;", "timeout");

  if (journalMode !== "wal") throw new TypeError("SQLite journal_mode must be WAL");
  if (synchronous !== 2) throw new TypeError("SQLite synchronous must be FULL");
  if (foreignKeys !== 1) throw new TypeError("SQLite foreign_keys must be ON");
  if (busyTimeout !== 5000) throw new TypeError("SQLite busy_timeout must be 5000");
};

const sqliteVersionAtLeast337 = (value: string): boolean => {
  const parts = value.split(".").map((part) => Number(part));
  if (parts.length < 2 || parts.some((part) => !Number.isInteger(part) || part < 0)) return false;
  const [major = 0, minor = 0, patch = 0] = parts;
  if (major !== 3) return major > 3;
  if (minor !== 37) return minor > 37;
  return patch >= 0;
};

const verifyCapabilities = (database: Database): void => {
  const version = queryTextScalar(database, "SELECT sqlite_version() AS version;", "version");
  if (!sqliteVersionAtLeast337(version)) {
    throw new TypeError(`SQLite >= 3.37 is required; found ${version}`);
  }

  const jsonValid = queryIntegerScalar(database, "SELECT json_valid('[]') AS valid;", "valid");
  if (jsonValid !== 1) throw new TypeError("SQLite JSON capability is required");
};

const userVersion = (database: Database): number =>
  queryIntegerScalar(database, "PRAGMA user_version;", "user_version");

const requireV4ReviewSchema = (database: Database): void => {
  const row = database.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='candidateReviewEvents';").get();
  if (row === null) throw new TypeError("Order SQLite v4 review table is missing");
  const actual = recordRow(row).sql;
  if (typeof actual !== "string" ||
      actual.replace(/\s+/g, " ").trim().replace(/;$/, "") !== candidateReviewSchemaSql.replace(/\s+/g, " ").trim().replace(/;$/, "")) {
    throw new TypeError("Order SQLite v4 review table contract is inconsistent");
  }
};

const initializeSchema = (database: Database): void => {
  const version = userVersion(database);
  if (version === 4) {
    requireV4ReviewSchema(database);
    return;
  }
  if (version !== 0) {
    throw new TypeError(`unsupported Order SQLite schema version: ${version}; installer migration required`);
  }
  database.transaction(() => {
    database.exec(schemaSql);
    requireV4ReviewSchema(database);
    database.exec("PRAGMA user_version = 4;");
  })();
  if (userVersion(database) !== 4) throw new TypeError("Order SQLite schema initialization did not set user_version=4");
};

const removeSqliteFiles = (path: string): void => {
  for (const candidate of [path, `${path}-wal`, `${path}-shm`]) {
    if (existsSync(candidate)) unlinkSync(candidate);
  }
};

export const verifyWalLocking = (stateRoot: string): void => {
  const path = join(stateRoot, `.order-wal-smoke-${crypto.randomUUID()}.sqlite3`);
  let first: Database | null = null;
  let second: Database | null = null;

  try {
    first = new Database(path, { create: true, strict: true });
    second = new Database(path, { create: true, strict: true });
    configureDatabase(first);
    configureDatabase(second);

    first.exec("CREATE TABLE smoke (value INTEGER NOT NULL) STRICT;");
    first.exec("INSERT INTO smoke(value) VALUES (1);");

    first.exec("BEGIN IMMEDIATE;");
    first.exec("UPDATE smoke SET value = 2;");
    const concurrentRead = queryIntegerScalar(second, "SELECT value FROM smoke;", "value");
    if (concurrentRead !== 1) {
      throw new TypeError("SQLite WAL smoke test did not preserve the concurrent reader snapshot");
    }
    first.exec("COMMIT;");

    const committedRead = queryIntegerScalar(second, "SELECT value FROM smoke;", "value");
    if (committedRead !== 2) {
      throw new TypeError("SQLite WAL smoke test did not expose the committed write");
    }
  } catch (error) {
    try {
      first?.exec("ROLLBACK;");
    } catch {
      // No active transaction is an expected cleanup state.
    }
    throw error;
  } finally {
    first?.close();
    second?.close();
    removeSqliteFiles(path);
  }
};

type InstallerDatabaseFileIdentity = Readonly<{ device: bigint; inode: bigint }>;
type InstallerDatabaseCandidate = InstallerDatabaseFileIdentity & Readonly<{ quiescedDigest?: string }>;

type InstallerDatabaseRootIdentity = InstallerDatabaseFileIdentity & Readonly<{ canonicalPath: string }>;

const installerDatabaseRootIdentity = (stateRoot: string): InstallerDatabaseRootIdentity => {
  const canonicalPath = realpathSync(stateRoot);
  const entry = lstatSync(canonicalPath, { bigint: true });
  if (!entry.isDirectory()) throw new TypeError("installer database state root is not a directory: " + stateRoot);
  return { canonicalPath, device: entry.dev, inode: entry.ino };
};

const requireInstallerDatabaseRoot = (archive: InstallerDatabaseCustody): void => {
  const observed = installerDatabaseRootIdentity(archive.stateRoot);
  if (observed.canonicalPath !== archive.rootIdentity.canonicalPath ||
      observed.device !== archive.rootIdentity.device || observed.inode !== archive.rootIdentity.inode) {
    throw new TypeError("installer database state root identity changed: " + archive.stateRoot);
  }
};

// Invocation-local filesystem custody is independent of rollback-archive
// policy. A current v4 or absent database has no archive to restore.
export type InstallerDatabaseCustody = Readonly<{
  stateRoot: string;
  rootIdentity: InstallerDatabaseRootIdentity;
  suffix: string | null;
  originals: readonly Readonly<{ path: string; identity: InstallerDatabaseFileIdentity | null; digest: string | null }>[];
  preparedCandidates: ReadonlyMap<string, InstallerDatabaseFileIdentity>;
}>;

export type LegacyDatabaseArchive = InstallerDatabaseCustody & Readonly<{
  suffix: string;
  archiveDatabase: string;
}>;

const inspectInstallerDatabaseFile = (path: string): InstallerDatabaseFileIdentity | null => {
  const entry = lstatSync(path, { bigint: true, throwIfNoEntry: false });
  if (entry === undefined) return null;
  if (!entry.isFile()) throw new TypeError("installer database path is not a regular file: " + path);
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = fstatSync(descriptor, { bigint: true });
    const after = lstatSync(path, { bigint: true });
    if (!stat.isFile() || !after.isFile() || stat.dev !== entry.dev || stat.ino !== entry.ino ||
        stat.dev !== after.dev || stat.ino !== after.ino) {
      throw new TypeError("installer database path changed during inspection: " + path);
    }
    return { device: stat.dev, inode: stat.ino };
  } finally { closeSync(descriptor); }
};

const sameInstallerDatabaseFile = (
  observed: InstallerDatabaseFileIdentity | null,
  expected: InstallerDatabaseFileIdentity | null,
): boolean => observed === null || expected === null ? observed === expected :
  observed.device === expected.device && observed.inode === expected.inode;

const requireInstallerDatabaseFile = (path: string, expected: InstallerDatabaseFileIdentity | null): void => {
  if (!sameInstallerDatabaseFile(inspectInstallerDatabaseFile(path), expected)) {
    throw new TypeError("installer database identity changed or missing: " + path);
  }
};

// Hash through the no-follow descriptor, not a pathname reopened after proof.
const installerDatabaseDigest = (path: string, expected: InstallerDatabaseFileIdentity | null): string | null => {
  requireInstallerDatabaseFile(path, expected);
  if (expected === null) return null;
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = fstatSync(descriptor, { bigint: true });
    if (!before.isFile() || before.dev !== expected.device || before.ino !== expected.inode) {
      throw new TypeError("installer database changed before reading: " + path);
    }
    const hash = new Bun.CryptoHasher("sha256");
    const buffer = Buffer.allocUnsafe(64 * 1024);
    for (;;) {
      const count = readSync(descriptor, buffer, 0, buffer.length, null);
      if (count === 0) break;
      hash.update(buffer.subarray(0, count));
    }
    const after = fstatSync(descriptor, { bigint: true });
    if (after.size !== before.size || after.mtimeNs !== before.mtimeNs || after.ctimeNs !== before.ctimeNs) {
      throw new TypeError("installer database changed while reading: " + path);
    }
    requireInstallerDatabaseFile(path, expected);
    return hash.digest("hex");
  } finally { closeSync(descriptor); }
};

const requireArchivedDatabaseOriginal = (
  path: string,
  original: LegacyDatabaseArchive["originals"][number],
): void => {
  if (installerDatabaseDigest(path, original.identity) !== original.digest) {
    throw new TypeError("installer database archive bytes changed: " + path);
  }
};

const orderDatabaseFiles = (path: string): readonly string[] =>
  [path, `${path}-wal`, `${path}-shm`];

export const readLegacyWorkItemRepositoryRootsForInstall = (
  stateRoot: string,
  onIncompleteRestore: () => void = () => {},
): readonly string[] => {
  const originals = captureInstallerDatabaseOriginals(stateRoot, onIncompleteRestore);
  if (originals[0]!.identity === null) return [];

  // This query precedes archive preparation during legacy guided setup.
  // Opening the original directly, even readonly, can mutate its WAL index.
  return probeInstallerDatabase(stateRoot, originals, database => {
    const version = userVersion(database);
    if (version === 4 || version === 3 || version === 2) return [];
    if (version !== 1) {
      throw new TypeError(
        `unsupported Order SQLite schema version during update: ${version}`,
      );
    }
    return database
      .query("SELECT DISTINCT repositoryRoot FROM workItems ORDER BY repositoryRoot;")
      .all()
      .map((row) => {
        const repositoryRoot = recordRow(row).repositoryRoot;
        if (typeof repositoryRoot !== "string" || !repositoryRoot.startsWith("/")) {
          throw new TypeError("legacy WorkItem repositoryRoot must be an absolute path");
        }
        return repositoryRoot;
      });
  }, onIncompleteRestore);
};

// Invocation-local filesystem boundary shared by prepare and restore.
// Production always uses the same filesystem operations; tests can fail an exact effect.
type InstallerDatabaseEffects = Readonly<{
  rename: typeof renameSync;
  copy: (source: number, target: number, sourcePath: string, targetPath: string) => void;
  unlink: typeof unlinkSync;
}>;
const installerDatabaseEffects: InstallerDatabaseEffects = {
  rename: renameSync,
  copy: (source, target) => {
    const buffer = Buffer.allocUnsafe(64 * 1024);
    for (;;) {
      const count = readSync(source, buffer, 0, buffer.length, null);
      if (count === 0) break;
      let offset = 0;
      while (offset < count) {
        const written = writeSync(target, buffer, offset, count - offset);
        if (written === 0) throw new Error("installer database copy made no progress");
        offset += written;
      }
    }
    fsyncSync(target);
  },
  unlink: unlinkSync,
};

const copyInstallerDatabaseOriginal = (
  original: LegacyDatabaseArchive["originals"][number],
  from: string,
  to: string,
  effects: InstallerDatabaseEffects,
  onCreated: (identity: InstallerDatabaseFileIdentity) => void,
): void => {
  requireArchivedDatabaseOriginal(from, original);
  if (original.identity === null) throw new TypeError("cannot copy absent installer database file: " + from);
  const source = openSync(from, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let targetIdentity: InstallerDatabaseFileIdentity;
  try {
    const opened = fstatSync(source, { bigint: true });
    if (!opened.isFile() || opened.dev !== original.identity.device || opened.ino !== original.identity.inode) {
      throw new TypeError("installer database source changed before copy: " + from);
    }
    // Keep the exclusive target descriptor open through the copy.
    const target = openSync(to, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    try {
      const stat = fstatSync(target, { bigint: true });
      targetIdentity = { device: stat.dev, inode: stat.ino };
      onCreated(targetIdentity);
      effects.copy(source, target, from, to);
    } finally { closeSync(target); }
  } finally { closeSync(source); }
  requireArchivedDatabaseOriginal(from, original);
  if (installerDatabaseDigest(to, targetIdentity) !== original.digest) {
    throw new TypeError("installer database copy differs from original: " + to);
  }
};

const probeInstallerDatabase = <T>(
  stateRoot: string,
  originals: LegacyDatabaseArchive["originals"],
  read: (database: Database) => T,
  onIncompleteRestore: () => void,
): T => {
  let result: T;
  try {
    result = readIsolatedInstallerDatabase(stateRoot, originals, read);
  } catch (error) {
    const failures: unknown[] = [];
    for (const original of originals) {
      try { requireArchivedDatabaseOriginal(original.path, original); }
      catch (failure) { failures.push(failure); }
    }
    if (failures.length > 0) {
      onIncompleteRestore();
      throw new AggregateError([error, ...failures], String(error) + "; original database custody incomplete: " + failures.map(String).join("; "));
    }
    throw error;
  }
  try {
    for (const original of originals) requireArchivedDatabaseOriginal(original.path, original);
  } catch (error) {
    onIncompleteRestore();
    throw error;
  }
  return result;
};

const readIsolatedInstallerDatabase = <T>(
  stateRoot: string,
  originals: LegacyDatabaseArchive["originals"],
  read: (database: Database) => T,
): T => {
  // Even a readonly SQLite connection can update its WAL index or create
  // sidecars. Read the schema version from an isolated, invocation-owned copy
  // so the exact admitted original namespace never participates in that open.
  const probe = mkdtempSync(join(stateRoot, ".installer-sqlite-probe."));
  let primary: unknown;
  try {
    const target = join(probe, "order.sqlite3");
    const paths = orderDatabaseFiles(target);
    for (const [index, original] of originals.entries()) {
      if (original.identity !== null) {
        copyInstallerDatabaseOriginal(original, original.path, paths[index]!, installerDatabaseEffects, () => {});
      }
    }
    const database = new Database(target, { readonly: true, create: false, strict: true });
    try { return read(database); } finally { database.close(); }
  } catch (error) {
    primary = error;
    throw error;
  } finally {
    try { rmSync(probe, { recursive: true }); }
    catch (failure) {
      const message = "installer database probe cleanup incomplete at " + probe + ": " + String(failure);
      if (primary !== undefined) throw new AggregateError([primary, failure], String(primary) + "; " + message);
      throw new Error(message, { cause: failure });
    }
  }
};

const captureInstallerDatabaseOriginals = (
  stateRoot: string,
  onIncompleteRestore: () => void,
): LegacyDatabaseArchive["originals"] => {
  const path = statePaths(stateRoot).database;
  try {
    const originals = orderDatabaseFiles(path).map(candidate => {
      const identity = inspectInstallerDatabaseFile(candidate);
      return { path: candidate, identity, digest: installerDatabaseDigest(candidate, identity) };
    });
    if (originals[0]!.identity === null && originals.some(original => original.identity !== null)) {
      throw new TypeError("installer database sidecars exist without the primary database: " + path);
    }
    for (const [index, original] of originals.entries()) {
      if (original.identity !== null && originals.slice(0, index).some(previous =>
          previous.identity !== null && sameInstallerDatabaseFile(previous.identity, original.identity))) {
        throw new TypeError("installer original database paths alias one physical object: " + original.path);
      }
    }
    return originals;
  } catch (error) {
    // No mutation was performed here, but the prior namespace cannot be
    // admitted for dependent restart when its exact original is unprovable.
    onIncompleteRestore();
    throw error;
  }
};

export const prepareOrderDatabaseForInstall = (
  stateRoot: string,
  onIncompleteRestore: () => void = () => {},
  effects: InstallerDatabaseEffects = installerDatabaseEffects,
  onUnarchived: (custody: InstallerDatabaseCustody) => void = () => {},
): LegacyDatabaseArchive | null => {
  const path = statePaths(stateRoot).database;
  // A missing state root has no database to archive. A dangling or
  // uninspectable root must not be misclassified as proven absence.
  if (lstatSync(stateRoot, { throwIfNoEntry: false }) === undefined) return null;
  let rootIdentity: InstallerDatabaseRootIdentity;
  try { rootIdentity = installerDatabaseRootIdentity(stateRoot); }
  catch (error) { onIncompleteRestore(); throw error; }
  const originals = captureInstallerDatabaseOriginals(stateRoot, onIncompleteRestore);
  const version = originals[0]!.identity === null ? null : probeInstallerDatabase(stateRoot, originals, userVersion, onIncompleteRestore);
  try {
    const current = installerDatabaseRootIdentity(stateRoot);
    if (current.canonicalPath !== rootIdentity.canonicalPath ||
        !sameInstallerDatabaseFile(current, rootIdentity)) {
      throw new TypeError("installer database state root changed during preparation: " + stateRoot);
    }
  } catch (error) { onIncompleteRestore(); throw error; }
  if (version === null || version === 4) {
    const preparedCandidates = new Map<string, InstallerDatabaseFileIdentity>();
    for (const original of originals) {
      if (original.identity !== null) preparedCandidates.set(original.path, original.identity);
    }
    const custody: InstallerDatabaseCustody = {
      stateRoot, rootIdentity, suffix: null, originals, preparedCandidates,
    };
    onUnarchived(custody);
    try { requireInstallerDatabaseCandidates(custody, observeInstallerDatabaseCandidates(custody, false), true); }
    catch (error) { onIncompleteRestore(); throw error; }
    return null;
  }
  if (version !== 1 && version !== 2 && version !== 3) {
    throw new TypeError(`unsupported Order SQLite schema version during update: ${version}`);
  }

  const suffix = `.legacy-v${version}.${crypto.randomUUID()}`;
  const moved: LegacyDatabaseArchive["originals"][number][] = [];
  const copies = new Map<string, InstallerDatabaseFileIdentity>();
  const archive: LegacyDatabaseArchive = {
    stateRoot, rootIdentity, suffix, archiveDatabase: path + suffix, originals, preparedCandidates: copies,
  };
  try {
    for (const original of originals) {
      requireInstallerDatabaseRoot(archive);
      requireArchivedDatabaseOriginal(original.path, original);
      requireInstallerDatabaseFile(original.path + suffix, null);
      if (original.identity === null) continue;
      effects.rename(original.path, original.path + suffix);
      moved.push(original);
    }
    if (version === 2 || version === 3) {
      for (const original of moved) {
        requireInstallerDatabaseRoot(archive);
        copyInstallerDatabaseOriginal(original, original.path + suffix, original.path,
          effects, identity => { copies.set(original.path, identity); });
      }
    }
    requireInstallerDatabaseCandidates(archive, observeInstallerDatabaseCandidates(archive, false), true);
  } catch (error) {
    const failures: unknown[] = [];
    for (const original of [...moved].reverse()) {
      try {
        // Never destroy a candidate unless the exact archived original survives.
        requireInstallerDatabaseRoot(archive);
        requireArchivedDatabaseOriginal(original.path + suffix, original);
        const candidate = inspectInstallerDatabaseFile(original.path);
        if (candidate !== null) {
          const owned = copies.get(original.path);
          if (owned === undefined || !sameInstallerDatabaseFile(candidate, owned)) {
            throw new TypeError("ambiguous installer database candidate retained: " + original.path);
          }
        }
        effects.rename(original.path + suffix, original.path);
        requireArchivedDatabaseOriginal(original.path, original);
      } catch (failure) {
        failures.push(new Error("database compensation incomplete at " + original.path +
          "; archive path: " + original.path + suffix + "; " + String(failure), { cause: failure }));
      }
    }
    // Paths not moved by this invocation must still match their pre-effect
    // original membership; a failed precondition is not proof of restoration.
    for (const original of originals) {
      if (moved.includes(original)) continue;
      try { requireInstallerDatabaseRoot(archive); requireArchivedDatabaseOriginal(original.path, original); }
      catch (failure) {
        failures.push(new Error("untouched database path cannot be proven: " + original.path +
          "; " + String(failure), { cause: failure }));
      }
    }
    if (failures.length > 0) {
      onIncompleteRestore();
      throw new AggregateError([error, ...failures], "installer database prepare failed: " + String(error) + "; incomplete restoration at " + failures.map(String).join("; "));
    }
    throw error;
  }
  return archive;
};

// Observe the invocation's candidate namespace before stopping its service.
// A missing map entry is intentionally unproven, distinct from proven absence.
export const observeInstallerDatabaseCandidates = (
  archive: InstallerDatabaseCustody,
  candidateEffectsStarted: boolean,
  priorCandidates?: ReadonlyMap<string, InstallerDatabaseCandidate | null>,
  quiesced = false,
): ReadonlyMap<string, InstallerDatabaseCandidate | null> => {
  const observed = new Map<string, InstallerDatabaseCandidate | null>();
  try { requireInstallerDatabaseRoot(archive); }
  catch { return observed; }
  for (const original of archive.originals) {
    const prepared = archive.preparedCandidates.get(original.path) ?? null;
    if (!candidateEffectsStarted) {
      observed.set(original.path, prepared === null ? null : { ...prepared, quiescedDigest: original.digest ?? undefined });
      continue;
    }
    try {
      // A failed earlier custody observation never grants a later writer
      // permission to adopt an unknown path.
      if (priorCandidates !== undefined && !priorCandidates.has(original.path)) continue;
      const candidate = inspectInstallerDatabaseFile(original.path);
      // The v2 copy and any primary established by a previous admitted
      // writer must remain the same object. Only the initial absent primary
      // and WAL/SHM may evolve under the admitted maintenance writer.
      if (original.path === statePaths(archive.stateRoot).database) {
        const expectedPrimary = priorCandidates === undefined ? prepared : priorCandidates.get(original.path) ?? null;
        if (expectedPrimary !== null && !sameInstallerDatabaseFile(candidate, expectedPrimary)) continue;
      }
      if (archive.suffix !== null && candidate !== null && archive.originals.some(entry =>
          entry.identity !== null && sameInstallerDatabaseFile(candidate, entry.identity))) continue;
      const digest = quiesced && candidate !== null ? installerDatabaseDigest(original.path, candidate) : null;
      observed.set(original.path, candidate === null ? null : digest === null ? candidate : { ...candidate, quiescedDigest: digest });
    } catch { /* An unprovable pathname must not prevent independent compensation. */ }
  }
  // One physical object cannot be attributed to two distinct DB/WAL/SHM
  // paths. Do not compensate either member of an ambiguous alias.
  const aliases = new Set<string>();
  for (const [path, candidate] of observed) {
    if (candidate === null) continue;
    for (const [otherPath, other] of observed) {
      if (path !== otherPath && other !== null && sameInstallerDatabaseFile(candidate, other)) {
        aliases.add(path);
        aliases.add(otherPath);
      }
    }
  }
  for (const path of aliases) observed.delete(path);
  return observed;
};

// At each admitted writer boundary, prove the expected namespace before
// permitting migration or startup to acquire it. Unexpected paths never gain
// custody merely because a later service observation finds them.
export const requireInstallerDatabaseCandidates = (
  archive: InstallerDatabaseCustody,
  expected: ReadonlyMap<string, InstallerDatabaseCandidate | null>,
  preparedOnly: boolean,
): void => {
  requireInstallerDatabaseRoot(archive);
  for (const original of archive.originals) {
    if (archive.suffix !== null) requireArchivedDatabaseOriginal(original.path + archive.suffix, original);
    const candidate = expected.get(original.path);
    if (candidate === undefined || !expected.has(original.path)) {
      throw new TypeError("installer database candidate custody unavailable: " + original.path);
    }
    requireInstallerDatabaseFile(original.path, candidate);
    const expectedDigest = candidate?.quiescedDigest ?? (preparedOnly ? original.digest : null);
    if (candidate !== null && expectedDigest !== null &&
        installerDatabaseDigest(original.path, candidate) !== expectedDigest) {
      throw new TypeError("installer database candidate changed before admitted effects: " + original.path);
    }
  }
};

// The same post-quiescence custody test protects both destructive legacy
// compensation and non-mutating v4/fresh restart admission.
const requireInstallerDatabaseCompensationCandidate = (
  path: string,
  candidates: ReadonlyMap<string, InstallerDatabaseCandidate | null>,
  allowDisappearance: boolean,
): InstallerDatabaseFileIdentity | null => {
  const candidate = inspectInstallerDatabaseFile(path);
  const observed = candidates.get(path);
  if (!candidates.has(path) ||
      (candidate !== null && (observed === undefined || !sameInstallerDatabaseFile(candidate, observed))) ||
      (candidate === null && observed !== null && !allowDisappearance)) {
    throw new TypeError("ambiguous installer database candidate retained: " + path);
  }
  if (candidate !== null && observed?.quiescedDigest !== undefined &&
      installerDatabaseDigest(path, candidate) !== observed.quiescedDigest) {
    throw new TypeError("ambiguous installer database candidate bytes retained: " + path);
  }
  return candidate;
};

export const requireUnarchivedInstallerDatabaseForRestart = (
  custody: InstallerDatabaseCustody,
  candidates: ReadonlyMap<string, InstallerDatabaseCandidate | null>,
  serviceStopped: boolean,
): void => {
  if (custody.suffix !== null) throw new TypeError("expected unarchived installer database custody");
  requireInstallerDatabaseRoot(custody);
  for (const original of custody.originals) {
    requireInstallerDatabaseCompensationCandidate(original.path, candidates,
      serviceStopped && original.path !== statePaths(custody.stateRoot).database);
  }
};

export const restoreOrderDatabaseAfterFailedInstall = (
  archive: LegacyDatabaseArchive,
  effects: InstallerDatabaseEffects = installerDatabaseEffects,
  // Existing direct callers own the entire quiesced prepare/use/restore sequence.
  candidates = observeInstallerDatabaseCandidates(archive, true),
  allowSidecarDisappearance = true,
): void => {
  requireInstallerDatabaseRoot(archive);
  const expectedPaths = orderDatabaseFiles(statePaths(archive.stateRoot).database);
  if (archive.originals.length !== expectedPaths.length ||
      expectedPaths.some((path, index) => archive.originals[index]?.path !== path)) {
    throw new TypeError("installer database archive membership is inconsistent");
  }
  const failures: unknown[] = [];
  for (const original of [...archive.originals].reverse()) {
    const archived = original.path + archive.suffix;
    try {
      requireInstallerDatabaseRoot(archive);
      requireArchivedDatabaseOriginal(archived, original);
      const candidate = requireInstallerDatabaseCompensationCandidate(original.path, candidates,
        allowSidecarDisappearance && original.path !== expectedPaths[0]);
      // A previously observed WAL/SHM may disappear on verified service stop.
      if (original.identity === null) {
        if (candidate !== null) effects.unlink(original.path);
        requireInstallerDatabaseFile(original.path, null);
      } else {
        // Atomic replacement keeps the archived original available until
        // the restore succeeds; a missing archive never deletes a candidate.
        effects.rename(archived, original.path);
        requireArchivedDatabaseOriginal(original.path, original);
      }
    } catch (error) {
      failures.push(new Error("database restoration incomplete at " + original.path +
        "; archive path: " + archived + "; " + String(error), { cause: error }));
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, "installer database restoration incomplete: " + failures.map(String).join("; "));
  }
};

export const openOrderDatabase = (stateRoot: string): Database => {
  ensureSupportedStateRoot(stateRoot);
  verifyWalLocking(stateRoot);

  const database = new Database(statePaths(stateRoot).database, {
    create: true,
    strict: true,
  });

  try {
    const version = userVersion(database);
    if (version !== 0 && version !== 4) throw new TypeError(`unsupported Order SQLite schema version: ${version}; installer migration required`);
    configureDatabase(database);
    verifyCapabilities(database);
    initializeSchema(database);
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
};

export const withTransaction = <T>(
  database: Database,
  operation: () => T,
): T => database.transaction(operation)();


const persistedJson = (value: unknown): unknown => {
  if (typeof value !== "string") throw new TypeError("persisted JSON column must be text");
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new TypeError("persisted JSON is invalid", { cause: error });
  }
};

const workItemSelect =
  `SELECT w.id, w.projectId, w.repositoryRoot, w.title, w.origin,
          s.schemaId, s.sourcePath, s.sourceSha256, s.derivedFromWorkItemId,
          w.stage, w.status, w.outcome, w.concernIdsJson, w.archived, w.createdAt
   FROM workItems w
   JOIN workItemSources s ON s.workItemId = w.id`;
const artifactSelect =
  "SELECT id, workItemId, repositoryPath, role, authorityLayer, sha256, gitCommit FROM artifactRefs";
const approvalSelect =
  "SELECT id, workItemId, baselineCommit, packageHash, planArtifactRefId, r3ArtifactRefId, sourceSha256, approvedBy, approvedAt FROM approvals";
const runSelect =
  "SELECT id, workItemId, executionTaskId, stage, mode, role, triggerEventId, status, attempt, baselineCommit, contextHash, providerSessionId, terminalClassification, startedAt, endedAt FROM runs";

const parseWorkItemRow = (value: unknown): WorkItem => {
  const row = recordRow(value);
  const { concernIdsJson, archived, ...fields } = row;
  if (archived !== 0 && archived !== 1) {
    throw new TypeError("persisted WorkItem archived projection must be 0 or 1");
  }
  return WorkItemSchema.parse({
    ...fields,
    concernIds: persistedJson(concernIdsJson),
    archived: archived === 1,
  });
};

const parseRunEventRow = (value: unknown): RunEvent => {
  const row = recordRow(value);
  return RunEventSchema.parse({
    id: row.id,
    runId: row.runId,
    sequence: row.sequence,
    occurredAt: row.occurredAt,
    event: persistedJson(row.eventJson),
  });
};

export const readOrderV2MigrationStateForInstall = (
  stateRoot: string,
): readonly (readonly [WorkItem, readonly ArtifactRef[]])[] => {
  const path = statePaths(stateRoot).database;
  if (!existsSync(path)) return [];
  const database = new Database(path, { readonly: true, create: false, strict: true });
  try {
    if (userVersion(database) !== 2) return [];
    const executionWorkItems = queryIntegerScalar(
      database,
      "SELECT count(*) AS value FROM workItems WHERE stage='EXECUTION';",
      "value",
    );
    const runningTasks = queryIntegerScalar(
      database,
      "SELECT count(*) AS value FROM executionTasks WHERE state='RUNNING';",
      "value",
    );
    const activePostSignoffRuns = queryIntegerScalar(
      database,
      "SELECT count(*) AS value FROM runs WHERE executionTaskId IS NOT NULL AND status IN ('RUNNING','WAITING_FOR_INPUT');",
      "value",
    );
    if (executionWorkItems !== 0 || runningTasks !== 0 || activePostSignoffRuns !== 0) {
      throw new TypeError("v2→v3 migration is prohibited while post-signoff execution is active");
    }
    const legacyWorkItemSelect =
      `SELECT w.id, w.projectId, w.repositoryRoot, w.title, w.origin,
              s.schemaId, s.sourcePath, s.sourceSha256, s.derivedFromWorkItemId,
              w.stage, w.status, w.outcome, w.concernIdsJson, w.createdAt
       FROM workItems w
       JOIN workItemSources s ON s.workItemId = w.id`;
    const workItems = database.query(`${legacyWorkItemSelect} ORDER BY createdAt, id;`).all()
      .map((row) => {
        const value = recordRow(row);
        const { concernIdsJson, ...fields } = value;
        return WorkItemSchema.parse({
          ...fields,
          concernIds: persistedJson(concernIdsJson),
          archived: false,
        });
      });
    return workItems.map((workItem) => {
      const artifactsById = new Map(
        database
          .query(`${artifactSelect} WHERE workItemId=?1;`)
          .all(workItem.id)
          .map((row) => ArtifactRefSchema.parse(row))
          .map((artifact) => [artifact.id, artifact] as const),
      );
      const current: ArtifactRef[] = [];
      for (const stage of ["R1", "R2", "DESIGN", "PLAN", "R3"] as const) {
        const runRow = database.query(
          "SELECT id FROM runs WHERE workItemId=?1 AND role='STAGE' AND stage=?2 ORDER BY startedAt DESC, attempt DESC, id DESC LIMIT 1;",
        ).get(workItem.id, stage);
        if (runRow === null) continue;
        const runId = RunIdSchema.parse(recordRow(runRow).id);
        const events = database.query(
          "SELECT id, runId, sequence, occurredAt, eventJson FROM runEvents WHERE runId=?1 ORDER BY sequence;",
        ).all(runId).map(parseRunEventRow);
        const conformance = events.findLast((event) =>
          event.event.tag === "CONFORMANCE_PASSED" && event.event.stage === stage
        );
        if (conformance?.event.tag !== "CONFORMANCE_PASSED") continue;
        for (const artifactId of conformance.event.outputArtifactRefIds) {
          const artifact = artifactsById.get(artifactId);
          if (artifact !== undefined && artifact.role === stage) current.push(artifact);
        }
      }
      return [workItem, current] as const;
    });
  } finally {
    database.close();
  }
};

export const migrateOrderDatabaseV2ToV3 = (
  stateRoot: string,
  sourcePaths: ReadonlyMap<WorkItemId, WorkItemSourcePath>,
  archivedById: ReadonlyMap<WorkItemId, boolean>,
): void => {
  const path = statePaths(stateRoot).database;
  if (!existsSync(path)) return;
  const database = new Database(path, { create: false, strict: true });
  try {
    configureDatabase(database);
    const version = userVersion(database);
    if (version === 3) return;
    if (version !== 2) {
      throw new TypeError(`v2→v3 migration requires SQLite user_version=2; found ${version}`);
    }

    const executionWorkItems = queryIntegerScalar(
      database,
      "SELECT count(*) AS value FROM workItems WHERE stage='EXECUTION';",
      "value",
    );
    const runningTasks = queryIntegerScalar(
      database,
      "SELECT count(*) AS value FROM executionTasks WHERE state='RUNNING';",
      "value",
    );
    const activePostSignoffRuns = queryIntegerScalar(
      database,
      "SELECT count(*) AS value FROM runs WHERE executionTaskId IS NOT NULL AND status IN ('RUNNING','WAITING_FOR_INPUT');",
      "value",
    );
    if (executionWorkItems !== 0 || runningTasks !== 0 || activePostSignoffRuns !== 0) {
      throw new TypeError("v2→v3 migration is prohibited while post-signoff execution is active");
    }

    const workItemIds = database.query("SELECT id FROM workItems ORDER BY id;").all()
      .map((row) => WorkItemIdSchema.parse(recordRow(row).id));
    if (
      sourcePaths.size !== workItemIds.length ||
      workItemIds.some((id) => !sourcePaths.has(id))
    ) {
      throw new TypeError("v2→v3 migration source-path map must cover every WorkItem exactly");
    }
    if (
      archivedById.size !== workItemIds.length ||
      workItemIds.some((id) => !archivedById.has(id))
    ) {
      throw new TypeError("v2→v3 migration archive-state map must cover every WorkItem exactly");
    }

    database.transaction(() => {
      database.exec(
        "ALTER TABLE workItems ADD COLUMN archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1));",
      );
      database.exec(`
        CREATE TABLE workItemSources_v3 (
          workItemId TEXT PRIMARY KEY REFERENCES workItems(id),
          schemaId TEXT NOT NULL,
          sourcePath TEXT NOT NULL,
          sourceSha256 TEXT NOT NULL,
          derivedFromWorkItemId TEXT
        ) STRICT;
        INSERT INTO workItemSources_v3(workItemId, schemaId, sourcePath, sourceSha256, derivedFromWorkItemId)
          SELECT workItemId, schemaId, sourcePath, sourceSha256, derivedFromWorkItemId FROM workItemSources;
        DROP TABLE workItemSources;
        ALTER TABLE workItemSources_v3 RENAME TO workItemSources;
      `);
      for (const id of workItemIds) {
        database.query("UPDATE workItemSources SET sourcePath=?2 WHERE workItemId=?1;")
          .run(id, WorkItemSourcePathSchema.parse(sourcePaths.get(id)));
        database.query("UPDATE workItems SET archived=?2 WHERE id=?1;")
          .run(id, archivedById.get(id) === true ? 1 : 0);
      }
      database.exec(`
        UPDATE workItems
        SET stage='R1', status='ACTIVE', outcome=NULL
        WHERE stage NOT IN ('IDEA','COMPLETE');
      `);
      database.exec("PRAGMA user_version = 3;");
    })();

    if (userVersion(database) !== 3) {
      throw new TypeError("Order SQLite v2→v3 migration did not set user_version=3");
    }
  } finally {
    database.close();
  }
};

// Installer-only v3→v4 migration. Existing archive/copy custody remains the
// sole owner of original bytes; never migrate the only original database.
export const migrateOrderDatabaseV3ToV4 = (
  archive: LegacyDatabaseArchive,
  candidates: ReadonlyMap<string, InstallerDatabaseCandidate | null>,
): void => {
  const path = statePaths(archive.stateRoot).database;
  if (!archive.preparedCandidates.has(path) ||
      (!archive.suffix.startsWith(".legacy-v2.") && !archive.suffix.startsWith(".legacy-v3."))) {
    throw new TypeError("v3→v4 requires an archived original and verified migration candidate");
  }
  requireInstallerDatabaseCandidates(archive, candidates, false);
  const database = new Database(path, { create: false, strict: true });
  try {
    configureDatabase(database);
    verifyCapabilities(database);
    if (userVersion(database) !== 3) throw new TypeError("v3→v4 requires exact schema version 3");
    const originalTables = database.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
      .all().map(row => recordRow(row).name);
    if (originalTables.some(name => typeof name !== "string") ||
        !["workItems", "workItemSources", "artifactRefs", "artifactDependencies", "approvals", "executionTasks", "runs", "runEvents"].every(name => originalTables.includes(name)) ||
        originalTables.includes("candidateReviewEvents")) throw new TypeError("v3 schema table membership is inconsistent");
    // All old table rows, not merely counts, must be identical inside the
    // additive schema transaction. No historical completion is synthesized.
    const snapshot = (): string => canonicalJson(originalTables.map(name => {
      if (typeof name !== "string") throw new TypeError("invalid table name");
      const quoted = '"' + name.replaceAll('"', '""') + '"';
      const rows = database.query("SELECT * FROM " + quoted).all().map(row => canonicalJson(recordRow(row))).sort();
      return [name, rows];
    }));
    database.transaction(() => {
      const before = snapshot();
      database.exec(candidateReviewSchemaSql);
      requireV4ReviewSchema(database);
      if (snapshot() !== before) throw new TypeError("v3→v4 altered historical rows");
      if (database.query("PRAGMA foreign_key_check;").all().length !== 0 ||
          queryTextScalar(database, "PRAGMA integrity_check;", "integrity_check") !== "ok") {
        throw new TypeError("v3→v4 integrity verification failed");
      }
      database.exec("PRAGMA user_version = 4;");
      if (userVersion(database) !== 4) throw new TypeError("v3→v4 failed to establish schema version");
    })();
  } finally {
    database.close();
  }
};

export const loadWorkItems = (
  database: Database,
): readonly WorkItem[] =>
  database.query(`${workItemSelect} ORDER BY createdAt, id;`).all().map(parseWorkItemRow);

export const migrateWorkItemSourcePathsForRepository = (
  database: Database,
  repositoryRoot: string,
  fromWorkItemsRoot: RepositoryPath,
  toWorkItemsRoot: RepositoryPath,
): readonly WorkItemId[] => withTransaction(database, () => {
  const workItems = loadWorkItems(database)
    .filter((workItem) => workItem.repositoryRoot === repositoryRoot);
  const update = database.query(
    "UPDATE workItemSources SET sourcePath=?2 WHERE workItemId=?1;",
  );
  for (const workItem of workItems) {
    const expected = workItemSourcePathForId(fromWorkItemsRoot, workItem.id);
    if (workItem.sourcePath !== expected) {
      throw new TypeError(
        `persisted WorkItem source path does not match current document root: ${workItem.id}`,
      );
    }
    update.run(
      workItem.id,
      workItemSourcePathForId(toWorkItemsRoot, workItem.id),
    );
  }
  return workItems.map((workItem) => workItem.id);
});

export const loadWorkItem = (
  database: Database,
  workItemId: WorkItemId,
): WorkItem => {
  const row = database
    .query(`${workItemSelect} WHERE id = ?1;`)
    .get(WorkItemIdSchema.parse(workItemId));
  if (row === null) throw new TypeError("WorkItem does not exist");
  return parseWorkItemRow(row);
};

export const loadArtifactsForWorkItem = (
  database: Database,
  workItemId: WorkItemId,
): readonly ArtifactRef[] =>
  database
    .query(`${artifactSelect} WHERE workItemId = ?1 ORDER BY repositoryPath, role, authorityLayer, id;`)
    .all(WorkItemIdSchema.parse(workItemId))
    .map((row) => ArtifactRefSchema.parse(row));

export const loadArtifact = (
  database: Database,
  artifactRefId: ArtifactRefId,
): ArtifactRef => {
  const row = database
    .query(`${artifactSelect} WHERE id = ?1;`)
    .get(ArtifactRefIdSchema.parse(artifactRefId));
  if (row === null) throw new TypeError("ArtifactRef does not exist");
  return ArtifactRefSchema.parse(row);
};

export const loadApproval = (
  database: Database,
  approvalId: ApprovalId,
): Approval => {
  const row = database
    .query(`${approvalSelect} WHERE id = ?1;`)
    .get(ApprovalIdSchema.parse(approvalId));
  if (row === null) throw new TypeError("Approval does not exist");
  return ApprovalSchema.parse(row);
};

export const loadCurrentApprovalForWorkItem = (
  database: Database,
  workItemId: WorkItemId,
): Approval | null => {
  const row = database
    .query(`${approvalSelect} WHERE workItemId = ?1 ORDER BY approvedAt DESC, id DESC LIMIT 1;`)
    .get(WorkItemIdSchema.parse(workItemId));
  return row === null ? null : ApprovalSchema.parse(row);
};

export const loadApprovalsForWorkItem = (
  database: Database,
  workItemId: WorkItemId,
): readonly Approval[] =>
  database
    .query(`${approvalSelect} WHERE workItemId = ?1 ORDER BY approvedAt, id;`)
    .all(WorkItemIdSchema.parse(workItemId))
    .map((row) => ApprovalSchema.parse(row));

export const loadApprovals = (
  database: Database,
): readonly Approval[] =>
  database
    .query(`${approvalSelect} ORDER BY approvedAt, id;`)
    .all()
    .map((row) => ApprovalSchema.parse(row));

export const loadRun = (
  database: Database,
  runId: RunId,
): Run => {
  const row = database
    .query(`${runSelect} WHERE id = ?1;`)
    .get(RunIdSchema.parse(runId));
  if (row === null) throw new TypeError("Run does not exist");
  return RunSchema.parse(row);
};

export const loadRunsForWorkItem = (
  database: Database,
  workItemId: WorkItemId,
): readonly Run[] =>
  database
    .query(`${runSelect} WHERE workItemId = ?1 ORDER BY startedAt, attempt, id;`)
    .all(WorkItemIdSchema.parse(workItemId))
    .map((row) => RunSchema.parse(row));

export const loadRunsForExecutionTask = (
  database: Database,
  executionTaskId: ExecutionTaskId,
): readonly Run[] =>
  database
    .query(`${runSelect} WHERE executionTaskId=?1 ORDER BY attempt, startedAt, id;`)
    .all(ExecutionTaskIdSchema.parse(executionTaskId))
    .map((row) => RunSchema.parse(row));

export const loadRunningRunForExecutionTask = (
  database: Database,
  executionTaskId: ExecutionTaskId,
): Run | null => {
  const row = database
    .query(`${runSelect} WHERE executionTaskId=?1 AND status='RUNNING' ORDER BY attempt DESC, startedAt DESC LIMIT 1;`)
    .get(ExecutionTaskIdSchema.parse(executionTaskId));
  return row === null ? null : RunSchema.parse(row);
};

export const loadRunningRuns = (
  database: Database,
): readonly Run[] =>
  database
    .query(`${runSelect} WHERE status='RUNNING' ORDER BY startedAt, id;`)
    .all()
    .map((row) => RunSchema.parse(row));

export const loadRunEvents = (
  database: Database,
  runId: RunId,
  afterSequence = 0,
): readonly RunEvent[] => {
  if (!Number.isInteger(afterSequence) || afterSequence < 0) {
    throw new TypeError("afterSequence must be a non-negative integer");
  }
  return database
    .query(
      "SELECT id, runId, sequence, occurredAt, eventJson FROM runEvents WHERE runId = ?1 AND sequence > ?2 ORDER BY sequence;",
    )
    .all(RunIdSchema.parse(runId), afterSequence)
    .map(parseRunEventRow);
};

export const loadRunEvent = (
  database: Database,
  eventId: RunEventId,
): RunEvent => {
  const row = database
    .query(
      "SELECT id, runId, sequence, occurredAt, eventJson FROM runEvents WHERE id = ?1;",
    )
    .get(RunEventIdSchema.parse(eventId));
  if (row === null) throw new TypeError("RunEvent does not exist");
  return parseRunEventRow(row);
};

export const nextRunEventSequence = (
  database: Database,
  runId: RunId,
): number =>
  queryIntegerScalar(
    database,
    "SELECT coalesce(max(sequence), 0) AS value FROM runEvents WHERE runId = ?1;",
    "value",
    RunIdSchema.parse(runId),
  ) + 1;

export const storeRunEvent = (
  database: Database,
  event: RunEvent,
): void => {
  const value = RunEventSchema.parse(event);
  database
    .query(
      "INSERT INTO runEvents(id, runId, sequence, occurredAt, eventJson) VALUES (?1, ?2, ?3, ?4, ?5);",
    )
    .run(
      value.id,
      value.runId,
      value.sequence,
      value.occurredAt,
      canonicalJson(value.event),
    );
};

export const loadCandidateReviewEvents = (
  database: Database, approvalId: ApprovalId,
): readonly CandidateReviewEvent[] => {
  const id = ApprovalIdSchema.parse(approvalId);
  const rows = database.query(
    "SELECT id, approvalId, sequence, occurredAt, actor, eventJson FROM candidateReviewEvents WHERE approvalId=?1 ORDER BY sequence;",
  ).all(id);
  return rows.map((value, index) => {
    const row = recordRow(value);
    const event = CandidateReviewEventSchema.parse({
      id: row.id, approvalId: row.approvalId, sequence: row.sequence, occurredAt: row.occurredAt,
      actor: row.actor, event: persistedJson(row.eventJson),
    });
    if (event.approvalId !== id || event.sequence !== index + 1 || event.actor !== row.actor ||
        canonicalJson(event.event) !== row.eventJson) {
      throw new TypeError("persisted CandidateReviewEvent stream is not canonical");
    }
    return event;
  });
};

// Call inside the existing owning WorkItem transaction. The append checks
// sequence and exact canonical carrier; FK and UNIQUE remain enforced by SQL.
export const storeCandidateReviewEvent = (
  database: Database, input: CandidateReviewEvent,
): void => {
  const event = CandidateReviewEventSchema.parse(input);
  const history = loadCandidateReviewEvents(database, event.approvalId);
  if (event.sequence !== history.length + 1 ||
      (history.length === 0) !== (event.event.tag === "OPENED") ||
      history.some(entry => entry.id === event.id || entry.event.tag === "ACCEPT" || entry.event.tag === "REANALYSIS_REQUESTED")) {
    throw new TypeError("CandidateReviewEvent append identity or sequence conflict");
  }
  database.query(
    "INSERT INTO candidateReviewEvents(id, approvalId, sequence, occurredAt, actor, eventJson) VALUES (?1,?2,?3,?4,?5,?6);",
  ).run(event.id, event.approvalId, event.sequence, event.occurredAt, event.actor, canonicalJson(event.event));
};

export const storeRun = (
  database: Database,
  run: Run,
): void => {
  const value = RunSchema.parse(run);
  database
    .query(
      `INSERT INTO runs(
        id, workItemId, executionTaskId, stage, mode, role, triggerEventId, status,
        attempt, baselineCommit, contextHash, providerSessionId, terminalClassification,
        startedAt, endedAt
      ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15);`,
    )
    .run(
      value.id,
      value.workItemId,
      value.executionTaskId,
      value.stage,
      value.mode,
      value.role,
      value.triggerEventId,
      value.status,
      value.attempt,
      value.baselineCommit,
      value.contextHash,
      value.providerSessionId,
      value.terminalClassification,
      value.startedAt,
      value.endedAt,
    );
};

export const updateStoredRun = (
  database: Database,
  run: Run,
): void => {
  const value = RunSchema.parse(run);
  database
    .query(
      "UPDATE runs SET status=?2, providerSessionId=?3, terminalClassification=?4, endedAt=?5, contextHash=?6 WHERE id=?1;",
    )
    .run(
      value.id,
      value.status,
      value.providerSessionId,
      value.terminalClassification,
      value.endedAt,
      value.contextHash,
    );
};

export const loadTaskStatesForApproval = (
  database: Database,
  approvalId: ApprovalId,
): readonly (readonly [ExecutionTaskId, ExecutionTaskState])[] =>
  database
    .query("SELECT id, state FROM executionTasks WHERE approvalId = ?1 ORDER BY planTaskId, id;")
    .all(ApprovalIdSchema.parse(approvalId))
    .map((value) => {
      const row = recordRow(value);
      return [
        ExecutionTaskIdSchema.parse(row.id),
        ExecutionTaskStateSchema.parse(row.state),
      ] as const;
    });

export const findArtifactSnapshot = (
  database: Database,
  artifact: Omit<ArtifactRef, "id">,
): ArtifactRef | null => {
  const row = database
    .query(
      `${artifactSelect} WHERE workItemId=?1 AND repositoryPath=?2 AND role=?3 AND
       ((authorityLayer IS NULL AND ?4 IS NULL) OR authorityLayer=?4) AND sha256=?5 AND
       ((gitCommit IS NULL AND ?6 IS NULL) OR gitCommit=?6)
       ORDER BY id LIMIT 1;`,
    )
    .get(
      artifact.workItemId,
      artifact.repositoryPath,
      artifact.role,
      artifact.authorityLayer,
      artifact.sha256,
      artifact.gitCommit,
    );
  return row === null ? null : ArtifactRefSchema.parse(row);
};

export const storeArtifact = (
  database: Database,
  artifact: ArtifactRef,
): void => {
  const value = ArtifactRefSchema.parse(artifact);
  database
    .query(
      "INSERT INTO artifactRefs(id, workItemId, repositoryPath, role, authorityLayer, sha256, gitCommit) VALUES (?1,?2,?3,?4,?5,?6,?7);",
    )
    .run(
      value.id,
      value.workItemId,
      value.repositoryPath,
      value.role,
      value.authorityLayer,
      value.sha256,
      value.gitCommit,
    );
};

const parseArtifactDependencyEdge = (
  value: unknown,
): readonly [ArtifactRefId, ArtifactRefId] => {
  const row = recordRow(value);
  return [
    ArtifactRefIdSchema.parse(row.artifactRefId),
    ArtifactRefIdSchema.parse(row.dependsOnArtifactRefId),
  ];
};

export const loadArtifactDependencyEdges = (
  database: Database,
): readonly (readonly [ArtifactRefId, ArtifactRefId])[] =>
  database
    .query("SELECT artifactRefId, dependsOnArtifactRefId FROM artifactDependencies;")
    .all()
    .map(parseArtifactDependencyEdge);

export const loadArtifactDependencyEdgesForOwners = (
  database: Database,
  ownerIds: readonly ArtifactRefId[],
): readonly (readonly [ArtifactRefId, ArtifactRefId])[] => {
  if (ownerIds.length === 0) return [];
  const canonicalIds = ownerIds.map((id) => ArtifactRefIdSchema.parse(id));
  return database
    .query(
      "SELECT artifactRefId, dependsOnArtifactRefId FROM artifactDependencies WHERE artifactRefId IN (" +
      canonicalIds.map(() => "?").join(",") +
      ");",
    )
    .all(...canonicalIds)
    .map(parseArtifactDependencyEdge);
};

export const storeArtifactDependency = (
  database: Database,
  artifactRefId: ArtifactRefId,
  dependsOnArtifactRefId: ArtifactRefId,
): void => {
  database
    .query(
      "INSERT OR IGNORE INTO artifactDependencies(artifactRefId, dependsOnArtifactRefId) VALUES (?1,?2);",
    )
    .run(
      ArtifactRefIdSchema.parse(artifactRefId),
      ArtifactRefIdSchema.parse(dependsOnArtifactRefId),
    );
};

export const nextRunAttempt = (
  database: Database,
  workItemId: WorkItemId,
  stage: WorkStage,
  executionTaskId: ExecutionTaskId | null,
): number => {
  const value = executionTaskId === null
    ? queryIntegerScalar(
        database,
        "SELECT coalesce(max(attempt), 0) AS value FROM runs WHERE workItemId=?1 AND stage=?2 AND executionTaskId IS NULL;",
        "value",
        WorkItemIdSchema.parse(workItemId),
        stage,
      )
    : queryIntegerScalar(
        database,
        "SELECT coalesce(max(attempt), 0) AS value FROM runs WHERE executionTaskId=?1;",
        "value",
        ExecutionTaskIdSchema.parse(executionTaskId),
      );
  return value + 1;
};

const insertWorkItemRows = (
  database: Database,
  value: WorkItem,
): void => {
  database
    .query(
      "INSERT INTO workItems(id, projectId, repositoryRoot, title, origin, stage, status, outcome, concernIdsJson, archived, createdAt) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11);",
    )
    .run(
      value.id,
      value.projectId,
      value.repositoryRoot,
      value.title,
      value.origin,
      value.stage,
      value.status,
      value.outcome,
      canonicalJson(value.concernIds),
      value.archived ? 1 : 0,
      value.createdAt,
    );
  database
    .query(
      "INSERT INTO workItemSources(workItemId, schemaId, sourcePath, sourceSha256, derivedFromWorkItemId) VALUES (?1,?2,?3,?4,?5);",
    )
    .run(
      value.id,
      value.schemaId,
      value.sourcePath,
      value.sourceSha256,
      value.derivedFromWorkItemId,
    );
};

export const storeWorkItem = (
  database: Database,
  workItem: WorkItem,
): void => {
  const value = WorkItemSchema.parse(workItem);
  database.transaction(() => insertWorkItemRows(database, value))();
};

export const updateWorkItemSourceProjection = (
  database: Database,
  workItem: WorkItem,
): void => {
  const value = WorkItemSchema.parse(workItem);
  database.transaction(() => {
    database.query(
      "UPDATE workItems SET projectId=?2, repositoryRoot=?3, title=?4, origin=?5, stage=?6, status=?7, outcome=?8, concernIdsJson=?9, archived=?10 WHERE id=?1;",
    ).run(
      value.id,
      value.projectId,
      value.repositoryRoot,
      value.title,
      value.origin,
      value.stage,
      value.status,
      value.outcome,
      canonicalJson(value.concernIds),
      value.archived ? 1 : 0,
    );
    database.query(
      "UPDATE workItemSources SET schemaId=?2, sourcePath=?3, sourceSha256=?4, derivedFromWorkItemId=?5 WHERE workItemId=?1;",
    ).run(
      value.id,
      value.schemaId,
      value.sourcePath,
      value.sourceSha256,
      value.derivedFromWorkItemId,
    );
  })();
};

export const updateWorkItemArchivedProjection = (
  database: Database,
  workItemId: WorkItemId,
  archived: boolean,
): WorkItem => {
  database.query("UPDATE workItems SET archived=?2 WHERE id=?1;")
    .run(WorkItemIdSchema.parse(workItemId), archived ? 1 : 0);
  return loadWorkItem(database, workItemId);
};

export const loadWorkItemSourceProjection = (
  database: Database,
  workItemId: WorkItemId,
): Readonly<{
  schemaId: WorkItemSchemaId;
  sourcePath: WorkItemSourcePath;
  sourceSha256: Sha256;
  derivedFromWorkItemId: WorkItemId | null;
}> => {
  const row = database.query(
    "SELECT schemaId, sourcePath, sourceSha256, derivedFromWorkItemId FROM workItemSources WHERE workItemId=?1;",
  ).get(WorkItemIdSchema.parse(workItemId));
  if (row === null) throw new TypeError("WorkItem source projection does not exist");
  const value = recordRow(row);
  return {
    schemaId: WorkItemSchemaIdSchema.parse(value.schemaId),
    sourcePath: WorkItemSourcePathSchema.parse(value.sourcePath),
    sourceSha256: Sha256Schema.parse(value.sourceSha256),
    derivedFromWorkItemId: value.derivedFromWorkItemId === null
      ? null
      : WorkItemIdSchema.parse(value.derivedFromWorkItemId),
  };
};

export const updateWorkItemLifecycle = (
  database: Database,
  workItemId: WorkItemId,
  state: Readonly<Pick<WorkItem, "stage" | "status" | "outcome">>,
): void => {
  database
    .query("UPDATE workItems SET stage=?2, status=?3, outcome=?4 WHERE id=?1;")
    .run(
      WorkItemIdSchema.parse(workItemId),
      state.stage,
      state.status,
      state.outcome,
    );
};

export const setWorkItemStatus = (
  database: Database,
  workItemId: WorkItemId,
  status: WorkItem["status"],
): void => {
  database
    .query("UPDATE workItems SET status=?2 WHERE id=?1;")
    .run(WorkItemIdSchema.parse(workItemId), status);
};

export const promoteIdeaToR1 = (
  database: Database,
  workItemId: WorkItemId,
): void => {
  database
    .query("UPDATE workItems SET stage='R1' WHERE id=?1 AND stage='IDEA';")
    .run(WorkItemIdSchema.parse(workItemId));
};

export const storeApproval = (
  database: Database,
  approval: Approval,
): void => {
  const value = ApprovalSchema.parse(approval);
  database
    .query(
      "INSERT INTO approvals(id, workItemId, baselineCommit, packageHash, planArtifactRefId, r3ArtifactRefId, sourceSha256, approvedBy, approvedAt) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9);",
    )
    .run(
      value.id,
      value.workItemId,
      value.baselineCommit,
      value.packageHash,
      value.planArtifactRefId,
      value.r3ArtifactRefId,
      value.sourceSha256,
      value.approvedBy,
      value.approvedAt,
    );
};

export const storeExecutionTask = (
  database: Database,
  task: ExecutionTask,
): void => {
  const value = ExecutionTaskSchema.parse(task);
  database
    .query(
      "INSERT INTO executionTasks(id, approvalId, planTaskId, state) VALUES (?1,?2,?3,?4);",
    )
    .run(value.id, value.approvalId, value.planTaskId, value.state);
};

export const setExecutionTaskState = (
  database: Database,
  executionTaskId: ExecutionTaskId,
  state: ExecutionTaskState,
): void => {
  database
    .query("UPDATE executionTasks SET state=?2 WHERE id=?1;")
    .run(
      ExecutionTaskIdSchema.parse(executionTaskId),
      ExecutionTaskStateSchema.parse(state),
    );
};

export const blockExecutionTasksForApproval = (
  database: Database,
  approvalId: ApprovalId,
): void => {
  database
    .query(
      "UPDATE executionTasks SET state='BLOCKED' WHERE approvalId=?1 AND state NOT IN ('CANDIDATE_DONE','ALREADY_SATISFIED');",
    )
    .run(ApprovalIdSchema.parse(approvalId));
};

export const loadRunningExecutionTaskLinks = (
  database: Database,
): readonly (readonly [ExecutionTaskId, ApprovalId, WorkItemId])[] =>
  database
    .query(
      `SELECT et.id AS taskId, et.approvalId AS approvalId, a.workItemId AS workItemId
       FROM executionTasks et
       JOIN approvals a ON a.id=et.approvalId
       WHERE et.state='RUNNING'
       ORDER BY a.approvedAt, et.planTaskId, et.id;`,
    )
    .all()
    .map((value) => {
      const row = recordRow(value);
      return [
        ExecutionTaskIdSchema.parse(row.taskId),
        ApprovalIdSchema.parse(row.approvalId),
        WorkItemIdSchema.parse(row.workItemId),
      ] as const;
    });

export const countRunningExecutionTasks = (
  database: Database,
): number =>
  queryIntegerScalar(
    database,
    "SELECT count(*) AS value FROM executionTasks WHERE state='RUNNING';",
    "value",
  );

export const reconstructExecutionTask = (
  database: Database,
  executionTaskId: ExecutionTaskId,
  signedPlanBytes: Uint8Array,
): ExecutionTask => {
  const taskValue = database
    .query(
      "SELECT id, approvalId, planTaskId, state FROM executionTasks WHERE id = ?1;",
    )
    .get(ExecutionTaskIdSchema.parse(executionTaskId));
  if (taskValue === null) throw new TypeError("execution task does not exist");
  const taskRow = recordRow(taskValue);
  const taskId = ExecutionTaskIdSchema.parse(taskRow.id);
  const approvalId = ApprovalIdSchema.parse(taskRow.approvalId);
  if (typeof taskRow.planTaskId !== "string") {
    throw new TypeError("persisted execution task planTaskId must be text");
  }
  const planTaskId = taskRow.planTaskId;
  const state = ExecutionTaskStateSchema.parse(taskRow.state);

  const approval = loadApproval(database, approvalId);
  const planArtifact = loadArtifact(database, approval.planArtifactRefId);

  if (
    planArtifact.role !== "PLAN" ||
    planArtifact.workItemId !== approval.workItemId ||
    planArtifact.gitCommit !== approval.baselineCommit
  ) {
    throw new TypeError("Approval PLAN ArtifactRef is not valid at the approval baseline");
  }
  if (sha256(signedPlanBytes) !== planArtifact.sha256) {
    throw new TypeError("signed PLAN bytes do not match Approval.planArtifactRefId");
  }

  const block = parseSignedTaskBlockFromPlan(signedPlanBytes);
  const definition = block.tasks.find((task) => task.id === planTaskId);
  if (!definition) {
    throw new TypeError("execution task planTaskId is absent from the signed PLAN");
  }

  const idByPlanTaskId = new Map<string, ExecutionTaskId>();
  for (const value of database
    .query("SELECT id, planTaskId FROM executionTasks WHERE approvalId = ?1;")
    .all(approval.id)) {
    const row = recordRow(value);
    if (typeof row.planTaskId !== "string") {
      throw new TypeError("persisted execution task planTaskId must be text");
    }
    idByPlanTaskId.set(
      row.planTaskId,
      ExecutionTaskIdSchema.parse(row.id),
    );
  }

  return ExecutionTaskSchema.parse({
    id: taskId,
    approvalId,
    planTaskId,
    objective: definition.objective,
    dependsOn: definition.dependsOn.map((dependency) => {
      const id = idByPlanTaskId.get(dependency);
      if (!id) throw new TypeError(`missing materialized dependency task ${dependency}`);
      return id;
    }),
    scope: definition.scope,
    exclusions: definition.exclusions,
    acceptanceRefs: definition.acceptanceRefs,
    changeSurface: definition.changeSurface,
    gateIds: definition.gateIds,
    authorityRefs: definition.authorityRefs,
    concernIds: definition.concernIds,
    state,
  });
};
