import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporary: string[] = [];
const tempDir = (): string => {
  const path = mkdtempSync(join(tmpdir(), "order-sqlite-"));
  temporary.push(path);
  return path;
};
afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

const bun = (code: string, allowFailure = false) => {
  const result = spawnSync("bun", ["--eval", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env },
  });
  if (!allowFailure && result.status !== 0) {
    throw new Error(result.stderr);
  }
  return result;
};

describe("SQLite shell", () => {
  it("creates and reopens exact schema version 3 with required effective PRAGMAs", () => {
    const root = tempDir();
    const result = bun(`
      const s = await import("./src/shell/sqlite.ts");
      const db = s.openOrderDatabase(${JSON.stringify(root)});
      const first = {
        version: db.query("PRAGMA user_version").get().user_version,
        journal: db.query("PRAGMA journal_mode").get().journal_mode,
        synchronous: db.query("PRAGMA synchronous").get().synchronous,
        foreignKeys: db.query("PRAGMA foreign_keys").get().foreign_keys,
        busy: db.query("PRAGMA busy_timeout").get().timeout,
        tables: db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(x => x.name),
        workItemColumns: db.query("PRAGMA table_info(workItems)").all().map(x => x.name),
      };
      db.close();
      const reopened = s.openOrderDatabase(${JSON.stringify(root)});
      const reopenedVersion = reopened.query("PRAGMA user_version").get().user_version;
      reopened.close();
      console.log(JSON.stringify({ first, reopenedVersion }));
    `);
    const parsed = JSON.parse(result.stdout.trim());
    expect(parsed.first.version).toBe(3);
    expect(String(parsed.first.journal).toLowerCase()).toBe("wal");
    expect(parsed.first.synchronous).toBe(2);
    expect(parsed.first.foreignKeys).toBe(1);
    expect(parsed.first.busy).toBe(5000);
    expect(parsed.first.tables).toEqual([
      "approvals",
      "artifactDependencies",
      "artifactRefs",
      "executionTasks",
      "runEvents",
      "runs",
      "workItemSources",
      "workItems",
    ]);
    expect(parsed.reopenedVersion).toBe(3);
    expect(parsed.first.workItemColumns).toContain("archived");
  });

  it("reads distinct v1 WorkItem repository roots as installer migration evidence", () => {
    const root = tempDir();
    const result = bun(`
      const { Database } = await import("bun:sqlite");
      const r = await import("./src/shell/runtime.ts");
      const s = await import("./src/shell/sqlite.ts");
      const path = r.statePaths(${JSON.stringify(root)}).database;
      const legacy = new Database(path, { create: true, strict: true });
      legacy.exec("CREATE TABLE workItems(repositoryRoot TEXT NOT NULL) STRICT;");
      legacy.query("INSERT INTO workItems(repositoryRoot) VALUES (?1), (?2), (?1);")
        .run("/workspace/a", "/workspace/b");
      legacy.exec("PRAGMA user_version = 1;");
      legacy.close();

      const roots = s.readLegacyWorkItemRepositoryRootsForInstall(
        ${JSON.stringify(root)},
      );
      const reopened = new Database(path, { readonly: true, create: false, strict: true });
      const version = reopened.query("PRAGMA user_version").get().user_version;
      reopened.close();
      console.log(JSON.stringify({ roots, version }));
    `);
    expect(JSON.parse(result.stdout.trim())).toEqual({
      roots: ["/workspace/a", "/workspace/b"],
      version: 1,
    });
  });

  it("archives legacy v1 state for installer update and restores it on rollback", () => {
    const root = tempDir();
    const result = bun(`
      const { Database } = await import("bun:sqlite");
      const r = await import("./src/shell/runtime.ts");
      const s = await import("./src/shell/sqlite.ts");
      const path = r.statePaths(${JSON.stringify(root)}).database;
      const legacy = new Database(path, { create: true, strict: true });
      legacy.exec("CREATE TABLE sentinel(value TEXT NOT NULL) STRICT;");
      legacy.exec("INSERT INTO sentinel(value) VALUES ('legacy');");
      legacy.exec("PRAGMA user_version = 1;");
      legacy.close();

      const archive = s.prepareOrderDatabaseForInstall(${JSON.stringify(root)});
      if (archive === null) throw new Error("expected legacy archive");
      const current = s.openOrderDatabase(${JSON.stringify(root)});
      const currentVersion = current.query("PRAGMA user_version").get().user_version;
      current.close();

      s.restoreOrderDatabaseAfterFailedInstall(archive);
      const restored = new Database(path, { readonly: true, create: false, strict: true });
      const restoredVersion = restored.query("PRAGMA user_version").get().user_version;
      const sentinel = restored.query("SELECT value FROM sentinel").get().value;
      restored.close();
      console.log(JSON.stringify({
        archiveDatabase: archive.archiveDatabase,
        currentVersion,
        restoredVersion,
        sentinel,
      }));
    `);
    const parsed = JSON.parse(result.stdout.trim());
    expect(parsed.archiveDatabase).toContain(".legacy-v1.");
    expect(parsed.currentVersion).toBe(3);
    expect(parsed.restoredVersion).toBe(1);
    expect(parsed.sentinel).toBe("legacy");
  });

  it("migrates v2 source paths and lifecycle state in place while preserving runtime history", () => {
    const root = tempDir();
    const result = bun(`
      const s = await import("./src/shell/sqlite.ts");
      const db = s.openOrderDatabase(${JSON.stringify(root)});
      const work = "work_11111111-1111-4111-8111-111111111111";
      const run = "run_11111111-1111-4111-8111-111111111111";
      db.exec("ALTER TABLE workItems DROP COLUMN archived; PRAGMA user_version = 2;");
      db.query("INSERT INTO workItems VALUES (?1,'fixture','/repo','title','origin','PLAN','ACTIVE',NULL,'[]','2026-11-11T03:30:00.000Z')").run(work);
      db.query("INSERT INTO workItemSources VALUES (?1,'change-v1','legacy.md',?2,NULL)")
        .run(work, "sha256:" + "a".repeat(64));
      db.query("INSERT INTO runs VALUES (?1,?2,NULL,'PLAN','INTERACTIVE','STAGE',NULL,'COMPLETED',1,?3,?4,NULL,NULL,'2026-11-11T03:30:00.000Z','2026-11-11T03:31:00.000Z')")
        .run(run, work, "b".repeat(40), "sha256:" + "c".repeat(64));
      db.close();

      const archive = s.prepareOrderDatabaseForInstall(${JSON.stringify(root)});
      if (archive === null) throw new Error("expected v2 rollback archive");
      const paths = new Map([[work, "docs/order/work-items/" + work + "/work-request.md"]]);
      s.migrateOrderDatabaseV2ToV3(
        ${JSON.stringify(root)},
        paths,
        new Map([[work, true]]),
      );
      const migrated = s.openOrderDatabase(${JSON.stringify(root)});
      const version = migrated.query("PRAGMA user_version").get().user_version;
      const sourcePath = migrated.query("SELECT sourcePath FROM workItemSources WHERE workItemId=?1").get(work).sourcePath;
      const lifecycle = migrated.query("SELECT stage,status,outcome,archived FROM workItems WHERE id=?1").get(work);
      const runCount = migrated.query("SELECT count(*) AS value FROM runs WHERE id=?1").get(run).value;
      migrated.close();
      console.log(JSON.stringify({ version, sourcePath, lifecycle, runCount, archive: archive.archiveDatabase }));
    `);
    const parsed = JSON.parse(result.stdout.trim());
    expect(parsed.version).toBe(3);
    expect(parsed.sourcePath).toBe(
      "docs/order/work-items/work_11111111-1111-4111-8111-111111111111/work-request.md",
    );
    expect(parsed.lifecycle).toEqual({ stage: "R1", status: "ACTIVE", outcome: null, archived: 1 });
    expect(parsed.runCount).toBe(1);
    expect(parsed.archive).toContain(".legacy-v2.");
  });

  it("refuses v2 migration preflight while post-signoff execution is active", () => {
    const root = tempDir();
    const result = bun(`
      const s = await import("./src/shell/sqlite.ts");
      const db = s.openOrderDatabase(${JSON.stringify(root)});
      const work = "work_11111111-1111-4111-8111-111111111111";
      db.exec("ALTER TABLE workItems DROP COLUMN archived; PRAGMA user_version = 2;");
      db.query("INSERT INTO workItems VALUES (?1,'fixture','/repo','title','origin','EXECUTION','ACTIVE',NULL,'[]',0,'2026-11-11T03:30:00.000Z')").run(work);
      db.query("INSERT INTO workItemSources VALUES (?1,'change-v1','legacy.md',?2,NULL)")
        .run(work, "sha256:" + "a".repeat(64));
      db.close();
      s.readOrderV2MigrationStateForInstall(${JSON.stringify(root)});
    `, true);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("prohibited while post-signoff execution is active");
  });

  it("rejects unsupported schema versions", () => {
    const root = tempDir();
    const result = bun(`
      const { Database } = await import("bun:sqlite");
      const r = await import("./src/shell/runtime.ts");
      const s = await import("./src/shell/sqlite.ts");
      const db = new Database(r.statePaths(${JSON.stringify(root)}).database, { create: true });
      db.exec("PRAGMA user_version = 1");
      db.close();
      s.openOrderDatabase(${JSON.stringify(root)});
    `, true);
    expect(result.status).not.toBe(0);
  });

  it("reconstructs ExecutionTask semantics from the signed PLAN instead of persistence copies", () => {
    const root = tempDir();
    const plan = `# plan

\`\`\`order-tasks
{"version":1,"tasks":[{"id":"T1","objective":"first","dependsOn":[],"scope":["src/a.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/a.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":["core"]},{"id":"T2","objective":"second","dependsOn":["T1"],"scope":["src/b.ts"],"exclusions":[],"acceptanceRefs":[],"changeSurface":["src/b.ts"],"gateIds":["test"],"authorityRefs":[],"concernIds":["core"]}]}
\`\`\`
`;
    const result = bun(`
      const s = await import("./src/shell/sqlite.ts");
      const r = await import("./src/shell/runtime.ts");
      const db = s.openOrderDatabase(${JSON.stringify(root)});
      const work = "work_11111111-1111-4111-8111-111111111111";
      const planId = "artifact_11111111-1111-4111-8111-111111111111";
      const r3Id = "artifact_22222222-2222-4222-8222-222222222222";
      const approval = "approval_11111111-1111-4111-8111-111111111111";
      const t1 = "task_11111111-1111-4111-8111-111111111111";
      const t2 = "task_22222222-2222-4222-8222-222222222222";
      const commit = "a".repeat(40);
      const planBytes = new TextEncoder().encode(${JSON.stringify(plan)});
      const planHash = r.sha256(planBytes);
      const sourceHash = "sha256:" + "d".repeat(64);
      db.query("INSERT INTO workItems VALUES (?1,'fixture','/repo','title','origin','EXECUTION','ACTIVE',NULL,'[]','2026-11-11T03:30:00.000Z')").run(work);
      db.query("INSERT INTO workItemSources VALUES (?1,'change-v1',?2,?3,NULL)").run(work, work + ".md", sourceHash);
      db.query("INSERT INTO artifactRefs VALUES (?1,?2,'docs/plan.md','PLAN','P7',?3,?4)").run(planId, work, planHash, commit);
      db.query("INSERT INTO artifactRefs VALUES (?1,?2,'docs/r3.md','R3',NULL,?3,?4)").run(r3Id, work, "sha256:" + "b".repeat(64), commit);
      db.query("INSERT INTO approvals VALUES (?1,?2,?3,?4,?5,?6,?7,'human','2026-11-11T03:31:00.000Z')").run(
        approval, work, commit, "sha256:" + "c".repeat(64), planId, r3Id, sourceHash
      );
      db.query("INSERT INTO executionTasks VALUES (?1,?2,'T1','CANDIDATE_DONE')").run(t1, approval);
      db.query("INSERT INTO executionTasks VALUES (?1,?2,'T2','TODO')").run(t2, approval);
      const reconstructed = s.reconstructExecutionTask(db, t2, planBytes);
      db.close();
      console.log(JSON.stringify(reconstructed));
    `);
    const task = JSON.parse(result.stdout.trim());
    expect(task.planTaskId).toBe("T2");
    expect(task.objective).toBe("second");
    expect(task.dependsOn).toEqual(["task_11111111-1111-4111-8111-111111111111"]);
    expect(task.state).toBe("TODO");
    expect(Object.keys(task).sort()).toEqual([
      "acceptanceRefs",
      "approvalId",
      "authorityRefs",
      "changeSurface",
      "concernIds",
      "dependsOn",
      "exclusions",
      "gateIds",
      "id",
      "objective",
      "planTaskId",
      "scope",
      "state",
    ]);
  });

  it("requires exactly one valid order-tasks block", () => {
    const result = bun(`
      const s = await import("./src/shell/sqlite.ts");
      const fence = String.fromCharCode(96).repeat(3);
      const text =
        fence + "order-tasks\\n{\\\"version\\\":1,\\\"tasks\\\":[]}\\n" + fence +
        "\\n" +
        fence + "order-tasks\\n{\\\"version\\\":1,\\\"tasks\\\":[]}\\n" + fence;
      s.parseSignedTaskBlockFromPlan(new TextEncoder().encode(text));
    `, true);
    expect(result.status).not.toBe(0);
  });

});
