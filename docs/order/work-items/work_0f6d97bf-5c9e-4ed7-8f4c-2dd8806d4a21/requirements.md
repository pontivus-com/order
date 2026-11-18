<!-- Order template: change-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

## P2 intent and R1 factual basis

This R2 artifact is rebuilt from the fresh post-C20-F01 R1 record in `research.md`, the current P2/P3 authority graph resolved through `pontivus-order.toml`, and no other normative source.

Current implementation, UI, tests, 0.5.0 behavior, historical design and prior R2/DESIGN/PLAN text are evidence only. They do not define 0.6.0 behavior, preservation scope, compatibility fallback or regression semantics.

R1 closed all C01-C22 factual questions and classified every material realization as `CONFORMS` or `VIOLATES`. R2 therefore owns only the functional consequence of canonical authority and the explicit disposition of the R1 findings. Technical owner selection, data/control flow and implementation scope remain DESIGN/PLAN decisions.

## Functional authority disposition ledger

The v2 disposition ledger is obligation-complete against current canonical P3 authority. It contains exactly one row for each of the **112 unique manifest-canonical stable `GW-FR-*` requirements** selected by `authority.p3`. Every stable requirement is `REFERENCE`: its existing P3 owner remains normative, while the A01-A11 sections below state the explicit 0.6.0 functional consequence for the concern(s) that consume it. `REFERENCE` is therefore not shorthand for "no behavior"; it preserves ownership while this package makes the required behavior explicit.

One additional non-stable normative-clause row records the C01 Work Lifecycle cross-reference correction that has no dedicated `GW-FR-*` identity. It is a `DELTA` to the existing P3 document owner, not a new requirement namespace.

No `LOCAL` requirement is needed because every 0.6.0 functional obligation is already owned by canonical P2/P3 authority.

