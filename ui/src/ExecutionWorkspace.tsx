import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";
import {
  MetadataList,
  MetadataListItem,
} from "@astryxdesign/core/MetadataList";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@astryxdesign/core/Table";

import type {
  ExecutionTask,
  Run,
  RunEvent,
  ValidationStage,
  WorkItem,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { EvidenceViewer } from "./EvidenceViewer.tsx";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runIsActive,
  runRoleLabel,
  runStatusLabel,
  type EvidenceSelection,
  type WorkflowMaterial,
} from "./workbench-presentation.ts";
import {
  PrimaryMaterialFrame,
  WorkflowStepFrame,
  WorkflowStepIndex,
  WorkflowStepSummary,
  type WorkflowStepIndexGroup,
} from "./WorkflowStepFrame.tsx";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";

const validationStages: readonly ValidationStage[] = [
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
];

const taskVariant = (
  task: ExecutionTask,
): "error" | "warning" | "success" | "neutral" => {
  if (task.state === "BLOCKED") return "error";
  if (
    task.state === "CANDIDATE_DONE" ||
    task.state === "ALREADY_SATISFIED"
  ) {
    return "success";
  }
  if (task.state === "TODO") return "warning";
  return "neutral";
};

const runVariant = (
  run: Run,
): "error" | "warning" | "success" | "neutral" => {
  if (run.status === "FAILED" || run.status === "BLOCKED") return "error";
  if (run.status === "WAITING_FOR_INPUT") return "warning";
  if (run.status === "COMPLETED") return "success";
  return "neutral";
};

const taskStateLabel = (task: ExecutionTask): string =>
  task.state.replaceAll("_", " ").toLowerCase();

const latestValidationEvent = (
  events: readonly RunEvent[],
  stage: ValidationStage,
): RunEvent | null =>
  events.findLast((event) =>
    (event.event.tag === "VALIDATION_PASSED" ||
      event.event.tag === "VALIDATION_FAILED") &&
    event.event.stage === stage) ?? null;

