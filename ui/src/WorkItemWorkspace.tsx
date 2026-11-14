import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";

import type { ArtifactRef, Run, Sha256, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  pendingProposalForEvents,
  resolveWorkflowMaterial,
  runIsActive,
  runStatusLabel,
  unresolvedHumanInput,
  workflowMaterialIdentity,
  workflowPresentation,
  workflowStepState,
  workflowSteps,
  type EvidenceSelection,
  type ProposalSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";
import {
  PrimaryMaterialFrame,
  WorkflowStepFrame,
  WorkflowStepSummary,
} from "./WorkflowStepFrame.tsx";

const SourceDocumentMaterial = lazy(() =>
  import("./DocumentWorkspace.tsx").then((module) => ({ default: module.SourceDocumentMaterial })));
const LifecycleDocumentMaterial = lazy(() =>
  import("./DocumentWorkspace.tsx").then((module) => ({ default: module.LifecycleDocumentMaterial })));
const PreSignoffStageWorkspace = lazy(() =>
  import("./PreSignoffStageWorkspace.tsx").then((module) => ({ default: module.PreSignoffStageWorkspace })));
const ReadinessWorkspace = lazy(() =>
  import("./ReadinessWorkspace.tsx").then((module) => ({ default: module.ReadinessWorkspace })));
const SignoffReview = lazy(() =>
  import("./SignoffReview.tsx").then((module) => ({ default: module.SignoffReview })));
const ExecutionWorkspace = lazy(() =>
  import("./ExecutionWorkspace.tsx").then((module) => ({ default: module.ExecutionWorkspace })));
const EvidenceViewer = lazy(() =>
  import("./EvidenceViewer.tsx").then((module) => ({ default: module.EvidenceViewer })));
const TerminalResult = lazy(() =>
  import("./TerminalResult.tsx").then((module) => ({ default: module.TerminalResult })));

const preSignoff = new Set<WorkItem["stage"]>([
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
]);

type WorkspaceSelection = Readonly<{
  step: WorkItem["stage"];
  material: WorkflowMaterial | null;
}>;

const materialTitle = (
  material: WorkflowMaterial,
  stepLabel: string,
): string => {
  switch (material.kind) {
    case "SOURCE_DOCUMENT":
      return "Work request";
    case "STAGE_RUN":
      return stepLabel + " activity";
    case "STAGE_DOCUMENT":
      return stepLabel + " document";
    case "SUPPORTING_DOCUMENT":
      return "Supporting document";
    case "PROPOSAL":
      return "Proposal review";
    case "READINESS_REVIEW":
      return "Readiness review";
    case "APPROVAL_PACKAGE":
      return "Approval package";
    case "EXECUTION_TASK":
      return "Implementation task";
    case "EVIDENCE":
      return "Evidence";
    case "TERMINAL_RESULT":
      return "Final outcome";
    case "STEP_STATE":
    case "UNREACHED":
      return stepLabel;
  }
};

const startLabelForStage = (stage: WorkItem["stage"]): string =>
  stage === "IDEA"
    ? "Start Research"
    : stage === "PLAN"
      ? "Start Implementation planning"
      : "Start " + workflowPresentation(stage).label;

export const WorkItemWorkspace = ({
  workItem,
  onBack,
  onOpenContext,
  onContextSelectionChange,
  onContextDocumentChange,
  onCreateRemediation,
  onDirtyChange,
}: Readonly<{
  workItem: WorkItem;
  onBack: () => void;
  onOpenContext: () => void;
  onContextSelectionChange: (
    step: WorkItem["stage"],
    material: WorkflowMaterial,
  ) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onCreateRemediation: (workItem: WorkItem) => void;
  onDirtyChange: (dirty: boolean) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<WorkItem["stage"]>(workItem.stage);
  const [explicitMaterial, setExplicitMaterial] = useState<WorkflowMaterial | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<WorkspaceSelection | null>(null);
  const [pendingReturnSelection, setPendingReturnSelection] =
    useState<WorkspaceSelection | null>(null);
  const [returnSelection, setReturnSelection] = useState<WorkspaceSelection | null>(null);
  const [returnFocusName, setReturnFocusName] = useState<string | null>(null);
  const [workflowInspectionActive, setWorkflowInspectionActive] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(workItem.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) =>
      query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
    queryFn: () => api.listLifecycleArtifacts(workItem.id),
  });
  const tasksQuery = useQuery({
    queryKey: workbenchQueryKeys.tasks(workItem.id),
    queryFn: () => api.listExecutionTasks(workItem.id),
    enabled:
      selectedStep === "EXECUTION" ||
      workItem.stage === "EXECUTION" ||
      workItem.stage === "COMPLETE",
  });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });
  const signoffPackageQuery = useQuery({
    queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF",
  });

  const runs = runsQuery.data ?? [];
  const artifacts = artifactsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const workflow = workflowPresentation(workItem.stage);
  const selectedWorkflow = workflowPresentation(selectedStep);
  const sharedPreSignoffStage =
    selectedStep === "R1" ||
    selectedStep === "R2" ||
    selectedStep === "DESIGN" ||
    selectedStep === "PLAN"
      ? selectedStep
      : null;
  const currentProposalRun =
    sharedPreSignoffStage !== null && selectedStep === workItem.stage
      ? [...runs]
          .filter((run) =>
            run.role === "STAGE" &&
            run.stage === sharedPreSignoffStage)
          .sort((left, right) =>
            left.attempt - right.attempt ||
            left.startedAt.localeCompare(right.startedAt) ||
            left.id.localeCompare(right.id))
          .at(-1) ?? null
      : null;
  const proposalEventsQuery = useQuery({
    queryKey: workbenchQueryKeys.runEvents(currentProposalRun?.id ?? null),
    queryFn: () =>
      currentProposalRun
        ? api.listRunEvents(currentProposalRun.id, 0)
        : Promise.resolve([]),
    enabled: currentProposalRun !== null,
    refetchInterval:
      currentProposalRun && runIsActive(currentProposalRun) ? 1000 : false,
  });
  const pendingProposal = pendingProposalForEvents(
    proposalEventsQuery.data ?? [],
  );
  const currentUnresolvedInput = unresolvedHumanInput(
    proposalEventsQuery.data ?? [],
  );

  const selectedTaskId =
    explicitMaterial?.kind === "EXECUTION_TASK"
      ? explicitMaterial.taskId
      : null;
  const selectedRunId =
    explicitMaterial?.kind === "STAGE_RUN"
      ? explicitMaterial.runId
      : explicitMaterial?.kind === "EXECUTION_TASK"
        ? explicitMaterial.runId
        : explicitMaterial?.kind === "PROPOSAL"
          ? explicitMaterial.runId
          : null;

  const material = resolveWorkflowMaterial({
    workItem,
    selectedStep,
    runs,
    artifacts,
    pendingProposal,
    unresolvedInputRunId:
      sharedPreSignoffStage === null
        ? undefined
        : currentUnresolvedInput
          ? currentProposalRun?.id ?? null
          : null,
    approvalPackageAvailable: signoffPackageQuery.data != null,
    tasks,
    selectedTaskId,
    selectedRunId,
    explicitSelection: explicitMaterial,
    dirtyDocument: dirty,
  });

  const evidence =
    material.kind === "EVIDENCE" ? material.selection : null;
  const materialIdentity = workflowMaterialIdentity(material);
  const selectedStepState = workflowStepState(workItem, selectedStep);
  const selectedStateLabel =
    selectedStepState === "CURRENT"
      ? "Current"
      : selectedStepState === "HISTORICAL"
        ? "Reached"
        : "Not reached";
  const selectedStateVariant =
    selectedStepState === "CURRENT" ? "info" as const : "neutral" as const;

  const sourceDiagnostics = (diagnosticsQuery.data ?? []).filter(
    (item) => item.workItemId === workItem.id || item.path === workItem.sourcePath,
  );

  const selectedLatestStageRun =
    selectedStep === "R1" ||
    selectedStep === "R2" ||
    selectedStep === "DESIGN" ||
    selectedStep === "PLAN" ||
    selectedStep === "R3"
      ? [...runs]
          .filter((run) =>
            run.role === "STAGE" &&
            run.stage === selectedStep)
          .sort((left, right) =>
            left.attempt - right.attempt ||
            left.startedAt.localeCompare(right.startedAt) ||
            left.id.localeCompare(right.id))
          .at(-1) ?? null
      : null;
  const selectedStageArtifact =
    selectedStep === "R1" ||
    selectedStep === "R2" ||
    selectedStep === "DESIGN" ||
    selectedStep === "PLAN" ||
    selectedStep === "R3"
      ? artifacts.find((artifact) => artifact.role === selectedStep) ?? null
      : null;
  const ordinaryClassification = (value: string): string =>
    value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^./, (first) => first.toUpperCase());
  const summaryStatusLabel = (() => {
    if (selectedStep === "IDEA") {
      return sourceDiagnostics.length > 0
        ? "Source needs attention"
        : "Source current";
    }
    if (
      selectedStep === "R1" ||
      selectedStep === "R2" ||
      selectedStep === "DESIGN" ||
      selectedStep === "PLAN"
    ) {
      if (pendingProposal && selectedStepState === "CURRENT") {
        return "Proposal review required";
      }
      if (selectedLatestStageRun) {
        const classification =
          selectedLatestStageRun.terminalClassification === null
            ? ""
            : " · " +
              ordinaryClassification(selectedLatestStageRun.terminalClassification);
        const documentState = selectedStageArtifact ? " · document current" : "";
        return runStatusLabel(selectedLatestStageRun.status) +
          classification +
          documentState;
      }
      if (selectedStageArtifact) return "Document current";
      return selectedStepState === "CURRENT" ? "Ready to start" : "No governed material";
    }
    if (selectedStep === "R3") {
      if (selectedStepState === "HISTORICAL") return "Ready for sign-off";
      if (selectedLatestStageRun) {
        return selectedLatestStageRun.terminalClassification
          ? ordinaryClassification(selectedLatestStageRun.terminalClassification)
          : runStatusLabel(selectedLatestStageRun.status);
      }
      return selectedStepState === "CURRENT"
        ? "Review in progress"
        : "Not yet reached";
    }
    if (selectedStep === "AWAITING_SIGNOFF") {
      if (selectedStepState === "HISTORICAL") return "Approved";
      if (selectedStepState === "UNREACHED") return "Not yet reached";
      if (signoffPackageQuery.isPending) return "Resolving package";
      if (signoffPackageQuery.isError || !signoffPackageQuery.data) {
        return "Package unavailable";
      }
      return "Package current · ready to sign";
    }
    if (selectedStep === "COMPLETE") {
      return workItem.outcome
        ? ordinaryClassification(workItem.outcome)
        : selectedStepState === "CURRENT"
          ? "Complete"
          : "Not yet reached";
    }
    return undefined;
  })();
  const summaryStatusVariant =
    selectedStep === "IDEA" && sourceDiagnostics.length > 0
      ? "error" as const
      : selectedLatestStageRun?.status === "FAILED" ||
          selectedLatestStageRun?.status === "BLOCKED"
        ? "error" as const
        : selectedLatestStageRun?.status === "WAITING_FOR_INPUT"
          ? "warning" as const
          : selectedStep === "AWAITING_SIGNOFF" &&
              selectedStepState === "CURRENT" &&
              (signoffPackageQuery.isError || !signoffPackageQuery.data)
            ? "error" as const
            : selectedStep === "COMPLETE" ||
                selectedStepState === "HISTORICAL" ||
                selectedLatestStageRun?.status === "COMPLETED"
              ? "success" as const
              : "neutral" as const;

  useEffect(() => {
    headingRef.current?.focus();
  }, [workItem.id]);

  useEffect(() => {
    onContextSelectionChange(selectedStep, material);
  }, [
    materialIdentity,
    onContextSelectionChange,
    selectedStep,
  ]);

  useEffect(() => {
    if (
      material.kind !== "SOURCE_DOCUMENT" &&
      material.kind !== "STAGE_DOCUMENT" &&
      material.kind !== "SUPPORTING_DOCUMENT" &&
      selectedStep !== "AWAITING_SIGNOFF"
    ) {
      onContextDocumentChange(null, null);
    }
  }, [
    materialIdentity,
    onContextDocumentChange,
    selectedStep,
  ]);

  useEffect(() => {
    if (dirty) return;
    if (!workflowInspectionActive && selectedStep !== workItem.stage) {
      if (selectedStep === "IDEA" && material.kind === "SOURCE_DOCUMENT") {
        setWorkflowInspectionActive(true);
        return;
      }
      setSelectedStep(workItem.stage);
      setExplicitMaterial(null);
      setReturnSelection(null);
    }
  }, [
    dirty,
    material.kind,
    selectedStep,
    workItem.stage,
    workflowInspectionActive,
  ]);

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEventsRoot }),
    ]);
  };

  const titleMutation = useMutation({
    mutationFn: () => api.updateWorkItemTitle(workItem.id, {
      expectedSourceSha256: workItem.sourceSha256,
      title: titleDraft.trim(),
    }),
    onSuccess: async (result) => {
      if (result.tag === "STALE") {
        setTitleError("The WorkItem source changed. Reload the current title before editing again.");
        return;
      }
      setTitleEditing(false);
      setTitleError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSource(workItem.id) }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id) }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
      ]);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.setWorkItemArchived(workItem.id, {
      expectedArchived: workItem.archived,
      archived: !workItem.archived,
    }),
    onSuccess: async () => {
      setConfirmArchive(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id) }),
      ]);
    },
  });

  const commitSelection = (
    next: WorkspaceSelection,
    nextReturnSelection: WorkspaceSelection | null = null,
  ): void => {
    setSelectedStep(next.step);
    setExplicitMaterial(next.material);
    setReturnSelection(nextReturnSelection);
    setWorkflowInspectionActive(next.step !== workItem.stage);
  };

  const requestSelection = (
    next: WorkspaceSelection,
    nextReturnSelection: WorkspaceSelection | null = null,
  ): void => {
    if (dirty) {
      setPendingSelection(next);
      setPendingReturnSelection(nextReturnSelection);
      return;
    }
    commitSelection(next, nextReturnSelection);
  };

  const start = useMutation({
    mutationFn: () => api.startInteractiveRun(workItem.id),
    onSuccess: async (run) => {
      await invalidate();
      commitSelection({
        step: run.stage,
        material: { kind: "STAGE_RUN", runId: run.id },
      });
      setWorkflowInspectionActive(false);
    },
  });

  const setDirtyState = (value: boolean): void => {
    setDirty(value);
    onDirtyChange(value);
  };

  const inspectWorkflowStep = (step: WorkItem["stage"]): void => {
    requestSelection({ step, material: null });
  };

  const focusReturnedControl = (name: string): void => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = Array.from(
          document.querySelectorAll<HTMLButtonElement>("button"),
        ).find((button) =>
          button.getAttribute("aria-label") === name ||
          button.textContent?.trim() === name);
        target?.focus();
      });
    });
  };

  const openEvidence = (selection: EvidenceSelection): void => {
    const origin: WorkspaceSelection = { step: selectedStep, material };
    setReturnFocusName(
      selection.kind === "EVIDENCE"
        ? "Evidence: " + selection.relativePath
        : selection.label === "Lifecycle document exact bytes"
          ? "Inspect exact bytes"
          : "Open " + selection.label,
    );
    requestSelection(
      {
        step: selectedStep,
        material: { kind: "EVIDENCE", selection },
      },
      origin,
    );
  };

  const openArtifactEvidence = (artifactId: ArtifactRef["id"]): void => {
    openEvidence({
      kind: "ARTIFACT",
      artifactId,
      label: "Lifecycle document exact bytes",
    });
  };

  const openProposalReview = (selection: ProposalSelection): void => {
    setReturnFocusName("Review proposed document change");
    const ownerRun = runs.find((run) => run.id === selection.runId);
    const ownerStep = ownerRun?.stage ?? selectedStep;
    const origin: WorkspaceSelection = {
      step: ownerStep,
      material: { kind: "STAGE_RUN", runId: selection.runId },
    };
    requestSelection(
      {
        step: ownerStep,
        material: {
          kind: "PROPOSAL",
          runId: selection.runId,
          eventId: selection.eventId,
        },
      },
      origin,
    );
  };

  const openSupportingMaterial = (nextMaterial: WorkflowMaterial): void => {
    const origin: WorkspaceSelection = { step: selectedStep, material };
    requestSelection(
      { step: selectedStep, material: nextMaterial },
      origin,
    );
  };

  const returnFromTransient = (): void => {
    const origin = returnSelection;
    const focusName = returnFocusName;
    setReturnSelection(null);
    setReturnFocusName(null);
    if (origin) {
      commitSelection(origin);
    } else {
      setExplicitMaterial(null);
    }
    if (focusName) focusReturnedControl(focusName);
  };

  const canStart =
    preSignoff.has(workItem.stage) &&
    workItem.status === "ACTIVE" &&
    !runs.some(runIsActive);
  const startIsOwnedBySelectedStep =
    selectedStep === workItem.stage && canStart;
  const summaryBlocker =
    selectedStep === "IDEA" && sourceDiagnostics[0]
      ? {
          status: "error" as const,
          title: "Work request source needs attention",
          description: sourceDiagnostics[0].detail,
        }
      : start.error && selectedStep === workItem.stage
        ? {
            status: "error" as const,
            title: "Could not start current workflow step",
            description: start.error instanceof Error
              ? start.error.message
              : String(start.error),
          }
        : selectedLatestStageRun &&
            (selectedLatestStageRun.status === "FAILED" ||
              selectedLatestStageRun.status === "BLOCKED")
          ? {
              status: "error" as const,
              title: selectedWorkflow.label + " needs attention",
              description:
                "Inspect the primary failure or blocker receipt for the canonical recovery path.",
            }
          : selectedStep === "AWAITING_SIGNOFF" &&
              selectedStepState === "CURRENT" &&
              signoffPackageQuery.isError
            ? {
                status: "error" as const,
                title: "Approval package unavailable",
                description: signoffPackageQuery.error instanceof Error
                  ? signoffPackageQuery.error.message
                  : String(signoffPackageQuery.error),
              }
            : null;

  const stepSummary = (
    <WorkflowStepSummary
      label={selectedWorkflow.label}
      purpose={selectedWorkflow.purpose}
      stateLabel={selectedStateLabel}
      stateVariant={selectedStateVariant}
      statusLabel={summaryStatusLabel}
      statusVariant={summaryStatusVariant}
      blocker={summaryBlocker}
      action={
        startIsOwnedBySelectedStep ? (
          <WorkbenchAction
            label={startLabelForStage(workItem.stage)}
            tone="primary"
            loading={start.isPending}
            disabled={dirty || start.isPending}
            onClick={() => start.mutate()}
          />
        ) : selectedStep === "COMPLETE" &&
          workItem.stage === "COMPLETE" &&
          (
            workItem.outcome === "INVESTIGATION_COMPLETE" ||
            workItem.outcome === "AUDIT_COMPLETE"
          ) ? (
          <WorkbenchAction
            label="Create linked remediation"
            tone="primary"
            onClick={() => onCreateRemediation(workItem)}
          />
        ) : undefined
      }
    />
  );

  return (
    <div className="order-workitem-workspace" data-testid="work-item-workspace">
      <header className="order-workitem-header order-workitem-top-rail">
        <div className="order-workitem-header-main">
          <div className="order-inline-actions order-workitem-navigation-actions">
            <WorkbenchAction
              label="Back to work queue"
              tone="ghost"
              icon={<WorkbenchIcon name="back" />}
              onClick={onBack}
            />
            <WorkbenchAction
              label="Context"
              tone="ghost"
              icon={<WorkbenchIcon name="context" />}
              onClick={onOpenContext}
            />
          </div>
          <div className="order-workitem-heading-block">
            {titleEditing ? (
              <div className="order-workitem-title-edit">
                <input
                  aria-label="Work item title"
                  value={titleDraft}
                  autoFocus
                  onChange={(event) => setTitleDraft(event.currentTarget.value)}
                />
                <WorkbenchAction
                  label="Save title"
                  tone="primary"
                  loading={titleMutation.isPending}
                  disabled={titleDraft.trim().length === 0 || titleMutation.isPending}
                  onClick={() => titleMutation.mutate()}
                />
                <WorkbenchAction
                  label="Cancel title edit"
                  disabled={titleMutation.isPending}
                  onClick={() => {
                    setTitleDraft(workItem.title);
                    setTitleError(null);
                    setTitleEditing(false);
                  }}
                />
              </div>
            ) : (
              <div className="order-workitem-title-row">
                <h1 ref={headingRef} tabIndex={-1} data-testid="work-item-heading">{workItem.title}</h1>
                {workItem.stage !== "EXECUTION" && workItem.stage !== "COMPLETE" ? (
                  <WorkbenchAction
                    label="Edit title"
                    tone="ghost"
                    onClick={() => {
                      setTitleDraft(workItem.title);
                      setTitleError(null);
                      setTitleEditing(true);
                    }}
                  />
                ) : null}
              </div>
            )}
            <span>{workflow.label} · {workItem.status === "ACTIVE" ? "Active" : workItem.status.toLowerCase()}</span>
            {titleError ? <span role="alert" className="order-error-text">{titleError}</span> : null}
            {titleMutation.error ? (
              <span role="alert" className="order-error-text">
                {titleMutation.error instanceof Error ? titleMutation.error.message : String(titleMutation.error)}
              </span>
            ) : null}
          </div>
          <div className="order-workitem-rail-actions">
            <WorkbenchAction
              label={workItem.archived ? "Restore work item" : "Archive work item"}
              tone="ghost"
              disabled={workItem.stage === "EXECUTION" || runs.some(runIsActive) || archiveMutation.isPending}
              onClick={() => setConfirmArchive(true)}
            />
          </div>
        </div>
      </header>

      <nav
        className="order-workflow-progression"
        aria-label="Workflow progression"
        data-testid="workflow-progression"
      >
        {workflowSteps.map((step) => {
          const state = workflowStepState(workItem, step.stage);
          const selected = step.stage === selectedStep;
          return (
            <button
              key={step.stage}
              type="button"
              aria-current={step.stage === workItem.stage ? "step" : undefined}
              aria-pressed={selected}
              data-reached={state === "UNREACHED" ? "false" : "true"}
              data-selected={selected ? "true" : "false"}
              title={step.purpose}
              onClick={() => inspectWorkflowStep(step.stage)}
            >
              {step.label}
            </button>
          );
        })}
      </nav>

      <div
        className="order-mode-canvas"
        role="region"
        aria-label={selectedWorkflow.label + " workspace"}
        data-testid="workflow-step-workspace"
      >
        {sharedPreSignoffStage ? (
          <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading workflow step…</strong></div>}>
            <PreSignoffStageWorkspace
              workItem={workItem}
              stage={sharedPreSignoffStage}
              runs={runs}
              artifacts={artifacts}
              material={material}
              summary={stepSummary}
              onSelectMaterial={(nextMaterial) =>
                requestSelection({
                  step: sharedPreSignoffStage,
                  material: nextMaterial,
                })}
              onDirtyChange={setDirtyState}
              onOpenArtifactEvidence={openArtifactEvidence}
              onOpenEvidence={openEvidence}
              onOpenProposalReview={openProposalReview}
              onOpenSupportingMaterial={openSupportingMaterial}
              onReturnFromTransient={returnFromTransient}
              onContextDocumentChange={onContextDocumentChange}
            />
          </Suspense>
        ) : selectedStep === "R3" ? (
          <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading readiness review…</strong></div>}>
            <ReadinessWorkspace
              workItem={workItem}
              runs={runs}
              artifacts={artifacts}
              material={material}
              summary={stepSummary}
              onSelectMaterial={(nextMaterial) =>
                requestSelection({
                  step: "R3",
                  material: nextMaterial,
                })}
              onOpenArtifactEvidence={openArtifactEvidence}
              onOpenEvidence={openEvidence}
              onReturnFromTransient={returnFromTransient}
              onContextDocumentChange={onContextDocumentChange}
            />
          </Suspense>
        ) : selectedStep === "AWAITING_SIGNOFF" ? (
          <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading approval package…</strong></div>}>
            <SignoffReview
              workItem={workItem}
              summary={stepSummary}
              onOpenArtifactEvidence={openArtifactEvidence}
              onContextDocumentChange={onContextDocumentChange}
            />
          </Suspense>
        ) : selectedStep === "EXECUTION" ? (
          <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading implementation…</strong></div>}>
            <ExecutionWorkspace
              workItem={workItem}
              material={material}
              onSelectMaterial={(nextMaterial) =>
                requestSelection({
                  step: "EXECUTION",
                  material: nextMaterial,
                })}
              onOpenEvidence={openEvidence}
              onReturnFromEvidence={returnFromTransient}
            />
          </Suspense>
        ) : (
          <WorkflowStepFrame
            summary={stepSummary}
            primary={
            <PrimaryMaterialFrame title={materialTitle(material, selectedWorkflow.label)}>
              <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading workspace…</strong></div>}>
          {material.kind === "SOURCE_DOCUMENT" ? (
            <SourceDocumentMaterial
              workItem={workItem}
              onDirtyChange={setDirtyState}
              onContextDocumentChange={onContextDocumentChange}
            />
          ) : null}
          {material.kind === "STAGE_DOCUMENT" ? (
            <LifecycleDocumentMaterial
              workItem={workItem}
              artifactId={material.artifactId}
              onDirtyChange={setDirtyState}
              onOpenArtifactEvidence={openArtifactEvidence}
              onContextDocumentChange={onContextDocumentChange}
            />
          ) : null}
          {material.kind === "EVIDENCE" ? (
            <EvidenceViewer
              selection={evidence}
              onBack={returnFromTransient}
            />
          ) : null}
          {material.kind === "TERMINAL_RESULT" ? (
            <TerminalResult
              workItem={workItem}
              onOpenEvidence={openEvidence}
            />
          ) : null}
          {material.kind === "STEP_STATE" ? (
            <WorkbenchEmptyState
              compact
              title={
                selectedStep === workItem.stage && canStart
                  ? selectedWorkflow.label + " is ready to start"
                  : "No current material for " + selectedWorkflow.label
              }
              description={
                selectedStep === workItem.stage && canStart
                  ? "Use the current workflow action to begin this step."
                  : "This reached workflow step has no current canonical material to inspect."
              }
            />
          ) : null}
          {material.kind === "UNREACHED" ? (
            <WorkbenchEmptyState
              compact
              title={selectedWorkflow.label + " has not been reached"}
              description="Workflow inspection does not create or promote lifecycle state."
            />
          ) : null}
              </Suspense>
            </PrimaryMaterialFrame>
          }
          />
        )}
      </div>

      <AlertDialog
        isOpen={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={workItem.archived ? "Restore work item?" : "Archive work item?"}
        description={
          workItem.archived
            ? "Restore this WorkItem to the active queue. Its lifecycle and history are unchanged."
            : "Archive this WorkItem from the active queue. Its source, lifecycle documents, Runs, evidence, approvals and history remain intact."
        }
        cancelLabel="Cancel"
        actionLabel={workItem.archived ? "Restore work item" : "Archive work item"}
        onAction={() => archiveMutation.mutate()}
      />

      {archiveMutation.error ? (
        <div className="order-primary-action-error" role="alert">
          {archiveMutation.error instanceof Error ? archiveMutation.error.message : String(archiveMutation.error)}
        </div>
      ) : null}

      <AlertDialog
        isOpen={pendingSelection !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSelection(null);
            setPendingReturnSelection(null);
          }
        }}
        title="Discard unsaved Markdown?"
        description="Changing workflow step or material would discard the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingSelection;
          const nextReturn = pendingReturnSelection;
          setPendingSelection(null);
          setPendingReturnSelection(null);
          setDirtyState(false);
          if (next) commitSelection(next, nextReturn);
        }}
      />
    </div>
  );
};
