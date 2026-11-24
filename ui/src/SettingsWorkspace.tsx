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
import { WorkbenchForm } from "./primitives/WorkbenchForm.tsx";
import { WorkbenchNotice } from "./primitives/WorkbenchNotice.tsx";
import { WorkbenchSectionHeader } from "./primitives/WorkbenchSectionHeader.tsx";
import { WorkbenchSettingsLayout } from "./primitives/WorkbenchSettingsLayout.tsx";
import { WorkbenchState } from "./primitives/WorkbenchState.tsx";
import { WorkbenchStatus } from "./primitives/WorkbenchStatus.tsx";
import { WorkbenchTable } from "./primitives/WorkbenchTable.tsx";
import { WorkbenchUtilityLink } from "./primitives/WorkbenchUtilityLink.tsx";

export type SettingsSection = "repositories" | "opencode" | "model";

const errorText = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const repositoryAttentionLabel = (
  attention: ConnectedRepositoryState["attention"][number],
): string => {
  switch (attention) {
    case "REPOSITORY_UNAVAILABLE":
      return "Repository unavailable";
    case "REPOSITORY_IDENTITY_INVALID":
      return "Repository identity is invalid";
    case "PROJECT_MANIFEST_MISSING":
      return "Project manifest is missing";
    case "PROJECT_MANIFEST_INVALID":
      return "Project manifest is invalid";
    case "WORKITEM_ROOT_INVALID":
      return "WorkItem document root is invalid";
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
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.settingsConfig,
    }),
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.settingsReadiness,
    }),
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.settingsRepositories,
    }),
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.settingsModels,
    }),
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.projects,
    }),
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.workItems,
    }),
    queryClient.invalidateQueries({
      queryKey: workbenchQueryKeys.workItemSourceDiagnostics,
    }),
  ]);
};

