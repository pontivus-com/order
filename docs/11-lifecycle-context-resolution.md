# 11 — Lifecycle context resolution and continuous conformance

**Status:** Binding design standard
**Canonical concern ID:** `GW-DOC-LIFECYCLE-CONTEXT`  
**Versioned concern ID:** `GW-DOC-LIFECYCLE-CONTEXT-V1`  

## 1. Purpose

The systems governance pyramid defines authority. This standard defines how the correct portion of that authority is supplied to an agent at each lifecycle stage and how conformance is proven before work may progress.

Order must not solve context propagation by copying the whole pyramid into every document or prompt.

Instead:

1. canonical project artifacts remain the source of truth;
2. Order resolves the authority applicable to the current stage;
3. Order projects the minimum sufficient context needed for that stage;
4. the agent operates only within the stage's decision boundary;
5. the produced artifact is validated against all applicable higher authority;
6. promotion is allowed only after that conformance passes.

The central invariant is:

```text
PROMOTE(stage output)
iff
output conforms to all applicable resolved higher authority
```

## 2. Canonical sources versus runtime context

A lifecycle artifact owns only the semantics of its own layer.

It should contain:

- the decisions or requirements that layer owns;
- references to the higher authority that constrains it;
- explicit scope, exclusions, and downstream obligations needed to prevent reinterpretation.

It should not copy or restate the entire upstream governance chain.

Order therefore distinguishes:

```text
CANONICAL AUTHORITY
project artifacts + Order defaults/overrides
        |
        v
RUNTIME CONTEXT RESOLUTION
        |
        v
minimum sufficient stage context
        |
        v
agent execution
```

The runtime context is an ephemeral projection over canonical sources. It is not a second source of truth and must not become a parallel requirements, architecture, contract, or plan store.

Selected source content may be materialized into an agent prompt for execution, but its authority remains the referenced canonical source.

For a source-backed WorkItem governed by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, the current validated WorkItem Markdown is also a canonical **originating input**. It is not automatically project authority merely because it is canonical input. Its source-backed P2 intent has only the authority supplied by the operator/project under this lifecycle. The durable WorkItem projection may carry identity/classification, but it must not replace the source narrative in a stage that is entitled to receive that narrative.

## 3. Minimum sufficient context rule

An authority source belongs in a stage context only when it is required to:

1. define the current task;
2. constrain a decision the current stage is permitted to make; or
3. validate the artifact produced by the stage.

Unrelated authority is omitted.

This rule exists to prevent both under-context and context bloat.

Order must never use "include everything" as the default context policy.

## 4. Stage context resolution

Before invoking an agent, Order resolves:

- current lifecycle stage;
- the current validated WorkItem source snapshot and pinned authoring schema where `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` applies;
- applicable project-defined engineering concern ids;
- pyramid layer(s) the stage may create or modify;
- applicable P0 rules;
- resolved P1 defaults, project extensions, and overrides;
- applicable higher project authority;
- current work-item scope and exclusions;
- relevant validated upstream artifacts;
- repository/runtime evidence permitted for the stage;
- required mechanical sensors;
- semantic conformance questions;
- decisions the stage may make;
- decisions the stage must not make;
- expected artifact/output;
- promotion gate.

Concern applicability is resolved before authority projection according to [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md). Concerns are project-defined applicability metadata and do not create separate workflows.

Authority applicability is deterministic. Every explicit `AuthorityRef` is first resolved by exact lookup through the validated project `pontivus-order.toml [refs]` map owned by [GW-DOC-CANONICAL-CONTRACTS-V1 §14](13-canonical-contracts.md). A missing mapping is incomplete context; agents never search prose or infer the source of an identifier.

The applicable source set is the union of:

1. the current validated WorkItem source snapshot when the stage depends on originating work intent;
2. the pinned WorkItem-schema template/instruction when the stage must author a governed output format;
3. mandatory sources defined by the current stage policy;
4. explicit upstream authority references;
5. authority-map dependencies of those references; and
6. current repository/runtime evidence explicitly required by the stage.

