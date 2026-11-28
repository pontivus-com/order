import { useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ArtifactRef,
  CandidateReviewEvent,
  ExecutionTask,
  Run,
  RunEvent,
  ValidationStage,
  WorkItem,
} from "../../src/core/contracts.ts";
import {
  executionTaskRuns,
  terminalExecutionFailureEvent,
  type ExecutionOwner,
  type ValidationBoundary,
} from "../../src/core/lifecycle.ts";
import * as api from "./http.ts";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import {
  invalidateWorkbenchMutation,
  workbenchQueryKeys,
} from "./query-keys.ts";
import {
  agentActivityRunEvents,
  executionQaSubmissionEvents,
  lifecycleArtifactLabel,
  runEventPresentation,
  runIsActive,
  runRoleLabel,
  runStatusLabel,
  runTerminalClassificationLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchAttention } from "./primitives/WorkbenchAttention.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchMasterDetail } from "./primitives/WorkbenchMasterDetail.tsx";
import { WorkbenchResourceList } from "./primitives/WorkbenchResourceList.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchSection } from "./primitives/WorkbenchSection.tsx";
import { WorkbenchFacts } from "./primitives/WorkbenchFacts.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";
import { WorkbenchTimeline } from "./primitives/WorkbenchTimeline.tsx";

const validationStages: readonly ValidationStage[] = [
  "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
];

const validationBoundaryLabel = (
  boundary: ValidationBoundary | null,
  scope: "Current" | "Recorded",
): string =>
  boundary === null
    ? scope + " boundary: updating"
    : boundary.tag === "FAILED_AT"
      ? scope + " boundary: failed at " + boundary.stage
      : boundary.tag === "PASSED_THROUGH"
        ? scope + " boundary: passed through " + boundary.stage
        : boundary.tag === "COMPLETE"
          ? scope + " boundary: complete"
          : scope + " boundary: not started";

const taskTone = (
  task: ExecutionTask,
): "danger" | "success" | "info" | "neutral" =>
  task.state === "BLOCKED"
    ? "danger"
    : task.state === "CANDIDATE_DONE" || task.state === "ALREADY_SATISFIED"
      ? "success"
      : task.state === "RUNNING"
        ? "info"
        : "neutral";

const taskStateLabel = (task: ExecutionTask): string => {
  switch (task.state) {
    case "TODO": return "Ready to start";
    case "RUNNING": return "Processing";
    case "CANDIDATE_DONE": return "Candidate ready";
    case "ALREADY_SATISFIED": return "No change required";
    case "BLOCKED": return "Blocked";
  }
};

const runTone = (
  run: Run,
): "danger" | "warning" | "success" | "info" | "neutral" =>
  run.status === "FAILED" || run.status === "BLOCKED"
    ? "danger"
    : run.status === "WAITING_FOR_INPUT"
      ? "warning"
      : run.status === "COMPLETED"
        ? "success"
        : run.status === "RUNNING"
          ? "info"
          : "neutral";

const latestValidationEvent = (
  events: readonly RunEvent[],
  stage: ValidationStage,
): RunEvent | null =>
  events.findLast(
    (event) =>
      (event.event.tag === "VALIDATION_PASSED" ||
        event.event.tag === "VALIDATION_FAILED") &&
      event.event.stage === stage,
  ) ?? null;

const validationRows = (
  events: readonly RunEvent[],
  stages: readonly ValidationStage[],
) =>
  stages.map((stage) => {
    const event = latestValidationEvent(events, stage);
    const passed = event?.event.tag === "VALIDATION_PASSED";
    const failed = event?.event.tag === "VALIDATION_FAILED";
    return {
      id: stage,
      testId: "validation-stage-" + stage,
      cells: {
        stage: <code>{stage}</code>,
        state: (
          <WorkbenchStatus
            tone={passed ? "success" : failed ? "danger" : "neutral"}
            label={passed ? "Passed" : failed ? "Failed" : "Not recorded"}
          />
        ),
        result:
          failed && event.event.tag === "VALIDATION_FAILED"
            ? event.event.summary
            : passed
              ? "Validation passed."
              : "—",
      },
    };
  });

