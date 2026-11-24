# A06 — PLAN contract and R3 readiness

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C09 + C10.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `e1e53c493f405610f6f73d3e8b83084b91e7db9e`; current DESIGN `469539382fe3d86f98eff8b760437a642f367afd`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O01`, `C10-O09`, `C10-O10` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O04`, `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `TECHNICAL_DELTA` | `SD11`, `SD25` | `IA16`, `IA31` | — | Typed R3 outcome drives one human verdict inside direct Review. IA31 maps actual findings/return owner into the Review body, does not embed the full R3 Markdown document under Findings, does not duplicate Readiness/verdict headings, print raw `READY_FOR_SIGNOFF`, or expose a generic Readiness-material selector; REQUIRED_INPUT Dialogue replaces Review for that turn. |

Stable rows in phase: **3**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C09-01` | C09-F01 | `SD10` | `IA05` | — | Current-v2 Change/Defect task packages must satisfy P6 §37.4 mechanical non-vacuity through the one schema-aware admission owner while published v1 validation semantics remain unchanged; material task sufficiency remains owned by PLAN semantic conformance and independent R3. |
| `PL-C10-01` | C10-F01 | `SD11`, `SD25` | `IA16`, `IA31` | — | Readiness dominant verdict is the human projection of typed R3 outcome; findings/return owner are mapped once into direct Review, supporting package/history is subordinate, and no generic workflow frame/selector or raw typed enum is ordinary UI. |

Package atoms in phase: **2**.

## Referenced actions

- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA05** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the direct Implementation-plan Document/Dialogue/Proposal composition; no generic workflow summary/material selector.
- **IA31** — consume fresh Readiness/Approval direct Review reconstruction, including non-duplicated R3 verdict/findings and required-input Dialogue replacement.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
