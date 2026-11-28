import {
  type Approval,
  type CandidateReviewEvent,
  type CandidateReviewEventId,
  type Run,
  type RunEventId,
  ApprovalSchema,
  type AuthorityRef,
  AuthorityRefSchema,
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
  type UpstreamReturnStage,
  UpstreamReturnStageSchema,
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
  admittedStageCompletion,
  admittedTerminalR1Artifact,
  candidateFindingDispositions,
  candidateMembershipCanonicalJson,
  verifyCandidateRoundHashes,
  orderedCandidateReviewEvents,
  candidateSubmissionEvents,
  linkedSubmission,
  reconstructCandidateRounds,
  artifactReturnOwner,
  routeApprovalStale,
  transitionWorkItem,
} from "../core/lifecycle.ts";
import {
  approvalMaterialIsFresh,
  artifactRoleForStage,
  authorityLayerForManifestLayer,
  deduplicateArtifacts,
  deduplicateArtifactsPreservingOrder,
  projectAuthorityForSources,
  resolveProjectAuthority,
  resolveAuthorityRefClosure,
  type PreSignoffStage,
  type ResolvedProjectAuthority,
  priorStagesForStage,
  sortedMaterialProjection,
} from "../core/governance.ts";
import {
  admitSignedTaskBlockForSchema,
  aggregateTaskCompletion,
  materializeExecutionTasks,
  parseSignedTaskBlockFromPlan,
} from "../core/execution.ts";
import {
  allowedR1CompletionsForSchema,
  stageTemplateForSchema,
  stageDocumentAuthorityRefs,
  authorityDispositionOwnerRefs,
  workItemDocumentPath,
} from "../core/work-item-source.ts";
import {
  expandRepositoryPatterns,
  loadValidatedProjectManifest,
  parseProjectManifestText,
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
  blockExecutionTasksForApproval,
  loadApproval,
  loadApprovalsForWorkItem,
  loadCandidateReviewEvents,
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
import {
  type CoordinatorRuntime,
  withWorkItemOperatorMutation,
} from "./runtime.ts";
import { getRun, getRunEvent, listRunEvents, listRuns, validatePayloadEvidence } from "./run.ts";
import {
  currentWorkItemSource,
  isSourceBoundaryFailure,
  revalidateWorkItemSource,
} from "./work-item-source.ts";

const STALE_AUTHORITY_FAILURE = "STALE_AUTHORITY";

type StaleAuthorityFailure = TypeError & Readonly<{
  orderCode: typeof STALE_AUTHORITY_FAILURE;
  staleAuthorityOwner: UpstreamReturnStage;
}>;

const staleAuthorityFailure = (
  staleAuthorityOwner: UpstreamReturnStage,
  message: string,
): StaleAuthorityFailure =>
  Object.assign(new TypeError(message), {
    orderCode: STALE_AUTHORITY_FAILURE as typeof STALE_AUTHORITY_FAILURE,
    staleAuthorityOwner: UpstreamReturnStageSchema.parse(staleAuthorityOwner),
  });

const isStaleAuthorityFailure = (
  error: unknown,
): error is StaleAuthorityFailure =>
  error instanceof TypeError &&
  "orderCode" in error &&
  (error as { orderCode?: unknown }).orderCode === STALE_AUTHORITY_FAILURE &&
  "staleAuthorityOwner" in error &&
  UpstreamReturnStageSchema.safeParse(
    (error as { staleAuthorityOwner?: unknown }).staleAuthorityOwner,
  ).success;

export const staleAuthorityOwnerForFailure = (
  error: unknown,
): UpstreamReturnStage | null =>
  isStaleAuthorityFailure(error)
    ? UpstreamReturnStageSchema.parse(error.staleAuthorityOwner)
    : null;

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

// Observational reads are distinct from the internal execution-owner lookup.
export const observeCurrentApproval = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<Approval | null> => {
  const workItem = getWorkItem(runtime, workItemId);
  if (workItem.stage !== "EXECUTION" && workItem.stage !== "AWAITING_ACCEPTANCE" && workItem.stage !== "COMPLETE") return null;
  if (workItem.stage === "COMPLETE") {
    const runs = listRuns(runtime, workItemId);
    const terminalR1 = admittedTerminalR1Artifact(
      workItem,
      runs,
      runs.flatMap((run) => listRunEvents(runtime, run.id)),
      listArtifacts(runtime, workItemId),
      allowedR1CompletionsForSchema(workItem.schemaId),
    );
    if (terminalR1 !== null) return null;
  }
  const approval = currentApprovalForWorkItem(runtime, workItemId);
  if (approval === null) throw new TypeError("required current or final Approval is missing");
  if (workItem.stage === "COMPLETE") {
    const bytes = await signedPlanBytes(runtime, approval);
    const plan = getArtifact(runtime, approval.planArtifactRefId);
    if (plan.workItemId !== workItemId || plan.role !== "PLAN" ||
        plan.gitCommit !== approval.baselineCommit || sha256(bytes) !== plan.sha256) {
      throw new TypeError("final Approval PLAN identity is inconsistent");
    }
    const block = admitSignedTaskBlockForSchema(workItem.schemaId, parseSignedTaskBlockFromPlan(bytes));
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const ids = new Set(tasks.map((task) => task.planTaskId));
    const aggregate = aggregateTaskCompletion(tasks);
    if (tasks.length !== block.tasks.length || ids.size !== tasks.length ||
        !block.tasks.every((task) => ids.has(task.id)) ||
        !aggregate.complete || aggregate.outcome !== workItem.outcome) {
      throw new TypeError("final Approval lacks exact successful signed task completion evidence");
    }
  }
  return approval;
};

export const observeApprovalHistory = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): readonly Approval[] => {
  getWorkItem(runtime, workItemId);
  return loadApprovalsForWorkItem(runtime.database, workItemId);
};

const signedCriterionResolver = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
  closure: Awaited<ReturnType<typeof verifyApprovalClosureBytes>>,
): Promise<(ref: AuthorityRef) => ArtifactRef> => {
  const workItem = getWorkItem(runtime, approval.workItemId);
  const signed = [closure.plan, closure.r3, ...closure.material];
  const manifests = signed.filter(value => value.role === "PROJECT_MANIFEST");
  if (manifests.length !== 1) throw new TypeError("signed project manifest membership is inconsistent");
  const manifestBytes = await readCommittedFile(workItem.repositoryRoot, approval.baselineCommit, manifests[0]!.repositoryPath);
  // Keep parse/identity failures distinct from operational repository reads.
  let manifest: ProjectManifest;
  try {
    manifest = parseProjectManifestText(new TextDecoder("utf-8", { fatal: true }).decode(manifestBytes));
  } catch (error) {
    throw new TypeError("signed project manifest is invalid", { cause: error });
  }
  return (ref) => {
    const path = resolveAuthorityRef(manifest, ref);
    const matches = signed.filter(value => value.repositoryPath === path && value.role === "GOVERNANCE");
    if (matches.length !== 1) throw new TypeError("signed criterion does not resolve to an exact authority ArtifactRef");
    return matches[0]!;
  };
};

