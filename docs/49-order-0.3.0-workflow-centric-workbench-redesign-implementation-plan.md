# 49 — Order 0.3.0 workflow-centric Workbench foundational redesign implementation plan

**Canonical concern ID:** GW-P7-ORDER-0.3.0-WORKFLOW-CENTRIC-WORKBENCH-REDESIGN  
**Versioned concern ID:** GW-P7-ORDER-0.3.0-WORKFLOW-CENTRIC-WORKBENCH-REDESIGN-V1-2026-11-14  
**Status:** Implementation-ready P7 plan  
**Target repository:** pontivus-com/order  
**Target public release:** 0.3.0  
**Pyramid layer:** P7 implementation plan  
**Investigated production-code baseline:** 448ce99763061ccfc24f15a6be7e3ce8095d8b5a
**P8 execution baseline:** current `master` after this P7 documentation PR is merged and approved; P8 must not branch from the historical investigated SHA  
**Prepared:** 2026-11-14  
**Purpose:** deliver the foundational Workbench interaction model for Order 0.3.0 by replacing the current WorkItem dual-navigation model with the canonical workflow-step workspace model defined by GW-DOC-WORKBENCH-UX-V1 §27 and GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1 §23, including complete per-step information placement, current-action continuity and removal of the generic Documents / Activity / Review / Evidence / Result destination hierarchy.

This document is execution authority only. It does not redefine lifecycle semantics, Markdown authority, Run contracts, sign-off rules or execution policy. Those remain owned by their canonical P1-P6 concerns.

## 1. Governing authority

### P1

The implementation inherits and must preserve:

- GW-P1-FCIS;
- GW-P1-SOC;
- GW-P1-DRY;
- GW-P1-STRICT-TYPING;
- GW-P1-CANONICAL-OWNERSHIP;
- GW-P1-EXPLICIT-FLOW;
- GW-P1-MINIMUM-CHANGE;
- GW-P1-DOC-CANONICALITY;
- GW-P1-AUTHORITY-BEFORE-INFERENCE.

### Functional authority

The task implements:

- GW-DOC-WORK-LIFECYCLE-V1;
- GW-DOC-LIFECYCLE-CONTEXT-V1;
- GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1;
- GW-DOC-MARKDOWN-WORKBENCH-V1;
- GW-DOC-WORKBENCH-UX-V1 §27;
- GW-FR-106-WORKFLOW-STEP-PRIMARY-NAVIGATION;
- GW-FR-107-STEP-LOCAL-MATERIAL-COMPOSITION;
- GW-FR-108-PRE-SIGNOFF-STAGE-WORKSPACE;
- GW-FR-109-PROPOSAL-EVIDENCE-CONTEXT-CONTINUITY;
- GW-FR-110-CURRENT-STAGE-ACTION-CONTINUITY;
- GW-FR-111-READINESS-REVIEW-WORKSPACE;
- GW-FR-112-APPROVAL-PACKAGE-WORKSPACE;
- GW-FR-113-IMPLEMENTATION-WORKSPACE-OWNERSHIP;
- GW-FR-114-COMPLETE-OUTCOME-WORKSPACE;
- GW-FR-115-RESPONSIVE-WORKFLOW-STEP-CONTINUITY;
- GW-FR-116-WORKFLOW-STEP-PANEL-CONTRACT;
- GW-FR-117-DETERMINISTIC-PRIMARY-MATERIAL;
- GW-FR-118-CANONICAL-RUN-FEEDBACK-COMPLETENESS;
- GW-FR-119-INTERACTION-RESULT-FEEDBACK;
- GW-FR-120-OPENCODE-FEEDBACK-BOUNDARY;
- GW-FR-121-PER-STEP-FUNCTIONAL-SCREEN-CONTRACT.

### Technical authority

The task implements:

- GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1 §23;
- GW-DOC-OPENCODE-INTEGRATION-V1 for the browser-visible Run/RunEvent observation boundary;
- GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1 for productive failure-origin semantics consumed by the Workbench;
- GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 for the already-pinned Astryx primitive/dependency facts;
- GW-TR-082-WORKFLOW-STEP-COMPOSITION-OWNER;
- GW-TR-083-PRE-SIGNOFF-STAGE-MATERIAL-ORCHESTRATION;
- GW-TR-084-STAGE-RUN-HISTORY-AND-COMPOSER;
- GW-TR-085-IN-CONTEXT-PROPOSAL-EVIDENCE-PROMOTION;
- GW-TR-086-CANONICAL-CURRENT-ACTION-PROJECTION;
- GW-TR-087-READINESS-APPROVAL-TECHNICAL-COMPOSITION;
- GW-TR-088-IMPLEMENTATION-RUN-OWNERSHIP;
- GW-TR-089-COMPLETE-OUTCOME-COMPOSITION;
- GW-TR-090-WORKFLOW-CENTRIC-BROWSER-CERTIFICATION;
- GW-TR-091-WORKFLOW-STEP-PANEL-COMPOSITION;
- GW-TR-092-DETERMINISTIC-STEP-MATERIAL-RESOLVER;
- GW-TR-093-EXHAUSTIVE-RUN-FEEDBACK-PROJECTION;
- GW-TR-094-LOCAL-MUTATION-FEEDBACK-ORCHESTRATION;
- GW-TR-095-OPENCODE-BROWSER-OBSERVATION-BOUNDARY;
- GW-TR-096-PER-STEP-PRIMITIVE-COMPOSITION;
- GW-TR-097-SHARED-WORKFLOW-UI-SEMANTIC-OWNERSHIP;
- existing CodeMirror, Context, responsive, evidence, RunEvent and Astryx integration requirements that remain unsuperseded.

No implementation step may create a second lifecycle, transport shape family, browser server-state owner, DTO/ViewModel family or new daemon policy to solve a presentation problem.

## 2. Baseline findings

The implementation defects and change forecast were investigated against merged 0.2.2 corrective state `448ce99763061ccfc24f15a6be7e3ce8095d8b5a`.

That SHA is **not** the P8 branch point. Under `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1`, the implementation branch must start from current `master` after this P7 documentation/authority PR has merged. Before implementation begins, the worker must prove that current `master` contains this exact P7 authority and that the production UI defects described below remain materially equivalent. If `master` has moved in a way that changes the required transition or makes the signed `changeSurface` insufficient, stop and return to PLAN rather than executing against the historical SHA.

The following current implementation structures are the defects this plan must change.

