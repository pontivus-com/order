# Functional-pyramid conformance register

**WorkItem:** `work_2591ffb8-9b32-480c-9f70-e705aa0159d6`  
**Status:** ACTIVE — affected prior combined evidence requires revalidation on the consolidated campaign candidate; the routed IA30 FP-F11 shared-event dependency remains open
**Canonicality:** This file is the **sole current-state owner for this WorkItem's conformance exercise**. It owns audit-stream status, finding status, evidence pointers, dispositions and closure evidence only. Permanent normative semantics remain at their `GW-*` canonical owners.

## 1. Control rules

1. Report current exercise state only from the registers in this file.
2. Historical narrative, commits, PR descriptions and prior model output are evidence, not current-state owners.
3. A finding is not closed by moving its symptom. Closure requires correction or explicit conformance proof at the finding's canonical owner.
4. A newly discovered material product/architecture/contract/implementation defect outside the exact authorized remediation surface is routed to the appropriate governed WorkItem/plan.
5. Current code/tests are evidence only and never define the desired baseline.
6. A change to an audited canonical owner or affected implementation surface after evidence was recorded sets the relevant finding/stream to `REVALIDATION_REQUIRED`.
7. PR #83 remains the owner of campaign state and bounded Workbench realization; PR #84 owns only its incremental conformance delta, staged for integration with #85 through PR #86 targeting #83's working branch. Any later campaign-head or affected authority change sets affected conformance findings/evidence to `REVALIDATION_REQUIRED`; the existing #84 verification is historical until exact consolidated revalidation.

## 2. Audit-stream register

| Stream | Scope | State | Current basis / next action |
|---|---|---|---|
| C01 | Pyramid principle completion | REVALIDATION_REQUIRED | Exact prior evidence: The P0 proposition-placement/derivation law and P1 semantic-lifecycle/noninterference clarification survive the exact reconciled #83+#84 candidate. PR #84 head `e8c94a3a99fe2f5b2db8ba664482beaa853bd54f` is a descendant of exact green #83 head `f307a6e04385e97b1b6e54a043155e9e33ec0f60`; combined run 2805 / `45558988669` passes architecture and the complete verification lane. Current consolidated candidate requires affected revalidation under rules 6–7; FP-F11 remains routed to IA30. |
| C02 | Canonical corpus placement/derivation | REVALIDATION_REQUIRED | Exact prior evidence: Material current P1-P6 owners were audited. Findings FP-F04-F07 identify the bounded exceptions; no broader document-layer collapse was found. Current consolidated candidate requires affected revalidation under rules 6–7; FP-F11 remains routed to IA30. |
| C03 | Semantic lifecycle closure | REVALIDATION_REQUIRED | Exact prior evidence: All ten priority semantic domains were audited. Findings FP-F08-F11 identify the confirmed semantic-use/presentation leaks; the remaining audited domains are explicitly recorded below as conformant. Current consolidated candidate requires affected revalidation under rules 6–7; FP-F11 remains routed to IA30. |
| C04 | Owner-level remediation disposition | REVALIDATION_REQUIRED | Exact prior evidence: FP-F04/FP-F05 are corrected and revalidated on exact combined #83+#84 run 2805. FP-F06/FP-F07 remain CLOSED as stale-baseline findings because #83 owns/proves the reachable-authority/material-authority split. FP-F08-F10 and the IA33 terminal portion of FP-F11 remain CLOSED on the combined candidate. The only unresolved conformance finding is the shared `STAGE_COMPLETED` FP-F11 path, explicitly routed to post-signoff IA30. Current consolidated candidate requires affected revalidation under rules 6–7; FP-F11 remains routed to IA30. |
| C05 | Permanent conformance proof | REVALIDATION_REQUIRED | Exact prior evidence: Exact combined #84 head `e8c94a3a99fe2f5b2db8ba664482beaa853bd54f`, run 2805 / `45558988669`, passes metadata, dependency-lock, typecheck, architecture including the new P0/P1 ownership sensor, full unit, build, diagnostics, bounded evidence, release packaging, full browser and rendered acceptance. No #84 UI/browser/runtime/P6/manifest mutation is present. Current consolidated candidate requires affected revalidation under rules 6–7; FP-F11 remains routed to IA30. |
| C06 | Bottom-up closure | REVALIDATION_REQUIRED | Exact prior evidence: Exact #83+#84 verification is green and all findings inside the authorized #84 surface are corrected/proven. The sole remaining dependency is the shared-event FP-F11 path explicitly routed to authorized post-signoff IA30; PR #84 itself has no UI/browser mutation and does not claim that later IA30 work complete. Current consolidated candidate requires affected revalidation under rules 6–7; FP-F11 remains routed to IA30. |

