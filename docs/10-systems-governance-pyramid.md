# 10 — Systems governance pyramid

**Status:** Binding design standard
**Canonical concern ID:** `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID`  
**Versioned concern ID:** `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`  

## 1. Purpose

Order governs a software system through one ordered authority pyramid from first principles to implementation evidence.

The pyramid answers four questions for every artifact:

1. what kind of authority is this;
2. what authority sits above it;
3. what it is allowed to decide;
4. what lower layers must conform to it.

An adopting project does not invent a separate governance hierarchy. It plugs its existing or new documents into this pyramid.

Where Order defines a default and the project does not explicitly replace or extend it, the Order default applies.

Where a project supplies an explicit project rule, requirement, architecture decision, contract, or implementation constraint, that project authority is resolved at the appropriate layer and governs lower layers.

Order never fills missing product behavior by inference.

## 2. The complete pyramid

The pyramid is ordered from broad, stable authority to narrow, concrete realization.

```text
P0  ORDER GOVERNANCE KERNEL
    lifecycle integrity, authority resolution, traceability,
    explicit sign-off, independent validation, evidence

P1  SYSTEM / PROJECT FIRST PRINCIPLES
    product principles + engineering principles
    Order defaults unless explicitly replaced/extended

P2  USER / PRODUCT INTENT
    users, problems, outcomes, product constraints

P3  FUNCTIONAL REQUIREMENTS
    observable behavior, acceptance, failure semantics,
    explicit exclusions

P4  TECHNICAL REQUIREMENTS + PROJECT ARCHITECTURE
    non-functional constraints, boundaries, dependency direction,
    data/state ownership, runtime/environment constraints

P5  ARCHITECTURE DECISIONS
    ADRs: specific consequential choices made under P1-P4

P6  CANONICAL CONTRACTS + SPECIFICATIONS
    typed data/state contracts, schemas, protocols, lifecycle contracts,
    exact feature/change specification

P7  IMPLEMENTATION PLAN + EXECUTION TASKS
    exact repository transition, dependencies, change surface,
    validation gates

P8  IMPLEMENTATION + VERIFICATION EVIDENCE
    source, tests, migrations/config where authorized,
    validation results, independent review
```

Higher layers constrain lower layers.

Lower layers may provide evidence about higher layers, but they do not become authority merely because they exist.

For example:

- code does not override a requirement;
- a test does not override an ADR;
- an ADR does not override a first principle unless the project explicitly changes or excepts that principle through the project governance mechanism;
- a plan does not redefine a canonical contract;
- an implementation agent does not invent a functional requirement.

## 3. P0 — Order governance kernel

P0 defines what it means for work to be Order-governed.

These controls are not project architecture preferences and are not inherited defaults. They are Order integrity requirements.

P0 includes:

- authority must be resolved before implementation;
- product behavior cannot be invented from missing requirements;
- material decisions must be closed before execution;
- implementation authority requires explicit sign-off;
- signed work must be traceable through the pyramid;
- implementation cannot self-expand scope;
- implementation cannot self-certify completion;
- validation is external to the builder;
- validation evidence is required for terminal success;
- failures are classified before remediation;
- remediation is bounded;
- material authority drift invalidates approval;
- unrelated discoveries return to the work-refinery lifecycle.

A project that removes these controls is no longer operating under Order semantics.

## 4. P1 — System / project first principles

P1 contains the stable principles under which product and engineering decisions are made.

It has two subdomains.

### P1-A — Product/system principles

These are project-owned statements such as:

- target users;
- product posture;
- safety or trust principles;
- domain authority principles;
- user-experience principles;
- economic/operational principles.

Order does not invent project-specific product principles.

It may provide structural guidance for how such principles are expressed.

### P1-B — Engineering first principles

Order supplies the following default engineering constitution unless explicitly replaced or extended by the adopting project:

1. **GW-P1-DOD — Data-oriented design** — represent system meaning primarily as explicit typed data and transformations over that data.
2. **GW-P1-FCIS — Functional core / imperative shell** — deterministic policy and transformation logic belongs in pure or effect-free functions; external effects live at explicit shells.
3. **GW-P1-SOC — Separation of concerns** — policy, transformation, orchestration, persistence, transport, presentation and external effects have clear responsibilities and dependency direction. A production module remains cohesive to one current architectural responsibility; when implementation evidence proves multiple independently testable responsibilities or distinct semantic/effect boundaries have accumulated, decomposition is required rather than allowing an orchestration or boundary module to become a catch-all.
4. **GW-P1-DRY — DRY as semantic ownership** — one authoritative owner for a rule, state concept, contract or semantic fact; do not create parallel representations merely to satisfy layers.
5. **GW-P1-STRICT-TYPING — Strict typing** — meaningful production boundaries use explicit static types; unchecked coercion and shape guessing do not substitute for contracts.
6. **GW-P1-CANONICAL-OWNERSHIP — Canonical ownership** — state and boundary semantics have one canonical owner and one declared mutation path.
7. **GW-P1-EXPLICIT-FLOW — Explicit data/control flow** — required dependencies and transitions are visible rather than hidden in object graphs, reflection, service locators or silent fallback.
8. **GW-P1-MINIMUM-CHANGE — Minimum sufficient change** — implement nothing unnecessary and omit nothing required.
9. **GW-P1-AUTHORITY-BEFORE-INFERENCE — Authority before inference** — implementation evidence informs decisions but cannot silently replace governing product, architecture or contract authority.
10. **GW-P1-DOC-CANONICALITY — Canonical document ownership** — each governed concern has exactly one canonical document owner; any other document that depends on that concern references the canonical owner by identifier rather than restating or redefining its normative semantics.

The `GW-P1-*` identifiers are stable Order default-rule ids used by the project authority map.

### Canonical documentation ownership and reference law

`GW-P1-DOC-CANONICALITY` applies semantic DRY and canonical ownership to documentation itself.

- one governed concern has one canonical semantic document owner;
- every owner declares one stable concern identifier and one current version-specific identifier. Order-owned canonical documents use the `GW-DOC-*` namespace; adopting projects may use their own project-owned identifier namespace;
- cross-document references use the identifier. A Markdown link may accompany the identifier for navigation, but a filename, document number or title is not authority identity;
- a reference to the concern independent of version uses its stable identifier;
- a reference that requires a particular semantic version uses a versioned identifier such as `GW-DOC-...-V1`;
- a dated factual snapshot may extend the versioned identifier with the snapshot date, for example `...-V1-YYYY-MM-DD`;
- exact historical bytes are frozen by the normal ArtifactRef/hash/approval mechanism. If an older semantic version must remain selectable as live authority after the canonical owner advances, that version must be retained as a distinct immutable source and its versioned identifier must resolve to that source;
- non-owner documents may state a local consequence, dependency, acceptance condition or integration point and cite the owning identifier. They must not reproduce the concern's normative definition, decision table, contract, policy, or rationale as a second source of truth;
- summaries, agent instructions, plans and reviews are never shadow specifications. When they need a governed rule, they cite its identifier and add only context that they themselves canonically own;
- changing the semantic owner or meaning of a canonical concern is an upstream authority change. Renaming/moving a file without changing the concern keeps the stable identifier and updates its resolver;
- the project authority/ref registry must reject duplicate concern/version identifiers and unresolved owner references.

The Order canonical concern identifiers resolve through project-root `pontivus-order.toml [refs]`. The exact manifest mechanics remain owned by `GW-DOC-CANONICAL-CONTRACTS-V1`.

### Default object-model posture

Order's default engineering constitution is functional and data-oriented, not object-oriented.

By default:

- domain behavior is functions over canonical typed data;
- tagged unions/enums plus explicit dispatch are preferred to polymorphic hierarchies;
- Order-style application code does not define behavior-bearing classes or service/repository/controller object graphs;
- DTO families and parallel domain/API/persistence/UI shapes for the same semantic concept are prohibited;
- transport and persistence encode canonical contracts or minimal command/event values rather than introducing mapper-owned semantic copies;
- vendor/framework objects stay at imperative boundaries and do not become domain owners.

Order itself adopts this default without exception.

Module size, LOC and function count may be used as review signals, but never as standalone quality targets. The governing proposition is semantic cohesion: one current responsibility per module/boundary, with required same-layer decomposition when distinct present responsibilities would otherwise be coupled. A fixed implementation surface cannot override this P1 rule. When the required split only redistributes existing behavior inside the already-declared architecture, preserving canonical semantic ownership, public contracts, state meaning, effect boundaries and dependency direction, it is an architecture-preserving implementation necessity rather than a redesign. If satisfying the requirement needs any of those architecture properties to change, execution returns to DESIGN/PLAN.

A target project may explicitly choose a different P1 engineering principle for its own existing architecture, but the choice must be declared as an override and validated through lower layers. An implementation worker cannot create that exception ad hoc.

## 5. P2 — User / product intent

P2 defines why the system or change exists.

Typical authority includes:

