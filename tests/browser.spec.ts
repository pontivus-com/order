import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  ArtifactRefSchema,
  ExecutionTaskSchema,
  InstallationReadinessSchema,
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

const renderedAcceptanceDir = process.env.PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR;
const renderedAcceptanceCandidateSha =
  process.env.PONTIVUS_ORDER_RENDERED_ACCEPTANCE_CANDIDATE_SHA;

type RenderedAcceptanceEntry = Readonly<{
  id: string;
  workItemKind: "QUEUE" | "CHANGE" | "DEFECT" | "INVESTIGATION" | "AUDIT";
  workflowStep: string | null;
  surface: string;
  state: string;
  fixture: string;
  viewport: Readonly<{ width: number; height: number }>;
  theme: "Light" | "Dark" | "System/light" | "System/dark";
  route: string;
  references: readonly string[];
  authorityRefs: readonly string[];
  captureScope?: string;
  screenshot: string;
}>;

const writeRenderedAcceptanceEvidence = (
  entries: readonly RenderedAcceptanceEntry[],
): void => {
  if (renderedAcceptanceDir === undefined) {
    throw new TypeError("PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR is required");
  }
  if (
    renderedAcceptanceCandidateSha === undefined ||
    renderedAcceptanceCandidateSha.length === 0
  ) {
    throw new TypeError(
      "PONTIVUS_ORDER_RENDERED_ACCEPTANCE_CANDIDATE_SHA is required",
    );
  }
  mkdirSync(renderedAcceptanceDir, { recursive: true });
  const manifestPath = join(renderedAcceptanceDir, "manifest.json");
  let priorEntries: readonly RenderedAcceptanceEntry[] = [];
  try {
    const prior = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      candidateSha?: unknown;
      entries?: unknown;
    };
    if (prior.candidateSha !== renderedAcceptanceCandidateSha) {
      throw new TypeError("rendered acceptance candidate changed within one evidence run");
    }
    if (Array.isArray(prior.entries)) {
      priorEntries = prior.entries as readonly RenderedAcceptanceEntry[];
    }
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("ENOENT")) throw error;
  }
  const merged = [...priorEntries, ...entries];
  const duplicateIds = merged
    .map((entry) => entry.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    throw new TypeError("duplicate rendered acceptance capture id: " + duplicateIds.join(", "));
  }
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        schemaVersion: 1,
        candidateSha: renderedAcceptanceCandidateSha,
        entries: merged,
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(
    join(renderedAcceptanceDir, "index.md"),
    [
      "# Order 0.6.0 rendered acceptance — IA26",
      "",
      "Exact candidate: \`" + renderedAcceptanceCandidateSha + "\`",
      "",
      "| Capture | Surface/state | Scope | Reference | Authority |",
      "|---|---|---|---|---|",
      ...merged.map((entry) =>
        "| \`" + entry.screenshot + "\` | " + entry.surface + " / " + entry.state +
        " | " + (entry.captureScope ?? "viewport") +
        " | " + entry.references.map((value) => "\`" + value + "\`").join(", ") +
        " | " + entry.authorityRefs.map((value) => "\`" + value + "\`").join(", ") +
        " |"
      ),
      "",
      "These captures are runtime evidence only. Current canonical authority wins over a derived SVG reference on conflict.",
      "",
    ].join("\n"),
  );
};

const captureRenderedAcceptance = async (
  page: Page,
  entry: Omit<RenderedAcceptanceEntry, "screenshot">,
  target?: Locator,
): Promise<RenderedAcceptanceEntry> => {
  if (renderedAcceptanceDir === undefined) {
    throw new TypeError("PONTIVUS_ORDER_RENDERED_ACCEPTANCE_DIR is required");
  }
  mkdirSync(renderedAcceptanceDir, { recursive: true });
  const screenshot = entry.id + ".png";
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  if (target === undefined) {
    await page.screenshot({
      path: join(renderedAcceptanceDir, screenshot),
      fullPage: false,
      animations: "disabled",
    });
  } else {
    await target.screenshot({
      path: join(renderedAcceptanceDir, screenshot),
      animations: "disabled",
    });
  }
  return { ...entry, screenshot };
};

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
  await page.getByRole("link", { name: "Back to queue" }).click();
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
    .getByTestId("workflow-rail")
    .getByRole("button", { name, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
};

const openMarkdownEditor = async (
  page: Page,
  editorName: string,
) => {
  const editor = page.getByLabel(editorName);
  if (!(await editor.isVisible().catch(() => false))) {
    const edit = page.getByRole("button", { name: "Edit", exact: true });
    await expect(edit).toBeVisible();
    await edit.click();
  }
  await expect(editor).toBeVisible();
  return editor;
};

const selectWorkflowMaterial = async (
  page: Page,
  optionName: string,
): Promise<void> => {
  const selector = page
    .getByTestId("workflow-step-index")
    .getByRole("combobox");
  await expect(selector).toBeVisible();
  await selector.click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
};

const selectCurrentWorkflowMaterial = async (
  page: Page,
  optionName: string,
): Promise<void> => {
  const selector = page.getByRole("combobox", {
    name: "Current workflow material",
    exact: true,
  });
  await expect(selector).toBeVisible();
  await selector.click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
};

const openDisclosureResource = async (
  page: Page,
  disclosureName: string,
  actionName: string,
): Promise<void> => {
  const disclosure = page.getByRole("button", { name: disclosureName, exact: true });
  await expect(disclosure).toBeVisible();
  const expanded = await disclosure.getAttribute("aria-expanded");
  if (expanded !== "true") await disclosure.click();
  await page.getByRole("button", { name: actionName, exact: true }).click();
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
  // CodeMirror's contenteditable spans the full document height. Target a rendered
  // line so pointer interaction is exercised inside the visible editor viewport,
  // rather than asking Playwright to click the offscreen center of the full document.
  await editor.locator(".cm-line").first().click();
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
  expect(missingOrigin.status()).toBe(401);
  const wrongOrigin = await page.context().request.post("/api/tick", {
    headers: { origin: "http://127.0.0.1:1" },
    data: {},
  });
  expect(wrongOrigin.status()).toBe(401);

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
  const layout = page.getByTestId("workbench-app-shell");
  const toolbar = page.locator(".order-toolbar").first();
  const system = page.getByRole("radio", { name: "System" });
  const light = page.getByRole("radio", { name: "Light" });
  const dark = page.getByRole("radio", { name: "Dark" });

  await expect(page.locator(".order-theme-control select")).toHaveCount(0);
  await expect(system).toBeChecked();
  await expect(root).not.toHaveAttribute("data-theme");
  await expect(root).toHaveAttribute("data-astryx-theme");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(23, 34, 51)");
  await expect(
    page.getByTestId("workbench-search").getByRole("searchbox"),
  ).toHaveCSS("color", "rgb(237, 243, 250)");

  await light.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(15, 23, 42)");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Light" })).toBeChecked();

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(23, 34, 51)");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();

  await page.getByRole("radio", { name: "System" }).click();
  await expect(root).not.toHaveAttribute("data-theme");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(15, 23, 42)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(toolbar).toHaveCSS("background-color", "rgb(23, 34, 51)");
  await page.reload();
  await expect(page.getByRole("radio", { name: "System" })).toBeChecked();
});

test("System, Light and Dark preserve representative Workbench semantic roles", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ colorScheme: "dark" });
  await authenticate(page, request);
  await page.setViewportSize({ width: 1280, height: 800 });

  for (const theme of ["System", "Light", "Dark"] as const) {
    await page.goto("/");
    await page.getByRole("radio", { name: theme }).click();
    await expect(page.getByTestId("work-item-queue")).toBeVisible();

    await page.getByRole("button", { name: "New work item" }).click();
    await expect(page.getByRole("dialog", { name: "Create work item" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();

    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page.getByTestId("settings-workspace")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Implementation plan document visual");
    await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
    await page.getByRole("button", { name: "Context", exact: true }).click();
    await expect(page.getByTestId("work-item-context")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Research open continuation");
    await expect(page.getByTestId("activity-detail")).toBeVisible();
    await expect(page.getByTestId("activity-composer")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Readiness ready after Plan");
    await expect(page.getByTestId("review-workspace")).toBeVisible();

    await page.goto("/");
    await openWorkItem(page, "Verified candidate");
    await selectWorkflowStep(page, "Implementation");
    await expect(page.getByTestId("execution-workspace")).toBeVisible();
    await selectWorkflowMaterial(page, "Independent review · Attempt 1");
    const reviewEvidence = page
      .locator('[data-evidence-path="review.txt"]')
      .first()
      .getByRole("button", { name: "Evidence: review.txt" });
    await reviewEvidence.scrollIntoViewIfNeeded();
    await reviewEvidence.click();
    await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
    await expect(page.getByTestId("raw-content-view")).toBeVisible();
    await page.getByRole("button", { name: "Back to workflow context" }).click();
    await selectWorkflowStep(page, "Complete");
    await expect(page.getByTestId("result-workspace")).toBeVisible();
  }
});

test("Settings uses stable native-history destinations and daemon-owned readiness", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page).toHaveURL(baseURL + "/settings/repositories");
  const settings = page.getByTestId("settings-workspace");
  await expect(settings).toBeVisible();
  const repositories = page.getByTestId("settings-repositories");
  await expect(repositories).toBeVisible();
  await expect(settings).toContainText("WorkItem documents");
  const readinessResponse = await page.request.get("/api/settings/readiness");
  expect(readinessResponse.status()).toBe(200);
  const installationReadiness = InstallationReadinessSchema.parse(
    await readinessResponse.json(),
  );
  const readyForProductiveWork = settings.getByText(
    "Ready for productive work",
    { exact: true },
  );
  const expectDaemonReadiness = async (): Promise<void> => {
    if (installationReadiness.ready) {
      await expect(readyForProductiveWork).toBeVisible();
      return;
    }
    await expect(readyForProductiveWork).toHaveCount(0);
    await expect(
      settings.getByText("Setup requires attention", { exact: true }),
    ).toBeVisible();
  };
  await expectDaemonReadiness();
  await expect(repositories.getByTestId("add-repository-form")).toHaveCount(0);
  await expectDaemonReadiness();
  await repositories.getByRole("button", { name: "Add repository" }).click();
  await expect(repositories.getByTestId("add-repository-form")).toBeVisible();
  await expect(settings.getByText("Ready for productive work", { exact: true })).toHaveCount(0);
  await expect(repositories.getByText("Order does not create or initialize repositories here.")).toBeVisible();
  await repositories.getByRole("button", { name: "Cancel add repository" }).click();
  await expect(repositories.getByTestId("add-repository-form")).toHaveCount(0);

  const repositoryTable = repositories.getByRole("table", {
    name: "Connected repositories",
  });
  const repositoryRow = repositoryTable.getByRole("row").nth(1);
  await expect(repositoryRow).toBeVisible();
  await expect(repositoryRow).toContainText(repositoryRoot);
  await expect(repositoryRow).toContainText("docs/order/work-items");
  await expect(repositories.getByRole("button", { name: "Technical details", exact: true })).toHaveCount(0);
  const settingsDiagnostics = settings.getByRole("button", { name: "Settings diagnostics", exact: true });
  await settingsDiagnostics.click();
  await expect(settings.getByTestId("settings-diagnostics")).toBeVisible();
  await expect(settings.getByTestId("settings-diagnostics")).toContainText("Manifest SHA-256");
  await settingsDiagnostics.click();
  const moveDocuments = repositoryRow.getByRole("button", { name: /^Move WorkItem documents for / });
  await moveDocuments.click();
  const movePanel = repositories.getByTestId("move-workitem-documents");
  await expect(movePanel).toContainText("Current repository-relative root");
  await expect(movePanel).toContainText("docs/order/work-items");
  await expect(settings.getByText("Ready for productive work", { exact: true })).toHaveCount(0);
  await expect(movePanel.getByLabel("New repository-relative WorkItem document root")).toBeVisible();
  await movePanel.getByRole("button", { name: "Cancel move" }).click();
  await expect(movePanel).toHaveCount(0);
  await expectDaemonReadiness();

  const disconnectRepository = repositoryRow.getByRole("button", { name: /^Disconnect / });
  await disconnectRepository.click();
  const disconnectDialog = page.getByRole("alertdialog", { name: "Disconnect repository?" });
  await expect(disconnectDialog).toContainText("Remove only Order's connection. Repository files, WorkItem Markdown, Git history and authority documents are not deleted.");
  await expect(disconnectDialog).not.toContainText(repositoryRoot);
  await disconnectDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(repositoryRow).toBeVisible();
  await expect(disconnectRepository).toBeFocused();

  await settings.getByRole("link", { name: "Model & runtime", exact: true }).click();
  await expect(page).toHaveURL(baseURL + "/settings/model");
  await expect(page.getByTestId("settings-model")).toBeVisible();
  await expect(settings.getByText("Ready for productive work", { exact: true })).toHaveCount(0);

  await settings.getByRole("link", { name: "OpenCode", exact: true }).click();
  await expect(page).toHaveURL(baseURL + "/settings/opencode");
  await expect(page.getByTestId("settings-opencode")).toBeVisible();
  await expect(settings.getByText("Ready for productive work", { exact: true })).toHaveCount(0);

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
  await expect(panel.getByRole("table", { name: "Saved OpenCode accounts" })).toContainText("alpha@example.com");
  await expect(panel.getByRole("table", { name: "Saved OpenCode accounts" })).toContainText("beta@example.com");
  await expect(panel.getByRole("table", { name: "Saved OpenCode accounts" })).toContainText("gamma@example.com");
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
  await expect(removeDialog).toContainText("Remove the selected saved OpenCode credential from this installation.");
  await expect(removeDialog).not.toContainText("gamma@example.com");
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
  await expect(panel).toContainText("No saved OpenCode accounts");
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


test("P6 installation readiness exposes every blocker owner and OpenCode login terminal states stay bounded", async ({
  page,
  request,
}) => {
  await page.route("**/api/settings/readiness", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ready: false,
        blockers: [
          "REPOSITORY_REQUIRED",
          "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION",
          "MODEL_INVALID",
          "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION",
          "OPENCODE_ACCOUNT_REQUIRED",
        ],
      }),
    });
  });
  await authenticate(page, request);

  const readiness = page.getByText("Setup requires attention", { exact: true }).first();
  await expect(readiness).toBeVisible();
  for (const label of [
    "Target repository required",
    "Repository configuration needs attention",
    "Reference-root configuration needs attention",
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Open Repositories", exact: true })).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Open Model & runtime", exact: true }))
    .toHaveAttribute("href", "/settings/model");
  await expect(page.getByRole("link", { name: "Open OpenCode accounts", exact: true }))
    .toHaveAttribute("href", "/settings/opencode");
  await page.unroute("**/api/settings/readiness");

  let terminalStatus: "FAILED" | "EXPIRED" | "CANCELLED" = "FAILED";
  let attempt = 0;
  await page.route("**/api/opencode/accounts**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === "/api/opencode/accounts" && req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: [], activeAccountId: null, mutationBlockers: [] }),
      });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login" && req.method() === "POST") {
      attempt += 1;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "00000000-0000-4000-8000-" + String(attempt).padStart(12, "0"),
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-18T04:00:00.000Z",
          status: "PENDING",
          message: null,
        }),
      });
      return;
    }
    if (/\/api\/opencode\/accounts\/login\/.+/.test(url.pathname) && req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: url.pathname.split("/").at(-1),
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-18T04:00:00.000Z",
          status: terminalStatus,
          message: terminalStatus === "FAILED" ? "Provider rejected sign-in." : null,
        }),
      });
      return;
    }
    await route.fallback();
  });

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("link", { name: "OpenCode", exact: true }).click();
  const panel = page.getByTestId("settings-opencode");
  for (const [status, text] of [
    ["FAILED", "Provider rejected sign-in."],
    ["EXPIRED", "OpenCode sign-in expired."],
    ["CANCELLED", "OpenCode sign-in cancelled."],
  ] as const) {
    terminalStatus = status;
    await panel.getByRole("button", { name: "Add account" }).click();
    await panel.getByLabel("Account label").fill(status.toLowerCase() + "@example.com");
    await panel.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();
    await expect(panel.getByTestId("opencode-login-attempt")).toContainText(text, { timeout: 5_000 });
    await panel.getByRole("button", { name: "Done" }).click();
  }
  await page.unroute("**/api/opencode/accounts**");
});

