# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is reconstructed under G-F12 after G4 closure. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts. An action remains here only when the current R2/DESIGN package requires that delta or an explicit positive-reuse proof.

## Exact upstream package

- R1 `research.md`: `d2eb1627e2b9a145f785b04829b56c623b7431e9`.
- R2 `requirements.md`: `e6f656f070bb3952d2ffde9368a5caa256ce9c1d`.
- DESIGN `solution-design.md`: `f21d1530b01a43e28be47742236b339770022059`.
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

IA27-IA34 are the presentation reconstruction owners. The existing canonical `ui/src/primitives/**` implementation is retained read-only capability for this campaign. IA27 owns only certification of that primitive boundary plus deletion of obsolete screen-specific/compatibility rules from shared stylesheets; it does not redesign primitives. IA28-IA34 own destructive screen replacement. Each must record a purge checkpoint deleting its old owned screen files before replacement authorship, and may not copy or incrementally transform the pre-purge screen implementation. If the retained primitives are insufficient, execution returns to DESIGN rather than changing primitives or creating local presentation ownership.

IA26 is a verification-only terminal acceptance action. It uses the reviewed `docs/references/workbench-ui/` SVG pack only as derived visual comparison material, with current R2/DESIGN/P3-P6 authority prevailing on any conflict. It does not create a screenshot-as-authority mechanism, a second UI specification, or a new product/runtime dependency.

SD13 checkpoint protocol and SD10 scope/forecast/V4-V6 behavior are current execution capabilities positively proven by DESIGN. IA07/IA08 therefore prove/reuse those capabilities and authorize **no T1 production mutation** to their existing owners.

SD20 is a verification-only delta. IA23 owns its permanent realization through `tests/opencode.test.ts` and `.github/workflows/ci.yml`: the actual supported OpenCode 2.2.6 process is exercised through Order's production OpenCode boundary while deterministic model responses are provided by exact isolated CI tooling `opencode-drive@2.4.1` + `effect@4.0.1`. These verification tools are not product/runtime dependencies and do not enter `package.json`, lockfiles, release bundles, Order configuration or runtime state.

## Signed scope and forecast law

The canonical signed T1-T11 task graph uses:

- bounded `scope` patterns as the hard repository-reach envelope;
- explicit `exclusions` to protect paths outside the current task owner, including retained UI capability and DESIGN-positive-reuse paths inside the cumulative envelope;
- task-local exact `changeSurface` forecasts whose union is the immutable expected physical forecast for the cumulative candidate.

A path absent from `changeSurface` is not automatically authorized and is not automatically a scope breach. If it is inside signed scope, outside exclusions and not protected material, it may proceed only when V4/V5/V6 positively prove the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary. Any semantic expansion remains outside the signed task.

## Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

For SD02, manifest authority selection is the reachable source set; IA02 must project only the lifecycle-applicable stable/versioned material selected by the pinned schema/stage/explicit refs. A retained historical source may remain reachable without entering current v2 context by raw layer membership.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

## Screen replacement non-reuse law

For IA28-IA34, current screen implementation is defect evidence only.

- pre-reconstruction screen blobs are not preservation targets, compatibility targets, migration sources or implementation templates;
- the purge checkpoint must precede replacement authorship in Git history;
- a replacement task may reuse only retained primitives, approved leaf/content mechanisms and canonical non-screen domain/query/policy owners;
- copying old JSX/DOM structure, screen-local state branching, field grouping, table-column design, card/panel composition, action placement, responsive markup, CSS classes or visual hierarchy is a task breach;
- a screen-information schema is design-time trace material only and must not become a DTO/browser state family;
- screen task completion requires both deletion evidence and fresh semantic/rendered evidence.

## Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Do **not** return upstream solely because an otherwise admissible path is absent from `changeSurface`; that case follows the governed V4/V5/V6 variance proof.