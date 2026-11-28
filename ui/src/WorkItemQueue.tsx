import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@astryxdesign/core/TextInput";

import type {
  WorkItem,
  WorkItemId,
  WorkItemSchemaCatalogEntry,
  WorkItemSourceDiagnostic,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import {
  invalidateWorkbenchMutation,
  workbenchQueryKeys,
} from "./query-keys.ts";
import {
  workOutcomeProductLabel,
  workflowPresentation,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchEmptyState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchSurface } from "./primitives/WorkbenchSurface.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";

const humanKindLabel = (
  kind: WorkItemSchemaCatalogEntry["kind"] | undefined,
): string =>
  kind === undefined
    ? "Work item"
    : kind.charAt(0) + kind.slice(1).toLowerCase();

const statusLabel = (workItem: WorkItem): string => {
  if (workItem.stage === "COMPLETE") {
    return workOutcomeProductLabel(workItem.outcome);
  }
  return workItem.status === "BLOCKED" ? "Blocked" : "Active";
};

export const WorkItemQueue = ({
  workItems,
  schemas,
  selectedWorkItemId,
  showArchived,
  emptyTitle,
  search,
  sourceDiagnostics,
  refreshPending,
  loading,
  onShowArchivedChange,
  onSearchChange,
  onRefresh,
  onCreate,
  onSelect,
}: Readonly<{
  workItems: readonly WorkItem[];
  schemas: readonly WorkItemSchemaCatalogEntry[];
  selectedWorkItemId: WorkItemId | null;
  showArchived: boolean;
  emptyTitle: string;
  search: string;
  sourceDiagnostics: readonly WorkItemSourceDiagnostic[];
  refreshPending: boolean;
  loading: boolean;
  onShowArchivedChange: (value: boolean) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onSelect: (id: WorkItemId) => void;
}>) => {
  const queryClient = useQueryClient();
  const restore = useMutation({
    mutationFn: (workItem: WorkItem) =>
      api.setWorkItemArchived(workItem.id, {
        expectedArchived: true,
        archived: false,
      }),
    onSuccess: async (updated) => {
      await Promise.all([
        invalidateWorkbenchMutation(queryClient, updated.id),
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.workItemsIncludingArchived,
        }),
      ]);
    },
    onError: async (_error, workItem) => {
      await Promise.all([
        invalidateWorkbenchMutation(queryClient, workItem.id),
        queryClient.invalidateQueries({
          queryKey: workbenchQueryKeys.workItemsIncludingArchived,
        }),
      ]);
    },
  });

  const rows = workItems.map((item) => {
    const kind = humanKindLabel(
      schemas.find((schema) => schema.schemaId === item.schemaId)?.kind,
    );
    const selectable = !item.archived;

    return {
      id: item.id,
      testId: "work-item-row-" + item.id,
      selected: item.id === selectedWorkItemId,
      onSelect: selectable ? () => onSelect(item.id) : undefined,
      cells: {
        workItem: (
          <div className="order-queue-primary">
            <strong>{item.title}</strong>
            <div className="order-queue-primary-meta">
              <span>{item.projectId}</span>
              {item.archived ? (
                <WorkbenchStatus tone="neutral" label="Archived" />
              ) : null}
            </div>
          </div>
        ),
        kind,
        progress: (
          <div className="order-queue-progress">
            <span>{workflowPresentation(item.stage).label}</span>
            <WorkbenchStatus
              tone={
                item.status === "BLOCKED"
                  ? "warning"
                  : item.stage === "COMPLETE"
                    ? "neutral"
                    : "info"
              }
              label={statusLabel(item)}
            />
          </div>
        ),
        concerns: (
          <span className="order-queue-concerns">
            {item.concernIds.length === 0 ? "—" : item.concernIds.join(", ")}
          </span>
        ),
        action: item.archived ? (
          <WorkbenchAction
            label={"Restore " + item.title}
            tone="ghost"
            loading={restore.isPending}
            onClick={(event) => {
              event.stopPropagation();
              restore.mutate(item);
            }}
          />
        ) : null,
      },
    };
  });

  const emptyDescription =
    emptyTitle === "No matching work items"
      ? "Adjust the current search or project context."
      : "Create a WorkItem to begin governed progression.";

  return (
    <section className="order-queue-scan" data-testid="work-item-queue">
      <WorkbenchSurface
        material={
          <div className="order-queue-scan-content">
            <WorkbenchSectionHeader
              title="Work items"
              description={
                showArchived
                  ? "Active and archived governed work from repository-backed WorkItem sources."
                  : "Active governed work from repository-backed WorkItem sources."
              }
              action={
                <WorkbenchAction
                  label={showArchived ? "Hide archived" : "Show archived"}
                  onClick={() => onShowArchivedChange(!showArchived)}
                />
              }
            />
            <div className="order-queue-commandbar">
              <span className="order-inline-actions">
                <WorkbenchAction
                  label="New work item"
                  tone="primary"
                  icon={<WorkbenchIcon name="add" />}
                  onClick={onCreate}
                />
                <WorkbenchAction
                  label={refreshPending ? "Refreshing…" : "Refresh sources"}
                  icon={<WorkbenchIcon name="refresh" />}
                  loading={refreshPending}
                  onClick={onRefresh}
                />
              </span>
              <div className="order-queue-search" data-testid="workbench-search">
                <TextInput
                  label="Search work items"
                  isLabelHidden
                  type="search"
                  size="sm"
                  width="100%"
                  value={search}
                  onChange={onSearchChange}
                  placeholder="Search work items"
                  startIcon={<WorkbenchIcon name="search" />}
                />
              </div>
            </div>
            {sourceDiagnostics.length > 0 ? (
              <div className="order-app-notice-stack" data-testid="source-diagnostics">
                <WorkbenchNotice
                  tone="danger"
                  title="Source diagnostics require attention"
                  description={
                    <ul>
                      {sourceDiagnostics.map((item, index) => (
                        <li key={item.code + "-" + (item.path ?? String(index))}>
                          <strong>{item.path ?? item.projectId}</strong>
                          {" — "}
                          {item.detail}
                        </li>
                      ))}
                    </ul>
                  }
                />
              </div>
            ) : null}
            {restore.error ? (
              <WorkbenchNotice
                tone="danger"
                title="Restore failed"
                description={
                  restore.error instanceof Error
                    ? restore.error.message
                    : String(restore.error)
                }
              />
            ) : null}
            {loading ? (
              <WorkbenchEmptyState compact title="Loading work items…" />
            ) : rows.length === 0 ? (
              <WorkbenchEmptyState
                compact
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              <WorkbenchTable
                label="Work items"
                selection="single"
                columns={[
                  { key: "workItem", label: "Work item" },
                  { key: "kind", label: "Kind" },
                  { key: "progress", label: "Lifecycle" },
                  { key: "concerns", label: "Concerns" },
                  { key: "action", label: "" },
                ]}
                rows={rows}
              />
            )}
          </div>
        }
      />
    </section>
  );
};
