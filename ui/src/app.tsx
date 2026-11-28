import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

import {
  WorkItemIdSchema,
  type ProjectManifest,
  type ArtifactRef,
  type Sha256,
  type WorkItem,
  type WorkItemId,
  type WorkItemSchemaId,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { useOpenCodeAccountControl } from "./OpenCodeAccountControl.tsx";
import type { SettingsSection } from "./SettingsWorkspace.tsx";
import {
  installationReadinessBlockerText,
  settingsDestinationForReadinessBlocker,
  type WorkflowMaterial,
  type ContextDocumentIdentity,
} from "./workbench-presentation.ts";
import { workbenchQueryKeys } from "./query-keys.ts";

import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchAppShell } from "./primitives/WorkbenchAppShell.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchTaskPanel } from "./primitives/WorkbenchTaskPanel.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchToolbar } from "./primitives/WorkbenchToolbar.tsx";
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
  const openCodeAccount = useOpenCodeAccountControl();
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<WorkItemId | null>(selectedIdFromUrl);
  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(settingsSectionFromUrl);
  const [queueProjectId, setQueueProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>(savedThemePreference);
  const [createOpen, setCreateOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextStep, setContextStep] = useState<WorkItem["stage"] | null>(null);
  const [contextMaterial, setContextMaterial] =
    useState<WorkflowMaterial | null>(null);
  const [contextDocument, setContextDocument] = useState<ContextDocumentIdentity | null>(null);
  const [projectId, setProjectId] = useState("");
  const [schemaId, setSchemaId] = useState<WorkItemSchemaId | "">("");
  const [title, setTitle] = useState("");
  const [concernIds, setConcernIds] = useState<readonly string[]>([]);
  const [derivedFromWorkItemId, setDerivedFromWorkItemId] = useState<WorkItemId | null>(null);
  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<ApplicationDestination | undefined>(undefined);
  const originatingRowId = useRef<WorkItemId | null>(null);
  const queueProjectInitialized = useRef(false);

  const workItemsQuery = useQuery({ queryKey: workbenchQueryKeys.workItems, queryFn: api.listWorkItems });
  const archivedWorkItemsQuery = useQuery({
    queryKey: workbenchQueryKeys.workItemsIncludingArchived,
    queryFn: api.listWorkItemsIncludingArchived,
    enabled: showArchived,
  });
  const selectedWorkItemQuery = useQuery({
    queryKey: selectedWorkItemId === null
      ? (["workItem", null] as const)
      : workbenchQueryKeys.workItem(selectedWorkItemId),
    queryFn: () => {
      if (selectedWorkItemId === null) {
        throw new TypeError("selected WorkItem query requires a WorkItem id");
      }
      return api.getWorkItem(selectedWorkItemId);
    },
    enabled: selectedWorkItemId !== null && settingsSection === null,
  });
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
        ...(selectedWorkItemId === null
          ? []
          : [queryClient.invalidateQueries({
              queryKey: workbenchQueryKeys.workItem(selectedWorkItemId),
            })]),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSourceDiagnostics }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSourceRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.lifecycleArtifactsRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.signoffPackageRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.currentApprovalRoot }),
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.approvalsRoot }),
      ]);
    },
  });

  const workItems = workItemsQuery.data ?? [];
  const selectedWorkItem = selectedWorkItemQuery.data ?? null;
  const derivedFromWorkItem = derivedFromWorkItemId === null
    ? null
    : selectedWorkItem?.id === derivedFromWorkItemId
      ? selectedWorkItem
      : workItems.find((item) => item.id === derivedFromWorkItemId) ?? null;

  useEffect(() => {
    if (!projectsQuery.data?.length) return;
    const first = firstProjectId(projectsQuery.data);
    if (projectId.length === 0) setProjectId(first);
    if (!queueProjectInitialized.current) {
      queueProjectInitialized.current = true;
      setQueueProjectId((current) => current.length === 0 ? first : current);
    }
  }, [projectId, projectsQuery.data]);

  useEffect(() => {
    if (derivedFromWorkItemId === null && schemaId === "" && schemasQuery.data) {
      const defaultSchema = schemasQuery.data.find((schema) => schema.authoringDefault);
      if (defaultSchema) setSchemaId(defaultSchema.schemaId);
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
      selectedWorkItemQuery.isError &&
      api.isOrderHttpRequestFailure(selectedWorkItemQuery.error) &&
      selectedWorkItemQuery.error.status === 404
    ) {
      setSelectedWorkItemId(null);
      updateDestinationUrl({ workItemId: null, settingsSection: null }, "replace");
    }
  }, [selectedWorkItemId, selectedWorkItemQuery.error, selectedWorkItemQuery.isError]);

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
    setContextStep(null);
    setContextMaterial(null);
    setContextDocument(null);
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
        queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemsIncludingArchived }),
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

  const updateContextSelection = useCallback((
    step: WorkItem["stage"],
    material: WorkflowMaterial,
  ): void => {
    setContextStep(step);
    setContextMaterial(material);
  }, []);

  const updateContextDocument = useCallback((
    path: string | null,
    sha256: Sha256 | null,
    artifactId: ArtifactRef["id"] | null = null,
  ): void => {
    setContextDocument(path === null ? null : { path, sha256, artifactId });
  }, []);

  const queueDataset =
    showArchived ? archivedWorkItemsQuery.data ?? workItems : workItems;
  const filtered = useMemo(() => {
    const scoped = queueProjectId.length === 0
      ? queueDataset
      : queueDataset.filter((item) => item.projectId === queueProjectId);
    const query = search.trim().toLowerCase();
    if (query.length === 0) return scoped;
    return scoped.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.projectId.toLowerCase().includes(query) ||
      item.stage.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.concernIds.some((id) => id.toLowerCase().includes(query)));
  }, [search, queueProjectId, queueDataset]);

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

  const applicationDestination =
    settingsSection !== null
      ? "Settings"
      : selectedWorkItem
        ? "Work item"
        : "Work queue";

  const projectOptions = (projectsQuery.data ?? []).map(
    (project) => project.projectId,
  );
  const toolbarProjectId =
    selectedWorkItem?.projectId ??
    (queueProjectId.length > 0 ? queueProjectId : null);
  const toolbar = (
    <WorkbenchToolbar
      orientation={{
        productLabel: "Order",
        destinationLabel: applicationDestination,
      }}
      projectContext={toolbarProjectId === null
        ? undefined
        : {
          value: toolbarProjectId,
          options: projectOptions,
          ...(selectedWorkItem === null && projectOptions.length > 1
            ? {
              onChange: (nextProjectId: string) => {
                setProjectId(nextProjectId);
                setQueueProjectId(nextProjectId);
              },
            }
            : {}),
        }}
      account={{
        label: openCodeAccount.label,
        readiness: openCodeAccount.readiness,
        href: "/settings/opencode",
        onNavigate: () => navigateSettings("opencode"),
      }}
      navigation={settingsSection === null
        ? {
          label: "Settings",
          href: "/settings/repositories",
          onNavigate: () => navigateSettings("repositories"),
        }
        : {
          label: "Work queue",
          href: "/",
          onNavigate: () => requestSelection(null),
        }}
      theme={{
        value: themePreference,
        onChange: selectTheme,
      }}
    />
  );

  const queue = (
    <Suspense fallback={<WorkbenchEmptyState compact title="Loading work queue…" />}>
      <WorkItemQueue
        workItems={filtered}
        schemas={schemasQuery.data ?? []}
        selectedWorkItemId={selectedWorkItemId}
        showArchived={showArchived}
        emptyTitle={search.trim().length > 0 ? "No matching work items" : "No work items"}
        search={search}
        sourceDiagnostics={diagnosticsQuery.data ?? []}
        refreshPending={refresh.isPending}
        loading={workItemsQuery.isPending}
        onShowArchivedChange={setShowArchived}
        onSearchChange={setSearch}
        onRefresh={() => refresh.mutate()}
        onCreate={() => {
          resetCreate();
          setCreateOpen(true);
        }}
        onSelect={requestSelection}
      />
    </Suspense>
  );

  const selectedWorkItemPending =
    settingsSection === null &&
    selectedWorkItemId !== null &&
    selectedWorkItemQuery.isPending;

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
        schemas={schemasQuery.data ?? []}
        selectedWorkItemFetching={selectedWorkItemQuery.isFetching}
        selectedWorkItemUpdatedAt={selectedWorkItemQuery.dataUpdatedAt}
        selectedWorkItemError={selectedWorkItemQuery.error}
        contextOpen={contextOpen}
        onContextOpenChange={setContextOpen}
        contextContent={
          <Suspense fallback={<WorkbenchEmptyState compact title="Loading context…" />}>
            <WorkItemContext
              workItem={selectedWorkItem}
              selectedStep={contextStep}
              selectedMaterial={contextMaterial}
              selectedDocument={contextDocument}
              onClose={() => setContextOpen(false)}
            />
          </Suspense>
        }
        onBack={() => requestSelection(null)}
        onContextSelectionChange={updateContextSelection}
        onContextDocumentChange={updateContextDocument}
        onCreateRemediation={startRemediation}
        onDirtyChange={setWorkspaceDirty}
      />
    </Suspense>
  ) : selectedWorkItemPending ? (
    <WorkbenchEmptyState title="Loading selected work item…" />
  ) : selectedWorkItemQuery.isError && selectedWorkItemId !== null ? (
    <WorkbenchErrorState
      title="Selected work item unavailable"
      description={errorText(selectedWorkItemQuery.error)}
      action={<WorkbenchAction label="Retry" onClick={() => void selectedWorkItemQuery.refetch()} />}
    />
  ) : (
    <div className="order-queue-workspace">
      {readinessQuery.data && !readinessQuery.data.ready ? (
        <section className="order-app-readiness" data-testid="installation-readiness">
          <WorkbenchNotice tone="warning" title="Setup requires attention" description="Productive readiness is derived from canonical installation state. Each unresolved concern links directly to its owning Settings area; the queue never appears mysteriously empty." />
          <div className="order-app-readiness-list">
            {readinessQuery.data.blockers.map((blocker) => {
              const section = settingsDestinationForReadinessBlocker(blocker);
              const destination = section === "repositories" ? "Repositories" : section === "opencode" ? "OpenCode accounts" : "Model & runtime";
              return <div className="order-app-readiness-item" key={blocker}>
                <div><strong>{installationReadinessBlockerText(blocker)}</strong><span>Required before productive work</span></div>
                <Link href={"/settings/" + section} isStandalone onClick={(event) => { event.preventDefault(); navigateSettings(section); }}>{"Open " + destination}</Link>
              </div>;
            })}
          </div>
        </section>
      ) : null}
      {queue}
    </div>
  );

  const destination = workItemsQuery.isError ? (
    <WorkbenchErrorState
      title="Local browser session required"
      description={
        errorText(workItemsQuery.error).includes("browser session required")
          ? "Run order open and open the one-time URL to establish the local session."
          : errorText(workItemsQuery.error)
      }
      action={<WorkbenchAction label="Retry" onClick={() => void workItemsQuery.refetch()} />}
    />
  ) : main;

  return (
    <Theme theme={neutralTheme} mode={themePreference}>
      <WorkbenchAppShell toolbar={toolbar} destination={destination} />

      <WorkbenchTaskPanel
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreate();
        }}
        title={derivedFromWorkItemId === null ? "Create work item" : "Create linked remediation"}
        onSubmit={(event) => {
          event.preventDefault();
          if (
            projectId.length > 0 &&
            schemaId !== "" &&
            title.trim().length > 0 &&
            !create.isPending
          ) {
            create.mutate();
          }
        }}
        body={
          <Suspense fallback={<WorkbenchEmptyState compact title="Loading creation controls…" />}>
            <CreateWorkItem
              projects={projectsQuery.data ?? []}
              schemas={schemasQuery.data ?? []}
              projectId={projectId}
              schemaId={schemaId}
              title={title}
              concernIds={concernIds}
              availableConcernIds={availableConcernIds}
              derivedFromWorkItem={derivedFromWorkItem}
              onProjectChange={setProjectId}
              onSchemaChange={setSchemaId}
              onTitleChange={setTitle}
              onConcernIdsChange={setConcernIds}
            />
          </Suspense>
        }
        feedback={
          create.error ? (
            <WorkbenchNotice
              tone="danger"
              title="Work item could not be created"
              description={errorText(create.error)}
            />
          ) : undefined
        }
        footer={
          <>
            <WorkbenchAction
              label="Cancel"
              disabled={create.isPending}
              onClick={() => {
                setCreateOpen(false);
                resetCreate();
              }}
            />
            <WorkbenchAction
              type="submit"
              label={derivedFromWorkItemId === null ? "Create work item" : "Create linked remediation"}
              tone="primary"
              loading={create.isPending}
              disabled={
                projectId.length === 0 ||
                schemaId === "" ||
                title.trim().length === 0 ||
                create.isPending
              }
            />
          </>
        }
      />

      <WorkbenchConfirmation
        kind="destructive"
        open={pendingDestination !== undefined}
        onOpenChange={(open) => { if (!open) setPendingDestination(undefined); }}
        title="Discard unsaved Markdown?"
        description="Leaving this WorkItem would discard the current unsaved Markdown buffer."
        confirmLabel="Discard unsaved changes"
        pending={false}
        onConfirm={() => {
          const next = pendingDestination;
          setPendingDestination(undefined);
          if (next !== undefined) commitDestination(next);
        }}
      />
    </Theme>
  );
};
