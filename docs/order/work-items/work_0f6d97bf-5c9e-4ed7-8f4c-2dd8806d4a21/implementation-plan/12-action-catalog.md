# 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

## Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD30; IA01-IA34 | — | one cumulative 66-path 0.6.0 candidate; internal waves below own ordered mutation/proof responsibilities | resumed baseline: IA27-IA31 independently revalidate/remediate already-realized bytes; IA32-IA34 retain purge-before-fresh-authorship; historical purge provenance is not repeated as current-task work | final V0-V7 + SD16-SD18/SD29 certification + IA26/SD30 exact-candidate 37-SURF acceptance |

**Audit rule:** T1 is the only P6 ExecutionTask. Wave/IA ordering below is internal implementation sequencing and never relies on candidate-byte promotion between tasks. A later phase discovering a foundation defect returns to IA27/DESIGN rather than patching around it; T1 cannot close until every owned phase obligation and final candidate proof is satisfied.

## Execution waves

0. **Preflight 0 — DESIGN-positive reuse proof:** IA07-IA08. No production mutation.
1. **Wave 1 — authority/source/task/runtime corrections:** IA01-IA10 plus IA25 where still unsatisfied.
2. **Wave 2 — resumed foundation + shell authority classification/remediation, including targeted destructive replacement where required:** IA27. First derive/revalidate the closed SD21 visual-language → foundation realization ledger from current P3/DESIGN, P4, theme authority and reviewed derived SVG references; only then judge the already-realized foundation/shell against that ledger, correct residual nonconformance, and accept/freeze the foundation before any later presentation work.
3. **Wave 3 — resumed Queue/Create/account-utility revalidation/remediation:** IA11, IA12, IA28 inside the accepted application shell.
4. **Wave 4 — resumed Work request/document revalidation/remediation:** IA13, IA14, IA29 inside the accepted WorkItem shell.
5. **Wave 5 — resumed productive pre-signoff screen revalidation/remediation:** IA15, IA30.
6. **Wave 6 — resumed Readiness/Approval revalidation/remediation:** IA16, IA17, IA31.
7. **Wave 7 — destructive Implementation replacement:** IA32.
8. **Wave 8 — destructive Complete/Evidence/Context replacement:** IA19, IA33.
9. **Wave 9 — destructive Settings/account-management/configuration replacement:** IA18, IA34; the global shell account quick-access renderer is already owned by Wave 3.
10. **Wave 10 — permanent semantic/component certification:** IA20-IA22.
11. **Wave 11 — cross-solution regression closure:** IA23.
12. **Wave 12 — rendered product acceptance:** IA26.
13. **Wave 13 — candidate closeout:** IA24.

Before Wave 1, BUILDER requests the signed `dependency-lock` gate once through the existing SD13 coordinator checkpoint and it must `GATE_PASSED`. The fresh Approval baseline already contains the historically completed IA27-IA31 presentation work; those bytes are implementation evidence only. IA27 first derives/revalidates the complete SD21 visual-language → foundation realization ledger without using current JSX/CSS as desired-state evidence, proves every recurring role has exactly one canonical foundation owner/treatment and no unresolved role, then judges the current foundation/shell against that ledger, proves the deleted `WorkbenchLayout` remains absent and the singular AppShell/WorkItemShell/responsive owners remain, and remediates only proven residual nonconformance. IA28-IA31 each consume their exact owned `SURF-*` datum/action rows from that closed DESIGN contract through the accepted IA27 foundation before inspecting baseline bytes, then correct every proven delta without replaying their historical purge checkpoints. A conforming current path may remain only because current authority independently proves it correct, never because current implementation is a preservation target. IA32-IA34 retain purge-before-fresh-authorship for their unreconstructed screen families and exact owned selectors. No phase may redesign IA27 locally or introduce a recurring visual-language role outside the accepted foundation. The exact 37 audited `SURF-*` rows remain partitioned across IA27-IA34 below. Every owner must pass schema/information, UX/interaction and visual/UI review before advance; `schema_information` includes canonical P3 §11.4A default-visible/default-hidden/disclosure behavior. IA26 independently rechecks the complete exact-candidate union. Wave 10 proves the complete renderer/component/theme system semantically. Wave 12 produces exact-candidate rendered evidence only after ordinary gates are green. Wave 13 closes only after every rendered row is accepted.
## IA01 — pure project-authority resolution

**Solution:** SD02.  
**Owner/anchors:** `src/core/governance.ts`, existing authority-layer/concern/material/freshness pure functions.  
**Required mutation:** add the minimum pure resolved-authority projection over validated manifest inputs and shell-expanded selected paths, preserving the selected P1-P6 set as authority reachability, exact stable/versioned ref-to-source identity, same-layer precedence plus inherited P1 default/override/extension and fitness bindings. IA01 does not decide stage materiality.  
**Forbidden:** filesystem/provider I/O; semantic contradiction inference; DTO/service/repository/class family; parallel authority graph.  
**Proof:** `tests/core.test.ts` ordering/default/override/extension/invalid-input cases.

## IA02 — consume resolved authority before productive context

**Solution:** SD02. Depends on IA01.  
**Anchors:** `src/daemon/authority.ts::resolveStageContextState/resolveStageContext`; `src/daemon/stage.ts::stagePrompt` and stage admission.  
**Required mutation:** consume IA01 result before provider context/conformance/sign-off dependency construction, then derive the applicable material-authority subset from the pinned WorkItem schema/template, mandatory stage policy and explicit upstream/signed authority refs plus dependencies. Stable refs bind current canonical owners; explicit versioned refs bind exact retained snapshots. A selected/reachable retained source must not become stage material merely because it shares an authority layer. Invalid/unresolved applicable bindings block before provider use.  
**Forbidden:** provider interpretation of raw manifest order as precedence; daemon-owned second authority graph; include-every-selected-source context projection; implicit promotion of retained historical sources into current-schema context; context construction that bypasses the IA01 resolved projection or the canonical lifecycle-context applicability rule.  
**Proof:**
- `tests/daemon.test.ts` — productive-context admission consumes the resolved projection, derives the schema/stage-applicable material subset, excludes an unrelated retained V1 source from a current-v2 context, includes the exact retained source when a pinned historical schema or explicit versioned ref requires it, and blocks unresolved applicable bindings before provider use;
- `tests/certification.test.ts` — representative production project manifest with both current and retained semantic sources plus same-layer precedence/default/override/extension reaches the real STAGE context with only the applicable material set in resolved order. Current-v2 and historical exact-version cases are both proved, and an equivalent unresolved simultaneously-applicable relation fails before any provider turn. The certification must fail if production falls back to raw manifest array/filesystem order, include-every-selected-source projection, or provider interpretation.

