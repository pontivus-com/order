<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Canonical PLAN authority

This file is the single deterministic P7 artifact and sole normative execution authority for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. The directory `implementation-plan/` is only its maintainable authoring decomposition. The complete source content is compiled below and Approval binds this root file's bytes.

This PLAN is reconstructed under G-F12 from current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d` and DESIGN `a3d335359e6c716dc7d22f386b3a9956121e81ca`. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts.

This PLAN consumes current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`, current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d` and current DESIGN `a3d335359e6c716dc7d22f386b3a9956121e81ca`. Where DESIGN records `POSITIVE_NO_CHANGE` or baseline reuse, DESIGN—not current implementation—is the authority for that disposition.

## Current destructive Workbench foundation and screen reconstruction

The prior package correctly required destructive screen replacement but incorrectly preserved design-bearing Workbench implementation beneath those screens. Current P4 §16.6 and SD21 correct that boundary.

`GW-DOC-CANONICAL-CONTRACTS-V2` makes task dependencies eligibility-only: every execution Run starts from `Approval.baselineCommit` and successful dependency candidate bytes are not promoted into a later task baseline. Because the 0.6.0 shell/screens/certification form one cumulative candidate, the signed execution representation is exactly **one task, T1**, with an exact mutable forecast of **66 unique paths**. IA01-IA34 are ordered implementation/proof phases inside T1, not separate ExecutionTasks.

IA27/SD21 first destructively reconstructs the shared Workbench foundation and root/selected-WorkItem shells from current P3/P4 and reviewed new-design references. It removes the exact 20 compromised composition primitives, permanently removes the old `WorkbenchLayout` API, cuts over the five shell-integration paths, creates `WorkbenchAppShell`, `WorkbenchWorkItemShell` and the one `workbench-responsive` owner, reconstructs the remaining composition primitives/theme realization, and passes foundation acceptance before IA28.

Only seven audited atomic adapters and the approved non-screen helpers are retained. IA28-IA34 / SD22-SD28 then destructively replace the remaining 18 material-screen paths from fresh R2 screen-information schemas on the accepted foundation. Each phase deletes its exact old files and ledgered legacy selectors before replacement authorship; `ui/src/styles.css` and `ui/src/theme.css` are shared physical owners inside T1, with IA27 owning foundation/theme/structural selectors and IA28-IA34 limited to their assigned screen selectors. IA20-IA23/SD29 perform integrated semantic/component/theme/responsive certification and IA26/SD30 performs exhaustive exact-candidate rendered acceptance.

The 37 governed `SURF-*` rows are partitioned exactly once across IA27-IA34 and independently rechecked by IA26. Purge checkpoints are procedural in-task observational evidence, not Git commits, validation results or intermediate candidates.

No compatibility `WorkbenchLayout`, second AppShell, second structural responsive owner, feature-local structural CSS or implementation-derived layout contract is permitted.
## Exact modular source manifest

| Source component | Git blob |
|---|---|
| `implementation-plan/00-governance.md` | `b19fbf0ac0c2cfa2a170b5ed74a846f612428a88` |
| `implementation-plan/01-a01-lifecycle-product.md` | `e4ea752b6b67709e3f0f7db2128936d3e353885d` |
| `implementation-plan/02-a02-governance-intake.md` | `ae76f19b5d4880f4aadf28d37395e43ca9d43f3a` |
| `implementation-plan/03-a03-queue-source.md` | `b18ed80eccc24f216cd9c37b3af5b5be8ac626ac` |
| `implementation-plan/04-a04-workbench-research.md` | `ed73a2f2d97e4467c69274c6f4857b388b8d70ba` |
| `implementation-plan/05-a05-requirements-design.md` | `0bb0b7572190f191fb15ce2e788e5734704a332e` |
| `implementation-plan/06-a06-plan-readiness.md` | `7a2d461aac5f7e909df0ac206a4272676c606b23` |
| `implementation-plan/07-a07-approval-execution.md` | `2de86fef8f434070786116389744b119c66d2b5f` |
| `implementation-plan/08-a08-complete-materials.md` | `502bfef652530f459be54fa16d64dbb6125d8ec6` |
| `implementation-plan/09-a09-provider-settings.md` | `67acb120114089100580fce052cce411c8cc80c9` |
| `implementation-plan/10-a10-recovery-accessibility.md` | `8bd153757e9004112cdbac7fcfc49b7bd3b571d1` |
| `implementation-plan/11-a11-component-certification.md` | `645d4b62577baf5476d0831e3f0ddfcd645db1e2` |
| `implementation-plan/12-action-catalog.md` | `5161637db9795ae754d6123caf4372373a91064b` |
| `implementation-plan/13-verification-closeout.md` | `20552c0346986797d391c9fb8b2f3aaaf3b6c4b4` |

A source component hash mismatch makes PLAN non-current until this root is regenerated. Directory files contain no `order-tasks` block and no independent lifecycle state.

## Semantic coverage versus execution ownership

A01-A11 are exhaustive semantic coverage phases. They do **not** define eleven independently executable tasks. IA01-IA34 in the compiled action catalog are the single action definitions. IA27 owns the shared foundation/shell reconstruction; IA28-IA34 own downstream material-screen reconstruction.

## Signed execution scope

T1 owns the cumulative 0.6.0 repository envelope and produces one verified candidate from the Approval baseline. To preserve minimum-change and prevent the one-task correction from broadening mutation authority, the signed hard `scope` is the **same exact 66 repository paths** as `changeSurface`. There is no directory-wide `src/**`, `ui/src/**` or `tests/**` variance envelope.

IA phase ownership below further constrains internal sequencing and semantic responsibility; it is not a second scope/task model. A newly required physical path is therefore an out-of-scope discovery and returns upstream for DESIGN/PLAN correction rather than being absorbed through forecast variance.

### Positively retained UI capability

The following atomic adapters are retained unless their narrow responsibility is independently disproved: `ui/src/primitives/WorkbenchAction.tsx`, `ui/src/primitives/WorkbenchConfirmation.tsx`, `ui/src/primitives/WorkbenchDisclosure.tsx`, `ui/src/primitives/WorkbenchField.tsx`, `ui/src/primitives/WorkbenchIcon.tsx`, `ui/src/primitives/WorkbenchNotice.tsx`, `ui/src/primitives/WorkbenchStatus.tsx`.

The approved content/infrastructure helpers `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`, `ui/src/workbench-presentation.ts`, `ui/src/http.ts`, `ui/src/query-keys.ts`, `ui/src/markdown-source-formatting.ts`, `ui/src/theme.ts` and `ui/src/main.tsx` remain outside the foundation/screen replacement surfaces.

IA27 owns the complete foundation/shell reconstruction and foundation/theme/structural selector set. IA28-IA34 may mutate the shared stylesheet files only for their exact ledgered screen selectors and must otherwise treat the accepted IA27 foundation as immutable. A newly discovered foundation responsibility/semantic defect returns to IA27/DESIGN rather than being patched locally.
## Exact signed implementation surface

The exact cumulative mutable forecast is T1's single `changeSurface`: **66 unique paths**.

### Non-UI production (9)
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/stage.ts`
- `src/daemon/work-item-source.ts`
- `src/shell/setup.ts`

### UI foundation/shell reconstruction (30)
- `ui/src/primitives/WorkbenchAttention.tsx`
- `ui/src/primitives/WorkbenchContextPanel.tsx`
- `ui/src/primitives/WorkbenchDialogue.tsx`
- `ui/src/primitives/WorkbenchForm.tsx`
- `ui/src/primitives/WorkbenchIdentity.tsx`
- `ui/src/primitives/WorkbenchLayout.tsx`
- `ui/src/primitives/WorkbenchMasterDetail.tsx`
- `ui/src/primitives/WorkbenchRail.tsx`
- `ui/src/primitives/WorkbenchResourceRow.tsx`
- `ui/src/primitives/WorkbenchReview.tsx`
- `ui/src/primitives/WorkbenchSectionHeader.tsx`
- `ui/src/primitives/WorkbenchSelector.tsx`
- `ui/src/primitives/WorkbenchSettingsLayout.tsx`
- `ui/src/primitives/WorkbenchSurface.tsx`
- `ui/src/primitives/WorkbenchTable.tsx`
- `ui/src/primitives/WorkbenchTaskPanel.tsx`
- `ui/src/primitives/WorkbenchTimeline.tsx`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/primitives/WorkbenchState.tsx`
- `ui/src/primitives/WorkbenchUtilityLink.tsx`
- `ui/src/primitives/WorkbenchAppShell.tsx`
- `ui/src/primitives/WorkbenchWorkItemShell.tsx`
- `ui/src/primitives/workbench-responsive.ts`
- `ui/src/app.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkItemIdentityRow.tsx`
- `ui/src/WorkflowRail.tsx`
- `ui/src/WorkflowStepFrame.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`

### UI material-screen purge/replacement (18)
- `ui/src/OpenCodeAccountControl.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/PreSignoffStageWorkspace.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/ActivityComposer.tsx`
- `ui/src/WorkflowMaterialSelector.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/RunEventTimeline.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/OpenCodeAccountSettings.tsx`

### Verification (7)
- `tests/browser.spec.ts`
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/installer.test.ts`
- `tests/opencode.test.ts`
- `tests/workbench-presentation.test.ts`

### Permanent verification infrastructure (1)
- `.github/workflows/ci.yml`

### Delivery metadata (1)
- `CHANGELOG.md`

IA-phase ownership is authoritative inside T1. IA27 owns the five shell-integration paths, the 20 destructive design-bearing primitive inputs, the three new foundation owners and foundation/theme/structural stylesheet responsibilities. IA28-IA34 own the 18 material-screen replacements plus only their exact ledgered screen selectors in the shared stylesheet files.

## Exhaustive traceability invariants

- exactly 112 stable requirements occur once across A01-A11;
- exactly 27 package-local atomic obligations occur once across A01-A11, including `PL-C12-02`, `PL-C19-02` and `PL-C20-03`;
- A01 corrected-upstream no-code trace rows `A01-NC01`-`A01-NC05` remain explicit and authorize no T1 mutation;
- every stable row names its exact current R1 evidence and current DESIGN disposition;
- every `POSITIVE_NO_CHANGE` row has no execution mutation and names exact verification ownership;
- IA07/IA08 are DESIGN-positive-reuse/no-code proof owners for `PL-C12-01`/`PL-C12-02` and authorize no execution-foundation production edit;
- every dependency-only row names the IA it consumes without duplicate edit ownership;
- every technical/verification delta maps to one or more exact IA actions;
- every IA01-IA34 is defined exactly once;
- the immutable cumulative mutable forecast is T1's exact 66-path `changeSurface`;
- signed `dependency-lock` passes before T1 mutation; IA27 retains purge-before-fresh-foundation evidence and foundation acceptance before IA28; each IA28-IA34 phase retains purge-before-rebuild evidence and passes every exact owned rendered face before phase advance; IA20-IA23/SD29 and IA26/SD30 own integrated/final semantic and rendered closure;
- the IA27-IA34 rendered-face ledger is exactly 37 unique `SURF-*` rows;
- current-v2 task mechanical non-vacuity uses one schema-aware admission owner while published v1 task semantics and the one SignedTaskBlock schema/parser remain unchanged;
- a disproved positive-no-change/baseline-reuse proposition or newly required semantic decision causes an upstream return; a merely unforecast but otherwise admissible same-layer path does not.

## Compiled modular phase specification

---

### Compiled component: `implementation-plan/00-governance.md`

#### 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is reconstructed under G-F12 after G4 closure. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts. An action remains here only when the current R2/DESIGN package requires that delta or an explicit positive-reuse proof.

##### Exact upstream package

- R1 `research.md`: `d2eb1627e2b9a145f785b04829b56c623b7431e9`.
- R2 `requirements.md`: `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`.
- DESIGN `solution-design.md`: `a3d335359e6c716dc7d22f386b3a9956121e81ca`.
- Corrected P3 `GW-DOC-INSTALLATION-READINESS`: `9c2ec83a9552b7583f90e91080c014df4d6870df`.
- P6 `GW-DOC-CANONICAL-CONTRACTS-V2`: `71f829cff8824db18194689eccdec83da6f5d19f`.
- SD13 checkpoint and SD10 scope/forecast/V4-V6 realization are consumed only because current DESIGN positively proves those canonical capabilities; T1 does not reimplement them.

##### Traceability law

Every stable P3 requirement and every package-local atomic obligation follows:

```text
canonical P3 / package consequence
 -> exact current R1 evidence
 -> exact current R2 consequence
 -> exact DESIGN disposition
 -> one IA implementation owner, one DESIGN-positive-reuse proof owner, or POSITIVE_NO_CHANGE
 -> exact verification owner
```

A positive no-change or baseline-reuse disposition is an implementation instruction: **do not edit for that obligation** and revalidate the named evidence/proof. If execution disproves it, return upstream.

##### Execution ownership

A semantic phase may reference an IA action owned by another phase. That reference is a consumer dependency, not permission to re-implement the action. Each IA01-IA34 entry is defined exactly once in `12-action-catalog.md`. IA entries may own a production mutation, a verification-only delta, a DESIGN-positive-reuse/no-code proof obligation, rendered-product acceptance evidence, or final closeout; they do not create a second task representation.

IA27-IA34 are the presentation reconstruction owners inside the one signed cumulative task. IA27 is the **foundation reconstruction owner**: it positively retains only the exact seven atomic adapters named by SD21/P4 §16.6, destructively removes the exact 20 design-bearing composition primitive implementations plus the five old application/WorkItem shell-integration files and their structural selectors/implementation-specific geometry assertions, permanently removes the old `WorkbenchLayout.tsx` API, and then authors the fresh `WorkbenchAppShell.tsx`, `WorkbenchWorkItemShell.tsx`, `workbench-responsive.ts`, reconstructed composition primitives, and fresh application/WorkItem shell integration from current P3/P4 and reviewed new-design references. Its procedural purge checkpoint contains no replacement primitive JSX and is recorded as bounded in-task observational evidence rather than a Git commit. IA27 closes only after the fresh foundation passes architecture/theme/responsive/accessibility/rendered proof. IA28-IA34 are blocked until that PASS, then own destructive screen replacement. Each screen phase deletes its old owned screen files plus assigned legacy selectors before replacement authorship and may not copy or incrementally transform pre-purge screen implementation. Later phases consume the accepted foundation and may not redesign it locally.

IA26 is a verification-only terminal acceptance action. It uses the reviewed `docs/references/workbench-ui/` SVG pack only as derived visual comparison material, with current R2/DESIGN/P3-P6 authority prevailing on any conflict. It does not create a screenshot-as-authority mechanism, a second UI specification, or a new product/runtime dependency.

SD13 checkpoint protocol and SD10 scope/forecast/V4-V6 behavior are current execution capabilities positively proven by DESIGN. IA07/IA08 therefore prove/reuse those capabilities and authorize **no T1 production mutation** to their existing owners.

SD20 is a verification-only delta. IA23 owns its permanent realization through `tests/opencode.test.ts` and `.github/workflows/ci.yml`: the actual supported OpenCode 2.2.6 process is exercised through Order's production OpenCode boundary while deterministic model responses are provided by exact isolated CI tooling `opencode-drive@2.4.1` + `effect@4.0.1`. These verification tools are not product/runtime dependencies and do not enter `package.json`, lockfiles, release bundles, Order configuration or runtime state.

##### Signed scope and forecast law

The canonical PLAN contains exactly one signed execution task because `GW-DOC-CANONICAL-CONTRACTS-V2` does not promote dependency candidate bytes into later task baselines. That task uses:

- the exact same **66 repository paths** for signed `scope` and `changeSurface`; no directory-wide `src/**`, `ui/src/**` or `tests/**` mutation envelope is authorized;
- explicit `exclusions` for DESIGN-positive-reuse paths, positively retained atomic UI adapters and approved non-screen helpers that must remain unchanged;
- IA01-IA34 as ordered internal implementation/proof phases. IA phase ownership constrains what a phase may change but is not a second P6 task/scope representation.

The baseline V4/V5/V6 forecast-variance capability remains canonical execution machinery, but this exact package deliberately does not use a broader scope to admit new physical paths. A path absent from the 66-path forecast is also absent from signed scope and therefore returns upstream for DESIGN/PLAN correction. This prevents the one-task packaging correction from becoming implicit authorization for unrelated cleanup, speculative decomposition or presentation-layer drift.
##### Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

For SD02, manifest authority selection is the reachable source set; IA02 must project only the lifecycle-applicable stable/versioned material selected by the pinned schema/stage/explicit refs. A retained historical source may remain reachable without entering current v2 context by raw layer membership.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

##### Foundation and screen replacement non-reuse law

For IA27, the current design-bearing Workbench primitive implementation, structural CSS and implementation-specific geometry assertions are defect evidence only. The exact P4 §16.6 destructive set must be purged before replacement primitive authorship; only the exact positively retained atomic set may cross that checkpoint unchanged. Purge and rebuild are ordered phases inside the one signed task, not separate candidates or Git commits.

For IA28-IA34, current screen implementation is defect evidence only.

- pre-reconstruction screen blobs are not preservation targets, compatibility targets, migration sources or implementation templates;
- each phase must delete its owned old screen files and its exact ledgered legacy selectors before replacement authorship, recording the deleted path/selector set as bounded in-task observational evidence; the purge checkpoint is procedural and is not a Git commit or validation result;
- `ui/src/styles.css` and `ui/src/theme.css` remain shared physical stylesheet owners inside the single signed task: IA27 owns foundation/theme/structural selectors, while IA28-IA34 may delete or replace only the screen-specific selectors assigned to their phase; a screen phase may not redesign IA27's accepted foundation through those files;
- a replacement screen phase may reuse only the accepted IA27 reconstructed foundation, positively retained atomic adapters, approved leaf/content mechanisms and canonical non-screen domain/query/policy owners;
- copying old JSX/DOM structure, screen-local state branching, field grouping, table-column design, card/panel composition, action placement, responsive markup, CSS classes or visual hierarchy is a phase breach;
- a screen-information schema is design-time trace material only and must not become a DTO/browser state family;
- phase completion requires deletion evidence plus fresh schema, semantic, interaction and rendered evidence;
- no IA28-IA34 phase may resurrect `WorkbenchLayout`, create a second AppShell/application toolbar, duplicate structural `matchMedia` ownership, or mutate the accepted foundation for screen convenience.
##### Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Do **not** return upstream solely because an otherwise admissible path is absent from `changeSurface`; that case follows the governed V4/V5/V6 variance proof.

---

### Compiled component: `implementation-plan/01-a01-lifecycle-product.md`

#### A01 — Lifecycle and product identity

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C01 + C21.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O03`, `C01-O05`, `C01-O08` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O01`, `C01-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O03`, `C01-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **5**.

##### Corrected-upstream authority no-code dispositions

These rows carry material R2 consequences that are already corrected in canonical authority. They authorize **no T1 edit** but remain explicit execution/proof instructions so the correction cannot disappear from the package.

| Trace key | DESIGN disposition | Execution owner | Exact current authority | Required proof |
|---|---|---|---|---|
| `A01-NC01` — C01 verified-terminal success/no-code distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1`, §8 | Recheck exact authority identity plus R1 C01-O06/O13/O14 under V4; any contradiction returns to R2/DESIGN. |
| `A01-NC02` — C01 `GW-P2-CONTROLLED-WORK` cross-reference | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-WORK-LIFECYCLE` blob `013bc1297c3d167b776e115f428517b7cedbea57`, §7 → System Brief §9 | Recheck exact authority identity plus R1 C01-O14 under V4; do not edit runtime behavior for this documentation correction. |
| `A01-NC03` — C21 canonical product-language/commit boundary | `ALREADY_CORRECTED_NO_CODE` | NONE — no additional P2 edit in T1 | `GW-DOC-PRODUCT-IDENTITY` blob `f45ee2ea00cf91c5b861c59d3d19f72b3e39611f` | Recheck exact authority identity and corrected C21-F01/F02/F04 semantics under V4; IA19 changes only the still-violating README/terminal projections. |
| `A01-NC04` — C01 WorkItem-stage vs execution-subflow distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1` | Recheck C01-F01/C01-O03/O05/O08 and exact authority identity under V4; no new lifecycle/state mutation. |
| `A01-NC05` — C01 lifecycle-context stage/role/work-kind distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-LIFECYCLE-CONTEXT` blob `4ce2b49b9eb57e60ddd2b1e3664fdd4e11cbbbc7` | Recheck C01-F02/X-C01-C22-01 and exact authority identity under V4; no new stage/role/work-kind state. |

No-code rows in phase: **5**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | `SD01`, `SD27` | `IA19`, `IA33` | — | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim; IA33 owns the rebuilt terminal-result composition. |

Package atoms in phase: **1**.

##### Referenced actions

- **IA19** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA33** — consume the single Complete/Evidence/Context destructive replacement definition for terminal-result composition.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every corrected-upstream no-code row remains byte-current and receives no T1 mutation;
5. every package atom is satisfied by its one execution owner;
6. action-specific exact proof propositions plus `13-verification-closeout.md` pass;
7. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/02-a02-governance-intake.md`

#### A02 — Project governance and WorkItem intake

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C22 + C02.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `C16-O02`, `C16-O05`, `C22-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O02`, `C16-O05`, `C22-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `C02-O01` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O01` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `C02-O02`, `C02-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O02`, `C02-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `C02-O04`, `C02-O05`, `C02-O07` | `MIXED_TECHNICAL_DELTA` | `SD03`, `SD22` | `IA11`, `IA28` | — | Preserve catalog/body/metadata semantics while rebuilding Create onto the canonical Form/configuration composition; verify daemon/browser plus rendered acceptance. |
| `GW-FR-029-NO-IDE-SCOPE` | `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `C02-O07`, `C02-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O07`, `C02-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `C22-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C22-O09` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Prove the reachable authority graph is resolved before provider use and the productive stage materializes only the pinned-schema/stage/explicit-ref applicable stable/versioned subset; retained V1 reachability alone must not inject V1 into current v2 context. Recheck via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **8**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C22-01` | C22-F01/C22-F02 | `SD02` | `IA01`, `IA02` | — | Resolve same-layer precedence/default/override/extension and fitness bindings over the reachable graph, then derive stage materiality from the pinned schema/stage/explicit refs so retained semantic versions remain live by exact versioned ref without leaking into unrelated current-schema context; IA02 owns the production-path proof. |
| `PL-C02-01` | C02-F01 | `SD03`, `SD22` | `IA11`, `IA28` | — | Ordinary Create language is Concerns and the rebuilt Create composition realizes the controlled authoring hierarchy. |
| `PL-C02-02` | C02-F02 | `SD03`, `SD22` | `IA11`, `IA28` | — | Linked remediation project is fixed to parent project and the rebuilt remediation task panel exposes no editable cross-project choice. |
| `PL-C02-03` | C02-F03/C04-F01 | `SD04` | `IA09`, `IA10` | — | Created and discovered sources share one productive admission/persistence owner. |

Package atoms in phase: **4**.

##### Referenced actions

- **IA11** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single Queue/Create destructive screen replacement definition; C02 owns authoring semantics, not shared primitive implementation.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. SD02 certification is owned by IA02 and proves the productive production path, including stable-current versus explicit-versioned materiality with both retained and current sources selected/reachable, not only the pure helper/daemon unit boundary;
6. action-specific tests plus `13-verification-closeout.md` pass;
7. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/03-a03-queue-source.md`

#### A03 — Queue, source admission and documentation Git

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C03 + C04.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `C04-O01`, `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O01`, `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-014-SOURCE-FRESHNESS` | `C04-O14`, `C02-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O14`, `C02-O12` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `C04-O07`, `C04-O14` | `MIXED_TECHNICAL_DELTA` | `SD04` | `IA09`, `IA10` | — | Recheck `C04-O07`, `C04-O14` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `C03-O04`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O04`, `C03-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `C04-O03`, `C04-O08`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03`, `C04-O08`, `C04-O14` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `C04-O01`, `C04-O02` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O01`, `C04-O02` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `C04-O04`, `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O04`, `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `C04-O08`, `C04-O10`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O08`, `C04-O10`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `C04-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `DIRECT-FR066` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR066` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `C18-O11`, `DIRECT-FR067` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C18-O11`, `DIRECT-FR067` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `DIRECT-FR068` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR068` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `C05-O07`, `C18-O04`, `C18-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O07`, `C18-O04`, `C18-O11` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `C04-O12`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O12`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `C04-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O12` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `C03-O06`, `C03-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O06`, `C03-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `C04-O02`, `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `C03-O04`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O04`, `C04-O14` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **25**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C03-01` | C03-F01 | `SD05`, `SD22` | `IA12`, `IA28` | — | Including archived work expands the candidate set without bypassing project/search filters; IA28 owns the rebuilt Operational-scan presentation. |
| `PL-C04-01` | C04-F01 | `SD04` | `IA09`, `IA10` | — | Source-admission owner is singular across creation/discovery. |
| `PL-C04-02` | C04-F02 | `SD06`, `SD23` | `IA13`, `IA29` | — | Documentation-Git confirmation shows the exact governed paths/states before commit inside the rebuilt WorkItem/document composition. |

Package atoms in phase: **3**.

##### Referenced actions

- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA12** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA13** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single Queue/Create destructive screen replacement definition for the Queue operational-scan surface.
- **IA29** — consume the WorkItem/document destructive screen replacement definition for source/document/Git presentation.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/04-a04-workbench-research.md`

#### A04 — Workbench current attention and Research input

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C05 + C06.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD29`, `SD30` | `IA27`, `IA29`, `IA26` | — | Re-prove the local Workbench after destructive shared-foundation reconstruction and destructive shell/screen replacement via core/daemon/browser/certification plus rendered acceptance. |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Recheck `C06-O02`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15`, `C05-O02`, `C05-O10` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O03`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD24`, `SD26`, `SD29`, `SD30` | `IA27`, `IA29`, `IA30`, `IA32`, `IA26` | — | IA27 must reconstruct the shared foundation-owned geometry from P3/P4/new-design authority before replacement screens consume it; both foundation and screens pass semantic + rendered geometry proof. |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `TECHNICAL_DELTA` | `SD21`, `SD22`, `SD23`, `SD24`, `SD25`, `SD26`, `SD27`, `SD28` | `IA27`-`IA34` | — | Recreate Primary/Supporting/Technical hierarchy from fresh screen-information schemas in every interaction class; local SD11/12/14 semantics remain inputs to the owning replacement task. |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Destructively rebuild the shared primitive spatial grammar first, then destructively replace every screen family so it consumes that accepted foundation; rendered evidence is required at both boundaries. |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Every renderer must resolve to its P4 interaction class; old recurring feature-owned UI grammar is deleted. |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O02` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `VERIFICATION_DELTA` | `SD17` | `IA21` | — | Recheck `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **18**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C05-01` | C05-F01 | `SD07` | `IA14` | — | Exact current attention owner/reason/action remains visible/reachable while other material is inspected. |
| `PL-C06-01` | C06-F01 | `SD08` | `IA04` | `IA03` | Authority-changing input is not sufficient durable authority until a later adopted canonical proposal exists. |

Package atoms in phase: **2**.

##### Referenced actions

- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA04** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27** — consume the destructive Workbench foundation purge/reconstruction/acceptance definition.
- **IA29** — consume the single WorkItem shell/Work request destructive screen replacement definition.
- **IA30** — consume the single productive pre-signoff destructive screen replacement definition.
- **IA32** — consume the single Implementation destructive screen replacement definition where C05 geometry is shared.
- **IA26** — consume the rendered acceptance owner; this phase does not produce screenshots independently.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/05-a05-requirements-design.md`

#### A05 — Requirements and DESIGN authority mutation

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C07 + C08.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `C07-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C07-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **1**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C07-01` | C07-F01 | `SD09` | `IA03` | — | R2 can propose/adopt validated current P2/P3 canonical-owner amendments through the one proposal mechanism. |
| `PL-C08-01` | C08-F01 | `SD09` | `IA03` | — | DESIGN can propose/adopt validated current P4/P5/P6 canonical-owner amendments through the same mechanism. |

Package atoms in phase: **2**.

##### Cross-domain presentation reconstruction dependency

Requirements and Solution design retain their existing authority/proposal semantics, but their old runtime screens are discarded and replaced by SD24/IA30 as part of PL-C19-02. This phase supplies stage-specific governed information; it does not own another layout grammar.

##### Referenced actions

- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the single productive pre-signoff destructive screen replacement definition for Requirements and Solution design.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/06-a06-plan-readiness.md`

#### A06 — PLAN contract and R3 readiness

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C09 + C10.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O01`, `C10-O09`, `C10-O10` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O04`, `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `TECHNICAL_DELTA` | `SD11`, `SD25` | `IA16`, `IA31` | — | Typed R3 verdict semantics and the rebuilt Review composition must jointly make readiness/findings/return owner dominant; verify semantic + rendered evidence. |

Stable rows in phase: **3**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C09-01` | C09-F01 | `SD10` | `IA05` | — | Current-v2 Change/Defect task packages must satisfy P6 §37.4 mechanical non-vacuity through the one schema-aware admission owner while published v1 validation semantics remain unchanged; material task sufficiency remains owned by PLAN semantic conformance and independent R3. |
| `PL-C10-01` | C10-F01 | `SD11`, `SD25` | `IA16`, `IA31` | — | Readiness dominant verdict is typed R3 outcome and IA31 owns its canonical Review presentation. |

Package atoms in phase: **2**.

##### Referenced actions

- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA05** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the shared pre-signoff destructive screen replacement for the Implementation plan surface.
- **IA31** — consume the single Readiness/Approval destructive Review replacement definition for R3 presentation.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/07-a07-approval-execution.md`

#### A07 — Approval and execution

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C11 + C12.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `C12-O01`, `C12-O02`, `C12-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O01`, `C12-O02`, `C12-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `C12-O12`, `C12-O13`, `C12-O19` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O12`, `C12-O13`, `C12-O19` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `C11-O01`, `C11-O03`, `C12-O20` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C11-O01`, `C11-O03`, `C12-O20` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `C11-O01`, `C11-O02`, `C11-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C11-O01`, `C11-O02`, `C11-O07` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `C04-O15`, `C12-O03`, `C12-O17` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15`, `C12-O03`, `C12-O17` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `C12-O17`, `C17-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O17`, `C17-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED_TECHNICAL_DELTA` | `SD12`, `SD25` | `IA17`, `IA31` | — | Preserve Approval identity/currentness semantics while rebuilding the Review composition so readiness/task meaning precede technical identity; semantic + rendered proof required. |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O17` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `C12-O16` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O16` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **10**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C11-01` | C11-F01 | `SD12`, `SD25` | `IA17`, `IA31` | — | Approval presents readiness/currentness before technical identity and IA31 owns the rebuilt Review composition. |
| `PL-C11-02` | C11-F02 | `SD12` | `IA06` | — | Canonical approval identity is trimmed/nonblank at ingress. |
| `PL-C12-01` | C12-F01 | `SD13` | `IA07` — DESIGN-positive-reuse proof only | — | Signed in-task architecture checkpoint remains coordinator-executable without provider shell permission; T1 consumes the existing capability and does not implement it. |
| `PL-C12-02` | C12-F02 | `SD10` | `IA08` — DESIGN-positive-reuse proof only | — | Signed scope/exclusions remain the hard execution boundary; `changeSurface` is exact forecast evidence; admissible in-scope unforecast decomposition is governed by existing V4/V5/V6 and is not reimplemented by T1. |

Package atoms in phase: **4**.

##### Referenced actions

- **IA17** — consume the single implementation definition in `12-action-catalog.md`.
- **IA06** — consume the single implementation definition in `12-action-catalog.md`.
- **IA07** — consume the single baseline-checkpoint proof definition; authorize no checkpoint-protocol production edit.
- **IA08** — consume the single scope/forecast/V4-V6 baseline proof definition; authorize no execution-foundation production edit.
- **IA31** — consume the Readiness/Approval destructive Review replacement definition for C11 presentation.
- **IA32** — consume the Implementation destructive operational master/detail replacement definition for C12 presentation; execution semantics remain owned by existing core/daemon contracts.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/08-a08-complete-materials.md`

#### A08 — Complete and governed materials

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C13 + C14.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | `C13-O01`, `C13-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C13-O01`, `C13-O05` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | `C14-O05`, `C14-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O05`, `C14-O06` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | `C14-O09`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O09`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `C13-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C13-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | `C14-O05`, `C14-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O05`, `C14-O06` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | `C14-O03`, `C14-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O03`, `C14-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | `C14-O08`, `DIRECT-FR242` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O08`, `DIRECT-FR242` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| — | — | — | — | — | No package-local atom beyond stable-requirement coverage. |

Package atoms in phase: **0**.

##### Cross-domain presentation reconstruction dependency

C13/C14 domain semantics remain stable, but Complete, Evidence and Context/material presentation is rebuilt by SD27/IA33 under PL-C19-02. This phase does not preserve the current feature-card/layout implementation as a baseline.

##### Referenced actions

- **IA33** — consume the single Complete/Evidence/Context destructive replacement definition; C13/C14 remain the semantic owners of outcome/material meaning.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/09-a09-provider-settings.md`

#### A09 — Provider, installation and Settings

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C15 + C16.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007` | `TECHNICAL_DELTA` | `SD19` | `IA25` | — | Recheck `DIRECT-FR007` via new `tests/installer.test.ts`; existing `tests/order-migration.test.ts` + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `DEPENDENCY_DELTA` | `SD22` | `IA28` | `IA34` owns full account management only | Rebuild the global active-account quick-access renderer with the application shell; prove `SURF-APP-001` active-account visibility/routes to Settings plus tests/browser.spec.ts and tests/certification.test.ts; no second account-management owner |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `C16-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O07` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `C16-O09`, `C16-O10`, `C16-F04` | `TECHNICAL_DELTA` | `SD19` | `IA25` | — | Recheck corrected fresh-install readiness via new `tests/installer.test.ts`; retain existing Settings/recovery proof in tests/browser.spec.ts, tests/certification.test.ts and tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `DIRECT-FR080` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR080` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `C16-O06`, `DIRECT-FR081` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06`, `DIRECT-FR081` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `C16-O04`, `DIRECT-FR082` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O04`, `DIRECT-FR082` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `C16-O02`, `C16-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O02`, `C16-O03` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `C16-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O04` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `C15-O03`, `C15-O04`, `C15-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O03`, `C15-O04`, `C15-O08` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `C15-O12`, `C15-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O12`, `C15-O13` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `C15-O03`, `C15-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O03`, `C15-O04` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `C15-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O05`, `C15-O07`, `C15-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `C15-O09`, `C15-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O09`, `C15-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `C15-O01`, `C15-O07`, `C15-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O01`, `C15-O07`, `C15-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **21**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C16-01` | C16-F01 | `SD14`, `SD28` | `IA18`, `IA34` | — | Settings primary hierarchy is operator readiness/meaning/action, with exact technical identity secondary except task-required; IA34 owns the rebuilt Settings/account/configuration presentation. |
| `PL-C16-02` | C16-F02 | `SD19` | `IA25` | — | Fresh productive install cannot succeed with mandatory repository/account/model setup deferred to Settings. |
| `PL-C16-03` | C16-F03 | `SD19` | `IA25` | `PRE_T1_P6_CORRECTION_DONE` | P6 must preserve incomplete-v4 recovery capability while forbidding productive installer success at that state. |

Package atoms in phase: **3**.

##### Referenced actions

- **IA25** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the application-shell destructive replacement for the globally visible active OpenCode-account quick-access affordance; full account management remains IA34-owned.
- **IA34** — consume the single Settings/OpenCode/account-management/configuration destructive replacement definition; provider/configuration semantics remain with existing owners.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/10-a10-recovery-accessibility.md`

#### A10 — Recovery, current attention and accessibility

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C17 + C18.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O15`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O02`, `C17-O05`, `C17-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O04`, `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD29`, `SD30` | `IA27`-`IA34`, `IA26` | — | Preserve semantic continuity by reconstructing the single foundation-owned responsive topology in IA27, then make every replacement screen consume it; certify the foundation and every domain with rendered responsive evidence. |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C18-01` | C18-F01 | `SD15` | `IA15` | — | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. |

Package atoms in phase: **1**.

##### Referenced actions

- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the foundation-reconstruction then screen-replacement owners for responsive/accessibility re-composition; IA27 is the single structural responsive owner and no later phase owns local layout policy.
- **IA26** — consume the exact-candidate responsive rendered acceptance owner.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/11-a11-component-certification.md`

#### A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `bdeb93a3528758529d0828d6d69febe66edb8d51`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Permanently prove the actual OpenCode 2.2.6 process/session boundary through `tests/opencode.test.ts` and `.github/workflows/ci.yml`, using exact isolated `opencode-drive@2.4.1` + `effect@4.0.1` deterministic model simulation; retain existing daemon/certification fake-provider fixtures as complementary proof and explicitly exclude remote-provider/OAuth/model-quality claims + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | `IA15`, `IA20`, `IA21`, `IA22`, `IA26` | — | Existing semantic/state certification remains mandatory and exact-candidate rendered acceptance is added across the complete governed UI surface. |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Destructively reconstruct/certify the canonical primitive/theme foundation from current authority, then destructively replace every screen family and delete competing legacy foundation/screen presentation ownership; rendered proof required. |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Equivalent roles must resolve through the freshly reconstructed shared composition foundation or positively retained atomic adapters rather than feature-specific presentation; certify foundation first and screen system again after destructive replacement. |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | `IA27`, `IA28`-`IA34`, `IA26` | — | Root theme preference semantics remain, but design-bearing primitive/CSS realization is reconstructed; replacement screens consume the accepted foundation and parity is re-proved through semantic + rendered evidence. |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02 | `SD21`-`SD29` | `IA27`-`IA34` | — | Purge and reconstruct the design-bearing primitive/theme foundation first, then destructively replace the complete screen layer; forbid reuse of both pre-purge foundation composition and pre-purge screen composition. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |
| `PL-C20-03` | C20-F05 | `SD30` | `IA26` | — | Exact-candidate GitHub Actions evidence covers every governed screen/state and all three acceptance dimensions with no unresolved FAIL. |

Package atoms in phase: **5**.

##### Referenced actions

- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA20** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA22** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the single foundation-first/domain-reconstruction definitions for PL-C19-02; IA27 owns the shared foundation and IA28-IA34 consume it. A11 owns cross-domain closure, not duplicate renderer implementation.
- **IA26** — consume the exact-candidate rendered acceptance definition for PL-C20-03.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/12-action-catalog.md`

#### 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

##### Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD30; IA01-IA34 | — | one cumulative 66-path 0.6.0 candidate; internal waves below own ordered mutation/proof responsibilities | IA27-IA34 enforce purge-before-fresh-authorship with bounded in-task evidence; no intermediate Git commit/candidate boundary and no compatibility presentation path | final V0-V7 + SD16-SD18/SD29 certification + IA26/SD30 exact-candidate 37-SURF acceptance |

**Audit rule:** T1 is the only P6 ExecutionTask. Wave/IA ordering below is internal implementation sequencing and never relies on candidate-byte promotion between tasks. A later phase discovering a foundation defect returns to IA27/DESIGN rather than patching around it; T1 cannot close until every owned phase obligation and final candidate proof is satisfied.

##### Execution waves

0. **Preflight 0 — DESIGN-positive reuse proof:** IA07-IA08. No production mutation.
1. **Wave 1 — authority/source/task/runtime corrections:** IA01-IA10 plus IA25 where still unsatisfied.
2. **Wave 2 — destructive Workbench foundation + shell cutover:** IA27. Purge the compromised design-bearing primitive layer plus old application/WorkItem shell integration, then build and accept the fresh shared foundation inside the same signed task. No material-screen reconstruction may begin until this wave passes.
3. **Wave 3 — destructive Queue/Create/account-utility replacement:** IA11, IA12, IA28 inside the accepted application shell.
4. **Wave 4 — destructive Work request/document replacement:** IA13, IA14, IA29 inside the accepted WorkItem shell.
5. **Wave 5 — destructive productive pre-signoff screen replacement:** IA15, IA30.
6. **Wave 6 — destructive Readiness/Approval replacement:** IA16, IA17, IA31.
7. **Wave 7 — destructive Implementation replacement:** IA32.
8. **Wave 8 — destructive Complete/Evidence/Context replacement:** IA19, IA33.
9. **Wave 9 — destructive Settings/account-management/configuration replacement:** IA18, IA34; the global shell account quick-access renderer is already owned by Wave 3.
10. **Wave 10 — permanent semantic/component certification:** IA20-IA22.
11. **Wave 11 — cross-solution regression closure:** IA23.
12. **Wave 12 — rendered product acceptance:** IA26.
13. **Wave 13 — candidate closeout:** IA24.

Before Wave 1, BUILDER requests the signed `dependency-lock` gate once through the existing SD13 coordinator checkpoint and it must `GATE_PASSED`. IA27 is one coherent reconstruction phase inside T1: first delete the exact 20 design-bearing primitive implementations, old `app.tsx`/WorkItem shell integration, associated structural selectors and implementation-specific compatibility assertions with no replacement foundation/shell JSX; record the exact deleted path/selector set as bounded existing observational evidence; then create the fresh foundation/shell implementation and request the applicable signed architecture/test/build/browser checkpoints. The purge observation is not a candidate, Git commit or validation result. The seven positively retained atomic adapters and approved content leaves cross this boundary unchanged. No `WorkbenchLayout` compatibility facade or second AppShell/responsive owner is allowed. IA28-IA34 cannot begin before IA27 acceptance. Every IA28-IA34 phase repeats purge-before-fresh-authorship for its own old screen files and exact ledgered screen selectors, then recreates those paths from current R2/SD22-SD28 using the accepted foundation. A later phase may not patch/copy the pre-purge implementation or redesign foundation locally. The exact 37 audited `SURF-*` rows are partitioned across IA27-IA34 below. Each owning phase must pass schema/information, UX/interaction and visual/UI review before the next reconstruction phase begins; IA26 independently rechecks the complete exact-candidate union. Wave 10 proves the complete replacement renderer/component/theme system semantically. Wave 12 produces exact-candidate rendered evidence only after ordinary gates are green. Wave 13 closes only after every rendered row is accepted.
##### IA01 —## IA01 — pure project-authority resolution

**Solution:** SD02.  
**Owner/anchors:** `src/core/governance.ts`, existing authority-layer/concern/material/freshness pure functions.  
**Required mutation:** add the minimum pure resolved-authority projection over validated manifest inputs and shell-expanded selected paths, preserving the selected P1-P6 set as authority reachability, exact stable/versioned ref-to-source identity, same-layer precedence plus inherited P1 default/override/extension and fitness bindings. IA01 does not decide stage materiality.  
**Forbidden:** filesystem/provider I/O; semantic contradiction inference; DTO/service/repository/class family; parallel authority graph.  
**Proof:** `tests/core.test.ts` ordering/default/override/extension/invalid-input cases.

##### IA02 — consume resolved authority before productive context

**Solution:** SD02. Depends on IA01.  
**Anchors:** `src/daemon/authority.ts::resolveStageContextState/resolveStageContext`; `src/daemon/stage.ts::stagePrompt` and stage admission.  
**Required mutation:** consume IA01 result before provider context/conformance/sign-off dependency construction, then derive the applicable material-authority subset from the pinned WorkItem schema/template, mandatory stage policy and explicit upstream/signed authority refs plus dependencies. Stable refs bind current canonical owners; explicit versioned refs bind exact retained snapshots. A selected/reachable retained source must not become stage material merely because it shares an authority layer. Invalid/unresolved applicable bindings block before provider use.  
**Forbidden:** provider interpretation of raw manifest order as precedence; daemon-owned second authority graph; include-every-selected-source context projection; implicit promotion of retained historical sources into current-schema context; context construction that bypasses the IA01 resolved projection or the canonical lifecycle-context applicability rule.  
**Proof:**
- `tests/daemon.test.ts` — productive-context admission consumes the resolved projection, derives the schema/stage-applicable material subset, excludes an unrelated retained V1 source from a current-v2 context, includes the exact retained source when a pinned historical schema or explicit versioned ref requires it, and blocks unresolved applicable bindings before provider use;
- `tests/certification.test.ts` — representative production project manifest with both current and retained semantic sources plus same-layer precedence/default/override/extension reaches the real STAGE context with only the applicable material set in resolved order. Current-v2 and historical exact-version cases are both proved, and an equivalent unresolved simultaneously-applicable relation fails before any provider turn. The certification must fail if production falls back to raw manifest array/filesystem order, include-every-selected-source projection, or provider interpretation.

##### IA03 — one GOVERNANCE proposal/adoption mechanism

**Solution:** SD09.  
**Anchors:** `src/core/contracts.ts` proposal/ArtifactRef contracts; `src/core/governance.ts`; `src/daemon/stage.ts::proposalDisposition/proposalAdoptionRequest/adoptArtifactProposal/reconcilePendingArtifactProposals`; `src/daemon/authority.ts`.  
**Required mutation:** R2 admits only current manifest-resolved P2/P3 targets; DESIGN only P4/P5/P6; exact role/layer/path/base-hash re-resolution before adoption.  
**Forbidden:** stage-specific proposal DTOs/direct provider writes/second decision store.  
**Proof:** core/daemon wrong-layer/path/hash/stale/adoption/freshness cases.

##### IA04 — durable-decision completion admission

**Solution:** SD08. Consumer dependency on IA03 when the durable target is permanent governance.  
**Anchors:** `src/core/lifecycle.ts::evaluateStageCompletion/validateStageProviderTurn`; `src/daemon/stage.ts::runStageTurn/submitRunInput`.  
**Required mutation:** after latest answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, reject stage completion until later adopted authority exists. INFORMATION/EVIDENCE remains unchanged.  
**Proof:** core/daemon chronology cases for adopted/rejected/cancelled/stale and ordinary information input.

##### IA05 — schema-aware current-v2 task admission

**Solution:** SD10.  
**Owners/anchors:** existing `SignedTaskBlockSchema` remains unchanged in `src/core/contracts.ts`; `src/core/execution.ts::parseSignedTaskBlockFromPlan` remains the one structural parser and gains one pure schema-aware admission helper over the parsed block; `src/daemon/stage.ts` owns PLAN/R3 authoring/conformance invocation; `src/daemon/authority.ts::validateTaskDefinitions` owns R3/sign-off deterministic task validation.  
**Required mutation:** for `change-v2`/`defect-v2` only, enforce P6 §37.4 mechanical non-vacuity: non-empty task list; trimmed non-empty id/objective; non-empty scope, acceptanceRefs, changeSurface, gateIds, authorityRefs and concernIds. Keep `dependsOn`/exclusions optionally empty. The PLAN/R3 provider contract states these same v2-only mechanical clauses alongside the unchanged shared JSON Schema. PLAN conformance and R3/sign-off call the same pure admission owner. Published `change-v1`/`defect-v1` parsing/validation meaning is unchanged.  
**Semantic boundary:** mechanical presence is not material task sufficiency. Existing PLAN conformance questions still prove objective/dependencies/traceability, module ownership/decomposition, checkpoint placement, surfaces, deletions/replacements, completion evidence, minimum-change forecast and verification contract; R3 independently challenges complete P1-P7 traceability/readiness.  
**Forbidden:** tightening the shared SignedTaskBlock schema globally; a v2-only shadow task schema/parser; a second semantic-review path.  
**Proof:** `tests/core.test.ts` preserves v1 cases and proves v2 positive/negative mechanical admission; `tests/daemon.test.ts` proves PLAN and READY_FOR_SIGNOFF/sign-off cannot bypass v2 admission; `tests/certification.test.ts` binds the single parser/admission/prompt path and rejects duplicate task schema/parser ownership.

##### IA06 — canonical Approval identity normalization

**Solution:** SD12.  
**Anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts::signOffWorkItem`.  
**Required mutation:** trim and reject whitespace-only `approvedBy` before persistence.  
**Proof:** core/daemon direct-ingress negative tests plus browser feedback.

##### IA07 — signed-checkpoint DESIGN-positive reuse proof

**Solution:** SD13; package atom `PL-C12-01`.  
**Existing realization evidence owners:** existing `src/core/contracts.ts`, `src/core/execution.ts`, `src/daemon/execution.ts`, `src/daemon/validation.ts` and `src/shell/opencode.ts`.  
**Required action:** no T1 production mutation. Before Wave 1, revalidate that BUILDER alone may emit one terminal signed `GATE_CHECKPOINT_REQUESTED`, the coordinator checks freshness/current V2 scope before the effect, executes the signed gate, records existing GATE_PASSED/GATE_FAILED evidence, continues the same Run/provider session and never grants provider shell/execute. The implementation waves then consume this DESIGN-positive capability exactly as scheduled by `13-verification-closeout.md`.  
**Failure:** if current evidence cannot prove the DESIGN-required capability, stop before mutation and return upstream; do not self-bootstrap the checkpoint protocol.  
**Proof:** existing core/daemon/certification checkpoint success, failure, unsigned, out-of-scope and same-session cases plus exact current realization verification.

##### IA08 — signed-scope/forecast DESIGN-positive reuse proof

**Solution:** SD10; package atom `PL-C12-02`.  
**Existing realization evidence owners:** existing `src/shell/opencode.ts`, `src/daemon/validation.ts` and `src/daemon/execution.ts`.  
**Required action:** no T1 production mutation. Revalidate that signed scope/exclusions are the hard reach boundary, `changeSurface` is immutable forecast evidence, forecast absence alone is not V2 `SCOPE_BREACH`, and in-scope unforecast decomposition can proceed only through independent V4, architecture/governance V5 and coordinator-owned V6 minimum-change evidence.  
**Failure:** any contradiction blocks execution and returns to the owning pre-signoff layer; do not modify execution-foundation owners from this T1 to make the candidate admissible.  
**Proof:** existing daemon/certification in-scope-unforecast, out-of-scope/exclusion/protected-path, V6 `CHANGE_BLOAT` and architecture-fitness cases.

##### IA09 — singular new-source planner

**Solution:** SD04.  
**Anchor:** `src/daemon/work-item-source.ts::reconcileWorkItemSources/createWorkItemFromSource`.  
**Required mutation:** factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan from a validated source snapshot.  
**Proof:** created/discovered inputs produce equivalent admission plans except provenance.

##### IA10 — converge created/discovered persistence

**Solution:** SD04. Depends on IA09.  
**Anchor:** `src/daemon/work-item-source.ts`.  
**Required mutation:** route UI-created and discovered source snapshots through IA09 + existing applyPlan; delete direct create-path WorkItem construction/store.  
**Proof:** daemon one-persistence-owner, read-back, diagnostics and freshness tests.

##### IA11 — canonical Create interaction

**Solution:** SD03.  
**Anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required mutation:** ordinary vocabulary is Concerns; linked remediation shows fixed parent project context and no invalid cross-project selector. Preserve metadata/body ownership.  
**Proof:** browser ordinary creation, metadata ownership and linked-remediation tests.

##### IA12 — one archive/project/search derivation

**Solution:** SD05.  
**Anchors:** `ui/src/app.tsx::App`; `ui/src/WorkItemQueue.tsx::WorkItemQueue`.  
**Required mutation:** App selects active/include-archived canonical dataset then applies project/search exactly once; queue does not own alternate filtering.  
**Proof:** browser active/archived × project × search matrix while archive identity/history remains unchanged.

##### IA13 — exact documentation-Git review

**Solution:** SD06.  
**Anchor:** `ui/src/DocumentWorkspace.tsx::DocumentationGitConfirmation`.  
**Required mutation:** list exact canonical governed changed paths/states before commit; reuse existing Git status owner.  
**Proof:** browser exact-path/state review plus blocker cases. Do not alter save/status/eligibility semantics already proven conforming.

##### IA14 — current attention survives inspection

**Solution:** SD07.  
**Anchors:** canonical `src/core/lifecycle.ts::deriveCurrentAttention` remains unchanged owner; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts`.  
**Required mutation:** when inspected material differs from current owner, render exact higher-priority owner/reason/action and direct return while preserving legitimate inspection.  
**Proof:** presentation/browser required-input/proposal/blocker/stale/recovery with historical selection.

##### IA15 — focus once per required-input request

**Solution:** SD15.  
**Anchors:** `ui/src/ActivityComposer.tsx::ActivityComposer`; `ui/src/ActivityWorkspace.tsx::StageRunMaterial`.  
**Required mutation:** new current required-input event id moves focus once to Workbench composer; rerender/polling does not refocus.  
**Proof:** browser focus-once/rerender/responsive cases.

##### IA16 — canonical Readiness verdict

**Solution:** SD11.  
**Anchor:** `ui/src/ReadinessWorkspace.tsx::ReadinessWorkspace` plus existing presentation helper.  
**Required mutation:** dominant verdict is typed R3 completion outcome; maturity/currentness separate.  
**Proof:** READY_FOR_SIGNOFF/RETURN_TO_*/BLOCKED + stale material cases.

