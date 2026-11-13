import {
  type ArtifactRef,
  ArtifactRefSchema,
  type EvidenceRef,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunEventPayload,
  type RunId,
  type RunMode,
  RunSchema,
  SignedTaskBlockJsonSchemaText,
  type WorkItem,
  type WorkItemId,
} from "../core/contracts.ts";
import {
  canonicalJson,
} from "../core/canonical.ts";
import {
  artifactRoleForStage,
  isPreSignoffStage,
  type PreSignoffStage,
} from "../core/governance.ts";
import {
  artifactReturnOwner,
  evaluateStageCompletion,
} from "../core/lifecycle.ts";
import {
  allowedR1CompletionsForSchema,
  stageTemplateForSchema,
  workItemDocumentPath,
} from "../core/work-item-source.ts";
import { loadValidatedProjectManifest } from "../shell/project.ts";
import {
  adoptProposalPatch,
  readWorkingTreeFile,
  verifyProposalPatchAdoption,
  resolveHeadCommit,
} from "../shell/repository.ts";
import {
  createOpenCodeSession,
  runOpenCodeTurn,
  startOpenCodeServer,
  stopOpenCodeServer,
} from "../shell/opencode.ts";
import {
  newArtifactRefId,
  newRunId,
  nowIsoDateTime,
  sha256,
} from "../shell/runtime.ts";
import {
  promoteIdeaToR1,
  loadWorkItems,
  setWorkItemStatus,
  storeArtifact,
  storeArtifactDependency,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import { type CoordinatorRuntime } from "./runtime.ts";
import {
  activeRunStatuses,
  appendRunEvent,
  failRunForProvider,
  getRun,
  getRunEvent,
  insertRun,
  listRunEvents,
  listRuns,
  nextAttempt,
  persistProviderEvents,
  recordProviderDiagnostics,
  renderArtifacts,
  stopActiveProvider,
  updateRun,
} from "./run.ts";
import {
  currentStageDraftArtifacts,
  getArtifact,
  getWorkItem,
  resolveStageContextState,
  type ResolvedContext,
} from "./authority.ts";

const signedTaskBlockPromptContract = (stage: PreSignoffStage): string =>
  stage === "PLAN"
    ? [
        "PLAN machine-readable contract:",
        "The PLAN artifact must contain exactly one fenced block opened by ```order-tasks.",
        "The fence body must be one JSON object satisfying the canonical SignedTaskBlock JSON Schema below.",
        "Do not rename fields or replace the outer object with a bare task array.",
        `Canonical SignedTaskBlock JSON Schema: ${SignedTaskBlockJsonSchemaText}`,
      ].join("\n")
    : stage === "R3"
      ? [
          "R3 task-contract check:",
          "Before READY_FOR_SIGNOFF, verify the PLAN contains exactly one ```order-tasks fenced JSON object satisfying the canonical SignedTaskBlock JSON Schema below.",
          `Canonical SignedTaskBlock JSON Schema: ${SignedTaskBlockJsonSchemaText}`,
        ].join("\n")
      : "";

const blockStageRunForContextChange = (
  runtime: CoordinatorRuntime,
  run: Run,
  returnTo: PreSignoffStage,
  summary: string,
): Run =>
  withTransaction(runtime.database, () => {
    appendRunEvent(runtime, run.id, {
      tag: "CONFORMANCE_FAILED",
      stage: run.stage,
      defectiveLayer: null,
      summary,
      evidence: [],
    });
    updateWorkItemLifecycle(runtime.database, run.workItemId, {
      stage: returnTo,
      status: "ACTIVE",
      outcome: null,
    });
    return updateRun(runtime, run.id, {
      status: "BLOCKED",
      endedAt: nowIsoDateTime(),
    });
  });

export const stageDecisionText: Record<PreSignoffStage, string> = {
  R1: "Establish facts/root cause only. Do not invent product behavior, architecture, or implementation.",
  R2: "Resolve product intent/functional requirements only. Do not decide architecture or implementation.",
  DESIGN: "Resolve technical architecture/decisions/contracts within higher authority. Do not change product intent.",
  PLAN: "Define the exact minimum repository transition. Do not invent requirements or architecture.",
  R3: "Independently evaluate readiness. Do not rewrite requirements, design, or plan.",
};

export const stagePrompt = async (
  workItem: WorkItem,
  stage: PreSignoffStage,
  context: ResolvedContext,
  currentStageDrafts: readonly ArtifactRef[],
  referenceRoots: readonly string[],
  userInput?: string,
): Promise<string> => {
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  const expectedOutputPath = workItemDocumentPath(
    manifest.workItems.root,
    workItem.id,
    stage,
  );
  return [
    `Order lifecycle stage: ${stage}`,
    stageDecisionText[stage],
    `Canonical output path for this stage: ${expectedOutputPath}. Any ARTIFACT_PROPOSAL_CREATED for role ${stage} must target exactly this path.`,
    "Return only a JSON array of canonical provider-emittable RunEventPayload values for STAGE role.",
    `WorkItem: ${canonicalJson(workItem)}`,
    stage === "R1" || stage === "R2"
      ? `Canonical WorkItem source Markdown:\n${context.source.markdown}`
      : "",
    `Canonical stage template:\n${stageTemplateForSchema(workItem.schemaId, stage) ?? "(no later stage is authorized for this WorkItem schema)"}`,
    stage === "R1"
      ? `Allowed successful R1 completion outcomes for schema ${workItem.schemaId}: ${allowedR1CompletionsForSchema(workItem.schemaId).join(", ")}`
      : "",
    signedTaskBlockPromptContract(stage),
    currentStageDrafts.length === 0
      ? ""
      : [
          "Current stage draft for review (own-stage output, not higher authority):",
          await renderArtifacts(workItem, currentStageDrafts),
        ].join("\n"),
    userInput === undefined ? "" : `Human input: ${userInput}`,
    referenceRoots.length === 0
      ? ""
      : [
          "Configured external reference roots (read-only, non-authoritative):",
          ...referenceRoots,
          "These locations may be inspected only as evidence. They are not project authority unless adopted through the governed artifact/authority flow.",
        ].join("\n"),
    "Resolved canonical sources:",
    await renderArtifacts(workItem, context.artifacts),
  ].filter((value) => value.length > 0).join("\n\n");
};

export const applyStageCompletion = async (
  runtime: CoordinatorRuntime,
  run: Run,
  context: ResolvedContext,
  completionEvent: RunEvent,
): Promise<Run> => {
  if (completionEvent.event.tag !== "STAGE_COMPLETED") {
    throw new TypeError("expected STAGE_COMPLETED");
  }
  const completion = completionEvent.event.completion;
  if (!isPreSignoffStage(run.stage) || completion.stage !== run.stage) {
    throw new TypeError("stage completion does not match Run stage");
  }

  const workItem = getWorkItem(runtime, run.workItemId);
  const current = await resolveStageContextState(runtime, workItem, run.stage);
  if (
    current.staleStage !== null ||
    current.context.contextHash !== run.contextHash
  ) {
    const returnTo = current.staleStage ?? run.stage;
    return blockStageRunForContextChange(
      runtime,
      run,
      returnTo,
      current.staleStage === null
        ? "stage context changed before promotion"
        : `upstream conformance is missing or stale: ${current.staleStage}`,
    );
  }

  const outputArtifacts = completionEvent.event.artifactRefIds.map((id) => getArtifact(runtime, id));
  for (const artifact of outputArtifacts) {
    if (
      artifact.workItemId !== run.workItemId ||
      artifact.role !== artifactRoleForStage(run.stage) ||
      sha256(readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath)) !== artifact.sha256
    ) {
      throw new TypeError("stage completion references an invalid or stale output ArtifactRef");
    }
  }

  const allowedR1Completions = completion.stage === "R1"
    ? allowedR1CompletionsForSchema(workItem.schemaId)
    : null;
  if (
    completion.stage === "R1" &&
    (allowedR1Completions === null ||
      !allowedR1Completions.includes(completion.outcome))
  ) {
    return withTransaction(runtime.database, () => {
      appendRunEvent(runtime, run.id, {
        tag: "CONFORMANCE_FAILED",
        stage: "R1",
        defectiveLayer: null,
        summary:
          `R1 outcome ${completion.outcome} is invalid for schema ${workItem.schemaId}`,
        evidence: [],
      });
      updateWorkItemLifecycle(runtime.database, workItem.id, {
        stage: "R1",
        status: "ACTIVE",
        outcome: null,
      });
      return updateRun(runtime, run.id, {
        status: "BLOCKED",
        endedAt: nowIsoDateTime(),
      });
    });
  }

  const transition = evaluateStageCompletion(
    getWorkItem(runtime, workItem.id),
    completion,
    allowedR1Completions,
  );
  return withTransaction(runtime.database, () => {
    for (const output of outputArtifacts) {
      for (const dependency of current.context.artifacts) {
        if (output.id === dependency.id) continue;
        storeArtifactDependency(runtime.database, output.id, dependency.id);
      }
    }
    appendRunEvent(runtime, run.id, {
      tag: "CONFORMANCE_PASSED",
      stage: run.stage,
      outputArtifactRefIds: outputArtifacts.map((artifact) => artifact.id),
      contextHash: current.context.contextHash,
      evidence: [],
    });
    updateWorkItemLifecycle(runtime.database, workItem.id, transition);
    return updateRun(runtime, run.id, {
      status: "COMPLETED",
      endedAt: nowIsoDateTime(),
    });
  });
};

