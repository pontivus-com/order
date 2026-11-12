# 32 — Markdown workbench extension

**Status:** Binding functional design  
**Canonical concern ID:** `GW-DOC-MARKDOWN-WORKBENCH`  
**Versioned concern ID:** `GW-DOC-MARKDOWN-WORKBENCH-V1`  
**Pyramid layer:** P3 functional requirements

## 1. Purpose

`GW-FR-005-LOCAL-WORKBENCH` in `GW-DOC-WORK-LIFECYCLE-V1` already owns Order's general local-browser workbench requirement. This document does not replace or restate that concern.

This document owns only the **new operator interaction consequences of source-backed Markdown WorkItems**:

- presenting canonical WorkItem-source reconciliation/diagnostics in the existing queue;
- rendering the governed authoring catalog in the existing creation surface;
- viewing and editing the Markdown documents that define pre-signoff work;
- lifecycle-stage Markdown navigation;
- durable-intent handling when interactive clarification requires a Markdown/authority update;
- source/artifact freshness impact visibility;
- source-bound integration into the existing R3/sign-off review;
- the read-only boundary between editable Markdown and existing execution/candidate surfaces;
- terminal Markdown/result presentation for non-delivery investigation/audit completion.

It does not own the generic queue, Run dialogue, artifact-proposal lifecycle, sign-off command, execution scheduler, validation semantics, candidate semantics, WorkItem-source identity/schema/reconciliation policy, lifecycle transitions, stage decision boundaries, technical architecture, persistence, or HTTP contracts. Those remain owned by `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-VALIDATION-STANDARD-V1`, `GW-DOC-TECHNICAL-ARCHITECTURE-V1` and `GW-DOC-CANONICAL-CONTRACTS-V1`.

## 2. Operator model

The workbench presents one coherent WorkItem workspace over canonical Order state.

The operator works with two classes of material:

1. **governed Markdown documents** that define or record pre-signoff work and may be human-authored through the workbench when the owning lifecycle rules permit;
2. **implementation/runtime outputs** that are inspectable but are never directly editable through Order.

The primary interaction principle is:

```text
before sign-off: govern work through Markdown + lifecycle actions
after sign-off: inspect execution/validation/candidate state; do not edit production outputs
```

Order is therefore a governed Markdown workbench, not an IDE.

## 3. Queue and source operations

The queue remains the operator's entry point.

Each valid WorkItem row exposes enough information to decide what needs attention:

- title;
- work kind resolved from the pinned WorkItem schema under `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`;
- project;
- lifecycle stage;
- lifecycle status/outcome where applicable;
- concerns;
- source health/freshness state when it is not current.

