import {
  type ArtifactRef,
  type ArtifactRefId,
  type ConcernId,
  type ProjectManifest,
  type Run,
  type RunEventPayload,
  type WorkStage,
} from "./contracts.ts";
import {
  artifactSemanticIdentityKey,
  canonicalJson,
  compareArtifactSemanticIdentity,
  projectArtifactIdentity,
  type ArtifactIdentityProjection,
} from "./canonical.ts";

export type PreSignoffStage = Extract<WorkStage, "R1" | "R2" | "DESIGN" | "PLAN" | "R3">;

export const authorityLayersByStage: Readonly<
  Record<PreSignoffStage, readonly (keyof ProjectManifest["authority"])[]>
> = {
  R1: ["p1", "p2"],
  R2: ["p1", "p2", "p3"],
  DESIGN: ["p1", "p2", "p3", "p4", "p5", "p6"],
  PLAN: ["p1", "p2", "p3", "p4", "p5", "p6"],
  R3: ["p1", "p2", "p3", "p4", "p5", "p6"],
};

export const artifactRoleByStage: Readonly<Record<PreSignoffStage, ArtifactRef["role"]>> = {
  R1: "R1",
  R2: "R2",
  DESIGN: "DESIGN",
  PLAN: "PLAN",
  R3: "R3",
};

export const artifactRoleRank: Readonly<Record<ArtifactRef["role"], number>> = {
  R1: 1,
  R2: 2,
  DESIGN: 3,
  PLAN: 4,
  R3: 5,
  GOVERNANCE: 0,
  PROJECT_MANIFEST: 0,
  VERIFICATION_MATERIAL: 0,
};

export const outputRankByStage: Readonly<Record<PreSignoffStage, number>> = {
  R1: 0,
  R2: 1,
  DESIGN: 2,
  PLAN: 3,
  R3: 4,
};

export const authorityLayerByManifestLayer: Readonly<
  Record<keyof ProjectManifest["authority"], NonNullable<ArtifactRef["authorityLayer"]>>
> = {
  p1: "P1",
  p2: "P2",
  p3: "P3",
  p4: "P4",
  p5: "P5",
  p6: "P6",
};

export const isPreSignoffStage = (stage: WorkStage): stage is PreSignoffStage =>
  stage === "R1" ||
  stage === "R2" ||
  stage === "DESIGN" ||
  stage === "PLAN" ||
  stage === "R3";

export const authorityLayersForStage = (
  stage: PreSignoffStage,
): readonly (keyof ProjectManifest["authority"])[] => authorityLayersByStage[stage];

export const authorityLayerForManifestLayer = (
  layer: keyof ProjectManifest["authority"],
): NonNullable<ArtifactRef["authorityLayer"]> => authorityLayerByManifestLayer[layer];

export const artifactRoleForStage = (
  stage: PreSignoffStage,
): ArtifactRef["role"] => artifactRoleByStage[stage];

const preSignoffStageSequence: readonly PreSignoffStage[] = [
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
];

export const priorStagesForStage = (
  stage: PreSignoffStage,
): readonly PreSignoffStage[] => {
  const index = preSignoffStageSequence.indexOf(stage);
  if (index < 0) throw new TypeError(`unknown pre-signoff stage: ${stage}`);
  return preSignoffStageSequence.slice(0, index);
};

export const stageContextIncludesArtifact = (
  stage: PreSignoffStage,
  artifact: Pick<ArtifactRef, "role">,
): boolean =>
  artifactRoleRank[artifact.role] > 0 &&
  artifactRoleRank[artifact.role] <= outputRankByStage[stage];

export const deduplicateArtifacts = (
  artifacts: readonly ArtifactRef[],
): readonly ArtifactRef[] => {
  const byIdentity = new Map<string, ArtifactRef>();
  for (const artifact of artifacts) {
    const key = artifactSemanticIdentityKey(artifact);
    const current = byIdentity.get(key);
    if (current !== undefined && current.sha256 !== artifact.sha256) {
      throw new TypeError("resolved context contains contradictory semantic artifact identity");
    }
    byIdentity.set(key, artifact);
  }
  return [...byIdentity.values()].sort(compareArtifactSemanticIdentity);
};

