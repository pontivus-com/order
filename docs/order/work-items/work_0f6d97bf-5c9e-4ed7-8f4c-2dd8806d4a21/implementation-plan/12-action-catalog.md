# 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

## Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD30; IA01-IA34 | — | one cumulative 41-path 0.6.0 candidate; internal waves below own ordered mutation/proof responsibilities | F6B retained closed APIs and required absence; exact residuals and complete consumer proof; operator-accepted foundation retained within scope | final V0-V7 + SD16-SD18/SD29 certification + IA26/SD30 exact-candidate 37-SURF and component-architecture acceptance |

**Audit rule:** T1 is the only P6 ExecutionTask. Wave/IA ordering below is internal implementation sequencing and never relies on candidate-byte promotion between tasks. A later phase discovering a foundation defect returns to IA27/DESIGN rather than patching around it; T1 cannot close until every owned phase obligation and final candidate proof is satisfied.

## Execution waves

This candidate confers no authority. Production mutation requires current G4/G5/G5A, independent R3/G6 and exact normal sign-off. An optional bounded IA27/IA28 lane requires current R3 and separate §17A grant; none is presumed. No new foundation reconstruction is required.

0. Read-only IA07/IA08 checkpoint/scope preflight.
1. Signed IA01 → IA02 → IA03 → IA04 exact authority, adoption-recovery and durable-decision residuals; IA11 corrects linked-remediation eligibility. IA05/IA06/IA09/IA10/IA12/IA25 are existing capability proof. IA17 establishes exact canonical Approval reads, shared conformed-completion selection and query/invalidation ownership before Context, Document and Review consumers.
2. IA27/IA28 shell/Context/Queue/Create and ResourceList/Row revalidation; only forecast narrow residuals.
3. IA13/IA14/IA29 exact signed document and narrow editor consume completed IA17 transport/selection; then IA16 establishes the exact admitted R3 verdict and its proof before IA31 consumes it for Approval/Review; then IA15/IA30 PLAN and current attention. Each consumer phase typechecks without compatibility or later unimplemented APIs.
4. IA26 first reconciles the exact authority-derived reference current marker and task-global attempt ordinal; targeted IA20/IA26 then perform P0.4 HUX-09 same-scope comparison and explicit outstanding HUX disposition.
5. IA32 exact blocker, IA19/IA33 reached Complete/exact candidate lineage, IA18/IA34 Settings proof.
6. IA20–IA23 semantic/component/theme/integration proof, IA26 exact 37-SURF acceptance, IA24 final V0–V7 closeout.

Ownership of shared-path edits is semantic and ordered: IA01 owns manifest schema/pure dependency closure; IA02 owns applicable stage refs/producing-context admission; IA03 owns proposal recovery; IA04 owns durable-decision coverage. IA17 owns shared pure exact completion/Approval observation and route/query plumbing; IA16, IA29, IA31 and IA33 consume it for their distinct R3/Document/Review/Result purposes. IA14 owns current-attention and return derivation; IA30 consumes it and owns PLAN inspection/Dialogue realization; IA32 owns task/attempt validation/blocker and IA33 owns complete candidate-proof selection. IA27 owns selected technical Context and shared narrow/theme residuals; screen consumers do not invent new roles. IA20 owns permanent semantic fitness and IA26 owns rendered/reference evidence, not runtime semantic changes. Each edit is justified by its SD/IA responsibility, even if several actions share a file. Breaking APIs are not forecast; a disproven retained owner or new path returns upstream. Do not add compatibility props or temporary old/new paths. No prior phase PASS is inherited beyond explicit milestone scope. No prior RZ16 PASS is inherited.

## IA01 — pure project-authority resolution

**Solution:** SD02.  
**Owner/anchors:** `src/core/governance.ts`, existing authority-layer/concern/material/freshness pure functions.  
**Required mutation/proof disposition:** Extend existing strict ProjectManifestSchema in core/contracts.ts and pure resolveProjectAuthority in core/governance.ts with P6 §14 optional additive stageAuthorityRefs/refDependencies; exact edge validation and visited-set closure. Retain precedence/default/override/extension/fitness. No new registry.  
**Forbidden:** filesystem/provider I/O; semantic contradiction inference; DTO/service/repository/class family; parallel authority graph.  
**Proof:** `tests/core.test.ts` ordering/default/override/extension/invalid-input cases.

## IA02 — consume resolved authority before productive context

**Solution:** SD02. Depends on IA01.  
**Anchors:** `src/daemon/authority.ts::resolveStageContextState/resolveStageContext`; `src/daemon/stage.ts::stagePrompt` and stage admission.  
**Required mutation/proof disposition:** Use core/work-item-source.ts existing template header/R2 ledger parsers, core/execution.ts existing task parser, and daemon/authority.ts existing applicable selection to collect exact refs before lookup, expand dependencies and materialize only applicable refs under pinned schema/stage/concern/P1/explicit authority. daemon/stage.ts validates current-v2 declarations and stage-owned semantic completeness. Consume SD02 producing-stage closure: include exact canonical draft/output-declared governing sources in the producing context; re-resolve against the exact completion candidate before promotion and use existing stale-context recovery if material differs. Revalidate conformance with the same admitted output declaration; never add the output as its own dependency or retrofit context evidence. Retain v1; absent additive map is empty, unresolved required ref blocks before provider. Update example and fixtures, not authorizing root. R3/sign-off/freshness share selection.  
**Forbidden:** provider interpretation of raw manifest order as precedence; daemon-owned second authority graph; include-every-selected-source context projection; implicit promotion of retained historical sources into current-schema context; context construction that bypasses the IA01 resolved projection or the canonical lifecycle-context applicability rule.  
**Proof:**
- `tests/daemon.test.ts` — productive-context admission consumes the resolved projection, derives the schema/stage-applicable material subset, excludes an unrelated retained V1 source from a current-v2 context, includes the exact retained source when a pinned historical schema or explicit versioned ref requires it, and blocks unresolved applicable bindings before provider use; proves newly declared output material cannot promote against the old Run context, fresh-turn recovery, exact same-projection conformance revalidation and no output self-dependency;
- `tests/certification.test.ts` — representative production project manifest with both current and retained semantic sources plus same-layer precedence/default/override/extension reaches the real STAGE context with only the applicable material set in resolved order. Current-v2 and historical exact-version cases are both proved, and an equivalent unresolved simultaneously-applicable relation fails before any provider turn. The certification must fail if production falls back to raw manifest array/filesystem order, include-every-selected-source projection, or provider interpretation.

## IA03 — one GOVERNANCE proposal/adoption mechanism

**Solution:** SD09.  
**Anchors:** `src/core/contracts.ts` proposal/ArtifactRef contracts; `src/core/governance.ts`; `src/daemon/stage.ts::proposalDisposition/proposalAdoptionRequest/adoptArtifactProposal/reconcilePendingArtifactProposals`; `src/daemon/authority.ts`.  
**Required mutation/proof disposition:** Retain exact target/layer admission and human intent. In daemon/stage.ts enforce base before first adoption request, but let exact durable ADOPTION_IN_PROGRESS reconcile already-applied bytes via the existing shell owner; revalidate current authority/decision. In src/shell/repository.ts verify exact one target on both branches; reverse into isolated scratch, verify reconstructed base hash/absence, forward replay and exact observed current bytes, recheck live target, remove scratch; no live patch on already-applied branch or unrelated drift acceptance. Retain existing effect/disposition transaction and no new state.  
**Forbidden:** stage-specific proposal DTOs/direct provider writes/second decision store.  
**Proof:** core/daemon wrong-layer/path/hash/stale/adoption/freshness cases; intent-before-effect interruption, effect-before-disposition GOVERNANCE interruption at R2/DESIGN, reverse-applicable unrelated target drift, new-file/modified-file recovery, no intent, changed owner and idempotent exact disposition. Test existing shell mechanic via daemon integration; no new test file.

## IA04 — durable-decision completion admission

