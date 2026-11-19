<!-- Order template: defect-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

# A06 execution-foundation remediation requirements

## P2 intent and R1 factual basis

This package restores the already-governed execution-control semantics needed by the 0.6.0 campaign. It introduces no new product behavior.

## Functional authority disposition ledger

| Requirement | Disposition | Canonical P3 owner |
|---|---|---|
| GW-FR-003-DURABLE-BOUNDED-EXECUTION | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| GW-FR-004-INDEPENDENT-VALIDATION | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| GW-FR-006-MINIMUM-VERIFIED-CANDIDATE | REFERENCE | GW-DOC-WORK-LIFECYCLE |

## Required observable outcome/delta

### F01 execution-surface consequence

- signed `scope` and `exclusions` remain the hard execution boundary;
- `changeSurface` remains the exact immutable forecast;
- a changed path outside scope, admitted by exclusions, or prohibited by existing repository/governance rules still fails closed;
- a path absent only from `changeSurface` is not automatically `SCOPE_BREACH`;
- actual changed paths and the signed forecast are both available to independent semantic/minimum-change review;
- unforecast variance is acceptable only when it is the minimum same-layer physical decomposition needed to preserve an already-resolved responsibility/effect boundary without changing semantic owner, public contract, state meaning, dependency direction/external dependency, validation contract or authorized behavior.

### F02 checkpoint consequence

- only BUILDER may emit `GATE_CHECKPOINT_REQUESTED`;
- at most one checkpoint request is admitted per provider turn and it is that turn's terminal action;
- `gateId` must be in the signed task's gate set and resolve from the current validated project manifest;
- current Approval/material context must remain fresh before coordinator gate execution;
- coordinator executes the existing gate owner in the current builder workspace and records existing gate result/evidence;
- the same Run and same live provider session continue from that result;
- a pass permits continuation; a failure permits only in-scope correction under the signed design or an explicit block;
- checkpoint results never substitute for V3/V5/V7;
- the shell-owned provider output contract advertises the request only to BUILDER; no provider shell/execute capability is granted;
- any existing exhaustive RunEvent presentation projects the checkpoint request as neutral coordinator-owned verification activity and does not acquire checkpoint state, admission or decision ownership.

## Acceptance criteria

The correction is complete when core/daemon/certification proof demonstrates all F01/F02 positive and negative cases, the project architecture gate remains green, and the exact branch head passes dependency-lock, typecheck, architecture, test, build and materially applicable browser verification.

## Scope/exclusions

In scope:
- canonical RunEvent checkpoint request;
- pure role/turn admission and exact BUILDER-only provider output contract;
- execution coordinator checkpoint reaction/continuation;
- V2 forecast/scope distinction;
- V4/V5/V6 forecast-variance proof flow;
- focused core/daemon/presentation/certification tests.

Out of scope:
- 0.6.0 feature/UI redesign or checkpoint policy in the browser;
- stale 0.6.0 PLAN regeneration;
- new persistence/transport/API/dependency/state model;
- provider execute permission;
- dynamic task/scope mutation;
- second gate registry or variance representation.

## Open product/authority questions

NONE.
