# 13 — Order P6 canonical contracts

**Status:** Binding P6 contract standard
**Canonical concern ID:** `GW-DOC-CANONICAL-CONTRACTS`  
**Versioned concern ID:** `GW-DOC-CANONICAL-CONTRACTS-V1`  

## 1. Purpose

**Stable P6 authority reference:** `GW-P6-V1-CONTRACTS` — the complete binding v1 contract set in this document.

This document owns the repository's exact v1 P6 contracts for canonical semantic data, the productive project manifest, the P7 machine-readable task block, SQLite persistence and local HTTP transport.


### 1.1 Product-identity contract

Public product identity is owned by `GW-DOC-PRODUCT-IDENTITY-V1`; the live technical namespace and bounded predecessor-migration semantics are owned by `GW-DOC-ORDER-TECHNICAL-IDENTITY-V1`.

The Order cutover is complete for the productive runtime. Current productive contracts use only:

- project manifest: `pontivus-order.toml`;
- executable task fence for newly authored productive plans: `order-tasks`;
- state override: `PONTIVUS_ORDER_STATE_ROOT`;
- database filename: `order.sqlite3`;
- Order-named config/runtime implementation identities defined by `GW-DOC-ORDER-TECHNICAL-IDENTITY-V1`.

The productive runtime does not retain Gateweft aliases or fallback readers. Gateweft naming is permitted only in historical provenance and the installer-owned, one-way migration boundary for the immediately preceding supported beta.

Stable `GW-*` authority identifiers, semantic schema meaning, WorkItem/lifecycle state, task semantics, authority-map meaning and database semantic schema are unchanged by the namespace transition.

This document does not redefine lifecycle meaning, validation semantics or authority precedence. Those remain owned by [GW-DOC-WORK-LIFECYCLE-V1](01-work-lifecycle.md), [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md), [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](10-systems-governance-pyramid.md) and [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md).

There are no DTO/domain/persistence copies. One canonical schema owns each semantic type.

## 2. Canonical schema rule

Each canonical semantic type is declared once as a Zod schema in the v1 canonical owner `src/core/contracts.ts`.

The TypeScript type is inferred from that schema.

```ts
export const WorkItemSchema = z.strictObject({ /* exact fields below */ });
export type WorkItem = z.infer<typeof WorkItemSchema>;
```

Every canonical object schema uses `z.strictObject(...)` or an exactly equivalent strict composition; strip/passthrough object modes are forbidden for canonical ingress. Every external config/HTTP/provider/persistence ingress uses the owning canonical schema's `safeParse` (or the same schema's throwing parse at a shell boundary that converts failure to the required stable error) and only the parsed value enters the functional core.

Do not separately hand-author a domain interface, persistence interface, HTTP response interface, UI model or mapper between equivalent shapes.

Unknown fields fail ingress validation. Canonical JSON uses camelCase keys and UTF-8.

## 3. Scalar formats

Order-generated ids use a fixed prefix plus UUIDv4:

- Work item: `work_<uuid>`;
- Artifact ref: `artifact_<uuid>`;
- Approval: `approval_<uuid>`;
- Execution task: `task_<uuid>`;
- Run: `run_<uuid>`;
- Run event: `event_<uuid>`;

Other scalar contracts:

```ts
type ProjectId = string;       // [a-z0-9][a-z0-9._-]*
type ConcernId = string;       // same grammar as ProjectId
type GateId = string;          // same grammar as ProjectId
type AuthorityRef = string;    // project-owned stable requirement/ADR/spec id
type RepositoryPath = string;     // normalized POSIX literal relative path; no glob chars, "..", or absolute paths
type RepositoryPattern = string;  // normalized POSIX Bun.Glob pattern over repository-relative paths; no ".." or absolute patterns
type GitCommit = string;       // full 40-char lowercase hex commit
type Sha256 = `sha256:${string}`; // exactly 64 lowercase hex chars after prefix
type IsoDateTime = string;     // exactly YYYY-MM-DDTHH:mm:ss.sssZ
```

Parsers enforce the comments above at ingress.

`IsoDateTime` is the deliberate Order subset of RFC 3339 grounded in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 §12.1](14-external-version-facts.md): exactly 24 ASCII characters matching `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/`. Ingress additionally requires `Date.parse(value)` to be finite and `new Date(Date.parse(value)).toISOString() === value`. Generation calls `new Date(epochMillis).toISOString()` and rejects any result that does not match the 24-character grammar. Offsets, lowercase `t/z`, variable fractional precision, extended years and leap-second spellings are not canonical Order values.

Order-generated UUID identifiers use the platform `crypto.randomUUID()` UUIDv4 operation and prepend the canonical prefix. No UUID package is permitted.

One shell helper owns every Order authentication/provider secret and one-time connect token:

```ts
const secureTokenHex = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
};
```

`secureTokenHex()` always returns exactly 64 lowercase hexadecimal characters representing 256 CSPRNG bits. `Math.random`, timestamp-derived values, UUIDs, hashes of predictable inputs and third-party token generators are forbidden for these secrets/tokens.

One shell byte-hash function and one explicit UTF-8 adapter own every Order SHA-256 operation:

```ts
const utf8 = new TextEncoder();

const sha256Hex = (bytes: Uint8Array): string => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(bytes);
  return hasher.digest("hex");
};

const sha256TextHex = (text: string): string =>
  sha256Hex(utf8.encode(text));
```

Exact repository-file identity passes the exact file bytes to `sha256Hex`. Canonical JSON and any other textual identity pass the exact canonical string to `sha256TextHex`. No hash call relies on an implicit string encoding. The canonical `Sha256` value is `sha256:${hex}`. `Bun.hash` is forbidden for canonical identity because it is non-cryptographic. The underlying UUID/CSPRNG/UTF-8/hash capability facts are grounded in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md).

## 4. WorkItem

```ts
type WorkStage =
  | "IDEA"
  | "R1"
  | "R2"
  | "DESIGN"
  | "PLAN"
  | "R3"
  | "AWAITING_SIGNOFF"
  | "EXECUTION"
  | "COMPLETE";

type WorkStatus = "ACTIVE" | "BLOCKED" | "COMPLETE";

type WorkOutcome =
  | "DISPROVEN"
  | "DUPLICATE"
  | "ALREADY_SATISFIED"
  | "INVESTIGATION_COMPLETE"
  | "AUDIT_COMPLETE"
  | "CANDIDATE_DONE";

type WorkItem = Readonly<{
  id: WorkItemId;
  projectId: ProjectId;
  repositoryRoot: string;
  title: string;
  origin: string;
  schemaId: WorkItemSchemaId;
  sourcePath: WorkItemSourcePath;
  sourceSha256: Sha256;
  derivedFromWorkItemId: WorkItemId | null;
  stage: WorkStage;
  status: WorkStatus;
  outcome: WorkOutcome | null;
  concernIds: readonly ConcernId[];
  archived: boolean;
  createdAt: IsoDateTime;
}>;
```

Invariants:

- `EXECUTION` and `COMPLETE` are WorkItem aggregate storage phases, not additional decision-making lifecycle stages; post-signoff task execution remains owned by `ExecutionTask` and [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md);
- `status === "COMPLETE"` iff `stage === "COMPLETE"`;
- `outcome !== null` only when complete;
- `AWAITING_SIGNOFF` has no current Approval;
- sign-off moves the WorkItem to `EXECUTION`;
- `WAITING_FOR_INPUT` is a Run status, never a WorkItem state;
- blocked work retains the owning stage;
- `kind` is never persisted beside `schemaId`; it is derived through the canonical WorkItem schema catalog;
- `sourcePath`, `sourceSha256`, `schemaId`, `derivedFromWorkItemId`, title/project/concerns and stable id are projections of the currently reconciled portable source, not independent authority;
- `archived` is the projection of the deterministic repository-native archive marker defined in §34; it is not lifecycle state and is not sourced from Work request Markdown;
- R1 `CONFIRMED` promotes to R2 only for `CHANGE`/`DEFECT`;
- R1 `INVESTIGATION_COMPLETE` and `AUDIT_COMPLETE` terminalize their matching kinds directly without R2/DESIGN/PLAN/R3/EXECUTION;
- R1/R2 `NEEDS_DECISION` or `BLOCKED` leaves the item at its owning stage with `status = "BLOCKED"`.

## 5. ArtifactRef

```ts
type AuthorityLayer =
  | "P0" | "P1" | "P2" | "P3" | "P4"
  | "P5" | "P6" | "P7" | "P8";

type ArtifactRole =
  | "R1"
  | "R2"
  | "DESIGN"
  | "PLAN"
  | "R3"
  | "GOVERNANCE"
  | "PROJECT_MANIFEST"
  | "VERIFICATION_MATERIAL";

type ArtifactRef = Readonly<{
  id: ArtifactRefId;
  workItemId: WorkItemId;
  repositoryPath: RepositoryPath;
  role: ArtifactRole;
  authorityLayer: AuthorityLayer | null;
  sha256: Sha256;
  gitCommit: GitCommit | null;
}>;
```

An ArtifactRef identifies a file snapshot for one WorkItem; project identity is derived from that WorkItem. It does not copy artifact content.

ArtifactRef rows are immutable. A changed file produces a new ArtifactRef. Order persists an ArtifactRef only when the file snapshot participates in a durable stage output, conformance dependency, proposal/adoption, approval, or verification binding; incidental context reads remain ephemeral.

For an adopted or inspected uncommitted pre-signoff file, `gitCommit` is null. Such an ArtifactRef may participate in pre-signoff context/conformance but cannot be used by Approval.

Before sign-off, every material artifact is re-resolved from the selected Git baseline into an ArtifactRef with non-null `gitCommit` and matching bytes.

## 6. Approval

```ts
type Approval = Readonly<{
  id: ApprovalId;
  workItemId: WorkItemId;
  baselineCommit: GitCommit;
  packageHash: Sha256;
  planArtifactRefId: ArtifactRefId;
  r3ArtifactRefId: ArtifactRefId;
  sourceSha256: Sha256;
  approvedBy: string;
  approvedAt: IsoDateTime;
}>;
```

Approval is immutable.

The pre-sign-off browser reads one computed canonical projection; it is not persisted and does not duplicate Approval state:

```ts
type SignoffPackage = Readonly<{
  baselineCommit: GitCommit;
  packageHash: Sha256;
  sourceSha256: Sha256;
  taskBlock: SignedTaskBlock;
}>;
```

`SignoffPackage` is derived from the same current R3 closure and canonical package hash used by the sign-off command. It exists only to let the operator inspect the exact baseline/hash/task records that will be submitted back as `expectedPackageHash`.

The signed package reuses the existing conformance dependency graph instead of copying authority into Approval fields. The originating WorkItem source is bound separately by exact source SHA-256 because it is not a repository ArtifactRef. New v2 approvals require non-null `sourceSha256`; preserved v1 approvals remain null-bound historical provenance and cannot authorize v2 execution.

At sign-off Order requires:

- `planArtifactRefId` is the one signed `PLAN` ArtifactRef for the WorkItem at `baselineCommit`;
- `r3ArtifactRefId` is the `R3` ArtifactRef whose conformance dependency closure includes that PLAN and every material authority, project-manifest and verification-material ArtifactRef used to establish readiness;
- every ArtifactRef in that transitive closure has non-null `gitCommit === baselineCommit` and bytes matching that commit;
- the current validated WorkItem source SHA-256 equals `SignoffPackage.sourceSha256`;
- the PLAN contains exactly one valid canonical `order-tasks` block.

`packageHash` is SHA-256 of canonical JSON over:

```ts
{
  workItemId,
  baselineCommit,
  sourceSha256,
  plan: {
    repositoryPath: plan.repositoryPath,
    role: plan.role,
    authorityLayer: plan.authorityLayer,
    sha256: plan.sha256,
  },
  r3: {
    repositoryPath: r3.repositoryPath,
    role: r3.role,
    authorityLayer: r3.authorityLayer,
    sha256: r3.sha256,
  },
  materialArtifacts: transitiveDependenciesExcludingPlanAndR3
    .map(({ repositoryPath, role, authorityLayer, sha256 }) => ({
      repositoryPath,
      role,
      authorityLayer,
      sha256,
    }))
    .sort(byRepositoryPathThenRoleThenAuthorityLayer),
}
```

The PLAN and R3 roots are represented only by the dedicated `plan`/`r3` entries above; `materialArtifacts` contains their transitive material dependencies and excludes those two roots. Generated ArtifactRef ids, WorkItem foreign keys and dependency-edge row identities are deliberately excluded from package identity: they are persistence identities, not project authority. Sign-off requires the complete root-plus-dependency set to contain no duplicate semantic source identity `(repositoryPath, role, authorityLayer)`.

No separate task-block hash, project-manifest pointer, validation copy, minimum-change copy or material-artifact list is persisted on Approval.

The PLAN bytes already bind the exact task definitions, including `gateIds`, `scope`, `exclusions` and `changeSurface`; the transitive dependency closure determines the material `pontivus-order.toml`, governance and verification source set that informed readiness, while the hash binds that set by semantic identity and bytes rather than by database row identity.

One pure `canonicalJson(value)` function owns every Order canonical-JSON identity. Its algorithm is exact:

1. accepted values are `null`, booleans, strings, finite JSON numbers, arrays of accepted values, and plain objects whose enumerable own string-keyed properties contain accepted values;
2. `undefined`, non-finite numbers, bigint, functions, symbols, Date/Map/Set/class instances, symbol-keyed data and cyclic values are rejected;
3. `null`, booleans, finite numbers and strings are emitted with `JSON.stringify(value)`; if that does not return a string, canonicalization fails;
4. arrays preserve semantic order and emit `[${elements.map(canonicalJson).join(",")}]`;
5. object keys are `Object.keys(value).sort()` using JavaScript's default UTF-16 code-unit ordering; emit each entry directly as `${JSON.stringify(key)}:${canonicalJson(value[key])}` between `{` and `}`;
6. no whitespace or trailing newline is emitted;
7. the final string is encoded as UTF-8 only when bytes are required for hashing/persistence.

The function never constructs a newly sorted object and then relies on ordinary property enumeration order. Array sorting happens only at the semantic owner before canonicalization when that specific contract declares an array order-insensitive; canonicalization itself never reorders arrays. The `JSON.stringify` primitive behavior relied upon here is grounded in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 §12.2](14-external-version-facts.md).

Approval freshness is computed, not stored; no mutable `isStale` field exists.

At V0/V1 Order re-resolves the current material source set using the current project manifest, authority/precedence rules, concern applicability and the signed task's verification bindings. It then compares that current set with the signed PLAN/R3 dependency closure by semantic source identity `(repositoryPath, role, authorityLayer)` and content SHA-256.

Freshness fails with `APPROVAL_STALE` when any signed material source changes bytes, disappears, changes semantic role/layer, when current resolution adds/removes a material authority, project-manifest or verification-material source, or when the current validated WorkItem source cannot be proven equal to the non-null source hash bound into the v2 approval. PLAN and R3 root paths/bytes are included in this comparison. A null-bound historical v1 approval is always non-executable under v2.

The current repository commit id is not itself a freshness input: an unrelated commit that leaves the resolved material set and all signed bytes unchanged does not stale approval. `baselineCommit` remains the immutable execution baseline used for isolated workspaces. Freshness comparison does not create or persist replacement ArtifactRefs merely to compare current bytes.

## 7. ExecutionTask

```ts
type ExecutionTaskState =
  | "TODO"
  | "RUNNING"
  | "CANDIDATE_DONE"
  | "ALREADY_SATISFIED"
  | "BLOCKED";

type ExecutionTask = Readonly<{
  id: ExecutionTaskId;
  approvalId: ApprovalId;
  planTaskId: string;
  objective: string;
  dependsOn: readonly ExecutionTaskId[];
  scope: readonly RepositoryPattern[];
  exclusions: readonly RepositoryPattern[];
  acceptanceRefs: readonly AuthorityRef[];
  changeSurface: readonly RepositoryPath[];
  gateIds: readonly GateId[];
  authorityRefs: readonly AuthorityRef[];
  concernIds: readonly ConcernId[];
  state: ExecutionTaskState;
}>;
```

Task content other than `state` is immutable after materialization.

`changeSurface` contains exact literal `RepositoryPath` values. Every value must be admitted by at least one `scope` pattern, admitted by no `exclusions` pattern, be unique, be disjoint from the material authority/project-manifest/verification sources in the Approval closure, and have a final path segment other than `AGENTS.md`. The instruction-path prohibition is existence-independent: a signed task cannot authorize creation of a new `AGENTS.md` merely because the path did not exist when the Approval was materialized. A worker never mutates the authority that authorizes its own execution.

A post-signoff task remains `RUNNING` through implementation and V2-V7 validation; validation progress belongs to its Run/RunEvents and does not create another task state.

`CANDIDATE_DONE` and `ALREADY_SATISFIED` are successful dependency-satisfying terminal task states. `BLOCKED` is not.

Dependencies reference tasks in the same Approval. They control eligibility only. Every execution Run still starts from `Approval.baselineCommit`; Order does not merge or promote a successful dependency workspace into a later task's baseline. Therefore a downstream task must be independently executable from the approval baseline and must not require upstream candidate bytes. Cumulative repository changes that require one another are represented as ordered implementation steps inside one signed task.

The owning WorkItem is derived through `approvalId`; ExecutionTask does not duplicate `workItemId`.

Aggregate completion rules:

- a dependency is satisfied only when its task state is `CANDIDATE_DONE` or `ALREADY_SATISFIED`;
- when every task under the current Approval is in one of those successful terminal states, the WorkItem becomes `COMPLETE`;
- if every task is `ALREADY_SATISFIED`, WorkItem outcome is `ALREADY_SATISFIED`;
- otherwise WorkItem outcome is `CANDIDATE_DONE`;
- a `BLOCKED` task never counts as completion.

## 8. Run

```ts
type RunMode = "INTERACTIVE" | "UNATTENDED";
type RunRole = "STAGE" | "BUILDER" | "REVIEWER" | "REMEDIATOR";

type RunStatus =
  | "RUNNING"
  | "WAITING_FOR_INPUT"
  | "COMPLETED"
  | "BLOCKED"
  | "FAILED"
  | "CANCELLED";

type ValidationClassification =
  | "TEST_FAILURE"
  | "REVIEW_FAILURE"
  | "SPEC_INVALID"
  | "APPROVAL_STALE"
  | "SCOPE_BREACH"
  | "GOVERNANCE_BREACH"
  | "CHANGE_BLOAT"
  | "ENVIRONMENT_BLOCKED"
  | "PROVIDER_FAILURE"
  | "ALREADY_SATISFIED";

type RunTerminalClassification =
  | ValidationClassification
  | "PRECONDITION_FAILED"
  | "BLOCKED_FOR_REANALYSIS"
  | "COORDINATOR_INTERRUPTED"
  | "CANDIDATE_DONE";

type Run = Readonly<{
  id: RunId;
  workItemId: WorkItemId;
  executionTaskId: ExecutionTaskId | null;
  stage: WorkStage;
  mode: RunMode;
  role: RunRole;
  triggerEventId: RunEventId | null;
  status: RunStatus;
  attempt: number;
  baselineCommit: GitCommit;
  contextHash: Sha256;
  providerSessionId: string | null;
  terminalClassification: RunTerminalClassification | null;
  startedAt: IsoDateTime;
  endedAt: IsoDateTime | null;
}>;
```

Rules:

- pre-signoff interactive Runs use `role = STAGE`, have no ExecutionTask, `triggerEventId = null`, and operate at their owning lifecycle stage;
- post-signoff Runs use `stage = EXECUTION`, reference an ExecutionTask and have role `BUILDER`, `REVIEWER` or `REMEDIATOR`;
- `BUILDER.triggerEventId = null`; `REVIEWER.triggerEventId` identifies the exact `CANDIDATE_STATE_RECORDED` event it replays; `REMEDIATOR.triggerEventId` identifies the exact repairable `VALIDATION_FAILED`/`REVIEW_FAILED` event it is authorized to correct;
- the candidate parent of a REMEDIATOR is derived through the triggering failure Run's reviewer trigger; it is not copied into another field;
- `WAITING_FOR_INPUT` is valid only for `INTERACTIVE/STAGE`;
- `providerSessionId` is the currently active OpenCode session pointer, never workflow authority;
- every post-signoff Run has its own derived workspace `<order-state>/workspaces/<runId>/` and fresh checkout at the Approval baseline; candidate state crosses Runs only through evidence replay;
- `contextHash` changes only through controlled re-resolution and requires provider-session replacement before the next productive prompt;
- terminal statuses require `endedAt`.

`attempt` is a durable Run ordinal, not a retry budget: post-signoff it is one plus the maximum prior Run attempt for the ExecutionTask; pre-signoff it is one plus the maximum prior attempt for the WorkItem/stage. Retry entitlement is computed from Run history under §21 rather than persisted as another counter.

## 9. EvidenceRef

`EvidenceRef` is a nested immutable value inside RunEvents, not a top-level semantic owner.

```ts
type EvidencePath = string;

type EvidenceRef = Readonly<{
  relativePath: EvidencePath;
  sha256: Sha256;
  mediaType: string;
}>;
```

`EvidencePath` is a non-empty normalized POSIX relative path with no absolute form, `..` segment, NUL or backslash ambiguity. It is relative to the producing Run evidence directory and may not escape it.

Before a RunEvent referencing evidence is persisted, Order proves the destination is beneath `<order-state>/evidence/<runId>/`, rejects symlinks/non-regular files, writes the exact bytes, reads them back and verifies the recorded SHA-256. A referenced evidence file is immutable. v1 adds no evidence table or automatic retention subsystem.

