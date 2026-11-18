# A02 — Project governance and WorkItem intake

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C22 + C02.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **8** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | C22 | `GW-DOC-WORK-LIFECYCLE` | SD02 | IA01, IA02 |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-029-NO-IDE-SCOPE` | C02 | `GW-DOC-MARKDOWN-WORKBENCH` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | IA11 |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | C22 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD02 | IA01, IA02 |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | C22 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD02 | IA01, IA02 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C22 package-local R2 consequence | SD02 | IA01, IA02 |
| C02 package-local R2 consequence | SD03 | IA09, IA10, IA11 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD02 | Resolve same-layer precedence plus P1 default/override/extension/fitness bindings in the pure governance core before productive provider context. |
| SD03 | Correct Create presentation to canonical Concerns language and fixed same-project remediation context; no new command/schema. |
| SD04 | Converge UI-created and repository-discovered WorkItems through one daemon new-source QueuePlan/applyPlan admission owner. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA01** — execute the exact action defined in `12-action-catalog.md`.
- **IA02** — execute the exact action defined in `12-action-catalog.md`.
- **IA09** — execute the exact action defined in `12-action-catalog.md`.
- **IA10** — execute the exact action defined in `12-action-catalog.md`.
- **IA11** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
