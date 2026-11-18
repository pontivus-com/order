<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

> **CURRENT STATUS — STALE / PLAN NOT STARTED.** This file remains the **sole canonical P7 implementation-plan artifact for this WorkItem**, but its former task content is non-current and authorizes nothing until fresh R1/R2/DESIGN closure and PLAN regeneration. C20-F01 invalidated the upstream completeness proof on which the prior task set was based. The planning mechanics, validation discipline and prior task analysis remain reusable evidence, but T1, its one-task topology, exact ten-path scope/changeSurface, exclusions and no-production-delta dispositions are not currently authorized. No alternate implementation/prerequisite/remediation plan may supersede this file; PLAN corrections are made here after the campaign-control gates permit PLAN.

## Exact task units/dependencies/objectives

### Task T1 — implement the complete 0.6.0 corrective candidate

**Objective:** implement the complete technical delta defined by the accepted `solution-design.md` as one coherent candidate: consolidate WorkItem source admission at the existing daemon owner and correct Create/remediation, queue/archive filtering, Readiness, Approval and Settings projections without changing canonical contracts, verification material, architecture ownership, dependencies or public APIs.

**Dependencies:** none.

This is deliberately one signed task. Order execution starts every ExecutionTask from the same Approval baseline and does not promote one task candidate into another task's workspace. The production corrections and their shared browser regression file therefore belong to one cumulative implementation task rather than multiple nominally dependent tasks.

### Ordered internal implementation steps

1. **Source-admission canonicalization**
   - In `src/daemon/work-item-source.ts`, factor one daemon-local new-source admission planner that maps an exact validated source snapshot + resolved project + canonical origin/provenance into the existing `QueuePlan { disposition: "REGISTERED", ... }`.
   - Route repository discovery and `createWorkItemFromSource` through that same mapping and the existing `applyPlan` persistence boundary.
   - Delete the create-path direct WorkItem construction/persistence branch.
   - Preserve source-file create/read-back before projection, `CREATED | DISCOVERED` provenance, same-project remediation validation, source diagnostics and explicit reconcile semantics.
   - Add daemon/integration regression proof in `tests/daemon.test.ts`.

   **Architecture-feedback checkpoint:** run the manifest `typecheck`, `architecture` and `test` gates before proceeding. The architecture gate material is read-only; a need to modify it is a DESIGN/PLAN stop condition.

2. **Create/remediation and queue ownership correction**
   - In `ui/src/CreateWorkItem.tsx`, present **Concerns** rather than **Concern IDs**.
   - For linked remediation, render Project as fixed parent-project context and do not expose an editable Project selector.
   - In `ui/src/app.tsx`, own active and include-archived WorkItem queries, `showArchived`, project filtering and search filtering as one queue/global presentation boundary.
   - In `ui/src/WorkItemQueue.tsx`, remove ownership of the include-archived server query; receive the already-filtered canonical rows plus archive-toggle state/callback while retaining row-local restore mutation presentation.
   - Add browser regression proof in `tests/browser.spec.ts`.

   **Architecture-feedback checkpoint:** run `typecheck` and `architecture`; execute the relevant browser coverage before moving to later UI corrections.

3. **Readiness and Approval truth projection**
   - In `ui/src/ReadinessWorkspace.tsx`, derive the dominant Readiness verdict from canonical R3 `STAGE_COMPLETED.completion.outcome` already present in loaded RunEvents. Material maturity/currentness remains a separate presentation fact and never substitutes for the verdict.
   - In `ui/src/SignoffReview.tsx`, present the current exact package as **Ready for sign-off** plus **Current** before technical package identity when `AWAITING_SIGNOFF` has a current package; retain stale/returned/historical behavior from existing canonical facts.
   - Do not parse lifecycle Markdown to infer either judgment and do not add readiness state to WorkItem, ArtifactRef, Approval or SignoffPackage.
   - Add browser regression proof in `tests/browser.spec.ts`.

   **Architecture-feedback checkpoint:** run `typecheck` and `architecture`; execute the relevant Readiness/Approval browser coverage.

