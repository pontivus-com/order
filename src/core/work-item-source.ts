import {
  MarkdownTextSchema,
  WorkItemSchemaCatalogEntrySchema,
  WorkItemSchemaIdSchema,
  WorkItemSourceMetadataSchema,
  WorkItemSourcePathSchema,
  WorkItemSourceSnapshotSchema,
  WorkItemTitleSchema,
  type ConcernId,
  type ProjectId,
  type ProjectManifest,
  type RepositoryPath,
  type Sha256,
  type StageCompletion,
  type WorkItem,
  type WorkItemKind,
  type WorkItemSchemaCatalogEntry,
  type WorkItemSchemaId,
  type WorkItemSourceDiagnosticCode,
  type WorkItemSourceMetadata,
  type WorkItemSourcePath,
  type WorkItemSourceSnapshot,
  type WorkItemTitle,
  type WorkStage,
} from "./contracts.ts";

export const workItemSchemaCatalog: readonly WorkItemSchemaCatalogEntry[] = Object.freeze([
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "change-v1", kind: "CHANGE" }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "defect-v1", kind: "DEFECT" }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "investigation-v1", kind: "INVESTIGATION" }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "audit-v1", kind: "AUDIT" }),
]);

const catalogBySchema = new Map<WorkItemSchemaId, WorkItemSchemaCatalogEntry>(
  workItemSchemaCatalog.map((entry) => [entry.schemaId, entry]),
);

const UNSUPPORTED_WORK_ITEM_SCHEMA = "UNSUPPORTED_SCHEMA" as const;

type WorkItemSourceParseFailure = TypeError & Readonly<{
  orderCode: typeof UNSUPPORTED_WORK_ITEM_SCHEMA;
}>;

const unsupportedSchemaFailureMarker: Readonly<{
  orderCode: typeof UNSUPPORTED_WORK_ITEM_SCHEMA;
}> = {
  orderCode: UNSUPPORTED_WORK_ITEM_SCHEMA,
};

const unsupportedSchemaFailure = (detail: string): WorkItemSourceParseFailure =>
  Object.assign(new TypeError(detail), unsupportedSchemaFailureMarker);

export const isUnsupportedWorkItemSchemaFailure = (
  error: unknown,
): error is WorkItemSourceParseFailure =>
  error instanceof TypeError &&
  "orderCode" in error &&
  (error as { orderCode?: unknown }).orderCode === UNSUPPORTED_WORK_ITEM_SCHEMA;

const renderTemplate = (
  templateId: string,
  authorityRefs: readonly string[],
  sections: readonly string[],
): string => [
  `<!-- Order template: ${templateId}; authority: ${authorityRefs.join(", ")} -->`,
  "",
  ...sections.flatMap((heading) => [`## ${heading}`, ""]),
].join("\n");

const authoringTemplates: Readonly<Record<WorkItemSchemaId, string>> = Object.freeze({
  "change-v1": renderTemplate(
    "change-intake-v1",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1", "GW-DOC-WORK-LIFECYCLE-V1"],
    ["Requested outcome", "Current context", "Constraints/non-goals", "Evidence/references"],
  ),
  "defect-v1": renderTemplate(
    "defect-intake-v1",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1", "GW-DOC-WORK-LIFECYCLE-V1"],
    [
      "Observed behavior",
      "Expected behavior",
      "Reproduction/evidence",
      "Behavior that must remain unchanged",
      "Impact/context",
    ],
  ),
  "investigation-v1": renderTemplate(
    "investigation-intake-v1",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1", "GW-DOC-WORK-LIFECYCLE-V1"],
    ["Question", "Why it matters", "Known evidence/context", "Investigation boundary"],
  ),
  "audit-v1": renderTemplate(
    "audit-intake-v1",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1", "GW-DOC-WORK-LIFECYCLE-V1"],
    ["Target under audit", "Governing authority/criteria", "Scope/exclusions", "Requested evidence/verdict"],
  ),
});

