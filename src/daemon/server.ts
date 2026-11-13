import { Database } from "bun:sqlite";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { extname, resolve, sep } from "node:path";

import { orderVersion } from "../version.ts";
import {
  ArtifactRefIdSchema,
  CommitWorkItemDocumentationSchema,
  ConnectRepositorySchema,
  DisconnectRepositorySchema,
  MigrateWorkItemDocumentRootSchema,
  CreateWorkItemSourceSchema,
  ExpectedHashMarkdownWriteSchema,
  ActivateOpenCodeAccountSchema,
  OpenCodeAccountIdSchema,
  OpenCodeAccountLoginAttemptIdSchema,
  OrderHttpErrorSchema,
  RemoveOpenCodeAccountSchema,
  RenameOpenCodeAccountSchema,
  StartOpenCodeAccountLoginSchema,
  UpdateConfiguredModelSchema,
  UpdateReferenceRootsSchema,
  SetWorkItemArchivedSchema,
  UpdateWorkItemTitleSchema,
  RunEventIdSchema,
  RunIdSchema,
  RunModeSchema,
  Sha256Schema,
  WorkItemIdSchema,
} from "../core/contracts.ts";
import { readOrderConfig } from "../shell/config.ts";
import {
  isoDateTimeFromEpochMillis,
  loadOrCreateDaemonToken,
  resolveStateRoot,
  secureTokenHex,
} from "../shell/runtime.ts";
import { openOrderDatabase } from "../shell/sqlite.ts";
import { gitVersion } from "../shell/repository.ts";
import {
  adoptArtifactProposal,
  cancelRun,
  commitDocumentation,
  createCoordinatorRuntime,
  createWorkItem,
  getDocumentationGitStatus,
  getRun,
  getWorkItem,
  getWorkItemSource,
  getWorkItemSourceDiagnostics,
  listArtifacts,
  listCurrentLifecycleArtifacts,
  listExecutionTasks,
  listProjects,
  listWorkItemSchemas,
  listRunEvents,
  listRuns,
  listWorkItems,
  signoffPackageForWorkItem,
  readArtifactContent,
  readReferencedEvidence,
  reconcileSources,
  rejectArtifactProposal,
  resumeWorkItem,
  saveArtifactContent,
  saveSource,
  sourceDiagnosticForFailure,
  setArchived,
  signOffWorkItem,
  startStageRun,
  stopCoordinatorScheduler,
  submitRunInput,
  updateTitle,
  type CoordinatorRuntime,
} from "./coordinator.ts";
import {
  activateSavedOpenCodeAccount,
  cancelSavedOpenCodeAccountLogin,
  openCodeAccountState,
  pollSavedOpenCodeAccountLogin,
  removeSavedOpenCodeAccount,
  renameSavedOpenCodeAccount,
  startSavedOpenCodeAccountLogin,
  stopSavedOpenCodeAccountControl,
} from "./opencode-account.ts";
import {
  availableOpenCodeModels,
  connectRepository,
  connectedRepositoryStates,
  createCoordinatorRuntimeOwner,
  disconnectRepository,
  installationReadiness,
  migrateWorkItemDocumentRoot,
  orderConfigState,
  readyRepositoryRoots,
  requireExecutionReadiness,
  requireStageRunReadiness,
  resumeSchedulerForReadiness,
  runReadyCoordinatorTick,
  updateConfiguredModel,
  updateReferenceRoots,
  type CoordinatorRuntimeOwner,
} from "./settings.ts";

const connectTokenLifetimeMillis = 60_000;
const tokenPattern = /^[0-9a-f]{64}$/;

type BindAddress = Readonly<{
  hostname: "127.0.0.1" | "::1";
  port: number;
  origin: string;
}>;

