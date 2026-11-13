import { useQuery } from "@tanstack/react-query";

import type { Run, Sha256, WorkItem } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  runRoleLabel,
  runStatusLabel,
  workItemModeLabel,
  type WorkItemMode,
} from "./workbench-presentation.ts";

export const WorkItemContext = ({
  workItem,
  mode,
  selectedRunId,
  selectedDocumentPath,
  selectedDocumentSha256,
}: Readonly<{
  workItem: WorkItem;
  mode: WorkItemMode;
  selectedRunId: Run["id"] | null;
  selectedDocumentPath: string | null;
  selectedDocumentSha256: Sha256 | null;
}>) => {
  const schemasQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSchemas,
    queryFn: api.listWorkItemSchemas,
  });
  const runsQuery = useQuery({
    queryKey: workbenchQueryKeys.runs(workItem.id),
    queryFn: () => api.listRuns(workItem.id),
    enabled: mode === "ACTIVITY",
  });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });
  const diagnostics = (diagnosticsQuery.data ?? []).filter(
    (item) => item.workItemId === workItem.id || item.path === workItem.sourcePath,
  );
  const kind =
    schemasQuery.data?.find((schema) => schema.schemaId === workItem.schemaId)?.kind ??
    workItem.schemaId;
  const selectedRun =
    (runsQuery.data ?? []).find((run) => run.id === selectedRunId) ?? null;
  return (
    <div className="order-context-panel">
      <div className="order-context-heading">
        <strong>Technical context</strong>
        <span>Inspection details for the selected WorkItem workspace.</span>
      </div>

      <div className="order-context-section" data-testid="selected-view-context">
        <strong>{workItemModeLabel(mode)} details</strong>
        {mode === "DOCUMENTS" ? (
          <>
            <span>Selected document</span>
            <code>{selectedDocumentPath ?? workItem.sourcePath}</code>
            <span>Exact SHA</span>
            <code>{selectedDocumentSha256 ?? "Resolving…"}</code>
          </>
        ) : mode === "ACTIVITY" && selectedRun ? (
          <>
            <span>{runRoleLabel(selectedRun.role)} · {runStatusLabel(selectedRun.status)}</span>
            <code>{selectedRun.id}</code>
            <span>Attempt {selectedRun.attempt}</span>
            <span>{new Date(selectedRun.startedAt).toLocaleString()}</span>
          </>
        ) : (
          <span>Technical inspection for the selected {workItemModeLabel(mode).toLowerCase()} view.</span>
        )}
        {diagnostics.length > 0 ? (
          <span className="order-warning-text">
            {diagnostics.length} source issue{diagnostics.length === 1 ? "" : "s"} require attention
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

    </div>
  );
};