##### IA17 — Approval readiness/currentness hierarchy

**Solution:** SD12.  
**Anchor:** `ui/src/SignoffReview.tsx::SignoffReview`.  
**Required mutation:** readiness + package currentness precede task/technical identity; stale/history cannot fabricate readiness.  
**Proof:** browser/presentation current/stale package cases.

##### IA18 — operator-first Settings hierarchy

**Solution:** SD14.  
**Anchors:** `ui/src/SettingsWorkspace.tsx::SettingsWorkspace/RepositorySettings/ModelRuntimeSettings`.  
**Required mutation:** readiness/meaning/actions primary; exact roots/endpoints/model source/credential-like identity under Technical details except active configuration input.  
**Proof:** browser normal Settings, blockers, Add/Move/configuration cases.

##### IA19 — product-language projection

**Solution:** SD01.  
**Anchors:** `README.md`; `ui/src/TerminalResult.tsx::TerminalResult`; `ui/src/workbench-presentation.ts`.  
**Required mutation:** reuse the P4 terminal-result projection by adding/using one pure exhaustive product-facing `WorkOutcome` label mapping in `workbench-presentation.ts`; remove `TerminalResult.tsx` local enum prettification; make `TerminalResult` consume the shared mapping; correct README hero/intro/result-boundary copy so verified result is the umbrella outcome and implementation/candidate language is conditional; preserve the explicit operator-triggered WorkItem documentation-Git exception while prohibiting automatic implementation/candidate commit/push/merge/deploy.  
**Forbidden:** lifecycle/state/WorkOutcome contract changes; second product-label table in `TerminalResult`; generic enum prettification fallback; new DTO/view-model/service/state owner; candidate resources for non-candidate outcomes.  
**Proof:**
- `tests/workbench-presentation.test.ts` — exhaustive current `WorkOutcome` → canonical product-facing label cases, including `CANDIDATE_DONE -> Verified candidate`, and no underscore/title prettification fallback;
- `tests/browser.spec.ts` — Complete/TerminalResult candidate case renders **Verified candidate** and candidate resources; representative no-code terminal case renders its canonical non-candidate label and no candidate resources;
- `tests/certification.test.ts` — README contains verified-result umbrella + conditional implementation/candidate wording + explicit documentation-Git exception, and rejects universal candidate/delivery wording or an absolute no-commit claim that erases that exception.

