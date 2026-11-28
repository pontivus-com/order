# A07 — Approval and execution

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C11 + C12.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `C12-O01`, `C12-O02`, `C12-O07` | `MIXED_TECHNICAL_DELTA` | QA1/QA3/QA6 | IA35/IA37 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C12-O01`, `C12-O02`, `C12-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `C12-O12`, `C12-O13`, `C12-O19`, `C12-O90` | `MIXED_TECHNICAL_DELTA` | QA1/QA3/QA6 | IA35/IA37 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C12-O12`, `C12-O13`, `C12-O19` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `C11-O01`, `C11-O03`, `C12-O20` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C11-O01`, `C11-O03`, `C12-O20` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `C11-O01`, `C11-O02`, `C11-O07` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD06`, `SD12`, `SD23`, `SD25`; QA1/QA6 | `IA17`, `IA29`, `IA31`; IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Exact prospective SignoffPackage vs selected historic Approval; two approvals, retained zero-task/unsigned returned history, stage-aware current/null, exact committed artifact and task membership, same-role/hash nonmember, foreign/missing id, loading/error/no writes and exact decision adjacency. Proof: tests/daemon.test.ts; tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `C04-O15`, `C12-O03`, `C12-O17` | `MIXED_TECHNICAL_DELTA` | QA1/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C04-O15`, `C12-O03`, `C12-O17` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD06`, `SD12`, `SD23`, `SD25`; QA1/QA2/QA6 | `IA17`, `IA29`, `IA31`; IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Exact prospective SignoffPackage vs selected historic Approval; two approvals, retained zero-task/unsigned returned history, stage-aware current/null, exact committed artifact and task membership, same-role/hash nonmember, foreign/missing id, loading/error/no writes and exact decision adjacency. Proof: tests/daemon.test.ts; tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `C12-O17`, `C17-O10`, `DIRECT-FR213` | `MIXED_TECHNICAL_DELTA` | `SD07`, `SD26`; QA1/QA3/QA6 | `IA14`, `IA32`; IA35/IA37 | IA35–IA38 atomic cutover; IA39 proof | Actual current blocker reason/consequence/recovery remains visible independent of selected task/Run; preserve pure execution ownership. Required proof: owning IA and P3 §23 allocation in 13-verification-closeout.md.; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD12`, `SD23`, `SD25`; QA4/QA5/QA6 | `IA17`, `IA29`, `IA31`; IA38/IA39 | IA35–IA38 atomic cutover; IA39 proof | Exact prospective SignoffPackage vs selected historic Approval; two approvals, retained zero-task/unsigned returned history, stage-aware current/null, exact committed artifact and task membership, same-role/hash nonmember, foreign/missing id, loading/error/no writes and exact decision adjacency. Proof: tests/daemon.test.ts; tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17`, `DIRECT-FR223` | `MIXED_TECHNICAL_DELTA` | `SD26`; QA1/QA3/QA6 | `IA32`; IA35/IA37 | IA35–IA38 atomic cutover; IA39 proof | Stable master/detail consumes actual current blocker and next action independently of selected task/Run. Required proof: owning IA and P3 §23 allocation in 13-verification-closeout.md.; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `C12-O16` | `MIXED_TECHNICAL_DELTA` | QA1/QA3/QA6 | IA35/IA37 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C12-O16` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |

Stable rows in phase: **10**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C11-01` | C11-F01 | `SD12`, `SD25` | `IA17`, `IA31` | — | Approval presents readiness/currentness before technical identity and IA31 owns the single direct Review composition without outer workflow framing. |
| `PL-C11-02` | C11-F02 | `SD12` | `IA06` | — | Canonical approval identity is trimmed/nonblank at ingress. |
| `PL-C12-01` | C12-F01 | `SD13` | `IA07` — DESIGN-positive-reuse proof only | — | Signed in-task architecture checkpoint remains coordinator-executable without provider shell permission; T1 consumes the existing capability and does not implement it. |
| `PL-C12-02` | C12-F02 | `SD10` | `IA08` — DESIGN-positive-reuse proof only | — | Signed scope/exclusions remain the hard execution boundary; `changeSurface` is exact forecast evidence; admissible in-scope unforecast decomposition is governed by existing V4/V5/V6 and is not reimplemented by T1. |

Package atoms in phase: **4**.

## Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA17** — consume the single implementation definition in `12-action-catalog.md`.
- **IA06** — consume the single implementation definition in `12-action-catalog.md`.
- **IA07** — consume the single baseline-checkpoint proof definition; authorize no checkpoint-protocol production edit.
- **IA08** — consume the single scope/forecast/V4-V6 baseline proof definition; authorize no execution-foundation production edit.
- **IA31** — consume the single IA31 definition in `12-action-catalog.md`.
- **IA32** — consume the single IA32 definition in `12-action-catalog.md`.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.


## Realization trace consequence

IA17/31 own exact package/task currentness, Context provenance and decision feedback; IA32 current execution owner, task/Run selection, latest-reviewer-only current validation boundary, exact causal remediator failure and actual blocker; historical attempt detail cannot reuse current progress. Preserve IA07/08 reuse proof. Prove complete signed contract and actual state/action outcomes.

## Native Acceptance integration

QA integration: IA35 extends current Approval and exact signed-member identity, IA36 persists event stream, IA37 owns automatic scheduler continuation and QA replay/repair/restart. IA38 consumes current candidate evidence and task history in Review/Implementation; IA39 proves global execution exclusion, concurrent commands, no fabricated V4, exact resume and no mandatory manual task starts. Technical success with candidate enters Acceptance; all no-op completes directly.