The WorkItem source snapshot participates in conformance freshness for source-backed work even when minimum-context projection omits its raw body from a later-stage prompt. That prevents a downstream stage from remaining conformant to intent bytes that have changed upstream.

An agent does not select governing sources by deciding what "seems relevant." If the authority graph cannot resolve a required dependency, the context is incomplete.

If required authority is missing, contradictory, stale, or cannot be resolved, the agent is not invoked for productive work.

## 5. Context completeness gate

Every agent invocation has a pre-execution context gate.

The gate proves:

- the lifecycle stage is known;
- the stage's decision boundary is known;
- any required source-backed WorkItem snapshot is readable, valid, reconciled to the current WorkItem identity/classification, and resolved under its pinned schema/template;
- required upstream authority exists;
- inherited defaults and explicit overrides have been resolved;
- referenced material authority is current enough for the task;
- required scope and exclusions are present;
- required sensors/validation obligations are known;
- no unresolved higher-order decision has been delegated to the agent.

Failure returns the work to the owning upstream stage.

A prompt cannot compensate for an invalid context package.

### Interactive stage runs

R1, R2, DESIGN and PLAN may execute as bounded interactive Runs.

Interactive conversation does not become canonical authority.

When user input supplied through an interactive Run changes an authority artifact, Order must:

1. represent the change as an explicit artifact proposal;
2. require explicit adoption into the canonical repository artifact;
3. record the resulting ArtifactRef;
4. invalidate affected downstream conformance;
5. re-resolve stage context before the next productive agent turn.

The governed Markdown workbench adds one distinct **direct human-authoring ingress** for the exact Markdown surfaces owned by `GW-DOC-MARKDOWN-WORKBENCH-V1`. When the operator explicitly edits an authorized WorkItem/R1/R2/DESIGN/PLAN Markdown document and presses Save against its current expected hash, that Save is itself the explicit canonical human mutation action. It does not create a synthetic artifact-proposal RunEvent. The write does not confer conformance: a WorkItem-source save follows the canonical source-freshness rule and returns affected pre-signoff work to R1, while an R1/R2/DESIGN/PLAN artifact save returns the WorkItem to that artifact's owning stage; both invalidate affected downstream conformance/readiness and require normal stage re-resolution before progression. R3, signed/execution material, unrelated project authority, candidate code/evidence and runtime state remain outside this direct-edit ingress.

Interactive chat text remains non-canonical. If a conversation materially changes originating intent or project authority, the operator must explicitly adopt/write that change into the WorkItem source or other canonical authority before later stages may rely on it.

A resumed provider session may be used only inside the same Order Run and lifecycle stage. For source-backed work, productive continuation additionally requires the current WorkItem source snapshot to match the Run's resolved context identity; a source change requires reconciliation and context re-resolution before the provider may continue productively. A material human clarification of originating request/P2 intent is not promoted merely because it was received as Run input: it must first be adopted into the WorkItem source or another canonical project authority under `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`. If the session is lost, the stage must be reconstructable from the current WorkItem source, canonical authority, persisted evidence and unresolved questions.

`WAITING_FOR_INPUT` is a Run condition, not a lifecycle stage.

## 6. Stage decision boundaries

### IDEA

**Purpose:** capture untrusted work.

**Receives:**

- P0 intake rules;
- any explicitly supplied P1/P2 project context;
- originating observation/request.

**May decide:**

- only how to record the idea accurately.

**Must not decide:**

- requirements;
- architecture;
- implementation.

**Promotion requirement:** enough identity and provenance exist to begin R1.

### R1 — Research

**Purpose:** establish what is actually true.

**Receives:**

- P0 applicable controls;
- current source-backed originating observation/request and its validated WorkItem classification when `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` applies;
- resolved P1 principles relevant to investigation;
- original P2 intent/problem statement where available;
- project authority map;
- relevant repository instructions;
- current repository/runtime evidence.

