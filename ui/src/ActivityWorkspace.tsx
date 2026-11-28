import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Run, RunEvent } from "../../src/core/contracts.ts";
import {
  stageRunCancellationIsAdmitted, type CurrentAttentionTag, type StageRunInteraction,
} from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { ActivityComposer } from "./ActivityComposer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import {
  agentActivityRunEvents, conversationRunEvents, runEventPresentation,
  runIsActive, runStatusLabel, workflowPresentation, workflowRunEvents,
  type EvidenceSelection, type ProposalSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchDialogue, WorkbenchDialogueMessage, WorkbenchDialogueMessages,
} from "./primitives/WorkbenchDialogue.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTimeline } from "./primitives/WorkbenchTimeline.tsx";

export type PreSignoffStage = "R1" | "R2" | "DESIGN" | "PLAN" | "R3";

const statusTone = (status: Run["status"]): "danger" | "warning" | "success" | "info" | "neutral" =>
  status === "FAILED" || status === "BLOCKED" ? "danger" :
  status === "WAITING_FOR_INPUT" ? "warning" :
  status === "COMPLETED" ? "success" :
  status === "RUNNING" ? "info" : "neutral";

const latestStageRun = (runs: readonly Run[], stage: PreSignoffStage): Run | null =>
  [...runs].filter((run) => run.role === "STAGE" && run.stage === stage)
    .sort((a,b) => a.attempt - b.attempt || a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id)).at(-1) ?? null;

const interactionLabel = (
  run: Run,
  interaction: StageRunInteraction | null,
): string | null =>
  interaction?.tag === "PROCESSING" ? "Processing" :
  interaction?.tag === "OPEN" ? null :
  interaction?.tag === "REQUIRED_INPUT" ? "Waiting for you" :
  runStatusLabel(run.status);

