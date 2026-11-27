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
  -> Acceptance (candidate-producing delivery only)
  -> Complete
~~~

The lifecycle is not strictly monotonic. Readiness, approval freshness and implementation validation may return work to an earlier owning stage. Returning upstream does not erase the fact that downstream stages were previously reached.

The browser is a client of canonical Order state. It may select and inspect workflow history, but it does not own lifecycle truth and does not infer mutation eligibility independently.

### 2.1 User-facing workflow and work-type language

Ordinary operator-facing copy and product documentation use these workflow names:

- Work request;
- Research;
- Requirements;
- Solution design;
- Implementation plan;
- Readiness review;
- Approval;
- Implementation;
- Acceptance;
- Complete.

Internal lifecycle codes remain valid in contracts, state models, schema/template identifiers, diagnostics and technical traceability, but they are not the ordinary labels used to explain workflow tasks or expected outputs to operators.

The governed user-facing work types are **Change**, **Defect**, **Investigation** and **Audit**. The Workbench must preserve the selected work type's information semantics throughout every workflow step that applies to that type.

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

#### 3.6.1 Operator-facing material maturity

The Workbench uses one derived material-maturity vocabulary where the distinction affects what the operator can validly do:

| Product label | Meaning |
|---|---|
| **Draft** | governed material exists but is not yet current conformed authority for its owning workflow step |
| **Updated — validation required** | the current material was saved/adopted and required currentness/conformance must be re-established |
| **Current** | the material is current conformed authority for its owning workflow step |
| **Stale** | upstream authority changed and this material can no longer authorize progression |
| **Historical** | prior reached/superseded material retained for inspection |
| **Signed & locked** | material belongs to the exact signed execution package and is inspection-only in Implementation/Acceptance/Complete |

**Proposed change** and **Applying change** are interaction states around a material mutation, not document-maturity values.

This vocabulary is a product projection over existing canonical facts. It does not create another persisted document-state machine and Git recording remains orthogonal to conformance/currentness.

A deterministic lifecycle document rediscovered from the repository remains visible as **Draft** even when no historical Run exists for it. Discovery does not fabricate a reached stage, completion event, conformance result, readiness verdict or approval. If its owning workflow step has not yet been reached, the draft is inspectable rather than current authority.

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
| Acceptance decision | derived from exact current Approval/candidate members and ordered review events | inspect/report, submit, queued, retest, accept, unavailable/stale or historical inspection; no persisted status |
| current attention | the closed categories in §21.9 | the one current workflow condition/action that must dominate presentation |

These values are a functional language, not a persistence model. They may be derived from fewer durable facts, but a downstream layer may not add a new semantic state, recovery category or precedence rule merely because the implementation needs a convenient label.

### 3.8 Workflow rail as canonical lifecycle projection

The workflow rail is the persistent orientation projection of this state language. It is not another state machine and never owns mutation eligibility.

For each of the ten lifecycle stages it presents:

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
- explicit technical inspection (WorkItem Context for selected-work scope; Settings diagnostics for configuration scope).

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

### 5.5 Bounded agent operational activity

While an agent is processing, the operator must be able to distinguish useful productive activity from a black-box wait without exposing hidden reasoning or raw provider plumbing.

The product-visible activity vocabulary may include bounded ordinary-language categories such as:

- Preparing context;
- Reading/inspecting;
- Searching;
- Editing/preparing a proposed change;
- Running checks;
- Reviewing results;
- Retrying/recovering;
- Waiting on an external/provider operation.

Where safe and useful, an activity entry may include a bounded repository-relative resource name or named check. Raw unbounded tool input/output, credentials, hidden reasoning, provider protocol identifiers and provider-session internals remain technical/closed.

Useful activity is shown live while processing when the selected technical integration can provide it reliably. After the turn settles, a bounded activity summary may remain inspectable with the attempt when it materially helps explain the work performed or a failure. Canonical Order messages, questions, proposals, blockers, completions, reviews and validation outcomes remain workflow authority.

### 5.6 Conversation transcript and reply context

A reply-capable workflow interaction is always a **Dialogue** interaction, not an isolated input control.

Whenever the operator can submit a free-form continuation or answer required input, the primary Dialogue surface must visibly provide the human/agent conversation needed to understand that response.

The conversation transcript must:

- present substantive human-facing agent messages from the selected current attempt;
- present accepted operator responses in conversational order;
- present the exact required question inline when the agent is waiting for input;
- preserve enough prior turn context from the same attempt to make the current reply intelligible;
- remain visible while the current agent turn is processing so new activity does not replace the discussion being continued;
- keep system/workflow events, operational activity and technical diagnostics visually distinguishable from human/agent messages.

A free-form composer must never appear as an orphaned control beneath a status/event feed that does not show the agent statement being replied to.

When an attempt is **open for continuation**, the preceding completed agent turn must expose at least one substantive human-facing agent message that provides the conversational anchor for continuation. If no such message is available, free-form continuation is not meaningfully admissible and the Workbench must not present an ordinary reply composer.

When the attempt is **waiting for required input**, the exact question is itself the current conversational anchor. Any additional agent explanation returned for that turn remains visible with the question rather than being hidden in technical/event detail.

Operational activity supplements this transcript; it does not replace it. Raw provider output, provider-native message structures, hidden reasoning and tool payloads are not the conversation surface.

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

Cancel is also unavailable while a lifecycle proposal is pending. To abandon both the proposal and the owning attempt, the operator first Rejects the proposal; only after proposal disposition may ordinary cancellation become available again.

While proposal adoption/reconciliation is in progress, Reject, Cancel, free continuation and competing authority edits are unavailable. The exact accepted proposal remains the mutation owner until application/reconciliation completes or an explicit governed failure/recovery owns attention.

