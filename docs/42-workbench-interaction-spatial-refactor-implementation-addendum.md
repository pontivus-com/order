# 42 — Workbench interaction-pattern and spatial-efficiency implementation addendum

**Status:** Completed P7 implementation-provenance record — the public Order workbench interaction-pattern/spatial-efficiency refactor is implemented on `master`; permanent architecture, certification, unit, build and Chromium browser gates passed on the final implementation candidate, and the only subsequent tree change removed temporary verification scaffolding.  
**Target repository:** `pontivus-com/order`  
**Pyramid layer:** P7 implementation plan / completed implementation provenance  
**Implementation baseline:** `8171c695a11d4483f7b9657974136bdb88db463a`  
**Verified candidate:** `5e5e499334514668eb08b25335dafa70e0ba4a0c`  
**Final public master after verification-scaffolding removal:** `a360734ad18c6c3e7e4c39ae2ada7f7639fdbf63`  
**Verification run:** GitHub Actions run `43219520936` — completed successfully.  
**Purpose:** record the exact P7 implementation package that realized the interaction-pattern, spatial-efficiency and UI-architecture requirements added by `GW-FR-043` through `GW-FR-050` and `GW-TR-015` through `GW-TR-026`.

This document is **completed implementation provenance**, not a new standing semantic authority and not authorization to repeat or broaden the refactor. The governing P3/P4 meaning remains owned by `GW-DOC-WORKBENCH-UX-V1` and `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`.

## 1. Governing authority

This implementation package realizes, and does not redefine:

### P1

- `GW-P1-FCIS`;
- `GW-P1-SOC`;
- `GW-P1-DRY`;
- `GW-P1-STRICT-TYPING`;
- `GW-P1-CANONICAL-OWNERSHIP`;
- `GW-P1-EXPLICIT-FLOW`;
- `GW-P1-MINIMUM-CHANGE`;
- `GW-P1-DOC-CANONICALITY`.

### P3 functional requirements

- `GW-FR-043-INTERACTION-PATTERN-CONSISTENCY`;
- `GW-FR-044-PRIMARY-CANVAS-SPACE-EFFICIENCY`;
- `GW-FR-045-NAVIGATION-CHROME-ECONOMY`;
- `GW-FR-046-SCOPE-LOCAL-CONTROLS`;
- `GW-FR-047-REVIEW-MATERIAL-PROMOTION`;
- `GW-FR-048-EXECUTION-MASTER-DETAIL-EFFICIENCY`;
- `GW-FR-049-RESPONSIVE-QUEUE-EFFICIENCY`;
- `GW-FR-050-SHARED-ACTION-RESOURCE-GRAMMAR`.

### P4 technical requirements

- `GW-TR-015-PRIMARY-CANVAS-FLEX-SIZING`;
- `GW-TR-016-COMPACT-WORKITEM-NAVIGATION`;
- `GW-TR-017-STATE-AWARE-TOOLBAR-COMPOSITION`;
- `GW-TR-018-PROPOSAL-REVIEW-PRIMARY-SURFACE`;
- `GW-TR-019-EXECUTION-MASTER-DETAIL-LAYOUT`;
- `GW-TR-020-RESPONSIVE-QUEUE-COMPOSITION`;
- `GW-TR-021-SHARED-ACTION-RESOURCE-PRESENTATION`;
- `GW-TR-022-GEOMETRY-REGRESSION-CERTIFICATION`;
- `GW-TR-023-UI-SEPARATION-OF-CONCERNS`;
- `GW-TR-024-UI-CANONICAL-SEMANTIC-OWNERSHIP`;
- `GW-TR-025-UI-STRICT-TYPED-BOUNDARIES`;
- `GW-TR-026-UI-LOOSE-COUPLING-DEPENDENCY-DIRECTION`.

### Governing documents

- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
- `GW-DOC-SPECIFICATION-STANDARD-V1`;
- `GW-DOC-VALIDATION-STANDARD-V1`;
- `GW-DOC-MINIMUM-CHANGE-V1`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`;
- `GW-DOC-CANONICAL-CONTRACTS-V1`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- `GW-DOC-WORKBENCH-UX-V1`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`.

## 2. Proven implementation baseline

