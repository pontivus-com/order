# 0.6.0 verification and closeout contract

This component allocates proof across the one canonical T1 candidate and its ordered IA01-IA34 implementation/proof phases. It does not define implementation actions, component APIs or another task representation; those are owned by `12-action-catalog.md`, P4 and DESIGN respectively.

## In-task architecture and reconstruction checkpoints

This verification component declares no campaign gate or authorization state. Eligibility for signed execution or any bounded IA27/IA28 grant is governed only by the campaign register and the P0 bounded acceptance-evidence rule. A bounded grant is eligible only after current R3/G6 has returned `READY_FOR_SIGNOFF`; this file owns only the evidence/checkpoint requirements.


Preflight IA07 re-proves the existing coordinator-owned signed-checkpoint capability; no candidate byte is relied upon to create it.

Before T1 mutation begins, the execution harness provides the exact Playwright-owned Chromium runtime required by P6 and the BUILDER requests the signed `dependency-lock` gate. Exact `bun ci` must `GATE_PASSED`.

T1 carries the same six logical gate IDs through final validation. During the live BUILDER Run, coherent phase boundaries may request already-signed gates through SD13; those checkpoints provide feedback and continuation inside the same task/Run and never substitute for final V3/V5/V7.

| Completed phase | Before next phase | Required retained evidence |
|---|---|---|
| read-only IA07/IA08 and current R3/G6 | normal sign-off | exact existing capability proof; no mutation before sign-off absent separate grant |
| signed IA01/IA02/IA04 and existing capability proof | IA27/IA28 | exact ref/decision conformance and reuse |
| IA27/IA28 | IA29 | existing shell/Context/ResourceList, Queue/Create proof, accepted scope and exact residuals |
| IA29 | IA31 | signed document membership and Document-first/narrow proof |
| IA31 | IA30 | exact current/historical Approval and existing Review/Proposal/Readiness component/action proof |
| IA30 | P0.4 HUX-09 / IA20+IA26 targeted fidelity proof | exact PLAN/current attention and direct productive composition |
| P0.4 HUX-09 / IA20+IA26 targeted fidelity proof | IA32 | exact same-scope comparison and explicit outstanding HUX disposition |
| IA32 | IA33 | exact current blocker and chronology/validation/evidence |
| IA33 | IA34 | reached Complete, exact candidate chain, non-delivery/Evidence |
| IA34 | IA20-IA23 integrated certification | Settings/diagnostic negative-state matrix |
| IA20-IA23 | IA26 | all 46 scenarios and component/theme proof |
| IA26 | IA24 | 37 SURF independently judged, zero unresolved FAIL, explicit human HUX and exact candidate |

## UI reconstruction evidence law

`12-action-catalog.md` is the single owner of IA27-IA34 mutation procedures and physical dispositions. Verification records evidence against those dispositions; it does not restate or reinterpret them.

For every affected physical owner, retained evidence records: canonical P4/SD/F6B authority; catalogued disposition; pre-mutation evidence where destructive/decompose work is required; exact resulting API/consumer set; removed obsolete selectors/owners; and the phase-local semantic/browser/rendered result. A final-looking screen is insufficient if a forbidden owner, compatibility API, duplicate semantic component responsibility or feature-local substitute grammar remains.

IA27/IA28 prove existing shell/Context/ResourceList and exact residuals; later phases own consumer proof.

Phase-local rendered proof remains bounded to each IA's owned SURF rows plus shared invariants exercised there. After all owning phases, IA20/IA26 prove the global component API/consumer/SoC matrix, no local substitute semantic grammar, no nested/synthetic primary composition, and the complete 37-SURF union.

## Requirement-level proof law
## Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the authority-defined remainder still conforms; do not infer a preservation target from current implementation.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

A01 corrected-upstream no-code rows `A01-NC01`-`A01-NC05` are also binding proof instructions: verify their exact canonical authority identities and stated R1 semantic propositions under V4, authorize no T1 production mutation for those corrections, and return upstream if any authority/evidence contradiction is found.

## P3 §23 certification execution allocation

