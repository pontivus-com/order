# 0.6.0 verification and closeout contract

This component allocates proof across the one canonical T1 candidate and its ordered IA01-IA34 implementation/proof phases. It does not define implementation actions, component APIs or another task representation; those are owned by `12-action-catalog.md`, P4 and DESIGN respectively.

## In-task architecture and reconstruction checkpoints

This verification component declares no campaign gate or authorization state. Eligibility for signed execution or any bounded IA27/IA28 grant is governed only by the campaign register and the P0 bounded acceptance-evidence rule. A bounded grant is eligible only after current R3/G6 has returned `READY_FOR_SIGNOFF`; this file owns only the evidence/checkpoint requirements.


Preflight IA07 re-proves the existing coordinator-owned signed-checkpoint capability; no candidate byte is relied upon to create it.

Before T1 mutation begins, the execution harness provides the exact Playwright-owned Chromium runtime required by P6 and the BUILDER requests the signed `dependency-lock` gate. Exact `bun ci` must `GATE_PASSED`.

T1 carries the same six logical gate IDs through final validation. During the live BUILDER Run, coherent phase boundaries may request already-signed gates through SD13; those checkpoints provide feedback and continuation inside the same task/Run and never substitute for final V3/V5/V7.

| Completed phase | Before next phase | Required retained evidence |
|---|---|---|
| applicable IA01-IA25 non-UI work | IA27 | non-UI baseline proof; no protected execution-foundation mutation |
| bounded IA27 | IA28 | Compile-closed shell/Context proof is complete: Section/Facts exist, ContextPanel + WorkItemContext are atomically cut over, required-absent generic owners remain zero, shell/header/responsive/theme consumer allowlists pass, and IA27 SURF rows PASS. Review/Resource/Document/Result breaking APIs remain untouched. |
| IA28 | **HUMAN EVIDENCE ACCEPTANCE → HUMAN SIGN-OFF; then post-signoff IA27 completion** | Fresh Queue/Create/application-shell proof against the bounded IA27 candidate + actual production-browser captures independently PASS `schema_information`, `ux_interaction`, `visual_ui`, `component_ownership` and bounded-foundation realization. Current R3/G6 `READY_FOR_SIGNOFF` is the prerequisite for this tranche. The bounded grant terminates here. |
| post-signoff IA27 completion | IA29 | ResourceList is created, every current ResourceRow caller is migrated, ResourceRow is narrowed in the same typecheck-clean checkpoint, and no superseded Row API consumer remains. |
| IA29 | IA30 | WorkbenchDocument/Facts/Section composition proof; required repository/document/Git supporting facts visible; no screen-local document-facts/aside grammar, generic workflow chrome, duplicate heading or technical leakage; all IA29 rows PASS. |
| IA30 | IA31 | direct Document/Dialogue/Evidence/State resolution for productive stages excluding Proposal Review; continuous Dialogue semantics; all IA30-owned rows PASS; Proposal Review remains unchanged/unaccepted. |
| IA31 | IA32 | Proposal/Readiness/Approval atomically cut over the single WorkbenchReview API with ReviewVerdict + ReviewSections/Facts/ResourceList; Proposal uses DocumentChangeView with raw diff secondary; no local `order-review-*` structural grammar, whole-R3-under-Findings duplication, raw enum or selector; all IA31 rows PASS. |
| IA32 | IA33 | Implementation purge/rebuild proof + canonical MasterDetail/Section/Facts/ResourceList ownership + both IA32 rows PASS; no local recurring card/section/resource grammar. |
| IA33 | IA34 | Complete uses WorkbenchResult/Section/ResourceList and Evidence remains exact-byte owner; no local terminal/resource grammar; all IA33 rows PASS. |
| IA34 | IA20-IA23 integrated certification | Settings uses Section/Facts/ResourceList with one diagnostics owner; all eleven IA34 rows PASS; 37/37 IA27-IA34 SURF union complete. |
| IA20-IA23 | IA26 | complete semantic/component/theme/responsive/scenario/regression certification PASS |
| IA26 | IA24 | exhaustive exact-candidate **scope-valid** evidence artifact + separately reviewable per-row `schema_information` / `ux_interaction` / `visual_ui` PASS/FAIL ledger with rationale + zero unresolved FAIL |

