---
{
  "formatVersion": 1,
  "id": "work_f759b678-0c4d-4b3b-861d-59378e39a936",
  "projectId": "order",
  "concernIds": [
    "foundation",
    "core",
    "daemon",
    "shell",
    "verification"
  ],
  "schemaId": "defect-v2"
}
---
# Close the A06 execution-foundation surface and checkpoint defects

## Observed behavior

The governed 0.6.0 ALIGN-A06 audit found two execution-foundation defects that make the product WorkItem's current PLAN non-executable.

1. **ALIGN-A06-F01 / C12-F02:** V2 currently treats signed `changeSurface` as an exhaustive literal-path whitelist. An otherwise in-scope changed path is classified `SCOPE_BREACH` solely because it was not forecast, contradicting the current execution-control/P6 contract.
2. **ALIGN-A06-F02 / C12-F01:** the BUILDER provider can perform only one turn. The coordinator tears down the provider after that turn and the canonical RunEvent contract/admission set has no `GATE_CHECKPOINT_REQUESTED`, so a signed in-task architecture checkpoint cannot be executed and followed by continuation of the same Run/session.

## Expected behavior

Implement the already-governed execution-control baseline:

- signed `scope` and `exclusions` remain the hard repository reach;
- `changeSurface` remains an immutable reviewed forecast, not a second authorization list;
- forecast variance alone does not cause V2 `SCOPE_BREACH`; V4/V5/V6 remain responsible for proving minimum same-layer architecture-preserving variance;
- repository instruction, signed authority/governance/verification material and other existing protected-path rules remain fail-closed at their existing validation owners;
- `GATE_CHECKPOINT_REQUESTED { gateId }` is the one canonical BUILDER-only provider request;
- the requested gate must belong to the signed task and resolve from the current manifest;
- the coordinator executes the gate in the same builder workspace, records existing `GATE_PASSED`/`GATE_FAILED` evidence, and continues the same Run/provider session;
- checkpoint results do not substitute for V3/V5/V7;
- provider shell/execute permission remains denied.

## Reproduction/evidence

At branch baseline `ebf266a9017701c9c729d7d7b4a2073d3e59993a`:

- `src/daemon/validation.ts::validateChangedPaths` rejects every changed path absent from `task.changeSurface` before scope/exclusion validation can admit it;
- `src/core/contracts.ts` has `GATE_PASSED`/`GATE_FAILED` but no `GATE_CHECKPOINT_REQUESTED`;
- `src/core/execution.ts::builderProviderTags` omits checkpoint requests;
- `src/shell/opencode.ts` derives provider role output contracts from those tag sets and must advertise the checkpoint only to BUILDER;
- `src/daemon/execution.ts::executeMutatingRun` performs one `runOpenCodeTurn`, persists it, stops the provider, and immediately finalizes/block/publishes the candidate.

## Governing authority

- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`
- `GW-DOC-MINIMUM-CHANGE-V1`
- `GW-DOC-LIFECYCLE-CONTEXT-V2`
- `GW-DOC-WORK-LIFECYCLE-V1`
- `GW-DOC-VALIDATION-STANDARD-V1`
- `GW-DOC-EXECUTION-CONTROL-PLANE-V1`
- `GW-DOC-TECHNICAL-ARCHITECTURE-V2`
- `GW-DOC-CANONICAL-CONTRACTS-V2`

## Behavior that must remain unchanged

No product/UI behavior, Approval model, task dependency model, provider permission policy, persistence schema, HTTP contract, dependency, DTO/model family or alternate validation state is introduced. The stale 0.6.0 PLAN is not modified by this WorkItem.

## Impact/context

This is the separately governed prerequisite required by `ALIGN-A06-F01` and `ALIGN-A06-F02`. The 0.6.0 campaign may re-enter its documented freshness sequence only after this correction is integrated into the campaign branch ancestry and independently verified.
