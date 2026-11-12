# 01 — Work lifecycle

**Status:** Design baseline
**Canonical concern ID:** `GW-DOC-WORK-LIFECYCLE`  
**Versioned concern ID:** `GW-DOC-WORK-LIFECYCLE-V1`  

## 1. Principle

The implementation TODO list is not a backlog of ideas.

A Order `TODO` item is an execution contract that exists only after a factually closed, requirements-complete, designed, planned, independently reviewed, and explicitly authorized work package.

The pre-execution pipeline is therefore intentionally more rigorous than the execution loop.

All packages must satisfy the [GW-DOC-SPECIFICATION-STANDARD-V1](05-specification-standard.md), every agent stage is governed by [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md), and execution cannot reach `CANDIDATE_DONE` except through the [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md).

No lifecycle transition is valid merely because the producing agent finished. Every promotable stage output must pass its stage-specific conformance gate against all applicable resolved higher pyramid authority.

## 2. Canonical stages

### IDEA

An untrusted observation, request, opportunity, defect report, or implementation discovery.

No production-code changes are authorized.

An idea may remain here indefinitely.

### R1 — Research

Question:

> What is actually true?

R1 establishes current-state facts from the project's authoritative sources and current repository/runtime state.

It should close, as applicable:

- whether the reported problem exists;
- the actual producing boundary or root cause;
- governing ADRs, contracts, plans, and repository rules;
- the relevant producer → carrier → consumer path;
- downstream consumers and invariants;
- whether the work is duplicate, obsolete, or already satisfied;
- unresolved factual questions.

R1 completion values are kind-gated by the pinned WorkItem schema under `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`.

For `CHANGE` and `DEFECT`:

- `CONFIRMED` may progress to R2;
- `DISPROVEN`, `DUPLICATE`, and `ALREADY_SATISFIED` are terminal outcomes.

For `INVESTIGATION`:

- `INVESTIGATION_COMPLETE`, `DUPLICATE`, and `ALREADY_SATISFIED` are successful terminal outcomes;
- `CONFIRMED` and `DISPROVEN` are not valid successful completions for that kind.

For `AUDIT`:

- `AUDIT_COMPLETE`, `DUPLICATE`, and `ALREADY_SATISFIED` are successful terminal outcomes;
- `CONFIRMED` and `DISPROVEN` are not valid successful completions for that kind.

`NEEDS_DECISION` and `BLOCKED` remain non-success conditions that retain R1 ownership.

`INVESTIGATION_COMPLETE` and `AUDIT_COMPLETE` transition directly to `COMPLETE / COMPLETE` with the corresponding terminal WorkOutcome. They do not manufacture R2/DESIGN/PLAN/R3/EXECUTION work. If remediation is needed, it is represented by a separately governed linked `CHANGE` or `DEFECT` WorkItem.

Promotion and terminalization remain governed by [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md); schema-specific eligibility must be validated before applying the lifecycle transition.

### R2 — Requirements

Question:

> What outcome is required?

R2 defines the required behavior without prematurely choosing implementation mechanics.

It closes:

- required observable outcome;
- business/user reason where material;
- binding behavior;
- acceptance criteria;
- scope;
- explicit exclusions;
- failure semantics;
- security/performance/compatibility constraints where material.

The acceptance criteria established here are later consumed by readiness and verification. Implementation may not rewrite them to fit the resulting code.

R2 promotion is governed by [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md). Missing required product intent is not resolved by agent invention.

### DESIGN

Question:

> What is the correct solution?

Design resolves architectural choices before implementation.

It establishes, as applicable:

- canonical owner;
- data/control flow;
- affected boundaries;
- existing capabilities to reuse;
- behaviors to delete or replace;
- genuinely necessary new concepts;
- downstream implications;
- failure behavior;
- alternatives considered;
- why the selected change is the minimum sufficient architecture-consistent solution.

An implementation worker must not be required to choose among material architectural alternatives.

The design must satisfy the target project's applicable governance and the [GW-DOC-MINIMUM-CHANGE-V1](08-minimum-change-standard.md). Design promotion is governed by [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md).

### PLAN

Question:

> Exactly how does the current repository reach the designed state?

