# Functional-pyramid conformance register

**WorkItem:** `work_2591ffb8-9b32-480c-9f70-e705aa0159d6`  
**Status:** ACTIVE — principle foundation corrected; conformance audit complete with routed findings  
**Canonicality:** This file is the **sole current-state owner for this WorkItem's conformance exercise**. It owns audit-stream status, finding status, evidence pointers, dispositions and closure evidence only. Permanent normative semantics remain at their `GW-*` canonical owners.

## 1. Control rules

1. Report current exercise state only from the registers in this file.
2. Historical narrative, commits, PR descriptions and prior model output are evidence, not current-state owners.
3. A finding is not closed by moving its symptom. Closure requires correction or explicit conformance proof at the finding's canonical owner.
4. A newly discovered material product/architecture/contract/implementation defect outside the exact authorized remediation surface is routed to the appropriate governed WorkItem/plan.
5. Current code/tests are evidence only and never define the desired baseline.
6. A change to an audited canonical owner or affected implementation surface after evidence was recorded sets the relevant finding/stream to `REVALIDATION_REQUIRED`.
7. PR #83 is a separate campaign branch. Its changes are not present on this branch unless reconciled by Git; its eventual merged bytes must be re-audited where they overlap.

## 2. Audit-stream register

| Stream | Scope | State | Current basis / next action |
|---|---|---|---|
| C01 | Pyramid principle completion | REVALIDATION_REQUIRED | The canonical P0 proposition-placement/derivation law and P1 semantic-lifecycle/noninterference clarification were applied at `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` on commit `a97edef079c2bb868ce8665220602814a9bc7d41`. PR #83 independently changes that owner, so final closure requires exact-candidate reconciliation/re-audit. |
| C02 | Canonical corpus placement/derivation | COMPLETE_WITH_FINDINGS | Material current P1-P6 owners were audited. Findings FP-F04-F07 identify the bounded exceptions; no broader document-layer collapse was found. |
| C03 | Semantic lifecycle closure | COMPLETE_WITH_FINDINGS | All ten priority semantic domains were audited. Findings FP-F08-F11 identify the confirmed semantic-use/presentation leaks; the remaining audited domains are explicitly recorded below as conformant. |
| C04 | Owner-level remediation disposition | IN_PROGRESS | FP-F04-F07 have exact owner corrections on this branch pending verification. FP-F08, FP-F09, FP-F10 and the terminal-resource part of FP-F11 are corrected on audited PR #83 head `24f86507df0459b4efb8454d2aa8e98850beaa60` and now require exact-candidate revalidation. The remaining shared `STAGE_COMPLETED` FP-F11 path stays with the separately governed later 0.6.0 Workbench phase and is not authorized by the current IA27/IA28 grant. |
| C05 | Permanent conformance proof | IN_PROGRESS | Focused FP-F06/FP-F07 shell/core/daemon/architecture proof has been added and awaits repository gates. PR #83 now contains explicit FP-F08 negative noninterference proof plus FP-F09/FP-F10/terminal-FP-F11 product-language proof; those remain revalidation-only until the exact final #83 candidate is fixed. |
| C06 | Bottom-up closure | BLOCKED | Requires C04/C05 remediation and proof, plus exact-final-head revalidation of PR #83 overlap. |

## 3. Current finding register

