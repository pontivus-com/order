import {
  closeSync,
  constants,
  fchmodSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

import {
  ExpectedHashWriteResultSchema,
  Sha256Schema,
  type ExpectedHashWriteResult,
  type Sha256,
} from "../core/contracts.ts";
import { sha256 } from "./runtime.ts";

const enoent = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "ENOENT";

const removeIfPresent = (path: string): void => {
  try {
    if (lstatSync(path).isFile()) unlinkSync(path);
  } catch (error) {
    if (!enoent(error)) throw error;
  }
};

const fsyncParent = (target: string): void => {
  const descriptor = openSync(dirname(target), constants.O_RDONLY | constants.O_DIRECTORY);
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
};

const verifyRegularTarget = (target: string): Readonly<{ bytes: Uint8Array; mode: number }> => {
  const stat = lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new TypeError("write target must be an existing regular non-symlink file");
  }
  return { bytes: new Uint8Array(readFileSync(target)), mode: stat.mode & 0o777 };
};

const writeTemporary = (
  target: string,
  bytes: Uint8Array,
  mode: number,
): string => {
  const temporary = join(
    dirname(target),
    `.order-write-${process.pid}-${crypto.randomUUID()}.tmp`,
  );
  const descriptor = openSync(
    temporary,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    mode,
  );
  try {
    fchmodSync(descriptor, mode);
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  return temporary;
};

const replaceFromTemporary = (
  target: string,
  temporary: string,
  expectedSha256: Sha256,
): Sha256 => {
  try {
    renameSync(temporary, target);
  } catch (error) {
    removeIfPresent(temporary);
    throw error;
  }
  fsyncParent(target);
  const afterHash = sha256(verifyRegularTarget(target).bytes);
  if (afterHash !== expectedSha256) {
    throw new TypeError("guarded file write read-back hash mismatch");
  }
  return afterHash;
};

export const createRegularFileExclusive = (
  target: string,
  bytes: Uint8Array,
): Sha256 => {
  if (!statSync(dirname(target)).isDirectory()) {
    throw new TypeError("write target parent must be a directory");
  }

  const descriptor = openSync(
    target,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
  } catch (error) {
    closeSync(descriptor);
    try {
      unlinkSync(target);
      fsyncParent(target);
    } catch {
      // Preserve the original write failure.
    }
    throw error;
  }
  closeSync(descriptor);
  fsyncParent(target);

  const expected = sha256(bytes);
  const actual = sha256(verifyRegularTarget(target).bytes);
  if (actual !== expected) {
    throw new TypeError("exclusive file create read-back hash mismatch");
  }
  return actual;
};

export const replaceRegularFileExpectedHash = (
  target: string,
  expectedSha256: Sha256,
  bytes: Uint8Array,
): ExpectedHashWriteResult => {
  const expected = Sha256Schema.parse(expectedSha256);
  const current = verifyRegularTarget(target);
  const currentHash = sha256(current.bytes);
  if (currentHash !== expected) {
    return ExpectedHashWriteResultSchema.parse({
      tag: "STALE",
      currentSha256: currentHash,
    });
  }

  const nextHash = sha256(bytes);
  const temporary = writeTemporary(target, bytes, current.mode);
  try {
    const written = replaceFromTemporary(target, temporary, nextHash);
    return ExpectedHashWriteResultSchema.parse({ tag: "UPDATED", sha256: written });
  } catch (error) {
    removeIfPresent(temporary);
    throw error;
  }
};
