# 31 — Portable WorkItem documents and governed authoring catalog

**Status:** Binding functional design  
**Canonical concern ID:** `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM`  
**Versioned concern ID:** `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`  
**Pyramid layer:** P3 functional requirements

## 1. Purpose

Order must accept and govern software work as portable Markdown WorkItems instead of requiring operators to recreate work through installation-local free-text forms.

This document owns the functional behavior for:

- a configured/default WorkItem document queue;
- portable WorkItem identity and metadata;
- governed software-work kinds;
- versioned WorkItem schemas/templates;
- catalog-driven operator choices rather than free-text process metadata;
- discovery and reconciliation of an existing queue on a new installation;
- source-change freshness behavior.

It does not own the existing lifecycle stage semantics, stage decision boundaries, specification quality rules, post-sign-off execution policy, validation branches, persistence schema, HTTP contracts or exact filesystem/configuration grammar. Those remain owned by `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-SPECIFICATION-STANDARD-V1`, `GW-DOC-EXECUTION-CONTROL-PLANE-V1`, `GW-DOC-VALIDATION-STANDARD-V1`, `GW-DOC-TECHNICAL-ARCHITECTURE-V1` and `GW-DOC-CANONICAL-CONTRACTS-V1`.

## 2. Reference basis

The external systems below are prior-art evidence only. Their behavior is not copied into this document.

- `GW-DOC-REF-OPENSPEC-V1-2026-11-12` supports the decision to make workflow/artifact/template structure a versioned catalog rather than hard-coded form behavior.
- `GW-DOC-REF-SPEC-KIT-V1-2026-11-12` supports distinct software-work entry intents and evidence-first diagnosis/assessment rather than forcing every request into one feature path.
- `GW-DOC-REF-KIRO-SPECS-V1-2026-11-12` supports work-type-specific specification variants and explicit preservation of unchanged behavior for defects.
- `GW-DOC-REF-BMAD-V1-2026-11-12` supports keeping implementation, independent review and testing as distinct downstream activities that consume explicit intent.

Order's own lifecycle and authority model remain controlling where any external practice differs.

## 3. Product model

A queued WorkItem has two different owners that must not be conflated:

1. **portable source** — the operator-owned Markdown WorkItem that records the originating software-work intent and stable portable classification;
2. **Order runtime state** — the durable lifecycle/run/approval/execution/evidence state owned by Order.

The Markdown source is not a second lifecycle database. Order runtime state is not a substitute for the originating source document.

A new installation that is pointed at an existing valid WorkItem queue must rediscover the same portable WorkItem identities without requiring the operator to recreate them through the UI. Rediscovery of source documents does not fabricate historical Runs, approvals, sign-offs or execution evidence that are absent from Order durable state.

## 4. WorkItem kinds

The v1 authoring catalog has exactly four software-work kinds:

| Kind | Operator intent | Delivery consequence |
|---|---|---|
| `CHANGE` | Introduce or change software behavior/capability | May proceed through the delivery lifecycle after factual closure |
| `DEFECT` | Existing software behavior appears incorrect | Requires evidence/root-cause closure before remediation delivery |
| `INVESTIGATION` | Establish a technical fact or answer a software-engineering question | May terminate with an evidence-backed finding and no software mutation |
| `AUDIT` | Evaluate an existing artifact, implementation or change against explicit authority/criteria | May terminate with findings/verdict and no software mutation |

Domain/application classifications such as UI, security, data, API, performance or CI are **concerns**, not WorkItem kinds.

Implementation, testing and review are not WorkItem kinds. They are downstream activities governed by the existing signed task and validation system. A request to add/change test capability is a `CHANGE`; a request to evaluate whether behavior is correct is an `AUDIT` or `INVESTIGATION` according to its purpose.

An `INVESTIGATION` or `AUDIT` finding that authorizes no code change must be allowed to close without manufacturing requirements/design/plan/execution artifacts. When such a finding identifies new delivery work, that delivery intent becomes an explicitly linked `CHANGE` or `DEFECT` WorkItem and traverses the normal delivery authority boundary independently.

Linked remediation is same-project only. The completed investigation/audit remains terminal and unchanged; remediation is a distinct source-backed WorkItem. The portable `derivedFromWorkItemId` link is immutable provenance, not execution authority and not a general relationship graph. Creation may establish that link only from a currently completed same-project `INVESTIGATION`/`AUDIT` to a new `CHANGE`/`DEFECT`. Cross-project follow-up is created separately without overloading this lineage.

## 5. Portable WorkItem metadata

Every discoverable WorkItem Markdown source carries machine-readable front matter sufficient to identify and classify the work independently of one Order installation.

