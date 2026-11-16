---
{
  "formatVersion": 1,
  "id": "work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2",
  "projectId": "order",
  "concernIds": [
    "core",
    "daemon",
    "foundation",
    "shell",
    "ui",
    "verification"
  ],
  "schemaId": "audit-v1"
}
---
# Audit Order 0.5.0 workflow, Workbench, and OpenCode execution correctness

<!-- Order template: audit-intake-v1; authority: GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1, GW-DOC-WORK-LIFECYCLE-V1 -->

## Target under audit

Audit the released Order 0.4.0 implementation and its current canonical authority as the baseline for the 0.5.0 corrective release train.

The audit target is the complete productive workflow system rather than one isolated symptom:

- the WorkItem lifecycle/state machine from IDEA through R1, R2, DESIGN, PLAN, R3, AWAITING_SIGNOFF, EXECUTION and COMPLETE;
- STAGE Run interaction state, provider-turn grammar, proposal state, required-input ownership, blockers, retries/resume/reconciliation, cancellation, asynchronous convergence and reached-history semantics;
- Approval, execution-task ownership, validation boundaries, remediation/reviewer continuation and terminal-result behavior;
- the complete OpenCode productive execution context for STAGE, BUILDER, REMEDIATOR and REVIEWER roles, including exact workspace materialization, authority/context projection, prompt assembly, provider output contracts, tool permissions, trusted integrations, session reuse/continuation, diagnostics, failure classification and provider/coordinator reaction;
- the complete Workbench information architecture and structural UX/UI across Queue, Create, Settings/account management, Work request/Source, every pre-signoff workflow step, Readiness, Approval, Implementation, Complete, Context, dialogs/drawers, evidence and error/recovery states;
- permanent core, daemon, integration, architecture and browser certification that is supposed to prove those semantics.

A confirmed release-blocking defect is already known: the 0.4.0 STAGE core validator rejects a lifecycle `ARTIFACT_PROPOSAL_CREATED` when the same provider-result batch also contains `HUMAN_INPUT_REQUESTED`, `STAGE_BLOCKED` or `STAGE_COMPLETED`, while the provider-facing output contract enumerates those tags individually but does not state the required batch-level exclusivity grammar. The audit must treat this as evidence of a producer/consumer contract-closure failure and determine whether the same failure class exists elsewhere.

## Governing authority/criteria

The audit is governed by the current canonical authority graph, in particular:

- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
- `GW-DOC-WORK-LIFECYCLE-V1`;
- `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- `GW-DOC-WORKBENCH-UX-V2`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`;
- `GW-DOC-WORKBENCH-THEME-V1`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`;
- `GW-DOC-OPENCODE-INTEGRATION-V1`;
- `GW-DOC-CANONICAL-CONTRACTS-V1`;
- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- `GW-DOC-INSTALLATION-READINESS-V1`;
- `GW-P1-FCIS`, `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW` and `GW-P1-MINIMUM-CHANGE`.

The audit must prove, rather than assume:

1. **State-machine closure** — every admitted event/command has exactly one valid source state, transition and resulting canonical state; every impossible combination is rejected before persistence; no browser, daemon or feature-local policy silently creates a second transition/state owner.
2. **Producer→carrier→consumer agreement** — prompts/provider contracts, canonical event schemas, role admission, batch validators, persistence, coordinator reactions, browser projections and tests express the same semantics end to end. A downstream validator may not enforce a material rule that the productive producer was never told to obey when that producer is expected to generate conforming output.
3. **OpenCode execution fidelity** — productive behavior is validated against the exact pinned OpenCode integration facts and Order-owned integration contract, including session/context semantics, instruction closure, workspace visibility, permissions, trusted integration exposure, output acquisition and failure boundaries. No behavior may be inferred from generic OpenCode knowledge or a newer upstream release.
4. **Interaction correctness** — the current-attention owner, available actions, selected material, feedback owner and recovery route are deterministic for every workflow condition and cannot contradict the canonical lifecycle state.
5. **Structural UX/UI correctness** — every screen uses the canonical information hierarchy, interaction-space class, Workbench primitive/component language, stable geometry, navigation semantics and theme behavior. Shared visual defects or structural inconsistencies must be traced to their common owner rather than patched screen by screen.
6. **Certification closure** — permanent tests must cover both the accepting path and the material negative/contradictory path at the correct producer/consumer boundaries; green tests are not sufficient where the real productive contract is absent from the test surface.

## Scope/exclusions

### In scope

Perform a systematic matrix audit, not spot checks.

For lifecycle and state semantics, cover at minimum:

- IDEA creation/source reconciliation and R1 start;
- forward completion and all governed backward returns;
- PROCESSING / OPEN / REQUIRED_INPUT / CLOSED STAGE interaction;
- free-form continuation versus exact required-input response;
- proposal NONE / PENDING / ADOPTION_IN_PROGRESS / disposition;
- proposal creation, adoption, rejection and interruption recovery;
- STAGE completion, block, failure, retry, resume and cancellation races;
- source/lifecycle authority change and stale/current material;
- R3 readiness outcomes and Approval package currentness/sign-off;
- monotonic reached history across returns;
- execution-task current owner, blocker precedence and historical selection;
- BUILDER → REVIEWER / REMEDIATOR continuation chains;
- V0–V7 validation ownership, candidate identity and terminal completion;
- async browser convergence and command commit recheck;
- error/failure classification and exact recovery action.

For OpenCode execution context, cover at minimum:

- process/server startup and exact pinned version admission;
- per-Run workspace construction and baseline/delta identity;
- project/repository instruction discovery and exact authority resolution;
- generated stage prompt plus provider output contract composition;
- role-specific event/tag and cross-event grammar communicated to the provider;
- model/account/session binding and session continuation behavior;
- tool/permission rules, external reference roots, trusted skills/MCP integrations and filesystem escape prevention;
- provider response extraction, format repair, canonical parsing and role admission;
- complete-batch validation and transactional persistence/reaction;
- diagnostics/evidence sufficient to reconstruct failure origin without persisting hidden reasoning;
- cancellation, timeout, provider failure, local precondition failure and stale-context handling.

For UX/UI, audit every primary service/screen and every material state, including:

- Queue;
- Create WorkItem;
- Settings, repository configuration, OpenCode accounts and readiness;
- WorkItem identity/workflow rail;
- Work request/Source editor and Git controls;
- R1 Research;
- R2 Requirements;
- DESIGN;
- PLAN;
- R3 Readiness;
- Approval;
- Implementation;
- Complete/result;
- current Context/technical details;
- proposal review;
- active/historical Run dialogue and event timeline;
- evidence/code views;
- required-input, processing, proposal-decision, adoption-in-progress, blocked, stale, failed, retry/resume/reconcile, empty, loading and terminal states;
- wide, medium and narrow responsive layouts;
- System/Light/Dark presentation and Astryx primitive parity.

Evaluate recurring UX/UI defects as potential failures of shared primitives, composition rules, information hierarchy or theme/layout ownership. Do not accept local cosmetic patches when the defect is structurally shared.

### Exclusions

- This AUDIT does not itself authorize corrective production implementation.
- Do not redesign product intent, lifecycle semantics or architecture merely to make current code easier to preserve.
- Do not weaken the closed state-machine invariants to accommodate provider output.
- Do not introduce new DTO/view-model families, persisted workflow state, browser workflow stores, generic state-machine frameworks or compatibility layers as audit recommendations.
- Do not upgrade OpenCode or another dependency unless the audit proves the current pinned integration cannot satisfy existing canonical requirements and the required P4/P6 authority is deliberately changed.
- Do not treat a current test as proof when it only tests a consumer invariant and omits the productive producer contract that must satisfy it.

Any delivery remediation discovered by this audit must become one or more separately governed same-project `DEFECT` or `CHANGE` WorkItems after the audit reaches `AUDIT_COMPLETE`, preserving this audit as immutable provenance.

## Requested evidence/verdict

Produce one evidence-backed audit result that is sufficient to decide the complete 0.5.0 corrective scope without implementation-team inference.

For every audited proposition record:

- canonical expected behavior and exact authority identifier;
- current production owner(s) and producer→carrier→consumer path;
- current test/certification owner and what it actually proves;
- direct code/runtime evidence;
- verdict: `CORRECT`, `INCOMPLETE`, `CONTRADICTORY`, `UNPROVEN` or `OBSOLETE`;
- failure mechanism where not correct;
- affected lifecycle states/screens/provider roles;
- severity and whether it blocks 0.5.0;
- minimum authority layer that must change, if any;
- remediation classification as implementation defect, missing contract/prompt closure, missing/incorrect P3 behavior, missing/incorrect P4/P6 design, certification gap, or external-fact gap.

The audit output must include:

1. a complete lifecycle/state-transition matrix with all commands/events and negative combinations;
2. a complete STAGE/provider-turn matrix including proposal/input/block/completion/open semantics;
3. an OpenCode productive-context diagram from canonical authority/context resolution through provider invocation and returned-event reaction;
4. a role-by-role OpenCode contract audit for STAGE, BUILDER, REMEDIATOR and REVIEWER;
5. a screen-by-screen Workbench structural UX/UI audit with shared-root-cause grouping;
6. a certification coverage matrix mapping each material invariant to the test layer that proves both producer and consumer correctness;
7. a consolidated release-blocker list ordered by upstream root cause rather than symptom;
8. a final verdict on whether current P3/P4/P6 authority is itself correct or must be amended before any 0.5.0 remediation plan is written;
9. the exact set of linked DEFECT/CHANGE WorkItems required to remediate the confirmed findings, without implementing them inside this AUDIT.
