import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";

import {
  GitCommitSchema,
  MarkdownTextSchema,
  RepositoryPathSchema,
  Sha256Schema,
  type ExpectedHashWriteResult,
  type GitCommit,
  type RepositoryPath,
  type Sha256,
  type WorkItemDocumentGitPathStatus,
  type WorkItemDocumentationExpectedPath,
} from "../core/contracts.ts";
import { createRegularFileExclusive, replaceRegularFileExpectedHash } from "./file-write.ts";
import { runProcess } from "./process.ts";
import { sha256 } from "./runtime.ts";

const utf8 = new TextDecoder("utf-8", { fatal: true });
const gitTimeoutSeconds = 600;

const gitEnvironment = (): Record<string, string> => {
  const path = process.env.PATH;
  if (!path) throw new TypeError("PATH is required for Git");
  return {
    PATH: path,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_TERMINAL_PROMPT: "0",
  };
};

const runGit = async (
  cwd: string,
  args: readonly string[],
  stdin?: Uint8Array,
  extraEnvironment: Readonly<Record<string, string>> = {},
): Promise<Uint8Array> => {
  const result = await runProcess(
    ["git", ...args],
    cwd,
    { ...gitEnvironment(), ...extraEnvironment },
    gitTimeoutSeconds,
    undefined,
    stdin,
  );
  if (result.timedOut || result.cancelled || result.exitCode !== 0) {
    const detail = utf8.decode(result.stderr).trim();
    throw new TypeError(
      `git ${args[0] ?? ""} failed with exit ${result.exitCode}${detail ? `: ${detail}` : ""}`,
    );
  }
  return result.stdout;
};

const gitText = async (
  cwd: string,
  args: readonly string[],
  extraEnvironment: Readonly<Record<string, string>> = {},
): Promise<string> => utf8.decode(await runGit(cwd, args, undefined, extraEnvironment)).trim();

export const gitVersion = async (): Promise<string> =>
  gitText(".", ["--version"]);

export const proveRepositoryRoot = async (repositoryRoot: string): Promise<string> => {
  const registeredRoot = realpathSync(repositoryRoot);
  const reported = await gitText(registeredRoot, ["rev-parse", "--show-toplevel"]);
  const reportedRoot = realpathSync(reported);
  if (registeredRoot !== reportedRoot) {
    throw new TypeError(
      `registered repository root ${registeredRoot} does not equal Git root ${reportedRoot}`,
    );
  }
  return registeredRoot;
};

export const resolveHeadCommit = async (repositoryRoot: string): Promise<GitCommit> =>
  GitCommitSchema.parse(
    await gitText(repositoryRoot, [
      "rev-parse",
      "--verify",
      "--end-of-options",
      "HEAD^{commit}",
    ]),
  );

export const verifyCommit = async (
  repositoryRoot: string,
  commit: GitCommit,
): Promise<GitCommit> =>
  GitCommitSchema.parse(
    await gitText(repositoryRoot, [
      "rev-parse",
      "--verify",
      "--end-of-options",
      `${GitCommitSchema.parse(commit)}^{commit}`,
    ]),
  );

export const createFreshCheckout = async (
  sourceRepositoryRoot: string,
  workspace: string,
  baselineCommit: GitCommit,
): Promise<void> => {
  if (existsSync(workspace)) {
    throw new TypeError("execution workspace must not already exist");
  }
  const parent = dirname(workspace);
  const source = await proveRepositoryRoot(sourceRepositoryRoot);
  const baseline = GitCommitSchema.parse(baselineCommit);

  await runGit(parent, [
    "clone",
    "--no-local",
    "--no-checkout",
    "--",
    source,
    workspace,
  ]);
  const resolved = await verifyCommit(workspace, baseline);
  if (resolved !== baseline) {
    throw new TypeError("fresh checkout could not prove the exact approval baseline");
  }
  await runGit(workspace, ["checkout", "--detach", "--force", baseline]);

  const head = await resolveHeadCommit(workspace);
  if (head !== baseline) throw new TypeError("fresh checkout HEAD does not equal approval baseline");
  const status = await runGit(workspace, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--no-renames",
  ]);
  if (status.byteLength !== 0) {
    throw new TypeError("fresh execution checkout is not clean");
  }
};

