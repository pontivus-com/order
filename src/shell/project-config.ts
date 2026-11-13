import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import {
  ProjectManifestSchema,
  RepositoryPathSchema,
  Sha256Schema,
  type ProjectManifest,
  type RepositoryPath,
  type Sha256,
} from "../core/contracts.ts";
import {
  parseProjectManifestText,
  validateProjectManifestResolution,
} from "./project.ts";
import { gitOperationActive, proveRepositoryRoot } from "./repository.ts";
import { sha256, sha256Text } from "./runtime.ts";

export type PreparedWorkItemsRootMigration = Readonly<{
  repositoryRoot: string;
  manifestPath: string;
  beforeText: string;
  afterText: string;
  beforeManifest: ProjectManifest;
  oldWorkItemsRoot: RepositoryPath;
  targetWorkItemsRoot: RepositoryPath;
  oldRootAbsolute: string;
  targetRootAbsolute: string;
  beforeManifestSha256: Sha256;
  afterManifestSha256: Sha256;
}>;

export type StagedWorkItemsRootMigration = Readonly<
  PreparedWorkItemsRootMigration & { targetCreated: boolean }
>;

const repositoryContainedAbsolute = (
  repositoryRoot: string,
  path: RepositoryPath,
): string => {
  const absolute = resolve(repositoryRoot, RepositoryPathSchema.parse(path));
  if (absolute === repositoryRoot || !absolute.startsWith(repositoryRoot + sep)) {
    throw new TypeError("WorkItem document root must remain inside the repository");
  }
  return absolute;
};

const manifestNewline = (text: string): "\n" | "\r\n" => {
  const crlf = text.includes("\r\n");
  const withoutCrlf = text.replaceAll("\r\n", "");
  if (withoutCrlf.includes("\r")) {
    throw new TypeError("project manifest uses unsupported mixed line endings");
  }
  return crlf ? "\r\n" : "\n";
};

const semanticManifestWithRoot = (
  manifest: ProjectManifest,
  targetWorkItemsRoot: RepositoryPath,
): ProjectManifest =>
  ProjectManifestSchema.parse({
    ...manifest,
    workItems: { root: targetWorkItemsRoot },
  });

const mutateWorkItemsRootText = (
  beforeText: string,
  targetWorkItemsRoot: RepositoryPath,
): string => {
  const newline = manifestNewline(beforeText);
  const lines = beforeText.split(newline);
  const table = lines.findIndex((line) =>
    /^\s*\[workItems\]\s*(?:#.*)?$/.test(line)
  );
  const encoded = JSON.stringify(targetWorkItemsRoot);

  if (table < 0) {
    const separator = beforeText.endsWith(newline) ? "" : newline;
    return beforeText + separator + "[workItems]" + newline + "root = " + encoded + newline;
  }

  let end = lines.length;
  for (let index = table + 1; index < lines.length; index += 1) {
    if (/^\s*\[[^\]]+\]\s*(?:#.*)?$/.test(lines[index]!)) {
      end = index;
      break;
    }
  }

  const rootIndices: number[] = [];
  for (let index = table + 1; index < end; index += 1) {
    if (/^\s*root\s*=/.test(lines[index]!)) rootIndices.push(index);
  }
  if (rootIndices.length > 1) {
    throw new TypeError("workItems.root cannot be minimally mutated because it is duplicated");
  }
  if (rootIndices.length === 0) {
    lines.splice(table + 1, 0, "root = " + encoded);
    return lines.join(newline);
  }

  const index = rootIndices[0]!;
  const match = /^(\s*root\s*=\s*)(?:"(?:[^"\\]|\\.)*"|'[^']*')(\s*(?:#.*)?)$/.exec(
    lines[index]!,
  );
  if (match === null) {
    throw new TypeError(
      "workItems.root cannot be safely minimally mutated from its current TOML representation",
    );
  }
  lines[index] = match[1]! + encoded + match[2]!;
  return lines.join(newline);
};

