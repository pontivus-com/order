# A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** current R1 `9f99a885da3757afad112dfd5d9d5e26782c41f9`; current R2 `7a279895bd57a2ec7080e1404927ce0668f1dbaf`; current DESIGN `fbb92bc467866e5ceb0a1b017d73329e28378568`.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Permanently prove the actual OpenCode 2.2.6 process/session boundary through `tests/opencode.test.ts` and `.github/workflows/ci.yml`, using exact isolated `opencode-drive@2.4.1` + `effect@4.0.1` deterministic model simulation; retain existing daemon/certification fake-provider fixtures as complementary proof and explicitly exclude remote-provider/OAuth/model-quality claims + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | `IA15`, `IA20`, `IA21`, `IA22`, `IA26` | — | Existing semantic/state certification remains mandatory and exact-candidate rendered acceptance is added across the complete governed UI surface, including productive-surface absence, singular inspection ownership, composition invariants and active-state capture proof required by C20-F06/C20-F07. |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12`, `C19-F03`, `C19-F04`, `C19-F05` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Revalidate/remediate the already-realized IA27 foundation and IA28-IA31 screen families against current authority, then destructively replace IA32-IA34. Every renderer must realize the corrected P3/P4 information/composition contract: one material/history owner, singular Context/Settings technical inspection, no generic local technical/supporting bars, task-dialog header/body/footer anatomy and editor-control→canvas adjacency. Current baseline bytes are evidence only and rendered proof is required. |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Equivalent roles must resolve through the authority-conforming shared composition foundation or positively retained atomic adapters rather than feature-specific presentation; revalidate the resumed foundation/screens first, then certify the full screen system after remaining reconstruction. |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | `IA27`, `IA28`-`IA34`, `IA26` | — | Root theme preference semantics remain; the already-realized primitive/CSS foundation is independently revalidated/remediated and all resumed/fresh screens consume that accepted owner; parity is re-proved through semantic + rendered evidence. |

Stable rows in phase: **7**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02/C19-F03/C19-F04/C19-F05 | `SD21`-`SD29` | `IA27`-`IA34` | — | From the corrected Approval baseline, reconstruct IA27 against SD21 including design-bearing Disclosure/Review/TaskPanel and the early selection-aware Context owner; then revalidate/remediate IA28-IA31 and reconstruct IA32-IA34 against the exhaustive per-datum **and composition** contract in `solution-design.md`. Historical purge provenance does not become current-task work, current bytes are never preservation authority, and implementation performs no information classification. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |
| `PL-C20-03` | C20-F05/C20-F06/C20-F07 | `SD30` | `IA26` | — | Exact-candidate GitHub Actions evidence covers every governed screen/state and all three acceptance dimensions with no unresolved FAIL; proof includes required-visible information, productive-surface technical absence, singular inspection/material ownership, no disclosure accumulation, active editor capture, modal anatomy and authorized Context/Settings/Evidence/confirmation inspection. |

Package atoms in phase: **5**.

## Referenced actions

- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA20** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA22** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the resumed-baseline IA27-IA31 revalidation/remediation and fresh IA32-IA34 reconstruction definitions for PL-C19-02 plus the exact phase-owned `SURF-*` rows from the exhaustive DESIGN information contract; IA27 owns the shared foundation **and WorkItem technical-inspection owner**; all later phases consume it and may not recreate local technical drawers. A11 owns cross-domain closure, not duplicate renderer implementation or field classification.
- **IA26** — consume the exact-candidate rendered acceptance definition for PL-C20-03.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.
