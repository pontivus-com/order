import {
  type ArtifactRef,
  EvidencePathSchema,
  type EvidenceRef,
  type ExecutionTaskId,
  ProviderDiagnosticRecordSchema,
  type ProviderDiagnosticRecord,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunEventPayload,
  RunEventSchema,
  type RunId,
  RunSchema,
  type WorkItem,
  type WorkItemId,
  type WorkStage,
} from "../core/contracts.ts";
import { canonicalJson } from "../core/canonical.ts";
import {
  readCommittedFile,
  readWorkingTreeFile,
} from "../shell/repository.ts";
import {
  stopOpenCodeServer,
} from "../shell/opencode.ts";
import {
  newRunEventId,
  nowIsoDateTime,
  readRunEvidenceBytes,
  sha256,
  writeRunEvidenceBytes,
} from "../shell/runtime.ts";
import {
  loadRun,
  loadRunEvent,
  loadRunEvents,
  loadRunsForWorkItem,
  nextRunAttempt,
  nextRunEventSequence,
  storeRun,
  storeRunEvent,
  updateStoredRun,
  withTransaction,
} from "../shell/sqlite.ts";
import { type CoordinatorRuntime } from "./runtime.ts";

export const activeRunStatuses = new Set(["RUNNING", "WAITING_FOR_INPUT"]);

export const getRun = (
  runtime: CoordinatorRuntime,
  runId: RunId,
): Run => loadRun(runtime.database, runId);

export const listRuns = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
): readonly Run[] => loadRunsForWorkItem(runtime.database, workItemId);

export const listRunEvents = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  afterSequence = 0,
): readonly RunEvent[] => loadRunEvents(runtime.database, runId, afterSequence);

export const getRunEvent = (
  runtime: CoordinatorRuntime,
  eventId: RunEventId,
): RunEvent => loadRunEvent(runtime.database, eventId);

export const appendRunEvent = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  event: RunEventPayload,
): RunEvent => {
  const value = RunEventSchema.parse({
    id: newRunEventId(),
    runId,
    sequence: nextRunEventSequence(runtime.database, runId),
    occurredAt: nowIsoDateTime(),
    event,
  });
  storeRunEvent(runtime.database, value);
  return value;
};

export const updateRun = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  update: Readonly<{
    status?: Run["status"];
    providerSessionId?: string | null;
    terminalClassification?: Run["terminalClassification"];
    endedAt?: Run["endedAt"];
    contextHash?: Run["contextHash"];
  }>,
): Run => {
  const current = getRun(runtime, runId);
  const next = RunSchema.parse({ ...current, ...update });
  updateStoredRun(runtime.database, next);
  return next;
};

export const writeRunEvidence = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  relativePath: string,
  bytes: Uint8Array,
  mediaType: string,
): EvidenceRef => {
  const path = EvidencePathSchema.parse(relativePath);
  if (mediaType.length === 0) throw new TypeError("evidence mediaType must be non-empty");
  const digest = writeRunEvidenceBytes(runtime.stateRoot, runId, path, bytes);
  return { relativePath: path, sha256: digest, mediaType };
};

export const evidenceRefsInPayload = (event: RunEventPayload): readonly EvidenceRef[] => {
  if ("evidence" in event && Array.isArray(event.evidence)) return event.evidence;
  if (event.tag === "CANDIDATE_STATE_RECORDED") return [event.patch];
  return [];
};

export const readEvidenceRef = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  ref: EvidenceRef,
): Uint8Array => {
  const bytes = readRunEvidenceBytes(
    runtime.stateRoot,
    runId,
    EvidencePathSchema.parse(ref.relativePath),
  );
  if (sha256(bytes) !== ref.sha256) {
    throw new TypeError("referenced evidence hash does not match persisted bytes");
  }
  return bytes;
};

export const validatePayloadEvidence = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  payload: RunEventPayload,
): void => {
  for (const ref of evidenceRefsInPayload(payload)) {
    readEvidenceRef(runtime, runId, ref);
  }
};

export const readReferencedEvidence = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  relativePath: string,
): Uint8Array => {
  const path = EvidencePathSchema.parse(relativePath);
  const events = listRunEvents(runtime, runId);
  const ref = events
    .flatMap((event) => evidenceRefsInPayload(event.event))
    .find((candidate) => candidate.relativePath === path);
  if (ref === undefined) {
    throw new TypeError("evidence path is not referenced by a persisted RunEvent");
  }
  return readEvidenceRef(runtime, runId, ref);
};

