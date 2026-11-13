import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  OpenCodeAccountLoginAttemptSchema,
  OpenCodeAccountStateSchema,
  RunEventSchema,
  RunSchema,
  WorkItemSchema,
  WorkItemSourceSnapshotSchema,
} from "../src/core/contracts.ts";
import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:17347";
const stateRoot = process.env.PONTIVUS_ORDER_TEST_STATE_ROOT;
if (stateRoot === undefined || stateRoot.length === 0) {
  throw new TypeError("PONTIVUS_ORDER_TEST_STATE_ROOT is required");
}
const daemonToken = readFileSync(join(stateRoot, "daemon-token"), "utf8").trim();
const repositoryRoot = stateRoot + "-e2e-project";

const mintConnectToken = async (
  request: APIRequestContext,
): Promise<string> => {
  const response = await request.post("/api/auth/connect-token", {
    headers: { authorization: "Bearer " + daemonToken },
    data: {},
  });
  expect(response.status()).toBe(200);
  const body = await response.json() as { token?: unknown };
  expect(typeof body.token).toBe("string");
  return String(body.token);
};

const authenticate = async (
  page: Page,
  request: APIRequestContext,
): Promise<void> => {
  const token = await mintConnectToken(request);
  await page.goto("/connect?token=" + token);
  await expect(page).toHaveURL(baseURL + "/");
  await expect(page.getByText("Order", { exact: true })).toBeVisible();
};

const rowFor = (page: Page, title: string) =>
  page
    .locator('[data-testid^="work-item-row-"]')
    .filter({ hasText: title })
    .first();

const openWorkItem = async (page: Page, title: string): Promise<void> => {
  const row = rowFor(page, title);
  await expect(row).toBeVisible();
  await row.click();
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();
  await expect(page.getByTestId("work-item-heading")).toHaveText(title);
};

const backToQueue = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Back to work queue" }).click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
};

const markdownSourceValue = async (editor: Locator): Promise<string> =>
  editor.evaluate((node) =>
    Array.from(node.querySelectorAll(".cm-line"))
      .map((line) => line.textContent ?? "")
      .join("\n"));

const replaceMarkdownSource = async (
  page: Page,
  editor: Locator,
  markdown: string,
): Promise<void> => {
  await editor.click();
  await editor.press("Control+A");
  await page.keyboard.insertText(markdown);
  await expect.poll(() => markdownSourceValue(editor)).toBe(markdown);
};

const workItemForTitle = async (
  page: Page,
  title: string,
) => {
  const response = await page.context().request.get("/api/work-items");
  expect(response.status()).toBe(200);
  const workItems = WorkItemSchema.array().parse(await response.json());
  const workItem = workItems.find((candidate) => candidate.title === title);
  expect(workItem).toBeDefined();
  return workItem!;
};

test("browser bootstrap is local, one-time, exact-cookie, origin-bound, and expiry-aware", async ({
  page,
  request,
}) => {
  const unauthenticated = await request.get("/api/work-items");
  expect(unauthenticated.status()).toBe(401);

  const headerToken = await mintConnectToken(request);
  const connect = await request.get("/connect?token=" + headerToken, {
    maxRedirects: 0,
  });
  expect(connect.status()).toBe(303);
  expect(connect.headers()["location"]).toBe("/");
  expect(connect.headers()["cache-control"]).toBe("no-store");
  expect(connect.headers()["referrer-policy"]).toBe("no-referrer");
  expect(connect.headers()["set-cookie"]).toMatch(
    /^pontivus_order_session=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Strict$/,
  );
  const reused = await request.get("/connect?token=" + headerToken, {
    maxRedirects: 0,
  });
  expect(reused.status()).toBe(401);

  await authenticate(page, request);
  const cookies = await page.context().cookies();
  const session = cookies.find((cookie) => cookie.name === "pontivus_order_session");
  expect(session).toMatchObject({
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    path: "/",
  });

  const missingOrigin = await page.context().request.post("/api/tick", {
    data: {},
  });
  expect(missingOrigin.status()).toBe(403);
  const wrongOrigin = await page.context().request.post("/api/tick", {
    headers: { origin: "http://127.0.0.1:1" },
    data: {},
  });
  expect(wrongOrigin.status()).toBe(403);

  test.setTimeout(90_000);
  const expiringToken = await mintConnectToken(request);
  await new Promise((resolve) => setTimeout(resolve, 61_000));
  const expired = await request.get("/connect?token=" + expiringToken, {
    maxRedirects: 0,
  });
  expect(expired.status()).toBe(401);
});

test("appearance uses a direct compact mode switcher, follows system mode, and persists explicit overrides", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await authenticate(page, request);

  const root = page.locator("html");
  const layout = page.getByTestId("workbench-layout");
  const system = page.getByRole("radio", { name: "System" });
  const light = page.getByRole("radio", { name: "Light" });
  const dark = page.getByRole("radio", { name: "Dark" });

  await expect(page.locator(".order-theme-control select")).toHaveCount(0);
  await expect(system).toBeChecked();
  await expect(root).not.toHaveAttribute("data-theme");
  await expect(root).toHaveAttribute("data-astryx-theme");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(page.getByTestId("workbench-search")).toHaveCSS(
    "background-color",
    "rgb(17, 26, 41)",
  );

  await light.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Light" })).toBeChecked();

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();

  await page.getByRole("radio", { name: "System" }).click();
  await expect(root).not.toHaveAttribute("data-theme");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await page.reload();
  await expect(page.getByRole("radio", { name: "System" })).toBeChecked();
});

