# Workbench technical architecture

**Status:** Binding P4 technical design  
**Canonical concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`  
**Pyramid layer:** P4 technical architecture

## 1. Purpose

This document is the technical owner for the Order Workbench realization under `GW-DOC-WORKBENCH-UX-V2`.

It resolves the state-machine, transition, observation, command-admission, browser-reconciliation, renderer-coverage, component-language, visual-token and spatial-design obligations deliberately left open by the functional design. It is the canonical technical owner for how Order Workbench services are constructed and rendered. It does not preserve the superseded 0.3.0 component/spatial/visual implementation where that implementation conflicts with current authority.

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

No new persisted `WorkflowState`, `WorkbenchState`, `TurnState`, `ReachedStage`, workflow-state table, transport aggregate, DTO/view-model family or browser-owned mirror is introduced.

The workflow language is realized as two cohesive pure-core responsibilities over those existing canonical values:

- `src/core/lifecycle.ts` owns **mutation semantics**: admitted lifecycle causes, stage/status/outcome transitions, block/resume and upstream-return routing;
- `src/core/workflow-state.ts` owns **read-only workflow semantics**: reach, STAGE interaction, proposal-decision/adoption state, material currentness, execution owner/validation boundary, recovery route, observation coherence, current attention and workflow-rail projection.

This same-layer split is required by SoC: mutation transition policy and observation/presentation policy are independently testable responsibilities. It does not create two lifecycle owners. `workflow-state.ts` cannot assign lifecycle state and `lifecycle.ts` cannot own UI selection/rendering.

The missing behavior is realized through:

1. closed pure transition and workflow-state decision functions over the existing canonical typed values;
2. closed STAGE-turn event-batch validation;
3. effectful daemon commands that re-check current state at the commit boundary;
4. explicit read-versus-reconcile separation;
5. browser observation of the existing canonical values with a deterministic coherence barrier;
6. one-way rail/current-attention projections into stable Workbench primitives.

The in-memory `runtime.stageTurnTasks` map remains process-occupancy bookkeeping only. It is never persisted, transported or treated as workflow authority.

## 4. Pure workflow-state and transition policy

The pure core exposes a closed decision language. These values are ordinary TypeScript discriminated unions/enums used for policy decisions; they are not Zod schemas, persistence records, HTTP payloads or browser stores.

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

`src/core/workflow-state.ts` derives exactly one `CurrentAttention` from the closed categories in `GW-DOC-WORKBENCH-UX-V2 §21.9`. It does not persist another status.

The precedence is exact and exhaustive; downstream code cannot append a feature-local category or resolve ties differently.

Historical selection may choose what detail is displayed, but it never changes the derived current attention owner, recovery route or mutation eligibility.

Execution current ownership is derived before historical selection:

1. current blocked task;
2. current RUNNING task/active task Run;
3. next eligible/current task;
4. no current owner when execution is terminal/has no eligible task.

Historical explicit selection is inspection detail only and is never an `ExecutionOwner` candidate.

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
| Adopt lifecycle proposal | current stage Run OPEN; exactly one pending proposal; role/path match current stage | persist exact adoption intent -> ADOPTION_IN_PROGRESS; only exact effect/reconciliation + disposition returns proposal state to NONE/OPEN; same WorkItem stage; free-form continuation and Reject suppressed while adopting |
| Reject lifecycle proposal | same current/pending/open ownership as adoption; no adoption request persisted | same WorkItem/Run interaction, proposal closed; free-form continuation becomes eligible again |
| Save Work request/source | pre-signoff/AWAITING_SIGNOFF; no active Run; expected hash current | IDEA stays IDEA; progressed work returns R1 |
| Save lifecycle document | editable already-reached owner; no active Run; expected hash current | return/remain at artifact owner |
| Resume pre-signoff blocker | same stage / BLOCKED; blocker proven resolved; no active Run | same stage / ACTIVE |
| Sign off | AWAITING_SIGNOFF / ACTIVE; exact displayed package still current; no competing mutation | EXECUTION / ACTIVE + Approval/tasks |
| Resume execution | EXECUTION / BLOCKED; exactly current blocked task; approval current; blocker resolved | EXECUTION / ACTIVE; blocked task becomes eligible |
| Archive/restore | existing archive policy; no active Run; no competing mutation | archive projection only; lifecycle unchanged |

A selected historical material item never satisfies a current-action precondition merely because it contains an old control. Action ownership always resolves from the current canonical WorkItem/Run/task/proposal/input facts.

### 4.8 Closed workflow-state decision algebra

The complete derived workflow-state vocabulary is:

```ts
type ReachState =
  | "CURRENT"
  | "REACHED_HISTORICAL"
  | "UNREACHED";

type StageRunInteraction =
  | { readonly tag: "PROCESSING" }
  | { readonly tag: "OPEN" }
  | { readonly tag: "REQUIRED_INPUT"; readonly requestEventId: RunEventId }
  | { readonly tag: "CLOSED" };

type ProposalDecision =
  | { readonly tag: "NONE" }
  | { readonly tag: "PENDING"; readonly proposalEventId: RunEventId }
  | { readonly tag: "ADOPTION_IN_PROGRESS"; readonly proposalEventId: RunEventId };

type MaterialCurrentness =
  | { readonly tag: "CURRENT" }
  | {
      readonly tag: "STALE";
      readonly owner: "R1" | "R2" | "DESIGN" | "PLAN" | "R3";
      readonly reason: string;
    };

type ExecutionOwner =
  | { readonly tag: "NONE" }
  | { readonly tag: "CURRENT_TASK"; readonly taskId: ExecutionTaskId }
  | { readonly tag: "BLOCKED_TASK"; readonly taskId: ExecutionTaskId };

type ValidationBoundary =
  | { readonly tag: "NONE" }
  | { readonly tag: "PASSED_THROUGH"; readonly stage: ValidationStage }
  | {
      readonly tag: "FAILED_AT";
      readonly stage: ValidationStage;
      readonly classification: RunTerminalClassification;
    }
  | { readonly tag: "COMPLETE" };

type RecoveryDisposition =
  | { readonly tag: "NONE" }
  | { readonly tag: "RETRY_CURRENT_STAGE" }
  | { readonly tag: "RESUME_CURRENT_OWNER" }
  | { readonly tag: "RECONCILE_AUTHORITY" }
  | { readonly tag: "AUTOMATIC_RECOVERY" }
  | { readonly tag: "RETURN_TO_OWNER"; readonly stage: UpstreamReturnStage };

type ObservationCoherence = "COHERENT" | "CONVERGING";

type CurrentAttentionTag =
  | "CONVERGING"
  | "MUTATION_CONFLICT"
  | "REQUIRED_INPUT"
  | "PROPOSAL_DECISION"
  | "PROPOSAL_ADOPTION"
  | "BLOCKER"
  | "RECOVERY"
  | "STALE_AUTHORITY"
  | "PROCESSING"
  | "ACTIONABLE"
  | "ORDINARY";

type RailMarker =
  | "READY"
  | "PROCESSING"
  | "ACTION_REQUIRED"
  | "BLOCKED"
  | "STALE"
  | "COMPLETE";
