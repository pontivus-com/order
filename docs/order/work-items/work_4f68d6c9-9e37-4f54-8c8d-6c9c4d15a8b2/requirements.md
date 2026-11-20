<!-- Order template: defect-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

## P2 intent and R1 factual basis

This package restores trustworthy governance progression for the active 0.6.0 campaign. It does not introduce product behavior.

The R1 facts prove three verification/conformance omissions. The required outcome is minimum strengthening of the existing permanent fitness owner so the campaign's already-binding single-state, exhaustive pair-audit and R2-disposition rules cannot be represented as PASS when their mechanically checkable prerequisites are absent.

## Functional authority disposition ledger

These are package-local conformance consequences of existing P1/campaign authority. They do not create a permanent P3 product owner.

| Requirement | Disposition | Canonical P3 owner |
|---|---|---|
| G-F06 single campaign gate-state projection | LOCAL | — |
| G-F07 pair-audit/gate progression proof | LOCAL | — |
| G-F08 stable-P3 R2 disposition-set completeness | LOCAL | — |

## Required observable outcome/delta

### G-F06

For the active 0.6.0 campaign WorkItem, permanent fitness must reject a subordinate Markdown artifact that declares a competing **current** G0-G6 state while allowing historical/provenance statements that do not claim current ownership.

Acceptance:
- the sole owner remains campaign §18;
- the known ledger/research duplicate forms are rejected if reintroduced;
- campaign history/evidence references remain legal;
- no second state registry is created.

### G-F07

Permanent fitness must bind §8.4 pair/gate state to the required evidence records.

Acceptance:
- the pair register contains exactly A01-A11;
- a phase/pair marked PASS has one matching START/END record;
- that record contains an exact repository evidence baseline and explicit artifact identity/hashes, detailed general and phase-specific checks, cross-concern/reused-material checks, Findings/Reopened/Unproven sections and a PASS verdict;
- a later pair cannot be PASS while its predecessor is not PASS;
- G2/G3/G4/G5 cannot be PASS unless all R1/R2/DESIGN/PLAN pair rows respectively are PASS;
- a missing record remains progression-equivalent to FAIL.

### G-F08

When G3 is claimed PASS, permanent fitness must prove exact stable-P3 disposition coverage.

Acceptance:
- derive the current unique stable `GW-FR-*` IDs from files selected by project `authority.p3`;
- the campaign `requirements.md` disposition ledger contains exactly one row for every such stable P3 ID;
- duplicate or missing stable-P3 IDs fail;
- REFERENCE/DELTA owner resolution remains constrained to P3 and the selected owner file must contain the stable requirement ID it claims to own;
- package-local LOCAL rows may exist only in addition to, not instead of, the required stable-P3 set;
- normative P3 clauses without stable IDs remain mandatory semantic pair-audit content and are not declared mechanically complete by this check.

## Acceptance criteria

The correction is complete when the permanent architecture/campaign fitness test detects all three reproduced failure classes, the reopened campaign state is legal, and no existing gate/owner check is weakened.

## Scope/exclusions

In scope:
- the existing permanent architecture/campaign fitness owner;
- synthetic/internal test logic inside that existing test file needed to express the missing invariants;
- campaign subordinate-document wording already corrected before sensor application.

Out of scope:
- product/runtime/UI behavior;
- P2/P3/P4/P5/P6 semantic redesign;
- lifecycle/task/approval state changes;
- dependencies;
- new test framework or registry;
- altering the current 0.6.0 product T1.

## Failure/negative behavior

The correction must fail closed if:
- a subordinate active campaign document claims current gate PASS/closure;
- a pair table claims PASS without its complete evidence record;
- gate PASS outruns pair PASS;
- G3 PASS is claimed with missing/duplicate stable-P3 dispositions or with a REFERENCE/DELTA owner that does not own the cited stable ID.

The correction must not:
- reject ordinary historical/provenance mentions merely because they contain a gate identifier;
- turn stable-ID counting into semantic proof for normative clauses;
- allow implementation/tests/history to define campaign desired state;
- weaken existing architecture or R2 owner-layer sensors.

## Material compatibility/security/performance constraints

No compatibility, security, performance, dependency, persistence, transport or runtime consequence.

## Open product/authority questions

NONE.
