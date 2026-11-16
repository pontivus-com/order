# Phase 1 application interaction map

**Status:** P1-T01 through P1-T04 complete; P1-T05+ pending  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Audit branch:** `version/0.5.0`  
**Production implementation baseline under audit:** `a4fca0d5771ecbf3af6f932649d3811bed750cd5`  
**Owner inside Phase 1:** current-state UI surface, information, interaction and flow evidence  
**Execution plan:** [phase-1-investigation-plan.md](phase-1-investigation-plan.md)

## 1. P1-T01 evidence/source registry

### 1.1 Baseline identity

At P1-T01 execution, `version/0.5.0` is ahead of `master` only by `CHANGELOG.md` and WorkItem documentation. No `ui/**`, `src/**`, test, package, build or runtime implementation file differs from released `master`.

Therefore:

- the production behavior audited by Phase 1 is the released implementation at `a4fca0d5771ecbf3af6f932649d3811bed750cd5`;
- Phase 1 evidence documents may continue to advance on `version/0.5.0` without changing the implementation baseline;
- if any later 0.5.0 commit changes production/test/runtime source before Phase 1 closes, the affected evidence must be re-baselined rather than silently mixing implementations.

### 1.2 Canonical authority registry

| Concern | Canonical owner | Layer / use in Phase 1 |
|---|---|---|
| authority hierarchy / decision boundaries | `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` — `docs/governance/systems-governance.md` | P1; establishes authority precedence and forbids filling missing product behavior by inference |
| minimum sufficient change | `GW-DOC-MINIMUM-CHANGE-V1` — `docs/governance/minimum-change.md` | P1; later remediation constraint, factual reference only in R1 |
| product boundary | `GW-DOC-SYSTEM-BRIEF-V1` — `docs/product/system-brief.md` | P2; defines Order as local workbench + durable control system around agentic software work |
| lifecycle stages/transitions | `GW-DOC-WORK-LIFECYCLE-V1` — `docs/requirements/work-lifecycle.md` | P3; canonical lifecycle and R1/R2/DESIGN/PLAN/R3/execution semantics |
| stage context/conformance/interactive-run boundary | `GW-DOC-LIFECYCLE-CONTEXT-V1` — `docs/requirements/lifecycle-context.md` | P3; canonical stage inputs, decisions, interactive Run semantics and continuous conformance |
| WorkItem source/document system | `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` — `docs/requirements/work-item-documents.md` | P3; source identity, schema, deterministic lifecycle Markdown and freshness |
| Markdown authoring workbench | `GW-DOC-MARKDOWN-WORKBENCH-V1` — `docs/requirements/markdown-workbench.md` | P3; direct Markdown viewing/editing/save/currentness operator behavior |
| Workbench user interaction | `GW-DOC-WORKBENCH-UX-V2` — `docs/requirements/workbench.md` | P3; workflow interaction, state presentation, information hierarchy, spatial/recovery/responsive behavior |
| installation/configuration readiness | `GW-DOC-INSTALLATION-READINESS-V1` — `docs/requirements/installation-readiness.md` | P3; repositories/model/OpenCode-account/readiness behavior |
| project/provider governance integration | `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1` — `docs/requirements/project-governance-integration.md` | P3; project authority, provider workspace/instruction/failure integration |
| execution validation | `GW-DOC-VALIDATION-STANDARD-V1` — `docs/requirements/validation-standard.md` | P3; V0–V7 validation and execution failure semantics |
| execution control plane | `GW-DOC-EXECUTION-CONTROL-PLANE-V1` — `docs/architecture/execution-control-plane.md` | P4; post-signoff execution-loop technical boundary |
| system technical architecture | `GW-DOC-TECHNICAL-ARCHITECTURE-V1` — `docs/architecture/technical-architecture.md` | P4; FCIS/SoC module/effect/dependency ownership |
| Workbench technical architecture | `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` — `docs/architecture/workbench.md` | P4; state derivation, command admission, browser reconciliation, renderer/component composition |
| Workbench theme architecture | `GW-DOC-WORKBENCH-THEME-V1` — `docs/architecture/workbench-theme.md` | P4; theme/tokens/stylesheet ownership |
| OpenCode integration | `GW-DOC-OPENCODE-INTEGRATION-V1` — `docs/architecture/opencode-integration.md` | P4; OpenCode is narrow provider, not workflow owner; exact server/session integration semantics |
| external dependency facts | `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` — `docs/references/external-facts.md` | factual authority; exact provider/UI dependency capabilities and pins |
| canonical schemas/persistence/HTTP contracts | `GW-DOC-CANONICAL-CONTRACTS-V1` — `docs/contracts/canonical-contracts.md` | P6; exact semantic types, persistence and transport contracts |

The root `pontivus-order.toml [refs]` resolves these identifiers and maps the `ui`, `core`, `daemon`, `shell`, `foundation` and `verification` concerns to their authority and verification gates.

### 1.3 Production evidence classes

| Evidence class | Current owner(s) | Phase 1 use |
|---|---|---|
| browser render/composition | `ui/src/app.tsx`, `ui/src/WorkItemWorkspace.tsx`, specialist workspace/renderers, `ui/src/primitives/**` | source evidence for `SURF/INFO/ACT/FLOW`; P1-T02–T05 |
| browser typed transport | `ui/src/http.ts`, `src/core/contracts.ts` | exact browser API/schema boundary; P1-T04/T05 |
| canonical pure state derivation | `src/core/lifecycle.ts`, `src/core/contracts.ts`, `src/core/work-item-source.ts`, `src/core/execution.ts` | state/data ownership evidence; P1-T04/T06/T08 |
| HTTP adapter | `src/daemon/server.ts` | browser mutation/query admission and endpoint routing; P1-T05 |
| daemon orchestration | `src/daemon/coordinator.ts`, `stage.ts`, `run.ts`, `execution.ts`, `settings.ts`, `opencode-account.ts`, source/document modules | direct productive effects and orchestration; P1-T05–T08 |
| OpenCode provider shell | `src/shell/opencode.ts`, `src/daemon/stage.ts`, execution-provider paths | provider/session/workspace/prompt/output evidence; P1-T07 |
| repository/filesystem/config effects | `src/shell/repository.ts`, `work-item-source.ts`, `file-write.ts`, `config.ts`, `project.ts`, `sqlite.ts` | canonical effect evidence for source/currentness/configuration; P1-T05/T08 |
| rendered/runtime behavior | `tests/e2e-server.ts` + Playwright harness; temporary GitHub Actions where needed | actual geometry/state/screenshot/runtime evidence; P1-T03 |
| permanent verification | `tests/**`, `pontivus-order.toml [verification.*]` | existing proof status; P1-T09 |

## 2. P1-T01 application root topology

This is the **root topology**, not yet the P1-T02 exhaustive `SURF-` census.

~~~text
Bun daemon/static application
  |
  +-- /connect bootstrap -> authenticated browser session -> /
  |
  v
ui/src/app.tsx :: App
  |
  +-- global toolbar
  |     +-- New work item
  |     +-- Refresh sources
  |     +-- OpenCode account utility
  |     +-- Settings
  |     +-- Theme preference
  |
  +-- queue destination (/)
  |     +-- WorkItemQueue
  |     +-- CreateWorkItem in WorkbenchTaskPanel
  |
  +-- settings destinations
  |     +-- /settings/repositories
  |     +-- /settings/opencode
  |     +-- /settings/model
  |           -> SettingsWorkspace
  |              -> OpenCodeAccountSettings
  |
  +-- selected WorkItem destination (/?workItem=<id>)
        |
        +-- WorkItemWorkspace
        |     +-- WorkItemIdentityRow
        |     +-- WorkflowRail
        |     +-- Work request / SourceDocumentMaterial
        |     +-- R1/R2/DESIGN/PLAN -> PreSignoffStageWorkspace
        |     |       +-- StageRunMaterial / ActivityWorkspace
        |     |       +-- lifecycle/supporting documents
        |     |       +-- ProposalReview
        |     |       +-- EvidenceViewer
        |     +-- R3 -> ReadinessWorkspace
        |     |       +-- StageRunMaterial
        |     |       +-- package documents
        |     |       +-- EvidenceViewer
        |     +-- Approval -> SignoffReview
        |     +-- Implementation -> ExecutionWorkspace
        |     |       +-- RunEventTimeline
        |     |       +-- EvidenceViewer
        |     +-- Complete -> TerminalResult
        |     +-- evidence selections -> EvidenceViewer
        |
        +-- WorkItemContext
              -> wide bounded context panel / constrained drawer through layout primitive
~~~

### 2.1 Root renderer registry

| Root / composition owner | Source | Typed primary inputs visible at root | Immediate child surface owners |
|---|---|---|---|
| application shell/destination owner | `ui/src/app.tsx` | `WorkItem`, `ProjectManifest`, `WorkItemSchemaCatalogEntry`, readiness/source diagnostics; browser-local theme/destination/create state | queue, create task panel, settings, WorkItem workspace, Context, global notices/confirmation |
| queue | `ui/src/WorkItemQueue.tsx` | `WorkItem[]`, schema catalog; archived query | table rows, archive restore/copy-id actions |
| create WorkItem task | `ui/src/CreateWorkItem.tsx` | `ProjectManifest[]`, schema catalog, selected project/schema/concerns/title, optional derived parent | governed creation form |
| settings | `ui/src/SettingsWorkspace.tsx` | `ConnectedRepositoryState`, `InstallationReadinessBlocker`, `OpenCodeModelRef`, config/readiness queries | repositories, OpenCode accounts, model/runtime settings |
| selected WorkItem composition | `ui/src/WorkItemWorkspace.tsx` | `WorkItem`, `Run[]`, `ArtifactRef[]`, tasks, source, diagnostics, sign-off package plus pure lifecycle derivations | identity, rail, nine workflow-step specialist renderers, current-attention notices/actions |
| R1/R2/DESIGN/PLAN | `ui/src/PreSignoffStageWorkspace.tsx` | `WorkItem`, `Run[]`, `ArtifactRef[]`, selected `WorkflowMaterial`, `StageRunInteraction`, `CurrentAttentionTag` | dialogue/activity, document, proposal review, evidence, supporting material |
| R3 | `ui/src/ReadinessWorkspace.tsx` | same stage/run/material family plus R3/package artifact selection | review, activity, package document/evidence |
| Approval | `ui/src/SignoffReview.tsx` | `WorkItem`, `SignoffPackage`, artifacts/tasks, approval selection | overview, governed docs, task detail, sign-off action |
| Implementation | `ui/src/ExecutionWorkspace.tsx` | `WorkItem`, `ExecutionTask[]`, `Run[]`, `RunEvent[]`, derived execution owner/validation boundary | task master/detail, events, validation, evidence, recovery controls |
| Complete | `ui/src/TerminalResult.tsx` | terminal `WorkItem`; result artifacts/runs/events conditionally loaded by outcome | governed result material, candidate evidence, linked remediation action |
| technical Context | `ui/src/WorkItemContext.tsx` | selected WorkItem/step/material/document path+hash; schema/run/source diagnostics queries | selected-view technical context + WorkItem technical disclosure |

P1-T02 must split these roots into materially distinct `SURF-` states and overlays; this registry does not claim those later tasks complete.

## 3. P1-T01 browser → daemon boundary registry

All productive browser transport is centralized in `ui/src/http.ts`. Responses and mutation bodies are parsed/constructed from canonical schemas in `src/core/contracts.ts`. `src/daemon/server.ts::routeApi` is the direct HTTP adapter.

### 3.1 WorkItem/source/document/lifecycle boundaries

