import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Run, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { runIsActive } from "./workbench-presentation.ts";
import { WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

const preSignoff = new Set<WorkItem["stage"]>(["IDEA", "R1", "R2", "DESIGN", "PLAN", "R3"]);

export const WorkItemContext = ({
  workItem,
  onCreateRemediation,
}: Readonly<{
  workItem: WorkItem;
  onCreateRemediation: (workItem: WorkItem) => void;
}>) => {
  const queryClient = useQueryClient();
  const [approvedBy, setApprovedBy] = useState("");
  const schemasQuery = useQuery({ queryKey: ["workItemSchemas"], queryFn: api.listWorkItemSchemas });
  const diagnosticsQuery = useQuery({ queryKey: ["workItemSourceDiagnostics"], queryFn: api.listWorkItemSourceDiagnostics });
  const runsQuery = useQuery({
    queryKey: ["runs", workItem.id],
    queryFn: () => api.listRuns(workItem.id),
    refetchInterval: (query) => query.state.data?.some(runIsActive) === true ? 1000 : false,
  });
  const activeRun = (runsQuery.data ?? []).find((run) => run.role === "STAGE" && runIsActive(run)) ?? null;
  const packageQuery = useQuery({
    queryKey: ["signoffPackage", workItem.id],
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF" && workItem.status === "ACTIVE",
  });

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workItems"] }),
      queryClient.invalidateQueries({ queryKey: ["runs", workItem.id] }),
      queryClient.invalidateQueries({ queryKey: ["runEvents"] }),
      queryClient.invalidateQueries({ queryKey: ["lifecycleArtifacts", workItem.id] }),
      queryClient.invalidateQueries({ queryKey: ["tasks", workItem.id] }),
      queryClient.invalidateQueries({ queryKey: ["signoffPackage", workItem.id] }),
    ]);
  };

  const start = useMutation({ mutationFn: () => api.startInteractiveRun(workItem.id), onSuccess: invalidate });
  const resume = useMutation({ mutationFn: () => api.resumeWorkItem(workItem.id), onSuccess: invalidate });
  const tick = useMutation({ mutationFn: api.tick, onSuccess: invalidate });
  const cancel = useMutation({
    mutationFn: () => activeRun ? api.cancelRun(activeRun.id) : Promise.reject(new TypeError("active run required")),
    onSuccess: invalidate,
  });
  const signoff = useMutation({
    mutationFn: () => {
      if (!packageQuery.data) throw new TypeError("current sign-off package is unavailable");
      return api.signOffWorkItem(workItem.id, packageQuery.data.packageHash, approvedBy.trim());
    },
    onSuccess: invalidate,
  });

  const diagnostics = (diagnosticsQuery.data ?? []).filter(
    (item) => item.workItemId === workItem.id || item.path === workItem.sourcePath,
  );
  const kind = schemasQuery.data?.find((schema) => schema.schemaId === workItem.schemaId)?.kind ?? workItem.schemaId;
  const canStart = workItem.status === "ACTIVE" && preSignoff.has(workItem.stage) && activeRun === null;
  const actionError = start.error ?? resume.error ?? tick.error ?? cancel.error ?? signoff.error;

  return (
    <div className="order-context-panel">
      <div className="order-context-heading"><strong>{workItem.title}</strong><span>{workItem.repositoryRoot}</span></div>
      <dl className="order-context-details">
        <div><dt>Stage</dt><dd>{workItem.stage}</dd></div>
        <div><dt>Status</dt><dd>{workItem.status}</dd></div>
        <div><dt>Outcome</dt><dd>{workItem.outcome ?? "—"}</dd></div>
        <div><dt>Project</dt><dd>{workItem.projectId}</dd></div>
        <div><dt>Kind</dt><dd>{kind}</dd></div>
        <div><dt>Schema</dt><dd>{workItem.schemaId}</dd></div>
        <div><dt>Concerns</dt><dd>{workItem.concernIds.join(", ") || "—"}</dd></div>
      </dl>

      <div className="order-context-section">
        <strong>Source</strong>
        <code>{workItem.sourcePath}</code>
        {diagnostics.length > 0
          ? <span className="order-warning-text">{diagnostics.length} source diagnostic{diagnostics.length === 1 ? "" : "s"}</span>
          : <span>Current</span>}
      </div>

      <div className="order-context-actions">
        {canStart ? (
          <WorkbenchAction
            label={"Start " + (workItem.stage === "IDEA" ? "R1" : workItem.stage) + " run"}
            tone="primary"
            loading={start.isPending}
            onClick={() => start.mutate()}
          />
        ) : null}
        {workItem.status === "BLOCKED" ? <WorkbenchAction label="Resume resolved blocker" tone="primary" loading={resume.isPending} onClick={() => resume.mutate()} /> : null}
        {workItem.stage === "EXECUTION" && workItem.status === "ACTIVE" ? <WorkbenchAction label="Run coordinator tick" tone="primary" loading={tick.isPending} onClick={() => tick.mutate()} /> : null}
        {activeRun ? <WorkbenchAction label="Cancel active run" tone="destructive" loading={cancel.isPending} onClick={() => cancel.mutate()} /> : null}
        {workItem.stage === "COMPLETE" && (workItem.outcome === "INVESTIGATION_COMPLETE" || workItem.outcome === "AUDIT_COMPLETE")
          ? <WorkbenchAction label="Create linked remediation" tone="primary" onClick={() => onCreateRemediation(workItem)} />
          : null}
        {workItem.stage === "AWAITING_SIGNOFF" ? (
          <div className="order-signoff-action">
            {packageQuery.data ? <code>{packageQuery.data.packageHash}</code> : <span>Resolving exact package…</span>}
            <label className="order-field">
              <span>Approved by</span>
              <input value={approvedBy} onChange={(event) => setApprovedBy(event.currentTarget.value)} placeholder="Local operator identity" />
            </label>
            <WorkbenchAction
              label="Sign off exact package"
              tone="primary"
              loading={signoff.isPending}
              disabled={!packageQuery.data || approvedBy.trim().length === 0}
              onClick={() => signoff.mutate()}
            />
          </div>
        ) : null}
      </div>

      {actionError ? <WorkbenchErrorState title="Action failed" description={actionError instanceof Error ? actionError.message : String(actionError)} /> : null}
    </div>
  );
};
