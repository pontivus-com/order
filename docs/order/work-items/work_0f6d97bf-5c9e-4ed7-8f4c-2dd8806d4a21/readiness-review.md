<!-- Order template: delivery-r3-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW -->

# Order 0.6.0 readiness review

## Readiness verdict

`RETURN_TO_PLAN`.

The P1-P6 authority and G4 technical design are coherent, but the current P7 PLAN contains two execution-boundary contradictions that must be corrected before the package can be signed.

## Authority topology review

**Result:** PASS through P6; P7 requires correction.

- Current P2/P3 authority contains exactly 113 stable requirement IDs and the campaign ledger contains the same 113 IDs with zero missing/extra.
- C01-C22 each have exactly one R1 START and one R1 END record.
- The campaign finding ledger contains no `OPEN_*`, `BLOCKED` or `REVALIDATION` finding.
- R2 dispositions resolve to current manifest authority owners.
- DESIGN keeps one semantic owner per changed concept and introduces no DTO/model/service/repository/controller, persistence schema, transport shape, provider integration or alternate state owner.
- P6 requires immutable exact signed `changeSurface`, rejects changed candidate paths outside it, and keeps commit/push/PR/merge outside Order v1 execution.
- No P1-P6 contradiction requires return to R1/R2/DESIGN.

## P1-P7 traceability review

**Result:** materially complete except for the two P7 execution-boundary defects below.

Upward/downward coverage is otherwise coherent:

- C02 -> Create/remediation correction -> T1 step 2;
- C03 -> App-owned queue/archive filtering -> T1 step 2;
- C04 -> one daemon new-source admission mapping/persistence path -> T1 step 1;
- C10/C11 -> typed Readiness/Approval projection -> T1 step 3;
- C16 -> Settings information hierarchy -> T1 step 4;
- C18/C19/C20 -> existing Workbench/architecture constraints plus changed daemon/browser regression proof -> T1 validation;
- C01/C05-C09/C12-C15/C17/C21/C22 have explicit no-production-delta PLAN dispositions.

The single-task topology is correct because cumulative candidate bytes cannot be promoted between separate ExecutionTasks.

## Lifecycle package completeness

Current package before this R3 result:

- `work-request.md` — one current P0/Work request;
- `research.md` — one current R1 artifact;
- `requirements.md` — one current R2 artifact;
- `solution-design.md` — one current DESIGN artifact;
- `implementation-plan.md` — one current PLAN artifact;
- `readiness-review.md` — this R3 verdict.

The R1 evidence is not stale from later production changes: from the C20 R1 end baseline through this R3 review, later campaign changes are lifecycle/campaign documentation, three explicitly revalidated P2/P3 wording owners, and the campaign architecture-state sensor; no production implementation file used to prove the original implementation gaps changed.

The P2/P3 wording changes affecting C01/C21/C22 were explicitly revalidated and did not add/remove any stable P2/P3 requirement ID.

## Open decision/conflict ledger

| ID | Layer | Conflict | Status |
|---|---|---|---|
| R3-P01 | PLAN | PLAN says a same-layer physical split may be implementation variance, but the signed T1 `changeSurface` is exact/immutable and runtime V2/V6 rejects any changed path outside it | BLOCKING |
| R3-P02 | PLAN | T1 step/completion evidence includes PR/release-packager delivery, while canonical execution ends at verified candidate and commit/push/PR/merge are outside Order v1 | BLOCKING |

Unresolved product/authority questions: **0**.  
Unresolved architecture questions: **0**.  
Unresolved implementation-blocking PLAN conflicts: **2**.

## Evidence

- campaign G0-G5 registers and C01-C22 concern records;
- current 113/113 P2/P3 authority/coverage comparison;
- current `research.md`, `requirements.md`, `solution-design.md`, `implementation-plan.md`;
- `GW-DOC-SPECIFICATION-STANDARD-V2` S8-S12;
- `GW-DOC-CANONICAL-CONTRACTS-V2` exact signed-task/change-surface and execution validation contracts;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V2` task/candidate execution model and explicit statement that commit, push, pull request, merge and deployment remain outside v1;
- current runtime enforcement in `src/daemon/validation.ts` and `src/daemon/execution.ts`, inspected only as evidence of the canonical contract realization.

## Adversarial findings

### R3-P01 — signed surface versus decomposition variance

The plan's minimum-change section says a same-layer architecture-preserving physical split may occur as implementation variance. That statement is not executable under the current signed block: `validateChangedPaths` classifies every path outside `ExecutionTask.changeSurface` as scope breach, and task content is immutable after materialization.

This is not a DESIGN defect. DESIGN already says no split is expected and preserves the correct ownership rule. PLAN must make the P7 consequence exact: the current signed task authorizes only its literal paths; if implementation proves a new file is necessary to preserve cohesion, execution stops/returns to PLAN so the same task can be re-planned/re-signed with an exact revised surface. The worker may not add the file under an informal variance claim.

### R3-P02 — candidate completion versus public delivery

The plan makes permanent PR/release-packager verification part of T1 completion. Canonical P4/P6 execution instead completes a task at the verified candidate after V0-V7; `GW-DOC-TECHNICAL-ARCHITECTURE-V2` explicitly keeps commit/push/PR/merge outside Order v1.

Public delivery remains mandatory repository governance, but it is subsequent delivery of the verified candidate, not an ExecutionTask gate/completion condition. PLAN must separate:
- **T1 execution completion:** exact candidate + signed gates + independent V4 review + changelog bytes inside the candidate;
- **post-candidate repository delivery:** governed short-lived branch/PR, release metadata, permanent PR verification/release-packager check and explicit merge decision.

No seventh task gate may be invented.

## Exact defective layer/return stage when not ready

**Defective layer:** P7 PLAN only.  
**Return stage:** `PLAN`.

Required PLAN corrections:

1. reconcile same-layer decomposition wording with immutable exact `changeSurface`: a newly required path triggers return/re-plan/re-sign rather than in-task variance;
2. remove PR/release-packager delivery from T1 execution completion and place it explicitly after `CANDIDATE_DONE` as repository-delivery work governed by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`.

R1, R2 and DESIGN remain current and do not require reopening.
