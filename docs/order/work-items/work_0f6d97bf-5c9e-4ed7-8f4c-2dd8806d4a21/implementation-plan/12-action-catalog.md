# 0.6.0 implementation action catalog

**Role:** shared detailed action definitions for the single cumulative T1.  
**Authority:** each IA action is downstream of `requirements.md` and `solution-design.md`; this file cannot create product or architecture decisions.

## IA01 — pure project-authority resolution

**Owners/anchors:** `src/core/governance.ts` — existing authority-layer, concern, material and freshness pure functions.  
**Required change:** add the minimum pure resolution operation over validated manifest inputs and shell-expanded paths that determines same-layer precedence plus inherited P1 default/override/extension and fitness-gate bindings.  
**Must not:** perform filesystem/provider I/O, infer semantic contradiction, introduce a DTO/service/repository/class hierarchy or parallel authority graph.  
**Proof:** core tests cover ordering, defaults, override/extension, unresolved invalid inputs and deterministic equality.

## IA02 — consume resolved authority before productive context

**Owners/anchors:** `src/daemon/authority.ts` — `resolveStageContextState`, `resolveStageContext`, approval/material closure; `src/daemon/stage.ts` — `stagePrompt` / stage admission.  
**Required change:** consume IA01's resolved projection before provider context/conformance/sign-off dependency construction.  
**Must not:** move semantic resolution into provider prompts or browser state.  
**Proof:** daemon tests prove provider context sees only resolved authority and blocks invalid/unresolved bindings.

## IA03 — one GOVERNANCE proposal/adoption mechanism

**Owners/anchors:** `src/core/contracts.ts` ArtifactRef/proposal/RunEvent contracts; `src/core/governance.ts`; `src/daemon/stage.ts` `proposalDisposition`, `proposalAdoptionRequest`, `adoptArtifactProposal`, `reconcilePendingArtifactProposals`.  
**Required change:** extend the existing proposal path so R2 may target only current manifest-resolved P2/P3 owners and DESIGN only current P4/P5/P6 owners, with exact role/layer/path/base-hash re-resolution before adoption.  
**Must not:** introduce stage-specific proposal DTOs, direct agent writes or a second decision store.  
**Proof:** core/daemon negative tests reject wrong layer/path/hash/stale targets; adoption emits the existing immutable ArtifactRef/freshness consequences.

## IA04 — durable-decision completion admission

**Owners/anchors:** `src/core/lifecycle.ts` `evaluateStageCompletion`, `validateStageProviderTurn`, input/proposal derivation; `src/daemon/stage.ts` `runStageTurn`, `submitRunInput`.  
**Required change:** after the latest answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT request, reject stage completion until a later proposal adoption proves durable authority.  
**Must not:** persist chat as authority or create a new decision state machine.  
**Proof:** core/daemon chronology tests cover adopted, rejected, cancelled, stale and ordinary INFORMATION/EVIDENCE input.

## IA05 — non-vacuous signed task contract

**Owners/anchors:** `src/core/contracts.ts` SignedTaskBlock/task schemas; `src/core/execution.ts` `parseSignedTaskBlockFromPlan`; `src/daemon/authority.ts` `validateTaskDefinitions`.  
**Required change:** enforce implementation-required plans contain at least one materially specified task with nonblank id/objective and nonempty justified scope/changeSurface/acceptance/gates/authority/concerns under existing legality rules.  
**Must not:** create another task representation.  
**Proof:** exact positive/negative parser and R3/sign-off validation tests.

## IA06 — canonical Approval identity normalization

