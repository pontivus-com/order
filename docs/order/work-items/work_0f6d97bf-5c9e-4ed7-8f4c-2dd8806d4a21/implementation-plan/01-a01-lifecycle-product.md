# A01 — Lifecycle and product identity

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C01 + C21.
**Upstream:** consume the single exact R1/R2/DESIGN binding in `00-governance.md` (compiled governance in the root PLAN); this phase owns no separate current package identity.

## Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08`, `C01-O90` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C01-O03`, `C01-O05`, `C01-O08` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | Recheck `C01-O01`, `C01-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD12`; QA1/QA2/QA6 | `IA17`; IA35/IA37/IA38 | IA35–IA38 atomic cutover; IA39 proof | IA17 proves actual admitted destination and monotonic reach; IA27 proves rail consumption. Proof: tests/core.test.ts; tests/daemon.test.ts; tests/workbench-presentation.test.ts; tests/browser.spec.ts; tests/e2e-server.ts fixture provenance + V4/V5/V6 requirement-specific semantic review; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05`, `C01-O90` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35; IA35/IA37/IA38 | IA37/IA38; IA35–IA38 atomic cutover; IA39 proof | IA39 exhaustive transition, state and denial tests; IA39 native Acceptance proof, prior evidence historical |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11`, `C01-O90` | `MIXED_TECHNICAL_DELTA` | QA1/QA2/QA6 | IA35; IA35/IA37/IA38 | IA37/IA38; IA35–IA38 atomic cutover; IA39 proof | IA39 exhaustive transition, state and denial tests; IA39 native Acceptance proof, prior evidence historical |

Stable rows in phase: **5**.

## Corrected-upstream authority no-code dispositions

These rows carry material R2 consequences that are already corrected in canonical authority. They authorize **no T1 edit** but remain explicit execution/proof instructions so the correction cannot disappear from the package.

| Trace key | DESIGN disposition | Execution owner | Exact current authority | Required proof |
|---|---|---|---|---|
| `A01-NC01` — C01 verified-terminal success/no-code distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-SYSTEM-BRIEF` blob `c7b5c9b0833183bf16f5d894b8e6795bb9fca095`, §8 | Recheck exact authority identity plus R1 C01-O06/O13/O14 under V4; any contradiction returns to R2/DESIGN. |
| `A01-NC02` — C01 `GW-P2-CONTROLLED-WORK` cross-reference | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-WORK-LIFECYCLE` blob `db4730984998c13fd507657d076caa410669f136`, §7 → System Brief §9 | Recheck exact authority identity plus R1 C01-O14 under V4; do not edit runtime behavior for this documentation correction. |
| `A01-NC03` — C21 canonical product-language/commit boundary | `ALREADY_CORRECTED_NO_CODE` | NONE — no additional P2 edit in T1 | `GW-DOC-PRODUCT-IDENTITY` blob `a23ec781ab4a169d161fd3693870bc207c65e31e` | Recheck exact authority identity and corrected C21-F01/F02/F04 semantics under V4; IA19 corrects residual README language; IA33 owns exact reached result and provenance, including explanation without invented sign-off. |
| `A01-NC04` — C01 WorkItem-stage vs execution-subflow distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-SYSTEM-BRIEF` blob `c7b5c9b0833183bf16f5d894b8e6795bb9fca095` | Recheck C01-F01/C01-O03/O05/O08 and exact authority identity under V4; no new lifecycle/state mutation. |
| `A01-NC05` — C01 lifecycle-context stage/role/work-kind distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-LIFECYCLE-CONTEXT` blob `bac6624dc98eb1c2b9c2e22149958df442dd0e95` | Recheck C01-F02/X-C01-C22-01 and exact authority identity under V4; no new stage/role/work-kind state. |

No-code rows in phase: **5**.

## Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | `SD01`, `SD27` | `IA19`, `IA33` | — | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim or treating technical verification as final acceptance; IA33 owns reached Complete and exact candidate evidence. |

Package atoms in phase: **1**.

## Referenced actions

- **IA17** — consume the single SD12 definition in `12-action-catalog.md`; this phase owns no second reach selector.

- **IA19** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA33** — consume the single Complete/Evidence residual and proof definition for terminal-result composition.

## Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every corrected-upstream no-code row remains byte-current and receives no T1 mutation;
5. every package atom is satisfied by its one execution owner;
6. action-specific exact proof propositions plus `13-verification-closeout.md` pass;
7. any evidence contradiction returns upstream rather than broadening scope.

## Native Acceptance integration

QA integration: `GW-FR-228`, `GW-FR-232`, lifecycle/product outcome and canonical stage ownership are affected, not positive no-change. IA35 owns pure lifecycle and carrier transition closure (including valid no-code, all-no-op, legacy complete and exact acceptance); IA36 owns durable migration; IA37 owns autonomous execution/review; IA38 consumes pure current attention and rail; IA39 proves every admitted/denied tuple and immutable history. No new WorkStatus/WorkOutcome.