| Browser owner | HTTP boundary | Direct daemon/server target |
|---|---|---|
| `listWorkItems`, archived variant | `GET /api/work-items[?includeArchived=true]` | `coordinator.listWorkItems` |
| `getWorkItem` | `GET /api/work-items/:id` | `coordinator.getWorkItem` |
| `listWorkItemSchemas` | `GET /api/work-item-schemas` | `coordinator.listWorkItemSchemas` |
| `listProjects` | `GET /api/projects` | `coordinator.listProjects` + `settings.readyRepositoryRoots` |
| `listWorkItemSourceDiagnostics` | `GET /api/work-item-sources/diagnostics` | `coordinator.getWorkItemSourceDiagnostics` |
| `reconcileWorkItemSources` | `POST /api/work-item-sources/reconcile` | `coordinator.reconcileSources` |
| `createWorkItem` | `POST /api/work-items` | `coordinator.createWorkItem` |
| `getWorkItemSource` | `GET /api/work-items/:id/source` | `coordinator.getWorkItemSource` |
| `saveWorkItemSource` | `PUT /api/work-items/:id/source` | `coordinator.saveSource` |
| `saveWorkItemSourceBody` | `PUT /api/work-items/:id/source/body` | `coordinator.saveSourceBody` |
| `updateWorkItemTitle` | `PATCH /api/work-items/:id/title` | `coordinator.updateTitle` |
| `setWorkItemArchived` | `PATCH /api/work-items/:id/archive` | `coordinator.setArchived` |
| `getWorkItemDocumentationGitStatus` | `GET /api/work-items/:id/documentation-git-status` | `coordinator.getDocumentationGitStatus` |
| `commitWorkItemDocumentation` | `POST /api/work-items/:id/documentation-commit` | `coordinator.commitDocumentation` |
| `listArtifacts` | `GET /api/work-items/:id/artifacts` | `coordinator.listArtifacts` |
| `listLifecycleArtifacts` | `GET /api/work-items/:id/lifecycle-artifacts` | `coordinator.listCurrentLifecycleArtifacts` |
| `readArtifactContent` | `GET /api/artifacts/:id/content` | `coordinator.readArtifactContent` |
| `saveArtifactContent` | `PUT /api/artifacts/:id/content` | `coordinator.saveArtifactContent` |

### 3.2 Run/proposal/sign-off/execution boundaries

| Browser owner | HTTP boundary | Direct daemon/server target |
|---|---|---|
| `listRuns` | `GET /api/work-items/:id/runs` | `coordinator.listRuns` |
| `startInteractiveRun` | `POST /api/work-items/:id/runs` | readiness gates + `coordinator.startStageRun` |
| `listRunEvents` | `GET /api/runs/:id/events?afterSequence=` | `coordinator.listRunEvents` |
| `submitRunInput` | `POST /api/runs/:id/input` | `coordinator.submitRunInput` |
| `cancelRun` | `POST /api/runs/:id/cancel` | `coordinator.cancelRun` |
| `adoptProposal` | `POST /api/run-events/:id/adopt` | `coordinator.adoptArtifactProposal` |
| `rejectProposal` | `POST /api/run-events/:id/reject` | `coordinator.rejectArtifactProposal` |
| `resumeWorkItem` | `POST /api/work-items/:id/resume` | `coordinator.resumeWorkItem` |
| `reconcileWorkItemAuthority` | `POST /api/work-items/:id/reconcile-authority` | `coordinator.reconcileWorkItemAuthority` |
| `getSignoffPackage` | `GET /api/work-items/:id/signoff-package` | `coordinator.signoffPackageForWorkItem` |
| `signOffWorkItem` | `POST /api/work-items/:id/signoff` | `coordinator.signOffWorkItem` |
| `listExecutionTasks` | `GET /api/work-items/:id/tasks` | `coordinator.listExecutionTasks` |
| `readEvidence` | `GET /api/runs/:id/evidence?path=` | `coordinator.readReferencedEvidence` |
| `tick` | `POST /api/tick` | account/readiness gates + `settings.runReadyCoordinatorTick` |

### 3.3 Installation/settings/OpenCode-account boundaries

| Browser owner | HTTP boundary | Direct daemon/server target |
|---|---|---|
| `getOrderConfigState` | `GET /api/settings/config` | `settings.orderConfigState` |
| `getInstallationReadiness` | `GET /api/settings/readiness` | `settings.installationReadiness` |
| `getConnectedRepositories` | `GET /api/settings/repositories` | `settings.connectedRepositoryStates` |
| `getAvailableOpenCodeModels` | `GET /api/settings/models` | `settings.availableOpenCodeModels` |
| `connectRepository` | `POST /api/settings/repositories/connect` | `settings.connectRepository` |
| `disconnectRepository` | `POST /api/settings/repositories/disconnect` | `settings.disconnectRepository` |
| `migrateWorkItemDocumentRoot` | `PUT /api/settings/repositories/document-root` | `settings.migrateWorkItemDocumentRoot` |
| `updateConfiguredModel` | `PUT /api/settings/model` | `settings.updateConfiguredModel` |
| `updateReferenceRoots` | `PUT /api/settings/reference-roots` | `settings.updateReferenceRoots` |
| `getOpenCodeAccountState` | `GET /api/opencode/accounts` | `opencode-account.openCodeAccountState` |
| `startOpenCodeAccountLogin` | `POST /api/opencode/accounts/login` | `opencode-account.startSavedOpenCodeAccountLogin` |
| `getOpenCodeAccountLogin` | `GET /api/opencode/accounts/login/:attempt` | `opencode-account.pollSavedOpenCodeAccountLogin` |
| `cancelOpenCodeAccountLogin` | `DELETE /api/opencode/accounts/login/:attempt` | `opencode-account.cancelSavedOpenCodeAccountLogin` |
| `activateOpenCodeAccount` | `POST /api/opencode/accounts/:id/activate` | `opencode-account.activateSavedOpenCodeAccount` |
| `renameOpenCodeAccount` | `PATCH /api/opencode/accounts/:id` | `opencode-account.renameSavedOpenCodeAccount` |
| `removeOpenCodeAccount` | `DELETE /api/opencode/accounts/:id` | `opencode-account.removeSavedOpenCodeAccount` |

### 3.4 Authentication/application bootstrap boundary

- `GET /connect?token=...` is daemon-owned one-time browser bootstrap handled in `src/daemon/server.ts`; it establishes the local authenticated browser session before the SPA is served.
- Browser queries and mutations then use same-origin `/api/**` transport through `ui/src/http.ts`.
- Mutation admission adds the daemon/browser authentication and Origin checks in `src/daemon/server.ts`.
- P1-T05 will trace individual UI handlers to these boundaries and their deeper core/shell effects; this T01 registry establishes the entry points only.

## 4. P1-T01 permanent verification registry

Detailed invariant-by-invariant proof belongs to `certification-evidence-map.md`. The permanent verification families relevant to the interaction audit are:

- `tests/architecture.test.ts`;
- `tests/browser.spec.ts`;
- `tests/certification.test.ts`;
- `tests/core.test.ts`;
- `tests/daemon.test.ts`;
- `tests/markdown-source-formatting.test.ts`;
- `tests/opencode.test.ts`;
- `tests/order-migration.test.ts`;
- `tests/process.test.ts`;
- `tests/shell.test.ts`;
- `tests/sqlite.test.ts`;
- `tests/workbench-presentation.test.ts`.

The canonical verification commands are resolved through `pontivus-order.toml [verification]`: dependency lock, typecheck, architecture, test, build and browser.

## 5. P1-T01 runtime evidence requirements discovered

Source inspection alone cannot establish:

- actual rendered hierarchy and visual dominance;
- density/clipping/overflow under representative content;
- responsive recomposition at wide/medium/narrow widths;
- overlay geometry and focus return in the browser;
- theme readability/parity of actual rendered surfaces;
- browser-observed asynchronous/pending/failure transitions;
- provider/session runtime failures whose origin is not reconstructable from persisted evidence.

These are registered as rendered/runtime evidence requirements for P1-T03. Screenshot capture must use the existing browser/e2e path and temporary GitHub Actions scaffolding where no other available execution path can produce the evidence.

## 6. P1-T01 completion verdict

**P1-T01: COMPLETE.**

Completion basis:

- governing authority owners are resolved;
- the productive application root topology is identified;
- the centralized browser transport and every current `ui/src/http.ts` productive API boundary have direct daemon entry owners;
- the deeper core/shell/provider families required by later tracing are identified;
- every permanent verification family is registered;
- runtime-only evidence classes required by later tasks are explicit.

P1-T02 may now assign the exhaustive `SURF-` registry and state-scenario coverage.

## 7. Application/navigation topology

P1-T02 expands the root topology into one explicit application navigation graph.

~~~text
/connect bootstrap
   |
   v
SURF-APP-001 application shell
   |
   +--> SURF-QUEUE-001 WorkItem queue
   |      |
   |      +--> SURF-CREATE-001 create WorkItem task panel
   |      +--> select active WorkItem -------------------+
   |                                                    |
   +--> SURF-SET-001 Settings shell                     |
   |      +--> SURF-SET-REPO-001 Repositories           |
   |      |      +--> SURF-SET-REPO-ADD-001             |
   |      |      +--> SURF-SET-REPO-MOVE-001            |
   |      |      +--> SURF-CONF-REPO-DISCONNECT-001     |
   |      +--> SURF-SET-OC-001 OpenCode accounts        |
   |      |      +--> SURF-SET-OC-RENAME-001            |
   |      |      +--> SURF-SET-OC-ADD-001               |
   |      |      +--> SURF-SET-OC-LOGIN-001             |
   |      |      +--> SURF-CONF-OC-REMOVE-001           |
   |      +--> SURF-SET-MODEL-001 Model/runtime         |
   |                                                    |
   +--> SURF-WI-001 selected WorkItem shell <-----------+
          |
          +--> SURF-WI-CONTEXT-001 Context
          +--> SURF-STEP-WR-001 Work request
          +--> SURF-STEP-R1-001 Research
          +--> SURF-STEP-R2-001 Requirements
          +--> SURF-STEP-DESIGN-001 Solution design
          +--> SURF-STEP-PLAN-001 Implementation plan
          +--> SURF-STEP-R3-001 Readiness review
          +--> SURF-STEP-APPROVAL-001 Approval
          +--> SURF-STEP-EXEC-001 Implementation
          +--> SURF-STEP-COMPLETE-001 Complete
          |
          +--> reusable selected materials
          |      +--> SURF-MAT-SOURCE-001 source document
          |      +--> SURF-MAT-DOC-001 lifecycle document
          |      +--> SURF-MAT-DOC-RO-001 read-only lifecycle/supporting document
          |      +--> SURF-MAT-ACTIVITY-001 Run dialogue/activity
          |      +--> SURF-MAT-PROPOSAL-001 proposal review
          |      +--> SURF-MAT-EVIDENCE-001 evidence/raw-content view
          |      +--> SURF-MAT-APPROVAL-TASK-001 signed/historical task detail
          |      +--> SURF-MAT-EXEC-TASK-001 execution task detail
          |
          +--> safety/commit overlays
                 +--> SURF-CONF-DIRTY-DEST-001
                 +--> SURF-CONF-DIRTY-MATERIAL-001
                 +--> SURF-CONF-ARCHIVE-001
                 +--> SURF-CONF-DOC-GIT-001
~~~

The reusable material surfaces remain children of the selected workflow-step context. Opening them does not create another lifecycle/navigation owner.

## 8. Surface registry

### 8.1 Application and queue/settings surfaces

| SURF id | Surface | Source owner | Parent / entry condition |
|---|---|---|---|
| `SURF-APP-001` | application shell/toolbar/destination composition | `ui/src/app.tsx` + `WorkbenchLayout` | authenticated SPA |
| `SURF-QUEUE-001` | active/archived WorkItem queue | `ui/src/WorkItemQueue.tsx` | no selected WorkItem and no Settings section |
| `SURF-CREATE-001` | Create WorkItem / linked-remediation task panel | `app.tsx` + `CreateWorkItem.tsx` + `WorkbenchTaskPanel` | `createOpen` |
| `SURF-SET-001` | Settings frame/readiness/navigation | `ui/src/SettingsWorkspace.tsx` | any `/settings/*` destination |
| `SURF-SET-REPO-001` | repository/reference-root settings | `SettingsWorkspace.tsx::RepositorySettings` | Settings section `repositories` |
| `SURF-SET-REPO-ADD-001` | add-repository bounded form | `SettingsWorkspace.tsx` | add-repository local state open |
| `SURF-SET-REPO-MOVE-001` | move WorkItem document root bounded form | `SettingsWorkspace.tsx` | per-repository move-root local state open |
| `SURF-SET-OC-001` | saved OpenCode accounts | `ui/src/OpenCodeAccountSettings.tsx` | Settings section `opencode` |
| `SURF-SET-OC-RENAME-001` | rename-account bounded form | `OpenCodeAccountSettings.tsx` | `renaming !== null` |
| `SURF-SET-OC-ADD-001` | add-account form | `OpenCodeAccountSettings.tsx` | `adding && loginAttemptId === null` |
| `SURF-SET-OC-LOGIN-001` | OpenCode login-attempt state | `OpenCodeAccountSettings.tsx` | `adding && loginAttemptId !== null` |
| `SURF-SET-MODEL-001` | configured model/runtime settings | `SettingsWorkspace.tsx::ModelRuntimeSettings` | Settings section `model` |