export const reactToStageEvents = async (
  runtime: CoordinatorRuntime,
  run: Run,
  context: ResolvedContext,
  events: readonly RunEvent[],
): Promise<Run> => {
  const requested = events.findLast((event) => event.event.tag === "HUMAN_INPUT_REQUESTED");
  if (requested !== undefined) {
    return updateRun(runtime, run.id, { status: "WAITING_FOR_INPUT" });
  }
  const blocked = events.findLast((event) => event.event.tag === "STAGE_BLOCKED");
  if (blocked !== undefined) {
    return withTransaction(runtime.database, () => {
      setWorkItemStatus(runtime.database, run.workItemId, "BLOCKED");
      return updateRun(runtime, run.id, {
        status: "BLOCKED",
        endedAt: nowIsoDateTime(),
      });
    });
  }
  const completed = events.findLast((event) => event.event.tag === "STAGE_COMPLETED");
  if (completed !== undefined) return applyStageCompletion(runtime, run, context, completed);
  return getRun(runtime, run.id);
};

export const runStageTurn = async (
  runtime: CoordinatorRuntime,
  run: Run,
  triggeringEventId: RunEventId,
  context: ResolvedContext,
  userInput?: string,
): Promise<Run> => {
  if (!isPreSignoffStage(run.stage)) {
    throw new TypeError("STAGE Run must use a pre-signoff lifecycle stage");
  }

  let persisted: readonly RunEvent[];
  let diagnosticEvidence: readonly EvidenceRef[] = [];
  try {
    const workItem = getWorkItem(runtime, run.workItemId);
    let active = runtime.activeProviders.get(run.id);
    if (active === undefined) {
      const configuredModel = runtime.config.model;
      if (configuredModel === null) {
        throw new TypeError("a configured OpenCode model is required for productive stage work");
      }
      const server = await startOpenCodeServer(
        runtime.stateRoot,
        workItem.repositoryRoot,
        configuredModel,
        runtime.environment,
      );
      try {
        const sessionId = await createOpenCodeSession(
          server,
          "STAGE",
          null,
          context.p1Paths,
          runtime.config.referenceRoots,
        );
        updateRun(runtime, run.id, { providerSessionId: sessionId });
        active = { server, sessionId };
        runtime.activeProviders.set(run.id, active);
      } catch (error) {
        await stopOpenCodeServer(server).catch(() => undefined);
        throw error;
      }
    }

    const events = await runOpenCodeTurn(
      active.server,
      active.sessionId,
      run,
      triggeringEventId,
      "STAGE",
      null,
      runtime.config.referenceRoots,
      await stagePrompt(
        workItem,
        run.stage,
        context,
        await currentStageDraftArtifacts(runtime, workItem, run.stage),
        runtime.config.referenceRoots,
        userInput,
      ),
      (record, stderr) => {
        diagnosticEvidence = recordProviderDiagnostics(
          runtime,
          run.id,
          record,
          stderr,
        );
      },
    );
    persisted = persistProviderEvents(runtime, run, events);
  } catch (error) {
    await stopActiveProvider(runtime, run.id);
    return failRunForProvider(runtime, run.id, error, diagnosticEvidence);
  }

  const reacted = await reactToStageEvents(
    runtime,
    getRun(runtime, run.id),
    context,
    persisted,
  );
  if (!activeRunStatuses.has(reacted.status)) {
    await stopActiveProvider(runtime, run.id);
  }
  return reacted;
};

