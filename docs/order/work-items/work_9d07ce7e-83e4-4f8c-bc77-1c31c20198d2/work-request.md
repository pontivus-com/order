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

### Complete application surface, information and interaction map

This map is the **foundational R1 investigation artifact for the entire 0.5.0 release**. Before separately judging UX quality, lifecycle/state correctness or OpenCode integration quality, R1 must reconstruct the complete current user-interaction model from the production renderer graph and its daemon/API/provider dependencies.

The map is the common evidence plane for all three problem domains because every productive behavior eventually appears to the operator as some combination of:

~~~text
information presented
        +
presentation location / hierarchy
        +
interaction options
        +
conditions under which those options appear or become enabled
        +
resulting command/read/provider interaction
        +
resulting workflow/material/provider state
~~~

The foundational question is therefore not merely "what screens exist?" It is:

> For every application condition, what can the operator see, what does that information mean, what can the operator do, why is that action available, where does it go, what canonical/provider facts govern it, and what becomes visible or actionable afterward?

This is a current-state audit, not a design exercise.

The inventory must be exhaustive. A surface is in scope whether it is a route, primary workspace, nested work area, overlay, drawer, dialog, confirmation, context panel, editor, timeline, evidence view, selector, toolbar region, conditional notice or state-dependent action cluster. Reused components must be audited in every materially different semantic context in which their information or business rules differ.

The current production inventory must at minimum trace the surfaces represented by:

- application shell and global toolbar/navigation/theme/OpenCode-account controls in `ui/src/app.tsx`;
- WorkItem Queue in `ui/src/WorkItemQueue.tsx`;
- Create WorkItem in `ui/src/CreateWorkItem.tsx`;
- Settings and readiness surfaces in `ui/src/SettingsWorkspace.tsx` and `ui/src/OpenCodeAccountSettings.tsx`;
- selected WorkItem shell, workflow dispatch and current-attention composition in `ui/src/WorkItemWorkspace.tsx`;
- Work request/source and lifecycle-document work in `ui/src/DocumentWorkspace.tsx`, `ui/src/MarkdownSourceEditor.tsx` and `ui/src/MarkdownEditor.tsx`;
- R1/R2/DESIGN/PLAN in `ui/src/PreSignoffStageWorkspace.tsx`;
- R3 in `ui/src/ReadinessWorkspace.tsx`;
- Approval in `ui/src/SignoffReview.tsx`;
- Implementation in `ui/src/ExecutionWorkspace.tsx`;
- Complete/result in `ui/src/TerminalResult.tsx`;
- dialogue/Run interaction in `ui/src/ActivityWorkspace.tsx`, `ui/src/ActivityComposer.tsx` and `ui/src/RunEventTimeline.tsx`;
- proposal review in `ui/src/ProposalReview.tsx`;
- WorkItem Context in `ui/src/WorkItemContext.tsx`;
- evidence inspection in `ui/src/EvidenceViewer.tsx`;
- workflow identity/navigation/material framing in `ui/src/WorkItemIdentityRow.tsx`, `ui/src/WorkflowRail.tsx`, `ui/src/WorkflowStepFrame.tsx` and `ui/src/WorkflowMaterialSelector.tsx`;
- every shared Workbench primitive whose semantics affect information hierarchy, action priority, status, notices, task panels, confirmation, tables or responsive composition.

This file list is a baseline sensor, not a closed whitelist. R1 must follow the actual render/call graph and include any additional productive UI surface discovered on `version/0.5.0`.

#### Presentation/information inventory

For **every visible information element or region** on every surface, record:

