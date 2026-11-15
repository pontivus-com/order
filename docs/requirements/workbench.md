# Order Workbench functional design

**Status:** Binding functional design  
**Canonical concern ID:** `GW-DOC-WORKBENCH-UX`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-UX-V2`  
**Pyramid layer:** P3 functional requirements  
**Scope:** WorkItem workflow interaction, state presentation, operator messaging, information hierarchy, spatial behavior, recovery behavior, responsive workbench behavior, unified component presentation and theme behavior.

## 1. Purpose

This document is the canonical functional design for the Order Workbench.

Order is a software-work factory. The Workbench must let an operator understand and operate that factory without inferring hidden lifecycle state, provider activity, stale authority, recovery ownership or technical implementation details.

For every selected WorkItem, the Workbench must answer three questions immediately and continuously:

1. **Where is this work now?**
2. **What requires attention now?**
3. **What can the operator validly do next?**

This document owns observable product behavior only. It does not prescribe the internal state-machine representation, persistence schema, HTTP shape, React component graph, locking implementation, database transaction boundaries or provider implementation. Those are downstream P4/P6 concerns and must be derived from this functional design without changing it.

## 2. Product operating model

The ordinary lifecycle is:

~~~text
Work request
  -> Research
  -> Requirements
  -> Solution design
  -> Implementation plan
  -> Readiness review
  -> Approval
  -> Implementation
  -> Complete
~~~

The lifecycle is not strictly monotonic. Readiness, approval freshness and implementation validation may return work to an earlier owning stage. Returning upstream does not erase the fact that downstream stages were previously reached.

The browser is a client of canonical Order state. It may select and inspect workflow history, but it does not own lifecycle truth and does not infer mutation eligibility independently.

## 3. Functional state model

Order exposes several distinct kinds of state. They must remain distinct in behavior and presentation even if a downstream implementation derives them from fewer persisted fields.

### 3.1 Lifecycle position

Lifecycle position answers:

> Which workflow stage currently owns the WorkItem?

Exactly one stage owns the current WorkItem position.

The current stage determines the workflow context in which new progress can occur. It does not by itself determine whether a historical stage was ever reached.

### 3.2 Reach history

Reach history answers:

> Which workflow stages have this WorkItem actually entered or operated in?

Reach history is monotonic. Once a stage has been reached, it remains reached for inspection even if current lifecycle position later returns upstream.

Therefore:

- current stage and reached stage are different concepts;
- a downstream stage is not automatically unreached merely because the current stage is upstream;
- a returned WorkItem preserves its prior Approval, Implementation, Readiness and other historical material;
- the workflow rail must distinguish **current**, **reached/historical** and **unreached** from canonical history, not from numeric stage ordering.

### 3.3 Run lifecycle

A Run has its own lifecycle independent of WorkItem lifecycle position.

A Run may be active, waiting for required input, blocked, failed, cancelled or terminally completed according to the canonical Run contract.

Run state must never be treated as a complete conversation-turn state.

### 3.4 Conversation-turn availability

For an interactive pre-signoff Run, the Workbench must distinguish these observable interaction conditions:

- **Processing** — a provider turn is in flight. The operator may inspect activity and may draft locally, but Order does not accept another message for that Run.
- **Open for continuation** — the Run remains active, no provider turn is in flight and no required-input request owns the interaction. The operator may submit a new free-form continuation.
- **Required input** — exactly one unresolved canonical human-input request owns the next operator response. The response is bound to that request.
- **Closed** — the Run no longer accepts operator messages.

The implementation may choose how these conditions are represented internally. The product requirement is that input admission is serialized and unambiguous.

### 3.5 Operator-attention state

Current attention answers:

> What, if anything, requires human action now?

Examples include:

- required Run input;
- pending proposal decision;
- document conflict;
- current blocker;
- retryable current failure;
- stale approval package;
- repository/setup blocker;
- execution blocker requiring an explicit recovery action.

Current attention is independent of what historical material the operator has selected for inspection.

### 3.6 Material currentness

Lifecycle documents, source material, approval material and execution authority can be current or stale relative to canonical upstream authority.

Currentness is not inferred from whether the bytes exist.

A stale artifact remains inspectable history. It is not presented as current authority and it does not silently disappear.

### 3.7 Closed workflow-state language

The observable workflow language is closed. Every Workbench workflow condition is expressed as a composition of the following orthogonal state primitives; feature/UI code does not invent another workflow-status vocabulary.

| State primitive | Closed observable values | Meaning |
|---|---|---|
| lifecycle position | canonical `WorkStage / WorkStatus / WorkOutcome` | current owning lifecycle position and terminal outcome |
| reach state, per stage | `CURRENT | REACHED_HISTORICAL | UNREACHED` | whether a lifecycle stage is current, was actually reached, or has not been reached |
| STAGE interaction | `PROCESSING | OPEN | REQUIRED_INPUT(Q) | CLOSED` | whether the current interactive Run is processing, accepts free continuation, requires one exact answer, or accepts no further input |
| proposal decision | `NONE | PENDING(P) | ADOPTION_IN_PROGRESS(P)` | whether one current lifecycle proposal needs disposition or has durable adoption intent awaiting exact completion/reconciliation |
| material currentness | `CURRENT | STALE(owner)` | whether currently judged lifecycle/approval/execution authority is still current relative to its canonical dependencies; the human-readable cause comes from the owning canonical diagnostic/classification |
| execution owner | `NONE | CURRENT_TASK(task) | BLOCKED_TASK(task)` | exact task that currently owns Implementation progress/attention |
| validation boundary | `NONE | PASSED_THROUGH(Vn) | FAILED_AT(Vn, classification) | COMPLETE` | latest durable post-signoff validation boundary for the current task/candidate |
| recovery route | `NONE | RETRY_CURRENT_STAGE | RESUME_CURRENT_OWNER | RECONCILE_AUTHORITY` | the single operator-facing recovery route, if any, for the current condition; automatic execution remediation/replacement remains execution policy and appears as ordinary processing/Run state |
| observation coherence | `COHERENT | CONVERGING` | whether the browser has one self-consistent canonical observation or is waiting for dependent canonical facts to catch up |
| current attention | the closed categories in §21.9 | the one current workflow condition/action that must dominate presentation |

These values are a functional language, not a persistence model. They may be derived from fewer durable facts, but a downstream layer may not add a new semantic state, recovery category or precedence rule merely because the implementation needs a convenient label.

### 3.8 Workflow rail as canonical lifecycle projection

The workflow rail is the persistent orientation projection of this state language. It is not another state machine and never owns mutation eligibility.

For each of the nine lifecycle stages it presents:

- the exact stage identity;
- reach state: CURRENT, REACHED/HISTORICAL or UNREACHED;
- whether the operator has selected that stage for inspection;
- for the **current** stage only, one summary marker derived from the closed state language:
  - **READY** — current owner is coherent and no higher-priority processing/attention condition exists;
  - **PROCESSING** — provider/automatic workflow work is actively progressing;
  - **ACTION REQUIRED** — exact human input, proposal decision or another current operator action owns attention;
  - **BLOCKED** — the current owner is blocked and requires governed recovery;
  - **STALE** — current authority/package is not current and must be reconciled/returned before progression;
  - **COMPLETE** — the WorkItem is terminally complete.

The rail summary never replaces the detailed owning material. It gives continuous lifecycle orientation while the current-attention surface explains the exact cause and action.

Historical and unreached cells do not acquire pseudo-current blocker/processing markers from old Runs or artifacts.

## 4. Global workflow invariants

### 4.1 Reads are observational

Opening or refreshing any of the following is non-mutating:

- WorkItem;
- source document;
- lifecycle document;
- current lifecycle material;
- Run;
- RunEvents;
- proposal;
- readiness material;
- sign-off package;
- execution task;
- evidence;
- terminal result;
- Context or Technical details.

A read may report that reconciliation is required. It must not secretly perform a lifecycle transition and then report the read as failed.

Where repository or authority drift must change canonical workflow ownership, that change occurs through a distinct canonical reconciliation/transition path and becomes observable as workflow state.

### 4.2 Command outcome is atomic from the operator's perspective

A consequential operator command has one comprehensible outcome.

**Accepted:** the command is applied and the resulting canonical workflow state is returned or becomes immediately observable.

**Rejected:** the requested command is not applied and the Workbench does not pretend the old state remains current if some separate canonical transition occurred.

The UI must never report only "action failed" when the daemon has already changed the WorkItem stage or status as part of that command.

### 4.3 One self-consistent current observation

Action eligibility must be derived from one self-consistent canonical workflow observation.

The Workbench must not combine:

- an old WorkItem stage;
- a new Run status;
- old source diagnostics;
- a new blocker;
- old approval material;
- new execution state

and then present actions from that mixed snapshot.

After asynchronous activity changes canonical state, the browser must converge to the new WorkItem/Run/attention state before exposing a contradictory next action.

### 4.4 One active workflow mutation owner

For one WorkItem, Order must prevent competing mutations that would produce ambiguous authority or context.

Examples that require serialization include:

- starting a Run;
- submitting Run input;
- cancelling a Run;
- adopting/rejecting a proposal;
- saving source/lifecycle authority;
- reconciling authority drift;
- signing off;
- resuming a blocker;
- starting/advancing execution.

Inspection remains available while mutation is pending.

### 4.5 Current attention cannot be hidden by historical selection

Historical inspection is always allowed when safe.

However, if current work requires human action, the Workbench must preserve a visible current-attention signal and a direct return to the owning current material.

Selecting an old Run or old document cannot remove awareness of:

- a current required question;
- a current blocking proposal;
- a current blocker;
- a current stale-approval condition;
- a current execution failure.

### 4.6 Failed/blocked work retains explicit ownership

A blocker or failure identifies its owning workflow stage/task and its permitted recovery.

The Workbench never substitutes a generic Resume button where canonical state identifies a more specific recovery.

## 5. Interactive messaging contract

### 5.1 Serialized conversation

A single interactive Run is a serialized sequence:

~~~text
operator or system trigger
        |
        v
provider turn processing
        |
        +--> terminal outcome
        |
        +--> required human input
        |
        +--> open for operator continuation
~~~

Two provider turns must never be concurrently active for the same Run.

### 5.2 Composer behavior

The composer is part of the selected current Run material.

- **Processing:** composer may remain visually present for continuity, but Send is unavailable and the state plainly says that Order is processing the current turn.
- **Open for continuation:** composer accepts one free-form operator continuation.
- **Required input:** composer is focused on the unresolved request and submission is bound to that request.
- **Closed/historical:** composer is absent or read-only.

The browser must not use a coarse Run status alone to decide whether Send is allowed.

### 5.3 Required-input identity

A required-input request has exact current ownership.

A response to required input must:

- identify the unresolved request it answers;
- be accepted at most once;
- be rejected if the request is already resolved, stale or no longer current;
- not be accepted as an unbound free-form message while the Run is waiting for that request.

A stale browser tab cannot answer an old request a second time.

### 5.4 Conversation durability boundary

Conversation is not durable product authority merely because it is persisted.

When an operator decision materially changes source, requirements, design or plan authority, downstream progression relies only on the corresponding canonical authority update and conformance path.

The UI must clearly distinguish:

- conversational clarification;
- canonical authority mutation.

## 6. Proposal contract

### 6.1 Proposal ownership

A proposal is owned by the Run that created it.

A lifecycle-document proposal may target only the lifecycle role owned by that Run's stage.

A Run must not use proposal adoption to skip lifecycle stages or rewrite an unrelated lifecycle stage.

Non-lifecycle/project-authority proposal capability, where permitted by other canonical concerns, remains governed by that authority and must not be represented as a lifecycle-role shortcut.

### 6.2 Adoption does not confer progression

Adopting a lifecycle proposal changes the proposed authority bytes through the canonical mutation path.

It does not by itself:

- prove conformance;
- complete the stage;
- advance the lifecycle;
- authorize implementation.

Normal stage conformance remains required.

### 6.3 Proposal decision and active Run

Proposal review is Review-class material inside the owning workflow step.

The operator can inspect the full proposal while preserving the Run context. If the Run remains conversationally open, the proposal review does not create a second competing lifecycle context.

Adopt/Reject is serialized with other canonical mutations.

While a lifecycle proposal is pending, proposal disposition owns the current mutation action. The free-form continuation composer is unavailable until that proposal is adopted or rejected; the Run may remain canonically OPEN, but the Workbench does not present proposal disposition and free-form continuation as competing current actions.

## 7. Direct document editing contract

### 7.1 Editing versus saving

A browser-local editor buffer may exist while other material is being inspected.

A canonical Save is a workflow mutation.

### 7.2 Active-Run exclusion

Order must not canonically save source or lifecycle authority while a Run for that WorkItem is actively processing or waiting for operator input.

The Workbench may allow local drafting, but Save must be unavailable with a specific explanation until the Run is closed/cancelled or canonical policy otherwise releases the mutation boundary.

This prevents a later-stage Run from remaining active against authority that has just been moved upstream.

### 7.3 Upstream edit consequence

Saving an already-reached upstream source/lifecycle document may invalidate downstream conformance.

Before Save, the Workbench must tell the operator that the save can return workflow ownership upstream and make downstream material historical/stale.

After Save, the Workbench must orient to the resulting canonical owner and preserve the prior downstream history for inspection.

### 7.4 Signed/execution boundary

Once the WorkItem is in Implementation or Complete, signed lifecycle authority remains inspection-only in that state.

Changing it requires the governed upstream return path, not an in-place historical edit.

## 8. Source and reconciliation behavior

Source diagnostics are canonical workflow-relevant state.

A source condition that prevents stage work prevents the corresponding Start action in the UI. The UI must not offer Start and rely on a later server error as the normal eligibility mechanism.

Source refresh/reconciliation is an explicit operation.

Reading the source is never used as an implicit reconciliation command.

When reconciliation changes current lifecycle ownership, the resulting state is shown as a canonical transition with an intelligible reason.

## 9. Readiness and approval behavior

### 9.1 Readiness

Readiness is an adversarial review of the exact current package.

A Readiness return identifies:

- the defective/owning upstream stage;
- why the package is not ready;
- the relevant finding/evidence;
- what must happen next.

Returning to an upstream stage does not erase Readiness history.

### 9.2 Approval

Approval always judges one exact current package.

Loading or inspecting an approval package is non-mutating.

If the package is stale:

- the old package remains inspectable as historical material;
- it is not signable;
- the Workbench exposes the canonical return/reconciliation action or already-observed returned owner;
- the operator is never left on a broken Approval screen while the daemon has silently moved elsewhere.

### 9.3 Sign-off

Sign-off controls remain adjacent to the exact package being judged.

Hashes and identifiers remain secondary exactness detail. Package meaning, task scope, gates, exclusions and readiness evidence dominate the review surface.

## 10. Implementation behavior

Implementation is an operational master/detail workspace.

Current execution attention is selected by canonical execution state, not by whichever historical task the operator last clicked.

If any task currently blocks WorkItem progress:

- the blocker is visible at Implementation level;
- the owning task is identified;
- the direct recovery action opens/selects that task;
- an old selected completed task cannot hide the blocker.

Historical task/Run selection remains possible without changing current execution ownership.

A return from Implementation to an upstream stage preserves:

- prior Approval;
- signed tasks;
- execution attempts;
- validation history;
- blocker/reanalysis evidence

as reached historical material.

## 11. Workbench visual grammar

The Workbench is a dense productivity surface, not a dashboard and not a stack of cards.

The visual grammar is:

~~~text
application toolbar
work-item identity row
workflow rail
primary task surface
optional on-demand context
~~~

No other persistent outer navigation layer is permitted.

### 11.1 Stable geometry invariant

Canonical state changes may change content and enabled actions. They must not cause arbitrary structural movement.

The following are prohibited:

- a permanent side rail appearing merely because a second attempt or document exists;
- a side rail disappearing when the collection shrinks to one item;
- navigation width changing because a status badge or action label appeared;
- current-step styling changing workflow-cell width;
- metadata rows being inserted above the task and shifting the entire workspace for incidental state;
- auto-opening Context because a diagnostic appeared.

A layout region may change only when the operator intentionally opens/closes a secondary surface or when the viewport crosses a responsive layout class.

### 11.2 WorkItem identity row

The identity row is one compact stable-height row.

It contains only:

- Back to queue;
- WorkItem title/identity;
- concise overall status where necessary;
- true WorkItem-level utilities.

It does not contain:

- workflow-step navigation;
- task-local Start/Retry/Resume;
- document controls;
- hashes;
- paths;
- project/schema dumps;
- Run technical details.

Long titles truncate rather than change row height.

### 11.3 Workflow rail

The workflow rail is the single persistent lifecycle navigation control.

On wide workbench layouts it uses stable step cells across the available rail. The current/reached/unreached visual state must not change cell width.

The rail shows ordinary-language stages:

- Work request;
- Research;
- Requirements;
- Solution design;
- Implementation plan;
- Readiness review;
- Approval;
- Implementation;
- Complete.

Step selection is non-mutating inspection.

On constrained widths the same rail may become horizontally scrollable or compact, but individual step geometry remains predictable and the rail does not become a wrapping multi-row navigation block.

### 11.4 No conditional pre-signoff side rail

Research, Requirements, Solution design and Implementation plan do **not** gain a permanent left navigation rail based on the number of attempts/documents.

Attempt history and material selection use one compact step-local selector/control treatment that does not change the primary canvas width when the second object appears.

Supporting Work request/upstream documents are secondary context. They do not precede the current blocker, required input, proposal decision, active dialogue or current governed document in the primary reading order.

Provider/runtime mechanics such as OpenCode session identity/status are technical detail unless a provider failure is itself the current blocker; the ordinary primary surface uses user-facing workflow state such as Processing, Waiting for you, Failed or Blocked rather than provider-plumbing headings.

This is a binding stability and information-hierarchy requirement.

### 11.5 Master/detail is reserved for real master/detail work

A persistent master column is appropriate only when the interaction is canonically classified as **Operational master/detail**. In the current Workbench that means **Implementation**.

Approval remains Review-class regardless of task/material count. Large Approval collections use scan-efficient rows/tables inside the Review surface; collection size never changes Approval into another primary interaction class.

A future interaction may use persistent master/detail only after this functional owner explicitly classifies it as Operational master/detail.

When used:

- its width is stable for the lifetime of that workspace state;
- adding/removing collection rows does not change the column width;
- the detail pane owns remaining width;
- the master does not duplicate the workflow rail.

### 11.6 Context

Context is secondary and closed by default.

Opening Context is an explicit operator action. Once open, Context always provides an explicit close/toggle action in a predictable location; navigating away from the selected material is never required merely to recover primary width.

On **wide** layouts Context is one bounded fixed-width trailing inspector that participates in the Workbench layout. On **medium and narrow** layouts Context is an overlay drawer. The responsive class alone selects those representations; content amount, current workflow state and feature-local usability judgments do not switch between them.

Context never auto-opens or auto-closes because workflow state changes.

Context contains compact metadata and secondary diagnostics only. It cannot become the sole location of the current blocker or required action.

### 11.7 Canonical visual character

Order is a focused, dense professional work surface. It is visually **flat, calm, precise and information-forward**.

The visual character follows the product identity owned by `GW-DOC-PRODUCT-IDENTITY-V1`: deep navy / Order blue is the brand and interaction accent, while the Workbench itself is predominantly neutral so the current task, current action and exceptional state remain visually obvious.

The Workbench does not use:

- decorative dashboard cards;
- gradients or decorative brand effects in task surfaces;
- arbitrary per-feature accent colors;
- large empty hero regions inside productive work;
- persistent elevation/shadow to create hierarchy that should be expressed structurally;
- badges/chips as a substitute for ordinary readable labels.

Persistent surfaces are separated primarily by spacing, 1px boundaries and information hierarchy. Elevation is reserved for temporary overlays.

### 11.8 Semantic color behavior

Color communicates a small semantic vocabulary only:

- **accent / current / selected** — Order blue;
- **information / processing** — blue-family informational treatment;
- **success / complete / ready** — green;
- **warning / waiting / stale / attention required** — amber;
- **danger / failed / blocked / destructive** — red;
- **neutral / historical / secondary / technical** — neutral foreground and surface tones.

Color is never the sole carrier of state. Every state that affects workflow meaning has readable text and, where useful, an icon or structural marker.

Feature/service code does not invent another semantic color or use raw palette values to imply domain meaning.

### 11.9 Typography and density

The Workbench uses one sans-serif application type system and one monospace technical/code type system.

Typography expresses role rather than decoration:

- application/work-item title;
- section/material heading;
- normal body/control text;
- secondary/caption text;
- technical/code identity.

The default productive UI is compact. Normal labels, controls, rows and supporting text do not grow independently by feature. Long identity values truncate or wrap within their designated technical region rather than forcing structural expansion.

### 11.10 Controls, forms and operational scanning

Equivalent interactions look and behave the same everywhere.

- primary, secondary, destructive and ghost **commands** use one action grammar; one view has at most one visually primary command;
- commands use specific action labels; pure navigation uses link/navigation semantics rather than masquerading as a command button;
- icon-only commands retain an accessible name and visible-tooltip equivalent;
- form fields use one label/help/error grammar, with labels remaining available to assistive technology even when visually hidden;
- disabled controls remain understandable: where the reason matters, it is available with the disabled control rather than hidden in unrelated copy;
- semantic status uses one status grammar and ordinary/default state is not repeatedly promoted into attention-grabbing badges;
- inline information/warning/error/success feedback uses one notice grammar; persistent actionable failure remains visible until resolved and asynchronous status is announced once rather than duplicated across live regions;
- operational collections use one dense row/table grammar rather than card stacks;
- chronological events use one timeline grammar;
- transient task forms use one operator-opened task-panel grammar;
- Settings uses one configuration layout and field grammar;
- fixed peer-view choices may use one compact segmented/tab treatment but never create a second navigation hierarchy.

A service-specific form, table, status badge, notice, timeline or drawer treatment is non-compliant when the same interaction already exists in the canonical UI language.

The selected underlying control/container pattern must also match the interaction: a destructive irreversible decision is confirmation, a bounded form/task is a task/dialog surface, contextual side detail is Context/inspector behavior, and a docked operational region is not represented as a floating overlay merely for convenience.

### 11.11 Theme, focus and motion consistency

Light, dark and system theme preferences preserve the same information hierarchy and semantic status meaning. A feature cannot define its own light/dark palette.

Keyboard focus is always visibly distinguishable from selection/current state. Reduced-motion preference is respected; motion is functional and brief rather than decorative.

The same component/service retains semantic identity across responsive classes. Responsive recomposition may change representation but not styling vocabulary, action priority or state meaning.

### 11.12 Unified component presentation

The Workbench has one component design language across the complete application, not one style per feature.

When two controls/materials have the same semantic role, they have the same recognizable presentation regardless of whether they appear in Queue, Create, Settings, Source/Document, Dialogue, Review, Implementation, Evidence, Result or Context.

This applies to at least:

- primary / secondary / ghost / destructive actions;
- fields, labels, help, validation and disabled-state explanation;
- current/selected/reached/unreached navigation state;
- neutral/info/success/warning/danger status;
- inline notices and blocking feedback;
- tables/resource rows and selection;
- section/material headings;
- disclosures and technical detail;
- confirmations/task panels/temporary overlays;
- Markdown, code/evidence and exact-source editing surfaces.

Feature identity comes from content and workflow context, not from locally invented chrome, colors, radii, type sizes, spacing or control treatments.

A component may have a different structural composition because its interaction class differs. It may not acquire a different visual language merely because it belongs to another feature.

### 11.13 Global theme behavior

Theme preference is application-global and has exactly three operator choices:

- **System** — follows the browser/operating-system color-scheme preference;
- **Light** — uses the canonical light theme;
- **Dark** — uses the canonical dark theme.

Changing theme:

- applies to the complete rendered application, including foundation components, Order primitives, overlays, Markdown, code/evidence and source editor;
- does not change workflow state, selected material, dirty editor buffer, navigation, component hierarchy or geometry;
- does not require a page reload;
- preserves semantic meaning: current remains current, warning remains warning, danger remains danger, and action priority does not change;
- never creates a feature-local theme island.

The selected Light/Dark preference may be remembered as browser-local presentation preference. System is the default when no explicit preference is available. Failure to persist the preference does not change the live selected theme or any workflow state.

Every semantic role required to operate the Workbench must remain readable and distinguishable in both canonical light and dark themes; color alone is never the only carrier of meaning.

## 12. Information hierarchy

Every visible item belongs to one of three levels.

### 12.1 Primary

Primary information is necessary to understand or perform the current task.

Examples:

- source/lifecycle document being authored;
- active conversation;
- proposal diff;
- readiness findings;
- sign-off task scope;
- current execution task and blocker;
- terminal result.

### 12.2 Secondary

Secondary information supports the current task without dominating it.

Examples:

- attempt selection;
- supporting upstream document;
- evidence/resource links;
- compact source status;
- current document Git state.

### 12.3 Technical

Technical information is exact implementation/audit identity that ordinary operation does not require.

Examples:

- UUIDs;
- SHA-256 values;
- commit ids;
- context hashes;
- provider session ids;
- raw RunEvent tags/payloads;
- raw paths where ordinary labels suffice.

Technical information is available on demand and does not occupy persistent premium space.

## 13. Interaction-space classes

Order uses a small closed set of interaction classes.

| Class | Primary use | Functional geometry |
|---|---|---|
| Operational scan | queue, task master | dense table/list |
| Form / configuration | Create WorkItem, Settings and bounded configuration tasks | explicit field hierarchy + action region; no card dashboard |
| Document | Work request, R1/R2/DESIGN/PLAN | wide primary authoring/reading surface |
| Dialogue | active pre-signoff Run | remaining-height conversation with anchored composer |
| Review | proposal, readiness, approval | wide comparison/judgment surface |
| Operational master/detail | implementation | stable master + flexible detail |
| Evidence | logs, patches, exact bytes | wide remaining-height raw viewer |
| Terminal result | final outcome | concise classification + substantive result/evidence |
| Compact context | metadata/small utilities | bounded inspector/drawer |
| Task panel | short-lived creation/configuration task | operator-opened modal task/dialog surface containing exactly one Form/configuration composition |
| Safety/exception | conflict/confirmation | inline owning-state or modal confirmation |

A screen does not invent a new card/panel grammar merely because its content is unique.

The set is closed for WorkItem Workbench screen construction:

- **primary interaction classes:** Operational scan, Form/configuration, Document, Dialogue, Review, Operational master/detail, Evidence and Terminal result;
- **auxiliary interaction classes:** Compact context, Task panel and Safety/exception.

Every rendered Order Workbench service has exactly one primary interaction class. A Task panel hosts exactly one bounded primary Form/configuration composition. Other auxiliary classes may appear only in support of the owning primary interaction and never become an independent persistent navigation/layout axis. A feature whose required behavior cannot be expressed by these classes returns to DESIGN and amends this canonical owner before implementation; implementation does not create a new geometry or interaction grammar by convenience.

## 14. Per-step screen contract

### 14.1 Work request

**Primary:** source Markdown.

**Current attention:** source invalidity, stale/conflict state or readiness to begin Research.

**Primary action:** Save/Cancel while editing; otherwise Start Research only when canonically eligible.

Source diagnostics that block progress are shown with the source. Exact path/hash/schema information is Technical detail.

No Run-history rail exists here.

### 14.2 Research

**Primary while provider turn is processing/open/awaiting input:** dialogue.

**Primary when proposal selected:** proposal review.

**Primary when document selected and no more urgent current interaction owns attention:** Research document.

Attempt/document selection is compact and does not alter canvas width.

Current required input, proposal or blocker remains visible even while historical Research material is inspected.

### 14.3 Requirements

Uses the same stable pre-signoff grammar as Research.

Supporting Research/source authority is inspectable without creating another permanent navigation system.

Requirements acceptance criteria, scope, exclusions and failure semantics dominate the document surface; technical artifact identity does not.

### 14.4 Solution design

Uses the same stable pre-signoff grammar.

The Solution design document owns broad document space. Architecture/code/diagram-like material may use the full content width rather than a prose-page cap.

Authority references are secondary until selected.

### 14.5 Implementation plan

Uses the same stable pre-signoff grammar.

The Plan document is primary authority. Structured task/change-surface summaries may be shown as derived inspection, but never as a second plan authority.

### 14.6 Readiness review

Readiness is Review-class first, not generic dialogue first.

Primary hierarchy:

1. verdict/current readiness state;
2. findings and defective owner;
3. package material required to understand the verdict;
4. evidence;
5. Run history.

If a legitimate required-input request exists, the current Run interaction temporarily becomes the required current task without turning all Readiness into a chat screen.

R3 material is read-only.

Readiness does not default to a persistent master/navigation column. Package material, attempts and evidence use a compact subordinate selector unless the interaction is explicitly reclassified as genuine master/detail.

### 14.7 Approval

Approval is one coherent Review workspace.

Primary hierarchy:

1. package currentness and readiness;
2. signed task meaning/scope/gates;
3. governed documents needed for judgment;
4. approver identity and Sign off exact package;
5. technical package hashes/commit identity.

Repeated signed tasks use scan-efficient rows/tables **inside the same Review surface**. Approval never becomes persistent master/detail based on task/material count and does not become a vertical stack of cards.

Approval does not default to a generic persistent package/document/task navigation rail. Technical package hashes/commit identity are collapsed/on-demand secondary detail and may not displace package currentness, task meaning or the sign-off decision from the primary review hierarchy.

### 14.8 Implementation

Implementation is stable operational master/detail.

The task master is persistent for the Implementation workspace and does not change width based on task state or row count.

The selected detail shows:

- objective/scope;
- current task state;
- current Run/attempt;
- current blocker or next action;
- validation state, emphasizing the current/recorded validation boundary rather than filling the primary surface with unreached empty validation rows;
- chronological events;
- evidence/resources.

Current blocker ownership overrides stale selection for attention while still preserving historical inspection.

### 14.9 Complete

Complete presents the final governed outcome first.

Prior reached steps remain inspectable from the workflow rail.

Investigation/audit remediation action appears only where canonically permitted and remains attached to the terminal result.

## 15. Current-attention/action precedence

Observation coherence is evaluated first. While the canonical observation is `CONVERGING`, mutation controls are suppressed and the Workbench presents updating/processing continuity rather than guessing the missing reaction.

For a coherent observation, the Workbench resolves current attention using this precedence:

1. mutation conflict that prevents safe continuation;
2. unresolved required human input;
3. pending proposal decision required for progress;
4. proposal adoption/reconciliation already in progress;
5. current canonical blocker or governed recovery owner;
6. stale approval/readiness/material ownership;
7. current active processing/automatic-recovery state;
8. current startable/continuable/sign-off action;
9. ordinary current document/review/operational material;
10. historical operator selection.

Only the highest-precedence mutation action is presented as the current workflow action. In particular, a failed current-stage Run exposes its governed Retry/Resume/recovery action and suppresses the generic Start action; a pending lifecycle proposal exposes Adopt/Reject and suppresses free-form continuation; an adoption already in progress exposes no competing Reject/continuation action.

Historical selection may remain displayed, but levels 1–8 must remain visible and directly reachable.

## 16. Async state convergence

Order may perform provider work asynchronously.

The Workbench must therefore treat asynchronous completion as a first-class workflow transition.

When an asynchronous Run:

- completes a stage;
- blocks;
- fails;
- requests input;
- returns upstream;
- terminalizes the WorkItem

the browser must refresh/reconcile the complete current workflow observation before showing the next primary action.

The operator must not need to reload the page to discover that the WorkItem already changed stage.

Final RunEvents must remain fetchable after terminalization. Polling/refresh behavior must not stop in a way that loses the last persisted completion/failure/conformance events from the visible timeline.

## 17. Mutation feedback

Every consequential mutation has local pending, success and failure behavior.

While pending:

- duplicate submission is prevented;
- the owning material remains visible;
- unrelated navigation that would make the result incomprehensible is constrained where necessary.

On success:

- canonical current state is refreshed as one coherent observation;
- orientation follows the resulting current owner;
- history/return origin is preserved where relevant.

On rejection:

- the owning material remains visible;
- the reason is human-readable;
- any separately observed canonical state change is reflected immediately rather than hidden behind the error.

Toast-only failure is prohibited for workflow-critical feedback.

## 18. Responsive behavior

Responsive changes preserve the same semantic hierarchy.

### Wide

- one-line application toolbar;
- one-line identity;
- one-line workflow rail;
- full primary task width;
- optional explicit Context;
- persistent master only for genuine master/detail classes.

### Medium

Secondary selectors/context become temporary before the primary task is compressed below its useful space class.

### Narrow

One primary material at a time.

Application-global utilities collapse to a compact, non-wrapping treatment before they are allowed to consume additional Workbench rows; global account/settings/theme controls must not displace the WorkItem identity or current action.

The workflow rail remains the lifecycle navigation owner and may scroll horizontally.

Task-local controls remain attached to their material.

Responsive recomposition must preserve:

- selected workflow step;
- selected Run/task/document/evidence;
- current attention;
- unsaved buffer;
- return origin.

A breakpoint change alone must not discard user work or trigger a workflow mutation.

## 19. Accessibility and focus

The Workbench must remain keyboard-operable.

Important requirements:

- current workflow step uses semantic current-state indication;
- reached/unreached state is not conveyed by color alone;
- required-input focus moves to the relevant composer without stealing focus repeatedly during polling;
- blocker/recovery feedback is announced appropriately;
- temporary drawers/dialogs restore focus to their invoking control;
- historical navigation does not cause unexpected workflow mutation;
- disabled current actions expose the blocking reason rather than relying on visual disablement alone.

## 20. Explicitly prohibited behavior

The following are non-compliant:

1. deriving reached/unreached solely from current stage ordinal;
2. using Run RUNNING as synonymous with "accepts operator message";
3. accepting two simultaneous provider turns for one Run;
4. answering the same required-input request more than once;
5. accepting an unbound free-form answer while one exact required input owns the Run;
6. mutating workflow state during GET/read operations;
7. returning an operation error while leaving an unreported lifecycle mutation behind;
8. allowing a lifecycle proposal to target a different lifecycle stage than its owning Run;
9. treating proposal adoption as stage completion;
10. saving authority while a WorkItem Run is active;
11. hiding current blockers because historical material is selected;
12. offering Start while a canonical source blocker makes Start invalid;
13. losing final persisted RunEvents because polling stopped at terminalization;
14. requiring manual page reload to observe an asynchronous stage transition;
15. making Approval package inspection itself move the WorkItem;
16. conditionally inserting/removing a persistent pre-signoff side rail based on item count;
17. changing workflow-cell width because current/status styling changes;
18. stacking equal-weight cards/panels for primary and secondary information;
19. exposing hashes/ids/paths as dominant persistent content;
20. placing the only blocker/recovery action inside Context or Technical details;
21. auto-opening Context or another rail because state changed;
22. allowing stale/historical task selection to hide the current execution blocker.

## 21. Functional state-transition model

The Workbench presents one governed workflow whose functional state has several orthogonal observable dimensions. This subsection closes the event-to-state behavior that P4/P6 must realize.

The dimensions below are **not** a new DTO, persistence object or browser-owned aggregate. They are a functional proof model over canonical Order facts:

```text
current lifecycle position
+ WorkItem operational status/outcome
+ per-stage reach state
+ current STAGE interaction condition
+ current proposal-decision condition
+ material/package currentness
+ current execution owner + validation boundary, when in Implementation
+ governed recovery route
+ observation coherence
+ current attention
= one coherent operator-visible workflow condition
```

The canonical cross-step lifecycle transition relation is owned by `GW-DOC-WORK-LIFECYCLE-V1 §2.1-§2.3`. This section owns the Workbench consequence inside and around those transitions.

### 21.1 Pre-signoff step interaction statechart

Research, Requirements, Solution design and Implementation plan use the same interaction statechart. Readiness uses the same Run interaction semantics when an actual Run/input interaction exists, while retaining its Review-class presentation hierarchy.

```text
                         Start current stage Run
        +--------------------------------------------------+
        |                                                  v
