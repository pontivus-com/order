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

The audit target is the complete productive workflow system rather than one isolated symptom. The 0.5.0 work has three coupled problem domains that must be evaluated as one interaction system rather than repaired independently:

1. **Workbench UX/UI and information architecture** — 0.4.0 established a stronger primitive/component/theme framework, but that is not sufficient product design. The actual workflow screens remain structurally underdefined: primary work, workflow information, secondary context, OpenCode activity, diagnostics and implementation/debug detail can compete in the same visual hierarchy. Every workflow step therefore requires an explicit screen contract and state-specific interaction design.
2. **OpenCode integration, interaction and observability** — productive agents remain too opaque to the operator, interactive pre-signoff work is not yet a sufficiently coherent first-class conversation experience, and provider/session execution failures expose unresolved integration/contract defects. Order must make meaningful agent activity, current turn state, user/agent dialogue, failures and recovery observable without exposing private model reasoning or turning the primary work surface into a raw developer console.
3. **Lifecycle/state-machine and document-material maturity** — the complete workflow algebra must be revalidated, including the relationship between WorkItem lifecycle state, Run interaction state, proposal state, material currentness and the maturity of each governed document. The audit must determine whether the current state model can unambiguously express document progression such as draft/proposed/adopted/conformance-pending/conformant/stale/historical/locked semantics, or whether the canonical P3/P4/P6 model is incomplete. These labels are audit hypotheses, not pre-approved implementation state.

The detailed audit includes:

- the WorkItem lifecycle/state machine from IDEA through R1, R2, DESIGN, PLAN, R3, AWAITING_SIGNOFF, EXECUTION and COMPLETE;
- STAGE Run interaction state, provider-turn grammar, proposal state, required-input ownership, blockers, retries/resume/reconciliation, cancellation, asynchronous convergence and reached-history semantics;
- Approval, execution-task ownership, validation boundaries, remediation/reviewer continuation and terminal-result behavior;
- the complete OpenCode productive execution context for STAGE, BUILDER, REMEDIATOR and REVIEWER roles, including exact workspace materialization, authority/context projection, prompt assembly, provider output contracts, tool permissions, trusted integrations, session reuse/continuation, diagnostics, failure classification and provider/coordinator reaction;
- the complete Workbench information architecture and structural UX/UI across Queue, Create, Settings/account management, Work request/Source, every pre-signoff workflow step, Readiness, Approval, Implementation, Complete, Context, dialogs/drawers, evidence and error/recovery states;
- the complete operator-visible OpenCode interaction model: conversation, provider-turn status, bounded operational activity, proposals, current agent ownership, session continuity, execution errors and recovery;
- the complete per-document/material maturity model and its interaction with lifecycle progression, editing, proposals, conformance, stale authority, historical inspection and sign-off;
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
5. **Structural UX/UI correctness** — every screen uses the canonical information hierarchy, interaction-space class, Workbench primitive/component language, stable geometry, navigation semantics and theme behavior. Shared visual defects or structural inconsistencies must be traced to their common owner rather than patched screen by screen. Correct primitive use is necessary but is not evidence that the screen itself has a correct information architecture or task flow.
6. **Surface separation** — every rendered element must have an explicit product role: primary work, current action/attention, secondary workflow context, operator-visible agent activity, technical detail, or developer/debug diagnostics. Primary task surfaces must not be polluted by hashes, raw identifiers, provider plumbing, duplicated status text, implementation metadata or debugging information that belongs in Context/Technical details or diagnostic evidence.
7. **Agent interaction/observability correctness** — for interactive pre-signoff work, the operator must be able to understand what the current Order/OpenCode agent is doing at the product-operational level, converse with that agent when the Run admits continuation/input, see the resulting proposal/material transition, and understand failures/recovery. This means observable messages, turn state, meaningful bounded activity and error origin; it does not require or permit exposure of private chain-of-thought.
8. **Document-material maturity correctness** — lifecycle position and document maturity must not be conflated. For every Work request and lifecycle document, the audit must prove what facts determine whether it is absent, editable/current, proposed, adopted, awaiting conformance, conformant/current, stale/historical or otherwise governed. Prefer pure derivation from existing canonical facts; do not invent persisted duplicate workflow/document state merely to simplify rendering.
9. **Certification closure** — permanent tests must cover both the accepting path and the material negative/contradictory path at the correct producer/consumer boundaries; green tests are not sufficient where the real productive contract is absent from the test surface.

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

