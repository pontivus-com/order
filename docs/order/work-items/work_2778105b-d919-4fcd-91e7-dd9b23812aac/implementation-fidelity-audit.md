# 0.5.0 implementation fidelity audit — 0.6.0 recovery baseline

**Status:** 0.5.0 implementation acceptance invalidated; 0.6.0 remediation evidence  
**Released baseline:** v0.5.0 / 5b2a733867f96773d9bcdd9111d4bc8425149095  
**Recovery branch:** fix/0.6.0-implementation-fidelity-recovery  
**Affected WorkItem:** work_2778105b-d919-4fcd-91e7-dd9b23812aac  
**Purpose:** demonstrate where the shipped 0.5.0 implementation failed to realize the already-approved analysis, functional design, technical design and SVG interaction/presentation baseline.

## 1. Verdict

The 0.5.0 analysis and design package is not rejected by this audit.

The failure is implementation fidelity.

The released implementation contains substantial lifecycle/state/control-plane work, and several individual interactions exist, but the product delivered by v0.5.0 does not justify the prior claim that the accepted task experience and 41-SVG Workbench baseline were completely implemented.

The prior implementation-complete and 41/41 MATCH conclusions are therefore invalid evidence for 0.6.0.

For 0.6.0:

1. the existing Research, Requirements, Solution design, canonical Workbench requirements/architecture/theme authorities and reviewed SVG set remain the governing design input;
2. no prior UI/reference item is presumed implemented merely because a renderer, primitive, label or test exists;
3. every functional task and every reference surface must be re-proved against the actual production renderer and runtime state;
4. implementation work must repair the existing canonical owners rather than inventing a second design, state model, DTO/view-model family, browser workflow store, theme system or compatibility layer;
5. release completion may not be claimed from test presence or screenshot capture alone.

## 2. Authority that remains valid

This audit carries forward, unchanged, the substantive analysis/design work already completed.

### 2.1 Parent factual analysis

The following parent Audit artifacts remain factual input:

- application-interaction-map.md
- workflow-state-audit.md
- opencode-interaction-audit.md
- document-material-maturity-audit.md
- certification-evidence-map.md
- research.md

The parent investigation established the full surface inventory, typed source lineage, workflow/state model, OpenCode interaction facts, material maturity model and weaknesses in prior certification.

### 2.2 Accepted functional design

The governing functional package remains:

- work_2778105b-d919-4fcd-91e7-dd9b23812aac/requirements.md
- GW-DOC-WORKBENCH-UX-V2
- GW-DOC-WORK-LIFECYCLE-V1
- GW-DOC-MARKDOWN-WORKBENCH-V1
- GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1
- GW-DOC-INSTALLATION-READINESS-V1

The central product contract is unchanged:

- the product is organized around operator tasks rather than domain-object browsing;
- work type × workflow step × current interaction determines task purpose, required information, expected output and valid actions;
- one current-attention owner controls the primary action;
- supporting context/history/evidence remains subordinate;
- technical/debug identity is on demand;
- workflow steps use the closed interaction classes;
- Readiness is verdict-first;
- Approval is exact-package Review;
- Implementation is task-scoped operational master/detail;
- Complete is result-first;
- responsive recomposition preserves semantics.

### 2.3 Accepted technical design

The governing technical design remains:

- work_2778105b-d919-4fcd-91e7-dd9b23812aac/solution-design.md
- GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2
- GW-DOC-WORKBENCH-THEME-V1
- GW-DOC-TECHNICAL-ARCHITECTURE-V1
- GW-DOC-CANONICAL-CONTRACTS-V1
- GW-P1-FCIS / SoC / DRY / strict typing / canonical ownership

The state kernel is still to be preserved. The 0.6.0 recovery is not authority to replace the lifecycle architecture simply because the UI implementation is poor.

### 2.4 Reviewed visual reference pack

The 41 SVGs under docs/references/workbench-ui remain the reviewed derived visual baseline.