4. **Settings information-hierarchy correction**
   - In `ui/src/SettingsWorkspace.tsx`, keep project/readiness/operator actions primary in connected-repository inventory.
   - Move exact Git root and resolved WorkItem document root into existing secondary technical-detail/disclosure presentation for ordinary inventory.
   - Keep exact paths directly visible where Add repository or Move WorkItem documents makes the path the current operator task.
   - Remove the ordinary raw Model list source API diagnostic block.
   - Reuse existing Settings projections and Workbench primitives; add no browser readiness policy or new configuration state.
   - Add browser regression proof in `tests/browser.spec.ts`.

   **Architecture-feedback checkpoint:** run `typecheck` and `architecture`; execute the relevant Settings browser coverage.

5. **Integrated candidate validation closure**
   - Complete the change-specific daemon/browser regression cases without editing signed verification material.
   - Update `CHANGELOG.md` under `[Unreleased]` with the observable 0.6.0 corrective behavior.
   - Run the complete signed gate union: `dependency-lock`, `typecheck`, `architecture`, `test`, `build`, `browser`.
   - Perform the independent semantic review required by the validation architecture: confirm one source-registration owner/path, App-owned queue/global query/filter semantics, no duplicate state/DTO/model/mapper/service/repository/controller, no architecture-material mutation and no change outside signed scope.
   - T1 ends at the verified `CANDIDATE_DONE` (or valid `ALREADY_SATISFIED`) outcome produced by the canonical V0-V7 execution/validation chain. Commit/push/PR/merge/release-packager delivery is not an ExecutionTask step.

## Requirement/design traceability

### Implementation-required design obligations