+------------------+                                 +-------------+
| READY / NO       |                                 | PROCESSING  |
| ACTIVE RUN       |                                 | provider    |
+------------------+                                 | turn active |
        ^                                             +------+------+ 
        |                                                    |
        |                                                    | turn settles with no
        |                                                    | controlling event
        |                                                    v
        |                                             +-------------+
        |                              free-form input | OPEN FOR    |
        |                         +--------------------+ CONTINUATION|
        |                         |                    +------+------+ 
        |                         |                           |
        |                         |                           | current proposal
        |                         |                           | Adopt / Reject
        |                         |                           v
        |                         |                    +-------------+
        |                         +--------------------| OPEN FOR    |
        |                                              | CONTINUATION|
        |                                              +-------------+
        |
        |                  exact answer
        |              +------------------+
        |              |                  v
        |       +------+--------+      +-------------+
        |       | REQUIRED      |      | PROCESSING  |
        |       | HUMAN INPUT   |      +-------------+
        |       +---------------+
        |
        | explicit Resume after blocker resolved
        |
+-------+----------+       provider/invocation failure       +-------------+
| BLOCKED          |<----------------------------------------| PROCESSING  |
| same stage       |   only when failure class is blocker    +-------------+
+------------------+                                          |
                                                              | provider failure
                                                              v
                                                        +-------------+
                                                        | FAILED RUN  |
                                                        | same stage  |
                                                        +------+------+
                                                               |
                                                               | Start a new Run if
                                                               | still eligible
                                                               +-------------> PROCESSING

