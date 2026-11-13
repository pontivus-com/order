import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  InstallationReadinessSchema,
  OrderConfigSchema,
  type ConnectedRepositoryState,
  type ConnectRepository,
  type DisconnectRepository,
  type InstallationReadiness,
  type OpenCodeModelRef,
  type OrderConfig,
  type OrderConfigState,
  type UpdateConfiguredModel,
  type UpdateReferenceRoots,
} from "../core/contracts.ts";
import { canonicalAbsolutePathIsWithinRoot } from "../core/governance.ts";
import {
  proveConfiguredDirectoryRoots,
  readOrderConfigState,
  writeOrderConfigExpected,
} from "../shell/config.ts";
import {
  listAvailableOpenCodeModels,
} from "../shell/opencode.ts";
import {
  readValidatedProjectManifestSnapshot,
} from "../shell/project.ts";
import { proveRepositoryRoot } from "../shell/repository.ts";
import {
  loadRunsForWorkItem,
  loadWorkItems,
} from "../shell/sqlite.ts";
import {
  createCoordinatorRuntime,
  type CoordinatorRuntime,
} from "./runtime.ts";
import {
  reconcileSources,
  startCoordinatorScheduler,
  stopCoordinatorScheduler,
} from "./coordinator.ts";
import { openCodeAccountState } from "./opencode-account.ts";

export type CoordinatorRuntimeOwner = {
  current: CoordinatorRuntime;
  settingsMutationActive: boolean;
};

export const createCoordinatorRuntimeOwner = (
  current: CoordinatorRuntime,
): CoordinatorRuntimeOwner => ({
  current,
  settingsMutationActive: false,
});

const activeRunExists = (runtime: CoordinatorRuntime): boolean =>
  loadWorkItems(runtime.database).some((workItem) =>
    loadRunsForWorkItem(runtime.database, workItem.id)
      .some((run) => run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT")
  );

const repositoryState = async (
  repositoryRoot: string,
): Promise<ConnectedRepositoryState> => {
  if (!existsSync(repositoryRoot)) {
    return {
      repositoryRoot,
      status: "ATTENTION",
      projectId: null,
      workItemsRoot: null,
      manifestSha256: null,
      attention: ["REPOSITORY_UNAVAILABLE"],
    };
  }

  try {
    const proven = await proveRepositoryRoot(repositoryRoot);
    if (proven !== repositoryRoot) {
      return {
        repositoryRoot,
        status: "ATTENTION",
        projectId: null,
        workItemsRoot: null,
        manifestSha256: null,
        attention: ["REPOSITORY_IDENTITY_INVALID"],
      };
    }
  } catch {
    return {
      repositoryRoot,
      status: "ATTENTION",
      projectId: null,
      workItemsRoot: null,
      manifestSha256: null,
      attention: ["REPOSITORY_IDENTITY_INVALID"],
    };
  }

  const manifestPath = join(repositoryRoot, "pontivus-order.toml");
  if (!existsSync(manifestPath)) {
    return {
      repositoryRoot,
      status: "ATTENTION",
      projectId: null,
      workItemsRoot: null,
      manifestSha256: null,
      attention: ["PROJECT_MANIFEST_MISSING"],
    };
  }

  try {
    const snapshot = await readValidatedProjectManifestSnapshot(repositoryRoot);
    return {
      repositoryRoot,
      status: "READY",
      projectId: snapshot.manifest.projectId,
      workItemsRoot: snapshot.manifest.workItems.root,
      manifestSha256: snapshot.sha256,
      attention: [],
    };
  } catch (error) {
    const workItemsRootInvalid =
      typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues?: unknown }).issues) &&
      (error as { issues: readonly { path?: readonly PropertyKey[] }[] }).issues.some(
        (issue) => issue.path?.[0] === "workItems",
      );
    return {
      repositoryRoot,
      status: "ATTENTION",
      projectId: null,
      workItemsRoot: null,
      manifestSha256: null,
      attention: [workItemsRootInvalid ? "WORKITEM_ROOT_INVALID" : "PROJECT_MANIFEST_INVALID"],
    };
  }
};

