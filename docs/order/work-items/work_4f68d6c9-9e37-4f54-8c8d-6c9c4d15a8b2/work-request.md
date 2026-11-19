---
{
  "formatVersion": 1,
  "id": "work_4f68d6c9-9e37-4f54-8c8d-6c9c4d15a8b2",
  "projectId": "order",
  "concernIds": [
    "foundation",
    "verification"
  ],
  "schemaId": "defect-v2"
}
---
# Close 0.6.0 campaign gate-conformance blind spots

## Observed behavior

At 0.6.0 campaign audit baseline `75e1de8a0fe5c1e63806a535257f3ba2bd5fe0a1`, every campaign gate G0-G6 was recorded PASS and R3 returned `READY_FOR_SIGNOFF`, while three mechanically checkable governance failures remained:

1. subordinate campaign/lifecycle evidence documents could project current G0-G6 state even though campaign §18 is the sole owner;
2. the §8.4 pair-audit register could record PASS without the mandatory pair-audit evidence records existing;
3. v2 R2 hygiene checked the P3 layer of declared REFERENCE/DELTA owners but did not prove complete stable-P3 requirement disposition coverage.

The concrete consequence was false progression: R2-A01-A11 and DESIGN-A01-A11 were recorded PASS despite zero required `PAIR AUDIT START/END` records, and G3-G6 advanced from those unsupported states.

## Expected behavior

The permanent repository fitness owner must fail closed on all three conditions.

- Current campaign gate state is projected only by the campaign's designated register; subordinate WorkItem/campaign evidence may describe historical evidence but must not declare competing current gate state.
- A pair-table PASS is legal only when the exact corresponding audit record exists, is bound to exact current evidence, contains the mandated detailed checks and ends PASS. Gate PASS is legal only when all required pair states for that phase are PASS.
- When this 0.6.0 campaign's R2 gate is eligible to PASS, the R2 disposition ledger must cover the complete current stable P3 requirement-ID set exactly and preserve the existing owner-layer legality check. Normative P3 clauses without stable IDs remain semantic pair-audit obligations rather than being falsely reduced to identifier counting.

The correction must strengthen the existing permanent fitness owner. It must not weaken a gate, create a parallel campaign-state registry, create a second R2 representation, or make current implementation/history into desired authority.

## Reproduction/evidence

- `tests/architecture.test.ts` single-owned campaign-state test reads the campaign plan and only uses the coverage ledger to verify the G0 baseline SHA; it does not scan the other active WorkItem Markdown files for competing gate-state projections.
- the same test parses §7 and §18 but has no parser or invariant for §8.4 pair-audit status/records;
- the v2 WorkItem hygiene test validates rows that are present in `requirements.md`, including P3 owner membership, but has no expected-set comparison against stable P3 requirement IDs;
- `0.6.0-design-campaign-plan.md` at the audit baseline contains R2/DESIGN pair PASS tables but no R2/DESIGN `PAIR AUDIT START/END` records;
- `requirements.md` uses 22 concern-level rows rather than an exhaustive stable-P3 disposition set.

## Behavior that must remain unchanged

- §7 remains the only C01-C22 current-state owner and §18 remains the only G0-G6 current-state owner.
- the campaign's authority-driven rule remains controlling; implementation/UI/tests/history are evidence only.
- G0 ancestry, OPEN_FOUNDATION, concern-state and gate-order checks remain intact.
- existing v2 owner-layer legality checks remain intact.
- P1-P8 ownership, WorkItem lifecycle, Approval, execution, provider and product behavior are unchanged.
- `tests/architecture.test.ts` remains permanent verification material after the pre-signoff correction.
- no runtime/product dependency, API, persistence, state, DTO/model/service/repository/controller or UI change is introduced.

## Impact/context

This is a Phase-0 foundation defect discovered by the post-G6 adversarial audit of WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. That campaign is already reopened: G0 is BLOCKED and all downstream closure is invalidated until this correction is integrated and reverified.

Because PLAN/R3 context automatically binds verification `materialRefs` and signed tasks may not mutate material in their Approval closure, the architecture sensor itself must be corrected **before any Approval** for this remediation. The corrected sensor then becomes immutable material for subsequent readiness/sign-off.
