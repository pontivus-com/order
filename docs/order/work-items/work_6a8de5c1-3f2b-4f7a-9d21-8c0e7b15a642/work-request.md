---
{
  "formatVersion": 1,
  "id": "work_6a8de5c1-3f2b-4f7a-9d21-8c0e7b15a642",
  "projectId": "order",
  "concernIds": ["foundation", "core", "daemon", "shell", "verification"],
  "schemaId": "defect-v2"
}
---
# Close A06 execution-permission and V6 fidelity defects

## Observed behavior

Adversarial post-foundation review disproved the prior ALIGN-A06-F01 closure.

1. `src/shell/opencode.ts::openCodePermissionRules` still grants BUILDER/REMEDIATOR `edit` only for exact `ExecutionTask.changeSurface` paths. The corrected V2 validator can admit an unforecast in-scope path, but the productive provider cannot create it.
2. `src/daemon/execution.ts::executeReviewerRun` writes V6 forecast/actual evidence and then unconditionally appends `VALIDATION_PASSED / V6` after V4/V5. The canonical `CHANGE_BLOAT` V6 failure is unreachable.

## Expected behavior

- `scope`/`exclusions` remain the signed semantic repository boundary; `changeSurface` remains only the immutable forecast.
- Productive mutating OpenCode permissions permit legitimate in-scope unforecast physical decomposition without granting shell/execute or allowing immutable authority/instruction/Git/symlink mutation.
- Provider wildcard projection is only a transient capability envelope. Exact signed scope/exclusion admission remains coordinator-owned and runs before any checkpoint effect and at final V2.
- Independent review returns structured minimum-change evidence; after V4 and V5 the coordinator emits either V6 PASS or `VALIDATION_FAILED / V6 / CHANGE_BLOAT`.
- No new task model, DTO, persistence state, service/repository/controller family, dependency or alternate validation owner.

## Governing authority

`GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, `GW-DOC-MINIMUM-CHANGE-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V2`, `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-VALIDATION-STANDARD-V1`, `GW-DOC-EXECUTION-CONTROL-PLANE-V1`, `GW-DOC-TECHNICAL-ARCHITECTURE-V2`, `GW-DOC-CANONICAL-CONTRACTS-V2`, `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`, `GW-DOC-OPENCODE-INTEGRATION-V1`.

## Behavior that must remain unchanged

The already-correct BUILDER checkpoint protocol, provider shell/execute denial, Approval/task persistence model, V0-V7 ordering, V2 Bun.Glob owner, V5 governance gates, bounded remediation policy and stale 0.6.0 PLAN remain unchanged except for the exact fidelity corrections above.
