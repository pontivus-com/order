import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { WorkItem, WorkItemId, WorkItemSchemaCatalogEntry } from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";
import { workflowPresentation } from "./workbench-presentation.ts";

export const WorkItemQueue = ({ workItems, schemas, selectedWorkItemId, onSelect }: Readonly<{
  workItems: readonly WorkItem[];
  schemas: readonly WorkItemSchemaCatalogEntry[];
  selectedWorkItemId: WorkItemId | null;
  onSelect: (id: WorkItemId) => void;
}>) => {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const archivedQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemsIncludingArchived,
    queryFn: api.listWorkItemsIncludingArchived,
    enabled: showArchived,
  });
  const restore = useMutation({
    mutationFn: (workItem: WorkItem) => api.setWorkItemArchived(workItem.id, { expectedArchived: true, archived: false }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }); },
  });
  const visibleItems = showArchived ? archivedQuery.data ?? workItems : workItems;

  return (
    <section className="order-queue" data-testid="work-item-queue">
      <WorkbenchSectionHeader
        title="Work items"
        description={showArchived ? "Active and archived governed work." : "Active governed work."}
        action={<WorkbenchAction label={showArchived ? "Hide archived" : "Show archived"} onClick={() => setShowArchived((value) => !value)} />}
      />
      {restore.error ? <WorkbenchNotice tone="danger" title="Restore failed" description={restore.error instanceof Error ? restore.error.message : String(restore.error)} /> : null}
      <WorkbenchTable
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
        rows={visibleItems.map((item) => {
          const kind = schemas.find((schema) => schema.schemaId === item.schemaId)?.kind ?? item.schemaId;
          return {
            id: item.id,
            testId: "work-item-row-" + item.id,
            selected: item.id === selectedWorkItemId,
            disabled: item.archived,
            onSelect: item.archived ? undefined : () => onSelect(item.id),
            cells: {
              workItem: <div className="order-queue-title"><strong>{item.title}</strong><span>{item.projectId}{item.archived ? " · Archived" : ""}</span></div>,
              kind,
              stage: workflowPresentation(item.stage).label,
              status: <WorkbenchStatus tone={item.status === "ACTIVE" ? "info" : "neutral"} label={item.status === "ACTIVE" ? "Active" : item.status.toLowerCase()} />,
              concerns: item.concernIds.join(", ") || "—",
              actions: <div className="order-inline-actions">
                {item.archived ? <WorkbenchAction label={"Restore " + item.title} tone="ghost" loading={restore.isPending} onClick={(event) => { event.stopPropagation(); restore.mutate(item); }} /> : null}
                <WorkbenchAction label={"Copy work item id for " + item.title} tone="ghost" icon={<WorkbenchIcon name="copy" />} iconOnly onClick={(event) => { event.stopPropagation(); void navigator.clipboard?.writeText(item.id); }} />
              </div>,
            },
          };
        })}
      />
    </section>
  );
};