const ValidationSummary = ({
  events,
  active,
  pending,
  failed,
}: Readonly<{
  events: readonly RunEvent[];
  active: boolean;
  pending: boolean;
  failed: boolean;
}>) => {
  const recordedStages = validationStages.filter(
    (stage) => latestValidationEvent(events, stage) !== null,
  );

  return (
    <div data-testid="validation-matrix">
      <WorkbenchSection title="Validation for selected attempt"
        description="Results recorded by this attempt."
        content={pending ? (
          <WorkbenchState kind="loading" title="Loading validation evidence…" />
        ) : failed ? (
          <WorkbenchState kind="error" title="Validation evidence unavailable" />
        ) : recordedStages.length === 0 ? (
        <WorkbenchState
          kind={active ? "pending" : "empty"}
          title={active ? "Awaiting validation evidence for this attempt" : "No validation results in this attempt"}
          description="Inspect other recorded attempts for their own validation evidence."
        />
      ) : (
        <>
          <WorkbenchTable
            label="Recorded validation"
            columns={[
              { key: "stage", label: "Stage" },
              { key: "state", label: "State" },
              { key: "result", label: "Result" },
            ]}
            rows={validationRows(events, recordedStages)}
          />
          {recordedStages.length < validationStages.length ? (
            <WorkbenchDisclosure
              label="Complete validation matrix"
              content={
                <WorkbenchTable
                  label="Complete validation matrix"
                  columns={[
                    { key: "stage", label: "Stage" },
                    { key: "state", label: "State" },
                    { key: "result", label: "Result" },
                  ]}
                  rows={validationRows(events, validationStages)}
                />
              }
            />
          ) : null}
        </>
      )}
      />
    </div>
  );
};

const values = (items: readonly string[]): ReactNode =>
  items.length === 0 ? "None" : (
    <ul>{items.map((item, index) => <li key={index}><code>{item}</code></li>)}</ul>
  );

const TaskContract = ({ task }: Readonly<{ task: ExecutionTask }>) => (
  <WorkbenchSection
    title="Signed task contract"
    content={
      <>
        <WorkbenchFacts label="Authorized scope" items={[
          { id: "scope", label: "Authorized scope", value: values(task.scope), emphasis: "strong" },
        ]} />
        <WorkbenchDisclosure
          label="Signed task details"
          content={
            <WorkbenchFacts label="Signed task contract" items={[
              { id: "exclusions", label: "Exclusions", value: values(task.exclusions) },
              { id: "acceptance", label: "Acceptance", value: values(task.acceptanceRefs) },
              { id: "authority", label: "Authority", value: values(task.authorityRefs) },
              { id: "concerns", label: "Concerns", value: values(task.concernIds) },
              { id: "gates", label: "Gates", value: values(task.gateIds) },
              { id: "dependencies", label: "Dependencies", value: values(task.dependsOn) },
              { id: "forecast", label: "Change surface forecast", value: values(task.changeSurface) },
            ]} />
          }
        />
      </>
    }
  />
);

