import { z } from "zod";

const uuidV4 = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const projectIdPattern = /^[a-z0-9][a-z0-9._-]*$/;
const gitCommitPattern = /^[0-9a-f]{40}$/;
const sha256Pattern = /^sha256:[0-9a-f]{64}$/;
const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const envNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const defaultRuleIds = [
  "GW-P1-DOD",
  "GW-P1-FCIS",
  "GW-P1-SOC",
  "GW-P1-DRY",
  "GW-P1-STRICT-TYPING",
  "GW-P1-CANONICAL-OWNERSHIP",
  "GW-P1-EXPLICIT-FLOW",
  "GW-P1-MINIMUM-CHANGE",
  "GW-P1-AUTHORITY-BEFORE-INFERENCE",
  "GW-P1-DOC-CANONICALITY",
] as const;

const hasForbiddenPathSegment = (value: string): boolean =>
  value.split("/").some((segment) => segment === ".." || segment === "." || segment === "");

const isRepositoryPath = (value: string): boolean => {
  if (value === ".") return true;
  if (
    value.length === 0 ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.endsWith("/") ||
    value.includes("\\") ||
    value.includes("\0") ||
    hasForbiddenPathSegment(value)
  ) {
    return false;
  }
  return !/[?*{}[\]!]/.test(value);
};

const isRepositoryPattern = (value: string): boolean => {
  if (value === ".") return true;
  if (
    value.length === 0 ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.endsWith("/") ||
    value.includes("\\") ||
    value.includes("\0") ||
    hasForbiddenPathSegment(value)
  ) {
    return false;
  }
  return true;
};

const isEvidencePath = (value: string): boolean =>
  value !== "." &&
  value.length > 0 &&
  !value.startsWith("/") &&
  !value.startsWith("./") &&
  !value.endsWith("/") &&
  !value.includes("\\") &&
  !value.includes("\0") &&
  !hasForbiddenPathSegment(value);

const isoDateTimeIsCanonical = (value: string): boolean => {
  if (!isoDateTimePattern.test(value) || value.length !== 24) return false;
  const epoch = Date.parse(value);
  return Number.isFinite(epoch) && new Date(epoch).toISOString() === value;
};

const unique = (values: readonly string[]): boolean =>
  new Set(values).size === values.length;

export const ProjectIdSchema = z.string().regex(projectIdPattern);
export const ConcernIdSchema = z.string().regex(projectIdPattern);
export const GateIdSchema = z.string().regex(projectIdPattern);
export const AuthorityRefSchema = z.string();
export const RepositoryPathSchema = z.string().refine(isRepositoryPath, "invalid RepositoryPath");
export const repositoryPathNamesAgentInstruction = (value: string): boolean =>
  value.split("/").at(-1) === "AGENTS.md";
const ChangeSurfacePathSchema = RepositoryPathSchema.refine(
  (value) => !repositoryPathNamesAgentInstruction(value),
  "changeSurface must not name AGENTS.md",
);
export const RepositoryPatternSchema = z.string().refine(isRepositoryPattern, "invalid RepositoryPattern");
export const GitCommitSchema = z.string().regex(gitCommitPattern);
export const Sha256Schema = z.string().regex(sha256Pattern);
export const IsoDateTimeSchema = z.string().refine(isoDateTimeIsCanonical, "invalid canonical IsoDateTime");
export const EvidencePathSchema = z.string().refine(isEvidencePath, "invalid EvidencePath");
const NonEmptyNoNulStringSchema = z.string().min(1).refine(
  (value) => !value.includes("\\0"),
  "value must not contain NUL",
);
export const AbsoluteDirectoryPathSchema = NonEmptyNoNulStringSchema.refine(
  (value) => value.startsWith("/"),
  "directory root must be absolute",
);
export const OpenCodeModelRefSchema = z.strictObject({
  providerID: NonEmptyNoNulStringSchema,
  id: NonEmptyNoNulStringSchema,
});

export const OpenCodeAccountIdSchema = z.string()
  .min(1)
  .refine((value) => !value.includes("\0"), "account id must not contain NUL");
export const OpenCodeAccountLabelSchema = z.string()
  .min(1)
  .max(320)
  .refine((value) => value === value.trim(), "account label must not have outer whitespace")
  .refine((value) => !value.includes("\0"), "account label must not contain NUL")
  .refine(
    (value) => !value.includes("\n") && !value.includes("\r"),
    "account label must be one line",
  );
export const OpenCodeAccountStatusSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("READY") }),
  z.strictObject({
    status: z.literal("NEEDS_AUTH"),
    message: z.string().min(1),
    url: z.string().url().nullable(),
  }),
]);
export const OpenCodeAccountSchema = z.strictObject({
  id: OpenCodeAccountIdSchema,
  label: OpenCodeAccountLabelSchema,
  active: z.boolean(),
  status: OpenCodeAccountStatusSchema,
});
export const OpenCodeAccountMutationBlockerSchema = z.enum([
  "ACTIVE_RUN",
  "LOGIN_ATTEMPT_ACTIVE",
  "ACCOUNT_MUTATION_ACTIVE",
]);
export const OpenCodeAccountStateSchema = z.strictObject({
  accounts: z.array(OpenCodeAccountSchema).readonly(),
  activeAccountId: OpenCodeAccountIdSchema.nullable(),
  mutationBlockers: z.array(OpenCodeAccountMutationBlockerSchema).readonly(),
});
export const ActivateOpenCodeAccountSchema = z.strictObject({
  expectedActiveAccountId: OpenCodeAccountIdSchema.nullable(),
});
export const RenameOpenCodeAccountSchema = z.strictObject({
  label: OpenCodeAccountLabelSchema,
});
export const RemoveOpenCodeAccountSchema = z.strictObject({
  expectedActiveAccountId: OpenCodeAccountIdSchema.nullable(),
});
export const StartOpenCodeAccountLoginSchema = z.strictObject({
  label: OpenCodeAccountLabelSchema,
});
export const OpenCodeAccountLoginAttemptIdSchema = z.string().uuid();
export const OpenCodeAccountLoginAttemptSchema = z.strictObject({
  id: OpenCodeAccountLoginAttemptIdSchema,
  authorizationUrl: z.string().url(),
  instructions: z.string().min(1),
  expiresAt: IsoDateTimeSchema,
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "EXPIRED", "CANCELLED"]),
  message: z.string().min(1).nullable(),
});
export const LegacyPredecessorConfigV1Schema = z.strictObject({
  version: z.literal(1),
  model: OpenCodeModelRefSchema,
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema)
    .min(1)
    .refine(unique, "repositoryRoots must be unique")
    .readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema)
    .refine(unique, "referenceRoots must be unique")
    .readonly(),
});

