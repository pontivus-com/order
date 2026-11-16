<!-- Order template: delivery-plan-v1; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V1 -->

# Order 0.5.0 integrated workflow task experience — implementation plan

**Status:** P7 implementation plan — ready for independent R3 readiness review  
**WorkItem:** work_2778105b-d919-4fcd-91e7-dd9b23812aac  
**Derived factual authority:** parent Audit work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2  
**Accepted functional authority:** requirements.md  
**Accepted technical authority:** solution-design.md plus the amended canonical P3/P4/P6 owners  
**Reviewed visual baseline:** docs/references/workbench-ui/README.md and its 41 SVG reference compositions/state sheets  
**Active delivery branch:** version/0.5.0

## 1. Purpose

This plan translates the closed Order 0.5.0 functional and technical design into one executable repository transition.

The implementation objective is not merely to make the new contracts compile or to make existing tests green. It is to deliver one coherent operator workflow whose runtime behavior, information hierarchy, interaction ownership, responsive composition and visual presentation conform to the accepted 0.5.0 design.

The implementation must therefore close two inseparable result classes:

1. semantic correctness:
   - workflow/state behavior;
   - STAGE producer/consumer agreement;
   - proposal ownership and cancellation;
   - exact task-scoped manual execution;
   - repository-draft visibility without fabricated progress;
   - material maturity projection;
   - bounded OpenCode/Order activity;
   - causal admission diagnostics;
   - direct-authoring exclusion while an agent owns the WorkItem;

2. user-experience correctness:
   - the task-first information hierarchy;
   - the separation of conversation, agent activity and workflow/system events;
   - exact primary-action ownership;
   - stable Workbench geometry;
   - correct Review, Dialogue, Document, Evidence, Approval, Implementation and Terminal-result compositions;
   - responsive semantic continuity;
   - theme/accessibility parity;
   - strict conformance to the reviewed visual reference pack.

A mechanically correct implementation that materially deviates from the reviewed UI references is incomplete.

## 2. Execution model

### 2.1 One signed task, ordered internal phases

The entire change is represented by one signed ExecutionTask.

This is required by the canonical execution model: every ExecutionTask starts from Approval.baselineCommit and dependency candidate bytes are not promoted into later task baselines. The 0.5.0 change is cumulative across core contracts, daemon/provider behavior and UI composition; splitting those layers into dependent signed tasks would make later tasks unable to consume earlier candidate bytes.

The single task therefore contains nine mandatory implementation phases with hard checkpoints.

A phase checkpoint is not advisory. The worker must not continue into the next phase while the current checkpoint has an unresolved failure or unexplained visual deviation.

### 2.2 Single active version branch

This version uses version/0.5.0 as the single active development branch.

This plan contains no branch-per-phase, PR-per-phase or merge choreography. Checkpointing is achieved through deterministic tests, runtime evidence and reference comparison, not branch proliferation.

### 2.3 No design discretion during implementation

Phase 2B already records that no material technical choice is delegated to implementation.

The worker may perform local implementation choices only where those choices are mechanically equivalent under the accepted owners. It may not:

- invent another workflow/document state;
- add a DTO/view-model family;
- add a browser workflow store;
- add another queue/scheduler;
- weaken the STAGE result grammar;
- create a late translation/reconstruction layer for canonical state;
- expose provider-native/raw tool records;
- introduce a new visual system;
- replace the reference compositions with a preferred interpretation;
- modify canonical authority or the visual reference pack to make candidate code appear conformant.

If an implementation step proves that the accepted design cannot be realized through the declared owners/change surface, stop and return to DESIGN. Do not solve that contradiction locally.

## 3. Frozen acceptance package

Implementation consumes, without reinterpretation:

- work-request.md;
- parent Audit research and supporting application/state/OpenCode/material/certification audits;
- this WorkItem research.md;
- requirements.md;
- solution-design.md;
- GW-DOC-WORKBENCH-UX-V2;
- GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2;
- GW-DOC-WORKBENCH-THEME-V1;
- GW-DOC-OPENCODE-INTEGRATION-V1;
- GW-DOC-EXECUTION-CONTROL-PLANE-V1;
- GW-DOC-TECHNICAL-ARCHITECTURE-V1;
- GW-DOC-CANONICAL-CONTRACTS-V1;
- GW-DOC-EXTERNAL-FACTS-V1-2026-11-12;
- docs/references/workbench-ui/README.md and all 41 reviewed SVG references.

The SVG pack is derived visual authority rather than semantic authority. During implementation it is nevertheless the accepted presentation/hierarchy/composition baseline. If an SVG conflicts with P3/P4/P6, implementation stops and returns upstream so the package can be corrected coherently; implementation does not silently choose one.

## 4. Visual-conformance law

### 4.1 Reference comparison is a release gate

For every reference assigned to a UI phase, implementation must produce the corresponding runtime state using the real SPA/e2e path and compare it against the reviewed SVG.

Each comparison records:

- reference filename;
- runtime scenario/fixture;
- viewport class and exact viewport size;
- theme;
- actual runtime screenshot;
- structural result;
- interaction/action result;
- hierarchy result;
- visual result;
- any variance and its classification;
- final PASS/FAIL.