export const resolveDaemonBind = (
  value = process.env.PONTIVUS_ORDER_BIND ?? "127.0.0.1:7347",
): BindAddress => {
  const ipv4 = /^(127\.0\.0\.1):([0-9]+)$/.exec(value);
  const ipv6 = /^\[::1\]:([0-9]+)$/.exec(value);
  const hostname: BindAddress["hostname"] | undefined =
    ipv4 ? "127.0.0.1" : ipv6 ? "::1" : undefined;
  const rawPort = ipv4?.[2] ?? ipv6?.[1];
  if (hostname === undefined || rawPort === undefined) {
    throw new TypeError("PONTIVUS_ORDER_BIND must be loopback 127.0.0.1:<port> or [::1]:<port>");
  }
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new TypeError("PONTIVUS_ORDER_BIND port must be an integer from 1 through 65535");
  }
  return {
    hostname,
    port,
    origin: hostname === "::1"
      ? `http://[::1]:${port}`
      : `http://127.0.0.1:${port}`,
  };
};

type LocalSessions = {
  readonly daemonToken: string;
  readonly browserSessions: Set<string>;
  readonly connectTokens: Map<string, number>;
};

const commonHeaders = (): Headers => {
  const headers = new Headers();
  headers.set("Referrer-Policy", "no-referrer");
  return headers;
};

const jsonResponse = (
  value: unknown,
  status = 200,
  extra?: HeadersInit,
): Response => {
  const headers = commonHeaders();
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (extra) {
    for (const [name, value] of new Headers(extra)) headers.set(name, value);
  }
  return new Response(JSON.stringify(value), { status, headers });
};

const rawResponse = (bytes: Uint8Array): Response => {
  const headers = commonHeaders();
  headers.set("Content-Type", "application/octet-stream");
  const body = new Uint8Array(bytes.byteLength);
  body.set(bytes);
  return new Response(body.buffer, { status: 200, headers });
};

const errorResponse = (
  status: number,
  code: string,
  message: string,
  sourceDiagnostic: ReturnType<typeof sourceDiagnosticForFailure> = null,
): Response =>
  jsonResponse(OrderHttpErrorSchema.parse({
    code,
    message,
    sourceDiagnostic,
  }), status);

type BadRequestFailure = TypeError & Readonly<{ orderHttpStatus: 400 }>;

const badRequest = (message: string): BadRequestFailure =>
  Object.assign(new TypeError(message), { orderHttpStatus: 400 as const });

const isZodFailure = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name?: unknown }).name === "ZodError";

const parseRequest = async <T>(
  parse: () => T | Promise<T>,
): Promise<T> => {
  try {
    return await parse();
  } catch (error) {
    if (isZodFailure(error)) {
      throw badRequest(error instanceof Error ? error.message : "Invalid request");
    }
    throw error;
  }
};

export const classifyHttpFailure = (
  error: unknown,
): Readonly<{
  status: 400 | 404 | 409 | 500;
  code: string;
  message: string;
  sourceDiagnostic: ReturnType<typeof sourceDiagnosticForFailure>;
}> => {
  const sourceDiagnostic = sourceDiagnosticForFailure(error);
  if (sourceDiagnostic !== null) {
    return {
      status: 409,
      code: "WORK_ITEM_SOURCE_CONFLICT",
      message: sourceDiagnostic.detail,
      sourceDiagnostic,
    };
  }

  if (
    error instanceof TypeError &&
    "orderHttpStatus" in error &&
    (error as { orderHttpStatus?: unknown }).orderHttpStatus === 400
  ) {
    return {
      status: 400,
      code: "INVALID_REQUEST",
      message: error instanceof Error ? error.message : "Invalid request",
      sourceDiagnostic: null,
    };
  }

  if (
    error instanceof TypeError &&
    /(?:WorkItem|ArtifactRef|Approval|Run|RunEvent|execution task|OpenCode account(?: login attempt)?) does not exist/.test(error.message)
  ) {
    return {
      status: 404,
      code: "NOT_FOUND",
      message: error.message,
      sourceDiagnostic: null,
    };
  }

  if (error instanceof TypeError) {
    return {
      status: 409,
      code: "CURRENT_STATE_CONFLICT",
      message: error.message,
      sourceDiagnostic: null,
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Internal daemon error",
    sourceDiagnostic: null,
  };
};

const parseCookie = (request: Request, name: string): string | null => {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
};

const hasBrowserSession = (
  request: Request,
  sessions: LocalSessions,
): boolean => {
  const session = parseCookie(request, "pontivus_order_session");
  return session !== null &&
    tokenPattern.test(session) &&
    sessions.browserSessions.has(session);
};

const hasDaemonBearer = (
  request: Request,
  sessions: LocalSessions,
): boolean =>
  request.headers.get("authorization") === `Bearer ${sessions.daemonToken}`;

const requireBrowserQuery = (
  request: Request,
  sessions: LocalSessions,
): Response | null =>
  hasBrowserSession(request, sessions)
    ? null
    : errorResponse(401, "UNAUTHORIZED", "browser session required");

const requireBrowserMutation = (
  request: Request,
  sessions: LocalSessions,
  origin: string,
): Response | null => {
  if (!hasBrowserSession(request, sessions)) {
    return errorResponse(401, "UNAUTHORIZED", "browser session required");
  }
  if (request.headers.get("origin") !== origin) {
    return errorResponse(403, "ORIGIN_REJECTED", "exact daemon Origin required");
  }
  return null;
};

const requireCliBearer = (
  request: Request,
  sessions: LocalSessions,
): Response | null =>
  hasDaemonBearer(request, sessions)
    ? null
    : errorResponse(401, "UNAUTHORIZED", "daemon Bearer token required");

const readJsonBody = async (request: Request): Promise<Record<string, unknown>> => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw badRequest("Content-Type must be application/json");
  }
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw badRequest("request body must contain valid JSON");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest("request body must be a JSON object");
  }
  return value as Record<string, unknown>;
};