### 8.2 Selected WorkItem and workflow-step surfaces

| SURF id | Surface | Source owner | Parent / entry condition |
|---|---|---|---|
| `SURF-WI-001` | selected WorkItem shell, identity, rail, current-attention composition | `ui/src/WorkItemWorkspace.tsx` | selected WorkItem loaded |
| `SURF-WI-CONTEXT-001` | technical Context | `ui/src/WorkItemContext.tsx` + `WorkbenchLayout` | explicit Context open; wide panel or constrained Drawer |
| `SURF-STEP-WR-001` | Work request | `WorkItemWorkspace.tsx` + `SourceDocumentMaterial` | selected workflow step `IDEA` |
| `SURF-STEP-R1-001` | Research | `WorkItemWorkspace.tsx` + `PreSignoffStageWorkspace` | selected step `R1` |
| `SURF-STEP-R2-001` | Requirements | same shared pre-signoff renderer | selected step `R2` |
| `SURF-STEP-DESIGN-001` | Solution design | same shared pre-signoff renderer | selected step `DESIGN` |
| `SURF-STEP-PLAN-001` | Implementation plan | same shared pre-signoff renderer | selected step `PLAN` |
| `SURF-STEP-R3-001` | Readiness review | `ui/src/ReadinessWorkspace.tsx` | selected step `R3` |
| `SURF-STEP-APPROVAL-001` | Approval review | `ui/src/SignoffReview.tsx` | selected step `AWAITING_SIGNOFF` |
| `SURF-STEP-EXEC-001` | Implementation master/detail | `ui/src/ExecutionWorkspace.tsx` | selected step `EXECUTION` |
| `SURF-STEP-COMPLETE-001` | terminal result | `ui/src/TerminalResult.tsx` | selected step `COMPLETE` with terminal material |

### 8.3 Reusable workflow material surfaces

| SURF id | Surface | Source owner | Reached from |
|---|---|---|---|
| `SURF-MAT-SOURCE-001` | Work request Markdown document/editor | `ui/src/DocumentWorkspace.tsx::SourceDocumentMaterial` | Work request or supporting source selection |
| `SURF-MAT-DOC-001` | editable lifecycle Markdown document | `DocumentWorkspace.tsx::LifecycleDocumentMaterial` | current R1/R2/DESIGN/PLAN governed document |
| `SURF-MAT-DOC-RO-001` | read-only lifecycle/supporting document | `DocumentWorkspace.tsx::ReadOnlyLifecycleDocumentMaterial` | historical/supporting/R3/Approval material |
| `SURF-MAT-ACTIVITY-001` | STAGE Run dialogue/activity | `ui/src/ActivityWorkspace.tsx::StageRunMaterial` | R1/R2/DESIGN/PLAN/R3 Run selection |
| `SURF-MAT-PROPOSAL-001` | artifact proposal review | `ui/src/ProposalReview.tsx` | unresolved/resolved proposal selection |
| `SURF-MAT-EVIDENCE-001` | raw evidence/artifact bytes | `ui/src/EvidenceViewer.tsx` | event/resource/evidence selection |
| `SURF-MAT-APPROVAL-TASK-001` | signed or historical task detail | `ui/src/SignoffReview.tsx` | Approval task selection |
| `SURF-MAT-EXEC-TASK-001` | selected execution task/attempt/validation detail | `ui/src/ExecutionWorkspace.tsx` | Implementation task/attempt selection |

### 8.4 Safety and confirmation overlays

| SURF id | Overlay | Source owner | Trigger |
|---|---|---|---|
| `SURF-CONF-DIRTY-DEST-001` | discard unsaved Markdown on app destination change | `ui/src/app.tsx` | attempted WorkItem/Settings/queue navigation while workspace dirty |
| `SURF-CONF-DIRTY-MATERIAL-001` | discard unsaved Markdown on workflow/material selection | `WorkItemWorkspace.tsx` | selection change while dirty |
| `SURF-CONF-ARCHIVE-001` | archive/restore WorkItem | `WorkItemWorkspace.tsx` | archive/restore command |
| `SURF-CONF-DOC-GIT-001` | commit governed WorkItem documentation | `DocumentWorkspace.tsx::DocumentationGitConfirmation` | explicit documentation Git save |
| `SURF-CONF-REPO-DISCONNECT-001` | disconnect repository | `SettingsWorkspace.tsx` | disconnect command |
| `SURF-CONF-OC-REMOVE-001` | remove saved OpenCode account | `OpenCodeAccountSettings.tsx` | remove-account command |

## 9. Per-surface typed data/model/schema input map

P1-T04 traces the exact typed inputs that can become visible. Browser-local presentation state is listed separately from canonical/domain state.

### 9.1 Application shell, Queue and Create

| Surface | Typed input / local state | Transport / projection | Presentation use |
|---|---|---|---|
| `SURF-APP-001` | `InstallationReadiness { ready, blockers[] }` | `GET /api/settings/readiness` | global setup notice and Settings destination |
| `SURF-APP-001` | `WorkItemSourceDiagnostic[] { code, path, workItemId, detail }` | `GET /api/work-item-sources/diagnostics` | global source-diagnostic notice |
| `SURF-APP-001` | `OpenCodeAccountState { accounts[], mutationBlockers[] }` | `GET /api/opencode/accounts` through `OpenCodeAccountControl` | active account label/readiness utility |
| `SURF-APP-001` | browser-local `themePreference` | localStorage / media preference | System/Light/Dark selection only; not workflow state |
| `SURF-APP-001` | browser-local destination/search/create/context/dirty state | React state | current destination, queue filtering, task-panel/context visibility, dirty-navigation confirmation |
| `SURF-QUEUE-001` | `WorkItem[]`: `id,title,projectId,schemaId,stage,status,concernIds,archived` | `GET /api/work-items` / archived variant | every row datum and row eligibility |
| `SURF-QUEUE-001` | `WorkItemSchemaCatalogEntry[] { schemaId, kind }` | `GET /api/work-item-schemas` | schema id → human work-kind label |
| `SURF-CREATE-001` | `ProjectManifest[] { projectId, concerns, workItems.root }` | `GET /api/projects` | project/concern choices and project-local document boundary |
| `SURF-CREATE-001` | `WorkItemSchemaCatalogEntry[]` | `GET /api/work-item-schemas` | eligible kind choices; linked remediation restricts to CHANGE/DEFECT |
| `SURF-CREATE-001` | local `projectId,schemaId,title,concernIds,derivedFromWorkItemId` | React state | current authoring choices and submit eligibility |

### 9.2 Settings

| Surface | Typed input | Transport | Presentation use |
|---|---|---|---|
| `SURF-SET-001` | `InstallationReadiness.ready/blockers` | `GET /api/settings/readiness` | readiness notice and blocker links |
| `SURF-SET-REPO-001` | `ConnectedRepositoryState[] { repositoryRoot,status,projectId,workItemsRoot,manifestSha256,attention[] }` | `GET /api/settings/repositories` | repository table/status/actions |
| `SURF-SET-REPO-001` | `OrderConfigState { config.referenceRoots, sha256 }` | `GET /api/settings/config` | reference-root editor + expected config hash for mutation |
| `SURF-SET-MODEL-001` | `OrderConfigState.config.model` | `GET /api/settings/config` | configured model |
| `SURF-SET-MODEL-001` | `OpenCodeModelRef[] { providerID,id }` | `GET /api/settings/models` | selectable model list |
| `SURF-SET-OC-001` | `OpenCodeAccountState.accounts[] { id,label,active,status }` | `GET /api/opencode/accounts` | saved account table |
| `SURF-SET-OC-001` | `OpenCodeAccountState.mutationBlockers[]` | same | account-change blocker notices and control disabling |
| `SURF-SET-OC-LOGIN-001` | `OpenCodeAccountLoginAttempt { id,authorizationUrl,instructions,expiresAt,status,message }` | `GET /api/opencode/accounts/login/:id` | device-login instructions/status/action |

### 9.3 Selected WorkItem shell and workflow projection

| Surface | Typed input / derived value | Source | Presentation use |
|---|---|---|---|
| `SURF-WI-001` | `WorkItem { title,stage,status,outcome,sourceSha256,sourcePath,schemaId,projectId,concernIds,archived }` | selected WorkItem query | identity, current lifecycle, terminal classification, source/currentness checks |
| `SURF-WI-001` | `Run[]`, `RunEvent[]`, `ArtifactRef[]`, `ExecutionTask[]` | runs/events/artifacts/tasks queries | reached stages, current attempt, proposal, execution/currentness derivations |
| `SURF-WI-001` | `WorkItemSourceSnapshot.sha256` + source diagnostics | source/diagnostic queries | source-authority reconciliation |
| `SURF-WI-001` | `SignoffPackage` or typed stale-authority HTTP error | sign-off package query | Approval current/stale/unavailable presentation |
| `SURF-WI-001` | `deriveReachedStages` | core lifecycle function | current/reached/unreached rail states |
| `SURF-WI-001` | `deriveProposalDecision` + `stageRunInteraction` | core lifecycle functions | pending proposal / required input / open/closed interaction |
| `SURF-WI-001` | `normalizeMaterialCurrentness` | core lifecycle | current/stale authority |
| `SURF-WI-001` | `deriveExecutionOwner`, `deriveValidationBoundary` | core lifecycle | execution ownership and validation boundary |
| `SURF-WI-001` | `deriveRecoveryDisposition` | core lifecycle | retry/resume/reconcile action ownership |
| `SURF-WI-001` | `deriveObservationCoherence` + transport-pending checks | core + query state | COHERENT/CONVERGING mutation gating |
| `SURF-WI-001` | `deriveCurrentAttention` | core lifecycle | single current-attention class |
| `SURF-WI-001` | `deriveWorkflowRail` | core lifecycle | rail marker/status presentation |
| `SURF-WI-001` | `resolveWorkflowMaterial` | pure UI projection consuming canonical derivations | exact material shown for selected step |
| `SURF-WI-001` | browser-local selected step/material/return/focus/dirty state | React state | non-mutating inspection and transient-return behavior |

### 9.4 Document/material surfaces

| Surface | Typed input | Transport / derivation | Presentation use |
|---|---|---|---|
| `SURF-MAT-SOURCE-001` | `WorkItemSourceSnapshot { path,sha256,markdown,bodyMarkdown,metadata }` | `GET /api/work-items/:id/source` | editable Work request, exact source, expected-hash Save |
| `SURF-MAT-SOURCE-001` | `WorkItemDocumentationGitStatus { headCommit,branch,author*,blockers[],paths[] }` | documentation-git-status API | Git status/control/technical detail |
| `SURF-MAT-DOC-001` / RO | `ArtifactRef { id,repositoryPath,role,authorityLayer,sha256,gitCommit }` | lifecycle-artifacts query | document identity/current role/path/hash |
| `SURF-MAT-DOC-001` / RO | exact artifact bytes | artifact-content API + `MarkdownTextSchema` decode | Markdown editor/read-only content or exact-byte fallback |
| `SURF-MAT-DOC-001` | `artifactDirectEditIsAllowed(workItem, artifact)` | core lifecycle | direct-edit eligibility |
| `SURF-MAT-ACTIVITY-001` | `Run { id,stage,role,status,attempt,baselineCommit,contextHash,providerSessionId,terminalClassification,startedAt }` | runs query | attempt identity/status plus technical disclosure |
| `SURF-MAT-ACTIVITY-001` | `RunEvent[]` | run-events API | timeline, required input, evidence/proposal affordances |
| `SURF-MAT-ACTIVITY-001` | `StageRunInteraction`, `CurrentAttentionTag` | core derivation | composer/cancel visibility and current-action ownership |
| `SURF-MAT-PROPOSAL-001` | `ARTIFACT_PROPOSAL_CREATED { targetPath,rationale,unifiedDiff }` and disposition/adoption events | run-events API | proposal review content/currentness |
| `SURF-MAT-EVIDENCE-001` | artifact bytes or `EvidenceRef.relativePath` bytes | artifact/evidence APIs | exact raw evidence |