The plan translates the design into executable work and defines dependency order and verification.

Every planned implementation unit must be traceable through every applicable authority layer:

```text
P7 plan task
   -> P6 canonical contract/specification
   -> P5 ADR/decision where applicable
   -> P4 technical architecture/requirement
   -> P3 functional requirement
   -> P2 product/user intent
   -> P1 governing principle
```

R1 evidence establishes the current-state facts supporting that chain; it is evidence, not a substitute authority layer. This trace is the lifecycle form of the canonical P7 rule in [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](10-systems-governance-pyramid.md).

A plan task without an upstream justification is presumed scope creep.

A requirement without plan coverage means the implementation is incomplete.

The plan also records the expected semantic change surface and required validation gates. Plan promotion is governed by [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md).

### R3 — Readiness Review

Question:

> Can an implementation worker execute this package correctly without making a material interpretation or design decision?

R3 is an independent adversarial review. It treats R1, R2, Design, and Plan as untrusted.

R3 verifies at least:

- the package satisfies [GW-DOC-SPECIFICATION-STANDARD-V1](05-specification-standard.md);
- R1 still matches current repository state;
- requirements match governing authority;
- design satisfies every requirement;
- design preserves canonical ownership;
- design is minimum-sufficient rather than speculative;
- plan completely implements the design;
- plan contains no unrelated work;
- the expected change surface is explicit;
- acceptance criteria and validation gates are verifiable;
- dependencies are explicit and resolved;
- material downstream effects are covered;
- applicable ADRs/architecture rules are identified and satisfied;
- no unresolved decision has been delegated to implementation.

The final adversarial question is:

> What could still make this fail in production, violate a binding contract, force the implementer to guess, or cause unnecessary code/architecture to be introduced?

R3 outcomes:

- `READY_FOR_SIGNOFF`;
- `RETURN_TO_RESEARCH`;
- `RETURN_TO_REQUIREMENTS`;
- `RETURN_TO_DESIGN`;
- `RETURN_TO_PLAN`;
- `BLOCKED`.

There is no "mostly ready" state.

## 3. Explicit sign-off

Only an explicit authorized action may cross the execution authority boundary.

An approval identifies an exact package:

- work item;
- referenced R1 artifact revision/hash;
- referenced R2 artifact revision/hash;
- referenced Design artifact revision/hash;
- referenced Plan artifact revision/hash;
- referenced R3 artifact revision/hash;
- governance set material to execution;
- exact execution-task definitions;
- exact validation contract through the signed task gate ids and material project verification bindings;
- minimum-change forecast through the signed task scope, exclusions and expected change surface;
- approving actor;
- approval timestamp;
- package hash.

For source-backed work governed by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, sign-off also binds the exact originating WorkItem source snapshot on which the package depends. A material change to that source invalidates the approval through the same upstream-freshness mechanism before further productive execution.

A material upstream, governance, project-manifest or verification-binding change invalidates the approval automatically. P6 represents the exact package through the signed PLAN/R3 ArtifactRef roots plus their persisted transitive material dependency closure; it does not duplicate every upstream artifact into Approval fields.

```text
current resolved material source set/bytes
              !=
signed PLAN/R3 material dependency closure
              |
              v
       APPROVAL_STALE
```

An unrelated repository commit that leaves the resolved material source set and bytes unchanged does not by itself stale approval; the approved baseline commit remains the execution baseline. Execution may not continue under a stale approval.

## 4. TODO materialization

`TODO` is generated from signed-off execution-task definitions.

The plan remains the design/implementation authority for what should be changed. The materialized `ExecutionTask` is the canonical execution-boundary contract: it carries only what the worker and coordinator need to execute and verify one approved unit.

Each execution task includes, at minimum:

- task identity;
- approval identity;
- objective;
- authorized scope;
- explicit exclusions;
- acceptance criteria;
- dependencies;
- expected semantic change surface;
- prescribed logical validation gates;
- relevant authority/artifact references.

The implementation worker cannot create additional execution tasks.

## 5. Discoveries during execution

An implementation or review agent may discover unrelated facts.

Those become observations linked to the originating run:

```text
execution observation
        |
        v
       IDEA
```

