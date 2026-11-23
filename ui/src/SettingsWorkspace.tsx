import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@astryxdesign/core/Link";
import { Selector } from "@astryxdesign/core/Selector";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";

import {
  type ConnectedRepositoryState,
  type OpenCodeModelRef,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { OpenCodeAccountSettings } from "./OpenCodeAccountSettings.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";
import {
  installationReadinessBlockerText,
  settingsDestinationForReadinessBlocker,
} from "./workbench-presentation.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import { WorkbenchConfirmation } from "./primitives/WorkbenchConfirmation.tsx";
import { WorkbenchDisclosure } from "./primitives/WorkbenchDisclosure.tsx";
import { WorkbenchForm } from "./primitives/WorkbenchForm.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchSettingsLayout } from "./primitives/WorkbenchSettingsLayout.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";
import { WorkbenchUtilityLink } from "./primitives/WorkbenchUtilityLink.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchState,
} from "./primitives/WorkbenchState.tsx";

export type SettingsSection = "repositories" | "opencode" | "model";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const repositoryAttentionLabel = (
  attention: ConnectedRepositoryState["attention"][number],
): string => {
  switch (attention) {
    case "REPOSITORY_UNAVAILABLE": return "Repository unavailable";
    case "REPOSITORY_IDENTITY_INVALID": return "Repository identity is invalid";
    case "PROJECT_MANIFEST_MISSING": return "Project manifest is missing";
    case "PROJECT_MANIFEST_INVALID": return "Project manifest is invalid";
    case "WORKITEM_ROOT_INVALID": return "WorkItem document root is invalid";
  }
};

const repositoryAttentionText = (
  repository: ConnectedRepositoryState,
): string =>
  repository.attention.length === 0
    ? "Ready"
    : repository.attention.map(repositoryAttentionLabel).join(" · ");

const modelKey = (model: OpenCodeModelRef): string =>
  model.providerID + "/" + model.id;

const invalidateSettings = async (
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsConfig }),
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsReadiness }),
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsRepositories }),
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.settingsModels }),
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.projects }),
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItems }),
    queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.workItemSourceDiagnostics }),
  ]);
};

const SettingsNavigation = ({
  section,
  onNavigate,
}: Readonly<{
  section: SettingsSection;
  onNavigate: (section: SettingsSection) => void;
}>) => (
  <nav className="order-settings-navigation" aria-label="Settings sections">
    {([
      ["repositories", "Repositories"],
      ["opencode", "OpenCode"],
      ["model", "Model & runtime"],
    ] as const).map(([id, label]) => (
      <WorkbenchUtilityLink
        key={id}
        label={label}
        detail={section === id ? "Current section" : undefined}
        href={"/settings/" + id}
        onNavigate={(event) => {
          event.preventDefault();
          onNavigate(id);
        }}
      />
    ))}
  </nav>
);

