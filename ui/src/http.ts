import {
  ApprovalSchema,
  ArtifactRefSchema,
  CommitWorkItemDocumentationSchema,
  CreateWorkItemSourceSchema,
  ExpectedHashMarkdownWriteSchema,
  ExpectedHashWriteResultSchema,
  ExecutionTaskSchema,
  ActivateOpenCodeAccountSchema,
  OpenCodeAccountIdSchema,
  OpenCodeAccountLoginAttemptSchema,
  OpenCodeAccountStateSchema,
  RenameOpenCodeAccountSchema,
  StartOpenCodeAccountLoginSchema,
  SetWorkItemArchivedSchema,
  OrderHttpErrorSchema,
  RunEventSchema,
  ProjectManifestSchema,
  RunSchema,
  Sha256Schema,
  SignoffPackageSchema,
  UpdateWorkItemTitleSchema,
  WorkItemDocumentationCommitSchema,
  WorkItemDocumentationGitStatusSchema,
  WorkItemSchema,
  WorkItemSchemaCatalogEntrySchema,
  WorkItemSourceDiagnosticSchema,
  WorkItemSourceReconciliationSchema,
  WorkItemSourceSnapshotSchema,
  type Approval,
  type ArtifactRef,
  type CommitWorkItemDocumentation,
  type CreateWorkItemSource,
  type ExpectedHashMarkdownWrite,
  type ExpectedHashWriteResult,
  type ExecutionTask,
  type ActivateOpenCodeAccount,
  type OpenCodeAccountId,
  type OpenCodeAccountLoginAttempt,
  type OpenCodeAccountState,
  type OrderHttpError,
  type RenameOpenCodeAccount,
  type StartOpenCodeAccountLogin,
  type ProjectManifest,
  type Run,
  type RunEvent,
  type RunEventId,
  type RunId,
  type SignoffPackage,
  type SetWorkItemArchived,
  type UpdateWorkItemTitle,
  type WorkItem,
  type WorkItemDocumentationCommit,
  type WorkItemDocumentationGitStatus,
  type WorkItemId,
  type WorkItemSchemaCatalogEntry,
  type WorkItemSourceDiagnostic,
  type WorkItemSourceReconciliation,
  type WorkItemSourceSnapshot,
} from "../../src/core/contracts.ts";

export type OrderHttpRequestFailure = Error & Readonly<{
  status: number;
  orderError: OrderHttpError;
}>;

export const isOrderHttpRequestFailure = (
  error: unknown,
): error is OrderHttpRequestFailure =>
  error instanceof Error &&
  "status" in error &&
  typeof error.status === "number" &&
  "orderError" in error &&
  OrderHttpErrorSchema.safeParse(error.orderError).success;

const requestFailure = (
  status: number,
  orderError: OrderHttpError,
): OrderHttpRequestFailure =>
  Object.assign(new Error(orderError.message), {
    status,
    orderError: OrderHttpErrorSchema.parse(orderError),
  });

const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
  if (!path.startsWith("/api/")) {
    throw new TypeError("Order browser requests must use relative /api paths");
  }
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
  });
  if (response.ok) return response;

  let value: unknown;
  try {
    value = await response.json();
  } catch (error) {
    throw new TypeError(
      `Order daemon returned non-JSON API failure HTTP ${response.status}`,
      { cause: error },
    );
  }
  const orderError = OrderHttpErrorSchema.parse(value);
  throw requestFailure(response.status, orderError);
};

const json = async (path: string, init?: RequestInit): Promise<unknown> =>
  (await request(path, init)).json();

const mutation = (
  method: "PATCH" | "POST" | "PUT",
  body: unknown,
): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const listWorkItems = async (): Promise<readonly WorkItem[]> =>
  WorkItemSchema.array().parse(await json("/api/work-items"));

export const listWorkItemsIncludingArchived = async (): Promise<readonly WorkItem[]> =>
  WorkItemSchema.array().parse(await json("/api/work-items?includeArchived=true"));

export const listWorkItemSchemas = async (): Promise<readonly WorkItemSchemaCatalogEntry[]> =>
  WorkItemSchemaCatalogEntrySchema.array().parse(await json("/api/work-item-schemas"));

export const listProjects = async (): Promise<readonly ProjectManifest[]> =>
  ProjectManifestSchema.array().parse(await json("/api/projects"));

