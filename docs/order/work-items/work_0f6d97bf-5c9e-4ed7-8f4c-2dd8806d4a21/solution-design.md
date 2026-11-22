<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Order 0.6.0 integrated technical solution design

## Exact design basis

This DESIGN is reconstructed under G-F12 after G3 closure. Its semantic direction is canonical authority -> current R1 facts -> current R2 functional consequences -> explicit package technical realization. Current implementation/tests are realization evidence only and never supply missing design semantics.

- R1 `research.md`: blob `99f6932e582bde949de72716f29ea0868eba16a0` — G-F12 factual package plus post-closeout rendered-evidence findings C19-F02/C20-F05 and the governed post-IA31 information-hierarchy audit C19-F03/C20-F06. Current UI/SVG/tests remain realization evidence only; the audit proves that screen-family hierarchy without per-datum visibility/disclosure ownership is insufficient.
- R2 `requirements.md`: blob `27faa1a67321c8091deb27a4fd70ae912209c30a` — functional package binds the C19-F03/C20-F06 surface-family consequences to canonical `GW-DOC-WORKBENCH-UX-V2 §11.4A`; it does not create a second visibility policy.
- Corrected P3 Installation Readiness: blob `9c2ec83a9552b7583f90e91080c014df4d6870df` — §§2/4.2 and `GW-FR-079` now distinguish successful fresh-install completion from post-install/update recovery without adding `precedence.p3`.
- P4 Technical Architecture: `868a73535b080bfeb5519865ffe21bad754315a3` — §35.1 now explicitly separates reachable authority selection from stage-material applicability for stable/versioned refs.
- P3 Workbench UX: `114226b7b30657fd334b47a9c74f5e24479564a1` — §11.4A owns the permanent visibility/disclosure taxonomy and human-meaning-only promotion rule.
- P4 Workbench: `916add5e528447a6509746b95b947c50eff3d232` — §8.12A owns the technical disclosure lanes, §8.17 now explicitly enumerates the complete production-renderer matrix, and the shell/context responsibility statements are reconciled to the §16.6 AppShell/WorkItemShell reconstruction.
- P4 Workbench Theme: `fffd1d202537dbd3f85f6b30ee745d2eae454c53`.
- P4 OpenCode Integration: `4416547cba749fc9a3fec62dd4be76ad94952527`.
- P4 Execution Control Plane: `5348404854f317a017fa3efdc2436b06bcfeb9f2`.
- P6 Canonical Contracts: `71f829cff8824db18194689eccdec83da6f5d19f`.
- Exact current runtime evidence for the A06/A07 execution boundary: `src/core/contracts.ts` `8d3705fdc4a998a816422cc9e05bd021246636d6`; `src/core/execution.ts` `8eb779d852dbd7ff469b3374d8f5885ac538b2b7`; `src/daemon/execution.ts` `8f0687077a9b72abaaf5fb57fb43c73956a8dd14`; `src/daemon/validation.ts` `3ace35efdd05a57f2b52b01a6e234a0759ea52db`; `src/shell/opencode.ts` `6e7a7a60c8e6cc642fa4943bf0562aba53865cd2`.
- Exact-head verification before this G4 reconstruction: PR Verification #1482 / run `44625901452` passed on branch head `17d2c0a993c347619a07ecf35bb0e04e0d672e93`.

Current implementation/tests/UI are used only through the exact R1 evidence cited below. A `POSITIVE_NO_CHANGE` is therefore an explicit technical decision backed by that evidence; it is never an implicit preservation target.

## DESIGN disposition vocabulary

- `POSITIVE_NO_CHANGE`: exact R1 evidence positively proves the requirement's current P4-P6 realization; no implementation task is created for that requirement.
- `DEPENDENCY_DELTA`: the requirement's own realization remains, but it consumes a separately owned technical correction.
- `TECHNICAL_DELTA`: the requirement's direct realization must change.
- `MIXED_TECHNICAL_DELTA`: only the exact violated sub-obligation changes; conforming remainder is preserved by authority.
- `VERIFICATION_DELTA`: behavior is conforming but binding permanent proof is incomplete.
- `MIXED_TECHNICAL_AND_VERIFICATION_DELTA`: both an exact behavioral sub-obligation and permanent proof require correction.

## G-F12 complete technical realization reconstruction

This section is the mandatory package-level technical projection required by campaign §4.3. It does not replace P4-P6 owners. It makes their exact 0.6.0 realization explicit so PLAN and implementation do not have to recover architecture from current code, tests, historical UI or generic no-change rows.

### Package technical invariants

1. The canonical semantic carriers remain WorkItem, ArtifactRef, Approval, ExecutionTask, Run and RunEvent. No workflow aggregate, DTO/model family, second task representation, second proposal representation or browser-owned authority is introduced.
2. Work kind is derived from the pinned WorkItem schema. The ordinary v2 pins are change-v2, defect-v2, investigation-v2 and audit-v2. The schema catalog owns which downstream templates exist; Investigation/Audit have R1 only and do not acquire fake R2/DESIGN/PLAN/R3 carriers.
3. Pre-signoff productive work is one STAGE Run at the current lifecycle stage. src/daemon/authority.ts resolves current source/project/P1-P6 context; src/daemon/stage.ts owns R1/R2/DESIGN/PLAN/R3 orchestration; src/daemon/run.ts owns Run/RunEvent/provider-session mechanics; src/shell/opencode.ts owns the provider effect. The exact context identity is carried by Run.contextHash.
4. Governed lifecycle documents are repository Markdown identified by ArtifactRef. Direct human Save and provider proposal/adoption are the only pre-signoff mutation ingresses; conversation and provider state never become authority.
5. Lifecycle, attention, material-currentness, recovery, rail, execution-owner and validation-boundary decisions remain pure core policy in src/core/lifecycle.ts. The UI consumes those decisions; it does not reconstruct them from labels, selected history or transport state.
6. The browser reads canonical daemon state through the existing loopback HTTP/TanStack Query boundary. WorkItemWorkspace composes WorkItem plus subordinate Run, RunEvent, ArtifactRef, ExecutionTask, source-diagnostic and sign-off-package queries. No aggregate workflow transport object is added.
7. Workbench renderers compose the canonical primitives owned by GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2. Responsive/theme changes may recompose presentation but may not change the current owner, action, material semantics or lifecycle transition.
8. OpenCode is a provider inside Order. Every productive session is subordinate to one Run, one stage, one contextHash, one selected provider/model and one effective permission profile. Provider loss/rejection never becomes lifecycle authority and never applies a partial workflow effect.
9. PLAN receives a complete DESIGN decision. Implementation may make only the already-authorized minimum same-layer physical decomposition; a new semantic owner, contract/state meaning, effect boundary, dependency, validation contract or behavior returns upstream.

### Canonical technical carrier chain

    validated repository source + ProjectManifest/P1-P6
      -> WorkItemSourceSnapshot + WorkItem
      -> resolved stage context/contextHash
      -> Run(role=STAGE) + RunEvent[]
      -> exact lifecycle ArtifactRef (R1/R2/DESIGN/PLAN/R3)
      -> Approval + ExecutionTask[] after exact sign-off
      -> Run(role=BUILDER/REVIEWER/REMEDIATOR) + validation/evidence RunEvents
      -> WorkItem(COMPLETE, outcome) + terminal governed material

At every arrow the producer and consumer use the existing canonical type/schema owner. A document, event, selection or provider transcript that is not in this chain is evidence/presentation only and cannot create another authority path.

### Work-kind × workflow-step technical realization

| Work kind / step | Schema, context and governed carrier | Producer -> carrier -> consumer | Pure/effect ownership and Workbench composition | Failure/recovery/terminal realization | Reuse, delta and permanent proof consequence |
|---|---|---|---|---|---|
| CHANGE / Work request | change-v2 -> change-intake-v2; exact Markdown source is WorkItemSourceSnapshot and WorkItem.sourceSha256/schemaId binds classification. | CreateWorkItem / guarded source Save -> source file + canonical source parse/reconcile -> WorkItem IDEA/R1 context. | src/core/work-item-source.ts owns catalog/template/parse policy; daemon source owner applies one QueuePlan/persistence path; CreateWorkItem and DocumentWorkspace render WorkbenchForm/Markdown source. Filesystem/Git remain shell effects. | INVALID_SOURCE/duplicate/project/concern/stale diagnostics block productive start; expected-hash Save fails closed. Source change returns progressed work through canonical freshness policy. | Preserve singular source owner; SD03/SD04/SD06 cover exact known deltas. core/daemon/browser certification prove template, admission and Git review. |
| DEFECT / Work request | defect-v2 -> defect-intake-v2 with observed/expected/reproduction/preservation sections; same WorkItemSourceSnapshot carrier. | Same source pipeline; defect schemaId deterministically selects defect R1 and later delivery templates. | Same core/daemon/UI owners; no Defect-specific state model. | Same source diagnostics; missing known facts remain source/R1 work rather than inferred values. | Preserve shared source machinery and kind-specific template; SD03/SD04/SD06 plus schema/catalog tests. |
| INVESTIGATION / Work request | investigation-v2 -> investigation-intake-v2; same source/WorkItem carriers; downstream schema set intentionally ends after R1. | Source -> WorkItem -> R1 context only. | Same source owner/UI; no delivery artifact placeholders are materialized. | Source invalidity blocks R1. Later remediation is a new same-project Change/Defect source with derivedFromWorkItemId provenance. | Positive reuse of catalog/lifecycle terminalization; terminal/browser certification must prove no fake downstream stages. |
| AUDIT / Work request | audit-v2 -> audit-intake-v2; same source/WorkItem carriers; downstream schema set intentionally ends after R1. | Source -> WorkItem -> R1 context only. | Same source owner/UI; audit criteria remain content, not a new runtime stage. | Source invalidity blocks R1; remediation is separate work. | Positive reuse; certify audit terminalization and linked-remediation boundary. |
| CHANGE / Research | change-r1-v2. Resolved source + P1/P2/project authority + repository/runtime evidence become current contextHash for Run(STAGE,R1). R1 Markdown is ArtifactRef role R1. | authority resolver -> stage Run/OpenCode turn -> admitted RunEvent batch -> R1 ArtifactRef/conformance -> WorkItem R2 or terminal outcome. | core lifecycle validates turn/completion; daemon stage/run own orchestration/persistence; OpenCode shell owns provider effect; ActivityWorkspace/DocumentWorkspace/ProposalReview render dialogue/activity/document/proposal through Workbench primitives. | HUMAN_INPUT_REQUESTED may wait; provider rejection applies no requested effects; PROVIDER_FAILED leaves WorkItem at R1; STAGE_BLOCKED owns blocker; DISPROVEN/DUPLICATE/ALREADY_SATISFIED terminalize. | Existing carrier/session model reused. SD08 applies durable-authority input correction; SD17 closes four-kind scenario proof. |
| DEFECT / Research | defect-r1-v2; identical carrier topology with defect root-cause/reproduction/preservation content. | Same pipeline; accepted R1 ArtifactRef is the factual root-cause input to R2. | Same owners; no generic Change template substitutes for defect semantics. | CONFIRMED only after factual/root-cause closure; invalid/rejected provider result cannot fabricate closure. | Reuse shared STAGE machinery; kind-specific template/context and scenario-41 certification remain explicit. |
| INVESTIGATION / Research | investigation-r1-v2; R1 ArtifactRef is the governed result material. | stage Run -> R1 ArtifactRef -> StageCompletion INVESTIGATION_COMPLETE/DUPLICATE/ALREADY_SATISFIED -> WorkItem COMPLETE. | Same STAGE/OpenCode/event owners; TerminalResult consumes final WorkItem plus R1 artifact/evidence. | NEEDS_DECISION/BLOCKED retain R1; provider failure retains R1; no R2 template exists. | Positive reuse; proof must assert no R2/DESIGN/PLAN/R3/Execution artifacts are created. |
| AUDIT / Research | audit-r1-v2; R1 ArtifactRef carries criterion evidence/findings/verdict. | stage Run -> R1 ArtifactRef -> AUDIT_COMPLETE/DUPLICATE/ALREADY_SATISFIED -> COMPLETE. | Same STAGE/OpenCode/event owners and TerminalResult projection. | Block/failure retains R1; no delivery stage is synthesized. | Positive reuse; proof mirrors Investigation with audit outcome semantics. |
| CHANGE / Requirements | change-r2-v2; context consumes current source + R1 + resolved P2/P3 authority. R2 Markdown is ArtifactRef role R2. | R1/current authority -> Run(STAGE,R2) -> admitted events/proposals -> R2 ArtifactRef/conformance -> DESIGN. | src/daemon/stage.ts owns productive R2; proposal target admission/adoption stays in existing authority/proposal owner; ActivityWorkspace + LifecycleDocumentMaterial + ProposalReview render one current interaction/document. | Missing intent/contradiction blocks. Authority-changing chat is insufficient until canonical source/owner adoption and context re-resolution. | SD09 extends one proposal/adoption path for P2/P3 targets; all other R2 carrier mechanics are positive reuse. |
| DEFECT / Requirements | defect-r2-v2; same carriers, but template preserves corrected behavior plus unchanged/regression behavior. | Same R2 pipeline -> DESIGN. | Same owners; Defect semantics remain in template/content rather than another state machine. | Missing correction/preservation semantics blocks R2. | SD09 shared authority path; proof must retain defect-specific R2 template and downstream preservation trace. |
| INVESTIGATION / AUDIT / Requirements | stageTemplateIdFor returns no R2 template for these schemas. | No producer, no ArtifactRef R2, no Start R2 transition. | Workbench derives UNREACHED rather than empty productive material. | A remediation need creates a distinct Change/Defect WorkItem. | Positive terminalization proof; no technical delta. |
| CHANGE / Solution design | change-design-v2; context consumes current R2 plus relevant P4-P6/project authority; output is ArtifactRef role DESIGN. | R2 -> Run(STAGE,DESIGN) -> events/proposals -> DESIGN ArtifactRef/conformance -> PLAN. | stage/authority/run/OpenCode owners unchanged; permanent P4-P6 amendment uses the same proposal/adoption carrier with target/layer validation. Workbench uses dialogue/document/review composition. | Missing R2 behavior returns upstream; stale proposal/base hash rejects and re-resolves. | SD09 admits current P4-P6 proposal targets; package technical realization is this DESIGN itself. |
| DEFECT / Solution design | defect-design-v2; same carriers with root-cause correction, behavior-to-delete/replace and preserved invariants. | R2 -> DESIGN ArtifactRef -> PLAN. | Same owners; minimum root-cause remediation is design content, not an execution heuristic. | Symptom masking or preservation weakening fails DESIGN conformance and returns to R2/DESIGN owner. | Existing technical owners plus SD01-SD20 exact deltas; regression proof remains mandatory. |
| INVESTIGATION / AUDIT / Solution design | no DESIGN template exists for these schema pins. | No DESIGN Run/artifact. | UNREACHED presentation only. | Separate remediation work if needed. | Positive no-downstream-carrier proof. |
| CHANGE / Implementation plan | change-plan-v2; PLAN ArtifactRef contains S8-S10 content and exactly one canonical order-tasks block. | DESIGN -> Run(STAGE,PLAN) -> PLAN ArtifactRef/conformance -> R3. | stage owner renders prompt/template; src/core/execution.ts remains the single signed-task parser/admission owner; daemon authority/stage consume it. Document/dialogue proposal surfaces remain shared. | Vacuous/semantically incomplete current-v2 PLAN is rejected; missing architecture choice returns to DESIGN rather than implementation. | SD10 owns v2 non-vacuity only; existing scope/forecast/checkpoint execution foundation is reused. |
| DEFECT / Implementation plan | defect-plan-v2; same task carrier with root-cause/removal/reproduction/regression/preservation obligations. | DESIGN -> PLAN ArtifactRef -> R3. | Same task/parser/daemon owners; no remediation DTO/task variant. | Omitted reproduction/preservation proof fails PLAN conformance/R3. | SD10 shared mechanical admission; defect-specific semantic proof retained. |
| INVESTIGATION / AUDIT / Implementation plan | no PLAN template and no signed task block. | No PLAN/R3/Approval/Execution producer. | UNREACHED downstream presentation. | Linked remediation is separate. | Positive terminalization proof. |
| CHANGE / DEFECT / Readiness review | delivery-r3-v2; Run(STAGE,R3) consumes exact current P1-P7 package and produces ArtifactRef role R3 plus typed StageCompletion. | current package -> R3 Run -> READY_FOR_SIGNOFF or exact RETURN_TO_* -> AWAITING_SIGNOFF or upstream owner. | src/daemon/stage.ts/authority.ts own package/context/conformance; core lifecycle owns typed return; ReadinessWorkspace maps verdict/current material into WorkbenchReview. | Return routes to exact R1/R2/DESIGN/PLAN owner; REQUIRED_INPUT may temporarily own attention; readiness never repairs defects. | SD11 fixes verdict hierarchy; existing R3 carrier is reused. |
| CHANGE / DEFECT / Approval | No provider Run. Exact sign-off package binds baseline commit, source hash, material ArtifactRefs, R3 and parsed task block. Approval + ExecutionTask are canonical carriers. | daemon authority builds package -> SignoffReview -> explicit sign-off -> Approval + materialized ExecutionTasks -> EXECUTION. | Core schemas/task materialization and daemon authority own invariants/persistence; SignoffReview renders WorkbenchReview and technical disclosure. | stale/different package, invalid readiness or invalid approver blocks; no partial Approval/tasks. | SD12 fixes identity/hierarchy; existing exact-package/sign-off mechanism reused. |
| CHANGE / DEFECT / Implementation | Approval-owned ExecutionTask is immutable task meaning plus mutable task state; Runs use BUILDER/REVIEWER/REMEDIATOR and RunEvents/evidence through V0-V7. | exact current task -> BUILDER candidate -> deterministic/mechanical checks -> independent REVIEWER -> bounded REMEDIATOR/review as authorized -> verified candidate. | src/core/execution.ts pure policy; daemon execution/validation/run/authority own orchestration; shell Git/OpenCode/gates own effects; ExecutionWorkspace maps current ExecutionOwner, ValidationBoundary, attempts/evidence into MasterDetail/Table/Timeline. | scope/governance/spec/stale/provider failures follow canonical classification/recovery; checkpoint is coordinator-owned; failure never expands task authority. | SD13/checkpoint and scope-forecast baseline are reused; SD10 retains only v2 task-admission delta. Permanent V0-V7/certification proof remains authoritative. |
| CHANGE / DEFECT / Complete | WorkItem(stage=COMPLETE,status=COMPLETE,outcome=CANDIDATE_DONE or other valid terminal outcome) is terminal authority; candidate evidence stays RunEvent/EvidenceRef material. | successful aggregate execution reaction -> WorkItem COMPLETE -> TerminalResult. | core/daemon transition policy owns terminal mutation; TerminalResult uses WorkbenchSurface/Status/resources and has no workflow mutation. | COMPLETE cannot resume; later work is new work. | SD01 fixes result language; candidate/result evidence paths otherwise reused. |
| INVESTIGATION / AUDIT / Complete | WorkItem COMPLETE with INVESTIGATION_COMPLETE/AUDIT_COMPLETE/DUPLICATE/ALREADY_SATISFIED plus reached R1 ArtifactRef/evidence. | terminal R1 reaction -> COMPLETE -> TerminalResult; optional linked remediation starts a new source-backed WorkItem. | Same core terminal owner; TerminalResult reads R1 result, no execution structures. | Original terminal WorkItem is immutable. | Positive reuse; browser certification proves result primacy and separate linked remediation. |

