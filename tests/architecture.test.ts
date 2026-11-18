import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, matchesGlob, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx"]);

const repositoryPath = (absolutePath: string): string =>
  relative(repositoryRoot, absolutePath).replaceAll("\\", "/");

const collectProductionFiles = (relativeRoot: string): readonly string[] => {
  const absoluteRoot = join(repositoryRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  const files: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
        files.push(repositoryPath(absolute));
      }
    }
  };
  visit(absoluteRoot);
  return files.sort();
};

const productionFiles = [
  ...collectProductionFiles("src"),
  ...collectProductionFiles("ui/src"),
];

const sourceText = (path: string): string =>
  readFileSync(join(repositoryRoot, path), "utf8");

const importSpecifiers = (source: string): readonly string[] => {
  const specifiers: string[] = [];
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\s+["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = match[1];
      if (value !== undefined) specifiers.push(value);
    }
  }
  return specifiers;
};

type Layer = "core" | "shell" | "daemon" | "cli" | "installer" | "version" | "ui" | "other";

const layerOf = (path: string): Layer => {
  if (path.startsWith("src/core/")) return "core";
  if (path.startsWith("src/shell/")) return "shell";
  if (path.startsWith("src/daemon/")) return "daemon";
  if (path === "src/cli.ts") return "cli";
  if (path === "src/installer.ts") return "installer";
  if (path === "src/version.ts") return "version";
  if (path.startsWith("ui/src/")) return "ui";
  return "other";
};

const resolvedRepositoryImport = (
  sourcePath: string,
  specifier: string,
): string | null => {
  if (!specifier.startsWith(".")) return null;
  return repositoryPath(resolve(repositoryRoot, dirname(sourcePath), specifier));
};