These are **in-task phase boundaries**, not ExecutionTask dependencies. P6 does not promote candidate bytes between tasks; all phases mutate and inspect the same T1 candidate from the one Approval baseline. A phase advances only after its own coherent implementation and required proof are available. IA27 is not accepted/frozen merely by crossing into IA28; IA28 is the consumer-proven acceptance gate. After IA28 acceptance, a later phase discovering a foundation responsibility/semantic defect returns to IA27/DESIGN rather than patching the accepted foundation locally.

A failed in-task checkpoint permits only correction inside T1's signed semantic scope/accepted design or an explicit execution block. It does not grant provider shell/execute or authorize redesign. Checkpoints never substitute for V3/V5/V7 or T1's complete logical gate union.

## UI reconstruction evidence law

`12-action-catalog.md` is the single owner of IA27-IA34 mutation procedures and physical dispositions. Verification records evidence against those dispositions; it does not restate or reinterpret them.

For every affected physical owner, retained evidence records: canonical P4/SD/F6B authority; catalogued disposition; pre-mutation evidence where destructive/decompose work is required; exact resulting API/consumer set; removed obsolete selectors/owners; and the phase-local semantic/browser/rendered result. A final-looking screen is insufficient if a forbidden owner, compatibility API, duplicate semantic component responsibility or feature-local substitute grammar remains.

Bounded IA27 proof demonstrates only the catalogued compile-closed shell/Context dispositions. Post-signoff IA27 completion proves the all-caller ResourceRow/ResourceList cutover. IA29/IA31/IA33 prove Document/Review/Result breaking semantic-component cutovers with their complete consumer sets; IA28-IA34 prove the remaining catalogued renderer dispositions and owned SURF rows. Historical purge/RZ16 evidence may explain the defect but never satisfies the new proof.

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

## Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA26 has two distinct obligations: automated exact-candidate rendered evidence generation and explicit rendered acceptance review. A green Actions capture job proves evidence generation only and carries no automatic schema/UX/visual PASS. IA24 runs the final validation contract only after the separate row-level IA26 acceptance ledger is complete with zero FAIL.

SD20 exact-pin OpenCode proof is a mandatory IA23 precondition to IA26 and IA24: permanent PR verification must execute the actual supported OpenCode 2.2.6 process through Order's production OpenCode boundary while deterministic model output is supplied by the exact isolated simulation tooling authorized by SD20. A fake OpenCode executable, a removed temporary workflow, or a simulated response path that does not launch the exact supported OpenCode process cannot satisfy this proposition. The evidence must state the simulation boundary and must not be reused as proof of remote provider availability, Console OAuth/account connectivity or model quality.

### Pre-Approval structural-sensor correction

The permanent package sensor is pre-signoff campaign material, not signed implementation surface. Before G5/G5A/R3 may return to PASS it must validate the current **76-path** DESIGN forecast against the exact one-task PLAN `changeSurface`; exactly one task candidate with empty `dependsOn`; the seven required-new semantic primitives plus `DocumentChangeView`; the P4/F6B disposition set; one application-shell, WorkItem-shell, Context and structural-responsive owner; exact IA27-IA34 owner/SURF allocation; and zero duplicate/shadow IA definitions outside `12-action-catalog.md`. It derives the 37-surface universe directly from current `solution-design.md`; the derived reference manifest must match that universe but cannot define it.

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

## First rendered foundation acceptance — IA28

SD21/F6B's closed ledger plus IA27 implementation/disposition evidence, semantic checks, browser proof and `SURF-WI-001` render establish **foundation readiness**, not product acceptance. Foundation correctness must be demonstrated through a real consumer screen family.

IA28 is therefore the first acceptance test for the Workbench foundation. Before IA29 may begin, the exact IA28 candidate must produce actual browser-rendered evidence for `SURF-APP-001`, `SURF-QUEUE-001` and `SURF-CREATE-001`, covering the Queue/application shell, Queue states, application notices/readiness, Create WorkItem, linked remediation and active-account utility states required by the IA28 face ledger. This evidence is produced only after R3/G6 `READY_FOR_SIGNOFF` by the bounded phase-local lane above and is reviewed for the subsequent human evidence-acceptance/sign-off decision even when the ordinary browser suite remains red solely on explicitly later-phase obligations; such red results remain recorded blockers and cannot be reclassified as pass. The review uses current P3/P4/DESIGN/theme authority as normative truth and only authority-bound reference entries whose manifest pins those exact owners as derived visual comparison material.

The reviewer must record for every IA28 SURF row:

- `schema_information = PASS | FAIL`;
- `ux_interaction = PASS | FAIL`;
- `visual_ui = PASS | FAIL`.

