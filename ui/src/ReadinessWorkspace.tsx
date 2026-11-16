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
  runStatusLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import {
  WorkflowStepFrame,
} from "./WorkflowStepFrame.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

const statusVariant = (
  status: Run["status"],
): "error" | "warning" | "success" | "neutral" => {
  if (status === "FAILED" || status === "BLOCKED") return "error";
  if (status === "WAITING_FOR_INPUT") return "warning";
  if (status === "COMPLETED") return "success";
  return "neutral";
};

const packageRoles = new Set<ArtifactRef["role"]>([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
]);

export const ReadinessWorkspace = ({
  workItem,
  runs,
  artifacts,
  material,
  materialState,
  summary,
  currentRunId,
  currentInteraction,
  currentAttention,
  mutationsDisabled = false,
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
  artifacts: readonly ArtifactRef[];
  material: WorkflowMaterial;
  materialState: MaterialPresentationState | null;
  summary: ReactNode;
  currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag;
  mutationsDisabled?: boolean;
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

  const supportingMaterial =
    stageRuns.length > 0 || packageArtifacts.length > 0 ? (
      <WorkbenchDisclosure
        label="Package material and attempt history"
        content={
          <div className="order-resource-list">
            {stageRuns.map((run) => (
              <WorkbenchResourceRow
                key={run.id}
                label={"Readiness attempt " + run.attempt}
                detail={runStatusLabel(run.status) + " · " + new Date(run.startedAt).toLocaleString()}
                actionLabel={"Open readiness attempt " + run.attempt}
                onOpen={() => onSelectMaterial({ kind: "STAGE_RUN", runId: run.id })}
              />
            ))}
            {packageArtifacts.map((artifact) => (
              <WorkbenchResourceRow
                key={artifact.id}
                label={lifecycleArtifactLabel(artifact.role)}
                detail="Read-only governed package material"
                actionLabel={"Open " + lifecycleArtifactLabel(artifact.role)}
                onOpen={() => onSelectMaterial({ kind: "SUPPORTING_DOCUMENT", artifactId: artifact.id })}
              />
            ))}
          </div>
        }
      />
    ) : null;

  const selectedSupportingArtifact =
    material.kind === "SUPPORTING_DOCUMENT"
      ? artifacts.find((artifact) => artifact.id === material.artifactId) ?? null
      : null;

  const primary = (() => {
    switch (material.kind) {
      case "READINESS_REVIEW":
        return readinessArtifact ? (
          <ReadOnlyLifecycleDocumentMaterial
            workItem={workItem}
            artifactId={readinessArtifact.id}
            onOpenArtifactEvidence={onOpenArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
          />
        ) : (
          <WorkbenchEmptyState
            compact
            title="Readiness review is in progress"
            description="The governed review findings will appear here when available."
          />
        );
      case "STAGE_RUN":
        return (
          <StageRunMaterial
            stage="R3"
            runs={runs}
            selectedRunId={material.runId}
            currentRunId={workItem.stage === "R3" ? currentRunId : null}
            currentInteraction={workItem.stage === "R3" ? currentInteraction : null}
            currentAttention={currentAttention}
            mutationsDisabled={mutationsDisabled}
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
          <WorkbenchEmptyState
            compact
            title="Supporting document is no longer current"
          />
        );
      case "EVIDENCE":
        return (
          <EvidenceViewer
            selection={material.selection}
            onBack={onReturnFromTransient}
          />
        );
      case "STEP_STATE":
        return (
          <WorkbenchEmptyState
            compact
            title="Readiness review is ready to start"
          />
        );
      case "UNREACHED":
        return (
          <WorkbenchEmptyState
            compact
            title="Readiness review has not been reached"
          />
        );
      default:
        return (
          <WorkbenchEmptyState
            compact
            title="Selected material does not belong to Readiness review"
          />
        );
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
          summary={<div><h2>Readiness review</h2><p>Independent verification of the exact governed package.</p></div>}
          body={
            <div className="order-review-material-stack">
              {primary}
              {supportingMaterial ? <div className="order-review-supporting-disclosure">{supportingMaterial}</div> : null}
            </div>
          }
          decisions={<></>}
        />
        </div>
      }
    />
  );
};
