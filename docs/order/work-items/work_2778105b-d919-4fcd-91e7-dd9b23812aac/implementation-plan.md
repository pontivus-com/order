<!-- Order template: delivery-plan-v1; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V1 -->

# Order 0.5.0 integrated workflow task experience — implementation plan

**Status:** IMPLEMENTATION REOPENED — P1/P2 preserve as done; P3-P6 incomplete; P7 not complete; candidate readiness rejected  
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

The single task contains seven ordered implementation phases. Each phase exists because it either changes a distinct semantic/UI layer or catches a defect class before later work compounds it.

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

For every reference assigned to a UI phase, render the corresponding state through the real SPA/e2e path and compare the implemented outcome directly against the approved SVG.

The comparison is intentionally lightweight:

- a clean match needs only the reference, runtime scenario and actual screenshot/result;
- a variance/failure additionally records the exact mismatch and required correction;
- no current-UI screenshot or before/after comparison is required;
- no separate review document is created for each reference.

C3-C6 are implementation feedback checkpoints, not independent review stages. The builder fixes obvious mismatches immediately. Human/design escalation is required only when the implementation/reference comparison is genuinely ambiguous or appears to expose a design contradiction.

The final C7 pass renders the complete 41-reference inventory from the final integrated candidate. That final comparison set is the visual evidence supplied to canonical V4 independent review. Intermediate C3-C6 screenshots may remain ordinary test artifacts and do not require a durable evidence bundle unless they document a failure that must be handed off.

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

Every C3-C6 failure must identify the reference/state that failed, the concrete mismatch, and the owning implementation surface. Record more detail only when it is needed to hand the defect to another worker or to resolve an ambiguous design contradiction.

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

| Phase | Purpose | Hard checkpoint | Current implementation status |
|---|---|---|---|
| P1 | core contracts and pure workflow semantics | C1 semantic-kernel closure | **DONE — preserve** |
| P2 | daemon/OpenCode/control-plane realization | C2 producer→carrier→consumer closure | **DONE — preserve; rerun regression gates after later UI work** |
| P3 | shared Workbench interaction foundation | C3 foundation visual conformance | **BLOCKED — §6.5 structural UI/styling recovery prerequisite required before further reference-driven correction; C3 prior PASS invalid** |
| P4 | Work request through Readiness | C4 pre-signoff visual conformance | **PARTIAL — major UI/reference work outstanding; C4 prior PASS invalid; phase reopened** |
| P5 | Approval, Implementation and Complete | C5 post-signoff visual conformance | **PARTIAL — major UI/reference work outstanding; C5 prior PASS invalid; phase reopened** |
| P6 | Queue/Create/Settings/Context/Evidence/application services | C6 application-surface visual conformance | **LARGELY NOT DONE — C6 prior PASS invalid; phase reopened** |
| P7 | application-wide integration, deletion and permanent certification | C7 complete 41-reference conformance | **NOT DONE — C7 not established; candidate readiness rejected** |

No phase may be marked complete while its checkpoint is FAIL, invalid, unproven or superseded by later evidence.

### 6.1 Current implementation audit status — 2026-11-16

This subsection records implementation progress only. It does not redefine the accepted requirements, solution design, canonical P3/P4/P6 owners or visual baseline.

**Audit baseline:** `version/0.5.0` at `b8823453986aa893ba229e3c9f5c293c7515707b`, immediately before this documentation-only correction. The two commits after the original visual audit removed temporary candidate-review workflows and invalid screenshot evidence; they did not implement the missing P3-P6 UI work. The implementation verdict therefore remains unchanged.

The repository audit establishes the following current state:

1. **P1 is implemented and should be preserved.**
   - STAGE batch grammar, proposal/cancel ownership, bounded activity contracts, material-presentation derivation, reached-history correction and exact execution-owner semantics are present with permanent tests.
   - No P1 UI/reference debt was identified because P1 is semantic-kernel work.

2. **P2 is implemented and should be preserved.**
   - Bounded OpenCode activity, provider grammar/admission diagnostics, exact task-scoped execution start, proposal-aware cancellation and current lifecycle-artifact projection are present in the daemon/control plane.
   - P2 remains subject to ordinary regression reruns after P3-P6 corrections; it is not the source of the visual-conformance failure.

3. **P3 is only partially implemented and C3 was falsely certified.**
   - Conversation/activity/workflow partitioning and Dialogue semantics landed.
   - The required Workbench shell, current-attention presentation, document/proposal state presentation, responsive composition, theme parity and common visual topology do not conform to the reviewed SVG baseline.
   - The historical P3 checkpoint ran typecheck/tests/build but did **not** launch and compare the real SPA against the C3 SVGs. Its green result is therefore not valid C3 evidence.

4. **P4 is only partially implemented and C4 was falsely certified.**
   - Material-maturity/proposal-ownership semantics landed.
   - Work request, Research, Requirements, Solution design, Implementation plan, Readiness, document authoring/read-only, proposal review, Evidence and work-type presentation remain materially divergent from the accepted reference compositions.
   - Audited runtime captures included unresolved loading states such as `Loading workspace...`, `Loading workflow step...` and `Loading readiness review...`.
   - The historical P4 checkpoint likewise ran mechanical tests/build without rendering and comparing the real SPA against the C4 SVGs. C4 is invalid and must be rerun only after the actual UI implementation is complete.

5. **P5 is only partially implemented and C5 was falsely certified.**
   - Some post-signoff hierarchy and exact task-start semantics landed.
   - Approval, signed-task detail, Implementation master/detail and Complete/linked-remediation compositions remain materially different from their accepted references.
   - The historical P5 checkpoint did not perform runtime SVG comparison. C5 is invalid.

6. **P6 is largely not implemented and C6 was falsely certified.**
   - The P6 implementation commit changed only `ui/src/WorkItemContext.tsx` in production; it did not perform the application-wide Queue/Create/Settings/readiness/service conversion required by this plan.
   - Queue, Create WorkItem, linked remediation, repository/OpenCode/model settings, installation readiness and other supporting surfaces remain materially divergent or unproven against the C6 references.
   - The historical P6 checkpoint did run Playwright, but it performed behavioral browser checks rather than direct SVG/reference conformance. That is insufficient to establish C6.