##### IA20 — exhaustive renderer classification certification

**Solution:** SD16.  
**Owner:** `tests/certification.test.ts`.  
**Required mutation:** derive/check complete production renderer coverage against canonical P4 matrix, including ActivityComposer; fail on an unclassified renderer.  
**Forbidden:** edit `tests/architecture.test.ts` inside T1 or create second UI registry.  
**Proof:** certification negative/positive fixture.

##### IA21 — scenario-41 work-kind certification

**Solution:** SD17.  
**Owner:** `tests/browser.spec.ts`.  
**Required mutation:** certify all four kinds' Work request + Research information contracts and distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind semantic matrix.

##### IA22 — System/Light/Dark component-semantic parity

**Solution:** SD18.  
**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required mutation:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states preserve canonical semantic roles under all effective themes.  
**Proof:** semantic role/component assertions; no pixel-snapshot substitute.

##### IA23 — cross-solution regression closure

**Upstream:** all SD01-SD30.  
**Owners:** existing targeted core/daemon/presentation/browser/certification suites plus `tests/opencode.test.ts` and `.github/workflows/ci.yml` for SD20.  
**Required mutation:** fill any integration-level positive/negative gaps needed to prove the composed solutions without duplicating action-specific tests. Explicitly prove no compatibility fallback, shadow owner or implementation-derived semantics. For SD20 specifically, add one permanent exact-pin OpenCode integration tier: PR verification installs exact `opencode-drive@2.4.1` + `effect@4.0.1` into runner-temporary verification space, `tests/opencode.test.ts` launches the actual supported OpenCode `2.2.6` process through Order's production OpenCode environment/admission/session path, and deterministic model responses are supplied through the Drive simulation provider/controller. Existing `fake-opencode` fixtures remain lower-level doubles and do not satisfy this exact-pin proposition. Do not add the simulation tooling to Order's product/runtime package graph, lockfiles, release bundle, configuration or state, and do not claim remote-provider availability, Console OAuth/account connectivity or model quality from simulated responses.  
**Proof:** exact-pin SD20 integration case passes in permanent PR verification; all targeted suites green; V4/V5/V6 trace every added assertion/tooling change to an SD/requirement/atom.