**May decide:**

- factual findings;
- root cause/producing boundary;
- affected execution path;
- relevant authority;
- whether the issue is confirmed, disproven, duplicate, already satisfied, blocked, or needs a decision.

**Must not decide:**

- new product behavior;
- architecture;
- implementation solution.

**Produces:**

- validated facts;
- evidence references;
- authority references;
- unresolved factual questions;
- R1 verdict.

**Promotion requirement:** factual claims are evidence-backed and do not contradict higher authority.

### R2 — Product intent and functional requirements

**Purpose:** close what outcome is required.

R2 owns P3 functional requirements and may structure or clarify work-item P2 intent only when that intent is explicitly supplied by a human or authoritative project source. R2 must not originate missing product behavior. If required P2 intent is absent or materially ambiguous, the stage returns `NEEDS_DECISION` or `BLOCKED`.

**Receives:**

- P0;
- resolved P1 product/system principles;
- existing P2 product authority, including the current source-backed WorkItem intent when it is materially required to define the requested outcome;
- validated R1 facts;
- applicable domain/product constraints.

**May decide:**

- clarification of explicitly supplied work-item product intent within existing authority;
- observable functional behavior;
- acceptance criteria;
- failure behavior;
- negative requirements;
- scope and exclusions.

**Must not decide:**

- technical architecture;
- implementation mechanics;
- lower-level contract shapes.

**Produces:**

- resolved P2 intent references/clarifications;
- P3 functional requirements;
- acceptance and exclusions.

**Promotion requirement:** P3 output, and any P2 clarification, conforms to P0/P1 and does not contradict validated R1 facts or existing higher product authority. Missing required P2 authority is a block, not an invitation for model inference.

### DESIGN — Technical architecture, decisions, and specification

**Purpose:** resolve the correct technical solution before implementation.

Depending on the work, Design may create or amend applicable P4, P5, and P6 authority.

**Receives:**

- P0;
- resolved P1 engineering principles;
- applicable P2 intent;
- accepted P3 requirements;
- current P4 project architecture/technical constraints;
- applicable existing P5 ADRs;
- current P6 canonical contracts/state owners;
- relevant current repository boundaries and R1 evidence.

**May decide:**

- technical architecture within P1-P4 constraints;
- consequential ADR decisions;
- canonical owner;
- data/control flow;
- necessary P6 contract/specification changes;
- required architecture sensors;
- material alternatives.

**Must not decide:**

- different product intent;
- weaker functional requirements;
- unauthorized P1 override;
- implementation work beyond what the resolved design requires.

**Produces:**

- resolved P4/P5/P6 changes for the work item;
- canonical ownership and boundary decisions;
- required validation obligations.

**Promotion requirement:** design conforms to all applicable P0-P3 authority and preserves or explicitly updates P4-P6 through valid governance mechanisms.

### PLAN

**Purpose:** define the exact minimum repository transition.

**Receives:**

- P0;
- applicable P1-P6 authority;
- accepted design;
- current repository structure relevant to execution;
- project verification authority;
- minimum-change constraints.

**May decide:**

- task decomposition;
- dependency order;
- exact expected change surface;
- required deletions/additions/modifications;
- task-specific verification sequence.

**Must not decide:**

- new product requirements;
- new architecture;
- new canonical contracts not already resolved by Design;
- scope expansion.

**Produces:**

- P7 implementation plan;
- explicit execution-task definitions;
- change-surface forecast;
- verification contract.

**Promotion requirement:** every task traces upward, every required outcome traces downward, and no plan task requires the implementer to make a material P1-P6 decision.

### R3 — Readiness review

**Purpose:** adversarially prove the package is ready for human sign-off.

**Receives:**

- complete relevant P1-P7 authority chain;
- applicable P0 controls;
- current repository evidence needed to test freshness and feasibility;
- compact earlier conformance results and evidence references. Underlying evidence is retrieved only where needed to challenge or validate a material claim.

**May decide:**