test("Settings uses stable native-history destinations and daemon-owned readiness", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  const settings = page.getByTestId("settings-workspace");
  await expect(settings).toBeVisible();
  await expect(page.getByTestId("settings-repositories")).toBeVisible();
  await expect(settings).toContainText("WorkItem documents");

  await settings.getByRole("button", { name: "Model & runtime" }).click();
  await expect(page).toHaveURL(baseURL + "/settings/model");
  await expect(page.getByTestId("settings-model")).toBeVisible();

  await settings.getByRole("button", { name: "OpenCode" }).click();
  await expect(page).toHaveURL(baseURL + "/settings/opencode");
  await expect(page.getByTestId("settings-opencode")).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(baseURL + "/settings/model");
  await page.goBack();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  await page.goBack();
  await expect(page).toHaveURL(baseURL + "/");
  await expect(page.getByTestId("work-item-queue")).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  await expect(page.getByTestId("settings-workspace")).toBeVisible();
});

test("global OpenCode account utility switches, renames, signs in, blocks during active Runs, and remains responsive", async ({
  page,
  request,
}) => {
  const loginAttemptId = "00000000-0000-4000-8000-000000000001";
  let pollCount = 0;
  let state = OpenCodeAccountStateSchema.parse({
    accounts: [
      {
        id: "cred_alpha",
        label: "alpha@example.com",
        active: true,
        status: { status: "READY" },
      },
      {
        id: "cred_beta",
        label: "beta@example.com",
        active: false,
        status: { status: "READY" },
      },
      {
        id: "cred_gamma",
        label: "gamma@example.com",
        active: false,
        status: {
          status: "NEEDS_AUTH",
          message: "Reconnect account",
          url: "https://opencode.ai/console/reconnect",
        },
      },
    ],
    activeAccountId: "cred_alpha",
    mutationBlockers: [],
  });

  await page.route("**/api/opencode/accounts**", async (route) => {
    const requestForRoute = route.request();
    const url = new URL(requestForRoute.url());
    const path = url.pathname;
    const method = requestForRoute.method();

    const fulfillJson = async (value: unknown, status = 200): Promise<void> => {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(value),
      });
    };

    if (path === "/api/opencode/accounts" && method === "GET") {
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/cred_beta/activate" && method === "POST") {
      const body = requestForRoute.postDataJSON() as { expectedActiveAccountId?: unknown };
      expect(body.expectedActiveAccountId).toBe("cred_alpha");
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts.map((account) => ({
          ...account,
          active: account.id === "cred_beta",
        })),
        activeAccountId: "cred_beta",
      });
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/cred_beta" && method === "PATCH") {
      const body = requestForRoute.postDataJSON() as { label?: unknown };
      expect(body.label).toBe("beta+renamed@example.com");
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === "cred_beta"
            ? { ...account, label: "beta+renamed@example.com" }
            : account),
      });
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/cred_gamma" && method === "DELETE") {
      const body = requestForRoute.postDataJSON() as { expectedActiveAccountId?: unknown };
      expect(body.expectedActiveAccountId).toBe("cred_beta");
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts.filter((account) => account.id !== "cred_gamma"),
      });
      await fulfillJson(state);
      return;
    }

    if (path === "/api/opencode/accounts/login" && method === "POST") {
      const body = requestForRoute.postDataJSON() as { label?: unknown };
      expect(body.label).toBe("delta@example.com");
      await fulfillJson(OpenCodeAccountLoginAttemptSchema.parse({
        id: loginAttemptId,
        authorizationUrl: "https://opencode.ai/console/device",
        instructions: "Open the verification page and continue.",
        expiresAt: "2026-11-13T04:00:00.000Z",
        status: "PENDING",
        message: null,
      }), 201);
      return;
    }

    if (path === `/api/opencode/accounts/login/${loginAttemptId}` && method === "GET") {
      pollCount += 1;
      if (pollCount < 2) {
        await fulfillJson(OpenCodeAccountLoginAttemptSchema.parse({
          id: loginAttemptId,
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-13T04:00:00.000Z",
          status: "PENDING",
          message: null,
        }));
        return;
      }
      state = OpenCodeAccountStateSchema.parse({
        accounts: [
          ...state.accounts.map((account) => ({ ...account, active: false })),
          {
            id: "cred_delta",
            label: "delta@example.com",
            active: true,
            status: { status: "READY" },
          },
        ],
        activeAccountId: "cred_delta",
        mutationBlockers: [],
      });
      await fulfillJson(OpenCodeAccountLoginAttemptSchema.parse({
        id: loginAttemptId,
        authorizationUrl: "https://opencode.ai/console/device",
        instructions: "Open the verification page and continue.",
        expiresAt: "2026-11-13T04:00:00.000Z",
        status: "COMPLETED",
        message: null,
      }));
      return;
    }

    if (path === `/api/opencode/accounts/login/${loginAttemptId}` && method === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fallback();
  });

  await authenticate(page, request);
  const trigger = page.getByTestId("opencode-account-trigger");
  await expect(trigger).toContainText("alpha@example.com");
  await trigger.click();
  await expect(page).toHaveURL(baseURL + "/settings/opencode");

  const panel = page.getByTestId("settings-opencode");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("opencode-account-list")).toContainText("alpha@example.com");
  await expect(panel.getByTestId("opencode-account-list")).toContainText("beta@example.com");
  await expect(panel.getByTestId("opencode-account-list")).toContainText("gamma@example.com");
  await expect(panel).toContainText("Needs sign-in");
  await expect(panel).not.toContainText("cred_alpha");

  await panel.getByRole("button", { name: "Switch to beta@example.com" }).click();
  await expect(trigger).toContainText("beta@example.com");

  await panel.getByRole("button", { name: "Rename beta@example.com" }).click();
  await panel.getByLabel("Account label").fill("beta+renamed@example.com");
  await panel.getByRole("button", { name: "Save account label" }).click();
  await expect(panel).toContainText("beta+renamed@example.com");
  await expect(trigger).toContainText("beta+renamed@example.com");

  await panel.getByRole("button", { name: "Remove gamma@example.com" }).click();
  const removeDialog = page.getByRole("alertdialog");
  await expect(removeDialog).toContainText("Remove gamma@example.com");
  await removeDialog.getByRole("button", { name: "Remove account" }).click();
  await expect(panel).not.toContainText("gamma@example.com");

  await panel.getByRole("button", { name: "Add account" }).click();
  await panel.getByLabel("Account label").fill("delta@example.com");
  await panel.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();

  const attempt = panel.getByTestId("opencode-login-attempt");
  const external = attempt.getByRole("link", { name: "Open OpenCode sign-in" });
  await expect(external).toHaveAttribute("href", "https://opencode.ai/console/device");
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(attempt).toContainText("Waiting for OpenCode sign-in");
  await expect(attempt).toContainText("OpenCode sign-in complete.");
  await attempt.getByRole("button", { name: "Done" }).click();
  await expect(trigger).toContainText("delta@example.com");

  state = OpenCodeAccountStateSchema.parse({
    ...state,
    mutationBlockers: ["ACTIVE_RUN"],
  });
  await page.reload();
  await expect(trigger).toBeVisible();
  await expect(page.getByTestId("settings-opencode"))
    .toContainText("Finish or cancel active agent work before changing the OpenCode account.");
  await expect(page.getByRole("button", { name: "Add account" })).toBeDisabled();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("workbench-utilities")).toBeVisible();
  await expect(trigger).toBeVisible();
  await expect(page.getByTestId("settings-workspace")).toBeVisible();
});


