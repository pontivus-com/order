import {
  type ArtifactRef,
  type ArtifactRefId,
  type AuthorityRef,
  type ConcernId,
  defaultRuleIds,
  type DefaultRuleId,
  type GateId,
  type GovernanceRule,
  type ProjectManifest,
  type RepositoryPath,
  type Run,
  type RunEventPayload,
  type WorkItemId,
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

export const projectAuthorityLayers = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;
export type ManifestAuthorityLayer = (typeof projectAuthorityLayers)[number];

export const authorityLayersByStage: Readonly<
  Record<PreSignoffStage, readonly ManifestAuthorityLayer[]>
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
  Record<ManifestAuthorityLayer, NonNullable<ArtifactRef["authorityLayer"]>>
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
): readonly ManifestAuthorityLayer[] => authorityLayersByStage[stage];

export const authorityLayerForManifestLayer = (
  layer: ManifestAuthorityLayer,
): NonNullable<ArtifactRef["authorityLayer"]> => authorityLayerByManifestLayer[layer];

export type ExpandedAuthoritySources = Readonly<
  Record<ManifestAuthorityLayer, readonly RepositoryPath[]>
>;

export type ResolvedAuthorityLayer = Readonly<{
  layer: ManifestAuthorityLayer;
  sources: readonly RepositoryPath[];
  precedence: readonly RepositoryPath[];
}>;

export type ResolvedProjectAuthority = Readonly<{
  layers: readonly ResolvedAuthorityLayer[];
  inheritedDefaultRuleIds: readonly DefaultRuleId[];
  overrides: readonly GovernanceRule[];
  extensions: readonly GovernanceRule[];
  fitnessGateIdsByDefaultRuleId: readonly (
    readonly [DefaultRuleId, readonly GateId[]]
  )[];
  fitnessGateIds: readonly GateId[];
  authorityRefs: readonly (readonly [AuthorityRef, RepositoryPath])[];
}>;

const compareGovernanceRules = (
  left: GovernanceRule,
  right: GovernanceRule,
): number =>
  left.defaultRuleId.localeCompare(right.defaultRuleId) ||
  left.authorityRef.localeCompare(right.authorityRef) ||
  left.source.localeCompare(right.source);

const requireResolvedGovernanceRule = (
  manifest: ProjectManifest,
  p1Sources: ReadonlySet<RepositoryPath>,
  rule: GovernanceRule,
): void => {
  if (!p1Sources.has(rule.source)) {
    throw new TypeError(
      `governance source is not selected by resolved authority.p1: ${rule.source}`,
    );
  }
  if (manifest.refs[rule.authorityRef] !== rule.source) {
    throw new TypeError(
      `governance authorityRef ${rule.authorityRef} does not resolve to ${rule.source}`,
    );
  }
  for (const gateId of rule.gates) {
    if (manifest.verification[gateId] === undefined) {
      throw new TypeError(`unresolved governance GateId: ${gateId}`);
    }
  }
};

// Ref closure selects exact identities only; layer/precedence order remains owned by the resolver.
export const resolveAuthorityRefClosure = (
  authority: Pick<ResolvedProjectAuthority, "authorityRefs">,
  dependencies: ProjectManifest["refDependencies"],
  seeds: readonly AuthorityRef[],
): readonly AuthorityRef[] => {
  const reachable = new Set(authority.authorityRefs.map(([ref]) => ref));
  const visited = new Set<AuthorityRef>();
  const pending = [...seeds];
  while (pending.length > 0) {
    const ref = pending.pop();
    if (ref === undefined || visited.has(ref)) continue;
    if (!reachable.has(ref)) throw new TypeError(`unresolved AuthorityRef: ${ref}`);
    visited.add(ref);
    if (Object.hasOwn(dependencies, ref)) {
      for (const dependency of dependencies[ref] ?? []) pending.push(dependency);
    }
  }
  return [...visited].sort();
};