Checkpoint screenshots are verification evidence. They are not new product authority and do not need to be committed into the repository.

### 4.2 Canonical comparison viewports

Use the existing Workbench responsive classes and representative browser sizes already used by the current browser suite:

- wide: 1600 x 900;
- medium: 1000 x 800;
- narrow: 700 x 800.

The semantic breakpoint authority remains:

- wide >= 1280 px;
- medium 800..1279 px;
- narrow < 800 px.

A reference that represents responsive behavior must be exercised at all applicable classes.

### 4.3 Zero-deviation dimensions

The following are not discretionary and do not permit visual drift:

- persistent topology/column model;
- WorkItem identity and workflow-rail placement;
- current-attention ownership;
- presence/absence and priority of primary actions;
- interaction class: Dialogue, Review, Document, Evidence, TaskPanel, MasterDetail, Context, confirmation;
- conversation versus activity versus workflow/system separation;
- technical identifiers/paths/hashes being secondary rather than primary;
- Readiness having no sign-off;
- Approval owning sign-off;
- Implementation being the only persistent workflow master/detail;
- Complete being result-first;
- responsive recomposition;
- Light/Dark semantic roles;
- status meaning and non-color state communication;
- use of the canonical Workbench primitive/Astryx substrate;
- removal of extra persistent navigation axes or count-driven sidebars.

Any difference in these dimensions is a failed checkpoint.

### 4.4 Permitted rendering variance

Minimal variance is permitted only for:

- browser/font rasterization and anti-aliasing;
- native scrollbar rendering;
- legitimate runtime values replacing a canonical field/template label used by the schematic reference;
- text wrapping caused by real repository-backed content, provided the canonical hierarchy, measure, spacing roles and interaction geometry remain intact.

Aesthetic preference is not an allowed variance.

Any other visible variance must be corrected before checkpoint closure or explicitly returned upstream as a design/reference contradiction.

### 4.5 No deferred visual debt

UI defects discovered at C3, C4, C5 or C6 are fixed in that phase.

They may not be logged for a final polish pass unless the defect is provably on a surface not owned by the current phase.

The final C7 comparison is a completeness audit, not the first time visual quality is evaluated.

## 5. Expected change surface

### 5.1 Mandatory semantic owners

Expected direct semantic edits:

- src/core/contracts.ts
- src/core/lifecycle.ts
- src/daemon/run.ts
- src/daemon/stage.ts
- src/daemon/authority.ts
- src/daemon/work-item-source.ts
- src/daemon/execution.ts
- src/daemon/coordinator.ts
- src/daemon/server.ts
- src/shell/opencode.ts
- ui/src/http.ts
- ui/src/workbench-presentation.ts

src/core/execution.ts is authorized only if the exact current-task start admission can reuse/refine the existing execution eligibility owner more cleanly there; it must not become a second lifecycle owner.

### 5.2 UI composition owners

The task authorizes the current production renderer set because every application surface is part of the reviewed visual baseline. The worker changes only files that require correction; authorization is not a requirement to churn already-conformant files.

The expected high-change files are:

- ui/src/WorkItemWorkspace.tsx
- ui/src/PreSignoffStageWorkspace.tsx
- ui/src/ActivityWorkspace.tsx
- ui/src/ActivityComposer.tsx
- ui/src/RunEventTimeline.tsx
- ui/src/DocumentWorkspace.tsx
- ui/src/ProposalReview.tsx
- ui/src/ExecutionWorkspace.tsx
- ui/src/primitives/WorkbenchDialogue.tsx
- ui/src/theme.css

The remaining renderer/primitive files in the signed changeSurface are visual-conformance contingency only: change them only when a reference mismatch proves the existing shared owner is the source of the defect.

### 5.3 Verification owners

Permanent proof lands only in existing verification owners:

- tests/core.test.ts
- tests/daemon.test.ts
- tests/opencode.test.ts
- tests/workbench-presentation.test.ts
- tests/certification.test.ts
- tests/browser.spec.ts
- tests/e2e-server.ts

tests/architecture.test.ts is signed verification material and is explicitly excluded from candidate mutation. Existing architecture verification must pass unchanged. New Workbench-specific architecture/certification assertions belong in tests/certification.test.ts as already required by the canonical Workbench architecture.

No new dependency, package pin, database migration, persistent state table, transport model family or test framework is authorized.

## 6. Phase/checkpoint summary

| Phase | Purpose | Hard checkpoint |
|---|---|---|
| P0 | freeze baseline, fixtures and comparison matrix | C0 baseline health/evidence |
| P1 | core contracts and pure workflow semantics | C1 semantic-kernel closure |
| P2 | daemon/OpenCode/control-plane realization | C2 producer→carrier→consumer closure |
| P3 | shared Workbench interaction foundation | C3 foundation visual conformance |
| P4 | Work request through Readiness | C4 pre-signoff visual conformance |
| P5 | Approval, Implementation and Complete | C5 post-signoff visual conformance |
| P6 | Queue/Create/Settings/Context/Evidence/application services | C6 application-surface visual conformance |
| P7 | application-wide integration, deletion and permanent certification | C7 complete 41-reference conformance |
| P8 | full gate union and independent candidate review | C8 candidate-ready |