The references constrain presentation, hierarchy and interaction composition. They are not optional inspiration.

No SVG receives a PASS from this audit. The previous 41/41 MATCH adjudication is revoked because direct code/reference contradictions and released-runtime inspection show that the verdict overstated implementation fidelity.

## 3. Audit method

For each surface this audit compares:

1. accepted functional requirement;
2. accepted SVG composition/state reference;
3. released production owner in v0.5.0;
4. actual implementation behavior visible from production code;
5. discrepancy class;
6. 0.6.0 implementation consequence.

Status terms:

- **MISSING** — required functional/presentation realization is absent.
- **CONTRADICTS** — shipped implementation actively conflicts with accepted hierarchy/composition.
- **PARTIAL** — relevant owner/interaction exists, but the accepted task contract is not fully realized.
- **PRESENT / NOT RE-PROVED** — implementation appears materially aligned at code level, but previous visual acceptance is invalid and the item must be re-proved at runtime.
- **FALSE POSITIVE SENSOR** — verification passed without proving the required product behavior.

## 4. Cross-cutting implementation failures

### IF-01 — the visual language is not the reviewed neutral-first Workbench realization

Accepted requirement:

- flat, neutral-first, low-chrome presentation;
- border/spacing hierarchy rather than card/dashboard styling;
- semantic status without turning the interface into large color fields;
- current attention is a hierarchy/action owner, not a collection of colored panels.

Released implementation evidence:

ui/src/theme.css gives the central attention primitive a tinted background and changes the entire surface background by status:

- .order-workbench-attention uses --color-accent-muted;
- success switches to --color-success-muted;
- warning switches to --color-warning-muted;
- danger switches to --color-error-muted.

The rail similarly paints completed/current/error markers with success/accent/error colors. Multiple surface containers also introduce background fills and rounded framed regions.

This is mechanically valid CSS and uses public tokens, but that is not the same as matching the accepted visual language.

**Verdict:** CONTRADICTS / visual implementation requires recovery.

**0.6.0 consequence:** rework the existing primitive presentation owners so the reference hierarchy is achieved with the accepted neutral-first composition. Do not create a second theme or feature-local visual system.

### IF-02 — generic renderer composition survived where the design required task-specific information hierarchy

Accepted requirement:

work type × workflow step × current interaction must determine the information contract. Research, Requirements, Solution design and Implementation plan may share interaction mechanics, but must not collapse into a generic “attempt/document/supporting material” browser.

Released implementation evidence:

ui/src/PreSignoffStageWorkspace.tsx builds the same generic current-material selector from:

- stage Runs named “Attempt N”;
- one lifecycle document;
- generic supporting Work request / governed documents;
- generic StageRunMaterial / LifecycleDocumentMaterial / ProposalReview / EvidenceViewer switching.

Only Research receives one special companion block, and even that block foregrounds repository material identity/path rather than the complete Research task contract.

The accepted task-specific structures in requirements.md §§11–14 and research.svg / requirements.svg / solution-design.svg / implementation-plan.svg are therefore not realized as distinct information hierarchies. The code provides shared mechanics, not the complete task experience.

**Verdict:** PARTIAL with material missing task information realization.

### IF-03 — work-type-aware downstream information is not implemented as a first-class presentation contract

Accepted requirement:

Change, Defect, Investigation and Audit share the visual system but retain different information obligations. Downstream screens must preserve the material work-type context:

- Change keeps requested outcome + proven current state;
- Defect keeps root cause + preserved behavior;
- Investigation terminates after Research unless separate delivery work is created;
- Audit terminates after Research and exposes remediation only as a separate linked WorkItem.

Released implementation evidence:

the shared pre-signoff renderer is stage/material driven and does not contain an explicit work-type-aware information projection for these downstream obligations. WorkItem.schemaId exists, but the renderer does not build the required kind-specific task information model from it.