A Run must not close/cancel while leaving a pending proposal with no valid Adopt/Reject owner.

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

Once the WorkItem is in Implementation, Acceptance or Complete, signed lifecycle authority remains inspection-only in that state.

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

Reaching the Approval stage is not itself approval. If authority reconciliation returns upstream before sign-off, Approval remains reached/historical, but the Workbench must present it as unsigned/returned history and must not label it `Approved` or imply that an Approval/tasks were created.

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

Rendered comparison material is **derived evidence only**. It may demonstrate this owner's current requirements but may not constrain, supplement or override them. A comparison artifact is current only when it records the exact current authority versions it projects; superseded visual packs are historical evidence and must not remain an implementation or acceptance oracle.

#### Application toolbar contract

The application toolbar is the one application-global orientation and utility row. It presents only:

- Order product identity and the current destination meaning;
- current Project context and a compact Project-switch affordance when more than one configured Project is available;
- the active OpenCode account entry;
- Settings navigation; and
- the application-global System / Light / Dark choice.

These controls remain compact and non-wrapping and do not create another persistent navigation axis. Project switching changes only the selected application Project context; it does not fabricate lifecycle state, retarget a selected WorkItem across Projects, or expose repository roots/internal Project identifiers as ordinary header copy. Order has no separate Team/Workspace domain in current product authority; implementation must not invent one merely to populate the toolbar.

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
- Acceptance;
- Complete.

Step selection is non-mutating inspection.

On constrained widths the same rail may become horizontally scrollable or compact, but individual step geometry remains predictable and the rail does not become a wrapping multi-row navigation block.

### 11.4 No conditional pre-signoff side rail

Research, Requirements, Solution design and Implementation plan do **not** gain a permanent left navigation rail based on the number of attempts/documents.

Attempt history and material selection use one compact step-local selector/control treatment that does not change the primary canvas width when the second object appears.

Supporting Work request/upstream documents are secondary context. They do not precede the current blocker, required input, proposal decision, active dialogue or current governed document in the primary reading order.

On a Document-class surface, the governed Markdown/document canvas follows document identity/currentness/actions immediately and remains the dominant reading target. Work type, Project, Concerns, repository/document location and comparable source/document orientation facts are subordinate: where the operator may need them during the same document task they are grouped in one specifically named document-details disclosure, closed by default and placed after the primary document content. They may not form an always-open metadata slab ahead of the document. Exact technical identity remains Context-owned, and an individual supporting fact may be promoted only when the current blocker, decision or mutation requires that exact value.

Provider/runtime mechanics such as OpenCode session identity/status are technical detail unless a provider failure is itself the current blocker; the ordinary primary surface uses user-facing workflow state such as Processing, Waiting for you, Failed or Blocked rather than provider-plumbing headings.

This is a binding stability and information-hierarchy requirement.

### 11.4A Information visibility, ownership and progressive disclosure

Every datum/action available to a Workbench surface has exactly one **semantic presentation class**. Classification is determined by the operator task and canonical meaning; it is not inferred from current JSX, storage shape, transport convenience or whether a value happens to be easy to render.

The class does **not** authorize a generic container. Progressive disclosure is an interaction rule for subordinate information, not permission to accumulate collapsed bars around primary work.

| Class | Meaning | Default presentation |
|---|---|---|
| **Primary task information** | required to understand or perform the current operator task | visible in the owning primary interaction surface and allowed to dominate |
| **Supporting operator information** | useful to judge or orient the current task but not itself the task | visible subordinately or reachable through the owning interaction-specific resource/timeline/action treatment; a selector is used only when peer selection is itself part of that interaction |
| **Operational detail** | low-frequency operator-facing history, resource or status detail | subordinate and selected/inspected through the owning history/material/resource interaction when persistent display would compete with primary work |
| **Technical detail** | exact implementation/audit identity such as UUIDs, hashes, commit/baseline identity, raw repository paths where a semantic label suffices, provider/session identity, schema/internal-role identity and comparable mechanics | absent from the productive task flow by default; available only through the explicit technical-inspection destination for the current scope |
| **Diagnostic/console detail** | raw diagnostic codes, raw event tags/payloads, parser/provider mechanics and other implementation-facing failure evidence | absent from ordinary product presentation; available only through intentional technical/evidence inspection when legitimate operator inspection requires it |

A normally subordinate technical condition may become the current blocker without promoting its raw representation. The primary surface promotes only the **human-readable meaning, consequence and valid action**. Raw code/hash/session/payload detail remains in its inspection owner. A raw path may become ordinary Supporting or decision-primary information only when the path itself is required to identify the object or consent to the exact mutation; that exception is surface-specific authority, not a general path rule.

The ordinary ownership model is closed:

- **material/history access** — attempts, upstream/current governed material and other operator-facing workflow history use the owning interaction-specific resource, timeline, action or explicitly justified peer selector. There is no generic workflow-material selector and no second generic **Supporting material/history** strip;
- **technical inspection** — each application scope has at most one explicit technical-inspection destination. For a selected WorkItem/material this is **Context**. Technical identity is grouped there by the selected object/material rather than repeated as local **Technical details** bars throughout productive surfaces;
- **Evidence** — exact evidence/resource identity and bytes become primary only after intentional Evidence inspection;
- **Safety/confirmation** — exact facts required to consent safely to the pending mutation may become decision-primary only for the life of that confirmation.

A productive surface therefore must not create a local generic **Technical details** accordion merely because technical fields exist. Nor may a feature create another persistent technical rail, diagnostics dashboard, metadata card stack or local disclosure system. Application/configuration diagnostics that are not WorkItem-scoped must have one explicit Settings/diagnostics inspection owner rather than per-section technical accordions.

The following composition invariants are binding:

1. **one semantic owner** — the same supporting/history information has one interaction-specific access owner and is not duplicated through a selector/navigation owner plus another disclosure/resource lane;
2. **no disclosure accumulation** — adjacent or nested generic collapsed containers whose purpose is only “technical”, “supporting”, “history”, “details” or equivalent are prohibited;
3. **primary adjacency** — controls that directly operate on primary content remain adjacent to that content. Unrelated technical/supporting inspection cannot be inserted between an editor toolbar and its canvas, between a task form body and its governed action region, or otherwise interrupt the active task relationship;
4. **inspection is intentional** — technical/diagnostic content never auto-opens, never becomes persistent because viewport geometry changes and never becomes the only owner of a current blocker/action;
5. **container count is not information architecture** — adding more collapsed containers cannot satisfy progressive disclosure. If information lacks an interaction-specific resource/timeline/action/inspection owner, the design returns upstream rather than inventing another accordion or generic selector;
6. **decision exceptions are bounded** — Evidence and Safety/confirmation may temporarily elevate exact technical facts only because the operator intentionally selected the evidence or must consent to the exact mutation.

Primary information may never be available **only** through Context, Evidence or technical inspection. Conversely, Technical/Diagnostic information may not occupy ordinary productive space merely because it is hidden inside a collapsed control.

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

Semantic grouping is expressed primarily by spacing, typography and the bounded anatomy of the owning component. A horizontal rule is **not** a generic section/grouping primitive. A 1px line is permitted only where the canonical composition owns a real structural boundary (for example shell-region separation, table/resource-row separation, an input/control boundary or an overlay boundary). Repeated full-width `border-bottom`/`<hr>` treatment between ordinary semantic sections is prohibited. Elevation is reserved for temporary overlays.

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

The semantic presentation classes are the five classes in §11.4A. This section defines their **visual prominence bands**; it does not create a competing three-class taxonomy.

### 12.1 Primary prominence

**Primary task information** is necessary to understand or perform the current task and dominates the owning interaction.

Examples:

- source/lifecycle document being authored;
- active conversation;
- proposal diff;
- readiness findings;
- sign-off task scope;
- current execution task and blocker;
- terminal result.

### 12.2 Secondary prominence

**Supporting operator information** and **Operational detail** remain subordinate to the primary task. They use their semantic selector, resource, timeline or bounded supporting owner rather than generic container accumulation.

Examples:

- attempt/material selection;
- supporting upstream document;
- evidence/resource links before Evidence is explicitly opened;
- compact source status;
- current document Git state;
- bounded agent/workflow activity.

### 12.3 Inspection-only prominence

**Technical detail** and **Diagnostic/console detail** are not ordinary productive hierarchy. They are absent by default and appear only after intentional entry into the authorized technical-inspection or Evidence surface, except for the exact bounded decision exceptions in §11.4A.

Examples:

- UUIDs;
- SHA-256 values;
- commit ids;
- context hashes;
- provider session ids;
- raw RunEvent tags/payloads;
- raw paths where ordinary labels suffice.

Technical/Diagnostic information does not gain legitimacy merely by being placed in a collapsed bar inside the primary surface.

## 13. Interaction-space classes

Order uses a small closed set of interaction classes.

| Class | Primary use | Functional geometry |
|---|---|---|
| Operational scan | queue, task master | dense table/list |
| Form / configuration | Create WorkItem, Settings and bounded configuration tasks | explicit field hierarchy + action region; no card dashboard |
| Document | Work request, Research, Requirements, Solution design and Implementation plan | wide primary authoring/reading surface |
| Dialogue | active pre-signoff Run | remaining-height conversation with anchored composer |
| Review | proposal, readiness, approval, acceptance | wide comparison/judgment surface |
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

**Semantic-region ownership law.** A region that represents current attention is semantic, not a generic top-of-surface placement slot. A primary interaction class renders a current-attention region only where its class contract declares current attention as part of that composition. Operational scan, Review, Evidence and Terminal result must not manufacture an outer attention region merely to obtain heading/status/action placement. A heading, review currentness/verdict/decision, result classification or evidence identity is not current attention simply because it is visually prominent. Review owns one verdict/currentness presentation, ordered semantic sections and one decision region inside the single `WorkbenchReview` composition, with no arbitrary Review-body hierarchy; if the selected interaction truly becomes Dialogue or another primary class, that primary composition replaces Review rather than wrapping Review in a second Surface/Attention frame.

**State-is-not-interface law.** Canonical stage, current-attention, Run-interaction and material-currentness values determine which interaction composition and human-facing message is rendered; they are not themselves a generic visible status tuple. The Workbench must not render a reusable stage-summary strip that concatenates stage identity, `Current`, Run/document status and stage purpose. Internal classifications such as `OPEN`, `REQUIRED_INPUT`, `PROCESSING`, `READY_FOR_SIGNOFF` or prose labels that merely restate those classifications are not ordinary operator copy unless an independent product-language requirement explicitly names that wording.

Exactly one primary interaction composition may own the selected task/material at a time. Selecting Proposal Review or Evidence replaces the owning material composition for the duration of that explicit review/inspection; neither may be wrapped or nested inside another primary Workbench composition. Returning from the transient composition restores the recorded owning material and focus.

For Complete, the terminal result itself is the current orientation. The final outcome classification, substantive result/evidence and permitted follow-up action are one Terminal-result composition; Complete does not add a separate current-attention band that repeats or re-labels the same terminal meaning.

## 14. Per-step screen contract

### 14.0 Work type × workflow step information contract

The primary task area is determined by both the selected WorkItem type and the current workflow step.

