# A09 — Provider, installation and Settings

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C15 + C16.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007`, `C16-F04` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD19` | `IA25` | — | IA25 transaction matrix proves actual fresh/unproven versus established admission, explicit historical disposition, exact auth/schema/blocker behavior, guided root-first retry with retained unavailable roots, proven service quiescence and independently reversible partial effects, atomic commit, non-destructive post-commit finalization failure, migration and continuity. Existing helper/structural/browser proof is complementary. Proof: tests/installer.test.ts; tests/daemon.test.ts; tests/certification.test.ts + existing migration/browser proof + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `DEPENDENCY_DELTA` | `SD22` | `IA28` | `IA34` owns full account management only | The canonical account projection/query and current shared WorkbenchToolbar account utility are positively evidenced. IA28/IA27 revalidate global active-account visibility and Settings quick-access in the existing closed shell; only an exact bounded residual within forecast may change. IA34 owns account management proof, not a competing global account owner. Proof: tests/browser.spec.ts; tests/certification.test.ts; rendered `SURF-APP-001` acceptance + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `C16-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O07` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `C16-O09`, `C16-O10`, `C16-F04` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD19`; QA2/QA6 | `IA25`; IA36/IA37 | IA35–IA38 atomic cutover; IA39 proof | IA25 transaction matrix proves actual fresh/unproven versus established admission, explicit historical disposition, exact auth/schema/blocker behavior, guided root-first retry with retained unavailable roots, proven service quiescence and independently reversible partial effects, atomic commit, non-destructive post-commit finalization failure, migration and continuity. Existing helper/structural/browser proof is complementary. Proof: tests/installer.test.ts; tests/daemon.test.ts; tests/certification.test.ts + existing migration/browser proof + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `DIRECT-FR080` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD19` | `IA25` | — | IA25 INST-02/03/08/12: deterministic established v3 conversion and v4 retention with unavailable account/model/root/reference or absent config, exact field preservation, strict configuration-path presence/publication/compensation and rollback. Proof: tests/installer.test.ts; tests/daemon.test.ts; tests/certification.test.ts; tests/shell.test.ts; tests/order-migration.test.ts; existing SQLite and browser proof + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `C16-O06`, `DIRECT-FR081` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD19` | `IA25` | — | IA25 INST-02/04/08/12: preserve installation-owned private account namespace through migration, no forced login for established recovery and no ambient credential import. Proof: tests/installer.test.ts; tests/daemon.test.ts; tests/certification.test.ts; tests/shell.test.ts; tests/order-migration.test.ts; existing SQLite and browser proof + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `C16-O04`, `DIRECT-FR082` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD19`; QA2/QA6 | `IA25`; IA36/IA37 | IA35–IA38 atomic cutover; IA39 proof | IA25 INST-04/08/12: exact document-copy retention, installer-created manifest custody from exclusive creation through validation/commit/compensation, database archive/restore custody under the supported sole-writer maintenance boundary, partial-failure compensation, failed-quiescence containment, original error and recovery paths. Proof: tests/installer.test.ts; tests/daemon.test.ts; tests/certification.test.ts; tests/shell.test.ts; tests/order-migration.test.ts; existing SQLite and browser proof + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `C16-O02`, `C16-O03`, `C16-O90` | `MIXED_TECHNICAL_DELTA` | QA6 | IA37 | IA35–IA38 atomic cutover; IA39 proof | Retain exact root/confirmation/configuration and Notice mechanisms; prove serialized rejection of disconnect in EXECUTION or AWAITING_ACCEPTANCE without active Run, exact repository scope, no config/scheduler/repository/WorkItem mutation, and successful ordinary action after governed return/completion. Proof: tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6. |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `C16-O04`, `C16-O90` | `MIXED_TECHNICAL_DELTA` | QA6 | IA37 | IA35–IA38 atomic cutover; IA39 proof | Extend existing migration admission only; prove denial before any document/manifest/database/scheduler mutation for signed Acceptance (including idle/queued/retest), retain existing migration and rollback proof and ordinary eligibility after governed return/completion. Proof: tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6. |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `C15-O03`, `C15-O04`, `C15-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O03`, `C15-O04`, `C15-O08` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `C15-O12`, `C15-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O12`, `C15-O13` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `C15-O03`, `C15-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O03`, `C15-O04` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `C15-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O05`, `C15-O07`, `C15-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `C15-O09`, `C15-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O09`, `C15-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `C15-O01`, `C15-O07`, `C15-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O01`, `C15-O07`, `C15-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **21**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C16-01` | C16-F01 | `SD14`, `SD28` | `IA18`, `IA34` | — | Settings primary hierarchy is operator readiness/meaning/action, with exact technical identity secondary except task-required; IA34 owns Settings/account/configuration proof. |
| `PL-C16-02` | C16-F02 | `SD19` | `IA25` | — | Fresh productive install cannot succeed with mandatory repository/account/model setup deferred to Settings; IA25 must prove actual canonical readiness after service activation and health, before success/rollback retirement; historical ambiguity and residue do not establish an automatic update exemption; IA25 owns actual transaction and finalization proof. |
| `PL-C16-03` | C16-F03 | `SD19` | `IA25` | `PRE_T1_P6_CORRECTION_DONE` | P6 preserves incomplete-v4 recovery and deterministic v3 conversion; IA25 implements F7 including AUD-01/02 continuity and existing SQLite archive/restore custody, with P4-owned classification and rollback/finalization. P4/P6 correction is pre-T1 authority, not a second readiness implementation. |

Package atoms in phase: **3**.

## Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA25** — consume the single definition in `12-action-catalog.md`; REV-F10 adds the two exact regression owners; REV-F11 adds the existing project-manifest effect owner required by SD19/F7 and clarifies the supported sole-writer maintenance boundary. This phase does not redefine the action.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single IA28 definition in `12-action-catalog.md`.
- **IA34** — consume the single IA34 definition in `12-action-catalog.md`.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


## Realization trace consequence

IA18/34 consume exact default-visible repository facts and distinct configuration/account task states; IA30 bounded activity/human failure projection. Prove actual inputs/pending/recovery and negative diagnostic leakage.

## Native Acceptance integration

QA integration: IA36 extends installer stopped migration from v3 to v4 and earlier supported predecessors, preserving exact rows/rollback custody and configuration version; IA37 extends signed-work repository/root guard, including Acceptance and linked blocked correction. IA39 verifies no destructive Settings mutation invalidates active signed evidence, proves exact migration and failed activation rollback.
