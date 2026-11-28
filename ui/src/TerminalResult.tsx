import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Tab, TabList } from "@astryxdesign/core/TabList";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type RunEvent,
  type WorkItem,
} from "../../src/core/contracts.ts";
import { reconstructCandidateRounds, candidateFindingDispositions } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  eventEvidence,
  lifecycleArtifactLabel,
  lifecycleArtifactRoleRank,
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
      return "The approved intent is already satisfied by the current repository state.";
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
  onOpenEvidence,
  onCreateRemediation,
}: Readonly<{
  workItem: WorkItem;
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
    enabled: candidateDone,
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
  const accepted = qaHistoryQuery.data?.find(entry => entry.event.tag === "ACCEPT");
  const acceptanceProvenance = finalApprovalQuery.isError || qaHistoryQuery.isError
    ? "Acceptance provenance unavailable."
    : finalApprovalQuery.isPending || (finalApprovalId !== null && qaHistoryQuery.isPending)
      ? "Loading acceptance provenance…"
      : accepted !== undefined && accepted.actor !== null
        ? "Accepted by " + accepted.actor + " · " + new Date(accepted.occurredAt).toLocaleString()
        : qaHistoryQuery.isSuccess && qaHistoryQuery.data.length === 0
          ? "Legacy completion: no human acceptance recorded."
          : "Acceptance provenance unavailable.";

  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
    enabled: evidenceBacked,
  });
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    enabled: candidateDone,
  });

  const tasksQuery = useQuery({
    queryKey: workbenchQueryKeys.tasks(workItem.id),
    queryFn: () => api.listExecutionTasks(workItem.id),
    enabled: candidateDone,
  });

  const candidateRuns = candidateDone
    ? (runsQuery.data ?? []).filter((run) => run.executionTaskId !== null)
    : [];
  const eventQueries = useQueries({
    queries: candidateRuns.map((run) => ({
      queryKey: workbenchQueryKeys.runEvents(run.id),
      queryFn: () => api.listRunEvents(run.id, 0),
      enabled: candidateDone,
    })),
  });

  const artifacts = useMemo(
    () =>
      [...(artifactsQuery.data ?? [])].filter((artifact) => artifact.role === "R1").sort(
        (left, right) =>
          lifecycleArtifactRoleRank(left.role) -
          lifecycleArtifactRoleRank(right.role),
      ),
    [artifactsQuery.data],
  );
  const [selectedArtifactId, setSelectedArtifactId] =
    useState<ArtifactRef["id"] | null>(null);
  const selectedArtifact =
    artifacts.find((artifact) => artifact.id === selectedArtifactId) ??
    artifacts.at(-1) ??
    null;
  const contentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(selectedArtifact?.id ?? null),
    queryFn: () => {
      if (selectedArtifact === null) {
        throw new TypeError("terminal result artifact required");
      }
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });

  const allEvents=eventQueries.flatMap(query=>query.data??[]);
  const exactProofEvents=(()=>{
    if(!qaHistoryQuery.isSuccess||finalApprovalQuery.data==null)return [];
    const history=qaHistoryQuery.data;
    if(history.length===0)return verifiedCandidateProofEvents((tasksQuery.data??[]).filter(task=>task.approvalId===finalApprovalId),candidateRuns,allEvents);
    if(accepted?.event.tag!=="ACCEPT")return [];
    try{
      const rounds=reconstructCandidateRounds(finalApprovalQuery.data,tasksQuery.data??[],candidateRuns,allEvents,history);
      candidateFindingDispositions(history,rounds,tasksQuery.data??[],candidateRuns,allEvents);
      return accepted.event.candidateMembers.flatMap(([,id])=>{
        const member=allEvents.find(event=>event.id===id);
        if(member?.event.tag!=="CANDIDATE_RECORDED")return [];
        const ids=[member.event.candidateStateEventId,...member.event.validationEventIds];
        return ids.flatMap(id=>allEvents.filter(event=>event.id===id));
      });
    }catch{return [];}
  })();
  const candidateEvidence = exactProofEvents.flatMap((event: RunEvent) => {
    const run = candidateRuns.find((candidate) => candidate.id === event.runId);
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

  const material = (
    <WorkbenchResult
      title={workOutcomeProductLabel(workItem.outcome)}
      status={<WorkbenchStatus tone={candidateDone || evidenceBacked ? "success" : "neutral"} label="Complete" />}
      summary={resultExplanation(workItem)}
      action={evidenceBacked && onCreateRemediation !== undefined ? (
        <WorkbenchAction label="Create linked remediation" tone="primary"
          onClick={() => onCreateRemediation(workItem)} />
      ) : undefined}
      resources={candidateDone ? {
        title: "Verified candidate resources",
        content: <div data-testid="candidate-result-material">
          <p>{acceptanceProvenance}</p>
          {runsQuery.isPending || tasksQuery.isPending ||
          eventQueries.some((query) => query.isPending) ? (
            <WorkbenchState
              kind="loading"
              title="Loading candidate resources…"
            />
          ) : runsQuery.isError || tasksQuery.isError ||
            eventQueries.some((query) => query.isError) ? (
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
      sections={evidenceBacked ? [{
        content: <div data-testid="result-material">
          {artifactsQuery.isPending ? (
            <WorkbenchState kind="loading" title="Loading result…" />
          ) : artifactsQuery.isError ? (
            <WorkbenchState
              kind="error"
              title="Result unavailable"
              description={
                artifactsQuery.error instanceof Error
                  ? artifactsQuery.error.message
                  : String(artifactsQuery.error)
              }
            />
          ) : artifacts.length === 0 ? (
            <WorkbenchState
              kind="empty"
              title="No result document is available"
              description="The terminal outcome is canonical, but no current result document is available."
            />
          ) : (
            <>
              {artifacts.length > 1 ? (
                <TabList
                  value={selectedArtifact?.id ?? artifacts[0]!.id}
                  onChange={(value) => {
                    const artifact = artifacts.find(
                      (candidate) => candidate.id === value,
                    );
                    if (artifact !== undefined) {
                      setSelectedArtifactId(artifact.id);
                    }
                  }}
                  role="tablist"
                  overflow="scroll"
                >
                  {artifacts.map((artifact) => (
                    <Tab
                      key={artifact.id}
                      value={artifact.id}
                      label={lifecycleArtifactLabel(artifact.role)}
                    />
                  ))}
                </TabList>
              ) : null}
              {contentQuery.isPending ? (
                <WorkbenchState kind="loading" title="Loading result document…" />
              ) : contentQuery.isError ? (
                <WorkbenchState
                  kind="error"
                  title="Result document unavailable"
                  description={
                    contentQuery.error instanceof Error
                      ? contentQuery.error.message
                      : String(contentQuery.error)
                  }
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
