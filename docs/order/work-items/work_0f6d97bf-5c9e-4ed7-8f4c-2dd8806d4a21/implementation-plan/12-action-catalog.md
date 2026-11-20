# 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

## Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD20 non-UI remainder; IA01-IA10/IA25/SD20 portion of IA23 | — | core/daemon/shell + exact-pin verification | no reintroduction of execution-foundation or provider compatibility paths | all ordinary gates + targeted non-UI regressions |
| T2 | SD21; IA27 | T1 | `ui/src/primitives/**`, `theme.css`, `styles.css` | duplicate/obsolete recurring UI/layout systems and feature-era primitive-equivalent selectors removed | primitive ownership/Astryx conformance + wide/narrow/theme harness PASS |
| T3 | SD22 + SD03/SD05; IA11/IA12/IA28 | T2 | Queue/Create/application entry renderers | old Queue/Create table/form/modal grammar removed | Queue/Create functional matrix + rendered comparisons PASS |
| T4 | SD23; IA13/IA14/IA29 | T3 | WorkItem shell, rail, Work request/document renderers | generic frame/identity/rail/document competing presentation removed | Work request/document/current-attention/Git + rendered PASS |
| T5 | SD24; IA15/IA30 | T4 | pre-signoff Dialogue/Document/Proposal adapters | stage-local dialogue/proposal/timeline/layout systems removed | Research/Requirements/Design/Plan semantic + rendered PASS |
| T6 | SD25; IA16/IA17/IA31 | T5 | Readiness + Approval renderers | generic stage/card and technical-first review grammar removed | readiness/return/currentness/sign-off + rendered PASS |
| T7 | SD26; IA32 | T6 | Execution renderer | alternate stacked/card/task-count-driven execution layouts removed | task/attempt/blocker/validation/master-detail + rendered PASS |
| T8 | SD27 + SD01 projection; IA19/IA33 | T7 | Complete/Evidence/Context renderers | result/evidence/context feature-card systems removed | candidate/non-candidate/evidence/context + rendered PASS |
| T9 | SD28 + SD14; IA18/IA34 | T8 | Settings/account/configuration renderers | bespoke admin/account/repository/model component grammar removed | settings/readiness/account/model + rendered PASS |
| T10 | SD16-SD18/SD29; IA20-IA23 | T9 | verification only | no production mutation; any production defect routes to T2-T9 | exhaustive renderer/theme/responsive/scenario/regression certification PASS |
| T11 | SD30; IA26/IA24 | T10 | rendered evidence + CI + closeout metadata | no screenshot-driven production patch inside acceptance task | exhaustive manifest + row-level schema/UX/visual PASS + final V0-V7 |

**Audit rule:** a task cannot be marked complete because later tasks happen to render acceptably. Its own deletion evidence, semantic proof and rendered proof must be retained. A downstream task discovering a foundation defect reopens the owning earlier task rather than patching around it.

## Execution waves

0. **Preflight 0 — DESIGN-positive reuse proof:** IA07-IA08. No production mutation.
1. **Wave 1 — authority/source/task/runtime corrections:** IA01-IA10 plus IA25 where still unsatisfied.
2. **Wave 2 — Workbench foundation replacement:** IA27. No feature renderer migration may begin until this passes its architecture/browser checkpoint.
3. **Wave 3 — Queue/Create:** IA11, IA12, IA28.
4. **Wave 4 — WorkItem shell + Work request/document:** IA13, IA14, IA29.
5. **Wave 5 — productive pre-signoff stages:** IA15, IA30.
6. **Wave 6 — Readiness/Approval:** IA16, IA17, IA31.
7. **Wave 7 — Implementation master/detail:** IA32.
8. **Wave 8 — Complete/Evidence/Context/product language:** IA19, IA33.
9. **Wave 9 — Settings/account/configuration:** IA18, IA34.
10. **Wave 10 — permanent semantic/component certification:** IA20-IA22.
11. **Wave 11 — cross-solution regression closure:** IA23.
12. **Wave 12 — rendered product acceptance:** IA26.
13. **Wave 13 — candidate closeout:** IA24.

Before Wave 1, BUILDER requests the signed `dependency-lock` gate once through the existing SD13 coordinator checkpoint and it must `GATE_PASSED`. After Wave 2 and after each presentation wave 3-9, the signed `architecture` gate and the task-specific browser subset must pass before its dependent UI task begins. A downstream renderer task may not change `ui/src/primitives/**`, `ui/src/theme.css` or `ui/src/styles.css`; if the canonical composition cannot be realized, execution returns to IA27 rather than introducing local presentation ownership. Wave 10 proves the migrated renderer/component/theme system semantically. Wave 12 produces exact-candidate rendered evidence only after ordinary gates are green. Wave 13 closes only after every rendered row is accepted.

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
**Required mutation:** derive/check complete production renderer coverage against canonical P4 matrix, including ActivityComposer; fail on an unclassified renderer.  
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


