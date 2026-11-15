# Workbench technical architecture

**Status:** Binding P4 technical design  
**Canonical concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`  
**Pyramid layer:** P4 technical architecture

## 1. Purpose

This document is the technical owner for the Order Workbench realization under `GW-DOC-WORKBENCH-UX-V2`.

It resolves the state-machine, transition, observation, command-admission, browser-reconciliation and spatial-design obligations that were deliberately left open by the functional design. It does not preserve the superseded 0.3.0 component/spatial implementation where that implementation conflicts with current authority.

The implementation remains a functional-core / imperative-shell system. This design does not introduce a workflow framework, service/object graph, DTO layer, browser workflow store, event bus or second canonical state representation.

## 2. Governing authority

The realization conforms to:

- `GW-DOC-WORKBENCH-UX-V2`, including its functional state-transition model and §22 binding functional requirements;
- `GW-DOC-WORK-LIFECYCLE-V1 §2.1-§2.3` for the canonical cross-step lifecycle relation;
- `GW-DOC-LIFECYCLE-CONTEXT-V1` for stage decision/context/conformance boundaries;
- `GW-DOC-VALIDATION-STANDARD-V1` for post-signoff failure classification;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1` for FCIS/SoC topology and module/dependency ownership;
- `GW-DOC-CANONICAL-CONTRACTS-V1` for canonical P6 data, persistence and transport;
- `GW-P1-FCIS`, `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW` and `GW-P1-MINIMUM-CHANGE`.

## 3. Technical thesis

The existing canonical domain owners remain sufficient:

```text
WorkItem
Run
RunEvent
ArtifactRef
Approval
ExecutionTask
WorkItemSourceSnapshot / diagnostics
```

No new persisted `WorkflowState`, `WorkbenchState`, `TurnState`, `ReachedStage`, workflow-state table or browser-owned mirror is introduced.

The missing behavior is realized through:

1. pure transition/derivation functions over the existing canonical typed values;
2. closed STAGE-turn event-batch validation;
3. effectful daemon commands that re-check current state at the commit boundary;
4. explicit read-versus-reconcile separation;
5. browser observation of the existing canonical values with a deterministic coherence barrier;
6. stable Workbench spatial primitives.

The in-memory `runtime.stageTurnTasks` map remains process-occupancy bookkeeping only. It is never persisted, transported or treated as workflow authority.

## 4. Pure state-machine policy

### 4.1 Cross-step WorkItem transitions

`src/core/lifecycle.ts` remains the sole pure owner of WorkItem lifecycle transition policy.

Every daemon mutation of `WorkItem.stage`, `WorkItem.status` or `WorkItem.outcome` must obtain the next lifecycle tuple from that owner. Daemon/shell code must not invent an ad-hoc stage/status/outcome assignment.

The owner retains/refines the existing transition functions rather than introducing a generic state-machine dependency:

- stage completion/promotion and R3 returns;
- Work request/source-change return;
- lifecycle-artifact-edit return;
- current-stage block;
- current-stage resume;
- explicit sign-off transition;
- classified execution return;
- aggregate execution completion.

The source-change rule is corrected to the P3 state model:

```text
IDEA source save                  -> IDEA / ACTIVE
progressed pre-signoff source save -> R1 / ACTIVE
AWAITING_SIGNOFF source change     -> R1 / ACTIVE
COMPLETE source observation        -> COMPLETE / COMPLETE
```

Only explicit Start Research crosses IDEA -> R1.

### 4.2 Derived STAGE Run interaction

`src/core/lifecycle.ts` owns one browser-safe pure derivation from a canonical `Run` plus its ordered `RunEvent[]`.

Conceptually:

```text
stageRunInteraction(run, events)
  -> PROCESSING
   | OPEN
   | REQUIRED_INPUT(requestEventId)
   | CLOSED
```

This is a pure decision value only. It is not a Zod schema, persisted record, HTTP response model or browser state store.

Derivation rules:

- terminal Run status -> CLOSED;
- `WAITING_FOR_INPUT` requires exactly one unresolved `HUMAN_INPUT_REQUESTED` and derives REQUIRED_INPUT with that exact event id;
- an active STAGE Run whose latest accepted turn trigger (`STAGE_STARTED` or `HUMAN_INPUT_RECEIVED`) has no later complete provider-result batch derives PROCESSING;
- an active STAGE Run whose latest turn has settled without required input/block/completion derives OPEN;
- contradictory/malformed event history is invalid canonical state and fails closed rather than being prioritized heuristically.

The UI and daemon use this same pure function. `Run.status === "RUNNING"` is never used as Send eligibility.

### 4.3 STAGE provider-turn grammar

A pure core function validates the complete provider-result array before any event from that array is persisted.

It enforces `GW-DOC-WORKBENCH-UX-V2 §21.2`:

- provider-result array is non-empty;
- at most one controlling event exists;
- at most one `HUMAN_INPUT_REQUESTED`;
- at most one `STAGE_BLOCKED`;
- at most one `STAGE_COMPLETED`;
- required-input/block/completion combinations are mutually exclusive;
- at most one lifecycle proposal is emitted in a turn;
- a lifecycle proposal exists only in an OPEN-result turn and cannot coexist with required input, block or completion;
- no new lifecycle proposal is accepted while an earlier lifecycle proposal on that Run is unresolved;
- a lifecycle proposal role equals the owning STAGE Run stage;
- `STAGE_COMPLETED.completion.stage` equals the owning Run stage.

General provider-role/tag admission remains owned by the existing provider-event admission policy. This Workbench rule adds the STAGE turn grammar; it does not create a second event union.

### 4.4 Required-input admission

Input admission is derived from the same canonical interaction function.

```text
PROCESSING
  -> reject all input

OPEN
  + requestEventId == null
  -> accept one free-form continuation

REQUIRED_INPUT(Q)
  + requestEventId == Q
  -> accept exactly once

REQUIRED_INPUT(Q)
  + null / other Q / already-resolved Q
  -> reject

CLOSED
  -> reject
```

The accepted `HUMAN_INPUT_RECEIVED` event resolves the required request before the next provider turn is scheduled.

### 4.5 Monotonic reached history

Reached history is derived, not separately persisted.

A browser-safe pure function in `src/core/lifecycle.ts` consumes canonical `WorkItem`, `Run[]`, relevant `RunEvent[]`, `ArtifactRef[]` and `ExecutionTask[]` and returns the reached `WorkStage` set.

The derivation uses evidence of actual entry:

- IDEA is always reached;
- current non-terminal stage is reached;
- every STAGE/EXECUTION Run proves its Run stage was reached;
- lifecycle ArtifactRefs prove their owning stage was reached;
- each accepted `STAGE_COMPLETED` proves its destination was reached;
- R3 `READY_FOR_SIGNOFF` proves AWAITING_SIGNOFF was reached;
- materialized signed execution tasks or an EXECUTION Run prove AWAITING_SIGNOFF and EXECUTION were reached;
- current COMPLETE proves COMPLETE, while prior-stage reach remains evidence-derived so an R1-terminal investigation/audit does not falsely appear to have traversed R2..EXECUTION.

The function never infers historical reach solely from current-stage ordinal.

`workflowStepState(...)` becomes:

```text
selected == current        -> CURRENT
reached has selected       -> HISTORICAL
otherwise                  -> UNREACHED
```

### 4.6 Current attention and action ownership

Current attention remains a pure presentation derivation from canonical values and the shared lifecycle policy. It does not persist another status.

The precedence is exactly `GW-DOC-WORKBENCH-UX-V2 §15`.

Historical selection may choose what detail is displayed, but it never changes the derived current attention owner or mutation eligibility.

Execution current ownership is derived before historical selection:

1. current blocked task;
2. current RUNNING task/active task Run;
3. next eligible/current task;
4. historical explicit selection only as inspection detail.

### 4.7 Canonical action-admission matrix

The daemon is authoritative for mutation admission. The browser uses the same pure core predicates where the relevant canonical inputs are already loaded so it can avoid offering predictably invalid actions; server rejection remains mandatory for stale/concurrent clients.

