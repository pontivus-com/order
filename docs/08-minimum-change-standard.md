# 08 — Minimum-change and anti-bloat standard

**Status:** Binding design standard
**Canonical concern ID:** `GW-DOC-MINIMUM-CHANGE`  
**Versioned concern ID:** `GW-DOC-MINIMUM-CHANGE-V1`  

## 1. Core rule

Order requires the **minimum sufficient change**.

That means:

> Implement the least new or modified production surface that completely satisfies the approved requirements and all binding architecture/governance constraints.

This is not a "fewest lines of code" contest.

A smaller diff that violates architecture, hides complexity, weakens typing, skips required behavior, or makes the system harder to verify is not acceptable.

Conversely, a larger diff is not justified merely because it is cleaner, more general, or potentially useful later.

## 2. Preferred implementation order

Before introducing new structure, use this decision order:

1. no code change if the required outcome is already satisfied;
2. reuse existing correct capability;
3. correct the existing canonical owner;
4. remove conflicting/obsolete behavior;
5. minimally extend the canonical owner; if that physical module would otherwise acquire a second present responsibility/effect boundary, perform the smallest same-layer decomposition required to preserve the existing architecture before extending it;
6. create a new semantic concept only when the approved design proves one is necessary.

The burden of proof rises as the list progresses.

## 3. Change justification law

Every changed production file/module/symbol must trace to one of:

- an approved plan task;
- a binding architecture-preserving necessity caused by that task;
- deletion of conflicting behavior made obsolete by that task.

Every new abstraction, dependency, state field, schema, configuration surface, background process, compatibility path, fallback, adapter, or public API requires explicit design justification.

If justification does not exist in the approved package, implementation stops.

A minimal same-layer physical split that only preserves an already-binding responsibility/effect boundary is covered by the architecture-preserving-necessity rule above; it does not need separate product/design justification. The split must not introduce a new semantic owner, public contract, state meaning, effect boundary, dependency direction, dependency, or behavior.

## 4. Prohibited bloat patterns

Unless explicitly required by the approved design, the implementation must not add:

- speculative future-proofing;
- generalized frameworks for one concrete use case;
- parallel semantic representations;
- duplicate state owners;
- compatibility shims for unsupported historical behavior;
- silent fallbacks;
- generic adapters that merely translate between duplicate shapes;
- new configuration for behavior that can remain deterministic;
- new dependencies for trivial capability already available;
- defensive layers with no proven failure mode;
- opportunistic refactors;
- unrelated cleanup;
- documentation churn unrelated to the changed contract;
- tests that merely duplicate existing coverage without increasing proof.

Project-specific architecture may prohibit additional patterns.

A required same-layer decomposition that prevents an existing module from becoming a catch-all is not an opportunistic refactor. Its surface must be limited to moving the affected responsibility, rewiring imports, and updating the architecture/test evidence needed to preserve the existing contract.

## 5. Minimum code does not mean insufficient code

The minimum-sufficient rule requires enough implementation to satisfy the full lifecycle of any new state or behavior.

If a legitimate new state is introduced, all required producers, persistence/materialization, validation, consumers, terminal/routing behavior, and tests must be updated.

Partial implementation is not "minimal"; it is incomplete.

## 6. Change-surface forecast

The approved specification contains a semantic forecast, not a hard LOC budget.

It identifies whether the task expects changes to:

- production modules;
- tests;
- contracts/docs;
- state/schema;
- dependencies;
- configuration;
- migrations;
- public interfaces.

During execution, Order compares actual surface with forecast.

A small incidental variance may be explainable within the same approved design.

A material new category of change is a stop condition.

Examples:

```text
forecast: existing function + focused test
actual:   new service + new state + config
=> BLOCK / return to design

forecast: canonical model extension + 3 consumers
actual:   canonical model extension + 4th proven consumer
=> may remain within design if the omitted consumer is required by the same invariant
```

The distinction is architectural meaning, not a magic file-count threshold.

## 7. New-abstraction test

Before adding an abstraction, the builder and reviewer must be able to answer:

1. What approved requirement cannot be satisfied cleanly using the current canonical owner/capability?
2. Why is correcting or extending the existing owner insufficient?
3. What single semantic responsibility does the new abstraction own?
4. Does it create a second source of truth?
5. Does it require a mapper/bridge only because duplicate representations now exist?
6. Is the abstraction required now, rather than merely likely to be useful later?

Failure to answer these questions blocks the abstraction.

## 8. Diff reduction review

The independent reviewer explicitly examines whether the candidate can be reduced without losing:

- required behavior;
- architecture compliance;
- type safety;
- clarity at the canonical ownership boundary;
- required validation.

If yes, `CHANGE_BLOAT` is returned with the removable surface identified.

One targeted reduction pass may be allowed when reduction is mechanically/local architecturally obvious. Otherwise the task returns for design review.

## 9. Test and documentation proportionality

Tests and documentation are also subject to minimum-sufficient change.

Required tests prove the changed behavior and protect relevant existing behavior.

Required documentation changes update authoritative contracts whose meaning changed.

Order does not reward test count, comment count, documentation volume, or generated summaries.

## 10. Metric prohibition

Order must not use raw:

- lines added;
- lines deleted;
- file count;
- test count;
- token count;

as a standalone quality target.

These are observational metrics only.

The enforceable question is whether every changed surface is necessary and every required surface is present.
