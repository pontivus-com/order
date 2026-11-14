import { Badge } from "@astryxdesign/core/Badge";

import type { Run, RunEvent } from "../../src/core/contracts.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";
import {
  eventEvidence,
  proposalDispositionFor,
  runEventPresentation,
  type EvidenceSelection,
  type ProposalSelection,
} from "./workbench-presentation.ts";

const toneVariant = (
  tone: ReturnType<typeof runEventPresentation>["tone"],
): "error" | "warning" | "success" | "neutral" => tone;

export const RunEventTimeline = ({
  run,
  events,
  onOpenEvidence,
  onOpenProposalReview,
}: Readonly<{
  run: Run;
  events: readonly RunEvent[];
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenProposalReview?: (selection: ProposalSelection) => void;
}>) => (
  <ol className="order-event-list" data-testid="run-event-timeline">
    {events.map((event) => {
      const presentation = runEventPresentation(event);
      const evidence = eventEvidence(event);
      const proposalState = event.event.tag === "ARTIFACT_PROPOSAL_CREATED"
        ? proposalDispositionFor(events, event.id)
        : null;
      return (
        <li
          key={event.id}
          data-event-tag={event.event.tag}
          data-event-tone={presentation.tone}
          aria-label={presentation.label}
        >
          <div className="order-event-heading">
            <div>
              <Badge variant={toneVariant(presentation.tone)} label={presentation.label} />
              <time>{new Date(event.occurredAt).toLocaleString()}</time>
            </div>
            {event.event.tag === "ARTIFACT_PROPOSAL_CREATED" ? (
              <span>{proposalState ?? "Pending review"}</span>
            ) : null}
          </div>
          <p>{presentation.detail}</p>

          {event.event.tag === "ARTIFACT_PROPOSAL_CREATED" && onOpenProposalReview ? (
            <WorkbenchAction
              label="Review proposed document change"
              tone="primary"
              onClick={() => onOpenProposalReview({ runId: run.id, eventId: event.id })}
            />
          ) : null}

          {evidence.length > 0 ? (
            <div className="order-event-evidence">
              {evidence.map((reference) => (
                <div
                  key={reference.relativePath}
                  data-evidence-path={reference.relativePath}
                >
                  <WorkbenchResourceRow
                    label={reference.relativePath}
                    detail="Run evidence"
                    actionLabel={"Evidence: " + reference.relativePath}
                    onOpen={() => onOpenEvidence({
                      kind: "EVIDENCE",
                      runId: run.id,
                      relativePath: reference.relativePath,
                    })}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <details className="order-technical-details">
            <summary>Technical details</summary>
            <dl>
              <div><dt>Event</dt><dd><code>{event.event.tag}</code></dd></div>
              <div><dt>Event id</dt><dd><code>{event.id}</code></dd></div>
              <div><dt>Sequence</dt><dd>{event.sequence}</dd></div>
            </dl>
            <pre>{JSON.stringify(event.event, null, 2)}</pre>
          </details>
        </li>
      );
    })}
  </ol>
);
