<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Canonical PLAN authority

This file is the single deterministic P7 artifact and sole normative execution authority for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. The directory `implementation-plan/` is only its maintainable authoring decomposition. The complete source content is compiled below and Approval binds this root file's bytes.

This PLAN consumes G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`. Current implementation/tests are evidence only; they are not preservation authority except where DESIGN explicitly records `POSITIVE_NO_CHANGE`.

## Exact modular source manifest

| Source component | Git blob |
|---|---|
| `implementation-plan/00-governance.md` | `2f001b6aa56197382cc59666c2acae5b44ddf73a` |
| `implementation-plan/01-a01-lifecycle-product.md` | `af36fbfafe4cf1fac8a537127267965291247a46` |
| `implementation-plan/02-a02-governance-intake.md` | `b7856833dcb2c56094de54d1d4c8c85fa4e9b195` |
| `implementation-plan/03-a03-queue-source.md` | `103a91abf514e82d73cec4aa25b13bfaa5609c91` |
| `implementation-plan/04-a04-workbench-research.md` | `d405780c0ac2235b82480ca2e511d4b54c6b8baa` |
| `implementation-plan/05-a05-requirements-design.md` | `e1f4269f1d9c93a8c464d4f4e2f477783e9e0ac1` |
| `implementation-plan/06-a06-plan-readiness.md` | `055d4ef1da31123287c29d8fcfead8f879da7397` |
| `implementation-plan/07-a07-approval-execution.md` | `7d46bb3e887ac48a44fd5ed54a0716fb6d3b738c` |
| `implementation-plan/08-a08-complete-materials.md` | `4a20cca25600afca281bbe171e2638727417ae90` |
| `implementation-plan/09-a09-provider-settings.md` | `e5f539b0add2c6215721b2798d2b0039a3a0390a` |
| `implementation-plan/10-a10-recovery-accessibility.md` | `ac01788a641ce1c0953d4cf9e1a1233446431966` |
| `implementation-plan/11-a11-component-certification.md` | `181eea3928f6c997d199a0a16a408dcec7addc47` |
| `implementation-plan/12-action-catalog.md` | `136d08c677ddb17c694fff175975597f6e3f05ec` |
| `implementation-plan/13-verification-closeout.md` | `d4adae944be9469b946b6f55f26ea5a025ecad65` |

A source component hash mismatch makes PLAN non-current until this root is regenerated. Directory files contain no `order-tasks` block and no independent lifecycle state.

## Semantic coverage versus execution ownership

A01-A11 are exhaustive semantic coverage phases. They do **not** define eleven independently executable tasks. IA01-IA25 in the compiled action catalog are the single implementation-action definitions, assigned to ordered execution waves. A phase may consume an IA owned elsewhere without duplicating it.

## Exact signed implementation surface

### Production (23)
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/execution.ts`
- `src/daemon/stage.ts`
- `src/daemon/validation.ts`
- `src/daemon/work-item-source.ts`
- `src/shell/setup.ts`
- `ui/src/ActivityComposer.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/app.tsx`
- `ui/src/workbench-presentation.ts`

