# 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

## Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD30; IA01-IA34 | — | one cumulative 76-path 0.6.0 candidate; internal waves below own ordered mutation/proof responsibilities | C19-F09/C20-F11 reset: IA27 consumes the closed SD21 component ledger and realizes required-new/decompose/destructive/absent foundation dispositions; IA28 freshly re-accepts the foundation; IA29-IA34 fully revalidate every affected renderer and apply the exact owner disposition below | final V0-V7 + SD16-SD18/SD29 certification + IA26/SD30 exact-candidate 37-SURF and component-architecture acceptance |

**Audit rule:** T1 is the only P6 ExecutionTask. Wave/IA ordering below is internal implementation sequencing and never relies on candidate-byte promotion between tasks. A later phase discovering a foundation defect returns to IA27/DESIGN rather than patching around it; T1 cannot close until every owned phase obligation and final candidate proof is satisfied.

## Execution waves

**Pre-sign-off realization boundary:** this catalog confers no bounded or signed implementation authority. Under `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` bounded acceptance-evidence realization may begin only after current R3 has closed the tranche and returned `READY_FOR_SIGNOFF`; current eligibility, G6 state and any exact-package bounded grant are then owned by `0.6.0-design-campaign-plan.md §17A/§18`. The catalog is only the candidate execution definition.


0. **Preflight 0 — DESIGN-positive reuse proof:** IA07-IA08. No production mutation.
1. **Wave 1 — authority/source/task/runtime corrections:** IA01-IA10 plus IA25 where still unsatisfied.
2. **Wave 2 — bounded shell/Context foundation realization:** bounded IA27 consumes the closed SD21/F6B ledger and realizes only the compile-closed AppShell/WorkItem-shell/Context/responsive/theme + Section/Facts slice and required-absent generic owners. Breaking APIs with later consumers remain unchanged **except** the application-only `WorkbenchToolbar` cutover, whose complete current consumer set is migrated atomically: `app.tsx` consumes the closed application API and `MarkdownEditor.tsx` is dependency-decoupled into its already-authorized Markdown-P3 specialist editor-control region. That narrow dependency migration does not accept IA29; no compatibility path is introduced.
3. **Wave 3 — fresh Queue/Create/account-utility consumer revalidation + bounded foundation acceptance:** IA11, IA12, IA28 consume that IA27 bounded slice. The Toolbar breaking checkpoint includes the IA28-local Queue search dependency migration from `WorkbenchToolbarSearch` to the DESIGN-authorized Astryx `TextInput` Operational-scan leaf so the obsolete Toolbar export can be deleted without a bridge. Queue/Create production bytes may otherwise remain only after fresh authority proof. The grant stops after evidence review; IA29 remains blocked until explicit normal sign-off.
4. **Post-signoff IA27 completion — shared resource collection atomic cutover:** after normal sign-off and before IA29, create `WorkbenchResourceList`, atomically migrate every current `WorkbenchResourceRow` caller, then narrow `WorkbenchResourceRow`. The candidate must typecheck at the same checkpoint; no caller is left on the old API.
5. **Wave 4 — Work request/document/editor reconstruction:** IA13, IA14, IA29 create/cut over WorkbenchDocument/Facts/Section with the complete Document consumer set.
6. **Wave 5 — productive pre-signoff-stage reconstruction excluding Proposal Review:** IA15, IA30 reconstruct R1/R2/DESIGN/PLAN Document/Dialogue/Evidence/State routing and activity/timeline behavior; Proposal Review remains untouched until the atomic Review cutover.
7. **Wave 6 — atomic Proposal/Readiness/Approval Review reconstruction:** IA16, IA17, IA31 create ReviewVerdict/ReviewSection/DocumentChangeView and destructively replace WorkbenchReview in the same change set that migrates **all** current Review consumers: ProposalReview, ReadinessWorkspace and SignoffReview.
8. **Wave 7 — Implementation reconstruction:** IA32 consumes Section/Facts/ResourceList inside the canonical MasterDetail topology.
9. **Wave 8 — Complete/Evidence reconstruction:** IA19, IA33 create/cut over WorkbenchResult with TerminalResult; Complete consumes Section/ResourceList, Evidence remains the exact-byte owner.
10. **Wave 9 — Settings/account-management/configuration reconstruction:** IA18, IA34 consumes Section/Facts/ResourceList while preserving one Settings diagnostics owner.
11. **Wave 10 — permanent semantic/component certification:** IA20-IA22.
12. **Wave 11 — cross-solution regression closure:** IA23.
13. **Wave 12 — rendered product acceptance:** IA26.
14. **Wave 13 — candidate closeout:** IA24.

Before any bounded Wave 2/3 UI mutation, the exact corrected P4/DESIGN/PLAN package must have current R3/G6 `READY_FOR_SIGNOFF` and an explicit exact-package §17A operator grant. That bounded grant authorizes only the compile-closed IA27 shell/Context slice plus IA28 consumers; it never authorizes ResourceRow/ResourceList, Review, Document or Result cutovers. Normal post-evidence execution requires ordinary human sign-off. After sign-off, IA27 first completes the all-caller ResourceRow/ResourceList atomic cutover; IA29/IA31/IA33 own the Document/Review/Result breaking cutovers with their complete consumer sets. Each action consumes SD21/F6B rather than deriving component roles. IA29-IA34 revalidate their complete owned renderer set before editing and execute the catalogued disposition: `DECOMPOSE_REFACTOR` when semantic responsibility is valid but physically overloaded, `DESTRUCTIVE_REPLACEMENT` when hierarchy/API ownership is materially wrong, `BOUNDED_RESIDUAL` only for a strictly local defect, `CONFORMING_NO_EDIT` only after fresh proof, `REQUIRED_NEW` for missing canonical owners and `REQUIRED_ABSENT` for forbidden owners. The 37 SURF rows remain partitioned once across IA27-IA34 and IA26 rechecks the exact-candidate union plus the component-ownership/SoC invariants.
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
**Required mutation:** readiness/meaning/actions primary; exact roots/endpoints/model source/credential-like identity in the one Settings diagnostics/technical-inspection region except when the exact value is the active configuration input.  
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