| Action | Required current condition | State effect |
|---|---|---|
| Start Research | IDEA / ACTIVE; source valid/current enough; no active Run; observation coherent | explicit IDEA -> R1 + new STAGE Run / PROCESSING |
| Start current pre-signoff stage | current R1/R2/DESIGN/PLAN/R3 / ACTIVE; no prior unresolved failed/blocking recovery owner; no active Run; no reconciliation/context blocker | new same-stage STAGE Run / PROCESSING |
| Retry failed current-stage Run | current stage / ACTIVE; latest current-owner Run is retryable failure; no active Run | new same-stage STAGE Run / PROCESSING; generic Start suppressed |
| Send free-form continuation | current STAGE Run interaction OPEN; no pending required input; request id null | append input, same stage / PROCESSING |
| Answer required input | current interaction REQUIRED_INPUT(Q); exact Q; unanswered | append bound input, same stage / PROCESSING |
| Cancel STAGE Run | current Run active in PROCESSING/OPEN/REQUIRED_INPUT | terminal CANCELLED Run; same WorkItem stage |
| Adopt lifecycle proposal | current stage Run OPEN; exactly one pending proposal; role/path match current stage | same WorkItem stage; authority/conformance changes, context refresh required; free-form continuation suppressed until disposition |
| Reject lifecycle proposal | same current/pending/open ownership as adoption; no adoption request persisted | same WorkItem/Run interaction, proposal closed; free-form continuation becomes eligible again |
| Save Work request/source | pre-signoff/AWAITING_SIGNOFF; no active Run; expected hash current | IDEA stays IDEA; progressed work returns R1 |
| Save lifecycle document | editable already-reached owner; no active Run; expected hash current | return/remain at artifact owner |
| Resume pre-signoff blocker | same stage / BLOCKED; blocker proven resolved; no active Run | same stage / ACTIVE |
| Sign off | AWAITING_SIGNOFF / ACTIVE; exact displayed package still current; no competing mutation | EXECUTION / ACTIVE + Approval/tasks |
| Resume execution | EXECUTION / BLOCKED; exactly current blocked task; approval current; blocker resolved | EXECUTION / ACTIVE; blocked task becomes eligible |
| Archive/restore | existing archive policy; no active Run; no competing mutation | archive projection only; lifecycle unchanged |

A selected historical material item never satisfies a current-action precondition merely because it contains an old control. Action ownership always resolves from the current canonical WorkItem/Run/task/proposal/input facts.

## 5. Daemon command architecture

### 5.1 Command admission principle

Every workflow mutation follows:

```text
parse canonical command
  -> perform required read-only external inspection
  -> derive admission/transition with core policy
  -> enter SQLite transaction
  -> reload canonical DB state
  -> re-run all DB-decidable admission checks
  -> persist one coherent transition/event set
  -> commit
  -> perform/schedule only the explicitly authorized external continuation
```

No state-changing command relies solely on a pre-`await` state check.

No generic mutation queue/service is introduced. The single daemon uses one process-local per-WorkItem mutation guard for operator commands, held across any asynchronous inspection/filesystem effect and final persistence. A concurrent operator mutation for the same WorkItem is rejected rather than queued. The guard is ephemeral synchronization only: it is not persisted, transported or treated as workflow state.

Inside that guard, SQLite transaction re-checks plus existing expected-hash/durable-intent mechanisms close the final commit boundary. Background provider-turn finalization is not held behind a long-lived guard while OpenCode executes; it uses final transactional compare/recheck so provider completion and Cancel have a deterministic winner.

### 5.2 Start STAGE Run

`startStageRun`:

1. inspects source/context without reconciling/mutating;
2. rejects with an actionable reconciliation-required conflict when the canonical repository source requires reconciliation;
3. resolves context/provider prerequisites;
4. inside the final transaction reloads the WorkItem, proves the same current stage/status and proves no active Run;
5. applies IDEA -> R1 only for explicit Start Research;
6. inserts the Run and `STAGE_STARTED` atomically;
7. commits;
8. schedules the provider turn asynchronously.

Concurrent Start commands therefore cannot create two active Runs even though context resolution contains `await` boundaries.

### 5.3 Provider-turn finalization

Provider output is handled as one turn batch.

The daemon:

1. waits for OpenCode turn completion;
2. validates every payload/evidence reference;
3. validates the complete STAGE turn grammar before persisting any provider event;
4. re-inspects current stage context without mutating repository/WorkItem state;
5. derives the complete reaction;
6. enters one transaction;
7. reloads Run/WorkItem and proves the Run has not been cancelled/terminalized and the same turn trigger is still current;
8. appends the entire provider-result batch;
9. appends coordinator-owned conformance/reaction events where required;
10. updates Run and WorkItem state atomically;
11. commits.

A browser never observes a partial provider-result batch.

If cancellation wins the finalization race, the provider result cannot later promote/block/change the cancelled Run or WorkItem.

### 5.4 Human input

`submitRunInput` no longer waits synchronously for the next OpenCode turn.

Inside one transaction it:

1. reloads Run + events;
2. derives current interaction;
3. validates free-form versus exact-required-input admission;
4. appends one `HUMAN_INPUT_RECEIVED`;
5. changes `WAITING_FOR_INPUT -> RUNNING` when answering required input;
6. commits.

It then schedules the provider turn asynchronously and immediately returns the accepted canonical `HUMAN_INPUT_RECEIVED` event.

This makes PROCESSING an observable state rather than a long-pending HTTP mutation.

### 5.5 Cancel

Cancel interrupts/stops the active provider effect first, then enters a transaction and reloads the Run.

- if the Run is still active, cancel terminalizes it;
- if provider finalization already terminalized it, Cancel is rejected as no longer admissible and does not overwrite the terminal result;
- post-signoff cancellation additionally performs the existing atomic task/WorkItem block reaction.

### 5.6 Proposal disposition

Lifecycle-proposal adoption rechecks:

- proposal belongs to a current STAGE Run;
- Run stage equals current WorkItem stage;
- Run interaction is OPEN;
- proposal is the single unresolved lifecycle proposal for that Run;
- proposal lifecycle role equals Run stage;
- deterministic target path matches that same stage;
- proposal is not already dispositioned/adoption-requested.

Adoption retains the existing durable-intent-before-filesystem-effect pattern.

For lifecycle proposals, successful adoption keeps the WorkItem at the same current owning stage. It stores the new ArtifactRef, invalidates downstream conformance, dispositions the proposal and requires context re-resolution before the next turn. Adoption itself never performs stage progression.

Non-lifecycle proposal capability remains governed by its existing canonical authority and cannot use a lifecycle role/return as a shortcut.

### 5.7 Direct Markdown/source mutations

Source/title/body and lifecycle-artifact Save:

- execute under the per-WorkItem operator-mutation guard;
- are rejected while any Run for the WorkItem is active;
- use existing expected-hash compare/write semantics;
- recheck active-Run/current-stage admission immediately before the filesystem effect;
- read back/hash the exact written bytes;
- persist the projection plus the pure lifecycle transition;
- on a post-effect persistence failure, synchronously attempt the existing explicit reconciliation path before returning; if reconciliation cannot complete, return an explicit reconciliation-required failure rather than a generic rejected-action message.

IDEA Work request Save remains IDEA. Progressed source mutation returns to R1. Lifecycle-artifact Save returns to the already-reached artifact owner.

### 5.8 Sign-off and resume

Sign-off is the only AWAITING_SIGNOFF -> EXECUTION command and executes under the per-WorkItem operator-mutation guard.

The command computes the exact package read-only, compares the submitted expected hash, and immediately before storing Approval/tasks rechecks that the WorkItem is still AWAITING_SIGNOFF / ACTIVE and the exact package/currentness preconditions still hold.

Resume never performs source reconciliation implicitly. If source/authority drift prevents safe resume, Resume rejects with the owning reconciliation/blocker reason and leaves canonical state unchanged.

## 6. Observational read architecture

### 6.1 Rule

Every GET/query is side-effect free with respect to SQLite workflow state and repository bytes.

The following current implementation patterns are removed:

- `GET source -> revalidateWorkItemSource() -> applyPlan()`;
- `GET lifecycle-artifacts -> currentFileArtifact() -> storeArtifact()`;
- `GET signoff-package -> revalidate/currentness check -> update WorkItem lifecycle`.

### 6.2 Source inspection versus reconciliation

The existing source pipeline is split conceptually into:

```text
inspect source
  -> current bytes/snapshot + diagnostic/reconciliation plan
  -> NO mutation

explicit reconcile
  -> reject if an affected WorkItem has an active Run or operator mutation
  -> apply inspected plan
  -> update WorkItem projection/lifecycle
  -> materialize deterministic lifecycle drafts as needed
```

Productive commands may perform the same inspection as a precondition but must reject when reconciliation is required; they do not silently apply the reconciliation and then report their own command as failed. Full/manual reconciliation is itself an authority mutation and cannot apply changes to a WorkItem while that WorkItem has an active Run.

### 6.3 Lifecycle artifact inspection

`GET lifecycle-artifacts` returns only already-canonical ArtifactRefs whose current repository bytes can be inspected without creating a new ArtifactRef.

