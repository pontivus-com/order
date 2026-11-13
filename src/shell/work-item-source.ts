import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import {
  MarkdownTextSchema,
  WorkItemIdSchema,
  WorkItemSourceDiagnosticSchema,
  WorkItemSourcePathSchema,
  type ExpectedHashWriteResult,
  type ProjectId,
  type RepositoryPath,
  type Sha256,
  type WorkItemSourceDiagnostic,
  type WorkItemSourcePath,
  type WorkItemSourceSnapshot,
  type WorkItemTitle,
} from "../core/contracts.ts";
import {
  isUnsupportedWorkItemSchemaFailure,
  parseWorkItemSourceMarkdown,
  workItemArchiveMarkerPath,
  workItemSourcePathForId,
} from "../core/work-item-source.ts";
import { createRegularFileExclusive, replaceRegularFileExpectedHash } from "./file-write.ts";
import { sha256 } from "./runtime.ts";

const decodeUtf8 = new TextDecoder("utf-8", { fatal: true });

const WORK_ITEM_ROOT_ACCESS_FAILURE = "WORK_ITEM_ROOT_ACCESS_FAILURE";

type WorkItemRootAccessFailure = Error & Readonly<{
  orderCode: typeof WORK_ITEM_ROOT_ACCESS_FAILURE;
}>;

const workItemRootAccessFailure = (error: unknown): WorkItemRootAccessFailure =>
  Object.assign(
    error instanceof Error ? error : new TypeError(String(error)),
    { orderCode: WORK_ITEM_ROOT_ACCESS_FAILURE } as const,
  );

export const isWorkItemRootAccessFailure = (
  error: unknown,
): error is WorkItemRootAccessFailure =>
  typeof error === "object" &&
  error !== null &&
  "orderCode" in error &&
  error.orderCode === WORK_ITEM_ROOT_ACCESS_FAILURE;

const canonicalRoot = (root: string): string => {
  try {
    const canonical = realpathSync(root);
    if (!statSync(canonical).isDirectory()) {
      throw new TypeError("WorkItem root must be a directory");
    }
    return canonical;
  } catch (error) {
    throw workItemRootAccessFailure(error);
  }
};

const enoent = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "ENOENT";

const absoluteSourcePath = (
  root: string,
  path: WorkItemSourcePath,
  requireExisting: boolean,
): string => {
  const canonical = canonicalRoot(root);
  const relativePath = WorkItemSourcePathSchema.parse(path);
  const target = resolve(canonical, relativePath);
  if (target !== canonical && !target.startsWith(`${canonical}${sep}`)) {
    throw new TypeError("WorkItem source path escapes workItemRoot");
  }

  const segments = relativePath.split("/");
  let current = canonical;
  for (let index = 0; index < segments.length; index += 1) {
    current = join(current, segments[index]!);
    const leaf = index === segments.length - 1;
    try {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink()) throw new TypeError("WorkItem source path may not traverse a symlink");
      if (!leaf && !stat.isDirectory()) throw new TypeError("WorkItem source parent must be a directory");
      if (leaf && !stat.isFile()) throw new TypeError("WorkItem source must be a regular file");
    } catch (error) {
      if (leaf && !requireExisting && enoent(error)) break;
      throw error;
    }
  }
  return target;
};

export type ParsedWorkItemSource = Readonly<
  WorkItemSourceSnapshot & { title: WorkItemTitle }
>;

export const readWorkItemSource = (
  root: string,
  path: WorkItemSourcePath,
): ParsedWorkItemSource => {
  const target = absoluteSourcePath(root, path, true);
  const bytes = new Uint8Array(readFileSync(target));
  const markdown = MarkdownTextSchema.parse(decodeUtf8.decode(bytes));
  return parseWorkItemSourceMarkdown(path, sha256(bytes), markdown);
};

const workItemsDirectory = (
  repositoryRoot: string,
  workItemsRoot: RepositoryPath,
  create: boolean,
): string => {
  const repository = canonicalRoot(repositoryRoot);
  const relativeRoot = WorkItemSourcePathSchema.parse(
    workItemsRoot + "/placeholder.md",
  ).slice(0, -"/placeholder.md".length);
  const target = resolve(repository, relativeRoot);
  if (!target.startsWith(repository + sep)) {
    throw new TypeError("WorkItem document root escapes repository");
  }
  if (create && !existsSync(target)) {
    mkdirSync(target, { recursive: true, mode: 0o755 });
  }
  if (!existsSync(target)) return target;
  const stat = lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new TypeError("project WorkItem root must be a regular directory");
  }
  return target;
};

