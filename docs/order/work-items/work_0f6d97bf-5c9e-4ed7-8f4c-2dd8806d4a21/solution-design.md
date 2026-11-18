<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Order 0.6.0 integrated technical solution design

## Requirement-to-solution map

This design consumes the functionally closed `requirements.md`. It does not reconstruct 0.5.0 implementation as a desired baseline. Existing production code is used only to locate current ownership and the concrete non-conformance that must be corrected.

| Concern | Functional obligation | Technical realization |
|---|---|---|
| C01 | canonical WorkItem lifecycle must remain distinct from internal execution/validation roles | **No runtime change.** Existing P6 `WorkStageSchema`, `StageCompletionSchema`, `RunRole` and pure lifecycle transition owner already encode the correct distinction. The P2/P3 explanatory correction is complete. |
| C02 | ordinary Create presents Concerns; linked remediation fixes/derives same-project lineage | Reuse `ui/src/app.tsx` creation state and `ui/src/CreateWorkItem.tsx`. Rename the field presentation to **Concerns**. When `derivedFromWorkItem` is non-null, suppress the editable Project selector, show the parent project as fixed context, and submit the parent project id rather than mutable creation state. No command/schema change. |
| C03 | archived inclusion must preserve the same project/search semantics | Restore the existing P4 queue/global-query ownership: `ui/src/app.tsx` owns both active and include-archived queries plus `showArchived`, `queueProjectId` and search presentation state. One pure local derivation applies project/search filtering to whichever canonical dataset is selected. `WorkItemQueue.tsx` receives the already-filtered rows and toggle state/callback; it no longer owns the include-archived query. |
| C04 | UI-created and repository-authored WorkItems enter one productive source-admission owner | Keep `src/daemon/work-item-source.ts` as the sole daemon source-orchestration owner. Factor one daemon-local **new-source admission planner** used by both repository reconciliation and browser creation. Both paths produce an exact validated source snapshot and then persist the WorkItem projection only through the existing `applyPlan` path. Preserve `origin = CREATED | DISCOVERED` as the provenance input. Remove the direct create-path `WorkItemSchema.parse(...)` + `storeWorkItem(...)` registration branch. |
| C05 | workspace shell/navigation/context semantics | No technical change. Existing `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` and current core/UI ownership already realize the functionally closed behavior. |
| C06 | Research interaction/factual closure | No technical change. Existing STAGE orchestration, RunEvent and lifecycle owners remain authoritative. |
| C07 | Requirements authority-disposition interaction | No technical change. Existing lifecycle/document/conformance owners remain authoritative. |
| C08 | DESIGN interaction/material | No technical change. Existing lifecycle/document/conformance owners remain authoritative. |
| C09 | PLAN interaction/task-definition inspection | No technical change. Existing canonical plan/task-block contracts and PLAN conformance owner remain authoritative. |
| C10 | Readiness primary verdict must be the canonical R3 verdict, not material maturity | Reuse the existing canonical `RunEventPayload.STAGE_COMPLETED.completion` for the R3 Run. `ReadinessWorkspace.tsx` derives the latest reached/current R3 completion outcome from the already-loaded R3 Runs/RunEvents and presents that outcome in the Readiness verdict slot. `materialState` remains only currentness/maturity presentation. No readiness field, DTO, endpoint or persisted state is added. |
| C11 | Approval must make exact-package readiness and currentness directly legible | Reuse the existing invariant that a current `SignoffPackage` is only available at current `AWAITING_SIGNOFF` after R3 `READY_FOR_SIGNOFF`. `SignoffReview.tsx` presents **Ready for sign-off** and **Current** as the primary package judgment while current. Stale/returned/history states continue to use their existing canonical facts. No second readiness value is stored or transported. |
| C12 | signed-task execution/validation | No technical change. Existing execution/validation owners remain authoritative. |
| C13 | terminal Complete/result/follow-up | No technical change. Existing terminal outcome and result presentation owners remain authoritative. |
| C14 | governed material/proposal/evidence/dialogue semantics | No technical change. Existing canonical material and RunEvent owners remain authoritative. |
| C15 | provider/session/activity | No technical change. Existing OpenCode shell/daemon boundaries remain authoritative; this design introduces no provider change. |
| C16 | Settings keeps operator meaning/actions primary and technical identity secondary | Reuse `SettingsWorkspace.tsx`, `WorkbenchTable`, `WorkbenchDisclosure`, existing settings queries and canonical daemon projections. Connected-repository inventory retains Project, readiness/status and actions as the primary table. Exact Git root and WorkItem document root move behind per-entry **Technical details** disclosure (or equivalent existing secondary-detail primitive). Active Add/Move flows continue showing/accepting exact paths because those paths are the current task. Remove the ordinary **Model list source** HTTP diagnostic block. |
| C17 | current attention/recovery/convergence | No technical change. Existing pure lifecycle derivations remain the single owner. |
| C18 | responsive/accessibility continuity | No new architecture. Corrections remain inside existing Workbench primitives and feature renderers; browser verification covers responsive/focus behavior where changed. |
| C19 | component/theme language | No new primitive, visual system or theme owner. All UI changes use the existing closed Workbench/Astryx primitive vocabulary. |
| C20 | end-to-end certification | Extend existing daemon/browser/architecture tests only where the changed semantics need permanent proof. No new certification subsystem. |
| C21 | verified result vs verified candidate; no product-intent invention | **No runtime contract change.** P2 wording correction is complete; existing WorkOutcome/StageCompletion semantics already support no-code terminal outcomes and executed candidates. |
| C22 | project-governance integration | No technical change. Existing authority-resolution, manifest, conformance and verification owners remain authoritative. |

