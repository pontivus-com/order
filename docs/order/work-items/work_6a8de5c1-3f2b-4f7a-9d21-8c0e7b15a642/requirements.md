<!-- Order template: defect-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# A06 execution-fidelity remediation requirements

## P2 intent and R1 factual basis

Restore the already-authorized forecast-vs-scope and V6 anti-bloat semantics. No new product behavior is introduced.

## Functional authority disposition ledger

| Requirement | Disposition | Canonical P3 owner |
|---|---|---|
| GW-FR-003-DURABLE-BOUNDED-EXECUTION | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| GW-FR-004-INDEPENDENT-VALIDATION | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| GW-FR-006-MINIMUM-VERIFIED-CANDIDATE | REFERENCE | GW-DOC-WORK-LIFECYCLE |

## Required observable outcome/delta

- BUILDER/REMEDIATOR native edit capability is derived from signed scope rather than forecast and remains deny-first.
- Immutable Git metadata, root/nested `AGENTS.md`, signed authority/project-manifest/verification material and workspace symlink mutation remain hard-denied at provider admission.
- Exact Bun.Glob scope/exclusion/protected-path validation remains the semantic owner; provider wildcard projection is not a second authorization list.
- No checkpoint gate observes a workspace whose current diff fails exact V2 admission.
- Current reviewer PASS output carries an explicit minimum-change proposition. V4 may pass while V6 independently fails `CHANGE_BLOAT`.
- A V6 bloat failure creates only the existing single targeted REMEDIATOR entitlement; recurrence blocks.

## Acceptance criteria

Permanent proof demonstrates: an in-scope path absent from `changeSurface` receives productive edit capability; immutable paths remain denied; an out-of-scope/excluded intermediate checkpoint diff executes no gate; a reducible candidate reaches coordinator-owned `VALIDATION_FAILED / V6 / CHANGE_BLOAT`; a reduced candidate may subsequently pass; and the exact final head passes the complete project verification union.

## Scope/exclusions

In scope: existing canonical contracts, OpenCode integration/technical architecture/execution-control/validation authority, current core/daemon/shell owners and focused verification.

Out of scope: provider shell/execute, new dependency, persistence/transport schema, alternate task/scope/variance model, dynamic scope mutation, stale 0.6.0 PLAN regeneration, unrelated UI/product work.

## Open product/authority questions

NONE.
