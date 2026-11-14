import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";
import { ChatComposer } from "@astryxdesign/core/Chat";

import type { Run, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";
import {
  runIsActive,
  runNeedsAttention,
  runRoleLabel,
  runStatusLabel,
  unresolvedHumanInput,
  workflowPresentation,
  type EvidenceSelection,
  type ProposalSelection,
} from "./workbench-presentation.ts";

export type PreSignoffStage = "R1" | "R2" | "DESIGN" | "PLAN" | "R3";

const statusVariant = (
  status: Run["status"],
): "error" | "warning" | "success" | "neutral" => {
  if (status === "FAILED" || status === "BLOCKED") return "error";
  if (status === "WAITING_FOR_INPUT") return "warning";
  if (status === "COMPLETED") return "success";
  return "neutral";
};

const latestStageRun = (
  runs: readonly Run[],
  stage: PreSignoffStage,
): Run | null =>
  runs
    .filter((run) => run.role === "STAGE" && run.stage === stage)
    .sort((left, right) =>
      left.attempt - right.attempt ||
      left.startedAt.localeCompare(right.startedAt) ||
      left.id.localeCompare(right.id))
    .at(-1) ?? null;

export const StageRunMaterial = ({
  workItem,
  stage,
  selectedRunId,
  onSelectedRunChange,
  onOpenEvidence,
  onOpenProposalReview,
}: Readonly<{
  workItem: WorkItem;
  stage: PreSignoffStage;
  selectedRunId: Run["id"] | null;
  onSelectedRunChange: (runId: Run["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview?: (selection: ProposalSelection) => void;
}>) => {
  const queryClient = useQueryClient();
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) =>
      query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const runs = runsQuery.data ?? [];
  const stageRuns = runs.filter(
    (run) => run.role === "STAGE" && run.stage === stage,
  );
  const selectedRun =
    stageRuns.find((run) => run.id === selectedRunId) ??
    latestStageRun(stageRuns, stage);

  const eventKey = workbenchQueryKeys.runEvents(selectedRun?.id ?? null);
  const eventsQuery = useQuery({
    queryKey: eventKey,
    queryFn: async () => {
      if (!selectedRun) return [];
      const current = queryClient.getQueryData<readonly import("../../src/core/contracts.ts").RunEvent[]>(eventKey) ?? [];
      const after = current.at(-1)?.sequence ?? 0;
      const next = await api.listRunEvents(selectedRun.id, after);
      return after === 0 ? next : [...current, ...next];
    },
    enabled: selectedRun !== null,
    refetchInterval: selectedRun && runIsActive(selectedRun) ? 1000 : false,
  });
  const events = eventsQuery.data ?? [];
  const pending = useMemo(() => unresolvedHumanInput(events), [events]);

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEventsRoot }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
    ]);
  };

  const input = useMutation({
    mutationFn: (text: string) => {
      if (!selectedRun || selectedRun.role !== "STAGE" || !runIsActive(selectedRun)) {
        throw new TypeError("selected workflow Run does not accept human input");
      }
      return api.submitRunInput(selectedRun.id, text.trim(), pending?.id ?? null);
    },
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: () => {
      if (!selectedRun || !runIsActive(selectedRun)) {
        throw new TypeError("selected workflow Run is not active");
      }
      return api.cancelRun(selectedRun.id);
    },
    onSuccess: async (run) => {
      onSelectedRunChange(run.id);
      await invalidate();
    },
  });
  const retry = useMutation({
    mutationFn: () => api.startInteractiveRun(workItem.id),
    onSuccess: async (run) => {
      onSelectedRunChange(run.id);
      await invalidate();
    },
  });
  const resume = useMutation({
    mutationFn: () => api.resumeWorkItem(workItem.id),
    onSuccess: invalidate,
  });

  if (runsQuery.isPending) {
    return (
      <section className="order-workspace-section order-stage-run-material" data-testid="stage-run-material">
        <WorkbenchEmptyState compact title="Loading workflow activity…" />
      </section>
    );
  }
  if (runsQuery.isError) {
    return (
      <section className="order-workspace-section order-stage-run-material" data-testid="stage-run-material">
        <WorkbenchErrorState
          title="Workflow activity unavailable"
          description={runsQuery.error instanceof Error ? runsQuery.error.message : String(runsQuery.error)}
        />
      </section>
    );
  }
  if (selectedRun === null) {
    return (
      <section className="order-workspace-section order-stage-run-material" data-testid="stage-run-material">
        <WorkbenchEmptyState
          title={"No " + workflowPresentation(stage).label + " activity yet"}
          description="Start this workflow step to create its first attempt."
        />
      </section>
    );
  }

  const selectedStep = workflowPresentation(stage);
  const canRetry =
    workItem.stage === stage &&
    workItem.status === "ACTIVE" &&
    runNeedsAttention(selectedRun) &&
    !runs.some(runIsActive);
  const canResume =
    workItem.stage === stage &&
    workItem.status === "BLOCKED";
  const canAnswer =
    selectedRun.role === "STAGE" &&
    runIsActive(selectedRun);
  const actionError = input.error ?? cancel.error ?? retry.error ?? resume.error;

  return (
    <section
      className="order-workspace-section order-stage-run-material"
      data-testid="stage-run-material"
    >
      {actionError ? (
        <WorkbenchErrorState
          title="Workflow action failed"
          description={actionError instanceof Error ? actionError.message : String(actionError)}
        />
      ) : null}

      <div className="order-activity-detail" data-testid="activity-detail">
        <div className="order-activity-run-heading" data-testid="selected-run-header">
          <div>
            <strong>{selectedStep.label} · {runRoleLabel(selectedRun.role)}</strong>
            <span>
              <Badge variant={statusVariant(selectedRun.status)} label={runStatusLabel(selectedRun.status)} />
              {" · Attempt " + selectedRun.attempt + " · "}
              <time>{new Date(selectedRun.startedAt).toLocaleString()}</time>
            </span>
          </div>
          <div className="order-inline-actions">
            {runIsActive(selectedRun) ? (
              <WorkbenchAction
                label="Cancel current activity"
                tone="destructive"
                loading={cancel.isPending}
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
              />
            ) : null}
            {canRetry ? (
              <WorkbenchAction
                label={"Retry " + selectedStep.label}
                tone="primary"
                loading={retry.isPending}
                disabled={retry.isPending}
                onClick={() => retry.mutate()}
              />
            ) : null}
            {canResume ? (
              <WorkbenchAction
                label="Resume resolved blocker"
                tone="primary"
                loading={resume.isPending}
                disabled={resume.isPending}
                onClick={() => resume.mutate()}
              />
            ) : null}
          </div>
          <details className="order-technical-details order-run-technical-details">
            <summary>Technical details</summary>
            <dl>
              <div><dt>Run id</dt><dd><code>{selectedRun.id}</code></dd></div>
              <div><dt>Stage</dt><dd><code>{selectedRun.stage}</code></dd></div>
              <div><dt>Role</dt><dd><code>{selectedRun.role}</code></dd></div>
              <div><dt>Status</dt><dd><code>{selectedRun.status}</code></dd></div>
              <div><dt>Baseline</dt><dd><code>{selectedRun.baselineCommit}</code></dd></div>
              <div><dt>Context</dt><dd><code>{selectedRun.contextHash}</code></dd></div>
              <div><dt>Provider session</dt><dd><code>{selectedRun.providerSessionId ?? "—"}</code></dd></div>
              <div><dt>Terminal classification</dt><dd><code>{selectedRun.terminalClassification ?? "—"}</code></dd></div>
            </dl>
          </details>
        </div>

        <div className="order-event-scroll">
          {eventsQuery.isPending ? (
            <WorkbenchEmptyState compact title="Loading activity timeline…" />
          ) : eventsQuery.isError ? (
            <WorkbenchErrorState
              title="Activity timeline unavailable"
              description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)}
            />
          ) : events.length === 0 ? (
            <WorkbenchEmptyState compact title="No persisted activity events yet" />
          ) : (
            <RunEventTimeline
              run={selectedRun}
              events={events}
              onOpenEvidence={onOpenEvidence}
              onOpenProposalReview={onOpenProposalReview}
            />
          )}
        </div>

        {canAnswer ? (
          <div className="order-activity-composer" data-testid="activity-composer">
            <div>
              <strong>{pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? "Your input is needed" : "Continue current work"}</strong>
              <span>{pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? pending.event.question : "Send the next instruction or answer for this interactive workflow attempt."}</span>
            </div>
            <ChatComposer
              onSubmit={(value) => {
                if (value.trim().length > 0) input.mutate(value);
              }}
              placeholder="Answer and continue"
              isDisabled={input.isPending}
              elevation="none"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};
