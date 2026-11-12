import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Badge } from "@astryxdesign/core/Badge";
import { Drawer } from "@astryxdesign/core/Drawer";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

import {
  WorkItemIdSchema,
  type ProjectManifest,
  type WorkItem,
  type WorkItemId,
  type WorkItemSchemaId,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { workbenchQueryKeys } from "./query-keys.ts";

import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchLayout } from "./primitives/WorkbenchLayout.tsx";
import {
  WorkbenchToolbar,
  WorkbenchToolbarGroup,
  WorkbenchToolbarSearch,
} from "./primitives/WorkbenchToolbar.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";

const CreateWorkItem = lazy(() =>
  import("./CreateWorkItem.tsx").then((module) => ({ default: module.CreateWorkItem })));
const WorkItemContext = lazy(() =>
  import("./WorkItemContext.tsx").then((module) => ({ default: module.WorkItemContext })));
const WorkItemWorkspace = lazy(() =>
  import("./WorkItemWorkspace.tsx").then((module) => ({ default: module.WorkItemWorkspace })));

const WorkItemQueue = lazy(() =>
  import("./WorkItemQueue.tsx").then((module) => ({ default: module.WorkItemQueue })));

type ThemePreference = "system" | "light" | "dark";
const themeStorageKey = "pontivus-order-theme";