- readiness verdict;
- exact defective layer when not ready.

**Must not decide:**

- replacement requirements/design/plan on behalf of the owning stage.

**Produces:**

- READY_FOR_SIGNOFF;
- RETURN_TO_*;
- or BLOCKED;
- with evidence.

**Promotion requirement:** all applicable pyramid layers are coherent, current, traceable, and leave no material implementation decision unresolved.

### IMPLEMENT

**Purpose:** realize one signed P7 execution task.

**Receives:**

- exact signed task;
- applicable P0 controls;
- applicable resolved P1 engineering constraints;
- P3 acceptance criteria necessary to interpret completion;
- P4 architecture constraints;
- P5 ADR constraints;
- P6 canonical contracts/specification;
- scope/exclusions;
- repository baseline;
- declared module/boundary responsibilities and applicable architecture fitness gates;
- expected change surface;
- required validation.

P2 context is included only where materially necessary to interpret the approved task.

**May decide:**

- local implementation mechanics within the signed design and semantic scope;
- the minimal same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary, provided it preserves canonical semantic ownership, public contracts, state meaning, dependency direction and authorized behavior and updates the architecture fitness sensor for any new production module.

IMPLEMENT does not return upstream merely because that architecture-preserving decomposition adds or moves files. It returns to DESIGN/PLAN when implementation evidence requires a new or changed semantic owner, public contract, state model, effect boundary, dependency direction, external dependency, validation contract, or behavior outside the signed task. It must not preserve nominal file scope by accumulating a second responsibility in an existing module.

**Must not decide:**

- product behavior;
- requirements;
- architecture;
- ADRs;
- canonical contract meaning;
- scope;
- validation requirements.

During implementation, any P7-defined internal checkpoint runs the applicable mechanical architecture fitness gates before the worker proceeds to the next architecture-affecting step. A failing checkpoint permits correction within the already-resolved design, including the architecture-preserving physical decomposition above. If correction requires a P1-P6 semantic decision, execution returns upstream. Checkpoint results are feedback and do not replace coordinator-owned V3/V5/V7 evidence.

**Produces:**

- candidate P8 implementation;
- implementation observations.

**Promotion requirement:** candidate passes the applicable V2-V7 validation path.

### TEST / MECHANICAL VALIDATION

**Purpose:** mechanically prove defined propositions.

**Receives only the authority needed by the specific validation gate.**

Examples:

- functional validation -> P3 acceptance + relevant P6 contract;
- architecture fitness function -> P1/P4/P5 rule plus the project manifest's resolved fitness-gate binding;
- contract/state validation -> P6;
- task regression -> P7;
- anti-bloat validation -> P1 minimum-change rule + P7 forecast + actual diff.

A mechanical validator does not need unrelated product or architecture narrative.

### INDEPENDENT REVIEW

**Purpose:** independently evaluate semantic completion and compliance.

**Receives:**

- signed task;
- applicable resolved higher authority;
- current candidate diff/state;
- mechanical evidence.

Builder reasoning is not authoritative input. Builder reports may be available only as supplemental forensic evidence. Independent review explicitly evaluates module cohesion/decomposition and fails a candidate whose changed orchestration/boundary module has accumulated another architectural responsibility, regardless of file-count or LOC arguments.

**Produces:**

- PASS;
- FAIL_REPAIRABLE;
- BLOCKED_SPEC_OR_DESIGN;
- with findings and evidence.

### AUDIT

**Purpose:** prove existing implementation upward against the pyramid.

**Receives:**

- P8 implementation/evidence for the audited scope;
- applicable resolved P1-P7 authority for that scope;
- compact conformance results plus current sensors/evidence references, with underlying evidence retrieved where required.

Audit traverses the pyramid in reverse:

```text
P8 -> proves P7
P7 -> conforms to P6
P6 -> conforms to P5
P5 -> conforms to P4
P4 -> realizes P3
P3 -> realizes P2
all -> obey P1/P0
```

