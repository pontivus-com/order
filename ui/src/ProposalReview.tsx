import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";

import type { WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";
import { proposalDispositionFor, type ProposalSelection } from "./workbench-presentation.ts";

export const ProposalReview = ({
  workItem,
  selection,
  onBackToActivity,
}: Readonly<{
  workItem: WorkItem;
  selection: ProposalSelection;
  onBackToActivity: () => void;
}>) => {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({
    queryKey: workbenchQueryKeys.runEvents(selection.runId),
    queryFn: () => api.listRunEvents(selection.runId, 0),
    refetchInterval: 1000,
  });
  const events = eventsQuery.data ?? [];
  const proposal = events.find((event) => event.id === selection.eventId);
  const proposalPayload =
    proposal?.event.tag === "ARTIFACT_PROPOSAL_CREATED" ? proposal.event : null;
  const disposition = proposalPayload
    ? proposalDispositionFor(events, selection.eventId)
    : null;

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.runEvents(selection.runId),
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.workItems,
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id),
      }),
      queryClient.invalidateQueries({
        queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
      }),
    ]);
  };

  const decision = useMutation({
    mutationFn: async (action: "ADOPT" | "REJECT") => {
      if (action === "ADOPT") await api.adoptProposal(selection.eventId);
      else await api.rejectProposal(selection.eventId);
    },
    onSuccess: invalidate,
  });

  if (eventsQuery.isPending) {
    return (
      <section className="order-workspace-section order-review-workspace" data-testid="proposal-review-workspace">
        <WorkbenchEmptyState compact title="Loading proposal review…" />
      </section>
    );
  }
  if (eventsQuery.isError) {
    return (
      <section className="order-workspace-section order-review-workspace" data-testid="proposal-review-workspace">
        <WorkbenchErrorState
          title="Proposal review unavailable"
          description={eventsQuery.error instanceof Error
            ? eventsQuery.error.message
            : String(eventsQuery.error)}
        />
      </section>
    );
  }
  if (!proposalPayload) {
    return (
      <section className="order-workspace-section order-review-workspace" data-testid="proposal-review-workspace">
        <WorkbenchEmptyState
          title="Proposal is no longer available"
          description="Return to Dialogue to select a current proposal event."
        />
      </section>
    );
  }

  return (
    <section className="order-workspace-section order-review-workspace" data-testid="proposal-review-workspace">
      <div className="order-section-heading order-review-heading">
        <div>
          <h2>Artifact proposal review</h2>
          <span>{proposalPayload.targetPath}</span>
        </div>
        <WorkbenchAction
          label="Back to Activity"
          tone="ghost"
          onClick={onBackToActivity}
        />
      </div>

      <div className="order-proposal-review-summary">
        <p>{proposalPayload.rationale}</p>
        <span>{disposition ?? "PENDING"}</span>
      </div>

      <div className="order-proposal-review-diff" data-testid="proposal-review-diff">
        <CodeBlock
          code={proposalPayload.unifiedDiff}
          language="diff"
          isDiff
          hasCopyButton
          width="100%"
        />
      </div>

      {disposition === null ? (
        <div className="order-review-actions">
          <WorkbenchAction
            label="Adopt"
            tone="primary"
            loading={decision.isPending}
            onClick={() => decision.mutate("ADOPT")}
          />
          <WorkbenchAction
            label="Reject"
            tone="destructive"
            loading={decision.isPending}
            onClick={() => decision.mutate("REJECT")}
          />
        </div>
      ) : null}
    </section>
  );
};