### Productive OpenCode interaction realization

| Functional condition | Exact technical realization |
|---|---|
| stage starts | src/daemon/authority.ts resolves current source/project/P1-P6 material and contextHash; src/daemon/stage.ts creates one INTERACTIVE STAGE Run; src/daemon/run.ts persists STAGE_STARTED before provider admission; src/shell/opencode.ts creates/validates the fresh provider session and exact model/permission/context boundary. |
| processing / bounded activity | Provider-native events never reach the browser. The shell normalizes only the allowlisted activity categories; the daemon Run owner persists bounded AGENT_ACTIVITY_RECORDED RunEvents. Activity is observational and never completion authority. |
| OPEN continuation | An admitted non-controlling STAGE provider batch contains exactly one nonblank AGENT_MESSAGE_FINAL. stageRunInteraction derives OPEN from Run/RunEvents; ActivityComposer may send only against that current interaction. |
| REQUIRED_INPUT | HUMAN_INPUT_REQUESTED(category,question) is the controlling event and Run may become WAITING_FOR_INPUT. stageInputIsAdmitted accepts the exact requestEventId; HUMAN_INPUT_RECEIVED and the Run-state reaction are atomic before the next turn. |
| INFORMATION / EVIDENCE reply | HUMAN_INPUT_RECEIVED continues the same stage/session only while contextHash/model/permissions/source snapshot remain current. It does not mutate source or permanent authority. |
| STAGE_CHOICE / AUTHORITY_DECISION / AUTHORITY_CONFLICT | The category remains explicit in RunEvent. If the answer changes durable intent/authority, stage completion remains blocked until direct governed Save or the existing ARTIFACT_PROPOSAL_CREATED -> ADOPTION_REQUESTED -> DISPOSITIONED(ADOPTED, ArtifactRef) path materializes canonical bytes and context is re-resolved. SD08 closes the missing admission rule. |
| proposal pending/applying | deriveProposalDecision identifies the sole pending/adopting proposal. ProposalReview owns Adopt/Reject; ActivityComposer cannot compete with proposal mutation. Adoption verifies base hash/target/layer, writes exact patch, records ArtifactRef, invalidates downstream conformance and replaces context/session as required. |
| provider result rejected | validateStageProviderTurn/stageProviderBatchRejectionCode validates the entire result array before persistence. A rejected batch persists no requested workflow effect; bounded admission diagnostics are recorded and the Run fails at the same stage. |
| provider/process failure | Provider diagnostics/evidence and PROVIDER_FAILED or PRODUCTIVE_INVOCATION_FAILED identify the failure boundary. Canonical WorkItem/ArtifactRef state is unchanged; pre-signoff read-only session replacement is allowed only from current canonical context. |
| current attempt vs history | WorkItemWorkspace reads canonical Run list and selected RunEvent detail. Historical selection is presentation state only; deriveCurrentAttention/resolveWorkflowMaterial keep current required input/proposal/blocker/action reachable. |
| technical provider identity | Run.contextHash/providerSessionId and bounded ProviderDiagnosticRecord evidence are technical detail. Account/model/session transport identity appears through disclosure/context only unless configuration or recovery makes it the current task. |

### Current-attention, material-selection and responsive realization

The closed core decision vocabulary is reused directly: ReachState, StageRunInteraction, ProposalDecision, MaterialCurrentness, MaterialPresentationState, ExecutionOwner, ValidationBoundary, RecoveryDisposition, ObservationCoherence, CurrentAttentionTag and WorkflowRailItem. These are pure derived values in src/core/lifecycle.ts, not persisted status tables or transport DTOs.

WorkItemWorkspace is the composition owner. It obtains the dedicated current WorkItem observation plus subordinate canonical collections, derives current attention before material presentation, then calls the pure material resolver. Explicit source/document/history/task/evidence selection may change the detail being inspected but never the command target or attention owner. ActivityWorkspace, ReadinessWorkspace, SignoffReview, ExecutionWorkspace, DocumentWorkspace and TerminalResult receive already-canonical facts/decisions and map them into the exact Workbench primitives named by the P4 renderer matrix.

Wide/medium/narrow presentation keeps the same canonical data and derived decisions. Workbench primitives may move supporting material into selector/drawer/overlay composition, but current task, current attention, dirty state, mutation owner, return origin and semantic reading order remain invariant. System/Light/Dark changes token/theme treatment only. C18 required-input focus is implemented at the Workbench dialogue/composer boundary keyed to the exact request event id; polling/rerendering may not repeatedly steal focus.

### Failure, upstream return and terminal realization

| Condition | Technical owner and required reaction |
|---|---|
| source invalid/stale/conflicting | source parser/reconciliation emits typed diagnostic; productive command fails before stage/provider work; explicit reconcile/save owns recovery. |
| unresolved authority/context | core governance + daemon authority fail context gate; no provider prompt compensates; WorkItem remains/returns to the owning stage. |
| stage provider batch invalid | complete batch is rejected before persistence; no partial RunEvent/workflow effect; Run fails at same stage. |
| provider transport/process/completion failure | shell/Run owner records bounded diagnostics/evidence; canonical workflow state is preserved; permitted pre-signoff replacement reconstructs from canonical context only. |
| required human input | exact HUMAN_INPUT_REQUESTED event owns the reply until admitted; reply does not create authority by itself. |
| stale proposal/base/target | proposal adoption rejects/reconciles; no patch is guessed or retargeted. |
| source or lifecycle document direct edit | expected-hash guarded Save writes canonical bytes, invalidates downstream conformance and returns/remains at the exact owning stage. |
| R3 return | typed RETURN_TO_RESEARCH/REQUIREMENTS/DESIGN/PLAN routes through core lifecycle policy and preserves reached history. |
| stale Approval | sign-off/implementation admission rejects and routes to canonical currentness owner; Approval is never silently refreshed. |
| execution validation/provider failure | canonical V0-V7 classification selects retry/remediation/block/upstream return under the signed task; no semantic scope growth. |
| Investigation/Audit successful R1 | WorkItem transitions directly to COMPLETE with typed outcome; no downstream artifact/task/run family is fabricated. |
| COMPLETE | terminal WorkItem/outcome plus reached governed material is read-only; follow-up is a new WorkItem. |

### Integration with the 112 stable dispositions and package atoms

The existing 112-row DESIGN ledger remains the requirement-level ownership/disposition index. Under G-F12 it is no longer permitted to stand alone: each row is interpreted through the explicit carrier/stage model above and its named P4-P6 owner. POSITIVE_NO_CHANGE therefore means the required package technical realization is the shared model above plus the row's exact evidence-backed owner/path; it never means preserve current code because tests are green.

The corrected package now contains 27 package-local atoms: the prior 25 plus `PL-C19-02` for the structurally missing presentation reconstruction and `PL-C20-03` for exact-candidate rendered acceptance. SD01-SD30 are the complete current delta/verification solution set. The two added atoms change no product semantics; they correct the technical/proof realization of existing C19/C20 functional authority.

### Post-A09 authority revalidation

R1 `C16-F04` and R2's adopted Installation Readiness blob `9c2ec83a9552b7583f90e91080c014df4d6870df` remove the same-layer P3 ambiguity before technical design is evaluated.

- FR007 remains the canonical successful fresh-install completion requirement.
- Corrected FR079 now owns readiness/recovery semantics without permitting successful fresh-install completion while mandatory setup remains.
- SD19 remains the minimum technical realization: one installer-owned setup flow, one canonical configuration/provider owner, no second readiness state, and post-install/update recovery preserved in the existing Settings/daemon path.
- No new P4/P5/P6 decision is required by `C16-F04`; the previous SD19 direction is retained because it now traces to non-contradictory P3 authority rather than because implementation/P4/P6 happened to converge on it.

### G-F12 DESIGN closure decision — corrected after rendered-evidence revalidation

The previous DESIGN closure incorrectly treated the Workbench screen realization as reusable. C19-F02/C20-F05 disprove that assumption without changing R2 product semantics. This corrected DESIGN draws a hard boundary between **retained UI capability** and **discarded screen implementation**:

- canonical lifecycle/domain/query/daemon/persistence/provider owners remain unchanged unless another existing SD explicitly changes them;
- the canonical Order Workbench primitive vocabulary and its approved Astryx/leaf-content foundations are retained as implementation capability; they are not redesign targets for this campaign unless a primitive-specific defect is independently proven upstream;
- the existing application/screen implementations are **not** preserved, migrated, refactored or used as layout/information-design templates;
- before any screen replacement, the design-bearing Workbench composition foundation is destructively reconstructed from current P3/P4 authority and reviewed new-design references; every later replacement screen **consumes** the exhaustive 37-surface information contract embedded below in this `solution-design.md` rather than deriving information placement during implementation, and composes that closed contract only from the accepted reconstructed foundation plus the positively retained atomic adapters;
- the old screen file is removed before replacement authorship begins; any valid underlying query/domain behavior is consumed again from its canonical owner rather than copied as screen code;
- old screen JSX/DOM structure, field grouping, table columns, cards/panels, action placement, responsive branches, feature-local CSS and visual hierarchy are explicitly non-authoritative and may not be carried forward for compatibility;
- shared stylesheets are reconstructed with the Workbench foundation and then mutated only for the exact screen-specific selector sets owned by IA28-IA34; no current structural selector, theme realization or feature-local layout rule is a preservation target merely because it exists today;
- exact-candidate rendered acceptance supplements semantic/browser certification and is required before final closeout;
- existing canonical P4-P6 owners remain singular. No LOCAL technical authority, DTO/model/service layer, alternate workflow state, alternate task/proposal model or new runtime dependency is introduced;
- open technical questions: NONE;
- material technical UNPROVEN: 0 after SD21-SD30 below are included as binding DESIGN;
- PLAN must establish the preservation/purge boundary first, then destructively replace each screen family, then run permanent certification/SD30. An implementation phase that edits the old screen into the new one is nonconforming.

Execution packaging is constrained by `GW-DOC-CANONICAL-CONTRACTS-V2`: ExecutionTask dependencies control eligibility only, every Run starts from `Approval.baselineCommit`, and successful dependency candidate bytes are not promoted into a later task baseline. The cumulative SD01-SD30 0.6.0 candidate is therefore one signed execution task. IA01-IA34 are ordered implementation/proof phases inside that task; later phases consume bytes created earlier in the same task/Run and never rely on a separately completed task candidate.

#### Retained UI capability boundary

The following are retained and may be reused:

- all canonical `ui/src/primitives/*.tsx` Workbench primitives under P4 §8.12-§8.14;
- `ui/src/http.ts`, `ui/src/query-keys.ts`, `ui/src/workbench-presentation.ts`, `ui/src/markdown-source-formatting.ts`, `ui/src/theme.ts` and `ui/src/main.tsx` insofar as they retain their current non-screen responsibilities;
- `ui/src/MarkdownEditor.tsx` and `ui/src/MarkdownSourceEditor.tsx` as approved specialized content/editor mechanisms under P4 §8.19, not as outer screen grammar;
- `ui/src/theme.css` and `ui/src/styles.css` only as primitive/theme/global foundations after obsolete screen-specific selectors and compatibility presentation rules are purged;
- `src/core/lifecycle.ts` lifecycle/current-attention/material/recovery/rail decisions;
- WorkItem/ArtifactRef/Run/RunEvent/Approval/ExecutionTask canonical contracts and persistence;
- daemon/API/TanStack Query producer→carrier→consumer ownership;
- WorkItem schema/kind information obligations and stage-specific document semantics;
- proposal/adoption, sign-off, execution and provider admission/recovery behavior;
- exact source/Markdown/Git ownership and stale-write/freshness rules.

Retained capability is not permission to preserve a screen. A retained helper may be consumed only for its existing non-screen responsibility.

#### Destructive screen-replacement boundary

The following existing screen/composition modules are replacement targets, not migration targets:

- `ui/src/app.tsx`;
- `ui/src/WorkItemQueue.tsx`;
- `ui/src/CreateWorkItem.tsx`;
- `ui/src/WorkItemWorkspace.tsx`;
- `ui/src/WorkItemIdentityRow.tsx`;
- `ui/src/WorkflowRail.tsx`;
- `ui/src/WorkflowStepFrame.tsx`;
- `ui/src/DocumentWorkspace.tsx`;
- `ui/src/ActivityWorkspace.tsx`;
- `ui/src/ActivityComposer.tsx`;
- `ui/src/PreSignoffStageWorkspace.tsx`;
- `ui/src/WorkflowMaterialSelector.tsx`;
- `ui/src/ProposalReview.tsx`;
- `ui/src/RunEventTimeline.tsx`;
- `ui/src/ReadinessWorkspace.tsx`;
- `ui/src/SignoffReview.tsx`;
- `ui/src/ExecutionWorkspace.tsx`;
- `ui/src/TerminalResult.tsx`;
- `ui/src/EvidenceViewer.tsx`;
- `ui/src/WorkItemContext.tsx`;
- `ui/src/SettingsWorkspace.tsx`;
- `ui/src/OpenCodeAccountControl.tsx`;
- `ui/src/OpenCodeAccountSettings.tsx`.

For each owned reconstruction phase, the pre-reconstruction blob of every target above is defect evidence only. Replacement implementation must not copy or incrementally edit its screen composition. The phase must first delete its owned old screen files and assigned legacy selectors before replacement authorship, record the exact deleted path/selector set as bounded in-task observational evidence, and only then author the replacement from the already-closed exhaustive 37-surface information contract in this `solution-design.md`. This purge checkpoint is a procedural boundary inside the one signed task, not a Git commit, candidate boundary or validation result. A datum/action missing from that contract is a DESIGN defect and returns upstream; implementation may not classify it locally.

If non-visual logic exists only inside a discarded screen file, that does not create reuse authority. The implementation must either consume the already-canonical underlying owner directly or return upstream for an architecture-preserving extraction decision. Copying screen-local hooks/state/branching merely because they existed is prohibited.

#### Screen-information summary and exhaustive surface contract

The family matrix below is a summary of the design direction. The exhaustive datum/action-level DESIGN contract is embedded below in this `solution-design.md` and covers all 37 governed `SURF-*` surfaces. This section is package-local DESIGN, not a permanent P3 policy owner or runtime shape. It binds semantic intent, P3 class, default visibility, ordinary placement owner, authorized disclosure, promotion exception, responsive invariance and negative ordinary-rendering requirements for every admitted operator-visible datum/action.

Implementation consumes that contract. It may not infer another placement from available fields, historical UI, current tests or the SVG pack, and PLAN may not instruct IA27-IA34 to derive a fresh screen schema.

| Screen/service family | Primary/default-visible | Supporting / operational detail | Technical / diagnostic default-hidden | Authorized disclosure / promotion rule | Required interaction class | Legacy-screen compatibility |
|---|---|---|---|---|---|---|
| Queue / application shell | actionable WorkItems; New work item; human lifecycle/status meaning; human-readable blocker/recovery | project/search/archive filtering; concerns/useful scan context; active saved OpenCode account quick-access | raw source/readiness diagnostic codes/paths/parser details; WorkItem ids/source internals | blocking condition promotes only human meaning + valid inspect/recovery action; raw evidence remains technical/evidence-owned | Operational scan | NONE — old table/banner/application-toolbar composition is discarded |
| Create/remediation | Project identity, work kind, human title, Concerns, Create; linked parent meaning/title + fixed project | non-editable derived-field explanation | repository documentation root, parent WorkItem id, schema/version/internal metadata | no raw technical value is ordinary Create content; exact values surface only if the active input requires choosing/entering them | Task panel → Form/configuration | NONE — old modal/form grouping is discarded |
| WorkItem shell | WorkItem title/meaning, current lifecycle step, current attention, true WorkItem-level utilities | reached/historical navigation; explicit Context entry | hashes/paths/ids/project-schema dumps/Run-task-provider identity | technical values only after explicit Context/Technical details; never promoted into identity row | Workbench shell + owning material class | NONE — old shell/frame structure is discarded |
| Work request/document | governed intent/document content and current document action | selector/upstream material, maturity/currentness, compact Git state | exact path/hash/schema/source internals | local Technical details; exact changed paths become primary only inside the explicit documentation-Git confirmation | Document | NONE |
| Research/Requirements/Design/Plan | current Dialogue, governed Document or Proposal Review according to attention precedence | attempts/history/upstream material, bounded agent activity, evidence/resource links | provider/session/baseline/context identity, raw Run/event tags, repository paths where semantic labels suffice | Supporting material/history for operator material; Technical details for exact mechanics; Evidence only after explicit open; provider failure promotes human blocker/recovery only | Document / Dialogue / Review using one productive-stage grammar | NONE |
| Readiness | typed R3 verdict/current readiness, findings/defective owner, exact return action | package material needed for judgment, evidence, attempt history | artifact/package role/path/hash and technical identity | Technical details only; legitimate REQUIRED_INPUT may temporarily own the task without promoting unrelated technical identity | Review | NONE |
| Approval | readiness/currentness, signed task meaning/scope/gates, approver identity + sign-off | governed documents/task collection/detail needed for judgment | package hash/baseline/commit identity, Approval/ExecutionTask ids | Technical details / Task technical details only; stale/currentness promotes meaning, not raw freshness identity | Review | NONE |
| Implementation | current task objective/state/action/blocker, current attempt meaning, current/recorded validation boundary | task master/history, chronology, evidence/resources | task/approval/plan/Run ids, baseline/context/provider session, raw execution diagnostics | Technical details for exact identity; Evidence after explicit resource open; blocker promotes human meaning/action only | Operational master/detail | NONE |
| Complete | canonical final governed outcome + valid next action | applicable result evidence/resources; linked-remediation action | internal event tags/role codes, ids/hashes/raw result identity | ordinary resource labels are human-facing; exact bytes/identity only after Evidence open | Terminal result | NONE |
| Evidence/Context | exact evidence identity+bytes when explicitly selected; selected-view technical orientation when Context explicitly opened | related resource metadata | raw technical values are allowed because these surfaces explicitly own inspection | neither auto-opens; neither may become sole owner of current blocker/action; close/return restores primary hierarchy | Evidence / Compact context | NONE |
| Settings/account/configuration | readiness, configuration meaning/action; exact value only while actively selecting/entering it | repository/account/model inventory + ordinary status | exact roots/endpoints/account ids/provider mechanics outside active field; raw enum codes | active Add/Move/model/account fields may show exact configured value; otherwise Technical details | Settings + Form/configuration | NONE |

