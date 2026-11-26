import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Run, WorkItem } from "../../src/core/contracts.ts";
import type { StageRunInteraction } from "../../src/core/lifecycle.ts";
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
  if (targetQuery.isPending) return <WorkbenchState kind="loading" title="Loading proposed document…" />;
  if (targetQuery.isError) return <WorkbenchState kind="error" title="Proposed document unavailable"
    description={targetQuery.error instanceof Error ? targetQuery.error.message : String(targetQuery.error)} />;

  let currentMarkdown: string;
  try {
    currentMarkdown = new TextDecoder("utf-8", { fatal: true }).decode(targetQuery.data);
  } catch {
    return <WorkbenchState kind="error" title="Current target is not UTF-8 Markdown" />;
  }

  const ownsDecision = selection.runId === currentRunId && currentInteraction?.tag === "OPEN";
  const decisionOpen = disposition === null && !adoptionRequested && ownsDecision;
  const verdict =
    disposition === "ADOPTED"
      ? { label: "Adopted", tone: "success" as const, currentness: "Proposal history" }
      : disposition === "REJECTED"
        ? { label: "Rejected", tone: "neutral" as const, currentness: "Proposal history" }
        : adoptionRequested
          ? { label: "Adoption in progress", tone: "warning" as const, currentness: "Current proposal" }
          : { label: "Pending review", tone: "info" as const, currentness: "Current proposal" };

  return (
    <section data-testid="proposal-review-workspace" className="order-proposal-review">
      <WorkbenchReview
        title="Proposed document change"
        description={lifecycleArtifactLabel(proposal.role)}
        verdict={verdict}
        sections={[
          {
            id: "rationale",
            title: "Rationale",
            content: <p>{proposal.rationale}</p>,
          },
          {
            id: "proposed-document",
            title: "Document change",
            content: (
              <DocumentChangeView
                currentMarkdown={currentMarkdown}
                unifiedDiff={proposal.unifiedDiff}
              />
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
                  disabled={mutationsDisabled || decision.isPending}
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
