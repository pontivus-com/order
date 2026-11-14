import type { ReactNode } from "react";

import type {
  ArtifactRef,
  Run,
  Sha256,
  WorkItem,
} from "../../src/core/contracts.ts";
import { StageRunMaterial } from "./ActivityWorkspace.tsx";
import { LifecycleDocumentMaterial } from "./DocumentWorkspace.tsx";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { ProposalReview } from "./ProposalReview.tsx";
import {
  runStatusLabel,
  type EvidenceSelection,
  type ProposalSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import {
  WorkflowStepFrame,
  WorkflowStepIndex,
  type WorkflowStepIndexGroup,
} from "./WorkflowStepFrame.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";

export type SharedPreSignoffStage = "R1" | "R2" | "DESIGN" | "PLAN";

const statusVariant = (
  status: Run["status"],
): "error" | "warning" | "success" | "neutral" => {
  if (status === "FAILED" || status === "BLOCKED") return "error";
  if (status === "WAITING_FOR_INPUT") return "warning";
  if (status === "COMPLETED") return "success";
  return "neutral";
};

export const PreSignoffStageWorkspace = ({
  workItem,
  stage,
  runs,
  artifacts,
  material,
  summary,
  onSelectMaterial,
  onDirtyChange,
  onOpenArtifactEvidence,
  onOpenEvidence,
  onOpenProposalReview,
  onReturnFromTransient,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  stage: SharedPreSignoffStage;
  runs: readonly Run[];
  artifacts: readonly ArtifactRef[];
  material: WorkflowMaterial;
  summary: ReactNode;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onDirtyChange: (dirty: boolean) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview: (selection: ProposalSelection) => void;
  onReturnFromTransient: () => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
}>) => {
  const stageRuns = [...runs]
    .filter((run) => run.role === "STAGE" && run.stage === stage)
    .sort((left, right) =>
      right.attempt - left.attempt ||
      right.startedAt.localeCompare(left.startedAt) ||
      right.id.localeCompare(left.id));
  const stageArtifact =
    artifacts.find((artifact) => artifact.role === stage) ?? null;

  const groups: WorkflowStepIndexGroup[] = [];
  if (stageRuns.length > 0) {
    groups.push({
      id: "attempts",
      label: "Activity",
      items: stageRuns.map((run) => ({
        id: run.id,
        label: "Attempt " + run.attempt,
        description: new Date(run.startedAt).toLocaleString(),
        statusLabel: runStatusLabel(run.status),
        statusVariant: statusVariant(run.status),
        selected: material.kind === "STAGE_RUN" && material.runId === run.id,
        onSelect: () => onSelectMaterial({ kind: "STAGE_RUN", runId: run.id }),
      })),
    });
  }
  if (stageArtifact) {
    groups.push({
      id: "document",
      label: "Governed document",
      items: [{
        id: stageArtifact.id,
        label:
          stage === "R1"
            ? "Research document"
            : stage === "R2"
              ? "Requirements document"
              : stage === "DESIGN"
                ? "Solution design document"
                : "Implementation plan document",
        selected:
          material.kind === "STAGE_DOCUMENT" &&
          material.artifactId === stageArtifact.id,
        onSelect: () =>
          onSelectMaterial({
            kind: "STAGE_DOCUMENT",
            artifactId: stageArtifact.id,
          }),
      }],
    });
  }

  const meaningfulObjectCount = stageRuns.length + (stageArtifact ? 1 : 0);
  const index = meaningfulObjectCount >= 2
    ? <WorkflowStepIndex groups={groups} />
    : null;

  const primary = (() => {
    switch (material.kind) {
      case "STAGE_RUN":
        return (
          <StageRunMaterial
            workItem={workItem}
            stage={stage}
            selectedRunId={material.runId}
            onSelectedRunChange={(runId) =>
              onSelectMaterial({ kind: "STAGE_RUN", runId })}
            onOpenEvidence={onOpenEvidence}
            onOpenProposalReview={onOpenProposalReview}
          />
        );
      case "STAGE_DOCUMENT":
        return (
          <LifecycleDocumentMaterial
            workItem={workItem}
            artifactId={material.artifactId}
            onDirtyChange={onDirtyChange}
            onOpenArtifactEvidence={onOpenArtifactEvidence}
            onContextDocumentChange={onContextDocumentChange}
          />
        );
      case "PROPOSAL":
        return (
          <ProposalReview
            workItem={workItem}
            selection={{ runId: material.runId, eventId: material.eventId }}
            onBack={onReturnFromTransient}
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
            title="This workflow step is ready"
            description="Use the current step action to start work."
          />
        );
      case "UNREACHED":
        return (
          <WorkbenchEmptyState
            compact
            title="This workflow step has not been reached"
            description="Workflow inspection does not create or promote lifecycle state."
          />
        );
      default:
        return (
          <WorkbenchEmptyState
            compact
            title="Selected material does not belong to this workflow step"
          />
        );
    }
  })();

  return (
    <WorkflowStepFrame
      summary={summary}
      index={index}
      indexLabel={stage === "PLAN" ? "Plan work" : "Step work"}
      primary={primary}
    />
  );
};
