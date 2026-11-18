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

Remediation: retain all historical v1 templates unchanged for v1-pinned WorkItems; audit the complete current v2 stage-template set and require every productive current stage template to bind lifecycle-context V2 authority. Change/Defect v2 route to dedicated v2 R1 templates. Because Investigation/Audit are also ordinary current authoring kinds, add `investigation-v2` / `audit-v2` defaults with unchanged terminal R1 structure/outcomes and current WorkItem/lifecycle authority; keep their v1 pins non-default and immutable. Permanently test historical/current separation.


The full current-v2 template audit found the same failure class in the Change/Defect R2 templates: they cited Work lifecycle, Specification standard V2 and GW-FR-096 but omitted the current lifecycle-context stage owner. Current v2 DESIGN/PLAN/R3 already bound lifecycle-context V2. The remediation therefore adds lifecycle-context V2 to current R2 templates and a single regression test that proves every current v2 stage template binds lifecycle-context V2 and none binds lifecycle-context V1.


## Downstream validation finding — v2 DESIGN template completeness

The 0.6.0 C08 investigation found that the current Change/Defect v2 DESIGN templates were structurally narrower than the binding S7 design contract. They omitted explicit existing-capability/reuse analysis, behavior to replace/delete, necessary-new-concept justification and rejected-alternative rationale, even though `GW-DOC-SPECIFICATION-STANDARD` requires those design decisions and the historical v1 design template already carried alternatives/rationale.

Because the schema template is injected verbatim into the productive DESIGN prompt and structurally defines admitted document sections, this is a Phase-0 authoring-contract defect rather than a future product-design choice.

Remediation: extend the current v2 DESIGN templates to carry the complete S7 content contract, preserve historical v1 templates unchanged, align P3/P6 documentation, and add a permanent template regression.


## Downstream validation finding — mechanical readiness timing

The 0.6.0 readiness pre-audit found that complete signed-task validation was performed only by `computeSignoffPackage()` after R3 had already transitioned the WorkItem to `AWAITING_SIGNOFF`. The binding specification requires mechanically checkable readiness conditions to be proven before R3 may return `READY_FOR_SIGNOFF`.

This creates an avoidable invalid intermediate state: a package with unresolved gates/concerns/authority refs or an invalid signed change surface can be admitted to Approval and only then rejected.

Remediation: on R3 `READY_FOR_SIGNOFF` only, validate the exact current PLAN task definitions against the current manifest and full current material closure before admitting R3 conformance/lifecycle transition. R3 return-to-* outcomes remain available without this validation so a reviewer can route a defective PLAN back to its owner. Reuse the existing `validateTaskDefinitions` owner; do not create a second readiness validator.