## IA27 — rebuild the Workbench primitive/theme foundation

**Solution:** SD21, with SD29 structural responsibilities.
**Owners:** every existing `ui/src/primitives/*.tsx` owner; `ui/src/theme.css`; `ui/src/styles.css`.
**Required mutation:** rebuild the existing closed P4 primitive vocabulary so it is the sole recurring structural/visual grammar. Primitive APIs remain domain/query/policy blind and keep the canonical responsibilities; implementations may be replaced internally. Use pinned Astryx public components/props/density/layout first and public theme tokens second. Establish canonical shell/form/table/status/notice/task-panel/review/master-detail/context/dialogue/settings/resource/timeline geometry and wide/medium/narrow behavior. Reduce `styles.css` to foundation imports/global non-feature ownership. Remove duplicate/obsolete layout systems and recurring feature-era selectors from `theme.css` rather than preserving aliases/overrides.
**Hard audit boundary:** IA27 must not import WorkItem/Run/domain/query state into primitives. It must not change domain contracts, API/query ownership or lifecycle semantics. It must not introduce a new primitive responsibility unless DESIGN is amended.
**Deletion proof:** no compatibility presentation path, hidden legacy DOM grammar, private Astryx token/internal selector, generic arbitrary-slot mega-primitive, feature-specific breakpoint authority or duplicate recurring component system remains.
**Proof:** architecture/certification primitive-to-Astryx/ownership checks; focused primitive browser harness across wide/narrow and Light/Dark; CSS selector audit. IA28-IA34 are blocked until IA27 PASS.

## IA28 — migrate Queue and Create onto the rebuilt foundation