**Solution:** SD08. Consumer dependency on IA03 when the durable target is permanent governance.  
**Anchors:** `src/core/lifecycle.ts::evaluateStageCompletion/validateStageProviderTurn`; `src/daemon/stage.ts::runStageTurn/submitRunInput`.  
**Required mutation/proof disposition:** Retain deterministic later-adoption guard and guidance. In existing daemon/stage.ts stagePrompt/stageConformanceQuestions use SD08 exact bounded same-WorkItem owning-stage request/reply and adoption evidence across attempts, including retry/provider loss, to require material decision coverage by exact current canonical source/adopted authority before promotion. Unrelated adoption or a new Run is insufficient; explicit Save and fresh Run can prove changed durable authority. Prior answers are evidence only; no chat authority, second guard/classifier/reviewer or new persistence. INFORMATION/EVIDENCE unchanged.  
**Proof:** core/daemon chronology cases for adopted/rejected/cancelled/stale, multiple decisions, unrelated later adoption, retry after unadopted decision, explicit Save then fresh Run with exact new source, prior superseded decision and ordinary information input; verify the actual stage prompt evidence/semantic question and independent R3 boundary, not a claim that a mechanical check proves meaning.

## IA05 — schema-aware current-v2 task admission

**Solution:** SD10.  
**Owners/anchors:** existing `SignedTaskBlockSchema` remains unchanged in `src/core/contracts.ts`; `src/core/execution.ts::parseSignedTaskBlockFromPlan` remains the one structural parser and reuses the existing pure schema-aware admission helper over the parsed block; `src/daemon/stage.ts` owns PLAN/R3 authoring/conformance invocation; `src/daemon/authority.ts::validateTaskDefinitions` owns R3/sign-off deterministic task validation.  
**Required mutation/proof disposition:** Proof-only: existing parseSignedTaskBlockFromPlan and admitSignedTaskBlockForSchema; verify current-v2 non-vacuity, matching prompt/admission and retained v1. No new parser.  
**Semantic boundary:** mechanical presence is not material task sufficiency. Existing PLAN conformance questions still prove objective/dependencies/traceability, module ownership/decomposition, checkpoint placement, surfaces, deletions/replacements, completion evidence, minimum-change forecast and verification contract; R3 independently challenges complete P1-P7 traceability/readiness.  
**Forbidden:** tightening the shared SignedTaskBlock schema globally; a v2-only shadow task schema/parser; a second semantic-review path.  
**Proof:** `tests/core.test.ts` preserves v1 cases and proves v2 positive/negative mechanical admission; `tests/daemon.test.ts` proves PLAN and READY_FOR_SIGNOFF/sign-off cannot bypass v2 admission; `tests/certification.test.ts` binds the single parser/admission/prompt path and rejects duplicate task schema/parser ownership.

## IA06 — canonical Approval identity normalization

**Solution:** SD12.  
**Anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts::signOffWorkItem`.  
**Required mutation/proof disposition:** Proof-only: existing trim/nonblank approvedBy admission.  
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
**Required mutation/proof disposition:** Proof-only: existing singular planNewSource QueuePlan producer.  
**Proof:** created/discovered inputs produce equivalent admission plans except provenance.

## IA10 — converge created/discovered persistence

**Solution:** SD04. Depends on IA09.  
**Anchor:** `src/daemon/work-item-source.ts`.  
**Required mutation/proof disposition:** Proof-only: existing planNewSource/applyPlan create/discovery convergence, read-back and freshness.  
**Proof:** daemon one-persistence-owner, read-back, diagnostics and freshness tests.

## IA11 — canonical Create interaction

**Solution:** SD03.  
**Anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required mutation/proof disposition:** Retain controlled Create, ordinary Concerns and fixed Project as proof-only. Correct existing pure `core/work-item-source.ts::linkedRemediationIsAllowed` to use catalog-admitted terminal parent outcome, completed Investigation/Audit, same Project and delivery child; existing daemon caller remains unchanged. IA33 consumes this one policy for the Result action; do not add outcome filters or invent remediation. Prove core/daemon matrix including DUPLICATE/ALREADY_SATISFIED parents, ordinary completion, wrong kind/stage/project and immutable lineage.  

**SD03 closure:** consume SURF-CREATE-001 exact kind inputs and lineage, visible documentation-root context before Create, fixed parent Project for linked remediation; exclude parent id/schema/internal metadata. Prove valid/invalid/pending/error/Cancel and safe return.

**Proof:** browser ordinary creation, metadata ownership and linked-remediation tests.

## IA12 — one archive/project/search derivation

**Solution:** SD05.  
**Anchors:** `ui/src/app.tsx::App`; `ui/src/WorkItemQueue.tsx::WorkItemQueue`.  
**Required mutation/proof disposition:** Proof-only: existing app-owned archive/project/search projection; verify matrix.  

**SD05 closure:** Queue owns New WorkItem, Refresh sources, search/filter and diagnostic recovery. App retains one archive/project/search derivation. Show path where required defective-source identity, suppress raw code/parser payload. Prove populated/empty/loading/error/no-match/archive and linked intake.

**Proof:** browser active/archived × project × search matrix while archive identity/history remains unchanged.

## IA13 — exact documentation-Git review

**Solution:** SD06.  
**Anchor:** `ui/src/DocumentWorkspace.tsx::DocumentationGitConfirmation`.  
**Required mutation/proof disposition:** Proof-only for exact documentation-Git confirmation and Save/status; IA29 owns signed membership.  

**SD06 closure:** prove current repository path and WorkItem directory available in IA29 one named Supporting disclosure closed by default after the canvas and pre-Save owning-stage return/downstream invalidation consequence in active authoring. Reuse expected-hash/freshness and Git owners; prove consequence before Save, conflict/no write, admitted Save and exact Git confirmation. Separate Git persistence from material maturity.

**Proof:** browser exact-path/state review plus blocker cases. Do not alter save/status/eligibility semantics already proven conforming.

## IA14 — current attention survives inspection

**Solution:** SD07.  
**Anchors:** canonical `src/core/lifecycle.ts::deriveCurrentAttention` remains unchanged owner; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts`.  
**Required mutation:** consume SD07 exact canonical-current material, independently of explicit inspection. One compact human condition and direct exact-owner navigation using existing selection/dirty guard and current inspection navigation; exact Run/question or proposal event, blocker/recovery reason and owner, convergence/processing continuity. No generic stage-only return for levels 1–8, duplicate mutation, new shell prop or nested primary; selected Evidence Back origin remains intact.  

**SD07 closure:** existing pure presentation projection and WorkItemWorkspace route by canonical material kind/reach before step-specific renderers, preserving legitimate discovered Draft. No unreached Approval/Implementation/Complete workspace. Preserve current reason/question/consequence and exact direct return during historical Run/document/task, Proposal, Evidence, Readiness/Approval supporting inspection and Context. Coordinate IA29–IA33 consumer changes; no generic outer attention or selection theft. Prove required-input/proposal/blocker/stale/recovery/converging and rejected commands across all nine stages.

**Proof:** presentation/browser required-input/proposal/blocker/stale/recovery with historical selection.

## IA15 — focus once per required-input request

**Solution:** SD15.  
**Anchors:** `ui/src/ActivityComposer.tsx::ActivityComposer`; `ui/src/ActivityWorkspace.tsx::StageRunMaterial`.  
**Required mutation/proof disposition:** Proof-only: existing event-id focus-once, rerender/polling/responsive proof.  
**Proof:** browser focus-once/rerender/responsive cases.

## IA16 — canonical Readiness verdict

**Solution:** SD11.  
**Anchor:** `ui/src/ReadinessWorkspace.tsx::ReadinessWorkspace` plus existing presentation helper.  
**Required mutation/proof disposition:** Consume IA17's shared pure same-Run completion selection; in existing presentation and ReadinessWorkspace owners bind selected exact COMPLETED R3 Run to same-Run later CONFORMANCE_PASSED with matching contextHash and output id, then exact ArtifactRef bytes. No raw provider completion or latest-role fallback as verdict. Current readiness additionally requires package coherence; historical verdict stays historical. Missing/mismatched proof uses typed state/error; preserve full admitted findings, not heuristic omission. IA14/IA31 own attention/composition.  

**SD11 closure:** exact selected coordinator-conformed typed R3 outcome through existing pure lifecycle/presentation selection, shared conformance join with SD27 but no R1 policy imported. Distinguish no Run, processing, required input, returned owner, failure/cancel/block/stale/history. Verify actual R3 schema/template findings without heuristic omission, separate currentness, automatic READY_FOR_SIGNOFF→AWAITING_SIGNOFF. IA31 owns Review composition.

**Proof:** READY_FOR_SIGNOFF/RETURN_TO_*/BLOCKED + stale material, raw READY event followed by CONFORMANCE_FAILED and BLOCKED Run, competing same-role output, mismatched/missing conformance, exact historical verdict and complete findings. No change to R3 judgment or sign-off command.