**Work request**
- Change foregrounds requested outcome/current context/constraints/references.
- Defect foregrounds observed behavior/expected behavior/reproduction/preserved behavior/impact.
- Investigation foregrounds question/why it matters/known evidence/boundary.
- Audit foregrounds target/criteria/scope/requested evidence or verdict.

**Research**
- Change establishes current state/absence, evidence, governing authority, affected path and downstream invariants.
- Defect establishes reproduction, proven root cause, producer→carrier→consumer path, downstream effects/invariants and governing authority.
- Investigation establishes evidence for/against, findings, unresolved questions and conclusion.
- Audit establishes evidence by criterion, findings and verdict.

Only confirmed Change/Defect delivery work proceeds to Requirements, Solution design, Implementation plan and Readiness review.

For shared delivery steps, kind-specific upstream semantics remain directly available:
- Change Requirements/Solution design/Implementation plan remain traceable to the requested outcome and proven current-state/absence.
- Defect Requirements preserve expected corrected behavior and unchanged-behavior/regression obligations.
- Defect Solution design remains traceable to the proven root cause/producing boundary and preservation invariants.
- Defect Implementation plan includes exact remediation plus reproduction/regression/preservation verification.

The current step-owned output remains primary. Upstream documents are supporting authority/evidence rather than a flat set of equally weighted files. Unreached downstream documents are not rendered as empty productive authority.

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

Attempt/history access is subordinate to the Dialogue/Document task and does not create a generic workflow-material selector or alter canvas width. A selector is permitted only when the specific interaction genuinely requires choosing among peer objects.

Current required input, proposal or blocker remains visible even while historical Research material is inspected. Dialogue is continuous across reply → processing → another question/open continuation/proposal/block/completion; answering one required question does not visually imply closure of the Run or stage.

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

Readiness review material is read-only.

The ordinary Readiness primary composition is one Review. Its verdict/currentness, findings, supporting package material and review actions remain inside that Review composition; Readiness does not receive a separate `WorkbenchSurface`/`WorkbenchAttention` wrapper merely because the workflow step is current. If an exact required-input interaction is promoted to another primary interaction class, that class replaces the selected primary composition for the duration of that interaction rather than nesting around or inside Review.

Readiness does not default to a persistent master/navigation column and does not expose a generic `Readiness material` selector. Package material, attempts and evidence use Review-owned subordinate resources/actions/history treatment. A selector is used only when a specifically defined peer-selection interaction requires it; collection size or heterogeneous material availability is not sufficient justification.

### 14.7 Approval

Approval is one coherent Review workspace. Its package currentness/readiness, task/material judgment and sign-off decision are owned inside that Review composition; Approval does not receive a separate `WorkbenchSurface`/`WorkbenchAttention` wrapper for generic workflow-step orientation.

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

The manual Implementation start action means exactly: **start the canonical current approved task for this WorkItem**.

It does not mean “ask a global scheduler to run any eligible work.” If the operator is inspecting a historical or non-current task, that selection remains read-only and cannot retarget the current start action. Automatic/background scheduling is mandatory for normal signed progression and remains separate from the optional task-local manual command.

### 14.8A Acceptance — interactive final QA/QC

Only an admitted current verified candidate set enters Acceptance. It is one direct Review composition, not an implementation task or a second Approval screen. The verdict distinguishes verified/awaiting human review, findings open, correction queued, retest required, unavailable/stale evidence and accepted historical result. Primary: candidate review meaning, signed acceptance criteria and their exact evidence, structured findings with expected/observed/reproduction/impact, disposition and next action. Supporting: candidate summary, separate task candidates, changed-path/patch and validation/evidence access, prior review rounds, relevant signed documents. Technical: Approval, task, Run, event, baseline, hashes and evidence identities only in Context/Evidence. No fabricated aggregate workspace or pass from a partial candidate set.

Report finding opens an existing task-panel/form interaction, bound to the selected exact candidate and zero or more signed criteria; explicit save durably records the report, cancel/dirty navigation retains existing form behavior. Submit findings requests independent evaluation and autonomous correction, never creates authority or approves a step. While queued, show its owner and disable acceptance; while repair executes, Implementation owns current attention and historical Acceptance is read-only. When candidate returns, show correction evidence and explicit retest outcome controls. A finding is resolved/withdrawn only by an explicit human disposition with rationale against the current candidate; unresolved findings or stale/missing evidence disable final acceptance. New-scope findings use governed upstream return or a separate WorkItem, not a hidden task. Review's one decision region offers the primary currently admissible action and subordinate Report finding/inspect/retest actions; final `Accept candidate` uses the exact verified set and attributable human confirmation. No implicit accept on navigation, CI, refresh or silence. No commit/push/merge/deploy. No free-form STAGE composer, synthetic outer attention or nested Review; evidence/document inspection replaces the primary composition with explicit return; a TaskPanel/Form or safety confirmation temporarily owns the interaction while the Review underneath is inert. Historical rounds are read-only; current attention remains reachable. Wide/medium/narrow and themes preserve all semantic and interaction roles.

**Acceptance decision closure.** Original report identity and evidence remain immutable. Unsubmitted open reports for a replaced task remain actionable against its successor; disposed reports on that task require retest again, while unchanged member dispositions remain valid. Failed retest records current observed behavior/rationale and leaves the original report unresolved and resubmittable. Before submission a mistaken observation can be withdrawn with rationale and explicit attestation that it is not a known unmet signed obligation; after assessment withdrawal requires independent supporting evidence. Never waive a demonstrated binding defect. A finding against a no-op member of a mixed candidate set blocks acceptance and requires explicit PLAN reanalysis, not patch remediation of a nonexistent candidate. All-no-op terminal work remains terminal; later defects are separate work. Select one primary action in this order: unresolved no-op challenge -> Return to PLAN; otherwise open actionable reports -> Submit; otherwise outstanding retest -> Record retest; otherwise verified current set with no open findings -> Accept. Report/inspect are subordinate. Queued submission is PROCESSING even before Run admission; no competing ordinary mutations. If a higher-priority stale authority or unavailable proof diagnostic prevents admission, expose only the explicit reconciliation or proof-unavailable PLAN return; never keep the queue indefinitely processing with no recovery. Correction owns Implementation; historical Acceptance is read-only. Missing/corrupt current proof is BLOCKER with exact diagnostic and explicit governed reanalysis if irrecoverable. Actual stale authority is STALE_AUTHORITY with exact owner reconciliation. Current action remains reachable during historical inspection.

