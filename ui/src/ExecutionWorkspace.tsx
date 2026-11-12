import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@astryxdesign/core/Badge";

import type { EvidenceRef, ExecutionTask, Run, RunEvent, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { runIsActive, type EvidenceSelection } from "./workbench-presentation.ts";
import { WorkbenchEmptyState, WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

const eventDetail = (event: RunEvent): string => {
  const payload = event.event;
  switch (payload.tag) {
    case "AGENT_MESSAGE_FINAL": return payload.text;
    case "HUMAN_INPUT_REQUESTED": return payload.question;
    case "HUMAN_INPUT_RECEIVED": return payload.text;
    case "ARTIFACT_PROPOSAL_CREATED": return payload.targetPath + " — " + payload.rationale;
    case "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED": return "Adoption requested";
    case "ARTIFACT_PROPOSAL_DISPOSITIONED": return payload.disposition;
    case "STAGE_COMPLETED": return payload.completion.stage + ": " + payload.completion.outcome;
    case "STAGE_BLOCKED": return payload.reason;
    case "TASK_ALREADY_SATISFIED": return payload.summary;
    case "CONFORMANCE_FAILED": return payload.summary;
    case "PROVIDER_FAILED": return payload.detail;
    case "GATE_PASSED":
    case "GATE_FAILED": return payload.gateId;
    case "REVIEW_FAILED": return payload.summary;
    case "VALIDATION_PASSED":
    case "VALIDATION_FAILED": return payload.stage;
    case "CANDIDATE_STATE_RECORDED": return payload.changedPaths.join(", ");
    case "CANDIDATE_RECORDED": return "Verified candidate recorded";
    case "OBSERVATION_RECORDED": return payload.title + ": " + payload.detail;
    case "AUTHORITY_CHANGED": return "Authority changed";
    case "REPOSITORY_DRIFTED": return "Repository baseline drifted";
    case "STAGE_STARTED": return payload.stage + " / " + payload.mode;
    case "CONFORMANCE_PASSED": return payload.stage + " conformance passed";
    case "REVIEW_PASSED": return "Independent review passed";
  }
};

const eventEvidence = (event: RunEvent): readonly EvidenceRef[] => {
  const payload = event.event;
  if ("evidence" in payload && Array.isArray(payload.evidence)) return payload.evidence;
  if (payload.tag === "CANDIDATE_STATE_RECORDED") return [payload.patch];
  return [];
};

const taskVariant = (task: ExecutionTask): "error" | "warning" | "success" | "neutral" => {
  if (task.state === "BLOCKED") return "error";
  if (task.state === "CANDIDATE_DONE" || task.state === "ALREADY_SATISFIED") return "success";
  if (task.state === "TODO") return "warning";
  return "neutral";
};

export const ExecutionWorkspace = ({
  workItem,
  onOpenEvidence,
}: Readonly<{
  workItem: WorkItem;
  onOpenEvidence: (selection: EvidenceSelection) => void;
}>) => {
  const queryClient = useQueryClient();
  const [selectedRunId, setSelectedRunId] = useState<Run["id"] | null>(null);
  const tasksQuery = useQuery({ queryKey: workbenchQueryKeys.tasks(workItem.id), queryFn: () => api.listExecutionTasks(workItem.id) });
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) => query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const artifactsQuery = useQuery({ queryKey: workbenchQueryKeys.artifacts(workItem.id), queryFn: () => api.listArtifacts(workItem.id) });
  const runs = runsQuery.data ?? [];
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? null;

  useEffect(() => {
    if (selectedRunId !== null && runs.some((run) => run.id === selectedRunId)) return;
    setSelectedRunId((runs.find(runIsActive) ?? runs.at(-1) ?? null)?.id ?? null);
  }, [runs, selectedRunId]);

  const eventKey = workbenchQueryKeys.runEvents(selectedRunId);
  const eventsQuery = useQuery({
    queryKey: eventKey,
    queryFn: async () => {
      if (!selectedRunId) return [];
      const current = queryClient.getQueryData<readonly RunEvent[]>(eventKey) ?? [];
      const after = current.at(-1)?.sequence ?? 0;
      const next = await api.listRunEvents(selectedRunId, after);
      return after === 0 ? next : [...current, ...next];
    },
    enabled: selectedRunId !== null,
    refetchInterval: selectedRun && runIsActive(selectedRun) ? 1000 : false,
  });

  if (tasksQuery.isError || runsQuery.isError || artifactsQuery.isError) {
    const error = tasksQuery.error ?? runsQuery.error ?? artifactsQuery.error;
    return (
      <section className="order-workspace-section" data-testid="execution-workspace">
        <div className="order-section-heading"><h2>Execution and validation</h2><span>Read-only canonical state</span></div>
        <WorkbenchErrorState title="Execution state unavailable" description={error instanceof Error ? error.message : String(error)} />
      </section>
    );
  }

  if (tasksQuery.isPending || runsQuery.isPending || artifactsQuery.isPending) {
    return (
      <section className="order-workspace-section" data-testid="execution-workspace">
        <div className="order-section-heading"><h2>Execution and validation</h2><span>Read-only canonical state</span></div>
        <WorkbenchEmptyState compact title="Loading execution state…" />
      </section>
    );
  }

  return (
    <section className="order-workspace-section" data-testid="execution-workspace">
      <div className="order-section-heading"><h2>Execution and validation</h2><span>Read-only canonical state</span></div>
      <div className="order-task-list">
        {(tasksQuery.data ?? []).length === 0 ? <WorkbenchEmptyState compact title="No execution tasks materialized" /> :
          (tasksQuery.data ?? []).map((task) => (
            <article key={task.id} className="order-task-card">
              <div className="order-card-heading"><strong>{task.planTaskId}</strong><Badge variant={taskVariant(task)} label={task.state} /></div>
              <p>{task.objective}</p>
              <div>Gates: {task.gateIds.join(", ") || "—"}</div>
              <div>Change surface: {task.changeSurface.join(", ") || "—"}</div>
            </article>
          ))}
      </div>

      <div className="order-run-layout">
        <nav className="order-run-list" aria-label="Runs">
          {runs.length === 0 ? <WorkbenchEmptyState compact title="No runs yet" /> : runs.map((run) => (
            <button key={run.id} type="button" aria-pressed={run.id === selectedRunId} onClick={() => setSelectedRunId(run.id)}>
              {run.role} #{run.attempt}<span>{run.status}</span>
            </button>
          ))}
        </nav>
        <div className="order-events">
          {selectedRun ? <div className="order-run-summary"><strong>{selectedRun.role} · {selectedRun.stage}</strong><span>{selectedRun.status}</span></div> : null}
          {eventsQuery.isPending ? <WorkbenchEmptyState compact title="Loading events…" /> :
           eventsQuery.isError ? <WorkbenchErrorState title="Events unavailable" description={eventsQuery.error instanceof Error ? eventsQuery.error.message : String(eventsQuery.error)} /> :
           (eventsQuery.data ?? []).length === 0 ? <WorkbenchEmptyState compact title="No persisted events" /> :
           <ol className="order-event-list">{(eventsQuery.data ?? []).map((event) => (
             <li key={event.id}>
               <div><strong>{event.event.tag.replaceAll("_", " ")}</strong><time>{new Date(event.occurredAt).toLocaleString()}</time></div>
               <p>{eventDetail(event)}</p>
               {selectedRun ? eventEvidence(event).map((evidence) => (
                 <button key={evidence.relativePath} type="button" onClick={() => onOpenEvidence({ kind: "EVIDENCE", runId: selectedRun.id, relativePath: evidence.relativePath })}>
                   Evidence: {evidence.relativePath}
                 </button>
               )) : null}
             </li>
           ))}</ol>}
        </div>
      </div>

      <div className="order-material">
        <h3>Read-only material</h3>
        <div className="order-inline-actions">
          {(artifactsQuery.data ?? []).map((artifact) => (
            <button key={artifact.id} type="button" onClick={() => onOpenEvidence({ kind: "ARTIFACT", artifactId: artifact.id, label: artifact.role + ": " + artifact.repositoryPath })}>
              {artifact.role}: {artifact.repositoryPath}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
