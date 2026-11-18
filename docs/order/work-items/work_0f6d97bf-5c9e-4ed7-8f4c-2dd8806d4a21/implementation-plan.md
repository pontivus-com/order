<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Plan authority and modular package

This file is the deterministic canonical P7 lifecycle artifact for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. It remains the sole carrier of the canonical `order-tasks` block required by the lifecycle contract.

The exhaustive implementation specification is authored modularly under `implementation-plan/` and compiled in full into this root artifact. The directory files are maintainable phase sources, not independent P7 authorities. Their exact blob manifest proves which source components produced the compiled snapshot. A source component whose blob differs from the manifest requires root regeneration before PLAN can be current.

This PLAN consumes the exhaustive R2 functional package `requirements.md`, the regenerated requirement-level DESIGN `solution-design.md`, the resolved P1-P6 authority graph and the current WorkItem source. Current implementation/UI/tests/0.5.0/history remain evidence only.

## Exact phase-component manifest

| Component | Exact Git blob |
|---|---|
| `implementation-plan/00-governance.md` | `501912214a2e58f433cb7e1e4bb25be92bc3e26a` |
| `implementation-plan/01-a01-lifecycle-product.md` | `4aac2e36f01d03631cec2654647a0b6d0f5a9f53` |
| `implementation-plan/02-a02-governance-intake.md` | `9c4b1b1abf14c7cfd5495c65d9849d27bb714804` |
| `implementation-plan/03-a03-queue-source.md` | `655ecefda7ba57e040ceb8982de118e0fd6cc77c` |
| `implementation-plan/04-a04-workbench-research.md` | `d68868090575b8dbed4099de93cbed58ac60cffa` |
| `implementation-plan/05-a05-requirements-design.md` | `331667dde4ecaf965bf46dcebb9653e9e63422a1` |
| `implementation-plan/06-a06-plan-readiness.md` | `88e0228ada9fd1acd4627203e84ddd90cb2a3edd` |
| `implementation-plan/07-a07-approval-execution.md` | `269d5c51d6bec3f8a9636b705441c33a91e2880f` |
| `implementation-plan/08-a08-complete-materials.md` | `597296ca51904323fd181f5d6c6e80e6b5f96c77` |
| `implementation-plan/09-a09-provider-settings.md` | `d5c15589f939b883fa2cf02a3c28a210c0b5a9f1` |
| `implementation-plan/10-a10-recovery-accessibility.md` | `c0bdc7fdd261c4dd0850919b845636cd83415418` |
| `implementation-plan/11-a11-component-certification.md` | `89b8d728101d36b65a3467a6afae1aee89e3c652` |
| `implementation-plan/12-action-catalog.md` | `124cf4deb441888532e1083e4aad556e0ca37053` |
| `implementation-plan/13-verification-closeout.md` | `0374716b657e3a3b87687721c3e84fdfd3848886` |

R3 must verify every listed current path resolves to the exact blob above and that the root contains the compiled phase specification. The directory components contain no independent lifecycle status, normative execution authority or second `order-tasks` block; Approval binds the complete compiled root bytes.

## T1 topology

There is exactly one cumulative execution task, **T1**. The eleven A01-A11 phase files are ordered implementation phases inside T1, not independently signed ExecutionTasks. This preserves the canonical single-Approval-baseline execution model.

Detailed action definitions are owned by `implementation-plan/12-action-catalog.md`; verification/checkpoint allocation is owned by `implementation-plan/13-verification-closeout.md`.

Implementation order:

1. A01 lifecycle/product
2. A02 governance/intake
3. A03 queue/source
4. A04 Workbench/Research
5. A05 Requirements/DESIGN authority mutation
6. A06 PLAN/R3
7. A07 Approval/Execution
8. A08 Complete/materials
9. A09 Provider/Settings
10. A10 Recovery/accessibility
11. A11 component/certification
12. shared regression closure and candidate closeout

A phase may reuse an action defined earlier/later only as explicitly referenced in its requirement rows. Architecture-feedback checkpoints A-E remain mandatory at the boundaries defined in the verification component.

## Exhaustive traceability invariant

The package is incomplete unless all of the following are true:

- all **112** stable P3 requirements in R2 occur exactly once across phase files 01-11;
- every package-local/non-stable R2 consequence has a phase row;
- every requirement/consequence maps to one or more `SDxx` DESIGN solutions;
- every technical/verification delta maps to one or more `IAxx` actions;
- every positive no-code disposition has explicit final verification and an upstream return rule if disproved;
- every IA action maps upward to accepted DESIGN/R2 authority;
- no material P1-P6 choice is left to implementation.

## Exact signed implementation surface

### Production
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

