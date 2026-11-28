import type { ReactNode } from "react";
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
} from "@astryxdesign/core/Chat";

export const WorkbenchDialogueMessage = ({
  sender,
  children,
  timestamp,
  name,
}: Readonly<{
  sender: "assistant" | "user";
  children: ReactNode;
  timestamp: string;
  name?: string;
}>) => (
  <div className="order-workbench-dialogue-message" data-sender={sender}>
    <ChatMessage sender={sender} name={name}>
      <ChatMessageBubble>
        {children}
      </ChatMessageBubble>
      <ChatMessageMetadata timestamp={timestamp} />
    </ChatMessage>
  </div>
);

export const WorkbenchDialogueMessages = ({
  children,
}: Readonly<{ children: ReactNode }>) => (
  <ChatMessageList density="compact" gap={2} align="top">
    {children}
  </ChatMessageList>
);

export const WorkbenchDialogue = ({
  transcript,
  activity,
  composer,
  state,
}: Readonly<{
  transcript: ReactNode;
  activity?: ReactNode;
  composer?: ReactNode;
  state?: ReactNode;
}>) => {
  const className = activity === undefined
    ? "order-workbench-dialogue"
    : "order-workbench-dialogue order-workbench-dialogue-has-activity";

  return (
    <section className={className}>
      <div className="order-workbench-dialogue-conversation">
        <ChatLayout
          density="compact"
          composer={
            composer === undefined && state === undefined
              ? null
              : <div className="order-workbench-dialogue-composer">
                  {state === undefined ? null : (
                    <div className="order-workbench-dialogue-state">{state}</div>
                  )}
                  {composer}
                </div>
          }
          scrollButton={null}
          emptyState={null}
        >
          {transcript}
        </ChatLayout>

      </div>
      {activity === undefined ? null : (
        <aside className="order-workbench-dialogue-activity" aria-label="Agent activity">
          {activity}
        </aside>
      )}
    </section>
  );
};
