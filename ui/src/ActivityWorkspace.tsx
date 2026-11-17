import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";

import type { Run, RunEvent } from "../../src/core/contracts.ts";
import {
  stageRunCancellationIsAdmitted,
  type CurrentAttentionTag,
  type StageRunInteraction,
} from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { ActivityComposer } from "./ActivityComposer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchDialogue,
  WorkbenchDialogueMessage,
  WorkbenchDialogueMessages,
} from "./primitives/WorkbenchDialogue.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTimeline } from "./primitives/WorkbenchTimeline.tsx";
import {
  agentActivityRunEvents,
  conversationRunEvents,
  runEventPresentation,
  runIsActive, runRoleLabel, runStatusLabel,
  workflowPresentation,
  workflowRunEvents,
  type EvidenceSelection, type ProposalSelection,
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

export const StageRunMaterial = ({ stage, runs, runEvents, companion, selectedRunId, currentRunId, currentInteraction, currentAttention, mutationsDisabled = false, onSelectedRunChange, onOpenEvidence, onOpenProposalReview, onMutationRefresh, onMutationError }: Readonly<{
  stage: PreSignoffStage; runs: readonly Run[]; runEvents: readonly RunEvent[]; companion?: ReactNode; selectedRunId: Run["id"] | null;
  currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null;
  currentAttention: CurrentAttentionTag;
  mutationsDisabled?: boolean;
  onSelectedRunChange: (runId: Run["id"]) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview?: (selection: ProposalSelection) => void;
  onMutationRefresh: (acceptedEvent?: RunEvent) => Promise<void>;
  onMutationError?: (error: unknown) => void;
}>) => {
  const [inputError, setInputError] = useState<unknown>(null);
  const stageRuns = runs.filter((run) => run.role === "STAGE" && run.stage === stage);
  const selectedRun = stageRuns.find((run) => run.id === selectedRunId) ?? latestStageRun(stageRuns, stage);
  const events = selectedRun === null
    ? []
    : runEvents.filter((event) => event.runId === selectedRun.id);
  const conversationEvents = conversationRunEvents(events);
  const activityEvents = agentActivityRunEvents(events);
  const workflowEvents = workflowRunEvents(events);
  const selectedIsCurrent = selectedRun?.id === currentRunId;
  const interaction = selectedIsCurrent ? currentInteraction : null;
  const pending: RunEvent | null =
    interaction?.tag === "REQUIRED_INPUT"
      ? events.find((event) => event.id === interaction.requestEventId) ?? null
      : null;

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
    onSuccess: async (run) => {
      onSelectedRunChange(run.id);
      await onMutationRefresh();
    },
    onError: async (error) => {
      onMutationError?.(error);
      await onMutationRefresh();
    },
  });

  if (selectedRun === null) return <WorkbenchState kind="empty" title={"No " + workflowPresentation(stage).label + " activity yet"} description="Start this workflow step to create its first attempt." />;

  const selectedStep = workflowPresentation(stage);
  const currentRunControlsOwnAttention =
    currentAttention !== "PROPOSAL_DECISION" &&
    currentAttention !== "PROPOSAL_ADOPTION" &&
    currentAttention !== "MUTATION_CONFLICT" &&
    currentAttention !== "CONVERGING";
  const canCancel =
    selectedIsCurrent &&
    currentRunControlsOwnAttention &&
    stageRunCancellationIsAdmitted(selectedRun, events);
  const hasVisibleAgentAnchor = conversationEvents.some(
    (event) =>
      event.event.tag === "AGENT_MESSAGE_FINAL" &&
      event.event.text.trim().length > 0,
  );
  const canAnswer =
    selectedIsCurrent &&
    (
      (
        currentRunControlsOwnAttention &&
        interaction?.tag === "OPEN" &&
        hasVisibleAgentAnchor
      ) ||
      (
        currentAttention === "REQUIRED_INPUT" &&
        interaction?.tag === "REQUIRED_INPUT" &&
        pending?.event.tag === "HUMAN_INPUT_REQUESTED"
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
  const header = (
    <div data-testid="selected-run-header">
      <WorkbenchSectionHeader
        title="Conversation"
        description={selectedStep.label + " · Attempt " + selectedRun.attempt + " · " + new Date(selectedRun.startedAt).toLocaleString()}
        action={<span className="order-inline-actions">
          {canCancel ? <WorkbenchAction label="Cancel current activity" tone="destructive" loading={cancel.isPending} disabled={mutationsDisabled || cancel.isPending} onClick={() => cancel.mutate()} /> : null}
        </span>}
      />
      <div className="order-run-status-strip">
        <WorkbenchStatus tone={statusTone(selectedRun.status)} label={runStatusLabel(selectedRun.status)} />
      </div>
    </div>
  );

  const transcript = conversationEvents.length === 0
    ? <WorkbenchState kind="empty" title={runStatusLabel(selectedRun.status)} description={runIsActive(selectedRun) ? "This workflow attempt is processing. Conversation will appear when the agent has something substantive to say." : "No human/agent conversation was recorded for this attempt."} />
    : (
          <WorkbenchDialogueMessages>
            {conversationEvents.map((event) => {
              const payload = event.event;
              const timestamp = new Date(event.occurredAt).toLocaleString();
              if (payload.tag === "HUMAN_INPUT_RECEIVED") {
                return <WorkbenchDialogueMessage key={event.id} sender="user" timestamp={timestamp} name="You">{payload.text}</WorkbenchDialogueMessage>;
              }
              if (payload.tag === "HUMAN_INPUT_REQUESTED") {
                return <WorkbenchDialogueMessage key={event.id} sender="assistant" timestamp={timestamp} name="Agent · Waiting for you">{payload.question}</WorkbenchDialogueMessage>;
              }
              if (payload.tag === "AGENT_MESSAGE_FINAL") {
                return <WorkbenchDialogueMessage key={event.id} sender="assistant" timestamp={timestamp} name="Agent">{payload.text}</WorkbenchDialogueMessage>;
              }
              return null;
            })}
          </WorkbenchDialogueMessages>
        );

  const activityRegion = activityEvents.length === 0
    ? (runIsActive(selectedRun) ? <WorkbenchState kind="empty" title="OpenCode activity" description="Waiting for bounded operational activity…" /> : undefined)
    : (
      <WorkbenchTimeline
        label="OpenCode activity"
        items={activityEvents.map((event) => {
          const presentation = runEventPresentation(event);
          return {
            id: event.id,
            heading: <strong>{presentation.detail}</strong>,
            meta: <time>{new Date(event.occurredAt).toLocaleString()}</time>,
            body: event.event.tag === "AGENT_ACTIVITY_RECORDED" && event.event.resource
              ? <code>{event.event.resource}</code>
              : undefined,
          };
        })}
      />
    );

  const workflow = workflowEvents.length === 0
    ? undefined
    : <RunEventTimeline run={selectedRun} events={workflowEvents} onOpenEvidence={onOpenEvidence} onOpenProposalReview={onOpenProposalReview} />;

  return (
    <section data-testid="stage-run-material">
      <div data-testid="activity-detail">
      <WorkbenchDialogue
        header={header}
        transcript={transcript}
        activity={
          activityRegion || companion ? (
            <div className="order-dialogue-support-stack">
              {activityRegion}
              {companion}
            </div>
          ) : undefined
        }
        state={<>
          {actionError ? <WorkbenchNotice tone="danger" title="Workflow action failed" description={actionError instanceof Error ? actionError.message : String(actionError)} /> : null}
          {workflow}
        </>}
        technical={<WorkbenchDisclosure label="Technical details" content={technical} />}
        composer={canAnswer ? <ActivityComposer
          run={selectedRun}
          pending={pending}
          mutationsDisabled={mutationsDisabled}
          onSubmitted={async (event) => {
            setInputError(null);
            await onMutationRefresh(event);
          }}
          onError={async (error) => {
            setInputError(error);
            onMutationError?.(error);
            await onMutationRefresh();
          }}
        /> : undefined}
      />
      </div>
    </section>
  );
};
