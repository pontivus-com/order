# 0.6.0 verification and closeout contract

This component allocates proof inside the one signed T1. It does not create another validation model.

## Architecture-feedback checkpoints

Preflight IA07 re-proves the exact DESIGN-required Approval/checkpoint realization from current evidence; no T1 candidate byte is relied upon to create this capability and current implementation does not define the requirement.

| Checkpoint | After execution wave | Required coordinator evidence |
|---|---|---|
| A | Wave 1 IA01-IA04 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 2 |
| B | Wave 2 IA05-IA06 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 3 |
| C | Wave 3 IA09-IA13 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 4 |
| D | Wave 4 IA14-IA19 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 5 |
| E | Wave 5 IA25 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 6 |
| F | Wave 6 IA20-IA23 | signed `architecture` checkpoint -> `GATE_PASSED` before Wave 7 closeout |

Each checkpoint is requested by BUILDER as the terminal action of that provider turn and is executed by the coordinator in the same Run/provider session. A failed checkpoint permits only correction inside the already signed design/scope or an explicit execution block; it does not grant provider shell/execute or authorize redesign. Checkpoints are architecture feedback only and never substitute for final V3/V5/V7 or the task's complete logical gate union.

## Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the authority-defined remainder still conforms; do not infer a preservation target from current implementation.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

A01 corrected-upstream no-code rows `A01-NC01`-`A01-NC05` are also binding proof instructions: verify their exact canonical authority identities and stated R1 semantic propositions under V4, authorize no T1 production mutation for those corrections, and return upstream if any authority/evidence contradiction is found.

## Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA24 runs the final validation contract.

## Final logical gate union

- dependency-lock
- typecheck
- architecture
- test
- build
- browser

## V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their exact current R1 evidence and DESIGN disposition;
- all 25 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- the signed 28-path `changeSurface` remains the immutable forecast;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- all required intermediate architecture checkpoints were coordinator-executed and passed before the next wave;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock/workflow metadata remain outside T1. The pre-signoff campaign/traceability sensor may change only before Approval; any such change must be included in the exact G5/G5A/R3 evidence package before sign-off and is never a T1 candidate edit.