describe("architecture fitness", () => {
  it("enforces the P4 dependency direction and explicit CLI shell exceptions", () => {
    const violations: string[] = [];

    for (const sourcePath of productionFiles) {
      const sourceLayer = layerOf(sourcePath);
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (targetPath === null) {
          if (specifier.startsWith("@astryxdesign/") && sourceLayer !== "ui") {
            violations.push(sourcePath + " imports Astryx outside the UI boundary: " + specifier);
          }
          if (
            sourceLayer === "ui" &&
            (
              specifier === "@stylexjs/stylex" ||
              specifier.startsWith("@astryxdesign/build") ||
              specifier.startsWith("@astryxdesign/cli") ||
              specifier.includes("RichTextEditor") ||
              specifier.includes("Lexical")
            )
          ) {
            violations.push(sourcePath + " imports prohibited UI implementation dependency: " + specifier);
          }
          continue;
        }
        const targetLayer = layerOf(targetPath);

        if (
          targetLayer === "version" &&
          sourceLayer !== "version" &&
          sourceLayer !== "cli" &&
          sourceLayer !== "daemon"
        ) {
          violations.push(`${sourcePath} -> ${targetPath}: package version may be consumed only by CLI/daemon`);
        }
        if (sourceLayer === "version" && targetLayer !== "other") {
          violations.push(`${sourcePath} -> ${targetPath}: version owner may depend only on package metadata`);
        }

        if (sourceLayer === "core" && targetLayer !== "core" && targetLayer !== "other") {
          violations.push(`${sourcePath} -> ${targetPath}: core may not depend on ${targetLayer}`);
        }
        if (sourceLayer === "shell" && ["daemon", "cli", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: shell may not depend on ${targetLayer}`);
        }
        if (sourceLayer === "daemon" && ["cli", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: daemon may not depend on ${targetLayer}`);
        }
        if (sourceLayer === "ui") {
          if (["shell", "daemon", "cli"].includes(targetLayer)) {
            violations.push(`${sourcePath} -> ${targetPath}: UI may not depend on ${targetLayer}`);
          }
          if (
            targetLayer === "core" &&
            !["src/core/contracts.ts", "src/core/lifecycle.ts"].includes(targetPath)
          ) {
            violations.push(
              `${sourcePath} -> ${targetPath}: UI may import only browser-safe canonical contracts or lifecycle policy from core`,
            );
          }
        }
        if (sourceLayer === "cli" && targetLayer === "shell") {
          if (!["src/shell/runtime.ts", "src/shell/opencode.ts", "src/shell/setup.ts"].includes(targetPath)) {
            violations.push(`${sourcePath} -> ${targetPath}: CLI shell dependency is not an authorized bootstrap/setup boundary`);
          }
        }
        if (sourceLayer === "cli" && ["core", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: CLI may not depend directly on ${targetLayer}`);
        }
        if (
          sourceLayer === "installer" &&
          targetLayer === "shell" &&
          ![
            "src/shell/setup.ts",
            "src/shell/runtime.ts",
            "src/shell/sqlite.ts",
          ].includes(targetPath)
        ) {
          violations.push(
            `${sourcePath} -> ${targetPath}: installer shell dependency is not an authorized setup/update boundary`,
          );
        }
        if (sourceLayer === "installer" && ["core", "daemon", "cli", "ui"].includes(targetLayer)) {
          violations.push(`${sourcePath} -> ${targetPath}: installer may not depend directly on ${targetLayer}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps the functional core free of effectful external dependencies", () => {
    const violations: string[] = [];
    for (const sourcePath of productionFiles.filter((path) => layerOf(path) === "core")) {
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        if (specifier.startsWith(".")) continue;
        if (sourcePath === "src/core/contracts.ts" && specifier === "zod") continue;
        violations.push(`${sourcePath} imports effect/external dependency ${specifier}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps concrete effect mechanics at their canonical owners", () => {
    const rules: readonly Readonly<{
      label: string;
      pattern: RegExp;
      owners: readonly string[];
    }>[] = [
      { label: "SQLite query", pattern: /\.query\s*\(/g, owners: ["src/shell/sqlite.ts"] },
      { label: "SQLite construction", pattern: /\bnew\s+Database\s*\(/g, owners: ["src/shell/sqlite.ts"] },
      { label: "process spawn", pattern: /\bBun\.spawn(?:Sync)?\s*\(/g, owners: ["src/shell/process.ts", "src/installer.ts"] },
      { label: "HTTP server", pattern: /\bBun\.serve\s*\(/g, owners: ["src/daemon/server.ts"] },
      { label: "TOML parse", pattern: /\bBun\.TOML\.parse\s*\(/g, owners: ["src/shell/project.ts"] },
    ];
    const violations: string[] = [];

    for (const sourcePath of productionFiles) {
      const source = sourceText(sourcePath);
      for (const rule of rules) {
        if (rule.pattern.test(source) && !rule.owners.includes(sourcePath)) {
          violations.push(`${rule.label} appears outside canonical owner: ${sourcePath}`);
        }
        rule.pattern.lastIndex = 0;
      }
    }

    expect(violations).toEqual([]);
  });

  it("prevents OOP/DTO/service architecture and unchecked strict-typing escape hatches", () => {
    const forbiddenSegments = [
      "/services/",
      "/repositories/",
      "/controllers/",
      "/interfaces/",
      "/providers/",
      "/adapters/",
      "/dto/",
      "/models/",
    ];
    const violations: string[] = [];

    for (const sourcePath of productionFiles) {
      const normalized = `/${sourcePath.toLowerCase()}`;
      for (const segment of forbiddenSegments) {
        if (normalized.includes(segment)) {
          violations.push(`forbidden architectural directory in ${sourcePath}: ${segment}`);
        }
      }

      const source = sourceText(sourcePath);
      if (/^\s*(?:export\s+)?(?:default\s+)?class\s+/m.test(source)) {
        violations.push(`Order-owned class declaration in ${sourcePath}`);
      }
      if (/\bas\s+unknown\s+as\b/.test(source)) {
        violations.push(`double assertion in ${sourcePath}`);
      }
      if (/\bas\s+any\b/.test(source)) {
        violations.push(`as any escape hatch in ${sourcePath}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("certifies the 0.2.2 productive-provider ownership and Workbench structural boundaries", () => {
    const contracts = sourceText("src/core/contracts.ts");
    const repository = sourceText("src/shell/repository.ts");
    const openCode = sourceText("src/shell/opencode.ts");
    const stage = sourceText("src/daemon/stage.ts");
    const execution = sourceText("src/daemon/execution.ts");
    const layout = sourceText("ui/src/primitives/WorkbenchLayout.tsx");
    const queue = sourceText("ui/src/WorkItemQueue.tsx");
    const documents = sourceText("ui/src/DocumentWorkspace.tsx");
    const activity = sourceText("ui/src/ActivityWorkspace.tsx");
    const settings = sourceText("ui/src/SettingsWorkspace.tsx");

    expect(stage).toContain("materializeStageInspectionWorkspace");
    expect(stage).toContain("admitProductiveOpenCode");
    expect(stage).not.toContain("startOpenCodeServer");
    expect(stage).not.toContain("createOpenCodeSession");
    expect(execution).toContain("admitProductiveOpenCode");
    expect(execution).not.toContain("startOpenCodeServer");
    expect(execution).not.toContain("createOpenCodeSession");

    expect(openCode).toContain("export const admitProductiveOpenCode");
    expect(openCode.match(/client\.session\.create\s*\(/g) ?? []).toHaveLength(1);
    expect(openCode).toContain("client.skill.list");
    expect(openCode).toContain("client.mcp.list");
    expect(openCode).toContain('resource: ".git"');
    expect(openCode).toContain('resource: ".git/*"');
    expect(openCode).not.toContain("session.instruction");
    expect(openCode).not.toContain("instruction.create");

    const stageMaterializer = repository.slice(
      repository.indexOf("export const materializeStageInspectionWorkspace"),
      repository.indexOf("export const replayAndVerifyCandidate"),
    );
    expect(stageMaterializer).toContain("captureCandidate");
    expect(stageMaterializer).toContain("createFreshCheckout");
    expect(stageMaterializer).toContain('"apply", "--binary", "-"');
    expect(stageMaterializer).not.toContain(".gitignore");
    for (const forbidden of ["node_modules", ".venv", "vendor/", "target/", "dist/"]) {
      expect(stageMaterializer).not.toContain(forbidden);
    }

    const configSchema = contracts.slice(
      contracts.indexOf("export const OrderConfigSchema"),
      contracts.indexOf("export type OrderConfig"),
    );
    expect(configSchema).not.toMatch(/\bskills?\b/i);
    expect(configSchema).not.toMatch(/\bmcp\b/i);

    expect(layout).toContain("wide && hasInspector && inspectorOpen");
    expect(settings).not.toContain("Connect target repository");
    expect(settings).toContain('label="Add repository"');
    expect(settings).toContain('title="Disconnect repository?"');
    expect(settings).not.toMatch(/onClick=\{\(\) => disconnect\.mutate/);

    expect(queue).toContain("workflowPresentation(item.stage).label");
    expect(queue).not.toContain("{item.stage}</");
    expect(documents).toContain("lifecycleArtifactLabel(selectedArtifact.role)");
    expect(documents).not.toContain("label={artifact.role}");
    expect(documents).not.toContain("@astryxdesign/core/TabList");
    expect(activity).toContain('data-testid="selected-run-header"');
    expect(activity).not.toContain('data-testid="activity-summary"');
  });

  it("keeps Zod canonical semantic ownership in core/contracts.ts", () => {
    const violations = productionFiles
      .filter((path) => path !== "src/core/contracts.ts")
      .filter((path) => importSpecifiers(sourceText(path)).includes("zod"))
      .map((path) => `non-canonical Zod owner: ${path}`);
    expect(violations).toEqual([]);
  });

  it("enforces the canonical core and daemon module ownership/dependency graph", () => {
    const files = new Set(productionFiles);
    const violations: string[] = [];

    const coreAllowed: Readonly<Record<string, readonly string[]>> = {
      "src/core/contracts.ts": [],
      "src/core/canonical.ts": ["src/core/contracts.ts"],
      "src/core/governance.ts": [
        "src/core/contracts.ts",
        "src/core/canonical.ts",
      ],
      "src/core/lifecycle.ts": ["src/core/contracts.ts"],
      "src/core/work-item-source.ts": ["src/core/contracts.ts"],
      "src/core/execution.ts": ["src/core/contracts.ts"],
    };

    const daemonAllowed: Readonly<Record<string, readonly string[]>> = {
      "src/daemon/runtime.ts": [],
      "src/daemon/run.ts": ["src/daemon/runtime.ts"],
      "src/daemon/authority.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/work-item-source.ts",
      ],
      "src/daemon/stage.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
      ],
      "src/daemon/validation.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
      ],
      "src/daemon/execution.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
        "src/daemon/validation.ts",
      ],
      "src/daemon/coordinator.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/execution.ts",
        "src/daemon/work-item-source.ts",
        "src/daemon/work-item-documentation.ts",
      ],
      "src/daemon/work-item-documentation.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/authority.ts",
      ],
      "src/daemon/work-item-source.ts": [
        "src/daemon/runtime.ts",
      ],
      "src/daemon/opencode-account.ts": [
        "src/daemon/runtime.ts",
      ],
      "src/daemon/settings.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/coordinator.ts",
        "src/daemon/opencode-account.ts",
      ],
      "src/daemon/server.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/coordinator.ts",
        "src/daemon/opencode-account.ts",
        "src/daemon/settings.ts",
      ],
    };

    for (const sourcePath of productionFiles.filter((path) => layerOf(path) === "core")) {
      const allowedTargets = coreAllowed[sourcePath];
      if (allowedTargets === undefined) {
        violations.push(
          `${sourcePath}: core module is not registered in the canonical dependency map`,
        );
        continue;
      }
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/core/") &&
          !allowedTargets.includes(targetPath)
        ) {
          violations.push(
            `${sourcePath} -> ${targetPath}: core dependency is not authorized`,
          );
        }
      }
    }

    for (const sourcePath of Object.keys(coreAllowed)) {
      if (!files.has(sourcePath)) {
        violations.push(`${sourcePath}: required canonical core owner is missing`);
      }
    }
    if (files.has("src/core/policy.ts")) {
      violations.push("src/core/policy.ts must remain absent");
    }

    for (const sourcePath of productionFiles.filter((path) => layerOf(path) === "daemon")) {
      const allowedTargets = daemonAllowed[sourcePath];
      if (allowedTargets === undefined) {
        violations.push(
          `${sourcePath}: daemon module is not registered in the canonical dependency map`,
        );
        continue;
      }
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/daemon/") &&
          !allowedTargets.includes(targetPath)
        ) {
          violations.push(
            `${sourcePath} -> ${targetPath}: daemon dependency is not authorized`,
          );
        }
      }
    }

    for (const sourcePath of Object.keys(daemonAllowed)) {
      if (!files.has(sourcePath)) {
        violations.push(`${sourcePath}: required canonical daemon owner is missing`);
      }
    }

    if (files.has("src/daemon/coordinator.ts")) {
      const coordinator = sourceText("src/daemon/coordinator.ts");
      for (const movedOwner of [
        "startStageRun",
        "computeSignoffPackage",
        "runRequiredGates",
        "executeReviewerRun",
        "executeMutatingRun",
        "appendRunEvent",
      ]) {
        const declaration = new RegExp(`^(?:export\\s+)?const\\s+${movedOwner}\\s*=`, "m");
        if (declaration.test(coordinator)) {
          violations.push(
            `src/daemon/coordinator.ts must not reclaim moved responsibility ${movedOwner}`,
          );
        }
      }
      if (/^const\s+byteEqual\s*=/m.test(coordinator)) {
        violations.push("src/daemon/coordinator.ts duplicates the runtime byteEqual owner");
      }
    }

    if (!files.has("src/installer.ts")) {
      violations.push("src/installer.ts: required productive installer owner is missing");
    }

    if (!files.has("src/shell/setup.ts")) {
      violations.push("src/shell/setup.ts: required guided setup shell owner is missing");
    }

    if (!files.has("src/shell/config.ts")) {
      violations.push("src/shell/config.ts: required productive configuration shell owner is missing");
    } else {
      for (const specifier of importSpecifiers(sourceText("src/shell/config.ts"))) {
        const targetPath = resolvedRepositoryImport("src/shell/config.ts", specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/shell/") &&
          targetPath !== "src/shell/runtime.ts"
        ) {
          violations.push(
            `src/shell/config.ts -> ${targetPath}: config shell may depend only on shell/runtime.ts within shell`,
          );
        }
      }
    }

    const fileWriteConsumers = productionFiles
      .filter((sourcePath) =>
        importSpecifiers(sourceText(sourcePath))
          .map((specifier) => resolvedRepositoryImport(sourcePath, specifier))
          .includes("src/shell/file-write.ts"),
      )
      .sort();
    expect(fileWriteConsumers).toEqual([
      "src/shell/repository.ts",
      "src/shell/work-item-source.ts",
    ]);

    const guardedWriter = sourceText("src/shell/file-write.ts");
    for (const requiredMechanic of [
      "O_EXCL",
      "O_NOFOLLOW",
      "fsyncSync",
      "renameSync",
      "replaceRegularFileExpectedHash",
      "createRegularFileExclusive",
    ]) {
      if (!guardedWriter.includes(requiredMechanic)) {
        violations.push(
          `src/shell/file-write.ts must retain guarded writer mechanic ${requiredMechanic}`,
        );
      }
    }
    const sourceFilesystem = sourceText("src/shell/work-item-source.ts");
    for (const forbiddenMechanic of ["fsyncSync", "renameSync", "O_EXCL", "O_NOFOLLOW"]) {
      if (sourceFilesystem.includes(forbiddenMechanic)) {
        violations.push(
          `src/shell/work-item-source.ts duplicates guarded writer mechanic ${forbiddenMechanic}`,
        );
      }
    }
    const repositoryShell = sourceText("src/shell/repository.ts");
    if (!repositoryShell.includes("replaceRegularFileExpectedHash")) {
      violations.push(
        "src/shell/repository.ts must route direct Markdown replacement through file-write.ts",
      );
    }

    const requiredShellOwners: Readonly<Record<string, readonly string[]>> = {
      "src/shell/file-write.ts": ["src/shell/runtime.ts"],
      "src/shell/work-item-source.ts": [
        "src/shell/file-write.ts",
        "src/shell/runtime.ts",
      ],
      "src/shell/project-config.ts": [
        "src/shell/project.ts",
        "src/shell/repository.ts",
        "src/shell/runtime.ts",
      ],
    };
    for (const [sourcePath, allowedTargets] of Object.entries(requiredShellOwners)) {
      if (!files.has(sourcePath)) {
        violations.push(`${sourcePath}: required source-backed shell owner is missing`);
        continue;
      }
      for (const specifier of importSpecifiers(sourceText(sourcePath))) {
        const targetPath = resolvedRepositoryImport(sourcePath, specifier);
        if (
          targetPath !== null &&
          targetPath.startsWith("src/shell/") &&
          !allowedTargets.includes(targetPath)
        ) {
          violations.push(`${sourcePath} -> ${targetPath}: shell dependency is not authorized`);
        }
      }
    }

    if (files.has("src/core/governance.ts")) {
      const governanceCore = sourceText("src/core/governance.ts");
      if (!governanceCore.includes("export const evaluateStageConformance")) {
        violations.push(
          "src/core/governance.ts must own evaluateStageConformance",
        );
      }
    }

    if (files.has("src/daemon/stage.ts")) {
      const stage = sourceText("src/daemon/stage.ts");
      for (const requiredConformanceOwner of [
        "evaluateStageConformance",
        "validateStageDocumentStructure",
        "authorityDispositionOwnerRefs",
        "parseSignedTaskBlockFromPlan",
      ]) {
        if (!stage.includes(requiredConformanceOwner)) {
          violations.push(
            `src/daemon/stage.ts must enforce ${requiredConformanceOwner} before lifecycle promotion`,
          );
        }
      }
    }

    if (files.has("src/core/work-item-source.ts")) {
      const workItemSourceCore = sourceText("src/core/work-item-source.ts");
      for (const requiredOwner of [
        "isUnsupportedWorkItemSchemaFailure",
        "defaultSchemaForKind",
        "classifyExistingWorkItemSource",
        "linkedRemediationIsAllowed",
        "r1CompletionIsAllowedForSchema",
        "unresolvedConcernIdsForProject",
        "validateStageDocumentStructure",
      ]) {
        if (!workItemSourceCore.includes(`export const ${requiredOwner}`)) {
          violations.push(
            `src/core/work-item-source.ts must own ${requiredOwner}`,
          );
        }
      }
    }
    if (files.has("src/core/lifecycle.ts")) {
      const lifecycle = sourceText("src/core/lifecycle.ts");
      if (lifecycle.includes("work-item-source")) {
        violations.push(
          "src/core/lifecycle.ts must receive schema-resolved policy as typed input rather than importing source policy",
        );
      }
      for (const duplicatedKind of ["\"CHANGE\"", "\"DEFECT\"", "\"INVESTIGATION\"", "\"AUDIT\""]) {
        if (lifecycle.includes(duplicatedKind)) {
          violations.push(
            `src/core/lifecycle.ts duplicates schema kind policy ${duplicatedKind}`,
          );
        }
      }
    }
    if (files.has("src/daemon/work-item-source.ts")) {
      const sourceOrchestration = sourceText("src/daemon/work-item-source.ts");
      for (const forbiddenOwner of [
        "const canReclassify",
        "const allowedR1",
        "\"change-v1\"",
        "\"defect-v1\"",
        "\"investigation-v1\"",
        "\"audit-v1\"",
        "includes(\"concern\")",
        "startsWith(\"UNSUPPORTED_SCHEMA",
      ]) {
        if (sourceOrchestration.includes(forbiddenOwner)) {
          violations.push(
            `src/daemon/work-item-source.ts duplicates functional-core source policy: ${forbiddenOwner}`,
          );
        }
      }
    }

    const requiredUiOwners = [
      "ui/src/WorkItemWorkspace.tsx",
      "ui/src/WorkflowStepFrame.tsx",
      "ui/src/PreSignoffStageWorkspace.tsx",
      "ui/src/ReadinessWorkspace.tsx",
      "ui/src/MarkdownEditor.tsx",
      "ui/src/MarkdownSourceEditor.tsx",
      "ui/src/markdown-source-formatting.ts",
      "ui/src/CreateWorkItem.tsx",
      "ui/src/WorkItemQueue.tsx",
      "ui/src/WorkItemContext.tsx",
      "ui/src/DocumentWorkspace.tsx",
      "ui/src/ActivityWorkspace.tsx",
      "ui/src/RunEventTimeline.tsx",
      "ui/src/SignoffReview.tsx",
      "ui/src/ExecutionWorkspace.tsx",
      "ui/src/EvidenceViewer.tsx",
      "ui/src/TerminalResult.tsx",
      "ui/src/workbench-presentation.ts",
      "ui/src/query-keys.ts",
      "ui/src/primitives/WorkbenchAction.tsx",
      "ui/src/primitives/WorkbenchIcon.tsx",
      "ui/src/primitives/WorkbenchLayout.tsx",
      "ui/src/primitives/WorkbenchResourceRow.tsx",
      "ui/src/primitives/WorkbenchToolbar.tsx",
    ] as const;

    const workflowStepFrame = sourceText("ui/src/WorkflowStepFrame.tsx");
    for (const forbidden of ["useQuery(", "useMutation(", "./http.ts", "../../src/core/"]) {
      if (workflowStepFrame.includes(forbidden)) {
        violations.push(
          "ui/src/WorkflowStepFrame.tsx must remain presentation-only: " + forbidden,
        );
      }
    }

    const workItemWorkspace = sourceText("ui/src/WorkItemWorkspace.tsx");
    for (const forbidden of ["WorkStageSchema.options.indexOf", "artifactIsDownstream"]) {
      if (workItemWorkspace.includes(forbidden)) {
        violations.push(
          "ui/src/WorkItemWorkspace.tsx must consume canonical lifecycle policy without re-ranking stages: " + forbidden,
        );
      }
    }

    const documentWorkspace = sourceText("ui/src/DocumentWorkspace.tsx");
    if (!documentWorkspace.includes("artifactDirectEditIsAllowed")) {
      violations.push(
        "ui/src/DocumentWorkspace.tsx must consume artifactDirectEditIsAllowed from the canonical lifecycle owner",
      );
    }

    const executionWorkspace = sourceText("ui/src/ExecutionWorkspace.tsx");
    for (const forbidden of ['"status" in value', 'as Run["status"]']) {
      if (executionWorkspace.includes(forbidden)) {
        violations.push(
          "ui/src/ExecutionWorkspace.tsx must consume canonical Run[] values without shape guessing: " + forbidden,
        );
      }
    }

    for (const sourcePath of requiredUiOwners) {
      if (!files.has(sourcePath)) {
        violations.push(sourcePath + ": required workbench UI owner is missing");
      }
    }

    for (const obsolete of [
      "ui/src/ExecutionInspector.tsx",
      "ui/src/primitives/DetailRow.tsx",
      "ui/src/primitives/InspectorContent.tsx",
      "ui/src/primitives/Panel.tsx",
      "ui/src/primitives/PanelQueue.tsx",
      "ui/src/primitives/PanelSection.tsx",
      "ui/src/primitives/WorkbenchChip.tsx",
      "ui/src/primitives/WorkbenchEmptyState.tsx",
      "ui/src/primitives/workbench-styles.ts",
    ]) {
      if (files.has(obsolete)) {
        violations.push(obsolete + ": obsolete inspector-centric primitive owner must be removed");
      }
    }

    if (files.has("ui/src/app.tsx")) {
      const application = sourceText("ui/src/app.tsx");
      for (const forbidden of ["MarkdownEditor", "ExecutionWorkspace", "lifecycleRoleRank"]) {
        const declaration = new RegExp("^(?:export\\\\s+)?const\\\\s+" + forbidden + "\\\\s*=", "m");
        if (declaration.test(application)) {
          violations.push("ui/src/app.tsx must not reclaim " + forbidden + " responsibility");
        }
      }
    }

    if (files.has("src/shell/sqlite.ts")) {
      const sqlite = sourceText("src/shell/sqlite.ts");
      if (/order-tasks/.test(sqlite) || /SignedTaskBlockSchema/.test(sqlite)) {
        violations.push("src/shell/sqlite.ts must not own signed PLAN task-block parsing");
      }
      if (/\b(?:String|Number)\s*\(\s*queryScalar\s*\(/.test(sqlite)) {
        violations.push(
          "src/shell/sqlite.ts coerces unknown scalar ingress instead of narrowing it",
        );
      }
    }

    expect(violations).toEqual([]);
  });
  it("enforces typed, acyclic and cohesive UI presentation ownership", () => {
    const violations: string[] = [];
    const uiFiles = productionFiles.filter((path) => path.startsWith("ui/src/"));
    const uiFileSet = new Set(uiFiles);

    const substantiveOwners = new Set([
      "ui/src/CreateWorkItem.tsx",
      "ui/src/DocumentWorkspace.tsx",
      "ui/src/EvidenceViewer.tsx",
      "ui/src/ExecutionWorkspace.tsx",
      "ui/src/MarkdownEditor.tsx",
      "ui/src/MarkdownSourceEditor.tsx",
      "ui/src/ProposalReview.tsx",
      "ui/src/PreSignoffStageWorkspace.tsx",
      "ui/src/ReadinessWorkspace.tsx",
      "ui/src/SignoffReview.tsx",
      "ui/src/ProposalReview.tsx",
      "ui/src/ActivityWorkspace.tsx",
      "ui/src/RunEventTimeline.tsx",
      "ui/src/TerminalResult.tsx",
      "ui/src/WorkItemContext.tsx",
      "ui/src/WorkItemQueue.tsx",
    ]);

    const allowedSubstantiveDependencies: Readonly<Record<string, readonly string[]>> = {
      "ui/src/DocumentWorkspace.tsx": ["ui/src/MarkdownEditor.tsx"],
      "ui/src/MarkdownEditor.tsx": ["ui/src/MarkdownSourceEditor.tsx"],
      "ui/src/ActivityWorkspace.tsx": ["ui/src/RunEventTimeline.tsx"],
      "ui/src/PreSignoffStageWorkspace.tsx": [
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/EvidenceViewer.tsx",
      ],
      "ui/src/ReadinessWorkspace.tsx": [
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/EvidenceViewer.tsx",
      ],
      "ui/src/SignoffReview.tsx": ["ui/src/DocumentWorkspace.tsx"],
      "ui/src/ExecutionWorkspace.tsx": [
        "ui/src/RunEventTimeline.tsx",
        "ui/src/EvidenceViewer.tsx",
      ],
    };

    const localUiDependencies = new Map<string, readonly string[]>();
    const codeMirrorPackages = new Set([
      "codemirror",
      "@codemirror/commands",
      "@codemirror/lang-markdown",
      "@codemirror/language",
      "@codemirror/state",
      "@lezer/highlight",
    ]);

    for (const sourcePath of uiFiles) {
      const source = sourceText(sourcePath);
      for (const line of source.split(/\r?\n/)) {
        if (
          /:\s*any\b|<any>|\bas\s+any\b|\bany\[\]|(?:Array|ReadonlyArray)<any>/.test(line)
        ) {
          violations.push(sourcePath + ": UI production code must not use any");
        }
        if (
          !/^\s*import\b/.test(line) &&
          /\bas\s+(?!const\b)[A-Za-z_{[(]/.test(line)
        ) {
          violations.push(
            sourcePath + ": unchecked UI type assertion is prohibited: " + line.trim(),
          );
        }
        if (
          /\b(?:type|interface)\s+[A-Za-z0-9_$]*(?:DTO|Dto|ViewModel)\b/.test(line)
        ) {
          violations.push(
            sourcePath + ": UI must not introduce DTO/view-model semantic copies: " + line.trim(),
          );
        }
      }

      if (sourcePath !== "ui/src/http.ts" && /\bfetch\s*\(/.test(source)) {
        violations.push(sourcePath + ": browser transport must remain owned by ui/src/http.ts");
      }
      if (
        substantiveOwners.has(sourcePath) &&
        !new Set([
          "ui/src/ActivityWorkspace.tsx",
          "ui/src/ExecutionWorkspace.tsx",
          "ui/src/WorkItemQueue.tsx",
        ]).has(sourcePath) &&
        /<button\b/.test(source)
      ) {
        violations.push(
          sourcePath +
          ": substantive actions must use the shared workbench action grammar; native buttons are reserved for selectable task/run/queue rows",
        );
      }


      for (const specifier of importSpecifiers(source)) {
        if (/^(?:zustand|redux|@reduxjs\/|jotai|mobx)(?:\/|$)/.test(specifier)) {
          violations.push(sourcePath + ": second UI state-store dependency is prohibited: " + specifier);
        }
        if (
          codeMirrorPackages.has(specifier) &&
          sourcePath !== "ui/src/MarkdownSourceEditor.tsx"
        ) {
          violations.push(
            sourcePath + ": CodeMirror production imports must remain isolated to ui/src/MarkdownSourceEditor.tsx: " + specifier,
          );
        }
      }

      const dependencies = importSpecifiers(source)
        .map((specifier) => resolvedRepositoryImport(sourcePath, specifier))
        .filter((targetPath): targetPath is string =>
          targetPath !== null && targetPath.startsWith("ui/src/") && uiFileSet.has(targetPath),
        );
      localUiDependencies.set(sourcePath, dependencies);

      if (sourcePath.startsWith("ui/src/primitives/")) {
        for (const targetPath of dependencies) {
          if (
            substantiveOwners.has(targetPath) ||
            targetPath === "ui/src/app.tsx" ||
            targetPath === "ui/src/WorkItemWorkspace.tsx" ||
            targetPath === "ui/src/http.ts"
          ) {
            violations.push(
              sourcePath + " -> " + targetPath +
              ": primitive boundary must not depend on substantive workspace/application owners",
            );
          }
        }
      }

      if (substantiveOwners.has(sourcePath)) {
        const allowed = new Set(allowedSubstantiveDependencies[sourcePath] ?? []);
        for (const targetPath of dependencies) {
          if (substantiveOwners.has(targetPath) && !allowed.has(targetPath)) {
            violations.push(
              sourcePath + " -> " + targetPath +
              ": substantive workspace siblings must coordinate through the composition boundary",
            );
          }
        }
      }
    }

    const sourceEditor = sourceText("ui/src/MarkdownSourceEditor.tsx");
    for (const required of [
      'from "codemirror"',
      'from "@codemirror/lang-markdown"',
      'from "@codemirror/language"',
      'from "@codemirror/commands"',
      'from "@codemirror/state"',
      'from "@lezer/highlight"',
      "applyMarkdownFormat",
      "EditorView.updateListener",
    ]) {
      if (!sourceEditor.includes(required)) {
        violations.push(
          "ui/src/MarkdownSourceEditor.tsx must own CodeMirror source-editor mechanic " + required,
        );
      }
    }

    const formattingOwner = sourceText("ui/src/markdown-source-formatting.ts");
    for (const forbiddenImport of [
      "react",
      "codemirror",
      "@codemirror/",
      "@astryxdesign/",
      "@tanstack/",
      "./http",
      "../../src/core/",
    ]) {
      if (formattingOwner.includes("from \"" + forbiddenImport)) {
        violations.push(
          "ui/src/markdown-source-formatting.ts must remain a pure source-transform owner: " + forbiddenImport,
        );
      }
    }

    const queryKeyOwner = sourceText("ui/src/query-keys.ts");
    for (const requiredOwner of [
      "export const workbenchQueryKeys",
      "workItems:",
      "runs:",
      "runEvents:",
      "artifactContent:",
      "evidence:",
    ]) {
      if (!queryKeyOwner.includes(requiredOwner)) {
        violations.push(
          "ui/src/query-keys.ts must own shared typed query identity " + requiredOwner,
        );
      }
    }

    for (const sourcePath of uiFiles.filter((path) => path !== "ui/src/query-keys.ts")) {
      const source = sourceText(sourcePath);
      if (/queryKey:\s*\[\s*["']/.test(source)) {
        violations.push(
          sourcePath + ": TanStack query identity must use ui/src/query-keys.ts",
        );
      }
      if (/invalidateQueries\(\{\s*queryKey:\s*\[\s*["']/.test(source)) {
        violations.push(
          sourcePath + ": query invalidation identity must use ui/src/query-keys.ts",
        );
      }
    }

    const presentationPolicy = sourceText("ui/src/workbench-presentation.ts");
    for (const requiredOwner of [
      "export type WorkflowMaterial",
      "export type EvidenceSelection",
      "export const workflowStepState",
      "export const resolveWorkflowMaterial",
      "export const runIsActive",
      "export const runEventPresentation",
      "export const proposalDispositionFor",
      "export const lifecycleArtifactRoleRank",
    ]) {
      if (!presentationPolicy.includes(requiredOwner)) {
        violations.push(
          "ui/src/workbench-presentation.ts must own shared typed presentation rule " + requiredOwner,
        );
      }
    }

    const workItemChrome = sourceText("ui/src/WorkItemWorkspace.tsx");
    const documentChrome = sourceText("ui/src/DocumentWorkspace.tsx");
    const markdownChrome = sourceText("ui/src/MarkdownEditor.tsx");
    const applicationChrome = sourceText("ui/src/app.tsx");
    const themeStyles = sourceText("ui/src/theme.css");
    for (const [owner, source, forbidden] of [
      ["WorkItemWorkspace", workItemChrome, "order-workflow-orientation"],
      ["DocumentWorkspace", documentChrome, "order-document-state-strip"],
      ["MarkdownEditor", markdownChrome, "order-editor-actionbar"],
      ["app", applicationChrome, 'aria-label="Theme"'],
      ["theme.css", themeStyles, "order-workflow-orientation"],
      ["theme.css", themeStyles, "order-document-state-strip"],
      ["theme.css", themeStyles, "order-editor-actionbar"],
      ["theme.css", themeStyles, "order-theme-control select"],
    ] as const) {
      if (source.includes(forbidden)) {
        violations.push(
          owner + ": superseded T06 chrome must not remain: " + forbidden,
        );
      }
    }
    for (const required of ["workflowStepState", "resolveWorkflowMaterial"]) {
      if (!workItemChrome.includes(required)) {
        violations.push(
          "ui/src/WorkItemWorkspace.tsx must use the workflow-step presentation owner: " + required,
        );
      }
    }
    for (const forbidden of [
      "workspace-view-selector",
      "SegmentedControlItem",
      "visibleModes",
      "workItemInitialMode",
      "workflowInspectionTarget",
      "returnMode",
    ]) {
      if (workItemChrome.includes(forbidden)) {
        violations.push(
          "ui/src/WorkItemWorkspace.tsx must not retain superseded global mode navigation: " + forbidden,
        );
      }
    }
    if (!markdownChrome.includes("toolbarAccessory")) {
      violations.push(
        "ui/src/MarkdownEditor.tsx must expose the narrow document-control slot",
      );
    }

    for (const sourcePath of uiFiles.filter((path) => path !== "ui/src/workbench-presentation.ts")) {
      const source = sourceText(sourcePath);
      if (/new Set<Run\["status"\]>\(\["RUNNING", "WAITING_FOR_INPUT"\]\)/.test(source)) {
        violations.push(
          sourcePath + ": active Run classification must use the shared presentation owner",
        );
      }
      if (
        sourcePath === "ui/src/EvidenceViewer.tsx" &&
        /export\s+(?:type|interface)\s+EvidenceSelection\b/.test(source)
      ) {
        violations.push(
          sourcePath + ": presentation selection types must remain owned by workbench-presentation.ts",
        );
      }
      if (/\bconst\s+proposalDisposition\s*=/.test(source)) {
        violations.push(
          sourcePath + ": proposal disposition projection must use the shared presentation owner",
        );
      }
      if (/\bconst\s+roleOrder\s*:/.test(source)) {
        violations.push(
          sourcePath + ": lifecycle artifact ordering must use the shared presentation owner",
        );
      }
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visitDependency = (sourcePath: string, stack: readonly string[]): void => {
      if (visiting.has(sourcePath)) {
        violations.push(
          "UI dependency cycle: " + [...stack, sourcePath].join(" -> "),
        );
        return;
      }
      if (visited.has(sourcePath)) return;
      visiting.add(sourcePath);
      for (const targetPath of localUiDependencies.get(sourcePath) ?? []) {
        visitDependency(targetPath, [...stack, sourcePath]);
      }
      visiting.delete(sourcePath);
      visited.add(sourcePath);
    };
    for (const sourcePath of uiFiles) visitDependency(sourcePath, []);

    expect(violations).toEqual([]);
  });

  it("locks the 0.2.1 Settings, source-authoring and workbench owner boundaries", () => {
    const runtime = sourceText("src/daemon/runtime.ts");
    const config = sourceText("src/shell/config.ts");
    const projectConfig = sourceText("src/shell/project-config.ts");
    const accountUtility = sourceText("ui/src/OpenCodeAccountControl.tsx");
    const accountSettings = sourceText("ui/src/OpenCodeAccountSettings.tsx");
    const documentWorkspace = sourceText("ui/src/DocumentWorkspace.tsx");
    const application = sourceText("ui/src/app.tsx");
    const theme = sourceText("ui/src/theme.css");

    expect(runtime).toContain("readonly config: OrderConfig");
    expect(config).toContain("export const writeOrderConfig");
    expect(config).toContain("export const writeOrderConfigExpected");

    expect(projectConfig).toContain("mutateWorkItemsRootText");
    expect(projectConfig).toContain("activateWorkItemsRootManifest");
    expect(projectConfig).toContain("rollbackWorkItemsRootMigration");

    expect(accountUtility).toContain("useQuery");
    expect(accountUtility).not.toContain("useMutation");
    expect(accountUtility).not.toContain("api.activateOpenCodeAccount");
    expect(accountUtility).not.toContain("api.renameOpenCodeAccount");
    expect(accountUtility).not.toContain("api.removeOpenCodeAccount");
    for (const requiredMutation of [
      "api.activateOpenCodeAccount",
      "api.renameOpenCodeAccount",
      "api.removeOpenCodeAccount",
      "api.startOpenCodeAccountLogin",
    ]) {
      expect(accountSettings).toContain(requiredMutation);
    }

    expect(documentWorkspace).not.toContain("parseWorkItemSourceMarkdown");
    expect(documentWorkspace).not.toContain("recomposeWorkItemSourceBody");
    expect(documentWorkspace).toContain("api.saveWorkItemSourceBody");

    expect(application).not.toMatch(/<select[^>]*aria-label=["']Theme["']/);
    expect(theme).not.toContain("order-theme-control select");
    expect(theme).not.toContain("order-workflow-orientation");
    expect(theme).not.toContain("order-document-state-strip");
    expect(theme).not.toContain("order-editor-actionbar");

    const ownershipViolations: string[] = [];
    for (const sourcePath of productionFiles) {
      const source = sourceText(sourcePath);
      if (
        sourcePath !== "src/shell/config.ts" &&
        sourcePath !== "src/installer.ts" &&
        /statePaths\([^)]*\)\.config/.test(source)
      ) {
        ownershipViolations.push(
          sourcePath + ": productive config.json path access must remain owned by src/shell/config.ts",
        );
      }
      if (/\b(?:runtime|owner\.current)\.config\s*=(?!=)/.test(source)) {
        ownershipViolations.push(sourcePath + ": CoordinatorRuntime.config must never be reassigned");
      }
      if (/\.config\.(?:model|repositoryRoots|referenceRoots)\s*=(?!=)/.test(source)) {
        ownershipViolations.push(sourcePath + ": canonical runtime config fields must never be mutated in place");
      }
      if (
        /\.config\.(?:repositoryRoots|referenceRoots)\.(?:copyWithin|fill|pop|push|reverse|shift|sort|splice|unshift)\s*\(/.test(source)
      ) {
        ownershipViolations.push(sourcePath + ": canonical runtime config arrays must remain immutable snapshots");
      }

      if (layerOf(sourcePath) === "ui") {
        if (/\b(?:settings|config)(?:Store|Context|Reducer)\b/i.test(source)) {
          ownershipViolations.push(sourcePath + ": browser configuration must not introduce a global store owner");
        }
        for (const forbidden of [
          "parseWorkItemSourceMarkdown",
          "recomposeWorkItemSourceBody",
          "WorkItemSourceMetadataSchema",
        ]) {
          if (source.includes(forbidden)) {
            ownershipViolations.push(
              sourcePath + ": browser must not parse or recompose WorkItem source metadata: " + forbidden,
            );
          }
        }
      }
    }

    for (const required of [
      "statePaths(stateRoot).config",
      "O_NOFOLLOW",
      "fsyncSync",
      "renameSync",
    ]) {
      if (!config.includes(required)) {
        ownershipViolations.push("src/shell/config.ts must retain canonical config writer mechanic " + required);
      }
    }
    if (/api\.saveWorkItemSource\s*\(/.test(documentWorkspace)) {
      ownershipViolations.push("ordinary Source authoring must not retain the complete-source save path");
    }

    expect(ownershipViolations).toEqual([]);
  });

  it("enforces canonical documentation concern ownership and identifier references", () => {
    const violations: string[] = [];
    const docsDirectory = join(repositoryRoot, "docs");
    const documentationFiles: string[] = [];
    const visitDocumentation = (directory: string): void => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const absolute = join(directory, entry.name);
        const path = repositoryPath(absolute);
        if (entry.isDirectory()) {
          if (path === "docs/order/work-items" || path.startsWith("docs/order/work-items/")) {
            continue;
          }
          visitDocumentation(absolute);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          documentationFiles.push(path);
        }
      }
    };
    visitDocumentation(docsDirectory);

    const activeDocumentationFiles = ["AGENTS.md", ...documentationFiles].sort();

    for (const path of activeDocumentationFiles) {
      if (path !== "AGENTS.md" && path !== "docs/README.md" && /(?:^|\/)\d+-[^/]+\.md$/.test(path)) {
        violations.push(`${path}: canonical documentation filenames must be semantic, not ordinal-prefixed`);
      }
    }

    type ConcernMetadata = Readonly<{
      path: string;
      stableId: string;
      versionedId: string;
    }>;

    const concernByPath = new Map<string, ConcernMetadata>();
    const currentOwnerByStable = new Map<string, string>();
    const seenVersioned = new Map<string, string>();
    const retainedSemanticVersionPath = (path: string): boolean =>
      /\.v[0-9]+\.md$/.test(path);

    for (const path of activeDocumentationFiles) {
      const source = sourceText(path);
      const stable = source.match(/^\*\*Canonical concern ID:\*\* `([A-Z0-9-]+)`/m)?.[1];
      const versioned = source.match(/^\*\*Versioned concern ID:\*\* `([A-Z0-9-]+)`/m)?.[1];

      if ((stable === undefined) !== (versioned === undefined)) {
        violations.push(`${path}: canonical concern metadata must declare both stable and versioned ids`);
        continue;
      }
      if (stable === undefined || versioned === undefined) continue;

      if (!/^GW-DOC-[A-Z0-9-]+$/.test(stable)) {
        violations.push(`${path}: invalid canonical concern id ${stable}`);
      }
      if (!versioned.startsWith(`${stable}-V`)) {
        violations.push(
          `${path}: versioned concern id ${versioned} must extend stable id ${stable} with -V...`,
        );
      }
      const retainedVersion = path.match(/\.v([0-9]+)\.md$/)?.[1];
      if (
        retainedVersion !== undefined &&
        !versioned.endsWith(`-V${retainedVersion}`)
      ) {
        violations.push(
          `${path}: retained semantic-version filename must match ${versioned}`,
        );
      }

      if (!retainedSemanticVersionPath(path)) {
        const priorCurrentOwner = currentOwnerByStable.get(stable);
        if (priorCurrentOwner !== undefined) {
          violations.push(
            `${stable}: duplicate current canonical concern owner ${priorCurrentOwner}, ${path}`,
          );
        } else {
          currentOwnerByStable.set(stable, path);
        }
      }

      const priorVersioned = seenVersioned.get(versioned);
      if (priorVersioned !== undefined) {
        violations.push(`${versioned}: duplicate versioned concern owner ${priorVersioned}, ${path}`);
      } else {
        seenVersioned.set(versioned, path);
      }

      concernByPath.set(path, { path, stableId: stable, versionedId: versioned });
    }

    const manifest = sourceText("pontivus-order.toml");
    const refsBody = manifest.match(/\[refs\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const refs = new Map<string, string>();
    for (const line of refsBody.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*"([^"]+)"\s*$/);
      if (match?.[1] !== undefined && match[2] !== undefined) {
        if (refs.has(match[1])) {
          violations.push(`${match[1]}: duplicate manifest ref identifier`);
        } else {
          refs.set(match[1], match[2]);
        }
      }
    }

    for (const metadata of concernByPath.values()) {
      if (
        !retainedSemanticVersionPath(metadata.path) &&
        refs.get(metadata.stableId) !== metadata.path
      ) {
        violations.push(
          `${metadata.stableId}: stable manifest ref must resolve to current canonical owner ${metadata.path}`,
        );
      }
      if (refs.get(metadata.versionedId) !== metadata.path) {
        violations.push(
          `${metadata.versionedId}: versioned manifest ref must resolve to exact semantic source ${metadata.path}`,
        );
      }
    }

    for (const [stableId, currentPath] of currentOwnerByStable) {
      if (refs.get(stableId) !== currentPath) {
        violations.push(
          `${stableId}: stable manifest ref must select exactly one current semantic owner`,
        );
      }
    }

    for (const [ref, ownerPath] of refs) {
      if (!ref.startsWith("GW-DOC-")) continue;
      const metadata = concernByPath.get(ownerPath);
      if (metadata === undefined) {
        violations.push(`${ref}: GW-DOC ref resolves to a document without canonical concern metadata: ${ownerPath}`);
        continue;
      }
      if (ref !== metadata.stableId && ref !== metadata.versionedId) {
        violations.push(`${ref}: undocumented alias for canonical concern owner ${ownerPath}`);
      }
    }

    const authorityBody =
      manifest.match(/\[authority\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    for (const line of authorityBody.split(/\r?\n/)) {
      const match = line.match(/^p[1-6]\s*=\s*\[(.*)\]\s*$/);
      if (match?.[1] === undefined) continue;
      for (const item of match[1].matchAll(/"([^"]+)"/g)) {
        const authorityPath = item[1];
        if (
          authorityPath === undefined ||
          !authorityPath.endsWith(".md") ||
          /[?*{}[\]!]/.test(authorityPath)
        ) {
          continue;
        }
        if (retainedSemanticVersionPath(authorityPath)) {
          violations.push(
            `${authorityPath}: retained semantic-version source must not appear in the current authority set`,
          );
        } else if (!concernByPath.has(authorityPath)) {
          violations.push(
            `${authorityPath}: literal authority document must declare canonical concern metadata`,
          );
        }
      }
    }

    // A permanent current document depends on the current owner through the
    // stable concern id. Versioned ids are reserved for exact semantic
    // snapshots (for example the governed WorkItem package) and retained
    // historical evidence.
    const advancedConcerns = [...currentOwnerByStable.entries()].flatMap(
      ([stableId, currentPath]) => {
        const versionedIds = [...refs.entries()]
          .filter(([refId, ownerPath]) =>
            refId !== stableId &&
            refId.startsWith(stableId + "-V") &&
            concernByPath.get(ownerPath)?.stableId === stableId
          )
          .map(([refId]) => refId);
        const hasRetainedVersion = [...concernByPath.values()].some(
          (metadata) =>
            metadata.stableId === stableId &&
            retainedSemanticVersionPath(metadata.path),
        );
        return hasRetainedVersion
          ? [{ stableId, currentPath, versionedIds }]
          : [];
      },
    );
    for (const sourcePath of activeDocumentationFiles.filter(
      (path) =>
        !retainedSemanticVersionPath(path) &&
        // The 0.5.0 visual reference pack is historical evidence, not a
        // present canonical authority consumer; its exact V1 pins are intentional.
        path !== "docs/references/workbench-ui/README.md"
    )) {
      for (const { stableId, currentPath, versionedIds } of advancedConcerns) {
        if (sourcePath === currentPath) continue;
        for (const [index, line] of sourceText(sourcePath).split(/\r?\n/).entries()) {
          for (const versionedId of versionedIds) {
            if (line.includes(versionedId)) {
              violations.push(
                `${sourcePath}:${index + 1}: current authority consumer must reference stable ${stableId}, not exact ${versionedId}`,
              );
            }
          }
        }
      }
    }

    for (const sourcePath of activeDocumentationFiles) {
      const lines = sourceText(sourcePath).split(/\r?\n/);
      for (const metadata of concernByPath.values()) {
        if (metadata.path === sourcePath) continue;
        // AGENTS.md is a conventional project-local filename and can legitimately
        // refer to nested/consumer instruction files rather than this repository root owner.
        if (metadata.path === "AGENTS.md") continue;

        const sourceDirectory = dirname(sourcePath);
        const relativeTarget = relative(sourceDirectory, metadata.path).replaceAll("\\", "/");
        const referenceForms = new Set([
          metadata.path,
          relativeTarget,
          relativeTarget.startsWith(".") ? relativeTarget : `./${relativeTarget}`,
        ]);

        for (const [index, line] of lines.entries()) {
          if (![...referenceForms].some((reference) => line.includes(reference))) continue;
          if (
            !line.includes(metadata.stableId) &&
            !line.includes(metadata.versionedId)
          ) {
            violations.push(
              `${sourcePath}:${index + 1}: reference to ${metadata.path} must carry ${metadata.stableId} or ${metadata.versionedId}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("enforces v2 WorkItem documentation hygiene without reinterpreting historical v1 packages", () => {
    const violations: string[] = [];
    const manifest = sourceText("pontivus-order.toml");
    const refsBody = manifest.match(/\[refs\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const resolvedRefs = new Map<string, string>();
    for (const line of refsBody.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*"([^"]+)"\s*$/);
      if (match?.[1] !== undefined && match[2] !== undefined) {
        resolvedRefs.set(match[1], match[2]);
      }
    }
    const authorityBody =
      manifest.match(/\[authority\]\r?\n([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
    const p3Patterns = [
      ...(authorityBody.match(/^p3\s*=\s*\[(.*)\]\s*$/m)?.[1].matchAll(/"([^"]+)"/g) ?? []),
    ].map((match) => match[1]).filter((value): value is string => value !== undefined);
    const stableP3Ids = new Set(
      [...resolvedRefs.entries()]
        .filter(([id, path]) =>
          /^GW-FR-[A-Z0-9-]+$/.test(id) &&
          p3Patterns.some((pattern) => matchesGlob(path, pattern))
        )
        .map(([id]) => id),
    );
    const stableCoverageDelta = (
      expected: ReadonlySet<string>,
      declared: readonly string[],
    ): Readonly<{ missing: readonly string[]; duplicate: readonly string[]; extra: readonly string[] }> => {
      const counts = new Map<string, number>();
      for (const id of declared) counts.set(id, (counts.get(id) ?? 0) + 1);
      return {
        missing: [...expected].filter((id) => !counts.has(id)).sort(),
        duplicate: [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id).sort(),
        extra: [...counts.keys()].filter((id) => !expected.has(id)).sort(),
      };
    };
    expect(
      stableCoverageDelta(
        new Set(["GW-FR-A", "GW-FR-B"]),
        ["GW-FR-A", "GW-FR-A", "GW-FR-C"],
      ),
    ).toEqual({
      missing: ["GW-FR-B"],
      duplicate: ["GW-FR-A"],
      extra: ["GW-FR-C"],
    });
    const workItemsRoot = join(repositoryRoot, "docs", "order", "work-items");
    for (const entry of readdirSync(workItemsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const workItemDirectory = join(workItemsRoot, entry.name);
      const requestPath = join(workItemDirectory, "work-request.md");
      if (!existsSync(requestPath)) continue;
      const request = readFileSync(requestPath, "utf8");
      const schemaId = request.match(/"schemaId"\s*:\s*"([^"]+)"/)?.[1];
      if (schemaId !== "change-v2" && schemaId !== "defect-v2") continue;

      const markdownFiles = readdirSync(workItemDirectory, { withFileTypes: true })
        .filter((candidate) => candidate.isFile() && candidate.name.endsWith(".md"))
        .map((candidate) => candidate.name)
        .sort();

      for (const filename of markdownFiles) {
        const path = join(workItemDirectory, filename);
        const source = readFileSync(path, "utf8");
        if (/^\*\*Canonical concern ID:\*\*/m.test(source) ||
          /^\*\*Versioned concern ID:\*\*/m.test(source)) {
          violations.push(
            `docs/order/work-items/${entry.name}/${filename}: WorkItem documents must not declare canonical concern ownership`,
          );
        }
        if (/\bWF-FR-[A-Z0-9-]+\b/.test(source)) {
          violations.push(
            `docs/order/work-items/${entry.name}/${filename}: v2 WorkItem documents must not create the retired WF-FR shadow namespace`,
          );
        }
      }

      const requirementsPath = join(workItemDirectory, "requirements.md");
      if (existsSync(requirementsPath)) {
        const requirements = readFileSync(requirementsPath, "utf8");
        if (!requirements.includes("## Functional authority disposition ledger")) {
          violations.push(
            `docs/order/work-items/${entry.name}/requirements.md: v2 R2 requires the functional authority disposition ledger`,
          );
        }
        const ledger = requirements.match(
          /## Functional authority disposition ledger\r?\n([\s\S]*?)(?=\r?\n## |$)/,
        )?.[1] ?? "";
        const dataRows = ledger
          .split(/\r?\n/)
          .filter((line) => /^\|/.test(line.trim()))
          .filter((line) =>
            !/^\|\s*Requirement\s*\|/.test(line.trim()) &&
            !/^\|\s*[-:]+\s*\|/.test(line.trim())
          )
          .filter((line) =>
            line.trim().slice(1, -1).split("|").some((cell) => cell.trim().length > 0)
          );
        if (dataRows.length === 0) {
          violations.push(
            `docs/order/work-items/${entry.name}/requirements.md: v2 authority disposition ledger must contain at least one material requirement row`,
          );
        }
        if (entry.name === "work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21") {
          const campaignPlan = sourceText(
            "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-design-campaign-plan.md",
          );
          const g3Status = campaignPlan.match(/^\| G3 \|[^|]*\|\s*([^|]+?)\s*\|/m)?.[1] ?? "";
          if (g3Status === "PASS") {
            const declaredStableIds = dataRows
              .map((row) => row.trim().slice(1, -1).split("|")[0]?.trim() ?? "")
              .filter((id) => /^GW-FR-[A-Z0-9-]+$/.test(id));
            const delta = stableCoverageDelta(stableP3Ids, declaredStableIds);
            if (delta.missing.length > 0) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: G3 PASS missing stable P3 dispositions: ${delta.missing.join(", ")}`,
              );
            }
            if (delta.duplicate.length > 0) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: G3 PASS duplicate stable P3 dispositions: ${delta.duplicate.join(", ")}`,
              );
            }
            if (delta.extra.length > 0) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: G3 PASS contains non-authoritative GW-FR disposition ids: ${delta.extra.join(", ")}`,
              );
            }
          }
        }

        for (const row of dataRows) {
          const cells = row.trim().slice(1, -1).split("|").map((cell) => cell.trim());
          const [requirement = "", disposition = "", owner = ""] = cells;
          if (requirement.length === 0) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: authority disposition row has empty requirement`,
            );
          }
          if (!["REFERENCE", "DELTA", "LOCAL"].includes(disposition)) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: invalid authority disposition ${disposition}`,
            );
          }
          if (
            (disposition === "REFERENCE" || disposition === "DELTA") &&
            !/^GW-/.test(owner)
          ) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: ${disposition} row requires a GW-* canonical owner`,
            );
          }
          if (
            (disposition === "REFERENCE" || disposition === "DELTA") &&
            /^GW-/.test(owner) &&
            !resolvedRefs.has(owner)
          ) {
            violations.push(
              `docs/order/work-items/${entry.name}/requirements.md: unresolved canonical owner ${owner}`,
            );
          }
          if (
            (disposition === "REFERENCE" || disposition === "DELTA") &&
            /^GW-/.test(owner) &&
            resolvedRefs.has(owner)
          ) {
            const ownerPath = resolvedRefs.get(owner)!;
            if (!p3Patterns.some((pattern) => matchesGlob(ownerPath, pattern))) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: ${disposition} owner ${owner} is not selected by authority.p3`,
              );
            }
            if (
              /^GW-FR-[A-Z0-9-]+$/.test(requirement) &&
              !sourceText(ownerPath).includes(requirement)
            ) {
              violations.push(
                `docs/order/work-items/${entry.name}/requirements.md: ${owner} does not contain stable requirement ${requirement}`,
              );
            }
            if (/^GW-FR-[A-Z0-9-]+$/.test(requirement)) {
              const canonicalRequirementPath = resolvedRefs.get(requirement);
              if (canonicalRequirementPath === undefined) {
                violations.push(
                  `docs/order/work-items/${entry.name}/requirements.md: unresolved stable requirement ${requirement}`,
                );
              } else if (canonicalRequirementPath !== ownerPath) {
                violations.push(
                  `docs/order/work-items/${entry.name}/requirements.md: ${requirement} owner ${owner} resolves to ${ownerPath}, expected canonical P3 owner path ${canonicalRequirementPath}`,
                );
              }
            }
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });


  it("enforces single-owned campaign state and exact foundation ancestry", () => {
    const campaignPlanPath =
      "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-design-campaign-plan.md";
    const campaignLedgerPath =
      "docs/order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-concern-coverage-ledger.md";
    if (!existsSync(join(repositoryRoot, campaignPlanPath))) return;

    const source = sourceText(campaignPlanPath);
    const violations: string[] = [];
    const campaignDirectory = dirname(campaignPlanPath);
    const currentGateProjection =
      /^(?:\*\*Status:\*\*[^\n]*\bG[0-6]\b[^\n]*\b(?:PASS|IN_PROGRESS|BLOCKED|REVALIDATION|NOT_STARTED)\b|\s*(?:[-*]\s*)?(?:\*\*)?G[0-6](?:\*\*)?\s*(?::|=|is\b)[^\n]*\b(?:PASS|IN_PROGRESS|BLOCKED|REVALIDATION|NOT_STARTED|complete|closed|ready)\b)/i;
    const currentGateVerdictHeading =
      /^#{1,6}\s+.*\bG[0-6]\b.*\b(?:verdict|status|closure|state)\b/i;
    for (const entry of readdirSync(join(repositoryRoot, campaignDirectory), { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "0.6.0-design-campaign-plan.md") {
        continue;
      }
      const siblingPath = join(campaignDirectory, entry.name).replaceAll("\\", "/");
      for (const [index, line] of sourceText(siblingPath).split(/\r?\n/).entries()) {
        if (currentGateProjection.test(line) || currentGateVerdictHeading.test(line)) {
          violations.push(
            `${siblingPath}:${index + 1}: current G0-G6 state must be owned only by campaign §18`,
          );
        }
      }
    }

    if (/^\*\*Status:\*\*/m.test(source)) {
      violations.push("campaign header must not duplicate current gate/concern state");
    }
    if (/^\*\*Prerequisite:\*\*/m.test(source)) {
      violations.push("campaign header must not duplicate the current G0 baseline");
    }
    if (/^\*\*C\d{2} status:\*\*/m.test(source)) {
      violations.push("concern START/END prose must not duplicate current concern state");
    }
    if (source.includes("## 20. Current execution state")) {
      violations.push("campaign must not maintain a second current execution-state projection");
    }
    if (!source.includes("## 20. Derived execution-state view")) {
      violations.push("campaign must retain the explicitly derived-only execution-state view");
    }

    const concernSection =
      source.match(/## 7\. Master concern register\r?\n([\s\S]*?)(?=\r?\n## 8\.)/)?.[1] ?? "";
    const pairSection =
      source.match(/#### Current pair-audit status\r?\n([\s\S]*?)(?=\r?\n## 9\.)/)?.[1] ?? "";
    const gateSection =
      source.match(/## 18\. Phase\/gate status register\r?\n([\s\S]*?)(?=\r?\n## 19\.)/)?.[1] ?? "";

    if (!concernSection.includes("sole current-state owner for C01-C22")) {
      violations.push("§7 must explicitly own all current concern state");
    }
    if (!gateSection.includes("sole current-state owner for G0-G6")) {
      violations.push("§18 must explicitly own all current gate state");
    }

    const tableCells = (line: string): readonly string[] =>
      line.trim().slice(1, -1).split("|").map((cell) => cell.trim());

    const concerns = concernSection
      .split(/\r?\n/)
      .filter((line) => /^\| C\d{2} \|/.test(line))
      .map((line) => {
        const cells = tableCells(line);
        return {
          id: cells[0] ?? "",
          r1: cells[3] ?? "",
          r2: cells[4] ?? "",
          design: cells[5] ?? "",
          plan: cells[6] ?? "",
          overall: cells[7] ?? "",
        };
      });

    if (concerns.length !== 22) {
      violations.push(`§7 must contain exactly 22 concern rows, found ${concerns.length}`);
    }
    if (new Set(concerns.map((concern) => concern.id)).size !== concerns.length) {
      violations.push("§7 concern ids must be unique");
    }

    const gates = new Map(
      gateSection
        .split(/\r?\n/)
        .filter((line) => /^\| G[0-6] \|/.test(line))
        .map((line) => {
          const cells = tableCells(line);
          return [cells[0] ?? "", {
            status: cells[2] ?? "",
            evidence: cells[3] ?? "",
          }] as const;
        }),
    );
    if (gates.size !== 7) {
      violations.push(`§18 must contain exactly G0-G6, found ${gates.size} gate rows`);
    }

    const pairRows = pairSection
      .split(/\r?\n/)
      .filter((line) => /^\| A\d{2} \|/.test(line))
      .map((line) => {
        const cells = tableCells(line);
        return {
          id: cells[0] ?? "",
          concerns: cells[1] ?? "",
          R1: cells[2] ?? "",
          R2: cells[3] ?? "",
          DESIGN: cells[4] ?? "",
          PLAN: cells[5] ?? "",
        };
      });
    const expectedPairIds = Array.from({ length: 11 }, (_, index) =>
      `A${String(index + 1).padStart(2, "0")}`
    );
    if (pairRows.length !== expectedPairIds.length) {
      violations.push(`§8.4 must contain exactly 11 pair rows, found ${pairRows.length}`);
    }
    if (new Set(pairRows.map((pair) => pair.id)).size !== pairRows.length) {
      violations.push("§8.4 pair ids must be unique");
    }
    for (const pairId of expectedPairIds) {
      if (!pairRows.some((pair) => pair.id === pairId)) {
        violations.push(`§8.4 missing pair row ${pairId}`);
      }
    }

    const revalidationBoundary = source.lastIndexOf(
      "CURRENT REVALIDATION EVIDENCE START — G-F06/G-F07/G-F08",
    );
    const currentAuditSource =
      revalidationBoundary >= 0 ? source.slice(revalidationBoundary) : source;
    const phaseNames = ["R1", "R2", "DESIGN", "PLAN"] as const;
    for (const phase of phaseNames) {
      for (const [index, pair] of pairRows.entries()) {
        const status = pair[phase];
        if (status === "PASS" && index > 0 && pairRows[index - 1]?.[phase] !== "PASS") {
          violations.push(
            `${phase}-${pair.id} PASS requires prior pair ${phase}-${pairRows[index - 1]?.id} PASS`,
          );
        }
        if (status !== "PASS") continue;
        const auditId = `${phase}-${pair.id}`;
        const startToken = `PAIR AUDIT START: ${auditId}`;
        const endToken = `PAIR AUDIT END: ${auditId}`;
        const startCount = currentAuditSource.split(startToken).length - 1;
        const endCount = currentAuditSource.split(endToken).length - 1;
        const start = currentAuditSource.indexOf(startToken);
        const end = currentAuditSource.indexOf(endToken, start + startToken.length);
        if (startCount !== 1 || endCount !== 1 || start < 0 || end < 0) {
          violations.push(
            `${auditId} PASS requires exactly one current mandatory pair-audit record; starts=${startCount}, ends=${endCount}`,
          );
          continue;
        }
        const record = currentAuditSource.slice(start, end + endToken.length + 400);
        const checks = [
          ["exact baseline", /Exact baseline:/i],
          ["repository commit", /repository commit:\s*`?[0-9a-f]{40}`?/i],
          ["artifact hashes/SHAs", /artifact hashes\/SHAs:\s*[^\n]*[0-9a-f]{40}/i],
          ["detailed checks", /Detailed checks:/i],
          ["general checklist PASS", /general checklist:[^\n]*PASS/i],
          ["phase-specific checklist PASS", /phase-specific checklist:[^\n]*PASS/i],
          ["cross-concern interface PASS", /cross-concern interface:[^\n]*PASS/i],
          ["reused-material revalidation PASS", /reused-material revalidation:[^\n]*PASS/i],
          ["findings", /Findings:/i],
          ["reopened concerns", /Reopened concerns:/i],
          ["unproven items", /Unproven items:/i],
          ["verdict PASS", /Verdict:\s*`?PASS`?/i],
          ["next-pair authorization", /Next (?:pair|R1 pair) authorized:\s*(?:YES|NO)/i],
        ] as const;
        for (const [label, pattern] of checks) {
          if (!pattern.test(record)) {
            violations.push(`${auditId} PASS record missing ${label}`);
          }
        }
      }
    }

    const gatePairPhase = [
      ["G2", "R1"],
      ["G3", "R2"],
      ["G4", "DESIGN"],
      ["G5", "PLAN"],
    ] as const;
    for (const [gateId, phase] of gatePairPhase) {
      if (gates.get(gateId)?.status === "PASS") {
        const unresolved = pairRows.filter((pair) => pair[phase] !== "PASS");
        if (unresolved.length > 0) {
          violations.push(
            `${gateId} PASS requires all ${phase} pair audits PASS; unresolved: ${unresolved.map((pair) => pair.id).join(", ")}`,
          );
        }
      }
    }
    for (let rank = 1; rank <= 6; rank += 1) {
      const gateId = `G${rank}`;
      if (gates.get(gateId)?.status !== "PASS") continue;
      for (let prior = 0; prior < rank; prior += 1) {
        if (gates.get(`G${prior}`)?.status !== "PASS") {
          violations.push(`${gateId} PASS requires G0-G${rank - 1} PASS`);
          break;
        }
      }
    }

    const inProgressGates = [...gates.entries()]
      .filter(([, gate]) => gate.status === "IN_PROGRESS")
      .map(([id]) => id);
    if (inProgressGates.length > 1) {
      violations.push("at most one campaign gate may be IN_PROGRESS");
    }
    for (const gateId of inProgressGates) {
      const rank = Number(gateId.slice(1));
      for (let prior = 0; prior < rank; prior += 1) {
        if (gates.get(`G${prior}`)?.status !== "PASS") {
          violations.push(`${gateId} may be IN_PROGRESS only after G0-G${rank - 1} are PASS`);
          break;
        }
      }
    }

    const g2 = gates.get("G2");
    const activeR1 = concerns.filter((concern) => concern.r1 === "IN_REVIEW");
    const blockedR1 = concerns.filter((concern) =>
      concern.r1 === "BLOCKED" || concern.r1 === "REVALIDATION"
    );
    if (g2?.status === "IN_PROGRESS") {
      if (activeR1.length > 1) {
        violations.push("G2 IN_PROGRESS permits at most one active R1 concern");
      }
      if (activeR1.length === 0 && blockedR1.length === 0) {
        violations.push("G2 IN_PROGRESS requires one active R1 concern or an explicit blocked/revalidation owner");
      }
    }
    if (g2?.status === "PASS") {
      const unresolved = concerns.filter(
        (concern) => !["FACTS_CLOSED", "GAP_FOUND"].includes(concern.r1),
      );
      if (unresolved.length > 0) {
        violations.push(
          "G2 PASS requires every R1 concern factually closed; unresolved: " +
            unresolved.map((concern) => concern.id).join(", "),
        );
      }
    }

    const phasedConcernChecks = [
      { gate: "G3", field: "r2", closed: "FUNCTIONAL_CLOSED", label: "R2" },
      { gate: "G4", field: "design", closed: "TECHNICAL_CLOSED", label: "DESIGN" },
      { gate: "G5", field: "plan", closed: "PLAN_COVERED", label: "PLAN" },
    ] as const;

    for (const check of phasedConcernChecks) {
      const gate = gates.get(check.gate);
      const active = concerns.filter((concern) => concern[check.field] === "IN_REVIEW");
      const blocked = concerns.filter((concern) =>
        concern[check.field] === "BLOCKED" || concern[check.field] === "REVALIDATION"
      );
      if (gate?.status === "IN_PROGRESS") {
        if (active.length > 1) {
          violations.push(
            `${check.gate} IN_PROGRESS permits at most one active ${check.label} concern`,
          );
        }
        if (active.length === 0 && blocked.length === 0) {
          violations.push(
            `${check.gate} IN_PROGRESS requires one active ${check.label} concern or an explicit blocked/revalidation owner`,
          );
        }
      }
      if (gate?.status === "PASS") {
        const unresolved = concerns.filter(
          (concern) => concern[check.field] !== check.closed,
        );
        if (unresolved.length > 0) {
          violations.push(
            `${check.gate} PASS requires every concern ${check.closed}; unresolved: ` +
              unresolved.map((concern) => concern.id).join(", "),
          );
        }
      }
    }

    const g0 = gates.get("G0");
    const baseline = g0?.evidence.match(/baseline `([0-9a-f]{40})`/)?.[1] ?? null;
    if (g0?.status === "PASS") {
      if (baseline === null) {
        violations.push("G0 PASS requires one exact full 40-character baseline SHA in §18");
      } else {
        try {
          execFileSync(
            "git",
            ["merge-base", "--is-ancestor", baseline, "HEAD"],
            { cwd: repositoryRoot, stdio: "pipe" },
          );
        } catch {
          violations.push(
            `G0 PASS baseline ${baseline} must be an ancestor of campaign HEAD`,
          );
        }
        if (
          existsSync(join(repositoryRoot, campaignLedgerPath)) &&
          !sourceText(campaignLedgerPath).includes(baseline)
        ) {
          violations.push("G1 coverage ledger must record the exact current G0 baseline SHA");
        }
      }
      if (/^\| G-F\d+ .*OPEN_FOUNDATION/m.test(source)) {
        violations.push("G0 PASS is illegal while an OPEN_FOUNDATION finding remains");
      }
    }

    expect(violations).toEqual([]);
  });

});