1. WorkItemWorkspace owns a generic WorkItemMode and derives visibleModes containing DOCUMENTS, ACTIVITY, REVIEW, EXECUTION, EVIDENCE and RESULT.
2. The browser renders a persistent workspace-view segmented control below the lifecycle workflow rail, forcing the operator to choose both workflow position and information class.
3. Workflow-step inspection first maps a lifecycle step into a generic mode before rendering the relevant material.
4. DocumentWorkspace separately exposes Work request / Research / Requirements / Solution design / Implementation plan / Readiness review, creating a third navigation layer after workflow + generic workspace mode.
5. ActivityWorkspace owns pre-signoff conversation/history globally rather than as material of the Research/Requirements/Design/Plan step that produced it.
6. Proposal review switches the WorkItem into generic REVIEW and requires Back to Activity to recover the conversation context.
7. Evidence selection switches to generic EVIDENCE and relies on returnMode to reconstruct the prior destination.
8. WorkItemWorkspace computes a valid canStart condition from current state but renders the Start action only when runs.length === 0. After Research completes and advances the WorkItem to Requirements, the historical Research Run therefore suppresses Start Requirements even though the daemon accepts the next stage.
9. Start, sign-off and linked-remediation actions are rendered in the WorkItem header even though their decisions belong to Work request/current stage, Approval and Complete respectively.
10. SignoffReview presents package material while approver input/sign-off mutation is visually detached in WorkItemWorkspace; governed-document inspection leaves Approval for Documents.
11. ExecutionWorkspace already owns tasks and post-signoff attempts but exposes Open in Activity for the same Run, duplicating one operational context across two destinations.
12. TerminalResult is exposed as another global mode rather than material owned by Complete.
13. The current browser certification asserts the superseded generic workspace-mode hierarchy and does not certify a complete Research → Requirements next-stage interaction.
14. Existing daemon lifecycle evaluation already advances R1 CONFIRMED → R2 ACTIVE, R2 → DESIGN, DESIGN → PLAN, PLAN → R3 and supports starting the current stage when no Run is active. No lifecycle redesign is required for this correction.

These findings define the transition. They do not authorize cleanup outside the governed Workbench surface.

## 3. Required end state

The implementation is complete only when all of the following are simultaneously true.

1. A selected WorkItem exposes one persistent workflow navigation axis: Work request → Research → Requirements → Solution design → Implementation plan → Readiness review → Approval → Implementation → Complete.
2. There is no persistent global Documents / Activity / Review / Implementation / Evidence / Result WorkItem selector.
3. WorkItem identity/header contains only object orientation and true WorkItem-level management/context actions.
4. Work request owns source Markdown, source blockers/Git state and Start Research.
5. Research owns R1 Run history/dialogue/composer, Research artifact, proposal review and evidence.
6. Requirements owns R2 Run history/dialogue/composer, Requirements artifact, proposal review and evidence.
7. Solution design owns DESIGN Run history/dialogue/composer, Design artifact, proposal review and evidence.
8. Implementation plan owns PLAN Run history/dialogue/composer, Plan artifact, proposal review, task/change-surface inspection and evidence.
9. Readiness review is review-oriented: R3 verdict/findings/package/evidence dominate; R3 remains read-only; Run history is supporting material unless active input is required.
10. Approval contains package currentness, signed tasks, supporting governed documents, approver input and exact sign-off action in one review context.
11. Implementation owns signed tasks plus BUILDER/REVIEWER/REMEDIATOR attempts, events, validation, candidate and evidence. Open in Activity is absent.
12. Complete owns the terminal result/candidate material and eligible linked-remediation action. A global Result destination is absent.
13. Proposal review and evidence may take over the primary canvas when their space class requires it, but the owning workflow step and exact return origin remain stable.
14. Adopt/Reject returns to the exact owning stage/Run context without requiring Back to Activity.
15. Current consequential action is rendered by the owning step/material and is not duplicated in WorkItem header/Context.
16. Historical completed Runs never suppress a valid Start action for the current pre-signoff stage.
17. Research CONFIRMED visibly advances current orientation to Requirements and exposes Start Requirements with the completed Research Run retained as historical Research material.
18. The same current-action continuity is certified for Requirements → Solution design, Solution design → Implementation plan and Implementation plan → Readiness review.
19. Reached historical workflow steps remain inspectable without lifecycle mutation; unreached steps show an explicit not-yet-reached state and fabricate no material.
20. Dirty Markdown, selected Run/task/artifact/evidence and return origin survive responsive recomposition according to canonical safety rules.
21. Context remains on-demand and selected-material-specific; it does not become another navigation owner or duplicate task actions.
22. No lifecycle, persistence or HTTP contract is changed solely to support this UI redesign.
23. Existing canonical query/mutation owners, MarkdownEditor, RunEventTimeline, evidence safety and lifecycle helpers are reused.
24. Architecture and browser tests prove the old mode hierarchy is gone and the complete per-step composition is correct.

## 4. Implementation strategy

Implement this as one cumulative signed task. The Workbench composition is tightly coupled at the presentation layer: removing the global modes while only partially recomposing steps would leave the browser in an invalid hybrid architecture. Intermediate commits/checkpoints are allowed, but the candidate must represent the complete end state.

The implementation should prefer recomposition of existing semantic owners over creating one component per lifecycle step. Research, Requirements, Solution design and Implementation plan have the same interaction grammar and should share one typed stage composition unless implementation evidence proves a materially different responsibility.

## 5. Phase A — presentation policy and navigation state

### A1. Replace generic WorkItem mode ownership

In ui/src/workbench-presentation.ts and WorkItemWorkspace:

- preserve the existing ordinary-language workflow step projection;
- replace generic mode navigation as the primary WorkItem presentation owner with typed selected workflow-step + selected step-material state;
- current canonical WorkItem stage selects the default current workflow step;
- reached historical step selection is browser-local inspection only;
- unreached selection renders an explicit unavailable state;
- workflow clicks never call start/promotion/sign-off/execution mutations;
- remove or reduce workItemInitialMode, workflowInspectionTarget mode targets, workItemModeIsKnown and workItemModeLabel where they exist only to serve the superseded global mode model.

Do not create a new persisted workflow state or browser-global store.

### A2. Remove global workspace-view selector

In WorkItemWorkspace:

- remove the Workspace view SegmentedControl;
- remove visibleModes as a global destination list;
- remove generic mode selection/reconciliation where it is no longer meaningful;
- preserve one compact identity/header row and one workflow rail;
- render one selected workflow-step workspace below the rail.

### A3. Preserve dirty navigation safety

Workflow-step changes that would replace dirty editable Markdown continue to use the existing explicit discard/continue-editing protection.

Opening Context or responsive drawers must not discard the buffer.

## 6. Phase B — current action ownership and progression

### B1. Move task actions out of WorkItem header

Keep only true WorkItem management/context actions in the header.

Move:

- Start Research/current pre-signoff stage action → current owning workflow step;
- Sign off exact package + approver input → Approval;
- Create linked remediation → Complete;
- implementation operation → Implementation.

No action is duplicated in Context while its owning material is visible.

### B2. Remove historical-Run start suppression

Delete the current runs.length === 0 rendering restriction.

The presentation condition for a pre-signoff Start action must remain based on canonical current state:

- current WorkItem stage is pre-signoff and startable under existing daemon semantics;
- WorkItem status is ACTIVE;
- no Run is currently active.

Historical terminal Runs are history, not eligibility blockers.