test("CodeMirror editor preserves exact source, formats Markdown, previews one buffer, and follows the Order theme", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");

  const editor = await openMarkdownEditor(page, "Implementation plan document Markdown source");
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
  await expect(headingToken).toHaveCSS("color", "rgb(15, 23, 42)");

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(cm).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(gutter).toHaveCSS("background-color", "rgb(23, 34, 51)");
  await expect(headingToken).toHaveCSS("color", "rgb(237, 243, 250)");

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
        staleAuthorityOwner: null,
      }),
    });
  });
  await page.reload();

  await expect(page.getByText("Documentation changed; review the current state and retry."))
    .toBeVisible();
  await expect(page.getByText("Local browser session required")).toBeVisible();

  await page.unroute("**/api/work-items");
});

test("Approval consumes the real typed stale authority owner and returns to the exact canonical owner", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const workItem = await workItemForTitle(page, "Stale approval recovery");

  await openWorkItem(page, "Stale approval recovery");
  const review = page.getByTestId("review-workspace");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(review).toContainText("Package stale");
  await expect(review).toContainText("Approval authority is stale");
  await expect(review).toContainText(
    "Return workflow ownership to Implementation plan before continuing.",
  );

  const reconcile = page.getByRole("button", {
    name: "Return to Implementation plan",
  });
  await expect(reconcile).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign off exact package" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Package material", exact: true }))
    .toBeVisible();
  await openDisclosureResource(
    page,
    "Package material",
    "Open Implementation plan",
  );
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" }))
    .toHaveCount(0);
  await openDisclosureResource(
    page,
    "Package material",
    "Open approval overview",
  );
  await expect(page.getByTestId("review-workspace")).toContainText(
    "Package no longer current",
  );

  const responseObserved = page.waitForResponse((candidate) =>
    candidate.request().method() === "POST" &&
    candidate.url().endsWith(
      `/api/work-items/${encodeURIComponent(workItem.id)}/reconcile-authority`,
    ));
  await reconcile.click();
  const reconcileResponse = await responseObserved;
  expect(reconcileResponse.status()).toBe(200);
  expect(WorkItemSchema.parse(await reconcileResponse.json()).stage).toBe("PLAN");

  await expect(
    page.getByTestId("workflow-rail").getByRole("button", {
      name: "Implementation plan",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("workflow-step-summary")).toContainText(
    "Implementation plan",
  );

  await selectWorkflowStep(page, "Approval");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Return to Implementation plan", exact: true })).toBeVisible();
  await expect(page.getByTestId("review-workspace")).toContainText(
    "Sign-off not completed · workflow returned upstream",
  );
  await expect(page.getByTestId("review-workspace")).toContainText(
    "no sign-off authority was created",
  );
  await expect(
    page.getByRole("button", { name: "Sign off exact package" }),
  ).toHaveCount(0);
});

