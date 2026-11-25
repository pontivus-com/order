# A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `47d5b1d5e34d2407e601564dde41eb3fe1825602`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Permanently prove the actual OpenCode 2.2.6 process/session boundary through `tests/opencode.test.ts` and `.github/workflows/ci.yml`, using exact isolated `opencode-drive@2.4.1` + `effect@4.0.1` deterministic model simulation; retain existing daemon/certification fake-provider fixtures as complementary proof and explicitly exclude remote-provider/OAuth/model-quality claims + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | `IA15`, `IA20`, `IA21`, `IA22`, `IA26` | — | Permanent certification proves required absence of generic workflow frame/material-selector APIs, closed primitive consumer allowlists, no compatibility/deprecated/dual paths, direct interaction-class ownership, continuous Dialogue semantics, explicit capture scope and independent row-level schema/UX/visual acceptance. Evidence generation success alone cannot satisfy IA26. |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12`, `C19-F03`, `C19-F04`, `C19-F05` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | SD21/F6B remains the closed semantic-component design. Bounded IA27 realizes only the compile-closed shell/Context + Section/Facts slice and required-absent generic owners; post-signoff IA27 atomically cuts over ResourceRow/ResourceList across all callers; IA29/IA31/IA33 cut over Document/Review/Result with complete consumer sets. IA28-IA34 realize their exact renderer dispositions. Compatibility adapters remain forbidden and current bytes are evidence only. |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Equivalent roles resolve through one closed primitive API with an explicit production-consumer allowlist. A consumer that cannot fit is rewritten to the correct interaction class; no wrapper/alias/adapter may make a superseded composition fit. |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | `IA27`, `IA28`-`IA34`, `IA26` | — | Root theme preference semantics remain; the corrected semantic component foundation consumes the same canonical theme roles and every affected renderer is freshly revalidated. Parity is re-proved through semantic + rendered evidence with no feature-local component styling grammar. |

Stable rows in phase: **7**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02/C19-F03/C19-F04/C19-F05/C19-F06/C19-F07/C19-F08/C19-F09 | `SD21`-`SD29` | `IA27`-`IA34` | — | Consume the SD21/F6B semantic component architecture through the one IA27-IA34 catalog. Required-new/decompose/destructive/absent dispositions are explicit there; every affected renderer is revalidated and feature-local substitute grammar is removed. Current bytes never become preservation authority. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |
| `PL-C20-03` | C20-F05/C20-F06/C20-F07/C20-F08/C20-F09/C20-F10/C20-F11 | `SD30` | `IA26` | — | IA26 proves the 37-SURF rendered union plus semantic-component API/consumer/physical-SoC closure. Evidence rows retain explicit governed scope and separate schema_information/ux_interaction/visual_ui verdicts; a green capture job alone is not acceptance. |

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