PROCESSING -- HUMAN_INPUT_REQUESTED --> REQUIRED HUMAN INPUT
PROCESSING -- STAGE_BLOCKED ---------> BLOCKED / same lifecycle stage
PROCESSING -- STAGE_COMPLETED -------> canonical cross-step transition
PROCESSING -- Cancel ----------------> CANCELLED Run / same stage
OPEN       -- Cancel ----------------> CANCELLED Run / same stage
REQUIRED   -- Cancel ----------------> CANCELLED Run / same stage
```

`FAILED` and `CANCELLED` above are terminal conditions of the prior Run, not new WorkItem lifecycle stages. If the WorkItem remains ACTIVE and the stage is still current, a retry is a new Run with normal admission and a fresh turn.

### 21.2 Provider-turn closure law

Each STAGE provider turn has exactly one controlling outcome.

| Controlling outcome | Required provider/coordinator fact | Resulting interaction condition |
|---|---|---|
| open continuation | no required-input, block or completion control event | OPEN FOR CONTINUATION |
| required input | exactly one `HUMAN_INPUT_REQUESTED` | REQUIRED HUMAN INPUT |
| stage blocked | exactly one `STAGE_BLOCKED` | Run terminal BLOCKED; WorkItem remains at same stage / BLOCKED |
| stage completed | exactly one `STAGE_COMPLETED` whose stage equals the Run stage | Run closes and the canonical cross-step lifecycle transition is applied |
| provider/invocation failure | coordinator-owned failure classification | Run terminal FAILED; same lifecycle stage unless the failure separately owns a canonical blocker/return |

The following combinations are invalid and must be rejected rather than resolved by priority:

- more than one `HUMAN_INPUT_REQUESTED` in one provider turn;
- `HUMAN_INPUT_REQUESTED` together with `STAGE_BLOCKED`;
- `HUMAN_INPUT_REQUESTED` together with `STAGE_COMPLETED`;
- `STAGE_BLOCKED` together with `STAGE_COMPLETED`;
- more than one `STAGE_COMPLETED`;
- more than one `STAGE_BLOCKED`.

A lifecycle `ARTIFACT_PROPOSAL_CREATED` is not itself a controlling outcome. To avoid competing attention/authority states:

- a provider turn may create at most one lifecycle proposal;
- a Run may have at most one unresolved lifecycle proposal at a time;
- a turn that creates a lifecycle proposal must otherwise end OPEN FOR CONTINUATION;
- lifecycle proposal creation cannot coexist in the same turn with required input, stage block or stage completion.

Messages, evidence and observations may accompany a valid controlling outcome where their own contracts permit; they do not select workflow state.

### 21.3 Required-input statechart

Required input has exact identity.

```text
OPEN/PROCESSING
      |
      | one HUMAN_INPUT_REQUESTED event Q
      v
