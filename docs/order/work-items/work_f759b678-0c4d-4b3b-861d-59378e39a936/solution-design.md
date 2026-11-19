<!-- Order template: defect-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# A06 execution-foundation remediation solution design

## Design basis and authority boundary

This design implements the current `GW-DOC-EXECUTION-CONTROL-PLANE-V1` §§12-13 and `GW-DOC-CANONICAL-CONTRACTS-V2` §§37.6-37.8. Those canonical owners already contain the resolved semantics; this WorkItem owns only their implementation consequence.

## Requirement-to-solution map

| Requirement | Technical realization |
|---|---|
| F01 / GW-FR-003 / GW-FR-004 / GW-FR-006 | Remove forecast-membership rejection from V2 scope admission. Keep scope/exclusion/instruction boundaries. Feed exact actual changed paths plus the signed task forecast into the existing V4 reviewer; require that review to classify forecast variance as minimum architecture-preserving decomposition or fail. V5 continues to run manifest governance fitness across the resulting workspace. V6 consumes the independent review evidence and no longer treats a new file as bloat solely because it was unforecast. |
| F02 / GW-FR-003 / GW-FR-004 | Add `GATE_CHECKPOINT_REQUESTED` to the canonical RunEvent union; admit it only for BUILDER; validate one terminal request per turn; execute the signed gate through the existing validation effect owner; persist existing gate result/evidence; continue the same active provider/session and Run with the result as next trigger. |

## Canonical owner / affected boundaries

- event schema: existing `src/core/contracts.ts`;
- pure role/turn policy: existing `src/core/execution.ts`;
- gate effect/evidence: existing `src/daemon/validation.ts`;
- execution orchestration: existing `src/daemon/execution.ts`;
- provider session/effect boundary: unchanged `src/shell/opencode.ts`, no new permission;
- persistence: unchanged RunEvent persistence.

## Data/control flow

```text
provider BUILDER turn
  -> canonical event parse
  -> pure role + checkpoint-turn admission
  -> persist GATE_CHECKPOINT_REQUESTED
  -> freshness + signed gate check
  -> existing runVerificationGate effect
  -> persist GATE_PASSED / GATE_FAILED + evidence
  -> same active server/session, same Run
  -> next provider turn
```

```text
candidate changedPaths
  -> V2: instruction + scope + exclusions only
  -> V3
  -> V4: reviewer sees task.changeSurface + exact changedPaths/diff
  -> V5: governance/architecture gates over candidate workspace
  -> V6: minimum-change verdict supported by V4 evidence
```

## Exact implementation surface

Production:
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/daemon/validation.ts`
- `src/daemon/execution.ts`

Proof:
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/certification.test.ts`

No new production module is required.

## Failure/recovery behavior

- non-BUILDER checkpoint request: provider admission failure;
- more than one request or non-terminal request: provider admission failure;
- unsigned/unresolved gate: provider failure; no gate execution;
- stale Approval/material before checkpoint: existing stale/precondition reaction;
- gate failure: persisted `GATE_FAILED`; same Run/session receives the failure and may correct only within signed design/scope or explicitly block;
- provider/session failure remains governed by existing operational recovery;
- checkpoint does not create or consume semantic repair budget.

## Architecture constraints

Preserve FCIS, SoC, DRY/canonical ownership and strict typing. Add no class, service, repository, DTO/mapper, persisted checkpoint state, alternate allowed-path list or provider execute capability.

## Verification obligations

Core:
- schema accepts checkpoint request;
- only BUILDER role admits it;
- terminal/one-per-turn policy rejects invalid batches.

Daemon:
- V2 admits in-scope unforecast path and still rejects instruction/out-of-scope/excluded paths;
- signed checkpoint gate executes and records result;
- same Run/session performs a second BUILDER turn after checkpoint;
- unsigned gate is rejected without execution;
- pass/fail continuation behavior is covered.

Certification:
- production contract contains checkpoint request;
- execution prompt uses coordinator request semantics rather than telling provider to execute gates;
- V2 no longer uses changeSurface as hard whitelist.

## Open technical questions

NONE.
