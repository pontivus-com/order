# Implementation plan — lifecycle documentation authority drift

## Root-cause remediation tasks/dependencies

1. Amend P3/P1/P6 canonical owners with stable GW-FR-096/097/098 and independent review semantics.
2. Extend the single WorkItem schema catalog with immutable historical v1 pins and current Change/Defect v2 pins.
3. Add authority-aware v2 R2/DESIGN/PLAN/R3 templates and structural validation at the schema owner.
4. Restore pure functional-core stage conformance output admission.
5. Wire coordinator stage promotion through that admission plus current-byte/template verification.
6. Make Create select only current authoring defaults while historical schemas remain display/discovery compatible.
7. Replace false-positive tests and add permanent architecture/core regression sensors.
8. Run complete configured verification and obtain independent R3/PR review before merge.

## Requirement/design traceability

Tasks 1-3 realize GW-FR-096. Tasks 3-5 realize GW-FR-097. Tasks 1 and 3 realize GW-FR-098. Task 8 realizes the updated public repository delivery rule.

## Incorrect behavior to delete/replace

Delete the assumption that a WorkItem-local requirement family may silently substitute for permanent P3 authority. Replace empty-artifact promotion with exact deterministic output binding. Remove the custom 0.5.0 implementation-fidelity-audit.md from the completed historical WorkItem.

## Expected change surface

Canonical requirements/governance/contracts/architecture docs, pontivus-order.toml, core contracts/schema/conformance policy, stage orchestration, Create default selection, focused permanent tests, changelog and this new Defect WorkItem.

## Reproduction/regression/preservation verification

Prove empty output completion blocks; wrong/multiple/stale output fails; v2 defaults and v1 compatibility coexist; v2 stage document structure is enforced; architecture requires evaluateStageConformance; complete repository verification passes; independent R3/PR review remains outstanding until performed by a reviewer other than the change author.

## Canonical order-tasks block

This repository draft intentionally does not fabricate a signed task block or readiness verdict. Independent R3/sign-off must occur after the implementation and verification evidence is available.
