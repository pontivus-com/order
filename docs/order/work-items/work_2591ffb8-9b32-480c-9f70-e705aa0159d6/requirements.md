<!-- Order template: change-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

# Functional-pyramid conformance requirements

## P2 intent and R1 factual basis

The requested outcome is to make Order's already-existing P0-P8 authority pyramid formally complete under a functional-pyramid discipline and to prove repository conformance without introducing a Span runtime dependency or a parallel governance model.

R1 confirmed that Order already has the material structure: layer ownership, canonical-document ownership, upward task traceability, authority-before-inference, canonical typed contracts and architecture fitness. The missing work is a bounded governance clarification plus systematic conformance proof.

## Functional authority disposition ledger

| Requirement | Disposition | Canonical owner |
|---|---|---|
| Normative propositions have one owning pyramid layer and lower layers derive from, rather than become, higher authority. | LOCAL |  |
| Lower-layer documentation references the canonical concern and owns only its local consequence. | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1 |
| A semantic fact has one canonical meaning/owner and an expressly authorized lifecycle of production, transformation, decision use, consumption, presentation and mutation; structural field availability alone does not authorize semantic use. | LOCAL |  |
| Runtime context remains a minimum sufficient projection over canonical authority and unresolved higher authority returns upstream. | REFERENCE | GW-DOC-LIFECYCLE-CONTEXT-V2 |
| Equivalent semantic copies remain prohibited and canonical semantic ownership is preserved through project governance integration. | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1 |
| The conformance exercise has one WorkItem-local current-state register and routes findings to their actual owner without silently repairing them in the audit. | LOCAL |  |
| Mechanically checkable semantic-boundary propositions receive proportionate positive and negative/noninterference proof without creating a second specification in tests. | REFERENCE | GW-DOC-VALIDATION-STANDARD-V1 |
| Span MCP runtime integration, Functional Pyramid participation/configuration and Span-specific governance carriers remain out of scope. | LOCAL |  |

## Required observable outcome/delta

1. `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` explicitly states the proposition-level placement/derivation discipline for Order's P0-P8 model.
2. The existing P1 canonical-ownership/explicit-flow concern explicitly covers semantic lifecycle closure and noninterference: a consumer may use meaning only where its governing contract authorizes it.
3. One WorkItem-local conformance register is the sole current-state tracker for this exercise.
4. The P1-P6 canonical corpus is audited for misplaced authority, normative restatement, missing upstream justification, duplicate ownership and unresolved canonical owners.
5. Material semantic flows are audited for producer→meaning→transformation→consumer/presentation/mutation closure.
6. Each confirmed defect is assigned to the exact owning layer/document/surface; no audit finding is "fixed" at a lower layer merely because that location observes the symptom.
7. Mechanically checkable invariants receive permanent proof, including negative/noninterference proof where unauthorized semantic influence is the relevant failure mode.
8. Final closure demonstrates bottom-up P8→P1 conformance for every finding resolved inside this WorkItem and names separately governed remediation for findings outside its authorized surface.

## Acceptance criteria

- The canonical pyramid still has exactly Order P0-P8; no Span layer vocabulary becomes Order authority.
- The permanent governance owner contains an unambiguous placement test covering P0 through P8.
- The permanent governance owner distinguishes authority from derivation/evidence and states that lower-layer success cannot manufacture higher-layer meaning.
- No new P1 default-rule identity is introduced when `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` already own the semantic-lifecycle concern.
- The semantic-lifecycle rule expressly covers authorized producer, transformation/projection, decision/consumer, presentation where applicable, and mutation/terminal ownership.
- The rule expressly states that possession/access to a canonical typed field is insufficient authorization for semantic use.
- The conformance register records each audit stream and finding with stable identity, status, evidence, canonical owner/layer, required disposition and proof/closure.
- The register never copies normative rule text as a replacement authority.
- Every canonical-document audit finding has exact source evidence and an owner disposition.
- Every semantic-lifecycle finding names both the canonical fact/meaning and the unauthorized or unresolved consumer/use boundary.
- A mechanically enforceable finding is not closed solely by prose; its required fitness/regression proof is recorded.
- No `.span/**`, Span dependency, MCP configuration, participation state or runtime integration is introduced.
- D7 remains unchanged.
- Any material defect outside the signed/approved remediation surface is recorded and returned to the appropriate governed WorkItem/plan rather than mutated opportunistically.
- The open PR #83 overlap is revalidated against its eventual merged bytes before this exercise claims final closure.


## Post-audit disposition requirements

C02/C03 was initially executed against the independent `master` baseline while PR #83 was concurrently advancing the 0.6.0 authority/context foundation. Exact-head revalidation against PR #83 `5f56cfa72150e4b7d62ae9d1f402471209404404` establishes that FP-F06/FP-F07 are **stale-baseline findings, not new remediation requirements**.