export const StageRunMaterial = ({
  stage, runs, runEvents, companion, selectedRunId, currentRunId,
  currentInteraction, currentAttention, focusedRequiredInputEventId,
  stateNotice, stateAction,
  mutationsDisabled = false, onRequiredInputFocused, onSelectedRunChange,
  onOpenEvidence, onOpenProposalReview, onMutationRefresh, onMutationError,
}: Readonly<{
  stage: PreSignoffStage; runs: readonly Run[]; runEvents: readonly RunEvent[];
  companion?: ReactNode; selectedRunId: Run["id"] | null; currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null; currentAttention: CurrentAttentionTag;
  focusedRequiredInputEventId: RunEvent["id"] | null;
  stateNotice?: ReactNode; stateAction?: ReactNode; mutationsDisabled?: boolean;
  onRequiredInputFocused: (eventId: RunEvent["id"]) => void;
  onSelectedRunChange: (runId: Run["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview?: (selection: ProposalSelection) => void;
  onMutationRefresh: (acceptedEvent?: RunEvent) => Promise<void>;
  onMutationError?: (error: unknown) => void;
}>) => {
  const [inputError, setInputError] = useState<unknown>(null);
  const stageRuns = runs.filter((run) => run.role === "STAGE" && run.stage === stage);
  const selectedRun = selectedRunId === null ? latestStageRun(stageRuns, stage) : stageRuns.find((run) => run.id === selectedRunId) ?? null;
  const cancel = useMutation({
    mutationFn: () => {
      if (selectedRun === null || selectedRun.id !== currentRunId ||
          currentInteraction === null || currentInteraction.tag === "CLOSED") {
        throw new TypeError("selected workflow Run is not the current cancellable Run");
      }
      return api.cancelRun(selectedRun.id);
    },
    onSuccess: async (run) => { onSelectedRunChange(run.id); await onMutationRefresh(); },
    onError: async (error) => { onMutationError?.(error); await onMutationRefresh(); },
  });

  if (selectedRun === null) return <WorkbenchState kind="empty"
    title={"No " + workflowPresentation(stage).label + " activity yet"}
    description="Start this workflow step to create its first attempt." />;

  const events = runEvents.filter((event) => event.runId === selectedRun.id);
  const conversationEvents = conversationRunEvents(events);
  const activityEvents = agentActivityRunEvents(events);
  const workflowEvents = workflowRunEvents(events);
  const selectedIsCurrent = selectedRun.id === currentRunId;
  const interaction = selectedIsCurrent ? currentInteraction : null;
  const pending = interaction?.tag === "REQUIRED_INPUT"
    ? events.find((event) => event.id === interaction.requestEventId) ?? null : null;

  const runOwnsAttention = !["PROPOSAL_DECISION","PROPOSAL_ADOPTION","MUTATION_CONFLICT","CONVERGING"].includes(currentAttention);
  const canCancel = selectedIsCurrent && runOwnsAttention && stageRunCancellationIsAdmitted(selectedRun, events);
  const latestTurnTrigger = events.findLast((event) =>
    event.event.tag === "STAGE_STARTED" || event.event.tag === "HUMAN_INPUT_RECEIVED");
  const hasAgentAnchor = latestTurnTrigger !== undefined && conversationEvents.some((event) =>
    event.sequence > latestTurnTrigger.sequence &&
    event.event.tag === "AGENT_MESSAGE_FINAL" && event.event.text.trim().length > 0);
  const canReply = selectedIsCurrent && (
    (runOwnsAttention && interaction?.tag === "OPEN" && hasAgentAnchor) ||
    (currentAttention === "REQUIRED_INPUT" && interaction?.tag === "REQUIRED_INPUT" &&
      pending?.event.tag === "HUMAN_INPUT_REQUESTED")
  );

  const transcript = conversationEvents.length === 0
    ? <WorkbenchState kind="empty" title={runStatusLabel(selectedRun.status)}
        description={runIsActive(selectedRun)
          ? "This workflow attempt is processing. Conversation will appear when the agent has something substantive to say."
          : "No human/agent conversation was recorded for this attempt."} />
    : <WorkbenchDialogueMessages>{conversationEvents.map((event) => {
        const timestamp = new Date(event.occurredAt).toLocaleString();
        if (event.event.tag === "HUMAN_INPUT_RECEIVED") return <WorkbenchDialogueMessage
          key={event.id} sender="user" timestamp={timestamp} name="You">{event.event.text}</WorkbenchDialogueMessage>;
        if (event.event.tag === "HUMAN_INPUT_REQUESTED") return <WorkbenchDialogueMessage
          key={event.id} sender="assistant" timestamp={timestamp}
          name={pending?.id === event.id ? "Agent · Waiting for you" : "Agent"}>{event.event.question}</WorkbenchDialogueMessage>;
        if (event.event.tag === "AGENT_MESSAGE_FINAL") return <WorkbenchDialogueMessage
          key={event.id} sender="assistant" timestamp={timestamp} name="Agent">{event.event.text}</WorkbenchDialogueMessage>;
        return null;
      })}</WorkbenchDialogueMessages>;

  const operational = activityEvents.length === 0
    ? (runIsActive(selectedRun) ? <WorkbenchState kind="empty" title="OpenCode activity"
        description="Waiting for bounded operational activity…" /> : undefined)
    : <WorkbenchTimeline label="OpenCode activity" items={activityEvents.map((event) => {
        const p=runEventPresentation(event);
        return { id:event.id, heading:<strong>{p.detail}</strong>,
          meta:<time>{new Date(event.occurredAt).toLocaleString()}</time>,
          body:event.event.tag==="AGENT_ACTIVITY_RECORDED" && event.event.resource
            ? <code>{event.event.resource}</code> : undefined };
      })} />;
  const workflow = workflowEvents.length === 0 ? undefined : <RunEventTimeline
    run={selectedRun} events={workflowEvents} onOpenEvidence={onOpenEvidence}
    onOpenProposalReview={onOpenProposalReview} />;

  const actionError=inputError ?? cancel.error;
  const interactionStatus = interactionLabel(selectedRun, interaction);
  const header=<div className="order-activity-heading" data-testid="selected-run-header">
    <WorkbenchSectionHeader title="Conversation"
      description={workflowPresentation(stage).label+" · Attempt "+selectedRun.attempt+" · "+new Date(selectedRun.startedAt).toLocaleString()}
    />
    {interactionStatus === null ? null : (
      <WorkbenchStatus tone={statusTone(selectedRun.status)} label={interactionStatus} />
    )}
  </div>;


  return <section className="order-activity-material" data-testid="stage-run-material">
    <div className="order-activity-detail" data-testid="activity-detail">
      <WorkbenchDialogue
        transcript={<>{header}{transcript}</>}
        activity={operational === undefined && workflow === undefined && companion === undefined ? undefined
          : <div className="order-activity-support">
              <h2>Activity</h2>
              {operational}
              {workflow}
              {companion}
            </div>}
        state={actionError === null && stateNotice === undefined && stateAction === undefined && !canCancel
          ? undefined
          : <div className="order-activity-workflow-state">
              {actionError ? <WorkbenchNotice tone="danger" title="Workflow action failed"
                description={actionError instanceof Error ? actionError.message : String(actionError)} /> : null}
              {stateNotice}
              {stateAction === undefined && !canCancel ? null : (
                <div className="order-inline-actions">
                  {stateAction}
                  {canCancel ? <WorkbenchAction label="Cancel current activity" tone="secondary"
                    loading={cancel.isPending} disabled={mutationsDisabled || cancel.isPending}
                    onClick={() => cancel.mutate()} /> : null}
                </div>
              )}
            </div>}
        composer={canReply ? <ActivityComposer key={selectedRun.id} run={selectedRun} pending={pending}
          focusedRequiredInputEventId={focusedRequiredInputEventId}
          mutationsDisabled={mutationsDisabled} onRequiredInputFocused={onRequiredInputFocused}
          onSubmitted={async (event) => { setInputError(null); await onMutationRefresh(event); }}
          onError={async (error) => { setInputError(error); onMutationError?.(error); await onMutationRefresh(); }}
        /> : undefined}
      />
    </div>
  </section>;
};