export const LegacyOrderConfigV2Schema = z.strictObject({
  version: z.literal(2),
  model: OpenCodeModelRefSchema,
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema)
    .min(1)
    .refine(unique, "repositoryRoots must be unique")
    .readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema)
    .refine(unique, "referenceRoots must be unique")
    .readonly(),
  workItemRoot: AbsoluteDirectoryPathSchema,
});

export const LegacyOrderConfigV3Schema = z.strictObject({
  version: z.literal(3),
  model: OpenCodeModelRefSchema,
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema)
    .min(1)
    .refine(unique, "repositoryRoots must be unique")
    .readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema)
    .refine(unique, "referenceRoots must be unique")
    .readonly(),
});

export const OrderConfigSchema = z.strictObject({
  version: z.literal(4),
  model: OpenCodeModelRefSchema.nullable(),
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema)
    .refine(unique, "repositoryRoots must be unique")
    .readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema)
    .refine(unique, "referenceRoots must be unique")
    .readonly(),
});

export const OrderConfigStateSchema = z.strictObject({
  config: OrderConfigSchema,
  sha256: Sha256Schema,
});

export const ConnectedRepositoryStateSchema = z.strictObject({
  repositoryRoot: AbsoluteDirectoryPathSchema,
  status: z.enum(["READY", "ATTENTION"]),
  projectId: ProjectIdSchema.nullable(),
  workItemsRoot: RepositoryPathSchema.nullable(),
  manifestSha256: Sha256Schema.nullable(),
  attention: z.array(z.enum([
    "REPOSITORY_UNAVAILABLE",
    "REPOSITORY_IDENTITY_INVALID",
    "PROJECT_MANIFEST_MISSING",
    "PROJECT_MANIFEST_INVALID",
    "WORKITEM_ROOT_INVALID",
  ])).readonly(),
});

export const InstallationReadinessBlockerSchema = z.enum([
  "REPOSITORY_REQUIRED",
  "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION",
  "MODEL_INVALID",
  "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION",
  "OPENCODE_ACCOUNT_REQUIRED",
]);

export const InstallationReadinessSchema = z.strictObject({
  ready: z.boolean(),
  blockers: z.array(InstallationReadinessBlockerSchema).readonly(),
}).superRefine((value, ctx) => {
  if (value.ready !== (value.blockers.length === 0)) {
    ctx.addIssue({ code: "custom", message: "ready must equal blockers.length === 0" });
  }
});

export const ConnectRepositorySchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  repositoryRoot: AbsoluteDirectoryPathSchema,
});

export const DisconnectRepositorySchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  repositoryRoot: AbsoluteDirectoryPathSchema,
});

export const UpdateConfiguredModelSchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  model: OpenCodeModelRefSchema,
});

export const UpdateReferenceRootsSchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  referenceRoots: z.array(AbsoluteDirectoryPathSchema)
    .refine(unique, "referenceRoots must be unique")
    .readonly(),
});

export const MigrateWorkItemDocumentRootSchema = z.strictObject({
  repositoryRoot: AbsoluteDirectoryPathSchema,
  expectedManifestSha256: Sha256Schema,
  targetWorkItemsRoot: RepositoryPathSchema,
});
const UnifiedDiffSchema = z.string().min(1).refine(
  (value) => value.endsWith("\n"),
  "unifiedDiff must end with LF",
);

export const WorkItemIdSchema = z.string().regex(new RegExp(`^work_${uuidV4}$`));
export const ArtifactRefIdSchema = z.string().regex(new RegExp(`^artifact_${uuidV4}$`));
export const ApprovalIdSchema = z.string().regex(new RegExp(`^approval_${uuidV4}$`));
export const ExecutionTaskIdSchema = z.string().regex(new RegExp(`^task_${uuidV4}$`));
export const RunIdSchema = z.string().regex(new RegExp(`^run_${uuidV4}$`));
export const RunEventIdSchema = z.string().regex(new RegExp(`^event_${uuidV4}$`));

export type ProjectId = z.infer<typeof ProjectIdSchema>;
export type ConcernId = z.infer<typeof ConcernIdSchema>;
export type GateId = z.infer<typeof GateIdSchema>;
export type AuthorityRef = z.infer<typeof AuthorityRefSchema>;
export type RepositoryPath = z.infer<typeof RepositoryPathSchema>;
export type RepositoryPattern = z.infer<typeof RepositoryPatternSchema>;
export type GitCommit = z.infer<typeof GitCommitSchema>;
export type Sha256 = z.infer<typeof Sha256Schema>;
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;
export type EvidencePath = z.infer<typeof EvidencePathSchema>;
export type OpenCodeModelRef = Readonly<z.infer<typeof OpenCodeModelRefSchema>>;
export type OpenCodeAccountId = z.infer<typeof OpenCodeAccountIdSchema>;
export type OpenCodeAccountLabel = z.infer<typeof OpenCodeAccountLabelSchema>;
export type OpenCodeAccountStatus = Readonly<z.infer<typeof OpenCodeAccountStatusSchema>>;
export type OpenCodeAccount = Readonly<z.infer<typeof OpenCodeAccountSchema>>;
export type OpenCodeAccountMutationBlocker = z.infer<typeof OpenCodeAccountMutationBlockerSchema>;
export type OpenCodeAccountState = Readonly<z.infer<typeof OpenCodeAccountStateSchema>>;
export type ActivateOpenCodeAccount = Readonly<z.infer<typeof ActivateOpenCodeAccountSchema>>;
export type RenameOpenCodeAccount = Readonly<z.infer<typeof RenameOpenCodeAccountSchema>>;
export type RemoveOpenCodeAccount = Readonly<z.infer<typeof RemoveOpenCodeAccountSchema>>;
export type StartOpenCodeAccountLogin = Readonly<z.infer<typeof StartOpenCodeAccountLoginSchema>>;
export type OpenCodeAccountLoginAttemptId = z.infer<typeof OpenCodeAccountLoginAttemptIdSchema>;
export type OpenCodeAccountLoginAttempt = Readonly<z.infer<typeof OpenCodeAccountLoginAttemptSchema>>;
export type LegacyPredecessorConfigV1 = Readonly<z.infer<typeof LegacyPredecessorConfigV1Schema>>;
export type LegacyOrderConfigV2 = Readonly<z.infer<typeof LegacyOrderConfigV2Schema>>;
export type LegacyOrderConfigV3 = Readonly<z.infer<typeof LegacyOrderConfigV3Schema>>;
export type OrderConfig = Readonly<z.infer<typeof OrderConfigSchema>>;
export type OrderConfigState = Readonly<z.infer<typeof OrderConfigStateSchema>>;
export type ConnectedRepositoryState = Readonly<z.infer<typeof ConnectedRepositoryStateSchema>>;
export type InstallationReadinessBlocker = z.infer<typeof InstallationReadinessBlockerSchema>;
export type InstallationReadiness = Readonly<z.infer<typeof InstallationReadinessSchema>>;
export type ConnectRepository = Readonly<z.infer<typeof ConnectRepositorySchema>>;
export type DisconnectRepository = Readonly<z.infer<typeof DisconnectRepositorySchema>>;
export type UpdateConfiguredModel = Readonly<z.infer<typeof UpdateConfiguredModelSchema>>;
export type UpdateReferenceRoots = Readonly<z.infer<typeof UpdateReferenceRootsSchema>>;
export type MigrateWorkItemDocumentRoot = Readonly<z.infer<typeof MigrateWorkItemDocumentRootSchema>>;
export type WorkItemId = z.infer<typeof WorkItemIdSchema>;
export type ArtifactRefId = z.infer<typeof ArtifactRefIdSchema>;
export type ApprovalId = z.infer<typeof ApprovalIdSchema>;
export type ExecutionTaskId = z.infer<typeof ExecutionTaskIdSchema>;
export type RunId = z.infer<typeof RunIdSchema>;
export type RunEventId = z.infer<typeof RunEventIdSchema>;


