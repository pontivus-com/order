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
  type Sha256,
  SignedTaskBlockJsonSchemaText,
  type WorkItem,
  type WorkItemId,
} from "../core/contracts.ts";
import {
  canonicalJson,
} from "../core/canonical.ts";
import {
  artifactRoleForStage,
  evaluateStageConformance,
  isPreSignoffStage,
  permanentAuthorityProposalIsAdmitted,
  type PreSignoffStage,
} from "../core/governance.ts";
import {
  admitSignedTaskBlockForSchema,
  parseSignedTaskBlockFromPlan,
} from "../core/execution.ts";
import {
  artifactReturnOwner,
  deriveProposalDecision,
  isDurableDecisionRequest,
  stageInputIsAdmitted,
  stageProviderBatchRejectionCode,
  stageRunInteraction,
  transitionWorkItem,
  validateStageProviderTurn,
} from "../core/lifecycle.ts";
import {
  allowedR1CompletionsForSchema,
  authorityDispositionOwnerRefs,
  stageTemplateForSchema,
  validateStageDocumentStructure,
  workItemDocumentPath,
} from "../core/work-item-source.ts";
import {
  loadValidatedProjectManifest,
  repositoryPatternMatches,
} from "../shell/project.ts";
import {
  adoptProposalPatch,
  captureCandidate,
  materializeStageInspectionWorkspace,
  readWorkingTreeFile,
  verifyProposalPatchAdoption,
  resolveHeadCommit,
} from "../shell/repository.ts";
import {
  admitProductiveOpenCode,
  productiveInvocationFailure,
  productiveInvocationFailureClassification,
  runOpenCodeTurn,
  stopOpenCodeServer,
} from "../shell/opencode.ts";
import {
  newArtifactRefId,
  newRunId,
  nowIsoDateTime,
  sha256,
  sha256Text,
  workspacePathForRun,
} from "../shell/runtime.ts";
import {
  loadWorkItems,
  storeArtifact,
  storeArtifactDependency,
  updateWorkItemLifecycle,
  withTransaction,
} from "../shell/sqlite.ts";
import {
  type CoordinatorRuntime,
  withWorkItemOperatorMutation,
  withWorkItemOperatorMutationSync,
} from "./runtime.ts";
import {
  activeRunStatuses,
  appendRunEvent,
  createAgentActivityRecorder,
  failRunForProductiveInvocation,
  failRunForProvider,
  getRun,
  getRunEvent,
  insertRun,
  listRunEvents,
  listRuns,
  nextAttempt,
  persistProviderEvents,
  recordProviderDiagnostics,
  recordStageProviderBatchAdmissionDiagnostic,
  validatePayloadEvidence,
  renderArtifacts,
  stopActiveProvider,
  updateRun,
} from "./run.ts";
import {
  currentStageCompletionArtifacts,
  currentStageDraftArtifacts,
  getArtifact,
  getWorkItem,
  resolveCurrentStageAuthority,
  resolveStageContextState,
  validateTaskDefinitions,
  type ResolvedContext,
} from "./authority.ts";

const stageMaterialIdentity = (
  run: Pick<Run, "baselineCommit" | "contextHash">,
  currentProjectDeltaSha256: Sha256,
): Sha256 => sha256Text(canonicalJson({
  baselineCommit: run.baselineCommit,
  currentProjectDeltaSha256,
  contextHash: run.contextHash,
}));

const cancelledStageRun = (
  runtime: CoordinatorRuntime,
  runId: RunId,
): Run | null => {
  const current = getRun(runtime, runId);
  if (current.status === "CANCELLED") return current;
  if (current.status !== "RUNNING") {
    throw new TypeError(`STAGE Run cannot continue from status ${current.status}`);
  }
  return null;
};

const signedTaskBlockPromptContract = (
  stage: PreSignoffStage,
  schemaId: WorkItem["schemaId"],
): string => {
  const currentV2NonVacuity =
    schemaId === "change-v2" || schemaId === "defect-v2"
      ? [
          "Current v2 Change/Defect task admission also requires at least one task.",
          "Every task id and objective must be trimmed and non-empty.",
          "Every task must have non-empty scope, acceptanceRefs, changeSurface, gateIds, authorityRefs and concernIds; dependsOn and exclusions may be empty.",
        ].join("\n")
      : "";

  return stage === "PLAN"
    ? [
        "PLAN machine-readable contract:",
        "The PLAN artifact must contain exactly one fenced block opened by ```order-tasks.",
        "The fence body must be one JSON object satisfying the canonical SignedTaskBlock JSON Schema below.",
        "Do not rename fields or replace the outer object with a bare task array.",
        currentV2NonVacuity,
        `Canonical SignedTaskBlock JSON Schema: ${SignedTaskBlockJsonSchemaText}`,
      ].filter((value) => value.length > 0).join("\n")
    : stage === "R3"
      ? [
          "R3 task-contract check:",
          "Before READY_FOR_SIGNOFF, verify the PLAN contains exactly one ```order-tasks fenced JSON object satisfying the canonical SignedTaskBlock JSON Schema below.",
          currentV2NonVacuity,
          `Canonical SignedTaskBlock JSON Schema: ${SignedTaskBlockJsonSchemaText}`,
        ].filter((value) => value.length > 0).join("\n")
      : "";
};