Each Snn references the corresponding numbered scenario of `GW-DOC-WORKBENCH-UX-V2 §23`. This is a proof allocation, not another functional specification. Record exact test name, fixture, result and candidate; reuse only actual sufficient assertions. IA23 owns integrated verification gaps; feature defects route to their IA, not to fixture relaxation. P4 §14.1–14.5 forward/inverse transition matrix, turn grammar, concurrency pairs and observational reads also require explicit proof in existing suites.

| Scenario | Existing proof/consumer action | Exact verification file(s) | Acceptance proposition from P3 §23 |
|---|---|---|---|
| S01 | IA30 | `tests/browser.spec.ts` | Research starts asynchronously, completes, and Requirements appears without page reload. |
| S02 | IA30/IA23 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | A Run processing a provider turn cannot accept another message. |
| S03 | IA30 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | An active Run that is idle/open can accept exactly one continuation and becomes processing. |
| S04 | IA30/IA15 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | A required-input request accepts one bound answer and rejects duplicate/stale answers. |
| S05 | IA14/IA16/IA31 | `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts` | R3 returns to Plan; R3 remains reached/historical and inspectable. |
| S06 | IA14/IA32 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | Implementation returns to Design/Plan; Approval and prior Implementation remain reached/historical. |
| S07 | IA17/IA31 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Stale Approval package inspection performs no hidden transition. |
| S08 | IA09/IA10/IA29 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Source diagnostic blocks Start before the operator invokes it. |
| S09 | IA13/IA29 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | Editing upstream authority while a Run is active cannot be canonically saved. |
| S10 | IA03/IA30/IA31 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | A lifecycle proposal from R1 cannot target PLAN/R3 and adoption cannot skip stage conformance. |
| S11 | IA32 | `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | A blocked execution task is visible even when an older completed task was previously selected. |
| S12 | IA30/IA32 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Final Run completion/failure/conformance events remain visible after terminalization. |
| S13 | IA27/IA30 | `tests/browser.spec.ts` | The second pre-signoff attempt does not change the primary canvas width. |
| S14 | IA27/IA30 | `tests/browser.spec.ts` | Creation/removal of the owning lifecycle document does not add/remove a persistent side rail. |
| S15 | IA27 | `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | Current workflow styling does not resize workflow rail cells. |
| S16 | IA27 | `tests/browser.spec.ts` | Context never opens automatically and has one stable bounded width when explicitly opened. |
| S17 | IA29/IA14 | `tests/browser.spec.ts` | Wide/medium/narrow layouts preserve unsaved editor buffer and current attention. |
| S18 | IA14/IA23 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Mutation error after a separately observed canonical transition reconciles to the new state rather than presenting stale controls. |
| S19 | IA09/IA10/IA29 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Saving/refining an unprogressed Work request remains at IDEA; only explicit Start Research enters R1. |
| S20 | IA23/IA30 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | A provider turn containing contradictory controlling events applies none of those returned workflow effects, fails the Run, leaves the WorkItem at the same workflow step and exposes governed Retry/recovery where eligible. |
| S21 | IA03/IA04/IA30 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | A required-input request cannot coexist with a lifecycle proposal in the same provider turn and cannot be answered twice. |
| S22 | IA14/IA16/IA32 | `tests/core.test.ts`, `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | Returning from R3 or Implementation preserves every previously reached downstream step as historical. |
| S23 | IA17/IA31 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Approval package read can expose stale currentness but cannot itself execute the upstream return. |
| S24 | IA14/IA23 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | Rejected/stale commands and historical navigation are proven state-preserving across every workflow step. |
| S25 | IA20/IA27–IA34 | `tests/certification.test.ts`, `tests/browser.spec.ts` | Every rendered Workbench service resolves to one §13 primary interaction class; subordinate selector/context/task-panel/confirmation behavior does not introduce an undeclared persistent screen grammar. |
| S26 | IA22/IA27 | `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts` | Queue, creation, Settings, document/editor, dialogue, review, implementation, evidence, result and Context rendering all use the same semantic color, typography, spacing/density, control, status, feedback and focus language in light and dark themes. |
| S27 | IA20 | `tests/certification.test.ts` | Every production rendering owner is accounted for by the P4 renderer-to-primitive coverage matrix; an unclassified renderer or direct recreation of an owned UI mechanic fails architecture fitness. |
| S28 | IA03/IA31 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | Proposal adoption survives interruption as ADOPTION_IN_PROGRESS for the exact durable proposal; Reject/free continuation remain unavailable until exact reconciliation/disposition completes. |
| S29 | IA14/IA23 | `tests/core.test.ts`, `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | Every canonical state fixture resolves to one closed current-attention category and one recovery route; no fixture exposes two competing current actions. |
| S30 | IA27 | `tests/core.test.ts`, `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | Every stage in every forward/backward lifecycle fixture produces a deterministic rail reach state, and the current stage produces exactly one READY/PROCESSING/ACTION_REQUIRED/BLOCKED/STALE/COMPLETE marker. |
| S31 | IA14/IA23 | `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | A RunEvent/WorkItem/task observation that has not yet converged produces CONVERGING/PROCESSING presentation with mutation controls suppressed, then resolves without inventing the missing transition locally. |
| S32 | IA32 | `tests/core.test.ts`, `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | Execution fixtures deterministically identify the current task owner and durable validation boundary independently from historical task/Run selection. |
| S33 | IA20/IA22 | `tests/certification.test.ts`, `tests/browser.spec.ts` | Primary/secondary/ghost/destructive actions, fields, status/notices, operational rows, headings, disclosures and overlays render with the same semantic component language in Queue, Create, Settings and representative WorkItem workflow services. |
| S34 | IA22 | `tests/browser.spec.ts` | System/Light/Dark switching updates the complete application—including overlays, Markdown, code/evidence and source editor—without reload or loss of selected WorkItem/material, dirty buffer, focusable task context or workflow state. |
| S35 | IA22 | `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts` | Light and dark render every neutral/current/selected/info/success/warning/danger/focus semantic role distinctly using the same meaning; no feature or specialist renderer exposes a conflicting local palette. |
| S36 | IA22 | `tests/browser.spec.ts` | System preference follows effective browser/OS color scheme when no explicit Light/Dark preference exists; explicit Light/Dark remains stable until changed, and preference-storage failure does not affect live theme behavior. |
| S37 | IA13/IA29 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | While any Run is active, Work request/title and editable lifecycle-document Save remain unavailable in the browser and rejected by the daemon. |
| S38 | IA03/IA30/IA31 | `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/browser.spec.ts` | A pending proposal makes Cancel unavailable; rejection restores ordinary open continuation and only then may Cancel become available. |
| S39 | IA32 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | With two runnable WorkItems/tasks, the manual Implementation current-task action starts exactly the displayed canonical current task and cannot advance the other WorkItem. |
| S40 | IA29 | `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | A deterministic repository lifecycle draft with no historical Run remains visible as Draft without fabricated reach/completion/conformance/readiness/approval state. |
| S41 | IA21 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Change/Defect/Investigation/Audit task fixtures render the correct kind-specific Work request/Research information, and shared Change/Defect delivery steps preserve their distinct upstream obligations. |
| S42 | IA30 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Processing can display bounded activity without exposing raw provider/session/tool payloads; optional activity telemetry loss does not alter canonical workflow state. |
| S43 | IA30 | `tests/workbench-presentation.test.ts`, `tests/browser.spec.ts` | Every free-form continuation fixture shows the preceding substantive agent message and prior accepted operator/agent turns in the same Dialogue surface; removing that conversational anchor makes the composer unavailable. |
| S44 | IA30/IA15 | `tests/daemon.test.ts`, `tests/browser.spec.ts` | Every required-input fixture shows the exact agent question inline with the selected attempt transcript and binds the composer to that question while preserving any additional agent explanation from the same turn. |
| S45 | IA30 | `tests/browser.spec.ts` | Agent/user messages remain visually distinguishable from workflow events, operational activity, evidence and technical diagnostics even when all are present for the same attempt. |
| S46 | IA20/IA26 | `tests/certification.test.ts`, `tests/browser.spec.ts` | Every governed surface proves its §11.4A visibility contract in both directions: Primary information is visible by default; Technical/Diagnostic information is absent by default; the authorized WorkItem Context/Settings-diagnostics/Evidence/confirmation owner exposes the exact value only after explicit entry; a technical blocker promotes human-readable meaning/action without leaking raw diagnostic identity. |

