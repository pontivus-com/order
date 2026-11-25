# A05 — Requirements and DESIGN authority mutation

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C07 + C08.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `62b0500b961e2b35f8fecfe6aa478e6517216bf8`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `C07-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C07-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **1**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C07-01` | C07-F01 | `SD09` | `IA03` | — | R2 can propose/adopt validated current P2/P3 canonical-owner amendments through the one proposal mechanism. |
| `PL-C08-01` | C08-F01 | `SD09` | `IA03` | — | DESIGN can propose/adopt validated current P4/P5/P6 canonical-owner amendments through the same mechanism. |

Package atoms in phase: **2**.

## Cross-domain presentation reconstruction dependency

Requirements and Solution design retain their authority/proposal semantics. IA30 fresh-authors the non-Proposal productive-stage presentation against corrected SD24: the governed document is primary without generic workflow summary/material-selector chrome or duplicate outer headings; Dialogue/Evidence replace the primary interaction when canonically selected. Proposal selection remains routed but its `ProposalReview` composition is cut over in IA31 together with every WorkbenchReview consumer, because the Review API cannot change compile-safely in an earlier phase. Existing runtime composition is failure evidence only and supplies no compatibility/preservation target.

## Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the single non-Proposal productive-stage definition in `12-action-catalog.md`.
- **IA31** — consume the single atomic Proposal/Readiness/Approval Review-cutover definition in `12-action-catalog.md`.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
