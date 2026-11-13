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
  CommitWorkItemDocumentationSchema,
  GitCommitSchema,
  MarkdownTextSchema,
  RepositoryPathSchema,
  Sha256Schema,
  WorkItemDocumentGitPathStatusSchema,
  WorkItemDocumentationCommitSchema,
  type CommitWorkItemDocumentation,
  type ExpectedHashWriteResult,
  type GitCommit,
  type RepositoryPath,
  type Sha256,
  type WorkItemDocumentGitPathStatus,
  type WorkItemDocumentationCommit,
  type WorkItemDocumentationGitStatus,
  type WorkItemId,
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

const runGitResult = async (
  cwd: string,
  args: readonly string[],
  stdin?: Uint8Array,
  extraEnvironment: Readonly<Record<string, string>> = {},
) => {
  const result = await runProcess(
    ["git", ...args],
    cwd,
    { ...gitEnvironment(), ...extraEnvironment },
    gitTimeoutSeconds,
    undefined,
    stdin,
  );
  if (result.timedOut || result.cancelled) {
    throw new TypeError(`git ${args[0] ?? ""} did not terminate normally`);
  }
  return result;
};

const runGit = async (
  cwd: string,
  args: readonly string[],
  stdin?: Uint8Array,
  extraEnvironment: Readonly<Record<string, string>> = {},
): Promise<Uint8Array> => {
  const result = await runGitResult(cwd, args, stdin, extraEnvironment);
  if (result.exitCode !== 0) {
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

const canonicalRepositoryPaths = (
  values: readonly RepositoryPath[],
): readonly RepositoryPath[] =>
  [...new Set(values.map((value) => RepositoryPathSchema.parse(value)))].sort();

const readHeadFileOrNull = async (
  repositoryRoot: string,
  headCommit: GitCommit,
  path: RepositoryPath,
): Promise<Uint8Array | null> => {
  const canonicalPath = RepositoryPathSchema.parse(path);
  const entry = await runGit(repositoryRoot, [
    "ls-tree",
    "-z",
    "--full-tree",
    GitCommitSchema.parse(headCommit),
    "--",
    canonicalPath,
  ]);
  if (entry.byteLength === 0) return null;
  const objectId = parseLsTree(entry, canonicalPath);
  return runGit(repositoryRoot, ["cat-file", "blob", objectId]);
};

const localBranch = async (repositoryRoot: string): Promise<string | null> => {
  const result = await runGitResult(repositoryRoot, ["symbolic-ref", "-q", "HEAD"]);
  if (result.exitCode === 1) return null;
  if (result.exitCode !== 0) {
    throw new TypeError("failed to resolve Git symbolic HEAD");
  }
  const ref = utf8.decode(result.stdout).trim();
  if (!ref.startsWith("refs/heads/") || ref.length === "refs/heads/".length) {
    return null;
  }
  return ref.slice("refs/heads/".length);
};

const localGitConfig = async (
  repositoryRoot: string,
  name: "user.name" | "user.email",
): Promise<string | null> => {
  const result = await runGitResult(repositoryRoot, ["config", "--local", "--get", name]);
  if (result.exitCode === 1) return null;
  if (result.exitCode !== 0) {
    throw new TypeError(`failed to resolve repository-local Git ${name}`);
  }
  const value = utf8.decode(result.stdout).trim();
  return value.length === 0 ? null : value;
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
  ] as const) {
    const path = await gitText(repositoryRoot, ["rev-parse", "--git-path", marker]);
    if (existsSync(resolve(repositoryRoot, path))) return true;
  }
  return false;
};

const pathIsUnmerged = async (
  repositoryRoot: string,
  path: RepositoryPath,
): Promise<boolean> =>
  (await runGit(repositoryRoot, [
    "ls-files",
    "--unmerged",
    "-z",
    "--",
    RepositoryPathSchema.parse(path),
  ])).byteLength > 0;