export const startStageRun = async (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  mode: RunMode,
): Promise<Run> => {
  const storedWorkItem = getWorkItem(runtime, workItemId);
  const targetStage = storedWorkItem.stage === "IDEA" ? "R1" : storedWorkItem.stage;
  const workItem = storedWorkItem.stage === "IDEA"
    ? { ...storedWorkItem, stage: "R1" as const }
    : storedWorkItem;
  if (!isPreSignoffStage(targetStage) || workItem.status !== "ACTIVE") {
    throw new TypeError("WorkItem cannot start a lifecycle Run in its current state");
  }
  const active = listRuns(runtime, workItem.id).find((run) => activeRunStatuses.has(run.status));
  if (active !== undefined) throw new TypeError("WorkItem already has an active Run");

  const contextState = await resolveStageContextState(runtime, workItem, targetStage);
  if (contextState.staleStage !== null) {
    withTransaction(runtime.database, () => {
      updateWorkItemLifecycle(runtime.database, workItem.id, {
        stage: contextState.staleStage!,
        status: "ACTIVE",
        outcome: null,
      });
    });
    throw new TypeError(
      `current upstream conformance is missing or stale: ${contextState.staleStage}`,
    );
  }
  const context = contextState.context;
  const currentWorkItem = getWorkItem(runtime, workItem.id);
  const baselineCommit = await resolveHeadCommit(currentWorkItem.repositoryRoot);
  const run = withTransaction(runtime.database, () => {
    if (storedWorkItem.stage === "IDEA") {
      promoteIdeaToR1(runtime.database, workItem.id);
    }
    const value = insertRun(runtime, RunSchema.parse({
      id: newRunId(),
      workItemId: workItem.id,
      executionTaskId: null,
      stage: workItem.stage,
      mode,
      role: "STAGE",
      triggerEventId: null,
      status: "RUNNING",
      attempt: nextAttempt(runtime, workItem.id, workItem.stage, null),
      baselineCommit,
      contextHash: context.contextHash,
      providerSessionId: null,
      terminalClassification: null,
      startedAt: nowIsoDateTime(),
      endedAt: null,
    }));
    const started = appendRunEvent(runtime, value.id, {
      tag: "STAGE_STARTED",
      stage: workItem.stage,
      mode,
      contextHash: context.contextHash,
    });
    return { value, started };
  });

  return runStageTurn(runtime, run.value, run.started.id, context);
};