export const ExecutionWorkspace = ({
  workItem,
  material,
  tasks,
  runs,
  runEvents,
  artifacts,
  statePending,
  stateError,
  executionOwner,
  validationBoundary,
  mutationsDisabled = false,
  onSelectMaterial,
  onOpenEvidence,
  onReturnFromEvidence,
  onReturnToAcceptance,
  reviewEvents = [],
  onOpenFinding,
  onMutationError,
}: Readonly<{
  workItem: WorkItem;
  material: WorkflowMaterial;
  tasks: readonly ExecutionTask[];
  runs: readonly Run[];
  runEvents: readonly RunEvent[];
  artifacts: readonly ArtifactRef[];
  statePending: boolean;
  stateError: unknown;
  executionOwner: ExecutionOwner;
  validationBoundary: ValidationBoundary | null;
  mutationsDisabled?: boolean;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onReturnFromEvidence: () => void;
  onReturnToAcceptance?: () => void;
  reviewEvents?: readonly CandidateReviewEvent[];
  onOpenFinding?: (entry: CandidateReviewEvent) => void;
  onMutationError?: (error: unknown) => void;
}>) => {
  const queryClient = useQueryClient();

  const currentOwnerTask =
    executionOwner.tag === "NONE"
      ? null
      : tasks.find((task) => task.id === executionOwner.taskId) ?? null;
  const latestOwnerRun = currentOwnerTask === null
    ? null
    : executionTaskRuns(currentOwnerTask.id, runs).at(-1) ?? null;
  const currentOwnerRun = latestOwnerRun !== null && runIsActive(latestOwnerRun)
    ? latestOwnerRun
    : null;

  const materialTask =
    material.kind === "EXECUTION_TASK"
      ? tasks.find((task) => task.id === material.taskId) ?? null
      : null;
  const selectedTask = materialTask ?? currentOwnerTask ?? tasks[0] ?? null;
  const taskRuns =
    selectedTask === null
      ? []
      : executionTaskRuns(selectedTask.id, runs);
  const latestSelectedTaskRun = taskRuns.at(-1) ?? null;
  const activeTaskRun = latestSelectedTaskRun !== null && runIsActive(latestSelectedTaskRun)
    ? latestSelectedTaskRun : null;
  const materialRun =
    material.kind === "EXECUTION_TASK"
      ? taskRuns.find((run) => run.id === material.runId) ?? null
      : null;
  const selectedRun =
    materialRun ??
    activeTaskRun ??
    latestSelectedTaskRun ??
    null;

  useEffect(() => {
    if (selectedTask === null || material.kind === "EVIDENCE") return;
    const next: WorkflowMaterial = {
      kind: "EXECUTION_TASK",
      taskId: selectedTask.id,
      runId: selectedRun?.id ?? null,
    };
    if (
      material.kind !== "EXECUTION_TASK" ||
      material.taskId !== next.taskId ||
      material.runId !== next.runId
    ) {
      onSelectMaterial(next);
    }
  }, [material, onSelectMaterial, selectedRun, selectedTask]);

  const eventKey = workbenchQueryKeys.runEvents(selectedRun?.id ?? null);
  const eventsQuery = useQuery({
    queryKey: eventKey,
    queryFn: async () => {
      if (selectedRun === null) return [];
      const current =
        queryClient.getQueryData<readonly RunEvent[]>(eventKey) ?? [];
      const after = current.at(-1)?.sequence ?? 0;
      const next = await api.listRunEvents(selectedRun.id, after);
      return after === 0 ? next : [...current, ...next];
    },
    enabled: selectedRun !== null,
    refetchInterval:
      selectedRun !== null && runIsActive(selectedRun) ? 1000 : false,
  });
  const events = eventsQuery.data ?? [];
  const activityEvents = agentActivityRunEvents(events);

  const invalidate = (): Promise<void> =>
    invalidateWorkbenchMutation(queryClient, workItem.id);
  const reportError = async (error: unknown): Promise<void> => {
    onMutationError?.(error);
    await invalidate();
  };

  const start = useMutation({
    mutationFn: () => {
      if (currentOwnerTask === null) {
        throw new TypeError("current execution owner has no task");
      }
      return api.startExecutionTask(workItem.id, currentOwnerTask.id);
    },
    onSuccess: invalidate,
    onError: reportError,
  });
  const cancel = useMutation({
    mutationFn: () => {
      if (currentOwnerRun === null) {
        throw new TypeError("current implementation owner has no active attempt");
      }
      return api.cancelRun(currentOwnerRun.id);
    },
    onSuccess: invalidate,
    onError: reportError,
  });
  const resume = useMutation({
    mutationFn: () => api.resumeWorkItem(workItem.id),
    onSuccess: invalidate,
    onError: reportError,
  });

  const canStart =
    workItem.stage === "EXECUTION" &&
    workItem.status === "ACTIVE" &&
    executionOwner.tag === "CURRENT_TASK" &&
    currentOwnerTask?.state === "TODO" &&
    currentOwnerRun === null;
  const canResume =
    workItem.stage === "EXECUTION" &&
    workItem.status === "BLOCKED" &&
    executionOwner.tag === "BLOCKED_TASK";

  const currentAction =
    currentOwnerRun !== null ? (
      <WorkbenchAction
        label="Cancel current implementation attempt"
        tone="destructive"
        loading={cancel.isPending}
        disabled={mutationsDisabled || cancel.isPending}
        onClick={() => cancel.mutate()}
      />
    ) : canResume ? (
      <WorkbenchAction
        label="Resume resolved blocker"
        tone="primary"
        loading={resume.isPending}
        disabled={mutationsDisabled || resume.isPending}
        onClick={() => resume.mutate()}
      />
    ) : canStart ? (
      <WorkbenchAction
        label="Start current task"
        tone="primary"
        loading={start.isPending}
        disabled={mutationsDisabled || start.isPending}
        onClick={() => start.mutate()}
      />
    ) : undefined;

  const mutationError = start.error ?? cancel.error ?? resume.error;
  const ownerFailure = latestOwnerRun === null
    ? null
    : terminalExecutionFailureEvent(latestOwnerRun, runEvents);
  const blockerReason = ownerFailure !== null
    ? runEventPresentation(ownerFailure).detail
    : latestOwnerRun === null
      ? "The approved task is blocked."
      : runTerminalClassificationLabel(latestOwnerRun.terminalClassification);
  const otherTaskBoundary = currentOwnerTask !== null && selectedTask?.id !== currentOwnerTask.id
    ? " " + validationBoundaryLabel(validationBoundary, "Current") + "."
    : "";
  const attention =
    mutationError !== null ? (
      <WorkbenchAttention
        title="Implementation action failed"
        description={
          mutationError instanceof Error
            ? mutationError.message
            : String(mutationError)
        }
        action={currentAction}
      />
    ) : executionOwner.tag === "BLOCKED_TASK" ? (
      <WorkbenchAttention
        title={
          currentOwnerTask === null
            ? "Implementation is blocked"
            : currentOwnerTask.objective + " is blocked"
        }
        description={blockerReason + " Resolve this blocker before resuming the approved task." + otherTaskBoundary}
        action={currentAction}
      />
    ) : currentAction === undefined ? undefined : (
      <WorkbenchAttention
        title={canStart ? "Ready to start current task" : "Current implementation attempt"}
        description={currentOwnerTask === null ? undefined : (
          canStart
            ? currentOwnerTask.objective + " — the exact approved task is current and has no active Run."
            : currentOwnerTask.objective
        ) + otherTaskBoundary}
        action={currentAction}
      />
    );

  const master = {
    label: "Approved tasks",
    items: tasks.flatMap((task) => {
      const selected = task.id === selectedTask?.id;
      const taskItem = {
        id: task.id,
        label: task.objective,
        detail: selected && taskRuns.length === 0 ? "No attempts yet" : undefined,
        state: <WorkbenchStatus tone={taskTone(task)} label={(currentOwnerTask?.id === task.id ? "Current · " : "") + taskStateLabel(task)} />,
        selected: selected && selectedRun === null,
        containsSelection: selected,
        onSelect: () => onSelectMaterial({
          kind: "EXECUTION_TASK",
          taskId: task.id,
          runId: executionTaskRuns(task.id, runs).at(-1)?.id ?? null,
        }),
      };
      return [
        taskItem,
        ...(selected ? taskRuns.map((run) => ({
          id: run.id,
          parentId: task.id,
          label: runRoleLabel(run.role) + " · Attempt " + run.attempt,
          detail: new Date(run.startedAt).toLocaleString(),
          state: <WorkbenchStatus tone={runTone(run)} label={runStatusLabel(run.status)} />,
          selected: run.id === selectedRun?.id,
          onSelect: () => onSelectMaterial({
            kind: "EXECUTION_TASK",
            taskId: task.id,
            runId: run.id,
          }),
        })) : []),
      ];
    }),
  };

  const selectedBoundary: ValidationBoundary | null =
    selectedTask === null
      ? null
      : currentOwnerTask?.id === selectedTask.id
        ? validationBoundary
        : selectedTask.state === "CANDIDATE_DONE" ||
            selectedTask.state === "ALREADY_SATISFIED"
          ? { tag: "COMPLETE" }
          : { tag: "NONE" };

  const detail =
    stateError !== null ? (
      <WorkbenchState
        kind="error"
        title="Implementation state unavailable"
        description={
          stateError instanceof Error ? stateError.message : String(stateError)
        }
      />
    ) : statePending ? (
      <WorkbenchState kind="loading" title="Loading implementation state…" />
    ) : selectedTask === null ? (
      <WorkbenchState kind="empty" title="No implementation tasks materialized" />
    ) : (
      <section className="order-implementation-detail" data-testid="execution-task-detail">
        <WorkbenchSectionHeader title="Implementation" description="Approved implementation task"
          action={<WorkbenchStatus tone={taskTone(selectedTask)} label={taskStateLabel(selectedTask)} />} />
        <WorkbenchFacts label="Task overview" items={[
          { id: "objective", label: "Objective", value: selectedTask.objective, emphasis: "strong" },
          { id: "attempt", label: "Current attempt", value: activeTaskRun === null
            ? "No active Run"
            : runRoleLabel(activeTaskRun.role) + " · Attempt " + activeTaskRun.attempt + " · " + runStatusLabel(activeTaskRun.status) },
          { id: "boundary", label: "Task validation boundary", value: selectedRun === null && (selectedBoundary?.tag === "NONE" || (selectedBoundary === null && selectedTask.state === "TODO"))
            ? "Not started"
            : validationBoundaryLabel(selectedBoundary, currentOwnerTask?.id === selectedTask.id ? "Current" : "Recorded") },
        ]} />

        <TaskContract task={selectedTask} />

        {selectedRun === null ? (
          <WorkbenchSection title="Chronology" description="No attempt events recorded."
            content={null} />
        ) : null}

        {selectedRun === null ? null : (
          <WorkbenchSection title="Attempt detail" content={<>
            <div data-testid="selected-run-header">
              <WorkbenchSectionHeader
                title={runRoleLabel(selectedRun.role) + " · Attempt " + selectedRun.attempt}
                description={
                  new Date(selectedRun.startedAt).toLocaleString() +
                  (selectedRun.endedAt === null
                    ? ""
                    : " — " + new Date(selectedRun.endedAt).toLocaleString())
                }
                action={
                  <WorkbenchStatus
                    tone={runTone(selectedRun)}
                    label={runStatusLabel(selectedRun.status)}
                  />
                }
              />
            </div>

            <ValidationSummary
              events={events}
              active={runIsActive(selectedRun)}
              pending={eventsQuery.isPending}
              failed={eventsQuery.isError}
            />

            {activityEvents.length === 0 ? null : (
              <WorkbenchTimeline
                label="Agent activity"
                items={activityEvents.map((event) => {
                  const presentation = runEventPresentation(event);
                  return {
                    id: event.id,
                    heading: <strong>{presentation.detail}</strong>,
                    meta: <time>{new Date(event.occurredAt).toLocaleString()}</time>,
                    body:
                      event.event.tag === "AGENT_ACTIVITY_RECORDED" &&
                      event.event.resource
                        ? <code>{event.event.resource}</code>
                        : undefined,
                  };
                })}
              />
            )}

            {eventsQuery.isPending ? (
              <WorkbenchState kind="loading" title="Loading attempt chronology…" />
            ) : eventsQuery.isError ? (
              <WorkbenchState
                kind="error"
                title="Attempt chronology unavailable"
                description={
                  eventsQuery.error instanceof Error
                    ? eventsQuery.error.message
                    : String(eventsQuery.error)
                }
              />
            ) : events.length === 0 ? (
              <WorkbenchState kind="empty" title="No persisted attempt events" />
            ) : (
              <RunEventTimeline
                run={selectedRun}
                events={events}
                onOpenEvidence={onOpenEvidence}
              />
            )}
          </>} />
        )}

        {selectedTask===null||selectedRun===null?null:(()=>{
          try{
            const submitted=executionQaSubmissionEvents(selectedTask,selectedRun,runs,runEvents,reviewEvents);
            if(submitted===null)return null;
            const review=events.find(value=>value.event.tag==="REVIEW_PASSED"||value.event.tag==="REVIEW_FAILED");
            const assessments=review?.event.tag==="REVIEW_PASSED"||review?.event.tag==="REVIEW_FAILED"?review.event.qaAssessments??[]:[];
            return <WorkbenchSection title="QA findings" content={<WorkbenchResourceList items={submitted.flatMap(entry=>{
              if(entry.event.tag!=="REPORT")return [];
              const assessment=assessments.find(value=>value.findingId===entry.id);
              return [{id:entry.id,label:entry.event.observed,detail:assessment?.rationale??"Submitted for independent review",action:onOpenFinding===undefined?undefined:<WorkbenchAction label="Inspect finding" onClick={()=>onOpenFinding(entry)}/> }];
            })}/>}/>;
          }catch{return <WorkbenchSection title="QA findings" content={<WorkbenchState kind="error" title="Exact submission history unavailable"/>}/>;}
        })()}
                <WorkbenchSection title="Evidence and governed material" content={artifacts.length === 0 ? (
            <WorkbenchState kind="empty" title="No governed implementation material" />
          ) : (
            <WorkbenchResourceList
              items={artifacts.map((artifact) => {
                const label = lifecycleArtifactLabel(artifact.role);
                return {
                  id: artifact.id,
                  label,
                  detail: "Read-only governed implementation material",
                  action: (
                    <WorkbenchAction
                      label={"Open " + label}
                      tone="secondary"
                      onClick={() =>
                        onOpenEvidence({
                          kind: "ARTIFACT",
                          artifactId: artifact.id,
                          label: label + ": " + artifact.repositoryPath,
                        })}
                    />
                  ),
                };
              })}
            />
          )} />
      </section>
    );

  const primary =
    material.kind === "EVIDENCE" && stateError === null && !statePending ? (
      <EvidenceViewer
        selection={material.selection}
        onBack={onReturnFromEvidence}
      />
    ) : (
      <WorkbenchSurface attention={attention} material={detail} />
    );

  return (
    <div data-testid="execution-workspace">
      {onReturnToAcceptance===undefined?null:<WorkbenchAction label="Back to Acceptance" onClick={onReturnToAcceptance}/> }
      <WorkbenchMasterDetail
        master={master}
        detail={primary}
      />
    </div>
  );
};
