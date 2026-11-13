import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";

import {
  type ConnectedRepositoryState,
  type InstallationReadinessBlocker,
  type OpenCodeModelRef,
} from "../../src/core/contracts.ts";
import * as api from "./http.ts";
import { OpenCodeAccountSettings } from "./OpenCodeAccountSettings.tsx";
import { workbenchQueryKeys } from "./query-keys.ts";
import { WorkbenchAction } from "./primitives/WorkbenchAction.tsx";
import {
  WorkbenchEmptyState,
  WorkbenchErrorState,
} from "./primitives/WorkbenchState.tsx";

export type SettingsSection = "repositories" | "opencode" | "model";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const blockerText = (blocker: InstallationReadinessBlocker): string => {
  switch (blocker) {
    case "REPOSITORY_REQUIRED":
      return "Connect at least one target repository.";
    case "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION":
      return "One or more target repositories need attention.";
    case "MODEL_INVALID":
      return "Select an available OpenCode model.";
    case "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION":
      return "One or more STAGE reference roots need attention.";
    case "OPENCODE_ACCOUNT_REQUIRED":
      return "Add or reconnect an OpenCode account.";
  }
};

const blockerSection = (blocker: InstallationReadinessBlocker): SettingsSection =>
  blocker === "OPENCODE_ACCOUNT_REQUIRED"
    ? "opencode"
    : blocker === "MODEL_INVALID"
      ? "model"
      : "repositories";

const repositoryAttentionText = (
  repository: ConnectedRepositoryState,
): string =>
  repository.attention.length === 0
    ? "Ready"
    : repository.attention.join(", ").replaceAll("_", " ").toLowerCase();

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
      <button
        key={id}
        type="button"
        aria-current={section === id ? "page" : undefined}
        onClick={() => onNavigate(id)}
      >
        {label}
      </button>
    ))}
  </nav>
);

