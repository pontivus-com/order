<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Order 0.6.0 integrated technical solution design

## Design basis and authority boundary

This DESIGN consumes the post-governance, exhaustive R2 functional package at commit `981944c902b52911fbf86c6b9ca439cd0e9dc406`: `requirements.md` blob `92cad7491a89e3c498826ae697b37d00e7568532`, current canonical P1-P6 owners and the current R1 findings only. G3 is mechanically closed over 112/112 manifest-canonical stable P3 dispositions plus the separately owned non-ID clause delta.

Current implementation, UI, tests, 0.5.0 release behavior, prior DESIGN and the former T1 plan are evidence only. Reuse below is authorized only when an existing canonical owner/capability independently fits the fresh requirements.

No DTO, OOP/service layer, shadow lifecycle/source/readiness/task/proposal model, new persistence table, new public API family, dependency upgrade or feature-local UI system is introduced.

## Requirement-to-solution map

| Concerns/findings | Technical realization |
|---|---|
| C01/C21 product language | No lifecycle/runtime-state change. Correct README and terminal-result product-facing projection only; canonical P2/P3 semantics are already corrected. |
| C22-F01 | Extend pure `src/core/governance.ts` to resolve same-layer precedence and P1 default/override/extension/gate bindings from validated manifest inputs; shell expands patterns, daemon consumes the pure resolved projection before provider context. |
| C02-F01/F02 | Correct existing Create renderer: **Concerns** label; linked remediation renders fixed parent project context. No command/schema change. |
| C02-F03/C04-F01 | In `src/daemon/work-item-source.ts`, factor one new-source planner that returns the existing REGISTERED `QueuePlan`; both create and repository discovery persist through existing `applyPlan`. Delete direct create-path WorkItem construction/store. |
| C03-F01 | Move include-archived query/toggle ownership into `app.tsx`; run one project/search derivation over the selected canonical dataset; `WorkItemQueue` receives filtered rows/toggle callback. |
| C04-F02 | Reuse `DocumentationGitStatus.paths` / `changedGitPaths`; confirmation displays exact paths/states before the existing commit command. |
| C05-F01 | Keep current-attention resolver canonical and independent from explicit inspected material; step summary renders compact exact attention owner/action when selected material differs. No new browser state model. |
| C06-F01 | Keep input events; classify STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT as decision inputs whose reply is non-authoritative. Stage completion requires a later adopted proposal after the latest such reply. |
| C07-F01/C08-F01 | Extend the existing artifact proposal/adoption owner to admitted GOVERNANCE proposals: R2 only current P2/P3 paths, DESIGN only current P4-P6 paths, exact layer/path/base hash, current re-resolution, one pending proposal grammar. |
| C09-F01 | Strengthen the existing SignedTaskBlock schema/validator with non-vacuity constraints; no second task representation. |
| C10-F01 | `ReadinessWorkspace` derives the dominant verdict from typed R3 completion outcome; material maturity remains separate. |
| C11-F01/F02 | Approval projection shows Ready for sign-off + Current first; canonical Approval schema trims/requires nonblank `approvedBy`. |
| C12-F01 | Add one BUILDER-only typed `GATE_CHECKPOINT_REQUESTED` event; coordinator executes signed gate via existing validation effect owner and records existing gate result/evidence; provider shell remains denied. |
| C13/C14/C15/C17 | No technical delta beyond integration with the corrections above; existing canonical owners already realize fresh R2 behavior. |
| C16-F01 | Recompose Settings with exact roots/endpoint/model-list source under Technical details except active configuration tasks. |
| C18-F01 | Workbench-owned composer region focuses once per new required-input event id; no private Astryx DOM/API dependence and no polling focus theft. |
| C19-F01 | Add exhaustive renderer-matrix certification to `tests/certification.test.ts`, because `tests/architecture.test.ts` is signed architecture-gate material and remains immutable to implementation. |
| C20-F02/F03 | Extend existing browser certification for complete scenario 41 kind/Research/downstream matrix and representative System/Light/Dark cross-application semantic-role parity. |
| C21-F03/F05 | README follows current Product Identity; terminal CANDIDATE_DONE primary label is **Verified candidate**, with explicit mapping rather than enum prettification. |

