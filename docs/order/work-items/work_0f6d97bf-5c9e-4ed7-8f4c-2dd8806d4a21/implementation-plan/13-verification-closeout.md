# 0.6.0 verification and closeout contract

This component allocates proof inside the one signed T1. It does not create another validation model.

## Architecture-feedback checkpoints

Preflight IA07 re-proves the exact DESIGN-required Approval/checkpoint realization from current evidence; no T1 candidate byte is relied upon to create this capability and current implementation does not define the requirement.

Before the first implementation wave, the execution harness must already provide the exact Playwright-owned Chromium runtime required by P6. The BUILDER must then request the signed `dependency-lock` gate as bootstrap checkpoint `P`; the coordinator executes exact `bun ci` in the fresh isolated builder workspace and `P` must `GATE_PASSED` before Wave 1. This is verification-environment preparation through existing project gate ownership, not provider shell access and not a new dependency state model.

| Checkpoint | After execution wave | Required coordinator evidence |
|---|---|---|
| P | Before Wave 1 | signed `dependency-lock` checkpoint -> `GATE_PASSED` before any implementation edit/architecture checkpoint |
| A | Wave 1 IA01-IA04 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 2 |
| B | Wave 2 IA05-IA06 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 3 |
| C | Wave 3 IA09-IA13 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 4 |
| D | Wave 4 IA14-IA19 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 5 |
| E | Wave 5 IA25 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 6 |
| F | Wave 6 IA20-IA23 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 7 rendered acceptance |

Each checkpoint is requested by BUILDER as the terminal action of that provider turn and is executed by the coordinator in the same Run/provider session. Bootstrap checkpoint P exists only to make the fresh workspace capable of running the signed verification commands; checkpoints A-F remain architecture-feedback checkpoints. A failed checkpoint permits only correction inside the already signed design/scope or an explicit execution block; it does not grant provider shell/execute or authorize redesign. Checkpoints never substitute for final V3/V5/V7 or the task's complete logical gate union.

## Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the authority-defined remainder still conforms; do not infer a preservation target from current implementation.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

A01 corrected-upstream no-code rows `A01-NC01`-`A01-NC05` are also binding proof instructions: verify their exact canonical authority identities and stated R1 semantic propositions under V4, authorize no T1 production mutation for those corrections, and return upstream if any authority/evidence contradiction is found.

## Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA26 owns the terminal exact-candidate rendered UX/UI acceptance evidence and review. IA24 runs the final validation contract only after IA26 PASS.

SD20 exact-pin OpenCode proof is a mandatory IA23 precondition to IA26 and IA24: permanent PR verification must execute the actual supported OpenCode 2.2.6 process through Order's production OpenCode boundary while deterministic model output is supplied by the exact isolated simulation tooling authorized by SD20. A fake OpenCode executable, a removed temporary workflow, or a simulated response path that does not launch the exact supported OpenCode process cannot satisfy this proposition. The evidence must state the simulation boundary and must not be reused as proof of remote provider availability, Console OAuth/account connectivity or model quality.

### Pre-Approval structural-sensor correction

Current `tests/architecture.test.ts` is stale against the corrected package: its permanent PLAN fitness check still requires exactly 28 signed `changeSurface` paths even though current DESIGN/PLAN now require 30. This is a pre-signoff verification-material defect, not T1 implementation surface.

Before G5/G5A/R3 may return to PASS, correct the existing architecture sensor so it validates the corrected DESIGN/PLAN task-local forecast union without creating a second package registry. The sensor must prove uniqueness plus exact set equality between DESIGN forecast and the union of signed task `changeSurface` entries; it must not preserve historical literal path counts as authority. It must structurally require the exact IA01-IA34 catalog, enforce one definition per IA, and recognize IA27-IA34 as the presentation reconstruction owners plus IA23/IA26/IA24 as cross-solution/rendered-acceptance/final actions. This is campaign/package-fitness repair only: it does not move `tests/architecture.test.ts` into signed implementation tasks. Re-run architecture and root/modular compilation checks on the corrected package before G5 may return to PASS.

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

