# 09 — Project governance integration

**Status:** Binding design standard
**Canonical concern ID:** `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION`  
**Versioned concern ID:** `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`  

## 1. Principle

Order supplies the governance structure and default rules. The adopting project supplies its product intent, functional requirements, project-specific technical authority, decisions, contracts, and implementation constraints.

Those authorities are resolved through [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](10-systems-governance-pyramid.md).

A project does not need to replace its existing documentation hierarchy. It maps existing authoritative artifacts into the appropriate pyramid layers.

When `GW-P1-DOC-CANONICALITY` is inherited, each governed project concern has one canonical document owner and project-owned stable/versioned concern identifiers in `refs`; Order context, plans and downstream documents reference those identifiers rather than copying the concern's normative semantics. Existing project identifier conventions may be used when they satisfy the uniqueness/version law.

Where the project is silent and Order defines a default, the Order default applies.

Where the project explicitly supplies a valid project rule at a defaultable layer, that rule replaces or extends the default.

Order never invents missing user/product behavior.

## 2. Governance kernel versus project-customizable defaults

Two categories must not be confused.

### Order governance kernel

P0 lifecycle-integrity rules are part of using Order itself and are not project architecture preferences.

Examples include:

- explicit authorization before execution;
- traceability;
- no agent scope self-expansion;
- independent validation;
- bounded remediation;
- evidence before completion.

### Inheritable project defaults

Order provides defaults for project engineering governance at P1 and for the structure/quality of downstream artifacts.

The defaultable engineering constitution is the `GW-P1-*` rule set owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`; this document does not restate those rule semantics.

A project may explicitly replace or extend defaultable rules through the pyramid override mechanism defined by that owner.

## 3. Project governance inputs

An integration resolves the applicable project material for P1-P8, including as applicable:

- product/system principles;
- user/product intent;
- functional requirements;
- technical/non-functional requirements;
- project architecture;
- repository instruction entrypoints such as `AGENTS.md`;
- ADRs/architecture decisions;
- canonical contracts/specifications;
- canonical state/type ownership rules;
- security and operational constraints;
- test/verification rules;
- generated-file rules;
- environment constraints;
- prohibited operations;
- implementation plans.

The project remains authoritative for the project-specific content it explicitly owns.

Order remains authoritative for its P0 kernel and inherited defaults where no project override exists.

## 4. Resolved authority ordering

The default authority order is the systems pyramid:

```text
P0 Order governance kernel
P1 system/project first principles
P2 user/product intent
P3 functional requirements
P4 technical requirements + project architecture
P5 ADRs
P6 canonical contracts + specifications
P7 implementation plans + execution tasks
P8 implementation + evidence
```

Within a layer, a project may define precedence between its own artifacts.

A lower layer cannot override a higher layer merely by contradiction.

When two applicable project authorities at the same layer conflict and project precedence does not resolve the conflict:

```text
CONTRADICTORY_AUTHORITY
        |
        v
      BLOCKED
```

The implementation worker is not asked to choose which authority "seems right."

## 5. Defaults, extensions and overrides

Order resolves each defaultable rule as follows:

1. apply the explicit project rule if a valid override exists;
2. otherwise retain the Order default;
3. apply compatible project extensions in addition to the resolved rule;
4. never infer an override from contradictory implementation.

An explicit override records:

- layer;
- inherited default;
- replacement;
- rationale;
- scope;
- consequences;
- required validation.

If the override changes architectural meaning for already approved work, approval becomes stale.

## 6. Governance snapshot at sign-off

The approved package records the exact resolved authority material to implementation:

- applicable P1 principles/defaults/overrides;
- P2/P3 required outcome;
- P4 technical architecture/requirements;
- applicable P5 ADRs;
- P6 contracts/specification;
- P7 plan/task definitions.

Material artifacts are content-hashed or revision-pinned according to the artifact identity policy.

At preflight, a material authority change causes `APPROVAL_STALE` unless the resolved policy proves the change immaterial to the approved work.

## 7. Architecture compliance

R1, R2, Design, Plan, R3, and execution validation have distinct responsibilities:

- **R1:** resolve applicable pyramid authority and current execution path;
- **R2:** establish P3 functional requirements from explicit P2/P1 authority and validated R1 facts without inventing missing product intent;
- **Design:** choose a solution that conforms to P1-P6;
- **Plan:** enumerate the P7 repository transition and validation;
- **R3:** prove the authority chain is closed and no material interpretation remains for implementation;
- **Execution validation:** prove the actual P8 candidate conforms to the resolved P1-P7 authority.

Architecture review is therefore not deferred until after code exists.

## 8. Project verification authority

The approved execution task identifies logical gates.

The project integration resolves those gates to exact authoritative commands/environment.

Example:

```text
task requires: backend-focused-regression
project resolves: exact cluster/container command
Order executes: exact resolved command
```

Order may not substitute a local or cheaper command when the project requires a different environment.

Repository-owned scripts/configuration/lockfiles that materially define a verification binding are included as material references in the project integration and therefore participate in approval freshness.

## 9. Fitness functions and sensors

Where a resolved governance rule is mechanically testable, the project integration identifies the authoritative sensor. In v1, inherited/default P1 rules bind those sensors through `pontivus-order.toml [governance.fitness]`; override/extension `gates` are additive. A sensor proves only its mechanically checkable propositions and never removes required semantic review.

Examples:

- architecture dependency test;
- forbidden-import scan;
- strict type check;
- pure-core side-effect check;
- contract/schema validation;
- generated-file mutation check.

Order executes required sensors during validation.

Where no mechanical sensor can establish compliance, R3 and the independent execution reviewer explicitly evaluate the rule.

## 10. Governance failure behavior

A candidate that passes behavior tests but violates a higher pyramid layer fails.

A candidate that follows an outdated plan but conflicts with current signed higher authority fails.

A candidate requiring a new P1-P6 decision is not repaired autonomously; it returns to the appropriate upstream stage.

## 11. Minimal project integration

Order should require the smallest integration needed to resolve:

- pyramid authority;
- default overrides/extensions;
- verification authority;
- workspace/execution policy.

It must not require a project to duplicate authoritative content into a Order-specific document.

The project integration is an authority map, not a second architecture repository.

v1 materializes this integration as project-root `pontivus-order.toml`. Its integration role is defined here and in [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md); its exact P6 grammar is owned by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md). It stores authority source patterns, explicit same-layer precedence, override/extension references, direct P1 fitness-gate bindings and verification bindings only; it must not duplicate project semantic authority.

Order uses that map as an input to [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md), which selects the applicable authority for each lifecycle stage without copying project semantics into Order-owned duplicates.

The same manifest may define project concern ids, deterministic path/surface mappings, concern-specific authority references, and concern-required logical validation gates. Concern ids are applicability metadata only; they do not create new lifecycle states or semantic owners.

## 12. Reference integration boundary

Reference projects classify their existing repository rules, ADRs, canonical contracts, architecture rules and verification environment into the governance pyramid rather than copying them into Order.

A project may therefore use Order defaults where it is silent and preserve stricter project-specific rules where they already exist. No consumer repository becomes Order authority merely by serving as an integration example.
