import type { ReactNode } from "react";

import type {
  ArtifactRef,
  Run,
  RunEvent,
  Sha256,
  WorkItem,
} from "../../src/core/contracts.ts";
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
  readinessOutcomeLabel,
  runStatusLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import {
  WorkflowMaterialSelector,
  type WorkflowMaterialSelectorGroup,
} from "./WorkflowMaterialSelector.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

const packageRoles = new Set<ArtifactRef["role"]>([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
]);

const readinessTone = (
  outcome: string | null,
  runStatus: Run["status"] | null,
): "success" | "warning" | "danger" | "info" => {
  if (outcome === "READY_FOR_SIGNOFF") return "success";
  if (outcome?.startsWith("RETURN_TO_")) return "warning";
  if (runStatus === "BLOCKED" || runStatus === "FAILED") return "danger";
  return "info";
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
  summary: ReactNode;
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

  const selectorItems: WorkflowMaterialSelectorGroup["items"] = [
    ...(readinessArtifact === null
      ? []
      : [{
        id: "review-" + readinessArtifact.id,
        label: "Readiness review",
        description: "Governed R3 review material",
        statusLabel:
          materialState === null
            ? "Review in progress"
            : materialPresentationStateLabel(materialState),
        selected: material.kind === "READINESS_REVIEW",
        onSelect: () => onSelectMaterial({ kind: "READINESS_REVIEW" }),
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

  const selector =
    selectorItems.length > 1
      ? (
        <WorkflowMaterialSelector
          groups={[
            {
              id: "readiness",
              label: "Readiness material",
              items: selectorItems,
            },
          ]}
          label="Readiness material"
        />
      )
      : null;

  const reviewMaterial =
    readinessArtifact === null
      ? (
        <WorkbenchState
          kind="empty"
          title="Readiness review is in progress"
          description="The governed review findings will appear here when available."
        />
      )
      : (
        <ReadOnlyLifecycleDocumentMaterial
          workItem={workItem}
          artifactId={readinessArtifact.id}
          onOpenArtifactEvidence={onOpenArtifactEvidence}
          onContextDocumentChange={onContextDocumentChange}
          embeddedReadOnly
        />
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
            selector={selector ?? undefined}
            summary={
              <div>
                <h2>Readiness review</h2>
                <p>Independent verdict and findings govern whether Approval may begin.</p>
              </div>
            }
            body={
              <div className="order-review-readiness-body">
                {reviewNotice}
                {requiredInputOwnsAttention && selectedSecondary !== null ? (
                  <section
                    className="order-review-readiness-attention"
                    data-testid="readiness-current-attention"
                    aria-label="Readiness current attention"
                  >
                    <h3>Waiting for you</h3>
                    {selectedSecondary}
                  </section>
                ) : null}

                <section
                  className="order-review-readiness-verdict"
                  data-testid="readiness-verdict"
                  aria-label="Readiness verdict"
                >
                  <div>
                    <strong>Readiness verdict</strong>
                    <span>
                      {outcome?.startsWith("RETURN_TO_")
                        ? "The typed R3 result returns workflow ownership to the named upstream stage."
                        : outcome === "READY_FOR_SIGNOFF"
                          ? "The typed R3 result admits the exact package to Approval."
                          : "Verdict is derived only from the current canonical R3 result."}
                    </span>
                  </div>
                  <WorkbenchStatus
                    tone={readinessTone(outcome, latestRun?.status ?? null)}
                    label={verdict}
                  />
                </section>

                <section
                  className="order-review-readiness-findings"
                  aria-label="Readiness findings"
                >
                  <h3>Findings / defective owner</h3>
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
                </section>

                {!requiredInputOwnsAttention && selectedSecondary !== null ? (
                  <section
                    className="order-review-readiness-selected"
                    aria-label="Selected Readiness supporting material"
                  >
                    <h3>Selected supporting material</h3>
                    {selectedSecondary}
                  </section>
                ) : null}
              </div>
            }
            decisions={reviewAction ?? <></>}
          />
    </div>
  );
};