REQUIRED INPUT(Q)
      |
      +-- answer(requestEventId = Q) --> PROCESSING
      |
      +-- answer(null) ----------------> REJECT / unchanged
      |
      +-- answer(other/stale Q) -------> REJECT / unchanged
      |
      +-- duplicate answer(Q) ---------> REJECT / unchanged
      |
      +-- Cancel ----------------------> CANCELLED Run / same stage
```

There is exactly one unresolved required-input owner for a Run. Once its bound answer is accepted, the request is resolved before the next provider turn begins.

### 21.4 Proposal decision statechart

Lifecycle proposal review is a subordinate attention state of an OPEN current-stage Run.

```text
OPEN FOR CONTINUATION
        |
        | one lifecycle proposal P
        v
OPEN + PROPOSAL PENDING(P)
        |
        +-- Reject(P) --------------------> OPEN / authority unchanged
        |
        +-- Adopt(P)
                |
                | durable adoption intent recorded
                v
OPEN + ADOPTION IN PROGRESS(P)
        |
        +-- exact patch applied/reconciled
        |   + disposition persisted ------> OPEN / canonical bytes changed
        |                                  same lifecycle stage
        |                                  downstream conformance invalidated
        |                                  context must be re-resolved
        |
        +-- restart/interruption ----------> same ADOPTION IN PROGRESS(P)
                                            until the exact durable intent is
                                            reconciled or explicitly failed