At baseline `8171c695a11d4483f7b9657974136bdb88db463a`, the canonical P3/P4 addenda and UI architecture rules were present, but the implementation still contained the concrete deficiencies those authorities required the refactor to remove:

- editable Markdown was constrained by a page-like outer width and fixed/minimum-height strategy;
- WorkItem mode navigation and governed-document navigation consumed stacked full-width navigation rows;
- queue search/source refresh and low-frequency appearance controls occupied persistent shell space during deep WorkItem work;
- Context remained exposed as an action even when the wide persistent context rail was already present;
- artifact proposal review remained materially constrained by the Dialogue/chat presentation;
- Execution used vertical task-card accumulation before Run/event inspection rather than a bounded operational master/detail workspace;
- queue presentation retained desktop-column assumptions under constrained widths;
- evidence/artifact references and actions had inconsistent screen-local presentation;
- active-Run classification, presentation selections and query/cache identities had duplicated owners;
- UI architecture fitness tests did not yet mechanically enforce the full SoC/DRY/strict-typing/loose-coupling contract.

The package therefore required a **presentation-layer refactor**, not a lifecycle/domain/API redesign.

## 3. Execution representation

The refactor was cumulative: shell/navigation changes, shared presentation ownership and workspace geometry were prerequisites for later proposal/execution/browser work.

Under the canonical execution contract, dependent candidate bytes are not represented as separate materialized ExecutionTasks. Therefore this record contains:

- one cumulative canonical machine task: `WORKBENCH-PATTERNS-T1`;
- eight ordered internal implementation phases: `I1` through `I8`.

The internal phases are not independent ExecutionTasks.

```text
I1 canonical UI presentation ownership + architecture sensors
        |
        v
I2 primary-canvas sizing + document authoring
        |
        v
I3 compact shell/navigation + scope-local toolbar/context
        |
        +----------------+
        v                v
I4 proposal/review     I5 execution/resource
        |                |
        +--------+-------+
                 v
          I6 responsive queue
                 |
                 v
          I7 state-shell/action consistency
                 |
                 v
          I8 geometry + full certification
```

## 4. Internal implementation phases

### I1 — Canonical UI presentation ownership and architecture fitness

**Objective:** remove concrete semantic duplication/coupling first and make the P1/P4 UI rules mechanically enforceable before completing the spatial refactor.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-050`;
- `GW-TR-021`;
- `GW-TR-023`;
- `GW-TR-024`;
- `GW-TR-025`;
- `GW-TR-026`.

**Implemented work:**

1. Added `ui/src/workbench-presentation.ts` as the one pure presentation-policy owner for:
   - `WorkItemMode`;
   - `EvidenceSelection`;
   - `ProposalSelection`;
   - active-Run projection;
   - initial WorkItem mode projection;
   - mode type guard/label;
   - proposal-disposition projection;
   - lifecycle-artifact role ordering.
2. Removed duplicated active-Run status sets from WorkItem, Dialogue, Execution and Context surfaces.
3. Removed sibling ownership of `EvidenceSelection`; workspace siblings no longer import a presentation type from `EvidenceViewer`.
4. Added `ui/src/query-keys.ts` as the canonical typed TanStack Query/cache identity owner.
5. Replaced repeated literal query/invalidation keys throughout the workbench.
6. Preserved canonical evidence-path typing at the presentation-selection boundary.
7. Extended `tests/architecture.test.ts` to enforce:
   - no UI `any`;
   - no unchecked semantic type assertions;
   - no DTO/ViewModel families;
   - browser transport remains owned by `ui/src/http.ts`;
   - no second UI state-store dependency;
   - primitive-to-workspace/application dependency inversion is prohibited;
   - substantive workspace siblings do not coordinate through internal imports;
   - the UI dependency graph is acyclic;
   - shared presentation policies retain one owner;
   - query keys retain one owner;
   - repeated action grammar does not drift back to raw screen-local mutations.

**Actual production surface:**

- `ui/src/workbench-presentation.ts` — added;
- `ui/src/query-keys.ts` — added;
- `ui/src/WorkItemWorkspace.tsx`;
- `ui/src/WorkItemContext.tsx`;
- `ui/src/StageDialogue.tsx`;
- `ui/src/ExecutionWorkspace.tsx`;
- `ui/src/EvidenceViewer.tsx`;
- `ui/src/DocumentWorkspace.tsx`;
- `ui/src/TerminalResult.tsx`.

**Verification surface:**

- `tests/architecture.test.ts`.

### I2 — Primary-canvas sizing and governed-document authoring

**Objective:** make editable Markdown a genuine primary work surface that consumes the available canvas while preserving readable inner width only for prose.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-044`;
- `GW-FR-045`;
- `GW-TR-015`;
- `GW-TR-022`;
- `GW-TR-023`;
- `GW-TR-025`.