The required metadata concepts are:

- WorkItem metadata format version, named `formatVersion`;
- stable WorkItem identifier;
- stable project identifier;
- zero or more project-defined concern identifiers;
- pinned WorkItem schema identifier/version;
- optional immutable `derivedFromWorkItemId` provenance for separately governed remediation created from a completed investigation/audit.

The portable source does **not** persist a second `kind` fact. The operator selects a work kind during authoring, but the source pins only `schemaId`; the canonical catalog derives `kind` from that pinned schema. `formatVersion` versions the portable metadata grammar, while `schemaId` pins workflow/template semantics.

The document H1 is the canonical human-readable title. The Markdown body is the originating request/observation/question/audit instruction consumed by IDEA/R1 context.

The metadata must not duplicate mutable runtime state. In particular, stage, status, outcome, current Run, approval, execution-task state and validation state remain Order-owned runtime data and are not portable WorkItem metadata.

Installation-specific absolute repository paths are not portable WorkItem identity. The stable project identifier resolves to the current installation's validated repository under configured repository roots.

The exact front-matter grammar, identifier formats and persisted source projection belong to P6.

## 6. Governed WorkItem schema and template catalog

Order provides one canonical resolved authoring catalog. The UI, Markdown creator, source validator and agent-intake path consume that same catalog; none owns a parallel list.

The v1 catalog contains one pinned schema family for each WorkItem kind:

- `change-v1`;
- `defect-v1`;
- `investigation-v1`;
- `audit-v1`.

A WorkItem pins its schema when created or first adopted. A later Order release may offer a newer default schema, but it must not silently reinterpret an existing WorkItem under the newer schema.

The schema determines:

- applicable WorkItem kind;
- intake template;
- permitted stage/template set;
- allowed successful R1 completion set;
- required source-document sections;
- the canonical Order authority each generated stage artifact must satisfy.

Lifecycle prerequisite ordering and stage ownership remain governed solely by `GW-DOC-WORK-LIFECYCLE-V1` and `GW-DOC-LIFECYCLE-CONTEXT-V1`; the schema catalog does not create a second artifact/stage DAG.

Templates guide content; they do not create a second definition of R1/R2/DESIGN/PLAN/R3 semantics. Stage templates must cite and conform to the canonical stage owner rather than restating those rules as an independent specification.

Published schema identifiers are immutable semantic pins. A material change to a schema's template or structural validation semantics requires a new schema identifier; an existing published identifier must remain resolvable with its original meaning for previously authored WorkItems.

## 7. Built-in intake template variants

The built-in templates must reduce authoring work while giving the first agent turn enough correctly classified intent.

| Kind | Template prompts |
|---|---|
| `CHANGE` | requested outcome; current context; known constraints/non-goals; relevant references/evidence |
| `DEFECT` | observed behavior; expected behavior; reproduction/evidence if known; behavior that must remain unchanged; impact/context |
| `INVESTIGATION` | question to answer; why the answer matters; known evidence/context; investigation boundary |
| `AUDIT` | target under audit; governing authority/criteria; audit scope/exclusions; evidence/verdict requested |

A template may leave sections empty when the operator does not know the answer. Missing facts are resolved by the owning Order lifecycle stage rather than guessed during intake.

## 8. Catalog-driven authoring interaction

The ordinary "new WorkItem" interaction must not ask the operator to type process identifiers that Order or the selected project already owns.

The authoring surface provides:

- **Title** — free text;
- **WorkItem kind** — single selection from the Order work-kind catalog;
- **Project** — selection from the finite catalog of exact configured, validated target repositories; each target's validated `pontivus-order.toml` supplies its stable project identity;
- **Concerns** — zero-or-more selection from the selected project's `pontivus-order.toml` concern catalog.

The following are derived and are not free-text operator fields:

- WorkItem ID;
- project ID;
- origin/provenance of creation/discovery;
- schema/template identifier and version;
- lifecycle stage/status;
- artifact role/authority layer;
- validation gates.

Creating a WorkItem from the UI creates the Markdown source from the selected governed template first; Order then discovers/reconciles that file through the same path used for externally authored WorkItems. There is no separate browser-only WorkItem creation authority.

The document body remains ordinary Markdown so a human or tool may edit the actual work narrative without editing raw database state.

## 9. WorkItem queue location

Order has one configured WorkItem root used for portable source discovery.

First-run setup must offer a documented default and allow the operator to select an existing directory instead. The default must be outside the replaceable application installation and outside ephemeral execution workspaces, and reinstall must preserve the selected queue and its documents.