```

The concrete unions may carry additional canonical ids/reasons needed to identify their owner, but they may not add another semantic variant.

No `WorkflowState` aggregate is introduced. Callers obtain the particular pure decisions they need from canonical values. A convenience input parameter object inside one pure function is not a semantic state owner and must not be persisted/transported/exported as a parallel domain model.

Malformed or contradictory canonical histories do not produce a guessed variant. The deriving function throws/rejects or returns the existing typed canonical-state error at the owning boundary; command admission fails closed.

### 4.9 Closed lifecycle transition-cause language

Every mutation of `WorkItem.stage/status/outcome` is attributable to exactly one semantic transition cause:

```ts
type WorkItemTransitionCause =
  | { readonly tag: "START_RESEARCH" }
  | { readonly tag: "STAGE_COMPLETED"; readonly completion: StageCompletion }
  | { readonly tag: "SOURCE_AUTHORITY_CHANGED" }
  | {
      readonly tag: "LIFECYCLE_ARTIFACT_CHANGED";
      readonly owner: UpstreamReturnStage;
    }
  | { readonly tag: "BLOCK_CURRENT_OWNER" }
  | { readonly tag: "RESUME_CURRENT_OWNER" }
  | { readonly tag: "SIGN_OFF" }
  | {
      readonly tag: "EXECUTION_RETURN";
      readonly owner: UpstreamReturnStage;
    }
  | {
      readonly tag: "EXECUTION_COMPLETED";
      readonly outcome: "CANDIDATE_DONE" | "ALREADY_SATISFIED";
    };
```

This is an internal pure decision union, not a persisted event stream. Existing canonical RunEvents/commands remain the durable causes/evidence. Shell/daemon code maps an admitted canonical command/event/classification into one cause, then `lifecycle.ts` returns the next lifecycle tuple. An unlisted cause cannot mutate lifecycle state.

Existing specialized transition helpers may remain where they are the minimum clear implementation, but every one is exhaustively traceable to one variant above and no daemon module assigns an alternate lifecycle tuple.

### 4.10 Proposal, recovery and execution derivation

`deriveProposalDecision(events)` uses only one current STAGE Run's canonical events:

- no unresolved proposal -> NONE;
- proposal without disposition/adoption request -> PENDING(P);
- exact `ARTIFACT_PROPOSAL_ADOPTION_REQUESTED(P)` without disposition -> ADOPTION_IN_PROGRESS(P);
- disposition -> NONE for current decision purposes.

ADOPTION_IN_PROGRESS survives process restart because its owner is the durable adoption-request event. It suppresses Reject/free-form continuation until the exact P6 reconciliation/disposition path completes.

Recovery is derived from canonical failure/block/currentness history, including P6's bounded post-signoff action-key and semantic-remediation rules. A retry counter/entitlement field is not added.

`deriveExecutionOwner` and `deriveValidationBoundary` consume current Approval/tasks/Runs/RunEvents. They do not use selected UI task/run as authority. The validation boundary is candidate-current: stale pass/fail events from an earlier candidate/Run cannot advance the projection.

### 4.11 Canonical workflow-rail projection

`src/core/workflow-state.ts` is the sole semantic owner of the rail state projection.

Conceptually:

```text
deriveReachedStages(canonical facts)
        +
current WorkItem stage/status/outcome
        +
deriveCurrentAttention(...)
        +
deriveRecoveryDisposition(...)
        +
selected stage (presentation-local only)
        |
        v
deriveWorkflowRail(...)
        |
        v
nine ordered rail items:
  stage
  reach = CURRENT | REACHED_HISTORICAL | UNREACHED
  selected
  marker = current-stage RailMarker | null