Changed/new deterministic lifecycle files become canonical through explicit reconcile/save/adopt/stage-output commands, not through the GET.

Historical ArtifactRefs remain available through the ordinary artifact history query.

### 6.4 Sign-off package inspection

`GET signoff-package` is non-mutating.

It may:

- return the exact current sign-off package when currentness is proven; or
- return the existing stable typed stale/precondition error when currentness cannot be proven.

It never performs the upstream lifecycle return.

The Workbench keeps the reached R3/Plan/package material inspectable and exposes explicit reconciliation/current-owner action. Sign-off remains disabled until the package is current.

## 7. Browser canonical observation

### 7.1 Canonical queries

The browser continues to consume existing canonical values. No `WorkflowObservationDto`, view-model schema or second browser store is introduced.

For a selected WorkItem the Workbench uses:

- the existing single-WorkItem query as the current WorkItem owner, rather than relying only on the queue-list snapshot;
- Run list;
- canonical RunEvents for the relevant Runs;
- lifecycle/historical ArtifactRefs;
- source snapshot/diagnostics;
- ExecutionTasks;
- sign-off package when applicable.

Historical STAGE RunEvents are loaded through their existing canonical per-Run event endpoint as needed to derive reached history. A new aggregate history DTO/endpoint is unnecessary.

### 7.2 Active polling

While any Run for the selected WorkItem is active:

- selected WorkItem query polls every 1000 ms;
- Run list polls every 1000 ms;
- each active RunEvent query polls every 1000 ms;
- current task/artifact/package queries needed by the current step are invalidated/refetched when the controlling Run changes.

Polling remains transport behavior only.

### 7.3 Terminal drain

When a previously active Run is observed terminal:

1. perform one final RunEvent fetch after the last seen sequence;
2. refetch the selected WorkItem;
3. refetch the affected task/artifact/sign-off/source-diagnostic queries;
4. update reached history/current attention from those canonical values;
5. only then expose the resulting next workflow action.

The event query is not disabled merely because the Run list first reported terminal.

### 7.4 Coherence barrier

A pure presentation check suppresses mutation controls while canonical query values show an unobserved reaction.

Examples:

- RunEvents contain accepted `STAGE_COMPLETED` but selected WorkItem still reports the prior stage;
- RunEvents contain accepted `STAGE_BLOCKED` but WorkItem status still reports ACTIVE;
- an execution Run terminalized but task/WorkItem query has not yet observed its reaction;
- a mutation is pending or a required dependent query is refetching after a controlling transition.

The UI displays a neutral updating/processing state during this short reconciliation window. It does not infer the missing transition locally.

## 8. Workbench presentation architecture

### 8.1 Structural shell and layout ownership

The Workbench has one outer layout topology:

```text
application toolbar
work-item identity row
workflow rail
primary task surface [ + explicit Context when opened ]
```

The first three rows are structurally stable. Their geometry is owned by the Workbench shell, not by the selected workflow material. The step summary/current-attention band also has a stable height within each responsive class: blocker/failure/input/proposal state changes replace content inside that band rather than inserting a new structural header row that shifts the primary surface.

No step component may insert another persistent outer navigation column into that topology merely because its local collection grows.

### 8.2 WorkItem identity row

Wide identity layout uses exactly three structural groups:

```css
grid-template-columns: auto minmax(0, 1fr) auto;
```

1. navigation controls such as Back;
2. WorkItem identity/title plus concise overall status;
3. true WorkItem-level utilities such as Context/archive.

There is no unused/future placeholder column and no content-sized middle utility column.

The title is single-line/truncated at wide/medium widths. Adding/removing an action or changing action text does not change the structural column count or create a new row.

At narrow width the same three semantic groups may recompose into a deterministic two-row layout; content length does not create an arbitrary third row.

### 8.3 Workflow rail

Wide:

```css
grid-template-columns: repeat(9, minmax(0, 1fr));
```

All nine stage cells occupy one stable rail. State/current markers render inside the cell and never change border/width metrics.

Medium/narrow layout keeps one horizontal rail with stable item geometry and horizontal overflow. It never wraps into multiple lifecycle-navigation rows.

Responsive scrolling is confined to the workflow rail; the page itself must not require horizontal scrolling to identify the current step or primary action.

### 8.4 Generic step frame boundary

The generic `WorkflowStepFrame` owns only:

- step summary/current-attention band;
- one primary material region.

It does **not** own an optional `start`/side-index slot, content-count-dependent rail, or generic master/detail behavior.

This is the key layout boundary: interaction classes choose their own secondary-navigation treatment without allowing an object count to alter the outer frame.

### 8.5 Pre-signoff document/dialogue steps

Research/Requirements/Design/Plan use no persistent step-local side rail.

Runs/documents/proposals/evidence are selected through one compact step-local material selector inside the primary surface. It may be a compact disclosure/list control on wide/medium and a drawer/popover on narrow, but the control itself occupies the same structural slot whether it contains one item or many.

Adding a second attempt/document changes selector contents only. The primary surface x-position and width are invariant for the same viewport/Context state.

Supporting context is subordinate material, not another navigation rail and not the first row before current work. Access to source/upstream documents belongs in the compact material selector or an explicitly secondary disclosure after the current attention/material, so it cannot push a blocker/failure/dialogue down the page.

### 8.6 Readiness

Readiness is Review-class first.

Its stable primary region contains verdict/currentness, findings/defective owner and the governed R3 review material. Attempts/package/evidence use the same compact subordinate selector pattern as secondary review material.

Readiness does not use the generic persistent side-index treatment.

A real REQUIRED_INPUT state may temporarily own the current action/composer without changing the surrounding Review layout class.

### 8.7 Approval

Approval is one coherent Review surface.

Default wide composition is:

```text
package currentness/readiness
signed task table/list
governed document access
approver + Sign off exact package
collapsed/on-demand technical identity
```

Approval does not use a generic persistent package/document/task navigation rail.

If the signed task collection becomes large enough to require genuine master/detail, that is one stable Approval layout state with a fixed master-width token; merely having more than one document/task does not toggle the layout.

Package/source/baseline hashes and commit identity remain collapsed technical detail or explicit Context; they do not occupy the default primary top hierarchy.

### 8.8 Implementation

Implementation alone uses the default persistent operational master/detail split.

Wide:

```text
fixed task/attempt master | minmax(0, 1fr) detail
```

The master uses one fixed Workbench width token for the entire Implementation workspace. Task count, task state, attempt count and badges do not alter that width.

The master contains task scanning and subordinate attempt selection. The detail owns objective/scope, current action/blocker, selected Run, validation, chronology and evidence/resources.

Before validation evidence exists, the detail shows a compact validation state such as “Not started” rather than an eight-row V0–V7 table of identical “Not recorded” values. Once validation evidence exists, recorded/current validation stages are scan-visible and the complete matrix remains inspectable without overtaking the current task/action.

On medium/narrow widths the master becomes a temporary drawer/stack before detail readability is compromised.

Historical task/attempt selection never displaces the independently derived current-attention owner.

### 8.9 Context

Context is closed by default.

The WorkItem-level Context control is a true toggle with `aria-expanded` semantics. The open inspector/drawer also exposes a visible explicit close action.

At wide width Context uses one fixed bounded context-width token. Opening/closing Context is the only state-driven addition/removal of this trailing column.

Medium/narrow use a drawer/overlay and do not compress the primary canvas.

Canonical diagnostics never auto-open or auto-close Context.

### 8.10 Responsive class ownership

Workbench responsive classes have one technical owner and one breakpoint set:

```text
wide   >= 1280px
medium 800px .. 1279px
narrow < 800px
```

The React layout hook and Workbench CSS use these same thresholds. A second Workbench breakpoint such as 1000px is not allowed to independently change the same structural regions.

The responsive class may change the representation of secondary selectors/master/Context, but it does not change semantic ownership, current attention, selected material or unsaved state.

At narrow width, application-global toolbar utilities use one compact/overflow composition rather than wrapping account, Settings and theme controls into multiple competing rows. Theme/account detail may move behind a compact utility control; the current WorkItem identity and current workflow action remain visually prior.

### 8.11 CSS/layout hygiene

Each structural Workbench selector has one live declaration owner outside intentionally scoped media overrides.

Superseded duplicate base declarations and unused layout systems are removed rather than left as latent alternatives. In particular, an abandoned Implementation master/detail CSS system and a generic side-index system may not coexist as competing layout authorities.

Permanent architecture fitness treats duplicate base structural selectors and production CSS classes with no production consumer as review failures when they represent obsolete Workbench layout systems.


### 8.12 Closed Workbench screen-construction primitive vocabulary