Do not change startInteractiveRun or daemon lifecycle logic merely to compensate for this browser defect.

### B3. Reconcile canonical transitions

When a stage Run terminalizes and WorkItem stage changes:

- update current workflow orientation from the refreshed canonical WorkItem;
- preserve completed attempt history under the prior reached step;
- expose the next step's current action;
- do not auto-open a generic Activity/Documents mode because those destinations no longer exist.

## 7. Phase C — Work request

Compose Work request as a document-first step.

Reuse DocumentWorkspace/MarkdownEditor responsibilities for the source body, but do not expose the full lifecycle document tab strip as a generic Documents destination.

The Work request step must include:

- source body editor/preview;
- dirty/current/Git state;
- Save/Cancel/Git-save;
- actionable source blocker;
- technical complete-source/path/hash/Git details on demand;
- Start Research in the step action region when permitted.

The existing exact-source/body-only and conflict behavior is unchanged.

## 8. Phase D — shared Research / Requirements / Solution design / Implementation plan workspace

Create one reusable pre-signoff stage composition responsibility for R1/R2/DESIGN/PLAN.

It consumes canonical WorkItem, Runs, RunEvents, lifecycle artifacts and presentation projections.

### D1. Stage material availability

For the selected stage expose compact step-local access to:

- current/previous attempts for that stage;
- current stage artifact when present;
- pending/selected proposal;
- selected evidence/resources.

This is local material selection, not another persistent application navigation rail.

### D2. Active Run material

When a selected stage Run is active/waiting or the operator selects Run history:

- reuse the Activity master/detail and RunEventTimeline semantics;
- filter/anchor attempts to the selected stage;
- keep selected Run header, timeline and composer as the dialogue geometry;
- composer renders only for a live input-accepting STAGE Run;
- Retry/Cancel/Resume remain with the selected Run/failure material.

### D3. Governed artifact material

When the stage document is selected:

- reuse MarkdownEditor and canonical artifact queries;
- preserve direct-edit permissions from artifactDirectEditIsAllowed;
- use stage ordinary-language labels;
- keep editor/Git/Save controls task-local;
- surface downstream invalidation/return consequences when an upstream artifact is edited from a downstream current state.

Do not parse or duplicate lifecycle semantics locally.

### D4. Stage-specific emphasis

Research:
- expose evidence/findings and the Research artifact alongside Run history as stage-owned material.

Requirements:
- preserve access to relevant Research/source context without forcing global navigation away from Requirements.

Solution design:
- retain full document width for structural/technical content; technical ids remain secondary.

Implementation plan:
- allow compact structured inspection of canonical task/change-surface content where already derivable from the plan/package; do not create a second task-plan authority.

## 9. Phase E — proposal and evidence in-context promotion

### E1. Proposal review

Refactor ProposalReview so it is selected material of the owning pre-signoff step.

Required behavior:

- selected proposal preserves runId + proposal event id;
- rationale + complete diff receive review-class primary width;
- Adopt/Reject invoke existing commands;
- after successful disposition, invalidate the same canonical queries as today;
- return automatically or through one obvious in-step control to the exact owning stage/Run;
- remove workflow-level Back to Activity wording/behavior.

### E2. Evidence

Refactor evidence opening to preserve owning workflow step + Run/task/artifact origin.

EvidenceViewer remains the content owner.

Closing evidence restores the exact origin without generic returnMode.

No evidence safety or daemon API changes are authorized.

## 10. Phase F — Readiness review

Compose R3 as a dedicated review-oriented step.

The surface must present:

- R3/readiness state and verdict;
- adversarial findings and evidence;
- return-to-owning-layer/blocker information when not ready;
- current R3 artifact read-only;
- R3 Run history/details where present;
- pending human input only if the canonical selected R3 Run accepts it;
- supporting upstream documents/evidence as read-only selected review material.

Do not introduce direct R3 editing.

Do not force the operator into generic Documents or Activity destinations.

## 11. Phase G — Approval

Refactor SignoffReview/WorkItemWorkspace composition so Approval itself owns the complete decision surface.

Approval must contain:

- package currentness/source binding;
- signed tasks, objectives, gates and change surface;
- supporting governed documents opened read-only inside Approval;
- blockers;
- secondary exact hashes/baseline details;
- approver identity;
- Sign off exact package.

The mutation hook may remain in the composition owner if needed for dependency direction, but the rendered action and inputs belong inside Approval.

Remove the WorkItem-header sign-off form.

## 12. Phase H — Implementation

ExecutionWorkspace is the single post-signoff operational owner.

Retain and refine:

- approved-task master;
- task attempt/Run selection;
- selected task detail;
- RunEventTimeline;
- validation/candidate/evidence material;
- current implementation action.

Remove Open in Activity and any duplicate post-signoff Run destination.

Evidence promotion returns to the selected task/Run.

Shared RunEvent presentation remains one semantic owner across pre-signoff stage activity and Implementation.

## 13. Phase I — Complete

Render TerminalResult/candidate material under Complete.

For terminal non-delivery outcomes:

- retain classification + readable result/evidence;
- place Create linked remediation with eligible investigation/audit result;
- keep history inspectable through reached workflow steps.

For CANDIDATE_DONE:

- present verified candidate/result material in Complete;
- keep detailed task/attempt history under reached Implementation;
- do not create a generic Result destination.

Remove WorkItem-header remediation action.

## 14. Phase J — Context, responsive layout and chrome

### J1. Context

Update WorkItemContext/app composition so Context follows selected workflow step/material instead of generic mode.

It may expose compact technical identity for selected document/Run/task/evidence and actionable blocker summaries.

It must not expose a second navigation hierarchy or duplicate task-local actions.

### J2. Responsive composition

At wide width:

- compact stage history/master may coexist with selected primary material only while the material retains its canonical minimum width.

At medium width:

- collapse history/context into temporary selectors/drawers before compressing primary material.

At narrow width:

- one material pane at a time;
- workflow rail remains the one lifecycle navigation;
- task-local actions remain attached to their content.

Preserve selected step/material and dirty state across viewport changes.

## 15. Exact production and verification change surface

The P8 file transition is fixed here. The worker must not invent additional production modules merely because a different decomposition appears convenient.

### 15.1 New production modules

Exactly three new production modules are authorized:

- `ui/src/WorkflowStepFrame.tsx`
  - owns `WorkflowStepFrame`, `WorkflowStepSummary`, `WorkflowStepIndex` and `PrimaryMaterialFrame`;
  - contains layout/presentation composition only;
  - may depend on React, approved Astryx primitives and existing `ui/src/primitives/**`;
  - must not query/mutate server state or own lifecycle/domain policy.
- `ui/src/PreSignoffStageWorkspace.tsx`
  - owns the shared R1/R2/DESIGN/PLAN step composition;
  - consumes canonical stage identity plus browser-safe WorkItem/Run/artifact state;
  - composes the existing document, Run, proposal and evidence semantic owners;
  - contains no duplicated lifecycle policy or stage-specific component family.