## Canonical owner/affected boundaries

The design changes no canonical semantic owner.

### Existing owners reused

- **P1 engineering constitution:** `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`.
- **P4 application architecture:** `GW-DOC-TECHNICAL-ARCHITECTURE-V2`.
- **P4 Workbench component architecture:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`.
- **P4 Workbench theme:** `GW-DOC-WORKBENCH-THEME-V1`.
- **P6 contracts/state schemas:** `GW-DOC-CANONICAL-CONTRACTS-V2`.
- **provider integration:** `GW-DOC-OPENCODE-INTEGRATION-V1`.
- **functional lifecycle/validation:** referenced P3 owners from `requirements.md`.

### Changed production boundaries

1. **Create/remediation presentation:** `ui/src/app.tsx` + `ui/src/CreateWorkItem.tsx`.
2. **Queue/global query presentation:** `ui/src/app.tsx` + `ui/src/WorkItemQueue.tsx`.
3. **Source admission orchestration:** `src/daemon/work-item-source.ts` only.
4. **Readiness review projection:** `ui/src/ReadinessWorkspace.tsx`.
5. **Approval review projection:** `ui/src/SignoffReview.tsx`.
6. **Settings presentation hierarchy:** `ui/src/SettingsWorkspace.tsx`.

No shell, SQLite, HTTP-route, provider, package/dependency, configuration, schema or migration owner changes are required.

## Existing capability/reuse, behavior to replace, and necessary new concepts

### Existing capability reused

- `src/core/work-item-source.ts` remains the sole pure source parser/catalog/path/authoring semantics owner.
- `src/shell/work-item-source.ts` remains the sole source filesystem effect owner.
- `src/daemon/work-item-source.ts` already owns source creation, source inspection, reconciliation and projection persistence composition.
- `applyPlan` is already the canonical persistence application boundary for source-reconciliation plans.
- `App.tsx` is already the P4 owner for queue/global queries and queue search/project presentation state.
- `GET /api/work-items?includeArchived=...` and its existing browser helper/query key are reused unchanged.
- `StageCompletionSchema` already carries the complete R3 verdict vocabulary.
- `ReadinessWorkspace` already receives canonical R3 Runs and RunEvents; no additional query is needed.
- current sign-off package admission already proves R3 `READY_FOR_SIGNOFF`; no Approval schema extension is needed.
- Workbench Review/Table/Disclosure/Status/Settings primitives already implement the required information hierarchy mechanics.
- existing installation-readiness/settings daemon projections already carry all Settings meaning needed by the browser.

### Incorrect behavior to remove/replace

- remove ordinary UI label **Concern IDs**;
- remove editable Project choice from linked remediation;
- remove the `WorkItemQueue.tsx` archived-inclusive query path that bypasses App-owned project/search filtering;
- remove the create-path direct WorkItem projection construction/persistence branch in `createWorkItemFromSource`;
- stop using `materialPresentationStateLabel(materialState)` as the Readiness verdict;
- stop presenting Approval currentness without the canonical readiness judgment;
- remove persistent primary Git-root/document-root columns from repository inventory;
- remove the ordinary Settings raw `GET /api/settings/models` diagnostic block.

### Necessary new concepts

**None.**

The source-admission planner is an internal same-owner factoring of already-existing semantics, not a new domain concept, state model, service, repository, DTO, adapter or public API.

## Technical requirements/architecture

### T1 — one new-source admission path

Inside `src/daemon/work-item-source.ts`, new source registration has one internal decision path.

Conceptually:

```text
validated exact source snapshot
+ resolved ConfiguredProject
+ origin (CREATED | DISCOVERED)
+ archived projection
+ createdAt
        |
        v
