# A05 — Requirements and DESIGN authority mutation

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C07 + C08.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **1** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | C07 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD09 | IA03 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C07 package-local R2 consequence | SD09 | IA03 |
| C08 package-local R2 consequence | SD09 | IA03 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD09 | Reuse one proposal/adoption mechanism for permanent GOVERNANCE mutations with stage-specific P2/P3 vs P4-P6 target/layer/base-hash admission. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA03** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