## Exhaustive requirement-level technical disposition

The summary map above remains a compact index. This section is the implementation-governing completeness proof for DESIGN: every manifest-canonical stable P3 requirement in the exact R2 package has one explicit technical disposition, and every package-local/non-stable R2 consequence is separately represented so stable-ID counting cannot hide functional content.

Local `SDxx` identifiers are WorkItem traceability keys only. They do not create permanent semantic owners; permanent technical meaning remains with the resolved P4-P6 documents named by this DESIGN.

### Solution identifiers

| ID | Technical solution |
|---|---|
| SD01 | Preserve canonical lifecycle/result semantics; change only public/terminal product-language projection where required. |
| SD02 | Pure deterministic same-layer precedence and P1 default/override/extension/fitness resolution before productive provider context. |
| SD03 | Canonical Create presentation: Concerns terminology and fixed same-project remediation context; no new command/schema. |
| SD04 | One daemon new-source QueuePlan/applyPlan admission owner for created and discovered WorkItems. |
| SD05 | One App-owned active/include-archived dataset selection followed by project/search derivation. |
| SD06 | Exact documentation-Git changed paths/states visible before commit using existing canonical status facts. |
| SD07 | Current-attention derivation remains independent from explicit inspection; exact owner/action remains visible/reachable. |
| SD08 | Durable-decision replies remain input only; later adopted canonical authority is required before stage completion. |
| SD09 | One GOVERNANCE proposal/adoption mechanism with R2 P2/P3 and DESIGN P4-P6 target/layer/base-hash admission. |
| SD10 | Existing SignedTaskBlock/parser/validator becomes materially non-vacuous. |
| SD11 | Typed R3 completion outcome becomes the primary Readiness verdict; maturity/currentness remains separate. |
| SD12 | Canonical Approval identity trim/nonblank plus readiness/currentness-first Approval hierarchy. |
| SD13 | One BUILDER checkpoint-request event with coordinator-owned execution of signed/resolved gates through existing validation. |
| SD14 | Positive no-production-delta for COMPLETE and governed-material semantics; existing canonical owners remain sufficient. |
| SD15 | Positive no-production-delta for OpenCode/provider/session/permission/failure architecture. |
| SD16 | Operator-first Settings hierarchy over existing canonical configuration/provider facts. |
| SD17 | Positive no-new-state recovery/current-attention disposition; existing canonical derivations remain owners. |
| SD18 | Required-input focus once per exact request identity at the Workbench-owned composer boundary. |
| SD19 | Permanent renderer, work-kind Research/downstream and System/Light/Dark component/theme certification closure. |

### Stable P3 technical-disposition ledger