const RepositorySettings = ({
  queueProjectId,
  onQueueProjectChange,
  installationReady,
}: Readonly<{
  queueProjectId: string;
  onQueueProjectChange: (projectId: string) => void;
  installationReady: boolean;
}>) => {
  const queryClient = useQueryClient();
  const [repositoryRoot, setRepositoryRoot] = useState("");
  const [addRepositoryOpen, setAddRepositoryOpen] = useState(false);
  const [disconnectRepositoryRoot, setDisconnectRepositoryRoot] = useState<string | null>(null);
  const [referenceRootsText, setReferenceRootsText] = useState("");
  const [migrationRepository, setMigrationRepository] = useState<string | null>(null);
  const [targetWorkItemsRoot, setTargetWorkItemsRoot] = useState("");

  const configQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsConfig,
    queryFn: api.getOrderConfigState,
  });
  const repositoriesQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsRepositories,
    queryFn: api.getConnectedRepositories,
  });

  useEffect(() => {
    const roots = configQuery.data?.config.referenceRoots;
    if (roots !== undefined) setReferenceRootsText(roots.join("\n"));
  }, [configQuery.data?.sha256]);

  const connect = useMutation({
    mutationFn: () => {
      const config = configQuery.data;
      if (config === undefined) throw new TypeError("Order configuration is unavailable");
      return api.connectRepository({
        expectedConfigSha256: config.sha256,
        repositoryRoot: repositoryRoot.trim(),
      });
    },
    onSuccess: async () => {
      setRepositoryRoot("");
      setAddRepositoryOpen(false);
      await invalidateSettings(queryClient);
    },
  });

  const disconnect = useMutation({
    mutationFn: (root: string) => {
      const config = configQuery.data;
      if (config === undefined) throw new TypeError("Order configuration is unavailable");
      return api.disconnectRepository({
        expectedConfigSha256: config.sha256,
        repositoryRoot: root,
      });
    },
    onSuccess: async () => {
      setDisconnectRepositoryRoot(null);
      await invalidateSettings(queryClient);
    },
  });

  const updateReferences = useMutation({
    mutationFn: () => {
      const config = configQuery.data;
      if (config === undefined) throw new TypeError("Order configuration is unavailable");
      const referenceRoots = referenceRootsText
        .split("\n")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      return api.updateReferenceRoots({
        expectedConfigSha256: config.sha256,
        referenceRoots,
      });
    },
    onSuccess: async () => invalidateSettings(queryClient),
  });

  const migrate = useMutation({
    mutationFn: (repository: ConnectedRepositoryState) => {
      if (repository.manifestSha256 === null) {
        throw new TypeError("repository manifest identity is unavailable");
      }
      return api.migrateWorkItemDocumentRoot({
        repositoryRoot: repository.repositoryRoot,
        expectedManifestSha256: repository.manifestSha256,
        targetWorkItemsRoot: targetWorkItemsRoot.trim(),
      });
    },
    onSuccess: async () => {
      setMigrationRepository(null);
      setTargetWorkItemsRoot("");
      await invalidateSettings(queryClient);
    },
  });

  const repositories = repositoriesQuery.data ?? [];
  const readyProjects = repositories.flatMap((repository) =>
    repository.status === "READY" && repository.projectId !== null
      ? [repository.projectId]
      : []
  );
  const migrationTarget =
    repositories.find((repository) => repository.repositoryRoot === migrationRepository) ?? null;

  if (migrationTarget !== null) {
    return (
      <section className="order-settings-section" data-testid="settings-repositories">
        <section data-testid="move-workitem-documents">
          <WorkbenchSectionHeader title="Move WorkItem documents" description="Bounded migration of the repository-owned WorkItem document root." />
          <div className="order-settings-supporting-info"><h3>Current repository-relative root</h3><p><code>{migrationTarget.workItemsRoot ?? "Unavailable"}</code></p></div>
          <div className="order-settings-task-surface">
            <WorkbenchForm
              content={<TextInput label="New repository-relative WorkItem document root" value={targetWorkItemsRoot} onChange={setTargetWorkItemsRoot} placeholder="docs/order/work-items" width="100%" />}
              actions={<>
                <WorkbenchAction label="Move documents" tone="primary" loading={migrate.isPending} disabled={migrate.isPending || targetWorkItemsRoot.trim().length === 0} onClick={() => migrate.mutate(migrationTarget)} />
                <WorkbenchAction label="Cancel move" onClick={() => { setMigrationRepository(null); setTargetWorkItemsRoot(""); }} />
              </>}
              feedback={migrate.error ? <WorkbenchNotice tone="danger" title="Settings update failed" description={errorText(migrate.error)} /> : undefined}
            />
          </div>
          <div className="order-settings-supporting-info"><p>Migration preserves WorkItem identities and bytes, updates project configuration atomically, and must not leave two productive document roots.</p></div>
        </section>
      </section>
    );
  }

  if (addRepositoryOpen) {
    return (
      <section className="order-settings-section" data-testid="settings-repositories">
        <div data-testid="add-repository-form">
          <WorkbenchSectionHeader title="Add repository" description="Connect an existing exact Git root. Order does not create or initialize repositories here." />
          <div className="order-settings-task-surface">
            <WorkbenchForm
              content={<TextInput label="Exact Git root" value={repositoryRoot} onChange={setRepositoryRoot} placeholder="/absolute/path/to/repository" width="100%" />}
              actions={<>
                <WorkbenchAction label="Connect repository" tone="primary" loading={connect.isPending} disabled={connect.isPending || repositoryRoot.trim().length === 0} onClick={() => connect.mutate()} />
                <WorkbenchAction label="Cancel add repository" disabled={connect.isPending} onClick={() => { setRepositoryRoot(""); setAddRepositoryOpen(false); }} />
              </>}
              feedback={connect.error ? <WorkbenchNotice tone="danger" title="Settings update failed" description={errorText(connect.error)} /> : undefined}
            />
          </div>
          <div className="order-settings-supporting-info"><h3>Before connecting</h3><p>Choose an existing Git repository with a valid Order project manifest. The connection must not duplicate or overlap an existing target repository.</p></div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-settings-section" data-testid="settings-repositories">
      <WorkbenchSectionHeader title="Repositories" description="Target repositories own WorkItems and their governed Markdown. STAGE reference roots are read-only context." />
      {installationReady ? <WorkbenchNotice tone="success" title="Ready for productive work" /> : null}
      {repositoriesQuery.isPending ? <WorkbenchState kind="loading" title="Checking repositories…" /> : null}
      {repositoriesQuery.error ? <WorkbenchNotice tone="danger" title="Repositories unavailable" description={errorText(repositoriesQuery.error)} /> : null}
      {repositories.length === 0 && !repositoriesQuery.isPending ? (
        <WorkbenchEmptyState compact title="No target repositories connected" />
      ) : repositories.length > 0 ? (
        <WorkbenchTable
          label="Connected repositories"
          columns={[
            { key: "project", label: "Project" },
            { key: "status", label: "Status" },
            { key: "actions", label: "" },
          ]}
          rows={repositories.map((repository) => ({
            id: repository.repositoryRoot,
            cells: {
              project: <div className="order-settings-repository-identity"><strong>{repository.projectId ?? "Needs attention"}</strong><span>Git root: <code>{repository.repositoryRoot}</code></span><span>WorkItem documents: <code>{repository.workItemsRoot ?? "Unavailable until configuration is valid"}</code></span></div>,
              status: <WorkbenchStatus tone={repository.status === "READY" && repository.attention.length === 0 ? "success" : "warning"} label={repositoryAttentionText(repository)} />,
              actions: <div className="order-inline-actions">
                {repository.status === "READY" ? <WorkbenchAction label={"Move WorkItem documents for " + (repository.projectId ?? repository.repositoryRoot)} onClick={() => { setMigrationRepository(repository.repositoryRoot); setTargetWorkItemsRoot(repository.workItemsRoot ?? ""); }} /> : null}
                <WorkbenchAction label={"Disconnect " + (repository.projectId ?? repository.repositoryRoot)} tone="ghost" loading={disconnect.isPending && disconnect.variables === repository.repositoryRoot} disabled={disconnect.isPending} onClick={() => setDisconnectRepositoryRoot(repository.repositoryRoot)} />
              </div>,
            },
          }))}
        />
      ) : null}
      <div className="order-settings-add-repository"><WorkbenchAction label="Add repository" tone="primary" onClick={() => setAddRepositoryOpen(true)} /></div>
      {readyProjects.length > 1 ? <Selector label="Queue and creation context" options={[{ value: "", label: "All ready repositories" }, ...readyProjects.map((projectId) => ({ value: projectId, label: projectId }))]} value={queueProjectId} onChange={onQueueProjectChange} width="100%" /> : null}
      <div className="order-settings-task-surface">
        <WorkbenchForm
          content={<TextArea label="STAGE reference roots" description="One absolute read-only reference root per line. These never become target repositories." rows={4} value={referenceRootsText} onChange={setReferenceRootsText} width="100%" />}
          actions={<WorkbenchAction label="Save reference roots" loading={updateReferences.isPending} disabled={updateReferences.isPending || configQuery.data === undefined} onClick={() => updateReferences.mutate()} />}
        />
      </div>
      <WorkbenchConfirmation kind="destructive" open={disconnectRepositoryRoot !== null} onOpenChange={(open) => { if (!open) setDisconnectRepositoryRoot(null); }} title="Disconnect repository?" description="Remove only Order's connection. Repository files, WorkItem Markdown, Git history and authority documents are not deleted." confirmLabel="Disconnect repository" pending={disconnect.isPending} onConfirm={() => { if (disconnectRepositoryRoot !== null) disconnect.mutate(disconnectRepositoryRoot); }} />
      {[disconnect.error, updateReferences.error].filter((error) => error !== null).map((error, index) => <WorkbenchNotice key={index} tone="danger" title="Settings update failed" description={errorText(error)} />)}
    </section>
  );
};