```

The nine items always follow the canonical `stageOrder`. Exactly one item is CURRENT for a non-corrupt WorkItem. Only that item may carry a marker.

Marker mapping is exactly the P3 §21.11 law. Historical/unreached cells carry `marker = null`; old Run failures/blockers do not become current markers.

`WorkflowRail.tsx` may translate labels/icons/accessibility text but does not derive reach or marker semantics. `WorkbenchRail` remains domain-blind and receives the already-derived presentation values.

The dependency is one-way: command admission and lifecycle policy never consume a rail item/marker.

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

The Workbench vocabulary is closed for **Order-owned screen structure, recurring interaction mechanics and visual semantics**. Feature/service modules map canonical state and domain content into this vocabulary; they do not create competing shell, navigation, selection, form, dialogue, review, master/detail, Context, notice, timeline, overlay or confirmation mechanics directly from Astryx, raw HTML/CSS or feature-local styling.

This closure is intentionally not a wrapper around every leaf widget. Complete coverage has two layers:

1. **Order Workbench primitives** own every recurring structure, interaction mechanic and semantic visual role that must remain consistent.
2. **Approved foundation leaves / specialized renderers** may render content inside those primitive slots only under §8.19. They cannot establish another Workbench grammar.

The target Order-local primitive vocabulary under `ui/src/primitives/` is:

| Primitive | Sole Order-owned responsibility | Deliberately absent flexibility |
|---|---|---|
| `WorkbenchLayout` | one application topology: toolbar + primary destination; selected WorkItem mode additionally owns identity, workflow rail and optional Context | no arbitrary sidebar/column slots; no caller breakpoint/width values; no domain/query logic |
| `WorkbenchToolbar` | application/local toolbar grouping, search and compact utilities | no workflow policy; no arbitrary structural row creation |
| `WorkbenchUtilityTrigger` | compact toolbar utility/account trigger with primary label + optional secondary state | no feature-owned button chrome or popover/drawer geometry |
| `WorkbenchIdentity` | stable three-group WorkItem identity row: navigation, identity/status, utilities | no fourth placeholder/action column; no content-driven topology |
| `WorkbenchRail` | stable equal-cell workflow navigation with constrained-width scrolling | no content/status-derived widths; no wrapping/multi-row lifecycle navigation |
| `WorkbenchSurface` | current-attention region + one primary material region + optional compact selector | no persistent side/master slot; no caller responsive topology choice |
| `WorkbenchAttention` | stable current-attention presentation: title/purpose/status, one blocker/feedback region and one current action region | no lifecycle/current-attention derivation; no competing action owner |
| `WorkbenchSectionHeader` | consistent material/subsection heading, description and local action alignment | no independent page/surface topology |
| `WorkbenchSelector` | compact subordinate material selection with primitive-owned constrained representation | item count never changes surrounding columns; no persistent rail mode |
| `WorkbenchDialogue` | transcript scrolling, anchored composer region, focus/keyboard continuity and empty/pending slots | no Run/RunEvent/query ownership; no input-admission policy |
| `WorkbenchReview` | review hierarchy: currentness/verdict, substantive body, decision actions and subordinate technical detail | no generic persistent navigation column; no domain-specific package/task semantics |
| `WorkbenchMasterDetail` | the one legal persistent operational master/detail topology with fixed master-width token and constrained collapse | no caller master width; no collection-count activation |
| `WorkbenchContextPanel` | secondary metadata/diagnostic body + explicit close; hosted only by `WorkbenchLayout` | no current-action/blocker ownership; no independent responsive/sidebar behavior |
| `WorkbenchTaskPanel` | operator-opened transient drawer/sheet for one bounded Form/configuration task, such as Create WorkItem | no persistent navigation; no arbitrary width/breakpoint; no use as Context substitute |
| `WorkbenchSettingsLayout` | Settings-only navigation/content composition with primitive-owned wide/constrained geometry | no generic application sidebar primitive; no domain/query ownership |
| `WorkbenchForm` | consistent field stack, form spacing, submission/error region and action alignment | no validation/admission policy |
| `WorkbenchField` | label, description/help, control slot and field-level error grammar | no domain validation; no arbitrary feature control styling |
| `WorkbenchStatus` | semantic neutral/info/success/warning/danger status presentation using text + bounded icon/badge treatment | no domain-state derivation; no raw color selection |
| `WorkbenchNotice` | inline informational/success/warning/error feedback and optional owning action | no toast-only workflow-critical feedback; no arbitrary color |
| `WorkbenchState` family | empty/loading/error/pending whole-region presentation inside an owning composition | no lifecycle-state derivation; no persistent layout ownership |
| `WorkbenchTable` | dense operational/review table grammar: compact rows, dividers, selection/focus and overflow behavior | no domain columns; no dashboard/card substitution |
| `WorkbenchTimeline` | chronological event-list rhythm, event heading/meta/action alignment and evidence attachment region | no RunEvent meaning/derivation |
| `WorkbenchDisclosure` | consistent collapsed/on-demand technical/supporting-detail mechanic | no primary action ownership; no nested navigation axis |
| `WorkbenchConfirmation` | modal confirmation mechanics, confirm/cancel placement, escape/focus return | no mutation/admission policy; no domain-specific decision semantics |
| `WorkbenchAction` | primary/secondary/destructive/ghost action grammar, loading/disabled/icon treatment | no authorization/admission/current-action policy |
| `WorkbenchResourceRow` | scan-efficient resource identity/detail/open-action row | no resource query/mutation ownership; no nested card system |
| `WorkbenchIcon` | canonical icon mapping, size and decorative/accessibility handling | no action/domain semantics |

The vocabulary is complete at the level that must be shared to prevent UI drift. Cohesive content owners such as `MarkdownEditor`, `MarkdownSourceEditor`, Markdown/CodeBlock rendering, proposal diff content and domain-specific data projection remain feature/content mechanisms only. They are still fully governed by the primitive composition and visual language below.

The exact filenames may be combined only when two rows remain one independently testable responsibility. Their semantic APIs/invariants may not be collapsed into a generic "panel/layout/slots" mega-primitive.

Adding a new Order-owned Workbench primitive is an architecture change. It requires an upstream DESIGN amendment proving that the mechanic is not already expressible by this vocabulary and that it represents a reusable interaction responsibility rather than feature convenience.

### 8.13 Target primitive API shapes

The primitive APIs are intentionally narrow. P7 may adjust React typing syntax without adding another structural or interaction degree of freedom.

```ts
WorkbenchLayout({
  toolbar,
  primary,
  workItemChrome: {
    identity,
    workflowRail,
    context: { open, onOpenChange, content } | null,
  } | null,
})
```

Queue and Settings are application destinations in `primary`; selected WorkItem mode additionally enables the named WorkItem chrome. There is no generic `children` shell, `start`, `left`, `sidebar` or caller-defined grid.

```ts
WorkbenchToolbar({ start, end })
WorkbenchUtilityTrigger({ label, detail?, icon?, expanded?, onClick })
WorkbenchIdentity({ navigation, identity, utilities })
WorkbenchRail({ items })
```

Toolbar/identity/rail geometry is primitive-owned. `WorkbenchRail.items` carries only generic id/label/state/selected/onSelect presentation; callers cannot set cell width.

```ts
WorkbenchSurface({ attention, selector?, material })
WorkbenchAttention({ title, purpose?, status?, blocker?, action? })
WorkbenchSectionHeader({ title, description?, action? })
WorkbenchSelector({ label, groups })
```

`WorkbenchSurface` exposes no persistent start/aside/master/columns/breakpoint props. Selector groups carry generic item presentation only; item count never selects topology.

```ts
WorkbenchDialogue({ transcript, composer?, state? })
WorkbenchReview({
  currentness,
  summary,
  body,
  decisions,
  technicalDetails?,
  selector?,
})
WorkbenchMasterDetail({ master, detail, masterLabel })
```

Dialogue owns transcript/composer mechanics but not send eligibility. Review technical detail uses the shared disclosure behavior. Master/detail exposes no master width/collapse/count configuration.

```ts
WorkbenchContextPanel({ title, onClose, children })
WorkbenchTaskPanel({ open, title, onOpenChange, content })
WorkbenchSettingsLayout({ navigation, content })
```

Context and Task panel are different primitives: Context is secondary WorkItem information; Task panel is a transient operator task. Settings is the only persistent settings-navigation composition.

```ts
WorkbenchForm({ fields, actions, feedback? })
WorkbenchField({ label, description?, control, error? })
WorkbenchStatus({ tone, label, icon? })
WorkbenchNotice({ tone, title, description?, action? })
WorkbenchState({ kind, title, description?, action? })
```

Features derive semantic meaning and pass the resulting generic tone/kind. They do not choose raw color or feature-specific status chrome.

```ts
WorkbenchTable({ label, columns, rows, selection? })
WorkbenchTimeline({ label, items })
WorkbenchDisclosure({ label, content })
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

Table/timeline data remains feature-owned; the primitives own visual rhythm and interaction mechanics. Confirmation owns modal accessibility, not the decision to open or mutation executed.

The existing `WorkbenchAction`, `WorkbenchResourceRow`, `WorkbenchIcon` and toolbar groups remain narrow atoms under these contracts.

### 8.14 Primitive API laws

All Order-owned Workbench primitives obey the applicable laws:

1. **Domain-blind:** primitives import no WorkItem/Run/RunEvent/ExecutionTask/WorkStage/proposal/Approval domain types.
2. **Query-blind:** primitives execute no TanStack queries/mutations and own no invalidation.
3. **Policy-blind:** primitives do not decide current attention, reached state, input eligibility, blocker ownership, lifecycle progression, validation or command admission.
4. **Count-blind topology:** collection length may alter rows/items but never selects another persistent topology.
5. **Single responsive owner:** structural responsive decisions are primitive-owned under §8.10; feature components do not choose structural markup through viewport hooks.
6. **Token-owned geometry:** context/master widths, toolbar/identity/attention heights, field/control heights and structural gaps use §8.18 tokens; callers do not pass ad-hoc values.
7. **Named constrained slots:** no arbitrary `start`, `sidebar`, `columns`, `width`, `breakpoint`, generic `slots` or mega-variant API.
8. **Composition over configuration:** different interaction classes use their primitive composition rather than one configurable super-layout.
9. **Accessible behavior is primitive-owned:** drawers, modal focus return, disclosure semantics, rail scrolling, dialogue focus/scroll, table selection/focus and field labeling are implemented once.
10. **Semantic visual ownership:** status/notice/action tone is generic semantic input; raw palette values never cross into feature props.
11. **Astryx containment:** feature surfaces do not directly import an Astryx component that realizes a mechanic already owned here, including structural Layout/Drawer, Button, status Badge semantics, AlertDialog confirmation or Workbench dialogue scaffolding.
12. **Foundation-leaf containment:** approved leaves from §8.19 may render only inside the primitive slot that gives them context; they cannot create outer topology or a parallel visual grammar.
13. **Specialized renderer containment:** CodeMirror/Markdown/raw evidence renderers own content mechanics only and consume the same design tokens/theme.
14. **Closed extension:** a new reusable primitive, visual role or semantic tone requires DESIGN authority and permanent fitness coverage.

### 8.15 Canonical screen-construction grammar

The functional interaction classes in `GW-DOC-WORKBENCH-UX-V2 §13` map exactly:

```text
Operational scan
  -> WorkbenchSurface
     + WorkbenchSectionHeader as needed
     + WorkbenchTable
     + WorkbenchStatus / WorkbenchNotice / WorkbenchAction

Form / configuration
  -> WorkbenchForm
     + WorkbenchField
     + approved selection/input leaves
     + WorkbenchNotice / WorkbenchStatus / WorkbenchAction

Document
  -> WorkbenchSurface
     attention = WorkbenchAttention
     selector = optional WorkbenchSelector
     material = specialized document/editor renderer
     secondary detail = optional WorkbenchDisclosure

Dialogue
  -> WorkbenchSurface
     attention = WorkbenchAttention
     selector = optional WorkbenchSelector
     material = WorkbenchDialogue(transcript, composer, state)

Review
  -> WorkbenchReview
     + optional WorkbenchSelector
     + WorkbenchStatus / WorkbenchNotice
     + WorkbenchDisclosure for technical detail
     + WorkbenchAction for already-derived decisions

Operational master/detail
  -> WorkbenchMasterDetail
     master = WorkbenchTable or compact scan
     detail = WorkbenchSurface + WorkbenchAttention + selected material

Evidence
  -> WorkbenchSurface
     + WorkbenchSectionHeader / WorkbenchAttention
     + approved CodeBlock/raw-content leaf

Terminal result
  -> WorkbenchSurface
     + WorkbenchStatus
     + result content/evidence/resources

Compact context
  -> WorkbenchContextPanel hosted only by WorkbenchLayout

Task panel
  -> WorkbenchTaskPanel
     content = exactly one Form/configuration composition

Safety/exception
  -> WorkbenchNotice / WorkbenchState for inline owning feedback
     OR WorkbenchConfirmation for modal confirmation
```

Canonical application services resolve as:

| Service/material | Required primitive composition |
|---|---|
| Work queue | `WorkbenchLayout -> WorkbenchSurface -> WorkbenchTable`; readiness/source diagnostics use `WorkbenchNotice` |
| Create WorkItem/remediation | `WorkbenchTaskPanel -> WorkbenchForm -> WorkbenchField` |
| Settings | `WorkbenchLayout -> WorkbenchSettingsLayout -> WorkbenchForm/Field/Status/Notice/Confirmation` |
| WorkItem shell | `WorkbenchLayout -> WorkbenchIdentity + WorkbenchRail + one primary composition + optional WorkbenchContextPanel` |
| Work request/lifecycle document | `WorkbenchSurface -> WorkbenchAttention + optional WorkbenchSelector + document renderer` |
| Active/historical STAGE Run | `WorkbenchSurface -> WorkbenchAttention + optional WorkbenchSelector + WorkbenchDialogue` |
| Proposal / Readiness / Approval | `WorkbenchReview` (+ selector/disclosure/field where explicitly required) |
| Implementation | `WorkbenchMasterDetail(master scan, detail WorkbenchSurface)` |
| Run chronology | `WorkbenchTimeline` |
| Evidence/raw material | `WorkbenchSurface` + approved raw-content leaf |
| Complete/result | `WorkbenchSurface + WorkbenchStatus + result content` |
| Context | `WorkbenchContextPanel` only through `WorkbenchLayout` |
| Dirty/destructive confirmation | `WorkbenchConfirmation` |

A feature/service therefore classifies its interaction under P3, chooses the fixed composition above, maps canonical state into generic primitive values, then supplies domain content. It does not design a new UI grammar.

### 8.16 Primitive-consumer boundaries

The target dependency is:

```text
canonical domain/query state
        |
pure lifecycle + presentation policy
        |
feature/service adapter or specialized content renderer
        |
Order Workbench primitives
        |
approved foundation leaves / semantic HTML
        |
DOM/CSS
```

Examples:

- `app.tsx` supplies application destination state to `WorkbenchLayout`, creation to `WorkbenchTaskPanel`, dirty navigation to `WorkbenchConfirmation` and toolbar utility state to `WorkbenchUtilityTrigger`; it does not import Drawer/AlertDialog directly.
- `WorkItemIdentityRow.tsx` maps identity/status/utilities to `WorkbenchIdentity`.
- `WorkflowRail.tsx` maps reached/current presentation into `WorkbenchRail`.
- `WorkflowStepFrame.tsx` maps already-derived attention into `WorkbenchAttention + WorkbenchSurface`.
- `WorkflowMaterialSelector.tsx` maps Run/document/proposal/evidence choices into `WorkbenchSelector`.
- `ActivityWorkspace.tsx` / `ActivityComposer.tsx` map transcript/composer content into `WorkbenchDialogue`.
- `RunEventTimeline.tsx` maps canonical event presentation into `WorkbenchTimeline`.
- `ProposalReview.tsx`, `ReadinessWorkspace.tsx`, `SignoffReview.tsx` map review content into `WorkbenchReview`.
- `ExecutionWorkspace.tsx` maps task/attempt scan into `WorkbenchMasterDetail`, detail into `WorkbenchSurface`, validation scan into `WorkbenchTable`, chronology into `WorkbenchTimeline`.
- `WorkItemContext.tsx` supplies content to `WorkbenchContextPanel`.
- `CreateWorkItem.tsx`, `SettingsWorkspace.tsx` and `OpenCodeAccountSettings.tsx` map form/configuration semantics into `WorkbenchForm + WorkbenchField`.
- technical/supporting detail uses `WorkbenchDisclosure`; semantic feedback uses `WorkbenchNotice`; semantic state uses `WorkbenchStatus`.

No feature/service adapter owns CSS establishing a primitive-owned layout/mechanic or chooses visual values outside §8.18.

### 8.17 Complete production-renderer coverage audit

The following matrix is exhaustive for the production TSX renderers present on the PR #59 design baseline. `main.tsx` is bootstrap only and is not a renderer contract. `http.ts`, `query-keys.ts`, `workbench-presentation.ts` and `markdown-source-formatting.ts` are non-rendering modules.

| Production renderer | Target UI-language coverage | Current mechanism specifically superseded where applicable |
|---|---|---|
| `app.tsx` | Layout, Toolbar, UtilityTrigger, TaskPanel, Confirmation, Notice/State + approved theme choice leaf | direct Drawer/AlertDialog and bespoke theme/account utility chrome |
| `OpenCodeAccountControl.tsx` | UtilityTrigger + Status | native feature-styled button |
| `SettingsWorkspace.tsx` | SettingsLayout + Form/Field + SectionHeader + Status/Notice + Confirmation + Action | bespoke settings sidebar/buttons/cards/form controls |
| `OpenCodeAccountSettings.tsx` | Form/Field + SectionHeader + Status/Notice + Confirmation + Action/ResourceRow | bespoke account rows/input styling and direct AlertDialog |
| `CreateWorkItem.tsx` | Form/Field + Status/Notice + Action inside TaskPanel | raw feature-styled select/input/form spacing |
| `WorkItemQueue.tsx` | Surface + Table + Status + Action | direct table grammar plus feature-owned responsive row styling |
| `WorkItemWorkspace.tsx` | Identity + Rail + Confirmation + canonical primary composition | native workflow buttons, identity grid and direct AlertDialog |
| `WorkflowStepFrame.tsx` | Attention + Surface only | generic side-index Layout/Drawer |
| `PreSignoffStageWorkspace.tsx` | Selector + canonical Document/Dialogue/Review/Evidence composition | count-selected side index and bespoke supporting-context disclosure |
| `ActivityWorkspace.tsx` | Dialogue + Status/Notice + Disclosure + Timeline + Action | bespoke dialogue heading/composer geometry and technical details |
| `ActivityComposer.tsx` | Dialogue composer slot + approved Chat leaf + Notice/State | feature-level composer layout |
| `RunEventTimeline.tsx` | Timeline + Status + Disclosure + ResourceRow/Action | bespoke ordered-list/event layout |
| `DocumentWorkspace.tsx` | Surface + SectionHeader + Notice/State + Disclosure + Confirmation + MarkdownEditor | direct AlertDialog and bespoke technical state layout |
| `MarkdownEditor.tsx` | specialized renderer inside Document composition; SectionHeader + Toolbar/Action + Disclosure + Status/Notice; approved Markdown/segmented leaves | bespoke toolbar/technical-details/dirty-state visual grammar |
| `MarkdownSourceEditor.tsx` | specialized CodeMirror renderer consuming canonical tokens | editor-local colors/geometry outside token contract prohibited |
| `ProposalReview.tsx` | Review + Status/Notice + Action + approved CodeBlock leaf | bespoke review headings/state blocks |
| `ReadinessWorkspace.tsx` | Review + optional Selector + Status/Notice | generic WorkflowStepFrame composition |
| `SignoffReview.tsx` | Review + Field + Status/Notice + Disclosure + Action + approved MetadataList leaf | generic side index and bespoke approval action/form layout |
| `ExecutionWorkspace.tsx` | MasterDetail + Surface/Attention + Table + Timeline + Status/Notice + Disclosure + ResourceRow/Action | generic side index, bespoke validation matrix/task detail layout |
| `EvidenceViewer.tsx` | Surface + SectionHeader + State + approved CodeBlock leaf | bespoke section heading |
| `TerminalResult.tsx` | Surface + Status + SectionHeader + ResourceRow + approved Markdown/CodeBlock/peer-view leaves | bespoke result status/heading grammar |
| `WorkItemContext.tsx` | ContextPanel + Status/Notice + Disclosure + approved MetadataList leaf | bespoke context panel/technical disclosure |
| existing `ui/src/primitives/*.tsx` | migrate/expand to exactly the closed §8.12 contracts | current primitive set is incomplete and WorkbenchLayout exports feature-visible responsive policy |

