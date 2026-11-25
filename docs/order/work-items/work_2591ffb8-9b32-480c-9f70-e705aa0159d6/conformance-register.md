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
| C04 | Owner-level remediation disposition | READY_FOR_PLAN | Every confirmed finding has an owning layer/document/surface. Existing PLAN intentionally did not pre-authorize unknown remediation; exact remediation tasks may now be added. |
| C05 | Permanent conformance proof | READY_FOR_PLAN | Existing sensors were inspected. FP-F08-F11 need authority-aligned negative/noninterference or product-language proof; FP-F06/F07 need authority-applicability proof. |
| C06 | Bottom-up closure | BLOCKED | Requires C04/C05 remediation and proof, plus exact-final-head revalidation of PR #83 overlap. |

## 3. Current finding register

| Finding | Stream | State | Layer / canonical owner | Evidence | Required disposition |
|---|---|---|---|---|---|
| FP-F01 | C01 | CORRECTED_REVALIDATION_REQUIRED | P0 — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | The prior owner defined P0-P8 and several traceability consequences but lacked one proposition-level placement/derivation law. Commit `a97edef079c2bb868ce8665220602814a9bc7d41` adds the Order-owned placement test, downward derivation law, upstream-return rule and explicit restatement defect. | Revalidate the exact merged owner after PR #83 reconciliation; close only if the law survives without duplicate/contradictory wording. |
| FP-F02 | C01 | CORRECTED_REVALIDATION_REQUIRED | P1 — `GW-P1-CANONICAL-OWNERSHIP` + `GW-P1-EXPLICIT-FLOW`, owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | The prior P1 text owned semantic owner/mutation path and visible dependencies but did not expressly prohibit semantic use based only on carrier/field availability. Commit `a97edef079c2bb868ce8665220602814a9bc7d41` closes producer→projection→decision/consumer→presentation→mutation ownership and noninterference. | Revalidate after PR #83; retain existing stable P1 IDs and do not create another semantic-lifecycle rule. |
| FP-F03 | C05 | OPEN | P4/P8 proof — existing architecture/certification/browser-test owners | Existing tests prove module ownership and query/mutation placement but not field-level semantic noninterference. For example certification proves `OpenCodeAccountControl` is query-only but does not forbid `mutationBlockers` influencing its shell result; browser coverage proves Settings blocker behavior but not shell invariance. | For each mechanically checkable finding below, add positive authorized-use proof plus negative unauthorized-influence/product-language proof without making tests a second specification. |
| FP-F04 | C02 | ROUTED | P2 — `GW-DOC-SYSTEM-BRIEF-V1` | System Brief §6 reproduces the exact canonical WorkItem stage sequence and post-sign-off IMPLEMENT/MECHANICAL VERIFY/INDEPENDENT REVIEW sequence even though exact lifecycle semantics are owned by P3 `GW-DOC-WORK-LIFECYCLE-V1`. | Reduce P2 to the product-level governed-definition/authorization/verified-result intent and reference the P3 lifecycle owner for exact stages/sequence. |
| FP-F05 | C02 | ROUTED | P5 — `GW-DOC-TECHNICAL-DECISIONS-V1` D19 | D19 says the application-shell account control lists all saved accounts and supports Add/Switch/Rename. P3 `GW-FR-073` authorizes shell active-account visibility plus one management entry point; `GW-FR-091`/`GW-FR-095` make Settings the sole ordinary full-management home. | Correct D19 to the P3-authorized shell identity/navigation boundary; retain saved-account management in Settings. |
| FP-F06 | C02/C03 | ROUTED | P3/P6/P8 — `GW-DOC-LIFECYCLE-CONTEXT-V2`, `GW-DOC-CANONICAL-CONTRACTS-V2`, authority resolver/materializer | `pontivus-order.toml [authority]` selects current and retained V1 semantic owners together. `resolveProjectAuthority()` and `resolveStageContextState()` materialize every selected source for the stage, so current stages receive both versions. P3 says unrelated authority is omitted and “include everything” is forbidden. P6 currently requires every `refs` source to also be selected by `authority.p1-p6`, conflating referencability with active applicability. | Separate the canonical reference registry from default stage-applicable authority, preserve exact historical/versioned refs without auto-injecting them into ordinary current contexts, and add resolver/manifest fitness proving the distinction. |
| FP-F07 | C02/C03 | ROUTED | P3/P6/P8 — authority applicability | `authority.p4` selects OpenSpec, Spec Kit, Kiro and BMAD reference documents. Each explicitly owns only external prior-art facts and states that it does not own Order lifecycle/product/contract semantics, yet the stage resolver injects them into every DESIGN/PLAN/R3 authority package. | Remove automatic governing applicability for prior-art evidence; keep such sources exactly referenceable/material only when a governing Order owner actually depends on them. Prove evidence cannot become governing authority merely by manifest selection. |
| FP-F08 | C03 | ROUTED | P3/P4/P8 — `GW-FR-073`, `GW-FR-076`, Workbench/account projection, `ui/src/OpenCodeAccountControl.tsx` | The shell control derives “Needs attention” from `OpenCodeAccountState.mutationBlockers`. P3 gives blockers Add/Switch/Rename safety meaning in the account manager, while the shell owns active-account identity plus a management entry point. Settings’ blocker use is conformant; shell readiness dependence is not. | Make shell account presentation invariant to mutation blockers when active account identity/status are unchanged; retain blocker-dependent mutation admission/notice behavior in Settings. Add an explicit negative noninterference test. |
| FP-F09 | C03 | ROUTED | P3/P8 — `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-DOC-WORKBENCH-UX-V2`, queue diagnostics | Queue source diagnostics render raw `WorkItemSourceDiagnostic.code` such as `INVALID_SOURCE` as the leading ordinary label. P3 requires source path + actionable reason; Workbench P3 classifies raw technical identity as on-demand. Browser tests currently assert the raw code, thereby preserving the wrong presentation. | Lead with canonical human/actionable diagnostic meaning; move raw code to technical detail only if retained. Replace the browser assertion with human-meaning + raw-code-negative proof for ordinary presentation. |
| FP-F10 | C03 | ROUTED | P3/P4/P8 — account Settings presentation | OpenCode Settings correctly uses blocker facts to disable mutations and show human notices, but also permanently prints `ACTIVE_RUN`, `LOGIN_ATTEMPT_ACTIVE`, `ACCOUNT_MUTATION_ACTIVE` and uses raw login-attempt status as badge copy. P3 says provider/runtime mechanics are technical unless needed as the current blocker and ordinary surfaces use product-facing state. | Keep human blocker/status meaning in ordinary Settings presentation; move raw enum/status identity behind Technical details if useful. Add product-language regression proof. |
| FP-F11 | C03 | ROUTED | P3/P4/P8 — shared Workbench presentation / terminal result | `TerminalResult.tsx` constructs candidate-resource detail with `eventTag.replaceAll(...).toLowerCase()` and `role.toLowerCase()`, bypassing existing `runEventPresentation()`/`runRoleLabel()`. P3 explicitly classifies raw RunEvent tags/payloads as Technical. Shared event presentation also mechanically lowercases some completion enums. | Route ordinary event/role/outcome presentation through canonical human presentation functions; keep raw tags/payloads in Technical details. Add ordinary-surface negative proof against raw RunEvent enum leakage. |
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
| 6. OpenCode account/authentication/mutation-blocker state | AUDITED_WITH_FINDINGS | Settings mutation admission correctly owns blockers; shell unauthorized blocker influence is FP-F08 and raw Settings mechanics are FP-F10. |
| 7. Proposal/review/dialogue state | CONFORMANT | Proposal currentness/decision meaning derives from canonical RunEvents; target path is technical detail and proposal mutation ownership is singular. |
| 8. Terminal result/evidence/material maturity | AUDITED_WITH_FINDING | Governed outcome uses `workOutcomeProductLabel`; terminal resource metadata bypasses canonical presentation in FP-F11. |
| 9. Workbench application/global versus feature-local presentation | AUDITED_WITH_FINDING | Global account utility crosses into Settings-owned mutation-safety meaning in FP-F08; remaining inspected global/feature boundaries preserve their owner. |
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