**Implemented work:**

1. Removed the effective editable-workspace `72rem` outer authoring constraint.
2. Reworked the WorkItem/mode/document shell to use bounded viewport flex/grid ownership with `min-width: 0` / `min-height: 0`.
3. Made the actual Astryx `TextArea` Field and native textarea consume the remaining document-canvas height rather than relying on a fixed `34rem` minimum.
4. Kept read-only rendered Markdown prose at a readable inner measure while leaving the outer workspace full-canvas.
5. Added a compact sticky editor action bar with:
   - dirty/current state;
   - Save;
   - Cancel;
   - conflict/reload behavior.
6. Demoted exact SHA-256 identity to a secondary disclosure instead of dominant heading chrome.
7. Corrected save/refetch ordering so a successful save and immediate canonical query invalidation cannot be misclassified as an external conflict or leave parent dirty state stale.
8. Removed hard-coded evidence/result viewport-height calculations where flex ownership now supplies the correct available height.

**Actual production surface:**

- `ui/src/MarkdownEditor.tsx`;
- `ui/src/DocumentWorkspace.tsx`;
- `ui/src/EvidenceViewer.tsx`;
- `ui/src/TerminalResult.tsx`;
- `ui/src/theme.css`.

**Verification surface:**

- `tests/browser.spec.ts` geometry and save/conflict regressions.

### I3 — Compact WorkItem navigation and state-aware shell controls

**Objective:** eliminate redundant navigation/chrome and ensure persistent shell controls act on the currently visible surface.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-045`;
- `GW-FR-046`;
- `GW-TR-016`;
- `GW-TR-017`;
- `GW-TR-022`;
- `GW-TR-026`.

**Implemented work:**

1. Replaced the separate full-width WorkItem mode TabList with a compact typed mode control in the WorkItem header.
2. Retained Source/R1/R2/DESIGN/PLAN/R3 as the one normal content-edge navigation strip in Documents.
3. Compressed the WorkItem header to orientation-critical title/stage/status information.
4. Removed duplicate project metadata from the primary header; detailed metadata remains in Context.
5. Exported the existing wide-workbench presentation state from `WorkbenchLayout` so the Context action is shown only when Context is drawer-owned.
6. Made application-toolbar composition state-aware:
   - Search and Refresh sources remain queue-scoped;
   - deep WorkItem work does not show queue-only controls;
   - New WorkItem remains reachable but compacts during deep work;
   - appearance remains System/Light/Dark but uses a compact utility control rather than a persistent wide segmented control.
7. Preserved dirty-navigation admission, browser history and presentation-only mode state.

**Actual production surface:**

- `ui/src/app.tsx`;
- `ui/src/WorkItemWorkspace.tsx`;
- `ui/src/primitives/WorkbenchLayout.tsx`;
- `ui/src/theme.css`.

**Verification surface:**

- `tests/browser.spec.ts`.

### I4 — Proposal promotion and compact sign-off review

**Objective:** separate conversation context from substantive review material and give structural review content Review-class primary space.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-047`;
- `GW-FR-050`;
- `GW-TR-018`;
- `GW-TR-021`;
- `GW-TR-022`;
- `GW-TR-023`;
- `GW-TR-026`.

**Implemented work:**

1. Added `ui/src/ProposalReview.tsx` as the substantive proposal-review owner.
2. Dialogue now records proposal context/rationale and exposes a **Review proposal** action; the full diff is no longer trapped inside a chat bubble.
3. Proposal selection is a small typed browser-local presentation state coordinated through `WorkItemWorkspace`.
4. Proposal Review presents:
   - target identity;
   - rationale;
   - full-width diff;
   - persisted disposition;
   - explicit Adopt/Reject actions using existing mutation boundaries.