## IA03 — one GOVERNANCE proposal/adoption mechanism

**Solution:** SD09.  
**Anchors:** `src/core/contracts.ts` proposal/ArtifactRef contracts; `src/core/governance.ts`; `src/daemon/stage.ts::proposalDisposition/proposalAdoptionRequest/adoptArtifactProposal/reconcilePendingArtifactProposals`; `src/daemon/authority.ts`.  
**Required mutation:** R2 admits only current manifest-resolved P2/P3 targets; DESIGN only P4/P5/P6; exact role/layer/path/base-hash re-resolution before adoption.  
**Forbidden:** stage-specific proposal DTOs/direct provider writes/second decision store.  
**Proof:** core/daemon wrong-layer/path/hash/stale/adoption/freshness cases.

## IA04 — durable-decision completion admission

**Solution:** SD08. Consumer dependency on IA03 when the durable target is permanent governance.  
**Anchors:** `src/core/lifecycle.ts::evaluateStageCompletion/validateStageProviderTurn`; `src/daemon/stage.ts::runStageTurn/submitRunInput`.  
**Required mutation:** after latest answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, reject stage completion until later adopted authority exists. INFORMATION/EVIDENCE remains unchanged.  
**Proof:** core/daemon chronology cases for adopted/rejected/cancelled/stale and ordinary information input.

## IA05 — schema-aware current-v2 task admission

**Solution:** SD10.  
**Owners/anchors:** existing `SignedTaskBlockSchema` remains unchanged in `src/core/contracts.ts`; `src/core/execution.ts::parseSignedTaskBlockFromPlan` remains the one structural parser and gains one pure schema-aware admission helper over the parsed block; `src/daemon/stage.ts` owns PLAN/R3 authoring/conformance invocation; `src/daemon/authority.ts::validateTaskDefinitions` owns R3/sign-off deterministic task validation.  
**Required mutation:** for `change-v2`/`defect-v2` only, enforce P6 §37.4 mechanical non-vacuity: non-empty task list; trimmed non-empty id/objective; non-empty scope, acceptanceRefs, changeSurface, gateIds, authorityRefs and concernIds. Keep `dependsOn`/exclusions optionally empty. The PLAN/R3 provider contract states these same v2-only mechanical clauses alongside the unchanged shared JSON Schema. PLAN conformance and R3/sign-off call the same pure admission owner. Published `change-v1`/`defect-v1` parsing/validation meaning is unchanged.  
**Semantic boundary:** mechanical presence is not material task sufficiency. Existing PLAN conformance questions still prove objective/dependencies/traceability, module ownership/decomposition, checkpoint placement, surfaces, deletions/replacements, completion evidence, minimum-change forecast and verification contract; R3 independently challenges complete P1-P7 traceability/readiness.  
**Forbidden:** tightening the shared SignedTaskBlock schema globally; a v2-only shadow task schema/parser; a second semantic-review path.  
**Proof:** `tests/core.test.ts` preserves v1 cases and proves v2 positive/negative mechanical admission; `tests/daemon.test.ts` proves PLAN and READY_FOR_SIGNOFF/sign-off cannot bypass v2 admission; `tests/certification.test.ts` binds the single parser/admission/prompt path and rejects duplicate task schema/parser ownership.

## IA06 — canonical Approval identity normalization

