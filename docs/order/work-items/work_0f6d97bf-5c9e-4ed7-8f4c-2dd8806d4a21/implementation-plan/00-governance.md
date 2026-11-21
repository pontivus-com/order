# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is reconstructed under G-F12 after G4 closure. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts. An action remains here only when the current R2/DESIGN package requires that delta or an explicit positive-reuse proof.

## Exact upstream package

- R1 `research.md`: `99f6932e582bde949de72716f29ea0868eba16a0`.
- R2 `requirements.md`: `27faa1a67321c8091deb27a4fd70ae912209c30a`.
- DESIGN `solution-design.md`: `e0c9a4704fb63af6ac55b4ff2df60f641b6d64d5`.
- Corrected P3 `GW-DOC-INSTALLATION-READINESS`: `9c2ec83a9552b7583f90e91080c014df4d6870df`.
- P3 `GW-DOC-WORKBENCH-UX-V2`: `114226b7b30657fd334b47a9c74f5e24479564a1` — §11.4A owns the closed Primary/Supporting/Operational/Technical/Diagnostic visibility classes and promotion/disclosure semantics.
- P4 `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`: `7263c890f3705ddd55fdadb98767b62acb7fc56d` — §8.12A owns the technical disclosure lanes and AppShell/WorkItemShell/Context responsibilities.
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

A semantic phase may reference an IA action owned by another phase. That reference is a consumer dependency, not permission to re-implement the action. Each IA01-IA34 entry is defined exactly once in `12-action-catalog.md`. IA entries may own a production mutation, a verification-only delta, a DESIGN-positive-reuse/no-code proof obligation, rendered-product acceptance evidence, or final closeout; they do not create a second task representation.

IA27-IA34 are the presentation reconstruction owners inside the one signed cumulative task. IA27 is the **foundation reconstruction owner**: it positively retains only the exact seven atomic adapters named by SD21/P4 §16.6, destructively removes the exact 20 design-bearing composition primitive implementations plus the five old application/WorkItem shell-integration files and their structural selectors/implementation-specific geometry assertions, permanently removes the old `WorkbenchLayout.tsx` API, and then authors the fresh `WorkbenchAppShell.tsx`, `WorkbenchWorkItemShell.tsx`, `workbench-responsive.ts`, reconstructed composition primitives, and fresh application/WorkItem shell integration from current P3/P4 and reviewed new-design references. Its procedural purge checkpoint contains no replacement primitive JSX and is recorded as bounded in-task observational evidence rather than a Git commit. IA27 closes only after the fresh foundation passes architecture/theme/responsive/accessibility/rendered proof. IA28-IA34 are blocked until that PASS, then own destructive screen replacement. Each screen phase deletes its old owned screen files plus assigned legacy selectors before replacement authorship and may not copy or incrementally transform pre-purge screen implementation. Later phases consume the accepted foundation and may not redesign it locally.

IA26 is a verification-only terminal acceptance action. It uses the reviewed `docs/references/workbench-ui/` SVG pack only as derived visual comparison material, with current R2/DESIGN/P3-P6 authority prevailing on any conflict. It does not create a screenshot-as-authority mechanism, a second UI specification, or a new product/runtime dependency.

SD13 checkpoint protocol and SD10 scope/forecast/V4-V6 behavior are current execution capabilities positively proven by DESIGN. IA07/IA08 therefore prove/reuse those capabilities and authorize **no T1 production mutation** to their existing owners.

SD20 is a verification-only delta. IA23 owns its permanent realization through `tests/opencode.test.ts` and `.github/workflows/ci.yml`: the actual supported OpenCode 2.2.6 process is exercised through Order's production OpenCode boundary while deterministic model responses are provided by exact isolated CI tooling `opencode-drive@2.4.1` + `effect@4.0.1`. These verification tools are not product/runtime dependencies and do not enter `package.json`, lockfiles, release bundles, Order configuration or runtime state.

## Signed scope and forecast law

