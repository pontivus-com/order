<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`READY_FOR_SIGNOFF`.

This is the fresh adversarial R3 for the reconstructed 0.6.0 Workbench package. It evaluates whether the exact current R1/R2/DESIGN/PLAN package is complete, internally coherent and implementation-ready. It does **not** claim that the UI reconstruction has already been implemented, does not satisfy T11 rendered acceptance, and does not authorize PR #83 merge, release, version bump, tag or publication.

Exact reviewed package:

- repository evidence baseline: `34c022f26b6ed67545caf1264eb6403c57862674`;
- WorkItem: `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`, project `order`, schema `change-v2`;
- R1 `research.md`: `d2eb1627e2b9a145f785b04829b56c623b7431e9`;
- R2 `requirements.md`: `e01ce75ee0ece676c195a46f810186c24814e11f`;
- DESIGN `solution-design.md`: `ceedee6d695b2384de86f194dacf7166662f9d96`;
- PLAN `implementation-plan.md`: `11135e69880a4d77a8a548bc53dbe79af76f2fa4`;
- pre-R3 campaign state: `ec4ce127b38e28a331381d236f761ebbc0f60013`;
- permanent architecture/campaign sensor: `a6f25b3429c6a45932492d4929e78bfc6ce662d0`;
- PR Verification #1745 / Actions run `44833230625`: dependency-lock, typecheck, architecture, full test and build were green at R3 review time. This is package/baseline fitness evidence only, not proof that T2-T11 have been executed.

## Adversarial challenge summary

| Challenge | Result | R3 disposition |
|---|---|---|
| R3-P01 — authority-driven package rather than current-UI preservation | PASS | R2 remains authority-derived. Current UI/screenshots are defect evidence only; they are not a preservation or compatibility target. |
| R3-P02 — structural root cause is solved rather than cosmetically patched | PASS | C19-F02 is solved at DESIGN by SD21-SD29: rebuild the shared primitive/theme foundation, migrate every renderer family, and delete competing feature-era presentation ownership. Screen-by-screen CSS tuning on the old foundation is explicitly forbidden. |
| R3-P03 — complete workflow/screen information coverage | PASS | R2 explicitly covers all four work kinds and every applicable lifecycle step, with Primary/Supporting/Technical hierarchy and interaction class. SD22-SD28 map Queue/Create, WorkItem shell/documents, productive pre-signoff stages, Readiness/Approval, Implementation, Complete/Evidence/Context and Settings. |
| R3-P04 — singular implementation ownership and ordering | PASS | PLAN has 11 signed tasks in the strict T1→T11 chain. T2 exclusively owns `ui/src/primitives/**`, `ui/src/theme.css` and `ui/src/styles.css`; T3-T9 consume that foundation and are forbidden from modifying it. Foundation insufficiency routes back to T2/DESIGN rather than local override work. |
| R3-P05 — deletion/replacement is explicit | PASS | IA27-IA34 require removal of obsolete recurring component/layout CSS, feature-owned grammar, alternate execution/card layouts, generic review frames and bespoke Settings/admin systems. Compatibility presentation paths, hidden legacy DOM grammar and local CSS bypasses are prohibited. |
| R3-P06 — architecture integrity | PASS | Domain/core/daemon/query/persistence/provider semantics remain singular. No new DTO, OOP/service/repository/controller layer, second authority/state graph, alternate provider path or new product/runtime dependency is introduced. |
| R3-P07 — proof is sufficient and independent | PASS | T10 owns semantic/component/theme/responsive certification. T11/SD30/IA26 owns exact-candidate rendered acceptance with PNG+manifest/index evidence and independent schema/information, UX/interaction and visual/UI verdicts. Screenshot review supplements rather than replaces semantic/browser proof. |
| R3-P08 — executable scope/traceability | PASS | 112 stable requirements + 27 package-local atoms + 5 corrected-upstream no-code traces = 144 explicit vertical obligations. SD01-SD30, IA01-IA34 and the exact 73-path task-union forecast are bidirectionally traced; G5A records Q1-Q12 PROVEN across A01-A11/H1. |
| R3-P09 — failure/recovery and negative boundaries | PASS | Each UI migration has forbidden alternatives and proof obligations. Any task failure remains in its owning task; a downstream foundation problem reopens T2; any rendered acceptance FAIL reopens the defective T2-T9 owner and requires fresh exact-candidate evidence. |
| R3-P10 — no residual worker design inference | PASS | Task objectives, dependencies, files, deletion duties, forbidden alternatives, acceptance refs, proof owners, gate IDs and stop/go checkpoints are explicit. The worker is not asked to choose product hierarchy, interaction grammar, primitive ownership, responsive topology or acceptance criteria. |

