import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChatComposer } from "@astryxdesign/core/Chat";
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
    onSuccess: onSubmitted,
    onError,
  });
  const required = pending?.event.tag === "HUMAN_INPUT_REQUESTED";

  return <div ref={regionRef} tabIndex={-1} data-testid="activity-composer" className="order-activity-composer">
    {input.error && onError === undefined ? <WorkbenchNotice
      tone="danger" title="Workflow action failed"
      description={input.error instanceof Error ? input.error.message : String(input.error)}
    /> : null}
    <div className="order-activity-composer-context">
      <strong>{required ? "Answer the question above" : "Continue current work"}</strong>
      <span>{required
        ? "Your reply is bound to the exact question shown in the conversation."
        : "Send the next instruction or answer for this interactive activity."}</span>
    </div>
    <ChatComposer
      onSubmit={(value) => {
        if (!mutationsDisabled && value.trim().length > 0) input.mutate(value);
      }}
      placeholder={required ? "Answer and continue" : "Continue current work"}
      isDisabled={mutationsDisabled || input.isPending}
      elevation="none"
    />
  </div>;
};
