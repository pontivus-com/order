import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";

import type { ExecutionTask, Run, RunEvent, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { RunEventTimeline } from "./RunEventTimeline.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runIsActive,
  runRoleLabel,
  runStatusLabel,
  type EvidenceSelection,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchResourceRow } from "./primitives/WorkbenchResourceRow.tsx";

const taskVariant = (task: ExecutionTask): "error" | "warning" | "success" | "neutral" => {
  if (task.state === "BLOCKED") return "error";
  if (task.state === "CANDIDATE_DONE" || task.state === "ALREADY_SATISFIED") return "success";
  if (task.state === "TODO") return "warning";
  return "neutral";
};

export const ExecutionWorkspace = ({
  workItem,
  onOpenEvidence,
  onOpenActivity,
}: Readonly<{
  workItem: WorkItem;
  onOpenEvidence: (selection: EvidenceSelection) => void;
  onOpenActivity: (runId: Run["id"]) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<ExecutionTask["id"] | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<Run["id"] | null>(null);
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
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;
  const taskRuns = selectedTask
    ? runs.filter((run) => run.executionTaskId === selectedTask.id)
    : runs.filter((run) => run.executionTaskId !== null);
  const selectedRun =
    taskRuns.find((run) => run.id === selectedRunId) ??
    (taskRuns.find(runIsActive) ?? taskRuns.at(-1) ?? null);

  useEffect(() => {
    if (selectedTaskId !== null && tasks.some((task) => task.id === selectedTaskId)) return;
    const activeTaskRun = runs.find((run) => runIsActive(run) && run.executionTaskId !== null);
    setSelectedTaskId(activeTaskRun?.executionTaskId ?? tasks[0]?.id ?? null);
  }, [runs, selectedTaskId, tasks]);

  useEffect(() => {
    if (selectedRun && selectedRun.id !== selectedRunId) {
      setSelectedRunId(selectedRun.id);
    }
  }, [selectedRun, selectedRunId]);

  const eventKey = workbenchQueryKeys.runEvents(selectedRun?.id ?? null);
  const eventsQuery = useQuery({
    queryKey: eventKey,
    queryFn: async () => {
      if (!selectedRun) return [];
      const current = queryClient.getQueryData<readonly RunEvent[]>(eventKey) ?? [];
      const after = current.at(-1)?.sequence ?? 0;
      const next = await api.listRunEvents(selectedRun.id, after);
      return after === 0 ? next : [...current, ...next];
    },
    enabled: selectedRun !== null,
    refetchInterval: selectedRun && runIsActive(selectedRun) ? 1000 : false,
  });

  const tick = useMutation({
    mutationFn: api.tick,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.tasks(workItem.id) }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEventsRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.artifacts(workItem.id) }),
      ]);
    },
  });

  if (tasksQuery.isError || runsQuery.isError || artifactsQuery.isError) {
    const error = tasksQuery.error ?? runsQuery.error ?? artifactsQuery.error;
    return (
      <section className="order-workspace-section" data-testid="execution-workspace">
        <div className="order-section-heading"><h2>Implementation</h2><span>Approved task state</span></div>
        <WorkbenchErrorState title="Implementation state unavailable" description={error instanceof Error ? error.message : String(error)} />
      </section>
    );
  }

  if (tasksQuery.isPending || runsQuery.isPending || artifactsQuery.isPending) {
    return (
      <section className="order-workspace-section" data-testid="execution-workspace">
        <div className="order-section-heading"><h2>Implementation</h2><span>Approved task state</span></div>
        <WorkbenchEmptyState compact title="Loading implementation state…" />
      </section>
    );
  }

  return (
    <section className="order-workspace-section order-execution-workspace" data-testid="execution-workspace">
      <div className="order-section-heading">
        <div>
          <h2>Implementation</h2>
          <span>Execute and verify the approved change</span>
        </div>
        {workItem.stage === "EXECUTION" && workItem.status === "ACTIVE" ? (
          <WorkbenchAction
            label="Run next implementation step"
            tone="primary"
            loading={tick.isPending}
            onClick={() => tick.mutate()}
          />
        ) : null}
      </div>
      {tick.error ? (
        <WorkbenchErrorState
          title="Implementation action failed"
          description={tick.error instanceof Error ? tick.error.message : String(tick.error)}
        />
      ) : null}

      <div className="order-execution-layout">
        <aside className="order-execution-master">
          <div className="order-master-section">
            <strong>Approved tasks</strong>
            <div className="order-task-master" data-testid="execution-task-master">
              {tasks.length === 0 ? (
                <WorkbenchEmptyState compact title="No implementation tasks materialized" />
              ) : tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  aria-pressed={task.id === selectedTask?.id}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <span>{task.planTaskId}</span>
                  <Badge variant={taskVariant(task)} label={task.state.replaceAll("_", " ").toLowerCase()} />
                </button>
              ))}
            </div>
          </div>

          <div className="order-master-section">
            <strong>Task attempts</strong>
            <nav className="order-run-list" aria-label="Task attempts">
              {taskRuns.length === 0 ? (
                <WorkbenchEmptyState compact title="No attempts yet" />
              ) : taskRuns.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  aria-pressed={run.id === selectedRun?.id}
                  onClick={() => setSelectedRunId(run.id)}
                >
                  <span>{runRoleLabel(run.role)} · Attempt {run.attempt}</span>
                  <span>{runStatusLabel(run.status)}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="order-execution-detail">
          {selectedTask ? (
            <div className="order-task-summary" data-testid="execution-task-detail">
              <div className="order-card-heading">
                <strong>{selectedTask.planTaskId}</strong>
                <Badge variant={taskVariant(selectedTask)} label={selectedTask.state.replaceAll("_", " ").toLowerCase()} />
              </div>
              <p>{selectedTask.objective}</p>
              <div>Gates: {selectedTask.gateIds.join(", ") || "—"}</div>
              <div>Change surface: {selectedTask.changeSurface.join(", ") || "—"}</div>
            </div>
          ) : null}

          <div className="order-events">
            {selectedRun ? (
              <div className="order-run-summary">
                <div>
                  <strong>{runRoleLabel(selectedRun.role)} · Attempt {selectedRun.attempt}</strong>
                  <span>{runStatusLabel(selectedRun.status)}</span>
                </div>
                <WorkbenchAction
                  label="Open in Activity"
                  tone="ghost"
                  onClick={() => onOpenActivity(selectedRun.id)}
                />
              </div>
            ) : null}
            <div className="order-event-scroll">
              {eventsQuery.isPending ? (
                <WorkbenchEmptyState compact title="Loading attempt timeline…" />
              ) : eventsQuery.isError ? (
                <WorkbenchErrorState
                  title="Attempt timeline unavailable"
                  description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)}
                />
              ) : selectedRun && (eventsQuery.data ?? []).length > 0 ? (
                <RunEventTimeline
                  run={selectedRun}
                  events={eventsQuery.data ?? []}
                  onOpenEvidence={onOpenEvidence}
                />
              ) : (
                <WorkbenchEmptyState compact title="No persisted attempt events" />
              )}
            </div>
          </div>

          <div className="order-material">
            <h3>Read-only implementation material</h3>
            <div className="order-resource-list">
              {(artifactsQuery.data ?? []).map((artifact) => (
                <WorkbenchResourceRow
                  key={artifact.id}
                  label={artifact.role}
                  detail={artifact.repositoryPath}
                  actionLabel={"Open " + artifact.role + ": " + artifact.repositoryPath}
                  onOpen={() => onOpenEvidence({
                    kind: "ARTIFACT",
                    artifactId: artifact.id,
                    label: artifact.role + ": " + artifact.repositoryPath,
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