**Solution:** SD12.  
**Anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts::signOffWorkItem`.  
**Required mutation:** trim and reject whitespace-only `approvedBy` before persistence.  
**Proof:** core/daemon direct-ingress negative tests plus browser feedback.

## IA07 — signed-checkpoint DESIGN-positive reuse proof

**Solution:** SD13; package atom `PL-C12-01`.  
**Existing realization evidence owners:** existing `src/core/contracts.ts`, `src/core/execution.ts`, `src/daemon/execution.ts`, `src/daemon/validation.ts` and `src/shell/opencode.ts`.  
**Required action:** no T1 production mutation. Before Wave 1, revalidate that BUILDER alone may emit one terminal signed `GATE_CHECKPOINT_REQUESTED`, the coordinator checks freshness/current V2 scope before the effect, executes the signed gate, records existing GATE_PASSED/GATE_FAILED evidence, continues the same Run/provider session and never grants provider shell/execute. The implementation waves then consume this DESIGN-positive capability exactly as scheduled by `13-verification-closeout.md`.  
**Failure:** if current evidence cannot prove the DESIGN-required capability, stop before mutation and return upstream; do not self-bootstrap the checkpoint protocol.  
**Proof:** existing core/daemon/certification checkpoint success, failure, unsigned, out-of-scope and same-session cases plus exact current realization verification.

## IA08 — signed-scope/forecast DESIGN-positive reuse proof

**Solution:** SD10; package atom `PL-C12-02`.  
**Existing realization evidence owners:** existing `src/shell/opencode.ts`, `src/daemon/validation.ts` and `src/daemon/execution.ts`.  
**Required action:** no T1 production mutation. Revalidate that signed scope/exclusions are the hard reach boundary, `changeSurface` is immutable forecast evidence, forecast absence alone is not V2 `SCOPE_BREACH`, and in-scope unforecast decomposition can proceed only through independent V4, architecture/governance V5 and coordinator-owned V6 minimum-change evidence.  
**Failure:** any contradiction blocks execution and returns to the owning pre-signoff layer; do not modify execution-foundation owners from this T1 to make the candidate admissible.  
**Proof:** existing daemon/certification in-scope-unforecast, out-of-scope/exclusion/protected-path, V6 `CHANGE_BLOAT` and architecture-fitness cases.

## IA09 — singular new-source planner

**Solution:** SD04.  
**Anchor:** `src/daemon/work-item-source.ts::reconcileWorkItemSources/createWorkItemFromSource`.  
**Required mutation:** factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan from a validated source snapshot.  
**Proof:** created/discovered inputs produce equivalent admission plans except provenance.

## IA10 — converge created/discovered persistence

**Solution:** SD04. Depends on IA09.  
**Anchor:** `src/daemon/work-item-source.ts`.  
**Required mutation:** route UI-created and discovered source snapshots through IA09 + existing applyPlan; delete direct create-path WorkItem construction/store.  
**Proof:** daemon one-persistence-owner, read-back, diagnostics and freshness tests.

## IA11 — canonical Create interaction

**Solution:** SD03.  
**Anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required mutation:** ordinary vocabulary is Concerns; linked remediation shows fixed parent project context and no invalid cross-project selector. Preserve metadata/body ownership.  
**Proof:** browser ordinary creation, metadata ownership and linked-remediation tests.

## IA12 — one archive/project/search derivation

**Solution:** SD05.  
**Anchors:** `ui/src/app.tsx::App`; `ui/src/WorkItemQueue.tsx::WorkItemQueue`.  
**Required mutation:** App selects active/include-archived canonical dataset then applies project/search exactly once; queue does not own alternate filtering.  
**Proof:** browser active/archived × project × search matrix while archive identity/history remains unchanged.

## IA13 — exact documentation-Git review

**Solution:** SD06.  
**Anchor:** `ui/src/DocumentWorkspace.tsx::DocumentationGitConfirmation`.  
**Required mutation:** list exact canonical governed changed paths/states before commit; reuse existing Git status owner.  
**Proof:** browser exact-path/state review plus blocker cases. Do not alter save/status/eligibility semantics already proven conforming.

## IA14 — current attention survives inspection

**Solution:** SD07.  
**Anchors:** canonical `src/core/lifecycle.ts::deriveCurrentAttention` remains unchanged owner; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts`.  
**Required mutation:** when inspected material differs from current owner, render exact higher-priority owner/reason/action and direct return while preserving legitimate inspection.  
**Proof:** presentation/browser required-input/proposal/blocker/stale/recovery with historical selection.

## IA15 — focus once per required-input request

**Solution:** SD15.  
**Anchors:** `ui/src/ActivityComposer.tsx::ActivityComposer`; `ui/src/ActivityWorkspace.tsx::StageRunMaterial`.  
**Required mutation:** new current required-input event id moves focus once to Workbench composer; rerender/polling does not refocus.  
**Proof:** browser focus-once/rerender/responsive cases.

## IA16 — canonical Readiness verdict

**Solution:** SD11.  
**Anchor:** `ui/src/ReadinessWorkspace.tsx::ReadinessWorkspace` plus existing presentation helper.  
**Required mutation:** dominant verdict is typed R3 completion outcome; maturity/currentness separate.  
**Proof:** READY_FOR_SIGNOFF/RETURN_TO_*/BLOCKED + stale material cases.

## IA17 — Approval readiness/currentness hierarchy

**Solution:** SD12.  
**Anchor:** `ui/src/SignoffReview.tsx::SignoffReview`.  
**Required mutation:** readiness + package currentness precede task/technical identity; stale/history cannot fabricate readiness.  
**Proof:** browser/presentation current/stale package cases.

## IA18 — operator-first Settings hierarchy

**Solution:** SD14.  
**Anchors:** `ui/src/SettingsWorkspace.tsx::SettingsWorkspace/RepositorySettings/ModelRuntimeSettings`.  
**Required mutation:** readiness/meaning/actions primary; exact roots/endpoints/model source/credential-like identity under Technical details except active configuration input.  
**Proof:** browser normal Settings, blockers, Add/Move/configuration cases.

## IA19 — product-language projection

**Solution:** SD01.  
**Anchors:** `README.md`; `ui/src/TerminalResult.tsx::TerminalResult`; `ui/src/workbench-presentation.ts`.  
**Required mutation:** reuse the P4 terminal-result projection by adding/using one pure exhaustive product-facing `WorkOutcome` label mapping in `workbench-presentation.ts`; remove `TerminalResult.tsx` local enum prettification; make `TerminalResult` consume the shared mapping; correct README hero/intro/result-boundary copy so verified result is the umbrella outcome and implementation/candidate language is conditional; preserve the explicit operator-triggered WorkItem documentation-Git exception while prohibiting automatic implementation/candidate commit/push/merge/deploy.  
**Forbidden:** lifecycle/state/WorkOutcome contract changes; second product-label table in `TerminalResult`; generic enum prettification fallback; new DTO/view-model/service/state owner; candidate resources for non-candidate outcomes.  
**Proof:**
- `tests/workbench-presentation.test.ts` — exhaustive current `WorkOutcome` → canonical product-facing label cases, including `CANDIDATE_DONE -> Verified candidate`, and no underscore/title prettification fallback;
- `tests/browser.spec.ts` — Complete/TerminalResult candidate case renders **Verified candidate** and candidate resources; representative no-code terminal case renders its canonical non-candidate label and no candidate resources;
- `tests/certification.test.ts` — README contains verified-result umbrella + conditional implementation/candidate wording + explicit documentation-Git exception, and rejects universal candidate/delivery wording or an absolute no-commit claim that erases that exception.

## IA20 — exhaustive renderer classification certification

**Solution:** SD16.  
**Owner:** `tests/certification.test.ts`.  
**Required mutation:** check complete production renderer coverage against the **actual renderer rows in canonical P4 §8.17**, including ActivityComposer; surrounding prose mentions do not satisfy matrix membership. Fail on an unclassified renderer or a production renderer absent from the §8.17 table.  
**Forbidden:** edit `tests/architecture.test.ts` inside T1 or create second UI registry.  
**Proof:** certification negative/positive fixture.

## IA21 — scenario-41 work-kind certification

**Solution:** SD17.  
**Owner:** `tests/browser.spec.ts`.  
**Required mutation:** certify all four kinds' Work request + Research information contracts and distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind semantic matrix.