export const submitRunInput = async (
  runtime: CoordinatorRuntime,
  runId: RunId,
  text: string,
  requestEventId: RunEventId | null,
): Promise<RunEvent> => {
  const run = getRun(runtime, runId);
  if (run.role !== "STAGE" || !isPreSignoffStage(run.stage)) {
    throw new TypeError("human input is valid only for pre-signoff STAGE Runs");
  }
  if (run.status !== "RUNNING" && run.status !== "WAITING_FOR_INPUT") {
    throw new TypeError("Run is not accepting human input");
  }
  if (requestEventId !== null) {
    const request = getRunEvent(runtime, requestEventId);
    if (
      request.runId !== run.id ||
      request.event.tag !== "HUMAN_INPUT_REQUESTED"
    ) {
      throw new TypeError("requestEventId does not identify this Run's human-input request");
    }
  }

  const workItem = getWorkItem(runtime, run.workItemId);
  const contextState = await resolveStageContextState(runtime, workItem, run.stage);
  if (contextState.staleStage !== null) {
    blockStageRunForContextChange(
      runtime,
      run,
      contextState.staleStage,
      `upstream conformance is missing or stale: ${contextState.staleStage}`,
    );
    await stopActiveProvider(runtime, run.id);
    throw new TypeError(
      `current upstream conformance is missing or stale: ${contextState.staleStage}`,
    );
  }
  const context = contextState.context;
  const contextChanged = context.contextHash !== run.contextHash;
  if (contextChanged) {
    await stopActiveProvider(runtime, run.id);
  }

  const received = withTransaction(runtime.database, () => {
    if (run.status === "WAITING_FOR_INPUT") {
      updateRun(runtime, run.id, { status: "RUNNING" });
    }
    if (contextChanged) {
      updateRun(runtime, run.id, {
        contextHash: context.contextHash,
        providerSessionId: null,
      });
    }
    return appendRunEvent(runtime, run.id, {
      tag: "HUMAN_INPUT_RECEIVED",
      requestEventId,
      text,
    });
  });

  await runStageTurn(
    runtime,
    getRun(runtime, run.id),
    received.id,
    context,
    text,
  );
  return received;
};

export const proposalDisposition = (
  runtime: CoordinatorRuntime,
  proposal: RunEvent,
): RunEvent | null =>
  listRunEvents(runtime, proposal.runId)
    .find((event) =>
      event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
      event.event.proposalEventId === proposal.id
    ) ?? null;

export const proposalAdoptionRequest = (
  runtime: CoordinatorRuntime,
  proposal: RunEvent,
): RunEvent | null =>
  listRunEvents(runtime, proposal.runId)
    .find((event) =>
      event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" &&
      event.event.proposalEventId === proposal.id
    ) ?? null;