const pathIsIgnored = async (
  repositoryRoot: string,
  path: RepositoryPath,
): Promise<boolean> => {
  const result = await runGitResult(repositoryRoot, [
    "check-ignore",
    "--no-index",
    "-q",
    "--",
    RepositoryPathSchema.parse(path),
  ]);
  if (result.exitCode === 0) return true;
  if (result.exitCode === 1) return false;
  throw new TypeError("git check-ignore failed");
};

const workingTreeFile = (
  repositoryRoot: string,
  path: RepositoryPath,
): Readonly<{ present: boolean; bytes: Uint8Array | null }> => {
  const root = realpathSync(repositoryRoot);
  const canonicalPath = RepositoryPathSchema.parse(path);
  const target = resolve(root, canonicalPath);
  const inside = target !== root && target.startsWith(`${root}${sep}`);
  if (!inside || !existsSync(target)) return { present: false, bytes: null };
  try {
    return {
      present: true,
      bytes: readWorkingTreeFile(root, canonicalPath),
    };
  } catch {
    return { present: true, bytes: null };
  }
};

const inspectDocumentationPath = async (
  repositoryRoot: string,
  headCommit: GitCommit,
  path: RepositoryPath,
  required: boolean,
  deletable: boolean,
): Promise<WorkItemDocumentGitPathStatus | null> => {
  const canonicalPath = RepositoryPathSchema.parse(path);
  if (await pathIsUnmerged(repositoryRoot, canonicalPath)) {
    return WorkItemDocumentGitPathStatusSchema.parse({
      repositoryPath: canonicalPath,
      workingTreeSha256: null,
      headSha256: null,
      state: "UNMERGED",
    });
  }

  const workingTree = workingTreeFile(repositoryRoot, canonicalPath);
  const headBytes = await readHeadFileOrNull(repositoryRoot, headCommit, canonicalPath);
  const headSha256 = headBytes === null ? null : sha256(headBytes);

  if (workingTree.present && workingTree.bytes === null) {
    return WorkItemDocumentGitPathStatusSchema.parse({
      repositoryPath: canonicalPath,
      workingTreeSha256: null,
      headSha256,
      state: "MISSING",
    });
  }

  if (workingTree.bytes !== null) {
    const workingTreeSha256 = sha256(workingTree.bytes);
    if (headBytes === null && await pathIsIgnored(repositoryRoot, canonicalPath)) {
      return WorkItemDocumentGitPathStatusSchema.parse({
        repositoryPath: canonicalPath,
        workingTreeSha256,
        headSha256: null,
        state: "IGNORED",
      });
    }
    return WorkItemDocumentGitPathStatusSchema.parse({
      repositoryPath: canonicalPath,
      workingTreeSha256,
      headSha256,
      state: headBytes === null
        ? "UNTRACKED"
        : workingTreeSha256 === headSha256
          ? "MATCHES_HEAD"
          : "MODIFIED",
    });
  }

  if (headBytes !== null) {
    return WorkItemDocumentGitPathStatusSchema.parse({
      repositoryPath: canonicalPath,
      workingTreeSha256: null,
      headSha256,
      state: deletable ? "DELETED" : "MISSING",
    });
  }

  if (!required) return null;
  return WorkItemDocumentGitPathStatusSchema.parse({
    repositoryPath: canonicalPath,
    workingTreeSha256: null,
    headSha256: null,
    state: "MISSING",
  });
};

export type DocumentationGitInspection = Readonly<
  Pick<
    WorkItemDocumentationGitStatus,
    "headCommit" | "branch" | "authorName" | "authorEmail" | "paths"
  > & {
    operationActive: boolean;
  }
>;