export const uniqueSorted = <T extends string>(values: readonly T[]): readonly T[] =>
  [...new Set(values)].sort();

export const canonicalAbsolutePathIsWithinRoot = (
  path: string,
  root: string,
): boolean =>
  path === root ||
  (root === "/" ? path.startsWith("/") : path.startsWith(`${root}/`));

export const repositoryRootIsAllowed = (
  repositoryRoot: string,
  configuredRoots: readonly string[],
): boolean => configuredRoots.includes(repositoryRoot);

export const resolveConcernIds = (
  workItemConcernIds: readonly ConcernId[],
  upstreamConcernIds: readonly ConcernId[],
  surfaceConcernIds: readonly ConcernId[],
  taskConcernIds: readonly ConcernId[],
): readonly ConcernId[] =>
  uniqueSorted([
    ...workItemConcernIds,
    ...upstreamConcernIds,
    ...surfaceConcernIds,
    ...taskConcernIds,
  ]);

export const resolveApplicableArtifactIds = (
  mandatoryArtifactIds: readonly ArtifactRefId[],
  explicitReferenceArtifactIds: readonly ArtifactRefId[],
  authorityDependencyArtifactIds: readonly ArtifactRefId[],
  repositoryEvidenceArtifactIds: readonly ArtifactRefId[],
): readonly ArtifactRefId[] =>
  uniqueSorted([
    ...mandatoryArtifactIds,
    ...explicitReferenceArtifactIds,
    ...authorityDependencyArtifactIds,
    ...repositoryEvidenceArtifactIds,
  ]);

export const materialIdentity = (
  value: Pick<ArtifactRef, "repositoryPath" | "role" | "authorityLayer" | "sha256">,
): string => canonicalJson(projectArtifactIdentity(value));

export const approvalMaterialIsFresh = (
  signed: readonly ArtifactRef[],
  current: readonly ArtifactRef[],
): boolean => {
  const signedByIdentity = new Map(signed.map((artifact) => [artifactSemanticIdentityKey(artifact), materialIdentity(artifact)]));
  const currentByIdentity = new Map(current.map((artifact) => [artifactSemanticIdentityKey(artifact), materialIdentity(artifact)]));

  if (signedByIdentity.size !== signed.length || currentByIdentity.size !== current.length) {
    return false;
  }
  if (signedByIdentity.size !== currentByIdentity.size) return false;

  for (const [identity, signedMaterial] of signedByIdentity) {
    if (currentByIdentity.get(identity) !== signedMaterial) return false;
  }
  return true;
};

export const sortedMaterialProjection = (
  artifacts: readonly ArtifactRef[],
): readonly ArtifactIdentityProjection[] =>
  [...artifacts].sort(compareArtifactSemanticIdentity).map(projectArtifactIdentity);

export type ArtifactDependencyEdge = readonly [ArtifactRefId, ArtifactRefId];

export const invalidatedArtifactIds = (
  changedArtifactIds: readonly ArtifactRefId[],
  dependencyEdges: readonly ArtifactDependencyEdge[],
): readonly ArtifactRefId[] => {
  const invalid = new Set<ArtifactRefId>(changedArtifactIds);
  let changed = true;

  while (changed) {
    changed = false;
    for (const [artifactId, dependsOnArtifactId] of dependencyEdges) {
      if (invalid.has(dependsOnArtifactId) && !invalid.has(artifactId)) {
        invalid.add(artifactId);
        changed = true;
      }
    }
  }

  return [...invalid].sort();
};

export const currentRunRequiresProviderReplacement = (
  priorContextHash: Run["contextHash"],
  nextContextHash: Run["contextHash"],
): boolean => priorContextHash !== nextContextHash;

export const conformanceEventMatchesRun = (
  run: Run,
  payload: RunEventPayload,
): boolean =>
  payload.tag === "CONFORMANCE_PASSED" &&
  payload.stage === run.stage &&
  payload.contextHash === run.contextHash;