#### 14.8A.1 Operator interaction closure

The Review opens on the exact latest admitted round of the current Approval, or the explicitly selected historical Approval/round. Candidate resources and findings are grouped by signed task, in signed task order; within a task findings and review rounds use event sequence order. Every task is reachable without another persistent navigation column. Current member and round are not inferred from a historical selection. Selecting a task, finding, review round, criterion or evidence is observational; Back restores the exact prior selection and focus. Historical selection never offers report, test-copy, submit, retest, withdrawal or accept; return to the independently current owner is visible. Use Return to current review for an older round of the same current Acceptance, Return to current step for another lifecycle owner, and View final result for COMPLETE.

Report finding is subordinate while ordinary current QA is admissible. On the overview no member is implicitly selected: the form first requires an explicit task choice (human objective and verified or no-change meaning). When opened from a selected member, preselect that exact member; changing task clears criterion/evidence selections before any new input is entered, and dirty task changes use existing discard protection. Then identify the exact chosen member; then optional multi-select signed criteria by exact reference key, with open access to the signed authority document (empty means unclassified), Expected behavior, Observed behavior, Reproduction, Impact, optional admitted same-lineage evidence, and human identity. The four text fields and identity are required nonblank. No upload or arbitrary path/URL evidence picker. Save records REPORT only; no automatic submission. Cancel and destination/material change use existing dirty-form safety. Errors retain entered data and are explained at the form; stale identity requires explicit return/reinspection and never automatic retry or rebinding a draft to different evidence.

Submit findings opens a task-scoped selection form listing only eligible open/retest-failed reports of that current candidate-producing task. Choose one task and one or more eligible findings; no silent inclusion, cross-task selection or empty submission. Show selected findings and the consequence that independent review/correction is queued against this exact member, then human identity, Cancel and Submit findings. Other reports remain open. A no-op challenge takes precedence and returns to planning rather than submitting. No competing mutations while queued; inspection remains available.

Record retest selects one retest-required finding and shows original expected/observed behavior, current successor and its exact independent proof. For a report assessed in the current round show that exact assessment/evidence; for a formerly disposed finding reopened by a later replacement without being submitted in that round, show any prior assessment as historical (or no assessment for a pre-submit withdrawal), never as current independent assessment. Human retest still judges the current verified member. Choose Correction confirmed or Defect still present. Both require human identity and rationale; failed retest additionally requires observed behavior and optionally admitted evidence. Success records RESOLVED via DISPOSITION, failure records RETEST_FAILED and remains open for submission. No automatic disposition. Withdraw finding is a separate subordinate form for an eligible report, showing original report and current assessment (where required); require rationale, explicit not-a-known-unmet-obligation attestation and human identity. Optional follow-up is an existing same-project WorkItem reference, not automatic creation or waiver. Withdrawal after submission requires independent evidence already admitted for that finding. Never permit withdrawal of a known binding defect.

Prepare test copy is a subordinate task-specific action only for a current candidate-producing member while ordinary QA is admissible. Explain isolated replay and no automatic execution/delivery. Show the returned local path only in the explicit result, available for selection/copy; error remains in that action's feedback, no silent retry or overwrite. Closing the result does not change workflow state. Open patch, validation, signed document and correction attempt by exact identity in existing Evidence, Document or Implementation respectively, with return to the selected Acceptance material. No manual test outcome is independent gate evidence.

Return to planning uses a form with the actual no-op findings or actual missing-proof reason, rationale and actor; no-op identifies the complete unresolved no-op challenge set; missing proof does not fabricate a candidate hash. Reconcile authority uses the existing exact owner confirmation; source drift invokes the source reconciliation owner and returns R1, while stale material invokes material-authority reconciliation to its exact owner. Both require exact current Acceptance identity; no implicit return or invalid-source adoption. Accept candidate opens the final decision form listing the exact current task objectives and verified/no-change membership, confirmation that no known signed obligations remain unmet, and human identity. Cancel does nothing. Explicit Accept candidate submits the current P6 expected hash/sequence; membership is computed by the core. The confirmation statement is UI meaning, not an extra persisted field. If any identity or eligibility changes, reject without acceptance and return to current inspection. No implicit approval or delivery.

#### 14.8A.2 Acceptance interaction statechart

Apply §21.9 precedence before the following current, coherent Acceptance cases. The exact P6 command admission still applies to every control. A historical or noncurrent selection is read-only regardless of the displayed verdict.

