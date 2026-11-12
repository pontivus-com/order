# 43 — Repository-native workbench, execution visibility and OpenCode account implementation plan

**Status:** Implementation-ready P7 plan  
**Target repository:** `pontivus-com/order`  
**Pyramid layer:** P7 implementation plan  
**Prepared:** 2026-11-13  
**Purpose:** implement the now-closed P3/P4/P6 design for repository-native WorkItems and Git persistence, human-facing workflow/Activity, WorkItem management, typed failures/provider diagnostics, and global saved OpenCode account switching.

This plan is execution authority only. It does not redefine the functional/technical contracts it cites.

## 1. Governing authority

Implementation must conform to the current canonical owners, including:

- `GW-DOC-WORK-LIFECYCLE-V1`;
- `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, including `GW-FR-060..061`, `GW-FR-070`, `GW-FR-077..078`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`, including `GW-FR-062..063`, `GW-FR-065..069`, `GW-FR-071..072`;
- `GW-DOC-WORKBENCH-UX-V1`, including `GW-FR-051..059`, `GW-FR-064`, `GW-FR-073..076`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`, including `GW-TR-027..035`, `GW-TR-039..044`, `GW-TR-053`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`, including `GW-TR-036..038`, `GW-TR-045..052`, `GW-TR-054..056`;
- `GW-DOC-CANONICAL-CONTRACTS-V1 §§32–34`;
- `GW-DOC-OPENCODE-INTEGRATION-V1 §12`;
- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`;
- D18 and D19;
- `GW-P1-FCIS`, `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW`, `GW-P1-MINIMUM-CHANGE`.

There are **no remaining documentation/design prerequisites** for this package. If implementation encounters a contradiction in these current authorities, it stops and returns to the defective layer rather than inventing a local interpretation.

## 2. Required end state

The implementation is complete only when all of the following are simultaneously true:

1. every new WorkItem and ordinary lifecycle Markdown file lives at its deterministic path inside the selected project repository;
2. productive configuration/database behavior is v3; the external global `workItemRoot` is migration input only and never a productive source owner;
3. a fresh installation rediscovers Work requests plus deterministic lifecycle Markdown as drafts without fabricating Runs/conformance/Approval/history;
4. the Documents surface distinguishes editor-dirty, repository-working-tree and Git-persisted state;
5. **Save documentation to Git** creates an exact path-scoped commit, including archive-marker add/deletion where applicable, without absorbing unrelated repository state;
6. repository-local Git identity, attached-branch state and in-progress Git-operation blockers are enforced before commit;
7. title editing mutates only the canonical source H1;
8. remove/restore is portable archive/restore using the deterministic `.order-archived` marker, never deletion or a DB-only hide flag;
9. the browser presents Work request → Research → Requirements → Solution design → Implementation plan → Readiness review → Approval → Implementation → Complete instead of requiring backend lifecycle codes;
10. all current and terminal Runs remain inspectable in one Activity workspace, including failures and recovery;
11. material RunEvents and provider diagnostic evidence are inspectable without developer tooling;
12. source/current-state failures preserve typed 400/404/409/500 semantics and source diagnostics;
13. the already-implemented CodeMirror exact-source editor remains the Markdown editing surface and retains its current formatting/preview/state-continuity contracts;
14. the application shell shows the active saved OpenCode login account;
15. multiple OpenCode login accounts can remain saved and be switched A → B → A without changing `OrderConfig.model`;
16. Add OpenCode account runs the pinned OpenCode Console device/OAuth flow through Order without exposing credential secrets/private OpenCode listener state;
17. Add/Switch/Rename account mutations cannot overlap any RUNNING/WAITING_FOR_INPUT Order Run.

## 3. Preservation/non-regression constraints

Implementation must **not**:

- reintroduce an installation-global productive WorkItem source path;
- create DTO/domain/view-model duplicates of canonical schemas;
- add a second repository/document/Run/account state store;
- replace CodeMirror with a textarea, rich-text editor or another Markdown model;
- make account switching a provider/model selector;
- read OpenCode's secret-bearing `credential.list` endpoint for browser account presentation;
- capture hidden model reasoning/chain-of-thought;
- create a generic observability/logging platform;
- use `git add -A`, `git add .`, `git commit -a`, unrestricted commit, `--no-verify`, stash, checkout, push, pull, fetch, merge or rebase for documentation persistence;
- delete WorkItem documentation/history as the meaning of Remove;
- let browser-local state promote lifecycle stages or decide canonical eligibility.

## 4. Ordered implementation sequence

### P7-T01 — Repository-native v3 source/config/database cutover

Implement the productive v3 storage boundary first.

Required changes:

- remove productive `workItemRoot` from config/runtime;
- add/consume project `[workItems].root` with canonical default `docs/order/work-items`;
- implement deterministic WorkItem/source/lifecycle path calculation in the core;
- make source creation/discovery/revalidation operate only inside exact configured target repositories;
- implement deterministic lifecycle-draft rediscovery into ArtifactRefs without fabricated lifecycle/conformance history;
- implement SQLite v3 source-path semantics;
- implement installer-owned v2→v3 migration, including active-execution refusal, byte-identical source/current lifecycle materialization and R1 revalidation behavior;
- preserve historical ArtifactRefs/RunEvents/Approvals as specified by P6;
- update guided setup/example config only as required by the v3 contract.

No UI/workflow presentation changes belong in this task.

### P7-T02 — Canonical title/archive management

Implement the now-closed WorkItem management semantics:

- pure canonical H1 rewrite helper;
- expected-hash direct title command;
- deterministic `.order-archived` marker create/read/remove;
- derive/persist `WorkItem.archived` projection;
- default list excludes archived; explicit include-archived query restores discoverability;
- archive/restore eligibility: no active Run, never during Implementation;
- no lifecycle/source/artifact mutation from archive itself.

### P7-T03 — Documentation Git status and exact path-scoped commit

Implement one daemon documentation owner and Git shell effect:

- compute current governed WorkItem path set;
- include Work request, current lifecycle docs and archive marker;
- states: MATCHES_HEAD/MODIFIED/UNTRACKED/DELETED/MISSING/IGNORED/UNMERGED;
- exact expected HEAD + path/hash preconditions;
- repository-local `user.name`/`user.email`;
- attached local `refs/heads/*` requirement;
- reject merge/rebase/cherry-pick/revert/bisect/sequencer state;
- path-scoped dry-run proof;
- intent-to-add only for exact untracked governed files;
- tracked deletion commit for restore marker;
- normal Git hooks remain enabled;
- post-commit blob/hash verification;
- refetch/invalidate Git/document/signoff state after success.

### P7-T04 — Typed API failure boundary

Replace generic API error collapse with the canonical P6 classifier.

Required changes:

- one server/daemon classification boundary for 400/401/403/404/409/500;
- preserve exact `WorkItemSourceDiagnostic` on source 409;
- malformed request remains 400;
- absent canonical entity is 404;
- source/lifecycle/optimistic/current-state conflict is 409;
- unexpected defect is 500 with non-secret public message;
- browser HTTP helper parses one canonical `OrderHttpError` shape;
- primary UI surfaces render known diagnostic/failure detail rather than generic status text.

### P7-T05 — Run-scoped provider diagnostic evidence

Implement diagnostic evidence across **both** pre-signoff STAGE and post-signoff BUILDER/REVIEWER/REMEDIATOR provider turns.

Required changes:

- stop discarding useful OpenCode process stderr;
- build bounded/redacted `ProviderDiagnosticRecord` evidence for every provider turn;
- retain configured provider/model, session id, prompt id, timing/outcome, format-repair status, failure phase and safe exception text;
- retain bounded public provider action/result evidence where useful;
- emit coordinator-owned `PROVIDER_DIAGNOSTICS_RECORDED`;
- attach the same evidence to `PROVIDER_FAILED` when causal;
- known Order secrets must not persist;
- no hidden reasoning capture;
- Activity Technical details/Evidence can retrieve these existing EvidenceRefs.

### P7-T06 — Human workflow projection and Activity workspace

Implement the P3/P4 workflow/UI correction as one cohesive presentation change.

Required changes:

- extend `workbench-presentation.ts` as the single workflow/status/event language owner;
- compact persistent workflow orientation in WorkItem header;
- replace pre-signoff `StageDialogue` ownership with `ActivityWorkspace`;
- Activity lists all Runs for the WorkItem, including terminal Runs;
- one shared RunEvent timeline/presentation owner;
- pending input stays attached to selected Activity;
- proposal review round-trips back to owning Activity;
- terminal failure/block/cancel remains visible;
- symmetric presentation-mode reconciliation after completion/failure/stage advancement;
- post-signoff user label is **Implementation**, canonical backend `EXECUTION` unchanged;
- Technical details exposes raw ids/tags only secondarily;
- existing Implementation task workspace remains task-centric while Activity remains chronological history.

### P7-T07 — Documents/Git/title/archive UI integration with CodeMirror preservation

Integrate the backend capabilities into the existing Documents/queue/workspace UI.

Required changes:

- preserve `MarkdownSourceEditor`/CodeMirror as exact-source editor;
- project-first creation shows resolved repository-local document root;
- Documents state strip shows repository-relative path plus Unsaved / Saved to project, not Git / Saved to Git;
- exact **Save documentation to Git** confirmation/status/failure UI;
- title edit from the WorkItem header uses the daemon title command, not browser Markdown parsing;
- remove/restore from WorkItem management uses archive endpoint;
- queue exposes an explicit Show archived view and restore path;
- archive/Git operations do not compete with lifecycle primary CTA;
- dirty-buffer/focus/history guards remain intact.

### P7-T08 — OpenCode saved-account daemon/shell implementation

Implement the installation-global account boundary without changing provider/model configuration.

Required changes:

- safe account projection from OpenCode `integration.get("opencode")` only;
- never use `credential.list` for the account manager;
- opaque saved credential id + label + active/status projection;
- account-control process uses exact pinned binary/private HOME/XDG/DB/password/version checks;
- Add login fixes integration=`opencode`, method=`device`, no browser-controlled provider/server;
- retain one private control process for one process-local OAuth attempt;
- same-origin HTTPS authorization URL validation;
- start/status/cancel login endpoints;
- activate and rename endpoints;
- unique account labels;
- global mutation guard: zero RUNNING/WAITING_FOR_INPUT Runs and one mutation/login attempt maximum;
- successful Add/Switch proves fresh active account projection;
- `OrderConfig.model` is never mutated.

### P7-T09 — Global OpenCode account UI

Implement one application-shell account control.

Required changes:

- visible from queue and selected WorkItem states;
- compact active label, normally login email label;
- list all saved OAuth accounts;
- Active/Needs authentication state;
- Switch and Rename;
- Add OpenCode account flow with label → external sign-in URL/instructions → polling → terminal state;
- active-Run blocker explains why account mutation is disabled;
- narrow layout moves the control into application utilities without consuming primary WorkItem canvas;
- account state uses TanStack Query only; no new global client store;
- provider/model presentation does not change when account selection changes.

### P7-T10 — Full certification and architecture closure

Add/update permanent tests proving the entire package.

Required proof includes:

- config/database v3 and bounded migration;
- no productive external `workItemRoot`;
- deterministic WorkItem/lifecycle paths and lifecycle-draft rediscovery without fabricated workflow history;
- title edit exact H1-only behavior;
- portable archive marker, active/default/archived queue behavior and Git persistence of marker add/deletion;
- documentation Git path isolation against unrelated staged/unstaged changes;
- detached/in-progress Git operation and missing identity blockers;
- 400/404/409/500 mapping and source diagnostic preservation;
- provider diagnostics for STAGE and post-signoff Runs, bounded/redacted stderr, no secret evidence;
- Activity terminal Run/event visibility and responsive geometry;
- CodeMirror exact-source/formatting/preview/state-continuity regressions remain green;
- OpenCode three-account coexistence, A→B→A switching, Add/Rename, active-Run mutation rejection, no secret-bearing account API use;
- architecture dependency/FCIS/SoC/DRY/strict-typing/no-DTO/no-second-store constraints;
- all configured verification gates pass.

## 5. Exact implementation change map

### T01

Modify:

- `src/installer.ts`
- `src/core/contracts.ts`
- `src/core/work-item-source.ts`
- `src/shell/config.ts`
- `src/shell/setup.ts`
- `src/shell/sqlite.ts`
- `src/shell/work-item-source.ts`
- `src/daemon/runtime.ts`
- `src/daemon/work-item-source.ts`
- `pontivus-order.toml.example`

### T02

Modify:

- `src/core/contracts.ts`
- `src/core/lifecycle.ts`
- `src/core/work-item-source.ts`
- `src/shell/sqlite.ts`
- `src/shell/work-item-source.ts`
- `src/daemon/work-item-source.ts`
- `src/daemon/server.ts`

### T03

Add:

- `src/daemon/work-item-documentation.ts`

Modify:

- `src/core/contracts.ts`
- `src/shell/repository.ts`
- `src/daemon/runtime.ts`
- `src/daemon/server.ts`

### T04

Modify:

- `src/core/contracts.ts`
- `src/daemon/server.ts`
- `src/daemon/work-item-source.ts`
- `ui/src/http.ts`

### T05

Modify:

- `src/core/contracts.ts`
- `src/shell/opencode.ts`
- `src/daemon/run.ts`
- `src/daemon/stage.ts`
- `src/daemon/execution.ts`

### T06

Add:

- `ui/src/ActivityWorkspace.tsx`
- `ui/src/RunEventTimeline.tsx`

Modify/delete as appropriate:

- `ui/src/workbench-presentation.ts`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/StageDialogue.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/query-keys.ts`
- `ui/src/styles.css`
- `ui/src/theme.css`

`StageDialogue.tsx` is deleted once Activity owns its responsibilities; retaining both as competing pre-signoff Run surfaces is prohibited.

### T07

Modify:

- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/MarkdownEditor.tsx`
- `ui/src/MarkdownSourceEditor.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/styles.css`
- `ui/src/theme.css`

CodeMirror implementation is preservation authority: changes here may integrate state/actions only; they must not replace the editor substrate or duplicate Markdown source state.

### T08

Add:

- `src/daemon/opencode-account.ts`

Modify:

- `src/core/contracts.ts`
- `src/shell/opencode.ts`
- `src/daemon/runtime.ts`
- `src/daemon/server.ts`

### T09

Add:

- `ui/src/OpenCodeAccountControl.tsx`

Modify:

- `ui/src/app.tsx`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`

### T10

Modify:

- `tests/architecture.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/e2e-server.ts`
- `tests/shell.test.ts`
- `tests/sqlite.test.ts`
- `tests/order-migration.test.ts`
- `tests/opencode.test.ts`
- `tests/browser.spec.ts`
- `tests/certification.test.ts`
- `tests/markdown-source-formatting.test.ts` only if integration changes require preserving existing formatting assertions.

No dependency change is expected.

## 6. Required deletions/replacements

The implementation must remove obsolete productive behavior rather than preserving compatibility branches:

- productive `workItemRoot` configuration/runtime path;
- global-root-relative WorkItem source semantics;
- movable-source adoption behavior;
- one-way Documents→Dialogue presentation reconciliation;
- pre-signoff Run visibility limited to active STAGE Runs;
- RunEvent allow-list that hides terminal/conformance/provider events;
- top-level API catch that turns unexpected defects into 400;
- stderr drain-to-no-op behavior where diagnostic evidence requires capture;
- any raw `Start R1 run`/R1/R2/R3 primary user terminology replaced by the shared user-facing projection.

No dual v2/v3 productive source path, dual StageDialogue/Activity execution UI or dual OpenCode account store may remain.

## 7. Migration execution order

For an existing installation:

1. quiesce old daemon;
2. preflight complete v2 source/runtime state;
3. refuse migration if any WorkItem is in active execution;
4. resolve each project manifest/document root;
5. preflight all deterministic source/lifecycle destinations;
6. copy source/current lifecycle bytes and verify exact hashes;
7. migrate SQLite source semantics/projections to v3;
8. write config v3 without `workItemRoot`;
9. activate new application;
10. reconcile repository-native WorkItems/lifecycle drafts;
11. require health plus source reconciliation before success;
12. retain old external source root only as non-productive backup.

Do not attempt a live dual-read transition.

## 8. Verification sequence

Implementation completion requires the repository's configured gates in this order:

1. `dependency-lock`
2. `typecheck`
3. `architecture`
4. `test`
5. `build`
6. `browser`

Failures are corrected at their owning implementation layer; tests are not weakened to accept old behavior.

In addition, manual browser review must demonstrate:

- Work request → Research → Requirements → Solution design → Implementation plan → Readiness review → Approval → Implementation → Complete;
- CodeMirror document editing remains functional;
- Activity shows a failed terminal Run with failure and Technical details;
- Save documentation to Git visibly changes from working-tree-only to Git-persisted;
- title edit and archive/restore are discoverable but secondary;
- three saved OpenCode account labels can be viewed and switched, with provider/model unchanged.

## 9. Completion criterion

This P7 package is complete when the implementation and permanent verification prove that a normal operator can:

- select a project and create work whose complete durable documentation lives in that repository;
- edit documents in CodeMirror and commit only those governed documents to Git without shell work;
- understand the workflow without knowing R1/R2/R3;
- see exactly what every agent Run is doing/did and why it failed;
- recover using the canonical next action;
- rename/archive/restore work without creating parallel authority;
- switch among saved OpenCode login accounts directly in the Order UI while keeping the same configured OpenCode Go model;
- clone/reconfigure a project repository and recover its durable WorkItem/document drafts without fabricating runtime history.

There are no open design decisions in this plan.

## 10. Canonical task block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "P7-T01",
      "objective": "Cut productive Order configuration, persistence, source discovery and installer migration to repository-native WorkItem v3 semantics.",
      "dependsOn": [],
      "scope": ["src/installer.ts", "src/core/**", "src/shell/**", "src/daemon/**", "pontivus-order.toml.example"],
      "exclusions": ["docs/**", "ui/**", "tests/**", "pontivus-order.toml"],
      "acceptanceRefs": ["GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION", "GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT", "GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-TR-036-REPOSITORY-NATIVE-WORKITEM-DOCUMENTS", "GW-TR-038-PROJECT-SCOPED-SOURCE-DISCOVERY", "GW-TR-045-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-TR-048-V2-V3-APPROVAL-MIGRATION-SAFETY"],
      "changeSurface": ["src/installer.ts", "src/core/contracts.ts", "src/core/work-item-source.ts", "src/shell/config.ts", "src/shell/setup.ts", "src/shell/sqlite.ts", "src/shell/work-item-source.ts", "src/daemon/runtime.ts", "src/daemon/work-item-source.ts", "pontivus-order.toml.example"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["foundation", "core", "shell", "daemon"]
    },
    {
      "id": "P7-T02",
      "objective": "Implement canonical WorkItem title editing and repository-native archive/restore semantics.",
      "dependsOn": ["P7-T01"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**"],
      "exclusions": ["docs/**", "ui/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT", "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE", "GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY"],
      "changeSurface": ["src/core/contracts.ts", "src/core/lifecycle.ts", "src/core/work-item-source.ts", "src/shell/sqlite.ts", "src/shell/work-item-source.ts", "src/daemon/work-item-source.ts", "src/daemon/server.ts"],
      "gateIds": ["typecheck", "architecture", "test"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon"]
    },
    {
      "id": "P7-T03",
      "objective": "Implement WorkItem documentation Git status and exact path-scoped commits including archive-marker add/deletion.",
      "dependsOn": ["P7-T01", "P7-T02"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**"],
      "exclusions": ["docs/**", "ui/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE", "GW-FR-063-DOCUMENTATION-GIT-STATUS", "GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY", "GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY", "GW-TR-037-PATH-SCOPED-DOCUMENTATION-GIT-PERSISTENCE", "GW-TR-046-DOCUMENTATION-GIT-ELIGIBILITY", "GW-TR-047-REPOSITORY-LOCAL-GIT-IDENTITY"],
      "changeSurface": ["src/core/contracts.ts", "src/shell/repository.ts", "src/daemon/work-item-documentation.ts", "src/daemon/runtime.ts", "src/daemon/server.ts"],
      "gateIds": ["typecheck", "architecture", "test"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon"]
    },
    {
      "id": "P7-T04",
      "objective": "Implement the canonical typed HTTP failure boundary and preserve source/current-state diagnostics through the browser.",
      "dependsOn": ["P7-T01"],
      "scope": ["src/core/**", "src/daemon/**", "ui/src/http.ts"],
      "exclusions": ["docs/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-055-ACTIONABLE-FAILURE-RECOVERY", "GW-TR-055-TYPED-API-FAILURE-CLASSIFICATION"],
      "changeSurface": ["src/core/contracts.ts", "src/daemon/server.ts", "src/daemon/work-item-source.ts", "ui/src/http.ts"],
      "gateIds": ["typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "daemon", "ui"]
    },
    {
      "id": "P7-T05",
      "objective": "Persist bounded secret-safe provider diagnostics as existing Run evidence for pre-signoff and post-signoff provider turns.",
      "dependsOn": ["P7-T04"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**"],
      "exclusions": ["docs/**", "ui/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY", "GW-FR-055-ACTIONABLE-FAILURE-RECOVERY", "GW-FR-057-TECHNICAL-DETAILS-BOUNDARY", "GW-TR-056-RUN-SCOPED-PROVIDER-DIAGNOSTIC-EVIDENCE"],
      "changeSurface": ["src/core/contracts.ts", "src/shell/opencode.ts", "src/daemon/run.ts", "src/daemon/stage.ts", "src/daemon/execution.ts"],
      "gateIds": ["typecheck", "architecture", "test"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon"]
    },
    {
      "id": "P7-T06",
      "objective": "Replace backend-code/active-only dialogue presentation with the canonical human workflow and all-Run Activity workspace.",
      "dependsOn": ["P7-T04", "P7-T05"],
      "scope": ["ui/**"],
      "exclusions": ["docs/**", "src/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-051-USER-FACING-WORKFLOW-LANGUAGE", "GW-FR-052-WORKFLOW-ORIENTATION", "GW-FR-053-ACTIVITY-WORKSPACE", "GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY", "GW-FR-055-ACTIONABLE-FAILURE-RECOVERY", "GW-FR-056-WORKFLOW-ACTION-PLACEMENT", "GW-FR-057-TECHNICAL-DETAILS-BOUNDARY", "GW-FR-059-RESPONSIVE-ACTIVITY-CONTINUITY", "GW-TR-027-WORKFLOW-PRESENTATION-PROJECTION", "GW-TR-028-WORKFLOW-HEADER-GEOMETRY", "GW-TR-029-ACTIVITY-MASTER-DETAIL-LAYOUT", "GW-TR-030-SINGLE-RUN-EVENT-PRESENTATION", "GW-TR-031-ACTIVITY-INPUT-PLACEMENT", "GW-TR-032-TECHNICAL-DETAILS-PRESENTATION", "GW-TR-033-PRIMARY-FAILURE-PRESENTATION", "GW-TR-035-CANONICAL-MODE-RECONCILIATION"],
      "changeSurface": ["ui/src/ActivityWorkspace.tsx", "ui/src/RunEventTimeline.tsx", "ui/src/workbench-presentation.ts", "ui/src/WorkItemWorkspace.tsx", "ui/src/WorkItemContext.tsx", "ui/src/StageDialogue.tsx", "ui/src/ExecutionWorkspace.tsx", "ui/src/ProposalReview.tsx", "ui/src/EvidenceViewer.tsx", "ui/src/query-keys.ts", "ui/src/styles.css", "ui/src/theme.css"],
      "gateIds": ["typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["ui"]
    },
    {
      "id": "P7-T07",
      "objective": "Integrate repository-native document/Git state and WorkItem management into the existing CodeMirror workbench without replacing its source model.",
      "dependsOn": ["P7-T02", "P7-T03", "P7-T04", "P7-T06"],
      "scope": ["ui/**"],
      "exclusions": ["docs/**", "src/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-058-WORKITEM-MANAGEMENT-DISCOVERABILITY", "GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE", "GW-FR-063-DOCUMENTATION-GIT-STATUS", "GW-FR-064-DOCUMENTATION-GIT-CONTROL-PLACEMENT", "GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR", "GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES", "GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS", "GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW", "GW-FR-069-EDITOR-STATE-CONTINUITY", "GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT", "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE", "GW-TR-034-WORKITEM-MANAGEMENT-CONTROL-PLACEMENT", "GW-TR-039-CODEMIRROR-SOURCE-EDITOR-BOUNDARY", "GW-TR-040-EXACT-SOURCE-EDITOR-SYNCHRONIZATION", "GW-TR-041-MARKDOWN-PREVIEW-COMPOSITION", "GW-TR-042-DOCUMENT-EDITOR-ERGONOMIC-CONFIGURATION", "GW-TR-043-CODEMIRROR-THEME-SPATIAL-INTEGRATION", "GW-TR-044-EXACT-SOURCE-EDITOR-CERTIFICATION", "GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY"],
      "changeSurface": ["ui/src/CreateWorkItem.tsx", "ui/src/DocumentWorkspace.tsx", "ui/src/MarkdownEditor.tsx", "ui/src/MarkdownSourceEditor.tsx", "ui/src/WorkItemQueue.tsx", "ui/src/WorkItemWorkspace.tsx", "ui/src/WorkItemContext.tsx", "ui/src/http.ts", "ui/src/query-keys.ts", "ui/src/styles.css", "ui/src/theme.css"],
      "gateIds": ["typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["ui"]
    },
    {
      "id": "P7-T08",
      "objective": "Implement safe installation-global OpenCode saved-account listing, Add/Switch/Rename and mutation serialization without provider/model changes.",
      "dependsOn": ["P7-T04"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**"],
      "exclusions": ["docs/**", "ui/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY", "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING", "GW-FR-075-OPENCODE-ACCOUNT-LOGIN", "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY", "GW-TR-049-OPENCODE-SAFE-ACCOUNT-PROJECTION", "GW-TR-050-OPENCODE-ACCOUNT-CONTROL-PROCESS", "GW-TR-051-OPENCODE-ACCOUNT-MUTATION-SERIALIZATION", "GW-TR-052-OPENCODE-BROWSER-OAUTH-ACCOUNT-LOGIN"],
      "changeSurface": ["src/core/contracts.ts", "src/shell/opencode.ts", "src/daemon/opencode-account.ts", "src/daemon/runtime.ts", "src/daemon/server.ts"],
      "gateIds": ["typecheck", "architecture", "test"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon"]
    },
    {
      "id": "P7-T09",
      "objective": "Expose saved OpenCode login accounts through one global application-shell account control and browser OAuth flow.",
      "dependsOn": ["P7-T08"],
      "scope": ["ui/**"],
      "exclusions": ["docs/**", "src/**", "tests/**"],
      "acceptanceRefs": ["GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY", "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING", "GW-FR-075-OPENCODE-ACCOUNT-LOGIN", "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY", "GW-TR-053-OPENCODE-ACCOUNT-CONTROL-UI"],
      "changeSurface": ["ui/src/OpenCodeAccountControl.tsx", "ui/src/app.tsx", "ui/src/http.ts", "ui/src/query-keys.ts", "ui/src/primitives/WorkbenchToolbar.tsx", "ui/src/styles.css", "ui/src/theme.css"],
      "gateIds": ["typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["ui"]
    },
    {
      "id": "P7-T10",
      "objective": "Certify the complete repository-native workbench, Git persistence, Activity, CodeMirror preservation and OpenCode multi-account implementation.",
      "dependsOn": ["P7-T01", "P7-T02", "P7-T03", "P7-T04", "P7-T05", "P7-T06", "P7-T07", "P7-T08", "P7-T09"],
      "scope": ["tests/**"],
      "exclusions": ["docs/**", "src/**", "ui/**"],
      "acceptanceRefs": ["GW-FR-051-USER-FACING-WORKFLOW-LANGUAGE", "GW-FR-053-ACTIVITY-WORKSPACE", "GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY", "GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION", "GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE", "GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR", "GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY", "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING", "GW-FR-075-OPENCODE-ACCOUNT-LOGIN", "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY", "GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT", "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE", "GW-TR-037-PATH-SCOPED-DOCUMENTATION-GIT-PERSISTENCE", "GW-TR-044-EXACT-SOURCE-EDITOR-CERTIFICATION", "GW-TR-045-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-TR-048-V2-V3-APPROVAL-MIGRATION-SAFETY", "GW-TR-049-OPENCODE-SAFE-ACCOUNT-PROJECTION", "GW-TR-051-OPENCODE-ACCOUNT-MUTATION-SERIALIZATION", "GW-TR-053-OPENCODE-ACCOUNT-CONTROL-UI", "GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY", "GW-TR-055-TYPED-API-FAILURE-CLASSIFICATION", "GW-TR-056-RUN-SCOPED-PROVIDER-DIAGNOSTIC-EVIDENCE"],
      "changeSurface": ["tests/architecture.test.ts", "tests/core.test.ts", "tests/daemon.test.ts", "tests/e2e-server.ts", "tests/shell.test.ts", "tests/sqlite.test.ts", "tests/order-migration.test.ts", "tests/opencode.test.ts", "tests/browser.spec.ts", "tests/certification.test.ts", "tests/markdown-source-formatting.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["verification"]
    }
  ]
}
```
