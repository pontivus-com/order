# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is reconstructed under G-F12 after G4 closure. Historical PLAN structure, current implementation/UI/tests, prior releases and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts. An action remains here only when the current R2/DESIGN package requires that delta or an explicit positive-reuse proof.

## Exact upstream package

- R1 `research.md`: `aa287cb5aa37fbb0fe68742362ade9e949f43352`.
- R2 `requirements.md`: `36f886d8ea3418a23be9a67239ab943e891c6c3a`.
- DESIGN `solution-design.md`: `9098ed2e8036d3ecf195f863c731c95c7cdbad8e`.
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

A semantic phase may reference an IA action owned by another phase. That reference is a consumer dependency, not permission to re-implement the action. Each IA01-IA25 entry is defined exactly once in `12-action-catalog.md`. IA entries may own a production mutation, a verification-only delta, a DESIGN-positive-reuse/no-code proof obligation, or final closeout; they do not create a second task representation.

SD13 checkpoint protocol and SD10 scope/forecast/V4-V6 behavior are current execution capabilities positively proven by DESIGN. IA07/IA08 therefore prove/reuse those capabilities and authorize **no T1 production mutation** to their existing owners.

## Signed scope and forecast law

The one signed T1 uses:

- bounded `scope` patterns as the hard repository-reach envelope;
- explicit `exclusions` to protect known non-T1/DESIGN-positive-reuse paths inside that envelope;
- exact 28-path `changeSurface` as the immutable expected physical forecast.

A path absent from `changeSurface` is not automatically authorized and is not automatically a scope breach. If it is inside signed scope, outside exclusions and not protected material, it may proceed only when V4/V5/V6 positively prove the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary. Any semantic expansion remains outside the signed task.

## Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

## Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Do **not** return upstream solely because an otherwise admissible path is absent from `changeSurface`; that case follows the governed V4/V5/V6 variance proof.