```

While `ADOPTION_IN_PROGRESS(P)` exists, Reject and free-form continuation are unavailable. The operator sees that the exact accepted proposal is being applied/reconciled; Order does not fall back to PENDING or OPEN merely because the repository effect crossed a process boundary.

Adopt/Reject is serialized with every other WorkItem mutation. A proposal from a historical/non-current stage cannot become a shortcut back into lifecycle authority.

### 21.5 Approval statechart

Approval inspection is observational.

```text
AWAITING_SIGNOFF / CURRENT PACKAGE
        |
        +-- inspect/read/refresh ------------------------------> same state
        |
        +-- package becomes observably stale -----------------> AWAITING_SIGNOFF / STALE
        |                                                       sign-off unavailable
        |
        +-- explicit upstream authority mutation/reconcile ---> canonical upstream owner
        |
        +-- Sign off exact current package -------------------> EXECUTION / ACTIVE

AWAITING_SIGNOFF / STALE
        |
        +-- inspect/read/refresh ------------------------------> same state
        |
        +-- Sign off ------------------------------------------> REJECT / unchanged
        |
        +-- explicit reconciliation/authority correction -----> canonical upstream owner
```

A GET/read may compute and expose stale currentness; it does not perform the upstream return.

### 21.6 Implementation step statechart

Implementation has one canonical current execution owner regardless of historical UI selection.

```text
EXECUTION / ACTIVE
      |
      | atomically select one eligible TODO task
      | + create its required Run
      v
