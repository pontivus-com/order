import {
  type ArtifactRef,
  type StageCompletion,
  type ValidationClassification,
  type WorkItem,
  type WorkStage,
} from "./contracts.ts";

export type UpstreamReturnStage = "R1" | "R2" | "DESIGN" | "PLAN" | "R3";

export const directlyEditableArtifactRoles = [
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
] as const;

export const artifactDirectEditIsAllowed = (
  workItem: Pick<WorkItem, "stage" | "status">,
  artifact: Pick<ArtifactRef, "role" | "authorityLayer">,
): boolean => {
  if (workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE") return false;
  if (!directlyEditableArtifactRoles.includes(
    artifact.role as (typeof directlyEditableArtifactRoles)[number],
  )) {
    return false;
  }
  const owner = artifactReturnOwner(artifact);
  return owner !== "R3" && stageRank(owner) <= stageRank(workItem.stage);
};

export const artifactReturnOwner = (
  artifact: Pick<ArtifactRef, "role" | "authorityLayer">,
): UpstreamReturnStage => {
  if (artifact.role === "PROJECT_MANIFEST" || artifact.role === "R1") return "R1";
  if (
    artifact.role === "R2" ||
    artifact.authorityLayer === "P0" ||
    artifact.authorityLayer === "P1" ||
    artifact.authorityLayer === "P2" ||
    artifact.authorityLayer === "P3"
  ) return "R2";
  if (
    artifact.role === "DESIGN" ||
    artifact.authorityLayer === "P4" ||
    artifact.authorityLayer === "P5" ||
    artifact.authorityLayer === "P6"
  ) return "DESIGN";
  if (artifact.role === "R3") return "R3";
  if (
    artifact.role === "PLAN" ||
    artifact.role === "VERIFICATION_MATERIAL" ||
    artifact.authorityLayer === "P7" ||
    artifact.authorityLayer === "P8"
  ) return "PLAN";
  return "DESIGN";
};

export const stageOrder: readonly WorkStage[] = [
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
  "AWAITING_SIGNOFF",
  "EXECUTION",
  "COMPLETE",
];

export const stageRank = (stage: WorkStage): number => stageOrder.indexOf(stage);

export const earliestStage = (stages: readonly WorkStage[]): WorkStage | null => {
  if (stages.length === 0) return null;
  return [...stages].sort((left, right) => stageRank(left) - stageRank(right))[0] ?? null;
};

export const evaluateStageCompletion = (
  workItem: WorkItem,
  completion: StageCompletion,
  allowedR1Completions: readonly StageCompletion["outcome"][] | null,
): Readonly<Pick<WorkItem, "stage" | "status" | "outcome">> => {
  if (workItem.stage !== completion.stage) {
    throw new TypeError(`completion stage ${completion.stage} does not own work item stage ${workItem.stage}`);
  }

  switch (completion.stage) {
    case "R1":
      if (
        allowedR1Completions === null ||
        !allowedR1Completions.includes(completion.outcome)
      ) {
        throw new TypeError(
          `R1 outcome ${completion.outcome} is invalid for schema ${workItem.schemaId}`,
        );
      }
      return completion.outcome === "CONFIRMED"
        ? { stage: "R2", status: "ACTIVE", outcome: null }
        : { stage: "COMPLETE", status: "COMPLETE", outcome: completion.outcome };
    case "R2":
      return { stage: "DESIGN", status: "ACTIVE", outcome: null };
    case "DESIGN":
      return { stage: "PLAN", status: "ACTIVE", outcome: null };
    case "PLAN":
      return { stage: "R3", status: "ACTIVE", outcome: null };
    case "R3":
      switch (completion.outcome) {
        case "READY_FOR_SIGNOFF":
          return { stage: "AWAITING_SIGNOFF", status: "ACTIVE", outcome: null };
        case "RETURN_TO_RESEARCH":
          return { stage: "R1", status: "ACTIVE", outcome: null };
        case "RETURN_TO_REQUIREMENTS":
          return { stage: "R2", status: "ACTIVE", outcome: null };
        case "RETURN_TO_DESIGN":
          return { stage: "DESIGN", status: "ACTIVE", outcome: null };
        case "RETURN_TO_PLAN":
          return { stage: "PLAN", status: "ACTIVE", outcome: null };
      }
  }

  throw new TypeError("unsupported stage completion");
};

export const sourceChangeLifecycleState = (
  workItem: WorkItem,
): Readonly<Pick<WorkItem, "stage" | "status" | "outcome">> =>
  workItem.stage === "COMPLETE"
    ? { stage: "COMPLETE", status: "COMPLETE", outcome: workItem.outcome }
    : { stage: "R1", status: "ACTIVE", outcome: null };

export const routeValidationFailure = (
  classification:
    | ValidationClassification
    | "PRECONDITION_FAILED"
    | "BLOCKED_FOR_REANALYSIS",
  reanalysisReturnTo?: "R1" | "R2" | "DESIGN" | "PLAN",
): UpstreamReturnStage | null => {
  switch (classification) {
    case "SPEC_INVALID":
    case "SCOPE_BREACH":
      return "PLAN";
    case "GOVERNANCE_BREACH":
      return "DESIGN";
    case "APPROVAL_STALE":
      return null;
    case "BLOCKED_FOR_REANALYSIS":
      if (!reanalysisReturnTo) throw new TypeError("reanalysis failure requires returnTo");
      return reanalysisReturnTo;
    default:
      return null;
  }
};

export const routeApprovalStale = (
  changedMaterialOwners: readonly UpstreamReturnStage[],
): UpstreamReturnStage => {
  const earliest = earliestStage(changedMaterialOwners);
  if (
    earliest === "R1" ||
    earliest === "R2" ||
    earliest === "DESIGN" ||
    earliest === "PLAN" ||
    earliest === "R3"
  ) {
    return earliest;
  }
  throw new TypeError("approval-stale routing requires at least one resolved material owner");
};