export const resolveProjectAuthority = (
  manifest: ProjectManifest,
  expandedSources: ExpandedAuthoritySources,
): ResolvedProjectAuthority => {
  const layers: ResolvedAuthorityLayer[] = projectAuthorityLayers.map((layer) => {
    const supplied = expandedSources[layer];
    if (new Set(supplied).size !== supplied.length) {
      throw new TypeError(`resolved authority.${layer} contains duplicate paths`);
    }
    const selected = [...supplied].sort();
    const selectedSet = new Set(selected);
    const precedence = [...(manifest.precedence[layer] ?? [])];
    for (const path of precedence) {
      if (!selectedSet.has(path)) {
        throw new TypeError(
          `precedence.${layer} path is not selected by resolved authority.${layer}: ${path}`,
        );
      }
    }
    const precedenceSet = new Set(precedence);
    return {
      layer,
      precedence,
      sources: [
        ...precedence,
        ...selected.filter((path) => !precedenceSet.has(path)),
      ],
    };
  });

  const allSources = new Set(layers.flatMap((layer) => layer.sources));
  const authorityRefs: Array<readonly [AuthorityRef, RepositoryPath]> = [];
  for (const authorityRef of Object.keys(manifest.refs).sort()) {
    const path = manifest.refs[authorityRef];
    if (path === undefined) continue;
    if (!allSources.has(path)) {
      throw new TypeError(
        `AuthorityRef ${authorityRef} source is not selected by resolved authority: ${path}`,
      );
    }
    authorityRefs.push([authorityRef, path]);
  }

  // Validate all declared edges and stage refs, including currently unused ones.
  resolveAuthorityRefClosure(
    { authorityRefs },
    manifest.refDependencies,
    [
      ...Object.keys(manifest.refDependencies),
      ...Object.values(manifest.stageAuthorityRefs).flatMap((refs) => refs ?? []),
    ],
  );

  const p1Sources = new Set(
    layers.find((layer) => layer.layer === "p1")?.sources ?? [],
  );
  const overrides = [...manifest.governance.overrides].sort(compareGovernanceRules);
  const extensions = [...manifest.governance.extensions].sort(compareGovernanceRules);
  const overrideIds = new Set<DefaultRuleId>();
  for (const rule of overrides) {
    requireResolvedGovernanceRule(manifest, p1Sources, rule);
    if (overrideIds.has(rule.defaultRuleId)) {
      throw new TypeError(
        `duplicate governance override defaultRuleId: ${rule.defaultRuleId}`,
      );
    }
    overrideIds.add(rule.defaultRuleId);
  }
  for (const rule of extensions) {
    requireResolvedGovernanceRule(manifest, p1Sources, rule);
  }

  const fitnessGateIdsByDefaultRuleId = defaultRuleIds.map((defaultRuleId) => {
    const gates = uniqueSorted([
      ...(manifest.governance.fitness[defaultRuleId] ?? []),
      ...overrides
        .filter((rule) => rule.defaultRuleId === defaultRuleId)
        .flatMap((rule) => rule.gates),
      ...extensions
        .filter((rule) => rule.defaultRuleId === defaultRuleId)
        .flatMap((rule) => rule.gates),
    ]);
    for (const gateId of gates) {
      if (manifest.verification[gateId] === undefined) {
        throw new TypeError(`unresolved governance GateId: ${gateId}`);
      }
    }
    return [defaultRuleId, gates] as const;
  });

  return {
    layers,
    inheritedDefaultRuleIds: defaultRuleIds.filter(
      (defaultRuleId) => !overrideIds.has(defaultRuleId),
    ),
    overrides,
    extensions,
    fitnessGateIdsByDefaultRuleId,
    fitnessGateIds: uniqueSorted(
      fitnessGateIdsByDefaultRuleId.flatMap(([, gateIds]) => gateIds),
    ),
    authorityRefs,
  };
};

export const projectAuthorityForLayers = (
  authority: ResolvedProjectAuthority,
  layers: readonly ManifestAuthorityLayer[],
): ResolvedProjectAuthority => {
  const included = new Set(layers);
  const resolvedLayers = authority.layers.filter((entry) =>
    included.has(entry.layer)
  );
  const sourcePaths = new Set(
    resolvedLayers.flatMap((entry) => entry.sources),
  );
  const includesP1 = included.has("p1");
  return {
    layers: resolvedLayers,
    inheritedDefaultRuleIds:
      includesP1 ? authority.inheritedDefaultRuleIds : [],
    overrides: includesP1 ? authority.overrides : [],
    extensions: includesP1 ? authority.extensions : [],
    fitnessGateIdsByDefaultRuleId:
      includesP1 ? authority.fitnessGateIdsByDefaultRuleId : [],
    fitnessGateIds: includesP1 ? authority.fitnessGateIds : [],
    authorityRefs: authority.authorityRefs.filter(([, path]) =>
      sourcePaths.has(path)
    ),
  };
};