const stageTemplates = Object.freeze({
  "change-r1-v1": renderTemplate(
    "change-r1-v1",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V1"],
    [
      "Current state/absence",
      "Evidence",
      "Governing authority",
      "Affected producer→consumer path",
      "Downstream invariants",
      "Unresolved facts",
      "Verdict",
    ],
  ),
  "defect-r1-v1": renderTemplate(
    "defect-r1-v1",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V1"],
    [
      "Observed symptom/reproduction",
      "Proven root cause",
      "Producer→carrier→consumer path",
      "Downstream effects/invariants",
      "Governing authority",
      "Unresolved facts",
      "Verdict",
    ],
  ),
  "investigation-r1-v1": renderTemplate(
    "investigation-r1-v1",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V1"],
    ["Question", "Evidence for/against", "Findings", "Unresolved questions", "Conclusion"],
  ),
  "audit-r1-v1": renderTemplate(
    "audit-r1-v1",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V1"],
    ["Target/criteria", "Evidence by criterion", "Findings", "Verdict"],
  ),
  "delivery-r2-v1": renderTemplate(
    "delivery-r2-v1",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-SPECIFICATION-STANDARD-V1"],
    [
      "Required observable outcome",
      "Acceptance criteria",
      "Scope/exclusions",
      "Failure/negative behavior",
      "Material compatibility/security/performance constraints",
    ],
  ),
  "delivery-design-v1": renderTemplate(
    "delivery-design-v1",
    ["GW-DOC-LIFECYCLE-CONTEXT-V1", "GW-DOC-TECHNICAL-ARCHITECTURE-V1"],
    [
      "Context/governing constraints",
      "Goals/non-goals",
      "Canonical owner/affected boundaries",
      "Data/control flow",
      "Decisions/rationale/alternatives",
      "Failure behavior",
      "Preservation/downstream invariants",
      "Validation obligations",
    ],
  ),
  "delivery-plan-v1": renderTemplate(
    "delivery-plan-v1",
    ["GW-DOC-LIFECYCLE-CONTEXT-V1", "GW-DOC-CANONICAL-CONTRACTS-V1"],
    [
      "Exact task units/dependencies",
      "Requirement/design traceability",
      "Expected change surface",
      "Deletions/additions/modifications",
      "Validation sequence",
      "Canonical order-tasks block",
    ],
  ),
  "delivery-r3-v1": renderTemplate(
    "delivery-r3-v1",
    ["GW-DOC-LIFECYCLE-CONTEXT-V1", "GW-DOC-VALIDATION-STANDARD-V1"],
    [
      "Readiness verdict",
      "Evidence",
      "Adversarial findings",
      "Exact defective layer/return stage when not ready",
    ],
  ),
});

type StageTemplateId = keyof typeof stageTemplates;

const stageTemplateIdFor = (
  schemaId: WorkItemSchemaId,
  stage: Extract<WorkStage, "R1" | "R2" | "DESIGN" | "PLAN" | "R3">,
): StageTemplateId | null => {
  if (stage === "R1") {
    switch (schemaId) {
      case "change-v1": return "change-r1-v1";
      case "defect-v1": return "defect-r1-v1";
      case "investigation-v1": return "investigation-r1-v1";
      case "audit-v1": return "audit-r1-v1";
    }
  }
  if (schemaId === "investigation-v1" || schemaId === "audit-v1") return null;
  switch (stage) {
    case "R2": return "delivery-r2-v1";
    case "DESIGN": return "delivery-design-v1";
    case "PLAN": return "delivery-plan-v1";
    case "R3": return "delivery-r3-v1";
  }
};

const allowedR1: Readonly<Record<WorkItemSchemaId, readonly StageCompletion["outcome"][]>> = {
  "change-v1": ["CONFIRMED", "DISPROVEN", "DUPLICATE", "ALREADY_SATISFIED"],
  "defect-v1": ["CONFIRMED", "DISPROVEN", "DUPLICATE", "ALREADY_SATISFIED"],
  "investigation-v1": ["INVESTIGATION_COMPLETE", "DUPLICATE", "ALREADY_SATISFIED"],
  "audit-v1": ["AUDIT_COMPLETE", "DUPLICATE", "ALREADY_SATISFIED"],
};

export const workItemKindForSchema = (schemaId: WorkItemSchemaId): WorkItemKind => {
  const canonical = WorkItemSchemaIdSchema.parse(schemaId);
  const entry = catalogBySchema.get(canonical);
  if (!entry) throw new TypeError(`unsupported WorkItem schema: ${canonical}`);
  return entry.kind;
};

export const defaultSchemaForKind = (kind: WorkItemKind): WorkItemSchemaId => {
  const entry = workItemSchemaCatalog.find((candidate) => candidate.kind === kind);
  if (!entry) throw new TypeError(`unsupported WorkItem kind: ${kind}`);
  return entry.schemaId;
};

export const allowedR1CompletionsForSchema = (
  schemaId: WorkItemSchemaId,
): readonly StageCompletion["outcome"][] => allowedR1[WorkItemSchemaIdSchema.parse(schemaId)];