export const observeApprovalArtifacts = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  approvalId: Approval["id"],
  taskId?: ExecutionTaskId,
  acceptanceRef?: AuthorityRef,
): Promise<readonly ArtifactRef[]> => {
  getWorkItem(runtime, workItemId);
  const approval = getApproval(runtime, approvalId);
  if (approval.workItemId !== workItemId) throw new TypeError("Approval does not exist for WorkItem");
  if ((taskId === undefined) !== (acceptanceRef === undefined)) {
    throw new TypeError("criterion observation requires both task and reference");
  }
  const closure = await verifyApprovalClosureBytes(runtime, approval);
  if (closure.plan.role !== "PLAN" || closure.r3.role !== "R3") {
    throw new TypeError("Approval closure root identity is inconsistent");
  }
  if (taskId !== undefined && acceptanceRef !== undefined) {
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const task = tasks.find(value => value.id === taskId);
    if (task === undefined) throw new TypeError("execution task does not exist for Approval");
    if (!task.acceptanceRefs.includes(acceptanceRef)) {
      throw new TypeError("reference is not a signed acceptance criterion of this task");
    }
    const resolve = await signedCriterionResolver(runtime, approval, closure);
    return [resolve(acceptanceRef)];
  }
  return [...new Map([closure.plan, closure.r3, ...closure.material].map((artifact) =>
    [artifact.id, artifact] as const)).values()];
};

// History is an observational read independent of source or candidate availability.
export const observeCandidateReviewHistory = (
  runtime: CoordinatorRuntime, workItemId: WorkItemId, approvalId: Approval["id"],
): readonly CandidateReviewEvent[] => {
  getWorkItem(runtime, workItemId);
  const approval = getApproval(runtime, approvalId);
  if (approval.workItemId !== workItemId) throw new TypeError("Approval does not exist for WorkItem");
  return orderedCandidateReviewEvents(approvalId, loadCandidateReviewEvents(runtime.database, approvalId));
};

type AcceptanceObservationCode = "SOURCE_AUTHORITY_STALE" | "CANDIDATE_PROOF_UNAVAILABLE";
const acceptanceObservationFailure = (orderCode: AcceptanceObservationCode, message: string) =>
  Object.assign(new TypeError(message), { orderCode });

export const acceptanceObservationCodeForFailure = (error: unknown): AcceptanceObservationCode | null => {
  if (!(error instanceof TypeError) || !("orderCode" in error)) return null;
  return error.orderCode === "SOURCE_AUTHORITY_STALE" || error.orderCode === "CANDIDATE_PROOF_UNAVAILABLE" ? error.orderCode : null;
};

export const requireCurrentAcceptanceIdentity = (
  runtime: CoordinatorRuntime, workItemId: WorkItemId, approvalId: Approval["id"], sequence: number,
) => {
  const workItem = getWorkItem(runtime, workItemId);
  const approval = getApproval(runtime, approvalId);
  if (approval.workItemId !== workItemId) throw new TypeError("Approval does not exist for WorkItem");
  const history = observeCandidateReviewHistory(runtime, workItemId, approvalId);
  if (workItem.stage !== "AWAITING_ACCEPTANCE" || workItem.status !== "ACTIVE" ||
      currentApprovalForWorkItem(runtime, workItemId)?.id !== approvalId || history.length !== sequence ||
      history[0]?.event.tag !== "OPENED" ||
      history.some(value => value.event.tag === "ACCEPT" || value.event.tag === "REANALYSIS_REQUESTED")) {
    throw new TypeError("current Acceptance identity or review sequence changed");
  }
  const runs = listRuns(runtime, workItemId);
  if (runs.some(value => value.status === "RUNNING" || value.status === "WAITING_FOR_INPUT")) {
    throw new TypeError("current Acceptance has an active Run");
  }
  const rows = taskRowsForApproval(runtime, approvalId);
  if (rows.length === 0 || rows.some(value => value.state !== "CANDIDATE_DONE" && value.state !== "ALREADY_SATISFIED")) {
    throw new TypeError("current Acceptance task state is incoherent");
  }
  return { workItem, approval, history, runs, rows };
};

// A proof read never materializes a draft, a Run, a checkout or an event.
// Source/material diagnostics must precede candidate evidence diagnostics.
export const observeCurrentCandidateReview = async (
  runtime: CoordinatorRuntime, workItemId: WorkItemId, approvalId: Approval["id"], sequence: number,
) => {
  const before = requireCurrentAcceptanceIdentity(runtime, workItemId, approvalId, sequence);
  const { workItem, approval, history, runs } = before;
  const recheck = () => {
    const after = requireCurrentAcceptanceIdentity(runtime, workItemId, approvalId, sequence);
    if (canonicalJson(after) !== canonicalJson(before)) throw new TypeError("current Acceptance observation changed");
  };
  try {
    const source = await currentWorkItemSource(runtime, workItemId);
    if (source.sha256 !== approval.sourceSha256) {
      throw acceptanceObservationFailure("SOURCE_AUTHORITY_STALE", "signed WorkItem source changed");
    }
    const freshness = await approvalFreshness(runtime, approval);
    if (!freshness.fresh) {
      // A source change during material inspection must not become material R1.
      const currentSource = await currentWorkItemSource(runtime, workItemId);
      if (currentSource.sha256 !== approval.sourceSha256) throw acceptanceObservationFailure("SOURCE_AUTHORITY_STALE", "signed WorkItem source changed");
      throw staleAuthorityFailure(routeApprovalStale(freshness.changedOwners), "signed material authority changed");
    }
    const closure = await verifyApprovalClosureBytes(runtime, approval);
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const events = runs.flatMap(value => listRunEvents(runtime, value.id));
    let rounds: ReturnType<typeof reconstructCandidateRounds>;
    try {
      const resolve = await signedCriterionResolver(runtime, approval, closure);
      for (const task of tasks) {
        for (const ref of task.acceptanceRefs) resolve(ref);
      }
      rounds = reconstructCandidateRounds(approval, tasks, runs, events, history);
      verifyCandidateRoundHashes(history, new Map([...rounds].map(([id, members]) =>
        [id, sha256Text(candidateMembershipCanonicalJson(approval.id, members))])));
    } catch (error) {
      if (!(error instanceof TypeError) && !(error instanceof Error && error.name === "ZodError")) throw error;
      throw acceptanceObservationFailure("CANDIDATE_PROOF_UNAVAILABLE", error.message);
    }
    // Malformed stream semantics are a state conflict, not missing candidate proof.
    candidateFindingDispositions(history, rounds, tasks, runs, events);
    const required = new Set<RunEventId>();
    for (const members of rounds.values()) {
      for (const [, id] of members) {
        required.add(id);
        const member = events.find(value => value.id === id);
        if (member?.event.tag === "CANDIDATE_RECORDED") {
          required.add(member.event.candidateStateEventId);
          for (const validation of member.event.validationEventIds) required.add(validation);
          for (const event of events.filter(value => value.runId === member.runId && value.event.tag === "REVIEW_PASSED")) required.add(event.id);
        }
      }
    }
    for (const entry of history) {
      if (entry.event.tag === "REPORT" || entry.event.tag === "RETEST_FAILED") {
        for (const id of entry.event.evidence) required.add(id);
      }
    }
    try {
      for (const id of required) {
        const event = events.find(value => value.id === id);
        if (event === undefined) throw new TypeError("required candidate evidence event missing");
        validatePayloadEvidence(runtime, event.runId, event.event);
      }
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      throw acceptanceObservationFailure("CANDIDATE_PROOF_UNAVAILABLE", error.message);
    }
    recheck();
    return { approval, history, tasks, runs, runEvents: events, rounds };
  } catch (error) {
    recheck();
    throw error;
  }
};