## 10. RunEvent

```ts
type RunEvent = Readonly<{
  id: RunEventId;
  runId: RunId;
  sequence: number;
  occurredAt: IsoDateTime;
  event: RunEventPayload;
}>;

type HumanInputCategory =
  | "INFORMATION"
  | "EVIDENCE"
  | "STAGE_CHOICE"
  | "AUTHORITY_DECISION"
  | "AUTHORITY_CONFLICT";

type ProposalDisposition = "ADOPTED" | "REJECTED";

type ValidationStage = "V0" | "V1" | "V2" | "V3" | "V4" | "V5" | "V6" | "V7";

type StageCompletion =
  | {
      stage: "R1";
      outcome:
        | "CONFIRMED"
        | "DISPROVEN"
        | "DUPLICATE"
        | "ALREADY_SATISFIED"
        | "INVESTIGATION_COMPLETE"
        | "AUDIT_COMPLETE";
    }
  | { stage: "R2"; outcome: "ACCEPTED" }
  | { stage: "DESIGN"; outcome: "ACCEPTED" }
  | { stage: "PLAN"; outcome: "ACCEPTED" }
  | {
      stage: "R3";
      outcome:
        | "READY_FOR_SIGNOFF"
        | "RETURN_TO_RESEARCH"
        | "RETURN_TO_REQUIREMENTS"
        | "RETURN_TO_DESIGN"
        | "RETURN_TO_PLAN";
    };

type RunEventPayload =
  | { tag: "STAGE_STARTED"; stage: WorkStage; mode: RunMode; contextHash: Sha256 }
  | { tag: "AGENT_MESSAGE_FINAL"; text: string; evidence: readonly EvidenceRef[] }
  | { tag: "HUMAN_INPUT_REQUESTED"; category: HumanInputCategory; question: string }
  | { tag: "HUMAN_INPUT_RECEIVED"; requestEventId: RunEventId | null; text: string }
  | {
      tag: "ARTIFACT_PROPOSAL_CREATED";
      targetPath: RepositoryPath;
      baseSha256: Sha256 | null;
      role: ArtifactRole;
      authorityLayer: AuthorityLayer;
      unifiedDiff: string;
      rationale: string;
    }
  | {
      tag: "ARTIFACT_PROPOSAL_ADOPTION_REQUESTED";
      proposalEventId: RunEventId;
    }
  | {
      tag: "ARTIFACT_PROPOSAL_DISPOSITIONED";
      proposalEventId: RunEventId;
      disposition: ProposalDisposition;
      adoptedArtifactRefId: ArtifactRefId | null;
    }
  | { tag: "STAGE_COMPLETED"; completion: StageCompletion; artifactRefIds: readonly ArtifactRefId[] }
  | { tag: "STAGE_BLOCKED"; reason: string; owningStage: WorkStage }
  | {
      tag: "CONFORMANCE_PASSED";
      stage: WorkStage;
      outputArtifactRefIds: readonly ArtifactRefId[];
      contextHash: Sha256;
      evidence: readonly EvidenceRef[];
    }
  | {
      tag: "CONFORMANCE_FAILED";
      stage: WorkStage;
      defectiveLayer: AuthorityLayer | null;
      summary: string;
      evidence: readonly EvidenceRef[];
    }
  | { tag: "PROVIDER_DIAGNOSTICS_RECORDED"; evidence: readonly EvidenceRef[] }
  | {
      tag: "PRODUCTIVE_INVOCATION_FAILED";
      classification: "PRECONDITION_FAILED" | "ENVIRONMENT_BLOCKED";
      detail: string;
      evidence: readonly EvidenceRef[];
    }
  | { tag: "PROVIDER_FAILED"; detail: string; evidence: readonly EvidenceRef[] }
  | { tag: "GATE_PASSED"; gateId: GateId; evidence: readonly EvidenceRef[] }
  | { tag: "GATE_FAILED"; gateId: GateId; classification: ValidationClassification; evidence: readonly EvidenceRef[] }
  | { tag: "REVIEW_PASSED"; evidence: readonly EvidenceRef[] }
  | { tag: "TASK_ALREADY_SATISFIED"; summary: string }
  | { tag: "REVIEW_FAILED"; classification: "REVIEW_FAILURE"; summary: string; evidence: readonly EvidenceRef[] }
  | {
      tag: "REVIEW_FAILED";
      classification: "BLOCKED_FOR_REANALYSIS";
      returnTo: "R1" | "R2" | "DESIGN" | "PLAN";
      summary: string;
      evidence: readonly EvidenceRef[];
    }
  | { tag: "VALIDATION_PASSED"; stage: ValidationStage; evidence: readonly EvidenceRef[] }
  | {
      tag: "VALIDATION_FAILED";
      stage: ValidationStage;
      classification:
        | "TEST_FAILURE"
        | "REVIEW_FAILURE"
        | "SPEC_INVALID"
        | "PRECONDITION_FAILED"
        | "APPROVAL_STALE"
        | "SCOPE_BREACH"
        | "GOVERNANCE_BREACH"
        | "CHANGE_BLOAT"
        | "ENVIRONMENT_BLOCKED"
        | "PROVIDER_FAILURE"
        | "BLOCKED_FOR_REANALYSIS";
      summary: string;
      evidence: readonly EvidenceRef[];
    }
  | { tag: "CANDIDATE_STATE_RECORDED"; patch: EvidenceRef; changedPaths: readonly RepositoryPath[] }
  | { tag: "CANDIDATE_RECORDED"; candidateStateEventId: RunEventId; validationEventIds: readonly RunEventId[] }
  | { tag: "AUTHORITY_CHANGED"; priorArtifactRefId: ArtifactRefId; newArtifactRefId: ArtifactRefId }
  | { tag: "REPOSITORY_DRIFTED"; expectedCommit: GitCommit; actualCommit: GitCommit }
  | { tag: "OBSERVATION_RECORDED"; title: string; detail: string; evidence: readonly EvidenceRef[] };
```

RunEvent invariants:

- every `HUMAN_INPUT_REQUESTED` is blocking in v1 and moves an interactive Run to `WAITING_FOR_INPUT`; a non-blocking human request has no separate semantic state;
- `ARTIFACT_PROPOSAL_CREATED.unifiedDiff` is complete Git unified-diff text and its decoded string must end with LF (`\\n`). A proposal missing that terminal LF is invalid provider output and may use only the existing single formatting-repair turn. Order never appends, trims, normalizes, or otherwise changes proposal patch bytes after provider validation;
- `ARTIFACT_PROPOSAL_ADOPTION_REQUESTED` is coordinator/human-owned and is persisted before the repository patch effect; once present, rejection is no longer valid and a later adopt call may reconcile only that exact persisted proposal;
- `ARTIFACT_PROPOSAL_DISPOSITIONED` with `ADOPTED` requires non-null `adoptedArtifactRefId`; `REJECTED` requires null;
- V4 reviewer `FAIL_REPAIRABLE` maps to `REVIEW_FAILED / REVIEW_FAILURE`; `BLOCKED_SPEC_OR_DESIGN` maps to `REVIEW_FAILED / BLOCKED_FOR_REANALYSIS` with an exact `returnTo` owning stage. Scope, governance and change-bloat classifications remain coordinator-owned V2/V5/V6 results;
- `VALIDATION_FAILED / PRECONDITION_FAILED` is the durable owner of the blocking fact: it uses the applicable V0/V1 stage, a non-empty `summary`, and supporting EvidenceRefs where available before the Run/task block reaction;
- `CANDIDATE_STATE_RECORDED` is coordinator-only and may be emitted only after its patch EvidenceRef has been durably written/read-back/hash-verified; `changedPaths` is unique and canonically sorted;
- `CANDIDATE_RECORDED` is coordinator-only and may be emitted only in the final `REVIEWER` Run; `candidateStateEventId` must equal that Run's `triggerEventId`; `validationEventIds` must reference exactly one `VALIDATION_PASSED` event for each V0-V7 stage in V0→V7 order, and all eight pass events must have been emitted in that same final REVIEWER Run after its candidate replay was verified. No validation pass from an earlier candidate or Run is reusable;
- `VALIDATION_PASSED / V4` additionally requires a preceding `REVIEW_PASSED` event in that same REVIEWER Run; `VALIDATION_FAILED / V4` is derived from that Run's `REVIEW_FAILED` result rather than invented independently;
- `TASK_ALREADY_SATISFIED` is provider-emittable only by a BUILDER. The coordinator accepts it as the V1 semantic no-op result only when the BUILDER workspace has zero changed paths. A zero-diff BUILDER Run without this explicit event is invalid provider output and must not become `ALREADY_SATISFIED`;
- provider output authorization is additionally constrained by Run role in §25; a valid-shaped but role-forbidden event is invalid provider output.

Raw provider token deltas/JSON are not RunEvents.

## 11. Artifact-proposal lifecycle

An `ARTIFACT_PROPOSAL_CREATED` event id is its proposal identity.

A proposal is pending until exactly one later `ARTIFACT_PROPOSAL_DISPOSITIONED` event references it.

Adoption loads the exact persisted proposal event, proves the persisted base hash/path and exact patch applicability without mutating the repository, and only then persists exactly one `ARTIFACT_PROPOSAL_ADOPTION_REQUESTED` event for it. Order may then apply only that exact persisted patch. After the effect, Order hashes/read-backs the target, records the new ArtifactRef and `ADOPTED` disposition, invalidates dependent conformance and returns the WorkItem to the earliest lifecycle stage that owns the adopted artifact's canonical role/authority layer. The adoption request carries no replacement patch or base hash.

If the repository effect succeeded but the final SQLite persistence failed, the next coordinator pass reconciles only because the durable adoption-request event proves human intent for that exact proposal. Reconciliation does not apply the patch again: Order proves the current target is the already-applied exact patch by an exact reverse-apply check and then persists the missing ArtifactRef/disposition. If interruption occurred after intent persistence but before the effect, the same coordinator reconciliation may apply the still-applicable exact patch. Without that durable adoption request, base-hash mismatch remains a hard failure.

A different patch is a new proposal event after the old proposal is rejected. Rejection never mutates the repository and is invalid once adoption has been requested.

## 12. Conformance evidence and dependency persistence

Conformance is persisted without another domain model.

For a promotable stage output:

1. Order resolves the exact material ArtifactRefs used by the stage context, including applicable authority plus project-manifest and verification-material refs when they materially constrain that stage;
2. deterministic/mechanical checks and any stage-required semantic review run;
3. on pass, for each output ArtifactRef Order inserts `artifactDependencies(output, dependency)` for every such material ArtifactRef from the resolved context;
4. the coordinator emits `CONFORMANCE_PASSED` with the output ids, context hash and evidence, or `CONFORMANCE_FAILED`;
5. promotion may occur only after the conformance event and dependency inserts commit in the same SQLite transaction as the WorkItem transition.

A later material authority change walks `artifactDependencies` transitively to identify stale downstream artifacts.

`contextHash` on `CONFORMANCE_PASSED` must equal the Run's contextHash.

Conformance events are coordinator-owned. The model cannot emit them.

## 13. P7 task-block schema

```ts
type SignedTaskBlock = Readonly<{
  version: 1;
  tasks: readonly Readonly<{
    id: string;
    objective: string;
    dependsOn: readonly string[];
    scope: readonly RepositoryPattern[];
    exclusions: readonly RepositoryPattern[];
    acceptanceRefs: readonly AuthorityRef[];
    changeSurface: readonly RepositoryPath[];
    gateIds: readonly GateId[];
    authorityRefs: readonly AuthorityRef[];
    concernIds: readonly ConcernId[];
  }>[];
}>;
```

Task ids are unique, dependencies are acyclic and local to the block, arrays contain unique values, every `changeSurface` value has a final path segment other than `AGENTS.md`, and all gate/concern ids must resolve through `pontivus-order.toml`. For each task, `gateIds` must include every logical gate required by every signed `concernId`; concern-required gates are resolved before sign-off and become part of the immutable signed task rather than being appended dynamically during execution.

Every `acceptanceRefs` and `authorityRefs` value must resolve through the same manifest's `refs` map described in §14. An unresolved reference is `SPEC_INVALID`; runtime never scans arbitrary prose or invents an alias/source mapping.

After Approval, Order maps block ids deterministically to generated ExecutionTask ids.

## 14. pontivus-order.toml v1 grammar

The shell reads the root `pontivus-order.toml` as UTF-8 text, calls `Bun.TOML.parse(text)`, treats the returned object as untrusted input, and validates it through the one canonical Order manifest Zod schema before any core function reads it. Parse failure, non-object structure, unknown keys or schema failure is `SPEC_INVALID`. Order does not import a TOML parser package and does not pass a file-backed `Bun.file()` Blob directly to `Bun.TOML.parse`.

```toml
version = 1
projectId = "example"

[authority]
p1 = ["AGENTS.md", "docs/principles.md"]
p2 = ["docs/product.md"]
p3 = ["docs/requirements.md"]
p4 = ["docs/architecture.md", "docs/legacy-architecture.md"]
p5 = ["docs/adr/*.md"]
p6 = ["docs/contracts/*.md"]

[refs]
P2-CONTROLLED-WORK = "docs/product.md"
FR-1 = "docs/requirements.md"
ADR-2 = "docs/adr/0002.md"
SPEC-3 = "docs/contracts/example.md"

[precedence]
p4 = ["docs/architecture.md", "docs/legacy-architecture.md"]

[[governance.overrides]]
defaultRuleId = "GW-P1-STRICT-TYPING"
source = "docs/principles.md"
authorityRef = "P1-TYPING-01"
gates = ["architecture"]

[[governance.extensions]]
defaultRuleId = "GW-P1-FCIS"
source = "AGENTS.md"
authorityRef = "P1-FCIS-EXT-01"
gates = ["architecture"]

[governance.fitness]
GW-P1-FCIS = ["architecture"]
GW-P1-SOC = ["architecture"]
GW-P1-STRICT-TYPING = ["architecture"]

[concerns.ui]
authority = ["docs/ui/design-system.md", "docs/ui/accessibility.md"]
paths = ["ui/**"]
gates = ["architecture"]

[verification.architecture]
argv = ["./scripts/verify-architecture"]
cwd = "."
timeoutSeconds = 600
inheritEnv = []
materialRefs = ["scripts/verify-architecture"]

[verification.backend-regression]
argv = ["./scripts/verify-backend"]
cwd = "."
timeoutSeconds = 1800
inheritEnv = []
materialRefs = ["scripts/verify-backend", "bun.lock"]
```

Exact schema:

- `version`: 1;
- `projectId`: ProjectId;
- `authority`: only `p1` through `p6`, each an array of RepositoryPattern values selecting project authority; array order is deterministic processing order only and does **not** create semantic precedence;
- optional `refs`: a map from `AuthorityRef` keys to literal `RepositoryPath` values; absent is equivalent to an empty map;
- each `refs.<AuthorityRef>` source path must resolve through at least one `authority.p1`–`authority.p6` source set;
- `refs` is an identity-to-source index only: semantic requirement/ADR/spec content remains owned by the referenced source file and is never copied into the manifest;
- canonical documentation concern references follow `GW-P1-DOC-CANONICALITY`: stable/versioned `GW-DOC-*` identifiers resolve through `refs`, while the referenced document remains the sole semantic owner;
- task `acceptanceRefs` and `authorityRefs` resolve by exact key lookup in `refs`; no filename search, full-text scan, nearest-match rule, or P7-local alias inference is permitted;
- a referenced source becomes material context/approval input when the task/stage uses that ref, so its exact ArtifactRef participates in conformance dependency/freshness handling;
- optional `precedence.p1` through `precedence.p6`: arrays of literal RepositoryPath values, highest authority first, declaring same-layer precedence only among the listed sources;
- every precedence path must resolve from the matching `authority.<layer>` set;
- a conflict between same-layer authorities without an applicable explicit precedence relation remains `CONTRADICTORY_AUTHORITY`;
- `governance.overrides[]`: zero or more explicit default replacements;
- `governance.extensions[]`: zero or more compatible additions to a Order default;
- optional `governance.fitness`: a map from stable `GW-P1-*` default-rule ids to arrays of GateIds that mechanically validate the resolved rule's checkable propositions, whether that rule is inherited, overridden or extended;
- every override/extension entry contains:
  - `defaultRuleId`: one stable `GW-P1-*` id defined by [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](10-systems-governance-pyramid.md);
  - `source`: one repository-relative project authority file;
  - `authorityRef`: a stable project-owned reference inside that source;
  - `gates`: zero or more GateIds that mechanically validate the rule;
- an override/extension source must also be reachable through the applicable `authority.p1` mapping;
- a Order P1 default is inherited exactly when no valid `governance.overrides` entry names its defaultRuleId;
- an extension adds to the inherited/resolved rule and never suppresses it;
- if an override/extension `gates` array is empty, that project rule adds no extra mechanical gate; otherwise its listed gates are required;
- `governance.fitness` gates are mandatory fitness sensors for the named resolved P1 rule and are additive with override/extension gates; a fitness gate does not suppress semantic review for propositions that cannot be proven mechanically;
- every fitness/override/extension GateId must resolve through `verification`;
- duplicate override entries for one defaultRuleId are invalid;
- `concerns.<ConcernId>.authority`: RepositoryPattern values selecting authority files;
- `concerns.<ConcernId>.paths`: RepositoryPattern values selecting deterministic repository surfaces;
- `concerns.<ConcernId>.gates`: GateId array;
- `verification.<GateId>.argv`: non-empty string array;
- `cwd`: RepositoryPath, default ".";
- `timeoutSeconds`: integer 1..86400;
- `inheritEnv`: environment variable names only;
- `materialRefs`: RepositoryPattern values selecting files whose bytes materially define the gate.

Unknown keys are rejected.

All repository-pattern matching is owned by one core utility using Bun.Glob semantics against normalized POSIX repository-relative paths. Literal RepositoryPath parsing and RepositoryPattern parsing are distinct; no call site may reinterpret one as the other.

The matcher fixes `Bun.Glob.scan` behavior to repository root with `dot=true`, `absolute=false`, `followSymlinks=false`, `throwErrorOnBrokenSymlink=true`, and `onlyFiles=true`. No call site supplies alternate Glob options.

Glob expansion is deterministic and path-sorted. Same-layer semantic precedence exists only through the explicit `precedence.<layer>` declaration; filesystem order and authority-array order never imply authority.

The resolved authority map therefore answers mechanically:

- project source(s) per P1-P6 layer;
- inherited Order P1 defaults;
- explicit overrides;
- compatible extensions;
- mechanical fitness gates attached directly to resolved Order P1 rules;
- additional mechanical gates attached to overrides/extensions;
- semantic-review obligations for rule propositions that are not mechanically provable.

## 15. SQLite location and connection

State-root resolution is exact:

1. if `PONTIVUS_ORDER_STATE_ROOT` is non-empty, it must be absolute and is used directly;
2. else if `XDG_STATE_HOME` is non-empty and absolute, use `$XDG_STATE_HOME/pontivus-order`;
3. else if `HOME` is non-empty and absolute, use `$HOME/.local/state/pontivus-order`;
4. otherwise startup fails and requires an explicit absolute `PONTIVUS_ORDER_STATE_ROOT`.

Relative values are invalid; Order never resolves them against cwd. This follows the grounded XDG state convention in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md).

Owned layout:

```text
order/
├── order.sqlite3
├── daemon-token
├── opencode/
├── evidence/<runId>/
└── workspaces/<runId>/
```

Database: `order.sqlite3`.

A target repository must be a local Git repository with a resolvable HEAD commit and a valid root `pontivus-order.toml` before a WorkItem can be created.

Order v1 productive daemon execution requires `process.platform === "linux"`. Windows/macOS startup is rejected before database/provider initialization; those hosts require a later P4/P6 integration contract.

The Order database must reside on one of the explicitly supported Linux local filesystem types below. SQLite WAL on a network, pseudo, in-memory, layered or otherwise unapproved filesystem is unsupported and blocks startup.

```text
ext2/ext3/ext4  0x0000ef53
XFS             0x58465342
Btrfs           0x9123683e
F2FS            0xf2f52010
```

Startup calls `statfsSync(stateRoot).type` and accepts only those exact values. NFS, CIFS/SMB, 9P, FUSE, overlayfs, tmpfs and every unknown value are rejected rather than guessed safe. The allowed values and Linux provenance are owned by [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md).

After the filesystem-type check, startup also runs the two-connection WAL locking smoke test in the state root. Both checks must pass; neither substitutes for the other.

On every database open Order executes and verifies:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

Startup also proves SQLite version >= 3.37, `SELECT json_valid('[]') = 1`, effective journal mode `wal`, and foreign keys enabled.

A failed capability/pragmas check is fatal. Order never silently falls back to rollback journaling, disabled foreign keys, weaker synchronous durability or non-STRICT schema.

No ORM is used.

Order uses SQLite `PRAGMA user_version` as the productive schema marker:

- `0`: create the current v3 schema directly for a fresh database and set `user_version = 3`;
- `3`: use the database;
- any other value: ordinary runtime startup fails before mutation.

The productive installer is the sole bounded version-transition owner. It may migrate the immediately preceding schema v2 only under §32.10 while the old daemon is stopped. Ordinary daemon/CLI opening never interprets v2 source-path semantics and never chooses between v2/v3 at runtime.

## 16. SQLite schema

Canonical scalar column names use the same camelCase names as the semantic contracts. JSON arrays/objects are canonical JSON text guarded by `json_valid`.

