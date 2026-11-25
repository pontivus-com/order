# Functional-pyramid conformance register

**WorkItem:** `work_2591ffb8-9b32-480c-9f70-e705aa0159d6`  
**Status:** ACTIVE — governance foundation and audit in progress  
**Canonicality:** This file is the **sole current-state owner for this WorkItem's conformance exercise**. It owns audit-stream status, finding status, evidence pointers, dispositions and closure evidence only. Permanent normative semantics remain at their `GW-*` canonical owners.

## 1. Control rules

1. Report current exercise state only from the registers in this file.
2. Historical narrative, commits, PR descriptions and prior model output are evidence, not current-state owners.
3. A finding is not closed by moving its symptom. Closure requires correction or explicit conformance proof at the finding's canonical owner.
4. A newly discovered material product/architecture/contract/implementation defect outside the exact authorized remediation surface is routed to the appropriate governed WorkItem/plan.
5. Current code/tests are evidence only and never define the desired baseline.
6. A change to an audited canonical owner or affected implementation surface after evidence was recorded sets the relevant finding/stream to `REVALIDATION_REQUIRED`.
7. PR #83 is a separate campaign branch. Its changes are not present on this branch unless reconciled by Git; its eventual merged bytes must be re-audited where they overlap.

## 2. Audit-stream register

| Stream | Scope | State | Current basis / next action |
|---|---|---|---|
| C01 | Pyramid principle completion | IN_PROGRESS | R1/R2/DESIGN closed in this WorkItem; apply the bounded P0/P1 clarification at `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, then re-audit after branch reconciliation. |
| C02 | Canonical corpus placement/derivation | NOT_STARTED | Audit every current P1-P6 canonical owner for placement, restatement, upstream justification, duplicate owner and unresolved owner/reference. |
| C03 | Semantic lifecycle closure | NOT_STARTED | Audit material semantic facts across core/daemon/shell/UI for authorized producer→projection→decision/consumer→presentation/mutation paths and noninterference. |
| C04 | Owner-level remediation disposition | BLOCKED | Opens only from confirmed C02/C03 findings. Unknown remediation scope is not pre-authorized. |
| C05 | Permanent conformance proof | BLOCKED | Define exact fitness/regression proof only after each mechanically checkable finding has a canonical owner and corrected design. |
| C06 | Bottom-up closure | BLOCKED | Requires C01-C05 complete and exact-final-head revalidation. |

## 3. Initial finding register

| Finding | Stream | State | Layer / canonical owner | Evidence | Required disposition |
|---|---|---|---|---|---|
| FP-F01 | C01 | OPEN | P0 — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | Current §2 defines P0-P8 and says higher layers constrain lower, but no single proposition-level placement/derivation law closes correct placement, downward derivation and upstream return. Span `requirements-pyramid.md` demonstrates the missing discipline as comparative evidence. | Add the Order-owned placement/authority/derivation law without changing P0-P8. |
| FP-F02 | C01 | OPEN | P1 — `GW-P1-CANONICAL-OWNERSHIP` + `GW-P1-EXPLICIT-FLOW`, owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | Existing P1 text owns semantic owner/mutation path and visible dependencies, but does not expressly prohibit semantic use based only on carrier/field availability or close producer→consumer/presentation lifecycle meaning. | Strengthen the existing P1 meanings; do not create a duplicate default rule. |
| FP-F03 | C05 | OPEN | P4/P8 proof — current architecture/certification owners to be resolved by C02/C03 | Existing architecture fitness proves module/import/owner constraints, but those checks alone do not prove field-level noninterference for a consumer that legitimately imports a broad canonical carrier. | Audit exact boundaries; where risk is real and mechanically testable, add positive + negative/noninterference proof at the existing test owner. |
| FP-D01 | Dependency | REVALIDATION_REQUIRED | `docs/governance/systems-governance.md` | PR #83 independently changes this canonical file for the 0.6.0 campaign. This branch begins from `master` and must not infer those bytes. | Reconcile/re-audit the exact final candidate before C01/C06 closure. |

## 4. Canonical corpus inventory

This is an audit inventory, not a replacement authority map. Canonical identity continues to resolve through `pontivus-order.toml [refs]`.

| Order layer | Material current owners to audit | C02 state |
|---|---|---|
| P1 | `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, `GW-DOC-MINIMUM-CHANGE-V1`, `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`, agent operating consequences where applicable | PENDING |
| P2 | `GW-DOC-SYSTEM-BRIEF-V1`, `GW-DOC-PRODUCT-IDENTITY-V1` | PENDING |
| P3 | `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-SPECIFICATION-STANDARD-V2`, `GW-DOC-VALIDATION-STANDARD-V1`, `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V2`, WorkItem/Workbench/installation functional owners | PENDING |
| P4 | `GW-DOC-TECHNICAL-ARCHITECTURE-V2`, execution/OpenCode/Workbench/theme architecture and current external-fact constraints where consumed | PENDING |
| P5 | `GW-DOC-TECHNICAL-DECISIONS-V1` | PENDING |
| P6 | `GW-DOC-CANONICAL-CONTRACTS-V2` | PENDING |

