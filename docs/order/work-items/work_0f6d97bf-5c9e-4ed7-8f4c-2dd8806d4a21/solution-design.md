<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Order 0.6.0 integrated technical solution design

## Exact design basis

This DESIGN is reconstructed under G-F12 after G3 closure. Its semantic direction is canonical authority -> current R1 facts -> current R2 functional consequences -> explicit package technical realization. Current implementation/tests are realization evidence only and never supply missing design semantics.

- R1 `research.md`: blob `d2eb1627e2b9a145f785b04829b56c623b7431e9` — G-F12 factual package plus post-closeout rendered-evidence findings C19-F02/C20-F05. The first exact-candidate Queue/Create capture proves the Workbench presentation migration is incomplete; current UI remains defect evidence, not desired-state authority.
- R2 `requirements.md`: blob `6bea86efd799e08cb63849d528cfca24e98d283e` — functional package unchanged in product semantics but now explicitly binds the rendered-evidence consequence: every UI domain must realize the already-defined Primary/Supporting/Technical hierarchy and canonical interaction class through one Workbench language; semantic/browser assertions alone cannot prove rendered fulfillment.
- Corrected P3 Installation Readiness: blob `9c2ec83a9552b7583f90e91080c014df4d6870df` — §§2/4.2 and `GW-FR-079` now distinguish successful fresh-install completion from post-install/update recovery without adding `precedence.p3`.
- P4 Technical Architecture: `868a73535b080bfeb5519865ffe21bad754315a3` — §35.1 now explicitly separates reachable authority selection from stage-material applicability for stable/versioned refs.
- P4 Workbench: `36b5628f5d54d168aed25f0af71226114266068a`.
- P4 Workbench Theme: `ec4c59408485d86e7c64802fed983e2072d063b9`.
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

The 25 package-local atoms remain the exact non-stable corrections and the SD01-SD20 catalog remains the delta/verification solution set. The reconstruction adds no new product behavior and no new implementation solution. It makes explicit the technical realization that all those rows consume.

### Post-A09 authority revalidation

R1 `C16-F04` and R2's adopted Installation Readiness blob `9c2ec83a9552b7583f90e91080c014df4d6870df` remove the same-layer P3 ambiguity before technical design is evaluated.

- FR007 remains the canonical successful fresh-install completion requirement.
- Corrected FR079 now owns readiness/recovery semantics without permitting successful fresh-install completion while mandatory setup remains.
- SD19 remains the minimum technical realization: one installer-owned setup flow, one canonical configuration/provider owner, no second readiness state, and post-install/update recovery preserved in the existing Settings/daemon path.
- No new P4/P5/P6 decision is required by `C16-F04`; the previous SD19 direction is retained because it now traces to non-contradictory P3 authority rather than because implementation/P4/P6 happened to converge on it.

### G-F12 DESIGN closure decision — corrected after rendered-evidence revalidation

The previous DESIGN closure incorrectly treated the Workbench presentation foundation as already conforming. C19-F02/C20-F05 disprove that implementation assumption without changing R2 product semantics. This corrected DESIGN therefore distinguishes **semantic preservation** from **presentation replacement**:

- canonical lifecycle/domain/query/daemon/persistence/provider owners remain unchanged unless another existing SD explicitly changes them;
- the browser presentation layer is **not** preserved as a baseline: P4 already requires architecture-preserving re-composition around the closed Workbench primitive/theme system and deletion of superseded feature-era presentation mechanisms;
- every applicable work kind and workflow step retains the R2 information/interaction contract, but its renderer must be migrated onto the exact interaction class and primitive composition in P4 §8.15;
- the application shell, Queue/Create, WorkItem shell, pre-signoff Document/Dialogue/Review surfaces, Approval, Implementation, Complete, Context, Evidence and Settings are all covered by explicit technical solutions below;
- responsive/accessibility/theme behavior is designed as primitive-owned composition, not feature-specific shrink/wrap logic;
- old feature-owned recurring form/table/status/notice/overlay/layout styling is deleted as each domain migrates; compatibility wrappers, hidden old DOM, duplicate CSS systems and local override patches are prohibited;
- exact-candidate rendered acceptance supplements semantic/browser certification and is required before final closeout;
- existing canonical P4-P6 owners remain singular. No LOCAL technical authority, DTO/model/service layer, alternate workflow state, alternate task/proposal model or new runtime dependency is introduced;
- open technical questions: NONE;
- material technical UNPROVEN: 0 **after** SD21-SD30 below are included as binding DESIGN;
- PLAN must implement SD21 before domain migrations SD22-SD29, then permanent certification/SD30; it may not tune individual screens on the superseded presentation foundation.

