import {
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import {
  MarkdownTextSchema,
  WorkItemSourceDiagnosticSchema,
  WorkItemSourcePathSchema,
  type ExpectedHashWriteResult,
  type Sha256,
  type WorkItemSourceDiagnostic,
  type WorkItemSourcePath,
  type WorkItemSourceSnapshot,
  type WorkItemTitle,
} from "../core/contracts.ts";
import {
  isUnsupportedWorkItemSchemaFailure,
  parseWorkItemSourceMarkdown,
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

const scanPaths = (root: string): readonly WorkItemSourcePath[] => {
  const canonical = canonicalRoot(root);
  const output: WorkItemSourcePath[] = [];
  const visit = (absolute: string): void => {
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const target = join(absolute, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        visit(target);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const path = relative(canonical, target).split(sep).join("/");
      output.push(WorkItemSourcePathSchema.parse(path));
    }
  };
  visit(canonical);
  return output.sort();
};

export const scanWorkItemSources = (
  root: string,
): Readonly<{
  sources: readonly ParsedWorkItemSource[];
  diagnostics: readonly WorkItemSourceDiagnostic[];
}> => {
  const sources: ParsedWorkItemSource[] = [];
  const diagnostics: WorkItemSourceDiagnostic[] = [];
  for (const path of scanPaths(root)) {
    try {
      sources.push(readWorkItemSource(root, path));
    } catch (error) {
      const code = typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : null;
      if (code === "ENOENT") {
        continue;
      }
      if (
        code === "EACCES" ||
        code === "EPERM" ||
        code === "EIO" ||
        code === "EMFILE" ||
        code === "ENFILE"
      ) {
        throw error;
      }

      const detail = error instanceof Error ? error.message : String(error);
      diagnostics.push(WorkItemSourceDiagnosticSchema.parse({
        path,
        workItemId: null,
        code: isUnsupportedWorkItemSchemaFailure(error)
          ? "UNSUPPORTED_SCHEMA"
          : "INVALID_SOURCE",
        detail,
      }));
    }
  }
  return { sources, diagnostics };
};

export const createWorkItemSourceFile = (
  root: string,
  workItemId: Parameters<typeof workItemSourcePathForId>[0],
  markdown: string,
): Readonly<{ path: WorkItemSourcePath; sha256: Sha256 }> => {
  const path = workItemSourcePathForId(workItemId);
  const target = absoluteSourcePath(root, path, false);
  const bytes = new TextEncoder().encode(MarkdownTextSchema.parse(markdown));
  return { path, sha256: createRegularFileExclusive(target, bytes) };
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