5. Sign-off package identity moved from large card/grid treatment to a compact metadata definition list.
6. Signed tasks moved from permanently expanded stacked cards to compact expandable task review.
7. Existing sign-off package/currentness semantics and Context approval action remain unchanged.

**Actual production surface:**

- `ui/src/ProposalReview.tsx` — added;
- `ui/src/StageDialogue.tsx`;
- `ui/src/WorkItemWorkspace.tsx`;
- `ui/src/SignoffReview.tsx`;
- `ui/src/workbench-presentation.ts`;
- `ui/src/theme.css`.

**Verification surface:**

- `tests/browser.spec.ts`;
- `tests/architecture.test.ts`.

### I5 — Execution master/detail and shared resource presentation

**Objective:** make Execution a bounded operational inspection workspace rather than a vertical sequence of task cards, Runs and loose artifact buttons.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-048`;
- `GW-FR-050`;
- `GW-TR-019`;
- `GW-TR-021`;
- `GW-TR-022`;
- `GW-TR-023`;
- `GW-TR-026`.

**Implemented work:**

1. Added compact task selection/master presentation.
2. Scoped Runs to the selected task where the canonical Run carries an execution-task identity.
3. Added selected task detail without repeating every task as a large vertical card.
4. Preserved chronological RunEvent detail as the flexible remaining-height operational region.
5. Added `ui/src/primitives/WorkbenchResourceRow.tsx` as the shared semantic resource-row owner.
6. Replaced loose evidence/artifact action collections with structured resource rows.
7. Kept Evidence transitions presentation-only; daemon task/Run state remains owned by canonical server state.
8. Retained native buttons only for genuine selectable task/run master rows; substantive mutations/navigation use the shared action grammar.

**Actual production surface:**

- `ui/src/ExecutionWorkspace.tsx`;
- `ui/src/primitives/WorkbenchResourceRow.tsx` — added;
- `ui/src/theme.css`.

**Verification surface:**

- `tests/browser.spec.ts`;
- `tests/architecture.test.ts`;
- `tests/certification.test.ts`.

### I6 — Responsive queue composition

**Objective:** preserve queue scanability on constrained widths without clipping essential meaning or forcing desktop six-column geometry.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-049`;
- `GW-TR-020`;
- `GW-TR-022`.

**Implemented work:**

1. Preserved the wide operational table.
2. Added explicit responsive priority classes for secondary, stage and status columns.
3. Added compact secondary metadata inside the dominant WorkItem cell for narrow/tablet layouts.
4. Kept title dominant and stage/status immediately available on narrow layouts.
5. Removed queue clipping as the responsive strategy; the queue can overflow safely where required while lower-priority columns recompose/hide deliberately.
6. Preserved row activation and row-local utility behavior.

**Actual production surface:**

- `ui/src/WorkItemQueue.tsx`;
- `ui/src/theme.css`.

**Verification surface:**

- `tests/browser.spec.ts`.

### I7 — Shared action grammar and stable workspace shells

**Objective:** close residual presentation inconsistency and ensure loading/error states retain the geometry of the interaction class they belong to.

**Requirement traceability:**

- `GW-FR-043`;
- `GW-FR-044`;
- `GW-FR-050`;
- `GW-TR-015`;
- `GW-TR-021`;
- `GW-TR-022`;
- `GW-TR-023`;
- `GW-TR-024`;
- `GW-TR-025`;
- `GW-TR-026`.

**Implemented work:**

1. Routed remaining substantive document/sign-off actions through `WorkbenchAction`.
2. Kept raw native buttons only for deliberate selectable operational rows.
3. Preserved Dialogue, Evidence, Sign-off Review and other substantive mode shells while loading/error/empty content changes.
4. Consolidated repeated proposal-disposition and lifecycle-artifact ordering projections into `workbench-presentation.ts`.
5. Preserved exact canonical types through presentation boundaries instead of introducing DTO/view-model shapes.

**Actual production surface:**

- `ui/src/DocumentWorkspace.tsx`;
- `ui/src/SignoffReview.tsx`;
- `ui/src/StageDialogue.tsx`;
- `ui/src/EvidenceViewer.tsx`;
- `ui/src/ProposalReview.tsx`;
- `ui/src/TerminalResult.tsx`;
- `ui/src/workbench-presentation.ts`.

**Verification surface:**

- `tests/architecture.test.ts`;
- `tests/browser.spec.ts`.