Every production renderer added later must be added to this matrix (or its canonical successor) in the same DESIGN/P7 authority that introduces it. An unclassified production renderer is an architecture failure.

### 8.18 Canonical Workbench visual language and design tokens

#### 8.18.1 Design character

Order's aperture/focus identity is expressed through **clarity and controlled emphasis**, not decorative aperture motifs throughout the interface.

The Workbench is:

- neutral-first with Order blue as the controlled accent;
- flat and low-chrome;
- compact, professional and scan-efficient;
- border/spacing-driven rather than card/shadow-driven;
- consistent between light/dark themes;
- visually quiet until current action, selection, blocker or exceptional state requires emphasis.

Persistent work surfaces have no decorative box shadow. Temporary drawers/dialogs may use one foundation-owned overlay elevation.

#### 8.18.2 Semantic color contract

Raw palette values exist only in the theme token owner. Feature/service CSS and React props use semantic roles.

| Semantic token | Light | Dark | Meaning |
|---|---:|---:|---|
| canvas | `#FFFFFF` | `#111A29` | application/background |
| surface | `#FFFFFF` | `#111A29` | primary persistent surface |
| subtle | `#F8FAFC` | `#172233` | secondary/selected-neutral surface |
| border | `#D9DEE8` | `#344256` | ordinary 1px separation |
| text | `#0F172A` | `#EDF3FA` | primary text |
| muted | `#657187` | `#A9B8CD` | secondary/technical text |
| accent | `#1E3A8A` | `#93B4FF` | current/selected/link/focus identity |
| primary-action | `#1E3A8A` | `#385AC1` | filled primary action |
| primary-action-hover | `#1D4ED8` | `#4D6ED5` | primary hover |
| on-primary | `#FFFFFF` | `#FFFFFF` | foreground on filled action |
| info-bg | `#EFF6FF` | `#203554` | processing/information |
| info-fg | `#1D4ED8` | `#BAD0FF` | processing/information foreground |
| success-bg | `#D1FAE5` | `#173B31` | ready/success/complete |
| success-fg | `#047857` | `#73E5B1` | success foreground |
| warning-bg | `#FEF3C7` | `#463923` | waiting/stale/attention |
| warning-fg | `#A16207` | `#FACC77` | warning foreground |
| danger-bg | `#FEF2F2` | `#44282F` | failure/block/destructive |
| danger-fg | `#B91C1C` | `#FFADB0` | danger foreground |

`WorkbenchStatus` and `WorkbenchNotice` are the only semantic status-color owners above the foundation theme. Domain states map to these generic roles in presentation policy; features never select raw colors.

Selection/current state uses accent + info/subtle surface and a structural/text marker. Reached/unreached/historical state is never encoded by color alone.

#### 8.18.3 Typography

One application sans stack and one technical monospace stack are canonical:

```text
sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace
```

Canonical type roles:

| Role | Size | Weight | Use |
|---|---:|---:|---|
| caption/technical-xs | `0.6875rem` | 400/600 | technical labels, compact metadata |
| secondary/small | `0.75rem` | 400/600 | helper text, row metadata |
| body/control | `0.875rem` | 400/600 | ordinary copy, controls, table/list rows |
| section heading | `1rem` | 600 | material/subsection headings |
| screen/work-item title | `1.25rem` | 600/700 | selected service/item title |
| terminal result | `1.5rem` | 700 | terminal outcome only |

Body line-height is `1.5`; compact control/metadata line-height is `1.35`. Feature CSS does not introduce another type scale.

Technical ids/hashes/paths/code use mono only inside technical/detail/code contexts; ordinary user-facing labels remain sans.

#### 8.18.4 Spacing and density

All recurring spacing uses a 4px-derived semantic scale:

```text
space-0_5 = 0.125rem
space-1   = 0.25rem
space-2   = 0.5rem
space-3   = 0.75rem
space-4   = 1rem
space-6   = 1.5rem
space-8   = 2rem
```

No feature invents `.35rem`, `.55rem`, `.65rem`, `.85rem` etc. as independent design values.

Canonical density:

- compact action/input height: `2rem`;
- standard field/control minimum height: `2.25rem`;
- dense operational row minimum height: `2.25rem`;
- toolbar minimum height: `3.25rem`;
- WorkItem identity row: `3rem`;
- Context width: `22rem`, hard max `24rem`;
- operational master width: `18rem`;
- readable Markdown measure: `52rem`;
- result/review readable max measure: `72rem`.

The workflow rail and structural heights use their primitive tokens; features never pass these dimensions.

#### 8.18.5 Borders, radii and elevation

- persistent region separation: `1px solid border`;
- compact control radius: `0.375rem`;
- small internal radius: `0.25rem`;
- pill radius (`999px`) is reserved for compact status/segmented semantics where the underlying foundation component uses it;
- persistent Workbench surfaces, tables, review bodies and master/detail regions do not use decorative shadows;
- overlays/drawers/dialogs use one foundation-owned elevation and cannot define feature-local box shadows.

Cards are not a primary hierarchy device. Configuration collections use flat bordered rows/sections, not floating dashboard cards.

#### 8.18.6 Focus, hover, selection and disabled state

Keyboard focus uses a `2px` accent outline/ring with at least `2px` separation from the control boundary where space permits. Focus is visually distinct from selected/current state.

Interactive hover changes are subtle and cannot move geometry. Disabled controls preserve readable labels and expose the blocking reason in adjacent text/notice where the reason is material.

Normal text must meet at least a 4.5:1 foreground/background contrast target; large text at least 3:1; focus indicators and meaningful non-text boundaries at least 3:1 against adjacent colors.

#### 8.18.7 Status and feedback hierarchy

`WorkbenchStatus` is compact and non-dominant; it labels state but does not replace the primary task text.

`WorkbenchNotice` owns inline feedback:

- info: processing/non-blocking information;
- success: completed/ready confirmation when confirmation is useful;
- warning: waiting/stale/attention;
- danger: failed/blocked/destructive error.