No phase may be marked complete while its checkpoint is FAIL.

## 7. Phase P0 — baseline freeze and conformance harness

### Objective

Establish a reproducible before-state and the exact comparison/evidence mechanism before changing production behavior.

### Work

1. Record the exact implementation baseline commit used by the execution Run.
2. Run the complete current gate union before mutation:
   - dependency-lock;
   - typecheck;
   - architecture;
   - test;
   - build;
   - browser.
3. Reuse the existing browser/e2e runtime and fixtures. Do not create a parallel demo application.
4. Add/prepare deterministic fixture coverage in tests/e2e-server.ts only where a reviewed reference state cannot currently be produced.
5. Build a reference-conformance manifest inside tests/browser.spec.ts/test structure that maps every 0.5.0 reference file to:
   - scenario;
   - expected state;
   - viewport/theme requirements;
   - checkpoint owner.
6. Capture baseline runtime screenshots for the same comparison states where practical so the implementation review can distinguish inherited defects from new regressions.
7. Prove no reference SVG or canonical document is in the signed candidate change surface.

### C0 — baseline checkpoint

PASS requires:

- all six baseline gates pass before candidate changes;
- all 41 references have a runtime scenario owner;
- no reference is left as “visual only / cannot test” without a named reason;
- wide/medium/narrow fixtures use the canonical responsive classes;
- Light/Dark/System test setup is available;
- baseline screenshots/evidence are retained for later comparison.

If baseline gates fail for an unrelated pre-existing reason, stop and classify that failure before implementation. Do not build 0.5.0 on an unknown baseline.

## 8. Phase P1 — core contracts and pure workflow semantics

### Objective

Make the core types and pure state algebra exactly express the accepted 0.5.0 behavior before effectful code or UI consumes it.

### Work

#### P1.1 RunEvent and diagnostic contracts

In src/core/contracts.ts:

- add the closed AgentActivityCategory union;
- add coordinator-owned AGENT_ACTIVITY_RECORDED with bounded summary/resource fields;
- ensure provider-emittable STAGE events cannot emit coordinator-owned activity;
- add the bounded StageProviderBatchAdmissionDiagnostic/rejection representation required by P6;
- preserve strict Zod parsing and unknown-key rejection;
- introduce no raw provider payload carrier.

#### P1.2 STAGE batch grammar

In src/core/lifecycle.ts:

- update validateStageProviderTurn so:
  - at most one AGENT_MESSAGE_FINAL exists;
  - every non-controlling turn has exactly one non-blank final agent message;
  - message + proposal is valid;
  - proposal + controlling event is invalid;
  - required-input question is its own conversational anchor;
  - blocked/completed turns do not require a message;
  - OBSERVATION_RECORDED/activity never satisfy reply-anchor rules;
  - rejected batches remain atomic.
- expose a stable rejection classification used by daemon diagnostic evidence.
- ensure stageRunInteraction ignores activity/diagnostic records for PROCESSING/OPEN settlement.

#### P1.3 Proposal-aware cancellation

Add/reuse one browser-safe pure cancellation-admission predicate:

active STAGE Run
+ PROCESSING/OPEN/REQUIRED_INPUT
+ proposal decision NONE
= cancellable.

PENDING or ADOPTION_IN_PROGRESS must reject Cancel.

The UI and daemon will consume this same owner.

#### P1.4 Reached history and repository drafts

Correct deriveReachedStages so ArtifactRef existence is not reach evidence.

Reach remains derived only from canonical lifecycle/run/completion/signoff/execution/complete evidence defined by P4.

#### P1.5 Material presentation state

Add/refine the pure MaterialPresentationState derivation for:

- Draft;
- Updated — validation required;
- Current;
- Stale;
- Historical;
- Signed & locked.

Do not persist or transport the result.

#### P1.6 Exact execution-owner semantics

Preserve deriveExecutionOwner as the source for the exact current task. If src/core/execution.ts requires a narrow eligibility helper for exact manual start, reuse the existing execution task eligibility semantics rather than duplicating them.

### Permanent tests added in this phase

tests/core.test.ts and tests/workbench-presentation.test.ts must cover:

- complete V-01 STAGE matrix;
- activity ignored by stage settlement;
- proposal-aware cancellation positive/negative cases;
- reached history without ArtifactRef evidence;
- material maturity table;
- exact execution-owner/current-task cases;
- no new persisted/transport maturity/workflow-state representation.

### C1 — semantic-kernel checkpoint

PASS requires:

- typecheck;
- unchanged architecture test;
- targeted core/workbench-presentation tests;
- every new union variant exhaustively covered;
- invalid/contradictory histories fail closed;
- no UI implementation contains duplicate versions of the new rules.

P2 does not begin with a red C1.

## 9. Phase P2 — daemon, OpenCode and control-plane realization

### Objective

Close every changed producer→carrier→consumer path before UI composition depends on it.

### Work

#### P2.1 Shared activity recorder

In src/daemon/run.ts:

- create one per-provider-turn activity recorder;
- append through the existing RunEvent owner;
- apply dedupe/category-resource transition policy;
- cap at 32 records per productive turn;
- persist no raw tool input/output/metadata/reasoning/secrets/provider protocol ids;
- keep activity ordinary Run history across restart.

Use the same recorder for STAGE and post-signoff execution.

#### P2.2 OpenCode live activity and terminal reconciliation

In src/shell/opencode.ts:

- accept the typed activity callback as an imperative effect sink;
- whitelist/classify/redact only known safe provider events/tool parts;
- retain a safe repository-relative resource or null;
- omit unknown events instead of guessing;
- consume live provider events only best-effort;
- reconcile missing bounded activity from successful terminal session.context;
- keep session.get + terminal session.context as completion authority;
- preserve current pin 2.2.6 and existing admission/session model.

Live stream loss must never alter Run correctness/retry/lifecycle behavior.

#### P2.3 STAGE producer/consumer alignment

In src/daemon/stage.ts and the existing provider-output contract owner:

- remove duplicate generic STAGE output wording from stagePrompt;
- make providerOutputContract("STAGE") the single complete producer grammar;
- pass the shared activity recorder through the provider turn;
- validate the entire returned batch before persisting any semantic event;
- on invalid batch:
  - persist ordinary provider diagnostic truthfully;
  - persist bounded ORDER_STAGE_BATCH_ADMISSION evidence;
  - persist no rejected effect;
  - fail through the existing provider-failure reaction;
  - preserve retry policy.

#### P2.4 Proposal Cancel daemon admission

In coordinator/stage command handling:

- recompute proposal decision from current persisted RunEvents at command commit;
- reject Cancel for PENDING/ADOPTION_IN_PROGRESS;
- do not terminalize the Run;
- allow Reject then ordinary Cancel only after the proposal is actually disposed.

#### P2.5 Current lifecycle-artifact projection

In work-item-source/authority:

- keep reconciliation/direct Save/adoption as the mutation boundaries that materialize ArtifactRefs;
- make currentLifecycleArtifacts a read-only projection independent of Run history;
- validate current bytes against persisted snapshots;
- return deterministic repository drafts without fabricating reach/conformance;
- ensure GET performs no persistence.

#### P2.6 Exact manual task start

In execution/coordinator/server:

add:

POST /api/work-items/:workItemId/tasks/:executionTaskId/start

with the exact final-boundary admission defined by solution-design.md.

The command:

- accepts exactly the submitted current task;
- cannot select another globally eligible task;
- atomically creates that BUILDER Run and marks the same task RUNNING;
- returns the canonical Run immediately;
- enters the existing coordinator execution loop asynchronously;
- retains the global scheduler/tick path separately.

In ui/src/http.ts add the exact task-start client and stop using browser /api/tick for task-local Start.

#### P2.7 Direct authoring exclusion

Preserve and close the existing rule that any active WorkItem agent Run blocks source/title/lifecycle-document mutation while required human input remains available only through its owning Dialogue interaction.

### Permanent tests added in this phase

tests/daemon.test.ts, tests/opencode.test.ts and tests/e2e-server.ts must close V-03, V-04, V-05, V-07, V-08 and the daemon side of V-11.

Include adversarial cases:

- provider success + invalid Order batch;
- live activity stream disconnect;
- unknown provider event;
- cap overflow;
- stale manual task id;
- two runnable WorkItems;
- manual start versus global tick race;
- pending proposal Cancel;
- adoption-in-progress Cancel/Reject;
- no-Run repository draft;
- GET-side read purity;
- active-agent direct Save/title mutation.

### C2 — producer→carrier→consumer checkpoint

PASS requires:

- C1 still green;
- targeted daemon/OpenCode tests green;
- provider output and core grammar agree exactly;
- a rejected batch persists no partial semantic effect;
- activity is bounded and observational;
- exact manual task start cannot start another WorkItem;
- draft projection is read-only;
- no new scheduler, database table, DTO family or provider-state authority exists.

UI behavioral work does not begin while C2 is red.

## 10. Phase P3 — shared Workbench interaction foundation

### Objective

Create the stable UI substrate on top of the now-correct semantic paths before filling every workflow screen.

### Work

#### P3.1 Conversation/activity/workflow partition

In workbench-presentation and ActivityWorkspace:

partition one ordered RunEvent chronology into:

1. Conversation:
   - AGENT_MESSAGE_FINAL;
   - HUMAN_INPUT_REQUESTED;
   - HUMAN_INPUT_RECEIVED.

2. Agent activity:
   - AGENT_ACTIVITY_RECORDED.

3. Workflow/system:
   - proposal;
   - conformance;
   - block/completion;
   - failure/diagnostics;
   - evidence;
   - other canonical workflow events.

Do not create another message/activity store.

#### P3.2 WorkbenchDialogue

Refine WorkbenchDialogue so it owns stable Dialogue geometry:

- transcript;
- optional state/notice;
- anchored composer;
- fixed supporting-activity region on wide layouts;
- medium/narrow subordinate activity representation without creating navigation/drawer topology.

Use the pinned Astryx ChatLayout/ChatMessage/ChatMessageMetadata/ChatComposer leaves only inside WorkbenchDialogue.

Do not use ChatToolCalls for provider-native records.