const parseLsTree = (bytes: Uint8Array, expectedPath: RepositoryPath): string => {
  const text = utf8.decode(bytes);
  const records = text.split("\0").filter((record) => record.length > 0);
  if (records.length !== 1) throw new TypeError("committed path must resolve to exactly one Git tree entry");
  const record = records[0]!;
  const tab = record.indexOf("\t");
  if (tab < 0) throw new TypeError("invalid git ls-tree output");
  const metadata = record.slice(0, tab).split(" ");
  const path = RepositoryPathSchema.parse(record.slice(tab + 1));
  if (path !== expectedPath || metadata.length !== 3 || metadata[1] !== "blob") {
    throw new TypeError("committed artifact must resolve to one regular Git blob");
  }
  const objectId = metadata[2];
  if (!objectId || !/^[0-9a-f]{40,64}$/.test(objectId)) {
    throw new TypeError("invalid Git blob object id");
  }
  return objectId;
};

export const readCommittedFile = async (
  repositoryRoot: string,
  commit: GitCommit,
  path: RepositoryPath,
): Promise<Uint8Array> => {
  const canonicalCommit = GitCommitSchema.parse(commit);
  const canonicalPath = RepositoryPathSchema.parse(path);
  await verifyCommit(repositoryRoot, canonicalCommit);
  const entry = await runGit(repositoryRoot, [
    "ls-tree",
    "-z",
    "--full-tree",
    canonicalCommit,
    "--",
    canonicalPath,
  ]);
  const objectId = parseLsTree(entry, canonicalPath);
  return runGit(repositoryRoot, ["cat-file", "blob", objectId]);
};

export const createWorkingTreeFileExclusive = (
  repositoryRoot: string,
  path: RepositoryPath,
  bytes: Uint8Array,
): Sha256 => {
  const root = realpathSync(repositoryRoot);
  const canonicalPath = RepositoryPathSchema.parse(path);
  if (canonicalPath === ".") throw new TypeError("repository root is not a file target");
  const segments = canonicalPath.split("/");
  let current = root;
  for (const segment of segments.slice(0, -1)) {
    current = join(current, segment);
    if (!existsSync(current)) mkdirSync(current, { mode: 0o755 });
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new TypeError("repository target parent must be a regular directory");
    }
  }
  const target = join(root, ...segments);
  return createRegularFileExclusive(target, bytes);
};

export const readWorkingTreeFile = (
  repositoryRoot: string,
  path: RepositoryPath,
): Uint8Array => {
  const canonicalPath = RepositoryPathSchema.parse(path);
  const target = ensureInsideRoot(repositoryRoot, canonicalPath, false);
  return new Uint8Array(readFileSync(target));
};

const ensureInsideRoot = (
  repositoryRoot: string,
  path: RepositoryPath,
  allowMissingLeaf: boolean,
): string => {
  const root = realpathSync(repositoryRoot);
  const canonicalPath = RepositoryPathSchema.parse(path);
  if (canonicalPath === ".") throw new TypeError("repository root is not a file target");

  const segments = canonicalPath.split("/");
  let current = root;
  for (let index = 0; index < segments.length; index += 1) {
    current = join(current, segments[index]!);
    const isLeaf = index === segments.length - 1;
    if (!existsSync(current)) {
      if (isLeaf && allowMissingLeaf) break;
      throw new TypeError(`repository path component does not exist: ${segments[index]}`);
    }
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) throw new TypeError("repository target may not traverse a symlink");
    if (!isLeaf && !stat.isDirectory()) {
      throw new TypeError("repository target parent must be a directory");
    }
    if (isLeaf && !stat.isFile()) {
      throw new TypeError("repository target must be a regular file");
    }
  }

  const resolvedTarget = resolve(root, canonicalPath);
  if (resolvedTarget !== root && !resolvedTarget.startsWith(`${root}${sep}`)) {
    throw new TypeError("repository target escapes the repository root");
  }
  return resolvedTarget;
};

