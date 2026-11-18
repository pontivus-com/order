# 0.6.0 verification and closeout contract

This file owns the detailed verification allocation inside the single P7 task. It does not create a second validation model; all semantics remain owned by `GW-DOC-VALIDATION-STANDARD-V1`, project gate bindings and canonical contracts.

## Architecture-feedback checkpoints

| Checkpoint | After | Required gates/evidence |
|---|---|---|
| A | IA01-IA04 | typecheck, architecture, relevant core/daemon tests |
| B | IA05-IA08 | typecheck, architecture, task/Approval/checkpoint core+daemon tests |
| C | IA09-IA12 | typecheck, architecture, source/queue daemon+browser tests |
| D | IA13-IA19 | typecheck, architecture, Workbench/browser/presentation tests |
| E | IA20-IA23 | typecheck, architecture, full test, build, browser |

A checkpoint is feedback inside T1 and never substitutes for V3/V5/V7.

## Requirement-level verification law

For every row in phase files 01-11:

- a CHANGE disposition is proven by its IA-specific positive assertion, at least one negative assertion and the applicable checkpoint/final gates;
- a NO_CODE disposition is revalidated under V1/V4/V5/V6 and the final six-gate union; if current evidence disproves the positive no-change proof, execution stops and returns to DESIGN/PLAN;
- tests prove authority-derived behavior and may not preserve incidental 0.5.0 behavior.

## Test-owner allocation

| Action family | Primary verification owners |
|---|---|
| IA01-IA05 | tests/core.test.ts, tests/daemon.test.ts |
| IA06-IA10 | tests/core.test.ts, tests/daemon.test.ts |
| IA11-IA19 | tests/browser.spec.ts, tests/workbench-presentation.test.ts, targeted daemon/core tests where canonical ingress applies |
| IA20 | tests/certification.test.ts |
| IA21-IA22 | tests/browser.spec.ts, tests/workbench-presentation.test.ts |
| IA23 | all existing targeted suites above |
| IA24 | complete logical gate union + V0-V7 |

## Final gate union

- dependency-lock
- typecheck
- architecture
- test
- build
- browser

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock/workflow metadata and other signed authority/verification material remain outside T1's implementation surface.

## Final semantic review

V4/V5/V6 must explicitly verify:

- FCIS and pure/core versus daemon/shell/UI boundaries;
- SoC and cohesive module responsibility;
- DRY/canonical ownership;
- strict typing;
- no OOP/DTO/service/repository/controller/shadow-model family;
- no hidden fallback/compatibility path;
- exact signed surface and no unrelated cleanup;
- no implementation-derived product semantics;
- every phase row still traces R2 -> DESIGN -> IA/no-code -> proof;
- no phase file or action introduces a material decision not present in signed DESIGN.

Any failure requiring a P1-P6 semantic choice is BLOCKED_SPEC_OR_DESIGN / upstream return, not an implementation repair.