The exact default path and configuration field are P4/P6 decisions.

Selecting an existing queue must not initialize over, rename, rewrite or duplicate valid existing WorkItems merely because the current Order installation has no local projection for them.

## 10. Discovery and reconciliation

Order reconciles the configured WorkItem root on daemon startup and on an explicit operator refresh.

Directory-wide reconciliation is not sufficient evidence for a later productive action. Before stage start/resume, stage promotion, readiness/sign-off, or post-signoff V0/V1 preflight consumes a source-backed WorkItem, Order must revalidate that WorkItem's currently reconciled source identity/snapshot through the same source owner. This boundary check does not require a filesystem watcher or a full queue rescan.

For every supported Markdown source:

- valid unknown stable ID -> register the local runtime projection for that same WorkItem ID;
- known stable ID with unchanged source -> no-op;
- known stable ID found at a different path -> preserve identity and reconcile the source location;
- duplicate stable ID in more than one source -> visible blocking queue error;
- invalid/unsupported metadata -> visible source diagnostic; do not silently invent or partially import the WorkItem;
- source removed/unavailable -> preserve historical Order state but block source-dependent progression until resolved;
- source changed -> do not silently continue against stale downstream work.

A fresh installation with no prior Order state registers valid discovered source WorkItems as source-backed IDEA/intake records. It does not infer completed stages, approvals or execution history from the Markdown files.

## 11. Source freshness and reclassification

The WorkItem source participates in lifecycle freshness.

A changed validated source snapshot after downstream artifacts or decisions exist must make affected downstream context stale and return through the existing lifecycle re-resolution mechanism instead of letting implementation continue under old intent.

V1 does not ask deterministic code or an agent to decide that changed source bytes are "probably immaterial" to approved intent. Once the canonical P6 snapshot identity changes, source-backed conformance is stale. Moving the same stable WorkItem to another path without changing its validated source snapshot preserves identity and does not by itself change intent.

The stable WorkItem ID is identity and must not be repurposed for unrelated work.

For a WorkItem already in `COMPLETE`, later source mutation or disappearance does not reinterpret or reopen the historical lifecycle result. Order preserves the completed runtime history and exposes a source-integrity diagnostic; changed intent requires a new WorkItem.

Kind/schema reclassification may be corrected while the item remains an unprogressed IDEA. Once later lifecycle authority exists, reclassification must not silently reinterpret that history; the exact reset/linkage contract belongs to P6.

### 11.1 Source-to-agent context

The portable source is the authoritative producer of the originating work narrative. A runtime WorkItem projection may carry parsed identity/classification for durable coordination, but it is not a substitute for the Markdown body.

Before a productive pre-signoff OpenCode turn, Order must resolve one current validated WorkItem source snapshot and the pinned authoring schema. The context resolver then supplies:

- the exact originating source content where the current stage is entitled to receive the originating observation/request or P2 intent;
- the source-derived WorkItem metadata needed by that stage;
- the resolved stage template/instruction selected by the pinned WorkItem schema where an authored stage artifact is required;
- the existing project authority/evidence selected by `GW-DOC-LIFECYCLE-CONTEXT-V1`.

R1 must receive the current source narrative. R2 must receive the source-backed P2 intent when it remains materially necessary to define the required outcome. Later stages receive raw source bytes only when `GW-DOC-LIFECYCLE-CONTEXT-V1` requires them; validated upstream artifacts remain the normal minimum-context carrier otherwise.

An OpenCode stage must not reconstruct the originating request from a database title/origin/concern projection, guess the selected template from prose, or independently discover a different WorkItem source file.

### 11.2 Source identity in conformance

The exact validated WorkItem source snapshot is a material root input to pre-signoff conformance identity even when its raw body is omitted from a later stage prompt for minimum-context reasons.

If that source snapshot changes:

- an active stage turn must not promote under the previous context identity;
- previously passed affected stage conformance must become stale through the existing upstream-return mechanism;
- a resumed provider session must re-resolve the current source/context before productive continuation;
- downstream stages must not treat unchanged database projection fields as proof that the originating intent is unchanged.

The exact source-snapshot representation and hash composition belong to P6.

### 11.3 Source identity at sign-off and execution

An approval for a source-backed WorkItem must be bound to the exact source snapshot on which the approved package depends.

After sign-off, the raw source body need not be injected into every builder/reviewer prompt when the signed requirements/design/plan provide sufficient execution context. However, execution validation must still prove that the approval remains bound to the current originating source before productive mutation or review proceeds.

A material WorkItem source change after sign-off therefore makes the approval stale and routes the WorkItem back through the existing owning-stage freshness mechanism before another productive execution Run.