export const adoptArtifactProposal = async (
  runtime: CoordinatorRuntime,
  proposalEventId: RunEventId,
): Promise<ArtifactRef> => {
  const proposal = getRunEvent(runtime, proposalEventId);
  if (proposal.event.tag !== "ARTIFACT_PROPOSAL_CREATED") {
    throw new TypeError("proposalEventId does not identify an artifact proposal");
  }
  if (proposalDisposition(runtime, proposal) !== null) {
    throw new TypeError("artifact proposal is already dispositioned");
  }
  const run = getRun(runtime, proposal.runId);
  const workItem = getWorkItem(runtime, run.workItemId);
  if (!isPreSignoffStage(run.stage)) {
    throw new TypeError("artifact proposals are pre-signoff only");
  }
  if (
    workItem.stage === "EXECUTION" ||
    workItem.stage === "COMPLETE"
  ) {
    throw new TypeError("artifact proposal cannot mutate authority after sign-off");
  }

  const project = await loadValidatedProjectManifest(workItem.repositoryRoot);
  if (
    proposal.event.role === "R1" ||
    proposal.event.role === "R2" ||
    proposal.event.role === "DESIGN" ||
    proposal.event.role === "PLAN" ||
    proposal.event.role === "R3"
  ) {
    const expectedPath = workItemDocumentPath(
      project.workItems.root,
      workItem.id,
      proposal.event.role,
    );
    if (proposal.event.targetPath !== expectedPath) {
      throw new TypeError(
        `lifecycle artifact proposal must target deterministic path ${expectedPath}`,
      );
    }
  }

  let adoptionRequested = proposalAdoptionRequest(runtime, proposal) !== null;
  if (!adoptionRequested) {
    await verifyProposalPatchAdoption(
      workItem.repositoryRoot,
      proposal.event.targetPath,
      proposal.event.baseSha256,
      proposal.event.unifiedDiff,
    );
    withTransaction(runtime.database, () => {
      appendRunEvent(runtime, run.id, {
        tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED",
        proposalEventId: proposal.id,
      });
    });
    adoptionRequested = true;
  }

  const resultingHash = await adoptProposalPatch(
    workItem.repositoryRoot,
    proposal.event.targetPath,
    proposal.event.baseSha256,
    proposal.event.unifiedDiff,
    adoptionRequested,
  );
  const artifact = ArtifactRefSchema.parse({
    id: newArtifactRefId(),
    workItemId: workItem.id,
    repositoryPath: proposal.event.targetPath,
    role: proposal.event.role,
    authorityLayer: proposal.event.authorityLayer,
    sha256: resultingHash,
    gitCommit: null,
  });

  withTransaction(runtime.database, () => {
    storeArtifact(runtime.database, artifact);
    appendRunEvent(runtime, run.id, {
      tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
      proposalEventId: proposal.id,
      disposition: "ADOPTED",
      adoptedArtifactRefId: artifact.id,
    });
    updateWorkItemLifecycle(runtime.database, workItem.id, {
      stage: artifactReturnOwner(artifact),
      status: "ACTIVE",
      outcome: null,
    });
  });
  return artifact;
};

export const reconcilePendingArtifactProposals = async (
  runtime: CoordinatorRuntime,
): Promise<void> => {
  for (const workItem of loadWorkItems(runtime.database)) {
    if (workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE") continue;
    for (const run of listRuns(runtime, workItem.id)) {
      for (const event of listRunEvents(runtime, run.id)) {
        if (event.event.tag !== "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED") continue;
        const proposal = getRunEvent(runtime, event.event.proposalEventId);
        if (proposalDisposition(runtime, proposal) !== null) continue;
        await adoptArtifactProposal(runtime, proposal.id);
      }
    }
  }
};

export const rejectArtifactProposal = (
  runtime: CoordinatorRuntime,
  proposalEventId: RunEventId,
): RunEvent => {
  const proposal = getRunEvent(runtime, proposalEventId);
  if (proposal.event.tag !== "ARTIFACT_PROPOSAL_CREATED") {
    throw new TypeError("proposalEventId does not identify an artifact proposal");
  }
  if (proposalDisposition(runtime, proposal) !== null) {
    throw new TypeError("artifact proposal is already dispositioned");
  }
  if (proposalAdoptionRequest(runtime, proposal) !== null) {
    throw new TypeError("artifact proposal adoption is already in progress");
  }
  return withTransaction(runtime.database, () =>
    appendRunEvent(runtime, proposal.runId, {
      tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
      proposalEventId: proposal.id,
      disposition: "REJECTED",
      adoptedArtifactRefId: null,
    })
  );
};
