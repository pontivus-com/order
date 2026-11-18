# A06 — PLAN contract and R3 readiness

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C09 + C10.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **3** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | C10 | `GW-DOC-SPECIFICATION-STANDARD` | SD11 | NO_CODE / IA24 verification |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | C10 | `GW-DOC-WORKBENCH-UX` | SD11 | NO_CODE / IA24 verification |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | C10 | `GW-DOC-WORKBENCH-UX` | SD11 | IA16 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C09 package-local R2 consequence | SD10 | IA05 |
| C10 package-local R2 consequence | SD11 | IA16 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD11 | Project the typed R3 outcome as the primary Readiness verdict; material maturity/currentness remains separate. |
| SD10 | Strengthen the existing SignedTaskBlock/parser/validator so an implementation-required package cannot be vacuous. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA05** — execute the exact action defined in `12-action-catalog.md`.
- **IA16** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