| Requirement | Disposition | Canonical P3 owner | Primary campaign concern |
|---|---|---|---|
| GW-FR-001-GOVERNED-LIFECYCLE | REFERENCE | GW-DOC-WORK-LIFECYCLE | C01 |
| GW-FR-002-REPRODUCIBLE-AUTHORITY | REFERENCE | GW-DOC-WORK-LIFECYCLE | C01 |
| GW-FR-003-DURABLE-BOUNDED-EXECUTION | REFERENCE | GW-DOC-WORK-LIFECYCLE | C12 |
| GW-FR-004-INDEPENDENT-VALIDATION | REFERENCE | GW-DOC-WORK-LIFECYCLE | C20 |
| GW-FR-005-LOCAL-WORKBENCH | REFERENCE | GW-DOC-WORK-LIFECYCLE | C05 |
| GW-FR-006-MINIMUM-VERIFIED-CANDIDATE | REFERENCE | GW-DOC-WORK-LIFECYCLE | C12 |
| GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP | REFERENCE | GW-DOC-WORK-LIFECYCLE | C16 |
| GW-FR-008-GOVERNED-REPOSITORY-ACCESS | REFERENCE | GW-DOC-WORK-LIFECYCLE | C22 |
| GW-FR-009-PORTABLE-WORK-ITEM-SOURCE | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-010-GOVERNED-WORK-KIND-CATALOG | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-011-VERSIONED-AUTHORING-SCHEMAS | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-012-CATALOG-DRIVEN-AUTHORING | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-013-PORTABLE-QUEUE-RECONCILIATION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C03 |
| GW-FR-014-SOURCE-FRESHNESS | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-015-SOURCE-CONTEXT-PROJECTION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C06 |
| GW-FR-016-SOURCE-CONFORMANCE-IDENTITY | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C17 |
| GW-FR-017-SOURCE-SIGNOFF-BINDING | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C11 |
| GW-FR-018-SOURCE-CONSUMER-CLOSURE | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-019-SOURCE-CLARIFICATION-DURABILITY | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C06 |
| GW-FR-020-WORKBENCH-SOURCE-OPERATIONS | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-021-MARKDOWN-WORKSPACE | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C05 |
| GW-FR-022-GOVERNED-MARKDOWN-EDITING | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-023-MARKDOWN-SOURCE-FIDELITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C17 |
| GW-FR-025-DURABLE-INTENT-INTERACTION | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C06 |
| GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C11 |
| GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C12 |
| GW-FR-028-NONDELIVERY-TERMINAL-VIEW | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C13 |
| GW-FR-029-NO-IDE-SCOPE | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C02 |
| GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-063-DOCUMENTATION-GIT-STATUS | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-069-EDITOR-STATE-CONTINUITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C03 |
| GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C03 |
| GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-075-OPENCODE-ACCOUNT-LOGIN | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-078-PORTABLE-WORKITEM-ARCHIVE | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C03 |
| GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-080-CONFIGURATION-CONTINUITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C02 |
| GW-FR-088-WORKITEM-METADATA-PRESERVATION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C04 |
| GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH | C04 |
| GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS | REFERENCE | GW-DOC-INSTALLATION-READINESS | C16 |
| GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM | C07 |
| GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE | REFERENCE | GW-DOC-LIFECYCLE-CONTEXT | C20 |
| GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW | REFERENCE | GW-DOC-SPECIFICATION-STANDARD | C10 |
| GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C22 |
| GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C20 |
| GW-FR-104-STAGE-WORKSPACE-FRESHNESS | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C15 |
| GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION | C22 |
| GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-201-OBSERVATIONAL-READS | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-202-ATOMIC-COMMAND-OUTCOME | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-203-SERIALIZED-RUN-TURNS | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP | REFERENCE | GW-DOC-WORKBENCH-UX | C06 |
| GW-FR-205-MONOTONIC-REACH-HISTORY | REFERENCE | GW-DOC-WORKBENCH-UX | C01 |
| GW-FR-206-CURRENT-ATTENTION-PRECEDENCE | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-209-SOURCE-BLOCKER-ADMISSION | REFERENCE | GW-DOC-WORKBENCH-UX | C04 |
| GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-211-READINESS-RETURN-CONTINUITY | REFERENCE | GW-DOC-WORKBENCH-UX | C10 |
| GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS | REFERENCE | GW-DOC-WORKBENCH-UX | C11 |
| GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE | REFERENCE | GW-DOC-WORKBENCH-UX | C12 |
| GW-FR-214-STABLE-WORKBENCH-GEOMETRY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-215-STABLE-WORKFLOW-RAIL | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-217-PRIMARY-INFORMATION-ECONOMY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-218-SPACE-CLASS-CONSISTENCY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-219-EXPLICIT-CONTEXT | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-220-PRESIGNOFF-CONTINUITY | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-221-READINESS-REVIEW-HIERARCHY | REFERENCE | GW-DOC-WORKBENCH-UX | C10 |
| GW-FR-222-APPROVAL-REVIEW-HIERARCHY | REFERENCE | GW-DOC-WORKBENCH-UX | C11 |
| GW-FR-223-IMPLEMENTATION-MASTER-DETAIL | REFERENCE | GW-DOC-WORKBENCH-UX | C12 |
| GW-FR-224-TERMINAL-RESULT-PRIMACY | REFERENCE | GW-DOC-WORKBENCH-UX | C13 |
| GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY | REFERENCE | GW-DOC-WORKBENCH-UX | C18 |
| GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK | REFERENCE | GW-DOC-WORKBENCH-UX | C17 |
| GW-FR-227-CERTIFICATION-MATRIX | REFERENCE | GW-DOC-WORKBENCH-UX | C20 |
| GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE | REFERENCE | GW-DOC-WORKBENCH-UX | C01 |
| GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE | REFERENCE | GW-DOC-WORKBENCH-UX | C19 |
| GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE | REFERENCE | GW-DOC-WORKBENCH-UX | C01 |
| GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION | REFERENCE | GW-DOC-WORKBENCH-UX | C19 |
| GW-FR-235-GLOBAL-THEME-PARITY | REFERENCE | GW-DOC-WORKBENCH-UX | C19 |
| GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION | REFERENCE | GW-DOC-WORKBENCH-UX | C05 |
| GW-FR-237-BOUNDED-AGENT-ACTIVITY | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-238-PROPOSAL-CANCEL-CLOSURE | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION | REFERENCE | GW-DOC-WORKBENCH-UX | C12 |
| GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE | REFERENCE | GW-DOC-WORKBENCH-UX | C15 |
| GW-FR-241-DERIVED-MATERIAL-MATURITY | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-FR-242-DIALOGUE-REPLY-CONTEXT | REFERENCE | GW-DOC-WORKBENCH-UX | C14 |
| GW-DOC-WORK-LIFECYCLE clause: `GW-P2-CONTROLLED-WORK` System Brief cross-reference | DELTA | GW-DOC-WORK-LIFECYCLE | C01 |

The stable-ID table is a mechanical ownership/completeness proof only. Normative P3 clauses without stable IDs remain mandatory semantic audit material under each R2 pair audit and cannot be declared complete by identifier counting.

