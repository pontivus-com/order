<!-- Order template: delivery-design-v1; authority: GW-DOC-LIFECYCLE-CONTEXT-V1, GW-DOC-TECHNICAL-ARCHITECTURE-V1 -->

# 0.5.0 integrated workflow task experience — solution design

**Status:** Solution design complete draft — canonical P4/P6 amendments pending verification  
**WorkItem:** `work_2778105b-d919-4fcd-91e7-dd9b23812aac`  
**Derived factual authority:** parent Audit `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Accepted functional authority:** this WorkItem's reviewed `requirements.md`  
**Visual reference:** `docs/references/workbench-ui/README.md`

This document records the change-specific Solution-design decisions. Permanent semantics are owned by the canonical P4/P6 documents amended by this design; this WorkItem does not become a competing architecture or contract owner.

## Context/governing constraints

Phase 1 proved that Order already has the correct broad architecture for the 0.5.0 correction:

- one canonical WorkItem lifecycle;
- orthogonal Run interaction, proposal decision, material currentness, recovery, execution ownership, validation boundary, observation coherence and current-attention derivations;
- canonical `Run`, `RunEvent`, `ArtifactRef`, `Approval` and `ExecutionTask` facts;
- one narrow OpenCode shell using pinned OpenCode `2.2.6`;
- browser-safe pure lifecycle derivation in `src/core/lifecycle.ts`;
- existing daemon ownership boundaries for STAGE, authority, source reconciliation, execution and coordinator composition;
- a closed Workbench primitive vocabulary backed by Astryx `0.7.13`.

The accepted Phase 2A model requires the existing architecture to become coherent end-to-end. The technical design therefore follows **minimum sufficient correction**:

1. extend existing canonical unions only where a new durable observation is genuinely required;
2. derive all user-facing workflow/maturity state from existing facts;
3. keep OpenCode provider-native shapes inside the imperative shell;
4. keep browser presentation as a client of canonical state;
5. preserve the existing global automatic execution scheduler;
6. do not add a workflow aggregate DTO, browser workflow store, event bus, telemetry database, material-status column, proposal-status column, execution-owner column or recovery-entitlement field.

The completed Phase 1 technical obligations are closed here as:

| Obligation | Design closure |
|---|---|
| TD-01 proposal terminalization | proposal-decision-aware Cancel admission in core + daemon |
| TD-02 manual execution ownership | exact WorkItem/task-scoped manual start command |
| TD-03 STAGE producer contract | producer and consumer share one closed batch grammar including reply anchor |
| TD-04 causal diagnostics | bounded Order-admission diagnostic evidence on rejected provider batches |
| TD-05 OpenCode transparency | bounded normalized agent-activity RunEvents; best-effort live + terminal reconciliation |
| TD-06 repository-draft projection | draft ArtifactRefs returned independently of Run history; ArtifactRef no longer proves reach |
| TD-07 information hierarchy | structural Dialogue/activity/workflow separation + canonical primitive/reference composition |
| TD-08 certification | permanent producer→carrier→consumer negative matrix and browser continuity proof |

## Goals/non-goals

### Goals

The technical solution must:

- make every Workbench screen conform to the accepted task/information hierarchy and stored SVG reference pack;
- guarantee that every free-form reply has a visible substantive agent message;
- expose useful bounded OpenCode/Order activity without exposing hidden reasoning or raw provider payloads;
- close the proposal/Cancel dead state at the same canonical admission boundary used by UI and daemon;
- make the visible Implementation manual action start exactly the canonical current task shown to the operator;
- surface repository lifecycle drafts without inventing Runs, conformance or reached history;
- derive operator-facing material maturity from canonical facts;
- make a post-provider Order batch rejection diagnosable without persisting raw assistant output;
- preserve asynchronous convergence and current-action ownership;
- certify every materially changed boundary permanently.

### Non-goals

This design does **not**:

- upgrade OpenCode or Astryx;
- use OpenCode's embedded UI;
- expose chain-of-thought, hidden reasoning, secrets, raw tool I/O or raw provider event payloads;
- make OpenCode activity correctness authority;
- add a generic observability/telemetry subsystem;
- change the global automatic scheduler's task-selection semantics;
- create a second execution queue;
- create a new lifecycle/document-maturity persistence model;
- turn repository draft existence into lifecycle progression;
- add a second Workbench layout/component system;
- redesign the accepted Phase 2A product behavior.

## Canonical owner/affected boundaries

### Existing owners retained

| Concern | Canonical owner after this design |
|---|---|
| lifecycle/reach/proposal/current-attention/material presentation derivation | `src/core/lifecycle.ts` |
| provider role/event admission | existing core provider-admission owner |
| STAGE prompt/turn orchestration and batch reaction | `src/daemon/stage.ts` |
| repository/source draft materialization | `src/daemon/work-item-source.ts` |
| current lifecycle material projection/context/conformance | `src/daemon/authority.ts` |
| post-signoff task/run mechanics | `src/daemon/execution.ts` |
| scheduler and command composition | `src/daemon/coordinator.ts` |
| OpenCode API/provider-native activity mapping | `src/shell/opencode.ts` |
| canonical persistence/transport types | `src/core/contracts.ts` + existing SQLite/HTTP owners |
| selected WorkItem composition/query convergence | `ui/src/WorkItemWorkspace.tsx` |
| pre-signoff dialogue | `ActivityWorkspace.tsx`, `ActivityComposer.tsx`, thin Run presentation adapters |
| material selection | `workbench-presentation.ts` |
| visual mechanics | existing `ui/src/primitives/**` + approved Astryx leaves |

No new controller/service/repository/DTO/mapper layer is introduced.

### Narrow new/changed semantic contracts

This design authorizes only these material contract changes:

1. one coordinator-owned `AGENT_ACTIVITY_RECORDED` RunEvent payload;
2. one exact task-scoped manual execution-start HTTP command;
3. one bounded provider-result admission diagnostic evidence shape;
4. corrected STAGE batch grammar including a conversational anchor;
5. corrected lifecycle-artifact/reached-history projection semantics.

Everything else remains a pure derivation or presentation recomposition.

## Data/control flow

### 1. Pre-signoff provider turn

~~~text
persisted STAGE trigger
        |
        v
resolved canonical context
        |
        +--> coordinator records PREPARING_CONTEXT activity
        |
        v
OpenCode prompt admitted with deterministic prompt id
        |
        +--> coordinator records WAITING_EXTERNAL activity
        |
        +--> best-effort authenticated provider event stream
        |       |
        |       v
        |   shell whitelist/classify/redact
        |       |
        |       v
        |   bounded AGENT_ACTIVITY_RECORDED events
        |
        v
terminal session.get outcome
        |
        v
session.context
        |
        +--> completed assistant text -> canonical semantic JSON array
        |
        +--> terminal tool-part reconciliation -> missing bounded activity records
        |
        v
role admission
        |
        v
closed STAGE batch validation
        |
        +--> reject atomically -> admission diagnostic evidence + PROVIDER_FAILED
        |
        v
persist complete semantic batch + react transactionally
        |
        v
browser polls RunEvents / canonical WorkItem
        |
        +--> conversation plane
        +--> agent activity plane
        +--> workflow/system plane
~~~

Provider live activity is observational only. Failure or loss of the provider event stream never changes Run completion, input admission, proposal state, lifecycle state or retry entitlement.

### 2. Dialogue and reply context

For a selected STAGE attempt, the browser partitions the existing ordered RunEvent stream into three presentation planes:

- **Conversation:** `AGENT_MESSAGE_FINAL`, `HUMAN_INPUT_REQUESTED`, `HUMAN_INPUT_RECEIVED`;
- **Agent activity:** `AGENT_ACTIVITY_RECORDED`;
- **Workflow/system:** proposals, conformance, block/completion, provider failure/diagnostics, evidence and other canonical workflow events.

All three remain one canonical RunEvent chronology; the UI does not create another message/activity store.

`WorkbenchDialogue` owns the stable Dialogue geometry. Its wide composition has:

- Astryx `ChatLayout` / `ChatMessage` / `ChatMessageMetadata` leaves for the conversation;
- the existing Astryx `ChatComposer` leaf in the anchored composer slot;
- one fixed supporting-activity region rendered from bounded activity events;
- workflow events as distinct system/timeline material, never disguised as chat messages.

The supporting-activity region is part of the Dialogue interaction class, not a navigation rail. Its wide geometry is stable for a selected attempt. At medium/narrow layouts it becomes subordinate inline/disclosure material without displacing the transcript/composer or creating another Drawer/navigation axis.

Astryx `ChatToolCalls` is **not** used to expose provider-native tool records: Order shows only its normalized/redacted activity projection.

### 3. STAGE result grammar and reply anchor

The STAGE provider-result grammar remains a complete-array admission rule.

In addition to the existing control/proposal constraints:

- a STAGE batch contains at most one `AGENT_MESSAGE_FINAL`;
- when a turn has **no** controlling event (`HUMAN_INPUT_REQUESTED`, `STAGE_BLOCKED`, `STAGE_COMPLETED`), it must contain exactly one non-blank `AGENT_MESSAGE_FINAL`;
- a proposal may coexist with that one final message but still cannot coexist with a controlling event;
- a required-input question itself is the conversational anchor, so `AGENT_MESSAGE_FINAL` is optional on a required-input turn;
- block/completion turns do not create a reply surface and therefore do not require a final message;
- `OBSERVATION_RECORDED` does not count as a conversational anchor.

The shell producer contract and the core consumer validator are certified against the same closed grammar. The generic STAGE output wording is removed from `stagePrompt`; `providerOutputContract("STAGE")` is the single producer rendering of the complete grammar.

`stageRunInteraction` ignores coordinator-only activity/diagnostic records when deciding whether the provider result has settled. Activity cannot accidentally change PROCESSING to OPEN.

### 4. Proposal decision and Cancel

The canonical cancellation rule is:

~~~text
active STAGE Run
+ interaction in PROCESSING | OPEN | REQUIRED_INPUT
+ proposal decision == NONE
= Cancel admitted
~~~

If proposal decision is `PENDING` or `ADOPTION_IN_PROGRESS`, Cancel is rejected by the daemon and not offered by the browser.

A pending proposal must first be Reject-ed before ordinary Run cancellation may become eligible. Once adoption intent exists, only exact adoption/reconciliation may finish the proposal.

The rule lives as a browser-safe pure predicate in the lifecycle owner and is rechecked from current persisted RunEvents at the daemon command boundary. It is not implemented as a UI-only disable.

### 5. Manual Implementation start

The current task shown in Implementation and the manual command target become the same semantic object.

New command:

~~~text
POST /api/work-items/:workItemId/tasks/:executionTaskId/start
body {}
-> Run
~~~

Admission requires, at the final command boundary:

- WorkItem exists and is `EXECUTION / ACTIVE`;
- submitted task belongs to the current Approval for that WorkItem;
- submitted task is the exact canonical `ExecutionOwner.CURRENT_TASK`;
- task state is `TODO`;
- dependencies are successful;
- Approval/current material is still valid;
- no execution task is already globally RUNNING;
- no coordinator tick is already active;
- no competing per-WorkItem operator mutation owns the WorkItem.

The command computes the existing BUILDER approval context, transactionally marks exactly that task `RUNNING` and creates its exact BUILDER Run. It then invokes the existing coordinator execution loop against that already-running task asynchronously and returns the canonical Run immediately.

No second scheduler or queue is introduced. The automatic scheduler continues to use the existing global eligible-task scan.

`POST /api/tick` remains the global scheduler/operational command and is not called by the WorkItem UI. Its authenticated HTTP surface becomes daemon/CLI-only rather than a browser task command.

The Implementation action label is **Start current task**. Historical task selection remains read-only and cannot alter the submitted current-owner task id.

### 6. Repository draft projection and reached history

Repository draft existence and lifecycle reach are separated.

`deriveReachedStages` no longer treats an `ArtifactRef` as proof that its owner stage was reached. Reach is proved only by:

- IDEA;
- current WorkItem stage;
- a Run at that stage;
- accepted `STAGE_COMPLETED` transition evidence and its destination;
- signed/materialized execution-task evidence for Approval/Implementation;
- current COMPLETE.

This lets repository lifecycle drafts be visible without fabricating progression.

`currentLifecycleArtifacts` becomes a **non-mutating current-material projection** over already persisted lifecycle `ArtifactRef` snapshots materialized by reconciliation/direct Save/adoption. It:

- enumerates current persisted lifecycle-role snapshots independently of Run history;
- proves current repository bytes still match the selected persisted snapshot;
- returns the current semantic snapshot per deterministic lifecycle role/path;
- never inserts an ArtifactRef or mutates lifecycle state on GET.

If repository bytes have changed without a persisted current snapshot, explicit source reconciliation/direct Save remains the mutation that materializes that new snapshot.

The Workbench resolver may therefore show an existing deterministic draft on an otherwise `UNREACHED` lifecycle step. In that case:

- the workflow rail remains `UNREACHED`;
- the document is read-only;
- its user-facing maturity is **Draft**;
- it creates no Run, conformance or reached-history fact.

Once the owner stage is genuinely reached, the same current file becomes editable only under the existing direct-edit/no-active-Run rules.

### 7. Operator-facing material maturity

Material maturity is a pure presentation decision over canonical facts. It is not persisted and is not transported as a new DTO.

For lifecycle Markdown the derivation precedence is:

1. **Signed & locked** — selected current material belongs to the exact current signed closure and the WorkItem is in Implementation/Complete;
2. **Historical** — selected ArtifactRef is not the current semantic snapshot for its role/path;
3. **Stale** — canonical conformance/approval currentness identifies an upstream stale owner;
4. **Current** — exact current ArtifactRef is covered by current conformance for its owning stage/context;
5. **Updated — validation required** — owning stage is reached/current and current bytes exist but current matching conformance does not;
6. **Draft** — current repository material exists but its owner stage is not reached.

Proposal Pending/Applying remains an interaction state, not material maturity. Git state remains orthogonal.

Work request source currentness continues to use its existing source-validity/freshness semantics rather than forcing lifecycle-conformance labels onto a source that has no independent stage-conformance event.

### 8. Bounded agent activity

Canonical addition:

~~~text
AgentActivityCategory =
  PREPARING_CONTEXT
  | READING
  | SEARCHING
  | EDITING
  | RUNNING_CHECKS
  | REVIEWING_RESULTS
  | RETRYING
  | WAITING_EXTERNAL

AGENT_ACTIVITY_RECORDED {
  category: AgentActivityCategory
  summary: non-empty, no-NUL, max 160 characters
  resource: non-empty, no-NUL, max 240 characters | null
}
~~~

The event is coordinator-owned and never provider-emittable.

Emission law:

- persist only category/resource transitions or materially distinct bounded summaries;
- maximum **32** activity records per productive provider turn;
- after the cap, further live detail is dropped rather than truncating raw provider data into persistence;
- the Run's canonical status/outcome still communicates Processing/Failed/Completed;
- no raw input/output/metadata/native payload, hidden reasoning, token content, secrets or provider protocol identifiers are persisted in activity.

Source mapping:

- Order-owned orchestration emits Preparing context, Waiting on provider, Running checks, Reviewing results and Retrying/recovering where those phases are objectively known;
- the shell may subscribe to the pinned authenticated OpenCode event stream **only for best-effort live activity**;
- recognized public tool events are allowlisted into Reading/Search/Editing categories;
- unknown tools/events are omitted rather than guessed;
- only a proven safe repository-relative resource label may be retained; otherwise resource is null;
- after successful terminal completion, released `session.context` tool parts reconcile a bounded post-turn activity summary and add only missing normalized records.

Live-stream loss/disconnect is not a Run failure. Terminal `session.get`/outcome/`session.context` remains provider-completion authority.

### 9. Causal provider admission diagnostics

A provider can succeed at OpenCode transport/execution yet return a semantically invalid STAGE batch. That distinction becomes explicit evidence.

The core validator exposes a stable `StageProviderBatchRejectionCode` decision for the closed grammar. On rejection the daemon records one bounded Order-owned diagnostic evidence JSON containing:

- fixed phase `ORDER_STAGE_BATCH_ADMISSION`;
- stable rejection code;
- ordered event-tag names only, capped at 32;
- `truncated` boolean.

It contains no event payload bodies or raw assistant text.

The Run then fails through the existing provider-failure path with:

- the ordinary provider diagnostic evidence, which may truthfully say provider outcome `SUCCEEDED`;
- the Order-admission diagnostic evidence, which explains why the successful provider result was rejected.

None of the rejected semantic payloads are persisted as current workflow effects.

The product-facing failure remains: **Agent result could not be accepted** with Retry when canonically allowed. Exact rejection code/tag sequence is Technical/evidence detail.

## Decisions/rationale/alternatives

### D-01 — Preserve the state kernel

**Decision:** extend pure lifecycle derivations and the canonical RunEvent union only where necessary.

**Rejected:** a `WorkflowState`, document-status table, proposal-status column, browser workflow store or view-model aggregate.

**Rationale:** Phase 1 proved the orthogonal canonical facts are sufficient; the defects are projection/admission inconsistencies.

### D-02 — One task-scoped manual execution command

**Decision:** add exact WorkItem/task start command; retain global scheduler.

**Rejected:** passing task id to `/api/tick`, making scheduler state browser-owned, or creating a second execution queue.

**Rationale:** manual intent and automatic scheduling are different commands even though they converge on the same existing task/run mechanics.

### D-03 — Persist normalized activity as RunEvents

**Decision:** one bounded coordinator-owned activity event in the existing event carrier.

**Rejected:** browser-direct OpenCode SSE, separate telemetry database/API, raw tool-event persistence, or using provider event stream as correctness authority.

**Rationale:** RunEvent chronology already provides persistence, polling, restart/history and evidence locality. The activity event is observational and cannot affect workflow admission.

### D-04 — Best-effort live + reliable terminal reconciliation

**Decision:** use provider live events only for optional live detail and `session.context` for successful post-turn reconciliation.

**Rejected:** correctness dependence on the volatile global event stream or experimental durable session log.

**Rationale:** this gives useful live transparency without weakening the provider completion contract or requiring an OpenCode upgrade.

### D-05 — Dialogue is a distinct presentation plane

**Decision:** use Astryx Chat leaves inside `WorkbenchDialogue`; keep normalized activity and workflow events visually distinct.

**Rejected:** one generic `RunEventTimeline` as the entire conversation or raw provider console/tool-call UI.

**Rationale:** the accepted functional model requires a visible semantic response/reply context, not a status/event feed.

### D-06 — Repository drafts are material, not reach

**Decision:** project already-materialized current repository draft ArtifactRefs independent of Run history and remove ArtifactRef-only reach evidence.

**Rejected:** fake Runs, fake conformance, persisted maturity status or GET-side materialization.

**Rationale:** directly closes MAT-F01 while preserving portability and observational GETs.

### D-07 — Structured admission evidence rather than raw output

**Decision:** persist a stable rejection code + bounded tag sequence.

**Rejected:** raw assistant JSON, exception-string parsing, or “provider failed” with no causal distinction.

**Rationale:** enough for diagnosis/certification without retaining sensitive/unbounded provider material.

### D-08 — Reference-driven UI recomposition, no new visual system

**Decision:** the complete SVG pack defines the expected application composition; implementation uses the existing Workbench primitives and Astryx leaves.

**Rejected:** per-screen CSS/layout inventions, permanent pre-signoff sidebars, dashboard-card stacks, or another UI framework.

## Failure behavior

### Provider activity unavailable

The UI falls back to canonical Processing plus any Order-owned phase records. Provider completion semantics are unchanged. No fabricated activity is shown.

### Live provider event stream disconnects

The shell stops consuming live detail for that turn; it does not fail or restart the Run. Successful terminal `session.context` reconciliation may still supply the bounded post-turn summary.

### STAGE batch violates grammar

No batch member is persisted. The Run fails, provider + Order-admission diagnostic evidence is retained, the WorkItem stays on the same user-facing step, and Retry is offered only when canonical recovery admits it.

### Free-form turn has no agent message

The complete batch is rejected as `OPEN_REQUIRES_AGENT_MESSAGE`; the UI never reaches an OPEN composer state without a visible conversational anchor.

### Cancel while proposal pending/applying

The command returns current-state conflict without terminalizing the Run or changing proposal state. Browser suppresses the same invalid action from the same derivation.

### Manual task start races scheduler/another task

Final admission rejects the command if coordinator execution became active or another task became RUNNING. No alternate task is started.

### Repository file exists but no stage history exists

It is returned as a repository draft, shown read-only with Draft maturity, and does not affect workflow reach.

### Repository draft bytes changed without current persisted snapshot

The observational query does not materialize new state. Explicit reconciliation/direct Save is required before the new current snapshot appears.

### Activity cap reached

Further detailed activity is omitted for that turn; canonical processing/result state remains truthful.

## Preservation/downstream invariants

The implementation must preserve:

1. one canonical WorkItem lifecycle owner;
2. one canonical Run/RunEvent chronology;
3. conversation is human-facing interaction evidence, not authority by itself;
4. OpenCode activity is observational and cannot admit/complete/block/promote work;
5. browser never consumes OpenCode directly;
6. OpenCode completion remains `session.get` idle/outcome + successful `session.context`;
7. provider semantic output remains canonical RunEvent JSON validated before persistence;
8. proposal adoption intent remains durable before repository effect;
9. no unresolved proposal may be orphaned by Cancel;
10. direct Markdown Save remains canonical daemon-owned human mutation;
11. lifecycle artifact GET remains observational;
12. repository draft existence never proves lifecycle reach;
13. Git state is not conformance/readiness/maturity;
14. sign-off remains exact-package authorization;
15. manual and automatic execution converge on the same canonical `ExecutionTask`/Run mechanics;
16. only one ExecutionTask may be RUNNING globally under existing execution policy;
17. historical selection cannot retarget current action ownership;
18. hidden reasoning, secrets and raw unbounded provider material remain closed;
19. System/Light/Dark and responsive changes preserve semantic state;
20. no DTO/view-model/controller/service/repository class family is introduced.

## Validation obligations

Permanent proof must close the Phase 1 certification gaps and the complete changed producer→carrier→consumer path.

### V-01 STAGE producer/consumer agreement

Prove the productive STAGE producer contract contains and the consumer validator enforces the same matrix:

- empty batch rejected;
- duplicate required-input/block/completion rejected;
- multiple control types rejected;
- duplicate lifecycle proposal rejected;
- proposal + any control rejected;
- proposal with unresolved predecessor rejected;
- proposal role != Run stage rejected;
- completion/block owner != Run stage rejected;
- multiple final messages rejected;
- non-controlling turn with no final agent message rejected;
- valid open message-only batch accepted;
- valid message+proposal batch accepted;
- valid required-input/block/completion batches accepted.

No member of a rejected batch is persisted.

### V-02 Dialogue/reply context

Browser/e2e proof:

- OPEN composer exists only when a visible `AGENT_MESSAGE_FINAL` exists in selected-attempt conversation;
- REQUIRED_INPUT shows exact question and binds exact request id;
- human response appears in conversation order;
- proposal suppresses composer;
- activity and workflow events are visually/semantically separate from conversation;
- historical conversation cannot steal current action ownership.

### V-03 Proposal/cancel closure

Integrated daemon/core/browser proof:

- pending proposal suppresses and rejects Cancel;
- adoption-in-progress suppresses and rejects Cancel/Reject;
- Reject disposes proposal then ordinary Cancel may become eligible;
- no admitted terminalization path leaves an unresolved proposal.

### V-04 Manual execution scope

With multiple runnable WorkItems/tasks:

- exact task-scoped start creates a Run only for submitted canonical current task;
- stale/historical/non-current task id returns conflict and mutates nothing;
- a different globally eligible WorkItem cannot be started by this command;
- browser never calls `/api/tick` for task-local Start;
- automatic scheduler still selects globally eligible work through its existing path.

### V-05 Repository-draft portability

Prove fresh reconciliation with deterministic lifecycle Markdown and zero Runs:

- stores/reuses the draft ArtifactRef;
- lifecycle-artifact query returns current draft;
- reached history remains unchanged;
- Workbench shows Draft read-only at an unreached owner;
- no Run/conformance/completion is fabricated;
- when the owner is reached, normal edit eligibility applies;
- GET does not persist a new ArtifactRef.

### V-06 Material maturity

Table tests over canonical facts prove Draft, Updated — validation required, Current, Stale, Historical and Signed & locked labels and verify no persisted maturity field/table/HTTP property exists.

### V-07 Agent activity

Prove:

- only allowlisted provider events/tool parts create activity;
- unknown provider events are omitted;
- raw tool input/result/metadata/reasoning/secrets are never persisted;
- resource labels are safe normalized repository-relative values or null;
- per-turn cap is 32;
- duplicate/category-resource transitions are coalesced;
- live-stream loss does not change Run outcome;
- successful `session.context` reconciliation fills missing bounded summary;
- persisted activity remains inspectable with Run history after restart;
- `stageRunInteraction` ignores activity for PROCESSING/OPEN settlement;
- browser renders current/recent activity separately from conversation.

### V-08 Provider admission diagnostics

A provider-successful but batch-invalid STAGE turn must:

- persist provider diagnostic outcome `SUCCEEDED`;
- persist bounded Order admission evidence with stable rejection code/tag sequence;
- persist no rejected workflow effect;
- terminalize the attempt as Failed;
- show product-facing “Agent result could not be accepted”;
- expose exact admission evidence only through technical/evidence inspection.

### V-09 Information hierarchy/UI references

Permanent browser tests cover the repository visual-reference inventory:

- all Phase 1 `SURF-*` production services resolve through their canonical interaction class;
- no pre-signoff persistent second navigation axis;
- current attention remains above/reachable from historical material;
- technical ids/paths/hashes are absent from primary premium regions and present in Context/Technical detail where required;
- Readiness has no sign-off;
- Approval owns exact-package sign-off;
- Implementation alone owns persistent master/detail;
- Complete is result-first;
- Queue/Create/Settings/supporting services conform to the application-wide reference pack.

### V-10 Responsive/accessibility/theme continuity

At canonical wide/medium/narrow widths and Light/Dark:

- current step/task/action semantics are unchanged;
- Context/Implementation master recompose according to canonical architecture;
- focus returns from drawers/dialogs;
- required-input focus is stable and not repeatedly stolen by polling;
- current/selection/status is not color-only;
- keyboard paths reach dialogue, selectors, Review decisions and Implementation actions;
- switching theme or breakpoint does not discard dirty buffers or mutate workflow.

### V-11 Direct-authoring and active-agent exclusion

Integrated core/daemon/browser proof preserves the existing direct-authoring contract while closing STATE-F05:

- Work request title/body and editable lifecycle-document Save are unavailable in the browser while any WorkItem agent Run is active;
- the daemon independently rejects those same canonical mutations while a Run is active;
- required human input remains available only through the owning Dialogue/question interaction;
- after the active Run closes and no higher-priority condition blocks mutation, authorized direct Save works through the existing expected-hash boundary;
- successful direct Save remains canonical human mutation, creates no synthetic proposal, invalidates affected downstream conformance/currentness and reorients to the owning workflow step;
- execution/completed material remains read-only.

## Requirement/design traceability

| Requirement | Phase 2B realization | Permanent proof |
|---|---|---|
| WF-FR-001 TASK-FIRST-WORKFLOW | D-01 + D-08; existing Workbench interaction classes and application-wide reference pack | V-09 |
| WF-FR-002 CURRENT-ATTENTION-OWNERSHIP | existing pure current-attention/recovery derivations preserved; historical selection remains presentation-only | V-02, V-09 |
| WF-FR-003 INFORMATION-HIERARCHY | D-05 + D-08; structural conversation/activity/workflow separation and Technical/Context boundary | V-02, V-09 |
| WF-FR-004 MATERIAL-MATURITY-LANGUAGE | D-06 + pure MaterialPresentationState derivation | V-05, V-06 |
| WF-FR-005 BOUNDED-AGENT-ACTIVITY | D-03 + D-04; bounded coordinator-owned activity RunEvent over best-effort live + terminal reconciliation | V-07 |
| WF-FR-006 SERIAL-HUMAN-AGENT-DIALOGUE | existing StageRunInteraction + D-05; one active provider turn, explicit OPEN/REQUIRED_INPUT/CLOSED presentation | V-02 |
| WF-FR-007 PROPOSAL-ATTENTION-CLOSURE | proposal-aware Cancel admission + existing durable adoption-intent/disposition algebra | V-03 |
| WF-FR-008 DIRECT-AUTHORING | existing expected-hash direct Save/adoption boundaries preserved; no synthetic proposal | V-11 |
| WF-FR-009 PRESIGNOFF-GRAMMAR | D-05 + D-08; shared Dialogue/Review/Document/Evidence composition | V-02, V-09 |
| WF-FR-010 WORK-REQUEST-TASK | existing source owner/direct authoring + reference-pack Work request composition | V-09, V-11 |
| WF-FR-011 RESEARCH-TASK | shared pre-signoff composition + Dialogue/activity/evidence separation | V-02, V-07, V-09 |
| WF-FR-012 REQUIREMENTS-TASK | shared pre-signoff composition + current-stage document primacy | V-02, V-09 |
| WF-FR-013 SOLUTION-DESIGN-TASK | broad current-stage document composition + existing authority/context resolution | V-09 |
| WF-FR-014 IMPLEMENTATION-PLAN-TASK | Plan remains sole executable document authority; derived task inspection remains secondary | V-09 |
| WF-FR-015 READINESS-TASK | existing Review-class hierarchy; no sign-off; required input temporarily owns attention when legitimate | V-02, V-09 |
| WF-FR-016 APPROVAL-TASK | exact current SignoffPackage Review + explicit exact-package sign-off | V-09 |
| WF-FR-017 TASK-SCOPED-MANUAL-EXECUTION | D-02 exact WorkItem/task start command; global tick retained separately | V-04 |
| WF-FR-018 IMPLEMENTATION-TASK | existing operational master/detail + D-02 exact current owner/action | V-04, V-09 |
| WF-FR-019 TERMINAL-RESULT-TASK | existing Terminal-result class and reference-pack result-first hierarchy | V-09 |
| WF-FR-020 POST-ACTION-ORIENTATION | existing canonical mutation invalidation/refetch + current-attention/material resolver; no local authority inference | V-02, V-04, V-09, V-11 |
| WF-FR-021 RESPONSIVE-SEMANTIC-CONTINUITY | D-08; existing wide/medium/narrow Workbench recomposition | V-10 |
| WF-FR-022 ACCESSIBLE-INTERACTION-CONTINUITY | existing Workbench/Astryx accessibility ownership plus Dialogue/Review recomposition | V-10 |
| WF-FR-023 SUPPORTING-SERVICE-BOUNDARIES | D-08; Queue/Create/Settings/Context/Evidence remain their existing application services, never workflow owners | V-09 |
| WF-FR-024 NO-DUPLICATE-PRODUCT-STATE | D-01 + D-03 + D-06; only activity adds a genuinely missing durable observation | V-05, V-06, V-07 |
| WF-FR-025 LIFECYCLE-INFORMATION-MATURITY | existing context/authority resolution + D-06 draft projection; current stage receives only legitimate upstream material | V-05, V-09 |
| WF-FR-026 CURRENT-STAGE-DOCUMENT-PRIMACY | D-06 + D-08; current stage-owned material primary, upstream supporting, unreached drafts read-only | V-05, V-09 |
| WF-FR-027 REQUIREMENT-TO-SOLUTION-BOUNDARY | no state/transport change; existing lifecycle-context authority boundaries remain the technical gate | V-09 plus canonical stage-context/conformance tests |
| WF-FR-028 WORK-TYPE-AWARE-DOCUMENTATION | existing schema/template catalog and context resolution; reference pack preserves kind-specific context | V-09 |
| WF-FR-029 PROGRESSIVE-DOCUMENTATION | D-06; repository drafts visible without progression and later artifacts add only their owned semantic layer | V-05, V-09 |
| WF-FR-030 USER-FACING-WORKFLOW-LANGUAGE | D-08; internal stage/role ids stay Technical while Workbench presentation uses canonical user-facing labels | V-09 |
| WF-FR-031 TASK-AREA-CONTEXT-CLOSURE | D-08; current task output plus minimum supporting upstream information, no flat file browser | V-09 |
| WF-FR-032 ACTIVE-AGENT-AUTHORING-EXCLUSION | existing daemon no-active-Run mutation admission + browser command availability aligned | V-11 |
| WF-FR-033 REJECTED-AGENT-RESULT-SEMANTICS | D-07; bounded Order-admission evidence, atomic rejected batch, existing provider-failure recovery | V-01, V-08 |
| WF-FR-034 REPOSITORY-DRAFT-VISIBILITY | D-06; run-independent current lifecycle-artifact projection, ArtifactRef removed from reach proof | V-05 |
| WF-FR-035 DIALOGUE-REPLY-CONTEXT | D-05 + STAGE open-turn agent-message invariant + pinned Astryx Chat leaves | V-01, V-02 |

## Canonical amendments required by this design

The Phase 2B package amends these canonical owners:

- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` — reached-history/draft projection, proposal Cancel admission, task-scoped execution command, material maturity projection, Dialogue/activity composition and UI ownership;
- `GW-DOC-OPENCODE-INTEGRATION-V1` — best-effort live activity source, terminal context reconciliation and complete STAGE producer contract;
- `GW-DOC-EXECUTION-CONTROL-PLANE-V1` — automatic versus exact manual task admission over one atomic execution transition, and non-authoritative activity-stream use;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1` — narrow daemon/CLI tick versus Workbench exact-task command wording and observational event-stream allowance; the module dependency graph is unchanged;
- `GW-DOC-CANONICAL-CONTRACTS-V1` — activity event schema, batch/message grammar, admission diagnostics, exact manual-start HTTP command, observational draft projection and certification;
- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` — exact pinned Astryx v0.7.13 Chat leaf exports relied upon by the Workbench composition.

No theme-owner amendment or new dependency is required. If implementation proves an existing declared module boundary cannot realize this design, that is an upstream Solution-design issue and must return here rather than being solved by implementation discretion.
