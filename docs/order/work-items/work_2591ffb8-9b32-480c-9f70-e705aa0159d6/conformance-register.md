# Functional-pyramid conformance register

**WorkItem:** `work_2591ffb8-9b32-480c-9f70-e705aa0159d6`  
**Status:** ACTIVE — governance/document corrections ready for stacked verification; one IA30 finding routed  
**Canonicality:** This file is the **sole current-state owner for this WorkItem's conformance exercise**. It owns audit-stream status, finding status, evidence pointers, dispositions and closure evidence only. Permanent normative semantics remain at their `GW-*` canonical owners.

## 1. Control rules

1. Report current exercise state only from the registers in this file.
2. Historical narrative, commits, PR descriptions and prior model output are evidence, not current-state owners.
3. A finding is not closed by moving its symptom. Closure requires correction or explicit conformance proof at the finding's canonical owner.
4. A newly discovered material product/architecture/contract/implementation defect outside the exact authorized remediation surface is routed to the appropriate governed WorkItem/plan.
5. Current code/tests are evidence only and never define the desired baseline.
6. A change to an audited canonical owner or affected implementation surface after evidence was recorded sets the relevant finding/stream to `REVALIDATION_REQUIRED`.
7. PR #84 is stacked on the exact PR #83 campaign head. PR #83 remains the owner of campaign state and bounded Workbench realization; PR #84 owns only its incremental conformance delta. Any later #83 head change sets affected #84 findings/evidence to `REVALIDATION_REQUIRED`.

## 2. Audit-stream register

| Stream | Scope | State | Current basis / next action |
|---|---|---|---|
| C01 | Pyramid principle completion | REVALIDATION_REQUIRED | The canonical P0 proposition-placement/derivation law and P1 semantic-lifecycle/noninterference clarification were applied at `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` on commit `a97edef079c2bb868ce8665220602814a9bc7d41`. PR #83 independently changes that owner, so final closure requires exact-candidate reconciliation/re-audit. |
| C02 | Canonical corpus placement/derivation | COMPLETE_WITH_FINDINGS | Material current P1-P6 owners were audited. Findings FP-F04-F07 identify the bounded exceptions; no broader document-layer collapse was found. |
| C03 | Semantic lifecycle closure | COMPLETE_WITH_FINDINGS | All ten priority semantic domains were audited. Findings FP-F08-F11 identify the confirmed semantic-use/presentation leaks; the remaining audited domains are explicitly recorded below as conformant. |
| C04 | Owner-level remediation disposition | IN_PROGRESS | FP-F04/FP-F05 are corrected on PR #84 pending stacked verification. FP-F06/FP-F07 are CLOSED as stale-baseline findings because exact-current PR #83 already implements/proves the correct reachable-authority/material-authority split. FP-F08-F10 and the IA33 terminal portion of FP-F11 are proven on exact PR #83 head `24f86507df0459b4efb8454d2aa8e98850beaa60` / run 2780. The remaining shared `STAGE_COMPLETED` FP-F11 path is routed to post-signoff IA30, which the current §17A grant expressly excludes. |
| C05 | Permanent conformance proof | IN_PROGRESS | PR #83 run 2780 is green across metadata, dependency-lock, typecheck, architecture, unit, build, bounded evidence, full browser and rendered acceptance, including FP-F08 negative noninterference and FP-F09/FP-F10/IA33-FP-F11 product-language proof. PR #84 now adds only a narrow architecture sensor for the new P0/P1 ownership law; stacked exact-candidate verification remains. |
| C06 | Bottom-up closure | BLOCKED | Requires C04/C05 remediation and proof, plus exact-final-head revalidation of PR #83 overlap. |

## 3. Current finding register

