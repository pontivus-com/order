<!-- Order template: delivery-plan-v1; authority: GW-DOC-LIFECYCLE-CONTEXT-V1, GW-DOC-CANONICAL-CONTRACTS-V1 -->

# Workbench V2 workflow-state and UI implementation plan

**Status:** P7 implementation plan draft. Execution requires the normal R3/readiness and explicit sign-off path.  
**WorkItem:** `work_b851ee97-60fa-4082-b332-247b3a75d945`  
**Implementation model:** one signed ExecutionTask with ordered cumulative internal units.

The single-task structure is mandatory under `GW-DOC-CANONICAL-CONTRACTS-V1`: ExecutionTask dependencies control eligibility only and every task starts from the same Approval baseline. Later tasks do not receive earlier candidate bytes. Because the Workbench state/UI remediation is one cumulative repository transition, splitting the following units into separately signed dependent tasks would be semantically incorrect.

## Exact task units/dependencies

### Unit 1 — canonical lifecycle/workflow decision language

**Files:** `src/core/lifecycle.ts`, `tests/core.test.ts`.

Extend the existing browser-safe lifecycle owner; do not create another core workflow module. Materialize the complete P4 decision language already closed by `GW-TR-082..084`, `GW-TR-087`, `GW-TR-089`, `GW-TR-091`, `GW-TR-097..098`: lifecycle transition causes, STAGE interaction/input admission, closed provider-turn grammar, proposal decision/adoption phase, monotonic reach, material currentness normalization, execution owner/current validation boundary, operator recovery, observation coherence, current attention and the sole nine-stage rail projection.

Implementation requirements:
- keep all decisions pure over existing canonical types/facts;
- route source-change and every lifecycle tuple through the canonical transition owner;
- fail closed on malformed/contradictory histories;
- do not add a Zod/persistence/HTTP/browser `WorkflowState`, rail state, retry counter, view model or DTO;
- add exhaustive table-driven pure tests for every union variant, transition row, invalid turn combination, reach/rail fixture and historical-selection independence.

**Dependency:** none. This unit establishes the semantic policy consumed by every later unit.

### Unit 2 — daemon read purity, mutation serialization and atomic reactions

**Files:** `src/daemon/runtime.ts`, `src/daemon/work-item-source.ts`, `src/daemon/authority.ts`, `src/daemon/stage.ts`, `src/daemon/coordinator.ts`, `src/daemon/execution.ts`, `tests/daemon.test.ts`, `tests/e2e-server.ts`.

Make the imperative shell conform to `GW-TR-085`, `GW-TR-086` and the state policy from Unit 1.

Implementation requirements:
- add the process-local per-WorkItem operator-mutation guard in `runtime.ts`; it is synchronization only, never canonical state or a queue;
- split source inspection from explicit reconciliation so GET/source inspection cannot apply a source plan or change lifecycle state;
- split lifecycle/sign-off inspection from ArtifactRef/lifecycle materialization so GET lifecycle-artifacts/signoff-package is observational;
- make productive commands inspect first, enter the guard where required, then recheck DB-decidable admission at the final transaction/effect boundary;
- validate a complete non-empty STAGE provider-result batch before any member is persisted and persist the accepted batch plus coordinator reaction/lifecycle transition atomically where no filesystem effect intervenes;
- commit accepted human input immediately and schedule the next provider turn asynchronously;
- preserve durable proposal-adoption intent before the filesystem effect and reconcile only that exact proposal after interruption;
- make Cancel/provider-finalization races deterministic and prevent a cancelled Run from later mutating WorkItem state;
- make Resume use the exact blocker/currentness route and never perform implicit source reconciliation;
- route execution returns/completion through `src/core/lifecycle.ts` while retaining `src/core/execution.ts` as the unchanged automatic execution-policy owner;
- add deterministic concurrency tests for Start/Start, Input/Input, Input/Cancel, provider-finalize/Cancel, Save/Start, Adopt/Input, Sign-off/upstream mutation and Resume/currentness races;
- add read-purity tests proving the relevant GET/query paths do not mutate SQLite workflow state or repository bytes.

**Dependency:** Unit 1.

### Unit 3 — canonical selected-WorkItem browser observation and convergence

**Files:** `ui/src/http.ts`, `ui/src/query-keys.ts`, `ui/src/app.tsx`, `ui/src/WorkItemWorkspace.tsx`, `ui/src/workbench-presentation.ts`, `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts`, `tests/e2e-server.ts`.