| Functional requirement | Primary concern | Pair | Canonical P3 owner | Solution | Technical disposition |
|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | C01 | A01 | `GW-DOC-WORK-LIFECYCLE` | SD01 | NO_TECHNICAL_DELTA |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | C01 | A01 | `GW-DOC-WORK-LIFECYCLE` | SD01 | NO_TECHNICAL_DELTA |
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | C12 | A07 | `GW-DOC-WORK-LIFECYCLE` | SD13 | NO_TECHNICAL_DELTA |
| `GW-FR-004-INDEPENDENT-VALIDATION` | C20 | A11 | `GW-DOC-WORK-LIFECYCLE` | SD19 | VERIFICATION_DELTA |
| `GW-FR-005-LOCAL-WORKBENCH` | C05 | A04 | `GW-DOC-WORK-LIFECYCLE` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | C12 | A07 | `GW-DOC-WORK-LIFECYCLE` | SD13 | NO_TECHNICAL_DELTA |
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | C16 | A09 | `GW-DOC-WORK-LIFECYCLE` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | C22 | A02 | `GW-DOC-WORK-LIFECYCLE` | SD02 | TECHNICAL_DELTA |
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | C02 | A02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_TECHNICAL_DELTA |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | C02 | A02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_TECHNICAL_DELTA |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | C02 | A02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_TECHNICAL_DELTA |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | C03 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | TECHNICAL_DELTA |
| `GW-FR-014-SOURCE-FRESHNESS` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | C06 | A04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD08 | NO_TECHNICAL_DELTA |
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | C17 | A10 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD17 | NO_TECHNICAL_DELTA |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | C11 | A07 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD12 | NO_TECHNICAL_DELTA |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | TECHNICAL_DELTA |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | C06 | A04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD08 | TECHNICAL_DELTA |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-021-MARKDOWN-WORKSPACE` | C05 | A04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | C17 | A10 | `GW-DOC-MARKDOWN-WORKBENCH` | SD17 | NO_TECHNICAL_DELTA |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | C06 | A04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD08 | TECHNICAL_DELTA |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | C11 | A07 | `GW-DOC-MARKDOWN-WORKBENCH` | SD12 | NO_TECHNICAL_DELTA |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | C12 | A07 | `GW-DOC-MARKDOWN-WORKBENCH` | SD13 | NO_TECHNICAL_DELTA |
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | C13 | A08 | `GW-DOC-MARKDOWN-WORKBENCH` | SD14 | NO_TECHNICAL_DELTA |
| `GW-FR-029-NO-IDE-SCOPE` | C02 | A02 | `GW-DOC-MARKDOWN-WORKBENCH` | SD03 | NO_TECHNICAL_DELTA |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | TECHNICAL_DELTA |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | TECHNICAL_DELTA |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | C03 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD05 | NO_TECHNICAL_DELTA |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | TECHNICAL_DELTA |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | C03 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD05 | NO_TECHNICAL_DELTA |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | C03 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD05 | TECHNICAL_DELTA |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | C02 | A02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | TECHNICAL_DELTA |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | C04 | A03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | C04 | A03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_TECHNICAL_DELTA |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | C16 | A09 | `GW-DOC-INSTALLATION-READINESS` | SD16 | TECHNICAL_DELTA |
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | C07 | A05 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD09 | TECHNICAL_DELTA |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | C20 | A11 | `GW-DOC-LIFECYCLE-CONTEXT` | SD19 | VERIFICATION_DELTA |
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | C10 | A06 | `GW-DOC-SPECIFICATION-STANDARD` | SD11 | NO_TECHNICAL_DELTA |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | C15 | A09 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | C22 | A02 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD02 | TECHNICAL_DELTA |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | C15 | A09 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | C15 | A09 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | C20 | A11 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD19 | VERIFICATION_DELTA |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | C15 | A09 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | C22 | A02 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD02 | TECHNICAL_DELTA |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-201-OBSERVATIONAL-READS` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | C17 | A10 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_TECHNICAL_DELTA |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | C15 | A09 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | C06 | A04 | `GW-DOC-WORKBENCH-UX` | SD08 | TECHNICAL_DELTA |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | C01 | A01 | `GW-DOC-WORKBENCH-UX` | SD01 | NO_TECHNICAL_DELTA |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | C17 | A10 | `GW-DOC-WORKBENCH-UX` | SD07 | TECHNICAL_DELTA |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | C14 | A08 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_TECHNICAL_DELTA |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | C14 | A08 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_TECHNICAL_DELTA |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | C04 | A03 | `GW-DOC-WORKBENCH-UX` | SD04 | NO_TECHNICAL_DELTA |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | C17 | A10 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_TECHNICAL_DELTA |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | C10 | A06 | `GW-DOC-WORKBENCH-UX` | SD11 | NO_TECHNICAL_DELTA |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | C11 | A07 | `GW-DOC-WORKBENCH-UX` | SD12 | TECHNICAL_DELTA |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | C12 | A07 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_TECHNICAL_DELTA |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-219-EXPLICIT-CONTEXT` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | C10 | A06 | `GW-DOC-WORKBENCH-UX` | SD11 | TECHNICAL_DELTA |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | C11 | A07 | `GW-DOC-WORKBENCH-UX` | SD12 | TECHNICAL_DELTA |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | C12 | A07 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_TECHNICAL_DELTA |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | C13 | A08 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_TECHNICAL_DELTA |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | C18 | A10 | `GW-DOC-WORKBENCH-UX` | SD18 | TECHNICAL_DELTA |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | C17 | A10 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_TECHNICAL_DELTA |
| `GW-FR-227-CERTIFICATION-MATRIX` | C20 | A11 | `GW-DOC-WORKBENCH-UX` | SD19 | VERIFICATION_DELTA |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | C01 | A01 | `GW-DOC-WORKBENCH-UX` | SD01 | NO_TECHNICAL_DELTA |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | C15 | A09 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | C19 | A11 | `GW-DOC-WORKBENCH-UX` | SD19 | VERIFICATION_DELTA |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | C01 | A01 | `GW-DOC-WORKBENCH-UX` | SD01 | NO_TECHNICAL_DELTA |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | C19 | A11 | `GW-DOC-WORKBENCH-UX` | SD19 | VERIFICATION_DELTA |
| `GW-FR-235-GLOBAL-THEME-PARITY` | C19 | A11 | `GW-DOC-WORKBENCH-UX` | SD19 | VERIFICATION_DELTA |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | C05 | A04 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_TECHNICAL_DELTA |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | C15 | A09 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | C14 | A08 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_TECHNICAL_DELTA |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | C12 | A07 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_TECHNICAL_DELTA |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | C15 | A09 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_TECHNICAL_DELTA |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | C14 | A08 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_TECHNICAL_DELTA |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | C14 | A08 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_TECHNICAL_DELTA |

Ledger cardinality: **112 / 112** stable requirements, missing **0**, duplicate **0**.

`NO_TECHNICAL_DELTA` is valid only because the corresponding fresh DESIGN pair audit positively proved the existing canonical owner and producer/carrier/consumer realization. It is not permission to preserve implementation by default. A later implementation discovery that disproves such a row returns upstream.

### Package-local and non-stable R2 consequence ledger

| Functional consequence | Pair | Solution | Technical disposition | Binding R2 acceptance consequence |
|---|---|---|---|---|
| C01 package-local consequence | A01 | SD01 | TECHNICAL_DELTA | Product and lifecycle authority distinguish verified result from verified candidate, valid no-code terminal outcomes and EXECUTION-internal validation boundaries; the stable P2 cross-reference is exact. |
| C02 package-local consequence | A02 | SD03 | TECHNICAL_DELTA | Create uses governed work-kind defaults and Concerns; linked remediation has fixed same-project lineage; one functional source/reconciliation contract applies to created/discovered work. |
| C03 package-local consequence | A03 | SD05 | TECHNICAL_DELTA | Project/search filtering has one meaning with or without archived rows; diagnostics remain explicit. |
| C04 package-local consequence | A03 | SD04 | TECHNICAL_DELTA | Source/runtime ownership is singular at the functional level; exact documentation-Git commit paths are reviewed before confirmation. |
| C05 package-local consequence | A04 | SD07 | TECHNICAL_DELTA | Historical/supporting inspection cannot hide or make unreachable the exact current attention owner. |
| C06 package-local consequence | A04 | SD08 | TECHNICAL_DELTA | Authority-changing human input requires durable authority update/block; ordinary information/evidence may continue interaction. |
| C07 package-local consequence | A05 | SD09 | TECHNICAL_DELTA | R2 dispositions are explicit and permanent P2/P3 changes use the canonical proposal/adoption owner. |
| C08 package-local consequence | A05 | SD09 | TECHNICAL_DELTA | P4-P6 changes use one validated canonical-owner proposal/adoption path and do not create shadow architecture/contracts. |
| C09 package-local consequence | A06 | SD10 | TECHNICAL_DELTA | Implementation-required PLAN is materially non-vacuous, completely specified and has one canonical signed-task representation. |
| C10 package-local consequence | A06 | SD11 | TECHNICAL_DELTA | Dominant Readiness judgment is the canonical R3 outcome and defective packages return to the exact owning stage. |
| C11 package-local consequence | A07 | SD12 | TECHNICAL_DELTA | Approval shows readiness + currentness first, accepts only meaningful human identity and signs only the exact current package. |
| C12 package-local consequence | A07 | SD13 | TECHNICAL_DELTA | Signed tasks execute under canonical role/validation rules and required in-task architecture checkpoints are executable without ambient provider shell authority. |
| C13 package-local consequence | A08 | SD14 | NO_TECHNICAL_DELTA | COMPLETE is terminal and uses canonical verified-result/verified-candidate product language. |
| C14 package-local consequence | A08 | SD14 | NO_TECHNICAL_DELTA | Document/proposal/evidence/dialogue/currentness ownership remains explicit with no chat/activity authority shadow. |
| C15 package-local consequence | A09 | SD15 | NO_TECHNICAL_DELTA | Provider/session/input/failure behavior remains observable and bounded by Order authority; rejection preserves canonical state. |
| C16 package-local consequence | A09 | SD16 | TECHNICAL_DELTA | Settings keeps operator readiness/meaning/actions primary and technical identity secondary unless task-required. |
| C17 package-local consequence | A10 | SD17 | NO_TECHNICAL_DELTA | Canonical current attention/recovery remains visible/reachable through selection, failure and asynchronous convergence. |
| C18 package-local consequence | A10 | SD18 | TECHNICAL_DELTA | Responsive/focus/keyboard semantics hold; each new required-input request receives one non-repeating focus transition. |
| C19 package-local consequence | A11 | SD19 | VERIFICATION_DELTA | Every production renderer is covered by the canonical primitive ownership rule and one theme/component system. |
| C20 package-local consequence | A11 | SD19 | VERIFICATION_DELTA | Permanent certification covers the full kind/stage and representative cross-application theme/semantic-role matrices required by P3. |
| C21 package-local consequence | A01 | SD01 | TECHNICAL_DELTA | Public/product surfaces consistently use verified result/verified candidate and do not overclaim automatic delivery commits or universal execution. |
| C22 package-local consequence | A02 | SD02 | TECHNICAL_DELTA | Authority precedence/default/override/extension semantics resolve before provider interpretation and unresolved contradiction blocks. |

The R2 package's separate P2 precision corrections and Work Lifecycle non-ID clause correction remain bound through their owning concerns and SD01; they do not create another requirement namespace.

### Downstream PLAN handoff law

Every `TECHNICAL_DELTA` or `VERIFICATION_DELTA` above must map to one or more exact P7 implementation actions in the modular PLAN package. Every `NO_TECHNICAL_DELTA` must map to an explicit positive no-code/verification disposition. Concern-level PLAN coverage is insufficient as the sole proof.

## Existing capability/reuse and behavior to replace

Reuse:
- current `ProjectManifestSchema`, refs/precedence/governance grammar and project-pattern matcher;
- existing immutable ArtifactRef/GOVERNANCE role/context hashing/freshness graph;
- current artifact proposal/adoption event family and exact patch application;
- current HumanInput events;
- current SignedTaskBlock/ExecutionTask/Approval/Run/RunEvent types;
- current `runVerificationGate`, V0-V7 validation and gate evidence owner;
- existing QueuePlan/applyPlan source reconciliation;
- existing Workbench current-attention/material primitives, Git-status projection, R3 RunEvents, SignoffPackage, Settings queries, WorkOutcome;
- pinned Astryx 0.7.13 public Chat surface.

Replace/delete:
- create-path direct `WorkItemSchema.parse + storeWorkItem` registration branch;
- queue-local include-archived dataset ownership that bypasses app filtering;
- raw “Concern IDs” ordinary label and editable remediation Project selector;
- generic documentation-Git confirmation without exact path list;
- current-attention/material resolution that lets explicit selection hide the exact current owner;
- treatment of durable-decision reply as sufficient continuation without an adopted authority artifact;
- lifecycle-only proposal admission for R2/DESIGN;
- vacuous SignedTaskBlock acceptance;
- whitespace-only canonical approval identity;
- impossible builder instruction to execute shell gates directly;
- Readiness maturity-as-verdict, Approval missing readiness, Settings primary technical identity, Candidate done copy;
- incomplete renderer/scenario/theme certification.

Necessary new concepts are limited to:
1. a transient pure resolved-authority projection;
2. one new typed BUILDER checkpoint-request event.

Neither is a new domain state model.

## Technical architecture and data/control flow

### D1 — project authority resolution

```text
validated ProjectManifest
+ shell-expanded authority paths
+ validated literal precedence paths
        |
        v