export const WorkItemKindSchema = z.enum([
  "CHANGE",
  "DEFECT",
  "INVESTIGATION",
  "AUDIT",
]);
export const WorkItemSchemaIdSchema = z.enum([
  "change-v1",
  "defect-v1",
  "investigation-v1",
  "audit-v1",
]);

export const isWorkItemSourcePath = (value: string): boolean => {
  if (
    value.length === 0 ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.endsWith("/") ||
    value.includes("\\") ||
    value.includes("\0") ||
    !value.endsWith(".md")
  ) {
    return false;
  }
  return !value.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
};

export const WorkItemSourcePathSchema = z.string().refine(
  isWorkItemSourcePath,
  "invalid WorkItemSourcePath",
);

export const WorkItemTitleSchema = z.string()
  .min(1)
  .refine((value) => value === value.trim(), "title must not have outer whitespace")
  .refine((value) => !value.includes("\0"), "title must not contain NUL")
  .refine((value) => !value.includes("\n") && !value.includes("\r"), "title must be one line");

export const MarkdownTextSchema = z.string()
  .refine((value) => !value.includes("\0"), "Markdown must not contain NUL")
  .refine((value) => !value.startsWith("\uFEFF"), "Markdown must not contain a BOM")
  .refine((value) => !value.includes("\r"), "Markdown must use LF line endings");

export const WorkItemSourceMetadataSchema = z.strictObject({
  formatVersion: z.literal(1),
  id: WorkItemIdSchema,
  projectId: ProjectIdSchema,
  concernIds: z.array(ConcernIdSchema)
    .refine(unique, "duplicate concernIds")
    .refine(
      (values) => values.every((value, index) => index === 0 || values[index - 1]! < value),
      "concernIds must be sorted",
    )
    .readonly(),
  schemaId: WorkItemSchemaIdSchema,
  derivedFromWorkItemId: WorkItemIdSchema.optional(),
});

export const WorkItemSourceSnapshotSchema = z.strictObject({
  path: WorkItemSourcePathSchema,
  sha256: Sha256Schema,
  metadata: WorkItemSourceMetadataSchema,
  markdown: MarkdownTextSchema,
  bodyMarkdown: MarkdownTextSchema,
});

export const ExpectedHashWriteResultSchema = z.discriminatedUnion("tag", [
  z.strictObject({ tag: z.literal("UPDATED"), sha256: Sha256Schema }),
  z.strictObject({ tag: z.literal("STALE"), currentSha256: Sha256Schema }),
]);

export const ExpectedHashMarkdownWriteSchema = z.strictObject({
  expectedSha256: Sha256Schema,
  markdown: MarkdownTextSchema,
});

export const ExpectedHashWorkItemBodyWriteSchema = z.strictObject({
  expectedSha256: Sha256Schema,
  bodyMarkdown: MarkdownTextSchema,
});

export const UpdateWorkItemTitleSchema = z.strictObject({
  expectedSourceSha256: Sha256Schema,
  title: WorkItemTitleSchema,
});

export const SetWorkItemArchivedSchema = z.strictObject({
  expectedArchived: z.boolean(),
  archived: z.boolean(),
});

export const WorkItemDocumentGitStateSchema = z.enum([
  "MATCHES_HEAD",
  "MODIFIED",
  "UNTRACKED",
  "DELETED",
  "MISSING",
  "IGNORED",
  "UNMERGED",
]);

export const WorkItemDocumentGitPathStatusSchema = z.strictObject({
  repositoryPath: RepositoryPathSchema,
  workingTreeSha256: Sha256Schema.nullable(),
  headSha256: Sha256Schema.nullable(),
  state: WorkItemDocumentGitStateSchema,
});

export const WorkItemDocumentationGitBlockerSchema = z.enum([
  "LIFECYCLE_INELIGIBLE",
  "ACTIVE_RUN",
  "DETACHED_HEAD",
  "GIT_OPERATION_ACTIVE",
  "MISSING_GIT_IDENTITY",
  "MISSING_DOCUMENT",
  "IGNORED_DOCUMENT",
  "UNMERGED_DOCUMENT",
]);

export const WorkItemDocumentationGitStatusSchema = z.strictObject({
  workItemId: WorkItemIdSchema,
  headCommit: GitCommitSchema,
  branch: z.string().min(1).nullable(),
  authorName: z.string().min(1).nullable(),
  authorEmail: z.string().min(1).nullable(),
  blockers: z.array(WorkItemDocumentationGitBlockerSchema).readonly(),
  paths: z.array(WorkItemDocumentGitPathStatusSchema).min(1).readonly(),
});

export const WorkItemDocumentationExpectedPathSchema = z.strictObject({
  repositoryPath: RepositoryPathSchema,
  sha256: Sha256Schema.nullable(),
});