test("CodeMirror editor preserves exact source, formats Markdown, previews one buffer, and follows the Order theme", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");
  await page.getByRole("radio", { name: "Documents" }).click();
  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();

  const editor = page.getByLabel("PLAN lifecycle document Markdown source");
  await expect(editor).toBeVisible();
  await expect(page.getByTestId("markdown-format-toolbar")).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  const initial = await markdownSourceValue(editor);
  const unsaved = initial + "\n# Preview continuity\n";
  await replaceMarkdownSource(page, editor, unsaved);
  await expect(page.getByText("Unsaved", { exact: true })).toBeVisible();

  await page.getByRole("radio", { name: "Preview" }).click();
  await expect(page.getByTestId("markdown-preview")).toContainText("Preview continuity");
  await page.getByRole("radio", { name: "Edit" }).click();
  const editAgain = page.getByLabel("PLAN lifecycle document Markdown source");
  await expect.poll(() => markdownSourceValue(editAgain)).toBe(unsaved);

  await page.getByRole("radio", { name: "Split" }).click();
  const splitEditor = page.getByLabel("PLAN lifecycle document Markdown source");
  await expect(splitEditor).toBeVisible();
  await expect(page.getByTestId("markdown-preview")).toContainText("Preview continuity");

  const formattingCases = [
    ["Heading 1", "alpha", "# alpha"],
    ["Heading 2", "alpha", "## alpha"],
    ["Heading 3", "alpha", "### alpha"],
    ["Bold", "alpha", "**alpha**"],
    ["Italic", "alpha", "*alpha*"],
    ["Inline code", "alpha", "`alpha`"],
    ["Blockquote", "alpha", "> alpha"],
    ["Bulleted list", "alpha\nbeta", "- alpha\n- beta"],
    ["Numbered list", "alpha\nbeta", "1. alpha\n2. beta"],
    ["Link", "alpha", "[alpha](url)"],
    ["Fenced code block", "alpha", "```\nalpha\n```"],
    ["Horizontal rule", "alpha", "alpha\n---"],
  ] as const;

  await page.getByRole("radio", { name: "Edit" }).click();
  const formatEditor = page.getByLabel("PLAN lifecycle document Markdown source");
  for (const [label, source, expected] of formattingCases) {
    await replaceMarkdownSource(page, formatEditor, source);
    await formatEditor.press("Control+A");
    await page.getByRole("button", { name: label }).click();
    await expect.poll(() => markdownSourceValue(formatEditor)).toBe(expected);
  }

  await replaceMarkdownSource(page, formatEditor, "alpha");
  await formatEditor.press("Control+A");
  await page.getByRole("button", { name: "Bold" }).click();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("**alpha**");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("alpha");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("**alpha**");

  await replaceMarkdownSource(page, formatEditor, "- item");
  await formatEditor.press("End");
  await formatEditor.press("Enter");
  await formatEditor.type("next");
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("- item\n- next");

  await formatEditor.press("ControlOrMeta+f");
  await expect(page.locator(".cm-panel.cm-search")).toBeVisible();
  await formatEditor.press("Escape");

  await replaceMarkdownSource(page, formatEditor, "# Heading");
  const cm = page.locator(".order-markdown-source-editor .cm-editor");
  const gutter = page.locator(".order-markdown-source-editor .cm-gutters");
  const headingToken = page.locator(".order-markdown-source-editor .cm-content span")
    .filter({ hasText: "Heading" })
    .first();

  await page.getByRole("radio", { name: "Light" }).click();
  await expect(cm).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(gutter).toHaveCSS("background-color", "rgb(248, 250, 252)");
  await expect(headingToken).toHaveCSS("color", "rgb(30, 58, 138)");

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(cm).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(gutter).toHaveCSS("background-color", "rgb(23, 34, 51)");
  await expect(headingToken).toHaveCSS("color", "rgb(147, 180, 255)");

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(formatEditor).toBeVisible();
  await expect.poll(() => markdownSourceValue(formatEditor)).toBe("# Heading");
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
});