const atomicReplaceText = (path: string, text: string): void => {
  const temporary = path + ".order-document-root-migration.tmp";
  writeFileSync(temporary, text, { encoding: "utf8", flag: "wx", mode: 0o600 });
  try {
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
};

type TreeSnapshot = Readonly<{
  directories: readonly string[];
  files: readonly Readonly<{ path: string; sha256: Sha256 }>[];
}>;

const treeSnapshot = (root: string): TreeSnapshot => {
  if (!existsSync(root)) return { directories: [], files: [] };
  const rootStat = lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new TypeError("WorkItem document root must be a regular directory");
  }

  const directories: string[] = [];
  const files: Array<{ path: string; sha256: Sha256 }> = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        throw new TypeError("WorkItem document migration does not follow symlinks");
      }
      const relativePath = relative(root, absolute).replaceAll("\\", "/");
      if (stat.isDirectory()) {
        directories.push(relativePath);
        visit(absolute);
      } else if (stat.isFile()) {
        files.push({ path: relativePath, sha256: sha256(readFileSync(absolute)) });
      } else {
        throw new TypeError("WorkItem document migration supports regular files/directories only");
      }
    }
  };
  visit(root);
  directories.sort();
  files.sort((left, right) => left.path.localeCompare(right.path));
  return { directories, files };
};

const treeSnapshotsEqual = (left: TreeSnapshot, right: TreeSnapshot): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const copyTreeExact = (source: string, target: string): void => {
  if (!existsSync(source)) return;
  if (existsSync(target)) {
    throw new TypeError("WorkItem document migration target already exists");
  }
  mkdirSync(target, { recursive: true, mode: 0o755 });
  const visit = (sourceDirectory: string, targetDirectory: string): void => {
    for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
      const sourcePath = join(sourceDirectory, entry.name);
      const targetPath = join(targetDirectory, entry.name);
      const stat = lstatSync(sourcePath);
      if (stat.isSymbolicLink()) {
        throw new TypeError("WorkItem document migration does not follow symlinks");
      }
      if (stat.isDirectory()) {
        mkdirSync(targetPath, { mode: stat.mode & 0o777 });
        visit(sourcePath, targetPath);
      } else if (stat.isFile()) {
        copyFileSync(sourcePath, targetPath);
      } else {
        throw new TypeError("WorkItem document migration supports regular files/directories only");
      }
    }
  };
  visit(source, target);
};

export const prepareWorkItemsRootMigration = async (
  repositoryRoot: string,
  expectedManifestSha256: Sha256,
  targetWorkItemsRoot: RepositoryPath,
): Promise<PreparedWorkItemsRootMigration> => {
  const canonicalRepositoryRoot = await proveRepositoryRoot(repositoryRoot);
  if (canonicalRepositoryRoot !== repositoryRoot) {
    throw new TypeError("repository root must be supplied as its exact canonical Git root");
  }
  if (await gitOperationActive(repositoryRoot)) {
    throw new TypeError("WorkItem document-root migration is blocked by an active Git operation");
  }

  const manifestPath = join(repositoryRoot, "pontivus-order.toml");
  const beforeText = readFileSync(manifestPath, "utf8");
  const beforeManifestSha256 = sha256Text(beforeText);
  if (beforeManifestSha256 !== Sha256Schema.parse(expectedManifestSha256)) {
    throw new TypeError("project manifest changed since it was loaded");
  }

  const beforeManifest = parseProjectManifestText(beforeText);
  await validateProjectManifestResolution(repositoryRoot, beforeManifest);
  const target = RepositoryPathSchema.parse(targetWorkItemsRoot);
  const expectedAfterManifest = semanticManifestWithRoot(beforeManifest, target);
  const oldWorkItemsRoot = beforeManifest.workItems.root;
  if (target === oldWorkItemsRoot) {
    throw new TypeError("WorkItem document-root migration must change the root");
  }

  const oldRootAbsolute = repositoryContainedAbsolute(repositoryRoot, oldWorkItemsRoot);
  const targetRootAbsolute = repositoryContainedAbsolute(repositoryRoot, target);
  if (
    targetRootAbsolute.startsWith(oldRootAbsolute + sep) ||
    oldRootAbsolute.startsWith(targetRootAbsolute + sep)
  ) {
    throw new TypeError("current and target WorkItem document roots may not overlap");
  }

  const afterText = mutateWorkItemsRootText(beforeText, target);
  const parsedAfter = parseProjectManifestText(afterText);
  if (JSON.stringify(parsedAfter) !== JSON.stringify(expectedAfterManifest)) {
    throw new TypeError("project manifest mutation changed unrelated semantics");
  }
  await validateProjectManifestResolution(repositoryRoot, parsedAfter);

  if (existsSync(targetRootAbsolute)) {
    const currentTree = treeSnapshot(oldRootAbsolute);
    const targetTree = treeSnapshot(targetRootAbsolute);
    if (!treeSnapshotsEqual(currentTree, targetTree)) {
      throw new TypeError("target WorkItem document root contains conflicting bytes");
    }
  }

  return {
    repositoryRoot,
    manifestPath,
    beforeText,
    afterText,
    beforeManifest,
    oldWorkItemsRoot,
    targetWorkItemsRoot: target,
    oldRootAbsolute,
    targetRootAbsolute,
    beforeManifestSha256,
    afterManifestSha256: sha256Text(afterText),
  };
};

