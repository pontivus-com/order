import type {
  ArtifactRef,
  EvidencePath,
  Run,
  RunEvent,
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
      relativePath: EvidencePath;
    }>;

export const proposalDispositionFor = (
  events: readonly RunEvent[],
  proposalId: RunEventId,
): "ADOPTED" | "REJECTED" | null => {
  const found = events.find((event) =>
    event.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED" &&
    event.event.proposalEventId === proposalId);
  return found?.event.tag === "ARTIFACT_PROPOSAL_DISPOSITIONED"
    ? found.event.disposition
    : null;
};

const lifecycleArtifactRoleOrder: Readonly<Record<ArtifactRef["role"], number>> = {
  PROJECT_MANIFEST: 0,
  R1: 1,
  R2: 2,
  DESIGN: 3,
  PLAN: 4,
  R3: 5,
  GOVERNANCE: 6,
  VERIFICATION_MATERIAL: 7,
};

export const lifecycleArtifactRoleRank = (
  role: ArtifactRef["role"],
): number => lifecycleArtifactRoleOrder[role];

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