| Design obligation | Functional authority / acceptance | P7 realization |
|---|---|---|
| C02 ordinary concerns + fixed same-project remediation | `GW-FR-012-CATALOG-DRIVEN-AUTHORING`, `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | T1 step 2 |
| C03 identical project/search semantics with archived inclusion | `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE`, `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | T1 step 2 |
| C04 one productive source-admission/reconciliation owner | `GW-FR-018-SOURCE-CONSUMER-CLOSURE`, `GW-TR-001-FCIS-CANONICAL-OWNERSHIP` | T1 step 1 |
| C10 canonical R3 verdict dominates Readiness | `GW-FR-221-READINESS-REVIEW-HIERARCHY`, `GW-FR-241-DERIVED-MATERIAL-MATURITY` | T1 step 3 |
| C11 exact-package readiness + currentness dominate Approval | `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS`, `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | T1 step 3 |
| C16 operator meaning/actions primary; technical identity secondary | `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION`, `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS`, `GW-TR-059-CANONICAL-SETTINGS-READINESS-PROJECTION` | T1 step 4 |
| C18/C19 responsive/accessibility/component-language constraints on changed UI | `GW-TR-089-CURRENT-ATTENTION-OWNERSHIP`, `GW-TR-094-CLOSED-WORKBENCH-SCREEN-COMPOSITION` | T1 steps 2-4 + existing architecture/browser gates |
| C20 integrated certification and negative-case proof | `GW-DOC-SPECIFICATION-STANDARD-V2`, `GW-DOC-VALIDATION-STANDARD-V1` | T1 steps 1-5 + full gate union + independent semantic review |

### No-production-delta concerns

The following concerns are plan-covered without an implementation edit because G4 established that their required semantics are already present in the approved baseline and no technical delta is authorized:

- **C01, C21:** the P2/P3 clarification is already in the signed baseline; runtime lifecycle/result contracts remain unchanged.
- **C05-C09:** current lifecycle/document/conformance owners already realize the closed functional behavior.
- **C12-C15:** execution/validation/material/provider owners already realize the closed functional behavior.
- **C17:** existing pure current-attention/recovery ownership remains unchanged.
- **C22:** project-governance/authority integration remains unchanged.

T1's authority set, exclusions, unchanged architecture gate and final semantic review explicitly protect these no-change obligations from incidental implementation drift.

### Bidirectional coverage proof

**Design -> task:** every G4 obligation that requires repository transition is mapped above to T1 and to an ordered internal implementation step. G4 obligations that require no repository transition have an explicit no-production-delta disposition and are protected by T1's exclusions/gates/review rather than manufacturing unnecessary edits.

**Task -> design:** every T1 production/test/delivery action is justified by C02/C03/C04/C10/C11/C16/C18/C19/C20 or by the repository-delivery requirement to update `CHANGELOG.md`. T1 contains no unrelated cleanup, dependency upgrade, authority rewrite, API/schema change or speculative refactor.

### Per-concern PLAN disposition

| Concern | PLAN coverage |
|---|---|
| C01 | PLAN_COVERED — no runtime delta; already-realized lifecycle/result taxonomy is protected by T1 authority/exclusions/gates. |
| C02 | PLAN_COVERED — T1 step 2. |
| C03 | PLAN_COVERED — T1 step 2. |
| C04 | PLAN_COVERED — T1 step 1. |
| C05 | PLAN_COVERED — no technical delta; Workbench shell/navigation owner remains unchanged and outside scope. |
| C06 | PLAN_COVERED — no technical delta; R1 interaction/orchestration remains unchanged and outside scope. |
| C07 | PLAN_COVERED — no technical delta; R2 authority-disposition interaction remains unchanged and outside scope. |
| C08 | PLAN_COVERED — no technical delta; DESIGN interaction/material behavior remains unchanged and outside scope. |
| C09 | PLAN_COVERED — no technical delta; PLAN/task-authoring runtime contracts remain unchanged and outside scope. |
| C10 | PLAN_COVERED — T1 step 3. |
| C11 | PLAN_COVERED — T1 step 3. |
| C12 | PLAN_COVERED — no technical delta; execution/validation ownership remains unchanged and outside scope. |
| C13 | PLAN_COVERED — no technical delta; COMPLETE/result/follow-up behavior remains unchanged and outside scope. |
| C14 | PLAN_COVERED — no technical delta; material/proposal/evidence/dialogue ownership remains unchanged and outside scope. |
| C15 | PLAN_COVERED — no technical delta; provider/session/activity ownership remains unchanged and outside scope. |
| C16 | PLAN_COVERED — T1 step 4. |
| C17 | PLAN_COVERED — no technical delta; current-attention/recovery algebra remains unchanged and outside scope. |
| C18 | PLAN_COVERED — T1 changed UI must preserve responsive/accessibility semantics and is certified by existing architecture/browser gates. |
| C19 | PLAN_COVERED — T1 uses only existing Workbench/Astryx composition; no theme/primitive change is authorized. |
| C20 | PLAN_COVERED — T1 step 5 plus full gate union and independent semantic review. |
| C21 | PLAN_COVERED — no runtime delta; verified-result/product-intent authority clarification is already in the approved baseline. |
| C22 | PLAN_COVERED — no governance/authority integration change; manifest/authority files are explicitly excluded. |

## Module ownership/decomposition constraints and architecture-feedback checkpoints

### Ownership constraints

- `src/core/*` remains canonical typed meaning/pure policy; T1 changes no core file.
- `src/shell/*` remains filesystem/Git/provider effect ownership; T1 changes no shell file.
- `src/daemon/work-item-source.ts` remains the single source-orchestration owner; the new planner is daemon-local same-owner factoring, not a new semantic layer.
- `ui/src/app.tsx` remains application destination + queue/global query/filter owner.
- `WorkItemQueue.tsx`, `CreateWorkItem.tsx`, `ReadinessWorkspace.tsx`, `SignoffReview.tsx` and `SettingsWorkspace.tsx` remain functional presentation adapters over canonical typed inputs and existing Workbench primitives.
- no behavior-bearing class, DTO/model family, mapper, service/repository/controller graph, second browser store, second readiness/source/queue state owner or new production module is authorized.

### Verification-material constraint

`tests/architecture.test.ts` and `pontivus-order.toml` are immutable to T1. The former is the current `architecture` gate's signed `VERIFICATION_MATERIAL`; the latter is the project manifest. A worker may not mutate the material that defines/resolves its own execution/verification authority.

If implementation requires a change to either file, another verification material source, a P1-P6 authority, dependency direction, public contract, state meaning, persistence schema, transport shape or external dependency, execution stops and returns to DESIGN/PLAN.

### Architecture-feedback checkpoints

The ordered internal steps above use the existing manifest gates as feedback. They are not new lifecycle stages:

- after source-admission canonicalization: `typecheck` + `architecture` + `test`;
- after queue/Create ownership changes: `typecheck` + `architecture` + relevant `browser` coverage;
- after Readiness/Approval: `typecheck` + `architecture` + relevant `browser` coverage;
- after Settings: `typecheck` + `architecture` + relevant `browser` coverage;
- before candidate completion: all six signed gates.

A failed checkpoint is repaired only within the existing approved design. A failure showing architecture/contract/authority insufficiency returns upstream.

## Expected production and test/validation surface

### Production

Expected changed production files are exactly:

- `src/daemon/work-item-source.ts`
- `ui/src/app.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/SettingsWorkspace.tsx`

No new production file is expected.

### Test / validation

Expected changed ordinary regression files are exactly:

- `tests/daemon.test.ts`
- `tests/browser.spec.ts`

The existing `tests/architecture.test.ts` must run unchanged.

### Delivery metadata

Expected changed delivery metadata:

- `CHANGELOG.md`

No version bump occurs in the implementation PR; version ownership remains with the later dedicated release PR.

## Required deletions/replacements

T1 must delete/replace the following incorrect paths rather than layer compatibility behavior over them:

1. direct create-path WorkItem projection construction + `storeWorkItem(...)` registration in `createWorkItemFromSource`;
2. ordinary **Concern IDs** authoring label;
3. editable Project choice in linked remediation;
4. `WorkItemQueue.tsx` ownership of the include-archived server query;
5. Readiness verdict text derived from material maturity/currentness;
6. Approval primary judgment that communicates currentness without explicit canonical readiness;
7. primary repository-inventory Git-root/document-root identity columns;
8. ordinary Settings Model list source raw API diagnostic presentation.

Do not keep hidden fallbacks, dual paths or compatibility aliases for these superseded behaviors.

## Completion evidence

T1 is complete only when all of the following are evidenced on the exact candidate:

1. `src/daemon/work-item-source.ts` has one new-source registration mapping/persistence path; `createWorkItemFromSource` writes/read-backs the canonical source then uses that shared admission path.
2. Daemon tests prove CREATED and DISCOVERED registration share source-derived mapping while preserving provenance and prove Create does not reconcile unrelated external source drift.
3. Create browser coverage proves **Concerns** and fixed same-project linked remediation.
4. Queue browser coverage proves project/search filters behave identically before/after archived inclusion.
5. Readiness browser coverage proves the exact R3 outcome owns the verdict and material selection/currentness cannot replace it.
6. Approval browser coverage proves **Ready for sign-off** + **Current** precede technical package identity for a current package and stale/history states do not fabricate readiness.
7. Settings browser coverage proves ordinary inventory prioritizes operator state/actions, technical paths remain available secondarily/when task-relevant, and the raw model API source is absent.
8. Existing architecture fitness passes unchanged.
9. Independent semantic review confirms FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO/minimum-change compliance and no unauthorized changed path.
10. All six signed gates pass.
11. `CHANGELOG.md [Unreleased]` records the observable correction inside the verified candidate.

Public PR metadata, permanent PR verification, release-packager verification and the explicit merge decision occur only after T1 has produced the verified candidate; they are repository-delivery evidence, not T1 completion evidence.

## Minimum-change forecast

### Expected semantic change surface

- **Production:** 7 existing files.
- **Ordinary regression tests:** 2 existing files.
- **Delivery metadata:** 1 existing file.
- **New production modules:** none.
- **New test modules:** none.
- **New state:** none.
- **New schema:** none.
- **New persistence/table/index/migration:** none.
- **New dependency or lockfile change:** none.
- **New configuration/manifest field:** none.
- **New abstraction family/service/repository/controller/DTO/mapper:** none.
- **New public API/HTTP endpoint/JSON shape:** none.
- **New provider/OpenCode behavior:** none.
- **P1-P6 authority changes:** none.
- **Verification-material changes:** none.

### Signed-surface variance rule

The current T1 `changeSurface` is exact and immutable after sign-off. It authorizes only the ten literal paths in the canonical `order-tasks` block.

If implementation proves that a same-layer architecture-preserving physical split is necessary to avoid adding a second present responsibility to an existing module, the worker/reviewer must stop rather than edit an unsigned path or force the responsibility into the current file. The WorkItem returns to PLAN so T1 can be re-planned and re-signed with the exact revised `changeSurface`; this does not require inventing a second semantic task when the cumulative candidate still belongs to one task.

Any split that changes semantic ownership, public contracts, state meaning, effect boundaries, dependency direction, dependencies or authorized behavior requires the appropriate DESIGN/PLAN return, not merely a surface refresh.

No incidental cleanup or refactor outside the signed surface is authorized.

## Verification contract

### Signed logical gates

The task concern set is:

`daemon`, `foundation`, `ui`, `verification`.

Their manifest-required union is exactly:

1. `dependency-lock` — exact package/lock installation remains valid; no dependency drift.
2. `typecheck` — strict TypeScript boundary/type correctness.
3. `architecture` — unchanged permanent architecture material proves repository-wide FCIS/dependency/no-OOP/no-DTO/UI ownership constraints.
4. `test` — complete Vitest suite, including new daemon integration proof.
5. `build` — production Vite build.
6. `browser` — complete Playwright suite, including the changed user-visible behavior.

All six are required; none is conditional.

### Semantic review obligations

The independent review must explicitly challenge:

- whether source creation and discovery truly share one registration mapping/persistence owner rather than merely sharing a helper name;
- whether Create or Queue retains a hidden second project/filter/query authority;
- whether Readiness/Approval derives judgment only from canonical typed facts and not Markdown/currentness heuristics;
- whether Settings changes information hierarchy without moving config/readiness policy into the browser;
- whether any DTO/model/mapper/service/repository/controller/global-store/API/schema/dependency/verification-material change slipped into the candidate;
- whether every changed file is necessary and every required design obligation is present.

### Post-candidate repository delivery

This section is **outside T1 ExecutionTask completion**.

After T1 reaches the verified candidate outcome, applying/delivering that candidate to the public Order repository follows `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`: use a governed short-lived implementation branch based on the then-current delivery baseline, preserve the candidate's authorized semantic content, include `CHANGELOG.md [Unreleased]`, declare minor / 0.6.0 metadata, pass permanent PR verification including the release-packager check, and require the explicit merge decision.

If applying the candidate to the delivery baseline requires a material semantic/design/scope change, the candidate is not silently rebased into a different implementation; it returns to the owning lifecycle stage. The release-packager check remains delivery evidence, not a seventh signed ExecutionTask gate.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the complete Order 0.6.0 corrective candidate by consolidating source admission and correcting Create/remediation, queue/archive filtering, Readiness, Approval and Settings projections without changing canonical contracts, verification material, architecture ownership, dependencies or public APIs.",
      "dependsOn": [],
      "scope": [
        "CHANGELOG.md",
        "src/daemon/work-item-source.ts",
        "tests/browser.spec.ts",
        "tests/daemon.test.ts",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/app.tsx"
      ],
      "exclusions": [
        ".github/**",
        "AGENTS.md",
        "bun.lock",
        "docs/**",
        "package.json",
        "pontivus-order.toml",
        "src/core/**",
        "src/daemon/server.ts",
        "src/shell/**",
        "tests/architecture.test.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/theme.css"
      ],
      "acceptanceRefs": [
        "GW-FR-012-CATALOG-DRIVEN-AUTHORING",
        "GW-FR-018-SOURCE-CONSUMER-CLOSURE",
        "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE",
        "GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP",
        "GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION",
        "GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS",
        "GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION",
        "GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS",
        "GW-FR-221-READINESS-REVIEW-HIERARCHY",
        "GW-FR-222-APPROVAL-REVIEW-HIERARCHY",
        "GW-FR-241-DERIVED-MATERIAL-MATURITY",
        "GW-TR-001-FCIS-CANONICAL-OWNERSHIP",
        "GW-TR-059-CANONICAL-SETTINGS-READINESS-PROJECTION",
        "GW-TR-089-CURRENT-ATTENTION-OWNERSHIP",
        "GW-TR-094-CLOSED-WORKBENCH-SCREEN-COMPOSITION"
      ],
      "changeSurface": [
        "CHANGELOG.md",
        "src/daemon/work-item-source.ts",
        "tests/browser.spec.ts",
        "tests/daemon.test.ts",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/app.tsx"
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
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2"
      ],
      "concernIds": [
        "daemon",
        "foundation",
        "ui",
        "verification"
      ]
    }
  ]
}
```