export const r1CompletionIsAllowedForSchema = (
  schemaId: WorkItemSchemaId,
  outcome: StageCompletion["outcome"],
): boolean => allowedR1CompletionsForSchema(schemaId).includes(outcome);

export const unresolvedConcernIdsForProject = (
  concernIds: readonly ConcernId[],
  project: ProjectManifest,
): readonly ConcernId[] =>
  concernIds.filter((concernId) => project.concerns[concernId] === undefined);

export const linkedRemediationIsAllowed = (
  parent: Pick<WorkItem, "projectId" | "schemaId" | "stage" | "outcome">,
  childProjectId: ProjectId,
  childSchemaId: WorkItemSchemaId,
): boolean => {
  const parentKind = workItemKindForSchema(parent.schemaId);
  const childKind = workItemKindForSchema(childSchemaId);
  return (
    parent.projectId === childProjectId &&
    parent.stage === "COMPLETE" &&
    (parentKind === "INVESTIGATION" || parentKind === "AUDIT") &&
    (parent.outcome === "INVESTIGATION_COMPLETE" || parent.outcome === "AUDIT_COMPLETE") &&
    (childKind === "CHANGE" || childKind === "DEFECT")
  );
};

export type WorkItemSourceDisposition = "UPDATED" | "UNCHANGED";

export type ExistingWorkItemSourceClassification =
  | Readonly<{
      tag: "ACCEPT";
      disposition: WorkItemSourceDisposition;
    }>
  | Readonly<{
      tag: "REJECT";
      code: Extract<
        WorkItemSourceDiagnosticCode,
        "INVALID_SOURCE" | "SOURCE_RECLASSIFICATION_BLOCKED" | "COMPLETED_SOURCE_CHANGED"
      >;
      detail: string;
    }>;

export const classifyExistingWorkItemSource = (
  existing: Pick<
    WorkItem,
    "id" | "projectId" | "schemaId" | "sourcePath" | "sourceSha256" | "derivedFromWorkItemId" | "stage"
  >,
  source: Pick<WorkItemSourceSnapshot, "path" | "sha256" | "metadata">,
  hasStageRun: boolean,
): ExistingWorkItemSourceClassification => {
  if (source.metadata.id !== existing.id) {
    return {
      tag: "REJECT",
      code: "INVALID_SOURCE",
      detail: "WorkItem source id no longer matches its persisted projection",
    };
  }
  if ((source.metadata.derivedFromWorkItemId ?? null) !== existing.derivedFromWorkItemId) {
    return {
      tag: "REJECT",
      code: "SOURCE_RECLASSIFICATION_BLOCKED",
      detail: "derivedFromWorkItemId is immutable after creation",
    };
  }

  const reclassified =
    source.metadata.schemaId !== existing.schemaId ||
    source.metadata.projectId !== existing.projectId;
  if (reclassified && (existing.stage !== "IDEA" || hasStageRun)) {
    return {
      tag: "REJECT",
      code: "SOURCE_RECLASSIFICATION_BLOCKED",
      detail: "schemaId/projectId may change only for an unprogressed IDEA",
    };
  }

  const bytesChanged = source.sha256 !== existing.sourceSha256;
  if (existing.stage === "COMPLETE" && bytesChanged) {
    return {
      tag: "REJECT",
      code: "COMPLETED_SOURCE_CHANGED",
      detail: "completed WorkItem source bytes changed; history remains closed",
    };
  }

  if (source.path !== existing.sourcePath) {
    return {
      tag: "REJECT",
      code: "INVALID_SOURCE",
      detail: "WorkItem source is not at its deterministic repository path",
    };
  }

  return {
    tag: "ACCEPT",
    disposition: bytesChanged ? "UPDATED" : "UNCHANGED",
  };
};

export const stageTemplateForSchema = (
  schemaId: WorkItemSchemaId,
  stage: Extract<WorkStage, "R1" | "R2" | "DESIGN" | "PLAN" | "R3">,
): string | null => {
  const id = stageTemplateIdFor(WorkItemSchemaIdSchema.parse(schemaId), stage);
  return id === null ? null : stageTemplates[id];
};

export type WorkItemDocumentRole = "SOURCE" | "R1" | "R2" | "DESIGN" | "PLAN" | "R3";

const workItemDocumentFilename: Readonly<Record<WorkItemDocumentRole, string>> = Object.freeze({
  SOURCE: "work-request.md",
  R1: "research.md",
  R2: "requirements.md",
  DESIGN: "solution-design.md",
  PLAN: "implementation-plan.md",
  R3: "readiness-review.md",
});

