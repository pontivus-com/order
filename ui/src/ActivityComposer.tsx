import { useMutation } from "@tanstack/react-query";
import { ChatComposer } from "@astryxdesign/core/Chat";

import type { Run, RunEvent } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { runIsActive } from "./workbench-presentation.ts";
import { WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

export const ActivityComposer = ({
  run,
  pending,
  onSubmitted,
  onError,
}: Readonly<{
  run: Run;
  pending: RunEvent | null;
  onSubmitted: () => Promise<void>;
  onError?: (error: unknown) => void;
}>) => {
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

  return (
    <div className="order-activity-composer" data-testid="activity-composer">
      {input.error && onError === undefined ? (
        <WorkbenchErrorState
          title="Workflow action failed"
          description={input.error instanceof Error ? input.error.message : String(input.error)}
        />
      ) : null}
      <div>
        <strong>{pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? "Your input is needed" : "Continue current work"}</strong>
        <span>{pending?.event.tag === "HUMAN_INPUT_REQUESTED" ? pending.event.question : "Send the next instruction or answer for this interactive activity."}</span>
      </div>
      <ChatComposer
        onSubmit={(value) => {
          if (value.trim().length > 0) input.mutate(value);
        }}
        placeholder="Answer and continue"
        isDisabled={input.isPending}
        elevation="none"
      />
    </div>
  );
};
