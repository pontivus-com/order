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
const fixtureControlURL = "http://127.0.0.1:17348";

const fixtureMutation = async (
  request: APIRequestContext,
  action: "/start-stage" | "/submit-input" | "/tick",
  data: Record<string, unknown>,
): Promise<unknown> => {
  const response = await request.post(fixtureControlURL + action, { data });
  expect(response.ok()).toBe(true);
  return response.json();
};

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
    .filter({ has: page.getByText(title, { exact: true }) })
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

const selectWorkflowStep = async (
  page: Page,
  name:
    | "Work request"
    | "Research"
    | "Requirements"
    | "Solution design"
    | "Implementation plan"
    | "Readiness review"
    | "Approval"
    | "Implementation"
    | "Complete",
): Promise<void> => {
  const button = page
    .getByTestId("workflow-progression")
    .getByRole("button", { name, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
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
  const finalLine = markdown.split("\n").at(-1) ?? "";
  await expect(editor.locator(".cm-line").last()).toHaveText(finalLine);
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
  const repositories = page.getByTestId("settings-repositories");
  await expect(repositories).toBeVisible();
  await expect(settings).toContainText("WorkItem documents");
  await expect(repositories.getByTestId("add-repository-form")).toHaveCount(0);
  await repositories.getByRole("button", { name: "Add repository" }).click();
  await expect(repositories.getByTestId("add-repository-form")).toBeVisible();
  await expect(repositories.getByText("Order does not create or initialize repositories here.")).toBeVisible();
  await repositories.getByRole("button", { name: "Cancel add repository" }).click();
  await expect(repositories.getByTestId("add-repository-form")).toHaveCount(0);

  const repositoryCard = repositories.locator(".order-settings-card").first();
  await expect(repositoryCard).toContainText(repositoryRoot);
  await repositoryCard.getByRole("button", { name: "Disconnect repository" }).click();
  const disconnectDialog = page.getByRole("alertdialog", { name: "Disconnect repository?" });
  await expect(disconnectDialog).toContainText(repositoryRoot);
  await expect(disconnectDialog).toContainText("Repository files, WorkItem Markdown, Git history, and authority documents are not deleted.");
  await disconnectDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(repositoryCard).toBeVisible();

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

    const removeMatch = /^\/api\/opencode\/accounts\/([^/]+)$/.exec(path);
    if (removeMatch !== null && method === "DELETE") {
      const body = requestForRoute.postDataJSON() as { expectedActiveAccountId?: unknown };
      expect(body.expectedActiveAccountId).toBe(state.activeAccountId);
      const accountId = removeMatch[1]!;
      const removingActive = state.activeAccountId === accountId;
      state = OpenCodeAccountStateSchema.parse({
        ...state,
        accounts: state.accounts
          .filter((account) => account.id !== accountId)
          .map((account) => removingActive ? { ...account, active: false } : account),
        activeAccountId: removingActive ? null : state.activeAccountId,
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

  await panel.getByRole("button", { name: "Remove delta@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove account" }).click();
  await expect(trigger).toContainText("No account");

  await panel.getByRole("button", { name: "Remove beta+renamed@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove account" }).click();
  await expect(panel).not.toContainText("beta+renamed@example.com");

  await panel.getByRole("button", { name: "Remove alpha@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove account" }).click();
  await expect(panel).toContainText("No saved OpenCode accounts.");
  await expect(trigger).toContainText("No account");

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
  await selectWorkflowStep(page, "Implementation plan");

  const editor = page.getByLabel("Implementation plan document Markdown source");
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
  const editAgain = page.getByLabel("Implementation plan document Markdown source");
  await expect.poll(() => markdownSourceValue(editAgain)).toBe(unsaved);

  await page.getByRole("radio", { name: "Split" }).click();
  const splitEditor = page.getByLabel("Implementation plan document Markdown source");
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
  const formatEditor = page.getByLabel("Implementation plan document Markdown source");
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
  await expect(context).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Context" })).toBeVisible();
  await page.getByRole("button", { name: "Context" }).click();
  await expect(context).toBeVisible();
  await expect(page.getByTestId("selected-view-context")).toBeVisible();
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(context.locator(
    '[data-testid="workflow-step-frame"], [data-testid="stage-run-material"], [data-testid="lifecycle-document-material"], [data-testid="review-workspace"], [data-testid="execution-workspace"], [data-testid="evidence-workspace"]',
  )).toHaveCount(0);

  await page.goBack();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await page.goForward();
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
  await expect(
    page.getByTestId("work-item-context-drawer").locator('[data-testid="stage-run-material"]'),
  ).toHaveCount(0);
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
test("long Source and lifecycle Markdown keep the final line editable, savable, and persistent at wide and narrow widths", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const exercise = async (
    width: number,
    title: string,
    tabName: "Work request" | "Implementation plan",
    editorName: string,
    marker: string,
  ): Promise<void> => {
    await page.setViewportSize({ width, height: 760 });
    await openWorkItem(page, title);
    await selectWorkflowStep(page, tabName);

    const editor = page.getByLabel(editorName);
    await expect(editor).toBeVisible();
    const currentMarkdown = await markdownSourceValue(editor);
    const longMarkdown = currentMarkdown + "\n" + Array.from(
      { length: 260 },
      (_, index) => "line " + String(index + 1).padStart(3, "0"),
    ).join("\n") + "\n" + marker;
    await replaceMarkdownSource(page, editor, longMarkdown);

    await editor.evaluate((node) => {
      const scroller = node.closest(".cm-scroller");
      if (!(scroller instanceof HTMLElement)) throw new Error("CodeMirror scroller missing");
      scroller.scrollTop = scroller.scrollHeight;
    });
    const finalLine = editor.locator(".cm-line").last();
    await expect(finalLine).toHaveText(marker);
    await expect(finalLine).toBeVisible();
    await finalLine.click();
    await page.keyboard.press("End");
    await page.keyboard.insertText(" persisted");
    await expect(finalLine).toHaveText(marker + " persisted");
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();

    await backToQueue(page);
    await openWorkItem(page, title);
    await selectWorkflowStep(page, tabName);
    const reloaded = page.getByLabel(editorName);
    await expect(reloaded).toBeVisible();
    await reloaded.evaluate((node) => {
      const scroller = node.closest(".cm-scroller");
      if (!(scroller instanceof HTMLElement)) throw new Error("CodeMirror scroller missing");
      scroller.scrollTop = scroller.scrollHeight;
    });
    await expect(reloaded.locator(".cm-line").last()).toHaveText(marker + " persisted");
    await backToQueue(page);
  };

  await exercise(
    1440,
    "Long source editing workbench wide",
    "Work request",
    "WorkItem source Markdown source",
    "WIDE_SOURCE_FINAL",
  );
  await exercise(
    1440,
    "Long lifecycle editing workbench wide",
    "Implementation plan",
    "Implementation plan document Markdown source",
    "WIDE_PLAN_FINAL",
  );
  await exercise(
    700,
    "Long source editing workbench narrow",
    "Work request",
    "WorkItem source Markdown source",
    "NARROW_SOURCE_FINAL",
  );
  await exercise(
    700,
    "Long lifecycle editing workbench narrow",
    "Implementation plan",
    "Implementation plan document Markdown source",
    "NARROW_PLAN_FINAL",
  );
});

test("workflow-step geometry gives the selected task the canvas and recomposes narrow queue rows", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);

  const loadingItem = await workItemForTitle(page, "Lifecycle editing workbench");
  await page.route(
    "**/api/work-items/" + loadingItem.id + "/lifecycle-artifacts",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    },
  );

  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");
  const loadingWorkspace = page.getByTestId("lifecycle-document-material");
  await expect(loadingWorkspace).toBeVisible();
  const loadingBox = await loadingWorkspace.boundingBox();
  expect(loadingBox).not.toBeNull();
  expect(loadingBox!.height).toBeGreaterThan(500);

  await expect(page.getByRole("button", { name: "Context" })).toBeVisible();
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);
  await expect(page.getByTestId("governed-document-nav")).toHaveCount(0);
  await expect(page.getByTestId("document-state-strip")).toHaveCount(0);
  await expect(page.locator(".order-editor-actionbar")).toHaveCount(0);

  const workspace = page.getByTestId("lifecycle-document-material");
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
  expect(editorBox!.width).toBeGreaterThan(workspaceBox!.width * 0.75);
  expect(editorBox!.height).toBeGreaterThan(workspaceBox!.height * 0.45);
  expect(saveBox!.y + saveBox!.height).toBeLessThanOrEqual(900);

  await backToQueue(page);
  await page.setViewportSize({ width: 700, height: 800 });
  const item = await workItemForTitle(page, "Lifecycle editing workbench");
  const row = rowFor(page, "Lifecycle editing workbench");
  const mobileMeta = row.locator(".order-queue-mobile-meta");
  await expect(mobileMeta).toBeVisible();
  await expect(mobileMeta).toContainText("Approval · " + item.status);
  await expect(mobileMeta).not.toContainText(item.stage + " ·");

  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  const taskIndex = page.getByTestId("workflow-step-index");
  const taskDetail = page.getByTestId("execution-task-detail");
  await expect(taskIndex).toBeVisible();
  await expect(taskDetail).toBeVisible();
  const masterBox = await taskIndex.boundingBox();
  const detailBox = await taskDetail.boundingBox();
  expect(masterBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(masterBox!.width).toBeLessThanOrEqual(18 * 16 + 20);
  expect(detailBox!.width).toBeGreaterThan(640);
});

test("narrow workflow work index returns focus and preserves dirty material across recomposition", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 700, height: 800 });
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");

  const editor = page.getByLabel("Implementation plan document Markdown source");
  await expect(editor).toBeVisible();
  const initial = await markdownSourceValue(editor);
  await replaceMarkdownSource(
    page,
    editor,
    initial + "\n# Responsive continuity\n",
  );

  const trigger = page.getByRole("button", { name: "Plan work" });
  await trigger.focus();
  await trigger.click();
  await expect(page.getByTestId("workflow-step-index-drawer")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("workflow-step-index-drawer")).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => markdownSourceValue(editor))
    .toContain("# Responsive continuity");

  await page.setViewportSize({ width: 1600, height: 900 });
  await expect(page.getByTestId("workflow-step-index")).toBeVisible();
  await expect.poll(() => markdownSourceValue(editor))
    .toContain("# Responsive continuity");
});