P7/P8 are audited in C06 against the applicable current WorkItem/task and implementation evidence rather than treated as permanent canonical authority.

## 5. C02 finding shape

Every C02 finding must record:

- stable finding id;
- exact canonical source and proposition;
- current assigned layer;
- correct owning layer;
- governing higher authority;
- defect class: `MISPLACED_AUTHORITY | RESTATEMENT | MISSING_DERIVATION | DUPLICATE_OWNER | UNRESOLVED_OWNER | CONTRADICTION`;
- downstream affected owners/surfaces;
- required owner-level disposition;
- state: `OPEN | ROUTED | CORRECTED | REVALIDATION_REQUIRED | CLOSED`;
- closure evidence.

## 6. C03 semantic-lifecycle finding shape

Every C03 finding must record:

- stable finding id;
- canonical semantic fact/carrier;
- canonical meaning owner;
- producer;
- transformation/projection owner(s);
- lifecycle decision/consumer owner(s);
- presentation owner/location where applicable;
- mutation/terminal owner where applicable;
- unauthorized or unresolved influence;
- affected surface(s);
- authority that proves the permitted use;
- required correction owner;
- required noninterference/regression proof;
- state and closure evidence.

The audit does **not** require every canonical field to have a UI presentation. A valid result may be technical-only, diagnostic-only, conditionally promoted, or never presented. The requirement is explicit authorization for every material use that exists.

## 7. Priority C03 domains

Audit in this order because they cross multiple semantic/lifecycle boundaries:

1. WorkItem lifecycle/status/outcome and derived workflow presentation;
2. R3 readiness and return ownership;
3. Approval/currentness/package identity;
4. ExecutionTask/Run/RunEvent execution and validation meaning;
5. project/repository/configuration/readiness state;
6. OpenCode account/authentication/mutation-blocker state;
7. proposal/review/dialogue state;
8. terminal result/evidence/material maturity;
9. Workbench application/global versus feature-local information presentation;
10. responsive representations, proving movement/recomposition does not change semantic ownership.

## 8. Closure criteria

C06 may become COMPLETE only when:

- C01 is CLOSED on the exact final canonical bytes;
- every C02 inventory row is audited and every finding is CLOSED or separately ROUTED with an explicit governed owner that is not falsely represented as this WorkItem's completion;
- every priority C03 domain is audited;
- every finding resolved inside this WorkItem has required owner-level correction and verification;
- required architecture/certification/noninterference proof is green on the exact candidate;
- no audit-created shadow specification or duplicate semantic owner exists;
- no Span runtime/configuration/dependency was added;
- PR #83 overlap has been reconciled and affected evidence re-established.