export const observeCandidateReviewEvents = async (
  runtime: CoordinatorRuntime, workItemId: WorkItemId, approvalId: Approval["id"], sequence?: number,
): Promise<readonly CandidateReviewEvent[]> => sequence === undefined
  ? observeCandidateReviewHistory(runtime, workItemId, approvalId)
  : (await observeCurrentCandidateReview(runtime, workItemId, approvalId, sequence)).history;

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
  authority: ResolvedProjectAuthority;
  artifacts: readonly ArtifactRef[];
  p1Paths: readonly RepositoryPath[];
  contextHash: Sha256;
  qa?: Readonly<{ triggerEventId: RunEventId; events: readonly CandidateReviewEvent[] }>;
}>;

const resolvedContext = (
  workItem: WorkItem,
  source: WorkItemSourceSnapshot,
  stage: PreSignoffStage,
  authority: ResolvedProjectAuthority,
  artifacts: readonly ArtifactRef[],
): ResolvedContext => {
  const resolved = deduplicateArtifactsPreservingOrder(artifacts);
  return {
    source,
    authority,
    artifacts: resolved,
    p1Paths: resolved
      .filter((artifact) => artifact.authorityLayer === "P1")
      .map((artifact) => artifact.repositoryPath),
    contextHash: sha256Text(
      canonicalJson({
        stage,
        workItemId: workItem.id,
        sourceSha256: workItem.sourceSha256,
        resolvedAuthority: authority,
        materialArtifacts: sortedMaterialProjection(resolved),
      }),
    ),
  };
};

export const resolveCurrentStageAuthority = async (
  workItem: WorkItem,
  stage: PreSignoffStage,
): Promise<readonly [ProjectManifest, ResolvedProjectAuthority]> => {
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  if (manifest.projectId !== workItem.projectId) {
    throw new TypeError("WorkItem projectId no longer matches pontivus-order.toml");
  }
  const sources = await resolveAuthoritySources(workItem.repositoryRoot, manifest);
  return [
    manifest,
    resolveProjectAuthority(manifest, sources),
  ];
};


const bodyContainsAuthorityRef = (
  body: string,
  authorityRef: AuthorityRef,
): boolean =>
  body
    .split(/[^A-Za-z0-9_-]+/)
    .some((token) => token === authorityRef);

const stageTemplateAuthorityRefs = (
  workItem: WorkItem,
  stage: PreSignoffStage,
  authority: ResolvedProjectAuthority,
): readonly AuthorityRef[] => {
  const template = stageTemplateForSchema(workItem.schemaId, stage);
  if (template === null) return [];
  const reachable = new Set(authority.authorityRefs.map(([authorityRef]) => authorityRef));
  const required = stageDocumentAuthorityRefs(workItem.schemaId, stage, template);
  for (const authorityRef of required) {
    if (!reachable.has(authorityRef)) {
      throw new TypeError(
        "stage template AuthorityRef is not reachable in " + stage + " context: " + authorityRef,
      );
    }
  }
  return required;
};

const stageArtifactAuthorityRefs = (
  workItem: WorkItem,
  manifest: ProjectManifest,
  artifact: ArtifactRef,
): readonly AuthorityRef[] => {
  const role = artifact.role;
  if (role !== "R1" && role !== "R2" && role !== "DESIGN" && role !== "PLAN" && role !== "R3") {
    throw new TypeError("authority declarations require a lifecycle output");
  }
  if (
    artifact.workItemId !== workItem.id ||
    artifact.repositoryPath !== workItemDocumentPath(manifest.workItems.root, workItem.id, role)
  ) {
    throw new TypeError("authority declarations require the exact canonical WorkItem output");
  }
  const bytes = readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath);
  if (sha256(bytes) !== artifact.sha256) {
    throw new TypeError("authority declaration output bytes are stale");
  }
  const markdown = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return [
    ...stageDocumentAuthorityRefs(workItem.schemaId, role, markdown),
    ...authorityDispositionOwnerRefs(workItem.schemaId, role, markdown),
    ...(role === "PLAN"
      ? parseSignedTaskBlockFromPlan(bytes).tasks.flatMap((task) => [
          ...task.acceptanceRefs, ...task.authorityRefs,
        ])
      : []),
  ];
};

const explicitUpstreamAuthorityRefs = (
  workItem: WorkItem,
  manifest: ProjectManifest,
  authority: ResolvedProjectAuthority,
  upstreamArtifacts: readonly ArtifactRef[],
): readonly AuthorityRef[] => {
  if (workItem.schemaId.endsWith("-v2")) {
    return upstreamArtifacts.flatMap((artifact) =>
      stageArtifactAuthorityRefs(workItem, manifest, artifact)
    );
  }
  // Retained v1 pins keep their published historical selection policy.
  const bodies = upstreamArtifacts.map((artifact) =>
    new TextDecoder().decode(
      readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath),
    )
  );
  return authority.authorityRefs
    .map(([authorityRef]) => authorityRef)
    .filter((authorityRef) =>
      bodies.some((body) => bodyContainsAuthorityRef(body, authorityRef))
    );
};