const RepositorySettings = ({
  queueProjectId,
  onQueueProjectChange,
}: Readonly<{
  queueProjectId: string;
  onQueueProjectChange: (projectId: string) => void;
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

  return (
    <section className="order-settings-section" data-testid="settings-repositories">
      <header>
        <div>
          <h2>Repositories</h2>
          <p>Target repositories own WorkItems and their governed Markdown. STAGE reference roots are read-only context.</p>
        </div>
      </header>

      {repositoriesQuery.isPending ? <p>Checking repositories…</p> : null}
      {repositoriesQuery.error ? (
        <p className="order-error-text" role="alert">{errorText(repositoriesQuery.error)}</p>
      ) : null}

      <div className="order-settings-list">
        {repositories.length === 0 ? <p>No target repositories connected.</p> : null}
        {repositories.map((repository) => (
          <article key={repository.repositoryRoot} className="order-settings-card">
            <div>
              <strong>{repository.projectId ?? "Repository needs attention"}</strong>
              <span>{repository.status} · {repositoryAttentionText(repository)}</span>
            </div>
            <dl>
              <div><dt>Git root</dt><dd>{repository.repositoryRoot}</dd></div>
              <div><dt>WorkItem documents</dt><dd>{repository.workItemsRoot ?? "Unavailable until manifest is valid"}</dd></div>
            </dl>
            <div className="order-inline-actions">
              {repository.status === "READY" ? (
                <WorkbenchAction
                  label="Move WorkItem documents"
                  onClick={() => {
                    setMigrationRepository(repository.repositoryRoot);
                    setTargetWorkItemsRoot(repository.workItemsRoot ?? "");
                  }}
                />
              ) : null}
              <WorkbenchAction
                label="Disconnect repository"
                tone="ghost"
                loading={disconnect.isPending && disconnect.variables === repository.repositoryRoot}
                disabled={disconnect.isPending}
                onClick={() => setDisconnectRepositoryRoot(repository.repositoryRoot)}
              />
            </div>
            {migrationRepository === repository.repositoryRoot ? (
              <div className="order-settings-inline-form">
                <label>
                  New repository-relative WorkItem document root
                  <input
                    value={targetWorkItemsRoot}
                    onChange={(event) => setTargetWorkItemsRoot(event.currentTarget.value)}
                    placeholder="docs/order/work-items"
                  />
                </label>
                <div className="order-inline-actions">
                  <WorkbenchAction
                    label="Move documents"
                    tone="primary"
                    loading={migrate.isPending}
                    disabled={migrate.isPending || targetWorkItemsRoot.trim().length === 0}
                    onClick={() => migrate.mutate(repository)}
                  />
                  <WorkbenchAction
                    label="Cancel move"
                    onClick={() => {
                      setMigrationRepository(null);
                      setTargetWorkItemsRoot("");
                    }}
                  />
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="order-settings-add-repository">
        <WorkbenchAction
          label="Add repository"
          tone="primary"
          onClick={() => setAddRepositoryOpen(true)}
        />
        {addRepositoryOpen ? (
          <div className="order-settings-inline-form" data-testid="add-repository-form">
            <h3>Add repository</h3>
            <p>Connect an existing exact Git root. Order does not create or initialize repositories here.</p>
            <label>
              Exact Git root
              <input
                value={repositoryRoot}
                onChange={(event) => setRepositoryRoot(event.currentTarget.value)}
                placeholder="/absolute/path/to/repository"
              />
            </label>
            <div className="order-inline-actions">
              <WorkbenchAction
                label="Connect repository"
                tone="primary"
                loading={connect.isPending}
                disabled={connect.isPending || repositoryRoot.trim().length === 0}
                onClick={() => connect.mutate()}
              />
              <WorkbenchAction
                label="Cancel add repository"
                disabled={connect.isPending}
                onClick={() => {
                  setRepositoryRoot("");
                  setAddRepositoryOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {readyProjects.length > 1 ? (
        <label className="order-settings-context-selector">
          Queue and creation context
          <select
            value={queueProjectId}
            onChange={(event) => onQueueProjectChange(event.currentTarget.value)}
          >
            <option value="">All ready repositories</option>
            {readyProjects.map((projectId) => (
              <option key={projectId} value={projectId}>{projectId}</option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="order-settings-inline-form">
        <h3>STAGE reference roots</h3>
        <p>One absolute read-only reference root per line. These never become target repositories.</p>
        <textarea
          rows={4}
          value={referenceRootsText}
          onChange={(event) => setReferenceRootsText(event.currentTarget.value)}
        />
        <WorkbenchAction
          label="Save reference roots"
          loading={updateReferences.isPending}
          disabled={updateReferences.isPending || configQuery.data === undefined}
          onClick={() => updateReferences.mutate()}
        />
      </div>

      <AlertDialog
        isOpen={disconnectRepositoryRoot !== null}
        onOpenChange={(open) => { if (!open) setDisconnectRepositoryRoot(null); }}
        title="Disconnect repository?"
        description={
          disconnectRepositoryRoot === null
            ? ""
            : "Remove only Order's connection to " + disconnectRepositoryRoot +
              ". Repository files, WorkItem Markdown, Git history, and authority documents are not deleted."
        }
        cancelLabel="Cancel"
        actionLabel="Disconnect repository"
        actionVariant="destructive"
        onAction={() => {
          if (disconnectRepositoryRoot !== null) disconnect.mutate(disconnectRepositoryRoot);
        }}
      />

      {[connect.error, disconnect.error, migrate.error, updateReferences.error]
        .filter((error) => error !== null)
        .map((error, index) => (
          <p key={index} className="order-error-text" role="alert">{errorText(error)}</p>
        ))}
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
  const [selection, setSelection] = useState("");

  useEffect(() => {
    setSelection(configured === null ? "" : modelKey(configured));
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
      <header>
        <div>
          <h2>Model & runtime</h2>
          <p>Select the OpenCode model Order will use for productive agent work.</p>
        </div>
      </header>
      {modelsQuery.isPending ? <p>Loading available models…</p> : null}
      {modelsQuery.error ? (
        <p className="order-error-text" role="alert">{errorText(modelsQuery.error)}</p>
      ) : null}
      <label>
        Configured model
        <select value={selection} onChange={(event) => setSelection(event.currentTarget.value)}>
          <option value="">No model configured</option>
          {(modelsQuery.data ?? []).map((model) => (
            <option key={modelKey(model)} value={modelKey(model)}>
              {model.providerID}/{model.id}
            </option>
          ))}
        </select>
      </label>
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
      {updateModel.error ? (
        <p className="order-error-text" role="alert">{errorText(updateModel.error)}</p>
      ) : null}
    </section>
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

  return (
    <div className="order-settings-workspace" data-testid="settings-workspace">
      <aside>
        <div>
          <h1>Settings</h1>
          <p>Installation configuration and readiness.</p>
        </div>
        <SettingsNavigation section={section} onNavigate={onNavigate} />
      </aside>
      <main>
        {readinessQuery.isError ? (
          <WorkbenchErrorState
            title="Settings readiness unavailable"
            description={errorText(readinessQuery.error)}
          />
        ) : readinessQuery.isPending ? (
          <WorkbenchEmptyState compact title="Checking installation readiness…" />
        ) : readinessQuery.data && !readinessQuery.data.ready ? (
          <section className="order-settings-readiness" role="status">
            <strong>Setup requires attention</strong>
            {readinessQuery.data.blockers.map((blocker) => (
              <button
                key={blocker}
                type="button"
                onClick={() => onNavigate(blockerSection(blocker))}
              >
                {blockerText(blocker)}
              </button>
            ))}
            {primaryBlocker === null ? null : (
              <span className="order-visually-hidden">
                Primary blocker: {blockerText(primaryBlocker)}
              </span>
            )}
          </section>
        ) : (
          <section className="order-settings-readiness order-settings-ready" role="status">
            <strong>Ready for productive work</strong>
          </section>
        )}

        {section === "repositories" ? (
          <RepositorySettings
            queueProjectId={queueProjectId}
            onQueueProjectChange={onQueueProjectChange}
          />
        ) : section === "opencode" ? (
          <OpenCodeAccountSettings />
        ) : (
          <ModelRuntimeSettings />
        )}
      </main>
    </div>
  );
};