export const CommitWorkItemDocumentationSchema = z.strictObject({
  expectedHeadCommit: GitCommitSchema,
  expectedPaths: z.array(WorkItemDocumentationExpectedPathSchema).min(1).readonly(),
});

export const WorkItemDocumentationCommitSchema = z.strictObject({
  workItemId: WorkItemIdSchema,
  gitCommit: GitCommitSchema,
  repositoryPaths: z.array(RepositoryPathSchema).min(1).readonly(),
});

export const CreateWorkItemSourceSchema = z.strictObject({
  projectId: ProjectIdSchema,
  schemaId: WorkItemSchemaIdSchema,
  title: WorkItemTitleSchema,
  concernIds: z.array(ConcernIdSchema).refine(unique, "duplicate concernIds").readonly(),
  derivedFromWorkItemId: WorkItemIdSchema.nullable().optional(),
});

export const WorkItemSchemaCatalogEntrySchema = z.strictObject({
  schemaId: WorkItemSchemaIdSchema,
  kind: WorkItemKindSchema,
});

export const WorkItemSourceDiagnosticCodeSchema = z.enum([
  "INVALID_SOURCE",
  "DUPLICATE_WORK_ITEM_ID",
  "UNSUPPORTED_SCHEMA",
  "UNRESOLVED_PROJECT",
  "UNRESOLVED_CONCERN",
  "SOURCE_RECLASSIFICATION_BLOCKED",
  "MISSING_SOURCE",
  "COMPLETED_SOURCE_CHANGED",
  "COMPLETED_SOURCE_MISSING",
]);

export const WorkItemSourceDiagnosticSchema = z.strictObject({
  projectId: ProjectIdSchema,
  path: WorkItemSourcePathSchema.nullable(),
  workItemId: WorkItemIdSchema.nullable(),
  code: WorkItemSourceDiagnosticCodeSchema,
  detail: z.string().min(1),
});

export const StableHttpErrorCodeSchema = z.string()
  .regex(/^[A-Z][A-Z0-9_]*$/);

export const OrderHttpErrorSchema = z.strictObject({
  code: StableHttpErrorCodeSchema,
  message: z.string().min(1),
  sourceDiagnostic: WorkItemSourceDiagnosticSchema.nullable(),
});

export const WorkItemSourceReconciliationSchema = z.strictObject({
  registered: z.array(WorkItemIdSchema).readonly(),
  updated: z.array(WorkItemIdSchema).readonly(),
  unchanged: z.array(WorkItemIdSchema).readonly(),
  diagnostics: z.array(WorkItemSourceDiagnosticSchema).readonly(),
});

export type WorkItemKind = z.infer<typeof WorkItemKindSchema>;
export type WorkItemSchemaId = z.infer<typeof WorkItemSchemaIdSchema>;
export type WorkItemSourcePath = z.infer<typeof WorkItemSourcePathSchema>;
export type WorkItemTitle = z.infer<typeof WorkItemTitleSchema>;
export type MarkdownText = z.infer<typeof MarkdownTextSchema>;
export type WorkItemSourceMetadata = Readonly<z.infer<typeof WorkItemSourceMetadataSchema>>;
export type WorkItemSourceSnapshot = Readonly<z.infer<typeof WorkItemSourceSnapshotSchema>>;
export type ExpectedHashWriteResult = Readonly<z.infer<typeof ExpectedHashWriteResultSchema>>;
export type ExpectedHashMarkdownWrite = Readonly<z.infer<typeof ExpectedHashMarkdownWriteSchema>>;
export type ExpectedHashWorkItemBodyWrite = Readonly<z.infer<typeof ExpectedHashWorkItemBodyWriteSchema>>;
export type UpdateWorkItemTitle = Readonly<z.infer<typeof UpdateWorkItemTitleSchema>>;
export type SetWorkItemArchived = Readonly<z.infer<typeof SetWorkItemArchivedSchema>>;
export type StableHttpErrorCode = z.infer<typeof StableHttpErrorCodeSchema>;
export type OrderHttpError = Readonly<z.infer<typeof OrderHttpErrorSchema>>;
export type WorkItemDocumentGitState = z.infer<typeof WorkItemDocumentGitStateSchema>;
export type WorkItemDocumentGitPathStatus = Readonly<z.infer<typeof WorkItemDocumentGitPathStatusSchema>>;
export type WorkItemDocumentationGitBlocker = z.infer<typeof WorkItemDocumentationGitBlockerSchema>;
export type WorkItemDocumentationGitStatus = Readonly<z.infer<typeof WorkItemDocumentationGitStatusSchema>>;
export type WorkItemDocumentationExpectedPath = Readonly<z.infer<typeof WorkItemDocumentationExpectedPathSchema>>;
export type CommitWorkItemDocumentation = Readonly<z.infer<typeof CommitWorkItemDocumentationSchema>>;
export type WorkItemDocumentationCommit = Readonly<z.infer<typeof WorkItemDocumentationCommitSchema>>;
export type CreateWorkItemSource = Readonly<z.infer<typeof CreateWorkItemSourceSchema>>;
export type WorkItemSchemaCatalogEntry = Readonly<z.infer<typeof WorkItemSchemaCatalogEntrySchema>>;
export type WorkItemSourceDiagnosticCode = z.infer<typeof WorkItemSourceDiagnosticCodeSchema>;
export type WorkItemSourceDiagnostic = Readonly<z.infer<typeof WorkItemSourceDiagnosticSchema>>;
export type WorkItemSourceReconciliation = Readonly<z.infer<typeof WorkItemSourceReconciliationSchema>>;

export const WorkStageSchema = z.enum([
  "IDEA",
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
  "AWAITING_SIGNOFF",
  "EXECUTION",
  "COMPLETE",
]);
export const WorkStatusSchema = z.enum(["ACTIVE", "BLOCKED", "COMPLETE"]);
export const WorkOutcomeSchema = z.enum([
  "DISPROVEN",
  "DUPLICATE",
  "ALREADY_SATISFIED",
  "INVESTIGATION_COMPLETE",
  "AUDIT_COMPLETE",
  "CANDIDATE_DONE",
]);