Implement `GW-TR-088` and consume Unit 1 rather than rebuilding workflow policy in React.

Implementation requirements:
- add/use `api.getWorkItem(workItemId)` over the existing `GET /api/work-items/:workItemId` route and one canonical `workbenchQueryKeys.workItem(workItemId)` key;
- `App` owns the dedicated selected-WorkItem query independently of the queue-list snapshot;
- while relevant Runs are active, poll selected WorkItem, Run list and active RunEvents at the canonical cadence;
- on observed terminalization perform the final RunEvent drain and affected WorkItem/task/artifact/source/signoff refetch before exposing the next action;
- suppress mutations while the loaded canonical facts are `CONVERGING` or a required dependent refetch is pending; never synthesize the missing transition;
- create one shared mutation invalidation/refetch path; child renderers may consume shared canonical query keys only for secondary/detail reads;
- make `workbench-presentation.ts` consume the core reach/interaction/attention/recovery/rail decisions and remove ordinal-stage or raw-Run-status eligibility heuristics;
- keep explicit historical selection presentation-local and incapable of changing current blocker/action/execution ownership.

**Dependency:** Units 1–2.

### Unit 4 — Astryx-conformant theme and complete Workbench primitive foundation

**Files:** all `ui/src/primitives/*` paths in the signed change surface, `ui/src/styles.css`, `ui/src/theme.css`, `ui/src/app.tsx`, `tests/architecture.test.ts`, `tests/browser.spec.ts`.

Build the complete closed primitive vocabulary from `GW-TR-092..096` and `GW-TR-099..103` before feature migration.

Implementation requirements:
- mount exactly one root Astryx `Theme` using the pinned built Neutral theme and the single System/Light/Dark preference owner;
- implement the exact public-Astryx-token bridge and Order-only structural/readability tokens from `GW-DOC-WORKBENCH-THEME-V1`; no private `--_` tokens, generated/internal Astryx selectors, raw feature palettes or redundant Order aliases;
- reduce `styles.css` to imports/layer order/root reset and make `theme.css` the sole Order presentation stylesheet;
- implement all 27 semantic Workbench primitives with their exact P4 APIs/substrates, including navigation-only `WorkbenchUtilityLink`, `WorkbenchSelector` over `Selector variant="secondary" presentation="adaptive"`, Dialog-based TaskPanel, wide/drawer Context, Review, MasterDetail, Status/Notice, Table/Timeline and AlertDialog confirmation;
- use field-owning Astryx controls directly; use `WorkbenchField` only for controls without a foundation-owned field shell;
- use Astryx props/layout/density/public tokens before residual Order CSS;
- register every new production UI module in architecture fitness in the same change.

**Dependency:** Unit 3 for final shell integration; primitive files themselves may be built while Unit 3 is being completed, but feature migration must target the final Unit 3 observation owner.

### Unit 5 — application services: shell, queue, Create, Settings and account access

**Files:** `ui/src/app.tsx`, `ui/src/OpenCodeAccountControl.tsx`, `ui/src/SettingsWorkspace.tsx`, `ui/src/OpenCodeAccountSettings.tsx`, `ui/src/CreateWorkItem.tsx`, `ui/src/WorkItemQueue.tsx`, plus the primitives/theme files they consume.

Recompose application-level services onto the Unit 4 language without changing their canonical domain behavior.

Implementation requirements:
- use `WorkbenchLayout`/`WorkbenchToolbar` as the single AppShell topology;
- make account/Settings entry true Link/navigation semantics through `WorkbenchUtilityLink`, not a command Button;
- keep the System/Light/Dark peer-mode control in the global toolbar without introducing Settings/domain persistence;
- render Create WorkItem as `WorkbenchTaskPanel` → `WorkbenchForm` in `Dialog purpose="form"`; use Astryx field-owning controls;
- render Settings through `WorkbenchSettingsLayout` and the same Form/field/status/notice/confirmation grammar;
- render Queue through `WorkbenchTable`/Notice/Status/Action with no card/dashboard or feature-local row grammar;
- preserve WorkItem creation, repository/settings, OpenCode account and readiness contracts referenced by the signed acceptance set.

**Dependency:** Units 3–4.

### Unit 6 — WorkItem shell, rail, pre-signoff, dialogue and review recomposition

