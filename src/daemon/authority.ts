import {
  type Approval,
  ApprovalSchema,
  type ArtifactRef,
  type ArtifactRefId,
  ArtifactRefSchema,
  type ExecutionTask,
  type ExecutionTaskId,
  type GitCommit,
  type ProjectManifest,
  type RepositoryPath,
  type RunRole,
  type Sha256,
  type SignoffPackage,
  SignoffPackageSchema,
  type WorkItemSourceSnapshot,
  type WorkItem,
  type WorkItemId,
} from "../core/contracts.ts";
import {
  artifactSemanticIdentityKey,
  canonicalApprovalPackageJson,
  canonicalJson,
  normalizeRepositoryPath,
} from "../core/canonical.ts";
import {
  artifactReturnOwner,
  stageRank,
} from "../core/lifecycle.ts";
import {
  approvalMaterialIsFresh,
  artifactRoleForStage,
  authorityLayerForManifestLayer,
  authorityLayersForStage,
  deduplicateArtifacts,
  type PreSignoffStage,
  priorStagesForStage,
  sortedMaterialProjection,
} from "../core/governance.ts";
import {
  materializeExecutionTasks,
  parseSignedTaskBlockFromPlan,
} from "../core/execution.ts";
import {
  expandRepositoryPatterns,
  loadValidatedProjectManifest,
  repositoryPatternMatches,
  resolveAuthorityRef,
  resolveAuthoritySources,
  resolveConcernAuthoritySources,
  resolveConcernGateIds,
  validateProjectManifestResolution,
} from "../shell/project.ts";
import {
  readCommittedFile,
  readWorkingTreeFile,
  resolveHeadCommit,
} from "../shell/repository.ts";
import {
  byteEqual,
  newApprovalId,
  newArtifactRefId,
  newExecutionTaskId,
  nowIsoDateTime,
  sha256,
  sha256Text,
} from "../shell/runtime.ts";
import {
  findArtifactSnapshot,
  loadApproval,
  loadApprovalsForWorkItem,
  loadArtifact,
  loadArtifactDependencyEdges,
  loadArtifactDependencyEdgesForOwners,
  loadArtifactsForWorkItem,
  loadCurrentApprovalForWorkItem,
  loadTaskStatesForApproval,
  loadWorkItem,
  reconstructExecutionTask,
  storeApproval,
  storeArtifact,
  storeArtifactDependency,
  storeExecutionTask,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import { type CoordinatorRuntime } from "./runtime.ts";
import { getRun, listRunEvents, listRuns } from "./run.ts";
import {
  isSourceBoundaryFailure,
  revalidateWorkItemSource,
} from "./work-item-source.ts";

export const getWorkItem = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): WorkItem => loadWorkItem(runtime.database, workItemId);

export const listArtifacts = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): readonly ArtifactRef[] => loadArtifactsForWorkItem(runtime.database, workItemId);

export const getArtifact = (
  runtime: CoordinatorRuntime,
  artifactRefId: ArtifactRefId,
): ArtifactRef => loadArtifact(runtime.database, artifactRefId);

export const getApproval = (
  runtime: CoordinatorRuntime,
  approvalId: Approval["id"],
): Approval => loadApproval(runtime.database, approvalId);

export const currentApprovalForWorkItem = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Approval | null => loadCurrentApprovalForWorkItem(runtime.database, workItemId);

export const taskRowsForApproval = (
  runtime: CoordinatorRuntime,
  approvalId: Approval["id"],
): readonly { id: ExecutionTaskId; state: ExecutionTask["state"] }[] =>
  loadTaskStatesForApproval(runtime.database, approvalId)
    .map(([id, state]) => ({ id, state }));

export const signedPlanBytes = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<Uint8Array> => {
  const workItem = getWorkItem(runtime, approval.workItemId);
  const plan = getArtifact(runtime, approval.planArtifactRefId);
  return readCommittedFile(
    workItem.repositoryRoot,
    approval.baselineCommit,
    plan.repositoryPath,
  );
};

export const canonicalTasksForApproval = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<readonly ExecutionTask[]> => {
  const planBytes = await signedPlanBytes(runtime, approval);
  return taskRowsForApproval(runtime, approval.id).map((row) =>
    reconstructExecutionTask(runtime.database, row.id, planBytes),
  );
};

export const listExecutionTasks = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<readonly ExecutionTask[]> => {
  const approvals = loadApprovalsForWorkItem(runtime.database, workItemId);
  const result: ExecutionTask[] = [];
  for (const approval of approvals) {
    result.push(...await canonicalTasksForApproval(runtime, approval));
  }
  return result;
};

