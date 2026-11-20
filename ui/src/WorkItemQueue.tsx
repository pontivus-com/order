import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { WorkItem, WorkItemId, WorkItemSchemaCatalogEntry } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { invalidateWorkbenchMutation, workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";
import { workflowPresentation } from "./workbench-presentation.ts";

export const WorkItemQueue = ({
  workItems,
  schemas,
  selectedWorkItemId,
  showArchived,
  emptyTitle,
  onShowArchivedChange,
  onSelect,
}: Readonly<{
  workItems: readonly WorkItem[];
  schemas: readonly WorkItemSchemaCatalogEntry[];
  selectedWorkItemId: WorkItemId | null;
  showArchived: boolean;
  emptyTitle: string;
  onShowArchivedChange: (value: boolean) => void;
  onSelect: (id: WorkItemId) => void;
}>) => {
  const queryClient = useQueryClient();
  const restore = useMutation({
    mutationFn: (workItem: WorkItem) => api.setWorkItemArchived(workItem.id, { expectedArchived: true, archived: false }),
    onSuccess: async (updated) => {
      await Promise.all([
        invalidateWorkbenchMutation(queryClient, updated.id),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemsIncludingArchived }),
      ]);
    },
    onError: async (_error, workItem) => {
      await Promise.all([
        invalidateWorkbenchMutation(queryClient, workItem.id),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemsIncludingArchived }),
      ]);
    },
  });
  return (
    <div data-testid="work-item-queue">
      <WorkbenchSurface
        attention={
          <WorkbenchSectionHeader
            title="Work items"
            description={showArchived ? "Active and archived governed work." : "Active governed work."}
            action={<WorkbenchAction label={showArchived ? "Hide archived" : "Show archived"} onClick={() => onShowArchivedChange(!showArchived)} />}
          />
        }
        material={<>
          {restore.error ? <WorkbenchNotice tone="danger" title="Restore failed" description={restore.error instanceof Error ? restore.error.message : String(restore.error)} /> : null}
          {workItems.length === 0 ? (
            <WorkbenchEmptyState
              compact
              title={emptyTitle}
              description="Create a WorkItem source to begin governed progression."
            />
          ) : <WorkbenchTable
        label="Work items"
        selection="single"
        columns={[
          { key: "workItem", label: "Work item" },
          { key: "kind", label: "Kind" },
          { key: "stage", label: "Stage" },
          { key: "status", label: "Status" },
          { key: "concerns", label: "Concerns" },
          { key: "actions", label: "" },
        ]}
        rows={workItems.map((item) => {
          const kind = schemas.find((schema) => schema.schemaId === item.schemaId)?.kind ?? item.schemaId;
          return {
            id: item.id,
            testId: "work-item-row-" + item.id,
            selected: item.id === selectedWorkItemId,
            onSelect: item.archived ? undefined : () => onSelect(item.id),
            cells: {
              workItem: <div className="order-queue-title"><strong>{item.title}</strong><span>{item.projectId}{item.archived ? " · Archived" : ""}</span></div>,
              kind,
              stage: workflowPresentation(item.stage).label,
              status: <WorkbenchStatus tone={item.status === "ACTIVE" ? "info" : "neutral"} label={item.status === "ACTIVE" ? "Active" : item.status.toLowerCase()} />,
              concerns: item.concernIds.join(", ") || "—",
              actions: item.archived ? (
                <div className="order-inline-actions">
                  <WorkbenchAction label={"Restore " + item.title} tone="ghost" loading={restore.isPending} onClick={(event) => { event.stopPropagation(); restore.mutate(item); }} />
                </div>
              ) : null,
            },
          };
        })}
          />}
        </>}
      />
    </div>
  );
};