### 9.5 R3, Approval, Implementation and Complete

| Surface | Typed input | Source | Presentation use |
|---|---|---|---|
| `SURF-STEP-R3-001` | R3 `ArtifactRef`, R3 STAGE `Run[]`, upstream `ArtifactRef[]` | artifacts/runs | readiness currentness, attempts, package material |
| `SURF-STEP-APPROVAL-001` | `SignoffPackage { baselineCommit,packageHash,sourceSha256,taskBlock.tasks[] }` | signoff-package query | current exact package and task definitions |
| `SURF-STEP-APPROVAL-001` | historical `ExecutionTask[]` | tasks query | post-sign-off Approval history |
| `SURF-MAT-APPROVAL-TASK-001` | `SignedTaskDefinition` or `ExecutionTask`: objective,dependsOn,scope,exclusions,acceptanceRefs,changeSurface,gateIds,authorityRefs,concernIds | package/task data | task review |
| `SURF-STEP-EXEC-001` | `ExecutionTask[]`, `Run[]`, `ArtifactRef[]` | task/run/all-artifact queries | task master, attempts, resources |
| `SURF-MAT-EXEC-TASK-001` | `ExecutionOwner`, `ValidationBoundary` | core lifecycle | current owner/action and current validation boundary |
| `SURF-MAT-EXEC-TASK-001` | validation `RunEvent[]` | run-events query | recorded validation rows and timeline |
| `SURF-STEP-COMPLETE-001` | `WorkItem.outcome` | WorkItem | terminal classification |
| `SURF-STEP-COMPLETE-001` | lifecycle `ArtifactRef[]` + exact bytes | artifacts/content APIs | governed result material |
| `SURF-STEP-COMPLETE-001` | execution `Run[]` + event evidence | runs/events APIs | verified-candidate resources |

### 9.6 Technical Context

`SURF-WI-CONTEXT-001` deliberately consumes exact technical identity:

- selected step/material from browser selection plus `workflowMaterialLabel`;
- selected document path/SHA from the owning document material;
- selected `Run.id,role,status,attempt,startedAt`;
- source-diagnostic count;
- `WorkItem.stage,status,outcome,projectId,schemaId,concernIds`;
- work kind derived from the schema catalog.

These values are not re-owned by Context; it is a secondary projection of existing facts.

## 10. Per-surface conditional-render/state-scenario matrix

The matrix defines the **minimum covering scenarios** that P1-T03 must render. It does not require a Cartesian product. A combination may be omitted only when source/core state rules prove it impossible or when the differing axis cannot change presentation/interactions for that surface.

| Surface family | Required scenario axes / covering states |
|---|---|
| `SURF-APP-001` | queue vs selected WorkItem vs Settings; app/query loading; selected-WorkItem 404/error; installation-readiness loading/error/ready/blocker; source diagnostics present/absent; create panel closed/open; dirty-destination confirmation; System/Light/Dark theme |
| `SURF-QUEUE-001` | active list populated/empty; archived hidden/shown; archived-query loading/error; restore pending/error; long title/concern density; narrow vs wide row representation |
| `SURF-CREATE-001` | ordinary creation vs linked remediation; no project/schema/title vs valid form; project selected root visible; concern selection; submit pending; submit failure; compact/wide dialog |
| `SURF-SET-001` | readiness loading/error/ready; each blocker class; repositories/opencode/model navigation |
| `SURF-SET-REPO-001` | repository list loading/error/empty/populated; ready vs attention repository; add form closed/open; move-root closed/open; connect/migrate/reference-root mutation pending/error; disconnect confirmation |
| `SURF-SET-OC-001` | accounts loading/error/empty/populated; account mutation allowed vs blocked by active Run/login mutation; active/inactive account; activation/rename/remove errors |
| `SURF-SET-OC-RENAME-001` | valid/invalid label; rename pending; cancel |
| `SURF-SET-OC-ADD-001` | valid/invalid label; start-login pending/error; cancel |
| `SURF-SET-OC-LOGIN-001` | login query pending/error; attempt PENDING/COMPLETED/FAILED/EXPIRED/CANCELLED; cancel pending |
| `SURF-SET-MODEL-001` | models loading/error/populated; configured model valid/invalid/unavailable; update pending/error |
| `SURF-WI-001` | selected step CURRENT/HISTORICAL/UNREACHED; observation COHERENT/CONVERGING; each `CurrentAttentionTag`: CONVERGING, MUTATION_CONFLICT, REQUIRED_INPUT, PROPOSAL_DECISION, PROPOSAL_ADOPTION, BLOCKER, RECOVERY, STALE_AUTHORITY, PROCESSING, ACTIONABLE, ORDINARY; WorkItem ACTIVE/BLOCKED/COMPLETE where legal; wide/medium/narrow |
| `SURF-WI-CONTEXT-001` | closed/open; wide inline panel vs medium/narrow Drawer; source/document material vs Run material vs non-document material; selected Run present/absent; diagnostics present/absent |
| `SURF-STEP-WR-001` / `SURF-MAT-SOURCE-001` | source loading/error/current; edit/view/preview modes; clean/dirty; save pending/error/conflict; source diagnostic present; IDEA current vs progressed/historical inspection; Git status loading/error/clean/dirty; Git-save confirmation |
| R1/R2/DESIGN/PLAN step surfaces | CURRENT/HISTORICAL/UNREACHED; no Run/no artifact; Run activity selected; current lifecycle document; supporting document; proposal selected; evidence selected; multiple attempts/documents; each relevant current-attention state; wide/medium/narrow material selector; long Markdown/activity density |
| `SURF-MAT-ACTIVITY-001` | no selected Run; events loading/error/empty/populated; Run PROCESSING/OPEN/REQUIRED_INPUT/CLOSED derived interaction; current vs historical attempt; cancel allowed/hidden; composer free-form/required-input/absent; action mutation pending/error; technical disclosure; proposal/evidence events present |
| `SURF-MAT-DOC-001` | artifact/content loading/error/current/missing; editable vs mutations-disabled; clean/dirty; save pending/error/conflict; Git state variants; preview/source/edit modes; long document |
| `SURF-MAT-DOC-RO-001` | content loading/error/current; supporting/historical/R3/Approval usage; long document |
| `SURF-MAT-PROPOSAL-001` | events loading/error; proposal missing; pending disposition; adoption requested/in progress; adopted; rejected; decision pending/error; mutations disabled |
| `SURF-STEP-R3-001` | CURRENT/HISTORICAL/UNREACHED; readiness artifact absent/present; Run attempts absent/present; current required input/processing/blocker; package documents; evidence; long findings/package |
| `SURF-STEP-APPROVAL-001` | package loading/error/available; current vs historical vs unreached; package current/stale owner; overview/document/task selection; approver input absent/present; signoff pending/error; many tasks/documents |
| `SURF-MAT-APPROVAL-TASK-001` | signed task vs historical ExecutionTask; long scope/exclusions/change-surface/authority lists |
| `SURF-STEP-EXEC-001` / `SURF-MAT-EXEC-TASK-001` | tasks loading/error/empty; current owner NONE/CURRENT_TASK/BLOCKED_TASK; selected current vs historical task; no attempts vs attempts; Run active/waiting/completed/failed/blocked/cancelled; events loading/error/empty/populated; validation boundary NONE/PASSED_THROUGH/FAILED_AT/COMPLETE; evidence selected; recovery/resume; many tasks/attempts |
| `SURF-MAT-EVIDENCE-001` | no selection; evidence loading/error/success; long text/binary-decoded content; return/focus path |
| `SURF-STEP-COMPLETE-001` | AUDIT_COMPLETE/INVESTIGATION_COMPLETE; CANDIDATE_DONE; ALREADY_SATISFIED and other legal terminal outcomes; governed result loading/error/empty/content; multiple result artifacts; candidate runs/evidence loading/error/empty/populated; linked remediation available/not applicable |
| confirmation overlays | closed/open; pending false/true when mutation-backed; confirm/cancel; originating focus return; narrow/wide browser |

### 10.1 Canonical state axes used by scenario selection

P1-T02 does not define new state. The scenario axes are sourced from current core types/derivations:

- `StageRunInteraction`: `PROCESSING | OPEN | REQUIRED_INPUT | CLOSED`;
- `ProposalDecision`: `NONE | PENDING | ADOPTION_IN_PROGRESS`;
- `MaterialCurrentness`: `CURRENT | STALE(owner)`;
- `ExecutionOwner`: `NONE | CURRENT_TASK | BLOCKED_TASK`;
- `ValidationBoundary`: `NONE | PASSED_THROUGH | FAILED_AT | COMPLETE`;
- `RecoveryDisposition`: `NONE | RETRY_CURRENT_STAGE | RESUME_CURRENT_OWNER | RECONCILE_AUTHORITY`;
- `ObservationCoherence`: `COHERENT | CONVERGING`;
- `CurrentAttentionTag`: the eleven tags enumerated in the WorkItem-shell row above;
- workflow reach: current / reached-historical / unreached.

Impossible combinations are resolved by the canonical core rules in P1-T06; P1-T03 should not fabricate fixtures for states the core rejects.

## 11. Rendered evidence manifest

P1-T03 captured the current application through the repository's existing Playwright/e2e application path at exact audit SHA `54e0a204bf35be1ee7d6118e798531015475baa0`. Temporary GitHub Actions scaffolding was removed after capture; the branch tree contains no Phase-1 workflow.

Three retained evidence artifacts cover the application:

| Run | Artifact ID | Digest | Evidence class | Coverage |
|---|---:|---|---|---|
| `43785880126` | `14190501955` | `sha256:78831b19f5d716ebee5d8b88c0b6362e7590b6570c0844621ef01405e6968917` | production runtime | broad application/workflow capture, 29 screenshots |
| `43786952469` | `14190488690` | `sha256:9bd00bfcba627c7d104015cf7cb329240e9d887185f89660e5dcc92f93b0b3e8` | production runtime + deterministic OpenCode UI contract fixture | repository nested settings + populated OpenCode account surface, 4 screenshots |
| `43787594359` | `14190659108` | `sha256:1e0e4558f14d452a15dc99c80962893bb529902632688679e79de686ed01ce70` | production runtime + deterministic OpenCode UI contract fixture | OpenCode account interactions + confirmations, 6 screenshots |
| `43787807267` | `14190539793` | `sha256:3246ad293387df3dc866f6f01c9423dcf72700799c95bea47019197ffcb406e3` | production runtime | Git confirmation, long-source density, light/dark theme, 5 screenshots |

All manifests pin the same audit SHA. Failed workflow conclusions on the first three runs were **capture-scaffolding failures after valid evidence had already been flushed and uploaded**; they are not product verdicts. The final capture run `43787807267` passed.

### 11.1 Direct capture index

