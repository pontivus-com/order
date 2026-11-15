import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Run, RunEvent, WorkItem } from "../../src/core/contracts.ts";
import type {
  CurrentAttentionTag,
  StageRunInteraction,
} from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { ActivityComposer } from "./ActivityComposer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchDialogue } from "./primitives/WorkbenchDialogue.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import {
  runIsActive, runRoleLabel, runStatusLabel,
  workflowPresentation, type EvidenceSelection, type ProposalSelection,
} from "./workbench-presentation.ts";

export type PreSignoffStage = "R1" | "R2" | "DESIGN" | "PLAN" | "R3";

const statusTone = (status: Run["status"]): "danger" | "warning" | "success" | "info" | "neutral" =>
  status === "FAILED" || status === "BLOCKED" ? "danger" :
  status === "WAITING_FOR_INPUT" ? "warning" :
  status === "COMPLETED" ? "success" :
  status === "RUNNING" ? "info" : "neutral";

const latestStageRun = (runs: readonly Run[], stage: PreSignoffStage): Run | null =>
  runs.filter((run) => run.role === "STAGE" && run.stage === stage)
    .sort((left, right) => left.attempt - right.attempt || left.startedAt.localeCompare(right.startedAt) || left.id.localeCompare(right.id)).at(-1) ?? null;

const openCodeSessionStatus = (run: Run): string => {
  if (runIsActive(run)) return run.providerSessionId === null ? "Starting OpenCode session…" : "OpenCode session is processing this turn…";
  if (run.providerSessionId === null) return "OpenCode session was not admitted";
  if (run.status === "CANCELLED") return "OpenCode session cancelled";
  if (run.status === "FAILED") return "OpenCode session failed";
  return "OpenCode session completed";
};