export const inspectCurrentFileArtifact = async (
  workItem: WorkItem,
  path: RepositoryPath,
  role: ArtifactRef["role"],
  authorityLayer: ArtifactRef["authorityLayer"],
): Promise<ArtifactRef> => {
  const bytes = readWorkingTreeFile(workItem.repositoryRoot, path);
  const digest = sha256(bytes);
  const head = await resolveHeadCommit(workItem.repositoryRoot);
  let gitCommit: GitCommit | null = null;
  try {
    const committed = await readCommittedFile(workItem.repositoryRoot, head, path);
    if (byteEqual(bytes, committed)) gitCommit = head;
  } catch {
    gitCommit = null;
  }
  return ArtifactRefSchema.parse({
    id: newArtifactRefId(),
    workItemId: workItem.id,
    repositoryPath: path,
    role,
    authorityLayer,
    sha256: digest,
    gitCommit,
  });
};

export const currentFileArtifact = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  path: RepositoryPath,
  role: ArtifactRef["role"],
  authorityLayer: ArtifactRef["authorityLayer"],
): Promise<ArtifactRef> => {
  const inspected = await inspectCurrentFileArtifact(
    workItem,
    path,
    role,
    authorityLayer,
  );
  const existing = findArtifactSnapshot(runtime.database, {
    workItemId: inspected.workItemId,
    repositoryPath: inspected.repositoryPath,
    role: inspected.role,
    authorityLayer: inspected.authorityLayer,
    sha256: inspected.sha256,
    gitCommit: inspected.gitCommit,
  });
  if (existing !== null) return existing;
  storeArtifact(runtime.database, inspected);
  return inspected;
};

export type ResolvedContext = Readonly<{
  source: WorkItemSourceSnapshot;
  artifacts: readonly ArtifactRef[];
  p1Paths: readonly RepositoryPath[];
  contextHash: Sha256;
}>;

const resolvedContext = (
  workItem: WorkItem,
  source: WorkItemSourceSnapshot,
  stage: PreSignoffStage,
  artifacts: readonly ArtifactRef[],
): ResolvedContext => {
  const resolved = deduplicateArtifacts(artifacts);
  return {
    source,
    artifacts: resolved,
    p1Paths: resolved
      .filter((artifact) => artifact.authorityLayer === "P1")
      .map((artifact) => artifact.repositoryPath),
    contextHash: sha256Text(
      canonicalJson({
        stage,
        workItemId: workItem.id,
        sourceSha256: workItem.sourceSha256,
        materialArtifacts: sortedMaterialProjection(resolved),
      }),
    ),
  };
};

export type StageContextResolution = Readonly<{
  context: ResolvedContext;
  staleStage: PreSignoffStage | null;
}>;

export type StageConformanceResolution = Readonly<{
  context: ResolvedContext;
  outputs: readonly ArtifactRef[];
  staleStage: PreSignoffStage | null;
}>;

const currentArtifactBytesMatch = (
  workItem: WorkItem,
  artifact: ArtifactRef,
): boolean => {
  try {
    return sha256(
      readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath),
    ) === artifact.sha256;
  } catch {
    return false;
  }
};

const lifecycleRoleOrder = ["R1", "R2", "DESIGN", "PLAN", "R3"] as const;
type LifecycleRole = (typeof lifecycleRoleOrder)[number];

const artifactsForIds = (
  runtime: CoordinatorRuntime,
  ids: readonly ArtifactRefId[],
  role: LifecycleRole,
): readonly ArtifactRef[] =>
  ids
    .map((id) => getArtifact(runtime, id))
    .filter((artifact) => artifact.role === role);