The Workbench vocabulary is closed for **Order-owned screen structure and recurring interaction mechanics**. Feature/workflow modules map canonical state and domain content into this vocabulary; they do not create competing shell, navigation, selection, dialogue, review, master/detail, Context, disclosure or confirmation mechanics directly from Astryx or raw CSS.

This closure is intentionally not a wrapper around every Astryx component. Presentational leaf components and cohesive domain/content mechanisms remain legal inside the named primitive slots as defined in §8.16.

The target Order-local primitive vocabulary under `ui/src/primitives/` is:

| Primitive | Sole Order-owned responsibility | Deliberately absent flexibility |
|---|---|---|
| `WorkbenchLayout` | one outer Workbench topology: toolbar, identity, workflow rail, primary surface and optional Context; owns responsive class and Context representation | no arbitrary left/start/sidebar slot; no caller breakpoint/width values; no domain/query logic |
| `WorkbenchToolbar` | application/local toolbar grouping and compact utility behavior | no workflow-stage/current-attention policy; no arbitrary structural row creation |
| `WorkbenchIdentity` | stable three-group WorkItem identity row: navigation, identity/status, utilities | no fourth placeholder/action column; no content-driven row/column topology |
| `WorkbenchRail` | one stable equal-cell horizontal workflow navigation rail with constrained-width scrolling | no content/status-derived cell widths; no wrapping/multi-row mode; no lifecycle semantics |
| `WorkbenchSurface` | stable current-attention region plus one primary material region and optional compact selector slot | no structural side rail/master slot; no caller responsive topology choice |
| `WorkbenchAttention` | stable current-attention presentation: identity/state, concise purpose/status, one owning blocker/feedback region and one current action region | no lifecycle/current-attention derivation; no second competing action owner |
| `WorkbenchSelector` | compact subordinate material selection; primitive-owned inline/disclosure/overlay representation by responsive class | item count never changes surrounding columns; no persistent rail mode; no caller width/breakpoint |
| `WorkbenchDialogue` | remaining-height dialogue mechanics: transcript scrolling, anchored composer region, focus/keyboard continuity and empty/pending presentation slots | no Run/RunEvent/query ownership; no input-eligibility/provider-turn policy |
| `WorkbenchReview` | one review hierarchy: currentness/verdict, substantive review body, decision actions and subordinate technical detail | no generic persistent navigation column; no domain-specific package/task semantics |
| `WorkbenchMasterDetail` | the one legal persistent operational master/detail topology with fixed master-width token and primitive-owned constrained-width collapse | no caller-defined master width; master is not conditionally created from collection count; only explicitly master/detail interaction classes may use it |
| `WorkbenchContextPanel` | compact secondary metadata/diagnostic body plus explicit close affordance; hosted only by `WorkbenchLayout` | no current-action/blocker ownership; no independent responsive/sidebar behavior |
| `WorkbenchDisclosure` | one consistent collapsed/on-demand secondary-detail mechanic for technical/supporting information | no primary action ownership; no nested lifecycle/navigation axis; collapsed state cannot alter outer topology |
| `WorkbenchConfirmation` | accessible modal confirmation mechanics for destructive/irreversible/dirty-navigation decisions, including focus return and confirm/cancel placement | no mutation or admission policy; no domain-specific decision semantics; no arbitrary modal-layout slots |
| `WorkbenchAction` | shared Workbench action/button grammar, accessible labeling, loading/disabled/icon treatment and bounded tone vocabulary | no authorization/admission/current-action policy |
| `WorkbenchState` family | non-domain empty/loading/error/pending state presentation used inside the owning primitive/material | no lifecycle-state derivation; no persistent layout ownership |
| `WorkbenchResourceRow` | one scan-efficient resource identity/detail/open-action row | no resource query/mutation ownership; no nested card/panel system |
| `WorkbenchIcon` | canonical icon mapping/presentation | no action or domain semantics |

The vocabulary is complete at the level that must be shared to prevent layout/interaction drift. Cohesive content owners such as `MarkdownEditor`, `MarkdownSourceEditor`, `EvidenceViewer`, proposal/package content and domain-specific tables remain feature/content mechanisms rather than being generalized into primitives merely to increase reuse.

The exact filenames may be combined only when two rows remain one independently testable responsibility. Their semantic APIs/invariants may not be collapsed into a generic "panel/layout with arbitrary slots" primitive.

Adding a new Order-owned Workbench primitive is an architecture change. It requires an upstream DESIGN amendment proving that the mechanic is not already expressible by this vocabulary and that it represents a reusable interaction responsibility rather than a feature-specific convenience wrapper.

### 8.13 Target primitive API shapes

The primitive APIs are intentionally narrow. The following shapes are normative at the semantic level; P7 may adjust React typing syntax without adding another structural or interaction degree of freedom.

```ts
WorkbenchLayout({
  toolbar,
  identity,
  workflowRail,
  primary,
  context: {
    open,
    onOpenChange,
    content,
  } | null,
})
```

There is no generic `children`-only outer Workbench contract and no `start`/`left`/`sidebar` slot. The primitive owns named outer grid areas and responsive Context behavior.

```ts
WorkbenchIdentity({
  navigation,
  identity,
  utilities,
})
```

The primitive owns the three-group geometry in §8.2. Callers cannot add a fourth structural group or pass column definitions.

```ts
WorkbenchRail({
  items: ReadonlyArray<{
    id,
    label,
    state,
    selected,
    onSelect,
  }>,
})
```

The caller supplies generic item presentation only. The primitive owns equal-cell geometry and constrained-width scrolling. It exposes no per-item width.

```ts
WorkbenchSurface({
  attention,
  selector?,   // compact/non-structural only
  material,
})
```

It exposes no persistent `start`, `aside`, `master`, `columns` or breakpoint props. `selector` is always rendered inside the surface control/header region and cannot change primary x-position/width.

```ts
WorkbenchAttention({
  title,
  purpose?,
  state?,
  status?,
  blocker?,
  action?,
})
```

The caller supplies already-derived presentation values. The primitive owns stable attention-band geometry and the single visible blocker/action regions; it does not derive which blocker/action is current.

```ts
WorkbenchSelector({
  label,
  groups,
})
```

Groups/items contain generic id/label/description/status/selected/onSelect presentation only. The primitive chooses its compact representation from the shared responsive class. Item count never selects another topology.

```ts
WorkbenchDialogue({
  transcript,
  composer,
  state?,
})
```

The primitive owns remaining-height transcript/composer geometry, transcript scrolling, anchored composer placement and accessible focus/keyboard mechanics. It does not know Run ids, provider state, whether input is currently admissible or which mutation sends a turn.

```ts
WorkbenchReview({
  currentness,
  summary,
  body,
  decisions,
  technicalDetails?,
  selector?,
})
```

`technicalDetails` is on-demand/collapsed through the shared disclosure mechanic. There is no navigation/sidebar slot.

```ts
WorkbenchMasterDetail({
  master,
  detail,
  masterLabel,
})
```

The master is required by the interaction-class choice and uses the single Workbench master-width token. There is no `masterWidth`, `collapseAt`, `showMasterWhen` or collection-count prop.

```ts
WorkbenchContextPanel({
  title,
  onClose,
  children,
})
```

The Context body may contain secondary metadata/diagnostics only. The enclosing `WorkbenchLayout` chooses wide inspector versus constrained drawer/overlay; the feature does not.

```ts
WorkbenchDisclosure({
  label,
  content,
})
```

It is collapsed by default for secondary technical/supporting detail and owns the shared accessible disclosure mechanic. A feature may not use it to hide the only blocker, required action or primary task material.

```ts
WorkbenchConfirmation({
  open,
  title,
  description,
  confirmLabel,
  confirmTone,
  onConfirm,
  onOpenChange,
})
```

It owns modal focus/escape/return and consistent confirm/cancel placement. The feature owns the decision to open it and the mutation executed by confirmation.

The existing shared atoms retain narrow semantic contracts:

- `WorkbenchToolbar` owns toolbar grouping/compact utility mechanics only;
- `WorkbenchAction` owns button interaction/presentation only;
- the `WorkbenchState` family owns non-domain empty/loading/error/pending presentation only;
- `WorkbenchResourceRow` owns one resource row grammar only;
- `WorkbenchIcon` owns icon mapping only.

### 8.14 Primitive API laws

All Order-owned Workbench primitives obey the applicable laws below:

