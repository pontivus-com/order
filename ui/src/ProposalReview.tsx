import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import type { Run, WorkItem } from "../../src/core/contracts.ts";
import type { StageRunInteraction } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import {
  lifecycleArtifactLabel, proposalDispositionFor, type ProposalSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";

export const ProposalReview = ({
  workItem, selection, currentRunId, currentInteraction,
  mutationsDisabled = false, onBack, onMutationError,
}: Readonly<{
  workItem: WorkItem; selection: ProposalSelection;
  currentRunId: Run["id"] | null; currentInteraction: StageRunInteraction | null;
  mutationsDisabled?: boolean; onBack: () => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({
    queryKey: workbenchQueryKeys.runEvents(selection.runId),
    queryFn: () => api.listRunEvents(selection.runId, 0),
    refetchInterval: 1000,
  });
  const events = eventsQuery.data ?? [];
  const proposalEvent = events.find((event) => event.id === selection.eventId);
  const proposal = proposalEvent?.event.tag === "ARTIFACT_PROPOSAL_CREATED"
    ? proposalEvent.event : null;
  const disposition = proposal === null
    ? null : proposalDispositionFor(events, selection.eventId);
  const adoptionRequested = events.some((event) =>
    event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" &&
    event.event.proposalEventId === selection.eventId);

  const invalidate = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);
  const decision = useMutation({
    mutationFn: async (action: "ADOPT" | "REJECT") => {
      if (action === "ADOPT") await api.adoptProposal(selection.eventId);
      else await api.rejectProposal(selection.eventId);
    },
    onSuccess: async () => { await invalidate(); onBack(); },
    onError: async (error) => { onMutationError?.(error); await invalidate(); },
  });

  if (eventsQuery.isPending) return <WorkbenchState kind="loading" title="Loading proposal review…" />;
  if (eventsQuery.isError) return <WorkbenchState kind="error" title="Proposal review unavailable"
    description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)} />;
  if (proposal === null) return <WorkbenchState kind="empty" title="Proposal is no longer available"
    description="Return to the owning workflow step to select a current proposal event." />;

  const ownsDecision = selection.runId === currentRunId && currentInteraction?.tag === "OPEN";
  const decisionOpen = disposition === null && !adoptionRequested && ownsDecision;
  const currentness = <WorkbenchStatus
    tone={disposition === "ADOPTED" ? "success" : disposition === "REJECTED" ? "neutral" : adoptionRequested ? "warning" : "info"}
    label={disposition === "ADOPTED" ? "Adopted" : disposition === "REJECTED" ? "Rejected" : adoptionRequested ? "Adoption in progress" : "Pending review"}
  />;

  return <section data-testid="proposal-review-workspace" className="order-proposal-review">
    <WorkbenchReview
      currentness={currentness}
      summary={<div><h2>Artifact proposal review</h2><p>Review the proposed governed-document change before disposition.</p></div>}
      body={<div className="order-proposal-review-body">
        <dl className="order-proposal-facts">
          <div><dt>Target document</dt><dd>{lifecycleArtifactLabel(proposal.role)} document</dd></div>
          <div><dt>Rationale</dt><dd>{proposal.rationale}</dd></div>
        </dl>
        <section className="order-proposal-diff" data-testid="proposal-review-diff" aria-label="Proposed document diff">
          <h3>Proposed document diff</h3>
          <CodeBlock code={proposal.unifiedDiff} language="diff" isDiff isWrapped hasCopyButton container="section" width="100%" />
        </section>
        {adoptionRequested && disposition === null ? <WorkbenchNotice tone="warning"
          title="Adoption in progress"
          description="The canonical document is being reconciled. Proposal controls remain disabled until disposition is recorded."
        /> : null}
        {decision.error ? <WorkbenchNotice tone="danger" title="Proposal decision failed"
          description={decision.error instanceof Error ? decision.error.message : String(decision.error)}
        /> : null}
      </div>}
      decisions={<>
        <WorkbenchAction label="Back to workflow attempt" tone="secondary" onClick={onBack} />
        {decisionOpen ? <div className="order-proposal-decisions">
          <WorkbenchAction label="Reject" tone="destructive" loading={decision.isPending}
            disabled={mutationsDisabled || decision.isPending} onClick={() => decision.mutate("REJECT")} />
          <WorkbenchAction label="Adopt" tone="primary" loading={decision.isPending}
            disabled={mutationsDisabled || decision.isPending} onClick={() => decision.mutate("ADOPT")} />
        </div> : null}
      </>}
      technicalDetails={<dl className="order-proposal-technical">
        <div><dt>Target repository path</dt><dd><code>{proposal.targetPath}</code></dd></div>
      </dl>}
    />
  </section>;
};