#### Exhaustive 37-surface information contract

The following contract is the **datum/action-level package DESIGN** for every governed `SURF-*` row. It is intentionally embedded in the canonical `solution-design.md` lifecycle artifact so its exact bytes participate in DESIGN conformance and downstream sign-off. It does not create a second P3 policy owner or a runtime schema.

##### Binding interpretation

For every datum or action that may appear on a governed surface, implementation must be able to point to exactly one row in this artifact or to an explicitly referenced governed-document body whose internal content is rendered as canonical Markdown.

No implementation phase may:

- derive a new information class;
- decide that an exact id/path/hash/session/event field is useful enough to expose ordinarily;
- move a datum to another disclosure owner because the current component makes that convenient;
- promote raw technical or diagnostic representation when its underlying condition owns current attention;
- create a second Context, diagnostics rail, metadata stack or feature-local disclosure system;
- change classification because of viewport, theme, loading density, collection count or historical/current selection;
- treat current JSX/CSS, current tests or a derived SVG as a preservation/placement target.

If an implementation owner encounters an operator-visible datum/action not classified here, or cannot realize a row without changing its meaning, it **returns to DESIGN**. It does not complete the classification locally.

##### Closed information classes

| Class | Meaning | Default visibility |
|---|---|---|
| **Primary** | required to understand or perform the current operator task | visible in the owning primary interaction and allowed to dominate |
| **Supporting** | useful to judge/orient the current task but not itself the task | subordinate, selectable or secondary |
| **Operational** | low-frequency operator-facing history/resource/status detail | subordinate and collapsed/selected when persistent display would compete |
| **Technical** | exact implementation/audit identity: ids, hashes, commits, raw paths where a semantic label suffices, provider/session/schema/internal-role identity | hidden by default behind the authorized local **Technical details** or explicit **Context** |
| **Diagnostic** | raw diagnostic codes, raw event tags/payloads, parser/provider mechanics and equivalent implementation-facing failure evidence | absent from ordinary product presentation; explicit technical/Evidence inspection only |

A Technical/Diagnostic cause may own current attention, but only its **human-readable meaning, consequence and valid action** are promoted. Raw code/path/hash/session/payload remains in its technical/evidence owner.

##### Closed disclosure owners

Only these progressive-disclosure owners are valid:

1. **Supporting material/history** — operator-facing workflow material/history selection.
2. **Context** — explicitly opened compact WorkItem/material orientation, including appropriate exact identity.
3. **Technical details** — local exact mechanics/identity associated with the current surface.
4. **Evidence** — explicitly selected exact evidence identity and bytes.
5. **Safety/confirmation** — exact target/scope only when required to make the pending decision safely and knowingly.

Primary information may never exist only behind disclosure. Technical/Diagnostic information may never become persistently visible because of responsive recomposition or a current failure.

##### Contract fields

Every detailed row below binds:

- **datum/action** — semantic operator concept, not a UI property name;
- **source** — canonical typed fact, pure derivation or governed document;
- **intent** — why the operator needs it;
- **class** — one of the five closed classes;
- **default placement** — its ordinary UI owner;
- **disclosure/promotion** — the only permitted subordinate/technical owner and any promotion exception;
- **negative rule** — what implementation must not render ordinarily.

Local query loading/error/pending states inherit the owning datum/action's semantic surface. They use `WorkbenchState`/`WorkbenchNotice` and never expose raw transport/provider internals.

##### Complete surface registry and interaction class

| SURF | Surface | Required interaction class | PLAN owner |
|---|---|---|---|
| `SURF-APP-001` | application shell / toolbar / global attention | application shell + utilities | IA28 |
| `SURF-QUEUE-001` | WorkItem queue | Operational scan | IA28 |
| `SURF-CREATE-001` | Create / linked remediation | Task panel → Form/configuration | IA28 |
| `SURF-SET-001` | Settings frame/readiness/navigation | Settings | IA34 |
| `SURF-SET-REPO-001` | repository/reference-root settings | Settings + Operational scan | IA34 |
| `SURF-SET-REPO-ADD-001` | Add repository | Form/configuration | IA34 |
| `SURF-SET-REPO-MOVE-001` | Move WorkItem documents | Form/configuration | IA34 |
| `SURF-SET-OC-001` | OpenCode accounts | Settings + Operational scan | IA34 |
| `SURF-SET-OC-RENAME-001` | Rename OpenCode account | Form/configuration | IA34 |
| `SURF-SET-OC-ADD-001` | Add OpenCode account | Form/configuration | IA34 |
| `SURF-SET-OC-LOGIN-001` | OpenCode sign-in | Form/configuration / current task | IA34 |
| `SURF-SET-MODEL-001` | model/runtime settings | Settings + Form/configuration | IA34 |
| `SURF-WI-001` | selected WorkItem shell / identity / rail / current attention | Workbench shell + owning material | IA27 |
| `SURF-WI-CONTEXT-001` | explicit technical Context | Compact context | IA33 |
| `SURF-STEP-WR-001` | Work request | Document | IA29 |
| `SURF-STEP-R1-001` | Research | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-R2-001` | Requirements | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-DESIGN-001` | Solution design | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-PLAN-001` | Implementation plan | Dialogue / Document / Review by current attention | IA30 |
| `SURF-STEP-R3-001` | Readiness review | Review | IA31 |
| `SURF-STEP-APPROVAL-001` | Approval | Review | IA31 |
| `SURF-STEP-EXEC-001` | Implementation | Operational master/detail | IA32 |
| `SURF-STEP-COMPLETE-001` | Complete | Terminal result | IA33 |
| `SURF-MAT-SOURCE-001` | Work request source document/editor | Document | IA29 |
| `SURF-MAT-DOC-001` | editable lifecycle document | Document | IA29 |
| `SURF-MAT-DOC-RO-001` | read-only lifecycle/supporting document | Document | IA29 |
| `SURF-MAT-ACTIVITY-001` | STAGE dialogue/activity | Dialogue | IA30 |
| `SURF-MAT-PROPOSAL-001` | proposal review | Review | IA30 |
| `SURF-MAT-EVIDENCE-001` | exact evidence viewer | Evidence | IA33 |
| `SURF-MAT-APPROVAL-TASK-001` | Approval task detail | Review detail | IA31 |
| `SURF-MAT-EXEC-TASK-001` | execution task/attempt detail | Operational detail | IA32 |
| `SURF-CONF-DIRTY-DEST-001` | dirty destination confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-DIRTY-MATERIAL-001` | dirty material confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-ARCHIVE-001` | archive/restore confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-DOC-GIT-001` | documentation-Git confirmation | Safety/confirmation | IA29 |
| `SURF-CONF-REPO-DISCONNECT-001` | repository disconnect confirmation | Safety/confirmation | IA34 |
| `SURF-CONF-OC-REMOVE-001` | OpenCode-account removal confirmation | Safety/confirmation | IA34 |

The registry cardinality is exactly **37**. No implementation phase may add a new rendered surface grammar without DESIGN authority.

---

##### Detailed SURF contracts

##### SURF-APP-001 — application shell / global attention

| Datum/action | Canonical source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| Product identity + current destination meaning | application destination state | orient the operator globally | Primary | application toolbar | none | do not expose route/internal state names |
| Queue search utility | browser-local search | find work while Queue is current | Supporting | toolbar utility on Queue only | none | must not displace WorkItem identity/current action |
| New WorkItem entry | local create action | begin governed authoring | Primary | toolbar/action region | opens `SURF-CREATE-001` | not shown as workflow mutation on selected WorkItem |
| Installation readiness human meaning + Settings recovery destination | `InstallationReadiness` | make setup blocker actionable | Primary | global notice/current attention only while blocking | raw blocker mechanics stay Technical; promote meaning + action only | no raw readiness enum/transport detail |
| Source diagnostic human meaning + inspect/recovery action | `WorkItemSourceDiagnostic[]` | explain why productive work is blocked | Primary | global notice/current attention only while relevant/blocking | code/path/parser detail only Technical/Evidence | ordinary notice must not print raw diagnostic code/path |
| Active saved OpenCode account label/readiness utility | `OpenCodeAccountState` | global provider-account orientation and Settings quick access | Supporting | toolbar utility | account id/provider mechanics stay Technical/Settings | no account-management detail in toolbar |
| System/Light/Dark choice | local theme preference | appearance selection | Supporting | toolbar utility | none | theme never changes semantic hierarchy |
| dirty-navigation decision | local dirty/pending destination | protect unsaved work | Primary | `SURF-CONF-DIRTY-DEST-001` | exact destination meaning only as needed | no silent discard |

##### SURF-QUEUE-001 — WorkItem queue

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| WorkItem title | `WorkItem.title` | scan/select work | Primary | row identity | none | no id substitute |
| work kind | schema catalog → kind | understand task kind | Supporting | row metadata | schema id Technical | do not show schema id as ordinary kind |
| project identity | `WorkItem.projectId` | disambiguate work | Supporting | row metadata/filter | exact repo root Technical elsewhere | no repository path |
| human lifecycle stage/status meaning | `WorkItem.stage/status` + presentation policy | understand current state | Primary | row status | internal enum value not required as raw text | no raw enum/internal code |
| Concerns | `WorkItem.concernIds` mapped to governed concern identity | useful task context/filtering | Supporting | subordinate row metadata | internal representation Technical if different from human label | no UUID-like/internal-only representation |
| archived state | `WorkItem.archived` | distinguish historical work | Supporting | row/state treatment | archive/restore decision uses confirmation | no second archive navigation grammar |
| project/search/archive filters | local filter state over canonical list | control scan set | Supporting | Queue controls | none | inclusion of archived rows cannot replace project/search semantics |
| open WorkItem | row navigation | inspect selected work | Primary | row | enters `SURF-WI-001` | no lifecycle mutation |
| source/readiness blocker associated with queue | canonical diagnostics/readiness | explain inability to proceed | Primary | human-readable notice | raw code/path in Technical/Evidence | no diagnostic dump in queue |

##### SURF-CREATE-001 — Create / linked remediation

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| Project identity | project manifest | choose governing project | Primary | form field; fixed semantic label for linked remediation | repository root remains Technical | no persistent repo root |
| work kind | schema catalog | choose Change/Defect/Investigation/Audit; linked remediation limited to Change/Defect | Supporting | form field | schema id/version Technical | no schema id as primary label |
| title | local authoring state | human task identity | Primary | form field | none | no generated technical identity substitute |
| Concerns | project concern catalog | classify governed concern set | Primary | form control | underlying ids not shown when human names exist | no raw ids as ordinary labels |
| linked parent meaning/title | completed parent WorkItem | explain remediation lineage | Supporting | fixed linked-remediation context | parent WorkItem id Technical | no persistent raw parent id |
| derived/fixed-field explanation | governing lineage/project rules | explain non-editable choices | Supporting | form help | none | must not compete with form task |
| Create | validated form state | create one governed source-backed WorkItem | Primary | action region; visually primary command | failure shown as owning notice | no duplicate create command |
| repository documentation root / schema/version/internal metadata | manifest/catalog/internal state | exact implementation identity | Technical | Technical details only if legitimate inspection is needed | never promoted merely for creation | must be absent from ordinary form |

##### SURF-SET-001 — Settings frame/readiness/navigation

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| installation readiness meaning | `InstallationReadiness` | show whether installation is productive and where action is required | Primary | Settings summary/notice | blocker mechanics Technical; human blocker action may dominate | no raw blocker code |
| Settings sections | local destination | navigate repositories/accounts/model configuration | Supporting | `WorkbenchSettingsLayout` | none | no second app sidebar grammar |
| blocker destination/action | blocker→section policy | take operator to owning configuration task | Primary | readiness region | none | no dead-end blocker |
| exact config hashes/internal transport state | config/query mechanics | optimistic/concurrency identity | Technical | Technical details only | never ordinary readiness content | no raw SHA/status dump |

##### SURF-SET-REPO-001 — repositories/reference roots

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| connected project/repository semantic identity | `ConnectedRepositoryState.projectId` + repository record | identify configured repository | Primary | repository row | exact filesystem root Technical except active task | do not make raw root the only row identity |
| readiness/attention meaning | `status/attention[]` mapped to product language | show required repository action | Supporting | row status/notice | raw codes/details Technical | no raw enum |
| WorkItem-document configuration meaning | repository config | show where governed documents live | Supporting | row/config summary | exact root Technical until Move task | no persistent full path where semantic label suffices |
| reference-root configuration | `config.referenceRoots` | configure productive context sources | Primary | bounded configuration region | exact values are primary because this is the active configuration task | not repeated as general metadata |
| Add repository | local task action | connect repository | Primary | task entry | opens `SURF-SET-REPO-ADD-001` | no inline second form grammar |
| Move documents | repository action | relocate WorkItem document root safely | Supporting | task entry | opens `SURF-SET-REPO-MOVE-001` | no silent move |
| Disconnect | repository action | remove connected repository | Supporting | row action with destructive priority | `SURF-CONF-REPO-DISCONNECT-001` | no immediate destructive mutation |
| repositoryRoot/workItemsRoot/manifestSha256/config sha | settings/config records | exact identity/concurrency mechanics | Technical | Technical details | exact root becomes Primary only when the active configuration input/confirmation requires it | no ordinary metadata wall |

##### SURF-SET-REPO-ADD-001 — Add repository

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| Git repository root input | local form | specify repository to connect | Primary | form field | exact path is task-required and therefore legitimately Primary here |
| project/readiness result or validation failure | repository admission result | explain whether connection can proceed | Primary | form notice | show human meaning; raw parser/internal codes Technical |
| Connect | validated form | perform connection | Primary | action region; visually primary command | expected config identity remains hidden mechanics |
| Cancel | local | abandon bounded task | Supporting | action region; secondary command | no mutation |

##### SURF-SET-REPO-MOVE-001 — Move WorkItem documents

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| target repository/project semantic identity | selected repository | identify affected configuration | Primary | task header | exact current root may be shown because path-specific mutation is being configured |
| current/new document root | repository config + local input | define exact migration | Primary | form | exact paths are decision-required |
| migration consequence/preservation meaning | canonical migration contract | explain effect | Primary | task body | no implementation-internal transport detail |
| Move | migration mutation | commit the configured migration | Primary | action region; visually primary command | failure shown in owning task |
| Cancel | local | abandon the bounded migration task | Supporting | action region; secondary command | no mutation |

##### SURF-SET-OC-001 — saved OpenCode accounts

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| saved account label | account state | identify account | Primary | account row | exact account id Technical |
| active/authentication human state | discriminated account status mapped to product language | understand readiness | Supporting | row status; promote human meaning/action to Primary only when it blocks the current account task | raw provider/status internals Technical |
| needs-auth human instruction/action | account status | restore productive account | Primary | row/notice | raw provider mechanics remain Technical |
| mutation blocker human meaning | mutation blockers | explain why account mutation is unsafe | Primary | Settings notice | raw Run/provider identity Technical |
| Add account | account command | create a saved account | Primary | section action; visually primary when no bounded account task is open | opens Add/login task |
| Activate/Rename/Remove | account commands | manage an existing saved account | Supporting | row actions; Remove uses destructive priority | Rename bounded task; Remove confirmation |
| provider/account ids/transport mechanics | account/provider records | exact integration identity | Technical | Technical details | absent ordinarily |

##### SURF-SET-OC-RENAME-001 — Rename OpenCode account

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| current human label | selected account | identify target | Primary | form context | account id Technical |
| new label | local form validated by canonical label schema | set human-facing identity | Primary | form field | validation is product-facing, raw schema mechanics are not |
| Save | rename mutation | commit the new account label | Primary | action region; visually primary command | failure remains in task |
| Cancel | local | abandon rename | Supporting | action region; secondary command | no mutation |

##### SURF-SET-OC-ADD-001 — Add OpenCode account

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| new account label | local form | establish human saved-account identity | Primary | form | no account id yet |
| sign-in start meaning | account login command | begin governed login | Primary | action region; visually primary command | provider mechanics Technical |
| failure/retry | login-start result | recover current task | Primary | notice | raw process/provider evidence Technical |
| Cancel | local | abandon task | Supporting | action region; secondary command | no mutation |

##### SURF-SET-OC-LOGIN-001 — OpenCode sign-in

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| authorization instructions | `OpenCodeAccountLoginAttempt.instructions` | tell operator what to do | Primary | task body | none |
| authorization URL | login attempt | perform explicit external authorization | Primary | task action/link | exact protocol/provider mechanics Technical |
| human status/result message | attempt status/message mapped to product meaning | show progress/terminal state | Primary | task status | raw enum Technical |
| expiry when useful to task | `expiresAt` | time-bound action awareness | Supporting | task detail | exact internal attempt id Technical |
| Done / retry as admitted | attempt state | complete or recover the current login task | Primary | action region; current admitted command | no hidden competing action |
| Cancel | local/login command as admitted | abandon the login task | Supporting | action region; secondary command when admitted | no competing current command |
| attempt id/provider transport details | attempt record | exact integration identity | Technical | Technical details | absent ordinarily |

