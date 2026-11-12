# 05 — Specification standard

**Status:** Binding design standard
**Canonical concern ID:** `GW-DOC-SPECIFICATION-STANDARD`  
**Versioned concern ID:** `GW-DOC-SPECIFICATION-STANDARD-V1`  

## 1. Purpose

Order may execute only work whose meaning is already closed.

The specification package is the authoritative pre-execution description of the applicable [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](10-systems-governance-pyramid.md) for one work item:

- what is true;
- which P1 principles/defaults/overrides govern;
- which P2 user/product intent is being served;
- which P3 functional outcome is required;
- which P4 technical requirements/architecture constrain it;
- what design has been selected;
- exactly what implementation work is authorized;
- how success will be proven;
- which project governance constrains the work.

The standard applies to the complete approved package. Stage-specific agent context is resolved under [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md); documents do not duplicate the full pyramid merely to make context available downstream. It does **not** require every project to duplicate this information into one Order-owned file. Existing repository investigations, ADRs, requirements, design reports, plans, and contracts may satisfy the package when they are explicitly referenced and frozen by approval.

## 2. Mandatory package sections

A package cannot reach `READY_FOR_SIGNOFF` unless the following information is present and internally consistent.

### S1 — Identity and state

Required:

- work-item id;
- target repository;
- concise title;
- lifecycle state;
- package revision;
- artifact references;
- authoring/review provenance;
- for source-backed work, the exact current originating WorkItem source identity/snapshot required by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`.

### S2 — Proven problem or requested outcome

The package states the concrete observation or requested capability.

For defect/remediation work it must distinguish:

- observed symptom;
- proven upstream/root cause;
- affected execution path;
- downstream effects.

For new capability work it must state the current absence and required outcome.

Vague goals such as "improve", "clean up", "modernize", or "make robust" are not executable specifications without concrete required behavior.

### S3 — Research facts

Research facts are evidence-backed and identify their authority/evidence source.

Facts must distinguish:

- proven fact;
- design decision;
- unresolved question.

Unresolved questions cannot be silently promoted into assumptions.

### S4 — Pyramid requirements

Each material requirement has a stable identifier and is classified at the appropriate pyramid layer. Product/user intent is P2, observable functional behavior is P3, and technical/non-functional constraints are P4.

Each requirement includes, where applicable:

- acceptance criterion;
- failure behavior;
- compatibility/security/performance constraint;
- explicit negative behavior: what must not happen.

Requirements must not encode an implementation choice unless that choice itself is binding authority.

### S5 — Scope and exclusions

The package explicitly defines:

- authorized behavior/surface;
- out-of-scope behavior;
- known adjacent concerns not authorized for this package.

"While here" work is never implicit scope.

### S6 — Resolved governance set

The package identifies the resolved P1-P6 authority that constrains implementation, including inherited Order defaults, explicit project extensions/overrides, and project-owned artifacts such as:

- repository instructions;
- ADRs;
- architecture standards;
- canonical contracts;
- canonical state/type owners;
- security rules;
- testing/execution rules;
- project-specific implementation constraints.

Any contradiction in the governing set must be resolved before sign-off.

Under `GW-P1-DOC-CANONICALITY`, the package identifies governed concerns by their canonical stable identifier, and by the version-specific identifier when that exact semantic version/snapshot matters. The package may include the local requirement/acceptance consequence it owns, but it must not become a second normative copy of the referenced concern.

### S7 — Design

The design identifies:

- canonical owner;
- affected boundaries;
- module/boundary responsibility ownership for every changed production surface, including any required same-layer decomposition;
- data/control flow;
- existing capability to reuse;
- behavior to remove or replace;
- genuinely necessary new concepts;
- downstream invariants;
- failure semantics;
- rejected material alternatives and why they were rejected.

The design must not delegate a material architecture decision to the implementation worker.

### S8 — Implementation plan

The plan contains explicit task units in dependency order. When one signed task contains ordered internal implementation steps, the plan also identifies the architecture-feedback checkpoints required before moving from one architecture-affecting step to the next. These checkpoints reuse the authoritative project fitness gates; they are implementation feedback, not new lifecycle stages and not substitutes for final V3/V5/V7 evidence.

Every task must identify:

- task id;
- objective;
- requirement/design traceability;
- expected production surface;
- module ownership/decomposition constraints; a minimal same-layer physical split required to preserve an already-approved responsibility/effect boundary is an architecture-preserving implementation necessity and does not require a separate plan task, while any split that creates or changes semantic ownership, public contracts, state semantics, effect boundaries, dependency direction, or authorized behavior is a stop condition for the owning DESIGN/PLAN authority;
- expected test/validation surface;
- required deletions/replacements;
- dependencies;
- completion evidence.

The plan must contain no task whose purpose cannot be traced to an approved requirement, architecture-preserving necessity, or removal of conflicting behavior.

### S9 — Minimum-change forecast

Before sign-off, the package records the expected semantic change surface:

- production files/modules/symbols expected to change, including any required split/merge of current modules;
- tests/gates expected to change or be added;
- documentation/contracts expected to change;
- whether new state, schema, dependency, configuration, migration, abstraction, or public API is expected.

This is a **forecast, not a numeric LOC cap**.

If implementation proves the required surface materially larger or semantically architecturally different, execution stops rather than silently expanding scope. A fixed file list must never force a module to absorb a second architectural responsibility. A minimal same-layer physical decomposition required solely to preserve an already-binding ownership/effect boundary is permitted implementation-surface variance when it preserves canonical semantics, public contracts, state meaning, dependency direction and authorized behavior; the final evidence must record the actual changed files and the architecture fitness sensor must cover any new production module. If the required decomposition changes any of those semantic architecture properties, the package returns to DESIGN/PLAN.

### S10 — Verification contract

The package identifies the exact logical verification gates required to prove:

1. the requested behavior now holds;
2. prior required behavior still holds;
3. architecture/governance constraints still hold, including mechanical fitness gates and explicit semantic review of module cohesion/decomposition;
4. the diff contains no unauthorized change;
5. the implementation is minimum-sufficient rather than bloated.

The target project remains authoritative for how those logical gates execute.

### S11 — Open-question ledger

At readiness review:

- unresolved implementation-blocking questions = zero;
- unresolved architecture questions = zero;
- unresolved authority conflicts = zero.

A non-blocking observation may remain recorded, but it cannot be silently delegated to the implementation worker.

### S12 — Readiness verdict

R3 records:

- `READY_FOR_SIGNOFF`; or
- the exact stage to which the package must return.

The readiness record must identify the evidence used to reach the verdict.

## 3. Traceability law

The required trace follows the pyramid:

```text
P1 principles/defaults/overrides
              ↓