##### IA24 — exact candidate closeout

**Upstream:** complete T1 with IA26 rendered UX/UI acceptance PASS.  
**Owner:** `CHANGELOG.md` plus coordinator-owned validation evidence.  
**Required mutation:** record user-visible/correctness consequences under Unreleased; run exact final six-gate union and V0-V7 with fresh V4/V5/V6, and bind closeout to the exact GitHub Actions rendered-acceptance run/evidence package accepted under IA26.  
**Terminal:** only CANDIDATE_DONE or valid ALREADY_SATISFIED. PR merge/release/version bump remain outside T1.

##### IA25 — guided productive installer completion

**Solution:** SD19.  
**Canonical authority:** P3 FR007 plus corrected P3 FR079 / Installation Readiness `9c2ec83a9552b7583f90e91080c014df4d6870df`, P4 GW-TR-007 and corrected P6.  
**Owner/anchor:** `src/shell/setup.ts::runInstallerGuidedSetup/runGuidedSetupInternal`; `src/installer.ts::configureOrder/runInstaller` is the existing caller and is not expected to change.  
**Required mutation:** remove/replace the fresh `configured === null` success/defer branch so installer-owned setup continues through existing private OpenCode login, model selection, exact target repository validation/selection and reference-root choices before returning success and proving productive daemon/readiness. Preserve valid incomplete v4 only as post-install/update daemon/Settings recovery and transient rollback-safe installer state. Preserve existing upgrade/migration retention and rollback.  
**Forbidden:** new config schema; second setup owner; mandatory post-install Settings/provider-login step; speculative `src/installer.ts` edit. If setup.ts alone cannot realize SD19, return to DESIGN/PLAN.  
**Proof:** create `tests/installer.test.ts` covering fresh productive setup success/failure/cancel and deferred-Settings rejection; existing `tests/order-migration.test.ts` must continue proving migration/rollback/continuity.


