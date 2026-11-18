# 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

## Traceability law

Every stable P3 requirement and every package-local atomic obligation follows:

```text
canonical P3 / package consequence
 -> exact G-F10 R1 evidence
 -> exact DESIGN disposition
 -> execution owner IAxx OR dependency-only IAxx OR POSITIVE_NO_CHANGE
 -> exact verification owner
```

A positive no-change disposition is an implementation instruction: **do not edit for this requirement** and revalidate the named evidence/proof. If execution disproves it, return upstream.

## Execution ownership

A semantic phase may reference an IA action owned by another phase. That reference is a consumer dependency, not permission to re-implement the action. Each IA action is defined exactly once in `12-action-catalog.md` and assigned to one execution wave.

## Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

## Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, state meaning, public contract, persistence/transport shape, external dependency, provider capability, verification authority, or path outside the signed changeSurface.