## IA22 — System/Light/Dark component-semantic parity

**Solution:** SD18.  
**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required mutation:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states preserve canonical semantic roles under all effective themes.  
**Proof:** semantic role/component assertions; no pixel-snapshot substitute.

## IA23 — cross-solution regression closure

**Upstream:** all SD01-SD30.  
**Owners:** existing targeted core/daemon/presentation/browser/certification suites plus `tests/opencode.test.ts` and `.github/workflows/ci.yml` for SD20.  
**Required mutation:** fill any integration-level positive/negative gaps needed to prove the composed solutions without duplicating action-specific tests. Explicitly prove no compatibility fallback, shadow owner or implementation-derived semantics. For SD20 specifically, add one permanent exact-pin OpenCode integration tier: PR verification installs exact `opencode-drive@2.4.1` + `effect@4.0.1` into runner-temporary verification space, `tests/opencode.test.ts` launches the actual supported OpenCode `2.2.6` process through Order's production OpenCode environment/admission/session path, and deterministic model responses are supplied through the Drive simulation provider/controller. Existing `fake-opencode` fixtures remain lower-level doubles and do not satisfy this exact-pin proposition. Do not add the simulation tooling to Order's product/runtime package graph, lockfiles, release bundle, configuration or state, and do not claim remote-provider availability, Console OAuth/account connectivity or model quality from simulated responses.  
**Proof:** exact-pin SD20 integration case passes in permanent PR verification; all targeted suites green; V4/V5/V6 trace every added assertion/tooling change to an SD/requirement/atom.

## IA24 — exact candidate closeout

**Upstream:** complete T1 with IA26 rendered UX/UI acceptance PASS.  
**Owner:** `CHANGELOG.md` plus coordinator-owned validation evidence.  
**Required mutation:** record user-visible/correctness consequences under Unreleased; run exact final six-gate union and V0-V7 with fresh V4/V5/V6, and bind closeout to the exact GitHub Actions rendered-acceptance run/evidence package accepted under IA26.  
**Terminal:** only CANDIDATE_DONE or valid ALREADY_SATISFIED. PR merge/release/version bump remain outside T1.

## IA25 — guided productive installer completion

**Solution:** SD19.  
**Canonical authority:** P3 FR007 plus corrected P3 FR079 / Installation Readiness `9c2ec83a9552b7583f90e91080c014df4d6870df`, P4 GW-TR-007 and corrected P6.  
**Owner/anchor:** `src/shell/setup.ts::runInstallerGuidedSetup/runGuidedSetupInternal`; `src/installer.ts::configureOrder/runInstaller` is the existing caller and is not expected to change.  
**Required mutation:** remove/replace the fresh `configured === null` success/defer branch so installer-owned setup continues through existing private OpenCode login, model selection, exact target repository validation/selection and reference-root choices before returning success and proving productive daemon/readiness. Preserve valid incomplete v4 only as post-install/update daemon/Settings recovery and transient rollback-safe installer state. Preserve existing upgrade/migration retention and rollback.  
**Forbidden:** new config schema; second setup owner; mandatory post-install Settings/provider-login step; speculative `src/installer.ts` edit. If setup.ts alone cannot realize SD19, return to DESIGN/PLAN.  
**Proof:** create `tests/installer.test.ts` covering fresh productive setup success/failure/cancel and deferred-Settings rejection; existing `tests/order-migration.test.ts` must continue proving migration/rollback/continuity.


## IA27 — revalidate and remediate the already-realized Workbench foundation and shell

**Solution:** SD21, with SD29 responsive/accessibility containment.