const requireKeys = (
  value: Record<string, unknown>,
  required: readonly string[],
): void => {
  const actual = Object.keys(value).sort();
  const expected = [...required].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw badRequest(`request body must contain exactly: ${expected.join(", ")}`);
  }
};

const requireString = (
  body: Record<string, unknown>,
  key: string,
): string => {
  const value = body[key];
  if (typeof value !== "string") throw badRequest(`${key} must be a string`);
  return value;
};

const staticRoot = (): string => {
  const root = fileURLToPath(new URL("../../dist/", import.meta.url));
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new TypeError("production dist/ directory does not exist");
  }
  const index = resolve(root, "index.html");
  if (
    !existsSync(index) ||
    !lstatSync(index).isFile() ||
    lstatSync(index).isSymbolicLink()
  ) {
    throw new TypeError("dist/index.html must exist as a regular file");
  }
  return realpathSync(root);
};

const mimeType = (path: string): string => {
  switch (extname(path)) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "text/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    case ".png": return "image/png";
    case ".ico": return "image/x-icon";
    default: return "application/octet-stream";
  }
};

const staticResponse = (
  root: string,
  pathname: string,
): Response => {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return errorResponse(400, "INVALID_PATH", "invalid static path encoding");
  }
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const candidate = resolve(root, relative);
  const inside = candidate === root || candidate.startsWith(`${root}${sep}`);
  let target = inside ? candidate : resolve(root, "index.html");
  if (
    !inside ||
    !existsSync(target) ||
    !lstatSync(target).isFile() ||
    lstatSync(target).isSymbolicLink()
  ) {
    target = resolve(root, "index.html");
  }
  const real = realpathSync(target);
  if (real !== root && !real.startsWith(`${root}${sep}`)) {
    return errorResponse(404, "NOT_FOUND", "static resource not found");
  }
  const headers = commonHeaders();
  headers.set("Content-Type", mimeType(real));
  return new Response(readFileSync(real), { status: 200, headers });
};

const purgeExpiredConnectTokens = (
  sessions: LocalSessions,
  now = Date.now(),
): void => {
  for (const [token, expiresAt] of sessions.connectTokens) {
    if (expiresAt <= now) sessions.connectTokens.delete(token);
  }
};

const mintConnectToken = (
  sessions: LocalSessions,
): Readonly<{ token: string; expiresAt: string }> => {
  purgeExpiredConnectTokens(sessions);
  const token = secureTokenHex();
  const expiresAtMillis = Date.now() + connectTokenLifetimeMillis;
  sessions.connectTokens.set(token, expiresAtMillis);
  return {
    token,
    expiresAt: isoDateTimeFromEpochMillis(expiresAtMillis),
  };
};

