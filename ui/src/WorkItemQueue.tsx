import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@astryxdesign/core/Table";

import type {
  WorkItem,
  WorkItemId,
  WorkItemSchemaCatalogEntry,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";

export const WorkItemQueue = ({
  workItems,
  schemas,
  selectedWorkItemId,
  onSelect,
}: Readonly<{
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
    mutationFn: (workItem: WorkItem) => api.setWorkItemArchived(workItem.id, {
      expectedArchived: true,
      archived: false,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems });
    },
  });
  const visibleItems = showArchived ? archivedQuery.data ?? workItems : workItems;

  return (
    <div className="order-queue" data-testid="work-item-queue">
      <div className="order-queue-actions">
        <WorkbenchAction
          label={showArchived ? "Hide archived" : "Show archived"}
          onClick={() => setShowArchived((value) => !value)}
        />
        {restore.error ? (
          <span className="order-error-text" role="alert">
            {restore.error instanceof Error ? restore.error.message : String(restore.error)}
          </span>
        ) : null}
      </div>
      <Table aria-label="Work items" density="compact" dividers="rows">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Work item</TableHeaderCell>
            <TableHeaderCell className="order-queue-secondary-column">Kind</TableHeaderCell>
            <TableHeaderCell className="order-queue-stage-column">Stage</TableHeaderCell>
            <TableHeaderCell className="order-queue-status-column">Status</TableHeaderCell>
            <TableHeaderCell className="order-queue-secondary-column">Concerns</TableHeaderCell>
            <TableHeaderCell> </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleItems.map((item) => (
            <TableRow
              key={item.id}
              tabIndex={item.archived ? -1 : 0}
              data-testid={"work-item-row-" + item.id}
              aria-selected={item.id === selectedWorkItemId}
              onClick={() => {
                if (!item.archived) onSelect(item.id);
              }}
              onKeyDown={(event) => {
                if (!item.archived && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onSelect(item.id);
                }
              }}
            >
              <TableCell>
                <div className="order-queue-title">
                  <strong>{item.title}</strong>
                  <span>{item.projectId}{item.archived ? " · Archived" : ""}</span>
                  <span className="order-queue-mobile-meta">
                    {(schemas.find((schema) => schema.schemaId === item.schemaId)?.kind ?? item.schemaId) +
                      " · " + item.stage + " · " + item.status}
                  </span>
                  <span className="order-queue-mobile-concerns">
                    {item.concernIds.join(", ") || "No concerns"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="order-queue-secondary-column">
                {schemas.find((schema) => schema.schemaId === item.schemaId)?.kind ?? item.schemaId}
              </TableCell>
              <TableCell className="order-queue-stage-column">{item.stage}</TableCell>
              <TableCell className="order-queue-status-column">{item.status}</TableCell>
              <TableCell className="order-queue-secondary-column">{item.concernIds.join(", ") || "—"}</TableCell>
              <TableCell>
                <div className="order-inline-actions">
                  {item.archived ? (
                    <WorkbenchAction
                      label={"Restore " + item.title}
                      tone="ghost"
                      loading={restore.isPending}
                      onClick={(event) => {
                        event.stopPropagation();
                        restore.mutate(item);
                      }}
                    />
                  ) : null}
                  <WorkbenchAction
                    label={"Copy work item id for " + item.title}
                    tone="ghost"
                    icon={<WorkbenchIcon name="copy" />}
                    iconOnly
                    onClick={(event) => {
                      event.stopPropagation();
                      void navigator.clipboard?.writeText(item.id);
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