test("workflow step owns Run history, dialogue, responsive detail, and technical feedback", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);

  await openWorkItem(page, "Proposal adoption in progress");
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  await expect(page.getByText("Adoption in progress", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Proposal review");

  const workflowRail = page.getByTestId("workflow-progression");
  await expect(workflowRail.getByRole("button", { name: "Implementation plan" }))
    .toHaveAttribute("aria-current", "step");
  await expect(workflowRail.getByRole("button", { name: "Implementation plan" }))
    .toHaveAttribute("title", "Define exactly how the change will be made");
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  const proposalRunIndex = page.getByTestId("workflow-step-index");
  await proposalRunIndex.getByText("Attempt 2", { exact: true }).click();
  await expect(page.getByTestId("stage-run-material")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header")).toHaveCount(1);

  const detail = page.getByTestId("activity-detail");
  const detailBox = await detail.boundingBox();
  expect(detailBox).not.toBeNull();
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

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("activity-detail")).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);

  await backToQueue(page);
  await page.setViewportSize({ width: 1600, height: 900 });
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toBeVisible();
  await selectWorkflowStep(page, "Research");
  const index = page.getByTestId("workflow-step-index");
  await expect(index).toBeVisible();
  await index.getByText("Attempt 1", { exact: true }).click();
  await expect(page.getByTestId("stage-run-material")).toBeVisible();
  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Workflow step completed", { exact: true })).toBeVisible();
});