## 3. Current finding register

| Finding | Stream | State | Layer / canonical owner | Evidence | Required disposition |
|---|---|---|---|---|---|
| FP-F01 | C01 | CORRECTED_REVALIDATION_REQUIRED | P0 — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | Commit `a97edef079c2bb868ce8665220602814a9bc7d41` adds the Order-owned placement test, downward derivation law, upstream-return rule and explicit restatement defect. Exact reconciled #83+#84 run 2805 passes the canonical documentation/architecture fitness with that owner intact. Current definition reinspection at b76183d9944992163f1ca397a6cbab7220d59911: Exact P0 owner d24ad505 unchanged from #84; proposition-level P0–P8 placement/downward authority and upstream return directly reviewed. Exact consolidated final proof and stream disposition remain required. | Preserve at the canonical owner; any later owner change requires revalidation under control rule 6. |
| FP-F02 | C01 | CORRECTED_REVALIDATION_REQUIRED | P1 — `GW-P1-CANONICAL-OWNERSHIP` + `GW-P1-EXPLICIT-FLOW`, owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` | Commit `a97edef079c2bb868ce8665220602814a9bc7d41` closes producer→projection→decision/consumer→presentation→mutation ownership and noninterference without introducing another P1 identity. Exact combined run 2805 passes the ownership sensor and existing canonical-document fitness. Current definition reinspection at b76183d9944992163f1ca397a6cbab7220d59911: Exact P1 owner d24ad505 unchanged; stable ownership/explicit-flow IDs govern semantic producer/consumer/noninterference and no new P1 identity. Exact consolidated final proof and stream disposition remain required. | Preserve the stable P1 IDs and single canonical owner. |
| FP-F03 | C05 | ROUTED | P4/P8 proof — existing architecture/certification/browser-test owners | Exact combined run 2805 revalidates the account noninterference proof, the G-F13/C22-F02 positive/negative authority-materiality proof, and the new governance-owner sensor. The remaining mechanically checkable shared-event boundary is the separately routed FP-F11/IA30 concern. | Extend the same positive+negative proof pattern only when IA30 is authorized; do not create a second normative field list. |
| FP-F04 | C02 | CORRECTED_REVALIDATION_REQUIRED | P2 — `GW-DOC-SYSTEM-BRIEF-V1` | Commit `bc702c642fa8e54cc53fa5794bcc7a17c690a4f9` reduces System Brief §6 to P2 product intent and references the P3 lifecycle/validation owners. Exact combined run 2805 passes canonical documentation/architecture fitness. Current definition reinspection at b76183d9944992163f1ca397a6cbab7220d59911: Exact System Brief 8292b8f2 §6 directly compared with unchanged Work Lifecycle 013bc129: product outcome and exact authorization are P2, lifecycle state/transition and validation remain referenced owners. Exact consolidated final proof and stream disposition remain required. | Preserve the P2/P3 ownership boundary. |
| FP-F05 | C02 | CORRECTED_REVALIDATION_REQUIRED | P5 — `GW-DOC-TECHNICAL-DECISIONS-V1` D19 | Commit `8ca1491edb6d92614098f9fe26f595c870a704b6` limits the shell to active-account identity/readiness + Settings entry and leaves full management at the P3 Settings owner. Exact combined run 2805 passes documentation/architecture fitness against the reconciled 0.6.0 authority package. Current definition reinspection at b76183d9944992163f1ca397a6cbab7220d59911: Exact D19 4ace2676 compared with Installation Readiness ee8acad4 FR073/091/095: shell identity/readiness and one entry, Settings sole full management, unchanged provider/credential owner. Exact consolidated final proof and stream disposition remain required. | Preserve the P3 Settings ownership boundary. |
| FP-F06 | C02/C03 | REVALIDATION_REQUIRED | P3/P4/P8 — current PR #83 G-F13/C22-F02 authority/context foundation | The independent-master audit observed retained sources in the reachable authority graph and inferred they were all productive material. Exact-current PR #83 disproves that inference: `resolveCurrentStageAuthority()` resolves the full reachable graph, while `applicableAuthorityPaths(...)` derives the stage/schema/explicit-ref/concern subset and `resolveStageContextState()` materializes only that subset. Daemon proof shows unrelated selected P2 sources absent from productive R1 context and separately proves `change-v2` selects current lifecycle-context while historical `change-v1` selects the retained v1 source. Run 2780 is green. | No PR #84 runtime/P6/manifest correction. Preserve G-F13/C22-F02 and revalidate it unchanged on the stacked candidate. |
| FP-F07 | C02/C03 | REVALIDATION_REQUIRED | P3/P4/P8 — reachable reference-fact authority versus material stage context | The independent-master audit treated OpenSpec/Spec Kit/Kiro/BMAD layer reachability as automatic productive authority. Current PR #83 makes reachability and materiality distinct: reference-fact owners remain in the reachable graph so exact refs/precedence remain resolvable, but only stage-template refs, explicit upstream refs, resolved P1 rules and applicable concern authority enter productive material. The same G-F13/C22-F02 implementation/proof closes this finding. | No PR #84 authority-array deletion or new registry. Preserve current applicability derivation and exact-reference reachability. |
| FP-F08 | C03 | REVALIDATION_REQUIRED | P3/P4/P8 — `GW-FR-073`, `GW-FR-076`, Workbench/account projection, `ui/src/OpenCodeAccountControl.tsx` | Current PR #83 bytes remove `mutationBlockers` from `useOpenCodeAccountControl`; certification forbids `mutationBlockers`/`Changes blocked`; browser proof holds READY constant while varying `ACTIVE_RUN` and separately proves Settings remains blocked. Exact head `f307a6e04385e97b1b6e54a043155e9e33ec0f60` passes the complete PR Verification lane in run 2804 / `45557634815`. | Preserve this correction unchanged in the stacked candidate; no PR #84 UI mutation. |
| FP-F09 | C03 | REVALIDATION_REQUIRED | P3/P8 — `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-DOC-WORKBENCH-UX-V2`, queue diagnostics | Current #83 bytes keep ordinary source diagnostics free of raw `INVALID_SOURCE` and preserve path + actionable human reason. Exact head `f307a6e04385e97b1b6e54a043155e9e33ec0f60` passes full browser/rendered acceptance in run 2804. | Preserve unchanged in the stacked candidate; do not duplicate UI/test semantics on PR #84. |
| FP-F10 | C03 | REVALIDATION_REQUIRED | P3/P4/P8 — account Settings presentation | Current #83 bytes retain `blockerText(...)`, `loginStatusText(...)` and human account status; raw blocker/login enums are absent from ordinary presentation. Exact head `f307a6e04385e97b1b6e54a043155e9e33ec0f60` passes full browser/rendered acceptance in run 2804. | Preserve unchanged in the stacked candidate; no PR #84 UI mutation. |
| FP-F11 | C03 | ROUTED | P3/P4/P8 — IA30 productive-stage presentation + IA33 terminal result | Current #83 bytes preserve and fully revalidate the IA33 terminal-resource correction (`runRoleLabel(...)`, human evidence wording, certification forbidding raw event prettification) on head `f307a6e04385e97b1b6e54a043155e9e33ec0f60`, run 2804. The remaining shared `STAGE_COMPLETED` outcome path belongs to `workbench-presentation.ts` / productive-stage activity and therefore post-signoff IA30; §17A excludes IA30-IA34 from the current bounded grant. | Treat the IA33 portion as proven. Resolve only the remaining shared-event path under IA30 authorization with product-language + negative raw-enum proof. |
| FP-D01 | Dependency | REVALIDATION_REQUIRED | PR #83 0.6.0 campaign foundation + `docs/governance/systems-governance.md` | PR #84 exact verification head `e8c94a3a99fe2f5b2db8ba664482beaa853bd54f` is a descendant of green #83 head `f307a6e04385e97b1b6e54a043155e9e33ec0f60`, is 0 commits behind it, and the incremental diff is exactly 11 intended files with no P6/manifest/resolver/daemon/shell/UI/package/lock changes. Combined run 2805 is fully green. | If PR #83 moves again, affected evidence returns to revalidation under control rule 7. |

## 4. Canonical corpus inventory

Inventory and semantic-domain observations below retain their prior exact audit provenance. Their current usability follows the finding and stream registers above; the earlier combined run is not proof against the new integration tree.

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
| 6. OpenCode account/authentication/mutation-blocker state | AUDITED_WITH_FINDINGS | Settings mutation admission owns blockers. FP-F08 and FP-F10 are CLOSED and fully revalidated on PR #83 head `f307a6e0...` / run 2804; remaining inspected account boundaries preserve their owner. |
| 7. Proposal/review/dialogue state | CONFORMANT | Proposal currentness/decision meaning derives from canonical RunEvents; target path is technical detail and proposal mutation ownership is singular. |
| 8. Terminal result/evidence/material maturity | AUDITED_WITH_FINDING | Governed outcome uses `workOutcomeProductLabel`; the IA33 terminal-resource FP-F11 leak is corrected and revalidated through exact combined run 2805. The remaining FP-F11 path is productive-stage/shared-event presentation owned by IA30, not Terminal Result. |
| 9. Workbench application/global versus feature-local presentation | AUDITED_WITH_FINDING | The FP-F08 shell/Settings semantic leak is CLOSED with negative noninterference proof and preserved by exact combined run 2805; remaining inspected global/feature boundaries preserve their owner. |
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

PR #83 exact head `f307a6e04385e97b1b6e54a043155e9e33ec0f60` passes the complete lane in run 2804 / `45557634815`, including the G-F37 historical-inspection proof correction. The exact combined #83+#84 candidate `e8c94a3a99fe2f5b2db8ba664482beaa853bd54f` then passes the complete lane again in run 2805 / `45558988669`, including browser and rendered acceptance.

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
| V04 — current PR #83 inherited verification | head `f307a6e04385e97b1b6e54a043155e9e33ec0f60`, run 2804 / `45557634815` | PASS | Complete lane PASS: metadata, dependency-lock, typecheck, architecture, full unit, build, diagnostic evidence/completeness, bounded evidence authorization/capture, release packager, full browser and rendered acceptance. G-F31 and G-F37 verification-only races are resolved at the campaign owner with no product/P1-P7 behavior change. |
| V06 — G-F31 browser-proof defect | #84 exact stacked head `9c5f24b0271c882990d1e47a0b9979dea65d3c3c`, run 2795 / `45551291570` | RESOLVED_AT_OWNER | Metadata, dependency-lock, typecheck, architecture, full unit, build, diagnostics, bounded evidence and release packaging all passed; full browser failed only at `tests/browser.spec.ts:4265`. Source inspection proved the assertion raced canonical `queueProjectId` defaulting. The IA12/IA28 proof was corrected on PR #83 and recorded as campaign G-F31 with no product/P1-P7 change. |
| V05 — exact combined PR #84 verification | head `e8c94a3a99fe2f5b2db8ba664482beaa853bd54f` on green #83 head `f307a6e04385e97b1b6e54a043155e9e33ec0f60`, run 2805 / `45558988669` | PASS | Complete lane PASS: metadata, dependency-lock, typecheck, architecture including the new governance-owner sensor, full unit, build, diagnostics, bounded evidence authorization/capture, release packager, full browser and rendered acceptance. The incremental diff is exactly 11 intended files with no UI/browser or stale FP-F06/FP-F07 runtime/manifest/P6 mutation. PR #84 is retargeted back to #83 for incremental review/delivery ordering. This register-only status synchronization changes no audited canonical owner or implementation surface, so control rule 6 does not invalidate V05. |