- `ui/src/ReadinessWorkspace.tsx`
  - owns the distinct R3 review composition;
  - composes read-only lifecycle material, R3 Run material and evidence;
  - must not introduce R3 editing or another review-domain model.

No `ApprovalWorkspace.tsx`, `CompleteWorkspace.tsx`, stage-specific workspace files, DTO/ViewModel modules or additional primitive layer is authorized. Approval remains the responsibility of `SignoffReview.tsx` after refactor; Complete remains the responsibility of `TerminalResult.tsx` composed by the selected Complete step.

### 15.2 Existing production modules that must change

- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/workbench-presentation.ts`
- `ui/src/ActivityWorkspace.tsx` — refactor from global Activity destination into the reusable `StageRunMaterial` owner; it keeps Run queries/mutations, selected Run detail, composer and `RunEventTimeline` composition;
- `ui/src/DocumentWorkspace.tsx` — remove lifecycle-wide TabList ownership and expose the cohesive governed-document material exports `SourceDocumentMaterial`, `LifecycleDocumentMaterial` and `ReadOnlyLifecycleDocumentMaterial`; editing/Git state remains singular here;
- `ui/src/ProposalReview.tsx`
- `ui/src/SignoffReview.tsx` — becomes the complete Approval composition without changing package semantics;
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/RunEventTimeline.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/app.tsx`
- `ui/src/theme.css`

Existing `MarkdownEditor.tsx`, `MarkdownSourceEditor.tsx`, `query-keys.ts`, `http.ts`, `primitives/WorkbenchAction.tsx`, `primitives/WorkbenchLayout.tsx`, `primitives/WorkbenchResourceRow.tsx`, `primitives/WorkbenchState.tsx` and `primitives/WorkbenchToolbar.tsx` are reused unchanged unless implementation evidence proves a defect in their already-authorized responsibility. Such evidence is a PLAN stop condition; P8 must not silently broaden this task.

### 15.3 Verification and delivery files that must change

- `tests/workbench-presentation.test.ts` — new focused test owner for pure Workbench presentation policy;
- `tests/architecture.test.ts`
- `tests/browser.spec.ts`
- `tests/e2e-server.ts`
- `CHANGELOG.md`

`tests/workbench-presentation.test.ts` must import the production presentation-policy owner and exhaustively certify:
- deterministic primary-material resolution for current, historical, blocked/failed, waiting-input, proposal, active-Run, document, Approval, Implementation and Complete states;
- preservation/reconciliation of explicit valid selection and dirty-document admission inputs;
- ordinary-language presentation for every canonical Run status;
- direct production `runEventPresentation` coverage for every current `RunEventPayload` tag, including the distinct setup-failure/provider-failure labels;
- equal canonical inputs produce equal material selections and no test-local copy of the resolver/event projection exists.

`tests/e2e-server.ts` must seed the canonical WorkItem/Run/RunEvent/package/task/evidence states required by §§17 and 22.6, including the states needed to prove all Run statuses, all current RunEvent tags, current/historical stage material priority, proposal adoption-in-progress, readiness returns/blockers and V0–V7/candidate presentation. Tests must exercise production presentation functions/components rather than copied projection logic.

### 15.4 Architecture-sensor transition

`tests/architecture.test.ts` must update the existing UI owner/dependency sensor rather than add a second architecture test framework.

It must:

- register `WorkflowStepFrame.tsx`, `PreSignoffStageWorkspace.tsx` and `ReadinessWorkspace.tsx` in the required production UI owner set;
- treat `PreSignoffStageWorkspace.tsx` and `ReadinessWorkspace.tsx` as substantive composition owners;
- permit only the cohesive sibling dependencies required by the canonical compositions:
  - `PreSignoffStageWorkspace.tsx` → `ActivityWorkspace.tsx`, `DocumentWorkspace.tsx`, `ProposalReview.tsx`, `EvidenceViewer.tsx`;
  - `ReadinessWorkspace.tsx` → `ActivityWorkspace.tsx`, `DocumentWorkspace.tsx`, `EvidenceViewer.tsx`;
  - `SignoffReview.tsx` → `DocumentWorkspace.tsx` for the canonical read-only lifecycle-document material;
- preserve `ActivityWorkspace.tsx` → `RunEventTimeline.tsx` and `ExecutionWorkspace.tsx` → `RunEventTimeline.tsx`;
- prove `WorkflowStepFrame.tsx` has no HTTP/query/domain-policy ownership;
- replace old architecture assertions that require `WorkItemMode`, `workItemInitialMode` or `workflowInspectionTarget` with the new selected-step/material and deterministic resolver ownership.

No architecture sensor may be weakened merely to permit the refactor.

### 15.5 Explicit exclusions

The signed P8 task does not authorize changes to:

- `AGENTS.md`;
- `docs/**`;
- `pontivus-order.toml`;
- `package.json` or `bun.lock`;
- `playwright.config.ts`;
- `src/**`;
- `ui/src/http.ts`;
- `ui/src/query-keys.ts`;
- `ui/src/primitives/**`;
- persistence schemas;
- public HTTP command contracts;
- OpenCode integration;
- execution-control or lifecycle semantics.

If implementation evidence proves an excluded owner must change to satisfy the approved design, stop and return to PLAN/DESIGN as applicable rather than broadening the signed task.

## 16. Required deletion obligations

The candidate must delete or render unreachable the superseded structures, not retain them as parallel paths:

1. global Workspace view segmented control;
2. generic visibleModes destination list;
3. generic mode-to-workflow routing used only for Documents/Activity/Review/Execution/Evidence/Result;
4. returnMode proposal/evidence restoration;
5. WorkItem-header pre-signoff Start action;
6. WorkItem-header sign-off form;
7. WorkItem-header linked-remediation action;
8. runs.length === 0 current-stage start restriction;
9. post-signoff Open in Activity action;
10. workflow-level Back to Activity proposal-review action;
11. browser assertions that require global Documents/Activity/Review/Result navigation as the intended architecture.

Do not preserve old controls hidden by CSS.

## 17. Permanent browser certification

tests/browser.spec.ts must cover the complete interaction model, not only component visibility.

At minimum:

1. selected WorkItem has identity row + one workflow rail and no Workspace view selector;
2. Work request owns source editing and Start Research;
3. starting Research selects Research and renders its live Run/composer;
4. Research attempt history remains inside Research;
5. Research proposal review takes review space while Research remains the owning workflow step;
6. Adopt returns to the exact Research Run context and the composer remains available when the Run is still live;
7. Reject has the same return-context property;
8. Research evidence opens full evidence content and returns to the exact Research origin;
9. Research CONFIRMED advances canonical current orientation to Requirements;
10. Start Requirements is visible even though completed Research Run history exists;
11. Requirements active Run/document/proposal/evidence are owned by Requirements;
12. accepted Requirements advances to Solution design with Start Solution design available;
13. accepted Design advances to Implementation plan with Start Implementation planning available;
14. accepted Plan advances to Readiness review with Start Readiness review available;
15. reached historical Research/Requirements/Design/Plan remain inspectable without lifecycle mutation;
16. unreached workflow step shows not-yet-reached material and performs no mutation;
17. dirty Markdown prevents unsafe workflow-step/material replacement and preserves buffer on cancel;
18. R3 is review-oriented/read-only and exposes verdict/findings/supporting material;
19. Approval contains package + supporting document inspection + approver input + sign-off in one workspace;
20. Implementation contains tasks + attempts + events/evidence without Open in Activity;
21. Complete renders terminal non-delivery result and eligible remediation in-place;
22. Complete CANDIDATE_DONE retains verified candidate/result access and reached Implementation history;
23. Context remains on-demand and follows selected material;
24. wide and narrow viewport tests prove no second navigation hierarchy appears and task-local actions remain reachable;
25. entering a WorkItem still focuses the WorkItem heading/orientation target;
26. closing a narrow WorkflowStepIndex drawer with Escape restores focus to its opening control/current step context;
27. proposal/evidence promotion and return restore focus to the originating Run/material control rather than an obsolete global mode control;
28. cancelling a dirty-navigation confirmation preserves the buffer and returns focus to the edited material/control;
29. discarding dirty state and returning to the queue restores focus to the originating WorkItem row.

The Research → Requirements scenario is mandatory because it certifies the original progression dead-end is structurally closed.

## 18. Architecture/static certification

tests/architecture.test.ts or the existing appropriate architecture owner must prove, where mechanically practical:

- no production rendering of the global workspace-view selector remains;
- generic WorkItem mode policy no longer owns lifecycle navigation;
- no stage-specific duplicated lifecycle label/policy tables are introduced;
- RunEvent presentation remains singular;
- canonical Markdown edit policy remains imported from its existing owner;
- no DTO/ViewModel/service/class state family appears;
- no new browser server-state store appears;
- production modules remain registered under the existing UI architecture sensor.

Do not add brittle string-count tests when a functional browser assertion or dependency-boundary sensor is the correct owner.

## 19. Verification gates

Run the complete concern gate union:

1. bun ci
2. bun run tsc --noEmit
3. architecture test
4. complete Vitest suite
5. production build
6. complete Playwright browser suite

The implementation is not complete merely because the new layout renders. All existing WorkItem, Markdown, Context, proposal/evidence, sign-off, execution, result and responsive behavior that remains authoritative must continue to pass.

## 20. Stop conditions

Stop and return upstream rather than improvising if implementation would require any of the following:

- changing lifecycle promotion semantics;
- allowing chat text to become durable authority without canonical adoption/edit;
- changing Run terminal/input semantics;
- changing artifact direct-edit ownership;
- changing sign-off package identity;
- changing execution task/validation semantics;
- introducing new daemon or persistence state for presentation navigation;
- creating a DTO/ViewModel family;
- duplicating RunEvent/Markdown/lifecycle policy by step;
- shrinking review/document/evidence material below canonical space requirements merely to keep every information type visible simultaneously.

## 21. Completion definition

This P7 is complete only when:

- GW-FR-106..121 and GW-TR-082..097 are fully implemented;
- all nine workflow steps have the information presentation and interaction ownership defined by GW-DOC-WORKBENCH-UX-V1 §27;
- the old generic workspace-view hierarchy is removed;
- Research → Requirements and subsequent stage start continuity are certified;
- proposal/evidence review returns to exact stage context;
- Approval and Implementation no longer require cross-mode navigation to complete their ordinary tasks;
- all required gates pass;
- the final diff contains no unrelated redesign, abstraction or cleanup.


## 22. Panel, feedback and interaction closure addendum

This section is mandatory implementation scope. It closes the remaining ambiguity identified after the first workflow-centric design pass: knowing that a step owns dialogue/document/review/evidence is insufficient unless the implementation also knows the exact semantic regions, default material priority, feedback placement and action-result behavior.

### 22.1 Implement the canonical step panel grammar

For every workflow step implement GW-DOC-WORKBENCH-UX-V1 §§27.17–27.19:

- compact step summary;
- optional 14–18 rem work index only when multiple work objects need selection;
- one dominant primary material canvas;
- task-local action region attached to the selected material;
- on-demand Context/Technical details.

Do not create equal-weight dashboard panels. Do not keep a work index visible when it would reduce Document/Dialogue/Review/Evidence below its minimum usable width.

The implementation must prove the per-step panel contract for Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete.

### 22.2 Implement one deterministic material resolver

In the single presentation-policy owner, implement and test GW-FR-117/GW-TR-092.

The resolver must cover:

- current pre-signoff blocker/failure;
- unresolved human input;
- pending proposal;
- active Run;
- current artifact;
- empty/start state;
- historical-step artifact/latest Run fallback;
- Readiness blocker/input/review priority;
- Approval package priority;
- Implementation selected/current task/Run priority;
- Complete result priority.

Individual React components must not invent their own default Activity/Document/Review decisions.

### 22.3 Present every canonical Run/OpenCode feedback class

Use the complete current RunEventPayload union in src/core/contracts.ts as the closed source set.

Permanent presentation coverage must include:

- STAGE_STARTED;
- AGENT_MESSAGE_FINAL;
- HUMAN_INPUT_REQUESTED;
- HUMAN_INPUT_RECEIVED;
- ARTIFACT_PROPOSAL_CREATED;
- ARTIFACT_PROPOSAL_ADOPTION_REQUESTED;
- ARTIFACT_PROPOSAL_DISPOSITIONED;
- STAGE_COMPLETED;
- STAGE_BLOCKED;
- TASK_ALREADY_SATISFIED;
- CONFORMANCE_PASSED;
- CONFORMANCE_FAILED;
- PROVIDER_DIAGNOSTICS_RECORDED;
- PRODUCTIVE_INVOCATION_FAILED;
- PROVIDER_FAILED;
- GATE_PASSED;
- GATE_FAILED;
- REVIEW_PASSED;
- REVIEW_FAILED;
- VALIDATION_PASSED;
- VALIDATION_FAILED;
- CANDIDATE_STATE_RECORDED;
- CANDIDATE_RECORDED;
- AUTHORITY_CHANGED;
- REPOSITORY_DRIFTED;
- OBSERVATION_RECORDED.

Also cover all Run statuses: RUNNING, WAITING_FOR_INPUT, COMPLETED, BLOCKED, FAILED and CANCELLED.

The ordinary-language mapping remains singular in workbench-presentation.ts. Component-local tag allow-lists that silently discard canonical feedback are prohibited.

Pass/success events may be summarized into a compact conformance/validation presentation, but exact persisted events remain inspectable. Failure, blocker, pending-input, proposal and terminal-result feedback must be visible without opening raw Technical details.

### 22.4 Preserve the truthful OpenCode observation boundary

