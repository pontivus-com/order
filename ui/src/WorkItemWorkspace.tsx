import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";

import type { ArtifactRef, Run, Sha256, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runIsActive,
  workflowInspectionTarget,
  workflowPresentation,
  workflowSteps,
  workItemInitialMode,
  workItemModeIsKnown,
  workItemModeLabel,
  type EvidenceSelection,
  type ProposalSelection,
  type WorkflowDocumentTarget,
  type WorkflowStepPresentation,
  type WorkItemMode,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";

const DocumentWorkspace = lazy(() =>
  import("./DocumentWorkspace.tsx").then((module) => ({ default: module.DocumentWorkspace })));
const ActivityWorkspace = lazy(() =>
  import("./ActivityWorkspace.tsx").then((module) => ({ default: module.ActivityWorkspace })));
const SignoffReview = lazy(() =>
  import("./SignoffReview.tsx").then((module) => ({ default: module.SignoffReview })));
const ProposalReview = lazy(() =>
  import("./ProposalReview.tsx").then((module) => ({ default: module.ProposalReview })));
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

export const WorkItemWorkspace = ({
  workItem,
  onBack,
  onOpenContext,
  onContextModeChange,
  onContextDocumentChange,
  onDirtyChange,
}: Readonly<{
  workItem: WorkItem;
  onBack: () => void;
  onOpenContext: () => void;
  onContextModeChange: (mode: WorkItemMode, runId: Run["id"] | null) => void;
  onContextDocumentChange: (path: string | null, sha256: Sha256 | null) => void;
  onDirtyChange: (dirty: boolean) => void;
}>) => {
  const queryClient = useQueryClient();
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) =>
      query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });

  const [mode, setMode] = useState<WorkItemMode | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingMode, setPendingMode] = useState<WorkItemMode | null>(null);
  const [evidence, setEvidence] = useState<EvidenceSelection | null>(null);
  const [proposal, setProposal] = useState<ProposalSelection | null>(null);
  const [returnMode, setReturnMode] = useState<WorkItemMode | null>(null);
  const [selectedActivityRunId, setSelectedActivityRunId] = useState<Run["id"] | null>(null);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(workItem.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [requestedDocument, setRequestedDocument] = useState<Readonly<{
    document: WorkflowDocumentTarget;
    requestId: number;
  }> | null>(null);
  const [unreachedStep, setUnreachedStep] = useState<WorkflowStepPresentation | null>(null);
  const [pendingUnreachedStep, setPendingUnreachedStep] =
    useState<WorkflowStepPresentation | null>(null);
  const [workflowInspectionActive, setWorkflowInspectionActive] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const runs = runsQuery.data ?? [];
  const workflow = workflowPresentation(workItem.stage);

  const sourceDiagnostics = (diagnosticsQuery.data ?? []).filter(
    (item) => item.workItemId === workItem.id || item.path === workItem.sourcePath,
  );

  const visibleModes: readonly WorkItemMode[] = [
    "DOCUMENTS",
    ...(runs.length > 0 ? ["ACTIVITY" as const] : []),
    ...(
      workItem.stage === "AWAITING_SIGNOFF" ||
      workItem.stage === "EXECUTION" ||
      workItem.stage === "COMPLETE" ||
      proposal
        ? ["REVIEW" as const]
        : []
    ),
    ...(workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE"
      ? ["EXECUTION" as const]
      : []),
    ...(evidence ? ["EVIDENCE" as const] : []),
    ...(workItem.stage === "COMPLETE" && workItem.outcome !== "CANDIDATE_DONE"
      ? ["RESULT" as const]
      : []),
  ];

  useEffect(() => {
    headingRef.current?.focus();
  }, [workItem.id]);

  useEffect(() => {
    if (mode !== null) onContextModeChange(mode, selectedActivityRunId);
  }, [mode, onContextModeChange, selectedActivityRunId]);

  useEffect(() => {
    if (runsQuery.isPending) return;
    if (mode === null) {
      setMode(workItemInitialMode(workItem, runs));
      return;
    }
    if (!visibleModes.includes(mode)) {
      setMode(workItemInitialMode(workItem, runs));
      return;
    }
    if (
      runs.some(runIsActive) &&
      mode === "DOCUMENTS" &&
      !dirty &&
      !workflowInspectionActive
    ) {
      setMode("ACTIVITY");
    }
  }, [
    dirty,
    mode,
    runs,
    runsQuery.isPending,
    visibleModes,
    workItem,
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

  const start = useMutation({
    mutationFn: () => api.startInteractiveRun(workItem.id),
    onSuccess: async (run) => {
      setSelectedActivityRunId(run.id);
      await invalidate();
      setMode("ACTIVITY");
    },
  });

  const setDirtyState = (value: boolean): void => {
    setDirty(value);
    onDirtyChange(value);
  };

  const navigate = (
    next: WorkItemMode,
    preserveWorkflowInspection = false,
  ): void => {
    if (!preserveWorkflowInspection) setWorkflowInspectionActive(false);
    if (next === mode && unreachedStep === null) return;
    if (dirty) {
      setPendingMode(next);
      return;
    }
    setUnreachedStep(null);
    setMode(next);
  };

  const inspectWorkflowStep = (step: WorkflowStepPresentation): void => {
    const target = workflowInspectionTarget(workItem, step);
    setWorkflowInspectionActive(true);
    if (target.kind === "UNREACHED") {
      if (dirty) {
        setPendingUnreachedStep(step);
        return;
      }
      setUnreachedStep(step);
      return;
    }
    setUnreachedStep(null);
    if (target.kind === "DOCUMENT") {
      setRequestedDocument((current) => ({
        document: target.document,
        requestId: (current?.requestId ?? 0) + 1,
      }));
      navigate("DOCUMENTS", true);
      return;
    }
    navigate(target.mode, true);
  };

  const openEvidence = (selection: EvidenceSelection): void => {
    if (mode && mode !== "EVIDENCE") setReturnMode(mode);
    setEvidence(selection);
    navigate("EVIDENCE");
  };

  const openArtifactEvidence = (artifactId: ArtifactRef["id"]): void => {
    openEvidence({
      kind: "ARTIFACT",
      artifactId,
      label: "Lifecycle document exact bytes",
    });
  };

  const openProposalReview = (selection: ProposalSelection): void => {
    setSelectedActivityRunId(selection.runId);
    setReturnMode("ACTIVITY");
    setProposal(selection);
    navigate("REVIEW");
  };

  const returnFromTransient = (fallback: WorkItemMode): void => {
    const target = returnMode && visibleModes.includes(returnMode)
      ? returnMode
      : fallback;
    setReturnMode(null);
    if (mode === "REVIEW") setProposal(null);
    if (mode === "EVIDENCE") setEvidence(null);
    navigate(target);
  };

  const canStart =
    preSignoff.has(workItem.stage) &&
    workItem.status === "ACTIVE" &&
    !runs.some(runIsActive);

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
            {canStart && runs.length === 0 ? (
              <WorkbenchAction
                label={"Start " + workflow.label}
                tone="primary"
                loading={start.isPending}
                disabled={dirty}
                onClick={() => start.mutate()}
              />
            ) : null}
          </div>
        </div>
      </header>

      <nav
        className="order-workflow-progression"
        aria-label="Workflow progression"
        data-testid="workflow-progression"
      >
        {workflowSteps.map((step) => {
          const target = workflowInspectionTarget(workItem, step);
          return (
            <button
              key={step.stage}
              type="button"
              aria-current={step.stage === workItem.stage ? "step" : undefined}
              aria-disabled={target.kind === "UNREACHED" ? "true" : undefined}
              data-reached={target.kind === "UNREACHED" ? "false" : "true"}
              title={step.purpose}
              onClick={() => inspectWorkflowStep(step)}
            >
              {step.label}
            </button>
          );
        })}
      </nav>

      {mode !== null ? (
        <div className="order-workspace-view-selector" data-testid="workspace-view-selector">
          <SegmentedControl
            label="Workspace view"
            value={mode}
            onChange={(value) => {
              if (workItemModeIsKnown(value) && visibleModes.includes(value)) navigate(value);
            }}
            size="sm"
          >
            {visibleModes.map((item) => (
              <SegmentedControlItem
                key={item}
                value={item}
                label={workItemModeLabel(item)}
              />
            ))}
          </SegmentedControl>
        </div>
      ) : null}

      {sourceDiagnostics.length > 0 ? (
        <div className="order-primary-blocker" role="alert" data-testid="work-item-source-blocker">
          <div>
            <strong>Work request source needs attention</strong>
            <span>{sourceDiagnostics[0]?.detail}</span>
          </div>
          <WorkbenchAction
            label="Open work request"
            tone="primary"
            onClick={() => navigate("DOCUMENTS")}
          />
          <details className="order-technical-details">
            <summary>Technical details</summary>
            {sourceDiagnostics.map((diagnostic) => (
              <div key={diagnostic.code + (diagnostic.path ?? diagnostic.workItemId ?? "")}>
                <code>{diagnostic.code}</code> · {diagnostic.path ?? diagnostic.workItemId ?? "source"}
              </div>
            ))}
          </details>
        </div>
      ) : null}

      {start.error ? (
        <div className="order-primary-action-error">
          <WorkbenchErrorState
            title="Could not start current workflow step"
            description={start.error instanceof Error ? start.error.message : String(start.error)}
          />
        </div>
      ) : null}

      {mode === null ? (
        <div className="order-mode-canvas">
          <WorkbenchEmptyState compact title="Resolving workspace…" />
        </div>
      ) : (
        <div className="order-mode-canvas" role="region" aria-label={workItemModeLabel(mode) + " workspace"}>
          <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading workspace…</strong></div>}>
            {mode === "DOCUMENTS" ? (
              <DocumentWorkspace
                workItem={workItem}
                onDirtyChange={setDirtyState}
                onOpenArtifactEvidence={openArtifactEvidence}
                requestedDocument={requestedDocument}
                onContextDocumentChange={onContextDocumentChange}
              />
            ) : null}
            {mode === "ACTIVITY" ? (
              <ActivityWorkspace
                workItem={workItem}
                selectedRunId={selectedActivityRunId}
                onSelectedRunChange={setSelectedActivityRunId}
                onOpenEvidence={openEvidence}
                onOpenProposalReview={openProposalReview}
              />
            ) : null}
            {mode === "REVIEW" ? (
              proposal ? (
                <ProposalReview
                  workItem={workItem}
                  selection={proposal}
                  onBackToActivity={() => returnFromTransient("ACTIVITY")}
                />
              ) : (
                <SignoffReview
                  workItem={workItem}
                  onOpenDocuments={() => navigate("DOCUMENTS")}
                />
              )
            ) : null}
            {mode === "EXECUTION" ? (
              <ExecutionWorkspace
                workItem={workItem}
                onOpenEvidence={openEvidence}
                onOpenActivity={(runId) => {
                  setSelectedActivityRunId(runId);
                  navigate("ACTIVITY");
                }}
              />
            ) : null}
            {mode === "EVIDENCE" ? (
              <EvidenceViewer
                selection={evidence}
                onBack={() => returnFromTransient(runs.length > 0 ? "ACTIVITY" : "DOCUMENTS")}
              />
            ) : null}
            {mode === "RESULT" ? <TerminalResult workItem={workItem} /> : null}
          </Suspense>
        </div>
      )}

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
        isOpen={pendingMode !== null}
        onOpenChange={(open) => { if (!open) setPendingMode(null); }}
        title="Discard unsaved Markdown?"
        description="Changing workspace modes would discard the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingMode;
          setPendingMode(null);
          setDirtyState(false);
          if (next) {
            setUnreachedStep(null);
            setMode(next);
          }
        }}
      />

      <AlertDialog
        isOpen={pendingUnreachedStep !== null}
        onOpenChange={(open) => { if (!open) setPendingUnreachedStep(null); }}
        title="Discard unsaved Markdown?"
        description="Inspecting an unreached workflow step would leave the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingUnreachedStep;
          setPendingUnreachedStep(null);
          setDirtyState(false);
          if (next) setUnreachedStep(next);
        }}
      />
    </div>
  );
};