##### SURF-SET-MODEL-001 — model/runtime settings

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| configured model human/provider selection | config + available models | choose productive model | Primary | form/configuration | exact provider/model value is task-required and may be Primary while selecting |
| availability/readiness human state | model query/config comparison | explain unusable or unavailable selection | Primary | notice/status | raw fetch/provider mechanics Technical |
| Save/update | configuration mutation | commit model selection | Primary | action region; visually primary command | config SHA is hidden optimistic precondition |
| provider ids/model ids outside active selection mechanics | model records | exact integration identity | Technical | Technical details | do not create provider-debug panel |

##### SURF-WI-001 — selected WorkItem shell / rail / current attention

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion | Negative rule |
|---|---|---|---|---|---|---|
| WorkItem title | `WorkItem.title` | stable human identity | Primary | identity row | title edit is local WorkItem utility | no WorkItem id |
| work kind / concise status where needed | schema catalog + WorkItem state | orient operator | Supporting | identity/status | schema id Technical | no metadata dump |
| current lifecycle step | `deriveWorkflowRail` / current stage | orientation | Primary | rail/current marker | none | no raw enum |
| reached/historical/unreached navigation | `deriveReachedStages/deriveWorkflowRail` | inspect legitimate history | Supporting | rail | none | history selection cannot steal current attention |
| current attention human meaning | `deriveCurrentAttention` + recovery/currentness/coherence | answer “what needs action now?” | Primary | stable attention region | technical cause promotes meaning/consequence/action only | no raw diagnostic/session/path |
| current valid action | canonical attention/recovery owner | operate current workflow | Primary | attention action region; exactly one visually primary mutation owner | none | no generic Start beside higher-priority action |
| Context open/close | local state | inspect technical orientation | Supporting | identity/utility region | opens `SURF-WI-CONTEXT-001`; never auto-open | Context not sole blocker/action owner |
| archive/restore | WorkItem utility | manage queue visibility | Supporting | identity/utility region | confirmation required | no immediate destructive mutation |
| title edit | title mutation contract | maintain human identity | Supporting | identity row | mutation error stays with title | no technical metadata edit surface |
| hashes, paths, ids, project/schema dumps, Run/task/provider identity | canonical records | exact mechanics | Technical | Context/Technical details only | never promoted to identity row |

##### SURF-WI-CONTEXT-001 — explicit technical Context

Context is intentionally an explicit inspection surface. Exact technical values may be visible here because the operator requested them.

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| selected workflow step/material label | current browser selection + presentation policy | orient technical inspection | Primary | Context header | human label first |
| selected document path/SHA | selected document | exact document identity | Technical | metadata | allowed only because Context is open |
| selected Run id/role/status/attempt/start time | canonical Run | exact attempt identity | Technical | metadata | no provider raw payload |
| source issue count | source diagnostics | corroborating orientation | Supporting | metadata | blocker/action remains on primary surface |
| WorkItem stage/status/outcome/project/kind/schema/concerns | WorkItem + catalog | compact exact orientation | Technical | metadata | no duplicate policy/current-action logic |
| Close Context | local | restore primary width | Primary | predictable close/toggle | Context never auto-opens; close restores focus/primary hierarchy |

##### SURF-STEP-WR-001 — Work request step

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| Work request purpose/currentness | source + WorkItem stage | orient source-owned task | Primary | attention/step header | human meaning only |
| canonical source document | `WorkItemSourceSnapshot` | author/inspect originating intent | Primary | `SURF-MAT-SOURCE-001` | document internal content follows schema/template |
| source blocker human meaning + recovery | source diagnostics/recovery | unblock Research | Primary | attention/notice | raw code/path Technical |
| Start Research | canonical eligibility/current attention | begin R1 | Primary | attention action region | hidden/suppressed when another owner blocks |
| supporting history/context | legitimate source/Git state | orient task | Supporting | selector/document support | exact identity Technical |

##### SURF-STEP-R1-001 — Research

Research document semantics are work-kind specific and remain owned by the selected R1 schema/template plus R2 work-kind × step contract.

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| current Research attention | current stage interaction/proposal/blocker/currentness | identify the current research task | Primary | attention region | required input/proposal/blocker/processing precedence applies |
| current Dialogue | current STAGE Run | converse/answer/continue when interaction owns attention | Primary | `SURF-MAT-ACTIVITY-001` | conversation never replaced by event dump |
| current governed Research document | R1 ArtifactRef + bytes | inspect governed factual result | Primary | `SURF-MAT-DOC-001` | repository path/hash Technical |
| proposal review | proposal state | review a proposed governed change | Primary | `SURF-MAT-PROPOSAL-001` | free-form continuation suppressed |
| upstream source/document/evidence links | artifacts/source/evidence | inspect supporting authority/material | Supporting | `WorkbenchSelector` / supporting material | cannot change primary canvas width |
| attempts/history/activity | Runs/RunEvents | inspect stage chronology | Operational | history/activity selector | subordinate when persistent display would compete |
| provider/session/baseline/context/Run identity | Run | exact execution/provider mechanics | Technical | Technical details / Context | provider failure promotes only human meaning/action |
| raw event tags/payloads/parser-provider diagnostics | RunEvents/diagnostics | implementation-facing failure evidence | Diagnostic | Timeline Technical details / Evidence | never ordinary productive-stage content |
| Start/Retry/Resume/Reconcile/Cancel/Input/Adopt/Reject | canonical attention/interaction/recovery | operate Research | Primary | owning material | never competing equal-weight mutations |

##### SURF-STEP-R2-001 — Requirements

Same productive-stage grammar as Research, with the governed Requirements document/schema as the primary document when ordinary current work owns attention.

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| current Requirements attention/action | lifecycle/current-attention derivation | identify current functional-design task | Primary | attention region; one owner |
| Dialogue when current | STAGE Run/events | resolve missing functional decision/input | Primary | Activity surface |
| governed Requirements Markdown | R2 ArtifactRef/content | inspect required behavior, acceptance, scope/exclusions | Primary | document surface |
| supporting Research/source/evidence | artifacts/source/evidence | judge current functional-design basis | Supporting | selector/supporting material |
| attempt/history activity | Runs/RunEvents | inspect stage chronology | Operational | history/activity selector |
| provider/session/path/hash identity | exact records | audit exact mechanics | Technical | Technical details/Context |
| raw event/payload diagnostics | RunEvents/diagnostics | debug implementation failure | Diagnostic | Timeline Technical details/Evidence only |
| proposal disposition | proposal events | adopt/reject governed authority proposal | Primary | Proposal Review; suppress continuation |

##### SURF-STEP-DESIGN-001 — Solution design

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| current Solution-design attention/action | lifecycle/current attention | identify current technical-design task | Primary | attention region |
| Dialogue when current | STAGE Run/events | resolve technical design input | Primary | Activity |
| governed DESIGN Markdown | DESIGN ArtifactRef/content | inspect technical realization | Primary | document |
| supporting R2/R1/source/evidence | artifacts/source/evidence | trace design basis | Supporting | selector/supporting material |
| attempt/history activity | Runs/RunEvents | inspect stage chronology | Operational | history/activity selector |
| provider/session/path/hash identity | exact records | audit exact mechanics | Technical | Technical details/Context |
| raw event/payload/provider diagnostics | RunEvents/diagnostics | debug implementation failure | Diagnostic | Timeline Technical details/Evidence |
| proposal disposition | proposal events | govern P4-P6 change | Primary | Proposal Review |

##### SURF-STEP-PLAN-001 — Implementation plan

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| current Plan attention/action | lifecycle/current attention | identify current planning task | Primary | attention region |
| Dialogue when current | STAGE Run/events | resolve plan input | Primary | Activity |
| governed PLAN Markdown | PLAN ArtifactRef/content | inspect executable signed-task plan | Primary | document |
| task/change-surface summaries derived from PLAN | parsed signed-task block | support inspection | Supporting | subordinate selector/detail; never second plan authority |
| supporting DESIGN/R2/R1/source/evidence | artifacts/source/evidence | trace plan basis | Supporting | selector/supporting material |
| attempt/history activity | Runs/RunEvents | inspect stage chronology | Operational | history/activity selector |
| provider/session/path/hash identity | exact records | audit exact mechanics | Technical | Technical details/Context |
| raw event/payload/provider diagnostics | RunEvents/diagnostics | debug implementation failure | Diagnostic | Timeline Technical details/Evidence |
| Start Readiness / retry/recovery as canonically admitted | lifecycle/current attention | progress or recover | Primary | attention action region; visually primary current command |

##### SURF-STEP-R3-001 — Readiness review

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| typed R3 verdict/current readiness | R3 `STAGE_COMPLETED.completion.outcome` + currentness | answer whether package is ready | Primary | Review header/verdict | never replaced by generic material maturity |
| findings / defective owner / exact return action | R3 governed content + lifecycle return | explain why not ready and where ownership returns | Primary | Review body/action | raw artifact identity remains Technical |
| governed R3 material | R3 ArtifactRef/content | substantive readiness review | Primary | Review body/document | exact path/hash Technical |
| package documents needed for judgment | current package artifacts | inspect basis | Supporting | selector/material list | role may be human label; path/hash hidden |
| package evidence links | evidence | inspect readiness basis | Supporting | selector/resource list | exact evidence identity in Evidence |
| attempt history | R3 Runs | inspect readiness chronology | Operational | selector/history | exact Run/session identity Technical |
| legitimate REQUIRED_INPUT | current R3 Run interaction | answer exact readiness question | Primary | Dialogue/attention | unrelated technical identity not promoted |
| artifact/package role/path/hash/technical identity | package records | exact audit identity | Technical | Technical details | hidden before explicit disclosure |
| Return/Retry/Input actions | canonical attention/recovery | progress/recover | Primary | Review/Dialogue | one owner only |

##### SURF-STEP-APPROVAL-001 — Approval

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| readiness/currentness | exact sign-off package + WorkItem state | determine whether approval is legitimate now | Primary | Review header | stale state promotes human meaning/owner, not hashes |
| package/task meaning | SignoffPackage task block | understand what will be authorized | Primary | Review body/task collection | exact package identity Technical |
| governed package documents | package ArtifactRefs | inspect authority basis | Supporting | selector/list | paths/hashes hidden |
| approver human identity | local input subject to canonical ingress validation | identify explicit human sign-off | Primary | decision region | internal approval id Technical |
| Sign off exact package | current package + approvedBy | authorize exact package | Primary | decision region; sole visually primary mutation | absent/disabled when package not current |
| historical approval/task state | ExecutionTasks/history | inspect prior approval | Operational | review history | exact approval/task ids Technical |
| package hash/source SHA/baseline commit/commit identity | SignoffPackage | exact audit identity | Technical | Technical details | absent by default |
| task/approval ids | package/task records | exact identity | Technical | Task technical details | absent from ordinary task meaning |
| stale/error/loading state | package query/currentness | explain inability to sign | Primary | Review notice | raw transport error not ordinary copy |

##### SURF-MAT-APPROVAL-TASK-001 — Approval task detail

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| task objective/state meaning | SignedTaskDefinition / ExecutionTask | understand authorized work | Primary | task detail | exact task id Technical unless human task label is meaningful |
| scope/exclusions | signed task | understand hard semantic/repository boundary | Primary | task detail | exact paths are task-required here and may be visible |
| dependencies | signed task | understand execution eligibility | Supporting | task detail | no graph UI required |
| acceptance/gates/authority/concerns | signed task | judge verification and traceability | Primary | task detail | internal ids that have no operator meaning belong Technical |
| changeSurface forecast | signed task | understand expected physical change | Supporting | task detail | it is forecast, not hard scope |
| approval/task/internal ids | task records | exact audit identity | Technical | Task technical details | hidden by default |
| Back/select another task | local selection | continue package review | Supporting | task selector | no mutation |

##### SURF-STEP-EXEC-001 — Implementation master/detail

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| task objective + human state | ExecutionTasks | scan approved work | Primary | fixed master list | exact task ids Technical |
| current task owner/action/blocker | `deriveExecutionOwner` + recovery/current attention | know what requires action now | Primary | attention/detail header | blocker promotes human meaning/action only |
| attempt human meaning/status | Runs mapped to product labels | inspect current/historical attempts | Operational | subordinate attempt selector/list | Run id/session Technical |
| current validation boundary | `deriveValidationBoundary` | understand verified progress/failure | Primary | task detail | unreached full matrix not primary |
| chronology | RunEvents mapped to product presentation | inspect operational history | Operational | Timeline | raw event tags/payload Diagnostic |
| evidence/resources | EvidenceRefs/artifacts | inspect supporting proof | Supporting | resource list | exact bytes/identity in Evidence |
| Start current task / Retry / Resume / Cancel | canonical execution owner/recovery | operate current approved task | Primary | attention/action region | historical selection cannot retarget action |
| task/approval/plan/Run ids; baseline/context/provider session | exact execution records | audit mechanics | Technical | Technical details | absent ordinarily |
| raw execution diagnostics | diagnostics/events/provider evidence | debug failure | Diagnostic | Technical details/Evidence | never ordinary chronology copy |

##### SURF-MAT-EXEC-TASK-001 — execution task/attempt detail

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| selected task objective/state | ExecutionTask | understand selected task | Primary | detail |
| signed scope/gates/dependencies/change forecast when needed | ExecutionTask | understand execution contract | Supporting | detail sections |
| selected attempt role/number/human status | Run | inspect attempt | Operational | attempt detail |
| current validation boundary | pure validation-boundary derivation | understand the current verification position | Primary | current boundary visible in task detail |
| recorded validation results/history | validation RunEvents | inspect completed verification history | Operational | subordinate validation history; complete matrix disclosed |
| timeline | RunEvents | inspect execution history | Operational | timeline with product labels |
| evidence resources | EvidenceRefs | inspect proof | Supporting | resource rows; opens Evidence |
| task/approval/Run/baseline/context/session/internal classification | exact records | audit mechanics | Technical | Technical details |
| raw event/payload/diagnostic data | RunEvents/provider diagnostics | debug | Diagnostic | Timeline Technical details/Evidence |

##### SURF-STEP-COMPLETE-001 — terminal result

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| canonical final outcome human label/explanation | `WorkItem.outcome` → product language | state what happened | Primary | result header/status | use “Verified candidate” only for executed delivery; umbrella product outcome remains verified result semantics |
| governed result material | terminal ArtifactRefs/content | present investigation/audit result where applicable | Primary | result body | exact artifact identity Technical |
| candidate evidence/resources | successful execution Runs/RunEvents/EvidenceRefs | support verified candidate | Supporting | resource list | human resource labels ordinarily; exact identity in Evidence |
| linked remediation action | eligible Audit/Investigation outcome | create separately governed Change/Defect | Primary | result action | opens `SURF-CREATE-001` |
| ids/hashes/internal role identity | exact records | audit exact result identity | Technical | Technical details/Evidence if needed | never ordinary result copy |
| raw event tags/payloads | RunEvents | debug implementation evidence | Diagnostic | Evidence only when explicitly inspected | never ordinary result copy |
| result loading/error state | content/evidence query | explain unavailable supporting material | Supporting | owning result notice | raw transport internals hidden |

##### SURF-MAT-SOURCE-001 — Work request source document/editor

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| canonical source Markdown/body | WorkItemSourceSnapshot | author originating intent | Primary | document/editor | internal template/schema identity hidden |
| Edit/Preview/Split | local editor mode | author/inspect safely | Supporting | document toolbar | does not alter authority until Save |
| local dirty/current state | buffer vs loaded source | protect unsaved work | Supporting | toolbar/notice | confirmation on destructive navigation |
| Save | source mutation | persist source authoring | Primary | editor actions; visually primary command while editing | expected-hash conflict shown as human recovery |
| Cancel | local editor action | abandon local source edits | Supporting | editor actions; secondary command | preserves canonical bytes |
| compact documentation-Git state/action | Git status | optionally persist governed docs | Supporting | document toolbar | exact branch/HEAD/paths Technical except confirmation |
| source blocker human meaning | source diagnostics | explain inability to progress | Primary | document/attention notice | raw code/path Technical |
| path/SHA/schema/source internals, WorkItem directory, branch, HEAD | source/Git state | audit identity | Technical | Technical details | hidden by default |
| exact changed paths | Git status | consent to documentation commit | Primary | confirmation | path-specific decision exception |

##### SURF-MAT-DOC-001 — editable lifecycle document

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| governed Markdown content | ArtifactRef + exact bytes | author current governed artifact | Primary | document/editor | semantic internal content remains owned by selected stage schema/template |
| human document role/title | ArtifactRef role mapped to product label | orient current material | Supporting | document header | repository path not subtitle |
| maturity/currentness | lifecycle/currentness derivation | understand whether material is current/editable | Supporting | status/notice | exact hash Technical |
| Edit/Preview/Split | editor mode | author/inspect | Supporting | toolbar | no new authority |
| Save | artifact mutation | persist allowed direct edit | Primary | editor actions; visually primary command while editing | exact expected hash remains mechanics |
| Cancel | local editor action | abandon local artifact edits | Supporting | editor actions; secondary command | preserves canonical bytes |
| documentation-Git state/action | Git status | optional governed docs commit | Supporting | toolbar | exact paths in confirmation |
| non-canonical Markdown incompatibility | decode/format validation | explain why ordinary editor cannot own bytes | Primary | notice + inspect exact bytes action | exact bytes in Evidence |
| repository path/SHA/git commit/branch/HEAD | ArtifactRef/Git status | audit identity | Technical | Technical details | absent ordinary heading |

##### SURF-MAT-DOC-RO-001 — read-only lifecycle/supporting document

| Datum/action | Source | Intent | Class | Placement / rule |
|---|---|---|---|---|
| governed Markdown content | ArtifactRef + content bytes | inspect supporting/historical/R3/Approval material | Primary | read-only document |
| human document role/currentness | ArtifactRef + lifecycle currentness | orient material | Supporting | header/status |
| exact path/SHA/git commit/internal role identity | ArtifactRef | audit identity | Technical | Technical details |
| inspect exact bytes if ordinary Markdown decode cannot represent content | content validation | preserve source fidelity | Supporting | opens Evidence |
| Back/selector navigation | local selection | return to owning task | Supporting | selector/history |

##### SURF-MAT-ACTIVITY-001 — STAGE dialogue/activity