1. **Domain-blind:** no primitive imports `WorkItem`, `Run`, `RunEvent`, `ExecutionTask`, `WorkStage`, proposal or Approval domain types. Feature composition maps canonical domain state into generic primitive props.
2. **Query-blind:** primitives execute no TanStack queries/mutations and own no invalidation. They receive already-derived labels/items/actions/content.
3. **Policy-blind:** primitives do not decide current attention, reached state, input eligibility, blocker ownership, lifecycle progression or command admission.
4. **Count-blind topology:** collection length may alter selector/list/master rows but may never select a different persistent column/grid topology.
5. **Single responsive owner:** structural responsive decisions are internal to the primitive layer using the §8.10 class contract. Feature components do not call an exported wide/narrow hook to choose alternate structural markup.
6. **Token-owned geometry:** context width, operational master width, rail/identity/attention heights and structural gaps are CSS tokens defined once for the Workbench primitive system. Callers do not pass ad-hoc width values.
7. **Named constrained slots:** primitives expose only the semantic slots they own. They do not expose arbitrary `start`, `end`, `sidebar`, `rail`, `columns`, `width`, `breakpoint`, `slots` or generic layout-variant props that recreate Astryx freedom above the primitive boundary.
8. **Composition over configuration:** a different interaction class uses the corresponding primitive/composition rather than a `variant="review|dialogue|master"` mega-primitive whose props can combine invalid topologies.
9. **Accessible behavior is primitive-owned:** drawer focus/escape, Context close, rail scrolling, selector disclosure, dialogue transcript/composer focus/scroll, secondary disclosure and modal confirmation focus-return behavior are implemented once in the primitive responsible for that behavior.
10. **Astryx containment:** Astryx remains the low-level interaction substrate. Workbench feature surfaces do not directly import Astryx components that establish a mechanic already owned by this vocabulary, including structural `Layout`/`Drawer`, Workbench dialogue layout/composer scaffolding or confirmation `Dialog`. Those capabilities are wrapped by the corresponding local primitive.
11. **Leaf-content freedom:** presentational Astryx/semantic-HTML leaves such as Badge, Table, MetadataList, CodeBlock, Markdown, TextInput and local Stack/flow composition may remain feature-local inside primitive slots when they cannot establish persistent Workbench topology or a competing recurring interaction mechanic.
12. **Closed extension:** a feature-specific need does not justify a new primitive, prop family or CSS topology. A new reusable primitive requires DESIGN authority and permanent fitness coverage in the same implementation change.

### 8.15 Canonical screen-construction grammar

The functional interaction classes in `GW-DOC-WORKBENCH-UX-V2 §13` map to the primitive vocabulary exactly:

```text
Operational scan
  -> WorkbenchSurface or an already-defined queue shell
     + dense Table/List leaf content
     + WorkbenchAction / WorkbenchState as needed

Document
  -> WorkbenchSurface
     attention = WorkbenchAttention
     selector = optional WorkbenchSelector
     material = document/editor/read-only content
     secondary detail = optional WorkbenchDisclosure

Dialogue
  -> WorkbenchSurface
     attention = WorkbenchAttention
     selector = optional WorkbenchSelector
     material = WorkbenchDialogue(transcript, composer, state)

Review (proposal/readiness/approval)
  -> WorkbenchReview
     + optional WorkbenchSelector for subordinate material
     + WorkbenchDisclosure for secondary technical detail
     + WorkbenchAction for the already-derived decision action

Operational master/detail (Implementation)
  -> WorkbenchMasterDetail
     master = task/attempt operational scan
     detail = WorkbenchSurface
              + WorkbenchAttention
              + selected task/run/evidence content

Evidence
  -> WorkbenchSurface
     + WorkbenchAttention when current action/return context exists
     + raw/evidence viewer content

Terminal result
  -> WorkbenchSurface
     + terminal classification/result/evidence content

Compact context
  -> WorkbenchContextPanel hosted only by WorkbenchLayout
     + optional WorkbenchDisclosure for deeper diagnostics

Safety/exception
  -> WorkbenchState for inline owning-state feedback
     OR WorkbenchConfirmation for modal confirmation
```

The selected WorkItem shell is always:

```text
WorkbenchLayout
  toolbar      = WorkbenchToolbar
  identity     = WorkbenchIdentity
  workflowRail = WorkbenchRail
  primary      = exactly one primary interaction-class composition above
  context      = null | WorkbenchContextPanel
```

Canonical Workbench screens therefore resolve predictably:

| Screen/material | Required primitive tree |
|---|---|
| Work request / lifecycle document | `WorkbenchSurface -> WorkbenchAttention + optional WorkbenchSelector + document content` |
| Active/historical pre-signoff Run | `WorkbenchSurface -> WorkbenchAttention + optional WorkbenchSelector + WorkbenchDialogue` |
| Proposal review | `WorkbenchReview` |
| Readiness | `WorkbenchReview + optional WorkbenchSelector` |
| Approval | `WorkbenchReview + WorkbenchDisclosure(technical detail)` |
| Implementation | `WorkbenchMasterDetail(master scan, detail WorkbenchSurface)` |
| Evidence/raw material | `WorkbenchSurface` with evidence content |
| Complete/result | `WorkbenchSurface` with terminal result content |
| Context | `WorkbenchContextPanel` only through `WorkbenchLayout` |
| Dirty/destructive confirmation | `WorkbenchConfirmation` |

A feature service is therefore predictable: classify the screen under P3, map canonical state/current attention into the corresponding primitive slots, and add domain-specific content. It does not design a new layout or recurring interaction mechanic.

### 8.16 Primitive-consumer and Astryx boundaries

The target relationship is:

```text
canonical domain/query state
        |
pure lifecycle + presentation policy
        |
feature adapter / cohesive content owner
        |
Order Workbench screen-construction primitive
        |
Astryx interaction substrate + semantic HTML/CSS leaves
```

Examples:

- `WorkItemIdentityRow.tsx` maps WorkItem identity/status/utilities into `WorkbenchIdentity`; it does not own the three-column grid.
- `WorkflowRail.tsx` maps reached/current WorkStage presentation into generic `WorkbenchRail` items.
- `WorkflowStepFrame.tsx` maps the already-derived current-attention presentation into `WorkbenchAttention` and `WorkbenchSurface`; it owns no independent structural layout.
- `WorkflowMaterialSelector.tsx` maps Run/document/proposal/evidence choices into `WorkbenchSelector`.
- `ActivityWorkspace.tsx` / `ActivityComposer.tsx` map transcript/composer content and already-derived input eligibility into `WorkbenchDialogue`; they do not own transcript/composer geometry or responsive behavior.
- `PreSignoffStageWorkspace.tsx` chooses Document, Dialogue, Review or Evidence content and places it in the canonical composition; collection count does not choose topology.
- `ProposalReview.tsx`, `ReadinessWorkspace.tsx` and `SignoffReview.tsx` map their domain material into `WorkbenchReview`.
- `ExecutionWorkspace.tsx` maps task/attempt collections into `WorkbenchMasterDetail` and uses `WorkbenchSurface` for the selected/current detail.
- `WorkItemContext.tsx` supplies compact context content to `WorkbenchContextPanel`; it does not decide whether/how Context is structurally displayed.
- technical/supporting detail maps to `WorkbenchDisclosure` rather than feature-specific persistent panels.
- dirty/destructive navigation guards map already-derived confirmation state/actions into `WorkbenchConfirmation`.

Feature/content modules may directly use presentational Astryx leaves inside these slots, but they may not bypass an Order primitive to recreate a mechanic owned above. No feature adapter owns CSS that establishes a persistent Workbench column, outer topology, identity grid, anchored dialogue composer, Context/selector drawer behavior or confirmation layout.

## 9. Material and action composition

### 9.1 Pre-signoff

The current material resolver uses `deriveReachedStages` and the shared STAGE interaction derivation.

For the current step:

1. mutation conflict/reconciliation requirement;
2. required human input;
3. pending proposal;
4. current blocker/failure;
5. active PROCESSING;
6. OPEN continuation;
7. current document;
8. historical explicit selection.

Historical selection can remain visible, but a compact current-attention surface remains visible and navigates directly to its owner. Only the highest-precedence current mutation action is rendered: failed/recovery ownership suppresses generic Start, and pending proposal disposition suppresses free-form continuation.

Run/provider plumbing is not a parallel primary information block. The activity header presents workflow role/attempt plus human-relevant interaction state; provider session id, baseline/context hash and ordinary provider-process status remain inside Technical details. A provider admission/failure appears in primary only as the canonical human-facing blocker/failure.

### 9.2 Readiness

Readiness defaults to verdict/findings/package material, not the latest generic Run.

Only an actual REQUIRED_INPUT interaction temporarily owns the primary action.

### 9.3 Execution

Historical task selection is presentation state only.

