import {
  SignedTaskBlockSchema,
  type ApprovalId,
  type ExecutionTask,
  type ExecutionTaskId,
  type ExecutionTaskState,
  type Run,
  type RunEventPayload,
  type RunRole,
  type SignedTaskBlock,
  type ValidationClassification,
  type WorkItem,
  type WorkOutcome,
} from "./contracts.ts";

export const successfulTaskStates = new Set<ExecutionTaskState>([
  "CANDIDATE_DONE",
  "ALREADY_SATISFIED",
]);

export const isPostSignoffRole = (
  role: RunRole,
): role is Exclude<RunRole, "STAGE"> => role !== "STAGE";

export const materializeExecutionTasks = (
  approvalId: ApprovalId,
  block: SignedTaskBlock,
  generatedIds: readonly ExecutionTaskId[],
): readonly ExecutionTask[] => {
  if (generatedIds.length !== block.tasks.length || new Set(generatedIds).size !== generatedIds.length) {
    throw new TypeError("generated execution-task ids must map one-to-one to signed tasks");
  }

  const idByPlanTaskId = new Map<string, ExecutionTaskId>();
  for (const [index, task] of block.tasks.entries()) {
    const generatedId = generatedIds[index];
    if (generatedId === undefined) {
      throw new TypeError("generated execution-task id is missing");
    }
    idByPlanTaskId.set(task.id, generatedId);
  }

  return block.tasks.map((task) => {
    const id = idByPlanTaskId.get(task.id);
    if (id === undefined) throw new TypeError(`generated execution-task id is missing for ${task.id}`);
    return {
    id,
    approvalId,
    planTaskId: task.id,
    objective: task.objective,
    dependsOn: task.dependsOn.map((dependency) => {
      const id = idByPlanTaskId.get(dependency);
      if (!id) throw new TypeError(`unknown signed dependency ${dependency}`);
      return id;
    }),
    scope: [...task.scope],
    exclusions: [...task.exclusions],
    acceptanceRefs: [...task.acceptanceRefs],
    changeSurface: [...task.changeSurface],
    gateIds: [...task.gateIds],
    authorityRefs: [...task.authorityRefs],
    concernIds: [...task.concernIds],
    state: "TODO",
  };
  });
};

export const dependencyIsSatisfied = (state: ExecutionTaskState): boolean =>
  successfulTaskStates.has(state);

export const executionTaskIsEligible = (
  task: ExecutionTask,
  tasks: readonly ExecutionTask[],
): boolean => {
  if (task.state !== "TODO") return false;
  const byId = new Map(tasks.map((candidate) => [candidate.id, candidate] as const));
  return task.dependsOn.every((dependencyId) => {
    const dependency = byId.get(dependencyId);
    return dependency !== undefined && dependencyIsSatisfied(dependency.state);
  });
};

export const aggregateTaskCompletion = (
  tasks: readonly ExecutionTask[],
): Readonly<{ complete: boolean; outcome: WorkOutcome | null }> => {
  if (tasks.length === 0 || !tasks.every((task) => dependencyIsSatisfied(task.state))) {
    return { complete: false, outcome: null };
  }

  return {
    complete: true,
    outcome: tasks.every((task) => task.state === "ALREADY_SATISFIED")
      ? "ALREADY_SATISFIED"
      : "CANDIDATE_DONE",
  };
};

export const stageProviderTags = new Set([
  "AGENT_MESSAGE_FINAL",
  "HUMAN_INPUT_REQUESTED",
  "ARTIFACT_PROPOSAL_CREATED",
  "STAGE_COMPLETED",
  "STAGE_BLOCKED",
  "OBSERVATION_RECORDED",
]);

const mutatingProviderTags = [
  "AGENT_MESSAGE_FINAL",
  "STAGE_BLOCKED",
  "OBSERVATION_RECORDED",
] as const;

export const builderProviderTags = new Set([
  ...mutatingProviderTags,
  "TASK_ALREADY_SATISFIED",
  "GATE_CHECKPOINT_REQUESTED",
]);

export const remediatorProviderTags = new Set<string>(mutatingProviderTags);

export const reviewerProviderTags = new Set([
  "REVIEW_PASSED",
  "REVIEW_FAILED",
  "OBSERVATION_RECORDED",
]);

export const providerEventIsAdmitted = (
  role: RunRole,
  payload: RunEventPayload,
): boolean => {
  const allowed =
    role === "STAGE"
      ? stageProviderTags.has(payload.tag)
      : role === "REVIEWER"
        ? reviewerProviderTags.has(payload.tag)
        : role === "BUILDER"
          ? builderProviderTags.has(payload.tag)
          : remediatorProviderTags.has(payload.tag);

  if (!allowed) return false;

  if (
    role === "REVIEWER" &&
    payload.tag === "REVIEW_PASSED" &&
    payload.minimumChange === undefined
  ) {
    return false;
  }

  if (
    (role === "BUILDER" || role === "REMEDIATOR") &&
    payload.tag === "STAGE_BLOCKED"
  ) {
    return payload.owningStage === "EXECUTION";
  }

  if (
    payload.tag === "TASK_ALREADY_SATISFIED" ||
    payload.tag === "GATE_CHECKPOINT_REQUESTED"
  ) {
    return role === "BUILDER";
  }

  return true;
};

