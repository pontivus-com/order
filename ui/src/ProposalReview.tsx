import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import type { WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { proposalDispositionFor, type ProposalSelection } from "./workbench-presentation.ts";

export const ProposalReview = ({ workItem, selection, mutationsDisabled = false, onBack }: Readonly<{ workItem: WorkItem; selection: ProposalSelection; mutationsDisabled?: boolean; onBack: () => void }>) => {
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
    onError: invalidate,
  });

  if (eventsQuery.isPending) return <WorkbenchState kind="loading" title="Loading proposal review…" />;
  if (eventsQuery.isError) return <WorkbenchState kind="error" title="Proposal review unavailable" description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)} />;
  if (!proposalPayload) return <WorkbenchState kind="empty" title="Proposal is no longer available" description="Return to the owning workflow step to select a current proposal event." />;

  const currentness = <WorkbenchStatus
    tone={disposition === "ADOPTED" ? "success" : disposition === "REJECTED" ? "neutral" : adoptionRequested ? "warning" : "info"}
    label={disposition === "ADOPTED" ? "Adopted" : disposition === "REJECTED" ? "Rejected" : adoptionRequested ? "Adoption in progress" : "Pending review"}
  />;
  const decisions = disposition === null && !adoptionRequested ? <>
    <WorkbenchAction label="Adopt" tone="primary" loading={decision.isPending} disabled={mutationsDisabled || decision.isPending} onClick={() => decision.mutate("ADOPT")} />
    <WorkbenchAction label="Reject" tone="destructive" loading={decision.isPending} disabled={mutationsDisabled || decision.isPending} onClick={() => decision.mutate("REJECT")} />
  </> : null;

  return (
    <section data-testid="proposal-review-workspace">
      <WorkbenchReview
        currentness={currentness}
        summary={<div><h2>Artifact proposal review</h2><p>{proposalPayload.targetPath}</p><p>{proposalPayload.rationale}</p></div>}
        body={<>
          <section data-testid="proposal-review-diff">
            <h3>Proposed document diff</h3>
          <CodeBlock code={proposalPayload.unifiedDiff} language="diff" isDiff isWrapped hasCopyButton container="section" width="100%" />
          </section>
          {adoptionRequested && disposition === null ? <WorkbenchNotice tone="warning" title="Adoption in progress" description="The canonical document is being reconciled. Proposal controls remain disabled until disposition is recorded." /> : null}
          {decision.error ? <WorkbenchNotice tone="danger" title="Proposal decision failed" description={decision.error instanceof Error ? decision.error.message : String(decision.error)} /> : null}
        </>}
        decisions={<><WorkbenchAction label="Back to workflow attempt" tone="ghost" onClick={onBack} />{decisions}</>}
      />
    </section>
  );
};