- user problem;
- user/job outcome;
- business or operational outcome;
- product boundary;
- domain-specific constraints;
- explicit non-goals.

This layer is user/project supplied.

There is no Order default that invents a missing product requirement.

If product intent is required to decide a lower-layer question and is absent or contradictory, the work is blocked.

## 6. P3 — Functional requirements

P3 converts intent into observable required behavior.

Each material functional requirement identifies:

- stable requirement id;
- required behavior;
- acceptance criterion;
- failure behavior where applicable;
- explicit negative behavior;
- scope and exclusions;
- upstream product/user intent.

P3 states **what must be true**, not an implementation mechanism unless that mechanism is itself a required product constraint.

Order supplies the requirements-writing standard. The project supplies the actual functional requirements.

## 7. P4 — Technical requirements and project architecture

P4 defines the technical constraints under which P3 must be realized.

It includes, as applicable:

- performance;
- availability;
- security/privacy;
- compatibility;
- observability;
- deployment/runtime constraints;
- module/domain boundaries;
- dependency direction;
- effect boundaries;
- canonical state ownership;
- persistence rules;
- concurrency model;
- external integration boundaries;
- generated-file policy;
- testing/execution environment.

P4 inherits P1 engineering principles unless the project has explicitly replaced or extended them.

Technical requirements cannot silently weaken functional requirements.

When technical and functional requirements conflict, the conflict is resolved explicitly above implementation.

## 8. P5 — Architecture decisions

P5 contains ADRs and equivalent consequential design decisions.

An ADR records a choice made under P1-P4.

Every applicable ADR should identify:

- status;
- context;
- governing P1 principles;
- relevant P2/P3/P4 authorities;
- decision;
- affected architectural boundaries;
- canonical owner;
- consequences;
- rejected material alternatives;
- required architecture fitness functions or validation;
- reconsideration triggers;
- supersedes / superseded-by relationships.

An accepted ADR is historical decision authority. It is superseded by a later decision rather than casually rewritten to hide the prior decision.

### ADR override rule

An ordinary ADR cannot silently override P1.

If a project intentionally deviates from a P1 default, the deviation belongs at P1 as an explicit project principle/exception and the ADR may then implement that resolved principle.

This prevents a local implementation decision from manufacturing its own higher-order authority.

## 9. P6 — Canonical contracts and specifications

P6 makes the architecture concrete.

Canonical contracts own, as applicable:

- typed data;
- allowed states;
- invariants;
- producer and consumer boundaries;
- serialization/parsing;
- state lifecycle;
- mutation authority;
- protocols/interfaces that represent a real semantic boundary.

A project should preserve one canonical semantic representation through a boundary rather than create DTO/domain/API copies of the same concept.

A change specification at P6 binds together the applicable P1-P5 authorities for one requested outcome.

## 10. P7 — Implementation plan and execution tasks

P7 defines the exact repository transition.

Every plan task must trace upward through the pyramid.

```text
P7 task
  -> P6 contract/specification
  -> P5 ADR where applicable
  -> P4 technical architecture/requirement
  -> P3 functional requirement
  -> P2 product/user intent
  -> P1 governing principle
```

Not every task needs a distinct artifact at every layer. It must, however, be consistent with every applicable authority layer.

Execution tasks are deterministic materializations of signed P7 tasks. They do not become a second planning authority.

## 11. P8 — Implementation and verification evidence

P8 is the realization layer.

It includes:

- source changes;
- tests;
- schema/config/migration changes when authorized;
- mechanical validation results;
- architecture fitness-function results;
- independent semantic review;
- final diff/scope evidence.

P8 proves compliance with P1-P7.

P8 does not rewrite them.

A green test suite cannot make an architecture violation valid.

An implementation matching its plan is still invalid if the plan conflicts with a higher authority.

## 12. Default inheritance and project override

Order resolves authority layer by layer.

Conceptually:

```text
resolved layer =
    Order mandatory kernel requirement, where applicable
    +
    explicit project/user authority
    +
    inherited Order default for any defaultable rule not replaced
```

Three cases exist.

### Case A — explicit project authority

The project explicitly supplies a rule/decision at the correct layer.

That project authority applies to lower layers, provided it does not violate P0.

For a defaultable P1 engineering rule, the explicit project rule replaces or extends the Order default.

### Case B — no explicit project authority, Order default exists

The Order default applies.

Silence is inheritance, not permission for an agent to improvise.

### Case C — no explicit project authority and no valid Order content default exists

The layer remains unresolved.

Order does not invent user/product behavior or material domain decisions.

If the unresolved item is needed for implementation, execution is blocked and the work returns to the appropriate upstream stage.