const latestRunCandidateArtifacts = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  role: LifecycleRole,
): readonly ArtifactRef[] => {
  const runs = listRuns(runtime, workItemId)
    .filter((run) => run.role === "STAGE" && run.stage === role)
    .reverse();
  const latest = runs[0];
  if (latest !== undefined) {
    const events = listRunEvents(runtime, latest.id);

    const conformance = events.findLast((event) =>
      event.event.tag === "CONFORMANCE_PASSED" &&
      event.event.stage === role
    );
    if (conformance?.event.tag === "CONFORMANCE_PASSED") {
      const artifacts = artifactsForIds(
        runtime,
        conformance.event.outputArtifactRefIds,
        role,
      );
      if (artifacts.length > 0) return artifacts;
    }

    const completion = events.findLast((event) =>
      event.event.tag === "STAGE_COMPLETED" &&
      event.event.completion.stage === role
    );
    if (completion?.event.tag === "STAGE_COMPLETED") {
      const artifacts = artifactsForIds(
        runtime,
        completion.event.artifactRefIds,
        role,
      );
      if (artifacts.length > 0) return artifacts;
    }

    const adopted = events
      .filter((event) =>
        event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
        event.event.disposition === "ADOPTED" &&
        event.event.adoptedArtifactRefId !== null
      )
      .flatMap((event) =>
        event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
        event.event.adoptedArtifactRefId !== null
          ? [event.event.adoptedArtifactRefId]
          : [])
      .map((id) => getArtifact(runtime, id))
      .filter((artifact) => artifact.role === role);
    if (adopted.length > 0) return deduplicateArtifacts(adopted);
  }

  for (const run of runs) {
    const conformance = listRunEvents(runtime, run.id)
      .findLast((event) =>
        event.event.tag === "CONFORMANCE_PASSED" &&
        event.event.stage === role
      );
    if (conformance?.event.tag !== "CONFORMANCE_PASSED") continue;
    const artifacts = artifactsForIds(
      runtime,
      conformance.event.outputArtifactRefIds,
      role,
    );
    if (artifacts.length > 0) return artifacts;
  }
  return [];
};

export const currentStageDraftArtifacts = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
): Promise<readonly ArtifactRef[]> => {
  if (stage === "R3") return [];
  const candidates = latestRunCandidateArtifacts(runtime, workItem.id, stage);
  const semantic = new Map<string, ArtifactRef>();
  for (const candidate of candidates) {
    if (
      !candidate.repositoryPath.endsWith(".md") ||
      currentArtifactBytesMatch(workItem, candidate)
    ) {
      continue;
    }
    const key = canonicalJson([
      candidate.repositoryPath,
      candidate.role,
      candidate.authorityLayer,
    ]);
    semantic.set(key, candidate);
  }

  const drafts: ArtifactRef[] = [];
  for (const candidate of semantic.values()) {
    try {
      drafts.push(await currentFileArtifact(
        runtime,
        workItem,
        candidate.repositoryPath,
        candidate.role,
        candidate.authorityLayer,
      ));
    } catch {
      // Missing/non-regular historical outputs have no current draft to review.
    }
  }
  return deduplicateArtifacts(drafts);
};

export const currentLifecycleArtifacts = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<readonly ArtifactRef[]> => {
  const workItem = getWorkItem(runtime, workItemId);
  const materialized: ArtifactRef[] = [];

  for (const role of lifecycleRoleOrder) {
    const candidates = latestRunCandidateArtifacts(runtime, workItemId, role);
    const semantic = new Map<string, ArtifactRef>();
    for (const candidate of candidates) {
      if (!candidate.repositoryPath.endsWith(".md")) continue;
      const key = canonicalJson([
        candidate.repositoryPath,
        candidate.role,
        candidate.authorityLayer,
      ]);
      semantic.set(key, candidate);
    }

    for (const candidate of semantic.values()) {
      try {
        materialized.push(await currentFileArtifact(
          runtime,
          workItem,
          candidate.repositoryPath,
          candidate.role,
          candidate.authorityLayer,
        ));
      } catch {
        // Missing/non-regular lifecycle Markdown is not a current snapshot.
      }
    }
  }

  const roleRank = new Map(lifecycleRoleOrder.map((role, index) => [role, index] as const));
  return [...deduplicateArtifacts(materialized)].sort((left, right) => {
    const leftRank = roleRank.get(left.role as LifecycleRole) ?? 99;
    const rightRank = roleRank.get(right.role as LifecycleRole) ?? 99;
    if (leftRank !== rightRank) return leftRank - rightRank;
    if (left.repositoryPath !== right.repositoryPath) {
      return left.repositoryPath < right.repositoryPath ? -1 : 1;
    }
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  });
};