export const stageDecisionText: Record<PreSignoffStage, string> = {
  R1: "Establish facts/root cause only. Do not invent product behavior, architecture, or implementation.",
  R2: "Resolve product intent/functional requirements only. Reconcile every material requirement to canonical P3 authority; do not create a shadow specification or decide architecture/implementation.",
  DESIGN: "Resolve technical architecture/decisions/contracts within higher authority. Prove every design decision traces to accepted functional authority; do not change product intent.",
  PLAN: "Define the exact minimum repository transition. Prove every task traces to resolved requirement/design authority; do not invent requirements or architecture.",
  R3: "Independently evaluate readiness, including canonical authority ownership, shadow-specification risk and complete P1-P7 traceability. Do not rewrite requirements, design, or plan.",
};

const stageConformanceQuestions: Record<PreSignoffStage, readonly string[]> = {
  R1: [
    "Are factual claims evidence-backed and are unresolved facts explicit?",
    "Does the output avoid product, architecture and implementation decisions?",
  ],
  R2: [
    "Is supplied P2 intent sufficient, with missing product intent blocked rather than inferred?",
    "Does every material functional requirement identify its relationship to existing canonical P3 authority as REFERENCE, DELTA or LOCAL?",
    "Does any LOCAL requirement duplicate an existing canonical concern or any DELTA silently weaken an existing owner?",
    "Are acceptance, failure/negative behavior, scope/exclusions and open product/authority questions closed?",
  ],
  DESIGN: [
    "Does every material design decision trace to accepted P3 authority?",
    "Are canonical owners/boundaries explicit without weakening product requirements?",
    "Are preservation, downstream and validation obligations closed?",
  ],
  PLAN: [
    "Does every task trace upward to resolved requirement/design authority?",
    "Does every required outcome trace downward to a task or explicit no-code disposition?",
    "Does every task close its objective/dependencies, module ownership/decomposition constraints, required architecture-feedback checkpoints, expected production and test/validation surface, required deletions/replacements, and completion evidence?",
    "Does the PLAN contain the complete minimum-change forecast and logical verification contract required by S9-S10?",
    "Does no task delegate a material P1-P6 decision to implementation?",
  ],
  R3: [
    "Is there exactly one canonical owner for every material governed concern and no shadow specification?",
    "Is P1-P7 traceability complete in both directions?",
    "Is the lifecycle document package complete/current and are blocking questions/conflicts zero?",
    "Is READY_FOR_SIGNOFF supported by current evidence rather than earlier completion claims?",
  ],
};

const stageDecisionEvidence = (
  runtime: CoordinatorRuntime,
  workItem: WorkItem,
  stage: PreSignoffStage,
): readonly RunEvent[] => {
  const attempts = listRuns(runtime, workItem.id)
    .filter((run) => run.role === "STAGE" && run.stage === stage)
    .sort((left, right) => left.attempt - right.attempt || left.id.localeCompare(right.id));
  const evidence: RunEvent[] = [];
  let hasAnsweredDecision = false;
  for (const attempt of attempts) {
    const events = listRunEvents(runtime, attempt.id);
    const requests = events.filter((event) => isDurableDecisionRequest(event.event));
    const answers = events.filter((event) => {
      const payload = event.event;
      return payload.tag === "HUMAN_INPUT_RECEIVED" && requests.some(
        (request) => request.id === payload.requestEventId && request.sequence < event.sequence,
      );
    });
    const answeredIds = new Set(answers.flatMap((event) =>
      event.event.tag === "HUMAN_INPUT_RECEIVED" && event.event.requestEventId !== null
        ? [event.event.requestEventId] : [],
    ));
    if (answers.length > 0) hasAnsweredDecision = true;
    const answerIds = new Set(answers.map((event) => event.id));
    evidence.push(...events.filter((event) =>
      answeredIds.has(event.id) ||
      answerIds.has(event.id) ||
      event.event.tag === "ARTIFACT_PROPOSAL_CREATED" ||
      event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" ||
      event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED",
    ));
  }
  return hasAnsweredDecision ? evidence : [];
};

