# 0.6.0 verification and closeout contract

This component allocates proof inside the one signed T1. It does not create another validation model.

## Architecture-feedback checkpoints

| Checkpoint | After execution wave | Required evidence |
|---|---|---|
| A | Wave 1 IA01-IA08 | typecheck + architecture + relevant core/daemon tests |
| B | Wave 2 IA09-IA13 | typecheck + architecture + source/queue/Git daemon/browser tests |
| C | Wave 3 IA14-IA19 | typecheck + architecture + Workbench/browser/presentation tests |
| D | Wave 4 IA25 | typecheck + architecture + installer test + order-migration test + build |
| E | Wave 5 IA20-IA23 | typecheck + architecture + full test + build + browser |

Checkpoints are feedback only and never substitute for final V3/V5/V7.

## Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the conforming remainder is unchanged.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

A01 corrected-upstream no-code rows `A01-NC01`-`A01-NC03` are also binding proof instructions: verify their exact canonical authority identities and stated R1 semantic propositions under V4, authorize no T1 production mutation for those corrections, and return upstream if any authority/evidence contradiction is found.

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
- all 112 stable rows retain their R1 evidence and DESIGN disposition;
- all 24 package atoms are satisfied;
- every positive no-change row remains true;
- exact 30-path signed surface, no extra path;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock/workflow metadata remain outside T1. Any pre-signoff G-F10 fitness-sensor correction changes verification material before Approval and forces downstream package revalidation.