For every applicable datum/action row of the 37 DESIGN SURF contracts, record SURF ID and row label, canonical source/class/placement/default visibility, exact state and admitted/absent action, test name/fixture and actual interaction outcome, inspection/return and capture/reference ID where applicable. IA26 records independent schema_information/ux_interaction/visual_ui PASS or FAIL with rationale; missing positive or applicable negative proof blocks. DESIGN is the closed inventory. Prove wide/medium/narrow and effective themes; compare settled same-state/same-selection/same-scope native-size images. Broad fallbacks and non-equivalent captures cannot satisfy acceptance.

## Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA26 has two distinct obligations: automated exact-candidate rendered evidence generation and explicit rendered acceptance review. A green Actions capture job proves evidence generation only and carries no automatic schema/UX/visual PASS. IA24 runs the final validation contract only after the separate row-level IA26 acceptance ledger is complete with zero FAIL. The binding operator UI findings in `12-action-catalog.md` (`HUX-01` through `HUX-11`) are additional hard acceptance rows: no machine result may disposition them, every affected fresh capture must reference the applicable HUX id, and IA24 remains blocked until every HUX row is explicitly `ACCEPTED` by the operator.

SD20 exact-pin OpenCode proof is a mandatory IA23 precondition to IA26 and IA24: permanent PR verification must execute the actual supported OpenCode 2.2.6 process through Order's production OpenCode boundary while deterministic model output is supplied by the exact isolated simulation tooling authorized by SD20. A fake OpenCode executable, a removed temporary workflow, or a simulated response path that does not launch the exact supported OpenCode process cannot satisfy this proposition. The evidence must state the simulation boundary and must not be reused as proof of remote provider availability, Console OAuth/account connectivity or model quality.