##### IA27 — destructively reconstruct the Workbench foundation and shell

**Solution:** SD21, with SD29 responsive/accessibility containment.

**Exact destructive primitive inputs (20):**
- `ui/src/primitives/WorkbenchAttention.tsx`
- `ui/src/primitives/WorkbenchContextPanel.tsx`
- `ui/src/primitives/WorkbenchDialogue.tsx`
- `ui/src/primitives/WorkbenchForm.tsx`
- `ui/src/primitives/WorkbenchIdentity.tsx`
- `ui/src/primitives/WorkbenchLayout.tsx` — delete permanently; no same-API recreation
- `ui/src/primitives/WorkbenchMasterDetail.tsx`
- `ui/src/primitives/WorkbenchRail.tsx`
- `ui/src/primitives/WorkbenchResourceRow.tsx`
- `ui/src/primitives/WorkbenchReview.tsx`
- `ui/src/primitives/WorkbenchSectionHeader.tsx`
- `ui/src/primitives/WorkbenchSelector.tsx`
- `ui/src/primitives/WorkbenchSettingsLayout.tsx`
- `ui/src/primitives/WorkbenchSurface.tsx`
- `ui/src/primitives/WorkbenchTable.tsx`
- `ui/src/primitives/WorkbenchTaskPanel.tsx`
- `ui/src/primitives/WorkbenchTimeline.tsx`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/primitives/WorkbenchState.tsx` — whole-region/compact state composition is design-bearing
- `ui/src/primitives/WorkbenchUtilityLink.tsx` — application-toolbar utility structure is design-bearing

**Exact shell-integration cutover inputs (5):** `ui/src/app.tsx`, `ui/src/WorkItemWorkspace.tsx`, `ui/src/WorkItemIdentityRow.tsx`, `ui/src/WorkflowRail.tsx`, `ui/src/WorkflowStepFrame.tsx`.

**New foundation owners (3):** `ui/src/primitives/WorkbenchAppShell.tsx`, `ui/src/primitives/WorkbenchWorkItemShell.tsx`, `ui/src/primitives/workbench-responsive.ts`.

**Positively retained atomic adapters (7, read-only throughout T1):** `WorkbenchAction.tsx`, `WorkbenchConfirmation.tsx`, `WorkbenchDisclosure.tsx`, `WorkbenchField.tsx`, `WorkbenchIcon.tsx`, `WorkbenchNotice.tsx`, `WorkbenchStatus.tsx`.

**Other physical owners:** `ui/src/theme.css`, `ui/src/styles.css`, `tests/certification.test.ts`, `tests/browser.spec.ts`.

**Required ordered mutation:**
1. classify every current primitive and shared structural selector/assertion against the exact destructive/retained ledger above; classify every surviving old screen selector to exactly one IA28-IA34 owner;
2. delete all 20 destructive primitive files and all five old shell-integration files plus their obsolete structural selectors and implementation-specific assertions; before replacement foundation/shell authorship, record the exact deleted path/selector set as bounded existing in-task observational evidence. This is a procedural purge checkpoint only: it creates no Git commit, candidate state or validation result, and no replacement primitive/shell JSX/DOM exists at that boundary;
3. record/review a fresh foundation composition schema from current P3/P4 and reviewed new-design references: one application-global shell, one selected-WorkItem shell, canonical interaction-class compositions, Primary/Supporting/Technical hierarchy, responsive semantic order and accessibility/focus responsibilities. This is design evidence, not a DTO/runtime model;
4. create `WorkbenchAppShell`, `WorkbenchWorkItemShell`, the one responsive owner, and freshly recreate the remaining 17 design-bearing composition primitive paths from their canonical responsibilities over pinned Astryx public APIs; freshly recreate `app.tsx` as the one root shell/destination orchestrator and the four WorkItem shell/frame adapters on the new foundation;
5. update `theme.css`/`styles.css` and tests for the reconstructed foundation. IA27 owns foundation/theme/structural selectors; the exact screen-specific selector sets ledgered to IA28-IA34 remain available for those phases to delete/recreate. Remove old component-tag/API/class/geometry assertions that encoded superseded implementation and replace them with authority-derived structure/behavior assertions; do not weaken still-applicable semantic/accessibility/browser requirements;
6. prove exactly one production AppShell owner, one WorkItem shell owner, one structural responsive owner, no `WorkbenchLayout`, no feature structural CSS/breakpoint owner, narrow retained atom responsibilities, Astryx containment, theme parity, keyboard/focus behavior and representative rendered alignment. `SURF-WI-001` receives all three phase-local rendered verdicts and applicable signed architecture/test/build/browser checkpoints pass before IA28.

**Hard boundaries:** no domain/query/current-attention/lifecycle policy moves into primitives; no DTO/view-model/state family; no compatibility `WorkbenchLayout`; no temporary second shell; no old primitive DOM/CSS/API copied as implementation template; no old shell files retained merely to keep gates green; no screen-family redesign beyond the five shell-integration owners in IA27.

**Proof:** bounded purge observation/evidence + final absence proof + fresh foundation-schema review + architecture/certification/browser gates + representative application chrome/current-attention/interaction-class responsive evidence + `SURF-WI-001` row PASS. IA28-IA34 are blocked until IA27 PASS.

###### Destructive screen replacement protocol for IA28-IA34

Every screen reconstruction phase follows the same non-negotiable sequence:

1. **Purge checkpoint (procedural, not a Git commit):** delete all old screen/composition files owned by that IA and delete its exact ledgered screen CSS/compatibility selectors from the shared stylesheet owners. Before replacement screen authorship, record the exact deleted path/selector set as bounded existing in-task observational evidence. The checkpoint contains no replacement screen JSX/DOM and is not candidate/validation state.
2. **Fresh schema checkpoint:** record/review the current R2 screen-information schema for the owned screens: Primary, Supporting, Technical, actions, states, responsive semantic order and work-kind/stage differences. This is design evidence, not a runtime DTO.
3. **Clean recreation:** recreate the deleted screen paths from that schema using the accepted IA27 reconstructed Workbench foundation, positively retained atomic adapters, approved leaves and canonical underlying query/domain owners. Pre-purge screen blobs are forbidden as implementation templates.
4. **No structural reuse:** old JSX/DOM hierarchy, field grouping, card/panel structure, table-column design, action placement, responsive branching, screen-local CSS/classes and visual hierarchy may not be copied or incrementally transformed. IA28-IA34 may mutate `ui/src/styles.css`/`ui/src/theme.css` only for their exact ledgered screen selectors; IA27 foundation/theme/structural selectors remain owned by IA27.
5. **Proof before phase advance:** semantic/browser tests plus required rendered comparison must PASS with zero unresolved row-level FAIL before the next reconstruction phase begins. IA26 later rechecks the exact final candidate.

If required non-visual behavior exists only inside an old screen file, the phase may not copy it automatically. It must consume the canonical underlying owner or return upstream for an architecture-preserving extraction decision.

###### Exact IA27-IA34 rendered face ownership

The 37 audited `SURF-*` rows in `docs/references/workbench-ui/README.md` are partitioned exactly once across the foundation/shell and destructive screen reconstruction phases inside T1. This table is the PLAN owner of phase-local rendered acceptance allocation; IA26 independently rechecks the union against the reference registry.

| Phase | Exact owned SURF rows | Required state/reference sheets before phase advance |
|---|---|---|
| IA27 | `SURF-WI-001` | WorkItem shell controls; current-attention/chrome alignment; responsive composition; representative application/global chrome foundation proof |
| IA28 | `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` | Queue states; application notices; installation readiness; linked-remediation Create; application-shell active-account visibility |
| IA29 | `SURF-STEP-WR-001`, `SURF-MAT-SOURCE-001`, `SURF-MAT-DOC-001`, `SURF-MAT-DOC-RO-001`, `SURF-CONF-DIRTY-DEST-001`, `SURF-CONF-DIRTY-MATERIAL-001`, `SURF-CONF-ARCHIVE-001`, `SURF-CONF-DOC-GIT-001` | Work request/document states; current-attention interaction inside accepted shell; owned safety confirmations |
| IA30 | `SURF-STEP-R1-001`, `SURF-STEP-R2-001`, `SURF-STEP-DESIGN-001`, `SURF-STEP-PLAN-001`, `SURF-MAT-ACTIVITY-001`, `SURF-MAT-PROPOSAL-001` | Research/Requirements/Solution design/Plan references; dialogue states; proposal states; four-kind Research information differences |
| IA31 | `SURF-STEP-R3-001`, `SURF-STEP-APPROVAL-001`, `SURF-MAT-APPROVAL-TASK-001` | Readiness legitimate-input state; Approval current/stale/currentness states; approval-task detail |
| IA32 | `SURF-STEP-EXEC-001`, `SURF-MAT-EXEC-TASK-001` | Implementation states; current-vs-historical selection; blocker/action/validation boundaries |
| IA33 | `SURF-STEP-COMPLETE-001`, `SURF-WI-CONTEXT-001`, `SURF-MAT-EVIDENCE-001` | Complete linked-remediation branch; candidate/non-candidate terminal states; Evidence; Context |
| IA34 | `SURF-SET-001`, `SURF-SET-REPO-001`, `SURF-SET-REPO-ADD-001`, `SURF-SET-REPO-MOVE-001`, `SURF-SET-OC-001`, `SURF-SET-OC-RENAME-001`, `SURF-SET-OC-ADD-001`, `SURF-SET-OC-LOGIN-001`, `SURF-SET-MODEL-001`, `SURF-CONF-REPO-DISCONNECT-001`, `SURF-CONF-OC-REMOVE-001` | repository/account/model readiness; OpenCode login terminal states; repository/account destructive confirmations |

The IA27-IA34 union is exactly **37 unique SURF rows** with no duplicate or unowned row. For each owned row, the phase-local rendered review uses the same three binary verdict dimensions as IA26 — `schema_information`, `ux_interaction`, `visual_ui`. Any `FAIL` blocks phase advance and requires correction inside the owning phase/design before recapture.

##### IA28 — destructively replace Queue and Create

**Solutions:** SD22 plus existing SD03/SD05 semantic deltas through IA11/IA12.
**Owners:** `ui/src/OpenCodeAccountControl.tsx`, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`.
**Required mutation:** execute the destructive screen replacement protocol for the three owned paths inside IA27's accepted `WorkbenchAppShell`. Build a fresh Queue Operational scan and Create/remediation TaskPanel→Form/configuration from R2/current P3. Rebuild `OpenCodeAccountControl` as global active-account status/quick-access that routes to the one Settings management owner. Keep normal populated Queue separate from source-diagnostic, empty, search and archive states. Create presents controlled Project/kind/Concerns/title plus subordinate derived context and one dominant Create action.
**Forbidden:** IA27 foundation/retained-atom mutation; feature-local structural CSS; copying old queue/modal/form/table composition; using SVGs as product authority.
**Proof:** purge evidence + fresh screen-schema review + Queue/Create/account-visibility functional browser matrix + all IA28 face-ledger rows PASS at wide/narrow as applicable against `queue*.svg`, `create-work-item.svg`, `create-linked-remediation.svg` and the application readiness/state references.