**Owners/anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts` `signOffWorkItem`.  
**Required change:** trim `approvedBy` at canonical parsing/admission and reject whitespace-only identity before persistence.  
**Must not:** leave the invariant browser-owned.  
**Proof:** direct daemon/contract negative tests plus browser feedback test.

## IA07 — typed BUILDER checkpoint request

**Owners/anchors:** `src/core/contracts.ts` RunEvent payload; `src/core/execution.ts` `builderProviderTags`, `providerEventIsAdmitted`.  
**Required change:** add exactly `GATE_CHECKPOINT_REQUESTED { gateId }`, admitted only as the terminal action of a BUILDER provider turn.  
**Must not:** admit STAGE/REVIEWER/REMEDIATOR use or carry result/evidence in the request.  
**Proof:** role/event admission tests.

## IA08 — coordinator-owned signed checkpoint execution

**Owners/anchors:** `src/daemon/execution.ts` execution turn/reaction functions including `executeMutatingRun` / `executePostSignoffRun`; `src/daemon/validation.ts` `runRequiredGates`, gate evidence/result owners.  
**Required change:** validate signed gate/current manifest/freshness, execute the gate in the current builder workspace through existing validation effects, record existing GATE_PASSED/GATE_FAILED evidence, then continue the same Run/session.  
**Must not:** grant provider shell/execute, create persisted checkpoint state or substitute checkpoint evidence for V3/V5/V7.  
**Proof:** daemon checkpoint pass/fail/unsigned/stale/continuation tests.

## IA09 — singular new-source planner

**Owners/anchors:** `src/daemon/work-item-source.ts` `reconcileWorkItemSources`, `createWorkItemFromSource`.  
**Required change:** factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan for a validated source snapshot.  
**Must not:** add another source model or persistence path.  
**Proof:** unit/integration tests show created/discovered inputs produce equivalent admission plans except provenance.

## IA10 — converge created/discovered persistence

**Owners/anchors:** `src/daemon/work-item-source.ts` `createWorkItemFromSource`, repository reconciliation/applyPlan owner.  
**Required change:** route UI-created and discovered source snapshots through IA09 and the existing applyPlan persistence boundary; delete direct create-path WorkItem construction/store.  
**Proof:** daemon tests prove one persistence owner, source read-back and diagnostics/freshness remain intact.

## IA11 — canonical Create interaction

**Owner/anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required change:** ordinary vocabulary is **Concerns**; linked remediation shows parent project as fixed context and cannot offer an invalid cross-project choice.  
**Proof:** browser tests for ordinary creation and linked remediation.

## IA12 — one archive/project/search queue derivation

**Owners/anchors:** `ui/src/app.tsx` `App`; `ui/src/WorkItemQueue.tsx` `WorkItemQueue`.  
**Required change:** App selects active versus include-archived canonical dataset, then applies project/search filtering exactly once; queue receives filtered rows and archive-toggle behavior.  
**Must not:** retain queue-local alternate filter semantics.  
**Proof:** browser matrix for active/archived × project × search.

## IA13 — exact documentation-Git review

**Owner/anchors:** `ui/src/DocumentWorkspace.tsx` `DocumentationGitConfirmation`, existing documentation status/path projection.  
**Required change:** confirmation lists exact governed changed paths/states before commit.  
**Must not:** create a second Git path/status owner.  
**Proof:** browser assertions for exact paths and state labels, including negative stale/conflict cases.

## IA14 — current attention remains visible during inspection

**Owners/anchors:** `src/core/lifecycle.ts` `deriveCurrentAttention` remains canonical; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts` material/summary derivation.  
**Required change:** keep historical/supporting inspection but render the exact higher-priority current attention owner/action visibly and directly reachable whenever selected material differs.  
**Must not:** create browser workflow policy or clear legitimate historical selection merely to show attention.  
**Proof:** presentation/browser cases for required input, proposal, blocker, stale/recovery and historical selection.

## IA15 — focus once per required-input request

**Owners/anchors:** `ui/src/ActivityComposer.tsx` `ActivityComposer`; `ui/src/ActivityWorkspace.tsx` `StageRunMaterial`.  
**Required change:** on a newly current required-input event id, move focus once to the Workbench-owned composer region; do not refocus on polling/rerender.  
**Must not:** inspect private Astryx DOM/API or add workflow state.  
**Proof:** browser focus-once, rerender and responsive continuity cases.