const applicableAuthorityPaths = async (
  workItem: WorkItem,
  stage: PreSignoffStage,
  manifest: ProjectManifest,
  authority: ResolvedProjectAuthority,
  upstreamArtifacts: readonly ArtifactRef[],
  producingOutput: ArtifactRef | null,
): Promise<Readonly<{
  resolved: readonly Readonly<{
    path: RepositoryPath;
    authorityLayer: NonNullable<ArtifactRef["authorityLayer"]>;
  }>[];
  concernOnly: readonly RepositoryPath[];
}>> => {
  const currentV2 = workItem.schemaId.endsWith("-v2");
  if (currentV2 && producingOutput !== null && producingOutput.role !== stage) {
    throw new TypeError("producing output does not belong to the current stage");
  }
  const applicableRefs = new Set<AuthorityRef>([
    ...stageTemplateAuthorityRefs(workItem, stage, authority),
    ...(currentV2 ? manifest.stageAuthorityRefs[stage] ?? [] : []),
    ...explicitUpstreamAuthorityRefs(workItem, manifest, authority, upstreamArtifacts),
    ...(currentV2 && producingOutput !== null
      ? stageArtifactAuthorityRefs(workItem, manifest, producingOutput)
      : []),
    ...authority.overrides.map((rule) => rule.authorityRef),
    ...authority.extensions.map((rule) => rule.authorityRef),
  ]);
  const reachableRefs = new Map(authority.authorityRefs);
  for (const defaultRuleId of authority.inheritedDefaultRuleIds) {
    const parsed = AuthorityRefSchema.safeParse(defaultRuleId);
    if (parsed.success && reachableRefs.has(parsed.data)) {
      applicableRefs.add(parsed.data);
    }
  }

  const applicablePaths = new Set<RepositoryPath>();
  const exactRefs = currentV2
    ? resolveAuthorityRefClosure(authority, manifest.refDependencies, [...applicableRefs])
    : applicableRefs;
  for (const authorityRef of exactRefs) {
    const path = reachableRefs.get(authorityRef);
    if (path === undefined) {
      throw new TypeError(
        "applicable AuthorityRef is not reachable in " + stage + " context: " + authorityRef,
      );
    }
    applicablePaths.add(path);
  }

  const concernPaths = await resolveConcernAuthoritySources(
    workItem.repositoryRoot,
    manifest,
    workItem.concernIds,
  );
  concernPaths.forEach((path) => applicablePaths.add(path));
  if (
    currentV2 &&
    applicablePaths.has(workItemDocumentPath(manifest.workItems.root, workItem.id, stage))
  ) {
    throw new TypeError("producing lifecycle output cannot be its own governing dependency");
  }

  const resolved: Array<Readonly<{
    path: RepositoryPath;
    authorityLayer: NonNullable<ArtifactRef["authorityLayer"]>;
  }>> = [];
  const resolvedPaths = new Set<RepositoryPath>();
  for (const layer of authority.layers) {
    for (const path of layer.sources) {
      if (!applicablePaths.has(path)) continue;
      resolved.push({
        path,
        authorityLayer: authorityLayerForManifestLayer(layer.layer),
      });
      resolvedPaths.add(path);
    }
  }

  return {
    resolved,
    concernOnly: concernPaths.filter((path) => !resolvedPaths.has(path)),
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

const persistedCurrentArtifactSnapshot = (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  artifact: ArtifactRef,
): ArtifactRef | null => {
  try {
    const currentSha256 = sha256(
      readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath),
    );
    if (currentSha256 === artifact.sha256) return artifact;
    return findArtifactSnapshot(runtime.database, {
      workItemId: artifact.workItemId,
      repositoryPath: artifact.repositoryPath,
      role: artifact.role,
      authorityLayer: artifact.authorityLayer,
      sha256: currentSha256,
      gitCommit: null,
    });
  } catch {
    return null;
  }
};

const lifecycleRoleOrder = ["R1", "R2", "DESIGN", "PLAN", "R3"] as const;
type LifecycleRole = (typeof lifecycleRoleOrder)[number];

const artifactsForIds = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  ids: readonly ArtifactRefId[],
  role: LifecycleRole,
): readonly ArtifactRef[] =>
  ids
    .map((id) => getArtifact(runtime, id))
    .filter((artifact) => artifact.workItemId === workItemId && artifact.role === role);

const latestRunCandidateArtifacts = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  role: LifecycleRole,
  includePriorDrafts: boolean,
): readonly ArtifactRef[] => {
  const runs = listRuns(runtime, workItemId)
    .filter((run) => run.role === "STAGE" && run.stage === role)
    .reverse();
  for (const [index, run] of runs.entries()) {
    const events = listRunEvents(runtime, run.id);
    const admitted = admittedStageCompletion(workItemId, run, events);
    if (admitted !== null) {
      const artifacts = artifactsForIds(runtime, workItemId, admitted.artifactRefIds, role);
      if (artifacts.length > 0) return artifacts;
    }

    // A current-v2 R1–PLAN draft can survive a context-freshness return.
    // It remains a draft, never higher authority or downstream conformance.
    if (index !== 0 && !includePriorDrafts) continue;
    const completion = events.findLast((event) =>
      event.event.tag === "STAGE_COMPLETED" && event.event.completion.stage === role
    );
    if (completion?.event.tag === "STAGE_COMPLETED") {
      const artifacts = artifactsForIds(runtime, workItemId, completion.event.artifactRefIds, role);
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
          ? [event.event.adoptedArtifactRefId] : [])
      .map((id) => getArtifact(runtime, id))
      .filter((artifact) => artifact.workItemId === workItemId && artifact.role === role);
    if (adopted.length > 0) return deduplicateArtifacts(adopted);
  }
  return [];
};

export const currentStageCompletionArtifacts = (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
): readonly ArtifactRef[] => {
  const candidates = latestRunCandidateArtifacts(
    runtime, workItem.id, stage, workItem.schemaId.endsWith("-v2") && stage !== "R3",
  );
  return deduplicateArtifacts(
    candidates.flatMap((candidate) => {
      if (!candidate.repositoryPath.endsWith(".md")) return [];
      const current = persistedCurrentArtifactSnapshot(
        runtime,
        workItem,
        candidate,
      );
      return current === null ? [] : [current];
    }),
  );
};

