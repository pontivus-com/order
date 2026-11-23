<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`RETURN_TO_DESIGN`.

The prior `READY_FOR_SIGNOFF` verdict is superseded. Post-G6 inspection of rendered artifact `14778709723` proved C19-F06/C19-F07/C19-F08 and C20-F08/C20-F09: the accepted Workbench foundation had an internally contradictory Surface/attention contract, Evidence could nest a primary surface inside another primary surface, Terminal result duplicated outcome semantics and exposed specification/container terminology as product copy, and the rendered/certification process could positively protect those defects.

This return is authority-driven. It does not use the current UI as a replacement design; current implementation, screenshots and tests remain evidence that the prior P3/P4/DESIGN/PLAN realization was incomplete.

## Exact return-to-design review basis

- R1 `research.md`: `db81af903badbbbb1f546f62cc4fddcea3b2f18b`;
- R2 `requirements.md`: `bd62cb694feda6bceeeaa5655005d7c886d072ee`;
- DESIGN `solution-design.md`: `1d8ffb1e74485885d445489c2b1d86e3977d2d00`;
- canonical P3 Workbench: `f38bd9ebf17e0726b51453a7e05dc52175b080fa`;
- canonical P3 Markdown Workbench: `1cc5a28eff8d180f88106d89990f7b89aa27a132`;
- canonical P4 Workbench: `05bae4d1895d832ed2461d4bd18e9a709e0bd338`;
- PLAN at the time of this verdict: `285042e2aadf1a7d28cc0d0865208c20a0a91757` — this was stale for C19-F06-C20-F09. The return route subsequently regenerated the canonical PLAN again as the root-cause scope expanded to Review-class composition; the exact current PLAN identity is owned by the campaign register and is not retroactive evidence for this R3 verdict;
- prior rendered evidence: artifact `14778709723`, implementation candidate `faee3429d914040ca6ff6c12a82ac85ca214299d`, rendered candidate `12de328d50c65dde6c430b283faaa362c4f9fb20` — retained only as causal evidence of the newly proven defects;
- campaign current state is owned only by `0.6.0-design-campaign-plan.md` §7/§8.4/§13A/§18.

## Adversarial findings

| Finding | Result | R3 disposition |
|---|---|---|
| C19-F06 — semantic-region / primitive-contract contradiction | BLOCKING | P4 now makes `WorkbenchSurface.attention` optional and semantic. PLAN/IA27 must reclassify `WorkbenchSurface` and all consumers against the corrected interaction grammar. |
| C19-F07 — wrapped/nested primary interaction composition | BLOCKING | Proposal Review/Evidence must replace the selected owning material composition; `WorkflowStepFrame` may not wrap Proposal Review/Readiness/Approval/Evidence/Terminal-result primary compositions inside another Surface/Attention frame. |
| C19-F08 — specification/container terminology leakage | BLOCKING | Complete must use canonical product-facing outcome language and substantive result/evidence directly; architecture/governance/container labels cannot become ordinary copy without product-language authority. |
| C20-F08 — composite rendered-evidence scope defect | BLOCKING | A parent `SURF-*` PASS may not ignore a visibly rendered nonconforming descendant that materially determines the reviewed composition. |
| C20-F09 — composition-certification defect | BLOCKING | Permanent verification must prove allowed renderer→interaction-class composition, semantic-slot integrity, direct Review composition and no wrapped/nested primary compositions; presence-only assertions and `workflow-step-summary` assertions around Review are insufficient. |
| prior IA27 foundation acceptance | INVALIDATED | `WorkbenchSurface = CONFORMING_NO_EDIT` and the retained interaction-class PASS are disproven. The prior foundation cannot be frozen for IA29+. |
| prior IA28 Queue / SURF-WI-001 rendered acceptance | INVALIDATED | Queue used the mandatory attention slot as generic placement, and the SURF-WI-001 Complete fixture positively required the noncanonical attention band. |
| prior IA28-RZ2 authorization | TERMINATED / HISTORICAL | It bound a superseded exact package and produced its evidence. It authorizes no current production mutation. |

## Required return route

The package returns to the earliest affected owners:

1. R1 retains the factual findings C19-F06-C19-F08/C20-F08-C20-F09.
2. P3/R2 own the semantic-region, one-primary-composition, Terminal-result and acceptance consequences.
3. P4/DESIGN own the corrected optional-semantic Surface contract, renderer composition and exact SURF realization.
4. PLAN must regenerate IA27/IA28/IA33 and permanent certification ownership from that corrected package.
5. All exact-hash pair audits and ALIGN audits must be freshly revalidated.
6. Only after G5/G5A regain PASS may a new bounded IA27/IA28 evidence authorization be issued against that exact package.
7. The corrected foundation/Queue evidence must be produced and reviewed before a fresh R3 can return `READY_FOR_SIGNOFF`.
8. IA29 and every later ordinary implementation phase remain forbidden until that fresh readiness plus separate sign-off.

## Prior evidence disposition

The previous rendered artifact and green verification runs remain useful evidence of the failure mechanism. They are not desired-state authority and they do not retain acceptance by inertia.

In particular, the prior screenshot labels `SURF-WI-001`, `SURF-QUEUE-001` and the former foundation-realization `PASS` do not override the newly proven canonical contradiction. The old `READY_FOR_SIGNOFF` result is historical provenance only.

## Final R3 disposition

**Verdict at this review:** `RETURN_TO_DESIGN`.

This record is retained as the adversarial review that invalidated the prior `READY_FOR_SIGNOFF` package. Its required authority/DESIGN/PLAN return work has subsequently been completed through the campaign's current G5A closure. This file does not project a new R3/G6 state and does not authorize implementation. Current campaign state is owned only by `0.6.0-design-campaign-plan.md` §18; a fresh R3 review can occur only after a newly authorized exact-package IA27/IA28 evidence tranche.
