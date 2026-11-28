# Order repository operating rules

**Canonical concern ID:** `GW-DOC-AGENT-OPERATING-RULES`  
**Versioned concern ID:** `GW-DOC-AGENT-OPERATING-RULES-V1`

These rules apply to all work in this repository. This file owns agent operating instructions only; it does not redefine product, lifecycle, architecture, contract, validation, dependency, or external-fact concerns owned elsewhere.

## Required authority resolution

Before changing Order design or implementation:

1. resolve and read `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
2. resolve and read `GW-DOC-LIFECYCLE-CONTEXT`;
3. for implementation/integration work, resolve and read `GW-DOC-TECHNICAL-ARCHITECTURE`;
4. for data, persistence, transport, manifest or task-contract work, resolve and read `GW-DOC-CANONICAL-CONTRACTS`;
5. before any external dependency/integration/version claim or change, resolve and read `GW-DOC-EXTERNAL-FACTS` plus `GW-DOC-OPENCODE-INTEGRATION-V1` when OpenCode semantics apply;
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
- never create a shadow specification for convenience;
- give Order-owned permanent documentation semantic directory/file names and preserve canonical identifiers across path moves; do not introduce ordinal-prefix filenames as an authority-order mechanism;
- keep change-specific Research / Requirements / Solution design / Implementation plan / Readiness artifacts in the repository-native WorkItem document set governed by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` rather than adding release-specific numbered plans to the permanent design set;
- use Git history, merged pull requests, releases and `CHANGELOG.md` as completed implementation provenance; do not retain superseded/completed copies in the live canonical documentation tree unless an older semantic version must remain independently selectable under `GW-P1-DOC-CANONICALITY`.


## Public repository pull-request delivery

Public repository delivery is governed by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY`.

Operational consequences for agents:

- do not commit, push or otherwise deliver repository changes directly to `master`;
- create/use a short-lived branch under `GW-DOC-PUBLIC-REPOSITORY-DELIVERY` §§2–3 for every documentation, governance, code, test, dependency, configuration or release-metadata change;
- update `CHANGELOG.md` under `[Unreleased]` in every ordinary work PR and declare the exact release impact/target train in the PR body;
- open a pull request to the delivery target admitted by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY` §§2–3; repository write access or a user request to apply a change authorizes the scoped branch/PR work, not bypass of the PR boundary;
- follow the complete-wave publication and CI cadence in `GW-DOC-PUBLIC-REPOSITORY-DELIVERY` §10; accumulate intermediate implementation commits off the active PR ref and publish only a completed wave, never an individual action, phase, fix or handoff;
- do not merge until required verification/status checks for the PR are green and material review discussion is resolved;
- version bumps occur only in dedicated `release/vX.Y.Z` PRs under the canonical release standard;
- after a release PR merges, tags/GitHub Releases/assets are produced only through the governed release path; never tag an unmerged PR head or move an existing release tag;
- preserve any user-authored branch state and never force-push/rewrite history unless the user explicitly requests a recovery operation permitted by repository governance;
- requested repository documents/changes still belong in the repository rather than in ChatGPT attachments or pasted substitute patches; the delivery location is now the PR branch rather than `master`;
- if repository ruleset/administration cannot be modified through the available connection, report that limitation; it does not create permission to bypass the PR process.

Short-lived branch prefixes are limited to the canonical public-delivery set (`feat/`, `fix/`, `docs/`, `chore/`, `release/`, `revert/`).

## Governed campaign/control-state discipline

When a governed campaign/control document declares canonical current-state registers, agents must treat those registers as the only current-state owners.

Operational consequences:

- read the designated concern-state and gate-state registers before reporting or mutating campaign status;
- do not infer current campaign state from document headers, narrative summaries, START/END history, handovers, prior model output, PR descriptions or another branch;
- do not copy files or cite a verified commit on another branch as proof that a campaign branch contains that foundation state;
- where the campaign owner requires a baseline commit to be contained, prove Git ancestry against the actual campaign branch `HEAD` before advancing the gate;
- a downstream foundational defect reopens the affected gate/register state before remediation; the gate returns to PASS only after the correction is governed, integrated into campaign history, and the required fitness/coverage checks are rerun;
- after any campaign-state mutation, run the repository's campaign-state fitness sensor and derive the reported state again from the canonical registers;
- never maintain a second prose status projection for convenience.

These are operating consequences of `GW-P1-DRY`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-DOC-CANONICALITY` and the current campaign owner. They do not create a separate product/lifecycle/state contract.

## Continuous conformance and decision boundaries

All lifecycle context selection, conformance and promotion behavior is owned by `GW-DOC-LIFECYCLE-CONTEXT`.

An agent may decide only what its current lifecycle stage owns. Do not invent missing product intent, let a lower layer redesign a higher one, broaden implementation scope, alter canonical contracts during implementation, or let a reviewer silently repair the work it judges.

Runtime prompts, summaries, prior model output, generated context projections and historical plans/reviews are not canonical authority unless explicitly resolved by the current authority graph.

## Implementation architecture

Implementation must conform to the resolved `GW-P1-*` rules owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, the current technical architecture owned by `GW-DOC-TECHNICAL-ARCHITECTURE`, and minimum-change policy owned by `GW-DOC-MINIMUM-CHANGE-V1`.

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

Under public PR delivery, this exception remains valid **inside the current short-lived PR branch**. Temporary workflows are branch-scoped execution scaffolding; they are not a bypass around pull-request delivery and are not themselves required to survive merge.

- the workflow may perform only the already-authorized task or verification command;
- use the exact pinned versions, commands, inputs and repository baseline required by the canonical authority;
- do not add product/runtime dependencies, production source, alternate build paths or persistent CI architecture through the temporary workflow;
- retained artifacts must already be authorized implementation surface or ordinary verification evidence;
- temporary workflow YAML under `.github/workflows/**` is scaffolding only and is not implementation change surface;
- remove temporary workflow YAML immediately after the required artifact/evidence is obtained or the attempt fails;
- before the PR is marked ready for merge, prove no temporary workflow/scaffolding remains in the PR diff;
- temporary workflow commits may remain in the PR branch history, but the merge candidate tree must not contain them;
- do not retain temporary workflows for possible future reuse;
- do not place credentials or secrets in workflow source.

## Current repository phase

The materialized v1 module ownership/dependency graph remains governed by the current `GW-DOC-TECHNICAL-ARCHITECTURE` §7 and enforced by `tests/architecture.test.ts`.

Continuous implementation preserves that canonical architecture. The historical P7-14 initial implementation plan is provenance, not a standing gate on later maintenance.