### Verification (6)
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`
- `tests/installer.test.ts`

### Delivery metadata (1)
- `CHANGELOG.md`

Total signed T1 changeSurface: **30 paths**.

### Explicit exclusions
- `.github/**`
- `AGENTS.md`
- `bun.lock`
- `docs/**`
- `package.json`
- `pontivus-order.toml`
- `src/installer.ts`
- `src/daemon/server.ts`
- `tests/architecture.test.ts`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/theme.css`

`docs/**` including corrected P6 are pre-signoff DESIGN authority, not T1 implementation. `tests/architecture.test.ts` is signed architecture-gate material and cannot be mutated inside T1. `src/installer.ts` is explicitly excluded because current DESIGN proves it already calls the canonical guided-setup owner; a newly required change there returns to DESIGN/PLAN.

## Exhaustive traceability invariants

- exactly 112 stable requirements occur once across A01-A11;
- exactly 24 package-local atomic obligations occur once across A01-A11;
- every stable row names its exact R1 evidence and DESIGN disposition;
- every POSITIVE_NO_CHANGE row has no execution action and names exact verification ownership;
- every dependency-only row names the IA it consumes without duplicate edit ownership;
- every technical/verification delta maps to one or more exact IA actions;
- every IA01-IA25 is defined exactly once; IA23/IA24 are explicit cross-solution/final actions rather than orphan work;
- all execution work remains inside the exact 30-path surface;
- a disproved positive no-change or newly required path causes an upstream return.

## Compiled modular phase specification

---

### Compiled component: `implementation-plan/00-governance.md`

#### 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

##### Traceability law

Every stable P3 requirement and every package-local atomic obligation follows:

```text
canonical P3 / package consequence
 -> exact G-F10 R1 evidence
 -> exact DESIGN disposition
 -> execution owner IAxx OR dependency-only IAxx OR POSITIVE_NO_CHANGE
 -> exact verification owner
```

A positive no-change disposition is an implementation instruction: **do not edit for this requirement** and revalidate the named evidence/proof. If execution disproves it, return upstream.

##### Execution ownership

A semantic phase may reference an IA action owned by another phase. That reference is a consumer dependency, not permission to re-implement the action. Each IA action is defined exactly once in `12-action-catalog.md` and assigned to one execution wave.

##### Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

##### Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, state meaning, public contract, persistence/transport shape, external dependency, provider capability, verification authority, or path outside the signed changeSurface.


---

### Compiled component: `implementation-plan/01-a01-lifecycle-product.md`

#### A01 — Lifecycle and product identity

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C01 + C21.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O03`, `C01-O05`, `C01-O08` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O01`, `C01-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C01-O03`, `C01-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **5**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | `SD01` | `IA19` | — | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim. |

Package atoms in phase: **1**.

##### Referenced actions

- **IA19** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/02-a02-governance-intake.md`

#### A02 — Project governance and WorkItem intake

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C22 + C02.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `C16-O02`, `C16-O05`, `C22-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O02`, `C16-O05`, `C22-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `C02-O01` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C02-O01` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `C02-O02`, `C02-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C02-O02`, `C02-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `C02-O04`, `C02-O05`, `C02-O07` | `MIXED_TECHNICAL_DELTA` | `SD03` | `IA11` | — | Recheck `C02-O04`, `C02-O05`, `C02-O07` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-029-NO-IDE-SCOPE` | `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `C02-O07`, `C02-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C02-O07`, `C02-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `C22-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C22-O09` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Recheck `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **8**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C22-01` | C22-F01 | `SD02` | `IA01`, `IA02` | — | Resolve same-layer precedence/default/override/extension and fitness bindings before productive interpretation. |
| `PL-C02-01` | C02-F01 | `SD03` | `IA11` | — | Ordinary Create language is Concerns, not raw Concern IDs. |
| `PL-C02-02` | C02-F02 | `SD03` | `IA11` | — | Linked remediation project is fixed to parent project and not offered as invalid editable choice. |
| `PL-C02-03` | C02-F03/C04-F01 | `SD04` | `IA09`, `IA10` | — | Created and discovered sources share one productive admission/persistence owner. |

Package atoms in phase: **4**.

##### Referenced actions

- **IA11** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/03-a03-queue-source.md`

#### A03 — Queue, source admission and documentation Git

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C03 + C04.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `C04-O01`, `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O01`, `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-014-SOURCE-FRESHNESS` | `C04-O14`, `C02-O12` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O14`, `C02-O12` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `C04-O07`, `C04-O14` | `MIXED_TECHNICAL_DELTA` | `SD04` | `IA09`, `IA10` | — | Recheck `C04-O07`, `C04-O14` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `C03-O04`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C03-O04`, `C03-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `C04-O03`, `C04-O08`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O03`, `C04-O08`, `C04-O14` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `C04-O01`, `C04-O02` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O01`, `C04-O02` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `C04-O04`, `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O04`, `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `C04-O08`, `C04-O10`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O08`, `C04-O10`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `C04-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `DIRECT-FR066` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `DIRECT-FR066` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `C18-O11`, `DIRECT-FR067` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C18-O11`, `DIRECT-FR067` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `DIRECT-FR068` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `DIRECT-FR068` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `C05-O07`, `C18-O04`, `C18-O11` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O07`, `C18-O04`, `C18-O11` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `C04-O12`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O12`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `C04-O12` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O12` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `C03-O06`, `C03-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C03-O06`, `C03-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `C04-O02`, `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O02`, `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O03` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `C03-O04`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C03-O04`, `C04-O14` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **25**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C03-01` | C03-F01 | `SD05` | `IA12` | — | Including archived work expands the candidate set without bypassing project/search filters. |
| `PL-C04-01` | C04-F01 | `SD04` | `IA09`, `IA10` | — | Source-admission owner is singular across creation/discovery. |
| `PL-C04-02` | C04-F02 | `SD06` | `IA13` | — | Documentation-Git confirmation shows the exact governed paths/states before commit. |

Package atoms in phase: **3**.

##### Referenced actions

- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA12** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA13** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/04-a04-workbench-research.md`

#### A04 — Workbench current attention and Research input

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C05 + C06.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Recheck `C06-O02`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C04-O15`, `C05-O02`, `C05-O10` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O03`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C06-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O01`, `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `MIXED_TECHNICAL_DELTA` | `SD11`, `SD12`, `SD14` | `IA16`, `IA17`, `IA18` | — | Recheck `C05-O10`, `C05-O12`, `C19-O03` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O12`, `C19-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O08`, `C05-O12`, `C19-O01` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C05-O01`, `C05-O02` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `VERIFICATION_DELTA` | `SD17` | `IA21` | — | Recheck `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **18**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C05-01` | C05-F01 | `SD07` | `IA14` | — | Exact current attention owner/reason/action remains visible/reachable while other material is inspected. |
| `PL-C06-01` | C06-F01 | `SD08` | `IA04` | `IA03` | Authority-changing input is not sufficient durable authority until a later adopted canonical proposal exists. |

Package atoms in phase: **2**.

##### Referenced actions

- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA04** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/05-a05-requirements-design.md`

#### A05 — Requirements and DESIGN authority mutation

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C07 + C08.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `C07-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C07-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **1**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C07-01` | C07-F01 | `SD09` | `IA03` | — | R2 can propose/adopt validated current P2/P3 canonical-owner amendments through the one proposal mechanism. |
| `PL-C08-01` | C08-F01 | `SD09` | `IA03` | — | DESIGN can propose/adopt validated current P4/P5/P6 canonical-owner amendments through the same mechanism. |

Package atoms in phase: **2**.

##### Referenced actions

- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/06-a06-plan-readiness.md`

#### A06 — PLAN contract and R3 readiness

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C09 + C10.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C10-O01`, `C10-O09`, `C10-O10` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C10-O04`, `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `TECHNICAL_DELTA` | `SD11` | `IA16` | — | Recheck `C10-O06`, `C10-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **3**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C09-01` | C09-F01 | `SD10` | `IA05` | — | Implementation-required signed task package is materially non-vacuous. |
| `PL-C10-01` | C10-F01 | `SD11` | `IA16` | — | Readiness dominant verdict is typed R3 outcome. |

Package atoms in phase: **2**.

##### Referenced actions

- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA05** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/07-a07-approval-execution.md`

#### A07 — Approval and execution checkpoints

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C11 + C12.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `C12-O01`, `C12-O02`, `C12-O07` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O01`, `C12-O02`, `C12-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `C12-O12`, `C12-O13`, `C12-O19` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O12`, `C12-O13`, `C12-O19` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `C11-O01`, `C11-O03`, `C12-O20` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C11-O01`, `C11-O03`, `C12-O20` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `C11-O01`, `C11-O02`, `C11-O07` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C11-O01`, `C11-O02`, `C11-O07` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `C12-O03`, `C12-O17` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O03`, `C12-O17` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `C12-O17`, `C17-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O17`, `C17-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED_TECHNICAL_DELTA` | `SD12` | `IA17` | — | Recheck `C11-O06`, `C11-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O17` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `C12-O16` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O16` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **10**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C11-01` | C11-F01 | `SD12` | `IA17` | — | Approval presents readiness and package currentness before technical identity. |
| `PL-C11-02` | C11-F02 | `SD12` | `IA06` | — | Canonical approval identity is trimmed/nonblank at ingress. |
| `PL-C12-01` | C12-F01 | `SD13` | `IA07`, `IA08` | — | Signed in-task architecture checkpoint is coordinator-executable without provider shell permission. |

Package atoms in phase: **3**.

##### Referenced actions

- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA06** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA07** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA08** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/08-a08-complete-materials.md`

#### A08 — Complete and governed materials

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C13 + C14.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | `C13-O01`, `C13-O05` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C13-O01`, `C13-O05` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | `C14-O05`, `C14-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C14-O05`, `C14-O06` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | `C14-O09`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C14-O09`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `C13-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C13-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | `C14-O05`, `C14-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C14-O05`, `C14-O06` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | `C14-O03`, `C14-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C14-O03`, `C14-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | `C14-O08`, `DIRECT-FR242` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C14-O08`, `DIRECT-FR242` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| — | — | — | — | — | No package-local atom beyond stable-requirement coverage. |

Package atoms in phase: **0**.

##### Referenced actions

- No IA action is owned by this phase; all stable requirements are positive no-change.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/09-a09-provider-settings.md`

#### A09 — Provider, installation and Settings

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C15 + C16.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007` | `TECHNICAL_DELTA` | `SD19` | `IA25` | — | Recheck `DIRECT-FR007` via new `tests/installer.test.ts`; existing `tests/order-migration.test.ts` + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `C16-O07` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O07` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `C16-O09`, `C16-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O09`, `C16-O10` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `DIRECT-FR080` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `DIRECT-FR080` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `C16-O06`, `DIRECT-FR081` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O06`, `DIRECT-FR081` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `C16-O04`, `DIRECT-FR082` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O04`, `DIRECT-FR082` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `C16-O02`, `C16-O03` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O02`, `C16-O03` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `C16-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O04` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `C16-O01` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C16-O01` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `C15-O02`, `C15-O08`, `C15-O15` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O02`, `C15-O08`, `C15-O15` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `C15-O03`, `C15-O04`, `C15-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O03`, `C15-O04`, `C15-O08` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `C15-O12`, `C15-O13` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O12`, `C15-O13` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `C15-O03`, `C15-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O03`, `C15-O04` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `C15-O05` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O05`, `C15-O07`, `C15-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `C15-O09`, `C15-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O09`, `C15-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `C15-O01`, `C15-O07`, `C15-O12` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C15-O01`, `C15-O07`, `C15-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **21**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C16-01` | C16-F01 | `SD14` | `IA18` | — | Settings primary hierarchy is operator readiness/meaning/action, with exact technical identity secondary except task-required. |
| `PL-C16-02` | C16-F02 | `SD19` | `IA25` | — | Fresh productive install cannot succeed with mandatory repository/account/model setup deferred to Settings. |
| `PL-C16-03` | C16-F03 | `SD19` | `IA25` | `PRE_T1_P6_CORRECTION_DONE` | P6 must preserve incomplete-v4 recovery capability while forbidding productive installer success at that state. |

Package atoms in phase: **3**.

##### Referenced actions

- **IA25** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/10-a10-recovery-accessibility.md`

#### A10 — Recovery, current attention and accessibility

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C17 + C18.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C06-O15`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O02`, `C17-O05`, `C17-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C17-O04`, `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C17-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C18-O01`, `C18-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C18-01` | C18-F01 | `SD15` | `IA15` | — | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. |

Package atoms in phase: **1**.

##### Referenced actions

- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/11-a11-component-certification.md`

#### A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** exact G-F10 R1/R2 evidence and semantic DESIGN blob `e77408f9dad996a0d6c18c2887daede6bbdbed3c`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103` | `POSITIVE_NO_CHANGE` | — | NONE — preserve proven realization | — | Recheck `DIRECT-FR103` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18` | `IA15`, `IA20`, `IA21`, `IA22` | — | Recheck `C20-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD11`, `SD12`, `SD14`, `SD16` | `IA16`, `IA17`, `IA18`, `IA20` | — | Recheck `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `VERIFICATION_DELTA` | `SD16` | `IA20` | — | Recheck `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `VERIFICATION_DELTA` | `SD18` | `IA22` | — | Recheck `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |

Package atoms in phase: **3**.

##### Referenced actions

- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA20** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA22** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


---

### Compiled component: `implementation-plan/12-action-catalog.md`

#### 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility.

##### Execution waves

1. **Wave 1 — authority/contracts/execution:** IA01-IA08.
2. **Wave 2 — source/queue/Git:** IA09-IA13.
3. **Wave 3 — Workbench/product presentation:** IA14-IA19.
4. **Wave 4 — productive installer:** IA25.
5. **Wave 5 — permanent certification:** IA20-IA23.
6. **Wave 6 — candidate closeout:** IA24.

Architecture-feedback checkpoints in `13-verification-closeout.md` apply after each wave.

##### IA01 — pure project-authority resolution

**Solution:** SD02.  
**Owner/anchors:** `src/core/governance.ts`, existing authority-layer/concern/material/freshness pure functions.  
**Required mutation:** add the minimum pure resolved-authority projection over validated manifest inputs and shell-expanded selected paths, including same-layer precedence plus inherited P1 default/override/extension and fitness bindings.  
**Forbidden:** filesystem/provider I/O; semantic contradiction inference; DTO/service/repository/class family; parallel authority graph.  
**Proof:** `tests/core.test.ts` ordering/default/override/extension/invalid-input cases.

##### IA02 — consume resolved authority before productive context

**Solution:** SD02. Depends on IA01.  
**Anchors:** `src/daemon/authority.ts::resolveStageContextState/resolveStageContext`; `src/daemon/stage.ts::stagePrompt` and stage admission.  
**Required mutation:** consume IA01 result before provider context/conformance/sign-off dependency construction; invalid/unresolved bindings block before provider use.  
**Proof:** `tests/daemon.test.ts` productive-context admission and negative unresolved-binding cases.

##### IA03 — one GOVERNANCE proposal/adoption mechanism

**Solution:** SD09.  
**Anchors:** `src/core/contracts.ts` proposal/ArtifactRef contracts; `src/core/governance.ts`; `src/daemon/stage.ts::proposalDisposition/proposalAdoptionRequest/adoptArtifactProposal/reconcilePendingArtifactProposals`; `src/daemon/authority.ts`.  
**Required mutation:** R2 admits only current manifest-resolved P2/P3 targets; DESIGN only P4/P5/P6; exact role/layer/path/base-hash re-resolution before adoption.  
**Forbidden:** stage-specific proposal DTOs/direct provider writes/second decision store.  
**Proof:** core/daemon wrong-layer/path/hash/stale/adoption/freshness cases.

##### IA04 — durable-decision completion admission

**Solution:** SD08. Consumer dependency on IA03 when the durable target is permanent governance.  
**Anchors:** `src/core/lifecycle.ts::evaluateStageCompletion/validateStageProviderTurn`; `src/daemon/stage.ts::runStageTurn/submitRunInput`.  
**Required mutation:** after latest answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, reject stage completion until later adopted authority exists. INFORMATION/EVIDENCE remains unchanged.  
**Proof:** core/daemon chronology cases for adopted/rejected/cancelled/stale and ordinary information input.

##### IA05 — non-vacuous signed-task contract

**Solution:** SD10.  
**Anchors:** `src/core/contracts.ts` SignedTaskBlock/task schemas; `src/core/execution.ts::parseSignedTaskBlockFromPlan`; `src/daemon/authority.ts::validateTaskDefinitions`.  
**Required mutation:** implementation-required plan has at least one materially specified task with meaningful id/objective/scope/changeSurface/acceptance/gates/authority/concerns.  
**Proof:** exact positive/negative parser and readiness/signoff validation tests.

##### IA06 — canonical Approval identity normalization

**Solution:** SD12.  
**Anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts::signOffWorkItem`.  
**Required mutation:** trim and reject whitespace-only `approvedBy` before persistence.  
**Proof:** core/daemon direct-ingress negative tests plus browser feedback.

##### IA07 — typed BUILDER checkpoint request

**Solution:** SD13.  
**Anchors:** `src/core/contracts.ts` RunEvent payload; `src/core/execution.ts::builderProviderTags/providerEventIsAdmitted`.  
**Required mutation:** add exactly `GATE_CHECKPOINT_REQUESTED { gateId }`, BUILDER-only, terminal action of that provider turn.  
**Proof:** role/event admission tests.

##### IA08 — coordinator-owned signed checkpoint execution

**Solution:** SD13. Depends on IA07.  
**Anchors:** `src/daemon/execution.ts` mutating/post-signoff reaction owner; `src/daemon/validation.ts::runRequiredGates` and existing gate evidence/result owner.  
**Required mutation:** validate signed gate/current manifest/freshness, execute in current builder workspace through validation effects, record existing GATE_PASSED/GATE_FAILED evidence, continue same Run/session.  
**Forbidden:** provider shell/execute; persisted checkpoint state; checkpoint as substitute for V3/V5/V7.  
**Proof:** daemon pass/fail/unsigned/stale/continuation cases.

##### IA09 — singular new-source planner

**Solution:** SD04.  
**Anchor:** `src/daemon/work-item-source.ts::reconcileWorkItemSources/createWorkItemFromSource`.  
**Required mutation:** factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan from a validated source snapshot.  
**Proof:** created/discovered inputs produce equivalent admission plans except provenance.

##### IA10 — converge created/discovered persistence

**Solution:** SD04. Depends on IA09.  
**Anchor:** `src/daemon/work-item-source.ts`.  
**Required mutation:** route UI-created and discovered source snapshots through IA09 + existing applyPlan; delete direct create-path WorkItem construction/store.  
**Proof:** daemon one-persistence-owner, read-back, diagnostics and freshness tests.

##### IA11 — canonical Create interaction

**Solution:** SD03.  
**Anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required mutation:** ordinary vocabulary is Concerns; linked remediation shows fixed parent project context and no invalid cross-project selector. Preserve metadata/body ownership.  
**Proof:** browser ordinary creation, metadata ownership and linked-remediation tests.

##### IA12 — one archive/project/search derivation

**Solution:** SD05.  
**Anchors:** `ui/src/app.tsx::App`; `ui/src/WorkItemQueue.tsx::WorkItemQueue`.  
**Required mutation:** App selects active/include-archived canonical dataset then applies project/search exactly once; queue does not own alternate filtering.  
**Proof:** browser active/archived × project × search matrix while archive identity/history remains unchanged.

##### IA13 — exact documentation-Git review

**Solution:** SD06.  
**Anchor:** `ui/src/DocumentWorkspace.tsx::DocumentationGitConfirmation`.  
**Required mutation:** list exact canonical governed changed paths/states before commit; reuse existing Git status owner.  
**Proof:** browser exact-path/state review plus blocker cases. Do not alter save/status/eligibility semantics already proven conforming.

##### IA14 — current attention survives inspection

**Solution:** SD07.  
**Anchors:** canonical `src/core/lifecycle.ts::deriveCurrentAttention` remains unchanged owner; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts`.  
**Required mutation:** when inspected material differs from current owner, render exact higher-priority owner/reason/action and direct return while preserving legitimate inspection.  
**Proof:** presentation/browser required-input/proposal/blocker/stale/recovery with historical selection.

##### IA15 — focus once per required-input request

**Solution:** SD15.  
**Anchors:** `ui/src/ActivityComposer.tsx::ActivityComposer`; `ui/src/ActivityWorkspace.tsx::StageRunMaterial`.  
**Required mutation:** new current required-input event id moves focus once to Workbench composer; rerender/polling does not refocus.  
**Proof:** browser focus-once/rerender/responsive cases.

##### IA16 — canonical Readiness verdict

**Solution:** SD11.  
**Anchor:** `ui/src/ReadinessWorkspace.tsx::ReadinessWorkspace` plus existing presentation helper.  
**Required mutation:** dominant verdict is typed R3 completion outcome; maturity/currentness separate.  
**Proof:** READY_FOR_SIGNOFF/RETURN_TO_*/BLOCKED + stale material cases.