**Binding intermediate-layer finding:** C19-F09/C20-F11/G-F38. Certification must prove semantic ownership, not component-name presence: wrapping feature-authored hierarchy in a canonical outer component is a failure.

**Solution:** SD16.  
**Owner:** `tests/certification.test.ts`.  
**Required mutation:** check complete production renderer coverage against canonical P4 §8.17 and certify the P4/F6B semantic-component boundary: required-new component modules exist with only allowlisted consumers; `WorkbenchReview` has no arbitrary `body` escape; repeated resources route through `WorkbenchResourceList`; Document/Result/Review/Context consumers do not recreate Section/Facts/resource/review grammar in feature-local structural CSS/JSX; forbidden generic workflow owners remain absent; no production renderer is unclassified or nests/synthesizes another primary composition.
**Forbidden:** edit `tests/architecture.test.ts` inside T1 or create second UI registry.  
**Proof:** certification negative/positive fixture including deliberate forbidden Queue/Review/Terminal/Evidence attention usage, Proposal/Readiness/Approval outer-frame wrapping, and nested-primary-surface composition.

## IA21 — scenario-41 work-kind certification

**Solution:** SD17.  
**Owner:** `tests/browser.spec.ts`.  
**Required mutation:** certify all four kinds' Work request + Research information contracts and distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind semantic matrix.

## IA22 — System/Light/Dark component-semantic parity

**Solution:** SD18.  
**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required mutation:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states preserve canonical semantic roles under all effective themes; theme changes may not change which interaction classes own current attention or create an attention band on Queue/Evidence/Terminal result.  
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


## IA27 — realize the compile-closed Workbench shell/Context foundation and post-signoff resource cutover

**Solution:** SD21 + F6B, with SD29 responsive/accessibility containment.  
**Authority boundary:** P4 defines permanent component responsibilities/APIs; SD21/F6B defines this package's exact realization and consumer-atomic cutover. IA27 does not derive either.

**Cutover law:** a breaking component API changes only in a checkpoint that simultaneously migrates its complete current compile-time consumer set. No compatibility props, overloads, aliases, translators, hidden legacy DOM or old/new dual path are permitted.

| Owner / responsibility | Disposition | Cutover checkpoint | Required consequence |
|---|---|---|---|
| new `WorkbenchSection.tsx` | `REQUIRED_NEW` | bounded IA27 | canonical bounded semantic section used by Context; no feature-local substitute section/card grammar |
| new `WorkbenchFacts.tsx` | `REQUIRED_NEW` | bounded IA27 | canonical structured-facts owner used by Context |
| `WorkbenchContextPanel.tsx` | `DESTRUCTIVE_REPLACEMENT` | bounded IA27 | replace arbitrary children escape with canonical section composition while preserving conforming docked/Drawer mechanics |
| `WorkItemContext.tsx` | `DECOMPOSE_REFACTOR` | bounded IA27 | project selection-aware technical data into Section/Facts; remove recurring local section/facts layout |
| `WorkbenchToolbar.tsx`, `WorkbenchAppShell.tsx`, application-header composition in `app.tsx`, header-owned `theme.css` selectors | `DESTRUCTIVE_REPLACEMENT` | bounded IA27 | atomically migrate the complete current Toolbar consumer set: `app.tsx` to the closed application-only API and remove superseded header DOM/CSS composition; no `start`/`end`/group compatibility API survives |
| `MarkdownEditor.tsx` consumption of `WorkbenchToolbar` | `DEPENDENCY_DELTA` only | bounded IA27 consumer-atomic dependency migration | replace only the superseded application Toolbar/group wrapper with the Markdown-P3-owned compact editor-control region, preserving existing formatting/mode/Save/Cancel mechanics and direct controls→canvas adjacency; no WorkbenchDocument/facts/layout reconstruction and no IA29 acceptance |
| `WorkItemQueue.tsx` consumption of `WorkbenchToolbarSearch` | `DEPENDENCY_DELTA` only | same bounded IA27/IA28 compile-atomic Toolbar cutover | delete the obsolete Toolbar-module search export and render the existing `SURF-QUEUE-001` search/filter through the P4-approved Astryx `TextInput` Operational-scan leaf; preserve query/filter semantics, label/test identity and Queue composition; no additional Queue redesign |
| `WorkItemWorkspace.tsx` shell integration | `BOUNDED_RESIDUAL` | bounded IA27 | preserve canonical routing/shell ownership; correct title-edit action precedence and consume the new Context API |
| `WorkbenchLayout.tsx`, `WorkbenchSelector.tsx`, `WorkflowStepFrame.tsx`, `WorkflowMaterialSelector.tsx` responsibilities | `REQUIRED_ABSENT` | bounded IA27 | delete/keep absent with zero aliases, wrappers, CSS shims, hidden DOM or renamed equivalents |
| `WorkbenchSectionHeader.tsx` and conforming narrow primitives | `CONFORMING_NO_EDIT` after fresh audit | bounded IA27 | retain only after corrected P4 responsibility/API proof; no inherited PASS |
| new `WorkbenchResourceList.tsx` | `REQUIRED_NEW` | **post-signoff IA27 completion** | create the canonical repeated-resource collection only when every existing ResourceRow caller is authorized to migrate |
| `WorkbenchResourceRow.tsx` | `DECOMPOSE_REFACTOR` | **post-signoff IA27 completion** | atomically migrate every current caller to ResourceList/canonical Row API and narrow Row in the same typecheck-clean checkpoint |
| `theme.css` semantic-component selectors | `DECOMPOSE_REFACTOR` | owning cutover checkpoint | add only selectors for components actually cut over at that checkpoint; delete corresponding feature-local recurring grammar only as its consumer migrates |
| `tests/certification.test.ts`, `tests/browser.spec.ts` | `BOUNDED_RESIDUAL` verification | bounded IA27 and later checkpoints | prove exact API/consumer/SoC behavior; tests are not design authority |