The current 0.6.0 authority model already satisfies the functional-pyramid requirement by separating two existing concepts:

| Required proposition | Disposition | Canonical owner |
|---|---|---|
| The full project authority graph remains exactly reachable, including retained semantic versions needed by historical schema pins and reference-fact owners. | REFERENCE / NO CHANGE | `GW-DOC-CANONICAL-CONTRACTS-V2`, `GW-DOC-LIFECYCLE-CONTEXT-V2` |
| Productive stage context contains only the minimum-sufficient applicable subset selected by pinned schema/template authority, explicit upstream refs, resolved P1 rules and applicable concern authority. Reachability alone does not imply materiality. | REFERENCE / NO CHANGE | `GW-DOC-LIFECYCLE-CONTEXT-V2`, PR #83 G-F13/C22-F02 realization |
| Current-v2 context excludes unrelated retained-v1 authority while historical v1 schemas can still materialize their exact pinned version. | REFERENCE / NO CHANGE | `GW-DOC-LIFECYCLE-CONTEXT-V2` |
| Prior-art/factual reference owners may remain reachable without becoming ordinary productive context unless an authorized applicability path selects them. | REFERENCE / NO CHANGE | `GW-DOC-LIFECYCLE-CONTEXT-V2` |
| P7 task refs do not manufacture P1-P6 meaning: PLAN may reference only already-governed upstream authority and may not decide new product/architecture/contract scope. | REFERENCE / NO CHANGE | `GW-DOC-LIFECYCLE-CONTEXT-V2`, `GW-DOC-SPECIFICATION-STANDARD-V2` |
| P2/P5 documents must not restate or contradict exact P3 lifecycle/account-management semantics. | DELTA | `GW-P1-DOC-CANONICALITY`, `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-INSTALLATION-READINESS-V1` |
| The separate 0.6.0 campaign remains the implementation owner for overlapping Workbench reconstruction. This WorkItem must not create a competing UI implementation. | LOCAL |  |

Additional acceptance:

- do **not** remove retained semantic-version or reference-fact sources from the reachable authority graph merely to keep them out of productive prompts;
- do **not** weaken the architecture fitness rule that exact `refs` sources are selected by the reachable P1-P6 graph;
- do **not** replace PR #83's `applicableAuthorityPaths(...)` / material projection with a second reference registry or a blanket "active authority only" model;
- preserve the existing current-v2 versus historical-v1 pinned-authority tests;
- preserve the current negative proof that unrelated selected sources are absent from productive stage material;
- FP-F06/FP-F07 close by exact-current-candidate revalidation, not by new source/manifest/P6 mutation on PR #84;
- FP-F08-F10 and the IA33 terminal part of FP-F11 remain dependencies on the exact PR #83 candidate; the remaining shared-event FP-F11 path remains routed to post-signoff IA30.

## Scope/exclusions

In scope:

- Order's permanent pyramid/P1 governance owner;
- the WorkItem-local conformance register and lifecycle package;
- audit of current P1-P6 canonical documents;
- audit of material semantic producer/consumer paths across core, daemon, shell and UI;
- architecture/certification/test fitness needed to prove confirmed conformance propositions;
- minimal owner-level corrections that are explicitly designed and authorized by this WorkItem.

Excluded:

- Span installation/configuration/runtime integration;
- renumbering/replacing Order's P0-P8 pyramid;
- general product redesign;
- preserving current implementation as desired authority;
- opportunistic cleanup/refactoring;
- automatic expansion into unrelated 0.6.0 campaign work;
- remediation of a newly discovered material defect before its owner/scope is governed.

## Failure/negative behavior

The exercise fails conformance if it:

- creates a second normative specification of an existing concern;
- copies Span rule prose into a parallel Order authority instead of expressing the Order-owned principle at its existing owner;
- allows lower-layer code/tests/current behavior to define a higher-layer baseline;
- closes a semantic-lifecycle finding only because raw technical data is available to the consumer;
- treats a passing test as proof when the test encodes the wrong authority;
- changes an unrelated production surface to absorb a defect;
- weakens an existing fitness/safety/typing check;
- reports COMPLETE while unresolved findings or branch-overlap revalidation obligations remain.

## Material compatibility/security/performance constraints

This is primarily governance and conformance work. It must preserve:

- FCIS and data-oriented architecture;
- strict typing and no-DTO posture;
- one canonical semantic owner and mutation path;
- current public/runtime contracts unless a separately governed defect requires change;
- no new runtime dependency, process, persistence state or network surface;
- existing public-repository PR/release governance.

## Open product/authority questions

NONE. The unresolved items are conformance findings to be established by the audit, not missing product decisions.