| Finding | Stream | State | Layer / canonical owner | Evidence | Required disposition |
|---|---|---|---|---|---|
| FP-F01 | C01 | CORRECTED_REVALIDATION_REQUIRED | P0 — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | The prior owner defined P0-P8 and several traceability consequences but lacked one proposition-level placement/derivation law. Commit `a97edef079c2bb868ce8665220602814a9bc7d41` adds the Order-owned placement test, downward derivation law, upstream-return rule and explicit restatement defect. | Revalidate the exact merged owner after PR #83 reconciliation; close only if the law survives without duplicate/contradictory wording. |
| FP-F02 | C01 | CORRECTED_REVALIDATION_REQUIRED | P1 — `GW-P1-CANONICAL-OWNERSHIP` + `GW-P1-EXPLICIT-FLOW`, owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | The prior P1 text owned semantic owner/mutation path and visible dependencies but did not expressly prohibit semantic use based only on carrier/field availability. Commit `a97edef079c2bb868ce8665220602814a9bc7d41` closes producer→projection→decision/consumer→presentation→mutation ownership and noninterference. | Revalidate after PR #83; retain existing stable P1 IDs and do not create another semantic-lifecycle rule. |
| FP-F03 | C05 | IN_PROGRESS | P4/P8 proof — existing architecture/certification/browser-test owners | The original enforcement gap is now concretely exercised: PR #83 certification forbids `mutationBlockers`/`Changes blocked` in `OpenCodeAccountControl`, while browser proof holds a READY account constant, varies `mutationBlockers = [ACTIVE_RUN]`, and proves shell output remains `Ready` while Settings remains blocked. FP-F06/FP-F07 receive separate identity/applicability proofs on PR #84. | Complete exact-candidate verification and extend the same positive+negative proof pattern only to the remaining mechanically checkable FP-F11 shared-event boundary; do not create a second normative field list. |
| FP-F04 | C02 | CORRECTED_REVALIDATION_REQUIRED | P2 — `GW-DOC-SYSTEM-BRIEF-V1` | System Brief §6 previously reproduced the exact P3 lifecycle. Commit `bc702c642fa8e54cc53fa5794bcc7a17c690a4f9` reduces it to P2 product intent and references the P3 lifecycle/validation owners. | Run canonical documentation/architecture fitness; revalidate after any conflicting branch reconciliation. |
| FP-F05 | C02 | CORRECTED_REVALIDATION_REQUIRED | P5 — `GW-DOC-TECHNICAL-DECISIONS-V1` D19 | D19 previously assigned Add/Switch/Rename management to the shell. Commit `8ca1491edb6d92614098f9fe26f595c870a704b6` limits the shell to active-account identity/readiness + Settings entry and leaves full management at the P3 Settings owner. | Run documentation/architecture fitness and revalidate against the exact 0.6.0 authority package. |
| FP-F06 | C02/C03 | CORRECTED_REVALIDATION_REQUIRED | P3/P6/P8 — `GW-DOC-LIFECYCLE-CONTEXT-V2`, `GW-DOC-CANONICAL-CONTRACTS-V2`, authority resolver/materializer | P6 now states that `[refs]` grants exact identity only; root active authority no longer includes retained V1 owners; `src/shell/project.ts` validates ref files without requiring active selection; `validateTaskDefinitions()` rejects exact task refs absent from the material set. Focused core/shell/daemon/architecture proof was added. | Pass typecheck/architecture/test/build/browser gates and independently verify current/retained refs still resolve exactly while inactive refs stay out of ordinary stage context. |
| FP-F07 | C02/C03 | CORRECTED_REVALIDATION_REQUIRED | P3/P6/P8 — authority applicability | Root `authority.p4` no longer selects OpenSpec, Spec Kit, Kiro or BMAD; their exact stable/versioned refs remain intact. Architecture fitness now rejects `GW-DOC-REF-*` prior-art owners as default active authority and core/daemon proof distinguishes inactive refs from active projection. | Pass exact-candidate gates and verify no reference-only prior-art source appears in ordinary DESIGN/PLAN/R3 context solely through `[refs]`. |
| FP-F08 | C03 | REVALIDATION_REQUIRED | P3/P4/P8 — `GW-FR-073`, `GW-FR-076`, Workbench/account projection, `ui/src/OpenCodeAccountControl.tsx` | PR #83 head `24f86507df0459b4efb8454d2aa8e98850beaa60` removes all `mutationBlockers` dependency from `useOpenCodeAccountControl`. Certification explicitly forbids both `mutationBlockers` and `Changes blocked`. Browser proof uses a READY active account with `mutationBlockers: [ACTIVE_RUN]`, expects the toolbar to remain `Ready`, and independently proves Settings mutation admission remains blocked with the human notice. The campaign §17A grant expressly authorizes this IA28 account-adapter correction. | Revalidate these exact implementation and negative-proof propositions on the eventual PR #83 candidate; no duplicate change is permitted on PR #84. |
| FP-F09 | C03 | REVALIDATION_REQUIRED | P3/P8 — `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-DOC-WORKBENCH-UX-V2`, queue diagnostics | Baseline rendered raw diagnostic code. PR #83 head `4f7c55cb848f2e6da74ce5ca6e5208e038cb96c9` now asserts ordinary source diagnostics do **not** contain `INVALID_SOURCE` and do contain path + actionable human reason. | Revalidate on the exact eventual PR #83/merged candidate; do not duplicate the UI change on this branch. |
| FP-F10 | C03 | REVALIDATION_REQUIRED | P3/P4/P8 — account Settings presentation | Baseline exposed raw blocker/login enums. PR #83 head `4f7c55cb848f2e6da74ce5ca6e5208e038cb96c9` uses `blockerText(...)`, `loginStatusText(...)` and human account status; the raw permanent blocker list is absent. | Revalidate on the exact eventual PR #83/merged candidate; do not duplicate the UI change on this branch. |
| FP-F11 | C03 | ROUTED | P3/P4/P8 — shared Workbench presentation / terminal result | Baseline terminal resources mechanically exposed event/role enums. PR #83 head now uses `runRoleLabel(...)` + `Verified implementation evidence`, and certification forbids `candidate.eventTag.replaceAll`. However shared `STAGE_COMPLETED` presentation still mechanically formats `completion.outcome`, so the finding is only partially corrected. | Revalidate terminal correction on the exact eventual PR #83 candidate and close the remaining shared-event outcome presentation at the 0.6.0 Workbench owner with product-language/noninterference proof. |
| FP-D01 | Dependency | REVALIDATION_REQUIRED | `docs/governance/systems-governance.md` | PR #83 independently changes this canonical file for the 0.6.0 campaign. This branch begins from `master` and must not infer those bytes. | Reconcile/re-audit the exact final candidate before C01/C06 closure. |

