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
  <ChatMessage sender={sender} name={name}>
    <ChatMessageBubble variant={sender === "assistant" ? "ghost" : undefined}>
      {children}
    </ChatMessageBubble>
    <ChatMessageMetadata timestamp={timestamp} />
  </ChatMessage>
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
  header,
  technical,
}: Readonly<{
  transcript: ReactNode;
  activity?: ReactNode;
  composer?: ReactNode;
  state?: ReactNode;
  header?: ReactNode;
  technical?: ReactNode;
}>) => (
  <section className="order-workbench-dialogue">
    <div className="order-workbench-dialogue-main">
      {header ? <div className="order-workbench-dialogue-header">{header}</div> : null}
      <ChatLayout
        density="compact"
        composer={composer ? <div className="order-workbench-dialogue-composer">{composer}</div> : null}
        scrollButton={null}
        emptyState={null}
      >
        {transcript}
      </ChatLayout>
      {state ? <div className="order-workbench-dialogue-state">{state}</div> : null}
    </div>
    {activity ? (
      <aside className="order-workbench-dialogue-activity" aria-label="Agent activity">
        {activity}
      </aside>
    ) : null}
    {technical ? (
      <div className="order-workbench-dialogue-technical">{technical}</div>
    ) : null}
  </section>
);
