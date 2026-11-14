# 50 — Order Workbench functional design

**Status:** Binding functional design  
**Canonical concern ID:** GW-DOC-WORKBENCH-UX  
**Versioned concern ID:** GW-DOC-WORKBENCH-UX-V2  
**Pyramid layer:** P3 functional requirements  
**Supersedes:** GW-DOC-WORKBENCH-UX-V1  
**Scope:** WorkItem workflow interaction, state presentation, operator messaging, information hierarchy, spatial behavior, recovery behavior and responsive workbench behavior.

## 1. Purpose

This document is the canonical functional design for the Order Workbench.

Order is a software-work factory. The Workbench must let an operator understand and operate that factory without inferring hidden lifecycle state, provider activity, stale authority, recovery ownership or technical implementation details.

For every selected WorkItem, the Workbench must answer three questions immediately and continuously:

1. **Where is this work now?**
2. **What requires attention now?**
3. **What can the operator validly do next?**

This document replaces the accumulated V1 Workbench design and its later addenda. Historical V1 text remains useful as provenance only. It is not an alternate functional authority.

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

This is a binding stability requirement.

### 11.5 Master/detail is reserved for real master/detail work

A persistent master column is appropriate only when the operator genuinely scans a collection while working a selected detail, such as:

- Implementation tasks;
- a sufficiently large Approval task/material set;
- another interaction explicitly classified as operational master/detail.

When used:

- its width is stable for the lifetime of that workspace state;
- adding/removing collection rows does not change the column width;
- the detail pane owns remaining width;
- the master does not duplicate the workflow rail.

### 11.6 Context

Context is secondary and closed by default.

Opening Context is an explicit operator action.

On wide layouts it may use one bounded fixed-width trailing inspector if the primary task remains usable. Otherwise it is a drawer/overlay.

Context never auto-opens or auto-closes because workflow state changes.

Context contains compact metadata and secondary diagnostics only. It cannot become the sole location of the current blocker or required action.

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
| Document | Work request, R1/R2/DESIGN/PLAN | wide primary authoring/reading surface |
| Dialogue | active pre-signoff Run | remaining-height conversation with anchored composer |
| Review | proposal, readiness, approval | wide comparison/judgment surface |
| Operational master/detail | implementation | stable master + flexible detail |
| Evidence | logs, patches, exact bytes | wide remaining-height raw viewer |
| Terminal result | final outcome | concise classification + substantive result/evidence |
| Compact context | metadata/small utilities | bounded inspector/drawer |
| Safety/exception | conflict/confirmation | inline owning-state or modal confirmation |

A screen does not invent a new card/panel grammar merely because its content is unique.

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

### 14.7 Approval

Approval is one coherent Review workspace.

Primary hierarchy:

1. package currentness and readiness;
2. signed task meaning/scope/gates;
3. governed documents needed for judgment;
4. approver identity and Sign off exact package;
5. technical package hashes/commit identity.

Repeated signed tasks use scan-efficient rows/table/master-detail as needed. They do not become a vertical stack of cards.

### 14.8 Implementation

Implementation is stable operational master/detail.

The task master is persistent for the Implementation workspace and does not change width based on task state or row count.

The selected detail shows:

- objective/scope;
- current task state;
- current Run/attempt;
- current blocker or next action;
- validation state;
- chronological events;
- evidence/resources.

Current blocker ownership overrides stale selection for attention while still preserving historical inspection.

### 14.9 Complete

Complete presents the final governed outcome first.

Prior reached steps remain inspectable from the workflow rail.

Investigation/audit remediation action appears only where canonically permitted and remains attached to the terminal result.

## 15. Current-action precedence

When multiple materials exist, the Workbench resolves current attention using this precedence:

1. mutation conflict that prevents safe continuation;
2. unresolved required human input;
3. pending proposal decision required for progress;
4. current canonical blocker or failed recovery owner;
5. stale approval/readiness ownership;
6. current active processing state;
7. current startable/continuable workflow action;
8. ordinary current document/review/operational material;
9. historical operator selection.

Historical selection may remain displayed, but levels 1–7 must remain visible and directly reachable.

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

- one-line identity;
- one-line workflow rail;
- full primary task width;
- optional explicit Context;
- persistent master only for genuine master/detail classes.

### Medium

Secondary selectors/context become temporary before the primary task is compressed below its useful space class.

### Narrow

One primary material at a time.

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

## 21. Functional requirements

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

## 22. Required certification scenarios

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

## 23. Downstream technical-design obligations

GW-DOC-TECHNICAL-ARCHITECTURE and GW-DOC-CANONICAL-CONTRACTS must be re-evaluated against this V2 functional authority before implementation remediation begins.

The technical investigation must determine, without changing the behavior above:

- the canonical state-machine/statechart representation;
- the single authoritative transition function(s);
- how WorkItem lifecycle, Run lifecycle, turn occupancy, current attention and reach history are represented or derived;
- how commands are serialized;
- how command atomicity is guaranteed;
- how required-input idempotence is enforced;
- how proposal authority is admitted;
- how reads are made side-effect-free;
- how asynchronous transitions expose one coherent browser observation;
- how final event draining is guaranteed;
- how the UI consumes canonical state without a parallel browser state machine;
- how layout stability is enforced through the local Foundation/Astryx boundary;
- how permanent state-transition and geometry fitness tests are expressed.

No implementation task may invent those semantics locally.

## 24. Legacy V1 mapping

GW-DOC-WORKBENCH-UX-V1 is superseded.

Historical V1 requirements remain provenance for the 0.3.0 implementation but are not current authority where they conflict with this V2 document.

The V2 requirements intentionally consolidate the prior additive requirement stack into a smaller coherent contract. Downstream documents that cite exact V1 section/requirement identifiers must be revalidated before they are treated as current technical authority.

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

The next step is a P4/P6 state-machine and technical-boundary investigation under this functional authority.