### Pre-Approval structural-sensor correction

The permanent package sensor is protected pre-signoff material. It validates exact 40-path DESIGN/T1 scope and forecast, exclusions, existing closed API proof and required absence, authority/Approval integration paths, 37 SURF, 46 scenarios, single catalog and compiled blob identity.

This sensor correction is campaign/package fitness only: `tests/architecture.test.ts` remains outside signed implementation tasks. Re-run architecture and root/modular compilation checks on the corrected package before G5 may return to PASS.

## 0.6.0 implementation delivery branch

The original 0.6.0 implementation branch was deleted after its unauthorized squash delivery to `master`. Remediation continues on the surviving 0.6.0 continuation branch/PR `fix/0.6.0-post-squash-campaign-fitness` / PR #83, which is based on that accidentally integrated candidate. This is a repository-delivery fact only; it does not treat `master` as authorization to release, does not alter Order's Approval/execution semantics, and does not authorize another merge.

- all remaining 0.6.0 remediation, verification and `[Unreleased]` changelog changes continue on PR #83 until the implementation and governed closeout are complete;
- do not split the signed T1 across additional work branches/PRs solely for organizational convenience; any material need to change signed scope, design, ownership or task semantics returns upstream through the normal lifecycle while remaining on this governed work branch unless repository governance itself requires otherwise;
- do not use `release/v0.6.0` for product implementation; that branch name remains reserved for the later metadata-only release PR governed by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`;
- no further direct or PR-mediated `master` delivery is permitted without explicit user authorization, and the exact current PR candidate must pass the repository's required verification before it can even become merge-ready.

## Final logical gate union and order

The signed task's `gateIds` order is executable order for each fresh REVIEWER workspace and for final V3/V7. `dependency-lock` must be first so later Node-based gates see the exact lockfile-installed dependency graph. The execution harness must have provisioned the pinned Playwright Chromium runtime before execution starts.

1. dependency-lock
2. typecheck
3. architecture
4. test
5. build
6. browser

The six logical gates remain the canonical signed task gate union. IA26 is an additional terminal PR acceptance obligation executed by GitHub Actions after those gates; it does not introduce a seventh P6 gate or replace any V0-V7 proposition.

## Bounded pre-sign-off IA27/IA28 evidence lane

The pre-sign-off IA27/IA28 lane is conditional evidence machinery only. It is eligible only after the exact current package has passed R3/G6 as `READY_FOR_SIGNOFF`. Whether a grant is active is then owned exclusively by campaign §17A/§18; without exact-package authorization from that owner, this lane confers no mutation authority. When authorized, it must remain capable of producing IA27/IA28 evidence while later-phase UI obligations are open:

1. PR verification first runs dependency-lock, typecheck, architecture, the complete non-browser test gate and build on the exact merge candidate;
2. before the ordinary full browser step, a dedicated Playwright scenario/capture lane runs only the IA27/IA28 proof set: `SURF-WI-001`, `SURF-WI-CONTEXT-001`, `SURF-APP-001`, `SURF-QUEUE-001` and `SURF-CREATE-001`, plus the exact semantic/browser states declared by IA27/IA28;
3. that lane uploads a separately named artifact bound to the exact candidate SHA and records only phase-local evidence; it does not emit or imply `GATE_PASSED(browser)`;
4. the ordinary full browser suite then runs unchanged. Failures owned by IA29-IA34 remain visible and blocking for their owning phases/final validation, but they do not retroactively suppress the already-generated IA27/IA28 artifact;
5. final IA26 remains after a green ordinary browser gate and still captures/reviews the complete 37-SURF exact-candidate union.

The bounded lane is not a waiver, test skip or alternate browser gate. It exists solely to make the campaign's phase-local pre-sign-off evidence boundary executable without authorizing downstream implementation.

## Foundation revalidation — IA27/IA28

Retain explicit operator milestone within scope; no blanket HUX/IA26 acceptance. Prove current-marker, narrow toolbar and reference/consumer residuals through existing IA27/IA28 SURF. Optional bounded evidence requires current R3 and separate grant; no mandatory reconstruction. Record independent schema_information, ux_interaction, visual_ui and component-ownership evidence. Disproven retained owner returns upstream. IA26 remains exhaustive exact-candidate acceptance.

## Final exhaustive rendered 0.6.0 UX/UI acceptance — IA26

The exact PR merge candidate must pass a dedicated GitHub Actions rendered-acceptance step before IA24 closeout. This step uses the existing Playwright production Workbench harness and the authority-bound derived comparison corpus at `docs/references/workbench-ui/reference-manifest.json`; it does not create a second visual specification.

### Evidence generation contract

GitHub Actions must:

1. execute only after dependency-lock, typecheck, architecture, test, build and the ordinary browser suite have passed;
2. run the IA26 capture cases in `tests/browser.spec.ts` against the exact checked-out PR merge candidate;
3. capture actual PNG output for every IA26-required workflow/surface/state/view/theme row;
4. generate a machine-readable manifest and comparison index containing the exact candidate SHA and, for every capture, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, route/selection, current authority refs, corresponding reference path and mandatory governed `captureScope`;
5. prove exhaustive coverage **and scope equivalence**: a runtime crop may be compared only with a reference governing the same composition scope; a component crop may not stand beside a full-screen reference as equivalent acceptance evidence;
6. fail evidence generation on missing/duplicate mappings, missing/invalid captureScope, unreachable declared state, runtime error, missing/empty capture or incomplete manifest/index;
7. upload the actual captures plus manifest/index as one PR-run artifact using `actions/upload-artifact` pinned to commit `ea165f8d65b6e75b540449e92b4886f43607fa02` (the current `v4` ref at PLAN correction time), with artifact identity including the exact checked-out candidate SHA.

The capture harness uses `tests/browser.spec.ts` and `tests/e2e-server.ts` for canonical persisted fixtures/assertions. IA26 owns the three exact derived reference-corpus paths in the forecast with independent authority review; CI remains in `.github/workflows/ci.yml`. Proof within T1, not another executable task or production mutation grant.

### Acceptance review contract

The GitHub Actions artifact is then reviewed row by row. Automated capture/coverage success is not a review verdict. Every review record is bound to the exact capture, governed scope and current authority and includes explicit rationale.

Every manifest row records three independent verdicts:

- `schema_information`: every rendered datum/action maps to exactly one current DESIGN `SURF-*` row and every applicable DESIGN row is realized with its declared source/class/placement/disclosure rule; all authority-required Primary information is present with correct labels/grouping/hierarchy/prominence; Supporting/Operational information appears only where explicitly authorized; generic workflow-state/material chrome and raw typed/technical vocabulary are absent from ordinary UI; singular Context/Settings-diagnostics/Evidence ownership and correct return behavior are preserved. An unmapped rendered datum/action or missing applicable DESIGN row is `FAIL` and returns upstream to DESIGN rather than being inferred by implementation;
- `ux_interaction`: the direct owning interaction class is correct; required-absent WorkflowStepFrame/WorkflowMaterialSelector equivalents are absent; Dialogue remains continuous across OPEN/REQUIRED_INPUT/PROCESSING turns; Review/Evidence/Terminal primaries are not wrapped/nested; current-attention/action precedence, recovery and responsive composition conform;
- `visual_ui`: rendered hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, clipping/wrapping, overlays and theme behavior materially conform.

For **HUX-09**, `visual_ui` review is a mandatory same-scope reference-fidelity comparison, not a gestalt or machine-only judgment. The targeted set now includes the operator-rejected shared application toolbar/header and selected-WorkItem identity chrome (`SURF-APP-001`, `SURF-WI-001`) in addition to the previously rejected Document/Dialogue/Review surfaces. The reviewer must compare the fresh exact candidate for each operator-rejected capture against the corresponding current `SURF-*`/state/theme composition in `docs/references/workbench-ui/reference-atlas.html` / `reference-manifest.json` and record any material difference in hierarchy, density, spacing, alignment, typography, Facts/ResourceList/Review-section/decision anatomy, action prominence, content measure or responsive recomposition. An automated browser/render PASS cannot satisfy this row. Operator-facing review covers the existing HUX and UI-01–UI-20 targeted deficiencies and required variants (UI-02 superseded by UI-08). Full IA26 evidence is retained internally; no omitted comparison or unrelated artifact dump. Existing HUX acceptance law remains.

Each dimension is `PASS` or `FAIL`; no `PARTIAL`, aggregate-only pass or unreviewed row may reach IA24. An unexplained material divergence from the same-scope authority-bound reference composition is `FAIL`. A divergence required by newer current authority is `PASS` only when the exact superseding authority is recorded.

Any failed row blocks closeout, opens remediation at the defective implementation/authority owner, and requires a fresh exact-candidate GitHub Actions capture and review for the affected row after correction. Existing semantic/browser tests remain mandatory and cannot be replaced by screenshot acceptance.


## V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their exact current R1 evidence and DESIGN disposition;
- all 27 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- T1 retains exact 40-path forecast and protected exclusions; no obsolete component recreation;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- bootstrap dependency-lock passed; exact residual/reuse proofs and normal V0–V7 closure retained;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner, deprecated prop/alias, translation adapter, hidden legacy DOM, dual old/new path, feature-flagged superseded topology or CSS shim;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.
- IA26 exact-candidate rendered evidence is exhaustive and scope-valid; the Actions artifact is bound to the reviewed candidate; the separate acceptance ledger records PASS with rationale for every required schema/information, UX/interaction and visual/UI dimension; zero unresolved discrepancy remains. Capture generation success alone is not acceptance. Required-absent generic composition, direct Review/Dialogue ownership and zero legacy/adapter paths are proven; no parent-SURF PASS hides a visibly nonconforming descendant.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock metadata and workflow metadata other than the explicitly signed `.github/workflows/ci.yml` SD20 verification change remain outside T1. The pre-signoff campaign/traceability sensor may change only before Approval; any such change must be included in the exact G5/G5A/R3 evidence package before sign-off and is never a T1 candidate edit.