export const resolveStageContextState = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
): Promise<StageContextResolution> => {
  const validated = await revalidateWorkItemSource(runtime, workItem.id);
  workItem = validated.workItem;
  const source = validated.source;
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  if (manifest.projectId !== workItem.projectId) {
    throw new TypeError("WorkItem projectId no longer matches pontivus-order.toml");
  }

  const sources = await resolveAuthoritySources(workItem.repositoryRoot, manifest);
  const artifacts: ArtifactRef[] = [];
  for (const layer of authorityLayersForStage(stage)) {
    for (const path of sources[layer]) {
      artifacts.push(
        await currentFileArtifact(
          runtime,
          workItem,
          path,
          "GOVERNANCE",
          authorityLayerForManifestLayer(layer),
        ),
      );
    }
  }

  artifacts.push(
    await currentFileArtifact(
      runtime,
      workItem,
      normalizeRepositoryPath("pontivus-order.toml"),
      "PROJECT_MANIFEST",
      null,
    ),
  );

  for (const path of await resolveConcernAuthoritySources(
    workItem.repositoryRoot,
    manifest,
    workItem.concernIds,
  )) {
    artifacts.push(
      await currentFileArtifact(runtime, workItem, path, "GOVERNANCE", null),
    );
  }

  if (stage === "PLAN" || stage === "R3") {
    for (const gate of Object.values(manifest.verification)) {
      for (const path of await expandRepositoryPatterns(
        workItem.repositoryRoot,
        gate.materialRefs,
      )) {
        artifacts.push(
          await currentFileArtifact(
            runtime,
            workItem,
            path,
            "VERIFICATION_MATERIAL",
            null,
          ),
        );
      }
    }
  }

  for (const priorStage of priorStagesForStage(stage)) {
    const conformance = await resolveStageConformanceState(
      runtime,
      workItem,
      priorStage,
    );
    if (conformance.staleStage !== null) {
      return {
        context: resolvedContext(workItem, source, stage, artifacts),
        staleStage: conformance.staleStage,
      };
    }
    artifacts.push(...conformance.outputs);
  }

  return {
    context: resolvedContext(workItem, source, stage, artifacts),
    staleStage: null,
  };
};

export const resolveStageConformanceState = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
): Promise<StageConformanceResolution> => {
  const state = await resolveStageContextState(runtime, workItem, stage);
  if (state.staleStage !== null) {
    return { context: state.context, outputs: [], staleStage: state.staleStage };
  }

  const latestRun = [...listRuns(runtime, workItem.id)]
    .reverse()
    .find((run) => run.role === "STAGE" && run.stage === stage);
  if (latestRun === undefined) {
    return { context: state.context, outputs: [], staleStage: stage };
  }

  const conformance = listRunEvents(runtime, latestRun.id)
    .findLast((event) =>
      event.event.tag === "CONFORMANCE_PASSED" &&
      event.event.stage === stage
    );
  if (
    conformance === undefined ||
    conformance.event.tag !== "CONFORMANCE_PASSED" ||
    conformance.event.contextHash !== state.context.contextHash
  ) {
    return { context: state.context, outputs: [], staleStage: stage };
  }

  const outputs = conformance.event.outputArtifactRefIds.map((id) =>
    getArtifact(runtime, id)
  );
  if (
    outputs.some((artifact) =>
      artifact.workItemId !== workItem.id ||
      artifact.role !== artifactRoleForStage(stage) ||
      !currentArtifactBytesMatch(workItem, artifact)
    )
  ) {
    return { context: state.context, outputs: [], staleStage: stage };
  }

  return { context: state.context, outputs, staleStage: null };
};

export const resolveStageContext = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
): Promise<ResolvedContext> => {
  const state = await resolveStageContextState(runtime, workItem, stage);
  if (state.staleStage !== null) {
    throw new TypeError(
      `current upstream conformance is missing or stale: ${state.staleStage}`,
    );
  }
  return state.context;
};

export const dependencyClosure = (
  runtime: CoordinatorRuntime,
  rootId: ArtifactRefId,
): readonly ArtifactRefId[] => {
  const rows = loadArtifactDependencyEdges(runtime.database);
  const dependencies = new Map<ArtifactRefId, ArtifactRefId[]>();
  for (const [artifactRefId, dependsOnArtifactRefId] of rows) {
    dependencies.set(artifactRefId, [
      ...(dependencies.get(artifactRefId) ?? []),
      dependsOnArtifactRefId,
    ]);
  }

  const result = new Set<ArtifactRefId>();
  const visit = (id: ArtifactRefId): void => {
    for (const dependency of dependencies.get(id) ?? []) {
      if (result.has(dependency)) continue;
      result.add(dependency);
      visit(dependency);
    }
  };
  visit(rootId);
  return [...result].sort();
};