CURRENT TASK RUNNING
      |
      +-- bounded repair/review continuation -----------------> CURRENT TASK RUNNING
      |
      +-- task CANDIDATE_DONE / ALREADY_SATISFIED
      |       |
      |       +-- more eligible/incomplete tasks -------------> EXECUTION / ACTIVE
      |       |
      |       +-- all approved tasks successful -------------> COMPLETE / COMPLETE
      |
      +-- operational/precondition/environment blocker ------> EXECUTION / BLOCKED
      |
      +-- cancellation ---------------------------------------> EXECUTION / BLOCKED
      |
      +-- classified semantic return -------------------------> canonical upstream owner
                                                               R1/R2/DESIGN/PLAN/R3

EXECUTION / BLOCKED
      |
      +-- inspect historical/current task evidence -----------> same state
      |
      +-- Resume with blocker resolved + approval current ----> EXECUTION / ACTIVE
                                                               blocked task becomes eligible
```

The classified upstream-return mapping is owned by `GW-DOC-WORK-LIFECYCLE-V1 §2.2` together with `GW-DOC-VALIDATION-STANDARD-V1`. Historical task/Run selection never changes the current execution owner.

### 21.7 Read, selection and rejected-command law

These operations never change canonical workflow state:

- selecting a workflow step;
- selecting historical Run/task/document/evidence material;
- opening/closing Context;
- changing responsive viewport/layout;
- GET/read/refresh of any work material;
- a rejected command;
- a stale or duplicate required-input submission;
- a rejected proposal disposition;
- a failed stale-hash document save before bytes are written.

An accepted mutation changes only the states explicitly admitted by the functional transition models. There is no implicit fallback transition.

### 21.8 Reach-history transition rule

For every accepted cross-step transition:

```text
newCurrentStage := transition(currentStage, acceptedEvent)
reachedHistory  := reachedHistory U { newCurrentStage }
```

For every within-step interaction transition, blocker/resume, retry, failed command or historical selection:

```text
reachedHistory := unchanged
```

Therefore the Workbench can prove CURRENT / REACHED-HISTORICAL / UNREACHED without using current-stage ordinal comparison.

### 21.9 Closed current-attention and recovery language

Exactly one current-attention category is selected from this ordered set:

1. **CONVERGING** — canonical dependent observations have not yet converged after a controlling transition; mutation actions are suppressed.
2. **MUTATION_CONFLICT** — a current optimistic-concurrency/reconciliation conflict prevents safe continuation.
3. **REQUIRED_INPUT** — one exact unresolved human-input request owns the next response.
4. **PROPOSAL_DECISION** — one exact proposal awaits Adopt/Reject.
5. **PROPOSAL_ADOPTION** — durable adoption intent exists and the exact proposal is being applied/reconciled.
6. **BLOCKER** — a canonical current-stage/task blocker owns recovery.
7. **RECOVERY** — a retryable current failure or other governed recovery route owns the next action.
8. **STALE_AUTHORITY** — approval/material currentness is stale and progression is unavailable.
9. **PROCESSING** — provider/automatic work is progressing and no higher category owns attention.
10. **ACTIONABLE** — the current coherent owner exposes its ordinary Start/Continue/Sign-off/Resume-class action.
11. **ORDINARY** — current material is inspectable with no workflow action requiring emphasis.

A lower category never exposes a competing primary mutation action while a higher category applies.

Recovery is likewise closed. A current failure/block/currentness condition resolves to exactly one of:

- `NONE`;
- `RETRY_CURRENT_STAGE`;
- `RESUME_CURRENT_OWNER`;
- `RECONCILE_AUTHORITY`;
Automatic post-signoff replacement/remediation is not a Workbench recovery route. It remains governed by the execution policy; while it is running the Workbench observes canonical processing/Run state. A classified upstream return changes the canonical lifecycle owner and therefore does not remain as a separate recovery disposition.

A generic Resume/Retry button is not a substitute for deriving the exact recovery route.

### 21.10 Execution-state projection

Implementation has one current task owner and one durable validation boundary.

The Workbench derives:

- `NONE` when no task currently owns execution attention;
- `CURRENT_TASK(task)` for the current RUNNING/eligible execution owner;
- `BLOCKED_TASK(task)` when that exact task owns the aggregate blocker.

For the owning task/candidate, the latest durable validation projection is:

- `NONE` before a durable V0-V7 result exists;
- `PASSED_THROUGH(Vn)` after the highest contiguous current-candidate validation pass;
- `FAILED_AT(Vn, classification)` when a current validation failure owns remediation/return/block;
- `COMPLETE` only when the canonical candidate/task terminal result proves validation completion.

Builder/Reviewer/Remediator Run roles and validation RunEvents provide the canonical evidence. Historical task selection never changes the execution owner or validation boundary.

### 21.11 Workflow rail projection law

The workflow rail is a pure summary of canonical workflow state.

For each stage:

```text
reach :=
  stage == currentStage         ? CURRENT
  : canonical reached evidence  ? REACHED_HISTORICAL
  :                               UNREACHED
