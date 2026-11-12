import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

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

type Layer = "core" | "shell" | "daemon" | "cli" | "installer" | "ui" | "other";

const layerOf = (path: string): Layer => {
  if (path.startsWith("src/core/")) return "core";
  if (path.startsWith("src/shell/")) return "shell";
  if (path.startsWith("src/daemon/")) return "daemon";
  if (path === "src/cli.ts") return "cli";
  if (path === "src/installer.ts") return "installer";
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
      ],
      "src/daemon/work-item-source.ts": [
        "src/daemon/runtime.ts",
      ],
      "src/daemon/server.ts": [
        "src/daemon/runtime.ts",
        "src/daemon/coordinator.ts",
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

    if (files.has("src/core/work-item-source.ts")) {
      const workItemSourceCore = sourceText("src/core/work-item-source.ts");
      for (const requiredOwner of [
        "isUnsupportedWorkItemSchemaFailure",
        "defaultSchemaForKind",
        "classifyExistingWorkItemSource",
        "linkedRemediationIsAllowed",
        "r1CompletionIsAllowedForSchema",
        "unresolvedConcernIdsForProject",
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
      "ui/src/MarkdownEditor.tsx",
      "ui/src/MarkdownSourceEditor.tsx",
      "ui/src/markdown-source-formatting.ts",
      "ui/src/CreateWorkItem.tsx",
      "ui/src/WorkItemQueue.tsx",
      "ui/src/WorkItemContext.tsx",
      "ui/src/DocumentWorkspace.tsx",
      "ui/src/StageDialogue.tsx",
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
      "ui/src/SignoffReview.tsx",
      "ui/src/ProposalReview.tsx",
      "ui/src/StageDialogue.tsx",
      "ui/src/TerminalResult.tsx",
      "ui/src/WorkItemContext.tsx",
      "ui/src/WorkItemQueue.tsx",
    ]);

    const allowedSubstantiveDependencies: Readonly<Record<string, readonly string[]>> = {
      "ui/src/DocumentWorkspace.tsx": ["ui/src/MarkdownEditor.tsx"],
      "ui/src/MarkdownEditor.tsx": ["ui/src/MarkdownSourceEditor.tsx"],
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
      "export type WorkItemMode",
      "export type EvidenceSelection",
      "export const runIsActive",
      "export const proposalDispositionFor",
      "export const lifecycleArtifactRoleRank",
      "export const workItemInitialMode",
    ]) {
      if (!presentationPolicy.includes(requiredOwner)) {
        violations.push(
          "ui/src/workbench-presentation.ts must own shared typed presentation rule " + requiredOwner,
        );
      }
    }

    for (const sourcePath of uiFiles.filter((path) => path !== "ui/src/workbench-presentation.ts")) {
      const source = sourceText(sourcePath);
      if (/new Set<Run\["status"\]>\(\["RUNNING", "WAITING_FOR_INPUT"\]\)/.test(source)) {
        violations.push(
          sourcePath + ": active Run classification must use the shared presentation owner",
        );
      }
      if (/from ["']\.\/EvidenceViewer\.tsx["']/.test(source)) {
        violations.push(
          sourcePath + ": presentation selection types must not be owned by a sibling Evidence workspace",
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

  it("enforces canonical documentation concern ownership and identifier references", () => {
    const violations: string[] = [];
    const docsDirectory = join(repositoryRoot, "docs");
    const activeDocumentationFiles = [
      "AGENTS.md",
      ...readdirSync(docsDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => `docs/${entry.name}`)
        .filter((path) => {
          const name = path.slice("docs/".length);
          return (
            name === "README.md" ||
            !/^(?:15|1[6-9]|2[0-3])-/.test(name)
          );
        }),
    ].sort();

    type ConcernMetadata = Readonly<{
      path: string;
      stableId: string;
      versionedId: string;
    }>;

    const concernByPath = new Map<string, ConcernMetadata>();
    const seenStable = new Map<string, string>();
    const seenVersioned = new Map<string, string>();
    const seenAllIds = new Map<string, string>();

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

      const priorStable = seenStable.get(stable);
      if (priorStable !== undefined) {
        violations.push(`${stable}: duplicate canonical concern owner ${priorStable}, ${path}`);
      } else {
        seenStable.set(stable, path);
      }

      const priorVersioned = seenVersioned.get(versioned);
      if (priorVersioned !== undefined) {
        violations.push(`${versioned}: duplicate versioned concern owner ${priorVersioned}, ${path}`);
      } else {
        seenVersioned.set(versioned, path);
      }

      for (const id of [stable, versioned]) {
        const priorIdOwner = seenAllIds.get(id);
        if (priorIdOwner !== undefined) {
          violations.push(`${id}: identifier is not globally unique; owners ${priorIdOwner}, ${path}`);
        } else {
          seenAllIds.set(id, path);
        }
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
      if (refs.get(metadata.stableId) !== metadata.path) {
        violations.push(
          `${metadata.stableId}: manifest ref must resolve to canonical owner ${metadata.path}`,
        );
      }
      if (refs.get(metadata.versionedId) !== metadata.path) {
        violations.push(
          `${metadata.versionedId}: manifest ref must resolve to canonical owner ${metadata.path}`,
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
        if (!concernByPath.has(authorityPath)) {
          violations.push(
            `${authorityPath}: literal authority document must declare canonical concern metadata`,
          );
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
        const basename = metadata.path.split("/").at(-1)!;
        for (const [index, line] of lines.entries()) {
          if (!line.includes(basename)) continue;
          if (
            !line.includes(metadata.stableId) &&
            !line.includes(metadata.versionedId)
          ) {
            violations.push(
              `${sourcePath}:${index + 1}: reference to ${basename} must carry ${metadata.stableId} or ${metadata.versionedId}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

});
