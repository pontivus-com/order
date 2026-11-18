# A08 — Complete and governed materials

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C13 + C14.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **7** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | C13 | `GW-DOC-MARKDOWN-WORKBENCH` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | C13 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C13 package-local R2 consequence | SD14 | NO_CODE — SD14 positive no-production-delta; IA24 preserves terminal semantics. |
| C14 package-local R2 consequence | SD14 | NO_CODE — SD14 positive no-production-delta; IA24 preserves material semantics. |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD14 | Positive no-production-delta: existing COMPLETE/material/proposal/evidence owners already satisfy the reconstructed functional obligations. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- No dedicated production action. This phase is a positive no-production-delta disposition and is verified under IA24.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
