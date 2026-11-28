import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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
    expect(executionUi).toMatch(/api\.startExecutionTask\(\s*workItem\.id,\s*currentOwnerTask\.id\s*\)/);
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
    expect(composer).not.toContain("Answer the question above");
    expect(composer).not.toContain("Continue current work");
    expect(composer).toContain('placeholder={required ? "Answer and continue" : "Send a message"}');
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
    expect(queue).toContain('label="New work item"');
    expect(queue).toContain('label={refreshPending ? "Refreshing…" : "Refresh sources"}');
    expect(queue).toContain('from "@astryxdesign/core/TextInput"');
    expect(queue).toContain('data-testid="workbench-search"');
    expect(queue).not.toContain("WorkbenchToolbarSearch");
    expect(queue).toContain('data-testid="source-diagnostics"');
    expect(queue).toContain("<WorkbenchSurface");
    const applicationShell = read("ui/src/app.tsx");
    expect(applicationShell).not.toContain('data-testid="source-diagnostics"');
    expect(applicationShell).not.toContain('className="order-queue-commandbar"');
    const context = read("ui/src/WorkItemContext.tsx");
    expect(context).toContain('label:"WorkItem id"');
    expect(context).toContain("value:<code>{workItem.id}</code>");

    const terminal = read("ui/src/TerminalResult.tsx");
    expect(terminal).toContain("<WorkbenchResult");
    expect(read("ui/src/primitives/WorkbenchResult.tsx")).toContain('data-testid="final-governed-outcome"');
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
    expect(theme).not.toContain(".order-markdown-document-view-with-aside");
    expect(theme).not.toContain(".order-markdown-document-view-aside");
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
      "WorkbenchAppShell.tsx",
      "WorkbenchAttention.tsx",
      "WorkbenchConfirmation.tsx",
      "WorkbenchContextPanel.tsx",
      "WorkbenchDialogue.tsx",
      "WorkbenchDisclosure.tsx",
      "WorkbenchDocument.tsx",
      "WorkbenchFacts.tsx",
      "WorkbenchField.tsx",
      "WorkbenchForm.tsx",
      "WorkbenchIcon.tsx",
      "WorkbenchIdentity.tsx",
      "WorkbenchMasterDetail.tsx",
      "WorkbenchNotice.tsx",
      "WorkbenchRail.tsx",
      "WorkbenchResourceList.tsx",
      "WorkbenchResourceRow.tsx",
      "WorkbenchResult.tsx",
      "WorkbenchReview.tsx",
      "WorkbenchReviewSection.tsx",
      "WorkbenchReviewVerdict.tsx",
      "WorkbenchSection.tsx",
      "WorkbenchSectionHeader.tsx",
      "WorkbenchSettingsLayout.tsx",
      "WorkbenchState.tsx",
      "WorkbenchStatus.tsx",
      "WorkbenchSurface.tsx",
      "WorkbenchTable.tsx",
      "WorkbenchTaskPanel.tsx",
      "WorkbenchTimeline.tsx",
      "WorkbenchToolbar.tsx",
      "WorkbenchUtilityLink.tsx",
      "WorkbenchWorkItemShell.tsx",
      "workbench-responsive.ts",
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

    expect(names).not.toContain("WorkbenchLayout.tsx");
    const appShell = read("ui/src/primitives/WorkbenchAppShell.tsx");
    const toolbar = read("ui/src/primitives/WorkbenchToolbar.tsx");
    const application = read("ui/src/app.tsx");
    const workItemShell = read("ui/src/primitives/WorkbenchWorkItemShell.tsx");
    const responsive = read("ui/src/primitives/workbench-responsive.ts");
    expect(appShell).toContain("<AppShell");
    expect(appShell).toContain("topNav={toolbar}");
    expect(appShell).toContain('className="order-workbench-destination"');
    expect(appShell).not.toContain("order-application-toolbar");
    expect(appShell).not.toContain("order-workbench-app-destination");
    expect(appShell).not.toContain("<Drawer");
    expect(toolbar).toContain('className="order-workbench-toolbar"');
    expect(toolbar).toContain('className="order-workbench-toolbar-main"');
    expect(toolbar).toContain('className="order-workbench-toolbar-project"');
    expect(toolbar).toContain('className="order-workbench-toolbar-utilities"');
    expect(toolbar).toContain('className="order-workbench-toolbar-account"');
    expect(toolbar).toContain('label="OpenCode"');
    expect(toolbar).not.toContain("label={account.label}");
    expect(toolbar).toContain('className="order-workbench-account-label"');
    expect(toolbar).toContain('className="order-workbench-toolbar-theme"');
    const identity = read("ui/src/primitives/WorkbenchIdentity.tsx");
    expect(identity).toContain('aria-label="Selected work item"');
    expect(identity).toContain('aria-label="Work item navigation"');
    expect(identity).toContain('aria-label="Work item actions"');
    expect(toolbar).not.toContain("WorkbenchToolbarGroup");
    expect(toolbar).not.toContain("WorkbenchToolbarSearch");
    expect(toolbar).not.toContain("start:");
    expect(toolbar).not.toContain("end:");
    expect(toolbar).not.toContain('className="order-toolbar"');
    expect(application).toContain("<WorkbenchToolbar");
    expect(application).not.toContain('className="order-application-orientation"');
    expect(application).not.toContain('className="order-brand"');
    expect(application).not.toContain('className="order-theme-control"');
    expect(workItemShell).toContain("<Layout");
    expect(workItemShell).toContain("<Drawer");
    expect(responsive).toContain('"(min-width: 1280px)"');
    expect(responsive).toContain('"(min-width: 800px)"');
    expect(appShell).not.toContain("matchMedia");
    expect(workItemShell).not.toContain("matchMedia");
    expect(read("ui/src/primitives/WorkbenchMasterDetail.tsx")).not.toContain("matchMedia");
    expect(read("ui/src/primitives/WorkbenchSettingsLayout.tsx")).not.toContain("matchMedia");

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
    expect(theme).toContain(".order-workbench-toolbar {");
    const toolbarRule = theme.match(/\.order-workbench-toolbar\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(toolbarRule).toContain("background: var(--color-background-surface)");
    expect(toolbarRule).toContain("color: var(--color-text-primary)");
    expect(toolbarRule).toContain("border-bottom: 1px solid var(--color-border-emphasized)");
    expect(theme).not.toContain('.order-workbench-toolbar [role="radio"]');
    expect(theme).toContain(".order-workbench-destination {");
    expect(theme).not.toContain(".order-toolbar {");
    expect(theme).not.toContain(".order-application-toolbar");
    expect(theme).not.toContain(".order-brand");
    expect(theme).not.toContain(".order-theme-control");
    expect(theme).not.toContain(".order-workbench-app-destination");
    expect(theme).toContain("--order-toolbar-height: 3.25rem");
    const kindRule = theme.match(/\.order-workitem-kind\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(kindRule).not.toContain("--radius-full");
    expect(kindRule).not.toContain("background:");
    expect(theme).toContain(".order-workbench-account-label");
    expect(theme).toContain(".order-workbench-toolbar-theme");

    const attention = read("ui/src/primitives/WorkbenchAttention.tsx");
    expect(attention).not.toContain("tone?:");
    expect(attention).not.toContain("data-tone");
    expect(attention).not.toContain("purpose?:");
    expect(attention).not.toContain("status?:");
    expect(attention).not.toContain("blocker?:");
    expect(attention).not.toContain("Current attention:");
    expect(existsSync(join(root, "ui", "src", "WorkflowStepFrame.tsx"))).toBe(false);
    expect(existsSync(join(root, "ui", "src", "WorkflowMaterialSelector.tsx"))).toBe(false);
    expect(theme).not.toContain(".order-workbench-attention[data-tone=");

    const dialoguePrimitive = read("ui/src/primitives/WorkbenchDialogue.tsx");
    expect(dialoguePrimitive).toContain("activity?: ReactNode");
    expect(dialoguePrimitive).not.toContain("header?: ReactNode");
    expect(dialoguePrimitive).not.toContain("technical?: ReactNode");
    expect(theme).not.toContain("order-workbench-dialogue-header");
    expect(theme).not.toContain("order-workbench-dialogue-technical");

    const confirmationPrimitive = read("ui/src/primitives/WorkbenchConfirmation.tsx");
    expect(confirmationPrimitive).toContain('WorkbenchConfirmationKind = "safety" | "destructive"');
    expect(confirmationPrimitive).toContain("<Dialog");
    expect(confirmationPrimitive).toContain("<AlertDialog");
    expect(confirmationPrimitive).not.toContain("actionTone");
    expect(confirmationPrimitive).not.toContain("cancelLabel");

    const taskPanel = read("ui/src/primitives/WorkbenchTaskPanel.tsx");
    expect(taskPanel).toContain('import { WorkbenchForm } from "./WorkbenchForm.tsx";');
    expect(taskPanel).toContain("order-workbench-task-panel-header");
    expect(taskPanel).toContain("order-workbench-task-panel-body");
    expect(taskPanel).toContain("order-workbench-task-panel-footer");
    expect(taskPanel).toContain("footer: ReactNode");
    expect(taskPanel).toContain("<WorkbenchForm");
    expect(taskPanel).not.toContain("<form");
    expect(taskPanel).not.toContain('width="42rem"');
    expect(taskPanel).not.toContain("100vw");
    expect(taskPanel).not.toContain("calc(");

    const reviewPrimitive = read("ui/src/primitives/WorkbenchReview.tsx");
    expect(reviewPrimitive).toContain("WorkbenchReviewVerdict");
    expect(reviewPrimitive).toContain("WorkbenchReviewSection");
    expect(reviewPrimitive).toContain("verdict: WorkbenchReviewVerdictProps");
    expect(reviewPrimitive).toContain("sections: readonly WorkbenchReviewSectionProps[]");
    expect(reviewPrimitive).not.toContain("body: ReactNode");
    expect(reviewPrimitive).not.toContain("technicalDetails");
    expect(reviewPrimitive).not.toContain("WorkbenchDisclosure");
    expect(reviewPrimitive).not.toContain("selector");
    const reviewVerdict = read("ui/src/primitives/WorkbenchReviewVerdict.tsx");
    const reviewSection = read("ui/src/primitives/WorkbenchReviewSection.tsx");
    expect(reviewVerdict).toContain("WorkbenchStatus");
    expect(reviewSection).toContain("WorkbenchSectionHeader");

    const surfacePrimitive = read("ui/src/primitives/WorkbenchSurface.tsx");
    expect(surfacePrimitive).toContain("attention?: ReactNode");
    expect(surfacePrimitive).toContain("material: ReactNode");
    expect(surfacePrimitive).toContain("attention === undefined ? null");
    expect(surfacePrimitive).not.toContain("selector");
    expect(theme).not.toContain(".order-workbench-surface-material:nth-child");
    expect(theme).not.toContain("order-workbench-surface-selector");
    expect(theme).not.toContain("order-workbench-review-selector");
    expect(theme).not.toContain("order-primary-material-frame");
    expect(theme).not.toContain("order-workflow-summary-status");
    expect(theme).toContain(
      ".order-workbench-task-panel > .order-workbench-form",
    );
    expect(theme).toContain(
      ".order-workbench-task-panel > .order-workbench-form > .order-workbench-form-content",
    );

    const queueSurface = read("ui/src/WorkItemQueue.tsx");
    expect(queueSurface).toContain("<WorkbenchSurface");
    expect(queueSurface).toContain("<WorkbenchSectionHeader");
    expect(queueSurface).not.toContain("attention={");

    const workItemRouter = read("ui/src/WorkItemWorkspace.tsx");
    expect(workItemRouter).toContain(
      'material.kind === "EVIDENCE" && selectedStep !== "EXECUTION"',
    );
    expect(workItemRouter).toContain('title="Loading evidence…"');
    expect(workItemRouter).toContain("<WorkbenchSurface");
    expect(workItemRouter).toContain("<WorkbenchAttention");
    for (const forbidden of [
      "WorkflowStepFrame",
      "WorkflowStepSummary",
      "WorkflowStepIndex",
      "PrimaryMaterialFrame",
      "WorkflowMaterialSelector",
      "stepSummary",
    ]) {
      expect(workItemRouter).not.toContain(forbidden);
    }

    const context = read("ui/src/WorkItemContext.tsx");
    expect(context).toContain("<WorkbenchSection");
    expect(context).toContain("<WorkbenchFacts");
    expect(context).toContain('title="WorkItem identity"');
    expect(context).toContain('title="Selected proposal identity"');
    expect(context).toContain('title="Selected approval package identity"');
    expect(context).toContain('title="Selected execution identity"');
    expect(context).not.toContain('aria-label="WorkItem identity"');
    expect(context).toContain('data-testid="context-signoff-package-hash"');
    expect(context).not.toContain("WorkbenchDisclosure");
    expect(context).not.toContain("WorkItem technical details");

    const activityWorkspace = read("ui/src/ActivityWorkspace.tsx");
    expect(activityWorkspace).not.toContain("WorkbenchDisclosure");
    expect(activityWorkspace).not.toContain('label="Technical details"');

    const createWorkItem = read("ui/src/CreateWorkItem.tsx");
    expect(createWorkItem).not.toContain("WorkbenchForm");
    expect(createWorkItem).not.toContain("WorkbenchAction");
    const appSource = read("ui/src/app.tsx");
    expect(appSource).toContain("footer={");
    expect(appSource).toContain('type="submit"');
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
      "AcceptanceWorkspace.tsx",
      "ActivityComposer.tsx",
      "ActivityWorkspace.tsx",
      "CreateWorkItem.tsx",
      "DocumentChangeView.tsx",
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
      "WorkflowRail.tsx",
      "app.tsx",
      "main.tsx",
    ]);

    const componentArchitecture = read("docs/architecture/workbench.md");
    const rendererAuthorityStart = componentArchitecture.indexOf("### 8.17");
    const rendererAuthorityEnd = componentArchitecture.indexOf("### 8.18");
    expect(rendererAuthorityStart).toBeGreaterThanOrEqual(0);
    expect(rendererAuthorityEnd).toBeGreaterThan(rendererAuthorityStart);
    const rendererAuthority = componentArchitecture.slice(
      rendererAuthorityStart,
      rendererAuthorityEnd,
    );
    const canonicalRendererNames = [...new Set(
      [...rendererAuthority.matchAll(/`([^`]+\.tsx)`/g)]
        .map((match) => match[1]!)
        .map((name) => name.slice(name.lastIndexOf("/") + 1))
        .filter((name) => name !== "*.tsx" && name !== "main.tsx"),
    )].sort();
    const productionRenderers = renderers.filter((name) => name !== "main.tsx");
    expect(canonicalRendererNames).toContain("ActivityComposer.tsx");
    // Target renderer authority includes the one signed prospective Acceptance owner.
    // Current runtime may omit that owner only before the atomic stage cutover.
    const nativeAcceptanceStage = read("src/core/contracts.ts").split("export const WorkStatusSchema")[0].includes('"AWAITING_ACCEPTANCE"');
    expect(canonicalRendererNames).toContain("AcceptanceWorkspace.tsx");
    expect(canonicalRendererNames.filter((name) => nativeAcceptanceStage || name !== "AcceptanceWorkspace.tsx")).toEqual(productionRenderers);
    expect(productionRenderers.includes("AcceptanceWorkspace.tsx")).toBe(nativeAcceptanceStage);

    const unclassified = (
      names: readonly string[],
      classifications: readonly string[],
    ): readonly string[] =>
      names.filter((name) =>
        name !== "main.tsx" && !classifications.includes(name)
      );
    expect(unclassified(renderers, canonicalRendererNames)).toEqual([]);
    expect(unclassified(
      [...renderers, "UnclassifiedFixture.tsx"],
      canonicalRendererNames,
    )).toEqual(["UnclassifiedFixture.tsx"]);

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
      "WorkflowRail.tsx",
    ]) {
      expect(existsSync(join(root, "ui", "src", adapter))).toBe(true);
    }
    for (const removed of [
      "WorkflowStepFrame.tsx",
      "WorkflowMaterialSelector.tsx",
    ]) {
      expect(existsSync(join(root, "ui", "src", removed))).toBe(false);
    }

    for (const forbidden of [
      "WorkflowStepFrame",
      "WorkflowStepSummary",
      "WorkflowStepIndex",
      "PrimaryMaterialFrame",
      "WorkflowMaterialSelector",
    ]) {
      expect(rendererSource).not.toContain(forbidden);
    }

    const consumersOf = (primitive: string): readonly string[] =>
      renderers
        .filter((name) => name !== "main.tsx")
        .filter((name) =>
          read("ui/src/" + name).includes(
            './primitives/' + primitive + '.tsx',
          )
        )
        .sort();

    expect(consumersOf("WorkbenchAppShell")).toEqual([
      "app.tsx",
    ]);
    expect(consumersOf("WorkbenchWorkItemShell")).toEqual([
      "WorkItemWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchSurface")).toEqual([
      "EvidenceViewer.tsx",
      "ExecutionWorkspace.tsx",
      "TerminalResult.tsx",
      "WorkItemQueue.tsx",
      "WorkItemWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchAttention")).toEqual([
      "ExecutionWorkspace.tsx",
      "WorkItemWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchReview")).toEqual([
      "AcceptanceWorkspace.tsx",
      "ProposalReview.tsx",
      "ReadinessWorkspace.tsx",
      "SignoffReview.tsx",
    ]);
    expect(consumersOf("WorkbenchReviewSection")).toEqual([]);
    expect(consumersOf("WorkbenchReviewVerdict")).toEqual([]);
    expect(consumersOf("WorkbenchSelector")).toEqual([]);
    expect(
      existsSync(join(root, "ui", "src", "primitives", "WorkbenchSelector.tsx")),
    ).toBe(false);
    expect(consumersOf("WorkbenchDialogue")).toEqual([
      "ActivityWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchConfirmation")).toEqual([
      "AcceptanceWorkspace.tsx",
      "DocumentWorkspace.tsx",
      "OpenCodeAccountSettings.tsx",
      "SettingsWorkspace.tsx",
      "WorkItemWorkspace.tsx",
      "app.tsx",
    ]);
    expect(consumersOf("WorkbenchContextPanel")).toEqual([
      "WorkItemContext.tsx",
    ]);
    expect(consumersOf("WorkbenchDocument")).toEqual([
      "DocumentWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchSection")).toEqual([
      "ExecutionWorkspace.tsx",
      "OpenCodeAccountSettings.tsx",
      "PreSignoffStageWorkspace.tsx",
      "SettingsWorkspace.tsx",
      "WorkItemContext.tsx",
    ]);
    expect(consumersOf("WorkbenchResult")).toEqual(["TerminalResult.tsx"]);
    expect(consumersOf("WorkbenchFacts")).toEqual([
      "AcceptanceWorkspace.tsx",
      "DocumentWorkspace.tsx",
      "ExecutionWorkspace.tsx",
      "OpenCodeAccountSettings.tsx",
      "SettingsWorkspace.tsx",
      "SignoffReview.tsx",
      "WorkItemContext.tsx",
    ]);
    const contextPanel = read("ui/src/primitives/WorkbenchContextPanel.tsx");
    const workItemContext = read("ui/src/WorkItemContext.tsx");
    expect(contextPanel).toContain("sections:");
    expect(contextPanel).not.toContain("children:");
    expect(workItemContext).toContain("<WorkbenchSection");
    expect(workItemContext).toContain("<WorkbenchFacts");
    expect(workItemContext).not.toContain("MetadataList");
    expect(workItemContext).not.toContain("order-workbench-context-group");
    expect(consumersOf("WorkbenchForm")).toEqual([
      "OpenCodeAccountSettings.tsx",
      "SettingsWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchIdentity")).toEqual([
      "WorkItemIdentityRow.tsx",
    ]);
    expect(consumersOf("WorkbenchMasterDetail")).toEqual([
      "ExecutionWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchRail")).toEqual([
      "WorkflowRail.tsx",
    ]);
    expect(consumersOf("WorkbenchResourceList")).toEqual([
      "AcceptanceWorkspace.tsx",
      "ExecutionWorkspace.tsx",
      "PreSignoffStageWorkspace.tsx",
      "ReadinessWorkspace.tsx",
      "RunEventTimeline.tsx",
      "SignoffReview.tsx",
      "TerminalResult.tsx",
    ]);
    expect(consumersOf("WorkbenchResourceRow")).toEqual([]);
    const resourceList = read("ui/src/primitives/WorkbenchResourceList.tsx");
    const resourceRow = read("ui/src/primitives/WorkbenchResourceRow.tsx");
    expect(resourceList).toContain("@astryxdesign/core/List");
    expect(resourceList).toContain("./WorkbenchResourceRow.tsx");
    expect(resourceList).toContain("hasDividers");
    expect(resourceList).toContain('density="balanced"');
    expect(resourceRow).toContain("itemKey={id}");
    expect(resourceRow).not.toContain("WorkbenchAction");
    const resourceTheme = read("ui/src/theme.css");
    for (const obsoleteResourceSelector of [
      ".order-resource-list",
      ".order-review-approval-resources",
      ".order-workflow-event-evidence",
    ]) {
      expect(resourceTheme).not.toContain(obsoleteResourceSelector);
    }
    expect(consumersOf("WorkbenchSectionHeader")).toEqual([
      "ActivityWorkspace.tsx",
      "EvidenceViewer.tsx",
      "ExecutionWorkspace.tsx",
      "OpenCodeAccountSettings.tsx",
      "SettingsWorkspace.tsx",
      "WorkItemQueue.tsx",
    ]);
    expect(consumersOf("WorkbenchSettingsLayout")).toEqual([
      "SettingsWorkspace.tsx",
    ]);
    expect(consumersOf("WorkbenchState")).toEqual([
      "ActivityWorkspace.tsx",
      "DocumentChangeView.tsx",
      "DocumentWorkspace.tsx",
      "EvidenceViewer.tsx",
      "ExecutionWorkspace.tsx",
      "OpenCodeAccountSettings.tsx",
      "PreSignoffStageWorkspace.tsx",
      "ProposalReview.tsx",
      "ReadinessWorkspace.tsx",
      "SettingsWorkspace.tsx",
      "SignoffReview.tsx",
      "TerminalResult.tsx",
      "WorkItemQueue.tsx",
      "WorkItemWorkspace.tsx",
      "app.tsx",
    ]);
    expect(consumersOf("WorkbenchTable")).toEqual([
      "ExecutionWorkspace.tsx",
      "OpenCodeAccountSettings.tsx",
      "SettingsWorkspace.tsx",
      "WorkItemQueue.tsx",
    ]);
    expect(consumersOf("WorkbenchTaskPanel")).toEqual([
      "AcceptanceWorkspace.tsx",
      "app.tsx",
    ]);
    expect(consumersOf("WorkbenchTimeline")).toEqual([
      "ActivityWorkspace.tsx",
      "ExecutionWorkspace.tsx",
      "RunEventTimeline.tsx",
    ]);
    expect(consumersOf("WorkbenchToolbar")).toEqual([
      "app.tsx",
    ]);
    expect(consumersOf("WorkbenchUtilityLink")).toEqual([
      "SettingsWorkspace.tsx",
    ]);
  });

  it("rejects non-owning attention and outer-frame substitution of canonical primary compositions",()=>{
    // The §8.17 production renderer and consumer inventory above is exhaustive.
    // These are the additional semantic constraints on those existing owners,
    // not a parallel renderer registry. Runtime tests exercise the selected branch.
    const attentionViolation=(source:string)=>/<WorkbenchAttention\b|\battention\s*=/.test(source);
    const directReviewViolation=(source:string)=>/<WorkbenchSurface\b|<WorkbenchAttention\b|\battention\s*=|\bbody\s*=/.test(source);
    const nestedPrimaryViolation=(source:string)=>/<Workbench(?:Review|Document|Dialogue|Result)\b[\s\S]*?<Workbench(?:Review|Document|Dialogue|Result)\b/.test(source);
    const reviewBodyEscape=(source:string)=>/\bbody\??\s*:\s*ReactNode|\bchildren\??\s*:\s*ReactNode/.test(source);
    for(const owner of ["WorkItemQueue","EvidenceViewer","TerminalResult"]){
      expect(attentionViolation(read("ui/src/"+owner+".tsx")),owner).toBe(false);
    }
    for(const owner of ["ProposalReview","ReadinessWorkspace","SignoffReview","AcceptanceWorkspace"]){
      const source=read("ui/src/"+owner+".tsx");
      // Acceptance's TaskPanel legitimately owns a body prop, never Review.
      expect(directReviewViolation(source.replace(/<WorkbenchTaskPanel\b[\s\S]*?\/>/g,"")),owner).toBe(false);
      expect(nestedPrimaryViolation(source),owner).toBe(false);
    }
    expect(reviewBodyEscape(read("ui/src/primitives/WorkbenchReview.tsx"))).toBe(false);
    for(const owner of ["WorkItemQueue","EvidenceViewer","TerminalResult"]){
      expect(attentionViolation("return <WorkbenchSurface attention={<WorkbenchAttention title='x'/>} material={<p/>}/>;"),owner).toBe(true);
    }
    for(const owner of ["ProposalReview","ReadinessWorkspace","SignoffReview"]){
      expect(directReviewViolation("return <WorkbenchSurface material={<WorkbenchReview verdict={v} sections={s}/>}/>;"),owner).toBe(true);
      expect(directReviewViolation("return <WorkbenchReview verdict={v} sections={s}/>;"),owner).toBe(false);
    }
    expect(nestedPrimaryViolation("return <WorkbenchReview sections={[{content:<WorkbenchDocument title='x'/>}]}/>;")).toBe(true);
    expect(nestedPrimaryViolation("return <WorkbenchReview sections={[{content:<WorkbenchResourceList items={rows}/>}]}/>;")).toBe(false);
    expect(reviewBodyEscape("type Props = {body?: ReactNode}")).toBe(true);
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
      "order-evidence-primary",
      "order-evidence-content",
      "order-evidence-identity",
      "order-code-view",
      "order-evidence-code-bytes",
      "<pre",
    ]) {
      expect(evidence).not.toContain(forbidden);
    }

    expect(evidence).not.toContain("attention={");
    expect(evidence).toContain('data-testid="evidence-workspace"');
    expect(evidence).toContain('className="order-evidence-composition"');
    expect(evidence).toContain('className="order-evidence-exact-identity"');
    expect(evidence).toContain('className="order-evidence-raw"');

    const readiness = read("ui/src/ReadinessWorkspace.tsx");
    expect(readiness).toContain("WorkbenchReview");
    expect(readiness).toContain("requiredInputOwnsAttention ||");
    expect(readiness).toContain('material.kind === "EVIDENCE"');
    expect(readiness).toContain('material.kind === "SUPPORTING_DOCUMENT"');
    expect(readiness).toContain('title: beforeReview ? "Package documents before review" : "Package documents"');
    expect(readiness).toContain('const beforeReview = workItem.stage === "R3" && latestRun === null');
    expect(readiness).toContain("exactReadinessPackageDocuments(readinessArtifact, prospectiveClosureQuery.data)");
    expect(readiness).toContain("exactReadinessPackageDocuments(readinessArtifact, signedClosureQuery.data)");
    expect(readiness).toContain('title="Exact reviewed package unavailable"');
    expect(readiness).toContain('title: "Readiness attempts"');
    expect(readiness).not.toContain("order-review-readiness-");
    expect(readiness).not.toContain("currentness={");
    expect(readiness).not.toContain("summary={");
    expect(readiness).not.toContain("body={");
    expect(readiness).not.toContain("<WorkflowStepFrame");
    expect(readiness).not.toContain("<WorkbenchAttention");

    const proposalReview = read("ui/src/ProposalReview.tsx");
    const documentChangeView = read("ui/src/DocumentChangeView.tsx");
    expect(proposalReview).toContain("DocumentChangeView");
    expect(proposalReview).toContain('title: "Target"');
    expect(proposalReview).toContain('title: "Rationale"');
    expect(proposalReview).not.toContain("WorkbenchFacts");
    expect(proposalReview).not.toContain("@astryxdesign/core/CodeBlock");
    expect(proposalReview).not.toContain("order-proposal-diff");
    expect(proposalReview).not.toContain("order-proposal-facts");
    expect(documentChangeView).toContain("Proposed document");
    expect(documentChangeView).toContain('data-testid="document-change-region"');
    expect(documentChangeView).toContain("removedBefore");
    expect(documentChangeView).toContain('label="View exact diff"');
    expect(documentChangeView).toContain("<CodeBlock");
    expect(documentChangeView.indexOf("order-document-change-content"))
      .toBeLessThan(documentChangeView.indexOf('label="View exact diff"'));

    const proposal = read("ui/src/PreSignoffStageWorkspace.tsx");
    expect(proposal).toContain('if (material.kind === "PROPOSAL") return <>');
    expect(proposal).toContain('{primary}');
    expect(proposal).toContain("documentAttention?: ReactNode");
    expect(proposal).toContain("historicalReturn?: ReactNode");
    expect(proposal).toContain("stateNotice?: ReactNode");
    expect(proposal).toContain("stateAction?: ReactNode");
    expect(proposal).not.toContain("attention?: ReactNode");
    expect(proposal).not.toContain("{attention}");
    const dialogueStart = proposal.indexOf('case "STAGE_RUN"');
    const documentStart = proposal.indexOf('case "STAGE_DOCUMENT"');
    expect(dialogueStart).toBeGreaterThanOrEqual(0);
    expect(documentStart).toBeGreaterThan(dialogueStart);
    expect(proposal.slice(dialogueStart, documentStart)).not.toContain(
      "documentAttention",
    );

    const approval = read("ui/src/SignoffReview.tsx");
    expect(approval).toContain("WorkbenchReview");
    expect((approval.match(/<WorkbenchReview\b/g) ?? [])).toHaveLength(1);
    expect(approval).toContain("WorkbenchFacts");
    expect(approval).not.toContain("iconOnly");
    expect(approval).toContain('title: "Scope and boundaries"');
    expect(approval).toContain('title: "Acceptance and authority"');
    expect(approval).toContain("WorkbenchResourceList");
    expect(approval).toContain("packageStale?: boolean");
    expect(approval).toContain(
      'historicalArtifact={selectedArtifact}',
    );
    expect(approval).toContain("embeddedReadOnly={packageStale || packageSuperseded}");
    expect(approval).toContain('label="Back to Approval"');
    expect(approval).not.toContain("order-review-approval-");
    expect(approval).not.toContain("MetadataList");
    expect(approval).not.toContain('label="Task technical details"');
    expect(approval).not.toContain("<WorkflowStepFrame");
    expect(approval).not.toContain("<WorkbenchAttention");
    expect(approval).not.toContain("<dt>Task id</dt>");
    expect(approval).not.toContain("<dt>Approval id</dt>");
    expect(approval).not.toContain('label={"Open "');
    expect(approval).not.toContain('label="Open ');

    const workspace = read("ui/src/WorkItemWorkspace.tsx");
    expect(workspace).toContain("packageStale={selectedApproval === null && packageStaleOwner !== null}");
    expect(workspace).toContain(
      "artifacts={supersededProspective ? supersededArtifacts : selectedApproval !== null ? selectedApprovalArtifactsQuery.data ?? [] : prospectiveArtifactsQuery.data ?? []}",
    );
    expect(workspace).toContain('selectedStep === "AWAITING_SIGNOFF"');
    expect(workspace).toContain("api.listArtifacts(workItem.id)");

    const documentWorkspace = read("ui/src/DocumentWorkspace.tsx");
    expect(documentWorkspace).toContain("historicalArtifact?: ArtifactRef");
    expect(documentWorkspace).toContain("historicalArtifact ??");
    expect(documentWorkspace).toContain("enabled: historicalArtifact === undefined");

    const execution = read("ui/src/ExecutionWorkspace.tsx");
    expect(execution).toContain("WorkbenchMasterDetail");
    expect(execution).toContain("api.startExecutionTask(workItem.id, currentOwnerTask.id)");
    expect(execution).not.toContain("api.tick");
    expect(execution).toContain('label: "Approved tasks"');
    expect(execution).toContain("items: tasks.flatMap");
    expect(execution).not.toContain('className="order-implementation-master"');
    expect(execution).not.toContain('className="order-implementation-master-attempts"');
    expect(execution).not.toContain('className="order-implementation-attempts"');
    expect(execution).toContain('className="order-implementation-detail"');
    expect(execution).toContain("<WorkbenchFacts");
    expect(execution).toContain("<WorkbenchSection");
    expect(execution).not.toContain('className="order-implementation-scope"');
    expect(execution).toContain("terminalExecutionFailureEvent(latestOwnerRun, runEvents)");
    expect(execution).toContain("executionTaskRuns(task.id, runs)");
    expect(execution).not.toContain('className="order-implementation-heading"');
    expect(execution).toContain('label="Signed task details"');
    expect(execution).toContain('data-testid="validation-matrix"');
    expect(execution).toContain("lifecycleArtifactLabel(artifact.role)");
    expect(execution).toContain('label="Agent activity"');
    expect(execution).toContain("<RunEventTimeline");
    expect(execution).not.toContain("MetadataList");
    expect(execution).not.toContain("order-execution-task-material");
    expect(execution).not.toContain("order-execution-task-contract");
    expect(execution).not.toContain('label="Technical details"');
    expect(execution).not.toContain("<dt>Task id</dt>");
    expect(execution).not.toContain("<dt>Provider session</dt>");
    expect(execution).not.toContain("providerSessionId");
    expect(execution).not.toContain("baselineCommit");
    expect(execution).not.toContain("contextHash");
    expect(execution).not.toContain("approvalId");
    expect(execution).not.toContain("planTaskId");
    expect(execution).not.toContain("MarkdownEditor");
    expect(execution).not.toContain("updateArtifactContent");

    const masterDetail = read("ui/src/primitives/WorkbenchMasterDetail.tsx");
    expect(masterDetail).toContain('width="var(--order-master-width)"');
    expect(masterDetail).not.toContain("masterWidth");
    expect(masterDetail).not.toContain("master: ReactNode");
    expect(masterDetail).toContain("items: readonly Readonly");
    expect(masterDetail).not.toContain("WorkbenchTable");
    expect(masterDetail).toContain('className="order-workbench-master-item"');
    expect(masterDetail).toContain("aria-pressed={item.selected}");
    expect(masterDetail).toContain("attempt.parentId === item.id");
    expect(execution).toContain('title="Validation for selected attempt"');
    expect(execution).toContain("No validation results in this attempt");
    const rail = read("ui/src/primitives/WorkbenchRail.tsx");
    expect(rail).toContain("order-workbench-process-marker");
    expect(rail).toContain('reached ? "✓" : item.markerSymbol ?? index + 1');
    expect(rail).toContain('data-tone={reached ? "success" : item.statusTone ?? "neutral"}');
    expect(rail).toContain("Previously reached (not a validation verdict)");
    expect(rail).toContain('aria-current={item.state === "current" ? "step" : undefined}');
    expect(rail).toContain("aria-pressed={item.selected}");
    expect(rail).toContain('hidden={item.state !== "current"}');
    expect(execution).toContain('label="Task overview"');
    expect(execution).toContain('label: "Task validation boundary"');

    expect(documentWorkspace).not.toContain("RequirementsAuthorityFacts");
    expect(documentWorkspace).not.toContain('aria-label="Requirements authority"');
    expect(documentWorkspace).not.toContain("artifact.authorityLayer");

    const workItemContext = read("ui/src/WorkItemContext.tsx");
    expect(workItemContext).toContain('label:"Artifact id"');
    expect(workItemContext).toContain('label:"Authority layer"');
    expect(workItemContext).toContain('label:"Git commit"');

    const markdownEditor = read("ui/src/MarkdownEditor.tsx");
    expect(markdownEditor).not.toContain("WorkbenchSectionHeader");
    expect(markdownEditor).not.toContain("order-markdown-document-view-header");
    expect(markdownEditor).not.toContain("order-markdown-document-view-actions");
    expect(markdownEditor).not.toContain("WorkbenchDisclosure");
    expect(markdownEditor).not.toContain('label="Technical details"');
    expect(markdownEditor).toContain("toolbarAccessory?: ReactNode");
    expect(markdownEditor).toContain("{toolbarAccessory}");
    expect(documentWorkspace).not.toContain("toolbarAccessory=");
    expect(markdownEditor).not.toContain("viewAside");
    expect(markdownEditor).not.toContain("editingTitle");
    expect(markdownEditor).not.toContain("title: string");
    expect(documentWorkspace).toContain("<WorkbenchDocument");
    expect(documentWorkspace).toContain("<WorkbenchFacts");
    expect(documentWorkspace).toContain('label: "Work request context"');
    expect(documentWorkspace).toContain('label: "Document location"');
    expect(documentWorkspace).not.toContain("facts={");
    expect(documentWorkspace).not.toContain("WorkRequestFacts");
    expect(documentWorkspace).not.toContain("order-document-facts");
    expect(documentWorkspace).not.toContain("MetadataList");
    expect(documentWorkspace).not.toContain("metadata.schemaId.replace");
    const documentPrimitive = read("ui/src/primitives/WorkbenchDocument.tsx");
    expect(documentPrimitive).toContain("title: string");
    expect(documentPrimitive).toContain("details?: Readonly");
    expect(documentPrimitive).toContain("WorkbenchDisclosure");
    expect(documentPrimitive).not.toContain("facts?: ReactNode");
    expect(documentPrimitive).toContain("content: ReactNode");
    expect(documentPrimitive.indexOf("order-workbench-document-content"))
      .toBeLessThan(documentPrimitive.indexOf("order-workbench-document-details"));

    const table = read("ui/src/primitives/WorkbenchTable.tsx");
    expect(table).toContain('overflowWrap: "normal"');
    expect(table).toContain('wordBreak: "normal"');
    expect(table).toContain('maxWidth: "none"');
    expect(table).toContain('tableLayout: "auto"');
    expect(table).toContain('textOverflow: "clip"');
    expect(table).toContain('whiteSpace: "normal"');
    expect(table).toContain("style={WORKBENCH_TABLE_STYLE}");
    expect(table).toContain("style={WORKBENCH_TABLE_HEADER_CELL_STYLE}");
    expect(table).toContain("style={WORKBENCH_TABLE_CELL_STYLE}");

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
    expect(theme).not.toContain(".order-workbench-table-cell");

    for (const forbidden of [
      ".order-evidence-viewer",
      ".order-evidence-code-label",
      ".order-code-view",
      ".order-evidence-code-bytes",
      ".order-markdown-document-view-header",
      ".order-markdown-document-view-actions",
      ".order-workbench-document-facts",
      ".order-review-readiness-",
      ".order-review-approval-",
      ".order-proposal-diff",
      ".order-proposal-facts",
      ".order-productive-research-context",
      ".order-settings-workspace",
      ".order-settings-page-heading",
      ".order-settings-content",
      ".order-settings-section",
      ".order-settings-navigation",
      ".order-settings-supporting-info",
      ".order-settings-task-surface",
      ".order-settings-repository-identity",
      ".order-settings-add-repository",
      ".order-opencode-account-footnote",
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
    const markdownEditorRule = theme.match(/\.order-markdown-editor\s*\{([^}]*)\}/)?.[1] ?? "";
    const sourcePaneRule = theme.match(/\.order-editor-source-pane,[\s\S]*?\{([^}]*)\}/)?.[1] ?? "";
    expect(markdownEditorRule).not.toContain("border-radius");
    expect(sourcePaneRule).not.toContain("border-radius");
    const reviewRule = theme.match(/\.order-workbench-review\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(reviewRule).not.toMatch(/(?:^|\s)(?:background|border|border-radius)\s*:/);

    const editorRule = theme.match(/\.order-markdown-editor\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(editorRule).toContain("grid-template-rows: auto auto minmax(0, 1fr);");

    const formattingToolbarRule =
      theme.match(/\.order-markdown-format-toolbar\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(formattingToolbarRule).toContain("display: flex;");
    expect(formattingToolbarRule).toContain("flex-wrap: nowrap;");

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
    expect(lifecycle).toContain("trigger must belong to an earlier Run of the current ExecutionTask and baseline");
    expect(lifecycle).toContain("causalRun(trigger)");
    expect(lifecycle).toContain("predecessor.baselineCommit !== run.baselineCommit");
    expect(lifecycle).toContain("predecessor.workItemId !== run.workItemId");
    expect(lifecycle).toContain("predecessor.attempt >= run.attempt");
    expect(lifecycle).toContain('run.role === "REVIEWER"');
    expect(lifecycle).toContain("REVIEWER trigger must identify CANDIDATE_STATE_RECORDED");
    expect(lifecycle).toContain("REVIEWER trigger must identify CANDIDATE_STATE_RECORDED from the current task builder or remediator");
    expect(lifecycle).toContain("QA reviewer requires exact REVIEW_STARTED admission");
    expect(lifecycle).toContain("candidateFindingDispositions(priorHistory,rounds,tasks,runs,events)");
    expect(lifecycle).not.toContain("candidateRun.triggerEventId === run.triggerEventId");
    expect(lifecycle).toContain("causalRun(candidateEvent)");
    expect(lifecycle).toContain("return validationBoundaryFromEvents(runEvents)");
    expect(lifecycle).toContain("event.stage !== validationOrder[expectedIndex]");
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
    expect(workspace).toContain("api.getCurrentApproval(workItem.id)");
    expect(workspace).toContain("tasks.filter((task) => task.approvalId === currentApproval.id)");
    expect(workspace).not.toContain("latestApprovalTasks(tasks)");
    expect(workspace).toContain('workItem.stage === "EXECUTION" ? coherenceTasks : []');
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
    expect(workspace).toMatch(
      /currentAttention === "MUTATION_CONFLICT"[\s\S]*title: "Workflow state changed during the action"/,
    );
    expect(workspace).not.toContain('case "MUTATION_CONFLICT": return "error" as const;');
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
    expect(workspace).not.toContain('if (selectedStepState === "HISTORICAL") return "Approved"');
    expect(workspace).not.toMatch(/message\.(?:match|includes)|parse.*message/i);
    expect(workspace).toContain("signoffPackageQuery.isFetching");
    expect(workspace).toContain("api.listExecutionTasks(workItem.id)");
    expect(workspace).toContain("api.listArtifacts(workItem.id)");
    expect(workspace).toContain("packageValue={supersededProspective ? supersededPackage : selectedApproval === null && workItem.stage === \"AWAITING_SIGNOFF\" ? signoffPackageQuery.data ?? null : null}");
    expect(workspace).toContain("packageSuperseded={supersededProspective}");
    expect(workspace).toContain("workbenchQueryKeys.observedSignoffPackage(workItem.id, supersededHash)");
    expect(workspace).toContain("workbenchQueryKeys.signoffPackageArtifacts(workItem.id, supersededHash)");
    expect(workspace).toContain("artifacts={supersededProspective ? supersededArtifacts : selectedApproval !== null ? selectedApprovalArtifactsQuery.data ?? [] : prospectiveArtifactsQuery.data ?? []}");
    expect(workspace).toContain("tasks={selectedApproval === null ? [] : tasks.filter(task => task.approvalId === selectedApproval.id)}");
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
    expect(activity).toContain("stageRunCancellationIsAdmitted");
    for (const competingOwner of [
      "PROPOSAL_DECISION",
      "PROPOSAL_ADOPTION",
      "MUTATION_CONFLICT",
      "CONVERGING",
    ]) {
      expect(activity).toContain(competingOwner);
    }
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
    expect(execution).toMatch(/onError:\s*reportError/);
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
    expect(execution).toContain('currentOwnerTask?.id === selectedTask.id');
    expect(execution).toContain('selectedTask.state === "CANDIDATE_DONE"');
    expect(execution).toContain('selectedTask.state === "ALREADY_SATISFIED"');
    expect(execution).toContain('label: "Task validation boundary"');
    const attemptValidation = execution.slice(execution.indexOf("const ValidationSummary ="), execution.indexOf("const ValidationSummary =") + execution.slice(execution.indexOf("const ValidationSummary =")).indexOf("\n};") + 3);
    expect(attemptValidation).toContain("latestValidationEvent(events, stage)");
    expect(attemptValidation).not.toContain("ValidationBoundary");
    expect(attemptValidation).not.toContain("validationBoundaryLabel");
    expect(activity.indexOf("const cancel = useMutation(")).toBeGreaterThanOrEqual(0);
    expect(activity.indexOf("const cancel = useMutation(")).toBeLessThan(activity.indexOf("if (selectedRun === null) return"));
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
    expect(accountControl).toContain("useOpenCodeAccountControl");
    expect(accountControl).not.toContain("onOpenSettings");
    expect(accountControl).not.toContain("WorkbenchUtilityLink");
    expect(accountControl).not.toContain("WorkbenchStatus");
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
    expect(accountControl).not.toContain("mutationBlockers");
    expect(accountControl).not.toContain("Changes blocked");
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

  it("keeps workflow material navigation interaction-specific instead of generic", () => {
    const preSignoff = read("ui/src/PreSignoffStageWorkspace.tsx");
    const readiness = read("ui/src/ReadinessWorkspace.tsx");
    const approval = read("ui/src/SignoffReview.tsx");
    const implementation = read("ui/src/ExecutionWorkspace.tsx");

    for (const source of [preSignoff, readiness, approval, implementation]) {
      expect(source).not.toContain("WorkflowStepIndex");
      expect(source).not.toContain("WorkflowMaterialSelector");
      expect(source).not.toContain("PrimaryMaterialFrame");
      expect(source).not.toContain('data-testid="workflow-step-index"');
    }
    expect(preSignoff).toContain("WorkbenchResourceList");
    expect(preSignoff).not.toContain('"Supporting material and history"');
    expect(preSignoff).not.toContain("WorkbenchDisclosure");
    expect(readiness).toContain("WorkbenchResourceList");
    expect(readiness).toContain('title: "Evidence"');
    expect(readiness).toContain('title: "Readiness attempts"');

    // Implementation retains its canonical task master/detail topology while
    // attempt/history navigation uses explicit resource actions.
    expect(implementation).toContain("WorkbenchMasterDetail");
    expect(implementation).toContain("WorkbenchResourceList");
    for (const source of [preSignoff, readiness, approval, implementation]) {
      expect(source).not.toContain("order-resource-list");
    }
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
      '"systemctl", "--user", "show", "--property=ActiveState", "--value", unit',
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
      "does not automatically commit implementation or candidate changes",
      "push, merge, deploy",
    ]) {
      expect(readme).toContain(required);
    }
    expect(readme).not.toContain("export PONTIVUS_ORDER_OPENCODE_MODEL");
    expect(readme).not.toContain("Host-native daemon autostart/process supervision is outside v1");
  });
  it("locks the authority-bound 0.6.0 visual comparison corpus and removes superseded UI paths", () => {
    const expectedReferences = [
      "README.md",
      "reference-atlas.html",
      "reference-manifest.json",
    ].sort();

    const references = readdirSync(join(root, "docs/references/workbench-ui")).sort();
    expect(references).toEqual(expectedReferences);
    expect(references.some((name) => name.endsWith(".svg"))).toBe(false);

    const referenceManifest = JSON.parse(
      read("docs/references/workbench-ui/reference-manifest.json"),
    ) as {
      semanticAuthority?: boolean;
      surfaces?: readonly { id?: string }[];
    };
    expect(referenceManifest.semanticAuthority).toBe(false);
    const surfaceIds = (referenceManifest.surfaces ?? []).map((row) => row.id ?? "");
    expect(surfaceIds).toHaveLength(38);
    expect(new Set(surfaceIds).size).toBe(38);
    expect(surfaceIds).toContain("SURF-STEP-ACCEPTANCE-001");

    const referenceAtlas = read("docs/references/workbench-ui/reference-atlas.html");
    for (const surfaceId of surfaceIds) {
      expect(referenceAtlas).toContain('data-surf="' + surfaceId + '"');
    }

    const documentReferenceIds = [
      "SURF-STEP-WR-001",
      "SURF-STEP-DESIGN-001",
      "SURF-STEP-PLAN-001",
      "SURF-MAT-SOURCE-001",
      "SURF-MAT-DOC-001",
      "SURF-MAT-DOC-RO-001",
    ] as const;
    const referenceLine = (surfaceId: string) =>
      referenceAtlas
        .split(/\r?\n/)
        .find((line) => line.includes('data-surf="' + surfaceId + '"')) ?? "";
    for (const surfaceId of documentReferenceIds) {
      const fixture = referenceLine(surfaceId);
      const documentOffset = fixture.indexOf('<article class="document">');
      const detailsOffset = fixture.indexOf('<details class="documentdetails">');
      expect(documentOffset).toBeGreaterThanOrEqual(0);
      expect(detailsOffset).toBeGreaterThan(documentOffset);
      expect(fixture).not.toContain('<details class="documentdetails" open');
      expect(fixture.slice(0, documentOffset)).not.toContain('<dl class="facts">');
    }
    for (const surfaceId of ["SURF-STEP-WR-001", "SURF-MAT-SOURCE-001"]) {
      expect(referenceLine(surfaceId)).toContain("<summary>Work request context</summary>");
    }
    for (const surfaceId of [
      "SURF-STEP-DESIGN-001",
      "SURF-STEP-PLAN-001",
      "SURF-MAT-DOC-001",
      "SURF-MAT-DOC-RO-001",
    ]) {
      expect(referenceLine(surfaceId)).toContain("<summary>Document location</summary>");
    }
    expect(referenceLine("SURF-MAT-DOC-RO-001")).not.toContain("editor-controls");

    const referenceReadme = read("docs/references/workbench-ui/README.md");
    expect(referenceReadme).toContain("active derived comparison evidence");
    expect(referenceReadme).toContain("Git history is the only retained provenance for the superseded 0.5.0 SVG pack");
    expect(referenceReadme).toContain("must never fabricate");
    const browserEvidence = read("tests/browser.spec.ts");
    expect(browserEvidence).toContain("reference-manifest.json");
    expect(browserEvidence).toContain("reference-atlas.html");
    expect(browserEvidence).not.toMatch(/docs\/references\/workbench-ui\/[^"'\`]+\.svg/);

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


describe("0.6.0 Wave 1 authority-governance certification", () => {
  it("certifies schema-pinned material authority through the production STAGE path", () => {
    const repository = mkdtempSync(join(tmpdir(), "order-cert-authority-repo-"));
    const state = mkdtempSync(join(tmpdir(), "order-cert-authority-state-"));
    try {
      mkdirSync(join(repository, "docs"), { recursive: true });
      mkdirSync(join(repository, "src"), { recursive: true });
      writeFileSync(join(repository, "AGENTS.md"), "# agent authority\n");
      writeFileSync(join(repository, "docs", "principles.md"), "# principles\n");
      writeFileSync(join(repository, "docs", "product-a.md"), "# product A\n");
      writeFileSync(join(repository, "docs", "product-b.md"), "# product B\n");
      writeFileSync(join(repository, "docs", "work-lifecycle.md"), "# work lifecycle\n");
      writeFileSync(join(repository, "docs", "lifecycle-context-current.md"), "# lifecycle context current\n");
      writeFileSync(join(repository, "docs", "lifecycle-context-v1.md"), "# lifecycle context v1\n");
      writeFileSync(
        join(repository, "pontivus-order.toml"),
        `version = 1
projectId = "certification"

[authority]
p1 = ["AGENTS.md", "docs/principles.md"]
p2 = ["docs/product-a.md", "docs/product-b.md"]
p3 = ["docs/work-lifecycle.md", "docs/lifecycle-context-current.md", "docs/lifecycle-context-v1.md"]
p4 = []
p5 = []
p6 = []

[refs]
P1-STRICT = "docs/principles.md"
P1-FCIS-EXT = "AGENTS.md"
GW-DOC-WORK-LIFECYCLE-V1 = "docs/work-lifecycle.md"
GW-DOC-LIFECYCLE-CONTEXT-V1 = "docs/lifecycle-context-v1.md"
GW-DOC-LIFECYCLE-CONTEXT-V2 = "docs/lifecycle-context-current.md"
PRODUCT-A = "docs/product-a.md"
PRODUCT-B = "docs/product-b.md"

[stageAuthorityRefs]
R1 = ["PRODUCT-A"]

[refDependencies]
PRODUCT-A = ["PRODUCT-B"]

[precedence]
p2 = ["docs/product-b.md", "docs/product-a.md"]
p3 = ["docs/lifecycle-context-v1.md", "docs/lifecycle-context-current.md", "docs/work-lifecycle.md"]

[[governance.overrides]]
defaultRuleId = "GW-P1-STRICT-TYPING"
source = "docs/principles.md"
authorityRef = "P1-STRICT"
gates = ["architecture"]

[[governance.extensions]]
defaultRuleId = "GW-P1-FCIS"
source = "AGENTS.md"
authorityRef = "P1-FCIS-EXT"
gates = ["test"]

[governance.fitness]
GW-P1-FCIS = ["architecture"]

[concerns.shell]
authority = ["AGENTS.md"]
paths = ["src/**"]
gates = ["test"]

[verification.architecture]
argv = ["bash", "-c", "true"]
cwd = "."
timeoutSeconds = 30
inheritEnv = []
materialRefs = []

[verification.test]
argv = ["bash", "-c", "true"]
cwd = "."
timeoutSeconds = 30
inheritEnv = []
materialRefs = []
`,
      );
      writeFileSync(join(repository, "src", "target.ts"), "export {};\n");
      for (const args of [
        ["init"],
        ["config", "user.email", "certification@example.com"],
        ["config", "user.name", "Certification"],
        ["add", "."],
        ["commit", "-m", "certification baseline"],
      ]) {
        const result = spawnSync("git", args, {
          cwd: repository,
          encoding: "utf8",
        });
        if (result.status !== 0) {
          throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
        }
      }

      const script = `
        const fs = await import("node:fs");
        const sql = await import("./src/shell/sqlite.ts");
        const coord = await import("./src/daemon/coordinator.ts");
        const authority = await import("./src/daemon/authority.ts");
        const stage = await import("./src/daemon/stage.ts");
        const repositoryRoot = ${JSON.stringify(repository)};
        const stateRoot = ${JSON.stringify(state)};
        const database = sql.openOrderDatabase(stateRoot);
        const runtime = coord.createCoordinatorRuntime(
          database,
          stateRoot,
          process.env,
          {
            version: 4,
            model: { providerID: "opencode", id: "glm-5.3-flash-free" },
            repositoryRoots: [repositoryRoot],
            referenceRoots: [],
          },
        );
        const currentCreated = await coord.createWorkItem(runtime, {
          projectId: "certification",
          schemaId: "change-v2",
          title: "current authority certification",
          concernIds: ["shell"],
        });
        const retainedCreated = await coord.createWorkItem(runtime, {
          projectId: "certification",
          schemaId: "change-v1",
          title: "retained authority certification",
          concernIds: ["shell"],
        });
        const currentWork = coord.getWorkItem(runtime, currentCreated.id);
        const retainedWork = coord.getWorkItem(runtime, retainedCreated.id);
        const [, reachable] = await authority.resolveCurrentStageAuthority(
          currentWork,
          "R1",
        );
        const current = await authority.resolveStageContextState(
          runtime, currentWork, "R1",
        );
        const retained = await authority.resolveStageContextState(
          runtime, retainedWork, "R1",
        );
        const currentPrompt = await stage.stagePrompt(
          currentWork, "R1", current.context, [], [],
        );
        const retainedPrompt = await stage.stagePrompt(
          retainedWork, "R1", retained.context, [], [],
        );
        const p2 = reachable.layers.find(
          (entry) => entry.layer === "p2",
        );
        const p3 = reachable.layers.find(
          (entry) => entry.layer === "p3",
        );
        const currentMaterialP3 = current.context.authority.layers.find(
          (entry) => entry.layer === "p3",
        );
        const retainedMaterialP3 = retained.context.authority.layers.find(
          (entry) => entry.layer === "p3",
        );
        const materialP3 = (context) => context.artifacts
          .filter((artifact) => artifact.authorityLayer === "P3")
          .map((artifact) => artifact.repositoryPath);
        const materialP2 = current.context.artifacts
          .filter((artifact) => artifact.authorityLayer === "P2")
          .map((artifact) => artifact.repositoryPath);
        const retainedP2 = retained.context.artifacts
          .filter((artifact) => artifact.authorityLayer === "P2")
          .map((artifact) => artifact.repositoryPath);

        const manifestPath = repositoryRoot + "/pontivus-order.toml";
        fs.writeFileSync(
          manifestPath,
          fs.readFileSync(manifestPath, "utf8").replace(
            'GW-DOC-LIFECYCLE-CONTEXT-V2 = "docs/lifecycle-context-current.md"\\n',
            "",
          ),
        );
        let blockedBeforeProvider = false;
        let rejection = "";
        try {
          await coord.startStageRun(runtime, currentCreated.id, "INTERACTIVE");
        } catch (error) {
          rejection = error instanceof Error ? error.message : String(error);
          blockedBeforeProvider = coord.listRuns(runtime, currentCreated.id).length === 0;
        }
        console.log(JSON.stringify({
          p2,
          p3,
          materialP2,
          retainedP2,
          currentMaterialP3,
          retainedMaterialP3,
          currentP3: materialP3(current.context),
          retainedP3: materialP3(retained.context),
          currentAuthorityRefs: current.context.authority.authorityRefs,
          retainedAuthorityRefs: retained.context.authority.authorityRefs,
          inherited: current.context.authority.inheritedDefaultRuleIds,
          fitness: current.context.authority.fitnessGateIds,
          currentPromptHasProjection:
            currentPrompt.includes("Resolved project authority projection:"),
          retainedPromptHasProjection:
            retainedPrompt.includes("Resolved project authority projection:"),
          blockedBeforeProvider,
          rejection,
        }));
        database.close();
      `;
      const result = spawnSync("bun", ["-e", script], {
        cwd: root,
        encoding: "utf8",
        env: process.env,
      });
      if (result.status !== 0) {
        throw new Error(`production authority certification failed: ${result.stderr}`);
      }
      const output = JSON.parse(result.stdout.trim()) as {
        p2: { layer: string; sources: string[]; precedence: string[] };
        p3: { layer: string; sources: string[]; precedence: string[] };
        materialP2: string[];
        retainedP2: string[];
        currentMaterialP3: { layer: string; sources: string[]; precedence: string[] };
        retainedMaterialP3: { layer: string; sources: string[]; precedence: string[] };
        currentP3: string[];
        retainedP3: string[];
        currentAuthorityRefs: Array<[string, string]>;
        retainedAuthorityRefs: Array<[string, string]>;
        inherited: string[];
        fitness: string[];
        currentPromptHasProjection: boolean;
        retainedPromptHasProjection: boolean;
        blockedBeforeProvider: boolean;
        rejection: string;
      };
      expect(output.p2).toEqual({
        layer: "p2",
        sources: ["docs/product-b.md", "docs/product-a.md"],
        precedence: ["docs/product-b.md", "docs/product-a.md"],
      });
      expect(output.p3).toEqual({
        layer: "p3",
        sources: [
          "docs/lifecycle-context-v1.md",
          "docs/lifecycle-context-current.md",
          "docs/work-lifecycle.md",
        ],
        precedence: [
          "docs/lifecycle-context-v1.md",
          "docs/lifecycle-context-current.md",
          "docs/work-lifecycle.md",
        ],
      });
      expect(output.materialP2).toEqual(["docs/product-b.md", "docs/product-a.md"]);
      expect(output.retainedP2).toEqual([]);
      expect(output.currentMaterialP3).toEqual({
        layer: "p3",
        sources: [
          "docs/lifecycle-context-current.md",
          "docs/work-lifecycle.md",
        ],
        precedence: [
          "docs/lifecycle-context-current.md",
          "docs/work-lifecycle.md",
        ],
      });
      expect(output.retainedMaterialP3).toEqual({
        layer: "p3",
        sources: [
          "docs/lifecycle-context-v1.md",
          "docs/work-lifecycle.md",
        ],
        precedence: [
          "docs/lifecycle-context-v1.md",
          "docs/work-lifecycle.md",
        ],
      });
      expect(output.currentAuthorityRefs).toContainEqual([
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "docs/lifecycle-context-current.md",
      ]);
      expect(output.currentAuthorityRefs).not.toContainEqual([
        "GW-DOC-LIFECYCLE-CONTEXT-V1",
        "docs/lifecycle-context-v1.md",
      ]);
      expect(output.retainedAuthorityRefs).toContainEqual([
        "GW-DOC-LIFECYCLE-CONTEXT-V1",
        "docs/lifecycle-context-v1.md",
      ]);
      expect(output.retainedAuthorityRefs).not.toContainEqual([
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "docs/lifecycle-context-current.md",
      ]);
      expect(output.currentP3).toEqual([
        "docs/lifecycle-context-current.md",
        "docs/work-lifecycle.md",
      ]);
      expect(output.retainedP3).toEqual([
        "docs/lifecycle-context-v1.md",
        "docs/work-lifecycle.md",
      ]);
      expect(output.inherited).toContain("GW-P1-FCIS");
      expect(output.inherited).not.toContain("GW-P1-STRICT-TYPING");
      expect(output.fitness).toEqual(["architecture", "test"]);
      expect(output.currentPromptHasProjection).toBe(true);
      expect(output.retainedPromptHasProjection).toBe(true);
      expect(output.blockedBeforeProvider).toBe(true);
      expect(output.rejection).toContain(
        "stage template AuthorityRef is not reachable in R1 context: GW-DOC-LIFECYCLE-CONTEXT-V2",
      );
    } finally {
      rmSync(repository, { recursive: true, force: true });
      rmSync(state, { recursive: true, force: true });
    }
  }, 30_000);
  it("binds resolved authority, governed proposals and durable decisions to the production STAGE path", () => {
    const governance = read("src/core/governance.ts");
    expect(governance).toContain("export const resolveProjectAuthority");
    expect(governance).toContain("manifest.precedence[layer]");
    expect(governance).toContain("inheritedDefaultRuleIds");
    expect(governance).toContain("fitnessGateIdsByDefaultRuleId");
    expect(governance).toContain("permanentAuthorityProposalIsAdmitted");
    expect(governance).toContain("export const projectAuthorityForSources");
    expect(governance).not.toContain("readFileSync");
    expect(governance).not.toContain("Bun.Glob");

    const authority = read("src/daemon/authority.ts");
    const stageAuthority = authority.slice(
      authority.indexOf("export const resolveCurrentStageAuthority"),
      authority.indexOf("export type StageContextResolution"),
    );
    expect(stageAuthority).toContain("resolveAuthoritySources");
    expect(stageAuthority).toContain("resolveProjectAuthority(manifest, sources)");
    const materiality = authority.slice(
      authority.indexOf("const applicableAuthorityPaths"),
      authority.indexOf("export type StageContextResolution"),
    );
    expect(materiality).toContain("for (const layer of authority.layers)");
    expect(materiality).toContain("if (!applicablePaths.has(path)) continue");
    const stageContext = authority.slice(
      authority.indexOf("export const resolveStageContextState"),
      authority.indexOf("export const resolveStageConformanceState"),
    );
    expect(stageContext).toContain("applicableAuthorityPaths");
    expect(stageContext).not.toContain("for (const path of sources[layer])");
    expect(stageContext).not.toContain("manifest.authority[");

    const stage = read("src/daemon/stage.ts");
    expect(stage).toContain("canonicalJson(context.authority)");
    expect(stage).toContain("resolveCurrentStageAuthority");
    expect(stage).toContain("permanentAuthorityProposalIsAdmitted");
    expect(stage).toContain("permanent authority proposal baseSha256 is stale");
    const adoption = stage.slice(
      stage.indexOf("const adoptArtifactProposalUnlocked"),
      stage.indexOf("export const adoptArtifactProposal"),
    );
    expect(
      adoption.match(/resolveCurrentStageAuthority/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);

    const lifecycle = read("src/core/lifecycle.ts");
    expect(lifecycle).not.toContain('from "./governance.ts"');
    expect(lifecycle).toContain("durableDecisionCompletionIsAdmitted");
    expect(lifecycle).toContain(
      "stage completion after durable decision input requires a later adopted canonical authority proposal",
    );
    expect(lifecycle).not.toContain("durableDecisionStore");
  });
});

describe("0.6.0 composed closure certification", () => {
  it("keeps one canonical owner per corrected concern with no compatibility fallback or shadow state", () => {
    const source = read("src/daemon/work-item-source.ts");
    const create = source.slice(
      source.indexOf("export const createWorkItemFromSource"),
      source.indexOf("const activeRunExists"),
    );
    expect(create).toContain("applyPlan(runtime, plan)");
    expect(create).not.toContain("storeWorkItem(");

    const execution = read("src/core/execution.ts");
    expect(execution.match(/SignedTaskBlockSchema\.parse/g) ?? []).toHaveLength(1);
    expect(execution).toContain("admitSignedTaskBlockForSchema");

    const governance = read("src/core/governance.ts");
    expect(governance).toContain("resolveProjectAuthority");
    expect(governance).toContain("permanentAuthorityProposalIsAdmitted");

    const lifecycle = read("src/core/lifecycle.ts");
    expect(lifecycle).toContain("durableDecisionCompletionIsAdmitted");
    expect(lifecycle).not.toContain("durableDecisionStore");

    const setup = read("src/shell/setup.ts");
    expect(setup).not.toContain("allowLegacyUpdate && configured === null && !reconfigure");
    expect(setup).toContain("publication !== undefined && established");
    expect(setup).toContain("readInstallerConfigForUpgrade(stateRoot, publication.snapshot)");
    expect(setup).toContain("writeOrderConfig(stateRoot, retained, publication)");
    expect(setup.indexOf("publication !== undefined && established")).toBeLessThan(setup.indexOf("let models = existing === null"));
    const installer = read("src/installer.ts");
    expect(installer).toContain("await confirmInstallationHistory(historyRoot, question)");
    expect(installer).toContain("if (!established) await configuredSetup.setupModule.requireFreshInstallerReadiness");
    expect(installer.indexOf("requireFreshInstallerReadiness(runtimeEnvironment(locations))")).toBeLessThan(installer.indexOf("rename(temporaryMarker, marker)"));
    expect(installer.indexOf("rename(temporaryMarker, marker)")).toBeLessThan(installer.indexOf("// Never roll back a committed installation because finalization failed."));
    expect(setup).toContain("setup in browser Settings.");

    const presentation = read("ui/src/workbench-presentation.ts");
    expect(presentation).toContain("workOutcomeProductLabel");
    expect(presentation).not.toMatch(/data-theme|prefers-color-scheme|colorScheme/);

    const daemonExecution = read("src/daemon/execution.ts");
    const validation = read("src/daemon/validation.ts");
    const openCode = read("src/shell/opencode.ts");
    expect(daemonExecution).toContain("GATE_CHECKPOINT_REQUESTED");
    expect(validation).toContain("forecastVariancePaths");
    expect(openCode).toContain("task.scope.map");
    expect(openCode).not.toContain("for (const path of task.changeSurface)");
  });
});

describe("0.6.0 Wave 4 Workbench and product-language certification", () => {
  it("keeps current attention, readiness, approval hierarchy, focus, settings detail and product labels on canonical owners", () => {
    const presentation = read("ui/src/workbench-presentation.ts");
    const workspace = read("ui/src/WorkItemWorkspace.tsx");
    const composer = read("ui/src/ActivityComposer.tsx");
    const readiness = read("ui/src/ReadinessWorkspace.tsx");
    const approval = read("ui/src/SignoffReview.tsx");
    const settings = read("ui/src/SettingsWorkspace.tsx");
    const terminal = read("ui/src/TerminalResult.tsx");
    const readme = read("README.md");

    expect(workspace).toContain("canonicalCurrentMaterialIdentity");
    expect(workspace).toContain("materialIdentity !== canonicalCurrentMaterialIdentity");
    expect(workspace).toContain('label={"Return to " + workflow.label}');

    expect(workspace).toContain("focusedRequiredInputEventId, setFocusedRequiredInputEventId");
    expect(workspace).toContain("onRequiredInputFocused={setFocusedRequiredInputEventId}");
    expect(composer).toContain('pending?.event.tag === "HUMAN_INPUT_REQUESTED"');
    expect(composer).toContain("requestId === focusedRequiredInputEventId");
    expect(composer).toContain("onRequiredInputFocused(requestId)");
    expect(composer).not.toContain("focusedRequestEventId.current");
    expect(composer).toContain("region.focus({ preventScroll: true })");
    expect(composer).toContain("ref={regionRef}");
    expect(composer).toContain("tabIndex={-1}");
    expect(composer).not.toContain("ChatComposerInputHandle");
    expect(composer).not.toContain("<ChatComposer");
    expect(composer).toContain("<TextInput");
    expect(composer).toContain('<WorkbenchAction label="Send" type="submit"');
    expect(composer).not.toContain("handleRef=");
    expect(composer).not.toContain("Answer the question above");
    expect(composer).not.toContain("Continue current work");

    const activity = read("ui/src/ActivityWorkspace.tsx");
    const preSignoff = read("ui/src/PreSignoffStageWorkspace.tsx");
    expect(activity).not.toContain("Open for continuation");
    expect(preSignoff).toContain("<WorkbenchSection");
    expect(preSignoff).toContain('title="Related material"');
    expect(preSignoff).not.toContain('aria-label="Related workflow material"');
    expect(preSignoff).not.toContain('aria-label="Supporting workflow material"');

    expect(readiness).toContain("admittedStageCompletion(workItem.id, selectedRun, runEvents)");
    expect(readiness).toContain("artifact.id === completion.artifactRefIds[0]");
    expect(readiness).toContain("readinessContentQuery.isSuccess");
    expect(readiness).toContain("readinessOutcomeLabel(outcome)");
    expect(readiness).toContain("WorkbenchReview");
    expect(readiness).toContain("verdict={{");
    expect(readiness).not.toContain("Derived from governed readiness-review material when present");
    expect(approval).toContain("WorkbenchReview");
    expect(approval).toContain('label: "Ready for sign-off"');
    expect(approval).not.toContain('data-testid="approval-readiness-summary"');
    expect(approval).not.toContain("WorkbenchDisclosure");
    expect(approval).toContain('title: "Package documents"');
    expect(approval).toContain('title: packageSuperseded ? "Historical proposed tasks" : currentApproval ? "Signed tasks" : "Approved tasks"');
    expect(approval).toContain('const currentApproval = !packageSuperseded && workItem.stage === "AWAITING_SIGNOFF"');
    expect(approval).toContain("if (packageSuperseded || packageValue === null || packageStale");
    expect(approval).toContain("currentApproval &&");
    expect(approval).toContain('label: "Inspected package is no longer current"');
    expect(approval).not.toContain('aria-label="Package material"');
    expect(readiness).not.toContain("embeddedReadOnly");
    expect(readiness).not.toContain("READY_FOR_SIGNOFF");

    expect(settings).toContain('data-testid="settings-diagnostics"');
    expect(settings).toContain('"Inspect settings diagnostics"');
    expect(settings).toContain('"Hide settings diagnostics"');
    expect(settings).toContain("ariaExpanded={diagnosticsOpen}");
    expect(settings).toContain('aria-label="Settings diagnostics"');
    expect(settings).not.toContain("WorkbenchDisclosure");
    expect(settings).not.toContain('label="Technical details"');
    expect(settings).not.toContain('data-testid="repository-technical-details"');
    expect(settings).not.toContain("order-settings-workspace");
    expect(settings).not.toContain("order-settings-page-heading");
    expect(settings).not.toContain("order-settings-navigation");
    expect(settings).not.toContain("order-settings-task-surface");
    expect(settings).not.toContain("order-settings-supporting-info");

    const accountSettings = read("ui/src/OpenCodeAccountSettings.tsx");
    expect(accountSettings).not.toContain("order-opencode-account-footnote");
    expect(accountSettings).not.toContain("order-settings-task-surface");
    expect(accountSettings).not.toContain("<code>{account.id}</code>");
    expect(accountSettings).toContain("removing.label");
    expect(accountSettings).toContain("Repository selection and model configuration are unchanged.");

    expect(presentation).toContain("export const workOutcomeProductLabel");
    expect(presentation).toContain('case "CANDIDATE_DONE": return "Verified candidate"');
    expect(terminal).toContain("workOutcomeProductLabel(workItem.outcome)");
    expect(terminal).toContain("<WorkbenchResult");
    expect(terminal).not.toContain('className="order-terminal-result"');
    expect(read("ui/src/primitives/WorkbenchResult.tsx")).toContain('data-testid="final-governed-outcome"');
    expect(terminal).toContain('data-testid="candidate-result-material"');
    expect(terminal).not.toContain("WorkbenchAttention");
    expect(terminal).not.toContain("Final governed outcome");
    expect(terminal).not.toContain("Governed result material");
    expect(terminal).not.toContain("Terminal outcome");
    expect(terminal).not.toContain("order-result-material-root");
    expect(terminal).not.toContain("candidate.proof.relativePath} label=");
    expect(terminal).not.toContain('attention={');
    expect(terminal).not.toContain('candidate.eventTag.replaceAll');
    expect(readme).toContain("Every WorkItem ends at a governed **verified result**");
    expect(readme).toContain("Explicit operator-triggered WorkItem documentation Git commits remain a governed documentation capability");
  });
});

describe("0.6.0 Wave 3 source and queue ownership certification", () => {
  it("keeps one new-source planner, one persistence owner, and one queue derivation", () => {
    const source = read("src/daemon/work-item-source.ts");
    const create = source.slice(
      source.indexOf("export const createWorkItemFromSource"),
      source.indexOf("const activeRunExists"),
    );
    expect(source).toContain("const planNewSource =");
    expect(source).toContain('planNewSource(source, project, "DISCOVERED", archived)');
    expect(create).toContain('planNewSource(source, project, "CREATED", false)');
    expect(create).toContain("applyPlan(runtime, plan)");
    expect(create).not.toContain("storeWorkItem(");

    const app = read("ui/src/app.tsx");
    const queue = read("ui/src/WorkItemQueue.tsx");
    expect(app).toContain("showArchived ? archivedWorkItemsQuery.data ?? workItems : workItems");
    expect(app).toContain("queueDataset.filter((item) => item.projectId === queueProjectId)");
    expect(queue).not.toContain("useQuery(");
    expect(queue).not.toContain("listWorkItemsIncludingArchived");

    const createWorkItem = read("ui/src/CreateWorkItem.tsx");
    expect(createWorkItem).toContain('label="Concerns"');
    expect(createWorkItem).toContain('data-testid="linked-remediation-project"');

    const documents = read("ui/src/DocumentWorkspace.tsx");
    expect(documents).toContain("api.getWorkItemDocumentationGitStatus");
    expect(documents).toContain("api.commitWorkItemDocumentation");
    expect(documents).toContain(
      "Only the exact governed paths reviewed in WorkItemDocumentationGitStatus will be committed.",
    );
    expect(documents).toContain("path.repositoryPath");
    expect(documents).toContain("path.state");
  });
});

describe("0.6.0 Wave 2 contract certification", () => {
  it("keeps one task parser with schema-aware v2 admission and canonical Approval identity", () => {
    const contracts = read("src/core/contracts.ts");
    const execution = read("src/core/execution.ts");
    const stage = read("src/daemon/stage.ts");
    const authority = read("src/daemon/authority.ts");

    expect(execution).toContain("export const admitSignedTaskBlockForSchema");
    expect(execution).toContain('schemaId !== "change-v2" && schemaId !== "defect-v2"');
    expect(execution.match(/SignedTaskBlockSchema\.parse/g) ?? []).toHaveLength(1);

    const signedSchema = contracts.slice(
      contracts.indexOf("const SignedTaskDefinitionSchema"),
      contracts.indexOf("export const SignedTaskBlockJsonSchemaText"),
    );
    expect(signedSchema).not.toContain(".min(1");
    expect(signedSchema).not.toContain(".trim()");
    expect(stage).toContain("admitSignedTaskBlockForSchema(");
    expect(stage).toContain("Current v2 Change/Defect task admission also requires at least one task.");
    expect(authority).toContain("const block = admitSignedTaskBlockForSchema(");
    expect(authority).toContain("const taskBlock = await validateTaskDefinitions(");

    const approvalSchema = contracts.slice(
      contracts.indexOf("export const ApprovalSchema"),
      contracts.indexOf("export type Approval ="),
    );
    expect(approvalSchema).toContain(".trim()");
    expect(approvalSchema).toContain('approvedBy must be non-empty');
    expect(approvalSchema).toContain('approvedBy must not contain NUL');
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
    expect(daemonExecution).toContain("checkpointCapture.changedPaths");
    expect(daemonExecution).toContain('"SCOPE_BREACH"');
    expect(daemonExecution).toContain("validation/v6-change-surface.json");
    expect(daemonExecution).toContain('reviewPass.event.minimumChange === "CHANGE_BLOAT"');
    expect(daemonExecution).toContain('"V6",');
    expect(daemonExecution).toContain('"CHANGE_BLOAT",');

    const opencode = read("src/shell/opencode.ts");
    expect(opencode).toContain("repositoryScopeCapabilityResource");
    expect(opencode).toContain("task.scope.map");
    expect(opencode).not.toContain("for (const path of task.changeSurface)");
    expect(opencode).toContain('"*/AGENTS.md"');
    expect(opencode).toContain("workspaceSymlinkPaths");
    expect(daemonExecution).toContain("protectedPaths");
    expect(daemonExecution).not.toContain(
      "run the applicable resolved architecture fitness gate before proceeding",
    );

    expect(opencode).toContain("remediatorProviderTags");
    expect(opencode).toContain('role === "BUILDER"');
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
    expect(ci).toContain("name: diagnostic current-state rendered evidence");
    expect(ci).toContain("rendered-diagnostic-current-state-${{ steps.diagnostic_candidate.outputs.sha }}");
    expect(ci).toContain('PONTIVUS_ORDER_RENDERED_EVIDENCE_KIND: "diagnostic_current_state"');
    expect(ci.indexOf("name: diagnostic current-state rendered evidence"))
      .toBeLessThan(ci.indexOf("name: browser"));
    expect(ci).toContain("name: bounded IA27/IA28 rendered evidence");
    expect(ci).toContain("rendered-evidence-ia27-ia28-${{ steps.bounded_candidate.outputs.sha }}");
    expect(ci).toContain('--grep "rendered acceptance phase 1"');
    expect(ci).toContain('PONTIVUS_ORDER_RENDERED_ACCEPTANCE_LABEL: "IA27/IA28 bounded evidence"');
    expect(ci.indexOf("name: bounded IA27/IA28 rendered evidence"))
      .toBeLessThan(ci.indexOf("name: browser"));
    expect(ci).toContain("name: rendered acceptance IA26");
    expect(ci).toContain("rendered-acceptance-ia26-${{ steps.rendered_candidate.outputs.sha }}");
    expect(ci).toContain('--grep "rendered acceptance"');
    expect(ci.indexOf("name: browser"))
      .toBeLessThan(ci.indexOf("name: rendered acceptance IA26"));
    const signedPhases = ["IA27_28", "IA29", "IA31", "IA30", "IA32", "IA38", "IA33", "IA34", "IA39"];
    let previous = ci.indexOf("name: Install Playwright Chromium");
    for (const phase of signedPhases) {
      const capture = ci.indexOf("name: signed rendered " + phase + "\n");
      const upload = ci.indexOf("name: Upload signed rendered " + phase + "\n");
      expect(capture).toBeGreaterThan(previous);
      expect(upload).toBeGreaterThan(capture);
      const captureStep = ci.slice(capture, upload);
      expect(captureStep).toContain('PONTIVUS_ORDER_SIGNED_RENDERED_PHASE: "' + phase + '"');
      expect(captureStep).toContain("continue-on-error: true");
      expect(captureStep).toContain("exit-status.json");
      expect(captureStep).toContain(phase === "IA27_28" ?
        '--grep "rendered acceptance phase 1"' : '--grep "rendered acceptance IA26 captures downstream Workbench"');
      const uploadStep = ci.slice(upload, ci.indexOf("\n      - name:", upload));
      expect(uploadStep).toContain("!cancelled()");
      expect(uploadStep).toContain("continue-on-error: true");
      expect(uploadStep).toContain("rendered-signed-" + phase.toLowerCase());
      previous = upload;
    }
    expect(previous).toBeLessThan(ci.indexOf("name: Validate current-state diagnostic completeness"));
    expect(ci.indexOf("name: Upload bounded IA27/IA28 evidence"))
      .toBeLessThan(ci.indexOf("name: Validate current-state diagnostic completeness"));
    expect(ci.indexOf("name: Require all independently published signed phase evidence"))
      .toBeGreaterThan(ci.indexOf("name: Upload rendered acceptance IA26"));
    expect(ci).not.toContain("PONTIVUS_ORDER_HUX_PRIORITY_ONLY");
    const browser = read("tests/browser.spec.ts");
    expect(browser).toContain("signedRenderedPhases.find");
    expect(browser).toContain('signedRenderedPhase !== null ? signedRenderedPhase === phase');
    expect(browser).toContain("validateSignedPhaseEvidence(entries)");
    expect(browser).toContain("exact phase SURF coverage");
    expect(browser).toContain("exact phase capture identities");
    expect(browser).toContain("exact native Acceptance state coverage");
    expect(browser).toContain("validateNativeAcceptanceEvidence(allEntries, true)");
    expect(ci).toContain("diagnostic surface coverage must be 38");
    expect(browser).toContain('type ReferenceViewportClass = "wide" | "medium" | "narrow"');
    expect(browser).toContain('viewport.width >= 1280 ? "wide" : viewport.width >= 800 ? "medium" : "narrow"');
    expect(browser).toContain("const mediumComparisonSources");
    expect(browser).toContain("validateSurfaceViewportCoverage(entries, owned)");
    expect(browser).toContain("validateSurfaceViewportCoverage(allEntries, requiredSurfaces)");
    expect(browser).toContain("narrowComparisonId(entry.id)");
    expect(browser).toContain("Object.values(signedPhaseOwnedSurfaces).flat().sort()");
    expect(browser).toContain("stateCaptureScopes");
    expect(browser).toContain("matching toolbar reference");
    expect(browser).toContain("surface + \" same-scope comparison\"");
    expect(browser).toContain("surface + \" medium reference PNG\"");
    expect(browser).toContain("await referencePage.setViewportSize(entry.viewport)");
    const context = read("ui/src/WorkItemContext.tsx");
    expect(context).toContain("resolveContextArtifact(workItem.id,artifactId");
    expect(context).not.toContain("artifact.repositoryPath===selectedDocumentPath");
    expect(browser).not.toContain("huxPriorityCaptureIds");
    expect(
      [...ci.matchAll(/^\s*uses:\s*(\S+)\s*$/gm)].map((match) => match[1]),
    ).toEqual(Array.from({ length: signedPhases.length + 3 },
      () => "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02"));

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
      installer: read("tests/installer.test.ts"),
      daemon: read("tests/daemon.test.ts"),
      opencode: read("tests/opencode.test.ts"),
      migration: read("tests/order-migration.test.ts"),
      browser: read("tests/browser.spec.ts"),
    };

    for (const required of [
      "retains current incomplete v4 exactly during installer update without prompting",
      "supports valid incomplete v4 configuration and expected-hash replacement",
    ]) {
      expect(suites.shell).toContain(required);
    }

    for (const required of [
      "fresh success completes provider, model and repository choices before returning zero",
      "fresh provider failure cannot persist deferred Settings configuration",
      "fresh provider cancellation returns 130 without persisting deferred configuration",
    ]) {
      expect(suites.installer).toContain(required);
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
