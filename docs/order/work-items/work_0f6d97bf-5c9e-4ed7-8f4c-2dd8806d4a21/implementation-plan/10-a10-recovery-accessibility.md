# A10 — Recovery, current attention and accessibility

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C17 + C18.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O15`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O02`, `C17-O05`, `C17-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C17-O04`, `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `TECHNICAL_DELTA` | `SD07`; QA1/QA2/QA6 | `IA14`; IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C17-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C17-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `MIXED_TECHNICAL_DELTA` | `SD29`, `SD30`; QA4/QA5/QA6 | `IA27`-`IA34`, `IA26`; IA38/IA39 | IA35–IA38 atomic cutover; IA39 proof | Retain only scoped conforming editor/selection mechanisms; IA34 corrects G-F42 Settings content mount under SD28/SD29, and proves live unsaved/active task continuity across breakpoints. Proof: tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + rendered acceptance + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08`, `DIRECT-FR226` | `MIXED_TECHNICAL_DELTA` | `SD07`, `SD25`, `SD26`; QA4/QA5/QA6 | `IA14`, `IA31`, `IA32`; IA38/IA39 | IA35–IA38 atomic cutover; IA39 proof | Retain inline feedback for all admitted decisions/inspections and actual current recovery owner. Required proof: owning IA and P3 §23 allocation in 13-verification-closeout.md.; IA39 native Acceptance proof, prior evidence historical |

Stable rows in phase: **7**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C18-01` | C18-F01 | `SD15` | `IA15` | — | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. |

Package atoms in phase: **1**.

## Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the single IA27-IA34 definitions in `12-action-catalog.md`; this phase owns no duplicate renderer/component implementation procedure.
- **IA26** — consume the exact-candidate responsive rendered acceptance owner.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


## Realization trace consequence

IA14 owns reason/action through historical/supporting/transient selection, IA31 decision-local feedback, IA32 execution recovery, IA15 focus. Prove rejection, no competing action, focus/return and viewport continuity.

### A09 installation-recovery dependency

Consume SD19/F7 and IA25 as the sole installation transaction owner. A10 re-audit must challenge historical ambiguity, partial predecessor migration/application/launcher/service activation, every pre-commit rollback and post-commit finalization failure, then verify the same invocation-local classification is used on retry and reporting. Do not reinterpret installation recovery as WorkItem lifecycle recovery or add a second recovery owner. IA25 owns its behavioral oracle, including established v3/v4 recovery and partial SQLite archive/restore with secondary compensation failure; A10 verifies the cross-domain consequence and may not pass while the upstream installer boundary is unresolved.

## Native Acceptance integration

QA integration: IA35 derives queued processing, human-action-required, missing/corrupt proof blocker and stale authority; IA37 resumes the exact linked QA review/repair or returns upstream, never unrelated Builder; IA38 keeps current attention reachable during historical inspection, suppresses incoherent controls, preserves focus/dirty navigation. IA39 proves failed retest, successor and stale command races, theme and narrow behavior.