const savedThemePreference = (): ThemePreference => {
  try {
    const value = window.localStorage.getItem(themeStorageKey);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
};

const firstProjectId = (
  projects: readonly ProjectManifest[] | undefined,
): string => projects?.[0]?.projectId ?? "";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const selectedIdFromUrl = (): WorkItemId | null => {
  const parsed = WorkItemIdSchema.safeParse(
    new URL(window.location.href).searchParams.get("workItem"),
  );
  return parsed.success ? parsed.data : null;
};

const updateSelectedUrl = (
  id: WorkItemId | null,
  mode: "push" | "replace" = "push",
): void => {
  const url = new URL(window.location.href);
  if (id === null) url.searchParams.delete("workItem");
  else url.searchParams.set("workItem", id);
  if (mode === "replace") window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
};

export const App = () => {
  const queryClient = useQueryClient();
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<WorkItemId | null>(selectedIdFromUrl);
  const [search, setSearch] = useState("");
  const [themePreference, setThemePreference] = useState<ThemePreference>(savedThemePreference);
  const [createOpen, setCreateOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [schemaId, setSchemaId] = useState<WorkItemSchemaId | "">("");
  const [title, setTitle] = useState("");
  const [concernIds, setConcernIds] = useState<readonly string[]>([]);
  const [derivedFromWorkItemId, setDerivedFromWorkItemId] = useState<WorkItemId | null>(null);
  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<WorkItemId | null | undefined>(undefined);
  const originatingRowId = useRef<WorkItemId | null>(null);

  const workItemsQuery = useQuery({ queryKey: workbenchQueryKeys.workItems, queryFn: api.listWorkItems });
  const projectsQuery = useQuery({ queryKey: workbenchQueryKeys.projects, queryFn: api.listProjects });
  const schemasQuery = useQuery({ queryKey: workbenchQueryKeys.workItemSchemas, queryFn: api.listWorkItemSchemas });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });
  const refresh = useMutation({
    mutationFn: api.reconcileWorkItemSources,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSourceDiagnostics }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSourceRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifactsRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackageRoot }),
      ]);
    },
  });

  const workItems = workItemsQuery.data ?? [];
  const selectedWorkItem =
    workItems.find((item) => item.id === selectedWorkItemId) ?? null;

  useEffect(() => {
    if (projectId.length === 0 && projectsQuery.data?.length) {
      setProjectId(firstProjectId(projectsQuery.data));
    }
  }, [projectId, projectsQuery.data]);

  useEffect(() => {
    if (derivedFromWorkItemId === null && schemaId === "" && schemasQuery.data?.[0]) {
      setSchemaId(schemasQuery.data[0].schemaId);
    }
  }, [derivedFromWorkItemId, schemaId, schemasQuery.data]);

  useEffect(() => {
    const onPopState = (): void => {
      const next = selectedIdFromUrl();
      if (workspaceDirty) {
        updateSelectedUrl(selectedWorkItemId, "replace");
        setPendingSelection(next);
      } else {
        setSelectedWorkItemId(next);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectedWorkItemId, workspaceDirty]);

  useEffect(() => {
    if (
      selectedWorkItemId !== null &&
      selectedWorkItem === null &&
      !workItemsQuery.isPending
    ) {
      setSelectedWorkItemId(null);
      updateSelectedUrl(null, "replace");
    }
  }, [selectedWorkItem, selectedWorkItemId, workItemsQuery.isPending]);

  const selectedProject =
    (projectsQuery.data ?? []).find((project) => project.projectId === projectId) ?? null;
  const availableConcernIds = Object.keys(selectedProject?.concerns ?? {}).sort();

  useEffect(() => {
    setConcernIds((current) =>
      current.filter((id) => availableConcernIds.includes(id)));
  }, [projectId, availableConcernIds.join("\0")]);

  const commitSelection = (id: WorkItemId | null): void => {
    const returningFrom = id === null ? selectedWorkItemId : null;
    if (id !== null) originatingRowId.current = id;
    setSelectedWorkItemId(id);
    setWorkspaceDirty(false);
    setContextOpen(false);
    updateSelectedUrl(id);
    if (id === null) {
      window.requestAnimationFrame(() => {
        const targetId = returningFrom ?? originatingRowId.current;
        const row = targetId === null
          ? null
          : document.querySelector<HTMLElement>('[data-testid="work-item-row-' + targetId + '"]');
        (row ?? document.querySelector<HTMLElement>('[aria-label="Search work items"]'))?.focus();
      });
    }
  };

  const requestSelection = (id: WorkItemId | null): void => {
    if (workspaceDirty) setPendingSelection(id);
    else commitSelection(id);
  };

  const resetCreate = (): void => {
    setTitle("");
    setConcernIds([]);
    setDerivedFromWorkItemId(null);
  };

  const create = useMutation({
    mutationFn: () => {
      if (schemaId === "") throw new TypeError("WorkItem schema selection required");
      return api.createWorkItem({
        projectId,
        schemaId,
        title: title.trim(),
        concernIds,
        ...(derivedFromWorkItemId === null ? {} : { derivedFromWorkItemId }),
      });
    },
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSourceDiagnostics }),
      ]);
      resetCreate();
      setCreateOpen(false);
      commitSelection(created.id);
    },
  });

  const startRemediation = (workItem: WorkItem): void => {
    setProjectId(workItem.projectId);
    setDerivedFromWorkItemId(workItem.id);
    setSchemaId("");
    setConcernIds(workItem.concernIds);
    setTitle("");
    setCreateOpen(true);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return workItems;
    return workItems.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.projectId.toLowerCase().includes(query) ||
      item.stage.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.concernIds.some((id) => id.toLowerCase().includes(query)));
  }, [search, workItems]);

  const selectTheme = (value: string): void => {
    if (value !== "system" && value !== "light" && value !== "dark") return;
    setThemePreference(value);
    try {
      if (value === "system") window.localStorage.removeItem(themeStorageKey);
      else window.localStorage.setItem(themeStorageKey, value);
    } catch {
      // Theme persistence is a browser convenience; the selected mode remains live.
    }
  };

  const toolbar = (
    <WorkbenchToolbar
      start={
        <WorkbenchToolbarGroup>
          <div className="order-brand">
            <strong>Order</strong>
            <span>Governed work queue</span>
          </div>
          <WorkbenchAction
            label="New work item"
            icon={<WorkbenchIcon name="add" />}
            onClick={() => {
              resetCreate();
              setCreateOpen(true);
            }}
          />
          <WorkbenchAction
            label={refresh.isPending ? "Refreshing…" : "Refresh sources"}
            icon={<WorkbenchIcon name="refresh" />}
            loading={refresh.isPending}
            onClick={() => refresh.mutate()}
          />
        </WorkbenchToolbarGroup>
      }
      end={
        <>
          <WorkbenchToolbarSearch
            aria-label="Search work items"
            placeholder="Search work items"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <SegmentedControl
            label="Theme"
            value={themePreference}
            onChange={selectTheme}
            size="sm"
          >
            <SegmentedControlItem value="system" label="System" icon={<WorkbenchIcon name="system" />} />
            <SegmentedControlItem value="light" label="Light" icon={<WorkbenchIcon name="light" />} />
            <SegmentedControlItem value="dark" label="Dark" icon={<WorkbenchIcon name="dark" />} />
          </SegmentedControl>
        </>
      }
    />
  );

  const queue = workItemsQuery.isPending ? (
    <WorkbenchEmptyState title="Loading work items…" />
  ) : filtered.length === 0 ? (
    <WorkbenchEmptyState
      title={search.trim().length > 0 ? "No matching work items" : "No work items"}
      description="Create a WorkItem source to begin governed progression."
    />
  ) : (
    <Suspense fallback={<WorkbenchEmptyState compact title="Loading work queue…" />}>
      <WorkItemQueue
        workItems={filtered}
        schemas={schemasQuery.data ?? []}
        selectedWorkItemId={selectedWorkItemId}
        onSelect={requestSelection}
      />
    </Suspense>
  );

  const main = selectedWorkItem ? (
    <Suspense fallback={<WorkbenchEmptyState title="Loading work item workspace…" />}>
      <WorkItemWorkspace
        key={selectedWorkItem.id}
        workItem={selectedWorkItem}
        onBack={() => requestSelection(null)}
        onOpenContext={() => setContextOpen(true)}
        onDirtyChange={setWorkspaceDirty}
      />
    </Suspense>
  ) : (
    <div className="order-queue-page">
      {(diagnosticsQuery.data ?? []).length > 0 ? (
        <section className="order-diagnostics" data-testid="source-diagnostics">
          <h2>Source diagnostics</h2>
          {(diagnosticsQuery.data ?? []).map((item, index) => (
            <div key={item.code + "-" + (item.path ?? String(index))} role="alert">
              <strong>{item.code}</strong>
              <span>{item.path ?? item.workItemId ?? "unmaterialized source"}</span>
              <span>{item.detail}</span>
            </div>
          ))}
        </section>
      ) : null}
      {queue}
    </div>
  );

  const body = workItemsQuery.isError ? (
    <WorkbenchLayout toolbar={toolbar}>
      <WorkbenchErrorState
        title="Local browser session required"
        description={
          errorText(workItemsQuery.error).includes("browser session required")
            ? "Run order open and open the one-time URL to establish the local session."
            : errorText(workItemsQuery.error)
        }
        action={<WorkbenchAction label="Retry" onClick={() => void workItemsQuery.refetch()} />}
      />
    </WorkbenchLayout>
  ) : (
    <WorkbenchLayout
      toolbar={toolbar}
      inspector={
        selectedWorkItem
          ? (
            <Suspense fallback={<WorkbenchEmptyState compact title="Loading context…" />}>
              <WorkItemContext workItem={selectedWorkItem} onCreateRemediation={startRemediation} />
            </Suspense>
          )
          : null
      }
      inspectorOpen={contextOpen}
      onInspectorOpenChange={setContextOpen}
    >
      {main}
    </WorkbenchLayout>
  );

  return (
    <Theme theme={neutralTheme} mode={themePreference}>
      {body}

      <Drawer
        isOpen={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreate();
        }}
        label={derivedFromWorkItemId === null ? "Create work item" : "Create linked remediation"}
        side="end"
        width="26rem"
      >
        <div className="order-create-drawer">
          <h2>{derivedFromWorkItemId === null ? "Create work item" : "Create linked remediation"}</h2>
          <Suspense fallback={<WorkbenchEmptyState compact title="Loading creation controls…" />}>
          <CreateWorkItem
            projects={projectsQuery.data ?? []}
            schemas={schemasQuery.data ?? []}
            projectId={projectId}
            schemaId={schemaId}
            title={title}
            concernIds={concernIds}
            availableConcernIds={availableConcernIds}
            derivedFromWorkItemId={derivedFromWorkItemId}
            pending={create.isPending}
            error={create.error ? errorText(create.error) : null}
            onProjectChange={setProjectId}
            onSchemaChange={setSchemaId}
            onTitleChange={setTitle}
            onConcernIdsChange={setConcernIds}
            onSubmit={() => create.mutate()}
          />
          </Suspense>
        </div>
      </Drawer>

      <AlertDialog
        isOpen={pendingSelection !== undefined}
        onOpenChange={(open) => { if (!open) setPendingSelection(undefined); }}
        title="Discard unsaved Markdown?"
        description="Leaving this WorkItem would discard the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingSelection;
          setPendingSelection(undefined);
          if (next !== undefined) commitSelection(next);
        }}
      />
    </Theme>
  );
};