Audit findings return to the exact owning layer rather than being converted automatically into implementation tasks.

## 7. Continuous pyramid conformance

Conformance is checked at every promotable boundary, not only at R3 or after code exists.

Conceptually:

```text
produce stage artifact
        |
        v
resolve applicable higher authority
        |
        v
run mechanical sensors where available
        |
        v
semantic conformance required by stage policy
        |
        +-- FAIL -> return to owning layer
        |
        v
record conformance evidence
        |
        v
promote
```

A lower stage may become more specific. It may not silently weaken an obligation inherited from above.

Continuous conformance does **not** require a fresh independent agent at every boundary. By default, independent semantic review is mandatory at R3 and post-implementation V4. Earlier stages use deterministic/mechanical checks plus their stage-owned conformance result unless explicit project governance requires an additional independent review.

## 8. Monotonic obligation propagation

Once an obligation becomes applicable, it persists into every lower layer until it is explicitly superseded by valid higher-layer authority.

Example:

```text
P1 strict typing
    -> P4 typed application boundaries
    -> P6 canonical typed contract
    -> P7 implementation task
    -> P8 typed implementation
```

P6 cannot drop the obligation because typing is inconvenient.

P8 cannot claim behavior tests compensate for violating it.

This is constraint propagation through the SDLC.

## 9. Artifact conformance evidence

A document must not become "compliant" because it labels itself compliant.

Conformance is evidence associated with an exact artifact revision.

Conceptually:

```text
artifact revision/hash
+ resolved authority snapshot
+ stage conformance policy
+ mechanical evidence
+ semantic review evidence where required
= conformance result
```

If the artifact changes materially, its prior conformance result is stale.

If material higher authority changes, dependent conformance results are stale.

The exact persisted representation is owned by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md): coordinator-owned conformance RunEvents plus explicit ArtifactRef dependency edges. Order does not create a duplicate conformance domain model.

## 10. Downstream handoff rule

A stage artifact should expose enough explicit information for downstream resolution without reproducing upstream authority.

At minimum it carries or references:

- its own stable identity;
- upstream authority identities;
- scope/exclusions it owns;
- downstream obligations created by its decisions;
- relevant validation obligations;
- unresolved non-blocking observations, if any.

Order follows those references to resolve the next stage's context from canonical sources.

## 11. Context freshness

Before each stage invocation, Order verifies that material referenced authority has not changed in a way that invalidates the upstream conformance result.

Freshness rules depend on lifecycle position:

- pre-sign-off work may be returned to the owning stage for revalidation;
- signed execution work becomes APPROVAL_STALE when material signed authority changes;
- current repository/runtime evidence used by R1, R3, implementation preflight, or audit must be refreshed according to the stage's evidence needs.

A stale context is never silently used because it is cheaper.

## 12. Prompt assembly rule

The prompt is the final rendering of the resolved lifecycle context, not the source of governance.

Prompt assembly must preserve:

- authority identity and precedence;
- stage objective;
- allowed decisions;
- prohibited decisions;
- scope/exclusions;
- selected canonical source content;
- required output;
- required stop conditions.

Prompt wording may evolve without changing the underlying stage context/conformance semantics.

## 13. No context-derived authority

Agent summaries, prompt projections, conversation history, previous model conclusions, and generated context bundles are not higher-order authority merely because they are convenient.

If a context projection conflicts with its canonical source, the canonical source wins and the projection is invalid.

## 14. Implementation consequence

Order implementation therefore needs one deterministic context-resolution path shared by all agentic stages.

That path takes:

- lifecycle stage;
- work item;
- resolved engineering concerns;
- resolved authority map;
- canonical artifact references;
- current project/repository evidence where stage-appropriate;

and produces the minimum sufficient execution context according to the stage policy above.

The stage-specific policy is data/pure decision logic in Order's functional core. Reading files, repository state, Span, OpenCode, and other external systems remains in the imperative shell.

No per-agent hand-built context pipeline should become a second governance mechanism.