## IA17 — Approval readiness/currentness hierarchy

**Solution:** SD12.  
**Owners/anchors:** `src/core/lifecycle.ts` shared pure same-Run conformance selection; `src/daemon/authority.ts` exact Approval/closure reads, coordinator/server canonical routes; `ui/src/http.ts`, `query-keys.ts`, `app.tsx` exact query parsing and invalidation, `WorkItemWorkspace.tsx` exact current/final Approval and task filtering. IA31 owns the `SignoffReview.tsx` presentation consumer.  
**Required mutation/proof disposition:** Bind exact lifecycle/completion-evidence-gated current/final Approval and history via P6 §6 observational routes. In COMPLETE distinguish admitted terminal R1 from actual complete signed task aggregate, including signed all-ALREADY_SATISFIED, through existing RunEvent/Run facts and aggregateTaskCompletion; validate exact signed task membership and outcome. No inference from outcome alone, count or historical reach. Filter current tasks by exact Approval.id; IA29 owns committed artifact membership/display and IA31 owns prospective versus historical Review. Preserve sign-off admission and typed loading/error.  

**SD12 closure:** preserve non-mutating query and exact package admission/recomputation; verify current/stale/returned/historical package and selected signed/approved task lineage against P6, including selected task identity in IA27 Context. No current readiness inferred from latest artifact. Decision feedback in task detail and overview; IA31 owns shared Review.

**Proof:** core/daemon/browser/presentation exact R1/R3 completion selection, current/final/history reads, missing and contradictory provenance, current/stale package cases, exact bytes/no writes and cache invalidation.

## IA18 — operator-first Settings hierarchy

**Solution:** SD14.  
**Anchors:** `ui/src/SettingsWorkspace.tsx::SettingsWorkspace/RepositorySettings/ModelRuntimeSettings`.  
**Required mutation/proof disposition:** Proof-only: existing Settings readiness, repository facts and diagnostics owner; verify negative states/exact inputs.  
**Proof:** browser normal Settings, blockers, Add/Move/configuration cases.

## IA19 — product-language projection

**Solution:** SD01.  
**Anchors:** `README.md`; `ui/src/TerminalResult.tsx::TerminalResult`; `ui/src/workbench-presentation.ts`.  
**Required mutation/proof disposition:** Correct README blocked/upstream-return versus terminal-result copy. Retain shared WorkOutcome label and documentation-Git exception. IA33 owns exact candidate proof.  
**Forbidden:** lifecycle/state/WorkOutcome contract changes; second product-label table in `TerminalResult`; generic enum prettification fallback; new DTO/view-model/service/state owner; candidate resources for non-candidate outcomes.  

**Shared human-language projection:** existing pure presentation path is mutable for SD01/07/11 and consumers. STAGE_COMPLETED need not mean successful readiness judgment; distinguish Run execution from result disposition. Remove generic enum/path/payload fallback from ordinary event/result presentation, exact identity in authorized inspection. IA14 owns attention, IA16 R3 verdict, IA30/32/33 shared vocabulary consumption. Reuse typed failure contract; absent required carrier returns to DESIGN.

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

**Semantic certification closure:** each applicable DESIGN datum/action-to-owner/class/visibility mapping, including Primary presence, authorized Supporting/Operational access, negative Technical/Diagnostic absence, explicit inspection/return/current-attention continuity. No screenshot presence or import-name substitute.

**Proof:** certification negative/positive fixture including deliberate forbidden Queue/Review/Terminal/Evidence attention usage, Proposal/Readiness/Approval outer-frame wrapping, and nested-primary-surface composition.

## IA21 — scenario-41 work-kind certification

**Solution:** SD17.  
**Owner:** `tests/browser.spec.ts`.  
**Required mutation:** certify all four kinds' Work request + Research information contracts and distinct Change/Defect downstream obligations.  

**Kind-specific negative proof:** all four intake/Research fixtures; distinct Change/Defect downstream obligations. Investigation/Audit reach Complete directly; absent downstream Runs/artifacts/tasks and truthful UNREACHED selection. Deterministic fixture server may construct canonical persisted states; UI defects route to owning IA.

**Proof:** explicit four-kind semantic matrix.

## IA22 — System/Light/Dark component-semantic parity

**Solution:** SD18.  
**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required mutation:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states preserve canonical semantic roles under all effective themes; theme changes may not change which interaction classes own current attention or create an attention band on Queue/Evidence/Terminal result.  
**Proof:** semantic role/component assertions; no pixel-snapshot substitute.

## IA23 — cross-solution regression closure

**Upstream:** all SD01-SD30.  
**Owners:** existing targeted core/daemon/presentation/browser/certification suites plus `tests/opencode.test.ts` and `.github/workflows/ci.yml` for SD20.  
**Required mutation/proof disposition:** Retain permanent exact-pin real OpenCode 2.2.6/Drive 2.4.1/effect 4.0.1 simulation tier and existing CI. Fill only missing representative proof. Fake cases complementary; no runtime dependency/config/state/provider change or remote/OAuth/model-quality claim.  

**Complete scenario integration:** consume P3 §23 numbered allocation in closeout and P4 §14.1–14.5 forward/inverse state/event, turn grammar, concurrency and read-purity propositions. Reuse exact existing tests only if assertions prove proposition; extend named verification owner for gaps. No relaxed fixture or test.

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
**Required mutation/proof disposition:** Proof-only: existing guided installer and distinct update/recovery; prove choices, private account, daemon readiness, continuity/rollback before success. No setup/installer production mutation.  
**Forbidden:** new config schema; second setup owner; mandatory post-install Settings/provider-login step; speculative `src/installer.ts` edit. If setup.ts alone cannot realize SD19, return to DESIGN/PLAN.  
**Proof:** create `tests/installer.test.ts` covering fresh productive setup success/failure/cancel and deferred-Settings rejection; existing `tests/order-migration.test.ts` must continue proving migration/rollback/continuity.


## IA27 — revalidate accepted foundation and resource ownership

**Solution:** SD21/F6B, SD29. P4 owns permanent APIs; SD21/F6B owns realization; IA27 does not derive either.

| Owner / responsibility | Disposition | Proof boundary |
|---|---|---|
| WorkbenchSection.tsx, WorkbenchFacts.tsx, WorkbenchContextPanel.tsx | CONFORMING_NO_EDIT | closed API and Context proof |
| WorkbenchToolbar.tsx, WorkbenchAppShell.tsx | CONFORMING_NO_EDIT for API; BOUNDED_RESIDUAL for toolbar narrow reachability only | accepted hierarchy, narrow/reference proof |
| WorkbenchWorkItemShell.tsx, workbench-responsive.ts, WorkbenchIdentity, WorkflowRail | CONFORMING_NO_EDIT | accepted scope; current-marker/responsive proof |
| MarkdownEditor.tsx and WorkItemQueue.tsx Toolbar dependencies | CONFORMING_NO_EDIT | existing specialist/scan separation |
| WorkbenchResourceList.tsx, WorkbenchResourceRow.tsx | CONFORMING_NO_EDIT | all-caller List→Row proof |
| `WorkbenchLayout.tsx`, `WorkbenchSelector.tsx`, `WorkflowStepFrame.tsx`, `WorkflowMaterialSelector.tsx` | `REQUIRED_ABSENT` | zero substitutes/imports |
| WorkItemContext.tsx | BOUNDED_RESIDUAL | exact selected Approval/artifact/task/Run provenance |
| theme.css, styles.css | BOUNDED_RESIDUAL | narrow/current-attention/semantic-role correction only |

No new semantic component, destructive replacement, compatibility API or mandatory pre-signoff reconstruction. IA20/IA26 prove closed APIs, complete allowed consumers, required absence, no substitute grammar and narrow/reference residuals. Optional bounded evidence requires current R3 and separate grant. IA29+ remain signed work.

### Priority-0 operator-rejected semantic-UI remediation tranche

This tranche is the immediate implementation priority after the corrected P3/P4/DESIGN/P7 package is revalidated. It exists because the rendered evidence proved that the already-governing C19-F09 intermediate semantic-component architecture was not actually completed on the surfaces the operator repeatedly rejected.