const ValidationMatrix = ({
  events,
}: Readonly<{
  events: readonly RunEvent[];
}>) => (
  <section className="order-validation-matrix" data-testid="validation-matrix">
    <h3>Validation</h3>
    <Table
      density="compact"
      dividers="rows"
      textOverflow="wrap"
      label="V0 to V7 validation state"
    >
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Stage</TableHeaderCell>
          <TableHeaderCell>State</TableHeaderCell>
          <TableHeaderCell>Result</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {validationStages.map((stage) => {
          const event = latestValidationEvent(events, stage);
          const passed = event?.event.tag === "VALIDATION_PASSED";
          const failed = event?.event.tag === "VALIDATION_FAILED";
          return (
            <TableRow key={stage}>
              <TableCell><code>{stage}</code></TableCell>
              <TableCell>
                <Badge
                  variant={passed ? "success" : failed ? "error" : "neutral"}
                  label={passed ? "Passed" : failed ? "Failed" : "Not recorded"}
                />
              </TableCell>
              <TableCell>
                {failed && event.event.tag === "VALIDATION_FAILED"
                  ? event.event.summary
                  : passed
                    ? "Validation passed."
                    : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </section>
);

export const ExecutionWorkspace = ({
  workItem,
  material,
  onSelectMaterial,
  onOpenEvidence,
  onReturnFromEvidence,
}: Readonly<{
  workItem: WorkItem;
  material: WorkflowMaterial;
  onSelectMaterial: (material: WorkflowMaterial) => void;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onReturnFromEvidence: () => void;
}>) => {
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: workbenchQueryKeys.tasks(workItem.id),
    queryFn: () => api.listExecutionTasks(workItem.id),
  });
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) =>
      query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const artifactsQuery = useQuery({
    queryKey: workbenchQueryKeys.artifacts(workItem.id),
    queryFn: () => api.listArtifacts(workItem.id),
  });

  const tasks = tasksQuery.data ?? [];
  const runs = runsQuery.data ?? [];
  const materialTaskId =
    material.kind === "EXECUTION_TASK" ? material.taskId : null;
  const selectedTask =
    tasks.find((task) => task.id === materialTaskId) ??
    tasks.find((task) => task.state === "RUNNING" || task.state === "BLOCKED") ??
    tasks[0] ??
    null;
  const taskRuns = selectedTask
    ? runs.filter((run) => run.executionTaskId === selectedTask.id)
    : [];
  const materialRunId =
    material.kind === "EXECUTION_TASK" ? material.runId : null;
  const selectedRun =
    taskRuns.find((run) => run.id === materialRunId) ??
    taskRuns.find((run) => runIsActive(run)) ??
    taskRuns.at(-1) ??
    null;

  useEffect(() => {
    if (!selectedTask) return;
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
      if (!selectedRun) return [];
      const current =
        queryClient.getQueryData<readonly RunEvent[]>(eventKey) ?? [];
      const after = current.at(-1)?.sequence ?? 0;
      const next = await api.listRunEvents(selectedRun.id, after);
      return after === 0 ? next : [...current, ...next];
    },
    enabled: selectedRun !== null,
    refetchInterval:
      selectedRun && runIsActive(selectedRun) ? 1000 : false,
  });
  const events = eventsQuery.data ?? [];

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.tasks(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEventsRoot }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.artifacts(workItem.id) }),
    ]);
  };

  const tick = useMutation({
    mutationFn: api.tick,
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: () => {
      if (!selectedRun || !runIsActive(selectedRun)) {
        throw new TypeError("selected implementation attempt is not active");
      }
      return api.cancelRun(selectedRun.id);
    },
    onSuccess: invalidate,
  });
  const resume = useMutation({
    mutationFn: () => api.resumeWorkItem(workItem.id),
    onSuccess: invalidate,
  });

  const canRunNext =
    workItem.stage === "EXECUTION" &&
    workItem.status === "ACTIVE" &&
    !runs.some(runIsActive);
  const canResume =
    workItem.stage === "EXECUTION" &&
    workItem.status === "BLOCKED" &&
    selectedTask?.state === "BLOCKED";
  const currentAction = canResume ? (
    <WorkbenchAction
      label="Resume resolved blocker"
      tone="primary"
      loading={resume.isPending}
      disabled={resume.isPending}
      onClick={() => resume.mutate()}
    />
  ) : canRunNext ? (
    <WorkbenchAction
      label="Run next implementation step"
      tone="primary"
      loading={tick.isPending}
      disabled={tick.isPending}
      onClick={() => tick.mutate()}
    />
  ) : undefined;

  const mutationError = tick.error ?? cancel.error ?? resume.error;
  const summaryBlocker =
    selectedTask?.state === "BLOCKED"
      ? {
          status: "error" as const,
          title: "Implementation task is blocked",
          description: "Resolve the recorded blocker before resuming this approved task.",
        }
      : selectedRun?.status === "FAILED"
        ? {
            status: "error" as const,
            title: "Implementation attempt failed",
            description: "Inspect the attempt history and canonical failure feedback before continuing.",
          }
        : mutationError
          ? {
              status: "error" as const,
              title: "Implementation action failed",
              description: mutationError instanceof Error
                ? mutationError.message
                : String(mutationError),
            }
          : null;

  const groups: WorkflowStepIndexGroup[] = [];
  if (tasks.length > 0) {
    groups.push({
      id: "tasks",
      label: "Approved tasks",
      items: tasks.map((task) => ({
        id: task.id,
        label: task.planTaskId,
        description: task.objective,
        statusLabel: taskStateLabel(task),
        statusVariant: taskVariant(task),
        selected: task.id === selectedTask?.id,
        onSelect: () =>
          onSelectMaterial({
            kind: "EXECUTION_TASK",
            taskId: task.id,
            runId: runs.findLast(
              (run) => run.executionTaskId === task.id,
            )?.id ?? null,
          }),
      })),
    });
  }
  if (selectedTask && taskRuns.length > 0) {
    groups.push({
      id: "attempts",
      label: "Attempts",
      items: taskRuns.map((run) => ({
        id: run.id,
        label: runRoleLabel(run.role) + " · Attempt " + run.attempt,
        description: new Date(run.startedAt).toLocaleString(),
        statusLabel: runStatusLabel(run.status),
        statusVariant: runVariant(run),
        selected: run.id === selectedRun?.id,
        onSelect: () =>
          onSelectMaterial({
            kind: "EXECUTION_TASK",
            taskId: selectedTask.id,
            runId: run.id,
          }),
      })),
    });
  }

  const summary = (
    <WorkflowStepSummary
      label="Implementation"
      purpose="Execute and verify the approved change"
      stateLabel={workItem.stage === "EXECUTION" ? "Current" : "Reached"}
      stateVariant={workItem.stage === "EXECUTION" ? "info" : "neutral"}
      statusLabel={
        selectedTask
          ? taskStateLabel(selectedTask)
          : workItem.status === "COMPLETE"
            ? "Complete"
            : workItem.status.toLowerCase()
      }
      statusVariant={
        selectedTask
          ? taskVariant(selectedTask)
          : workItem.status === "BLOCKED"
            ? "error"
            : workItem.status === "COMPLETE"
              ? "success"
              : "neutral"
      }
      blocker={summaryBlocker}
      action={currentAction}
    />
  );

  if (tasksQuery.isError || runsQuery.isError || artifactsQuery.isError) {
    const error = tasksQuery.error ?? runsQuery.error ?? artifactsQuery.error;
    return (
      <WorkflowStepFrame
        summary={summary}
        primary={
          <PrimaryMaterialFrame
            error={{
              title: "Implementation state unavailable",
              description: error instanceof Error ? error.message : String(error),
            }}
          />
        }
      />
    );
  }

  if (tasksQuery.isPending || runsQuery.isPending || artifactsQuery.isPending) {
    return (
      <WorkflowStepFrame
        summary={summary}
        primary={<PrimaryMaterialFrame loading="Loading implementation state…" />}
      />
    );
  }

  const primary = material.kind === "EVIDENCE" ? (
    <EvidenceViewer
      selection={material.selection}
      onBack={onReturnFromEvidence}
    />
  ) : selectedTask ? (
    <section className="order-execution-task-material" data-testid="execution-workspace">
      <div className="order-task-summary" data-testid="execution-task-detail">
        <div className="order-card-heading">
          <div>
            <strong>{selectedTask.planTaskId}</strong>
            <span>{selectedTask.objective}</span>
          </div>
          <Badge
            variant={taskVariant(selectedTask)}
            label={taskStateLabel(selectedTask)}
          />
        </div>

        <MetadataList columns="multi">
          <MetadataListItem label="Gates">
            {selectedTask.gateIds.join(", ") || "None"}
          </MetadataListItem>
          <MetadataListItem label="Scope">
            {selectedTask.scope.join(", ") || "None"}
          </MetadataListItem>
          <MetadataListItem label="Change surface">
            {selectedTask.changeSurface.join(", ") || "None"}
          </MetadataListItem>
          <MetadataListItem label="Depends on">
            {selectedTask.dependsOn.length > 0
              ? selectedTask.dependsOn.join(", ")
              : "None"}
          </MetadataListItem>
        </MetadataList>
      </div>

      {selectedRun ? (
        <div className="order-run-summary" data-testid="selected-run-header">
          <div>
            <strong>
              {runRoleLabel(selectedRun.role)} · Attempt {selectedRun.attempt}
            </strong>
            <span>
              <Badge
                variant={runVariant(selectedRun)}
                label={runStatusLabel(selectedRun.status)}
              />
            </span>
          </div>
          <div className="order-inline-actions">
            {runIsActive(selectedRun) ? (
              <WorkbenchAction
                label="Cancel current implementation attempt"
                tone="destructive"
                loading={cancel.isPending}
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
              />
            ) : null}
          </div>
          <details className="order-technical-details">
            <summary>Technical details</summary>
            <dl>
              <div><dt>Task id</dt><dd><code>{selectedTask.id}</code></dd></div>
              <div><dt>Approval id</dt><dd><code>{selectedTask.approvalId}</code></dd></div>
              <div><dt>Run id</dt><dd><code>{selectedRun.id}</code></dd></div>
              <div><dt>Baseline</dt><dd><code>{selectedRun.baselineCommit}</code></dd></div>
              <div><dt>Context</dt><dd><code>{selectedRun.contextHash}</code></dd></div>
              <div><dt>Provider session</dt><dd><code>{selectedRun.providerSessionId ?? "—"}</code></dd></div>
              <div><dt>Terminal classification</dt><dd><code>{selectedRun.terminalClassification ?? "—"}</code></dd></div>
            </dl>
          </details>
        </div>
      ) : (
        <WorkbenchEmptyState compact title="No attempts yet" />
      )}

      <ValidationMatrix events={events} />

      <div className="order-event-scroll">
        {eventsQuery.isPending ? (
          <WorkbenchEmptyState compact title="Loading attempt timeline…" />
        ) : eventsQuery.isError ? (
          <WorkbenchErrorState
            title="Attempt timeline unavailable"
            description={eventsQuery.error instanceof Error
              ? eventsQuery.error.message
              : String(eventsQuery.error)}
          />
        ) : selectedRun && events.length > 0 ? (
          <RunEventTimeline
            run={selectedRun}
            events={events}
            onOpenEvidence={onOpenEvidence}
          />
        ) : (
          <WorkbenchEmptyState compact title="No persisted attempt events" />
        )}
      </div>

      <div className="order-material">
        <h3>Implementation material</h3>
        <div className="order-resource-list">
          {(artifactsQuery.data ?? []).map((artifact) => (
            <WorkbenchResourceRow
              key={artifact.id}
              label={artifact.role}
              detail={artifact.repositoryPath}
              actionLabel={"Open " + artifact.role + ": " + artifact.repositoryPath}
              onOpen={() =>
                onOpenEvidence({
                  kind: "ARTIFACT",
                  artifactId: artifact.id,
                  label: artifact.role + ": " + artifact.repositoryPath,
                })}
            />
          ))}
        </div>
      </div>
    </section>
  ) : (
    <WorkbenchEmptyState
      compact
      title="No implementation tasks materialized"
    />
  );

  return (
    <WorkflowStepFrame
      summary={summary}
      index={groups.length > 0 ? <WorkflowStepIndex groups={groups} /> : null}
      indexLabel="Implementation work"
      primary={<PrimaryMaterialFrame>{primary}</PrimaryMaterialFrame>}
    />
  );
};
