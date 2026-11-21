# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is reconstructed under G-F12 after G4 closure. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts. An action remains here only when the current R2/DESIGN package requires that delta or an explicit positive-reuse proof.

## Exact upstream package

- R1 `research.md`: `d2eb1627e2b9a145f785b04829b56c623b7431e9`.
- R2 `requirements.md`: `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`.
- DESIGN `solution-design.md`: `a3d335359e6c716dc7d22f386b3a9956121e81ca`.
- Corrected P3 `GW-DOC-INSTALLATION-READINESS`: `9c2ec83a9552b7583f90e91080c014df4d6870df`.
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

- bounded `scope` patterns as the hard repository-reach envelope for the complete cumulative candidate;
- explicit `exclusions` for DESIGN-positive-reuse paths, positively retained atomic UI adapters and approved non-screen helpers that must remain unchanged;
- one exact 66-path `changeSurface` forecast for the cumulative candidate;
- IA01-IA34 as ordered internal implementation/proof phases. IA phase ownership constrains what a phase may change but is not a second P6 task/scope representation.

A path absent from `changeSurface` is not automatically authorized and is not automatically a scope breach. If it is inside signed scope, outside exclusions and not protected material, it may proceed only when V4/V5/V6 positively prove the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary. Any semantic expansion remains outside the signed task.
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
## Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Do **not** return upstream solely because an otherwise admissible path is absent from `changeSurface`; that case follows the governed V4/V5/V6 variance proof.