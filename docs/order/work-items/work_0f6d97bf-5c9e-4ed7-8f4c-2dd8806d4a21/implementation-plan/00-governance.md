# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

## Exact upstream package

- R1 `research.md`: `9aa1d2baefafd1a4e912df5e22a20bab0b71157f`.
- R2 `requirements.md`: `b80fe3de7636d9fce36e6d4f502bf20ff794b6bb`.
- DESIGN `solution-design.md`: `9ec7b943365b39819999672abb27654891f4a837`.
- P6 `GW-DOC-CANONICAL-CONTRACTS-V2`: `71f829cff8824db18194689eccdec83da6f5d19f`.
- Current execution-control foundation is already integrated and is consumed as baseline capability, not reimplemented by T1.

## Traceability law

Every stable P3 requirement and every package-local atomic obligation follows:

```text
canonical P3 / package consequence
 -> exact current R1 evidence
 -> exact current R2 consequence
 -> exact DESIGN disposition
 -> one IA implementation owner, one baseline-reuse proof owner, or POSITIVE_NO_CHANGE
 -> exact verification owner
```

A positive no-change or baseline-reuse disposition is an implementation instruction: **do not edit for that obligation** and revalidate the named evidence/proof. If execution disproves it, return upstream.

## Execution ownership

A semantic phase may reference an IA action owned by another phase. That reference is a consumer dependency, not permission to re-implement the action. Each IA01-IA25 entry is defined exactly once in `12-action-catalog.md`. IA entries may own a production mutation, a verification-only delta, a baseline-reuse/no-code proof obligation, or final closeout; they do not create a second task representation.

SD13 checkpoint protocol and SD10 scope/forecast/V4-V6 behavior are current execution-baseline capabilities. IA07/IA08 therefore prove/reuse those capabilities and authorize **no T1 production mutation** to their existing owners.

## Signed scope and forecast law

The one signed T1 uses:

- bounded `scope` patterns as the hard repository-reach envelope;
- explicit `exclusions` to protect known non-T1/baseline-reuse paths inside that envelope;
- exact 28-path `changeSurface` as the immutable expected physical forecast.

A path absent from `changeSurface` is not automatically authorized and is not automatically a scope breach. If it is inside signed scope, outside exclusions and not protected material, it may proceed only when V4/V5/V6 positively prove the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary. Any semantic expansion remains outside the signed task.

## Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

## Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Do **not** return upstream solely because an otherwise admissible path is absent from `changeSurface`; that case follows the governed V4/V5/V6 variance proof.