| Finding | Stream | State | Layer / canonical owner | Evidence | Required disposition |
|---|---|---|---|---|---|
| FP-F01 | C01 | CORRECTED_REVALIDATION_REQUIRED | P0 — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | The prior owner defined P0-P8 and several traceability consequences but lacked one proposition-level placement/derivation law. Commit `a97edef079c2bb868ce8665220602814a9bc7d41` adds the Order-owned placement test, downward derivation law, upstream-return rule and explicit restatement defect. | Revalidate the exact merged owner after PR #83 reconciliation; close only if the law survives without duplicate/contradictory wording. |
| FP-F02 | C01 | CORRECTED_REVALIDATION_REQUIRED | P1 — `GW-P1-CANONICAL-OWNERSHIP` + `GW-P1-EXPLICIT-FLOW`, owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | The prior P1 text owned semantic owner/mutation path and visible dependencies but did not expressly prohibit semantic use based only on carrier/field availability. Commit `a97edef079c2bb868ce8665220602814a9bc7d41` closes producer→projection→decision/consumer→presentation→mutation ownership and noninterference. | Revalidate after PR #83; retain existing stable P1 IDs and do not create another semantic-lifecycle rule. |
| FP-F03 | C05 | IN_PROGRESS | P4/P8 proof — existing architecture/certification/browser-test owners | The original enforcement gap is now concretely exercised: PR #83 certification forbids `mutationBlockers`/`Changes blocked` in `OpenCodeAccountControl`, while browser proof holds a READY account constant, varies `mutationBlockers = [ACTIVE_RUN]`, and proves shell output remains `Ready` while Settings remains blocked. FP-F06/FP-F07 receive separate identity/applicability proofs on PR #84. | Complete exact-candidate verification and extend the same positive+negative proof pattern only to the remaining mechanically checkable FP-F11 shared-event boundary; do not create a second normative field list. |
| FP-F04 | C02 | CORRECTED_REVALIDATION_REQUIRED | P2 — `GW-DOC-SYSTEM-BRIEF-V1` | System Brief §6 previously reproduced the exact P3 lifecycle. Commit `bc702c642fa8e54cc53fa5794bcc7a17c690a4f9` reduces it to P2 product intent and references the P3 lifecycle/validation owners. | Run canonical documentation/architecture fitness; revalidate after any conflicting branch reconciliation. |
| FP-F05 | C02 | CORRECTED_REVALIDATION_REQUIRED | P5 — `GW-DOC-TECHNICAL-DECISIONS-V1` D19 | D19 previously assigned Add/Switch/Rename management to the shell. Commit `8ca1491edb6d92614098f9fe26f595c870a704b6` limits the shell to active-account identity/readiness + Settings entry and leaves full management at the P3 Settings owner. | Run documentation/architecture fitness and revalidate against the exact 0.6.0 authority package. |
| FP-F06 | C02/C03 | CLOSED | P3/P4/P8 — current PR #83 G-F13/C22-F02 authority/context foundation | The independent-master audit observed retained sources in the reachable authority graph and inferred they were all productive material. Exact-current PR #83 disproves that inference: `resolveCurrentStageAuthority()` resolves the full reachable graph, while `applicableAuthorityPaths(...)` derives the stage/schema/explicit-ref/concern subset and `resolveStageContextState()` materializes only that subset. Daemon proof shows unrelated selected P2 sources absent from productive R1 context and separately proves `change-v2` selects current lifecycle-context while historical `change-v1` selects the retained v1 source. Run 2780 is green. | No PR #84 runtime/P6/manifest correction. Preserve G-F13/C22-F02 and revalidate it unchanged on the stacked candidate. |
| FP-F07 | C02/C03 | CLOSED | P3/P4/P8 — reachable reference-fact authority versus material stage context | The independent-master audit treated OpenSpec/Spec Kit/Kiro/BMAD layer reachability as automatic productive authority. Current PR #83 makes reachability and materiality distinct: reference-fact owners remain in the reachable graph so exact refs/precedence remain resolvable, but only stage-template refs, explicit upstream refs, resolved P1 rules and applicable concern authority enter productive material. The same G-F13/C22-F02 implementation/proof closes this finding. | No PR #84 authority-array deletion or new registry. Preserve current applicability derivation and exact-reference reachability. |
| FP-F08 | C03 | CORRECTED_REVALIDATION_REQUIRED | P3/P4/P8 — `GW-FR-073`, `GW-FR-076`, Workbench/account projection, `ui/src/OpenCodeAccountControl.tsx` | PR #83 exact head `24f86507df0459b4efb8454d2aa8e98850beaa60` removes all `mutationBlockers` dependency from `useOpenCodeAccountControl`. Certification forbids both `mutationBlockers` and `Changes blocked`. Browser proof holds a READY active account constant while setting `mutationBlockers: [ACTIVE_RUN]`, proves the toolbar remains `Ready`, and independently proves Settings mutation admission remains blocked with the human notice. PR Verification run 2780 / `45549049727` passes metadata, dependency-lock, typecheck, architecture, full unit test, build, release-packager, bounded IA27/IA28 rendered evidence, full browser, and rendered acceptance. | Correction is proven on the current exact PR #83 candidate. Revalidate only if the candidate changes or after merge/reconciliation before C06 closure; no duplicate change is permitted on PR #84. |
| FP-F09 | C03 | CORRECTED_REVALIDATION_REQUIRED | P3/P8 — `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-DOC-WORKBENCH-UX-V2`, queue diagnostics | PR #83 exact head `24f86507df0459b4efb8454d2aa8e98850beaa60` asserts ordinary source diagnostics do **not** contain `INVALID_SOURCE` and do contain path + actionable human reason. The same exact candidate passes full browser and rendered acceptance in run 2780 / `45549049727`. | Correction is proven on the current exact PR #83 candidate; revalidate if that candidate changes or after reconciliation. Do not duplicate the UI change on PR #84. |
| FP-F10 | C03 | CORRECTED_REVALIDATION_REQUIRED | P3/P4/P8 — account Settings presentation | PR #83 exact head `24f86507df0459b4efb8454d2aa8e98850beaa60` uses `blockerText(...)`, `loginStatusText(...)` and human account status; the raw permanent blocker list is absent. The exact candidate passes full browser and rendered acceptance in run 2780 / `45549049727`. | Correction is proven on the current exact PR #83 candidate; revalidate if that candidate changes or after reconciliation. Do not duplicate the UI change on PR #84. |
| FP-F11 | C03 | ROUTED | P3/P4/P8 — IA30 productive-stage presentation + IA33 terminal result | Baseline terminal resources mechanically exposed event/role enums. PR #83 head `24f86507df0459b4efb8454d2aa8e98850beaa60` now uses `runRoleLabel(...)` + `Verified implementation evidence`, and certification forbids `candidate.eventTag.replaceAll`, so the IA33 terminal-resource portion is corrected pending revalidation. Shared `STAGE_COMPLETED` presentation still mechanically formats `completion.outcome`. The canonical 0.6.0 PLAN assigns `workbench-presentation.ts`/productive-stage activity and timeline reconstruction to post-signoff IA30; §17A explicitly excludes IA30-IA34 from the current bounded grant. | Revalidate the IA33 terminal correction on the exact eventual PR #83 candidate. Leave the remaining shared-event outcome path routed to IA30 and correct it only after normal sign-off/post-signoff authorization, with product-language + negative raw-enum proof. |
| FP-D01 | Dependency | REVALIDATION_REQUIRED | PR #83 0.6.0 campaign foundation + `docs/governance/systems-governance.md` | PR #84 has now been stacked as a real merge descendant of exact green PR #83 head `24f86507df0459b4efb8454d2aa8e98850beaa60`; the retargeted PR diff contains exactly 11 intended files and no stale P6/manifest/runtime authority-materiality changes. | Run the complete stacked-candidate verification. If PR #83 moves, restack/revalidate before C01/C06 closure. |