export const inspectDocumentationGit = async (
  repositoryRoot: string,
  requiredPaths: readonly RepositoryPath[],
  optionalPaths: readonly RepositoryPath[],
  deletablePaths: readonly RepositoryPath[],
): Promise<DocumentationGitInspection> => {
  const root = await proveRepositoryRoot(repositoryRoot);
  const headCommit = await resolveHeadCommit(root);
  const required = new Set(canonicalRepositoryPaths(requiredPaths));
  const optional = new Set(canonicalRepositoryPaths(optionalPaths));
  const deletable = new Set(canonicalRepositoryPaths(deletablePaths));
  const paths = canonicalRepositoryPaths([...required, ...optional]);
  const statuses: WorkItemDocumentGitPathStatus[] = [];

  for (const path of paths) {
    const status = await inspectDocumentationPath(
      root,
      headCommit,
      path,
      required.has(path),
      deletable.has(path),
    );
    if (status !== null) statuses.push(status);
  }

  return {
    headCommit,
    branch: await localBranch(root),
    authorName: await localGitConfig(root, "user.name"),
    authorEmail: await localGitConfig(root, "user.email"),
    operationActive: await gitOperationActive(root),
    paths: statuses,
  };
};

const expectedDocumentationPaths = (
  inspection: DocumentationGitInspection,
): readonly Readonly<{ repositoryPath: RepositoryPath; sha256: Sha256 | null }>[] =>
  inspection.paths
    .filter((path) =>
      path.state === "MODIFIED" ||
      path.state === "UNTRACKED" ||
      path.state === "DELETED"
    )
    .map((path) => ({
      repositoryPath: path.repositoryPath,
      sha256: path.state === "DELETED" ? null : path.workingTreeSha256,
    }));

const sameExpectedPaths = (
  left: readonly Readonly<{ repositoryPath: RepositoryPath; sha256: Sha256 | null }>[],
  right: readonly Readonly<{ repositoryPath: RepositoryPath; sha256: Sha256 | null }>[],
): boolean =>
  left.length === right.length &&
  left.every((value, index) =>
    value.repositoryPath === right[index]?.repositoryPath &&
    value.sha256 === right[index]?.sha256
  );

const hasIndexEntry = async (
  repositoryRoot: string,
  path: RepositoryPath,
): Promise<boolean> =>
  (await runGit(repositoryRoot, [
    "ls-files",
    "--stage",
    "-z",
    "--",
    RepositoryPathSchema.parse(path),
  ])).byteLength > 0;

const identityEnvironment = (
  authorName: string,
  authorEmail: string,
): Readonly<Record<string, string>> => ({
  GIT_AUTHOR_NAME: authorName,
  GIT_AUTHOR_EMAIL: authorEmail,
  GIT_COMMITTER_NAME: authorName,
  GIT_COMMITTER_EMAIL: authorEmail,
});

