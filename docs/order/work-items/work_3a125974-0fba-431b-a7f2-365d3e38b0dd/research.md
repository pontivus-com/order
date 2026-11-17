# Research — lifecycle documentation authority drift

## Observed symptom/reproduction

0.5.0 carried extensive documentation yet shipped material product regressions and was nevertheless represented as complete.

## Proven root cause

The governance principles were stronger than the productive authoring/conformance/review machinery. Change-local R2 could restate permanent P3 behavior without an ownership ledger; the architecture sensor excluded WorkItem documents from canonical-owner discovery without a companion shadow-authority gate; the runtime lacked the architecture-prescribed functional-core conformance evaluator; and stage completion could promote with zero output ArtifactRefs.

## Producer→carrier→consumer path

R2 template/prompt → WorkItem Requirements → Solution design → PLAN → tests/certification → PR/release claim.

The reduced local requirements became the carrier consumed by downstream stages, while omitted permanent obligations ceased to be visible in the downstream proof chain.

## Downstream effects/invariants

Downstream implementation and tests could be internally consistent with an incomplete local specification. Green tests therefore did not prove fidelity to the complete canonical P3 authority set.

Preserve the existing pyramid, lifecycle, exact package identity, proposal/adoption flow, sign-off model and validation model.

## Governing authority

GW-P1-DOC-CANONICALITY, GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2, GW-DOC-CANONICAL-CONTRACTS-V2, and GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2.

## Unresolved facts

GitHub administrative branch-protection settings cannot be inspected by the current integration. Repository governance can require the review rule, but the organization/repository administrator must prove the protected-branch setting separately.

## Verdict

CONFIRMED. The defect is upstream governance enforcement, not merely a Workbench implementation mismatch.
