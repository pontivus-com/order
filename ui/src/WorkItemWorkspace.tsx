import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";

import type { ArtifactRef, Run, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runIsActive,
  workflowPresentation,
  workflowSteps,
  workItemInitialMode,
  workItemModeIsKnown,
  workItemModeLabel,
  type EvidenceSelection,
  type ProposalSelection,
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
  showContextAction,
  onDirtyChange,
}: Readonly<{
  workItem: WorkItem;
  onBack: () => void;
  onOpenContext: () => void;
  showContextAction: boolean;
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const runs = runsQuery.data ?? [];
  const workflow = workflowPresentation(workItem.stage);

  const sourceDiagnostics = (diagnosticsQuery.data ?? []).filter(
    (item) => item.workItemId === workItem.id || item.path === workItem.sourcePath,
  );

  const visibleModes: readonly WorkItemMode[] = [
    "DOCUMENTS",
    ...(runs.length > 0 ? ["ACTIVITY" as const] : []),
    ...(workItem.stage === "AWAITING_SIGNOFF" || proposal ? ["REVIEW" as const] : []),
    ...(workItem.stage === "EXECUTION" || workItem.outcome === "CANDIDATE_DONE"
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
      !dirty
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
  ]);

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEventsRoot }),
    ]);
  };

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

  const navigate = (next: WorkItemMode): void => {
    if (next === mode) return;
    if (dirty) setPendingMode(next);
    else setMode(next);
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
      <header className="order-workitem-header">
        <div className="order-workitem-header-main">
          <div className="order-inline-actions">
            <WorkbenchAction
              label="Back to work queue"
              tone="ghost"
              icon={<WorkbenchIcon name="back" />}
              onClick={onBack}
            />
            {showContextAction ? (
              <WorkbenchAction
                label="Context"
                tone="ghost"
                icon={<WorkbenchIcon name="context" />}
                onClick={onOpenContext}
              />
            ) : null}
          </div>
          <div className="order-workitem-heading-block">
            <h1 ref={headingRef} tabIndex={-1} data-testid="work-item-heading">{workItem.title}</h1>
            <span>{workflow.label} · {workItem.status === "ACTIVE" ? "Active" : workItem.status.toLowerCase()}</span>
          </div>
          {canStart && runs.length === 0 ? (
            <WorkbenchAction
              label={"Start " + workflow.label}
              tone="primary"
              loading={start.isPending}
              disabled={dirty}
              onClick={() => start.mutate()}
            />
          ) : null}
          {mode !== null ? (
            <SegmentedControl
              label="Workspace mode"
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
          ) : null}
        </div>
        <div className="order-workflow-orientation" data-testid="workflow-orientation">
          <div className="order-current-workflow-step">
            <strong>{workflow.label}</strong>
            <span>{workflow.purpose}</span>
          </div>
          <ol aria-label="Workflow progression">
            {workflowSteps.map((step) => (
              <li
                key={step.stage}
                aria-current={step.stage === workItem.stage ? "step" : undefined}
                title={step.purpose}
              >
                {step.label}
              </li>
            ))}
          </ol>
        </div>
      </header>

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
          if (next) setMode(next);
        }}
      />
    </div>
  );
};
