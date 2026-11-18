# A03 — Queue, source admission and documentation Git

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C03 + C04.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **25** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | C03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | IA09, IA10 |
| `GW-FR-014-SOURCE-FRESHNESS` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | IA09, IA10 |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | IA13 |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | IA13 |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | C03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD05 | NO_CODE / IA24 verification |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | IA13 |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | C03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD05 | NO_CODE / IA24 verification |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | C03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD05 | IA12 |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | C04 | `GW-DOC-WORKBENCH-UX` | SD04 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C03 package-local R2 consequence | SD05 | IA12 |
| C04 package-local R2 consequence | SD04 | IA09, IA10, IA13 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD04 | Converge UI-created and repository-discovered WorkItems through one daemon new-source QueuePlan/applyPlan admission owner. |
| SD06 | Reuse canonical documentation-Git status/path facts and show exact governed paths/states before commit confirmation. |
| SD05 | Own active/include-archived dataset selection and project/search derivation once at App level. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA09** — execute the exact action defined in `12-action-catalog.md`.
- **IA10** — execute the exact action defined in `12-action-catalog.md`.
- **IA12** — execute the exact action defined in `12-action-catalog.md`.
- **IA13** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
