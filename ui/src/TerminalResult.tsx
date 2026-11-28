import { useQueries, useQuery } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type RunEvent,
  type WorkItem,
  type WorkItemSchemaCatalogEntry,
} from "../../src/core/contracts.ts";
import { admittedTerminalR1Artifact } from "../../src/core/lifecycle.ts";
import { linkedRemediationIsAllowed } from "../../src/core/work-item-source.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  eventEvidence,
  runRoleLabel,
  workOutcomeProductLabel,
  verifiedCandidateProofEvents,
  type EvidenceSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchResult } from "./primitives/WorkbenchResult.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";

const resultExplanation = (workItem: WorkItem): string => {
  switch (workItem.outcome) {
    case "DISPROVEN":
      return "The proposed work was disproven. No implementation is required.";
    case "DUPLICATE":
      return "The work is a duplicate of already governed work.";
    case "ALREADY_SATISFIED":
      return "The intent is already satisfied by the current repository state.";
    case "INVESTIGATION_COMPLETE":
      return "The investigation completed with an evidence-backed result.";
    case "AUDIT_COMPLETE":
      return "The audit completed with an evidence-backed result.";
    case "CANDIDATE_DONE":
      return "Implementation completed with a verified candidate. Detailed task and attempt history remains available under Implementation.";
    default:
      return "The WorkItem is complete.";
  }
};

const decodeResult = (
  bytes: Uint8Array,
): Readonly<{ kind: "MARKDOWN" | "TEXT"; value: string }> => {
  try {
    const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const markdown = MarkdownTextSchema.safeParse(value);
    return markdown.success
      ? { kind: "MARKDOWN", value: markdown.data }
      : { kind: "TEXT", value };
  } catch {
    const preview = Array.from(bytes.slice(0, 256), (value) =>
      value.toString(16).padStart(2, "0")).join(" ");
    return {
      kind: "TEXT",
      value:
        "Binary result material (" +
        bytes.byteLength +
        " bytes)\n" +
        preview +
        (bytes.byteLength > 256 ? " …" : ""),
    };
  }
};