export const listWorkItemSourceDiagnostics = async (): Promise<readonly WorkItemSourceDiagnostic[]> =>
  WorkItemSourceDiagnosticSchema.array().parse(await json("/api/work-item-sources/diagnostics"));

export const reconcileWorkItemSources = async (): Promise<WorkItemSourceReconciliation> =>
  WorkItemSourceReconciliationSchema.parse(await json(
    "/api/work-item-sources/reconcile",
    mutation("POST", {}),
  ));

export const createWorkItem = async (
  input: CreateWorkItemSource,
): Promise<WorkItem> =>
  WorkItemSchema.parse(await json(
    "/api/work-items",
    mutation("POST", CreateWorkItemSourceSchema.parse(input)),
  ));

export const getWorkItemSource = async (
  workItemId: WorkItemId,
): Promise<WorkItemSourceSnapshot> =>
  WorkItemSourceSnapshotSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/source`,
  ));

export const saveWorkItemSource = async (
  workItemId: WorkItemId,
  input: ExpectedHashMarkdownWrite,
): Promise<ExpectedHashWriteResult> =>
  ExpectedHashWriteResultSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/source`,
    mutation("PUT", ExpectedHashMarkdownWriteSchema.parse(input)),
  ));

export const updateWorkItemTitle = async (
  workItemId: WorkItemId,
  input: UpdateWorkItemTitle,
): Promise<ExpectedHashWriteResult> =>
  ExpectedHashWriteResultSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/title`,
    mutation("PATCH", UpdateWorkItemTitleSchema.parse(input)),
  ));

export const setWorkItemArchived = async (
  workItemId: WorkItemId,
  input: SetWorkItemArchived,
): Promise<WorkItem> =>
  WorkItemSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/archive`,
    mutation("PATCH", SetWorkItemArchivedSchema.parse(input)),
  ));

export const getWorkItemDocumentationGitStatus = async (
  workItemId: WorkItemId,
): Promise<WorkItemDocumentationGitStatus> =>
  WorkItemDocumentationGitStatusSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/documentation-git-status`,
  ));

export const commitWorkItemDocumentation = async (
  workItemId: WorkItemId,
  input: CommitWorkItemDocumentation,
): Promise<WorkItemDocumentationCommit> =>
  WorkItemDocumentationCommitSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/documentation-commit`,
    mutation("POST", CommitWorkItemDocumentationSchema.parse(input)),
  ));

export const listArtifacts = async (
  workItemId: WorkItemId,
): Promise<readonly ArtifactRef[]> =>
  ArtifactRefSchema.array().parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/artifacts`,
  ));

export const listLifecycleArtifacts = async (
  workItemId: WorkItemId,
): Promise<readonly ArtifactRef[]> =>
  ArtifactRefSchema.array().parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/lifecycle-artifacts`,
  ));

export const listExecutionTasks = async (
  workItemId: WorkItemId,
): Promise<readonly ExecutionTask[]> =>
  ExecutionTaskSchema.array().parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/tasks`,
  ));

export const getSignoffPackage = async (
  workItemId: WorkItemId,
): Promise<SignoffPackage> =>
  SignoffPackageSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/signoff-package`,
  ));

export const listRuns = async (
  workItemId: WorkItemId,
): Promise<readonly Run[]> =>
  RunSchema.array().parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/runs`,
  ));

export const listRunEvents = async (
  runId: RunId,
  afterSequence: number,
): Promise<readonly RunEvent[]> =>
  RunEventSchema.array().parse(await json(
    `/api/runs/${encodeURIComponent(runId)}/events?afterSequence=${afterSequence}`,
  ));

export const startInteractiveRun = async (
  workItemId: WorkItemId,
): Promise<Run> =>
  RunSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/runs`,
    mutation("POST", { mode: "INTERACTIVE" }),
  ));

export const submitRunInput = async (
  runId: RunId,
  text: string,
  requestEventId: RunEventId | null,
): Promise<RunEvent> =>
  RunEventSchema.parse(await json(
    `/api/runs/${encodeURIComponent(runId)}/input`,
    mutation("POST", { text, requestEventId }),
  ));

export const cancelRun = async (runId: RunId): Promise<Run> =>
  RunSchema.parse(await json(
    `/api/runs/${encodeURIComponent(runId)}/cancel`,
    mutation("POST", {}),
  ));