##### IA29 — destructively replace Work request and governed-document material

**Solution:** SD23 plus IA13/IA14 where applicable.
**Owner:** `ui/src/DocumentWorkspace.tsx`.
**Retained dependencies:** accepted IA27 WorkItem shell/Surface/Attention/Selector/SectionHeader/Confirmation composition, `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`, `ui/src/workbench-presentation.ts`, query/API/domain owners.
**Required mutation:** delete the old `DocumentWorkspace.tsx` and its owned selectors at the purge checkpoint, then recreate Work request/governed-document material from the fresh document information schema inside the accepted WorkItem shell. Markdown editors remain content leaves and do not contribute outer screen grammar.
**Forbidden:** IA27 foundation/retained-atom mutation for screen convenience; copying old document hierarchy/technical-state layout/classes; recreating identity/rail/current-attention shell ownership locally.
**Proof:** purge evidence + fresh Work request/document schema + Git/current-attention tests + all eight IA29 face-ledger rows PASS at wide/narrow as applicable.

##### IA30 — destructively replace Research, Requirements, Solution design and Plan screens

**Solution:** SD24 plus IA15 and existing productive-stage semantic corrections.
**Owners:** `ui/src/PreSignoffStageWorkspace.tsx`, `ui/src/ActivityWorkspace.tsx`, `ui/src/ActivityComposer.tsx`, `ui/src/WorkflowMaterialSelector.tsx`, `ui/src/ProposalReview.tsx`, `ui/src/RunEventTimeline.tsx`.
**Retained dependencies:** `ui/src/workbench-presentation.ts`, query/API/domain owners, accepted IA27 Workbench foundation.
**Required mutation:** delete all six owned old paths at the purge checkpoint, then recreate the productive-stage family from fresh R2 schemas. Research/Requirements/Solution design/Plan share one current-attention/Document/Dialogue/Review grammar while retaining stage-specific information obligations. Current required input/proposal/blocker/processing owns attention; current governed document is primary otherwise; history/evidence/activity is subordinate.
**Forbidden:** old stage layout reuse; IA27 foundation/retained-atom mutation; feature-owned responsive topology; copying prior dialogue/proposal/timeline composition.
**Proof:** purge evidence + four fresh stage-schema reviews + four-kind Research/Change/Defect downstream browser matrix + all six IA30 face-ledger rows and their dialogue/proposal state sheets PASS.

##### IA31 — destructively replace Readiness and Approval

**Solution:** SD25 plus IA16/IA17.
**Owners:** `ui/src/ReadinessWorkspace.tsx`, `ui/src/SignoffReview.tsx`.
**Required mutation:** delete both old screens at the purge checkpoint, then recreate them as fresh Review-class screens from R2. Readiness makes typed R3 verdict/findings/return owner dominant. Approval makes readiness/currentness/task meaning dominant and sign-off the sole primary mutation; technical identity is subordinate.
**Forbidden:** old generic stage/card review markup; IA27 foundation/retained-atom mutation; technical-identity-first hierarchy.
**Proof:** purge evidence + fresh Readiness/Approval schemas + readiness return/blocked/ready and Approval current/stale/sign-off tests + all three IA31 face-ledger rows PASS, including Approval task detail and legitimate Readiness input.

##### IA32 — destructively replace Implementation

**Solution:** SD26.
**Owner:** `ui/src/ExecutionWorkspace.tsx`.
**Retained dependencies:** replacement `RunEventTimeline` from IA30, accepted IA27 Workbench foundation, canonical execution/query owners.
**Required mutation:** delete the old Implementation screen at the purge checkpoint, then recreate it from the fresh C12 screen schema as the canonical operational master/detail topology. Detail presents current task/owner/action, attempt, blocker, validation and chronology; historical selection never steals current attention.
**Forbidden:** old stacked/card/task-count-driven layout; IA27 foundation/retained-atom mutation; copying prior execution markup/classes.
**Proof:** purge evidence + fresh Implementation schema + execution task/attempt/blocker/validation tests + both IA32 face-ledger rows and `implementation-states.svg` PASS at wide/narrow.

