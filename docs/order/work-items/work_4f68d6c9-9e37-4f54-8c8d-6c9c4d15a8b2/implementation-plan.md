<!-- Order template: defect-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Phase-0 campaign conformance implementation plan

## Plan authority and basis

This PLAN consumes the confirmed G-F06/G-F07/G-F08 requirements and DESIGN only.

The necessary permanent verification-material correction has already been applied **pre-signoff** at the existing canonical fitness owner because `tests/architecture.test.ts` is selected as PLAN/R3 `VERIFICATION_MATERIAL`; a signed task whose Approval binds that file may not mutate it. The exact corrected sensor blob at plan construction is `e68b94addd51ad58fc3e1a77367cf8a2a24da603`.

The post-signoff execution task therefore authorizes no repository mutation. Its sole executable objective is to use the canonical V1 `ALREADY_SATISFIED` path to independently prove that the approved baseline already contains the complete correction. If the baseline does not satisfy the requirements, execution must return upstream; it may not edit the frozen verification material.

Plan-construction repository baseline: `907d8fd896a0fb12e7bf381c21a5b62be6e86b58`.

## Task topology

One task exists because Change/Defect completion after sign-off is represented through the normal execution model. It is independently executable from the Approval baseline and has no dependency.

### Task T1 — prove the Phase-0 correction is already satisfied

**Objective:** inspect the exact approved baseline and return `TASK_ALREADY_SATISFIED` only if G-F06/G-F07/G-F08 are already realized by the bound permanent campaign/architecture fitness material with zero workspace diff.

**Dependencies:** none.

**Expected execution action:**
1. V0 validates the exact Approval/package/task.
2. V1 inspects the fresh baseline and the resolved governance/verification material.
3. If G-F06/G-F07/G-F08 are all already satisfied and the workspace changed-path set is empty, emit the canonical explicit `TASK_ALREADY_SATISFIED` result.
4. Otherwise do not mutate the repository; block/return to the owning pre-signoff layer.

**Architecture-feedback checkpoints:** none. No implementation edit is authorized.

## Requirement/design traceability

| Requirement | Exact realization/evidence |
|---|---|
| G-F06 single campaign-state ownership enforcement | pre-signoff corrected `tests/architecture.test.ts` scans active campaign WorkItem siblings for competing current G0-G6 projections |
| G-F07 pair-audit/gate progression enforcement | pre-signoff corrected sensor parses A01-A11 pair state, current audit records, exact evidence requirements, predecessor ordering and G2-G5 gate coupling |
| G-F08 stable-P3 R2 disposition completeness | pre-signoff corrected sensor derives current stable P3 IDs and, when G3 is PASS, requires exact main-campaign disposition-set coverage while retaining P3 owner legality |
| Signed execution | T1 proves the correction is already present; it does not reproduce the correction inside a mutable candidate |

Every task action traces upward to the three accepted foundation requirements. No requirement is delegated to the post-signoff worker.

## Module ownership and decomposition constraints

No production or verification module may be changed by T1.

The permanent sensor remains owned by `tests/architecture.test.ts`. No parallel checker, registry, state model, DTO, service, repository, controller or helper subsystem is authorized.

## Expected production and validation surface

### Post-signoff production/change surface

NONE.

### Pre-signoff correction already in approved baseline

- `tests/architecture.test.ts` — exact permanent sensor correction; immutable under the later Approval.
- `CHANGELOG.md` — repository-delivery record; already present in baseline.

### Verification

The signed task declares the complete concern-required gate union so task-definition validation remains exact:

- dependency-lock;
- typecheck;
- architecture;
- test;
- build;
- browser.

The expected successful execution path terminates at V1 as `ALREADY_SATISFIED`; later gates are not fabricated as having executed when V1 validly proves no implementation is required.

## Required deletions/replacements

NONE during post-signoff execution.

The invalid behavior being replaced is the former sensor interpretation itself; that correction is already part of the frozen baseline and must not be re-edited by T1.

## Completion evidence

T1 is complete only when:

- Approval is current;
- V1 independently proves the G-F06/G-F07/G-F08 outcome already exists in the approved baseline;
- BUILDER explicitly emits `TASK_ALREADY_SATISFIED`;
- coordinator independently proves the workspace changed-path set is empty;
- the task terminalizes `ALREADY_SATISFIED`.

A zero diff without the explicit semantic result is not success.

## Minimum-change forecast

Post-signoff repository changes expected: **zero**.

This is not a workaround around task scope. The only required physical correction is verification material that canonical Approval immutability prohibits the signed task from changing. It is therefore deliberately corrected and verified before sign-off.

Any discovered need for a production/runtime/P1-P6 semantic change, another verification owner, dependency, configuration, API, persistence or state change returns to DESIGN/PLAN.

## Verification contract

The package proves:

1. the three reproduced foundation failure classes are rejected by the corrected permanent sensor;
2. existing campaign/architecture checks remain intact;
3. the reopened main campaign remains a legal non-PASS state;
4. verification material is immutable after Approval;
5. the execution task introduces no candidate diff and therefore no unauthorized change or bloat.

The exact PR verification run on the final pre-signoff package is delivery/provenance evidence in addition to, not a substitute for, R3 semantic review.

## Open questions

NONE.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Prove at canonical V1 that the approved baseline already contains the complete G-F06/G-F07/G-F08 permanent campaign-conformance correction; emit TASK_ALREADY_SATISFIED only with an independently proven zero-diff workspace, and perform no repository mutation.",
      "dependsOn": [],
      "scope": [],
      "exclusions": [],
      "acceptanceRefs": [
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2"
      ],
      "changeSurface": [],
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
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": [
        "foundation",
        "verification"
      ]
    }
  ]
}
```
