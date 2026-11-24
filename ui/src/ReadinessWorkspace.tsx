import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@astryxdesign/core/Markdown";

import {
  MarkdownTextSchema,
  type ArtifactRef,
  type Run,
  type RunEvent,
  type Sha256,
  type WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import type {
  CurrentAttentionTag,
  MaterialPresentationState,
  StageRunInteraction,
} from "../../src/core/lifecycle.ts";
import { StageRunMaterial } from "./ActivityWorkspace.tsx";
import { ReadOnlyLifecycleDocumentMaterial } from "./DocumentWorkspace.tsx";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import {
  lifecycleArtifactLabel,
  materialPresentationStateLabel,
  readinessOutcomeDescription,
  readinessOutcomeLabel,
  readinessOutcomeTone,
  runStatusLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

type ReadinessResourceItem = Readonly<{
  id: string;
  label: string;
  description?: string;
  statusLabel?: string;
  selected: boolean;
  onSelect: () => void;
}>;

const packageRoles = new Set<ArtifactRef["role"]>([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
]);

const decodeCanonicalMarkdown = (bytes: Uint8Array): string | null => {
  try {
    const parsed = MarkdownTextSchema.safeParse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const readinessFindingsMarkdown = (markdown: string): string | null => {
  const lines = markdown.split("\n");
  const selected: string[] = [];
  let include = false;

  for (const line of lines) {
    const heading = /^(#{2,6})\s+(.+?)\s*$/.exec(line);
    if (heading !== null) {
      const label = (heading[2] ?? "").trim().toLowerCase();
      include =
        label === "findings" ||
        label === "r3 findings" ||
        label === "package judgment";
      continue;
    }
    if (include) selected.push(line);
  }

  const value = selected.join("\n").trim();
  return value.length === 0 ? null : value;
};

export const ReadinessWorkspace = ({
  workItem,
  runs,
  runEvents,
  artifacts,
  material,
  materialState,
  reviewNotice,
  reviewAction,
  currentRunId,
  currentInteraction,
  currentAttention,
  focusedRequiredInputEventId,
  mutationsDisabled = false,
  onRequiredInputFocused,
  onSelectMaterial,
  onOpenArtifactEvidence,
  onOpenEvidence,
  onReturnFromTransient,
  onContextDocumentChange,
  onMutationRefresh,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  runs: readonly Run[];
  runEvents: readonly RunEvent[];
  artifacts: readonly ArtifactRef[];
  material: WorkflowMaterial;
  materialState: MaterialPresentationState | null;
  reviewNotice?: ReactNode;
  reviewAction?: ReactNode;
  currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag;
  focusedRequiredInputEventId: RunEvent["id"] | null;
  mutationsDisabled?: boolean;
  onRequiredInputFocused: (eventId: RunEvent["id"]) => void;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onReturnFromTransient: () => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onMutationRefresh: (acceptedEvent?: RunEvent) => Promise<void>;
  onMutationError?: (error: unknown) => void;
}>) => {
  const readinessArtifact =
    artifacts.find((artifact) => artifact.role === "R3") ?? null;
  const readinessContentQuery = useQuery({
    queryKey: workbenchQueryKeys.artifactContent(readinessArtifact?.id ?? null),
    queryFn: () => {
      if (readinessArtifact === null) {
        throw new TypeError("readiness artifact selection required");
      }
      return api.readArtifactContent(readinessArtifact.id);
    },
    enabled: readinessArtifact !== null,
  });
  const readinessMarkdown =
    readinessContentQuery.data === undefined
      ? null
      : decodeCanonicalMarkdown(readinessContentQuery.data);
  const findingsMarkdown =
    readinessMarkdown === null
      ? null
      : readinessFindingsMarkdown(readinessMarkdown);

  const stageRuns = [...runs]
    .filter((run) => run.role === "STAGE" && run.stage === "R3")
    .sort(
      (left, right) =>
        right.attempt - left.attempt ||
        right.startedAt.localeCompare(left.startedAt) ||
        right.id.localeCompare(left.id),
    );
  const latestRun = stageRuns[0] ?? null;
  const completion =
    latestRun === null
      ? null
      : [...runEvents]
        .filter(
          (event) =>
            event.runId === latestRun.id &&
            event.event.tag === "STAGE_COMPLETED" &&
            event.event.completion.stage === "R3",
        )
        .sort((left, right) => right.sequence - left.sequence)[0] ?? null;
  const outcome =
    completion?.event.tag === "STAGE_COMPLETED" &&
      completion.event.completion.stage === "R3"
      ? completion.event.completion.outcome
      : null;

  const verdict =
    outcome !== null
      ? readinessOutcomeLabel(outcome)
      : latestRun?.status === "BLOCKED"
        ? "Blocked"
        : latestRun?.status === "FAILED"
          ? "Review failed"
          : "Review in progress";

  const packageArtifacts = artifacts
    .filter((artifact) => packageRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));

  const selectedSupportingArtifact =
    material.kind === "SUPPORTING_DOCUMENT"
      ? artifacts.find((artifact) => artifact.id === material.artifactId) ?? null
      : null;

  const relatedItems: ReadinessResourceItem[] = [
    ...(readinessArtifact === null
      ? []
      : [{
        id: "review-" + readinessArtifact.id,
        label: "Readiness review document",
        description: "Inspect the exact governed R3 material",
        statusLabel:
          materialState === null
            ? "Review in progress"
            : materialPresentationStateLabel(materialState),
        selected: false,
        onSelect: () => onOpenArtifactEvidence(readinessArtifact.id),
      }]),
    ...stageRuns.map((run) => ({
      id: "attempt-" + run.id,
      label: "Readiness attempt " + run.attempt,
      description: new Date(run.startedAt).toLocaleString(),
      statusLabel: runStatusLabel(run.status),
      selected: material.kind === "STAGE_RUN" && material.runId === run.id,
      onSelect: () => onSelectMaterial({ kind: "STAGE_RUN", runId: run.id }),
    })),
    ...packageArtifacts.map((artifact) => ({
      id: "package-" + artifact.id,
      label: lifecycleArtifactLabel(artifact.role),
      description: "Read-only governed package material",
      selected:
        material.kind === "SUPPORTING_DOCUMENT" &&
        material.artifactId === artifact.id,
      onSelect: () =>
        onSelectMaterial({
          kind: "SUPPORTING_DOCUMENT",
          artifactId: artifact.id,
        }),
    })),
  ];

  const reviewMaterial =
    readinessArtifact === null
      ? (
        <WorkbenchState
          kind="empty"
          title="Readiness review is in progress"
          description="The governed review findings will appear here when available."
        />
      )
      : readinessContentQuery.isPending
        ? <WorkbenchState kind="loading" title="Loading readiness findings…" />
        : readinessContentQuery.isError
          ? (
            <WorkbenchState
              kind="error"
              title="Readiness findings unavailable"
              description="Open the exact governed Readiness review document for inspection."
            />
          )
          : findingsMarkdown === null
            ? (
              <WorkbenchState
                kind="empty"
                title="No separate readiness findings were recorded"
                description="Open the exact governed Readiness review document for inspection."
              />
            )
            : (
              <div className="order-review-readiness-findings-content">
                <Markdown
                  contentWidth="var(--order-prose-max-width)"
                  contentAlign="start"
                >
                  {findingsMarkdown}
                </Markdown>
              </div>
            );

  const requiredInputOwnsAttention =
    workItem.stage === "R3" &&
    material.kind === "STAGE_RUN" &&
    material.runId === currentRunId &&
    currentInteraction?.tag === "REQUIRED_INPUT";

  const selectedSecondary = (() => {
    switch (material.kind) {
      case "STAGE_RUN":
        return (
          <StageRunMaterial
            stage="R3"
            runs={runs}
            runEvents={runEvents}
            selectedRunId={material.runId}
            currentRunId={workItem.stage === "R3" ? currentRunId : null}
            currentInteraction={workItem.stage === "R3" ? currentInteraction : null}
            currentAttention={currentAttention}
            focusedRequiredInputEventId={focusedRequiredInputEventId}
            mutationsDisabled={mutationsDisabled}
            onRequiredInputFocused={onRequiredInputFocused}
            onSelectedRunChange={(runId) =>
              onSelectMaterial({ kind: "STAGE_RUN", runId })}
            onOpenEvidence={onOpenEvidence}
            onMutationRefresh={onMutationRefresh}
            onMutationError={onMutationError}
          />
        );

      case "SUPPORTING_DOCUMENT":
        return selectedSupportingArtifact === null
          ? (
            <WorkbenchState
              kind="empty"
              title="Supporting document is no longer current"
            />
          )
          : (
            <ReadOnlyLifecycleDocumentMaterial
              workItem={workItem}
              artifactId={selectedSupportingArtifact.id}
              onOpenArtifactEvidence={onOpenArtifactEvidence}
              onContextDocumentChange={onContextDocumentChange}
            />
          );

      case "EVIDENCE":
        return (
          <EvidenceViewer
            selection={material.selection}
            onBack={onReturnFromTransient}
          />
        );

      default:
        return null;
    }
  })();

  const historicalRunSelected =
    material.kind === "STAGE_RUN" &&
    material.runId !== currentRunId;

  if (
    selectedSecondary !== null &&
    (requiredInputOwnsAttention || historicalRunSelected)
  ) {
    return (
      <div data-testid="review-workspace">
        {requiredInputOwnsAttention ? null : (
          <div className="order-inline-actions">
            <WorkbenchAction
              label="Back to Readiness review"
              tone="ghost"
              onClick={onReturnFromTransient}
            />
          </div>
        )}
        {selectedSecondary}
      </div>
    );
  }

  if (
    selectedSecondary !== null &&
    material.kind === "SUPPORTING_DOCUMENT"
  ) {
    return (
      <div data-testid="review-workspace">
        <section className="order-productive-transient">
          <WorkbenchAction
            label="Back to Readiness review"
            tone="ghost"
            onClick={onReturnFromTransient}
          />
          {selectedSecondary}
        </section>
      </div>
    );
  }

  if (
    selectedSecondary !== null &&
    material.kind === "EVIDENCE"
  ) {
    return (
      <div data-testid="review-workspace">
        {selectedSecondary}
      </div>
    );
  }

  const currentness = (
    <WorkbenchStatus
      tone={
        materialState?.tag === "STALE"
          ? "warning"
          : materialState?.tag === "CURRENT" ||
              materialState?.tag === "SIGNED_LOCKED"
            ? "success"
            : "info"
      }
      label={
        materialState === null
          ? "Review in progress"
          : materialPresentationStateLabel(materialState)
      }
    />
  );

  return (
    <div data-testid="review-workspace">
      <WorkbenchReview
            currentness={currentness}
            summary={
              <div>
                <h2>Readiness review</h2>
                <p>Independent verdict and findings govern whether Approval may begin.</p>
              </div>
            }
            body={
              <div className="order-review-readiness-body">
                {reviewNotice}
                <section
                  className="order-review-readiness-verdict"
                  data-testid="readiness-verdict"
                  aria-label="Readiness verdict"
                >
                  <div>
                    <strong>Readiness verdict</strong>
                    <span>
                      {readinessOutcomeDescription(outcome)}
                    </span>
                  </div>
                  <WorkbenchStatus
                    tone={readinessOutcomeTone(outcome, latestRun?.status ?? null)}
                    label={verdict}
                  />
                </section>

                <section
                  className="order-review-readiness-findings"
                  aria-label="Readiness findings"
                >
                  <h3>{outcome?.startsWith("RETURN_TO_") ? "Findings / return owner" : "Findings"}</h3>
                  {outcome?.startsWith("RETURN_TO_") ? (
                    <p className="order-review-readiness-return-owner">
                      {readinessOutcomeLabel(outcome)}
                    </p>
                  ) : null}
                  {reviewMaterial}
                </section>

                <section
                  className="order-review-readiness-support"
                  aria-label="Readiness package coherence and history"
                >
                  <div className="order-review-readiness-support-grid">
                    <section>
                      <h3>Package material needed to understand the verdict</h3>
                      <p>
                        {packageArtifacts.length === 0
                          ? "No governed package material is currently available."
                          : packageArtifacts.length +
                            " reached/current governed package document" +
                            (packageArtifacts.length === 1 ? "" : "s") +
                            " available for read-only inspection."}
                      </p>
                    </section>
                    <section>
                      <h3>Evidence / attempt history</h3>
                      <p>
                        {stageRuns.length === 0
                          ? "No Readiness attempt history is currently available."
                          : stageRuns.length +
                            " Readiness attempt" +
                            (stageRuns.length === 1 ? "" : "s") +
                            " available. Sign-off is never available in Readiness."}
                      </p>
                    </section>
                  </div>
                  {relatedItems.filter((item) => item.selected !== true).length === 0 ? null : (
                    <div className="order-resource-list">
                      {relatedItems
                        .filter((item) => item.selected !== true)
                        .map((item) => (
                          <WorkbenchResourceRow
                            key={item.id}
                            label={item.label}
                            detail={[item.description, item.statusLabel]
                              .filter(Boolean)
                              .join(" · ") || undefined}
                            actionLabel={"Open " + item.label}
                            onOpen={item.onSelect}
                          />
                        ))}
                    </div>
                  )}
                </section>

              </div>
            }
            decisions={reviewAction ?? <></>}
          />
    </div>
  );
};