export const currentStageDraftArtifacts = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
  materializeArtifacts = true,
): Promise<readonly ArtifactRef[]> => {
  if (stage === "R3") return [];
  const candidates = latestRunCandidateArtifacts(
    runtime, workItem.id, stage, workItem.schemaId.endsWith("-v2"),
  );
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
      drafts.push(materializeArtifacts
        ? await currentFileArtifact(
            runtime, workItem, candidate.repositoryPath, candidate.role, candidate.authorityLayer,
          )
        : await inspectCurrentFileArtifact(
            workItem, candidate.repositoryPath, candidate.role, candidate.authorityLayer,
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
  const current: ArtifactRef[] = [];

  const persisted = listArtifacts(runtime, workItemId);
  for (const role of lifecycleRoleOrder) {
    const semantic = new Map<string, ArtifactRef>();
    for (const candidate of persisted) {
      if (
        candidate.role !== role ||
        !candidate.repositoryPath.endsWith(".md")
      ) {
        continue;
      }
      const key = canonicalJson([
        candidate.repositoryPath,
        candidate.role,
        candidate.authorityLayer,
      ]);
      const snapshot = persistedCurrentArtifactSnapshot(
        runtime,
        workItem,
        candidate,
      );
      if (snapshot !== null) semantic.set(key, snapshot);
    }
    current.push(...semantic.values());
  }

  const roleRank = new Map(
    lifecycleRoleOrder.map((role, index) => [role, index] as const),
  );
  return [...deduplicateArtifacts(current)].sort((left, right) => {
    const leftRank = roleRank.get(left.role as LifecycleRole) ?? 99;
    const rightRank = roleRank.get(right.role as LifecycleRole) ?? 99;
    if (leftRank !== rightRank) return leftRank - rightRank;
    if (left.repositoryPath !== right.repositoryPath) {
      return left.repositoryPath < right.repositoryPath ? -1 : 1;
    }
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  });
};

const currentProducingStageArtifact = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  manifest: ProjectManifest,
  stage: PreSignoffStage,
): Promise<ArtifactRef | null> => {
  if (stage === "R3") {
    // A fresh independent R3 never imports a failed or historical R3 output.
    // Only the active review's own adopted draft can seed its next turn.
    const active = [...listRuns(runtime, workItem.id)].reverse().find((run) =>
      run.role === "STAGE" && run.stage === "R3" &&
      (run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
    );
    if (active === undefined) return null;
    const adopted = listRunEvents(runtime, active.id).findLast((event) =>
      event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
      event.event.disposition === "ADOPTED" &&
      event.event.adoptedArtifactRefId !== null &&
      getArtifact(runtime, event.event.adoptedArtifactRefId).role === "R3"
    );
    if (adopted?.event.tag !== "ARTIFACT_PROPOSAL_DISPOSITIONED" ||
        adopted.event.adoptedArtifactRefId === null) return null;
    const candidate = getArtifact(runtime, adopted.event.adoptedArtifactRefId);
    return persistedCurrentArtifactSnapshot(runtime, workItem, candidate);
  }

  const expected = workItemDocumentPath(manifest.workItems.root, workItem.id, stage);
  const selected = deduplicateArtifacts([
    ...currentStageCompletionArtifacts(runtime, workItem, stage),
    ...await currentStageDraftArtifacts(runtime, workItem, stage, false),
  ].filter((artifact) => artifact.repositoryPath === expected));
  if (selected.length > 1) throw new TypeError("ambiguous current producing-stage output");
  return selected[0] ?? null;
};

export const resolveStageContextState = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
  materializeArtifacts = true,
  producingOutput?: ArtifactRef | null,
): Promise<StageContextResolution> => {
  const validated = await revalidateWorkItemSource(runtime, workItem.id);
  workItem = validated.workItem;
  const source = validated.source;
  const [manifest, authority] = await resolveCurrentStageAuthority(workItem, stage);
  const resolveCurrentArtifact = (
    path: RepositoryPath,
    role: ArtifactRef["role"],
    authorityLayer: ArtifactRef["authorityLayer"],
  ): Promise<ArtifactRef> =>
    materializeArtifacts
      ? currentFileArtifact(runtime, workItem, path, role, authorityLayer)
      : inspectCurrentFileArtifact(workItem, path, role, authorityLayer);

  const priorOutputs: ArtifactRef[] = [];
  let staleStage: PreSignoffStage | null = null;
  for (const priorStage of priorStagesForStage(stage)) {
    const conformance = await resolveStageConformanceState(
      runtime,
      workItem,
      priorStage,
      materializeArtifacts,
    );
    if (conformance.staleStage !== null) {
      staleStage = conformance.staleStage;
      break;
    }
    priorOutputs.push(...conformance.outputs);
  }

  const artifacts: ArtifactRef[] = [];
  const applicable = await applicableAuthorityPaths(
    workItem,
    stage,
    manifest,
    authority,
    priorOutputs,
    workItem.schemaId.endsWith("-v2")
      ? producingOutput === undefined
        ? await currentProducingStageArtifact(runtime, workItem, manifest, stage)
        : producingOutput
      : null,
  );
  const materialAuthority = projectAuthorityForSources(
    authority,
    applicable.resolved.map((entry) => entry.path),
  );
  for (const entry of applicable.resolved) {
    artifacts.push(
      await resolveCurrentArtifact(
        entry.path,
        "GOVERNANCE",
        entry.authorityLayer,
      ),
    );
  }
  for (const path of applicable.concernOnly) {
    artifacts.push(
      await resolveCurrentArtifact(path, "GOVERNANCE", null),
    );
  }

  artifacts.push(
    await resolveCurrentArtifact(
      normalizeRepositoryPath("pontivus-order.toml"),
      "PROJECT_MANIFEST",
      null,
    ),
  );

  if (stage === "PLAN" || stage === "R3") {
    for (const gate of Object.values(manifest.verification)) {
      for (const path of await expandRepositoryPatterns(
        workItem.repositoryRoot,
        gate.materialRefs,
      )) {
        artifacts.push(
          await resolveCurrentArtifact(
            path,
            "VERIFICATION_MATERIAL",
            null,
          ),
        );
      }
    }
  }

  artifacts.push(...priorOutputs);
  return {
    context: resolvedContext(workItem, source, stage, materialAuthority, artifacts),
    staleStage,
  };
};
export const resolveStageConformanceState = async (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
  materializeArtifacts = true,
): Promise<StageConformanceResolution> => {
  const latestRun = [...listRuns(runtime, workItem.id)]
    .reverse()
    .find((run) => run.role === "STAGE" && run.stage === stage);
  const completion = latestRun === undefined
    ? null
    : admittedStageCompletion(workItem.id, latestRun, listRunEvents(runtime, latestRun.id));
  // A bare CONFORMANCE_PASSED event is not admitted lifecycle authority.
  const outputs = completion === null
    ? []
    : completion.artifactRefIds.map((id) => getArtifact(runtime, id));
  const currentV2 = workItem.schemaId.endsWith("-v2");
  const outputBytesCurrent = outputs.every((artifact) =>
    artifact.workItemId === workItem.id &&
    artifact.role === artifactRoleForStage(stage) &&
    currentArtifactBytesMatch(workItem, artifact)
  );
  const exactOutput = currentV2 && latestRun?.status === "COMPLETED" &&
      outputs.length === 1 && outputBytesCurrent
    ? outputs[0] ?? null : null;

  let state: StageContextResolution;
  try {
    state = await resolveStageContextState(runtime, workItem, stage, materializeArtifacts, exactOutput);
  } catch (error) {
    if (exactOutput === null) throw error;
    // Invalid declarations cannot seed a downstream stage. Re-resolve only
    // the governing context without the rejected output and return its owner.
    const withoutOutput = await resolveStageContextState(runtime, workItem, stage, materializeArtifacts, null);
    return {
      context: withoutOutput.context, outputs: [],
      staleStage: withoutOutput.staleStage ?? stage,
    };
  }
  if (state.staleStage !== null) {
    return { context: state.context, outputs: [], staleStage: state.staleStage };
  }
  if (
    completion === null || latestRun === undefined ||
    latestRun.contextHash !== state.context.contextHash ||
    (stage === "R1" && completion.completion.stage === "R1" &&
      !allowedR1CompletionsForSchema(workItem.schemaId).includes(completion.completion.outcome)) ||
    !outputBytesCurrent || (currentV2 && exactOutput === null)
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

const expandLifecycleMaterialDependencies = (
  runtime: CoordinatorRuntime,
  artifacts: readonly ArtifactRef[],
): readonly ArtifactRef[] =>
  deduplicateArtifacts([
    ...artifacts,
    ...artifacts
      .filter((artifact) =>
        artifact.role === "R1" ||
        artifact.role === "R2" ||
        artifact.role === "DESIGN" ||
        artifact.role === "PLAN" ||
        artifact.role === "R3"
      )
      .flatMap((artifact) =>
        dependencyClosure(runtime, artifact.id).map((id) => getArtifact(runtime, id))
      ),
  ]);

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
  if (plan.workItemId !== approval.workItemId || r3.workItemId !== approval.workItemId ||
      plan.role !== "PLAN" || r3.role !== "R3" || plan.id === r3.id) {
    throw new TypeError("Approval roots do not match their exact WorkItem and roles");
  }
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
  // Individual valid blobs do not establish complete signed membership.
  // Recompute the existing P6 package identity from the immutable closure
  // and signed source hash, never from the current WorkItem source.
  const packageHash = sha256Text(canonicalApprovalPackageJson({
    workItemId: approval.workItemId,
    baselineCommit: approval.baselineCommit,
    sourceSha256: approval.sourceSha256,
    plan: closure.plan,
    r3: closure.r3,
    materialArtifacts: closure.material,
  }));
  if (packageHash !== approval.packageHash) {
    throw new TypeError("approval closure does not match the signed package hash");
  }
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
): Promise<ReturnType<typeof parseSignedTaskBlockFromPlan>> => {
  await validateProjectManifestResolution(workItem.repositoryRoot, manifest);
  const block = admitSignedTaskBlockForSchema(
    workItem.schemaId,
    parseSignedTaskBlockFromPlan(planBytes),
  );
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
  return block;
};

export const approvalContext = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
  task: ExecutionTask,
  role: Exclude<RunRole, "STAGE">,
  qa?: Readonly<{ submissionId: CandidateReviewEventId; triggerEventId: RunEventId }>,
): Promise<ResolvedContext> => {
  const validated = await revalidateWorkItemSource(runtime, approval.workItemId);
  if (validated.workItem.sourceSha256 !== approval.sourceSha256) {
    throw new TypeError("current WorkItem source no longer matches Approval");
  }
  const closure = approvalClosure(runtime, approval);
  const material = deduplicateArtifacts([closure.plan, ...closure.material]);
  const [, reachableAuthority] = await resolveCurrentStageAuthority(
    validated.workItem,
    "R3",
  );
  const authority = projectAuthorityForSources(
    reachableAuthority,
    material
      .filter((artifact) =>
        artifact.role === "GOVERNANCE" && artifact.authorityLayer !== null
      )
      .map((artifact) => artifact.repositoryPath),
  );
  let qaContext: ResolvedContext["qa"];
  if (qa !== undefined) {
    if (role === "BUILDER" || task.approvalId !== approval.id) throw new TypeError("QA context requires exact signed reviewer or remediator");
    const history = loadCandidateReviewEvents(runtime.database, approval.id);
    const input = candidateSubmissionEvents(approval.id, history, qa.submissionId);
    const trigger = getRunEvent(runtime, qa.triggerEventId);
    const triggerRun = getRun(runtime, trigger.runId);
    if (triggerRun.workItemId !== approval.workItemId || triggerRun.executionTaskId !== task.id ||
        triggerRun.baselineCommit !== approval.baselineCommit ||
        input.some(value => value.event.tag === "REPORT" && value.event.taskId !== task.id)) {
      throw new TypeError("QA context must bind the exact submitted task and trigger");
    }
    const tasks = await canonicalTasksForApproval(runtime, approval);
    const runs = listRuns(runtime, approval.workItemId);
    const events = runs.flatMap(value => listRunEvents(runtime, value.id));
    const rounds = reconstructCandidateRounds(approval, tasks, runs, events, history);
    const submission = input[0]!;
    candidateFindingDispositions(history.filter(value => value.sequence <= submission.sequence), rounds, tasks, runs, events);
    const memberRound = history.findLast(value => value.sequence < submission.sequence &&
      (value.event.tag === "OPENED" || value.event.tag === "REVIEW_COMPLETED"));
    const member = memberRound === undefined ? undefined : rounds.get(memberRound.id)?.find(([id]) => id === task.id);
    const direct = role === "REVIEWER" && trigger.event.tag === "CANDIDATE_RECORDED" && member?.[1] === trigger.id;
    const successor = linkedSubmission(triggerRun, runs, events, history) === submission.id &&
      (role === "REVIEWER" ? trigger.event.tag === "CANDIDATE_STATE_RECORDED" : trigger.event.tag === "VALIDATION_FAILED");
    if (!direct && !successor) throw new TypeError("QA context trigger is outside the exact submission lineage");
    for (const entry of input) {
      if (entry.event.tag !== "REPORT" && entry.event.tag !== "RETEST_FAILED") continue;
      for (const id of entry.event.evidence) {
        const evidence = getRunEvent(runtime, id);
        validatePayloadEvidence(runtime, evidence.runId, evidence.event);
      }
    }
    qaContext = { triggerEventId: qa.triggerEventId, events: input };
  }
  const { state: _mutableState, ...immutableTask } = task;
  const contextHash = sha256Text(
    canonicalJson({
      stage: "EXECUTION",
      role,
      workItemId: approval.workItemId,
      sourceSha256: approval.sourceSha256,
      task: qaContext === undefined ? task : immutableTask,
      ...(qaContext === undefined ? {} : { triggerEventId: qaContext.triggerEventId, qaEvents: qaContext.events }),
      resolvedAuthority: authority,
      materialArtifacts: sortedMaterialProjection(material),
    }),
  );
  return {
    source: validated.source,
    authority,
    artifacts: material,
    p1Paths: material
      .filter((artifact) => artifact.authorityLayer === "P1")
      .map((artifact) => artifact.repositoryPath),
    contextHash,
    ...(qaContext === undefined ? {} : { qa: qaContext }),
  };
};

// Reconstruct the same immutable context after admission, without a second
// context store or an input derived from mutable task state.
export const approvalContextForRun = async (
  runtime: CoordinatorRuntime, approval: Approval, task: ExecutionTask, run: Run,
): Promise<ResolvedContext> => {
  if (run.role === "STAGE" || run.workItemId !== approval.workItemId ||
      run.executionTaskId !== task.id || task.approvalId !== approval.id ||
      run.baselineCommit !== approval.baselineCommit) throw new TypeError("execution context Run identity conflict");
  const history = loadCandidateReviewEvents(runtime.database, approval.id);
  if (history.length === 0) return approvalContext(runtime, approval, task, run.role);
  const runs = listRuns(runtime, approval.workItemId);
  const events = runs.flatMap(value => listRunEvents(runtime, value.id));
  const submissionId = linkedSubmission(run, runs, events, history);
  if (submissionId === null) return approvalContext(runtime, approval, task, run.role);
  if (run.triggerEventId === null) throw new TypeError("QA Run lacks exact trigger");
  const context = await approvalContext(runtime, approval, task, run.role, { submissionId, triggerEventId: run.triggerEventId });
  if (context.contextHash !== run.contextHash) throw new TypeError("QA Run context hash mismatch");
  return context;
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

  const currentState = await resolveStageContextState(
    runtime,
    workItem,
    "R3",
    false,
    currentArtifactBytesMatch(workItem, closure.r3) ? closure.r3 : null,
  );
  const current: ArtifactRef[] = [
    ...expandLifecycleMaterialDependencies(
      runtime,
      currentState.context.artifacts,
    ),
  ];

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

const changedMaterialOwners = (
  signed: readonly ArtifactRef[],
  current: readonly ArtifactRef[],
): readonly UpstreamReturnStage[] => {
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
  const changedOwners: UpstreamReturnStage[] = [];

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

  return [...new Set(changedOwners)];
};

export const approvalFreshness = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<Readonly<{
  fresh: boolean;
  changedOwners: readonly UpstreamReturnStage[];
}>> => {
  try {
    const source = await currentWorkItemSource(runtime, approval.workItemId);
    if (source.sha256 !== approval.sourceSha256) {
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

  return {
    fresh: false,
    changedOwners: changedMaterialOwners(signed, current),
  };
};

export const approvalChangedOwners = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<readonly UpstreamReturnStage[]> =>
  (await approvalFreshness(runtime, approval)).changedOwners;

export const currentMaterialFresh = async (
  runtime: CoordinatorRuntime,
  approval: Approval,
): Promise<boolean> => (await approvalFreshness(runtime, approval)).fresh;

export const latestR3Root = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): ArtifactRef => {
  const run = [...listRuns(runtime, workItemId)].reverse()
    .find((candidate) => candidate.stage === "R3" && candidate.role === "STAGE");
  const completion = run === undefined ? null :
    admittedStageCompletion(workItemId, run, listRunEvents(runtime, run.id));
  if (completion?.completion.stage !== "R3" ||
      completion.completion.outcome !== "READY_FOR_SIGNOFF") {
    throw new TypeError("no conformed R3 root exists for sign-off");
  }
  const root = getArtifact(runtime, completion.artifactRefIds[0]!);
  if (root.workItemId !== workItemId || root.role !== "R3") {
    throw new TypeError("R3 conformance must own exactly one R3 root ArtifactRef");
  }
  return root;
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

    idMap.set(prior.id, committed);
  }

  const r3 = idMap.get(priorR3.id);
  const plan = idMap.get(priorPlan.id);
  if (r3 === undefined || plan === undefined) {
    throw new TypeError("committed sign-off closure rematerialization failed");
  }
  const material = priorIds
    .filter((id) => id !== priorPlan.id && id !== priorR3.id)
    .map((id) => idMap.get(id))
    .filter((artifact): artifact is ArtifactRef => artifact !== undefined);
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
  conformedR3: ArtifactRef;
}>> => {
  const validatedSource = await revalidateWorkItemSource(runtime, workItemId);
  const workItem = validatedSource.workItem;
  if (workItem.stage !== "AWAITING_SIGNOFF" || workItem.status !== "ACTIVE") {
    throw new TypeError("WorkItem is not awaiting sign-off");
  }
  const currentR3 = await resolveStageConformanceState(
    runtime,
    workItem,
    "R3",
    false,
  );
  if (currentR3.staleStage !== null || currentR3.outputs.length !== 1) {
    const returnTo = UpstreamReturnStageSchema.parse(
      currentR3.staleStage ?? "R3",
    );
    throw staleAuthorityFailure(
      returnTo,
      `current R3 conformance is missing or stale: ${returnTo}`,
    );
  }
  const r3Root = currentR3.outputs[0];
  if (r3Root === undefined) throw new TypeError("current R3 root is missing");
  // A conformed Return verdict must not become sign-off authority.
  if (latestR3Root(runtime, workItem.id).id !== r3Root.id) {
    throw new TypeError("current R3 sign-off root identity is inconsistent");
  }
  const conformedClosure = deduplicateArtifacts([
    r3Root,
    ...dependencyClosure(runtime, r3Root.id).map((id) => getArtifact(runtime, id)),
  ]);
  const currentMaterial = expandLifecycleMaterialDependencies(
    runtime,
    deduplicateArtifacts([
      ...currentR3.context.artifacts,
      r3Root,
    ]),
  );
  if (!approvalMaterialIsFresh(conformedClosure, currentMaterial)) {
    const owner = routeApprovalStale(
      changedMaterialOwners(conformedClosure, currentMaterial),
    );
    throw staleAuthorityFailure(
      owner,
      "R3 dependency closure does not match the current resolved material set",
    );
  }

  const baselineCommit = await resolveHeadCommit(workItem.repositoryRoot);
  let committedSource: Uint8Array;
  try {
    committedSource = await readCommittedFile(
      workItem.repositoryRoot,
      baselineCommit,
      workItem.sourcePath,
    );
  } catch (error) {
    throw new TypeError(
      "WorkItem source is not committed at the selected sign-off baseline",
      { cause: error },
    );
  }
  if (sha256(committedSource) !== workItem.sourceSha256) {
    throw new TypeError(
      "WorkItem source bytes do not match the selected sign-off baseline",
    );
  }

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
  const taskBlock = await validateTaskDefinitions(
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
  return {
    baselineCommit,
    packageHash,
    sourceSha256: workItem.sourceSha256,
    plan,
    r3,
    material,
    taskBlock,
    conformedR3: r3Root,
  };
};

const persistCommittedApprovalClosure = (
  runtime: CoordinatorRuntime,
  priorR3: ArtifactRef,
  committed: Readonly<{
    plan: ArtifactRef;
    r3: ArtifactRef;
    material: readonly ArtifactRef[];
  }>,
): void => {
  const priorIds = [priorR3.id, ...dependencyClosure(runtime, priorR3.id)];
  const priorArtifacts = priorIds.map((id) => getArtifact(runtime, id));
  const committedArtifacts = [
    committed.plan,
    committed.r3,
    ...committed.material,
  ];

  const committedForPrior = (prior: ArtifactRef): ArtifactRef => {
    const matches = committedArtifacts.filter((artifact) =>
      artifact.repositoryPath === prior.repositoryPath &&
      artifact.role === prior.role &&
      artifact.authorityLayer === prior.authorityLayer &&
      artifact.sha256 === prior.sha256
    );
    if (matches.length !== 1 || matches[0] === undefined) {
      throw new TypeError(
        "committed sign-off closure does not map one-to-one to conformed material",
      );
    }
    return matches[0];
  };

  for (const artifact of committedArtifacts) {
    const existing = findArtifactSnapshot(runtime.database, {
      workItemId: artifact.workItemId,
      repositoryPath: artifact.repositoryPath,
      role: artifact.role,
      authorityLayer: artifact.authorityLayer,
      sha256: artifact.sha256,
      gitCommit: artifact.gitCommit,
    });
    if (existing === null) storeArtifact(runtime.database, artifact);
  }

  for (const [ownerId, dependencyId] of loadArtifactDependencyEdgesForOwners(
    runtime.database,
    priorIds,
  )) {
    const priorOwner = priorArtifacts.find((artifact) => artifact.id === ownerId);
    const priorDependency = priorArtifacts.find(
      (artifact) => artifact.id === dependencyId,
    );
    if (priorOwner === undefined || priorDependency === undefined) {
      throw new TypeError("conformed dependency edge references missing material");
    }
    storeArtifactDependency(
      runtime.database,
      committedForPrior(priorOwner).id,
      committedForPrior(priorDependency).id,
    );
  }
};

export const observeSignoffPackageArtifacts = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  expectedPackageHash: Sha256,
): Promise<readonly ArtifactRef[]> => {
  const prepared = await computeSignoffPackage(runtime, workItemId);
  if (prepared.packageHash !== expectedPackageHash) {
    throw new TypeError("sign-off package identity changed");
  }
  const persisted = [...new Set([prepared.conformedR3.id,
    ...dependencyClosure(runtime, prepared.conformedR3.id)])]
    .sort().map(id => getArtifact(runtime, id));
  const committed = [prepared.plan, prepared.r3, ...prepared.material];
  if (persisted.some(artifact => artifact.workItemId !== workItemId) ||
      persisted.length !== committed.length ||
      !approvalMaterialIsFresh(persisted, committed)) {
    throw new TypeError("prospective sign-off closure identity is inconsistent");
  }
  return persisted;
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

const inspectStaleSignoffAuthorityOwner = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): Promise<UpstreamReturnStage | null> => {
  try {
    await computeSignoffPackage(runtime, workItemId);
    return null;
  } catch (error) {
    const owner = staleAuthorityOwnerForFailure(error);
    if (owner !== null) return owner;
    throw error;
  }
};

const reconcileWorkItemAuthorityUnlocked = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  expectedOwner: UpstreamReturnStage,
): Promise<WorkItem> => {
  const expected = UpstreamReturnStageSchema.parse(expectedOwner);
  const inspectedOwner = await inspectStaleSignoffAuthorityOwner(runtime, workItemId);
  if (inspectedOwner === null) {
    throw new TypeError("approval authority is current; reconciliation is not required");
  }
  if (inspectedOwner !== expected) {
    throw new TypeError("stale authority owner changed before reconciliation");
  }

  const recheckedOwner = await inspectStaleSignoffAuthorityOwner(runtime, workItemId);
  if (recheckedOwner === null) {
    throw new TypeError("approval authority became current before reconciliation");
  }
  if (recheckedOwner !== expected) {
    throw new TypeError("stale authority owner changed before reconciliation commit");
  }

  return withTransaction(runtime.database, () => {
    const current = getWorkItem(runtime, workItemId);
    const transition = transitionWorkItem(current, {
      tag: "RECONCILE_AUTHORITY",
      owner: expected,
    });
    updateWorkItemLifecycle(runtime.database, workItemId, transition);
    return getWorkItem(runtime, workItemId);
  });
};

export const reconcileWorkItemAuthority = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  expectedOwner: UpstreamReturnStage,
  acceptance?: Readonly<{expectedApprovalId:Approval["id"];expectedReviewSequence:number}>,
): Promise<WorkItem> =>
  withWorkItemOperatorMutation(runtime,workItemId,async()=>{
    if(acceptance===undefined) return reconcileWorkItemAuthorityUnlocked(runtime,workItemId,expectedOwner);
    const {expectedApprovalId,expectedReviewSequence}=acceptance;
    const before=requireCurrentAcceptanceIdentity(runtime,workItemId,expectedApprovalId,expectedReviewSequence);
    for(let i=0;i<2;i++){
      try { await observeCurrentCandidateReview(runtime,workItemId,expectedApprovalId,expectedReviewSequence); }
      catch(error) { if(staleAuthorityOwnerForFailure(error)===expectedOwner) continue; throw error; }
      throw new TypeError("signed material authority is current");
    }
    return withTransaction(runtime.database,()=>{
      const current=requireCurrentAcceptanceIdentity(runtime,workItemId,expectedApprovalId,expectedReviewSequence);
      if(canonicalJson(current)!==canonicalJson(before)) throw new TypeError("Acceptance authority return identity changed");
      blockExecutionTasksForApproval(runtime.database,expectedApprovalId);
      updateWorkItemLifecycle(runtime.database,workItemId,transitionWorkItem(current.workItem,{tag:"RECONCILE_AUTHORITY",owner:expectedOwner}));
      return getWorkItem(runtime,workItemId);
    });
  });

