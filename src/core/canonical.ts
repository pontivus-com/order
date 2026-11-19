import {
  EvidencePathSchema,
  IsoDateTimeSchema,
  RepositoryPathSchema,
  RepositoryPatternSchema,
  type ArtifactRef,
  type EvidencePath,
  type GitCommit,
  type IsoDateTime,
  type RepositoryPath,
  type RepositoryPattern,
  type Sha256,
  type WorkItemId,
} from "./contracts.ts";

export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

const isPlainObject = (value: object): value is Record<string, unknown> => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const canonicalJsonInner = (value: unknown, seen: WeakSet<object>): string => {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    const encoded = JSON.stringify(value);
    if (typeof encoded !== "string") throw new TypeError("value is not JSON-serializable");
    return encoded;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("canonical JSON rejects non-finite numbers");
    const encoded = JSON.stringify(value);
    if (typeof encoded !== "string") throw new TypeError("value is not JSON-serializable");
    return encoded;
  }

  if (typeof value !== "object") {
    throw new TypeError("canonical JSON rejects unsupported values");
  }

  if (seen.has(value)) throw new TypeError("canonical JSON rejects cyclic values");
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new TypeError("canonical JSON rejects symbol-keyed data");
      }
      const entries: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new TypeError("canonical JSON rejects sparse arrays");
        }
        entries.push(canonicalJsonInner(value[index], seen));
      }
      return `[${entries.join(",")}]`;
    }

    if (!isPlainObject(value)) {
      throw new TypeError("canonical JSON accepts plain objects only");
    }

    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError("canonical JSON rejects symbol-keyed data");
    }

    const entries = Object.keys(value)
      .sort()
      .map((key) => {
        const encodedKey = JSON.stringify(key);
        if (typeof encodedKey !== "string") throw new TypeError("object key is not serializable");
        return `${encodedKey}:${canonicalJsonInner(value[key], seen)}`;
      });
    return `{${entries.join(",")}}`;
  } finally {
    seen.delete(value);
  }
};

export const canonicalJson = (value: unknown): string =>
  canonicalJsonInner(value, new WeakSet<object>());

const utf8Encoder = new TextEncoder();

export const canonicalUtf8 = (value: unknown): Uint8Array =>
  utf8Encoder.encode(canonicalJson(value));

export const normalizeRepositoryPath = (value: string): RepositoryPath =>
  RepositoryPathSchema.parse(value);

export const normalizeRepositoryPattern = (value: string): RepositoryPattern =>
  RepositoryPatternSchema.parse(value);

export const normalizeEvidencePath = (value: string): EvidencePath =>
  EvidencePathSchema.parse(value);

export const parseIsoDateTime = (value: string): IsoDateTime =>
  IsoDateTimeSchema.parse(value);

export const isIsoDateTime = (value: string): value is IsoDateTime =>
  IsoDateTimeSchema.safeParse(value).success;

export const sortRepositoryPaths = (
  values: readonly RepositoryPath[],
): readonly RepositoryPath[] => [...values].sort();

export const uniqueSortedRepositoryPaths = (
  values: readonly RepositoryPath[],
): readonly RepositoryPath[] => {
  const sorted = [...values].sort();
  return sorted.filter((value, index) => index === 0 || sorted[index - 1] !== value);
};

export const compareArtifactSemanticIdentity = (
  left: Pick<ArtifactRef, "repositoryPath" | "role" | "authorityLayer">,
  right: Pick<ArtifactRef, "repositoryPath" | "role" | "authorityLayer">,
): number => {
  const compare = (leftValue: string, rightValue: string): number =>
    leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
  const path = compare(left.repositoryPath, right.repositoryPath);
  if (path !== 0) return path;
  const role = compare(left.role, right.role);
  if (role !== 0) return role;
  return compare(left.authorityLayer ?? "", right.authorityLayer ?? "");
};

export type ArtifactIdentityProjection = Readonly<
  Pick<ArtifactRef, "repositoryPath" | "role" | "authorityLayer" | "sha256">
>;

export const projectArtifactIdentity = (
  artifact: Pick<ArtifactRef, "repositoryPath" | "role" | "authorityLayer" | "sha256">,
): ArtifactIdentityProjection => ({
  repositoryPath: artifact.repositoryPath,
  role: artifact.role,
  authorityLayer: artifact.authorityLayer,
  sha256: artifact.sha256,
});

export const artifactSemanticIdentityKey = (
  artifact: Pick<ArtifactRef, "repositoryPath" | "role" | "authorityLayer">,
): string => canonicalJson([
  artifact.repositoryPath,
  artifact.role,
  artifact.authorityLayer,
]);

export type ApprovalPackageProjection = Readonly<{
  workItemId: WorkItemId;
  baselineCommit: GitCommit;
  sourceSha256: Sha256;
  plan: ArtifactIdentityProjection;
  r3: ArtifactIdentityProjection;
  materialArtifacts: readonly ArtifactIdentityProjection[];
}>;

export const buildApprovalPackageProjection = (input: Readonly<{
  workItemId: WorkItemId;
  baselineCommit: GitCommit;
  sourceSha256: Sha256;
  plan: ArtifactRef;
  r3: ArtifactRef;
  materialArtifacts: readonly ArtifactRef[];
}>): ApprovalPackageProjection => {
  const complete = [input.plan, input.r3, ...input.materialArtifacts];
  const identities = complete.map(artifactSemanticIdentityKey);
  if (new Set(identities).size !== identities.length) {
    throw new TypeError("approval package contains duplicate semantic artifact identity");
  }

  const materialArtifacts = [...input.materialArtifacts]
    .sort(compareArtifactSemanticIdentity)
    .map(projectArtifactIdentity);

  return {
    workItemId: input.workItemId,
    baselineCommit: input.baselineCommit,
    sourceSha256: input.sourceSha256,
    plan: projectArtifactIdentity(input.plan),
    r3: projectArtifactIdentity(input.r3),
    materialArtifacts,
  };
};

export const canonicalApprovalPackageJson = (
  input: Parameters<typeof buildApprovalPackageProjection>[0],
): string => canonicalJson(buildApprovalPackageProjection(input));