```sql
CREATE TABLE workItems (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  repositoryRoot TEXT NOT NULL,
  title TEXT NOT NULL,
  origin TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  outcome TEXT,
  concernIdsJson TEXT NOT NULL CHECK (json_valid(concernIdsJson)),
  archived INTEGER NOT NULL CHECK (archived IN (0, 1)),
  createdAt TEXT NOT NULL
) STRICT;

CREATE TABLE artifactRefs (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  repositoryPath TEXT NOT NULL,
  role TEXT NOT NULL,
  authorityLayer TEXT,
  sha256 TEXT NOT NULL,
  gitCommit TEXT
) STRICT;

CREATE INDEX artifactRefs_workItemId ON artifactRefs(workItemId);

CREATE TABLE artifactDependencies (
  artifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  dependsOnArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  PRIMARY KEY (artifactRefId, dependsOnArtifactRefId),
  CHECK (artifactRefId <> dependsOnArtifactRefId)
) STRICT;

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  baselineCommit TEXT NOT NULL,
  packageHash TEXT NOT NULL,
  planArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  r3ArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  sourceSha256 TEXT NOT NULL,
  approvedBy TEXT NOT NULL,
  approvedAt TEXT NOT NULL
) STRICT;

CREATE UNIQUE INDEX approvals_packageHash ON approvals(packageHash);

CREATE TABLE workItemSources (
  workItemId TEXT PRIMARY KEY REFERENCES workItems(id),
  schemaId TEXT NOT NULL,
  sourcePath TEXT NOT NULL UNIQUE,
  sourceSha256 TEXT NOT NULL,
  derivedFromWorkItemId TEXT
) STRICT;

CREATE TABLE executionTasks (
  id TEXT PRIMARY KEY,
  approvalId TEXT NOT NULL REFERENCES approvals(id),
  planTaskId TEXT NOT NULL,
  state TEXT NOT NULL,
  UNIQUE (approvalId, planTaskId)
) STRICT;

CREATE INDEX executionTasks_state ON executionTasks(state);

CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  executionTaskId TEXT REFERENCES executionTasks(id),
  stage TEXT NOT NULL,
  mode TEXT NOT NULL,
  role TEXT NOT NULL,
  triggerEventId TEXT REFERENCES runEvents(id),
  status TEXT NOT NULL,
  attempt INTEGER NOT NULL CHECK (attempt >= 1),
  baselineCommit TEXT NOT NULL,
  contextHash TEXT NOT NULL,
  providerSessionId TEXT,
  terminalClassification TEXT,
  startedAt TEXT NOT NULL,
  endedAt TEXT
) STRICT;

CREATE INDEX runs_workItemId ON runs(workItemId);
CREATE INDEX runs_executionTaskId ON runs(executionTaskId);

CREATE TABLE runEvents (
  id TEXT PRIMARY KEY,
  runId TEXT NOT NULL REFERENCES runs(id),
  sequence INTEGER NOT NULL CHECK (sequence >= 1),
  occurredAt TEXT NOT NULL,
  eventJson TEXT NOT NULL CHECK (json_valid(eventJson)),
  UNIQUE (runId, sequence)
) STRICT;
```

Rows representing complete canonical types are parsed through their canonical schemas before entering the core.

An `executionTasks` row deliberately stores only mutable task identity/state. To produce a canonical `ExecutionTask`, the shell reads `Approval.planArtifactRefId`, verifies that ArtifactRef is in the signed package closure at `baselineCommit`, parses its canonical task block, selects `planTaskId`, resolves its dependency task ids from the same Approval, combines that immutable definition with the row's `id`/`approvalId`/`state`, and validates the resulting `ExecutionTask` through its canonical schema.

SQLite therefore does not copy signed P7 task semantics into a second persistence representation.

Persistence is implemented as shell functions, not repository/service objects.

## 17. Transaction boundaries

These are one SQLite transaction:

- register/reconcile a WorkItem projection after the canonical Markdown source already exists and has been read/hash/parse verified;
- source reconciliation projection updates whose source state is unambiguous;
- lifecycle state transition;
- successful stage conformance: append `CONFORMANCE_PASSED`, insert its artifact dependency edges, and perform the resulting promotion;
- append RunEvent plus Run-state update when one reaction requires both;
- post-signoff task start: prove no other task is `RUNNING`, select one eligible `TODO`, set it to `RUNNING`, and create its `BUILDER` Run;
- post-signoff continuation Run start: while exactly one ExecutionTask remains `RUNNING` and no Run for it is active, load the last durable controlling event, validate the unique required continuation role/trigger/lineage/semantic-or-operational budget, and create exactly one `REVIEWER`, `REMEDIATOR`, or permitted replacement Run; no second task may start;
- create Approval plus all materialized ExecutionTasks;
- persist `ARTIFACT_PROPOSAL_ADOPTION_REQUESTED` before the corresponding repository patch effect; the post-effect ArtifactRef/disposition/owning-stage return is a later SQLite transaction and is reconciled from repository facts if that persistence fails;
- mutating Run candidate publication: append `CANDIDATE_STATE_RECORDED` and mark the producing Run `COMPLETED` after patch evidence has already been safely persisted/read-back/hashed;
- post-signoff terminal/no-op reaction: append the controlling validation/provider evidence where applicable, terminalize the Run, and update ExecutionTask/WorkItem according to the reaction matrix, including the atomic `ALREADY_SATISFIED`, `SPEC_INVALID` and `PRECONDITION_FAILED` branches;
- final candidate success: after the final REVIEWER Run has replay-verified its trigger candidate and produced its own current V0-V7 pass set (including REVIEW_PASSED-backed V4), append `CANDIDATE_RECORDED`, terminalize that REVIEWER Run as `COMPLETED / CANDIDATE_DONE`, set the ExecutionTask `CANDIDATE_DONE`, and perform aggregate WorkItem completion when applicable.

Filesystem/Git effects cannot be part of a SQLite transaction. For those: verify precondition -> perform one safe effect -> hash/read back -> persist result. If persistence fails, the next coordinator pass reconciles from repository facts instead of blindly repeating mutation.

## 18. HTTP boundary

The daemon serves SPA and API from the same loopback origin.

Production static files are read only from `new URL("../../dist/", import.meta.url)` in `src/daemon/server.ts`, which resolves to the repository-root Vite `dist/` output under the fixed v1 layout. Startup requires `dist/index.html` to exist as a regular file. Static path resolution must remain inside that root; no current-working-directory fallback, Vite development server, or alternate static root is part of v1.

Browser API calls use relative URLs. The shared browser HTTP helper always calls `fetch(relativeUrl, { ...options, credentials: "same-origin" })` and does not override `mode`; standard fetch `cors` mode is therefore retained. JSON commands set `Content-Type: application/json` and encode the exact command body with ordinary JSON. Browser code never supplies an `Authorization` header.

CLI daemon calls authenticate only with the exact header `Authorization: Bearer <daemon-token>`. The daemon token is never accepted from a URL query parameter, cookie or JSON/form body. This Bearer transport is grounded in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 §12.3](14-external-version-facts.md).

No generic `{data,error}` wrapper exists. Success returns the canonical value directly. JSON API responses use `Content-Type: application/json; charset=utf-8`; raw artifact/evidence-content responses return exact bytes with `Content-Type: application/octet-stream`. ArtifactRef does not own or infer a MIME type. `EvidenceRef.mediaType` is display metadata only and never makes same-origin evidence executable.

Errors use HTTP status plus:

```json
{"code":"STABLE_ERROR_CODE","message":"human-readable explanation"}
```

Queries:

```text
GET /api/health
  -> { "status": "ok", "version": "<order-version>" }

`GET /api/health` is the only unauthenticated `/api` query. It is liveness/version only, returns no project/work/provider state, and exists so local CLI/browser-test readiness can be checked before session bootstrap. Every work-state query below requires a valid browser session when called from the browser. Authenticated CLI commands use the Bearer contract explicitly named for those commands.

GET /api/work-items                              -> WorkItem[]
GET /api/work-items/:workItemId                 -> WorkItem
GET /api/work-item-schemas                       -> WorkItemSchemaCatalogEntry[]
GET /api/projects                                -> ProjectManifest[]
GET /api/work-item-sources/diagnostics           -> WorkItemSourceDiagnostic[]
GET /api/work-items/:workItemId/source           -> WorkItemSourceSnapshot
GET /api/work-items/:workItemId/lifecycle-artifacts -> ArtifactRef[]
GET /api/work-items/:workItemId/artifacts       -> ArtifactRef[]
GET /api/work-items/:workItemId/tasks           -> ExecutionTask[]
GET /api/work-items/:workItemId/signoff-package -> SignoffPackage
GET /api/work-items/:workItemId/runs            -> Run[]
GET /api/runs/:runId/events?afterSequence=<n>   -> RunEvent[]
GET /api/runs/:runId/evidence?path=<EvidencePath> -> raw evidence bytes
GET /api/artifacts/:artifactRefId/content       -> raw file bytes
```

Commands:

```text
POST /api/tick
body {}
-> {
     "result": "NO_WORK" | "STARTED",
     "executionTaskId": "task_<uuid>" | null,
     "runId": "run_<uuid>" | null
   }

`NO_WORK` requires both ids null. `STARTED` requires both ids non-null. One tick starts at most one eligible task; subsequent eligible tasks are started by later ticks.

If any coordinator tick is already active, the command returns HTTP 409 with error code `TICK_ALREADY_ACTIVE`. It does not queue another tick.

POST /api/work-items
body { projectId, schemaId, title, concernIds, derivedFromWorkItemId? }
-> WorkItem

POST /api/work-item-sources/reconcile
body {}
-> WorkItemSourceReconciliation

PUT /api/work-items/:workItemId/source
body { expectedSha256, markdown }
-> ExpectedHashWriteResult

PUT /api/artifacts/:artifactRefId/content
body { expectedSha256, markdown }
-> ExpectedHashWriteResult
```

The old create body `{repositoryRoot,title,origin,concernIds}` is removed; there is no dual compatibility path. `projectId` resolves through the exact configured target-project catalog. Artifact PUT is accepted only for the directly editable lifecycle Markdown roles and state constraints governed by `GW-DOC-MARKDOWN-WORKBENCH-V1`/§31.

```text
POST /api/work-items/:workItemId/runs
body { mode: "INTERACTIVE" | "UNATTENDED" }
-> Run

This command is valid only when the WorkItem is at IDEA, R1, R2, DESIGN, PLAN or R3 and has no other active Run.

When the WorkItem is at IDEA, the command transactionally performs the valid IDEA -> R1 transition and creates an R1 Run. At R1/R2/DESIGN/PLAN/R3 it creates a Run for that exact current stage. It is rejected at AWAITING_SIGNOFF, EXECUTION and COMPLETE and cannot skip a lifecycle stage.

POST /api/runs/:runId/input
body { text, requestEventId: "event_<uuid>" | null }
-> HUMAN_INPUT_RECEIVED RunEvent

POST /api/run-events/:proposalEventId/adopt
body {}
-> ArtifactRef

The daemon loads the persisted `ARTIFACT_PROPOSAL_CREATED` event identified by `proposalEventId` and applies only its stored `baseSha256`/`unifiedDiff`; the request cannot replace proposal content.

POST /api/run-events/:proposalEventId/reject
body {}
-> ARTIFACT_PROPOSAL_DISPOSITIONED RunEvent

POST /api/work-items/:workItemId/resume
body {}
-> WorkItem

Resume is valid only for a currently blocked WorkItem whose blocker has been resolved. For pre-signoff work it changes only `status: BLOCKED -> ACTIVE` and leaves the owning lifecycle stage unchanged. For `EXECUTION / BLOCKED`, it additionally changes the unique blocked task under the still-current Approval from `BLOCKED -> TODO`; it does not create a Run, reuse a workspace or reset prior operational-loss history. The next coordinator tick starts a fresh baseline BUILDER Run. No optimistic-concurrency version token is persisted.

POST /api/work-items/:workItemId/signoff
body { expectedPackageHash, approvedBy }
-> Approval

`GET /api/work-items/:workItemId/signoff-package` is valid only for an ACTIVE WorkItem at `AWAITING_SIGNOFF`. It recomputes current R3 conformance, the complete current resolved material set, exact working-tree/baseline byte identity, signed task validity and the canonical package hash. It returns the baseline/hash/task block that the UI displays; it does not create execution authority.

`approvedBy` is a non-empty human-readable local operator identity confirmed by the user. The UI submits the exact currently displayed `SignoffPackage.packageHash`; the hash is not an editable browser-owned field. If the package changes between display and mutation, sign-off fails and the UI must refetch/review the new package.

POST /api/runs/:runId/cancel
body {}
-> Run

Cancelling a pre-signoff STAGE Run terminalizes that Run without changing the owning lifecycle stage. Cancelling a post-signoff Run interrupts the provider/active process group, marks the Run `CANCELLED`, abandons/retains its workspace as evidence, and atomically sets its ExecutionTask and WorkItem to `BLOCKED`. Human cancellation never triggers automatic retry; explicit resume is required.
```

All mutations enforce current state/preconditions. The thin CLI uses only the health/tick/auth commands explicitly exposed by its v1 command surface; lifecycle mutations remain UI calls to these same HTTP endpoints.

## 19. Browser observation contract

v1 has no browser streaming transport.

The browser reads canonical state through the existing HTTP queries.

While a Run is active, the UI polls exactly these canonical queries through the §19 TanStack Query policy:

```text
GET /api/work-items/:workItemId/runs
GET /api/runs/:runId/events?afterSequence=<last-seen>
```

The browser owns exactly one `QueryClient`:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});
```

The active WorkItem Run-list query and active RunEvent query set `refetchInterval: 1000` while the relevant Run is active and `false` otherwise. No query or mutation relies on TanStack Query's implicit retry/focus/reconnect behavior as workflow behavior. After any successful mutation the UI invalidates/refetches only the affected canonical query keys.

Polling is presentation behavior, not another state mechanism. Missing an interval loses no information because RunEvents are persisted and sequence-ordered.

OpenCode token/progress deltas are not exposed by Order v1.

## 20. Local transport security

v1 binds the Order daemon to loopback only.

The daemon token is exactly one `secureTokenHex()` value from §3 stored at `<order-state>/daemon-token`.

- if the file does not exist, startup creates it without following a symlink, with owner read/write permission only, and writes exactly the 64-character token;
- if the file exists, startup requires a regular non-symlink file, owner-only access and exactly 64 lowercase hexadecimal characters before reusing it;
- inability to prove those file-safety conditions is a startup failure rather than permission weakening or token regeneration.

The CLI uses that exact token only through the Bearer header contract in §18.

On successful one-time connect-token consumption the daemon creates a fresh `secureTokenHex()` browser session id, stores only that id in daemon memory, and sends exactly:

```text
Set-Cookie: pontivus_order_session=<64-lowercase-hex>; Path=/; HttpOnly; SameSite=Strict
```

`Domain`, `Expires`, `Max-Age` and `Secure` are omitted. v1 is deliberately loopback HTTP rather than HTTPS, so a Secure-cookie contract is not invented. The cookie is therefore a host-scoped browser session cookie, while daemon memory remains the actual validity authority; daemon restart invalidates every prior browser session id.

Every browser mutation requires both a currently valid `pontivus_order_session` and an `Origin` header exactly equal to the daemon's own loopback origin. Missing, `null`, or different Origin is rejected. Because the shared browser helper retains default `cors` fetch mode, `Referrer-Policy: no-referrer` does not suppress the real Origin on those mutation requests; this behavior is grounded in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 §12.4](14-external-version-facts.md).

- CORS is not enabled for other origins;
- the OpenCode child server is never exposed to browser code.

## 21. Interruption recovery

v1 has no worker lease subsystem and no retry counter/table.

For post-signoff operational recovery Order derives the action key:

```text
(executionTaskId, role, triggerEventId)
```

`PROVIDER_FAILURE` and `COORDINATOR_INTERRUPTED` consume the same operational-loss budget for that exact key. The first loss permits exactly one automatic replacement Run while the ExecutionTask stays `RUNNING`; the second loss permits no automatic replacement and atomically sets the ExecutionTask and WorkItem to `BLOCKED`. A permitted replacement always has a new Run id, fresh P5-D1 baseline checkout, fresh OpenCode session, and the same role/trigger identity, and is created through the §17 continuation transaction. Automatic operational recovery never changes the task to `TODO`. Operational loss does not consume semantic remediation budget.

At daemon startup:

- every post-signoff Run left `RUNNING` becomes `FAILED / COORDINATOR_INTERRUPTED`;
- its workspace is abandoned and never reused;
- the coordinator evaluates the action-key history; on the first operational loss the ExecutionTask remains `RUNNING` and the same-role/same-trigger replacement is created through the continuation boundary, while a second loss blocks;
- startup's immediate coordinator tick performs the permitted continuation before another eligible task is considered;
- a mutating Run that had already atomically persisted `CANDIDATE_STATE_RECORDED` and terminal Run completion is not treated as interrupted; recovery proceeds from the durable candidate event;
- if a mutating Run durably wrote/read-back/hash-verified its fixed `candidate/patch.diff` evidence but interruption occurred before the candidate publication transaction, startup may reconcile that orphan evidence only when the retained Run workspace regenerates byte-identical candidate patch bytes and the same canonical changed-path set; it then persists the missing `CANDIDATE_STATE_RECORDED` and Run completion instead of charging an operational loss or re-invoking the provider.

For pre-signoff interactive Runs, `WAITING_FOR_INPUT` survives restart unchanged. A pre-signoff Run left `RUNNING` becomes `FAILED / COORDINATOR_INTERRUPTED`; the WorkItem remains at its owning stage and may start a fresh STAGE Run.

Explicit human resume from an execution block does not erase historical losses and does not create an unlimited automatic retry loop.

Post-signoff validation routing is deterministic:

- `ALREADY_SATISFIED` at V1 is accepted only when the BUILDER explicitly emits `TASK_ALREADY_SATISFIED` after inspecting the fresh baseline and the coordinator independently proves the workspace changed-path set is empty. That result atomically terminalizes the current BUILDER Run as `COMPLETED / ALREADY_SATISFIED`, sets the ExecutionTask `ALREADY_SATISFIED`, and performs aggregate WorkItem completion if all tasks are now successful terminals. Zero diff without the explicit semantic result is provider-output failure, not successful no-op;
- `SPEC_INVALID` is not worker-repairable: it invalidates current execution authority and returns the WorkItem to `PLAN / ACTIVE` with remaining tasks under the old Approval blocked historical;
- `PRECONDITION_FAILED` blocks the current ExecutionTask and WorkItem without automatic retry; explicit resume is allowed only after the external/precondition blocker is resolved under the existing Approval;
- one repairable `TEST_FAILURE`, `REVIEW_FAILURE` or `CHANGE_BLOAT` may create one REMEDIATOR Run for that failure class; recurrence after that repair blocks;
- `ENVIRONMENT_BLOCKED` blocks without consuming semantic repair budget;
- `SCOPE_BREACH` invalidates current execution authority and returns the WorkItem to `PLAN / ACTIVE`;
- `GOVERNANCE_BREACH` has no blind v1 repair and returns the WorkItem to `DESIGN / ACTIVE`;
- `BLOCKED_FOR_REANALYSIS` returns to the REVIEW_FAILED `returnTo` stage (`R1 | R2 | DESIGN | PLAN`);
- `APPROVAL_STALE` returns to the earliest owner of changed material: R1 artifact -> R1; R2 or P2/P3 material -> R2; P1 product/requirements material -> R2; DESIGN or P4-P6 material -> DESIGN; PLAN/P7 or verification material -> PLAN; R3 artifact -> R3; project manifest -> R1. Multiple changed sources choose the earliest lifecycle owner.

On any upstream return, remaining tasks under the old Approval become `BLOCKED` historical records and that Approval is never reused. Fresh execution authority requires normal lifecycle progression, fresh R3 and a new explicit sign-off.

## 22. Productive configuration and filesystem-access contract

Operator-owned productive configuration is one canonical strict value:

```ts
type OpenCodeModelRef = Readonly<{
  providerID: string;
  id: string;
}>;