| Field | Required audit fact |
|---|---|
| surface / parent surface | where the information is rendered and what contains it |
| workflow/application condition | exact conditions under which the surface/element exists |
| operator purpose | what question or task this information is intended to support |
| exact information shown | label, text, status, metadata, document content, event, diagnostic or derived presentation |
| information class | one of: identity/navigation; primary work; current attention/action; workflow progress/state; document/material maturity/currentness; conversation; operational agent activity; proposal/review; evidence; domain/supporting context; history; configuration/readiness; technical detail; developer/debug diagnostic |
| canonical source/owner | exact WorkItem/Run/RunEvent/ArtifactRef/Approval/ExecutionTask/config/repository/provider fact or other canonical owner |
| raw versus derived | whether the UI renders canonical data directly or a pure derived presentation |
| authority/currentness | whether the fact is current authority, historical authority, observational state, secondary metadata or non-authoritative diagnostic detail |
| display priority | primary, secondary/on-demand, exceptional/current-attention, or diagnostic-only |
| present placement | where it currently appears in the screen hierarchy |
| duplication | every other place the same semantic fact is presented |
| audit verdict | correct, misplaced, duplicated, noisy, ambiguous, missing, technical-leak, debug-leak, or ungoverned |
| R2 obligation | the functional question that must be resolved if the current presentation is not correct |

The information audit must be **content-complete**, not component-complete. A single component containing twelve materially different information items produces twelve audit entries where their semantic ownership or presentation role differs.

In particular, R1 must identify all text or metadata that currently reaches the operator merely because it is available in runtime state. Provider/session identifiers, hashes, paths, schema/concern identifiers, raw statuses, event tags, validation internals, diagnostic strings and implementation metadata must each be justified as product information, moved to a secondary technical/debug class, or identified as a leak.

#### Interaction and destination inventory

For **every operator interaction**, record:

| Field | Required audit fact |
|---|---|
| interaction id / label | stable audit identity and current visible label |
| originating surface | where the operator invokes it |
| interaction class | navigation/inspection; local UI state; canonical read/reconcile; canonical mutation; conversation continuation; required-input response; proposal disposition; recovery; configuration; destructive/confirmation |
| visible-when rule | exact canonical/business conditions under which the interaction is presented |
| enabled-when rule | exact conditions under which it is actionable rather than disabled |
| governing business rule | exact P3/P4/P6/lifecycle/configuration authority controlling availability |
| source facts | canonical facts used to derive visibility/enabled state |
| UI handler | current component/handler owner |
| API/daemon/core path | read/command endpoint and downstream command/transition owner |
| precondition/recheck | server-side/current-state validation performed at commit time |
| canonical effect | durable mutation or explicit statement that the action is non-mutating |
| workflow/state effect | exact lifecycle, Run, proposal, material, approval, execution or configuration consequence |
| destination | resulting route, selected workflow step/material, opened overlay/context, focus target, or no navigation |
| pending behavior | what remains inspectable and what becomes unavailable while pending |
| success behavior | resulting presentation and focus/orientation |
| failure behavior | where the failure remains visible and which owner/recovery action is exposed |
| stale/conflict behavior | behavior when browser state is no longer current |
| audit verdict | correct, incorrectly available, incorrectly hidden, wrong destination, wrong owner, ambiguous, duplicate action, missing action, or unproven |

The audit must distinguish **visibility** from **enablement**. Hiding a valid action, showing an invalid action and showing a disabled action without an intelligible reason are three different product behaviors and must be assessed separately.

#### Business-rule and interaction graph

After the element-level inventory, construct one application-wide graph/matrix that maps:

~~~text
canonical facts / business rules
        |
        v
derived presentation state
        |
        +--> information shown
        +--> current attention owner
        +--> interactions visible
        +--> interactions enabled
        |
        v
operator interaction
        |
        v
read / command / provider turn / canonical mutation
        |
        v
resulting canonical facts
        |
        v
resulting screen / selected material / focus / recovery
~~~

The graph must prove where each business rule is owned. The browser may derive presentation from canonical facts, but it must not become a second owner of workflow eligibility, proposal rules, source-currentness, sign-off eligibility, execution ownership, provider-turn admission or recovery policy.

#### Foundational derivations from the interaction map

Once the current interaction map exists, R1 must use that same map to derive and test the two other major 0.5.0 concerns rather than starting independent inventories.

**Workflow/state-machine derivation**

For every mapped surface condition and interaction, identify the exact workflow/state facts required to explain it. This produces the practical state-machine audit from the user-facing boundary inward:

~~~text
visible UI condition / available action
        |
        v
required canonical state predicate
        |
        v
owning WorkItem / Run / RunEvent / ArtifactRef / Approval / ExecutionTask facts
        |
        v
