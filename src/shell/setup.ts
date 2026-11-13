import { isAbsolute, relative, sep } from "node:path";

import {
  buildOrderConfig,
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
import { resolveStateRoot } from "./runtime.ts";
import { readLegacyWorkItemRepositoryRootsForInstall } from "./sqlite.ts";

export type SetupQuestion = (prompt: string) => Promise<string>;

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

  let existing = configured?.version === 3 ? configured : null;
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

  const workspace = existing?.repositoryRoots[0] ?? home;

  let models = existing === null
    ? []
    : await listAvailableOpenCodeModels(stateRoot, workspace, environment).catch(() => []);
  const existingModelIndex = existing === null
    ? -1
    : models.findIndex((model) =>
        model.providerID === existing.model.providerID && model.id === existing.model.id
      );

  if (existing !== null && existingModelIndex >= 0 && !reconfigure) {
    await loadConfiguredProjects(existing.repositoryRoots);
    if (upgrading) {
      writeOrderConfig(stateRoot, existing);
      writeStdout(
        "Order configuration upgraded to version 3; existing provider/model/repository/reference choices retained.\n",
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
  const currentIndex = existing === null
    ? -1
    : models.findIndex((model) =>
        model.providerID === existing.model.providerID && model.id === existing.model.id
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
      ? "Order configuration upgraded to version 3.\n"
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