#### UI reconstruction preservation boundary

The following are preserved and must not be redesigned by UI implementation:

- `src/core/lifecycle.ts` lifecycle/current-attention/material/recovery/rail decisions;
- WorkItem/ArtifactRef/Run/RunEvent/Approval/ExecutionTask canonical contracts and persistence;
- daemon/API/TanStack Query producer→carrier→consumer ownership;
- WorkItem schema/kind information obligations and stage-specific document semantics;
- proposal/adoption, sign-off, execution and provider admission/recovery behavior;
- exact source/Markdown/Git ownership and stale-write/freshness rules.

The following are replaced/re-composed:

- primitive implementations and their recurring geometry/presentation;
- `theme.css` feature-era recurring visual/layout ownership;
- application shell/toolbar/Queue/Create composition;
- every renderer in the canonical P4 renderer matrix plus the identity/rail/material-selector adapters that feed primitive composition;
- responsive composition and cross-service theme parity;
- old presentation branches/selectors whose responsibility is now primitive-owned.

## Technical change solution catalog

| Solution | Owned defect/outcome | Canonical technical owner | Expected implementation surface | Technical decision | Permanent proof |
|---|---|---|---|---|---|
| SD01 | C21 product-language realization | P2 Product Identity + P4 Workbench presentation | README.md; ui/src/TerminalResult.tsx; ui/src/workbench-presentation.ts | Use verified result as umbrella product outcome and Verified candidate only for executed delivery; reuse the canonical P4 terminal-result projection and replace local enum prettification; no lifecycle/state/contract change. | tests/workbench-presentation.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| SD02 | C22 authority resolution and stage materiality | GW-DOC-LIFECYCLE-CONTEXT-V2 + GW-DOC-TECHNICAL-ARCHITECTURE-V2 §35.1 + GW-DOC-OPENCODE-INTEGRATION-V1 | src/core/governance.ts; src/daemon/authority.ts; src/daemon/stage.ts | Reuse the permanent P3/P4 contract: pure same-layer precedence plus P1 default/override/extension/fitness resolution over the reachable authority graph, then derive the stage-material subset from pinned schema/template, mandatory stage policy and explicit upstream/signed refs. Stable refs select current owners; explicit versioned refs select exact retained snapshots. Retained versions must remain reachable without entering an unrelated current-schema context. Unresolved material relation blocks before inference. | tests/core.test.ts; tests/daemon.test.ts; tests/certification.test.ts — exact propositions below |
| SD03 | C02 authoring presentation | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/CreateWorkItem.tsx | Ordinary label is Concerns; linked remediation project is fixed parent-project context. Preserve canonical kind/schema/body/metadata owners. | tests/browser.spec.ts |
| SD04 | C02/C04 singular source admission | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/daemon/work-item-source.ts | Factor one new-source QueuePlan producer and persist both created/discovered sources through existing applyPlan; remove direct create-path WorkItem store. | tests/daemon.test.ts |
| SD05 | C03 archived queue filtering | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/app.tsx; ui/src/WorkItemQueue.tsx | App selects active/include-archived canonical dataset then applies project/search once; queue does not replace filtering semantics. | tests/browser.spec.ts |
| SD06 | C04 documentation-Git exact review | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | ui/src/DocumentWorkspace.tsx | Render exact canonical changed-path/state set in confirmation before existing bounded commit command; no second Git-status owner. | tests/browser.spec.ts |
| SD07 | C05/C17 current-attention visibility | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ActivityWorkspace.tsx; ui/src/WorkItemWorkspace.tsx; ui/src/workbench-presentation.ts | Keep historical/supporting inspection while exact higher-priority current owner/reason/action remains visible and directly reachable; do not create browser workflow state. | tests/workbench-presentation.test.ts; tests/browser.spec.ts |
| SD08 | C06 durable authority-changing input | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/lifecycle.ts; src/daemon/stage.ts | After answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, stage completion requires later adopted canonical authority; INFORMATION/EVIDENCE unchanged. | tests/core.test.ts; tests/daemon.test.ts |
| SD09 | C07/C08 permanent authority proposal/adoption | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/contracts.ts; src/core/governance.ts; src/daemon/authority.ts; src/daemon/stage.ts | Extend the one proposal/adoption owner: R2 admits current P2/P3 targets; DESIGN current P4/P5/P6 targets; re-resolve role/layer/path/base hash before adoption. No new proposal model. | tests/core.test.ts; tests/daemon.test.ts |
| SD10 | C09 signed task contract, non-vacuity and execution-surface semantics | GW-DOC-CANONICAL-CONTRACTS-V2 + GW-DOC-SPECIFICATION-STANDARD | **Remaining T1 delta:** src/core/execution.ts; src/daemon/stage.ts; src/daemon/authority.ts. **Baseline reuse/no T1 edit for execution-foundation semantics:** src/daemon/execution.ts; src/daemon/validation.ts; src/shell/opencode.ts | Keep the one canonical `SignedTaskBlockSchema` and existing `parseSignedTaskBlockFromPlan` structural parser unchanged so published `change-v1`/`defect-v1` semantics are not silently reinterpreted. Add one pure schema-aware task-admission function over the already parsed `SignedTaskBlock`: for `change-v2`/`defect-v2` only, enforce P6 §37.4 (non-empty tasks; trimmed non-empty id/objective; non-empty scope/acceptance/changeSurface/gates/authority/concerns); for v1, preserve the historical contract. The existing PLAN/R3 prompt contract in `src/daemon/stage.ts` must become schema-aware and state the same v2-only non-vacuity clauses in addition to the unchanged shared JSON Schema, so authoring and deterministic admission agree. The existing PLAN semantic conformance questions remain the owner of **material** task sufficiency: each task must trace upward/downward and close objective/dependencies, module ownership/decomposition, required architecture-feedback checkpoints, production/test surfaces, deletions/replacements, completion evidence, minimum-change forecast and verification contract without delegating a P1-P6 decision. R3 independently challenges complete bidirectional P1-P7 traceability/current readiness. PLAN conformance must call the v2-aware mechanical admission, and R3/sign-off `validateTaskDefinitions` must call the same owner so a syntactically vacuous v2 package cannot bypass those semantic reviews. No second task DTO/schema/parser or second semantic-review owner is introduced. The corrected baseline already owns signed scope/exclusions as the hard repository boundary, changeSurface as immutable forecast, V2 true-boundary rejection, V4/V5/V6 minimum same-layer variance review and coordinator-owned V6 CHANGE_BLOAT; T1 must reuse rather than reimplement those semantics. | tests/core.test.ts proves v1 parse/admission compatibility plus v2 non-vacuity positives/negatives; tests/daemon.test.ts proves v2 PLAN and READY_FOR_SIGNOFF/sign-off rejection cannot bypass the rule; tests/certification.test.ts binds the singular schema-aware admission/prompt path and rejects a duplicate task schema/parser |
| SD11 | C10 Readiness judgment | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ReadinessWorkspace.tsx; ui/src/workbench-presentation.ts | Dominant verdict derives from typed R3 completion outcome; material maturity/currentness is supporting state. | tests/workbench-presentation.test.ts; tests/browser.spec.ts |
| SD12 | C11 Approval identity and hierarchy | GW-DOC-CANONICAL-CONTRACTS-V2 + GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | src/core/contracts.ts; src/daemon/authority.ts; ui/src/SignoffReview.tsx | Trim/reject blank approvedBy at canonical ingress and show readiness/currentness before technical package identity; browser validation remains feedback. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts |
| SD13 | C12 signed in-task checkpoint | GW-DOC-EXECUTION-CONTROL-PLANE-V1 + GW-DOC-CANONICAL-CONTRACTS-V2 | **Baseline capability already integrated; no T1 production edit:** src/core/contracts.ts; src/core/execution.ts; src/daemon/execution.ts; src/daemon/validation.ts; src/shell/opencode.ts | Current baseline satisfies P6 §37.6: BUILDER alone may request exactly one signed-task gate checkpoint as terminal turn action; the coordinator verifies freshness/signed gate/current V2 scope before effect, executes the existing gate owner, records GATE_PASSED/GATE_FAILED evidence and continues the same Run/provider session; provider shell/execute remains denied. Final PLAN may schedule/use this capability but must not bootstrap or reimplement it. | existing tests/core.test.ts; tests/daemon.test.ts; tests/certification.test.ts are baseline proof; final PLAN may add only task-specific usage/cadence proof where required |
| SD14 | C16 Settings hierarchy | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/SettingsWorkspace.tsx | Keep one canonical Settings/config owner but demote exact roots/endpoints/credential-like identities to Technical details except active configuration input. | tests/browser.spec.ts |
| SD15 | C18 required-input focus | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ActivityComposer.tsx; ui/src/ActivityWorkspace.tsx | Focus Workbench-owned composer once for each newly current required-input event id; rerender/polling does not refocus; no private Astryx DOM policy. | tests/browser.spec.ts |
| SD16 | C19 exhaustive renderer fitness | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | tests/certification.test.ts | Under immutable architecture-gate material rule, add exhaustive production-renderer classification proof to existing test gate, including ActivityComposer; do not mutate tests/architecture.test.ts inside T1. | tests/certification.test.ts |
| SD17 | C20 scenario-41 certification | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | tests/browser.spec.ts | Certify all four work-kind Work request + Research information contracts and distinct Change/Defect downstream obligations. | tests/browser.spec.ts |
| SD18 | C20 component/theme parity certification | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 | tests/browser.spec.ts; tests/workbench-presentation.test.ts | Certify representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay semantic roles under System/Light/Dark. | tests/browser.spec.ts; tests/workbench-presentation.test.ts |
| SD19 | C16 guided productive installer | corrected P3 `GW-FR-007` + `GW-FR-079`; GW-TR-007-GUIDED-PRODUCTIVE-BOOTSTRAP + corrected GW-DOC-CANONICAL-CONTRACTS-V2 | src/shell/setup.ts; new tests/installer.test.ts | Remove fresh-install success/defer branch. `runInstallerGuidedSetup` reuses existing login/model/repository/reference collection and returns success only after productive choices and daemon/readiness conditions exist. Preserve incomplete v4 as post-install/update daemon/Settings recovery state and preserve update/migration/rollback behavior. No config schema or installer-orchestrator duplication. | new tests/installer.test.ts; tests/order-migration.test.ts |
| SD20 | C20 exact-pin OpenCode integration certification | `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE`; `GW-TR-079-OPENCODE-INSTRUCTION-BOUNDARY-CERTIFICATION`; `GW-DOC-EXTERNAL-FACTS` | `tests/opencode.test.ts`; `.github/workflows/ci.yml` | Add one permanent verification-only exact-pin tier: CI installs isolated `opencode-drive@2.4.1` + `effect@4.0.1` tooling outside Order's package/runtime dependency graph; the test launches the actual supported OpenCode `2.2.6` process through Order's production OpenCode shell/session boundary and drives deterministic model responses through the simulation provider/controller. Existing fake OpenCode fixtures remain fast unit/shell/daemon doubles only and cannot satisfy the exact-pin proposition. No production source, runtime dependency, config/state model or alternate provider path is introduced. | permanent exact-pin integration case in `tests/opencode.test.ts`, executed by PR verification; existing fake/adversarial tests remain complementary |
| SD21 | C19-F02 foundational Workbench reconstruction | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 | `ui/src/primitives/*.tsx`; `ui/src/theme.css`; `ui/src/styles.css` | Rebuild the closed primitive/theme layer as the sole recurring structural/visual owner. Use pinned Astryx substrates/public props/tokens first; Order CSS owns only residual canonical geometry/semantics. Primitive APIs remain narrow/domain-blind and may be internally rewritten. Delete feature-era recurring component/layout CSS and duplicate/obsolete presentation systems rather than aliasing them. No compatibility presentation path survives. | architecture/certification ownership tests; primitive browser harness; rendered evidence |
| SD22 | C02/C03 application shell + Queue/Create realization | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C02/C03 | `ui/src/app.tsx`; `ui/src/WorkItemQueue.tsx`; `ui/src/CreateWorkItem.tsx`; toolbar/task/form/table primitives | Queue becomes exact Operational scan composition; normal/empty/search/archive/readiness/source-diagnostic states remain distinct. Create/remediation becomes TaskPanel→Form/configuration with task title/context, controlled Project/kind/Concerns, human title, derived metadata/supporting context and one primary action. No generic legacy queue page/form grammar. | browser functional matrix + Queue/Create rendered SVG comparisons |
| SD23 | C04/C05 WorkItem shell + Work request/document realization | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C04/C05/C17 | `ui/src/WorkItemWorkspace.tsx`; `WorkItemIdentityRow.tsx`; `WorkflowRail.tsx`; `WorkflowStepFrame.tsx`; `DocumentWorkspace.tsx`; Markdown renderers; Identity/Rail/Surface/Attention primitives | Recompose selected WorkItem around one stable shell: application toolbar, identity, nine-step rail, current-attention band, one primary material canvas and optional Context. Work request is a Document-class surface with source intent primary and technical/source metadata subordinate. Remove old generic-frame/feature layout responsibility that competes with primitive geometry. | browser geometry/current-attention/source cases + Work request/SVG rendered review |
| SD24 | C06/C07/C08/C09 pre-signoff productive-stage family | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 productive interaction contract | `PreSignoffStageWorkspace.tsx`; `ActivityWorkspace.tsx`; `ActivityComposer.tsx`; `WorkflowMaterialSelector.tsx`; `ProposalReview.tsx`; `RunEventTimeline.tsx`; Dialogue/Selector/Review/Timeline primitives | Research, Requirements, Solution design and Implementation plan share one stable Surface/Attention/Selector grammar. Current dialogue/question/proposal/blocker owns attention; current document is primary otherwise; history/evidence/activity is subordinate. Stage-specific information differs without creating stage-specific layout systems. | stage interaction/browser matrix + per-step rendered SVG/state review |
| SD25 | C10/C11 Readiness + Approval review realization | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C10/C11 | `ReadinessWorkspace.tsx`; `SignoffReview.tsx`; Review/Disclosure/Status/Action/Form primitives | Both are Review-class compositions, not generic stage frames. R3 verdict/findings/return owner dominate Readiness. Approval readiness/currentness/task meaning dominate package review; hashes/identity remain technical/on-demand. Sign-off remains the sole primary mutation. | browser verdict/currentness/sign-off cases + Readiness/Approval SVG review |
| SD26 | C12 Implementation operational master/detail | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C12 | `ExecutionWorkspace.tsx`; `RunEventTimeline.tsx`; MasterDetail/Surface/Attention/Table/Timeline/Status primitives | Wide Implementation uses the single fixed master/detail topology; selected task detail shows current owner/action, attempt, blocker, validation and chronology. Historical selection never steals current attention. Medium/narrow use the primitive-owned start Drawer; no stacked/card alternative. | execution browser matrix + Implementation/task-state SVG review |
| SD27 | C13/C14 Complete + Evidence + Context/material realization | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C13/C14 | `TerminalResult.tsx`; `EvidenceViewer.tsx`; `WorkItemContext.tsx`; resource/status/surface/context primitives | Complete is Terminal-result class with canonical outcome primary, candidate resources only when applicable, and linked remediation as separate authoring action. Evidence is Evidence-class surface. Context is secondary diagnostic/supporting material only, docked wide and Drawer constrained. | terminal/material browser cases + Complete/Evidence/Context rendered review |
| SD28 | C15/C16 Settings/account/configuration presentation | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + R2 C15/C16 | `SettingsWorkspace.tsx`; `OpenCodeAccountControl.tsx`; `OpenCodeAccountSettings.tsx`; SettingsLayout/Form/Table/Status/Notice/Confirmation primitives | Settings is operator-first configuration: readiness/meaning/actions primary, technical identity disclosed/on-demand unless task-required. Account/repository/model controls use the same form/action/status language as Create; no admin-page cards or bespoke account grammar. | Settings/account browser cases + Settings SVG review |
| SD29 | C18 responsive/accessibility/focus re-composition | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 | all structural primitives + affected renderer composition; no feature breakpoint ownership | Wide/medium/narrow behavior is owned once by Layout/Rail/Selector/MasterDetail/Context/Dialogue/Settings primitives. Preserve semantic order/action ownership/focus return/dirty state. Required-input focus-once remains SD15. Delete feature-level responsive topology rules that duplicate primitive ownership. | wide/medium/narrow browser matrix + responsive SVG rendered review |
| SD30 | C20 rendered and semantic UI acceptance | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 + R2 C20 | `tests/browser.spec.ts`; `tests/certification.test.ts`; `.github/workflows/ci.yml` | Keep semantic/architecture/browser certification, add exact-candidate rendered evidence for every governed surface/state. GitHub Actions produces PNG+manifest/index; review records independent schema/information, UX/interaction and visual/UI verdicts against current authority plus reviewed SVG where not superseded. A FAIL blocks closeout and requires fresh post-fix evidence. | permanent CI evidence artifact + zero unresolved rendered acceptance FAIL |

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
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
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
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
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
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD11`, `SD12`, `SD14` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | General geometry remains; Readiness, Approval and Settings local hierarchies must stop promoting maturity/technical identity over the governed judgment/action. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Shared interaction grammar remains; current-attention visibility must remain continuous through explicit material selection. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `VIOLATES` | `TECHNICAL_DELTA` | `SD11` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Typed R3 outcome becomes dominant Readiness verdict; maturity/currentness remains supporting state. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD12` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Package/task semantics remain; readiness/currentness becomes primary before technical identity. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `C13-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Permanent certification must add required-input focus, renderer completeness, scenario-41 and cross-application theme/component parity coverage. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `MIXED` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD11`, `SD12`, `SD14`, `SD16` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Canonical component/theme system remains; local information-hierarchy violations and missing exhaustive renderer fitness are corrected. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `CONFORMS_WITH_VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD16` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Current presentation behavior is positively conforming; exhaustive renderer-to-primitive certification is incomplete. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `CONFORMS_WITH_VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD18` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Theme behavior is positively conforming; required representative cross-application parity certification is incomplete. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
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
| `PL-C20-01` | C20-F02 | Permanent browser certification proves complete four-kind Research/downstream scenario 41. | `SD17` |
| `PL-C20-02` | C20-F03 | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. | `SD18` |