Do not add direct browser OpenCode subscriptions, WebSocket/SSE, token streaming, tool-call streaming or synthetic progress.

The UI must show:

- canonical Run state;
- persisted RunEvent feedback;
- evidence references;
- local pending state for operator mutations.

While OpenCode is executing but no new canonical event has been persisted, the UI says Running. It does not claim percentage complete, thinking phase, tool progress or hidden reasoning.

ProviderDiagnosticRecord is rendered through existing evidence/Technical-details paths. Human-readable PRODUCTIVE_INVOCATION_FAILED versus PROVIDER_FAILED remains primary and semantically distinct.

### 22.5 Implement mutation-result feedback at the owning material

For every consequential mutation certify pending, success and failure:

- Start stage;
- Submit input;
- Cancel;
- Retry;
- Resume;
- Adopt proposal;
- Reject proposal;
- Save Markdown;
- Save documentation to Git;
- Sign off;
- Run/advance implementation;
- Create linked remediation.

While pending, duplicate mutation controls are disabled. A successful mutation refreshes only affected canonical queries and preserves/reconciles the exact owning step/material selection. A failure is shown beside the action/material that failed.

Proposal adoption specifically must show adoption-in-progress after ARTIFACT_PROPOSAL_ADOPTION_REQUESTED and before final disposition/reconciliation; Adopt/Reject cannot remain simultaneously actionable in that state.

### 22.6 Additional browser certification

Extend §17 with permanent cases proving:

30. each of the nine workflow steps renders the canonical step-summary / work-index-if-needed / primary-material / local-action division rather than arbitrary equal-weight panels;
31. current pre-signoff primary material priority is blocker → required input → pending proposal → active Run → stage document → start state, subject to dirty-selection safety;
32. historical step defaults to its governed artifact, otherwise latest Run, and never shows an active composer;
33. every canonical Run status has ordinary-language presentation;
34. every current RunEvent tag can be rendered by the shared presentation path and is not dropped by screen-specific filtering;
35. PRODUCTIVE_INVOCATION_FAILED renders Agent setup blocked while PROVIDER_FAILED renders Agent execution failed;
36. provider diagnostics are reachable as evidence/Technical detail without replacing human-readable failure feedback;
37. STAGE_COMPLETED refreshes workflow orientation and next-stage action without removing the completed step's history;
38. CONFORMANCE_FAILED, STAGE_BLOCKED, AUTHORITY_CHANGED and REPOSITORY_DRIFTED become primary actionable feedback in their owning context;
39. V0–V7 validation feedback is scan-efficient in Implementation while exact events/evidence remain inspectable;
40. mutation pending states disable duplicate Start/Input/Cancel/Retry/Resume/Adopt/Reject/Sign-off/Implementation/Remediation actions as applicable;
41. proposal adoption-in-progress disables disposition controls until canonical reconciliation completes;
42. no browser UI exposes fake token/tool/percentage progress while a Run is merely RUNNING;
43. wide → narrow → wide responsive transitions preserve selected workflow step, selected material and dirty state.

### 22.7 Additional architecture/static certification

The architecture/presentation tests must prove:

- `tests/workbench-presentation.test.ts` exhaustively exercises the production deterministic material resolver, every canonical Run status and every current RunEvent presentation case;
- the RunEvent presentation switch is exhaustive over the canonical union;
- pre-signoff and Implementation consume the same event presentation owner;
- default material selection has one pure owner;
- no new browser OpenCode transport exists;
- no provider diagnostic DTO/view-model family is introduced;
- no stage-specific event/status mapping copies exist.

### 22.8 Completion consequence

The plan is not implementation-ready merely because every workflow step has a named workspace. Completion requires that the implementation can answer, for every state of every step:

1. what information is present;
2. which information is primary versus supporting;
3. what semantic region displays it;
4. what width/height class it receives;
5. what interaction is available;
6. where that interaction is placed;
7. what pending/success/failure feedback it produces;
8. where the user returns after promoted review/evidence;
9. what Run/OpenCode feedback is visible;
10. what information is intentionally unavailable because the provider/browser contract does not expose it.

GW-DOC-WORKBENCH-UX-V1 §§27.17–27.23 and GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1 §§23.16–23.35 are the canonical answers. Implementation may not infer a different panel, primitive or feedback model.


## 23. Exact per-step UI composition implementation addendum

This section operationalizes GW-DOC-WORKBENCH-UX-V1 §27.23 and GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1 §§23.24–23.35. It removes any remaining implementation freedom around choosing arbitrary panels or UI primitives.

### 23.1 Shared composition layer

The physical ownership is fixed by §15.1: `WorkflowStepFrame.tsx` contains the four structural frame exports; `PreSignoffStageWorkspace.tsx` contains the shared R1/R2/DESIGN/PLAN composition; `ReadinessWorkspace.tsx` contains R3 composition. Existing semantic owners are refactored in place and no other production file is created.

Implement the following local semantic presentation responsibilities before rewriting individual steps:

1. **WorkflowStepFrame** — summary + optional work index + one primary material slot + responsive index collapse.
2. **WorkflowStepSummary** — step label/purpose/state, Badge/StatusDot, Banner when actionable, one WorkbenchAction current action.
3. **WorkflowStepIndex** — Astryx List-backed grouped selection of attempts/documents/tasks/package material; Drawer-backed on constrained widths.
4. **PrimaryMaterialFrame** — material heading/content/local-action geometry plus WorkbenchEmptyState/WorkbenchErrorState.
5. **pure selected-material resolver** in the existing workbench-presentation owner implementing GW-FR-117.
6. **shared RunEvent presentation** remains singular and exhaustive.

These are presentation components/functions only. Do not add persistence, transport state, DTOs, classes, services or a global store.

### 23.2 Work request implementation

Refactor the source responsibilities currently inside DocumentWorkspace so the Work request step mounts the source material directly.

Use exactly:

- WorkflowStepFrame;
- WorkflowStepSummary;
- Badge/StatusDot;
- Banner for blocking source diagnostics;
- MarkdownEditor / CodeMirror;
- existing formatting/document control surface;
- WorkbenchAction;
- AlertDialog for dirty navigation/Git confirmation.

Do not mount the generic lifecycle TabList around Work request.

### 23.3 Shared R1/R2/DESIGN/PLAN implementation

Implement one PreSignoffStageWorkspace parameterized by canonical stage.

Reuse/refactor current ActivityWorkspace and DocumentWorkspace responsibilities rather than copying them four times. `ActivityWorkspace.tsx` exports the shared `StageRunMaterial`; `DocumentWorkspace.tsx` exports the shared source/lifecycle document materials named in §15.2. `PreSignoffStageWorkspace.tsx` composes those exports directly.

Use:

- WorkflowStepIndex backed by List for attempts + one owning stage document;
- ChatLayout / ChatMessage / ChatSystemMessage / ChatToolCalls / ChatComposer for stage dialogue;
- RunEventTimeline as the one semantic event presentation path;
- Badge/StatusDot for Run state;
- Banner for current failure/blocker;
- WorkbenchAction for Cancel/Retry/Resume;
- MarkdownEditor / CodeMirror and Markdown for stage document;
- ProposalReview + CodeBlock + WorkbenchAction Adopt/Reject;
- EvidenceViewer + CodeBlock/ScrollableArea;
- WorkbenchResourceRow for evidence.

Remove global Activity and Documents routing from these steps.

### 23.4 Readiness implementation

Create/refactor one dedicated ReadinessWorkspace.

Use:

- WorkflowStepFrame / Summary / Index;
- List for Review / attempts / package-material selection;
- Badge/StatusDot for readiness state;
- Banner for blocker/RETURN_TO_*;
- Section/Stack review composition;
- Markdown for R3/upstream documents read-only;
- WorkbenchResourceRow;
- shared StageRunMaterial only when an R3 Run is selected or awaits input;
- EvidenceViewer.

Do not mount MarkdownEditor for R3.

### 23.5 Approval implementation

Refactor SignoffReview into the complete Approval workspace.

Use:

- WorkflowStepFrame / Summary / Index;
- List for Overview/Documents/Tasks;
- Table only where multiple signed tasks benefit from comparison;
- Markdown for selected governed document;
- Section/Stack for package/task detail;
- MetadataList only for secondary exact identity;
- TextInput for approvedBy;
- Toolbar/Stack + WorkbenchAction for Sign off exact package;
- Banner for stale/unavailable package.

Delete Open governed documents cross-navigation and remove sign-off controls from WorkItemWorkspace header. `SignoffReview.tsx` composes `ReadOnlyLifecycleDocumentMaterial` from `DocumentWorkspace.tsx` for selected governed-document inspection; it does not implement a second document renderer.

### 23.6 Implementation implementation

Refactor ExecutionWorkspace without changing execution domain semantics.

Use:

- WorkflowStepFrame / Summary / Index;
- Table/List task master;
- List attempt master;
- Badge/StatusDot;
- MetadataList for compact task facts;
- Table for V0–V7 discrete validation states;
- RunEventTimeline;
- WorkbenchResourceRow;
- EvidenceViewer / CodeBlock / ScrollableArea;
- WorkbenchAction for current execution/recovery actions.

Delete Open in Activity.

Do not use ProgressBar for provider work or V0–V7.

### 23.7 Complete implementation

Compose TerminalResult under Complete.

Use:

- WorkflowStepFrame / Summary;
- Badge for terminal outcome;
- Markdown / CodeBlock for final result material;
- WorkbenchResourceRow for evidence/candidate resources;
- WorkbenchAction for eligible linked remediation.

TabList is permitted only for a small fixed set of peer final artifacts inside one terminal result, not as generic Result/Documents navigation.

### 23.8 Context and responsiveness

Retain WorkbenchLayout + Drawer for Context.

Replace contextMode with selected workflow step/material identity. WorkItemContext renders MetadataList/technical detail for the selected canonical object.

WorkflowStepIndex uses Drawer/temporary selection on constrained widths.

Dirty-discard confirmation remains AlertDialog.

### 23.9 Explicit primitive prohibitions

The implementation must not:

- reintroduce SegmentedControl as a global Documents/Activity/Review/Result selector;
- use TabList as the workflow rail or generic work index;
- use ProgressBar for opaque provider execution;
- use Toast as the only failure/blocker/input feedback;
- create Card stacks as the primary information architecture;
- create per-stage action/status/event primitive wrappers;
- duplicate Markdown, evidence, proposal or RunEvent semantic owners;
- import a different Astryx composite where §§23.24–23.35 already specify the primitive family.

### 23.10 Additional certification

Add permanent tests proving:

- each of the nine step contracts in §27.23 renders the prescribed semantic regions;
- WorkflowStepIndex is absent when not needed and becomes temporary selection at narrow width;
- the generic global workspace SegmentedControl is absent;
- no lifecycle-wide document TabList is mounted around pre-signoff steps;
- Research/R2/Design/Plan all reuse the same stage composition semantics;
- R3 mounts no editable Markdown control;
- Approval sign-off is inside Approval and governed documents inspect in-place;
- Implementation contains no Open in Activity;
- V0–V7 uses discrete state presentation rather than fake percentage progress;
- Context follows selected step/material and uses Drawer at constrained widths.

### 23.11 Completion consequence

Implementation is complete only when every row of GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1 §23.35 is realized and traceable to production components/tests. A functional screen contract without its specified primitive/composition owner is incomplete; a technically rendered primitive without the corresponding functional information hierarchy is likewise incomplete.


## 24. Ordered implementation checkpoints

The one signed task executes in this order. These are checkpoints inside one cumulative candidate, not separate ExecutionTasks.

1. **Presentation-policy checkpoint:** Phase A plus the pure deterministic material resolver are complete; `tests/workbench-presentation.test.ts` exhaustively certifies the resolver, Run statuses and RunEvent projection, while focused typecheck/architecture checks prove no generic mode owner remains.
2. **Shared-frame checkpoint:** `WorkflowStepFrame.tsx` plus responsive work-index mechanics are complete; architecture ownership is updated before substantive workspace imports are added.
3. **Pre-signoff checkpoint:** Work request and the shared R1/R2/DESIGN/PLAN workspace are complete, including the historical-Run Start suppression fix and proposal/evidence return context.
4. **Review checkpoint:** Readiness and Approval are complete; R3 is read-only and package review/sign-off remains in Approval.
5. **Post-signoff checkpoint:** Implementation and Complete are complete; Open in Activity/global Result paths are gone.
6. **Feedback checkpoint:** exhaustive Run status/RunEvent presentation and every mutation pending/success/failure path in §22 are complete.
7. **Certification checkpoint:** `tests/e2e-server.ts`, browser tests and architecture sensors cover §§17, 18, 22.6, 22.7 and 23.10.
8. **Diff-reduction checkpoint:** remove obsolete generic mode/tab/return machinery and any temporary duplication introduced during the refactor; prove the final tree matches the signed changeSurface.
9. **Final gate checkpoint:** run the complete six-gate union on the final candidate state.

A checkpoint failure may be repaired only within the already-approved P1-P7 semantics. A required new lifecycle rule, transport contract, dependency, effect boundary, persisted state or production file outside the signed changeSurface returns upstream.

## 25. P8 execution and public delivery

This P7 authorizes implementation only after this documentation PR is merged and approved.

P8 must:

1. create short-lived branch **`feat/0.3.0-workflow-centric-workbench`** from **current `master`**, not from investigated SHA `448ce99763061ccfc24f15a6be7e3ce8095d8b5a`;
2. prove the merged `master` contains this exact P7 plan and the referenced P3/P4 requirements;
3. execute the single signed task in §26 without broadening its scope/changeSurface;
4. update root `CHANGELOG.md` under `[Unreleased]`;
5. open a PR to `master` whose body declares the repository-verifier literals `SemVer impact: **minor**` and `Target release: **0.3.0**`;
6. pass every required repository PR/status check and resolve material review discussion before merge;
7. not modify `package.json.version`, create a tag or publish 0.3.0. The version/release transition remains a later dedicated `release/v0.3.0` PR under `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1`.

