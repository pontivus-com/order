# A06 — PLAN contract and R3 readiness

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C09 + C10.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O01`, `C10-O09`, `C10-O10` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `DEPENDENCY_DELTA` | `SD12` | — | `IA17` | Consume IA17 exact reach; IA16/IA31 prove admitted return history and exact upstream owner/reason. Proof: tests/core.test.ts; tests/daemon.test.ts; tests/workbench-presentation.test.ts; tests/browser.spec.ts; tests/e2e-server.ts fixture provenance + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD11` | `IA16`, `IA31` | — | Bind typed R3 verdict to exact conformed Run/output and currentness; reject unadmitted completion and competing artifact; correct attention ownership through SD07/SD11. Proof: tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **3**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C09-01` | C09-F01 | `SD10` | `IA05` | — | Current-v2 Change/Defect task packages must satisfy P6 §37.4 mechanical non-vacuity through the one schema-aware admission owner while published v1 validation semantics remain unchanged; material task sufficiency remains owned by PLAN semantic conformance and independent R3. |
| `PL-C10-01` | C10-F01 | `SD11`, `SD25` | `IA16`, `IA31` | — | Readiness dominant verdict is the human projection of typed coordinator-conformed R3 outcome bound to exact Run/output; findings/return owner are mapped once into direct Review, supporting package/history is subordinate, and no generic workflow frame/selector or raw typed enum is ordinary UI. |

Package atoms in phase: **2**.

## Referenced actions

- **IA17** — consume the single SD12 definition in `12-action-catalog.md`; this phase owns no second reach selector.

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA05** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the single IA30 definition in `12-action-catalog.md`.
- **IA31** — consume the single IA31 definition in `12-action-catalog.md`.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


## Realization trace consequence

IA30 consumes PLAN R1/R2/DESIGN/source/evidence and derived parsed task/change-surface inspection; IA05 task admission. IA16/31 own R3 typed outcome, findings and recovery/return with no additional gate.

## Native Acceptance integration

QA integration: IA35/IA37 route stale or invalid signed package to exact existing owner; IA39 proves no acceptance when missing/corrupt evidence, or stale Approval; fresh R3 and exact sign-off after return. T1 cannot be signed until the protected architecture/package sensor and exact forecast/reference/proof bindings are independently closed.