test("browser surfaces the canonical typed API failure message", async ({ page, request }) => {
  await authenticate(page, request);

  await page.route("**/api/work-items", async (route) => {
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        code: "CURRENT_STATE_CONFLICT",
        message: "Documentation changed; review the current state and retry.",
        sourceDiagnostic: null,
      }),
    });
  });
  await page.reload();

  await expect(page.getByText("Documentation changed; review the current state and retry."))
    .toBeVisible();
  await expect(page.getByText("Local browser session required")).toBeVisible();

  await page.unroute("**/api/work-items");
});

test("queue opens a primary workspace, keeps context compact, preserves URL history, responds with a Drawer, and creates real WorkItems", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const websocketUrls: string[] = [];
  const eventStreamUrls: string[] = [];
  page.on("websocket", (socket) => websocketUrls.push(socket.url()));
  page.on("request", (browserRequest) => {
    if ((browserRequest.headers()["accept"] ?? "").includes("text/event-stream")) {
      eventStreamUrls.push(browserRequest.url());
    }
  });

  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Discovered on startup")).toBeVisible();
  await expect(page.getByTestId("source-diagnostics")).toContainText("INVALID_SOURCE");
  await expect(page.getByTestId("source-diagnostics")).toContainText("work-request.md");
  await page.getByRole("button", { name: "Refresh sources" }).click();
  await expect(page.getByTestId("source-diagnostics")).toContainText("INVALID_SOURCE");

  const proposalRow = rowFor(page, "Proposal review");
  await proposalRow.getByRole("button", { name: "Copy work item id for Proposal review" }).click();
  await expect(page.getByTestId("work-item-workspace")).toHaveCount(0);

  await proposalRow.focus();
  await proposalRow.press("Enter");
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();
  await expect(page.getByTestId("work-item-heading")).toBeFocused();
  await expect(page).toHaveURL(/workItem=/);

  const context = page.getByTestId("work-item-context");
  await expect(context).toBeVisible();
  await expect(page.getByRole("button", { name: "Context" })).toHaveCount(0);
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(context.locator(
    '[data-testid="document-workspace"], [data-testid="activity-workspace"], [data-testid="review-workspace"], [data-testid="execution-workspace"], [data-testid="evidence-workspace"]',
  )).toHaveCount(0);

  await page.goBack();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await page.goForward();
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
  await expect(page.getByTestId("work-item-context-drawer").locator('[data-testid="activity-workspace"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("work-item-context-drawer")).toBeHidden();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();
  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1280, height: 720 });
  await backToQueue(page);
  await expect(proposalRow).toBeFocused();

  await page.getByRole("button", { name: "New work item" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  await expect(createDialog).toBeVisible();
  await createDialog.getByLabel("Project").selectOption("order-e2e");
  await createDialog.getByRole("radio", { name: "CHANGE" }).click();
  await createDialog.getByLabel("Title").fill("Created in browser");
  await createDialog.getByLabel("Concern IDs").click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await createDialog.getByRole("button", { name: "Create work item" }).click();

  await expect(page.getByTestId("work-item-heading")).toHaveText("Created in browser");
  await backToQueue(page);
  await expect(rowFor(page, "Created in browser")).toContainText("browser");

  expect(websocketUrls).toEqual([]);
  expect(eventStreamUrls).toEqual([]);
});


test("repository-native WorkItem management keeps project, Git, title, and archive state explicit", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await page.getByRole("button", { name: "New work item" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  await expect(createDialog).toBeVisible();
  await createDialog.getByLabel("Project").selectOption("order-e2e");
  await expect(createDialog.getByTestId("create-work-item-location"))
    .toContainText("docs/order/work-items");
  await createDialog.getByRole("radio", { name: "CHANGE" }).click();
  await createDialog.getByLabel("Title").fill("Repository-native management");
  await createDialog.getByLabel("Concern IDs").click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await createDialog.getByRole("button", { name: "Create work item" }).click();

  await expect(page.getByTestId("work-item-heading"))
    .toHaveText("Repository-native management");

  const documentState = page.getByTestId("document-git-state");
  await expect(documentState).toContainText("Saved to project, not Git");
  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const gitDialog = page.getByRole("alertdialog", {
    name: "Save WorkItem documentation to Git?",
  });
  await expect(gitDialog).toContainText("work-request.md");
  await gitDialog.getByRole("button", { name: "Save documentation to Git" }).click();
  await expect(documentState).toContainText("Saved to Git");

  await page.getByRole("button", { name: "Edit title" }).click();
  await page.getByLabel("Work item title").fill("Repository-native management renamed");
  await page.getByRole("button", { name: "Save title" }).click();
  await expect(page.getByTestId("work-item-heading"))
    .toHaveText("Repository-native management renamed");
  await expect(documentState).toContainText("Saved to project, not Git");

  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  await page.getByRole("alertdialog", {
    name: "Save WorkItem documentation to Git?",
  }).getByRole("button", { name: "Save documentation to Git" }).click();
  await expect(documentState).toContainText("Saved to Git");

  await page.getByRole("button", { name: "Archive work item" }).click();
  await page.getByRole("alertdialog", { name: "Archive work item?" })
    .getByRole("button", { name: "Archive work item" }).click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Repository-native management renamed")).toHaveCount(0);

  await page.getByRole("button", { name: "Show archived" }).click();
  const archivedRow = rowFor(page, "Repository-native management renamed");
  await expect(archivedRow).toContainText("Archived");
  await archivedRow.getByRole("button", {
    name: "Restore Repository-native management renamed",
  }).click();
  await expect(archivedRow).not.toContainText("Archived");
  await page.getByRole("button", { name: "Hide archived" }).click();
  await expect(rowFor(page, "Repository-native management renamed"))
    .toContainText("browser");
});
test("workbench geometry gives the active task the canvas and recomposes narrow queue rows", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);

  const loadingItem = await workItemForTitle(page, "Lifecycle editing workbench");
  await page.route(
    "**/api/work-items/" + loadingItem.id + "/source",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    },
  );
  await page.route(
    "**/api/work-items/" + loadingItem.id + "/lifecycle-artifacts",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    },
  );

  await openWorkItem(page, "Lifecycle editing workbench");
  await page.getByRole("radio", { name: "Documents" }).click();
  const loadingWorkspace = page.getByTestId("document-workspace");
  await expect(loadingWorkspace).toBeVisible();
  const loadingBox = await loadingWorkspace.boundingBox();
  expect(loadingBox).not.toBeNull();
  expect(loadingBox!.height).toBeGreaterThan(500);

  await expect(page.getByRole("button", { name: "Context" })).toHaveCount(0);
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await page.getByRole("radio", { name: "Documents" }).click();
  await expect(page.getByRole("tablist")).toHaveCount(1);
  await expect(page.getByTestId("document-state-strip")).toHaveCount(0);
  await expect(page.locator(".order-editor-actionbar")).toHaveCount(0);
  await expect(page.getByTestId("workflow-orientation")).toHaveCount(0);

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();

  const workspace = page.getByTestId("document-workspace");
  const editor = page.getByTestId("markdown-source-editor");
  const save = page.getByRole("button", { name: "Save", exact: true });
  await expect(workspace).toBeVisible();
  await expect(editor).toBeVisible();
  await expect(save).toBeVisible();

  const workspaceBox = await workspace.boundingBox();
  const editorBox = await editor.boundingBox();
  const saveBox = await save.boundingBox();
  expect(workspaceBox).not.toBeNull();
  expect(editorBox).not.toBeNull();
  expect(saveBox).not.toBeNull();
  expect(editorBox!.width).toBeGreaterThan(workspaceBox!.width * 0.88);
  expect(editorBox!.height).toBeGreaterThan(workspaceBox!.height * 0.5);
  expect(saveBox!.y + saveBox!.height).toBeLessThanOrEqual(900);

  await backToQueue(page);
  await page.setViewportSize({ width: 700, height: 800 });
  const item = await workItemForTitle(page, "Lifecycle editing workbench");
  const row = rowFor(page, "Lifecycle editing workbench");
  const mobileMeta = row.locator(".order-queue-mobile-meta");
  await expect(mobileMeta).toBeVisible();
  await expect(mobileMeta).toContainText(item.stage + " · " + item.status);

  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorkItem(page, "Verified candidate");
  const taskMaster = page.getByTestId("execution-task-master");
  const taskDetail = page.getByTestId("execution-task-detail");
  await expect(taskMaster).toBeVisible();
  await expect(taskDetail).toBeVisible();
  const masterBox = await taskMaster.boundingBox();
  const detailBox = await taskDetail.boundingBox();
  expect(masterBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(Math.abs(masterBox!.y - detailBox!.y)).toBeLessThan(80);
});