**Files:** `ui/src/WorkItemWorkspace.tsx`, `ui/src/WorkItemIdentityRow.tsx`, `ui/src/WorkflowRail.tsx`, `ui/src/WorkflowMaterialSelector.tsx`, `ui/src/WorkflowStepFrame.tsx`, `ui/src/PreSignoffStageWorkspace.tsx`, `ui/src/ActivityWorkspace.tsx`, `ui/src/ActivityComposer.tsx`, `ui/src/RunEventTimeline.tsx`, `ui/src/DocumentWorkspace.tsx`, `ui/src/ProposalReview.tsx`, `ui/src/ReadinessWorkspace.tsx`, `ui/src/SignoffReview.tsx`, and required primitives.

Implement the exact screen grammar and required same-layer decomposition from `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`.

Implementation requirements:
- add the three thin adapters `WorkItemIdentityRow`, `WorkflowRail` and `WorkflowMaterialSelector` and register them in architecture fitness;
- reduce `WorkflowStepFrame` to Attention + one primary Surface; remove generic side-index/master slots;
- make the rail a formatter/accessibility adapter over `deriveWorkflowRail`, with no reach/marker semantics;
- make pre-signoff/Readiness material selection use only `WorkbenchSelector`; object count cannot change primary columns;
- make Dialogue own transcript/composer geometry while input admission remains derived policy;
- make proposal adoption/pending/required input/block/retry states expose exactly one current action/feedback owner;
- keep provider/session plumbing in Technical details unless it is the current human-facing blocker;
- keep Readiness and Approval Review-class; Approval task count never activates master/detail;
- preserve current/historical document editing and Markdown behavior without allowing historical selection to become mutation authority.

**Dependency:** Units 1–5.

### Unit 7 — Implementation, evidence, result and Context composition

**Files:** `ui/src/ExecutionWorkspace.tsx`, `ui/src/EvidenceViewer.tsx`, `ui/src/TerminalResult.tsx`, `ui/src/WorkItemContext.tsx`, `ui/src/WorkItemWorkspace.tsx`, and required primitives.

Implementation requirements:
- render Implementation as the sole current persistent operational master/detail class: fixed docked master on wide; on medium/narrow use the exact non-modal start-edge `Drawer` master while detail remains primary;
- derive current task owner and validation boundary from current canonical Approval/task/Run/event facts before applying historical selection;
- show sparse current validation state until durable validation evidence exists; do not lead with empty V0–V7 rows;
- render Evidence and terminal Result through their canonical surface/status/resource grammar;
- make Context explicit and closed by default: fixed docked trailing context on wide; end-edge Drawer on medium/narrow; always provide a visible close action and never auto-open from diagnostics;
- keep blockers/current actions out of Context as sole owners.

**Dependency:** Units 1–6.

### Unit 8 — specialist renderer migration and legacy visual-system deletion

**Files:** `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`, `ui/src/theme.css`, `ui/src/styles.css`, all renderer files whose obsolete selectors are removed.

Implementation requirements:
- keep Markdown/Code/evidence and CodeMirror as specialist content mechanics only; map their surfaces/text/focus/selection/search roles to the canonical public theme language;
- preserve exact-source editing, Edit/Preview/Split behavior, dirty-buffer continuity and safe preview contracts;
- remove hex-derived palettes, raw semantic colors, feature-local font scales, arbitrary recurring spacing/radius/control values, obsolete 999/799 structural systems, feature-owned component chrome, duplicate theme mappings, dead side-index/master-detail systems and stylesheet leakage;
- remove compatibility aliases by the final candidate; there is one final visual system, not old plus new;
- do not add `@astryxdesign/cli`, another stylesheet system or another dependency.

**Dependency:** Units 4–7.

### Unit 9 — permanent architecture, state and interaction certification

**Files:** `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/workbench-presentation.test.ts`, `tests/architecture.test.ts`, `tests/e2e-server.ts`.

Complete permanent non-browser certification concurrently with the implementation, then perform the final comprehensive pass.

Required sensors/tests include:
- exhaustive lifecycle transition, turn grammar, required-input, proposal, reach, attention/recovery/execution-owner/validation-boundary and rail projections;
- read-purity and deterministic concurrency/race coverage;
- renderer registry completeness and required primitive-module presence;
- primitive domain/query/policy blindness and same-layer dependency-map registration;
- rejection of feature-level foundation bypass, private Astryx internals, raw semantic values, extra Order stylesheets, count-driven topology, local structural breakpoints and obsolete layout systems;
- selected WorkItem—not queue snapshot—as current observation owner;
- no browser workflow store, DTO/view-model family or persisted derived workflow state.