**Priority law:**
- this tranche preempts IA32-IA34 and any non-blocking polish/refactor;
- no later screen-family work may be used to defer, hide or amortize these defects;
- each step starts from the complete DESIGN SURF information inventory and records the exact `datum/action -> P3 class -> semantic component -> placement/visibility/action` mapping before JSX mutation;
- no feature-local substitute grammar, generic prose slab or “close enough” component wrapper is permitted;
- each step ends with targeted wide/narrow rendered proof and HUX disposition before advancing;
- semantic/component correctness is necessary but not sufficient: the same-scope exact-candidate render must also materially conform to the authority-bound Workbench reference atlas for hierarchy, density, spacing, alignment, typography, component anatomy, action prominence and responsive recomposition;
- a failure in the shared component owner is fixed at that owner and re-proven across its complete consumer set rather than patched screen-by-screen.

| Priority | Owning phase | Blocking operator findings | Required correction before advance |
|---|---|---|---|
| **P0.0** | IA27 + IA28 foundation revalidation | HUX-05/HUX-10/HUX-11 | Retain accepted shell scope and closed APIs. Prove current-marker, narrow reachability, theme/radius and exact reference residuals; no blanket shell rework. |
| **P0.1** | **IA29** | HUX-01, HUX-02, HUX-05, HUX-07 | Finish the Document intermediate schema exactly: Work request/editable/read-only lifecycle documents are owned by `WorkbenchDocument`; Markdown/editor is first dominant content; `Work request context` / `Document location` are subordinate named disclosures using `WorkbenchFacts`; narrow editor controls remain readable; Document-family geometry follows the flat semantic grammar. |
| **P0.2** | **IA16 → IA31** | HUX-03, HUX-04, HUX-05, HUX-08, HUX-09 | Retain existing Review schema and correct exact Approval residuals: one `WorkbenchReview` + one `WorkbenchReviewVerdict` + DESIGN-declared `WorkbenchReviewSection` children; repeated package/task/evidence/history objects use `WorkbenchResourceList`/`WorkbenchResourceRow` with explicit scan-efficient row/action anatomy; Proposal uses `DocumentChangeView` with visible in-context change marks and exact diff secondary; Approval task detail remains Review detail and uses the same section/facts/resource language rather than bare stacked headings or a second hierarchy. |
| **P0.3** | **IA30** | HUX-05, HUX-06, HUX-08 | Correct exact PLAN inspection and current-action collision: R1/R2/DESIGN/PLAN route directly to Document/Dialogue/Evidence/State; historical/current-owner return remains bounded navigation and cannot create a competing header/attention composition; local productive card/context grammar is deleted. |
| **P0.4** | **IA27 + IA28 + IA29 + IA30 + IA31, verified by IA20/IA26** | **HUX-09** plus unresolved visual consequences of HUX-05/HUX-08/HUX-10/HUX-11 | Perform a dedicated reference-fidelity closure over the exact operator-rejected shared shell and Priority-0 surfaces. For every same-scope SURF/state/theme capture, compare the exact candidate against the active authority-bound Workbench reference atlas and close all material hierarchy, density, spacing, typography, facts/resources/decision anatomy, alignment, action-prominence, shell chrome and responsive differences using only the existing canonical semantic owners. This is not optional polish and must not introduce feature-local substitute UI. |
| **P0 exit** | IA20 + IA26 targeted proof | HUX-01 through HUX-11 | Certification proves semantic ownership rather than import/name presence, targeted exact-candidate rendered evidence shows the corrected rejected surfaces, the HUX-09 same-scope fidelity comparison records no unexplained material divergence, and every HUX row reaches explicit operator `ACCEPTED`. Only then may IA32-IA34 resume. |

**Ordering rationale:** IA29 lands first because IA30 and Approval supporting-document inspection consume the Document owner. IA16 first establishes and proves the exact admitted R3 verdict using IA17's shared selection; IA31 follows as its presentation consumer because the rejected Review/Proposal/Approval surfaces are independent of the remaining IA30 productive-stage reconstruction once the Document owner is correct. IA30 then removes the historical/current-attention and productive-stage substitute grammar. This is an execution-priority change only; it does not change the 37-SURF ownership partition or the P4 semantic-component responsibilities.


### Exact IA27-IA34 rendered face ownership


### Binding operator UI findings — human acceptance ledger

**Upstream provenance:** every HUX row below is a concrete rendered/implementation manifestation of the already-governing `C19-F09` intermediate semantic-component/composition finding and its `C20-F11` governance/acceptance closure. The HUX ledger does **not** create a second architecture. `C19-F09` remains the root technical finding: feature renderers may not own recurring Review/facts/resource/Document/Result anatomy. `C20-F11` remains the proof/governance finding: prior PASS/acceptance cannot establish completion of that architecture. HUX rows preserve the operator-observed instances until the owning IA phase proves the exact DESIGN/P4 mapping and receives explicit rendered acceptance.

This ledger records direct operator findings from rendered 0.6.0 review. It is **binding P7 acceptance input**, not commentary and not implementation advice. These rows exist specifically so repeated human review findings cannot disappear between implementation passes, test rewrites or regenerated evidence.

**State law:**
- every row begins OPEN_BLOCKING;
- typecheck, architecture, unit/browser success, screenshot generation or an IA26 machine PASS **cannot** close a row;
- implementation may close the technical defect, but the row remains PROOF_REQUIRED until a fresh exact-candidate capture demonstrates the corrected state;
- only explicit operator disposition of that fresh rendered evidence may set ACCEPTED;
- explicit operator rejection of fresh evidence keeps or returns the affected row to OPEN_BLOCKING regardless of typecheck/browser/IA26 generation success; the rejection rationale becomes a required proposition for the next exact-candidate proof;
- an unchanged or materially equivalent rejected presentation is not new proof and must not be re-presented as if the finding were unresolved/unknown;
- if implementation cannot satisfy a row using the stated canonical component owner, return to DESIGN/P4 instead of inventing feature-local UI.

