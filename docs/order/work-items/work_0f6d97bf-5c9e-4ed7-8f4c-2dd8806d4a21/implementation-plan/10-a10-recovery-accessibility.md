# A10 — Recovery, current attention and accessibility

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C17 + C18.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **7** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | C17 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | C17 | `GW-DOC-MARKDOWN-WORKBENCH` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | C17 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | C17 | `GW-DOC-WORKBENCH-UX` | SD07 | IA14 |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | C17 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | C18 | `GW-DOC-WORKBENCH-UX` | SD18 | IA15 |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | C17 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C17 package-local R2 consequence | SD17 | NO_NEW_STATE — SD17 retained; IA14 consumes the existing current-attention owner. |
| C18 package-local R2 consequence | SD18 | IA15 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD17 | Positive no-new-state disposition: existing recovery/current-attention/coherence owners remain canonical; presentation corrections consume them. |
| SD07 | Keep current-attention derivation independent of explicit inspected material and keep the exact owner/action visible and reachable. |
| SD18 | Move focus once to the relevant required-input composer keyed by exact request identity; never poll-steal focus or inspect private Astryx DOM. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA14** — execute the exact action defined in `12-action-catalog.md`.
- **IA15** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
