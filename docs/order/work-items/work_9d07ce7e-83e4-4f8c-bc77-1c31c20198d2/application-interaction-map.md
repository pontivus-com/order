# Phase 1 application interaction map

**Status:** P1-T01 and P1-T02 complete; P1-T03+ pending  
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

**Pending P1-T04.** P1-T02 records renderer ownership only; exact field lineage is deliberately deferred to P1-T04.

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
- `CurrentAttentionTag`: the ten tags enumerated in the WorkItem-shell row above;
- workflow reach: current / reached-historical / unreached.

Impossible combinations are resolved by the canonical core rules in P1-T06; P1-T03 should not fabricate fixtures for states the core rejects.

## 11. Rendered evidence manifest

**Pending P1-T03.** The scenario matrix in §10 is the capture contract.

## 12. Per-surface information inventory

**Pending P1-T04.**

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

**Pending P1-T04.**

## 19. Cross-artifact closure ledger

At P1-T02 completion every surface has a source owner and scenario contract. Later columns are intentionally open.

| SURF family | Source | Scenario contract | Rendered evidence | INFO | ACT/FLOW | STATE/OC/MAT/CERT | Status |
|---|---|---|---|---|---|---|---|
| application shell/queue/create | §§8.1 | §10 | P1-T03 | P1-T04 | P1-T05 | later | OPEN |
| Settings + nested account/repository tasks | §§8.1 | §10 | P1-T03 | P1-T04 | P1-T05 | OC/MAT/CERT later | OPEN |
| WorkItem shell/Context | §8.2 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/MAT/CERT later | OPEN |
| Work request | §§8.2–8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/MAT/CERT later | OPEN |
| R1/R2/DESIGN/PLAN | §§8.2–8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/OC/MAT/CERT later | OPEN |
| R3 | §§8.2–8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/OC/MAT/CERT later | OPEN |
| Approval | §§8.2–8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/MAT/CERT later | OPEN |
| Implementation | §§8.2–8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/OC/MAT/CERT later | OPEN |
| Complete | §§8.2–8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/MAT/CERT later | OPEN |
| shared activity/proposal/evidence/doc materials | §8.3 | §10 | P1-T03 | P1-T04 | P1-T05 | all applicable later | OPEN |
| confirmations/safety overlays | §8.4 | §10 | P1-T03 | P1-T04 | P1-T05 | STATE/MAT/CERT as applicable | OPEN |

### 19.1 P1-T02 completion verdict

**P1-T02: COMPLETE.**

The current renderer graph has been classified into application, workflow-step, reusable-material, nested-task and safety/confirmation surfaces. Every registered surface has an owning renderer and a minimum scenario contract. The registry explicitly includes responsive Context representations and all confirmation/task overlays discovered from the production composition.

P1-T03 may now capture rendered evidence against §10. P1-T04 must not start final INFO closure until the relevant rendered evidence exists.

## 20. Current-state gaps requiring derived audit

**Pending findings from P1-T04 onward.** P1-T02 records existence/coverage only and deliberately does not yet judge presentation quality or state correctness.
