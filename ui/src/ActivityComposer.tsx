import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChatComposer } from "@astryxdesign/core/Chat";
import type { Run, RunEvent } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { runIsActive } from "./workbench-presentation.ts";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";

export const ActivityComposer = ({ run, pending, mutationsDisabled = false, onSubmitted, onError }: Readonly<{
  run: Run; pending: RunEvent | null; mutationsDisabled?: boolean; onSubmitted: (event: RunEvent) => Promise<void>; onError?: (error: unknown) => void | Promise<void>;
}>) => {
  const composerRegionRef = useRef<HTMLDivElement>(null);
  const focusedRequestEventId = useRef<RunEvent["id"] | null>(null);
  const requiredInputEventId =
    pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? pending.id : null;

  useEffect(() => {
    if (
      requiredInputEventId === null ||
      focusedRequestEventId.current === requiredInputEventId
    ) {
      return;
    }
    composerRegionRef.current?.focus({ preventScroll: true });
    focusedRequestEventId.current = requiredInputEventId;
  }, [requiredInputEventId]);

  const input = useMutation({
    mutationFn: (text: string) => {
      if (run.role !== "STAGE" || !runIsActive(run)) throw new TypeError("selected Activity does not accept human input");
      return api.submitRunInput(run.id, text.trim(), pending?.id ?? null);
    },
    onSuccess: onSubmitted,
    onError,
  });
  return (
    <div ref={composerRegionRef} tabIndex={-1} data-testid="activity-composer">
      {input.error && onError === undefined ? <WorkbenchNotice tone="danger" title="Workflow action failed" description={input.error instanceof Error ? input.error.message : String(input.error)} /> : null}
      <div className="order-dialogue-composer-copy">
        <strong>{pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? "Answer the question above" : "Continue current work"}</strong>
        <span>{pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? "Your reply is bound to the exact question shown in the conversation." : "Send the next instruction or answer for this interactive activity."}</span>
      </div>
      <ChatComposer
        onSubmit={(value) => { if (!mutationsDisabled && value.trim().length > 0) input.mutate(value); }}
        placeholder={pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? "Answer and continue" : "Continue current work"}
        isDisabled={mutationsDisabled || input.isPending}
        elevation="none"
      />
    </div>
  );
};