**Verdict:** MISSING/PARTIAL.

### IF-04 — Readiness is structurally present but semantically not implemented

Accepted requirement:

Readiness is verdict-first:

1. current readiness/verdict;
2. findings and exact defective owner;
3. package material needed to understand the verdict;
4. evidence;
5. attempt history.

Released implementation evidence in ui/src/ReadinessWorkspace.tsx:

- the “Readiness verdict” field renders “Derived from governed readiness-review material when present” or a generic material-maturity label;
- “Package material needed to understand the verdict” renders generic prose saying material is available through a selector;
- “Evidence / attempt history” renders generic prose saying attempts are available through the selector;
- the actual readiness artifact is inserted under the generic “Findings / defective owner” region rather than projected into an explicit verdict/finding/defective-owner model.

This is a shell around a document, not the accepted Readiness information contract.

**Verdict:** MISSING / CONTRADICTS.

This alone invalidates the claim that the Readiness reference was implemented.

### IF-05 — Approval is closer, but still not sufficient to claim exact reference fidelity

Accepted requirement:

Approval is an exact-package Review whose default hierarchy is:

1. package currentness/signability;
2. signed task meaning/scope/exclusions/dependencies/gates/acceptance;
3. governed documents needed for judgment;
4. approver identity and sign-off;
5. technical package identity on demand.

Released implementation evidence in ui/src/SignoffReview.tsx:

- package currentness is rendered;
- signed tasks are listed;
- governed documents are summarized as a count;
- package/source/baseline technical identity is disclosed;
- authorization controls exist.

However, the default overview compresses signed task meaning into “N scope items · N gates” rows and the governed-document region into a count. The accepted reference requires the package Review hierarchy itself to communicate what is being authorized, with task/detail and governed material subordinate but decision-useful.

**Verdict:** PARTIAL. Functional ownership exists; exact hierarchy and reference fidelity must be reworked and re-proved.

### IF-06 — Implementation contains the right broad owner but promotes too much operational/technical material at once

Accepted requirement:

Implementation is operational master/detail with:

- fixed task master;
- current task objective/scope/state;
- current Run/attempt;
- current blocker or next action;
- current/recorded validation boundary;
- chronological events;
- evidence/resources;
- technical details on demand;
- no large unreached validation matrix in primary space;
- historical selection cannot retarget current execution.

Released implementation evidence in ui/src/ExecutionWorkspace.tsx:

- WorkbenchMasterDetail exists;
- task-scoped startExecutionTask(workItem.id, currentOwnerTask.id) exists;
- selected task detail contains attempt selector, run header, agent activity, validation region, full RunEventTimeline, Implementation material list and technical disclosure in one vertical primary stack;
- the master itself is a one-column table whose row content is objective + status;
- there is no explicit task-information projection that guarantees the reference’s current-owner orientation when the operator is inspecting history.

The implementation proves command scope better than the prior release, but the actual information hierarchy remains an implementation problem.

**Verdict:** PARTIAL.

### IF-07 — Queue data exists, but the queue does not implement the complete scan/attention contract

Accepted requirement:

Queue is operational scan: ordinary identity, kind, lifecycle/status and concise attention/readiness information necessary to decide which WorkItem to open. Search/filter/archive are secondary.

Released implementation evidence in ui/src/WorkItemQueue.tsx:

the queue is a generic table with:

- Work item;
- Kind;
- Stage;
- Status;
- Concerns;
- Actions.

There is no WorkItem-level concise current-attention/readiness projection in each row. The status cell is only ACTIVE vs lower-cased status. The selected WorkItem’s current blocker/input/proposal/recovery owner is not represented.

**Verdict:** PARTIAL.

The reference queue data columns are present, but the functional scan contract is not complete.

### IF-08 — Create is one of the stronger areas, but visual fidelity is not established

Accepted reference requires:

- one bounded creation task;
- Project;
- human-owned WorkItem type;
- Title;
- Concern IDs;
- derived process fields not editable;
- linked remediation constrained to Change/Defect.