For UX/UI, audit every primary service/screen and every material state. The audit must not stop at shared primitives. It must produce an explicit screen contract for **every workflow step** and identify the structural owner of all common chrome/surfaces.

For each of these nine workflow steps:

1. Work request;
2. Research;
3. Requirements;
4. Solution design;
5. Implementation plan;
6. Readiness review;
7. Approval;
8. Implementation;
9. Complete;

define and evaluate, at minimum:

- the step's operator goal and the single primary work area;
- the canonical primary material/document shown there and its maturity/currentness;
- the current-action/attention region and action precedence;
- whether a live interactive Run exists and, if so, where conversation/composer lives;
- the operator-visible agent activity region and what activity belongs there;
- proposal/review/adoption interaction and how it relates spatially to dialogue and document work;
- document editing/saving/conformance controls and their exact availability;
- supporting upstream/downstream context and how it is accessed without polluting primary work;
- technical/provider/session details and where they are intentionally separated from ordinary product information;
- developer/debug diagnostics and how they remain available without appearing as normal workflow content;
- error/blocker/recovery ownership;
- history/attempt/material selection;
- empty, loading, processing, required-input, proposal-pending, adoption-in-progress, stale, blocked, failed and historical variants;
- wide, medium and narrow responsive composition;
- keyboard/focus/accessibility behavior;
- the exact shared primitive/composition owner so equivalent structures do not diverge per feature.

The screen contracts must establish a visible hierarchy of **work first, current action second, supporting context third, technical/debug detail on demand**. Text is not allowed merely because a fact exists: every piece of persistent copy/metadata must justify why it belongs in the current screen, at that hierarchy level, and in that location.

In addition to the nine workflow steps, audit the surrounding service surfaces:

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
- operator-visible OpenCode activity and session/turn status;
- technical/developer diagnostics as a deliberately secondary surface;
- evidence/code views;
- required-input, processing, proposal-decision, adoption-in-progress, blocked, stale, failed, retry/resume/reconcile, empty, loading and terminal states;
- wide, medium and narrow responsive layouts;
- System/Light/Dark presentation and Astryx primitive parity.

Evaluate recurring UX/UI defects as potential failures of shared primitives, composition rules, information hierarchy or theme/layout ownership. Do not accept local cosmetic patches when the defect is structurally shared.

### Integrated workflow interaction audit

The three problem domains must then be recombined into end-to-end interaction scenarios. At minimum, audit the complete operator loop for R1 Research, R2 Requirements, DESIGN and PLAN because these are the interactive preparation stages where human feedback and agent work must coexist:

~~~text
current canonical material/context
        |
        v
OpenCode agent turn starts
        |
        +--> operator can see meaningful processing/activity
        |
        v
agent message / question / proposal / open continuation
        |
        +--> required-input response when the agent owns one exact question
        +--> free-form continuation when the Run is OPEN
        +--> proposal review/adopt/reject when a lifecycle proposal owns the action
        +--> direct human edit/save only through the governed document-authoring path
        |
        v
canonical document/material maturity changes
        |
        v
conformance/currentness is re-evaluated
        |
        +--> continue same stage with re-resolved context where permitted
        +--> complete/promote when the stage's promotion gate is satisfied
        +--> remain/return/block with one explicit recovery owner otherwise
~~~

For each of R1/R2/DESIGN/PLAN, prove that the operator can iteratively discuss the work with the currently owning agent without losing the document being produced, without confusing conversation with canonical authority, without competing composers/actions, and without opaque provider execution.

