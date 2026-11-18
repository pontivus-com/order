# A04 — Workbench current attention and Research input

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C05 + C06.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **18** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | C05 | `GW-DOC-WORK-LIFECYCLE` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | C06 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD08 | NO_CODE / IA24 verification |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | C06 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD08 | IA03, IA04 |
| `GW-FR-021-MARKDOWN-WORKSPACE` | C05 | `GW-DOC-MARKDOWN-WORKBENCH` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | C06 | `GW-DOC-MARKDOWN-WORKBENCH` | SD08 | IA03, IA04 |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-201-OBSERVATIONAL-READS` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | C06 | `GW-DOC-WORKBENCH-UX` | SD08 | IA03, IA04 |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-219-EXPLICIT-CONTEXT` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C05 package-local R2 consequence | SD07 | IA14 |
| C06 package-local R2 consequence | SD08 | IA03, IA04, IA14 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD07 | Keep current-attention derivation independent of explicit inspected material and keep the exact owner/action visible and reachable. |
| SD08 | Treat durable-decision human replies as input only; require later adopted canonical authority before stage completion. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA03** — execute the exact action defined in `12-action-catalog.md`.
- **IA04** — execute the exact action defined in `12-action-catalog.md`.
- **IA14** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
