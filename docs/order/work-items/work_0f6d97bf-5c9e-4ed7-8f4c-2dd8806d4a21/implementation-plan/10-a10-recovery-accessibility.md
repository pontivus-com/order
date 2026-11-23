# A10 — Recovery, current attention and accessibility

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C17 + C18.
**Upstream:** current R1 `8e30f4b998a8149f755f5611cfa4bb8443a89ae8`; current R2 `b636ea92154a327300ae2edd76ce3950f9d9e827`; current DESIGN `3aaeb0a9c5c513d534be9d74d02eed7068e89bcf`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O15`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O02`, `C17-O05`, `C17-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O04`, `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD29`, `SD30` | `IA27`-`IA34`, `IA26` | — | Preserve semantic continuity by revalidating/remediating the already-realized single foundation-owned responsive topology in IA27, revalidating IA28-IA31 consumers, then freshly reconstructing IA32-IA34 consumers; certify every domain with rendered responsive evidence. |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C18-01` | C18-F01 | `SD15` | `IA15` | — | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. |

Package atoms in phase: **1**.

## Referenced actions

- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the resumed IA27-IA31 revalidation/remediation owners followed by fresh IA32-IA34 reconstruction for responsive/accessibility realization; IA27 remains the single structural responsive owner and no later phase owns local layout policy.
- **IA26** — consume the exact-candidate responsive rendered acceptance owner.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