export const approvalClosure = (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Readonly<{
  plan: ArtifactRef;
  r3: ArtifactRef;
  material: readonly ArtifactRef[];
}> => {
  const plan = getArtifact(runtime, approval.planArtifactRefId);
  const r3 = getArtifact(runtime, approval.r3ArtifactRefId);
  const ids = dependencyClosure(runtime, r3.id);
  if (!ids.includes(plan.id)) {
    throw new TypeError("R3 dependency closure does not contain the signed PLAN");
  }
  const material = ids
    .filter((id) => id !== plan.id && id !== r3.id)
    .map((id) => getArtifact(runtime, id));
  return { plan, r3, material };
};

export const verifyApprovalClosureBytes = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<Readonly<{
  plan: ArtifactRef;
  r3: ArtifactRef;
  material: readonly ArtifactRef[];
}>> => {
  const workItem = getWorkItem(runtime, approval.workItemId);
  const closure = approvalClosure(runtime, approval);
  for (const artifact of [closure.plan, closure.r3, ...closure.material]) {
    if (
      artifact.workItemId !== workItem.id ||
      artifact.gitCommit !== approval.baselineCommit
    ) {
      throw new TypeError("approval closure contains artifact outside its baseline");
    }
    const bytes = await readCommittedFile(
      workItem.repositoryRoot,
      approval.baselineCommit,
      artifact.repositoryPath,
    );
    if (sha256(bytes) !== artifact.sha256) {
      throw new TypeError("approval closure bytes do not match ArtifactRef");
    }
  }
  return closure;
};

export const validateTaskDefinitions = async (
  workItem: WorkItem,
  manifest: ProjectManifest,
  closureArtifacts: readonly ArtifactRef[],
  planBytes: Uint8Array,
): Promise<void> => {
  await validateProjectManifestResolution(workItem.repositoryRoot, manifest);
  const block = parseSignedTaskBlockFromPlan(planBytes);
  const materialPaths = new Set(
    closureArtifacts.map((artifact) => artifact.repositoryPath),
  );

  for (const task of block.tasks) {
    for (const gateId of task.gateIds) {
      if (manifest.verification[gateId] === undefined) {
        throw new TypeError(`signed task references unresolved gate: ${gateId}`);
      }
    }
    for (const concernId of task.concernIds) {
      if (manifest.concerns[concernId] === undefined) {
        throw new TypeError(`signed task references unresolved concern: ${concernId}`);
      }
    }
    const signedGateIds = new Set(task.gateIds);
    for (const gateId of resolveConcernGateIds(manifest, task.concernIds)) {
      if (!signedGateIds.has(gateId)) {
        throw new TypeError(`signed task omits concern-required gate: ${gateId}`);
      }
    }
    for (const authorityRef of [...task.acceptanceRefs, ...task.authorityRefs]) {
      resolveAuthorityRef(manifest, authorityRef);
    }
    for (const path of task.changeSurface) {
      if (!task.scope.some((pattern) => repositoryPatternMatches(pattern, path))) {
        throw new TypeError(`changeSurface path is outside signed scope: ${path}`);
      }
      if (task.exclusions.some((pattern) => repositoryPatternMatches(pattern, path))) {
        throw new TypeError(`changeSurface path is excluded: ${path}`);
      }
      if (materialPaths.has(path)) {
        throw new TypeError(`changeSurface mutates signed material authority: ${path}`);
      }
    }
  }
};

export const approvalContext = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
  task: ExecutionTask,
  role: Exclude<RunRole, "STAGE">,
): Promise<ResolvedContext> => {
  const validated = await revalidateWorkItemSource(runtime, approval.workItemId);
  if (validated.workItem.sourceSha256 !== approval.sourceSha256) {
    throw new TypeError("current WorkItem source no longer matches Approval");
  }
  const closure = approvalClosure(runtime, approval);
  const material = deduplicateArtifacts([closure.plan, ...closure.material]);
  const contextHash = sha256Text(
    canonicalJson({
      stage: "EXECUTION",
      role,
      workItemId: approval.workItemId,
      sourceSha256: approval.sourceSha256,
      task,
      materialArtifacts: sortedMaterialProjection(material),
    }),
  );
  return {
    source: validated.source,
    artifacts: material,
    p1Paths: material
      .filter((artifact) => artifact.authorityLayer === "P1")
      .map((artifact) => artifact.repositoryPath),
    contextHash,
  };
};