The checkpoint must also record one **foundation-realization PASS/FAIL** covering the shared hierarchy, geometry, primitive composition, action/status treatment, typography/spacing/density, disclosure behavior, theme realization and responsive behavior actually visible in those screens. This is review evidence only; it is not a runtime schema or second design specification.

Failure routing is exact:

- recurring primitive/token/shell/hierarchy/disclosure/theme/responsive defect → IA27;
- Queue/Create/application-utility-local defect → IA28;
- missing, ambiguous or contradictory product/information/interaction classification → DESIGN;
- no IA29 advance while any IA28 row or foundation-realization verdict is FAIL/unreviewed.

Only this checkpoint accepts the bounded shell/Context foundation slice. It does not freeze Review/Resource/Document/Result APIs that have not yet cut over; each is frozen only after its consumer-atomic checkpoint. IA26 remains the separate final exhaustive 37-SURF exact-candidate acceptance and can still reopen any defective owner.

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

The capture harness may add deterministic fixture setup and screenshot calls inside the signed `tests/browser.spec.ts` verification owner. The CI mutation remains inside the signed `.github/workflows/ci.yml` owner. Rendered acceptance is carried by its own verification task and does not authorize presentation changes.

### Acceptance review contract

The GitHub Actions artifact is then reviewed row by row. Automated capture/coverage success is not a review verdict. Every review record is bound to the exact capture, governed scope and current authority and includes explicit rationale.

Every manifest row records three independent verdicts:

- `schema_information`: all authority-required Primary information is present with correct labels/grouping/hierarchy/prominence; generic workflow-state/material chrome and raw typed/technical vocabulary are absent from ordinary UI; singular Context/Settings-diagnostics/Evidence ownership and correct return behavior are preserved;
- `ux_interaction`: the direct owning interaction class is correct; required-absent WorkflowStepFrame/WorkflowMaterialSelector equivalents are absent; Dialogue remains continuous across OPEN/REQUIRED_INPUT/PROCESSING turns; Review/Evidence/Terminal primaries are not wrapped/nested; current-attention/action precedence, recovery and responsive composition conform;
- `visual_ui`: rendered hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, clipping/wrapping, overlays and theme behavior materially conform.

Each dimension is `PASS` or `FAIL`; no `PARTIAL`, aggregate-only pass or unreviewed row may reach IA24. An unexplained material divergence from the same-scope authority-bound reference composition is `FAIL`. A divergence required by newer current authority is `PASS` only when the exact superseding authority is recorded.

Any failed row blocks closeout, opens remediation at the defective implementation/authority owner, and requires a fresh exact-candidate GitHub Actions capture and review for the affected row after correction. Existing semantic/browser tests remain mandatory and cannot be replaced by screenshot acceptance.


## V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their exact current R1 evidence and DESIGN disposition;
- all 27 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- T1 retains the exact 76-path `changeSurface`, including the eight C19-F09 component/specialist paths; it remains the cumulative immutable forecast for the corrected package;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- bootstrap `dependency-lock` passed before T1 mutation; IA27 realized every catalogued REQUIRED_NEW/DECOMPOSE_REFACTOR/DESTRUCTIVE_REPLACEMENT/REQUIRED_ABSENT outcome and freshly proved any retained no-edit/bounded owner; IA28 freshly accepted the foundation in real consumers; IA29-IA34 completed their exact renderer dispositions and SURF proofs; IA20-IA23/IA26 proved global component ownership/SoC plus integrated/final acceptance before IA24;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner, deprecated prop/alias, translation adapter, hidden legacy DOM, dual old/new path, feature-flagged superseded topology or CSS shim;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.
- IA26 exact-candidate rendered evidence is exhaustive and scope-valid; the Actions artifact is bound to the reviewed candidate; the separate acceptance ledger records PASS with rationale for every required schema/information, UX/interaction and visual/UI dimension; zero unresolved discrepancy remains. Capture generation success alone is not acceptance. Required-absent generic composition, direct Review/Dialogue ownership and zero legacy/adapter paths are proven; no parent-SURF PASS hides a visibly nonconforming descendant.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock metadata and workflow metadata other than the explicitly signed `.github/workflows/ci.yml` SD20 verification change remain outside T1. The pre-signoff campaign/traceability sensor may change only before Approval; any such change must be included in the exact G5/G5A/R3 evidence package before sign-off and is never a T1 candidate edit.
