# 0.6.0 modular implementation-plan governance

This directory is the detailed phase decomposition of the **single** P7 plan package. The deterministic lifecycle artifact remains `../implementation-plan.md`; that root file carries the one canonical `order-tasks` block and an exact blob manifest for every phase file in this directory.

The directory does not create parallel plans. A phase file owns only the detailed traceability and implementation obligations delegated to it by the root PLAN. Campaign status remains owned only by `0.6.0-design-campaign-plan.md`.

## Closure law

The package is exhaustive only when:

```text
every R2 stable requirement
+ every package-local/non-stable R2 consequence
        -> exactly one or more DESIGN solution dispositions
        -> exact IA implementation action(s) OR positive NO_CODE disposition
        -> exact verification proof
```

The reverse direction must also hold: every IA action must trace to at least one accepted DESIGN solution and R2 obligation.

## Phase order

1. A01 lifecycle/product
2. A02 governance/intake
3. A03 queue/source
4. A04 Workbench/Research
5. A05 Requirements/DESIGN authority mutation
6. A06 PLAN/R3
7. A07 Approval/Execution
8. A08 Complete/materials
9. A09 Provider/Settings
10. A10 Recovery/accessibility
11. A11 component/certification
12. shared implementation-action catalog
13. shared verification/closeout contract

The ordering is an implementation feedback order inside cumulative task T1, not eleven independent ExecutionTasks.

## Architectural constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no-OOP/no-DTO, minimum change and authority-before-inference remain binding. No phase may invent another lifecycle/source/readiness/task/proposal/provider/theme/verification model.

Current implementation, tests, rendered UI, 0.5.0 and historical design remain evidence only. Reuse is permitted only where the current DESIGN has positively selected the existing canonical owner/capability.

## Stop conditions

Return to DESIGN/PLAN before implementation if execution requires a new semantic owner, public contract, state meaning, persistence/transport shape, dependency direction, external dependency, provider capability, verification authority, or behavior outside the signed package.