const consumeConnectToken = (
  sessions: LocalSessions,
  token: string | null,
): string | null => {
  purgeExpiredConnectTokens(sessions);
  if (token === null || !tokenPattern.test(token)) return null;
  const expiresAt = sessions.connectTokens.get(token);
  sessions.connectTokens.delete(token);
  if (expiresAt === undefined || expiresAt <= Date.now()) return null;
  const browserSession = secureTokenHex();
  sessions.browserSessions.add(browserSession);
  return browserSession;
};

const apiPath = (url: URL): string[] =>
  url.pathname.split("/").filter((part) => part.length > 0);


const requireOpenCodeAccountStableForRunStart = (
  owner: CoordinatorRuntimeOwner,
): void => {
  const runtime = owner.current;
  if (
    owner.settingsMutationActive ||
    runtime.openCodeAccountMutationActive ||
    runtime.openCodeAccountLogin !== null
  ) {
    throw new TypeError(
      "Run start is blocked while installation/account configuration is changing",
    );
  }
};

const pauseSchedulerForOpenCodeAccountMutation = (
  owner: CoordinatorRuntimeOwner,
): CoordinatorRuntime => {
  const runtime = owner.current;
  if (owner.settingsMutationActive) {
    throw new TypeError(
      "OpenCode account mutation is blocked while Settings configuration is changing",
    );
  }
  if (runtime.tickActive) {
    throw new TypeError(
      "OpenCode account mutation is blocked while coordinator work is being admitted",
    );
  }
  if (runtime.schedulerTimer !== null) {
    clearTimeout(runtime.schedulerTimer);
    runtime.schedulerTimer = null;
  }
  return runtime;
};

const resumeSchedulerAfterOpenCodeAccountMutation = async (
  owner: CoordinatorRuntimeOwner,
): Promise<void> => {
  const runtime = owner.current;
  if (
    runtime.openCodeAccountLogin === null &&
    !runtime.openCodeAccountMutationActive
  ) {
    await resumeSchedulerForReadiness(owner);
  }
};