| Current condition (ordered after coherence/conflict) | Current attention / rail | Primary decision | Other action availability |
|---|---|---|---|
| Actual stale signed authority/source | STALE_AUTHORITY / STALE | Reconcile authority; pure AcceptanceDecision selects exact source return or material owner return | inspection only; queued recovery exception |
| Exact candidate proof unavailable, authority current | BLOCKER / BLOCKED | Return to planning after explicit reanalysis decision | inspection/refresh only; queued recovery exception |
| Outstanding queued submission | PROCESSING / PROCESSING | none | inspect only; no ordinary mutations |
| Unresolved no-op challenge | ACTIONABLE / ACTION_REQUIRED | Return to planning | inspect/report; eligible withdrawal/retest only when P6 admits |
| Open or retest-failed actionable reports | ACTIONABLE / ACTION_REQUIRED | Submit findings | inspect/report; eligible retest/withdrawal and test-copy subordinate |
| Outstanding retest, no higher action | ACTIONABLE / ACTION_REQUIRED | Record retest | inspect/report; eligible withdrawal and test-copy subordinate |
| Current verified set, no unresolved findings | ACTIONABLE / ACTION_REQUIRED | Accept candidate | inspect/report/test-copy subordinate |
| Correction admitted | EXECUTION owns attention/rail | existing Implementation action | historical Acceptance inspection/return only |
| Exact ACCEPT recorded | COMPLETE / COMPLETE | no QA mutation | historical Acceptance inspection; final result |

Loading/converging and rejected-command conflicts suppress ordinary mutations; show existing human-readable loading/conflict feedback and explicit refresh/return, never a synthetic stage. If stale authority and missing candidate proof coexist, actual stale authority must be reconciled first; missing proof alone is not stale authority. Retest failure returns to the open-report condition without losing the original report. REPORT, RETEST_FAILED and DISPOSITION stay in Acceptance; SUBMIT stays until REVIEW_STARTED atomically enters Implementation; REVIEW_COMPLETED returns with retest outstanding; REANALYSIS_REQUESTED returns PLAN; ACCEPT atomically enters Complete. Current action stays reachable when viewing other reached material.

### 14.9 Complete

Complete presents one Terminal-result composition with the final governed outcome first.

The outcome uses canonical product-facing language and is followed directly by the substantive governed result/evidence/resources applicable to that outcome. Architecture, governance and container-taxonomy phrases are not operator-facing headings merely because they appear in specifications; a renderer must not introduce labels such as generic "terminal outcome", "final governed outcome" or "governed result material" unless a canonical product-language owner explicitly requires that exact wording.

Complete does not render a separate current-attention band for the terminal classification. The outcome label/explanation must not be duplicated in an attention region and again in the result body.

Prior reached steps remain inspectable from the workflow rail.

Investigation/audit remediation action appears only where canonically permitted and remains attached to the terminal result. For candidate-producing work completed under the Acceptance contract, show the exact final human acceptance as result provenance, separate from technical verification; legacy completed candidates show acceptance not recorded, never inferred. No acceptance controls on a terminal result. Later defects use separate governed work.

## 15. Current-attention/action precedence

Observation coherence is evaluated first. While the canonical observation is `CONVERGING`, mutation controls are suppressed and the Workbench presents updating/processing continuity rather than guessing the missing reaction.

For a coherent observation, the Workbench resolves current attention using this precedence:

1. mutation conflict that prevents safe continuation;
2. unresolved required human input;
3. pending proposal decision required for progress;
4. proposal adoption/reconciliation already in progress;
5. current canonical blocker;
6. stale approval/readiness/material ownership, with exact `RECONCILE_AUTHORITY` recovery where applicable;
7. retryable/resumable governed recovery owner;
8. current active processing/automatic-recovery state;
9. current startable/continuable/sign-off action;
10. ordinary current document/review/operational material;
11. historical operator selection.

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
20. placing the only blocker/recovery action inside technical inspection;
21. auto-opening Context or another rail because state changed;
22. allowing stale/historical task selection to hide the current execution blocker;
23. using a semantic region or primitive slot as generic placement merely because an API requires it;
24. nesting one primary interaction-space composition inside another instead of replacing the selected primary material;
25. presenting architecture, governance, internal container taxonomy or specification wording as ordinary operator copy without explicit product-language authority;
26. rendering a terminal outcome as both current attention and terminal result, thereby duplicating the same classification/explanation.

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
| provider result rejected by Order | provider turn completed but its combined requested workflow effects violate the closed turn/proposal grammar | none of the rejected result effects apply; Run terminal FAILED; WorkItem remains at the same lifecycle stage; governed Retry/recovery may be offered |

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

When a returned provider result is rejected because its combined workflow effects are invalid, no proposal/input/block/completion member from that result is applied. The attempt fails at the same lifecycle stage and the operator sees a product-facing failure with governed Retry/recovery where eligible. Technical rejection detail remains on demand.

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
        +-- Cancel -----------------------> UNAVAILABLE / REJECT / unchanged
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
      | autonomous scheduling after sign-off; optional scoped Start current task
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
      |       +-- all tasks no-op ---------------------------> COMPLETE / COMPLETE
      |       +-- all tasks successful, candidate present ----> AWAITING_ACCEPTANCE / ACTIVE
      |                +-- exact human acceptance --------------> COMPLETE / COMPLETE
      |                +-- admitted QA correction -------------> EXECUTION / ACTIVE
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

Automatic/background scheduling is mandatory for normal signed progression, including successor tasks and admitted QA submissions; scoped manual start is optional and never a serial approval. The task-local manual Workbench action must carry and honor the current WorkItem/task owner rather than invoking an unscoped global scheduler action.

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
7. **STALE_AUTHORITY** — approval/material or signed source currentness is stale and progression is unavailable; the shared operator recovery presentation is `RECONCILE_AUTHORITY`. In Acceptance the pure decision in P4 §4.8 selects the source or material command; the recovery presentation does not select a command.
8. **RECOVERY** — a retryable current failure or resumable current-owner condition owns the next action; stale-currentness reconciliation does not collapse into this category.
9. **PROCESSING** — provider/automatic work is progressing and no higher category owns attention.
10. **ACTIONABLE** — the current coherent owner exposes its ordinary Start/Continue/Sign-off/Resume-class action or exact Acceptance submit/retest/accept action. Acceptance ACTIONABLE projects ACTION REQUIRED; queued review projects PROCESSING, unavailable proof BLOCKER, stale authority STALE_AUTHORITY.
11. **ORDINARY** — current material is inspectable with no workflow action requiring emphasis.