Released ui/src/CreateWorkItem.tsx contains these controls and restrictions.

**Verdict:** PRESENT / NOT RE-PROVED.

The previous screenshot MATCH may not be reused. The 0.6.0 verification must prove the real task-panel composition and reference hierarchy.

### IF-09 — Settings functions exist but reference fidelity was never actually established

The repository, OpenCode account and model/runtime owners are implemented and expose the expected API-backed controls.

However, prior certification proves component/style ownership, not that each Settings screen matches the accepted composition and information hierarchy. Settings remains part of the failed 41-SVG claim and therefore has no valid visual PASS.

**Verdict:** PRESENT / NOT RE-PROVED, with individual states requiring runtime audit.

### IF-10 — Conversation mechanics landed, but the complete workflow-step experience did not

ui/src/ActivityWorkspace.tsx correctly separates:

- conversation events;
- bounded OpenCode activity;
- workflow events;
- composer eligibility;
- technical details.

This is material implementation work.

But its existence does not make Research/Requirements/Design/Plan complete. The surrounding stage surface still uses the generic material browser described by IF-02, and the full task information contract remains incomplete.

**Verdict:** conversation primitive PARTIAL/PRESENT; complete stage experience PARTIAL.

### IF-11 — Work request/document mechanics exist but the task surface still over-relies on generic Markdown presentation

Source/lifecycle document editing, expected-hash save, Git status, conflict handling and technical details exist in ui/src/DocumentWorkspace.tsx.

The accepted Work request experience, however, is a task hierarchy: originating intent first, conflict/currentness second, Save/Cancel or Start Research as the owning action, concise source/Git state, technical identity last.

The current implementation largely delegates primary meaning to generic MarkdownEditor/metadata composition rather than proving the exact Work request task hierarchy.

**Verdict:** PARTIAL.

### IF-12 — Complete is result-first in broad structure, but exact content/reference fidelity must be re-proved

ui/src/TerminalResult.tsx places terminal outcome before candidate/evidence material and provides linked remediation for evidence-backed non-delivery outcomes.

This broadly matches the accepted terminal grammar.

However, the previous 41/41 visual claim is invalid, and the actual runtime result composition must be checked for each terminal outcome against complete.svg and complete-linked-remediation.svg.

**Verdict:** PRESENT / NOT RE-PROVED.

## 5. Released surface inventory — 0.6.0 reset status

No row below is a PASS. “Re-prove” means the production owner exists but the prior 0.5.0 evidence is invalid.