```

The current stage receives exactly one summary marker:

```text
WorkItem COMPLETE                           -> COMPLETE
current attention STALE_AUTHORITY                  -> STALE
current attention BLOCKER                          -> BLOCKED
current attention REQUIRED_INPUT
  or PROPOSAL_DECISION
  or MUTATION_CONFLICT
  or recovery RETRY_CURRENT_STAGE
  or recovery RESUME_CURRENT_OWNER
  or recovery RECONCILE_AUTHORITY                 -> ACTION_REQUIRED
current attention PROCESSING
  or PROPOSAL_ADOPTION
  or CONVERGING                                    -> PROCESSING
otherwise                                          -> READY
```

The detailed current-attention/recovery value remains owned by the primary material. Rail markers are summary presentation only and never feed back into command admission or lifecycle transition policy.

## 22. Functional requirements

### GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION

**Required behavior:** current stage, current attention, Run interaction availability, currentness and next-action eligibility are presented from one self-consistent canonical observation.

**Acceptance:** asynchronous changes cannot leave the UI showing actions from an older WorkItem stage while displaying newer Run state.

### GW-FR-201-OBSERVATIONAL-READS

**Required behavior:** inspection/read operations do not mutate lifecycle state.

**Acceptance:** opening source, package, evidence or historical material never changes stage/status.

### GW-FR-202-ATOMIC-COMMAND-OUTCOME

**Required behavior:** a command's accepted/rejected result and any resulting canonical workflow state are reported coherently.

**Acceptance:** a failed command cannot strand the browser on a state that the daemon has already changed without reporting that change.

### GW-FR-203-SERIALIZED-RUN-TURNS

**Required behavior:** at most one provider turn is active for one Run.

**Acceptance:** Send is unavailable while a provider turn is processing and the daemon rejects concurrent turn admission.

### GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP

**Required behavior:** required input is bound to one unresolved canonical request and is accepted at most once.

### GW-FR-205-MONOTONIC-REACH-HISTORY

**Required behavior:** stage history remains reached after backward lifecycle movement.

### GW-FR-206-CURRENT-ATTENTION-PRECEDENCE

**Required behavior:** current required action/blocker remains visible regardless of historical selection.

### GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY

**Required behavior:** lifecycle proposal role matches the owning stage and adoption cannot skip lifecycle progression.

### GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION

**Required behavior:** canonical source/lifecycle Save is unavailable while a WorkItem Run owns an active interaction.

### GW-FR-209-SOURCE-BLOCKER-ADMISSION

**Required behavior:** canonical source blockers suppress invalid Start actions and expose the owning recovery.

### GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE

**Required behavior:** asynchronous Run transitions refresh the complete current workflow observation and final event history.

### GW-FR-211-READINESS-RETURN-CONTINUITY

**Required behavior:** Readiness return preserves reached Readiness history and exposes the exact upstream owner/reason.

### GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS

**Required behavior:** package inspection is non-mutating; stale package state is explicit and old approval material remains historical.

### GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE

**Required behavior:** current blocked execution task/recovery cannot be hidden by old task selection.

### GW-FR-214-STABLE-WORKBENCH-GEOMETRY

**Required behavior:** canonical state/content changes do not arbitrarily insert/remove persistent layout regions or change navigation widths.

### GW-FR-215-STABLE-WORKFLOW-RAIL

**Required behavior:** the workflow rail has predictable stable step geometry and never wraps into an uncontrolled multi-row navigation surface.

### GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL

**Required behavior:** pre-signoff attempt/document count never causes a permanent side rail to appear/disappear.

### GW-FR-217-PRIMARY-INFORMATION-ECONOMY

**Required behavior:** primary task content dominates; secondary/technical information cannot create card/chrome accumulation.

### GW-FR-218-SPACE-CLASS-CONSISTENCY

**Required behavior:** equivalent Document, Dialogue, Review, Operational, Evidence and Result interactions use the same functional geometry.

### GW-FR-219-EXPLICIT-CONTEXT

**Required behavior:** Context is operator-opened, bounded, secondary and never the only owner of a blocker/action.

### GW-FR-220-PRESIGNOFF-CONTINUITY

**Required behavior:** Research/Requirements/Design/Plan share one stable interaction grammar across dialogue, document, proposal and evidence.

### GW-FR-221-READINESS-REVIEW-HIERARCHY

**Required behavior:** readiness verdict/findings/package coherence dominate ordinary Run history except while actual required input owns attention.

### GW-FR-222-APPROVAL-REVIEW-HIERARCHY

**Required behavior:** package meaning/scope dominates technical identity and sign-off remains adjacent to the exact judged package.

### GW-FR-223-IMPLEMENTATION-MASTER-DETAIL

**Required behavior:** Implementation uses stable task master/detail with current blocker/next action visibly owned by the current task.

### GW-FR-224-TERMINAL-RESULT-PRIMACY

**Required behavior:** Complete presents the governed final outcome first with prior reached history available through the workflow rail.

### GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY

**Required behavior:** responsive recomposition preserves current task, current attention, unsaved state and return origin.

### GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK

**Required behavior:** workflow-critical pending/error/block/input state remains inline in the owning material and is never toast-only.

### GW-FR-227-CERTIFICATION-MATRIX

**Required behavior:** permanent browser/integration certification covers every material combination of current stage, reached history, Run turn state, blocker/input/proposal state, backward return, async terminalization and wide/medium/narrow geometry.

### GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE

**Required behavior:** every accepted workflow event maps one valid functional state to exactly one admitted resulting state under §21 and `GW-DOC-WORK-LIFECYCLE-V1 §2.1-§2.3`; events not admitted by those models are rejected without an implicit lifecycle transition.

**Acceptance:** P4/P6 can enumerate the complete transition relation without inventing a state, priority rule or recovery route not present in P3.

### GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY

**Required behavior:** one STAGE provider turn has exactly one controlling outcome under §21.2, with exact single-owner required input and no contradictory completion/block/input/proposal combination.

**Acceptance:** contradictory provider control events are rejected before they can produce Run/WorkItem state, and a lifecycle proposal can exist only as the single pending proposal of an OPEN current-stage Run.

### GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR

**Required behavior:** every rendered Order Workbench service is classified under exactly one primary interaction-space class from §13; subordinate selection, context, task-panel and safety/exception behavior use only the declared auxiliary classes and cannot create another persistent layout/navigation grammar.

**Acceptance:** adding a new feature, material type, Run/document/task count, configuration service or technical detail does not create a new screen geometry by implementation convenience. If none of the §13 classes can express the required user interaction, the change returns to DESIGN before implementation.

### GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE

**Required behavior:** every rendered Workbench service uses the single visual language in §11 for hierarchy, semantic color, typography, density, controls/forms, operational scanning, feedback, themes, focus and responsive continuity.

**Acceptance:** equivalent UI meaning is rendered equivalently across queue, creation, Settings and every WorkItem workflow surface; no feature/service owns a competing palette, typography scale, form/control grammar, status treatment, notice treatment, table/list density, timeline grammar or overlay style.

### GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE

**Required behavior:** every operator-visible workflow condition is expressible only through the closed orthogonal state primitives in §3.7 and the current-attention/recovery/execution projections in §21.9-§21.10.

**Acceptance:** P4/P6 and UI implementation do not invent a new lifecycle status, attention category, recovery route, proposal-adoption state, execution-owner state, validation-progress state or observation-coherence state to handle a local feature.

### GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION

**Required behavior:** the nine-stage workflow rail is the one persistent lifecycle summary projection defined in §3.8/§21.11, derived from canonical stage/reach/current-attention state and never used as lifecycle or command-admission authority.

**Acceptance:** the same canonical workflow facts always produce the same reach/current marker for every rail cell; historical selection cannot create a false current marker, and no feature supplies an independent rail status.

### GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION

**Required behavior:** equivalent semantic UI roles use the same component presentation language everywhere in the application under §11.12.

**Acceptance:** representative primary/secondary/destructive actions, fields, statuses, notices, operational rows, headings, disclosures and overlays are recognizably the same component family across Queue, Create, Settings and WorkItem workflow services; feature-local visual variants cannot redefine an already-owned role.

### GW-FR-235-GLOBAL-THEME-PARITY

**Required behavior:** System/Light/Dark is one application-global presentation preference under §11.13 and every rendered component/specialist surface preserves the same semantic hierarchy in each effective theme.

**Acceptance:** theme switching changes only presentation tokens/theme rendering, requires no reload, preserves workflow/selection/dirty state, produces no local theme island, and all workflow-significant states remain readable/distinguishable in both light and dark.

## 23. Required certification scenarios

At minimum, downstream implementation must prove these scenarios end to end:

1. Research starts asynchronously, completes, and Requirements appears without page reload.
2. A Run processing a provider turn cannot accept another message.
3. An active Run that is idle/open can accept exactly one continuation and becomes processing.
4. A required-input request accepts one bound answer and rejects duplicate/stale answers.
5. R3 returns to Plan; R3 remains reached/historical and inspectable.
6. Implementation returns to Design/Plan; Approval and prior Implementation remain reached/historical.
7. Stale Approval package inspection performs no hidden transition.
8. Source diagnostic blocks Start before the operator invokes it.
9. Editing upstream authority while a Run is active cannot be canonically saved.
10. A lifecycle proposal from R1 cannot target PLAN/R3 and adoption cannot skip stage conformance.
11. A blocked execution task is visible even when an older completed task was previously selected.
12. Final Run completion/failure/conformance events remain visible after terminalization.
13. The second pre-signoff attempt does not change the primary canvas width.
14. Creation/removal of the owning lifecycle document does not add/remove a persistent side rail.
15. Current workflow styling does not resize workflow rail cells.
16. Context never opens automatically and has one stable bounded width when explicitly opened.
17. Wide/medium/narrow layouts preserve unsaved editor buffer and current attention.
18. Mutation error after a separately observed canonical transition reconciles to the new state rather than presenting stale controls.
19. Saving/refining an unprogressed Work request remains at IDEA; only explicit Start Research enters R1.
20. A provider turn containing contradictory controlling events is rejected without changing Run/WorkItem state.
21. A required-input request cannot coexist with a lifecycle proposal in the same provider turn and cannot be answered twice.
22. Returning from R3 or Implementation preserves every previously reached downstream step as historical.
23. Approval package read can expose stale currentness but cannot itself execute the upstream return.
24. Rejected/stale commands and historical navigation are proven state-preserving across every workflow step.
25. Every rendered Workbench service resolves to one §13 primary interaction class; subordinate selector/context/task-panel/confirmation behavior does not introduce an undeclared persistent screen grammar.
26. Queue, creation, Settings, document/editor, dialogue, review, implementation, evidence, result and Context rendering all use the same semantic color, typography, spacing/density, control, status, feedback and focus language in light and dark themes.
27. Every production rendering owner is accounted for by the P4 renderer-to-primitive coverage matrix; an unclassified renderer or direct recreation of an owned UI mechanic fails architecture fitness.
28. Proposal adoption survives interruption as ADOPTION_IN_PROGRESS for the exact durable proposal; Reject/free continuation remain unavailable until exact reconciliation/disposition completes.
29. Every canonical state fixture resolves to one closed current-attention category and one recovery route; no fixture exposes two competing current actions.
30. Every stage in every forward/backward lifecycle fixture produces a deterministic rail reach state, and the current stage produces exactly one READY/PROCESSING/ACTION_REQUIRED/BLOCKED/STALE/COMPLETE marker.
31. A RunEvent/WorkItem/task observation that has not yet converged produces CONVERGING/PROCESSING presentation with mutation controls suppressed, then resolves without inventing the missing transition locally.
32. Execution fixtures deterministically identify the current task owner and durable validation boundary independently from historical task/Run selection.
33. Primary/secondary/ghost/destructive actions, fields, status/notices, operational rows, headings, disclosures and overlays render with the same semantic component language in Queue, Create, Settings and representative WorkItem workflow services.
34. System/Light/Dark switching updates the complete application—including overlays, Markdown, code/evidence and source editor—without reload or loss of selected WorkItem/material, dirty buffer, focusable task context or workflow state.
35. Light and dark render every neutral/current/selected/info/success/warning/danger/focus semantic role distinctly using the same meaning; no feature or specialist renderer exposes a conflicting local palette.
36. System preference follows effective browser/OS color scheme when no explicit Light/Dark preference exists; explicit Light/Dark remains stable until changed, and preference-storage failure does not affect live theme behavior.

## 24. Downstream technical-design obligations

GW-DOC-TECHNICAL-ARCHITECTURE and GW-DOC-CANONICAL-CONTRACTS must be re-evaluated against this V2 functional authority before implementation remediation begins.

The technical investigation must determine, without changing the behavior above:

- the technical representation that realizes the complete P3 transition relation in §21 and `GW-DOC-WORK-LIFECYCLE-V1 §2.1-§2.3`;
- the single authoritative transition function(s);
- how WorkItem lifecycle, Run lifecycle, turn occupancy, proposal adoption, currentness, recovery, observation coherence, current attention, execution ownership/validation boundary and reach history are represented or derived through one closed state language;
- how the workflow rail is derived as a one-way summary projection from that language without becoming a state/admission owner;
- how commands are serialized;
- how command atomicity is guaranteed;
- how required-input idempotence is enforced;
- how proposal authority is admitted;
- how reads are made side-effect-free;
- how asynchronous transitions expose one coherent browser observation;
- how final event draining is guaranteed;
- how the UI consumes canonical state without a parallel browser state machine;
- how layout stability is enforced through the local Foundation/Astryx boundary;
- the complete renderer-to-primitive/approved-leaf coverage matrix for every production UI renderer;
- the canonical semantic design-token contract for color, typography, spacing/density, borders/radii, focus, status and theme parity;
- the one root theme-preference/effective-theme owner, foundation-theme bridge and stylesheet/token governance boundary;
- how component parity and specialist-renderer theme coverage are proven across System/Light/Dark;
- how permanent state-transition, visual-language, theming and geometry fitness tests are expressed.

The binding P4/P6 realization must include a transition-coverage proof mapping every functional transition in §21 and `GW-DOC-WORK-LIFECYCLE-V1 §2.1-§2.3` to one pure policy decision and one authorized imperative-shell mutation path. `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` owns that realization. No implementation task may invent those semantics locally.


## 25. Non-goals

This design does not authorize:

- user-defined lifecycle stages;
- a generic workflow engine dependency;
- a second browser state store;
- WebSocket/SSE/provider token streaming;
- hidden chain-of-thought exposure;
- automatic chat-to-authority mutation;
- a generic repository IDE;
- arbitrary repository mutation;
- implementation agents redefining authority;
- replacing exact Markdown authority with rich-text state;
- progress percentages for opaque provider work;
- a new dashboard/card visual language.

Implementation planning is governed by the binding P4/P6 realization and must not reinterpret this functional state model.
