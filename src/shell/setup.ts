import { existsSync, lstatSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";

import {
  InstallationReadinessSchema,
  OrderConfigSchema,
  type InstallationReadiness,
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
  proveConfiguredDirectoryRoots,
  readInstallerConfigForUpgrade,
  type InstallerConfigPublication,
  type InstallerConfigSnapshot,
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
  type InstallerManifestCustody,
  type InstallerManifestEffects,
} from "./project.ts";
import {
  createWorkingTreeFileExclusive,
  readWorkingTreeFile,
} from "./repository.ts";
import { loadDaemonToken, resolveStateRoot, sha256 } from "./runtime.ts";
import {
  migrateOrderDatabaseV2ToV3,
  readLegacyWorkItemRepositoryRootsForInstall,
  readOrderV2MigrationStateForInstall,
} from "./sqlite.ts";
import {
  readWorkItemArchived,
  scanLegacyV2WorkItemSourcesForInstall,
} from "./work-item-source.ts";

// The installed setup boundary exposes the existing config owner’s rollback effects.
export { captureInstallerConfigSnapshot, releaseInstallerConfigSnapshot, restoreInstallerConfig, requireInstallerConfigPublication } from "./config.ts";
export type { InstallerConfigPublication, InstallerConfigSnapshot } from "./config.ts";
export { requireInstallerManifest, restoreInstallerManifest } from "./project.ts";
export type { InstallerManifestCustody, InstallerManifestEffects } from "./project.ts";

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
  snapshot: InstallerConfigSnapshot,
): LegacyOrderConfigV2 | null => {
  const config = readInstallerConfigForUpgrade(stateRoot, snapshot);
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
  projectManifestCreated: (custody: InstallerManifestCustody) => void,
  manifestEffects?: InstallerManifestEffects,
): Promise<string | null> => {
  const prepared = await prepareProjectRootForInstall(candidate, projectManifestCreated, manifestEffects);
  if (prepared === null) return null;
  const [repositoryRoot, createdManifestPath] = prepared;
  if (createdManifestPath !== null) {
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
  projectManifestCreated: (custody: InstallerManifestCustody) => void,
  onIncompleteDatabaseInspection: () => void,
  manifestEffects?: InstallerManifestEffects,
): Promise<readonly string[]> => {
  const observedRoots = readLegacyWorkItemRepositoryRootsForInstall(stateRoot, onIncompleteDatabaseInspection);
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
      manifestEffects,
    );
    if (exact !== null) migrated.add(exact);
  }
  for (const observed of observedRoots) {
    const exact = await exactProjectRootForUpgrade(
      observed,
      writeStdout,
      projectManifestCreated,
      manifestEffects,
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
  environment: NodeJS.ProcessEnv,
  writeStdout: (value: string) => void,
  question: SetupQuestion,
  projectManifestCreated: (custody: InstallerManifestCustody) => void,
  publication?: InstallerConfigPublication,
  established = false,
  onIncompleteDatabaseInspection: () => void = () => {},
  manifestEffects?: InstallerManifestEffects,
): Promise<number> => {
  const allowLegacyUpdate = publication !== undefined;
  const stateRoot = resolveStateRoot(environment);
  const home = requireSetupHome(environment);
  const configured = publication !== undefined
    ? readInstallerConfigForUpgrade(stateRoot, publication.snapshot)
    : readOrderConfigIfPresent(stateRoot);

  let existing = configured?.version === 4 ? configured : null;
  let upgrading = false;

  if (allowLegacyUpdate && configured?.version === 1) {
    let repositoryRoots = await legacyTargetRootsForUpgrade(
      stateRoot,
      configured.repositoryRoots,
      writeStdout,
      projectManifestCreated,
      onIncompleteDatabaseInspection,
      manifestEffects,
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
    existing = OrderConfigSchema.parse({ ...configured, version: 4 });
    upgrading = true;
  }

  if (publication !== undefined && established) {
    const retained = existing ?? OrderConfigSchema.parse({
      version: 4, model: null, repositoryRoots: [], referenceRoots: [],
    });
    writeOrderConfig(stateRoot, retained, publication);
    writeStdout(upgrading
      ? "Order configuration upgraded to version 4; existing provider/model/repository/reference choices retained.\n"
      : configured === null
        ? "Order configuration version 4 initialized for established recovery.\n"
        : "Order configuration version 4 retained unchanged.\n");
    if (retained.repositoryRoots.length === 0 || retained.model === null) {
      writeStdout("requires operator action: complete setup in browser Settings.\n");
    }
    return 0;
  }

  // Fresh or unproven installation must establish exact roots before provider work.
  let installerRoots: Pick<OrderConfig, "repositoryRoots" | "referenceRoots"> | null = null;
  const repairInstallerRoots = async (
    initial: Pick<OrderConfig, "repositoryRoots" | "referenceRoots">,
    askOptionalReference: boolean,
  ): Promise<Pick<OrderConfig, "repositoryRoots" | "referenceRoots">> => {
    const accepted: string[] = [];
    const repairRoots = async (roots: readonly string[], target: boolean): Promise<string[]> => {
      const result: string[] = [];
      const prove = async (path: string, retained: boolean): Promise<string> => {
        if (!isAbsolute(path)) throw new TypeError("configured root must be absolute");
        const exact = proveConfiguredDirectoryRoots([path])[0]!;
        if (retained && exact !== path) throw new TypeError("stored root identity changed");
        if ([stateRoot, ...accepted].some(root => pathIsWithin(root, exact) || pathIsWithin(exact, root))) {
          throw new TypeError("configured roots must remain path-disjoint");
        }
        if (target) await loadConfiguredProjects([exact]);
        return exact;
      };
      for (const root of roots) {
        let candidate = root;
        let retained = true;
        while (candidate !== "") {
          try {
            const exact = await prove(candidate, retained);
            result.push(exact);
            accepted.push(exact);
            break;
          } catch (error) {
            writeStdout("Root requires attention: " + candidate + ": " + String(error) + "\n");
            candidate = (await question("Replacement for " + root + " (blank removes): ")).trim();
            retained = false;
          }
        }
      }
      return result;
    };
    let repositoryRoots = await repairRoots(initial.repositoryRoots, true);
    while (repositoryRoots.length === 0) {
      const first = (await question("Target repository root: ")).trim();
      if (first === "") throw new TypeError("an exact target repository root is required");
      repositoryRoots = await repairRoots(await collectAdditionalRoots(first, "target repository", question), true);
    }
    let referenceRoots = await repairRoots(initial.referenceRoots, false);
    if (askOptionalReference && initial.referenceRoots.length === 0) {
      const first = (await question("STAGE reference root (blank for none): ")).trim();
      if (first !== "") referenceRoots = await repairRoots(await collectAdditionalRoots(first, "reference", question), false);
    }
    // Keep the exact paths admitted by repairRoots. Another prompt or
    // filesystem observation can invalidate an earlier choice; a live
    // builder here would silently adopt its new realpath before reproof.
    return {
      repositoryRoots: [...repositoryRoots].sort(),
      referenceRoots: [...referenceRoots].sort(),
    };
  };

  if (publication !== undefined) {
    installerRoots = await repairInstallerRoots(existing ?? { repositoryRoots: [], referenceRoots: [] }, true);
  }
  const reproveInstallerRoots = async (): Promise<boolean> => {
    if (installerRoots === null) return true;
    try {
      const roots = installerRoots;
      const pathsStillExact = (): boolean => {
        const exact = buildOrderConfig(null, roots.repositoryRoots, roots.referenceRoots);
        return JSON.stringify(exact.repositoryRoots) === JSON.stringify(roots.repositoryRoots) &&
          JSON.stringify(exact.referenceRoots) === JSON.stringify(roots.referenceRoots);
      };
      if (!pathsStillExact()) return false;
      await loadConfiguredProjects(roots.repositoryRoots);
      return pathsStillExact();
    } catch { return false; }
  };
  const repairStartupDrift = async (): Promise<boolean> => {
    if (installerRoots === null || await reproveInstallerRoots()) return false;
    writeStdout("Configured roots changed before provider startup; repair the exact roots.\n");
    installerRoots = await repairInstallerRoots(installerRoots, false);
    return true;
  };
  const providerOperation = async <T>(
    operation: (workspace: string) => Promise<T>,
    onProviderFailure?: () => T,
  ): Promise<T> => {
    for (;;) {
      // A correction can itself be invalidated while answering another
      // root question. Re-prove the complete repaired set before using it.
      while (await repairStartupDrift()) { /* repeat guided correction */ }
      const workspace = installerRoots?.repositoryRoots[0] ?? existing?.repositoryRoots[0] ?? home;
      try {
        return await operation(workspace);
      } catch (error) {
        if (await repairStartupDrift()) continue;
        if (onProviderFailure !== undefined) return onProviderFailure();
        throw error;
      }
    }
  };
  let models = existing === null
    ? []
    : await providerOperation(workspace => listAvailableOpenCodeModels(stateRoot, workspace, environment), () => []);
  if (installerRoots !== null && models.length > 0) {
    const choice = (await question("Retain saved OpenCode credentials or login again? [retain/login]: ")).trim().toLowerCase();
    if (choice === "login") models = [];
    else if (choice !== "" && choice !== "retain") throw new TypeError("choose retain or login");
  }
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
    !reconfigure && publication === undefined
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
    const login = await providerOperation(workspace => loginOpenCodeProviderInteractive(
      stateRoot,
      workspace,
      environment,
    ));
    if (login.cancelled) return 130;
    if (login.exitCode !== 0) return login.exitCode;
    models = await providerOperation(workspace => listAvailableOpenCodeModels(stateRoot, workspace, environment));
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
  if (installerRoots !== null) {
    if (!await reproveInstallerRoots()) {
      throw new TypeError("configured root identity changed after model selection; retry guided installation");
    }
    repositoryRoots = installerRoots.repositoryRoots;
    referenceRoots = installerRoots.referenceRoots;
  } else if (existing !== null && !reconfigure) {
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

  // Installer roots were just re-proven after model selection. Persist
  // those exact admitted paths through the existing stored-config writer;
  // do not run a second canonicalizing builder that could substitute them.
  if (installerRoots === null) await loadConfiguredProjects(repositoryRoots);
  const config = installerRoots === null
    ? buildOrderConfig(selectedModel, repositoryRoots, referenceRoots)
    : OrderConfigSchema.parse({
        version: 4, model: selectedModel, repositoryRoots, referenceRoots,
      });
  writeOrderConfig(stateRoot, config, publication);
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
    environment,
    writeStdout,
    question,
    () => {},
  );

export const runInstallerGuidedSetup = async (
  environment: NodeJS.ProcessEnv,
  writeStdout: (value: string) => void,
  question: SetupQuestion,
  established: boolean,
  publication: InstallerConfigPublication,
  projectManifestCreated: (custody: InstallerManifestCustody) => void,
  onIncompleteDatabaseInspection: () => void = () => {},
  manifestEffects?: InstallerManifestEffects,
): Promise<number> =>
  runGuidedSetupInternal(
    false,
    environment,
    writeStdout,
    question,
    projectManifestCreated,
    publication,
    established,
    onIncompleteDatabaseInspection,
    manifestEffects,
  );

const observeInstalledReadiness = async (
  environment: NodeJS.ProcessEnv,
): Promise<InstallationReadiness> => {
  // Credential transport is restricted to the exact installed loopback bind.
  const bind = environment.PONTIVUS_ORDER_BIND;
  if (bind === undefined || !/^(?:127\.0\.0\.1|\[::1\]):[0-9]+$/.test(bind)) {
    throw new TypeError("installed daemon bind is not a valid loopback endpoint");
  }
  try {
    const origin = new URL("http://" + bind);
    const token = loadDaemonToken(resolveStateRoot(environment));
    const response = await fetch(new URL("/api/settings/readiness", origin), {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      redirect: "error",
      signal: AbortSignal.timeout(180_000),
    });
    if (response.status !== 200) {
      await response.body?.cancel();
      throw new TypeError("readiness HTTP observation failed");
    }
    return InstallationReadinessSchema.parse(await response.json());
  } catch {
    // Never propagate a raw response, authorization header or transport detail.
    throw new TypeError("canonical installed readiness could not be confirmed");
  }
};

export const requireFreshInstallerReadiness = async (
  environment: NodeJS.ProcessEnv,
): Promise<void> => {
  const readiness = await observeInstalledReadiness(environment);
  if (!readiness.ready) {
    throw new TypeError("fresh installation is not productively ready: " +
      readiness.blockers.join(", ") + "; retry guided installation after correcting these blockers");
  }
};

export const reportEstablishedInstallerReadiness = async (
  environment: NodeJS.ProcessEnv,
  writeStdout: (value: string) => void,
): Promise<void> => {
  try {
    const readiness = await observeInstalledReadiness(environment);
    writeStdout(readiness.ready
      ? "Productive readiness confirmed.\n"
      : "Requires operator action in browser Settings: " + readiness.blockers.join(", ") + "\n");
  } catch {
    writeStdout("Productive readiness could not be confirmed; inspect browser Settings.\n");
  }
};