const currentApprovalMaterialSet = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<readonly ArtifactRef[]> => {
  const workItem = getWorkItem(runtime, approval.workItemId);
  const closure = approvalClosure(runtime, approval);
  const signed = deduplicateArtifacts([closure.plan, closure.r3, ...closure.material]);
  const signedManifest = signed.find(
    (artifact) => artifact.role === "PROJECT_MANIFEST",
  );
  if (signedManifest === undefined) {
    throw new TypeError("Approval closure does not contain the project manifest");
  }

  const currentManifestBytes = readWorkingTreeFile(
    workItem.repositoryRoot,
    signedManifest.repositoryPath,
  );
  if (sha256(currentManifestBytes) !== signedManifest.sha256) {
    return [
      await inspectCurrentFileArtifact(
        workItem,
        signedManifest.repositoryPath,
        "PROJECT_MANIFEST",
        null,
      ),
    ];
  }

  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  if (manifest.projectId !== workItem.projectId) {
    throw new TypeError("WorkItem projectId no longer matches pontivus-order.toml");
  }

  const current: ArtifactRef[] = [];
  const sources = await resolveAuthoritySources(workItem.repositoryRoot, manifest);
  for (const layer of authorityLayersForStage("R3")) {
    for (const path of sources[layer]) {
      current.push(
        await inspectCurrentFileArtifact(
          workItem,
          path,
          "GOVERNANCE",
          authorityLayerForManifestLayer(layer),
        ),
      );
    }
  }
  current.push(
    await inspectCurrentFileArtifact(
      workItem,
      normalizeRepositoryPath("pontivus-order.toml"),
      "PROJECT_MANIFEST",
      null,
    ),
  );
  for (const path of await resolveConcernAuthoritySources(
    workItem.repositoryRoot,
    manifest,
    workItem.concernIds,
  )) {
    current.push(
      await inspectCurrentFileArtifact(workItem, path, "GOVERNANCE", null),
    );
  }
  for (const gate of Object.values(manifest.verification)) {
    for (const path of await expandRepositoryPatterns(
      workItem.repositoryRoot,
      gate.materialRefs,
    )) {
      current.push(
        await inspectCurrentFileArtifact(
          workItem,
          path,
          "VERIFICATION_MATERIAL",
          null,
        ),
      );
    }
  }

  for (const artifact of signed) {
    if (
      artifact.role === "R1" ||
      artifact.role === "R2" ||
      artifact.role === "DESIGN" ||
      artifact.role === "PLAN" ||
      artifact.role === "R3"
    ) {
      current.push(
        await inspectCurrentFileArtifact(
          workItem,
          artifact.repositoryPath,
          artifact.role,
          artifact.authorityLayer,
        ),
      );
    }
  }

  return deduplicateArtifacts(current);
};

export const approvalFreshness = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<Readonly<{
  fresh: boolean;
  changedOwners: readonly ("R1" | "R2" | "DESIGN" | "PLAN" | "R3")[];
}>> => {
  try {
    const validated = await revalidateWorkItemSource(runtime, approval.workItemId);
    if (validated.workItem.sourceSha256 !== approval.sourceSha256) {
      return { fresh: false, changedOwners: ["R1"] };
    }
  } catch (error) {
    if (isSourceBoundaryFailure(error)) {
      return { fresh: false, changedOwners: ["R1"] };
    }
    throw error;
  }

  const closure = approvalClosure(runtime, approval);
  const signed = deduplicateArtifacts([closure.plan, closure.r3, ...closure.material]);
  const current = await currentApprovalMaterialSet(runtime, approval);

  if (approvalMaterialIsFresh(signed, current)) {
    return { fresh: true, changedOwners: [] };
  }

  const signedByIdentity = new Map(
    signed.map((artifact) => [artifactSemanticIdentityKey(artifact), artifact] as const),
  );
  const currentByIdentity = new Map(
    current.map((artifact) => [artifactSemanticIdentityKey(artifact), artifact] as const),
  );
  const identities = new Set([
    ...signedByIdentity.keys(),
    ...currentByIdentity.keys(),
  ]);
  const changedOwners: ("R1" | "R2" | "DESIGN" | "PLAN" | "R3")[] = [];

  for (const identity of identities) {
    const signedArtifact = signedByIdentity.get(identity);
    const currentArtifact = currentByIdentity.get(identity);
    if (
      signedArtifact !== undefined &&
      currentArtifact !== undefined &&
      signedArtifact.sha256 === currentArtifact.sha256
    ) {
      continue;
    }
    const changedArtifact = currentArtifact ?? signedArtifact;
    if (changedArtifact !== undefined) {
      changedOwners.push(artifactReturnOwner(changedArtifact));
    }
  }

  return {
    fresh: false,
    changedOwners: [...new Set(changedOwners)],
  };
};

export const approvalChangedOwners = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<readonly ("R1" | "R2" | "DESIGN" | "PLAN" | "R3")[]> =>
  (await approvalFreshness(runtime, approval)).changedOwners;

export const currentMaterialFresh = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<boolean> => (await approvalFreshness(runtime, approval)).fresh;

