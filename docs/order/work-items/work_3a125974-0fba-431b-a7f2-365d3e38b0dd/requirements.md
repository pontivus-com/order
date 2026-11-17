# Requirements — lifecycle documentation authority drift

## Proven defect/root cause

The productive lifecycle permits a change-local R2 document to become a shadow P3 specification and permits stage promotion without proving one current deterministic lifecycle artifact. Repository delivery can also claim completion without an independent PR review.

## Functional authority disposition ledger

| Requirement | Disposition | Canonical owner |
|---|---|---|
| One canonical document owner per concern | REFERENCE | GW-P1-DOC-CANONICALITY |
| Versioned immutable WorkItem authoring semantics | DELTA | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1 |
| Continuous pre-signoff conformance | DELTA | GW-DOC-LIFECYCLE-CONTEXT-V1 |
| Readiness package authority/traceability review | DELTA | GW-DOC-SPECIFICATION-STANDARD-V1 |
| Independent public-repository review before merge | DELTA | GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1 |
| Coordinator-owned conformance output binding | DELTA | GW-DOC-CANONICAL-CONTRACTS-V1 |

## Expected corrected behavior

New Change/Defect authoring uses v2 schema pins with explicit canonical-authority disposition semantics. Historical v1 pins remain supported unchanged. Every promotable pre-signoff completion binds exactly one current ArtifactRef at the deterministic stage path, and the coordinator rejects empty/multiple/wrong/stale bindings. R3 independently challenges authority topology and traceability. Authority/release PRs require independent approval.

## Behavior that must remain unchanged

No new lifecycle stage, Run role, persisted conformance model, DTO family, duplicate schema catalog, browser authority store or alternate sign-off path is introduced. Existing v1 WorkItems remain readable under their pinned semantics.

## Acceptance proving the original defect

1. A provider completion with artifactRefIds: [] records CONFORMANCE_FAILED and cannot advance lifecycle state.
2. Change/Defect ordinary creation selects v2 while existing v1 WorkItems still resolve their kind/template semantics.
3. v2 R2 stage documents must include the functional authority disposition ledger and the rest of their kind-specific required structure before promotion.
4. R3 v2 requires authority topology, traceability, lifecycle completeness and open-decision review.
5. The permanent architecture sensor requires the functional-core conformance owner.
6. Repository governance requires independent approval for merge.

## Regression/preservation acceptance

Existing source reconciliation, direct human Markdown authoring, proposal adoption, source freshness, exact-package sign-off, no-code Investigation/Audit closure and V0-V7 post-signoff validation remain unchanged.

## Scope/exclusions

In scope: governance documents, schema catalog/templates, stage prompt/conformance admission, focused UI default-schema selection, permanent tests and repository-review policy.

Out of scope: 0.6.0 Workbench functional redesign, UI fidelity remediation, new lifecycle state, new persistence model and branch-protection administration through unsupported credentials.

## Open product/authority questions

None for the repository implementation. GitHub protected-branch administration remains an external administrative follow-up governed by the updated repository-delivery rule.