| Surface | Released owner | 0.6.0 reset status | Known gap / required proof |
|---|---|---|---|
| SURF-APP-001 application shell | ui/src/app.tsx | PARTIAL | global notice/theme/toolbar mechanics exist; visual composition must be re-proved |
| SURF-QUEUE-001 Queue | WorkItemQueue.tsx | PARTIAL | no concise current-attention/readiness row projection; generic table hierarchy |
| SURF-CREATE-001 Create | CreateWorkItem.tsx + task panel | RE-PROVE | functional fields/restrictions exist; visual fidelity invalidated |
| SURF-SET-001 Settings shell | SettingsWorkspace.tsx | RE-PROVE | functionality exists; exact visual/information hierarchy unproven |
| SURF-SET-REPO-001 Repositories | SettingsWorkspace.tsx | RE-PROVE | controls/API present; SVG fidelity unproven |
| SURF-SET-REPO-ADD-001 | SettingsWorkspace.tsx | RE-PROVE | bounded form exists; fidelity unproven |
| SURF-SET-REPO-MOVE-001 | SettingsWorkspace.tsx | RE-PROVE | bounded migration form exists; fidelity unproven |
| SURF-SET-OC-001 Accounts | OpenCodeAccountSettings.tsx | RE-PROVE | account controls exist; fidelity unproven |
| SURF-SET-OC-RENAME-001 | OpenCodeAccountSettings.tsx | RE-PROVE | bounded rename exists; fidelity unproven |
| SURF-SET-OC-ADD-001 | OpenCodeAccountSettings.tsx | RE-PROVE | add flow exists; fidelity unproven |
| SURF-SET-OC-LOGIN-001 | OpenCodeAccountSettings.tsx | RE-PROVE | attempt state exists; terminal-state rendering must be checked |
| SURF-SET-MODEL-001 | SettingsWorkspace.tsx | RE-PROVE | model API/control exists; fidelity unproven |
| SURF-WI-001 WorkItem shell | WorkItemWorkspace.tsx | PARTIAL | canonical derivations exist; neutral-first hierarchy and task-specific composition not achieved/proven |
| SURF-WI-CONTEXT-001 | WorkItemContext.tsx | RE-PROVE | compact technical panel exists; visual/context behavior must be re-proved |
| SURF-STEP-WR-001 | DocumentWorkspace.tsx | PARTIAL | authoring mechanics exist; exact Work request task hierarchy not proven |
| SURF-STEP-R1-001 Research | PreSignoff + Activity | PARTIAL | conversation/activity exists; complete Research information contract not realized |
| SURF-STEP-R2-001 Requirements | PreSignoff | PARTIAL/MISSING | generic stage mechanics; task-specific functional contract not explicitly realized |
| SURF-STEP-DESIGN-001 | PreSignoff | PARTIAL/MISSING | generic stage mechanics; technical-design information hierarchy not explicitly realized |
| SURF-STEP-PLAN-001 | PreSignoff | PARTIAL/MISSING | generic stage mechanics; executable-plan hierarchy not explicitly realized |
| SURF-STEP-R3-001 Readiness | ReadinessWorkspace.tsx | MISSING | placeholder/generic material prose instead of explicit verdict/findings/owner projection |
| SURF-STEP-APPROVAL-001 | SignoffReview.tsx | PARTIAL | key functions exist; decision-useful task/package hierarchy is compressed |
| SURF-STEP-EXEC-001 | ExecutionWorkspace.tsx | PARTIAL | task-scoped command fixed; primary information stack remains over-dense/unproven |
| SURF-STEP-COMPLETE-001 | TerminalResult.tsx | RE-PROVE | broad result-first grammar exists; outcome variants require runtime proof |
| SURF-MAT-SOURCE-001 | DocumentWorkspace.tsx | PARTIAL | mutation mechanics exist; task hierarchy/visual fidelity not proven |
| SURF-MAT-DOC-001 | DocumentWorkspace.tsx | PARTIAL | editing/maturity exists; reference fidelity unproven |
| SURF-MAT-DOC-RO-001 | DocumentWorkspace.tsx | RE-PROVE | read-only path exists; fidelity unproven |
| SURF-MAT-ACTIVITY-001 | ActivityWorkspace.tsx | PARTIAL | dialogue/activity separation exists; stage-level composition incomplete |
| SURF-MAT-PROPOSAL-001 | ProposalReview.tsx | RE-PROVE | proposal decision grammar exists; visual/reference proof invalidated |
| SURF-MAT-EVIDENCE-001 | EvidenceViewer.tsx | RE-PROVE | exact bytes owner exists; reference proof invalidated |
| SURF-MAT-APPROVAL-TASK-001 | SignoffReview.tsx | PARTIAL | task detail exists; overall Review hierarchy requires recovery |
| SURF-MAT-EXEC-TASK-001 | ExecutionWorkspace.tsx | PARTIAL | task detail exists; current-owner/historical orientation and hierarchy need proof |
| confirmation surfaces | app/document/settings/account owners | RE-PROVE | safety controls exist; exact copy/composition/state coverage must be re-proved |

## 6. Forty-one SVG reset ledger

The complete reviewed set remains required. The 0.5.0 PASS status for every item is revoked.

