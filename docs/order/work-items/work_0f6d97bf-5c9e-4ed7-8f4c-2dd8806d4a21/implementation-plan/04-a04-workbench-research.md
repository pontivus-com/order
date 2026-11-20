# A04 — Workbench current attention and Research input

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C05 + C06.
**Upstream:** current R1 `d2eb1627e2b9a145f785b04829b56c623b7431e9`; current R2 `6bea86efd799e08cb63849d528cfca24e98d283e`; current DESIGN `8a6a5e19758da1701e22111b295d19cae77e8057`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD29`, `SD30` | `IA27`, `IA29`, `IA26` | — | Re-prove the local Workbench after foundation/shell reconstruction via core/daemon/browser/certification plus rendered acceptance. |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Recheck `C06-O02`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15`, `C05-O02`, `C05-O10` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O03`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD24`, `SD26`, `SD29`, `SD30` | `IA27`, `IA29`, `IA30`, `IA32`, `IA26` | — | Primitive-owned geometry must replace feature/container presentation and pass semantic + rendered geometry proof. |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `TECHNICAL_DELTA` | `SD21`, `SD22`, `SD23`, `SD24`, `SD25`, `SD26`, `SD27`, `SD28` | `IA27`-`IA34` | — | Recompose Primary/Supporting/Technical hierarchy in every interaction class; local SD11/12/14 semantics remain inputs to the owning domain migration. |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Rebuild shared spatial grammar at primitive level and migrate every renderer family; rendered evidence required. |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Every renderer must resolve to its P4 interaction class; old recurring feature-owned UI grammar is deleted. |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O02` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `VERIFICATION_DELTA` | `SD17` | `IA21` | — | Recheck `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **18**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C05-01` | C05-F01 | `SD07` | `IA14` | — | Exact current attention owner/reason/action remains visible/reachable while other material is inspected. |
| `PL-C06-01` | C06-F01 | `SD08` | `IA04` | `IA03` | Authority-changing input is not sufficient durable authority until a later adopted canonical proposal exists. |

Package atoms in phase: **2**.

## Referenced actions

- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA04** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27** — consume the single Workbench foundation reconstruction definition.
- **IA29** — consume the single WorkItem shell/Work request migration definition.
- **IA30** — consume the single productive pre-signoff renderer migration definition.
- **IA32** — consume the single Implementation geometry migration definition where C05 geometry is shared.
- **IA26** — consume the rendered acceptance owner; this phase does not produce screenshots independently.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