| Datum/action | Source | Intent | Class | Default placement | Disclosure / promotion |
|---|---|---|---|---|---|
| human/agent conversation | persisted semantic RunEvents | understand/respond to stage work | Primary | Dialogue transcript | workflow/system events visually distinct |
| exact required-input question | unresolved HUMAN_INPUT_REQUESTED | answer current question | Primary | Dialogue anchor/composer | focus once for newly current request |
| free-form continuation guidance/composer | OPEN interaction + visible substantive agent message | continue current work | Primary | anchored composer; visually primary current interaction | absent while proposal/recovery/higher owner exists |
| human-readable processing/block/failure status | interaction/current attention | understand current state | Primary | Dialogue/attention notice | raw provider mechanics hidden |
| attempt number/time/human status | Run | orient attempt | Supporting | Dialogue header/selector | Run id Technical |
| bounded agent activity | AGENT_ACTIVITY_RECORDED | useful operational transparency | Operational | activity region/timeline | does not replace conversation |
| workflow/system event labels | RunEvents through product presentation | understand persisted workflow history | Operational | timeline | raw tags/payloads Diagnostic |
| evidence resource labels | EvidenceRefs | inspect proof | Supporting | timeline/resource row | exact identity/bytes in Evidence |
| Cancel | canonical interaction eligibility | stop current Run | Supporting | Dialogue action | suppressed by proposal/adoption/current-owner rules |
| provider session/baseline/context/Run ids/raw role/status/terminal classification | Run | exact mechanics | Technical | Technical details | absent ordinary header |
| raw event tag/sequence/JSON payload | RunEvent | debug | Diagnostic | Timeline Technical details/Evidence | absent ordinary timeline |

##### SURF-MAT-PROPOSAL-001 — proposal review

| Datum/action | Source | Intent | Class | Default placement | Rule |
|---|---|---|---|---|---|
| proposal currentness/state | proposal/adoption/disposition events | know whether decision is pending/applying/complete | Primary | Review header/status | human labels only |
| human target meaning | proposal target mapped to governed document/authority meaning | know what changes | Primary | Review body | raw path may be shown only where exact target identity is necessary to review the mutation; do not use as sole label |
| rationale | proposal event | understand why | Primary | Review body | none |
| unified diff | proposal event | inspect exact proposed bytes | Primary | CodeBlock/review body | exact mutation content is task-required |
| Adopt/Reject | current proposal decision state | dispose proposal | Primary | decision region | continuation/cancel competition follows canonical control exclusivity |
| adoption/decision failure | mutation state | recover decision | Primary | Review notice | raw transport mechanics hidden |
| provider/session/schema identity | Run/typed proposal context | audit exact mechanics | Technical | Technical details | absent ordinary review |
| raw event tags/payloads | RunEvents | debug | Diagnostic | Evidence/Timeline Technical details | absent ordinary review |

##### SURF-MAT-EVIDENCE-001 — exact Evidence

Evidence is an explicit inspection surface; exact identity and exact bytes are intentionally Primary here.

| Datum/action | Source | Intent | Class | Placement | Rule |
|---|---|---|---|---|---|
| human evidence label/resource meaning | EvidenceSelection / ArtifactRef | identify selected proof | Primary | header | may include relative path where that is the evidence identity |
| exact evidence/artifact identity | EvidenceRef/ArtifactRef | audit exact resource | Primary | header/metadata | explicit inspection exception |
| exact read-only bytes/text | evidence/artifact API | inspect proof faithfully | Primary | CodeBlock/content | no independent theme island |
| binary/decoding representation | bounded evidence reader | preserve inspectability | Primary | content | clearly technical |
| loading/read failure | evidence query | explain unavailable proof | Primary | state/notice | raw transport internals hidden |
| Back | recorded origin | restore owning workflow/material and focus | Supporting | header/action | no mutation |

##### Confirmations

###### SURF-CONF-DIRTY-DEST-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| unsaved-change meaning | local dirty state | Primary | confirmation body |
| requested destination consequence | pending destination semantic label | Primary | enough context to decide safely; no internal route |
| Continue editing | local | Supporting | close confirmation, preserve buffer |
| Discard and navigate | local | Primary | destructive-priority confirmation command; explicit confirmation; no silent discard |

###### SURF-CONF-DIRTY-MATERIAL-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| unsaved Markdown meaning | local dirty state | Primary | confirmation body |
| requested step/material semantic target | pending selection | Primary | human label, not internal key |
| Continue editing | local | Supporting | safe secondary command; close confirmation and preserve buffer |
| Discard and switch | local | Primary | destructive-priority confirmation command; intentionally discard and switch |

###### SURF-CONF-ARCHIVE-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| WorkItem human title + archive/restore consequence | WorkItem | Primary | identify affected work semantically |
| archive/restore command | WorkItem mutation | Primary | exact WorkItem id remains Technical |
| Cancel | local | Supporting | secondary confirmation command; no mutation |

###### SURF-CONF-DOC-GIT-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| documentation-commit purpose/consequence | Git/document contract | Primary | explain explicit repository persistence |
| exact governed changed paths | Git status paths | Primary | exact paths are required for informed path-scoped consent |
| branch/HEAD/author where necessary to understand the commit | Git status | Technical | subordinate; must not swamp path scope |
| Commit | documentation-Git command | Primary | visually primary confirmation command; no commit without explicit confirmation |
| Cancel | local | Supporting | secondary command; close without repository mutation |

###### SURF-CONF-REPO-DISCONNECT-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| affected repository/project meaning | selected repository | Primary | semantic identity first |
| exact repository root | selected repository | Primary | path-specific decision exception |
| preservation/consequence statement | disconnect contract | Primary | state what is and is not removed |
| Disconnect | repository mutation | Primary | destructive-priority confirmation command; explicit decision |
| Cancel | local | Supporting | secondary command; no mutation |

###### SURF-CONF-OC-REMOVE-001

| Datum/action | Source | Class | Placement rule |
|---|---|---|---|
| account human label | selected account | Primary | identify target |
| credential/removal consequence | account mutation contract | Primary | explain effect |
| exact account id/provider mechanics | account record | Technical | hidden unless needed for technical inspection; not ordinary confirmation copy |
| Remove | account mutation | Primary | destructive-priority confirmation command; explicit decision |
| Cancel | local | Supporting | secondary command; no mutation |

---

##### Cross-surface action and placement laws

##### Current-attention precedence

Observation coherence is evaluated before mutation controls. The one current mutation/action owner follows canonical P3 precedence. Historical/material selection never retargets the current action.

At minimum the implementation must preserve the closed precedence already governed for:

- convergence/mutation conflict;
- exact required input;
- proposal decision/adoption;
- current blocker/recovery/stale authority;
- active processing;
- ordinary actionable current task;
- ordinary current document/review/material.

Only the highest-precedence mutation owner is presented as the current workflow action.

##### Responsive semantics

Wide/medium/narrow may change composition, not classification.

- Primary remains directly reachable and is never moved behind Context/Technical details.
- Technical/Diagnostic remains hidden by default and never becomes persistent to “fill” narrow/wide layouts.
- Context is explicit and closeable.
- Implementation remains the only persistent workflow master/detail class.
- selectors/history become adaptive controls without creating another navigation axis.
- action priority is invariant across viewport classes.

##### Theme semantics

System/Light/Dark change visual tokens only. Information class, disclosure, action priority, hierarchy and interaction class remain identical.

##### Human-label law

Internal lifecycle/status/schema/provider/event codes remain valid canonical values but are not ordinary operator copy where a human-facing meaning exists.

Exact internal identity is shown only where:

- the active task literally requires choosing/entering that exact value;
- a confirmation requires the exact target to make an informed decision;
- Context/Technical details/Evidence is explicitly opened.

##### Resource-label law

Ordinary resource lists use human-facing role/meaning. Exact repository/evidence identity moves to Evidence or Technical details unless the exact target is itself the decision being made.

##### Failure law

A failure can promote:

1. what failed in operator language;
2. consequence for the current task;
3. valid recovery/action.

It does not promote raw error code, event tag, parser/provider payload, session id, repository path, hash or transport response.

##### Implementation consumption contract

IA27-IA34 **consume this document**. They do not create a new screen-information schema.

For each owned `SURF-*` row, implementation must:

1. load the applicable surface contract above before inspecting current implementation bytes;
2. map every rendered datum/action to the corresponding contract row;
3. record current implementation as either `CONFORMING_NO_EDIT` or `RESIDUAL_DELTA`;
4. correct only `RESIDUAL_DELTA` inside the phase-owned paths/selectors;
5. prove Primary information is present and correctly prioritized;
6. prove Supporting/Operational information remains subordinate;
7. prove Technical/Diagnostic information is absent by default;
8. prove the authorized disclosure owner reveals the exact owned value after explicit entry;
9. prove closing/return restores the ordinary hierarchy and current attention;
10. prove responsive/theme variants preserve the same classification and action priority.

A missing contract row is not an implementation gap. It is a DESIGN defect and blocks the phase.

For IA32-IA34, the existing destructive purge-before-fresh-authorship rule still applies. Purge happens **before implementation of this already-closed contract**, not before implementation derives the contract.

##### Verification contract

Phase-local rendered review and final IA26 acceptance use three independent binary dimensions for every applicable surface/state:

- `schema_information` — this contract is realized exactly;
- `ux_interaction` — current-attention, action, navigation, recovery and interaction-class behavior conforms;
- `visual_ui` — hierarchy, density, geometry, typography, component consistency, affordance, truncation/wrapping, overlay and theme behavior conform to current authority.

`schema_information = PASS` requires both positive and negative proof:

- required Primary information is visible;
- required Supporting/Operational information is correctly subordinate;
- Technical/Diagnostic values are absent from the ordinary surface;
- the authorized disclosure/confirmation/Evidence owner exposes the value only when explicitly entered;
- close/return restores ordinary hierarchy;
- no current action is lost behind disclosure.

Presence-only assertions are insufficient.

##### Completeness rules

This contract is complete only while all of the following remain true:

- the registry contains exactly the 37 current governed `SURF-*` ids;
- every production renderer is classified by the canonical P4 renderer matrix;
- every operator-visible canonical datum/action admitted by the Phase-1 typed-input/interaction inventories maps to a row here or to the rendered governed Markdown body;
- every exact-id/path/hash/session/event/provider value has an explicit default-visibility/disclosure decision;
- every destructive/dirty/configuration decision has an explicit target-information rule;
- every work-kind/stage difference remains preserved through the selected canonical document/schema semantics;
- responsive/theme variants do not create new information classes or placements;
- no implementation task is instructed to “derive”, “choose” or “infer” a screen information schema.

Any future new surface, datum/action class, disclosure owner or interaction grammar requires DESIGN/P3 amendment before implementation.


##### Closed progressive-disclosure realization

The implementation uses only existing canonical interaction owners:

- operator-facing workflow history/material -> `WorkbenchSelector` / Supporting material/history;
- compact selected-WorkItem technical orientation -> explicit `WorkbenchContextPanel`;
- local exact identity/mechanics -> `WorkbenchDisclosure` labelled **Technical details** (or the task-specific technical-detail label already owned by the Review);
- exact raw bytes/resource -> explicit Evidence surface;
- mutation-consent facts -> `WorkbenchConfirmation` only when those exact facts are necessary to consent safely.

There is no new persisted disclosure state, DTO/view-model, diagnostic dashboard, second Context system or feature-specific technical panel. Diagnostic/console facts that have no legitimate operator inspection use remain absent from the product UI.

A replacement screen is technically invalid when any of the following is true:

- a raw id/hash/path/session/event/enum is persistently visible although a semantic label suffices;
- a blocking technical condition promotes its raw representation rather than its human meaning/action;
- the same technical datum is duplicated across ordinary primary/supporting space and a technical owner without a second decision need;
- a datum that R2 classifies as Primary can be reached only by opening Context/Technical details;
- implementation or a derived SVG chooses a different disclosure owner from this matrix.

## Technical change solution catalog