| File(s) | SURF | Captured condition |
|---|---|---|
| `01-queue-wide.png`, `02-queue-narrow.png` | `SURF-QUEUE-001` | active queue wide/narrow, including source-diagnostic environment |
| `03-create-work-item.png` | `SURF-CREATE-001` | ordinary creation task panel |
| `04-settings-repositories.png` | `SURF-SET-REPO-001` | repository Settings |
| `05-settings-opencode-empty.png`, `34-settings-opencode-populated.png` | `SURF-SET-OC-001` | empty and populated OpenCode-account states |
| `06-settings-model.png` | `SURF-SET-MODEL-001` | model/runtime Settings |
| `07-work-request.png` | `SURF-STEP-WR-001`, `SURF-MAT-SOURCE-001` | Work request document/editor |
| `08-research-document.png` | `SURF-STEP-R1-001`, `SURF-MAT-DOC-001` | Research governed document |
| `09-requirements-document.png` | `SURF-STEP-R2-001`, `SURF-MAT-DOC-001` | Requirements governed document |
| `10-design-document.png` | `SURF-STEP-DESIGN-001`, `SURF-MAT-DOC-001` | Solution-design governed document |
| `11-plan-document.png` | `SURF-STEP-PLAN-001`, `SURF-MAT-DOC-001` | Implementation-plan governed document |
| `12-readiness-review.png` | `SURF-STEP-R3-001`, `SURF-MAT-DOC-RO-001` | Readiness review/package material |
| `13-approval.png`, `21-approval-current.png` | `SURF-STEP-APPROVAL-001` | Approval inspection/current sign-off package |
| `14-required-input.png` | `SURF-MAT-ACTIVITY-001` | STAGE required-input dialogue |
| `15-proposal-review.png`, `16-proposal-adoption.png` | `SURF-MAT-PROPOSAL-001` | pending proposal and adoption-in-progress |
| `17-retry-recovery.png`, `18-blocked-resume.png` | `SURF-WI-001` | failed-stage retry and blocked-stage resume ownership |
| `19-context-wide.png`, `20-context-narrow.png` | `SURF-WI-CONTEXT-001` | wide Context panel and narrow Drawer |
| `22-approval-task.png` | `SURF-MAT-APPROVAL-TASK-001` | signed task detail |
| `23-implementation-ready.png` | `SURF-STEP-EXEC-001` | Implementation with current TODO owner |
| `24-implementation-failed.png`, `25-implementation-verified.png` | `SURF-MAT-EXEC-TASK-001` | failed review/validation feedback and verified reviewer attempt |
| `26-evidence.png` | `SURF-MAT-EVIDENCE-001` | raw evidence inspection |
| `27-complete-audit.png`, `28-complete-candidate.png` | `SURF-STEP-COMPLETE-001` | AUDIT_COMPLETE and CANDIDATE_DONE results |
| `29-dirty-selection-confirmation.png` | `SURF-CONF-DIRTY-MATERIAL-001` | dirty workflow/material selection |
| `31-settings-repository-add.png` | `SURF-SET-REPO-ADD-001` | add repository form |
| `32-settings-repository-move.png` | `SURF-SET-REPO-MOVE-001` | move WorkItem documents form |
| `33-settings-repository-disconnect.png` | `SURF-CONF-REPO-DISCONNECT-001` | disconnect confirmation |
| `35-settings-opencode-rename.png` | `SURF-SET-OC-RENAME-001` | rename account form |
| `36-settings-opencode-remove.png` | `SURF-CONF-OC-REMOVE-001` | remove account confirmation |
| `37-settings-opencode-add.png`, `38-settings-opencode-login.png` | `SURF-SET-OC-ADD-001`, `SURF-SET-OC-LOGIN-001` | add-account and pending device-login states |
| `39-archive-confirmation.png` | `SURF-CONF-ARCHIVE-001` | WorkItem archive confirmation |
| `40-dirty-destination-confirmation.png` | `SURF-CONF-DIRTY-DEST-001` | dirty document blocks application destination change |
| `41-document-git-confirmation.png` | `SURF-CONF-DOC-GIT-001` | governed documentation Git commit confirmation |
| `42-long-source-wide.png`, `43-long-source-narrow.png` | `SURF-MAT-SOURCE-001` | long-content density wide/narrow |
| `44-theme-light.png`, `45-theme-dark.png` | `SURF-APP-001` | explicit Light/Dark application rendering |

The Settings shell `SURF-SET-001` and selected WorkItem shell `SURF-WI-001` are parent compositions visible in their child captures rather than separate screenshots. The read-only lifecycle document surface is exercised inside R3/Approval captures. These are not separate geometry owners.

### 11.2 OpenCode fixture boundary

Screenshots `34`–`38` use the repository's existing deterministic fake OpenCode provider **behind the real daemon/API/UI path** to make saved-account and device-login UI states reproducible.

They prove:

- the current typed Order account state can render those UI compositions;
- the normal account mutation visibility/enablement rules are exercised;
- the real same-origin HTTP mutation boundary is used.

They do **not** prove that the pinned external OpenCode binary exposes the represented capabilities or state. That capability question belongs exclusively to P1-T07 and must use pinned-integration evidence.

During capture, account mutations were initially disabled because the shared E2E fixture contained active Runs. The harness closed those Runs through the real `POST /api/runs/:id/cancel` path. A missing `Origin` header was rejected with `403`, confirming the daemon's same-origin mutation guard; the harness then used the admitted same-origin request.

### 11.3 Scenario coverage rule

The screenshots are visual evidence for the materially different **composition, hierarchy, density, responsive and overlay geometries** in §10. They are not a second state-machine certification suite.

Conditional states that reuse an already captured composition but change text/status/action values remain proven through:

1. exact source/render predicates in P1-T04/P1-T05;
2. permanent browser/core/daemon tests recorded by P1-T09; and
3. the direct rendered representative for that composition family.

If P1-T04/P1-T05 discovers a conditional branch that changes geometry or interaction composition and is not represented above, P1-T03 reopens and captures that state before Phase 1 can close.

### 11.4 P1-T03 completion verdict

**P1-T03: COMPLETE, subject to reopen-on-new-surface rule.**

The registered primary compositions, overlays, responsive Context modes, long-content density and theme variants have direct rendered evidence at the exact audited implementation SHA. Temporary GitHub Actions scaffolding has been removed from the branch tree.

P1-T04 may now attach typed data lineage and render predicates to these captured surfaces.

## 12. Per-surface information inventory — P1-T04

P1-T04 traces every materially distinct persistent information region from canonical/typed source to rendered presentation. Rows group labels only when they share the same semantic owner, predicate and hierarchy role; independently governed values receive separate rows.

**Information classes used below**

- **identity/navigation** — where the operator is / what object is selected;
- **primary work** — material necessary to perform the current task;
- **current attention/action** — blocker, request, failure, proposal or next governed action;
- **workflow state** — lifecycle/Run/execution state meaningful to ordinary operation;
- **material currentness** — source/document/proposal/package currentness;
- **conversation/agent activity** — product-facing persisted human/agent interaction;
- **proposal/review** — proposed mutation and disposition evidence;
- **evidence** — referenced exact material;
- **supporting context/history** — useful but subordinate inspection;
- **configuration/readiness** — installation configuration facts;
- **technical** — exact implementation/audit identity, intended on demand;
- **debug diagnostic** — raw implementation/provider/event detail.

### 12.1 Application shell, Queue and Create

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-APP-001 | SURF-APP-001 | “Order” + destination description (“Governed work queue”, “Governed work item”, “Settings”) | browser destination state in `app.tsx`: `selectedWorkItemId`, `settingsSection` | always; description selected by destination | identity/navigation; local presentation state | CORRECT | 01, 04, 07 |
| INFO-APP-002 | SURF-APP-001 | Queue search field | local `search` state | only queue destination | navigation/inspection; non-authoritative local state | CORRECT | 01, 02 |
| INFO-APP-003 | SURF-APP-001 | installation “Setup requires attention” warning and Settings destination | `InstallationReadiness.ready/blockers[]` from `GET /api/settings/readiness`; blocker→section pure mapping | readiness loaded and `ready === false` | current attention/configuration; canonical daemon readiness projection | CORRECT; current blocker is kept outside hidden technical context | captured in Settings/readiness corpus |
| INFO-APP-004 | SURF-APP-001 | source diagnostic warning | `WorkItemSourceDiagnostic[]` from `GET /api/work-item-sources/diagnostics` | relevant diagnostics exist | current attention; canonical source diagnostic | CORRECT when actionable; T05 must prove owning recovery destination | 01 |
| INFO-APP-005 | SURF-APP-001 | selected WorkItem loading/error state | TanStack query state + `OrderHttpError` | selected WorkItem query pending/error | current attention; observational transport state | CORRECT | composition family captured by WorkItem states |
| INFO-QUEUE-001 | SURF-QUEUE-001 | WorkItem title | `WorkItem.title` | each visible row | primary scan identity; canonical WorkItem projection | CORRECT | 01, 02 |
| INFO-QUEUE-002 | SURF-QUEUE-001 | project id + Archived marker | `WorkItem.projectId`, `WorkItem.archived` | each row; Archived suffix iff archived | supporting identity/workflow state | CORRECT; project is useful queue disambiguation | 01, 02 |
| INFO-QUEUE-003 | SURF-QUEUE-001 | work kind | schema catalog lookup `WorkItem.schemaId -> WorkItemSchemaCatalogEntry.kind`; fallback schema id | each row | supporting classification; canonical catalog-derived | CORRECT | 01, 02 |
| INFO-QUEUE-004 | SURF-QUEUE-001 | workflow stage label | `WorkItem.stage -> workflowPresentation(stage).label` | each row | workflow state; canonical field + pure presentation | CORRECT | 01, 02 |
| INFO-QUEUE-005 | SURF-QUEUE-001 | Active/blocked/complete status | `WorkItem.status` | each row | workflow state; canonical | CORRECT | 01, 02 |
| INFO-QUEUE-006 | SURF-QUEUE-001 | concerns | `WorkItem.concernIds[]` | each row | supporting domain context; canonical | CORRECT, though density should be reconsidered only if Phase 2 finds scan cost excessive | 01, 02 |
| INFO-QUEUE-007 | SURF-QUEUE-001 | Active-only vs Active-and-archived queue description | local `showArchived`; archived query presence | toggle state | supporting navigation state; local | CORRECT | 01, 02 |
| INFO-CREATE-001 | SURF-CREATE-001 | selectable project ids | `ProjectManifest.projectId[]` | create panel open | configuration/domain context; canonical manifest | CORRECT | 03 |
| INFO-CREATE-002 | SURF-CREATE-001 | repository documentation root | selected `ProjectManifest.workItems.root` | selected project exists | supporting configuration; canonical manifest | CORRECT because creation destination is materially relevant | 03 |
| INFO-CREATE-003 | SURF-CREATE-001 | WorkItem type choices | `WorkItemSchemaCatalogEntry.kind/schemaId`; linked remediation filters to CHANGE/DEFECT | create panel open; filtered when `derivedFromWorkItemId !== null` | primary form choice; canonical catalog | CORRECT | 03 |
| INFO-CREATE-004 | SURF-CREATE-001 | title + concern choices | local title; `Object.keys(ProjectManifest.concerns)` | create panel open | primary form input | CORRECT | 03 |
| INFO-CREATE-005 | SURF-CREATE-001 | “Derived from …” exact WorkItem id | local `derivedFromWorkItemId: WorkItemId` originating from completed audit/investigation action | only linked-remediation creation | supporting provenance; canonical identity once child created | CORRECT as provenance, but exact UUID-like identity is technical-looking; Phase 2 may choose friendlier parent labeling while retaining traceability | linked creation composition family |
| INFO-CREATE-006 | SURF-CREATE-001 | creation failure | mutation error text | create mutation failed | current attention | CORRECT | composition family captured |

