import { Database } from "bun:sqlite";
import { existsSync, renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";

import {
  ApprovalIdSchema,
  ApprovalSchema,
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
  type Sha256,
  type WorkItem,
  type WorkItemId,
  type WorkItemSchemaId,
  type WorkItemSourcePath,
  type WorkStage,
} from "../core/contracts.ts";
import { canonicalJson } from "../core/canonical.ts";
import { parseSignedTaskBlockFromPlan } from "../core/execution.ts";
import { ensureSupportedStateRoot, sha256, statePaths } from "./runtime.ts";

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
  sourcePath TEXT NOT NULL UNIQUE,
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

const initializeSchema = (database: Database): void => {
  const version = userVersion(database);
  if (version === 2) return;
  if (version !== 0) {
    throw new TypeError(`unsupported Order SQLite schema version: ${version}`);
  }

  database.transaction(() => {
    database.exec(schemaSql);
    database.exec("PRAGMA user_version = 2;");
  })();

  if (userVersion(database) !== 2) {
    throw new TypeError("Order SQLite schema initialization did not set user_version=2");
  }
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

export type LegacyDatabaseArchive = Readonly<{
  stateRoot: string;
  suffix: string;
  archiveDatabase: string;
}>;

const orderDatabaseFiles = (path: string): readonly string[] =>
  [path, `${path}-wal`, `${path}-shm`];

export const readLegacyWorkItemRepositoryRootsForInstall = (
  stateRoot: string,
): readonly string[] => {
  const path = statePaths(stateRoot).database;
  if (!existsSync(path)) return [];

  const database = new Database(path, {
    readonly: true,
    create: false,
    strict: true,
  });
  try {
    const version = userVersion(database);
    if (version === 2) return [];
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
  } finally {
    database.close();
  }
};

export const prepareOrderDatabaseForInstall = (
  stateRoot: string,
): LegacyDatabaseArchive | null => {
  const path = statePaths(stateRoot).database;
  if (!existsSync(path)) return null;

  const database = new Database(path, {
    readonly: true,
    create: false,
    strict: true,
  });
  let version: number;
  try {
    version = userVersion(database);
  } finally {
    database.close();
  }

  if (version === 2) return null;
  if (version !== 1) {
    throw new TypeError(`unsupported Order SQLite schema version during update: ${version}`);
  }

  const suffix = `.legacy-v1.${crypto.randomUUID()}`;
  const moved: string[] = [];
  try {
    for (const candidate of orderDatabaseFiles(path)) {
      if (!existsSync(candidate)) continue;
      renameSync(candidate, candidate + suffix);
      moved.push(candidate);
    }
  } catch (error) {
    for (const candidate of moved.reverse()) {
      const archived = candidate + suffix;
      if (existsSync(archived)) renameSync(archived, candidate);
    }
    throw error;
  }

  return { stateRoot, suffix, archiveDatabase: path + suffix };
};

export const restoreOrderDatabaseAfterFailedInstall = (
  archive: LegacyDatabaseArchive,
): void => {
  const path = statePaths(archive.stateRoot).database;
  for (const candidate of orderDatabaseFiles(path)) {
    if (existsSync(candidate)) unlinkSync(candidate);
  }
  for (const candidate of orderDatabaseFiles(path)) {
    const archived = candidate + archive.suffix;
    if (existsSync(archived)) renameSync(archived, candidate);
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
          w.stage, w.status, w.outcome, w.concernIdsJson, w.createdAt
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
  const { concernIdsJson, ...fields } = row;
  return WorkItemSchema.parse({
    ...fields,
    concernIds: persistedJson(concernIdsJson),
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

export const loadWorkItems = (
  database: Database,
): readonly WorkItem[] =>
  database.query(`${workItemSelect} ORDER BY createdAt, id;`).all().map(parseWorkItemRow);

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
      "INSERT INTO workItems(id, projectId, repositoryRoot, title, origin, stage, status, outcome, concernIdsJson, createdAt) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10);",
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
      "UPDATE workItems SET projectId=?2, repositoryRoot=?3, title=?4, origin=?5, stage=?6, status=?7, outcome=?8, concernIdsJson=?9 WHERE id=?1;",
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
