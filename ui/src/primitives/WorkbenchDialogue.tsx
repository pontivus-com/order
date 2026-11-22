import type { ReactNode } from "react";
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
} from "@astryxdesign/core/Chat";

export const WorkbenchDialogueMessage = ({
  sender, children, timestamp, name,
}: Readonly<{
  sender: "assistant" | "user";
  children: ReactNode;
  timestamp: string;
  name?: string;
}>) => (
  <ChatMessage sender={sender} name={name}>
    <ChatMessageBubble variant={sender === "assistant" ? "ghost" : undefined}>
      {children}
    </ChatMessageBubble>
    <ChatMessageMetadata timestamp={timestamp} />
  </ChatMessage>
);

export const WorkbenchDialogueMessages = ({ children }: Readonly<{ children: ReactNode }>) => (
  <ChatMessageList density="compact" gap={2} align="top">
    {children}
  </ChatMessageList>
);

export const WorkbenchDialogue = ({
  transcript, activity, composer, state,
}: Readonly<{
  transcript: ReactNode;
  activity?: ReactNode;
  composer?: ReactNode;
  state?: ReactNode;
}>) => (
  <section
    className={
      activity === undefined
        ? "order-workbench-dialogue"
        : "order-workbench-dialogue order-workbench-dialogue-has-activity"
    }
  >
    <div className="order-workbench-dialogue-conversation">
      <ChatLayout
        density="compact"
        composer={
          composer === undefined
            ? null
            : <div className="order-workbench-dialogue-composer">{composer}</div>
        }
        scrollButton={null}
        emptyState={null}
      >
        {transcript}
      </ChatLayout>
      {state === undefined ? null : (
        <div className="order-workbench-dialogue-state">{state}</div>
      )}
    </div>
    {activity === undefined ? null : (
      <aside className="order-workbench-dialogue-activity" aria-label="Agent activity">
        {activity}
      </aside>
    )}
  </section>
);
