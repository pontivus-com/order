# A03 — Queue, source admission and documentation Git

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C03 + C04.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `C04-O01`, `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O01`, `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-014-SOURCE-FRESHNESS` | `C04-O14`, `C02-O12` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O14`, `C02-O12` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `C04-O07`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Existing created/discovered admission converges on planNewSource/applyPlan; preserve one persistence/freshness owner. Proof: tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `C03-O04`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O04`, `C03-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `C04-O03`, `C04-O08`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03`, `C04-O08`, `C04-O14` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `C04-O01`, `C04-O02` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O01`, `C04-O02` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `C04-O04`, `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O04`, `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `C04-O08`, `C04-O10`, `C04-O13` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O08`, `C04-O10`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `C04-O09` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `DIRECT-FR066` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR066` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `C18-O11`, `DIRECT-FR067` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C18-O11`, `DIRECT-FR067` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `DIRECT-FR068` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR068` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `C05-O07`, `C18-O04`, `C18-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O07`, `C18-O04`, `C18-O11` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `C04-O12`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — retain current positive pre-signoff allowlist; IA39 proof-only Acceptance denial | — | IA39 proves direct Acceptance Git denial/no write and UI command absence; recheck `C04-O12`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `C04-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O12` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `C04-O03` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `C03-O06`, `C03-O08` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C03-O06`, `C03-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `C04-O02`, `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `C04-O02`, `C04-O15` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `C04-O03` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O03` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `C03-O04`, `C04-O14` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C03-O04`, `C04-O14` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |

Stable rows in phase: **25**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C03-01` | C03-F01 | `SD05`, `SD22` | `IA12`, `IA28` | — | Including archived work expands the candidate set without bypassing project/search filters; IA28 owns the Operational-scan presentation and must keep Queue heading/controls/notices/table inside the scan material with semantic attention absent. |
| `PL-C04-01` | C04-F01 | `SD04` | `IA09`, `IA10` | — | Source-admission owner is singular across creation/discovery. |
| `PL-C04-02` | C04-F02 | `SD06`, `SD23` | `IA13`, `IA29` | — | Documentation-Git confirmation shows the exact governed paths/states before commit inside the existing WorkItem/document composition. |

Package atoms in phase: **3**.

## Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA12** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA13** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single IA28 definition in `12-action-catalog.md`.
- **IA29** — consume the single IA29 definition in `12-action-catalog.md`.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


## Realization trace consequence

SD03/05/06: IA11/12 consume the complete Create/Queue datum and diagnostic contracts; IA13 owns pre-Save consequence and Git review, IA29 Document composition. Proof: SURF-CREATE/QUEUE and IA29-owned source/document/confirmation rows.

## Native Acceptance integration

QA integration: IA35/IA38 extend current signed-state editability, source/title, documentation Git, queue and archive admission. Test Acceptance, queued correction, correction blocked, upstream return, legacy COMPLETE, stale and historical selections. Reuse positive pre-signoff allowlists; neither no active Run nor open Acceptance makes the signed documents editable. IA39 proves no repository/DB mutation for rejected operations.
