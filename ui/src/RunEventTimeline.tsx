import type { Run, RunEvent } from "../../src/core/contracts.ts";
import {
  eventEvidence, proposalDispositionFor, runEventPresentation, workflowRunEvents,
  type EvidenceSelection, type ProposalSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTimeline } from "./primitives/WorkbenchTimeline.tsx";

export const RunEventTimeline = ({
  run, events, onOpenEvidence, onOpenProposalReview,
}: Readonly<{
  run: Run; events: readonly RunEvent[];
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview?: (selection: ProposalSelection) => void;
}>) => {
  const workflowEvents = workflowRunEvents(events);
  return <section className="order-workflow-event-history" data-testid="run-event-timeline">
    <WorkbenchTimeline label="Workflow activity" items={workflowEvents.map((event) => {
      const presentation = runEventPresentation(event);
      const evidence = eventEvidence(event);
      const proposalState = event.event.tag === "ARTIFACT_PROPOSAL_CREATED"
        ? proposalDispositionFor(events, event.id) : null;
      return {
        id: event.id,
        heading: <WorkbenchStatus
          tone={presentation.tone === "error" ? "danger" : presentation.tone}
          label={presentation.label}
        />,
        meta: <time>{new Date(event.occurredAt).toLocaleString()}</time>,
        body: <span data-event-tag={event.event.tag}>
          {presentation.detail}{proposalState === null ? "" : " · " + proposalState}
        </span>,
        action: event.event.tag === "ARTIFACT_PROPOSAL_CREATED" && onOpenProposalReview !== undefined
          ? <WorkbenchAction label="Review proposed document change" tone="primary"
              onClick={() => onOpenProposalReview({ runId: run.id, eventId: event.id })} />
          : undefined,
        evidence: evidence.length === 0 ? undefined : (
          <WorkbenchResourceList
            items={evidence.map((reference) => ({
              id: reference.relativePath,
              label: reference.relativePath,
              detail: "Run evidence",
              action: (
                <span data-evidence-path={reference.relativePath}>
                  <WorkbenchAction
                    label={"Evidence: " + reference.relativePath}
                    tone="ghost"
                    onClick={() =>
                      onOpenEvidence({
                        kind: "EVIDENCE",
                        runId: run.id,
                        relativePath: reference.relativePath,
                      })}
                  />
                </span>
              ),
            }))}
          />
        ),
      };
    })} />
  </section>;
};