They do not become TODO items and cannot be folded into the active task.

Any discovered work must traverse the complete lifecycle before execution authority exists.

## 6. Promotion rules

State changes are semantic transitions, not arbitrary status assignments.

Examples:

- `complete_research(...)`;
- `accept_requirements(...)`;
- `approve_design(...)`;
- `complete_plan(...)`;
- `submit_readiness_review(...)`;
- `sign_off(...)`;
- `materialize_execution_tasks(...)`.

Each transition validates its prerequisites.

Impossible states should be structurally difficult to represent.

## 7. Order v1 functional requirements

The following are the stable R2/P3 functional requirement identities for the already-approved v1 behavior. They refine the product intent `GW-P2-CONTROLLED-WORK` from [GW-DOC-SYSTEM-BRIEF-V1 §8](00-system-brief.md); they do not introduce new product behavior. Detailed architecture and exact contracts remain owned by P4-P6.

### GW-FR-001-GOVERNED-LIFECYCLE

**Required behavior:** work progresses only through the canonical IDEA → R1 → R2 → DESIGN → PLAN → R3 → explicit sign-off → execution lifecycle, with each stage constrained to its own decision boundary.

**Acceptance criterion:** no execution task exists before an exact package has passed R3 and explicit sign-off; invalid/incomplete stages return or block rather than being silently promoted.

**Failure/negative behavior:** conversation, agent completion, or scheduler activity alone must never create execution authority or skip a lifecycle stage.

### GW-FR-002-REPRODUCIBLE-AUTHORITY

**Required behavior:** every approved execution task is reproducibly derived from exact committed authority, plan, readiness and verification material.

**Acceptance criterion:** the signed package can be reconstructed from stable authority references and exact artifact bytes at one approval baseline, and a material authority/verification change makes the approval stale.

**Failure/negative behavior:** uncommitted material authority, unresolved references, stale material, or duplicated semantic ownership must block sign-off/execution rather than be inferred or copied into a parallel authority model.

### GW-FR-003-DURABLE-BOUNDED-EXECUTION

**Required behavior:** Order durably owns task/run state outside model sessions and executes at most the exact authorized task under its dependencies, scope, exclusions and baseline.

**Acceptance criterion:** eligible work starts through the canonical atomic task/run transition; interruption/restart recovers from durable Order state; retries/remediation remain bounded by the validation policy.

**Failure/negative behavior:** provider-session state, worker claims/leases, an abandoned workspace, or an implementation agent must not become an alternate execution authority or expand the signed task.

### GW-FR-004-INDEPENDENT-VALIDATION

**Required behavior:** candidate completion requires prescribed deterministic gates plus independent semantic review, architecture/governance validation and minimum-change validation.

**Acceptance criterion:** the V0-V7 flow reaches `CANDIDATE_DONE` only after all applicable evidence is current and successful; failures are classified and routed according to [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md).

**Failure/negative behavior:** builder self-attestation, stale green evidence, skipped required gates, blind repair of design/spec defects, or unlimited semantic retries must never count as completion.

### GW-FR-005-LOCAL-WORKBENCH

**Required behavior:** one local browser workbench exposes the governed lifecycle, authority/evidence inspection, explicit artifact-proposal disposition, readiness inspection, explicit sign-off and candidate inspection over daemon-owned state. The same workbench supports light and dark appearance with an operator-selectable `System | Light | Dark` preference; `System` is the default and follows the operating-system/browser color-scheme preference.

**Acceptance criterion:** the local UI can perform the v1 human interaction surface defined by [GW-DOC-TECHNICAL-ARCHITECTURE-V1 §18](12-technical-architecture.md) through the canonical loopback HTTP contract, while the daemon remains the sole workflow-state-mutating process. Light and dark modes are visually distinct across the workbench chrome, controls and governed content/status surfaces; an explicit Light or Dark choice survives reload for that browser profile, while System restores live system-following behavior.

**Failure/negative behavior:** browser-local workflow state, direct browser Git/SQLite/OpenCode access, remote/multi-user hosting, hidden sign-off, or a second transport/state machine is not permitted in v1. Appearance preference is presentation-local state only: it must not alter lifecycle semantics, daemon state, persisted Order domain state, HTTP contracts or canonical work artifacts.