const SettingsNavigation = ({
  section,
  onNavigate,
}: Readonly<{
  section: SettingsSection;
  onNavigate: (section: SettingsSection) => void;
}>) => (
  <nav className="order-settings-nav" aria-label="Settings sections">
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
}: Readonly<{
  queueProjectId: string;
  onQueueProjectChange: (projectId: string) => void;
}>) => {
  const queryClient = useQueryClient();
  const [repositoryRoot, setRepositoryRoot] = useState("");
  const [addRepositoryOpen, setAddRepositoryOpen] = useState(false);
  const [disconnectRepositoryRoot, setDisconnectRepositoryRoot] =
    useState<string | null>(null);
  const [referenceRootsText, setReferenceRootsText] = useState("");
  const [migrationRepositoryRoot, setMigrationRepositoryRoot] =
    useState<string | null>(null);
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
    if (roots !== undefined) {
      setReferenceRootsText(roots.join("\n"));
    }
  }, [configQuery.data?.sha256]);

  const connect = useMutation({
    mutationFn: () => {
      const config = configQuery.data;
      if (config === undefined) {
        throw new TypeError("Order configuration is unavailable");
      }
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
      if (config === undefined) {
        throw new TypeError("Order configuration is unavailable");
      }
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
      if (config === undefined) {
        throw new TypeError("Order configuration is unavailable");
      }
      return api.updateReferenceRoots({
        expectedConfigSha256: config.sha256,
        referenceRoots: referenceRootsText
          .split("\n")
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
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
      setMigrationRepositoryRoot(null);
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
    repositories.find(
      (repository) =>
        repository.repositoryRoot === migrationRepositoryRoot,
    ) ?? null;
  const disconnectTarget =
    repositories.find(
      (repository) =>
        repository.repositoryRoot === disconnectRepositoryRoot,
    ) ?? null;

  if (migrationTarget !== null) {
    return (
      <section
        className="order-settings-pane"
        data-testid="settings-repositories"
      >
        <WorkbenchSectionHeader
          title="Move WorkItem documents"
          description={
            "Move governed documents for " +
            (migrationTarget.projectId ?? "this repository") +
            " without changing WorkItem identity."
          }
        />
        <div
          className="order-settings-task-context"
          data-testid="move-workitem-documents"
        >
          <div>
            <strong>Repository</strong>
            <code>{migrationTarget.repositoryRoot}</code>
          </div>
          <div>
            <strong>Current repository-relative root</strong>
            <code>{migrationTarget.workItemsRoot ?? "Unavailable"}</code>
          </div>
          <p>
            Migration preserves WorkItem identities and document bytes,
            updates project configuration atomically, and leaves one
            productive WorkItem document root.
          </p>
        </div>
        <WorkbenchForm
          content={
            <TextInput
              label="New repository-relative WorkItem document root"
              value={targetWorkItemsRoot}
              onChange={setTargetWorkItemsRoot}
              placeholder="docs/order/work-items"
              width="100%"
            />
          }
          actions={
            <>
              <WorkbenchAction
                label="Move documents"
                tone="primary"
                loading={migrate.isPending}
                disabled={
                  migrate.isPending ||
                  targetWorkItemsRoot.trim().length === 0
                }
                onClick={() => migrate.mutate(migrationTarget)}
              />
              <WorkbenchAction
                label="Cancel move"
                onClick={() => {
                  setMigrationRepositoryRoot(null);
                  setTargetWorkItemsRoot("");
                }}
              />
            </>
          }
          feedback={
            migrate.error ? (
              <WorkbenchNotice
                tone="danger"
                title="Document move failed"
                description={errorText(migrate.error)}
              />
            ) : undefined
          }
        />
      </section>
    );
  }

  if (addRepositoryOpen) {
    return (
      <section
        className="order-settings-pane"
        data-testid="settings-repositories"
      >
        <div data-testid="add-repository-form">
          <WorkbenchSectionHeader
            title="Add repository"
            description="Connect an existing Git repository. Order does not create or initialize repositories here."
          />
          <WorkbenchForm
            content={
              <TextInput
                label="Exact Git root"
                value={repositoryRoot}
                onChange={setRepositoryRoot}
                placeholder="/absolute/path/to/repository"
                width="100%"
              />
            }
            actions={
              <>
                <WorkbenchAction
                  label="Connect repository"
                  tone="primary"
                  loading={connect.isPending}
                  disabled={
                    connect.isPending ||
                    repositoryRoot.trim().length === 0
                  }
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
              </>
            }
            feedback={
              connect.error ? (
                <WorkbenchNotice
                  tone="danger"
                  title="Repository could not be connected"
                  description={errorText(connect.error)}
                />
              ) : undefined
            }
          />
          <div className="order-settings-task-context">
            <p>
              Choose an existing Git repository with a valid Order project
              manifest. The connection must not duplicate or overlap an
              existing target repository.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="order-settings-pane"
      data-testid="settings-repositories"
    >
      <WorkbenchSectionHeader
        title="Repositories"
        description="Target repositories own WorkItems and their governed Markdown. STAGE reference roots are read-only context."
        action={
          <WorkbenchAction
            label="Add repository"
            tone="primary"
            onClick={() => setAddRepositoryOpen(true)}
          />
        }
      />

      {repositoriesQuery.isPending ? (
        <WorkbenchState kind="loading" title="Checking repositories…" />
      ) : null}
      {repositoriesQuery.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Repositories unavailable"
          description={errorText(repositoriesQuery.error)}
        />
      ) : null}

      {repositories.length === 0 && !repositoriesQuery.isPending ? (
        <WorkbenchState
          kind="empty"
          title="No target repositories connected"
        />
      ) : repositories.length > 0 ? (
        <WorkbenchTable
          label="Connected repositories"
          columns={[
            { key: "project", label: "Repository" },
            { key: "status", label: "Status" },
            { key: "actions", label: "" },
          ]}
          rows={repositories.map((repository) => ({
            id: repository.repositoryRoot,
            cells: {
              project: (
                <div className="order-settings-repository">
                  <strong>
                    {repository.projectId ?? "Repository needs attention"}
                  </strong>
                  <span>
                    Git root: <code>{repository.repositoryRoot}</code>
                  </span>
                  <span>
                    WorkItem documents:{" "}
                    <code>
                      {repository.workItemsRoot ??
                        "Unavailable until configuration is valid"}
                    </code>
                  </span>
                </div>
              ),
              status: (
                <WorkbenchStatus
                  tone={
                    repository.status === "READY" &&
                    repository.attention.length === 0
                      ? "success"
                      : "warning"
                  }
                  label={repositoryAttentionText(repository)}
                />
              ),
              actions: (
                <div className="order-inline-actions">
                  {repository.status === "READY" ? (
                    <WorkbenchAction
                      label={
                        "Move WorkItem documents for " +
                        (repository.projectId ?? repository.repositoryRoot)
                      }
                      onClick={() => {
                        setMigrationRepositoryRoot(
                          repository.repositoryRoot,
                        );
                        setTargetWorkItemsRoot(
                          repository.workItemsRoot ?? "",
                        );
                      }}
                    />
                  ) : null}
                  <WorkbenchAction
                    label={
                      "Disconnect " +
                      (repository.projectId ?? repository.repositoryRoot)
                    }
                    tone="ghost"
                    loading={
                      disconnect.isPending &&
                      disconnect.variables === repository.repositoryRoot
                    }
                    disabled={disconnect.isPending}
                    onClick={() =>
                      setDisconnectRepositoryRoot(
                        repository.repositoryRoot,
                      )}
                  />
                </div>
              ),
            },
          }))}
        />
      ) : null}

      {readyProjects.length > 1 ? (
        <Selector
          label="Queue and creation context"
          options={[
            { value: "", label: "All ready repositories" },
            ...readyProjects.map((projectId) => ({
              value: projectId,
              label: projectId,
            })),
          ]}
          value={queueProjectId}
          onChange={onQueueProjectChange}
          width="100%"
        />
      ) : null}

      <section className="order-settings-configuration">
        <WorkbenchSectionHeader
          title="STAGE reference roots"
          description="Read-only context sources for productive stages. These never become target repositories."
        />
        <WorkbenchForm
          content={
            <TextArea
              label="Reference roots"
              description="One absolute read-only reference root per line."
              rows={4}
              value={referenceRootsText}
              onChange={setReferenceRootsText}
              width="100%"
            />
          }
          actions={
            <WorkbenchAction
              label="Save reference roots"
              tone="primary"
              loading={updateReferences.isPending}
              disabled={
                updateReferences.isPending ||
                configQuery.data === undefined
              }
              onClick={() => updateReferences.mutate()}
            />
          }
          feedback={
            updateReferences.error ? (
              <WorkbenchNotice
                tone="danger"
                title="Reference roots could not be saved"
                description={errorText(updateReferences.error)}
              />
            ) : undefined
          }
        />
      </section>

      <WorkbenchConfirmation
        kind="destructive"
        open={disconnectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDisconnectRepositoryRoot(null);
          }
        }}
        title="Disconnect repository?"
        description={
          disconnectTarget === null
            ? "Disconnect the selected repository."
            : "Disconnect " +
              (disconnectTarget.projectId ?? "this repository") +
              " at " +
              disconnectTarget.repositoryRoot +
              ". This removes only Order's connection. Repository files, WorkItem Markdown, Git history and authority documents are not deleted."
        }
        confirmLabel="Disconnect repository"
        pending={disconnect.isPending}
        onConfirm={() => {
          if (disconnectTarget !== null) {
            disconnect.mutate(disconnectTarget.repositoryRoot);
          }
        }}
      />
      {disconnect.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Repository disconnect failed"
          description={errorText(disconnect.error)}
        />
      ) : null}
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
  const configuredKey =
    configured === null ? "" : modelKey(configured);
  const configuredAvailable =
    configured === null ||
    availableModels.some(
      (model) => modelKey(model) === configuredKey,
    );
  const modelOptions = [
    { value: "", label: "No model configured" },
    ...(
      configured !== null && !configuredAvailable
        ? [{
            value: configuredKey,
            label: configured.providerID + "/" + configured.id,
          }]
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
  }, [configured?.providerID, configured?.id, configuredKey]);

  const updateModel = useMutation({
    mutationFn: () => {
      const config = configQuery.data;
      const model = (modelsQuery.data ?? []).find(
        (candidate) => modelKey(candidate) === selection,
      );
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
    <section className="order-settings-pane" data-testid="settings-model">
      <WorkbenchSectionHeader
        title="Model & runtime"
        description="Select the OpenCode model Order will use for productive agent work."
      />
      {modelsQuery.isPending ? (
        <WorkbenchState
          kind="loading"
          title="Loading available models…"
        />
      ) : null}
      {modelsQuery.error ? (
        <WorkbenchNotice
          tone="danger"
          title="Available models could not be loaded"
          description={errorText(modelsQuery.error)}
        />
      ) : null}
      {!modelsQuery.isPending &&
      modelsQuery.error == null &&
      configured !== null &&
      !configuredAvailable ? (
        <WorkbenchNotice
          tone="warning"
          title="Configured model is unavailable"
          description={
            configured.providerID +
            "/" +
            configured.id +
            " is not currently available. Select an available model and save to restore productive readiness."
          }
        />
      ) : null}
      <section className="order-settings-configuration">
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
                selection === configuredKey
              }
              onClick={() => updateModel.mutate()}
            />
          }
          feedback={
            updateModel.error ? (
              <WorkbenchNotice
                tone="danger"
                title="Model update failed"
                description={errorText(updateModel.error)}
              />
            ) : undefined
          }
        />
      </section>
    </section>
  );
};

const SettingsDiagnostics = ({
  section,
}: Readonly<{ section: SettingsSection }>) => {
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

  return section === "repositories" ? (
    <div className="order-settings-diagnostic-values">
      {configQuery.data ? (
        <p>
          Configuration SHA-256: <code>{configQuery.data.sha256}</code>
        </p>
      ) : null}
      {(repositoriesQuery.data ?? []).map((repository) => (
        <section key={repository.repositoryRoot}>
          <h3>
            {repository.projectId ?? "Repository requiring attention"}
          </h3>
          <p>
            Manifest SHA-256:{" "}
            <code>{repository.manifestSha256 ?? "Unavailable"}</code>
          </p>
          <p>
            Diagnostic state:{" "}
            <code>
              {repository.attention.join(", ") || "READY"}
            </code>
          </p>
        </section>
      ))}
    </div>
  ) : section === "opencode" ? (
    <div className="order-settings-diagnostic-values">
      <p>
        Active account id:{" "}
        <code>
          {accountStateQuery.data?.activeAccountId ?? "None"}
        </code>
      </p>
      {(accountStateQuery.data?.accounts ?? []).map((account) => (
        <section key={account.id}>
          <h3>{account.label}</h3>
          <p>
            Account id: <code>{account.id}</code>
          </p>
          <p>
            Status: <code>{account.status.status}</code>
          </p>
        </section>
      ))}
      <p>
        Mutation blockers:{" "}
        <code>
          {accountStateQuery.data?.mutationBlockers.join(", ") ||
            "None"}
        </code>
      </p>
    </div>
  ) : (
    <div className="order-settings-diagnostic-values">
      {configQuery.data ? (
        <p>
          Configuration SHA-256: <code>{configQuery.data.sha256}</code>
        </p>
      ) : null}
      <p>
        Model availability is loaded through the configured OpenCode
        account boundary.
      </p>
    </div>
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
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const readinessQuery = useQuery({
    queryKey: workbenchQueryKeys.settingsReadiness,
    queryFn: api.getInstallationReadiness,
  });

  useEffect(() => {
    setDiagnosticsOpen(false);
  }, [section]);

  const readiness = readinessQuery.isError ? (
    <WorkbenchNotice
      tone="danger"
      title="Settings readiness unavailable"
      description={errorText(readinessQuery.error)}
    />
  ) : readinessQuery.isPending ? (
    <WorkbenchState
      kind="loading"
      title="Checking installation readiness…"
    />
  ) : readinessQuery.data?.ready === true ? (
    <WorkbenchNotice
      tone="success"
      title="Ready for productive work"
      description="Required repository, account and model configuration is available."
    />
  ) : readinessQuery.data ? (
    <WorkbenchNotice
      tone="warning"
      title="Setup requires attention"
      description={
        <span>
          {readinessQuery.data.blockers.map((blocker, index) => (
            <span key={blocker}>
              {index > 0 ? " · " : ""}
              <Link
                href={
                  "/settings/" +
                  settingsDestinationForReadinessBlocker(blocker)
                }
                isStandalone
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(
                    settingsDestinationForReadinessBlocker(blocker),
                  );
                }}
              >
                {installationReadinessBlockerText(blocker)}
              </Link>
            </span>
          ))}
        </span>
      }
    />
  ) : null;

  const content =
    section === "repositories" ? (
      <RepositorySettings
        queueProjectId={queueProjectId}
        onQueueProjectChange={onQueueProjectChange}
      />
    ) : section === "opencode" ? (
      <OpenCodeAccountSettings />
    ) : (
      <ModelRuntimeSettings />
    );

  return (
    <div data-testid="settings-workspace" className="order-settings-screen">
      <header className="order-settings-heading">
        <h1>Settings</h1>
        <p>Installation configuration and readiness.</p>
      </header>
      <WorkbenchSettingsLayout
        navigation={
          <SettingsNavigation
            section={section}
            onNavigate={onNavigate}
          />
        }
        content={
          <div className="order-settings-primary">
            {readiness}
            {content}
            <section
              className="order-settings-inspection"
              aria-label="Settings diagnostics"
            >
              <WorkbenchSectionHeader
                title="Settings diagnostics"
                description="Inspect exact configuration and integration identity only when needed."
                action={
                  <WorkbenchAction
                    label={
                      diagnosticsOpen
                        ? "Hide settings diagnostics"
                        : "Inspect settings diagnostics"
                    }
                    ariaExpanded={diagnosticsOpen}
                    onClick={() =>
                      setDiagnosticsOpen((open) => !open)}
                  />
                }
              />
              {diagnosticsOpen ? (
                <div data-testid="settings-diagnostics">
                  <SettingsDiagnostics section={section} />
                </div>
              ) : null}
            </section>
          </div>
        }
      />
    </div>
  );
};