core pure authority resolver
  - selected P1-P6
  - explicit same-layer precedence relation
  - inherited/override/extension bindings
  - resolved fitness gates
        |
        v
daemon authority context
        |
        +-> immutable current ArtifactRefs / manifest bytes
        +-> ordered resolved provider context
        +-> conformance/sign-off dependency closure
```

Semantic contradiction detection remains a stage responsibility because document meaning is semantic. The core does not infer which documents contradict. It supplies the exact explicit precedence/override relation so the stage cannot invent one.

### D2 — permanent authority proposal/adoption

```text
R2 or DESIGN provider
 -> ARTIFACT_PROPOSAL_CREATED
 -> pure target admission
      lifecycle proposal
      OR GOVERNANCE existing current authority path/layer allowed for this stage
 -> one pending proposal review
 -> explicit user ADOPT
 -> re-resolve target + base hash
 -> exact patch
 -> immutable ArtifactRef
 -> existing dependency invalidation/context refresh
 -> continue/re-conform owning stage
```

R2 target layers: P2/P3. DESIGN target layers: P4/P5/P6. No P1 mutation and no new permanent file through this path.

### D3 — durable-decision input

```text
HUMAN_INPUT_REQUESTED durable category
 -> HUMAN_INPUT_RECEIVED (decision input only)
 -> provider prepares lifecycle/permanent authority proposal
 -> explicit adoption
 -> later STAGE_COMPLETED permitted