##### IA17 — Approval readiness/currentness hierarchy

**Solution:** SD12.  
**Anchor:** `ui/src/SignoffReview.tsx::SignoffReview`.  
**Required mutation:** readiness + package currentness precede task/technical identity; stale/history cannot fabricate readiness.  
**Proof:** browser/presentation current/stale package cases.

##### IA18 — operator-first Settings hierarchy

**Solution:** SD14.  
**Anchors:** `ui/src/SettingsWorkspace.tsx::SettingsWorkspace/RepositorySettings/ModelRuntimeSettings`.  
**Required mutation:** readiness/meaning/actions primary; exact roots/endpoints/model source/credential-like identity under Technical details except active configuration input.  
**Proof:** browser normal Settings, blockers, Add/Move/configuration cases.

##### IA19 — product-language projection

**Solution:** SD01.  
**Anchors:** `README.md`; `ui/src/TerminalResult.tsx::TerminalResult`; `ui/src/workbench-presentation.ts`.  
**Required mutation:** verified result umbrella; Verified candidate only CANDIDATE_DONE; no universal implementation or automatic delivery overclaim; explicit mapping not enum prettification.  
**Proof:** presentation/browser product-copy assertions.

##### IA20 — exhaustive renderer classification certification

**Solution:** SD16.  
**Owner:** `tests/certification.test.ts`.  
**Required mutation:** derive/check complete production renderer coverage against canonical P4 matrix, including ActivityComposer; fail on an unclassified renderer.  
**Forbidden:** edit `tests/architecture.test.ts` inside T1 or create second UI registry.  
**Proof:** certification negative/positive fixture.

