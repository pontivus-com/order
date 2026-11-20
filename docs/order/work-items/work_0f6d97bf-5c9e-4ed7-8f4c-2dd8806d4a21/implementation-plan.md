<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Canonical PLAN authority

This file is the single deterministic P7 artifact and sole normative execution authority for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. The directory `implementation-plan/` is only its maintainable authoring decomposition. The complete source content is compiled below and Approval binds this root file's bytes.

This PLAN is reconstructed under G-F12 after G4 closure from current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d` and DESIGN `f21d1530b01a43e28be47742236b339770022059`. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts. The executable package below exists only where current DESIGN assigns a technical/verification delta or an explicit positive-reuse proof.

This PLAN consumes current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`, current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d` and current DESIGN `f21d1530b01a43e28be47742236b339770022059`. Current implementation/tests are evidence only and never preservation authority. Where DESIGN records `POSITIVE_NO_CHANGE` or baseline reuse, DESIGN is the authority for the no-change disposition and current implementation/tests are only the positive evidence that the authoritative realization is already satisfied.

## Current destructive screen-replacement reconstruction

This PLAN is bound to current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`, R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d` and DESIGN `f21d1530b01a43e28be47742236b339770022059`. Exact-candidate Queue/Create evidence invalidated the old screen layer, not the canonical primitives or underlying domain/query architecture.

R2 defines a fresh screen-information-schema law. DESIGN preserves the canonical Workbench primitives and approved non-screen helpers/content leaves, purges legacy screen-support CSS, and requires destructive replacement of the complete 23-path screen/composition set. The pre-reconstruction screen blobs are defect evidence only.

The signed execution representation remains an 11-task dependency graph. Each task has its own exact `changeSurface`; the cumulative mutable forecast is **43 paths**. T2 may change only shared stylesheets plus verification to purge legacy screen support and certify retained primitives. T3-T9 must record purge commits before recreating their owned screens from current R2. No signed task may mutate `ui/src/primitives/**`, Markdown editors, `workbench-presentation.ts` or the other retained helpers merely for screen replacement.

## Exact modular source manifest

| Source component | Git blob |
|---|---|
| `implementation-plan/00-governance.md` | `c5fa990291b4994e44fec64a4682f6ee617ce9ec` |
| `implementation-plan/01-a01-lifecycle-product.md` | `709ed8191ddf45ae196dc51886891cd4ba4fee33` |
| `implementation-plan/02-a02-governance-intake.md` | `d0819ceeea155416c116789633a1cabd1ab14159` |
| `implementation-plan/03-a03-queue-source.md` | `fe6bfc99c2cc8426e70a7f8af260f5bb3f1dfd73` |
| `implementation-plan/04-a04-workbench-research.md` | `717beb4337b20c3c4011f526b29a61c39dfa4232` |
| `implementation-plan/05-a05-requirements-design.md` | `11637c802ddd5e5cbd7469fc0da65dbfa0b3a182` |
| `implementation-plan/06-a06-plan-readiness.md` | `36e2f45727d6e382a93c5e764882412d1663940a` |
| `implementation-plan/07-a07-approval-execution.md` | `59ede446574ec820f4c19afce032067a857b8799` |
| `implementation-plan/08-a08-complete-materials.md` | `27e7d7ea6e23eeb117e06edf8e38769396c71581` |
| `implementation-plan/09-a09-provider-settings.md` | `1ccabf2c87afaa1fc22ed6e2b66f8f752ac6abac` |
| `implementation-plan/10-a10-recovery-accessibility.md` | `2e1239e9ef0225568e35cbafd321cc1ab829c009` |
| `implementation-plan/11-a11-component-certification.md` | `9bb5b7a1784e545074cc00043e08c27a9fa15c56` |
| `implementation-plan/12-action-catalog.md` | `2eb0b00c51f414e4134eb14f466fef0646634d46` |
| `implementation-plan/13-verification-closeout.md` | `5aad8ed84ab3306f767472789beb10813ae9445a` |

A source component hash mismatch makes PLAN non-current until this root is regenerated. Directory files contain no `order-tasks` block and no independent lifecycle state.

## Semantic coverage versus execution ownership

A01-A11 are exhaustive semantic coverage phases. They do **not** define eleven independently executable tasks. IA01-IA34 in the compiled action catalog are the single action definitions: production mutation, verification-only, DESIGN-positive-reuse/no-code proof, or closeout. Their continued presence is justified by current R2/DESIGN traceability, not historical PLAN continuity. A phase may consume an IA owned elsewhere without duplicating it.

## Signed execution scope

The root repository envelope supports the cumulative 0.6.0 candidate, but mutation authorization is task-local. Retained primitives/helpers are explicitly outside screen-task mutation authority.

### Cumulative scope patterns
- `README.md`
- `src/core/**`
- `src/daemon/**`
- `src/shell/**`
- `ui/src/**`
- `tests/**`
- `.github/workflows/ci.yml`
- `CHANGELOG.md`

### Protected retained UI capability

`ui/src/primitives/**`, `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`, `ui/src/workbench-presentation.ts`, `ui/src/http.ts`, `ui/src/query-keys.ts`, `ui/src/markdown-source-formatting.ts`, `ui/src/theme.ts` and `ui/src/main.tsx` are not screen-replacement change surfaces. A primitive/helper defect requires an upstream DESIGN/PLAN correction; V4/V5/V6 variance cannot be used to edit them for convenience.

T2 owns only `ui/src/theme.css`/`ui/src/styles.css` purge work plus verification. T3-T9 own the exact old screen paths they must delete then recreate.

## Exact signed implementation surface

The exact cumulative mutable forecast is the union of task-local change surfaces: **43 unique paths**.

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

### UI purge/replacement production (25)
- `ui/src/ActivityComposer.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/OpenCodeAccountControl.tsx`
- `ui/src/OpenCodeAccountSettings.tsx`
- `ui/src/PreSignoffStageWorkspace.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/RunEventTimeline.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/WorkItemIdentityRow.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkflowMaterialSelector.tsx`
- `ui/src/WorkflowRail.tsx`
- `ui/src/WorkflowStepFrame.tsx`
- `ui/src/app.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`

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

Task-local ownership is authoritative. The 23 screen/composition paths are destructively replaced by T3-T9; the two shared stylesheets are purge-only T2 production. Retained primitives/helpers are intentionally absent.

## Exhaustive traceability invariants

- exactly 112 stable requirements occur once across A01-A11;
- exactly 27 package-local atomic obligations occur once across A01-A11, including `PL-C12-02`, `PL-C19-02` and `PL-C20-03`;
- A01 corrected-upstream no-code trace rows `A01-NC01`-`A01-NC05` remain explicit and authorize no T1 mutation;
- every stable row names its exact current R1 evidence and current DESIGN disposition;
- every `POSITIVE_NO_CHANGE` row has no execution mutation and names exact verification ownership;
- IA07/IA08 are DESIGN-positive-reuse/no-code proof owners for `PL-C12-01`/`PL-C12-02` and authorize no execution-foundation production edit;
- every dependency-only row names the IA it consumes without duplicate edit ownership;
- every technical/verification delta maps to one or more exact IA actions;
- every IA01-IA34 is defined exactly once; IA27-IA34/IA23/IA26/IA24 are explicit cross-solution/rendered-acceptance/final actions rather than orphan work;
- the immutable cumulative mutable forecast is the exact 43-path union of task-local `changeSurface` entries; retained primitives/helpers are outside screen replacement and may not be admitted through same-layer variance;
- signed `dependency-lock` passes before implementation; T2 must prove primitive preservation and legacy screen-style purge; each T3-T9 task must retain purge-before-rebuild Git evidence, fresh screen-schema review and task-specific browser/rendered proof before the next screen family begins; T10/T11 own final semantic/rendered closure;
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
- DESIGN `solution-design.md`: `f21d1530b01a43e28be47742236b339770022059`.
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

IA27-IA34 are the presentation reconstruction owners. The existing canonical `ui/src/primitives/**` implementation is retained read-only capability for this campaign. IA27 owns only certification of that primitive boundary plus deletion of obsolete screen-specific/compatibility rules from shared stylesheets; it does not redesign primitives. IA28-IA34 own destructive screen replacement. Each must record a purge checkpoint deleting its old owned screen files before replacement authorship, and may not copy or incrementally transform the pre-purge screen implementation. If the retained primitives are insufficient, execution returns to DESIGN rather than changing primitives or creating local presentation ownership.

IA26 is a verification-only terminal acceptance action. It uses the reviewed `docs/references/workbench-ui/` SVG pack only as derived visual comparison material, with current R2/DESIGN/P3-P6 authority prevailing on any conflict. It does not create a screenshot-as-authority mechanism, a second UI specification, or a new product/runtime dependency.

SD13 checkpoint protocol and SD10 scope/forecast/V4-V6 behavior are current execution capabilities positively proven by DESIGN. IA07/IA08 therefore prove/reuse those capabilities and authorize **no T1 production mutation** to their existing owners.

SD20 is a verification-only delta. IA23 owns its permanent realization through `tests/opencode.test.ts` and `.github/workflows/ci.yml`: the actual supported OpenCode 2.2.6 process is exercised through Order's production OpenCode boundary while deterministic model responses are provided by exact isolated CI tooling `opencode-drive@2.4.1` + `effect@4.0.1`. These verification tools are not product/runtime dependencies and do not enter `package.json`, lockfiles, release bundles, Order configuration or runtime state.

##### Signed scope and forecast law

The canonical signed T1-T11 task graph uses:

- bounded `scope` patterns as the hard repository-reach envelope;
- explicit `exclusions` to protect paths outside the current task owner, including retained UI capability and DESIGN-positive-reuse paths inside the cumulative envelope;
- task-local exact `changeSurface` forecasts whose union is the immutable expected physical forecast for the cumulative candidate.

A path absent from `changeSurface` is not automatically authorized and is not automatically a scope breach. If it is inside signed scope, outside exclusions and not protected material, it may proceed only when V4/V5/V6 positively prove the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary. Any semantic expansion remains outside the signed task.

##### Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

For SD02, manifest authority selection is the reachable source set; IA02 must project only the lifecycle-applicable stable/versioned material selected by the pinned schema/stage/explicit refs. A retained historical source may remain reachable without entering current v2 context by raw layer membership.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

##### Screen replacement non-reuse law

For IA28-IA34, current screen implementation is defect evidence only.

- pre-reconstruction screen blobs are not preservation targets, compatibility targets, migration sources or implementation templates;
- the purge checkpoint must precede replacement authorship in Git history;
- a replacement task may reuse only retained primitives, approved leaf/content mechanisms and canonical non-screen domain/query/policy owners;
- copying old JSX/DOM structure, screen-local state branching, field grouping, table-column design, card/panel composition, action placement, responsive markup, CSS classes or visual hierarchy is a task breach;
- a screen-information schema is design-time trace material only and must not become a DTO/browser state family;
- screen task completion requires both deletion evidence and fresh semantic/rendered evidence.

##### Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Do **not** return upstream solely because an otherwise admissible path is absent from `changeSurface`; that case follows the governed V4/V5/V6 variance proof.

---

### Compiled component: `implementation-plan/01-a01-lifecycle-product.md`

#### A01 — Lifecycle and product identity

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C01 + C21.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD29`, `SD30` | `IA27`, `IA29`, `IA26` | — | Re-prove the local Workbench after retained-primitive certification and destructive shell/screen replacement via core/daemon/browser/certification plus rendered acceptance. |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Recheck `C06-O02`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15`, `C05-O02`, `C05-O10` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O03`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD24`, `SD26`, `SD29`, `SD30` | `IA27`, `IA29`, `IA30`, `IA32`, `IA26` | — | Replacement screens must consume the retained primitive-owned geometry instead of feature/container presentation and pass semantic + rendered geometry proof. |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `TECHNICAL_DELTA` | `SD21`, `SD22`, `SD23`, `SD24`, `SD25`, `SD26`, `SD27`, `SD28` | `IA27`-`IA34` | — | Recreate Primary/Supporting/Technical hierarchy from fresh screen-information schemas in every interaction class; local SD11/12/14 semantics remain inputs to the owning replacement task. |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Retain the shared primitive spatial grammar and destructively replace every screen family so it consumes that grammar; rendered evidence required. |
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
- **IA27** — consume the primitive-preservation/legacy-screen-style purge definition.
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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007` | `TECHNICAL_DELTA` | `SD19` | `IA25` | — | Recheck `DIRECT-FR007` via new `tests/installer.test.ts`; existing `tests/order-migration.test.ts` + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
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
- **IA34** — consume the single Settings/OpenCode/account/configuration destructive replacement definition; provider/configuration semantics remain with existing owners.

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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O15`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O02`, `C17-O05`, `C17-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O04`, `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD29`, `SD30` | `IA27`-`IA34`, `IA26` | — | Preserve semantic continuity by making every replacement screen consume the retained primitive-owned wide/medium/narrow topology; certify every domain with rendered responsive evidence. |
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
- **IA27**-**IA34** — consume the primitive-preservation/screen-replacement owners for responsive/accessibility re-composition; no phase-local layout implementation.
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
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`; current DESIGN `f21d1530b01a43e28be47742236b339770022059`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Permanently prove the actual OpenCode 2.2.6 process/session boundary through `tests/opencode.test.ts` and `.github/workflows/ci.yml`, using exact isolated `opencode-drive@2.4.1` + `effect@4.0.1` deterministic model simulation; retain existing daemon/certification fake-provider fixtures as complementary proof and explicitly exclude remote-provider/OAuth/model-quality claims + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | `IA15`, `IA20`, `IA21`, `IA22`, `IA26` | — | Existing semantic/state certification remains mandatory and exact-candidate rendered acceptance is added across the complete governed UI surface. |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Preserve/certify the canonical primitive/theme foundation, destructively replace every screen family and delete competing legacy screen presentation ownership; rendered proof required. |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Equivalent roles must resolve through the retained shared primitives rather than feature-specific presentation; certify only after destructive screen replacement. |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | `IA27`, `IA28`-`IA34`, `IA26` | — | Root theme/primitive activation remains; replacement screens must consume it directly and parity is re-proved through semantic + rendered evidence. |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02 | `SD21`-`SD29` | `IA27`-`IA34` | — | Retain the canonical primitive/theme system, purge legacy screen-support CSS, destructively replace the complete screen layer and forbid reuse of pre-purge screen composition. |
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
- **IA27**-**IA34** — consume the single foundation/domain migration definitions for PL-C19-02; A11 owns cross-domain closure, not duplicate renderer implementation.
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
| T1 | SD01-SD20 non-UI remainder; IA01-IA10/IA25/SD20 portion of IA23 | — | core/daemon/shell + exact-pin verification | no reintroduction of execution-foundation or provider compatibility paths | all ordinary gates + targeted non-UI regressions |
| T2 | SD21; IA27 | T1 | `theme.css`, `styles.css` + verification; primitives are read-only retained capability | obsolete screen-specific/compatibility selectors removed; primitive source unchanged | primitive ownership/Astryx containment + CSS purge audit PASS |
| T3 | SD22 + SD03/SD05; IA11/IA12/IA28 | T2 | Queue/Create/application entry screens | purge commit deletes old screens before clean recreation; no old JSX/layout reuse | fresh screen-schema review + Queue/Create functional/rendered PASS |
| T4 | SD23; IA13/IA14/IA29 | T3 | WorkItem shell, rail, Work request/document screens | purge commit deletes old screen compositions; Markdown editors remain retained leaves | fresh screen-schema review + Work request/document/current-attention/Git rendered PASS |
| T5 | SD24; IA15/IA30 | T4 | pre-signoff screen/adapters | purge commit deletes old productive-stage screens/adapters before clean recreation | fresh per-stage information-schema review + semantic/rendered PASS |
| T6 | SD25; IA16/IA17/IA31 | T5 | Readiness + Approval screens | purge commit deletes both old review screens before clean recreation | fresh review-schema + readiness/return/currentness/sign-off rendered PASS |
| T7 | SD26; IA32 | T6 | Implementation screen | purge commit deletes old Implementation screen before clean recreation | fresh implementation-schema + task/attempt/blocker/validation/master-detail rendered PASS |
| T8 | SD27 + SD01 projection; IA19/IA33 | T7 | Complete/Evidence/Context screens | purge commit deletes old terminal/material screens before clean recreation | fresh terminal/material schemas + candidate/non-candidate/evidence/context rendered PASS |
| T9 | SD28 + SD14; IA18/IA34 | T8 | Settings/account/configuration screens | purge commit deletes old Settings/account screens before clean recreation | fresh configuration schema + settings/readiness/account/model rendered PASS |
| T10 | SD16-SD18/SD29; IA20-IA23 | T9 | verification only | no production mutation; any production defect routes to T2-T9 | exhaustive renderer/theme/responsive/scenario/regression certification PASS |
| T11 | SD30; IA26/IA24 | T10 | rendered evidence + CI + closeout metadata | no screenshot-driven production patch inside acceptance task | exhaustive manifest + row-level schema/UX/visual PASS + final V0-V7 |

**Audit rule:** a task cannot be marked complete because later tasks happen to render acceptably. Its own deletion evidence, semantic proof and rendered proof must be retained. A downstream task discovering a foundation defect reopens the owning earlier task rather than patching around it.

##### Execution waves

0. **Preflight 0 — DESIGN-positive reuse proof:** IA07-IA08. No production mutation.
1. **Wave 1 — authority/source/task/runtime corrections:** IA01-IA10 plus IA25 where still unsatisfied.
2. **Wave 2 — primitive preservation + legacy screen reset boundary:** IA27. No screen replacement may begin until retained primitives are certified and shared screen-specific CSS/compatibility rules are purged.
3. **Wave 3 — destructive Queue/Create replacement:** IA11, IA12, IA28.
4. **Wave 4 — destructive WorkItem shell + Work request/document replacement:** IA13, IA14, IA29.
5. **Wave 5 — destructive productive pre-signoff screen replacement:** IA15, IA30.
6. **Wave 6 — destructive Readiness/Approval replacement:** IA16, IA17, IA31.
7. **Wave 7 — destructive Implementation replacement:** IA32.
8. **Wave 8 — destructive Complete/Evidence/Context replacement:** IA19, IA33.
9. **Wave 9 — destructive Settings/account/configuration replacement:** IA18, IA34.
10. **Wave 10 — permanent semantic/component certification:** IA20-IA22.
11. **Wave 11 — cross-solution regression closure:** IA23.
12. **Wave 12 — rendered product acceptance:** IA26.
13. **Wave 13 — candidate closeout:** IA24.

Before Wave 1, BUILDER requests the signed `dependency-lock` gate once through the existing SD13 coordinator checkpoint and it must `GATE_PASSED`. After Wave 2 and after each presentation wave 3-9, the signed `architecture` gate and task-specific browser/rendered proof must pass before the dependent screen family begins. `ui/src/primitives/**`, approved leaf/content mechanisms and non-screen query/policy helpers are retained and are not screen-task mutation surfaces. IA27 may modify `theme.css`/`styles.css` only to remove obsolete screen-specific/compatibility presentation rules; it does not redesign primitives. Every IA28-IA34 task must create a purge checkpoint commit deleting its owned old screen files before any replacement screen code is authored, then recreate those paths from the current R2 screen-information schema. A downstream task may not patch or copy the pre-purge screen implementation. If retained primitive capability is insufficient, execution returns to DESIGN instead of modifying primitives locally. Wave 10 proves the replacement renderer/component/theme system semantically. Wave 12 produces exact-candidate rendered evidence only after ordinary gates are green. Wave 13 closes only after every rendered row is accepted.

##### IA01 — pure project-authority resolution

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


##### IA27 — preserve primitives and purge legacy screen presentation

**Solution:** SD21, with SD29 containment rules.
**Owners:** `ui/src/theme.css`; `ui/src/styles.css`; `tests/certification.test.ts`; `tests/browser.spec.ts`. `ui/src/primitives/**` is an explicitly retained, read-only implementation dependency for this campaign.
**Required mutation:** certify the existing canonical P4 primitive vocabulary and approved leaf boundaries without redesigning primitive source. Remove from shared stylesheets every obsolete screen-specific selector, compatibility presentation rule, feature-era topology rule or descendant override whose only purpose is to support the discarded screen implementations. Retain primitive/theme/global rules required by current P4/P5.
**Hard audit boundary:** no `ui/src/primitives/*.tsx` mutation; no WorkItem/Run/domain/query policy moved into primitives; no new primitive responsibility; no replacement screen authored in IA27.
**Deletion proof:** CSS/stylesheet audit identifies retained primitive/global rules versus deleted screen-specific rules; no compatibility selector remains for a pre-reconstruction screen class/DOM hierarchy.
**Proof:** primitive ownership/Astryx containment certification; stylesheet selector audit; primitive smoke/browser proof. IA28-IA34 are blocked until IA27 PASS.

###### Destructive screen replacement protocol for IA28-IA34

Every screen task follows the same non-negotiable sequence:

1. **Purge checkpoint:** create a task-local Git commit deleting all old screen/composition files owned by that IA and deleting any remaining task-local screen CSS/compatibility selectors. The purge commit contains no replacement screen JSX/DOM.
2. **Fresh schema checkpoint:** record/review the current R2 screen-information schema for the owned screens: Primary, Supporting, Technical, actions, states, responsive semantic order and work-kind/stage differences. This is design evidence, not a runtime DTO.
3. **Clean recreation:** recreate the deleted screen paths from that schema using retained Workbench primitives, approved leaves and canonical underlying query/domain owners. Pre-purge screen blobs are forbidden as implementation templates.
4. **No structural reuse:** old JSX/DOM hierarchy, field grouping, card/panel structure, table-column design, action placement, responsive branching, screen-local CSS/classes and visual hierarchy may not be copied or incrementally transformed.
5. **Proof before dependency advance:** semantic/browser tests plus required rendered comparison must PASS with zero unresolved row-level FAIL before the next screen task begins.

If required non-visual behavior exists only inside an old screen file, the task may not copy it automatically. It must consume the canonical underlying owner or return upstream for an architecture-preserving extraction decision.

##### IA28 — destructively replace Queue and Create

**Solutions:** SD22 plus existing SD03/SD05 semantic deltas through IA11/IA12.
**Owners:** `ui/src/app.tsx`, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`.
**Required mutation:** execute the destructive screen replacement protocol for the three owned paths. Build a fresh Queue Operational scan and Create/remediation TaskPanel→Form/configuration from R2. Keep normal populated Queue separate from source-diagnostic, empty, search and archive states. Create presents controlled Project/kind/Concerns/title plus subordinate derived context and one dominant Create action.
**Forbidden:** primitive mutation; feature-local structural CSS; copying old queue/modal/form/table composition; using SVGs as product authority.
**Proof:** purge commit + fresh screen-schema review + Queue/Create functional browser matrix + wide/narrow and theme rendered comparison to `queue*.svg`, `create-work-item.svg`, `create-linked-remediation.svg`.

##### IA29 — destructively replace WorkItem shell, Work request and document screens

**Solution:** SD23 plus IA13/IA14 where applicable.
**Owners:** `ui/src/WorkItemWorkspace.tsx`, `ui/src/WorkItemIdentityRow.tsx`, `ui/src/WorkflowRail.tsx`, `ui/src/WorkflowStepFrame.tsx`, `ui/src/DocumentWorkspace.tsx`.
**Retained dependencies:** `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`, `ui/src/workbench-presentation.ts`, query/API/domain owners.
**Required mutation:** delete the five owned old screen/composition paths at the purge checkpoint and recreate them from the fresh WorkItem-shell/document information schema. Compose one identity/nine-stage rail/current-attention/primary-material/optional-Context shell. Work request is a fresh Document-class screen. Markdown editors remain content leaves and do not contribute outer screen grammar.
**Forbidden:** primitive/retained-leaf mutation for screen convenience; copying old shell/frame/identity/rail/document markup or classes.
**Proof:** purge commit + fresh screen-schema review + Work request/document/Git/current-attention tests + wide/narrow rendered comparison.

##### IA30 — destructively replace Research, Requirements, Solution design and Plan screens

**Solution:** SD24 plus IA15 and existing productive-stage semantic corrections.
**Owners:** `ui/src/PreSignoffStageWorkspace.tsx`, `ui/src/ActivityWorkspace.tsx`, `ui/src/ActivityComposer.tsx`, `ui/src/WorkflowMaterialSelector.tsx`, `ui/src/ProposalReview.tsx`, `ui/src/RunEventTimeline.tsx`.
**Retained dependencies:** `ui/src/workbench-presentation.ts`, query/API/domain owners, Workbench primitives.
**Required mutation:** delete all six owned old paths at the purge checkpoint, then recreate the productive-stage family from fresh R2 schemas. Research/Requirements/Solution design/Plan share one current-attention/Document/Dialogue/Review grammar while retaining stage-specific information obligations. Current required input/proposal/blocker/processing owns attention; current governed document is primary otherwise; history/evidence/activity is subordinate.
**Forbidden:** old stage layout reuse; primitive mutation; feature-owned responsive topology; copying prior dialogue/proposal/timeline composition.
**Proof:** purge commit + four fresh stage-schema reviews + four-kind Research/Change/Defect downstream browser matrix + required-input/proposal/document/dialogue rendered review.

##### IA31 — destructively replace Readiness and Approval

**Solution:** SD25 plus IA16/IA17.
**Owners:** `ui/src/ReadinessWorkspace.tsx`, `ui/src/SignoffReview.tsx`.
**Required mutation:** delete both old screens at the purge checkpoint, then recreate them as fresh Review-class screens from R2. Readiness makes typed R3 verdict/findings/return owner dominant. Approval makes readiness/currentness/task meaning dominant and sign-off the sole primary mutation; technical identity is subordinate.
**Forbidden:** old generic stage/card review markup; primitive mutation; technical-identity-first hierarchy.
**Proof:** purge commit + fresh Readiness/Approval schemas + readiness return/blocked/ready and Approval current/stale/sign-off tests + wide/narrow rendered review.

##### IA32 — destructively replace Implementation

**Solution:** SD26.
**Owner:** `ui/src/ExecutionWorkspace.tsx`.
**Retained dependencies:** replacement `RunEventTimeline` from IA30, Workbench primitives, canonical execution/query owners.
**Required mutation:** delete the old Implementation screen at the purge checkpoint, then recreate it from the fresh C12 screen schema as the canonical operational master/detail topology. Detail presents current task/owner/action, attempt, blocker, validation and chronology; historical selection never steals current attention.
**Forbidden:** old stacked/card/task-count-driven layout; primitive mutation; copying prior execution markup/classes.
**Proof:** purge commit + fresh Implementation schema + execution task/attempt/blocker/validation tests + wide/narrow rendered comparison.

##### IA33 — destructively replace Complete, Evidence and Context

**Solution:** SD27 plus IA19 product-language projection.
**Owners:** `ui/src/TerminalResult.tsx`, `ui/src/EvidenceViewer.tsx`, `ui/src/WorkItemContext.tsx`.
**Retained dependencies:** approved raw-content leaves, `ui/src/workbench-presentation.ts`, canonical material/query owners.
**Required mutation:** delete all three old screens at the purge checkpoint, then recreate fresh Terminal result, Evidence and Compact context screens from R2. Complete makes final outcome primary, candidate resources only when applicable, and linked remediation a separate authoring action. Context remains supporting/technical only.
**Forbidden:** old result/evidence/context card systems; primitive mutation; copying prior screen hierarchy.
**Proof:** purge commit + fresh terminal/evidence/context schemas + candidate/non-candidate/linked-remediation/material tests + wide/narrow rendered review.

##### IA34 — destructively replace Settings and OpenCode/account configuration

**Solution:** SD28 plus IA18.
**Owners:** `ui/src/SettingsWorkspace.tsx`, `ui/src/OpenCodeAccountControl.tsx`, `ui/src/OpenCodeAccountSettings.tsx`.
**Required mutation:** delete all three old screen implementations at the purge checkpoint, then recreate fresh operator-first Settings/configuration screens from R2. Readiness/meaning/actions are primary; exact paths/endpoints/account identifiers are subordinate unless the active task requires them.
**Forbidden:** old admin/card/account/repository/model screen grammar; primitive mutation; feature-local structural CSS.
**Proof:** purge commit + fresh Settings/account/configuration schemas + readiness/repository/account/model/login/confirmation tests + wide/narrow/theme rendered review.

##### IA26 — rendered 0.6.0 UX/UI acceptance evidence

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

This component allocates proof across the one canonical signed task graph T1-T11. It does not create another validation model.

##### Task-boundary architecture checkpoints

Preflight IA07 re-proves the existing coordinator-owned signed-checkpoint capability; no candidate byte is relied upon to create it.

Before T1 begins, the execution harness provides the exact Playwright-owned Chromium runtime required by P6 and the BUILDER requests the signed `dependency-lock` gate. Exact `bun ci` must `GATE_PASSED` before implementation mutation.

Every signed task carries the same six logical gate IDs. In addition to the task's final gate union, the dependency chain has explicit stop/go boundaries:

| Completed task | Before dependent task | Required retained evidence |
|---|---|---|
| T1 | T2 | non-UI baseline gates PASS; no protected execution-foundation mutation |
| T2 | T3 | retained primitives certified unchanged; legacy screen-specific/compatibility CSS purge audited; no screen replacement authored yet |
| T3 | T4 | `architecture` + Queue/Create functional/rendered row review PASS |
| T4 | T5 | `architecture` + WorkItem shell/Work request/document review PASS |
| T5 | T6 | `architecture` + productive pre-signoff semantic/rendered review PASS |
| T6 | T7 | `architecture` + Readiness/Approval semantic/rendered review PASS |
| T7 | T8 | `architecture` + Implementation master/detail semantic/rendered review PASS |
| T8 | T9 | `architecture` + Complete/Evidence/Context semantic/rendered review PASS |
| T9 | T10 | `architecture` + Settings/account semantic/rendered review PASS |
| T10 | T11 | complete semantic/component/theme/responsive regression suite PASS |

A dependent task must not start merely because the previous task compiled. For T3-T9, the task evidence must include a purge checkpoint commit deleting the owned old screen files before any replacement authorship, a fresh screen-information-schema review, and the task-specific semantic/rendered proof. Pre-purge screen blobs are defect evidence only and cannot be accepted as implementation ancestry. If a downstream task discovers a genuine primitive defect, execution returns to DESIGN; neither T2 nor the screen task may rewrite primitives as a convenience fix. Local CSS/primitive bypass is not an admissible repair.

A failed checkpoint permits only correction inside the owning signed task/design or an explicit execution block. It does not grant provider shell/execute or authorize redesign. Task-boundary checkpoints never substitute for V3/V5/V7 or the task's complete logical gate union.

##### Screen purge/rebuild evidence law

For T3-T9, verification must retain both sides of the replacement boundary:

- the purge checkpoint Git commit and exact deleted screen paths;
- proof that the purge commit contains no replacement screen JSX/DOM;
- the fresh screen-information-schema review derived from current R2;
- replacement commits authored after the purge checkpoint;
- a diff/audit proving retained primitives and approved non-screen helpers were not modified for screen convenience;
- task-specific semantic/browser evidence;
- task-specific rendered comparison and row-level PASS/FAIL.

A final screen that looks correct is insufficient if the task cannot prove the old screen implementation was removed before replacement. Conversely, deletion alone is insufficient without fresh schema and rendered proof.

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

Current `tests/architecture.test.ts` is stale against the corrected package: its permanent PLAN fitness check still requires exactly 28 signed `changeSurface` paths even though current DESIGN/PLAN now require 30. This is a pre-signoff verification-material defect, not T1 implementation surface.

Before G5/G5A/R3 may return to PASS, correct the existing architecture sensor so it validates the corrected DESIGN/PLAN task-local forecast union without creating a second package registry. The sensor must prove uniqueness plus exact set equality between DESIGN forecast and the union of signed task `changeSurface` entries; it must not preserve historical literal path counts as authority. It must structurally require the exact IA01-IA34 catalog, enforce one definition per IA, and recognize IA27-IA34 as the presentation reconstruction owners plus IA23/IA26/IA24 as cross-solution/rendered-acceptance/final actions. This is campaign/package-fitness repair only: it does not move `tests/architecture.test.ts` into signed implementation tasks. Re-run architecture and root/modular compilation checks on the corrected package before G5 may return to PASS.

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
- all 25 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- each signed task retains its exact `changeSurface`; the union remains the cumulative immutable forecast;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- bootstrap `dependency-lock` passed before T1 and every T1-T10 dependency boundary retained its required architecture/semantic/rendered stop-go evidence before the dependent task began;
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
      "objective": "Preserve and revalidate the already-correct non-UI 0.6.0 technical corrections from SD01-SD20 while the presentation package is rebuilt: authority resolution/materiality, durable authority input/proposals, current-v2 task admission, Approval ingress, singular source admission, guided installer and exact-pin OpenCode certification remain the canonical baseline. Make only the exact remaining non-UI mutations already authorized by DESIGN; do not alter presentation semantics or reimplement execution-foundation reuse.",
      "dependsOn": [],
      "scope": [
        "README.md",
        "src/core/**",
        "src/daemon/**",
        "src/shell/**",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/installer.test.ts",
        "tests/opencode.test.ts",
        ".github/workflows/ci.yml"
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
        "ui/src/**",
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE",
        "GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP"
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
        ".github/workflows/ci.yml"
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
        "GW-DOC-OPENCODE-INTEGRATION-V1"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "shell",
        "verification"
      ]
    },
    {
      "id": "T2",
      "objective": "Preserve and certify the existing canonical Workbench primitives while purging legacy screen presentation support (SD21, IA27). Do not modify ui/src/primitives/**. Remove obsolete screen-specific/compatibility selectors from theme.css/styles.css, prove the primitive/Astryx/leaf boundaries remain current, and establish the destructive screen-replacement boundary before any new screen is authored.",
      "dependsOn": [
        "T1"
      ],
      "scope": [
        "ui/src/styles.css",
        "ui/src/theme.css",
        "tests/browser.spec.ts",
        "tests/certification.test.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/app.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/DocumentWorkspace.tsx",
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
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "ui/src/styles.css",
        "ui/src/theme.css",
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
        "GW-P1-MINIMUM-CHANGE",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
      ],
      "concernIds": [
        "foundation",
        "ui",
        "verification"
      ]
    },
    {
      "id": "T3",
      "objective": "Destructively replace Queue and Create WorkItem (SD22, IA11, IA12, IA28). First commit a purge deleting app.tsx, WorkItemQueue.tsx and CreateWorkItem.tsx with no replacement JSX; then recreate them from the current R2 screen-information schemas using retained primitives. No old screen layout, field grouping, table-column design, CSS/class structure or responsive composition may be copied or incrementally transformed.",
      "dependsOn": [
        "T2"
      ],
      "scope": [
        "ui/src/app.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "tests/browser.spec.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "ui/src/app.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "tests/browser.spec.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T4",
      "objective": "Destructively replace the WorkItem shell, Work request and governed document screens (SD23, IA13, IA14, IA29). Purge the five old screen/composition paths first, then recreate the shell/document screens from current R2 using retained primitives and retained Markdown editors as content leaves only. No old shell/frame/rail/document composition may survive.",
      "dependsOn": [
        "T3"
      ],
      "scope": [
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T5",
      "objective": "Destructively replace Research, Requirements, Solution design and Implementation plan screens (SD24, IA15, IA30). Purge all six old productive-stage screen/adapters first, then recreate the family from fresh R2 screen-information schemas using one retained primitive grammar. Old dialogue/proposal/timeline/layout composition is forbidden reuse.",
      "dependsOn": [
        "T4"
      ],
      "scope": [
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/RunEventTimeline.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/RunEventTimeline.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T6",
      "objective": "Destructively replace Readiness and Approval (SD25, IA16, IA17, IA31). Purge both old review screens first, then recreate fresh Review-class screens from R2. Old stage/card review composition and technical-identity-first hierarchy are forbidden reuse.",
      "dependsOn": [
        "T5"
      ],
      "scope": [
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T7",
      "objective": "Destructively replace the Implementation screen (SD26, IA32). Purge ExecutionWorkspace.tsx first, then recreate it from the fresh C12 screen-information schema using retained primitives and the replacement RunEventTimeline from T5. No old stacked/card/task-count-driven execution layout may survive.",
      "dependsOn": [
        "T6"
      ],
      "scope": [
        "ui/src/ExecutionWorkspace.tsx",
        "tests/browser.spec.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "ui/src/ExecutionWorkspace.tsx",
        "tests/browser.spec.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T8",
      "objective": "Destructively replace Complete, Evidence and Context (SD27, IA19, IA33). Purge all three old screens first, then recreate fresh Terminal result, Evidence and Compact context screens from R2 using retained primitives/approved content leaves. Old result/evidence/context screen hierarchy is forbidden reuse.",
      "dependsOn": [
        "T7"
      ],
      "scope": [
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/WorkItemContext.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1"
      ],
      "changeSurface": [
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/WorkItemContext.tsx",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T9",
      "objective": "Destructively replace Settings and OpenCode/account configuration screens (SD28, IA18, IA34). Purge the three old screen implementations first, then recreate fresh operator-first Settings/configuration screens from R2 using retained primitives. Old admin/card/account/repository/model screen grammar is forbidden reuse.",
      "dependsOn": [
        "T8"
      ],
      "scope": [
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "tests/browser.spec.ts"
      ],
      "exclusions": [
        "ui/src/primitives/**",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-INSTALLATION-READINESS-V1"
      ],
      "changeSurface": [
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "tests/browser.spec.ts"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    },
    {
      "id": "T10",
      "objective": "Certify the fully replaced Workbench screen layer as one component/theme/interaction system (SD16-SD18, SD29, IA20-IA23). Prove exhaustive screen classification, primitive containment, absence of pre-reconstruction screen grammar/compatibility CSS, scenario-41 behavior, responsive semantic continuity, System/Light/Dark parity and cross-solution regression closure. Production defects return to their owning T2-T9 task or DESIGN for a primitive defect.",
      "dependsOn": [
        "T9"
      ],
      "scope": [
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        "tests/workbench-presentation.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/installer.test.ts",
        "tests/opencode.test.ts",
        ".github/workflows/ci.yml"
      ],
      "exclusions": [
        "ui/src/**",
        "src/**",
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE"
      ],
      "changeSurface": [
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        "tests/workbench-presentation.test.ts",
        ".github/workflows/ci.yml"
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-OPENCODE-INTEGRATION-V1"
      ],
      "concernIds": [
        "foundation",
        "ui",
        "verification"
      ]
    },
    {
      "id": "T11",
      "objective": "Produce and review the exhaustive exact-candidate rendered acceptance package (SD30, IA26) and close only when every governed replacement screen/state has PASS for schema/information fidelity, UX/interaction fidelity and visual/UI fidelity. Any screen FAIL returns to T3-T9; shared stylesheet purge defects return to T2; a primitive defect returns to DESIGN. After zero unresolved FAIL, record closeout metadata and run final gates/V0-V7.",
      "dependsOn": [
        "T10"
      ],
      "scope": [
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        ".github/workflows/ci.yml",
        "CHANGELOG.md"
      ],
      "exclusions": [
        "ui/src/**",
        "src/**",
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-VALIDATION-STANDARD-V1"
      ],
      "changeSurface": [
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        ".github/workflows/ci.yml",
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
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1"
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
