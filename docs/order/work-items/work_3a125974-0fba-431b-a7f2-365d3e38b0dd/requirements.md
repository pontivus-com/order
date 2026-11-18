# Requirements — lifecycle documentation authority drift

## Proven defect/root cause

The productive lifecycle permits a change-local R2 document to become a shadow P3 specification and permits stage promotion without proving one current deterministic lifecycle artifact. Repository delivery also lacked an explicit exact-current-candidate evidence rule and was incorrectly amended to depend on a nonexistent independent reviewer.

## Functional authority disposition ledger

| Requirement | Disposition | Canonical owner |
|---|---|---|
| One canonical document owner per concern | REFERENCE | GW-P1-DOC-CANONICALITY |
| Versioned immutable WorkItem authoring semantics | DELTA | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2 |
| Continuous pre-signoff conformance | DELTA | GW-DOC-LIFECYCLE-CONTEXT-V2 |
| Readiness package authority/traceability review | DELTA | GW-DOC-SPECIFICATION-STANDARD-V2 |
| Exact-current-candidate public-repository verification without a fabricated reviewer dependency | DELTA | GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2 |
| Coordinator-owned conformance output binding | DELTA | GW-DOC-CANONICAL-CONTRACTS-V2 |
| Live document consumers resolve the active canonical semantic owner, not the retained historical V1 snapshot | REFERENCE | GW-P1-DOC-CANONICALITY |

## Expected corrected behavior

New Change/Defect authoring uses v2 schema pins with explicit canonical-authority disposition semantics. Historical v1 pins remain supported unchanged, and every materially amended canonical authority advances to V2 while its released V1 source remains byte-identical and independently resolvable by the V1 identifier. Every promotable pre-signoff completion binds exactly one current ArtifactRef at the deterministic stage path, and the coordinator rejects empty/multiple/wrong/stale bindings. R3 adversarially challenges authority topology and traceability. Public-repository merge readiness is bound to the exact current PR candidate and required verification evidence; a second human reviewer is not required when no independent reviewer exists.

## Behavior that must remain unchanged

No new lifecycle stage, Run role, persisted conformance model, DTO family, duplicate schema catalog, browser authority store or alternate sign-off path is introduced. Existing v1 WorkItems remain readable under their pinned semantics.

## Acceptance proving the original defect

1. A provider completion with artifactRefIds: [] records CONFORMANCE_FAILED and cannot advance lifecycle state.
2. Ordinary creation selects a current v2 schema for every WorkItem kind: `change-v2`, `defect-v2`, `investigation-v2`, and `audit-v2`, while existing v1 WorkItems still resolve their pinned kind/template semantics. Every productive current v2 stage template binds current lifecycle-context V2 authority and must not inherit a historical lifecycle-context V1 pin. Current v2 R1 templates preserve the established per-kind R1 evidence structure and allowed outcomes; historical v1 templates remain independently resolvable only for v1-pinned WorkItems. Investigation/Audit v2 remain R1-terminal and do not acquire delivery stages.
3. v2 R2 stage documents must include the functional authority disposition ledger and the rest of their kind-specific required structure before promotion. Current v2 DESIGN templates must also carry the complete S7 design-content contract, including reuse/replacement/new-concept analysis and rejected alternatives/rationale, so productive DESIGN output cannot omit obligations later required by readiness.
4. R3 v2 requires authority topology, traceability, lifecycle completeness and open-decision review. Before `READY_FOR_SIGNOFF` can promote, the coordinator must also run the existing mechanical signed-task validation against the exact current PLAN, project manifest and current material closure; invalid task refs/gates/concerns/scope/change-surface block R3 rather than leaking into Approval.
5. The permanent architecture sensor requires the functional-core conformance owner.
6. Repository governance requires a PR audit boundary and all required verification against the exact current candidate before merge.
7. Canonical PR verification must not depend on a nonexistent non-author reviewer; a material candidate change requires fresh verification against the new exact candidate.
8. Each amended canonical concern has one stable ID resolving to its V2 current owner, a V2 identifier resolving to that same current source, and a V1 identifier resolving to a byte-identical retained 0.5.0 source.
9. A v2 R2 `REFERENCE` or `DELTA` row whose canonical owner does not resolve through the current project `[refs]` map cannot promote.
10. PLAN cannot promote unless its exact current bytes contain exactly one valid canonical `order-tasks` block.

11. All live current governing documents that consume an amended concern as its current owner use the stable canonical concern identifier. Exact V1/V2 identifiers are permitted only for an intentionally exact semantic snapshot. Retained V1 sources remain byte-identical and are not rewritten. A permanent architecture gate rejects ordinary current-document version pins for concerns that have advanced semantic owners.

## Regression/preservation acceptance

Existing source reconciliation, direct human Markdown authoring, proposal adoption, source freshness, exact-package sign-off, no-code Investigation/Audit closure and V0-V7 post-signoff validation remain unchanged.

## Scope/exclusions

In scope: governance documents and their current authority consumers, schema catalog/templates, stage prompt/conformance admission, focused UI default-schema selection, permanent tests and repository-delivery verification policy.

Out of scope: 0.6.0 Workbench functional redesign, UI fidelity remediation, new lifecycle state, new persistence model and branch-protection administration through unsupported credentials.

## Open product/authority questions

None for the repository implementation. The single-operator/no-independent-reviewer operating fact is closed and encoded in the repository-delivery rule. GitHub protected-branch administration remains external where applicable.