#### P3.3 Reply-context law

ActivityComposer appears only when:

- the selected attempt is the current owner;
- the core interaction admits input;
- no higher-priority proposal/conflict/convergence condition owns attention;
- OPEN has a visible AGENT_MESSAGE_FINAL;
- REQUIRED_INPUT displays and binds the exact question/request id.

Historical conversation remains visible but cannot own the current composer.

#### P3.4 Timeline/system separation

RunEventTimeline renders workflow/system material rather than masquerading the entire event stream as conversation.

Agent activity gets its own supporting presentation.

Technical provider/session identity remains in Technical detail/Context, not the primary conversation plane.

#### P3.5 Shared visual hygiene

Use the current canonical Workbench primitives/theme. Do not introduce feature-local spacing/type/color/layout systems.

Only alter an additional primitive from the contingency change surface when the mismatch is shared and the primitive is the canonical owner.

### C3 reference set

The following references must pass before P4:

- workitem-shell-controls.svg
- current-attention-states.svg
- dialogue-states.svg
- document-states.svg
- proposal-states.svg
- responsive-composition.svg
- theme-parity.svg
- safety-confirmations.svg

### C3 — foundation visual checkpoint

For every C3 reference:

- render the corresponding real state;
- capture wide/medium/narrow where applicable;
- capture Light/Dark where applicable;
- compare against the SVG;
- record PASS/FAIL.

PASS additionally requires:

- no second persistent pre-signoff navigation axis;
- composer geometry remains stable across OPEN/REQUIRED_INPUT/historical states;
- activity cannot visually replace conversation;
- technical detail is subordinate;
- action hierarchy is unchanged across breakpoints;
- no color-only status;
- keyboard/focus behavior remains canonical.

Any unexplained visual difference blocks P4.

## 11. Phase P4 — Work request through Readiness

### Objective

Implement the complete pre-signoff task experience on the shared foundation.

### Work

#### P4.1 Work request

Ensure:

- source narrative is primary;
- source/title Save obeys active-agent exclusion;
- project/work-type/Git/technical identity is secondary;
- Start Research remains the explicit progression action;
- source Save does not itself start Research.

#### P4.2 Research / Requirements / Solution design / Implementation plan

For each step:

- current stage task purpose is immediately legible;
- current stage document and current dialogue are the primary materials;
- upstream documents are subordinate supporting context;
- selector is subordinate material selection, not a second workflow axis;
- current attention beats historical selection;
- repository drafts on unreached steps are visible as read-only Draft without fabricated reach;
- direct editable current-stage material follows the existing expected-hash mutation contract;
- activity, conversation and workflow events remain separated.

#### P4.3 Proposal review

Proposal review must:

- use Review composition;
- show target/rationale/diff without leaking unnecessary technical identity into the premium region;
- make Adopt/Reject exact current decisions;
- show adoption-in-progress distinctly;
- suppress incompatible Cancel/Reject actions according to the core rule.

#### P4.4 Readiness

Readiness is an independent Review surface:

- verdict/findings/package judgment are primary;
- legitimate required input may temporarily own attention;
- no sign-off action exists;
- no generic pre-signoff side-index dominates the review.

#### P4.5 Work-type progression

Change, Defect, Investigation and Audit retain their accepted kind-specific information obligations; shared delivery screens must not flatten the upstream semantics.

### C4 reference set

- work-request.svg
- research.svg
- requirements.svg
- solution-design.svg
- implementation-plan.svg
- readiness-review.svg
- document-authoring.svg
- document-readonly.svg
- proposal-review.svg
- evidence-viewer.svg
- work-type-variants.svg
- dialogue-states.svg
- proposal-states.svg
- document-states.svg

### C4 — pre-signoff visual checkpoint

PASS requires:

- all C4 references PASS side-by-side comparison;
- zero primary raw ids/paths/hashes where reference/authority makes them secondary;
- no Readiness sign-off;
- correct Dialogue/Document/Review hierarchy;
- no content-count-driven persistent sidebar;
- Draft/Updated/Current/Stale/Historical/Signed & locked presentation matches canonical facts;
- dirty/conflict/confirmation states preserve the same task geometry;
- wide/medium/narrow meaning and action priority are identical.

P5 does not begin with an unresolved C4 deviation.

## 12. Phase P5 — Approval, Implementation and Complete

### Objective

Close the post-signoff operator experience and exact manual execution semantics.

### Work

#### P5.1 Approval

Approval must:

- present the exact current package as a Review;
- keep package hashes/ids/paths Technical/on-demand;
- show task meaning/scope/gates in judgment order;
- make explicit exact-package sign-off the primary Approval action;
- preserve stale-package behavior and recovery ownership.

#### P5.2 Implementation

Implementation must:

- remain the only persistent workflow MasterDetail composition;
- show current execution owner/task as primary;
- keep historical task/attempt selection read-only;
- use Start current task for the exact canonical current TODO task;
- never call browser /api/tick for the task-local action;
- show active role, blocker/recovery and validation boundary without changing task ownership;
- preserve signed plan/design/requirements as read-only authority;
- keep agent activity, workflow events and technical evidence distinct.

#### P5.3 Complete