```

A durable-category answer with no later adopted proposal cannot reach stage completion. Information/evidence categories are unchanged.

### D4 — signed checkpoint

```text
BUILDER provider turn
 -> GATE_CHECKPOINT_REQUESTED(gateId)
 -> coordinator validates signed task + current manifest + freshness
 -> existing runVerificationGate(current builder workspace)
 -> GATE_PASSED / GATE_FAILED + evidence
 -> same Run/session next provider turn
```

No checkpoint result substitutes for V3/V5/V7.

### D5 — source admission

```text
UI creation -> create source -> read/validate exact source --+
                                                            |
repository scan -> read/validate exact source --------------+-> one new-source QueuePlan -> applyPlan
```

The existing `origin = CREATED | DISCOVERED` value remains provenance only.

### D6 — queue and presentation

```text
active query + include-archived query
        |
app-selected canonical dataset
        |
project filter -> search filter
        |
WorkItemQueue rows
```

All other UI corrections remain projections of existing typed state.

## Canonical owner / affected boundaries

Permanent technical semantics changed only at:
- `GW-DOC-TECHNICAL-ARCHITECTURE` — authority resolution/module boundary;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE` — current attention, durable input presentation/focus, renderer certification;
- `GW-DOC-EXECUTION-CONTROL-PLANE` — in-task checkpoint orchestration;
- `GW-DOC-CANONICAL-CONTRACTS` — proposal, task, approval and checkpoint exact contracts.