const ModelRuntimeSettings = () => {
  const queryClient = useQueryClient();
  const configQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsConfig,
    queryFn: api.getOrderConfigState,
  });
  const modelsQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsModels,
    queryFn: api.getAvailableOpenCodeModels,
  });
  const configured = configQuery.data?.config.model ?? null;
  const availableModels = modelsQuery.data ?? [];
  const configuredKey = configured === null ? "" : modelKey(configured);
  const configuredAvailable =
    configured === null ||
    availableModels.some((model) => modelKey(model) === configuredKey);
  const modelOptions = [
    { value: "", label: "No model configured" },
    ...(
      configured !== null && !configuredAvailable
        ? [{ value: configuredKey, label: configured.providerID + "/" + configured.id }]
        : []
    ),
    ...availableModels.map((model) => ({
      value: modelKey(model),
      label: model.providerID + "/" + model.id,
    })),
  ];
  const [selection, setSelection] = useState("");

  useEffect(() => {
    setSelection(configuredKey);
  }, [configured?.providerID, configured?.id]);

  const updateModel = useMutation({
    mutationFn: () => {
      const config = configQuery.data;
      const model = (modelsQuery.data ?? []).find((candidate) => modelKey(candidate) === selection);
      if (config === undefined || model === undefined) {
        throw new TypeError("select an available model");
      }
      return api.updateConfiguredModel({
        expectedConfigSha256: config.sha256,
        model,
      });
    },
    onSuccess: async () => invalidateSettings(queryClient),
  });

  return (
    <section className="order-settings-section" data-testid="settings-model">
      <WorkbenchSectionHeader
        title="Model & runtime"
        description="Select the OpenCode model Order will use for productive agent work."
      />
      {modelsQuery.isPending ? <WorkbenchState kind="loading" title="Loading available models…" /> : null}
      {modelsQuery.error ? (
        <WorkbenchNotice tone="danger" title="Available models could not be loaded" description={errorText(modelsQuery.error)} />
      ) : null}
      {!modelsQuery.isPending && modelsQuery.error == null && configured !== null && !configuredAvailable ? (
        <WorkbenchNotice
          tone="warning"
          title="Configured model is unavailable"
          description={
            configured.providerID + "/" + configured.id +
            " is not currently available. Select an available model and save to restore productive readiness."
          }
        />
      ) : null}
      <div className="order-settings-task-surface">
        <WorkbenchForm
          content={
            <Selector
              label="Configured model"
              options={modelOptions}
              value={selection}
              onChange={setSelection}
              width="100%"
            />
          }
          actions={
            <WorkbenchAction
              label="Save model"
              tone="primary"
              loading={updateModel.isPending}
              disabled={
                updateModel.isPending ||
                selection.length === 0 ||
                selection === (configured === null ? "" : modelKey(configured))
              }
              onClick={() => updateModel.mutate()}
            />
          }
        />
      </div>
      {updateModel.error ? (
        <WorkbenchNotice tone="danger" title="Model update failed" description={errorText(updateModel.error)} />
      ) : null}
    </section>
  );
};