**Historical reconstruction primitive inputs (20):**
- `ui/src/primitives/WorkbenchAttention.tsx`
- `ui/src/primitives/WorkbenchContextPanel.tsx`
- `ui/src/primitives/WorkbenchDialogue.tsx`
- `ui/src/primitives/WorkbenchForm.tsx`
- `ui/src/primitives/WorkbenchIdentity.tsx`
- `ui/src/primitives/WorkbenchLayout.tsx` — delete permanently; no same-API recreation
- `ui/src/primitives/WorkbenchMasterDetail.tsx`
- `ui/src/primitives/WorkbenchRail.tsx`
- `ui/src/primitives/WorkbenchResourceRow.tsx`
- `ui/src/primitives/WorkbenchReview.tsx`
- `ui/src/primitives/WorkbenchSectionHeader.tsx`
- `ui/src/primitives/WorkbenchSelector.tsx`
- `ui/src/primitives/WorkbenchSettingsLayout.tsx`
- `ui/src/primitives/WorkbenchSurface.tsx`
- `ui/src/primitives/WorkbenchTable.tsx`
- `ui/src/primitives/WorkbenchTaskPanel.tsx`
- `ui/src/primitives/WorkbenchTimeline.tsx`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/primitives/WorkbenchState.tsx` — whole-region/compact state composition is design-bearing
- `ui/src/primitives/WorkbenchUtilityLink.tsx` — application-toolbar utility structure is design-bearing

**Historical shell-integration cutover inputs (5):** `ui/src/app.tsx`, `ui/src/WorkItemWorkspace.tsx`, `ui/src/WorkItemIdentityRow.tsx`, `ui/src/WorkflowRail.tsx`, `ui/src/WorkflowStepFrame.tsx`.

**Foundation owners established by the historical reconstruction (3):** `ui/src/primitives/WorkbenchAppShell.tsx`, `ui/src/primitives/WorkbenchWorkItemShell.tsx`, `ui/src/primitives/workbench-responsive.ts`.

**Positively retained atomic adapters (7, read-only throughout T1):** `WorkbenchAction.tsx`, `WorkbenchConfirmation.tsx`, `WorkbenchDisclosure.tsx`, `WorkbenchField.tsx`, `WorkbenchIcon.tsx`, `WorkbenchNotice.tsx`, `WorkbenchStatus.tsx`.

**Other physical owners:** `ui/src/theme.css`, `ui/src/styles.css`, `tests/certification.test.ts`, `tests/browser.spec.ts`.

**Required ordered revalidation/remediation:**
1. derive/revalidate the **SD21 visual-language → foundation realization ledger before inspecting current JSX/CSS**. For every SD21 design-language dimension record: exact canonical authority reference; relevant non-superseded SVG reference(s) where useful; exactly one owning Workbench primitive or approved content leaf; Astryx substrate/variant where applicable; canonical theme token/typography/spacing/density/geometry/action/status role; ordinary placement/progressive-disclosure behavior; responsive/accessibility/focus behavior; and exact verification owner;
2. prove the ledger is closed: every recurring visual/composition concern required by P3/P4/theme and the reviewed reference set has exactly one realization owner, equivalent semantic roles resolve to the same primitive/token/variant treatment, and there is no duplicate, unowned or screen-delegated recurring role. A missing/ambiguous role blocks IA27 and returns to DESIGN/P4 rather than being inferred from current code;
3. consume/review the applicable foundation/shell obligations and `SURF-WI-001` datum/action rows from the exhaustive 37-surface information contract in `solution-design.md` against that ledger: one application-global shell, one selected-WorkItem shell, canonical interaction-class compositions, the closed Primary/Supporting/Operational/Technical/Diagnostic hierarchy and disclosure lanes, responsive semantic order and accessibility/focus responsibilities;
4. inspect the current foundation only after steps 1-3 and prove historical replacement invariants still hold: all exact historical destructive primitive/shell paths that were meant to disappear remain absent where deleted, `WorkbenchLayout` remains absent, the seven retained atomic adapters remain narrow, and exactly one `WorkbenchAppShell`, one `WorkbenchWorkItemShell` and one structural responsive owner exist;
5. treat the **historical purge-before-fresh-authorship record as provenance only**; **do not claim a new transient purge checkpoint** merely to replay the superseded whole-foundation task. Instead classify every current IA27 design-bearing owner as `CONFORMING_NO_EDIT`, `BOUNDED_RESIDUAL` or `DESTRUCTIVE_REPLACEMENT` before editing;
6. use `BOUNDED_RESIDUAL` only when the canonical owner, responsibility, topology and interaction model are already correct and the delta is local to a prop, token, isolated geometry value or accessibility behavior. Use `DESTRUCTIVE_REPLACEMENT` when ownership/topology/API structural freedom/responsive composition/recurring visual-language structure materially contradicts P4/SD21/theme authority. For that class, remove the implementation plus its exact owned selectors and implementation-shaped assertions at a bounded procedural replacement checkpoint, then fresh-author from the ledger. Do not refactor through, wrap or compatibility-shim the superseded structure;
7. current mandatory destructive replacement: `ui/src/primitives/WorkbenchAttention.tsx` plus its `.order-workbench-attention*` foundation selectors. Remove the caller-selected `tone` / `data-tone` whole-surface status-color channel because the exact P4 API is `WorkbenchAttention({ title, purpose?, status?, blocker?, action? })`. Recreate that exact responsibility over canonical theme roles; status/error/warning/success emphasis remains in `WorkbenchStatus` and `WorkbenchNotice`. `WorkflowStepFrame.tsx` must stop deriving/passing an Attention tone;
8. compare every remaining IA27-owned primitive/shell/theme/structural selector/assertion against the closed ledger and current authority. Record `CONFORMING_NO_EDIT`, bounded residual correction or destructive replacement evidence explicitly; do not manufacture churn for conforming owners;
9. update `theme.css`/`styles.css` and tests only for proven IA27 defects. Remove obsolete compatibility/implementation-shaped assertions and selectors; do not weaken still-applicable semantic/accessibility/browser requirements and do not add feature-level visual-language ownership;
10. prove exactly one production AppShell owner, one WorkItem shell owner, one structural responsive owner, no `WorkbenchLayout`, no feature structural CSS/breakpoint owner, narrow retained atom responsibilities, Astryx containment, theme parity, component visual parity, keyboard/focus behavior, disclosure-lane fitness and representative rendered alignment. Cross-service representatives must prove **same semantic role → same primitive + token/variant + hierarchy/disclosure behavior**. `SURF-WI-001` receives all three phase-local rendered verdicts before IA28.

**Hard boundaries:** no refactor-through-superseded-structure for a `DESTRUCTIVE_REPLACEMENT`; no domain/query/current-attention/lifecycle policy moves into primitives; no DTO/view-model/state family; no compatibility `WorkbenchLayout`; no temporary second shell; no old primitive DOM/CSS/API copied as implementation template; no old shell files retained merely to keep gates green; no screen-family redesign beyond the five shell-integration owners in IA27; no new recurring color/token meaning, typography/spacing/density scale, button/action treatment, status/notice chrome, disclosure lane, overlay mechanic, hierarchy convention, foundation geometry or breakpoint/responsive grammar delegated to IA28-IA34.

**Proof:** historical reconstruction provenance + signed DESIGN surface-contract/foundation-responsibility review + **complete/no-duplicate/no-unowned visual-language → foundation realization ledger** + current absence/singularity proof + explicit `CONFORMING_NO_EDIT` / `BOUNDED_RESIDUAL` / `DESTRUCTIVE_REPLACEMENT` ledger with bounded procedural removal/fresh-authorship evidence for every destructive owner + architecture/certification/browser gates + cross-service component/theme parity + representative application chrome/current-attention/disclosure/responsive evidence + `SURF-WI-001` row PASS. IA28-IA34 are blocked until IA27 PASS.

### Resumed IA28-IA31 revalidation/remediation protocol and fresh IA32-IA34 reconstruction protocol

**IA28-IA31 resumed baseline.** For each owned screen family:

1. load the exact phase-owned `SURF-*` datum/action rows from the exhaustive 37-surface information contract in `solution-design.md` before treating current implementation as evidence;
2. inspect the current replacement bytes/selectors only after that schema exists and record exact conforming versus nonconforming deltas;
3. remediate every proven mismatch, including default visibility/disclosure defects, while leaving independently conforming bytes unchanged under minimum change;
4. do not replay or fabricate the historical purge checkpoint. Historical purge evidence proves the original replacement happened; it is provenance, not a completion condition of this fresh T1;
5. do not preserve current JSX/DOM/classes because they exist today. They survive only when current authority independently proves them conforming;
6. semantic/browser/rendered proof must PASS for the exact owned SURF rows before advance.

**IA32-IA34 fresh reconstruction.** These owners have not yet realized the campaign target on the fresh baseline. They retain the original destructive protocol:

1. delete all owned old screen/composition files and exact ledgered legacy selectors at the bounded procedural purge checkpoint;
2. load the exact phase-owned `SURF-*` datum/action rows from the exhaustive 37-surface information contract in `solution-design.md`;
3. recreate from that schema using the accepted IA27 foundation and canonical underlying owners;
4. do not copy old JSX/DOM hierarchy, field grouping, card/panel/table/action/responsive/CSS/visual structure;
5. mutate shared styles only for the phase-owned screen selectors; IA27 foundation/theme/structural selectors remain IA27-owned;
6. pass semantic/browser/rendered proof for every exact owned SURF row.

If required non-visual behavior exists only inside a superseded screen file, the phase may not copy it automatically. It must consume the canonical underlying owner or return upstream for an architecture-preserving extraction decision. Likewise, if any IA28-IA34 screen appears to require a new recurring visual role, control treatment, disclosure mechanic, shared layout/hierarchy rule, theme token or responsive behavior, that is an IA27/DESIGN return condition; screen phases may compose the accepted foundation but may not extend the visual language locally.

### Exact IA27-IA34 rendered face ownership

The 37 audited `SURF-*` rows in `docs/references/workbench-ui/README.md` remain partitioned exactly once across IA27-IA34: resumed-baseline revalidation/remediation for IA27-IA31 and fresh reconstruction for IA32-IA34. This table is the PLAN owner of phase-local rendered acceptance allocation; IA26 independently rechecks the union against the reference registry.

| Phase | Exact owned SURF rows | Required state/reference sheets before phase advance |
|---|---|---|
| IA27 | `SURF-WI-001` | WorkItem shell controls; current-attention/chrome alignment; responsive composition; representative application/global chrome foundation proof |
| IA28 | `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` | Queue states; application notices; installation readiness; linked-remediation Create; application-shell active-account visibility |
| IA29 | `SURF-STEP-WR-001`, `SURF-MAT-SOURCE-001`, `SURF-MAT-DOC-001`, `SURF-MAT-DOC-RO-001`, `SURF-CONF-DIRTY-DEST-001`, `SURF-CONF-DIRTY-MATERIAL-001`, `SURF-CONF-ARCHIVE-001`, `SURF-CONF-DOC-GIT-001` | Work request/document states; current-attention interaction inside accepted shell; owned safety confirmations |
| IA30 | `SURF-STEP-R1-001`, `SURF-STEP-R2-001`, `SURF-STEP-DESIGN-001`, `SURF-STEP-PLAN-001`, `SURF-MAT-ACTIVITY-001`, `SURF-MAT-PROPOSAL-001` | Research/Requirements/Solution design/Plan references; dialogue states; proposal states; four-kind Research information differences |
| IA31 | `SURF-STEP-R3-001`, `SURF-STEP-APPROVAL-001`, `SURF-MAT-APPROVAL-TASK-001` | Readiness legitimate-input state; Approval current/stale/currentness states; approval-task detail |
| IA32 | `SURF-STEP-EXEC-001`, `SURF-MAT-EXEC-TASK-001` | Implementation states; current-vs-historical selection; blocker/action/validation boundaries |
| IA33 | `SURF-STEP-COMPLETE-001`, `SURF-WI-CONTEXT-001`, `SURF-MAT-EVIDENCE-001` | Complete linked-remediation branch; candidate/non-candidate terminal states; Evidence; Context |
| IA34 | `SURF-SET-001`, `SURF-SET-REPO-001`, `SURF-SET-REPO-ADD-001`, `SURF-SET-REPO-MOVE-001`, `SURF-SET-OC-001`, `SURF-SET-OC-RENAME-001`, `SURF-SET-OC-ADD-001`, `SURF-SET-OC-LOGIN-001`, `SURF-SET-MODEL-001`, `SURF-CONF-REPO-DISCONNECT-001`, `SURF-CONF-OC-REMOVE-001` | repository/account/model readiness; OpenCode login terminal states; repository/account destructive confirmations |

The IA27-IA34 union is exactly **37 unique SURF rows** with no duplicate or unowned row. For each owned row, the phase-local rendered review uses the same three binary verdict dimensions as IA26 — `schema_information`, `ux_interaction`, `visual_ui`. Any `FAIL` blocks phase advance and requires correction inside the owning phase/design before recapture.

## IA28 — revalidate and remediate Queue and Create on the resumed baseline

**Solutions:** SD22 plus existing SD03/SD05 semantic deltas through IA11/IA12.
**Owners:** `ui/src/OpenCodeAccountControl.tsx`, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`.
**Required mutation:** execute the resumed IA28 revalidation/remediation protocol for the three owned paths inside IA27's accepted `WorkbenchAppShell`. Consume the exact IA28 `SURF-*` rows from the exhaustive DESIGN information contract first, then audit the current Queue/Create/OpenCode quick-access bytes and correct only proven residual deltas. Queue remains the Operational scan; Create/remediation remains TaskPanel→Form/configuration; the quick-access control routes to the single Settings management owner. Keep normal populated Queue separate from diagnostic/empty/search/archive states. Queue ordinary notices never print raw diagnostic codes/repository paths; Create ordinary content does not persistently expose repository root, parent WorkItem id, schema/version or equivalent technical identity where semantic labels suffice.
**Forbidden:** IA27 foundation/retained-atom mutation; feature-local structural CSS; copying old queue/modal/form/table composition; using SVGs as product authority.
**Proof:** historical IA28 reconstruction provenance + DESIGN-contract conformance review + exact residual-delta/no-edit ledger + Queue/Create/account-visibility browser matrix proving raw Queue diagnostic code/path and Create root/parent-id are absent by default and only authorized technical inspection exposes applicable identity + all IA28 face-ledger rows PASS at wide/narrow as applicable.