const routeApi = async (
  owner: CoordinatorRuntimeOwner,
  sessions: LocalSessions,
  bind: BindAddress,
  request: Request,
  url: URL,
): Promise<Response> => {
  const runtime = owner.current;
  if (request.method === "GET" && url.pathname === "/api/health") {
    return jsonResponse({ status: "ok", version: orderVersion });
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/auth/connect-token"
  ) {
    const auth = requireCliBearer(request, sessions);
    if (auth) return auth;
    const body = await readJsonBody(request);
    requireKeys(body, []);
    return jsonResponse(mintConnectToken(sessions));
  }

  if (request.method === "POST" && url.pathname === "/api/tick") {
    const auth = hasDaemonBearer(request, sessions)
      ? null
      : requireBrowserMutation(request, sessions, bind.origin);
    if (auth) return auth;
    const body = await readJsonBody(request);
    requireKeys(body, []);
    try {
      requireOpenCodeAccountStableForRunStart(owner);
      await requireExecutionReadiness(owner);
      return jsonResponse(await runReadyCoordinatorTick(owner));
    } catch (error) {
      if (error instanceof TypeError && error.message === "TICK_ALREADY_ACTIVE") {
        return errorResponse(409, "TICK_ALREADY_ACTIVE", "coordinator tick already active");
      }
      throw error;
    }
  }

  const parts = apiPath(url);
  const browserAuth = request.method === "GET"
    ? requireBrowserQuery(request, sessions)
    : requireBrowserMutation(request, sessions, bind.origin);
  if (browserAuth) return browserAuth;

  if (request.method === "GET" && url.pathname === "/api/settings/config") {
    return jsonResponse(orderConfigState(owner));
  }
  if (request.method === "GET" && url.pathname === "/api/settings/readiness") {
    return jsonResponse(await installationReadiness(owner));
  }
  if (request.method === "GET" && url.pathname === "/api/settings/repositories") {
    return jsonResponse(await connectedRepositoryStates(runtime.config));
  }
  if (request.method === "GET" && url.pathname === "/api/settings/models") {
    return jsonResponse(await availableOpenCodeModels(owner));
  }
  if (request.method === "POST" && url.pathname === "/api/settings/repositories/connect") {
    const body = await parseRequest(async () =>
      ConnectRepositorySchema.parse(await readJsonBody(request))
    );
    return jsonResponse(await connectRepository(owner, body));
  }
  if (request.method === "POST" && url.pathname === "/api/settings/repositories/disconnect") {
    const body = await parseRequest(async () =>
      DisconnectRepositorySchema.parse(await readJsonBody(request))
    );
    return jsonResponse(await disconnectRepository(owner, body));
  }
  if (
    request.method === "PUT" &&
    url.pathname === "/api/settings/repositories/document-root"
  ) {
    const body = await parseRequest(async () =>
      MigrateWorkItemDocumentRootSchema.parse(await readJsonBody(request))
    );
    return jsonResponse(await migrateWorkItemDocumentRoot(owner, body));
  }
  if (request.method === "PUT" && url.pathname === "/api/settings/model") {
    const body = await parseRequest(async () =>
      UpdateConfiguredModelSchema.parse(await readJsonBody(request))
    );
    return jsonResponse(await updateConfiguredModel(owner, body));
  }
  if (request.method === "PUT" && url.pathname === "/api/settings/reference-roots") {
    const body = await parseRequest(async () =>
      UpdateReferenceRootsSchema.parse(await readJsonBody(request))
    );
    return jsonResponse(await updateReferenceRoots(owner, body));
  }

  if (request.method === "GET" && url.pathname === "/api/opencode/accounts") {
    return jsonResponse(await openCodeAccountState(runtime));
  }

  if (request.method === "POST" && url.pathname === "/api/opencode/accounts/login") {
    const body = await parseRequest(async () =>
      StartOpenCodeAccountLoginSchema.parse(await readJsonBody(request))
    );
    pauseSchedulerForOpenCodeAccountMutation(owner);
    try {
      return jsonResponse(await startSavedOpenCodeAccountLogin(runtime, body), 201);
    } catch (error) {
      await resumeSchedulerAfterOpenCodeAccountMutation(owner);
      throw error;
    }
  }

  if (
    parts[0] === "api" &&
    parts[1] === "opencode" &&
    parts[2] === "accounts" &&
    parts[3] === "login" &&
    parts[4] &&
    parts.length === 5
  ) {
    const attemptId = await parseRequest(() =>
      OpenCodeAccountLoginAttemptIdSchema.parse(parts[4])
    );
    if (request.method === "GET") {
      const attempt = await pollSavedOpenCodeAccountLogin(runtime, attemptId);
      if (attempt.status !== "PENDING") {
        await resumeSchedulerAfterOpenCodeAccountMutation(owner);
      }
      return jsonResponse(attempt);
    }
    if (request.method === "DELETE") {
      await cancelSavedOpenCodeAccountLogin(runtime, attemptId);
      await resumeSchedulerAfterOpenCodeAccountMutation(owner);
      return new Response(null, { status: 204, headers: commonHeaders() });
    }
  }

  if (
    parts[0] === "api" &&
    parts[1] === "opencode" &&
    parts[2] === "accounts" &&
    parts[3] &&
    parts[3] !== "login"
  ) {
    const accountId = await parseRequest(() => OpenCodeAccountIdSchema.parse(parts[3]));
    if (parts.length === 4 && request.method === "DELETE") {
      const body = await parseRequest(async () =>
        RemoveOpenCodeAccountSchema.parse(await readJsonBody(request))
      );
      pauseSchedulerForOpenCodeAccountMutation(owner);
      try {
        return jsonResponse(await removeSavedOpenCodeAccount(runtime, accountId, body));
      } finally {
        await resumeSchedulerAfterOpenCodeAccountMutation(owner);
      }
    }
    if (parts.length === 4 && request.method === "PATCH") {
      const body = await parseRequest(async () =>
        RenameOpenCodeAccountSchema.parse(await readJsonBody(request))
      );
      pauseSchedulerForOpenCodeAccountMutation(owner);
      try {
        return jsonResponse(await renameSavedOpenCodeAccount(runtime, accountId, body));
      } finally {
        await resumeSchedulerAfterOpenCodeAccountMutation(owner);
      }
    }
    if (
      parts.length === 5 &&
      parts[4] === "activate" &&
      request.method === "POST"
    ) {
      const body = await parseRequest(async () =>
        ActivateOpenCodeAccountSchema.parse(await readJsonBody(request))
      );
      pauseSchedulerForOpenCodeAccountMutation(owner);
      try {
        return jsonResponse(await activateSavedOpenCodeAccount(runtime, accountId, body));
      } finally {
        await resumeSchedulerAfterOpenCodeAccountMutation(owner);
      }
    }
  }

  if (request.method === "GET" && url.pathname === "/api/work-items") {
    const includeArchived = url.searchParams.get("includeArchived");
    if (
      (includeArchived !== null && includeArchived !== "true") ||
      [...url.searchParams.keys()].some((key) => key !== "includeArchived")
    ) {
      throw badRequest("includeArchived query must be exact true or absent");
    }
    return jsonResponse(listWorkItems(runtime, includeArchived === "true"));
  }

  if (request.method === "GET" && url.pathname === "/api/work-item-schemas") {
    return jsonResponse(listWorkItemSchemas());
  }

  if (request.method === "GET" && url.pathname === "/api/projects") {
    return jsonResponse(await listProjects(runtime, await readyRepositoryRoots(runtime.config)));
  }

  if (request.method === "GET" && url.pathname === "/api/work-item-sources/diagnostics") {
    return jsonResponse(await getWorkItemSourceDiagnostics(
      runtime,
      await readyRepositoryRoots(runtime.config),
    ));
  }

  if (request.method === "POST" && url.pathname === "/api/work-item-sources/reconcile") {
    const body = await readJsonBody(request);
    requireKeys(body, []);
    return jsonResponse(await reconcileSources(
      runtime,
      await readyRepositoryRoots(runtime.config),
    ));
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/work-items"
  ) {
    const body = await parseRequest(async () =>
      CreateWorkItemSourceSchema.parse(await readJsonBody(request))
    );
    return jsonResponse(await createWorkItem(
      runtime,
      body,
      await readyRepositoryRoots(runtime.config),
    ), 201);
  }

  if (parts[0] === "api" && parts[1] === "work-items" && parts[2]) {
    const workItemId = await parseRequest(() => WorkItemIdSchema.parse(parts[2]));

    if (parts.length === 3 && request.method === "GET") {
      return jsonResponse(getWorkItem(runtime, workItemId));
    }
    if (parts[3] === "artifacts" && parts.length === 4 && request.method === "GET") {
      return jsonResponse(listArtifacts(runtime, workItemId));
    }
    if (
      parts[3] === "lifecycle-artifacts" &&
      parts.length === 4 &&
      request.method === "GET"
    ) {
      return jsonResponse(await listCurrentLifecycleArtifacts(runtime, workItemId));
    }
    if (parts[3] === "source" && parts.length === 4 && request.method === "GET") {
      return jsonResponse(await getWorkItemSource(runtime, workItemId));
    }
    if (parts[3] === "source" && parts.length === 4 && request.method === "PUT") {
      const body = await parseRequest(async () =>
        ExpectedHashMarkdownWriteSchema.parse(await readJsonBody(request))
      );
      return jsonResponse(await saveSource(runtime, workItemId, body));
    }
    if (parts[3] === "title" && parts.length === 4 && request.method === "PATCH") {
      const body = await parseRequest(async () =>
        UpdateWorkItemTitleSchema.parse(await readJsonBody(request))
      );
      return jsonResponse(await updateTitle(runtime, workItemId, body));
    }
    if (parts[3] === "archive" && parts.length === 4 && request.method === "PATCH") {
      const body = await parseRequest(async () =>
        SetWorkItemArchivedSchema.parse(await readJsonBody(request))
      );
      return jsonResponse(await setArchived(runtime, workItemId, body));
    }
    if (
      parts[3] === "documentation-git-status" &&
      parts.length === 4 &&
      request.method === "GET"
    ) {
      return jsonResponse(await getDocumentationGitStatus(runtime, workItemId));
    }
    if (
      parts[3] === "documentation-commit" &&
      parts.length === 4 &&
      request.method === "POST"
    ) {
      const body = await parseRequest(async () =>
        CommitWorkItemDocumentationSchema.parse(await readJsonBody(request))
      );
      return jsonResponse(await commitDocumentation(runtime, workItemId, body));
    }
    if (parts[3] === "tasks" && parts.length === 4 && request.method === "GET") {
      return jsonResponse(await listExecutionTasks(runtime, workItemId));
    }
    if (parts[3] === "signoff-package" && parts.length === 4 && request.method === "GET") {
      return jsonResponse(await signoffPackageForWorkItem(runtime, workItemId));
    }
    if (parts[3] === "runs" && parts.length === 4) {
      if (request.method === "GET") {
        return jsonResponse(listRuns(runtime, workItemId));
      }
      if (request.method === "POST") {
        const body = await readJsonBody(request);
        requireKeys(body, ["mode"]);
        const mode = await parseRequest(() => RunModeSchema.parse(body.mode));
        requireOpenCodeAccountStableForRunStart(owner);
        await requireStageRunReadiness(owner, workItemId);
        return jsonResponse(await startStageRun(runtime, workItemId, mode), 201);
      }
    }
    if (parts[3] === "resume" && parts.length === 4 && request.method === "POST") {
      const body = await readJsonBody(request);
      requireKeys(body, []);
      return jsonResponse(await resumeWorkItem(runtime, workItemId));
    }
    if (parts[3] === "signoff" && parts.length === 4 && request.method === "POST") {
      const body = await readJsonBody(request);
      requireKeys(body, ["expectedPackageHash", "approvedBy"]);
      return jsonResponse(await signOffWorkItem(
        runtime,
        workItemId,
        await parseRequest(() => Sha256Schema.parse(body.expectedPackageHash)),
        requireString(body, "approvedBy"),
      ));
    }
  }

  if (parts[0] === "api" && parts[1] === "runs" && parts[2]) {
    const runId = await parseRequest(() => RunIdSchema.parse(parts[2]));
    if (parts[3] === "events" && parts.length === 4 && request.method === "GET") {
      const raw = url.searchParams.get("afterSequence") ?? "0";
      if (!/^[0-9]+$/.test(raw)) throw badRequest("afterSequence must be a non-negative integer");
      return jsonResponse(listRunEvents(runtime, runId, Number(raw)));
    }
    if (parts[3] === "evidence" && parts.length === 4 && request.method === "GET") {
      const path = url.searchParams.get("path");
      if (path === null) throw badRequest("evidence path query parameter is required");
      return rawResponse(readReferencedEvidence(runtime, runId, path));
    }
    if (parts[3] === "input" && parts.length === 4 && request.method === "POST") {
      const body = await readJsonBody(request);
      requireKeys(body, ["text", "requestEventId"]);
      const rawEventId = body.requestEventId;
      const requestEventId = rawEventId === null
        ? null
        : await parseRequest(() => RunEventIdSchema.parse(rawEventId));
      return jsonResponse(await submitRunInput(
        runtime,
        runId,
        requireString(body, "text"),
        requestEventId,
      ));
    }
    if (parts[3] === "cancel" && parts.length === 4 && request.method === "POST") {
      const body = await readJsonBody(request);
      requireKeys(body, []);
      return jsonResponse(await cancelRun(runtime, runId));
    }
  }

  if (
    parts[0] === "api" &&
    parts[1] === "run-events" &&
    parts[2] &&
    parts.length === 4 &&
    request.method === "POST"
  ) {
    const proposalEventId = await parseRequest(() => RunEventIdSchema.parse(parts[2]));
    const body = await readJsonBody(request);
    requireKeys(body, []);
    if (parts[3] === "adopt") {
      return jsonResponse(await adoptArtifactProposal(runtime, proposalEventId));
    }
    if (parts[3] === "reject") {
      return jsonResponse(rejectArtifactProposal(runtime, proposalEventId));
    }
  }

  if (
    parts[0] === "api" &&
    parts[1] === "artifacts" &&
    parts[2] &&
    parts[3] === "content" &&
    parts.length === 4 &&
    request.method === "GET"
  ) {
    return rawResponse(await readArtifactContent(
      runtime,
      await parseRequest(() => ArtifactRefIdSchema.parse(parts[2])),
    ));
  }

  if (
    parts[0] === "api" &&
    parts[1] === "artifacts" &&
    parts[2] &&
    parts[3] === "content" &&
    parts.length === 4 &&
    request.method === "PUT"
  ) {
    const body = await parseRequest(async () =>
        ExpectedHashMarkdownWriteSchema.parse(await readJsonBody(request))
      );
    return jsonResponse(await saveArtifactContent(
      runtime,
      await parseRequest(() => ArtifactRefIdSchema.parse(parts[2])),
      body,
    ));
  }

  return errorResponse(404, "NOT_FOUND", "API route not found");
};

