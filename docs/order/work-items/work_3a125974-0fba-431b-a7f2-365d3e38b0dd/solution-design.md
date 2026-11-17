# Solution design — lifecycle documentation authority drift

## Root cause/producer boundary

The producer boundary is the pre-signoff authoring/conformance path: schema/template policy in src/core/work-item-source.ts, pure conformance admission in src/core/governance.ts, and coordinator orchestration in src/daemon/stage.ts.

## Requirement-to-solution map

- GW-FR-096 → Change/Defect v2 templates plus one canonical schema catalog with explicit current-authoring defaults.
- GW-FR-097 → pure evaluateStageConformance plus exact path/hash/structure revalidation before coordinator-owned CONFORMANCE_PASSED; v2 R2 resolves parsed non-local ledger owners against the current manifest ref map, and PLAN parses its exact current `order-tasks` block before promotion.
- GW-FR-098 → strengthened v2 R3 template and explicit R3 conformance questions.
- Repository-delivery verification rule → P1 governance plus exact-current-candidate CI verification; no mandatory reviewer identity is introduced where no independent reviewer exists.

## Authority consumer closure

Repoint every ordinary live permanent-document dependency on the six advanced concerns to the stable concern identifiers, because those consumers mean the current owner rather than an exact semantic snapshot. Keep exact V2 identifiers only in artifacts that intentionally bind the Phase 0 semantic snapshot, keep retained .v1.md files untouched, keep stable and versioned manifest resolution unchanged, and extend the existing permanent documentation architecture sensor to reject ordinary current-document version pins for concerns with retained historical versions. This is a reference/topology correction, not new functional or technical semantics.

## Correction at the canonical owner

Extend the existing schema catalog instead of creating a second catalog. Keep v1 pins immutable and make v2 current authoring defaults. For each canonical concern materially amended by this remediation, retain the released 0.5.0 V1 document as an exact semantic source, advance the live owner to V2, map the stable/V2 identifiers to the live owner and the V1 identifier to the retained source. Restore the already-prescribed functional-core conformance seam in src/core/governance.ts. Keep ArtifactRef identity coordinator-owned: current draft ids are projected into the stage prompt only as completion bindings and are revalidated by the coordinator.

## Preserved invariants/downstream consumers

RunEvent remains the conformance persistence carrier; ArtifactRef/dependency edges remain evidence/currentness owners; WorkItem lifecycle remains the sole stage owner; the provider cannot emit coordinator-owned conformance events; UI reads the same catalog API.

## Minimum root-cause remediation

No new service, class, DTO, state store, lifecycle role or persistence table. Add only the missing policy/data/functions and focused tests. Reuse the existing PR verification workflow as the exact-current-candidate evidence owner; do not create a second review state model or release path.

## Failure behavior

Invalid output binding or v2 structural stage document records CONFORMANCE_FAILED, blocks the stage Run and keeps/returns ownership to that stage. Missing P2/product authority is blocked rather than inferred.

## Regression validation obligations

Typecheck, architecture, core, daemon and browser tests must remain green. Add explicit regression coverage for empty output binding and v2 catalog/default behavior.