export const WorkItemSchema = z
  .strictObject({
    id: WorkItemIdSchema,
    projectId: ProjectIdSchema,
    repositoryRoot: z.string(),
    title: z.string(),
    origin: z.string(),
    schemaId: WorkItemSchemaIdSchema,
    sourcePath: WorkItemSourcePathSchema,
    sourceSha256: Sha256Schema,
    derivedFromWorkItemId: WorkItemIdSchema.nullable(),
    stage: WorkStageSchema,
    status: WorkStatusSchema,
    outcome: WorkOutcomeSchema.nullable(),
    concernIds: z.array(ConcernIdSchema).refine(unique, "duplicate concernIds").readonly(),
    archived: z.boolean().default(false),
    createdAt: IsoDateTimeSchema,
  })
  .superRefine((value, ctx) => {
    if ((value.status === "COMPLETE") !== (value.stage === "COMPLETE")) {
      ctx.addIssue({ code: "custom", message: "COMPLETE status and stage must agree" });
    }
    if (value.outcome !== null && value.stage !== "COMPLETE") {
      ctx.addIssue({ code: "custom", message: "outcome is valid only when work is complete" });
    }
  });

export type WorkStage = z.infer<typeof WorkStageSchema>;
export type WorkStatus = z.infer<typeof WorkStatusSchema>;
export type WorkOutcome = z.infer<typeof WorkOutcomeSchema>;
export type WorkItem = Readonly<z.infer<typeof WorkItemSchema>>;

export const AuthorityLayerSchema = z.enum([
  "P0",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "P6",
  "P7",
  "P8",
]);
export const ArtifactRoleSchema = z.enum([
  "R1",
  "R2",
  "DESIGN",
  "PLAN",
  "R3",
  "GOVERNANCE",
  "PROJECT_MANIFEST",
  "VERIFICATION_MATERIAL",
]);

export const ArtifactRefSchema = z.strictObject({
  id: ArtifactRefIdSchema,
  workItemId: WorkItemIdSchema,
  repositoryPath: RepositoryPathSchema,
  role: ArtifactRoleSchema,
  authorityLayer: AuthorityLayerSchema.nullable(),
  sha256: Sha256Schema,
  gitCommit: GitCommitSchema.nullable(),
});

export type AuthorityLayer = z.infer<typeof AuthorityLayerSchema>;
export type ArtifactRole = z.infer<typeof ArtifactRoleSchema>;
export type ArtifactRef = Readonly<z.infer<typeof ArtifactRefSchema>>;

export const ApprovalSchema = z.strictObject({
  id: ApprovalIdSchema,
  workItemId: WorkItemIdSchema,
  baselineCommit: GitCommitSchema,
  packageHash: Sha256Schema,
  planArtifactRefId: ArtifactRefIdSchema,
  r3ArtifactRefId: ArtifactRefIdSchema,
  sourceSha256: Sha256Schema,
  approvedBy: z.string(),
  approvedAt: IsoDateTimeSchema,
});

export type Approval = Readonly<z.infer<typeof ApprovalSchema>>;

export const ExecutionTaskStateSchema = z.enum([
  "TODO",
  "RUNNING",
  "CANDIDATE_DONE",
  "ALREADY_SATISFIED",
  "BLOCKED",
]);

export const ExecutionTaskSchema = z.strictObject({
  id: ExecutionTaskIdSchema,
  approvalId: ApprovalIdSchema,
  planTaskId: z.string(),
  objective: z.string(),
  dependsOn: z.array(ExecutionTaskIdSchema).refine(unique, "duplicate dependencies").readonly(),
  scope: z.array(RepositoryPatternSchema).refine(unique, "duplicate scope patterns").readonly(),
  exclusions: z.array(RepositoryPatternSchema).refine(unique, "duplicate exclusion patterns").readonly(),
  acceptanceRefs: z.array(AuthorityRefSchema).refine(unique, "duplicate acceptance refs").readonly(),
  changeSurface: z.array(ChangeSurfacePathSchema).refine(unique, "duplicate change-surface paths").readonly(),
  gateIds: z.array(GateIdSchema).refine(unique, "duplicate gate ids").readonly(),
  authorityRefs: z.array(AuthorityRefSchema).refine(unique, "duplicate authority refs").readonly(),
  concernIds: z.array(ConcernIdSchema).refine(unique, "duplicate concern ids").readonly(),
  state: ExecutionTaskStateSchema,
});

export type ExecutionTaskState = z.infer<typeof ExecutionTaskStateSchema>;
export type ExecutionTask = Readonly<z.infer<typeof ExecutionTaskSchema>>;

export const RunModeSchema = z.enum(["INTERACTIVE", "UNATTENDED"]);
export const RunRoleSchema = z.enum(["STAGE", "BUILDER", "REVIEWER", "REMEDIATOR"]);
export const RunStatusSchema = z.enum([
  "RUNNING",
  "WAITING_FOR_INPUT",
  "COMPLETED",
  "BLOCKED",
  "FAILED",
  "CANCELLED",
]);
export const ValidationClassificationSchema = z.enum([
  "TEST_FAILURE",
  "REVIEW_FAILURE",
  "SPEC_INVALID",
  "APPROVAL_STALE",
  "SCOPE_BREACH",
  "GOVERNANCE_BREACH",
  "CHANGE_BLOAT",
  "ENVIRONMENT_BLOCKED",
  "PROVIDER_FAILURE",
  "ALREADY_SATISFIED",
]);
export const RunTerminalClassificationSchema = z.union([
  ValidationClassificationSchema,
  z.enum([
    "PRECONDITION_FAILED",
    "BLOCKED_FOR_REANALYSIS",
    "COORDINATOR_INTERRUPTED",
    "CANDIDATE_DONE",
  ]),
]);