Workflow-critical failure/block/input feedback stays in the owning Attention/material region. Toast-only critical feedback remains prohibited.

#### 8.18.8 Forms and controls

`WorkbenchField` owns label/help/error spacing and accessibility linkage. Placeholder text never substitutes for a label.

`WorkbenchForm` uses one-column field flow by default. Multi-column forms require a stable semantic pairing, not space-filling. Primary submit and destructive actions remain explicit; error text is adjacent to the owning field/form.

Feature code does not style raw `input/select/textarea/button` elements. Native or Astryx controls are rendered only through the owning primitive contract.

#### 8.18.9 Tables, lists, timeline and content

Operational scanning uses `WorkbenchTable` or `WorkbenchResourceRow` with compact density, row dividers and clear selection. Repeated equal-weight cards are prohibited.

`WorkbenchTimeline` uses chronological rows with compact time/status metadata, readable event summary and subordinate evidence/actions. Technical event payloads are disclosures, not default primary copy.

Markdown/document reading uses the `52rem` readable measure when prose is the primary task; code/evidence may use the full available surface with bounded scrolling.

Specialized Markdown source-editor roles map to the same semantic tokens:

- editor background/text/border/gutter -> surface/text/border/subtle/muted;
- selection -> info-bg;
- active line -> subtle;
- search match -> warning-bg with warning-fg outline;
- link -> info-fg/accent role;
- code/syntax emphasis -> success-fg only where semantically appropriate, otherwise text/muted.

The source editor does not define an independent light/dark palette.

#### 8.18.10 Theme and motion

System/light/dark preference changes token values only; it does not change component hierarchy or introduce theme-specific component CSS.

Functional transitions use at most a fast/standard motion token (`120ms` / `180ms`) for opacity/transform/disclosure where the foundation component already supports it. No decorative motion is required. Reduced-motion preference disables non-essential transition animation.

### 8.19 Approved foundation leaves and specialist renderers

The closed primitive system does not require pointless one-line wrappers. The following leaves are approved **only inside the owning primitive composition**:

| Foundation/specialist | Allowed use | Boundary |
|---|---|---|
| Astryx `Theme` | root theme substrate only | mounted once at application root; feature modules do not create theme islands |
| Astryx `SegmentedControl` / `TabList` | small fixed peer-view choices such as theme or Edit/Preview/Split | never workflow navigation; cannot alter outer topology |
| Astryx `RadioList` / `MultiSelector` / selector controls | field choices inside `WorkbenchField/Form` | field grammar remains primitive-owned |
| native `input/select/textarea` where no suitable foundation control exists | control slot inside `WorkbenchField` only | no feature-owned styling; canonical control tokens apply |
| Astryx `Markdown` | document/result rendering | readable measure/theme inherited from content owner |
| Astryx `CodeBlock` | evidence/diff/raw code | bounded scrolling/theme inherited |
| Astryx `MetadataList` | secondary/technical structured metadata | not primary workflow hierarchy |
| Astryx Chat message/composer leaves | only inside `WorkbenchDialogue` | dialogue geometry/input policy remain outside leaf |
| CodeMirror via `MarkdownSourceEditor` | exact Markdown source editing | consumes canonical editor/color/type/focus tokens; no independent palette |
| semantic HTML (`section`, `p`, `dl`, `code`, lists, `a`) | content semantics and true external/document links inside primitive slots | no independent layout/color/type system; links use accent/link token + underline/focus grammar |

Direct Astryx `Button`, semantic-status `Badge`, structural `Layout/Drawer`, or `AlertDialog/Dialog` use in feature/service modules is not approved because those mechanics are owned by `WorkbenchAction`, `WorkbenchStatus`, structural/task/context primitives and `WorkbenchConfirmation`.

### 8.20 CSS and token ownership

`ui/src/theme.css` is the sole Order-owned token/presentation stylesheet. Its target organization is:

1. raw light/dark palette definitions;
2. semantic tokens from §8.18;
3. primitive selectors corresponding exactly to §8.12;
4. specialist content selectors that consume semantic tokens only;
5. scoped media overrides using only §8.10 breakpoints.

After the token blocks, production selectors do not contain raw hex/rgb/hsl/color-mix values for semantic styling. Feature selectors do not introduce their own font sizes, spacing scale, radii, control heights, semantic colors, shadows or structural breakpoints.

The current CSS contains many ad-hoc fractional spacing/type values and feature-owned visual systems; those are implementation evidence to replace, not design authority.

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
- `WorkflowRail.tsx` — pure adapter from the canonical `deriveWorkflowRail(...)` projection into `WorkbenchRail`; it owns labels/accessibility wiring only and contains no reach/current-marker policy;
- `WorkflowStepFrame.tsx` — thin workflow adapter over `WorkbenchAttention` + `WorkbenchSurface`, with no independent structural layout behavior;
- `WorkflowMaterialSelector.tsx` — thin domain adapter over `WorkbenchSelector` for Run/document/proposal/evidence material;
- `ActivityWorkspace.tsx` / `ActivityComposer.tsx` — dialogue content/policy adapters over `WorkbenchDialogue`; transcript/composer geometry remains primitive-owned;
- `RunEventTimeline.tsx` — RunEvent presentation adapter over `WorkbenchTimeline`;
- Queue/Settings/Create/Account renderers remain cohesive feature/service adapters, but all structure/forms/status/notices/tables/overlays resolve through the §8.12 primitives and §8.17 matrix.

This is not a new UI framework or controller layer. These modules remain ordinary functional React composition over canonical typed data and callbacks. Any new production module is added to the architecture fitness dependency map in the same implementation change.

### UI structural components

`WorkItemIdentityRow.tsx` becomes a thin adapter over `WorkbenchIdentity`; feature CSS no longer owns the identity grid.

`WorkflowStepFrame.tsx` loses the optional generic side-index/drawer responsibility and becomes a thin adapter over `WorkbenchAttention` + `WorkbenchSurface`.

Pre-signoff/Readiness use `WorkflowMaterialSelector` -> `WorkbenchSelector`; item count cannot alter primary columns. Active/historical dialogue uses `WorkbenchDialogue`; feature code supplies transcript/composer content but does not own anchored-composer geometry or responsive dialogue mechanics.

Proposal, Readiness and Approval map into `WorkbenchReview`; they do not reuse a generic side-index simply because documents/tasks exist. Secondary technical/supporting detail uses `WorkbenchDisclosure`.

Implementation maps into `WorkbenchMasterDetail`; feature code does not create its own persistent grid columns.

`WorkbenchLayout` owns responsive outer topology/Context hosting; `WorkbenchContextPanel` owns the Context body/close affordance. `App.tsx` owns only the open/close boolean and supplies a true toggle.

Dirty/destructive navigation confirmation uses `WorkbenchConfirmation`; the navigation guard owns the policy/state while the primitive owns modal interaction mechanics.

Queue uses `WorkbenchTable` and `WorkbenchNotice`; Create WorkItem uses `WorkbenchTaskPanel -> WorkbenchForm/Field`; Settings uses `WorkbenchSettingsLayout -> WorkbenchForm/Field/Status/Notice/Confirmation`; account utility entry uses `WorkbenchUtilityTrigger`.

### UI attention/presentation cleanup

The current `Supporting context` disclosure is removed from the leading primary position in pre-signoff activity/document surfaces and is represented through the subordinate material selector/secondary access defined in §8.5.

The current prominent `OpenCode session` block in `ActivityWorkspace` is removed from primary composition. Canonical workflow interaction state owns the visible status; provider diagnostics remain Technical details/evidence unless they are the active blocker.