## Task-graph readiness

The signed execution order is accepted as the minimum auditable reconstruction:

1. **T1 — non-UI baseline:** preserve/revalidate already-correct SD01-SD20 technical corrections.
2. **T2 — Workbench foundation:** rebuild primitives/theme/styles and delete competing presentation foundations.
3. **T3 — Queue/Create:** Operational scan + Form/configuration.
4. **T4 — WorkItem shell/Work request/documents:** stable identity/rail/attention/material shell.
5. **T5 — Research/Requirements/Solution design/Plan:** one productive pre-signoff interaction grammar.
6. **T6 — Readiness/Approval:** canonical Review compositions.
7. **T7 — Implementation:** canonical operational master/detail.
8. **T8 — Complete/Evidence/Context:** terminal/material presentation.
9. **T9 — Settings/OpenCode/account/configuration:** operator-first Settings grammar.
10. **T10 — unified certification:** verification-only component/theme/responsive/scenario regression closure.
11. **T11 — rendered acceptance and closeout:** exhaustive exact-candidate evidence, row-level review, then final V0-V7/IA24.

Each signed task retains the six logical gate IDs. The task-boundary contract additionally requires architecture plus task-specific semantic/rendered evidence before a dependent presentation task starts.

## Rendered evidence boundary

The reviewed SVG set under `docs/references/workbench-ui/` is derived comparison material, not semantic authority. Current R2/DESIGN/P3-P6 authority wins on conflict.

T11 cannot close on an aggregate screenshot judgment. Every required evidence row must independently PASS:

1. schema/information fidelity;
2. UX/interaction fidelity;
3. visual/UI fidelity.

A material divergence is a blocking FAIL unless an exact newer authority is recorded as superseding the reference. Pixel-diff threshold alone is insufficient.

## Minimum-change and preservation decision

Minimum change means **preserve the correct semantic architecture while replacing the incorrect presentation realization**. It does not mean retain the current UI structure because it exists.

Preserved:
- lifecycle/work-kind/stage semantics;
- canonical contracts and persistence;
- daemon/API/query ownership;
- proposal/adoption, sign-off, execution and provider semantics;
- exact Markdown/Git/freshness rules.

Rebuilt/replaced:
- Workbench primitive implementations where required;
- recurring theme/layout/component presentation;
- application shell/Queue/Create composition;
- every governed renderer family;
- responsive composition;
- obsolete presentation selectors/branches and duplicate visual grammar.

## Findings

No blocking R3 finding remains.

The historical pre-reconstruction implementation candidate and historical `READY_FOR_SIGNOFF` review remain evidence only. They are not accepted as implementation proof for SD21-SD30.

## Final R3 disposition

**Verdict:** `READY_FOR_SIGNOFF`.

The exact current package is sufficiently complete and unambiguous to be signed for implementation. Sign-off would authorize execution of the signed T1-T11 task graph only. It would not mean the reconstruction is complete and would not authorize repository merge/release. Completion requires successful task execution, T10 certification, T11 rendered acceptance with zero unresolved FAIL, and the final execution/closeout gates.
