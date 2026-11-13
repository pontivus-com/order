import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Badge } from "@astryxdesign/core/Badge";
import { Drawer } from "@astryxdesign/core/Drawer";
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
import { OpenCodeAccountControl } from "./OpenCodeAccountControl.tsx";
import type { SettingsSection } from "./SettingsWorkspace.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";

import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchIcon } from "./primitives/WorkbenchIcon.tsx";
import { WorkbenchLayout, useWideWorkbench } from "./primitives/WorkbenchLayout.tsx";
import {
  WorkbenchToolbar,
  WorkbenchToolbarGroup,
  WorkbenchToolbarSearch,
  WorkbenchToolbarUtilities,
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
const SettingsWorkspace = lazy(() =>
  import("./SettingsWorkspace.tsx").then((module) => ({ default: module.SettingsWorkspace })));

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

const settingsSectionForBlocker = (blocker: string | undefined): SettingsSection =>
  blocker === "OPENCODE_ACCOUNT_REQUIRED"
    ? "opencode"
    : blocker === "MODEL_INVALID"
      ? "model"
      : "repositories";

const settingsSectionFromUrl = (): SettingsSection | null => {
  const path = new URL(window.location.href).pathname;
  if (path === "/settings/repositories") return "repositories";
  if (path === "/settings/opencode") return "opencode";
  if (path === "/settings/model") return "model";
  return null;
};

const selectedIdFromUrl = (): WorkItemId | null => {
  if (settingsSectionFromUrl() !== null) return null;
  const parsed = WorkItemIdSchema.safeParse(
    new URL(window.location.href).searchParams.get("workItem"),
  );
  return parsed.success ? parsed.data : null;
};

type ApplicationDestination = Readonly<{
  workItemId: WorkItemId | null;
  settingsSection: SettingsSection | null;
}>;

const destinationFromUrl = (): ApplicationDestination => ({
  workItemId: selectedIdFromUrl(),
  settingsSection: settingsSectionFromUrl(),
});

const updateDestinationUrl = (
  destination: ApplicationDestination,
  mode: "push" | "replace" = "push",
): void => {
  const url = new URL(window.location.href);
  url.pathname = destination.settingsSection === null
    ? "/"
    : `/settings/${destination.settingsSection}`;
  if (destination.settingsSection !== null || destination.workItemId === null) {
    url.searchParams.delete("workItem");
  } else {
    url.searchParams.set("workItem", destination.workItemId);
  }
  if (mode === "replace") window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
};

export const App = () => {
  const queryClient = useQueryClient();
  const wideWorkbench = useWideWorkbench();
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<WorkItemId | null>(selectedIdFromUrl);
  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(settingsSectionFromUrl);
  const [queueProjectId, setQueueProjectId] = useState("");
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
  const [pendingDestination, setPendingDestination] = useState<ApplicationDestination | undefined>(undefined);
  const originatingRowId = useRef<WorkItemId | null>(null);

  const workItemsQuery = useQuery({ queryKey: workbenchQueryKeys.workItems, queryFn: api.listWorkItems });
  const projectsQuery = useQuery({ queryKey: workbenchQueryKeys.projects, queryFn: api.listProjects });
  const schemasQuery = useQuery({ queryKey: workbenchQueryKeys.workItemSchemas, queryFn: api.listWorkItemSchemas });
  const diagnosticsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    queryFn: api.listWorkItemSourceDiagnostics,
  });
  const readinessQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsReadiness,
    queryFn: api.getInstallationReadiness,
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
      const next = destinationFromUrl();
      if (workspaceDirty) {
        updateDestinationUrl({
          workItemId: selectedWorkItemId,
          settingsSection,
        }, "replace");
        setPendingDestination(next);
      } else {
        setSelectedWorkItemId(next.workItemId);
        setSettingsSection(next.settingsSection);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectedWorkItemId, settingsSection, workspaceDirty]);

  useEffect(() => {
    if (
      selectedWorkItemId !== null &&
      selectedWorkItem === null &&
      !workItemsQuery.isPending
    ) {
      setSelectedWorkItemId(null);
      updateDestinationUrl({ workItemId: null, settingsSection: null }, "replace");
    }
  }, [selectedWorkItem, selectedWorkItemId, workItemsQuery.isPending]);

  const selectedProject =
    (projectsQuery.data ?? []).find((project) => project.projectId === projectId) ?? null;
  const availableConcernIds = Object.keys(selectedProject?.concerns ?? {}).sort();

  useEffect(() => {
    setConcernIds((current) =>
      current.filter((id) => availableConcernIds.includes(id)));
  }, [projectId, availableConcernIds.join("\0")]);

  const commitDestination = (destination: ApplicationDestination): void => {
    const returningFrom =
      destination.workItemId === null && destination.settingsSection === null
        ? selectedWorkItemId
        : null;
    if (destination.workItemId !== null) originatingRowId.current = destination.workItemId;
    setSelectedWorkItemId(destination.workItemId);
    setSettingsSection(destination.settingsSection);
    setWorkspaceDirty(false);
    setContextOpen(false);
    updateDestinationUrl(destination);
    if (returningFrom !== null || (
      destination.workItemId === null && destination.settingsSection === null
    )) {
      window.requestAnimationFrame(() => {
        const targetId = returningFrom ?? originatingRowId.current;
        const row = targetId === null
          ? null
          : document.querySelector<HTMLElement>('[data-testid="work-item-row-' + targetId + '"]');
        (row ?? document.querySelector<HTMLElement>('[aria-label="Search work items"]'))?.focus();
      });
    }
  };

  const requestDestination = (destination: ApplicationDestination): void => {
    if (workspaceDirty) setPendingDestination(destination);
    else commitDestination(destination);
  };

  const commitSelection = (id: WorkItemId | null): void =>
    commitDestination({ workItemId: id, settingsSection: null });

  const requestSelection = (id: WorkItemId | null): void =>
    requestDestination({ workItemId: id, settingsSection: null });

  const navigateSettings = (section: SettingsSection): void =>
    requestDestination({ workItemId: null, settingsSection: section });

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
    const scoped = queueProjectId.length === 0
      ? workItems
      : workItems.filter((item) => item.projectId === queueProjectId);
    const query = search.trim().toLowerCase();
    if (query.length === 0) return scoped;
    return scoped.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.projectId.toLowerCase().includes(query) ||
      item.stage.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.concernIds.some((id) => id.toLowerCase().includes(query)));
  }, [search, queueProjectId, workItems]);

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
            <span>
              {settingsSection !== null
                ? "Settings"
                : selectedWorkItem
                  ? "Governed work item"
                  : "Governed work queue"}
            </span>
          </div>
          {settingsSection === null ? (
            <WorkbenchAction
              label="New work item"
              icon={<WorkbenchIcon name="add" />}
              iconOnly={selectedWorkItem !== null}
              onClick={() => {
                resetCreate();
                setCreateOpen(true);
              }}
            />
          ) : null}
          {selectedWorkItem === null && settingsSection === null ? (
            <WorkbenchAction
              label={refresh.isPending ? "Refreshing…" : "Refresh sources"}
              icon={<WorkbenchIcon name="refresh" />}
              loading={refresh.isPending}
              onClick={() => refresh.mutate()}
            />
          ) : null}
          {settingsSection !== null ? (
            <WorkbenchAction
              label="Back to work queue"
              onClick={() => requestSelection(null)}
            />
          ) : null}
        </WorkbenchToolbarGroup>
      }
      end={
        <>
          {selectedWorkItem === null && settingsSection === null ? (
            <WorkbenchToolbarSearch
              aria-label="Search work items"
              placeholder="Search work items"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          ) : null}
          <WorkbenchToolbarUtilities>
            <OpenCodeAccountControl onOpenSettings={() => navigateSettings("opencode")} />
            <WorkbenchAction
              label="Settings"
              tone="ghost"
              onClick={() => navigateSettings(settingsSection ?? "repositories")}
            />
            <label className="order-theme-control">
              <WorkbenchIcon name={themePreference} />
              <span className="order-visually-hidden">Theme</span>
              <select
                aria-label="Theme"
                value={themePreference}
                onChange={(event) => selectTheme(event.currentTarget.value)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </WorkbenchToolbarUtilities>
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

  const main = settingsSection !== null ? (
    <Suspense fallback={<WorkbenchEmptyState title="Loading Settings…" />}>
      <SettingsWorkspace
        section={settingsSection}
        onNavigate={navigateSettings}
        queueProjectId={queueProjectId}
        onQueueProjectChange={(nextProjectId) => {
          setQueueProjectId(nextProjectId);
          if (nextProjectId.length > 0) setProjectId(nextProjectId);
        }}
      />
    </Suspense>
  ) : selectedWorkItem ? (
    <Suspense fallback={<WorkbenchEmptyState title="Loading work item workspace…" />}>
      <WorkItemWorkspace
        key={selectedWorkItem.id}
        workItem={selectedWorkItem}
        onBack={() => requestSelection(null)}
        onOpenContext={() => setContextOpen(true)}
        showContextAction={!wideWorkbench}
        onDirtyChange={setWorkspaceDirty}
      />
    </Suspense>
  ) : (
    <div className="order-queue-page">
      {readinessQuery.data && !readinessQuery.data.ready ? (
        <section className="order-setup-required" role="status">
          <div>
            <strong>Setup requires attention</strong>
            <span>Complete installation Settings before productive work.</span>
          </div>
          <WorkbenchAction
            label="Open Settings"
            tone="primary"
            onClick={() => navigateSettings(
              settingsSectionForBlocker(readinessQuery.data?.blockers[0]),
            )}
          />
        </section>
      ) : null}
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
        selectedWorkItem && settingsSection === null
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
        isOpen={pendingDestination !== undefined}
        onOpenChange={(open) => { if (!open) setPendingDestination(undefined); }}
        title="Discard unsaved Markdown?"
        description="Leaving this WorkItem would discard the current unsaved Markdown buffer."
        cancelLabel="Continue editing"
        actionLabel="Discard unsaved changes"
        actionVariant="destructive"
        onAction={() => {
          const next = pendingDestination;
          setPendingDestination(undefined);
          if (next !== undefined) commitDestination(next);
        }}
      />
    </Theme>
  );
};