valid transition / mutation
        |
        v
resulting observable condition
~~~

This derivation must expose:

- UI states that have no valid canonical state explanation;
- canonical states that have no coherent UI representation;
- interactions whose visibility/enabled logic is inconsistent with the core transition law;
- missing distinctions between lifecycle position, Run interaction state, proposal state, material currentness and document maturity;
- duplicated or contradictory state ownership between browser, daemon and core;
- impossible or ambiguous transition combinations;
- missing recovery/orientation behavior after valid transitions.

The state-machine audit therefore starts from the complete user-interaction map and proves that every presented state and every permitted action corresponds to a valid canonical state and transition.

**OpenCode transparency and agent-interaction derivation**

For every mapped area where an Order agent is active or where provider state affects operator decisions, identify what the operator currently sees and what the pinned OpenCode/Order integration actually knows.

Classify each potentially observable provider/agent fact into one of three categories:

1. **must be product-visible** — required for the operator to understand current work, converse with the active agent, judge whether progress is occurring, respond to required input, understand a proposal, or recover from failure;
2. **secondary technical visibility** — useful for diagnosis or expert inspection but not part of the ordinary primary workflow;
3. **closed/internal** — implementation/provider detail that should remain hidden because it does not improve the operator decision, is unsafe/sensitive, is unstable provider plumbing, or would expose private model reasoning.

For each fact, record:

- exact Order/OpenCode source;
- whether the pinned integration can expose it reliably;
- whether it is persisted or transient;
- whether it is safe to display;
- whether it is needed for ordinary workflow comprehension;
- appropriate presentation tier: primary work, operational activity, Context/technical detail, diagnostic evidence, or hidden;
- interaction implications, such as whether the operator can respond, inspect, retry, resume, cancel or only observe.

The OpenCode audit must therefore answer the product question **"what should Order make transparent about an agent's work, and what should remain closed?"** from the needs of each mapped interaction, not from a generic desire to expose provider telemetry.

Together these derivations make the application interaction map the single evidence backbone for UX, workflow/state and OpenCode analysis.

For every conditional action, R1 must answer:

1. **Why does this action exist here?**
2. **What canonical facts make it visible?**
3. **What additional facts make it enabled?**
4. **What business rule authorizes or prohibits it?**
5. **What command/read does it invoke?**
6. **What can that operation change?**
7. **Where does the operator land afterward?**
8. **What happens if the facts changed between render and commit?**
9. **How is failure/recovery presented without losing the owning work context?**

#### Cross-surface flow map

R1 must also produce complete user-flow traces for all ordinary and exceptional paths, including at minimum:

- Queue → WorkItem → selected workflow step → material/history selection;
- Queue → Create → newly created Work request/IDEA;
- Queue/WorkItem → Settings and return;
- Work request → Start Research;
- R1 → R2 → DESIGN → PLAN → R3 → Approval → Implementation → Complete;
- every governed backward return;
- interactive Run processing → open continuation → next provider turn;
- interactive Run processing → required input → response → next provider turn;
- interactive Run → proposal pending → proposal review → adopt/reject → resulting document/workflow state;
- direct document edit/save → invalidation/return/currentness consequence;
- stale authority/source → reconciliation → resulting owner;
- stage failure/block → exact recovery action;
- Approval stale/unsigned/signed paths;
- Implementation current task → Builder/Reviewer/Remediator/validation paths;
- execution failure/block/reanalysis/upstream return;
- provider/session failure and reconstructed/resumed interaction;
- archived/restored WorkItems;
- repository/account/model/readiness configuration changes that block or unblock productive work.

Each flow must identify the surfaces traversed, information required at each decision point, action conditions, commands/events produced, canonical state changes and resulting orientation. This flow map is the bridge between the UI audit and the lifecycle/state-machine audit: any interaction that cannot be explained from the state/business-rule model is a release blocker, and any state/business rule with no coherent operator presentation is likewise a release blocker.

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