### 12.2 Settings and OpenCode account configuration

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-SET-001 | SURF-SET-001 | readiness state and blocker links | `InstallationReadiness.ready/blockers[]`; `blockerText/blockerSection` | loading/error/not-ready/ready branches | configuration/readiness; canonical daemon projection | CORRECT | 04–06 |
| INFO-SET-REPO-001 | SURF-SET-REPO-001 | project, Git root, WorkItem document root | `ConnectedRepositoryState.projectId/repositoryRoot/workItemsRoot` | repository row exists | primary configuration; canonical settings projection | CORRECT: exact paths are necessary configuration inputs here, unlike ordinary workflow screens | 04 |
| INFO-SET-REPO-002 | SURF-SET-REPO-001 | repository readiness/attention | `ConnectedRepositoryState.status/attention[]` -> `repositoryAttentionText` | row exists | configuration/readiness | CORRECT | 04 |
| INFO-SET-REPO-003 | SURF-SET-REPO-001 | repository loading/error/empty | query state | query branch | current attention/configuration | CORRECT | 04 composition family |
| INFO-SET-REPO-004 | SURF-SET-REPO-MOVE-001 | target repository identity + new document root | selected `ConnectedRepositoryState.projectId/repositoryRoot/workItemsRoot/manifestSha256` + local target root | migration target selected | primary bounded configuration task | CORRECT | 32 |
| INFO-SET-REPO-005 | SURF-SET-REPO-ADD-001 | exact Git root input | local `repositoryRoot`; commit uses config `sha256` as hidden optimistic precondition | add form open | primary bounded configuration task | CORRECT | 31 |
| INFO-SET-REPO-006 | SURF-SET-REPO-001 | queue/creation project context | ready repository `projectId` list + local `queueProjectId` | >1 ready project | supporting configuration | CORRECT | repository settings family |
| INFO-SET-REPO-007 | SURF-SET-REPO-001 | STAGE reference roots | `OrderConfigState.config.referenceRoots[]` | repository section | primary configuration | CORRECT | 04 |
| INFO-SET-MODEL-001 | SURF-SET-MODEL-001 | configured model and available provider/model choices | `OrderConfigState.config.model`; `OpenCodeModelRef.providerID/id[]` | model Settings | primary configuration | CORRECT | 06 |
| INFO-SET-MODEL-002 | SURF-SET-MODEL-001 | model loading/error/update failure | query/mutation state | corresponding failure/pending branch | current attention/configuration | CORRECT | 06 composition family |
| INFO-SET-OC-001 | SURF-SET-OC-001 | saved account label | `OpenCodeAccount.label` | account exists | primary configuration | CORRECT | 34 |
| INFO-SET-OC-002 | SURF-SET-OC-001 | account active/auth state | `OpenCodeAccount.active`, discriminated `status.status`; `accountStatusText` | account exists | configuration/readiness | CORRECT | 34 |
| INFO-SET-OC-003 | SURF-SET-OC-001 | NEEDS_AUTH message and optional sign-in URL | `OpenCodeAccount.status.message/url` when `status === NEEDS_AUTH` | NEEDS_AUTH only | current attention/configuration | CORRECT | account-state family |
| INFO-SET-OC-004 | SURF-SET-OC-001 | account mutation-blocker notices | `OpenCodeAccountState.mutationBlockers[]` | non-empty | current attention/configuration | CORRECT | 34 |
| INFO-SET-OC-005 | SURF-SET-OC-001 | loading/error/empty saved-account states | account query state + `accounts.length` | branch-specific | current attention/configuration | CORRECT | 05, 34 |
| INFO-SET-OC-006 | SURF-SET-OC-RENAME-001 | account being renamed + editable label | selected `OpenCodeAccount.id/label` + local `renameLabel` | `renameAccountId !== null` and account still exists | primary bounded configuration task | CORRECT | 35 |
| INFO-SET-OC-007 | SURF-SET-OC-ADD-001 | new account label | local `addLabel`, validated by `OpenCodeAccountLabelSchema` | adding and no login attempt | primary bounded configuration task | CORRECT | 37 |
| INFO-SET-OC-008 | SURF-SET-OC-LOGIN-001 | authorization instructions, URL, expiry/status result | `OpenCodeAccountLoginAttempt.instructions/authorizationUrl/status/message` | login attempt exists | primary current task | CORRECT | 38 |
| INFO-SET-OC-009 | SURF-SET-OC-001 | account/provider-model separation footnote | static product copy | OpenCode account section | supporting explanatory context | CORRECT and prevents conflation of identity with model choice | 34 |

### 12.3 WorkItem shell, workflow rail and Context

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-WI-001 | SURF-WI-001 | WorkItem title | `WorkItem.title` | selected WorkItem | identity/navigation | CORRECT | 07–28 |
| INFO-WI-002 | SURF-WI-001 | current lifecycle label + WorkItem status in identity row | `WorkItem.stage -> workflowPresentation`; `WorkItem.status` | selected WorkItem | concise workflow identity | CORRECT under identity-row contract | 07–28 |
| INFO-WI-003 | SURF-WI-001 | workflow rail labels/current-reached-unreached/markers | `deriveWorkflowRail(workItem,reachedStages,currentAttention,recovery,selectedStep)` -> `WorkflowRailItem`; labels via `workflowPresentation` | selected WorkItem | workflow navigation/state; pure core derivation | CORRECT; canonical rail owner is pure lifecycle projection | 07–28 |
| INFO-WI-004 | SURF-WI-001 | selected step label/purpose/current-vs-reached-vs-unreached | `selectedStep`; `workflowPresentation`; `workflowStepState(workItem,reachedStages,selectedStep)` | selected step | primary workflow orientation | CORRECT | 07–28 |
| INFO-WI-005 | SURF-WI-001 | selected-step status summary | derived from source diagnostics, latest stage Run `status/terminalClassification`, current artifact presence, R3 state, signoff package state, tasks, WorkItem outcome | step-specific branch | workflow/material currentness; derived browser presentation from canonical facts | GENERALLY CORRECT; P1-T06 must verify state derivation closure | 07–28 |
| INFO-WI-006 | SURF-WI-001 | current blocker/recovery/stale-authority/mutation-conflict notice | `WorkItemSourceDiagnostic`, source SHA comparison, `CurrentAttentionTag`, `RecoveryDisposition`, normalized material currentness, signoff query error | only current selected step and corresponding condition | current attention/action | CORRECT placement: blocker remains with owning work | 17, 18, 21 |
| INFO-WI-007 | SURF-WI-001 | title mutation error/stale-source title error | title mutation result/error | only error | current attention | CORRECT in identity row because it belongs to title mutation | composition family |
| INFO-CTX-001 | SURF-WI-CONTEXT-001 | selected workflow step + material label | selected step/material -> `workflowPresentation/workflowMaterialLabel` | Context open | technical/supporting orientation | CORRECT | 19, 20 |
| INFO-CTX-002 | SURF-WI-CONTEXT-001 | selected document path + exact SHA | selected document state supplied by document material, `Sha256` | relevant selected document and path present | technical | CORRECT: on-demand Context is canonical home for exact path/hash | 19, 20 |
| INFO-CTX-003 | SURF-WI-CONTEXT-001 | selected Run id, role, status, attempt, started time | `Run.id/role/status/attempt/startedAt`; labels pure presentation | selected material identifies a Run and it is loaded | technical + supporting history | CORRECT in on-demand Context | activity Context family |
| INFO-CTX-004 | SURF-WI-CONTEXT-001 | source issue count | filtered `WorkItemSourceDiagnostic[]` | diagnostics exist | supporting diagnostic | CORRECT as secondary corroboration; current blocker must remain primary elsewhere | 19, 20 |
| INFO-CTX-005 | SURF-WI-CONTEXT-001 | canonical stage/status/outcome/project/kind/schema/concerns | `WorkItem.stage/status/outcome/projectId/schemaId/concernIds`; kind via schema catalog | disclosure opened | technical | CORRECT on demand | 19, 20 |

### 12.4 Work request and lifecycle documents

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-DOC-001 | SURF-MAT-SOURCE-001 | Work request body | `WorkItemSourceSnapshot.bodyMarkdown` from `GET /api/work-items/:id/source` | source query success | **primary work**, canonical source | CORRECT | 07, 42, 43 |
| INFO-DOC-002 | SURF-MAT-SOURCE-001 | source role/read-only explanation | `readOnly` + `WorkItem.stage` | source material | supporting material state | CORRECT | 07 |
| INFO-DOC-003 | SURF-MAT-SOURCE-001 | document presentation mode Edit/Preview/Split | local `MarkdownPresentationMode` | not read-only | local presentation control | CORRECT | 07 |
| INFO-DOC-004 | SURF-MAT-SOURCE-001 / SURF-MAT-DOC-001 | Unsaved/Current save state | editor buffer vs loaded Markdown | editable document | material currentness within local editor | CORRECT | 07–11 |
| INFO-DOC-005 | document materials | canonical-changed conflict + reload; save failure | incoming `sha256` vs loaded SHA + dirty/conflicted state; save mutation error | conflict/error only | current attention | CORRECT and owning | document conflict family |
| INFO-DOC-006 | source/lifecycle docs | Git state (“Unsaved edits”, “Checking Git…”, “Git state unavailable”, “Saved to Git”, “Saved to project, not Git”) | `WorkItemDocumentationGitStatus.paths[]`, local dirty, query state | editable document toolbar | supporting material/repository state | CORRECT as secondary control state | 07–11 |
| INFO-DOC-007 | source/lifecycle docs | Git blocker notices | `WorkItemDocumentationGitStatus.blockers[]` -> `gitBlockerText` | blockers non-empty | current attention for Git save only | CORRECT near Git action | document family |
| INFO-DOC-008 | SURF-MAT-SOURCE-001 | SHA-256, selected path, working-tree state, WorkItem directory, branch, HEAD, complete portable source | `WorkItemSourceSnapshot.sha256/path/markdown`; `WorkItemDocumentationGitStatus` | Technical details disclosure opened | technical | CORRECT: exact technical identity is disclosure-only | 07, 42, 43 |
| INFO-DOC-009 | SURF-MAT-DOC-001 / RO | lifecycle document Markdown | `ArtifactRef.id/role/sha256/repositoryPath` + bytes from `GET /api/artifacts/:id/content`, decoded under `MarkdownTextSchema` | selected current artifact + canonical Markdown bytes | primary work/supporting doc depending selection; ArtifactRef canonical identity | CORRECT | 08–13 |
| INFO-DOC-010 | SURF-MAT-DOC-001 | lifecycle document description displays `ArtifactRef.repositoryPath` when editable | selected artifact and editable | technical path presented persistently in primary document heading | **MISPLACED / TECHNICAL LEAK** against Workbench requirement that raw paths are technical/on-demand | 08–11 |
| INFO-DOC-011 | SURF-MAT-DOC-001 | non-canonical Markdown warning + “Inspect exact bytes” | decode failure under `MarkdownTextSchema` | artifact bytes not canonical editable Markdown | current attention/material compatibility | CORRECT | evidence path family |
| INFO-DOC-012 | document materials | exact Git/path/branch/HEAD metadata | `ArtifactRef.repositoryPath/sha256`, Git status | Technical details disclosure opened | technical | CORRECT on demand | 08–11 |

### 12.5 R1/R2/DESIGN/PLAN activity, conversation, proposal and supporting context

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-PRE-001 | SURF-STEP-R1/2/DESIGN/PLAN-001 | Activity attempt labels, timestamps, statuses | stage-filtered `Run.attempt/startedAt/status`; status via `runStatusLabel` | stage has Runs | supporting history/current activity selector | CORRECT compact selector | 14–18 |
| INFO-PRE-002 | same | governed document label | stage `ArtifactRef.role` | current stage artifact exists | primary/supporting material selector | CORRECT | 08–11 |
| INFO-PRE-003 | same | Supporting Work request “Canonical source context” | static label + source material availability | pre-signoff stage | supporting context | CORRECT as secondary selector | 08–11 |
| INFO-PRE-004 | same | supporting upstream document label **and repository path** | upstream `ArtifactRef.role/repositoryPath` | stage-specific supporting artifact exists | supporting context plus technical path | **PARTIALLY MISPLACED**: document availability is correct; persistent raw repository path is technical leakage into the step index | 08–11 |
| INFO-ACT-001 | SURF-MAT-ACTIVITY-001 | stage + agent-role heading | selected `Run.stage/role` -> workflow/run-role labels | selected Run | conversation/agent activity orientation | CORRECT | 14, 17, 18 |
| INFO-ACT-002 | SURF-MAT-ACTIVITY-001 | Attempt N + started timestamp | `Run.attempt/startedAt` | selected Run | supporting history | CORRECT | 14 |
| INFO-ACT-003 | SURF-MAT-ACTIVITY-001 | human-readable Run status | `Run.status -> runStatusLabel` | selected Run | workflow/agent activity state | CORRECT | 14, 17, 18 |
| INFO-ACT-004 | SURF-MAT-ACTIVITY-001 | Run id, stage, role, raw status, baseline commit, context hash, provider session id, terminal classification | exact `Run` fields | Technical details disclosure opened | technical/debug | CORRECT on demand | activity family |
| INFO-ACT-005 | SURF-MAT-ACTIVITY-001 | derived provider/session status (“Starting…”, “processing…”, “failed/completed…”) | `Run.status/providerSessionId` -> `openCodeSessionStatus` | Technical details disclosure opened | technical provider state | CORRECT under current authority: provider plumbing stays technical unless failure owns current blocker; P1-T07 must assess future transparency needs | activity family |
| INFO-ACT-006 | SURF-MAT-ACTIVITY-001 | product-facing timeline label/detail/time | `RunEvent.event` -> exhaustive `runEventPresentation`; `occurredAt` | events loaded | conversation/agent activity/current feedback; persisted canonical RunEvent | CORRECT separation from raw event payload | 14, 17, 18, 24, 25 |
| INFO-ACT-007 | SURF-MAT-ACTIVITY-001 | proposal disposition suffix | `ARTIFACT_PROPOSAL_CREATED` + later disposition event -> `proposalDispositionFor` | proposal timeline event | proposal state | CORRECT | 15, 16 |
| INFO-ACT-008 | SURF-MAT-ACTIVITY-001 | evidence resource paths | event `EvidenceRef.relativePath` via `eventEvidence` | event has evidence | evidence/supporting technical identity | ACCEPTABLE as resource identity; exact file path is intrinsic to evidence selection, but remains subordinate to timeline | 26 |
| INFO-ACT-009 | SURF-MAT-ACTIVITY-001 | raw event tag, sequence, JSON payload | `RunEvent.event.tag/sequence/event` | “Timeline technical details” disclosure opened | debug diagnostic | CORRECT on demand | activity family |
| INFO-ACT-010 | SURF-MAT-ACTIVITY-001 | “Your input is needed” + exact question, or “Continue current work” guidance | unresolved `HUMAN_INPUT_REQUESTED` event and `StageRunInteraction`; otherwise OPEN interaction | composer admitted by current attention + interaction | **current attention/action** | CORRECT; user question/continuation is visibly coupled to current conversation | 14 |
| INFO-ACT-011 | SURF-MAT-ACTIVITY-001 | timeline loading/error/empty-processing text | event query state + selected Run active/terminal | corresponding query/event branch | current activity state | CORRECT | composition family |
| INFO-PROP-001 | SURF-MAT-PROPOSAL-001 | currentness: Pending review / Adoption in progress / Adopted / Rejected | RunEvent proposal/disposition/adoption-requested events | proposal exists | proposal/review state | CORRECT | 15, 16 |
| INFO-PROP-002 | SURF-MAT-PROPOSAL-001 | target path + rationale | `ARTIFACT_PROPOSAL_CREATED.targetPath/rationale` | proposal exists | proposal identity/meaning; target path exact identity | CORRECT for review, although path is technical-looking it is the actual mutation target and therefore materially relevant here | 15 |
| INFO-PROP-003 | SURF-MAT-PROPOSAL-001 | unified diff | `ARTIFACT_PROPOSAL_CREATED.unifiedDiff` | proposal exists | **primary review work** | CORRECT | 15, 16 |
| INFO-PROP-004 | SURF-MAT-PROPOSAL-001 | adoption-in-progress / decision error | adoption-requested event / mutation error | corresponding condition | current attention | CORRECT | 16 |