one daemon-local new-source admission planner
        |
        v
QueuePlan { disposition: REGISTERED, source, workItem }
        |
        v
applyPlan(...)
        |
        v
storeWorkItem(...)
```

Repository reconciliation and UI creation differ only in how the source file came to exist and in the canonical `origin` provenance value.

Required invariants:

- browser creation still writes and read-backs exact source Markdown **before** runtime projection exists;
- creation does not perform a full queue rescan and does not apply unrelated external source changes;
- source project/schema/concern validation remains at the existing core/daemon boundaries;
- new-source WorkItem field mapping is owned once;
- `storeWorkItem(runtime.database, plan.workItem)` is reached only through the source-plan application path for this source-registration concern;
- existing-update reconciliation continues using `classifyExistingWorkItemSource`;
- no source filesystem or SQLite effect moves into core code.

### T2 — one queue/global query owner

`App.tsx` owns:

- active WorkItem query;
- include-archived WorkItem query;
- `showArchived`;
- `queueProjectId`;
- queue search string;
- one derivation of the selected canonical dataset and its project/search filter.

Conceptually:

```text
activeWorkItems -------------------+
                                   |
includeArchivedWorkItems -- showArchived
                                   |
                                   v
                         selected canonical dataset
                                   |
                       project/search derivation
                                   |
                                   v
                           WorkItemQueue rows
```

`WorkItemQueue.tsx` remains a cohesive queue renderer plus row-local restore command presentation. It must not fetch a competing queue dataset.

No global browser store is introduced; these remain ordinary React/TanStack Query presentation/server-state boundaries.

### T3 — linked-remediation command integrity

For ordinary creation:

```text
selected project -> CreateWorkItem -> existing CreateWorkItemSource command
```

For linked remediation:

```text
derivedFromWorkItem.projectId
        |
        +-> fixed project presentation
        |
        +-> submitted command.projectId
```

The browser cannot offer or submit a cross-project remediation choice through ordinary UI. The daemon's existing same-project validation remains mandatory for stale/malicious clients.

### T4 — canonical Readiness verdict projection

`ReadinessWorkspace.tsx` derives a display verdict only from canonical R3 stage completion events already loaded for the WorkItem.

Required precedence:

- current active R3 with no accepted terminal completion -> **Review in progress**;
- reached R3 completion -> display the exact `completion.outcome` in ordinary product language;
- material `CURRENT | STALE | SIGNED_LOCKED | ...` remains currentness/maturity and never substitutes for the verdict.

The component may use a small pure local presentation helper. It must not parse `readiness-review.md` prose to infer the verdict and must not create a new readiness state type.

### T5 — Approval readiness/currentness projection

For current Approval:

```text
WorkItem.stage === AWAITING_SIGNOFF
+ current SignoffPackage exists
+ package not stale
        |
        +-> readiness = READY_FOR_SIGNOFF (already proven by lifecycle/package admission)
        +-> currentness = CURRENT
```

The primary Approval overview communicates both facts before task/package technical identity.

If the package is stale, sign-off remains unavailable and the existing stale-owner route controls. If Approval is historical, the UI presents historical approval/sign-off state and does not re-derive a fictitious current readiness.

No Approval/SignoffPackage field is added.

### T6 — Settings technical-detail hierarchy

Repository inventory remains a canonical projection from existing Settings queries.

Primary row content:

- project identity;
- readiness/attention status;
- current/queue-context meaning where applicable;
- relevant actions.

Secondary technical detail:

- exact Git root;
- resolved WorkItem document root.

Those exact paths remain immediately visible in active Add-repository and Move-WorkItem-documents tasks because the path is the operator's current input/decision.

The raw model-list HTTP route string has no governed operator meaning and is removed from ordinary Settings presentation rather than moved into a new diagnostic state.

## Contracts/state/data-flow changes

### P6 contracts

**No change.**

The following remain unchanged and are explicitly reused:

- `CreateWorkItemSourceSchema`;
- `WorkItemSchema`;
- `WorkItemSourceSnapshotSchema`;
- `WorkItemSourceReconciliationSchema`;
- `StageCompletionSchema`;
- `RunEventPayloadSchema`;
- `SignoffPackage`;
- `InstallationReadiness`;
- WorkItem list/include-archived HTTP contracts;
- Settings/repository/model HTTP contracts.

### Persistence

**No schema or migration change.**

SQLite remains projection/runtime state. No column/table/index is added. Source registration continues to persist the same canonical `WorkItem` projection.

### Transport

**No endpoint or JSON shape change.**

The browser continues using the existing active and include-archived queries, WorkItem create command, Run/RunEvent queries, sign-off-package query and Settings APIs.

### Provider integration

**No change.**

OpenCode/provider/session behavior is outside this change surface.

### Producer -> carrier -> consumer paths

#### C04 source registration

```text
Create UI command
 -> daemon work-item-source create
 -> shell exact source create/read-back
 -> canonical WorkItemSourceSnapshot
 -> shared daemon new-source admission plan
 -> applyPlan
 -> SQLite WorkItem projection
 -> existing WorkItem queries