`WorkflowStepSummary` renders one current action owner only. A retryable failed Run must not simultaneously expose both generic Start and Retry controls for the same stage.

Implementation validation presentation is sparse/current-state-first as defined in §8.8; a full empty V0–V7 matrix is not rendered before validation begins.

### UI CSS

`theme.css` becomes the single semantic token/presentation owner in §8.20. Duplicate/dead layout and feature-local visual systems are removed. Primitive selectors own all recurring structure/mechanics; specialist content selectors consume §8.18 semantic color/type/spacing/radius/focus tokens only. After token declarations, feature/service selectors may not contain raw palette values, independent type/spacing scales, feature-owned shadows/control chrome, or alternate structural breakpoints.

No production class/service/repository/controller/DTO/mapper module is introduced.

### Structural remediation boundary

The current Workbench implementation is evidence of the failure modes described by this design; it is **not** the structural or visual baseline that P7 incrementally patches into compliance.

P7 must perform an architecture-preserving **re-composition** around the canonical owners and visual language above. This is not a later cosmetic pass: §8.18 visual tokens and §8.12 primitive ownership are part of the architecture that every migrated renderer must consume.

#### Required replacement order

The implementation sequence is structurally ordered:

1. establish the closed lifecycle transition-cause policy in `src/core/lifecycle.ts` and the closed derived workflow-state/rail language in `src/core/workflow-state.ts`;
2. establish the dedicated selected-WorkItem canonical observation and one shared mutation-refetch boundary;
3. make current attention/recovery/execution ownership and rail projection independent from historical inspection state;
4. reduce the generic workflow frame to summary/current-attention + primary material only;
5. establish the §8.18 semantic token system and complete §8.12 primitive set, including application services (Queue/Create/Settings), forms, semantic status/notices, tables/timeline, task panel and confirmation;
6. migrate every renderer in §8.17 onto its exact §8.15 primitive composition and approved §8.19 leaves;
7. perform the required same-layer component decomposition in §12 UI ownership above;
8. remove superseded generic side-index/layout, raw feature control/status/overlay styling, ad-hoc visual values and duplicate/dead CSS systems;
9. tune only within the already-defined token/component language; do not invent visual values locally;
10. certify state, renderer coverage, visual language, theme parity and geometry permanently through §14.

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
- duplicate/unused structural CSS systems that preserve the old layout topology;
- feature-styled native buttons/inputs/selects/textareas outside the §8.12 form/action primitives;
- direct feature/service Drawer/AlertDialog/Dialog or semantic Badge ownership where §8.12 owns the mechanic;
- raw feature-level hex/rgb/hsl/color-mix semantic colors and ad-hoc fractional spacing/type scales;
- feature-specific table, timeline, status, notice, settings-navigation or account-trigger visual grammars.

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

- one pure lifecycle transition owner determines every stage/status/outcome mutation from the closed semantic cause language;
- one pure workflow-state owner determines reach/interaction/proposal/currentness/execution/recovery/coherence/current-attention/rail semantics from canonical facts;
- one selected-WorkItem query owns current WorkItem observation;
- one current attention/recovery owner exists for every state;
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

**Required behavior:** every WorkItem stage/status/outcome mutation is produced by `src/core/lifecycle.ts` from canonical current state plus exactly one closed §4.9 semantic transition cause; daemon modules do not invent alternate lifecycle transitions or assign lifecycle tuples directly.

**Acceptance:** every row of the P3 cross-step transition table maps to one semantic cause and one core policy result; every lifecycle-mutating production call site is traceable to that cause language and unlisted causes/state combinations reject.

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

**Required behavior:** current attention and recovery are closed pure §4.8 projections independent of historical selection; exactly one inline surface owns each mutation error/blocker/recovery action and lower-precedence actions are suppressed.

**Acceptance:** every canonical state fixture resolves to exactly one CurrentAttention category and one RecoveryDisposition; historical Run/task selection cannot hide/change them, and the same mutation failure is not rendered by both parent workspace and child composer.

### GW-TR-090-STABLE-WORKBENCH-GEOMETRY

**Realizes:** `GW-FR-214-STABLE-WORKBENCH-GEOMETRY`, `GW-FR-215-STABLE-WORKFLOW-RAIL`, `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL`, `GW-FR-217-PRIMARY-INFORMATION-ECONOMY`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-219-EXPLICIT-CONTEXT`, `GW-FR-220-PRESIGNOFF-CONTINUITY`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-224-TERMINAL-RESULT-PRIMACY`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`.

**Required behavior:** workflow rail, pre-signoff material selection, Approval, Implementation master/detail and Context obey the stable spatial contracts in §8 without content-count/status-driven persistent column insertion or width changes.

**Acceptance:** at the same viewport and Context state, a pre-signoff step with one versus multiple attempts/documents has identical primary-surface x-position and width; Readiness/Approval do not acquire the generic side-index rail; Implementation master width is invariant across task/attempt state; workflow-cell widths are state-invariant; Context has an explicit close/toggle; only explicit Context and the single responsive-class transition alter structural columns. The superseded content-count side-index/generic-frame structural path is deleted rather than hidden or CSS-overridden.

### GW-TR-091-WORKFLOW-STATE-MACHINE-CERTIFICATION

**Realizes:** `GW-FR-227-CERTIFICATION-MATRIX`, `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE`, `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY`, `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE`, `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION`.

**Required behavior:** permanent core/integration/browser/architecture tests close the positive and negative transition matrix, derived-state algebra, rail projection, turn grammar, proposal-adoption recovery, concurrency races, read purity, async convergence and geometry invariants.

**Acceptance:** implementation cannot pass certification with an untested admitted transition/state variant, contradictory provider-turn combination, unclassified workflow state, state-mutating GET, duplicate workflow/rail state owner or ordinal-only history algorithm.

### GW-TR-097-CLOSED-WORKFLOW-STATE-ALGEBRA

**Realizes:** `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION`, `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE`, `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE`, `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE`, `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE`, `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE`.

**Required behavior:** `src/core/workflow-state.ts` owns the complete §4.8 read-only decision algebra over canonical P6 facts, while `src/core/lifecycle.ts` owns only §4.9 lifecycle mutation semantics. No feature/daemon/UI module creates another workflow status, attention/recovery category, execution owner, currentness rule or coherence rule.

**Acceptance:** exhaustive pure tests cover every union variant and invalid/contradictory histories fail closed; architecture fitness rejects parallel workflow-state derivation outside the authorized core owners and rejects persistence/transport/browser-store representations of these derived values.

### GW-TR-098-CANONICAL-WORKFLOW-RAIL-PROJECTION

**Realizes:** `GW-FR-205-MONOTONIC-REACH-HISTORY`, `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE`, `GW-FR-215-STABLE-WORKFLOW-RAIL`, `GW-FR-224-TERMINAL-RESULT-PRIMACY`, `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION`.

**Required behavior:** one pure `deriveWorkflowRail` projection produces all nine ordered rail states from canonical reach/current-attention/recovery facts plus presentation-local selection. UI code may format but cannot reinterpret reach/current markers; rail output is never consumed by command admission.

**Acceptance:** fixtures covering forward progress, R3/execution return, required input, proposal decision/adoption, processing, block/recovery, stale authority and completion produce exactly one CURRENT item and exactly one current-stage marker; historical/unreached items never carry current operational markers.

### GW-TR-092-STRUCTURAL-UI-PRIMITIVE-OWNERSHIP

**Realizes:** `GW-FR-214-STABLE-WORKBENCH-GEOMETRY`, `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-219-EXPLICIT-CONTEXT`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`.