export const connectedRepositoryStates = async (
  config: OrderConfig,
): Promise<readonly ConnectedRepositoryState[]> => {
  const states = await Promise.all(config.repositoryRoots.map(repositoryState));
  const counts = new Map<string, number>();
  for (const state of states) {
    if (state.status === "READY" && state.projectId !== null) {
      counts.set(state.projectId, (counts.get(state.projectId) ?? 0) + 1);
    }
  }
  return states.map((state) =>
    state.status === "READY" &&
      state.projectId !== null &&
      (counts.get(state.projectId) ?? 0) > 1
      ? {
          repositoryRoot: state.repositoryRoot,
          status: "ATTENTION" as const,
          projectId: null,
          workItemsRoot: null,
          manifestSha256: null,
          attention: ["PROJECT_MANIFEST_INVALID" as const],
        }
      : state
  );
};

export const readyRepositoryRoots = async (
  config: OrderConfig,
): Promise<readonly string[]> =>
  (await connectedRepositoryStates(config))
    .filter((state) => state.status === "READY")
    .map((state) => state.repositoryRoot);

const referenceRootsAreReady = (config: OrderConfig): boolean => {
  try {
    const proven = proveConfiguredDirectoryRoots(config.referenceRoots);
    return proven.length === config.referenceRoots.length &&
      config.referenceRoots.every((root) => proven.includes(root));
  } catch {
    return false;
  }
};

const modelWorkspace = (
  runtime: CoordinatorRuntime,
  readyRoots: readonly string[],
): string => readyRoots[0] ?? runtime.stateRoot;

export const availableOpenCodeModels = async (
  owner: CoordinatorRuntimeOwner,
): Promise<readonly OpenCodeModelRef[]> => {
  const runtime = owner.current;
  const roots = await readyRepositoryRoots(runtime.config);
  return listAvailableOpenCodeModels(
    runtime.stateRoot,
    modelWorkspace(runtime, roots),
    runtime.environment,
  );
};

export const installationReadiness = async (
  owner: CoordinatorRuntimeOwner,
): Promise<InstallationReadiness> => {
  const runtime = owner.current;
  const repositories = await connectedRepositoryStates(runtime.config);
  const readyRoots = repositories
    .filter((state) => state.status === "READY")
    .map((state) => state.repositoryRoot);
  const blockers: InstallationReadiness["blockers"][number][] = [];

  if (runtime.config.repositoryRoots.length === 0) {
    blockers.push("REPOSITORY_REQUIRED");
  } else if (repositories.some((state) => state.status === "ATTENTION")) {
    blockers.push("REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION");
  }

  if (!referenceRootsAreReady(runtime.config)) {
    blockers.push("REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION");
  }

  const accounts = await openCodeAccountState(runtime);
  const active = accounts.activeAccountId === null
    ? null
    : accounts.accounts.find((account) => account.id === accounts.activeAccountId) ?? null;
  const usableAccount = active?.status.status === "READY";

  if (!usableAccount) {
    blockers.push("OPENCODE_ACCOUNT_REQUIRED");
  }

  if (runtime.config.model === null) {
    blockers.push("MODEL_INVALID");
  } else if (usableAccount) {
    try {
      const models = await listAvailableOpenCodeModels(
        runtime.stateRoot,
        modelWorkspace(runtime, readyRoots),
        runtime.environment,
      );
      if (!models.some((model) =>
        model.providerID === runtime.config.model!.providerID &&
        model.id === runtime.config.model!.id
      )) {
        blockers.push("MODEL_INVALID");
      }
    } catch {
      blockers.push("MODEL_INVALID");
    }
  }

  return InstallationReadinessSchema.parse({
    ready: blockers.length === 0,
    blockers: [...new Set(blockers)],
  });
};

export const orderConfigState = (
  owner: CoordinatorRuntimeOwner,
): OrderConfigState => {
  if (owner.settingsMutationActive) {
    throw new TypeError("Settings configuration is currently changing");
  }
  const state = readOrderConfigState(owner.current.stateRoot);
  if (JSON.stringify(state.config) !== JSON.stringify(owner.current.config)) {
    throw new TypeError("persisted Order configuration differs from the active runtime");
  }
  return state;
};

