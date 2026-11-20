<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`READY_FOR_SIGNOFF`.

This is the fresh adversarial R3 for the **primitive-preserving, destructive screen-replacement** 0.6.0 package. It determines whether the exact current R1/R2/DESIGN/PLAN package is complete and unambiguous enough to sign for implementation. It does **not** claim that the replacement screens already exist, does not satisfy T11 rendered acceptance, and does not authorize PR #83 merge/release.

Exact reviewed package:

- repository evidence baseline: `3022596aeadcf00b69f2cd8b6c7bc56522f3e0d6`;
- WorkItem: `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`, project `order`, schema `change-v2`;
- R1 `research.md`: `d2eb1627e2b9a145f785b04829b56c623b7431e9`;
- R2 `requirements.md`: `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`;
- DESIGN `solution-design.md`: `f21d1530b01a43e28be47742236b339770022059`;
- PLAN `implementation-plan.md`: `5e7b1aba387a5720e5e23a1013dd8a66c1a6d060`;
- pre-R3 campaign state: `ce33c94cb9fdcf0f14a29b47a0032b411f8a6068`;
- permanent architecture/campaign sensor: `85d49a9493d45d10e85a34a72d77479f99971c1e`;
- PR Verification #1771 / Actions run `44836026174`: dependency-lock, typecheck and strengthened architecture/package checks were green at R3 review time. This is package fitness evidence only, not proof that the screen replacement tasks have executed.

## Adversarial challenge summary

| Challenge | Result | R3 disposition |
|---|---|---|
| R3-P01 — current screens are evidence, not desired-state authority | PASS | R2 explicitly states that pre-reconstruction screen implementations are not preservation, compatibility, migration or information-design baselines. |
| R3-P02 — primitive boundary is exact | PASS | `ui/src/primitives/**` is retained read-only capability for this campaign. T2 does not rebuild primitives; it certifies them and removes obsolete screen-support/compatibility CSS only. A genuine primitive defect must return upstream to DESIGN. |
| R3-P03 — old screens are actually removed before replacement | PASS | IA28-IA34 and T3-T9 require a task-local Git purge checkpoint deleting owned old screen files before any replacement JSX/DOM is authored. Final-state similarity cannot substitute for this deletion evidence. |
| R3-P04 — no old screen implementation can leak forward as a template | PASS | Copying or incrementally transforming old JSX/DOM hierarchy, field grouping, table-column design, card/panel structure, action placement, responsive markup, screen-local CSS/classes or visual hierarchy is explicitly a task breach. |
| R3-P05 — replacement screens have fresh information design | PASS | R2 defines a design-time screen-information schema covering Primary, Supporting, Technical information, actions, material states, responsive order and work-kind/stage differences. The schema is not a DTO/browser state family. |
| R3-P06 — complete screen replacement set | PASS | DESIGN enumerates the exact 23 old screen/composition paths to be destructively replaced: application/Queue/Create, WorkItem shell/document, productive pre-signoff, Readiness/Approval, Implementation, Complete/Evidence/Context and Settings/account screens. |
| R3-P07 — retained capability is not accidentally mutable | PASS | PLAN excludes primitives, Markdown editor leaves, pure presentation policy and query/API helpers from the mutable forecast. The exact cumulative `changeSurface` is 43 paths. The permanent architecture sensor rejects primitive/helper mutation. |
| R3-P08 — screen logic embedded in old files cannot be silently salvaged | PASS | If required non-visual behavior exists only inside a discarded screen file, implementation must consume a canonical underlying owner or return upstream for an architecture-preserving extraction decision. Existence in old screen code is not reuse authority. |
| R3-P09 — task ordering prevents regression | PASS | T2 establishes the retained primitive/CSS-purge boundary. T3-T9 each purge then recreate one screen family and must pass fresh schema + semantic + rendered review before the dependent task starts. T10 is verification-only; T11 is rendered acceptance/closeout. |
| R3-P10 — minimum change is applied at the correct layer | PASS | Minimum change preserves domain/contracts/lifecycle/query/primitives. It does not preserve defective screens. Destructive replacement is the minimum authority-compliant change at the screen layer. |
| R3-P11 — proof is independent of implementation self-assertion | PASS | T10 proves screen classification, primitive containment, absence of compatibility screen grammar, responsive/theme semantics and cross-solution regression. T11 independently evaluates schema/information, UX/interaction and visual/UI fidelity from exact-candidate rendered evidence. |
| R3-P12 — no residual implementation choice | PASS | Screen owners, purge paths, retained dependencies, information contracts, primitive composition, forbidden reuse, responsive ownership, proof requirements and failure routes are explicit. The worker is not asked to decide whether to preserve old screen structure. |

## Retained capability

The implementation may preserve and reuse only the already-authorized capability boundary:

- canonical `ui/src/primitives/**` Workbench primitives;
- `MarkdownEditor` / `MarkdownSourceEditor` as specialized content leaves only;
- `workbench-presentation.ts` as pure presentation policy;
- HTTP/query-key/formatting/theme/bootstrap helpers in their current non-screen responsibilities;
- canonical core/daemon/query/persistence/provider/lifecycle owners.

Shared `theme.css` / `styles.css` are not blank-slate rewrites: T2 may remove legacy screen-support/compatibility selectors while retaining the primitive/theme/global rules required by current P4/P5.

## Destructive screen replacement set

The following existing screen/composition implementations are explicitly disposable and must be deleted before replacement authorship:

- `app.tsx`, `WorkItemQueue.tsx`, `CreateWorkItem.tsx`;
- `WorkItemWorkspace.tsx`, `WorkItemIdentityRow.tsx`, `WorkflowRail.tsx`, `WorkflowStepFrame.tsx`, `DocumentWorkspace.tsx`;
- `PreSignoffStageWorkspace.tsx`, `ActivityWorkspace.tsx`, `ActivityComposer.tsx`, `WorkflowMaterialSelector.tsx`, `ProposalReview.tsx`, `RunEventTimeline.tsx`;
- `ReadinessWorkspace.tsx`, `SignoffReview.tsx`;
- `ExecutionWorkspace.tsx`;
- `TerminalResult.tsx`, `EvidenceViewer.tsx`, `WorkItemContext.tsx`;
- `SettingsWorkspace.tsx`, `OpenCodeAccountControl.tsx`, `OpenCodeAccountSettings.tsx`.

The old files may be inspected before purge only as defect evidence or to locate canonical underlying owners. Their screen composition is never a baseline.

## Signed execution sequence

1. **T1 — non-UI baseline:** preserve/revalidate already-correct non-screen 0.6.0 work.
2. **T2 — retained primitive boundary:** certify primitives unchanged; purge shared legacy screen-support/compatibility CSS; author no replacement screen.
3. **T3 — Queue/Create:** purge three old paths, review fresh screen schemas, recreate from retained primitives.
4. **T4 — WorkItem shell/Work request/document:** purge five old screen paths, retain Markdown editors as content leaves, recreate shell/document screens.
5. **T5 — productive pre-signoff:** purge six old screen/adapters, recreate Research/Requirements/Solution design/Plan from fresh schemas.
6. **T6 — Readiness/Approval:** purge two old review screens, recreate fresh Review compositions.
7. **T7 — Implementation:** purge old execution screen, recreate canonical master/detail.
8. **T8 — Complete/Evidence/Context:** purge three old screens, recreate terminal/material screens.
9. **T9 — Settings/account/configuration:** purge three old screens, recreate operator-first configuration screens.
10. **T10 — unified certification:** verification only; production defects route to T2-T9 or DESIGN.
11. **T11 — rendered acceptance/closeout:** exhaustive exact-candidate evidence and final gates.

The exact mutable forecast is **43 paths**. The exact destructive replacement set is **23 screen/composition paths**. The package still closes 144 vertical obligations: 112 stable requirements + 27 package-local atoms + 5 corrected-upstream no-code traces.

## Purge-before-rebuild evidence standard

For T3-T9, task completion requires retained evidence of:

1. a purge checkpoint commit that deletes all task-owned old screen files and contains no replacement screen JSX/DOM;
2. the fresh R2-derived screen-information-schema review;
3. replacement commits after the purge checkpoint;
4. proof that retained primitives/helpers were not modified for screen convenience;
5. task-specific semantic/browser proof;
6. task-specific rendered review with zero unresolved FAIL.

A visually correct final screen does not pass if the task cannot prove that the old implementation was removed before replacement.

## Rendered acceptance boundary

T11 cannot close on aggregate screenshot judgment. Every required evidence row must independently PASS:

- schema/information fidelity;
- UX/interaction fidelity;
- visual/UI fidelity.

Any screen-level FAIL reopens T3-T9. A shared stylesheet-purge defect reopens T2. A genuine primitive defect returns to DESIGN. Pixel matching alone remains insufficient and SVGs remain derived comparison material rather than semantic authority.

## Findings

No blocking R3 finding remains.

The prior R3 and prior 73-path/primitive-rebuild package are superseded historical evidence. They cannot authorize current sign-off or implementation.

## Final R3 disposition

**Verdict:** `READY_FOR_SIGNOFF`.

The exact current package is sufficiently complete and unambiguous to be explicitly signed for implementation. Sign-off authorizes only execution of the signed T1-T11 task graph under the destructive screen-replacement law. It does not authorize retaining or incrementally refactoring the old screens, does not mean T2-T11 are complete, and does not authorize PR merge/release.