| Solution | Owned defect/outcome | Canonical technical owner | Expected implementation surface | Technical decision | Permanent proof |
|---|---|---|---|---|---|
| SD01 | C21 product-language realization | P2 Product Identity + P4 Workbench presentation | README.md; ui/src/TerminalResult.tsx; ui/src/workbench-presentation.ts | Use verified result as umbrella product outcome and Verified candidate only for executed delivery; reuse the canonical P4 terminal-result projection and replace local enum prettification; no lifecycle/state/contract change. | tests/workbench-presentation.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| SD02 | C22 authority resolution and stage materiality | GW-DOC-LIFECYCLE-CONTEXT-V2 + GW-DOC-TECHNICAL-ARCHITECTURE-V2 §35.1 + GW-DOC-OPENCODE-INTEGRATION-V1 | src/core/governance.ts; src/daemon/authority.ts; src/daemon/stage.ts | Reuse the permanent P3/P4 contract: pure same-layer precedence plus P1 default/override/extension/fitness resolution over the reachable authority graph, then derive the stage-material subset from pinned schema/template, mandatory stage policy and explicit upstream/signed refs. Stable refs select current owners; explicit versioned refs select exact retained snapshots. Retained versions must remain reachable without entering an unrelated current-schema context. Unresolved material relation blocks before inference. | tests/core.test.ts; tests/daemon.test.ts; tests/certification.test.ts — exact propositions below |
| SD03 | C02 authoring presentation | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract | ui/src/CreateWorkItem.tsx | Ordinary label is Concerns; linked remediation project is fixed parent-project context. Preserve canonical kind/schema/body/metadata owners. Project/kind/title/Concerns and human lineage meaning are ordinary content; repository root, parent WorkItem id, schema/version/internal metadata are not persistently exposed when semantic labels suffice. | tests/browser.spec.ts proves both authoring semantics and default-hidden technical identity |
| SD04 | C02/C04 singular source admission | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/daemon/work-item-source.ts | Factor one new-source QueuePlan producer and persist both created/discovered sources through existing applyPlan; remove direct create-path WorkItem store. | tests/daemon.test.ts |
| SD05 | C03 archived queue filtering | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract | ui/src/app.tsx; ui/src/WorkItemQueue.tsx | App selects active/include-archived canonical dataset then applies project/search once; queue does not replace filtering semantics. Source/readiness diagnostics use human-readable operator meaning/action in ordinary Queue/application space; raw diagnostic code/path remains technical/evidence-owned. | tests/browser.spec.ts includes filter semantics plus negative raw-diagnostic visibility |
| SD06 | C04 documentation-Git exact review | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 + R2 C19 visibility contract | ui/src/DocumentWorkspace.tsx | Render exact canonical changed-path/state set in confirmation before existing bounded commit command; this is the explicit safe-consent exception where exact paths become decision-primary. Outside that confirmation, path/hash/schema identity remains Technical details. No second Git-status owner. | tests/browser.spec.ts proves default-hidden document identity plus exact confirmation paths |
| SD07 | C05/C17 current-attention visibility | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract | ui/src/ActivityWorkspace.tsx; ui/src/WorkItemWorkspace.tsx; ui/src/workbench-presentation.ts | Keep historical/supporting inspection while the exact higher-priority current owner/reason/action remains visible and directly reachable; when the owning cause is technical, promote only its human-readable meaning/consequence/action while raw code/path/session/payload remains in Technical details/Evidence. Do not create browser workflow state. | tests/workbench-presentation.test.ts; tests/browser.spec.ts including human-meaning-only promotion |
| SD08 | C06 durable authority-changing input | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/lifecycle.ts; src/daemon/stage.ts | After answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, stage completion requires later adopted canonical authority; INFORMATION/EVIDENCE unchanged. | tests/core.test.ts; tests/daemon.test.ts |
| SD09 | C07/C08 permanent authority proposal/adoption | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/contracts.ts; src/core/governance.ts; src/daemon/authority.ts; src/daemon/stage.ts | Extend the one proposal/adoption owner: R2 admits current P2/P3 targets; DESIGN current P4/P5/P6 targets; re-resolve role/layer/path/base hash before adoption. No new proposal model. | tests/core.test.ts; tests/daemon.test.ts |
| SD10 | C09 signed task contract, non-vacuity and execution-surface semantics | GW-DOC-CANONICAL-CONTRACTS-V2 + GW-DOC-SPECIFICATION-STANDARD | **Remaining T1 delta:** src/core/execution.ts; src/daemon/stage.ts; src/daemon/authority.ts. **Baseline reuse/no T1 edit for execution-foundation semantics:** src/daemon/execution.ts; src/daemon/validation.ts; src/shell/opencode.ts | Keep the one canonical `SignedTaskBlockSchema` and existing `parseSignedTaskBlockFromPlan` structural parser unchanged so published `change-v1`/`defect-v1` semantics are not silently reinterpreted. Add one pure schema-aware task-admission function over the already parsed `SignedTaskBlock`: for `change-v2`/`defect-v2` only, enforce P6 §37.4 (non-empty tasks; trimmed non-empty id/objective; non-empty scope/acceptance/changeSurface/gates/authority/concerns); for v1, preserve the historical contract. The existing PLAN/R3 prompt contract in `src/daemon/stage.ts` must become schema-aware and state the same v2-only non-vacuity clauses in addition to the unchanged shared JSON Schema, so authoring and deterministic admission agree. The existing PLAN semantic conformance questions remain the owner of **material** task sufficiency: each task must trace upward/downward and close objective/dependencies, module ownership/decomposition, required architecture-feedback checkpoints, production/test surfaces, deletions/replacements, completion evidence, minimum-change forecast and verification contract without delegating a P1-P6 decision. R3 independently challenges complete bidirectional P1-P7 traceability/current readiness. PLAN conformance must call the v2-aware mechanical admission, and R3/sign-off `validateTaskDefinitions` must call the same owner so a syntactically vacuous v2 package cannot bypass those semantic reviews. No second task DTO/schema/parser or second semantic-review owner is introduced. The corrected baseline already owns signed scope/exclusions as the hard repository boundary, changeSurface as immutable forecast, V2 true-boundary rejection, V4/V5/V6 minimum same-layer variance review and coordinator-owned V6 CHANGE_BLOAT; T1 must reuse rather than reimplement those semantics. | tests/core.test.ts proves v1 parse/admission compatibility plus v2 non-vacuity positives/negatives; tests/daemon.test.ts proves v2 PLAN and READY_FOR_SIGNOFF/sign-off rejection cannot bypass the rule; tests/certification.test.ts binds the singular schema-aware admission/prompt path and rejects a duplicate task schema/parser |
| SD11 | C10 Readiness judgment | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract | ui/src/ReadinessWorkspace.tsx; ui/src/workbench-presentation.ts | Dominant verdict derives from typed R3 completion outcome; findings/return owner remain primary, package/material context is supporting, and artifact role/path/hash/package identity is Technical details only. | tests/workbench-presentation.test.ts; tests/browser.spec.ts including hidden-before-disclosure technical identity |
| SD12 | C11 Approval identity and hierarchy | GW-DOC-CANONICAL-CONTRACTS-V2 + GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract | src/core/contracts.ts; src/daemon/authority.ts; ui/src/SignoffReview.tsx | Trim/reject blank approvedBy at canonical ingress and show readiness/currentness/task meaning before technical package identity; package hash/baseline/commit plus approval/task ids remain behind their owning Technical details disclosure while browser validation remains feedback. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts proves hidden/default/disclosed identity |
| SD13 | C12 signed in-task checkpoint | GW-DOC-EXECUTION-CONTROL-PLANE-V1 + GW-DOC-CANONICAL-CONTRACTS-V2 | **Baseline capability already integrated; no T1 production edit:** src/core/contracts.ts; src/core/execution.ts; src/daemon/execution.ts; src/daemon/validation.ts; src/shell/opencode.ts | Current baseline satisfies P6 §37.6: BUILDER alone may request exactly one signed-task gate checkpoint as terminal turn action; the coordinator verifies freshness/signed gate/current V2 scope before effect, executes the existing gate owner, records GATE_PASSED/GATE_FAILED evidence and continues the same Run/provider session; provider shell/execute remains denied. Final PLAN may schedule/use this capability but must not bootstrap or reimplement it. | existing tests/core.test.ts; tests/daemon.test.ts; tests/certification.test.ts are baseline proof; final PLAN may add only task-specific usage/cadence proof where required |
| SD14 | C16 Settings hierarchy | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract | ui/src/SettingsWorkspace.tsx | Keep one canonical Settings/config owner. Readiness/meaning/action is ordinary content; exact roots/endpoints/account/credential-like/provider identity stays in Technical details except when the active Add/Move/model/account task requires that exact value as an input/selection. Raw enum/status codes are mapped to operator language. | tests/browser.spec.ts proves ordinary-vs-active-input-vs-technical placement |
| SD15 | C18 required-input focus | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ActivityComposer.tsx; ui/src/ActivityWorkspace.tsx | Focus Workbench-owned composer once for each newly current required-input event id; rerender/polling does not refocus; no private Astryx DOM policy. | tests/browser.spec.ts |
| SD16 | C19 exhaustive renderer fitness | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19 visibility contract + this DESIGN's exhaustive 37-surface information contract | tests/certification.test.ts | Keep exhaustive production-renderer classification proof against the **actual rows of P4 §8.17**; incidental `.tsx` mentions in surrounding prose do not satisfy renderer-matrix membership. Certify that each renderer family consumes only the disclosure owner(s) authorized by the exhaustive surface contract. The check remains structural/semantic and does not create a second field registry or mutate tests/architecture.test.ts inside T1. | tests/certification.test.ts |
| SD17 | C20 scenario-41 certification | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C19/C20 visibility contract | tests/browser.spec.ts | Certify all four work-kind Work request + Research information contracts and distinct Change/Defect downstream obligations, including that kind-specific operator information is visible while common technical identity remains default-hidden. | tests/browser.spec.ts |
| SD18 | C20 component/theme parity certification | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 + R2 C19/C20 visibility contract | tests/browser.spec.ts; tests/workbench-presentation.test.ts | Certify representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay semantic roles under System/Light/Dark, including identical Primary/Supporting/Technical disclosure semantics in every effective theme. | tests/browser.spec.ts; tests/workbench-presentation.test.ts |
| SD19 | C16 guided productive installer | corrected P3 `GW-FR-007` + `GW-FR-079`; GW-TR-007-GUIDED-PRODUCTIVE-BOOTSTRAP + corrected GW-DOC-CANONICAL-CONTRACTS-V2 | src/shell/setup.ts; new tests/installer.test.ts | Remove fresh-install success/defer branch. `runInstallerGuidedSetup` reuses existing login/model/repository/reference collection and returns success only after productive choices and daemon/readiness conditions exist. Preserve incomplete v4 as post-install/update daemon/Settings recovery state and preserve update/migration/rollback behavior. No config schema or installer-orchestrator duplication. | new tests/installer.test.ts; tests/order-migration.test.ts |
| SD20 | C20 exact-pin OpenCode integration certification | `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE`; `GW-TR-079-OPENCODE-INSTRUCTION-BOUNDARY-CERTIFICATION`; `GW-DOC-EXTERNAL-FACTS` | `tests/opencode.test.ts`; `.github/workflows/ci.yml` | Add one permanent verification-only exact-pin tier: CI installs isolated `opencode-drive@2.4.1` + `effect@4.0.1` tooling outside Order's package/runtime dependency graph; the test launches the actual supported OpenCode `2.2.6` process through Order's production OpenCode shell/session boundary and drives deterministic model responses through the simulation provider/controller. Existing fake OpenCode fixtures remain fast unit/shell/daemon doubles only and cannot satisfy the exact-pin proposition. No production source, runtime dependency, config/state model or alternate provider path is introduced. | permanent exact-pin integration case in `tests/opencode.test.ts`, executed by PR verification; existing fake/adversarial tests remain complementary |
| SD21 | C05/C18/C19-F02/C19-F03 Workbench foundation + shell destructive reconstruction boundary | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §16.6 + GW-DOC-WORKBENCH-THEME-V1 + current R2/P3 interaction/information contracts + this DESIGN's exhaustive 37-surface information contract | design-bearing composition primitives under `ui/src/primitives/`; new `WorkbenchAppShell.tsx`, `WorkbenchWorkItemShell.tsx`, `workbench-responsive.ts`; `ui/src/app.tsx`; `ui/src/WorkItemWorkspace.tsx`; `ui/src/WorkItemIdentityRow.tsx`; `ui/src/WorkflowRail.tsx`; `ui/src/WorkflowStepFrame.tsx`; `ui/src/theme.css`; `ui/src/styles.css`; `tests/certification.test.ts`; `tests/browser.spec.ts` | Reconstruct the same foundation boundary as before, using the already-closed surface information contract to prove the foundation can realize Primary/Supporting/Operational/Technical/Diagnostic slots and the closed disclosure owners. AppShell/WorkItemShell/Attention/Surface/Review/Dialogue/MasterDetail/Context/Selector/Disclosure composition must make it structurally possible for screens to keep ordinary task content separate from technical/diagnostic inspection without creating another layout axis. No primitive invents product classification; it receives already-classified content. | prior purge/one-owner architecture proof remains required; foundation review additionally proves the closed disclosure channels, no auto-open technical surface, and no primitive forces technical identity into ordinary content |
| SD22 | C02/C03/C16/C19-F03 — fresh Queue/Create/application utilities | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-INSTALLATION-READINESS-V1 + R2 C02/C03/C16/C19 | `ui/src/OpenCodeAccountControl.tsx`; `ui/src/WorkItemQueue.tsx`; `ui/src/CreateWorkItem.tsx` | Queue renders human-readable source/readiness attention and an inspect/recovery action, never raw diagnostic code/path in the ordinary notice. Create/remediation renders project/kind/title/Concerns and human lineage meaning; repository documentation root, parent WorkItem id and other internal derived identity are hidden behind the authorized technical owner rather than persistently shown. Active saved-account status remains global quick-access, not management detail. | browser/rendered proof includes absence of raw Queue diagnostic code/path and Create root/parent-id from default view plus positive authorized disclosure where applicable |
| SD23 | C04/C05/C19-F03 fresh Work request/document screens on reconstructed WorkItem shell | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C04/C05/C17/C19 | `ui/src/DocumentWorkspace.tsx` | Governed content/action stays primary; maturity/currentness and compact Git state stay supporting; repository path/SHA/schema/source identity stay inside Technical details. The existing documentation-Git confirmation is the explicit exception where exact changed paths become decision-primary because consent is path-specific. | browser/rendered proof checks default absence of path/hash/schema, positive Technical-details disclosure, and exact changed-path visibility inside confirmation |
| SD24 | C06/C07/C08/C09/C19-F03 fresh productive-stage screens | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 productive interaction/visibility contract | `PreSignoffStageWorkspace.tsx`; `ActivityWorkspace.tsx`; `ActivityComposer.tsx`; `WorkflowMaterialSelector.tsx`; `ProposalReview.tsx`; `RunEventTimeline.tsx` | Dialogue/Document/Proposal current task remains primary; attempts/upstream material/activity/evidence remain supporting. Provider session, baseline/context hash, raw Run/event tags and repository paths are Technical details and cannot appear in the ordinary companion/history surface. Proposal uses human target/rationale/diff labels; raw event/schema identity remains technical. Provider failure may promote only its human blocker/recovery meaning. | per-stage browser/rendered review proves hidden technical identity by default, positive Technical/Timeline disclosure, and no raw Research repository path/event-tag leakage |
| SD25 | C10/C11/C19-F03 fresh Readiness + Approval screens | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C10/C11/C19 | `ReadinessWorkspace.tsx`; `SignoffReview.tsx` | Preserve the Review hierarchies, with artifact/package role/path/hash, package hash/baseline/commit and approval/task ids explicitly bound to Technical details / Task technical details. Currentness/readiness/task meaning remains visible while technical disclosure opens. | browser proof must assert those identities hidden before disclosure and visible only after the owning disclosure, while verdict/currentness/sign-off hierarchy remains present |
| SD26 | C12/C19-F03 fresh Implementation screen | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C12/C19 | `ExecutionWorkspace.tsx`; consumes the already-reconstructed `RunEventTimeline.tsx` from SD24/IA30 and reconstructed `WorkbenchMasterDetail` from SD21 | Current task/action/blocker/attempt meaning/validation stay primary; task master/history/chronology/evidence stay supporting. Task/approval/plan/Run ids, baseline/context/provider session and raw execution diagnostics are Technical details. Evidence resource labels use operator-facing resource meaning; raw technical identity moves to Evidence after explicit open. | execution browser/rendered proof includes negative default visibility for ids/session/baseline and positive technical/evidence disclosure |
| SD27 | C13/C14/C19-F03 fresh Complete/Evidence/Context screens | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C13/C14/C19 | `TerminalResult.tsx`; `EvidenceViewer.tsx`; `WorkItemContext.tsx` | Complete uses only product-facing outcome/resource language; raw event tags/role codes/ids/hashes do not become ordinary result copy. Evidence is the explicit owner where exact evidence identity/bytes become primary. Context remains explicitly opened compact technical orientation and may contain raw exact values because the operator requested that surface; neither Evidence nor Context auto-opens or hides current attention. | terminal proof rejects internal event/role vocabulary in default result; Evidence/Context proof confirms exact values only after explicit open and correct return/close behavior |
| SD28 | C15/C16/C19-F03 fresh Settings/account/configuration management screens | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-INSTALLATION-READINESS-V1 + R2 C15/C16/C19 | `SettingsWorkspace.tsx`; `OpenCodeAccountSettings.tsx` | Readiness/meaning/action remain primary. Exact roots/endpoints/account ids/provider mechanics are Technical details unless the active Add/Move/model/account task requires that exact value as its input/selection. Internal enum/status codes are mapped to product language rather than rendered literally. | Settings browser/rendered matrix proves ordinary-vs-active-input-vs-Technical-details placement for repository/account/model values |
| SD29 | C18/C19-F03 responsive/accessibility on reconstructed foundation and replacement screens | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 | SD21 reconstructed composition primitives/responsive owner plus replacement screen files from SD22-SD28 | Structural responsive behavior remains singular. Responsive recomposition may change placement but never classification/default visibility: Technical/Diagnostic information cannot become persistently visible merely because the viewport changes, and Primary content cannot be pushed behind technical disclosure. Required-input focus-once remains SD15. | wide/medium/narrow proof includes semantic order plus disclosure parity and absence of viewport-specific technical leakage |
| SD30 | C20-F05/C20-F06 rendered and semantic UI acceptance | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 + R2 C19/C20 | `tests/browser.spec.ts`; `tests/certification.test.ts`; `.github/workflows/ci.yml` | Keep the three rendered verdict dimensions, but `schema_information` now explicitly includes visibility correctness: required Primary information present; technical/diagnostic information absent by default; authorized disclosure reveals its exact owned values; closing/return restores hierarchy. The SVG is comparison material only and must be corrected/overridden when it conflicts with R2. Presence-only assertions cannot satisfy the contract and stale assertions that force raw technical text into ordinary UI must be removed/replaced. | permanent CI artifact + per-row PASS for schema/information including hidden/default/disclosed states + zero unresolved rendered acceptance FAIL |

## A06 execution-foundation prerequisite — satisfied baseline, retained as causal design evidence

This is a **DESIGN baseline dependency**, not a second P7 task representation and not permission to implement 0.6.0 product scope outside sign-off.

ALIGN-A06 historically exposed two coordinator capabilities that a signed task cannot self-host because they govern the execution process judging that task:

1. **surface-variance admission:** signed `scope`/exclusions must be the hard repository-reach boundary while `changeSurface` remains immutable forecast evidence, with minimum same-layer physical variance judged through V4/V5/V6 rather than rejected solely by V2;
2. **architecture-feedback checkpoints:** a BUILDER must be able to request an already-signed gate, have the coordinator execute it, receive the result and continue in the same Run/provider session without ambient provider shell/execute permission.

Those prerequisite defects are now corrected in the campaign ancestry. Current production evidence proves:

- `src/shell/opencode.ts` derives BUILDER/REMEDIATOR edit capability from signed `scope` and then applies immutable-path/symlink hard denies;
- `src/daemon/validation.ts::validateChangedPaths` rejects instruction/protected/out-of-scope/excluded paths but does not reject forecast absence; `forecastVariancePaths` retains unforecast evidence;
- `src/daemon/execution.ts` supplies forecast/actual evidence to independent review, runs governance gates at V5 and maps reviewer minimum-change evidence to coordinator-owned V6 PASS or `CHANGE_BLOAT`;
- `GATE_CHECKPOINT_REQUESTED` is admitted only for BUILDER, must be terminal and signed, is V2-checked before the checkpoint effect, runs through the coordinator gate owner and continues the same Run/provider session;
- provider shell/execute remains denied; no second gate registry, scope model, DTO/state family or dynamic task mutation exists;
- core, daemon and certification tests permanently exercise signed checkpoint success/failure/unsigned/out-of-scope cases plus forecast variance and V6 `CHANGE_BLOAT`.

Therefore **SD13 is current baseline reuse, not T1 implementation work**. For SD10, the scope/forecast/V4-V6 portion is likewise current baseline reuse. The only remaining SD10 implementation delta is P6 §37.4 signed-task non-vacuity. The current shared `SignedTaskBlockSchema`/parser intentionally also serves retained `change-v1`/`defect-v1` WorkItems, whose published validation semantics are immutable. Globally tightening that schema would therefore be an invalid compatibility reinterpretation. The minimum DRY correction is one schema-aware pure admission function over the existing parsed `SignedTaskBlock`, enforcing §37.4 only for `change-v2`/`defect-v2`; the existing PLAN/R3 prompt contract states those same v2-only mechanical constraints while continuing to expose the unchanged shared JSON Schema. Material sufficiency is not reduced to presence checks: the existing PLAN conformance questions and independent R3 traceability/readiness review remain the semantic owners. PLAN conformance and R3/sign-off task validation consume the same mechanical admission owner. No parallel task schema, DTO, parser or semantic-review path is permitted.

**G4 re-entry requirements after this freshness correction:**

- revalidate DESIGN-A06 against current R2/P6 and the exact baseline/runtime evidence above;
- revalidate DESIGN-A07 so C11 Approval and C12 execution consume the same signed task/currentness/checkpoint/variance semantics;
- resume DESIGN-A08-A11 only after A07 passes, because they were predecessor-blocked rather than semantically invalidated;
- run fresh H3 across the complete current DESIGN package;
- only after G4 PASS may PLAN be regenerated. The regenerated PLAN must remove checkpoint-protocol/bootstrap implementation work, use the existing baseline checkpoint capability at each required architecture-feedback boundary, retain the corrected scope/forecast contract, and carry only the remaining SD10 non-vacuity implementation delta.

## A01 corrected-upstream no-code dispositions

These rows are **trace dispositions, not new semantic requirements**. They retain material R2 consequences that have already been applied to their canonical authority owners and therefore require no T1 production mutation. They remain explicit so corrected authority cannot disappear between R2, DESIGN and PLAN merely because the code delta is zero.

| Trace key | R2 consequence | Current canonical owner/evidence | DESIGN disposition | Technical consequence | Permanent proof |
|---|---|---|---|---|---|
| `A01-NC01` | C01 product-level success distinguishes verified terminal result from implementation-required verified candidate and preserves valid no-code terminal success. | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1`, §8 | `ALREADY_CORRECTED_NO_CODE` | No runtime/lifecycle mutation. DESIGN consumes the corrected P2 meaning as the product-level invariant for terminal presentation and lifecycle acceptance. | authority-byte/hash freshness + R1 C01-O06/O13/O14 recheck + V4 semantic review |
| `A01-NC02` | C01 clause-level P3 DELTA points `GW-P2-CONTROLLED-WORK` to its actual System Brief §9 declaration. | `GW-DOC-WORK-LIFECYCLE` blob `013bc1297c3d167b776e115f428517b7cedbea57`, §7 | `ALREADY_CORRECTED_NO_CODE` | Documentation authority correction only; no runtime contract/state behavior changes. | exact authority-byte/hash freshness + R1 C01-O14 recheck + V4 semantic review |
| `A01-NC03` | C21 canonical product language preserves verified-result/verified-candidate distinction, explicit product intent, conditional implementation and the bounded operator-triggered WorkItem documentation-Git allowance without implying automatic delivery commits. | `GW-DOC-PRODUCT-IDENTITY` blob `f45ee2ea00cf91c5b861c59d3d19f72b3e39611f` | `ALREADY_CORRECTED_NO_CODE` | No additional P2 mutation in T1. SD01 changes only the still-violating README/terminal projections; corrected canonical identity remains the source. | authority-byte/hash freshness + R1 C21 corrected-finding recheck + V4 semantic review |
| `A01-NC04` | C01 canonical lifecycle documentation distinguishes WorkItem lifecycle stages from internal EXECUTION implementation/validation subflow and valid no-code terminal completion. | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1` | `ALREADY_CORRECTED_NO_CODE` | Authority/documentation correction only; no new WorkStage or runtime transition semantics. Stable FR001/FR228 realization remains unchanged. | authority-byte/hash freshness + C01-F01/C01-O03/O05/O08 recheck + V4 semantic review |
| `A01-NC05` | C01 lifecycle-context terminology distinguishes canonical WorkItem stages from EXECUTION validation-role boundaries and the Audit work-kind evaluation boundary. | `GW-DOC-LIFECYCLE-CONTEXT` blob `4ce2b49b9eb57e60ddd2b1e3664fdd4e11cbbbc7` | `ALREADY_CORRECTED_NO_CODE` | Context/authority wording correction only; no new lifecycle stage, RunRole or work-kind state. | authority-byte/hash freshness + C01-F02/X-C01-C22-01 recheck + V4 semantic review |