**Solutions:** SD22 plus existing SD03/SD05 semantic deltas through IA11/IA12.
**Owners:** `ui/src/app.tsx`, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`.
**Required mutation:** recompose Queue as the canonical Operational scan and Create/remediation as the canonical bounded Form/configuration task using IA27 primitives only. Keep normal populated Queue separate from source-diagnostic, empty, search and archive states. Create must present controlled Project/kind/Concerns/title plus system-derived context with one dominant Create action and no editable linked-remediation project.
**Deletion proof:** remove Queue/Create feature-owned recurring table/form/control/status/layout chrome and any legacy page/modal composition that duplicates primitive responsibilities.
**Forbidden:** modifying primitive/theme/style owners from this task; feature-local component CSS; inventing new queue/create semantics from SVGs.
**Proof:** functional Queue/Create browser matrix, wide+narrow capture, Light/Dark representative capture, and explicit comparison to `queue*.svg`, `create-work-item.svg`, `create-linked-remediation.svg`; zero unresolved row-level FAIL before IA29.

## IA29 — migrate WorkItem shell, Work request and governed documents

**Solution:** SD23 plus IA13/IA14 where applicable.
**Owners:** `ui/src/WorkItemWorkspace.tsx`, `ui/src/WorkItemIdentityRow.tsx`, `ui/src/WorkflowRail.tsx`, `ui/src/WorkflowStepFrame.tsx`, `ui/src/DocumentWorkspace.tsx`, `ui/src/MarkdownEditor.tsx`, `ui/src/MarkdownSourceEditor.tsx`.
**Required mutation:** compose one stable selected-WorkItem shell from toolbar/identity/nine-stage rail/current-attention/primary material/optional Context slots. Work request is a Document interaction with source intent primary and metadata/Git/currentness subordinate. Preserve exact current-attention reachability during historical/document inspection and exact governed Git review.
**Deletion proof:** delete generic-frame/layout branches, identity/rail/document chrome and old selectors that compete with primitive-owned shell/document geometry.
**Forbidden:** changing lifecycle/material-selection/query semantics; modifying IA27 owners.
**Proof:** Work request/document/Git/current-attention browser tests plus wide+narrow rendered comparison to Work request/document/current-attention references; zero unresolved FAIL before IA30.

## IA30 — migrate Research, Requirements, Solution design and Plan

**Solution:** SD24 plus IA15 and existing productive-stage semantic corrections.
**Owners:** `ui/src/PreSignoffStageWorkspace.tsx`, `ui/src/ActivityWorkspace.tsx`, `ui/src/ActivityComposer.tsx`, `ui/src/WorkflowMaterialSelector.tsx`, `ui/src/ProposalReview.tsx`, `ui/src/RunEventTimeline.tsx`.
**Required mutation:** make all productive pre-signoff stages use one Surface/Attention/Selector composition with canonical Document, Dialogue and Review sub-compositions. Current required input/proposal/blocker/processing owns attention; current governed document is primary otherwise; history/evidence/activity stays subordinate. Stage-specific schema/information obligations change content only, never layout grammar.
**Deletion proof:** remove stage-local dialogue/proposal/timeline/layout systems, feature-selected overlay mechanics and presentation branches that duplicate IA27.
**Forbidden:** modifying Run/RunEvent/proposal/adoption authority; modifying IA27 owners.
**Proof:** four-kind Research + Change/Defect downstream browser matrix, required-input focus once, proposal/document/dialogue states, wide+narrow and per-stage rendered comparisons; zero unresolved FAIL before IA31.

## IA31 — migrate Readiness and Approval reviews

**Solution:** SD25 plus IA16/IA17.
**Owners:** `ui/src/ReadinessWorkspace.tsx`, `ui/src/SignoffReview.tsx`.
**Required mutation:** render both as canonical Review compositions. Readiness makes typed R3 verdict/findings/return owner dominant. Approval makes readiness/currentness/task meaning dominant with technical package identity subordinate and exact sign-off as the sole primary mutation.
**Deletion proof:** remove generic stage-frame/card presentation and technical-identity-first review layout.
**Forbidden:** changing R3/Approval contracts or ingress semantics; modifying IA27 owners.
**Proof:** readiness return/blocked/ready and Approval current/stale/sign-off cases plus wide+narrow rendered comparison to readiness/approval references; zero unresolved FAIL before IA32.

## IA32 — migrate Implementation operational master/detail

**Solution:** SD26.
**Owner:** `ui/src/ExecutionWorkspace.tsx` consuming IA27 primitives and the IA30 timeline adapter.
**Required mutation:** use the one canonical persistent operational master/detail topology. Wide has fixed master width; constrained uses primitive-owned start Drawer while detail remains primary. Detail presents current execution owner/action, attempt, blocker, validation and chronology; historical task selection never steals current attention.
**Deletion proof:** delete alternate stacked/card/task-count-driven execution layouts and execution-specific recurring component chrome.
**Forbidden:** changing execution/task/validation semantics; modifying IA27 or IA30 owners.
**Proof:** execution task-state/attempt/blocker/validation browser matrix plus wide+narrow rendered comparison to implementation/task-state references; zero unresolved FAIL before IA33.

## IA33 — migrate Complete, Evidence and Context/material surfaces

**Solution:** SD27 plus IA19 product-language projection.
**Owners:** `ui/src/TerminalResult.tsx`, `ui/src/EvidenceViewer.tsx`, `ui/src/WorkItemContext.tsx`.
**Required mutation:** Complete uses canonical Terminal-result composition with final outcome primary, candidate resources only for executed delivery and linked remediation as separate authoring. Evidence uses Evidence-class presentation. Context is secondary/supporting only, docked wide and Drawer constrained.
**Deletion proof:** remove result/evidence/context feature-card systems, duplicated metadata/status chrome and alternate context topology.
**Forbidden:** changing outcome/resource/material semantics; modifying IA27 owners.
**Proof:** candidate/non-candidate/linked-remediation/evidence/context browser cases plus wide+narrow rendered comparison; zero unresolved FAIL before IA34.

## IA34 — migrate Settings and OpenCode/account configuration

**Solution:** SD28 plus IA18.
**Owners:** `ui/src/SettingsWorkspace.tsx`, `ui/src/OpenCodeAccountControl.tsx`, `ui/src/OpenCodeAccountSettings.tsx`.
**Required mutation:** use canonical SettingsLayout/Form/Table/Status/Notice/Confirmation composition. Productive readiness, meaning and available operator actions are primary. Exact paths/endpoints/account/credential-like identity are subordinate unless the active configuration task requires them. Repository/account/model tasks use the same control/action grammar as Create.
**Deletion proof:** remove admin-page/card/bespoke account/repository/model component systems and recurring Settings feature chrome.
**Forbidden:** changing config/provider/readiness ownership; modifying IA27 owners.
**Proof:** settings/readiness/repository/account/model/login/confirmation browser matrix plus wide+narrow and theme rendered comparisons; zero unresolved FAIL before IA20-IA23/IA26.
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
1. **schema/information fidelity** — required current information is present, correctly named/grouped/prioritized, and no required schema information is silently absent;
2. **UX/interaction fidelity** — the owning interaction grammar, current-attention owner, action precedence, navigation/material hierarchy, state/recovery semantics and responsive composition match current authority;
3. **visual/UI fidelity** — hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, truncation/wrapping, overlays and theme behavior materially conform to current authority and, where not superseded, the reviewed SVG composition.

Any `FAIL` creates a blocking remediation item owned by the defective implementation/authority layer and requires a fresh post-fix exact-candidate Actions capture for the affected row plus regression revalidation. No aggregate pass may hide a failed row.

**Forbidden:** treating the 0.5.0 SVG pack as semantic/product authority; pixel-diff threshold as the sole acceptance criterion; screenshot approval in place of existing semantic/browser assertions; generated screenshots blessed from the current implementation without comparison; a new visual-regression SaaS/platform dependency; committing runtime screenshots as a second design system; changing product behavior merely to match a superseded SVG.  
**Proof:** required PR Verification rendered-acceptance step succeeds on the exact candidate, publishes the exhaustive evidence artifact, and the screen-by-screen acceptance ledger has no unresolved `FAIL`. IA24 may not close before that evidence/review is complete.