7. **P7 is not complete and C7 has never been validly established.**
   - No complete 41-reference `MATCH | ALLOWED_RENDERING_VARIANCE(reason) | FAIL` verdict ledger exists for the integrated candidate.
   - The historical screenshot machinery only created actual/reference PNGs and checked inventory/filenames; it did not compare the images or adjudicate conformance.
   - Several multi-state reference sheets were represented by one runtime screenshot, which cannot prove all states contained in the reference.
   - The historical “final implementation validation” omitted the required Playwright/browser gate from the signed final command union.
   - No valid integrated visual evidence therefore exists for canonical V4 review.

### 6.2 Audit consequence — prior completion claims are withdrawn

The following prior implications must not be reused as implementation evidence:

- green typecheck/unit/presentation/build results as proof of C3-C5 visual conformance;
- Playwright behavioral success as proof of C6 visual conformance;
- screenshot existence, filename equality or reference-count equality as proof of C7;
- one runtime screenshot as proof of a multi-state reference sheet;
- the removed temporary candidate-review evidence as a valid final comparison package;
- a final-validation run that omitted the browser gate as proof that the signed final gate union passed.

The current candidate is therefore **not implementation-complete, not C7-complete and not ready for independent V4/candidate validation**.

### 6.3 Remaining implementation sequence

Remediation proceeds from the existing semantic foundation; P1/P2 are not rewritten merely because the UI failed.

1. **Complete the mandatory structural UI/styling recovery prerequisite in §6.5.**
   - No further reference-driven P3-P6 CSS/JSX correction is allowed until the current implementation is restored to the existing Workbench primitive, Astryx-foundation and canonical theme ownership model.
   - A reference mismatch identifies a defect; it does not identify the implementation layer in which that defect may be fixed.
   - Every visual correction must first resolve to its canonical owner under `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1` and `GW-TR-103-ASTRYX-FOUNDATION-CONFORMANCE`.

2. **Repair visual-evidence truthfulness.**
   - Render deterministic real-SPA fixtures for every required reference state.
   - Wait for the intended settled state; loading placeholders are never accepted as the compared result.
   - For state-sheet references, exercise every represented state rather than assigning the sheet filename to one screenshot.
   - Treat screenshot/reference capture as evidence generation only. A green capture workflow is not C3/C4/C5/C6 evidence.
   - Record one explicit adjudicated verdict per reference/state: `MATCH`, `ALLOWED_RENDERING_VARIANCE(reason)` or `FAIL`.

3. **Reopen P3 and implement the actual shared Workbench visual foundation.**
   - After §6.5 is green, bring shell/identity/rail/current-attention/Dialogue/Document/Review/Evidence/Context/confirmation/responsive/theme composition into near-exact reference conformance through the already-declared owners.
   - Existing UI code survives only where direct comparison proves it already conforms.
   - Reference corrections continue to obey the §6.5 ownership-classification rule; no screen-local CSS escape hatch is permitted.

4. **Reopen P4 and implement the complete pre-signoff task experience.**
   - Work request, Research, Requirements, Solution design, Implementation plan, Readiness, authoring/read-only material, proposal review, Evidence and work-type variants must reproduce the accepted information hierarchy and topology rather than preserve the old editor-centric composition.

5. **Reopen P5 and implement the accepted post-signoff compositions.**
   - Approval must be the accepted exact-package Review.
   - Implementation must be the accepted persistent Approved Tasks/current-task MasterDetail.
   - Complete must be result-first with the correct eligible remediation branch.

6. **Reopen P6 and implement application/supporting services.**
   - Queue, Create, Settings, installation readiness, Context, Evidence, notices and confirmations must each be proven against their assigned references and corrected where they fail.

7. **Run P7 only after §6.5 and C3-C6 are validly green.**
   - Produce the complete 41-reference verdict set.
   - Run all V-01..V-11 permanent proof and the complete final gate union including browser.
   - Remove temporary verification scaffolding.
   - Only then hand the integrated candidate to canonical V4/V5/V6/V7.

### 6.4 Candidate-readiness verdict

**REJECTED.**

At this audit state:

- **P1: DONE**
- **P2: DONE / preserve**
- **P3: PARTIAL; C3 invalid**
- **P4: PARTIAL; C4 invalid**
- **P5: PARTIAL; C5 invalid**
- **P6: LARGELY NOT DONE; C6 invalid**
- **P7: NOT DONE; C7 not established**
- **0.5.0 candidate readiness: REJECTED**

This status remains in force until later repository evidence closes the corresponding implementation work and reruns the exact owning checkpoint. A later green test run may update only the phase/checkpoint it actually proves; mechanical green alone cannot silently promote visual-conformance status.

### 6.5 Mandatory structural UI/styling recovery prerequisite — blocking

**Status:** REQUIRED BEFORE ANY FURTHER REFERENCE-DRIVEN P3-P6 VISUAL CORRECTION.

This is not a new lifecycle phase, a new visual system or a new design exercise. It is a blocking implementation prerequisite inside the already-reopened P3 work. Its purpose is to restore the candidate to the P4 architecture that is already binding before additional reference matching continues.

The governing rule is:

```text
reference mismatch
        ↓
classify the canonical owner
        ↓
correct that owner once
        ↓
all consumers inherit the correction
        ↓
reference validation confirms the result
```

The following implementation pattern is prohibited:

```text
reference mismatch
        ↓
find the nearest selector/component
        ↓
add local JSX/CSS until the screenshot looks right
```

