import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Run, WorkItem } from "../../src/core/contracts.ts";
import { deriveProposalDecision, type StageRunInteraction } from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { DocumentChangeView } from "./DocumentChangeView.tsx";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import {
  lifecycleArtifactLabel, proposalDispositionFor, type ProposalSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchReview } from "./primitives/WorkbenchReview.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";

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
  const targetQuery = useQuery({
    queryKey: workbenchQueryKeys.proposalTarget(selection.eventId),
    queryFn: () => api.readProposalTarget(selection.eventId),
    enabled: proposal !== null,
    retry: false,
  });
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
  let currentMarkdown: string | null = null;
  if (targetQuery.data !== undefined && !targetQuery.isError) {
    try {
      currentMarkdown = new TextDecoder("utf-8", { fatal: true }).decode(targetQuery.data);
    } catch {
      // An undecodable exact target remains inspection-only.
    }
  }

  const ownsDecision = selection.runId === currentRunId && currentInteraction?.tag === "OPEN";
  const currentDecision = deriveProposalDecision(events);
  const decisionOpen = ownsDecision && currentDecision.tag === "PENDING" &&
    currentDecision.proposalEventId === selection.eventId;
  const verdict =
    disposition === "ADOPTED"
      ? { label: "Adopted", tone: "success" as const, currentness: "Proposal history" }
      : disposition === "REJECTED"
        ? { label: "Rejected", tone: "neutral" as const, currentness: "Proposal history" }
        : adoptionRequested
          ? { label: "Adoption in progress", tone: "warning" as const, currentness: "Current proposal" }
          : !decisionOpen
            ? { label: "Proposal no longer current", tone: "neutral" as const, currentness: "Proposal history" }
            : { label: "Pending review", tone: "info" as const, currentness: "Current proposal" };

  return (
    <section data-testid="proposal-review-workspace" className="order-proposal-review">
      <WorkbenchReview
        title="Proposed document change"
        description="Review the proposed change against the governed target."
        verdict={verdict}
        sections={[
          {
            id: "target",
            title: "Target",
            content: <p>{lifecycleArtifactLabel(proposal.role)}</p>,
          },
          {
            id: "rationale",
            title: "Rationale",
            content: <p>{proposal.rationale}</p>,
          },
          {
            id: "proposed-document",
            title: "Document change",
            content: (
              <>
                {targetQuery.isPending ? <WorkbenchState kind="loading" title="Loading exact proposal target…" /> : null}
                {targetQuery.isError ? <WorkbenchNotice tone="warning"
                  title="Exact proposal base unavailable"
                  description="The original target cannot be read at its expected identity. Adoption is unavailable; the recorded proposal and exact diff remain inspectable."
                  action={<WorkbenchAction label="Retry target inspection" onClick={() => { void targetQuery.refetch(); }} />}
                /> : null}
                <DocumentChangeView
                  currentMarkdown={currentMarkdown}
                  unifiedDiff={proposal.unifiedDiff}
                />
              </>
            ),
          },
          ...(adoptionRequested && disposition === null
            ? [{
              id: "adoption-state",
              title: "Status",
              content: (
                <WorkbenchNotice
                  tone="warning"
                  title="Adoption in progress"
                  description="The canonical document is being reconciled."
                />
              ),
            }]
            : []),
          ...(decision.error === null
            ? []
            : [{
              id: "decision-error",
              title: "Decision failed",
              content: (
                <WorkbenchNotice
                  tone="danger"
                  title="Proposal decision failed"
                  description={decision.error instanceof Error
                    ? decision.error.message
                    : String(decision.error)}
                />
              ),
            }]),
        ]}
        decisions={
          <>
            <WorkbenchAction label="Back to workflow attempt" tone="secondary" onClick={onBack} />
            {decisionOpen ? (
              <div className="order-proposal-decisions">
                <WorkbenchAction
                  label="Reject"
                  tone="destructive"
                  loading={decision.isPending}
                  disabled={mutationsDisabled || decision.isPending}
                  onClick={() => decision.mutate("REJECT")}
                />
                <WorkbenchAction
                  label="Adopt"
                  tone="primary"
                  loading={decision.isPending}
                  disabled={mutationsDisabled || decision.isPending || currentMarkdown === null || targetQuery.isFetching}
                  onClick={() => decision.mutate("ADOPT")}
                />
              </div>
            ) : null}
          </>
        }
      />
    </section>
  );
};