The queue provides an explicit **Refresh sources** action. That action invokes the canonical reconciliation behavior owned by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`; the UI does not scan or interpret files independently.

Source failures that cannot be represented as valid WorkItems remain visible through a queue-level diagnostics surface. At minimum it distinguishes:

- invalid source metadata/content;
- duplicate stable WorkItem identifiers;
- unsupported schema/version;
- missing source for a known WorkItem;
- project/schema/concern resolution failure.

A diagnostic identifies the source path and the actionable reason. Order must not hide an invalid source merely because it cannot construct a valid WorkItem row from it.

## 4. Governed WorkItem creation

`GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` owns the catalog-driven authoring choices and derived metadata. The local workbench renders those canonical project/kind/concern choices plus the title input; it does not maintain another option list or add free-text process identifiers.

After the existing create command materializes/reconciles the canonical Markdown WorkItem, the workbench opens that exact source in the Markdown workspace for further authoring. Browser creation and externally authored Markdown therefore converge on the same source-backed workspace.

## 5. Markdown workspace

Opening a WorkItem exposes a document-oriented workspace rather than an undifferentiated artifact list.

The workspace presents the current package in lifecycle order where those documents exist:

```text
WorkItem source
R1 research
R2 requirements
DESIGN
PLAN
R3 readiness
```

The workspace must make document identity and lifecycle ownership clear. Selecting a document exposes its current Markdown content and current/fresh/stale state.

The operator may edit only the Markdown surfaces explicitly permitted by §6. A historical document whose owning stage is downstream of the WorkItem's current lifecycle stage remains inspectable but read-only until that stage is validly reached again; the editor must not let lower-layer work outrun unresolved higher authority. Order does not provide arbitrary repository file browsing or arbitrary file editing.

## 6. Governed Markdown editing

### 6.1 Editable Markdown

The workbench permits direct operator editing of:

- the portable WorkItem source Markdown;
- current R1 Markdown;
- current R2 Markdown;
- current DESIGN Markdown;
- current PLAN Markdown.

Saving is an explicit operator mutation of the canonical Markdown document. Order performs an optimistic expected-hash check against the current bytes immediately before its atomic write; when the observed current hash differs from the loaded snapshot, the save is rejected without writing and the operator is shown the conflict.

A successful save must enter the same canonical freshness/conformance system used by agent-authored changes. Direct editing is available only when the document's owning stage is the current stage or an upstream stage already reached by the WorkItem; a downstream historical artifact is read-only. The UI must show the resulting owning lifecycle stage and any downstream invalidation; it must not imply that a text save by itself proves conformance or readiness.

### 6.2 R3 independence

R3 is an independent readiness judgment under `GW-DOC-WORK-LIFECYCLE-V1` and `GW-DOC-LIFECYCLE-CONTEXT-V1`.

The R3 Markdown result is viewable but not directly human-editable. If R3 is wrong or stale, the operator returns/reruns the owning readiness process rather than rewriting the independent verdict in place.

### 6.3 Project authority outside the lifecycle-owned Markdown set

A project-owned Markdown authority file that is not the WorkItem source or the current R1/R2/DESIGN/PLAN artifact remains governed by the existing artifact-proposal/adoption mechanism. The Markdown workspace does not become an unrestricted project-authority editor.

### 6.4 No semantic-diff threshold

Order does not ask the operator or a model whether a saved byte change is "material enough" to ignore. Freshness and invalidation follow the canonical source/artifact identity rules owned elsewhere.

## 7. Markdown editor behavior

The editor must be clear and suitable for ordinary Markdown authoring.

It provides at minimum:

- the exact current Markdown text;
- a visible dirty/unsaved state;
- explicit Save and Cancel/Revert-to-loaded-content actions;
- save-conflict feedback when the loaded snapshot is no longer current;
- validation feedback when the edited WorkItem source no longer satisfies its canonical source/schema contract;
- read-only presentation for documents that are not editable under §6.

The editor must not transform the operator's Markdown into an alternate rich-text authority or hide the exact source being saved.

Rendered Markdown preview, syntax highlighting, code completion, repository-aware navigation and IDE-style editing are not required v1 behavior.

## 8. Interactive runs and durable intent

The existing interactive STAGE dialogue remains part of the WorkItem workspace.

The UI distinguishes transient conversation from durable Markdown authority.

When material human clarification changes the originating request/P2 intent, downstream promotion cannot rely on the chat message alone under `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`. The workbench must make the required action explicit: update the WorkItem source or the appropriate canonical project authority, save it, then resume/re-run from the lifecycle state selected by canonical freshness rules.

The workbench must not silently copy a chat answer into Markdown or silently treat the answer as durable authority.

Non-authoritative conversation/evidence that does not change durable intent remains ordinary Run/RunEvent history and need not cause a Markdown write.

## 9. Freshness, blockers and recovery

The workbench explains lifecycle state in terms the operator can act on.

When a WorkItem or lifecycle document is stale/blocked, the UI exposes:

- the canonical state/classification returned by the daemon;
- which source/document is missing, changed or invalid where known;
- the lifecycle stage that currently owns recovery;
- the allowed next operator action, such as editing Markdown, refreshing sources, responding to a question, resolving project authority, rerunning the owning stage, or signing off.

The UI does not independently calculate return stages or invent recovery policy.

A generic "resume" action is insufficient when canonical state already identifies a specific unresolved source/document condition; the operator must be shown that condition.

## 10. Lifecycle package navigation

The operator can move between source, R1, R2, DESIGN, PLAN and R3 without searching a raw artifact list.

Each existing lifecycle document exposes at minimum:

- role/stage;
- current path;
- current/stale/read-only state;
- exact Markdown content;
- the editing action when allowed;
- the relevant conformance/readiness status available from canonical state.

Raw ArtifactRef identity/hash information is not required for ordinary navigation. Where existing diagnostic surfaces expose it, it remains read-only and secondary to lifecycle/document navigation.

Run history, questions, evidence and artifact proposals remain inspectable from the WorkItem workspace and remain tied to their canonical Run/RunEvent records.

## 11. R3 and sign-off package review

The exact sign-off package, approval baseline, task display, package hash and explicit approval action remain owned by `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-TECHNICAL-ARCHITECTURE-V1` and `GW-DOC-CANONICAL-CONTRACTS-V1`.

This extension adds two source-backed workbench behaviors to that existing surface:

- display whether the originating WorkItem source and R1/R2/DESIGN/PLAN/R3 Markdown package are current enough for sign-off;
- allow the operator to open those exact Markdown documents from the sign-off review without making package material editable in-place.

If the operator leaves sign-off to edit an editable Markdown document, the normal source/artifact freshness rules apply and the old ready/package identity is no longer presented as signable.

## 12. Execution, validation and candidate inspection

The execution/candidate inspection capability itself remains owned by `GW-FR-005-LOCAL-WORKBENCH`, `GW-DOC-EXECUTION-CONTROL-PLANE-V1` and `GW-DOC-VALIDATION-STANDARD-V1`.

This extension owns only the editor boundary: once a WorkItem is in EXECUTION, the existing task/Run/validation/evidence/candidate surfaces remain inspection-only. Order exposes no Markdown-editor mutation action for candidate code, tests, configuration, patch/evidence bytes, RunEvents, Approval records, ExecutionTask state or SQLite/runtime state.

Signed lifecycle Markdown may remain inspectable, but changing it requires returning through the governed upstream lifecycle rather than editing signed bytes inside the execution view.

## 13. Investigation and audit completion

`INVESTIGATION` and `AUDIT` WorkItems may terminate without implementation under `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`.

The terminal workbench view must present the evidence-backed result as successful non-delivery completion rather than as a failed or incomplete execution flow.

For an investigation, the operator can inspect the terminal finding/evidence.

For an audit, the operator can inspect the terminal verdict/findings/evidence.

The terminal view provides an explicit **Create linked remediation** action that lets the operator choose `CHANGE` or `DEFECT`. That action creates a distinct source-backed WorkItem in the same project through the normal authoring catalog and preserves the portable linkage required by the canonical WorkItem-source contract. Cross-project follow-up is created separately rather than overloading this remediation lineage. The action must not silently convert the completed investigation/audit into implementation work.

## 14. Functional requirements

### GW-FR-020-WORKBENCH-SOURCE-OPERATIONS

**Required behavior:** the queue exposes current WorkItems plus canonical source reconciliation/diagnostic state and an explicit source refresh action.

**Acceptance criterion:** an operator can discover and act on valid, invalid, duplicate, missing, changed or unsupported WorkItem sources without inspecting Order's database or filesystem internals.

**Failure/negative behavior:** the browser must not perform an independent source scan/parser or hide source failures that prevent WorkItem materialization.

### GW-FR-021-MARKDOWN-WORKSPACE

**Required behavior:** a selected WorkItem exposes its source and lifecycle Markdown documents in lifecycle order through one document-oriented workspace.

**Acceptance criterion:** the operator can move directly among available WorkItem/R1/R2/DESIGN/PLAN/R3 Markdown without inferring the package from an undifferentiated ArtifactRef list.

**Failure/negative behavior:** the workspace must not become an arbitrary repository file browser.

### GW-FR-022-GOVERNED-MARKDOWN-EDITING

**Required behavior:** the operator can edit and explicitly save WorkItem/R1/R2/DESIGN/PLAN Markdown through their canonical mutation paths with stale-write protection and downstream freshness/conformance consequences.

**Acceptance criterion:** a save carries the loaded snapshot hash; if the daemon-observed current bytes no longer match that hash before the write effect, no write occurs and the operator receives a stale/conflict outcome. Successful Order writes are atomic and are followed by canonical refetch/reconciliation.

**Failure/negative behavior:** R3, production code/tests/configuration, candidate/evidence/runtime state and unrelated project authority must not become directly editable through this editor.

### GW-FR-023-MARKDOWN-SOURCE-FIDELITY

**Required behavior:** the editor exposes and saves the exact Markdown source rather than an alternate rich-text representation.

**Acceptance criterion:** the operator can see the exact text being persisted and cancel/revert unsaved browser-local edits.

**Failure/negative behavior:** the UI must not introduce a parallel rich-text/AST source of truth or silently rewrite Markdown merely for presentation.

### GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY

**Required behavior:** the workbench exposes canonical stale/blocked/current state and the owning recovery stage/action for source and lifecycle documents.

**Acceptance criterion:** when an edit or external change invalidates downstream work, the operator can see what became stale and which governed action is required next.

**Failure/negative behavior:** the UI must not independently infer return stages or present a generic resume action when the canonical state identifies a more specific blocker.

### GW-FR-025-DURABLE-INTENT-INTERACTION

**Required behavior:** interactive human clarification that materially changes durable intent is visibly separated from transient Run conversation and requires an explicit canonical Markdown/authority update before downstream progression may rely on it.

**Acceptance criterion:** provider/session loss never makes a material operator intent decision disappear because the chat message was its sole durable owner.

**Failure/negative behavior:** the workbench must not silently promote chat text into canonical intent or automatically rewrite WorkItem Markdown from conversational text.

### GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION

**Required behavior:** the existing sign-off review integrates current WorkItem-source/package freshness and direct navigation to the exact lifecycle Markdown documents it depends on.

**Acceptance criterion:** the operator can inspect the source-backed Markdown package from the existing sign-off surface, and stale/changed source or lifecycle Markdown prevents that old package from remaining signable under the existing sign-off contract.

**Failure/negative behavior:** this extension must not create a second package-hash/task/approval representation, and editing package Markdown must not preserve the old readiness/approval identity.

### GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY

**Required behavior:** the Markdown workbench does not add editable production-output controls to the execution/candidate inspection surface already owned by the existing workbench/execution/validation concerns.

**Acceptance criterion:** signed/lifecycle Markdown and execution evidence remain inspectable under their existing owners while no editor mutation is offered for candidate code/tests/configuration, patch/evidence bytes, validation events, approvals, task state or runtime persistence.

**Failure/negative behavior:** the Markdown editor must not become a production-code or runtime-state editor after sign-off.

### GW-FR-028-NONDELIVERY-TERMINAL-VIEW

**Required behavior:** completed investigations and audits are represented as evidence-backed terminal results even when they create no implementation work.

**Acceptance criterion:** the operator can inspect the final finding/verdict/evidence and, where remediation is desired, create a separately governed linked CHANGE/DEFECT.

**Failure/negative behavior:** the workbench must not force investigation/audit results into DESIGN/PLAN/EXECUTION merely to obtain a successful terminal UI state.

### GW-FR-029-NO-IDE-SCOPE

**Required behavior:** Order's editable surface is bounded to governed Markdown authoring described by this document.

**Acceptance criterion:** ordinary repository implementation files remain inspectable only where existing evidence/candidate surfaces require it and are never exposed as editable workbench documents.

**Failure/negative behavior:** no generic file explorer/editor, IDE workspace, production-code mutation path or repository-wide save operation is introduced.

## 15. Explicit non-goals

This workbench extension does not authorize:

- a generic repository browser/editor;
- code/test/configuration editing;
- arbitrary project-authority editing;
- rich-text as a second document authority;
- semantic-diff classification of whether edits are important;
- automatic chat-to-Markdown rewriting;
- changing lifecycle stage semantics or R3 independence;
- replacing project artifacts with Order-owned duplicate documents;
- commit/push/PR/merge/deployment controls;
- WebSocket/SSE/provider token streaming;
- a second browser state store;
- user-defined WorkItem kinds or lifecycle stages.

## 16. Downstream design obligations

`GW-DOC-TECHNICAL-ARCHITECTURE-V1` and `GW-DOC-CANONICAL-CONTRACTS-V1` must resolve, without changing the behavior above:

1. one canonical Markdown source/catalog parser and one filesystem effect owner for portable WorkItem files;
2. the source/document query and optimistic-save command contracts;
3. which ArtifactRef roles are directly human-editable and how save returns the WorkItem to the owning stage without bypassing conformance;
4. exact source diagnostics/reconciliation query behavior;
5. catalog/project/concern query behavior for controlled creation;
6. source-bound sign-off package representation;
7. kind-aware non-delivery terminal outcomes without new lifecycle stages;
8. the read-only execution/candidate presentation using existing canonical Run/RunEvent/EvidenceRef/ExecutionTask state;
9. a UI decomposition that does not accumulate these new responsibilities into `ui/src/app.tsx`;
10. permanent architecture/browser tests proving no DB-only source bypass, no stale overwrite, no R3/code-editor path and correct source/lifecycle invalidation.