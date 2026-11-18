# Solution design — lifecycle documentation authority drift

## Root cause/producer boundary

The producer boundary is the pre-signoff authoring/conformance path: schema/template policy in src/core/work-item-source.ts, pure conformance admission in src/core/governance.ts, and coordinator orchestration in src/daemon/stage.ts.

## Requirement-to-solution map

- GW-FR-096 → Change/Defect v2 templates plus one canonical schema catalog with explicit current-authoring defaults.
- GW-FR-097 → pure evaluateStageConformance plus exact path/hash/structure revalidation before coordinator-owned CONFORMANCE_PASSED; v2 R2 resolves parsed non-local ledger owners against the current manifest ref map, and PLAN parses its exact current `order-tasks` block before promotion.
- GW-FR-098 → strengthened v2 R3 template, explicit R3 conformance questions, and reuse of the existing `validateTaskDefinitions` owner as a coordinator-side precondition for `READY_FOR_SIGNOFF`; return-to-* verdicts are not blocked by an invalid PLAN.
- Specification S7 → current Change/Defect v2 DESIGN templates carry the complete design-content contract rather than a reduced package-local subset, while historical v1 template semantics remain unchanged.
- Repository-delivery verification rule → P1 governance plus exact-current-candidate CI verification; no mandatory reviewer identity is introduced where no independent reviewer exists.

## Authority consumer closure

Repoint every ordinary live permanent-document dependency on the six advanced concerns to the stable concern identifiers, because those consumers mean the current owner rather than an exact semantic snapshot. Keep exact V2 identifiers only in artifacts that intentionally bind the Phase 0 semantic snapshot, keep retained .v1.md files untouched, keep stable and versioned manifest resolution unchanged, and extend the existing permanent documentation architecture sensor to reject ordinary current-document version pins for concerns with retained historical versions. This is a reference/topology correction, not new functional or technical semantics.

## Correction at the canonical owner

Extend the existing schema catalog instead of creating a second catalog. Keep all v1 pins immutable and make v2 the current authoring default for all four kinds. R1 evidence structure and kind-specific terminal outcomes are reused semantically, while every productive current v2 stage template binds lifecycle-context V2 authority so no current prompt inherits historical lifecycle-context V1. The catalog remains the single template owner; historical v1 templates are unchanged. Investigation/Audit v2 still have no R2/DESIGN/PLAN/R3 route. For each canonical concern materially amended by this remediation, retain the released 0.5.0 V1 document as an exact semantic source, advance the live owner to V2, map the stable/V2 identifiers to the live owner and the V1 identifier to the retained source. Restore the already-prescribed functional-core conformance seam in src/core/governance.ts. Keep ArtifactRef identity coordinator-owned: current draft ids are projected into the stage prompt only as completion bindings and are revalidated by the coordinator.

## Preserved invariants/downstream consumers

RunEvent remains the conformance persistence carrier; ArtifactRef/dependency edges remain evidence/currentness owners; WorkItem lifecycle remains the sole stage owner; the provider cannot emit coordinator-owned conformance events; UI reads the same catalog API.

## Minimum root-cause remediation

No new service, class, DTO, state store, lifecycle role or persistence table. Add only the missing policy/data/functions and focused tests. Reuse the existing PR verification workflow as the exact-current-candidate evidence owner; do not create a second review state model or release path.

## Failure behavior

Invalid output binding or v2 structural stage document records CONFORMANCE_FAILED, blocks the stage Run and keeps/returns ownership to that stage. Missing P2/product authority is blocked rather than inferred.

## Regression validation obligations

Typecheck, architecture, core, daemon and browser tests must remain green. Add explicit regression coverage for empty output binding and v2 catalog/default behavior.