##### IA21 — scenario-41 work-kind certification

**Solution:** SD17.  
**Owner:** `tests/browser.spec.ts`.  
**Required mutation:** certify all four kinds' Work request + Research information contracts and distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind semantic matrix.

##### IA22 — System/Light/Dark component-semantic parity

**Solution:** SD18.  
**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required mutation:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states preserve canonical semantic roles under all effective themes.  
**Proof:** semantic role/component assertions; no pixel-snapshot substitute.

##### IA23 — cross-solution regression closure

**Upstream:** all SD01-SD19.  
**Owners:** existing targeted core/daemon/presentation/browser/certification suites.  
**Required mutation:** fill any integration-level positive/negative gaps needed to prove the composed solutions without duplicating action-specific tests. Explicitly prove no compatibility fallback, shadow owner or implementation-derived semantics.  
**Proof:** all targeted suites green and V4/V5/V6 trace every added assertion to an SD/requirement/atom.

##### IA24 — exact candidate closeout

**Upstream:** complete T1.  
**Owner:** `CHANGELOG.md` plus coordinator-owned validation evidence.  
**Required mutation:** record user-visible/correctness consequences under Unreleased; run exact final six-gate union and V0-V7 with fresh V4/V5/V6.  
**Terminal:** only CANDIDATE_DONE or valid ALREADY_SATISFIED. PR merge/release/version bump remain outside T1.