export type DaemonServer = Readonly<{
  server: Bun.Server<unknown>;
  bind: BindAddress;
  sessions: LocalSessions;
}>;

export const startDaemonServer = (
  owner: CoordinatorRuntimeOwner,
  daemonToken: string,
  bind = resolveDaemonBind(owner.current.environment.PONTIVUS_ORDER_BIND),
): DaemonServer => {
  if (!tokenPattern.test(daemonToken)) {
    throw new TypeError("daemon token is malformed");
  }
  const root = staticRoot();
  const sessions: LocalSessions = {
    daemonToken,
    browserSessions: new Set(),
    connectTokens: new Map(),
  };

  const server = Bun.serve({
    hostname: bind.hostname,
    port: bind.port,
    development: false,
    async fetch(request) {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/connect") {
        const browserSession = consumeConnectToken(
          sessions,
          url.searchParams.get("token"),
        );
        if (browserSession === null) {
          return errorResponse(401, "CONNECT_TOKEN_INVALID", "connect token is invalid or expired");
        }
        const headers = commonHeaders();
        headers.set("Location", "/");
        headers.set("Cache-Control", "no-store");
        headers.set(
          "Set-Cookie",
          `pontivus_order_session=${browserSession}; Path=/; HttpOnly; SameSite=Strict`,
        );
        return new Response(null, { status: 303, headers });
      }

      if (url.pathname.startsWith("/api/")) {
        try {
          return await routeApi(owner, sessions, bind, request, url);
        } catch (error) {
          const failure = classifyHttpFailure(error);
          return errorResponse(
            failure.status,
            failure.code,
            failure.message,
            failure.sourceDiagnostic,
          );
        }
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        return errorResponse(405, "METHOD_NOT_ALLOWED", "method not allowed");
      }
      const response = staticResponse(root, url.pathname);
      return request.method === "HEAD"
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    },
  });
  return { server, bind, sessions };
};