const patchPaths = async (
  repositoryRoot: string,
  patch: Uint8Array,
): Promise<readonly RepositoryPath[]> => {
  const output = await runGit(
    repositoryRoot,
    ["apply", "--numstat", "-z", "-"],
    patch,
  );
  const records = utf8.decode(output).split("\0");
  const paths: RepositoryPath[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]!;
    if (record.length === 0) continue;
    const firstTab = record.indexOf("\t");
    const secondTab = firstTab < 0 ? -1 : record.indexOf("\t", firstTab + 1);
    if (firstTab < 0 || secondTab < 0) throw new TypeError("invalid git apply --numstat output");
    const path = record.slice(secondTab + 1);
    if (path.length === 0) {
      throw new TypeError("proposal patches may not rename or copy files");
    }
    paths.push(RepositoryPathSchema.parse(path));
  }

  return [...new Set(paths)].sort();
};

export const verifyProposalPatchAdoption = async (
  repositoryRoot: string,
  targetPath: RepositoryPath,
  baseSha256: Sha256 | null,
  unifiedDiff: string,
): Promise<void> => {
  const canonicalTarget = RepositoryPathSchema.parse(targetPath);
  const target = ensureInsideRoot(
    repositoryRoot,
    canonicalTarget,
    baseSha256 === null,
  );
  if (baseSha256 === null) {
    if (existsSync(target)) throw new TypeError("new proposal target already exists");
  } else {
    const currentBytes = readFileSync(target);
    if (sha256(currentBytes) !== Sha256Schema.parse(baseSha256)) {
      throw new TypeError("proposal base hash does not match current target bytes");
    }
  }

  const patch = new TextEncoder().encode(unifiedDiff);
  const changedPaths = await patchPaths(repositoryRoot, patch);
  if (changedPaths.length !== 1 || changedPaths[0] !== canonicalTarget) {
    throw new TypeError("proposal patch must modify exactly its canonical targetPath");
  }
  await runGit(repositoryRoot, ["apply", "--check", "--binary", "-"], patch);
};

export const adoptProposalPatch = async (
  repositoryRoot: string,
  targetPath: RepositoryPath,
  baseSha256: Sha256 | null,
  unifiedDiff: string,
  reconcileAlreadyApplied = false,
): Promise<Sha256> => {
  const canonicalTarget = RepositoryPathSchema.parse(targetPath);
  const patch = new TextEncoder().encode(unifiedDiff);
  const target = ensureInsideRoot(
    repositoryRoot,
    canonicalTarget,
    baseSha256 === null,
  );
  const reconcileApplied = async (): Promise<Sha256> => {
    if (!reconcileAlreadyApplied || !existsSync(target)) {
      throw new TypeError("proposal base hash does not match current target bytes");
    }
    await runGit(
      repositoryRoot,
      ["apply", "--reverse", "--check", "--binary", "-"],
      patch,
    );
    const currentTarget = ensureInsideRoot(repositoryRoot, canonicalTarget, false);
    return sha256(readFileSync(currentTarget));
  };

  if (baseSha256 === null) {
    if (existsSync(target)) return reconcileApplied();
  } else {
    const currentBytes = readFileSync(target);
    if (sha256(currentBytes) !== Sha256Schema.parse(baseSha256)) {
      return reconcileApplied();
    }
  }

  const changedPaths = await patchPaths(repositoryRoot, patch);
  if (changedPaths.length !== 1 || changedPaths[0] !== canonicalTarget) {
    throw new TypeError("proposal patch must modify exactly its canonical targetPath");
  }
  await runGit(repositoryRoot, ["apply", "--check", "--binary", "-"], patch);
  await runGit(repositoryRoot, ["apply", "--binary", "-"], patch);

  const adoptedTarget = ensureInsideRoot(repositoryRoot, canonicalTarget, false);
  return sha256(readFileSync(adoptedTarget));
};