A lower category never exposes a competing primary mutation action while a higher category applies.

Recovery is likewise closed. A current failure/block/currentness condition resolves to exactly one of:

- `NONE`;
- `RETRY_CURRENT_STAGE`;
- `RESUME_CURRENT_OWNER`;
- `RECONCILE_AUTHORITY`;

For Acceptance, an actual stale authority observation takes precedence over unavailable candidate proof; a proof-unavailable blocker applies only when authority is current. When material currentness is `STALE(owner)`, current attention is `STALE_AUTHORITY` and the recovery route is `RECONCILE_AUTHORITY`. Outside Acceptance the recovery route supplies the exact action. Within Acceptance both stale branches share this recovery presentation; the pure AcceptanceDecision selects the exact source or material reconciliation command under §14.8A and P6 §38.3, even when both return to R1. Neither branch reclassifies stale currentness as generic `RECOVERY`.

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
current attention ACTIONABLE at AWAITING_ACCEPTANCE -> ACTION_REQUIRED
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

**Required behavior:** primary task content dominates; Supporting/Operational information uses one interaction-specific resource/timeline/action owner, with a selector only where peer selection is itself part of the task. A generic workflow-material selector is prohibited. Technical/Diagnostic information is removed from the productive task flow into the explicit inspection owner. Progressive disclosure cannot be satisfied by accumulating generic collapsed containers.

**Acceptance:** required Primary information is visible without opening inspection; Technical/Diagnostic information is absent from the ordinary productive surface unless the active decision explicitly requires that exact value; no adjacent/nested generic technical/supporting/history disclosure bars exist; opening the authorized Context/technical-inspection or Evidence owner exposes only its owned information; closing/returning restores the ordinary hierarchy without losing current attention.

### GW-FR-218-SPACE-CLASS-CONSISTENCY

**Required behavior:** equivalent Document, Dialogue, Review, Operational, Evidence and Result interactions use the same functional geometry. Task Dialogs use a stable header/body/footer anatomy; Markdown authoring preserves editor-control→canvas adjacency; supporting/technical inspection cannot insert another structural band into those relationships.

**Acceptance:** equivalent interaction classes preserve the same region order and action ownership across services; a feature cannot add a local disclosure row, action row or metadata band that changes the canonical task anatomy.

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

**Required behavior:** Complete presents one Terminal-result composition with the governed final outcome first, substantive result/evidence directly subordinate to that outcome, permitted follow-up attached to the result, and prior reached history available through the workflow rail.

**Acceptance:** Complete does not manufacture a separate current-attention region for a terminal outcome, does not repeat the same outcome label/explanation in multiple primary regions, and does not expose architecture/governance container terminology as product copy without explicit product-language authority.

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

**Required behavior:** every rendered Order Workbench service is classified under exactly one primary interaction-space class from §13; subordinate selection, explicit technical inspection, task-panel and safety/exception behavior use only the declared auxiliary classes and cannot create another persistent layout/navigation/disclosure grammar. Semantic regions are used only for their declared meaning: current-attention content cannot be substituted with a generic heading/status block merely to satisfy a component API.

**Acceptance:** adding a new feature, material type, Run/document/task count, configuration service or technical detail does not create a new screen geometry, generic workflow-summary/material selector or generic disclosure lane by implementation convenience. Supporting/history information retains one interaction-specific resource/timeline/action owner; technical information retains one explicit inspection owner. One selected task/material produces exactly one primary interaction composition: a primary interaction composition may not be wrapped or nested inside another primary composition, and transient Proposal Review/Evidence replace the owning material composition for the duration of explicit review/inspection. Operational scan, Review, Evidence and Terminal result do not fabricate an outer current-attention region when their class contract does not own one; Review verdict/currentness, ordered semantic sections and decisions remain inside `WorkbenchReview`, with no arbitrary Review body hierarchy. Canonical state classifications are not emitted as a generic status tuple or internal enum copy. If none of the §13 classes can express the required interaction, the change returns to DESIGN before implementation.

### GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE

**Required behavior:** every rendered Workbench service uses the single visual language in §11 for hierarchy, semantic color, typography, density, controls/forms, operational scanning, feedback, themes, focus and responsive continuity.

**Acceptance:** equivalent UI meaning is rendered equivalently across queue, creation, Settings and every WorkItem workflow surface; no feature/service owns a competing palette, typography scale, form/control grammar, status treatment, notice treatment, table/list density, timeline grammar, disclosure grammar or overlay style. Modal header/body/footer anatomy and editor control/canvas composition remain visually and structurally consistent wherever those interaction classes apply.

### GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE

**Required behavior:** every operator-visible workflow condition is expressible only through the closed orthogonal state primitives in §3.7 and the current-attention/recovery/execution projections in §21.9-§21.10.

**Acceptance:** P4/P6 and UI implementation do not invent a new lifecycle status, attention category, recovery route, proposal-adoption state, execution-owner state, validation-progress state or observation-coherence state to handle a local feature.

### GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION

**Required behavior:** the ten-stage workflow rail is the one persistent lifecycle summary projection defined in §3.8/§21.11, derived from canonical stage/reach/current-attention state and never used as lifecycle or command-admission authority.

**Acceptance:** the same canonical workflow facts always produce the same reach/current marker for every rail cell; historical selection cannot create a false current marker, and no feature supplies an independent rail status.

### GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION

**Required behavior:** equivalent semantic UI roles use the same component presentation language everywhere in the application under §11.12.

