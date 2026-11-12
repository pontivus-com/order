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
}>) => (
  <div className="order-queue" data-testid="work-item-queue">
    <Table aria-label="Work items" density="compact" dividers="rows">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Work item</TableHeaderCell>
          <TableHeaderCell>Kind</TableHeaderCell>
          <TableHeaderCell>Stage</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Concerns</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workItems.map((item) => (
          <TableRow
            key={item.id}
            tabIndex={0}
            data-testid={"work-item-row-" + item.id}
            aria-selected={item.id === selectedWorkItemId}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
          >
            <TableCell>
              <div className="order-queue-title">
                <strong>{item.title}</strong>
                <span>{item.projectId}</span>
              </div>
            </TableCell>
            <TableCell>
              {schemas.find((schema) => schema.schemaId === item.schemaId)?.kind ?? item.schemaId}
            </TableCell>
            <TableCell>{item.stage}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{item.concernIds.join(", ") || "—"}</TableCell>
            <TableCell>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