The Workbench derives current execution attention independently and renders it above/adjacent to the detail. Resume is attached to the current blocked task, never merely to `WorkItem.status === BLOCKED`.

## 10. Workflow feedback ownership

Each workflow mutation has exactly one visible feedback owner.

- Start/Retry/Resume/Cancel/proposal/sign-off errors belong to the workflow material that owns that command.
- composer input errors belong to the composer.
- the parent Activity surface does not repeat the same composer mutation error.
- current blockers are not copied into multiple equal-weight banners.
- toast may supplement but never replace the owning inline feedback.

This directly removes the current duplicated `Workflow action failed` rendering between Activity workspace and composer.

## 11. Required P6 amendments

`GW-DOC-CANONICAL-CONTRACTS-V1` must be amended in the same design package to bind:

1. IDEA source Save remains IDEA; progressed source changes return to R1.
2. GET/query operations in §18/§19 are non-mutating.
3. STAGE turn-result arrays are validated as one non-empty closed batch before persistence.
4. provider turn batch + coordinator reaction + Run/WorkItem transition are one SQLite transaction where no filesystem effect intervenes.
5. required-input request identity/null semantics are exact.
6. lifecycle proposal role/current-stage/pending/open-turn invariants are exact.
7. source/lifecycle Save is forbidden while a Run is active.
8. Start/Input/Cancel/Proposal/Resume/Sign-off re-check DB-decidable admission at their final transaction boundary.
9. browser observation polls the selected WorkItem while Runs are active and performs terminal event drain/refetch before exposing a next action.
10. sign-off package/source/lifecycle-artifact GET paths perform no lifecycle/projection mutation.
11. no new persistence table/column is introduced for reached history or turn interaction.

## 12. Existing module consequences

### `src/core/lifecycle.ts`

Extend the existing browser-safe owner with:

- corrected source-change transition;
- complete WorkItem transition helpers needed by the P3 diagram;
- STAGE Run interaction derivation;
- unresolved required-input derivation/admission;
- STAGE turn-grammar validation;
- lifecycle-proposal current-stage admission;
- reached-stage derivation.

These are pure functions over canonical types. No Zod/transport/persistence model is added for derived interaction/reach values.

### `src/core/execution.ts`

Retain post-signoff task/provider-role admission and bounded repair/recovery policy. It does not become the Workbench state owner.

### `src/daemon/runtime.ts`

Add only the process-local per-WorkItem operator-mutation guard state/helper required by §5.1. It remains ephemeral synchronization and does not become canonical workflow state or a queued job system.

### `src/daemon/work-item-source.ts`

Separate inspection from explicit reconciliation and remove read-path application of source plans.

### `src/daemon/authority.ts`

Separate query inspection from ArtifactRef materialization, remove lifecycle mutation from sign-off-package reads, and keep stage/sign-off command materialization explicit.

### `src/daemon/stage.ts`

Own async STAGE-turn orchestration, complete-batch finalization, transactional input admission, current-stage proposal disposition and cancel-safe finalization.

### `src/daemon/coordinator.ts`

Retain top-level cancel/resume/scheduler composition. Resume uses explicit current blocker/currentness admission and does not reconcile source implicitly.

### `src/daemon/execution.ts`

Continue to own post-signoff task/Run reaction; route every WorkItem lifecycle return through core lifecycle policy and expose current blocker through canonical task state.

### UI query/state ownership

`App.tsx` owns application destination, queue/global queries and the **dedicated selected-WorkItem canonical query** because it is the common ancestor of the WorkItem primary workspace and Context. The queue-list row is never reused as the current selected-WorkItem observation.

Required additions are the existing canonical boundary only:

- `api.getWorkItem(workItemId)` over `GET /api/work-items/:workItemId`;
- `workbenchQueryKeys.workItem(workItemId)`;
- selected-item polling/refetch under the §7 convergence rules.

No aggregate workflow DTO/query is introduced.

`WorkItemWorkspace.tsx` composes the selected WorkItem with the subordinate canonical workflow collections required by the active workspace:

- Run list;
- current lifecycle ArtifactRefs;
- ExecutionTasks when applicable;
- source diagnostics/currentness needed by the current workspace;
- sign-off package when applicable.

Those existing canonical values are passed into step surfaces for workflow decisions. A child may subscribe to an already-canonical shared TanStack query key solely for read-only secondary/detail presentation, but it may not become another workflow-policy/current-attention/action owner.

In particular:

- `StageRunMaterial` receives the parent Run list/current Run decision and owns only the selected RunEvent detail query;
- `ExecutionWorkspace` receives parent task/Run/artifact collections and owns only selected RunEvent/evidence detail;
- `SignoffReview` receives parent package/artifact/task state;
- `WorkItemContext` may read shared canonical detail for technical display, but it never derives blocker/action/current-attention semantics and never owns mutation invalidation.

Workflow mutations use one shared WorkItem-observation invalidation/refetch function over the canonical query keys. Individual child components do not carry divergent copies of the "refresh WorkItem after mutation" key set.

### UI policy/presentation ownership

`workbench-presentation.ts` remains pure material/presentation resolution but consumes the core reached/interaction/current-attention policy instead of stage ordinal or `Run.status` heuristics.

Explicit historical selection is presentation state only and is never used as the source of current blocker/action ownership.

`ActivityWorkspace.tsx` / `ActivityComposer.tsx` use the shared interaction derivation; Send is admitted only for OPEN or exact REQUIRED_INPUT, is suppressed while a lifecycle proposal awaits disposition, proposal/input/control states cannot coexist contrary to the P3 turn grammar, and mutation error ownership is singular.

### Required same-layer UI decomposition

Current implementation evidence shows that `WorkItemWorkspace.tsx` contains several independently testable present responsibilities. P7 therefore performs the minimum architecture-preserving split rather than continuing to grow that catch-all.

The target ownership is:

- `WorkItemWorkspace.tsx` — selected WorkItem workflow composition, subordinate canonical queries, dirty-buffer selection guard and step dispatch;
- `WorkItemIdentityRow.tsx` — pure WorkItem adapter over `WorkbenchIdentity`; title/status/utilities and mutations/state are supplied by the parent, while three-group geometry remains primitive-owned;
- `WorkflowRail.tsx` — pure nine-stage lifecycle adapter from the canonical reached/current projection into `WorkbenchRail`;
- `WorkflowStepFrame.tsx` — thin workflow adapter over `WorkbenchAttention` + `WorkbenchSurface`, with no independent structural layout behavior;
- `WorkflowMaterialSelector.tsx` — thin domain adapter over `WorkbenchSelector` for Run/document/proposal/evidence material;
- `ActivityWorkspace.tsx` / `ActivityComposer.tsx` — dialogue content/policy adapters over `WorkbenchDialogue`; transcript/composer geometry remains primitive-owned.

This is not a new UI framework or controller layer. These modules remain ordinary functional React composition over canonical typed data and callbacks. Any new production module is added to the architecture fitness dependency map in the same implementation change.

### UI structural components

`WorkItemIdentityRow.tsx` becomes a thin adapter over `WorkbenchIdentity`; feature CSS no longer owns the identity grid.

`WorkflowStepFrame.tsx` loses the optional generic side-index/drawer responsibility and becomes a thin adapter over `WorkbenchAttention` + `WorkbenchSurface`.

Pre-signoff/Readiness use `WorkflowMaterialSelector` -> `WorkbenchSelector`; item count cannot alter primary columns. Active/historical dialogue uses `WorkbenchDialogue`; feature code supplies transcript/composer content but does not own anchored-composer geometry or responsive dialogue mechanics.

Proposal, Readiness and Approval map into `WorkbenchReview`; they do not reuse a generic side-index simply because documents/tasks exist. Secondary technical/supporting detail uses `WorkbenchDisclosure`.

Implementation maps into `WorkbenchMasterDetail`; feature code does not create its own persistent grid columns.

`WorkbenchLayout` owns responsive outer topology/Context hosting; `WorkbenchContextPanel` owns the Context body/close affordance. `App.tsx` owns only the open/close boolean and supplies a true toggle.

Dirty/destructive navigation confirmation uses `WorkbenchConfirmation`; the navigation guard owns the policy/state while the primitive owns modal interaction mechanics.

### UI attention/presentation cleanup

The current `Supporting context` disclosure is removed from the leading primary position in pre-signoff activity/document surfaces and is represented through the subordinate material selector/secondary access defined in §8.5.

The current prominent `OpenCode session` block in `ActivityWorkspace` is removed from primary composition. Canonical workflow interaction state owns the visible status; provider diagnostics remain Technical details/evidence unless they are the active blocker.