### GW-FR-006-MINIMUM-VERIFIED-CANDIDATE

**Required behavior:** successful execution yields the minimum sufficient verified candidate for the signed task and hands it off without performing downstream delivery operations.

**Acceptance criterion:** the actual diff remains within authorized scope/change surface, passes V2/V5/V6/V7, retains required evidence/workspace for inspection, and terminates with the canonical candidate result.

**Failure/negative behavior:** unrelated cleanup, speculative abstraction, compatibility/fallback machinery, automatic commit/push/PR/merge/deploy, or materially larger unapproved scope must not be folded into the active task.

### GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP

**Required behavior:** Order provides one purpose-built guided productive installer that owns the complete first-run bootstrap as one continuous operator experience. The root `install.sh` is only the minimal bootstrap needed to obtain the pinned installer runtime and transfer control to that installer; it is not the product setup workflow and must not delegate first-run configuration to a separate post-install CLI command. Any credential, model or filesystem choices that require operator intent are collected inside the installer itself; after it reports success, ordinary Order use requires no separate provider-login command, setup command, model environment variable, daemon-start command or other mandatory setup step.

**Acceptance criterion:** successful installation leaves the exact pinned application/runtime installed, Order's private OpenCode credential namespace usable, one exact provider/model persistently selected, repository-access policy persistently configured, the productive daemon running under the supported user-level supervisor, and `order status` healthy. Re-running the same productive install command is the supported update path. During beta, a supported prior Order configuration is upgraded in place by retaining every still-valid existing choice and supplying only newly introduced fields from the current canonical default when no new operator intent is required. If an already-configured v1 target is itself an exact Git root but lacks the newly required project manifest, the installer retains that target and materializes the minimum current manifest from deterministic existing repository facts: project identity from the Git-root basename and root `AGENTS.md` as P1 authority when that file exists. It must not invent project refs, concerns, gates or additional authority classification, and a later update failure removes a manifest created by that attempt. When a previous repository-access field used an older broad-parent representation that is not itself an exact Git root, the installer may narrow it only from exact repositories already evidenced by persisted legacy WorkItems and still covered by the old target root; it must not recursively discover repositories. Only when no exact Git target can be established from retained configuration/evidence may the installer ask for the now-required exact target-repository choice. Private provider credentials are retained. Persisted workflow state that cannot be truthfully transformed into the current schema may be archived and reinitialized by the installer rather than fabricated or allowed to block the update.

**Failure/negative behavior:** installation/update must not print success while provider/model configuration is absent, the daemon is offline, repository access is undefined, or further mandatory shell exports/commands are required. A supported previous configuration must not fail merely because a newly introduced field is absent, and update must not force the operator to re-enter still-valid configuration. Order must not solve this by inheriting ambient OpenCode configuration/credentials, silently selecting a model, fabricating historical workflow/source/sign-off semantics, or hiding an incompatible persisted-state transition.

### GW-FR-008-GOVERNED-REPOSITORY-ACCESS

**Required behavior:** the operator explicitly controls the finite set of exact target Git repositories Order may govern and, separately, which additional roots a pre-signoff STAGE agent may read as external reference material.

**Acceptance criterion:** every WorkItem repository equals one configured exact Git top-level realpath with a valid root project manifest; the configured target set supplies the deterministic project catalog without recursive repository discovery. A Run still has one authoritative target repository/workspace. Optional reference roots grant only read/glob/grep access during STAGE through the provider's explicit external-directory permission boundary; post-signoff BUILDER, REVIEWER and REMEDIATOR Runs remain confined to the governed target checkout and signed change surface.

**Failure/negative behavior:** Order must reject repositories not explicitly configured as targets, must not recursively interpret a broad parent directory as a target-project catalog, must not treat reference-root bytes as project authority merely because they are readable, and must never convert repository/reference discovery configuration into unrestricted external mutation or post-signoff cross-repository access.

These eight requirements are the R2 acceptance authority consumed by P7 `acceptanceRefs`. P4/P5/P6 may constrain how they are realized but may not weaken them.

