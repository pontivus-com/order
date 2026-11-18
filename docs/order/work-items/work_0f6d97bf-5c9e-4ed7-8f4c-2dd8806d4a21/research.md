<!-- Order template: change-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

## Current state/absence

The prior 0.6.0 R1 closure is no longer current.

A campaign-completeness audit established C20-F01: the previous pass proved broad canonical-owner/stable-ID/concern coverage but did not prove the complete semantic content and end-to-end realization of every applicable obligation. That allowed concern-level authority summaries to be promoted into `FACTS_CLOSED`, broad `no functional delta` conclusions in R2 and broad `no technical change` conclusions in DESIGN without complete producer -> carrier -> consumer conformance evidence.

The 0.6.0 campaign is therefore back in R1 revalidation. G0 foundation work and G1 inventory remain reusable evidence; G2 is in progress; R2/DESIGN/PLAN/R3 conclusions are stale until this R1 audit closes.

This is an asset-recovery audit, not a blank-sheet restart. Existing work is retained where independently supportable and rejected only where its conclusion exceeds its evidence.

## Evidence

### Reusable campaign assets already established

The following remain useful and are not discarded by C20-F01:

- `work-request.md` correctly establishes the authority-driven 0.6.0 objective and prohibition on treating released/current implementation as desired-state authority; it now also requires exhaustive authority/semantic/realization proof.
- `0.6.0-concern-coverage-ledger.md` remains useful as a G1 inventory: 113 current stable P2/P3 requirement IDs are mapped with zero missing/extra IDs. The ledger itself correctly states that inventory coverage does not prove concern correctness.
- the C01-C22 concern taxonomy remains a useful indexing/control structure, subject to semantic-obligation expansion where a concern contains multiple distinct obligations.
- historical concern START/END records remain evidence indexes and authority summaries. Their former closure verdicts are not current premises.
- existing implementation observations remain evidence of defects, reusable capability or prior correction and are not desired-state authority.

### Reusable foundational corrections

The current branch independently contains the mechanisms established by the previous foundational findings:

| Finding | Reusable correction confirmed |
|---|---|
| G-F01 | current Change/Defect R1 v2 templates reference current lifecycle-context V2; Investigation/Audit v2 R1 templates also exist rather than silently inheriting historical v1 authority |
| G-F02 | current Change/Defect DESIGN v2 templates carry the S7 content needed for ownership/boundaries, reuse, replacement/deletion, necessary-new-concept justification, alternatives, failure and validation |
| G-F03 | R3 `READY_FOR_SIGNOFF` admission invokes canonical task-definition validation before readiness promotion |
| G-F04 | current Change/Defect PLAN v2 templates carry the S8-S10 planning content, including ownership/decomposition, surfaces, deletions/replacements, evidence, minimum-change forecast, verification and one canonical task block |
| G-F05 | R2 `REFERENCE`/`DELTA` owners must resolve through canonical manifest `authority.p3`, with runtime and architecture-fitness enforcement |

These corrections solve real authoring/conformance defects and remain reusable subject to ordinary freshness verification. C20-F01 does not establish a reason to undo them.

### Previously discovered product/implementation findings retained for revalidation

The following prior findings remain useful evidence but are not treated as the complete defect set:

| Finding | Existing evidence/result retained |
|---|---|
| C01-F01 / C01-F02 | lifecycle/product documentation required clarification between canonical WorkItem stages and internal execution/validation/work-kind boundaries |
| C21-F01 / C21-F02 | product-language corrections distinguish verified result from verified candidate and prohibit invention of missing product intent |
| C02-F01 | ordinary Create promoted raw concern identifiers into operator authoring |
| C02-F02 | linked-remediation UI exposed an editable Project despite same-project lineage |
| C02-F03 / C04-F01 | UI-created and repository-authored WorkItems used non-singular source-registration/admission realization |
| C03-F01 | archive inclusion changed effective queue project/search behavior |
| C10-F01 | Readiness primary verdict used material maturity/currentness instead of the canonical R3 readiness judgment |
| C11-F01 | Approval primary review did not directly expose canonical readiness alongside package currentness |
| C16-F01 | Settings promoted technical filesystem/transport identity above ordinary operator decision/readiness information |

These findings must be revalidated against current authority and current implementation evidence. Their existence does not imply that no additional defects exist.

### Existing downstream artifacts audited

The current lifecycle artifacts are classified as follows:

| Artifact | Current audit status | Reuse rule |
|---|---|---|
| `requirements.md` | STALE | specific requirement fragments may be reused after R1 proof; grouped no-delta closure is not current |
| `solution-design.md` | STALE | specific C02/C03/C04/C10/C11/C16 candidate solutions may be reused after fresh R2; broad no-change conclusions are not current |
| `implementation-plan.md` | STALE | planning mechanics/checkpoints/gate discipline may be reused; exact T1 topology and signed surface are not current |
| `readiness-review.md` | RETURN_TO_RESEARCH | former `READY_FOR_SIGNOFF` is invalid because it traced an incomplete semantic obligation set |

## Governing authority

The revalidation is governed by:

- `GW-P1-AUTHORITY-BEFORE-INFERENCE`, `GW-P1-DOC-CANONICALITY`, FCIS, SoC, DRY/canonical ownership, strict typing and minimum change;
- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
- current P2 product authority;
- every applicable P3 canonical owner and every normative section within those owners;
- `GW-DOC-LIFECYCLE-CONTEXT-V2` for R1/R2/DESIGN/PLAN decision boundaries and evidence/authority separation;
- `GW-DOC-SPECIFICATION-STANDARD-V2` for package completeness and traceability;
- applicable P4/P5/P6 authority when proving present realization;
- the campaign's amended exhaustive semantic/realization review rule.

Permanent semantic authority remains with the existing canonical P1-P6 owners. This R1 artifact records facts, evidence and gaps; it does not become a second permanent specification.

## Affected producer→consumer path

The fresh R1 audit must establish each material obligation at the level actually required to prove conformance:

```text
canonical intent / normative obligation
        |
        v
required semantic information / behavior
        |
        v
authoring input + schema/template + prompt/context
        |
        v
generated governed output
        |
        v
canonical contract / artifact / event / state carrier
        |
        v
pure derivation + daemon/shell/persistence/transport as applicable
        |
        v
browser/query/presentation projection as applicable
        |
        v
rendered information hierarchy / downstream system consumer
        |
        v
valid operator/system decision and action
```

Every material realization is classified `CONFORMS`, `VIOLATES` or `UNPROVEN`.

For the Workbench, the audit must explicitly cover the applicable cross-product of workflow step, work kind, interaction condition, current-attention condition, material/currentness condition, current/historical selection and responsive class. It must determine the exact primary, secondary and technical/on-demand information and the canonical source of every material displayed value.

The review is not limited to UI. The same obligation-level method applies to workflow state, schemas, data, inputs, outputs, prompts, provider behavior, persistence, transport, source reconciliation, approval/execution/validation, Settings and the documentation/conformance machinery itself.

## Downstream invariants

R1 may close only when:

- every applicable canonical normative obligation has an explicit audit record;
- stable-ID/concern mapping has been expanded to the underlying semantic obligations where needed;
- every material producer -> carrier -> consumer path is proven;
- every applicable work-kind/stage/information-design/state/action/failure/recovery consequence is explicit;
- current realization evidence is classified with zero material `UNPROVEN` obligations;
- all newly discovered defects have exact finding ownership;
- existing reusable findings/corrections have been revalidated rather than assumed;
- no implementation observation has become desired-state authority.

Only after this closure may the existing `requirements.md` be regenerated in place.

R2 must then derive the complete 0.6.0 functional consequence of every applicable canonical obligation. A `REFERENCE` disposition preserves its canonical owner but does not permit a generic "no functional delta" shortcut.

DESIGN must then prove every functional obligation has an explicit technical realization. `No technical change` requires evidence that the existing P4-P6 owner and present producer/carrier/consumer path fully realize the requirement.

PLAN and R3 remain downstream and cannot reuse their former closure verdicts.

## Unresolved facts

The following are deliberately open and must be resolved before R1 completion:

1. the complete atomic semantic-obligation inventory beneath the existing canonical P2/P3 owner/ID inventory;
2. complete realization classification for C01-C22 rather than concern-level authority summaries;
3. complete work-kind x workflow-step information-design proof, including Work request, Research, Requirements, Solution design, Plan, Readiness, Approval, Implementation and Complete;
4. whether present schemas/templates/prompts/outputs preserve the exact information required at every applicable stage;
5. whether every required canonical value survives its producer -> carrier -> consumer path without loss, substitution or imprecise presentation;
6. whether workflow/current-attention/material/proposal/approval/execution/provider state and transition behavior conform across all applicable conditions;
7. whether any additional P1-P6 canonical authority itself is contradictory, incomplete or incorrectly owned;
8. the full current implementation defect set and therefore the actual minimum DESIGN/PLAN change surface.

No prior assertion that these questions were closed is current evidence.

## Verdict

**R1 REVALIDATION IN PROGRESS.**

No promotable R1 completion verdict is asserted.

C20-F01 remains open until the exhaustive authority/semantic/realization audit is complete. The former R1 `CONFIRMED` conclusion and downstream G3-G6 closure are stale and cannot be used as premises.
