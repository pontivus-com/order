import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatSystemMessage,
} from "@astryxdesign/core/Chat";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";

import type { Run, RunEvent, RunEventId, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { runIsActive } from "./workbench-presentation.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

const unresolvedRequest = (events: readonly RunEvent[]): RunEvent | null => {
  const received = new Set(
    events
      .filter((event) => event.event.tag === "HUMAN_INPUT_RECEIVED")
      .map((event) => event.event.tag === "HUMAN_INPUT_RECEIVED" ? event.event.requestEventId : null)
      .filter((id): id is RunEventId => id !== null),
  );
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event?.event.tag === "HUMAN_INPUT_REQUESTED" && !received.has(event.id)) return event;
  }
  return null;
};

const proposalDisposition = (
  events: readonly RunEvent[],
  proposalId: RunEventId,
): "ADOPTED" | "REJECTED" | null => {
  const found = events.find((event) =>
    event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
    event.event.proposalEventId === proposalId);
  return found?.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
    ? found.event.disposition
    : null;
};

export const StageDialogue = ({ workItem }: Readonly<{ workItem: WorkItem }>) => {
  const queryClient = useQueryClient();
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: 1000,
  });
  const run = (runsQuery.data ?? []).find(
    (item) => item.role === "STAGE" && runIsActive(item),
  ) ?? null;
  const eventsQuery = useQuery({
    queryKey: workbenchQueryKeys.runEvents(run?.id ?? null),
    queryFn: () => run ? api.listRunEvents(run.id, 0) : Promise.resolve([]),
    enabled: run !== null,
    refetchInterval: run ? 1000 : false,
  });
  const events = eventsQuery.data ?? [];
  const pending = unresolvedRequest(events);

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEvents(run?.id ?? null) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
    ]);
  };

  const input = useMutation({
    mutationFn: (text: string) => {
      if (!run) throw new TypeError("active STAGE Run required");
      return api.submitRunInput(run.id, text.trim(), pending?.id ?? null);
    },
    onSuccess: invalidate,
  });

  const proposal = useMutation({
    mutationFn: async (value: Readonly<{ id: RunEventId; action: "ADOPT" | "REJECT" }>) => {
      if (value.action === "ADOPT") await api.adoptProposal(value.id);
      else await api.rejectProposal(value.id);
    },
    onSuccess: invalidate,
  });

  const messages = useMemo(
    () => events.filter((event) =>
      event.event.tag === "AGENT_MESSAGE_FINAL" ||
      event.event.tag === "HUMAN_INPUT_RECEIVED" ||
      event.event.tag === "HUMAN_INPUT_REQUESTED" ||
      event.event.tag === "ARTIFACT_PROPOSAL_CREATED"),
    [events],
  );

  if (runsQuery.isPending) return <WorkbenchEmptyState compact title="Loading dialogue…" />;
  if (!run) return <WorkbenchEmptyState title="No active interactive run" description="Use Context to start or resume governed stage work." />;
  if (eventsQuery.isError) {
    return <WorkbenchErrorState title="Dialogue unavailable" description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)} />;
  }

  return (
    <section className="order-workspace-section order-dialogue" data-testid="dialogue-workspace">
      <div className="order-section-heading">
        <h2>Interactive stage dialogue</h2>
        <span>{run.role} #{run.attempt} · {run.status}</span>
      </div>
      <ChatLayout
        density="balanced"
        composer={
          <ChatComposer
            onSubmit={(value) => { if (value.trim().length > 0) input.mutate(value); }}
            placeholder={pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? pending.event.question : "Continue the interactive run"}
            isDisabled={input.isPending}
            elevation="none"
          />
        }
        emptyState={<WorkbenchEmptyState compact title="No persisted messages yet" />}
      >
        <ChatMessageList>
          {messages.map((event) => {
            if (event.event.tag === "AGENT_MESSAGE_FINAL") {
              return <ChatMessage key={event.id} sender="assistant"><ChatMessageBubble>{event.event.text}</ChatMessageBubble></ChatMessage>;
            }
            if (event.event.tag === "HUMAN_INPUT_RECEIVED") {
              return <ChatMessage key={event.id} sender="user"><ChatMessageBubble>{event.event.text}</ChatMessageBubble></ChatMessage>;
            }
            if (event.event.tag === "HUMAN_INPUT_REQUESTED") {
              return <ChatSystemMessage key={event.id}>{event.event.question}</ChatSystemMessage>;
            }
            if (event.event.tag === "ARTIFACT_PROPOSAL_CREATED") {
              const state = proposalDisposition(events, event.id);
              return (
                <ChatMessage key={event.id} sender="assistant">
                  <ChatMessageBubble variant="ghost" width="100%">
                    <div className="order-proposal">
                      <div className="order-proposal-heading">
                        <div>
                          <strong>Artifact proposal</strong>
                          <div>{event.event.targetPath}</div>
                        </div>
                        {state ? <strong>{state}</strong> : (
                          <div className="order-inline-actions">
                            <WorkbenchAction label="Adopt" tone="primary" disabled={proposal.isPending} onClick={() => proposal.mutate({ id: event.id, action: "ADOPT" })} />
                            <WorkbenchAction label="Reject" tone="destructive" disabled={proposal.isPending} onClick={() => proposal.mutate({ id: event.id, action: "REJECT" })} />
                          </div>
                        )}
                      </div>
                      <p>{event.event.rationale}</p>
                      <CodeBlock code={event.event.unifiedDiff} language="diff" isDiff hasCopyButton width="100%" maxHeight="28rem" />
                    </div>
                  </ChatMessageBubble>
                </ChatMessage>
              );
            }
            return null;
          })}
        </ChatMessageList>
      </ChatLayout>
    </section>
  );
};