const dryRunDocumentationCommit = async (
  repositoryRoot: string,
  message: string,
  paths: readonly RepositoryPath[],
  untrackedPaths: readonly RepositoryPath[],
  identity: Readonly<Record<string, string>>,
): Promise<void> => {
  const directory = mkdtempSync(join(tmpdir(), "order-doc-git-"));
  const index = join(directory, "index");
  const environment = { ...identity, GIT_INDEX_FILE: index };
  try {
    await runGit(repositoryRoot, ["read-tree", "HEAD"], undefined, environment);
    if (untrackedPaths.length > 0) {
      await runGit(
        repositoryRoot,
        ["add", "--intent-to-add", "--", ...untrackedPaths],
        undefined,
        environment,
      );
    }
    await runGit(
      repositoryRoot,
      ["commit", "--dry-run", "--only", "-m", message, "--", ...paths],
      undefined,
      environment,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

const commitVerificationFailure = (detail: string): TypeError & { orderCode: "COMMIT_VERIFICATION_FAILED" } =>
  Object.assign(new TypeError(detail), { orderCode: "COMMIT_VERIFICATION_FAILED" as const });

export const isDocumentationCommitVerificationFailure = (
  error: unknown,
): error is TypeError & { orderCode: "COMMIT_VERIFICATION_FAILED" } =>
  error instanceof TypeError &&
  "orderCode" in error &&
  (error as { orderCode?: unknown }).orderCode === "COMMIT_VERIFICATION_FAILED";

export const commitDocumentationPaths = async (
  repositoryRoot: string,
  workItemId: WorkItemId,
  requiredPaths: readonly RepositoryPath[],
  optionalPaths: readonly RepositoryPath[],
  deletablePaths: readonly RepositoryPath[],
  input: CommitWorkItemDocumentation,
): Promise<WorkItemDocumentationCommit> => {
  const command = CommitWorkItemDocumentationSchema.parse(input);
  const inspection = await inspectDocumentationGit(
    repositoryRoot,
    requiredPaths,
    optionalPaths,
    deletablePaths,
  );
  const expected = expectedDocumentationPaths(inspection);
  if (
    inspection.headCommit !== command.expectedHeadCommit ||
    inspection.branch === null ||
    inspection.operationActive ||
    inspection.authorName === null ||
    inspection.authorEmail === null ||
    inspection.paths.some((path) =>
      path.state === "MISSING" ||
      path.state === "IGNORED" ||
      path.state === "UNMERGED"
    ) ||
    !sameExpectedPaths(expected, command.expectedPaths)
  ) {
    throw new TypeError("documentation Git preconditions changed");
  }

  for (const path of command.expectedPaths) {
    if (path.sha256 === null && !deletablePaths.includes(path.repositoryPath)) {
      throw new TypeError("null documentation hash is permitted only for an exact managed deletion");
    }
  }

  const paths = command.expectedPaths.map((value) => value.repositoryPath);
  const untrackedPaths = inspection.paths
    .filter((path) => path.state === "UNTRACKED")
    .map((path) => path.repositoryPath);
  const message = `docs(order): save ${workItemId} documentation`;
  const identity = identityEnvironment(inspection.authorName, inspection.authorEmail);
  await dryRunDocumentationCommit(repositoryRoot, message, paths, untrackedPaths, identity);

  const introducedIntentToAdd: RepositoryPath[] = [];
  for (const path of untrackedPaths) {
    if (!(await hasIndexEntry(repositoryRoot, path))) {
      introducedIntentToAdd.push(path);
    }
  }

  if (introducedIntentToAdd.length > 0) {
    await runGit(repositoryRoot, [
      "add",
      "--intent-to-add",
      "--",
      ...introducedIntentToAdd,
    ]);
  }

  try {
    await runGit(
      repositoryRoot,
      ["commit", "--only", "-m", message, "--", ...paths],
      undefined,
      identity,
    );
  } catch (error) {
    if (introducedIntentToAdd.length > 0) {
      await runGit(repositoryRoot, [
        "update-index",
        "--force-remove",
        "--",
        ...introducedIntentToAdd,
      ]).catch(() => undefined);
    }
    throw error;
  }

  const gitCommit = await resolveHeadCommit(repositoryRoot);
  const changed = utf8.decode(await runGit(repositoryRoot, [
    "diff",
    "--name-only",
    "-z",
    command.expectedHeadCommit,
    gitCommit,
    "--",
  ]))
    .split("\0")
    .filter((path) => path.length > 0)
    .map((path) => RepositoryPathSchema.parse(path))
    .sort();

  if (
    changed.length !== paths.length ||
    changed.some((path, index) => path !== paths[index])
  ) {
    throw commitVerificationFailure("documentation commit changed an unexpected repository path");
  }

  for (const expectedPath of command.expectedPaths) {
    const committed = await readHeadFileOrNull(
      repositoryRoot,
      gitCommit,
      expectedPath.repositoryPath,
    );
    if (expectedPath.sha256 === null) {
      if (committed !== null) {
        throw commitVerificationFailure(
          `documentation deletion was not committed: ${expectedPath.repositoryPath}`,
        );
      }
      continue;
    }
    if (committed === null || sha256(committed) !== expectedPath.sha256) {
      throw commitVerificationFailure(
        `committed documentation bytes differ from the reviewed hash: ${expectedPath.repositoryPath}`,
      );
    }
  }

  return WorkItemDocumentationCommitSchema.parse({
    workItemId,
    gitCommit,
    repositoryPaths: paths,
  });
};

