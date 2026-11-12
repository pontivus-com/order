import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  RunEventSchema,
  RunSchema,
  WorkItemSchema,
  WorkItemSourceSnapshotSchema,
} from "../src/core/contracts.ts";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:17347";
const stateRoot = process.env.PONTIVUS_ORDER_TEST_STATE_ROOT;
if (stateRoot === undefined || stateRoot.length === 0) {
  throw new TypeError("PONTIVUS_ORDER_TEST_STATE_ROOT is required");
}
const daemonToken = readFileSync(join(stateRoot, "daemon-token"), "utf8").trim();
const workItemRoot = stateRoot + "-work-items";

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

test("appearance uses the Astryx theme control, follows system mode, and persists explicit overrides", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await authenticate(page, request);

  const root = page.locator("html");
  const layout = page.getByTestId("workbench-layout");
  const theme = page.getByLabel("Theme");

  await expect(theme).toHaveValue("system");
  await expect(root).not.toHaveAttribute("data-theme");
  await expect(root).toHaveAttribute("data-astryx-theme");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await expect(page.getByTestId("workbench-search")).toHaveCSS(
    "background-color",
    "rgb(17, 26, 41)",
  );

  await theme.selectOption("light");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.reload();
  await expect(page.getByLabel("Theme")).toHaveValue("light");

  await page.getByLabel("Theme").selectOption("dark");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await page.reload();
  await expect(page.getByLabel("Theme")).toHaveValue("dark");

  await page.getByLabel("Theme").selectOption("system");
  await expect(root).not.toHaveAttribute("data-theme");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(layout).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(layout).toHaveCSS("background-color", "rgb(17, 26, 41)");
  await page.reload();
  await expect(page.getByLabel("Theme")).toHaveValue("system");
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
  await expect(page.getByTestId("source-diagnostics")).toContainText("invalid-source.md");
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
    '[data-testid="document-workspace"], [data-testid="dialogue-workspace"], [data-testid="review-workspace"], [data-testid="execution-workspace"], [data-testid="evidence-workspace"]',
  )).toHaveCount(0);

  await page.goBack();
  await expect(page.getByTestId("work-item-queue")).toBeVisible();
  await page.goForward();
  await expect(page.getByTestId("work-item-workspace")).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.getByTestId("work-item-context")).toHaveCount(0);
  await page.getByRole("button", { name: "Context" }).click();
  await expect(page.getByTestId("work-item-context-drawer")).toBeVisible();
  await expect(page.getByTestId("work-item-context-drawer").locator('[data-testid="dialogue-workspace"]')).toHaveCount(0);
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

test("workbench geometry gives the active task the canvas and recomposes narrow queue rows", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await authenticate(page, request);
  await openWorkItem(page, "Lifecycle editing workbench");

  await expect(page.getByRole("button", { name: "Context" })).toHaveCount(0);
  await expect(page.getByTestId("workbench-search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Refresh sources" })).toHaveCount(0);
  await page.getByRole("radio", { name: "Documents" }).click();
  await expect(page.getByRole("tablist")).toHaveCount(1);

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();

  const workspace = page.getByTestId("document-workspace");
  const editor = page.getByLabel("PLAN lifecycle document Markdown");
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

test("persisted proposal disposition is caught by polling and sign-off review remains explicit", async ({
  page,
  request,
}) => {
  await authenticate(page, request);
  await openWorkItem(page, "Proposal review");

  await expect(page.getByTestId("dialogue-workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: "Review proposal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  await expect(page.getByLabel("Message input")).toBeVisible();

  await page.getByRole("button", { name: "Review proposal" }).click();
  await expect(page.getByTestId("proposal-review-workspace")).toBeVisible();
  await expect(page.getByTestId("proposal-review-diff")).toBeVisible();
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
  await expect(page.getByText("REJECTED", { exact: true }).first()).toBeVisible({
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
  await expect(page.getByText("T1", { exact: true })).toBeVisible();
  await expect(page.getByText("Prove the browser candidate surface", { exact: true })).toBeVisible();
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
  const sourceEditor = page.getByLabel("WorkItem source Markdown");
  await expect(sourceEditor).toBeVisible();
  const original = await sourceEditor.inputValue();

  await sourceEditor.fill(original + "\nlocal unsaved buffer\n");
  const item = await workItemForTitle(page, "Source editing workbench");
  const sourceResponse = await page.context().request.get(
    "/api/work-items/" + item.id + "/source",
  );
  expect(sourceResponse.status()).toBe(200);
  const source = WorkItemSourceSnapshotSchema.parse(await sourceResponse.json());
  const sourcePath = join(workItemRoot, source.path);
  const external = readFileSync(sourcePath, "utf8").replace(
    "# Source editing workbench",
    "# Source editing externally changed",
  );
  writeFileSync(sourcePath, external);

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/canonical file changed while this buffer was open/i)).toBeVisible();
  expect(await sourceEditor.inputValue()).toContain("local unsaved buffer");
  expect(readFileSync(sourcePath, "utf8")).toBe(external);

  await page.getByRole("button", { name: "Reload current" }).click();
  await expect(sourceEditor).toHaveValue(/# Source editing externally changed/);
  const current = await sourceEditor.inputValue();

  await sourceEditor.fill(current + "\nwill be cancelled\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(sourceEditor).toHaveValue(current);

  await sourceEditor.fill(current + "\nsaved through browser workbench\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(sourceEditor).toHaveValue(/saved through browser workbench/);
  await expect.poll(() => readFileSync(sourcePath, "utf8")).toContain(
    "saved through browser workbench",
  );

  await expect(page.getByTestId("work-item-context").getByText("R1", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign off exact package" })).toHaveCount(0);

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();
  await expect(page.getByTestId("markdown-readonly")).toBeVisible();
  await expect(page.getByLabel("PLAN lifecycle document Markdown")).toHaveCount(0);
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
  const planEditor = page.getByLabel("PLAN lifecycle document Markdown");
  await expect(planEditor).toBeVisible();
  const initial = await planEditor.inputValue();
  await planEditor.fill(initial + "\nunsaved guard\n");

  await page.getByRole("button", { name: "Back to work queue" }).click();
  const guard = page.getByRole("alertdialog", { name: "Discard unsaved Markdown?" });
  await expect(guard).toBeVisible();
  await guard.getByRole("button", { name: "Continue editing" }).click();
  await expect(planEditor).toHaveValue(/unsaved guard/);

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
  await expect(page.getByLabel("R3 lifecycle document Markdown")).toHaveCount(0);

  await page.getByTestId("governed-document-nav")
    .getByRole("tab", { name: "PLAN" })
    .click();
  const editablePlan = page.getByLabel("PLAN lifecycle document Markdown");
  const fresh = await editablePlan.inputValue();
  await editablePlan.fill(fresh + "\ncancelled plan edit\n");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(editablePlan).toHaveValue(fresh);

  await editablePlan.fill(fresh + "\nsaved plan edit\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(editablePlan).toHaveValue(/saved plan edit/);
  await expect(page.getByTestId("work-item-context").getByText("PLAN", { exact: true }).first()).toBeVisible();
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
  await expect(page.getByLabel("R1 lifecycle document Markdown")).toHaveCount(0);

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
  await page.getByRole("button", { name: /REVIEWER #1/ }).click();
  await expect(page.getByText("CANDIDATE_DONE", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("T1", { exact: true })).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);

  for (const stage of ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"]) {
    await expect(page.getByText(stage, { exact: true }).first()).toBeVisible();
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