const SettingsDiagnostics = ({ section }: Readonly<{ section: SettingsSection }>) => {
  const configQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsConfig,
    queryFn: api.getOrderConfigState,
  });
  const repositoriesQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsRepositories,
    queryFn: api.getConnectedRepositories,
  });
  const accountStateQuery = useQuery({
    queryKey: workbenchQueryKeys.openCodeAccountState,
    queryFn: api.getOpenCodeAccountState,
  });

  const content = section === "repositories" ? (
    <div className="order-settings-diagnostics-grid">
      {configQuery.data ? <p>Configuration SHA-256: <code>{configQuery.data.sha256}</code></p> : null}
      {(repositoriesQuery.data ?? []).map((repository) => (
        <section key={repository.repositoryRoot}>
          <h3>{repository.projectId ?? "Repository requiring attention"}</h3>
          <p>Manifest SHA-256: <code>{repository.manifestSha256 ?? "Unavailable"}</code></p>
          <p>Diagnostic state: <code>{repository.attention.join(", ") || "READY"}</code></p>
        </section>
      ))}
    </div>
  ) : section === "opencode" ? (
    <div className="order-settings-diagnostics-grid">
      <p>Active account id: <code>{accountStateQuery.data?.activeAccountId ?? "None"}</code></p>
      {(accountStateQuery.data?.accounts ?? []).map((account) => (
        <section key={account.id}>
          <h3>{account.label}</h3>
          <p>Account id: <code>{account.id}</code></p>
          <p>Status: <code>{account.status.status}</code></p>
        </section>
      ))}
      <p>Mutation blockers: <code>{accountStateQuery.data?.mutationBlockers.join(", ") || "None"}</code></p>
    </div>
  ) : (
    <div className="order-settings-diagnostics-grid">
      {configQuery.data ? <p>Configuration SHA-256: <code>{configQuery.data.sha256}</code></p> : null}
      <p>Model availability is loaded through the configured OpenCode account boundary.</p>
    </div>
  );

  return (
    <WorkbenchDisclosure
      label="Settings diagnostics"
      content={<section data-testid="settings-diagnostics" className="order-settings-diagnostics">{content}</section>}
    />
  );
};