Two P2 corrections are part of this R2 package but are not misrepresented as P3 dispositions:

- `GW-DOC-SYSTEM-BRIEF` §8 states product-level terminal success without collapsing valid no-code results into candidate execution success.
- `GW-DOC-PRODUCT-IDENTITY` §7 distinguishes prohibited automatic implementation/delivery commits from the already-governed explicit WorkItem-documentation Git commit capability.

The C01 clause-level P3 `DELTA` corrects the `GW-P2-CONTROLLED-WORK` cross-reference in `GW-DOC-WORK-LIFECYCLE` from System Brief §8 to its actual declaration in §9. It does not change lifecycle behavior.

## Required observable outcome/delta

### A01 — C01 product model + C21 product identity

**C01.** Order has one canonical WorkItem lifecycle: IDEA, R1, R2, DESIGN, PLAN, R3, AWAITING_SIGNOFF, EXECUTION and COMPLETE. IMPLEMENT, deterministic/mechanical verification, independent review and bounded remediation are internal execution/validation boundaries under EXECUTION, not extra WorkItem stages. Valid schema-specific R1 terminal outcomes may reach COMPLETE without implementation. Product-level success is a verified terminal result; candidate success is the stricter executed-delivery result. Missing product intent is never inferred by an agent or UI.

**C21.** Ordinary product language uses Order/Pontivus Order, "Ideas in. Results out.", "From idea to verified result.", **verified result** for the umbrella terminal outcome and **verified candidate** only for executed delivery. Public surfaces must not imply every WorkItem executes. They must not describe automatic product/candidate commit/push/merge/deploy as a v1 capability. Explicit operator-triggered Git commits of governed WorkItem documentation remain permitted documentation behavior. Internal lifecycle enums are not ordinary operator-facing outcome copy.

### A02 — C22 project authority + C02 intake

**C22.** Project authority is resolved from the selected project manifest and canonical authority graph before productive stage interpretation. Same-layer precedence/default/override/extension semantics must have one resolved meaning; unresolved material contradiction blocks the owning stage rather than being delegated to the provider. UI/provider state never becomes authority.

**C02.** Ordinary authoring exposes exactly the governed four work kinds and project-owned **Concerns**, not raw concern IDs as the primary language. Current authoring defaults are chosen from the canonical schema catalog while historical pins remain resolvable. Linked remediation is fixed to the completed parent WorkItem's project and only creates a new Change/Defect under the allowed lineage. Human title/body remain the authoring surface; system metadata remains derived/guarded. UI-created and externally authored sources must enter the same functional source/reconciliation contract.

### A03 — C03 queue + C04 source/document Git

**C03.** Queue/search/project semantics are identical whether archived work is excluded or included; including archived rows expands the candidate set and does not replace project/search filtering with another rule. Repository source diagnostics remain explicit and invalid/duplicate/misplaced sources never become partial productive WorkItems.

**C04.** The portable Markdown source remains the durable project-local source while Order runtime state owns lifecycle/run/approval/execution state. Source editing is conflict-safe and source-authority changes return/stale downstream work according to canonical lifecycle rules. Documentation Git review must make the exact governed path set being committed directly legible before the operator confirms the commit. No second browser/source metadata authority is created.

### A04 — C05 workspace/current attention + C06 Research/input

**C05.** Workflow-step material, Context, historical inspection and current work remain distinct. Explicit document/history selection may not hide the exact current attention owner: required input, proposal review, blocker, stale/recovery action or other higher-priority attention remains visible and directly reachable without destroying legitimate historical inspection.

**C06.** R1 remains factual and may request human input. Ordinary information/evidence may continue the current factual interaction. Input categorized as authority-changing (`STAGE_CHOICE`, `AUTHORITY_DECISION`, `AUTHORITY_CONFLICT` where it changes durable authority) cannot be accepted as chat-only authority; the user must be directed to the governed durable-authority update path or the stage remains blocked until that authority is updated. Conversation is not a shadow authority store.

### A05 — C07 Requirements + C08 Solution design

**C07.** R2 owns required observable behavior, acceptance, scope/exclusions and functional authority dispositions. A permanent P2/P3 `DELTA` is applied to its existing canonical owner through the governed explicit proposal/adoption path; `requirements.md` records the package consequence and never becomes a shadow permanent owner. Missing product intent blocks rather than being invented.