export const workItemDocumentPath = (
  workItemsRoot: RepositoryPath,
  id: WorkItemSourceMetadata["id"],
  role: WorkItemDocumentRole,
): RepositoryPath =>
  WorkItemSourcePathSchema.parse(
    `${workItemsRoot}/${id}/${workItemDocumentFilename[role]}`,
  );

export const workItemSourcePathForId = (
  workItemsRoot: RepositoryPath,
  id: WorkItemSourceMetadata["id"],
): WorkItemSourcePath =>
  WorkItemSourcePathSchema.parse(workItemDocumentPath(workItemsRoot, id, "SOURCE"));

const titleFromBody = (body: string): WorkItemTitle => {
  const first = body.split("\n").find((line) => line.trim().length > 0);
  if (!first || !first.startsWith("# ") || first.startsWith("## ")) {
    throw new TypeError("WorkItem source body must begin with a level-1 title");
  }
  return WorkItemTitleSchema.parse(first.slice(2));
};

const validateRequiredIntakeSections = (
  schemaId: WorkItemSchemaId,
  body: string,
): void => {
  const lines = body.split("\n");
  const requiredSections = authoringTemplates[schemaId]
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3));
  let prior = -1;
  for (const section of requiredSections) {
    const marker = `## ${section}`;
    const indices = lines.flatMap((line, index) => line === marker ? [index] : []);
    if (indices.length === 0 || indices[0]! <= prior) {
      throw new TypeError(`WorkItem source is missing ordered section: ${section}`);
    }
    if (indices.length !== 1) {
      throw new TypeError(`WorkItem source contains duplicate section: ${section}`);
    }
    prior = indices[0]!;
  }
};

export const parseWorkItemSourceMarkdown = (
  path: WorkItemSourcePath,
  sha256: Sha256,
  markdown: string,
): Readonly<WorkItemSourceSnapshot & { title: WorkItemTitle }> => {
  const canonicalPath = WorkItemSourcePathSchema.parse(path);
  const canonicalMarkdown = MarkdownTextSchema.parse(markdown);
  const lines = canonicalMarkdown.split("\n");
  if (lines[0] !== "---") throw new TypeError("WorkItem source must begin with ---");
  const close = lines.indexOf("---", 1);
  if (close < 2) throw new TypeError("WorkItem source metadata terminator is missing");

  const metadataText = lines.slice(1, close).join("\n");
  let decoded: unknown;
  try {
    decoded = JSON.parse(metadataText);
  } catch (error) {
    throw new TypeError("WorkItem source metadata must be strict JSON", { cause: error });
  }
  if (
    typeof decoded === "object" &&
    decoded !== null &&
    "schemaId" in decoded &&
    !WorkItemSchemaIdSchema.safeParse((decoded as { schemaId?: unknown }).schemaId).success
  ) {
    throw unsupportedSchemaFailure(
      "WorkItem source schemaId is not in the canonical catalog",
    );
  }
  const metadata = WorkItemSourceMetadataSchema.parse(decoded);
  if (metadata.derivedFromWorkItemId === metadata.id) {
    throw new TypeError("derivedFromWorkItemId must not equal the WorkItem id");
  }
  const body = lines.slice(close + 1).join("\n");
  const title = titleFromBody(body);
  validateRequiredIntakeSections(metadata.schemaId, body);

  const snapshot = WorkItemSourceSnapshotSchema.parse({
    path: canonicalPath,
    sha256,
    metadata,
    markdown: canonicalMarkdown,
  });
  return { ...snapshot, title };
};

export const renderWorkItemSourceMarkdown = (
  metadata: WorkItemSourceMetadata,
  title: WorkItemTitle,
): string => {
  const canonicalMetadata = WorkItemSourceMetadataSchema.parse({
    ...metadata,
    concernIds: [...metadata.concernIds].sort(),
  });
  const canonicalTitle = WorkItemTitleSchema.parse(title);
  const text = [
    "---",
    JSON.stringify(canonicalMetadata, null, 2),
    "---",
    `# ${canonicalTitle}`,
    "",
    authoringTemplates[canonicalMetadata.schemaId].trimEnd(),
    "",
  ].join("\n");
  return MarkdownTextSchema.parse(text);
};

export const duplicateWorkItemSourceIds = (
  snapshots: readonly WorkItemSourceSnapshot[],
): readonly WorkItemSourceMetadata["id"][] => {
  const counts = new Map<WorkItemSourceMetadata["id"], number>();
  for (const snapshot of snapshots) {
    const id = snapshot.metadata.id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
};