##### IA33 — destructively replace Complete, Evidence and Context

**Solution:** SD27 plus IA19 product-language projection.
**Owners:** `ui/src/TerminalResult.tsx`, `ui/src/EvidenceViewer.tsx`, `ui/src/WorkItemContext.tsx`.
**Retained dependencies:** approved raw-content leaves, `ui/src/workbench-presentation.ts`, canonical material/query owners.
**Required mutation:** delete all three old screens at the purge checkpoint, then recreate fresh Terminal result, Evidence and Compact context screens from R2. Complete makes final outcome primary, candidate resources only when applicable, and linked remediation a separate authoring action. Context remains supporting/technical only.
**Forbidden:** old result/evidence/context card systems; IA27 foundation/retained-atom mutation; copying prior screen hierarchy.
**Proof:** purge evidence + fresh terminal/evidence/context schemas + candidate/non-candidate/linked-remediation/material tests + all three IA33 face-ledger rows and linked-remediation state reference PASS.

##### IA34 — destructively replace Settings and OpenCode/account configuration

**Solution:** SD28 plus IA18.
**Owners:** `ui/src/SettingsWorkspace.tsx`, `ui/src/OpenCodeAccountSettings.tsx`.
**Required mutation:** delete both old Settings/account-management screen implementations at the purge checkpoint, then recreate fresh operator-first Settings/configuration screens from R2. Readiness/meaning/actions are primary; exact paths/endpoints/account identifiers are subordinate unless the active task requires them. `OpenCodeAccountControl` is an IA28 application-shell dependency and must not be recreated or restyled here.
**Forbidden:** old admin/card/account/repository/model screen grammar; IA27 foundation/retained-atom mutation; feature-local structural CSS.
**Proof:** purge evidence + fresh Settings/account/configuration schemas + readiness/repository/account/model/login/confirmation tests + all eleven IA34 face-ledger rows PASS at wide/narrow/theme as applicable.
##### IA26 —## IA26 — rendered 0.6.0 UX/UI acceptance evidence

**Solution/authority:** existing SD16-SD18 verification and Workbench realization, current `GW-DOC-WORKBENCH-UX`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, and the reviewed derived visual reference pack at `docs/references/workbench-ui/README.md`. Current R2/DESIGN/P3-P6 authority wins over any 0.5.0 SVG reference on conflict.  
**Owners/anchors:** `tests/browser.spec.ts` for deterministic rendered-state capture and coverage assertions; `.github/workflows/ci.yml` for exact-candidate execution and evidence publication; `tests/certification.test.ts` for the exact CI supply-chain rule permitting only the pinned first-party artifact uploader required by this acceptance path.  
**Required mutation:** extend the existing Playwright/GitHub Actions verification path so the exact PR merge candidate renders and captures the complete governed Workbench surface/state set after the ordinary `browser` gate is green. The implementation must:
- capture every one of the nine lifecycle steps — Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete — from populated deterministic canonical fixtures, not empty shells;
- capture every `SURF-*` entry in the `docs/references/workbench-ui/README.md` complete audited surface table, including Queue, Create, Settings/repositories, Settings/OpenCode/accounts, model/runtime Settings, Context, document authoring/read-only, dialogue/activity, proposal review, evidence, approval-task detail, execution-task detail and all confirmation/destructive overlays;
- capture all materially distinct reference/state sheets listed by that README: current-attention precedence, dialogue interaction, proposal, document, Implementation task, Queue, application notices, installation readiness, linked-remediation Create/Complete branches, OpenCode login terminal states, safety confirmations, responsive composition and theme parity;
- prove all four WorkItem kinds represented by the reference pack — Change, Defect, Investigation and Audit — at the information-contract surfaces where the kinds materially differ;
- capture every primary workflow step at a wide desktop viewport and at a narrow viewport; additionally capture Light and Dark representatives for every primary interaction class and System against both mocked effective schemes, preserving the existing semantic theme assertions;
- emit an evidence manifest for every capture containing exact checked-out commit SHA, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, runtime route/selection, corresponding SVG reference path and governing current authority refs;
- place the actual PNG captures, the manifest and a generated index that pairs each actual capture with its SVG reference path into one GitHub Actions artifact for review;
- fail the Actions acceptance step when a required surface/state/reference mapping is missing or duplicated, a fixture cannot reach the declared canonical state, the page emits an uncaught browser/runtime error, the capture is absent/empty, or the manifest/capture set is not exhaustive.

**Acceptance review:** the Actions artifact is evidence, not authority. Every manifest row must receive an explicit `PASS` or `FAIL` against three independent dimensions before IA24:
1. **schema/information fidelity** — required current information is present, correctly named/grouped/prioritized, and no required schema information is silently absent;
2. **UX/interaction fidelity** — the owning interaction grammar, current-attention owner, action precedence, navigation/material hierarchy, state/recovery semantics and responsive composition match current authority;
3. **visual/UI fidelity** — hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, truncation/wrapping, overlays and theme behavior materially conform to current authority and, where not superseded, the reviewed SVG composition.

Any `FAIL` creates a blocking remediation item owned by the defective implementation/authority layer and requires a fresh post-fix exact-candidate Actions capture for the affected row plus regression revalidation. No aggregate pass may hide a failed row.

**Forbidden:** treating the 0.5.0 SVG pack as semantic/product authority; pixel-diff threshold as the sole acceptance criterion; screenshot approval in place of existing semantic/browser assertions; generated screenshots blessed from the current implementation without comparison; a new visual-regression SaaS/platform dependency; committing runtime screenshots as a second design system; changing product behavior merely to match a superseded SVG.  
**Proof:** required PR Verification rendered-acceptance step succeeds on the exact candidate, publishes the exhaustive evidence artifact, and the screen-by-screen acceptance ledger has no unresolved `FAIL`. IA24 may not close before that evidence/review is complete.



---

### Compiled component: `implementation-plan/13-verification-closeout.md`

#### 0.6.0 verification and closeout contract

This component allocates proof across the one canonical signed task T1 and its ordered IA01-IA34 implementation/proof phases. It does not create another validation model or second executable-task representation.

##### In-task architecture and reconstruction checkpoints

Preflight IA07 re-proves the existing coordinator-owned signed-checkpoint capability; no candidate byte is relied upon to create it.

Before T1 mutation begins, the execution harness provides the exact Playwright-owned Chromium runtime required by P6 and the BUILDER requests the signed `dependency-lock` gate. Exact `bun ci` must `GATE_PASSED`.

T1 carries the same six logical gate IDs through final validation. During the live BUILDER Run, coherent phase boundaries may request already-signed gates through SD13; those checkpoints provide feedback and continuation inside the same task/Run and never substitute for final V3/V5/V7.

| Completed phase | Before next phase | Required retained evidence |
|---|---|---|
| applicable IA01-IA25 non-UI work | IA27 | non-UI baseline proof; no protected execution-foundation mutation |
| IA27 | IA28 | exact 20-path old design-bearing primitive set removed before fresh authorship; old `WorkbenchLayout` absent; fresh `WorkbenchAppShell` + `WorkbenchWorkItemShell` + one responsive owner and reconstructed composition primitives accepted; seven retained atomic adapters unchanged; foundation structural CSS/tests replaced from current authority; exact surviving legacy-screen-selector→IA28-IA34 ledger audited; `SURF-WI-001` PASS |
| IA28 | IA29 | applicable signed checkpoints + all 3 IA28 face-ledger rows PASS |
| IA29 | IA30 | applicable signed checkpoints + all 8 IA29 face-ledger rows PASS |
| IA30 | IA31 | applicable signed checkpoints + all 6 IA30 face-ledger rows PASS |
| IA31 | IA32 | applicable signed checkpoints + all 3 IA31 face-ledger rows PASS |
| IA32 | IA33 | applicable signed checkpoints + both IA32 face-ledger rows PASS |
| IA33 | IA34 | applicable signed checkpoints + all 3 IA33 face-ledger rows PASS |
| IA34 | IA20-IA23 integrated certification | applicable signed checkpoints + all 11 IA34 face-ledger rows PASS; 37/37 IA27-IA34 phase-local SURF union complete |
| IA20-IA23 | IA26 | complete semantic/component/theme/responsive/scenario/regression certification PASS |
| IA26 | IA24 | exhaustive exact-candidate manifest + row-level schema/UX/visual PASS |

These are **in-task phase boundaries**, not ExecutionTask dependencies. P6 does not promote candidate bytes between tasks; all phases mutate and inspect the same T1 candidate from the one Approval baseline. A phase advances only after its own coherent implementation and required proof are available. A later phase discovering a foundation responsibility/semantic defect returns to IA27/DESIGN rather than patching the accepted foundation locally.

A failed in-task checkpoint permits only correction inside T1's signed semantic scope/accepted design or an explicit execution block. It does not grant provider shell/execute or authorize redesign. Checkpoints never substitute for V3/V5/V7 or T1's complete logical gate union.

##### Foundation and screen purge/rebuild evidence law

For IA27, verification retains both sides of the foundation replacement boundary without inventing an intermediate Git candidate:

- bounded in-task purge observation/evidence records the exact 20 deleted design-bearing primitive paths, five deleted old shell-integration paths and removed structural/compatibility selectors before replacement authorship;
- that procedural checkpoint contains no replacement primitive/shell JSX/DOM and is not a Git commit, candidate-state event or validation result;
- the fresh foundation composition-schema review is derived from current P3/P4 and reviewed new-design references;
- the completed candidate contains `WorkbenchAppShell.tsx`, `WorkbenchWorkItemShell.tsx`, `workbench-responsive.ts` and the reconstructed composition primitive/shell integration;
- the seven retained atomic adapters remain narrow and unchanged;
- exactly one AppShell owner, one WorkItem shell owner and one structural responsive owner exist;
- foundation theme/accessibility/responsive/browser/rendered acceptance passes before IA28 begins.

For IA28-IA34, verification retains the same authority-derived replacement discipline:

- bounded in-task purge observation/evidence records the exact deleted old screen paths and exact ledgered legacy selectors before replacement authorship;
- the procedural purge boundary contains no replacement screen JSX/DOM and is not a Git commit/candidate/validation result;
- a fresh screen-information-schema review is derived from current R2 plus the phase's SD22-SD28 solution;
- the recreated screen consumes the accepted IA27 foundation and canonical domain/query owners rather than old screen composition;
- `ui/src/styles.css`/`ui/src/theme.css` mutations are limited to the phase's exact ledgered screen selectors; IA27 foundation/theme/structural selectors remain owned by IA27;
- phase-specific semantic/browser evidence passes;
- phase-specific rendered comparison records explicit `schema_information`, `ux_interaction` and `visual_ui` PASS/FAIL for every exact owned SURF row before phase advance.

A final screen that looks correct is insufficient if obsolete presentation ownership or compatibility structure remains. The purge observation is process evidence, not independent acceptance proof; final V4/V5/V6 plus semantic/browser/rendered verification must independently prove the resulting candidate is authority-derived and minimum.
##### Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the authority-defined remainder still conforms; do not infer a preservation target from current implementation.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

A01 corrected-upstream no-code rows `A01-NC01`-`A01-NC05` are also binding proof instructions: verify their exact canonical authority identities and stated R1 semantic propositions under V4, authorize no T1 production mutation for those corrections, and return upstream if any authority/evidence contradiction is found.

##### Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA26 owns the terminal exact-candidate rendered UX/UI acceptance evidence and review. IA24 runs the final validation contract only after IA26 PASS.

SD20 exact-pin OpenCode proof is a mandatory IA23 precondition to IA26 and IA24: permanent PR verification must execute the actual supported OpenCode 2.2.6 process through Order's production OpenCode boundary while deterministic model output is supplied by the exact isolated simulation tooling authorized by SD20. A fake OpenCode executable, a removed temporary workflow, or a simulated response path that does not launch the exact supported OpenCode process cannot satisfy this proposition. The evidence must state the simulation boundary and must not be reused as proof of remote provider availability, Console OAuth/account connectivity or model quality.

###### Pre-Approval structural-sensor correction