1. a **foundational complete current-state user-interaction map** derived from the production render graph and backend/provider paths, covering every route/workspace/nested surface/overlay and every materially distinct condition, and explicitly serving as the evidence base for the UX, workflow/state-machine and OpenCode transparency audits;
2. a **complete application surface inventory** within that map, covering every route/workspace/nested surface/overlay and every materially distinct conditional state;
3. a **complete information-presentation matrix** classifying every visible information item by semantic class, canonical source/owner, authority/currentness, display priority, placement, duplication and audit verdict;
4. a **complete interaction/business-rule matrix** for every control/action, including visibility, enablement, source facts, governing rule, UI→API→daemon/core path, mutation/state effect, destination, pending/success/failure/stale behavior;
5. an **application-wide interaction/flow graph** connecting canonical business rules → presentation → action availability → command/read/provider turn → canonical effect → resulting surface/focus/recovery;
6. a **state-machine derivation from the interaction map** proving the canonical state predicate and transition behind every mapped condition/action and identifying canonical states with no coherent UI representation;
7. a complete lifecycle/state-transition matrix with all commands/events and negative combinations;
8. a complete STAGE/provider-turn matrix including proposal/input/block/completion/open semantics;
9. an **OpenCode transparency derivation from the interaction map** classifying provider/agent facts as product-visible, secondary technical, or closed/internal, with exact source, reliability, safety and presentation tier;
10. an OpenCode productive-context diagram from canonical authority/context resolution through provider invocation and returned-event reaction;
11. a role-by-role OpenCode contract audit for STAGE, BUILDER, REMEDIATOR and REVIEWER, including execution/session failure classes and the exact operator-visible observability available from the pinned integration;
12. a **per-workflow-step current-state surface assessment** for Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete, recording the actual primary work, conversation, agent activity, context, technical/debug information, actions, errors, history, responsive states and all observed gaps without yet choosing the replacement design;
13. a cross-screen information-governance inventory that identifies the one canonical presentation owner for each persistent information class and all current violations;
14. an integrated R1/R2/DESIGN/PLAN interaction blueprint proving the complete conversation → agent activity → proposal/document mutation → maturity/conformance → continuation/promotion loop;
15. a document/material maturity matrix for every governed lifecycle artifact, explicitly separated from WorkItem lifecycle position and mapped to canonical source facts;
16. a certification coverage matrix mapping each material invariant to the test layer that proves both producer and consumer correctness;
17. a consolidated release-blocker list ordered by upstream root cause rather than symptom;
18. a final verdict on whether current P3/P4/P6 authority is itself correct or must be amended before any 0.5.0 remediation plan is written;
19. the exact set of linked DEFECT/CHANGE WorkItems required to remediate the confirmed findings, without implementing them inside this AUDIT.

## 0.5.0 release character and governed delivery sequence

0.5.0 is **not a bug-fix release**. It is the next feature-level product release intended to move Order materially closer to a usable software-work environment. The current 0.4.0 product remains blocked by fundamental usability, interaction, integration and correctness problems: workflow screens do not yet have sufficiently governed information architecture, OpenCode work is too opaque and has unresolved session/execution failures, and lifecycle/document-state behavior is not yet proven to align with the intended user interaction model.

The audit described above is therefore the **evidence and problem-closure front end** of the 0.5.0 delivery lifecycle. It is not itself the governing implementation plan and must not collapse requirements, technical design and implementation planning into one document.

The 0.5.0 work must be executed as explicit phases. The phase boundary is important: **Phase 1 is prerequisite investigation only; Phase 2 is where product and technical design decisions are made from the complete Phase 1 fact set.**

~~~text
PHASE 1 — foundational investigation / prerequisite fact closure
  R1 audit + research
  complete application interaction map
  UI information/presentation map
  interaction/business-rule map
  workflow/state derivation
  OpenCode transparency/integration derivation
  document/material maturity facts
        |
        |  hard gate: complete evidence set + unresolved questions closed
        v
PHASE 2 — design closure
  2A: R2 functional requirements / functional design
  2B: DESIGN technical architecture + canonical contracts
        |
        |  hard gate: accepted P3 behavior + accepted P4/P5/P6 solution
        v
PHASE 3 — governing implementation plan
  PLAN / P7 exact repository transition and verification contract
        |
        v
PHASE 4 — readiness and delivery
  R3 readiness review
  Approval
  Implementation + validation