**Not owned by the bounded IA27 checkpoint:** `WorkbenchDocument` and the full `DocumentWorkspace`/`MarkdownEditor` Document/editor reconstruction and acceptance (IA29), `WorkbenchReviewVerdict` / `WorkbenchReviewSection` / destructive `WorkbenchReview` + `DocumentChangeView` (IA31), and `WorkbenchResult` (IA33). The only bounded MarkdownEditor mutation is the compile-atomic removal of its invalid application-Toolbar dependency; all IA29-owned information/layout/API reconstruction remains deferred.

**Bounded IA27 ordered mutation:** create/validate Section/Facts; destructively cut over ContextPanel + WorkItemContext together; keep required-absent generic owners absent; atomically re-author AppShell/Toolbar/header/root integration and migrate the complete Toolbar-module consumer set by moving MarkdownEditor controls off the application Toolbar into the existing Markdown-owned editor-control region and moving Queue search off `WorkbenchToolbarSearch` into its DESIGN-authorized Operational-scan `TextInput` leaf; apply bounded theme selectors and the WorkItemWorkspace shell residual; update only bounded proof. The Markdown dependency migration preserves all IA29 semantics and is not IA29 acceptance. The candidate must pass typecheck/build without otherwise touching IA29-IA34 consumer semantics.

**Post-signoff IA27 completion:** after explicit normal sign-off and before IA29, create ResourceList, migrate **all** current direct ResourceRow consumers to ResourceList/canonical Row usage, narrow ResourceRow in the same change set, and prove type/API/consumer closure. No consumer may remain compiled against the superseded Row API.

**Proof:** bounded checkpoint proves Section/Facts/Context API closure, required-absent owners, shell/Context consumer allowlists, one AppShell/WorkItemShell/responsive/Context owner, accessibility/focus/theme and IA27 SURF rows. Post-signoff completion separately proves ResourceList/ResourceRow exact API closure and all-caller migration. Neither checkpoint claims Review/Document/Result cutover before its owning phase.

### Exact IA27-IA34 rendered face ownership


### Binding operator UI findings — human acceptance ledger

**Upstream provenance:** every HUX row below is a concrete rendered/implementation manifestation of the already-governing `C19-F09` intermediate semantic-component/composition finding and its `C20-F11` governance/acceptance closure. The HUX ledger does **not** create a second architecture. `C19-F09` remains the root technical finding: feature renderers may not own recurring Review/facts/resource/Document/Result anatomy. `C20-F11` remains the proof/governance finding: prior PASS/acceptance cannot establish completion of that architecture. HUX rows preserve the operator-observed instances until the owning IA phase proves the exact DESIGN/P4 mapping and receives explicit rendered acceptance.

This ledger records direct operator findings from rendered 0.6.0 review. It is **binding P7 acceptance input**, not commentary and not implementation advice. These rows exist specifically so repeated human review findings cannot disappear between implementation passes, test rewrites or regenerated evidence.

**State law:**
- every row begins OPEN_BLOCKING;
- typecheck, architecture, unit/browser success, screenshot generation or an IA26 machine PASS **cannot** close a row;
- implementation may close the technical defect, but the row remains PROOF_REQUIRED until a fresh exact-candidate capture demonstrates the corrected state;
- only explicit operator disposition of that fresh rendered evidence may set ACCEPTED;
- an unchanged or materially equivalent rejected presentation is not new proof and must not be re-presented as if the finding were unresolved/unknown;
- if implementation cannot satisfy a row using the stated canonical component owner, return to DESIGN/P4 instead of inventing feature-local UI.

