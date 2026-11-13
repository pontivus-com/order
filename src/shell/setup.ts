import { existsSync, lstatSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";

import {
  type LegacyOrderConfigV2,
  type OrderConfig,
  type RepositoryPath,
  type WorkItemSourcePath,
} from "../core/contracts.ts";
import {
  duplicateWorkItemSourceIds,
  workItemDocumentPath,
} from "../core/work-item-source.ts";

import {
  buildOrderConfig,
  readOrderConfig,
  readOrderConfigForUpgradeIfPresent,
  readOrderConfigIfPresent,
  writeOrderConfig,
} from "./config.ts";
import {
  listAvailableOpenCodeModels,
  loginOpenCodeProviderInteractive,
} from "./opencode.ts";
import {
  loadConfiguredProjects,
  prepareProjectRootForInstall,
} from "./project.ts";
import {
  createWorkingTreeFileExclusive,
  readWorkingTreeFile,
} from "./repository.ts";
import { resolveStateRoot, sha256 } from "./runtime.ts";
import {
  migrateOrderDatabaseV2ToV3,
  readLegacyWorkItemRepositoryRootsForInstall,
  readOrderV2MigrationStateForInstall,
} from "./sqlite.ts";
import {
  readWorkItemArchived,
  scanLegacyV2WorkItemSourcesForInstall,
} from "./work-item-source.ts";

export type SetupQuestion = (prompt: string) => Promise<string>;

const byteEqual = (left: Uint8Array, right: Uint8Array): boolean => {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
};

export const readLegacyOrderConfigV2ForInstall = (
  stateRoot: string,
): LegacyOrderConfigV2 | null => {
  const config = readOrderConfigForUpgradeIfPresent(stateRoot);
  return config?.version === 2 ? config : null;
};

export const migrateRepositoryNativeV2StateForInstall = async (
  stateRoot: string,
  legacyConfig: LegacyOrderConfigV2,
): Promise<void> => {
  const currentConfig: OrderConfig = readOrderConfig(stateRoot);
  const projects = await loadConfiguredProjects(currentConfig.repositoryRoots);
  const projectById = new Map(
    projects.map((project) => [project.manifest.projectId, project] as const),
  );

  const legacySources = scanLegacyV2WorkItemSourcesForInstall(
    legacyConfig.workItemRoot,
  );
  const duplicateIds = duplicateWorkItemSourceIds(legacySources);
  if (duplicateIds.length !== 0) {
    throw new TypeError(
      "v2→v3 migration found duplicate WorkItem ids: " + duplicateIds.join(", "),
    );
  }
  const sourceById = new Map(
    legacySources.map((source) => [source.metadata.id, source] as const),
  );
  const migrationState = readOrderV2MigrationStateForInstall(stateRoot);
  const sourcePaths = new Map<string, WorkItemSourcePath>();
  const planned = new Map<string, Readonly<{
    repositoryRoot: string;
    repositoryPath: RepositoryPath;
    bytes: Uint8Array;
  }>>();

  const planCopy = (
    repositoryRoot: string,
    repositoryPath: RepositoryPath,
    bytes: Uint8Array,
  ): void => {
    const key = repositoryRoot + "\0" + repositoryPath;
    const prior = planned.get(key);
    if (prior !== undefined) {
      if (!byteEqual(prior.bytes, bytes)) {
        throw new TypeError(
          "v2→v3 migration maps different bytes to the same repository path: " +
            repositoryPath,
        );
      }
      return;
    }
    const target = join(repositoryRoot, repositoryPath);
    if (existsSync(target)) {
      const stat = lstatSync(target);
      if (stat.isSymbolicLink() || !stat.isFile()) {
        throw new TypeError(
          "v2→v3 migration destination is not a regular file: " + repositoryPath,
        );
      }
      if (!byteEqual(new Uint8Array(readFileSync(target)), bytes)) {
        throw new TypeError(
          "v2→v3 migration destination already exists with different bytes: " +
            repositoryPath,
        );
      }
    }
    planned.set(key, { repositoryRoot, repositoryPath, bytes });
  };

  for (const source of legacySources) {
    const project = projectById.get(source.metadata.projectId);
    if (project === undefined) {
      throw new TypeError(
        "v2→v3 migration cannot resolve projectId: " + source.metadata.projectId,
      );
    }
    planCopy(
      project.repositoryRoot,
      workItemDocumentPath(
        project.manifest.workItems.root,
        source.metadata.id,
        "SOURCE",
      ),
      new TextEncoder().encode(source.markdown),
    );
  }

  for (const [workItem, lifecycleArtifacts] of migrationState) {
    const source = sourceById.get(workItem.id);
    if (source === undefined) {
      throw new TypeError(
        "v2→v3 migration is missing persisted WorkItem source: " + workItem.id,
      );
    }
    if (
      source.path !== workItem.sourcePath ||
      source.sha256 !== workItem.sourceSha256 ||
      source.metadata.projectId !== workItem.projectId
    ) {
      throw new TypeError(
        "v2→v3 persisted WorkItem source projection is stale: " + workItem.id,
      );
    }

    const project = projectById.get(workItem.projectId);
    if (project === undefined) {
      throw new TypeError(
        "v2→v3 migration cannot resolve project for WorkItem: " + workItem.id,
      );
    }
    if (project.repositoryRoot !== workItem.repositoryRoot) {
      throw new TypeError(
        "v2→v3 migration repository does not match persisted WorkItem: " +
          workItem.id,
      );
    }

    const sourcePath = workItemDocumentPath(
      project.manifest.workItems.root,
      workItem.id,
      "SOURCE",
    );
    sourcePaths.set(workItem.id, sourcePath as WorkItemSourcePath);

    for (const artifact of lifecycleArtifacts) {
      if (
        artifact.role !== "R1" &&
        artifact.role !== "R2" &&
        artifact.role !== "DESIGN" &&
        artifact.role !== "PLAN" &&
        artifact.role !== "R3"
      ) {
        continue;
      }
      const bytes = readWorkingTreeFile(
        workItem.repositoryRoot,
        artifact.repositoryPath,
      );
      if (sha256(bytes) !== artifact.sha256) {
        throw new TypeError(
          "v2→v3 lifecycle source bytes differ from current ArtifactRef: " +
            artifact.repositoryPath,
        );
      }
      planCopy(
        project.repositoryRoot,
        workItemDocumentPath(
          project.manifest.workItems.root,
          workItem.id,
          artifact.role,
        ),
        bytes,
      );
    }
  }

  for (const copy of planned.values()) {
    const target = join(copy.repositoryRoot, copy.repositoryPath);
    if (!existsSync(target)) {
      createWorkingTreeFileExclusive(
        copy.repositoryRoot,
        copy.repositoryPath,
        copy.bytes,
      );
    }
    if (!byteEqual(readWorkingTreeFile(copy.repositoryRoot, copy.repositoryPath), copy.bytes)) {
      throw new TypeError(
        "v2→v3 repository copy failed read-back verification: " +
          copy.repositoryPath,
      );
    }
  }

  const archivedById = new Map<
    import("../core/contracts.ts").WorkItemId,
    boolean
  >();
  for (const [workItem] of migrationState) {
    const project = projectById.get(workItem.projectId);
    if (project === undefined) {
      throw new TypeError(
        "v2→v3 migration cannot resolve archive project for WorkItem: " +
          workItem.id,
      );
    }
    archivedById.set(
      workItem.id,
      readWorkItemArchived(
        project.repositoryRoot,
        project.manifest.workItems.root,
        workItem.id,
      ),
    );
  }

  migrateOrderDatabaseV2ToV3(
    stateRoot,
    sourcePaths as ReadonlyMap<
      import("../core/contracts.ts").WorkItemId,
      WorkItemSourcePath
    >,
    archivedById,
  );
};


const requireSetupHome = (environment: NodeJS.ProcessEnv): string => {
  const home = environment.HOME;
  if (home === undefined || home.length === 0 || !home.startsWith("/")) {
    throw new TypeError("HOME must be an absolute path for Order setup");
  }
  return home;
};

const collectAdditionalRoots = async (
  first: string,
  label: string,
  question: SetupQuestion,
): Promise<readonly string[]> => {
  const roots = [first];
  while (true) {
    const next = (await question("Add another " + label + " root (blank to continue): ")).trim();
    if (next.length === 0) return roots;
    roots.push(next);
  }
};

const pathIsWithin = (parent: string, candidate: string): boolean => {
  const child = relative(parent, candidate);
  return child === "" ||
    (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`));
};

const exactProjectRootForUpgrade = async (
  candidate: string,
  writeStdout: (value: string) => void,
  projectManifestCreated: (path: string) => void,
): Promise<string | null> => {
  const prepared = await prepareProjectRootForInstall(candidate);
  if (prepared === null) return null;
  const [repositoryRoot, createdManifestPath] = prepared;
  if (createdManifestPath !== null) {
    projectManifestCreated(createdManifestPath);
    writeStdout(
      "Order installer — created missing project manifest at " +
        createdManifestPath +
        " from existing repository identity" +
        (await Bun.file(repositoryRoot + "/AGENTS.md").exists() ? " and root AGENTS.md authority" : "") +
        ".\n",
    );
  }
  return repositoryRoot;
};

const legacyTargetRootsForUpgrade = async (
  stateRoot: string,
  configuredRoots: readonly string[],
  writeStdout: (value: string) => void,
  projectManifestCreated: (path: string) => void,
): Promise<readonly string[]> => {
  const observedRoots = readLegacyWorkItemRepositoryRootsForInstall(stateRoot);
  for (const observed of observedRoots) {
    if (!configuredRoots.some((configured) => pathIsWithin(configured, observed))) {
      throw new TypeError(
        "legacy WorkItem repository lies outside the persisted v1 target roots: " + observed,
      );
    }
  }

  const migrated = new Set<string>();
  for (const configured of configuredRoots) {
    const exact = await exactProjectRootForUpgrade(
      configured,
      writeStdout,
      projectManifestCreated,
    );
    if (exact !== null) migrated.add(exact);
  }
  for (const observed of observedRoots) {
    const exact = await exactProjectRootForUpgrade(
      observed,
      writeStdout,
      projectManifestCreated,
    );
    if (exact === null) return [];
    migrated.add(exact);
  }

  const roots = [...migrated].sort();
  if (roots.length > 0) await loadConfiguredProjects(roots);
  return roots;
};

const runGuidedSetupInternal = async (
  reconfigure: boolean,
  allowLegacyUpdate: boolean,
  environment: NodeJS.ProcessEnv,
  writeStdout: (value: string) => void,
  question: SetupQuestion,
  projectManifestCreated: (path: string) => void,
): Promise<number> => {
  const stateRoot = resolveStateRoot(environment);
  const home = requireSetupHome(environment);
  const configured = allowLegacyUpdate
    ? readOrderConfigForUpgradeIfPresent(stateRoot)
    : readOrderConfigIfPresent(stateRoot);

  let existing = configured?.version === 4 ? configured : null;
  let upgrading = false;

  if (allowLegacyUpdate && configured?.version === 1) {
    let repositoryRoots = await legacyTargetRootsForUpgrade(
      stateRoot,
      configured.repositoryRoots,
      writeStdout,
      projectManifestCreated,
    );

    if (repositoryRoots.length === 0) {
      writeStdout(
        "Order v1 target roots cannot be represented directly by the exact-repository contract.\n",
      );
      writeStdout(
        "Previous v1 target roots: " + configured.repositoryRoots.join(", ") + "\n",
      );
      const first = (
        await question("Exact target repository root for this update: ")
      ).trim();
      if (first.length === 0) {
        throw new TypeError(
          "an exact target repository root is required to upgrade legacy target-root configuration",
        );
      }
      repositoryRoots = await collectAdditionalRoots(
        first,
        "target repository",
        question,
      );
    }
    await loadConfiguredProjects(repositoryRoots);
    existing = buildOrderConfig(
      configured.model,
      repositoryRoots,
      configured.referenceRoots,
    );
    upgrading = true;
  } else if (allowLegacyUpdate && configured?.version === 2) {
    await loadConfiguredProjects(configured.repositoryRoots);
    existing = buildOrderConfig(
      configured.model,
      configured.repositoryRoots,
      configured.referenceRoots,
    );
    upgrading = true;
  }

  if (allowLegacyUpdate && configured?.version === 3) {
    existing = buildOrderConfig(
      configured.model,
      configured.repositoryRoots,
      configured.referenceRoots,
    );
    upgrading = true;
  }

  const workspace = existing?.repositoryRoots[0] ?? home;

  let models = existing === null
    ? []
    : await listAvailableOpenCodeModels(stateRoot, workspace, environment).catch(() => []);
  const existingModelIndex = existing?.model === null || existing?.model === undefined
    ? -1
    : models.findIndex((model) =>
        model.providerID === existing.model!.providerID && model.id === existing.model!.id
      );

  if (
    existing !== null &&
    existing.model !== null &&
    existing.repositoryRoots.length > 0 &&
    existingModelIndex >= 0 &&
    !reconfigure
  ) {
    await loadConfiguredProjects(existing.repositoryRoots);
    if (upgrading) {
      writeOrderConfig(stateRoot, existing);
      writeStdout(
        "Order configuration upgraded to version 4; existing provider/model/repository/reference choices retained.\n",
      );
    } else {
      writeStdout("Order configuration is already valid; existing choices retained.\n");
    }
    return 0;
  }

  if (models.length === 0) {
    const login = await loginOpenCodeProviderInteractive(
      stateRoot,
      workspace,
      environment,
    );
    if (login.cancelled) return 130;
    if (login.exitCode !== 0) return login.exitCode;
    models = await listAvailableOpenCodeModels(stateRoot, workspace, environment);
  }
  if (models.length === 0) {
    throw new TypeError("no enabled OpenCode models are available after provider authentication");
  }

  writeStdout("Available OpenCode models:\n");
  models.forEach((model, index) => {
    writeStdout("  " + (index + 1) + ". " + model.providerID + "/" + model.id + "\n");
  });
  const currentIndex = existing?.model === null || existing?.model === undefined
    ? -1
    : models.findIndex((model) =>
        model.providerID === existing.model!.providerID && model.id === existing.model!.id
      );
  const selectionPrompt = currentIndex >= 0
    ? "Select model [" + (currentIndex + 1) + "]: "
    : "Select model: ";
  const selectedText = (await question(selectionPrompt)).trim();
  const selectedIndex = selectedText.length === 0 && currentIndex >= 0
    ? currentIndex
    : Number(selectedText) - 1;
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= models.length) {
    throw new TypeError("model selection must be one listed number");
  }
  const selectedModel = models[selectedIndex]!;

  let repositoryRoots: readonly string[];
  let referenceRoots: readonly string[];
  if (existing !== null && !reconfigure) {
    repositoryRoots = existing.repositoryRoots;
    referenceRoots = existing.referenceRoots;
  } else if (existing !== null) {
    writeStdout("Current target repository roots: " + existing.repositoryRoots.join(", ") + "\n");
    const target = (await question("New first target root (blank keeps current roots): ")).trim();
    repositoryRoots = target.length === 0
      ? existing.repositoryRoots
      : await collectAdditionalRoots(target, "target repository", question);

    writeStdout(
      "Current STAGE reference roots: " + (existing.referenceRoots.join(", ") || "(none)") + "\n",
    );
    const reference = (
      await question("New first STAGE reference root (blank keeps current, '-' clears): ")
    ).trim();
    referenceRoots = reference.length === 0
      ? existing.referenceRoots
      : reference === "-"
        ? []
        : await collectAdditionalRoots(reference, "STAGE reference", question);
  } else {
    const target = (await question("Target repository root: ")).trim();
    if (target.length === 0) throw new TypeError("an exact target repository root is required");
    repositoryRoots = await collectAdditionalRoots(target, "target repository", question);
    const reference = (await question("STAGE reference root (blank for none): ")).trim();
    referenceRoots = reference.length === 0
      ? []
      : await collectAdditionalRoots(reference, "STAGE reference", question);
  }

  await loadConfiguredProjects(repositoryRoots);
  const config = buildOrderConfig(
    selectedModel,
    repositoryRoots,
    referenceRoots,
  );
  writeOrderConfig(stateRoot, config);
  writeStdout(
    upgrading
      ? "Order configuration upgraded to version 4.\n"
      : "Order configuration complete.\n",
  );
  return 0;
};

export const runGuidedSetup = async (
  reconfigure: boolean,
  environment: NodeJS.ProcessEnv,
  writeStdout: (value: string) => void,
  question: SetupQuestion,
): Promise<number> =>
  runGuidedSetupInternal(
    reconfigure,
    false,
    environment,
    writeStdout,
    question,
    () => {},
  );

export const runInstallerGuidedSetup = async (
  environment: NodeJS.ProcessEnv,
  writeStdout: (value: string) => void,
  question: SetupQuestion,
  projectManifestCreated: (path: string) => void = () => {},
): Promise<number> =>
  runGuidedSetupInternal(
    false,
    true,
    environment,
    writeStdout,
    question,
    projectManifestCreated,
  );