P2 user/product intent
              ↓
P3 functional requirements
              ↓
P4 technical requirements/architecture
              ↓
P5 ADRs where applicable
              ↓
P6 canonical contracts/specification
              ↓
P7 plan task / execution task
              ↓
P8 implementation + verification evidence
```

Every executable task must trace upward.

Every approved requirement must trace downward to implementation or be explicitly identified as requiring no code change.

## 4. Specification validation

Before R3 may return `READY_FOR_SIGNOFF`, Order validates mechanically where possible:

- all mandatory sections exist;
- required identifiers are unique;
- all plan tasks trace to requirements/design;
- all requirements have coverage;
- all dependencies resolve;
- all referenced artifacts exist;
- all blocking questions are closed;
- required governance references are present;
- the verification contract is non-empty for code-changing work;
- the minimum-change forecast is present.

Semantic correctness is then reviewed independently in R3. Earlier lifecycle stages are also promoted only after their own stage-specific conformance gates pass; R3 is the final package-level adversarial check, not the first time pyramid compliance is evaluated.

## 5. Change after sign-off

A material change to:

- requirements;
- design;
- plan tasks;
- governance set;
- acceptance criteria;
- verification requirements;
- minimum-change forecast where it changes implementation meaning;

invalidates approval.

Order never treats a materially modified specification package as still authorized merely because the work-item id is unchanged.
