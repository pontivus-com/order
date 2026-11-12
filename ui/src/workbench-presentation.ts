import type {
  ArtifactRef,
  Run,
  RunEventId,
  WorkItem,
} from "../../src/core/contracts.ts";

export type WorkItemMode =
  | "DOCUMENTS"
  | "DIALOGUE"
  | "REVIEW"
  | "EXECUTION"
  | "EVIDENCE"
  | "RESULT";

export type ProposalSelection = Readonly<{
  runId: Run["id"];
  eventId: RunEventId;
}>;

export type EvidenceSelection =
  | Readonly<{
      kind: "ARTIFACT";
      artifactId: ArtifactRef["id"];
      label: string;
    }>
  | Readonly<{
      kind: "EVIDENCE";
      runId: Run["id"];
      relativePath: string;
    }>;

export const runIsActive = (
  run: Pick<Run, "status">,
): boolean =>
  run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT";

export const workItemInitialMode = (
  workItem: Pick<WorkItem, "stage" | "outcome">,
): WorkItemMode => {
  if (workItem.stage === "AWAITING_SIGNOFF") return "REVIEW";
  if (workItem.stage === "EXECUTION") return "EXECUTION";
  if (workItem.stage === "COMPLETE") {
    return workItem.outcome === "CANDIDATE_DONE" ? "EXECUTION" : "RESULT";
  }
  return "DOCUMENTS";
};

export const workItemModeIsKnown = (
  value: string,
): value is WorkItemMode =>
  value === "DOCUMENTS" ||
  value === "DIALOGUE" ||
  value === "REVIEW" ||
  value === "EXECUTION" ||
  value === "EVIDENCE" ||
  value === "RESULT";

export const workItemModeLabel = (
  mode: WorkItemMode,
): string => mode[0] + mode.slice(1).toLowerCase();
