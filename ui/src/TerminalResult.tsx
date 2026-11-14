import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Tab, TabList } from "@astryxdesign/core/TabList";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type RunEvent,
  type WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  eventEvidence,
  lifecycleArtifactRoleRank,
  type EvidenceSelection,
} from "./workbench-presentation.ts";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";

const resultText = (workItem: WorkItem): string => {
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
      return "Implementation completed with a verified candidate. Detailed task and attempt history remains available under the reached Implementation step.";
    default:
      return "The WorkItem is complete.";
  }
};

const outcomeLabel = (workItem: WorkItem): string =>
  (workItem.outcome ?? "COMPLETE")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^w/, (value) => value.toUpperCase());

const decode = (
  bytes: Uint8Array,
):
  | Readonly<{ kind: "MARKDOWN"; value: string }>
  | Readonly<{ kind: "TEXT"; value: string }> => {
  try {
    const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const markdown = MarkdownTextSchema.safeParse(value);
    return markdown.success
      ? { kind: "MARKDOWN", value: markdown.data }
      : { kind: "TEXT", value };
  } catch {
    const preview = Array.from(
      bytes.slice(0, 256),
      (value) => value.toString(16).padStart(2, "0"),
    ).join(" ");
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
}: Readonly<{
  workItem: WorkItem;
  onOpenEvidence: (selection: EvidenceSelection) => void;
}>) => {
  const evidenceBacked =
    workItem.outcome === "INVESTIGATION_COMPLETE" ||
    workItem.outcome === "AUDIT_COMPLETE";
  const candidateDone = workItem.outcome === "CANDIDATE_DONE";

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
      [...(artifactsQuery.data ?? [])].sort(
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
      if (!selectedArtifact) {
        throw new TypeError("terminal result artifact required");
      }
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });

  const candidateEvidence = candidateRuns.flatMap((run, index) => {
    const events = eventQueries[index]?.data ?? [];
    return events.flatMap((event: RunEvent) =>
      eventEvidence(event).map((evidence) => ({
        runId: run.id,
        role: run.role,
        eventTag: event.event.tag,
        evidence,
      })));
  });
  const uniqueCandidateEvidence = candidateEvidence.filter(
    (candidate, index, all) =>
      all.findIndex(
        (other) =>
          other.runId === candidate.runId &&
          other.evidence.relativePath === candidate.evidence.relativePath,
      ) === index,
  );

  return (
    <section className="order-workspace-section" data-testid="result-workspace">
      <div className="order-result">
        <span className="order-eyebrow">Complete</span>
        <div className="order-result-heading">
          <h2>{outcomeLabel(workItem)}</h2>
          <Badge
            variant={candidateDone ? "success" : "neutral"}
            label={candidateDone ? "Verified candidate" : "Terminal outcome"}
          />
        </div>
        <p>{resultText(workItem)}</p>
      </div>

      {candidateDone ? (
        <div className="order-result-material" data-testid="candidate-result-material">
          <h3>Verified candidate resources</h3>
          {runsQuery.isPending || eventQueries.some((query) => query.isPending) ? (
            <WorkbenchEmptyState compact title="Loading candidate resources…" />
          ) : runsQuery.isError || eventQueries.some((query) => query.isError) ? (
            <WorkbenchErrorState
              title="Candidate resources unavailable"
              description="The candidate is complete, but its persisted evidence could not be loaded."
            />
          ) : uniqueCandidateEvidence.length === 0 ? (
            <WorkbenchEmptyState
              compact
              title="No separate candidate resource is recorded"
              description="The verified task/attempt history remains available under Implementation."
            />
          ) : (
            <div className="order-resource-list">
              {uniqueCandidateEvidence.map((candidate) => (
                <WorkbenchResourceRow
                  key={candidate.runId + ":" + candidate.evidence.relativePath}
                  label={candidate.evidence.relativePath}
                  detail={
                    candidate.eventTag.replaceAll("_", " ").toLowerCase() +
                    " · " +
                    candidate.role.toLowerCase()
                  }
                  actionLabel={"Open " + candidate.evidence.relativePath}
                  onOpen={() =>
                    onOpenEvidence({
                      kind: "EVIDENCE",
                      runId: candidate.runId,
                      relativePath: candidate.evidence.relativePath,
                    })}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {evidenceBacked ? (
        <div className="order-result-material" data-testid="result-material">
          {artifactsQuery.isPending ? (
            <WorkbenchEmptyState compact title="Loading governed result…" />
          ) : artifactsQuery.isError ? (
            <WorkbenchErrorState
              title="Governed result unavailable"
              description={
                artifactsQuery.error instanceof Error
                  ? artifactsQuery.error.message
                  : String(artifactsQuery.error)
              }
            />
          ) : artifacts.length === 0 ? (
            <WorkbenchEmptyState
              title="No governed result artifact"
              description="The terminal classification is canonical, but no current result artifact is available."
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
                    if (artifact) setSelectedArtifactId(artifact.id);
                  }}
                  role="tablist"
                  overflow="scroll"
                >
                  {artifacts.map((artifact) => (
                    <Tab
                      key={artifact.id}
                      value={artifact.id}
                      label={artifact.role}
                    />
                  ))}
                </TabList>
              ) : null}

              {contentQuery.isPending ? (
                <WorkbenchEmptyState compact title="Loading result material…" />
              ) : contentQuery.isError ? (
                <WorkbenchErrorState
                  title="Result material unavailable"
                  description={
                    contentQuery.error instanceof Error
                      ? contentQuery.error.message
                      : String(contentQuery.error)
                  }
                />
              ) : contentQuery.data ? (
                (() => {
                  const content = decode(contentQuery.data);
                  return content.kind === "MARKDOWN" ? (
                    <div className="order-markdown-readonly">
                      <Markdown contentWidth="52rem" contentAlign="start">
                        {content.value}
                      </Markdown>
                    </div>
                  ) : (
                    <div className="order-code-view">
                      <CodeBlock
                        code={content.value}
                        language="plaintext"
                        hasCopyButton
                        width="100%"
                      />
                    </div>
                  );
                })()
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
};
