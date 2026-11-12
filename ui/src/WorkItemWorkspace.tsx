import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Tab, TabList } from "@astryxdesign/core/TabList";

import type { ArtifactRef, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import {
  runIsActive,
  workItemInitialMode,
  workItemModeIsKnown,
  workItemModeLabel,
  type EvidenceSelection,
  type WorkItemMode,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";

const DocumentWorkspace = lazy(() =>
  import("./DocumentWorkspace.tsx").then((module) => ({ default: module.DocumentWorkspace })));
const StageDialogue = lazy(() =>
  import("./StageDialogue.tsx").then((module) => ({ default: module.StageDialogue })));
const SignoffReview = lazy(() =>
  import("./SignoffReview.tsx").then((module) => ({ default: module.SignoffReview })));
const ExecutionWorkspace = lazy(() =>
  import("./ExecutionWorkspace.tsx").then((module) => ({ default: module.ExecutionWorkspace })));
const EvidenceViewer = lazy(() =>
  import("./EvidenceViewer.tsx").then((module) => ({ default: module.EvidenceViewer })));
const TerminalResult = lazy(() =>
  import("./TerminalResult.tsx").then((module) => ({ default: module.TerminalResult })));

export const WorkItemWorkspace = ({
  workItem,
  onBack,
  onOpenContext,
  onDirtyChange,
}: Readonly<{
  workItem: WorkItem;
  onBack: () => void;
  onOpenContext: () => void;
  onDirtyChange: (dirty: boolean) => void;
}>) => {
  const runsQuery = useQuery({
    queryKey: ["runs", workItem.id],
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) =>
      query.state.data?.some(runIsActive) === true ? 1000 : false,
  });

  const [mode, setMode] = useState<WorkItemMode | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingMode, setPendingMode] = useState<WorkItemMode | null>(null);
  const [evidence, setEvidence] = useState<EvidenceSelection | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [workItem.id]);

  useEffect(() => {
    const activeStage = (runsQuery.data ?? []).some(
      (run) => run.role === "STAGE" && runIsActive(run),
    );
    if (mode === null && !runsQuery.isPending) {
      setMode(activeStage ? "DIALOGUE" : workItemInitialMode(workItem));
      return;
    }
    if (activeStage && mode === "DOCUMENTS" && !dirty) setMode("DIALOGUE");
  }, [dirty, mode, runsQuery.data, runsQuery.isPending, workItem]);

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
    setEvidence(selection);
    if (dirty) setPendingMode("EVIDENCE");
    else setMode("EVIDENCE");
  };

  const openArtifactEvidence = (artifactId: ArtifactRef["id"]): void => {
    openEvidence({
      kind: "ARTIFACT",
      artifactId,
      label: "Lifecycle document exact bytes",
    });
  };

  const visibleModes: readonly WorkItemMode[] = [
    "DOCUMENTS",
    ...((runsQuery.data ?? []).some((run) => run.role === "STAGE" && runIsActive(run))
      ? ["DIALOGUE" as const]
      : []),
    ...(workItem.stage === "AWAITING_SIGNOFF" ? ["REVIEW" as const] : []),
    ...(workItem.stage === "EXECUTION" || workItem.outcome === "CANDIDATE_DONE"
      ? ["EXECUTION" as const]
      : []),
    ...(evidence ? ["EVIDENCE" as const] : []),
    ...(workItem.stage === "COMPLETE" && workItem.outcome !== "CANDIDATE_DONE"
      ? ["RESULT" as const]
      : []),
  ];

  return (
    <div className="order-workitem-workspace" data-testid="work-item-workspace">
      <div className="order-workitem-header">
        <div className="order-inline-actions">
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
        <div>
          <h1 ref={headingRef} tabIndex={-1} data-testid="work-item-heading">{workItem.title}</h1>
          <span>{workItem.projectId} · {workItem.stage} · {workItem.status}</span>
        </div>
      </div>

      {mode === null ? (
        <div className="order-mode-canvas">
          <WorkbenchEmptyState compact title="Resolving workspace…" />
        </div>
      ) : (
        <>
          <TabList
            value={mode}
            onChange={(value) => {
              if (workItemModeIsKnown(value) && visibleModes.includes(value)) navigate(value);
            }}
            role="tablist"
            overflow="scroll"
          >
            {visibleModes.map((item) => (
              <Tab key={item} value={item} label={workItemModeLabel(item)} />
            ))}
          </TabList>

          <div className="order-mode-canvas" role="tabpanel">
            <Suspense fallback={<div className="order-state order-state-compact"><strong>Loading workspace…</strong></div>}>
              {mode === "DOCUMENTS" ? (
                <DocumentWorkspace
                  workItem={workItem}
                  onDirtyChange={setDirtyState}
                  onOpenArtifactEvidence={openArtifactEvidence}
                />
              ) : null}
              {mode === "DIALOGUE" ? <StageDialogue workItem={workItem} /> : null}
              {mode === "REVIEW" ? (
                <SignoffReview workItem={workItem} onOpenDocuments={() => navigate("DOCUMENTS")} />
              ) : null}
              {mode === "EXECUTION" ? (
                <ExecutionWorkspace workItem={workItem} onOpenEvidence={openEvidence} />
              ) : null}
              {mode === "EVIDENCE" ? <EvidenceViewer selection={evidence} /> : null}
              {mode === "RESULT" ? <TerminalResult workItem={workItem} /> : null}
            </Suspense>
          </div>
        </>
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
