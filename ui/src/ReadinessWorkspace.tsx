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
import {
  ReadOnlyLifecycleDocumentMaterial,
} from "./DocumentWorkspace.tsx";
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
  WorkflowStepFrame,
} from "./WorkflowStepFrame.tsx";
import {
  WorkflowMaterialSelector,
  type WorkflowMaterialSelectorGroup,
} from "./WorkflowMaterialSelector.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

const packageRoles = new Set<ArtifactRef["role"]>([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
]);

export const ReadinessWorkspace = ({
  workItem,
  runs,
  runEvents,
  artifacts,
  material,
  materialState,
  summary,
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
    .sort((left, right) =>
      right.attempt - left.attempt ||
      right.startedAt.localeCompare(left.startedAt) ||
      right.id.localeCompare(left.id));
  const packageArtifacts = artifacts
    .filter((artifact) => packageRoles.has(artifact.role))
    .sort((left, right) =>
      left.repositoryPath.localeCompare(right.repositoryPath));
  const latestReadinessRun = stageRuns[0] ?? null;
  const readinessCompletion =
    latestReadinessRun === null
      ? null
      : [...runEvents]
        .filter((candidate) =>
          candidate.runId === latestReadinessRun.id &&
          candidate.event.tag === "STAGE_COMPLETED" &&
          candidate.event.completion.stage === "R3")
        .sort((left, right) => right.sequence - left.sequence)[0] ?? null;
  const readinessOutcome =
    readinessCompletion?.event.tag === "STAGE_COMPLETED" &&
      readinessCompletion.event.completion.stage === "R3"
      ? readinessCompletion.event.completion.outcome
      : null;
  const readinessVerdict =
    readinessOutcome !== null
      ? readinessOutcomeLabel(readinessOutcome)
      : latestReadinessRun?.status === "BLOCKED"
        ? "Blocked"
        : latestReadinessRun?.status === "FAILED"
          ? "Review failed"
          : "Review in progress";

  const selectedSupportingArtifact =
    material.kind === "SUPPORTING_DOCUMENT"
      ? artifacts.find((artifact) => artifact.id === material.artifactId) ?? null
      : null;

  const selectorItems: WorkflowMaterialSelectorGroup["items"] = [
    ...(readinessArtifact ? [{
      id: "readiness-" + readinessArtifact.id,
      label: "Readiness review",
      description: "Governed R3 review material",
      statusLabel: materialState === null ? "Review in progress" : materialPresentationStateLabel(materialState),
      selected: material.kind === "READINESS_REVIEW",
      onSelect: () => onSelectMaterial({ kind: "READINESS_REVIEW" }),
    }] : []),
    ...stageRuns.map((run) => ({
      id: "run-" + run.id,
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
      selected: material.kind === "SUPPORTING_DOCUMENT" && material.artifactId === artifact.id,
      onSelect: () => onSelectMaterial({ kind: "SUPPORTING_DOCUMENT", artifactId: artifact.id }),
    })),
  ];

  const selector = selectorItems.length > 1
    ? <WorkflowMaterialSelector
        groups={[{ id: "readiness", label: "Readiness material", items: selectorItems }]}
        label="Readiness material"
      />
    : undefined;

  const readinessMaterial = readinessArtifact ? (
    <ReadOnlyLifecycleDocumentMaterial
      workItem={workItem}
      artifactId={readinessArtifact.id}
      onOpenArtifactEvidence={onOpenArtifactEvidence}
      onContextDocumentChange={onContextDocumentChange}
      embeddedReadOnly
    />
  ) : (
    <WorkbenchEmptyState
      compact
      title="Readiness review is in progress"
      description="The governed review findings will appear here when available."
    />
  );

  const requiredInputOwnsAttention =
    workItem.stage === "R3" &&
    material.kind === "STAGE_RUN" &&
    material.runId === currentRunId &&
    currentInteraction?.tag === "REQUIRED_INPUT";

  const selectedSecondaryMaterial = (() => {
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
        return selectedSupportingArtifact ? (
          <ReadOnlyLifecycleDocumentMaterial
            workItem={workItem}
            artifactId={selectedSupportingArtifact.id}
            onOpenArtifactEvidence={onOpenArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
          />
        ) : (
          <WorkbenchEmptyState compact title="Supporting document is no longer current" />
        );
      case "EVIDENCE":
        return <EvidenceViewer selection={material.selection} onBack={onReturnFromTransient} />;
      default:
        return null;
    }
  })();

  return (
    <WorkflowStepFrame
      summary={summary}
      primary={
        <div data-testid="review-workspace">
        <WorkbenchReview
          currentness={<WorkbenchStatus
            tone={
              materialState?.tag === "STALE"
                ? "warning"
                : materialState?.tag === "CURRENT" || materialState?.tag === "SIGNED_LOCKED"
                  ? "success"
                  : "info"
            }
            label={
              materialState === null
                ? "Review in progress"
                : materialPresentationStateLabel(materialState)
            }
          />}
          summary={<div><h2>Readiness review</h2></div>}
          selector={selector}
          body={
            <div className="order-readiness-review-body">
              <section className="order-readiness-verdict">
                <strong>Readiness verdict</strong>
                <span>{readinessVerdict}</span>
              </section>
              {requiredInputOwnsAttention && selectedSecondaryMaterial ? (
                <section className="order-readiness-current-interaction">
                  <h3>Waiting for you</h3>
                  {selectedSecondaryMaterial}
                </section>
              ) : null}
              <section className="order-readiness-findings">
                <h3>Findings / defective owner</h3>
                {readinessMaterial}
              </section>
              <div className="order-readiness-support-grid">
                <section>
                  <h3>Package material needed to understand the verdict</h3>
                  <p>{packageArtifacts.length === 0
                    ? "No governed package material is currently available."
                    : "Reached/current package material is available through the Readiness material selector. Unreached documents are not authority."}</p>
                </section>
                <section>
                  <h3>Evidence / attempt history</h3>
                  <p>{stageRuns.length === 0
                    ? "No Readiness attempt history is currently available."
                    : "Readiness attempts are available through the same subordinate selector. Required input may temporarily own attention. Sign-off is not available here."}</p>
                </section>
              </div>
              {!requiredInputOwnsAttention && selectedSecondaryMaterial ? (
                <section className="order-readiness-secondary-material">
                  <h3>Selected supporting material</h3>
                  {selectedSecondaryMaterial}
                </section>
              ) : null}
            </div>
          }
          decisions={<></>}
          technicalDetails={readinessArtifact ? (
            <dl className="order-readiness-technical">
              <div><dt>Artifact role</dt><dd>{readinessArtifact.role}</dd></div>
              <div><dt>Repository path</dt><dd><code>{readinessArtifact.repositoryPath}</code></dd></div>
              <div><dt>SHA-256</dt><dd><code>{readinessArtifact.sha256}</code></dd></div>
            </dl>
          ) : undefined}
        />
        </div>
      }
    />
  );
};