The permanent package sensor is pre-signoff campaign material, not signed implementation surface. Before G5/G5A/R3 may return to PASS it must validate the current **66-path** DESIGN forecast against the exact one-task PLAN `changeSurface`; exactly one signed task with empty `dependsOn`; the exact 20 destructive design-bearing primitive paths, seven positively retained atomic adapters and three new foundation-owner paths; IA27 purge-before-fresh-foundation ordering; exactly one application-shell, WorkItem-shell and structural-responsive owner; exact IA27-IA34 destructive-screen/selector ownership including shared stylesheet access; and the exact 37-row IA27-IA34 rendered-face allocation without creating a second semantic UI registry. It derives the surface universe from `docs/references/workbench-ui/README.md`, proves the PLAN ledger union is exactly equal with no duplicate/unowned row, and proves each IA27-IA34 phase owns its declared replacement surface/face set inside T1. It also retains exact IA01-IA34 catalog/one-definition checks and recognizes IA23/IA26/IA24 as cross-solution/rendered-acceptance/final actions.

This sensor correction is campaign/package fitness only: `tests/architecture.test.ts` remains outside signed implementation tasks. Re-run architecture and root/modular compilation checks on the corrected package before G5 may return to PASS.

##### 0.6.0 implementation delivery branch

The original 0.6.0 implementation branch was deleted after its unauthorized squash delivery to `master`. Remediation continues on the surviving 0.6.0 continuation branch/PR `fix/0.6.0-post-squash-campaign-fitness` / PR #83, which is based on that accidentally integrated candidate. This is a repository-delivery fact only; it does not treat `master` as authorization to release, does not alter Order's Approval/execution semantics, and does not authorize another merge.

- all remaining 0.6.0 remediation, verification and `[Unreleased]` changelog changes continue on PR #83 until the implementation and governed closeout are complete;
- do not split the signed T1 across additional work branches/PRs solely for organizational convenience; any material need to change signed scope, design, ownership or task semantics returns upstream through the normal lifecycle while remaining on this governed work branch unless repository governance itself requires otherwise;
- do not use `release/v0.6.0` for product implementation; that branch name remains reserved for the later metadata-only release PR governed by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`;
- no further direct or PR-mediated `master` delivery is permitted without explicit user authorization, and the exact current PR candidate must pass the repository's required verification before it can even become merge-ready.

##### Final logical gate union and order

The signed task's `gateIds` order is executable order for each fresh REVIEWER workspace and for final V3/V7. `dependency-lock` must be first so later Node-based gates see the exact lockfile-installed dependency graph. The execution harness must have provisioned the pinned Playwright Chromium runtime before execution starts.

1. dependency-lock
2. typecheck
3. architecture
4. test
5. build
6. browser

The six logical gates remain the canonical signed task gate union. IA26 is an additional terminal PR acceptance obligation executed by GitHub Actions after those gates; it does not introduce a seventh P6 gate or replace any V0-V7 proposition.

##### Rendered 0.6.0 UX/UI acceptance

The exact PR merge candidate must pass a dedicated GitHub Actions rendered-acceptance step before IA24 closeout. This step uses the existing Playwright production Workbench harness and the reviewed derived SVG pack at `docs/references/workbench-ui/README.md`; it does not create a second visual specification.

###### Evidence generation contract

GitHub Actions must:

1. execute only after dependency-lock, typecheck, architecture, test, build and the ordinary browser suite have passed;
2. run the IA26 capture cases in `tests/browser.spec.ts` against the exact checked-out PR merge candidate;
3. capture actual PNG output for every IA26-required workflow/surface/state/view/theme row;
4. generate a machine-readable manifest and human-readable index containing the exact candidate SHA and, for every capture, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, route/selection, current authority refs and corresponding `docs/references/workbench-ui/*.svg` reference;
5. prove exhaustive one-to-one coverage against the complete audited `SURF-*` table, nine workflow-step reference set, work-type variants and materially distinct state/reference sheets in `docs/references/workbench-ui/README.md`;
6. fail on missing/duplicate mappings, unreachable declared state, uncaught browser/runtime errors, missing/empty captures, or incomplete manifest/index;
7. upload the actual captures plus manifest/index as one PR-run artifact using `actions/upload-artifact` pinned to commit `ea165f8d65b6e75b540449e92b4886f43607fa02` (the current `v4` ref at PLAN correction time), with artifact identity including the exact checked-out candidate SHA.

The capture harness may add deterministic fixture setup and screenshot calls inside the signed `tests/browser.spec.ts` verification owner. The CI mutation remains inside the signed `.github/workflows/ci.yml` owner. Rendered acceptance is carried by its own verification task and does not authorize presentation changes.

###### Acceptance review contract

The GitHub Actions artifact is then reviewed row by row against current authority and the paired SVG reference. The SVG is derived 0.5.0 visual comparison material only; a current 0.6.0 authority difference wins and must be recorded as an intentional authority delta rather than forced into a pixel match.

Every manifest row records three independent verdicts:

- `schema_information`: all authority-required information is present with correct labels, grouping, hierarchy and prominence;
- `ux_interaction`: the correct interaction class, current-attention/action precedence, workflow/material navigation, recovery semantics and responsive composition are realized;
- `visual_ui`: rendered hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, clipping/wrapping, overlays and theme behavior materially conform.

Each dimension is `PASS` or `FAIL`; no `PARTIAL`, aggregate-only pass or unreviewed row may reach IA24. An unexplained material divergence from the SVG/reference composition is `FAIL`. A divergence required by newer current authority is `PASS` only when the exact superseding authority is recorded.

Any failed row blocks closeout, opens remediation at the defective implementation/authority owner, and requires a fresh exact-candidate GitHub Actions capture and review for the affected row after correction. Existing semantic/browser tests remain mandatory and cannot be replaced by screenshot acceptance.


##### V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their exact current R1 evidence and DESIGN disposition;
- all 27 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- T1 retains the exact 66-path `changeSurface`; it remains the cumulative immutable forecast;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- bootstrap `dependency-lock` passed before T1 mutation; IA27 retained procedural purge evidence and fresh-foundation acceptance before IA28; every later IA28-IA34 phase retained its required schema/semantic/rendered stop-go evidence before phase advance; and IA20-IA23/IA26 completed integrated/final acceptance before IA24;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.
- IA26 exact-candidate rendered acceptance evidence is exhaustive, the GitHub Actions artifact identity is bound to the reviewed candidate, and every required schema/information, UX/interaction and visual/UI verdict is PASS with no unresolved rendered discrepancy.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock metadata and workflow metadata other than the explicitly signed `.github/workflows/ci.yml` SD20 verification change remain outside T1. The pre-signoff campaign/traceability sensor may change only before Approval; any such change must be included in the exact G5/G5A/R3 evidence package before sign-off and is never a T1 candidate edit.


## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the complete authority-driven Order 0.6.0 candidate as one cumulative signed task because GW-DOC-CANONICAL-CONTRACTS-V2 task dependencies do not promote candidate bytes. Preserve/revalidate the exact SD01-SD20 non-UI deltas and positive-reuse obligations, then execute IA27/SD21 destructive Workbench foundation and shell reconstruction from current P3/P4/new-design authority: remove the 20 design-bearing primitive implementations, old shell integration and obsolete structural selectors before fresh authorship; permanently remove WorkbenchLayout; create WorkbenchAppShell, WorkbenchWorkItemShell and the single workbench-responsive owner; retain only the seven audited atomic adapters; and pass foundation acceptance including SURF-WI-001 before IA28. Execute IA28-IA34 / SD22-SD28 in order by deriving fresh R2 screen-information schemas, deleting each phase's old screen files and exact ledgered legacy selectors from the shared stylesheet owners before replacement authorship, and recreating every screen on the accepted IA27 foundation without old JSX/DOM/layout/CSS/responsive compatibility. Then complete SD29 plus IA20-IA23 semantic/component/theme/responsive certification, SD30/IA26 exact-candidate acceptance for all 37 SURF rows, and IA24/final V0-V7 closeout. Purge checkpoints are bounded in-task observational evidence, not Git commits or candidate boundaries. No second AppShell, second structural responsive owner, feature-local structural CSS, DTO/view-model/state family, compatibility presentation path or implementation-derived product semantics is authorized.",
      "dependsOn": [],
      "scope": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/setup.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/installer.test.ts",
        "tests/opencode.test.ts",
        ".github/workflows/ci.yml",
        "ui/src/primitives/WorkbenchAttention.tsx",
        "ui/src/primitives/WorkbenchContextPanel.tsx",
        "ui/src/primitives/WorkbenchDialogue.tsx",
        "ui/src/primitives/WorkbenchForm.tsx",
        "ui/src/primitives/WorkbenchIdentity.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchMasterDetail.tsx",
        "ui/src/primitives/WorkbenchRail.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/primitives/WorkbenchReview.tsx",
        "ui/src/primitives/WorkbenchSectionHeader.tsx",
        "ui/src/primitives/WorkbenchSelector.tsx",
        "ui/src/primitives/WorkbenchSettingsLayout.tsx",
        "ui/src/primitives/WorkbenchSurface.tsx",
        "ui/src/primitives/WorkbenchTable.tsx",
        "ui/src/primitives/WorkbenchTaskPanel.tsx",
        "ui/src/primitives/WorkbenchTimeline.tsx",
        "ui/src/primitives/WorkbenchToolbar.tsx",
        "ui/src/primitives/WorkbenchState.tsx",
        "ui/src/primitives/WorkbenchUtilityLink.tsx",
        "ui/src/primitives/WorkbenchAppShell.tsx",
        "ui/src/primitives/WorkbenchWorkItemShell.tsx",
        "ui/src/primitives/workbench-responsive.ts",
        "ui/src/app.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "tests/workbench-presentation.test.ts",
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "CHANGELOG.md"
      ],
      "exclusions": [
        "src/daemon/execution.ts",
        "src/daemon/validation.ts",
        "src/daemon/server.ts",
        "src/shell/config.ts",
        "src/shell/file-write.ts",
        "src/shell/opencode.ts",
        "src/shell/process.ts",
        "src/shell/project-config.ts",
        "src/shell/project.ts",
        "src/shell/repository.ts",
        "src/shell/runtime.ts",
        "src/shell/sqlite.ts",
        "src/shell/work-item-source.ts",
        "ui/src/primitives/WorkbenchAction.tsx",
        "ui/src/primitives/WorkbenchConfirmation.tsx",
        "ui/src/primitives/WorkbenchDisclosure.tsx",
        "ui/src/primitives/WorkbenchField.tsx",
        "ui/src/primitives/WorkbenchIcon.tsx",
        "ui/src/primitives/WorkbenchNotice.tsx",
        "ui/src/primitives/WorkbenchStatus.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx",
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE",
        "GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-FR-214-STABLE-WORKBENCH-GEOMETRY",
        "GW-FR-218-SPACE-CLASS-CONSISTENCY",
        "GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY",
        "GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1",
        "GW-DOC-SPECIFICATION-STANDARD-V2"
      ],
      "changeSurface": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/setup.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/installer.test.ts",
        "tests/opencode.test.ts",
        ".github/workflows/ci.yml",
        "ui/src/primitives/WorkbenchAttention.tsx",
        "ui/src/primitives/WorkbenchContextPanel.tsx",
        "ui/src/primitives/WorkbenchDialogue.tsx",
        "ui/src/primitives/WorkbenchForm.tsx",
        "ui/src/primitives/WorkbenchIdentity.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchMasterDetail.tsx",
        "ui/src/primitives/WorkbenchRail.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/primitives/WorkbenchReview.tsx",
        "ui/src/primitives/WorkbenchSectionHeader.tsx",
        "ui/src/primitives/WorkbenchSelector.tsx",
        "ui/src/primitives/WorkbenchSettingsLayout.tsx",
        "ui/src/primitives/WorkbenchSurface.tsx",
        "ui/src/primitives/WorkbenchTable.tsx",
        "ui/src/primitives/WorkbenchTaskPanel.tsx",
        "ui/src/primitives/WorkbenchTimeline.tsx",
        "ui/src/primitives/WorkbenchToolbar.tsx",
        "ui/src/primitives/WorkbenchState.tsx",
        "ui/src/primitives/WorkbenchUtilityLink.tsx",
        "ui/src/primitives/WorkbenchAppShell.tsx",
        "ui/src/primitives/WorkbenchWorkItemShell.tsx",
        "ui/src/primitives/workbench-responsive.ts",
        "ui/src/app.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "tests/workbench-presentation.test.ts",
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "CHANGELOG.md"
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
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "shell",
        "verification",
        "ui"
      ]
    }
  ]
}
```