**C08.** DESIGN owns technical decisions and may amend existing P4/P5/P6 canonical owners only through the same governed proposal/adoption model, with target path/layer validated against the resolved authority graph. `solution-design.md` records the package's technical consequence; it is not a second architecture/contract owner.

### A06 — C09 PLAN + C10 R3

**C09.** PLAN carries the complete S8-S10 package contract and exactly one canonical `order-tasks` block. An executable package cannot be vacuous: it must contain at least one materially specified task when implementation is required, and each task must have meaningful identity/objective, justified authority/acceptance/concern ownership, bounded scope/change surface and required gates. PLAN may not delegate product/architecture choices to implementation.

**C10.** R3 is read-only adversarial review. Its dominant judgment is the canonical typed R3 outcome (`READY_FOR_SIGNOFF` or the exact return/block result), not document maturity/currentness. It returns defects to the exact owning stage and cannot repair them locally. `READY_FOR_SIGNOFF` requires current coherent authority, complete P1-P7 traceability and successful canonical signed-task mechanical validation.

### A07 — C11 Approval + C12 Execution

**C11.** Approval is explicit human authorization of one exact current package. Canonical readiness and package currentness are primary review facts before technical identity. A valid approval identity is non-empty human-readable operator identity after semantic normalization; browser validation is feedback, not the invariant owner. Stale/different material cannot be signed.

**C12.** EXECUTION materializes only signed tasks and preserves builder/reviewer/remediator separation, bounded repair and independent validation. If a signed PLAN requires an architecture-feedback checkpoint between architecture-affecting internal steps, Order must provide a governed coordinator-owned way to execute the resolved gate before the builder proceeds; denied ambient provider shell/execute permission is not relaxed to satisfy that obligation.

### A08 — C13 Complete + C14 governed materials

**C13.** COMPLETE is terminal. The result surface distinguishes verified candidate from legitimate non-candidate outcomes and keeps linked remediation as a separate governed WorkItem rather than mutating terminal history. Reached history is monotonic.

**C14.** Documents, proposals, evidence, dialogue/activity and derived inspection remain distinct material classes with explicit currentness/editability. Durable authority changes occur only through canonical document/proposal/adoption owners; dialogue and activity cannot silently become authority.

### A09 — C15 provider interaction + C16 Settings

**C15.** OpenCode/provider interaction remains a trusted execution/information channel inside Order's resolved authority and permission boundary. Session continuity, observable activity, exact required input and provider failure are visible without turning provider state into lifecycle authority. Rejected/failed provider actions preserve canonical state and expose the owning recovery path.

**C16.** Settings is operator-first: readiness/attention, meaning and available actions are primary. Exact Git/document paths, endpoint/API identity, credential identifiers and similar diagnostic identity are secondary/on-demand except when the active Add/Move/configuration task requires them to choose or enter a value.

### A10 — C17 recovery/current attention + C18 responsive/accessibility

**C17.** Current-attention priority, blockers, stale authority, retry/resume/reconcile and asynchronous convergence are derived from canonical state. The exact current task/action remains visible and reachable even while historical/current supporting material is inspected. Failed mutations do not fabricate success or lose the governing attention state.

**C18.** Wide/medium/narrow presentation preserves semantic hierarchy and actions. Keyboard/focus behavior preserves the operator's place. When a new required human-input request becomes current, focus moves once to the relevant composer for that exact request; polling/re-rendering must not repeatedly steal focus. Dirty-buffer and modal/dialogue behavior remain safe.

### A11 — C19 component/theme + C20 certification

**C19.** The application has one Workbench/Astryx component and theme language. Every production renderer must be classifiable against the canonical renderer-to-primitive ownership matrix; an unclassified renderer is an architecture defect, not permission for a feature-local visual system.

**C20.** Certification proves the reconstructed authority, not historical behavior. Permanent verification must cover the complete required scenario matrix, including all four WorkItem kinds' Research information contracts and the Change/Defect downstream distinction (scenario 41), plus representative cross-application component/semantic-role parity under System/Light/Dark modes (scenarios 26 and 33-36). Green adjacent tests do not imply untested obligations.

## Acceptance criteria

