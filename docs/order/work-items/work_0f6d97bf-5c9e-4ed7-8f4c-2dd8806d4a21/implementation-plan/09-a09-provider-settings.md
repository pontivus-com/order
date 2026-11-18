# A09 — Provider/OpenCode and Settings

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C15 + C16.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

## Stable functional requirements

This phase accounts for **21** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | C16 | `GW-DOC-WORK-LIFECYCLE` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | IA18 |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

## Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C15 package-local R2 consequence | SD15 | NO_CODE — SD15 positive no-production-delta; IA24 preserves provider boundary. |
| C16 package-local R2 consequence | SD16 | IA18 |

## Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD16 | Recompose Settings around operator readiness/meaning/actions while retaining exact technical identity under Technical details except active path-entry tasks. |
| SD15 | Positive no-production-delta: existing OpenCode/provider/session/permission/failure architecture already satisfies the reconstructed functional obligations. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

## Implementation actions

- **IA18** — execute the exact action defined in `12-action-catalog.md`.

## Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.
