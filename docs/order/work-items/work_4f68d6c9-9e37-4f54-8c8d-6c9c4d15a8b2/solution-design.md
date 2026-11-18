<!-- Order template: defect-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Phase-0 campaign conformance sensor correction

## Design basis and authority boundary

The design consumes only the confirmed G-F06/G-F07/G-F08 facts, current P1/P3/P4/P6 authority and the active campaign's existing control law. It does not redesign campaign semantics.

The existing owner is `tests/architecture.test.ts`. Adding another script/test registry would duplicate permanent fitness ownership.

## Requirement-to-solution map

| Requirement | Technical realization |
|---|---|
| G-F06 | Extend the existing single-owned campaign-state test to inspect the active campaign WorkItem Markdown siblings and reject narrow syntactic forms that claim current G0-G6 state outside the campaign plan. |
| G-F07 | In the same fitness owner, parse the §8.4 pair table and matching audit records. Validate A01-A11 uniqueness/order, PASS-record completeness, prior-pair progression and G2-G5 gate-to-pair closure. |
| G-F08 | Reuse current manifest/ref/P3 parsing in the existing v2 hygiene/campaign fitness code. Only when G3 is PASS, derive unique stable `GW-FR-*` IDs from current authority.p3 files and require exact campaign disposition coverage; retain current row-owner checks and additionally prove the selected owner file contains the cited ID. |

## Existing capability/reuse and behavior to replace

Reuse:
- current `sourceText`, manifest parsing, `resolvedRefs`, `authority.p3` pattern resolution and `matchesGlob`;
- current campaign §7/§18 parsers and violation aggregation;
- current v2 requirements-ledger row parser.

Replace:
- campaign-only-file duplicate-state scan with active WorkItem document-set scan;
- pair status as unchecked prose with mechanically coupled status/evidence;
- row-validity-only R2 hygiene with conditional expected-set completeness for this campaign.

No new production concept is introduced.

## Technical architecture and data/control flow

```text
current project manifest + current P3 files
                 |
                 v
tests/architecture.test.ts
  + active campaign WorkItem docs
  + §8.4 pair table/records
  + §18 gate table
  + campaign requirements ledger
                 |
                 v
deterministic violation list
                 |
          architecture gate
```

The test derives facts directly from repository files. It creates no persisted state and no alternate authority model.

## Canonical owner / affected boundaries

- permanent architecture/campaign fitness: existing `tests/architecture.test.ts`;
- campaign state semantics: unchanged, owned by the active campaign plan plus P1 operating rules;
- R2 authoring semantics: unchanged, owned by current P3 authority and v2 WorkItem/specification standards.

## Exact expected implementation surface

Pre-signoff governed verification-material correction:
- `tests/architecture.test.ts`.

Repository delivery metadata after the correction:
- `CHANGELOG.md`.

No production source, UI, manifest, dependency or P1-P6 document changes are expected.

## Contract/state changes

NONE.

No canonical schema/type, runtime state, persistence, HTTP, provider or Approval contract changes.

## Decisions, rationale and rejected alternatives

**Decision:** strengthen the existing permanent sensor.

Rejected:
- add another campaign checker script — duplicates verification ownership;
- encode campaign state in another file — violates single ownership;
- treat green CI as semantic closure — directly reproduces the defect;
- require all prose gate mentions to disappear — overbroad and would reject legitimate history/evidence;
- use stable-ID count as the sole R2 semantic proof — does not cover normative clauses without IDs.

### Verification-material timing decision

`tests/architecture.test.ts` is selected by project verification material for PLAN/R3. Canonical contracts prohibit a signed task from mutating verification material in its Approval closure.

Therefore this file is corrected **before** any Approval for this foundation remediation. R3 then resolves the corrected test as immutable material. No P7 task is permitted to include `tests/architecture.test.ts`.

This is not a bypass of execution governance; it is the required ordering for correcting verification authority before it can safely authorize later execution.

## Compatibility and preservation

Preserve all existing architecture/campaign assertions. New assertions are additive and target only the proven gaps.

## Failure/recovery behavior

If the strengthened sensor exposes additional unsupported campaign PASS state, the affected campaign gate remains/re-enters revalidation; the test is not weakened to accommodate the package.

If the sensor design itself would require production state or a second verification owner, return to DESIGN.

## Verification obligations

Before campaign G0 can return PASS:
- dependency-lock;
- typecheck;
- architecture;
- full test;
- build;
- browser;
- explicit semantic review that the new patterns enforce only current-state claims, pair evidence/progression and stable-P3 set completeness;
- negative fixture reasoning for G-F06/G-F07/G-F08;
- exact G0 baseline ancestry after the correction is integrated.

## Open technical questions

NONE.