The canonical PLAN contains exactly one signed execution task because `GW-DOC-CANONICAL-CONTRACTS-V2` does not promote dependency candidate bytes into later task baselines. That task uses:

- the exact same **66 repository paths** for signed `scope` and `changeSurface`; no directory-wide `src/**`, `ui/src/**` or `tests/**` mutation envelope is authorized;
- explicit `exclusions` for DESIGN-positive-reuse paths, positively retained atomic UI adapters and approved non-screen helpers that must remain unchanged;
- IA01-IA34 as ordered internal implementation/proof phases. IA phase ownership constrains what a phase may change but is not a second P6 task/scope representation.

The baseline V4/V5/V6 forecast-variance capability remains canonical execution machinery, but this exact package deliberately does not use a broader scope to admit new physical paths. A path absent from the 66-path forecast is also absent from signed scope and therefore returns upstream for DESIGN/PLAN correction. This prevents the one-task packaging correction from becoming implicit authorization for unrelated cleanup, speculative decomposition or presentation-layer drift.
## Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

For SD02, manifest authority selection is the reachable source set; IA02 must project only the lifecycle-applicable stable/versioned material selected by the pinned schema/stage/explicit refs. A retained historical source may remain reachable without entering current v2 context by raw layer membership.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

## Foundation and screen replacement non-reuse law

For IA27, the current design-bearing Workbench primitive implementation, structural CSS and implementation-specific geometry assertions are defect evidence only. The exact P4 §16.6 destructive set must be purged before replacement primitive authorship; only the exact positively retained atomic set may cross that checkpoint unchanged. Purge and rebuild are ordered phases inside the one signed task, not separate candidates or Git commits.

For IA28-IA34, current screen implementation is defect evidence only.

- pre-reconstruction screen blobs are not preservation targets, compatibility targets, migration sources or implementation templates;
- each phase must delete its owned old screen files and its exact ledgered legacy selectors before replacement authorship, recording the deleted path/selector set as bounded in-task observational evidence; the purge checkpoint is procedural and is not a Git commit or validation result;
- `ui/src/styles.css` and `ui/src/theme.css` remain shared physical stylesheet owners inside the single signed task: IA27 owns foundation/theme/structural selectors, while IA28-IA34 may delete or replace only the screen-specific selectors assigned to their phase; a screen phase may not redesign IA27's accepted foundation through those files;
- a replacement screen phase may reuse only the accepted IA27 reconstructed foundation, positively retained atomic adapters, approved leaf/content mechanisms and canonical non-screen domain/query/policy owners;
- copying old JSX/DOM structure, screen-local state branching, field grouping, table-column design, card/panel composition, action placement, responsive markup, CSS classes or visual hierarchy is a phase breach;
- a screen-information schema is design-time trace material only and must not become a DTO/browser state family;
- phase completion requires deletion evidence plus fresh schema, semantic, interaction and rendered evidence;
- no IA28-IA34 phase may resurrect `WorkbenchLayout`, create a second AppShell/application toolbar, duplicate structural `matchMedia` ownership, or mutate the accepted foundation for screen convenience.
## Information visibility / disclosure execution law

Every UI phase consumes the canonical P3 §11.4A classification and P4 §8.12A technical ownership. The implementation may not infer visibility from whichever fields are available in a query or from historical UI/SVG layout.

For every rendered datum/action in IA27-IA34, the fresh design-time screen schema records: semantic datum/action, P3 class, default visibility, one ordinary presentation owner, authorized progressive-disclosure owner when any, and promotion condition when a technical cause can own current attention. This trace is implementation evidence only and must not become a DTO/browser state model.

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

Because this exact T1 deliberately sets signed `scope` equal to the same exact 66-path `changeSurface`, any newly required physical path absent from `changeSurface` is also outside signed scope and returns upstream for DESIGN/PLAN correction. The general V4/V5/V6 in-scope-unforecast mechanism remains canonical execution capability but has no admissible physical-path case inside this exact package.