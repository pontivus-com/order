# 06 — Validation standard

**Status:** Binding design standard
**Canonical concern ID:** `GW-DOC-VALIDATION-STANDARD`  
**Versioned concern ID:** `GW-DOC-VALIDATION-STANDARD-V1`  

## 1. Purpose

Validation is not one final test command and does not begin only after implementation.

Pre-execution lifecycle artifacts are continuously validated under [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md). This document defines the execution/candidate validation branches after sign-off.

Order validates the work package and the resulting change at multiple independent boundaries so that a coding agent cannot compensate for a weak specification, a scope breach, or an architecture violation by merely making tests green.

## 2. Validation branches

The execution path contains explicit validation branches.

```text
APPROVED TODO
    |
    v
V0 PACKAGE / APPROVAL VALIDATION
    | fail -> SPEC_INVALID / APPROVAL_STALE
    v
V1 REPOSITORY + GOVERNANCE PREFLIGHT
    | already satisfied -> ALREADY_SATISFIED
    | conflict/drift -> BLOCKED_FOR_REANALYSIS
    v
IMPLEMENT
    |
    v
V2 DIFF / SCOPE VALIDATION
    | breach -> SCOPE_BREACH
    v
V3 MECHANICAL BEHAVIOR VALIDATION
    | fail, repairable -> targeted remediation
    | environment fault -> ENVIRONMENT_BLOCKED
    v
V4 INDEPENDENT SEMANTIC REVIEW
    | fail, repairable -> targeted remediation
    | design/spec defect -> BLOCKED_FOR_REANALYSIS
    v
V5 ARCHITECTURE + GOVERNANCE VALIDATION
    | breach -> GOVERNANCE_BREACH
    v
V6 MINIMUM-CHANGE / ANTI-BLOAT VALIDATION
    | unnecessary surface -> CHANGE_BLOAT
    v
V7 FINAL REQUIRED GATES
    | fail -> classified failure
    v
CANDIDATE_DONE
```

A validation branch is a real control-plane transition, not prose in the agent prompt. The same principle applies before sign-off: requirements, design, and plan promotion require explicit conformance transitions rather than agent self-attestation.

## 3. V0 — Package and approval validation

Prove:

- task derives from an explicit approval;
- approval package hash is current;
- required specification sections are present;
- task dependencies are complete;
- no blocking question has reopened;
- exact execution task is still the signed-off task;
- for source-backed work, the current WorkItem source snapshot still matches the source identity bound into the approved package by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`.

Failure is not repairable by the implementation worker.

## 4. V1 — Repository and governance preflight

Before editing, prove:

- expected repository identity and baseline are present;
- repository rules are readable;
- applicable ADRs/contracts/governance references are readable;
- no governing source changed in a way that invalidates approval;
- the required work is not already satisfied;
- the planned change surface remains plausible;
- the current reconciled WorkItem source has not materially changed since sign-off.

If governance or current implementation materially contradicts the approved package, return to analysis/design. Do not tell the builder to reconcile the contradiction.

## 5. V2 — Diff and scope validation

After implementation, compare actual change surface with the approved task and minimum-change forecast.

Every changed production surface must have one of these justifications:

1. directly required by an approved task;
2. necessary to preserve a binding architecture/governance invariant while implementing that task;
3. deletion of behavior made obsolete or conflicting by the approved task.

Anything else is unauthorized.

A materially expanded surface is a scope breach until the package is re-reviewed and re-approved.

## 6. V3 — Mechanical behavior validation

Run the project-authoritative commands/gates prescribed by the task.

Mechanical validation may include:

- targeted regression tests;
- required existing regression tests;
- type checking;
- compilation/build;
- static analysis;
- schema/contract checks;
- integration checks;
- project structural gates.

Order records exact command identity, environment, exit status, and bounded relevant output.

The implementation agent cannot replace a prescribed gate with another gate it finds easier to pass.

## 7. V4 — Independent semantic review

A fresh read-only reviewer receives:

- approved execution task;
- relevant specification/governance references;
- repository state;
- resulting diff;
- mechanical validation evidence.

It must independently evaluate:

- acceptance criteria;
- scope;
- root-cause alignment;
- downstream invariants;
- hidden fallback/shim behavior;
- missing negative cases;
- unresolved implementation decisions;
- whether tests merely overfit the implemented result;
- whether every changed production module still owns one cohesive architectural responsibility;
- whether an orchestration module has absorbed policy, persistence, effect or transport mechanics;
- whether implementation avoided a required same-layer functional split merely to remain inside the signed file list, or conversely introduced a split that changes semantic ownership/contracts instead of preserving the resolved architecture.

The reviewer returns only:

- `PASS`;
- `FAIL_REPAIRABLE`;
- `BLOCKED_SPEC_OR_DESIGN`.

It cannot edit the implementation.

## 8. V5 — Architecture and governance validation

Order must prove that the candidate does not violate the target project's binding rules.

This includes, as applicable:

- ADR constraints;
- dependency direction;
- canonical ownership;
- architecture boundaries;
- strict typing requirements;
- state ownership;
- forbidden compatibility or fallback paths;
- security rules;
- repository-specific execution policy.

Where a project supplies mechanical architecture gates, they are mandatory. V5 runs the exact fitness gates bound by the resolved project manifest to applicable P1 governance rules; merely proving that signed authority files were not mutated is not sufficient V5 evidence.

Where a rule cannot be mechanically proven, independent review must explicitly address it. Module cohesion/decomposition is one such mandatory semantic proposition even when import/effect/type sensors also pass.

Green behavior tests cannot override a governance failure.

## 9. V6 — Minimum-change and anti-bloat validation

Validate the candidate against [GW-DOC-MINIMUM-CHANGE-V1](08-minimum-change-standard.md).

The validator asks:

- Is every production change necessary?
- Could an existing owner/capability satisfy the requirement with less new structure?
- Did the implementation add an unnecessary abstraction, carrier, configuration, dependency, state, fallback, or compatibility path?
- Did it perform unrelated cleanup?
- Did it create code for hypothetical future requirements?
- Did it duplicate semantics already owned elsewhere?
- If the diff includes a same-layer physical split, is that split the minimum structure required to preserve an existing responsibility/effect boundary rather than speculative fragmentation? Such an architecture-preserving split is not `CHANGE_BLOAT` merely because it adds a file.
- Did the actual change surface materially exceed the approved forecast?

A failure here is a real validation failure even if all tests pass.

## 10. V7 — Final required gates

After review/remediation, rerun every gate whose evidence may have been invalidated by subsequent edits.

No earlier green result is reused when later edits could affect it.

## 11. Failure classification

Order classifies failures before deciding what may happen next.

| Class | Meaning | Automatic remediation allowed? |
|---|---|---:|
| `TEST_FAILURE` | Candidate behavior fails an approved gate | Yes, bounded |
| `REVIEW_FAILURE` | Reviewer found a local implementation defect | Yes, bounded |
| `SPEC_INVALID` | Approved task/specification is incomplete or inconsistent | No |
| `PRECONDITION_FAILED` | Required repository/runtime precondition is not currently satisfied | No automatic retry; block until explicitly resolved |
| `APPROVAL_STALE` | Approved package no longer matches current authority | No |
| `SCOPE_BREACH` | Implementation exceeded authorized work | No until re-approved |
| `GOVERNANCE_BREACH` | Candidate violates binding architecture/project rule | No blind repair; return to design unless correction is unambiguous within scope |
| `CHANGE_BLOAT` | Candidate contains unnecessary structure/change | One targeted reduction may be allowed if no design decision is required |
| `ENVIRONMENT_BLOCKED` | Required execution environment is unavailable/broken | No semantic retry charge |
| `PROVIDER_FAILURE` | OpenCode/provider session failed operationally | One automatic replacement at most for the exact operational action key; then block, per [GW-DOC-CANONICAL-CONTRACTS-V1 §21](13-canonical-contracts.md) |
| `ALREADY_SATISFIED` | Required outcome already exists | No implementation needed |

The model does not choose the failure class where deterministic evidence can decide it.

## 12. Evidence law

`CANDIDATE_DONE` requires one current coordinator-owned `VALIDATION_PASSED` result for every V0-V7 stage and one `CANDIDATE_RECORDED` event linking those results to the exact final candidate state as defined by [GW-DOC-CANONICAL-CONTRACTS-V1 §§10,17](13-canonical-contracts.md).

A model statement such as "all requirements are met" is never sufficient evidence by itself.