## IA16 — canonical Readiness verdict projection

**Owner/anchor:** `ui/src/ReadinessWorkspace.tsx` `ReadinessWorkspace` plus existing presentation helper owner.  
**Required change:** dominant verdict is the typed R3 completion outcome; material maturity/currentness is separate supporting state.  
**Proof:** browser/presentation tests for READY_FOR_SIGNOFF, RETURN_TO_* and BLOCKED, including stale material.

## IA17 — Approval readiness/currentness hierarchy

**Owner/anchor:** `ui/src/SignoffReview.tsx` `SignoffReview`.  
**Required change:** present canonical readiness and package currentness before technical package identity; stale/history states never fabricate readiness.  
**Proof:** browser/presentation tests for current/stale package states.

## IA18 — operator-first Settings hierarchy

**Owner/anchors:** `ui/src/SettingsWorkspace.tsx` `SettingsWorkspace`, `RepositorySettings`, `ModelRuntimeSettings`.  
**Required change:** readiness, meaning and available operator actions are primary; exact roots/endpoints/model-source/credential-like identity moves to existing Technical details except where an active Add/Move/configuration task requires the exact value.  
**Must not:** alter canonical configuration/provider models.  
**Proof:** browser tests for normal settings, attention/blockers and active configuration tasks.

## IA19 — product-language projection

**Owners/anchors:** `README.md`; `ui/src/TerminalResult.tsx` `TerminalResult`; `ui/src/workbench-presentation.ts` result labels.  
**Required change:** public/product surfaces use verified result as umbrella and **Verified candidate** for CANDIDATE_DONE; implementation remains conditional; no automatic delivery overclaim.  
**Must not:** prettify internal enums into product copy.  
**Proof:** presentation/browser copy assertions.

## IA20 — exhaustive production-renderer classification certification

**Owner:** `tests/certification.test.ts`.  
**Required change:** derive/check complete production renderer coverage against the canonical Workbench renderer-to-primitive matrix, including currently omitted renderers such as ActivityComposer.  
**Must not:** edit `tests/architecture.test.ts` or create a second UI registry.  
**Proof:** test fails for an unclassified production renderer and passes the current approved set.

## IA21 — scenario-41 work-kind certification

**Owners:** `tests/browser.spec.ts` plus existing fixture/helpers.  
**Required change:** certify all four WorkItem kinds' Work request and Research information contracts and preserve distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind matrix, not label-only assertions.

## IA22 — System/Light/Dark component and semantic-role parity

**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required change:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states render the canonical component language and semantic roles under System/Light/Dark.  
**Authority:** Workbench component architecture and Workbench theme.  
**Proof:** semantic role/component assertions rather than incidental pixel snapshots.

## IA23 — targeted core/daemon/presentation regression closure

**Owners:** `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/workbench-presentation.test.ts`, with browser coverage where interaction is material.  
**Required change:** add positive and negative proofs for IA01-IA19: authority resolution, proposal admission, durable decisions, task non-vacuity, Approval identity, checkpoint flow, source singularity, queue filtering, Git review, attention, Readiness/Approval/Settings/result language and focus.  
**Proof:** every production IA action has at least one owned regression and all negative invariants remain explicit.

## IA24 — candidate closeout

**Owner/surface:** `CHANGELOG.md` plus coordinator-owned validation evidence.  
**Required change:** record user-visible/correctness consequences under Unreleased; run dependency-lock, typecheck, architecture, test, build and browser on the exact final candidate; complete V0-V7 with fresh V4/V5/V6 and no stale evidence reuse after edits.  
**Terminal:** only CANDIDATE_DONE or valid ALREADY_SATISFIED. PR merge/release/version bump remain outside T1.