export const projectAuthorityForSources = (
  authority: ResolvedProjectAuthority,
  sources: readonly RepositoryPath[],
): ResolvedProjectAuthority => {
  const included = new Set(sources);
  const layers = authority.layers.map((entry) => ({
    layer: entry.layer,
    sources: entry.sources.filter((path) => included.has(path)),
    precedence: entry.precedence.filter((path) => included.has(path)),
  }));
  const sourcePaths = new Set(layers.flatMap((entry) => entry.sources));
  for (const rule of [...authority.overrides, ...authority.extensions]) {
    if (!sourcePaths.has(rule.source)) {
      throw new TypeError(
        `material authority projection omitted applicable governance source: ${rule.source}`,
      );
    }
  }
  return {
    layers,
    inheritedDefaultRuleIds: authority.inheritedDefaultRuleIds,
    overrides: authority.overrides,
    extensions: authority.extensions,
    fitnessGateIdsByDefaultRuleId: authority.fitnessGateIdsByDefaultRuleId,
    fitnessGateIds: authority.fitnessGateIds,
    authorityRefs: authority.authorityRefs.filter(([, path]) =>
      sourcePaths.has(path)
    ),
  };
};

export const resolvedAuthoritySourcePaths = (
  authority: ResolvedProjectAuthority,
  layer: ManifestAuthorityLayer,
): readonly RepositoryPath[] =>
  authority.layers.find((entry) => entry.layer === layer)?.sources ?? [];

const manifestLayerForAuthorityLayer = (
  authorityLayer: ArtifactRef["authorityLayer"],
): ManifestAuthorityLayer | null => {
  switch (authorityLayer) {
    case "P1": return "p1";
    case "P2": return "p2";
    case "P3": return "p3";
    case "P4": return "p4";
    case "P5": return "p5";
    case "P6": return "p6";
    default: return null;
  }
};

export const permanentAuthorityProposalLayerIsAdmitted = (
  stage: PreSignoffStage,
  proposal: Pick<
    Extract<RunEventPayload, { tag: "ARTIFACT_PROPOSAL_CREATED" }>,
    "role" | "authorityLayer"
  >,
): boolean => {
  if (proposal.role !== "GOVERNANCE") return false;
  if (stage === "R2") {
    return proposal.authorityLayer === "P2" || proposal.authorityLayer === "P3";
  }
  if (stage === "DESIGN") {
    return proposal.authorityLayer === "P4" ||
      proposal.authorityLayer === "P5" ||
      proposal.authorityLayer === "P6";
  }
  return false;
};

export const permanentAuthorityProposalIsAdmitted = (
  stage: PreSignoffStage,
  proposal: Pick<
    Extract<RunEventPayload, { tag: "ARTIFACT_PROPOSAL_CREATED" }>,
    "role" | "authorityLayer" | "targetPath"
  >,
  authority: ResolvedProjectAuthority,
): boolean => {
  if (!permanentAuthorityProposalLayerIsAdmitted(stage, proposal)) return false;
  const layer = manifestLayerForAuthorityLayer(proposal.authorityLayer);
  return layer !== null &&
    resolvedAuthoritySourcePaths(authority, layer).includes(proposal.targetPath);
};

export const artifactRoleForStage = (
  stage: PreSignoffStage,
): ArtifactRef["role"] => artifactRoleByStage[stage];

export type StageConformanceEvaluation =
  | Readonly<{ tag: "PASS"; output: ArtifactRef }>
  | Readonly<{ tag: "FAIL"; summary: string }>;

export const evaluateStageConformance = (
  stage: PreSignoffStage,
  workItemId: WorkItemId,
  expectedRepositoryPath: RepositoryPath,
  outputs: readonly ArtifactRef[],
): StageConformanceEvaluation => {
  if (outputs.length !== 1) {
    return {
      tag: "FAIL",
      summary:
        "stage completion requires exactly one current output ArtifactRef; received " +
        outputs.length,
    };
  }
  const output = outputs[0];
  if (output.workItemId !== workItemId) {
    return { tag: "FAIL", summary: "stage output belongs to another WorkItem" };
  }
  if (output.role !== artifactRoleForStage(stage)) {
    return {
      tag: "FAIL",
      summary: "stage output role " + output.role + " does not match " + stage,
    };
  }
  if (output.repositoryPath !== expectedRepositoryPath) {
    return {
      tag: "FAIL",
      summary:
        "stage output path " + output.repositoryPath +
        " is not the canonical path " + expectedRepositoryPath,
    };
  }
  return { tag: "PASS", output };
};

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

export const deduplicateArtifactsPreservingOrder = (
  artifacts: readonly ArtifactRef[],
): readonly ArtifactRef[] => {
  const byIdentity = new Map<string, ArtifactRef>();
  const result: ArtifactRef[] = [];
  for (const artifact of artifacts) {
    const key = artifactSemanticIdentityKey(artifact);
    const current = byIdentity.get(key);
    if (current !== undefined) {
      if (current.sha256 !== artifact.sha256) {
        throw new TypeError(
          "resolved context contains contradictory semantic artifact identity",
        );
      }
      continue;
    }
    byIdentity.set(key, artifact);
    result.push(artifact);
  }
  return result;
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