##### IA25 — guided productive installer completion

**Solution:** SD19.  
**Canonical authority:** P3 FR007, P4 GW-TR-007 and corrected P6.  
**Owner/anchor:** `src/shell/setup.ts::runInstallerGuidedSetup/runGuidedSetupInternal`; `src/installer.ts::configureOrder/runInstaller` is the existing caller and is not expected to change.  
**Required mutation:** remove/replace the fresh `configured === null` success/defer branch so installer-owned setup continues through existing private OpenCode login, model selection, exact target repository validation/selection and reference-root choices before returning success. Preserve valid incomplete v4 for daemon/Settings recovery and transient rollback-safe installer state. Preserve existing upgrade/migration retention and rollback.  
**Forbidden:** new config schema; second setup owner; mandatory post-install Settings/provider-login step; speculative `src/installer.ts` edit. If setup.ts alone cannot realize SD19, return to DESIGN/PLAN.  
**Proof:** create `tests/installer.test.ts` covering fresh productive setup success/failure/cancel and deferred-Settings rejection; existing `tests/order-migration.test.ts` must continue proving migration/rollback/continuity.


---

### Compiled component: `implementation-plan/13-verification-closeout.md`

#### 0.6.0 verification and closeout contract

This component allocates proof inside the one signed T1. It does not create another validation model.

