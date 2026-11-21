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
  <ChatMessageList density="compact" gap={2} align="top">{children}</ChatMessageList>
);

export const WorkbenchDialogue = ({
  transcript, activity, composer, state, header, technical,
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
      {header === undefined ? null : <div className="order-workbench-dialogue-header">{header}</div>}
      <ChatLayout
        density="compact"
        composer={composer === undefined ? null : <div className="order-workbench-dialogue-composer">{composer}</div>}
        scrollButton={null}
        emptyState={null}
      >
        {transcript}
      </ChatLayout>
      {state === undefined ? null : <div className="order-workbench-dialogue-state">{state}</div>}
    </div>
    {activity === undefined ? null : (
      <aside className="order-workbench-dialogue-activity" aria-label="Agent activity">{activity}</aside>
    )}
    {technical === undefined ? null : <div className="order-workbench-dialogue-technical">{technical}</div>}
  </section>
);
