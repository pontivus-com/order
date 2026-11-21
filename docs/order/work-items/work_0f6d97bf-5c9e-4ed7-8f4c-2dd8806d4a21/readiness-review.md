<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`READY_FOR_SIGNOFF`.

This is the fresh adversarial R3 for the corrected **primitive-preserving, face-exact destructive screen-replacement** 0.6.0 package. It determines whether the exact current R1/R2/DESIGN/PLAN package is complete and unambiguous enough to sign for implementation. It does **not** claim that replacement screens already exist, does not satisfy T2-T11 implementation or rendered acceptance, and does not authorize PR #83 merge/release.

Exact reviewed package:

- repository evidence baseline: `c1122a6043087b45624f6de89473002faaa72292`;
- WorkItem: `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`, project `order`, schema `change-v2`;
- R1 `research.md`: `d2eb1627e2b9a145f785b04829b56c623b7431e9`;
- R2 `requirements.md`: `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`;
- DESIGN `solution-design.md`: `1bf09de0e125601c07f1112d5b5c217646c73ddc`;
- PLAN `implementation-plan.md`: `6b48668397433c2949de3dc26baa1f9af8f823c0`;
- pre-R3 campaign state: `0c8b1c631c74e7ad248d0fc3e74a160704723efa`;
- permanent architecture/campaign sensor: `371fe08fd4c63d5e5e357b2fa7c9314ccc169e9b`;
- P4 Workbench architecture: `5573044c3370050102f42a43f2173e272adad816`;
- reviewed SVG reference index: `c93314c10d46c3fc234c49d96c0eaef26ae5c8b9`;
- PR Verification / Actions run `44842376504`: dependency-lock, typecheck, architecture/package fitness, full tests, build, release-packager verification, browser and rendered-evidence generation all succeeded on the exact corrected package baseline.

## Adversarial challenge summary

| Challenge | Result | R3 disposition |
|---|---|---|
| R3-F01 — current screens remain evidence only | PASS | R2 and PLAN prohibit old JSX/DOM hierarchy, field grouping, cards/panels, table design, action placement, responsive branches, screen-local CSS/classes and visual hierarchy from becoming implementation ancestry. |
| R3-F02 — primitive boundary is current and unambiguous | PASS | P4 now explicitly marks the PR #59 primitive-incompleteness wording as historical baseline evidence. Current `ui/src/primitives/**` is read-only retained capability; a genuine primitive defect returns to DESIGN. |
| R3-F03 — T2 CSS reset is executable rather than self-defeating | PASS | SD21/IA27/T2 delete only cross-cutting obsolete compatibility rules, retain an exact legacy-selector→T3-T9 owner ledger, prohibit weakening authority-backed browser assertions, and require each screen task to delete its remaining owned selectors with its screen purge. |
| R3-F04 — global OpenCode account visibility has the correct face owner | PASS | `GW-FR-073` remains the semantic authority. SD22/IA28/T3 now rebuild `OpenCodeAccountControl.tsx` with the application shell as current-state/quick-access only; SD28/IA34/T9 remains the sole full account-management owner. |
| R3-F05 — Queue/Create reference material matches current authority | PASS | The reviewed SVG pack uses `Concerns`, not “Concern IDs”, and the application/workflow toolbar references include the canonical active-account/status affordance without fabricating credential state. |
| R3-F06 — chronology has one reconstruction owner | PASS | SD24/IA30/T5 reconstructs `RunEventTimeline.tsx` once. SD26/IA32/T7 consumes that replacement and owns only `ExecutionWorkspace.tsx`; no duplicate chronology adapter or semantic owner exists. |
| R3-F07 — destructive screen replacement set is complete | PASS | The exact set remains 23 screen/composition paths. T3 owns four application-shell/Queue/Create paths including `OpenCodeAccountControl.tsx`; T9 owns only the two Settings/account-management screens. |
| R3-F08 — every rebuilt face has an exact task owner | PASS | PLAN partitions the complete 37-row `SURF-*` registry exactly once across T3-T9: 3 + 9 + 6 + 3 + 2 + 3 + 11. The permanent architecture sensor rejects duplicates, omissions and task/file ownership drift. |
| R3-F09 — task-local rendered acceptance is blocking | PASS | Every T3-T9 task must PASS its exact owned faces for `schema_information`, `ux_interaction` and `visual_ui` before the dependent task starts. T11 independently rechecks the complete union and materially distinct state/theme/responsive references. |
| R3-F10 — screen information remains authority-derived | PASS | Each task requires a fresh design-time screen-information schema from R2/P3/P4 before replacement authorship; the schema is trace evidence only, not a DTO, browser-state family or second semantic owner. |
| R3-F11 — retained helpers cannot become compatibility escape hatches | PASS | Primitives, Markdown editors, presentation policy and query/API helpers are excluded from screen-task mutation. Same-layer variance cannot be used to mutate them for convenience; contradiction returns upstream. |
| R3-F12 — signed execution is mechanically exact | PASS | Root PLAN exactly compiles 14/14 modular sources, contains 11 signed tasks, has a 43-path unique mutable union, retains the 23-path destructive screen set and binds the six logical gates in dependency order. |
| R3-F13 — no stale structural/package statements remain | PASS | The obsolete 28→30 sensor narrative, duplicate T11 validation reference and H1 73-path statement are removed/corrected to the current 43-path package. |
| R3-F14 — implementation completion cannot be inferred from package readiness | PASS | This R3 authorizes only explicit human sign-off of the corrected plan. Existing screens remain unimplemented replacement targets until T2-T11 execute and T11 has zero unresolved rendered FAIL. |