These atoms are the non-stable/package-local obligations that the earlier 22-row concern summary compressed too aggressively. They are downstream of R2 and do not create new permanent P3 identifiers.

## C01-C22 complete technical coverage

| Concern | Technical coverage |
|---|---|
| C01 | Stable rows + explicit A01-NC01/A01-NC02/A01-NC04/A01-NC05 corrected-upstream no-code dispositions; no T1 lifecycle-state delta. |
| C02 | Stable rows + PL-C02-01/02/03 -> SD03/SD04. |
| C03 | Stable rows + PL-C03-01 -> SD05. |
| C04 | Stable rows + PL-C04-01/02 -> SD04/SD06. |
| C05 | Stable rows + PL-C05-01 -> SD07. |
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
| C16 | Stable rows + PL-C16-01 -> SD14; PL-C16-02/03 -> SD19; P6 contradiction already corrected in canonical owner. |
| C17 | Stable rows + imported PL-C05-01 -> SD07. |
| C18 | Stable FR225 + PL-C18-01 -> SD15. |
| C19 | Stable rows + PL-C19-01 -> SD16; local hierarchy dependencies SD11/12/14. |
| C20 | Stable rows + PL-C20-01/02 -> SD17/SD18; stable `GW-FR-103` verification gap -> SD20; imported focus/renderer verification SD15/16. |
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