**Required behavior:** every persistent Workbench topology is produced by the structural subset of the closed screen-construction vocabulary in §8.12. Feature/workflow components map canonical state into those primitives and may not directly invent shell/identity/rail/surface/master/Context columns, responsive structural branches or content-count-selected layout modes.

**Acceptance:** architecture fitness proves Workbench feature surfaces do not import structural Astryx `Layout`/`Drawer` directly, do not call a feature-visible responsive-layout hook to choose structural markup, and do not own raw CSS selectors that recreate the primitive-owned outer topology, identity grid, persistent master/detail or Context/selector structural behavior.

### GW-TR-093-UI-PRIMITIVE-STATE-INDEPENDENCE

**Realizes:** `GW-FR-214-STABLE-WORKBENCH-GEOMETRY`, `GW-FR-217-PRIMARY-INFORMATION-ECONOMY`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK`.

**Required behavior:** Workbench primitives are domain/query/policy blind and structural primitives are count-blind for topology. Their APIs expose only named constrained slots and fixed Workbench geometry/interaction responsibilities; they do not accept arbitrary sidebar/column/width/breakpoint/slot/mega-variant configuration that lets callers reconstruct a competing UI system.

**Acceptance:** adding/removing Run/document/task rows can change only rows/content inside the chosen primitive; it cannot select another persistent topology. Primitive modules contain no WorkItem/Run/lifecycle imports, TanStack Query ownership, current-attention policy or content-count structural branching.

### GW-TR-094-CLOSED-WORKBENCH-SCREEN-COMPOSITION

**Realizes:** `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-220-PRESIGNOFF-CONTINUITY`, `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY`, `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`, `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR`.

**Required behavior:** every rendered Order Workbench service is built from the complete closed primitive vocabulary in §8.12 according to §8.15. Feature/content owners may supply domain content and §8.19 leaves inside primitive slots, but reusable Workbench structure/interaction/visual semantics remain primitive-owned.

**Acceptance:** architecture fitness rejects bypass of shell/toolbar/utility/identity/rail/surface/attention/form/selector/dialogue/review/master-detail/Context/task-panel/settings/status/notice/table/timeline/disclosure/confirmation mechanics, rejects undeclared screen grammars, and requires any new primitive to arrive with DESIGN authority plus permanent fitness coverage.

### GW-TR-095-WORKBENCH-RENDERER-COVERAGE

**Realizes:** `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR`, `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE`.

**Required behavior:** every production UI renderer is classified in §8.17 (or its canonical successor) and resolves completely to §8.12 primitives plus explicitly approved §8.19 leaves/specialist renderers. Non-rendering modules are explicitly excluded rather than silently omitted.

**Acceptance:** adding a production TSX renderer without a registered composition fails architecture fitness; every baseline renderer in §8.17 is migrated without retaining a parallel feature-owned grammar.

### GW-TR-096-CANONICAL-WORKBENCH-VISUAL-LANGUAGE

**Realizes:** `GW-FR-217-PRIMARY-INFORMATION-ECONOMY`, `GW-FR-218-SPACE-CLASS-CONSISTENCY`, `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY`, `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK`, `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE`.

**Required behavior:** color, typography, spacing/density, borders/radii, elevation, control geometry, focus, semantic status/feedback, theme parity and motion use only the canonical §8.18 token/role system; `theme.css` owns raw palette/token values under §8.20.

**Acceptance:** no feature/service establishes a competing palette/type/spacing/control/status/table/timeline/overlay language; light/dark themes preserve semantic roles; primitive/specialist rendering consumes semantic tokens only.

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
- proposal adoption remains ADOPTION_IN_PROGRESS across interruption until exact reconciliation/disposition;
- observation coherence suppresses mutation controls while dependent canonical facts converge;
- deterministic execution owner/validation boundary independent of historical selection;
- one feedback owner;
- stable workflow rail geometry and exact READY/PROCESSING/ACTION_REQUIRED/BLOCKED/STALE/COMPLETE marker projection;
- no conditional pre-signoff rail;
- stable Implementation master width;
- Readiness/Approval review hierarchy without generic side-index dominance;
- explicit open **and close** Context behavior;
- wide identity-row three-group geometry;
- Dialogue transcript/composer geometry remains stable across active/historical state and wide/medium/narrow recomposition; absence of an admissible composer does not create another screen topology;
- dirty/destructive confirmation uses one accessible modal mechanic with focus return and leaves the underlying primary screen mounted;
- every P3 primary interaction class and auxiliary class is exercised through its §8.15 canonical primitive composition;
- Queue, Create WorkItem and Settings exercise their canonical service compositions rather than bespoke screen grammars;
- light and dark theme certification verifies the §8.18 semantic roles for normal/current/selected/info/success/warning/danger/focus states without state meaning changing;
- form labels/help/errors, status/notices, operational tables, timeline rows, disclosure and task-panel/confirmation interaction are visually and keyboard consistent across representative services;
- typography/readable measures, compact control/row density and focus indicators remain within the canonical token roles at wide/medium/narrow widths;
- responsive continuity with no page-level horizontal overflow for current action/identity.

### 14.6 Architecture fitness

Permanent sensors prove:

- no new DTO/view-model/domain-copy family;
- no browser workflow store;
- UI workflow policy imports only the authorized browser-safe core lifecycle/workflow-state owners;
- daemon modules do not implement a second stage-order/transition table or workflow-state/recovery/attention classifier;
- no persisted/transport/browser-store `WorkflowState`/rail-state/view-model family exists;
- lifecycle-mutating daemon call sites route through the closed §4.9 transition-cause owner rather than assigning stage/status/outcome ad hoc;
- rail reach/current-marker semantics are referenced only from the authorized `deriveWorkflowRail` projection; UI adapters do not recalculate them;
- GET handlers cannot call known reconcile/materialization mutation functions;
- ordinal reached-history comparison is absent from production Workbench code;
- the generic step frame has no content-count-dependent persistent side-index slot;
- one dedicated selected WorkItem query (not the queue list) owns current WorkItem observation; shared-query secondary consumers cannot become competing workflow-policy/current-attention owners;
- Workbench responsive structural breakpoints are singular/consistent across JS and CSS;
- Workbench feature/service renderers do not import foundation mechanics already owned by §8.12, including structural `Layout/Drawer`, direct `Button`, semantic-status `Badge`, Workbench dialogue scaffolding or confirmation `AlertDialog/Dialog`, and do not choose structural markup through local viewport hooks;
- every required §8.12 primitive owner exists and no generic arbitrary-slot/layout mega-primitive replaces the closed vocabulary;
- every production TSX renderer is classified by the §8.17 registry; bootstrap/non-renderers are explicitly excluded;
- Workbench primitive modules are domain/query/policy blind and structural primitives contain no content-count topology branching;
- only closed primitive selectors establish persistent topology, identity grid, form/control grammar, anchored dialogue composer, Settings/task-panel/Context geometry, status/notice treatment, operational-table/timeline grammar and confirmation layout;
- §8.19 foundation leaves appear only inside their authorized primitive/specialist boundary;
- raw semantic color literals (hex/rgb/hsl/color-mix), feature-owned font-size/spacing/radius/control-height scales and feature-owned box shadows are absent from production selectors outside the §8.20 token owner;
- theme token definitions provide complete light/dark values for every §8.18 semantic color role;
- specialist CodeMirror/Markdown/evidence renderers consume canonical color/type/focus tokens rather than an independent palette;
- obsolete competing Workbench layout/interaction/visual selectors are absent from production CSS.

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