export const RunSchema = z
  .strictObject({
    id: RunIdSchema,
    workItemId: WorkItemIdSchema,
    executionTaskId: ExecutionTaskIdSchema.nullable(),
    stage: WorkStageSchema,
    mode: RunModeSchema,
    role: RunRoleSchema,
    triggerEventId: RunEventIdSchema.nullable(),
    status: RunStatusSchema,
    attempt: z.number().int().positive(),
    baselineCommit: GitCommitSchema,
    contextHash: Sha256Schema,
    providerSessionId: z.string().min(1).nullable(),
    terminalClassification: RunTerminalClassificationSchema.nullable(),
    startedAt: IsoDateTimeSchema,
    endedAt: IsoDateTimeSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    const terminal = ["COMPLETED", "BLOCKED", "FAILED", "CANCELLED"].includes(value.status);
    if (terminal !== (value.endedAt !== null)) {
      ctx.addIssue({ code: "custom", message: "terminal run status and endedAt must agree" });
    }
    if ((value.status === "WAITING_FOR_INPUT") && !(value.mode === "INTERACTIVE" && value.role === "STAGE")) {
      ctx.addIssue({ code: "custom", message: "WAITING_FOR_INPUT is valid only for INTERACTIVE/STAGE" });
    }
    if (value.role === "STAGE") {
      if (value.executionTaskId !== null || value.triggerEventId !== null || value.mode !== "INTERACTIVE") {
        ctx.addIssue({ code: "custom", message: "STAGE run must be interactive and pre-signoff" });
      }
      if (value.stage === "EXECUTION" || value.stage === "COMPLETE") {
        ctx.addIssue({ code: "custom", message: "STAGE run cannot use aggregate execution/complete stage" });
      }
    } else {
      if (value.executionTaskId === null || value.stage !== "EXECUTION" || value.mode !== "UNATTENDED") {
        ctx.addIssue({ code: "custom", message: "post-signoff run must be UNATTENDED EXECUTION with a task" });
      }
      if (value.role === "BUILDER" && value.triggerEventId !== null) {
        ctx.addIssue({ code: "custom", message: "BUILDER triggerEventId must be null" });
      }
      if ((value.role === "REVIEWER" || value.role === "REMEDIATOR") && value.triggerEventId === null) {
        ctx.addIssue({ code: "custom", message: "REVIEWER/REMEDIATOR requires triggerEventId" });
      }
    }
    if (value.terminalClassification !== null && !terminal) {
      ctx.addIssue({ code: "custom", message: "terminalClassification requires a terminal run status" });
    }
  });

export type RunMode = z.infer<typeof RunModeSchema>;
export type RunRole = z.infer<typeof RunRoleSchema>;
export type RunStatus = z.infer<typeof RunStatusSchema>;
export type ValidationClassification = z.infer<typeof ValidationClassificationSchema>;
export type RunTerminalClassification = z.infer<typeof RunTerminalClassificationSchema>;
export type Run = Readonly<z.infer<typeof RunSchema>>;

export const EvidenceRefSchema = z.strictObject({
  relativePath: EvidencePathSchema,
  sha256: Sha256Schema,
  mediaType: z.string(),
});

export type EvidenceRef = Readonly<z.infer<typeof EvidenceRefSchema>>;

export const ProviderTurnOutcomeSchema = z.enum([
  "SUCCEEDED",
  "FAILED",
  "INTERRUPTED",
  "TIMEOUT",
  "TRANSPORT_ERROR",
  "INVALID_OUTPUT",
]);

export const ProviderDiagnosticRecordSchema = z.strictObject({
  providerId: z.string().min(1),
  modelId: z.string().min(1),
  providerSessionId: z.string().min(1),
  promptId: z.string().min(1),
  startedAt: IsoDateTimeSchema,
  endedAt: IsoDateTimeSchema,
  outcome: ProviderTurnOutcomeSchema,
  formatRepairAttempted: z.boolean(),
  formatRepairSucceeded: z.boolean().nullable(),
  failurePhase: z.enum([
    "ADMISSION",
    "TRANSPORT",
    "PROVIDER",
    "COMPLETION",
    "PARSE",
    "FORMAT_REPAIR",
  ]).nullable(),
  exceptionMessage: z.string().min(1).nullable(),
});

export type ProviderTurnOutcome = z.infer<typeof ProviderTurnOutcomeSchema>;
export type ProviderDiagnosticRecord = Readonly<z.infer<typeof ProviderDiagnosticRecordSchema>>;

export const HumanInputCategorySchema = z.enum([
  "INFORMATION",
  "EVIDENCE",
  "STAGE_CHOICE",
  "AUTHORITY_DECISION",
  "AUTHORITY_CONFLICT",
]);
export const ProposalDispositionSchema = z.enum(["ADOPTED", "REJECTED"]);
export const ValidationStageSchema = z.enum(["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7"]);

export const StageCompletionSchema = z.discriminatedUnion("stage", [
  z.strictObject({
    stage: z.literal("R1"),
    outcome: z.enum([
      "CONFIRMED",
      "DISPROVEN",
      "DUPLICATE",
      "ALREADY_SATISFIED",
      "INVESTIGATION_COMPLETE",
      "AUDIT_COMPLETE",
    ]),
  }),
  z.strictObject({ stage: z.literal("R2"), outcome: z.literal("ACCEPTED") }),
  z.strictObject({ stage: z.literal("DESIGN"), outcome: z.literal("ACCEPTED") }),
  z.strictObject({ stage: z.literal("PLAN"), outcome: z.literal("ACCEPTED") }),
  z.strictObject({
    stage: z.literal("R3"),
    outcome: z.enum([
      "READY_FOR_SIGNOFF",
      "RETURN_TO_RESEARCH",
      "RETURN_TO_REQUIREMENTS",
      "RETURN_TO_DESIGN",
      "RETURN_TO_PLAN",
    ]),
  }),
]);

const evidenceArray = z.array(EvidenceRefSchema).readonly();