## SD01 complete technical realization — product-language projection

**Canonical owner and reuse:** `GW-DOC-PRODUCT-IDENTITY` owns product language. `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §16.3` already owns the technical terminal-result projection rule: `CANDIDATE_DONE` renders **Verified candidate**, while other `WorkOutcome` variants use canonical product-facing labels rather than prettified internal enum names. SD01 reuses that owner; it does not create a second presentation policy.

**Producer → carrier → consumer path:**

```text
canonical WorkItem.outcome (P6/core lifecycle result)
  -> existing WorkItem browser projection
  -> one pure product-facing outcome-label mapping in ui/src/workbench-presentation.ts
  -> ui/src/TerminalResult.tsx attention + final-governed-outcome presentation

P2 Product Identity canonical reusable descriptions
  -> README.md public projection
```

**Required replacement/removal:**

- remove the feature-local `TerminalResult.tsx::outcomeLabel` enum-prettification policy;
- make `TerminalResult` consume the shared pure canonical product-label mapping;
- correct README hero/intro/result-boundary language so implementation is conditional and verified result is the umbrella outcome;
- remove the absolute public claim that Order simply “does not commit” where it would erase the governed operator-triggered WorkItem documentation-Git capability; preserve the prohibition on automatic implementation/candidate commit/push/merge/deploy.

**Invariants / negative behavior:**

- no `WorkStage`, `WorkOutcome`, persistence, HTTP, provider, task or lifecycle semantic changes;
- `CANDIDATE_DONE` alone maps to **Verified candidate**;
- every other current `WorkOutcome` maps explicitly to its canonical operator-facing product label; no fallback enum prettification may leak internal codes;
- non-candidate outcomes must not render candidate resources or imply implementation occurred;
- README must not imply that every WorkItem executes or that all terminal results are candidates;
- no new DTO/view-model/state owner or presentation service is introduced.

**Failure/recovery:** malformed/unknown outcome values remain a canonical contract/type violation; presentation does not guess a label. Resource-load failures remain existing TerminalResult supporting-state behavior and do not alter outcome classification.

**Rejected alternatives:** keep local enum prettification (rejected: leaks internal state language); introduce a second product-label table inside `TerminalResult` (rejected: duplicate owner); change `WorkOutcome` values to match display copy (rejected: presentation concern leaking into canonical state contract).

**Permanent proof propositions:**

- `tests/workbench-presentation.test.ts`: exhaustive current `WorkOutcome` → canonical product-facing label mapping, including `CANDIDATE_DONE -> Verified candidate`, and no generic underscore/title prettification path;
- `tests/browser.spec.ts`: terminal candidate presentation uses **Verified candidate** and a representative non-candidate terminal result uses its canonical non-candidate label without candidate resources;
- `tests/certification.test.ts`: README retains **verified result** umbrella language, conditions implementation/candidate language, preserves the explicit documentation-Git exception, and does not restore universal candidate/delivery wording.

## Exhaustive stable-requirement technical ledger

| Stable requirement | Exact R1 evidence | R1 verdict | DESIGN disposition | Delta solution(s) | Canonical P4-P6 owner(s) | Technical realization / correction | Verification ownership |
|---|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `C12-O01`, `C12-O02`, `C12-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `CONFORMS_WITH_DEPENDENCY` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `MIXED` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD29`, `SD30` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Domain/lifecycle capabilities remain, but the rendered Workbench realization is not accepted as conforming. Recompose the presentation foundation/shell and re-prove the resulting local Workbench through exact rendered evidence. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `C12-O12`, `C12-O13`, `C12-O19` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007`, `C16-F04` | `CONTRADICTORY_AUTHORITY + REALIZATION_VIOLATION` | `TECHNICAL_DELTA` | `SD19` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; corrected GW-DOC-INSTALLATION-READINESS | R2 has removed the P3 contradiction; implementation still violates the now-singular fresh-install contract. Remove deferred-Settings success branch while preserving post-install/update recovery capability. | new `tests/installer.test.ts`; existing `tests/order-migration.test.ts` |
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `C16-O02`, `C16-O05`, `C22-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `C04-O01`, `C04-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `C02-O01` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `C02-O02`, `C02-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `C02-O04`, `C02-O05`, `C02-O07` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD03` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Kind/project/system-metadata behavior remains; ordinary concern language must change from raw Concern IDs to Concerns. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-014-SOURCE-FRESHNESS` | `C04-O14`, `C02-O12` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `CONFORMS_WITH_DEPENDENCY` | `DEPENDENCY_DELTA` | `SD02` | GW-DOC-LIFECYCLE-CONTEXT-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Productive context must consume both the resolved authority relation and the lifecycle-applicable material subset. Reachable retained versions are admitted only when the pinned schema/template or an explicit governing ref selects that exact version; raw same-layer membership is never context materiality. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `C11-O01`, `C11-O03`, `C12-O20` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `C04-O07`, `C04-O14` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD04` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Freshness/read-side consumers remain; UI-created and discovered source admission must converge on one QueuePlan/applyPlan owner. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `VIOLATES` | `TECHNICAL_DELTA` | `SD08` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Authority-changing clarification must require later adopted canonical authority before completion; conversation remains evidence only. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `C03-O04`, `C03-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `C04-O03`, `C04-O08`, `C04-O14` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `C04-O01`, `C04-O02` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Canonical stale/current derivation remains; explicit inspected material must not hide the exact current owner/recovery action. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `VIOLATES` | `TECHNICAL_DELTA` | `SD08` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Durable-intent replies require governed authority mutation/adoption before downstream progression. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `C11-O01`, `C11-O02`, `C11-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `C04-O15`, `C12-O03`, `C12-O17` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts  |
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | `C13-O01`, `C13-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-029-NO-IDE-SCOPE` | `C04-O15` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `C04-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `C04-O04`, `C04-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `C04-O08`, `C04-O10`, `C04-O13` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `C04-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `C04-O02`, `C04-O15` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `DIRECT-FR066` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `C18-O11`, `DIRECT-FR067` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `DIRECT-FR068` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `C05-O07`, `C18-O04`, `C18-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `C04-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `C04-O12`, `C04-O13` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `C04-O12` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `CONFORMS` | `DEPENDENCY_DELTA` | `SD22` | GW-DOC-INSTALLATION-READINESS-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | The canonical account projection/query semantics remain positively conforming, but the old shell renderer is inside the destructive screen layer. Re-realize global active-account visibility and Settings quick-access in the fresh application shell under SD22; do not preserve/copy the old control or create another account-management owner. | tests/browser.spec.ts; tests/certification.test.ts; rendered `SURF-APP-001` acceptance |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `C16-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `C16-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `C16-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `C04-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `C03-O06`, `C03-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `C16-O09`, `C16-O10`, `C16-F04` | `CONTRADICTORY_AUTHORITY` | `TECHNICAL_DELTA` | `SD19` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; corrected GW-DOC-INSTALLATION-READINESS | Corrected P3 requires fresh-install success to satisfy productive readiness while retaining post-install/update recovery. The same SD19 installer mutation realizes this delta; existing readiness recovery projection remains reused. | new `tests/installer.test.ts`; existing `tests/order-migration.test.ts`; tests/browser.spec.ts |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `DIRECT-FR080` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `C16-O06`, `DIRECT-FR081` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `C16-O04`, `DIRECT-FR082` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `C02-O07`, `C02-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `C04-O02`, `C04-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `C04-O02`, `C04-O15` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `C04-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `C16-O02`, `C16-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `C16-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts  |
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `C07-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts  |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `C22-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `C15-O03`, `C15-O04`, `C15-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `C15-O12`, `C15-O13` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD20` | `GW-DOC-OPENCODE-INTEGRATION-V1`; `GW-DOC-EXTERNAL-FACTS` | Existing fake-provider suites remain useful lower-level proof, but they do not certify the exact supported OpenCode process/session boundary. Add a permanent real-2.2.6-process deterministic-simulation integration tier and keep the simulation proof boundary explicit. | `tests/opencode.test.ts`; `.github/workflows/ci.yml`; existing `tests/daemon.test.ts`/`tests/certification.test.ts` as complementary structural/adversarial proof |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `C15-O03`, `C15-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `CONFORMS_WITH_DEPENDENCY` | `DEPENDENCY_DELTA` | `SD02` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-CANONICAL-CONTRACTS-V2 | Trusted integration/context classification remains; Order-governed authority must first be deterministically resolved under C22-F01. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Observation derivation remains; presentation must preserve the exact current attention owner while historical/supporting material is inspected. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `C15-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `VIOLATES` | `TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Current attention owner/action must remain visible and directly reachable regardless of inspected historical material. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | `C14-O05`, `C14-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | `C14-O09`, `C05-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `C03-O04`, `C04-O14` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `C12-O17`, `C17-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `MIXED` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD24`, `SD26`, `SD29`, `SD30` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Semantic stability remains authoritative; the old primitive and feature/container geometry are both non-authoritative implementation evidence. Reconstructed foundation-owned geometry must be derived from P3/P4/new-design references and re-proved across workflow classes. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `VIOLATES` | `TECHNICAL_DELTA` | `SD21`, `SD22`, `SD23`, `SD24`, `SD25`, `SD26`, `SD27`, `SD28` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Rendered evidence proves information hierarchy is not a few local exceptions. Every interaction class must recompose Primary/Supporting/Technical hierarchy on the rebuilt foundation; SD11/12/14 semantics feed their owning domain solutions. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `VIOLATES` | `TECHNICAL_DELTA` | `SD21`-`SD29` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | The current presentation is not an acceptable shared spatial grammar. Space-class composition is rebuilt at primitive level and every renderer family migrates onto it. | tests/browser.spec.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Shared interaction grammar remains; current-attention visibility must remain continuous through explicit material selection. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `VIOLATES` | `TECHNICAL_DELTA` | `SD11` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Typed R3 outcome becomes dominant Readiness verdict; maturity/currentness remains supporting state. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD12` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Package/task semantics remain; readiness/currentness becomes primary before technical identity. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `C13-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `MIXED` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD29`, `SD30` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Semantic continuity remains authoritative, but the UI rebuild invalidates current responsive realization as preservation proof. Structural primitives own recomposition and exact rendered evidence re-proves it. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Permanent certification retains semantic/state matrices and additionally requires exact-candidate rendered evidence plus row-level acceptance across the governed UI surface. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts; GitHub Actions rendered acceptance |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `VIOLATES` | `TECHNICAL_DELTA` | `SD21`-`SD29` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Primitive filenames/wrappers do not prove a closed grammar. Every renderer is re-composed to its P4 interaction class and old recurring feature-owned grammar is removed. | tests/certification.test.ts; tests/browser.spec.ts + rendered acceptance |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `VIOLATES` | `TECHNICAL_DELTA` | `SD21`-`SD29` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | C19-F02 proves the visual language is not fully realized. Rebuild the primitive/theme foundation, migrate every renderer family and delete competing feature-era presentation ownership. | tests/browser.spec.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `VIOLATES` | `TECHNICAL_DELTA` | `SD21`-`SD29` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Runtime evidence demonstrates equivalent roles do not yet produce the intended unified presentation. Structural primitive/theme migration is required before renderer certification. | tests/browser.spec.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Root theme activation is reusable, but cross-service presentation parity must be re-proved after primitive/CSS reconstruction; feature-semantic CSS is not preserved as baseline. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + rendered acceptance |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `CONFORMS_WITH_VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD17` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Kind-specific behavior is structurally conforming; scenario-41 end-to-end Research/downstream proof is incomplete. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `C15-O09`, `C15-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | `C14-O05`, `C14-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `C12-O16` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `C15-O01`, `C15-O07`, `C15-O12` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | `C14-O03`, `C14-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | `C14-O08`, `DIRECT-FR242` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |

Stable-ledger cardinality: **112 / 112**, missing **0**, duplicate **0**.

Every `POSITIVE_NO_CHANGE` row explicitly consumes its named R1 producer→carrier→consumer evidence and canonical P4-P6 owner. If implementation later disproves such evidence, execution returns upstream; it does not silently broaden T1.

## Package-local atomic technical obligations

| Atom | Factual owner | Exact functional consequence | Solution |
|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim. | `SD01` |
| `PL-C22-01` | C22-F01 | Resolve same-layer precedence/default/override/extension and fitness bindings before productive interpretation. | `SD02` |
| `PL-C02-01` | C02-F01 | Ordinary Create language is Concerns, not raw Concern IDs. | `SD03` |
| `PL-C02-02` | C02-F02 | Linked remediation project is fixed to parent project and not offered as invalid editable choice. | `SD03` |
| `PL-C02-03` | C02-F03/C04-F01 | Created and discovered sources share one productive admission/persistence owner. | `SD04` |
| `PL-C03-01` | C03-F01 | Including archived work expands the candidate set without bypassing project/search filters. | `SD05` |
| `PL-C04-01` | C04-F01 | Source-admission owner is singular across creation/discovery. | `SD04` |
| `PL-C04-02` | C04-F02 | Documentation-Git confirmation shows the exact governed paths/states before commit. | `SD06` |
| `PL-C05-01` | C05-F01 | Exact current attention owner/reason/action remains visible/reachable while other material is inspected. | `SD07` |
| `PL-C06-01` | C06-F01 | Authority-changing input is not sufficient durable authority until a later adopted canonical proposal exists. | `SD08` |
| `PL-C07-01` | C07-F01 | R2 can propose/adopt validated current P2/P3 canonical-owner amendments through the one proposal mechanism. | `SD09` |
| `PL-C08-01` | C08-F01 | DESIGN can propose/adopt validated current P4/P5/P6 canonical-owner amendments through the same mechanism. | `SD09` |
| `PL-C09-01` | C09-F01 | Implementation-required signed task package is materially non-vacuous. | `SD10` |
| `PL-C10-01` | C10-F01 | Readiness dominant verdict is typed R3 outcome. | `SD11` |
| `PL-C11-01` | C11-F01 | Approval presents readiness and package currentness before technical identity. | `SD12` |
| `PL-C11-02` | C11-F02 | Canonical approval identity is trimmed/nonblank at ingress. | `SD12` |
| `PL-C12-01` | C12-F01 | Signed in-task architecture checkpoint is coordinator-executable without provider shell permission. | `SD13` — baseline capability already conforms; no T1 production edit |
| `PL-C12-02` | C12-F02 | Signed `scope`/exclusions remain the hard execution boundary; `changeSurface` is immutable forecast evidence; an in-scope unforecast path may proceed only as minimum same-layer responsibility-preserving decomposition proven through V4/V5/V6, while any semantic expansion returns upstream. | `SD10` — baseline scope/forecast/V4-V6 semantics already conform; no T1 production edit for variance admission |
| `PL-C16-01` | C16-F01 | Settings primary hierarchy is operator readiness/meaning/action, with exact technical identity secondary except task-required. | `SD14` |
| `PL-C16-02` | C16-F02 | Fresh productive install cannot succeed with mandatory repository/account/model setup deferred to Settings. | `SD19` |
| `PL-C16-03` | C16-F03 | P6 must preserve incomplete-v4 recovery capability while forbidding productive installer success at that state. | `SD19` |
| `PL-C18-01` | C18-F01 | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. | `SD15` |
| `PL-C19-01` | C19-F01 | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. | `SD16` |
| `PL-C19-02` | C19-F02/C19-F03 | Recompose the presentation layer from the canonical primitive/theme system and apply one deterministic per-surface datum visibility/disclosure contract: Primary/Supporting/Operational/Technical/Diagnostic classification, default visibility, one disclosure owner and human-meaning-only promotion. Delete old recurring feature-era presentation ownership rather than wrapping it. | `SD21`-`SD29` |
| `PL-C20-01` | C20-F02 | Permanent browser certification proves complete four-kind Research/downstream scenario 41. | `SD17` |
| `PL-C20-02` | C20-F03 | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. | `SD18` |
| `PL-C20-03` | C20-F05/C20-F06 | Exact-candidate rendered acceptance covers every governed screen/state and records independent schema/information, UX/interaction and visual/UI verdicts with no unresolved FAIL; schema/information proof includes required-visible, default-hidden and authorized-post-disclosure assertions so raw technical/diagnostic leakage cannot pass. | `SD30` |

These atoms are the non-stable/package-local obligations that the earlier 22-row concern summary compressed too aggressively. They are downstream of R2 and do not create new permanent P3 identifiers.

## C01-C22 complete technical coverage

| Concern | Technical coverage |
|---|---|
| C01 | Stable rows + explicit A01-NC01/A01-NC02/A01-NC04/A01-NC05 corrected-upstream no-code dispositions; no T1 lifecycle-state delta. |
| C02 | Stable rows + PL-C02-01/02/03 -> SD03/SD04. |
| C03 | Stable rows + PL-C03-01 -> SD05. |
| C04 | Stable rows + PL-C04-01/02 -> SD04/SD06. |
| C05 | Stable current-attention semantics + PL-C05-01 -> SD07; rendered shell/geometry realization -> SD21/SD23/SD24/SD29. |
| C06 | Stable rows + PL-C06-01 -> SD08. |
| C07 | Stable FR096 + PL-C07-01 -> SD09. |
| C08 | PL-C08-01 -> SD09; package technical consequence only. |
| C09 | PL-C09-01 -> SD10. |
| C10 | Stable FR221 + PL-C10-01 -> SD11. |
| C11 | Stable FR222 + PL-C11-01/02 -> SD12. |
| C12 | Stable rows + PL-C12-01 -> SD13 baseline checkpoint capability; PL-C12-02 -> SD10 baseline scope/forecast/V4-V6 capability. The only remaining C12-adjacent T1 work under SD10 is C09-owned SignedTaskBlock non-vacuity, not execution-foundation reimplementation. |
| C13 | Stable rows; positive no technical delta. |
| C14 | Stable rows; positive no technical delta, with SD09 affecting only newly admitted permanent-governance proposal targets. |
| C15 | Stable rows; positive no provider/session technical delta. |
| C16 | `GW-FR-073` global shell account visibility -> SD22; PL-C16-01 operator hierarchy -> SD14 plus Settings management reconstruction SD21/SD28/SD29; PL-C16-02/03 -> SD19; P6 contradiction already corrected in canonical owner. |
| C17 | Stable rows + imported PL-C05-01 -> SD07. |
| C18 | PL-C18-01 -> SD15; presentation-wide responsive/accessibility re-composition -> SD21/SD29/SD30. |
| C19 | PL-C19-01 -> SD16; C19-F02/C19-F03 through PL-C19-02 require foundational primitive/theme reconstruction, exhaustive renderer migration and deterministic per-datum visibility/disclosure realization SD21-SD29; rendered acceptance SD30. |
| C20 | PL-C20-01/02 -> SD17/SD18; C20-F05/C20-F06 through PL-C20-03 -> SD30 rendered acceptance including negative/default-hidden and positive/post-disclosure proof; stable `GW-FR-103` verification gap -> SD20; imported focus/renderer verification SD15/16. |
| C21 | PL-C21-01 -> SD01 plus explicit A01-NC03 corrected-upstream no-code disposition. |
| C22 | Stable dependency rows + PL-C22-01 -> SD02. |

## Detailed data/control flows

### F1 — resolved project authority (SD02)

```text
validated ProjectManifest + shell-expanded reachable authority paths
        -> pure core resolver
        -> selected P1-P6 reachability + exact stable/versioned ref identities
        -> same-layer precedence/default/override/extension + fitness bindings
        -> pinned schema/template + stage policy + explicit upstream/signed refs
        -> daemon applicable material-authority subset
        -> stage/provider context + conformance/sign-off closure