### Verification
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`

### Delivery metadata
- `CHANGELOG.md`

### Explicit exclusions
- `.github/**`
- `AGENTS.md`
- `bun.lock`
- `docs/**`
- `package.json`
- `pontivus-order.toml`
- `src/shell/**`
- `src/daemon/server.ts`
- `tests/architecture.test.ts`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/theme.css`

Discovery of a materially required excluded/new surface is a stop and return to DESIGN/PLAN. The signed file list must never force duplicate responsibility.

## Minimum-change and architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no-OOP/no-DTO, authority-before-inference and minimum change remain binding. Existing owners/capabilities are reused only where DESIGN positively selected them. No compatibility shim, shadow model, service/repository/controller family, new persistence/API family, dependency, lifecycle state, provider capability or feature-local UI/theme system is authorized.

New runtime concepts remain limited to the two already-designed concepts:

1. one transient pure resolved-authority projection;
2. one typed `GATE_CHECKPOINT_REQUESTED { gateId }` BUILDER event.

## Completion evidence

T1 is complete only when every phase row and every IA action has its required positive/negative proof, the exact final changed surface is authorized, Checkpoints A-E are satisfied, the six signed logical gates pass on the final candidate, and V0-V7 complete with fresh V4/V5/V6 evidence.

Public PR merge/release/version bump remains outside T1.

## Open questions

Implementation-blocking questions: **NONE in the signed design; PLAN is currently under fresh revalidation after requirement-level traceability regeneration.**
Architecture questions: **NONE in the signed design.**
Authority conflicts: **NONE in R2/DESIGN; any newly discovered conflict returns upstream.**

## Compiled modular phase specification

The directory files are the maintainable authoring decomposition for this PLAN. The text below is the canonical compiled P7 snapshot consumed by sign-off/execution. The root artifact remains the sole normative P7 authority; directory files carry no independent execution authority. Any directory change requires regeneration of this compiled section and the exact blob manifest before PLAN can be current.

---

### Compiled component: `implementation-plan/00-governance.md`

#### 0.6.0 modular implementation-plan governance

This directory is the detailed phase decomposition of the **single** P7 plan package. The deterministic lifecycle artifact remains `../implementation-plan.md`; that root file carries the one canonical `order-tasks` block and an exact blob manifest for every phase file in this directory.

The directory does not create parallel plans. A phase file owns only the detailed traceability and implementation obligations delegated to it by the root PLAN. Campaign status remains owned only by `0.6.0-design-campaign-plan.md`.

##### Closure law

The package is exhaustive only when:

```text
every R2 stable requirement
+ every package-local/non-stable R2 consequence
        -> exactly one or more DESIGN solution dispositions
        -> exact IA implementation action(s) OR positive NO_CODE disposition
        -> exact verification proof
```

The reverse direction must also hold: every IA action must trace to at least one accepted DESIGN solution and R2 obligation.

##### Phase order

1. A01 lifecycle/product
2. A02 governance/intake
3. A03 queue/source
4. A04 Workbench/Research
5. A05 Requirements/DESIGN authority mutation
6. A06 PLAN/R3
7. A07 Approval/Execution
8. A08 Complete/materials
9. A09 Provider/Settings
10. A10 Recovery/accessibility
11. A11 component/certification
12. shared implementation-action catalog
13. shared verification/closeout contract

The ordering is an implementation feedback order inside cumulative task T1, not eleven independent ExecutionTasks.

##### Architectural constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no-OOP/no-DTO, minimum change and authority-before-inference remain binding. No phase may invent another lifecycle/source/readiness/task/proposal/provider/theme/verification model.

Current implementation, tests, rendered UI, 0.5.0 and historical design remain evidence only. Reuse is permitted only where the current DESIGN has positively selected the existing canonical owner/capability.

##### Stop conditions

Return to DESIGN/PLAN before implementation if execution requires a new semantic owner, public contract, state meaning, persistence/transport shape, dependency direction, external dependency, provider capability, verification authority, or behavior outside the signed package.


---

### Compiled component: `implementation-plan/01-a01-lifecycle-product.md`

#### A01 — Lifecycle and product identity

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C01 + C21.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **5** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | C01 | `GW-DOC-WORK-LIFECYCLE` | SD01 | NO_CODE / IA24 verification |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | C01 | `GW-DOC-WORK-LIFECYCLE` | SD01 | NO_CODE / IA24 verification |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | C01 | `GW-DOC-WORKBENCH-UX` | SD01 | NO_CODE / IA24 verification |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | C01 | `GW-DOC-WORKBENCH-UX` | SD01 | NO_CODE / IA24 verification |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | C01 | `GW-DOC-WORKBENCH-UX` | SD01 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C01 package-local R2 consequence | SD01 | NO_CODE — SD01 preserves canonical lifecycle/runtime semantics; IA24 revalidates them. |
| C21 package-local R2 consequence | SD01 | IA19 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD01 | Preserve canonical lifecycle/result semantics; change only public/terminal product-language projection where required. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA19** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/02-a02-governance-intake.md`

#### A02 — Project governance and WorkItem intake

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C22 + C02.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **8** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | C22 | `GW-DOC-WORK-LIFECYCLE` | SD02 | IA01, IA02 |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-029-NO-IDE-SCOPE` | C02 | `GW-DOC-MARKDOWN-WORKBENCH` | SD03 | NO_CODE / IA24 verification |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | C02 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD03 | IA11 |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | C22 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD02 | IA01, IA02 |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | C22 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD02 | IA01, IA02 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C22 package-local R2 consequence | SD02 | IA01, IA02 |
| C02 package-local R2 consequence | SD03 | IA09, IA10, IA11 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD02 | Resolve same-layer precedence plus P1 default/override/extension/fitness bindings in the pure governance core before productive provider context. |
| SD03 | Correct Create presentation to canonical Concerns language and fixed same-project remediation context; no new command/schema. |
| SD04 | Converge UI-created and repository-discovered WorkItems through one daemon new-source QueuePlan/applyPlan admission owner. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA01** — execute the exact action defined in `12-action-catalog.md`.
- **IA02** — execute the exact action defined in `12-action-catalog.md`.
- **IA09** — execute the exact action defined in `12-action-catalog.md`.
- **IA10** — execute the exact action defined in `12-action-catalog.md`.
- **IA11** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/03-a03-queue-source.md`

#### A03 — Queue, source admission and documentation Git

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C03 + C04.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **25** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | C03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | IA09, IA10 |
| `GW-FR-014-SOURCE-FRESHNESS` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | IA09, IA10 |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | IA13 |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | IA13 |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | C03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD05 | NO_CODE / IA24 verification |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD06 | IA13 |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | C03 | `GW-DOC-MARKDOWN-WORKBENCH` | SD05 | NO_CODE / IA24 verification |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | C03 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD05 | IA12 |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | C04 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | C04 | `GW-DOC-MARKDOWN-WORKBENCH` | SD04 | NO_CODE / IA24 verification |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | C04 | `GW-DOC-WORKBENCH-UX` | SD04 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C03 package-local R2 consequence | SD05 | IA12 |
| C04 package-local R2 consequence | SD04 | IA09, IA10, IA13 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD04 | Converge UI-created and repository-discovered WorkItems through one daemon new-source QueuePlan/applyPlan admission owner. |
| SD06 | Reuse canonical documentation-Git status/path facts and show exact governed paths/states before commit confirmation. |
| SD05 | Own active/include-archived dataset selection and project/search derivation once at App level. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA09** — execute the exact action defined in `12-action-catalog.md`.
- **IA10** — execute the exact action defined in `12-action-catalog.md`.
- **IA12** — execute the exact action defined in `12-action-catalog.md`.
- **IA13** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/04-a04-workbench-research.md`

#### A04 — Workbench current attention and Research input

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C05 + C06.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **18** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | C05 | `GW-DOC-WORK-LIFECYCLE` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | C06 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD08 | NO_CODE / IA24 verification |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | C06 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD08 | IA03, IA04 |
| `GW-FR-021-MARKDOWN-WORKSPACE` | C05 | `GW-DOC-MARKDOWN-WORKBENCH` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | C06 | `GW-DOC-MARKDOWN-WORKBENCH` | SD08 | IA03, IA04 |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-201-OBSERVATIONAL-READS` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | C06 | `GW-DOC-WORKBENCH-UX` | SD08 | IA03, IA04 |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-219-EXPLICIT-CONTEXT` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | C05 | `GW-DOC-WORKBENCH-UX` | SD07 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C05 package-local R2 consequence | SD07 | IA14 |
| C06 package-local R2 consequence | SD08 | IA03, IA04, IA14 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD07 | Keep current-attention derivation independent of explicit inspected material and keep the exact owner/action visible and reachable. |
| SD08 | Treat durable-decision human replies as input only; require later adopted canonical authority before stage completion. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA03** — execute the exact action defined in `12-action-catalog.md`.
- **IA04** — execute the exact action defined in `12-action-catalog.md`.
- **IA14** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/05-a05-requirements-design.md`

#### A05 — Requirements and DESIGN authority mutation

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C07 + C08.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **1** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | C07 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD09 | IA03 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C07 package-local R2 consequence | SD09 | IA03 |
| C08 package-local R2 consequence | SD09 | IA03 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD09 | Reuse one proposal/adoption mechanism for permanent GOVERNANCE mutations with stage-specific P2/P3 vs P4-P6 target/layer/base-hash admission. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA03** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/06-a06-plan-readiness.md`

#### A06 — PLAN contract and R3 readiness

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C09 + C10.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **3** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | C10 | `GW-DOC-SPECIFICATION-STANDARD` | SD11 | NO_CODE / IA24 verification |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | C10 | `GW-DOC-WORKBENCH-UX` | SD11 | NO_CODE / IA24 verification |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | C10 | `GW-DOC-WORKBENCH-UX` | SD11 | IA16 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C09 package-local R2 consequence | SD10 | IA05 |
| C10 package-local R2 consequence | SD11 | IA16 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD11 | Project the typed R3 outcome as the primary Readiness verdict; material maturity/currentness remains separate. |
| SD10 | Strengthen the existing SignedTaskBlock/parser/validator so an implementation-required package cannot be vacuous. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA05** — execute the exact action defined in `12-action-catalog.md`.
- **IA16** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/07-a07-approval-execution.md`

#### A07 — Approval and execution checkpoints

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C11 + C12.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **10** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | C12 | `GW-DOC-WORK-LIFECYCLE` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | C12 | `GW-DOC-WORK-LIFECYCLE` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | C11 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD12 | NO_CODE / IA24 verification |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | C11 | `GW-DOC-MARKDOWN-WORKBENCH` | SD12 | NO_CODE / IA24 verification |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | C12 | `GW-DOC-MARKDOWN-WORKBENCH` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | C11 | `GW-DOC-WORKBENCH-UX` | SD12 | IA06, IA17 |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | C12 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | C11 | `GW-DOC-WORKBENCH-UX` | SD12 | IA17 |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | C12 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_CODE / IA24 verification |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | C12 | `GW-DOC-WORKBENCH-UX` | SD13 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C11 package-local R2 consequence | SD12 | IA06, IA17 |
| C12 package-local R2 consequence | SD13 | IA07, IA08 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD13 | Add one BUILDER checkpoint-request event; coordinator executes only signed/resolved gates through the existing validation owner. |
| SD12 | Normalize Approval identity canonically and present readiness/currentness before technical package identity. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA06** — execute the exact action defined in `12-action-catalog.md`.
- **IA07** — execute the exact action defined in `12-action-catalog.md`.
- **IA08** — execute the exact action defined in `12-action-catalog.md`.
- **IA17** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/08-a08-complete-materials.md`

#### A08 — Complete and governed materials

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C13 + C14.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **7** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | C13 | `GW-DOC-MARKDOWN-WORKBENCH` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | C13 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | C14 | `GW-DOC-WORKBENCH-UX` | SD14 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C13 package-local R2 consequence | SD14 | NO_CODE — SD14 positive no-production-delta; IA24 preserves terminal semantics. |
| C14 package-local R2 consequence | SD14 | NO_CODE — SD14 positive no-production-delta; IA24 preserves material semantics. |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD14 | Positive no-production-delta: existing COMPLETE/material/proposal/evidence owners already satisfy the reconstructed functional obligations. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- No dedicated production action. This phase is a positive no-production-delta disposition and is verified under IA24.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/09-a09-provider-settings.md`

#### A09 — Provider/OpenCode and Settings

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C15 + C16.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **21** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | C16 | `GW-DOC-WORK-LIFECYCLE` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | NO_CODE / IA24 verification |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | C16 | `GW-DOC-INSTALLATION-READINESS` | SD16 | IA18 |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | C15 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | C15 | `GW-DOC-WORKBENCH-UX` | SD15 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C15 package-local R2 consequence | SD15 | NO_CODE — SD15 positive no-production-delta; IA24 preserves provider boundary. |
| C16 package-local R2 consequence | SD16 | IA18 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD16 | Recompose Settings around operator readiness/meaning/actions while retaining exact technical identity under Technical details except active path-entry tasks. |
| SD15 | Positive no-production-delta: existing OpenCode/provider/session/permission/failure architecture already satisfies the reconstructed functional obligations. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA18** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/10-a10-recovery-accessibility.md`

#### A10 — Recovery, current attention and accessibility

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C17 + C18.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **7** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | C17 | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | C17 | `GW-DOC-MARKDOWN-WORKBENCH` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | C17 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | C17 | `GW-DOC-WORKBENCH-UX` | SD07 | IA14 |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | C17 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_CODE / IA24 verification |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | C18 | `GW-DOC-WORKBENCH-UX` | SD18 | IA15 |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | C17 | `GW-DOC-WORKBENCH-UX` | SD17 | NO_CODE / IA24 verification |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C17 package-local R2 consequence | SD17 | NO_NEW_STATE — SD17 retained; IA14 consumes the existing current-attention owner. |
| C18 package-local R2 consequence | SD18 | IA15 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD17 | Positive no-new-state disposition: existing recovery/current-attention/coherence owners remain canonical; presentation corrections consume them. |
| SD07 | Keep current-attention derivation independent of explicit inspected material and keep the exact owner/action visible and reachable. |
| SD18 | Move focus once to the relevant required-input composer keyed by exact request identity; never poll-steal focus or inspect private Astryx DOM. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA14** — execute the exact action defined in `12-action-catalog.md`.
- **IA15** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/11-a11-component-certification.md`

#### A11 — Component/theme consistency and certification

**Role:** subordinate phase specification of the single 0.6.0 P7 plan package rooted at `../implementation-plan.md`.  
**Upstream authority:** `requirements.md`, `solution-design.md`, resolved P1-P6 authority.  
**Concerns:** C19 + C20.

This phase is not a second implementation plan and owns no lifecycle status. It expands the root PLAN's traceability for this concern pair. Current implementation/tests/UI are evidence only and never define desired behavior.

##### Stable functional requirements

This phase accounts for **7** manifest-canonical stable P3 requirements.

| Functional requirement | Primary concern | Canonical P3 owner | DESIGN solution | P7 implementation disposition |
|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | C20 | `GW-DOC-WORK-LIFECYCLE` | SD19 | IA23, IA24 |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | C20 | `GW-DOC-LIFECYCLE-CONTEXT` | SD19 | IA23, IA24 |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | C20 | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION` | SD19 | IA23 |
| `GW-FR-227-CERTIFICATION-MATRIX` | C20 | `GW-DOC-WORKBENCH-UX` | SD19 | IA21, IA22, IA23 |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | C19 | `GW-DOC-WORKBENCH-UX` | SD19 | IA20, IA22 |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | C19 | `GW-DOC-WORKBENCH-UX` | SD19 | IA20, IA22 |
| `GW-FR-235-GLOBAL-THEME-PARITY` | C19 | `GW-DOC-WORKBENCH-UX` | SD19 | IA22 |

Every `NO_CODE / IA24 verification` disposition is positive preservation of already-proven canonical realization, not a current-state fallback. A later implementation discovery that disproves that positive disposition returns to DESIGN/PLAN.

##### Package-local R2 consequences

The stable-ID inventory is not the complete functional package. The concern-level R2 consequences in `requirements.md` remain binding and are mapped here separately.

| Functional consequence | DESIGN solution | P7 implementation disposition |
|---|---|---|
| C19 package-local R2 consequence | SD19 | IA20, IA22 |
| C20 package-local R2 consequence | SD19 | IA20, IA21, IA22, IA23, IA24 |

##### Technical solutions consumed

| Solution | Technical disposition |
|---|---|
| SD19 | Close permanent renderer, work-kind Research/downstream and System/Light/Dark component/theme certification gaps using existing verification owners. |

These solution IDs are local traceability keys for this WorkItem. Permanent technical semantics remain owned by the referenced P4-P6 canonical documents.

##### Implementation actions

- **IA20** — execute the exact action defined in `12-action-catalog.md`.
- **IA21** — execute the exact action defined in `12-action-catalog.md`.
- **IA22** — execute the exact action defined in `12-action-catalog.md`.
- **IA23** — execute the exact action defined in `12-action-catalog.md`.
- **IA24** — execute the exact action defined in `12-action-catalog.md`.

##### Phase completion proof

This phase is complete only when:

1. every stable requirement row above resolves to one technical solution and one implementation/no-code disposition;
2. every package-local R2 consequence resolves to a technical solution and implementation/no-code disposition;
3. every referenced IA action is fully satisfied against its exact file/symbol surface;
4. all phase-relevant positive and negative assertions in `13-verification-closeout.md` pass;
5. no material P1-P6 decision is made by the implementation worker;
6. any disproved no-code disposition returns upstream rather than being silently implemented.


---

### Compiled component: `implementation-plan/12-action-catalog.md`

#### 0.6.0 implementation action catalog

**Role:** shared detailed action definitions for the single cumulative T1.  
**Authority:** each IA action is downstream of `requirements.md` and `solution-design.md`; this file cannot create product or architecture decisions.

##### IA01 — pure project-authority resolution

**Owners/anchors:** `src/core/governance.ts` — existing authority-layer, concern, material and freshness pure functions.  
**Required change:** add the minimum pure resolution operation over validated manifest inputs and shell-expanded paths that determines same-layer precedence plus inherited P1 default/override/extension and fitness-gate bindings.  
**Must not:** perform filesystem/provider I/O, infer semantic contradiction, introduce a DTO/service/repository/class hierarchy or parallel authority graph.  
**Proof:** core tests cover ordering, defaults, override/extension, unresolved invalid inputs and deterministic equality.

##### IA02 — consume resolved authority before productive context

**Owners/anchors:** `src/daemon/authority.ts` — `resolveStageContextState`, `resolveStageContext`, approval/material closure; `src/daemon/stage.ts` — `stagePrompt` / stage admission.  
**Required change:** consume IA01's resolved projection before provider context/conformance/sign-off dependency construction.  
**Must not:** move semantic resolution into provider prompts or browser state.  
**Proof:** daemon tests prove provider context sees only resolved authority and blocks invalid/unresolved bindings.

##### IA03 — one GOVERNANCE proposal/adoption mechanism

**Owners/anchors:** `src/core/contracts.ts` ArtifactRef/proposal/RunEvent contracts; `src/core/governance.ts`; `src/daemon/stage.ts` `proposalDisposition`, `proposalAdoptionRequest`, `adoptArtifactProposal`, `reconcilePendingArtifactProposals`.  
**Required change:** extend the existing proposal path so R2 may target only current manifest-resolved P2/P3 owners and DESIGN only current P4/P5/P6 owners, with exact role/layer/path/base-hash re-resolution before adoption.  
**Must not:** introduce stage-specific proposal DTOs, direct agent writes or a second decision store.  
**Proof:** core/daemon negative tests reject wrong layer/path/hash/stale targets; adoption emits the existing immutable ArtifactRef/freshness consequences.

##### IA04 — durable-decision completion admission

**Owners/anchors:** `src/core/lifecycle.ts` `evaluateStageCompletion`, `validateStageProviderTurn`, input/proposal derivation; `src/daemon/stage.ts` `runStageTurn`, `submitRunInput`.  
**Required change:** after the latest answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT request, reject stage completion until a later proposal adoption proves durable authority.  
**Must not:** persist chat as authority or create a new decision state machine.  
**Proof:** core/daemon chronology tests cover adopted, rejected, cancelled, stale and ordinary INFORMATION/EVIDENCE input.

##### IA05 — non-vacuous signed task contract

**Owners/anchors:** `src/core/contracts.ts` SignedTaskBlock/task schemas; `src/core/execution.ts` `parseSignedTaskBlockFromPlan`; `src/daemon/authority.ts` `validateTaskDefinitions`.  
**Required change:** enforce implementation-required plans contain at least one materially specified task with nonblank id/objective and nonempty justified scope/changeSurface/acceptance/gates/authority/concerns under existing legality rules.  
**Must not:** create another task representation.  
**Proof:** exact positive/negative parser and R3/sign-off validation tests.

##### IA06 — canonical Approval identity normalization

**Owners/anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts` `signOffWorkItem`.  
**Required change:** trim `approvedBy` at canonical parsing/admission and reject whitespace-only identity before persistence.  
**Must not:** leave the invariant browser-owned.  
**Proof:** direct daemon/contract negative tests plus browser feedback test.

##### IA07 — typed BUILDER checkpoint request

**Owners/anchors:** `src/core/contracts.ts` RunEvent payload; `src/core/execution.ts` `builderProviderTags`, `providerEventIsAdmitted`.  
**Required change:** add exactly `GATE_CHECKPOINT_REQUESTED { gateId }`, admitted only as the terminal action of a BUILDER provider turn.  
**Must not:** admit STAGE/REVIEWER/REMEDIATOR use or carry result/evidence in the request.  
**Proof:** role/event admission tests.

##### IA08 — coordinator-owned signed checkpoint execution

**Owners/anchors:** `src/daemon/execution.ts` execution turn/reaction functions including `executeMutatingRun` / `executePostSignoffRun`; `src/daemon/validation.ts` `runRequiredGates`, gate evidence/result owners.  
**Required change:** validate signed gate/current manifest/freshness, execute the gate in the current builder workspace through existing validation effects, record existing GATE_PASSED/GATE_FAILED evidence, then continue the same Run/session.  
**Must not:** grant provider shell/execute, create persisted checkpoint state or substitute checkpoint evidence for V3/V5/V7.  
**Proof:** daemon checkpoint pass/fail/unsigned/stale/continuation tests.

##### IA09 — singular new-source planner

**Owners/anchors:** `src/daemon/work-item-source.ts` `reconcileWorkItemSources`, `createWorkItemFromSource`.  
**Required change:** factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan for a validated source snapshot.  
**Must not:** add another source model or persistence path.  
**Proof:** unit/integration tests show created/discovered inputs produce equivalent admission plans except provenance.

##### IA10 — converge created/discovered persistence

**Owners/anchors:** `src/daemon/work-item-source.ts` `createWorkItemFromSource`, repository reconciliation/applyPlan owner.  
**Required change:** route UI-created and discovered source snapshots through IA09 and the existing applyPlan persistence boundary; delete direct create-path WorkItem construction/store.  
**Proof:** daemon tests prove one persistence owner, source read-back and diagnostics/freshness remain intact.

##### IA11 — canonical Create interaction

**Owner/anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required change:** ordinary vocabulary is **Concerns**; linked remediation shows parent project as fixed context and cannot offer an invalid cross-project choice.  
**Proof:** browser tests for ordinary creation and linked remediation.

##### IA12 — one archive/project/search queue derivation

**Owners/anchors:** `ui/src/app.tsx` `App`; `ui/src/WorkItemQueue.tsx` `WorkItemQueue`.  
**Required change:** App selects active versus include-archived canonical dataset, then applies project/search filtering exactly once; queue receives filtered rows and archive-toggle behavior.  
**Must not:** retain queue-local alternate filter semantics.  
**Proof:** browser matrix for active/archived × project × search.

##### IA13 — exact documentation-Git review

**Owner/anchors:** `ui/src/DocumentWorkspace.tsx` `DocumentationGitConfirmation`, existing documentation status/path projection.  
**Required change:** confirmation lists exact governed changed paths/states before commit.  
**Must not:** create a second Git path/status owner.  
**Proof:** browser assertions for exact paths and state labels, including negative stale/conflict cases.

##### IA14 — current attention remains visible during inspection

**Owners/anchors:** `src/core/lifecycle.ts` `deriveCurrentAttention` remains canonical; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts` material/summary derivation.  
**Required change:** keep historical/supporting inspection but render the exact higher-priority current attention owner/action visibly and directly reachable whenever selected material differs.  
**Must not:** create browser workflow policy or clear legitimate historical selection merely to show attention.  
**Proof:** presentation/browser cases for required input, proposal, blocker, stale/recovery and historical selection.

##### IA15 — focus once per required-input request

**Owners/anchors:** `ui/src/ActivityComposer.tsx` `ActivityComposer`; `ui/src/ActivityWorkspace.tsx` `StageRunMaterial`.  
**Required change:** on a newly current required-input event id, move focus once to the Workbench-owned composer region; do not refocus on polling/rerender.  
**Must not:** inspect private Astryx DOM/API or add workflow state.  
**Proof:** browser focus-once, rerender and responsive continuity cases.

##### IA16 — canonical Readiness verdict projection

**Owner/anchor:** `ui/src/ReadinessWorkspace.tsx` `ReadinessWorkspace` plus existing presentation helper owner.  
**Required change:** dominant verdict is the typed R3 completion outcome; material maturity/currentness is separate supporting state.  
**Proof:** browser/presentation tests for READY_FOR_SIGNOFF, RETURN_TO_* and BLOCKED, including stale material.

##### IA17 — Approval readiness/currentness hierarchy

**Owner/anchor:** `ui/src/SignoffReview.tsx` `SignoffReview`.  
**Required change:** present canonical readiness and package currentness before technical package identity; stale/history states never fabricate readiness.  
**Proof:** browser/presentation tests for current/stale package states.

##### IA18 — operator-first Settings hierarchy

**Owner/anchors:** `ui/src/SettingsWorkspace.tsx` `SettingsWorkspace`, `RepositorySettings`, `ModelRuntimeSettings`.  
**Required change:** readiness, meaning and available operator actions are primary; exact roots/endpoints/model-source/credential-like identity moves to existing Technical details except where an active Add/Move/configuration task requires the exact value.  
**Must not:** alter canonical configuration/provider models.  
**Proof:** browser tests for normal settings, attention/blockers and active configuration tasks.

##### IA19 — product-language projection

**Owners/anchors:** `README.md`; `ui/src/TerminalResult.tsx` `TerminalResult`; `ui/src/workbench-presentation.ts` result labels.  
**Required change:** public/product surfaces use verified result as umbrella and **Verified candidate** for CANDIDATE_DONE; implementation remains conditional; no automatic delivery overclaim.  
**Must not:** prettify internal enums into product copy.  
**Proof:** presentation/browser copy assertions.

##### IA20 — exhaustive production-renderer classification certification

**Owner:** `tests/certification.test.ts`.  
**Required change:** derive/check complete production renderer coverage against the canonical Workbench renderer-to-primitive matrix, including currently omitted renderers such as ActivityComposer.  
**Must not:** edit `tests/architecture.test.ts` or create a second UI registry.  
**Proof:** test fails for an unclassified production renderer and passes the current approved set.

##### IA21 — scenario-41 work-kind certification

**Owners:** `tests/browser.spec.ts` plus existing fixture/helpers.  
**Required change:** certify all four WorkItem kinds' Work request and Research information contracts and preserve distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind matrix, not label-only assertions.

##### IA22 — System/Light/Dark component and semantic-role parity

**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required change:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states render the canonical component language and semantic roles under System/Light/Dark.  
**Authority:** Workbench component architecture and Workbench theme.  
**Proof:** semantic role/component assertions rather than incidental pixel snapshots.

##### IA23 — targeted core/daemon/presentation regression closure

**Owners:** `tests/core.test.ts`, `tests/daemon.test.ts`, `tests/workbench-presentation.test.ts`, with browser coverage where interaction is material.  
**Required change:** add positive and negative proofs for IA01-IA19: authority resolution, proposal admission, durable decisions, task non-vacuity, Approval identity, checkpoint flow, source singularity, queue filtering, Git review, attention, Readiness/Approval/Settings/result language and focus.  
**Proof:** every production IA action has at least one owned regression and all negative invariants remain explicit.

##### IA24 — candidate closeout

**Owner/surface:** `CHANGELOG.md` plus coordinator-owned validation evidence.  
**Required change:** record user-visible/correctness consequences under Unreleased; run dependency-lock, typecheck, architecture, test, build and browser on the exact final candidate; complete V0-V7 with fresh V4/V5/V6 and no stale evidence reuse after edits.  
**Terminal:** only CANDIDATE_DONE or valid ALREADY_SATISFIED. PR merge/release/version bump remain outside T1.


---

### Compiled component: `implementation-plan/13-verification-closeout.md`

#### 0.6.0 verification and closeout contract

This file owns the detailed verification allocation inside the single P7 task. It does not create a second validation model; all semantics remain owned by `GW-DOC-VALIDATION-STANDARD-V1`, project gate bindings and canonical contracts.

##### Architecture-feedback checkpoints

| Checkpoint | After | Required gates/evidence |
|---|---|---|
| A | IA01-IA04 | typecheck, architecture, relevant core/daemon tests |
| B | IA05-IA08 | typecheck, architecture, task/Approval/checkpoint core+daemon tests |
| C | IA09-IA12 | typecheck, architecture, source/queue daemon+browser tests |
| D | IA13-IA19 | typecheck, architecture, Workbench/browser/presentation tests |
| E | IA20-IA23 | typecheck, architecture, full test, build, browser |

A checkpoint is feedback inside T1 and never substitutes for V3/V5/V7.

##### Requirement-level verification law

For every row in phase files 01-11:

- a CHANGE disposition is proven by its IA-specific positive assertion, at least one negative assertion and the applicable checkpoint/final gates;
- a NO_CODE disposition is revalidated under V1/V4/V5/V6 and the final six-gate union; if current evidence disproves the positive no-change proof, execution stops and returns to DESIGN/PLAN;
- tests prove authority-derived behavior and may not preserve incidental 0.5.0 behavior.

##### Test-owner allocation

| Action family | Primary verification owners |
|---|---|
| IA01-IA05 | tests/core.test.ts, tests/daemon.test.ts |
| IA06-IA10 | tests/core.test.ts, tests/daemon.test.ts |
| IA11-IA19 | tests/browser.spec.ts, tests/workbench-presentation.test.ts, targeted daemon/core tests where canonical ingress applies |
| IA20 | tests/certification.test.ts |
| IA21-IA22 | tests/browser.spec.ts, tests/workbench-presentation.test.ts |
| IA23 | all existing targeted suites above |
| IA24 | complete logical gate union + V0-V7 |

##### Final gate union

- dependency-lock
- typecheck
- architecture
- test
- build
- browser

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock/workflow metadata and other signed authority/verification material remain outside T1's implementation surface.

##### Final semantic review

V4/V5/V6 must explicitly verify:

- FCIS and pure/core versus daemon/shell/UI boundaries;
- SoC and cohesive module responsibility;
- DRY/canonical ownership;
- strict typing;
- no OOP/DTO/service/repository/controller/shadow-model family;
- no hidden fallback/compatibility path;
- exact signed surface and no unrelated cleanup;
- no implementation-derived product semantics;
- every phase row still traces R2 -> DESIGN -> IA/no-code -> proof;
- no phase file or action introduces a material decision not present in signed DESIGN.

Any failure requiring a P1-P6 semantic choice is BLOCKED_SPEC_OR_DESIGN / upstream return, not an implementation repair.


## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the complete fresh Order 0.6.0 authority-driven corrective design as one cumulative candidate, executing every requirement-level technical delta and verification delta in the signed modular PLAN package while preserving each positive no-code disposition and introducing no parallel semantic owner, DTO, lifecycle state, persistence/API family, dependency or implementation-derived product semantics.",
      "dependsOn": [],
      "scope": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/execution.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/work-item-source.ts",
        "ui/src/ActivityComposer.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/app.tsx",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts",
        "CHANGELOG.md"
      ],
      "exclusions": [
        ".github/**",
        "AGENTS.md",
        "bun.lock",
        "docs/**",
        "package.json",
        "pontivus-order.toml",
        "src/shell/**",
        "src/daemon/server.ts",
        "tests/architecture.test.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/theme.css"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-PROJECT-GOVERNANCE-INTEGRATION",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1",
        "GW-DOC-SYSTEM-BRIEF-V1"
      ],
      "changeSurface": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/execution.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/work-item-source.ts",
        "ui/src/ActivityComposer.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/app.tsx",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts",
        "CHANGELOG.md"
      ],
      "gateIds": [
        "architecture",
        "browser",
        "build",
        "dependency-lock",
        "test",
        "typecheck"
      ],
      "authorityRefs": [
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-MINIMUM-CHANGE",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "ui",
        "verification"
      ]
    }
  ]
}
```
