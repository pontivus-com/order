<!-- Order template: defect-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

# A06 execution-fidelity remediation research

## Current state/absence

`CONFIRMED` at campaign baseline `879cfdf079190abb9036faec060fa7b7a46a73f9`.

## Evidence

### F01A — productive permission still treats forecast as authorization

`openCodePermissionRules()` installs deny-first permissions and then one `edit` allow per literal `task.changeSurface`. OpenCode v2.2.6 uses ordered last-match-wins wildcard rules and its `*` spans `/`. The provider has no shell/execute fallback. Therefore an otherwise valid unforecast same-layer split is impossible to produce even though `validateChangedPaths()` would admit it.

### F01B — V6 cannot fail

After V4 review and V5 governance pass, `executeReviewerRun()` records `validation/v6-change-surface.json` and immediately appends `VALIDATION_PASSED / V6`. `CHANGE_BLOAT` exists in the canonical validation classification and remediation policy, but no structured current reviewer result can cause the coordinator to emit it at V6.

## Root cause

The first prerequisite repaired downstream V2 and checkpoint orchestration but did not trace the complete producer → provider permission → workspace → V2 → V4 → V5 → V6 path. Tests certified the obsolete exact-forecast permission model and only checked that V6 evidence was written, not that V6 could reject a reducible candidate.

## Existing capabilities to reuse

Canonical `ExecutionTask.scope/exclusions/changeSurface`; `repositoryPatternMatches()` / `validateChangedPaths()`; deny-first OpenCode permission binding; Approval-closure protected material; workspace symlink inspection; current V4/V5/V6 RunEvents; `CHANGE_BLOAT` bounded remediation; and the current checkpoint continuation/gate owner.

## Unresolved facts

NONE.

## Verdict

`CONFIRMED`.