export const stageWorkItemsRootMigration = (
  prepared: PreparedWorkItemsRootMigration,
): StagedWorkItemsRootMigration => {
  const sourceTree = treeSnapshot(prepared.oldRootAbsolute);
  const targetExisted = existsSync(prepared.targetRootAbsolute);
  if (targetExisted) {
    if (!treeSnapshotsEqual(sourceTree, treeSnapshot(prepared.targetRootAbsolute))) {
      throw new TypeError("target WorkItem document root contains conflicting bytes");
    }
    return { ...prepared, targetCreated: false };
  }

  if (existsSync(prepared.oldRootAbsolute)) {
    mkdirSync(dirname(prepared.targetRootAbsolute), { recursive: true });
    copyTreeExact(prepared.oldRootAbsolute, prepared.targetRootAbsolute);
    if (!treeSnapshotsEqual(sourceTree, treeSnapshot(prepared.targetRootAbsolute))) {
      rmSync(prepared.targetRootAbsolute, { recursive: true, force: true });
      throw new TypeError("staged WorkItem document tree failed byte verification");
    }
    return { ...prepared, targetCreated: true };
  }

  return { ...prepared, targetCreated: false };
};

export const activateWorkItemsRootManifest = (
  migration: StagedWorkItemsRootMigration,
): void => {
  atomicReplaceText(migration.manifestPath, migration.afterText);
};

export const verifyWorkItemsRootMigration = async (
  migration: StagedWorkItemsRootMigration,
): Promise<void> => {
  const text = readFileSync(migration.manifestPath, "utf8");
  if (sha256Text(text) !== migration.afterManifestSha256) {
    throw new TypeError("migrated project manifest bytes do not match prepared bytes");
  }
  const manifest = parseProjectManifestText(text);
  await validateProjectManifestResolution(migration.repositoryRoot, manifest);
  if (manifest.workItems.root !== migration.targetWorkItemsRoot) {
    throw new TypeError("migrated project manifest does not select the target WorkItem root");
  }
  if (
    !treeSnapshotsEqual(
      treeSnapshot(migration.oldRootAbsolute),
      treeSnapshot(migration.targetRootAbsolute),
    )
  ) {
    throw new TypeError("migrated WorkItem tree does not match the old productive tree");
  }
};

export const finalizeWorkItemsRootMigration = (
  migration: StagedWorkItemsRootMigration,
): void => {
  if (existsSync(migration.oldRootAbsolute)) {
    rmSync(migration.oldRootAbsolute, { recursive: true, force: false });
  }
};

export const rollbackWorkItemsRootMigration = (
  migration: StagedWorkItemsRootMigration,
): void => {
  if (!existsSync(migration.oldRootAbsolute) && existsSync(migration.targetRootAbsolute)) {
    mkdirSync(dirname(migration.oldRootAbsolute), { recursive: true });
    copyTreeExact(migration.targetRootAbsolute, migration.oldRootAbsolute);
  }
  atomicReplaceText(migration.manifestPath, migration.beforeText);
  if (migration.targetCreated && existsSync(migration.targetRootAbsolute)) {
    rmSync(migration.targetRootAbsolute, { recursive: true, force: true });
  }
};