export const enumerateAgentInstructions = async (
  repositoryRoot: string,
): Promise<readonly RepositoryPath[]> => {
  const glob = new Bun.Glob("**/AGENTS.md");
  const paths: RepositoryPath[] = [];
  for await (const raw of glob.scan({
    cwd: repositoryRoot,
    dot: true,
    absolute: false,
    followSymlinks: false,
    throwErrorOnBrokenSymlink: true,
    onlyFiles: true,
  })) {
    const path = RepositoryPathSchema.parse(raw);
    ensureInsideRoot(repositoryRoot, path, false);
    paths.push(path);
  }
  return [...new Set(paths)].sort();
};

export const changedRepositoryPaths = async (
  workspace: string,
): Promise<readonly RepositoryPath[]> => {
  const output = await runGit(workspace, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--no-renames",
  ]);
  if (output.byteLength === 0) return [];

  const records = utf8.decode(output).split("\0").filter((record) => record.length > 0);
  const paths = records.map((record) => {
    if (record.length < 4 || record[2] !== " ") {
      throw new TypeError("invalid git status porcelain record");
    }
    return RepositoryPathSchema.parse(record.slice(3));
  });
  return [...new Set(paths)].sort();
};

export type CandidateCapture = Readonly<{
  patch: Uint8Array;
  patchSha256: Sha256;
  changedPaths: readonly RepositoryPath[];
}>;

