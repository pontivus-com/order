import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildOrderConfig,
  readOrderConfig,
  writeOrderConfig,
} from "../src/shell/config.ts";
import {
  filesystemTypeIsSupported,
  loadOrCreateDaemonToken,
  newWorkItemId,
  resolveStateRoot,
  secureTokenHex,
  statePaths,
} from "../src/shell/runtime.ts";

const temporary: string[] = [];

const tempDir = (prefix: string): string => {
  const path = mkdtempSync(join(tmpdir(), prefix));
  temporary.push(path);
  return path;
};

afterEach(() => {
  for (const path of temporary.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const run = (
  argv: readonly string[],
  cwd: string,
  options: { readonly allowFailure?: boolean } = {},
) => {
  const result = spawnSync(argv[0]!, argv.slice(1), {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" },
  });
  if (!options.allowFailure && result.status !== 0) {
    throw new Error(`${argv.join(" ")} failed: ${result.stderr}`);
  }
  return result;
};

const bunEval = (code: string, cwd: string): string => {
  const result = run(["bun", "--eval", code], cwd);
  return result.stdout.trim();
};

const initGitRepo = (root: string): string => {
  run(["git", "init", "-q"], root);
  run(["git", "config", "user.name", "Order Test"], root);
  run(["git", "config", "user.email", "order@example.invalid"], root);
  writeFileSync(join(root, "AGENTS.md"), "# root\n");
  mkdirSync(join(root, "nested"));
  writeFileSync(join(root, "nested", "AGENTS.md"), "# nested\n");
  writeFileSync(join(root, "file.txt"), "baseline\n");
  run(["git", "add", "."], root);
  run(["git", "commit", "-qm", "baseline"], root);
  return run(["git", "rev-parse", "HEAD"], root).stdout.trim();
};

describe("runtime shell", () => {
  it("resolves state-root precedence exactly and rejects relative configured bases", () => {
    expect(resolveStateRoot({
      PONTIVUS_ORDER_STATE_ROOT: "/explicit",
      XDG_STATE_HOME: "/xdg",
      HOME: "/home/test",
    })).toBe("/explicit");
    expect(resolveStateRoot({ XDG_STATE_HOME: "/xdg", HOME: "/home/test" })).toBe("/xdg/pontivus-order");
    expect(resolveStateRoot({ HOME: "/home/test" })).toBe("/home/test/.local/state/pontivus-order");
    expect(() => resolveStateRoot({ PONTIVUS_ORDER_STATE_ROOT: "relative", HOME: "/home/test" })).toThrow();
    expect(() => resolveStateRoot({ XDG_STATE_HOME: "relative", HOME: "/home/test" })).toThrow();
    expect(() => resolveStateRoot({ HOME: "relative" })).toThrow();
    expect(() => resolveStateRoot({})).toThrow();
  });


  it("owns the exact supported filesystem allowlist", () => {
    expect(filesystemTypeIsSupported(0x0000ef53)).toBe(true);
    expect(filesystemTypeIsSupported(0x58465342)).toBe(true);
    expect(filesystemTypeIsSupported(0x9123683e)).toBe(true);
    expect(filesystemTypeIsSupported(0xf2f52010)).toBe(true);
    expect(filesystemTypeIsSupported(0x01021994)).toBe(false);
    expect(filesystemTypeIsSupported(0x794c7630)).toBe(false);
  });

  it("generates canonical UUID ids and 256-bit lowercase-hex tokens", () => {
    expect(newWorkItemId()).toMatch(/^work_[0-9a-f-]{36}$/);
    expect(secureTokenHex()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("creates, reuses, and fail-closes daemon-token files", () => {
    const root = tempDir("order-token-");
    const token = loadOrCreateDaemonToken(root);
    const path = statePaths(root).daemonToken;
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(readFileSync(path, "utf8")).toBe(token);
    expect(loadOrCreateDaemonToken(root)).toBe(token);

    chmodSync(path, 0o644);
    expect(() => loadOrCreateDaemonToken(root)).toThrow();
  });

  it("rejects a symlinked daemon-token rather than replacing it", () => {
    const root = tempDir("order-token-link-");
    const outside = join(root, "outside");
    writeFileSync(outside, "a".repeat(64));
    symlinkSync(outside, statePaths(root).daemonToken);
    expect(() => loadOrCreateDaemonToken(root)).toThrow();
  });

  it("persists canonical owner-only productive configuration", () => {
    const state = tempDir("order-config-");
    const repositories = tempDir("order-repositories-");
    const reference = tempDir("order-reference-");
    const config = buildOrderConfig(
      { providerID: "opencode", id: "glm-5.3-flash-free" },
      [repositories, repositories],
      [reference],
    );
    expect(writeOrderConfig(state, config)).toEqual(config);
    expect(readOrderConfig(state)).toEqual(config);
    expect(statSync(statePaths(state).config).mode & 0o777).toBe(0o600);

    chmodSync(statePaths(state).config, 0o644);
    expect(() => readOrderConfig(state)).toThrow();
  });

  it("rejects overlapping target, reference and state roots", () => {
    const target = tempDir("order-target-disjoint-");
    const reference = tempDir("order-reference-disjoint-");

    expect(() => buildOrderConfig(
      { providerID: "opencode", id: "glm-5.3-flash-free" },
      [target],
      [target],
    )).toThrow(/path-disjoint/);

    const nestedReference = join(target, "reference");
    mkdirSync(nestedReference);
    expect(() => buildOrderConfig(
      { providerID: "opencode", id: "glm-5.3-flash-free" },
      [target],
      [nestedReference],
    )).toThrow(/path-disjoint/);

    const stateInsideTarget = join(target, "state");
    mkdirSync(stateInsideTarget);
    const config = buildOrderConfig(
      { providerID: "opencode", id: "glm-5.3-flash-free" },
      [target],
      [reference],
    );
    expect(() => writeOrderConfig(stateInsideTarget, config)).toThrow(/path-disjoint/);
  });
});

describe("project manifest shell", () => {
  it("provisions a minimal beta-update manifest from exact repository facts", () => {
    const root = tempDir("order-project-bootstrap-");
    writeFileSync(join(root, "AGENTS.md"), "# repository authority\n");
    spawnSync("git", ["init", "-q"], { cwd: root });
    spawnSync("git", ["config", "user.name", "Order Test"], { cwd: root });
    spawnSync("git", ["config", "user.email", "order@example.invalid"], { cwd: root });
    spawnSync("git", ["add", "AGENTS.md"], { cwd: root });
    spawnSync("git", ["commit", "-qm", "fixture"], { cwd: root });

    const output = bunEval(`
      const p = await import("./src/shell/project.ts");
      const first = await p.prepareProjectRootForInstall(${JSON.stringify(root)});
      const manifest = await p.loadValidatedProjectManifest(${JSON.stringify(root)});
      const second = await p.prepareProjectRootForInstall(${JSON.stringify(root)});
      console.log(JSON.stringify({ first, manifest, second }));
    `, process.cwd());
    const parsed = JSON.parse(output);
    expect(parsed.first[0]).toBe(root);
    expect(parsed.first[1]).toBe(join(root, "pontivus-order.toml"));
    expect(parsed.manifest.projectId).toBe(basename(root).toLowerCase());
    expect(parsed.manifest.authority).toEqual({
      p1: ["AGENTS.md"],
      p2: [],
      p3: [],
      p4: [],
      p5: [],
      p6: [],
    });
    expect(parsed.manifest.refs).toEqual({});
    expect(parsed.manifest.concerns).toEqual({});
    expect(parsed.manifest.verification).toEqual({});
    expect(parsed.manifest.workItems).toEqual({ root: "docs/order/work-items" });
    expect(parsed.second).toEqual([root, null]);
  });

  it("parses TOML, expands authority deterministically, resolves exact refs and concerns", () => {
    const root = tempDir("order-project-");
    mkdirSync(join(root, "docs"));
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "AGENTS.md"), "# authority\n");
    writeFileSync(join(root, "docs", "requirements.md"), "# requirements\n");
    writeFileSync(join(root, "docs", "contracts.md"), "# contracts\n");
    writeFileSync(join(root, "src", "x.ts"), "export {};\n");
    writeFileSync(join(root, "pontivus-order.toml"), `version = 1
projectId = "fixture"

[authority]
p1 = ["AGENTS.md"]
p2 = []
p3 = ["docs/requirements.md"]
p4 = []
p5 = []
p6 = ["docs/contracts.md"]

[refs]
FR-1 = "docs/requirements.md"

[governance.fitness]
GW-P1-FCIS = ["architecture"]

[concerns.core]
authority = ["docs/contracts.md"]
paths = ["src/**"]
gates = ["test"]

[verification.architecture]
argv = ["node", "architecture.js"]
cwd = "."
timeoutSeconds = 30
inheritEnv = ["PATH"]
materialRefs = []

[verification.test]
argv = ["node", "test.js"]
cwd = "."
timeoutSeconds = 30
inheritEnv = ["PATH"]
materialRefs = []
`);

    const output = bunEval(`
      const p = await import("./src/shell/project.ts");
      const m = await p.loadValidatedProjectManifest(${JSON.stringify(root)});
      const authority = await p.resolveAuthoritySources(${JSON.stringify(root)}, m);
      console.log(JSON.stringify({
        ref: p.resolveAuthorityRef(m, "FR-1"),
        p1: authority.p1,
        concerns: p.resolveSurfaceConcernIds(m, ["src/x.ts"]),
        gates: p.resolveConcernGateIds(m, ["core"]),
        governanceGates: p.resolveGovernanceGateIds(m),
        matches: p.repositoryPatternMatches("src/**", "src/x.ts"),
      }));
    `, process.cwd());
    expect(JSON.parse(output)).toEqual({
      ref: "docs/requirements.md",
      p1: ["AGENTS.md"],
      concerns: ["core"],
      gates: ["test"],
      governanceGates: ["architecture"],
      matches: true,
    });
  });

  it("rejects unresolved manifest refs instead of searching filenames", () => {
    const root = tempDir("order-project-invalid-");
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "AGENTS.md"), "# authority\n");
    writeFileSync(join(root, "docs", "other.md"), "# other\n");
    writeFileSync(join(root, "pontivus-order.toml"), `version = 1
projectId = "fixture"

[authority]
p1 = ["AGENTS.md"]
p2 = []
p3 = []
p4 = []
p5 = []
p6 = []

[refs]
FR-1 = "docs/other.md"
`);
    const result = run([
      "bun",
      "--eval",
      `const p=await import("./src/shell/project.ts"); await p.loadValidatedProjectManifest(${JSON.stringify(root)});`,
    ], process.cwd(), { allowFailure: true });
    expect(result.status).not.toBe(0);
  });
});

describe("repository shell", () => {
  it("proves root/baseline, reads committed bytes, captures and exactly replays candidate state", () => {
    const root = tempDir("order-git-");
    const baseline = initGitRepo(root);
    const workspace = join(tempDir("order-workspaces-"), "run-a");
    const replay = join(tempDir("order-replay-"), "run-b");

    const first = bunEval(`
      const r = await import("./src/shell/repository.ts");
      const root = ${JSON.stringify(root)};
      const workspace = ${JSON.stringify(workspace)};
      const baseline = ${JSON.stringify(baseline)};
      await r.proveRepositoryRoot(root);
      const bytes = await r.readCommittedFile(root, baseline, "file.txt");
      await r.createFreshCheckout(root, workspace, baseline);
      await Bun.write(workspace + "/file.txt", "changed\\n");
      await Bun.write(workspace + "/new.txt", "new\\n");
      const agents = await r.enumerateAgentInstructions(workspace);
      const capture = await r.captureCandidate(workspace);
      await r.replayAndVerifyCandidate(root, ${JSON.stringify(replay)}, baseline, capture);
      console.log(JSON.stringify({
        text: new TextDecoder().decode(bytes),
        agents,
        changedPaths: capture.changedPaths,
        patchSha256: capture.patchSha256,
      }));
    `, process.cwd());
    const parsed = JSON.parse(first);
    expect(parsed.text).toBe("baseline\n");
    expect(parsed.agents).toEqual(["AGENTS.md", "nested/AGENTS.md"]);
    expect(parsed.changedPaths).toEqual(["file.txt", "new.txt"]);
    expect(parsed.patchSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("reports and commits only exact governed documentation paths while preserving unrelated index state", () => {
    const root = tempDir("order-doc-git-");
    initGitRepo(root);
    mkdirSync(join(root, "docs"), { recursive: true });
    writeFileSync(join(root, "docs", "tracked.md"), "tracked before\n");
    run(["git", "add", "docs/tracked.md"], root);
    run(["git", "commit", "-qm", "documentation baseline"], root);

    writeFileSync(join(root, "docs", "tracked.md"), "tracked after\n");
    writeFileSync(join(root, "docs", "new.md"), "new document\n");
    writeFileSync(join(root, "file.txt"), "unrelated staged\n");
    run(["git", "add", "file.txt"], root);

    const first = JSON.parse(bunEval(`
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/shell/runtime.ts");
      const root = ${JSON.stringify(root)};
      const status = await repo.inspectDocumentationGit(
        root,
        ["docs/tracked.md", "docs/new.md"],
      );
      const expected = status.paths
        .filter((path) => path.state === "MODIFIED" || path.state === "UNTRACKED")
        .map((path) => ({
          repositoryPath: path.repositoryPath,
          sha256: path.workingTreeSha256,
        }));
      const commit = await repo.commitDocumentationPaths(
        root,
        status.headCommit,
        expected,
        "docs(order): save work_11111111-1111-4111-8111-111111111111 documentation",
      );
      const after = await repo.inspectDocumentationGit(
        root,
        ["docs/tracked.md", "docs/new.md"],
      );
      console.log(JSON.stringify({ status, commit, after }));
    `, process.cwd())) as {
      status: { paths: Array<{ repositoryPath: string; state: string }> };
      commit: string;
      after: { paths: Array<{ repositoryPath: string; state: string }> };
    };

    expect(first.status.paths).toEqual([
      expect.objectContaining({ repositoryPath: "docs/new.md", state: "UNTRACKED" }),
      expect.objectContaining({ repositoryPath: "docs/tracked.md", state: "MODIFIED" }),
    ]);
    expect(first.after.paths.map((path) => path.state)).toEqual([
      "MATCHES_HEAD",
      "MATCHES_HEAD",
    ]);
    expect(run(["git", "diff", "--cached", "--name-only"], root).stdout.trim()).toBe("file.txt");
    expect(run(["git", "show", "HEAD:file.txt"], root).stdout).toBe("baseline\n");

    rmSync(join(root, "docs", "tracked.md"));
    const deletion = JSON.parse(bunEval(`
      const repo = await import("./src/shell/repository.ts");
      const root = ${JSON.stringify(root)};
      const status = await repo.inspectDocumentationGit(root, ["docs/tracked.md"]);
      const commit = await repo.commitDocumentationPaths(
        root,
        status.headCommit,
        [{ repositoryPath: "docs/tracked.md", sha256: null }],
        "docs(order): save work_11111111-1111-4111-8111-111111111111 documentation",
      );
      const after = await repo.inspectDocumentationGit(root, ["docs/tracked.md"]);
      console.log(JSON.stringify({ status, commit, after }));
    `, process.cwd())) as {
      status: { paths: Array<{ state: string }> };
      after: { paths: Array<{ state: string }> };
    };
    expect(deletion.status.paths[0]?.state).toBe("DELETED");
    expect(deletion.after.paths[0]?.state).toBe("MISSING");
    expect(run(["git", "diff", "--cached", "--name-only"], root).stdout.trim()).toBe("file.txt");
  });

  it("fail-closes documentation Git persistence on missing local identity, detached HEAD, and active Git operations", () => {
    const prepare = (prefix: string): string => {
      const root = tempDir(prefix);
      initGitRepo(root);
      mkdirSync(join(root, "docs"), { recursive: true });
      writeFileSync(join(root, "docs", "tracked.md"), "before\n");
      run(["git", "add", "docs/tracked.md"], root);
      run(["git", "commit", "-qm", "documentation baseline"], root);
      writeFileSync(join(root, "docs", "tracked.md"), "after\n");
      return root;
    };

    const attemptCommit = (root: string): {
      readonly status: {
        readonly branch: string | null;
        readonly authorName: string | null;
        readonly authorEmail: string | null;
        readonly operationActive: boolean;
      };
      readonly error: string | null;
    } => JSON.parse(bunEval(`
      const repo = await import("./src/shell/repository.ts");
      const root = ${JSON.stringify(root)};
      const status = await repo.inspectDocumentationGit(root, ["docs/tracked.md"]);
      const path = status.paths[0];
      let error = null;
      try {
        await repo.commitDocumentationPaths(
          root,
          status.headCommit,
          [{ repositoryPath: path.repositoryPath, sha256: path.workingTreeSha256 }],
          "docs(order): adversarial persistence proof",
        );
      } catch (cause) {
        error = cause instanceof Error ? cause.message : String(cause);
      }
      console.log(JSON.stringify({ status, error }));
    `, process.cwd()));

    const identityRoot = prepare("order-doc-git-identity-");
    run(["git", "config", "--local", "--unset", "user.name"], identityRoot);
    run(["git", "config", "--local", "--unset", "user.email"], identityRoot);
    const missingIdentity = attemptCommit(identityRoot);
    expect(missingIdentity.status.authorName).toBeNull();
    expect(missingIdentity.status.authorEmail).toBeNull();
    expect(missingIdentity.error).toBe(
      "documentation commit requires repository-local Git identity",
    );

    const detachedRoot = prepare("order-doc-git-detached-");
    run(["git", "checkout", "--detach", "-q", "HEAD"], detachedRoot);
    const detached = attemptCommit(detachedRoot);
    expect(detached.status.branch).toBeNull();
    expect(detached.error).toBe(
      "documentation commit requires attached local branch",
    );

    const operationRoot = prepare("order-doc-git-operation-");
    writeFileSync(join(operationRoot, ".git", "MERGE_HEAD"), "0".repeat(40) + "\n");
    const operation = attemptCommit(operationRoot);
    expect(operation.status.operationActive).toBe(true);
    expect(operation.error).toBe(
      "documentation commit is blocked by active Git operation",
    );
  });

  it("adopts exactly one proposal target and rejects symlink targets", () => {
    const root = tempDir("order-adopt-");
    initGitRepo(root);
    writeFileSync(join(root, "proposal.md"), "hello\n");
    const diff = run(["git", "diff", "--no-index", "--binary", "--", "/dev/null", "proposal.md"], root, {
      allowFailure: true,
    }).stdout;
    rmSync(join(root, "proposal.md"));

    const output = bunEval(`
      const r = await import("./src/shell/repository.ts");
      const result = await r.adoptProposalPatch(
        ${JSON.stringify(root)},
        "proposal.md",
        null,
        ${JSON.stringify(diff)}
      );
      console.log(JSON.stringify({ result }));
    `, process.cwd());
    const adoptedHash = JSON.parse(output).result as string;
    expect(adoptedHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(readFileSync(join(root, "proposal.md"), "utf8")).toBe("hello\n");

    const reconciled = bunEval(`
      const r = await import("./src/shell/repository.ts");
      const result = await r.adoptProposalPatch(
        ${JSON.stringify(root)},
        "proposal.md",
        null,
        ${JSON.stringify(diff)},
        true
      );
      console.log(JSON.stringify({ result }));
    `, process.cwd());
    expect(JSON.parse(reconciled).result).toBe(adoptedHash);
    expect(readFileSync(join(root, "proposal.md"), "utf8")).toBe("hello\n");

    writeFileSync(join(root, "outside.md"), "outside\n");
    symlinkSync(join(root, "outside.md"), join(root, "link.md"));
    const result = run([
      "bun",
      "--eval",
      `const r=await import("./src/shell/repository.ts"); await r.adoptProposalPatch(${JSON.stringify(root)}, "link.md", null, "");`,
    ], process.cwd(), { allowFailure: true });
    expect(result.status).not.toBe(0);
  });
});


describe("guarded Markdown and WorkItem source shell", () => {
  it("preserves mode and makes a second write with the same old hash stale", () => {
    const root = tempDir("order-file-write-");
    const target = join(root, "document.md");
    writeFileSync(target, "before\n", { mode: 0o640 });

    const output = bunEval(`
      const w = await import("./src/shell/file-write.ts");
      const rt = await import("./src/shell/runtime.ts");
      const fs = await import("node:fs");
      const target = ${JSON.stringify(target)};
      const oldHash = rt.sha256(new TextEncoder().encode("before\\n"));
      const first = w.replaceRegularFileExpectedHash(
        target,
        oldHash,
        new TextEncoder().encode("after\\n"),
      );
      const second = w.replaceRegularFileExpectedHash(
        target,
        oldHash,
        new TextEncoder().encode("should-not-win\\n"),
      );
      console.log(JSON.stringify({
        first,
        second,
        text: fs.readFileSync(target, "utf8"),
        temporary: fs.readdirSync(${JSON.stringify(root)})
          .filter((name) => name.startsWith(".order-write-")),
      }));
    `, process.cwd());

    const parsed = JSON.parse(output) as {
      first: { tag: string; sha256: string };
      second: { tag: string; currentSha256: string };
      text: string;
      temporary: string[];
    };
    expect(parsed.first.tag).toBe("UPDATED");
    expect(parsed.second).toEqual({
      tag: "STALE",
      currentSha256: parsed.first.sha256,
    });
    expect(parsed.text).toBe("after\n");
    expect(parsed.temporary).toEqual([]);
    expect(statSync(target).mode & 0o777).toBe(0o640);
  });

  it("never overwrites an existing final path during exclusive creation", () => {
    const root = tempDir("order-file-create-exclusive-");
    const target = join(root, "existing.md");
    writeFileSync(target, "existing\n");

    const output = bunEval(`
      const w = await import("./src/shell/file-write.ts");
      const fs = await import("node:fs");
      let rejected = false;
      try {
        w.createRegularFileExclusive(
          ${JSON.stringify(target)},
          new TextEncoder().encode("replacement\\n"),
        );
      } catch {
        rejected = true;
      }
      console.log(JSON.stringify({
        rejected,
        text: fs.readFileSync(${JSON.stringify(target)}, "utf8"),
      }));
    `, process.cwd());

    expect(JSON.parse(output)).toEqual({
      rejected: true,
      text: "existing\n",
    });
  });

  it("refuses to normalize invalid current lifecycle Markdown during replacement", () => {
    const root = tempDir("order-invalid-markdown-");
    initGitRepo(root);
    const target = join(root, "invalid.md");
    writeFileSync(target, "line one\r\nline two\r\n");

    const output = bunEval(`
      const repo = await import("./src/shell/repository.ts");
      const rt = await import("./src/shell/runtime.ts");
      const fs = await import("node:fs");
      const before = new Uint8Array(fs.readFileSync(${JSON.stringify(target)}));
      let rejected = false;
      try {
        repo.replaceWorkingTreeMarkdown(
          ${JSON.stringify(root)},
          "invalid.md",
          rt.sha256(before),
          "replacement\\n",
        );
      } catch {
        rejected = true;
      }
      console.log(JSON.stringify({
        rejected,
        unchanged: Buffer.from(fs.readFileSync(${JSON.stringify(target)})).equals(Buffer.from(before)),
      }));
    `, process.cwd());

    expect(JSON.parse(output)).toEqual({
      rejected: true,
      unchanged: true,
    });
  });

  it("creates and scans only canonical Markdown sources while ignoring symlink and temp entries", () => {
    const root = tempDir("order-source-shell-");
    const outside = tempDir("order-source-outside-");
    writeFileSync(join(outside, "outside.md"), "not a WorkItem\n");
    symlinkSync(join(outside, "outside.md"), join(root, "linked.md"));
    writeFileSync(join(root, ".order-write-fixture.tmp"), "temporary\n");

    const output = bunEval(`
      const core = await import("./src/core/work-item-source.ts");
      const shell = await import("./src/shell/work-item-source.ts");
      const id = "work_11111111-1111-4111-8111-111111111111";
      const markdown = core.renderWorkItemSourceMarkdown({
        formatVersion: 1,
        id,
        projectId: "fixture",
        concernIds: ["core"],
        schemaId: "change-v1",
      }, "Portable source");
      const created = shell.createWorkItemSourceFile(
        ${JSON.stringify(root)},
        "docs/order/work-items",
        id,
        markdown,
      );
      const scanned = shell.scanWorkItemSources(
        ${JSON.stringify(root)},
        "fixture",
        "docs/order/work-items",
      );
      console.log(JSON.stringify({
        created,
        paths: scanned.sources.map((source) => source.path),
        diagnostics: scanned.diagnostics,
      }));
    `, process.cwd());

    const parsed = JSON.parse(output) as {
      created: { path: string; sha256: string };
      paths: string[];
      diagnostics: unknown[];
    };
    expect(parsed.created.path).toBe(
      "docs/order/work-items/work_11111111-1111-4111-8111-111111111111/work-request.md",
    );
    expect(parsed.created.sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(parsed.paths).toEqual([parsed.created.path]);
    expect(parsed.diagnostics).toEqual([]);
  });

  it("creates, reads and removes only the exact repository archive marker", () => {
    const root = tempDir("order-archive-marker-");
    const id = "work_11111111-1111-4111-8111-111111111111";
    mkdirSync(join(root, "docs", "order", "work-items", id), { recursive: true });

    const output = bunEval(
      'const shell = await import("./src/shell/work-item-source.ts");' +
      'const root = ' + JSON.stringify(root) + ';' +
      'const id = ' + JSON.stringify(id) + ';' +
      'const before = shell.readWorkItemArchived(root, "docs/order/work-items", id);' +
      'shell.setWorkItemArchivedFile(root, "docs/order/work-items", id, true);' +
      'const afterArchive = shell.readWorkItemArchived(root, "docs/order/work-items", id);' +
      'shell.setWorkItemArchivedFile(root, "docs/order/work-items", id, false);' +
      'const afterRestore = shell.readWorkItemArchived(root, "docs/order/work-items", id);' +
      'console.log(JSON.stringify({ before, afterArchive, afterRestore }));',
      process.cwd(),
    );

    expect(JSON.parse(output)).toEqual({
      before: false,
      afterArchive: true,
      afterRestore: false,
    });

    const marker = join(root, "docs", "order", "work-items", id, ".order-archived");
    writeFileSync(marker, "wrong\n");
    expect(() => bunEval(
      'const shell = await import("./src/shell/work-item-source.ts");' +
      'shell.readWorkItemArchived(' + JSON.stringify(root) + ', "docs/order/work-items", ' + JSON.stringify(id) + ');' +
      'console.log("never");',
      process.cwd(),
    )).toThrow();
  });

  it("classifies an unknown source schema with the canonical UNSUPPORTED_SCHEMA diagnostic", () => {
    const root = tempDir("order-source-unsupported-schema-");
    const id = "work_11111111-1111-4111-8111-111111111111";
    const sourceDir = join(root, "docs", "order", "work-items", id);
    mkdirSync(sourceDir, { recursive: true });
    writeFileSync(
      join(sourceDir, "work-request.md"),
      [
        "---",
        JSON.stringify({
          formatVersion: 1,
          id,
          projectId: "fixture",
          concernIds: [],
          schemaId: "future-v2",
        }, null, 2),
        "---",
        "# unsupported",
        "",
      ].join("\n"),
    );

    const output = bunEval(`
      const shell = await import("./src/shell/work-item-source.ts");
      const scanned = shell.scanWorkItemSources(
        ${JSON.stringify(root)},
        "fixture",
        "docs/order/work-items",
      );
      console.log(JSON.stringify({
        sources: scanned.sources.length,
        diagnostics: scanned.diagnostics,
      }));
    `, process.cwd());

    const parsed = JSON.parse(output) as {
      sources: number;
      diagnostics: { code: string; path: string | null }[];
    };
    expect(parsed.sources).toBe(0);
    expect(parsed.diagnostics).toEqual([
      expect.objectContaining({
        code: "UNSUPPORTED_SCHEMA",
        projectId: "fixture",
        path: "docs/order/work-items/work_11111111-1111-4111-8111-111111111111/work-request.md",
      }),
    ]);
  });

  it("rejects direct source escape, symlink and non-regular paths", () => {
    const root = tempDir("order-source-boundary-");
    const outside = tempDir("order-source-boundary-outside-");
    writeFileSync(join(outside, "outside.md"), "outside\n");
    symlinkSync(join(outside, "outside.md"), join(root, "link.md"));
    mkdirSync(join(root, "directory.md"));

    const output = bunEval(`
      const shell = await import("./src/shell/work-item-source.ts");
      const attempts = {};
      for (const [key, path] of [
        ["escape", "../outside.md"],
        ["symlink", "link.md"],
        ["directory", "directory.md"],
      ]) {
        try {
          shell.readWorkItemSource(${JSON.stringify(root)}, path);
          attempts[key] = false;
        } catch {
          attempts[key] = true;
        }
      }
      console.log(JSON.stringify(attempts));
    `, process.cwd());

    expect(JSON.parse(output)).toEqual({
      escape: true,
      symlink: true,
      directory: true,
    });
  });
});