```

Semantic contradiction remains stage-owned. The core resolver supplies exact reachable identity/relation/ordering; lifecycle-context applicability then determines which sources are simultaneously material. A retained version that is only reachable for historical-schema compatibility is not materialized into a current v2 stage unless the pinned schema/template or an explicit governing ref names that version.

### SD02 permanent proof allocation

SD02 does **not** restate the permanent P4 authority-resolution algorithm; `GW-DOC-TECHNICAL-ARCHITECTURE-V2 §35.1` remains its single technical owner. The WorkItem DESIGN owns only the package-specific proof allocation:

- `tests/core.test.ts` proves the pure resolver over already-validated manifest/source inputs: explicit same-layer precedence only, no authority-array/filesystem-order precedence, inherited P1 defaults plus explicit overrides/compatible extensions, direct+rule fitness-gate union, exact stable/versioned ref-to-source identity, retained-source reachability and rejection of structurally unresolved/invalid relations;
- `tests/daemon.test.ts` proves `resolveStageContextState/resolveStageContext` consume that resolved projection and derive the lifecycle-applicable material subset before stage/context/conformance/sign-off dependency construction. A current v2 schema uses current stable owners and does not materialize a retained V1 owner merely because that source is selected/reachable; an historical schema pin or explicit versioned ref materializes the exact retained source. Unresolved applicable authority blocks before provider use;
- `tests/certification.test.ts` proves the **productive production path** rather than a local helper in isolation: a representative real project manifest containing both current and retained semantic versions plus same-layer precedence/default/override/extension inputs reaches the production STAGE context with only the schema/stage-applicable authority material in resolved order. A current-v2 case must exclude unrelated retained V1 material; an exact-version historical case must bind its retained source; an equivalent unresolved simultaneously-applicable relation must fail before any provider turn. The certification must fail if productive context falls back to raw manifest array/filesystem order, include-every-selected-source projection, or provider interpretation.

The certification assertion is a known SD02 obligation. It is owned by the SD02 implementation action that integrates the resolver into productive context; it must not be deferred to generic cross-solution regression closure.

### F2 — permanent authority proposal/adoption (SD09)

```text
R2/DESIGN provider proposal
 -> existing ARTIFACT_PROPOSAL_CREATED
 -> stage-specific canonical target/layer admission
 -> one pending proposal review
 -> explicit ADOPT
 -> re-resolve current target + base hash
 -> exact patch + immutable ArtifactRef
 -> existing freshness/context invalidation
```

R2 targets only current P2/P3 owners; DESIGN only P4/P5/P6. No P1 mutation, no new proposal DTO/state machine.

### F3 — durable decision input (SD08)

```text
durable HUMAN_INPUT_REQUESTED
 -> HUMAN_INPUT_RECEIVED (input/evidence only)
 -> governed lifecycle/permanent-authority proposal
 -> explicit adoption
 -> later stage completion admitted
```

Ordinary INFORMATION/EVIDENCE continuation is unchanged.

### F4 — signed checkpoint (SD13)

```text
BUILDER turn -> GATE_CHECKPOINT_REQUESTED(gateId)
 -> coordinator validates signed task/gate/freshness
 -> existing validation effect in current builder workspace
 -> existing GATE_PASSED/GATE_FAILED evidence
 -> same Run/session next provider turn
```

No ambient provider shell, no second gate registry/state, no substitution for V3/V5/V7.

### F5 — singular source admission (SD04)

```text
UI create -> write/read validated source --+
                                         +-> one new-source QueuePlan -> existing applyPlan
repository discovery --------------------+
```

`origin=CREATED|DISCOVERED` remains provenance only.

### F6 — Workbench presentation reconstruction (SD05-SD07, SD11-SD18, SD21-SD30)

Canonical daemon facts are projected once; browser selection never becomes workflow authority. Include-archived selects a dataset before project/search filtering. Historical/supporting material selection never hides current attention. Readiness/Approval/Settings/product labels/focus are projections of existing typed state.

The presentation path is reconstructed in dependency order:

```text
canonical browser/domain/query facts
 -> SD21 purge old design-bearing Workbench foundation
 -> SD21 fresh WorkbenchAppShell + WorkbenchWorkItemShell + shared responsive owner + reconstructed composition primitives
 -> SD21 foundation acceptance gate
 -> SD22 application shell/Queue/Create services
 -> SD23 WorkItem shell + Work request/document
 -> SD24 Research/Requirements/Design/Plan shared productive-stage grammar
 -> SD25 Readiness/Approval review grammar
 -> SD26 Implementation master/detail
 -> SD27 Complete/Evidence/Context
 -> SD28 Settings/account/configuration
 -> SD29 primitive-owned responsive/accessibility recomposition
 -> SD16/SD17/SD18 semantic certification
 -> SD30 exact-candidate rendered acceptance
```

No domain renderer owns recurring component chrome, structural breakpoint policy, generic form/table/status/notice grammar or overlay topology after migration. The old design-bearing primitive layer and its structural selectors/tests are purged before fresh foundation authorship; later old screen selectors/branches are deleted at their owning screen purge. Neither layer may retain a compatibility presentation path.

### F6A — Workbench foundation reconstruction (SD21)

```text
current P3 information hierarchy + interaction classes + reviewed new-design references
 -> classify primitive responsibilities
 -> retain only proven atomic semantic/foundation adapters
 -> PURGE implementation checkpoint (not a Git commit):
      old WorkbenchLayout
      + 19 other design-bearing composition primitive implementations
      + their structural selectors
      + implementation-specific geometry assertions
      + no replacement primitive JSX
 -> fresh foundation composition schema
 -> WorkbenchAppShell (one root application chrome)
 -> WorkbenchWorkItemShell (one selected-WorkItem chrome)
 -> one workbench-responsive owner
 -> fresh app.tsx root-shell/destination integration
 -> fresh WorkItemWorkspace / IdentityRow / WorkflowRail / WorkflowStepFrame shell integration
 -> reconstructed Toolbar / Identity / Rail / Surface / Attention /
    Dialogue / Review / MasterDetail / Context / Settings / Form /
    Selector / TaskPanel / Table / Timeline / ResourceRow / SectionHeader
 -> foundation architecture + theme + accessibility + responsive + rendered acceptance
 -> admit SD22-SD28 screen reconstruction
```

This is one ordered implementation phase inside the single signed 0.6.0 task. Its purge checkpoint is a procedural in-task boundary, not a purge-only candidate or Git commit: the old foundation/shell implementation is removed and observed before replacement authorship, then the fresh foundation is completed and accepted before IA28 begins. Because the old `WorkbenchLayout` API is deleted, its application/selected-WorkItem shell consumers are destructively cut over in the same phase; no compatibility facade or temporary second shell is permitted. The existing primitive directory, class names, DOM hierarchy, component APIs, structural CSS and implementation-specific tests are evidence only. A reconstructed component may reach a superficially similar result only when current P3/P4 authority and the reviewed new-design references independently require it.

### F7 — productive installer closure (SD19)

```text
install.sh bootstrap
 -> src/installer.ts staged install
 -> configureOrder
 -> runInstallerGuidedSetup
 -> existing private OpenCode login/model selection
 -> existing exact target-repository/reference collection
 -> canonical config writer
 -> service activation + health proof
 -> success
```

The former fresh `configured === null` success/defer branch in `runGuidedSetupInternal` is removed/replaced so the existing later guided path executes. Incomplete config v4 remains a canonical daemon/Settings recovery state and may exist transiently during rollback-safe install, but productive installer success cannot terminate on it. Update/migration retention/rollback paths are unchanged.

### F8 — exact-pin OpenCode deterministic simulation certification (SD20)

```text
permanent PR verification
 -> exact OpenCode 2.2.6 CLI/server
 -> Order production OpenCode environment/admission/session path
 -> isolated opencode-drive 2.4.1 simulation controller
 -> deterministic model/tool responses
 -> exact session/permission/turn/diagnostic assertions
```

The real OpenCode process remains the subject under test; only the model side is simulated. Fake OpenCode executables continue to serve lower-level deterministic fixtures and are never counted as exact-pin integration evidence. The Drive/Effect tooling is installed into CI-owned temporary verification space, not Order's package graph, release bundle, runtime state or product configuration. Simulation evidence is explicitly limited to the process/protocol behavior it exercises and cannot be reused as proof of remote provider availability, Console OAuth connectivity or model quality.


## Exact implementation surface forecast

The corrected DESIGN forecast is the exact `changeSurface` of the one signed cumulative implementation task: **66 unique paths**. The increase from the superseded 43-path package is exactly the 20 destructive design-bearing primitive paths plus three new cohesive foundation owners. Positively retained atomic primitives and retained non-screen UI helpers remain outside the forecast.

### Non-UI production
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/stage.ts`
- `src/daemon/work-item-source.ts`
- `src/shell/setup.ts`

### UI foundation destructive reconstruction surface
- `ui/src/primitives/WorkbenchAttention.tsx`
- `ui/src/primitives/WorkbenchContextPanel.tsx`
- `ui/src/primitives/WorkbenchDialogue.tsx`
- `ui/src/primitives/WorkbenchForm.tsx`
- `ui/src/primitives/WorkbenchIdentity.tsx`
- `ui/src/primitives/WorkbenchLayout.tsx` — delete; no same-API recreation
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
- `ui/src/primitives/WorkbenchState.tsx`
- `ui/src/primitives/WorkbenchUtilityLink.tsx`
- `ui/src/primitives/WorkbenchAppShell.tsx` — new
- `ui/src/primitives/WorkbenchWorkItemShell.tsx` — new
- `ui/src/primitives/workbench-responsive.ts` — new

### UI production replacement/purge surface
- `ui/src/ActivityComposer.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/OpenCodeAccountControl.tsx`
- `ui/src/OpenCodeAccountSettings.tsx`
- `ui/src/PreSignoffStageWorkspace.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/RunEventTimeline.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/WorkItemIdentityRow.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkflowMaterialSelector.tsx`
- `ui/src/WorkflowRail.tsx`
- `ui/src/WorkflowStepFrame.tsx`
- `ui/src/app.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`

### Verification
- `tests/browser.spec.ts`
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/installer.test.ts`
- `tests/opencode.test.ts`
- `tests/workbench-presentation.test.ts`

### Permanent verification infrastructure
- `.github/workflows/ci.yml`

### Delivery metadata
- `CHANGELOG.md`

### Explicit retained UI paths outside changeSurface

- `ui/src/primitives/WorkbenchAction.tsx`, `WorkbenchConfirmation.tsx`, `WorkbenchDisclosure.tsx`, `WorkbenchField.tsx`, `WorkbenchIcon.tsx`, `WorkbenchNotice.tsx`, `WorkbenchStatus.tsx` — positively revalidated atomic adapters only; no region/topology/responsive ownership;
- `ui/src/MarkdownEditor.tsx` and `ui/src/MarkdownSourceEditor.tsx` — approved specialized content/editor leaves;
- `ui/src/workbench-presentation.ts` — pure presentation-policy mapping owner;
- `ui/src/http.ts`, `ui/src/query-keys.ts`, `ui/src/markdown-source-formatting.ts`, `ui/src/theme.ts`, `ui/src/main.tsx` — non-screen infrastructure/helpers.

Same-layer decomposition outside this exact forecast is not automatically authorized. IA27 owns the complete authorized structural-foundation mutation. Later screen phases may not use V4/V5/V6 variance to mutate the retained atomic adapters or reconstructed foundation merely because doing so would simplify a screen; a newly discovered foundation responsibility/semantic defect returns to DESIGN/PLAN.

## Contract/state/persistence/transport consequences

- No WorkStage/status/outcome/ArtifactRole/task-state/persistence-table/public-HTTP family is added.
- Existing proposal, HumanInput, SignedTaskBlock, Approval, Run/RunEvent and validation representations remain the single owners. The current baseline already carries SD13's typed BUILDER checkpoint request and SD10's scope/forecast/V4-V6 execution semantics; T1 adds no parallel execution representation. The remaining SD10 change adds only schema-version-aware non-vacuity admission over the existing parsed SignedTaskBlock and does not mutate the canonical task shape.
- No new runtime concept is introduced by SD10/SD13 during T1; the transient resolved-authority projection and typed BUILDER checkpoint request are existing baseline capabilities.
- SD19 changes no OrderConfig schema. It changes only when the productive installer is allowed to return success.
- No product/runtime dependency is added. SD20 uses exact `opencode-drive@2.4.1` and `effect@4.0.1` only as isolated permanent-CI verification tooling outside `package.json`/lockfiles and outside the release/runtime dependency graph.

## Failure and recovery

- invalid/unresolved authority relation -> owning pre-signoff stage blocks before productive inference;
- stale/wrong governance proposal -> reject/reconcile through existing proposal owner;
- durable decision with no later adopted authority -> stage remains blocked;
- vacuous current-v2 Change/Defect task package / blank Approval identity / unsigned checkpoint -> reject at the owning canonical admission boundary; retained v1 task validation semantics are unchanged;
- checkpoint failure -> only signed-scope correction or explicit block;
- source-admission conflict -> existing QueuePlan/source diagnostics/recovery;
- installer setup cancellation/provider/model/repository failure -> installer fails and existing rollback restores prior installation/config/service state; fresh install does not claim success;
- any implementation discovery requiring a new semantic owner, public contract, state meaning, persistence/transport or effect boundary, dependency direction/external dependency, validation contract, authorized behavior, or a path outside signed scope/exclusions -> return to DESIGN/PLAN; an in-scope path absent only from `changeSurface` is not itself an upstream-return condition and instead follows the governed V4/V5/V6 minimum-same-layer variance proof.

## Rejected alternatives

- treating concern membership as a requirement-level delta — rejected by G-F10;
- generic `NO_CODE / IA24` without positive realization evidence — rejected;
- granting BUILDER shell to satisfy checkpoints — rejected;
- new proposal/task/source/readiness/config DTO/service/state models — rejected;
- preserving deferred-Settings fresh-install success because current P6/code did so — rejected by higher P3/P4 authority; P6 is corrected;
- changing OrderConfig schema to solve FR007 — unnecessary; existing incomplete-config state remains useful for recovery;
- modifying `src/installer.ts` preemptively — unnecessary under current evidence because it already calls the canonical guided setup owner; if SD19 cannot be realized solely in `src/shell/setup.ts`, return to DESIGN rather than broadening scope;
- modifying `tests/architecture.test.ts` merely to bless the old presentation — rejected; pre-sign-off campaign fitness may update stale structural enumerations only after corrected DESIGN/PLAN requires it.
- screen-by-screen CSS tuning on the existing presentation foundation — rejected by P4 structural remediation boundary and C19-F02.
- preserving the current design-bearing primitive implementation as the substrate for new screens — rejected. P3/P4 responsibility is authoritative, not current primitive bytes; SD21 destructively reconstructs the structural/compositional foundation before screen work.
- allowing later screen phases to redesign reconstructed foundation primitives — rejected. Foundation design and implementation are completed under SD21/IA27; later defects return to that owner or upstream DESIGN rather than being patched locally.
- retaining feature-era screen/component/layout CSS behind higher-specificity primitive overrides or hidden compatibility DOM — rejected; old screen presentation support is purged before replacement.

## Open technical questions

NONE **after the C19-F03/C20-F06 amendment and the exhaustive 37-surface information contract embedded in this `solution-design.md` above**. The post-IA31 audit proved that a family-level matrix alone did not determine field-level visibility/disclosure. P3/R2 own the semantics; the dedicated 37-surface DESIGN contract now closes the datum/action-level classification, placement, disclosure, promotion and negative-rendering decisions before PLAN/implementation. SD21-SD30 bind realization and proof.

Every stable requirement and every material package-local outcome now has an explicit technical realization/no-change/verification disposition. The corrected UI scope is SD21-SD30: destructively reconstruct and certify the shared Workbench composition foundation first; destructively replace every consuming screen family second; semantic/rendered certification last. PLAN must preserve domain/state semantic owners and only the positively retained atomic adapters, while requiring purge-before-fresh-authorship for both the compromised foundation and the superseded screen implementations. Incremental structural or screen migration is prohibited.