export const latestR3Root = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): ArtifactRef => {
  const runs = listRuns(runtime, workItemId)
    .filter((run) => run.stage === "R3" && run.role === "STAGE")
    .reverse();
  for (const run of runs) {
    const conformance = listRunEvents(runtime, run.id)
      .findLast((event) =>
        event.event.tag === "CONFORMANCE_PASSED" &&
        event.event.stage === "R3"
      );
    if (
      conformance !== undefined &&
      conformance.event.tag === "CONFORMANCE_PASSED"
    ) {
      const roots = conformance.event.outputArtifactRefIds
        .map((id) => getArtifact(runtime, id))
        .filter((artifact) => artifact.role === "R3");
      if (roots.length !== 1) {
        throw new TypeError("R3 conformance must own exactly one R3 root ArtifactRef");
      }
      const root = roots[0];
      if (root === undefined) throw new TypeError("R3 conformance root is missing");
      return root;
    }
  }
  throw new TypeError("no conformed R3 root exists for sign-off");
};

export const rematerializeCommittedApprovalClosure = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  baselineCommit: GitCommit,
  priorR3: ArtifactRef,
): Promise<Readonly<{
  plan: ArtifactRef;
  r3: ArtifactRef;
  material: readonly ArtifactRef[];
}>> => {
  const priorIds = [priorR3.id, ...dependencyClosure(runtime, priorR3.id)];
  const priorArtifacts = priorIds.map((id) => getArtifact(runtime, id));
  const priorPlans = priorArtifacts.filter((artifact) => artifact.role === "PLAN");
  if (priorPlans.length !== 1) {
    throw new TypeError("R3 closure must contain exactly one PLAN root");
  }
  const priorPlan = priorPlans[0];
  if (priorPlan === undefined) throw new TypeError("R3 closure PLAN root is missing");
  const idMap = new Map<ArtifactRefId, ArtifactRef>();

  for (const prior of priorArtifacts) {
    const bytes = await readCommittedFile(
      workItem.repositoryRoot,
      baselineCommit,
      prior.repositoryPath,
    );
    const digest = sha256(bytes);
    if (digest !== prior.sha256) {
      throw new TypeError(
        `committed sign-off bytes differ from conformed ArtifactRef: ${prior.repositoryPath}`,
      );
    }

    const existing = findArtifactSnapshot(runtime.database, {
      workItemId: workItem.id,
      repositoryPath: prior.repositoryPath,
      role: prior.role,
      authorityLayer: prior.authorityLayer,
      sha256: digest,
      gitCommit: baselineCommit,
    });
    const committed = existing === null
      ? ArtifactRefSchema.parse({
          id: newArtifactRefId(),
          workItemId: workItem.id,
          repositoryPath: prior.repositoryPath,
          role: prior.role,
          authorityLayer: prior.authorityLayer,
          sha256: digest,
          gitCommit: baselineCommit,
        })
      : existing;

    if (existing === null) {
      storeArtifact(runtime.database, committed);
    }
    idMap.set(prior.id, committed);
  }

  const priorEdges = loadArtifactDependencyEdgesForOwners(
    runtime.database,
    priorIds,
  );

  for (const edge of priorEdges) {
    const owner = idMap.get(edge[0]);
    const dependency = idMap.get(edge[1]);
    if (owner === undefined || dependency === undefined) continue;
    storeArtifactDependency(runtime.database, owner.id, dependency.id);
  }

  const r3 = idMap.get(priorR3.id);
  const plan = idMap.get(priorPlan.id);
  if (r3 === undefined || plan === undefined) {
    throw new TypeError("committed sign-off closure rematerialization failed");
  }
  const material = dependencyClosure(runtime, r3.id)
    .filter((id) => id !== plan.id && id !== r3.id)
    .map((id) => getArtifact(runtime, id));
  return { plan, r3, material };
};