type OrderConfig = Readonly<{
  version: 4;
  model: OpenCodeModelRef | null;
  repositoryRoots: readonly AbsoluteDirectoryPath[];
  referenceRoots: readonly AbsoluteDirectoryPath[];
}>;
```

The canonical Zod schemas for these concepts live in `src/core/contracts.ts`; no CLI/installer/daemon copy or DTO shape exists.

The productive config is UTF-8 JSON at `<order-state>/config.json`. It is written only through the canonical configuration effect owner using owner-only atomic replacement. The installer/CLI guided setup and the authenticated Settings mutation boundary both call that same owner; neither owns a second config shape or writer. Missing or invalid config is a startup/setup failure, never an environment/default fallback.

Config v4 invariants:

- when `model` is non-null, `providerID` and `id` are non-empty and contain no NUL;
- `model === null` is the sole canonical unconfigured-model state;
- `repositoryRoots` is a unique list of absolute canonical path identities that were proven as exact Git top-level realpaths when connected, and may be empty as a non-productive configuration state;
- live filesystem/Git/project-manifest validity is a readiness concern, not config-file parse validity, so a formerly valid configured root may remain represented while unavailable/drifted and can be repaired or disconnected through Settings;
- every currently READY target has a valid root `pontivus-order.toml` and READY targets have unique `ProjectManifest.projectId` values;
- a WorkItem repository must equal one configured target repository exactly; descendant containment is not a WorkItem-selection rule;
- `referenceRoots` remains a unique list of stored canonical path identities with STAGE-only read semantics; live availability is validated by readiness before productive use;
- every configured target repository and reference root is pairwise path-disjoint after canonical resolution, so STAGE external-reference permission cannot re-enter a target repository outside its admitted provider workspace;
- WorkItem source/document location is resolved inside each selected repository through §32, never through OrderConfig.

Config v4 is the current daemon/ordinary CLI contract. Config v3 is accepted only by the bounded v3→v4 configuration migration in §35.11; config v2 remains accepted only by the installer-owned v2→v3 document migration followed immediately by v3→v4 conversion. Fresh setup may write a valid but non-productive v4 configuration with `model = null` and/or no target repositories so the authenticated browser can open Settings and complete configuration. Broad parent roots are never recursively crawled or guessed into a project catalog.

For each STAGE OpenCode session, reference-root permissions retain the existing deny-first exact `external_directory` semantics. Target repositories and the WorkItem root do not become generic external-reference permissions.

There is at most one configured model. `model = null` means configuration is incomplete; productive OpenCode-backed work is blocked until Settings or guided setup selects and preflights one model. Dynamic/per-stage model routing remains outside this release.

Host-edge environment remains deliberately narrow:

- `PONTIVUS_ORDER_BIND`: default `127.0.0.1:7347`; non-loopback values are rejected;
- `PONTIVUS_ORDER_STATE_ROOT`: source/development/install-time state-root selection;
- `PONTIVUS_ORDER_OPENCODE_BIN`: source/development launcher override; productive installation fixes the exact private binary.

OpenCode receives the existing explicit environment/private provider namespace. Provider secrets remain OpenCode-owned and are not fields of `OrderConfig`.

## 23. Daemon scheduler contract

The periodic coordinator scheduler is internal to `orderd` and uses one standard `setTimeout`; there is no scheduler package or second scheduling abstraction.

v1 has one fixed schedule:

- one tick immediately after startup recovery/preflight succeeds;
- after that tick settles, arm one `setTimeout` for exactly 3600 seconds;
- after every timer-originated tick settles, arm the next 3600-second `setTimeout`;
- at most one coordinator tick and one future timer are active at a time;
- each coordinator pass reconciles an existing `RUNNING` ExecutionTask first: if its durable state requires a continuation Run and no Run is active, create that continuation under §17 before selecting any `TODO` task;
- a timer callback never queues a second timer-originated tick while a coordinator tick is active; the next timer is armed only after the active tick settles;
- manual `POST /api/tick`/CLI tick is rejected with a stable conflict response while a tick is already active;
- timer firing itself never creates an OpenCode Run; only an eligible task atomically moved from `TODO` to `RUNNING` may do so.

Scheduler state is not another durable domain concept. Durable execution/task/Run state remains sufficient to recover after daemon restart.

The productive user-level systemd unit defined by P4 supervises the daemon process only. It does not own or duplicate this scheduler. Order makes no guarantee of periodic execution while the supervised `orderd` process is not running.

## 24. Browser/CLI session bootstrap

The daemon token file is the CLI trust root.

`order open`:

1. reads and validates the owner-only daemon token from §20;
2. calls an authenticated daemon command to mint a fresh `secureTokenHex()` one-time connect token valid for 60 seconds;
3. writes exactly one authenticated URL, `http://<PONTIVUS_ORDER_BIND>/connect?token=<one-time-token>`, to stdout;
4. the user opens that URL in the browser;
5. the daemon consumes the token once, creates the fresh §20 browser session id/cookie, and returns a `303` response with `Location: /`.

Core v1 does not shell out to `open`, `xdg-open`, `start`, or a browser-opener npm package. Automatic system-browser launching is outside the v1 correctness path and may be added only through a separately grounded packaging/integration decision.

The connect response uses `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.

The one-time token exists in daemon memory only, is never persisted, is accepted exactly once before its 60-second expiry, and is then removed whether consumed successfully or expired.

A browser without an authenticated local session may load only the connect/help surface, not project/work state.

Additional command:

```text
POST /api/auth/connect-token
Authorization: Bearer <daemon-token>
body {}
-> { "token": "<64-lowercase-hex>", "expiresAt": "<IsoDateTime>" }
```

This response is an authentication command result, not a domain semantic type.

## 25. Provider semantic output

The productive OpenCode prompt requires the completed assistant message to contain only a JSON array of canonical provider-emittable `RunEventPayload` values. Order parses JSON, validates the canonical Zod union, then applies pure role/event admission policy before any event is persisted.

Provider-emittable tags by Run role are:

| Run role | Allowed provider tags |
|---|---|
| `STAGE` | `AGENT_MESSAGE_FINAL`, `HUMAN_INPUT_REQUESTED`, `ARTIFACT_PROPOSAL_CREATED`, `STAGE_COMPLETED`, `STAGE_BLOCKED`, `OBSERVATION_RECORDED` |
| `BUILDER` | `AGENT_MESSAGE_FINAL`, `TASK_ALREADY_SATISFIED`, `STAGE_BLOCKED` with `owningStage = EXECUTION`, `OBSERVATION_RECORDED` |
| `REMEDIATOR` | `AGENT_MESSAGE_FINAL`, `STAGE_BLOCKED` with `owningStage = EXECUTION`, `OBSERVATION_RECORDED` |
| `REVIEWER` | `REVIEW_PASSED`, `REVIEW_FAILED`, `OBSERVATION_RECORDED` |

All other RunEvent tags are coordinator/human-owned, including `STAGE_STARTED`, `HUMAN_INPUT_RECEIVED`, proposal disposition, conformance, `PRODUCTIVE_INVOCATION_FAILED`, provider failure, gates, authority/repository drift, `VALIDATION_*` and `CANDIDATE_*`. A valid-shaped but role-forbidden provider event is invalid provider output.

One deny-all/tool-disabled format-repair turn may re-encode only an event that would have been allowed for the original Run role. A second invalid result is `PROVIDER_FAILED / OUTPUT`.

Order does not depend on legacy structured-output APIs.

## 26. OpenCode V2 state and reconciliation

Order owns:

```text
<order-state>/opencode/
├── home/
├── config/
├── data/
├── state/
├── cache/
└── opencode.db
```

The provider child receives the private HOME/XDG roots, dedicated `OPENCODE_DB`, `OPENCODE_DISABLE_PROJECT_CONFIG=1`, `OPENCODE_DISABLE_CLAUDE_CODE=1`, `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1`, `OPENCODE_DISABLE_AUTOUPDATE=1` and the Order-owned auth secret. `/etc/opencode` must be absent. The OpenCode build bound by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` always includes its embedded Web UI in foreground `serve` and exposes no UI-only disable switch; Order therefore keeps the provider on its private random loopback listener and never exposes, forwards, links or consumes that UI. `OPENCODE_PURE=1`/`OPENCODE_DISABLE_EXTERNAL_SKILLS=1` are defense in depth only unless certified.

The exact v1 OpenCode server/client pins are owned by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`. Order starts exactly `opencode serve --hostname 127.0.0.1 --port 0`, parses only the pinned loopback startup endpoint, and requires authenticated `GET /api/info` (`client.server.info()`) to report the exact version within 60 seconds. Plain foreground serve is retained; `--service` is not used.

Before productive use, Order also proves the repository `AGENTS.md` set is already resolved material P1 authority as required by [GW-DOC-OPENCODE-INTEGRATION-V1 §3](07-opencode-integration-standard.md).

For every new/replacement session Order creates the session at the exact Run workspace, switches to `OrderConfig.model`, reads model state back, installs the exact §22/§7 permission profile and only then updates `providerSessionId`.

Only one productive prompt is admitted at a time per session. The triggering Order RunEvent is persisted before prompt admission. The OpenCode prompt id remains the deterministic shell projection:

```text
openCodePromptId =
  "msg_" +
  sha256Hex(
    canonicalJson({
      contextHash,
      runEventId: triggeringRunEvent.id,
      runId
    })
  )
```

Admission for the OpenCode build bound by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` remains idempotent for the same Session/input id. Order never creates a second id for the same productive turn.

Before admission Order records the current `session.get().time.idle`, calls `session.prompt`, waits for strict idle advancement, reads the resulting `succeeded | failed | interrupted` outcome, and only on `succeeded` retrieves the final assistant result through `session.context`. Outcome without the idle advancement and `session.active` are not terminal authority. Event streaming and experimental `session.wait` remain non-authoritative.

Every productive turn has a 3600-second wall-clock bound. At expiry Order interrupts the session; inability to prove terminal success through the normal projection becomes `PROVIDER_FAILURE`.

Provider loss on post-signoff Runs follows §21's action-key budget. Read-only pre-signoff stage uncertainty may replace the session from canonical context. Mutating candidate state is never reconstructed from provider conversation/session state.

Credentials remain OpenCode-owned. Guided `order setup` uses the same private provider environment/database. When existing config plus private credentials cannot prove the configured model available, setup executes `opencode --standalone auth login` without a provider argument so the pinned OpenCode CLI owns provider/method selection. Order then starts its normal pinned private foreground OpenCode server in setup mode without requiring a preselected model, calls V2 `client.model.list` for the setup location, filters to entries with `enabled === true`, presents their exact `providerID/id` identities, and requires the operator to choose one before writing `OrderConfig`. The ordinary productive server path still requires the selected model and rejects it unless the same V2 catalog reports that exact entry enabled.