const RunEventPayloadBaseSchema = z.union([
  z.strictObject({ tag: z.literal("STAGE_STARTED"), stage: WorkStageSchema, mode: RunModeSchema, contextHash: Sha256Schema }),
  z.strictObject({ tag: z.literal("AGENT_MESSAGE_FINAL"), text: z.string(), evidence: evidenceArray }),
  z.strictObject({ tag: z.literal("HUMAN_INPUT_REQUESTED"), category: HumanInputCategorySchema, question: z.string() }),
  z.strictObject({ tag: z.literal("HUMAN_INPUT_RECEIVED"), requestEventId: RunEventIdSchema.nullable(), text: z.string() }),
  z.strictObject({
    tag: z.literal("ARTIFACT_PROPOSAL_CREATED"),
    targetPath: RepositoryPathSchema,
    baseSha256: Sha256Schema.nullable(),
    role: ArtifactRoleSchema,
    authorityLayer: AuthorityLayerSchema,
    unifiedDiff: UnifiedDiffSchema,
    rationale: z.string(),
  }),
  z.strictObject({
    tag: z.literal("ARTIFACT_PROPOSAL_ADOPTION_REQUESTED"),
    proposalEventId: RunEventIdSchema,
  }),
  z.strictObject({
    tag: z.literal("ARTIFACT_PROPOSAL_DISPOSITIONED"),
    proposalEventId: RunEventIdSchema,
    disposition: ProposalDispositionSchema,
    adoptedArtifactRefId: ArtifactRefIdSchema.nullable(),
  }).superRefine((value, ctx) => {
    if ((value.disposition === "ADOPTED") !== (value.adoptedArtifactRefId !== null)) {
      ctx.addIssue({ code: "custom", message: "proposal disposition and adoptedArtifactRefId must agree" });
    }
  }),
  z.strictObject({ tag: z.literal("STAGE_COMPLETED"), completion: StageCompletionSchema, artifactRefIds: z.array(ArtifactRefIdSchema).readonly() }),
  z.strictObject({ tag: z.literal("STAGE_BLOCKED"), reason: z.string(), owningStage: WorkStageSchema }),
  z.strictObject({ tag: z.literal("TASK_ALREADY_SATISFIED"), summary: z.string().min(1) }),
  z.strictObject({
    tag: z.literal("CONFORMANCE_PASSED"),
    stage: WorkStageSchema,
    outputArtifactRefIds: z.array(ArtifactRefIdSchema).readonly(),
    contextHash: Sha256Schema,
    evidence: evidenceArray,
  }),
  z.strictObject({
    tag: z.literal("CONFORMANCE_FAILED"),
    stage: WorkStageSchema,
    defectiveLayer: AuthorityLayerSchema.nullable(),
    summary: z.string(),
    evidence: evidenceArray,
  }),
  z.strictObject({ tag: z.literal("PROVIDER_DIAGNOSTICS_RECORDED"), evidence: evidenceArray }),
  z.strictObject({
    tag: z.literal("PRODUCTIVE_INVOCATION_FAILED"),
    classification: z.enum(["PRECONDITION_FAILED", "ENVIRONMENT_BLOCKED"]),
    detail: NonEmptyNoNulStringSchema,
    evidence: evidenceArray,
  }),
  z.strictObject({ tag: z.literal("PROVIDER_FAILED"), detail: z.string(), evidence: evidenceArray }),
  z.strictObject({ tag: z.literal("GATE_PASSED"), gateId: GateIdSchema, evidence: evidenceArray }),
  z.strictObject({
    tag: z.literal("GATE_FAILED"),
    gateId: GateIdSchema,
    classification: ValidationClassificationSchema,
    evidence: evidenceArray,
  }),
  z.strictObject({ tag: z.literal("REVIEW_PASSED"), evidence: evidenceArray }),
  z.strictObject({
    tag: z.literal("REVIEW_FAILED"),
    classification: z.literal("REVIEW_FAILURE"),
    summary: z.string(),
    evidence: evidenceArray,
  }),
  z.strictObject({
    tag: z.literal("REVIEW_FAILED"),
    classification: z.literal("BLOCKED_FOR_REANALYSIS"),
    returnTo: z.enum(["R1", "R2", "DESIGN", "PLAN"]),
    summary: z.string(),
    evidence: evidenceArray,
  }),
  z.strictObject({ tag: z.literal("VALIDATION_PASSED"), stage: ValidationStageSchema, evidence: evidenceArray }),
  z.strictObject({
    tag: z.literal("VALIDATION_FAILED"),
    stage: ValidationStageSchema,
    classification: z.enum([
      "TEST_FAILURE",
      "REVIEW_FAILURE",
      "SPEC_INVALID",
      "PRECONDITION_FAILED",
      "APPROVAL_STALE",
      "SCOPE_BREACH",
      "GOVERNANCE_BREACH",
      "CHANGE_BLOAT",
      "ENVIRONMENT_BLOCKED",
      "PROVIDER_FAILURE",
      "BLOCKED_FOR_REANALYSIS",
    ]),
    summary: z.string(),
    evidence: evidenceArray,
  }),
  z.strictObject({
    tag: z.literal("CANDIDATE_STATE_RECORDED"),
    patch: EvidenceRefSchema,
    changedPaths: z.array(RepositoryPathSchema).refine(
      (paths) => unique(paths) && paths.every((path, index) => index === 0 || paths[index - 1]! < path),
      "changedPaths must be unique and canonically sorted",
    ).readonly(),
  }),
  z.strictObject({
    tag: z.literal("CANDIDATE_RECORDED"),
    candidateStateEventId: RunEventIdSchema,
    validationEventIds: z.array(RunEventIdSchema).length(8).refine(unique, "validationEventIds must be unique").readonly(),
  }),
  z.strictObject({
    tag: z.literal("AUTHORITY_CHANGED"),
    priorArtifactRefId: ArtifactRefIdSchema,
    newArtifactRefId: ArtifactRefIdSchema,
  }),
  z.strictObject({ tag: z.literal("REPOSITORY_DRIFTED"), expectedCommit: GitCommitSchema, actualCommit: GitCommitSchema }),
  z.strictObject({ tag: z.literal("OBSERVATION_RECORDED"), title: z.string(), detail: z.string(), evidence: evidenceArray }),
]);

export const RunEventPayloadSchema = RunEventPayloadBaseSchema.superRefine((value, ctx) => {
  if (
    value.tag === "VALIDATION_FAILED" &&
    value.classification === "PRECONDITION_FAILED" &&
    value.summary.length === 0
  ) {
    ctx.addIssue({ code: "custom", message: "PRECONDITION_FAILED requires a non-empty summary" });
  }
});
export const RunEventPayloadJsonSchemaText = JSON.stringify(
  z.toJSONSchema(RunEventPayloadSchema, { unrepresentable: "any" }),
);

export const RunEventSchema = z.strictObject({
  id: RunEventIdSchema,
  runId: RunIdSchema,
  sequence: z.number().int().positive(),
  occurredAt: IsoDateTimeSchema,
  event: RunEventPayloadSchema,
});

export type HumanInputCategory = z.infer<typeof HumanInputCategorySchema>;
export type ProposalDisposition = z.infer<typeof ProposalDispositionSchema>;
export type ValidationStage = z.infer<typeof ValidationStageSchema>;
export type StageCompletion = z.infer<typeof StageCompletionSchema>;
export type RunEventPayload = z.infer<typeof RunEventPayloadSchema>;
export type RunEvent = Readonly<z.infer<typeof RunEventSchema>>;

const uniqueStringArray = <T extends z.ZodType<string>>(schema: T) =>
  z.array(schema).refine(unique, "array values must be unique").readonly();

const SignedTaskDefinitionSchema = z.strictObject({
  id: z.string(),
  objective: z.string(),
  dependsOn: uniqueStringArray(z.string()),
  scope: uniqueStringArray(RepositoryPatternSchema),
  exclusions: uniqueStringArray(RepositoryPatternSchema),
  acceptanceRefs: uniqueStringArray(AuthorityRefSchema),
  changeSurface: uniqueStringArray(ChangeSurfacePathSchema),
  gateIds: uniqueStringArray(GateIdSchema),
  authorityRefs: uniqueStringArray(AuthorityRefSchema),
  concernIds: uniqueStringArray(ConcernIdSchema),
});