## Rendered 0.6.0 UX/UI acceptance

The exact PR merge candidate must pass a dedicated GitHub Actions rendered-acceptance step before IA24 closeout. This step uses the existing Playwright production Workbench harness and the reviewed derived SVG pack at `docs/references/workbench-ui/README.md`; it does not create a second visual specification.

### Evidence generation contract

GitHub Actions must:

1. execute only after dependency-lock, typecheck, architecture, test, build and the ordinary browser suite have passed;
2. run the IA26 capture cases in `tests/browser.spec.ts` against the exact checked-out PR merge candidate;
3. capture actual PNG output for every IA26-required workflow/surface/state/view/theme row;
4. generate a machine-readable manifest and human-readable index containing the exact candidate SHA and, for every capture, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, route/selection, current authority refs and corresponding `docs/references/workbench-ui/*.svg` reference;
5. prove exhaustive one-to-one coverage against the complete audited `SURF-*` table, nine workflow-step reference set, work-type variants and materially distinct state/reference sheets in `docs/references/workbench-ui/README.md`;
6. fail on missing/duplicate mappings, unreachable declared state, uncaught browser/runtime errors, missing/empty captures, or incomplete manifest/index;
7. upload the actual captures plus manifest/index as one PR-run artifact using `actions/upload-artifact` pinned to commit `ea165f8d65b6e75b540449e92b4886f43607fa02` (the current `v4` ref at PLAN correction time), with artifact identity including the exact checked-out candidate SHA.

The capture harness may add deterministic fixture setup and screenshot calls inside the signed `tests/browser.spec.ts` verification owner. The CI mutation remains inside the signed `.github/workflows/ci.yml` owner. Rendered acceptance is carried by its own verification task and does not authorize presentation changes.

### Acceptance review contract

The GitHub Actions artifact is then reviewed row by row against current authority and the paired SVG reference. The SVG is derived 0.5.0 visual comparison material only; a current 0.6.0 authority difference wins and must be recorded as an intentional authority delta rather than forced into a pixel match.

Every manifest row records three independent verdicts:

- `schema_information`: all authority-required information is present with correct labels, grouping, hierarchy and prominence;
- `ux_interaction`: the correct interaction class, current-attention/action precedence, workflow/material navigation, recovery semantics and responsive composition are realized;
- `visual_ui`: rendered hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, clipping/wrapping, overlays and theme behavior materially conform.

Each dimension is `PASS` or `FAIL`; no `PARTIAL`, aggregate-only pass or unreviewed row may reach IA24. An unexplained material divergence from the SVG/reference composition is `FAIL`. A divergence required by newer current authority is `PASS` only when the exact superseding authority is recorded.

Any failed row blocks closeout, opens remediation at the defective implementation/authority owner, and requires a fresh exact-candidate GitHub Actions capture and review for the affected row after correction. Existing semantic/browser tests remain mandatory and cannot be replaced by screenshot acceptance.


## V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their exact current R1 evidence and DESIGN disposition;
- all 25 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- each signed task retains its exact `changeSurface`; the union remains the cumulative immutable forecast;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- bootstrap `dependency-lock` checkpoint P passed before Wave 1 and all six required architecture checkpoints A-F were coordinator-executed and passed before the next wave;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.
- IA26 exact-candidate rendered acceptance evidence is exhaustive, the GitHub Actions artifact identity is bound to the reviewed candidate, and every required schema/information, UX/interaction and visual/UI verdict is PASS with no unresolved rendered discrepancy.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock metadata and workflow metadata other than the explicitly signed `.github/workflows/ci.yml` SD20 verification change remain outside T1. The pre-signoff campaign/traceability sensor may change only before Approval; any such change must be included in the exact G5/G5A/R3 evidence package before sign-off and is never a T1 candidate edit.