export const scanLegacyV2WorkItemSourcesForInstall = (
  legacyRoot: string,
): readonly ParsedWorkItemSource[] => {
  const canonical = canonicalRoot(legacyRoot);
  const paths: WorkItemSourcePath[] = [];
  const visit = (absolute: string): void => {
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const target = join(absolute, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        visit(target);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      paths.push(
        WorkItemSourcePathSchema.parse(
          relative(canonical, target).split(sep).join("/"),
        ),
      );
    }
  };
  visit(canonical);
  return paths.sort().map((path) => {
    try {
      return readWorkItemSource(canonical, path);
    } catch (error) {
      throw new TypeError(
        `legacy v2 WorkItem source is invalid: ${path}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  });
};

export const scanWorkItemSources = (
  repositoryRoot: string,
  projectId: ProjectId,
  workItemsRoot: RepositoryPath,
): Readonly<{
  sources: readonly ParsedWorkItemSource[];
  diagnostics: readonly WorkItemSourceDiagnostic[];
}> => {
  const root = workItemsDirectory(repositoryRoot, workItemsRoot, false);
  if (!existsSync(root)) return { sources: [], diagnostics: [] };

  const sources: ParsedWorkItemSource[] = [];
  const diagnostics: WorkItemSourceDiagnostic[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    const id = WorkItemIdSchema.safeParse(entry.name);
    if (!id.success) continue;
    const path = workItemSourcePathForId(workItemsRoot, id.data);
    const target = resolve(repositoryRoot, path);
    if (!existsSync(target)) continue;
    try {
      const source = readWorkItemSource(repositoryRoot, path);
      if (source.metadata.id !== id.data) {
        diagnostics.push(WorkItemSourceDiagnosticSchema.parse({
          projectId,
          path,
          workItemId: source.metadata.id,
          code: "INVALID_SOURCE",
          detail: "WorkItem source id does not match its deterministic directory",
        }));
        continue;
      }
      sources.push(source);
    } catch (error) {
      const code = typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : null;
      if (code === "ENOENT") continue;
      if (
        code === "EACCES" ||
        code === "EPERM" ||
        code === "EIO" ||
        code === "EMFILE" ||
        code === "ENFILE"
      ) {
        throw error;
      }
      diagnostics.push(WorkItemSourceDiagnosticSchema.parse({
        projectId,
        path,
        workItemId: id.data,
        code: isUnsupportedWorkItemSchemaFailure(error)
          ? "UNSUPPORTED_SCHEMA"
          : "INVALID_SOURCE",
        detail: error instanceof Error ? error.message : String(error),
      }));
    }
  }
  return { sources, diagnostics };
};

export const createWorkItemSourceFile = (
  repositoryRoot: string,
  workItemsRoot: RepositoryPath,
  workItemId: Parameters<typeof workItemSourcePathForId>[1],
  markdown: string,
): Readonly<{ path: WorkItemSourcePath; sha256: Sha256 }> => {
  const path = workItemSourcePathForId(workItemsRoot, workItemId);
  const root = workItemsDirectory(repositoryRoot, workItemsRoot, true);
  const directory = join(root, workItemId);
  if (!existsSync(directory)) mkdirSync(directory, { mode: 0o755 });
  const stat = lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new TypeError("WorkItem directory must be a regular directory");
  }
  const target = absoluteSourcePath(repositoryRoot, path, false);
  const bytes = new TextEncoder().encode(MarkdownTextSchema.parse(markdown));
  return { path, sha256: createRegularFileExclusive(target, bytes) };
};

const archiveMarkerBytes = new TextEncoder().encode("archived\n");

const archiveMarkerTarget = (
  repositoryRoot: string,
  workItemsRoot: RepositoryPath,
  workItemId: Parameters<typeof workItemArchiveMarkerPath>[1],
): string => {
  const repository = canonicalRoot(repositoryRoot);
  const markerPath = workItemArchiveMarkerPath(workItemsRoot, workItemId);
  const target = resolve(repository, markerPath);
  if (!target.startsWith(repository + sep)) {
    throw new TypeError("WorkItem archive marker escapes repository");
  }
  const parent = resolve(target, "..");
  if (existsSync(parent)) {
    const parentStat = lstatSync(parent);
    if (parentStat.isSymbolicLink() || !parentStat.isDirectory()) {
      throw new TypeError("WorkItem archive marker parent must be a regular directory");
    }
  }
  return target;
};

const requireArchiveMarkerParent = (target: string): void => {
  const parent = resolve(target, "..");
  if (!existsSync(parent)) {
    throw new TypeError("WorkItem directory does not exist for archive marker");
  }
  const parentStat = lstatSync(parent);
  if (parentStat.isSymbolicLink() || !parentStat.isDirectory()) {
    throw new TypeError("WorkItem archive marker parent must be a regular directory");
  }
};

export const readWorkItemArchived = (
  repositoryRoot: string,
  workItemsRoot: RepositoryPath,
  workItemId: Parameters<typeof workItemArchiveMarkerPath>[1],
): boolean => {
  const target = archiveMarkerTarget(repositoryRoot, workItemsRoot, workItemId);
  if (!existsSync(target)) return false;
  const stat = lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new TypeError("WorkItem archive marker must be a regular non-symlink file");
  }
  const bytes = new Uint8Array(readFileSync(target));
  if (
    bytes.byteLength !== archiveMarkerBytes.byteLength ||
    bytes.some((value, index) => value !== archiveMarkerBytes[index])
  ) {
    throw new TypeError("WorkItem archive marker bytes are invalid");
  }
  return true;
};

export const setWorkItemArchivedFile = (
  repositoryRoot: string,
  workItemsRoot: RepositoryPath,
  workItemId: Parameters<typeof workItemArchiveMarkerPath>[1],
  archived: boolean,
): void => {
  const target = archiveMarkerTarget(repositoryRoot, workItemsRoot, workItemId);
  const current = readWorkItemArchived(repositoryRoot, workItemsRoot, workItemId);
  if (archived) {
    requireArchiveMarkerParent(target);
    if (current) throw new TypeError("WorkItem is already archived");
    createRegularFileExclusive(target, archiveMarkerBytes);
    if (!readWorkItemArchived(repositoryRoot, workItemsRoot, workItemId)) {
      throw new TypeError("WorkItem archive marker creation did not persist");
    }
    return;
  }
  if (!current) throw new TypeError("WorkItem is not archived");
  unlinkSync(target);
  if (existsSync(target)) {
    throw new TypeError("WorkItem archive marker removal did not persist");
  }
};

export const replaceWorkItemSourceFile = (
  root: string,
  path: WorkItemSourcePath,
  expectedSha256: Sha256,
  markdown: string,
): ExpectedHashWriteResult => {
  const target = absoluteSourcePath(root, path, true);
  const bytes = new TextEncoder().encode(MarkdownTextSchema.parse(markdown));
  return replaceRegularFileExpectedHash(target, expectedSha256, bytes);
};