| SVG | Reset status | Reason |
|---|---|---|
| application-notices-states.svg | RE-PROVE | app states exist; released visual fidelity not proven |
| approval-task-detail.svg | PARTIAL | task detail exists; Review hierarchy incomplete/unproven |
| approval.svg | PARTIAL | exact-package mechanics exist; default hierarchy compressed |
| complete-linked-remediation.svg | RE-PROVE | linked remediation path exists; visual proof invalid |
| complete.svg | RE-PROVE | result-first owner exists; visual proof invalid |
| create-linked-remediation.svg | RE-PROVE | functional restriction exists; visual proof invalid |
| create-work-item.svg | RE-PROVE | fields/ownership exist; visual proof invalid |
| current-attention-states.svg | PARTIAL | semantic derivation exists; visual realization conflicts with neutral-first baseline |
| dialogue-states.svg | PARTIAL | state mechanics exist; surrounding stage experience incomplete |
| document-authoring.svg | PARTIAL | editor mechanics exist; reference hierarchy not proven |
| document-readonly.svg | RE-PROVE | read-only owner exists; visual proof invalid |
| document-states.svg | PARTIAL | conflict/dirty/currentness mechanics exist; full state sheet requires runtime proof |
| evidence-viewer.svg | RE-PROVE | exact-byte viewer exists; visual proof invalid |
| implementation-plan.svg | PARTIAL/MISSING | generic pre-signoff renderer does not explicitly realize Plan information contract |
| implementation-states.svg | PARTIAL | execution state logic exists; presentation hierarchy unproven |
| implementation.svg | PARTIAL | master/detail + scoped action exist; detail information hierarchy requires recovery |
| installation-readiness.svg | RE-PROVE | blocker links/notice exist; visual proof invalid |
| proposal-review.svg | RE-PROVE | proposal Review exists; visual proof invalid |
| proposal-states.svg | PARTIAL | adoption/disposition behavior exists; complete state presentation requires proof |
| queue-states.svg | PARTIAL | archive/search/basic state exists; attention/readiness scan contract incomplete |
| queue.svg | PARTIAL | operational table exists; scan hierarchy incomplete |
| readiness-review.svg | MISSING | actual verdict/finding/defective-owner projection not implemented |
| requirements.svg | PARTIAL/MISSING | generic pre-signoff material rendering substitutes for task-specific Requirements presentation |
| research.svg | PARTIAL | dialogue/activity exists; complete Research task presentation not established |
| responsive-composition.svg | RE-PROVE | some breakpoint tests exist; exact semantic recomposition must be re-audited |
| safety-confirmations.svg | RE-PROVE | confirmations exist; full reference coverage needs runtime proof |
| settings-model.svg | RE-PROVE | functional control exists; visual proof invalid |
| settings-opencode-add.svg | RE-PROVE | functional flow exists; visual proof invalid |
| settings-opencode-login-states.svg | RE-PROVE | state model exists; all terminal presentations need proof |
| settings-opencode-login.svg | RE-PROVE | flow exists; visual proof invalid |
| settings-opencode-rename.svg | RE-PROVE | flow exists; visual proof invalid |
| settings-opencode.svg | RE-PROVE | functional account management exists; visual proof invalid |
| settings-repositories.svg | RE-PROVE | functional repository controls exist; visual proof invalid |
| settings-repository-add.svg | RE-PROVE | functional form exists; visual proof invalid |
| settings-repository-move.svg | RE-PROVE | functional form exists; visual proof invalid |
| solution-design.svg | PARTIAL/MISSING | generic pre-signoff renderer does not explicitly realize technical-design hierarchy |
| theme-parity.svg | RE-PROVE | token modes exist; accepted neutral-first parity and exact screen semantics were not proven |
| work-request.svg | PARTIAL | source editor exists; complete task information hierarchy not established |
| work-type-variants.svg | MISSING/PARTIAL | no explicit downstream work-type information projection |
| workitem-context.svg | RE-PROVE | context owner exists; visual proof invalid |
| workitem-shell-controls.svg | PARTIAL | shell/rail/context/archive exist; whole-shell visual hierarchy must be reworked/re-proved |

