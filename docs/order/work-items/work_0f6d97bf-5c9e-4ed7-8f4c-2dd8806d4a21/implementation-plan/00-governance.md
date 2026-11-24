# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is revalidated under C19-F09/C20-F11 after the prior G4-G6 closure was invalidated. Historical PLAN structure, current implementation/UI/tests, prior releases, prior RZ16 acceptance and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts.

## Exact upstream package

- R1 `research.md`: `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`.
- R2 `requirements.md`: `e1e53c493f405610f6f73d3e8b83084b91e7db9e`.
- DESIGN `solution-design.md`: `44cc163332906514ec3cfeb5f181aedb8b989237` — owns the closed 0.6.0 datum→semantic-component→composition mapping, F6B physical component realization and 76-path forecast.
- Corrected P3 `GW-DOC-INSTALLATION-READINESS`: `9c2ec83a9552b7583f90e91080c014df4d6870df`.
- P3 `GW-DOC-WORKBENCH-UX-V2`: `d47173839201c68937bdb4c840d0273dec5bcffc` — §11.4A/§12/§13/§14 own semantic information classes, state-is-not-interface behavior, direct primary interaction composition, no generic workflow-material selector, continuous Dialogue semantics, Terminal-result primacy, singular technical inspection, task anatomy and composition invariants.
- P3 `GW-DOC-MARKDOWN-WORKBENCH-V1`: `1cc5a28eff8d180f88106d89990f7b89aa27a132` — §17.4 owns one compact Markdown editor-control region, overflow-before-wrap formatting and control→canvas adjacency.
- P4 `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`: `9f05647f14fa43309d46457f30d66ca48b0b182f` — sole permanent owner of structural + semantic Workbench component responsibilities/APIs, consumer boundaries, composition laws and remediation disposition semantics.
- P4 `GW-DOC-WORKBENCH-THEME-V1`: `43b81a61291841d827a47f392e0149ace5c8351f` — owns the corrected semantic-disclosure, technical-inspection and task-panel visual roles.
- P6 `GW-DOC-CANONICAL-CONTRACTS-V2`: `71f829cff8824db18194689eccdec83da6f5d19f`.
- SD13 checkpoint and SD10 scope/forecast/V4-V6 realization are consumed only because current DESIGN positively proves those canonical capabilities; T1 does not reimplement them.

## Traceability law

Every stable P3 requirement and every package-local atomic obligation follows:

```text
canonical P3 / package consequence
 -> exact current R1 evidence
 -> exact current R2 consequence
 -> exact DESIGN disposition
 -> one IA implementation owner, one DESIGN-positive-reuse proof owner, or POSITIVE_NO_CHANGE
 -> exact verification owner
```

A positive no-change or baseline-reuse disposition is an implementation instruction: **do not edit for that obligation** and revalidate the named evidence/proof. If execution disproves it, return upstream.

## Execution ownership

`12-action-catalog.md` is the **single definition owner** for every IA01-IA34 implementation/proof action. Semantic phase files may map requirements/atoms to an IA and state their local consequence or completion evidence, but they must not restate that IA's mutation procedure, disposition table or API design. `13-verification-closeout.md` owns checkpoints/proof only and likewise references the catalog.

This PLAN carries no implementation authority by itself. Current campaign gate state, bounded authorization and sign-off are owned only by campaign §17A/§18. These bytes remain a candidate until those registers establish the required gates and explicit authorization; any bounded pre-sign-off grant must bind the exact current P4/DESIGN/PLAN package.

For the Workbench tranche, IA27 consumes the already-closed SD21/F6B component ledger. IA27 does not derive component responsibilities, API shapes, surface information grouping or physical decomposition. IA28 is the first real-consumer foundation acceptance; IA29-IA34 then consume that accepted foundation subject to their one catalogued disposition per owner. IA26 is terminal exact-candidate acceptance and never design authority.

## Candidate scope and forecast law
## Signed scope and forecast law

The canonical PLAN contains exactly one cumulative execution-task **candidate**. It becomes signed/executable only after the campaign-required gates and operator sign-off bind these exact bytes. The candidate uses:

- the exact same **76 repository paths** for `scope` and `changeSurface`; these include the eight authority-required new semantic component/specialist paths in DESIGN F6B; no directory-wide `src/**`, `ui/src/**` or `tests/**` mutation envelope is authorized;
- explicit `exclusions` for DESIGN-positive-reuse paths, positively retained atomic UI adapters and approved non-screen helpers that must remain unchanged;
- IA01-IA34 as ordered internal implementation/proof phases. IA phase ownership constrains what a phase may change but is not a second P6 task/scope representation.