The exact approval-material representation is P6-owned; this functional requirement does not require the source file to masquerade as a repository `ArtifactRef`.

### 11.4 Interactive clarification durability

Interactive human input remains non-canonical conversation unless it is adopted into a canonical source.

For a source-backed WorkItem, when a human answer materially changes or clarifies the originating request/P2 intent that later stages would rely on, Order must not promote the work solely from the transient Run input. Before that clarification can become durable work intent, it must be represented in the WorkItem source or an appropriate project-owned authority source and pass normal reconciliation/freshness resolution.

Human input that supplies ephemeral evidence, answers an operational question, or selects among choices already authorized by current intent need not rewrite the WorkItem source merely because it occurred during an interactive Run.

This preserves restartability: after provider/session loss, Order must be able to reconstruct material intent from durable canonical inputs rather than from a remembered conversation.

## 12. Functional requirements

### GW-FR-009-PORTABLE-WORK-ITEM-SOURCE

**Required behavior:** every queued WorkItem is grounded in a portable Markdown source under the configured WorkItem root, with stable machine-readable identity/classification and a human-readable title/body.

**Acceptance criterion:** a new Order installation pointed at an existing valid queue rediscovers the same WorkItem IDs without browser re-entry or regenerated identities.

**Failure/negative behavior:** Order must not make an installation-local form/SQLite row the sole source of WorkItem identity or originating intent.

### GW-FR-010-GOVERNED-WORK-KIND-CATALOG

**Required behavior:** authoring uses the fixed v1 `CHANGE`, `DEFECT`, `INVESTIGATION` and `AUDIT` kinds and resolves domain applicability separately through project concerns.

**Acceptance criterion:** the selected kind deterministically chooses the governed intake/schema path; users cannot invent arbitrary work-kind strings.

**Failure/negative behavior:** implementation/testing/review activities or domain concerns must not become ad-hoc WorkItem kinds that bypass the lifecycle.

### GW-FR-011-VERSIONED-AUTHORING-SCHEMAS

**Required behavior:** each WorkItem pins a versioned Order schema that resolves its intake template and applicable document route from one canonical catalog.

**Acceptance criterion:** changing the application's later default schema does not silently change the meaning/expected structure of an existing WorkItem.

**Failure/negative behavior:** UI code, database rows, prompts and file parsers must not maintain divergent template/workflow catalogs.

### GW-FR-012-CATALOG-DRIVEN-AUTHORING

**Required behavior:** normal authoring presents controlled selections for kind, project and concerns and derives system-owned metadata automatically.

**Acceptance criterion:** the ordinary creation path requires free typing only for the human document content such as its title/body; process identifiers are selected or derived.

**Failure/negative behavior:** operators must not type repository paths, concern IDs, origin strings, schema IDs, lifecycle states or artifact roles into ordinary creation forms.

### GW-FR-013-PORTABLE-QUEUE-RECONCILIATION

**Required behavior:** startup/refresh reconciles valid WorkItem sources by stable identity and preserves source-backed work across reinstall or loss of installation-local projection state; every productive lifecycle/sign-off/execution boundary also revalidates the affected WorkItem source before relying on a prior projection.

**Acceptance criterion:** unknown, moved, unchanged, invalid, duplicate, changed and missing sources receive deterministic visible dispositions without duplicate WorkItem creation, and a Markdown edit made while the daemon is running cannot remain invisible until the next full queue scan.

**Failure/negative behavior:** discovery must not rewrite an existing queue, silently drop invalid files, assign new identities to known WorkItems or fabricate historical execution state.

### GW-FR-014-SOURCE-FRESHNESS

**Required behavior:** the originating WorkItem source participates in context freshness and a changed canonical source snapshot cannot be ignored after downstream work exists.

**Acceptance criterion:** downstream authority/execution cannot proceed on stale intent after a source snapshot identity change; an unchanged snapshot moved to another path retains the same WorkItem identity without semantic invalidation.

**Failure/negative behavior:** source edits must not be absorbed by mutating runtime history to appear consistent with old approvals.

### GW-FR-015-SOURCE-CONTEXT-PROJECTION

**Required behavior:** productive pre-signoff OpenCode Runs receive the current validated source-backed work narrative and the resolved pinned schema/template context required by their lifecycle stage.

**Acceptance criterion:** R1 receives the exact current WorkItem source narrative; R2 receives source-backed P2 intent when materially required; later stages receive source bytes only when required by the lifecycle context policy, while all stage output-format guidance resolves from the pinned authoring schema.

