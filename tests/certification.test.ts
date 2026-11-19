import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string): string => readFileSync(join(root, path), "utf8");

describe("Order cross-boundary certification", () => {
  it("permanently certifies the 0.5.0 workflow closure boundaries", () => {
    const contracts = read("src/core/contracts.ts");
    expect(contracts).toContain("AgentActivityCategorySchema");
    expect(contracts).toContain('"AGENT_ACTIVITY_RECORDED"');
    expect(contracts).toContain("StageProviderBatchAdmissionDiagnosticSchema");
    expect(contracts).toContain('"ORDER_STAGE_BATCH_ADMISSION"');

    const lifecycle = read("src/core/lifecycle.ts");
    expect(lifecycle).toContain("stageProviderBatchRejectionCode");
    expect(lifecycle).toContain("stageRunCancellationIsAdmitted");
    expect(lifecycle).toContain("deriveMaterialPresentationState");
    expect(lifecycle).toContain("artifactHasCurrentStageConformance");
    expect(lifecycle).toContain("materialCurrentnessForStage");
    const reached = lifecycle.slice(
      lifecycle.indexOf("export const deriveReachedStages"),
      lifecycle.indexOf("export const reachStateForStage"),
    );
    expect(reached).not.toContain("artifactOwnerStage(");
    expect(reached).not.toMatch(/for \(const artifact of/);

    const authority = read("src/daemon/authority.ts");
    const artifactRead = authority.slice(
      authority.indexOf("export const currentLifecycleArtifacts"),
      authority.indexOf("export const resolveStageContextState"),
    );
    expect(artifactRead).toContain("listArtifacts(runtime, workItemId)");
    expect(artifactRead).not.toContain("latestRunCandidateArtifacts");
    expect(artifactRead).not.toContain("storeArtifact(");

    const execution = read("src/daemon/execution.ts");
    expect(execution).toContain("export const startExactExecutionTask");
    expect(execution).toContain("deriveExecutionOwner(tasks, listRuns(runtime, workItem.id))");
    expect(execution).toContain('"execution task is not the canonical current task"');

    const coordinator = read("src/daemon/coordinator.ts");
    expect(coordinator).toContain("export const startCurrentExecutionTask");
    expect(coordinator).toContain("stageRunCancellationIsAdmitted");
    expect(coordinator).toContain("driveExecutionTask");

    const server = read("src/daemon/server.ts");
    expect(server).toContain('parts[5] === "start"');
    const tickRouteStart = server.indexOf('pathname === "/api/tick"');
    const browserMutationAuth = server.indexOf("requireBrowserMutation", tickRouteStart);
    expect(tickRouteStart).toBeGreaterThanOrEqual(0);
    expect(browserMutationAuth).toBeGreaterThan(tickRouteStart);
    const tickRoute = server.slice(tickRouteStart, browserMutationAuth);
    expect(tickRoute).toContain("requireCliBearer");
    expect(tickRoute).not.toContain("requireBrowserMutation");

    const http = read("ui/src/http.ts");
    expect(http).toContain("export const startExecutionTask");
    expect(http).not.toContain('"/api/tick"');
    expect(http).not.toContain("export const tick");

    const executionUi = read("ui/src/ExecutionWorkspace.tsx");
    expect(executionUi).toContain("api.startExecutionTask(workItem.id,currentOwnerTask.id)");
    expect(executionUi).toContain('label="Start current task"');
    expect(executionUi).not.toContain("Run next implementation step");
    expect(executionUi).not.toContain("api.tick");

    const stage = read("src/daemon/stage.ts");
    const stagePrompt = stage.slice(
      stage.indexOf("const stagePrompt"),
      stage.indexOf("const persistAndReactStageBatch"),
    );
    expect(stagePrompt).not.toContain("Return only a JSON array of canonical provider-emittable RunEventPayload values for STAGE role.");
    expect(stage).toContain("recordStageProviderBatchAdmissionDiagnostic");
    expect(stage).toContain("Agent result could not be accepted");

    const opencode = read("src/shell/opencode.ts");
    expect(opencode).toContain('"STAGE turn grammar:');
    expect(opencode).toContain("consumeLiveActivity");
    expect(opencode).toContain("recordTerminalContextActivity");
    expect(opencode).not.toContain("ChatToolCalls");

    const presentation = read("ui/src/workbench-presentation.ts");
    expect(presentation).toContain('export type RunEventPlane = "CONVERSATION" | "ACTIVITY" | "WORKFLOW"');
    expect(presentation).toContain("conversationRunEvents");
    expect(presentation).toContain("agentActivityRunEvents");
    expect(presentation).toContain("workflowRunEvents");

    const dialogue = read("ui/src/primitives/WorkbenchDialogue.tsx");
    for (const leaf of [
      "ChatLayout",
      "ChatMessage",
      "ChatMessageBubble",
      "ChatMessageList",
      "ChatMessageMetadata",
    ]) {
      expect(dialogue).toContain(leaf);
    }
    const activity = read("ui/src/ActivityWorkspace.tsx");
    expect(activity).toContain("conversationRunEvents(events)");
    expect(activity).toContain("agentActivityRunEvents(events)");
    expect(activity).toContain("workflowRunEvents(events)");
    expect(activity).toContain("stageRunCancellationIsAdmitted(selectedRun, events)");

    const composer = read("ui/src/ActivityComposer.tsx");
    expect(composer).toContain("Answer the question above");
    expect(composer).not.toContain("pending.event.question");

    const timeline = read("ui/src/RunEventTimeline.tsx");
    expect(timeline).toContain("workflowRunEvents(events)");

    const workspace = read("ui/src/WorkItemWorkspace.tsx");
    expect(workspace).toContain("activeRunOwnsAuthoring = runs.some(runIsActive)");
    expect(workspace).toContain("deriveMaterialPresentationState(");
    expect(workspace).toContain("artifactHasCurrentStageConformance(");

    const proposal = read("ui/src/ProposalReview.tsx");
    expect(proposal).toContain("selection.runId === currentRunId");
    expect(proposal).toContain('currentInteraction?.tag === "OPEN"');

    const queue = read("ui/src/WorkItemQueue.tsx");
    expect(queue).not.toContain("Copy work item id");
    expect(queue).not.toContain("navigator.clipboard");
    const context = read("ui/src/WorkItemContext.tsx");
    expect(context).toContain('label="WorkItem id"');
    expect(context).toContain("{workItem.id}");

    const terminal = read("ui/src/TerminalResult.tsx");
    expect(terminal).toContain('data-testid="final-governed-outcome"');
  });

  it("proves V-07 activity extraction remains bounded, secret-blind, and observational", () => {
    const contracts = read("src/core/contracts.ts");
    expect(contracts).toContain("AgentActivitySummarySchema");
    expect(contracts).toContain(".max(160)");
    expect(contracts).toContain("const AgentActivityResourceSchema = RepositoryPathSchema");

    const run = read("src/daemon/run.ts");
    const recorder = run.slice(
      run.indexOf("export const createAgentActivityRecorder"),
      run.indexOf("export const recordStageProviderBatchAdmissionDiagnostic"),
    );
    expect(recorder).toContain("if (count >= 32) return");
    expect(recorder).toContain("if (key === lastKey) return");
    expect(recorder).toContain("appendRunEvent(runtime, runId, payload)");
    expect(recorder).toContain("category: payload.category");
    expect(recorder).toContain("resource: payload.resource");
    expect(recorder).toContain("summary: payload.summary");

    const openCode = read("src/shell/opencode.ts");
    const extraction = openCode.slice(
      openCode.indexOf("const activityForToolName"),
      openCode.indexOf("const runPromptToText"),
    );
    for (const required of [
      'normalized.includes("read")',
      'normalized.includes("search")',
      'normalized.includes("edit")',
      'normalized.includes("test")',
      'category: "REVIEWING_RESULTS"',
      'category: "RETRYING"',
    ]) {
      expect(extraction).toContain(required);
    }
    for (const forbidden of [
      "event.data.input",
      "event.data.output",
      "event.data.metadata",
      "event.data.reasoning",
      "part.state.input",
      "part.state.output",
      "part.state.metadata",
    ]) {
      expect(extraction).not.toContain(forbidden);
    }

    const promptStart = openCode.indexOf("const runPromptToText = async");
    const promptEnd = openCode.indexOf("const formatRepairPrompt", promptStart);
    expect(promptStart).toBeGreaterThanOrEqual(0);
    expect(promptEnd).toBeGreaterThan(promptStart);
    const prompt = openCode.slice(promptStart, promptEnd);
    expect(prompt).toContain("consumeLiveActivity(");
    expect(prompt).toContain(".catch(() => undefined)");
    expect(prompt).toContain("context = await client.session.context({ sessionID })");
    expect(prompt).toContain("await recordTerminalContextActivity(context, promptId, onActivity)");
  });

  it("keeps the exact locked package and runtime pins with no convenience dependency expansion", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.dependencies).toEqual({
      "@astryxdesign/core": "0.7.13",
      "@astryxdesign/theme-neutral": "0.7.13",
      "@codemirror/commands": "6.11.1",
      "@codemirror/lang-markdown": "6.5.2",
      "@codemirror/language": "6.13.1",
      "@codemirror/state": "6.7.6",
      "@lezer/highlight": "1.2.5",
      "@opencode/client": "2.2.6",
      "@stylexjs/stylex": "0.19.1",
      "@tanstack/react-query": "5.105.0",
      codemirror: "6.0.2",
      react: "19.3.1",
      "react-dom": "19.3.1",
      zod: "4.6.7",
    });
    expect(packageJson.devDependencies).toEqual({
      "@playwright/test": "1.64.1",
      "@tailwindcss/vite": "4.3.3",
      "@types/bun": "1.4.4",
      "@types/react": "19.3.0",
      "@types/react-dom": "19.3.0",
      tailwindcss: "4.3.3",
      typescript: "7.0.2",
      vite: "8.3.5",
      vitest: "5.0.5",
    });
    expect(read(".bun-version").trim()).toBe("1.4.4");
    expect(read(".node-version").trim()).toBe("26.13.0");
    expect(existsSync(join(root, "bun.lock"))).toBe(true);

    const allDependencies = new Set([
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
    ]);
    for (const forbidden of [
      "react-router",
      "react-router-dom",
      "zustand",
      "jsdom",
      "happy-dom",
      "@testing-library/react",
      "@vitejs/plugin-react",
      "@astryxdesign/build",
      "@astryxdesign/cli",
      "react-router",
      "react-router-dom",
      "zustand",
      "lexical",
      "@uiw/react-codemirror",
      "monaco-editor",
      "@mdxeditor/editor",
      "prosemirror-state",
      "prosemirror-view",
    ]) {
      expect(allDependencies.has(forbidden)).toBe(false);
    }
  });

  it("keeps one productive Order identity with Gateweft recognition bounded to predecessor migration", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      name: string;
      bin: Record<string, string>;
    };
    expect(packageJson.name).toBe("pontivus-order");
    expect(packageJson.bin).toEqual({ order: "src/cli.ts" });
    expect(existsSync(join(root, "pontivus-order.toml"))).toBe(true);
    expect(existsSync(join(root, "pontivus-order.toml.example"))).toBe(true);
    expect(existsSync(join(root, "gateweft.toml"))).toBe(false);
    expect(existsSync(join(root, "gateweft.toml.example"))).toBe(false);

    const runtime = read("src/shell/runtime.ts");
    expect(runtime).toContain('"pontivus-order"');
    expect(runtime).toContain('"order.sqlite3"');
    expect(runtime).toContain("PONTIVUS_ORDER_STATE_ROOT");
    expect(runtime).not.toContain("GATEWEFT_STATE_ROOT");

    const execution = read("src/core/execution.ts");
    expect(execution).toContain("order-tasks");
    expect(execution).not.toContain("gateweft-tasks");

    const server = read("src/daemon/server.ts");
    expect(server).toContain("pontivus_order_session");
    expect(server).toContain("PONTIVUS_ORDER_BIND");
    expect(server).not.toContain("gateweft_session");

    const application = read("ui/src/app.tsx");
    expect(application).toContain('"pontivus-order-theme"');
    expect(application).not.toContain("gateweft-theme");

    const theme = read("ui/src/theme.css");
    expect(theme).not.toContain("--pontivus-plugin-");
    expect(theme).not.toContain("--gw-");
    expect(theme).not.toContain(".gw-");

    const walk = (directory: string): string[] =>
      readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
        const relative = directory + "/" + entry.name;
        return entry.isDirectory() ? walk(relative) : [relative];
      });
    const productiveFiles = [
      "README.md",
      "AGENTS.md",
      "install.sh",
      "index.html",
      "package.json",
      ...walk("src").filter((path) => path.endsWith(".ts")),
      ...walk("ui").filter((path) => /\.(?:ts|tsx|css)$/.test(path)),
    ];
    const legacyHits = productiveFiles.flatMap((path) =>
      read(path).split("\n").flatMap((line, index) =>
        /Gateweft|gateweft|GATEWEFT/.test(line)
          ? [{ path, line: index + 1, text: line }]
          : []),
    );
    expect(
      legacyHits.filter(({ path }) =>
        path !== "README.md" &&
        path !== "src/installer.ts" &&
        path !== "src/shell/project.ts"),
    ).toEqual([]);
    expect(read("src/installer.ts")).toContain("migrateLegacyGateweftInstallation");
    expect(read("src/installer.ts")).toContain('"gateweft.service"');
    expect(read("src/installer.ts")).toContain('"gateweft.sqlite3"');
    expect(read("src/shell/project.ts")).toContain('"gateweft.toml"');
  });

  it("keeps the exact compiler/build boundary", () => {
    const tsconfig = JSON.parse(read("tsconfig.json")) as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions).toEqual({
      target: "ESNext",
      lib: ["ESNext", "DOM", "DOM.Iterable"],
      module: "Preserve",
      moduleResolution: "bundler",
      moduleDetection: "force",
      jsx: "react-jsx",
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      isolatedModules: true,
      strict: true,
      noEmit: true,
      types: ["bun"],
      resolveJsonModule: true,
    });

    const vite = read("vite.config.ts");
    expect(vite).toContain("tailwindcss()");
    expect(vite).toContain("rolldownOptions");
    expect(vite).toContain("moduleLevelDirective: false");
    expect(vite).not.toContain("onwarn");
    expect(vite).not.toContain("@vitejs/plugin-react");

    const styles = read("ui/src/styles.css");
    expect(styles).toContain("@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;");
    expect(styles).toContain('@import "tailwindcss/theme.css" layer(theme);');
    expect(styles).toContain('@import "@astryxdesign/core/reset.css";');
    expect(styles).toContain('@import "@astryxdesign/core/astryx.css";');
    expect(styles).toContain('@import "@astryxdesign/theme-neutral/theme.css";');
    expect(styles).toContain('@import "tailwindcss/utilities.css" layer(utilities);');
    expect(styles).not.toContain("pontivus-workbench.css");
    expect(styles).not.toContain("tailwind-theme.css");

    const main = read("ui/src/main.tsx");
    expect(main.match(/new QueryClient\(/g)).toHaveLength(1);
    expect(main.match(/createRoot\(/g)).toHaveLength(1);
    const app = read("ui/src/app.tsx");
    expect(app).toContain("<Theme");
    expect(app).toContain("neutralTheme");
    expect(app).toContain("mode={themePreference}");
    expect(app).not.toContain("applyThemePreference");

  });

  it("keeps the local semantic UI boundary narrow and Astryx-backed", () => {
    const primitiveDirectory = join(root, "ui", "src", "primitives");
    const names = readdirSync(primitiveDirectory).sort();
    expect(names).toEqual([
      "WorkbenchAction.tsx",
      "WorkbenchAttention.tsx",
      "WorkbenchConfirmation.tsx",
      "WorkbenchContextPanel.tsx",
      "WorkbenchDialogue.tsx",
      "WorkbenchDisclosure.tsx",
      "WorkbenchField.tsx",
      "WorkbenchForm.tsx",
      "WorkbenchIcon.tsx",
      "WorkbenchIdentity.tsx",
      "WorkbenchLayout.tsx",
      "WorkbenchMasterDetail.tsx",
      "WorkbenchNotice.tsx",
      "WorkbenchRail.tsx",
      "WorkbenchResourceRow.tsx",
      "WorkbenchReview.tsx",
      "WorkbenchSectionHeader.tsx",
      "WorkbenchSelector.tsx",
      "WorkbenchSettingsLayout.tsx",
      "WorkbenchState.tsx",
      "WorkbenchStatus.tsx",
      "WorkbenchSurface.tsx",
      "WorkbenchTable.tsx",
      "WorkbenchTaskPanel.tsx",
      "WorkbenchTimeline.tsx",
      "WorkbenchToolbar.tsx",
      "WorkbenchUtilityLink.tsx",
    ]);

    const source = names.map((name) => read("ui/src/primitives/" + name)).join("\n");
    expect(source).toContain("@astryxdesign/core");
    expect(source).not.toContain("@plugin/");
    expect(source).not.toContain("@radix-ui/");
    expect(source).not.toContain("@tremor/");
    expect(source).not.toContain(" as unknown as ");
    expect(source).not.toContain(" as any");
    expect(source).not.toContain("@stylexjs/stylex");
    expect(source).not.toContain("RichTextEditor");

    const layout = read("ui/src/primitives/WorkbenchLayout.tsx");
    expect(layout).toContain('"(min-width: 1280px)"');
    expect(layout).toContain("<AppShell");
    expect(layout).toContain("<Layout");
    expect(layout).toContain("<Drawer");
    expect(layout).not.toContain("inspector-fallback");

    const theme = read("ui/src/theme.css");
    expect(theme).toContain("--color-background-body: #FFFFFF");
    expect(theme).toContain("--color-background-body: #111A29");
    expect(theme).toContain("--order-context-width: 22rem");
    expect(theme).not.toContain("--order-color-");
    expect(theme).not.toContain("--order-workbench-");
    expect(theme).not.toContain("--order-editor-");
    expect(theme).not.toContain("--_");
    expect(theme).not.toContain("color-mix(");
    expect(theme).not.toContain("!important");
    expect(theme).not.toContain("[data-testid=");

    const taskPanel = read("ui/src/primitives/WorkbenchTaskPanel.tsx");
    expect(taskPanel).toContain('width="42rem"');
    expect(taskPanel).not.toContain("100vw");
    expect(taskPanel).not.toContain("calc(");
    expect(theme).not.toContain("--pontivus-plugin-panel-inspector-width-standard: 26.25rem");
    expect(theme.split("/* 2. Order-only structural/readability roles. */")[1]).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);

    const styles = read("ui/src/styles.css");
    expect(styles).not.toMatch(/\.order-[A-Za-z0-9_-]+/);
    expect(styles).toContain("var(--color-background-body)");
    expect(styles).toContain("var(--color-text-primary)");

    const media = [...theme.matchAll(/@media\s*\(([^)]+)\)/g)].map((match) => match[1]).sort();
    expect(media).toEqual([
      "max-width: 1279px",
      "max-width: 799px",
      "prefers-color-scheme: dark",
    ]);

    const renderers = readdirSync(join(root, "ui", "src"), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
      .map((entry) => entry.name)
      .sort();
    expect(renderers).toEqual([
      "ActivityComposer.tsx",
      "ActivityWorkspace.tsx",
      "CreateWorkItem.tsx",
      "DocumentWorkspace.tsx",
      "EvidenceViewer.tsx",
      "ExecutionWorkspace.tsx",
      "MarkdownEditor.tsx",
      "MarkdownSourceEditor.tsx",
      "OpenCodeAccountControl.tsx",
      "OpenCodeAccountSettings.tsx",
      "PreSignoffStageWorkspace.tsx",
      "ProposalReview.tsx",
      "ReadinessWorkspace.tsx",
      "RunEventTimeline.tsx",
      "SettingsWorkspace.tsx",
      "SignoffReview.tsx",
      "TerminalResult.tsx",
      "WorkItemContext.tsx",
      "WorkItemIdentityRow.tsx",
      "WorkItemQueue.tsx",
      "WorkItemWorkspace.tsx",
      "WorkflowMaterialSelector.tsx",
      "WorkflowRail.tsx",
      "WorkflowStepFrame.tsx",
      "app.tsx",
      "main.tsx",
    ]);

    const bootstrap = new Set(["main.tsx"]);
    const rendererSource = renderers
      .filter((name) => !bootstrap.has(name))
      .map((name) => read("ui/src/" + name))
      .join("\n");
    for (const foundationMechanic of [
      "@astryxdesign/core/AppShell",
      "@astryxdesign/core/Layout",
      "@astryxdesign/core/Drawer",
      "@astryxdesign/core/Dialog",
      "@astryxdesign/core/AlertDialog",
      "@astryxdesign/core/Button",
      "@astryxdesign/core/IconButton",
      "@astryxdesign/core/StatusDot",
      "@astryxdesign/core/Banner",
      "@astryxdesign/core/Table",
      "@astryxdesign/core/List",
    ]) {
      expect(rendererSource).not.toContain(foundationMechanic);
    }
    expect(rendererSource).not.toContain("@astryxdesign/core/Badge");

    for (const adapter of [
      "WorkItemIdentityRow.tsx",
      "WorkflowMaterialSelector.tsx",
      "WorkflowRail.tsx",
    ]) {
      expect(existsSync(join(root, "ui", "src", adapter))).toBe(true);
    }
  });

  it("keeps reference-driven presentation subordinate to Workbench and Astryx ownership", () => {
    const evidence = read("ui/src/EvidenceViewer.tsx");
    for (const required of [
      'from "@astryxdesign/core/CodeBlock"',
      "WorkbenchSurface",
      "WorkbenchSectionHeader",
      "WorkbenchState",
      "<CodeBlock",
      'language="plaintext"',
      'container="card"',
    ]) {
      expect(evidence).toContain(required);
    }
    for (const forbidden of [
      "order-evidence-viewer",
      "order-code-view",
      "order-evidence-code-bytes",
      "<pre",
    ]) {
      expect(evidence).not.toContain(forbidden);
    }

    const approval = read("ui/src/SignoffReview.tsx");
    expect(approval).toContain("WorkbenchReview");
    expect(approval).toContain("packageStale?: boolean");
    expect(approval).toContain("Prior governed package material remains inspection-only");
    expect(approval).toContain(
      "historicalArtifact={packageStale ? selectedArtifact : undefined}",
    );
    expect(approval).toContain("embeddedReadOnly={packageStale}");
    expect(approval).toContain('label="Task technical details"');
    expect(approval).not.toContain('<MetadataListItem label="Task id">');
    expect(approval).not.toContain('<MetadataListItem label="Approval">');

    const workspace = read("ui/src/WorkItemWorkspace.tsx");
    expect(workspace).toContain("packageStale={packageStaleOwner !== null}");
    expect(workspace).toContain(
      "artifacts={packageStaleOwner !== null ? allArtifacts : artifacts}",
    );
    expect(workspace).toContain('selectedStep === "AWAITING_SIGNOFF"');
    expect(workspace).toContain("api.listArtifacts(workItem.id)");

    const documentWorkspace = read("ui/src/DocumentWorkspace.tsx");
    expect(documentWorkspace).toContain("historicalArtifact?: ArtifactRef");
    expect(documentWorkspace).toContain("historicalArtifact ??");
    expect(documentWorkspace).toContain("enabled: historicalArtifact === undefined");

    const execution = read("ui/src/ExecutionWorkspace.tsx");
    expect(execution).toContain("WorkbenchMasterDetail");
    expect(execution).toContain("api.startExecutionTask(workItem.id,currentOwnerTask.id)");
    expect(execution).not.toContain("api.tick");
    expect(execution).toContain('masterLabel="Approved tasks"');
    expect(execution).toContain('label="Approved tasks"');
    expect(execution).toContain('selection="single"');
    expect(execution).toContain('description="Approved task"');
    expect(execution).not.toContain('description:"Approved task · "');
    expect(execution).toContain(
      'selectedRun===null?<WorkbenchState kind="empty" title="No persisted attempt events"/>',
    );
    expect(execution).toContain("lifecycleArtifactLabel(artifact.role)");
    expect(execution).toContain('label="Agent activity"');
    expect(execution).toContain("<RunEventTimeline");
    expect(execution).toContain('label="Technical details"');
    expect(execution).not.toContain("MarkdownEditor");
    expect(execution).not.toContain("updateArtifactContent");

    const masterDetail = read("ui/src/primitives/WorkbenchMasterDetail.tsx");
    expect(masterDetail).toContain('width="var(--order-master-width)"');
    expect(masterDetail).not.toContain("masterWidth");

    const markdownEditor = read("ui/src/MarkdownEditor.tsx");
    expect(markdownEditor).toContain("WorkbenchSectionHeader");
    expect(markdownEditor).not.toContain("order-markdown-document-view-header");
    expect(markdownEditor).not.toContain("order-markdown-document-view-actions");
    expect(markdownEditor).not.toContain("{toolbarAccessory}\n            <WorkbenchDisclosure");
    expect(markdownEditor).toContain("      />\n\n      <WorkbenchDisclosure");

    const theme = read("ui/src/theme.css");
    const sectionMarkers = [
      "/* 1. Root public Astryx token bridge. Exact Order color literals live only here. */",
      "/* 2. Order-only structural/readability roles. */",
      "/* 3. Closed Workbench primitive presentation. */",
      "/* 4. Specialist content and feature-semantic layout. */",
      "/* 5. Canonical Workbench breakpoint overrides only. */",
    ];
    const sectionOffsets = sectionMarkers.map((value) => theme.indexOf(value));
    expect(sectionOffsets.every((offset) => offset >= 0)).toBe(true);
    expect(sectionOffsets).toEqual([...sectionOffsets].sort((left, right) => left - right));

    const primitiveSection = theme.slice(sectionOffsets[2], sectionOffsets[3]);
    const specialistSection = theme.slice(sectionOffsets[3], sectionOffsets[4]);
    for (const selector of [
      ".order-settings-layout-constrained",
      ".order-settings-layout-constrained-navigation",
      ".order-settings-layout-constrained-content",
      ".order-settings-layout-navigation-surface",
      ".order-settings-layout-content-surface",
    ]) {
      expect(primitiveSection).toContain(selector);
      expect(specialistSection).not.toContain(selector);
    }

    expect(specialistSection).not.toContain(".order-workbench-");

    for (const forbidden of [
      ".order-evidence-viewer",
      ".order-evidence-code-label",
      ".order-code-view",
      ".order-evidence-code-bytes",
      ".order-markdown-document-view-header",
      ".order-markdown-document-view-actions",
      "border-radius: 999px",
      "border-radius: 50%",
      "font-size: 0.75rem",
      "min-height: 22rem",
      "min-height: 28rem",
      "min-height: 32rem",
      "min-height: 36rem",
    ]) {
      expect(theme).not.toContain(forbidden);
    }

    const presentationCss = theme.slice(sectionOffsets[2]);
    const rawLengths = [...presentationCss.matchAll(/\b\d+(?:\.\d+)?(?:px|rem)\b/g)]
      .map((match) => match[0])
      .filter((value) => !["1px", "799px", "1279px"].includes(value));
    expect(rawLengths).toEqual([]);
    expect(presentationCss).not.toMatch(/font-size:\s*\d/);
    expect(presentationCss).not.toMatch(/border-radius:\s*(?:\d|50%|999)/);
    expect(presentationCss).not.toContain("box-shadow:");
    expect(theme.slice(sectionOffsets[1])).not.toContain("!important");

    const documentViewRule = theme.match(/\.order-markdown-document-view\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(documentViewRule).not.toMatch(/(?:^|\s)(?:background|border|border-radius)\s*:/);

    const editorRule = theme.match(/\.order-markdown-editor\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(editorRule).toContain("grid-template-rows: auto auto auto auto minmax(0, 1fr);");

    const editorPaneRule = theme.match(/\.order-editor-source-pane,\s*\n\.order-editor-preview-pane\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(editorPaneRule).toContain("min-width: 0;");
    expect(editorPaneRule).toContain("min-height: 0;");
    expect(editorPaneRule).toContain("overflow: hidden;");

    const baseCss = theme.slice(0, theme.indexOf("@media"));
    const baseSelectors = [...baseCss.matchAll(/(?:^|\n)([^@\n][^{}]*)\{/g)]
      .map((match) => match[1]?.trim().replace(/\s+/g, " ") ?? "")
      .filter((selector) => selector.length > 0 && !selector.startsWith("/*"));
    const selectorCounts = new Map<string, number>();
    for (const selector of baseSelectors) {
      selectorCounts.set(selector, (selectorCounts.get(selector) ?? 0) + 1);
    }
    expect(
      [...selectorCounts.entries()].filter(([, count]) => count > 1),
    ).toEqual([]);

    const cssFiles = (
      directory: string,
      prefix = "",
    ): readonly string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const relative = prefix.length === 0 ? entry.name : prefix + "/" + entry.name;
        const absolute = join(directory, entry.name);
        if (entry.isDirectory()) return cssFiles(absolute, relative);
        return entry.isFile() && entry.name.endsWith(".css") ? [relative] : [];
      });
    expect([...cssFiles(join(root, "ui", "src"))].sort()).toEqual([
      "styles.css",
      "theme.css",
    ]);
  });

  it("keeps browser state and transport on the canonical HTTP boundary", () => {
    const main = read("ui/src/main.tsx");
    expect(main).toContain("retry: false");
    expect(main).toContain("refetchOnWindowFocus: false");
    expect(main).toContain("refetchOnReconnect: false");
    expect(main).toContain("staleTime: 0");

    const browserSources = [
      read("ui/src/app.tsx"),
      read("ui/src/WorkItemWorkspace.tsx"),
      read("ui/src/ActivityWorkspace.tsx"),
      read("ui/src/RunEventTimeline.tsx"),
      read("ui/src/ExecutionWorkspace.tsx"),
      read("ui/src/EvidenceViewer.tsx"),
    ].join("\n");
    expect(browserSources).toContain("refetchInterval:");
    expect(browserSources).toContain("1000");
    expect(browserSources).not.toContain("WebSocket");
    expect(browserSources).not.toContain("EventSource");

    const http = read("ui/src/http.ts");
    expect(http).toContain('credentials: "same-origin"');
    expect(http).not.toContain("Authorization");
    expect(http).not.toContain("Bearer ");
    expect(http).not.toContain("WebSocket");
    expect(http).not.toContain("EventSource");
  });

  it("certifies canonical Workbench workflow-state ownership and observational reads", () => {
    const walk = (directory: string): string[] =>
      readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
        const relative = directory + "/" + entry.name;
        return entry.isDirectory() ? walk(relative) : [relative];
      });
    const production = [
      ...walk("src/core"),
      ...walk("src/daemon"),
      ...walk("ui/src"),
    ]
      .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
      .map(read)
      .join("\n");

    const lifecycle = read("src/core/lifecycle.ts");
    for (const owner of [
      "transitionWorkItem",
      "stageRunInteraction",
      "validateStageProviderTurn",
      "deriveProposalDecision",
      "deriveReachedStages",
      "deriveExecutionOwner",
      "deriveValidationBoundary",
      "deriveRecoveryDisposition",
      "deriveObservationCoherence",
      "deriveCurrentAttention",
      "deriveWorkflowRail",
    ]) {
      expect(lifecycle).toContain("export const " + owner);
    }
    expect(production).not.toMatch(/\b(?:type|interface|class)\s+WorkflowState\b/);
    expect(production).not.toMatch(/z\.[A-Za-z]+\([^)]*WorkflowState/);

    expect(lifecycle).toContain('"RECONCILE_AUTHORITY"');
    expect(lifecycle).toContain("validationBoundaryFromEvents");
    expect(lifecycle).toContain('run.role === "REMEDIATOR"');
    expect(lifecycle).toContain("REMEDIATOR trigger must identify VALIDATION_FAILED");
    expect(lifecycle).toContain("REMEDIATOR failure must belong to the current ExecutionTask");
    expect(lifecycle).toContain('run.role === "REVIEWER"');
    expect(lifecycle).toContain("REVIEWER trigger must identify CANDIDATE_STATE_RECORDED");
    expect(lifecycle).toContain("REVIEWER candidate must belong to the current ExecutionTask");
    expect(lifecycle).toContain("candidateRun.triggerEventId === run.triggerEventId");
    expect(lifecycle).not.toContain("export const sourceChangeLifecycleState");
    expect(lifecycle).toContain("proposal has duplicate disposition");
    expect(lifecycle).toContain("rejected proposal cannot have adoption intent");
    expect(lifecycle).toContain("adopted proposal requires durable adoption intent");
    expect(lifecycle.indexOf('if (input.currentness.tag === "STALE") return "STALE_AUTHORITY";'))
      .toBeLessThan(lifecycle.indexOf('if (input.recovery.tag !== "NONE") return "RECOVERY";'));
    const coherencePolicy = lifecycle.slice(
      lifecycle.indexOf("export const deriveObservationCoherence"),
      lifecycle.indexOf("export const deriveCurrentAttention"),
    );
    expect(coherencePolicy).toContain('run.stage !== workItem.stage');
    expect(coherencePolicy).toContain('task.state !== "RUNNING"');
    expect(coherencePolicy).toContain('task.state === "BLOCKED"');
    expect(coherencePolicy).toContain('workItem.status === "BLOCKED"');
    const contracts = read("src/core/contracts.ts");
    expect(contracts).toContain("UpstreamReturnStageSchema");
    expect(contracts).toContain("ReconcileWorkItemAuthoritySchema");
    expect(contracts).toContain("staleAuthorityOwner: UpstreamReturnStageSchema.nullable()");

    const presentation = read("ui/src/workbench-presentation.ts");
    expect(presentation).toContain("reachStateForStage");
    expect(presentation).toContain("type CurrentAttentionTag");
    expect(presentation).toContain("type StageRunInteraction");
    expect(presentation).toContain("type ExecutionOwner");
    expect(presentation).not.toContain("workflowStepIndex");
    expect(presentation).not.toContain("workflowSteps.findIndex");
    const materialPolicy = presentation.slice(
      presentation.indexOf("const currentStageRun"),
      presentation.indexOf("export const runIsActive"),
    );
    expect(materialPolicy).toContain("input.currentAttention");
    expect(materialPolicy).toContain("input.stageInteraction");
    expect(materialPolicy).toContain("input.executionOwner");
    expect(materialPolicy).toContain('input.currentAttention === "CONVERGING"');
    expect(materialPolicy).toContain("execution owner must identify a loaded ExecutionTask");
    expect(materialPolicy).not.toMatch(/\.status\s*===/);
    expect(materialPolicy).not.toMatch(/\.state\s*===\s*["'](?:RUNNING|BLOCKED)["']/);

    const rail = read("ui/src/WorkflowRail.tsx");
    expect(rail).toContain("WorkflowRailItem");
    expect(rail).not.toContain("stageOrder");
    expect(rail).not.toContain("stageRank");

    const app = read("ui/src/app.tsx");
    expect(app).toContain("api.getWorkItem(selectedWorkItemId)");
    expect(app).toContain("workbenchQueryKeys.workItem(selectedWorkItemId)");
    expect(app).not.toContain(
      "workItems.find((item) => item.id === selectedWorkItemId)",
    );

    const http = read("ui/src/http.ts");
    expect(http).toContain("export const isCurrentStateConflict");
    expect(http).toContain('error.orderError.code === "CURRENT_STATE_CONFLICT"');

    const queryKeys = read("ui/src/query-keys.ts");
    expect(queryKeys).toContain("workbenchMutationInvalidationKeys");
    expect(queryKeys).toContain("invalidateWorkbenchMutation");
    expect(queryKeys).toContain("workbenchQueryKeys.workItem(workItemId)");

    const workspace = read("ui/src/WorkItemWorkspace.tsx");
    expect(workspace).toContain("deriveObservationCoherence");
    expect(workspace).toContain("deriveCurrentAttention");
    expect(workspace).toContain("deriveValidationBoundary");
    expect(workspace).toContain('workItem.stage === "EXECUTION" ? tasks : []');
    expect(workspace).toContain('workItem.stage === "EXECUTION" || workItem.stage === "COMPLETE"');
    expect(workspace).toContain("deriveObservationCoherence(\n    workItem,\n    runs,\n    allRunEvents,\n    coherenceTasks");
    expect(workspace).toContain("executionObservationPending");
    expect(workspace).toContain("executionEventsPending");
    expect(workspace).toContain("currentExecutionObservationRequired");
    expect(workspace).toContain("tasksQuery.data === undefined");
    expect(workspace).toContain("currentExecutionTasks");
    expect(workspace).toContain('workItem.stage === "EXECUTION" &&');
    expect(workspace).toContain("executionEventsPending");
    expect(workspace).toContain("validationBoundary={validationBoundary}");
    expect(workspace).toContain("mutationConflict,");
    expect(workspace).not.toContain("mutationConflict: false");
    expect(workspace).toContain("api.isCurrentStateConflict(error)");
    expect(workspace).toContain('currentAttention === "MUTATION_CONFLICT"');
    expect(workspace).toContain('case "MUTATION_CONFLICT": return "error" as const;');
    expect(workspace).toContain("mutationConflictWorkItemUpdatedAt");
    expect(workspace).toContain("selectedWorkItemUpdatedAt !== mutationConflictWorkItemUpdatedAt.current");
    expect(workspace).toContain("currentObservationError === null");
    expect(workspace).toContain("selectedWorkItemError");
    expect(workspace).toContain("mutationConflictObservation.current = observationVersion");
    expect(workspace).toContain("Workflow state changed during the action");
    expect(workspace).toContain("onMutationError={reportMutationError}");
    expect(workspace).toContain("deriveWorkflowRail");
    expect(workspace).toContain('currentAttention === "CONVERGING"');
    expect(workspace).toContain("currentStageRunId: currentStageRun?.id ?? null");
    expect(workspace).toContain("currentAttention,");
    expect(workspace).toContain("stageInteraction: currentStageInteraction");
    expect(workspace).toContain("executionOwner,");

    expect(workspace).toContain("api.getWorkItemSource(workItem.id)");
    expect(workspace).toContain("sourceQuery.data.sha256 !== workItem.sourceSha256");
    expect(workspace).toContain("sourceAuthorityRequiresReconciliation");
    expect(workspace).toContain('currentness.tag === "STALE" && !activeRunOwnsAuthoring');
    expect(workspace).toMatch(/recovery\.tag === "RECONCILE_AUTHORITY"[\s\S]*!runs\.some\(runIsActive\)/);
    expect(workspace).toContain('orderError.code === "STALE_AUTHORITY"');
    expect(workspace).toContain("orderError.staleAuthorityOwner");
    expect(workspace).toContain("api.reconcileWorkItemAuthority");
    expect(workspace).toContain("onError: invalidate");
    expect(workspace).toContain('"Returned upstream before sign-off"');
    expect(workspace).not.toContain('if (selectedStepState === "HISTORICAL") return "Approved"');
    expect(workspace).not.toMatch(/message\.(?:match|includes)|parse.*message/i);
    expect(workspace).toContain("signoffPackageQuery.isFetching");
    expect(workspace).toContain("api.listExecutionTasks(workItem.id)");
    expect(workspace).toContain("api.listArtifacts(workItem.id)");
    expect(workspace).toContain("packageValue={signoffPackageQuery.data ?? null}");
    expect(workspace).toContain("tasks={tasks}");
    expect(workspace).toContain("runs={runs}");
    expect(workspace).toContain("artifacts={allArtifacts}");

    const signoffReview = read("ui/src/SignoffReview.tsx");
    expect(signoffReview).toContain("packageValue: SignoffPackage | null");
    expect(signoffReview).toContain("packageFetching: boolean");
    expect(signoffReview).not.toContain("api.getSignoffPackage(");
    expect(signoffReview).not.toContain("api.listLifecycleArtifacts(");
    expect(signoffReview).not.toContain("api.listExecutionTasks(");
    expect(signoffReview).not.toContain("workbenchQueryKeys.signoffPackage(");
    expect(signoffReview).not.toContain("workbenchQueryKeys.lifecycleArtifacts(");
    expect(signoffReview).not.toContain("workbenchQueryKeys.tasks(");

    const documents = read("ui/src/DocumentWorkspace.tsx");
    expect(documents).toContain("onMutationError?.(error)");

    const activity = read("ui/src/ActivityWorkspace.tsx");
    expect(activity).toContain("onMutationError?.(error)");
    expect(activity).toContain('currentAttention !== "MUTATION_CONFLICT"');
    expect(activity).toContain("currentRunId");
    expect(activity).toContain("currentInteraction");
    expect(activity).toContain("runs: readonly Run[]");
    expect(activity).not.toContain("api.listRuns(");
    expect(activity).not.toContain("workbenchQueryKeys.runs(");
    expect(activity).not.toContain("stageRunInteraction");
    expect(activity).not.toContain("runNeedsAttention");
    expect(activity).not.toContain("const canRetry");
    expect(activity).not.toContain("const canResume");

    const proposalReview = read("ui/src/ProposalReview.tsx");
    expect(proposalReview).toContain("onMutationError?.(error)");
    expect(proposalReview).not.toContain("ActivityComposer");
    expect(proposalReview).not.toContain("unresolvedHumanInput");

    const execution = read("ui/src/ExecutionWorkspace.tsx");
    expect(execution).toContain("onMutationError?.(error)");
    expect(execution).toContain("onError:reportError");
    expect(execution).toContain("executionOwner: ExecutionOwner");
    expect(execution).toContain("tasks: readonly ExecutionTask[]");
    expect(execution).toContain("runs: readonly Run[]");
    expect(execution).toContain("artifacts: readonly ArtifactRef[]");
    expect(execution).toContain("validationBoundary: ValidationBoundary | null");
    expect(execution).not.toContain("api.listExecutionTasks(");
    expect(execution).not.toContain("api.listRuns(");
    expect(execution).not.toContain("api.listArtifacts(");
    expect(execution).not.toContain("workbenchQueryKeys.tasks(");
    expect(execution).not.toContain("workbenchQueryKeys.runs(");
    expect(execution).not.toContain("workbenchQueryKeys.artifacts(");
    expect(execution).toContain('scope: "Current" | "Recorded"');
    expect(execution).toContain('scope + " boundary: updating"');
    expect(execution).toContain('boundaryScope={currentOwnerTask?.id === selectedTask.id ? "Current" : "Recorded"}');
    expect(execution).toContain('selectedTask.state === "CANDIDATE_DONE" || selectedTask.state === "ALREADY_SATISFIED"');
    expect(execution).toContain("validationBoundaryStatus(boundary, boundaryScope)");
    expect(execution).not.toContain("deriveValidationBoundary");
    expect(execution).not.toContain("deriveExecutionOwner");
    expect(execution).toContain("currentOwnerTask");
    expect(execution).toContain("currentOwnerRun");
    expect(execution).not.toContain(
      'selectedTask?.state==="BLOCKED"',
    );

    const coordinator = read("src/daemon/coordinator.ts");
    expect(coordinator).toContain("WorkItem cannot resume while a Run is active");
    expect(coordinator).toContain("a Run became active before Resume commit");
    const cancelPolicy = coordinator.slice(
      coordinator.indexOf("const cancelRunUnlocked"),
      coordinator.indexOf("export const cancelRun"),
    );
    expect(cancelPolicy).toContain("Run stopped being cancellable before Cancel commit");
    expect(cancelPolicy).not.toContain("return current");

    const runtime = read("src/daemon/runtime.ts");
    expect(runtime).toContain("operatorMutations: new Set()");
    expect(runtime).toContain("withWorkItemOperatorMutation");
    expect(runtime).not.toContain("operatorMutationQueue");

    const source = read("src/daemon/work-item-source.ts");
    const sourceRead = source.slice(
      source.indexOf("export const revalidateWorkItemSource"),
      source.indexOf("export const createWorkItemFromSource"),
    );
    expect(sourceRead).toContain("inspectWorkItemSource");
    expect(sourceRead).not.toContain("applyPlan(");
    expect(sourceRead).not.toContain("updateWorkItemLifecycle(");

    const stageDaemon = read("src/daemon/stage.ts");
    const startStagePolicy = stageDaemon.slice(
      stageDaemon.indexOf("const startStageRunUnlocked"),
      stageDaemon.indexOf("export const startStageRun"),
    );
    expect(startStagePolicy).toContain("contextState.staleStage");
    expect(startStagePolicy).not.toContain('tag: "LIFECYCLE_ARTIFACT_CHANGED"');
    const inputPolicy = stageDaemon.slice(
      stageDaemon.indexOf("const submitRunInputUnlocked"),
      stageDaemon.indexOf("export const submitRunInput"),
    );
    expect(inputPolicy).toContain("contextState.staleStage");
    expect(inputPolicy).not.toContain("updateWorkItemLifecycle");
    expect(stageDaemon).toContain("requireCurrentProposalDecision");
    expect(stageDaemon).toContain("proposal decision requires an OPEN current STAGE Run");
    expect(stageDaemon).toContain("lifecycle proposal role must equal owning Run stage");

    const authority = read("src/daemon/authority.ts");
    const lifecycleRead = authority.slice(
      authority.indexOf("export const currentLifecycleArtifacts"),
      authority.indexOf("export const resolveStageContextState"),
    );
    expect(lifecycleRead).not.toContain("currentFileArtifact(");
    expect(lifecycleRead).not.toContain("storeArtifact(");
    const signoffRead = authority.slice(
      authority.indexOf("export const computeSignoffPackage"),
      authority.indexOf("export const signoffPackageForWorkItem"),
    );
    expect(signoffRead).toContain('"R3",\n    false,');
    expect(signoffRead).not.toContain("updateWorkItemLifecycle(");

    expect(authority).toContain("staleAuthorityOwnerForFailure");
    expect(authority).toContain("reconcileWorkItemAuthority");
    expect(authority).toContain('tag: "RECONCILE_AUTHORITY"');

    const server = read("src/daemon/server.ts");
    expect(server).toContain('code: "STALE_AUTHORITY"');
    expect(server).toContain('parts[3] === "reconcile-authority"');
    expect(server).toContain("ReconcileWorkItemAuthoritySchema.parse");

    for (const daemonPath of [
      "src/daemon/work-item-source.ts",
      "src/daemon/authority.ts",
      "src/daemon/stage.ts",
      "src/daemon/coordinator.ts",
      "src/daemon/execution.ts",
    ]) {
      const daemon = read(daemonPath);
      expect(daemon).not.toContain("sourceChangeLifecycleState");
      expect(daemon).not.toContain("promoteIdeaToR1");
      expect(daemon).not.toContain("setWorkItemStatus(");
    }
  });

  it("keeps repository-native v4 as the only productive config persistence and v3 as migration input", () => {
    const contracts = read("src/core/contracts.ts");
    const sqlite = read("src/shell/sqlite.ts");
    const server = read("src/daemon/server.ts");
    const sourceDaemon = read("src/daemon/work-item-source.ts");
    const sourceCore = read("src/core/work-item-source.ts");
    const sourceShell = read("src/shell/work-item-source.ts");
    const lifecycle = read("src/core/lifecycle.ts");

    expect(contracts).toMatch(/OrderConfigSchema = z\.strictObject\(\{\s*version: z\.literal\(4\)/);
    expect(contracts).toContain("LegacyOrderConfigV3Schema");
    expect(contracts).toContain("LegacyOrderConfigV2Schema");
    const productiveConfig = contracts.slice(
      contracts.indexOf("export const OrderConfigSchema"),
      contracts.indexOf("export type OrderConfig"),
    );
    expect(productiveConfig).not.toContain("workItemRoot");
    expect(sqlite).toContain("PRAGMA user_version = 3");
    expect(sqlite).toContain("CREATE TABLE workItemSources");
    expect(sqlite).toContain("sourcePath TEXT NOT NULL,");
    expect(sqlite).not.toContain("sourcePath TEXT NOT NULL UNIQUE");
    expect(sqlite).toContain("migrateOrderDatabaseV2ToV3");
    expect(sqlite).not.toContain("PRAGMA user_version = 1");

    expect(server).toContain("CreateWorkItemSourceSchema.parse");
    expect(server).toContain("ExpectedHashMarkdownWriteSchema.parse");
    expect(server).not.toContain('requireString(body, "repositoryRoot")');
    expect(server).not.toContain('requireString(body, "origin")');

    expect(sourceDaemon).toContain("loadConfiguredProjects");
    expect(sourceDaemon).toContain("materializeLifecycleDrafts");
    expect(sourceDaemon).not.toContain('disposition: "MOVED"');
    expect(sourceShell).toContain("scanLegacyV2WorkItemSourcesForInstall");
    expect(sourceCore).toContain("workItemDocumentPath");
    expect(sourceCore).toContain("isUnsupportedWorkItemSchemaFailure");
    expect(lifecycle).not.toContain("work-item-source");
  });

  it("certifies the Order 0.2.2 productive context and failure contract end to end", () => {
    const contracts = read("src/core/contracts.ts");
    const repository = read("src/shell/repository.ts");
    const openCode = read("src/shell/opencode.ts");
    const run = read("src/daemon/run.ts");
    const stage = read("src/daemon/stage.ts");
    const execution = read("src/daemon/execution.ts");
    const validation = read("src/daemon/validation.ts");
    const context = read("ui/src/WorkItemContext.tsx");
    const documents = read("ui/src/DocumentWorkspace.tsx");
    const settings = read("ui/src/SettingsWorkspace.tsx");

    expect(contracts).toContain('z.literal("PRODUCTIVE_INVOCATION_FAILED")');
    expect(contracts).toContain("ChangeSurfacePathSchema");
    expect(contracts).toContain("repositoryPathNamesAgentInstruction");

    for (const mechanic of [
      "GIT_INDEX_FILE",
      '"read-tree", "HEAD"',
      '"add", "--intent-to-add", "--all"',
      '"diff"',
      '"--binary"',
      '"--full-index"',
      "materializeStageInspectionWorkspace",
      "source repository drifted while materializing",
    ]) {
      expect(repository).toContain(mechanic);
    }

    for (const mechanic of [
      "OPENCODE_CONFIG_CONTENT",
      "OPENCODE_CONFIG_DIR",
      "OPENCODE_DB",
      "client.skill.list",
      "client.mcp.list",
      "normalizeOpenCodeMcpNamespace",
      "admitProductiveOpenCode",
      "productiveInvocationFailureClassification",
    ]) {
      expect(openCode).toContain(mechanic);
    }
    expect(openCode.match(/client\.session\.create\s*\(/g) ?? []).toHaveLength(1);
    expect(openCode).not.toContain("session.instruction");

    expect(run).toContain("failRunForProductiveInvocation");
    expect(run).toContain('tag: "PRODUCTIVE_INVOCATION_FAILED"');
    expect(stage).toContain("stageMaterialIdentity");
    expect(stage).toContain("materializeStageInspectionWorkspace");
    expect(stage).toContain("failRunForProductiveInvocation");
    expect(execution).toContain("failRunForProductiveInvocation");
    expect(validation).toContain("repositoryPathNamesAgentInstruction");

    expect(context).toContain('data-testid="selected-view-context"');
    expect(documents).toContain('data-testid="document-git-controls"');
    expect(settings).toContain('label="Add repository"');
    expect(settings).toContain('title="Disconnect repository?"');
  });

  it("keeps guarded Markdown replacement on one exact effect path", () => {
    const writer = read("src/shell/file-write.ts");
    const sourceShell = read("src/shell/work-item-source.ts");
    const repositoryShell = read("src/shell/repository.ts");

    const createTemp = writer.indexOf("writeTemporary(target, bytes");
    const writeBytes = writer.indexOf("writeFileSync(descriptor, bytes)");
    const fileFsync = writer.indexOf("fsyncSync(descriptor)", writeBytes);
    const rename = writer.indexOf("renameSync(temporary, target)");
    const directoryFsync = writer.indexOf("fsyncParent(target)", rename);
    const readBack = writer.indexOf("verifyRegularTarget(target).bytes", directoryFsync);
    expect(createTemp).toBeGreaterThanOrEqual(0);
    expect(writeBytes).toBeGreaterThanOrEqual(0);
    expect(fileFsync).toBeGreaterThan(writeBytes);
    expect(rename).toBeGreaterThan(fileFsync);
    expect(directoryFsync).toBeGreaterThan(rename);
    expect(readBack).toBeGreaterThan(directoryFsync);

    expect(writer).toContain("O_EXCL");
    expect(writer).toContain("O_NOFOLLOW");
    expect(writer).toContain("join(\n    dirname(target),");
    expect(sourceShell).toContain("replaceRegularFileExpectedHash");
    expect(repositoryShell).toContain("replaceRegularFileExpectedHash");
    expect(sourceShell).not.toContain("renameSync");
    expect(repositoryShell).not.toContain("renameSync");
  });

  it("keeps saved OpenCode accounts safe, installation-global, and OpenCode-owned", () => {
    const contracts = read("src/core/contracts.ts");
    const openCode = read("src/shell/opencode.ts");
    const account = read("src/daemon/opencode-account.ts");
    const runtime = read("src/daemon/runtime.ts");
    const server = read("src/daemon/server.ts");
    const settings = read("src/daemon/settings.ts");
    const sqlite = read("src/shell/sqlite.ts");

    expect(contracts).toContain("OpenCodeAccountStateSchema");
    expect(contracts).toContain("OpenCodeAccountLoginAttemptSchema");
    expect(contracts).not.toMatch(/OpenCodeAccount[^\n]*(?:token|secret|credentialValue)/i);

    expect(openCode).toContain('openCodeAccountIntegrationId = "opencode"');
    expect(openCode).toContain('openCodeAccountMethodId = "device"');
    expect(openCode).toContain('openCodeConsoleDefaultEndpoint = "https://opencode.ai/console"');
    expect(openCode).toContain("client.integration.get");
    expect(openCode).not.toContain("client.credential.list");
    expect(openCode).toContain("client.credential.activate");
    expect(openCode).toContain("client.credential.update");
    expect(openCode).toContain("client.credential.remove");
    expect(openCode).toContain("client.integration.oauth.connect");
    expect(openCode).toContain("client.integration.oauth.status");
    expect(openCode).toContain("client.integration.oauth.cancel");
    expect(openCode).toContain('"account-control"');

    expect(account).toContain('run.status === "RUNNING" || run.status === "WAITING_FOR_INPUT"');
    expect(account).toContain("runtime.openCodeAccountMutationActive");
    expect(account).toContain("runtime.openCodeAccountLogin");
    expect(account).toContain("expectedActiveAccountId");
    expect(account).not.toContain(".query(");

    expect(runtime).toContain("openCodeAccountLogin");
    expect(runtime).toContain("openCodeAccountMutationActive");
    expect(server).toContain('"/api/opencode/accounts"');
    expect(server).toContain('"/api/opencode/accounts/login"');
    expect(server).toContain("pauseSchedulerForOpenCodeAccountMutation");
    expect(server).toContain("resumeSchedulerAfterOpenCodeAccountMutation");
    expect(server).toContain("requireOpenCodeAccountStableForRunStart");
    expect(server).toContain("resumeSchedulerForReadiness");
    expect(server).not.toContain("armScheduler(runtime)");
    expect(settings).toContain("startCoordinatorScheduler");
    expect(settings).toContain("stopCoordinatorScheduler");
    expect(settings).toContain("owner.current");
    expect(server).toContain("stopSavedOpenCodeAccountControl");

    expect(sqlite).not.toContain("openCodeAccount");
    expect(sqlite).not.toContain("opencodeAccount");
    expect(sqlite).not.toContain("credentialSecret");
  });

  it("keeps provider diagnostics bounded, secret-safe, coordinator-owned, and on existing Run evidence", () => {
    const contracts = read("src/core/contracts.ts");
    const executionCore = read("src/core/execution.ts");
    const openCode = read("src/shell/opencode.ts");
    const run = read("src/daemon/run.ts");
    const stage = read("src/daemon/stage.ts");
    const execution = read("src/daemon/execution.ts");
    const sqlite = read("src/shell/sqlite.ts");

    expect(contracts).toContain("ProviderDiagnosticRecordSchema");
    expect(contracts).toContain('z.literal("PROVIDER_DIAGNOSTICS_RECORDED")');
    expect(executionCore).not.toContain('"PROVIDER_DIAGNOSTICS_RECORDED"');

    expect(openCode).toContain("diagnosticStderrHeadBytes");
    expect(openCode).toContain("diagnosticStderrTailBytes");
    expect(openCode).toContain("[REDACTED SECRET LINE]");
    expect(openCode).toContain("onDiagnostics");
    expect(openCode.toLowerCase()).not.toContain("chain of thought");
    expect(openCode.toLowerCase()).not.toContain("hidden reasoning");

    expect(run).toContain("recordProviderDiagnostics");
    expect(run).toContain('tag: "PROVIDER_DIAGNOSTICS_RECORDED"');
    expect(run).toContain("writeRunEvidence(");
    expect(stage).toContain("recordProviderDiagnostics");
    expect(execution).toContain("recordProviderDiagnostics");
    expect(execution).toContain("diagnosticEvidence");

    expect(sqlite).not.toContain("providerDiagnostics");
    expect(sqlite).not.toContain("provider_diagnostics");
    expect(sqlite).not.toContain("telemetry");
  });

  it("certifies one owner per P7 cross-boundary concern with no browser-side semantic duplication", () => {
    const documentWorkspace = read("ui/src/DocumentWorkspace.tsx");
    const accountControl = read("ui/src/OpenCodeAccountControl.tsx");
    const accountSettings = read("ui/src/OpenCodeAccountSettings.tsx");
    const markdownSource = read("ui/src/MarkdownSourceEditor.tsx");
    const contracts = read("src/core/contracts.ts");
    const server = read("src/daemon/server.ts");
    const run = read("src/daemon/run.ts");
    const sqlite = read("src/shell/sqlite.ts");

    expect(documentWorkspace).toContain("api.getWorkItemDocumentationGitStatus");
    expect(documentWorkspace).toContain("api.commitWorkItemDocumentation");
    expect(documentWorkspace).not.toMatch(/spawnSync|execFile|git\s+(?:add|commit|status)/);

    expect(accountControl).toContain("useQuery");
    expect(accountControl).not.toContain("useMutation");
    expect(accountControl).toContain("onOpenSettings");
    expect(accountSettings).toContain("useMutation");
    expect(accountSettings).toContain("api.activateOpenCodeAccount");
    expect(accountSettings).toContain("api.renameOpenCodeAccount");
    expect(accountSettings).toContain("api.removeOpenCodeAccount");
    expect(accountSettings).toContain("api.startOpenCodeAccountLogin");
    expect(accountControl).not.toContain("localStorage");
    expect(accountSettings).not.toContain("localStorage");
    expect(accountControl).not.toContain("sessionStorage");
    expect(accountSettings).not.toContain("sessionStorage");
    expect(accountControl).not.toContain("providerID");
    expect(accountSettings).not.toContain("providerID");
    expect(accountControl).not.toContain("updateOrderConfig");
    expect(accountSettings).not.toContain("updateOrderConfig");

    expect(markdownSource).toContain("EditorView");
    expect(markdownSource).toContain("Compartment");
    expect(markdownSource).toContain("markdown()");
    expect(markdownSource).not.toContain("<textarea");

    expect(contracts).toContain("OrderHttpErrorSchema");
    expect(server).toContain("classifyHttpFailure");
    expect(server).toContain("OrderHttpErrorSchema.parse");

    expect(run).toContain("recordProviderDiagnostics");
    expect(run).toContain("writeRunEvidence(");
    expect(run).toContain('tag: "PROVIDER_DIAGNOSTICS_RECORDED"');

    expect(sqlite).not.toContain("openCodeAccount");
    expect(sqlite).not.toContain("opencodeAccount");
    expect(sqlite).not.toContain("credentialSecret");
  });

  it("keeps active-agent authoring exclusion separate from current-run interaction admission", () => {
    const workspace = read("ui/src/WorkItemWorkspace.tsx");
    const preSignoff = read("ui/src/PreSignoffStageWorkspace.tsx");

    expect(workspace).toContain(
      "documentMutationsDisabled =\n    interactionMutationsDisabled || activeRunOwnsAuthoring",
    );
    expect(workspace).toContain(
      "workflowMutationsDisabled =\n    interactionMutationsDisabled",
    );
    expect(workspace).toContain(
      "authoringMutationsDisabled={documentMutationsDisabled}",
    );
    expect(preSignoff).toContain(
      "mutationsDisabled={authoringMutationsDisabled}",
    );
    expect(preSignoff).toContain(
      "mutationsDisabled={mutationsDisabled}",
    );
  });

  it("keeps pre-signoff, Readiness and Approval free of a persistent generic material-selector axis", () => {
    const preSignoff = read("ui/src/PreSignoffStageWorkspace.tsx");
    const readiness = read("ui/src/ReadinessWorkspace.tsx");
    const approval = read("ui/src/SignoffReview.tsx");
    const implementation = read("ui/src/ExecutionWorkspace.tsx");

    for (const source of [readiness, approval]) {
      expect(source).not.toContain("WorkflowStepIndex");
      expect(source).not.toContain('data-testid="workflow-step-index"');
    }
    expect(preSignoff).not.toContain("WorkflowStepIndex");
    expect(preSignoff).toContain("WorkflowMaterialSelector");
    expect(preSignoff).toContain('"Supporting material and history"');
    expect(readiness).toContain("Evidence / attempt history");
    expect(approval).toContain('"Package material"');

    // Implementation is the sole workflow step allowed to retain persistent
    // operational master/detail material selection.
    expect(implementation).toContain("WorkflowStepIndex");
    expect(implementation).toContain("WorkbenchMasterDetail");
  });

  it("keeps the one-command productive installer purpose-built and bootstrap-only", () => {
    const bootstrap = read("install.sh");
    const installer = read("src/installer.ts");
    const syntax = spawnSync("bash", ["-n", "install.sh"], {
      cwd: root,
      encoding: "utf8",
    });
    expect(syntax.status, syntax.stderr).toBe(0);

    for (const required of [
      'bash -s -- "bun-v${bunVersion}"',
      '"$bunBinary" "$sourceRoot/src/installer.ts"',
      '--source-root "$sourceRoot"',
      '--source-commit "$sourceCommit"',
    ]) {
      expect(bootstrap).toContain(required);
    }
    for (const forbidden of [
      "node-v",
      "@opencode/cli@",
      "bun ci",
      "vite.js build",
      "order setup",
      "systemctl --user",
      "pontivus-order.service",
      "order status",
    ]) {
      expect(bootstrap).not.toContain(forbidden);
    }

    for (const required of [
      'const nodeVersion = "26.13.0"',
      'const openCodeVersion = "2.2.6"',
      '@opencode/cli@" + openCodeVersion',
      '[bun, "ci"]',
      '"node_modules/vite/bin/vite.js"',
      'runInstallerGuidedSetup(',
      'createdProjectManifests',
      'prepareOrderDatabaseForInstall',
      '"systemctl", "--user", "is-active"',
      '"systemctl", "--user", "daemon-reload"',
      '"systemctl", "--user", "enable", "pontivus-order.service"',
      '"systemctl", "--user", "restart", "pontivus-order.service"',
      '[launcher, "status"]',
      'Order installed successfully.',
      'Order updated successfully.',
    ]) {
      expect(installer).toContain(required);
    }
    expect(bootstrap).not.toContain("sudo ");
    expect(installer).not.toContain("sudo ");
    expect(installer).not.toContain("PONTIVUS_ORDER_OPENCODE_MODEL");

    expect(bootstrap).toContain('elif [ ! -f "$sourceRoot/RELEASE.json" ]');
    expect(bootstrap).toContain('"$sourceRoot/RELEASE.json"');
    expect(installer).toContain('type InstallerSourceKind = "GIT_CHECKOUT" | "RELEASE_BUNDLE"');
    expect(installer).toContain('return "RELEASE_BUNDLE"');
    expect(installer).toContain("release bundle version does not match package.json");
    expect(installer).toContain('sourceKind === "GIT_CHECKOUT"');
    expect(installer).toContain("release bundle lost certified dist/index.html during installation");
    expect(read("scripts/package-release.ts")).toContain('cpSync("dist", join(orderRoot, "dist"), { recursive: true })');
    expect(read("scripts/package-release.ts")).toContain('join(orderRoot, "RELEASE.json")');

    const manifest = read("pontivus-order.toml");
    expect(manifest).toContain('"install.sh"');
    expect(manifest).toContain('"src/installer.ts"');
  });

  it("keeps the browser harness and operator README on the approved surface", () => {
    const config = read("playwright.config.ts");
    expect(config).toContain('testDir: "./tests"');
    expect(config).toContain('testMatch: "browser.spec.ts"');
    expect(config).toContain("workers: 1");
    expect(config).toContain("retries: 0");
    expect(config).toContain('baseURL: "http://127.0.0.1:17347"');
    expect(config).toContain('command: "bun tests/e2e-server.ts"');
    expect(config).toContain('url: "http://127.0.0.1:17347/api/health"');
    expect(config).toContain("reuseExistingServer: false");
    expect(config).toContain("timeout: 120_000");

    const readme = read("README.md");
    for (const required of [
      "Linux",
      "install.sh",
      "purpose-built installer",
      "src/installer.ts",
      "~/.local/share/pontivus-order",
      "~/.local/bin/order",
      "PONTIVUS_ORDER_STATE_ROOT",
      "PONTIVUS_ORDER_TEST_STATE_ROOT",
      "order daemon",
      "order setup",
      "order setup --reconfigure",
      "order open",
      "order status",
      "order tick",
      "order provider login <provider>",
      "pontivus-order.service",
      "dependency-lock",
      "typecheck",
      "architecture",
      "test",
      "build",
      "browser",
      "verified candidate",
      "does not commit, push, merge, deploy",
    ]) {
      expect(readme).toContain(required);
    }
    expect(readme).not.toContain("export PONTIVUS_ORDER_OPENCODE_MODEL");
    expect(readme).not.toContain("Host-native daemon autostart/process supervision is outside v1");
  });
  it("locks the P7 integrated visual inventory and removes superseded UI paths", () => {
    const expectedReferences = [
      "application-notices-states.svg",
      "approval-task-detail.svg",
      "approval.svg",
      "complete-linked-remediation.svg",
      "complete.svg",
      "create-linked-remediation.svg",
      "create-work-item.svg",
      "current-attention-states.svg",
      "dialogue-states.svg",
      "document-authoring.svg",
      "document-readonly.svg",
      "document-states.svg",
      "evidence-viewer.svg",
      "implementation-plan.svg",
      "implementation-states.svg",
      "implementation.svg",
      "installation-readiness.svg",
      "proposal-review.svg",
      "proposal-states.svg",
      "queue-states.svg",
      "queue.svg",
      "readiness-review.svg",
      "requirements.svg",
      "research.svg",
      "responsive-composition.svg",
      "safety-confirmations.svg",
      "settings-model.svg",
      "settings-opencode-add.svg",
      "settings-opencode-login-states.svg",
      "settings-opencode-login.svg",
      "settings-opencode-rename.svg",
      "settings-opencode.svg",
      "settings-repositories.svg",
      "settings-repository-add.svg",
      "settings-repository-move.svg",
      "solution-design.svg",
      "theme-parity.svg",
      "work-request.svg",
      "work-type-variants.svg",
      "workitem-context.svg",
      "workitem-shell-controls.svg",
    ].sort();

    const references = readdirSync(join(root, "docs/references/workbench-ui"))
      .filter((name) => name.endsWith(".svg"))
      .sort();
    expect(references).toEqual(expectedReferences);

    const referenceReadme = read("docs/references/workbench-ui/README.md");
    for (const reference of expectedReferences) {
      expect(referenceReadme).toContain("(" + reference + ")");
    }

    const workflows = readdirSync(join(root, ".github/workflows"))
      .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
      .sort();
    expect(workflows).toEqual(["ci.yml", "release.yml"]);

    const walkUi = (directory: string): string[] =>
      readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
        const relative = directory + "/" + entry.name;
        return entry.isDirectory() ? walkUi(relative) : [relative];
      });
    const uiSource = walkUi("ui/src")
      .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".css"))
      .map(read)
      .join("\n");

    expect(uiSource).not.toContain("api.tick(");
    expect(uiSource).not.toContain("@opencode-ai/sdk");
    expect(uiSource).not.toContain("order-workflow-side-index");
    expect(uiSource).not.toContain("order-generic-side-index");
    const activityWorkspace = read("ui/src/ActivityWorkspace.tsx");
    expect(activityWorkspace).not.toContain('title="OpenCode session"');
    expect(activityWorkspace).not.toContain('label="OpenCode session"');
    expect(activityWorkspace).not.toContain('data-testid="opencode-session"');
  });

  it("keeps the publishable current tree free of private-source provenance and temporary verification scaffolding", () => {
    const textExtensions = new Set([".css", ".html", ".json", ".md", ".sh", ".toml", ".ts", ".tsx", ".yaml", ".yml"]);
    const extension = (path: string): string => {
      const index = path.lastIndexOf(".");
      return index === -1 ? "" : path.slice(index);
    };
    const walkText = (directory: string): string[] =>
      readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
        if ([".git", "dist", "node_modules"].includes(entry.name)) return [];
        const relative = directory === "." ? entry.name : directory + "/" + entry.name;
        if (entry.isDirectory()) return walkText(relative);
        return textExtensions.has(extension(relative)) || [".bun-version", ".node-version"].includes(relative) ? [relative] : [];
      });

    const forbidden = [
      [["rps", "treef"].join(""), ["pontivus", "awb"].join("-")].join("/"),
      ["pontivus-com", "legal"].join("/"),
      ["pontivus", "legal"].join("-"),
      ["pontivus", "legal"].join("_"),
      ["", "home", "vagrant"].join("/"),
      [["rps", "treef"].join(""), ["gate", "weft"].join("")].join("/"),
      ["Pontivus", "observed baseline"].join(" "),
      ["Pontivus", "AWB"].join(" "),
      ["Pontivus", "Legal"].join(" "),
      ["@pontivus", ""].join("/"),
      ["panel", "foundation"].join("-"),
      ["projects", "pontivus"].join("/"),
      ["Pontivus-tested", "dependency baseline"].join(" "),
      ["copied", "Pontivus primitive"].join(" "),
      ["Pontivus", "copied UI source"].join(" "),
      ["d2e9869f", "ad35aec35d7e3b60bd2f7d81970c2078"].join(""),
      ["3895db2e", "a16387b16341651d8519cec1298aeecd"].join(""),
    ];

    const leaks = walkText(".").flatMap((path) => {
      const body = read(path);
      return forbidden.flatMap((marker) => body.includes(marker) ? [{ path, marker }] : []);
    });

    expect(leaks).toEqual([]);
    expect(existsSync(join(root, ".github/workflows/temp-order-cutover-verification.yml"))).toBe(false);
    expect(existsSync(join(root, ".github/workflows/temp-order-public-cutover-audit.yml"))).toBe(false);
  });


});