export const SignedTaskBlockSchema = z
  .strictObject({
    version: z.literal(1),
    tasks: z.array(SignedTaskDefinitionSchema).readonly(),
  })
  .superRefine((value, ctx) => {
    const ids = value.tasks.map((task) => task.id);
    if (!unique(ids)) {
      ctx.addIssue({ code: "custom", message: "task ids must be unique" });
      return;
    }
    const known = new Set(ids);
    for (const task of value.tasks) {
      for (const dependency of task.dependsOn) {
        if (!known.has(dependency)) {
          ctx.addIssue({ code: "custom", message: `task ${task.id} has non-local dependency ${dependency}` });
        }
        if (dependency === task.id) {
          ctx.addIssue({ code: "custom", message: `task ${task.id} depends on itself` });
        }
      }
    }
    const edges = new Map(value.tasks.map((task) => [task.id, task.dependsOn] as const));
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): boolean => {
      if (visiting.has(id)) return false;
      if (visited.has(id)) return true;
      visiting.add(id);
      for (const dependency of edges.get(id) ?? []) {
        if (!visit(dependency)) return false;
      }
      visiting.delete(id);
      visited.add(id);
      return true;
    };
    for (const id of ids) {
      if (!visit(id)) {
        ctx.addIssue({ code: "custom", message: "task dependencies must be acyclic" });
        break;
      }
    }
  });

export const SignedTaskBlockJsonSchemaText = JSON.stringify(
  z.toJSONSchema(SignedTaskBlockSchema, { unrepresentable: "any" }),
);

export type SignedTaskDefinition = Readonly<z.infer<typeof SignedTaskDefinitionSchema>>;
export type SignedTaskBlock = Readonly<z.infer<typeof SignedTaskBlockSchema>>;

export const SignoffPackageSchema = z.strictObject({
  baselineCommit: GitCommitSchema,
  packageHash: Sha256Schema,
  sourceSha256: Sha256Schema,
  taskBlock: SignedTaskBlockSchema,
});

export type SignoffPackage = Readonly<z.infer<typeof SignoffPackageSchema>>;

const authorityShape = {
  p1: z.array(RepositoryPatternSchema).readonly(),
  p2: z.array(RepositoryPatternSchema).readonly(),
  p3: z.array(RepositoryPatternSchema).readonly(),
  p4: z.array(RepositoryPatternSchema).readonly(),
  p5: z.array(RepositoryPatternSchema).readonly(),
  p6: z.array(RepositoryPatternSchema).readonly(),
} as const;

const precedenceShape = {
  p1: z.array(RepositoryPathSchema).readonly().optional(),
  p2: z.array(RepositoryPathSchema).readonly().optional(),
  p3: z.array(RepositoryPathSchema).readonly().optional(),
  p4: z.array(RepositoryPathSchema).readonly().optional(),
  p5: z.array(RepositoryPathSchema).readonly().optional(),
  p6: z.array(RepositoryPathSchema).readonly().optional(),
} as const;

const DefaultRuleIdSchema = z.enum(defaultRuleIds);

const GovernanceRuleSchema = z.strictObject({
  defaultRuleId: DefaultRuleIdSchema,
  source: RepositoryPathSchema,
  authorityRef: AuthorityRefSchema,
  gates: z.array(GateIdSchema).refine(unique, "duplicate governance gates").readonly(),
});

const GovernanceFitnessSchema = z.partialRecord(
  DefaultRuleIdSchema,
  z.array(GateIdSchema).refine(unique, "duplicate governance fitness gates").readonly(),
);

const ConcernSchema = z.strictObject({
  authority: z.array(RepositoryPatternSchema).readonly(),
  paths: z.array(RepositoryPatternSchema).readonly(),
  gates: z.array(GateIdSchema).refine(unique, "duplicate concern gates").readonly(),
});

const VerificationSchema = z.strictObject({
  argv: z.array(z.string()).min(1).readonly(),
  cwd: RepositoryPathSchema.default("."),
  timeoutSeconds: z.number().int().min(1).max(86400),
  inheritEnv: z.array(z.string().regex(envNamePattern)).refine(unique, "duplicate inherited environment names").readonly(),
  materialRefs: z.array(RepositoryPatternSchema).readonly(),
});

const ProjectWorkItemsRootSchema = RepositoryPathSchema.refine(
  (value) => value !== "." && value !== ".git" && !value.startsWith(".git/"),
  "workItems.root must be a repository-contained non-Git directory",
);

export const ProjectWorkItemsSchema = z.strictObject({
  root: ProjectWorkItemsRootSchema.default("docs/order/work-items"),
});

export const ProjectManifestSchema = z
  .strictObject({
    version: z.literal(1),
    projectId: ProjectIdSchema,
    authority: z.strictObject(authorityShape),
    refs: z.record(AuthorityRefSchema, RepositoryPathSchema).optional().default({}),
    precedence: z.strictObject(precedenceShape).optional().default({}),
    governance: z
      .strictObject({
        overrides: z.array(GovernanceRuleSchema).readonly().optional().default([]),
        extensions: z.array(GovernanceRuleSchema).readonly().optional().default([]),
        fitness: GovernanceFitnessSchema.optional().default({}),
      })
      .optional()
      .default({ overrides: [], extensions: [], fitness: {} }),
    concerns: z.record(ConcernIdSchema, ConcernSchema).optional().default({}),
    verification: z.record(GateIdSchema, VerificationSchema).optional().default({}),
    workItems: ProjectWorkItemsSchema.optional()
      .default({ root: "docs/order/work-items" }),
  })
  .superRefine((value, ctx) => {
    const overrideIds = value.governance.overrides.map((rule) => rule.defaultRuleId);
    if (!unique(overrideIds)) {
      ctx.addIssue({ code: "custom", message: "duplicate governance override defaultRuleId" });
    }
    for (const [layer, paths] of Object.entries(value.precedence)) {
      if (paths && !unique(paths)) {
        ctx.addIssue({ code: "custom", message: `duplicate precedence path in ${layer}` });
      }
    }
  });

export type ProjectWorkItems = Readonly<z.infer<typeof ProjectWorkItemsSchema>>;
export type ProjectManifest = Readonly<z.infer<typeof ProjectManifestSchema>>;
export type GovernanceRule = Readonly<z.infer<typeof GovernanceRuleSchema>>;
export type Concern = Readonly<z.infer<typeof ConcernSchema>>;
export type Verification = Readonly<z.infer<typeof VerificationSchema>>;