**Failure/negative behavior:** a database WorkItem projection, manually reconstructed prompt summary, or independently discovered file must not replace the canonical WorkItem source when originating intent is material to the stage.

### GW-FR-016-SOURCE-CONFORMANCE-IDENTITY

**Required behavior:** the exact current WorkItem source snapshot participates in pre-signoff context/conformance identity independently of whether its full body is rendered into a particular later-stage prompt.

**Acceptance criterion:** changing the source invalidates every affected prior conformance result and prevents an active/resumed stage Run from promoting under the old source identity.

**Failure/negative behavior:** unchanged title/project/concern projection fields must not allow downstream stages to remain valid after the source narrative materially changes.

### GW-FR-017-SOURCE-SIGNOFF-BINDING

**Required behavior:** sign-off binds the approved package to the exact WorkItem source snapshot that supplied its originating intent, and post-signoff preflight checks that source freshness before productive execution/review.

**Acceptance criterion:** a material source change after sign-off produces approval staleness and blocks builder/reviewer work until the package is re-resolved and re-approved through the existing lifecycle.

**Failure/negative behavior:** execution must not remain authorized merely because repository authority and PLAN/R3 files are unchanged while the originating source changed.

### GW-FR-018-SOURCE-CONSUMER-CLOSURE

**Required behavior:** queue presentation, pre-signoff context resolution, conformance, readiness/sign-off and post-signoff freshness all observe one reconciled current WorkItem source identity and classification.

**Acceptance criterion:** each consumer either uses the current validated source snapshot directly or a Order-signed derivative whose dependency/freshness chain includes that snapshot.

**Failure/negative behavior:** no UI, prompt builder, lifecycle resolver, approval validator or execution preflight may maintain an independent parser/source lookup or bypass the source reconciliation/freshness result.

### GW-FR-019-SOURCE-CLARIFICATION-DURABILITY

**Required behavior:** material human clarification of the originating request/P2 intent becomes durable only through the WorkItem source or another canonical project authority before downstream promotion may rely on it.

**Acceptance criterion:** after session/provider loss, every material intent fact required to reconstruct the WorkItem is available from durable canonical inputs; transient Run conversation is not the sole owner of changed intent.

**Failure/negative behavior:** Order must not let a human chat answer silently redefine WorkItem intent for later stages or sign-off while the portable source remains unchanged.

## 13. Explicit non-goals

This functional extension does not authorize:

- replacing the Order IDEA -> R1 -> R2 -> DESIGN -> PLAN -> R3 -> sign-off -> execution control model with an external tool's lifecycle;
- making WorkItem Markdown the persistence owner of Run/approval/execution state;
- making OpenSpec, Spec Kit, Kiro or BMAD a runtime dependency;
- importing their CLI commands, schemas, templates or directory layouts verbatim;
- arbitrary user-defined WorkItem kinds in v1;
- a generic ticket/backlog system;
- automatic reconstruction of missing approval/run history from files;
- new post-sign-off implementation/testing/review document types where the current signed task, RunEvent and validation evidence contracts already own the semantics.

## 14. Downstream design obligations

P4/P5/P6 work following this document must resolve, without changing these functional requirements:

1. exact WorkItem-root configuration/default and installer interaction;
2. exact Markdown/front-matter grammar and source identity/hash contract;
3. the canonical typed catalog representation and where built-in schemas/templates are packaged;
4. source scanner/reconciliation effect boundary and persisted projection;
5. database schema-version consequence and migration from the current DB-created WorkItem model;
6. source-change invalidation and non-delivery terminal-state contracts for `INVESTIGATION`/`AUDIT`;
7. HTTP/UI changes that replace raw text fields with resolved catalog/project selections;
8. source-backed creation so UI-created and externally created WorkItems share one ingestion path;
9. exact source-to-context projection for pre-signoff OpenCode Runs, including how the pinned schema resolves stage template/instruction content without duplicating stage authority;
10. source snapshot participation in context hashes/conformance invalidation and resumed-session re-resolution;
11. source snapshot participation in sign-off material/freshness and V0/V1 post-signoff preflight without forcing raw source bytes into every execution prompt;
12. one canonical source parser/reconciliation result consumed by UI, context, approval and execution paths rather than parallel source readers;
13. productive-boundary source revalidation so a source edit while the daemon is running is observed without requiring a watcher/full queue scan;
14. durable adoption path for material interactive clarification of originating intent;
15. tests proving fresh-install discovery, reinstall preservation, duplicate/invalid/moved/changed/missing-source behavior, exact R1 source projection, context invalidation on source change, approval staleness after source change, mid-daemon source-edit detection, material-clarification restartability and no DB-only/source-bypass path.