## 4. Canonical corpus inventory

This is an audit inventory, not a replacement authority map. Canonical identity continues to resolve through `pontivus-order.toml [refs]`.

| Order layer | Material owners audited | C02 result |
|---|---|---|
| P1 | `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, `GW-DOC-MINIMUM-CHANGE-V1`, `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`, agent operating consequences | AUDITED — P1 structure/ownership is sound after FP-F01/FP-F02 correction; retained-version applicability is captured by FP-F06. |
| P2 | `GW-DOC-SYSTEM-BRIEF-V1`, `GW-DOC-PRODUCT-IDENTITY-V1` | AUDITED — FP-F04 is the material placement/restatement defect. |
| P3 | `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-SPECIFICATION-STANDARD-V2`, `GW-DOC-VALIDATION-STANDARD-V1`, `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V2`, WorkItem/Workbench/installation functional owners | AUDITED — ownership boundaries and upward traceability are generally explicit; FP-F05-F11 use these owners as governing evidence. FP-F06/FP-F07 show applicability/materialization violating P3 context rules, not a missing P3 rule. |
| P4 | `GW-DOC-TECHNICAL-ARCHITECTURE-V2`, execution/OpenCode/Workbench/theme architecture and current external-fact constraints | AUDITED — core ownership/dependency boundaries are generally sound; FP-F07 is erroneous applicability of evidence-only reference facts rather than those reference documents owning Order semantics. |
| P5 | `GW-DOC-TECHNICAL-DECISIONS-V1` | AUDITED — FP-F05 is the confirmed lower-layer contradiction. |
| P6 | `GW-DOC-CANONICAL-CONTRACTS-V2` | AUDITED — canonical type/no-DTO posture is sound; FP-F06/FP-F07 expose a manifest-contract applicability/reference-registry conflation. |

P7/P8 are audited in C06 against the applicable current WorkItem/task and implementation evidence rather than treated as permanent canonical authority.

## 5. C03 semantic-domain audit

| Domain | Result | Evidence / finding |
|---|---|---|
| 1. WorkItem lifecycle/status/outcome and derived workflow presentation | AUDITED_WITH_PRESENTATION_EXCEPTION | Core lifecycle transitions/current attention are canonically derived. Shared presentation uses human mappings in most places; raw/mechanical outcome presentation is included in FP-F11. |
| 2. R3 readiness and return ownership | CONFORMANT | `ReadinessWorkspace` derives verdict from canonical R3 completion and uses `readinessOutcomeLabel`; technical artifact path/hash are behind Technical details. |
| 3. Approval/currentness/package identity | CONFORMANT | `SignoffReview` leads with readiness/currentness/task meaning and keeps package/source/baseline identity behind Technical details. |
| 4. ExecutionTask/Run/RunEvent execution and validation meaning | AUDITED_WITH_FINDING | Current execution owner is derived independently of historical selection and technical IDs/session/context are disclosed technically. Raw event/role presentation leakage is FP-F11. |
| 5. Project/repository/configuration/readiness state | AUDITED_WITH_FINDINGS | Installation readiness blockers are humanized and route to owning Settings sections. Source diagnostic raw-code leakage is FP-F09; authority applicability defects are FP-F06/FP-F07. |
| 6. OpenCode account/authentication/mutation-blocker state | AUDITED_WITH_FINDINGS | Settings mutation admission owns blockers. FP-F08 and FP-F10 are corrected on audited PR #83 head `24f86507...` with explicit noninterference/product-language proof; exact-final-candidate revalidation remains required. |
| 7. Proposal/review/dialogue state | CONFORMANT | Proposal currentness/decision meaning derives from canonical RunEvents; target path is technical detail and proposal mutation ownership is singular. |
| 8. Terminal result/evidence/material maturity | AUDITED_WITH_FINDING | Governed outcome uses `workOutcomeProductLabel`; terminal resource metadata bypasses canonical presentation in FP-F11. |
| 9. Workbench application/global versus feature-local presentation | AUDITED_WITH_FINDING | The FP-F08 shell/Settings semantic leak is corrected on audited PR #83 head with negative noninterference proof. Exact-final-candidate revalidation remains required; remaining inspected global/feature boundaries preserve their owner. |
| 10. Responsive representation | CONFORMANT | `WorkbenchLayout`/`WorkbenchMasterDetail` change LayoutPanel/Drawer placement under viewport constraints but retain the same semantic content/owner; no viewport-derived workflow meaning was found. |

## 6. Enforcement audit

Current proof is structurally useful but incomplete for semantic noninterference:

- architecture/certification tests prove module ownership, allowed mutation locations and many technical-detail boundaries;
- the account certification test proves the shell utility is query-only but does not constrain which `OpenCodeAccountState` facts may influence shell semantics;
- the account browser test proves mutation blockers affect Settings controls/notices but does not prove the shell result is invariant to those blockers;
- the queue browser test currently asserts `INVALID_SOURCE`, so it encodes the implementation leak rather than the product-language contract;
- terminal certification proves the final WorkItem outcome uses `workOutcomeProductLabel`, but does not constrain candidate-resource event/role metadata;
- architecture tests require every manifest `refs` source to also be selected by `authority.p1-p6`, which contributes to FP-F06/FP-F07 by conflating exact referencability with automatic stage applicability.

For mechanically checkable semantic boundaries, closure therefore requires:

```text
authorized facts fixed
+ unauthorized facts varied
=> consumer semantic output unchanged
```

and ordinary product surfaces must prove raw technical enum/code identity absent unless the owning requirement explicitly makes it task-relevant.

## 7. Finding record contract

Every finding remains traceable by stable ID and records:

- exact canonical source/proposition or semantic fact;
- assigned and correct owning layer;
- defect class;
- downstream affected owners/surfaces;
- required owner-level disposition;
- required verification/noninterference proof where applicable;
- state and closure evidence.

A finding state is one of `OPEN | ROUTED | CORRECTED_REVALIDATION_REQUIRED | REVALIDATION_REQUIRED | CLOSED`.

## 8. Closure criteria

C06 may become COMPLETE only when:

- C01 is CLOSED on the exact final canonical bytes;
- FP-F04-F11 are corrected at their canonical owners or explicitly transferred to separately governed remediation whose completion is a declared dependency rather than falsely counted as this WorkItem's completion;
- every correction has required architecture/certification/noninterference proof;
- the authority resolver distinguishes reference availability from active applicability and does not inject historical/prior-art authority into ordinary current contexts unless expressly applicable;
- no audit-created shadow specification or duplicate semantic owner exists;
- no Span runtime/configuration/dependency was added;
- PR #83 overlap has been reconciled and affected evidence re-established on the exact final candidate.

## 9. Verification register

| Verification | Candidate / run | State | Evidence / disposition |
|---|---|---|---|
| V01 — PR metadata preflight | PR #84 head `c39f7d0f46740931a444519e943588083db3d694`, run 2778 / `45548515192` | SUPERSEDED_EVENT | The first PR event carried `Intended release train` rather than the required `Target release` wording. PR #84 body was corrected to `Target release: **0.6.0**`. Re-running the same Actions run still read the immutable original `GITHUB_EVENT_PATH` payload, so it repeated the same preflight failure. The verifier is correct and unchanged. This register update intentionally creates a new PR head/synchronize event so verification can consume the corrected live PR metadata. |
| V02 — substantive repository gates | PR #84 candidates through `6b49346dc578692dbd03825156440a16c364f4ec` | FAILED_FIXTURE_ONLY | Fresh PR metadata and dependency-lock passed. Typecheck then exposed only newly added test-fixture defects: first malformed nested-fence quoting, then a strict local object assertion. Both were corrected without changing production semantics; next exact head must rerun the full gate chain. |

