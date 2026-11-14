import type { ReactNode } from "react";

import type {
  ArtifactRef,
  Run,
  Sha256,
  WorkItem,
} from "../../src/core/contracts.ts";
import { StageRunMaterial } from "./ActivityWorkspace.tsx";
import {
  ReadOnlyLifecycleDocumentMaterial,
} from "./DocumentWorkspace.tsx";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import {
  lifecycleArtifactLabel,
  runStatusLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import {
  PrimaryMaterialFrame,
  WorkflowStepFrame,
  WorkflowStepIndex,
  type WorkflowStepIndexGroup,
} from "./WorkflowStepFrame.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";

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
  summary,
  onSelectMaterial,
  onOpenArtifactEvidence,
  onOpenEvidence,
  onReturnFromTransient,
  onContextDocumentChange,
}: Readonly<{
  workItem: WorkItem;
  runs: readonly Run[];
  artifacts: readonly ArtifactRef[];
  material: WorkflowMaterial;
  summary: ReactNode;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenArtifactEvidence: (artifactId: ArtifactRef["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onReturnFromTransient: () => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
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

  const groups: WorkflowStepIndexGroup[] = [
    {
      id: "review",
      label: "Review",
      items: [{
        id: "readiness-review",
        label: "Readiness review",
        description: readinessArtifact
          ? "Current governed readiness findings"
          : "Review state and findings",
        selected: material.kind === "READINESS_REVIEW",
        onSelect: () => onSelectMaterial({ kind: "READINESS_REVIEW" }),
      }],
    },
  ];

  if (stageRuns.length > 0) {
    groups.push({
      id: "attempts",
      label: "Attempts",
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

  if (packageArtifacts.length > 0) {
    groups.push({
      id: "package",
      label: "Package material",
      items: packageArtifacts.map((artifact) => ({
        id: artifact.id,
        label: lifecycleArtifactLabel(artifact.role),
        description: artifact.repositoryPath,
        selected:
          material.kind === "SUPPORTING_DOCUMENT" &&
          material.artifactId === artifact.id,
        onSelect: () =>
          onSelectMaterial({
            kind: "SUPPORTING_DOCUMENT",
            artifactId: artifact.id,
          }),
      })),
    });
  }

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
            workItem={workItem}
            stage="R3"
            selectedRunId={material.runId}
            onSelectedRunChange={(runId) =>
              onSelectMaterial({ kind: "STAGE_RUN", runId })}
            onOpenEvidence={onOpenEvidence}
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
      index={<WorkflowStepIndex groups={groups} />}
      indexLabel="Readiness material"
      primary={<PrimaryMaterialFrame>{primary}</PrimaryMaterialFrame>}
    />
  );
};
