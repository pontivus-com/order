import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import type { Run, WorkItem } from "../../src/core/contracts.ts";
import type { StageRunInteraction } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { proposalDispositionFor, workflowPresentation, type ProposalSelection } from "./workbench-presentation.ts";

export const ProposalReview = ({
  workItem,
  selection,
  currentRunId,
  currentInteraction,
  mutationsDisabled = false,
  onBack,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  selection: ProposalSelection;
  currentRunId: Run["id"] | null;
  currentInteraction: StageRunInteraction | null;
  mutationsDisabled?: boolean;
  onBack: () => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({ queryKey: workbenchQueryKeys.runEvents(selection.runId), queryFn: () => api.listRunEvents(selection.runId, 0), refetchInterval: 1000 });
  const events = eventsQuery.data ?? [];
  const proposal = events.find((event) => event.id === selection.eventId);
  const proposalPayload = proposal?.event.tag === "ARTIFACT_PROPOSAL_CREATED" ? proposal.event : null;
  const disposition = proposalPayload ? proposalDispositionFor(events, selection.eventId) : null;
  const adoptionRequested = events.some((event) => event.event.tag === "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED" && event.event.proposalEventId === selection.eventId);

  const invalidate = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);
  const decision = useMutation({
    mutationFn: async (action: "ADOPT" | "REJECT") => { if (action === "ADOPT") await api.adoptProposal(selection.eventId); else await api.rejectProposal(selection.eventId); },
    onSuccess: async () => { await invalidate(); onBack(); },
    onError: async (error) => {
      onMutationError?.(error);
      await invalidate();
    },
  });

  if (eventsQuery.isPending) return <WorkbenchState kind="loading" title="Loading proposal review…" />;
  if (eventsQuery.isError) return <WorkbenchState kind="error" title="Proposal review unavailable" description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)} />;
  if (!proposalPayload) return <WorkbenchState kind="empty" title="Proposal is no longer available" description="Return to the owning workflow step to select a current proposal event." />;

  const currentness = <WorkbenchStatus
    tone={disposition === "ADOPTED" ? "success" : disposition === "REJECTED" ? "neutral" : adoptionRequested ? "warning" : "info"}
    label={disposition === "ADOPTED" ? "Adopted" : disposition === "REJECTED" ? "Rejected" : adoptionRequested ? "Adoption in progress" : "Pending review"}
  />;
  const ownsCurrentDecision =
    selection.runId === currentRunId &&
    currentInteraction?.tag === "OPEN";
  const decisions =
    disposition === null &&
    !adoptionRequested &&
    ownsCurrentDecision
      ? <>
          <WorkbenchAction label="Reject" tone="destructive" loading={decision.isPending} disabled={mutationsDisabled || decision.isPending} onClick={() => decision.mutate("REJECT")} />
          <WorkbenchAction label="Adopt" tone="primary" loading={decision.isPending} disabled={mutationsDisabled || decision.isPending} onClick={() => decision.mutate("ADOPT")} />
        </>
      : null;

  return (
    <section data-testid="proposal-review-workspace">
      <WorkbenchReview
        currentness={currentness}
        summary={<div><h2>Artifact proposal review</h2></div>}
        body={<>
          <dl className="order-proposal-summary">
            <div><dt>Target document</dt><dd>{workflowPresentation(proposalPayload.role).label} document</dd></div>
            <div><dt>Rationale</dt><dd>{proposalPayload.rationale}</dd></div>
          </dl>
          <section data-testid="proposal-review-diff">
            <h3>Proposed document diff</h3>
          <CodeBlock code={proposalPayload.unifiedDiff} language="diff" isDiff isWrapped hasCopyButton container="section" width="100%" />
          </section>
          {adoptionRequested && disposition === null ? <WorkbenchNotice tone="warning" title="Adoption in progress" description="The canonical document is being reconciled. Proposal controls remain disabled until disposition is recorded." /> : null}
          {decision.error ? <WorkbenchNotice tone="danger" title="Proposal decision failed" description={decision.error instanceof Error ? decision.error.message : String(decision.error)} /> : null}
        </>}
        decisions={<>
          <div className="order-review-back"><WorkbenchAction label="Back to workflow attempt" tone="secondary" onClick={onBack} /></div>
          <div className="order-review-primary-decisions">{decisions}</div>
        </>}
        technicalDetails={<dl><div><dt>Target repository path</dt><dd><code>{proposalPayload.targetPath}</code></dd></div></dl>}
      />
    </section>
  );
};