| Finding | Operator finding / non-negotiable UX consequence | Affected governed UI | Canonical component realization required | Forbidden presentation | Owning phase | Current state / required proof |
|---|---|---|---|---|---|---|
| HUX-01 | Work-request context does not belong permanently exposed before the Markdown. The actual Work request document is the task; work type, Project, Concerns and repository/document location are subordinate context. | SURF-STEP-WR-001, SURF-MAT-SOURCE-001; evidence: ia26-work-request-step-wide-light, ia26-source-document-editor-wide-dark, ia26-source-document-editor-narrow-light | WorkbenchDocument owns document-first order; WorkbenchDisclosure is the one specifically named same-task **Work request context** expansion; its structured values use WorkbenchFacts; compact Git status/action remains adjacent to the document action. | always-open facts/metadata slab before Markdown; feature-local metadata rows; generic “details” drawer; hiding the document below context | IA29 | OPEN_BLOCKING until wide+narrow source/read/editor proof shows Markdown immediately after document header and Work request context closed by default below it |
| HUX-02 | Lifecycle/read-only documents have the same hierarchy requirement: the governed document is primary; repository placement is supporting and must not dominate the surface. | SURF-MAT-DOC-001, SURF-MAT-DOC-RO-001; evidence: ia26-lifecycle-document-editor-wide-light, ia26-lifecycle-document-readonly-wide-light | WorkbenchDocument + specifically named **Document location** WorkbenchDisclosure + WorkbenchFacts; document title/currentness/action remain header-owned. | path/directory facts before document body; duplicate document shell; nested card/panel around the document | IA29 | OPEN_BLOCKING until editable/read-only wide+narrow proof demonstrates identical document-first information order |
| HUX-03 | Readiness and Approval are not prose documents or “text-branded” slabs. Their typed information must be rendered through the component schema: verdict/currentness, named review responsibilities, task/package/evidence resources and the decision. “Open X” copy must not substitute for a resource UI. | SURF-STEP-R3-001, SURF-STEP-APPROVAL-001, SURF-MAT-APPROVAL-TASK-001; evidence: ia26-readiness-review-wide-light, ia26-readiness-review-narrow-light, ia26-approval-wide-light, ia26-approval-narrow-light, ia26-approval-task-wide-light, ia26-approval-task-wide-dark | exactly one WorkbenchReview with one WorkbenchReviewVerdict; each DESIGN-declared responsibility uses WorkbenchReviewSection; structured facts use WorkbenchFacts; repeated package/task/evidence/history objects use WorkbenchResourceList/WorkbenchResourceRow; task action uses WorkbenchAction; selecting a governed document replaces Review with WorkbenchDocument and bounded Back navigation. | arbitrary Review body; screen-local order-review-* section/card/grid grammar; repeated explanatory prose describing objects already represented by components; textual “Open readiness review / Open solution design / Open requirements …” navigation rows; nesting a full Document inside Review | IA31 | OPEN_BLOCKING until Readiness ready/return, Approval current/stale and task-detail rendered proof shows componentized information with no slab-text substitute |
| HUX-04 | Proposal review is a **document change review**, not a Git-diff text viewer. The human must review the proposed document in document context; exact unified diff is secondary inspection. | SURF-MAT-PROPOSAL-001; evidence: ia26-proposal-review-wide-light, ia26-proposal-review-wide-dark, adopted/adopting/rejected variants | WorkbenchReview + Review sections; DocumentChangeView derives current/proposed document presentation from current target bytes + canonical unified diff and visibly marks changed regions in context; rationale/target meaning occupy their declared Review responsibility; exact diff is a secondary intentional inspection. | raw CodeBlock(unifiedDiff) as sole/dominant review; Git patch syntax as the default human proposal UI; second proposal state/model | IA31 | OPEN_BLOCKING until pending/adopting/adopted/rejected proof shows document-first change review with visibly changed regions and collapsed/secondary exact diff |
| HUX-05 | Mixed rounded-card and flat/straight container treatment is visually inconsistent and has been rejected repeatedly. Semantic grouping must come from component anatomy/spacing, not arbitrary cards. | cross-cutting Document/Review/productive surfaces, explicitly the lifecycle read-only/editor and Review families in the rejected IA26 corpus | current P3/P4/theme component roles only; persistent primary WorkbenchDocument/WorkbenchReview surfaces remain flat; radii/borders appear only where the canonical component role owns a real control/container boundary. | feature-local card chrome; rounded outer Review/Document/page panels; inconsistent nested rounded-versus-square surface framing; tokenized radius used merely because a token exists | IA29/IA30/IA31 + SD29 visual verification | OPEN_BLOCKING until affected proof surfaces show one coherent flat Workbench grammar and certification proves semantic role, not merely radius-token use |
| HUX-06 | Current-action/historical-return UI must not collide with or overlay the selected lifecycle document. The selected primary composition keeps its own geometry. | SURF-STEP-R1-001, SURF-STEP-R2-001, SURF-STEP-DESIGN-001, SURF-STEP-PLAN-001, SURF-MAT-DOC-RO-001; evidence: ia26-lifecycle-document-editor-wide-light (“Approval is ready for your action / Return to Approval” collision) | direct primary composition selected by IA30; historical-return/current-owner navigation is a bounded action outside the Document content geometry and cannot create a second attention/header layer over it. | overlapping attention text/button on document heading; generic current-attention strip inserted into historical Document; two competing primary headers | IA30 | OPEN_BLOCKING until current/historical document captures demonstrate non-overlapping ownership and stable document geometry |
| HUX-07 | Narrow Markdown editing controls must remain readable/discoverable. Truncated mode labels and compressed Save/Cancel are not acceptable responsive behavior. | SURF-MAT-SOURCE-001, SURF-MAT-DOC-001; evidence: ia26-source-document-editor-narrow-light | Markdown specialist editor-control region retains Edit/Preview/Split, formatting and Save/Cancel semantics with P4/Markdown-contract responsive recomposition/overflow while preserving direct controls→canvas adjacency. | clipped “E. / P… / S.” labels; unreadable or collapsed Save/Cancel; controls hidden by width without an intentional overflow mechanism | IA29 + SD29 | OPEN_BLOCKING until narrow rendered/browser proof establishes all mode and mutation controls remain discoverable and operable |
| HUX-08 | No screen may replace the granular information/component contract with undifferentiated prose. Every information area must be projected into the canonical semantic owner defined by DESIGN/P4; implementation does not invent ad-hoc slabs. | all 37 governed SURF-* rows, with immediate blocking focus on IA29-IA31 rejected surfaces | enforce the closed mapping canonical datum/action -> P3 class -> DESIGN row -> semantic component owner -> exact composition position; Section/Facts/ResourceList/ReviewVerdict/ReviewSection/Document/Dialogue/Evidence/Result are mandatory where assigned. | “slab text”, explanatory copy used as structure, local recurring section/facts/resource/review grammar, component wrappers whose arbitrary ReactNode body lets the feature rebuild the UI hierarchy | IA20 certification + each owning implementation phase + IA26 | OPEN_BLOCKING globally until all affected phase proofs and final IA26 ledger have zero unresolved human findings |

