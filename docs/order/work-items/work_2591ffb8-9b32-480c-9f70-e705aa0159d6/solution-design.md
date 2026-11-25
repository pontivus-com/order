<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Functional-pyramid conformance solution design

## Requirement-to-solution map

| Requirement | Design disposition |
|---|---|
| Proposition placement and derivation are explicit. | Add one P0-owned placement/authority/derivation law to `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`; do not create another pyramid document. |
| No-restatement remains canonical. | Reuse `GW-P1-DOC-CANONICALITY`; the new P0 law references the existing one-owner consequence rather than creating a second documentation policy. |
| Semantic lifecycle closure/noninterference is explicit. | Strengthen the existing `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` meanings and add one joint explanatory subsection at their existing canonical owner. |
| Exercise state is trackable. | Add one WorkItem-local `conformance-register.md` that owns only current audit/task/finding status. |
| Corpus and semantic flows are audited. | Use closed audit streams C01-C06 with evidence/owner/disposition fields. |
| Defects are repaired at their owner. | The audit records findings; a finding may mutate only the canonical owner authorized by the then-current plan. Unknown production remediation is never implied by audit scope. |
| Mechanical proof covers semantic leakage. | For a confirmed mechanically checkable boundary, require both authorized-presence proof and unauthorized-influence/noninterference proof. Tests must reference canonical authority and must not become a second semantic specification. |
| No Span runtime integration. | Keep D7 unchanged and add no dependency/configuration/runtime carrier. |

## Canonical owner/affected boundaries

### Permanent authority

`GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` remains the sole permanent owner of:

- Order's P0-P8 pyramid;
- pyramid authority/placement/derivation discipline;
- the default P1 engineering constitution.

No new permanent document is created.

The semantic-lifecycle rule is not assigned a new P1 identity. It is a clarification of the already-existing semantic ownership and flow concerns:

- `GW-P1-CANONICAL-OWNERSHIP`;
- `GW-P1-EXPLICIT-FLOW`;
- with `GW-P1-DRY` and `GW-P1-DOC-CANONICALITY` remaining applicable consequences.

### Change-specific state

`docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/conformance-register.md` is the sole current-state owner for this conformance exercise.

It may contain:

- audit-stream state;
- finding identities/status;
- exact evidence pointers;
- canonical owner/layer dispositions;
- required next action;
- verification/closure evidence;
- branch/revalidation dependencies.

It may not define permanent product, governance, architecture, contract or implementation semantics.

### Downstream owners

Existing P3/P4/P5/P6 owners are changed only if the audit proves a defect in the concern they already own. No blanket propagation or restatement is performed.

## Existing capability/reuse, behavior to replace, and necessary new concepts

### Reuse

The design reuses:

- Order's P0-P8 taxonomy;
- `GW-P1-DOC-CANONICALITY`;
- `GW-P1-DRY`;
- `GW-P1-CANONICAL-OWNERSHIP`;
- `GW-P1-EXPLICIT-FLOW`;
- `GW-P1-AUTHORITY-BEFORE-INFERENCE`;
- `pontivus-order.toml [refs]`;
- current lifecycle-context authority resolution;
- existing P4 dependency/ownership fitness;
- canonical P6 semantic carriers and no-DTO posture.

### Behavior to replace

The design replaces only ambiguity in the current governance wording:

1. the pyramid currently lists layers and several traceability consequences but lacks one proposition-level placement/derivation law; and
2. canonical ownership/explicit flow currently do not expressly prohibit a consumer from assigning new semantic meaning merely because a canonical carrier exposes the field.

No existing correct authority is superseded.

### Necessary new concept

No new domain/runtime concept is required.

The only new change-specific concept is the **conformance finding record** in the WorkItem-local register. It is audit bookkeeping, not product state.

## Technical requirements/architecture

### A. P0 proposition placement, authority and derivation law

The permanent pyramid owner must define a placement test over Order's existing layers:

- P0 — governance/integrity rule for how governed work operates;
- P1 — stable system/project principle that must hold independent of a particular feature realization;
- P2 — user/product intent, problem, outcome or product constraint;
- P3 — observable functional behavior, acceptance/failure/negative behavior;
- P4 — technical/non-functional constraint or project architecture boundary;
- P5 — consequential architecture/technology decision made under P1-P4;
- P6 — exact canonical semantic/transport/persistence/protocol/change specification;
- P7 — exact repository transition/task/validation plan;
- P8 — realization and verification evidence.

The law must distinguish:

```text
higher authority
    -> constrains
lower derivation/realization

lower evidence
    -> may reveal a defect upstream
    -> never silently establishes/replaces upstream meaning
```

A lower-layer proposition must have sufficient upward justification. If that justification is missing or contradictory, work returns to the owning higher layer.

A lower layer references an already-owned rule and states only the consequence it owns. Repeating normative meaning does not strengthen authority.

### B. P1 semantic lifecycle closure

The existing canonical-ownership and explicit-flow rules are clarified so that a material semantic fact has:

```text
canonical fact / meaning owner
    -> authorized producer
    -> authorized transformation/projection
    -> authorized lifecycle decision / consumer
    -> authorized presentation location, when presented
    -> declared mutation / terminal owner
```

Not every fact requires UI presentation or every stage above; the invariant is that each material use that does exist has an expressly authorized owner/location.

A canonical carrier may contain facts serving several concerns. Possession of that carrier, importability of its type, or technical access to a field does not grant semantic authority to:

- make a decision from that field;
- transform it into another product meaning;
- display it on an unrelated surface;
- mutate it;
- persist a duplicate semantic copy.

A consumer-specific projection is permitted only when it is a derived view of authorized canonical meaning and does not become another semantic owner.

### C. Noninterference proof

Where a boundary is susceptible to semantic leakage and can be mechanically tested, conformance requires:

1. **positive proof** — authorized meaning affects the intended consumer/result; and
2. **negative/noninterference proof** — varying an unauthorized fact while authorized facts remain equal does not change that consumer's semantic result.

Example shape:

```text
consumer projection may depend on: A, B, C
hold A/B/C constant
vary D/E/F that belong to other semantic owners
consumer semantic output remains invariant
```

The canonical authority remains the source of the allowed set. A test must not invent or maintain a parallel normative field list when an existing design/contract owner can be referenced or mechanically derived.

### D. Conformance audit streams

The exercise uses exactly these streams:

- **C01 — pyramid principle completion**: permanent P0/P1 wording and ownership.
- **C02 — canonical corpus placement/derivation audit**: P1-P6 authority owners.
- **C03 — semantic lifecycle closure audit**: material state/meaning producer→consumer paths.
- **C04 — owner-level remediation disposition**: each confirmed finding assigned/fixed at its canonical owner or routed to a separate governed remediation.
- **C05 — permanent conformance proof**: architecture/certification/unit/browser proof for mechanically checkable findings.
- **C06 — bottom-up closure**: P8 evidence traced through applicable P7/P6/P5/P4/P3/P2/P1 authority with no open finding.

The register is the only current-state owner for C01-C06.

## Contracts/state/data-flow changes

No runtime data schema, HTTP contract, persistence schema, WorkItem state, event type, dependency or process is introduced by the governance foundation.

No new `DefaultRuleId` is introduced. This avoids creating a parallel P1 concept and avoids unnecessary P6/manifest mutation.

If C02/C03 later proves that an existing canonical contract lacks required semantic ownership information, that is a separate finding and must be returned to its P6 owner before a contract change is authorized.

## Decisions/rationale/rejected alternatives

### Decision D1 — preserve Order P0-P8

Order's richer P0-P8 model already separates intent, requirements, architecture, decisions, exact contracts, plan and evidence. Span's P0/P1/P2S/P2W/P3/P4 vocabulary is not imported.

**Rejected:** renumbering Order to match Span. It would create churn and lose useful distinctions without adding governance capability.

### Decision D2 — no Span installation or declaration files

Span runtime Functional Pyramid participation is outside the requested concern and conflicts with the explicit scope.

**Rejected:** `.span/functional-pyramid.json`, Span authority bindings, ACTIVE/VALID state, MCP lifecycle or runtime dependency.

### Decision D3 — strengthen existing P1 owners instead of creating a new rule ID

Semantic lifecycle closure is the combined operational meaning of canonical ownership plus explicit flow. Creating a new default rule would duplicate their semantic territory and require unnecessary P6/manifest changes.

**Rejected:** a new `GW-P1-SEMANTIC-LIFECYCLE-*` rule identity.

### Decision D4 — conformance register is state, not authority

The exercise needs durable current-state tracking, but permanent principles belong only at their canonical owners.

**Rejected:** a new permanent "functional pyramid standard" document beside `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`.

### Decision D5 — discovery does not grant remediation scope

A repository-wide audit cannot pre-authorize unknown production mutations.

**Rejected:** broad `src/**` or `ui/**` remediation permission. Material findings are either addressed by an exact later plan amendment or separately governed WorkItem.


## Post-audit disposition design

### R1 — Correct lower-layer documentation ownership

FP-F04 and FP-F05 are documentation-owner defects, not new behavior.

- `GW-DOC-SYSTEM-BRIEF-V1` keeps the P2 product intent that Order carries untrusted work through governed definition, explicit authorization where implementation is required, independent validation and a verified terminal result. Exact WorkItem stages and post-sign-off execution sequence remain at their P3/validation owners.
- `GW-DOC-TECHNICAL-DECISIONS-V1` D19 keeps the consequential saved-account/credential decision while conforming to `GW-FR-073`, `GW-FR-091` and `GW-FR-095`: the application shell exposes active-account identity/readiness and one Settings entry point; Settings owns listing and Add/Switch/Rename/Remove management.

No P2/P3/P5 semantic owner changes.

### R2 — Reuse the current reachable-authority / material-authority split

FP-F06/FP-F07 were raised from a stale `master` realization. Current PR #83 already contains the governed G-F13/C22-F02 correction and is the canonical implementation to preserve.

