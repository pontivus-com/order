# Research — lifecycle documentation authority drift

## Observed symptom/reproduction

0.5.0 carried extensive documentation yet shipped material product regressions and was nevertheless represented as complete.

## Proven root cause

The governance principles were stronger than the productive authoring/conformance machinery. Change-local R2 could restate permanent P3 behavior without an ownership ledger; the architecture sensor excluded WorkItem documents from canonical-owner discovery without a companion shadow-authority gate; the runtime lacked the architecture-prescribed functional-core conformance evaluator; and stage completion could promote with zero output ArtifactRefs.

## Producer→carrier→consumer path

R2 template/prompt → WorkItem Requirements → Solution design → PLAN → tests/certification → PR/release claim.

The reduced local requirements became the carrier consumed by downstream stages, while omitted permanent obligations ceased to be visible in the downstream proof chain.

## Additional confirmed current-state drift

The six current semantic owners were advanced to V2, but their V1 identifiers remained pinned in current AGENTS.md and multiple live governing documents. Because each V1 identifier resolves to an intentionally retained immutable 0.5.0 source, those pins select superseded governance rather than current rules. The missing permanent documentation topology check allowed this. Classify these live references as stale and repoint ordinary current-owner dependencies to the stable concern identifiers; preserve exact V2 pins only where a specific semantic snapshot is intentionally required, and preserve historical .v1.md sources byte-identically. The 0.5.0 visual-reference pack at docs/references/workbench-ui/README.md is historical evidence and intentionally retains its original V1 source-basis pins; it is not a current operating-authority consumer.

## Downstream effects/invariants

Downstream implementation and tests could be internally consistent with an incomplete local specification. Green tests therefore did not prove fidelity to the complete canonical P3 authority set.

Preserve the existing pyramid, lifecycle, exact package identity, proposal/adoption flow, sign-off model and validation model.

## Governing authority

GW-P1-DOC-CANONICALITY, GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2, GW-DOC-CANONICAL-CONTRACTS-V2, and GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2.

## Unresolved facts

The repository has no independent reviewer/second worker. Therefore absence of a non-author PR review is an operating fact, not evidence of a governance defect. Canonical delivery must remain reviewable and auditable through the PR boundary, but merge readiness must be proven from the exact current candidate, required verification evidence, authority/traceability closure and explicit operator decision rather than an impossible third-party approval. GitHub administrative branch-protection settings remain external facts where relevant.

## Verdict

CONFIRMED. The defect is upstream governance enforcement, not merely a Workbench implementation mismatch.


## Downstream validation finding — v2 R1 template authority pin

The 0.6.0 concern investigation found one remaining productive authority-lineage defect after the original Phase 0 closure. New `change-v2` and `defect-v2` WorkItems were still routed to the historical `change-r1-v1` / `defect-r1-v1` stage templates. Those templates are injected verbatim into productive STAGE prompts as the “Canonical stage template” and cite `GW-DOC-LIFECYCLE-CONTEXT-V1`.

This is not merely documentation prose: it causes current v2 delivery Research to receive a historical lifecycle-context authority pin alongside the current resolved authority set. The R1 evidence section shape itself remains valid and unchanged.

Remediation: retain the historical v1 R1 templates unchanged for v1-pinned WorkItems; introduce v2 R1 template pins with the same evidence structure but `GW-DOC-LIFECYCLE-CONTEXT-V2`; route only `change-v2` / `defect-v2` to those current templates and permanently test the separation.