### 12.6 Readiness review

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-R3-001 | SURF-STEP-R3-001 | “Governed review current” vs “Review in progress” | presence of R3 `ArtifactRef` | R3 surface | material currentness | CORRECT | 12 |
| INFO-R3-002 | SURF-STEP-R3-001 | review purpose | static governed copy | R3 surface | primary orientation | CORRECT | 12 |
| INFO-R3-003 | SURF-STEP-R3-001 | Readiness review selector and status | R3 `ArtifactRef` presence | R3 surface | primary review selector | CORRECT | 12 |
| INFO-R3-004 | SURF-STEP-R3-001 | attempt label/time/status | R3 stage `Run.attempt/startedAt/status` | R3 Runs exist | supporting history/activity | CORRECT | 12 |
| INFO-R3-005 | SURF-STEP-R3-001 | package document labels **and repository paths** | R1/R2/DESIGN/PLAN `ArtifactRef.role/repositoryPath` | package artifacts exist | supporting package context + technical path | **PARTIALLY MISPLACED**: package document access is correct; persistent raw path is technical leakage | 12 |
| INFO-R3-006 | SURF-STEP-R3-001 | governed R3 Markdown or “in progress” state | R3 ArtifactRef + content bytes; fallback absence | readiness artifact present/absent | primary review work | CORRECT | 12 |

### 12.7 Approval

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-APR-001 | SURF-STEP-APPROVAL-001 | currentness status: Awaiting authorization / Approved package history / Returned before sign-off | `WorkItem.stage`, historical `ExecutionTask[]` presence | Approval view | primary review currentness | CORRECT | 13, 21 |
| INFO-APR-002 | SURF-STEP-APPROVAL-001 | Approval purpose and current/historical package framing | `currentApproval = stage===AWAITING_SIGNOFF`, historical task count | Approval view | primary orientation | CORRECT | 13, 21 |
| INFO-APR-003 | SURF-STEP-APPROVAL-001 | governed-document selector labels **and repository paths** | package `ArtifactRef.role/repositoryPath` | package artifacts exist | supporting package context + technical path | **PARTIALLY MISPLACED**: raw repository path should be on demand, not persistent selector copy | 13 |
| INFO-APR-004 | SURF-STEP-APPROVAL-001 | signed-task selector id + objective | `SignoffPackage.taskBlock.tasks[].id/objective` or historical `ExecutionTask.planTaskId/objective` | tasks exist | primary review/task meaning | CORRECT | 22 |
| INFO-APR-005 | SURF-STEP-APPROVAL-001 | package task count/current state | `SignoffPackage.taskBlock.tasks.length` | current package overview | primary review summary | CORRECT | 21 |
| INFO-APR-006 | SURF-STEP-APPROVAL-001 | **Package hash, source SHA, baseline commit** under “Technical identity” in primary overview | `SignoffPackage.packageHash/sourceSha256/baselineCommit` | current package overview | technical exact identity | **MISPLACED / CANONICAL UX VIOLATION**: `GW-DOC-WORKBENCH-UX-V2` requires package hashes/commit identity collapsed/on-demand secondary and forbids displacement of package currentness/task meaning/sign-off | 13, 21 |
| INFO-APR-007 | SURF-MAT-APPROVAL-TASK-001 | task id/objective | `SignedTaskDefinition.id/objective` or historical `ExecutionTask.planTaskId/objective` | selected task | primary review work | CORRECT | 22 |
| INFO-APR-008 | SURF-MAT-APPROVAL-TASK-001 | dependencies, gates, concerns, acceptance refs | task fields `dependsOn/gateIds/concernIds/acceptanceRefs` | selected task | task meaning/supporting authority | CORRECT; gates/acceptance are specifically material to approval | 22 |
| INFO-APR-009 | SURF-MAT-APPROVAL-TASK-001 | scope, exclusions, change surface, authority refs | task fields | selected task | primary/supporting review material | CORRECT in task detail; dense but semantically relevant | 22 |
| INFO-APR-010 | historical approval task | approval id + execution state | `ExecutionTask.approvalId/state` | historical selected task | technical/history + workflow state | **MIXED**: execution state is useful history; exact Approval id is technical identity and should be on demand | historical Approval composition |
| INFO-APR-011 | SURF-STEP-APPROVAL-001 | “Approved by” input + sign-off failure | local `approvedBy`; signoff mutation error | current package available and fetch/error clear | current action | CORRECT | 21 |
| INFO-APR-012 | SURF-STEP-APPROVAL-001 | loading/package-currentness error/no-current-package states | artifacts/signoff/tasks query state | branch-specific | current attention | CORRECT | Approval state family |

### 12.8 Implementation

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-EXEC-001 | SURF-STEP-EXEC-001 | approved task list: plan task id, objective, state | `ExecutionTask.planTaskId/objective/state` | tasks exist | primary operational master | CORRECT | 23–25 |
| INFO-EXEC-002 | SURF-STEP-EXEC-001 | attempt list: role, attempt, startedAt, status | task-filtered `Run.role/attempt/startedAt/status` | selected task has Runs | supporting history/current owner | CORRECT | 24, 25 |
| INFO-EXEC-003 | SURF-MAT-EXEC-TASK-001 | selected task id/objective/state | `ExecutionTask.planTaskId/objective/state` | selected task | primary work | CORRECT | 23–25 |
| INFO-EXEC-004 | SURF-MAT-EXEC-TASK-001 | gates, scope, change surface, dependencies | `ExecutionTask.gateIds/scope/changeSurface/dependsOn` | selected task | primary/supporting implementation contract | CORRECT | 23–25 |
| INFO-EXEC-005 | SURF-MAT-EXEC-TASK-001 | selected attempt role/attempt/status | selected `Run.role/attempt/status` | selected Run | workflow/agent activity state | CORRECT | 24, 25 |
| INFO-EXEC-006 | SURF-MAT-EXEC-TASK-001 | task id, approval id, Run id, baseline, context hash, provider session, terminal classification | exact `ExecutionTask.id/approvalId`, `Run.id/baselineCommit/contextHash/providerSessionId/terminalClassification` | Technical details disclosure opened | technical/debug | CORRECT on demand | 24, 25 |
| INFO-EXEC-007 | SURF-MAT-EXEC-TASK-001 | current validation boundary | derived `ValidationBoundary` from canonical RunEvents | selected task | primary current verification state | CORRECT | 24, 25 |
| INFO-EXEC-008 | SURF-MAT-EXEC-TASK-001 | recorded validation stages/results; complete V0–V7 matrix on disclosure | `VALIDATION_PASSED/FAILED` RunEvents; pure `latestValidationEvent` | selected Run/events | verification state/history | CORRECT: unreached matrix stays disclosed rather than filling primary surface | 24, 25 |
| INFO-EXEC-009 | SURF-MAT-EXEC-TASK-001 | implementation timeline | RunEvents -> `runEventPresentation` | events loaded | agent activity/history | CORRECT | 24, 25 |
| INFO-EXEC-010 | SURF-MAT-EXEC-TASK-001 | implementation material role + repository path | `ArtifactRef.role/repositoryPath` | artifacts exist | evidence/resource context | **MIXED**: resource identity is useful, but persistent exact path is technical; acceptable only as subordinate resource label, not primary status | 23–25 |
| INFO-EXEC-011 | SURF-STEP-EXEC-001 | blocker / mutation failure / next owner status | derived `ExecutionOwner`, `WorkItem.status`, mutation errors | blocked/failure/current-owner condition | current attention/action | CORRECT | 23, 24 |
| INFO-EXEC-012 | SURF-STEP-EXEC-001 | loading/error/no-work/no-task/no-attempt states | query state + empty arrays | branch-specific | current attention/empty state | CORRECT | implementation composition family |

### 12.9 Complete / terminal result and evidence

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-TERM-001 | SURF-STEP-COMPLETE-001 | terminal outcome label/explanation | `WorkItem.outcome` -> terminal presentation | Complete | primary final result | CORRECT | 27, 28 |
| INFO-TERM-002 | SURF-STEP-COMPLETE-001 | “Verified candidate” vs “Terminal outcome” status | `outcome === CANDIDATE_DONE` | Complete | workflow result state | CORRECT | 27, 28 |
| INFO-TERM-003 | SURF-STEP-COMPLETE-001 | candidate evidence resources | candidate Runs + RunEvents -> `eventEvidence`; unique by run/path | CANDIDATE_DONE | evidence | CORRECT | 28 |
| INFO-TERM-004 | SURF-STEP-COMPLETE-001 | governed audit/investigation result artifact(s) | terminal evidence-backed outcome + `ArtifactRef[]` + artifact bytes | INVESTIGATION_COMPLETE/AUDIT_COMPLETE | **primary final result** | CORRECT | 27 |
| INFO-TERM-005 | SURF-STEP-COMPLETE-001 | candidate/result loading/error/empty states | query state | corresponding branch | current result state | CORRECT | 27, 28 composition family |
| INFO-EVID-001 | SURF-MAT-EVIDENCE-001 | evidence/artifact label or relative path | `EvidenceSelection.label/relativePath` | selection exists | evidence identity | CORRECT | 26 |
| INFO-EVID-002 | SURF-MAT-EVIDENCE-001 | exact read-only bytes/text | artifact content or `readEvidence(runId,relativePath)`; UTF-8 decode else bounded binary hex preview | query success | **primary evidence work** | CORRECT | 26 |
| INFO-EVID-003 | SURF-MAT-EVIDENCE-001 | loading/read error | query state | corresponding branch | current attention | CORRECT | evidence family |

### 12.10 Confirmations and bounded nested tasks

