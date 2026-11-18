# A11 — Component/theme consistency and certification

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C19 + C20.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **7** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | C20 | `GW-DOC-WORK-LIFECYCLE` | SD19 | IA23, IA24 |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | C20 | `GW-DOC-LIFECYCLE-CONTEXT` | SD19 | IA23, IA24 |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | C20 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD19 | IA23 |
| `GW-FR-227-CERTIFICATION-MATRIX` | C20 | `GW-DOC-WORKBENCH-UX` | SD19 | IA21, IA22, IA23 |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | C19 | `GW-DOC-WORKBENCH-UX` | SD19 | IA20, IA22 |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | C19 | `GW-DOC-WORKBENCH-UX` | SD19 | IA20, IA22 |
| `GW-FR-235-GLOBAL-THEME-PARITY` | C19 | `GW-DOC-WORKBENCH-UX` | SD19 | IA22 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C19 package-local R2 consequence | SD19 | IA20, IA22 |
| C20 package-local R2 consequence | SD19 | IA20, IA21, IA22, IA23, IA24 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD19 | Close permanent renderer, work-kind Research/downstream and System/Light/Dark component/theme certification gaps using existing verification owners. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA20** — execute the exact action defined in `12-action-catalog.md`.
- **IA21** — execute the exact action defined in `12-action-catalog.md`.
- **IA22** — execute the exact action defined in `12-action-catalog.md`.
- **IA23** — execute the exact action defined in `12-action-catalog.md`.
- **IA24** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