Complete must be result-first:

- substantive terminal result first;
- evidence/history secondary;
- linked remediation option only where the canonical Investigation/Audit terminal branch permits it;
- no fabricated deployment/production claim.

### C5 reference set

- approval.svg
- approval-task-detail.svg
- implementation.svg
- implementation-states.svg
- complete.svg
- complete-linked-remediation.svg

### C5 — post-signoff visual checkpoint

PASS requires:

- all C5 references PASS;
- Approval has one explicit sign-off owner;
- Implementation master width/topology is stable across task/attempt states;
- historical selection cannot redirect Start current task;
- execution status/recovery is semantically and visually unambiguous;
- Complete is result-first at all responsive classes;
- no technical data leaks into primary premium regions.

## 13. Phase P6 — application/supporting services

### Objective

Ensure the surrounding product does not remain visually or interactionally inconsistent after the workflow correction.

This phase is conformance work, not a redesign of already-correct services.

### Work

Audit the current runtime against the application/service references and change only mismatching canonical owners.

Surfaces:

- application toolbar/notices;
- Queue;
- Create WorkItem;
- linked-remediation creation;
- repository settings;
- repository add/move;
- OpenCode settings/account add/rename/login states;
- model/runtime settings;
- installation readiness;
- WorkItem Context;
- Evidence;
- shell controls/theme utilities.

Preserve the accepted app/service boundaries: these surfaces support workflow operation but do not become workflow authority.

### C6 reference set

- queue.svg
- queue-states.svg
- create-work-item.svg
- create-linked-remediation.svg
- settings-repositories.svg
- settings-repository-add.svg
- settings-repository-move.svg
- settings-opencode.svg
- settings-opencode-add.svg
- settings-opencode-rename.svg
- settings-opencode-login.svg
- settings-opencode-login-states.svg
- settings-model.svg
- installation-readiness.svg
- application-notices-states.svg
- workitem-context.svg
- evidence-viewer.svg
- theme-parity.svg

### C6 — application-surface visual checkpoint

PASS requires:

- all C6 references PASS;
- one coherent visual language across application and workflow surfaces;
- no bespoke feature-local button/form/status/table grammar where a canonical primitive owns it;
- compact/narrow toolbar utilities do not create competing rows or displace current task identity;
- settings/account/repository surfaces preserve the same field/notice/confirmation language;
- Light/Dark/System retains semantic parity.

## 14. Phase P7 — application-wide integration, deletion and permanent certification

### Objective

Prove the integrated product and remove superseded behavior rather than leaving parallel implementations.

### Work

#### P7.1 Permanent V-01..V-11 proof

Close every validation obligation in solution-design.md:

- V-01 STAGE producer/consumer agreement;
- V-02 Dialogue/reply context;
- V-03 Proposal/cancel closure;
- V-04 Manual execution scope;
- V-05 Repository-draft portability;
- V-06 Material maturity;
- V-07 Agent activity;
- V-08 Provider admission diagnostics;
- V-09 Information hierarchy/reference coverage;
- V-10 responsive/accessibility/theme continuity;
- V-11 direct-authoring/active-agent exclusion.

#### P7.2 Architecture/certification sensors

In tests/certification.test.ts, prove at minimum:

- no DTO/view-model/workflow-store family;
- no second workflow/proposal/material/current-attention classifier;
- no state-mutating GET;
- no ArtifactRef-as-reach algorithm;
- no browser /api/tick task-start path;
- every production TSX renderer remains classified under the canonical Workbench grammar;
- feature renderers cannot bypass structural primitive ownership;
- primitives remain domain/query/policy blind;
- no private Astryx internals;
- no obsolete competing Workbench layout/interaction selectors;
- no direct provider-native tool record rendering.

Do not alter tests/architecture.test.ts.

#### P7.3 Deletion obligations

Delete superseded paths rather than hiding them:

- UI-only Cancel eligibility that disagrees with the core rule;
- task-local browser tick usage;
- ArtifactRef reach inference;
- event-feed-as-conversation presentation;
- prominent primary OpenCode session block;
- duplicate STAGE output grammar;
- obsolete side-index/count-driven pre-signoff composition if any remains;
- duplicate/unused CSS selectors introduced by the superseded composition;
- any local state/derivation now replaced by the canonical owner.

#### P7.4 Final 41-reference comparison

Run the complete reference inventory, not only the phase subsets.

For each of the 41 SVGs record:

MATCH
or
ALLOWED_RENDERING_VARIANCE with exact reason.

Any other status is FAIL.

No “close enough” category exists for structural, hierarchy, interaction or semantic deviations.

### C7 — complete visual/certification checkpoint

PASS requires:

- all 41 references accounted for;
- zero unexplained deviations;
- all V-01..V-11 permanent tests green;
- all architecture/certification negative checks green;
- no obsolete parallel behavior remains;
- visual reviewer can compare actual runtime evidence to every reference without inferring what was intended.

## 15. Phase P8 — full gates and candidate closeout

### Objective

Establish the exact verified candidate for independent review.

### Required full gates

Run the manifest-owned commands exactly:

1. dependency-lock
   bun ci

2. typecheck
   bun run tsc --noEmit