// QA assessment admission is deliberately separate from ordinary provider tags.
// Exact submitted IDs, once each, and the ordinary V4 verdict must agree.
export const qaReviewAssessmentsAreAdmitted = (
  payload: RunEventPayload,
  submitted: readonly import("./contracts.ts").CandidateReviewEventId[] | null,
): boolean => {
  if (payload.tag !== "REVIEW_PASSED" && payload.tag !== "REVIEW_FAILED") return false;
  if (submitted === null) return payload.qaAssessments === undefined;
  const assessments = payload.qaAssessments;
  if (submitted.length === 0 || new Set(submitted).size !== submitted.length ||
      assessments === undefined || assessments.length !== submitted.length ||
      new Set(assessments.map(value => value.findingId)).size !== assessments.length ||
      !assessments.every(value => submitted.includes(value.findingId))) return false;
  const upstream = assessments.some(value => value.verdict === "UPSTREAM");
  const repairable = assessments.some(value => value.verdict === "FAIL_REPAIRABLE");
  if (payload.tag === "REVIEW_PASSED") return !upstream && !repairable;
  if (upstream) return payload.classification === "BLOCKED_FOR_REANALYSIS";
  if (repairable) return payload.classification === "REVIEW_FAILURE";
  return true; // ordinary V4 can fail a separate signed obligation
};

type BuilderCheckpointRequest = Extract<
  RunEventPayload,
  { tag: "GATE_CHECKPOINT_REQUESTED" }
>;

export const builderCheckpointRequestForTurn = (
  role: RunRole,
  payloads: readonly RunEventPayload[],
): BuilderCheckpointRequest | null => {
  const requests = payloads.filter(
    (payload): payload is BuilderCheckpointRequest =>
      payload.tag === "GATE_CHECKPOINT_REQUESTED",
  );
  if (requests.length === 0) return null;
  if (role !== "BUILDER") {
    throw new TypeError("only BUILDER may request an execution checkpoint");
  }
  if (requests.length !== 1) {
    throw new TypeError("BUILDER turn may request at most one execution checkpoint");
  }
  if (payloads.at(-1)?.tag !== "GATE_CHECKPOINT_REQUESTED") {
    throw new TypeError("BUILDER checkpoint request must be the terminal turn action");
  }
  if (
    payloads.slice(0, -1).some((payload) =>
      payload.tag === "STAGE_BLOCKED" ||
      payload.tag === "TASK_ALREADY_SATISFIED"
    )
  ) {
    throw new TypeError(
      "BUILDER checkpoint request cannot coexist with another terminal execution action",
    );
  }
  return requests[0]!;
};

export const semanticRepairIsAllowed = (
  classification: ValidationClassification | "CHANGE_BLOAT",
  priorRepairClassifications: readonly string[],
): boolean => {
  if (
    classification !== "TEST_FAILURE" &&
    classification !== "REVIEW_FAILURE" &&
    classification !== "CHANGE_BLOAT"
  ) {
    return false;
  }
  return !priorRepairClassifications.includes(classification);
};

export type OperationalActionKey = Readonly<{
  executionTaskId: ExecutionTaskId;
  role: Exclude<RunRole, "STAGE">;
  triggerEventId: string | null;
}>;

export const sameActionKey = (run: Run, key: OperationalActionKey): boolean =>
  run.executionTaskId === key.executionTaskId &&
  run.role === key.role &&
  run.triggerEventId === key.triggerEventId;

export const decideOperationalRecovery = (
  history: readonly Run[],
  key: OperationalActionKey,
): "REPLACE" | "BLOCK" => {
  const losses = history.filter(
    (run) =>
      sameActionKey(run, key) &&
      (run.terminalClassification === "PROVIDER_FAILURE" ||
        run.terminalClassification === "COORDINATOR_INTERRUPTED"),
  ).length;
  if (losses === 0) {
    throw new TypeError("operational recovery requires a recorded operational loss");
  }
  return losses === 1 ? "REPLACE" : "BLOCK";
};

export const executionResumeIsAllowed = (input: Readonly<{
  workItemStatus: WorkItem["status"];
  taskState: ExecutionTaskState;
  approvalCurrent: boolean;
  blockerResolved: boolean;
}>): boolean =>
  input.workItemStatus === "BLOCKED" &&
  input.taskState === "BLOCKED" &&
  input.approvalCurrent &&
  input.blockerResolved;

const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

export const parseSignedTaskBlockFromPlan = (planBytes: Uint8Array) => {
  const planText = utf8Decoder.decode(planBytes);
  const matches = [
    ...planText.matchAll(/^[ \t]*```order-tasks[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```[ \t]*$/gm),
  ];
  if (matches.length !== 1 || matches[0]?.[1] === undefined) {
    throw new TypeError("signed PLAN must contain exactly one order-tasks block");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(matches[0][1]);
  } catch (error) {
    throw new TypeError("order-tasks block must contain valid JSON", { cause: error });
  }
  return SignedTaskBlockSchema.parse(parsed);
};

export const admitSignedTaskBlockForSchema = (
  schemaId: WorkItem["schemaId"],
  block: SignedTaskBlock,
): SignedTaskBlock => {
  if (schemaId !== "change-v2" && schemaId !== "defect-v2") return block;

  if (block.tasks.length === 0) {
    throw new TypeError("current v2 Change/Defect PLAN requires at least one signed task");
  }
  for (const task of block.tasks) {
    if (task.id.length === 0 || task.id !== task.id.trim()) {
      throw new TypeError("current v2 signed task id must be trimmed and non-empty");
    }
    if (task.objective.length === 0 || task.objective !== task.objective.trim()) {
      throw new TypeError("current v2 signed task objective must be trimmed and non-empty");
    }
    for (const [field, count] of [
      ["scope", task.scope.length],
      ["acceptanceRefs", task.acceptanceRefs.length],
      ["changeSurface", task.changeSurface.length],
      ["gateIds", task.gateIds.length],
      ["authorityRefs", task.authorityRefs.length],
      ["concernIds", task.concernIds.length],
    ] as const) {
      if (count === 0) {
        throw new TypeError(`current v2 signed task ${task.id} requires non-empty ${field}`);
      }
    }
  }
  return block;
};
