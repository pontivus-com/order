# 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

## Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD30; IA01-IA34 | — | one cumulative 43-path 0.6.0 candidate; internal waves below own ordered mutation/proof responsibilities | F6B retained closed APIs and required absence; exact residuals and complete consumer proof; operator-accepted foundation retained within scope | final V0-V7 + SD16-SD18/SD29 certification + IA26/SD30 exact-candidate 37-SURF and component-architecture acceptance |

**Audit rule:** T1 is the only P6 ExecutionTask. Wave/IA ordering below is internal implementation sequencing and never relies on candidate-byte promotion between tasks. A later phase discovering a foundation defect returns to IA27/DESIGN rather than patching around it; T1 cannot close until every owned phase obligation and final candidate proof is satisfied.

## Execution waves

This candidate confers no authority. Production mutation requires current G4/G5/G5A, independent R3/G6 and exact normal sign-off. An optional bounded IA27/IA28 lane requires current R3 and separate §17A grant; none is presumed. No new foundation reconstruction is required.

0. Read-only IA07/IA08 checkpoint/scope preflight.
1. Signed IA01 → IA02 → IA03 → IA04 exact authority, adoption-recovery and durable-decision residuals; IA11 corrects linked-remediation eligibility. IA05/IA06/IA09/IA10/IA12 are existing capability proof. IA25 corrects and proves the exact fresh installer readiness boundary in this signed wave. IA17 establishes exact canonical Approval reads, shared conformed-completion selection and query/invalidation ownership before Context, Document and Review consumers.
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

**SD12 admitted reach:** Correct `deriveReachedStages` in the existing `src/core/lifecycle.ts` owner using the same exact stage-completion/conformance selection as SD11/SD27. Only the same WorkItem's COMPLETED STAGE Run with one matching stage completion and one subsequent same-Run conformance with matching context hash and exact output identity proves a destination. Missing/rejected/foreign/conflicting/reversed evidence proves no destination; retain actual stage, actual Run stage and legitimate historic entry independent of current material freshness. Correct `tests/e2e-server.ts` paired-event chronology, never allow legacy reversed ordering. IA17 owns mutation and core/daemon proof; IA27/IA29/IA16/IA31/IA33 consume before their respective proof. No new carrier, state, persistence or UI-derived reach.

**SD12 closure:** preserve non-mutating query and exact package admission/recomputation; verify current/stale/returned/historical package and selected signed/approved task lineage against P6, including selected task identity in IA27 Context. No current readiness inferred from latest artifact. Decision feedback in task detail and overview; IA31 owns shared Review.

**Proof:** core/daemon/browser/presentation exact R1/R3 completion selection, negative raw/rejected/foreign/missing/duplicate/reversed/mismatched evidence, positive admitted historic entry surviving return/staleness/failure, current/final/history reads, missing and contradictory provenance, current/stale package cases, exact bytes/no writes and cache invalidation.

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

**Solution:** SD19; FR007/079; PL-C16-02/03.
**Canonical authority:** corrected P3 Installation Readiness `9c2ec83a9552b7583f90e91080c014df4d6870df`, P4 `63f3edf59908411f1b44e77fa2cb134d613a22f8`, P6 `9cbb581ae2262d4572be6519da46bbf47152ab51`.
**Existing owners:** `src/installer.ts::runInstaller/waitForHealthyDaemon`, `src/shell/setup.ts`, `src/daemon/server.ts`; retain `src/daemon/settings.ts::installationReadiness` and existing core schema/provider/token owners unchanged.
**Required mutation:** After existing guided setup and service activation, retain `waitForHealthyDaemon` as liveness only. In `src/installer.ts::runInstaller`, using the existing `existingInstallation` decision, invoke `src/shell/setup.ts::requireFreshInstallerReadiness` only for fresh install, immediately after health and before `retireLegacyGateweftArtifacts`, profile/success or removal of rollback backups. That existing setup boundary uses the same immutable `locations.bind` already validated by successful installed `order status`; construct only its HTTP loopback origin, reject credentials/path/query/fragment/non-loopback and redirects, use `loadDaemonToken(stateRoot)` (existing owner), GET `/api/settings/readiness` with exact Bearer header and a 180-second bounded fetch (two existing bounded provider probes plus margin). Parse through existing `InstallationReadinessSchema`; require `ready === true` and zero blockers, otherwise throw bounded actionable failure without token/response-secret leakage. `src/daemon/server.ts` admits a valid daemon Bearer only for this existing readiness GET alongside existing browser auth and delegates to the unchanged `installationReadiness` owner in settings.ts. No new route, DTO, CLI command, alternate readiness policy or provider-account check. Fail closed on missing/malformed/inconsistent/unauthenticated/unavailable response; existing installer catch/rollback handles failure. Update/recovery still uses liveness and authenticated Settings blockers, with no fresh-ready requirement. Preserve guided choice collection, private provider state, migrations and rollback.
**Proof:** Existing installer test file exercises the actual fresh completion helper with ready and every blocker, missing/invalid auth, malformed/inconsistent JSON, non-200/timeout and redirect refusal; exact token never emitted; setup success followed by not-ready must fail, update/recovery may remain incomplete. Daemon test proves browser/Bearer produce identical canonical readiness, unauthorized read fails, no other endpoint gains Bearer, and no state mutation. Certification verifies the actual installer call occurs after health and before retirement/backups/success, fresh-only branch and failure enters existing rollback; existing setup/cancel and migration/rollback tests retained.
**Forbidden:** new configuration or readiness schema/state, duplicate readiness calculation, broad Bearer admission, new route or CLI surface, credential leakage, mandatory post-success fresh setup, update readiness gating or rewritten installer. Source mutations only after normal signed T1 admission.


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
