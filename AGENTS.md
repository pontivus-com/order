# Order repository operating rules

**Canonical concern ID:** `GW-DOC-AGENT-OPERATING-RULES`  
**Versioned concern ID:** `GW-DOC-AGENT-OPERATING-RULES-V1`

These rules apply to all work in this repository. This file owns agent operating instructions only; it does not redefine product, lifecycle, architecture, contract, validation, dependency, or external-fact concerns owned elsewhere.

## Required authority resolution

Before changing Order design or implementation:

1. resolve and read `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
2. resolve and read `GW-DOC-LIFECYCLE-CONTEXT-V1`;
3. for implementation/integration work, resolve and read `GW-DOC-TECHNICAL-ARCHITECTURE-V1`;
4. for data, persistence, transport, manifest or task-contract work, resolve and read `GW-DOC-CANONICAL-CONTRACTS-V1`;
5. before any external dependency/integration/version claim or change, resolve and read `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` plus `GW-DOC-OPENCODE-INTEGRATION-V1` when OpenCode semantics apply;
6. when work is executed under a current signed P7 task, resolve that task's authority references and do not exceed its semantic scope;
7. treat implementation and tests as evidence below those authorities.

All identifiers resolve through root `pontivus-order.toml [refs]`. A lower layer may not override a higher layer by contradiction.

## Canonical concern discipline

`GW-P1-DOC-CANONICALITY` is binding.

For every governed concern:

- use the canonical `GW-DOC-*` identifier rather than copying the owner's normative wording into this file, a plan, review, prompt, handover, or another standard;
- use the versioned identifier when the exact semantic version/snapshot matters;
- if the concern already has an owner, change that owner rather than creating a second specification;
- if a genuinely new concern needs documentation, establish one canonical owner and identifiers before other documents depend on it;
- local documents may state only their own consequence, dependency, evidence, or integration obligation and cite the owner identifier;
- never create a shadow specification for convenience.


## Master-only repository delivery

Order uses `master` as the normal and sole agent working branch.

- do not create or retain task, governance, implementation, verification, review, temporary, or other sub-branches/worktrees unless the current user request explicitly requires a branch;
- a user request to create, update, correct, or otherwise change a repository document is itself authorization to write and commit that exact documentation scope directly to `master` immediately when repository write access is available; do not require a separate proposal, adoption, approval, or commit-confirmation turn first;
- for non-documentation repository changes, an explicit user request to apply a defined work package or change set authorizes the agent to write and commit exactly that requested scope directly to `master`; no separate commit-confirmation turn is required;
- authorization is scope-bounded: it does not authorize adjacent changes, history rewriting, force-pushes, or later unrelated work;
- before writing, verify that the target/local branch is `master`, preserve any existing user-authored working-tree state, and verify that no unmerged branch-only work would be lost;
- do not use ChatGPT chat, generated attachments, pasted patches, or temporary branches as the delivery location for a requested repository document or other authorized repository change when repository write access is available; write the change into the repository first and keep chat output to a concise status/result;
- only provide a full document, patch, or substitute delivery artifact in ChatGPT when the user explicitly asks for that form or repository write access is unavailable;
- verification scaffolding does not create a branch exception. When temporary GitHub Actions scaffolding is necessary under the rule below, it is added and removed on `master` within the authorized work.

## Continuous conformance and decision boundaries

All lifecycle context selection, conformance and promotion behavior is owned by `GW-DOC-LIFECYCLE-CONTEXT-V1`.

An agent may decide only what its current lifecycle stage owns. Do not invent missing product intent, let a lower layer redesign a higher one, broaden implementation scope, alter canonical contracts during implementation, or let a reviewer silently repair the work it judges.

Runtime prompts, summaries, prior model output, generated context projections and historical plans/reviews are not canonical authority unless explicitly resolved by the current authority graph.

## Implementation architecture

Implementation must conform to the resolved `GW-P1-*` rules owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, the concrete v1 architecture owned by `GW-DOC-TECHNICAL-ARCHITECTURE-V1`, and minimum-change policy owned by `GW-DOC-MINIMUM-CHANGE-V1`.

Operational consequences for agents:

- extend the existing canonical semantic owner instead of introducing a parallel representation or owner;
- preserve the declared module responsibility and dependency graph;
- if an existing module would acquire a second present responsibility/effect boundary, perform the minimum architecture-preserving same-layer decomposition permitted by the canonical architecture rather than growing a catch-all;
- register any new production module in the permanent architecture fitness sensor in the same change;
- do not weaken or conditionalize an architecture sensor merely to make a change pass;
- do not introduce an architecture, abstraction, dependency, state model, public contract, or behavior outside the authority of the current task.

The semantic definitions of FCIS, SoC, canonical ownership, strict typing, no-OOP/no-DTO posture, minimum change and architecture-preserving decomposition are not repeated here; resolve their canonical identifiers.

## Temporary GitHub Actions operational scaffolding

This file canonically owns this agent-only operational exception.

Temporary GitHub Actions workflows may be used only as execution scaffolding when an already-authorized implementation or verification activity cannot be run through the available local/runtime/connectors.

- the workflow may perform only the already-authorized task or verification command;
- use the exact pinned versions, commands, inputs and repository baseline required by the canonical authority;
- do not add product/runtime dependencies, production source, alternate build paths or persistent CI architecture through the temporary workflow;
- retained artifacts must already be authorized implementation surface or ordinary verification evidence;
- temporary workflow YAML under `.github/workflows/**` is scaffolding only and is not implementation change surface;
- remove temporary workflow YAML immediately after the required artifact/evidence is obtained or the attempt fails;
- before candidate validation/handoff, prove no temporary workflow/scaffolding remains in the candidate tree/diff;
- do not retain temporary workflows for possible future reuse;
- do not place credentials or secrets in workflow source.

## Current repository phase

The materialized v1 module ownership/dependency graph is owned by `GW-DOC-TECHNICAL-ARCHITECTURE-V1` §7 and enforced by `tests/architecture.test.ts`.

Continuous implementation preserves that canonical architecture. The historical P7-14 initial implementation plan is provenance, not a standing gate on later maintenance.
