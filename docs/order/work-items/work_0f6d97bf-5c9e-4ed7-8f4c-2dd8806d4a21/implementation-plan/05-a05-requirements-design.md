# A05 — Requirements and DESIGN authority mutation

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C07 + C08.
**Upstream:** current R1 `3652878e16f8d0e0f956c13f75a6ff30cf4b4a69`; current R2 `2f9b0e452f76cc5a7ca346bdde56bdb902e59e47`; current DESIGN `315afe47dad86e26ad83449c6fc8adf52ed5c27c`.

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

Requirements and Solution design retain their authority/proposal semantics. Their already-replaced IA30 runtime screens on the fresh Approval baseline are evidence only and must be revalidated/remediated against SD24/current authority; this phase supplies stage-specific governed information and does not own another layout grammar.

## Referenced actions

- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the productive pre-signoff resumed-baseline revalidation/remediation definition for Requirements and Solution design.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