## 13. Override requirements

An override is explicit governance, not contrary code.

A valid override identifies:

- the Order default or inherited rule being replaced;
- the project layer at which the replacement lives;
- replacement rule;
- rationale;
- scope;
- consequences;
- validation/fitness-function implications.

Lower-layer artifacts may not constitute an override merely by contradicting a default.

Examples:

```text
VALID:
P1 project principle explicitly selects an actor/object model for a bounded subsystem,
with rationale and architecture tests.

INVALID:
implementation introduces mutable service/domain object hierarchy and later claims
the project "implicitly uses OOP."
```

## 14. Extension versus override

Projects may add stricter or domain-specific considerations without replacing Order defaults.

Example:

```text
Order P1 default:
strict typing

Project extension:
strict typing + no Any + no unchecked casts across application boundaries
```

Both apply.

An extension should be preferred to an override when the project requirement is compatible with the default.

## 15. Document placement by authority, not filename

Order does not require every project to rename existing documents.

Instead, project documents are classified by pyramid role.

Examples:

- product charter or principles document -> P1/P2;
- requirements specification -> P3;
- architecture overview -> P4;
- ADR -> P5;
- typed contract / canonical specification -> P6;
- implementation plan -> P7;
- code/test evidence -> P8.

One document may legitimately contain material from more than one adjacent layer when ownership is clear.

The authority comes from its resolved pyramid role and project governance, not from a filename.

## 16. Authority map

Every adopted project needs a resolvable authority map that answers, for each layer:

- which project artifact(s) supply authority;
- which Order defaults remain inherited;
- which defaults are explicitly overridden;
- which extensions apply;
- which rules are mechanically enforceable;
- which rules require semantic review.

The v1 physical representation of this map is project-root `pontivus-order.toml`, whose exact P6 grammar is owned by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md). Mechanically checkable propositions of inherited/resolved P1 rules bind to project verification sensors through `governance.fitness`; override/extension gates are additive.

The manifest references project authority; it does not duplicate the rule text. Order must not require projects to copy existing authoritative content merely to populate the map.

## 17. Continuous conformance and lifecycle context

The pyramid is enforced continuously through [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md).

Every agent stage receives the minimum sufficient projection of applicable higher authority, operates inside an explicit decision boundary, and must pass the conformance rule owned by [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md) before promotion.

Validation therefore proceeds both top-down and bottom-up.

### Top-down before implementation

```text
P1 principles
    ↓
P2 intent
    ↓
P3 functional requirements
    ↓
P4 technical architecture
    ↓
P5 ADRs
    ↓
P6 contracts/specification
    ↓
P7 plan
```

R3 proves there are no material contradictions or missing decisions.

### Bottom-up after implementation

```text
P8 implementation/evidence
    ↑ proves
P7 plan
    ↑ proves
P6 contracts/specification
    ↑ conforms to
P5 ADRs
    ↑ conforms to
P4 architecture
    ↑ realizes
P3 requirements
    ↑ realizes
P2 intent
    ↑ under
P1 principles
```

The candidate is complete only when both directions close.

## 18. Fitness-function rule

A binding architecture rule that can be checked mechanically should have a mechanical sensor.

Examples:

- dependency direction;
- forbidden imports;
- pure-core I/O restrictions;
- strict typing;
- canonical-contract duplication;
- generated-file mutation;
- schema constraints;
- forbidden fallback/compatibility constructs.

Where a rule cannot be mechanically proven, Order's independent reviewer must evaluate it explicitly. Module cohesion/decomposition is always an explicit review proposition even when mechanical architecture sensors also exist; a green import scan or typecheck cannot prove that one module still has one responsibility.

Once a concrete module/dependency boundary has been materialized and is mechanically checkable, its fitness sensor becomes a permanent regression invariant. The sensor must require the protected owners/dependency direction unconditionally; it may be extended in the same implementation change to register an architecture-preserving same-layer split, but it must not be weakened or made conditional on the very structure it protects.

Architectural governance is therefore:

```text
principle / requirement / decision
              +
         enforcement sensor
              +
      independent review where needed
```

not documentation alone.

## 19. Adoption contract

A project adopting Order is therefore adopting:

1. the P0 governance kernel;
2. the complete P1-P8 authority structure;
3. Order defaults where the project is silent;
4. explicit project authority where provided;
5. explicit override semantics rather than accidental drift;
6. top-down readiness validation;
7. bottom-up implementation proof.

This makes the pyramid the single explanation for where authority belongs and how work reaches implementation.