const signOffWorkItemUnlocked = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  expectedPackageHash: Sha256,
  approvedBy: string,
): Promise<Approval> => {
  const prepared = await computeSignoffPackage(runtime, workItemId);
  if (prepared.packageHash !== expectedPackageHash) {
    throw new TypeError("expectedPackageHash does not match the current sign-off package");
  }
  const finalBaseline = await resolveHeadCommit(
    getWorkItem(runtime, workItemId).repositoryRoot,
  );
  if (finalBaseline !== prepared.baselineCommit) {
    throw new TypeError("sign-off baseline changed before commit");
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
    const current = getWorkItem(runtime, workItemId);
    if (current.sourceSha256 !== prepared.sourceSha256) {
      throw new TypeError("WorkItem source authority changed before sign-off commit");
    }
    if (
      sha256(
        readWorkingTreeFile(current.repositoryRoot, current.sourcePath),
      ) !== prepared.sourceSha256
    ) {
      throw new TypeError("WorkItem source bytes changed before sign-off commit");
    }
    for (const artifact of [
      prepared.plan,
      prepared.r3,
      ...prepared.material,
    ]) {
      if (
        sha256(
          readWorkingTreeFile(
            current.repositoryRoot,
            artifact.repositoryPath,
          ),
        ) !== artifact.sha256
      ) {
        throw new TypeError(
          `sign-off material changed before commit: ${artifact.repositoryPath}`,
        );
      }
    }
    const transition = transitionWorkItem(current, { tag: "SIGN_OFF" });
    persistCommittedApprovalClosure(
      runtime,
      prepared.conformedR3,
      prepared,
    );
    storeApproval(runtime.database, approval);
    for (const task of tasks) {
      storeExecutionTask(runtime.database, task);
    }
    updateWorkItemLifecycle(runtime.database, workItemId, transition);
  });
  return approval;
};

export const signOffWorkItem = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  expectedPackageHash: Sha256,
  approvedBy: string,
): Promise<Approval> =>
  withWorkItemOperatorMutation(
    runtime,
    workItemId,
    () => signOffWorkItemUnlocked(
      runtime,
      workItemId,
      expectedPackageHash,
      approvedBy,
    ),
  );