### I8 — Geometry regression certification and final closure

**Objective:** prove the refactor by observable behavior/geometry and certify that the final implementation preserves all existing non-UX contracts.

**Requirement traceability:**

- `GW-FR-043` through `GW-FR-050`;
- `GW-TR-015` through `GW-TR-026`.

**Implemented verification work:**

1. Added browser geometry assertions proving:
   - editable Markdown width tracks the primary canvas;
   - the actual textarea consumes substantial remaining workspace height;
   - Save remains reachable;
   - Documents no longer has stacked full-width mode/document tab bars;
   - queue Search/Refresh are absent in deep-work state;
   - Context action is absent when the persistent wide rail is visible and present when drawer-owned;
   - proposal diff review occupies Review-class primary width;
   - responsive queue rows expose compact stage/status metadata;
   - Execution task master and selected detail share the bounded operational workspace;
   - primary mode geometry remains present during delayed document loading.
2. Extended architecture fitness for the new production owners and dependency rules.
3. Updated certification to include the intentionally added `WorkbenchResourceRow` primitive while retaining the narrow local/Astryx boundary.
4. Preserved all pre-existing semantic browser regressions for:
   - theme persistence/system following;
   - URL/history/focus;
   - dirty Markdown navigation;
   - source stale-write protection;
   - R3 read-only behavior;
   - invalid lifecycle bytes;
   - terminal outcomes;
   - candidate V0–V7/evidence/XSS safety.

**Actual verification surface:**

- `tests/architecture.test.ts`;
- `tests/certification.test.ts`;
- `tests/browser.spec.ts`.

## 5. Requirement-to-phase coverage matrix

| Requirement | Owning implementation phase(s) | Principal implementation evidence | Permanent verification evidence |
|---|---|---|---|
| `GW-FR-043-INTERACTION-PATTERN-CONSISTENCY` | I1–I7 | shared presentation owner; compact shell; Review promotion; Execution master/detail; responsive queue; shared resource/action grammar | architecture + browser |
| `GW-FR-044-PRIMARY-CANVAS-SPACE-EFFICIENCY` | I2, I7 | flexing WorkItem/document/evidence shells; full-canvas editor; compact result/review chrome | browser geometry |
| `GW-FR-045-NAVIGATION-CHROME-ECONOMY` | I2, I3 | compact WorkItem mode control; single Documents content-edge navigation; compressed header | browser |
| `GW-FR-046-SCOPE-LOCAL-CONTROLS` | I3 | state-aware toolbar; queue-only Search/Refresh; responsive Context action; compact theme utility | browser |
| `GW-FR-047-REVIEW-MATERIAL-PROMOTION` | I4 | `ProposalReview.tsx`; Dialogue review entry; compact sign-off metadata/tasks | browser |
| `GW-FR-048-EXECUTION-MASTER-DETAIL-EFFICIENCY` | I5 | task master + Run master + selected detail/event region | browser |
| `GW-FR-049-RESPONSIVE-QUEUE-EFFICIENCY` | I6 | responsive column priority + narrow-cell metadata + non-clipping queue | browser |
| `GW-FR-050-SHARED-ACTION-RESOURCE-GRAMMAR` | I1, I4, I5, I7 | `WorkbenchAction`; `WorkbenchResourceRow`; architecture prohibition on action drift | architecture + certification + browser |
| `GW-TR-015-PRIMARY-CANVAS-FLEX-SIZING` | I2, I7 | viewport/flex ownership; actual Astryx TextArea Field sizing; evidence/result flex behavior | browser geometry |
| `GW-TR-016-COMPACT-WORKITEM-NAVIGATION` | I3 | mode control integrated into WorkItem header; document nav remains within Documents | browser |
| `GW-TR-017-STATE-AWARE-TOOLBAR-COMPOSITION` | I3 | queue-vs-WorkItem toolbar projection in `app.tsx` | browser |
| `GW-TR-018-PROPOSAL-REVIEW-PRIMARY-SURFACE` | I4 | typed proposal selection + `ProposalReview.tsx` full primary diff | browser |
| `GW-TR-019-EXECUTION-MASTER-DETAIL-LAYOUT` | I5 | bounded task/Run masters and flexible selected detail/event region | browser |
| `GW-TR-020-RESPONSIVE-QUEUE-COMPOSITION` | I6 | deliberate desktop/tablet/narrow queue recomposition | browser |
| `GW-TR-021-SHARED-ACTION-RESOURCE-PRESENTATION` | I1, I4, I5, I7 | `WorkbenchAction`; `WorkbenchResourceRow`; raw-action fitness rule | architecture + certification |
| `GW-TR-022-GEOMETRY-REGRESSION-CERTIFICATION` | I8 | permanent bounding-box/visibility assertions across wide/narrow workbench states | browser |
| `GW-TR-023-UI-SEPARATION-OF-CONCERNS` | I1, I4, I5, I7 | new cohesive ProposalReview/resource/presentation/query-key owners; composition remains in shell owners | architecture |
| `GW-TR-024-UI-CANONICAL-SEMANTIC-OWNERSHIP` | I1, I7 | shared presentation projections; canonical query keys; no duplicate daemon-state ownership | architecture |
| `GW-TR-025-UI-STRICT-TYPED-BOUNDARIES` | I1, I2, I4, I7 | typed presentation unions/IDs; canonical EvidencePath; typed event narrowing | typecheck + architecture |
| `GW-TR-026-UI-LOOSE-COUPLING-DEPENDENCY-DIRECTION` | I1, I3, I4, I5, I7 | typed upward callbacks/selections; no sibling internal-state coordination; no second store | architecture |