No P5 ADR is required: these decisions refine the existing declared architecture and do not introduce an alternative architecture.

## Exact expected implementation surface

Production:
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/execution.ts`
- `src/daemon/stage.ts`
- `src/daemon/validation.ts`
- `src/daemon/work-item-source.ts`
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

Verification:
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`

Delivery metadata:
- `CHANGELOG.md`

Explicitly not implementation surface:
- `tests/architecture.test.ts` (architecture gate material);
- `pontivus-order.toml`;
- `package.json`, `bun.lock`;
- `.github/**`;
- P1-P6 documentation changed by DESIGN itself;
- persistence schema/migrations;
- HTTP API files unless implementation proves an already-designed browser transport is missing. Such discovery returns to DESIGN/PLAN; it is not inferred by the builder.

## Contract/state changes

- no WorkStage, WorkItem status/outcome, ArtifactRole, task state, persistence or HTTP shape change;
- SignedTaskBlock existing fields become non-vacuous under the exact constraints in P6;
- Approval `approvedBy` canonical string normalization becomes trim + nonblank;
- RunEventPayload gains one `GATE_CHECKPOINT_REQUESTED { gateId }` variant;
- artifact proposals gain exact non-lifecycle admission for current P2/P3 in R2 and P4-P6 in DESIGN; same event shape/state;
- HumanInputCategory shape unchanged; completion admission consumes category history.