## IA29 — revalidate and remediate Work request and governed-document material on the resumed baseline

**Solution:** SD23 plus IA13/IA14 where applicable.
**Owner:** `ui/src/DocumentWorkspace.tsx`.
**Retained dependencies:** accepted IA27 WorkItem shell/Surface/Attention/Selector/SectionHeader/Confirmation composition, `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`, `ui/src/workbench-presentation.ts`, query/API/domain owners.
**Required mutation:** load the exact IA29 document/confirmation `SURF-*` rows from the exhaustive DESIGN information contract, then independently audit the current `DocumentWorkspace.tsx` and owned selectors against them inside the accepted WorkItem shell; remediate only proven residual nonconformance. Markdown editors remain content leaves and do not contribute outer screen grammar. Governed content/action is ordinary; exact repository path/SHA/schema/source identity is hidden behind Technical details, except exact changed paths become decision-primary inside the documentation-Git confirmation because consent is path-specific.
**Forbidden:** IA27 foundation/retained-atom mutation for screen convenience; copying old document hierarchy/technical-state layout/classes; recreating identity/rail/current-attention shell ownership locally.
**Proof:** historical IA29 reconstruction provenance + DESIGN-contract conformance review + exact residual-delta/no-edit ledger + Git/current-attention tests proving default-hidden document path/hash/schema, positive Technical-details disclosure, and exact changed-path confirmation + all eight IA29 face-ledger rows PASS.