export const SettingsWorkspace = ({
  section,
  onNavigate,
  queueProjectId,
  onQueueProjectChange,
}: Readonly<{
  section: SettingsSection;
  onNavigate: (section: SettingsSection) => void;
  queueProjectId: string;
  onQueueProjectChange: (projectId: string) => void;
}>) => {
  const readinessQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsReadiness,
    queryFn: api.getInstallationReadiness,
  });

  const primaryBlocker = readinessQuery.data?.blockers[0] ?? null;

  const readiness = readinessQuery.isError ? (
    <WorkbenchNotice tone="danger" title="Settings readiness unavailable" description={errorText(readinessQuery.error)} />
  ) : readinessQuery.isPending ? (
    <WorkbenchEmptyState compact title="Checking installation readiness…" />
  ) : readinessQuery.data && !readinessQuery.data.ready ? (
    <WorkbenchNotice
      tone="warning"
      title="Setup requires attention"
      description={
        <span>
          {readinessQuery.data.blockers.map((blocker, index) => (
            <span key={blocker}>
              {index > 0 ? " · " : ""}
              <Link
                href={"/settings/" + settingsDestinationForReadinessBlocker(blocker)}
                isStandalone
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(settingsDestinationForReadinessBlocker(blocker));
                }}
              >
                {installationReadinessBlockerText(blocker)}
              </Link>
            </span>
          ))}
          {primaryBlocker === null ? null : <span className="order-visually-hidden"> Primary blocker: {installationReadinessBlockerText(primaryBlocker)}</span>}
        </span>
      }
    />
  ) : null;

  const content = section === "repositories" ? (
    <RepositorySettings
      queueProjectId={queueProjectId}
      onQueueProjectChange={onQueueProjectChange}
      installationReady={readinessQuery.data?.ready === true}
    />
  ) : section === "opencode" ? (
    <OpenCodeAccountSettings />
  ) : (
    <ModelRuntimeSettings />
  );

  return (
    <div data-testid="settings-workspace" className="order-settings-workspace">
      <header className="order-settings-page-heading">
        <h1>Settings</h1>
        <p>Installation configuration and readiness.</p>
      </header>
      <WorkbenchSettingsLayout
        navigation={<SettingsNavigation section={section} onNavigate={onNavigate} />}
        content={<div className="order-settings-content">{readiness}{content}<SettingsDiagnostics section={section} /></div>}
      />
    </div>
  );
};