`order provider login <provider>` remains an explicit maintenance command and executes exactly `opencode --standalone auth login <provider>` in the same namespace. Because authentication in the OpenCode build bound by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` calls `requireInteractive()` for key/form/code flows, setup/login inherit stdin/stdout/stderr from the current TTY and are not bounded-output semantic processes. Login text and secrets are never parsed or persisted by Order; the V2 model catalog is used only to select/verify the exact model identity written to canonical config.

## 27. UI state rule

TanStack Query owns daemon/server state in the UI.

Presentation-local state uses ordinary React component state, URL/search parameters, or refs.

v1 has no global client-state store.

Client state must not own WorkItem lifecycle, Approval, ExecutionTask state, Run status, canonical artifacts, proposal disposition or verification result.

## 28. UI composition boundary

P6 does not prescribe a feature-directory hierarchy. Order-specific UI composition may remain directly under `ui/src/` and is split only when the present semantic responsibility or independently testable boundary requires it under [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §7](12-technical-architecture.md).

Reusable Order-local primitives live in `ui/src/primitives/` only when they own a present reusable UI responsibility. They must remain project-neutral, vendor-clean, and free of deprecated Radix/Tremor imports or higher-level Order domain semantics.

## 29. External integration certification

Before `orderd` becomes ready it validates the deterministic local portion of this certification against [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md): the exact Bun pin from `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`, SQLite §15 capabilities and actual engine version, Git binary/version/required commands, exact OpenCode server/client version/readiness through authenticated server info, and configured provider/model availability.

CI/integration tests additionally prove:

- **State-root/XDG + daemon-token boundary:** an absolute `PONTIVUS_ORDER_STATE_ROOT` wins; relative `PONTIVUS_ORDER_STATE_ROOT` is rejected; absent override uses an absolute `XDG_STATE_HOME/pontivus-order`; absent XDG uses absolute `HOME/.local/state/pontivus-order`; relative XDG/HOME values are rejected rather than resolved against cwd; no usable absolute base fails startup. A missing daemon-token file is created as a non-symlink owner-only file containing exactly one 64-lowercase-hex `secureTokenHex()`; an existing unsafe, symlinked, incorrectly permissioned or malformed token file fails startup rather than being accepted or silently replaced.
- **OpenCode:** exact `opencode serve --hostname 127.0.0.1 --port 0` foreground bootstrap; bounded parsing of the loopback startup endpoint; 60-second authenticated exact-version readiness against `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`; private HOME/XDG/DB; failure when `/etc/opencode` exists; pinned project/Claude discovery-disable flags; admitted provider-workspace/instruction closure under `GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1`; deny-first role permissions including `.git` and `.git/*` read denial plus exact literal edit paths; multi-resource patch authorization; exact deterministic `msg_` prompt-id derivation; same-session/same-type same-id admission does not create a second user input; strictly advanced `time.idle` plus `succeeded | failed | interrupted`; successful final context retrieval; 3600-second productive-turn bound/interrupt; no `session.active`, experimental wait or event-stream correctness dependency.
- **Bun/Linux runtime boundary:** startup rejects any `process.platform` other than `"linux"`; the installed Bun and `@types/bun` exactly match `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`; `Bun.serve` binds only the configured loopback address with `development: false`; `Bun.TOML.parse` parses a UTF-8 manifest string that is then rejected on canonical-schema failure; `Bun.Glob` uses exactly the §14 options; UUID generation matches the canonical prefixed UUIDv4 grammar; the secure-token helper returns exactly 64 lowercase hexadecimal characters from a 32-byte `crypto.getRandomValues` call and no secret/token path uses `Math.random`; `Bun.CryptoHasher("sha256")` matches known SHA-256 vectors while `Bun.hash` is absent from canonical identity code; `statfsSync(stateRoot).type` accepts only the four §15 Linux filesystem magic values and the SQLite smoke test also passes; the one-shot/re-armed timer tests prove one immediate startup tick, exactly 3600 seconds between re-arms and no overlapping coordinator ticks.
- **Process cancellation boundary:** every spawned external command receives explicit argv/cwd/allowlisted env and is started with `detached: true`; unattended/correctness-bearing commands use bounded captured output, while the sole operator-facing provider-login path inherits the TTY and produces no parsed semantic evidence; Order does not pass Bun `timeout`/AbortSignal as cancellation authority. The integration fixture starts a child that itself starts a long-lived descendant, then proves both timeout and explicit cancellation follow the same Linux group path: `process.kill(-pgid, "SIGTERM")`, at most 5 seconds of bounded wait, signal-`0` existence check, `process.kill(-pgid, "SIGKILL")` if still present, child settlement, and final group nonexistence before the operation settles.
- **Git:** registered root equals `git rev-parse --show-toplevel`; every execution Run uses `git clone --no-local --no-checkout -- <source> <workspace>`, exact baseline verification/detached checkout/clean start, with Git system/global config and prompting disabled; candidate capture proves NUL-delimited no-rename changed paths including untracked files, temporary-index `--intent-to-add` inclusion of new files, binary/full-index/no-renames patch hashing, replay into a separate fresh checkout, and exact regenerated patch-hash/changed-path equality; gitlinks/submodules are not traversed automatically.
- **Artifact/evidence safety:** committed material hashes come from Git blob bytes at the approved commit; proposal/adoption accepts regular files only and rejects canonical targets outside repository root; evidence writes/readback reject escape/symlink/non-regular targets and evidence HTTP retrieval requires an exact persisted `(runId, EvidencePath)` reference plus current SHA-256 equality.
- **Package/lockfile boundary:** `package.json` contains exactly the direct runtime and dev dependency groups in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 §2](14-external-version-facts.md), every version string is exact with no range/tag, `.bun-version` and `.node-version` exactly match `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`, committed `bun.lock` is present, and `bun ci` succeeds without changing either manifest or lockfile. The direct-dependency set contains none of the excluded convenience packages in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 §8](14-external-version-facts.md), including router, jsdom/happy-dom, React Testing Library and Vitest-browser packages; transitive declaration/runtime helpers such as `@types/node`, `undici-types`, `playwright` and `playwright-core` are accepted only as lockfile-owned transitives of the declared direct dependencies.
- **TypeScript/build behavior:** the `tsc` build bound by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` is the type-check authority and no compiler API is imported; the effective compiler options exactly match [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2](12-technical-architecture.md): `target: "ESNext"`, `lib: ["ESNext","DOM","DOM.Iterable"]`, `module: "Preserve"`, `moduleResolution: "bundler"`, `moduleDetection: "force"`, `jsx: "react-jsx"`, `allowImportingTsExtensions: true`, `verbatimModuleSyntax: true`, `isolatedModules: true`, `strict: true`, `noEmit: true`, `types: ["bun"]`; `node node_modules/vite/bin/vite.js build` succeeds without `@vitejs/plugin-react`; the production bundle mounts with `react-dom/client.createRoot`; Vite config contains the required `tailwindcss()` plugin and application CSS contains exactly one `@import "tailwindcss";`; `node node_modules/vitest/vitest.mjs run` succeeds with Vitest `environment: "node"` and no per-file jsdom/happy-dom/browser-environment override.
- **Playwright/browser protocol behavior:** CI runs `node node_modules/@playwright/test/cli.js install chromium` and then `node node_modules/@playwright/test/cli.js test` under the Node pin in `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`, using the Playwright-owned Chromium build bound by that same snapshot rather than assuming package installation supplied a browser; the suite proves fresh 64-lowercase-hex one-time connect tokens, single consumption, expiry rejection after 60 seconds, `303 Location: /`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, exact `pontivus_order_session=<64hex>; Path=/; HttpOnly; SameSite=Strict` attributes with no Domain/Expires/Max-Age/Secure, explicit browser `credentials: "same-origin"` with default cors mode, same-origin mutations carrying the exact real `Origin`, rejection of missing/null/wrong Origin, unauthenticated work-state rejection while the liveness-only `/api/health` remains public, Run/RunEvent polling/catch-up and absence of any required browser WebSocket/SSE transport. Firefox/WebKit are not certified v1 targets.
- **Serialization/time behavior:** table-driven tests prove the exact §3 24-character `IsoDateTime` parser/generator rejects offsets, extended years, variable fractions and invalid dates; canonical-JSON tests prove recursive key sorting, array-order preservation, exact primitive escaping, and rejection of unsupported/non-finite/cyclic values; UTF-8 fixtures prove `TextEncoder` bytes are passed to the byte-only SHA-256 helper for non-ASCII text; fixed fixtures make package/task/context hashes byte-for-byte deterministic.
- **Browser state/schema behavior:** one QueryClient has exactly the §19 defaults; active Run/RunEvent polling is exactly 1000 ms and stops when inactive; successful mutations invalidate/refetch only affected keys; component-local presentation state remains React-local; URL/search state uses only native URL/URLSearchParams/History APIs and no router/global-state package is present. All HTTP/persistence/provider/config ingress that maps to canonical semantics rejects unknown object keys and proceeds only with the owning strict Zod schema's parsed value.
- **Local UI boundary:** repository-local primitives use only authorized public dependencies and pass project-neutral/vendor-clean plus Radix/Tremor forbidden-import checks; no private-source provenance is required at runtime or certification.
- **Workbench foundation behavior:** browser certification proves the [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §2 workbench foundation contract](12-technical-architecture.md) on the real SPA: the root is dense-scoped; queue pointer and keyboard activation select/open the inspector; row-local actions do not also select/open; closing the inspector removes only presentation-local selection/rail state; the queue/inspector split is not nested inside a `Panel`; the rendered control/action surfaces use the single governed local class contracts with accessible disabled/error/focus semantics; and the active action region does not expose multiple competing primary actions.
- **Source/config v2 boundary:** fresh-install config contains only exact validated target repositories plus the separate WorkItem root; duplicate project ids fail; broad parent target roots are not crawled; WorkItem root canonical realpath is disjoint from target repositories, reference roots and state root; v1 config does not start productively until explicit v2 reconfiguration succeeds.
- **Portable-source boundary:** exact source grammar/front-matter rejection, schemaId -> kind single mapping, template render/parse round-trip, duplicate-id diagnostics, moved-unchanged identity preservation, exact R1 source projection and productive-boundary targeted revalidation are proven without a second parser or source reader.
- **Guarded Markdown writes:** the single shared writer proves expected-hash mismatch is non-mutating; two Order writes using the same old hash cannot both succeed; temp creation is same-directory/exclusive/non-discoverable for WorkItem scanning; file fsync -> rename -> parent-directory fsync -> exact read-back/hash is exercised on the pinned Linux/Node runtime; R3/arbitrary repository/candidate/runtime writes are rejected.
- **Source-backed approval/schema:** sign-off binds a required non-null source SHA-256; V0/V1 reject changed/missing/invalid/duplicate/ambiguous source state before productive execution; fresh SQLite v2 creation includes the source projection and source-bound approval columns, and unsupported legacy schema versions fail before mutation.
- **Markdown workbench browser contract:** controlled project/kind/concern creation, source diagnostics/refresh, lifecycle document navigation, Save/Cancel/dirty/conflict behavior, no silent stale-buffer rebase, owning-stage return after save, R3 read-only behavior, source-bound sign-off invalidation, non-delivery terminal presentation and absence of code/config/candidate editing are proven in the real SPA.

Startup/CI evidence records the actual OpenCode, Bun, Node, TypeScript, Git and SQLite versions it observed. Package/lockfile certification records the exact frontend/library versions. The authoritative dated facts and provenance are in [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md).

An external upgrade invalidating any certification item is P4/P6 material.

## 30. Implementation contract

A P7 implementation plan may decompose these contracts into repository changes, but it may not alter the semantic field names/types/invariants, HTTP mutation/query semantics, current SQLite schema-v3 contract, source/approval binding, code-layout dependency direction, local-only host boundary, no-OOP/no-DTO rule or technology families and external integration contracts locked in [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md).

Any required change to those items returns to DESIGN/P6.


## 31. Historical source-backed WorkItem v2 contracts

This section is retained only as the immediately preceding source-backed contract used by the bounded v2→v3 migration. Productive behavior is governed by §32. No productive code may choose between §31 and §32 at runtime. No transport/persistence/UI DTO family is introduced.

#### Exact WorkItem source grammar (P6)

#### Source path

`WorkItemSourcePath` is a normalized POSIX path relative to `workItemRoot`. It is a distinct scalar because it resolves against a different root.

The canonical schema accepts only a non-empty relative path that does not start with `/` or `./`, does not end with `/`, contains no backslash or NUL, contains no empty/`.`/`..` path segment, and ends in `.md`:

```ts
const WorkItemSourcePathSchema = z.string().refine(isWorkItemSourcePath, "invalid WorkItemSourcePath");
```

`isWorkItemSourcePath` is one core helper implementing exactly those rules; call sites do not reinterpret path syntax independently.

#### Front matter

The file is UTF-8 text without a byte-order mark. v1 source grammar requires LF line endings; CRLF/mixed-line-ending source is invalid rather than normalized silently. Order-generated files use LF.

The first line is exactly:

```text
---
```

The metadata is one strict JSON object terminated by the next standalone `---` line.

Example:

```markdown
---
{
  "formatVersion": 1,
  "id": "work_550e8400-e29b-41d4-a716-446655440000",
  "projectId": "example-service",
  "concernIds": ["workflow"],
  "schemaId": "defect-v1"
}
---
# Agreement structure regression

## Observed behavior

...
```

The metadata contract is:

```ts
const WorkItemSourceMetadataSchema = z.strictObject({
  formatVersion: z.literal(1),
  id: WorkItemIdSchema,
  projectId: ProjectIdSchema,
  concernIds: z.array(ConcernIdSchema)
    .refine(unique, "duplicate concernIds")
    .refine((values) => values.every((value, index) => index === 0 || values[index - 1]! < value), "concernIds must be sorted")
    .readonly(),
  schemaId: WorkItemSchemaIdSchema,
  derivedFromWorkItemId: WorkItemIdSchema.optional(),
});
```

`derivedFromWorkItemId` is omitted for ordinary intake. It is used only when a completed investigation/audit creates a separately governed remediation WorkItem as required by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`.

`formatVersion` versions only the portable front-matter grammar; `schemaId` pins the WorkItem workflow/template semantics. The two version concepts are deliberately named separately.

`kind` is not metadata; it is derived from `schemaId` through the canonical catalog.

Unknown metadata keys are rejected. `concernIds` are unique and lexicographically sorted in canonical source metadata; Order-generated sources always emit that order rather than creating byte churn from equivalent permutations.

#### Title/body

After front matter, the first non-empty body line must be exactly one level-1 Markdown heading beginning `# ` with non-empty text. That heading is the canonical human-readable WorkItem title.

The remainder is ordinary Markdown narrative governed by the pinned schema/template.

The source parser does not infer semantic section meaning from arbitrary heading text. Required template sections are validated only by the schema's exact structural rules, not by fuzzy keyword/title interpretation.

#### Source snapshot

One canonical semantic type represents a current validated source snapshot:

```ts
const WorkItemSourceSnapshotSchema = z.strictObject({
  path: WorkItemSourcePathSchema,
  sha256: Sha256Schema,
  metadata: WorkItemSourceMetadataSchema,
  markdown: z.string(),
});
```

`markdown` is the exact decoded UTF-8 source text whose bytes produced `sha256`.

No separate browser/persistence/source DTO variants exist.

Hash-guarded Markdown writes use one minimal canonical command result rather than transport-specific error parsing:

```ts
const ExpectedHashWriteResultSchema = z.discriminatedUnion("tag", [
  z.strictObject({ tag: z.literal("UPDATED"), sha256: Sha256Schema }),
  z.strictObject({ tag: z.literal("STALE"), currentSha256: Sha256Schema }),
]);
```

`STALE` is a non-mutating outcome. Invalid Markdown/metadata/role/state remains an ordinary invalid command and uses the existing HTTP error boundary; the browser never identifies a stale write by parsing an error-message string.

The shared scalar/command contracts are also canonical P6 types rather than repeated handler shapes:

```ts
const WorkItemTitleSchema = z.string()
  .min(1)
  .refine((value) => value === value.trim(), "title must not have outer whitespace")
  .refine((value) => !value.includes("\0"), "title must not contain NUL")
  .refine((value) => !value.includes("\n") && !value.includes("\r"), "title must be one line");

const MarkdownTextSchema = z.string()
  .refine((value) => !value.includes("\0"), "Markdown must not contain NUL")
  .refine((value) => !value.startsWith("\uFEFF"), "Markdown must not contain a BOM")
  .refine((value) => !value.includes("\r"), "Markdown must use LF line endings");

const ExpectedHashMarkdownWriteSchema = z.strictObject({
  expectedSha256: Sha256Schema,
  markdown: MarkdownTextSchema,
});

const CreateWorkItemSourceSchema = z.strictObject({
  projectId: ProjectIdSchema,
  schemaId: WorkItemSchemaIdSchema,
  title: WorkItemTitleSchema,
  concernIds: z.array(ConcernIdSchema).refine(unique, "duplicate concernIds").readonly(),
  derivedFromWorkItemId: WorkItemIdSchema.nullable().optional(),
});
```

HTTP handlers parse these exact canonical command values rather than reconstructing equivalent local request shapes. `derivedFromWorkItemId` is normalized to omission by the owning creation function before rendering source metadata, whose portable grammar omits the key when no parent exists.

#### WorkItem canonical projection (P6)

The runtime `WorkItem` remains the lifecycle aggregate projection, but its originating/classification fields become source-backed.

The v2 canonical shape is:

```ts
type WorkItem = Readonly<{
  id: WorkItemId;
  projectId: ProjectId;
  repositoryRoot: string;
  title: string;
  origin: string;
  schemaId: WorkItemSchemaId;
  sourcePath: WorkItemSourcePath;
  sourceSha256: Sha256;
  derivedFromWorkItemId: WorkItemId | null;
  stage: WorkStage;
  status: WorkStatus;
  outcome: WorkOutcome | null;
  concernIds: readonly ConcernId[];
  createdAt: IsoDateTime;
}>;
```

Rules:

- `id`, `projectId`, `title`, `schemaId`, `sourcePath`, `sourceSha256`, `derivedFromWorkItemId` and `concernIds` are a durable projection of the currently reconciled source, not independent authority;
- `repositoryRoot` is the current installation's resolved repository for `projectId` and is not written to Markdown;
- `origin` is non-authoritative system provenance. It is never operator input in v2 and is never used as originating intent. New browser-created rows use the exact system value `CREATED`; first registration of an externally authored source uses `DISCOVERED`;
- a projection mismatch is an invalid/stale source condition, never silently repaired by trusting SQLite over Markdown;
- `kind = workItemKindForSchema(schemaId)` whenever policy needs kind.

#### WorkItem schema catalog contract (P6)

```ts
const WorkItemKindSchema = z.enum([
  "CHANGE",
  "DEFECT",
  "INVESTIGATION",
  "AUDIT",
]);

const WorkItemSchemaIdSchema = z.enum([
  "change-v1",
  "defect-v1",
  "investigation-v1",
  "audit-v1",
]);

const WorkItemSchemaCatalogEntrySchema = z.strictObject({
  schemaId: WorkItemSchemaIdSchema,
  kind: WorkItemKindSchema,
});
```

The built-in catalog is immutable v1 product data in `src/core/work-item-source.ts` and is the only schemaId -> kind mapping.

The authoring templates are owned in the same module as immutable Markdown strings keyed by schema id. They reference the owning lifecycle/functional document identifiers and do not copy the complete normative lifecycle rules.

A published schema id pins its template and structural validation semantics. A later release must not change what an existing `*-v1` source means or make a previously valid source invalid by changing that schema's required structure. A materially changed template/validation contract requires a new schema id; the existing id remains resolvable for previously authored WorkItems.

The same core owner resolves the complete v1 authoring/stage-template policy; call sites do not maintain kind-specific switches. The minimum template set is:

| Schema | Intake template | R1 template | Later stage templates | Allowed successful R1 completion |
|---|---|---|---|---|
| `change-v1` | `change-intake-v1` | `change-r1-v1` | `delivery-r2-v1`, `delivery-design-v1`, `delivery-plan-v1`, `delivery-r3-v1` | `CONFIRMED`, `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED` |
| `defect-v1` | `defect-intake-v1` | `defect-r1-v1` | `delivery-r2-v1`, `delivery-design-v1`, `delivery-plan-v1`, `delivery-r3-v1` | `CONFIRMED`, `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED` |
| `investigation-v1` | `investigation-intake-v1` | `investigation-r1-v1` | none | `INVESTIGATION_COMPLETE`, `DUPLICATE`, `ALREADY_SATISFIED` |
| `audit-v1` | `audit-intake-v1` | `audit-r1-v1` | none | `AUDIT_COMPLETE`, `DUPLICATE`, `ALREADY_SATISFIED` |

The v1 template structures are intentionally small and reference the existing lifecycle/specification owners rather than copying their rules:

- `change-intake-v1`: Requested outcome; Current context; Constraints/non-goals; Evidence/references.
- `defect-intake-v1`: Observed behavior; Expected behavior; Reproduction/evidence; Behavior that must remain unchanged; Impact/context.
- `investigation-intake-v1`: Question; Why it matters; Known evidence/context; Investigation boundary.
- `audit-intake-v1`: Target under audit; Governing authority/criteria; Scope/exclusions; Requested evidence/verdict.
- `change-r1-v1`: Current state/absence; Evidence; Governing authority; Affected producer→consumer path; Downstream invariants; Unresolved facts; Verdict.
- `defect-r1-v1`: Observed symptom/reproduction; Proven root cause; Producer→carrier→consumer path; Downstream effects/invariants; Governing authority; Unresolved facts; Verdict.
- `investigation-r1-v1`: Question; Evidence for/against; Findings; Unresolved questions; Conclusion.
- `audit-r1-v1`: Target/criteria; Evidence by criterion; Findings; Verdict.
- `delivery-r2-v1`: Required observable outcome; Acceptance criteria; Scope/exclusions; Failure/negative behavior; Material compatibility/security/performance constraints.
- `delivery-design-v1`: Context/governing constraints; Goals/non-goals; Canonical owner/affected boundaries; Data/control flow; Decisions/rationale/alternatives; Failure behavior; Preservation/downstream invariants; Validation obligations.
- `delivery-plan-v1`: Exact task units/dependencies; requirement/design traceability; expected change surface; deletions/additions/modifications; validation sequence; canonical `order-tasks` block.
- `delivery-r3-v1`: Readiness verdict; evidence; adversarial findings; exact defective layer/return stage when not ready.

Artifact prerequisites are **not** copied into a second schema DAG. The schema selects the permitted stage/template set; prerequisite order and stage ownership remain resolved from `GW-DOC-WORK-LIFECYCLE-V1` / `GW-DOC-LIFECYCLE-CONTEXT-V1`. This is the local DRY consequence that must also be reflected when amending `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`.

#### Source diagnostics/reconciliation contracts (P6)

Invalid files must be visible even when no WorkItem can be materialized.

```ts
const WorkItemSourceDiagnosticCodeSchema = z.enum([
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

const WorkItemSourceDiagnosticSchema = z.strictObject({
  path: WorkItemSourcePathSchema.nullable(),
  workItemId: WorkItemIdSchema.nullable(),
  code: WorkItemSourceDiagnosticCodeSchema,
  detail: z.string().min(1),
});

const WorkItemSourceReconciliationSchema = z.strictObject({
  registered: z.array(WorkItemIdSchema).readonly(),
  updated: z.array(WorkItemIdSchema).readonly(),
  moved: z.array(WorkItemIdSchema).readonly(),
  unchanged: z.array(WorkItemIdSchema).readonly(),
  diagnostics: z.array(WorkItemSourceDiagnosticSchema).readonly(),
});
```

These are canonical typed results of the source boundary, not UI-specific DTOs. Diagnostics are derived from the current queue; Order does not introduce a diagnostics table, append-only log or daemon cache as another state owner. `GET /api/work-item-sources/diagnostics` performs the same canonical read-only scan/parse/classification used by reconciliation without applying projection mutations.

The reconciliation write path is deterministic:

```text
scan exact source files
  -> parse/validate all candidates
  -> detect duplicate stable ids before mutation
  -> resolve project/concerns/schema
  -> calculate desired WorkItem projections
  -> one SQLite transaction registers/updates projections whose source state is unambiguous
  -> diagnostics remain non-mutating for invalid/duplicate/unresolved candidates
```

The `registered`, `updated`, `moved` and `unchanged` sets are pairwise disjoint. `moved` means source path changed while the exact source SHA-256 stayed unchanged; a path change accompanied by changed bytes is `updated` and therefore follows source-change freshness.

A duplicate id detected by startup/explicit full reconciliation prevents either duplicate source from updating/materializing that WorkItem until resolved and remains a visible blocking queue diagnostic. Productive-boundary revalidation is deliberately different: conforming to `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` and `GW-DOC-TECHNICAL-ARCHITECTURE-V1`, it reads only the WorkItem's recorded source path and does not rescan the queue to discover another path, a moved source or a newly introduced duplicate. Invalid, missing or unresolved state of that recorded source is a source-boundary precondition failure, not a new lifecycle status/outcome: Order preserves the WorkItem's existing stage/status/outcome and rejects the current source-dependent action. A missing recorded path requires explicit/full reconciliation to discover a move. No `SOURCE_INVALID`/`SOURCE_MISSING` WorkStatus variant is introduced. A valid changed recorded source is different: it is reconciled and invokes the canonical source-change return to R1.

For a known non-terminal WorkItem, external source changes to title/body/concern ids update the source projection and invoke the canonical source-change return to R1. Changes to `schemaId` or `projectId` are accepted only for an unprogressed IDEA with no STAGE Run. Any change to `derivedFromWorkItemId` after creation, or any later schema/project reclassification, emits `SOURCE_RECLASSIFICATION_BLOCKED` and leaves the prior projection/lifecycle state unchanged. For `COMPLETE`, [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §29 source-freshness rules](12-technical-architecture.md) terminal-integrity rules apply.

#### Source create/update mutation

#### Create

Browser creation command is the canonical `CreateWorkItemSource` value parsed by `CreateWorkItemSourceSchema` in the canonical source/write-command subsection of this §31 contract.

The daemon:

1. resolves `projectId` to exactly one configured repository;
2. validates concerns against its manifest;
3. validates `schemaId` through the canonical catalog;
4. generates a new WorkItemId;
5. renders canonical Markdown from the schema template/title/metadata;
6. creates one source file exclusively under `workItemRoot`;
7. reads/hashes/parses it back;
8. reconciles/stores the WorkItem projection as IDEA/ACTIVE;
9. returns the canonical WorkItem.

If the source-file creation/read-back succeeds but SQLite projection persistence fails, the source file remains the authoritative durable producer. The daemon does not delete it or generate a replacement id; startup/manual reconciliation registers that same WorkItem id on the next pass.

The browser never constructs raw front matter itself.

#### WorkItem source edit

The source-save command is the canonical `ExpectedHashMarkdownWrite` value parsed by `ExpectedHashMarkdownWriteSchema` in the canonical source/write-command subsection of this §31 contract.

For `/api/work-items/:id/source`, the daemon:

1. revalidates the current reconciled source for the WorkItem;
2. requires current source hash == `expectedSha256`;
3. rejects direct UI source mutation when the WorkItem is `EXECUTION` or `COMPLETE`;
4. parses the proposed Markdown before writing and requires the stable id to remain the same;
5. permits `schemaId` and `projectId` changes only while the WorkItem is an unprogressed IDEA with no STAGE Run; `derivedFromWorkItemId` and stable id are immutable after creation; `concernIds` and title/body changes may occur pre-signoff and then participate in the normal source-freshness return path;
6. atomically writes the exact proposed Markdown through the source shell;
7. reads/hashes/parses the result;
8. reconciles the projection;
9. applies the source-change transition selected by `core/lifecycle.ts` (pre-signoff source change returns to R1/ACTIVE/null outcome; AWAITING_SIGNOFF also returns to R1);
10. returns `ExpectedHashWriteResult { tag: "UPDATED", sha256: <new source hash> }`; the browser invalidates/reloads the canonical source and WorkItem queries.

A hash mismatch performs no write and returns `ExpectedHashWriteResult { tag: "STALE", currentSha256 }`. If the atomic source write succeeds but the subsequent projection/lifecycle persistence fails, the next source reconciliation or productive-boundary revalidation repairs the SQLite projection from the exact file bytes; the file is not rolled back or rewritten.

There is no last-write-wins behavior and no merge algorithm. The expected-hash guard protects against stale state already observable when Order begins the write; v1 does not claim transactional locking against an unrelated external process racing the same filesystem path during that effect. Such external edits remain subject to subsequent source reconciliation/freshness checks.

#### Lifecycle Markdown editing

#### Editable roles

Direct operator editing is permitted only for `ArtifactRef.role`:

```text
R1
R2
DESIGN
PLAN
```

The target must be an existing regular `.md` repository file owned by the selected WorkItem and its current repository root. Direct editing is enabled only when the exact bytes decode as UTF-8 without BOM/NUL and already use LF-only line endings. A Markdown artifact that does not satisfy that text contract remains inspectable through the existing raw-content surface but is read-only; the workbench must not normalize its bytes merely by loading them into a browser textarea.

`R3` is read-only because it is the independent readiness result.

`GOVERNANCE`, `PROJECT_MANIFEST`, `VERIFICATION_MATERIAL`, candidate files/evidence and every other role are not directly editable through the Markdown workspace. In addition, `artifactReturnOwner(artifact)` must be the current lifecycle stage or an already-reached upstream stage. If the WorkItem has returned to an earlier stage, any historical document owned by a later stage is read-only until normal progression reaches that stage again. `IDEA` permits only WorkItem-source editing because no lifecycle artifact stage has yet been reached.

#### Artifact save command

The artifact-save command reuses the same canonical `ExpectedHashMarkdownWrite` value from the canonical source/write-command subsection of this §31 contract; there is no artifact-specific duplicate request shape.

For `/api/artifacts/:artifactId/content`, PUT is accepted only for the editable roles above.

The daemon:

1. loads the canonical ArtifactRef and owning WorkItem;
2. rejects direct editing while the owning WorkItem is `EXECUTION` or `COMPLETE`;
3. proves the role is directly editable, the artifact owner is not downstream of the WorkItem's current stage, and path ends in `.md`;
4. proves current repository bytes hash to `expectedSha256` and the selected ArtifactRef hash;
5. after `repository.ts` proves repository containment/symlink/regular-file preconditions, it invokes the shared `shell/file-write.ts` expected-hash replacement primitive;
6. reads/hash-verifies resulting bytes;
7. stores a new ArtifactRef snapshot with the same role/authority layer/path and new hash;
8. returns the WorkItem to `artifactReturnOwner(newArtifact)` with ACTIVE/null outcome;
9. does not fabricate `CONFORMANCE_PASSED`;
10. returns `ExpectedHashWriteResult { tag: "UPDATED", sha256: <new artifact hash> }`; the browser invalidates/reloads canonical ArtifactRef/WorkItem queries. A hash mismatch returns `STALE` and performs no repository write.

Existing downstream conformance becomes stale through current hash/output verification and must be re-established by the owning stage. If the repository write succeeds but ArtifactRef/lifecycle persistence fails, the next current-file/context resolution observes the changed repository bytes, materializes the current ArtifactRef snapshot if needed, and routes stale conformance to the owning stage; Order does not repeat or roll back the human write blindly.

#### Reconformance of a human-edited stage document

When starting R1/R2/DESIGN/PLAN and the latest conformance output set for that stage names one or more role-owned Markdown paths whose current repository bytes no longer match the previously conformant ArtifactRefs, `stage.ts` obtains current snapshots for those same output paths and renders them to OpenCode as **current stage draft for review** in addition to the normal higher-authority context.

This uses the last conformant output paths as the deterministic draft-path set; it does not search arbitrary repository Markdown. The draft snapshots are not added as higher authority and do not change the meaning of the existing `ResolvedContext.artifacts` dependency set. They are supplied so the stage can validate/revise the human-authored current output rather than being forced to rediscover/recreate it. If no prior stage output path exists, direct UI creation of a new lifecycle artifact is not provided; the normal stage proposal/adoption path creates the first artifact.

Promotion still requires `STAGE_COMPLETED` referencing an exact current role ArtifactRef and the existing conformance checks. A file change during the Run fails promotion through exact-hash validation.

#### Source-backed stage/context flow

Before every productive stage start/resume/promotion boundary:

```text
revalidate current WorkItem source
  -> WorkItemSourceSnapshot
  -> resolve stage authority/upstream artifacts
  -> contextHash includes sourceSha256 as material root identity
  -> prompt projection
```

Prompt projection:

- R1: exact current WorkItem Markdown is included;
- R2: exact current WorkItem Markdown is included where source-backed P2 intent is required by `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- DESIGN/PLAN/R3: validated upstream artifacts remain the normal semantic carriers; raw source text is omitted unless the lifecycle context resolver says it is materially required;
- every pre-signoff source-backed stage context hash includes the exact source SHA-256 even when the source body is not rendered.

No prompt builder independently opens/scans a WorkItem source path.

`stage.ts` also obtains the current schema's stage template and allowed R1 completion set from the same `src/core/work-item-source.ts` catalog. It renders that template/instruction into the STAGE prompt alongside the stage decision boundary. INVESTIGATION/AUDIT therefore receive only their R1 template/terminal contract; CHANGE/DEFECT receive the delivery templates as they progress. `stage.ts` does not hard-code a second kind/outcome/template table.

#### Approval/source binding

`SignoffPackage` adds one required source identity field and v2-created `Approval` records carry the same binding:

```ts
SignoffPackage.sourceSha256: Sha256
Approval.sourceSha256: Sha256
```

Every Approval has the exact current source SHA-256 that participated in sign-off.

The approval package hash includes `sourceSha256` together with the existing exact signed package material. Concretely, the P6 `ApprovalPackageProjection` / `canonicalApprovalPackageJson(...)` input adds `sourceSha256`; `computeSignoffPackage()` supplies the current validated source hash; and V0 recomputation supplies `approval.sourceSha256`. There is one package-hash algorithm, not a source-specific parallel hash.

The source path is not hashed as semantic authority because an unchanged source may move while preserving WorkItem identity/content.

V0 validates the signed package/source binding from persisted approval material without consulting mutable current source bytes. V1 then performs the canonical targeted revalidation of the WorkItem's recorded source path and compares the current source SHA-256 with `Approval.sourceSha256`. V1 does not perform a full-queue duplicate/move discovery scan; duplicate-id discovery remains owned by startup/explicit reconciliation.

A different hash, missing recorded source, invalid recorded source or unresolved recorded-source classification means current originating material cannot be proven equal to the signed source and yields `APPROVAL_STALE`; it routes through the existing upstream freshness path before any productive builder/reviewer/remediator work. Pure operational inability to access an otherwise unchanged configured filesystem remains classified by the existing environment/precondition rules rather than being mislabeled as semantic source change.

To reuse the existing approval-stale router without a parallel mechanism, a source-hash mismatch contributes `R1` as the changed owner when approval freshness computes its changed-owner set; no second stale-routing mechanism is introduced.

Raw source Markdown is not injected into execution prompts merely because it is approval-bound.

#### Kind-aware terminal lifecycle contract

No new lifecycle stages are introduced.

`WorkOutcome` adds:

```text
INVESTIGATION_COMPLETE
AUDIT_COMPLETE
```

R1 `StageCompletion` adds those outcomes.

`core/lifecycle.ts` remains the owner of terminal transition policy. `stage.ts` derives the current kind through the source catalog and supplies it as an explicit input when composing `evaluateStageCompletion()`; `core/lifecycle.ts` does not import the source-policy module merely to share the mapping.

`evaluateStageCompletion()` receives the schema-derived work kind (or the catalog-resolved allowed R1 completion set) as explicit typed input and enforces exactly the table in the WorkItem-schema-catalog subsection of this §31 contract:

- CHANGE/DEFECT: `CONFIRMED` promotes to R2; `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED` terminate exactly as today;
- INVESTIGATION: `INVESTIGATION_COMPLETE`, `DUPLICATE`, `ALREADY_SATISFIED` terminate; `CONFIRMED`/`DISPROVEN` are not valid completion values for that kind;
- AUDIT: `AUDIT_COMPLETE`, `DUPLICATE`, `ALREADY_SATISFIED` terminate; `CONFIRMED`/`DISPROVEN` are not valid completion values for that kind;
- `INVESTIGATION_COMPLETE` and `AUDIT_COMPLETE` transition directly to `COMPLETE / COMPLETE` with the corresponding `WorkOutcome`.

If a provider emits an R1 completion value that is structurally valid in the global `StageCompletionSchema` but is not allowed for the current schema/kind, `stage.ts` treats it as semantic conformance failure rather than an exception/crash: append `CONFORMANCE_FAILED` with the schema/outcome mismatch, keep the WorkItem at R1 `ACTIVE` with null outcome, terminalize that STAGE Run as `BLOCKED`, and require a new governed R1 Run. No format-repair turn is used for this semantic error.

The terminal R1 ArtifactRef/evidence remains the result document. No investigation/audit-only stage, task type or workflow is created.

A separately created remediation WorkItem uses `derivedFromWorkItemId` in source metadata/projection; the completed source WorkItem remains terminal and unchanged. The **creation command** may set a non-null remediation link only when the referenced WorkItem currently exists, is `COMPLETE`, resolves to `INVESTIGATION` or `AUDIT`, the new schema resolves to `CHANGE` or `DEFECT`, and the new `projectId` equals the parent WorkItem's `projectId`. Cross-project follow-up is a separately created unlinked WorkItem. The persisted portable link itself is provenance, not execution authority: reconciliation validates its identifier grammar and rejects self-linking, but it does not require the prior installation's terminal runtime state to be reconstructable or even require the referenced source to be currently present. The linkage is immutable after creation and may not be used as a general WorkItem relationship graph.

#### OrderConfig v2

The new catalog-driven project selection requires a finite deterministic project catalog. The v1 allowance for broad parent `repositoryRoots` (including `$HOME`) cannot supply that without recursive repository guessing. v2 therefore narrows `repositoryRoots` to **exact configured target repositories**. This remains consistent with `GW-FR-008-GOVERNED-REPOSITORY-ACCESS`: every WorkItem target is still explicitly configured, but the configured unit is now the exact repository the operator can select.

```ts
const OrderConfigSchema = z.strictObject({
  version: z.literal(2),
  model: OpenCodeModelRefSchema,
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema).min(1).refine(unique).readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema).refine(unique).readonly(),
  workItemRoot: AbsoluteDirectoryPathSchema,
});
```

Additional v2 invariants:

- every `repositoryRoots` entry is the exact canonical realpath returned by the existing Git top-level proof for that directory;
- every entry contains a valid root `pontivus-order.toml`;
- configured repositories have unique `ProjectManifest.projectId` values;
- a WorkItem repository must equal one configured repository root exactly; descendant containment is no longer a v2 WorkItem-selection rule;
- `referenceRoots` retain their existing STAGE-only read semantics and may still be arbitrary configured directories;
- `workItemRoot` is a separate absolute canonical directory and is not a target Git repository authority boundary;
- `workItemRoot` and every exact target `repositoryRoots` entry are path-disjoint after realpath resolution: neither may contain the other. This prevents repository/OpenCode mutation paths from becoming an alternate WorkItem-source writer and prevents the source scanner from traversing target repositories.
- `workItemRoot` and every configured `referenceRoots` entry are path-disjoint after canonical resolution: neither may contain the other. This prevents a STAGE provider's external-reference permission from becoming an alternate path for reading the queue or unrelated WorkItems outside the canonical source-context projection.
- `workItemRoot` and Order `stateRoot` are path-disjoint after canonical resolution: neither may contain the other. This prevents source discovery from traversing Order SQLite/evidence/workspaces/provider state and prevents runtime-state cleanup/replacement from becoming a WorkItem-source mutation path.

The productive WorkItem-root default is:

```text
$HOME/.local/share/pontivus-order-work-items
```

It is deliberately outside the default replaceable application installation root (`$HOME/.local/share/order`) and outside Order runtime/evidence/workspace state.

On a fresh v2 installation, the purpose-built installer collects one or more exact target repositories, validates each Git root/manifest/project id, then collects the WorkItem root (documented default or existing queue) before service activation.

Under the historical v2 contract, only config v2 was productive at daemon/ordinary CLI runtime. That contract is retained only as migration input for current v3 and is superseded by §32. For the supported v1 -> v2 beta update it retains the existing provider/model and reference-root values when valid and supplies the newly introduced `workItemRoot` from the canonical default `$HOME/.local/share/pontivus-order-work-items`. A configured v1 target that is already the exact Git top-level realpath is retained even when it lacks the newly required project manifest. In that one installer-only case, Order writes root `pontivus-order.toml` with `version = 1`, a `projectId` deterministically derived from the existing Git-root basename under `ProjectIdSchema`, P1 containing exactly `AGENTS.md` when that root file exists, and empty P2-P6. Optional refs, precedence, governance, concerns and verification remain absent/default-empty; the installer must not infer them from filenames, prose or package scripts. The generated bytes are parsed and resolution-validated through the same canonical manifest owner before the target is accepted. If the later installation fails, that attempt's newly created manifest is removed during rollback. A legacy configured root that is not itself an exact Git root may be narrowed only from distinct v1 `workItems.repositoryRoot` evidence still path-contained by that old configured root; each evidenced repository uses the same exact-root/manifest rule. No filesystem traversal or repository guessing is permitted. Only if this yields no exact target set does guided update ask the operator for one or more exact target repositories while retaining the other valid v1 choices. The resulting config file is written only as canonical v2. No dual productive config path exists. Fresh setup writes the complete v2 repository/reference/WorkItem-root choices from explicit current input; `order setup --reconfigure` changes an already-valid v2 configuration.

Rejected alternatives:

- recursively discovering every Git/Order repository under a broad v1 parent root is rejected because it turns a filesystem allowlist into a repository-discovery subsystem with traversal, ambiguity and performance policy not required by the product;
- adding a second project-registry file beside `OrderConfig` is rejected because it duplicates repository/project selection state;
- keeping free-text repository paths in the browser is rejected because it preserves the current operator error surface and bypasses the catalog-driven authoring requirement.

#### SQLite schema v2

`PRAGMA user_version = 2` was the historical productive schema marker for v2. Current productive schema semantics are owned by §32.

The existing lifecycle/provenance ownership remains in `workItems`. The fresh v2 schema adds the source projection and makes source binding mandatory on Approval:

```sql
CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  workItemId TEXT NOT NULL REFERENCES workItems(id),
  baselineCommit TEXT NOT NULL,
  packageHash TEXT NOT NULL,
  planArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  r3ArtifactRefId TEXT NOT NULL REFERENCES artifactRefs(id),
  sourceSha256 TEXT NOT NULL,
  approvedBy TEXT NOT NULL,
  approvedAt TEXT NOT NULL
) STRICT;

CREATE TABLE workItemSources (
  workItemId TEXT PRIMARY KEY REFERENCES workItems(id),
  schemaId TEXT NOT NULL,
  sourcePath TEXT NOT NULL UNIQUE,
  sourceSha256 TEXT NOT NULL,
  derivedFromWorkItemId TEXT
) STRICT;
```

`derivedFromWorkItemId` deliberately has no SQLite foreign key: it is portable cross-WorkItem provenance and may reference a WorkItem whose runtime state/source is not present on this installation. Creation-time authorization is enforced by the daemon command; persisted source reconciliation preserves the stable id without fabricating historical state.

The canonical `WorkItem` is reconstructed by joining its `workItems` row with exactly one `workItemSources` row and validating the combined value through `WorkItemSchema`. This is persistence decomposition of one aggregate, not a second domain/DTO shape. No source Markdown body is stored in SQLite.

`workItems.origin` remains the system-provenance text column. New writes never accept operator-supplied origin; they use `CREATED` or `DISCOVERED`. No lifecycle/context decision may use `origin` as a substitute for WorkItem-source Markdown.

Historical v2 fresh initialization created this schema and set `user_version = 2`. Current runtime opening/migration behavior is governed exclusively by §32; this paragraph does not authorize productive v2 startup.

Unknown valid source WorkItems discovered in the configured queue are reconciled as new IDEA records with origin `DISCOVERED`. Browser-created WorkItems use origin `CREATED`.

#### HTTP contract additions/replacements

All browser calls retain the existing same-origin session/origin rules.

#### Catalog/project queries

```text
GET /api/work-item-schemas
  -> WorkItemSchemaCatalogEntry[]

GET /api/projects
  -> ProjectManifest[]
```

The project query returns the existing canonical `ProjectManifest` values for the exact configured repositories only. Repository roots are installation-local resolution data and are not exposed or re-authored by the browser. Unique configured project ids let the create command resolve `projectId` deterministically without a project DTO or filesystem crawl.

#### Creation and reconciliation

```text
POST /api/work-items
body: { projectId, schemaId, title, concernIds, derivedFromWorkItemId? }
-> WorkItem

POST /api/work-item-sources/reconcile
body: {}
-> WorkItemSourceReconciliation

GET /api/work-item-sources/diagnostics
-> WorkItemSourceDiagnostic[]
```

The old create body `{repositoryRoot,title,origin,concernIds}` is removed. There is no dual compatibility path.

#### WorkItem source query/mutation

```text
GET /api/work-items/:workItemId/source
-> WorkItemSourceSnapshot

PUT /api/work-items/:workItemId/source
body: { expectedSha256, markdown }
-> ExpectedHashWriteResult
```

On `UPDATED`, the browser refetches the canonical `WorkItemSourceSnapshot`/`WorkItem`. On `STALE`, it leaves the unsaved textarea buffer untouched, marks the editor conflicted and blocks further Save attempts, and offers an explicit reload-current action that discards the local buffer only after operator action. It does not silently rebase the stale buffer onto the returned current hash. No composite source/update DTO is introduced.

#### Lifecycle Markdown query/mutation

Add one WorkItem-scoped query that returns only the **current** lifecycle Markdown snapshots as existing canonical `ArtifactRef` values:

```text
GET /api/work-items/:workItemId/lifecycle-artifacts
-> ArtifactRef[]
```

`src/daemon/authority.ts` owns resolution of this set because it already owns current WorkItem artifact/context material. For each R1/R2/DESIGN/PLAN/R3 stage, candidate paths come only from ArtifactRefs referenced by the latest STAGE Run for that stage (adopted proposal or stage-completion/conformance events), falling back to the latest conformant output paths when the current Run has not established a path. For each candidate path, the daemon materializes/returns the exact current file snapshot if it remains a regular Markdown file; superseded historical paths and non-current hashes are not returned. The UI does not choose a current snapshot from unfiltered artifact history.

Existing artifact content query remains:

```text
GET /api/artifacts/:artifactId/content
-> exact bytes
```

Add:

```text
PUT /api/artifacts/:artifactId/content
body: { expectedSha256, markdown }
-> ExpectedHashWriteResult
```

PUT is valid only for editable lifecycle Markdown roles defined in the lifecycle-Markdown-editing subsection of this §31 contract. On `UPDATED`, the browser refetches canonical ArtifactRef/WorkItem state. On `STALE`, no bytes change; the UI retains the unsaved buffer but blocks another Save until the operator explicitly reloads the new canonical bytes, preventing an implicit last-write-wins rebase.

#### Sign-off

Existing sign-off package queries return `SignoffPackage.sourceSha256`; sign-off returns an `Approval` with the same required non-null `sourceSha256`.

No generated HTTP client, generic mutation envelope or alternate API model is introduced.

## 32. Repository-native WorkItem v3 canonical contracts

This section is the current binding P6 contract for repository-native WorkItems and explicit documentation Git persistence. It supersedes §31 wherever §31 depends on an installation-global `workItemRoot`, movable source paths, config v2 or SQLite v2 source-path semantics. Other §31 source grammar/catalog/lifecycle rules remain unchanged.

### 32.1 Project WorkItem-document root

`ProjectManifestSchema` remains manifest `version = 1` and gains one backward-compatible optional field whose absence has a canonical default:

```ts
const ProjectWorkItemsSchema = z.strictObject({
  root: RepositoryPathSchema.default("docs/order/work-items"),
});

const ProjectManifestSchema = z.strictObject({
  version: z.literal(1),
  projectId: ProjectIdSchema,
  authority: ...,
  refs: ...,
  precedence: ...,
  governance: ...,
  concerns: ...,
  verification: ...,
  workItems: ProjectWorkItemsSchema.optional()
    .default({ root: "docs/order/work-items" }),
});
```

The resolved `workItems.root`:

- is a normalized repository-relative literal path, not a glob;
- is not `.`;
- must not equal `.git` or begin `.git/`;
- contains no `.`/`..`/empty segment, backslash or NUL under `RepositoryPathSchema`;
- is interpreted only relative to the validated exact target repository.

Existing v1 manifests without `[workItems]` remain semantically valid and resolve to the default. A project that wants a different location declares, for example:

```toml
[workItems]
root = ".context/order"
```

No installation-local configuration overrides this project-owned choice.

### 32.2 Deterministic WorkItem document paths

One canonical core function resolves:

```text
<workItems.root>/<WorkItemId>/work-request.md
<workItems.root>/<WorkItemId>/research.md
<workItems.root>/<WorkItemId>/requirements.md
<workItems.root>/<WorkItemId>/solution-design.md
<workItems.root>/<WorkItemId>/implementation-plan.md
<workItems.root>/<WorkItemId>/readiness-review.md
```

The exact role mapping is:

```text
SOURCE  -> work-request.md
R1      -> research.md
R2      -> requirements.md
DESIGN  -> solution-design.md
PLAN    -> implementation-plan.md
R3      -> readiness-review.md
```

The directory component is exactly the stable `WorkItemId`; title is never part of the path.

`WorkItemSourcePath` is now a repository-relative source-path scalar and must equal the computed `SOURCE` path for that WorkItem/project. Productive v3 does not adopt a moved source location.

For v3-created WorkItems, an `ARTIFACT_PROPOSAL_CREATED` for R1/R2/DESIGN/PLAN/R3 is admitted only when `targetPath` equals the computed path for its role and the unified diff addresses that same path. The provider cannot select a different lifecycle-document path.

Pre-v3 lifecycle ArtifactRefs retain their recorded paths as immutable history. During v2→v3 migration, current lifecycle-role bytes are additionally materialized at their deterministic v3 paths under §32.10 and are rediscovered there as drafts. Productive v3 does not continue using an arbitrary pre-v3 path as the current placement policy.

### 32.3 WorkItem source diagnostics

`WorkItemSourceDiagnostic` adds required project identity because the same repository-relative path may occur in multiple configured projects:

```ts
const WorkItemSourceDiagnosticSchema = z.strictObject({
  projectId: ProjectIdSchema,
  path: WorkItemSourcePathSchema.nullable(),
  workItemId: WorkItemIdSchema.nullable(),
  code: WorkItemSourceDiagnosticCodeSchema,
  detail: z.string().min(1),
});
```

Productive reconciliation scans only:

```text
<resolved workItems.root>/<direct WorkItemId directory>/work-request.md
```

A directory/source id mismatch is `INVALID_SOURCE`. A known expected path that is absent is `MISSING_SOURCE`. v3 does not emit/adopt a productive `MOVED` source disposition.


The current v3 reconciliation result is:

```ts
const WorkItemSourceReconciliationSchema = z.strictObject({
  registered: z.array(WorkItemIdSchema).readonly(),
  updated: z.array(WorkItemIdSchema).readonly(),
  unchanged: z.array(WorkItemIdSchema).readonly(),
  diagnostics: z.array(WorkItemSourceDiagnosticSchema).readonly(),
});
```

There is no productive `moved` outcome in v3. A source outside the computed deterministic path is invalid/misplaced and never adopted as the current source location.

After a valid source is established, Order inspects only the five deterministic lifecycle-document paths for that WorkItem. A present regular file is hashed and materialized/reused as an ArtifactRef for the corresponding role. `gitCommit` is current `HEAD` only when the working-tree bytes equal that exact `HEAD` blob; otherwise it is `null`. Discovery records no conformance/dependency edges and emits no stage-completion event. On a fresh runtime projection the WorkItem remains IDEA until the normal lifecycle revalidates those drafts.

Browser/source creation writes exactly the computed `SOURCE` path; it never accepts a caller-supplied source path.


### 32.4 OrderConfig v3

> Historical v3 cutover contract. The current runtime configuration contract is v4 under §35.11; this section remains authoritative only for v3 migration input.

```ts
const OrderConfigSchema = z.strictObject({
  version: z.literal(3),
  model: OpenCodeModelRefSchema,
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema).min(1).refine(unique).readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema).refine(unique).readonly(),
});
```

All existing repository/reference-root invariants remain. `workItemRoot` is removed.

At the v3 cutover, ordinary productive runtime accepted only config v3 and v2 was installer-owned migration input. Current runtime behavior is superseded by §35.11.

### 32.5 SQLite schema v3

`PRAGMA user_version = 3` is the productive schema marker.

The physical `workItemSources` columns remain:

```sql
CREATE TABLE workItemSources (
  workItemId TEXT PRIMARY KEY REFERENCES workItems(id),
  schemaId TEXT NOT NULL,
  sourcePath TEXT NOT NULL,
  sourceSha256 TEXT NOT NULL,
  derivedFromWorkItemId TEXT
) STRICT;
```

The semantic change is that `sourcePath` is repository-relative and validated against the WorkItem/project's deterministic v3 source path. The old global-root-relative meaning is invalid under schema v3.

The unique constraint on source path alone is removed because two distinct target repositories may legitimately contain the same relative WorkItem path; WorkItem ids remain globally unique and reconciliation rejects duplicate ids across configured repositories.

Fresh initialization creates schema v3 directly.

Installer migration from schema v2:

- reads each existing WorkItem/project/source binding while the v2 daemon is stopped;
- performs the filesystem migration in §32.10;
- updates each persisted `sourcePath` to the computed repository-relative destination only after exact byte/hash verification;
- advances `user_version = 3` in the same SQLite migration transaction;
- preserves Run/RunEvent/ArtifactRef/Approval/ExecutionTask history.

Ordinary daemon startup rejects schema v2; no productive dual interpretation of `sourcePath` exists.

### 32.6 Documentation Git-status contracts

```ts
const WorkItemDocumentGitStateSchema = z.enum([
  "MATCHES_HEAD",
  "MODIFIED",
  "UNTRACKED",
  "DELETED",
  "MISSING",
  "IGNORED",
  "UNMERGED",
]);

const WorkItemDocumentGitPathStatusSchema = z.strictObject({
  repositoryPath: RepositoryPathSchema,
  workingTreeSha256: Sha256Schema.nullable(),
  headSha256: Sha256Schema.nullable(),
  state: WorkItemDocumentGitStateSchema,
});

const WorkItemDocumentationGitBlockerSchema = z.enum([
  "LIFECYCLE_INELIGIBLE",
  "ACTIVE_RUN",
  "DETACHED_HEAD",
  "GIT_OPERATION_ACTIVE",
  "MISSING_GIT_IDENTITY",
  "MISSING_DOCUMENT",
  "IGNORED_DOCUMENT",
  "UNMERGED_DOCUMENT",
]);

const WorkItemDocumentationGitStatusSchema = z.strictObject({
  workItemId: WorkItemIdSchema,
  headCommit: GitCommitSchema,
  branch: z.string().min(1).nullable(),
  authorName: z.string().min(1).nullable(),
  authorEmail: z.string().min(1).nullable(),
  blockers: z.array(WorkItemDocumentationGitBlockerSchema).readonly(),
  paths: z.array(WorkItemDocumentGitPathStatusSchema).readonly(),
});
```

The path set is exactly the current canonical WorkItem source plus current lifecycle Markdown ArtifactRefs. It is unique and repository-path sorted.

`MATCHES_HEAD` means exact current working-tree bytes equal the exact blob bytes at current `HEAD`. `UNTRACKED` means the current governed file has no `HEAD` blob. `MODIFIED` means both exist and differ. `DELETED` means the governed path is absent in the working tree but has a tracked `HEAD` blob and is intentionally part of the current WorkItem management/document set. Missing/ignored/unmerged states are blocking for documentation commit.

Unrelated repository paths are not returned.

`branch` is the short/current local branch when `HEAD` is symbolic and `null` for detached HEAD. `authorName`/`authorEmail` are read only from repository-local Git `user.name`/`user.email` under Order's system/global-config-disabled Git environment; either is `null` when absent.

`blockers` is a canonical, unique, sorted set computed by the daemon/shell boundary. A status query is read-only and may report multiple blockers.

### 32.7 Documentation commit command

```ts
const WorkItemDocumentationExpectedPathSchema = z.strictObject({
  repositoryPath: RepositoryPathSchema,
  sha256: Sha256Schema.nullable(),
}).superRefine((value, ctx) => {
  // null is admitted only when the current canonical path state is an exact tracked deletion.
});

const CommitWorkItemDocumentationSchema = z.strictObject({
  expectedHeadCommit: GitCommitSchema,
  expectedPaths: z.array(WorkItemDocumentationExpectedPathSchema)
    .min(1)
    .readonly(),
});

const WorkItemDocumentationCommitSchema = z.strictObject({
  workItemId: WorkItemIdSchema,
  gitCommit: GitCommitSchema,
  repositoryPaths: z.array(RepositoryPathSchema).min(1).readonly(),
});
```

`expectedPaths` must equal the complete current set whose state is `MODIFIED`, `UNTRACKED` or `DELETED`, sorted by repository path. Each non-null SHA-256 is the operator-reviewed current working-tree hash. `sha256 = null` is valid only for an exact tracked deletion such as restore removing the committed archive marker.

The daemon rejects the command without Git mutation when:

- WorkItem stage is not one of `IDEA`, `R1`, `R2`, `DESIGN`, `PLAN`, `R3`, `AWAITING_SIGNOFF`;
- the WorkItem has any active Run;
- `HEAD` is detached rather than attached to a local branch;
- merge/rebase/cherry-pick/revert/bisect/sequencer Git state is active;
- repository-local `user.name` or `user.email` is missing;
- current `HEAD` differs from `expectedHeadCommit`;
- the current changed/untracked governed path set differs from `expectedPaths`;
- any expected working-tree hash differs;
- any current governed path is missing, ignored or unmerged;
- no governed path requires a commit.

Eligibility blockers use HTTP 409/current-state conflict semantics; malformed request data remains 400.

The commit message is deterministic:

```text
docs(order): save <WorkItemId> documentation
```

No operator-controlled commit-message field is introduced in v3.

### 32.8 Git effect contract

The shell owns the effect.

For tracked expected paths it executes a path-scoped `git commit --only` using only those exact literal repository paths.

For expected paths that are genuinely untracked, it first makes only those paths known with `git add --intent-to-add -- <paths>`, then executes the same path-scoped commit. It records which intent-to-add entries it introduced. If commit creation fails, it removes only those newly introduced intent-to-add entries, leaving pre-existing index state untouched.

Before mutation, the shell:

- proves attached branch with `git symbolic-ref -q HEAD` and requires the returned symbolic ref to begin `refs/heads/`;
- resolves repository-local `user.name` and `user.email` with `git config --local --get`;
- resolves Git operation markers through `git rev-parse --git-path` and rejects active `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD`, `REBASE_HEAD`, `rebase-merge`, `rebase-apply`, `sequencer` or `BISECT_LOG`.

The commit process:

- uses argv arrays and `--` before literal paths;
- performs a dry-run/path-set proof before mutation;
- passes the exact resolved local identity as `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL`, preventing Git from deriving an ambient fallback identity;
- does not use `git add -A`, `git add .`, `git commit -a`, unrestricted `git commit`, `--no-verify`, reset of unrelated paths, stash, checkout, branch creation, push, pull, fetch, merge or rebase;
- lets normal Git hooks run;
- resolves the resulting `HEAD` commit and verifies each committed path's blob hash after success.

If a repository hook permits a commit but changes the committed governed bytes away from the expected hashes, the postcondition check returns `COMMIT_VERIFICATION_FAILED`, blocks further lifecycle use of that package and requires operator remediation. Order does not automatically reset/rewrite an already-created Git commit.

A commit-hook or Git failure leaves WorkItem lifecycle authority unchanged and returns a typed failure; working-tree document bytes are not reverted.

### 32.9 HTTP additions

```text
GET /api/work-items/:workItemId/documentation-git-status
-> WorkItemDocumentationGitStatus

POST /api/work-items/:workItemId/documentation-commit
body { expectedHeadCommit, expectedPaths: [{ repositoryPath, sha256 }] }
-> WorkItemDocumentationCommit
```

The browser never supplies repository root or arbitrary path inputs to these commands.

Existing source/lifecycle Markdown GET/PUT endpoints continue to operate, but all source paths now resolve under the selected repository and project documentation-root contract.

A successful documentation commit does not itself mutate WorkItem lifecycle state. It advances repository `HEAD`, so the browser invalidates/refetches documentation Git status, current source/lifecycle ArtifactRefs and the sign-off package query when that query is eligible. Any previously displayed sign-off package/hash is stale after the commit and cannot be reused for Approval.

### 32.10 v2 external-source migration contract

Installer migration is all-or-nothing with respect to productive activation.

Preflight the complete v2 installation before copying any:

1. reject migration if any WorkItem is currently `EXECUTION` or has an active post-signoff Run/task;
2. parse every v2 source through the historical canonical source grammar;
3. resolve each `projectId` to exactly one configured target repository;
4. load/validate that repository's manifest and resolved `workItems.root`;
5. compute every deterministic v3 document destination;
6. reject duplicate ids;
7. resolve each WorkItem's current lifecycle-role ArtifactRefs from existing runtime state;
8. for every source/lifecycle destination, require absence or exact-identical bytes.

After complete preflight, write absent destinations through the same atomic writer and read-back/hash each. The source is copied byte-identically. Current lifecycle-role bytes are copied byte-identically from their existing repository paths to the deterministic v3 paths when different.

Old ArtifactRefs/RunEvents/Approvals remain immutable historical records. The deterministic lifecycle files are rediscovered as draft ArtifactRefs; migration does not transfer old conformance events/dependency closure to those new paths.

Only after all repository writes verify may the SQLite/config migration commit. It updates source paths to v3 semantics and advances `user_version = 3`. After startup/reconciliation:

- IDEA remains IDEA;
- any non-COMPLETE pre-signoff/AWAITING_SIGNOFF WorkItem that had progressed beyond IDEA returns to `R1 / ACTIVE` with null outcome for governed revalidation;
- COMPLETE remains terminal and any historical Approval remains provenance only;
- no v2 Approval is rebound to a v3 baseline.

If later installer activation fails, installer rollback restores the prior config/database/application; repository copies that exactly duplicate migrated document intent may remain as explicit operator-visible files rather than being destructively removed from the project.

The old external source directory is never deleted automatically. It is reported as a retained legacy backup and is ignored by productive v3.

### 32.11 Approval/source binding

`Approval.sourceSha256` remains required.

At sign-off, `computeSignoffPackage()` proves the current `work-request.md` working-tree bytes equal the blob at the selected `baselineCommit` and that its SHA-256 equals `sourceSha256`.

V1 execution preflight resolves the deterministic current source path in the selected repository and compares its exact bytes with `Approval.sourceSha256`. A project-manifest/document-root change participates in ordinary project-manifest freshness and therefore cannot silently redirect approval to another source path.

Raw source Markdown remains omitted from execution prompts unless independently required by lifecycle context.

### 32.12 Required certification

Permanent integration tests must prove:

- absent project override resolves to `docs/order/work-items`;
- deterministic lifecycle Markdown rediscovery creates draft ArtifactRefs without Run/conformance/stage fabrication;
- explicit project override resolves one repository-contained root;
- source creation/discovery uses only deterministic direct WorkItem paths;
- two configured repositories may use the same relative source path without persistence collision but may not contain the same WorkItem id;
- provider proposal with a non-canonical lifecycle path is rejected before mutation;
- v2 external sources migrate byte-identically to their selected repositories and productive v3 never reads the old root;
- documentation Git status is independent from unrelated repository changes;
- path-scoped documentation commit excludes unrelated staged and unstaged paths;
- untracked governed documents are committed successfully;
- a failing commit hook produces no commit and cleanup does not disturb pre-existing unrelated index entries;
- stale expected HEAD/document hashes reject without Git mutation;
- ignored/unmerged/missing governed documents reject;
- active Run, Implementation/Complete, detached HEAD and active merge/rebase/cherry-pick/revert/bisect/sequencer states reject without mutation;
- missing repository-local Git identity rejects before mutation and successful commits use the exact local identity for author/committer;
- Git save never pushes or changes branches;
- migration refuses active execution, materializes current lifecycle drafts at deterministic paths, and never rebinds a v2 Approval;
- sign-off rejects WorkItem documentation not represented by the selected baseline commit.

## 33. OpenCode saved-account management canonical contracts

This section is the binding P6 contract for `GW-FR-073..076` / `GW-TR-049..052`.

It manages saved **OpenCode Console login accounts** used by subsequent OpenCode work. It does not define provider/model selection and does not persist credential secrets in Order.

### 33.1 Canonical safe account projection

```ts
const OpenCodeAccountIdSchema = z.string()
  .min(1)
  .refine((value) => !value.includes("\0"), "account id must not contain NUL");

const OpenCodeAccountLabelSchema = z.string()
  .min(1)
  .max(320)
  .refine((value) => value === value.trim(), "account label must not have outer whitespace")
  .refine((value) => !value.includes("\0"), "account label must not contain NUL")
  .refine((value) => !value.includes("\n") && !value.includes("\r"), "account label must be one line");

const OpenCodeAccountStatusSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("READY") }),
  z.strictObject({
    status: z.literal("NEEDS_AUTH"),
    message: z.string().min(1),
    url: z.string().url().nullable(),
  }),
]);

const OpenCodeAccountSchema = z.strictObject({
  id: OpenCodeAccountIdSchema,
  label: OpenCodeAccountLabelSchema,
  active: z.boolean(),
  status: OpenCodeAccountStatusSchema,
});

const OpenCodeAccountMutationBlockerSchema = z.enum([
  "ACTIVE_RUN",
  "LOGIN_ATTEMPT_ACTIVE",
  "ACCOUNT_MUTATION_ACTIVE",
]);

const OpenCodeAccountStateSchema = z.strictObject({
  accounts: z.array(OpenCodeAccountSchema).readonly(),
  activeAccountId: OpenCodeAccountIdSchema.nullable(),
  mutationBlockers: z.array(OpenCodeAccountMutationBlockerSchema).readonly(),
});
```

This is one canonical Order-side safe projection of OpenCode account state, not a persistence DTO.

Projection rules are exact:

1. query pinned OpenCode integration `opencode`;
2. inspect the returned connections in their OpenCode-defined order;
3. the first connection overall is the active OpenCode connection under the pinned contract;
4. include as `accounts` only stored credential connections whose method is `oauth`;
5. mark an included account active only when its credential id equals the first connection's credential id;
6. `activeAccountId` is that id or `null` when the active connection is not an OAuth login account;
7. map an absent connection status to `READY`; map pinned `needs_auth` to `NEEDS_AUTH`;
8. sort the returned account list with the active account first, then by label/id for deterministic presentation.

The projection contains no OpenCode credential value or metadata.

Order never calls the pinned `credential.list` endpoint for this feature because its response includes secret credential material.

### 33.2 Account-label ownership

The account label is owned/persisted by OpenCode with the saved credential.

Order recommends that the operator use the exact login email as the label. Add/Rename requires the label to be unique among the current safe OAuth-account projection. Order does not claim that the label is independently verified against the authenticated email.

Credential id is immutable technical identity. Label changes do not create a new account.

### 33.3 Account-state query

```text
GET /api/opencode/accounts
-> OpenCodeAccountState
```

The query is read-only and allowed while Runs are active.

It starts/uses only the bounded private account-control process defined by P4 and returns the safe projection above.

### 33.4 Switch account

```ts
const ActivateOpenCodeAccountSchema = z.strictObject({
  expectedActiveAccountId: OpenCodeAccountIdSchema.nullable(),
});
```

```text
POST /api/opencode/accounts/:accountId/activate
body { expectedActiveAccountId }
-> OpenCodeAccountState
```

Admission requires:

- zero Runs with status `RUNNING` or `WAITING_FOR_INPUT`;
- no pending OpenCode account login attempt;
- no other account mutation in progress;
- current `activeAccountId` equals `expectedActiveAccountId`;
- `:accountId` is present in the freshly resolved safe account projection.

A target already active is an idempotent success.

The daemon passes only the proven credential id to the pinned OpenCode credential-activation operation, then refreshes the safe projection and requires `activeAccountId === accountId` before returning success.

No Order model/configuration field changes.

### 33.5 Rename account

```ts
const RenameOpenCodeAccountSchema = z.strictObject({
  label: OpenCodeAccountLabelSchema,
});
```

```text
PATCH /api/opencode/accounts/:accountId
body { label }
-> OpenCodeAccountState
```

Admission uses the same global no-active-Run/no-other-account-mutation boundary as Switch.

The daemon refreshes the safe account projection, proves the id is one of its OAuth login accounts, and rejects a label already used by any other account before calling the pinned credential-label update operation.

After mutation it refreshes and proves the exact new label.


### 33.5a Remove account

The pinned OpenCode 2.2.6 credential contract supports credential removal by credential id. Order exposes that capability only through the already-safe OAuth account projection.

```ts
const RemoveOpenCodeAccountSchema = z.strictObject({
  expectedActiveAccountId: OpenCodeAccountIdSchema.nullable(),
});
```

```text
DELETE /api/opencode/accounts/:accountId
body { expectedActiveAccountId }
-> OpenCodeAccountState
```

Admission requires the same installation-global mutation guard as Switch/Rename/Add and additionally:

- current `activeAccountId` equals `expectedActiveAccountId`;
- `:accountId` is present in the freshly resolved safe OAuth-account projection.

The daemon passes only that proven credential id to the pinned OpenCode credential-remove operation, then refreshes the safe account projection and requires that the removed id is absent before returning success.

Removing the active account is permitted only when no productive Run is active. OpenCode determines the remaining active connection, if any; Order does not silently activate a replacement credential. The returned `OpenCodeAccountState` is authoritative.

Removing the final account is valid and intentionally yields an account-required readiness blocker for productive OpenCode work. Removal never changes `OrderConfig.model`.

### 33.6 Add-account login

```ts
const StartOpenCodeAccountLoginSchema = z.strictObject({
  label: OpenCodeAccountLabelSchema,
});

const OpenCodeAccountLoginAttemptIdSchema = z.string().uuid();

const OpenCodeAccountLoginAttemptSchema = z.strictObject({
  id: OpenCodeAccountLoginAttemptIdSchema,
  authorizationUrl: z.string().url(),
  instructions: z.string().min(1),
  expiresAt: IsoDateTimeSchema,
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "EXPIRED", "CANCELLED"]),
  message: z.string().min(1).nullable(),
});
```

```text
POST /api/opencode/accounts/login
body { label }
-> OpenCodeAccountLoginAttempt

GET /api/opencode/accounts/login/:attemptId
-> OpenCodeAccountLoginAttempt

DELETE /api/opencode/accounts/login/:attemptId
-> 204
```

Start admission requires the same global mutation eligibility as Switch/Rename and rejects a label already present in the current safe account projection.

The daemon creates one Order UUID attempt id and internally binds it to exactly one pinned OpenCode OAuth attempt plus its retained private control process.

The OpenCode operation is fixed to:

```text
integrationID = "opencode"
methodID      = "device"
label         = requested account label
custom form/server answer = absent
```

The returned authorization URL must be HTTPS and have the same origin as the pinned default OpenCode Console endpoint. Otherwise the login start fails and the control process is terminated.

The browser never receives the OpenCode provider attempt id, loopback endpoint, process password or credential values.

### 33.7 Login attempt lifecycle

Only one login attempt may exist at a time.

`GET` polls the bound pinned OpenCode attempt and normalizes:

- OpenCode `pending` -> `PENDING`;
- `complete` -> refresh safe account state, prove one account with the requested label is now active, then `COMPLETED`;
- `failed` -> `FAILED` with OpenCode's safe failure message;
- `expired` -> `EXPIRED`.

On terminal state the daemon terminates/releases the private account-control process after recording enough transient terminal detail to return the terminal response for the current browser interaction. No durable login-attempt table is introduced.

DELETE cancels a pending OpenCode attempt and terminates the process, producing no account mutation unless OpenCode had already completed before cancellation won the race; in that race the daemon refreshes account state and reports the actual completed outcome rather than claiming cancellation.

Daemon restart loses any unfinished login attempt. The browser then receives not-found/expired recovery and can start a new login. Already completed OpenCode credentials remain durable in OpenCode's database.

### 33.8 Global account-mutation invariant

For this section, an **active Order Run** is any Run whose status is:

```text
RUNNING
WAITING_FOR_INPUT
```

Before every Add/Switch/Rename/Remove mutation the daemon queries canonical Run state and proves no active Run exists across **all** WorkItems.

The check is repeated immediately before the OpenCode mutation/admission after acquiring the daemon's account-mutation serialization guard.

This is an installation-global invariant, not a selected-WorkItem check.

### 33.9 HTTP/security boundary

All endpoints use the existing authenticated same-origin Order browser contract.

Account ids and labels are inert data. The browser cannot supply:

- OpenCode integration id;
- OAuth method id;
- OpenCode server URL;
- credential value/metadata;
- provider/model override;
- private OpenCode process endpoint/password.

OpenCode-specific secret-bearing responses terminate in the shell and are not canonical Order values.

### 33.10 Provider preflight consequence

A successful Switch/Add does not prove that the new account is entitled to every configured model.

The next productive Run still executes the existing exact model/authentication availability proof. Failure remains `PROVIDER_FAILURE`/the current canonical provider-preflight failure path; Order never silently changes the configured model/provider to compensate.

### 33.11 Required certification

Permanent integration/browser tests must prove:

- three saved OAuth accounts can coexist in the private OpenCode namespace;
- account query returns all three labels/opaque ids and exactly one active account when an OAuth account is active;
- switching A -> B -> A preserves all accounts and never changes `OrderConfig.model`;
- no secret credential value/metadata reaches Order HTTP/browser state;
- implementation never calls `credential.list` for the account manager;
- Add account drives the pinned `opencode`/`device` OAuth attempt and stores the requested label;
- successful Add makes the new account active;
- account login URL is validated before browser exposure;
- Add/Rename reject duplicate account labels and Rename changes label without changing credential id;
- Add/Switch/Rename/Remove all reject while any Run is RUNNING or WAITING_FOR_INPUT;
- removing a non-active account deletes only that credential and preserves the active account;
- removing the active account returns the actual refreshed OpenCode active-account state without Order choosing a replacement;
- removing the final account yields an empty safe account projection and account-required readiness;
- concurrent account mutations/login attempts are rejected deterministically;
- read-only account listing remains available during active Runs;
- switch/add affects only subsequently created OpenCode provider sessions;
- a configured-model preflight still fails normally when the selected account cannot use that model.

## 34. WorkItem management, API failure and provider diagnostic contracts

This section is the binding P6 closure for `GW-FR-077..078` and `GW-TR-054..056`.

### 34.1 Deterministic archive marker

The archive marker path is:

```text
<workItems.root>/<WorkItemId>/.order-archived
```

Valid present bytes are exactly UTF-8:

```text
archived\n
```

A different/non-regular/symlink value at that path is a source-management conflict and blocks archive-state reconciliation for that WorkItem.

`WorkItem.archived` is derived from valid marker presence.

Fresh v3 SQLite initialization includes the `archived INTEGER NOT NULL CHECK (archived IN (0,1))` projection column in `workItems`. The v2→v3 installer initializes it from repository marker facts after source/document materialization; absence means false.

### 34.2 Direct title command

```ts
const UpdateWorkItemTitleSchema = z.strictObject({
  expectedSourceSha256: Sha256Schema,
  title: WorkItemTitleSchema,
});
```

```text
PATCH /api/work-items/:workItemId/title
body { expectedSourceSha256, title }
-> ExpectedHashWriteResult
```

The daemon:

1. resolves/revalidates the deterministic Work request;
2. rejects `EXECUTION`/`COMPLETE`;
3. requires current source hash equal `expectedSourceSha256`;
4. calls the canonical pure source-title rewrite;
5. requires all parsed source identity/classification fields except title to remain identical;
6. writes through the existing guarded source replacement;
7. read-back/hash/parses/reconciles;
8. applies the existing source-change lifecycle reaction.

No title persistence occurs outside the Work request projection.

### 34.3 Archive command

```ts
const SetWorkItemArchivedSchema = z.strictObject({
  expectedArchived: z.boolean(),
  archived: z.boolean(),
});
```

```text
PATCH /api/work-items/:workItemId/archive
body { expectedArchived, archived }
-> WorkItem
```

Admission requires:

- current canonical `WorkItem.archived === expectedArchived`;
- `archived !== expectedArchived`;
- no Run for that WorkItem has status `RUNNING` or `WAITING_FOR_INPUT`;
- WorkItem stage is not `EXECUTION`.

For archive, the shell exclusively creates the exact marker and read-back verifies it. For restore, it removes only that exact validated regular marker. The daemon then refreshes the projection and returns the same WorkItem id/stage/status/outcome with only `archived` changed.

No lifecycle transition or source/artifact mutation occurs.

```text
GET /api/work-items
-> non-archived WorkItem[]

GET /api/work-items?includeArchived=true
-> all WorkItem[]
```

The query value accepts only exact `true` or absence.

### 34.4 Archive marker in documentation Git status

The canonical governed WorkItem Git path set is:

- deterministic Work request;
- current deterministic lifecycle documents/ArtifactRefs;
- deterministic archive marker when either the working tree or `HEAD` contains it.

For the marker:

- absent/absent -> omitted;
- present/absent -> `UNTRACKED`;
- present/present identical -> `MATCHES_HEAD`;
- absent/present -> `DELETED`.

A `DELETED` expected path uses `sha256 = null`. Path-scoped commit verifies absence before committing the deletion.

No other canonical WorkItem document may use null expected hash.

### 34.5 Canonical HTTP error response

```ts
const StableHttpErrorCodeSchema = z.string()
  .regex(/^[A-Z][A-Z0-9_]*$/);

const OrderHttpErrorSchema = z.strictObject({
  code: StableHttpErrorCodeSchema,
  message: z.string().min(1),
  sourceDiagnostic: WorkItemSourceDiagnosticSchema.nullable(),
});
```

Every JSON API failure uses this one shape.

Status classification is:

- **400** — malformed JSON/request schema/path/query;
- **401/403** — existing authentication/origin failures;
- **404** — requested canonical entity/resource does not exist;
- **409** — optimistic concurrency, source-boundary, lifecycle/current-state or other known operation conflict;
- **500** — unexpected daemon defect.

A source-boundary 409 sets `sourceDiagnostic` to the exact diagnostic. All other errors set it null.

The outer server API catch must classify rather than converting every exception to 400. Unexpected 500 responses use a stable generic public message and do not expose stack traces/secrets; full safe diagnostic detail may be retained in daemon/provider evidence where governed.

### 34.6 Provider diagnostic evidence payload

```ts
const ProviderTurnOutcomeSchema = z.enum([
  "SUCCEEDED",
  "FAILED",
  "INTERRUPTED",
  "TIMEOUT",
  "TRANSPORT_ERROR",
  "INVALID_OUTPUT",
]);

const ProviderDiagnosticRecordSchema = z.strictObject({
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
```

The JSON record is canonical diagnostic evidence. Observable OpenCode public tool/action/result material that is useful for diagnosis may be retained as additional bounded EvidenceRefs, but never hidden reasoning.

The coordinator-owned event is:

```ts
{ tag: "PROVIDER_DIAGNOSTICS_RECORDED"; evidence: readonly EvidenceRef[] }
```

It is not provider-emittable.

Every provider turn persists the diagnostic record before final turn reaction where possible. Non-empty bounded/redacted stderr is another EvidenceRef in the same event. On provider failure, `PROVIDER_FAILED.evidence` includes the diagnostic EvidenceRefs.

Known Order secrets are never persisted. Hidden chain-of-thought is never requested or recorded.

### 34.7 Required certification

Permanent tests prove:

- title edit changes only the canonical H1 and uses source expected-hash/freshness behavior;
- archive creates exactly the marker, default queue hides it, Show archived returns it, restore removes it, and lifecycle/history is unchanged;
- clone/reconciliation derives `archived` from the marker;
- documentation Git status/commit handles archive marker add and tracked deletion without unrelated Git changes;
- malformed/absent/conflict/unexpected failures map to 400/404/409/500 respectively;
- source conflict returns the exact canonical diagnostic;
- provider diagnostic event/evidence is inspectable from Run history;
- stderr is bounded and known secrets are absent;
- no hidden reasoning or second diagnostic/log database is introduced.



## 35. Settings, readiness and human-first source-authoring contracts

This section is the P6 realization of `GW-FR-079..098`. It extends the existing configuration, project-manifest, WorkItem-source and OpenCode-account contracts without introducing a parallel settings model.

### 35.1 Canonical configuration identity

Every productive configuration read returns the exact canonical `OrderConfig` plus the SHA-256 of its canonical persisted UTF-8 bytes:

```ts
const OrderConfigStateSchema = z.strictObject({
  config: OrderConfigSchema,
  sha256: Sha256Schema,
});
```

The SHA is optimistic-concurrency identity only. It is not another configuration authority.

Every Settings mutation that changes `config.json` requires the caller's `expectedConfigSha256`. A stale hash returns a 409 conflict before mutation.

### 35.2 Connected repository projection

The browser consumes one canonical projection derived from `OrderConfig.repositoryRoots` plus each validated root manifest:

```ts
const ConnectedRepositoryStateSchema = z.strictObject({
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
```

`repositoryRoot` is exact canonical Git top-level identity and remains available even when the manifest has drifted invalid. When `status === "READY"`, `projectId`, `workItemsRoot` and `manifestSha256` are non-null and describe the current validated manifest/effective document root. In `ATTENTION`, fields that cannot be proven are null and `attention` identifies the configuration defect. The projection does not copy the full project manifest into a new settings-owned shape.

The existing project catalog remains authoritative for project concerns/authority/verification. Settings uses this projection only for installation-level connection/document-location management.

### 35.3 Installation readiness projection

Readiness is derived on demand and is never persisted independently:

```ts
const InstallationReadinessBlockerSchema = z.enum([
  "REPOSITORY_REQUIRED",
  "REPOSITORY_CONFIGURATION_REQUIRES_ATTENTION",
  "MODEL_INVALID",
  "REFERENCE_ROOT_CONFIGURATION_REQUIRES_ATTENTION",
  "OPENCODE_ACCOUNT_REQUIRED",
]);

const InstallationReadinessSchema = z.strictObject({
  ready: z.boolean(),
  blockers: z.array(InstallationReadinessBlockerSchema).readonly(),
});
```

`ready === true` iff `blockers.length === 0`.


The daemon is the single readiness-policy owner. The browser does not reconstruct readiness from separate repository/account/model queries.

### 35.4 Focused Settings commands

Settings mutates canonical state only through focused commands:

```ts
const ConnectRepositorySchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  repositoryRoot: AbsoluteDirectoryPathSchema,
});

const DisconnectRepositorySchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  repositoryRoot: AbsoluteDirectoryPathSchema,
});

const UpdateConfiguredModelSchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  model: OpenCodeModelRefSchema,
});

const UpdateReferenceRootsSchema = z.strictObject({
  expectedConfigSha256: Sha256Schema,
  referenceRoots: z.array(AbsoluteDirectoryPathSchema).refine(unique).readonly(),
});

const MigrateWorkItemDocumentRootSchema = z.strictObject({
  repositoryRoot: AbsoluteDirectoryPathSchema,
  expectedManifestSha256: Sha256Schema,
  targetWorkItemsRoot: RepositoryPathSchema,
});
```

There is no generic browser command that posts an arbitrary replacement `OrderConfig`, raw project-manifest object or TOML text.

Repository connect/disconnect, model and STAGE reference-root mutations produce a new validated `OrderConfig` snapshot through the one configuration owner. Document-root migration mutates the repository-owned project manifest through the project-manifest owner and does not add a document-root field to `OrderConfig`.

### 35.5 Configuration activation contract

A successful config-changing Settings mutation is not considered active merely because new bytes reached `config.json`.

The daemon owns one serialized configuration-activation boundary:

1. prove no active Run or account-login/account-mutation operation conflicts with reconfiguration;
2. verify the expected config hash;
3. build and fully validate the proposed immutable `OrderConfig`;
4. preflight configured repositories and the selected OpenCode model against the proposed configuration;
5. quiesce the current coordinator scheduler;
6. construct a candidate `CoordinatorRuntime` over the same canonical database/state root using the proposed immutable config;
7. reconcile canonical repository sources under that candidate;
8. atomically persist the config bytes;
9. atomically replace the daemon's current coordinator-runtime reference with the candidate and start its scheduler;
10. return the new `OrderConfigState` and `InstallationReadiness`.

If candidate activation fails before the runtime swap, the old runtime/config remain authoritative and the old scheduler is resumed. If reconciliation changed projection state before a later activation failure, the old runtime performs canonical reconciliation before service resumes.

`CoordinatorRuntime.config` itself remains readonly. Reconfiguration replaces the whole immutable runtime snapshot; it never mutates `runtime.config` in place.

Only one configuration activation may run at a time.

### 35.6 Repository disconnect visibility

Disconnecting a repository removes it from the current productive configuration but does not delete its repository files or installation-local historical Run/evidence records.

Ordinary active-work queries project only WorkItems whose exact `repositoryRoot` remains in current `OrderConfig.repositoryRoots`. Historical records are retained in SQLite and become visible again when the same repository is validly reconnected/reconciled.

Disconnect is rejected while any active Run belongs to a WorkItem in that repository.

### 35.7 Repository document-root migration contract

The project manifest remains the only document-root configuration authority.

Before migration, Order resolves:

- exact repository root;
- current validated manifest bytes + SHA-256;
- current effective `workItems.root`;
- target repository-relative root;
- complete deterministic governed WorkItem path set under the current root.

Migration admission requires:

- matching `expectedManifestSha256`;
- target path is repository-contained, non-Git and valid under the existing project-manifest contract;
- no active Run for any WorkItem in the repository;
- no WorkItem in the repository is in `EXECUTION`;
- destination contains no conflicting governed WorkItem bytes;
- no Git operation or filesystem condition makes the move untrustworthy.

The shell project/document owner then performs one bounded operation:

1. stage/copy every governed WorkItem directory to the target root without changing file bytes;
2. verify file identities/hashes;
3. produce project-manifest bytes whose only semantic change is the effective `workItems.root`;
4. atomically activate the new document tree and manifest;
5. transactionally update the persisted current WorkItem source-path projections for every affected WorkItem from the old deterministic root to the new deterministic root, without changing WorkItem id/source hash/lifecycle history;
6. remove the former productive tree only after the manifest/tree/database path projections all agree;
7. re-read/parse/hash the manifest and governed sources;
8. reconcile the daemon projection and materialize current lifecycle files at their new deterministic paths as new draft ArtifactRefs where needed.

On failure, either the old root remains the sole productive root or the operation rolls back before returning failure. Two productive roots are never accepted as success.

Existing ArtifactRefs and Approval/Run history are immutable historical records and are not path-rewritten. Repository draft discovery after migration may create new ArtifactRefs for the same unchanged lifecycle bytes at the new deterministic paths. Existing freshness/project-manifest rules then determine whether pre-signoff material requires revalidation; migration itself does not fabricate conformance or approval continuity.

The manifest mutation must preserve unrelated project configuration/authority. A generic parse-and-reserialize rewrite that changes unrelated manifest semantics/text is not an acceptable correctness mechanism.

### 35.8 WorkItem source authoring projection

`WorkItemSourceSnapshot` remains the one canonical source snapshot and is extended with the exact human-authored body derived by the core source parser:

```ts
const WorkItemSourceSnapshotSchema = z.strictObject({
  path: WorkItemSourcePathSchema,
  sha256: Sha256Schema,
  metadata: WorkItemSourceMetadataSchema,
  markdown: MarkdownTextSchema,
  bodyMarkdown: MarkdownTextSchema,
});
```

`markdown` is the exact complete portable file for technical inspection/audit. `bodyMarkdown` is the exact byte-preserving body region beginning with the canonical H1 and is the normal Source editor buffer.

Body save uses:

```ts
const ExpectedHashWorkItemBodyWriteSchema = z.strictObject({
  expectedSha256: Sha256Schema,
  bodyMarkdown: MarkdownTextSchema,
});
```

The source core owner verifies the expected complete-file hash, parses the current metadata envelope, validates the proposed body, recomposes:

```text
current exact metadata envelope + proposed exact body
```

and persists through the existing expected-hash source-write effect. It must not regenerate, reorder or normalize the metadata envelope during a body-only save.

The existing full-source parser remains the authority for externally edited repository files.

### 35.9 Settings/account endpoint ownership

Existing OpenCode account endpoints and `OpenCodeAccountState` remain canonical. Settings reuses them; no settings-specific account shape/endpoints duplicate that owner.

New authenticated same-origin Settings endpoints are limited to canonical queries/commands for:

- config state;
- installation readiness;
- connected repositories;
- connect/disconnect repository;
- update configured model;
- update STAGE reference roots;
- migrate repository document root.

The server remains transport-only and calls daemon command/query owners. UI `http.ts` parses canonical P6 schemas and owns no configuration policy.

### 35.10 Required failure semantics

Known Settings failures use the existing canonical HTTP error shape.

At minimum:

- stale config/manifest identity -> 409;
- active Run/login/mutation blocker -> 409;
- invalid repository/model/path input -> 400 when request-invalid, otherwise 409 when canonical current state prevents the requested operation;
- missing configured repository/project -> 404;
- unexpected activation/migration defect -> 500.

No failure path silently falls back to another repository, model, account or document root.


### 35.11 OrderConfig v4 and bounded v3 migration

The first-class Settings/readiness design requires the daemon to start while installation configuration is incomplete. Config v3 cannot represent that state because it requires a model and at least one repository.

The current contract is therefore:

```ts
const OrderConfigSchema = z.strictObject({
  version: z.literal(4),
  model: OpenCodeModelRefSchema.nullable(),
  repositoryRoots: z.array(AbsoluteDirectoryPathSchema).refine(unique).readonly(),
  referenceRoots: z.array(AbsoluteDirectoryPathSchema).refine(unique).readonly(),
});
```

Config v4 distinguishes:

- **valid configuration state** — the file is structurally/canonically valid and the daemon may start;
- **productive readiness** — derived separately by `InstallationReadiness`.

A v4 config with zero repositories and/or `model = null` is valid but not productively ready.

Reading an existing v4 config validates its schema, stored path syntax/uniqueness and state-root separation without requiring every configured external path to be currently reachable. Exact realpath/Git-root/directory proof is mandatory when a root is added or changed and is repeated by readiness before productive use. This preserves the last configured identity so Settings can repair/remove a path that later disappears or drifts.

The installer/update path performs one deterministic v3→v4 conversion:

```text
v3.model -> v4.model unchanged
v3.repositoryRoots -> v4.repositoryRoots unchanged
v3.referenceRoots -> v4.referenceRoots unchanged
version 3 -> 4
```

No semantic choices are introduced and no existing repository/model selection is reset.

A fresh installation may create:

```json
{
  "version": 4,
  "model": null,
  "repositoryRoots": [],
  "referenceRoots": []
}
```

when the operator elects to complete configuration in the browser.

Daemon startup under incomplete v4 configuration:

- validates the config file;
- opens canonical state/database/session infrastructure;
- skips repository reconciliation when no repository is configured;
- skips model/provider preflight when `model === null`;
- starts the authenticated HTTP/UI surface;
- exposes readiness blockers;
- rejects productive commands whose prerequisites are absent with canonical 409 recovery errors.

It must not fabricate defaults merely to reach ready state.


## 36. Productive OpenCode workspace and instruction-boundary contracts

This section is the P6 realization of `GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1`. It extends the existing Run/RunEvent/task/provider contracts without introducing a second workspace or failure domain model.

### 36.1 Productive invocation failure event

`PRODUCTIVE_INVOCATION_FAILED` is coordinator-owned and is emitted only when Order's own deterministic productive-invocation admission fails before the failing action can correctly be attributed to an admitted provider turn.

Its classification is limited to existing terminal classifications `PRECONDITION_FAILED` and `ENVIRONMENT_BLOCKED`.

- repository snapshot/materialization failure, unresolved/stale provider-visible `AGENTS.md`, instruction symlink/escape, or another project admission invariant -> `PRECONDITION_FAILED`;
- missing/broken required local runtime/provider readiness that is not an admitted provider turn failure -> `ENVIRONMENT_BLOCKED` where the owning readiness/integration contract assigns that class.

The event detail is a non-empty human-actionable explanation. Evidence is the ordinary immutable `EvidenceRef[]` and defaults to empty when no additional evidence artifact is required.

`PROVIDER_FAILED` remains coordinator-owned but is reserved for an OpenCode process/session/productive-turn failure after Order has completed its local workspace/instruction admission for that action. A local pre-admission exception must not be persisted as `PROVIDER_FAILED` merely because the admitting shell function lives in `opencode.ts`.

### 36.2 STAGE provider-workspace material identity

No new persisted Run field is required.

For one live STAGE provider session the daemon carries one transient `Sha256` material identity derived through the existing canonical serializer/hash owner from:

~~~text
{
  baselineCommit: Run.baselineCommit,
  currentProjectDeltaSha256: <exact admitted working-tree projection hash>,
  contextHash: Run.contextHash
}
~~~

The identity belongs to the live `ActiveProvider` runtime binding only. It is not durable workflow authority. A daemon restart already terminalizes the lost live Run as `COORDINATOR_INTERRUPTED`, so no persisted provider-workspace record is introduced merely to reconstruct a lost provider process.

Before a resumed productive STAGE turn, Order recomputes/revalidates the current project delta and context. A mismatch prevents reuse of the existing session/workspace and follows the current stale/precondition reaction. Excluded ignored ambient bytes are absent from the admitted project delta and cannot invalidate this identity.

### 36.3 Instruction closure

For every productive provider workspace:

1. enumerate regular `AGENTS.md` paths inside the admitted workspace without following symlinks;
2. require every path to equal a resolved P1 repository path in the Run context/approval closure;
3. require provider-workspace bytes to hash exactly to the resolved ArtifactRef bytes;
4. reject a resolved repository instruction that should exist in the workspace but is missing or byte-different;
5. reject symlink/non-regular `AGENTS.md`;
6. reject any task `changeSurface` path whose final segment is `AGENTS.md`, regardless of current path existence.

This closure uses existing `RepositoryPath`, `ArtifactRef`, `Sha256` and authority-resolution owners. There is no `ProviderInstruction` DTO/domain type.

### 36.4 Candidate instruction immutability

V2/scope-governance candidate validation must reject any candidate whose changed-path set adds, removes or modifies an `AGENTS.md` path. The signed task grammar already prevents such a path from being authorized; candidate validation is the independent enforcement sensor, not a second permission source.

### 36.5 Productive admission ordering

For every STAGE/BUILDER/REVIEWER/REMEDIATOR session, Order completes the following local steps before admitting the first productive prompt:

1. productive readiness for the role;
2. exact provider workspace materialization/proof;
3. workspace escape/symlink checks required by P4;
4. instruction closure;
5. exact role permission derivation;
6. pinned provider process readiness;
7. session creation;
8. exact model/permission read-back binding.

A failure at steps 1-5 is not a provider failure. A failure at provider-owned steps 6-8 is classified by the existing integration/failure contract according to the actual failing boundary. Productive turn failures after step 8 remain ordinary provider failures.

### 36.6 External integration certification extension

The §29 OpenCode certification must additionally prove the complete test matrix owned by `GW-TR-079-OPENCODE-INSTRUCTION-BOUNDARY-CERTIFICATION`, including at minimum:

- ignored dependency `AGENTS.md` is absent from the provider workspace and cannot be reached by a guessed direct read;
- non-ignored/tracked nested project `AGENTS.md` is admitted only when resolved P1 bytes match;
- instruction symlinks/escapes fail closed;
- STAGE R1/R2/DESIGN/PLAN/R3 plus BUILDER/REVIEWER/REMEDIATOR all pass through one shared productive admission owner;
- external STAGE reference-root `AGENTS.md` remains non-authoritative and does not enter project instruction closure;
- existing and not-yet-existing `AGENTS.md` changeSurface paths are rejected;
- local admission failures persist `PRODUCTIVE_INVOCATION_FAILED`, not `PROVIDER_FAILED`;
- real admitted process/session/turn failure still persists `PROVIDER_FAILED` and retains the existing bounded operational recovery law;
- format repair remains deny-all;
- account-control operations remain isolated from project instruction scanning.


### 36.7 Effective model-context and trusted-integration closure

The productive admission contract realizes `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` / `GW-TR-080-EFFECTIVE-INSTRUCTION-PREFLIGHT`.

Before the first productive inference Order proves, for the exact live provider process/session:

- repository/read-triggered `AGENTS.md` satisfies §36.3 with exact canonical path/bytes;
- Order role/canonical context comes only from the existing resolved context/prompt owners;
- ordinary host/global/project OpenCode configuration and compatibility discovery cannot contribute ambient instructions/skills;
- the generated Run-specific `OPENCODE_CONFIG_CONTENT` contains only Order-owned configuration explicitly admitted for the Run;
- configured reference roots are explicit non-authoritative context;
- any Order-configured skill or MCP is explicitly admitted and permissioned for the role;
- the active saved OpenCode Console account, when required, is the explicitly selected trusted integration identity for the Run. Its provider-native Library instructions/skills and allowed remote MCP/provider configuration are accepted as trusted integration context and are not promoted into Order canonical authority;
- account mutation/switching remains impossible while the Run is active;
- arbitrary API-managed session instruction entries are absent unless a future governed contract explicitly introduces them.

Trusted integration semantics may influence model execution, but they do not enlarge `ExecutionTask.changeSurface`, mutate `AGENTS.md`, override canonical P1-P7 authority, bypass permissions, adopt artifacts or satisfy validation/signoff.

The productive evidence boundary records the selected integration/account identity plus exact Order-owned repository/context/config identities. It does not fabricate hashes for provider-native semantic bytes that OpenCode does not expose through its public API.

No new persisted instruction-domain model is introduced. The shell derives this admission from existing repository/context/account/config/permission owners.
