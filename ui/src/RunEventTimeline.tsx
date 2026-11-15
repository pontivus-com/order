import type { Run, RunEvent } from "../../src/core/contracts.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTimeline } from "./primitives/WorkbenchTimeline.tsx";
import { eventEvidence, proposalDispositionFor, runEventPresentation, type EvidenceSelection, type ProposalSelection } from "./workbench-presentation.ts";

export const RunEventTimeline = ({ run, events, onOpenEvidence, onOpenProposalReview }: Readonly<{
  run: Run; events: readonly RunEvent[]; onOpenEvidence: (selection: EvidenceSelection) => void; onOpenProposalReview?: (selection: ProposalSelection) => void;
}>) => (
  <div data-testid="run-event-timeline">
    <WorkbenchTimeline
      label="Run activity"
      items={events.map((event) => {
        const presentation = runEventPresentation(event);
        const evidence = eventEvidence(event);
        const proposalState = event.event.tag === "ARTIFACT_PROPOSAL_CREATED" ? proposalDispositionFor(events, event.id) : null;
        const tone = presentation.tone === "error" ? "danger" : presentation.tone === "neutral" ? "neutral" : presentation.tone;
        return {
          id: event.id,
          heading: <WorkbenchStatus tone={tone} label={presentation.label} />,
          meta: <time>{new Date(event.occurredAt).toLocaleString()}</time>,
          body: <span data-event-tag={event.event.tag}>{presentation.detail}{proposalState ? " · " + proposalState : ""}</span>,
          action: event.event.tag === "ARTIFACT_PROPOSAL_CREATED" && onOpenProposalReview
            ? <WorkbenchAction label="Review proposed document change" tone="primary" onClick={() => onOpenProposalReview({ runId: run.id, eventId: event.id })} />
            : undefined,
          evidence: evidence.length > 0 ? <div>{evidence.map((reference) => (
            <div key={reference.relativePath} data-evidence-path={reference.relativePath}><WorkbenchResourceRow label={reference.relativePath} detail="Run evidence" actionLabel={"Evidence: " + reference.relativePath} onOpen={() => onOpenEvidence({ kind: "EVIDENCE", runId: run.id, relativePath: reference.relativePath })} /></div>
          ))}</div> : undefined,
        };
      })}
    />
    <WorkbenchDisclosure
      label="Timeline technical details"
      content={<div>{events.map((event) => <details key={event.id}><summary>{event.event.tag} · sequence {event.sequence}</summary><pre>{JSON.stringify(event.event, null, 2)}</pre></details>)}</div>}
    />
  </div>
);
