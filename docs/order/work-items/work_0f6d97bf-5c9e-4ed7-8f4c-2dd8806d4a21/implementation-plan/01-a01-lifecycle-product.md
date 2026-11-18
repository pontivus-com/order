# A01 — Lifecycle and product identity

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C01 + C21.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `ad6373785dd31447db9e46ee85f5bb3c7d45050c`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O03`, `C01-O05`, `C01-O08` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O01`, `C01-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O03`, `C01-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **5**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | `SD01` | `IA19` | — | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim. |

Package atoms in phase: **1**.

## Referenced actions

- **IA19** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