## Retained capability

The implementation may preserve and reuse only the authorized capability boundary:

- canonical `ui/src/primitives/**` Workbench primitives;
- `MarkdownEditor` / `MarkdownSourceEditor` as specialized content leaves only;
- `workbench-presentation.ts` as pure presentation policy;
- HTTP/query-key/formatting/theme/bootstrap helpers in their non-screen responsibilities;
- canonical core/daemon/query/persistence/provider/lifecycle owners.

Shared `theme.css` / `styles.css` are governed by the executable T2 split: primitive/global foundation stays; T2 removes cross-cutting obsolete compatibility rules; task-owned legacy selectors survive only until their exact T3-T9 purge and cannot survive that task.

## Destructive replacement and face ownership

The exact destructive replacement set remains 23 screen/composition paths. Ownership is now face-exact:

- T3 — application shell / active OpenCode-account quick access / Queue / Create: 4 screen paths; 3 `SURF-*` rows.
- T4 — WorkItem shell / Work request / document: 5 screen paths; 9 rows.
- T5 — Research / Requirements / Solution design / Plan productive-stage family: 6 screen paths; 6 rows.
- T6 — Readiness / Approval: 2 screen paths; 3 rows.
- T7 — Implementation: 1 screen path; 2 rows; consumes T5's shared timeline.
- T8 — Complete / Evidence / Context: 3 screen paths; 3 rows.
- T9 — Settings / account-management configuration: 2 screen paths; 11 rows.

The rendered-face union is exactly 37 unique rows with no overlap or omission.

## Purge-before-rebuild evidence standard

For every T3-T9 task, completion requires:

1. a Git purge checkpoint deleting all task-owned old screen files and every legacy selector assigned to that task, with no replacement screen JSX/DOM;
2. fresh R2/P3/P4-derived screen-information-schema review;
3. replacement commits after the purge checkpoint;
4. proof retained primitives/helpers were not modified for screen convenience;
5. task-specific semantic/browser proof;
6. explicit PASS/FAIL for every task-owned rendered face in all three dimensions;
7. no dependency advance while any owned face is FAIL or unreviewed.

A visually acceptable final screen cannot compensate for missing purge provenance, and successful semantic tests cannot substitute for rendered face acceptance.

## Terminal rendered acceptance boundary

T11 independently captures and reviews the exact implementation candidate against the reviewed SVG reference pack and current authority. It must cover all 37 `SURF-*` rows, all nine workflow-step references, material state sheets, applicable four-kind differences, wide/narrow composition and System/Light/Dark behavior.

Every evidence row independently records:

- `schema_information`;
- `ux_interaction`;
- `visual_ui`.

Each is `PASS` or `FAIL`. No aggregate-only pass, unreviewed row or screenshot blessing can reach closeout. Current authority supersedes a reference SVG only when the exact authority delta is recorded.

## Findings

No blocking R3 finding remains.

The prior R3 `96f5cb288441b7b6e02a62451f8a5488c49379d7` is superseded historical evidence because it reviewed the pre-face-audit DESIGN/PLAN package. It cannot authorize current implementation.

## Final R3 disposition

**Verdict:** `READY_FOR_SIGNOFF`.

The corrected exact package is complete and unambiguous enough for explicit human sign-off. Sign-off authorizes only execution of the signed T1-T11 graph under the face-exact destructive-replacement law. It does not authorize incremental repair of old screens, does not mean any replacement face is implemented, and does not authorize PR merge or release.