## 7. Why the 0.5.0 verification produced a false positive

### VF-01 — certification checks source tokens and component presence, not product fidelity

tests/certification.test.ts contains many assertions such as:

- source contains WorkbenchReview;
- source contains WorkbenchMasterDetail;
- source contains label="Approved tasks";
- source contains label="Agent activity";
- source does not contain forbidden selector/string;
- theme contains expected section markers;
- no raw lengths/radii/box shadows/important declarations.

These are useful architecture/style-ownership sensors.

They do not prove:

- the correct information is primary;
- the correct information is present;
- the correct task owns the surface;
- the actual runtime screen resembles the SVG composition;
- hierarchy, density, grouping and color usage match the accepted design.

The tests therefore certified implementation substrate, not implementation fidelity.

**Verdict:** FALSE POSITIVE SENSOR.

### VF-02 — browser tests prove selected geometry and labels, not the reference compositions

tests/browser.spec.ts verifies examples such as:

- editor width/height ratios;
- Implementation master width;
- detail width;
- absence/presence of generic controls;
- selected workflow rail state;
- proposal buttons;
- selected activity/detail existence;
- responsive focus continuity.

These are valid behavioral checks.

They still do not compare the rendered application to the reviewed SVG hierarchy or verify the full per-surface information contract.

**Verdict:** FALSE POSITIVE SENSOR for visual/task-composition completeness.

### VF-03 — the 41/41 MATCH ledger was not protected by an objective permanent gate

The repository has 41 SVG references, but the permanent configured gates are dependency-lock, typecheck, architecture, test, build and browser.

There is no permanent release gate that consumes all 41 SVG references and mechanically fails when the production runtime diverges in required topology/information hierarchy.

The temporary evidence workflows could capture screenshots, but screenshot existence and manual adjudication are not sufficient if the adjudication itself is wrong.

The released code now demonstrates contradictions that a genuine 41/41 implementation match could not contain, most clearly Readiness.

**Verdict:** previous visual completion evidence invalid.

### VF-04 — passing architecture does not prove product completion

Architecture remained valuable: FCIS, state ownership, no DTO/OOP proliferation, Astryx boundaries and canonical owners were guarded.

The mistake was converting “architecture green” into “product design implemented”.

0.6.0 must preserve architecture gates while adding fidelity gates; it must not weaken architecture to obtain the visual result.

## 8. Functional implementation inventory

The 0.6.0 implementation plan must separately verify these functional contracts rather than treating “component exists” as completion.

### 8.1 Cross-workflow shell

Must prove:

- stable toolbar → identity → rail → current attention → primary task → optional Context order;
- one current attention owner;
- historical selection cannot suppress/retarget current authority;
- technical/debug detail remains subordinate;
- WorkItem kind changes information contract without creating a second visual system.

### 8.2 Work request

Must prove:

- source Markdown is the primary work;
- source conflict/diagnostic has precedence;
- Save/Cancel or Start Research is the single owning action as applicable;
- concise Git/source state is secondary;
- no attempt/history rail appears.

### 8.3 Research

Must prove:

- conversation is primary when reply-capable;
- exact required question owns input;
- operational activity is supporting;
- work-type-specific factual obligations remain visible/reachable;
- evidence/history is subordinate;
- agent result rejection is distinguishable from provider failure.

### 8.4 Requirements

Must prove:

- accepted Research/product intent is visible as supporting basis;
- observable behavior contract is primary;
- work-type differences remain represented;
- agent/dialogue/proposal/document/evidence grammar is preserved without flattening task meaning.

### 8.5 Solution design

Must prove:

- accepted Requirements and applicable architecture/contract authority are represented as supporting basis;
- technical solution/decisions/validation obligations are primary;
- primary width supports diagrams/contracts/technical content;
- generic attempt/document selection does not become the product model.

### 8.6 Implementation plan

Must prove:

- exact tasks/dependencies/traceability/change surface/validation sequence are primary;
- derived summaries never become a second authority;
- Readiness progression is only available after executable closure.

### 8.7 Readiness

Must be rebuilt to prove:

- explicit verdict;
- explicit findings;
- exact defective/owning upstream stage;
- package material linked to findings;
- evidence linked to findings;
- required input temporarily owns attention;
- no sign-off here;
- read-only material.

### 8.8 Approval

Must prove:

- package currentness/signability first;
- signed task meaning is decision-useful without forcing technical drill-down;
- documents needed for judgment are accessible in the same Review;
- approver identity/sign-off is the decision region;
- stale package cannot sign;
- reached-but-unsigned history is not labelled approved.

### 8.9 Implementation

Must prove:

- exact current task owner independent from selection;
- task-local action targets exactly that task;
- historical selection cannot retarget execution;
- current blocker/recovery remains visible;
- active role/activity is useful but bounded;
- validation boundary is concise until evidence exists;
- timeline/evidence/supporting material are subordinate;
- narrow/medium master recomposition preserves ownership.

### 8.10 Complete

Must prove each terminal branch:

- terminal classification first;
- substantive result second;
- evidence/resources third;
- linked remediation only for eligible Audit/Investigation outcomes;
- no deployment/production inference;
- reached history remains inspectable without burying result.

### 8.11 Queue/Create/Settings/Context/Evidence

Must prove each supporting task against its specific SVG set, not against shared component presence.

## 9. 0.6.0 implementation-plan requirements derived from this audit

The replacement implementation plan must:

1. treat v0.5.0 as the implementation baseline, not as completed authority;
2. retain the existing valid P1–P6 analysis/design;
3. enumerate every affected production renderer and primitive after code audit;
4. define a task per coherent canonical owner rather than a task per screenshot;
5. include explicit deletions of obsolete/generic presentation structures where they conflict with the accepted task model;
6. define exact required information for every workflow surface and state;
7. define exact reference acceptance for all 41 SVGs;
8. preserve task-scoped execution, dialogue/activity separation, material maturity and existing state-kernel corrections already correctly implemented;
9. preserve FCIS/SoC/DRY/strict typing/no DTO/no parallel state/theme ownership;
10. add verification that fails on information-hierarchy and composition regression, not only architecture/string/geometry regression;
11. require real runtime evidence from the exact merge candidate;
12. prohibit declaring a reference MATCH from artifact existence or reviewer assertion without the required comparison evidence;
13. require independent semantic review of the rendered runtime against the accepted functional contract before release;
14. close every row in this document before 0.6.0 release preparation.

## 10. What must not be redone

The following work is not invalidated merely because 0.5.0 presentation failed:

- canonical lifecycle/state ownership;
- task-scoped startExecutionTask command;
- proposal disposition/adoption state closure;
- dialogue/activity/workflow event separation;
- bounded agent activity contract;
- material currentness/maturity derivations;
- repository draft portability work;
- OpenCode admission/failure classification work;
- no-OOP/no-DTO/FCIS architecture;
- existing canonical contracts that satisfy the accepted Solution design.

Each must still be regression-tested while the UI implementation is rebuilt.

## 11. Closure criteria for this audit

This audit is closed only when the 0.6.0 implementation plan has an explicit remediation/proof mapping for:

- every IF finding in §4;
- every SURF row in §5;
- every SVG in §6;
- every false-positive verification class in §7;
- every functional implementation area in §8.

No 0.6.0 release may reuse the 0.5.0 “implementation complete”, “41/41 MATCH”, or “all gates prove fidelity” conclusions as completion evidence.

The 0.6.0 implementation must earn those conclusions again from the actual final runtime.