**No-loss rule:** IA29, IA30 and IA31 may not be recorded complete while any finding owned by that phase remains OPEN_BLOCKING or PROOF_REQUIRED. IA26 final acceptance additionally requires every HUX-* row to be ACCEPTED. The implementation team must reference the relevant HUX-* ids in commits/tests/proof notes for the corrected surfaces so a future session can trace each rendered correction back to the exact operator finding.

**C19-F09 implementation-completion matrix:** the intermediate semantic layer is complete only when every applicable consumer has stopped owning the recurring anatomy assigned to the canonical component. A component import or wrapper is not completion.

| Phase | Required C19-F09 realization | Current audit disposition |
|---|---|---|
| IA29 | Work request/editable/read-only document consumers are fully owned by `WorkbenchDocument`; structured subordinate context uses `WorkbenchFacts` only in the DESIGN-authorized named same-task disclosure; Markdown specialist owns only editor mechanics. | **INCOMPLETE / RE-PROVE** — HUX-01/HUX-02/HUX-07/HUX-05 remain blocking. Prior IA29 completion claims are superseded by rendered evidence. |
| IA30 | productive Research/Requirements/DESIGN/PLAN renderers route directly to Document/Dialogue/Evidence/State and contain no recurring feature-owned section/context/card grammar. | **INCOMPLETE** — current feature-local productive-stage grammar remains evidence of C19-F09. |
| IA31 | Proposal/Readiness/Approval use the closed Review schema: one ReviewVerdict, DESIGN-declared ReviewSections, Facts only for classified structured facts, ResourceList for repeated resources, DocumentChangeView for proposal document mutation; no local Review hierarchy. | **INCOMPLETE / RE-PROVE** — HUX-03/HUX-04/HUX-08 remain blocking; current provisional bytes require exact SURF-to-component audit before acceptance. |
| IA32 | Implementation detail uses MasterDetail + Section/Facts/ResourceList; no local `order-implementation-*` section/list/card system recreates semantic anatomy. | **NOT COMPLETE** — current renderer still owns recurring section/list anatomy. |
| IA33 | Complete uses `WorkbenchResult` + canonical Section/ResourceList; no local terminal-result hierarchy owns outcome/resources/content grouping. | **NOT COMPLETE** — current renderer still owns local terminal section grammar. |
| IA34 | Settings/account/model/repository surfaces use SettingsLayout + Section/Facts/ResourceList/Form owners; no feature-local pane/resource/facts/diagnostic grouping except the one authorized diagnostics owner. | **NOT COMPLETE** — current renderers still own substantial recurring pane/section/resource anatomy. |

**Completion test:** for every affected SURF row, review the complete datum/action inventory and record exactly one chain `canonical datum/action -> P3 class -> DESIGN SURF row -> canonical semantic component -> exact placement/visibility/action`. If the feature renderer must invent recurring hierarchy, grouping, resource grammar, responsive behavior, border/background/radius or explanatory prose to make the information understandable, the C19-F09 realization is not complete and the phase cannot PASS.



The 37 governed `SURF-*` rows declared by current `solution-design.md` remain partitioned exactly once across IA27-IA34. G-F30 changes only physical cutover timing and moves Proposal Review acceptance to IA31 so the WorkbenchReview API can change atomically with all Review consumers.

| Phase | Exact owned SURF rows | Required state/reference sheets before phase advance |
|---|---|---|
| IA27 | `SURF-WI-001`, `SURF-WI-CONTEXT-001` | bounded WorkItem shell + singular technical Context + shell/responsive readiness only; no claim that later shared APIs are cut over |
| IA28 | `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` | fresh rendered acceptance of the bounded shell/Context foundation slice through application-shell/Queue/Create |
| IA29 | `SURF-STEP-WR-001`, `SURF-MAT-SOURCE-001`, `SURF-MAT-DOC-001`, `SURF-MAT-DOC-RO-001`, `SURF-CONF-DIRTY-DEST-001`, `SURF-CONF-DIRTY-MATERIAL-001`, `SURF-CONF-ARCHIVE-001`, `SURF-CONF-DOC-GIT-001` | Work request/WorkbenchDocument/Facts/editor states and owned confirmations |
| IA30 | `SURF-STEP-R1-001`, `SURF-STEP-R2-001`, `SURF-STEP-DESIGN-001`, `SURF-STEP-PLAN-001`, `SURF-MAT-ACTIVITY-001` | productive-stage Document/Dialogue/Evidence/State routing and four-kind Research differences; Proposal Review remains IA31 |
| IA31 | `SURF-MAT-PROPOSAL-001`, `SURF-STEP-R3-001`, `SURF-STEP-APPROVAL-001`, `SURF-MAT-APPROVAL-TASK-001` | atomic Proposal/Readiness/Approval WorkbenchReview cutover: ReviewVerdict/ReviewSections/Facts/ResourceList + DocumentChangeView; required-input; current/stale/task detail |
| IA32 | `SURF-STEP-EXEC-001`, `SURF-MAT-EXEC-TASK-001` | Implementation MasterDetail/Section/Facts/ResourceList; current-vs-historical selection; blocker/action/validation |
| IA33 | `SURF-STEP-COMPLETE-001`, `SURF-MAT-EVIDENCE-001` | Complete WorkbenchResult/Section/ResourceList; linked remediation; candidate/non-candidate terminal states; Evidence |
| IA34 | `SURF-SET-001`, `SURF-SET-REPO-001`, `SURF-SET-REPO-ADD-001`, `SURF-SET-REPO-MOVE-001`, `SURF-SET-OC-001`, `SURF-SET-OC-RENAME-001`, `SURF-SET-OC-ADD-001`, `SURF-SET-OC-LOGIN-001`, `SURF-SET-MODEL-001`, `SURF-CONF-REPO-DISCONNECT-001`, `SURF-CONF-OC-REMOVE-001` | Settings repository/account/model readiness and active tasks; login terminal states; destructive confirmations |

