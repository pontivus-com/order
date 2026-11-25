<!-- Order template: change-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

# Functional-pyramid conformance research

## Current state/absence

Order already has the required pyramid structure in substance.

`GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` defines P0-P8, states that higher layers constrain lower layers, prevents implementation/tests/plans from overriding higher authority, requires P3 requirements to identify upstream product intent, requires P5 decisions to identify governing authority, requires P6 change specifications to bind P1-P5, requires P7 tasks to trace upward, and classifies P8 as evidence rather than authority.

`GW-P1-DOC-CANONICALITY` already prohibits shadow specifications and requires one canonical document owner per governed concern. `GW-P1-DRY`, `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` already establish one semantic owner, one mutation path and visible dependency/control flow. `GW-DOC-CANONICAL-CONTRACTS-V2` already prohibits DTO/domain/persistence/UI copies of equivalent semantic shapes.

The gap is therefore not a missing pyramid. It is incomplete expression and proof of two cross-cutting invariants:

1. **proposition placement and derivation** — the current owner states the layer taxonomy and several traceability consequences, but does not yet state one closed proposition-level law for deciding where a normative statement belongs, distinguishing higher authority from lower derivation, and treating lower-layer restatement as a defect rather than additional authority; and
2. **semantic lifecycle closure/noninterference** — the current P1 rules establish owner and explicit flow, but do not state strongly enough that mere access to a canonical field cannot authorize a new semantic decision or presentation and that material meaning must have an authorized producer→transformation→decision/consumer→presentation/mutation lifecycle.

## Evidence

### Order evidence

- `docs/governance/systems-governance.md` §2: P0-P8 is already an ordered authority pyramid and explicitly says higher layers constrain lower layers.
- The same owner §4: `GW-P1-DRY`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW`, `GW-P1-AUTHORITY-BEFORE-INFERENCE` and `GW-P1-DOC-CANONICALITY` already own the relevant first-principle territory.
- The same owner §§6-11: P3-P8 already carry layer-specific ownership and upward traceability obligations.
- `docs/requirements/lifecycle-context.md`: runtime context is explicitly an ephemeral projection over canonical authority, not a second source of truth; productive work is blocked when required authority cannot be resolved.
- `docs/contracts/canonical-contracts.md`: one canonical schema owns each semantic type and equivalent DTO/domain/persistence/UI copies are prohibited.
- `docs/architecture/technical-architecture.md`: FCIS/canonical ownership and explicit dependency direction are already material P4 constraints.
- `pontivus-order.toml [governance.fitness]`: canonical ownership and documentation canonicality already have architecture fitness, but the current architecture sensor does not by itself prove field-level semantic noninterference.

### Span comparative evidence

Span's binding `docs/requirements-pyramid.md` supplies a precise general discipline that is applicable without adopting Span's product/runtime machinery:

- each statement is placed by the kind of authority it owns;
- authority constrains downward while derivation proceeds from higher to lower layers;
- a contradiction is a defect;
- a restatement is also a defect because it creates a second source of truth;
- a lower-layer rule must be justifiable by the authority above it.

Span's Functional Pyramid runtime adds participation, contexts, graph carriers and MCP lifecycle behavior, but those are Span product mechanisms and are not required for Order's documentation/authority model.

## Governing authority

This change is governed primarily by:

- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` as the existing canonical pyramid/P1 owner;
- `GW-P1-DOC-CANONICALITY` for one-owner/no-restatement discipline;
- `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` for the semantic-lifecycle rule;
- `GW-DOC-LIFECYCLE-CONTEXT-V2` for authority projection and upstream-return behavior;
- `GW-DOC-SPECIFICATION-STANDARD-V2` and `GW-DOC-VALIDATION-STANDARD-V1` for complete, independently verifiable conformance;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V2` and `GW-DOC-CANONICAL-CONTRACTS-V2` for downstream architecture/contract consequences.

Span is not governing authority for Order.

## Affected producer→consumer path

The governance path under review is:

```text
canonical higher-layer proposition
    -> resolved authority reference
    -> lower-layer derived requirement/design/contract
    -> implementation projection/transformation
    -> decision or presentation consumer
    -> verification/conformance evidence
```

For semantic data, the corresponding meaning path is:

```text
canonical semantic fact
    -> canonical meaning/owner
    -> authorized producer
    -> authorized transformations/projections
    -> authorized lifecycle decision/consumer
    -> authorized presentation where applicable
    -> declared mutation/terminal owner
```

A typed carrier may legitimately contain several facts. That carrier boundary does not grant every consumer authority to use every field. Consumer authorization remains a semantic concern determined by the governing requirement/architecture, not by structural field availability.

## Downstream invariants

- Order's P0-P8 layer identities and responsibilities remain unchanged.
- Existing `GW-P1-*` stable identities remain canonical; no duplicate principle is created when an existing one owns the concern.
- `pontivus-order.toml [refs]` remains Order's authority resolver.
- Runtime lifecycle/context, approval, execution and validation semantics are unchanged by this governance exercise unless a separately recorded conformance finding proves a defect at one of those owners.
- D7 remains true: Order has no direct Span integration in v1.
- WorkItem/campaign tracking material records status/evidence only and never becomes a second permanent governance specification.
- Current implementation and tests remain evidence below authority.

## Unresolved facts

The repository-wide conformance result is not yet known. The audit must still determine:

- whether any P1-P6 canonical document contains a material proposition at the wrong layer or restates another owner;
- which semantic producer→consumer paths lack explicit lifecycle ownership or allow unauthorized field influence;
- which existing architecture/certification tests are sufficient and which require negative/noninterference proof;
- whether any discovered violation is already owned by an in-flight governed correction such as PR #83 versus requiring a separate remediation.

Those are audit outputs, not facts to infer in advance.

## Verdict

**CONFIRMED.**

Order is already structurally a functional pyramid, but the canonical pyramid owner should be strengthened with proposition-placement/derivation law and semantic-lifecycle closure. A repository-wide conformance audit is warranted because existing structural/type ownership checks do not prove that every consumer is semantically invariant to fields outside its authorized meaning.