test("completed pre-signoff history never suppresses the canonical next-stage action", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const cases = [
    {
      title: "Requirements ready after Research",
      currentStep: "Requirements",
      action: "Start Requirements",
    },
    {
      title: "Solution design ready after Requirements",
      currentStep: "Solution design",
      action: "Start Solution design",
    },
    {
      title: "Implementation plan ready after Design",
      currentStep: "Implementation plan",
      action: "Start Implementation planning",
    },
    {
      title: "Readiness ready after Plan",
      currentStep: "Readiness review",
      action: "Start Readiness review",
    },
  ] as const;

  for (const entry of cases) {
    await openWorkItem(page, entry.title);
    const rail = page.getByTestId("workflow-progression");
    await expect(
      rail.getByRole("button", { name: entry.currentStep, exact: true }),
    ).toHaveAttribute("aria-current", "step");
    await expect(
      page.getByRole("button", { name: entry.action, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);

    if (entry.currentStep === "Requirements") {
      await selectWorkflowStep(page, "Research");
      const index = page.getByTestId("workflow-step-index");
      await expect(index).toBeVisible();
      await index.getByText("Attempt 1", { exact: true }).click();
      await expect(page.getByTestId("stage-run-material")).toBeVisible();
      await expect(
        page.getByText("Workflow step completed", { exact: true }),
      ).toBeVisible();
      await selectWorkflowStep(page, "Requirements");
      await expect(
        page.getByRole("button", { name: "Start Requirements", exact: true }),
      ).toBeVisible();
    }

    await backToQueue(page);
  }
});

test("canonical Run feedback remains visible in the owning workflow context without synthetic progress", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Workflow input required");
  await expect(
    page.getByTestId("workflow-step-summary")
      .getByText("Waiting for you", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Your input is needed", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByTestId("activity-composer")
      .getByText("Which constraint should the plan prioritize?", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow failure feedback");
  const failureIndex = page.getByTestId("workflow-step-index");
  await failureIndex.getByText("Attempt 4", { exact: true }).click();
  await expect(page.getByText("Work is blocked", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Conformance check failed", { exact: true }),
  ).toBeVisible();

  await failureIndex.getByText("Attempt 2", { exact: true }).click();
  await expect(page.getByText("Agent setup blocked", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Technical diagnostics available", { exact: true }),
  ).toBeVisible();
  const setupEvidence = page
    .locator('[data-evidence-path="provider-diagnostics.json"]')
    .first()
    .getByRole("button", { name: "Evidence: provider-diagnostics.json" });
  await expect(setupEvidence).toBeVisible();

  await failureIndex.getByText("Attempt 3", { exact: true }).click();
  await expect(
    page.getByText("Agent execution failed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Approved authority changed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Repository changed", { exact: true })).toBeVisible();

  await failureIndex.getByText("Attempt 1", { exact: true }).click();
  await expect(page.getByText("Cancelled", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Attempt cancelled", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Already satisfied implementation");
  await expect(page.getByTestId("result-workspace"))
    .toContainText("Already satisfied");
  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByText("No change required", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Failed implementation feedback");
  const implementationIndex = page.getByTestId("workflow-step-index");
  await implementationIndex
    .getByText(/Independent review · Attempt 1/)
    .click();
  await expect(
    page.getByText("Independent review failed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Validation failed", { exact: true })).toBeVisible();

  await implementationIndex
    .getByText(/Implementation agent · Attempt 1/)
    .click();
  await expect(page.getByText("Verification passed", { exact: true })).toBeVisible();
  await expect(page.getByText("Verification failed", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await backToQueue(page);
});

test("workflow mutations lock their owning controls while pending and keep failures local", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  const failNext = async (
    pattern: string,
    trigger: () => Promise<void>,
    assertPending: () => Promise<void>,
  ): Promise<void> => {
    let release = (): void => {};
    let markHandled = (): void => {};
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    const handled = new Promise<void>((resolve) => {
      markHandled = resolve;
    });
    await page.route(pattern, async (route) => {
      await barrier;
      await route.abort("failed");
      markHandled();
    });
    await trigger();
    await assertPending();
    release();
    await handled;
    await page.unroute(pattern);
  };

  await openWorkItem(page, "Requirements ready after Research");
  const start = page.getByRole("button", { name: "Start Requirements", exact: true });
  await failNext(
    "**/api/work-items/*/runs",
    async () => start.click(),
    async () => expect(start).toBeDisabled(),
  );
  await expect(page.getByText("Could not start current workflow step", { exact: true }))
    .toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow input required");
  const messageInput = page.getByLabel("Message input");
  await messageInput.fill("Keep the approved constraint.");
  await failNext(
    "**/api/runs/*/input",
    async () => messageInput.press("Enter"),
    async () => expect(messageInput).toBeDisabled(),
  );
  await expect(page.getByText("Workflow action failed", { exact: true })).toBeVisible();

  const cancel = page.getByRole("button", { name: "Cancel current activity" });
  await failNext(
    "**/api/runs/*/cancel",
    async () => cancel.click(),
    async () => expect(cancel).toBeDisabled(),
  );
  await expect(page.getByText("Workflow action failed", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow retry action");
  const retry = page.getByRole("button", { name: "Retry Implementation plan" });
  await failNext(
    "**/api/work-items/*/runs",
    async () => retry.click(),
    async () => expect(retry).toBeDisabled(),
  );
  await expect(page.getByText("Workflow action failed", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow resume action");
  const resume = page.getByRole("button", { name: "Resume resolved blocker" });
  await failNext(
    "**/api/work-items/*/resume",
    async () => resume.click(),
    async () => expect(resume).toBeDisabled(),
  );
  await expect(page.getByText("Workflow action failed", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Implementation action ready");
  const runNext = page.getByRole("button", { name: "Run next implementation step" });
  await failNext(
    "**/api/tick",
    async () => runNext.click(),
    async () => expect(runNext).toBeDisabled(),
  );
  await expect(page.getByText("Implementation action failed", { exact: true }))
    .toBeVisible();
});

test("successful workflow mutations reconcile to refreshed canonical state without provider-dependent browser work", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Work request start success");
  const startItem = await workItemForTitle(page, "Work request start success");
  const researchRun = syntheticStageRun(startItem, "R1", 1);
  const researchStarted = syntheticRunEvent(researchRun, 1, {
    tag: "STAGE_STARTED",
    stage: "R1",
    mode: "INTERACTIVE",
    contextHash: researchRun.contextHash,
  });
  const startPattern = "**/api/work-items/" + startItem.id + "/runs";
  await page.route(startPattern, async (route) => {
    mutateFixture((database) => {
      updateWorkItemLifecycle(database, startItem.id, {
        stage: "R1",
        status: "ACTIVE",
        outcome: null,
      });
      storeRun(database, researchRun);
      storeRunEvent(database, researchStarted);
    });
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(researchRun),
    });
  });
  await page.getByRole("button", { name: "Start Research", exact: true }).click();
  await page.unroute(startPattern);
  await expect(
    page.getByTestId("workflow-progression")
      .getByRole("button", { name: "Research", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("selected-run-header")).toContainText("Running");
  await expect(page.getByTestId("activity-composer")).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow input required");
  const inputItem = await workItemForTitle(page, "Workflow input required");
  const inputRunsResponse = await page.context().request.get(
    "/api/work-items/" + inputItem.id + "/runs",
  );
  expect(inputRunsResponse.status()).toBe(200);
  const inputRuns = RunSchema.array().parse(await inputRunsResponse.json());
  const inputRun = inputRuns.find((run) => run.status === "WAITING_FOR_INPUT");
  expect(inputRun).toBeDefined();
  const inputEventsResponse = await page.context().request.get(
    "/api/runs/" + inputRun!.id + "/events?afterSequence=0",
  );
  expect(inputEventsResponse.status()).toBe(200);
  const inputEvents = RunEventSchema.array().parse(await inputEventsResponse.json());
  const requested = inputEvents.find(
    (event) => event.event.tag === "HUMAN_INPUT_REQUESTED",
  );
  expect(requested).toBeDefined();
  const received = syntheticRunEvent(
    inputRun!,
    Math.max(...inputEvents.map((event) => event.sequence)) + 1,
    {
      tag: "HUMAN_INPUT_RECEIVED",
      requestEventId: requested!.id,
      text: "Keep the approved constraint.",
    },
  );
  const inputPattern = "**/api/runs/" + inputRun!.id + "/input";
  await page.route(inputPattern, async (route) => {
    mutateFixture((database) => {
      storeRunEvent(database, received);
      updateStoredRun(database, {
        ...inputRun!,
        status: "RUNNING",
        endedAt: null,
      });
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(received),
    });
  });
  const messageInput = page.getByLabel("Message input");
  await messageInput.fill("Keep the approved constraint.");
  await messageInput.press("Enter");
  await page.unroute(inputPattern);
  await expect(
    page.locator('[data-event-tag="HUMAN_INPUT_RECEIVED"]'),
  ).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Cancel current activity" }).click();
  await expect(page.getByTestId("selected-run-header")).toContainText("Cancelled");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow retry action");
  const retryItem = await workItemForTitle(page, "Workflow retry action");
  const retryRun = syntheticStageRun(retryItem, "PLAN", 2);
  const retryStarted = syntheticRunEvent(retryRun, 1, {
    tag: "STAGE_STARTED",
    stage: "PLAN",
    mode: "INTERACTIVE",
    contextHash: retryRun.contextHash,
  });
  const retryPattern = "**/api/work-items/" + retryItem.id + "/runs";
  await page.route(retryPattern, async (route) => {
    mutateFixture((database) => {
      storeRun(database, retryRun);
      storeRunEvent(database, retryStarted);
    });
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(retryRun),
    });
  });
  await page.getByRole("button", { name: "Retry Implementation plan" }).click();
  await page.unroute(retryPattern);
  await expect(page.getByTestId("selected-run-header")).toContainText("Attempt 2");
  await expect(page.getByTestId("selected-run-header")).toContainText("Running");
  await expect(page.getByTestId("activity-composer")).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow resume action");
  await page.getByRole("button", { name: "Resume resolved blocker" }).click();
  await expect(
    page.getByRole("button", { name: "Resume resolved blocker" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Retry Implementation plan" }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Implementation action ready");
  const executionItem = await workItemForTitle(page, "Implementation action ready");
  const taskResponse = await page.context().request.get(
    "/api/work-items/" + executionItem.id + "/tasks",
  );
  expect(taskResponse.status()).toBe(200);
  const executionTasks = ExecutionTaskSchema.array().parse(await taskResponse.json());
  const executionTask = executionTasks[0];
  expect(executionTask).toBeDefined();
  const builderRun = RunSchema.parse({
    id: newRunId(),
    workItemId: executionItem.id,
    executionTaskId: executionTask!.id,
    stage: "EXECUTION",
    mode: "UNATTENDED",
    role: "BUILDER",
    triggerEventId: null,
    status: "RUNNING",
    attempt: 1,
    baselineCommit: fixtureBaselineCommit,
    contextHash: sha256Text("browser-success-execution-" + executionTask!.id),
    providerSessionId: null,
    terminalClassification: null,
    startedAt: nowIsoDateTime(),
    endedAt: null,
  });
  await page.route("**/api/tick", async (route) => {
    mutateFixture((database) => {
      setExecutionTaskState(database, executionTask!.id, "RUNNING");
      storeRun(database, builderRun);
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  await page.getByRole("button", { name: "Run next implementation step" }).click();
  await page.unroute("**/api/tick");
  await expect(page.getByTestId("selected-run-header"))
    .toContainText("Implementation agent · Attempt 1");
  await expect(page.getByTestId("selected-run-header")).toContainText("Running");
  await expect(
    page.getByRole("button", { name: "Run next implementation step" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cancel current implementation attempt" }),
  ).toBeVisible();
});

test("all nine workflow steps keep their canonical summary/material grammar and supporting context local", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");

  const cases = [
    ["Work request", "Source current"],
    ["Research", "document current"],
    ["Requirements", "document current"],
    ["Solution design", "document current"],
    ["Implementation plan", "document current"],
    ["Readiness review", "Ready for sign-off"],
    ["Approval", "Package current · ready to sign"],
  ] as const;

  for (const [step, summaryState] of cases) {
    await selectWorkflowStep(page, step);
    await expect(page.getByTestId("workflow-step-summary")).toContainText(step);
    await expect(page.getByTestId("workflow-step-summary")).toContainText(summaryState);
    await expect(page.getByTestId("primary-material-frame")).toBeVisible();
  }

  await selectWorkflowStep(page, "Research");
  await page.getByText("Supporting context", { exact: true }).click();
  await page.getByRole("button", { name: "Open supporting Work request" }).click();
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await expect(
    page.getByText("Read-only supporting Work request context.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to workflow context" }).click();
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();

  await selectWorkflowStep(page, "Requirements");
  await page.getByText("Supporting context", { exact: true }).click();
  await page.getByRole("button", { name: "Open supporting Research document" }).click();
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to workflow context" }).click();

  await backToQueue(page);
  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("workflow-step-summary")).toContainText("Implementation");
  await expect(page.getByTestId("primary-material-frame")).toBeVisible();
  await selectWorkflowStep(page, "Complete");
  await expect(page.getByTestId("workflow-step-summary")).toContainText("Candidate done");
  await expect(page.getByTestId("primary-material-frame")).toBeVisible();
});

test("proposal decisions are primary, mutation-safe, and Approval keeps sign-off attached to selected material", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  const summary = page.getByTestId("workflow-step-summary");
  await expect(summary).toContainText("Implementation plan");
  await expect(summary).toContainText("Proposal review required");
  const proposalReview = page.getByTestId("proposal-review-workspace");
  const proposalDiff = page.getByTestId("proposal-review-diff");
  await expect(proposalReview).toBeVisible();
  await expect(proposalDiff).toBeVisible();
  const proposalReviewBox = await proposalReview.boundingBox();
  const proposalDiffBox = await proposalDiff.boundingBox();
  expect(proposalReviewBox).not.toBeNull();
  expect(proposalDiffBox).not.toBeNull();
  expect(proposalDiffBox!.width).toBeGreaterThan(proposalReviewBox!.width * 0.85);

  const adopt = page.getByRole("button", { name: "Adopt" });
  const reject = page.getByRole("button", { name: "Reject" });
  await expect(adopt).toBeVisible();
  await expect(reject).toBeVisible();

  let releaseAdopt = (): void => {};
  let markAdoptHandled = (): void => {};
  const adoptBarrier = new Promise<void>((resolve) => {
    releaseAdopt = resolve;
  });
  const adoptHandled = new Promise<void>((resolve) => {
    markAdoptHandled = resolve;
  });
  await page.route("**/api/run-events/*/adopt", async (route) => {
    await adoptBarrier;
    await route.continue();
    markAdoptHandled();
  });
  await adopt.click();
  await expect(adopt).toBeDisabled();
  await expect(reject).toBeDisabled();
  releaseAdopt();
  await adoptHandled;
  await expect(page.getByTestId("stage-run-material")).toBeVisible({
    timeout: 5_000,
  });
  await expect(
    page.getByText("Document change adopted", { exact: true }).last(),
  ).toBeVisible();
  await page.unroute("**/api/run-events/*/adopt");
  const proposalIndex = page.getByTestId("workflow-step-index");
  await proposalIndex.getByText("Attempt 1", { exact: true }).click();
  await expect(
    page.getByText("Document adoption in progress", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Document change adopted", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);

  await backToQueue(page);
  await openWorkItem(page, "Proposal rejection review");
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  const rejectAction = page.getByRole("button", { name: "Reject" });
  const adoptAction = page.getByRole("button", { name: "Adopt" });
  let releaseReject = (): void => {};
  let markRejectHandled = (): void => {};
  const rejectBarrier = new Promise<void>((resolve) => {
    releaseReject = resolve;
  });
  const rejectHandled = new Promise<void>((resolve) => {
    markRejectHandled = resolve;
  });
  await page.route("**/api/run-events/*/reject", async (route) => {
    await rejectBarrier;
    await route.continue();
    markRejectHandled();
  });
  await rejectAction.click();
  await expect(rejectAction).toBeDisabled();
  await expect(adoptAction).toBeDisabled();
  releaseReject();
  await rejectHandled;
  await expect(page.getByTestId("stage-run-material")).toBeVisible({
    timeout: 5_000,
  });
  await expect(
    page.getByText("Document change rejected", { exact: true }).last(),
  ).toBeVisible();
  await page.unroute("**/api/run-events/*/reject");

  await backToQueue(page);
  await openWorkItem(page, "Awaiting sign-off");
  await expect(page.getByTestId("review-workspace")).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toContainText(
    "Package current · ready to sign",
  );
  await expect(page.getByTestId("signoff-package-hash")).toHaveText(
    /^sha256:[0-9a-f]{64}$/,
  );
  const approvalIndex = page.getByTestId("workflow-step-index");
  await expect(approvalIndex).toContainText("Governed documents");
  await expect(approvalIndex).toContainText("Signed tasks");
  await expect(approvalIndex.getByText("T1", { exact: true })).toBeVisible();

  await approvalIndex.getByText("Implementation plan", { exact: true }).click();
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("Approved by")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);

  await approvalIndex.getByText("T1", { exact: true }).click();
  await expect(page.getByTestId("approval-task-detail"))
    .toContainText("Prove the browser candidate surface");
  await expect(page.getByLabel("Approved by")).toBeVisible();
  await page.getByLabel("Approved by").fill("browser-approver");

  const signoff = page.getByRole("button", { name: "Sign off exact package" });
  let releaseSignoff = (): void => {};
  let markSignoffHandled = (): void => {};
  const signoffBarrier = new Promise<void>((resolve) => {
    releaseSignoff = resolve;
  });
  const signoffHandled = new Promise<void>((resolve) => {
    markSignoffHandled = resolve;
  });
  await page.route("**/api/work-items/*/signoff", async (route) => {
    await signoffBarrier;
    await route.continue();
    markSignoffHandled();
  });
  await signoff.click();
  await expect(signoff).toBeDisabled();
  await expect(page.getByLabel("Approved by")).toBeDisabled();
  releaseSignoff();
  await signoffHandled;
  await page.unroute("**/api/work-items/*/signoff");
  await expect(
    page.getByTestId("workflow-progression")
      .getByRole("button", { name: "Implementation", exact: true }),
  ).toHaveAttribute("aria-current", "step", { timeout: 5_000 });
});

test("source editor preserves stale buffers, never overwrites newer source, and returns work visibly to R1", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Source editing workbench");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toBeVisible();
  await selectWorkflowStep(page, "Work request");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);

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

  const workflowRail = page.getByTestId("workflow-progression");
  await expect(
    workflowRail.getByRole("button", { name: "Research" }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  await expect(
    page.getByText("This workflow step has not been reached", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Implementation plan document Markdown source")).toHaveCount(0);
});

test("dirty Markdown navigation is explicit, preserves the buffer when cancelled, restores queue focus when discarded, and PLAN/R3 editing remains correct", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");

  const workflowMutations: string[] = [];
  page.on("request", (browserRequest) => {
    if (browserRequest.method() !== "GET") {
      workflowMutations.push(browserRequest.method() + " " + new URL(browserRequest.url()).pathname);
    }
  });
  const workflowRail = page.getByTestId("workflow-progression");
  await selectWorkflowStep(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  expect(workflowMutations).toEqual([]);

  await selectWorkflowStep(page, "Implementation plan");
  const planEditor = page.getByLabel("Implementation plan document Markdown source");
  await expect(planEditor).toBeVisible();
  const initial = await markdownSourceValue(planEditor);
  await replaceMarkdownSource(page, planEditor, initial + "\nunsaved guard\n");

  await page.getByTestId("workflow-progression")
    .getByRole("button", { name: "Approval" })
    .click();
  const workflowGuard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(workflowGuard).toBeVisible();
  await workflowGuard.getByRole("button", { name: "Continue editing" }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("unsaved guard");
  expect(workflowMutations).toEqual([]);

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
  await selectWorkflowStep(page, "Readiness review");
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("Readiness review document Markdown source")).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  const editablePlan = page.getByLabel("Implementation plan document Markdown source");
  const fresh = await markdownSourceValue(editablePlan);
  await replaceMarkdownSource(page, editablePlan, fresh + "\ncancelled plan edit\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(editablePlan)).toBe(fresh);

  await replaceMarkdownSource(page, editablePlan, fresh + "\nsaved plan edit\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => markdownSourceValue(editablePlan)).toContain("saved plan edit");
  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("selected-view-context")).toContainText("Implementation plan");
  await expect(page.getByTestId("selected-view-context")).toContainText("Governed document");
  await expect(page.getByTestId("selected-view-context")).toContainText("docs/plan.md");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("invalid lifecycle Markdown stays inspection-only and exact bytes open in the Evidence workspace", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Invalid lifecycle Markdown");
  await selectWorkflowStep(page, "Research");
  await expect(
    page.getByText("Lifecycle document is not canonical editable Markdown", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Research document Markdown source")).toHaveCount(0);

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
  await expect(page.getByTestId("result-workspace")).toContainText("Audit complete");
  await expect(page.getByTestId("result-material")).toContainText(
    "Evidence-backed audit verdict.",
  );
  await expect(page.getByRole("button", { name: "Create linked remediation" })).toBeVisible();
  await backToQueue(page);

  const parent = await workItemForTitle(page, "Completed investigation");
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toContainText("Investigation complete");
  await expect(page.getByTestId("result-material")).toContainText(
    "Evidence-backed conclusion.",
  );
  await selectWorkflowStep(page, "Research");
  await expect(page.getByTestId("markdown-readonly")).toContainText(
    "Evidence-backed conclusion.",
  );
  await expect(page.getByRole("button", { name: "Create linked remediation" })).toHaveCount(0);

  await selectWorkflowStep(page, "Complete");
  await page.getByRole("button", { name: "Create linked remediation" }).click();
  const dialog = page.getByRole("dialog", { name: "Create linked remediation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "CHANGE" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "DEFECT" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "INVESTIGATION" })).toHaveCount(0);
  await expect(dialog.getByRole("radio", { name: "AUDIT" })).toHaveCount(0);

  await dialog.getByRole("radio", { name: "DEFECT" }).click();
  await dialog.getByLabel("Title").fill("Remediate investigation finding");

  let releaseRemediation = (): void => {};
  let remediationHandled = (): void => {};
  const remediationBarrier = new Promise<void>((resolve) => {
    releaseRemediation = resolve;
  });
  const remediationComplete = new Promise<void>((resolve) => {
    remediationHandled = resolve;
  });
  await page.route("**/api/work-items", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await remediationBarrier;
    await route.continue();
    remediationHandled();
  });
  const createRemediation = dialog.getByRole("button", { name: "Create linked remediation" });
  await createRemediation.click();
  await expect(createRemediation).toBeDisabled();
  releaseRemediation();
  await remediationComplete;
  await page.unroute("**/api/work-items");

  await expect(page.getByTestId("work-item-heading")).toHaveText("Remediate investigation finding");
  const child = await workItemForTitle(page, "Remediate investigation finding");
  expect(child.schemaId).toBe("defect-v1");
  expect(child.projectId).toBe(parent.projectId);
  expect(child.derivedFromWorkItemId).toBe(parent.id);

  const refreshedParent = await workItemForTitle(page, "Completed investigation");
  expect(refreshedParent.stage).toBe("COMPLETE");
  expect(refreshedParent.outcome).toBe("INVESTIGATION_COMPLETE");
});

test("all non-delivery terminal classifications render under Complete without invented remediation", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  for (const [title, outcome] of [
    ["Disproven work", "Disproven"],
    ["Duplicate work", "Duplicate"],
    ["Already satisfied work", "Already satisfied"],
  ] as const) {
    await openWorkItem(page, title);
    await expect(page.getByTestId("result-workspace")).toContainText(outcome);
    await expect(page.getByRole("button", { name: "Create linked remediation" })).toHaveCount(0);
    await backToQueue(page);
  }
});

test("candidate Complete surface and reached Implementation expose V0-V7, exact evidence, and never execute evidence markup", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Verified candidate");

  await expect(page.getByTestId("result-workspace")).toContainText("Verified candidate");
  await expect(page.getByTestId("candidate-result-material")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open in Activity" })).toHaveCount(0);

  await selectWorkflowStep(page, "Approval");
  await expect(page.getByTestId("review-workspace"))
    .toContainText("Approved package history");
  const historicalApprovalIndex = page.getByTestId("workflow-step-index");
  await expect(historicalApprovalIndex.getByText("T1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
  await historicalApprovalIndex.getByText("T1", { exact: true }).click();
  await expect(page.getByTestId("approval-task-detail"))
    .toContainText("Prove the browser candidate surface");

  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  const implementationIndex = page.getByTestId("workflow-step-index");
  await implementationIndex.getByText(/Implementation agent · Attempt 1/).click();
  await expect(
    page.getByText("Candidate state recorded", { exact: true }),
  ).toBeVisible();

  await implementationIndex.getByText(/Independent review · Attempt 1/).click();
  await expect(
    page.getByText("Independent review passed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Verified candidate recorded", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByTestId("execution-task-detail").getByText("T1", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  const validation = page.getByTestId("validation-matrix");
  for (const stage of ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"]) {
    await expect(
      validation.getByTestId("validation-stage-" + stage),
    ).toContainText("Passed");
  }

  const reviewEvidence = page
    .locator('[data-evidence-path="review.txt"]')
    .first()
    .getByRole("button", { name: "Evidence: review.txt" });
  await expect(reviewEvidence).toBeVisible();
  await reviewEvidence.scrollIntoViewIfNeeded();
  await reviewEvidence.click();
  await expect(page.getByTestId("evidence-workspace")).toBeVisible();
  const raw = page.getByTestId("raw-content-view");
  await expect(raw).toContainText(
    "<script>window.__orderXss=true</script>",
  );
  expect(
    await page.evaluate(() =>
      Object.prototype.hasOwnProperty.call(window, "__orderXss")),
  ).toBe(false);

  await page.getByRole("button", { name: "Back to workflow context" }).click();
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await expect(
    page
      .locator('[data-evidence-path="review.txt"]')
      .first()
      .getByRole("button", { name: "Evidence: review.txt" }),
  ).toBeFocused();
});
