<!-- Order template: change-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

## Current state/absence

The 0.6.0 campaign R1 investigation is complete across the authority-derived C01-C22 concern register subject only to the final C20 horizontal factual audit recorded in the campaign-control plan.

The coverage ledger proves 113 unique current P2/P3 stable requirement IDs are mapped to the concern register with zero missing and zero extra IDs. The concern investigations establish that the canonical product/lifecycle/control-plane authority is broadly coherent, while identifying a bounded set of factual mismatches between current authority and current documentation/presentation/ownership implementation.

This research artifact is a synthesis of those factual results. It is not a replacement P2/P3 specification and does not make the released 0.5.0 application a preservation baseline.

## Evidence

Primary campaign evidence:

- `0.6.0-concern-coverage-ledger.md`: 113/113 current P2/P3 stable-ID coverage, all canonical owners, lifecycle stages, product surfaces and productive boundaries mapped.
- `0.6.0-design-campaign-plan.md`: explicit START/END records and evidence-backed verdicts for C01-C22, plus the campaign-wide finding ledger and cross-concern dispositions.
- exact current canonical P2/P3 owners resolved through `pontivus-order.toml`.
- current implementation/tests inspected only as evidence of authority conformance, violation or reusable capability; they are not desired-state authority.

Factual findings carried forward:

| Finding | Factual result | Downstream owner |
|---|---|---|
| C01-F01 | P2 lifecycle illustration does not explicitly distinguish canonical WorkItem stages from post-signoff execution/validation subflow | R2 / `GW-DOC-SYSTEM-BRIEF` |
| C01-F02 | lifecycle-context terminology can conflate canonical WorkItem stages with execution/work-kind decision boundaries | R2 / `GW-DOC-LIFECYCLE-CONTEXT` |
| C21-F01 | product identity overstates “Verified candidate” as the universal terminal outcome despite valid non-candidate terminal outcomes | R2 / `GW-DOC-PRODUCT-IDENTITY` |
| C21-F02 | product-language wording can imply Order invents missing product intent or that every WorkItem executes | R2 / `GW-DOC-PRODUCT-IDENTITY` |
| C02-F01 | Create promotes technical concern IDs into ordinary operator authoring | R2 reference to existing intake/Workbench authority |
| C02-F02 | linked-remediation UI exposes Project as editable although canonical lineage is same-project | R2 reference to existing linked-remediation authority |
| C02-F03 | UI-created and repository-authored WorkItems do not yet converge on one productive source-ingestion/reconciliation owner | DESIGN |
| C03-F01 | queue project/search semantics are inconsistent when archived work is included | R2 |
| C04-F01 | productive source admission/reconciliation ownership is not singular | DESIGN |
| C10-F01 | Readiness primary verdict slot projects material maturity rather than the canonical R3 readiness verdict | R2 reference to `GW-FR-221-READINESS-REVIEW-HIERARCHY` |
| C11-F01 | Approval primary review does not directly expose canonical readiness alongside package currentness | R2 reference to existing Approval hierarchy |
| C16-F01 | Settings promotes exact filesystem/transport identity into ordinary primary content contrary to its canonical information hierarchy | R2 reference to existing Settings hierarchy |

Foundational findings G-F01 through G-F04 were remediated before this synthesis and are not open 0.6.0 product findings.

No other C01-C22 investigation established a factual product/authority gap requiring a new R2 decision. Verified concerns remain governed by their existing canonical owners.

## Governing authority

The factual investigation is governed by:

- `GW-DOC-WORK-LIFECYCLE` for R1 decision boundaries and promotion;
- `GW-DOC-LIFECYCLE-CONTEXT` for resolved stage context and evidence/authority separation;
- `GW-DOC-SPECIFICATION-STANDARD` for factual completeness, open-question discipline and traceability;
- `GW-P1-AUTHORITY-BEFORE-INFERENCE` and `GW-P1-DOC-CANONICALITY`;
- all current P2/P3 owners enumerated by the campaign coverage ledger.

Permanent product/function meaning remains with those canonical owners. This WorkItem research records only the factual basis needed for the 0.6.0 R2/DESIGN package.

## Affected producer→consumer path

The closed R1 result feeds the next lifecycle layers as follows:

```text
current P2/P3 authority
  + campaign coverage proof
  + concern-local evidence/findings
        |
        v
R2 functional disposition
  - REFERENCE existing authority where behavior is already complete
  - DELTA only where permanent P2/P3 authority requires correction
  - LOCAL only for genuine WorkItem-specific requirement
        |
        v
DESIGN
  - realize all functionally closed obligations
  - resolve C02-F03/C04-F01 source-owner consolidation
        |
        v
PLAN / R3 / sign-off
```

Implementation evidence never flows upward as an implicit functional requirement. Where implementation already conforms, R2 may reference the canonical authority rather than preserving the implementation by description.

## Downstream invariants

R2 must:

- dispose every open R2 finding explicitly;
- retain existing P2/P3 authority by REFERENCE where no semantic change is required;
- amend the permanent canonical P2/P3 owner only for genuine semantic/documentation deltas;
- preserve no-product-intent-invention, valid no-code terminal outcomes, exact lifecycle/return semantics and current-attention ownership;
- avoid turning UI implementation details into requirements.

DESIGN must:

- resolve C02-F03/C04-F01 through one existing canonical source admission/reconciliation owner;
- introduce no DTO/shadow source representation or second semantic owner;
- realize all R2-closed hierarchy/presentation corrections through existing Workbench/component/state owners.

Later PLAN/R3 must preserve bidirectional traceability, minimum-change discipline, negative/failure/recovery coverage and exact authority ownership.

## Unresolved facts

NONE.

No material factual question remains open after the C01-C22 investigations and C20 horizontal factual audit. Remaining work consists of governed R2 functional dispositions and DESIGN technical decisions already identified above; those are not unresolved R1 facts.

## Verdict

`CONFIRMED`.

The requested 0.6.0 reconstruction has a complete factual basis for R2: concern coverage is exhaustive, factual gaps have explicit owners, foundational authoring/conformance defects are remediated, and no remaining uncertainty requires application-state inference before functional design begins.