| Concern | Functional acceptance |
|---|---|
| C01 | Product and lifecycle authority distinguish verified result from verified candidate, valid no-code terminal outcomes and EXECUTION-internal validation boundaries; the stable P2 cross-reference is exact. |
| C02 | Create uses governed work-kind defaults and Concerns; linked remediation has fixed same-project lineage; one functional source/reconciliation contract applies to created/discovered work. |
| C03 | Project/search filtering has one meaning with or without archived rows; diagnostics remain explicit. |
| C04 | Source/runtime ownership is singular at the functional level; exact documentation-Git commit paths are reviewed before confirmation. |
| C05 | Historical/supporting inspection cannot hide or make unreachable the exact current attention owner. |
| C06 | Authority-changing human input requires durable authority update/block; ordinary information/evidence may continue interaction. |
| C07 | R2 dispositions are explicit and permanent P2/P3 changes use the canonical proposal/adoption owner. |
| C08 | P4-P6 changes use one validated canonical-owner proposal/adoption path and do not create shadow architecture/contracts. |
| C09 | Implementation-required PLAN is materially non-vacuous, completely specified and has one canonical signed-task representation. |
| C10 | Dominant Readiness judgment is the canonical R3 outcome and defective packages return to the exact owning stage. |
| C11 | Approval shows readiness + currentness first, accepts only meaningful human identity and signs only the exact current package. |
| C12 | Signed tasks execute under canonical role/validation rules and required in-task architecture checkpoints are executable without ambient provider shell authority. |
| C13 | COMPLETE is terminal and uses canonical verified-result/verified-candidate product language. |
| C14 | Document/proposal/evidence/dialogue/currentness ownership remains explicit with no chat/activity authority shadow. |
| C15 | Provider/session/input/failure behavior remains observable and bounded by Order authority; rejection preserves canonical state. |
| C16 | Settings keeps operator readiness/meaning/actions primary and technical identity secondary unless task-required. |
| C17 | Canonical current attention/recovery remains visible/reachable through selection, failure and asynchronous convergence. |
| C18 | Responsive/focus/keyboard semantics hold; each new required-input request receives one non-repeating focus transition. |
| C19 | Every production renderer is covered by the canonical primitive ownership rule and one theme/component system. |
| C20 | Permanent certification covers the full kind/stage and representative cross-application theme/semantic-role matrices required by P3. |
| C21 | Public/product surfaces consistently use verified result/verified candidate and do not overclaim automatic delivery commits or universal execution. |
| C22 | Authority precedence/default/override/extension semantics resolve before provider interpretation and unresolved contradiction blocks. |

## Scope/exclusions

In scope at R2:

- the three permanent-authority precision corrections above;
- exact functional consequences for C01-C22;
- information hierarchy, interaction, state/action/transition/failure/recovery and negative behavior already required by current P2/P3 authority;
- explicit disposition of every fresh R1 finding to R2 resolution or DESIGN ownership.

Out of scope at R2:

- selecting module/file boundaries, algorithms, transport/persistence shapes or provider-control mechanics;
- introducing DTOs, shadow state, alternate lifecycle/task/source/readiness models or feature-local component systems;
- deciding implementation change surfaces or task decomposition;
- treating current code/UI/tests/0.5.0 behavior as a preservation requirement;
- unrelated feature/product expansion.

## Failure/negative behavior

The 0.6.0 functional package is non-conformant if a downstream layer:

- invents missing product intent or treats current implementation as fallback authority;
- creates another WorkItem stage, readiness/source/queue/authority owner or signed-task representation;
- hides current required attention behind an explicit historical/supporting selection;
- accepts an authority-changing decision only as conversational text;
- allows non-canonical P2-P6 mutation without resolved target/layer validation and explicit adoption;
- permits a materially empty executable PLAN package;
- signs stale/different material or whitespace-only approval identity;
- requires a BUILDER to satisfy a signed checkpoint it has no governed capability to execute;
- exposes raw IDs/paths/endpoints/internal enums as primary ordinary operator meaning where authority defines a semantic label/hierarchy;
- weakens required scenario/theme/accessibility certification because adjacent historical tests are green.

## Material compatibility/security/performance constraints

No new compatibility, security or performance policy is introduced.

Existing canonical constraints remain binding: exact-package sign-off/freshness, local-only daemon boundary, pinned/trusted provider integration, project-governance authority, responsive/accessibility requirements, strict typing, FCIS, SoC, DRY/canonical ownership, no-OOP/no-DTO posture and minimum sufficient change.

Historical schema pins and valid historical WorkItems remain resolvable under their pinned semantics. This is canonical version compatibility, not preservation of incidental 0.5.0 behavior or UI composition.

## Open product/authority questions

NONE.

Every fresh R1 finding has an explicit functional disposition. Remaining open work is technical realization/verification owned by DESIGN and then PLAN; no implementation worker is authorized by this R2 artifact.