export const renderArtifacts = async (
  workItem: WorkItem,
  artifacts: readonly ArtifactRef[],
): Promise<string> => {
  const chunks: string[] = [];
  for (const artifact of artifacts) {
    const bytes = artifact.gitCommit === null
      ? readWorkingTreeFile(workItem.repositoryRoot, artifact.repositoryPath)
      : await readCommittedFile(
          workItem.repositoryRoot,
          artifact.gitCommit,
          artifact.repositoryPath,
        );
    if (sha256(bytes) !== artifact.sha256) {
      throw new TypeError(
        `ArtifactRef bytes no longer match before prompt rendering: ${artifact.repositoryPath}`,
      );
    }
    chunks.push(
      `--- ${artifact.repositoryPath} [${artifact.role}/${artifact.authorityLayer ?? "none"}] ---\n${new TextDecoder("utf-8", { fatal: true }).decode(bytes)}`,
    );
  }
  return chunks.join("\n\n");
};

export const insertRun = (
  runtime: CoordinatorRuntime,
  value: Run,
): Run => {
  const run = RunSchema.parse(value);
  storeRun(runtime.database, run);
  return run;
};

export const nextAttempt = (
  runtime: CoordinatorRuntime,
  workItemId: WorkItemId,
  stage: WorkStage,
  executionTaskId: ExecutionTaskId | null,
): number => nextRunAttempt(
  runtime.database,
  workItemId,
  stage,
  executionTaskId,
);

export const persistProviderEvents = (
  runtime: CoordinatorRuntime,
  run: Run,
  events: readonly RunEventPayload[],
): readonly RunEvent[] => {
  const persisted: RunEvent[] = [];
  for (const payload of events) {
    validatePayloadEvidence(runtime, run.id, payload);
    persisted.push(appendRunEvent(runtime, run.id, payload));
  }
  return persisted;
};

export const recordProviderDiagnostics = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  record: ProviderDiagnosticRecord,
  stderr: Uint8Array | null,
): readonly EvidenceRef[] => {
  const diagnostic = ProviderDiagnosticRecordSchema.parse(record);
  const root = `provider/${diagnostic.promptId}`;
  const evidence: EvidenceRef[] = [
    writeRunEvidence(
      runtime,
      runId,
      `${root}/diagnostic.json`,
      new TextEncoder().encode(canonicalJson(diagnostic) + "\n"),
      "application/json",
    ),
  ];
  if (stderr !== null && stderr.byteLength > 0) {
    evidence.push(
      writeRunEvidence(
        runtime,
        runId,
        `${root}/stderr.txt`,
        stderr,
        "text/plain; charset=utf-8",
      ),
    );
  }
  appendRunEvent(runtime, runId, {
    tag: "PROVIDER_DIAGNOSTICS_RECORDED",
    evidence,
  });
  return evidence;
};

export const stopActiveProvider = async (
  runtime: CoordinatorRuntime,
  runId: RunId,
): Promise<void> => {
  const active = runtime.activeProviders.get(runId);
  if (active === undefined) return;
  runtime.activeProviders.delete(runId);
  await stopOpenCodeServer(active.server).catch(() => undefined);
};

export const failRunForProductiveInvocation = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  classification: Extract<
    NonNullable<Run["terminalClassification"]>,
    "PRECONDITION_FAILED" | "ENVIRONMENT_BLOCKED"
  >,
  error: unknown,
  evidence: readonly EvidenceRef[] = [],
): Run => {
  const current = getRun(runtime, runId);
  if (current.status === "CANCELLED") return current;
  const detail = error instanceof Error ? error.message : String(error);
  return withTransaction(runtime.database, () => {
    appendRunEvent(runtime, runId, {
      tag: "PRODUCTIVE_INVOCATION_FAILED",
      classification,
      detail: detail.length === 0 ? classification : detail,
      evidence,
    });
    return updateRun(runtime, runId, {
      status: "FAILED",
      terminalClassification: classification,
      endedAt: nowIsoDateTime(),
    });
  });
};

export const failRunForProvider = (
  runtime: CoordinatorRuntime,
  runId: RunId,
  error: unknown,
  evidence: readonly EvidenceRef[] = [],
): Run => {
  const current = getRun(runtime, runId);
  if (current.status === "CANCELLED") return current;
  return withTransaction(runtime.database, () => {
    appendRunEvent(runtime, runId, {
      tag: "PROVIDER_FAILED",
      detail: error instanceof Error ? error.message : String(error),
      evidence,
    });
    return updateRun(runtime, runId, {
      status: "FAILED",
      terminalClassification: "PROVIDER_FAILURE",
      endedAt: nowIsoDateTime(),
    });
  });
};
