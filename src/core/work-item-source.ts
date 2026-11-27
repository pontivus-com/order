import {
  AuthorityRefSchema,
  type AuthorityRef,
  MarkdownTextSchema,
  RepositoryPathSchema,
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
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "change-v1", kind: "CHANGE", authoringDefault: false }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "defect-v1", kind: "DEFECT", authoringDefault: false }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "change-v2", kind: "CHANGE", authoringDefault: true }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "defect-v2", kind: "DEFECT", authoringDefault: true }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "investigation-v1", kind: "INVESTIGATION", authoringDefault: false }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "audit-v1", kind: "AUDIT", authoringDefault: false }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "investigation-v2", kind: "INVESTIGATION", authoringDefault: true }),
  WorkItemSchemaCatalogEntrySchema.parse({ schemaId: "audit-v2", kind: "AUDIT", authoringDefault: true }),
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

const renderR2AuthorityTemplate = (
  templateId: string,
  authorityRefs: readonly string[],
  sections: readonly string[],
): string => renderTemplate(templateId, authorityRefs, sections).replace(
  "## Functional authority disposition ledger\n",
  [
    "## Functional authority disposition ledger",
    "",
    "| Requirement | Disposition | Canonical owner |",
    "|---|---|---|",
    "|  |  |  |",
    "",
  ].join("\n"),
);

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
  "change-v2": renderTemplate(
    "change-intake-v2",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2", "GW-DOC-WORK-LIFECYCLE-V1"],
    ["Requested outcome", "Current context", "Constraints/non-goals", "Evidence/references"],
  ),
  "defect-v2": renderTemplate(
    "defect-intake-v2",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2", "GW-DOC-WORK-LIFECYCLE-V1"],
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
  "investigation-v2": renderTemplate(
    "investigation-intake-v2",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2", "GW-DOC-WORK-LIFECYCLE-V1"],
    ["Question", "Why it matters", "Known evidence/context", "Investigation boundary"],
  ),
  "audit-v2": renderTemplate(
    "audit-intake-v2",
    ["GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2", "GW-DOC-WORK-LIFECYCLE-V1"],
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
  "change-r1-v2": renderTemplate(
    "change-r1-v2",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2"],
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
  "defect-r1-v2": renderTemplate(
    "defect-r1-v2",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2"],
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
  "investigation-r1-v2": renderTemplate(
    "investigation-r1-v2",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2"],
    ["Question", "Evidence for/against", "Findings", "Unresolved questions", "Conclusion"],
  ),
  "audit-r1-v2": renderTemplate(
    "audit-r1-v2",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2"],
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
  "change-r2-v2": renderR2AuthorityTemplate(
    "change-r2-v2",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-SPECIFICATION-STANDARD-V2", "GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION"],
    [
      "P2 intent and R1 factual basis",
      "Functional authority disposition ledger",
      "Required observable outcome/delta",
      "Acceptance criteria",
      "Scope/exclusions",
      "Failure/negative behavior",
      "Material compatibility/security/performance constraints",
      "Open product/authority questions",
    ],
  ),
  "defect-r2-v2": renderR2AuthorityTemplate(
    "defect-r2-v2",
    ["GW-DOC-WORK-LIFECYCLE-V1", "GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-SPECIFICATION-STANDARD-V2", "GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION"],
    [
      "Proven defect/root cause",
      "Functional authority disposition ledger",
      "Expected corrected behavior",
      "Behavior that must remain unchanged",
      "Acceptance proving the original defect",
      "Regression/preservation acceptance",
      "Scope/exclusions",
      "Open product/authority questions",
    ],
  ),
  "change-design-v2": renderTemplate(
    "change-design-v2",
    ["GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-TECHNICAL-ARCHITECTURE-V2"],
    [
      "Requirement-to-solution map",
      "Canonical owner/affected boundaries",
      "Existing capability/reuse, behavior to replace, and necessary new concepts",
      "Technical requirements/architecture",
      "Contracts/state/data-flow changes",
      "Decisions/rationale/rejected alternatives",
      "Compatibility/preservation",
      "Failure behavior",
      "Validation obligations",
    ],
  ),
  "defect-design-v2": renderTemplate(
    "defect-design-v2",
    ["GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-TECHNICAL-ARCHITECTURE-V2"],
    [
      "Root cause/producer boundary",
      "Requirement-to-solution map",
      "Correction at the canonical owner",
      "Existing capability/reuse, incorrect behavior to delete/replace, and necessary new concepts",
      "Rejected alternatives/rationale",
      "Preserved invariants/downstream consumers",
      "Minimum root-cause remediation",
      "Failure behavior",
      "Regression validation obligations",
    ],
  ),
  "change-plan-v2": renderTemplate(
    "change-plan-v2",
    ["GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-CANONICAL-CONTRACTS-V2", "GW-DOC-SPECIFICATION-STANDARD-V2"],
    [
      "Exact task units/dependencies/objectives",
      "Requirement/design traceability",
      "Module ownership/decomposition constraints and architecture-feedback checkpoints",
      "Expected production and test/validation surface",
      "Required deletions/replacements",
      "Completion evidence",
      "Minimum-change forecast",
      "Verification contract",
      "Canonical order-tasks block",
    ],
  ),
  "defect-plan-v2": renderTemplate(
    "defect-plan-v2",
    ["GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-CANONICAL-CONTRACTS-V2", "GW-DOC-SPECIFICATION-STANDARD-V2"],
    [
      "Root-cause remediation tasks/dependencies/objectives",
      "Requirement/design traceability",
      "Module ownership/decomposition constraints and architecture-feedback checkpoints",
      "Expected production and test/validation surface",
      "Incorrect behavior to delete/replace",
      "Completion evidence",
      "Minimum-change forecast",
      "Verification contract including reproduction/regression/preservation",
      "Canonical order-tasks block",
    ],
  ),
  "delivery-r3-v2": renderTemplate(
    "delivery-r3-v2",
    ["GW-DOC-LIFECYCLE-CONTEXT-V2", "GW-DOC-SPECIFICATION-STANDARD-V2", "GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW"],
    [
      "Readiness verdict",
      "Authority topology review",
      "P1-P7 traceability review",
      "Lifecycle package completeness",
      "Open decision/conflict ledger",
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
      case "change-v1":
        return "change-r1-v1";
      case "change-v2":
        return "change-r1-v2";
      case "defect-v1":
        return "defect-r1-v1";
      case "defect-v2":
        return "defect-r1-v2";
      case "investigation-v1": return "investigation-r1-v1";
      case "audit-v1": return "audit-r1-v1";
      case "investigation-v2": return "investigation-r1-v2";
      case "audit-v2": return "audit-r1-v2";
    }
  }
  if (
    schemaId === "investigation-v1" ||
    schemaId === "audit-v1" ||
    schemaId === "investigation-v2" ||
    schemaId === "audit-v2"
  ) return null;
  if (schemaId === "change-v1" || schemaId === "defect-v1") {
    switch (stage) {
      case "R2": return "delivery-r2-v1";
      case "DESIGN": return "delivery-design-v1";
      case "PLAN": return "delivery-plan-v1";
      case "R3": return "delivery-r3-v1";
    }
  }
  if (schemaId === "change-v2") {
    switch (stage) {
      case "R2": return "change-r2-v2";
      case "DESIGN": return "change-design-v2";
      case "PLAN": return "change-plan-v2";
      case "R3": return "delivery-r3-v2";
    }
  }
  switch (stage) {
    case "R2": return "defect-r2-v2";
    case "DESIGN": return "defect-design-v2";
    case "PLAN": return "defect-plan-v2";
    case "R3": return "delivery-r3-v2";
  }
};

const allowedR1: Readonly<Record<WorkItemSchemaId, readonly StageCompletion["outcome"][]>> = {
  "change-v1": ["CONFIRMED", "DISPROVEN", "DUPLICATE", "ALREADY_SATISFIED"],
  "defect-v1": ["CONFIRMED", "DISPROVEN", "DUPLICATE", "ALREADY_SATISFIED"],
  "change-v2": ["CONFIRMED", "DISPROVEN", "DUPLICATE", "ALREADY_SATISFIED"],
  "defect-v2": ["CONFIRMED", "DISPROVEN", "DUPLICATE", "ALREADY_SATISFIED"],
  "investigation-v1": ["INVESTIGATION_COMPLETE", "DUPLICATE", "ALREADY_SATISFIED"],
  "audit-v1": ["AUDIT_COMPLETE", "DUPLICATE", "ALREADY_SATISFIED"],
  "investigation-v2": ["INVESTIGATION_COMPLETE", "DUPLICATE", "ALREADY_SATISFIED"],
  "audit-v2": ["AUDIT_COMPLETE", "DUPLICATE", "ALREADY_SATISFIED"],
};

export const workItemKindForSchema = (schemaId: WorkItemSchemaId): WorkItemKind => {
  const canonical = WorkItemSchemaIdSchema.parse(schemaId);
  const entry = catalogBySchema.get(canonical);
  if (!entry) throw new TypeError(`unsupported WorkItem schema: ${canonical}`);
  return entry.kind;
};

export const defaultSchemaForKind = (kind: WorkItemKind): WorkItemSchemaId => {
  const entry = workItemSchemaCatalog.find(
    (candidate) => candidate.kind === kind && candidate.authoringDefault,
  );
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
    allowedR1CompletionsForSchema(parent.schemaId).some((outcome) => outcome === parent.outcome) &&
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

const readStageAuthorityHeader = (
  markdown: string,
  expectedTemplateId: string,
): readonly AuthorityRef[] => {
  const firstLine = markdown.split("\n", 1)[0] ?? "";
  const match = /^<!-- Order template: ([^;]+); authority: (.*) -->$/.exec(firstLine);
  if (match === null || match[1] !== expectedTemplateId) {
    throw new TypeError("stage document is missing its exact pinned template authority identity");
  }
  const refs = match[2].split(",").map((token) => {
    const encoded = token.trim();
    let decoded: string;
    try {
      decoded = decodeURIComponent(encoded);
    } catch {
      throw new TypeError("stage document contains malformed encoded AuthorityRef");
    }
    if (decoded.length === 0 || encodeURIComponent(decoded) !== encoded) {
      throw new TypeError("stage document contains noncanonical encoded AuthorityRef");
    }
    return AuthorityRefSchema.parse(decoded);
  });
  if (new Set(refs).size !== refs.length) {
    throw new TypeError("stage document contains duplicate AuthorityRef");
  }
  return refs;
};

export const stageDocumentAuthorityRefs = (
  schemaId: WorkItemSchemaId,
  stage: Extract<WorkStage, "R1" | "R2" | "DESIGN" | "PLAN" | "R3">,
  markdown: string,
): readonly AuthorityRef[] => {
  const id = stageTemplateIdFor(WorkItemSchemaIdSchema.parse(schemaId), stage);
  if (id === null) {
    throw new TypeError("schema " + schemaId + " does not authorize stage " + stage);
  }
  const required = readStageAuthorityHeader(stageTemplates[id], id);
  const declared = readStageAuthorityHeader(markdown, id);
  for (const ref of required) {
    if (!declared.includes(ref)) {
      throw new TypeError("stage document is missing pinned AuthorityRef: " + ref);
    }
  }
  return declared;
};

const requiredTemplateSections = (template: string): readonly string[] =>
  template
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3));

type AuthorityDisposition = "REFERENCE" | "DELTA" | "LOCAL";
type AuthorityDispositionRow = readonly [
  requirement: string,
  disposition: AuthorityDisposition,
  canonicalOwner: string,
];

const authorityDispositionRows = (
  markdown: string,
): readonly AuthorityDispositionRow[] => {
  const lines = markdown.split("\n");
  const headingIndex = lines.indexOf("## Functional authority disposition ledger");
  if (headingIndex < 0) {
    throw new TypeError("stage document is missing functional authority disposition ledger");
  }
  const sectionEnd = lines.findIndex(
    (line, index) => index > headingIndex && line.startsWith("## "),
  );
  const section = lines.slice(
    headingIndex + 1,
    sectionEnd < 0 ? lines.length : sectionEnd,
  );
  const rows = section
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line.trim().slice(1, -1).split("|").map((cell) => cell.trim())
    )
    .filter((cells) =>
      cells.length >= 3 &&
      cells.some((cell) => cell.length > 0) &&
      cells[0] !== "Requirement" &&
      !/^[-:]+$/.test(cells[0] ?? "")
    );
  if (rows.length === 0) {
    throw new TypeError("functional authority disposition ledger requires at least one requirement row");
  }
  for (const cells of rows) {
    const [requirement = "", disposition = "", owner = ""] = cells;
    if (requirement.length === 0) {
      throw new TypeError("functional authority disposition ledger contains an empty requirement");
    }
    if (
      disposition !== "REFERENCE" &&
      disposition !== "DELTA" &&
      disposition !== "LOCAL"
    ) {
      throw new TypeError(
        "functional authority disposition must be REFERENCE, DELTA or LOCAL",
      );
    }
    if (
      (disposition === "REFERENCE" || disposition === "DELTA") &&
      !owner.startsWith("GW-")
    ) {
      throw new TypeError(
        disposition + " functional authority disposition requires a GW-* canonical owner",
      );
    }
  }
  return rows.map((cells) => [
    cells[0]!,
    cells[1]! as AuthorityDisposition,
    cells[2] ?? "",
  ] as const);
};

const validateAuthorityDispositionLedger = (markdown: string): void => {
  authorityDispositionRows(markdown);
};

export const authorityDispositionOwnerRefs = (
  schemaId: WorkItemSchemaId,
  stage: Extract<WorkStage, "R1" | "R2" | "DESIGN" | "PLAN" | "R3">,
  markdown: string,
): readonly string[] => {
  if (
    stage !== "R2" ||
    (schemaId !== "change-v2" && schemaId !== "defect-v2")
  ) {
    return [];
  }
  return authorityDispositionRows(markdown)
    .filter(([, disposition]) =>
      disposition === "REFERENCE" || disposition === "DELTA"
    )
    .map(([, , owner]) => owner);
};

export const validateStageDocumentStructure = (
  schemaId: WorkItemSchemaId,
  stage: Extract<WorkStage, "R1" | "R2" | "DESIGN" | "PLAN" | "R3">,
  markdown: string,
): void => {
  const canonicalSchema = WorkItemSchemaIdSchema.parse(schemaId);
  if (!canonicalSchema.endsWith("-v2")) return;
  stageDocumentAuthorityRefs(canonicalSchema, stage, markdown);
  if (canonicalSchema !== "change-v2" && canonicalSchema !== "defect-v2") return;
  const template = stageTemplateForSchema(canonicalSchema, stage);
  if (template === null) {
    throw new TypeError("schema " + canonicalSchema + " does not authorize stage " + stage);
  }
  const canonicalMarkdown = MarkdownTextSchema.parse(markdown);
  const lines = canonicalMarkdown.split("\n");
  let prior = -1;
  for (const section of requiredTemplateSections(template)) {
    const marker = "## " + section;
    const indices = lines.flatMap((line, index) => line === marker ? [index] : []);
    if (indices.length === 0 || indices[0] <= prior) {
      throw new TypeError("stage document is missing ordered section: " + section);
    }
    if (indices.length !== 1) {
      throw new TypeError("stage document contains duplicate section: " + section);
    }
    prior = indices[0];
  }
  if (stage === "R2") {
    validateAuthorityDispositionLedger(canonicalMarkdown);
  }
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

export const workItemArchiveMarkerPath = (
  workItemsRoot: RepositoryPath,
  id: WorkItemSourceMetadata["id"],
): RepositoryPath =>
  RepositoryPathSchema.parse(`${workItemsRoot}/${id}/.order-archived`);

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

type WorkItemSourceParts = Readonly<{
  metadata: WorkItemSourceMetadata;
  bodyMarkdown: string;
  bodyStart: number;
}>;

const workItemSourceParts = (markdown: string): WorkItemSourceParts => {
  const canonicalMarkdown = MarkdownTextSchema.parse(markdown);
  if (!canonicalMarkdown.startsWith("---\n")) {
    throw new TypeError("WorkItem source must begin with ---");
  }
  const closing = canonicalMarkdown.indexOf("\n---\n", 4);
  if (closing < 4) {
    throw new TypeError("WorkItem source metadata terminator is missing");
  }

  const metadataText = canonicalMarkdown.slice(4, closing);
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

  const bodyStart = closing + "\n---\n".length;
  return {
    metadata,
    bodyMarkdown: canonicalMarkdown.slice(bodyStart),
    bodyStart,
  };
};

export const validateWorkItemSourceBody = (
  schemaId: WorkItemSchemaId,
  bodyMarkdown: string,
): Readonly<{ bodyMarkdown: string; title: WorkItemTitle }> => {
  const canonicalBody = MarkdownTextSchema.parse(bodyMarkdown);
  const title = titleFromBody(canonicalBody);
  validateRequiredIntakeSections(schemaId, canonicalBody);
  return { bodyMarkdown: canonicalBody, title };
};

export const recomposeWorkItemSourceBody = (
  currentMarkdown: string,
  bodyMarkdown: string,
): string => {
  const canonicalCurrent = MarkdownTextSchema.parse(currentMarkdown);
  const parts = workItemSourceParts(canonicalCurrent);
  const validated = validateWorkItemSourceBody(parts.metadata.schemaId, bodyMarkdown);
  return MarkdownTextSchema.parse(
    canonicalCurrent.slice(0, parts.bodyStart) + validated.bodyMarkdown,
  );
};

export const parseWorkItemSourceMarkdown = (
  path: WorkItemSourcePath,
  sha256: Sha256,
  markdown: string,
): Readonly<WorkItemSourceSnapshot & { title: WorkItemTitle }> => {
  const canonicalPath = WorkItemSourcePathSchema.parse(path);
  const canonicalMarkdown = MarkdownTextSchema.parse(markdown);
  const parts = workItemSourceParts(canonicalMarkdown);
  const validated = validateWorkItemSourceBody(parts.metadata.schemaId, parts.bodyMarkdown);

  const snapshot = WorkItemSourceSnapshotSchema.parse({
    path: canonicalPath,
    sha256,
    metadata: parts.metadata,
    markdown: canonicalMarkdown,
    bodyMarkdown: validated.bodyMarkdown,
  });
  return { ...snapshot, title: validated.title };
};

export const rewriteWorkItemSourceTitle = (
  markdown: string,
  title: WorkItemTitle,
): string => {
  const canonicalMarkdown = MarkdownTextSchema.parse(markdown);
  const canonicalTitle = WorkItemTitleSchema.parse(title);
  const lines = canonicalMarkdown.split("\n");
  if (lines[0] !== "---") throw new TypeError("WorkItem source must begin with ---");
  const close = lines.indexOf("---", 1);
  if (close < 2) throw new TypeError("WorkItem source metadata terminator is missing");
  const titleIndex = lines.findIndex(
    (line, index) => index > close && line.trim().length > 0,
  );
  if (titleIndex < 0 || !lines[titleIndex]!.startsWith("# ") || lines[titleIndex]!.startsWith("## ")) {
    throw new TypeError("WorkItem source body must begin with a level-1 title");
  }
  lines[titleIndex] = `# ${canonicalTitle}`;
  return MarkdownTextSchema.parse(lines.join("\n"));
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