**Acceptance:** representative primary/secondary/destructive actions, fields, statuses, notices, operational rows, headings, explicit inspection surfaces and overlays are recognizably the same component family across Queue, Create, Settings and WorkItem workflow services; feature-local visual variants cannot redefine an already-owned role. A generic local Technical-details or Supporting-material/history accordion is not an equivalent component role and fails this requirement.

### GW-FR-235-GLOBAL-THEME-PARITY

**Required behavior:** System/Light/Dark is one application-global presentation preference under §11.13 and every rendered component/specialist surface preserves the same semantic hierarchy in each effective theme.

**Acceptance:** theme switching changes only presentation tokens/theme rendering, requires no reload, preserves workflow/selection/dirty state, produces no local theme island, and all workflow-significant states remain readable/distinguishable in both light and dark.

### GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION

**Required behavior:** Workbench task areas preserve the selected Change/Defect/Investigation/Audit information semantics throughout every applicable workflow step under §14.0.

**Acceptance:** a Defect never degrades into a generic Change after Research, and Investigation/Audit can terminate without empty downstream delivery documents.

### GW-FR-237-BOUNDED-AGENT-ACTIVITY

**Required behavior:** active agent work exposes bounded useful operational activity under §5.5 without exposing hidden reasoning, secrets or raw unbounded provider data.

**Acceptance:** Processing is not a black box when reliable activity is available, while missing optional telemetry never causes fabricated progress.

### GW-FR-238-PROPOSAL-CANCEL-CLOSURE

**Required behavior:** a pending or applying lifecycle proposal remains the sole mutation owner until explicit disposition/reconciliation; Cancel cannot orphan an unresolved proposal.

**Acceptance:** no admitted cancellation path can produce a closed/cancelled Run with a still-pending proposal that lacks a valid Adopt/Reject owner.

### GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION

**Required behavior:** the manual Implementation start action is scoped to the canonical current approved task of the selected WorkItem.

**Acceptance:** with multiple runnable WorkItems/tasks, invoking the visible current-task action cannot start another globally eligible task.

### GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE

**Required behavior:** a provider result rejected by Order's combined workflow grammar applies none of its requested workflow effects, fails the Run and leaves the WorkItem at the same workflow step.

**Acceptance:** the operator sees Failed plus governed Retry/recovery where eligible; no returned proposal/input/block/completion effect is partially applied.

### GW-FR-241-DERIVED-MATERIAL-MATURITY

**Required behavior:** Draft / Updated — validation required / Current / Stale / Historical / Signed & locked are derived presentation semantics over canonical facts, including repository drafts with no historical Run.

**Acceptance:** material maturity is intelligible without a duplicate persisted status owner and repository-draft visibility does not fabricate lifecycle history.

### GW-FR-242-DIALOGUE-REPLY-CONTEXT

**Required behavior:** every reply-capable pre-signoff interaction presents the selected attempt's human/agent conversation transcript and the substantive conversational anchor being replied to under §5.6.

**Acceptance:** free-form continuation is never offered without a visible preceding agent message; required input shows its exact question inline with the conversation; operational/system/technical events cannot replace or obscure the dialogue required to understand the reply.

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
20. A provider turn containing contradictory controlling events applies none of those returned workflow effects, fails the Run, leaves the WorkItem at the same workflow step and exposes governed Retry/recovery where eligible.
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
37. While any Run is active, Work request/title and editable lifecycle-document Save remain unavailable in the browser and rejected by the daemon.
38. A pending proposal makes Cancel unavailable; rejection restores ordinary open continuation and only then may Cancel become available.
39. With two runnable WorkItems/tasks, the manual Implementation current-task action starts exactly the displayed canonical current task and cannot advance the other WorkItem.
40. A deterministic repository lifecycle draft with no historical Run remains visible as Draft without fabricated reach/completion/conformance/readiness/approval state.
41. Change/Defect/Investigation/Audit task fixtures render the correct kind-specific Work request/Research information, and shared Change/Defect delivery steps preserve their distinct upstream obligations.
42. Processing can display bounded activity without exposing raw provider/session/tool payloads; optional activity telemetry loss does not alter canonical workflow state.
43. Every free-form continuation fixture shows the preceding substantive agent message and prior accepted operator/agent turns in the same Dialogue surface; removing that conversational anchor makes the composer unavailable.
44. Every required-input fixture shows the exact agent question inline with the selected attempt transcript and binds the composer to that question while preserving any additional agent explanation from the same turn.
45. Agent/user messages remain visually distinguishable from workflow events, operational activity, evidence and technical diagnostics even when all are present for the same attempt.
46. Every governed surface proves its §11.4A visibility contract in both directions: Primary information is visible by default; Technical/Diagnostic information is absent by default; the authorized WorkItem Context/Settings-diagnostics/Evidence/confirmation owner exposes the exact value only after explicit entry; a technical blocker promotes human-readable meaning/action without leaking raw diagnostic identity.
47. Candidate-producing work enters Acceptance automatically after full technical proof; no-code and historical completions do not fabricate acceptance. Review exact candidates/criteria/evidence, report, submit, autonomous independent correction, return and human retest; acceptance is unavailable for unresolved findings, stale/missing evidence, queued or active correction, historical selection and mismatched identity. Prove exact actor/decision persistence, restart, duplicate/stale commands, upstream routing, multi-task independent candidates, terminal acceptance and no delivery effects; prove same interaction/visibility/theme/responsive requirements as existing Review/Form/Evidence.

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
- how the productive STAGE result contract guarantees a human-readable conversational anchor whenever the resulting interaction is open for continuation, while preserving exact required-input question ownership when waiting for input;
- how the browser projects the persisted human/agent transcript independently from workflow-event/activity/technical feeds so reply eligibility and visible conversation cannot diverge;
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