export type RunningDaemon = Readonly<{
  database: Database;
  coordinator: CoordinatorRuntime;
  http: DaemonServer;
  stop: () => Promise<void>;
}>;

export const startOrderDaemon = async (
  environment: NodeJS.ProcessEnv = process.env,
): Promise<RunningDaemon> => {
  if (Bun.version !== "1.4.4") {
    throw new TypeError(`Order requires Bun 1.4.4; found ${Bun.version}`);
  }
  const stateRoot = resolveStateRoot(environment);
  const config = readOrderConfig(stateRoot);
  const database = openOrderDatabase(stateRoot);
  const daemonToken = loadOrCreateDaemonToken(stateRoot);
  const initial = createCoordinatorRuntime(database, stateRoot, environment, config);
  const owner = createCoordinatorRuntimeOwner(initial);

  try {
    const git = await gitVersion();
    if (!/^git version [0-9]+\.[0-9]+\.[0-9]+/.test(git)) {
      throw new TypeError("Git version probe returned an unexpected result");
    }

    const readyRoots = await readyRepositoryRoots(config);
    await reconcileSources(initial, readyRoots);
    await resumeSchedulerForReadiness(owner);

    const http = startDaemonServer(owner, daemonToken);
    return {
      database,
      get coordinator() {
        return owner.current;
      },
      http,
      stop: async () => {
        const current = owner.current;
        await stopCoordinatorScheduler(current);
        await stopSavedOpenCodeAccountControl(current);
        http.server.stop(true);
        database.close();
      },
    };
  } catch (error) {
    const current = owner.current;
    await stopCoordinatorScheduler(current).catch(() => undefined);
    await stopSavedOpenCodeAccountControl(current).catch(() => undefined);
    database.close();
    throw error;
  }
};