| Finding | Operator finding / non-negotiable UX consequence | Affected governed UI | Canonical component realization required | Forbidden presentation | Owning phase | Current state / required proof |
|---|---|---|---|---|---|---|
| HUX-01 | Work-request context does not belong permanently exposed before the Markdown. The actual Work request document is the task; work type, Project, Concerns and repository/document location are subordinate context. | SURF-STEP-WR-001, SURF-MAT-SOURCE-001; evidence: ia26-work-request-step-wide-light, ia26-source-document-editor-wide-dark, ia26-source-document-editor-narrow-light | WorkbenchDocument owns document-first order; WorkbenchDisclosure is the one specifically named same-task **Work request context** expansion; its structured values use WorkbenchFacts; compact Git status/action remains adjacent to the document action. | always-open facts/metadata slab before Markdown; feature-local metadata rows; generic “details” drawer; hiding the document below context | **IA29** | OPEN_BLOCKING until wide+narrow source/read/editor proof shows Markdown immediately after document header and Work request context closed by default below it |
| HUX-02 | Lifecycle/read-only documents have the same hierarchy requirement: the governed document is primary; repository placement is supporting and must not dominate the surface. | SURF-MAT-DOC-001, SURF-MAT-DOC-RO-001; evidence: ia26-lifecycle-document-editor-wide-light, ia26-lifecycle-document-readonly-wide-light | WorkbenchDocument + specifically named **Document location** WorkbenchDisclosure + WorkbenchFacts; document title/currentness/action remain header-owned. | path/directory facts before document body; duplicate document shell; nested card/panel around the document | IA29 | OPEN_BLOCKING until editable/read-only wide+narrow proof demonstrates identical document-first information order |
| HUX-03 | Readiness and Approval are not prose documents or “text-branded” slabs. Their typed information must be rendered through the component schema: verdict/currentness, named review responsibilities, task/package/evidence resources and the decision. “Open X” copy must not substitute for a resource UI. | SURF-STEP-R3-001, SURF-STEP-APPROVAL-001, SURF-MAT-APPROVAL-TASK-001; evidence: ia26-readiness-review-wide-light, ia26-readiness-review-narrow-light, ia26-approval-wide-light, ia26-approval-narrow-light, ia26-approval-task-wide-light, ia26-approval-task-wide-dark | exactly one WorkbenchReview with one WorkbenchReviewVerdict; each DESIGN-declared responsibility uses WorkbenchReviewSection; structured facts use WorkbenchFacts; repeated package/task/evidence/history objects use WorkbenchResourceList/WorkbenchResourceRow; task action uses WorkbenchAction; selecting a governed document replaces Review with WorkbenchDocument and bounded Back navigation. | arbitrary Review body; screen-local order-review-* section/card/grid grammar; repeated explanatory prose describing objects already represented by components; textual “Open readiness review / Open solution design / Open requirements …” navigation rows; nesting a full Document inside Review | **IA31** | OPEN_BLOCKING until Readiness ready/return, Approval current/stale and task-detail rendered proof shows componentized information with no slab-text substitute |
| HUX-04 | Proposal review is a **document change review**, not a Git-diff text viewer. The human must review the proposed document in document context; exact unified diff is secondary inspection. | SURF-MAT-PROPOSAL-001; evidence: ia26-proposal-review-wide-light, ia26-proposal-review-wide-dark, adopted/adopting/rejected variants | WorkbenchReview + Review sections; DocumentChangeView derives current/proposed document presentation from current target bytes + canonical unified diff and visibly marks changed regions in context; rationale/target meaning occupy their declared Review responsibility; exact diff is a secondary intentional inspection. | raw CodeBlock(unifiedDiff) as sole/dominant review; Git patch syntax as the default human proposal UI; second proposal state/model | IA31 | OPEN_BLOCKING until pending/adopting/adopted/rejected proof shows document-first change review with visibly changed regions and collapsed/secondary exact diff |
| HUX-05 | Mixed rounded-card and flat/straight container treatment is visually inconsistent and has been rejected repeatedly. Semantic grouping must come from component anatomy/spacing, not arbitrary cards. | cross-cutting shell/Document/Review/productive surfaces, explicitly the application toolbar, WorkItem identity chrome, lifecycle read-only/editor and Review families in the rejected IA26 corpus | current P3/P4/theme component roles only. Apply the existing theme §9 law exactly: component/internal boundaries use `--radius-inner` / `--radius-element`; true container/dialog boundaries use `--radius-container`; `--radius-full` is reserved for actual pill/segmented/status semantics. Persistent primary WorkbenchDocument/WorkbenchReview surfaces remain flat; shell bands do not acquire arbitrary card rounding. | feature-local card chrome; rounded outer Review/Document/page/header bands; arbitrary pills for ordinary navigation/actions; inconsistent nested rounded-versus-square surface framing; tokenized radius used merely because a token exists | IA27/IA28/IA29/IA30/IA31 + SD29 visual verification | OPEN_BLOCKING until affected proof surfaces show one coherent geometry language and certification proves the semantic radius role at every visible boundary, not merely token use |
| HUX-06 | Current-action/historical-return UI must not collide with or overlay the selected lifecycle document. The selected primary composition keeps its own geometry. | SURF-STEP-R1-001, SURF-STEP-R2-001, SURF-STEP-DESIGN-001, SURF-STEP-PLAN-001, SURF-MAT-DOC-RO-001; evidence: ia26-lifecycle-document-editor-wide-light (“Approval is ready for your action / Return to Approval” collision) | direct primary composition selected by IA30; historical-return/current-owner navigation is a bounded action outside the Document content geometry and cannot create a second attention/header layer over it. | overlapping attention text/button on document heading; generic current-attention strip inserted into historical Document; two competing primary headers | **IA30** | OPEN_BLOCKING until current/historical document captures demonstrate non-overlapping ownership and stable document geometry |
| HUX-07 | Narrow Markdown editing controls must remain readable/discoverable. Truncated mode labels and compressed Save/Cancel are not acceptable responsive behavior. | SURF-MAT-SOURCE-001, SURF-MAT-DOC-001; evidence: ia26-source-document-editor-narrow-light | Markdown specialist editor-control region retains Edit/Preview/Split, formatting and Save/Cancel semantics with P4/Markdown-contract responsive recomposition/overflow while preserving direct controls→canvas adjacency. | clipped “E. / P… / S.” labels; unreadable or collapsed Save/Cancel; controls hidden by width without an intentional overflow mechanism | IA29 + SD29 | OPEN_BLOCKING until narrow rendered/browser proof establishes all mode and mutation controls remain discoverable and operable |
| HUX-08 | No screen may replace the granular information/component contract with undifferentiated prose. Every information area must be projected into the canonical semantic owner defined by DESIGN/P4; implementation does not invent ad-hoc slabs. | all 37 governed SURF-* rows, with immediate blocking focus on IA29-IA31 rejected surfaces | enforce the closed mapping canonical datum/action -> P3 class -> DESIGN row -> semantic component owner -> exact composition position; Section/Facts/ResourceList/ReviewVerdict/ReviewSection/Document/Dialogue/Evidence/Result are mandatory where assigned. | “slab text”, explanatory copy used as structure, local recurring section/facts/resource/review grammar, component wrappers whose arbitrary ReactNode body lets the feature rebuild the UI hierarchy | IA20 certification + each owning implementation phase + IA26 | OPEN_BLOCKING globally until all affected phase proofs and final IA26 ledger have zero unresolved human findings |
| HUX-09 | The latest Priority-0 candidate remains a minimal-effort visual realization and does **not** meet the fidelity required by the governed Workbench visual target. Semantic correctness or component-name presence alone does not accept a surface. | exact rejected/re-reviewed set now includes the shared shell plus the prior Priority-0 set: SURF-APP-001; SURF-WI-001; SURF-STEP-WR-001; SURF-MAT-SOURCE-001; SURF-MAT-DOC-001; SURF-MAT-DOC-RO-001; SURF-STEP-R1-001; SURF-MAT-PROPOSAL-001; SURF-STEP-R3-001; SURF-STEP-APPROVAL-001; SURF-MAT-APPROVAL-TASK-001 | retain the current P3/P4/DESIGN semantic owners, but realize their full visual hierarchy against the active same-scope comparison corpus in `docs/references/workbench-ui/reference-atlas.html`: compact application-toolbar hierarchy; selected-WorkItem identity hierarchy; Review header/eyebrow/title/description/verdict hierarchy; bounded named Review sections; structured Facts where the target carries fact anatomy; ResourceList row boundaries/action affordances; coherent decision region; Document content measure/header/control rhythm; Dialogue conversation/activity proportions; target spacing, density, alignment, typography, geometry language and responsive recomposition. The reference corpus is derived comparison evidence, so newer current authority wins on conflict. | treating a technically valid primitive tree as sufficient visual acceptance; skeletal/bare-text realization with large unowned whitespace; preserving the current top strips because their semantics are correct; flattening target section/fact/resource/decision anatomy; icon-only/bare action placement that materially changes target scan hierarchy; generic “polish later”; using machine PASS as a substitute for same-scope human visual comparison; copying superseded historical SVG details when they conflict with current P3/P4/DESIGN/theme authority | IA27/IA28/IA29/IA30/IA31 + IA20/IA26 | **OPEN_BLOCKING — operator rejected exact-candidate visual fidelity again, explicitly including both shared top chrome bands and Approval package/task presentation.** Re-prove only with a fresh exact-candidate set restricted to these operator-rejected screens and a same-scope reference comparison showing no unexplained material visual divergence, then obtain explicit operator ACCEPTED disposition |
| HUX-10 | The application-global header/toolbar is rejected as a presentation. Required account readiness, Settings navigation and System/Light/Dark semantics do not authorize the current text-heavy row or its hierarchy. | SURF-APP-001 across Queue, Settings and every selected-WorkItem surface | `WorkbenchAppShell -> WorkbenchToolbar` only. Re-author the closed toolbar slots from P3/P4: product/destination orientation first; Project context supporting; active-account label/readiness as a compact supporting utility/navigation treatment; the single Settings/Work queue navigation utility; one compact SegmentedControl for theme. The account label must not become dominant raw/email-like header copy, and the utilities must not read as an unrelated toolbar pasted above the product. | preserving the current email/account + Ready + Settings + System/Light/Dark strip; feature-local header groups; a second toolbar; arbitrary pills/cards; raw provider identity as primary application chrome | **IA27 + IA28** | PROOF_REQUIRED — later operator milestone retained within scope; exact narrow/reference and same-scope evidence still needs explicit disposition. No automatic ACCEPTED or blanket rework |
| HUX-11 | The selected-WorkItem identity row directly below the application header is rejected as presentation. Back to queue, title, kind, title edit, Context and Archive are valid semantics but the current full-width second rail has no acceptable hierarchy and must not be preserved. | SURF-WI-001 across every selected-WorkItem stage/material | `WorkbenchWorkItemShell -> WorkbenchIdentity` only. Re-author from DESIGN/P4: Back to queue as Supporting navigation; WorkItem title as Primary identity; kind/status only where authorized as Supporting; title edit/Context/Archive as subordinate utilities/actions; workflow rail remains the separate lifecycle projection below the identity composition. | preserving/re-skinning the current second horizontal bar; treating Back to queue/title/actions as equal-weight text; duplicating workflow orientation in identity chrome; feature-local identity CSS or arbitrary pill/card treatment | **IA27** | PROOF_REQUIRED — later operator milestone retained within scope; exact narrow/reference and same-scope evidence still needs explicit disposition. No automatic ACCEPTED or blanket rework |