export const TerminalResult = ({
  workItem,
  schemas,
  onOpenEvidence,
  onCreateRemediation,
}: Readonly<{
  workItem: WorkItem;
  schemas: readonly WorkItemSchemaCatalogEntry[];
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onCreateRemediation?: (workItem: WorkItem) => void;
}>) => {
  const evidenceBacked =
    workItem.outcome === "INVESTIGATION_COMPLETE" ||
    workItem.outcome === "AUDIT_COMPLETE";
  const candidateDone = workItem.outcome === "CANDIDATE_DONE";

  const finalApprovalQuery = useQuery({
    queryKey: workbenchQueryKeys.currentApproval(workItem.id),
    queryFn: () => api.getCurrentApproval(workItem.id),
    enabled: workItem.stage === "COMPLETE",
  });
  const finalApprovalId = finalApprovalQuery.data?.id ?? null;
  const qaHistoryQuery = useQuery({
    queryKey: workbenchQueryKeys.qaHistory(workItem.id, finalApprovalId),
    queryFn: () => {
      if (finalApprovalId === null) throw new TypeError("Final Approval identity unavailable");
      return api.listCandidateReviewEvents(workItem.id, finalApprovalId);
    },
    enabled: candidateDone && finalApprovalId !== null,
    retry: false,
  });
  const terminalR1 = !candidateDone && finalApprovalQuery.isSuccess && finalApprovalQuery.data === null;
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.artifacts(workItem.id),
    queryFn: () => api.listArtifacts(workItem.id),
    enabled: terminalR1,
  });
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    enabled: candidateDone || terminalR1,
  });
  const tasksQuery = useQuery({
    queryKey: workbenchQueryKeys.tasks(workItem.id),
    queryFn: () => api.listExecutionTasks(workItem.id),
    enabled: candidateDone,
  });
  const relevantRuns = (runsQuery.data ?? []).filter(run =>
    candidateDone ? run.executionTaskId !== null : run.stage === "R1" && run.role === "STAGE");
  const eventQueries = useQueries({
    queries: relevantRuns.map(run => ({
      queryKey: workbenchQueryKeys.runEvents(run.id),
      queryFn: () => api.listRunEvents(run.id, 0),
    })),
  });
  const allEvents = eventQueries.flatMap(query => query.data ?? []);
  const eventsPending = runsQuery.isPending || eventQueries.some(query => query.isPending);
  const eventsFailed = runsQuery.isError || eventQueries.some(query => query.isError);
  // The canonical current/final Approval observation returns null only after
  // schema-admitted terminal R1 has been proven by the daemon. Reuse the exact
  // pure same-Run output selector; never pick a current or last R1 artifact.
  const selectedArtifact = (() : ArtifactRef | null => {
    if (!terminalR1 || eventsPending || eventsFailed || !artifactsQuery.isSuccess || workItem.outcome === null) return null;
    try {
      return admittedTerminalR1Artifact(workItem, relevantRuns, allEvents, artifactsQuery.data, [workItem.outcome]);
    } catch { return null; }
  })();
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (selectedArtifact === null) throw new TypeError("terminal result artifact required");
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });
  const proofPending = finalApprovalQuery.isPending || eventsPending || tasksQuery.isPending ||
    (finalApprovalId !== null && qaHistoryQuery.isPending);
  const proofFailed = finalApprovalQuery.isError || eventsFailed || tasksQuery.isError || qaHistoryQuery.isError;
  const exactProofEvents = !proofPending && !proofFailed && finalApprovalQuery.data != null &&
    qaHistoryQuery.isSuccess && tasksQuery.isSuccess
    ? verifiedCandidateProofEvents(finalApprovalQuery.data, tasksQuery.data, relevantRuns, allEvents, qaHistoryQuery.data)
    : null;
  const accepted = exactProofEvents === null ? undefined : qaHistoryQuery.data?.find(entry => entry.event.tag === "ACCEPT");
  const acceptanceProvenance = proofPending
    ? "Loading acceptance provenance…"
    : accepted !== undefined && accepted.actor !== null
      ? "Accepted by " + accepted.actor + " · " + new Date(accepted.occurredAt).toLocaleString()
      : exactProofEvents !== null && qaHistoryQuery.data?.length === 0
        ? "Legacy completion: no human acceptance recorded."
        : "Acceptance provenance unavailable.";
  const candidateEvidence = (exactProofEvents ?? []).flatMap((event: RunEvent) => {
    const run = relevantRuns.find((candidate) => candidate.id === event.runId);
    return run === undefined ? [] : eventEvidence(event).map((proof) => ({
      runId: run.id,
      role: run.role,
      attempt: run.attempt,
      proof,
    }));
  });
  const uniqueCandidateEvidence = candidateEvidence.filter(
    (candidate, index, all) =>
      all.findIndex(
        (other) =>
          other.runId === candidate.runId &&
          other.proof.relativePath === candidate.proof.relativePath,
      ) === index,
  );

  const linkedRemediationAvailable = terminalR1 && selectedArtifact !== null &&
    schemas.some(schema => schema.authoringDefault &&
      linkedRemediationIsAllowed(workItem, workItem.projectId, schema.schemaId));
  const material = (
    <WorkbenchResult
      title={workOutcomeProductLabel(workItem.outcome)}
      status={<WorkbenchStatus tone={candidateDone || evidenceBacked ? "success" : "neutral"} label="Complete" />}
      summary={resultExplanation(workItem)}
      action={linkedRemediationAvailable && onCreateRemediation !== undefined ? (
        <WorkbenchAction label="Create linked remediation" tone="primary"
          onClick={() => onCreateRemediation(workItem)} />
      ) : undefined}
      resources={candidateDone ? {
        title: "Verified candidate resources",
        content: <div data-testid="candidate-result-material">
          <p>{acceptanceProvenance}</p>
          {proofPending ? (
            <WorkbenchState
              kind="loading"
              title="Loading candidate resources…"
            />
          ) : proofFailed || exactProofEvents === null ? (
            <WorkbenchState
              kind="error"
              title="Candidate resources unavailable"
              description="The candidate is complete, but its persisted evidence could not be loaded."
            />
          ) : uniqueCandidateEvidence.length === 0 ? (
            <WorkbenchState
              kind="empty"
              title="No exact verified candidate resource is available"
              description="The verified task and attempt history remains available under Implementation."
            />
          ) : (
            <WorkbenchResourceList
              items={uniqueCandidateEvidence.map((candidate, index) => {
                const label =
                  runRoleLabel(candidate.role) +
                  " evidence " +
                  (index + 1);
                return {
                  id: candidate.runId + ":" + candidate.proof.relativePath,
                  label,
                  detail: "Attempt " + candidate.attempt + " · " + candidate.proof.mediaType,
                  action: (
                    <WorkbenchAction
                      label={"Open " + label}
                      tone="secondary"
                      onClick={() =>
                        onOpenEvidence({
                          kind: "EVIDENCE",
                          runId: candidate.runId,
                          relativePath: candidate.proof.relativePath,
                        })}
                    />
                  ),
                };
              })}
            />
          )}
        </div>,
      } : undefined}
      sections={!candidateDone && (terminalR1 || finalApprovalQuery.isPending || finalApprovalQuery.isError) ? [{
        content: <div data-testid="result-material">
          {finalApprovalQuery.isPending || (terminalR1 && (eventsPending || artifactsQuery.isPending)) ? (
            <WorkbenchState kind="loading" title="Loading result…" />
          ) : finalApprovalQuery.isError || eventsFailed || artifactsQuery.isError || selectedArtifact === null ? (
            <WorkbenchState kind="error" title="Result unavailable"
              description="The exact admitted terminal Research output could not be resolved." />
          ) : (
            <>
              {contentQuery.isPending ? (
                <WorkbenchState kind="loading" title="Loading result document…" />
              ) : contentQuery.isError ? (
                <WorkbenchState
                  kind="error"
                  title="Result document unavailable"
                  description="The exact admitted result bytes could not be read."
                />
              ) : contentQuery.data === undefined ? null : (() => {
                  const content = decodeResult(contentQuery.data);
                  return content.kind === "MARKDOWN" ? (
                    <div className="order-terminal-markdown">
                      <Markdown
                        contentWidth="var(--order-prose-max-width)"
                        contentAlign="start"
                      >
                        {content.value}
                      </Markdown>
                    </div>
                  ) : (
                    <div className="order-terminal-code">
                      <CodeBlock
                        code={content.value}
                        language="plaintext"
                        hasCopyButton
                        width="100%"
                      />
                    </div>
                  );
                })()}
            </>
          )}
        </div>,
      }] : []}
    />
  );

  return (
    <div data-testid="result-workspace">
      <WorkbenchSurface material={material} />
    </div>
  );
};