export const StageRunMaterial = ({ workItem, stage, selectedRunId, currentRunId, currentInteraction, currentAttention, mutationsDisabled = false, onSelectedRunChange, onOpenEvidence, onOpenProposalReview }: Readonly<{
  workItem: WorkItem; stage: PreSignoffStage; selectedRunId: Run["id"] | null;
  currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag;
  mutationsDisabled?: boolean;
  onSelectedRunChange: (runId: Run["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview?: (selection: ProposalSelection) => void;
}>) => {
  const queryClient = useQueryClient();
  const [inputError, setInputError] = useState<unknown>(null);
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) => query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const runs = runsQuery.data ?? [];
  const stageRuns = runs.filter((run) => run.role === "STAGE" && run.stage === stage);
  const selectedRun = stageRuns.find((run) => run.id === selectedRunId) ?? latestStageRun(stageRuns, stage);
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
  const selectedIsCurrent = selectedRun?.id === currentRunId;
  const interaction = selectedIsCurrent ? currentInteraction : null;
  const pending: RunEvent | null =
    interaction?.tag === "REQUIRED_INPUT"
      ? events.find((event) => event.id === interaction.requestEventId) ?? null
      : null;

  const invalidate = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);
  const cancel = useMutation({
    mutationFn: () => {
      if (
        !selectedRun ||
        !selectedIsCurrent ||
        interaction === null ||
        interaction.tag === "CLOSED"
      ) {
        throw new TypeError("selected workflow Run is not the current cancellable Run");
      }
      return api.cancelRun(selectedRun.id);
    },
    onSuccess: async (run) => { onSelectedRunChange(run.id); await invalidate(); },
    onError: invalidate,
  });

  if (runsQuery.isPending) return <WorkbenchState kind="loading" title="Loading workflow activity…" />;
  if (runsQuery.isError) return <WorkbenchState kind="error" title="Workflow activity unavailable" description={runsQuery.error instanceof Error ? runsQuery.error.message : String(runsQuery.error)} />;
  if (selectedRun === null) return <WorkbenchState kind="empty" title={"No " + workflowPresentation(stage).label + " activity yet"} description="Start this workflow step to create its first attempt." />;

  const selectedStep = workflowPresentation(stage);
  const currentRunControlsOwnAttention =
    currentAttention !== "PROPOSAL_DECISION" &&
    currentAttention !== "PROPOSAL_ADOPTION" &&
    currentAttention !== "CONVERGING";
  const canCancel =
    selectedIsCurrent &&
    currentRunControlsOwnAttention &&
    interaction !== null &&
    interaction.tag !== "CLOSED";
  const canAnswer =
    selectedIsCurrent &&
    (
      (
        currentAttention === "ORDINARY" &&
        interaction?.tag === "OPEN"
      ) ||
      (
        currentAttention === "REQUIRED_INPUT" &&
        interaction?.tag === "REQUIRED_INPUT"
      )
    );
  const actionError = inputError ?? cancel.error;
  const sessionStatus = openCodeSessionStatus(selectedRun);
  const technical = (
    <dl>
      <div><dt>Run id</dt><dd><code>{selectedRun.id}</code></dd></div>
      <div><dt>Stage</dt><dd><code>{selectedRun.stage}</code></dd></div>
      <div><dt>Role</dt><dd><code>{selectedRun.role}</code></dd></div>
      <div><dt>Status</dt><dd><code>{selectedRun.status}</code></dd></div>
      <div><dt>Baseline</dt><dd><code>{selectedRun.baselineCommit}</code></dd></div>
      <div><dt>Context</dt><dd><code>{selectedRun.contextHash}</code></dd></div>
      <div><dt>Provider session</dt><dd><code>{selectedRun.providerSessionId ?? "—"}</code></dd></div>
      <div><dt>Provider status</dt><dd>{sessionStatus}</dd></div>
      <div><dt>Terminal classification</dt><dd><code>{selectedRun.terminalClassification ?? "—"}</code></dd></div>
    </dl>
  );
  const transcript = (
    <>
      <div data-testid="selected-run-header">
        <WorkbenchSectionHeader
          title={selectedStep.label + " · " + runRoleLabel(selectedRun.role)}
          description={"Attempt " + selectedRun.attempt + " · " + new Date(selectedRun.startedAt).toLocaleString()}
          action={<span className="order-inline-actions">
            {canCancel ? <WorkbenchAction label="Cancel current activity" tone="destructive" loading={cancel.isPending} disabled={mutationsDisabled || cancel.isPending} onClick={() => cancel.mutate()} /> : null}
          </span>}
        />
        <div className="order-run-status-strip">
          <WorkbenchStatus tone={statusTone(selectedRun.status)} label={runStatusLabel(selectedRun.status)} />
        </div>
      </div>
      <WorkbenchDisclosure label="Technical details" content={technical} />
      {eventsQuery.isPending ? <WorkbenchState kind="loading" title="Loading activity timeline…" /> :
       eventsQuery.isError ? <WorkbenchState kind="error" title="Activity timeline unavailable" description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)} /> :
       events.length === 0 ? <WorkbenchState kind="empty" title={runStatusLabel(selectedRun.status)} description={runIsActive(selectedRun) ? "This workflow attempt is processing. Persisted results will appear here automatically." : "No persisted workflow events were returned for this attempt."} /> :
       <RunEventTimeline run={selectedRun} events={events} onOpenEvidence={onOpenEvidence} onOpenProposalReview={onOpenProposalReview} />}
    </>
  );
  return (
    <section data-testid="stage-run-material">
      <div data-testid="activity-detail">
      <WorkbenchDialogue
        transcript={transcript}
        state={actionError ? <WorkbenchNotice tone="danger" title="Workflow action failed" description={actionError instanceof Error ? actionError.message : String(actionError)} /> : undefined}
        composer={canAnswer ? <ActivityComposer run={selectedRun} pending={pending} mutationsDisabled={mutationsDisabled} onSubmitted={async () => { setInputError(null); await invalidate(); }} onError={setInputError} /> : undefined}
      />
      </div>
    </section>
  );
};
