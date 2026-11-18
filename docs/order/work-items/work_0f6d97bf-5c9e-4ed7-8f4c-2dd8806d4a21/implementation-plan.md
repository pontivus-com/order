<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Plan authority and basis

This is the sole current P7 implementation plan for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`.

It consumes only the post-governance G4 package at commit `4241922dd082a722c652b4baefde53f8ca785c8b`: `solution-design.md` blob `cb16001f29aeb7a4e47bec40a55bb3f62d7263e3`, exhaustive G3 `requirements.md` blob `92cad7491a89e3c498826ae697b37d00e7568532`, the current resolved P1-P6 authority graph, and the current WorkItem source. Current implementation, tests, UI, the 0.5.0 release, the superseded ten-path T1 plan and historical R3 conclusions remain evidence only and do not define the authorized 0.6.0 implementation surface.

The implementation worker may realize only the already-closed technical design. It may not choose a new product behavior, canonical owner, state meaning, persistence/transport shape, dependency, architecture direction, provider capability, compatibility fallback, or verification authority.

## Task topology

### Task T1 — implement the complete fresh 0.6.0 corrective candidate

**Objective:** implement the complete authority-driven 0.6.0 technical delta as one coherent candidate: resolve canonical project authority deterministically; extend the existing proposal/adoption path for permanent R2/DESIGN authority mutation; make durable decision input require later adopted authority; make signed PLAN/Approval/checkpoint contracts mechanically complete; converge UI-created and discovered WorkItems through one source-admission owner; correct queue/workbench/readiness/approval/settings/result/focus presentation; and close the permanent certification gaps.

**Dependencies:** none.

One signed task is required because Order starts every ExecutionTask from the same Approval baseline and does not promote a dependency task's candidate bytes into a later task workspace. The designed changes share canonical contracts, daemon orchestration, Workbench behavior and regression surfaces and must therefore be produced as one cumulative candidate rather than as fake dependent tasks.

## Ordered internal implementation steps and architecture-feedback checkpoints

### Step 1 — canonical authority resolution and governed authority mutation

1. Extend the existing pure `src/core/governance.ts` owner so validated manifest inputs resolve same-layer precedence, inherited/default/override/extension bindings and fitness-gate bindings deterministically.
2. Keep pattern expansion/effects at the existing shell boundary; do not move filesystem/provider effects into the core.
3. Update `src/daemon/authority.ts` / `src/daemon/stage.ts` to consume the resolved projection before productive provider context is admitted.
4. Extend the existing artifact proposal/adoption path for permanent GOVERNANCE proposals:
   - R2 may target only current P2/P3 owners;
   - DESIGN may target only current P4-P6 owners;
   - target path/layer/ref/base hash must re-resolve through current authority;
   - reuse the existing proposal event/adoption state machine; introduce no P2/P3/P4/P6 proposal DTO/model family.
5. For authority-changing `STAGE_CHOICE`, `AUTHORITY_DECISION` and `AUTHORITY_CONFLICT` input, keep the existing HumanInput carrier but reject stage completion until a later adopted authority proposal proves durable resolution.

**Checkpoint A:** run `typecheck`, `architecture` and the relevant core/daemon `test` coverage. `tests/architecture.test.ts` is read-only verification material; a need to modify it is a DESIGN/PLAN stop.

### Step 2 — signed task, approval and in-task checkpoint contracts

1. Strengthen the existing SignedTaskBlock validation in the current canonical contract/core owners so executable plans cannot be vacuous:
   - at least one materially specified task when implementation is required;
   - nonblank task id/objective;
   - nonempty justified acceptance/authority/concern/gate bindings;
   - bounded scope/changeSurface and exact existing P6 legality.
2. Normalize canonical Approval `approvedBy` by trimming and reject blank identity before persistence.
3. Add exactly one typed `GATE_CHECKPOINT_REQUESTED { gateId }` RunEvent variant for BUILDER use.
4. The coordinator validates that the checkpoint gate is signed/resolved for the task, executes it through the existing validation effect owner, and records ordinary gate result/evidence. Do not grant provider shell/execute capability and do not create another verification subsystem.
5. Preserve V0-V7, task state, WorkItem state and persistence/HTTP ownership.

**Checkpoint B:** run `typecheck`, `architecture` and relevant core/daemon `test` coverage including negative task, approval and checkpoint cases.

### Step 3 — singular WorkItem source admission and queue/intake ownership

1. In `src/daemon/work-item-source.ts`, factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan.
2. Route browser-created and repository-discovered source snapshots through that same planner and existing `applyPlan` persistence boundary.
3. Delete the direct create-path WorkItem construction/store branch.
4. Preserve source create/read-back, provenance, source diagnostics, reconciliation and source-authority freshness semantics.
5. In Create, present **Concerns** as ordinary language and make linked-remediation Project fixed to the parent.
6. In `app.tsx`, own active/include-archived dataset selection plus project/search filtering once; `WorkItemQueue` receives the filtered rows and archive-toggle callback.

**Checkpoint C:** run `typecheck`, `architecture`, relevant daemon `test` coverage and queue/create browser coverage.

### Step 4 — Workbench truth hierarchy, durable-input UX and product language

1. Documentation Git confirmation must expose the exact governed changed paths/states before commit confirmation.
2. Keep explicit historical/material inspection, but never let it hide the exact current-attention owner/action; render compact current attention when selected material differs.
3. Required-input focus occurs once per new required-input event id at the Workbench-owned composer region; do not inspect private Astryx DOM or steal focus by polling.
4. Readiness presents the typed R3 completion verdict as the dominant judgment; material maturity/currentness remains separate.
5. Approval presents **Ready for sign-off** and **Current** before technical package identity when the package is current; stale/history states must not fabricate readiness.
6. Settings keeps operator meaning/readiness/actions primary; exact roots/endpoint/model-list source move to existing Technical details except when exact paths are the active configuration task.
7. Product surfaces use current P2 terminology: public Order identity and **Verified candidate** for `CANDIDATE_DONE`; do not prettify lifecycle enums into product copy.

**Checkpoint D:** run `typecheck`, `architecture` and the relevant Workbench/browser tests for Git review, attention, input focus, Readiness, Approval, Settings and terminal copy.

### Step 5 — permanent certification closure

1. Extend `tests/certification.test.ts` with exhaustive production-renderer classification against the current canonical renderer matrix. Do not edit `tests/architecture.test.ts`.
2. Extend existing core/daemon/browser/workbench-presentation suites for:
   - authority precedence/default/override/extension;
   - proposal target/layer/base-hash admission;
   - durable-decision completion rejection until adopted authority;
   - SignedTaskBlock non-vacuity;
   - Approval identity normalization;
   - signed checkpoint request/result/failure;
   - singular source admission;
   - archive/project/search filtering;
   - exact documentation-Git path review;
   - current-attention visibility;
   - Readiness/Approval/Settings/result language;
   - focus-once behavior;
   - scenario 41 work-kind/Research/downstream matrix;
   - representative System/Light/Dark semantic-role/component parity.
3. Tests prove authority-derived behavior. They must not freeze incidental 0.5.0 implementation/UI structure.

**Checkpoint E:** run `typecheck`, `architecture`, full `test`, `build` and `browser`.

### Step 6 — candidate closeout

1. Update `CHANGELOG.md [Unreleased]` with the user-visible/correctness consequences of the authorized 0.6.0 implementation.
2. Run the complete signed gate union on the exact final candidate: `dependency-lock`, `typecheck`, `architecture`, `test`, `build`, `browser`.
3. Complete V4 independent semantic review against the exact diff, including FCIS/SoC/DRY/strict typing/no-DTO/no-OOP, canonical ownership, no hidden fallback, cohesive module responsibility and negative-case completeness.
4. Complete V5/V6/V7 with no reuse of gate evidence invalidated by later edits.
5. T1 ends only at canonical `CANDIDATE_DONE` or valid `ALREADY_SATISFIED`. PR merge/release delivery remains outside ExecutionTask completion.

## Requirement/design traceability

| Fresh design obligation | P7 realization |
|---|---|
| C01/C21 correct product terminal semantics/language | Step 4: README + TerminalResult projection; no lifecycle-state change |
| C22-F01 deterministic same-layer authority/default/override/extension resolution | Step 1: core governance + daemon authority context |
| C02-F01/F02 intake/remediation presentation | Step 3 |
| C02-F03/C04-F01 one productive source-admission owner | Step 3 |
| C03-F01 archive/project/search coherence | Step 3 |
| C04-F02 exact documentation-Git review | Step 4 |
| C05-F01 current-attention visibility | Step 4 |
| C06-F01 durable authority-changing input | Step 1 + Step 4 |
| C07-F01/C08-F01 permanent authority proposal/adoption | Step 1 |
| C09-F01 non-vacuous executable plan contract | Step 2 |
| C10-F01 typed R3 verdict projection | Step 4 |
| C11-F01/F02 Approval hierarchy + nonblank operator identity | Step 2 + Step 4 |
| C12-F01 signed in-task architecture checkpoint | Step 2 |
| C16-F01 operator-first Settings hierarchy | Step 4 |
| C18-F01 one-time required-input focus | Step 4 |
| C19-F01 renderer-matrix permanent certification | Step 5 |
| C20-F02/F03 work-kind and cross-theme/component certification | Step 5 |
| C13/C14/C15/C17 | PLAN_COVERED by explicit no-production-delta disposition: their fresh functional/technical semantics remain owned by existing canonical owners; T1 may not alter them except where a listed cross-cutting correction consumes their existing contracts |

### C01-C22 PLAN coverage

| Concern | PLAN coverage |
|---|---|
| C01 | Step 4, product-language projection only |
| C02 | Step 3 |
| C03 | Step 3 |
| C04 | Steps 3-4 |
| C05 | Step 4 |
| C06 | Steps 1/4 |
| C07 | Step 1 |
| C08 | Step 1 |
| C09 | Step 2 |
| C10 | Step 4 |
| C11 | Steps 2/4 |
| C12 | Step 2 |
| C13 | no production delta; terminal contract protected by Step 4 regression + full gates |
| C14 | no new material/proposal model; existing proposal model reused in Step 1 |
| C15 | no provider capability expansion; Step 2 explicitly preserves denied ambient shell |
| C16 | Step 4 |
| C17 | no new attention/recovery state; existing pure owner consumed by Step 4 |
| C18 | Step 4 |
| C19 | Step 5 |
| C20 | Steps 5-6 |
| C21 | Step 4 |
| C22 | Step 1 |

Every implementation action above traces to a fresh R2/DESIGN obligation or required delivery metadata. There is no cleanup/refactor task without upstream justification.

## Module ownership and decomposition constraints

- `src/core/*` owns canonical typed meaning and pure policy only.
- `src/daemon/*` owns orchestration over canonical contracts; it must not absorb filesystem/provider effect mechanics that belong to shell.
- `src/daemon/work-item-source.ts` remains the sole daemon source-orchestration owner; source admission is consolidated there rather than duplicated.
- Existing proposal/adoption, validation and RunEvent owners are extended; no parallel decision/proposal/checkpoint subsystem is permitted.
- Workbench feature renderers remain presentation adapters over canonical data and existing primitives; no view-model/DTO family, feature-local state machine, palette, layout system or theme owner is permitted.
- `tests/architecture.test.ts` and `pontivus-order.toml` are immutable to T1 because they are verification/authority material.
- A minimum same-layer physical split is permitted only when required to preserve an already-approved responsibility/effect boundary and it preserves semantic ownership, public contracts, state meaning, effect boundaries and dependency direction. Any other new production path or architecture change returns to DESIGN/PLAN before editing.

## Expected production and validation surface

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

### Explicitly excluded
- `AGENTS.md`
- `docs/**` during T1 implementation
- `pontivus-order.toml`
- `tests/architecture.test.ts`
- `src/shell/**`
- `src/daemon/server.ts`
- `ui/src/http.ts`, `ui/src/query-keys.ts`, `ui/src/theme.css`
- `package.json`, `bun.lock`, `.github/**`
- persistence schema/migrations, new HTTP endpoints/shapes, dependency changes and version bump

Discovery that an excluded/new surface is materially required is a stop/return to DESIGN/PLAN, not implementation discretion.

## Required deletions/replacements

T1 must remove or replace the incorrect path rather than layer compatibility behavior over it:

- direct create-path WorkItem construction/persistence beside QueuePlan/applyPlan;
- queue-local include-archived dataset ownership that bypasses the App-owned project/search derivation;
- raw ordinary **Concern IDs** label and editable linked-remediation Project choice;
- generic documentation-Git confirmation that omits the exact changed path set;
- material selection behavior that hides the exact current-attention owner;
- durable authority-changing chat reply being treated as sufficient completion without adopted authority;
- lifecycle-only proposal admission where R2/DESIGN must mutate current permanent owners;
- vacuous SignedTaskBlock acceptance;
- whitespace-only Approval identity;
- builder instruction to execute signed gates through ambient provider shell;
- Readiness maturity used as verdict;
- Approval presentation without canonical readiness/currentness;
- Settings technical identity dominating operator meaning/actions;
- generic enum-prettification of `CANDIDATE_DONE`;
- incomplete renderer/work-kind/theme certification.

No compatibility shim, duplicate model or fallback path may preserve these defects.

## Completion evidence

T1 is complete only when the exact candidate proves all of the following:

1. one deterministic project-authority resolution path exists and same-layer unresolved contradiction blocks before provider choice;
2. R2/DESIGN permanent authority proposals are target/layer/base-hash validated and reuse one proposal/adoption state machine;
3. authority-changing input cannot complete the stage until later adopted authority exists;
4. signed task blocks reject materially vacuous execution packages;
5. Approval identity is canonicalized and blank identity is rejected;
6. BUILDER checkpoint requests are signed/resolved, executed by coordinator-owned validation, and cannot grant ambient shell capability;
7. browser-created and repository-discovered sources persist through one source-admission/applyPlan owner;
8. archive inclusion preserves project/search filtering;
9. exact documentation-Git paths are visible before confirmation;
10. current attention remains visible/reachable during historical/material inspection;
11. Readiness, Approval, Settings, terminal language and required-input focus match the fresh functional authority;
12. renderer, scenario-41 and System/Light/Dark certification gaps are permanently closed;
13. no unauthorized file, authority/verification material, dependency, persistence/API shape or semantic owner changed;
14. all six signed gates pass on the final candidate;
15. independent V4 semantic review passes and V5/V6 find no governance breach or bloat.

## Minimum-change forecast

Expected semantic change is limited to the exact `changeSurface` in the canonical task block below.

New persistent state: **none**.  
New persistence schema/migration: **none**.  
New public HTTP API/transport family: **none**.  
New dependency/configuration format: **none**.  
New lifecycle/WorkItem/task state: **none**.  
New proposal/decision DTO/model family: **none**.  
New runtime concept: exactly one typed `GATE_CHECKPOINT_REQUESTED` event plus one transient pure resolved-authority projection, both already authorized by DESIGN.

The file list is an exact signed authorization boundary, not a reason to violate SoC. If a required architecture-preserving same-layer split becomes necessary, execution stops and PLAN is refreshed/re-signed with the exact additional path before any edit.

## Verification contract

The signed logical gate union is:

- `dependency-lock`
- `typecheck`
- `architecture`
- `test`
- `build`
- `browser`

The `architecture` gate is mandatory and its material `tests/architecture.test.ts` is read-only to T1.

The candidate must additionally pass V0-V7 under `GW-DOC-VALIDATION-STANDARD-V1`, including V4 independent semantic review, V5 architecture/governance review and V6 minimum-change review. Existing tests are evidence only; a green regression that encodes superseded 0.5.0 behavior must be corrected only when the fresh authority/design explicitly requires that behavior to change and the correction lies inside the signed surface.

Public repository delivery occurs after candidate completion under `GW-DOC-PUBLIC-REPOSITORY-DELIVERY`; it is not an ExecutionTask step and no version bump is authorized here.

## Open questions

Implementation-blocking questions: **NONE**.  
Architecture questions: **NONE**.  
Authority conflicts: **NONE**.

Any newly discovered material question returns to its owning lifecycle stage.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the complete fresh Order 0.6.0 authority-driven corrective design as one cumulative candidate: close the resolved authority/proposal/input/task/checkpoint/source/workbench/certification defects without introducing parallel semantic owners, DTOs, new lifecycle state, persistence/API families, dependencies, or implementation-derived product semantics.",
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
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
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
