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

export const builderProviderTags = new Set([
  "AGENT_MESSAGE_FINAL",
  "STAGE_BLOCKED",
  "TASK_ALREADY_SATISFIED",
  "OBSERVATION_RECORDED",
]);

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
        : builderProviderTags.has(payload.tag);

  if (!allowed) return false;

  if (
    (role === "BUILDER" || role === "REMEDIATOR") &&
    payload.tag === "STAGE_BLOCKED"
  ) {
    return payload.owningStage === "EXECUTION";
  }

  if (payload.tag === "TASK_ALREADY_SATISFIED") {
    return role === "BUILDER";
  }

  return true;
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
