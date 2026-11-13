import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { workflowPresentation } from "./workbench-presentation.ts";
import { WorkbenchErrorState } from "./primitives/WorkbenchState.tsx";

export const WorkItemContext = ({
  workItem,
  onCreateRemediation,
}: Readonly<{
  workItem: WorkItem;
  onCreateRemediation: (workItem: WorkItem) => void;
}>) => {
  const queryClient = useQueryClient();
  const [approvedBy, setApprovedBy] = useState("");
  const schemasQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSchemas,
    queryFn: api.listWorkItemSchemas,
  });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });
  const documentationGitQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemDocumentationGitStatus(workItem.id),
    queryFn: () => api.getWorkItemDocumentationGitStatus(workItem.id),
  });
  const packageQuery = useQuery({
    queryKey: workbenchQueryKeys.signoffPackage(workItem.id),
    queryFn: () => api.getSignoffPackage(workItem.id),
    enabled: workItem.stage === "AWAITING_SIGNOFF" && workItem.status === "ACTIVE",
  });

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runs(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.runEventsRoot }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifacts(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.tasks(workItem.id) }),
      queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackage(workItem.id) }),
    ]);
  };

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
  const kind =
    schemasQuery.data?.find((schema) => schema.schemaId === workItem.schemaId)?.kind ??
    workItem.schemaId;
  const workflow = workflowPresentation(workItem.stage);

  return (
    <div className="order-context-panel">
      <div className="order-context-heading">
        <strong>{workItem.title}</strong>
        <span>{workItem.repositoryRoot}</span>
      </div>

      <div className="order-context-section" data-testid="context-workflow-summary">
        <strong>{workflow.label}</strong>
        <span>{workflow.purpose}</span>
        <span>{workItem.status === "ACTIVE" ? "Active" : workItem.status.toLowerCase()}</span>
      </div>

      <div className="order-context-section">
        <strong>Source</strong>
        <code>{workItem.sourcePath}</code>
        {diagnostics.length > 0
          ? <span className="order-warning-text">{diagnostics.length} source issue{diagnostics.length === 1 ? "" : "s"} require attention</span>
          : <span>Current</span>}
        {documentationGitQuery.data ? (
          <span data-testid="context-documentation-git-state">
            {documentationGitQuery.data.paths.every((path) => path.state === "MATCHES_HEAD")
              ? "Saved to Git"
              : "Not saved to Git"}
          </span>
        ) : null}
      </div>

      <details className="order-technical-details order-context-technical-details">
        <summary>Technical details</summary>
        <dl className="order-context-details">
          <div><dt>Stage</dt><dd><code>{workItem.stage}</code></dd></div>
          <div><dt>Status</dt><dd><code>{workItem.status}</code></dd></div>
          <div><dt>Outcome</dt><dd><code>{workItem.outcome ?? "—"}</code></dd></div>
          <div><dt>Project</dt><dd>{workItem.projectId}</dd></div>
          <div><dt>Kind</dt><dd>{kind}</dd></div>
          <div><dt>Schema</dt><dd>{workItem.schemaId}</dd></div>
          <div><dt>Concerns</dt><dd>{workItem.concernIds.join(", ") || "—"}</dd></div>
        </dl>
      </details>

      <div className="order-context-actions">
        {workItem.stage === "COMPLETE" && (
          workItem.outcome === "INVESTIGATION_COMPLETE" ||
          workItem.outcome === "AUDIT_COMPLETE"
        ) ? (
          <WorkbenchAction
            label="Create linked remediation"
            tone="primary"
            onClick={() => onCreateRemediation(workItem)}
          />
        ) : null}

        {workItem.stage === "AWAITING_SIGNOFF" ? (
          <div className="order-signoff-action">
            {packageQuery.data
              ? <code>{packageQuery.data.packageHash}</code>
              : <span>Resolving exact package…</span>}
            <label className="order-field">
              <span>Approved by</span>
              <input
                value={approvedBy}
                onChange={(event) => setApprovedBy(event.currentTarget.value)}
                placeholder="Local operator identity"
              />
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

      {signoff.error ? (
        <WorkbenchErrorState
          title="Approval failed"
          description={signoff.error instanceof Error ? signoff.error.message : String(signoff.error)}
        />
      ) : null}
    </div>
  );
};