A reference is derived visual acceptance authority. It is not CSS architecture and does not authorize a local implementation mechanism that contradicts `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, `GW-DOC-TECHNICAL-ARCHITECTURE-V1` or `GW-TR-103-ASTRYX-FOUNDATION-CONFORMANCE`.

#### 6.5.1 Current evidence requiring recovery

The current `version/0.5.0` implementation contains evidence that reference correction has begun to cross canonical ownership boundaries:

1. `ui/src/EvidenceViewer.tsx` no longer uses the §8.17-required `WorkbenchSurface + WorkbenchSectionHeader + WorkbenchState + approved CodeBlock leaf` composition. It now establishes a bespoke `.order-evidence-viewer` bordered/radiused/padded surface and a raw `<pre>` exact-byte renderer. That is a concrete primitive/foundation bypass and must be structurally corrected rather than visually preserved.
2. `ui/src/theme.css` is materially cleaner than the audited legacy stylesheet, but recent reference work has added feature-level visual geometry/chrome such as `.order-readiness-*`, `.order-evidence-*`, `.order-markdown-document-view-*`, `.order-dialogue-research-material` and `.order-lifecycle-authority-summary`. Each such selector must be reclassified against the canonical owner; feature-semantic content layout may remain, but primitive-owned surface/review/dialogue/status/heading/editor mechanics may not.
3. The stylesheet still contains raw mechanics such as `border-radius: 999px`, `border-radius: 50%`, `font-size: 0.75rem` and recent raw content heights such as `32rem`, `36rem`, `28rem` and `22rem`. These values are not accepted merely because they improve one reference capture. They must resolve to an existing public Astryx token/prop, an already-authorized Order structural token, a genuinely specialist mechanic, or be removed. A new semantic/structural token or reusable visual role requires DESIGN authority; P7 may not invent it.
4. The temporary P3/P4 visual workflow currently proves that runtime/reference images were produced, but it does not itself compare/adjudicate those images into the plan-required verdicts. Therefore workflow success is evidence-capture success only and must not be reported as C3/C4 success.
5. `tests/certification.test.ts` already enforces important boundaries, but it does not yet mechanically close the full stylesheet/foundation ownership contract required by `GW-DOC-WORKBENCH-THEME-V1 §15` and `GW-TR-103`. The missing fitness coverage must be added before more visual work can safely accumulate.

These are implementation-state findings. They do not amend P3/P4/P6 authority.

#### SR-1 — freeze unclassified reference-driven styling changes

Until SR-1 through SR-9 pass, do not add another screen-local CSS/JSX visual correction merely because a reference differs.

Before changing implementation for a visual mismatch, classify it into exactly one owner:

| Mismatch class | Canonical implementation owner |
|---|---|
| information hierarchy / interaction composition | existing feature/service renderer composed through the exact §8.15 Workbench primitive grammar |
| recurring Workbench structure or interaction mechanic | the single owning `ui/src/primitives/*` primitive |
| low-level interaction/accessibility/state/theme mechanic already supported by Astryx | pinned Astryx component prop/variant/density/public token |
| shared semantic visual role | `GW-DOC-WORKBENCH-THEME-V1` realization in the owning primitive selector / root public-token bridge |
| Markdown/CodeMirror/code/evidence content mechanic | the already-approved specialist renderer, consuming canonical roles |
| genuinely feature-specific semantic content arrangement | a narrowly scoped §13.5 feature selector in `theme.css`, with no reusable component chrome or alternate responsive topology |
| missing reusable component responsibility, missing semantic visual role, or required geometry not authorized by current P4 | stop implementation and return to DESIGN |

Every later C3-C6 defect record must name both the failed reference/state and this owner classification before code is changed.

#### SR-2 — restore canonical renderer-to-primitive composition

Audit every production renderer touched by the reopened visual work against `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §8.17`.

Required corrections include, at minimum:

- restore `EvidenceViewer` to the canonical `WorkbenchSurface + WorkbenchSectionHeader + WorkbenchState + approved CodeBlock leaf` composition;
- remove its bespoke root surface chrome and raw `<pre>` replacement where the approved Astryx `CodeBlock` leaf owns the mechanic;
- preserve exact-byte semantics and the accepted evidence information hierarchy while moving structure/theme mechanics back to their canonical owners;
- inspect `ReadinessWorkspace`, `MarkdownEditor`, `DocumentWorkspace`, `ActivityWorkspace`, `ProposalReview`, `ExecutionWorkspace`, Queue/Create/Settings and every other renderer changed during reference remediation for the same failure class;
- preserve valid feature-semantic content and reference corrections, but remove any local shell/surface/review/dialogue/status/notice/table/timeline/overlay/editor chrome that duplicates a primitive or suitable Astryx mechanic;
- do not solve a primitive bypass by adding a new wrapper primitive. Use the closed §8.12 vocabulary unless DESIGN explicitly changes it.

**Acceptance:** every production renderer again matches its canonical §8.17 composition, and no reference-driven renderer has a bespoke substitute for a required Workbench primitive or approved Astryx leaf.

#### SR-3 — re-establish canonical stylesheet ownership

Normalize `ui/src/styles.css` and `ui/src/theme.css` against `GW-DOC-WORKBENCH-THEME-V1 §13`.

Required end state:

- `styles.css` remains import/layer order plus irreducible document/root reset only;
- `theme.css` remains the only Order presentation stylesheet;
- section 1 contains only the verified public Astryx root token bridge/theme mapping;
- section 2 contains only the exact Order-only structural/readability roles authorized by §§7-8;
- section 3 contains the closed Workbench primitive presentation selectors;
- section 4 contains specialist content mechanics and genuinely feature-specific semantic content layout only;
- section 5 contains only canonical responsive overrides;
- feature-by-feature chronological append ordering is removed;
- no CSS module, feature stylesheet, second theme provider or second token namespace is introduced.

Feature selectors may arrange their own semantic content. They may not become alternate Surface/Review/Dialogue/Status/Notice/Table/Timeline/Toolbar/field/component owners.

#### SR-4 — exhaust Astryx/public-token mechanics before residual CSS

Perform a declaration-level audit of `theme.css`, especially all values added during current reference remediation.

For every non-token raw declaration outside the exact root public-token bridge:

1. determine whether Astryx already owns the mechanic through a component prop, variant, size/density or public token;
2. if yes, move ownership to that Astryx mechanism and delete the local raw mechanic;
3. otherwise determine whether the value is one of the exact Order structural/readability roles already authorized in §§7-8;
4. if yes, consume that canonical Order token rather than repeating the literal;
5. otherwise determine whether it is an irreducible specialist/accessibility/content mechanic;
6. if none applies, delete it; if the UI genuinely cannot satisfy P3/P4 without it, return to DESIGN rather than inventing a new P7 visual role/token.

The audit must explicitly resolve current raw-radius/type/geometry examples, including:

- pill/circular radii such as `999px` / `50%` against `--radius-full` or the appropriate public radius token;
- raw type sizes such as `0.75rem` against the canonical Astryx typography roles;
- ordinary control dimensions against Astryx size/density props and `--size-element-*`;
- reference-tuned content heights such as `32rem`, `36rem`, `28rem` and `22rem`;
- repeated raw column widths where an existing Order structural token already owns the dimension.

Do not add new `--order-*` tokens to legalize a local value. The allowed Order-specific token set is owned by the P4 theme design.

#### SR-5 — consolidate recurring visual chrome into the existing primitive owner

Search the current feature/specialist section for repeated combinations of:

- border;
- background;
- radius;
- padding;
- heading/action alignment;
- status/notice chrome;
- toolbar/control chrome;
- review/surface/dialogue framing;
- table/list/timeline row mechanics.

Where the same semantic mechanic already belongs to a Workbench primitive, move/correct it once in that primitive's section-3 selector and remove the feature copy.

Feature CSS may retain content-specific grid/flex arrangement only where §13.5 permits it. It must not target primitive internals to make one occurrence visually special.

If two or more services require the same visual correction, presume the shared primitive/theme owner is wrong until proven otherwise; do not patch both services independently.

#### SR-6 — delete superseded and reference-only CSS mechanisms

After SR-2 through SR-5:

- remove dead selectors with no production consumer;
- remove duplicate base selector owners outside intentionally scoped canonical media overrides;
- remove feature selectors made obsolete by restored primitive composition;
- remove compatibility aliases and screenshot-tuning declarations that no longer have an architectural owner;
- remove any reintroduced card/dashboard/side-index/component chrome that the current P4 design supersedes;
- do not leave old and new presentation paths available in parallel.

The final candidate must have one visual system and one selector owner per recurring mechanic.

#### SR-7 — close permanent architecture fitness for CSS/foundation ownership

Extend the existing `tests/certification.test.ts` owner; do not edit signed `tests/architecture.test.ts` and do not add a new test framework/dependency.

Permanent fitness must mechanically prove at least:

1. the complete §8.17 renderer → primitive/approved-leaf mapping, including `EvidenceViewer -> WorkbenchSurface + WorkbenchSectionHeader + WorkbenchState + CodeBlock`;
2. primitive-owned selectors remain in the primitive presentation section and are not redefined by feature selectors;
3. feature/service renderers cannot bypass a required structural/semantic primitive with raw HTML/CSS or direct foundation mechanics;
4. no raw semantic colors outside the root bridge, no private `--_` Astryx tokens/internal selectors and no redundant Order palette namespace;
5. no feature-local raw font-size/radius/shadow/control-height/recurring spacing mechanic where a public Astryx token/prop owns the role;
6. no unauthorized structural geometry literal/token outside the existing P4-authorized Order geometry set, apart from narrowly allowlisted irreducible CSS/accessibility mechanics such as canonical 1px boundaries/visually-hidden treatment;
7. only the canonical Workbench breakpoints exist for structural responsive composition;
8. `styles.css` contains no Order primitive/feature selector and no additional Order-authored stylesheet exists;
9. no feature selector styles a Workbench primitive descendant to create a local variant;
10. no suitable Astryx mechanic is reimplemented raw merely to match a reference.

Tests must enforce semantic ownership, not one brittle snapshot of today's selector count.

#### SR-8 — make visual-checkpoint evidence truthful

The temporary P3/P4 visual workflow is execution scaffolding only.

Correct it so that:

- its successful image-generation job is described and treated as **capture/evidence generation**, not a visual checkpoint pass;
- every represented state of every assigned multi-state SVG is captured explicitly;
- reference rasterization and actual screenshots remain paired by reference/state/viewport/theme;
- C3-C6 cannot be claimed from file existence, filename equality, screenshot counts or a green capture job;
- the implementation worker performs actual side-by-side inspection and produces a verdict ledger with, for each state: reference, runtime fixture, viewport/theme where applicable, actual evidence path, `MATCH | ALLOWED_RENDERING_VARIANCE(reason) | FAIL`, and owning implementation surface for every failure;
- checkpoint closure requires a complete ledger with no `FAIL` and no unexplained/missing state;
- temporary workflows/evidence-generation scaffolding remain absent from the final publishable candidate as already required by repository governance.

No automated pixel-diff dependency is introduced merely to manufacture a green signal. The references are schematic/semantic visual authority and permitted rendering variance remains governed by §4.4.

#### SR-9 — close regressions and run the structural recovery gate

After the ownership cleanup, classify and close all invalidated permanent tests against canonical authority rather than blindly making the old assertion pass.

At the current head this includes the browser failures for:

- long Work request/lifecycle Markdown final-line persistence after save/reload;
- Requirements authority presentation.

For the first, preserve the accepted long-document edit/save/persistence behavior.

For the second, do not re-promote a repository path into primary UI merely because an older test expected it there. If current P3/reference authority makes the path technical/secondary, update the test to prove the correct Technical detail/Context location; change production UI only if authority actually requires the primary presentation.

Then run the complete structural-recovery gate:

```text
dependency-lock
→ typecheck
→ architecture
→ test
→ build
→ browser
```

**SR prerequisite PASS requires all of the following:**

- all six commands are green;
- every production renderer conforms to the §8.17 primitive/approved-leaf mapping;
- `EvidenceViewer` and any other identified bypass are structurally restored;
- `styles.css` / `theme.css` satisfy §13 ownership;
- the §15 theme/CSS/foundation fitness gaps are permanently enforced;
- no unauthorized raw/reference-tuned visual mechanics remain;
- no obsolete parallel visual path remains;
- the visual capture workflow can no longer be mistaken for a conformance verdict;
- no new P3/P4 semantic role, token, component responsibility or responsive topology was invented during recovery.

Only after SR passes may implementation resume reference-by-reference P3/C3 correction. Every subsequent reference fix remains subject to SR-1 owner classification; SR is not a one-time permission to resume local patching.

## 7. Reference-fixture rule — no separate implementation phase

There is no P0 implementation phase.

Canonical V0/V1 already own package, approval, repository and governance preflight. The implementation does not repeat them.

Reference fixtures are added **just in time** in P3-P6 only when the real SPA cannot already render an approved SVG state deterministically. The plan's §16 reference ownership matrix already maps all 41 references to their owning checkpoint, so implementation must not create a second reference manifest merely to restate that mapping.

The current UI is not captured or compared. The visual quality loop is only:

```text
approved SVG -> implemented runtime state -> fix any mismatch
```

No separate baseline screenshot exercise, pre-implementation visual gate, mock prototype, or reference-harness phase is authorized.

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

P6 does **not** rediscover what these services should be. Their product behavior remains the accepted behavior in Requirements §§19-21 and their reviewed SVGs. For each surface, implementation either proves the existing renderer already conforms or applies only the named conformance correction.

| Surface | Required 0.5.0 transition | Preserve |
|---|---|---|
| application shell/notices | keep one toolbar/identity/utility grammar; current workflow identity/action must outrank utilities; notices use one canonical feedback owner | existing navigation, dirty guards, theme choice and source refresh semantics |
| Queue | task is scan/select; remove persistent technical-id prominence; keep concise kind/lifecycle/attention and archive/search controls | selection/archive/restore semantics and source reconciliation |
| Create WorkItem / linked remediation | one bounded canonical Form; human-owned inputs only; successful creation orients to Work request | schema/project/concern/lineage daemon validation |
| repository Settings | canonical Settings/Form/Confirmation composition only; no feature-local control grammar | exact config-SHA admission, connect/disconnect/reference-root/document-root semantics |
| OpenCode Settings/account flows | canonical settings composition and reviewed login/add/rename terminal states | account mutation serialization, active-account admission and OAuth process semantics |
| model/runtime Settings | canonical field/status/notice hierarchy | current provider/model availability validation and config-currentness semantics |
| installation readiness | reviewed readiness state hierarchy and recovery links | existing readiness computation; Settings remains supporting service, never workflow stage |
| Context | closed-by-default secondary/technical metadata only; never sole blocker/action owner | exact ids/paths/hashes/diagnostics on demand |
| Evidence | read-only evidence/result inspection with exact resource identity and return orientation | existing evidence authorization/hash/path safety |
| confirmation/dirty/destructive overlays | one canonical accessible confirmation mechanic with focus return; no topology replacement | underlying productive surface remains mounted and canonical mutation remains daemon-owned |

A production edit on one of these surfaces is justified only by a failed listed invariant/reference comparison. If the existing implementation already passes, leave that owner unchanged. This is verification of a closed design, not an implementation-time product audit.

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
- the final C7 comparison is complete enough for the canonical V4 reviewer to judge every reference without reconstructing intent.

## 15. Canonical candidate validation — not another implementation phase

After P7 completes, implementation stops. The candidate enters the existing canonical validation control plane in GW-DOC-VALIDATION-STANDARD-V1.

The PLAN does **not** run a second bespoke “P8” review/gate process on top of V2-V7.

The existing stages own final validation:

- **V2** — actual diff/scope validation against the signed task;
- **V3** — mechanical behavior validation using the project-authoritative gates;
- **V4** — one fresh independent semantic review, including the final C7 visual/reference evidence;
- **V5** — architecture/governance validation;
- **V6** — minimum-change/anti-bloat validation;
- **V7** — rerun only gates/evidence invalidated by any remediation/review edits.

The manifest-owned final gate commands remain:

1. `bun ci`
2. `bun run tsc --noEmit`
3. `node node_modules/vitest/vitest.mjs run tests/architecture.test.ts`
4. `node node_modules/vitest/vitest.mjs run`
5. `node node_modules/vite/bin/vite.js build`
6. `node node_modules/@playwright/test/cli.js test`

These commands are executed where the canonical validation stages require them; the implementation phases do not rerun the complete union simply for ceremony.

V4 receives the exact signed task, final diff, permanent test evidence and the C7 41-reference comparison. It independently checks semantic correctness and visual/reference conformance once on the integrated candidate.

A material visual drift found at V4 returns to the owning implementation surface as a classified repairable review failure when the correction is already designed and in scope. It is not accepted as cosmetic debt.

`CANDIDATE_DONE` remains solely the canonical coordinator result after the required V0-V7 evidence exists.

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

## 17. Requirement/design/interaction/validation traceability

### 17.1 Requirement/design traceability by phase

| Phase | Primary accepted obligations |
|---|---|
| P1 | WF-FR-004, WF-FR-007, WF-FR-017, WF-FR-024, WF-FR-033, WF-FR-034, WF-FR-035; TD-01, TD-02, TD-03, TD-06 |
| P2 | WF-FR-005, WF-FR-006, WF-FR-007, WF-FR-017, WF-FR-032, WF-FR-033, WF-FR-034; TD-01..TD-06 |
| P3 | WF-FR-001..003, WF-FR-005..009, WF-FR-020..024, WF-FR-030..031, WF-FR-035; TD-05, TD-07 |
| P4 | WF-FR-010..015, WF-FR-020..032, WF-FR-034..035; TD-06, TD-07 |
| P5 | WF-FR-016..020, WF-FR-023, WF-FR-030..033; TD-02, TD-07 |
| P6 | WF-FR-021..023, WF-FR-028, WF-FR-030..031; TD-07 |
| P7 | all WF-FR-001..035; TD-08; V-01..V-11 |

The accepted requirement/design documents remain the semantic owners. This PLAN makes their implementation/proof ownership explicit; it does not copy their authority.

### 17.2 Complete observable acceptance coverage

Requirements `requirements.md §Acceptance criteria` remains the sole semantic owner for A1-J74. This PLAN maps each criterion id to implementation and proof ownership without copying the requirement text into a second normative source.

This is a completeness map, not a demand for 74 separate tests, evidence files or review records. One meaningful scenario may satisfy multiple mapped criteria when it genuinely proves them.

| Criterion | Implementing phase | Production owner | Permanent proof |
|---|---|---|---|
| A1 | P3-P6 | step/service renderers + WorkItemWorkspace | browser.spec + certification.test |
| A2 | P3-P6 | step/service renderers + WorkItemWorkspace | browser.spec + certification.test |
| A3 | P1, P3-P5 | core current-attention derivation + WorkItemWorkspace | core.test + workbench-presentation.test + browser.spec |
| A4 | P1, P5 | core current-owner derivation + local historical selection | workbench-presentation.test + browser.spec |
| A5 | P3-P6 | canonical primary/supporting/technical hierarchy + Context | browser.spec reference assertions + certification.test |
| A6 | P3-P6 | canonical primary/supporting/technical hierarchy + Context | browser.spec reference assertions + certification.test |
| A7 | P2-P6 | daemon mutation owners + Workbench feedback primitives | daemon.test + browser.spec |
| A8 | P2-P3 | canonical observation/query convergence + mutation admission | daemon.test + browser.spec + certification.test |
| B9 | P3-P4 | shared pre-signoff Dialogue/Review/Document/Evidence composition | browser.spec + C4 reference comparison |
| B10 | P2-P3, P5 | Run activity recorder + OpenCode mapping + Dialogue/Implementation activity | opencode.test + daemon.test + browser.spec |
| B11 | P1-P3 | stage interaction/proposal algebra + daemon admission + Dialogue | core.test + daemon.test + browser.spec |
| B12 | P1-P3 | stage interaction/proposal algebra + daemon admission + Dialogue | core.test + daemon.test + browser.spec |
| B13 | P1-P3 | stage interaction/proposal algebra + daemon admission + Dialogue | core.test + daemon.test + browser.spec |
| B14 | P1-P3 | stage interaction/proposal algebra + daemon admission + Dialogue | core.test + daemon.test + browser.spec |
| B15 | P2, P4 | proposal adoption + artifact/conformance invalidation | daemon.test + browser.spec |
| B16 | P2, P4 | direct Markdown Save mutation owners | daemon.test + browser.spec |
| B17 | P3-P4 | material/attempt selection + current-attention composition | workbench-presentation.test + browser.spec |
| C18 | P4 | Readiness Review composition | browser.spec + readiness-review.svg |
| C19 | P4 | Readiness Review composition | browser.spec + readiness-review.svg |
| C20 | P5 | Approval Review + exact sign-off composition | daemon.test + browser.spec + approval references |
| C21 | P5 | Approval Review + exact sign-off composition | daemon.test + browser.spec + approval references |
| C22 | P5 | Approval Review + exact sign-off composition | daemon.test + browser.spec + approval references |
| C23 | P5 | Approval Review + exact sign-off composition | daemon.test + browser.spec + approval references |
| D24 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| D25 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| D26 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| D27 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| D28 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| D29 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| D30 | P5 | ExecutionWorkspace + exact execution-owner/command mechanics | core.test + daemon.test + browser.spec + implementation references |
| E31 | P1, P4-P5 | MaterialPresentationState + document/package/task presentation | core.test/workbench-presentation.test + browser.spec |
| E32 | P1-P2, P4-P5 | canonical proposal/Git/sign-off facts + mutation boundaries | core.test + daemon.test + browser.spec |
| E33 | P1-P2, P4-P5 | canonical proposal/Git/sign-off facts + mutation boundaries | core.test + daemon.test + browser.spec |
| E34 | P1-P2, P4-P5 | canonical proposal/Git/sign-off facts + mutation boundaries | core.test + daemon.test + browser.spec |
| E35 | P5-P6 | TerminalResult + linked-remediation Create flow | daemon.test + browser.spec + complete references |
| E36 | P5-P6 | TerminalResult + linked-remediation Create flow | daemon.test + browser.spec + complete references |
| F37 | P3-P7 | responsive/focus/accessibility/feedback primitive system | browser.spec + Workbench §14.5 certification + C3-C7 visual evidence |
| F38 | P3-P7 | responsive/focus/accessibility/feedback primitive system | browser.spec + Workbench §14.5 certification + C3-C7 visual evidence |
| F39 | P3-P7 | responsive/focus/accessibility/feedback primitive system | browser.spec + Workbench §14.5 certification + C3-C7 visual evidence |
| F40 | P3-P7 | responsive/focus/accessibility/feedback primitive system | browser.spec + Workbench §14.5 certification + C3-C7 visual evidence |
| F41 | P3-P7 | responsive/focus/accessibility/feedback primitive system | browser.spec + Workbench §14.5 certification + C3-C7 visual evidence |
| G42 | P3-P7 | all audited SURF families via reviewed reference inventory | reference-pack completion matrix + browser.spec + C7 |
| G43 | P1-P7 | all audited ACT interactions through §17.3 closure ledger | interaction ledger + core/daemon/browser/certification proof named per row |
| G44 | P3-P7 | task-first information hierarchy | browser.spec + C3-C7 references |
| G45 | P1-P4 | proposal/cancel closure | core.test + daemon.test + browser.spec |
| G46 | P2, P5 | exact task-scoped manual execution | daemon.test + browser.spec multi-runnable fixture |
| G47 | P2-P3, P5 | bounded agent activity | opencode.test + daemon.test + browser.spec |
| G48 | P1, P4-P5 | derived material maturity | core/workbench-presentation tests + browser.spec |
| G49 | P1-P7 | all Phase-1 certification gaps resolved by V-01..V-11 | tests named by V-01..V-11 + §17.4/17.6 |
| H50 | P4 | stage-owned information/output boundaries | browser.spec kind/stage fixtures + certification.test |
| H51 | P4 | stage-owned information/output boundaries | browser.spec kind/stage fixtures + certification.test |
| H52 | P4 | stage-owned information/output boundaries | browser.spec kind/stage fixtures + certification.test |
| H53 | P4 | stage-owned information/output boundaries | browser.spec kind/stage fixtures + certification.test |
| H54 | P4 | stage-owned information/output boundaries | browser.spec kind/stage fixtures + certification.test |
| H55 | P4-P5 | stage-specific accumulated-package hierarchy | browser.spec + C4/C5 references |
| H56 | P1, P4 | reached-history/draft derivation + material resolver | core.test + workbench-presentation.test + browser.spec |
| H57 | P4-P5 | supporting-authority/context projection | browser.spec + certification.test |
| H58 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H59 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H60 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H61 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H62 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H63 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H64 | P4 | work-type-aware source/Research/shared-delivery projections | browser.spec Change/Defect/Investigation/Audit fixtures + certification.test |
| H65 | P3-P6 | user-facing workflow presentation labels | workbench-presentation.test + browser.spec |
| H66 | P4-P6 | current task output + minimum supporting upstream context | browser.spec + C4-C6 references |
| I67 | P2, P4 | active-agent direct-authoring exclusion | daemon.test + browser.spec |
| I68 | P1-P3 | atomic rejected provider batch + governed recovery | core.test + daemon.test + browser.spec |
| I69 | P1-P2, P4 | repository draft projection without reach/conformance fabrication | core.test + daemon.test + browser.spec |
| I70 | P2-P3 | canonical observation convergence | daemon.test + browser.spec + certification.test |
| I71 | P1-P2, P5, P7 | single lifecycle/state ownership + sign-off/currentness locking | architecture gate + certification.test + core/daemon tests |
| J72 | P1, P3-P4 | Dialogue/reply context + STAGE message/question grammar | core.test + browser.spec + dialogue references |
| J73 | P1, P3-P4 | Dialogue/reply context + STAGE message/question grammar | core.test + browser.spec + dialogue references |
| J74 | P1, P3-P4 | Dialogue/reply context + STAGE message/question grammar | core.test + browser.spec + dialogue references |

### 17.3 Phase-1 interaction closure — default preserve, explicit exceptions

Functional acceptance criterion G43 is closed without creating a 97-row execution checklist.

The parent Audit `application-interaction-map.md` is the factual registry of the 97 material `ACT-*` interactions. The default disposition is:

> **PRESERVE** every audited ACT interaction under its current canonical semantic owner unless this table explicitly supersedes, prohibits or strengthens it.

PRESERVE means the interaction's audited mutation/read-only semantics, authority owner and safety/currentness behavior remain regression obligations. It does **not** require a new test when existing permanent coverage already proves the behavior.

Only the interactions below require changed implementation or strengthened proof in 0.5.0:

| ACT id | Disposition | Required 0.5.0 outcome | Proof |
|---|---|---|---|
| ACT-QUEUE-004 | SUPERSEDE presentation | WorkItem id is not persistent ordinary Queue scan chrome; exact id remains available as secondary/technical Context where needed | C6 queue reference + browser/certification coverage |
| ACT-ACTIVITY-001 | PRESERVE + strengthen admission | Cancel is available only for the exact current STAGE owner with proposal decision NONE; pending/adopting proposal suppresses and daemon rejects Cancel | V-03 core + daemon + browser matrix |
| ACT-ACTIVITY-002 | PRESERVE + strengthen reply context | Free continuation/required input retains exact admission and is shown only with its visible substantive agent message/exact question | V-01/V-02 core + daemon + browser proof |
| ACT-PROP-002 | PRESERVE + strengthen current ownership | Adopt operates only on the exact current owning OPEN proposal; adoption intent remains durable before repository effect | V-03 proposal matrix |
| ACT-PROP-003 | PRESERVE + strengthen current ownership | Reject operates only on the exact current pending OPEN proposal and never during adoption | V-03 proposal matrix |
| ACT-EXEC-005 | SUPERSEDE command | Replace task-local browser `POST /api/tick` with exact `POST /api/work-items/:workItemId/tasks/:executionTaskId/start`; global tick remains scheduler-only | V-04 multi-runnable daemon/browser proof |
| ACT-F01 | SUPERSEDE defect | Close the task-local/global-scheduler mismatch through exact task-scoped manual start | V-04 |
| ACT-F02 | SUPERSEDE uncertainty | Browser and daemon share/prove exact current proposal ownership so historical/non-current proposal mutation is unavailable/rejected | V-03 |
| ACT-012 | PROHIBIT duplicate presentation | Required-input question has one conversational anchor; do not duplicate it as competing primary timeline/composer information | V-01/V-02 + dialogue reference |

All other ACT ids in the parent registry are PRESERVE by this rule. C7 only needs to prove the changed/superseded/prohibited paths above and rely on existing regression coverage for unchanged preserved behavior unless a relevant implementation edit invalidates that coverage.

### 17.4 Canonical V0-V7 integration

C1-C7 are focused implementation checkpoints only. They do not create another validation state machine and cannot substitute for the canonical validation branches in GW-DOC-VALIDATION-STANDARD-V1.

| Canonical stage | Relationship to this PLAN |
|---|---|
| V0 package/approval | occurs before editing; proves this exact signed task, current package/source and dependencies |
| V1 repository/governance preflight | occurs before editing; proves baseline/governance/current implementation still admit this PLAN |
| IMPLEMENT | P1-P7 execute inside the one signed BUILDER task; C1-C7 provide focused developer feedback so defects are corrected before they compound |
| V2 diff/scope | validates the final actual changed paths against this exact changeSurface, exclusions and deletion obligations |
| V3 mechanical behavior | consumes targeted phase test evidence plus the complete final gate/reference-mechanical results; no C checkpoint replaces V3 |
| V4 independent semantic review | fresh read-only reviewer receives the exact task, final diff, permanent validation evidence and C7 visual comparison; §17.2/§17.3 are traceability aids, not separate review ceremonies |
| V5 architecture/governance | runs immutable architecture fitness plus certification sensors; green UI/tests cannot override a governance failure |
| V6 minimum-change/anti-bloat | proves every production edit is necessary and no contingency-authorized renderer/primitive was changed without a failed invariant/reference justification |
| V7 final required gates | reruns every gate/evidence invalidated by builder/remediator/reviewer-driven edits |
| CANDIDATE_DONE | only canonical coordinator evidence with one current VALIDATION_PASSED for V0-V7 plus CANDIDATE_RECORDED may establish completion |

There is no C8. Canonical V2-V7 own final candidate validation and CANDIDATE_DONE.

### 17.5 Checkpoint feedback — minimum useful evidence

C1-C7 exist to catch defects close to where they are introduced. They are not documentation milestones.

For a passing checkpoint, retain only the test/comparison output naturally produced by the tooling. Do not create a separate checkpoint report.

For a failing checkpoint, record only what another worker needs to fix it:

- failing test/reference/runtime state;
- concrete mismatch/failure;
- owning implementation surface;
- required correction when already determined;
- rerun result after correction.

For C3-C6 visual work, screenshots are ordinary comparison/test artifacts. Human/design review is invoked only for an ambiguous comparison or suspected design/reference contradiction.

C7 produces the one complete 41-reference comparison set used by canonical V4. No duplicate per-phase evidence bundle is required.

### 17.6 Permanent Workbench certification binding

P7 must satisfy the complete current certification contracts owned by:

- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §14.5` — browser certification;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §14.6` — architecture fitness.

Those sections remain the sole normative owners; this PLAN does not duplicate their checklists.

Implementation consequence:

- existing `tests/architecture.test.ts` remains immutable verification material;
- new Workbench-specific permanent sensors required by §14.6 belong in `tests/certification.test.ts`;
- browser scenarios required by §14.5 belong in the existing browser/e2e verification owners;
- V-01..V-11 in `solution-design.md` are additive 0.5.0 closure obligations and do not replace the canonical matrices.

## 18. Failure classification, feedback and return rules

Implementation/checkpoint failures are classified before repair. The PLAN does not invent a second failure vocabulary.

| Classification | PLAN reaction |
|---|---|
| TEST_FAILURE | local implementation/mechanical defect: correct inside signed scope, rerun the failed checkpoint and every invalidated test/gate |
| REVIEW_FAILURE | local semantic/visual implementation defect found by review: one bounded correction inside signed scope, then rerun owning checkpoint and invalidated V3/V4 evidence |
| SPEC_INVALID | PLAN/task/specification is incomplete or inconsistent: stop implementation and return to PLAN; builder may not infer missing authority |
| PRECONDITION_FAILED | repository/runtime precondition is absent: block until explicitly resolved; do not consume semantic retry/remediation |
| APPROVAL_STALE | current authority/package no longer matches approval: stop; return through canonical freshness owner |
| SCOPE_BREACH | candidate changed unauthorized surface: do not normalize it as “necessary”; remove the breach or return for re-review/re-approval |
| GOVERNANCE_BREACH | architecture/project rule violated: return to DESIGN unless the correction is unambiguous and already inside signed scope |
| CHANGE_BLOAT | unnecessary structure/change: one targeted reduction is allowed only when it requires no new design decision |
| ENVIRONMENT_BLOCKED | required environment unavailable/broken: block; do not alter product semantics to pass |
| PROVIDER_FAILURE | follow the bounded existing provider replacement policy for the exact operational action key; then block |
| ALREADY_SATISFIED | no implementation mutation; record the proven existing outcome |

A C1-C7 failure must include the actionable feedback record in §17.5. After any correction, no prior PASS is reused when the correction could affect its evidence.

Return to DESIGN immediately when any of the following is discovered:

- a new canonical state/field/contract is required beyond the accepted additions;
- another module responsibility is needed rather than a same-owner implementation;
- the pinned OpenCode public surface cannot realize the accepted activity design;
- a reviewed SVG materially conflicts with canonical P3/P4/P6;
- a new Workbench primitive responsibility is required;
- a new dependency/package is required;
- current architecture cannot realize the visual composition without changing its declared ownership.

Return to PLAN when the implementation is semantically sound in principle but this P7 task is incomplete, internally inconsistent, or its signed scope/changeSurface/verification definition cannot authorize the required already-designed work.

Do not weaken a gate, delete a required test, modify the reference pack, widen scope silently, or edit upstream authority to make a candidate pass.

## 19. Definition of done

The 0.5.0 implementation is complete only when all of the following are true:

- the changed semantic contracts work end to end;
- all 35 accepted WorkItem requirements are realized;
- the §17.2 coverage map has no uncovered functional acceptance criterion and the permanent test/reference suite collectively proves the required outcomes;
- §17.3's explicit interaction exceptions are implemented/proved and all other audited ACT interactions retain their existing regression semantics;
- all V-01..V-11 obligations are permanent tests;
- the complete Workbench §14.5 browser-certification and §14.6 architecture-fitness matrices pass;
- all 41 visual references have a runtime comparison result;
- no material reference deviation remains;
- no duplicated workflow/material/provider state owner exists;
- no unrelated architecture or dependency was introduced;
- all obsolete replaced behavior is deleted;
- canonical V3/V5/V7 gate evidence is green;
- the single canonical V4 independent review passes semantic and visual/reference conformance.

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
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-DOC-CANONICALITY",
        "GW-P1-MINIMUM-CHANGE",
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
        "GW-DOC-EXTERNAL-FACTS-V1-2026-11-12",
        "GW-DOC-SPECIFICATION-STANDARD-V1",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1",
        "GW-DOC-MARKDOWN-WORKBENCH-V1",
        "GW-DOC-INSTALLATION-READINESS-V1",
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
        "shell",
        "daemon",
        "ui",
        "verification"
      ]
    }
  ]
}
```