const assertNoOverlap = (
  repositories: readonly string[],
  references: readonly string[],
): void => {
  for (const repository of repositories) {
    for (const reference of references) {
      if (
        canonicalAbsolutePathIsWithinRoot(repository, reference) ||
        canonicalAbsolutePathIsWithinRoot(reference, repository)
      ) {
        throw new TypeError(
          "target repository and STAGE reference root must remain path-disjoint",
        );
      }
    }
  }
};

const beginSettingsMutation = (
  owner: CoordinatorRuntimeOwner,
): CoordinatorRuntime => {
  const runtime = owner.current;
  if (owner.settingsMutationActive) {
    throw new TypeError("Settings configuration mutation is already active");
  }
  if (runtime.tickActive) {
    throw new TypeError("Settings configuration mutation is blocked while coordinator work is being admitted");
  }
  if (activeRunExists(runtime)) {
    throw new TypeError("Settings configuration mutation is blocked while an Order Run is active");
  }
  if (runtime.openCodeAccountLogin !== null) {
    throw new TypeError("Settings configuration mutation is blocked while OpenCode login is active");
  }
  if (runtime.openCodeAccountMutationActive) {
    throw new TypeError("Settings configuration mutation is blocked while OpenCode account state is changing");
  }
  owner.settingsMutationActive = true;
  return runtime;
};

const proposedRuntime = (
  current: CoordinatorRuntime,
  config: OrderConfig,
): CoordinatorRuntime => {
  const candidate = createCoordinatorRuntime(
    current.database,
    current.stateRoot,
    current.environment,
    config,
  );
  candidate.openCodeAccountLoginTerminal = current.openCodeAccountLoginTerminal;
  return candidate;
};

export type SettingsActivationResult = Readonly<{
  configState: OrderConfigState;
  readiness: InstallationReadiness;
}>;

const activateConfiguration = async (
  owner: CoordinatorRuntimeOwner,
  expectedConfigSha256: OrderConfigState["sha256"],
  proposed: OrderConfig,
): Promise<SettingsActivationResult> => {
  const oldRuntime = beginSettingsMutation(owner);
  const oldSchedulerStopped = oldRuntime.schedulerStopped;
  const oldState = readOrderConfigState(oldRuntime.stateRoot);
  let candidate: CoordinatorRuntime | null = null;
  let persisted: OrderConfigState | null = null;

  try {
    if (oldState.sha256 !== expectedConfigSha256) {
      throw new TypeError("Order configuration changed since it was loaded");
    }
    if (JSON.stringify(oldState.config) !== JSON.stringify(oldRuntime.config)) {
      throw new TypeError("persisted Order configuration differs from the active runtime");
    }

    const canonical = OrderConfigSchema.parse(proposed);
    const candidateRoots = await readyRepositoryRoots(canonical);

    await stopCoordinatorScheduler(oldRuntime);
    candidate = proposedRuntime(oldRuntime, canonical);
    candidate.schedulerStopped = true;
    await reconcileSources(candidate, candidateRoots);

    const write = writeOrderConfigExpected(
      oldRuntime.stateRoot,
      oldState.sha256,
      canonical,
    );
    if (write.tag === "STALE") {
      throw new TypeError("Order configuration changed during activation");
    }
    persisted = write.state;
    owner.current = candidate;

    const readiness = await installationReadiness(owner);
    if (readiness.ready) {
      await startCoordinatorScheduler(candidate);
    } else {
      candidate.schedulerStopped = true;
    }
    return { configState: persisted, readiness };
  } catch (error) {
    if (candidate !== null) {
      await stopCoordinatorScheduler(candidate).catch(() => undefined);
    }
    if (persisted !== null) {
      const restored = writeOrderConfigExpected(
        oldRuntime.stateRoot,
        persisted.sha256,
        oldState.config,
      );
      if (restored.tag !== "UPDATED") {
        throw new TypeError(
          "failed to restore Order configuration after activation failure",
          { cause: error },
        );
      }
    }
    owner.current = oldRuntime;
    const oldRoots = await readyRepositoryRoots(oldRuntime.config);
    await reconcileSources(oldRuntime, oldRoots).catch(() => undefined);
    if (oldSchedulerStopped) {
      oldRuntime.schedulerStopped = true;
    } else {
      await startCoordinatorScheduler(oldRuntime).catch(() => undefined);
    }
    throw error;
  } finally {
    owner.settingsMutationActive = false;
  }
};

