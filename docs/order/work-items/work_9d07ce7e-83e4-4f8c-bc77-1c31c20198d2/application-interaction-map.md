# Phase 1 application interaction map

**Status:** P1-T01 baseline complete; P1-T02+ pending  
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

**Pending P1-T02 expansion.** The P1-T01 root topology in §2 is the input.

## 8. Surface registry

**Pending P1-T02.**

## 9. Per-surface typed data/model/schema input map

**Pending P1-T04.**

## 10. Per-surface conditional-render/state-scenario matrix

**Pending P1-T02.**

## 11. Rendered evidence manifest

**Pending P1-T03.**

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

**Pending P1-T02/P1-T05.**

## 18. Duplication/leakage inventory

**Pending P1-T04.**

## 19. Cross-artifact closure ledger

**Pending P1-T02 skeleton; completed by P1-T09.**

## 20. Current-state gaps requiring derived audit

**Pending findings from P1-T04 onward.**
