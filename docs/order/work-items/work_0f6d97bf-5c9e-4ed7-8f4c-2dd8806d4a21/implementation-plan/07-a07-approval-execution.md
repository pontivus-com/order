# A07 — Approval and execution checkpoints

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C11 + C12.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **10** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | C12 | `GW-DOC-WORK-LIFECYCLE` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | C12 | `GW-DOC-WORK-LIFECYCLE` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | C11 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD12 | NO_CODE / IA24 verification |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | C11 | `GW-DOC-MARKDOWN-WORKBENCH` | SD12 | NO_CODE / IA24 verification |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | C12 | `GW-DOC-MARKDOWN-WORKBENCH` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | C11 | `GW-DOC-WORKBENCH-UX` | SD12 | IA06, IA17 |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | C12 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | C11 | `GW-DOC-WORKBENCH-UX` | SD12 | IA17 |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | C12 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | C12 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C11 package-local R2 consequence | SD12 | IA06, IA17 |
| C12 package-local R2 consequence | SD13 | IA07, IA08 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD13 | Add one BUILDER checkpoint-request event; coordinator executes only signed/resolved gates through the existing validation owner. |
| SD12 | Normalize Approval identity canonically and present readiness/currentness before technical package identity. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA06** — execute the exact action defined in `12-action-catalog.md`.
- **IA07** — execute the exact action defined in `12-action-catalog.md`.
- **IA08** — execute the exact action defined in `12-action-catalog.md`.
- **IA17** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