| INFO | SURF | Presented information | Typed source / derivation | Show/suppress predicate | Class / authority | Current placement verdict | Rendered evidence |
|---|---|---|---|---|---|---|---|
| INFO-CONF-001 | SURF-CONF-DIRTY-DEST-001 | unsaved-change warning + requested destination consequence | local `workspaceDirty/pendingDestination` | dirty + application navigation attempted | safety/current attention | CORRECT | 40 |
| INFO-CONF-002 | SURF-CONF-DIRTY-MATERIAL-001 | unsaved Markdown warning before step/material change | local `dirty/pendingSelection` | dirty + workspace selection attempted | safety/current attention | CORRECT | 29 |
| INFO-CONF-003 | SURF-CONF-ARCHIVE-001 | archive/restore consequence | `WorkItem.archived/title` + local confirmation | archive action requested | safety/current action | CORRECT | 39 |
| INFO-CONF-004 | SURF-CONF-DOC-GIT-001 | exact governed paths to be committed | changed `WorkItemDocumentationGitStatus.paths[].repositoryPath` | Git-save confirmation open | safety/technical scope necessary to irreversible-ish repository action | CORRECT | 41 |
| INFO-CONF-005 | SURF-CONF-REPO-DISCONNECT-001 | exact repository root + preservation statement | selected repository root | disconnect requested | safety/configuration | CORRECT | 33 |
| INFO-CONF-006 | SURF-CONF-OC-REMOVE-001 | account label + credential-removal consequence | selected `OpenCodeAccount.label` | remove requested | safety/configuration | CORRECT | 36 |

### 12.11 P1-T04 source-lineage and hierarchy findings

The following findings are factual current-state presentation mismatches established by source + rendered evidence. They are not replacement-design decisions.

| Finding | Evidence | Current authority comparison | Verdict |
|---|---|---|---|
| INFO-F01 | `LifecycleDocumentMaterial` uses `ArtifactRef.repositoryPath` as the persistent document description | Workbench §12.3 defines raw paths as Technical and §14 requires technical identity on demand | **INCOMPLETE / MISPLACED** |
| INFO-F02 | pre-signoff, R3 and Approval material selectors persist `ArtifactRef.repositoryPath` under ordinary document labels | supporting documents are secondary, but raw path identity is Technical | **INCOMPLETE / TECHNICAL LEAK** |
| INFO-F03 | Approval primary overview renders package hash, source SHA and baseline commit directly under “Technical identity” | Workbench §14.7 explicitly requires technical package hashes/commit identity collapsed/on-demand and not displacing package currentness/task meaning/sign-off | **CONTRADICTORY IMPLEMENTATION** |
| INFO-F04 | historical Approval task detail renders exact `approvalId` in ordinary task metadata | exact IDs are Technical under Workbench §12.3 | **INCOMPLETE / TECHNICAL LEAK** |
| INFO-F05 | exact Run/provider/context/baseline identities are disclosure-only in Activity/Implementation and exact document/hash identity is in Context/technical disclosure | matches current Technical/on-demand requirements | **CORRECT** |
| INFO-F06 | product-facing agent messages, questions, blockers, validation/review failures and proposal events come from typed persisted `RunEvent` payloads through exhaustive presentation functions, while raw event JSON is separately disclosed | matches product-facing operational state vs debug-detail separation | **CORRECT** |
| INFO-F07 | OpenCode session identity/status is currently present only in Activity technical disclosure unless a provider failure is represented through product-facing RunEvent/current blocker | matches current P3 rule; Phase 1 P1-T07 must determine whether current authority itself is sufficient for 0.5.0 transparency needs | **CORRECT AGAINST CURRENT AUTHORITY; PRODUCT QUESTION REMAINS** |
| INFO-F08 | Settings legitimately exposes exact repository/reference/model/account identifiers because those values are the configuration being edited | Workbench technical-detail restriction applies to ordinary operation; exact configuration identity is necessary in configuration surfaces | **CORRECT** |

### 12.12 P1-T04 completion verdict

**P1-T04: COMPLETE for current production information lineage.**

Completion basis:

- every registered productive `SURF-` family has its materially distinct persistent information regions classified above;
- every dynamic region is traced to canonical typed fields, local presentation state, query state, or a named pure derivation;
- conditional presentation/suppression is recorded at the semantic branch level;
- technical/debug information is distinguished from product-facing workflow/agent information;
- source-backed placement is compared against current `GW-DOC-WORKBENCH-UX-V2` authority;
- rendered evidence from P1-T03 is cross-referenced;
- the concrete leakage/misplacement findings are recorded without selecting a replacement design.

P1-T05 must now assign exact `ACT-`/`FLOW-` ids to the interactions consuming these `INFO-` facts and prove visibility, enablement, command path, commit-time recheck, canonical effect and destination.

## 13. Per-surface interaction inventory

**Pending P1-T05.**

## 14. Global/business-rule interaction matrix

**Pending P1-T05.**

## 15. Cross-surface normal flows

**Pending P1-T05.**

## 16. Cross-surface exceptional/recovery flows

**Pending P1-T05.**

## 17. Overlay interaction graph

| Origin | Trigger | Overlay / nested task | Close/result |
|---|---|---|---|
| `SURF-APP-001` / queue / WorkItem toolbar | New work item / linked remediation | `SURF-CREATE-001` | close resets local creation state; success creates/selects through App mutation path |
| any dirty WorkItem destination | navigate queue/Settings/other WorkItem | `SURF-CONF-DIRTY-DEST-001` | cancel remains editing; confirm commits requested destination |
| `SURF-WI-001` | workflow/material selection while dirty | `SURF-CONF-DIRTY-MATERIAL-001` | cancel remains; confirm clears dirty state and commits selection |
| `SURF-WI-001` | archive/restore command | `SURF-CONF-ARCHIVE-001` | cancel remains; confirm executes archive mutation |
| source/lifecycle document | explicit Git documentation save | `SURF-CONF-DOC-GIT-001` | cancel remains; confirm commits exact governed paths |
| `SURF-SET-REPO-001` | add repository | `SURF-SET-REPO-ADD-001` nested bounded form | cancel closes; connect mutation refreshes Settings |
| `SURF-SET-REPO-001` | move document root | `SURF-SET-REPO-MOVE-001` nested bounded form | cancel/complete returns to repository state |
| `SURF-SET-REPO-001` | disconnect | `SURF-CONF-REPO-DISCONNECT-001` | cancel/confirm |
| `SURF-SET-OC-001` | rename | `SURF-SET-OC-RENAME-001` nested form | cancel/save |
| `SURF-SET-OC-001` | add account | `SURF-SET-OC-ADD-001` -> `SURF-SET-OC-LOGIN-001` | cancel; terminal login Done returns to account surface |
| `SURF-SET-OC-001` | remove | `SURF-CONF-OC-REMOVE-001` | cancel/confirm |
| R1/R2/DESIGN/PLAN activity timeline | proposal event | `SURF-MAT-PROPOSAL-001` | Back returns to owning attempt; adopt/reject refreshes and returns |
| workflow event/resource/task | evidence link | `SURF-MAT-EVIDENCE-001` | Back returns to recorded transient-origin selection |
| `SURF-WI-001` | Context | `SURF-WI-CONTEXT-001` | explicit close; wide panel vs Drawer representation |

P1-T05 will add exact `ACT-` ids, predicates, mutation effects and focus behavior to this graph.

## 18. Duplication/leakage inventory

| Finding | Affected INFO | Current mechanism | P1-T04 verdict |
|---|---|---|---|
| Primary Approval exposes exact package/source hash and baseline commit | `INFO-APPROVAL-003..005` | `SignoffPackage` exact identity rendered directly in overview MetadataList | technical leakage into premium review space |
| Governed document exact paths persist beside primary document headings | `INFO-DOC-003,010` | source/artifact repository path rendered as document description | technical leakage / misplaced metadata |
| Proposal summary exposes exact target path | `INFO-PROP-002` | proposal `targetPath` rendered immediately under review title | technical/supporting identity promoted too high |
| Implementation material exposes artifact paths | `INFO-EXEC-009` | resource row detail/action label use `repositoryPath` | mixed useful locator + technical noise |
| Required-input question duplicated | `INFO-ACT-012` | same event question rendered in timeline and composer | duplicate current-action information |
| Lifecycle/status repeated in identity row, rail and step summary | `INFO-WI-002,004,006,007` | separate projections of same WorkItem/reached/current-attention facts | semantic duplication; Phase 2A must define one hierarchy |
| Queue repeats WorkItem IDs as per-row copy utility | `INFO-Q-007` | icon-only action on every row | technical utility noise in operational scan |
| Raw source diagnostic code/path/detail promoted into queue blocker | `INFO-APP-006` | diagnostic object rendered almost verbatim | product blocker + technical diagnostic conflated |
| Historical Approval exposes raw Approval id | `INFO-APPROVAL-009` | ExecutionTask.approvalId in normal metadata list | technical leakage |
| Run/task exact technical identities | `INFO-ACT-004,010,INFO-EXEC-005` | contained in explicit disclosures | correctly secondary/on-demand |

### 18.1 P1-T04 completion verdict

**P1-T04: COMPLETE.**

Every persistent information class in the registered surfaces has a typed lineage to canonical data, a pure derivation, or explicitly browser-local presentation state. Conditional display ownership is identified at surface/region level, and every current leakage/duplication class discovered from source plus rendered evidence is recorded above.

P1-T05 may now trace every control from these information prerequisites through visibility/enabled predicates and downstream effects.

## 19. Cross-artifact closure ledger

At P1-T02 completion every surface has a source owner and scenario contract. Later columns are intentionally open.

| SURF family | Source | Scenario contract | Rendered evidence | INFO | ACT/FLOW | STATE/OC/MAT/CERT | Status |
|---|---|---|---|---|---|---|---|
| application shell/queue/create | §§8.1 | §10 | P1-T03 | **COMPLETE §12.1** | P1-T05 | later | OPEN |
| Settings + nested account/repository tasks | §§8.1 | §10 | P1-T03 | **COMPLETE §12.2** | P1-T05 | OC/MAT/CERT later | OPEN |
| WorkItem shell/Context | §8.2 | §10 | P1-T03 | **COMPLETE §12.3** | P1-T05 | STATE/MAT/CERT later | OPEN |
| Work request | §§8.2–8.3 | §10 | P1-T03 | **COMPLETE §12.4** | P1-T05 | STATE/MAT/CERT later | OPEN |
| R1/R2/DESIGN/PLAN | §§8.2–8.3 | §10 | P1-T03 | **COMPLETE §12.5** | P1-T05 | STATE/OC/MAT/CERT later | OPEN |
| R3 | §§8.2–8.3 | §10 | P1-T03 | **COMPLETE §12.6** | P1-T05 | STATE/OC/MAT/CERT later | OPEN |
| Approval | §§8.2–8.3 | §10 | P1-T03 | **COMPLETE §12.7** | P1-T05 | STATE/MAT/CERT later | OPEN |
| Implementation | §§8.2–8.3 | §10 | P1-T03 | **COMPLETE §12.8** | P1-T05 | STATE/OC/MAT/CERT later | OPEN |
| Complete | §§8.2–8.3 | §10 | P1-T03 | **COMPLETE §12.9** | P1-T05 | STATE/MAT/CERT later | OPEN |
| shared activity/proposal/evidence/doc materials | §8.3 | §10 | P1-T03 | **COMPLETE §§12.4–12.9** | P1-T05 | all applicable later | OPEN |
| confirmations/safety overlays | §8.4 | §10 | P1-T03 | **COMPLETE §12.10** | P1-T05 | STATE/MAT/CERT as applicable | OPEN |

### 19.1 P1-T02 completion verdict

**P1-T02: COMPLETE.**

The current renderer graph has been classified into application, workflow-step, reusable-material, nested-task and safety/confirmation surfaces. Every registered surface has an owning renderer and a minimum scenario contract. The registry explicitly includes responsive Context representations and all confirmation/task overlays discovered from the production composition.

P1-T03 may now capture rendered evidence against §10. P1-T04 must not start final INFO closure until the relevant rendered evidence exists.

## 20. Current-state gaps requiring derived audit

P1-T04 establishes the first evidence-backed gaps:

1. **INFO-F01/F02 — persistent raw repository-path leakage** across lifecycle-document headings and document/package selectors.
2. **INFO-F03 — Approval technical identity is in primary content**, contradicting the current Approval screen contract.
3. **INFO-F04 — historical Approval exposes exact Approval id in ordinary task metadata.**
4. **INFO-F07 — current OpenCode visibility conforms to current authority but may be insufficient for the 0.5.0 product goal; this is explicitly deferred to P1-T07 rather than inferred here.**

P1-T05 must determine whether the interaction availability and destinations surrounding these information regions are also incorrect. P1-T06/P1-T08 must determine whether any presentation mismatch originates in deeper state/material semantics rather than UI composition alone.
