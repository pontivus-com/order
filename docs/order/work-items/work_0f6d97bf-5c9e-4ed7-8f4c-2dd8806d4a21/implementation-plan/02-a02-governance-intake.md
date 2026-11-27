# A02 — Project governance and WorkItem intake

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C22 + C02.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `C16-O02`, `C16-O05`, `C22-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O02`, `C16-O05`, `C22-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `C02-O01` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O01` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `C02-O02`, `C02-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O02`, `C02-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `C02-O04`, `C02-O05`, `C02-O07` | `VERIFICATION_DELTA` | `SD03` | `IA11`, `IA28` | — | Retain controlled authoring fields and ordinary Concerns label; prove catalog-driven context visibility and canonical metadata admission. Proof: tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-029-NO-IDE-SCOPE` | `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `C02-O07`, `C02-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O07`, `C02-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `C22-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C22-O09` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Prove the reachable authority graph is resolved before provider use and the productive stage materializes only the pinned-schema/stage/explicit-ref applicable stable/versioned subset; retained V1 reachability alone must not inject V1 into current v2 context. Recheck via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **8**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C22-01` | C22-F01/C22-F02 | `SD02` | `IA01`, `IA02` | — | Resolve same-layer precedence/default/override/extension and fitness bindings over the reachable graph, then derive stage materiality from the pinned schema/stage/explicit refs so retained semantic versions remain live by exact versioned ref without leaking into unrelated current-schema context; IA02 owns the production-path proof. |
| `PL-C02-01` | C02-F01 | `SD03`, `SD22` | `IA11`, `IA28` | — | Ordinary Create language is Concerns and the existing Create composition realizes the controlled authoring hierarchy. |
| `PL-C02-02` | C02-F02 | `SD03`, `SD22` | `IA11`, `IA28` | — | Linked remediation Project is fixed; SD03/IA11 shares catalog-admitted completed-parent eligibility with IA33, no outcome-only exclusion or automatic remediation. |
| `PL-C02-03` | C02-F03/C04-F01 | `SD04` | `IA09`, `IA10` | — | Created and discovered sources share one productive admission/persistence owner. |

Package atoms in phase: **4**.

## Referenced actions

- **IA11** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single Queue/Create resumed-baseline revalidation/remediation definition; C02 owns authoring semantics, not shared primitive implementation.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. SD02 certification is owned by IA02 and proves the productive production path, including stable-current versus explicit-versioned materiality with both retained and current sources selected/reachable, not only the pure helper/daemon unit boundary;
6. action-specific tests plus `13-verification-closeout.md` pass;
7. any evidence contradiction returns upstream rather than broadening scope.

## Native Acceptance integration

QA integration: IA35/IA37 preserve source-bound Approval and exact current authority through Acceptance; IA38 proves current vs historical inspection and governed upstream return; IA39 proves source/authority staleness and no silent reauthorization. New-scope work remains independent; no new portable relationship or work kind.
