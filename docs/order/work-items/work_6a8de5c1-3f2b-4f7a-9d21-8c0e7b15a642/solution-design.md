<!-- Order template: defect-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# A06 execution-fidelity remediation solution design

## Design basis and authority boundary

The corrected canonical owners resolve both fidelity gaps without a new semantic owner.

## D1 — transient provider edit capability envelope

`ExecutionTask.scope/exclusions` remain the only signed semantic path authority and `changeSurface` remains forecast evidence.

For each signed scope pattern, the shell derives the minimum OpenCode resource envelope guaranteed to contain every path the canonical Bun.Glob could admit: a literal pattern remains literal; otherwise the longest literal prefix before the first glob metacharacter is suffixed with OpenCode `*`, using `*` only when the signed pattern has no literal prefix. This is a transient capability superset, not a scope interpretation and is never persisted.

OpenCode permissions remain deny-first. After scope-envelope allows, append last-match edit denies for `.git`, `.git/*`, root/nested `AGENTS.md`, every Approval-closure authority/project-manifest/verification path and every workspace symlink path plus descendants. Shell/execute and external-directory remain denied.

Because the provider wildcard language cannot encode arbitrary Bun.Glob/exclusions exactly, the coordinator remains the exact owner: before executing a BUILDER checkpoint it captures current changed paths and runs `validateChangedPaths(task, changedPaths, protectedPaths)`. Failure emits V2 `SCOPE_BREACH` and no gate effect occurs. Final reviewer V2 remains mandatory.

## D2 — structured reviewer evidence for V6

Extend the existing `REVIEW_PASSED` canonical event with current-provider minimum-change evidence: `minimumChange = MINIMUM_SUFFICIENT | CHANGE_BLOAT` and a null/non-empty `minimumChangeSummary` respectively. Historical persisted REVIEW_PASSED rows without these fields remain parseable only for state compatibility; current productive REVIEWER admission requires the explicit proposition.

`executeReviewerRun` keeps V4 as semantic review. After REVIEW_PASSED and V5, the coordinator maps the proposition: `MINIMUM_SUFFICIENT` appends V6 PASS; `CHANGE_BLOAT` appends `VALIDATION_FAILED / V6 / CHANGE_BLOAT` with review plus variance evidence and invokes the existing bounded remediation reaction.

## Exact implementation surface

Production: `src/core/contracts.ts`, `src/core/execution.ts`, `src/daemon/execution.ts`, `src/shell/opencode.ts`, `src/shell/repository.ts`.

Proof: `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/opencode.test.ts`, `tests/certification.test.ts`.

No new production module is required.

## Architecture constraints

Preserve FCIS, SoC, semantic DRY, strict typing and the no-OOP/no-DTO posture. Add no permission DTO, persisted allowed-path list, second glob matcher, validation stage, gate registry or provider capability family.

## Open technical questions

NONE.