export const resumeWorkItem = async (
  workItemId: WorkItemId,
): Promise<WorkItem> =>
  WorkItemSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/resume`,
    mutation("POST", {}),
  ));

export const signOffWorkItem = async (
  workItemId: WorkItemId,
  expectedPackageHash: string,
  approvedBy: string,
): Promise<Approval> =>
  ApprovalSchema.parse(await json(
    `/api/work-items/${encodeURIComponent(workItemId)}/signoff`,
    mutation("POST", {
      expectedPackageHash: Sha256Schema.parse(expectedPackageHash),
      approvedBy,
    }),
  ));

export const adoptProposal = async (
  proposalEventId: RunEventId,
): Promise<ArtifactRef> =>
  ArtifactRefSchema.parse(await json(
    `/api/run-events/${encodeURIComponent(proposalEventId)}/adopt`,
    mutation("POST", {}),
  ));

export const rejectProposal = async (
  proposalEventId: RunEventId,
): Promise<RunEvent> =>
  RunEventSchema.parse(await json(
    `/api/run-events/${encodeURIComponent(proposalEventId)}/reject`,
    mutation("POST", {}),
  ));

export const tick = async (): Promise<void> => {
  await request("/api/tick", mutation("POST", {}));
};

export const readArtifactContent = async (
  artifactId: ArtifactRef["id"],
): Promise<Uint8Array> =>
  new Uint8Array(await (
    await request(`/api/artifacts/${encodeURIComponent(artifactId)}/content`)
  ).arrayBuffer());

export const saveArtifactContent = async (
  artifactId: ArtifactRef["id"],
  input: ExpectedHashMarkdownWrite,
): Promise<ExpectedHashWriteResult> =>
  ExpectedHashWriteResultSchema.parse(await json(
    `/api/artifacts/${encodeURIComponent(artifactId)}/content`,
    mutation("PUT", ExpectedHashMarkdownWriteSchema.parse(input)),
  ));

export const readEvidence = async (
  runId: RunId,
  relativePath: string,
): Promise<Uint8Array> =>
  new Uint8Array(await (
    await request(
      `/api/runs/${encodeURIComponent(runId)}/evidence?path=${encodeURIComponent(relativePath)}`,
    )
  ).arrayBuffer());


export const getOpenCodeAccountState = async (): Promise<OpenCodeAccountState> =>
  OpenCodeAccountStateSchema.parse(await json("/api/opencode/accounts"));

export const activateOpenCodeAccount = async (
  accountId: OpenCodeAccountId,
  input: ActivateOpenCodeAccount,
): Promise<OpenCodeAccountState> =>
  OpenCodeAccountStateSchema.parse(await json(
    `/api/opencode/accounts/${encodeURIComponent(OpenCodeAccountIdSchema.parse(accountId))}/activate`,
    mutation("POST", ActivateOpenCodeAccountSchema.parse(input)),
  ));

export const renameOpenCodeAccount = async (
  accountId: OpenCodeAccountId,
  input: RenameOpenCodeAccount,
): Promise<OpenCodeAccountState> =>
  OpenCodeAccountStateSchema.parse(await json(
    `/api/opencode/accounts/${encodeURIComponent(OpenCodeAccountIdSchema.parse(accountId))}`,
    mutation("PATCH", RenameOpenCodeAccountSchema.parse(input)),
  ));

export const startOpenCodeAccountLogin = async (
  input: StartOpenCodeAccountLogin,
): Promise<OpenCodeAccountLoginAttempt> =>
  OpenCodeAccountLoginAttemptSchema.parse(await json(
    "/api/opencode/accounts/login",
    mutation("POST", StartOpenCodeAccountLoginSchema.parse(input)),
  ));

export const getOpenCodeAccountLogin = async (
  attemptId: OpenCodeAccountLoginAttempt["id"],
): Promise<OpenCodeAccountLoginAttempt> =>
  OpenCodeAccountLoginAttemptSchema.parse(await json(
    `/api/opencode/accounts/login/${encodeURIComponent(attemptId)}`,
  ));

export const cancelOpenCodeAccountLogin = async (
  attemptId: OpenCodeAccountLoginAttempt["id"],
): Promise<void> => {
  await request(
    `/api/opencode/accounts/login/${encodeURIComponent(attemptId)}`,
    { method: "DELETE" },
  );
};