export const stagePrompt = async (
  workItem: WorkItem,
  stage: PreSignoffStage,
  context: ResolvedContext,
  currentStageDrafts: readonly ArtifactRef[],
  referenceRoots: readonly string[],
  userInput?: string,
  completionArtifacts: readonly ArtifactRef[] = currentStageDrafts,
  decisionEvidence: readonly RunEvent[] = [],
  adoptedDecisionArtifacts: readonly ArtifactRef[] = [],
): Promise<string> => {
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  const expectedOutputPath = workItemDocumentPath(
    manifest.workItems.root,
    workItem.id,
    stage,
  );
  // Current output material can be unchanged from an earlier adoption.
  // Render exact bound bytes as well as changed drafts; IDs alone cannot
  // support the owning-stage decision-coverage question.
  const reviewArtifacts = [...new Map(
    [...currentStageDrafts, ...completionArtifacts].map((artifact) => [artifact.id, artifact] as const),
  ).values()];
  const completionBindings = completionArtifacts.map((artifact) => ({
    id: artifact.id,
    repositoryPath: artifact.repositoryPath,
    role: artifact.role,
    sha256: artifact.sha256,
  }));
  return [
    `Order lifecycle stage: ${stage}`,
    stageDecisionText[stage],
    `Canonical output path for this stage: ${expectedOutputPath}. Any ARTIFACT_PROPOSAL_CREATED for role ${stage} must target exactly this path.`,
    stage === "R2"
      ? "Permanent authority proposal boundary: role GOVERNANCE may target only an existing current resolved P2/P3 authority path, must declare its exact layer and current baseSha256, and is re-resolved before adoption."
      : stage === "DESIGN"
        ? "Permanent authority proposal boundary: role GOVERNANCE may target only an existing current resolved P4/P5/P6 authority path, must declare its exact layer and current baseSha256, and is re-resolved before adoption."
        : "",
    `WorkItem: ${canonicalJson(workItem)}`,
    [
      "Resolved project authority projection:",
      "Only each precedence list is semantic same-layer precedence; remaining source ordering is deterministic processing order only.",
      canonicalJson(context.authority),
    ].join("\n"),
    stage === "R1" || stage === "R2"
      ? `Canonical WorkItem source Markdown:\n${context.source.markdown}`
      : "",
    `Canonical stage template:\n${stageTemplateForSchema(workItem.schemaId, stage) ?? "(no later stage is authorized for this WorkItem schema)"}`,
    stage === "R1"
      ? `Allowed successful R1 completion outcomes for schema ${workItem.schemaId}: ${allowedR1CompletionsForSchema(workItem.schemaId).join(", ")}`
      : "",
    signedTaskBlockPromptContract(stage, workItem.schemaId),
    [
      "Stage conformance questions:",
      ...stageConformanceQuestions[stage].map((question) => "- " + question),
      "- For every applicable answered durable decision in the owning-stage history, is its material intent represented in the exact current canonical source or adopted authority? Identify the current path/hash that covers it and explain any superseded decision using current durable authority. A new attempt, unrelated adoption or prior chat answer alone is not coverage. Do not complete while material coverage is absent; seek governed correction or clarification.",
      ...(workItem.schemaId.endsWith("-v2") ? [
        "- Does the exact pinned first-line authority declaration include every materially governing ref, encoded canonically, plus all required refs? Structured R2/PLAN references are also governing inputs. Never rely on prose mentions.",
        "- If a newly declared governing input was absent from the producing Run's context, do not claim conformance until a fresh productive turn resolves that input.",
      ] : []),
    ].join("\n"),
    reviewArtifacts.length === 0
      ? [
          "Completion is not yet admissible: no current stage output ArtifactRef exists.",
          "Create/propose and have the canonical stage artifact adopted before emitting STAGE_COMPLETED.",
        ].join("\n")
      : [
          "Current stage draft for review (own-stage output, not higher authority):",
          await renderArtifacts(workItem, reviewArtifacts),
          "Coordinator-owned completion bindings: " + canonicalJson(completionBindings),
          completionBindings.length === 0
            ? "Completion is not yet admissible: no exact current completion binding exists."
            : "If and only if the stage is conformant, STAGE_COMPLETED.artifactRefIds must contain exactly one id from the binding above for the canonical output path.",
        ].join("\n"),
    decisionEvidence.length === 0 ? "" : [
      "Owning-stage durable decision evidence across attempts (evidence only, never authority):",
      "Request/reply and proposal intent/disposition chronology is retained; historical adoption identities do not prove current bytes or semantic coverage.",
      canonicalJson(decisionEvidence),
      "Exact historical adopted ArtifactRefs:",
      canonicalJson(adoptedDecisionArtifacts),
      "Current canonical material identities for coverage:",
      canonicalJson([...context.artifacts, ...reviewArtifacts]),
      stage === "R1" || stage === "R2" ? "" :
        "Current canonical WorkItem source for decision coverage (evidence only, not additional stage authority):\n" + context.source.markdown,
      "Use the current source and artifact bytes below/above to evaluate coverage, including explicit canonical Save followed by a fresh Run. INFORMATION/EVIDENCE replies are not durable decisions.",
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

const persistStageCompletionBatch = async (
  runtime: CoordinatorRuntime,
  run: Run,
  payloads: readonly RunEventPayload[],
  completionPayload: Extract<RunEventPayload, { tag: "STAGE_COMPLETED" }>,
): Promise<Readonly<{ run: Run; persisted: readonly RunEvent[] }>> => {
  const completion = completionPayload.completion;
  if (!isPreSignoffStage(run.stage) || completion.stage !== run.stage) {
    throw new TypeError("stage completion does not match Run stage");
  }

  const workItem = getWorkItem(runtime, run.workItemId);
  const manifest = await loadValidatedProjectManifest(workItem.repositoryRoot);
  const expectedOutputPath = workItemDocumentPath(
    manifest.workItems.root,
    workItem.id,
    run.stage,
  );
  const outputArtifacts = completionPayload.artifactRefIds.map((id) =>
    getArtifact(runtime, id)
  );
  const outputEvaluation = evaluateStageConformance(
    run.stage,
    workItem.id,
    expectedOutputPath,
    outputArtifacts,
  );
  let outputConformanceFailure =
    outputEvaluation.tag === "FAIL" ? outputEvaluation.summary : null;
  let producingOutput: ArtifactRef | null = null;
  if (outputEvaluation.tag === "PASS") {
    const bytes = readWorkingTreeFile(
      workItem.repositoryRoot,
      outputEvaluation.output.repositoryPath,
    );
    if (sha256(bytes) !== outputEvaluation.output.sha256) {
      outputConformanceFailure = "stage completion references stale output bytes";
    } else {
      try {
        const markdown = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        validateStageDocumentStructure(
          workItem.schemaId,
          run.stage,
          markdown,
        );
        for (const authorityRef of authorityDispositionOwnerRefs(
          workItem.schemaId,
          run.stage,
          markdown,
        )) {
          const ownerPath = manifest.refs[authorityRef];
          if (ownerPath === undefined) {
            throw new TypeError(
              `functional authority disposition references unresolved owner: ${authorityRef}`,
            );
          }
          if (
            !manifest.authority.p3.some((pattern) =>
              repositoryPatternMatches(pattern, ownerPath)
            )
          ) {
            throw new TypeError(
              `functional authority disposition owner is not canonical P3 authority: ${authorityRef}`,
            );
          }
        }
        if (run.stage === "PLAN") {
          admitSignedTaskBlockForSchema(
            workItem.schemaId,
            parseSignedTaskBlockFromPlan(bytes),
          );
        }
        producingOutput = outputEvaluation.output;
      } catch (error) {
        outputConformanceFailure =
          error instanceof Error ? error.message : String(error);
      }
    }
  }

  let current: Awaited<ReturnType<typeof resolveStageContextState>>;
  try {
    current = await resolveStageContextState(runtime, workItem, run.stage, true, producingOutput);
  } catch (error) {
    if (!workItem.schemaId.endsWith("-v2") || producingOutput === null) throw error;
    outputConformanceFailure = error instanceof Error ? error.message : String(error);
    current = await resolveStageContextState(runtime, workItem, run.stage, true, null);
  }
  const staleReturnTo = current.staleStage ??
    (current.context.contextHash !== run.contextHash &&
      (!workItem.schemaId.endsWith("-v2") || outputConformanceFailure === null)
      ? run.stage : null);

  if (outputConformanceFailure === null && run.stage === "R3" &&
      completion.outcome === "READY_FOR_SIGNOFF") {
    try {
      const plans = current.context.artifacts.filter(
        (artifact) =>
          artifact.workItemId === workItem.id &&
          artifact.role === "PLAN",
      );
      if (plans.length !== 1 || plans[0] === undefined) {
        throw new TypeError(
          "R3 READY_FOR_SIGNOFF requires exactly one current PLAN artifact",
        );
      }
      const planBytes = readWorkingTreeFile(
        workItem.repositoryRoot,
        plans[0].repositoryPath,
      );
      if (sha256(planBytes) !== plans[0].sha256) {
        throw new TypeError(
          "R3 READY_FOR_SIGNOFF references stale PLAN bytes",
        );
      }
      await validateTaskDefinitions(
        workItem,
        manifest,
        [...current.context.artifacts, ...outputArtifacts],
        planBytes,
      );
    } catch (error) {
      outputConformanceFailure = error instanceof Error ? error.message : String(error);
    }
  }

  const allowedR1Completions =
    completion.stage === "R1"
      ? allowedR1CompletionsForSchema(workItem.schemaId)
      : null;
  const invalidR1Outcome =
    completion.stage === "R1" &&
    (
      allowedR1Completions === null ||
      !allowedR1Completions.includes(completion.outcome)
    );

  return withTransaction(runtime.database, () => {
    const currentRun = getRun(runtime, run.id);
    if (currentRun.status === "CANCELLED") {
      return { run: currentRun, persisted: [] };
    }
    if (currentRun.status !== "RUNNING") {
      throw new TypeError(
        `STAGE Run cannot accept provider result from status ${currentRun.status}`,
      );
    }

    const persisted = persistProviderEvents(runtime, currentRun, payloads);
    const currentWorkItem = getWorkItem(runtime, run.workItemId);

    if (staleReturnTo !== null) {
      const transition = transitionWorkItem(currentWorkItem, {
        tag: "LIFECYCLE_ARTIFACT_CHANGED",
        owner: staleReturnTo,
      });
      appendRunEvent(runtime, run.id, {
        tag: "CONFORMANCE_FAILED",
        stage: run.stage,
        defectiveLayer: null,
        summary:
          current.staleStage === null
            ? "stage context changed before promotion"
            : `upstream conformance is missing or stale: ${current.staleStage}`,
        evidence: [],
      });
      updateWorkItemLifecycle(runtime.database, run.workItemId, transition);
      return {
        persisted,
        run: updateRun(runtime, run.id, {
          status: "BLOCKED",
          endedAt: nowIsoDateTime(),
        }),
      };
    }

    if (outputConformanceFailure !== null) {
      const transition = transitionWorkItem(currentWorkItem, {
        tag: "LIFECYCLE_ARTIFACT_CHANGED",
        owner: completion.stage,
      });
      appendRunEvent(runtime, run.id, {
        tag: "CONFORMANCE_FAILED",
        stage: run.stage,
        defectiveLayer: null,
        summary: outputConformanceFailure,
        evidence: [],
      });
      updateWorkItemLifecycle(runtime.database, workItem.id, transition);
      return {
        persisted,
        run: updateRun(runtime, run.id, {
          status: "BLOCKED",
          endedAt: nowIsoDateTime(),
        }),
      };
    }

    if (invalidR1Outcome) {
      const transition = transitionWorkItem(currentWorkItem, {
        tag: "LIFECYCLE_ARTIFACT_CHANGED",
        owner: "R1",
      });
      appendRunEvent(runtime, run.id, {
        tag: "CONFORMANCE_FAILED",
        stage: "R1",
        defectiveLayer: null,
        summary:
          `R1 outcome ${completion.outcome} is invalid for schema ${workItem.schemaId}`,
        evidence: [],
      });
      updateWorkItemLifecycle(runtime.database, workItem.id, transition);
      return {
        persisted,
        run: updateRun(runtime, run.id, {
          status: "BLOCKED",
          endedAt: nowIsoDateTime(),
        }),
      };
    }

    const transition = transitionWorkItem(
      currentWorkItem,
      { tag: "STAGE_COMPLETED", completion },
      allowedR1Completions,
    );
    for (const output of outputArtifacts) {
      for (const dependency of current.context.artifacts) {
        if (output.id === dependency.id) continue;
        storeArtifactDependency(
          runtime.database,
          output.id,
          dependency.id,
        );
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
    return {
      persisted,
      run: updateRun(runtime, run.id, {
        status: "COMPLETED",
        endedAt: nowIsoDateTime(),
      }),
    };
  });
};

const persistAndReactStageBatch = async (
  runtime: CoordinatorRuntime,
  run: Run,
  payloads: readonly RunEventPayload[],
): Promise<Readonly<{ run: Run; persisted: readonly RunEvent[] }>> => {
  const currentRun = getRun(runtime, run.id);
  if (currentRun.status === "CANCELLED") {
    return { run: currentRun, persisted: [] };
  }
  if (!isPreSignoffStage(currentRun.stage)) {
    throw new TypeError("STAGE proposal admission requires a pre-signoff stage");
  }
  const currentStage = currentRun.stage;
  const currentWorkItem = getWorkItem(runtime, currentRun.workItemId);
  const [, currentAuthority] = await resolveCurrentStageAuthority(
    currentWorkItem,
    currentStage,
  );
  validateStageProviderTurn(
    currentRun,
    listRunEvents(runtime, currentRun.id),
    payloads,
    (proposal) =>
      permanentAuthorityProposalIsAdmitted(
        currentStage,
        proposal,
        currentAuthority,
      ),
  );
  for (const payload of payloads) {
    if (
      payload.tag !== "ARTIFACT_PROPOSAL_CREATED" ||
      payload.role !== "GOVERNANCE"
    ) {
      continue;
    }
    if (
      !permanentAuthorityProposalIsAdmitted(
        currentStage,
        payload,
        currentAuthority,
      )
    ) {
      throw new TypeError(
        "permanent authority proposal target is not admitted by current resolved authority",
      );
    }
    if (payload.baseSha256 === null) {
      throw new TypeError(
        "permanent authority proposal requires the current target baseSha256",
      );
    }
    const currentSha256 = sha256(
      readWorkingTreeFile(currentWorkItem.repositoryRoot, payload.targetPath),
    );
    if (currentSha256 !== payload.baseSha256) {
      throw new TypeError("permanent authority proposal baseSha256 is stale");
    }
  }
  for (const payload of payloads) {
    validatePayloadEvidence(runtime, currentRun.id, payload);
  }

  const completion = payloads.find(
    (payload): payload is Extract<
      RunEventPayload,
      { tag: "STAGE_COMPLETED" }
    > => payload.tag === "STAGE_COMPLETED",
  );
  if (completion !== undefined) {
    return persistStageCompletionBatch(
      runtime,
      currentRun,
      payloads,
      completion,
    );
  }

  return withTransaction(runtime.database, () => {
    const recheckedRun = getRun(runtime, currentRun.id);
    if (recheckedRun.status === "CANCELLED") {
      return { run: recheckedRun, persisted: [] };
    }
    if (recheckedRun.status !== "RUNNING") {
      throw new TypeError(
        `STAGE Run cannot accept provider result from status ${recheckedRun.status}`,
      );
    }

    const persisted = persistProviderEvents(runtime, recheckedRun, payloads);
    const requested = persisted.findLast(
      (event) => event.event.tag === "HUMAN_INPUT_REQUESTED",
    );
    if (requested !== undefined) {
      return {
        persisted,
        run: updateRun(runtime, recheckedRun.id, {
          status: "WAITING_FOR_INPUT",
        }),
      };
    }

    const blocked = persisted.findLast(
      (event) => event.event.tag === "STAGE_BLOCKED",
    );
    if (blocked !== undefined) {
      const workItem = getWorkItem(runtime, recheckedRun.workItemId);
      const transition = transitionWorkItem(workItem, {
        tag: "BLOCK_CURRENT_OWNER",
      });
      updateWorkItemLifecycle(
        runtime.database,
        recheckedRun.workItemId,
        transition,
      );
      return {
        persisted,
        run: updateRun(runtime, recheckedRun.id, {
          status: "BLOCKED",
          endedAt: nowIsoDateTime(),
        }),
      };
    }

    return { persisted, run: getRun(runtime, recheckedRun.id) };
  });
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
  const runStage = run.stage;
  const initialCancellation = cancelledStageRun(runtime, run.id);
  if (initialCancellation !== null) return initialCancellation;

  let diagnosticEvidence: readonly EvidenceRef[] = [];
  try {
    const workItem = getWorkItem(runtime, run.workItemId);
    let active = runtime.activeProviders.get(run.id);
    if (active === undefined) {
      const configuredModel = runtime.config.model;
      if (configuredModel === null) {
        throw productiveInvocationFailure(
          "ENVIRONMENT_BLOCKED",
          new TypeError("a configured OpenCode model is required for productive stage work"),
        );
      }
      const workspace = workspacePathForRun(runtime.stateRoot, run.id);
      let currentProjectDeltaSha256: Sha256;
      try {
        currentProjectDeltaSha256 = await materializeStageInspectionWorkspace(
          workItem.repositoryRoot,
          workspace,
          run.baselineCommit,
        );
      } catch (error) {
        throw productiveInvocationFailure("PRECONDITION_FAILED", error);
      }
      const beforeAdmissionCancellation = cancelledStageRun(runtime, run.id);
      if (beforeAdmissionCancellation !== null) return beforeAdmissionCancellation;
      const admission = await admitProductiveOpenCode(
        runtime.stateRoot,
        workspace,
        configuredModel,
        runtime.environment,
        "STAGE",
        null,
        context.artifacts,
        runtime.config.referenceRoots,
      );
      const afterAdmissionCancellation = cancelledStageRun(runtime, run.id);
      if (afterAdmissionCancellation !== null) {
        await stopOpenCodeServer(admission.server);
        return afterAdmissionCancellation;
      }
      updateRun(runtime, run.id, { providerSessionId: admission.sessionId });
      active = {
        server: admission.server,
        sessionId: admission.sessionId,
        trustedAccountId: admission.trustedAccountId,
        stageMaterialIdentity: stageMaterialIdentity(run, currentProjectDeltaSha256),
      };
      runtime.activeProviders.set(run.id, active);
    } else {
      const sourceHead = await resolveHeadCommit(workItem.repositoryRoot);
      if (sourceHead !== run.baselineCommit) {
        await stopActiveProvider(runtime, run.id);
        return failRunForProductiveInvocation(
          runtime,
          run.id,
          "PRECONDITION_FAILED",
          new TypeError(
            "STAGE source HEAD no longer equals the Run baseline; retry after re-resolution",
          ),
        );
      }
      const currentProjectDeltaSha256 = (await captureCandidate(workItem.repositoryRoot)).patchSha256;
      const currentIdentity = stageMaterialIdentity(run, currentProjectDeltaSha256);
      if (active.stageMaterialIdentity !== currentIdentity) {
        await stopActiveProvider(runtime, run.id);
        return failRunForProductiveInvocation(
          runtime,
          run.id,
          "PRECONDITION_FAILED",
          new TypeError(
            "STAGE repository/context material changed during the active session; retry after re-resolution",
          ),
        );
      }
    }

    const decisionEvidence = stageDecisionEvidence(runtime, workItem, run.stage);
    const adoptedDecisionArtifacts = decisionEvidence.flatMap((event) => {
      const payload = event.event;
      return payload.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" && payload.adoptedArtifactRefId !== null
        ? [getArtifact(runtime, payload.adoptedArtifactRefId)] : [];
    });
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
        currentStageCompletionArtifacts(runtime, workItem, run.stage),
        decisionEvidence,
        adoptedDecisionArtifacts,
      ),
      (record, stderr) => {
        diagnosticEvidence = recordProviderDiagnostics(
          runtime,
          run.id,
          record,
          stderr,
        );
      },
      createAgentActivityRecorder(runtime, run.id),
    );
    const [, currentAuthority] = await resolveCurrentStageAuthority(
      workItem,
      runStage,
    );
    const rejection = stageProviderBatchRejectionCode(
      getRun(runtime, run.id),
      listRunEvents(runtime, run.id),
      events,
      (proposal) =>
        permanentAuthorityProposalIsAdmitted(
          runStage,
          proposal,
          currentAuthority,
        ),
    );
    if (rejection !== null) {
      const admissionEvidence = recordStageProviderBatchAdmissionDiagnostic(
        runtime,
        run.id,
        triggeringEventId,
        rejection,
        events,
      );
      await stopActiveProvider(runtime, run.id);
      return failRunForProvider(
        runtime,
        run.id,
        new TypeError("Agent result could not be accepted"),
        [...diagnosticEvidence, ...admissionEvidence],
      );
    }
    const reaction = await persistAndReactStageBatch(
      runtime,
      run,
      events,
    );
    const reacted = reaction.run;
    if (!activeRunStatuses.has(reacted.status)) {
      await stopActiveProvider(runtime, run.id);
    }
    return reacted;
  } catch (error) {
    await stopActiveProvider(runtime, run.id);
    const classification = productiveInvocationFailureClassification(error);
    return classification === null
      ? failRunForProvider(runtime, run.id, error, diagnosticEvidence)
      : failRunForProductiveInvocation(
          runtime,
          run.id,
          classification,
          error,
          diagnosticEvidence,
        );
  }
};

const scheduleStageTurn = (
  runtime: CoordinatorRuntime,
  run: Run,
  triggeringEventId: RunEventId,
  context: ResolvedContext,
  userInput?: string,
): void => {
  const task = runStageTurn(
    runtime,
    run,
    triggeringEventId,
    context,
    userInput,
  );
  runtime.stageTurnTasks.set(run.id, task);
  void task.then(
    () => {
      runtime.stageTurnTasks.delete(run.id);
    },
    (error: unknown) => {
      runtime.stageTurnTasks.delete(run.id);
      try {
        const current = getRun(runtime, run.id);
        if (activeRunStatuses.has(current.status)) {
          failRunForProvider(runtime, run.id, error);
        }
      } catch (cleanupError) {
        console.error("Order could not finalize an unhandled stage turn failure", cleanupError);
      }
    },
  );
};

const startStageRunUnlocked = async (
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
    throw new TypeError(
      `current upstream conformance is missing or stale: ${contextState.staleStage}`,
    );
  }
  const context = contextState.context;
  const currentWorkItem = getWorkItem(runtime, workItem.id);
  const baselineCommit = await resolveHeadCommit(currentWorkItem.repositoryRoot);
  const run = withTransaction(runtime.database, () => {
    const recheckedWorkItem = getWorkItem(runtime, workItem.id);
    const activeRun = listRuns(runtime, workItem.id)
      .find((candidate) => activeRunStatuses.has(candidate.status));
    if (activeRun !== undefined) {
      throw new TypeError("WorkItem already has an active Run");
    }
    if (storedWorkItem.stage === "IDEA") {
      const transition = transitionWorkItem(recheckedWorkItem, {
        tag: "START_RESEARCH",
      });
      updateWorkItemLifecycle(runtime.database, workItem.id, transition);
    } else if (
      recheckedWorkItem.stage !== workItem.stage ||
      recheckedWorkItem.status !== "ACTIVE"
    ) {
      throw new TypeError("WorkItem lifecycle changed before Run creation");
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

  scheduleStageTurn(runtime, run.value, run.started.id, context);
  return run.value;
};

export const startStageRun = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  mode: RunMode,
): Promise<Run> =>
  withWorkItemOperatorMutation(
    runtime,
    workItemId,
    () => startStageRunUnlocked(runtime, workItemId, mode),
  );

const submitRunInputUnlocked = async (
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
  const currentEvents = listRunEvents(runtime, run.id);
  const proposal = deriveProposalDecision(currentEvents);
  if (proposal.tag !== "NONE") {
    throw new TypeError(
      "human input is unavailable while a lifecycle proposal requires disposition",
    );
  }
  const interaction = stageRunInteraction(run, currentEvents);
  if (!stageInputIsAdmitted(interaction, requestEventId)) {
    throw new TypeError("human input is not admitted by the current STAGE interaction");
  }

  const workItem = getWorkItem(runtime, run.workItemId);
  const contextState = await resolveStageContextState(runtime, workItem, run.stage);
  if (contextState.staleStage !== null) {
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
    const currentRun = getRun(runtime, run.id);
    if (
      currentRun.status !== "RUNNING" &&
      currentRun.status !== "WAITING_FOR_INPUT"
    ) {
      throw new TypeError("Run stopped accepting human input before commit");
    }
    const currentEvents = listRunEvents(runtime, currentRun.id);
    if (deriveProposalDecision(currentEvents).tag !== "NONE") {
      throw new TypeError(
        "lifecycle proposal became current before human input commit",
      );
    }
    const currentInteraction = stageRunInteraction(currentRun, currentEvents);
    if (!stageInputIsAdmitted(currentInteraction, requestEventId)) {
      throw new TypeError("human input admission changed before commit");
    }
    const currentWorkItem = getWorkItem(runtime, currentRun.workItemId);
    if (
      currentWorkItem.stage !== currentRun.stage ||
      currentWorkItem.status !== "ACTIVE"
    ) {
      throw new TypeError("WorkItem lifecycle changed before human input commit");
    }
    if (currentRun.status === "WAITING_FOR_INPUT") {
      updateRun(runtime, currentRun.id, { status: "RUNNING" });
    }
    if (contextChanged) {
      updateRun(runtime, currentRun.id, {
        contextHash: context.contextHash,
        providerSessionId: null,
      });
    }
    return appendRunEvent(runtime, currentRun.id, {
      tag: "HUMAN_INPUT_RECEIVED",
      requestEventId,
      text,
    });
  });

  scheduleStageTurn(
    runtime,
    getRun(runtime, run.id),
    received.id,
    context,
    text,
  );
  return received;
};

export const submitRunInput = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  text: string,
  requestEventId: RunEventId | null,
): Promise<RunEvent> => {
  const run = getRun(runtime, runId);
  return withWorkItemOperatorMutation(
    runtime,
    run.workItemId,
    () => submitRunInputUnlocked(runtime, runId, text, requestEventId),
  );
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

const lifecycleProposalRole = (
  role: ArtifactRef["role"],
): role is PreSignoffStage =>
  role === "R1" ||
  role === "R2" ||
  role === "DESIGN" ||
  role === "PLAN" ||
  role === "R3";

const requireCurrentProposalDecision = (
  runtime: CoordinatorRuntime,
  proposal: RunEvent,
  run: Run,
): ReturnType<typeof deriveProposalDecision> => {
  const currentRun = getRun(runtime, run.id);
  const workItem = getWorkItem(runtime, currentRun.workItemId);
  if (
    workItem.stage !== currentRun.stage ||
    workItem.status !== "ACTIVE"
  ) {
    throw new TypeError("proposal Run no longer owns the current WorkItem stage");
  }
  const events = listRunEvents(runtime, currentRun.id);
  if (stageRunInteraction(currentRun, events).tag !== "OPEN") {
    throw new TypeError("proposal decision requires an OPEN current STAGE Run");
  }
  const decision = deriveProposalDecision(events);
  if (
    decision.tag === "NONE" ||
    decision.proposalEventId !== proposal.id
  ) {
    throw new TypeError("proposal is not the single current proposal decision");
  }
  if (
    proposal.event.tag === "ARTIFACT_PROPOSAL_CREATED" &&
    lifecycleProposalRole(proposal.event.role) &&
    proposal.event.role !== currentRun.stage
  ) {
    throw new TypeError("lifecycle proposal role must equal owning Run stage");
  }
  return decision;
};

export const readArtifactProposalTarget = (
  runtime: CoordinatorRuntime,
  proposalEventId: RunEventId,
): Uint8Array => {
  const proposal = getRunEvent(runtime, proposalEventId);
  if (proposal.event.tag !== "ARTIFACT_PROPOSAL_CREATED") {
    throw new TypeError("proposalEventId does not identify an artifact proposal");
  }
  if (proposal.event.baseSha256 === null) {
    return new Uint8Array();
  }
  const run = getRun(runtime, proposal.runId);
  const workItem = getWorkItem(runtime, run.workItemId);
  const bytes = readWorkingTreeFile(
    workItem.repositoryRoot,
    proposal.event.targetPath,
  );
  if (sha256(bytes) !== proposal.event.baseSha256) {
    throw new TypeError("artifact proposal baseSha256 is stale");
  }
  return bytes;
};

const adoptArtifactProposalUnlocked = async (
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
  const initialDecision = requireCurrentProposalDecision(runtime, proposal, run);
  let adoptionRequested = proposalAdoptionRequest(runtime, proposal) !== null;
  if (
    adoptionRequested !== (initialDecision.tag === "ADOPTION_IN_PROGRESS")
  ) {
    throw new TypeError("proposal adoption intent does not match current proposal decision");
  }
  if (
    workItem.stage === "EXECUTION" ||
    workItem.stage === "COMPLETE"
  ) {
    throw new TypeError("artifact proposal cannot mutate authority after sign-off");
  }

  const project = await loadValidatedProjectManifest(workItem.repositoryRoot);
  if (proposal.event.role === "GOVERNANCE") {
    if (proposal.event.baseSha256 === null) {
      throw new TypeError(
        "permanent authority proposal requires the current target baseSha256",
      );
    }
    const [, currentAuthority] = await resolveCurrentStageAuthority(
      workItem,
      run.stage,
    );
    if (
      !permanentAuthorityProposalIsAdmitted(
        run.stage,
        proposal.event,
        currentAuthority,
      )
    ) {
      throw new TypeError(
        "permanent authority proposal target is not admitted by current resolved authority",
      );
    }
    if (
      !adoptionRequested &&
      sha256(
        readWorkingTreeFile(
          workItem.repositoryRoot,
          proposal.event.targetPath,
        ),
      ) !== proposal.event.baseSha256
    ) {
      throw new TypeError("permanent authority proposal baseSha256 is stale");
    }
  }
  if (lifecycleProposalRole(proposal.event.role)) {
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

  if (!adoptionRequested) {
    await verifyProposalPatchAdoption(
      workItem.repositoryRoot,
      proposal.event.targetPath,
      proposal.event.baseSha256,
      proposal.event.unifiedDiff,
    );
    withTransaction(runtime.database, () => {
      const currentRun = getRun(runtime, run.id);
      const currentDecision = requireCurrentProposalDecision(
        runtime,
        proposal,
        currentRun,
      );
      if (
        currentDecision.tag !== "PENDING" ||
        currentDecision.proposalEventId !== proposal.id
      ) {
        throw new TypeError("proposal is no longer pending before adoption intent commit");
      }
      if (proposalDisposition(runtime, proposal) !== null) {
        throw new TypeError("artifact proposal was dispositioned before adoption intent commit");
      }
      if (proposalAdoptionRequest(runtime, proposal) !== null) {
        throw new TypeError("artifact proposal adoption intent was already recorded");
      }
      appendRunEvent(runtime, currentRun.id, {
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
  if (proposal.event.role === "GOVERNANCE") {
    const [, currentAuthority] = await resolveCurrentStageAuthority(
      workItem,
      run.stage,
    );
    if (
      !permanentAuthorityProposalIsAdmitted(
        run.stage,
        proposal.event,
        currentAuthority,
      )
    ) {
      throw new TypeError(
        "permanent authority proposal target stopped being admitted before disposition",
      );
    }
    if (
      sha256(
        readWorkingTreeFile(
          workItem.repositoryRoot,
          proposal.event.targetPath,
        ),
      ) !== resultingHash
    ) {
      throw new TypeError(
        "permanent authority proposal target changed before disposition",
      );
    }
  }

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
    if (proposalDisposition(runtime, proposal) !== null) {
      throw new TypeError("artifact proposal was dispositioned during adoption");
    }
    const currentRun = getRun(runtime, run.id);
    const currentDecision = requireCurrentProposalDecision(
      runtime,
      proposal,
      currentRun,
    );
    if (
      currentDecision.tag !== "ADOPTION_IN_PROGRESS" ||
      currentDecision.proposalEventId !== proposal.id
    ) {
      throw new TypeError("proposal adoption is no longer the current decision");
    }
    const currentWorkItem = getWorkItem(runtime, workItem.id);
    const transition = transitionWorkItem(currentWorkItem, {
      tag: "LIFECYCLE_ARTIFACT_CHANGED",
      owner: artifactReturnOwner(artifact),
    });
    storeArtifact(runtime.database, artifact);
    appendRunEvent(runtime, run.id, {
      tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
      proposalEventId: proposal.id,
      disposition: "ADOPTED",
      adoptedArtifactRefId: artifact.id,
    });
    updateWorkItemLifecycle(runtime.database, workItem.id, transition);
  });
  return artifact;
};

export const adoptArtifactProposal = (
  runtime: CoordinatorRuntime,
  proposalEventId: RunEventId,
): Promise<ArtifactRef> => {
  const proposal = getRunEvent(runtime, proposalEventId);
  const run = getRun(runtime, proposal.runId);
  return withWorkItemOperatorMutation(
    runtime,
    run.workItemId,
    () => adoptArtifactProposalUnlocked(runtime, proposalEventId),
  );
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

const rejectArtifactProposalUnlocked = (
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
  const run = getRun(runtime, proposal.runId);
  const decision = requireCurrentProposalDecision(runtime, proposal, run);
  if (
    decision.tag !== "PENDING" ||
    decision.proposalEventId !== proposal.id
  ) {
    throw new TypeError("proposal is not pending for rejection");
  }
  return withTransaction(runtime.database, () => {
    const currentRun = getRun(runtime, run.id);
    const currentDecision = requireCurrentProposalDecision(
      runtime,
      proposal,
      currentRun,
    );
    if (
      currentDecision.tag !== "PENDING" ||
      currentDecision.proposalEventId !== proposal.id
    ) {
      throw new TypeError("proposal is no longer pending before rejection commit");
    }
    return appendRunEvent(runtime, proposal.runId, {
      tag: "ARTIFACT_PROPOSAL_DISPOSITIONED",
      proposalEventId: proposal.id,
      disposition: "REJECTED",
      adoptedArtifactRefId: null,
    });
  });
};

export const rejectArtifactProposal = (
  runtime: CoordinatorRuntime,
  proposalEventId: RunEventId,
): RunEvent => {
  const proposal = getRunEvent(runtime, proposalEventId);
  const run = getRun(runtime, proposal.runId);
  return withWorkItemOperatorMutationSync(
    runtime,
    run.workItemId,
    () => rejectArtifactProposalUnlocked(runtime, proposalEventId),
  );
};
