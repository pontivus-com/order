<!-- Order template: defect-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

## Current state/absence

The defect is CONFIRMED at evidence baseline `75e1de8a0fe5c1e63806a535257f3ba2bd5fe0a1`.

The problem is not that CI failed. PR Verification #1218 was green. The problem is that the permanent fitness checks did not encode the complete campaign progression invariants, so green verification was compatible with false semantic/governance closure.

## Evidence

### G-F06 — current-state ownership blind spot

The campaign owner states that §18 is the sole current G0-G6 state owner. The architecture sensor:

- loads `0.6.0-design-campaign-plan.md` into one `source` string;
- rejects duplicate Status/Prerequisite/concern-state projections only inside that string;
- references `0.6.0-concern-coverage-ledger.md` only to prove the G0 baseline SHA appears there.

At the audit baseline, the coverage ledger declared `Status: G1 PASS` and `research.md` declared G2 closure. Neither was rejected.

Root cause: sensor scope was narrower than the campaign's single-owner invariant.

### G-F07 — pair-audit progression blind spot

Campaign §8.4 states that a missing pair audit is progression-equivalent to FAIL and that a PASS without evidence against detailed checks is invalid.

The architecture sensor parses:

- §7 concern rows;
- §18 gate rows;
- G0 ancestry/open-foundation state;
- per-phase concern closure for G2-G5.

It does not parse:

- the §8.4 pair-status table;
- `PAIR AUDIT START/END` records;
- exact audit evidence baseline/artifact identity;
- detailed general/phase/cross-concern/reused-material checks;
- pair ordering or gate-to-pair closure.

At the audit baseline, R2-A01-A11 and DESIGN-A01-A11 were all table-PASS with zero required audit records. CI remained green.

Root cause: a campaign progression invariant existed only in prose/status, not in the permanent mechanical fitness owner.

### G-F08 — R2 disposition completeness blind spot

The v2 WorkItem hygiene sensor requires a functional authority disposition ledger and validates each row that exists. For REFERENCE/DELTA it resolves the declared owner and proves the owner's path is selected by `authority.p3`.

It does not derive the current stable P3 requirement-ID set and compare that set with the campaign R2 disposition ledger.

Consequently a small number of broad concern-level rows can be structurally valid even though the campaign's exhaustive standard requires every material P3 obligation to be dispositioned.

Root cause: row validity was enforced without set completeness.

## Governing authority

- `GW-P1-DOC-CANONICALITY`
- `GW-P1-DRY`
- `GW-P1-CANONICAL-OWNERSHIP`
- `GW-P1-AUTHORITY-BEFORE-INFERENCE`
- `GW-DOC-AGENT-OPERATING-RULES-V1`
- `GW-DOC-LIFECYCLE-CONTEXT-V2`
- `GW-DOC-SPECIFICATION-STANDARD-V2`
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2`
- current 0.6.0 campaign §5.1/§8.4/§18.

## Affected producer→consumer path

```text
campaign authority/control law
  -> campaign §7 / §8.4 / §18
  -> WorkItem lifecycle evidence documents
  -> tests/architecture.test.ts permanent fitness interpretation
  -> PR architecture gate
  -> human/R3 decision whether progression evidence is trustworthy
```

The defect is in the verification interpretation layer. Product/runtime behavior is unaffected.

## Downstream invariants

The correction must:

- preserve all existing architecture tests and add only the missing propositions;
- reject duplicate current-state projections without rejecting historical/evidence language that does not claim current gate state;
- mechanically couple pair-table PASS to complete audit-record evidence and gate PASS to required pair PASS;
- enforce stable-P3 disposition set equality only when G3 is being claimed PASS, so the deliberately reopened campaign can remain green while R2 is under revalidation;
- retain the existing per-row P3 owner legality check;
- not pretend stable IDs replace semantic review of normative clauses without IDs.

## Unresolved facts

NONE.

The exact failure mechanisms and their permanent verification owner are identified.

## Verdict

`CONFIRMED`.

DESIGN may specify the minimum sensor correction. The current 0.6.0 campaign remains blocked independently.