export const computeSignoffPackage = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<Readonly<{
  baselineCommit: GitCommit;
  packageHash: Sha256;
  sourceSha256: Sha256;
  plan: ArtifactRef;
  r3: ArtifactRef;
  material: readonly ArtifactRef[];
  taskBlock: ReturnType<typeof parseSignedTaskBlockFromPlan>;
}>> => {
  const validatedSource = await revalidateWorkItemSource(runtime, workItemId);
  const workItem = validatedSource.workItem;
  if (workItem.stage !== "AWAITING_SIGNOFF" || workItem.status !== "ACTIVE") {
    throw new TypeError("WorkItem is not awaiting sign-off");
  }
  const currentR3 = await resolveStageConformanceState(runtime, workItem, "R3");
  if (currentR3.staleStage !== null || currentR3.outputs.length !== 1) {
    const returnTo = currentR3.staleStage ?? "R3";
    withTransaction(runtime.database, () => {
      updateWorkItemLifecycle(runtime.database, workItem.id, {
        stage: returnTo,
        status: "ACTIVE",
        outcome: null,
      });
    });
    throw new TypeError(
      `current R3 conformance is missing or stale: ${returnTo}`,
    );
  }
  const r3Root = currentR3.outputs[0];
  if (r3Root === undefined) throw new TypeError("current R3 root is missing");
  const conformedClosure = deduplicateArtifacts([
    r3Root,
    ...dependencyClosure(runtime, r3Root.id).map((id) => getArtifact(runtime, id)),
  ]);
  const currentMaterial = deduplicateArtifacts([
    ...currentR3.context.artifacts,
    r3Root,
  ]);
  if (!approvalMaterialIsFresh(conformedClosure, currentMaterial)) {
    throw new TypeError("R3 dependency closure does not match the current resolved material set");
  }

  const baselineCommit = await resolveHeadCommit(workItem.repositoryRoot);
  const committedClosure = await rematerializeCommittedApprovalClosure(
    runtime,
    workItem,
    baselineCommit,
    r3Root,
  );
  const { plan, r3, material } = committedClosure;

  for (const artifact of [plan, r3, ...material]) {
    if (artifact.gitCommit !== baselineCommit) {
      throw new TypeError("sign-off material is not committed at the selected baseline");
    }
    const bytes = await readCommittedFile(
      workItem.repositoryRoot,
      baselineCommit,
      artifact.repositoryPath,
    );
    if (sha256(bytes) !== artifact.sha256) {
      throw new TypeError("sign-off material bytes do not match their ArtifactRef");
    }
    const workingBytes = readWorkingTreeFile(
      workItem.repositoryRoot,
      artifact.repositoryPath,
    );
    if (sha256(workingBytes) !== artifact.sha256) {
      throw new TypeError(
        `sign-off material has uncommitted or stale working-tree bytes: ${artifact.repositoryPath}`,
      );
    }
  }

  const planBytes = await readCommittedFile(
    workItem.repositoryRoot,
    baselineCommit,
    plan.repositoryPath,
  );
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  await validateTaskDefinitions(
    workItem,
    manifest,
    [plan, r3, ...material],
    planBytes,
  );
  const packageHash = sha256Text(
    canonicalApprovalPackageJson({
      workItemId: workItem.id,
      baselineCommit,
      sourceSha256: workItem.sourceSha256,
      plan,
      r3,
      materialArtifacts: material,
    }),
  );
  const taskBlock = parseSignedTaskBlockFromPlan(planBytes);
  return {
    baselineCommit,
    packageHash,
    sourceSha256: workItem.sourceSha256,
    plan,
    r3,
    material,
    taskBlock,
  };
};

export const signoffPackageForWorkItem = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<SignoffPackage> => {
  const prepared = await computeSignoffPackage(runtime, workItemId);
  return SignoffPackageSchema.parse({
    baselineCommit: prepared.baselineCommit,
    packageHash: prepared.packageHash,
    sourceSha256: prepared.sourceSha256,
    taskBlock: prepared.taskBlock,
  });
};

export const signOffWorkItem = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  expectedPackageHash: Sha256,
  approvedBy: string,
): Promise<Approval> => {
  if (approvedBy.length === 0) throw new TypeError("approvedBy must be non-empty");
  const prepared = await computeSignoffPackage(runtime, workItemId);
  if (prepared.packageHash !== expectedPackageHash) {
    throw new TypeError("expectedPackageHash does not match the current sign-off package");
  }
  const block = prepared.taskBlock;
  const approval = ApprovalSchema.parse({
    id: newApprovalId(),
    workItemId,
    baselineCommit: prepared.baselineCommit,
    packageHash: prepared.packageHash,
    planArtifactRefId: prepared.plan.id,
    r3ArtifactRefId: prepared.r3.id,
    sourceSha256: prepared.sourceSha256,
    approvedBy,
    approvedAt: nowIsoDateTime(),
  });
  const taskIds = block.tasks.map(() => newExecutionTaskId());
  const tasks = materializeExecutionTasks(approval.id, block, taskIds);

  withTransaction(runtime.database, () => {
    storeApproval(runtime.database, approval);
    for (const task of tasks) {
      storeExecutionTask(runtime.database, task);
    }
    updateWorkItemLifecycle(runtime.database, workItemId, {
      stage: "EXECUTION",
      status: "ACTIVE",
      outcome: null,
    });
  });
  return approval;
};