describe("A06 execution-foundation certification", () => {
  it("permanently wires forecast variance and coordinator-owned builder checkpoints", () => {
    const contracts = read("src/core/contracts.ts");
    const coreExecution = read("src/core/execution.ts");
    const daemonExecution = read("src/daemon/execution.ts");
    const validation = read("src/daemon/validation.ts");

    expect(contracts).toContain('z.literal("GATE_CHECKPOINT_REQUESTED")');
    expect(coreExecution).toContain('"GATE_CHECKPOINT_REQUESTED"');
    expect(coreExecution).toContain("builderCheckpointRequestForTurn");
    expect(coreExecution).toContain("checkpoint request must be the terminal turn action");

    expect(validation).not.toContain("outside signed changeSurface");
    expect(validation).toContain("forecastVariancePaths");
    expect(validation).toContain("runCheckpointGate");
    expect(validation).toContain("validation/checkpoint-");

    expect(daemonExecution).toContain("GATE_CHECKPOINT_REQUESTED");
    expect(daemonExecution).toContain("runCheckpointGate(");
    expect(daemonExecution).toContain("Coordinator checkpoint result:");
    expect(daemonExecution).toContain("resolveVerificationGate(manifest, checkpointRequest.gateId)");
    expect(daemonExecution).toContain("validation/v6-change-surface.json");
    expect(daemonExecution).not.toContain(
      "run the applicable resolved architecture fitness gate before proceeding",
    );
  });
});