### F6 — queue/presentation (SD05-SD07, SD11-SD15)

Canonical daemon facts are projected once; browser selection never becomes workflow authority. Include-archived selects a dataset before project/search filtering. Historical/supporting material selection never hides current attention. Readiness/Approval/Settings/product labels/focus are projections of existing typed state.

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

### Production paths expected to change
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/stage.ts`
- `src/daemon/work-item-source.ts`
- `src/shell/setup.ts`
- `ui/src/ActivityComposer.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/app.tsx`
- `ui/src/workbench-presentation.ts`

### Verification paths expected to change/create
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`
- `tests/installer.test.ts`
- `tests/opencode.test.ts`

### Permanent verification infrastructure
- `.github/workflows/ci.yml`

### Delivery metadata
- `CHANGELOG.md`

Total P7 candidate surface forecast after exact-pin OpenCode certification reconciliation: **30 paths** (21 production + 7 verification + 1 permanent verification-infrastructure + 1 delivery). `src/core/execution.ts` remains because it is the existing task-block parsing/admission core and is the minimum owner for schema-aware v2 non-vacuity. `src/daemon/execution.ts` and `src/daemon/validation.ts` are removed from T1: their SD10/SD13 execution-foundation behavior already conforms and must not be reimplemented.

`docs/**`, `pontivus-order.toml`, package/lock metadata, workflow metadata other than the explicitly authorized `.github/workflows/ci.yml` SD20 verification change, and `tests/architecture.test.ts` are not T1 implementation surface. P6 was corrected during DESIGN. G-F10 structural campaign fitness may update immutable architecture verification material **before sign-off**, followed by downstream revalidation; it is not an implementation task.

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
- modifying `tests/architecture.test.ts` inside T1 — rejected because it is signed verification material.

## Open technical questions

NONE.

Every stable requirement and every material package-local outcome now has an explicit technical realization/no-change/verification disposition. PLAN must decompose only the delta solutions above and must carry exact positive-no-change proof obligations without inventing implementation work for conforming requirements.