If current `master` has diverged such that any signed file path, authority reference, primitive contract or planned deletion is no longer sufficient, P8 must stop and the P7 must be amended/re-signed.

## 26. Machine-readable signed task

The following is the only machine-readable P7 task authority in this document. The cumulative Workbench transition is one task because the approved browser state must be validated as one repository candidate and v1 does not compose candidate bytes across dependent ExecutionTasks.

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "P7-T01",
      "objective": "Implement the complete Order 0.3.0 workflow-centric Workbench foundational redesign: one lifecycle-step navigation axis, canonical per-step material composition, exact approved UI primitive mapping, complete Run/OpenCode and mutation feedback, and removal of the superseded global workspace-mode architecture.",
      "dependsOn": [],
      "scope": [
        "CHANGELOG.md",
        "ui/src/**",
        "tests/**"
      ],
      "exclusions": [
        "AGENTS.md",
        "docs/**",
        "package.json",
        "bun.lock",
        "pontivus-order.toml",
        "playwright.config.ts",
        "src/**",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/primitives/**"
      ],
      "acceptanceRefs": [
        "GW-FR-040-UNSAVED-MARKDOWN-NAVIGATION-SAFETY",
        "GW-FR-041-KEYBOARD-FOCUS-CONTINUITY",
        "GW-FR-046-SCOPE-LOCAL-CONTROLS",
        "GW-FR-050-SHARED-ACTION-RESOURCE-GRAMMAR",
        "GW-FR-051-USER-FACING-WORKFLOW-LANGUAGE",
        "GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY",
        "GW-FR-055-ACTIONABLE-FAILURE-RECOVERY",
        "GW-FR-056-WORKFLOW-ACTION-PLACEMENT",
        "GW-FR-057-TECHNICAL-DETAILS-BOUNDARY",
        "GW-FR-059-RESPONSIVE-ACTIVITY-CONTINUITY",
        "GW-FR-106-WORKFLOW-STEP-PRIMARY-NAVIGATION",
        "GW-FR-107-STEP-LOCAL-MATERIAL-COMPOSITION",
        "GW-FR-108-PRE-SIGNOFF-STAGE-WORKSPACE",
        "GW-FR-109-PROPOSAL-EVIDENCE-CONTEXT-CONTINUITY",
        "GW-FR-110-CURRENT-STAGE-ACTION-CONTINUITY",
        "GW-FR-111-READINESS-REVIEW-WORKSPACE",
        "GW-FR-112-APPROVAL-PACKAGE-WORKSPACE",
        "GW-FR-113-IMPLEMENTATION-WORKSPACE-OWNERSHIP",
        "GW-FR-114-COMPLETE-OUTCOME-WORKSPACE",
        "GW-FR-115-RESPONSIVE-WORKFLOW-STEP-CONTINUITY",
        "GW-FR-116-WORKFLOW-STEP-PANEL-CONTRACT",
        "GW-FR-117-DETERMINISTIC-PRIMARY-MATERIAL",
        "GW-FR-118-CANONICAL-RUN-FEEDBACK-COMPLETENESS",
        "GW-FR-119-INTERACTION-RESULT-FEEDBACK",
        "GW-FR-120-OPENCODE-FEEDBACK-BOUNDARY",
        "GW-FR-121-PER-STEP-FUNCTIONAL-SCREEN-CONTRACT"
      ],
      "changeSurface": [
        "CHANGELOG.md",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/app.tsx",
        "ui/src/theme.css",
        "tests/workbench-presentation.test.ts",
        "tests/architecture.test.ts",
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
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-EXPLICIT-FLOW",
        "GW-P1-MINIMUM-CHANGE",
        "GW-P1-DOC-CANONICALITY",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V1",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1",
        "GW-DOC-MARKDOWN-WORKBENCH-V1",
        "GW-DOC-WORKBENCH-UX-V1",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1",
        "GW-DOC-EXTERNAL-FACTS-V1-2026-11-12",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V1",
        "GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1",
        "GW-TR-082-WORKFLOW-STEP-COMPOSITION-OWNER",
        "GW-TR-083-PRE-SIGNOFF-STAGE-MATERIAL-ORCHESTRATION",
        "GW-TR-084-STAGE-RUN-HISTORY-AND-COMPOSER",
        "GW-TR-085-IN-CONTEXT-PROPOSAL-EVIDENCE-PROMOTION",
        "GW-TR-086-CANONICAL-CURRENT-ACTION-PROJECTION",
        "GW-TR-087-READINESS-APPROVAL-TECHNICAL-COMPOSITION",
        "GW-TR-088-IMPLEMENTATION-RUN-OWNERSHIP",
        "GW-TR-089-COMPLETE-OUTCOME-COMPOSITION",
        "GW-TR-090-WORKFLOW-CENTRIC-BROWSER-CERTIFICATION",
        "GW-TR-091-WORKFLOW-STEP-PANEL-COMPOSITION",
        "GW-TR-092-DETERMINISTIC-STEP-MATERIAL-RESOLVER",
        "GW-TR-093-EXHAUSTIVE-RUN-FEEDBACK-PROJECTION",
        "GW-TR-094-LOCAL-MUTATION-FEEDBACK-ORCHESTRATION",
        "GW-TR-095-OPENCODE-BROWSER-OBSERVATION-BOUNDARY",
        "GW-TR-096-PER-STEP-PRIMITIVE-COMPOSITION",
        "GW-TR-097-SHARED-WORKFLOW-UI-SEMANTIC-OWNERSHIP"
      ],
      "concernIds": [
        "foundation",
        "ui",
        "verification"
      ]
    }
  ]
}
```

## 27. R3 / implementation-readiness predicate

This P7 may be marked READY_FOR_SIGNOFF only when all of the following are true:

1. the `order-tasks` block in §26 parses successfully under the repository's current `SignedTaskBlockSchema`;
2. every `acceptanceRefs` and `authorityRefs` value resolves through current `pontivus-order.toml`;
3. the task's gateIds include the complete gate union required by `foundation`, `ui` and `verification`;
4. the exact changeSurface is sufficient for the approved production decomposition and no required P8 file is already known outside it;
5. the physical owner/dependency transition in §15.4 is compatible with the existing UI architecture sensor without weakening that sensor;
6. `tests/workbench-presentation.test.ts` can exhaustively certify the pure resolver/status/event projections and the browser fixture plan can represent every integrated canonical state/event required by §§17 and 22.6 without changing daemon/domain contracts;
7. no requirement in P3/P4 needs implementation inference beyond ordinary local coding choices;
8. the documentation/plan PR is green under its required status checks.

After sign-off, P8 executes §26 exactly. A prose/block mismatch is a readiness failure.
