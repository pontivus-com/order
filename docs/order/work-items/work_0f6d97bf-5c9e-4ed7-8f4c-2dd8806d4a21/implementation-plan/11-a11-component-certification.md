# A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** current R1 `99f6932e582bde949de72716f29ea0868eba16a0`; current R2 `27faa1a67321c8091deb27a4fd70ae912209c30a`; current DESIGN `e0c9a4704fb63af6ac55b4ff2df60f641b6d64d5`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Permanently prove the actual OpenCode 2.2.6 process/session boundary through `tests/opencode.test.ts` and `.github/workflows/ci.yml`, using exact isolated `opencode-drive@2.4.1` + `effect@4.0.1` deterministic model simulation; retain existing daemon/certification fake-provider fixtures as complementary proof and explicitly exclude remote-provider/OAuth/model-quality claims + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | `IA15`, `IA20`, `IA21`, `IA22`, `IA26` | — | Existing semantic/state certification remains mandatory and exact-candidate rendered acceptance is added across the complete governed UI surface, including negative default-hidden and positive post-disclosure proof required by C20-F06. |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12`, `C19-F03` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Destructively reconstruct/certify the canonical primitive/theme foundation from current authority, then destructively replace every screen family. Each renderer must realize the canonical P3/P4 information classes/default visibility/disclosure ownership and delete competing legacy presentation ownership; rendered proof required. |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Equivalent roles must resolve through the freshly reconstructed shared composition foundation or positively retained atomic adapters rather than feature-specific presentation; certify foundation first and screen system again after destructive replacement. |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | `IA27`, `IA28`-`IA34`, `IA26` | — | Root theme preference semantics remain, but design-bearing primitive/CSS realization is reconstructed; replacement screens consume the accepted foundation and parity is re-proved through semantic + rendered evidence. |

Stable rows in phase: **7**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02/C19-F03 | `SD21`-`SD29` | `IA27`-`IA34` | — | Purge and reconstruct the design-bearing primitive/theme foundation first, then destructively replace the complete screen layer from explicit per-datum Primary/Supporting/Operational/Technical/Diagnostic visibility/disclosure schemas; forbid reuse of both pre-purge foundation composition and pre-purge screen composition. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |
| `PL-C20-03` | C20-F05/C20-F06 | `SD30` | `IA26` | — | Exact-candidate GitHub Actions evidence covers every governed screen/state and all three acceptance dimensions with no unresolved FAIL; schema/information proof includes required-visible, default-hidden and authorized post-disclosure assertions. |

Package atoms in phase: **5**.

## Referenced actions

- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA20** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA22** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the single foundation-first/domain-reconstruction definitions for PL-C19-02; IA27 owns the shared foundation and IA28-IA34 consume it. A11 owns cross-domain closure, not duplicate renderer implementation.
- **IA26** — consume the exact-candidate rendered acceptance definition for PL-C20-03.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