## 4. Canonical corpus inventory

This is an audit inventory, not a replacement authority map. Canonical identity continues to resolve through `pontivus-order.toml [refs]`.

| Order layer | Material owners audited | C02 result |
|---|---|---|
| P1 | `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, `GW-DOC-MINIMUM-CHANGE-V1`, `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`, agent operating consequences | AUDITED — P1 structure/ownership is sound after FP-F01/FP-F02 correction; authority reachability/materiality is already closed by current PR #83 G-F13/C22-F02. |
| P2 | `GW-DOC-SYSTEM-BRIEF-V1`, `GW-DOC-PRODUCT-IDENTITY-V1` | AUDITED — FP-F04 is the material placement/restatement defect. |
| P3 | `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-SPECIFICATION-STANDARD-V2`, `GW-DOC-VALIDATION-STANDARD-V1`, `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V2`, WorkItem/Workbench/installation functional owners | AUDITED — ownership boundaries and upward traceability are explicit. Exact-current PR #83 conforms to lifecycle-context minimum-sufficient materiality; FP-F06/FP-F07 are closed stale-baseline findings. |
| P4 | `GW-DOC-TECHNICAL-ARCHITECTURE-V2`, execution/OpenCode/Workbench/theme architecture and current external-fact constraints | AUDITED — core ownership/dependency boundaries are sound for this exercise; reference-fact reachability does not itself enter productive material under current PR #83 applicability resolution. |
| P5 | `GW-DOC-TECHNICAL-DECISIONS-V1` | AUDITED — FP-F05 is the confirmed lower-layer contradiction. |
| P6 | `GW-DOC-CANONICAL-CONTRACTS-V2` | AUDITED — canonical type/no-DTO posture and ref reachability contract are sound on current PR #83; materiality is derived downstream by lifecycle-context authority projection rather than by deleting reachable historical/reference identities. |

P7/P8 are audited in C06 against the applicable current WorkItem/task and implementation evidence rather than treated as permanent canonical authority.

## 5. C03 semantic-domain audit

| Domain | Result | Evidence / finding |
|---|---|---|
| 1. WorkItem lifecycle/status/outcome and derived workflow presentation | AUDITED_WITH_PRESENTATION_EXCEPTION | Core lifecycle transitions/current attention are canonically derived. Shared presentation uses human mappings in most places; raw/mechanical outcome presentation is included in FP-F11. |
| 2. R3 readiness and return ownership | CONFORMANT | `ReadinessWorkspace` derives verdict from canonical R3 completion and uses `readinessOutcomeLabel`; technical artifact path/hash are behind Technical details. |
| 3. Approval/currentness/package identity | CONFORMANT | `SignoffReview` leads with readiness/currentness/task meaning and keeps package/source/baseline identity behind Technical details. |
| 4. ExecutionTask/Run/RunEvent execution and validation meaning | AUDITED_WITH_FINDING | Current execution owner is derived independently of historical selection and technical IDs/session/context are disclosed technically. Raw event/role presentation leakage is FP-F11. |
| 5. Project/repository/configuration/readiness state | AUDITED_WITH_FINDINGS | Installation readiness blockers are humanized and route to owning Settings sections. FP-F09 is corrected/proven on PR #83. FP-F06/FP-F07 are closed stale-baseline findings after exact-current reachability/materiality revalidation. |
| 6. OpenCode account/authentication/mutation-blocker state | AUDITED_WITH_FINDINGS | Settings mutation admission owns blockers. FP-F08 and FP-F10 are corrected on audited PR #83 head `24f86507...` with explicit noninterference/product-language proof; exact-final-candidate revalidation remains required. |
| 7. Proposal/review/dialogue state | CONFORMANT | Proposal currentness/decision meaning derives from canonical RunEvents; target path is technical detail and proposal mutation ownership is singular. |
| 8. Terminal result/evidence/material maturity | AUDITED_WITH_FINDING | Governed outcome uses `workOutcomeProductLabel`; the IA33 terminal-resource FP-F11 leak is corrected on audited PR #83 head and now requires exact-candidate revalidation. The remaining FP-F11 path is productive-stage/shared-event presentation owned by IA30, not Terminal Result. |
| 9. Workbench application/global versus feature-local presentation | AUDITED_WITH_FINDING | The FP-F08 shell/Settings semantic leak is corrected on audited PR #83 head with negative noninterference proof. Exact-final-candidate revalidation remains required; remaining inspected global/feature boundaries preserve their owner. |
| 10. Responsive representation | CONFORMANT | `WorkbenchLayout`/`WorkbenchMasterDetail` change LayoutPanel/Drawer placement under viewport constraints but retain the same semantic content/owner; no viewport-derived workflow meaning was found. |

## 6. Enforcement audit

The audit now distinguishes three proof classes.

### Authority reachability versus materiality

Current PR #83 already proves the correct lifecycle boundary:

- the reachable graph retains stable/current and retained exact-version authority needed for canonical identity and historical schema pins;
- `applicableAuthorityPaths(...)` derives materiality from stage-template authority, explicit upstream refs, resolved P1 rules and applicable concerns;
- unrelated reachable sources are absent from productive material;
- current-v2 and historical-v1 schemas positively prove different exact lifecycle-context pins;
- unresolved pinned authority blocks before provider use.

FP-F06/FP-F07 therefore require **preservation**, not a new PR #84 implementation.

### Semantic noninterference/product language

PR #83 exact head `24f86507df0459b4efb8454d2aa8e98850beaa60` and green run 2780 prove:

- FP-F08: READY account + changed Settings-only `mutationBlockers` leaves shell account result invariant while Settings mutation admission changes;
- FP-F09: ordinary source diagnostics omit raw `INVALID_SOURCE` and retain actionable human meaning;
- FP-F10: account blocker/login state is humanized;
- IA33 FP-F11: terminal evidence uses canonical role/product wording rather than raw enum prettification.

The remaining shared-event FP-F11 path is explicitly routed to post-signoff IA30.

### Governance-law permanence

PR #84 adds one narrow architecture sensor that proves:

- the proposition-placement law remains in `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
- semantic-lifecycle/noninterference remains a clarification of the existing canonical-ownership/explicit-flow rules;
- the stable P1 ids remain;
- no duplicate `GW-P1-SEMANTIC-LIFECYCLE` / `GW-P1-FUNCTIONAL-PYRAMID` / `GW-P1-NONINTERFERENCE` rule identity is introduced.