`WorkflowStepSummary` renders one current action owner only. A retryable failed Run must not simultaneously expose both generic Start and Retry controls for the same stage.

Implementation validation presentation is sparse/current-state-first as defined in §8.8; a full empty V0–V7 matrix is not rendered before validation begins.

### UI CSS

`theme.css` is reduced to one live Workbench layout/interaction system whose structural and recurring-mechanic selectors belong to the §8.12 primitives. Duplicate base declarations and dead superseded Workbench layout selectors are removed. Feature selectors may style domain content/density but may not establish persistent Workbench columns, identity grids, anchored-composer layout, Context/selector drawer mechanics, confirmation layout or alternate structural breakpoints. Media overrides use the §8.10 breakpoint contract.

No production class/service/repository/controller/DTO/mapper module is introduced.

### Structural remediation boundary

The current Workbench implementation is evidence of the failure modes described by this design; it is **not** the structural baseline that P7 incrementally patches into compliance.

P7 must perform an architecture-preserving **re-composition** around the canonical owners defined above. Visual refinements occur only after those ownership/topology changes have landed.

#### Required replacement order

The implementation sequence is structurally ordered:

1. establish the shared pure lifecycle/reached/interaction/current-attention policy in the existing browser-safe core owner;
2. establish the dedicated selected-WorkItem canonical observation and one shared mutation-refetch boundary;
3. make current attention/action independent from historical inspection state;
4. reduce the generic workflow frame to summary/current-attention + primary material only;
5. introduce the complete §8.12 primitive set and explicit §8.15 interaction-class compositions: identity/rail/surface/attention, compact selector, Dialogue, Review, dedicated Implementation master/detail, Context, disclosure and confirmation;
6. perform the required same-layer component decomposition in §12 UI ownership above;
7. remove the superseded generic side-index/layout and duplicate/dead CSS systems;
8. only then tune spacing, typography, density and other visual details;
9. certify geometry/state/action ownership permanently through §14.

A lower step must not compensate for a missing higher step.

#### Existing mechanisms that are removed, not patched

The following current mechanisms are superseded and must disappear from the compliant implementation:

- content-count-driven `meaningfulObjectCount >= 2` selection of a persistent step rail;
- the optional persistent `start`/side-index slot and associated drawer responsibility in the generic `WorkflowStepFrame`;
- use of the queue-list WorkItem snapshot as the selected WorkItem's current canonical observation;
- ordinal `selectedStage < currentStage` reached-history logic;
- `Run.status`-only human-input/continuation admission;
- explicit historical ExecutionTask selection as current-attention ownership;
- child-local divergent WorkItem workflow invalidation sets;
- simultaneous generic Start plus Retry/Resume for one current stage;
- simultaneous proposal disposition plus free-form continuation;
- a wide Context control that can open but not explicitly close/toggle;
- competing Workbench structural breakpoint authorities;
- duplicate/unused structural CSS systems that preserve the old layout topology.

Removal means deleting the old structural responsibility and its obsolete selectors/branches once the new owner exists. Leaving the old mechanism in place behind CSS overrides, hidden DOM, an always-false branch, a compatibility wrapper or an additional synchronization effect is not compliant.

#### Prohibited remediation patterns

P7 must not solve these failures by:

- adding another local boolean to decide whether a rail/header/panel should exist;
- adding CSS specificity/override rules around the existing conditional layout;
- adding another responsive breakpoint to compensate for compressed content;
- adding a UI service/controller/store/view-model/DTO that mirrors canonical workflow state;
- adding `useEffect` synchronization between competing workflow-state derivations;
- adding duplicate queries whose purpose is to reconcile disagreement between UI owners;
- weakening or deleting browser assertions that expose geometry, action-ownership or state-convergence defects;
- retaining two composition systems and selecting between them by stage/status/content count.

If implementation discovers that the target ownership/topology in §§4–12 cannot be realized without changing canonical state meaning, public contracts or dependency direction, execution returns to DESIGN. It does not invent an implementation-layer workaround.

#### Definition of structural completion

The UI remediation is structurally complete only when all of the following are true before cosmetic acceptance is considered:

- one core policy owner determines lifecycle/reach/interaction/current-attention semantics;
- one selected-WorkItem query owns current WorkItem observation;
- one current action owner exists for every state;
- one outer Workbench topology exists;
- each interaction class has exactly the composition defined in §8;
- the generic frame cannot create a persistent side service;
- historical inspection cannot become current-attention authority;
- Context and responsive behavior have one owner;
- obsolete competing layout code/CSS has been deleted;
- permanent architecture/browser tests fail if any of those ownership boundaries regress.

## 13. Technical requirements

### GW-TR-082-WORKFLOW-TRANSITION-KERNEL

**Realizes:** `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION`, `GW-FR-202-ATOMIC-COMMAND-OUTCOME`, `GW-FR-205-MONOTONIC-REACH-HISTORY`, `GW-FR-211-READINESS-RETURN-CONTINUITY`, `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS`, `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE`.

**Required behavior:** every WorkItem stage/status/outcome mutation is produced by the browser-safe pure lifecycle policy owner from canonical current state plus an admitted semantic cause; daemon modules do not invent alternate lifecycle transitions.

**Acceptance:** every row of the P3 cross-step transition table maps to one core policy result and unlisted state/event combinations reject.

### GW-TR-083-STAGE-RUN-INTERACTION-DERIVATION

**Realizes:** `GW-FR-203-SERIALIZED-RUN-TURNS`, `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP`, `GW-FR-220-PRESIGNOFF-CONTINUITY`, `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY`.

**Required behavior:** PROCESSING / OPEN / REQUIRED_INPUT / CLOSED is derived purely from canonical Run + RunEvents and shared by daemon admission and browser presentation; no persisted turn-state field or browser heuristic based only on `Run.status` exists.

**Acceptance:** the same canonical event history always yields the same interaction decision in core, daemon and UI tests.

### GW-TR-084-STAGE-TURN-BATCH-ATOMICITY

**Realizes:** `GW-FR-202-ATOMIC-COMMAND-OUTCOME`, `GW-FR-203-SERIALIZED-RUN-TURNS`, `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY`, `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE`, `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY`.

**Required behavior:** one complete non-empty STAGE provider-result batch is validated for role/turn/proposal invariants before persistence and is committed with its coordinator reaction atomically when no filesystem effect intervenes.

**Acceptance:** no reader can observe a partial provider-result batch or a provider control event without its corresponding Run/WorkItem reaction.

### GW-TR-085-OBSERVATIONAL-QUERY-BOUNDARY

**Realizes:** `GW-FR-201-OBSERVATIONAL-READS`, `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS`.

**Required behavior:** every GET/query is workflow-state and repository-byte read-only; source reconciliation, ArtifactRef materialization and lifecycle return happen only through explicit mutations.

**Acceptance:** stale source/lifecycle/sign-off reads leave SQLite and repository bytes unchanged.

### GW-TR-086-COMMAND-COMMIT-RECHECK

**Realizes:** `GW-FR-202-ATOMIC-COMMAND-OUTCOME`, `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP`, `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY`, `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION`, `GW-FR-209-SOURCE-BLOCKER-ADMISSION`.

**Required behavior:** operator workflow commands acquire the process-local per-WorkItem mutation guard across their full effect, and every command that crosses an `await` before persistence reloads canonical DB state and repeats all DB-decidable admission checks inside its final transaction; expected-hash/durable-intent rules remain the filesystem concurrency boundary.

**Acceptance:** concurrent operator Start/Input/Cancel/Save/Adopt/Sign-off/Resume commands for one WorkItem cannot overlap their mutation effects; background provider-finalize/Cancel races produce one transactional winner and cannot overwrite the winning transition.

### GW-TR-087-MONOTONIC-REACHED-HISTORY-DERIVATION

**Realizes:** `GW-FR-205-MONOTONIC-REACH-HISTORY`, `GW-FR-211-READINESS-RETURN-CONTINUITY`, `GW-FR-224-TERMINAL-RESULT-PRIMACY`.

**Required behavior:** reached workflow steps are derived from canonical WorkItem/Run/RunEvent/ArtifactRef/ExecutionTask evidence and remain reached after upstream returns; current-stage ordinal alone is never the history algorithm.

**Acceptance:** R3/execution returns preserve previously reached downstream steps, while an R1-terminal investigation/audit does not fabricate later reached stages.

### GW-TR-088-ASYNC-BROWSER-CONVERGENCE

**Realizes:** `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION`, `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE`, `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK`.

**Required behavior:** while Runs are active the selected WorkItem participates in polling; terminal Run observation performs final RunEvent drain plus affected canonical refetch, and mutation actions remain suppressed until controlling reactions are coherently observed.