**No-loss rule:** IA27, IA28, IA29, IA30 and IA31 may not be recorded complete while any finding owned by that phase remains OPEN_BLOCKING or PROOF_REQUIRED. IA26 final acceptance additionally requires every HUX-* row to be ACCEPTED. The implementation team must reference the relevant HUX-* ids in commits/tests/proof notes for the corrected surfaces so a future session can trace each rendered correction back to the exact operator finding.

**C19-F09 implementation-completion matrix:** the intermediate semantic layer is complete only when every applicable consumer has stopped owning the recurring anatomy assigned to the canonical component. A component import or wrapper is not completion.

| Phase | Required C19-F09 realization | Current audit disposition |
|---|---|---|
| **IA27/IA28 shell** | Application toolbar/header and selected-WorkItem identity chrome are fully owned by `WorkbenchAppShell`/`WorkbenchToolbar` and `WorkbenchWorkItemShell`/`WorkbenchIdentity`; Queue/Create only consume that shell. | **REOPENED — REWORK REQUIRED.** HUX-10/HUX-11 explicitly reject the currently rendered two top chrome bands; HUX-05/HUX-09 also remain OPEN_BLOCKING. Prior bounded shell evidence is not acceptance. |
| **IA29** | Work request/editable/read-only document consumers are fully owned by `WorkbenchDocument`; structured subordinate context uses `WorkbenchFacts` only in the DESIGN-authorized named same-task disclosure; Markdown specialist owns only editor mechanics. | **REWORK / OPERATOR NOT ACCEPTED** — semantic ownership may be partially present, but HUX-05/HUX-09 visual fidelity remains OPEN_BLOCKING and no prior technical-remediation label may be used as a preservation target. |
| **IA30** | productive Research/Requirements/DESIGN/PLAN renderers route directly to Document/Dialogue/Evidence/State and contain no recurring feature-owned section/context/card grammar. | **TECHNICALLY REMEDIATED / OPERATOR NOT ACCEPTED** — the historical-return collision and substitute productive grammar are corrected in the fresh candidate; HUX-05/HUX-09 visual fidelity remains OPEN_BLOCKING. |
| **IA31** | Proposal/Readiness/Approval use the closed Review schema: one ReviewVerdict, DESIGN-declared ReviewSections, Facts only for classified structured facts, ResourceList for repeated resources, DocumentChangeView for proposal document mutation; no local Review hierarchy. | **REOPENED — REWORK REQUIRED.** Approval Package documents and Approval task detail remain visibly non-compliant with the required ResourceList/ReviewSection/Facts anatomy despite component usage; HUX-03/HUX-05/HUX-08/HUX-09 remain OPEN_BLOCKING. Browser/architecture green does not establish technical UI completion. |
| **IA32** | Implementation detail uses MasterDetail + Section/Facts/ResourceList; no local `order-implementation-*` section/list/card system recreates semantic anatomy. | **NOT COMPLETE** — current renderer still owns recurring section/list anatomy. |
| **IA33** | Complete uses `WorkbenchResult` + canonical Section/ResourceList; no local terminal-result hierarchy owns outcome/resources/content grouping. | **NOT COMPLETE** — current renderer still owns local terminal section grammar. |
| **IA34** | Settings/account/model/repository surfaces use SettingsLayout + Section/Facts/ResourceList/Form owners; no feature-local pane/resource/facts/diagnostic grouping except the one authorized diagnostics owner. | **NOT COMPLETE** — current renderers still own substantial recurring pane/section/resource anatomy. |

**Completion test:** for every affected SURF row, review the complete datum/action inventory and record exactly one chain `canonical datum/action -> P3 class -> DESIGN SURF row -> canonical semantic component -> exact placement/visibility/action`. If the feature renderer must invent recurring hierarchy, grouping, resource grammar, responsive behavior, border/background/radius or explanatory prose to make the information understandable, the C19-F09 realization is not complete and the phase cannot PASS.



The 37 governed `SURF-*` rows declared by current `solution-design.md` remain partitioned exactly once across IA27-IA34. IA31 owns Proposal Review acceptance together with Readiness/Approval and closed Review API consumer proof.

| Phase | Exact owned SURF rows | Required state/reference sheets before phase advance |
|---|---|---|
| IA27 | `SURF-WI-001`, `SURF-WI-CONTEXT-001` | bounded WorkItem shell + singular technical Context + shell/responsive readiness only; no claim that later shared APIs are cut over |
| IA28 | `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` | fresh rendered acceptance of the bounded shell/Context foundation slice through application-shell/Queue/Create |
| IA29 | `SURF-STEP-WR-001`, `SURF-MAT-SOURCE-001`, `SURF-MAT-DOC-001`, `SURF-MAT-DOC-RO-001`, `SURF-CONF-DIRTY-DEST-001`, `SURF-CONF-DIRTY-MATERIAL-001`, `SURF-CONF-ARCHIVE-001`, `SURF-CONF-DOC-GIT-001` | Work request/WorkbenchDocument/Facts/editor states and owned confirmations |
| IA30 | `SURF-STEP-R1-001`, `SURF-STEP-R2-001`, `SURF-STEP-DESIGN-001`, `SURF-STEP-PLAN-001`, `SURF-MAT-ACTIVITY-001` | productive-stage Document/Dialogue/Evidence/State routing and four-kind Research differences; Proposal Review remains IA31 |
| IA31 | `SURF-MAT-PROPOSAL-001`, `SURF-STEP-R3-001`, `SURF-STEP-APPROVAL-001`, `SURF-MAT-APPROVAL-TASK-001` | Proposal/Readiness/Approval existing WorkbenchReview proof: ReviewVerdict/ReviewSections/Facts/ResourceList + DocumentChangeView; required-input; current/stale/task detail |
| IA32 | `SURF-STEP-EXEC-001`, `SURF-MAT-EXEC-TASK-001` | Implementation MasterDetail/Section/Facts/ResourceList; current-vs-historical selection; blocker/action/validation |
| IA33 | `SURF-STEP-COMPLETE-001`, `SURF-MAT-EVIDENCE-001` | Complete WorkbenchResult/Section/ResourceList; linked remediation; candidate/non-candidate terminal states; Evidence |
| IA34 | `SURF-SET-001`, `SURF-SET-REPO-001`, `SURF-SET-REPO-ADD-001`, `SURF-SET-REPO-MOVE-001`, `SURF-SET-OC-001`, `SURF-SET-OC-RENAME-001`, `SURF-SET-OC-ADD-001`, `SURF-SET-OC-LOGIN-001`, `SURF-SET-MODEL-001`, `SURF-CONF-REPO-DISCONNECT-001`, `SURF-CONF-OC-REMOVE-001` | Settings repository/account/model readiness and active tasks; login terminal states; destructive confirmations |

The IA27-IA34 union remains exactly **37 unique SURF rows** with no duplicate or unowned row. Each phase records independent `schema_information`, `ux_interaction`, and `visual_ui` verdicts. The bounded IA27/IA28 evidence accepts only the shell/Context foundation slice it exercises. Later component and consumer proofs are independently accepted at their owning phase and globally rechecked by IA20/IA26.

**Audit invariants:** No prior phase PASS is inherited. IA27 does not derive either P4 component contracts or SD21/F6B consumer mapping. Do not add compatibility props or temporary old/new paths. A breaking API cutover must include its complete current compile-time consumer set.

## IA28 — freshly revalidate Queue and Create and accept the bounded shell/Context foundation slice