**Dependency:** Units 1–8. Tests are added alongside each unit; this unit closes all permanent sensors as a set.

### Unit 10 — real-SPA certification, changelog and final gate closure

**Files:** `tests/browser.spec.ts`, `tests/e2e-server.ts`, `CHANGELOG.md`.

Complete the browser matrix required by `GW-FR-227`, component P4 §14 and theme P4 §15, then run the complete signed gate union.

Browser certification must cover:
- all forward/backward lifecycle fixtures and exact rail/current-attention markers;
- required input, proposal decision/adoption interruption, processing, block/retry/resume/reconcile and asynchronous convergence;
- current execution owner independent of historical task/attempt selection;
- Queue/Create/Settings and every WorkItem primary interaction class;
- wide/medium/narrow identity, rail, selector, Approval Review, Implementation master/detail and Context geometry;
- one current workflow feedback/action owner and no duplicate live/error presentation;
- pinned Astryx command/navigation, field, Dialog/Drawer/AlertDialog, table/list/status/notice behavior;
- Light/Dark/System across all representative surfaces, including Markdown/CodeMirror/overlays, with theme switching preserving selection, dirty buffers and workflow state;
- component parity and accessibility/contrast/focus/reduced-motion obligations;
- no page-level horizontal overflow except the intentionally scrollable workflow rail.

Update `[Unreleased]` in `CHANGELOG.md` for the actual runtime/UI implementation. Finish only when `dependency-lock`, `typecheck`, `architecture`, `test`, `build` and `browser` all pass on the complete candidate.

**Dependency:** Units 1–9.

## Requirement/design traceability

| Internal unit | Primary functional authority | Primary technical authority |
|---|---|---|
| 1 | `GW-FR-200`, `GW-FR-204..208`, `GW-FR-228..233` | `GW-TR-082..084`, `GW-TR-087`, `GW-TR-089`, `GW-TR-091`, `GW-TR-097..098` |
| 2 | `GW-FR-201..204`, `GW-FR-207..213`, `GW-FR-228..229` | `GW-TR-083..086`, `GW-TR-088..089`, P6 command/read contracts |
| 3 | `GW-FR-200`, `GW-FR-205..206`, `GW-FR-210`, `GW-FR-226`, `GW-FR-232..233` | `GW-TR-087..091`, `GW-TR-097..098` |
| 4 | `GW-FR-230..231`, `GW-FR-234..235` | `GW-TR-092..103`, `GW-DOC-WORKBENCH-THEME-V1` |
| 5 | preserved Queue/Create/Settings/account requirements plus `GW-FR-230..235` | `GW-TR-092..096`, `GW-TR-099..103` |
| 6 | `GW-FR-214..222`, `GW-FR-225..226`, `GW-FR-230..234` | `GW-TR-090`, `GW-TR-092..098`, `GW-TR-103` |
| 7 | `GW-FR-213..214`, `GW-FR-219`, `GW-FR-223..226`, `GW-FR-230..235` | `GW-TR-089..090`, `GW-TR-092..103` |
| 8 | Markdown/editor preservation requirements plus `GW-FR-231`, `GW-FR-234..235` | `GW-TR-096`, `GW-TR-099..103` |
| 9 | `GW-FR-227..235` and all state acceptance rows | `GW-TR-091..103` |
| 10 | `GW-FR-227` plus the complete signed acceptance set | complete Workbench P4/P6 certification contract |

The signed `acceptanceRefs` below contains every current functional requirement owned by the Workbench, WorkItem-document, Markdown-workbench and installation/readiness surfaces touched by this re-composition, plus the governing lifecycle/local-workbench requirements. This is deliberate preservation coverage: the implementation changes presentation/state ownership without silently dropping existing source/editor/Settings/account behavior.

## Expected change surface

### Core/daemon state and effect owners

- `src/core/lifecycle.ts`
- `src/daemon/runtime.ts`
- `src/daemon/work-item-source.ts`
- `src/daemon/authority.ts`
- `src/daemon/stage.ts`
- `src/daemon/coordinator.ts`
- `src/daemon/execution.ts`

### Browser state, feature renderers, adapters, primitives and styling

- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/workbench-presentation.ts`
- `ui/src/app.tsx`
- `ui/src/OpenCodeAccountControl.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/OpenCodeAccountSettings.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkflowStepFrame.tsx`
- `ui/src/PreSignoffStageWorkspace.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/ActivityComposer.tsx`
- `ui/src/RunEventTimeline.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/MarkdownEditor.tsx`
- `ui/src/MarkdownSourceEditor.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/WorkItemIdentityRow.tsx`
- `ui/src/WorkflowRail.tsx`
- `ui/src/WorkflowMaterialSelector.tsx`
- `ui/src/primitives/WorkbenchAction.tsx`
- `ui/src/primitives/WorkbenchIcon.tsx`
- `ui/src/primitives/WorkbenchLayout.tsx`
- `ui/src/primitives/WorkbenchResourceRow.tsx`
- `ui/src/primitives/WorkbenchState.tsx`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/primitives/WorkbenchUtilityLink.tsx`
- `ui/src/primitives/WorkbenchIdentity.tsx`
- `ui/src/primitives/WorkbenchRail.tsx`
- `ui/src/primitives/WorkbenchSurface.tsx`
- `ui/src/primitives/WorkbenchAttention.tsx`
- `ui/src/primitives/WorkbenchSectionHeader.tsx`
- `ui/src/primitives/WorkbenchSelector.tsx`
- `ui/src/primitives/WorkbenchDialogue.tsx`
- `ui/src/primitives/WorkbenchReview.tsx`
- `ui/src/primitives/WorkbenchMasterDetail.tsx`
- `ui/src/primitives/WorkbenchContextPanel.tsx`
- `ui/src/primitives/WorkbenchTaskPanel.tsx`
- `ui/src/primitives/WorkbenchSettingsLayout.tsx`
- `ui/src/primitives/WorkbenchForm.tsx`
- `ui/src/primitives/WorkbenchField.tsx`
- `ui/src/primitives/WorkbenchStatus.tsx`
- `ui/src/primitives/WorkbenchNotice.tsx`
- `ui/src/primitives/WorkbenchTable.tsx`
- `ui/src/primitives/WorkbenchTimeline.tsx`
- `ui/src/primitives/WorkbenchDisclosure.tsx`
- `ui/src/primitives/WorkbenchConfirmation.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`

### Verification and delivery metadata