**Acceptance:** stage completion/block/return appears without reload and final persisted events are not lost when polling stops.

### GW-TR-089-CURRENT-ATTENTION-OWNERSHIP

**Realizes:** `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE`, `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK`.

**Required behavior:** current attention/action is a pure projection independent of historical selection; exactly one inline surface owns each mutation error/blocker/recovery action.

**Acceptance:** historical Run/task selection cannot hide the current blocker/required input, and the same mutation failure is not rendered by both parent workspace and child composer.

### GW-TR-090-STABLE-WORKBENCH-GEOMETRY

**Realizes:** `GW-FR-214-STABLE-WORKBENCH-GEOMETRY`, `GW-FR-215-STABLE-WORKFLOW-RAIL`, `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL`, `GW-FR-217-PRIMARY-INFORMATION-ECONOMY`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-219-EXPLICIT-CONTEXT`, `GW-FR-220-PRESIGNOFF-CONTINUITY`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-224-TERMINAL-RESULT-PRIMACY`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`.

**Required behavior:** workflow rail, pre-signoff material selection, Approval, Implementation master/detail and Context obey the stable spatial contracts in §8 without content-count/status-driven persistent column insertion or width changes.

**Acceptance:** at the same viewport and Context state, a pre-signoff step with one versus multiple attempts/documents has identical primary-surface x-position and width; Readiness/Approval do not acquire the generic side-index rail; Implementation master width is invariant across task/attempt state; workflow-cell widths are state-invariant; Context has an explicit close/toggle; only explicit Context and the single responsive-class transition alter structural columns. The superseded content-count side-index/generic-frame structural path is deleted rather than hidden or CSS-overridden.

### GW-TR-091-WORKFLOW-STATE-MACHINE-CERTIFICATION

**Realizes:** `GW-FR-227-CERTIFICATION-MATRIX`, `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE`, `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY`.

**Required behavior:** permanent core/integration/browser/architecture tests close the positive and negative transition matrix, turn grammar, concurrency races, read purity, async convergence and geometry invariants.

**Acceptance:** implementation cannot pass certification with an untested admitted transition, contradictory provider-turn combination, state-mutating GET, duplicate workflow state owner or ordinal-only history algorithm.

### GW-TR-092-STRUCTURAL-UI-PRIMITIVE-OWNERSHIP

**Realizes:** `GW-FR-214-STABLE-WORKBENCH-GEOMETRY`, `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-219-EXPLICIT-CONTEXT`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`.

**Required behavior:** every persistent Workbench topology is produced by the closed structural primitive vocabulary in §8.12. Feature/workflow components map canonical state into those primitives and may not directly invent persistent columns, Context/drawer behavior, responsive structural branches or content-count-selected layout modes.

**Acceptance:** architecture fitness proves Workbench feature surfaces do not import structural Astryx `Layout`/`Drawer` directly, do not call a feature-visible responsive-layout hook to choose structural markup, and do not own CSS selectors that create another persistent Workbench column/topology.

### GW-TR-093-UI-PRIMITIVE-STATE-INDEPENDENCE

**Realizes:** `GW-FR-214-STABLE-WORKBENCH-GEOMETRY`, `GW-FR-217-PRIMARY-INFORMATION-ECONOMY`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK`.

**Required behavior:** Workbench primitives are domain/query/policy blind and structural primitives are count-blind for topology. Their APIs expose only named constrained slots and fixed Workbench geometry/interaction responsibilities; they do not accept arbitrary sidebar/column/width/breakpoint/slot/mega-variant configuration that lets callers reconstruct a competing UI system.

**Acceptance:** adding/removing Run/document/task rows can change only rows/content inside the chosen primitive; it cannot select another persistent topology. Primitive modules contain no WorkItem/Run/lifecycle imports, TanStack Query ownership, current-attention policy or content-count structural branching.

### GW-TR-094-CLOSED-WORKBENCH-SCREEN-COMPOSITION

**Realizes:** `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-220-PRESIGNOFF-CONTINUITY`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`, `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR`.

**Required behavior:** every WorkItem Workbench screen is built from the complete closed primitive vocabulary in §8.12 according to the canonical composition grammar in §8.15. Feature/content owners may supply domain-specific content and presentational leaf components inside primitive slots, but reusable Workbench topology/interaction mechanics remain primitive-owned.

**Acceptance:** architecture fitness rejects a Workbench feature that bypasses a local primitive to recreate shell/identity/rail/surface/selector/dialogue/review/master-detail/Context/disclosure/confirmation mechanics, rejects undeclared persistent screen grammars, and requires any new primitive to arrive with DESIGN authority plus permanent fitness coverage.

## 14. Permanent verification

### 14.1 Core transition matrix

Table-driven core tests enumerate every row of:

- `GW-DOC-WORK-LIFECYCLE-V1 §2.2`;
- `GW-DOC-WORKBENCH-UX-V2 §21.1-§21.8`.

For each state/event pair the test proves either exactly one expected transition or explicit rejection.

The inverse/negative matrix proves unlisted transitions do not occur.

### 14.2 Turn grammar

Tests cover every pairwise contradictory controlling-event combination, duplicate input requests, empty provider batch, proposal/control coexistence, proposal role mismatch, unresolved-proposal duplication and exact required-input idempotence.

### 14.3 Concurrency

Deterministic integration tests synchronize concurrent:

- Start/Start;
- Input/Input;
- Input/Cancel;
- provider-finalize/Cancel;
- Save/Start;
- Adopt/Input;
- Sign-off/upstream mutation;
- Resume/currentness change.

Exactly one admissible transition wins; the loser does not overwrite canonical state.

### 14.4 Read purity

For every GET/query, tests snapshot SQLite + relevant repository bytes before/after and prove no state/write change.

Required coverage includes source, lifecycle-artifacts and signoff-package reads in stale/drifted conditions.

### 14.5 Browser certification

Browser tests prove all `GW-DOC-WORKBENCH-UX-V2 §23` certification scenarios, including:

- asynchronous next-stage orientation without reload;
- final event drain;
- required-input exactness;
- history across R3/execution return;
- current blocker dominance over historical selection;
- one feedback owner;
- stable workflow rail geometry;
- no conditional pre-signoff rail;
- stable Implementation master width;
- Readiness/Approval review hierarchy without generic side-index dominance;
- explicit open **and close** Context behavior;
- wide identity-row three-group geometry;
- responsive continuity with no page-level horizontal overflow for current action/identity.

### 14.6 Architecture fitness

Permanent sensors prove:

- no new DTO/view-model/domain-copy family;
- no browser workflow store;
- UI workflow policy imports only the authorized browser-safe core lifecycle owner;
- daemon modules do not implement a second stage-order/transition table;
- GET handlers cannot call known reconcile/materialization mutation functions;
- ordinal reached-history comparison is absent from production Workbench code;
- the generic step frame has no content-count-dependent persistent side-index slot;
- one dedicated selected WorkItem query (not the queue list) owns current WorkItem observation; shared-query secondary consumers cannot become competing workflow-policy/current-attention owners;
- Workbench responsive structural breakpoints are singular/consistent across JS and CSS;
- Workbench feature surfaces do not import Astryx mechanics already owned by the closed primitive vocabulary, including structural `Layout`/`Drawer`, Workbench dialogue layout/composer scaffolding or confirmation `Dialog`, and do not choose structural markup through a local viewport hook;
- every required §8.12 primitive owner exists and no generic arbitrary-slot/layout mega-primitive replaces the closed vocabulary;
- Workbench primitive modules are domain/query/policy blind and contain no content-count topology branching;
- only the closed primitive selectors establish persistent Workbench columns/outer topology, identity grid, anchored dialogue composer, Context/selector drawer mechanics and confirmation layout;
- Workbench feature/content modules use presentational Astryx leaves only inside primitive-owned screen composition;
- obsolete competing Workbench layout/interaction selectors are absent from production CSS.

## 15. Non-goals

This design does not authorize:

- a generic state-machine/workflow library;
- XState or equivalent dependency;
- a persisted reached-history table/set;
- a persisted provider-turn state field;
- a `WorkflowObservation` transport DTO;
- a browser Redux/Zustand/workflow state store;
- WebSocket/SSE/token streaming;
- a command/event bus;
- a global mutation queue/service or persisted mutation-lock model;
- compatibility behavior for the superseded Workbench implementation;
- redesign of OpenCode provider semantics unrelated to STAGE-turn admission/finalization.

The minimum implementation is to make the existing canonical state and event stream actually obey the P3 state machine and to make the Workbench derive from that state consistently.