**Solution:** SD22.  
**Owners:** proof-only `ui/src/OpenCodeAccountControl.tsx`, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`; disproven excluded owner returns upstream.
**Disposition:** CONFORMING_NO_EDIT for existing Queue/Create/account projection; disproven excluded owner returns upstream.
**Required action:** revalidate accepted shell consumers and Queue/Create/readiness/account/linked-remediation proof; no Toolbar dependency migration.  

**Consumer proof closure:** all SURF-APP/QUEUE/CREATE contracts including diagnostic visibility, fixed linked Project, documentation-root Supporting fact and bounded Dialog action/error/focus. Bounded lane proves shell/consumer evidence only; signed IA11/12 realize semantic corrections before final IA26.

**Proof:** `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` plus IA27 shell/Context evidence independently PASS schema/information, UX/interaction, visual/UI, component-ownership and foundation-realization checks. `SURF-APP-001` must prove the accepted compact application-toolbar hierarchy with exact narrow and reference residuals; Queue/Create must not recreate application chrome locally. HUX-10/HUX-11 remain OPEN_BLOCKING until explicit operator acceptance of fresh wide/narrow evidence. IA29 remains blocked until the governing authorization/sign-off path permits it and IA27 ResourceList/ResourceRow all-caller proof is satisfied.

## IA29 — revalidate and correct exact residuals in Work request and governed Document composition

**Binding operator findings:** HUX-01, HUX-02, HUX-07; HUX-05 applies to the Document family visual grammar. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD23.  
**Owner dispositions:** bounded `DocumentWorkspace.tsx` and `MarkdownEditor.tsx`; existing Document/Facts/Section APIs are proof-only.
**Required mutation:** consume existing Document API; pass exact signed committed ArtifactRef from the exact current/final Approval via existing explicit inspection read; signed membership + reached stage, not working-tree snapshot identity, yields SIGNED_LOCKED in the existing pure derivation. Older Approval material remains HISTORICAL/read-only; derive currentness/editability independently, no role/hash alias. Preserve document-first content, closed supporting Facts, compact Git action, Context identity, control→canvas adjacency. Correct HUX-07 narrow controls only where disproven; no new Document.  

**Information/state realization:** SD06/SD23 and SURF-STEP-WR/MAT-SOURCE/DOC/DOC-RO. Four kind contracts, six derived maturity labels distinct from Git/editability, discovered Draft without invented reach, read/edit/preview/split, expected-hash conflict, dirty navigation, active-Run Save exclusion, signed/read-only boundaries, pre-Save return/invalidation and exact Git confirmation. IA13 owns Save/Git consequence, IA29 composition. Prove full long-document content, default-hidden technical fields, inspection/return, wide/medium/narrow continuity.

**Proof:** all IA29 SURF rows PASS wide/narrow; the Markdown/editor is the first dominant content after the document header; `Work request context` / `Document location` are closed by default and expand through the one named disclosure; no always-open pre-document metadata slab, local document/facts grammar, duplicate heading, raw internal enum/technical identity or generic frame/selector remains; Context and Git consent paths remain exact.

## IA30 — revalidate and correct exact residuals in productive stages excluding Proposal Review

**Binding operator findings:** HUX-06; HUX-05 applies to productive-stage surface grammar. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD24.  
**Owner dispositions:** bounded `PreSignoffStageWorkspace.tsx`, `WorkItemWorkspace.tsx`, `ActivityWorkspace.tsx`; retain `ActivityComposer.tsx` and `RunEventTimeline.tsx` as proof-only. **do not change `ProposalReview.tsx`** in IA30; IA31 owns Review proof.
**Required mutation:** parse exact selected governed PLAN bytes through existing pure parser/current-v2 admission; show canonical objective, dependencies, hard scope/exclusions, forecast, acceptance/authority/gates/concerns. No task creation or sign-off. Invalid/unavailable bytes use existing error/state. Correct current attention under historical selection; retain direct Document/Dialogue/Evidence/State and exact turn/anchor.  

**Functional realization beyond component cutover:** use exact R1/R2/DESIGN/PLAN and MAT-ACTIVITY rows. Each applicable stage/kind routes canonical ready, processing, OPEN, REQUIRED_INPUT, proposal/adopting (IA31 routing only), blocked/failed/cancelled, stale, reached history and unreached/Draft. OPEN binds preceding completed turn; required input binds exact request/question and same-turn explanation. Distinguish INFORMATION/EVIDENCE from STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT per P4 §16.2. IA04 admission, IA15 focus, IA14 reason/return. Final events and bounded activity separate from conversation; shared human event/failure projection. R1 source/evidence/history; R2 R1/source/evidence; DESIGN R2/R1/source/evidence; PLAN DESIGN/R2/R1/source/evidence plus derived task/change-surface summary from existing parsed task block, no second parser/authority. Intentional subordinate access, exact Context, no generic selector. Prove transitions, stale/duplicate/rejected actions, long transcript and constrained continuity.

**Proof:** all IA30-owned SURF rows PASS; no generic frame/selector or local recurring section/resource grammar in those rows; continuous Dialogue behavior and Context/Evidence inspection remain correct; Proposal Review remains byte/ownership-stable from the accepted IA31 cutover and IA30 introduces no alternate wrapper, selector or local Review grammar.

## IA31 — revalidate and correct exact residuals in Proposal, Readiness and Approval Review composition

**Binding operator findings:** HUX-03, HUX-04; HUX-05 applies to Review-family visual grammar. HUX-08 is the cross-cutting no-slab/component-ownership constraint. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD25 plus IA16/IA17 semantic inputs.  
**Owners:** bounded `SignoffReview.tsx`, `ReadinessWorkspace.tsx`, `WorkItemWorkspace.tsx`; proof-only `ProposalReview.tsx`, `WorkbenchReview.tsx`, `WorkbenchReviewVerdict.tsx`, `WorkbenchReviewSection.tsx`, `DocumentChangeView.tsx`, Facts/ResourceList. Preserve exact signed ArtifactRef membership and existing closed Review APIs.
**Required mutation:** distinguish exact prospective SignoffPackage from historical ApprovalId and signed ArtifactRef/task resources. Current Approval and task ownership use exact id and stage/outcome. History uses bounded Review resources, not generic selector. Keep sign-off adjacent to judged package. Verify Proposal in-context marked change/secondary exact diff, typed R3 verdict, one Review with named sections/Facts/ResourceList, Package documents and task detail; required input replaces Review. Reject any feature-local `order-review-*` structural/card/grid systems. No destructive shared API replacement.  

**Functional realization beyond cutover:** Proposal exact base/target/currentness, contextual document and secondary diff; pending/applying/adopted/rejected/stale/unavailable/error/history, interruption/reconciliation. No guessed currentness or broadened decision admission; insufficient carrier returns upstream. R3 typed verdict and actual governed findings/defective owner, complete review content, package/evidence/history, no-Run/active/input/ready automatic Approval/returned/blocked/failed/cancelled/stale/history. Approval exact package/all signed task fields, current/historical selected package/task provenance in Context, admitted sign-off and visible pending/failure from every decision-bearing detail, stale/read-only history. IA16/17 verdict/currentness, IA14 return. Prove actual outcomes, negative stale/unreached actions, multi-task/long contract, complex proposal hunks, narrow full reachability and focus return. One Review decision owner; no new state model.

**Proof:** Proposal mutation review plus ready/return/required-input and Approval current/stale/sign-off matrices PASS with one verdict, canonical sections/facts/resources, in-context DocumentChangeView, no raw-diff-dominant Proposal surface, whole-R3-under-findings duplication, local review grammar, raw enum, generic selector or technical leakage. Approval proof must include package-document rows and task detail in wide/narrow light/dark states and demonstrate scan-efficient row boundaries, explicit actions, bounded section rhythm and no bare-text substitute. Typecheck proves no old WorkbenchReview consumer remains; explicit operator acceptance is still required.

## IA32 — revalidate and correct exact residuals in Implementation on canonical semantic components

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA32 is not complete while `ExecutionWorkspace.tsx` or its feature CSS owns recurring task-contract/section/facts/resource anatomy that P4 assigns to MasterDetail/Section/Facts/ResourceList.

**Solution:** SD26.  
**Owner:** existing `src/core/lifecycle.ts` validation-boundary derivation and bounded `ExecutionWorkspace.tsx`; existing MasterDetail/Section/Facts/ResourceList proof-only.
**Required mutation:** exact current Approval/task and task-scoped latest Run ordinal; match terminal classification to owning typed VALIDATION_FAILED, builder STAGE_BLOCKED or provider/invocation failure, otherwise recorded classification. Nonterminal GATE_FAILED is not terminal blocker. Human current reason/recovery independent of history. Current reviewer validation uses its own ordered V0–V7 events, not earlier same-trigger attempts; keep exact remediator causal failure until new candidate. Selected historical attempt shows only its own recorded evidence, separately from current boundary. Prove earlier reviewer V3/new reviewer V0 yields current V0, stale failure cannot leak, and history cannot retarget. Retain MasterDetail/Section/Facts/ResourceList, chronology/validation, Context/Evidence; no purge.  

**Functional realization beyond cutover:** independent current ExecutionOwner, selected task, selected builder/reviewer/remediator Run, task ValidationBoundary and exact attempt events/results. Current blocker reason/consequence/recovery/action remains visible during historical selection; no retargeting. Signed task contract/history/validation/resources follow DESIGN classes; full matrix named same-task expansion, not fabricated before a Run. Prove ready/manual exact task start, running, validation, failure/block, retry/resume/cancel, independent review/remediation, successful/no-change, upstream return, historical selection and aggregate completion. Never inherit another Run's results; wide master/narrow Drawer/focus return. No browser progression policy.

**Proof:** IA32 SURF rows PASS wide/narrow; no local recurring card/section/resource grammar, generic technical drawer or current-attention theft by historical selection.

## IA33 — revalidate and correct exact residuals in Complete/Evidence and consume refactored Context

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA33 is not complete while `TerminalResult.tsx` owns recurring outcome/section/resource hierarchy instead of `WorkbenchResult` + canonical Section/ResourceList.

**Solution:** SD27 plus IA19 product-language projection.  
**Owner dispositions:** bounded `WorkItemWorkspace.tsx`, `TerminalResult.tsx` and workbench-presentation; proof-only `WorkbenchResult.tsx`, `EvidenceViewer.tsx`; Context proof remains IA27.
**Required mutation:** UNREACHED Complete routes to State, not TerminalResult; candidate evidence binds exact final Approval.id and complete canonical qualifying reviewer chain for every CANDIDATE_DONE task. Validate exact WorkItem/task/baseline, candidate trigger, unique final CANDIDATE_RECORDED, eight distinct same-Run V0–V7 passes in sequence and preceding V4 REVIEW_PASSED, with P6 V6 minimum-change semantics; missing/mismatched proof for any candidate task is explicit unavailable/error, never partial aggregate evidence. Prove mixed no-op/candidate tasks, missing one candidate chain, cross-Run/baseline and out-of-order proof. Distinguish admitted terminal R1 from signed all-no-op ALREADY_SATISFIED using the exact P6 §6 provenance observation; use neutral ALREADY_SATISFIED explanation without implying sign-off. Consume IA17's shared pure lifecycle terminal-R1 selection (SD27) over canonical Run/RunEvent and exact ArtifactRef identity, consuming listRuns/listRunEvents/listArtifacts and readArtifactContent by output id. Never choose the last same-role/current working-tree artifact; missing, multiple or mismatched terminal evidence is unresolved/unavailable. Neither route may manufacture candidate resources. Preserve one Result/Section/ResourceList and exact-byte Evidence; no new Result.  

**Functional realization beyond cutover:** reached Complete only, canonical WorkOutcome and exact outcome-owned material (terminal R1 result/evidence for schema-admitted R1 completion; exact signed provenance for all-no-op execution), verified-candidate proof from actual qualifying validated execution lineage rather than all historical Runs. Non-delivery omits candidate resources; exact linked-remediation eligibility consumes the existing pure predicate corrected by IA11, including schema-admitted completed Investigation/Audit DUPLICATE/ALREADY_SATISFIED. Result owns the one explicit action, no duplicate current-attention action, no action for delivery-kind or unreached Complete. Failed/cancelled attempts remain Implementation inspection. Exact bytes/identity through Evidence with origin/return, text/binary/unavailable/recovery. IA19 shared vocabulary; no guessed result ordering, lineage or fallback. Prove all outcome classes, direct terminal R1 including DUPLICATE/ALREADY_SATISFIED, competing historical R1 artifacts, missing/mismatched terminal event or bytes, returned execution then terminal R1, exact all-no-op signed and mixed aggregate provenance, negative unreached/action and resource provenance.

**Proof:** candidate/non-candidate/linked-remediation + Evidence rows PASS; no synthetic attention, duplicated outcome, local result/resource grammar, internal enum/event identity or nested primary Surface.

## IA34 — revalidate and correct exact residuals in Settings/account/configuration presentation

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA34 is not complete while Settings/account/model/repository renderers own recurring pane/section/facts/resource grammar outside SettingsLayout/Section/Facts/ResourceList/Form and the one authorized diagnostics owner.

**Solution:** SD28 plus IA18 semantic inputs.  
**Owners:** proof-only `SettingsWorkspace.tsx`, `OpenCodeAccountSettings.tsx`; no mutation authorized.
**Required mutation/proof disposition:** prove eleven Settings rows, negative-state/diagnostics, exact roots/inputs, account/configuration and confirmations. No rewrite; disproven excluded path returns upstream.  

**Functional realization beyond cutover:** all eleven SURF rows, actual repo/account/model inventory, add/move/disconnect/rename/switch/remove, distinct login pending/completed/failed/expired/cancelled, active fields, pending/error/recovery and confirmations. One diagnostics owner; IA18 readiness; prove required Supporting visibility and task-specific inputs, negative raw identity and constrained continuity.

**Proof:** all eleven IA34 rows PASS wide/narrow/theme; canonical component ownership, one diagnostics owner, required facts/active inputs and destructive confirmations are correct.
## IA26 — rendered 0.6.0 UX/UI acceptance evidence

**Binding human-review prerequisite:** every HUX-* row in the operator UI findings ledger must be ACCEPTED. Mechanical evidence generation, browser success and row-level machine checks cannot substitute for that explicit human disposition.

**Solution/authority:** existing SD16-SD18 verification and Workbench realization, current `GW-DOC-WORKBENCH-UX`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, and current DESIGN SD21-SD30. The authority-bound comparison corpus under `docs/references/workbench-ui/` is downstream evidence only and is valid only when its manifest pins these exact current owners.  
**Owners/anchors:** the three forecast files under `docs/references/workbench-ui/` for authority-derived comparison correction; `tests/browser.spec.ts` for deterministic rendered-state capture and coverage assertions; `.github/workflows/ci.yml` for exact-candidate execution and evidence publication; `tests/certification.test.ts` for the exact CI supply-chain rule permitting only the pinned first-party artifact uploader required by this acceptance path.  
**Required mutation:** extend the existing Playwright/GitHub Actions verification path so the exact PR merge candidate proves both the complete governed Workbench surface/state set and the C19-F09 component architecture after the ordinary `browser` gate is green. Evidence generation and acceptance remain separate. Before P0.4 targeted comparison, correct the derived atlas current marker to represent canonical current workflow position independently of selected material, and its validation-recorded attempt fixture to one task-global ordinal: builder Attempt 1, subsequent reviewer Attempt 2, matching detail label and selected-attempt query. Preserve exact separate attempt validation (builder recorded events only, reviewer V0–V7 only), current task boundary and selected-attempt state; no fake runtime record or runtime-derived desired layout. Rebind manifest/README to exact current authority, retain 37 SURF entries and capture scopes. The implementation must:
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

**Evidence execution scope:** SD30 includes `tests/e2e-server.ts` for canonical persisted fixtures, and only `docs/references/workbench-ui/reference-atlas.html`, `reference-manifest.json`, `README.md` for derived mapping/render/provenance. Independently review against P3/P4/DESIGN, never mirror bad runtime. Require settled full reachable content, independent current/reached/selected stage and task/Run identity, actual action/state results, exact scope/viewport/effective theme. Broad fallbacks or non-equivalent fixtures cannot satisfy coverage. Operator UI-01–UI-20 issue-only review (UI-02 superseded by UI-08); exhaustive internal evidence separately retained. Full 46 scenario and 37 SURF datum/action proof under closeout; no new verification framework.

**Proof:** required PR Verification rendered-evidence step succeeds on the exact candidate, publishes exhaustive scope-valid evidence, and the separately reviewable screen-by-screen acceptance ledger has no unresolved `FAIL`; capture generation/coverage alone cannot satisfy IA26.