test("workflow progression inspects reached material, exposes unreached steps, preserves dirty admission, and never mutates lifecycle", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  const mutationRequests: string[] = [];
  page.on("request", (browserRequest) => {
    if (browserRequest.method() !== "GET") {
      mutationRequests.push(browserRequest.method() + " " + new URL(browserRequest.url()).pathname);
    }
  });

  const rail = page.getByTestId("workflow-progression");
  await rail.getByRole("button", { name: "Work request" }).click();
  await expect(page.getByRole("radio", { name: "Documents" })).toBeChecked();
  await expect(
    page.getByTestId("governed-document-nav").getByRole("tab", { name: "Source" }),
  ).toHaveAttribute("aria-selected", "true");

  await rail.getByRole("button", { name: "Implementation plan" }).click();
  await expect(
    page.getByTestId("governed-document-nav").getByRole("tab", { name: "PLAN" }),
  ).toHaveAttribute("aria-selected", "true");
  const planEditor = page.getByLabel("PLAN lifecycle document Markdown source");
  await expect(planEditor).toBeVisible();
  const initial = await markdownSourceValue(planEditor);
  await replaceMarkdownSource(page, planEditor, initial + "\nworkflow inspection guard\n");

  await rail.getByRole("button", { name: "Readiness review" }).click();
  const guard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(guard).toBeVisible();
  await guard.getByRole("button", { name: "Continue editing" }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("workflow inspection guard");

  await rail.getByRole("button", { name: "Approval" }).click();
  await expect(page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" })).toBeVisible();
  await page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" })
    .getByRole("button", { name: "Discard unsaved changes" })
    .click();
  await expect(page.getByText("Approval has not been reached", { exact: true })).toBeVisible();

  expect(mutationRequests).toEqual([]);
});

test("Activity keeps all Run history, consolidated workflow orientation, responsive master-detail, and secondary technical details", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  const workflowRail = page.getByTestId("workflow-progression");
  await expect(workflowRail.getByRole("button", { name: "Implementation plan" }))
    .toHaveAttribute("aria-current", "step");
  await expect(workflowRail.getByRole("button", { name: "Implementation plan" }))
    .toHaveAttribute("title", "Define exactly how the change will be made");
  await expect(page.getByTestId("activity-workspace")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Activity" })).toBeChecked();

  const master = page.getByTestId("activity-run-master");
  const detail = page.getByTestId("activity-detail");
  const masterBox = await master.boundingBox();
  const detailBox = await detail.boundingBox();
  expect(masterBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(masterBox!.width).toBeGreaterThanOrEqual(14 * 16 - 4);
  expect(masterBox!.width).toBeLessThanOrEqual(18 * 16 + 4);
  expect(detailBox!.width).toBeGreaterThan(640);

  await expect(detail.getByText("Continue current work", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Message input")).toBeVisible();
  await expect(page.getByText("ARTIFACT_PROPOSAL_CREATED", { exact: true })).toBeHidden();
  const proposalTechnical = detail
    .locator('li[data-event-tag="ARTIFACT_PROPOSAL_CREATED"]')
    .getByText("Technical details", { exact: true });
  await proposalTechnical.click();
  await expect(detail.getByText("ARTIFACT_PROPOSAL_CREATED", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await expect(page.getByTestId("activity-detail")).toBeVisible();
  const mediumDetail = await page.getByTestId("activity-detail").boundingBox();
  expect(mediumDetail).not.toBeNull();
  expect(mediumDetail!.width).toBeGreaterThan(640);

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("activity-detail")).toBeVisible();
  await expect(page.getByTestId("activity-run-master")).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toBeVisible();

  await backToQueue(page);
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Activity" })).toBeVisible();
  await page.getByRole("radio", { name: "Activity" }).click();
  await expect(page.getByTestId("activity-workspace")).toBeVisible();
  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Workflow step completed", { exact: true })).toBeVisible();
});

test("persisted proposal disposition is caught by polling and sign-off review remains explicit", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  await expect(page.getByTestId("activity-workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: "Review proposed document change" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  await expect(page.getByLabel("Message input")).toBeVisible();

  await page.getByRole("button", { name: "Review proposed document change" }).click();
  const proposalReview = page.getByTestId("proposal-review-workspace");
  const proposalDiff = page.getByTestId("proposal-review-diff");
  await expect(proposalReview).toBeVisible();
  await expect(proposalDiff).toBeVisible();
  const proposalReviewBox = await proposalReview.boundingBox();
  const proposalDiffBox = await proposalDiff.boundingBox();
  expect(proposalReviewBox).not.toBeNull();
  expect(proposalDiffBox).not.toBeNull();
  expect(proposalDiffBox!.width).toBeGreaterThan(proposalReviewBox!.width * 0.85);
  await expect(page.getByRole("button", { name: "Adopt" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reject" })).toBeVisible();

  const contextRequest = page.context().request;
  const workItemsResponse = await contextRequest.get("/api/work-items");
  const workItems = WorkItemSchema.array().parse(await workItemsResponse.json());
  const proposalItem = workItems.find((item) => item.title === "Proposal review");
  expect(proposalItem).toBeDefined();

  const runsResponse = await contextRequest.get(
    "/api/work-items/" + proposalItem!.id + "/runs",
  );
  const runs = RunSchema.array().parse(await runsResponse.json());
  const proposalRun = runs.find((run) => run.role === "STAGE" && run.status === "RUNNING");
  expect(proposalRun).toBeDefined();

  const eventsResponse = await contextRequest.get(
    "/api/runs/" + proposalRun!.id + "/events?afterSequence=0",
  );
  const events = RunEventSchema.array().parse(await eventsResponse.json());
  const proposal = events.find((event) =>
    event.event.tag === "ARTIFACT_PROPOSAL_CREATED");
  expect(proposal).toBeDefined();

  const rejected = await contextRequest.post(
    "/api/run-events/" + proposal!.id + "/reject",
    {
      headers: { origin: baseURL },
      data: {},
    },
  );
  expect(rejected.status()).toBe(200);
  await expect(page.getByText("Rejected", { exact: true }).first()).toBeVisible({
    timeout: 5_000,
  });

  await backToQueue(page);
  await openWorkItem(page, "Awaiting sign-off");
  await expect(page.getByTestId("review-workspace")).toBeVisible();
  await expect(page.getByTestId("signoff-package-hash")).toHaveText(
    /^sha256:[0-9a-f]{64}$/,
  );
  await expect(page.getByTestId("review-documents")).toContainText("PLAN");
  await expect(page.getByTestId("review-documents")).toContainText("R3");
  await expect(page.getByText("Signed tasks", { exact: true })).toBeVisible();
  await expect(page.locator(".order-signed-task-list").getByText("T1", { exact: true })).toBeVisible();
  await expect(page.locator(".order-signed-task-list").getByText("Prove the browser candidate surface", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Approved by")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toBeVisible();
});

test("source editor preserves stale buffers, never overwrites newer source, and returns work visibly to R1", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Source editing workbench");
  await page.getByRole("radio", { name: "Documents" }).click();

  await expect(page.getByRole("button", { name: "Sign off exact package" })).toBeVisible();
  const sourceEditor = page.getByLabel("WorkItem source Markdown source");
  await expect(sourceEditor).toBeVisible();
  const original = await markdownSourceValue(sourceEditor);
  expect(original).toContain("# Source editing workbench");
  expect(original).not.toContain('"formatVersion"');
  const technicalSource = page.getByText("Technical details", { exact: true }).first();
  await expect(technicalSource).toBeVisible();
  await technicalSource.click();
  await expect(page.locator(".order-source-authoring .order-source-technical pre"))
    .toContainText('"formatVersion": 1');
  await technicalSource.click();

  await replaceMarkdownSource(page, sourceEditor, original + "\nlocal unsaved buffer\n");
  const item = await workItemForTitle(page, "Source editing workbench");
  const sourceResponse = await page.context().request.get(
    "/api/work-items/" + item.id + "/source",
  );
  expect(sourceResponse.status()).toBe(200);
  const source = WorkItemSourceSnapshotSchema.parse(await sourceResponse.json());
  const sourcePath = join(repositoryRoot, source.path);
  const external = readFileSync(sourcePath, "utf8").replace(
    "# Source editing workbench",
    "# Source editing externally changed",
  );
  writeFileSync(sourcePath, external);

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/canonical file changed while this buffer was open/i)).toBeVisible();
  expect(await markdownSourceValue(sourceEditor)).toContain("local unsaved buffer");
  expect(readFileSync(sourcePath, "utf8")).toBe(external);

  await page.getByRole("button", { name: "Reload current" }).click();
  await expect.poll(() => markdownSourceValue(sourceEditor)).toContain("# Source editing externally changed");
  const current = await markdownSourceValue(sourceEditor);

  await replaceMarkdownSource(page, sourceEditor, current + "\nwill be cancelled\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(sourceEditor)).toBe(current);

  await replaceMarkdownSource(page, sourceEditor, current + "\nsaved through browser workbench\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => markdownSourceValue(sourceEditor)).toContain("saved through browser workbench");
  await expect.poll(() => readFileSync(sourcePath, "utf8")).toContain(
    "saved through browser workbench",
  );

  await expect(page.getByTestId("work-item-context").getByText("Research", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("PLAN lifecycle document Markdown source")).toHaveCount(0);
});

test("dirty Markdown navigation is explicit, preserves the buffer when cancelled, restores queue focus when discarded, and PLAN/R3 editing remains correct", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");
  await page.getByRole("radio", { name: "Documents" }).click();

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();
  const planEditor = page.getByLabel("PLAN lifecycle document Markdown source");
  await expect(planEditor).toBeVisible();
  const initial = await markdownSourceValue(planEditor);
  await replaceMarkdownSource(page, planEditor, initial + "\nunsaved guard\n");

  await page.getByRole("button", { name: "Back to work queue" }).click();
  const guard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(guard).toBeVisible();
  await guard.getByRole("button", { name: "Continue editing" }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("unsaved guard");

  await page.getByRole("button", { name: "Back to work queue" }).click();
  await page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" })
    .getByRole("button", { name: "Discard unsaved changes" })
    .click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Lifecycle editing workbench")).toBeFocused();

  await openWorkItem(page, "Lifecycle editing workbench");
  await page.getByRole("radio", { name: "Documents" }).click();
  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "R3" })
    .click();
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("R3 lifecycle document Markdown source")).toHaveCount(0);

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();
  const editablePlan = page.getByLabel("PLAN lifecycle document Markdown source");
  const fresh = await markdownSourceValue(editablePlan);
  await replaceMarkdownSource(page, editablePlan, fresh + "\ncancelled plan edit\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(editablePlan)).toBe(fresh);

  await replaceMarkdownSource(page, editablePlan, fresh + "\nsaved plan edit\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => markdownSourceValue(editablePlan)).toContain("saved plan edit");
  await expect(page.getByTestId("work-item-context").getByText("Implementation plan", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("invalid lifecycle Markdown stays inspection-only and exact bytes open in the Evidence workspace", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Invalid lifecycle Markdown");

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "R1" })
    .click();
  await expect(
    page.getByText("Lifecycle document is not canonical editable Markdown", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("R1 lifecycle document Markdown source")).toHaveCount(0);

  await page.getByRole("button", { name: "Inspect exact bytes" }).click();
  await expect(page.getByTestId("evidence-workspace")).toBeVisible();
  await expect(page.getByTestId("raw-content-view")).toContainText("invalid lifecycle");
});

test("terminal investigation and audit results remain closed and linked remediation offers only CHANGE or DEFECT", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Completed audit");
  await expect(page.getByTestId("result-workspace")).toContainText("AUDIT_COMPLETE");
  await expect(page.getByTestId("result-material")).toContainText(
    "Evidence-backed audit verdict.",
  );
  await expect(page.getByRole("button", { name: "Create linked remediation" })).toBeVisible();
  await backToQueue(page);

  const parent = await workItemForTitle(page, "Completed investigation");
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toContainText("INVESTIGATION_COMPLETE");
  await expect(page.getByTestId("result-material")).toContainText(
    "Evidence-backed conclusion.",
  );
  await page.getByRole("radio", { name: "Documents" }).click();
  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "R1" })
    .click();
  await expect(page.getByTestId("markdown-readonly")).toContainText(
    "Evidence-backed conclusion.",
  );

  await page.getByRole("button", { name: "Create linked remediation" }).click();
  const dialog = page.getByRole("dialog", { name: "Create linked remediation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "CHANGE" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "DEFECT" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "INVESTIGATION" })).toHaveCount(0);
  await expect(dialog.getByRole("radio", { name: "AUDIT" })).toHaveCount(0);

  await dialog.getByRole("radio", { name: "DEFECT" }).click();
  await dialog.getByLabel("Title").fill("Remediate investigation finding");
  await dialog.getByRole("button", { name: "Create linked remediation" }).click();

  await expect(page.getByTestId("work-item-heading")).toHaveText("Remediate investigation finding");
  const child = await workItemForTitle(page, "Remediate investigation finding");
  expect(child.schemaId).toBe("defect-v1");
  expect(child.projectId).toBe(parent.projectId);
  expect(child.derivedFromWorkItemId).toBe(parent.id);

  const refreshedParent = await workItemForTitle(page, "Completed investigation");
  expect(refreshedParent.stage).toBe("COMPLETE");
  expect(refreshedParent.outcome).toBe("INVESTIGATION_COMPLETE");
});

test("all non-delivery terminal classifications route to Result without invented remediation", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  for (const [title, outcome] of [
    ["Disproven work", "DISPROVEN"],
    ["Duplicate work", "DUPLICATE"],
    ["Already satisfied work", "ALREADY_SATISFIED"],
  ] as const) {
    await openWorkItem(page, title);
    await expect(page.getByTestId("result-workspace")).toContainText(outcome);
    await expect(page.getByRole("button", { name: "Create linked remediation" })).toHaveCount(0);
    await backToQueue(page);
  }
});

test("candidate surface exposes task, V0-V7, exact evidence bytes, and never executes evidence markup", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Verified candidate");

  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await page.getByRole("button", { name: /Independent review · Attempt 1/ }).click();
  await expect(page.getByText("Verified candidate recorded", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("execution-task-detail").getByText("T1", { exact: true })).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  for (const stage of ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"]) {
    await expect(page.getByText(stage + " passed.", { exact: true }).first()).toBeVisible();
  }

  await page.getByRole("button", { name: "Evidence: review.txt" }).first().click();
  await expect(page.getByTestId("evidence-workspace")).toBeVisible();
  const raw = page.getByTestId("raw-content-view");
  await expect(raw).toContainText(
    "<script>window.__orderXss=true</script>",
  );
  expect(
    await page.evaluate(() =>
      Object.prototype.hasOwnProperty.call(window, "__orderXss")),
  ).toBe(false);
});
