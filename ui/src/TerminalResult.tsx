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
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  eventEvidence,
  lifecycleArtifactLabel,
  lifecycleArtifactRoleRank,
  runRoleLabel,
  workOutcomeProductLabel,
  type EvidenceSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
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
      if (selectedArtifact === null) {
        throw new TypeError("terminal result artifact required");
      }
      return api.readArtifactContent(selectedArtifact.id);
    },
    enabled: selectedArtifact !== null,
  });

  const candidateEvidence = candidateRuns.flatMap((run, runIndex) => {
    const events = eventQueries[runIndex]?.data ?? [];
    return events.flatMap((event: RunEvent) =>
      eventEvidence(event).map((proof) => ({
        runId: run.id,
        role: run.role,
        proof,
      }))
    );
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
    <div className="order-terminal-result">
      <section
        className="order-terminal-outcome"
        data-testid="final-governed-outcome"
      >
        <WorkbenchSectionHeader
          title={workOutcomeProductLabel(workItem.outcome)}
          description={resultExplanation(workItem)}
          action={
            evidenceBacked && onCreateRemediation !== undefined ? (
              <WorkbenchAction
                label="Create linked remediation"
                tone="primary"
                onClick={() => onCreateRemediation(workItem)}
              />
            ) : undefined
          }
        />
      </section>

      {candidateDone ? (
        <section
          className="order-terminal-resources"
          data-testid="candidate-result-material"
        >
          <WorkbenchSectionHeader title="Verified candidate resources" />
          {runsQuery.isPending ||
          eventQueries.some((query) => query.isPending) ? (
            <WorkbenchState
              kind="loading"
              title="Loading candidate resources…"
            />
          ) : runsQuery.isError ||
            eventQueries.some((query) => query.isError) ? (
            <WorkbenchState
              kind="error"
              title="Candidate resources unavailable"
              description="The candidate is complete, but its persisted evidence could not be loaded."
            />
          ) : uniqueCandidateEvidence.length === 0 ? (
            <WorkbenchState
              kind="empty"
              title="No separate candidate resource is recorded"
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
                  detail: "Verified implementation evidence",
                  action: (
                    <WorkbenchAction
                      label={"Open " + label}
                      tone="ghost"
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
        </section>
      ) : null}

      {evidenceBacked ? (
        <section
          className="order-terminal-result-content"
          data-testid="result-material"
        >
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
        </section>
      ) : null}
    </div>
  );

  return (
    <div data-testid="result-workspace">
      <WorkbenchSurface material={material} />
    </div>
  );
};