- `CHANGELOG.md`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/workbench-presentation.test.ts`
- `tests/architecture.test.ts`
- `tests/browser.spec.ts`
- `tests/e2e-server.ts`

No other production/runtime file is authorized. In particular this plan does **not** authorize changes to `src/core/contracts.ts`, `src/core/execution.ts`, `src/daemon/server.ts`, `package.json`, `bun.lock`, `pontivus-order.toml`, `AGENTS.md` or the canonical P1–P6 design documents. If implementation proves one of those must change semantically, return to the owning design/contract layer.

## Deletions/additions/modifications

### Add

- `ui/src/WorkItemIdentityRow.tsx`
- `ui/src/WorkflowRail.tsx`
- `ui/src/WorkflowMaterialSelector.tsx`
- the 21 missing primitive modules listed in the signed `changeSurface`, completing the 27-primitive vocabulary.

### Modify

- the existing lifecycle/daemon owners listed above to materialize the already-signed state/read/mutation design;
- every current production renderer in the P4 renderer-coverage matrix;
- the six existing Workbench primitive modules;
- `styles.css` / `theme.css` to the canonical ownership model;
- the exact permanent tests/sensors listed above;
- `CHANGELOG.md` under `[Unreleased]`.

### Delete in-place

Remove obsolete code/selectors/imports/branches rather than retaining compatibility paths: ordinal/reach heuristics, active-Run input heuristics, generic side-index topology, content-count layout switching, feature-owned action/form/status/notice/table/dialog/drawer chrome, duplicated workflow feedback, legacy raw/hex palette aliases, duplicate theme blocks, obsolete breakpoints and dead competing layout systems.

No production file deletion is required by the design. If a now-empty superseded file would need deletion, that path must already be in `changeSurface`; otherwise return to PLAN rather than widening scope during execution.

## Validation sequence

1. **Unit 1:** run focused core tests for transition/state/rail derivation, then `typecheck`.
2. **Unit 2:** run focused daemon/read-purity/concurrency tests plus Unit 1 tests.
3. **Unit 3:** run presentation tests and selected browser convergence fixtures.
4. **Unit 4:** run `typecheck`, `architecture` and `build` after creating/registering the complete primitive/module set.
5. **Units 5–8:** after each renderer group, run the affected browser fixtures and architecture sensor; do not defer broken component ownership until final cleanup.
6. **Unit 9:** run complete `core`, `daemon`, presentation and architecture suites; every new module/forbidden-mechanic sensor must be active.
7. **Unit 10:** run the complete Playwright Workbench matrix in both explicit themes and mocked System schemes at wide/medium/narrow widths.
8. **Final candidate:** run the signed gate union exactly: `dependency-lock` → `typecheck` → `architecture` → `test` → `build` → `browser`. No gate is waived because an earlier focused subset passed.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "workbench-v2-runtime-remediation",
      "objective": "Implement the complete closed Workbench V2 workflow-state, daemon-boundary, browser-observation, semantic primitive, Astryx/theme and renderer remediation in the ordered internal units of this PLAN, preserving all existing canonical product behavior outside the explicitly superseded Workbench mechanisms.",
      "dependsOn": [],
      "scope": [
        "CHANGELOG.md",
        "src/core/**",
        "src/daemon/**",
        "ui/**",
        "tests/**"
      ],
      "exclusions": [],
      "acceptanceRefs": [
        "GW-FR-001-GOVERNED-LIFECYCLE",
        "GW-FR-005-LOCAL-WORKBENCH",
        "GW-FR-009-PORTABLE-WORK-ITEM-SOURCE",
        "GW-FR-010-GOVERNED-WORK-KIND-CATALOG",
        "GW-FR-011-VERSIONED-AUTHORING-SCHEMAS",
        "GW-FR-012-CATALOG-DRIVEN-AUTHORING",
        "GW-FR-013-PORTABLE-QUEUE-RECONCILIATION",
        "GW-FR-014-SOURCE-FRESHNESS",
        "GW-FR-015-SOURCE-CONTEXT-PROJECTION",
        "GW-FR-016-SOURCE-CONFORMANCE-IDENTITY",
        "GW-FR-017-SOURCE-SIGNOFF-BINDING",
        "GW-FR-018-SOURCE-CONSUMER-CLOSURE",
        "GW-FR-019-SOURCE-CLARIFICATION-DURABILITY",
        "GW-FR-020-WORKBENCH-SOURCE-OPERATIONS",
        "GW-FR-021-MARKDOWN-WORKSPACE",
        "GW-FR-022-GOVERNED-MARKDOWN-EDITING",
        "GW-FR-023-MARKDOWN-SOURCE-FIDELITY",
        "GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY",
        "GW-FR-025-DURABLE-INTENT-INTERACTION",
        "GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION",
        "GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY",
        "GW-FR-028-NONDELIVERY-TERMINAL-VIEW",
        "GW-FR-029-NO-IDE-SCOPE",
        "GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION",
        "GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT",
        "GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE",
        "GW-FR-063-DOCUMENTATION-GIT-STATUS",
        "GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR",
        "GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES",
        "GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS",
        "GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW",
        "GW-FR-069-EDITOR-STATE-CONTINUITY",
        "GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY",
        "GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY",
        "GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY",
        "GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY",
        "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING",
        "GW-FR-075-OPENCODE-ACCOUNT-LOGIN",
        "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY",
        "GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT",
        "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE",
        "GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS",
        "GW-FR-080-CONFIGURATION-CONTINUITY",
        "GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY",
        "GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY",
        "GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP",
        "GW-FR-088-WORKITEM-METADATA-PRESERVATION",
        "GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR",
        "GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY",
        "GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION",
        "GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION",
        "GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY",
        "GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS",
        "GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION",
        "GW-FR-201-OBSERVATIONAL-READS",
        "GW-FR-202-ATOMIC-COMMAND-OUTCOME",
        "GW-FR-203-SERIALIZED-RUN-TURNS",
        "GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP",
        "GW-FR-205-MONOTONIC-REACH-HISTORY",
        "GW-FR-206-CURRENT-ATTENTION-PRECEDENCE",
        "GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY",
        "GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION",
        "GW-FR-209-SOURCE-BLOCKER-ADMISSION",
        "GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE",
        "GW-FR-211-READINESS-RETURN-CONTINUITY",
        "GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS",
        "GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE",
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
        "GW-FR-235-GLOBAL-THEME-PARITY"
      ],
      "changeSurface": [
        "CHANGELOG.md",
        "src/core/lifecycle.ts",
        "src/daemon/runtime.ts",
        "src/daemon/work-item-source.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/coordinator.ts",
        "src/daemon/execution.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
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
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/primitives/WorkbenchAction.tsx",
        "ui/src/primitives/WorkbenchIcon.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/primitives/WorkbenchState.tsx",
        "ui/src/primitives/WorkbenchToolbar.tsx",
        "ui/src/primitives/WorkbenchUtilityLink.tsx",
        "ui/src/primitives/WorkbenchIdentity.tsx",
        "ui/src/primitives/WorkbenchRail.tsx",
        "ui/src/primitives/WorkbenchSurface.tsx",
        "ui/src/primitives/WorkbenchAttention.tsx",
        "ui/src/primitives/WorkbenchSectionHeader.tsx",
        "ui/src/primitives/WorkbenchSelector.tsx",
        "ui/src/primitives/WorkbenchDialogue.tsx",
        "ui/src/primitives/WorkbenchReview.tsx",
        "ui/src/primitives/WorkbenchMasterDetail.tsx",
        "ui/src/primitives/WorkbenchContextPanel.tsx",
        "ui/src/primitives/WorkbenchTaskPanel.tsx",
        "ui/src/primitives/WorkbenchSettingsLayout.tsx",
        "ui/src/primitives/WorkbenchForm.tsx",
        "ui/src/primitives/WorkbenchField.tsx",
        "ui/src/primitives/WorkbenchStatus.tsx",
        "ui/src/primitives/WorkbenchNotice.tsx",
        "ui/src/primitives/WorkbenchTable.tsx",
        "ui/src/primitives/WorkbenchTimeline.tsx",
        "ui/src/primitives/WorkbenchDisclosure.tsx",
        "ui/src/primitives/WorkbenchConfirmation.tsx",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
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
        "GW-P1-MINIMUM-CHANGE",
        "GW-DOC-MINIMUM-CHANGE-V1",
        "GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1",
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1",
        "GW-DOC-MARKDOWN-WORKBENCH-V1",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V1",
        "GW-DOC-EXTERNAL-FACTS-V1-2026-11-12",
        "GW-DOC-SPECIFICATION-STANDARD-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-TR-082-WORKFLOW-TRANSITION-KERNEL",
        "GW-TR-083-STAGE-RUN-INTERACTION-DERIVATION",
        "GW-TR-084-STAGE-TURN-BATCH-ATOMICITY",
        "GW-TR-085-OBSERVATIONAL-QUERY-BOUNDARY",
        "GW-TR-086-COMMAND-COMMIT-RECHECK",
        "GW-TR-087-MONOTONIC-REACHED-HISTORY-DERIVATION",
        "GW-TR-088-ASYNC-BROWSER-CONVERGENCE",
        "GW-TR-089-CURRENT-ATTENTION-OWNERSHIP",
        "GW-TR-090-STABLE-WORKBENCH-GEOMETRY",
        "GW-TR-091-WORKFLOW-STATE-MACHINE-CERTIFICATION",
        "GW-TR-092-STRUCTURAL-UI-PRIMITIVE-OWNERSHIP",
        "GW-TR-093-UI-PRIMITIVE-STATE-INDEPENDENCE",
        "GW-TR-094-CLOSED-WORKBENCH-SCREEN-COMPOSITION",
        "GW-TR-095-WORKBENCH-RENDERER-COVERAGE",
        "GW-TR-096-CANONICAL-WORKBENCH-VISUAL-LANGUAGE",
        "GW-TR-097-CLOSED-WORKFLOW-STATE-ALGEBRA",
        "GW-TR-098-CANONICAL-WORKFLOW-RAIL-PROJECTION",
        "GW-TR-099-CANONICAL-THEME-TOKEN-OWNERSHIP",
        "GW-TR-100-GLOBAL-THEME-ACTIVATION-AND-PARITY",
        "GW-TR-101-COMPONENT-VISUAL-PARITY",
        "GW-TR-102-THEME-STYLESHEET-GOVERNANCE",
        "GW-TR-103-ASTRYX-FOUNDATION-CONFORMANCE"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "ui",
        "verification"
      ]
    }
  ]
}
```