Every requirement in the requested P3/P4 addendum has at least one implementing phase and permanent verification owner. No requirement is left as documentation-only guidance.

## 6. Actual final implementation change surface

The repository comparison from implementation baseline `8171c695a11d4483f7b9657974136bdb88db463a` to final public master `a360734ad18c6c3e7e4c39ae2ada7f7639fdbf63` contains the following retained production/test changes:

### Production

```text
ui/src/app.tsx
ui/src/DocumentWorkspace.tsx
ui/src/EvidenceViewer.tsx
ui/src/ExecutionWorkspace.tsx
ui/src/MarkdownEditor.tsx
ui/src/ProposalReview.tsx                 (new)
ui/src/SignoffReview.tsx
ui/src/StageDialogue.tsx
ui/src/TerminalResult.tsx
ui/src/WorkItemContext.tsx
ui/src/WorkItemQueue.tsx
ui/src/WorkItemWorkspace.tsx
ui/src/primitives/WorkbenchLayout.tsx
ui/src/primitives/WorkbenchResourceRow.tsx (new)
ui/src/query-keys.ts                       (new)
ui/src/theme.css
ui/src/workbench-presentation.ts           (new)
```

### Verification

```text
tests/architecture.test.ts
tests/browser.spec.ts
tests/certification.test.ts
```

The final tree contains no retained temporary verification workflow.

## 7. Explicit non-change surface

The refactor did **not** require or introduce changes to:

```text
src/core/**
src/shell/**
src/daemon/**
src/cli.ts
src/installer.ts
ui/src/http.ts
database schema
HTTP contracts
WorkItem lifecycle/state contracts
Approval/ExecutionTask/Run persistence semantics
provider/OpenCode behavior
router
second/global browser state store
rich-text/AST authority
WebSocket/SSE/provider-token streaming
new runtime dependency
generic design-system abstraction layer
DTO/view-model family
service/repository/controller architecture
```

The refactor remained presentation-layer work plus permanent verification sensors.

## 8. Architecture and minimum-change closure

The completed implementation satisfies the architecture/minimum-change constraints as follows:

- **SoC:** substantive interaction classes have cohesive owners; the new proposal-review responsibility received its own module rather than expanding Dialogue into a mixed conversation/review catch-all.
- **Semantic DRY/canonical ownership:** active-Run projection, proposal disposition, lifecycle artifact ordering and query identities each have one presentation owner; no duplicate WorkItem/Run/task DTO or server-state cache was created.
- **Strict typing:** new presentation selections use explicit canonical IDs/tagged unions; EvidencePath remains canonical; event payloads are narrowed by discriminant; permanent tests reject `any` and unchecked semantic assertions.
- **Loose coupling:** sibling workspaces navigate through typed callbacks/state at the composition boundary; primitives do not import substantive workspaces; server state remains in TanStack Query.
- **Minimum change:** no core/shell/daemon/API/schema/dependency expansion occurred. New modules exist only where a distinct presentation responsibility or repeated stable presentation semantic required one owner.