##### Architecture-feedback checkpoints

| Checkpoint | After execution wave | Required evidence |
|---|---|---|
| A | Wave 1 IA01-IA08 | typecheck + architecture + relevant core/daemon tests |
| B | Wave 2 IA09-IA13 | typecheck + architecture + source/queue/Git daemon/browser tests |
| C | Wave 3 IA14-IA19 | typecheck + architecture + Workbench/browser/presentation tests |
| D | Wave 4 IA25 | typecheck + architecture + installer test + order-migration test + build |
| E | Wave 5 IA20-IA23 | typecheck + architecture + full test + build + browser |

Checkpoints are feedback only and never substitute for final V3/V5/V7.

##### Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the conforming remainder is unchanged.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

##### Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA24 runs the final validation contract.

##### Final logical gate union

- dependency-lock
- typecheck
- architecture
- test
- build
- browser

##### V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their R1 evidence and DESIGN disposition;
- all 24 package atoms are satisfied;
- every positive no-change row remains true;
- exact 30-path signed surface, no extra path;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock/workflow metadata remain outside T1. Any pre-signoff G-F10 fitness-sensor correction changes verification material before Approval and forces downstream package revalidation.


## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the complete authority-driven Order 0.6.0 semantic DESIGN as one cumulative verified candidate: execute SD01-SD19 through IA01-IA25 exactly where the G-F10 evidence identifies a technical or verification delta, preserve every requirement-level POSITIVE_NO_CHANGE realization, and introduce no parallel semantic owner, state model, DTO/OOP/service/repository/controller family, persistence/API family, dependency or implementation-derived product behavior.",
      "dependsOn": [],
      "scope": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/execution.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/setup.ts",
        "ui/src/ActivityComposer.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/app.tsx",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts",
        "tests/installer.test.ts",
        "CHANGELOG.md"
      ],
      "exclusions": [
        ".github/**",
        "AGENTS.md",
        "bun.lock",
        "docs/**",
        "package.json",
        "pontivus-order.toml",
        "src/installer.ts",
        "src/daemon/server.ts",
        "tests/architecture.test.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/theme.css"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-PROJECT-GOVERNANCE-INTEGRATION",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1",
        "GW-DOC-SYSTEM-BRIEF-V1",
        "GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP"
      ],
      "changeSurface": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/execution.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/setup.ts",
        "ui/src/ActivityComposer.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/app.tsx",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts",
        "tests/installer.test.ts",
        "CHANGELOG.md"
      ],
      "gateIds": [
        "architecture",
        "browser",
        "build",
        "dependency-lock",
        "test",
        "typecheck"
      ],
      "authorityRefs": [
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-MINIMUM-CHANGE",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-TR-007-GUIDED-PRODUCTIVE-BOOTSTRAP",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "ui",
        "verification"
      ]
    }
  ]
}
```