The IA27-IA34 union remains exactly **37 unique SURF rows** with no duplicate or unowned row. Each phase records independent `schema_information`, `ux_interaction`, and `visual_ui` verdicts. The bounded IA27/IA28 evidence accepts only the shell/Context foundation slice it exercises. Later component cutovers are independently accepted at their owning phase and globally rechecked by IA20/IA26.

**Audit invariants:** No prior phase PASS is inherited. IA27 does not derive either P4 component contracts or SD21/F6B consumer mapping. Do not add compatibility props or temporary old/new paths. A breaking API cutover must include its complete current compile-time consumer set.

## IA28 — freshly revalidate Queue and Create and accept the bounded shell/Context foundation slice

**Solution:** SD22.  
**Owners:** `ui/src/OpenCodeAccountControl.tsx` non-rendering account presentation/query adapter, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`.  
**Disposition:** `CONFORMING_NO_EDIT` is permitted only after a fresh source + rendered audit against corrected P4/SD21/SD22; any exact consumer migration required by the new foundation is `BOUNDED_RESIDUAL`. No prior RZ16 PASS is inherited.  
**Required action:** consume the bounded IA27 shell/Context candidate, prove Queue remains attention-free Operational scan, Create remains TaskPanel→Form, and prove active-account presentation is projected by the non-rendering `OpenCodeAccountControl.tsx` adapter into the single Toolbar-owned Settings navigation/status slot with no second renderer. No local section/facts grammar may appear. Correct only a proven IA28-local residual; a recurring shell/Context defect returns to bounded IA27/DESIGN. ResourceList/Review/Document/Result are outside this pre-signoff checkpoint.  
**Proof:** `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` plus IA27 shell/Context evidence independently PASS schema/information, UX/interaction, visual/UI, component-ownership and bounded-foundation-realization checks. The bounded grant then stops. IA29 remains blocked until normal explicit sign-off and post-signoff IA27 ResourceList/ResourceRow completion.

## IA29 — reconstruct Work request and governed Document composition

**Binding operator findings:** HUX-01, HUX-02, HUX-07; HUX-05 applies to the Document family visual grammar. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD23.  
**Owner dispositions:** `DocumentWorkspace.tsx` = `DECOMPOSE_REFACTOR`; `MarkdownEditor.tsx` = `DECOMPOSE_REFACTOR` at its outer Document composition/API boundary while preserving its specialist editing mechanics. Its earlier bounded removal of the invalid application-Toolbar dependency is a prerequisite dependency delta only and carries no IA29 PASS.  
**Required mutation:** create `WorkbenchDocument` and atomically migrate its complete Work request/editable/read-only consumer set to that one canonical Document composition. Governed Markdown/editor content follows document identity/currentness/actions immediately. Work type/Project/Concerns/repository path/WorkItem document directory remain available through `WorkbenchFacts` only inside the specifically named same-task `Work request context` (source) or `Document location` (lifecycle document) disclosure placed after the primary content and closed by default; compact Git state/action remains adjacent to the document action. Remove local `WorkRequestFacts`/aside/`dl` layout ownership, any always-open metadata slab and any generic workflow chrome. Remove MarkdownEditor structural props that exist only to host feature-owned document layout; retain one compact editor-control region and direct control→canvas adjacency. Technical identity remains Context-owned.  
**Proof:** all IA29 SURF rows PASS wide/narrow; the Markdown/editor is the first dominant content after the document header; `Work request context` / `Document location` are closed by default and expand through the one named disclosure; no always-open pre-document metadata slab, local document/facts grammar, duplicate heading, raw internal enum/technical identity or generic frame/selector remains; Context and Git consent paths remain exact.

## IA30 — reconstruct productive stages excluding Proposal Review

**Binding operator findings:** HUX-06; HUX-05 applies to productive-stage surface grammar. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD24.  
**Owner dispositions:** `PreSignoffStageWorkspace.tsx` and `RunEventTimeline.tsx` = `DECOMPOSE_REFACTOR` where they own recurring section/timeline grammar; `ActivityWorkspace.tsx`/`ActivityComposer.tsx` = fresh `CONFORMING_NO_EDIT` or bounded migration only after P4 audit. Proposal Review is deliberately excluded until IA31 so WorkbenchReview can cut over with its complete consumer set.  
**Required mutation:** route non-Proposal canonical productive-stage states directly to WorkbenchDocument/Dialogue/Evidence/State. Consume the post-signoff ResourceList cutover where repeated resources occur. Preserve Proposal selection/routing but do not change `ProposalReview.tsx` or WorkbenchReview in this phase.  
**Proof:** all IA30-owned SURF rows PASS; no generic frame/selector or local recurring section/resource grammar in those rows; continuous Dialogue behavior and Context/Evidence inspection remain correct; Proposal Review is unchanged and explicitly unaccepted until IA31.

## IA31 — destructively rebuild Proposal, Readiness and Approval Review composition

**Binding operator findings:** HUX-03, HUX-04; HUX-05 applies to Review-family visual grammar. HUX-08 is the cross-cutting no-slab/component-ownership constraint. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD25 plus IA16/IA17 semantic inputs.  
**Owners:** `ProposalReview.tsx`, `ReadinessWorkspace.tsx`, `SignoffReview.tsx` = `DESTRUCTIVE_REPLACEMENT` of Review presentation composition; new `WorkbenchReviewVerdict.tsx`, `WorkbenchReviewSection.tsx` and `DocumentChangeView.tsx` = `REQUIRED_NEW`; existing `WorkbenchReview.tsx` = `DESTRUCTIVE_REPLACEMENT`. Domain/query/mutation semantics are reused only where independently conforming.  
**Required mutation:** in one compile-atomic change set, create ReviewVerdict/ReviewSection/DocumentChangeView, destructively replace WorkbenchReview with its closed P4 API, and migrate **all three** current WorkbenchReview consumers. Proposal Review renders the proposed governed document through DocumentChangeView with changed regions marked in context and keeps canonical unified diff secondary; no duplicate proposal state/model. Readiness and Approval use exactly one WorkbenchReview, one ReviewVerdict and DESIGN-declared ReviewSections. Findings/return owner, package material and evidence/history use named sections; structured facts use Facts; repeated resources use ResourceList. Remove all `order-review-*` local structural/card/grid systems once migrated. Required-input Dialogue replaces Review for that turn. Approval uses the same Review anatomy and keeps sign-off decision primary; technical identities remain Context-owned.  
**Proof:** Proposal mutation review plus ready/return/required-input and Approval current/stale/sign-off matrices PASS with one verdict, canonical sections/facts/resources, in-context DocumentChangeView, no raw-diff-dominant Proposal surface, whole-R3-under-findings duplication, local review grammar, raw enum, generic selector or technical leakage. Typecheck proves no old WorkbenchReview consumer remains.

## IA32 — destructively rebuild Implementation on canonical semantic components

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA32 is not complete while `ExecutionWorkspace.tsx` or its feature CSS owns recurring task-contract/section/facts/resource anatomy that P4 assigns to MasterDetail/Section/Facts/ResourceList.

**Solution:** SD26.  
**Owner:** `ExecutionWorkspace.tsx` = `DESTRUCTIVE_REPLACEMENT` presentation composition.  
**Required mutation:** purge the old stacked/card/task-detail presentation and fresh-author canonical MasterDetail using Section/Facts/ResourceList for task detail, supporting history/resources and validation grouping. Preserve canonical execution/query/mutation owners; technical task/approval/plan/Run/baseline/context/provider identity routes to Context; exact evidence bytes route to Evidence. Same-task validation expansion alone may use Disclosure.  
**Proof:** purge provenance + IA32 SURF rows PASS wide/narrow; no local recurring card/section/resource grammar, generic technical drawer or current-attention theft by historical selection.

## IA33 — destructively rebuild Complete/Evidence and consume refactored Context

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA33 is not complete while `TerminalResult.tsx` owns recurring outcome/section/resource hierarchy instead of `WorkbenchResult` + canonical Section/ResourceList.

**Solution:** SD27 plus IA19 product-language projection.  
**Owner dispositions:** `TerminalResult.tsx` = `DESTRUCTIVE_REPLACEMENT`; `EvidenceViewer.tsx` = fresh audit then `BOUNDED_RESIDUAL` only if required; WorkItem Context foundation migration is IA27-owned and consumed here.  
**Required mutation:** create `WorkbenchResult` and atomically migrate `TerminalResult` so Complete becomes one attention-free Surface containing one WorkbenchResult: canonical product-facing status/outcome, ordered Sections, ResourceList for repeated resources, permitted result action. Remove local terminal section/resource/status grammar and generic container-taxonomy headings. Evidence remains the one exact-byte primary surface and replaces rather than nests.  
**Proof:** candidate/non-candidate/linked-remediation + Evidence rows PASS; no synthetic attention, duplicated outcome, local result/resource grammar, internal enum/event identity or nested primary Surface.

## IA34 — destructively rebuild Settings/account/configuration presentation

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA34 is not complete while Settings/account/model/repository renderers own recurring pane/section/facts/resource grammar outside SettingsLayout/Section/Facts/ResourceList/Form and the one authorized diagnostics owner.

**Solution:** SD28 plus IA18 semantic inputs.  
**Owners:** `SettingsWorkspace.tsx`, `OpenCodeAccountSettings.tsx` = `DESTRUCTIVE_REPLACEMENT` presentation composition.  
**Required mutation:** rebuild operator-first Settings using Section/Facts/ResourceList plus canonical Form/fields. Required repository roots/context facts remain default-visible Supporting information; task-required exact values become Primary only in the active task; all remaining technical provider/config identity is grouped under the single Settings diagnostics owner. Remove feature-local card/row/section systems and per-section technical disclosures.  
**Proof:** all eleven IA34 rows PASS wide/narrow/theme; canonical component ownership, one diagnostics owner, required facts/active inputs and destructive confirmations are correct.
## IA26 — rendered 0.6.0 UX/UI acceptance evidence

**Binding human-review prerequisite:** every HUX-* row in the operator UI findings ledger must be ACCEPTED. Mechanical evidence generation, browser success and row-level machine checks cannot substitute for that explicit human disposition.

**Solution/authority:** existing SD16-SD18 verification and Workbench realization, current `GW-DOC-WORKBENCH-UX`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, and current DESIGN SD21-SD30. The authority-bound comparison corpus under `docs/references/workbench-ui/` is downstream evidence only and is valid only when its manifest pins these exact current owners.  
**Owners/anchors:** `tests/browser.spec.ts` for deterministic rendered-state capture and coverage assertions; `.github/workflows/ci.yml` for exact-candidate execution and evidence publication; `tests/certification.test.ts` for the exact CI supply-chain rule permitting only the pinned first-party artifact uploader required by this acceptance path.  
**Required mutation:** extend the existing Playwright/GitHub Actions verification path so the exact PR merge candidate proves both the complete governed Workbench surface/state set and the C19-F09 component architecture after the ordinary `browser` gate is green. Evidence generation and acceptance remain separate. The implementation must:
- certify required-new semantic component modules and exact allowlisted consumers; reject duplicate feature-local owners for section/facts/resource/review/document/result responsibilities;
- certify `WorkbenchReview` exposes no arbitrary body compatibility shape, `WorkbenchContextPanel` exposes no generic hierarchy escape, repeated resources use ResourceList, and required-absent generic workflow owners/aliases remain zero;
- certify the affected route renderers satisfy the DESIGN physical-SoC dispositions and no migrated feature selector family recreates the shared semantic component grammar;
- capture every one of the nine lifecycle steps — Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete — from populated deterministic canonical fixtures, not empty shells;
- capture every one of the 37 `SURF-*` contracts declared by current `solution-design.md`, including Queue, Create, Settings/repositories, Settings/OpenCode/accounts, model/runtime Settings, Context, document authoring/read-only, dialogue/activity, proposal review, evidence, approval-task detail, execution-task detail and all confirmation/destructive overlays;
- capture all materially distinct DESIGN/P3 states needed to prove current-attention precedence, dialogue interaction, proposal, document, Implementation task, Queue, application notices, installation readiness, linked-remediation Create/Complete branches, OpenCode login terminal states, safety confirmations, responsive composition and theme parity;
- prove all four WorkItem kinds represented by the reference pack — Change, Defect, Investigation and Audit — at the information-contract surfaces where the kinds materially differ;
- capture every primary workflow step at a wide desktop viewport and at a narrow viewport; additionally capture Light and Dark representatives for every primary interaction class and System against both mocked effective schemes, preserving the existing semantic theme assertions;
- emit an evidence manifest for every capture containing exact checked-out commit SHA, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, runtime route/selection, corresponding authority-bound reference-manifest entry, governing current authority refs, and mandatory `captureScope` identifying the governed region (for example full-workbench, primary-composition, component-reference);
- reject comparison pairs whose governed scope is not equivalent: a component crop may not be presented beside a full-screen reference as if it were full-screen acceptance; generate/capture a matching governed scope instead;
- place the actual PNG captures, manifest and generated comparison index into one GitHub Actions artifact, and produce a review ledger keyed by capture id with independent `schema_information`, `ux_interaction`, `visual_ui` PASS/FAIL values, rationale and authority/capture reference;
- fail evidence generation when a required surface/state/reference/scope mapping is missing or duplicated, fixture state is wrong, runtime errors occur, capture is absent/empty, or coverage is incomplete. Evidence generation success is **not** acceptance success; IA24 remains blocked until the explicit three-dimension review ledger has zero FAIL.

**Acceptance review:** the Actions artifact is evidence, not authority. Every manifest row must receive an explicit `PASS` or `FAIL` against three independent dimensions before IA24:
1. **schema/information fidelity** — every rendered datum/action maps to exactly one current DESIGN `SURF-*` contract row for that surface/state; every applicable DESIGN row is realized with the declared source/class/placement/disclosure rule; required Primary information is present and correctly named/grouped/prioritized; Supporting/Operational information is present only where explicitly authorized; Technical/Diagnostic information is absent from the ordinary surface; the authorized WorkItem Context/Settings-diagnostics/Evidence/confirmation owner exposes exactly its owned value only after explicit entry; close/return restores the ordinary hierarchy without losing current attention. Any rendered datum/action without a DESIGN row, or any missing applicable DESIGN row, is `FAIL` and returns upstream to DESIGN rather than being inferred in implementation;
2. **UX/interaction fidelity** — the owning interaction grammar, current-attention owner, semantic-slot meaning, exactly-one-primary-composition invariant, action precedence, navigation/material hierarchy, state/recovery semantics and responsive composition match current authority; Queue/Review/Evidence/Terminal result do not gain synthetic outer attention, Proposal Review/Readiness/Approval remain direct `WorkbenchReview` primary compositions, and transient Proposal Review/Evidence replace rather than nest;
3. **visual/UI fidelity** — hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, truncation/wrapping, overlays and theme behavior materially conform to current authority and the authority-bound derived comparison reference for the same SURF/state/scope.

Any `FAIL` creates a blocking remediation item owned by the defective implementation/authority layer and requires a fresh post-fix exact-candidate Actions capture for the affected row plus regression revalidation. No aggregate pass may hide a failed row.

**Forbidden:** treating any derived reference corpus as semantic/product authority; pixel-diff threshold as the sole acceptance criterion; screenshot approval in place of existing semantic/browser assertions; generated screenshots blessed from the current implementation without comparison; a new visual-regression SaaS/platform dependency; committing runtime screenshots as a second design system; changing product behavior merely to match a superseded SVG.  
**Proof:** required PR Verification rendered-evidence step succeeds on the exact candidate, publishes exhaustive scope-valid evidence, and the separately reviewable screen-by-screen acceptance ledger has no unresolved `FAIL`; capture generation/coverage alone cannot satisfy IA26.