The audit must also evaluate interruption/restart/session-loss cases: which conversation/activity evidence persists, when the same OpenCode session may continue, when Order must reconstruct a new provider session from canonical state, and what the operator sees during that recovery.

OpenCode observability must be designed as **bounded operational transparency**, not model-reasoning exposure. Evaluate which exact facts the pinned integration can reliably expose, such as agent/role ownership, processing/idle/waiting state, emitted assistant messages, tool/action category, affected/read resources where safe, proposal creation, provider/session errors, retries and elapsed/turn boundaries. Raw hidden reasoning, secrets and unbounded provider telemetry are out of scope for the ordinary UI.

### Document/material maturity audit

For each governed document/material — Work request, Research, Requirements, Solution design, Implementation plan, Readiness material, Approval package and signed execution material — construct a maturity/currentness matrix that answers:

- what canonical facts create the material;
- whether it is human-editable at that point;
- whether an agent proposal exists and who owns disposition;
- whether adopted bytes are current but still awaiting conformance;
- what proves conformance/readiness;
- what makes the material stale or historical;
- what locks it against direct mutation;
- which lifecycle stage may consume it;
- which screen/status/action represents each condition.

Do not assume one `WorkStage` value is enough to describe document maturity. Conversely, do not introduce a new persisted document-state machine if maturity can be exhaustively derived from existing WorkItem, Run, RunEvent, ArtifactRef, Approval, execution and conformance facts.

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
4. a role-by-role OpenCode contract audit for STAGE, BUILDER, REMEDIATOR and REVIEWER, including execution/session failure classes and the exact operator-visible observability available from the pinned integration;
5. a **per-workflow-step screen contract** for Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete, including primary work, conversation, agent activity, context, technical/debug separation, actions, errors, history and responsive states;
6. a cross-screen information-governance inventory that classifies every persistent information class as primary work, current attention/action, supporting context, operational agent activity, technical detail or developer/debug diagnostic and identifies its one canonical presentation owner;
7. an integrated R1/R2/DESIGN/PLAN interaction blueprint proving the complete conversation → agent activity → proposal/document mutation → maturity/conformance → continuation/promotion loop;
8. a document/material maturity matrix for every governed lifecycle artifact, explicitly separated from WorkItem lifecycle position and mapped to canonical source facts;
9. a certification coverage matrix mapping each material invariant to the test layer that proves both producer and consumer correctness;
10. a consolidated release-blocker list ordered by upstream root cause rather than symptom;
11. a final verdict on whether current P3/P4/P6 authority is itself correct or must be amended before any 0.5.0 remediation plan is written;
12. the exact set of linked DEFECT/CHANGE WorkItems required to remediate the confirmed findings, without implementing them inside this AUDIT.

## 0.5.0 release character and governed delivery sequence

0.5.0 is **not a bug-fix release**. It is the next feature-level product release intended to move Order materially closer to a usable software-work environment. The current 0.4.0 product remains blocked by fundamental usability, interaction, integration and correctness problems: workflow screens do not yet have sufficiently governed information architecture, OpenCode work is too opaque and has unresolved session/execution failures, and lifecycle/document-state behavior is not yet proven to align with the intended user interaction model.

The audit described above is therefore the **evidence and problem-closure front end** of the 0.5.0 delivery lifecycle. It is not itself the governing implementation plan and must not collapse requirements, technical design and implementation planning into one document.

The 0.5.0 work must proceed through the ordinary governed sequence:

~~~text
0.5.0 scope / observed product failures
        |
        v
R1 — audit / research / factual closure
        |
        v
R2 — functional requirements
        |
        v
DESIGN — technical architecture + canonical contracts
        |
        v
PLAN — governing implementation plan
        |
        v
R3 — readiness review
        |
        v
Approval
        |
        v
Implementation + validation
~~~

### R1 — audit / research obligations

R1 must establish the actual current-state failures and root causes across the integrated UX/UI, OpenCode and lifecycle/state domains. It must distinguish:

- observed product symptoms from upstream causes;
- incorrect implementation from missing/incorrect canonical design;
- UX information-hierarchy failures from primitive/theme defects;
- OpenCode provider/integration defects from Order state/reaction defects;
- lifecycle-state defects from missing document/material maturity semantics;
- test coverage from actual end-to-end contract proof.

R1 must close the factual questions needed for requirements work. It must not decide the replacement product behavior, technical architecture or implementation shape.

### R2 — functional requirements obligations

R2 must convert the validated 0.5.0 findings into complete observable product behavior.

The functional requirements must define at minimum:

- the operator experience and information hierarchy for every workflow step;
- the primary work area, current-action area, supporting context, operational agent activity and technical/debug separation;
- the human↔agent conversation model for Research, Requirements, Solution design and Implementation plan;
- the product-visible OpenCode activity, failure and recovery behavior;
- document/material maturity behavior and how maturity relates to lifecycle progression;
- proposal/review/adoption behavior;
- editing/saving/conformance behavior;
- historical/current/stale/blocked/failed/recovery behavior;
- responsive and accessibility behavior;
- acceptance criteria for every material state and screen transition.

R2 must be complete enough that DESIGN does not have to invent product behavior.

### DESIGN — technical authority obligations

DESIGN must translate the accepted functional requirements into the exact P4/P5/P6 system design required to implement them.

It must define at minimum:

- the closed lifecycle/interaction/document-maturity algebra;
- canonical state derivation and ownership;
- event/command transition rules and impossible combinations;
- STAGE/OpenCode producer→carrier→consumer contracts;
- session/context continuity, restart and failure semantics;
- the exact bounded OpenCode observability surface and its data source;
- UI information/composition ownership for every workflow screen;
- shared screen primitives/compositions versus step-specific content;
- canonical browser projections and mutation boundaries;
- technical/debug evidence separation;
- persistence/non-persistence decisions;
- exact API/contract changes;
- permanent architecture/integration/browser certification obligations.

DESIGN must preserve FCIS, SoC, semantic DRY, strict typing and minimum sufficient change. It must not introduce duplicated workflow/document state merely to simplify rendering.

### PLAN — governing implementation-plan obligations

Only after R1, R2 and DESIGN are closed may the 0.5.0 governing implementation plan be written.

That implementation plan must be executable without material inference by the implementation team. It must:

- trace every task to the accepted functional and technical authority;
- cover the complete integrated UX/UI, OpenCode and state-machine change rather than isolated fixes;
- identify the exact repository change surface and canonical owners;
- define ordered implementation units and dependencies;
- include required deletions/replacements of superseded 0.4.0 behavior;
- define screen-by-screen implementation/certification work for all workflow steps;
- define OpenCode integration/session/observability/error remediation;
- define state-machine/document-maturity implementation and migration implications, if any;
- include the known provider-turn proposal/control-event defect in the correct upstream contract task rather than as a standalone local patch;
- define the complete test/certification matrix, including negative/contradictory cases and browser-visible integrated scenarios;
- preserve the single `version/0.5.0` branch as the complete release work surface.

The implementation plan is therefore the **downstream execution contract for the complete 0.5.0 product correction**, not the place where unresolved product behavior or architecture is decided.

### 0.5.0 design/implementation entry criteria

No 0.5.0 governing implementation plan is acceptable until the audit establishes, and the governing R2/DESIGN P3/P4/P6 authority is amended where required to contain:

- one explicit screen contract for every workflow step;
- one explicit information-hierarchy rule separating productive work from context, operational agent activity, technical detail and developer/debug diagnostics;
- one explicit pre-signoff conversation model for R1/R2/DESIGN/PLAN;
- one explicit OpenCode operational-observability and error/recovery contract;
- one closed provider producer→consumer turn contract;
- one closed lifecycle/interaction/document-maturity algebra;
- one integrated mapping from each material state to visible UI, valid actions and agent interaction;
- permanent certification that exercises the integrated behavior rather than only isolated primitives or downstream validators.