The existing design is:

```text
reachable authority graph
  = exact project P1-P6 source universe
  = stable + retained versioned identities + precedence/default/override/extension resolution
                         |
                         | stage/template/upstream-ref/P1-rule/concern applicability
                         v
material stage authority
  = minimum-sufficient subset for this stage/schema
  = only this subset is materialized into productive context/freshness
```

This directly realizes the semantic-lifecycle rule:

- **reachability is not semantic use**;
- a retained version can remain exactly reachable without influencing a current-v2 stage;
- an explicit historical schema pin can select the retained version when that version is the authorized meaning;
- concern authority and explicit upstream references can make an otherwise non-material reachable source applicable;
- the productive projection is derived from canonical authority and does not become another authority owner.

The current implementation owner is `src/daemon/authority.ts::applicableAuthorityPaths(...)` plus the existing project-authority projection functions. It is reused **without PR #84 mutation**.

Current permanent proof already establishes:

1. reachable same-layer authority and precedence exist before provider inference;
2. unrelated selected P2 sources are absent from R1 material context;
3. current `change-v2` materializes current lifecycle-context authority and excludes retained v1;
4. historical `change-v1` materializes the retained v1 lifecycle-context authority;
5. unresolved pinned template authority blocks before provider use;
6. architecture fitness keeps retained semantic versions reachable beside the current owner and keeps every exact ref source inside the reachable authority graph.

Therefore PR #84 must not:
- remove retained/reference-fact owners from `authority.p1-p6`;
- change P6 so refs can escape the reachable graph;
- add a second materiality rule in signed-task validation;
- alter the G-F13/C22-F02 tests merely to satisfy the stale baseline finding.

### R3 — Workbench semantic findings remain with the 0.6.0 owner

On audited PR #83 head `5f56cfa72150e4b7d62ae9d1f402471209404404`:

- FP-F08 is corrected with genuine noninterference proof: `mutationBlockers` remains Settings-owned and cannot affect shell account readiness;
- FP-F09 is corrected: ordinary Queue diagnostics use path + actionable human reason rather than raw `INVALID_SOURCE`;
- FP-F10 is corrected: ordinary account state/blocker presentation is humanized;
- the IA33 terminal-resource portion of FP-F11 is corrected through canonical role/product wording.

The remaining shared `STAGE_COMPLETED` outcome presentation path belongs to `workbench-presentation.ts` / productive-stage activity and therefore to post-signoff IA30. Current §17A authorization explicitly excludes IA30-IA34. This WorkItem records the dependency and does not mutate it.

### R4 — Permanent proof for the new P0/P1 principles

The new permanent rule is added at the existing systems-governance owner; no new P1 id or separate "functional pyramid" specification is created.

Mechanical proof should remain narrow:

- the canonical owner must continue to expose the stable `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW` and `GW-P1-DOC-CANONICALITY` ids;
- architecture fitness may prove the new proposition-placement and semantic-lifecycle sections remain at that owner and no sibling permanent document claims that ownership;
- product/architecture-specific allowed-field sets remain owned by their P3/P4/DESIGN contracts, not copied into a global test list;
- consumer-specific negative/noninterference tests are added at the consumer owner when a mechanically checkable leakage risk exists, as demonstrated by FP-F08.

## Compatibility/preservation

The design preserves:

- all current stable `GW-*` identifiers;
- P0-P8 layer meaning;
- P1 override/extension mechanics;
- project manifest authority resolution;
- runtime and lifecycle contracts;
- D7 no-direct-Span-integration decision;
- current public API/data schema;
- no-OOP/no-DTO/FCIS architecture;
- existing 0.6.0 campaign ownership and state.

PR #83's overlapping edit to `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` is not assumed to exist on this branch. Final conformance requires revalidation against the actual merge candidate after branch reconciliation.

## Failure behavior

- A missing/misplaced higher-layer proposition is returned to that layer; it is not synthesized in a lower document.
- A semantic consumer without express authority is a finding even if type-correct and operationally successful.
- An audit finding with unclear canonical ownership remains OPEN rather than being assigned heuristically.
- A finding whose remediation exceeds the current exact task surface is ROUTED, not opportunistically fixed.
- A branch overlap affecting an audited owner creates REVALIDATION_REQUIRED state until the exact candidate is re-audited.
- Tests that encode current behavior without canonical authority cannot close a finding.

## Validation obligations

The exercise must ultimately prove:

- no duplicate permanent pyramid owner was created;
- P0-P8 identities remain unchanged;
- the new P0 law is unambiguous and does not restate lower-layer product/architecture semantics;
- the P1 clarification remains within `GW-P1-CANONICAL-OWNERSHIP` + `GW-P1-EXPLICIT-FLOW`;
- the register is state-only and is the sole current-state owner for this exercise;
- every C02/C03 finding has evidence and exact owner disposition;
- every mechanically closed finding has proof appropriate to its failure mode;
- no Span runtime/config/dependency was introduced;
- final closure is re-established against the exact final branch head after any PR #83 reconciliation.