## 9. Verification evidence

### 9.1 Successful candidate

The complete verification suite passed on:

```text
candidate commit:
5e5e499334514668eb08b25335dafa70e0ba4a0c

GitHub Actions run:
43219520936

result:
completed / success
```

The run executed the repository's governed gates from one candidate tree:

```text
bun ci
bun run tsc --noEmit
node node_modules/vitest/vitest.mjs run tests/architecture.test.ts
node node_modules/vitest/vitest.mjs run tests/certification.test.ts
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build
node node_modules/@playwright/test/cli.js test
```

All passed.

### 9.2 Browser evidence included in the successful run

The permanent Chromium suite proved, among existing semantic regressions:

- wide primary-canvas geometry;
- actual Markdown textarea width/height use;
- reachable sticky Save action;
- single Documents content-edge tab strip rather than stacked full-width mode/document tabs;
- queue Search/Refresh absence during selected-WorkItem deep work;
- wide persistent Context without a meaningless Context button;
- drawer-owned Context at constrained widths;
- delayed document loading preserves workspace geometry;
- proposal review opens into primary Review-class space with full-width diff and explicit Adopt/Reject;
- responsive queue metadata remains visible at narrow width;
- Execution task master and selected detail remain spatially adjacent;
- source stale-write protection and Save/Cancel semantics remain correct;
- R3 read-only and invalid-byte inspection behavior remains correct;
- candidate V0–V7/evidence and raw-evidence XSS regressions remain correct.

### 9.3 Final-tree equivalence

After the successful candidate run, the only subsequent commit was:

```text
a360734ad18c6c3e7e4c39ae2ada7f7639fdbf63
Remove temporary workbench refactor verification
```

The comparison:

```text
5e5e499334514668eb08b25335dafa70e0ba4a0c
...
a360734ad18c6c3e7e4c39ae2ada7f7639fdbf63
```

contains exactly one file change:

```text
.github/workflows/temp-workbench-refactor-verify.yml — removed
```

No production source or permanent test changed after the successful verification run. Therefore the successful run is valid P8 evidence for the retained final implementation tree, and the final tree additionally satisfies the no-temporary-scaffolding requirement.

## 10. Verification-discovered defects and remediation

Verification was used as a real implementation feedback boundary rather than as a final ceremonial pass.

The following defects were exposed and corrected before the successful candidate:

1. **Typed proposal payload narrowing**
   - TypeScript rejected direct access to proposal-specific fields through a broad RunEvent union.
   - The implementation was corrected to narrow the discriminated payload before use.

2. **Certification owner list**
   - the permanent certification sensor correctly rejected the new `WorkbenchResourceRow` until it was explicitly added to the narrow local semantic primitive boundary.

3. **Markdown textarea geometry**
   - browser geometry proved the editor wrapper filled the canvas while the actual Astryx Field/native textarea remained intrinsic-height.
   - the implementation was corrected at the actual Field/container/control boundary; the test was not weakened.

4. **Execution assertion ownership**
   - master/detail introduced two visible task identities by design.
   - browser assertions were corrected to the selected-detail owner rather than relying on an ambiguous global text locator.

5. **Markdown save/refetch race**
   - browser verification exposed that successful save plus immediate canonical query invalidation could be interpreted as a stale external change.
   - the editor now suppresses canonical-source conflict comparison while its own save is active and clears parent dirty state synchronously on successful save/cancel/reload.

These corrections are part of the verified candidate above.

## 11. Open-question and deviation ledger

### Open blocking questions

None.

### Architecture questions

None.

### Authority conflicts

None.

### Deviations from the P3/P4 design

None known.

### Scope expansion

None into core, shell, daemon, persistence, HTTP, provider or lifecycle semantics.

### New production concepts

Only presentation-owned concepts required by the approved design:

- `ProposalReview`;
- `WorkbenchResourceRow`;
- typed `workbench-presentation` owner;
- typed `query-keys` owner.

They do not create parallel domain semantics.

## 12. Completion verdict

The P7 package is complete.

The final implementation provides:

```text
state-aware application shell
        ↓
compact selected-WorkItem header/mode navigation
        ↓
one dominant primary interaction surface
  Documents — full-canvas authoring/reading
  Dialogue  — conversation + proposal entry
  Review    — sign-off/proposal structural review
  Execution — task/run/event master-detail
  Evidence  — full raw-material inspection
  Result    — compact outcome + substantive material
        +
compact Context rail/drawer
        ↓
responsive queue + shared action/resource grammar
        ↓
SoC / DRY / strict typing / loose-coupling fitness sensors
        ↓
permanent geometry + semantic browser regressions
```

The implementation is not merely visually changed; the recurring interaction classes now have consistent spatial owners and the architecture constraints are mechanically protected against regression.

## 13. Canonical task record

The cumulative implementation is represented as one task because the internal phases depend on the same evolving candidate workspace.

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "WORKBENCH-PATTERNS-T1",
      "objective": "Refactor the public Order workbench so canonical interaction classes use space-efficient consistent primary-canvas patterns, while enforcing UI separation of concerns, semantic DRY, strict typing and loose coupling without changing domain, lifecycle, persistence or HTTP semantics.",
      "dependsOn": [],
      "scope": [
        "ui/src/app.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/StageDialogue.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/query-keys.ts",
        "ui/src/theme.css",
        "ui/src/workbench-presentation.ts",
        "tests/architecture.test.ts",
        "tests/browser.spec.ts",
        "tests/certification.test.ts"
      ],
      "exclusions": [
        "src/core/**",
        "src/shell/**",
        "src/daemon/**",
        "src/cli.ts",
        "src/installer.ts",
        "ui/src/http.ts",
        "docs/**",
        "database schema",
        "HTTP/domain/lifecycle contract changes",
        "provider/OpenCode behavior",
        "router/global browser state store",
        "rich-text/AST authority",
        "WebSocket/SSE/provider-token streaming",
        "new runtime dependencies",
        "generic design-system abstraction layer",
        "DTO/view-model/service/repository/controller architecture"
      ],
      "acceptanceRefs": [
        "GW-FR-043-INTERACTION-PATTERN-CONSISTENCY",
        "GW-FR-044-PRIMARY-CANVAS-SPACE-EFFICIENCY",
        "GW-FR-045-NAVIGATION-CHROME-ECONOMY",
        "GW-FR-046-SCOPE-LOCAL-CONTROLS",
        "GW-FR-047-REVIEW-MATERIAL-PROMOTION",
        "GW-FR-048-EXECUTION-MASTER-DETAIL-EFFICIENCY",
        "GW-FR-049-RESPONSIVE-QUEUE-EFFICIENCY",
        "GW-FR-050-SHARED-ACTION-RESOURCE-GRAMMAR",
        "GW-TR-015-PRIMARY-CANVAS-FLEX-SIZING",
        "GW-TR-016-COMPACT-WORKITEM-NAVIGATION",
        "GW-TR-017-STATE-AWARE-TOOLBAR-COMPOSITION",
        "GW-TR-018-PROPOSAL-REVIEW-PRIMARY-SURFACE",
        "GW-TR-019-EXECUTION-MASTER-DETAIL-LAYOUT",
        "GW-TR-020-RESPONSIVE-QUEUE-COMPOSITION",
        "GW-TR-021-SHARED-ACTION-RESOURCE-PRESENTATION",
        "GW-TR-022-GEOMETRY-REGRESSION-CERTIFICATION",
        "GW-TR-023-UI-SEPARATION-OF-CONCERNS",
        "GW-TR-024-UI-CANONICAL-SEMANTIC-OWNERSHIP",
        "GW-TR-025-UI-STRICT-TYPED-BOUNDARIES",
        "GW-TR-026-UI-LOOSE-COUPLING-DEPENDENCY-DIRECTION"
      ],
      "changeSurface": [
        "ui/src/app.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/StageDialogue.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/query-keys.ts",
        "ui/src/theme.css",
        "ui/src/workbench-presentation.ts",
        "tests/architecture.test.ts",
        "tests/browser.spec.ts",
        "tests/certification.test.ts"
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
        "GW-DOC-SPECIFICATION-STANDARD-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-MINIMUM-CHANGE-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V1",
        "GW-DOC-MARKDOWN-WORKBENCH-V1",
        "GW-DOC-WORKBENCH-UX-V1",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    }
  ]
}
```