~~~

### Phase 1 — foundational investigation / prerequisite obligations

Phase 1 exists to establish the complete factual basis required before Order can make valid product-design or technical-design decisions. It must not choose the replacement UX, invent new workflow semantics or pre-commit to an OpenCode implementation solution.

Phase 1 is complete only when the interaction map and all of its derived state/OpenCode/material analyses provide a sufficiently closed fact set for Phase 2. Any material unknown that would force R2 or DESIGN to guess product behavior, current implementation behavior, provider capability, state ownership or interaction consequences keeps Phase 1 open.

Phase 1 must establish the actual current-state failures and root causes across the integrated UX/UI, OpenCode and lifecycle/state domains. It must distinguish:

- observed product symptoms from upstream causes;
- incorrect implementation from missing/incorrect canonical design;
- UX information-hierarchy failures from primitive/theme defects;
- OpenCode provider/integration defects from Order state/reaction defects;
- lifecycle-state defects from missing document/material maturity semantics;
- test coverage from actual end-to-end contract proof.

The complete application interaction map is the primary Phase 1 artifact. The lifecycle/state-machine audit, OpenCode transparency/integration audit and document/material maturity audit are derived from that same interaction evidence rather than conducted as independent design exercises.

### Phase 2A — functional requirements / functional design obligations

Phase 2 begins only after Phase 1 has produced the complete fact set needed to make product decisions.

R2 must convert the validated 0.5.0 findings into complete observable product behavior. It decides **what the operator experience and workflow behavior must be**, not how the implementation realizes it.

The functional requirements must define at minimum:

- the operator experience and information hierarchy for every workflow step;
- the primary work area, current-action area, supporting context, operational agent activity and technical/debug separation;
- the human↔agent conversation model for Research, Requirements, Solution design and Implementation plan;
- the product-visible OpenCode activity, failure and recovery behavior;
- document/material maturity behavior and how maturity relates to lifecycle progression;
- proposal/review/adoption behavior;
- editing/saving/conformance behavior;
- historical/current/stale/blocked/failed/recovery behavior;
- visibility and enablement rules for every material interaction;
- expected destination/orientation after every material interaction;
- responsive and accessibility behavior;
- acceptance criteria for every material state, screen condition and transition.

R2 must resolve the product/business-rule decisions exposed by Phase 1. It must be complete enough that technical DESIGN does not have to invent product behavior.

### Phase 2B — technical design obligations

After the Phase 2A functional requirements are accepted, DESIGN must translate them into the exact P4/P5/P6 system design required to implement them.

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

Phase 2 is complete only when both the functional behavior and its technical realization are closed and mutually traceable.

### Phase 3 — governing implementation-plan obligations

Only after Phase 1 and both Phase 2A/2B are closed may the 0.5.0 governing implementation plan be written.

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

### Phase 4 — readiness, approval and delivery

Phase 4 begins only after the governing implementation plan is complete.

R3 must adversarially prove that the Phase 2 functional/technical authority and Phase 3 implementation plan are mutually complete, current and executable. Approval then authorizes the exact package. Implementation and validation execute that approved package without making new material P1-P6 decisions.

### 0.5.0 phase gates

**Phase 1 → Phase 2 gate:** no functional or technical design decision is considered closed until the foundational interaction/state/OpenCode/material fact set is complete enough that the decision does not depend on guessing current behavior or capability.

**Phase 2 → Phase 3 gate:** no 0.5.0 governing implementation plan is acceptable until the Phase 2A functional requirements and Phase 2B technical design are complete and the governing P3/P4/P5/P6 authority contains:

- one explicit screen contract for every workflow step;
- one explicit information-hierarchy rule separating productive work from context, operational agent activity, technical detail and developer/debug diagnostics;
- one explicit pre-signoff conversation model for R1/R2/DESIGN/PLAN;
- one explicit OpenCode operational-observability and error/recovery contract;
- one closed provider producer→consumer turn contract;
- one closed lifecycle/interaction/document-maturity algebra;
- one integrated mapping from each material state to visible UI, valid actions and agent interaction;
- permanent certification that exercises the integrated behavior rather than only isolated primitives or downstream validators.