Surface-specific allowed facts remain owned and tested at their P3/P4/DESIGN/consumer owners.

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
- the exact-current PR #83 reachable-authority/material-authority split survives unchanged and its current-v2/historical-v1 proof remains green;
- no audit-created shadow specification or duplicate semantic owner exists;
- no Span runtime/configuration/dependency was added;
- PR #83 overlap has been reconciled and affected evidence re-established on the exact final candidate.

## 9. Verification register

| Verification | Candidate / run | State | Evidence / disposition |
|---|---|---|---|
| V01 — PR metadata preflight | PR #84 original event / run 2778 | SUPERSEDED_EVENT | Initial PR body used the wrong target-release label. Live metadata was corrected; the verifier itself was not weakened. |
| V02 — early #84 fixture verification | superseded independent heads | SUPERSEDED | Typecheck exposed only new test-fixture quoting/cast defects; both were corrected without production-semantic change. |
| V03 — independent-master #84 verification | head `a981ab54533cf949c4bb312011c205a2c4cfcef3`, run 2786 | BLOCKED_BY_BRANCH_TOPOLOGY | Release metadata, dependency-lock and typecheck PASS; 12/13 architecture checks PASS. The only failure is the 0.6.0 campaign G0 ancestry sensor because an independent master-based #84 branch does not contain the in-flight #83 campaign lineage. The sensor is correct and must not be weakened. |
| V04 — exact PR #83 inherited proof | head `24f86507df0459b4efb8454d2aa8e98850beaa60`, run 2780 / `45549049727` | PASS | Every step passes: metadata, dependency-lock, typecheck, architecture, full unit, build, diagnostics, bounded evidence authorization/capture, release packager, full browser and rendered acceptance. This proves the inherited G-F13/C22-F02 and FP-F08-F10/IA33-FP-F11 corrections on that exact candidate. |
| V05 — stacked PR #84 final candidate | stacked tree on exact #83 head `24f86507df0459b4efb8454d2aa8e98850beaa60` | VERIFICATION_VIEW_ACTIVE | Incremental diff is exactly 11 files before this state-only register update: CHANGELOG, P2/P5/P0-P1 owners, the six-file WorkItem package, and `tests/architecture.test.ts`; no stale FP-F06/FP-F07 runtime/manifest/P6 changes remain. PR #84 is temporarily targeted at `master` solely because `.github/workflows/ci.yml` triggers there. This state-only update creates the `synchronize` event for the unchanged governed implementation/document candidate. After verification the PR returns to the #83 base. |
