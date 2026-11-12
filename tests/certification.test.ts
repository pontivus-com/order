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
  it("keeps the exact locked package and runtime pins with no convenience dependency expansion", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.dependencies).toEqual({
      "@astryxdesign/core": "0.7.13",
      "@astryxdesign/theme-neutral": "0.7.13",
      "@opencode/client": "2.2.6",
      "@stylexjs/stylex": "0.19.1",
      "@tanstack/react-query": "5.105.0",
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
    expect(read("README.md")).toContain("immediately preceding supported Gateweft beta");
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
      "WorkbenchIcon.tsx",
      "WorkbenchLayout.tsx",
      "WorkbenchResourceRow.tsx",
      "WorkbenchState.tsx",
      "WorkbenchToolbar.tsx",
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
    expect(layout).toContain('"(min-width: 1200px)"');
    expect(layout).toContain("<Drawer");
    expect(layout).not.toContain("inspector-fallback");

    const theme = read("ui/src/theme.css");
    expect(theme).toContain("--order-workbench-bg");
    expect(theme).not.toContain("--pontivus-plugin-panel-inspector-width-standard: 26.25rem");
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
      read("ui/src/StageDialogue.tsx"),
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

  it("keeps source-backed v2 as the only productive persistence and transport path", () => {
    const contracts = read("src/core/contracts.ts");
    const sqlite = read("src/shell/sqlite.ts");
    const server = read("src/daemon/server.ts");
    const sourceDaemon = read("src/daemon/work-item-source.ts");
    const sourceCore = read("src/core/work-item-source.ts");
    const lifecycle = read("src/core/lifecycle.ts");

    expect(contracts).toMatch(/OrderConfigSchema = z\.strictObject\(\{\s*version: z\.literal\(2\)/);
    expect(sqlite).toContain("PRAGMA user_version = 2");
    expect(sqlite).toContain("CREATE TABLE workItemSources");
    expect(sqlite).toContain("sourceSha256 TEXT NOT NULL");
    expect(sqlite).not.toContain("ALTER TABLE");
    expect(sqlite).not.toContain("PRAGMA user_version = 1");

    expect(server).toContain("CreateWorkItemSourceSchema.parse");
    expect(server).toContain("ExpectedHashMarkdownWriteSchema.parse");
    expect(server).not.toContain('requireString(body, "repositoryRoot")');
    expect(server).not.toContain('requireString(body, "origin")');

    expect(sourceDaemon).toContain("classifyExistingWorkItemSource");
    expect(sourceDaemon).toContain("linkedRemediationIsAllowed");
    expect(sourceDaemon).not.toContain('includes("concern")');
    expect(sourceDaemon).not.toContain('startsWith("UNSUPPORTED_SCHEMA');
    expect(sourceCore).toContain("isUnsupportedWorkItemSchemaFailure");
    expect(lifecycle).not.toContain("work-item-source");
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
      "one command",
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