export const connectRepository = async (
  owner: CoordinatorRuntimeOwner,
  input: ConnectRepository,
): Promise<SettingsActivationResult> => {
  const current = orderConfigState(owner);
  if (current.sha256 !== input.expectedConfigSha256) {
    throw new TypeError("Order configuration changed since it was loaded");
  }
  const proven = await proveRepositoryRoot(input.repositoryRoot);
  if (proven !== input.repositoryRoot) {
    throw new TypeError("connected repository must be supplied as its exact canonical Git root");
  }
  await readValidatedProjectManifestSnapshot(proven);
  if (current.config.repositoryRoots.includes(proven)) {
    throw new TypeError("repository is already connected");
  }
  assertNoOverlap([...current.config.repositoryRoots, proven], current.config.referenceRoots);
  return activateConfiguration(
    owner,
    input.expectedConfigSha256,
    OrderConfigSchema.parse({
      ...current.config,
      repositoryRoots: [...current.config.repositoryRoots, proven],
    }),
  );
};

export const disconnectRepository = async (
  owner: CoordinatorRuntimeOwner,
  input: DisconnectRepository,
): Promise<SettingsActivationResult> => {
  const current = orderConfigState(owner);
  if (current.sha256 !== input.expectedConfigSha256) {
    throw new TypeError("Order configuration changed since it was loaded");
  }
  if (!current.config.repositoryRoots.includes(input.repositoryRoot)) {
    throw new TypeError("configured repository does not exist");
  }
  return activateConfiguration(
    owner,
    input.expectedConfigSha256,
    OrderConfigSchema.parse({
      ...current.config,
      repositoryRoots: current.config.repositoryRoots
        .filter((root) => root !== input.repositoryRoot),
    }),
  );
};

export const updateConfiguredModel = async (
  owner: CoordinatorRuntimeOwner,
  input: UpdateConfiguredModel,
): Promise<SettingsActivationResult> => {
  const current = orderConfigState(owner);
  if (current.sha256 !== input.expectedConfigSha256) {
    throw new TypeError("Order configuration changed since it was loaded");
  }
  const models = await availableOpenCodeModels(owner);
  if (!models.some((model) =>
    model.providerID === input.model.providerID &&
    model.id === input.model.id
  )) {
    throw new TypeError("selected OpenCode model is not currently available");
  }
  return activateConfiguration(
    owner,
    input.expectedConfigSha256,
    OrderConfigSchema.parse({ ...current.config, model: input.model }),
  );
};

export const updateReferenceRoots = async (
  owner: CoordinatorRuntimeOwner,
  input: UpdateReferenceRoots,
): Promise<SettingsActivationResult> => {
  const current = orderConfigState(owner);
  if (current.sha256 !== input.expectedConfigSha256) {
    throw new TypeError("Order configuration changed since it was loaded");
  }
  const references = proveConfiguredDirectoryRoots(input.referenceRoots);
  assertNoOverlap(current.config.repositoryRoots, references);
  return activateConfiguration(
    owner,
    input.expectedConfigSha256,
    OrderConfigSchema.parse({ ...current.config, referenceRoots: references }),
  );
};

export const requireProductiveReadiness = async (
  owner: CoordinatorRuntimeOwner,
): Promise<void> => {
  if (owner.settingsMutationActive) {
    throw new TypeError("productive work is blocked while Settings configuration is changing");
  }
  const readiness = await installationReadiness(owner);
  if (!readiness.ready) {
    throw new TypeError(
      "productive work requires installation readiness: " + readiness.blockers.join(","),
    );
  }
};

export const resumeSchedulerForReadiness = async (
  owner: CoordinatorRuntimeOwner,
): Promise<void> => {
  const runtime = owner.current;
  const readiness = await installationReadiness(owner);
  if (!readiness.ready) {
    await stopCoordinatorScheduler(runtime);
    return;
  }
  if (runtime.schedulerStopped) {
    await startCoordinatorScheduler(runtime);
  } else if (runtime.schedulerTimer === null && !runtime.tickActive) {
    await startCoordinatorScheduler(runtime);
  }
};