describe("public release delivery certification", () => {
  it("keeps one package-derived version owner and retained PR/release automation", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      version: string;
      scripts: Record<string, string>;
    };
    expect(packageJson.version).toMatch(/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/);
    expect(packageJson.scripts).toEqual({
      "verify:release": "bun scripts/verify-release.ts",
      "package:release": "bun scripts/package-release.ts",
    });

    const version = read("src/version.ts");
    expect(version).toContain('../package.json');
    expect(version).toContain("orderVersion");

    const cli = read("src/cli.ts");
    expect(cli).toContain('argv[0] === "--version"');
    expect(cli).toContain("orderVersion");

    const server = read("src/daemon/server.ts");
    expect(server).toContain('from "../version.ts"');
    expect(server).not.toContain('orderVersion = "');

    const ci = read(".github/workflows/ci.yml");
    const release = read(".github/workflows/release.yml");
    expect(ci).toContain("pull_request:");
    expect(ci).toContain("name: verify");
    expect(ci).toContain("scripts/verify-release.ts --mode pr");
    expect(ci).not.toContain("uses:");

    expect(release).toContain("name: Release");
    expect(release).toContain("scripts/verify-release.ts --mode release-commit");
    expect(release).toContain("pontivus-order.tar.gz.sha256");
    expect(release).toContain("git tag -a");
    expect(release).toContain("/releases/");
    expect(release).toContain(".github/release-retries/**");
    expect(release).toContain('mapfile -t retry_files');
    expect(release).toContain('target_sha="$(tr -d');
    expect(release).toContain('release_retry=false');
    expect(release).toContain('release_retry=true');
    expect(release).toContain('echo "TARGET_SHA=${target_sha}" >> "${GITHUB_ENV}"');
    expect(release).toContain('echo "RELEASE_RETRY=${release_retry}" >> "${GITHUB_ENV}"');
    expect(release).toContain('"${RELEASE_RETRY}" != "true"');
    expect(release).toContain('test "$(git rev-parse HEAD)" = "${target_sha}"');
    expect(release).toContain('git merge-base --is-ancestor "${target_sha}" refs/remotes/origin/master');
    expect(release).not.toContain('test "$(git rev-parse refs/remotes/origin/master)" = "${TARGET_SHA}"');
    expect(release).toContain('Accept: application/octet-stream');
    expect(release).toContain('cmp -s "release/${asset}" "${existing_asset}"');
    expect(release).not.toContain("uses:");

    const browserHarness = read("tests/e2e-server.ts");
    expect(browserHarness).toContain('providerID: "opencode", id: "glm-5.3-flash-free"');
    expect(browserHarness).not.toContain('id: "gpt-5.6"');

    expect(read("scripts/verify-release.ts")).toContain(
      "ordinary work PRs must not change package.json.version",
    );
    expect(read("scripts/verify-release.ts")).toContain("spawnSync(");
    expect(read("scripts/verify-release.ts")).toContain('["ls-remote", "--exit-code", "--tags", "origin"');
    expect(read("scripts/verify-release.ts")).toContain("published versions cannot be replaced");
    expect(read("scripts/verify-release.ts")).toContain("unpublished same-version release replacement");
    expect(read("scripts/package-release.ts")).toContain('"RELEASE.json"');
    expect(read("CHANGELOG.md")).toContain("## [Unreleased]");
  });

  it("retains permanent 0.2.1 installed-state and browser seam certification", () => {
    const suites = {
      shell: read("tests/shell.test.ts"),
      daemon: read("tests/daemon.test.ts"),
      opencode: read("tests/opencode.test.ts"),
      migration: read("tests/order-migration.test.ts"),
      browser: read("tests/browser.spec.ts"),
    };

    for (const required of [
      "initializes fresh installs as valid incomplete v4 without terminal configuration prompts",
      "retains current incomplete v4 exactly during installer update without prompting",
      "supports valid incomplete v4 configuration and expected-hash replacement",
    ]) {
      expect(suites.shell).toContain(required);
    }

    for (const required of [
      "boots with valid incomplete v4 configuration and with a drifted configured repository",
      "rediscovers retained WorkItems after reconnecting the same repository",
      "migrates a repository WorkItem document root without rewriting history or bytes",
      "rolls back repository bytes when activation fails after manifest mutation",
      "saves only WorkItem body Markdown while preserving exact metadata and complete-file concurrency",
      "blocks account removal during active Runs and reports account-required readiness after final removal",
    ]) {
      expect(suites.daemon).toContain(required);
    }

    for (const required of [
      "deterministically migrates current v3 configuration to v4 without prompting",
      "retains an exact v1 target and provisions its missing manifest without prompting",
      "upgrades broad v1 target roots from persisted WorkItem repository evidence",
      "waits for account integration registration before reading saved accounts",
      "projects an empty account set through the real pinned OpenCode account-control process",
      "projects and mutates saved accounts only through safe integration state",
    ]) {
      expect(suites.opencode).toContain(required);
    }

    expect(suites.migration).toContain(
      "migrates, rolls back and retires the immediately preceding default footprint under Bun",
    );

    for (const required of [
      "Settings uses stable native-history destinations and daemon-owned readiness",
      "global OpenCode account utility switches, renames, signs in, blocks during active Runs, and remains responsive",
      "source editor preserves stale buffers, never overwrites newer source, and returns work visibly to R1",
      "dirty Markdown navigation is explicit, preserves the buffer when cancelled, restores queue focus when discarded, and PLAN/R3 editing remains correct",
      "appearance uses a direct compact mode switcher, follows system mode, and persists explicit overrides",
    ]) {
      expect(suites.browser).toContain(required);
    }
  });

});