## IA30 — revalidate and remediate Research, Requirements, Solution design and Plan screens on the resumed baseline

**Solution:** SD24 plus IA15 and existing productive-stage semantic corrections.
**Owners:** `ui/src/PreSignoffStageWorkspace.tsx`, `ui/src/ActivityWorkspace.tsx`, `ui/src/ActivityComposer.tsx`, `ui/src/WorkflowMaterialSelector.tsx`, `ui/src/ProposalReview.tsx`, `ui/src/RunEventTimeline.tsx`.
**Retained dependencies:** `ui/src/workbench-presentation.ts`, query/API/domain owners, accepted IA27 Workbench foundation.
**Required mutation:** load the exact IA30 Research/Requirements/Solution-design/Plan/activity/proposal `SURF-*` rows from the exhaustive DESIGN information contract first, then independently audit the six current owned paths/selectors against them and remediate only proven residual nonconformance. Research/Requirements/Solution design/Plan share one current-attention/Document/Dialogue/Review grammar while retaining stage-specific information obligations. Current required input/proposal/blocker/processing owns attention; current governed document is primary otherwise; history/evidence/activity is subordinate. Provider session, baseline/context identity, raw Run/event tags and repository paths where semantic document labels suffice are Technical/Diagnostic and absent from ordinary productive-stage presentation; provider failure promotes only human-readable blocker/recovery meaning.
**Forbidden:** old stage layout reuse; IA27 foundation/retained-atom mutation; feature-owned responsive topology; copying prior dialogue/proposal/timeline composition.
**Proof:** historical IA30 reconstruction provenance + DESIGN-contract conformance review across all four productive stages + exact residual-delta/no-edit ledger + four-kind Research/Change/Defect downstream browser matrix including default-hidden provider/session/path/event identity and positive Technical/Timeline/Evidence disclosure + all six IA30 face-ledger rows PASS.

## IA31 — revalidate and remediate Readiness and Approval on the resumed baseline

**Solution:** SD25 plus IA16/IA17.
**Owners:** `ui/src/ReadinessWorkspace.tsx`, `ui/src/SignoffReview.tsx`.
**Required mutation:** load the exact IA31 Readiness/Approval/task-detail `SURF-*` rows from the exhaustive DESIGN information contract first, then independently audit the two current replacement screens/selectors against them and remediate only proven residual nonconformance. Readiness makes typed R3 verdict/findings/return owner dominant. Approval makes readiness/currentness/task meaning dominant and sign-off the sole primary mutation; artifact/package role/path/hash, package hash/baseline/commit and approval/task ids are subordinate Technical details / Task technical details and absent before disclosure.
**Forbidden:** old generic stage/card review markup; IA27 foundation/retained-atom mutation; technical-identity-first hierarchy.
**Proof:** historical IA31 reconstruction provenance + DESIGN-contract conformance review + exact residual-delta/no-edit ledger + readiness return/blocked/ready and Approval current/stale/sign-off tests, including hidden-before-disclosure and visible-after-disclosure technical identity while the primary review hierarchy remains present + all three IA31 face-ledger rows PASS.

## IA32 — destructively replace Implementation

**Solution:** SD26.
**Owner:** `ui/src/ExecutionWorkspace.tsx`.
**Retained dependencies:** replacement `RunEventTimeline` from IA30, accepted IA27 Workbench foundation, canonical execution/query owners.
**Required mutation:** delete the old Implementation screen at the purge checkpoint, then recreate it from the exact IA32 `SURF-*` rows in the exhaustive DESIGN information contract as the canonical operational master/detail topology. Detail presents current task/owner/action, attempt, blocker, validation and chronology; historical selection never steals current attention. Task/approval/plan/Run ids, baseline/context/provider session and raw execution diagnostics are Technical and absent from ordinary task detail; Evidence owns exact resource identity/bytes after explicit open.
**Forbidden:** old stacked/card/task-count-driven layout; IA27 foundation/retained-atom mutation; copying prior execution markup/classes.
**Proof:** purge evidence + DESIGN-contract conformance trace + execution task/attempt/blocker/validation tests proving default-hidden ids/session/baseline and positive Technical/Evidence disclosure + both IA32 face-ledger rows and `implementation-states.svg` PASS at wide/narrow.

## IA33 — destructively replace Complete, Evidence and Context