test("valid external Work request drift keeps source reconciliation distinct from Approval authority reconciliation", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const workItem = await workItemForTitle(page, "Awaiting sign-off");
  const sourceResponse = await page.context().request.get(
    `/api/work-items/${encodeURIComponent(workItem.id)}/source`,
  );
  expect(sourceResponse.status()).toBe(200);
  const source = WorkItemSourceSnapshotSchema.parse(await sourceResponse.json());
  const sourcePath =
    `**/api/work-items/${encodeURIComponent(workItem.id)}/source`;

  await page.route(sourcePath, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...source,
        sha256: `sha256:${"f".repeat(64)}`,
      }),
    });
  });

  let sourceReconcileCalled = false;
  await page.route("**/api/work-item-sources/reconcile", async (route) => {
    sourceReconcileCalled = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        registered: [],
        updated: [workItem.id],
        unchanged: [],
        diagnostics: [],
      }),
    });
  });

  let authorityReconcileCalled = false;
  await page.route(
    `**/api/work-items/${encodeURIComponent(workItem.id)}/reconcile-authority`,
    async (route) => {
      authorityReconcileCalled = true;
      await route.abort();
    },
  );

  await openWorkItem(page, "Awaiting sign-off");
  const review = page.getByTestId("review-workspace");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(review).toContainText("Work request source changed");
  const reconcile = page.getByRole("button", {
    name: "Reconcile source authority",
  });
  await expect(reconcile).toBeVisible();
  const staleSignoff = page.getByRole("button", {
    name: "Sign off exact package",
  });
  if (await staleSignoff.count()) {
    await expect(staleSignoff).toBeDisabled();
  }
  await reconcile.click();
  await expect.poll(() => sourceReconcileCalled).toBe(true);
  expect(authorityReconcileCalled).toBe(false);

  await page.unroute(sourcePath);
  await page.unroute("**/api/work-item-sources/reconcile");
  await page.unroute(
    `**/api/work-items/${encodeURIComponent(workItem.id)}/reconcile-authority`,
  );
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
  await expect(page.getByTestId("source-diagnostics")).not.toContainText("INVALID_SOURCE");
  await expect(page.getByTestId("source-diagnostics")).toContainText("work-request.md");
  await expect(page.getByTestId("source-diagnostics")).toContainText(
    "WorkItem source must begin with ---",
  );
  await page.getByRole("button", { name: "Refresh sources" }).click();
  await expect(page.getByTestId("source-diagnostics")).not.toContainText("INVALID_SOURCE");
  await expect(page.getByTestId("source-diagnostics")).toContainText("work-request.md");

  const proposalItem = await workItemForTitle(page, "Proposal review");
  const proposalRow = rowFor(page, "Proposal review");
  await expect(
    proposalRow.getByRole("button", { name: /Copy work item id/ }),
  ).toHaveCount(0);

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
  await expect(context.getByRole("heading", { name: "WorkItem identity", exact: true })).toBeVisible();
  await expect(context.getByRole("button", { name: "WorkItem technical details" })).toHaveCount(0);
  await expect(context).toContainText(proposalItem.id);
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(context.locator(
    '[data-testid="workflow-step-frame"], [data-testid="stage-run-material"], [data-testid="lifecycle-document-material"], [data-testid="review-workspace"], [data-testid="execution-workspace"]',
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
  await expect(createDialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await createDialog.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await createDialog.getByRole("radio", { name: "Change" }).click();
  await createDialog.getByLabel("Title").fill("Created in browser");
  await createDialog.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await createDialog.getByRole("button", { name: "Create work item" }).click();

  await expect(page.getByTestId("work-item-heading")).toHaveText("Created in browser");
  await backToQueue(page);
  await expect(rowFor(page, "Created in browser")).toContainText("browser");

  expect(websocketUrls).toEqual([]);
  expect(eventStreamUrls).toEqual([]);
});


test("rendered acceptance phase 1 captures Queue and Create WorkItem", async ({
  page,
  request,
}) => {
  test.skip(
    renderedAcceptanceDir === undefined,
    "rendered acceptance capture runs only in its GitHub Actions evidence step",
  );

  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push("console: " + message.text());
  });

  await page.route("**/api/opencode/accounts", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accounts: [{
          id: "cred_rendered_acceptance",
          label: "operator@example.com",
          active: true,
          status: { status: "READY" },
        }],
        activeAccountId: "cred_rendered_acceptance",
        mutationBlockers: [],
      }),
    });
  });
  await page.route("**/api/work-item-sources/diagnostics", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(page.getByTestId("opencode-account-trigger")).toContainText(
    "operator@example.com",
  );

  const entries: RenderedAcceptanceEntry[] = [];

  entries.push(await captureRenderedAcceptance(page, {
    id: "application-wide-light-active-account",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "active-account-visible",
    fixture: "application shell with deterministic active OpenCode account",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    references: [
      "docs/references/workbench-ui/queue.svg",
      "docs/references/workbench-ui/application-notices-states.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-INSTALLATION-READINESS",
    ],
  }));

  await page.route("**/api/settings/readiness", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ready: false,
        blockers: ["REPOSITORY_REQUIRED", "OPENCODE_ACCOUNT_REQUIRED"],
      }),
    });
  });
  await page.reload();
  await expect(page.getByTestId("installation-readiness")).toBeVisible();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  entries.push(await captureRenderedAcceptance(page, {
    id: "application-wide-light-installation-readiness",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "installation-readiness-blocked",
    fixture: "application shell with deterministic readiness blockers",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    references: [
      "docs/references/workbench-ui/installation-readiness.svg",
      "docs/references/workbench-ui/application-notices-states.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-INSTALLATION-READINESS",
    ],
  }));
  await page.unroute("**/api/settings/readiness");
  await page.reload();

  await page.unroute("**/api/work-item-sources/diagnostics");
  await page.route("**/api/work-item-sources/diagnostics", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        projectId: "order-e2e",
        path: "docs/order/work-items/broken/work-request.md",
        workItemId: null,
        code: "INVALID_SOURCE",
        detail: "The WorkItem source could not be parsed.",
      }]),
    });
  });
  await page.reload();
  const diagnostics = page.getByTestId("source-diagnostics");
  await expect(diagnostics).toBeVisible();
  await expect(diagnostics).toContainText("docs/order/work-items/broken/work-request.md");
  await expect(diagnostics).toContainText("The WorkItem source could not be parsed.");
  await expect(diagnostics).not.toContainText("INVALID_SOURCE");
  entries.push(await captureRenderedAcceptance(page, {
    id: "queue-wide-light-source-diagnostic",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "source-diagnostic-human-recovery",
    fixture: "deterministic invalid WorkItem source diagnostic",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    references: [
      "docs/references/workbench-ui/queue-states.svg",
      "docs/references/workbench-ui/application-notices-states.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }));
  await page.unroute("**/api/work-item-sources/diagnostics");
  await page.route("**/api/work-item-sources/diagnostics", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.reload();
  const queue = page.getByTestId("work-item-queue");
  await expect(queue.locator(".order-workbench-surface-attention")).toHaveCount(0);
  await expect(queue.getByRole("heading", { name: "Work items", exact: true })).toBeVisible();
  entries.push(await captureRenderedAcceptance(page, {
    id: "queue-wide-light-populated",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "active-list-populated-attention-absent",
    fixture: "order-e2e populated queue",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    references: [
      "docs/references/workbench-ui/queue.svg",
      "docs/references/workbench-ui/queue-states.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }));

  await page.route("**/api/work-items**", async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== "GET" || url.pathname !== "/api/work-items") {
      await route.fallback();
      return;
    }
    const upstream = await route.fetch();
    const rows = WorkItemSchema.array().parse(await upstream.json());
    const template = rows[0];
    if (template === undefined) {
      throw new Error("rendered Queue archived state requires one WorkItem fixture");
    }
    const archived = WorkItemSchema.parse({
      ...template,
      id: "work_c1a55e11-7ae0-4aac-9f0c-d5ff82f5c629",
      title: "Rendered archived work item",
      archived: true,
    });
    await route.fulfill({
      status: upstream.status(),
      contentType: "application/json",
      body: JSON.stringify([
        ...rows,
        ...(url.searchParams.get("includeArchived") === "true" ? [archived] : []),
      ]),
    });
  });
  await page.getByRole("button", { name: "Show archived" }).click();
  const archivedSearch = page.getByLabel("Search work items");
  await archivedSearch.fill("Rendered archived work item");
  const archivedRow = rowFor(page, "Rendered archived work item");
  await expect(archivedRow).toContainText("Archived");
  await expect(archivedRow.getByRole("button", {
    name: "Restore Rendered archived work item",
  })).toBeVisible();
  entries.push(await captureRenderedAcceptance(page, {
    id: "queue-wide-light-archived",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "archived-visible",
    fixture: "deterministic archived WorkItem filtered for explicit archived-state review",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    references: ["docs/references/workbench-ui/queue-states.svg"],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }));
  await archivedSearch.fill("");
  await page.getByRole("button", { name: "Hide archived" }).click();
  await page.unroute("**/api/work-items**");

  const noMatchSearch = page.getByLabel("Search work items");
  await noMatchSearch.fill("no rendered acceptance match");
  await expect(page.getByText("No matching work items", { exact: true })).toBeVisible();
  entries.push(await captureRenderedAcceptance(page, {
    id: "queue-wide-light-no-matches",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "no-search-matches",
    fixture: "order-e2e queue filtered to no matches",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    references: ["docs/references/workbench-ui/queue-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }));
  await noMatchSearch.fill("");
  await page.setViewportSize({ width: 700, height: 800 });
  await expect(queue).toBeVisible();
  await expect(queue.locator(".order-workbench-surface-attention")).toHaveCount(0);
  const narrowQueueTable = page.getByRole("table", { name: "Work items" });
  await expect(narrowQueueTable).toHaveCSS("table-layout", "auto");
  const concernsHeader = narrowQueueTable.getByRole("columnheader", { name: "Concerns" });
  await expect(concernsHeader).toBeVisible();
  await expect(concernsHeader).toHaveCSS("text-overflow", "clip");
  await expect(concernsHeader).toHaveCSS("white-space", "normal");
  const narrowCellWrapping = await narrowQueueTable.locator("tbody td").evaluateAll((cells) =>
    cells.map((cell) => {
      const style = getComputedStyle(cell);
      return { wordBreak: style.wordBreak, overflowWrap: style.overflowWrap };
    }),
  );
  expect(narrowCellWrapping.length).toBeGreaterThan(0);
  expect(narrowCellWrapping.every((style) =>
    style.wordBreak === "normal" && style.overflowWrap === "normal"
  )).toBe(true);
  entries.push(await captureRenderedAcceptance(page, {
    id: "queue-narrow-light-populated",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "active-list-populated-narrow-attention-absent",
    fixture: "order-e2e populated queue",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: "/",
    references: [
      "docs/references/workbench-ui/queue.svg",
      "docs/references/workbench-ui/responsive-composition.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  entries.push(await captureRenderedAcceptance(page, {
    id: "application-queue-wide-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "queue-dark-theme-parity",
    fixture: "order-e2e populated queue",
    viewport: { width: 1440, height: 900 },
    theme: "Dark",
    route: "/",
    references: [
      "docs/references/workbench-ui/queue.svg",
      "docs/references/workbench-ui/theme-parity.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-THEME-V1",
    ],
  }));
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "New work item" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  await expect(createDialog).toBeVisible();
  const createPanel = createDialog.locator(".order-workbench-task-panel");
  const createHeader = createPanel.locator(".order-workbench-task-panel-header");
  const createBody = createPanel.locator(".order-workbench-task-panel-body");
  const createFooter = createPanel.locator(".order-workbench-task-panel-footer");
  await expect(createHeader).toBeVisible();
  await expect(createBody).toBeVisible();
  await expect(createFooter).toBeVisible();
  await expect(createFooter.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await expect(createFooter.getByRole("button", { name: "Create work item", exact: true })).toBeVisible();
  await expect(createBody.getByRole("button", { name: "Create work item", exact: true })).toHaveCount(0);
  await createDialog.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await createDialog.getByRole("radio", { name: "Change" }).click();
  await expect(createDialog.getByTestId("create-work-item-location")).toContainText(
    "docs/order/work-items",
  );
  await expect(createDialog).not.toContainText(/(?:change|defect|investigation|audit)-v\d/i);
  await createDialog.getByLabel("Title").fill("Rendered acceptance change");
  await createDialog.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await expect(createDialog.getByLabel("Title")).toHaveValue("Rendered acceptance change");
  entries.push(await captureRenderedAcceptance(page, {
    id: "create-work-item-wide-light-change",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CREATE-001",
    state: "ordinary-change-populated",
    fixture: "Create WorkItem deterministic CHANGE input",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: "/",
    captureScope: "production Create dialog only",
    references: ["docs/references/workbench-ui/create-work-item.svg"],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }, createDialog));
  await createDialog.getByRole("button", { name: "Cancel", exact: true }).click();

  await openWorkItem(page, "Completed investigation");
  const completedInvestigation = await workItemForTitle(page, "Completed investigation");
  await page.getByRole("button", { name: "Create linked remediation" }).click();
  const linkedDialog = page.getByRole("dialog", { name: "Create linked remediation" });
  await expect(linkedDialog).toBeVisible();
  await linkedDialog.getByRole("radio", { name: "Defect" }).click();
  await linkedDialog.getByLabel("Title").fill("Rendered acceptance remediation");
  await expect(linkedDialog).toContainText("Completed parent Investigation · same project");
  await expect(linkedDialog).not.toContainText(completedInvestigation.id);
  entries.push(await captureRenderedAcceptance(page, {
    id: "create-linked-remediation-wide-light",
    workItemKind: "DEFECT",
    workflowStep: "Complete",
    surface: "SURF-CREATE-001",
    state: "linked-remediation",
    fixture: "Completed investigation linked-remediation creation",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production linked-remediation dialog only; terminal descendant excluded",
    references: ["docs/references/workbench-ui/create-linked-remediation.svg"],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM",
    ],
  }, linkedDialog));
  await linkedDialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await backToQueue(page);

  await openWorkItem(page, "Change work type");
  await expect(page.getByTestId("workbench-workitem-shell")).toBeVisible();
  await expect(page.getByTestId("workflow-rail")).toBeVisible();
  const shellChrome = page.locator(".order-workbench-chrome");
  const currentAttention = page.getByTestId("workflow-step-summary");
  await expect(shellChrome).toBeVisible();
  await expect(currentAttention).toBeVisible();
  await expect(currentAttention).toContainText("Work request");

  entries.push(await captureRenderedAcceptance(page, {
    id: "workitem-shell-wide-light-chrome",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-chrome",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production WorkItem identity + workflow rail only",
    references: [
      "docs/references/workbench-ui/workitem-shell-controls.svg",
      "docs/references/workbench-ui/responsive-composition.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
      "GW-DOC-WORKBENCH-THEME-V1",
    ],
  }, shellChrome));

  entries.push(await captureRenderedAcceptance(page, {
    id: "workitem-shell-wide-light-current-attention",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "current-work-request-attention",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production current-attention region only",
    references: ["docs/references/workbench-ui/current-attention-states.svg"],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, currentAttention));

  await page.getByRole("button", { name: "Context", exact: true }).click();
  const context = page.getByTestId("work-item-context");
  await expect(context).toBeVisible();
  await expect(context.getByRole("heading", { name: "WorkItem identity", exact: true })).toBeVisible();
  entries.push(await captureRenderedAcceptance(page, {
    id: "workitem-context-wide-light-selected-workitem",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-CONTEXT-001",
    state: "selected-workitem-technical-inspection",
    fixture: "Change work type explicit WorkItem Context",
    viewport: { width: 1440, height: 900 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production WorkItem Context panel only",
    references: ["docs/references/workbench-ui/workitem-context.svg"],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, context));
  await page.getByRole("button", { name: "Close context", exact: true }).click();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("workbench-workitem-shell")).toHaveAttribute(
    "data-responsive-class",
    "narrow",
  );
  entries.push(await captureRenderedAcceptance(page, {
    id: "workitem-shell-narrow-light-chrome",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-chrome-narrow",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production WorkItem identity + workflow rail only",
    references: [
      "docs/references/workbench-ui/workitem-shell-controls.svg",
      "docs/references/workbench-ui/responsive-composition.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, shellChrome));
  entries.push(await captureRenderedAcceptance(page, {
    id: "workitem-shell-narrow-light-current-attention",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "current-work-request-attention-narrow",
    fixture: "Change work type selected WorkItem",
    viewport: { width: 700, height: 800 },
    theme: "Light",
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    captureScope: "production current-attention region only",
    references: [
      "docs/references/workbench-ui/current-attention-states.svg",
      "docs/references/workbench-ui/responsive-composition.svg",
    ],
    authorityRefs: [
      "GW-DOC-WORKBENCH-UX",
      "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
    ],
  }, currentAttention));

  writeRenderedAcceptanceEvidence(entries);
  expect([...new Set(entries.map((entry) => entry.surface))].sort()).toEqual([
    "SURF-APP-001",
    "SURF-CREATE-001",
    "SURF-QUEUE-001",
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
  ]);
  expect(runtimeErrors).toEqual([]);
});


test("rendered acceptance IA26 captures downstream Workbench", async ({
  page,
  request,
}) => {
  test.skip(
    renderedAcceptanceDir === undefined,
    "IA26 rendered acceptance runs only in its GitHub Actions evidence step",
  );
  test.setTimeout(180_000);

  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push("console: " + message.text());
  });

  let loginStatus: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED" = "PENDING";
  const loginAttemptId = "00000000-0000-4000-8000-00000000a026";
  const accountState = OpenCodeAccountStateSchema.parse({
    accounts: [
      { id: "cred_ia26_alpha", label: "alpha@example.com", active: true, status: { status: "READY" } },
      { id: "cred_ia26_beta", label: "beta@example.com", active: false, status: { status: "READY" } },
    ],
    activeAccountId: "cred_ia26_alpha",
    mutationBlockers: [],
  });
  await page.route("**/api/opencode/accounts**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === "/api/opencode/accounts" && req.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(accountState) });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login" && req.method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: loginAttemptId,
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-24T04:00:00.000Z",
          status: "PENDING",
          message: null,
        }),
      });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login/" + loginAttemptId && req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: loginAttemptId,
          authorizationUrl: "https://opencode.ai/console/device",
          instructions: "Open the verification page and continue.",
          expiresAt: "2026-11-24T04:00:00.000Z",
          status: loginStatus,
          message: loginStatus === "FAILED" ? "Provider rejected sign-in." : null,
        }),
      });
      return;
    }
    if (url.pathname === "/api/opencode/accounts/login/" + loginAttemptId && req.method() === "DELETE") {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fallback();
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await authenticate(page, request);
  await page.getByRole("radio", { name: "Light" }).click();

  const entries: RenderedAcceptanceEntry[] = [];
  const routeValue = (): string => {
    const url = new URL(page.url());
    return url.pathname + url.search;
  };
  const capture = async (
    entry: Omit<RenderedAcceptanceEntry, "screenshot">,
    target?: Locator,
  ): Promise<void> => {
    entries.push(await captureRenderedAcceptance(page, entry, target));
  };
  const light = { width: 1440, height: 900 } as const;
  const narrow = { width: 700, height: 800 } as const;

  // IA34 — Settings and OpenCode, including the two destructive confirmations.
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const settings = page.getByTestId("settings-workspace");
  const repositories = page.getByTestId("settings-repositories");
  await expect(settings).toBeVisible();
  await expect(repositories).toBeVisible();
  await capture({
    id: "ia26-settings-frame-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-001",
    state: "repositories-current-diagnostics-closed",
    fixture: "deterministic installation Settings",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-repositories.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-INSTALLATION-READINESS"],
  }, settings);
  await capture({
    id: "ia26-settings-repositories-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-REPO-001",
    state: "connected-repository-inventory",
    fixture: "order-e2e connected repository",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-repositories.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-PROJECT-GOVERNANCE-INTEGRATION"],
  }, repositories);

  await repositories.getByRole("button", { name: "Add repository" }).click();
  const addRepository = repositories.getByTestId("add-repository-form");
  await expect(addRepository).toBeVisible();
  await capture({
    id: "ia26-settings-repository-add-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-REPO-ADD-001",
    state: "bounded-add-repository-task",
    fixture: "repository add task",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-repository-add.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, addRepository);
  await addRepository.getByRole("button", { name: "Cancel add repository" }).click();

  const repositoryTable = repositories.getByRole("table", { name: "Connected repositories" });
  const repositoryRow = repositoryTable.getByRole("row").nth(1);
  await repositoryRow.getByRole("button", { name: /^Move WorkItem documents for / }).click();
  const moveDocuments = repositories.getByTestId("move-workitem-documents");
  await capture({
    id: "ia26-settings-repository-move-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-REPO-MOVE-001",
    state: "bounded-document-root-migration",
    fixture: "repository document-root move task",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-repository-move.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
  }, moveDocuments);
  await moveDocuments.getByRole("button", { name: "Cancel move" }).click();

  await repositoryRow.getByRole("button", { name: /^Disconnect / }).click();
  const disconnect = page.getByRole("alertdialog", { name: "Disconnect repository?" });
  await capture({
    id: "ia26-confirm-repository-disconnect-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-CONF-REPO-DISCONNECT-001",
    state: "destructive-confirmation",
    fixture: "connected repository disconnect confirmation",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, disconnect);
  await disconnect.getByRole("button", { name: "Cancel" }).click();

  await settings.getByRole("link", { name: "OpenCode", exact: true }).click();
  const openCode = page.getByTestId("settings-opencode");
  await expect(openCode).toBeVisible();
  await capture({
    id: "ia26-settings-opencode-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-001",
    state: "saved-account-inventory",
    fixture: "two deterministic saved OpenCode accounts",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-opencode.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, openCode);

  await openCode.getByRole("button", { name: "Rename beta@example.com" }).click();
  const renameAccount = page.getByTestId("rename-opencode-account");
  await capture({
    id: "ia26-settings-opencode-rename-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-RENAME-001",
    state: "bounded-rename-task",
    fixture: "saved OpenCode account rename",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-opencode-rename.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, renameAccount);
  await renameAccount.getByRole("button", { name: "Cancel rename" }).click();

  await openCode.getByRole("button", { name: "Remove beta@example.com" }).click();
  const removeAccount = page.getByRole("alertdialog", { name: "Remove saved OpenCode account?" });
  await capture({
    id: "ia26-confirm-opencode-remove-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-CONF-OC-REMOVE-001",
    state: "destructive-confirmation",
    fixture: "saved OpenCode account removal",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, removeAccount);
  await removeAccount.getByRole("button", { name: "Cancel" }).click();

  await openCode.getByRole("button", { name: "Add account" }).click();
  const addAccount = page.getByTestId("add-opencode-account");
  await capture({
    id: "ia26-settings-opencode-add-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-ADD-001",
    state: "bounded-add-account-task",
    fixture: "saved OpenCode account add",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-opencode-add.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, addAccount);
  await addAccount.getByLabel("Account label").fill("ia26@example.com");
  loginStatus = "PENDING";
  await addAccount.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();
  const loginAttempt = page.getByTestId("opencode-login-attempt");
  await expect(loginAttempt).toContainText("Waiting for sign-in");
  await capture({
    id: "ia26-settings-opencode-login-pending-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-OC-LOGIN-001",
    state: "pending-authorization",
    fixture: "deterministic pending OpenCode login",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: [
      "docs/references/workbench-ui/settings-opencode-login.svg",
      "docs/references/workbench-ui/settings-opencode-login-states.svg",
    ],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, loginAttempt);
  await loginAttempt.getByRole("button", { name: "Cancel OpenCode sign-in" }).click();
  await expect(openCode.getByRole("button", { name: "Add account" })).toBeVisible();

  for (const [status, label] of [
    ["COMPLETED", "sign-in-complete"],
    ["FAILED", "sign-in-failed"],
    ["EXPIRED", "sign-in-expired"],
    ["CANCELLED", "sign-in-cancelled"],
  ] as const) {
    loginStatus = status;
    await openCode.getByRole("button", { name: "Add account" }).click();
    await openCode.getByLabel("Account label").fill("ia26-" + status.toLowerCase() + "@example.com");
    await openCode.getByRole("button", { name: "Continue to OpenCode sign-in" }).click();
    const terminalLogin = page.getByTestId("opencode-login-attempt");
    await expect(terminalLogin.getByRole("button", { name: "Done" })).toBeVisible({ timeout: 5_000 });
    await capture({
      id: "ia26-settings-opencode-login-" + status.toLowerCase() + "-wide-light",
      workItemKind: "QUEUE",
      workflowStep: null,
      surface: "SURF-SET-OC-LOGIN-001",
      state: label,
      fixture: "deterministic " + status.toLowerCase() + " OpenCode login",
      viewport: light,
      theme: "Light",
      route: routeValue(),
      references: ["docs/references/workbench-ui/settings-opencode-login-states.svg"],
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
    }, terminalLogin);
    await terminalLogin.getByRole("button", { name: "Done" }).click();
  }

  await settings.getByRole("link", { name: "Model & runtime", exact: true }).click();
  const modelSettings = page.getByTestId("settings-model");
  await capture({
    id: "ia26-settings-model-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-MODEL-001",
    state: "configured-model-task",
    fixture: "deterministic model/runtime settings",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-model.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-OPENCODE-INTEGRATION-V1"],
  }, modelSettings);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-settings-model-wide-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-MODEL-001",
    state: "configured-model-task-dark",
    fixture: "deterministic model/runtime settings",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-model.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, modelSettings);
  await page.getByRole("radio", { name: "Light" }).click();

  const diagnosticsToggle = settings.getByRole("button", { name: "Settings diagnostics", exact: true });
  await diagnosticsToggle.click();
  await capture({
    id: "ia26-settings-diagnostics-model-wide-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-001",
    state: "explicit-settings-diagnostics",
    fixture: "model settings explicit diagnostics",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/settings-model.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("settings-diagnostics"));
  await diagnosticsToggle.click();

  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-settings-model-narrow-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-SET-MODEL-001",
    state: "configured-model-task-narrow",
    fixture: "deterministic model/runtime settings",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    references: [
      "docs/references/workbench-ui/settings-model.svg",
      "docs/references/workbench-ui/responsive-composition.svg",
    ],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  }, settings);
  await page.setViewportSize(light);

  // IA29 — Work request, document materials, and safety confirmations.
  await page.goto("/");
  await openWorkItem(page, "Source editing workbench");
  await selectWorkflowStep(page, "Work request");
  const sourceMaterial = page.getByTestId("source-document-material");
  await capture({
    id: "ia26-work-request-step-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-STEP-WR-001",
    state: "source-selected",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/work-request.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-MARKDOWN-WORKBENCH-V1"],
  });
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-work-request-step-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-STEP-WR-001",
    state: "source-selected-narrow",
    fixture: "Source editing workbench",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/work-request.svg", "docs/references/workbench-ui/responsive-composition.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  });
  await page.setViewportSize({ width: 1000, height: 800 });
  await capture({
    id: "ia26-workitem-medium-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-medium",
    fixture: "Source editing workbench",
    viewport: { width: 1000, height: 800 },
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/workitem-shell-controls.svg", "docs/references/workbench-ui/responsive-composition.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
  });
  await page.setViewportSize(light);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-work-request-step-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-STEP-WR-001",
    state: "source-selected-dark",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/work-request.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  });
  await capture({
    id: "ia26-workitem-shell-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-001",
    state: "selected-workitem-shell-dark",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/workitem-shell-controls.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.locator(".order-workbench-chrome"));
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await capture({
    id: "ia26-context-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-WI-CONTEXT-001",
    state: "explicit-technical-context-dark",
    fixture: "Source editing workbench",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/workitem-context.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.getByTestId("work-item-context"));
  await page.getByRole("button", { name: "Close context", exact: true }).click();
  await page.getByRole("radio", { name: "Light" }).click();
  await capture({
    id: "ia26-source-document-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "read-view",
    fixture: "Source editing workbench canonical source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production source document material",
    references: ["docs/references/workbench-ui/document-authoring.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
  }, sourceMaterial);

  const sourceEditor = await openMarkdownEditor(page, "WorkItem source Markdown source");
  await capture({
    id: "ia26-source-document-editor-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "active-editor",
    fixture: "Source editing workbench active source editor",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/document-authoring.svg", "docs/references/workbench-ui/document-states.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, page.locator("form.order-markdown-editor"));
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-source-document-editor-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-MAT-SOURCE-001",
    state: "active-editor-dark",
    fixture: "Source editing workbench active source editor",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/document-authoring.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.locator("form.order-markdown-editor"));
  await page.getByRole("radio", { name: "Light" }).click();

  const sourceText = await markdownSourceValue(sourceEditor);
  await replaceMarkdownSource(page, sourceEditor, sourceText + "\nIA26 unsaved material\n");
  await page.getByTestId("workflow-rail").getByRole("button", { name: "Research", exact: true }).click();
  const dirtyMaterial = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await capture({
    id: "ia26-confirm-dirty-material-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-DIRTY-MATERIAL-001",
    state: "dirty-material-navigation",
    fixture: "unsaved Work request source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, dirtyMaterial);
  await dirtyMaterial.getByRole("button", { name: "Cancel", exact: true }).click();

  await page.getByRole("link", { name: "Back to queue" }).click();
  const dirtyDestination = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await capture({
    id: "ia26-confirm-dirty-destination-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-DIRTY-DEST-001",
    state: "dirty-destination-navigation",
    fixture: "unsaved Work request source",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, dirtyDestination);
  await dirtyDestination.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await backToQueue(page);
  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");
  const planEditor = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  await capture({
    id: "ia26-lifecycle-document-editor-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-DOC-001",
    state: "active-editor",
    fixture: "Lifecycle editing workbench Plan editor",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/document-authoring.svg", "docs/references/workbench-ui/document-states.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, page.locator("form.order-markdown-editor"));
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await selectWorkflowStep(page, "Readiness review");
  const readOnlyMaterial = page.getByTestId("markdown-readonly").first();
  await expect(readOnlyMaterial).toBeVisible();
  await capture({
    id: "ia26-lifecycle-document-readonly-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-MAT-DOC-RO-001",
    state: "read-only-governed-document",
    fixture: "Lifecycle editing workbench R3 material",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/document-readonly.svg", "docs/references/workbench-ui/document-states.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, readOnlyMaterial);

  await backToQueue(page);
  await page.getByRole("radio", { name: "Dark" }).click();
  await page.getByRole("button", { name: "New work item" }).click();
  const create = page.getByRole("dialog", { name: "Create work item" });
  await create.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await create.getByRole("radio", { name: "Change" }).click();
  await create.getByLabel("Title").fill("IA26 confirmation fixture");
  await create.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await capture({
    id: "ia26-create-workitem-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CREATE-001",
    state: "ordinary-change-populated-dark",
    fixture: "IA26 confirmation fixture Create task",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    captureScope: "production Create dialog only",
    references: ["docs/references/workbench-ui/create-work-item.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, create);
  await create.getByRole("button", { name: "Create work item" }).click();
  await expect(page.getByTestId("work-item-heading")).toHaveText("IA26 confirmation fixture");
  await page.getByRole("radio", { name: "Light" }).click();
  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const gitConfirm = page.getByRole("dialog", { name: "Save WorkItem documentation to Git?" });
  await capture({
    id: "ia26-confirm-documentation-git-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-DOC-GIT-001",
    state: "exact-path-commit-confirmation",
    fixture: "new untracked WorkItem documentation",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg"],
    authorityRefs: ["GW-DOC-MARKDOWN-WORKBENCH-V1"],
  }, gitConfirm);
  await gitConfirm.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  const archiveConfirm = page.getByRole("dialog", { name: "Archive work item?" });
  await capture({
    id: "ia26-confirm-archive-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-ARCHIVE-001",
    state: "archive-confirmation",
    fixture: "IA26 confirmation fixture",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, archiveConfirm);
  await capture({
    id: "ia26-confirm-archive-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Work request",
    surface: "SURF-CONF-ARCHIVE-001",
    state: "archive-confirmation-dark",
    fixture: "IA26 confirmation fixture",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    captureScope: "production confirmation only",
    references: ["docs/references/workbench-ui/safety-confirmations.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, archiveConfirm);
  await archiveConfirm.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("radio", { name: "Light" }).click();

  // Work-kind information variants.
  await backToQueue(page);
  for (const [title, kind] of [
    ["Change work type", "CHANGE"],
    ["Defect work type", "DEFECT"],
    ["Investigation work type", "INVESTIGATION"],
    ["Audit work type", "AUDIT"],
  ] as const) {
    await openWorkItem(page, title);
    const source = page.getByTestId("source-document-material");
    await capture({
      id: "ia26-work-type-" + kind.toLowerCase() + "-source-wide-light",
      workItemKind: kind,
      workflowStep: "Work request",
      surface: "SURF-MAT-SOURCE-001",
      state: "work-type-" + kind.toLowerCase(),
      fixture: title,
      viewport: light,
      theme: "Light",
      route: routeValue(),
      references: ["docs/references/workbench-ui/work-type-variants.svg"],
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM"],
    }, source);
    await backToQueue(page);
  }

  // IA30 — productive stages, Dialogue and direct Proposal Review.
  const stageCases = [
    ["Research open continuation", "Research", "SURF-STEP-R1-001", "research.svg"],
    ["Requirements document visual", "Requirements", "SURF-STEP-R2-001", "requirements.svg"],
    ["Solution design document visual", "Solution design", "SURF-STEP-DESIGN-001", "solution-design.svg"],
    ["Implementation plan document visual", "Implementation plan", "SURF-STEP-PLAN-001", "implementation-plan.svg"],
  ] as const;
  for (const [title, step, surface, reference] of stageCases) {
    await openWorkItem(page, title);
    await selectWorkflowStep(page, step);
    await page.setViewportSize(light);
    await capture({
      id: "ia26-" + step.toLowerCase().replaceAll(" ", "-") + "-wide-light",
      workItemKind: "CHANGE",
      workflowStep: step,
      surface,
      state: "primary-wide",
      fixture: title,
      viewport: light,
      theme: "Light",
      route: routeValue(),
      references: ["docs/references/workbench-ui/" + reference],
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
    });
    await page.setViewportSize(narrow);
    await capture({
      id: "ia26-" + step.toLowerCase().replaceAll(" ", "-") + "-narrow-light",
      workItemKind: "CHANGE",
      workflowStep: step,
      surface,
      state: "primary-narrow",
      fixture: title,
      viewport: narrow,
      theme: "Light",
      route: routeValue(),
      references: ["docs/references/workbench-ui/" + reference, "docs/references/workbench-ui/responsive-composition.svg"],
      authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2"],
    });
    await page.setViewportSize(light);
    if (step === "Research") {
      const activity = page.getByTestId("activity-detail");
      await capture({
        id: "ia26-stage-dialogue-open-wide-light",
        workItemKind: "CHANGE",
        workflowStep: "Research",
        surface: "SURF-MAT-ACTIVITY-001",
        state: "open-continuation",
        fixture: title,
        viewport: light,
        theme: "Light",
        route: routeValue(),
        references: ["docs/references/workbench-ui/dialogue-states.svg", "docs/references/workbench-ui/research.svg"],
        authorityRefs: ["GW-DOC-WORKBENCH-UX"],
      }, activity);
      await page.getByRole("radio", { name: "Dark" }).click();
      await capture({
        id: "ia26-stage-dialogue-open-wide-dark",
        workItemKind: "CHANGE",
        workflowStep: "Research",
        surface: "SURF-MAT-ACTIVITY-001",
        state: "open-continuation-dark",
        fixture: title,
        viewport: light,
        theme: "Dark",
        route: routeValue(),
        references: ["docs/references/workbench-ui/dialogue-states.svg", "docs/references/workbench-ui/theme-parity.svg"],
        authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
      }, activity);
      await page.getByRole("radio", { name: "Light" }).click();
    }
    await backToQueue(page);
  }

  await openWorkItem(page, "Workflow input required");
  const requiredInputActivity = page.getByTestId("activity-detail");
  await capture({
    id: "ia26-stage-dialogue-required-input-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-ACTIVITY-001",
    state: "required-input",
    fixture: "Workflow input required",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/dialogue-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, requiredInputActivity);
  await backToQueue(page);

  await openWorkItem(page, "Proposal review");
  const proposal = page.getByTestId("proposal-review-workspace");
  await capture({
    id: "ia26-proposal-review-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "pending-decision-direct-review",
    fixture: "Proposal review",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/proposal-review.svg", "docs/references/workbench-ui/proposal-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, proposal);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-proposal-review-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "pending-decision-direct-review-dark",
    fixture: "Proposal review",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/proposal-review.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, proposal);
  await page.getByRole("radio", { name: "Light" }).click();
  await backToQueue(page);

  await openWorkItem(page, "Proposal adoption in progress");
  await capture({
    id: "ia26-proposal-review-adopting-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation plan",
    surface: "SURF-MAT-PROPOSAL-001",
    state: "adoption-in-progress",
    fixture: "Proposal adoption in progress",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/proposal-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("proposal-review-workspace"));
  await backToQueue(page);

  // IA31 — direct Readiness and Approval Review plus task detail.
  await openWorkItem(page, "Awaiting sign-off");
  await selectWorkflowStep(page, "Readiness review");
  const readinessReview = page.getByTestId("review-workspace");
  await capture({
    id: "ia26-readiness-review-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-STEP-R3-001",
    state: "ready-for-signoff-direct-review",
    fixture: "Awaiting sign-off R3",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/readiness-review.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, readinessReview);
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-readiness-review-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-STEP-R3-001",
    state: "ready-for-signoff-direct-review-narrow",
    fixture: "Awaiting sign-off R3",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/readiness-review.svg", "docs/references/workbench-ui/responsive-composition.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, readinessReview);
  await page.setViewportSize(light);

  await selectWorkflowStep(page, "Approval");
  const approval = page.getByTestId("review-workspace");
  await capture({
    id: "ia26-approval-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-STEP-APPROVAL-001",
    state: "exact-current-package-direct-review",
    fixture: "Awaiting sign-off",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/approval.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, approval);
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-approval-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-STEP-APPROVAL-001",
    state: "exact-current-package-direct-review-narrow",
    fixture: "Awaiting sign-off",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/approval.svg", "docs/references/workbench-ui/responsive-composition.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, approval);
  await page.setViewportSize(light);
  await openDisclosureResource(page, "Package material", "Inspect task: Prove the browser candidate surface");
  const approvalTask = page.getByTestId("approval-task-detail");
  await capture({
    id: "ia26-approval-task-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-MAT-APPROVAL-TASK-001",
    state: "signed-task-detail",
    fixture: "Awaiting sign-off task",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/approval-task-detail.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, approvalTask);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-approval-task-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Approval",
    surface: "SURF-MAT-APPROVAL-TASK-001",
    state: "signed-task-detail-dark",
    fixture: "Awaiting sign-off task",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/approval-task-detail.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, approvalTask);
  await page.getByRole("radio", { name: "Light" }).click();
  await backToQueue(page);

  await openWorkItem(page, "Readiness input required");
  await capture({
    id: "ia26-readiness-required-input-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Readiness review",
    surface: "SURF-STEP-R3-001",
    state: "required-input-inside-review",
    fixture: "Readiness input required",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/readiness-review.svg", "docs/references/workbench-ui/dialogue-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("review-workspace"));
  await backToQueue(page);

  // IA32 — Implementation master/detail and task detail.
  await openWorkItem(page, "Implementation action ready");
  const execution = page.getByTestId("execution-workspace");
  await capture({
    id: "ia26-implementation-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "current-task-ready",
    fixture: "Implementation action ready",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/implementation.svg", "docs/references/workbench-ui/implementation-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, execution);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-implementation-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "current-task-ready-dark",
    fixture: "Implementation action ready",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/implementation.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, execution);
  await page.getByRole("radio", { name: "Light" }).click();
  await capture({
    id: "ia26-implementation-task-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-MAT-EXEC-TASK-001",
    state: "approved-task-contract",
    fixture: "Implementation action ready",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/implementation.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("execution-task-detail"));
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-implementation-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "current-task-ready-narrow",
    fixture: "Implementation action ready",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/implementation.svg", "docs/references/workbench-ui/responsive-composition.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, execution);
  await page.setViewportSize(light);
  await backToQueue(page);

  await openWorkItem(page, "Failed implementation feedback");
  await capture({
    id: "ia26-implementation-blocked-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Implementation",
    surface: "SURF-STEP-EXEC-001",
    state: "blocked-validation-failure",
    fixture: "Failed implementation feedback",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/implementation-states.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("execution-workspace"));
  await backToQueue(page);

  // IA33 — terminal result and Evidence, both attention-free.
  await openWorkItem(page, "Verified candidate");
  const complete = page.getByTestId("result-workspace");
  await capture({
    id: "ia26-complete-candidate-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "verified-candidate",
    fixture: "Verified candidate",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/complete.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, complete);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-complete-candidate-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "verified-candidate-dark",
    fixture: "Verified candidate",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/complete.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, complete);
  await page.getByRole("radio", { name: "Light" }).click();
  await page.setViewportSize(narrow);
  await capture({
    id: "ia26-complete-candidate-narrow-light",
    workItemKind: "CHANGE",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "verified-candidate-narrow",
    fixture: "Verified candidate",
    viewport: narrow,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/complete.svg", "docs/references/workbench-ui/responsive-composition.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, complete);
  await page.setViewportSize(light);
  await backToQueue(page);

  await openWorkItem(page, "Completed investigation");
  await capture({
    id: "ia26-complete-investigation-linked-wide-light",
    workItemKind: "INVESTIGATION",
    workflowStep: "Complete",
    surface: "SURF-STEP-COMPLETE-001",
    state: "investigation-result-linked-remediation",
    fixture: "Completed investigation",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/complete-linked-remediation.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, page.getByTestId("result-workspace"));
  await backToQueue(page);

  await openWorkItem(page, "Invalid lifecycle Markdown");
  await selectWorkflowStep(page, "Research");
  await page.getByRole("button", { name: "Inspect exact bytes" }).click();
  const evidence = page.getByTestId("evidence-workspace");
  await expect(evidence).toBeVisible();
  await capture({
    id: "ia26-evidence-wide-light",
    workItemKind: "CHANGE",
    workflowStep: "Research",
    surface: "SURF-MAT-EVIDENCE-001",
    state: "exact-bytes-attention-free",
    fixture: "Invalid lifecycle Markdown exact bytes",
    viewport: light,
    theme: "Light",
    route: routeValue(),
    references: ["docs/references/workbench-ui/evidence-viewer.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX"],
  }, evidence);
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-evidence-wide-dark",
    workItemKind: "CHANGE",
    workflowStep: "Research",
    surface: "SURF-MAT-EVIDENCE-001",
    state: "exact-bytes-attention-free-dark",
    fixture: "Invalid lifecycle Markdown exact bytes",
    viewport: light,
    theme: "Dark",
    route: routeValue(),
    references: ["docs/references/workbench-ui/evidence-viewer.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, evidence);
  await page.getByRole("radio", { name: "Light" }).click();

  // Operational-scan dark representative plus System effective-scheme evidence.
  await page.goto("/");
  await page.getByRole("radio", { name: "Dark" }).click();
  await capture({
    id: "ia26-queue-wide-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-QUEUE-001",
    state: "operational-scan-dark",
    fixture: "populated Queue",
    viewport: light,
    theme: "Dark",
    route: "/",
    references: ["docs/references/workbench-ui/queue.svg", "docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-UX", "GW-DOC-WORKBENCH-THEME-V1"],
  }, page.getByTestId("work-item-queue"));
  await page.getByRole("radio", { name: "System" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await capture({
    id: "ia26-queue-system-light",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "system-theme-effective-light",
    fixture: "populated Queue",
    viewport: light,
    theme: "System/light",
    route: "/",
    references: ["docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-THEME-V1"],
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await capture({
    id: "ia26-queue-system-dark",
    workItemKind: "QUEUE",
    workflowStep: null,
    surface: "SURF-APP-001",
    state: "system-theme-effective-dark",
    fixture: "populated Queue",
    viewport: light,
    theme: "System/dark",
    route: "/",
    references: ["docs/references/workbench-ui/theme-parity.svg"],
    authorityRefs: ["GW-DOC-WORKBENCH-THEME-V1"],
  });

  writeRenderedAcceptanceEvidence(entries);

  const manifest = JSON.parse(
    readFileSync(join(renderedAcceptanceDir!, "manifest.json"), "utf8"),
  ) as { candidateSha: string; entries: RenderedAcceptanceEntry[] };
  expect(manifest.candidateSha).toBe(renderedAcceptanceCandidateSha);
  const allEntries = manifest.entries;
  const requiredSurfaces = [
    "SURF-APP-001",
    "SURF-CONF-ARCHIVE-001",
    "SURF-CONF-DIRTY-DEST-001",
    "SURF-CONF-DIRTY-MATERIAL-001",
    "SURF-CONF-DOC-GIT-001",
    "SURF-CONF-OC-REMOVE-001",
    "SURF-CONF-REPO-DISCONNECT-001",
    "SURF-CREATE-001",
    "SURF-MAT-ACTIVITY-001",
    "SURF-MAT-APPROVAL-TASK-001",
    "SURF-MAT-DOC-001",
    "SURF-MAT-DOC-RO-001",
    "SURF-MAT-EVIDENCE-001",
    "SURF-MAT-EXEC-TASK-001",
    "SURF-MAT-PROPOSAL-001",
    "SURF-MAT-SOURCE-001",
    "SURF-QUEUE-001",
    "SURF-SET-001",
    "SURF-SET-MODEL-001",
    "SURF-SET-OC-001",
    "SURF-SET-OC-ADD-001",
    "SURF-SET-OC-LOGIN-001",
    "SURF-SET-OC-RENAME-001",
    "SURF-SET-REPO-001",
    "SURF-SET-REPO-ADD-001",
    "SURF-SET-REPO-MOVE-001",
    "SURF-STEP-APPROVAL-001",
    "SURF-STEP-COMPLETE-001",
    "SURF-STEP-DESIGN-001",
    "SURF-STEP-EXEC-001",
    "SURF-STEP-PLAN-001",
    "SURF-STEP-R1-001",
    "SURF-STEP-R2-001",
    "SURF-STEP-R3-001",
    "SURF-STEP-WR-001",
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
  ].sort();
  expect([...new Set(allEntries.map((entry) => entry.surface))].sort())
    .toEqual(requiredSurfaces);

  for (const step of [
    "Work request",
    "Research",
    "Requirements",
    "Solution design",
    "Implementation plan",
    "Readiness review",
    "Approval",
    "Implementation",
    "Complete",
  ]) {
    expect(allEntries.some((entry) =>
      entry.workflowStep === step &&
      entry.viewport.width === 1440 &&
      entry.theme === "Light"
    )).toBe(true);
    expect(allEntries.some((entry) =>
      entry.workflowStep === step &&
      entry.viewport.width === 700 &&
      entry.theme === "Light"
    )).toBe(true);
  }

  const darkClassRepresentatives = [
    "SURF-QUEUE-001",
    "SURF-CREATE-001",
    "SURF-WI-001",
    "SURF-WI-CONTEXT-001",
    "SURF-MAT-SOURCE-001",
    "SURF-MAT-ACTIVITY-001",
    "SURF-MAT-PROPOSAL-001",
    "SURF-SET-MODEL-001",
    "SURF-MAT-APPROVAL-TASK-001",
    "SURF-STEP-EXEC-001",
    "SURF-STEP-COMPLETE-001",
    "SURF-MAT-EVIDENCE-001",
    "SURF-CONF-ARCHIVE-001",
  ];
  for (const surface of darkClassRepresentatives) {
    expect(allEntries.some((entry) =>
      entry.surface === surface && entry.theme === "Dark"
    )).toBe(true);
  }
  expect(allEntries.some((entry) => entry.theme === "System/light")).toBe(true);
  expect(allEntries.some((entry) => entry.theme === "System/dark")).toBe(true);
  expect(allEntries.some((entry) =>
    entry.viewport.width === 1000 &&
    entry.references.includes("docs/references/workbench-ui/responsive-composition.svg")
  )).toBe(true);
  expect(new Set(allEntries.map((entry) => entry.id)).size).toBe(allEntries.length);
  expect(runtimeErrors).toEqual([]);
});

test("queue filtering composes archive dataset, project and search exactly once", async ({
  page,
  request,
}) => {
  const activeId = "work_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const archivedId = "work_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

  await page.route("**/api/work-items**", async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== "GET" || url.pathname !== "/api/work-items") {
      await route.fallback();
      return;
    }
    const upstream = await route.fetch();
    const rows = WorkItemSchema.array().parse(await upstream.json());
    const template = rows[0];
    if (template === undefined) throw new Error("queue matrix requires one WorkItem fixture");
    const active = WorkItemSchema.parse({
      ...template,
      id: activeId,
      projectId: "other-e2e",
      repositoryRoot: repositoryRoot + "-other",
      title: "Matrix active other",
      archived: false,
    });
    const archived = WorkItemSchema.parse({
      ...template,
      id: archivedId,
      projectId: "other-e2e",
      repositoryRoot: repositoryRoot + "-other",
      title: "Matrix archived other",
      archived: true,
    });
    const includeArchived = url.searchParams.get("includeArchived") === "true";
    await route.fulfill({
      status: upstream.status(),
      contentType: "application/json",
      body: JSON.stringify([
        ...rows,
        active,
        ...(includeArchived ? [archived] : []),
      ]),
    });
  });

  await page.route("**/api/settings/repositories", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    const upstream = await route.fetch();
    const repositories = await upstream.json() as Array<Record<string, unknown>>;
    const first = repositories[0];
    if (first === undefined) throw new Error("queue matrix requires one repository fixture");
    await route.fulfill({
      status: upstream.status(),
      contentType: "application/json",
      body: JSON.stringify([
        ...repositories,
        {
          ...first,
          repositoryRoot: repositoryRoot + "-other",
          projectId: "other-e2e",
        },
      ]),
    });
  });

  await authenticate(page, request);
  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Matrix archived other")).toHaveCount(0);

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const repositories = page.getByTestId("settings-repositories");
  const projectContext = repositories.getByRole("combobox", {
    name: "Queue and creation context",
  });
  await projectContext.click();
  await page.getByRole("option", { name: "other-e2e", exact: true }).click();
  await page.getByRole("link", { name: "Back to work queue", exact: true }).click();

  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Change work type")).toHaveCount(0);

  const search = page.getByLabel("Search work items");
  await search.fill("Matrix");
  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Matrix archived other")).toHaveCount(0);

  await page.getByRole("button", { name: "Show archived" }).click();
  await expect(rowFor(page, "Matrix active other")).toBeVisible();
  await expect(rowFor(page, "Matrix archived other")).toBeVisible();

  await search.fill("archived");
  await expect(rowFor(page, "Matrix active other")).toHaveCount(0);
  await expect(rowFor(page, "Matrix archived other")).toBeVisible();

  await page.getByRole("button", { name: "Hide archived" }).click();
  await expect(rowFor(page, "Matrix archived other")).toHaveCount(0);
});

test("repository-native WorkItem management keeps project, Git, title, and archive state explicit", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await page.getByRole("button", { name: "New work item" }).click();
  const createDialog = page.getByRole("dialog", { name: "Create work item" });
  await expect(createDialog).toBeVisible();
  await createDialog.getByRole("combobox", { name: "Project Required" }).click();
  await page.getByRole("option", { name: "order-e2e", exact: true }).click();
  await expect(createDialog.getByTestId("create-work-item-location"))
    .toContainText("docs/order/work-items");
  await createDialog.getByRole("radio", { name: "Change" }).click();
  await createDialog.getByLabel("Title").fill("Repository-native management");
  await createDialog.getByRole("button", { name: "Concerns", exact: true }).click();
  await page.getByRole("option", { name: "browser" }).click();
  await page.keyboard.press("Escape");
  await createDialog.getByRole("button", { name: "Create work item" }).click();

  await expect(page.getByTestId("work-item-heading"))
    .toHaveText("Repository-native management");

  const documentState = page.getByTestId("document-git-state");
  await expect(documentState).toContainText("Saved to project, not Git");
  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const gitDialog = page.getByRole("dialog", {
    name: "Save WorkItem documentation to Git?",
  });
  await expect(gitDialog).toContainText("Only the exact governed paths reviewed in WorkItemDocumentationGitStatus will be committed.");
  await expect(gitDialog).toContainText("work-request.md");
  await expect(gitDialog).toContainText("[UNTRACKED]");
  await gitDialog.getByRole("button", { name: "Save documentation to Git" }).click();
  await expect(documentState).toContainText("Saved to Git");

  await page.getByRole("button", { name: "Edit title" }).click();
  await expect(page.getByRole("button", { name: "Start Research", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save title", exact: true })).toBeVisible();
  await page.getByLabel("Work item title").fill("Repository-native management renamed");
  await page.getByRole("button", { name: "Save title" }).click();
  await expect(page.getByRole("button", { name: "Start Research", exact: true })).toBeVisible();
  await expect(page.getByTestId("work-item-heading"))
    .toHaveText("Repository-native management renamed");
  await expect(documentState).toContainText("Saved to project, not Git");

  await page.getByRole("button", { name: "Save documentation to Git" }).click();
  const renamedGitDialog = page.getByRole("dialog", {
    name: "Save WorkItem documentation to Git?",
  });
  await expect(renamedGitDialog).toContainText("work-request.md");
  await expect(renamedGitDialog).toContainText("[MODIFIED]");
  await renamedGitDialog.getByRole("button", { name: "Save documentation to Git" }).click();
  await expect(documentState).toContainText("Saved to Git");

  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await page.getByRole("dialog", { name: "Archive work item?" })
    .getByRole("button", { name: "Archive work item" }).click();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await expect(rowFor(page, "Repository-native management renamed")).toHaveCount(0);
  await page.getByLabel("Search work items").fill("Repository-native management renamed");

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
test("documentation Git blockers remain canonical and visible in the browser", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const item = await workItemForTitle(page, "Source editing workbench");
  const statusResponse = await page.context().request.get(
    "/api/work-items/" + item.id + "/documentation-git-status",
  );
  expect(statusResponse.status()).toBe(200);
  const baseStatus = await statusResponse.json() as {
    workItemId: string;
    headCommit: string;
    branch: string | null;
    authorName: string | null;
    authorEmail: string | null;
    blockers: string[];
    paths: Array<Record<string, unknown>>;
  };
  let blocker = "MISSING_GIT_IDENTITY";
  const statusPath = "**/api/work-items/" + item.id + "/documentation-git-status";
  await page.route(statusPath, async (route) => {
    const paths = baseStatus.paths.map((path, index) =>
      index === 0 ? { ...path, state: "MODIFIED" } : path);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...baseStatus,
        branch: blocker === "DETACHED_HEAD" ? null : baseStatus.branch,
        authorName: blocker === "MISSING_GIT_IDENTITY" ? null : baseStatus.authorName,
        authorEmail: blocker === "MISSING_GIT_IDENTITY" ? null : baseStatus.authorEmail,
        blockers: [blocker],
        paths,
      }),
    });
  });

  await openWorkItem(page, "Source editing workbench");
  await selectWorkflowStep(page, "Work request");

  for (const [nextBlocker, message] of [
    ["MISSING_GIT_IDENTITY", "Set repository-local Git user.name and user.email before saving documentation to Git."],
    ["DETACHED_HEAD", "Check out a local branch before saving documentation to Git."],
    ["GIT_OPERATION_ACTIVE", "Finish the in-progress Git operation before saving documentation to Git."],
  ] as const) {
    blocker = nextBlocker;
    await page.reload();
    await expect(page.getByTestId("work-item-workspace")).toBeVisible();
    await selectWorkflowStep(page, "Work request");
    await expect(page.getByText("Documentation cannot be saved to Git", { exact: true }))
      .toBeVisible();
    await expect(page.getByText(message, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save documentation to Git" }))
      .toBeDisabled();
  }
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

    const editor = await openMarkdownEditor(page, editorName);
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
    await expect(page.getByText("Unsaved", { exact: true })).toHaveCount(0);

    await backToQueue(page);
    await openWorkItem(page, title);
    await selectWorkflowStep(page, tabName);
    const reloaded = await openMarkdownEditor(page, editorName);
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

  await openWorkItem(page, "Lifecycle editing workbench");
  await selectWorkflowStep(page, "Implementation plan");
  const stepWorkspace = page.getByTestId("workflow-step-workspace");
  await expect(stepWorkspace).toBeVisible();
  const stepWorkspaceBox = await stepWorkspace.boundingBox();
  expect(stepWorkspaceBox).not.toBeNull();
  expect(stepWorkspaceBox!.height).toBeGreaterThan(500);

  await expect(page.getByRole("button", { name: "Context" })).toBeVisible();
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);
  await expect(page.getByTestId("governed-document-nav")).toHaveCount(0);
  await expect(page.getByTestId("document-state-strip")).toHaveCount(0);
  await expect(page.locator(".order-editor-actionbar")).toHaveCount(0);

  const workspace = page.getByTestId("lifecycle-document-material");
  const editor = await openMarkdownEditor(
    page,
    "Implementation plan document Markdown source",
  );
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
  const previewBox = await page.getByTestId("markdown-preview").boundingBox();
  expect(previewBox).not.toBeNull();
  expect(editorBox!.width).toBeGreaterThan(workspaceBox!.width * 0.4);
  expect(previewBox!.width).toBeGreaterThan(workspaceBox!.width * 0.4);
  expect(editorBox!.height).toBeGreaterThan(workspaceBox!.height * 0.45);
  expect(saveBox!.y + saveBox!.height).toBeLessThanOrEqual(900);

  await backToQueue(page);
  await page.setViewportSize({ width: 700, height: 800 });
  const item = await workItemForTitle(page, "Lifecycle editing workbench");
  const row = rowFor(page, "Lifecycle editing workbench");
  await expect(row).toBeVisible();
  await expect(row).toContainText("Approval");
  await expect(row).toContainText(item.status === "ACTIVE" ? "Active" : item.status.toLowerCase());

  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  const taskMaster = page.getByTestId("workbench-master-detail-master");
  const taskDetail = page.getByTestId("execution-task-detail");
  await expect(taskMaster).toBeVisible();
  await expect(taskDetail).toBeVisible();
  const masterBox = await taskMaster.boundingBox();
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

  const editor = await openMarkdownEditor(
    page,
    "Implementation plan document Markdown source",
  );
  const initial = await markdownSourceValue(editor);
  await replaceMarkdownSource(
    page,
    editor,
    initial + "\n# Responsive continuity\n",
  );

  const materialSelector = page.getByRole("combobox", { name: "Current workflow material" });
  await materialSelector.focus();
  await materialSelector.click();
  await page.keyboard.press("Escape");
  await expect(materialSelector).toBeFocused();
  await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
  await expect(materialSelector).toBeVisible();
  await expect.poll(() => markdownSourceValue(editor))
    .toContain("# Responsive continuity");

  await page.setViewportSize({ width: 1600, height: 900 });
  await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Current workflow material" })).toBeVisible();
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
  const adoptionReview = page.getByTestId("proposal-review-workspace");
  await expect(adoptionReview).toBeVisible();
  await expect(adoptionReview).toContainText("Adoption in progress");
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Proposal review");

  const workflowRail = page.getByTestId("workflow-rail");
  await expect(workflowRail.getByRole("button", { name: "Implementation plan" }))
    .toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
  await selectCurrentWorkflowMaterial(page, "Attempt 2");
  await expect(page.getByTestId("stage-run-material")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Activity" })).toHaveCount(0);
  await expect(page.getByTestId("selected-run-header")).toHaveCount(1);

  const detail = page.getByTestId("activity-detail");
  const detailBox = await detail.boundingBox();
  expect(detailBox).not.toBeNull();
  expect(detailBox!.width).toBeGreaterThan(640);

  await expect(detail.getByText("Continue current work", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Message input")).toHaveCount(0);
  await expect(page.getByText("ARTIFACT_PROPOSAL_CREATED", { exact: true })).toHaveCount(0);
  await expect(detail.getByText("Timeline technical details", { exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await expect(page.getByTestId("activity-detail")).toBeVisible();

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.getByTestId("activity-detail")).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Documents" })).toHaveCount(0);

  await backToQueue(page);
  await page.setViewportSize({ width: 1600, height: 900 });
  await openWorkItem(page, "Completed investigation");
  await expect(page.getByTestId("result-workspace")).toBeVisible();
  await selectWorkflowStep(page, "Research");
  await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  await selectCurrentWorkflowMaterial(page, "Attempt 1");
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
    const rail = page.getByTestId("workflow-rail");
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
      await expect(page.getByRole("button", { name: "Supporting material and history", exact: true })).toHaveCount(0);
      await selectCurrentWorkflowMaterial(page, "Attempt 1");
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

test("historical inspection preserves current attention reason, return and current action", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  for (const [title, status, currentAction] of [
    ["Workflow input required", "Waiting for you", null],
    ["Proposal review", "Proposal review required", null],
    ["Workflow resume action", "Blocked", "Resume resolved blocker"],
    ["Workflow retry action", "Recovery required", "Retry Implementation plan"],
  ] as const) {
    await openWorkItem(page, title);
    await selectWorkflowStep(page, "Work request");
    const summary = page.getByTestId("workflow-step-summary");
    await expect(summary.getByText(status, { exact: true })).toBeVisible();
    const returnToCurrent = page.getByRole("button", {
      name: "Return to Implementation plan",
      exact: true,
    });
    await expect(returnToCurrent).toBeVisible();
    if (currentAction !== null) {
      await expect(page.getByRole("button", {
        name: currentAction,
        exact: true,
      })).toHaveCount(0);
      await returnToCurrent.click();
      await expect(page.getByRole("button", {
        name: currentAction,
        exact: true,
      })).toBeVisible();
    }
    await backToQueue(page);
  }

  await openWorkItem(page, "Stale approval inspection matrix");
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(page.getByTestId("review-workspace")).toContainText("Package stale");
  await selectWorkflowStep(page, "Work request");
  const staleSummary = page.getByTestId("workflow-step-summary");
  await expect(staleSummary.getByText("Stale authority", { exact: true })).toBeVisible();
  const returnToApproval = page.getByRole("button", { name: "Return to Approval", exact: true });
  await expect(returnToApproval).toBeVisible();
  await expect(page.getByRole("button", {
    name: "Return to Implementation plan",
    exact: true,
  })).toHaveCount(0);
  await returnToApproval.click();
  await expect(page.getByRole("button", {
    name: "Return to Implementation plan",
    exact: true,
  })).toBeVisible();
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
    page.getByText("Which constraint should the plan prioritize?", { exact: true }),
  ).toBeVisible();
  const requiredInputComposer = page.getByTestId("activity-composer");
  await expect(
    requiredInputComposer.getByText("Answer the question above", { exact: true }),
  ).toBeVisible();
  await expect(requiredInputComposer).toBeFocused();
  const contextControl = page.getByRole("button", { name: "Context", exact: true });
  await contextControl.focus();
  await page.waitForTimeout(1_000);
  await expect(contextControl).toBeFocused();
  await expect(
    page.getByTestId("activity-composer")
      .getByText("Which constraint should the plan prioritize?", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("progressbar")).toHaveCount(0);

  await page.setViewportSize({ width: 700, height: 800 });
  await selectWorkflowStep(page, "Work request");
  await selectWorkflowStep(page, "Implementation plan");
  const remountedComposer = page.getByTestId("activity-composer");
  await expect(remountedComposer).toBeVisible();
  await expect(remountedComposer).not.toBeFocused();
  const remountContextControl = page.getByRole("button", { name: "Context", exact: true });
  await remountContextControl.focus();
  await page.waitForTimeout(500);
  await expect(remountContextControl).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 720 });

  await backToQueue(page);

  await openWorkItem(page, "Workflow failure feedback");
  await selectCurrentWorkflowMaterial(page, "Attempt 4");
  await expect(page.getByText("Work is blocked", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Conformance check failed", { exact: true }),
  ).toBeVisible();

  await selectCurrentWorkflowMaterial(page, "Attempt 2");
  await expect(page.getByText("Agent setup blocked", { exact: true })).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toContainText("Implementation plan");
  await expect(page.getByRole("button", { name: "Return to Implementation plan", exact: true })).toBeVisible();
  await expect(
    page.getByText("Technical diagnostics available", { exact: true }),
  ).toBeVisible();
  const setupEvidence = page
    .locator('[data-evidence-path="provider-diagnostics.json"]')
    .first()
    .getByRole("button", { name: "Evidence: provider-diagnostics.json" });
  await expect(setupEvidence).toBeVisible();

  await selectCurrentWorkflowMaterial(page, "Attempt 3");
  await expect(
    page.getByText("Agent execution failed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Approved authority changed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Repository changed", { exact: true })).toBeVisible();

  await selectCurrentWorkflowMaterial(page, "Attempt 1");
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
  await selectWorkflowMaterial(page, "Independent review · Attempt 1");
  await expect(
    page.getByText("Independent review failed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Validation failed", { exact: true })).toBeVisible();

  await selectWorkflowMaterial(page, "Implementation agent · Attempt 1");
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
  await expect(page.getByText("Could not start current workflow step", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Workflow resume action");
  const resume = page.getByRole("button", { name: "Resume resolved blocker" });
  await failNext(
    "**/api/work-items/*/resume",
    async () => resume.click(),
    async () => expect(resume).toBeDisabled(),
  );
  await expect(page.getByText("Could not resume current workflow owner", { exact: true })).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Implementation action ready");
  const implementationDetail = page.getByTestId("execution-task-detail");
  await expect(implementationDetail).toBeVisible();
  await expect(implementationDetail.getByText("Approved task", { exact: true })).toBeVisible();
  await expect(implementationDetail.getByText("No persisted attempt events", { exact: true })).toBeVisible();
  await expect(implementationDetail.getByText("Loading attempt timeline…", { exact: true })).toHaveCount(0);
  await expect(implementationDetail.getByText("Change surface forecast", { exact: true })).toBeVisible();
  await expect(implementationDetail.getByText("Task id", { exact: true })).toHaveCount(0);
  await expect(implementationDetail.getByText("Provider session", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("table", { name: "Approved tasks" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Technical details", exact: true })).toHaveCount(0);
  const implementationItem = await workItemForTitle(page, "Implementation action ready");
  const taskResponse = await page.context().request.get(
    "/api/work-items/" + implementationItem.id + "/tasks",
  );
  expect(taskResponse.status()).toBe(200);
  const currentTask = ExecutionTaskSchema.array().parse(await taskResponse.json())[0];
  expect(currentTask).toBeDefined();
  const startCurrent = page.getByRole("button", { name: "Start current task" });
  await failNext(
    "**/api/work-items/" + implementationItem.id + "/tasks/" + currentTask!.id + "/start",
    async () => startCurrent.click(),
    async () => expect(startCurrent).toBeDisabled(),
  );
  await expect(page.getByText("Implementation action failed", { exact: true }))
    .toBeVisible();
});

test("P5 keeps current execution ownership independent from historical selection across responsive classes", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Implementation historical selection");

  const workItem = await workItemForTitle(page, "Implementation historical selection");
  const tasksResponse = await page.context().request.get(
    "/api/work-items/" + workItem.id + "/tasks",
  );
  expect(tasksResponse.status()).toBe(200);
  const tasks = ExecutionTaskSchema.array().parse(await tasksResponse.json());
  const historicalTask = tasks.find((task) => task.objective === "Completed prerequisite");
  const currentTask = tasks.find((task) => task.objective === "Current implementation task");
  expect(historicalTask).toBeDefined();
  expect(currentTask).toBeDefined();

  const historicalTaskRow = page.getByRole("table", { name: "Approved tasks" })
    .getByRole("row")
    .filter({ hasText: "Completed prerequisite" });
  await expect(historicalTaskRow).toBeVisible();
  await historicalTaskRow.click();
  const detail = page.getByTestId("execution-task-detail");
  await expect(detail).toContainText("Completed prerequisite");
  await expect(detail).toContainText("already satisfied");
  await expect(page.getByRole("button", { name: "Start current task", exact: true }))
    .toBeVisible();

  for (const width of [1000, 700]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(detail).toContainText("Completed prerequisite");
    await expect(page.getByRole("button", { name: "Approved tasks", exact: true }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "Start current task", exact: true }))
      .toBeVisible();
  }

  let historicalStartCalled = false;
  const historicalStartPath =
    "/api/work-items/" + workItem.id + "/tasks/" + historicalTask!.id + "/start";
  const currentStartPath =
    "/api/work-items/" + workItem.id + "/tasks/" + currentTask!.id + "/start";
  await page.route("**" + historicalStartPath, async (route) => {
    historicalStartCalled = true;
    await route.abort("failed");
  });
  await page.route("**" + currentStartPath, async (route) => {
    const run = RunSchema.parse(await fixtureMutation(
      page.context().request,
      "/tick",
      { workItemId: workItem.id, taskId: currentTask!.id },
    ));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(run),
    });
  });
  const startResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().endsWith(currentStartPath));
  await page.getByRole("button", { name: "Start current task", exact: true }).click();
  expect((await startResponse).status()).toBe(201);
  expect(historicalStartCalled).toBe(false);
  await page.unroute("**" + currentStartPath);
  await page.unroute("**" + historicalStartPath);

  await expect(detail).toContainText("Completed prerequisite");
  await expect(
    page.getByRole("button", {
      name: "Cancel current implementation attempt",
      exact: true,
    }),
  ).toBeVisible();

  await backToQueue(page);
  await page.setViewportSize({ width: 1000, height: 800 });
  await openWorkItem(page, "Verified candidate");
  const finalOutcome = page.getByTestId("final-governed-outcome");
  const candidateResources = page.getByTestId("candidate-result-material");
  await expect(finalOutcome).toBeVisible();
  await expect(candidateResources).toBeVisible();
  let outcomeBox = await finalOutcome.boundingBox();
  let resourcesBox = await candidateResources.boundingBox();
  expect(outcomeBox).not.toBeNull();
  expect(resourcesBox).not.toBeNull();
  expect(outcomeBox!.y).toBeLessThan(resourcesBox!.y);
  await expect(finalOutcome).not.toContainText(/deployed|production/i);

  await page.setViewportSize({ width: 700, height: 800 });
  await expect(finalOutcome).toBeVisible();
  await expect(candidateResources).toBeVisible();
  outcomeBox = await finalOutcome.boundingBox();
  resourcesBox = await candidateResources.boundingBox();
  expect(outcomeBox).not.toBeNull();
  expect(resourcesBox).not.toBeNull();
  expect(outcomeBox!.y).toBeLessThan(resourcesBox!.y);
  await expect(page.getByRole("button", { name: "Create linked remediation" }))
    .toHaveCount(0);

  await backToQueue(page);
  await openWorkItem(page, "Completed audit");
  const auditOutcome = page.getByTestId("final-governed-outcome");
  const auditResult = page.getByTestId("result-material");
  await expect(auditOutcome).toBeVisible();
  await expect(auditResult).toBeVisible();
  const auditOutcomeBox = await auditOutcome.boundingBox();
  const auditResultBox = await auditResult.boundingBox();
  expect(auditOutcomeBox).not.toBeNull();
  expect(auditResultBox).not.toBeNull();
  expect(auditOutcomeBox!.y).toBeLessThan(auditResultBox!.y);
  await expect(page.getByRole("button", { name: "Create linked remediation", exact: true }))
    .toBeVisible();
});

test("mutation conflict remains primary until the selected WorkItem refresh succeeds", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Requirements ready after Research");
  const workItem = await workItemForTitle(page, "Requirements ready after Research");
  const selectedPath =
    `**/api/work-items/${encodeURIComponent(workItem.id)}`;
  const startPath =
    `**/api/work-items/${encodeURIComponent(workItem.id)}/runs`;

  await page.route(selectedPath, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.abort("failed");
  });
  await page.route(startPath, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        code: "CURRENT_STATE_CONFLICT",
        message: "The workflow changed before this command could commit.",
        sourceDiagnostic: null,
        staleAuthorityOwner: null,
      }),
    });
  });

  const start = page.getByRole("button", {
    name: "Start Requirements",
    exact: true,
  });
  await start.click();

  const summary = page.getByTestId("workflow-step-summary");
  await expect(summary).toContainText(
    "Workflow state changed during the action",
  );
  await expect(summary).toContainText(
    "Review the refreshed current workflow state before attempting another mutation.",
  );
  await expect(
    page.getByRole("button", {
      name: "Start Requirements",
      exact: true,
    }),
  ).toHaveCount(0);

  await page.unroute(startPath);
  await page.unroute(selectedPath);
});

test("successful workflow mutations reconcile to refreshed canonical state without provider-dependent browser work", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  await openWorkItem(page, "Work request start success");
  const startItem = await workItemForTitle(page, "Work request start success");
  const researchRun = RunSchema.parse(await fixtureMutation(
    page.context().request,
    "/start-stage",
    { workItemId: startItem.id },
  ));
  const startPattern = "**/api/work-items/" + startItem.id + "/runs";
  await page.route(startPattern, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(researchRun),
    });
  });
  const startResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/work-items/" + startItem.id + "/runs"));
  await page.getByRole("button", { name: "Start Research", exact: true }).click();
  await startResponse;
  await page.unroute(startPattern);
  await expect(
    page.getByTestId("workflow-rail")
      .getByRole("button", { name: "Research", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
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
  const inputPattern = "**/api/runs/" + inputRun!.id + "/input";
  await page.route(inputPattern, async (route) => {
    const received = RunEventSchema.parse(await fixtureMutation(
      page.context().request,
      "/submit-input",
      {
        runId: inputRun!.id,
        requestEventId: requested!.id,
        text: "Keep the approved constraint.",
      },
    ));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(received),
    });
  });
  const messageInput = page.getByLabel("Message input");
  await messageInput.fill("Keep the approved constraint.");
  const inputResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/runs/" + inputRun!.id + "/input"));
  await messageInput.press("Enter");
  await inputResponse;
  await page.unroute(inputPattern);
  await expect(
    page.getByText("Keep the approved constraint.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Continue current work", { exact: true })).toHaveCount(0);

  const cancelResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/runs/" + inputRun!.id + "/cancel"));
  await page.getByRole("button", { name: "Cancel current activity" }).click();
  expect((await cancelResponse).status()).toBe(200);
  await expect(page.getByTestId("selected-run-header")).toContainText("Cancelled");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow retry action");
  const retryItem = await workItemForTitle(page, "Workflow retry action");
  const retryRun = RunSchema.parse(await fixtureMutation(
    page.context().request,
    "/start-stage",
    { workItemId: retryItem.id },
  ));
  const retryPattern = "**/api/work-items/" + retryItem.id + "/runs";
  await page.route(retryPattern, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(retryRun),
    });
  });
  const retryResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/work-items/" + retryItem.id + "/runs"));
  await page.getByRole("button", { name: "Retry Implementation plan" }).click();
  await retryResponse;
  await page.unroute(retryPattern);
  await expect(page.getByTestId("selected-run-header")).toContainText("Attempt 2");
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Workflow resume action");
  const resumeItem = await workItemForTitle(page, "Workflow resume action");
  const resumeResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().includes("/api/work-items/" + resumeItem.id + "/resume"));
  await page.getByRole("button", { name: "Resume resolved blocker" }).click();
  expect((await resumeResponse).status()).toBe(200);
  await expect(
    page.getByRole("button", { name: "Resume resolved blocker" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Retry Implementation plan" }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Implementation action ready");
  const executionItem = await workItemForTitle(page, "Implementation action ready");
  const tasksResponse = await page.request.get(
    "/api/work-items/" + executionItem.id + "/tasks",
  );
  expect(tasksResponse.status()).toBe(200);
  const executionTasks = ExecutionTaskSchema.array().parse(
    await tasksResponse.json(),
  );
  const executionTask = executionTasks[0];
  expect(executionTask).toBeDefined();
  const startPath =
    "/api/work-items/" + executionItem.id +
    "/tasks/" + executionTask!.id + "/start";
  await page.route("**" + startPath, async (route) => {
    const run = RunSchema.parse(await fixtureMutation(
      page.context().request,
      "/tick",
      { workItemId: executionItem.id },
    ));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(run),
    });
  });
  const executionStartResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" &&
    response.url().endsWith(startPath));
  await page.getByRole("button", { name: "Start current task" }).click();
  expect((await executionStartResponse).status()).toBe(201);
  await page.unroute("**" + startPath);
  await expect(page.getByTestId("selected-run-header"))
    .toContainText("Implementation agent · Attempt 1");
  await expect(page.getByTestId("selected-run-header")).toContainText("Running");
  await expect(
    page.getByRole("button", { name: "Start current task" }),
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
    "Work request",
    "Research",
    "Requirements",
    "Solution design",
    "Implementation plan",
    "Readiness review",
    "Approval",
  ] as const;

  for (const step of cases) {
    await selectWorkflowStep(page, step);
    if (step === "Readiness review" || step === "Approval") {
      const review = page.getByTestId("review-workspace");
      await expect(review).toBeVisible();
      await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
      if (step === "Readiness review") {
        await expect(page.getByRole("button", { name: "Return to Approval", exact: true })).toBeVisible();
      } else {
        await expect(review).toContainText("Awaiting authorization");
        await expect(page.getByRole("button", { name: "Return to Approval" })).toHaveCount(0);
      }
    } else {
      const attention = page.getByTestId("workflow-step-summary");
      await expect(attention).toContainText("Approval");
      await expect(attention).toContainText("Action required");
      await expect(page.getByRole("button", { name: "Return to Approval" })).toBeVisible();
      await expect(page.getByTestId("primary-material-frame")).toBeVisible();
    }
  }

  await selectWorkflowStep(page, "Research");
  await selectCurrentWorkflowMaterial(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await expect(
    page.getByText("Read-only supporting Work request context.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to workflow context" }).click();
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();

  await selectWorkflowStep(page, "Requirements");
  await selectCurrentWorkflowMaterial(page, "Research");
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to workflow context" }).click();

  await backToQueue(page);
  await openWorkItem(page, "Verified candidate");
  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("workflow-step-summary")).toContainText("Implementation");
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  await selectWorkflowStep(page, "Complete");
  await expect(page.getByTestId("result-workspace")).toContainText("Verified candidate");
});

test("OPEN continuation keeps the agent anchor visible and admits exactly one current reply composer", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Research open continuation");
  const detail = page.getByTestId("activity-detail");
  await expect(detail).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toContainText("Open for continuation");
  await expect(page.getByTestId("selected-run-header")).toContainText("Open for continuation");
  await expect(detail).toContainText("The current Research findings are ready for your continuation.");
  const composer = detail.getByTestId("activity-composer");
  await expect(composer).toBeVisible();
  await expect(composer.getByLabel("Message input")).toBeVisible();
  await expect(composer).toContainText("Continue current work");
  await expect(composer.getByText("Answer the question above", { exact: true })).toHaveCount(0);
  await expect(detail.getByText("Repository-backed Research material", { exact: true })).toBeVisible();
  await expect(detail.getByRole("button", { name: "Open Research document", exact: true })).toBeVisible();
  await expect(page.getByTestId("proposal-review-workspace")).toHaveCount(0);
});

test("PROCESSING dialogue state is visibly distinct and has no reply composer", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const item = await workItemForTitle(page, "Research processing attention visual");
  await fixtureMutation(request, "/start-stage", { workItemId: item.id });
  await openWorkItem(page, "Research processing attention visual");

  await expect(page.getByTestId("workflow-step-summary")).toContainText("Processing");
  await expect(page.getByTestId("selected-run-header")).toContainText("Processing");
  await expect(page.getByTestId("activity-composer")).toHaveCount(0);
});

test("active agent ownership keeps title and lifecycle authoring read-only while workflow interaction remains available", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  const item = await workItemForTitle(page, "Implementation plan document visual");
  await fixtureMutation(request, "/start-stage", { workItemId: item.id });
  await openWorkItem(page, "Implementation plan document visual");

  await expect(page.getByTestId("workflow-step-summary")).toContainText("Processing");
  await expect(page.getByRole("button", { name: "Edit title", exact: true })).toBeDisabled();

  const selector = page.getByRole("combobox", { name: "Current workflow material" });
  await expect(selector).toBeVisible();
  await selector.click();
  await page.getByRole("option", { name: "Implementation plan document", exact: true }).click();
  await expect(page.getByTestId("lifecycle-document-material")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Implementation plan document Markdown source")).toHaveCount(0);

  await selectWorkflowStep(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  await expect(page.getByLabel("WorkItem source Markdown source")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  await expect(page.getByTestId("workflow-step-summary")).toContainText("Processing");
});

test("work-type variants preserve their canonical Work request information contracts in one shared shell", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);
  await authenticate(page, request);
  const variants = [
    {
      title: "Change work type",
      kind: "Change",
      headings: ["Requested outcome", "Current context", "Constraints/non-goals", "Evidence/references"],
    },
    {
      title: "Defect work type",
      kind: "Defect",
      headings: ["Observed behavior", "Expected behavior", "Reproduction/evidence", "Behavior that must remain unchanged", "Impact/context"],
    },
    {
      title: "Investigation work type",
      kind: "Investigation",
      headings: ["Question", "Why it matters", "Known evidence/context", "Investigation boundary"],
    },
    {
      title: "Audit work type",
      kind: "Audit",
      headings: ["Target under audit", "Governing authority/criteria", "Scope/exclusions", "Requested evidence/verdict"],
    },
  ] as const;

  for (const variant of variants) {
    await page.goto("/");
    await openWorkItem(page, variant.title);
    await expect(page.locator(".order-workitem-kind")).toHaveText(variant.kind);
    const source = page.getByTestId("source-document-material");
    await expect(source).toBeVisible();
    for (const heading of variant.headings) await expect(source).toContainText(heading);
    await expect(source.getByTestId("markdown-preview")).not.toContainText("Order template:");
    if (variant.kind === "Change") {
      const editor = await openMarkdownEditor(page, "WorkItem source Markdown source");
      await expect.poll(() => markdownSourceValue(editor)).toContain(
        "<!-- Order template: change-intake-v1;",
      );
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Start Research", exact: true })).toBeVisible();
    await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  }

  const researchVariants = [
    {
      title: "Change research contract",
      kind: "Change",
      headings: [
        "Current state / absence",
        "Evidence",
        "Governing authority",
        "Affected producer→consumer path",
        "Downstream invariants",
        "Unresolved facts",
        "Verdict",
      ],
    },
    {
      title: "Defect research contract",
      kind: "Defect",
      headings: [
        "Observed symptom / reproduction",
        "Proven root cause",
        "Producer→carrier→consumer path",
        "Downstream effects / invariants",
        "Governing authority",
        "Unresolved facts",
        "Verdict",
      ],
    },
    {
      title: "Investigation research contract",
      kind: "Investigation",
      headings: ["Question", "Evidence for / against", "Findings", "Unresolved questions", "Conclusion"],
    },
    {
      title: "Audit research contract",
      kind: "Audit",
      headings: ["Target / criteria", "Evidence by criterion", "Findings", "Verdict"],
    },
  ] as const;

  for (const variant of researchVariants) {
    await page.goto("/");
    await openWorkItem(page, variant.title);
    await expect(page.locator(".order-workitem-kind")).toHaveText(variant.kind);
    const research = page.getByTestId("lifecycle-document-material");
    await expect(research).toBeVisible();
    for (const heading of variant.headings) await expect(research).toContainText(heading);
  }

  await page.goto("/");
  await openWorkItem(page, "Change requirements contract");
  const changeRequirements = page.getByTestId("lifecycle-document-material");
  await expect(changeRequirements).toContainText("Requested outcome");
  await expect(changeRequirements).toContainText("Proven current-state / absence basis");
  await expect(changeRequirements).toContainText("Required observable outcome / delta");
  await expect(changeRequirements).not.toContainText("Proven defect / root cause");

  await page.goto("/");
  await openWorkItem(page, "Defect requirements contract");
  const defectRequirements = page.getByTestId("lifecycle-document-material");
  await expect(defectRequirements).toContainText("Proven defect / root cause");
  await expect(defectRequirements).toContainText("Expected corrected behavior");
  await expect(defectRequirements).toContainText("Behavior that must remain unchanged");
  await expect(defectRequirements).toContainText("Regression / preservation acceptance");
  await expect(defectRequirements).not.toContainText("Proven current-state / absence basis");

  await page.goto("/");
  await openWorkItem(page, "Change solution design contract");
  const changeDesign = page.getByTestId("lifecycle-document-material");
  await expect(changeDesign).toContainText("Requested outcome");
  await expect(changeDesign).toContainText("Proven current-state / absence basis");
  await expect(changeDesign).not.toContainText("Proven root cause / producing boundary");

  await page.goto("/");
  await openWorkItem(page, "Defect solution design contract");
  const defectDesign = page.getByTestId("lifecycle-document-material");
  await expect(defectDesign).toContainText("Proven root cause / producing boundary");
  await expect(defectDesign).toContainText("Preservation invariants");
  await expect(defectDesign).not.toContainText("Proven current-state / absence basis");

  await page.goto("/");
  await openWorkItem(page, "Change implementation plan contract");
  const changePlan = page.getByTestId("lifecycle-document-material");
  await expect(changePlan).toContainText("Requested outcome");
  await expect(changePlan).toContainText("Proven current-state / absence basis");
  await expect(changePlan).not.toContainText("Exact remediation");

  await page.goto("/");
  await openWorkItem(page, "Defect implementation plan contract");
  const defectPlan = page.getByTestId("lifecycle-document-material");
  await expect(defectPlan).toContainText("Exact remediation");
  await expect(defectPlan).toContainText("Reproduction verification");
  await expect(defectPlan).toContainText("Regression verification");
  await expect(defectPlan).toContainText("Preservation verification");
  await expect(defectPlan).not.toContainText("Proven current-state / absence basis");
});

test("Readiness verdict follows typed R3 outcome independently from material currentness", async ({
  page,
  request,
}) => {
  await authenticate(page, request);

  for (const [title, verdict] of [
    ["Readiness returned to Research", "Return to Research"],
    ["Readiness returned to Requirements", "Return to Requirements"],
    ["Readiness returned to Design", "Return to Solution design"],
    ["Readiness returned to Plan", "Return to Implementation plan"],
  ] as const) {
    await openWorkItem(page, title);
    await selectWorkflowStep(page, "Readiness review");
    const review = page.getByTestId("review-workspace");
    await expect(
      review.getByTestId("readiness-verdict").getByText(verdict, { exact: true }),
    ).toBeVisible();
    await backToQueue(page);
  }

  await openWorkItem(page, "Readiness blocked");
  await expect(
    page.getByTestId("review-workspace")
      .getByTestId("readiness-verdict")
      .getByText("Blocked", { exact: true }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Readiness blocked after prior ready");
  const blockedAfterPriorReady = page.getByTestId("review-workspace")
    .getByTestId("readiness-verdict");
  await expect(blockedAfterPriorReady.getByText("Blocked", { exact: true }))
    .toBeVisible();
  await expect(
    blockedAfterPriorReady.getByText("Ready for sign-off", { exact: true }),
  ).toHaveCount(0);
  await backToQueue(page);

  await openWorkItem(page, "Awaiting sign-off");
  await selectWorkflowStep(page, "Readiness review");
  await expect(
    page.getByTestId("review-workspace")
      .getByTestId("readiness-verdict")
      .getByText("Ready for sign-off", { exact: true }),
  ).toBeVisible();
  await backToQueue(page);

  await openWorkItem(page, "Stale approval inspection matrix");
  await expect(page.getByTestId("review-workspace")).toContainText("Package stale");
  await selectWorkflowStep(page, "Readiness review");
  const staleReview = page.getByTestId("review-workspace");
  await expect(
    staleReview.getByTestId("readiness-verdict")
      .getByText("Ready for sign-off", { exact: true }),
  ).toBeVisible();
  await expect(staleReview.getByText("Stale", { exact: true })).toBeVisible();
});

test("Readiness required input owns the action without replacing Review", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Readiness input required");
  const review = page.getByTestId("review-workspace");
  await expect(review).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(review).toContainText("Waiting for you");
  const interaction = page.getByTestId("readiness-current-attention");
  await expect(interaction).toBeVisible();
  await expect(interaction).toContainText(
    "Which readiness finding should be resolved before approval?",
  );
  const readinessComposer = interaction.getByTestId("activity-composer");
  await expect(readinessComposer).toBeVisible();
  await expect(readinessComposer.getByLabel("Message input")).toBeVisible();
  await expect(readinessComposer).toContainText("Answer the question above");
  await expect(review.getByText("Readiness verdict", { exact: true })).toBeVisible();
  await expect(review.getByText("Findings / defective owner", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("Readiness keeps verdict and findings primary while subordinate material changes", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Readiness ready after Plan");
  const review = page.getByTestId("review-workspace");
  await expect(review).toBeVisible();
  await expect(review.getByText("Readiness verdict", { exact: true })).toBeVisible();
  await expect(
    review.getByTestId("readiness-verdict").getByText("Review in progress", { exact: true }),
  ).toBeVisible();
  await expect(review.getByText("Findings / defective owner", { exact: true })).toBeVisible();
  const selector = page.getByRole("combobox", { name: "Readiness material" });
  await expect(selector).toBeVisible();
  await selector.click();
  await page.getByRole("option", { name: "Implementation plan", exact: true }).click();
  await expect(review.getByText("Readiness verdict", { exact: true })).toBeVisible();
  await expect(review.getByText("Findings / defective owner", { exact: true })).toBeVisible();
  await expect(review.getByText("Selected supporting material", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("proposal decisions are primary, mutation-safe, and Approval keeps sign-off attached to selected material", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  const proposalReview = page.getByTestId("proposal-review-workspace");
  await expect(proposalReview).toContainText("Pending review");
  const proposalDiff = page.getByTestId("proposal-review-diff");
  await expect(proposalReview).toBeVisible();
  await expect(proposalDiff).toBeVisible();
  const proposalReviewBox = await proposalReview.boundingBox();
  const proposalDiffBox = await proposalDiff.boundingBox();
  expect(proposalReviewBox).not.toBeNull();
  expect(proposalDiffBox).not.toBeNull();
  expect(proposalDiffBox!.width).toBeGreaterThan(proposalReviewBox!.width * 0.85);
  await expect(proposalReview.getByText("Proposed document diff", { exact: true })).toBeVisible();
  await expect(proposalReview.getByTestId("activity-composer")).toHaveCount(0);
  await expect(proposalReview.getByLabel("Message input")).toHaveCount(0);

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
  await selectCurrentWorkflowMaterial(page, "Attempt 1");
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
  const approvalReview = page.getByTestId("review-workspace");
  await expect(approvalReview).toBeVisible();
  await expect(page.getByTestId("workflow-step-summary")).toHaveCount(0);
  await expect(approvalReview).toContainText("Awaiting authorization");
  await expect(approvalReview.getByTestId("approval-readiness-summary"))
    .toContainText("Ready for sign-off");
  await expect(approvalReview.getByTestId("signoff-package-hash")).toHaveCount(0);
  await page.getByRole("button", { name: "Context", exact: true }).click();
  const packageHash = page.getByTestId("context-signoff-package-hash");
  await expect(packageHash).toHaveText(/^sha256:[0-9a-f]{64}$/);
  await expect(packageHash).toBeVisible();
  await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  await page.getByRole("button", { name: "Close context", exact: true }).click();

  await openDisclosureResource(
    page,
    "Package material",
    "Open Implementation plan",
  );
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("Approved by")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toBeVisible();
  await expect(page.getByTestId("document-git-controls")).toHaveCount(0);

  await openDisclosureResource(
    page,
    "Package material",
    "Inspect task: Prove the browser candidate surface",
  );
  const approvalTaskDetail = page.getByTestId("approval-task-detail");
  await expect(approvalTaskDetail)
    .toContainText("Prove the browser candidate surface");
  await expect(approvalTaskDetail).toContainText("Gates");
  await expect(approvalTaskDetail).toContainText("Scope");
  await expect(approvalTaskDetail).toContainText("Exclusions");
  await expect(approvalTaskDetail).toContainText("Change surface");
  await expect(approvalTaskDetail).toContainText("Authority");
  await expect(approvalTaskDetail.getByText("Task id", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Task technical details", exact: true })).toHaveCount(0);
  const approvedBy = page.getByLabel("Approved by");
  const signoff = page.getByRole("button", { name: "Sign off exact package" });
  await expect(approvedBy).toBeVisible();
  await approvedBy.fill("   ");
  await expect(signoff).toBeDisabled();
  await approvedBy.fill("browser-approver");
  await expect(signoff).toBeEnabled();

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
    page.getByTestId("workflow-rail")
      .getByRole("button", { name: "Implementation", exact: true }),
  ).toHaveAttribute("aria-current", "step", { timeout: 5_000 });
});

test("historical pre-signoff inspection returns to the current owner before offering current mutations", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Requirements ready after Research");
  await expect(page.getByRole("button", { name: "Start Requirements", exact: true })).toBeVisible();

  await selectWorkflowStep(page, "Research");
  const summary = page.getByTestId("workflow-step-summary");
  await expect(summary).toContainText("Requirements");
  await expect(page.getByRole("button", { name: "Return to Requirements", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Requirements", exact: true })).toHaveCount(0);
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
  const sourceEditor = await openMarkdownEditor(page, "WorkItem source Markdown source");
  const original = await markdownSourceValue(sourceEditor);
  expect(original).toContain("# Source editing workbench");
  expect(original).not.toContain('"formatVersion"');
  await expect(
    page.getByTestId("source-document-material")
      .getByRole("button", { name: "Technical details", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await expect(page.getByTestId("selected-view-context")).toContainText("Work request");
  await expect(page.getByTestId("selected-view-context")).toContainText("work-request.md");
  await page.getByRole("button", { name: "Close context", exact: true }).click();

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
  await expect(page.getByTestId("markdown-document-view")).toBeVisible();
  const reopenedSourceEditor = await openMarkdownEditor(page, "WorkItem source Markdown source");
  await expect.poll(() => markdownSourceValue(reopenedSourceEditor)).toBe(current);

  await replaceMarkdownSource(page, reopenedSourceEditor, current + "\nsaved through browser workbench\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => markdownSourceValue(reopenedSourceEditor)).toContain("saved through browser workbench");
  await expect.poll(() => readFileSync(sourcePath, "utf8")).toContain(
    "saved through browser workbench",
  );
  await expect(page.getByText("Unsaved", { exact: true })).toHaveCount(0);

  const workflowRail = page.getByTestId("workflow-rail");
  await expect(
    workflowRail.getByRole("button", { name: "Research" }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);

  await selectWorkflowStep(page, "Implementation plan");
  await expect(
    workflowRail.getByRole("button", { name: "Research" }),
  ).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
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
  const workflowRail = page.getByTestId("workflow-rail");
  await selectWorkflowStep(page, "Work request");
  await expect(page.getByTestId("source-document-material")).toBeVisible();
  expect(workflowMutations).toEqual([]);

  await selectWorkflowStep(page, "Implementation plan");
  const planEditor = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  const initial = await markdownSourceValue(planEditor);
  await replaceMarkdownSource(page, planEditor, initial + "\nunsaved guard\n");

  await page.getByTestId("workflow-rail")
    .getByRole("button", { name: "Approval" })
    .click();
  const workflowGuard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(workflowGuard).toBeVisible();
  await workflowGuard.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("unsaved guard");
  expect(workflowMutations).toEqual([]);

  await page.getByRole("link", { name: "Back to queue" }).click();
  const guard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(guard).toBeVisible();
  await guard.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.poll(() => markdownSourceValue(planEditor)).toContain("unsaved guard");

  await page.getByRole("link", { name: "Back to queue" }).click();
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
  await openMarkdownEditor(page, "Implementation plan document Markdown source");
  const unchangedCancel = page.getByRole("button", { name: "Cancel", exact: true });
  await expect(unchangedCancel).toBeEnabled();
  await unchangedCancel.click();
  await expect(page.getByTestId("markdown-document-view")).toBeVisible();

  const editablePlan = await openMarkdownEditor(page, "Implementation plan document Markdown source");
  const fresh = await markdownSourceValue(editablePlan);
  await replaceMarkdownSource(page, editablePlan, fresh + "\ncancelled plan edit\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByTestId("markdown-document-view")).toBeVisible();
  const reopenedPlan = await openMarkdownEditor(
    page,
    "Implementation plan document Markdown source",
  );
  await expect.poll(() => markdownSourceValue(reopenedPlan)).toBe(fresh);

  await replaceMarkdownSource(page, reopenedPlan, fresh + "\nsaved plan edit\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const savedPlan = page.getByLabel("Implementation plan document Markdown source");
  await expect(savedPlan).toBeVisible();

  const currentItem = await workItemForTitle(page, "Lifecycle editing workbench");
  await expect.poll(async () => {
    const artifactsResponse = await page.context().request.get(
      "/api/work-items/" + currentItem.id + "/lifecycle-artifacts",
    );
    if (artifactsResponse.status() !== 200) return "";
    const artifacts = ArtifactRefSchema.array().parse(await artifactsResponse.json());
    const currentPlan = artifacts.find((artifact) => artifact.role === "PLAN");
    if (currentPlan === undefined) return "";
    const contentResponse = await page.context().request.get(
      "/api/artifacts/" + currentPlan.id + "/content",
    );
    return contentResponse.status() === 200 ? await contentResponse.text() : "";
  }).toContain("saved plan edit");
  await expect(page.getByText("Unsaved", { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("selected-view-context")).toContainText("Implementation plan");
  await expect(page.getByTestId("selected-view-context")).toContainText("Governed document");
  await expect(page.getByTestId("selected-view-context")).toContainText("docs/plan.md");
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
});

test("Requirements document keeps status and authority secondary beside the governed material", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Requirements document visual");
  await expect(page.getByText("Requirements document", { exact: true }).first()).toBeVisible();
  const authority = page.locator('[aria-label="Requirements authority"]');
  await expect(authority).toBeVisible();
  await expect(authority).toContainText("Status");
  await expect(authority).toContainText("Authority");
  await expect(authority).not.toContainText("docs/r2.md");

  await expect(page.getByRole("button", { name: "Technical details", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await expect(page.getByTestId("selected-view-context")).toContainText("docs/r2.md");
  await page.getByRole("button", { name: "Close context", exact: true }).click();
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
  await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
  const exactBytes = page.getByTestId("raw-content-view");
  await expect(exactBytes).toBeVisible();
  await expect(exactBytes).toContainText("invalid lifecycle");
  const codeBlock = exactBytes.locator("pre");
  await expect(codeBlock).toBeVisible();
  const material = page.locator(".order-workbench-surface-material").last();
  const [exactBytesBox, codeBlockBox, materialBox] = await Promise.all([
    exactBytes.boundingBox(),
    codeBlock.boundingBox(),
    material.boundingBox(),
  ]);
  expect(exactBytesBox).not.toBeNull();
  expect(codeBlockBox).not.toBeNull();
  expect(materialBox).not.toBeNull();
  expect(exactBytesBox!.height).toBeGreaterThan(materialBox!.height * 0.6);
  expect(codeBlockBox!.height).toBeGreaterThan(exactBytesBox!.height * 0.9);
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
  await expect(dialog).toContainText("Parent");
  await expect(dialog).toContainText("Completed investigation");
  await expect(dialog).toContainText("Completed parent Investigation · same project");
  await expect(dialog).not.toContainText(parent.id);
  await expect(dialog).not.toContainText("investigation-v1");
  await expect(dialog.getByTestId("linked-remediation-project")).toContainText(parent.projectId);
  await expect(dialog.getByRole("combobox", { name: "Project Required" })).toHaveCount(0);
  await expect(dialog.getByRole("radio", { name: "Change" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Defect" })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Investigation" })).toHaveCount(0);
  await expect(dialog.getByRole("radio", { name: "Audit" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();

  await dialog.getByRole("radio", { name: "Defect" }).click();
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
  await expect(page.locator(".order-workitem-kind")).toHaveText("Defect");
  const child = await workItemForTitle(page, "Remediate investigation finding");
  expect(child.schemaId).toBe("defect-v2");
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
  await expect(page.getByTestId("workflow-step-index")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);
  await openDisclosureResource(
    page,
    "Package material",
    "Inspect task: Prove the browser candidate surface",
  );
  await expect(page.getByTestId("approval-task-detail"))
    .toContainText("Prove the browser candidate surface");

  await selectWorkflowStep(page, "Implementation");
  await expect(page.getByTestId("execution-workspace")).toBeVisible();
  for (const authorityLabel of [
    "Requirements",
    "Solution design",
    "Implementation plan",
  ] as const) {
    const authority = page.getByRole("button", {
      name: "Open " + authorityLabel,
      exact: true,
    });
    await authority.scrollIntoViewIfNeeded();
    await authority.click();
    await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
    await expect(page.locator("textarea")).toHaveCount(0);
    await page.getByRole("button", { name: "Back to workflow context" }).click();
    await expect(page.getByTestId("execution-workspace")).toBeVisible();
  }
  await selectWorkflowMaterial(page, "Implementation agent · Attempt 1");
  await expect(
    page.getByText("Candidate state recorded", { exact: true }),
  ).toBeVisible();

  await selectWorkflowMaterial(page, "Independent review · Attempt 1");
  await expect(page.getByRole("region", { name: "Agent activity" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Agent activity" }))
    .toContainText("Reviewing candidate evidence");
  await expect(page.getByRole("region", { name: "Workflow activity" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Timeline technical details", exact: true }))
    .toHaveCount(0);
  await expect(
    page.getByText("Independent review passed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Verified candidate recorded", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByTestId("execution-task-detail")
      .getByText("Prove the browser candidate surface", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  const validation = page.getByTestId("validation-matrix");
  await expect(validation).toContainText("Recorded boundary: complete");
  await expect(validation).not.toContainText("Current boundary: none");
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
  await expect(page.getByRole("heading", { name: "Evidence", exact: true })).toBeVisible();
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
