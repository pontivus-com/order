# A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `MIXED_TECHNICAL_DELTA` | QA1/QA3/QA6 | IA35/IA37 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `MIXED_TECHNICAL_DELTA` | `SD02`, `SD08` | `IA02`, `IA04` | — | Retain exact output identity and admission; prove producing-stage context/freshness and material durable-decision closure via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Retain existing permanent exact-pin real OpenCode simulation tier and CI; close only demonstrable representative proof gaps. Fake-provider proof is complementary. Proof: `tests/opencode.test.ts`; `.github/workflows/ci.yml`; existing `tests/daemon.test.ts`/`tests/certification.test.ts` as complementary structural/adversarial proof + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30`; QA5/QA6 | `IA15`, `IA20`, `IA21`, `IA22`, `IA26`; IA39 | IA35–IA38 atomic cutover; IA39 proof | Permanent certification proves required absence of generic workflow frame/material-selector APIs, closed primitive consumer allowlists, no compatibility/deprecated/dual paths, direct interaction-class ownership, continuous Dialogue semantics, explicit capture scope and independent row-level schema/UX/visual acceptance. Evidence generation success alone cannot satisfy IA26.; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`-`SD29`; QA4/QA5/QA6 | `IA27`-`IA34`; IA38/IA39 | IA35–IA38 atomic cutover; IA39 proof | Retain conforming shared theme/role/structural APIs; correct evidenced local composition and theme-role residuals only. Proof: tests/browser.spec.ts; tests/certification.test.ts + rendered acceptance + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `VERIFICATION_DELTA` | `SD21`-`SD29`; QA4/QA5/QA6 | `IA27`-`IA34`; IA38/IA39 | IA35–IA38 atomic cutover; IA39 proof | Retain evidenced shared role and structural APIs; complete representative consumer/rendered consistency proof. Proof: tests/browser.spec.ts; tests/certification.test.ts + rendered acceptance + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30`; QA4/QA5/QA6 | `IA27`, `IA28`-`IA34`, `IA26`; IA38/IA39 | IA35–IA38 atomic cutover; IA39 proof | Retain one root theme owner; prove representative cross-service theme parity and separately allocated local residuals. Proof: tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + rendered acceptance + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |

Stable rows in phase: **7**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02/C19-F03/C19-F04/C19-F05/C19-F06/C19-F07/C19-F08/C19-F09 | `SD21`-`SD29` | `IA27`-`IA34` | — | Consume the SD21/F6B semantic component architecture through the one IA27-IA34 catalog. Existing conforming/required-absent owners are retained, with exact bounded residuals; every affected renderer is revalidated and unauthorized substitute grammar is rejected. Current bytes never become preservation authority. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |
| `PL-C20-03` | C20-F05/C20-F06/C20-F07/C20-F08/C20-F09/C20-F10/C20-F11 | `SD30` | `IA26` | — | IA26 proves the 38-SURF rendered union plus semantic-component API/consumer/physical-SoC closure. Evidence rows retain explicit governed scope and separate schema_information/ux_interaction/visual_ui verdicts; a green capture job alone is not acceptance. |

Package atoms in phase: **5**.

## Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA20** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA22** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the single IA27-IA34 definitions in `12-action-catalog.md`; this phase owns no duplicate renderer/component implementation procedure.
- **IA26** — consume the exact-candidate rendered acceptance definition for PL-C20-03.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


## Realization trace consequence

IA20/21/22/23/26 consume complete P3 §23 allocation in closeout and 38 DESIGN datum/action contracts. Phase-local and final proof are independent. Fixture/reference maintenance is SD30 verification only.

### A09/A10 installation certification dependency

IA25 owns the executable transaction matrix and actual-orchestrator evidence; A11 verifies complete allocation and exact candidate results alongside IA23 integrated proof. Helper-level and structural assertions alone cannot discharge transaction fault-injection cases, including AUD-01/02 established v3/v4 recovery and per-file SQLite archive/restore custody. No separate installation certification framework or new proof-only production policy.

## Native Acceptance integration

QA integration: IA38 uses existing Review/Form/ResourceList/Evidence with one new AcceptanceWorkspace; no new structural primitive. IA39 allocates scenario 47 and SURF-STEP-ACCEPTANCE-001, adds affected prior surface/state proof, no loss of 37/46/HUX. Pre-signoff protected architecture sensor registration and reference target revalidation are mandatory; no T1 mutation of the sensor.