**Solution:** SD27 plus IA19 product-language projection.
**Owners:** `ui/src/TerminalResult.tsx`, `ui/src/EvidenceViewer.tsx`, `ui/src/WorkItemContext.tsx`.
**Retained dependencies:** approved raw-content leaves, `ui/src/workbench-presentation.ts`, canonical material/query owners.
**Required mutation:** delete all three old screens at the purge checkpoint, then recreate Terminal result, Evidence and Compact Context from the exact IA33 `SURF-*` rows in the exhaustive DESIGN information contract. Complete makes final outcome primary, candidate resources only when applicable, and linked remediation a separate authoring action. Internal event tags/role codes/ids/hashes never become ordinary result copy. Evidence intentionally owns exact evidence identity/bytes; Context is explicitly opened supporting/technical orientation only and never auto-opens.
**Forbidden:** old result/evidence/context card systems; IA27 foundation/retained-atom mutation; copying prior screen hierarchy.
**Proof:** purge evidence + DESIGN-contract conformance trace + candidate/non-candidate/linked-remediation/material tests rejecting internal event/role vocabulary from default Complete and proving exact Evidence/Context identity only after explicit open + all three IA33 face-ledger rows and linked-remediation state reference PASS.

## IA34 — destructively replace Settings and OpenCode/account configuration

**Solution:** SD28 plus IA18.
**Owners:** `ui/src/SettingsWorkspace.tsx`, `ui/src/OpenCodeAccountSettings.tsx`.
**Required mutation:** delete both old Settings/account-management screen implementations at the purge checkpoint, then recreate operator-first Settings/configuration screens from the exact IA34 `SURF-*` rows in the exhaustive DESIGN information contract. Readiness/meaning/actions are primary; exact roots/endpoints/account identifiers/provider mechanics are Technical unless the active Add/Move/model/account task requires that exact value as its input/selection. Raw enum/status codes are mapped to operator language rather than rendered literally. `OpenCodeAccountControl` is an IA28 application-shell dependency and must not be recreated or restyled here.
**Forbidden:** old admin/card/account/repository/model screen grammar; IA27 foundation/retained-atom mutation; feature-local structural CSS.
**Proof:** purge evidence + DESIGN-contract conformance trace + readiness/repository/account/model/login/confirmation tests proving ordinary-vs-active-input-vs-Technical-details placement + all eleven IA34 face-ledger rows PASS at wide/narrow/theme as applicable.
## IA26 — rendered 0.6.0 UX/UI acceptance evidence

**Solution/authority:** existing SD16-SD18 verification and Workbench realization, current `GW-DOC-WORKBENCH-UX`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, and the reviewed derived visual reference pack at `docs/references/workbench-ui/README.md`. Current R2/DESIGN/P3-P6 authority wins over any 0.5.0 SVG reference on conflict.  
**Owners/anchors:** `tests/browser.spec.ts` for deterministic rendered-state capture and coverage assertions; `.github/workflows/ci.yml` for exact-candidate execution and evidence publication; `tests/certification.test.ts` for the exact CI supply-chain rule permitting only the pinned first-party artifact uploader required by this acceptance path.  
**Required mutation:** extend the existing Playwright/GitHub Actions verification path so the exact PR merge candidate renders and captures the complete governed Workbench surface/state set after the ordinary `browser` gate is green. The implementation must:
- capture every one of the nine lifecycle steps — Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete — from populated deterministic canonical fixtures, not empty shells;
- capture every `SURF-*` entry in the `docs/references/workbench-ui/README.md` complete audited surface table, including Queue, Create, Settings/repositories, Settings/OpenCode/accounts, model/runtime Settings, Context, document authoring/read-only, dialogue/activity, proposal review, evidence, approval-task detail, execution-task detail and all confirmation/destructive overlays;
- capture all materially distinct reference/state sheets listed by that README: current-attention precedence, dialogue interaction, proposal, document, Implementation task, Queue, application notices, installation readiness, linked-remediation Create/Complete branches, OpenCode login terminal states, safety confirmations, responsive composition and theme parity;
- prove all four WorkItem kinds represented by the reference pack — Change, Defect, Investigation and Audit — at the information-contract surfaces where the kinds materially differ;
- capture every primary workflow step at a wide desktop viewport and at a narrow viewport; additionally capture Light and Dark representatives for every primary interaction class and System against both mocked effective schemes, preserving the existing semantic theme assertions;
- emit an evidence manifest for every capture containing exact checked-out commit SHA, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, runtime route/selection, corresponding SVG reference path and governing current authority refs;
- place the actual PNG captures, the manifest and a generated index that pairs each actual capture with its SVG reference path into one GitHub Actions artifact for review;
- fail the Actions acceptance step when a required surface/state/reference mapping is missing or duplicated, a fixture cannot reach the declared canonical state, the page emits an uncaught browser/runtime error, the capture is absent/empty, or the manifest/capture set is not exhaustive.

**Acceptance review:** the Actions artifact is evidence, not authority. Every manifest row must receive an explicit `PASS` or `FAIL` against three independent dimensions before IA24:
1. **schema/information fidelity** — required Primary information is present and correctly named/grouped/prioritized; Technical/Diagnostic information is absent from the ordinary surface; the authorized Technical details/Context/Evidence/confirmation owner exposes exactly its owned value only after explicit entry; close/return restores the ordinary hierarchy without losing current attention;
2. **UX/interaction fidelity** — the owning interaction grammar, current-attention owner, action precedence, navigation/material hierarchy, state/recovery semantics and responsive composition match current authority;
3. **visual/UI fidelity** — hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, truncation/wrapping, overlays and theme behavior materially conform to current authority and, where not superseded, the reviewed SVG composition.

Any `FAIL` creates a blocking remediation item owned by the defective implementation/authority layer and requires a fresh post-fix exact-candidate Actions capture for the affected row plus regression revalidation. No aggregate pass may hide a failed row.

**Forbidden:** treating the 0.5.0 SVG pack as semantic/product authority; pixel-diff threshold as the sole acceptance criterion; screenshot approval in place of existing semantic/browser assertions; generated screenshots blessed from the current implementation without comparison; a new visual-regression SaaS/platform dependency; committing runtime screenshots as a second design system; changing product behavior merely to match a superseded SVG.  
**Proof:** required PR Verification rendered-acceptance step succeeds on the exact candidate, publishes the exhaustive evidence artifact, and the screen-by-screen acceptance ledger has no unresolved `FAIL`; every applicable row includes default-hidden and authorized post-disclosure evidence/assertions without creating additional semantic SURF rows. IA24 may not close before that evidence/review is complete.