export const captureCandidate = async (
  workspace: string,
): Promise<CandidateCapture> => {
  const changedPaths = await changedRepositoryPaths(workspace);
  const directory = mkdtempSync(join(tmpdir(), "order-index-"));
  const index = join(directory, "index");

  try {
    await runGit(workspace, ["read-tree", "HEAD"], undefined, { GIT_INDEX_FILE: index });
    await runGit(
      workspace,
      ["add", "--intent-to-add", "--all", "--", "."],
      undefined,
      { GIT_INDEX_FILE: index },
    );
    const patch = await runGit(
      workspace,
      [
        "diff",
        "--binary",
        "--full-index",
        "--no-renames",
        "--no-ext-diff",
        "--src-prefix=a/",
        "--dst-prefix=b/",
        "--",
        ".",
      ],
      undefined,
      { GIT_INDEX_FILE: index },
    );
    return {
      patch,
      patchSha256: sha256(patch),
      changedPaths,
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

export const replayAndVerifyCandidate = async (
  sourceRepositoryRoot: string,
  replayWorkspace: string,
  baselineCommit: GitCommit,
  expected: Readonly<{
    patch: Uint8Array;
    patchSha256: Sha256;
    changedPaths: readonly RepositoryPath[];
  }>,
): Promise<void> => {
  if (sha256(expected.patch) !== Sha256Schema.parse(expected.patchSha256)) {
    throw new TypeError("candidate patch bytes do not match their recorded SHA-256");
  }

  await createFreshCheckout(sourceRepositoryRoot, replayWorkspace, baselineCommit);
  await runGit(replayWorkspace, ["apply", "--binary", "-"], expected.patch);

  const regenerated = await captureCandidate(replayWorkspace);
  if (regenerated.patchSha256 !== expected.patchSha256) {
    throw new TypeError("candidate replay did not regenerate the exact patch hash");
  }
  if (
    regenerated.changedPaths.length !== expected.changedPaths.length ||
    regenerated.changedPaths.some((path, index) => path !== expected.changedPaths[index])
  ) {
    throw new TypeError("candidate replay did not regenerate the exact changed-path set");
  }
};

export const relativeRepositoryPath = (
  repositoryRoot: string,
  absolutePath: string,
): RepositoryPath => {
  const root = realpathSync(repositoryRoot);
  const target = realpathSync(absolutePath);
  const value = relative(root, target).split(sep).join("/");
  return RepositoryPathSchema.parse(value);
};


export const readWorkingTreeMarkdown = (
  repositoryRoot: string,
  path: RepositoryPath,
): string => {
  const canonicalPath = RepositoryPathSchema.parse(path);
  if (!canonicalPath.endsWith(".md")) {
    throw new TypeError("direct lifecycle editing is limited to Markdown files");
  }
  return MarkdownTextSchema.parse(
    utf8.decode(readWorkingTreeFile(repositoryRoot, canonicalPath)),
  );
};

export const replaceWorkingTreeMarkdown = (
  repositoryRoot: string,
  path: RepositoryPath,
  expectedSha256: Sha256,
  markdown: string,
): ExpectedHashWriteResult => {
  const canonicalPath = RepositoryPathSchema.parse(path);
  const canonicalMarkdown = MarkdownTextSchema.parse(markdown);
  readWorkingTreeMarkdown(repositoryRoot, canonicalPath);
  const target = ensureInsideRoot(repositoryRoot, canonicalPath, false);
  return replaceRegularFileExpectedHash(
    target,
    Sha256Schema.parse(expectedSha256),
    new TextEncoder().encode(canonicalMarkdown),
  );
};

type RepositoryDocumentationGitStatus = Readonly<{
  headCommit: GitCommit;
  branch: string | null;
  authorName: string | null;
  authorEmail: string | null;
  operationActive: boolean;
  paths: readonly WorkItemDocumentGitPathStatus[];
}>;

const gitProcess = async (
  cwd: string,
  args: readonly string[],
  extraEnvironment: Readonly<Record<string, string>> = {},
) =>
  runProcess(
    ["git", ...args],
    cwd,
    { ...gitEnvironment(), ...extraEnvironment },
    gitTimeoutSeconds,
  );

const optionalGitText = async (
  cwd: string,
  args: readonly string[],
): Promise<string | null> => {
  const result = await gitProcess(cwd, args);
  if (result.timedOut || result.cancelled) {
    throw new TypeError(`git ${args[0] ?? ""} did not complete`);
  }
  if (result.exitCode === 1) return null;
  if (result.exitCode !== 0) {
    const detail = utf8.decode(result.stderr).trim();
    throw new TypeError(
      `git ${args[0] ?? ""} failed with exit ${result.exitCode}${detail ? `: ${detail}` : ""}`,
    );
  }
  const value = utf8.decode(result.stdout).trim();
  return value.length === 0 ? null : value;
};

const repositoryLocalIdentity = async (
  repositoryRoot: string,
): Promise<Readonly<{ authorName: string | null; authorEmail: string | null }>> => ({
  authorName: await optionalGitText(repositoryRoot, ["config", "--local", "--get", "user.name"]),
  authorEmail: await optionalGitText(repositoryRoot, ["config", "--local", "--get", "user.email"]),
});

const attachedBranch = async (repositoryRoot: string): Promise<string | null> => {
  const symbolic = await optionalGitText(repositoryRoot, ["symbolic-ref", "-q", "HEAD"]);
  if (symbolic === null) return null;
  if (!symbolic.startsWith("refs/heads/")) {
    throw new TypeError("HEAD symbolic ref is not a local branch");
  }
  return symbolic.slice("refs/heads/".length);
};

const gitOperationActive = async (repositoryRoot: string): Promise<boolean> => {
  for (const marker of [
    "MERGE_HEAD",
    "CHERRY_PICK_HEAD",
    "REVERT_HEAD",
    "REBASE_HEAD",
    "rebase-merge",
    "rebase-apply",
    "sequencer",
    "BISECT_LOG",
  ]) {
    const path = await gitText(repositoryRoot, ["rev-parse", "--git-path", marker]);
    const absolute = resolve(repositoryRoot, path);
    if (existsSync(absolute)) return true;
  }
  return false;
};

const pathIsIgnored = async (
  repositoryRoot: string,
  path: RepositoryPath,
): Promise<boolean> => {
  const result = await gitProcess(repositoryRoot, ["check-ignore", "-q", "--", path]);
  if (result.timedOut || result.cancelled) {
    throw new TypeError("git check-ignore did not complete");
  }
  if (result.exitCode === 0) return true;
  if (result.exitCode === 1) return false;
  const detail = utf8.decode(result.stderr).trim();
  throw new TypeError(
    `git check-ignore failed with exit ${result.exitCode}${detail ? `: ${detail}` : ""}`,
  );
};

const currentPathStatus = async (
  repositoryRoot: string,
  headCommit: GitCommit,
  path: RepositoryPath,
): Promise<WorkItemDocumentGitPathStatus> => {
  const canonicalPath = RepositoryPathSchema.parse(path);
  const unmerged = (await runGit(
    repositoryRoot,
    ["ls-files", "-u", "-z", "--", canonicalPath],
  )).byteLength !== 0;

  let workingTreeBytes: Uint8Array | null = null;
  try {
    workingTreeBytes = readWorkingTreeFile(repositoryRoot, canonicalPath);
  } catch {
    workingTreeBytes = null;
  }

  let headBytes: Uint8Array | null = null;
  try {
    headBytes = await readCommittedFile(repositoryRoot, headCommit, canonicalPath);
  } catch {
    headBytes = null;
  }

  const workingTreeSha256 = workingTreeBytes === null ? null : sha256(workingTreeBytes);
  const headSha256 = headBytes === null ? null : sha256(headBytes);
  const ignored = await pathIsIgnored(repositoryRoot, canonicalPath);

  const state = unmerged
    ? "UNMERGED"
    : ignored && headBytes === null
      ? "IGNORED"
      : workingTreeBytes !== null && headBytes !== null
        ? workingTreeSha256 === headSha256 ? "MATCHES_HEAD" : "MODIFIED"
        : workingTreeBytes !== null
          ? "UNTRACKED"
          : headBytes !== null
            ? "DELETED"
            : "MISSING";

  return {
    repositoryPath: canonicalPath,
    workingTreeSha256,
    headSha256,
    state,
  };
};

export const inspectDocumentationGit = async (
  repositoryRoot: string,
  repositoryPaths: readonly RepositoryPath[],
): Promise<RepositoryDocumentationGitStatus> => {
  const paths = [...new Set(
    repositoryPaths.map((path) => RepositoryPathSchema.parse(path)),
  )].sort();
  if (paths.length === 0) {
    throw new TypeError("documentation Git status requires at least one governed path");
  }
  const headCommit = await resolveHeadCommit(repositoryRoot);
  const branch = await attachedBranch(repositoryRoot);
  const { authorName, authorEmail } = await repositoryLocalIdentity(repositoryRoot);
  const operationActive = await gitOperationActive(repositoryRoot);
  const statuses: WorkItemDocumentGitPathStatus[] = [];
  for (const path of paths) {
    statuses.push(await currentPathStatus(repositoryRoot, headCommit, path));
  }
  return {
    headCommit,
    branch,
    authorName,
    authorEmail,
    operationActive,
    paths: statuses,
  };
};

const localIdentityEnvironment = (
  authorName: string,
  authorEmail: string,
): Readonly<Record<string, string>> => ({
  GIT_AUTHOR_NAME: authorName,
  GIT_AUTHOR_EMAIL: authorEmail,
  GIT_COMMITTER_NAME: authorName,
  GIT_COMMITTER_EMAIL: authorEmail,
});

export const commitDocumentationPaths = async (
  repositoryRoot: string,
  expectedHeadCommit: GitCommit,
  expectedPaths: readonly WorkItemDocumentationExpectedPath[],
  message: string,
): Promise<GitCommit> => {
  const expectedHead = GitCommitSchema.parse(expectedHeadCommit);
  const paths = expectedPaths
    .map((entry) => ({
      repositoryPath: RepositoryPathSchema.parse(entry.repositoryPath),
      sha256: entry.sha256 === null ? null : Sha256Schema.parse(entry.sha256),
    }))
    .sort((left, right) => left.repositoryPath.localeCompare(right.repositoryPath));

  if (
    paths.length === 0 ||
    new Set(paths.map((entry) => entry.repositoryPath)).size !== paths.length
  ) {
    throw new TypeError("documentation commit requires unique expected paths");
  }
  if (message.length === 0 || message.includes("\n") || message.includes("\r")) {
    throw new TypeError("documentation commit message must be one non-empty line");
  }

  const status = await inspectDocumentationGit(
    repositoryRoot,
    paths.map((entry) => entry.repositoryPath),
  );
  if (status.headCommit !== expectedHead) {
    throw new TypeError("documentation commit HEAD changed");
  }
  if (status.branch === null) {
    throw new TypeError("documentation commit requires attached local branch");
  }
  if (status.operationActive) {
    throw new TypeError("documentation commit is blocked by active Git operation");
  }
  if (status.authorName === null || status.authorEmail === null) {
    throw new TypeError("documentation commit requires repository-local Git identity");
  }

  const statusByPath = new Map(
    status.paths.map((entry) => [entry.repositoryPath, entry] as const),
  );
  const untracked: RepositoryPath[] = [];
  for (const expected of paths) {
    const current = statusByPath.get(expected.repositoryPath);
    if (current === undefined) {
      throw new TypeError("documentation commit path status is missing");
    }
    if (expected.sha256 === null) {
      if (
        current.state !== "DELETED" ||
        current.workingTreeSha256 !== null ||
        current.headSha256 === null
      ) {
        throw new TypeError("documentation deletion proof does not match current state");
      }
      continue;
    }
    if (
      current.state !== "MODIFIED" &&
      current.state !== "UNTRACKED"
    ) {
      throw new TypeError("documentation path is not a committable working-tree change");
    }
    if (current.workingTreeSha256 !== expected.sha256) {
      throw new TypeError("documentation path hash changed");
    }
    if (current.state === "UNTRACKED") untracked.push(current.repositoryPath);
  }

  const identity = localIdentityEnvironment(status.authorName, status.authorEmail);
  const introducedIntent: RepositoryPath[] = [];
  try {
    for (const path of untracked) {
      const priorIndex = await runGit(repositoryRoot, ["ls-files", "--stage", "-z", "--", path]);
      if (priorIndex.byteLength !== 0) {
        throw new TypeError("untracked documentation path unexpectedly has an index entry");
      }
      await runGit(repositoryRoot, ["add", "--intent-to-add", "--", path]);
      introducedIntent.push(path);
    }

    const literalPaths = paths.map((entry) => entry.repositoryPath);
    await runGit(
      repositoryRoot,
      ["commit", "--dry-run", "--only", "-m", message, "--", ...literalPaths],
      undefined,
      identity,
    );
    await runGit(
      repositoryRoot,
      ["commit", "--only", "-m", message, "--", ...literalPaths],
      undefined,
      identity,
    );
  } catch (error) {
    for (const path of introducedIntent) {
      await runGit(repositoryRoot, ["update-index", "--force-remove", "--", path])
        .catch(() => undefined);
    }
    throw error;
  }

  const committed = await resolveHeadCommit(repositoryRoot);
  if (committed === expectedHead) {
    throw new TypeError("documentation commit did not advance HEAD");
  }

  for (const expected of paths) {
    if (expected.sha256 === null) {
      try {
        await readCommittedFile(repositoryRoot, committed, expected.repositoryPath);
      } catch {
        continue;
      }
      throw new TypeError(
        "COMMIT_VERIFICATION_FAILED: deleted documentation path remains in commit",
      );
    }
    let bytes: Uint8Array;
    try {
      bytes = await readCommittedFile(repositoryRoot, committed, expected.repositoryPath);
    } catch (error) {
      throw new TypeError(
        "COMMIT_VERIFICATION_FAILED: committed documentation path is missing",
        { cause: error },
      );
    }
    if (sha256(bytes) !== expected.sha256) {
      throw new TypeError(
        "COMMIT_VERIFICATION_FAILED: committed documentation bytes differ from reviewed hash",
      );
    }
  }

  return committed;
};
