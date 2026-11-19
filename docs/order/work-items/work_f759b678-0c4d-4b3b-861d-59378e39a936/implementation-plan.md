<!-- Order template: defect-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# A06 execution-foundation remediation implementation plan

## Plan authority and basis

Implement only the accepted F01/F02 foundation correction defined by current P4/P6 authority and this WorkItem's R1/R2/DESIGN. Do not modify the stale 0.6.0 product PLAN.

## Task topology

One cumulative task is sufficient because the event contract, pure admission, shell provider contract, daemon orchestration, exhaustive canonical-event presentation consumer and focused proof are one execution-control responsibility with no independently deliverable product behavior.

### Task T1 — realize the corrected execution-control baseline

**Objective:** implement forecast-vs-scope semantics and same-Run coordinator checkpoints exactly as designed.

**Execution order:**
1. extend the canonical RunEvent union and pure BUILDER checkpoint-turn admission;
2. expose the checkpoint tag only in BUILDER's shell-owned provider output contract;
3. correct V2 changed-path admission and checkpoint gate effect reuse;
4. implement same-Run/same-session BUILDER checkpoint continuation;
5. update V4/V6 minimum-change control so forecast variance is reviewed rather than auto-rejected;
6. close every typed canonical-event consumer, including the neutral Workbench presentation projection;
7. add exact core/daemon/presentation/certification proof;
8. run the full required gate union.

**Architecture-feedback checkpoints:** none are required inside this prerequisite task itself; this task establishes the checkpoint capability for later packages and must not self-bootstrap it.

## Exact signed implementation surface

- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/daemon/validation.ts`
- `src/daemon/execution.ts`
- `src/shell/opencode.ts`
- `ui/src/workbench-presentation.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/workbench-presentation.test.ts`
- `tests/certification.test.ts`

### Explicit exclusions

- `AGENTS.md`
- `pontivus-order.toml`
- P1-P6 authority documents;
- 0.6.0 campaign R1/R2/DESIGN/PLAN files;
- UI redesign, browser checkpoint policy/state, source behavior and unrelated shell behavior not required by F01/F02;
- dependencies and persistence schemas.

## Completion evidence

- F01 positive: in-scope path absent from forecast is admitted by V2.
- F01 negative: instruction/out-of-scope/excluded paths remain rejected.
- F01 semantic: reviewer receives forecast and actual paths and V6 no longer equates forecast variance with bloat.
- F02 positive: BUILDER signed checkpoint executes through coordinator and same provider session continues.
- F02 negative: STAGE/REVIEWER/REMEDIATOR, unsigned gate, multiple or non-terminal request are rejected.
- checkpoint pass/fail evidence is existing `GATE_PASSED`/`GATE_FAILED`; V3/V5/V7 remain independent.
- dependency-lock, typecheck, architecture, test, build and browser all pass on the exact PR head.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the already-governed A06 execution-foundation baseline: scope/exclusions remain the hard boundary while changeSurface is a reviewed forecast, and BUILDER may request a signed coordinator-owned gate checkpoint and continue the same Run/session without provider execute permission.",
      "dependsOn": [],
      "scope": [
        "src/core/**",
        "src/daemon/**",
        "src/shell/opencode.ts",
        "ui/src/workbench-presentation.ts",
        "tests/**"
      ],
      "exclusions": [
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-FR-003-DURABLE-BOUNDED-EXECUTION",
        "GW-FR-004-INDEPENDENT-VALIDATION",
        "GW-FR-006-MINIMUM-VERIFIED-CANDIDATE"
      ],
      "changeSurface": [
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/daemon/execution.ts",
        "src/daemon/validation.ts",
        "src/shell/opencode.ts",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/workbench-presentation.test.ts"
      ],
      "gateIds": [
        "architecture",
        "browser",
        "build",
        "dependency-lock",
        "test",
        "typecheck"
      ],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-MINIMUM-CHANGE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "shell",
        "ui",
        "verification"
      ]
    }
  ]
}
```

## Open questions

NONE.