3. architecture
   node node_modules/vitest/vitest.mjs run tests/architecture.test.ts

4. test
   node node_modules/vitest/vitest.mjs run

5. build
   node node_modules/vite/bin/vite.js build

6. browser
   node node_modules/@playwright/test/cli.js test

### Final semantic review

Independent reviewer must verify:

- implementation matches requirements.md and solution-design.md;
- every changed path is within the signed changeSurface;
- no unrelated refactor/bloat;
- no canonical owner was duplicated;
- provider activity remains observational;
- manual execution is exactly task-scoped;
- proposal/cancel dead state is impossible;
- repository drafts do not fabricate reach;
- material maturity remains derived;
- active-agent direct authoring is excluded;
- browser state never becomes workflow authority.

### Final visual review

Reviewer receives the C7 comparison evidence and independently samples/validates:

- all workflow steps;
- all materially distinct state sheets;
- all three responsive classes;
- both Light and Dark plus System behavior;
- Queue/Create/Settings/Context/Evidence;
- Approval/Implementation/Complete;
- dialogue/proposal/document states.

Any material visual drift returns the candidate to the owning UI phase. It is not accepted as cosmetic debt.

### C8 — candidate-ready checkpoint

CANDIDATE_DONE is permitted only when:

- C0 through C7 all passed;
- all six final gates passed;
- independent semantic review passed;
- independent visual/reference review passed;
- no unresolved deviation ledger item remains;
- no reference/canonical authority was edited by the implementation candidate;
- no out-of-scope file changed.

## 16. Reference ownership matrix

### Foundation/state references — C3

- workitem-shell-controls.svg
- current-attention-states.svg
- dialogue-states.svg
- document-states.svg
- proposal-states.svg
- responsive-composition.svg
- theme-parity.svg
- safety-confirmations.svg

### Pre-signoff references — C4

- work-request.svg
- research.svg
- requirements.svg
- solution-design.svg
- implementation-plan.svg
- readiness-review.svg
- document-authoring.svg
- document-readonly.svg
- proposal-review.svg
- evidence-viewer.svg
- work-type-variants.svg

### Post-signoff references — C5

- approval.svg
- approval-task-detail.svg
- implementation.svg
- implementation-states.svg
- complete.svg
- complete-linked-remediation.svg

### Application/supporting references — C6

- queue.svg
- queue-states.svg
- create-work-item.svg
- create-linked-remediation.svg
- settings-repositories.svg
- settings-repository-add.svg
- settings-repository-move.svg
- settings-opencode.svg
- settings-opencode-add.svg
- settings-opencode-rename.svg
- settings-opencode-login.svg
- settings-opencode-login-states.svg
- settings-model.svg
- installation-readiness.svg
- application-notices-states.svg
- workitem-context.svg

The overlap references evidence-viewer.svg and theme-parity.svg are intentionally exercised in more than one checkpoint context even though each is one reference file.

C7 repeats the entire 41-file inventory as the final completeness check.

## 17. Requirement/design traceability by phase

| Phase | Primary accepted obligations |
|---|---|
| P1 | WF-FR-004, WF-FR-007, WF-FR-017, WF-FR-024, WF-FR-033, WF-FR-034, WF-FR-035; TD-01, TD-02, TD-03, TD-06 |
| P2 | WF-FR-005, WF-FR-006, WF-FR-007, WF-FR-017, WF-FR-032, WF-FR-033, WF-FR-034; TD-01..TD-06 |
| P3 | WF-FR-001..003, WF-FR-005..009, WF-FR-020..024, WF-FR-030..031, WF-FR-035; TD-05, TD-07 |
| P4 | WF-FR-010..015, WF-FR-020..032, WF-FR-034..035; TD-06, TD-07 |
| P5 | WF-FR-016..020, WF-FR-023, WF-FR-030..033; TD-02, TD-07 |
| P6 | WF-FR-021..023, WF-FR-028, WF-FR-030..031; TD-07 |
| P7 | all WF-FR-001..035; TD-08; V-01..V-11 |
| P8 | complete signed-package acceptance |

This table is a plan trace; the accepted requirement/design documents remain the semantic owners.

## 18. Failure and return rules

Return to DESIGN immediately if:

- a new canonical state/field/contract is required beyond the accepted additions;
- another module responsibility is needed rather than a same-owner implementation;
- the pinned OpenCode public surface cannot realize the accepted activity design;
- a reviewed SVG materially conflicts with canonical P3/P4/P6;
- a new Workbench primitive responsibility is required;
- a new dependency/package is required;
- current architecture cannot realize the visual composition without changing its declared ownership.

Remain inside implementation/remediation when the failure is:

- code defect;
- missing test;
- CSS/composition defect within the canonical primitive system;
- reference mismatch caused by candidate code;
- incorrect provider-event whitelist/redaction implementation;
- incorrect command admission;
- ordinary mechanical gate failure;
- bounded reviewer finding within the signed scope.

Do not weaken a gate, delete a required test, modify the reference pack, or broaden the task to make a failure disappear.

## 19. Definition of done

The 0.5.0 implementation is complete only when all of the following are true:

- the changed semantic contracts work end to end;
- all 35 accepted WorkItem requirements are realized;
- all V-01..V-11 obligations are permanent tests;
- all 41 visual references have a runtime comparison result;
- no material reference deviation remains;
- no duplicated workflow/material/provider state owner exists;
- no unrelated architecture or dependency was introduced;
- all obsolete replaced behavior is deleted;
- all six final gates pass;
- independent semantic review passes;
- independent visual/reference review passes.

Green unit tests without the visual/reference checkpoint are not completion.

A visually attractive UI that violates canonical state/action ownership is also not completion.

Both must pass.

## 20. Canonical signed task block

This plan intentionally contains one signed task because the implementation is cumulative across one approval baseline.

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "P7-050-INTEGRATED-WORKFLOW-IMPLEMENTATION",
      "objective": "Implement the accepted Order 0.5.0 integrated workflow task experience end to end, including the closed workflow/state/OpenCode contracts and strict application-wide UI/UX conformance to the reviewed Workbench visual reference pack.",
      "dependsOn": [],
      "scope": [
        "src/core/**",
        "src/daemon/**",
        "src/shell/**",
        "ui/src/**",
        "tests/**"
      ],
      "exclusions": [
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-FR-214-STABLE-WORKBENCH-GEOMETRY",
        "GW-FR-215-STABLE-WORKFLOW-RAIL",
        "GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL",
        "GW-FR-217-PRIMARY-INFORMATION-ECONOMY",
        "GW-FR-218-SPACE-CLASS-CONSISTENCY",
        "GW-FR-219-EXPLICIT-CONTEXT",
        "GW-FR-220-PRESIGNOFF-CONTINUITY",
        "GW-FR-221-READINESS-REVIEW-HIERARCHY",
        "GW-FR-222-APPROVAL-REVIEW-HIERARCHY",
        "GW-FR-223-IMPLEMENTATION-MASTER-DETAIL",
        "GW-FR-224-TERMINAL-RESULT-PRIMACY",
        "GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY",
        "GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK",
        "GW-FR-227-CERTIFICATION-MATRIX",
        "GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE",
        "GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY",
        "GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR",
        "GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE",
        "GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE",
        "GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION",
        "GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION",
        "GW-FR-235-GLOBAL-THEME-PARITY",
        "GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION",
        "GW-FR-237-BOUNDED-AGENT-ACTIVITY",
        "GW-FR-238-PROPOSAL-CANCEL-CLOSURE",
        "GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION",
        "GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE",
        "GW-FR-241-DERIVED-MATERIAL-MATURITY",
        "GW-FR-242-DIALOGUE-REPLY-CONTEXT"
      ],
      "changeSurface": [
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/coordinator.ts",
        "src/daemon/execution.ts",
        "src/daemon/run.ts",
        "src/daemon/server.ts",
        "src/daemon/stage.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/opencode.ts",
        "ui/src/http.ts",
        "ui/src/workbench-presentation.ts",
        "ui/src/app.tsx",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/primitives/WorkbenchAction.tsx",
        "ui/src/primitives/WorkbenchAttention.tsx",
        "ui/src/primitives/WorkbenchConfirmation.tsx",
        "ui/src/primitives/WorkbenchContextPanel.tsx",
        "ui/src/primitives/WorkbenchDialogue.tsx",
        "ui/src/primitives/WorkbenchDisclosure.tsx",
        "ui/src/primitives/WorkbenchField.tsx",
        "ui/src/primitives/WorkbenchForm.tsx",
        "ui/src/primitives/WorkbenchIcon.tsx",
        "ui/src/primitives/WorkbenchIdentity.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchMasterDetail.tsx",
        "ui/src/primitives/WorkbenchNotice.tsx",
        "ui/src/primitives/WorkbenchRail.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/primitives/WorkbenchReview.tsx",
        "ui/src/primitives/WorkbenchSectionHeader.tsx",
        "ui/src/primitives/WorkbenchSelector.tsx",
        "ui/src/primitives/WorkbenchSettingsLayout.tsx",
        "ui/src/primitives/WorkbenchState.tsx",
        "ui/src/primitives/WorkbenchStatus.tsx",
        "ui/src/primitives/WorkbenchSurface.tsx",
        "ui/src/primitives/WorkbenchTable.tsx",
        "ui/src/primitives/WorkbenchTaskPanel.tsx",
        "ui/src/primitives/WorkbenchTimeline.tsx",
        "ui/src/primitives/WorkbenchToolbar.tsx",
        "ui/src/primitives/WorkbenchUtilityLink.tsx",
        "ui/src/theme.css",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/opencode.test.ts",
        "tests/workbench-presentation.test.ts",
        "tests/certification.test.ts",
        "tests/browser.spec.ts",
        "tests/e2e-server.ts"
      ],
      "gateIds": [
        "dependency-lock",
        "typecheck",
        "architecture",
        "test",
        "build",
        "browser"
      ],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-MINIMUM-CHANGE-V1",
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V1",
        "GW-DOC-EXTERNAL-FACTS-V1-2026-11-12"
      ],
      "concernIds": [
        "core",
        "shell",
        "daemon",
        "ui",
        "verification"
      ]
    }
  ]
}
```
