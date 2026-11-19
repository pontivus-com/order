<!-- Order template: defect-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

# A06 execution-foundation remediation research

## Current state/absence

The defect is `CONFIRMED` at repository baseline `ebf266a9017701c9c729d7d7b4a2073d3e59993a`.

## Evidence

### F01 — forecast is enforced as authorization

`src/daemon/validation.ts::validateChangedPaths` currently returns `candidate changed path outside signed changeSurface` before evaluating the signed scope/exclusion contract. This makes forecast absence itself a V2 scope breach.

Current P4/P6 authority instead distinguishes:

- `scope` / `exclusions`: hard signed repository reach;
- `changeSurface`: exact reviewed physical forecast;
- an otherwise admitted unforecast production path: candidate evidence that must proceed through V4/V5/V6 and be proven minimum same-layer architecture-preserving decomposition.

### F02 — checkpoint protocol is absent from the executing baseline

The current canonical RunEvent schema has result events `GATE_PASSED`/`GATE_FAILED` but no BUILDER checkpoint request.

`src/core/execution.ts::builderProviderTags` therefore cannot admit the request.

`src/daemon/execution.ts::executeMutatingRun` performs one provider turn and then always stops the active provider before candidate finalization. It has no coordinator checkpoint reaction/continuation loop.

The existing effect owner already exists: `src/daemon/validation.ts::runRequiredGates` executes resolved project gates and records evidence. The correction therefore requires no new gate registry or effect subsystem.

### Verification-discovered canonical consumer

After the first foundation integration, PR Verification run #1382 reached typecheck and failed at `ui/src/workbench-presentation.ts::runEventPresentation`: the exhaustive `RunEventPayload` switch had no `GATE_CHECKPOINT_REQUESTED` branch. This is a direct typed consumer of the canonical event union, not a new product requirement. The minimum correction is a neutral informational projection plus focused presentation proof; no browser-owned checkpoint state or decision policy is permitted.

## Root cause

The earlier implementation encoded an exact file-list interpretation at V2 and a single-turn BUILDER orchestration model. Later authority clarified that physical forecast and semantic scope are distinct and that architecture feedback is a coordinator-mediated multi-turn control-plane operation.

## Affected producer → consumer paths

```text
SignedTask.scope/exclusions/changeSurface
  -> ExecutionTask
  -> candidate changedPaths
  -> V2 scope admission
  -> V4 semantic review
  -> V5 architecture/governance gates
  -> V6 minimum-change decision
```

```text
BUILDER provider turn
  -> GATE_CHECKPOINT_REQUESTED
  -> core role admission
  -> daemon coordinator
  -> existing verification-gate effect
  -> GATE_PASSED / GATE_FAILED
  -> same Run/session next provider turn
```

## Existing capabilities to reuse

- canonical `RunEventPayload` union;
- `providerEventIsAdmitted`;
- existing OpenCode session and active-provider ownership;
- `runVerificationGate` and gate evidence writer;
- current Approval/material freshness checks;
- existing OpenCode role-specific output-contract generation in `src/shell/opencode.ts`;
- existing exhaustive RunEvent presentation projection in `ui/src/workbench-presentation.ts`;
- existing V3/V5/V7 validation stages;
- V4 independent reviewer and V6 minimum-change boundary.

## Unresolved facts

NONE.

## Verdict

`CONFIRMED`.

R2 may retain existing P3 semantics and state only the exact package consequences required to realize F01/F02.