External repository source
 -> shell deterministic source scan/read
 -> canonical WorkItemSourceSnapshot
 -> same shared daemon new-source admission plan
 -> applyPlan
 -> SQLite WorkItem projection
 -> existing WorkItem queries
```

#### C03 queue filtering

```text
daemon canonical WorkItem queries
 -> TanStack active/include-archived query cache
 -> App-owned dataset selection
 -> one App-owned project/search derivation
 -> WorkItemQueue presentation
```

#### C10 Readiness

```text
provider R3 completion
 -> canonical STAGE_COMPLETED RunEvent
 -> existing RunEvent query
 -> ReadinessWorkspace pure verdict projection
 -> WorkbenchReview verdict slot
```

#### C11 Approval

```text
R3 READY_FOR_SIGNOFF
 -> lifecycle AWAITING_SIGNOFF
 -> current SignoffPackage admission/currentness
 -> SignoffReview readiness + currentness presentation
 -> existing explicit sign-off command
```

#### C16 Settings

```text
canonical config/project/account/model state
 -> existing daemon Settings/readiness projections
 -> existing HTTP queries
 -> SettingsWorkspace
 -> primary operator state/actions + secondary technical detail
```

## Decisions/rationale/rejected alternatives

### D1 — reuse the existing daemon source owner

**Decision:** consolidate registration inside `src/daemon/work-item-source.ts`.

**Rationale:** P4 already assigns create/update/reconcile orchestration to this module. The defect is duplicated registration logic inside the owner, not missing architecture.

**Rejected:**
- a new source-admission service/repository/controller;
- a new core domain model or DTO;
- routing browser creation through a full queue reconciliation scan;
- preserving direct `storeWorkItem` in creation and merely adding tests.

A full rescan would introduce unrelated mutation coupling; a new layer would violate minimum change and canonical ownership.

### D2 — lift archived-inclusive queue observation to App

**Decision:** `App.tsx` owns the two canonical queue queries and all queue-wide filter state.

**Rationale:** this is already the declared P4 owner for queue/global queries and search. It makes one filter derivation possible without a browser store or duplicated filtering helper across state owners.

**Rejected:**
- duplicating project/search logic in `WorkItemQueue.tsx`;
- moving all queue filtering into the daemon/API;
- introducing a queue view-model/DTO;
- adding a state-management library.

The product filter/search behavior is presentation-local over already-authoritative queried WorkItems.

### D3 — derive Readiness from RunEvent truth

**Decision:** use existing R3 `STAGE_COMPLETED` outcome.

**Rejected:**
- parsing Markdown headings/text;
- adding `readinessVerdict` to WorkItem, ArtifactRef or another DTO;
- treating material maturity/currentness as readiness.

The canonical verdict already exists as typed event data.

### D4 — derive current Approval readiness from lifecycle/package admission

**Decision:** current exact package at `AWAITING_SIGNOFF` is presented as Ready for sign-off; package currentness remains distinct.

**Rejected:**
- adding readiness to `SignoffPackage`;
- re-reading/parsing R3 Markdown in Approval;
- adding another Approval readiness query/state machine.

### D5 — fix Settings hierarchy in presentation only

**Decision:** reorder/hide technical detail using existing Workbench primitives.

**Rejected:**
- changing Settings daemon projections;
- removing exact path information entirely;
- adding a diagnostic API or settings-detail DTO;
- inventing feature-local cards/panels.

### D6 — no new P4/P5/P6 semantic version

The accepted functional design requires no new architecture concept, external dependency, semantic state owner or contract meaning. Current P4/P5/P6 authority already defines the correct owners and boundaries. The WorkItem DESIGN artifact therefore specifies a bounded correction inside those current owners rather than advancing permanent semantic versions without a semantic change.

## Compatibility/preservation

The following are semantic invariants, not implementation-preservation requirements:

- existing WorkItem kind/schema and terminal outcome semantics;
- exact WorkItem source Markdown remains canonical originating input;
- source file exists and read-back verifies before a browser-created WorkItem projection is persisted;
- `origin` continues to distinguish `CREATED` from `DISCOVERED` provenance;
- external source refresh remains explicit; creation does not reconcile unrelated files;
- project/source/concern validation remains mandatory;
- WorkItem list/include-archived APIs remain unchanged;
- selected WorkItem, lifecycle, task, Run and current-attention ownership remain unchanged;
- R3 outcome vocabulary remains unchanged;
- sign-off remains exact-package explicit human authorization;
- Settings mutations/readiness remain daemon-owned;
- responsive/accessibility/component/theme contracts remain unchanged;
- no code path is preserved solely because it exists in 0.5.0.

## Failure behavior

### Source creation/admission

- source create/write failure -> no runtime WorkItem projection is created;
- source read-back/parse/project/concern failure -> no runtime projection is created;
- source admission/persistence failure after file creation -> command fails; the canonical file remains repository evidence and normal explicit reconciliation can subsequently classify/admit it. No hidden rollback that can delete user-visible canonical source bytes is introduced;
- concurrent/external conflicting source remains governed by existing source diagnostics/reconciliation rules;
- no unrelated WorkItem is reconciled as a side effect of Create.

### Queue

- include-archived query failure -> active dataset remains available; UI reports the query failure rather than silently showing an unfiltered archived dataset as equivalent;
- project/search filters remain applied to whichever canonical dataset is successfully selected.

### Readiness

- no terminal R3 completion -> Review in progress;
- return outcome -> exact return verdict is displayed when inspecting reached R3 history;
- stale/current material state affects currentness display only.

### Approval

- stale/unavailable package -> existing stale/blocked behavior; no Ready-for-sign-off claim;
- current package -> Ready for sign-off + Current;
- sign-off mutation failure -> existing error/invalidation path.

### Settings

- technical detail disclosure failure is impossible because content is already-loaded canonical state;
- Settings query/mutation failures retain existing notices and mutation safety;
- active path-entry tasks continue displaying exact path input/identity required to make the decision.

## Validation obligations

### Architecture fitness

Extend the existing permanent architecture sensor only where it can prove ownership without freezing incidental layout:

1. `src/daemon/work-item-source.ts` has one WorkItem-registration persistence call path for source admission after the change; the create function must not directly persist a separately constructed WorkItem projection.
2. `WorkItemQueue.tsx` must not own `listWorkItemsIncludingArchived` / the archived-inclusive server query; App remains the declared queue/global-query owner.
3. no new production module, DTO/model/mapper/service/repository/controller, global client store, endpoint, schema, direct dependency or provider integration is introduced.
4. existing Workbench renderer/primitive ownership sensors continue to pass.

### Daemon/integration tests

Add/adjust proof that:

- browser-created source is written/read-back first and is persisted through the same new-source admission mapping as a repository-discovered source;
- the two registration origins remain `CREATED` and `DISCOVERED` respectively while all other source-derived projection fields agree with their canonical snapshot;
- creation does not reconcile unrelated externally changed WorkItems.

### Browser tests

Update permanent browser coverage to prove:

- Create exposes **Concerns**, not **Concern IDs**;
- linked remediation shows the parent project as fixed and offers no editable Project selector;
- project/search filters remain effective before and after **Show archived**;
- Readiness verdict renders the canonical R3 outcome and remains unchanged when selecting subordinate package material;
- current Approval shows both **Ready for sign-off** and package **Current** before technical identity;
- connected-repository inventory does not expose Git/document paths as primary columns, but those paths remain available through technical detail and active Move/Add flows;
- Model & runtime no longer renders the raw API source string.

### Existing gates

The final implementation must pass, at minimum:

- dependency lock;
- typecheck;
- architecture fitness;
- full tests;
- production build;
- release-packager verification;
- browser suite for the changed UI behavior.

No green current test is treated as a preservation requirement when it encodes behavior explicitly superseded by this design.
