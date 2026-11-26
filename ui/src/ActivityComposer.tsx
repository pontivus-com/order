import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TextInput } from "@astryxdesign/core/TextInput";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import type { Run, RunEvent } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { runIsActive } from "./workbench-presentation.ts";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";

export const ActivityComposer = ({
  run, pending, focusedRequiredInputEventId, mutationsDisabled = false,
  onRequiredInputFocused, onSubmitted, onError,
}: Readonly<{
  run: Run; pending: RunEvent | null;
  focusedRequiredInputEventId: RunEvent["id"] | null;
  mutationsDisabled?: boolean;
  onRequiredInputFocused: (eventId: RunEvent["id"]) => void;
  onSubmitted: (event: RunEvent) => Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
}>) => {
  const regionRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const requestId = pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? pending.id : null;

  useEffect(() => {
    if (requestId === null || requestId === focusedRequiredInputEventId) return;
    const region = regionRef.current;
    if (region === null) return;
    region.focus({ preventScroll: true });
    onRequiredInputFocused(requestId);
  }, [focusedRequiredInputEventId, onRequiredInputFocused, requestId]);

  const input = useMutation({
    mutationFn: (text: string) => {
      if (run.role !== "STAGE" || !runIsActive(run)) {
        throw new TypeError("selected Activity does not accept human input");
      }
      return api.submitRunInput(run.id, text.trim(), pending?.id ?? null);
    },
    onSuccess: async (event) => {
      setMessage("");
      await onSubmitted(event);
    },
    onError,
  });
  const required = pending?.event.tag === "HUMAN_INPUT_REQUESTED";
  const durableDecision = pending?.event.tag === "HUMAN_INPUT_REQUESTED" &&
    (pending.event.category === "STAGE_CHOICE" || pending.event.category === "AUTHORITY_DECISION" || pending.event.category === "AUTHORITY_CONFLICT");

  return <div ref={regionRef} tabIndex={-1} data-testid="activity-composer" className="order-activity-composer">
    {input.error && onError === undefined ? <WorkbenchNotice
      tone="danger" title="Workflow action failed"
      description={input.error instanceof Error ? input.error.message : String(input.error)}
    /> : null}
    <div className="order-activity-composer-context">
      <strong>{required ? "Your response" : "Continue conversation"}</strong>
      {required ? <span>Answer the current agent question to continue.</span> : null}
      {durableDecision ? <span data-testid="durable-decision-guidance">Your reply is not itself durable authority. Progression requires adoption of the owning governed artifact or proposal.</span> : null}
    </div>
    <form className="order-activity-message-form" onSubmit={(event) => {
      event.preventDefault();
      if (!mutationsDisabled && !input.isPending && message.trim().length > 0) {
        input.mutate(message);
      }
    }}>
      <TextInput label="Message input" isLabelHidden width="100%" size="sm"
        value={message} onChange={setMessage}
        placeholder={required ? "Answer and continue" : "Send a message"}
        isDisabled={mutationsDisabled || input.isPending} />
      <WorkbenchAction label="Send" type="submit" tone="primary"
        disabled={mutationsDisabled || input.isPending || message.trim().length === 0}
        loading={input.isPending} />
    </form>
  </div>;
};