The baseline V4/V5/V6 forecast-variance capability remains canonical execution machinery, but the 76-path candidate already includes every currently required physical decomposition owner. A newly required path outside this set returns to DESIGN/PLAN; implementation may not suppress a required component split merely to preserve the forecast.
## Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

For SD02, manifest authority selection is the reachable source set; IA02 must project only the lifecycle-applicable stable/versioned material selected by the pinned schema/stage/explicit refs. A retained historical source may remain reachable without entering current v2 context by raw layer membership.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

## Workbench presentation realization law

The authority-driven target is current P4 plus SD21-SD30/F6B. Current UI bytes and historical IA27-IA34 results are evidence only; no prior `CONFORMING_NO_EDIT`, RZ16 acceptance or screen reconstruction status is inherited.

The complete Workbench mutation/disposition procedure is defined once in `12-action-catalog.md` IA27-IA34. In summary only: IA27 realizes the required-new semantic component layer and corrects foundation APIs; IA28 freshly accepts that foundation in Queue/Create; IA29-IA34 revalidate every owned renderer and execute its catalogued `DECOMPOSE_REFACTOR`, `DESTRUCTIVE_REPLACEMENT`, `BOUNDED_RESIDUAL`, freshly proven `CONFORMING_NO_EDIT`, `REQUIRED_NEW` or `REQUIRED_ABSENT` disposition. Phase files cannot redefine these decisions.

`ui/src/styles.css` / `ui/src/theme.css` remain shared physical owners. IA27 owns semantic-component/foundation/theme selectors; later phases may remove or replace only their exact feature selectors as required by the catalog and may not recreate a shared section/facts/resource/review/document/result grammar locally.

No IA27-IA34 phase may resurrect a required-absent generic owner, widen a corrected component API for compatibility, introduce DTO/view-model/browser-state families, duplicate shell/responsive/Context ownership, or treat current JSX/SVG shape as product authority.

## Visual-language → foundation execution law
## Visual-language → foundation execution law

SD21's realization ledger is **DESIGN authority for this package**, not implementation-derived evidence and not a runtime schema. IA27 consumes it and may realize a recurring visual/composition role only through the P4 owner, canonical theme/token role and the exact SD21/F6B consumer mapping.

After IA27 foundation-readiness PASS, IA28 consumes the foundation candidate in the first real screen family. The foundation becomes accepted/frozen only after the IA28 rendered foundation-acceptance checkpoint passes; IA29-IA34 then consume that accepted foundation. Screen phases may not add or locally vary recurring color/token meaning, typography/spacing/density scales, control/button/action treatments, status/notice chrome, progressive-disclosure lanes, overlay mechanics, shell/region hierarchy, foundation geometry or breakpoint/responsive grammar. A screen that appears to require a new recurring role returns to IA27/DESIGN; it is not solved with feature CSS, a new wrapper or an SVG-shaped local composition.

## Information visibility / disclosure execution law

Every UI phase consumes the canonical P3 §11.4A classification and P4 §8.12A technical ownership. The implementation may not infer visibility from whichever fields are available in a query or from historical UI/SVG layout.

For every rendered datum/action in IA27-IA34, DESIGN already records semantic datum/action, P3 class, semantic component owner, exact section/collection position, default visibility, authorized inspection owner, responsive order and negative rendering rules. Implementation records only authority-conformance evidence. Physical-owner dispositions are owned once by `12-action-catalog.md`; they are not reclassified in phase files or verification prose.

The implementation rule is exact:

- Primary information is visible without entering Context/Technical details;
- Supporting/Operational information remains subordinate and cannot create another persistent navigation axis;
- Technical information is absent from the ordinary surface and appears only through the authorized local Technical details or explicit Context owner;
- Diagnostic/console detail is absent from ordinary UX and appears only through an already-authorized Technical/Context/Evidence inspection surface where legitimate inspection requires it;
- when a technical condition blocks progress, only its human-readable meaning/consequence/action is promoted; raw code/path/hash/session/payload remains technical/evidence-owned;
- exact mutation-consent facts may become decision-primary only inside the owning confirmation;
- responsive recomposition never changes classification/default visibility.

Presence-only browser assertions are nonconforming when they force technical/diagnostic text into ordinary UI. Every affected test is rewritten to prove both default-hidden and authorized post-disclosure visibility.

## Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Because the current T1 candidate sets `scope` equal to the same exact 76-path `changeSurface`, any newly required physical path outside that set returns upstream for DESIGN/PLAN correction. The eight new semantic component/specialist files are already governed members of the candidate and are not variance.