## Decisions, rationale and rejected alternatives

1. **Pure resolved-authority projection, not provider inference.** Rejected: rely on manifest text in prompt. That reproduces C22.
2. **Reuse artifact proposal/adoption.** Rejected: P2/P3/P4/P6-specific proposal DTOs or direct agent writes.
3. **Durable decision input requires later adoption.** Rejected: chat transcript as authority or a new decision database.
4. **One checkpoint request event.** Rejected: grant shell/execute, parse natural-language requests, or create a second verification subsystem.
5. **Strengthen SignedTaskBlock.** Rejected: parallel PLAN task model.
6. **App owns queue dataset/filtering.** Rejected: duplicate filters in queue component.
7. **Focus Workbench-owned region.** Rejected: query pinned Astryx private textarea/contenteditable implementation or invent a non-existent public focus prop.
8. **Supplement certification outside architecture material.** Rejected: allow the signed implementation task to edit `tests/architecture.test.ts`, which would let it mutate a verification source that authorizes itself.

## Compatibility and preservation

Only canonical semantic invariants are preserved. No incidental 0.5.0 UI/code behavior is a compatibility target.

Historical schema pins, approvals and WorkItems remain interpretable under their pinned semantics. No data migration or API compatibility layer is required by this DESIGN.

## Failure/recovery behavior

- unresolved authority source/ref/precedence/override binding -> stage precondition/conformance block, never provider choice;
- semantic same-layer contradiction with no explicit precedence -> `CONTRADICTORY_AUTHORITY`;
- invalid permanent proposal target/layer/base hash -> reject before mutation;
- durable-decision answer without later adopted proposal -> stage completion rejected;
- vacuous signed package -> PLAN/R3 mechanical conformance failure;
- blank approval identity -> sign-off request rejected before persistence;
- unsigned/unresolved checkpoint gate -> provider result rejected;
- checkpoint gate failure -> correction only inside signed scope or upstream block; no candidate success;
- source/queue/UI failures retain existing canonical recovery owners;
- focus effect failure cannot alter workflow authority; browser certification covers intended behavior.

## Verification obligations

Before G4:
- DESIGN-A01..A11 pair audits PASS;
- H3 PASS;
- all C01-C22 DESIGN columns TECHNICAL_CLOSED;
- no material technical decision delegated to PLAN.

P7 must require:
- typecheck;
- architecture (read-only material);
- full test;
- build;
- browser;
- dependency-lock;
- exact tests for authority resolution/precedence/override, proposal target admission, durable-decision completion, signed-task non-vacuity, approval identity, checkpoint request/result, source singularity, queue filtering, Git path review, current attention, Readiness/Approval/Settings/result copy, focus-once, renderer coverage, scenario 41 and theme/component parity.

## Open technical questions

NONE.

Any implementation discovery requiring another production module, public transport/persistence shape, dependency, verification-material mutation or changed semantic owner is a DESIGN/PLAN stop, not builder discretion.
