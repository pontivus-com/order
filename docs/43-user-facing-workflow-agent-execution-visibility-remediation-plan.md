# 43 — User-facing workflow and agent-execution visibility remediation plan

**Status:** **Not implementation-ready after the repository-native WorkItem documentation authority change.** The user-facing workflow/activity scope remains valid, but this P7 package must be revised against `GW-FR-060..064`, `GW-TR-036..038` and `GW-DOC-CANONICAL-CONTRACTS-V1 §32` before implementation; canonical P3/P4 placement and sizing requirements are established by `GW-DOC-WORKBENCH-UX-V1` §21 and `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1` §20. P6/title/archive/provider-diagnostic contract amendments listed below must land before their dependent code phases.  
**Target repository:** `pontivus-com/order`  
**Pyramid layer:** P7 implementation plan  
**Prepared:** 2026-11-13  
**Purpose:** correct the browser product model so operators see the human workflow rather than backend lifecycle codes and have exact, continuously accessible visibility into agent execution, failure and recovery.

This document is an implementation plan. It does not redefine lifecycle semantics, UX placement/sizing or canonical contracts owned by higher layers.

## 1. Governing authority

Implementation must conform to:

- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
- `GW-DOC-WORK-LIFECYCLE-V1`;
- `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- `GW-DOC-WORKBENCH-UX-V1` including §21 / `GW-FR-051..059`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1` including §20 / `GW-TR-027..035`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`;
- `GW-DOC-CANONICAL-CONTRACTS-V1`;
- `GW-P1-FCIS`, `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW` and `GW-P1-MINIMUM-CHANGE`.

The existing canonical WorkItem lifecycle, Run, RunEvent, ArtifactRef, source, approval, task and evidence owners remain authoritative.

## 2. Remediation outcomes

The package is complete only when:

1. the primary UI uses Work request → Research → Requirements → Solution design → Implementation plan → Readiness review → Approval → Implementation → Complete;
2. internal values such as `R1`, `R2`, `R3`, `STAGE`, raw Run roles and raw event tags are secondary Technical details only;
3. every current and historical agent Run is inspectable in Activity regardless of terminal status;
4. every persisted material RunEvent is visible through the Activity timeline;
5. running/waiting/failed/blocked/completed state and exact failure detail are visible without browser developer tools;
6. agent failure cannot disappear when a Run ceases to be active;
7. source-boundary errors are classified/actionable rather than generic 400s;
8. provider-level observable diagnostics needed to debug execution are retained as Run-scoped evidence rather than discarded;
9. title editing and removal/restoration are discoverable WorkItem management interactions;
10. Activity, workflow orientation and management interactions use the placement/sizing rules already owned by P3/P4.


## 2.1 Repository-native documentation dependency (2026-11-13)

The canonical WorkItem document-location model changed after this plan was first written.

Implementation must not preserve or build further dependency on the former installation-global `workItemRoot`. The revised implementation package must incorporate the repository-native source/discovery/config/migration/Git-save contracts now owned by:

- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` §§9–10.1 / `GW-FR-060..061`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1` §14 / `GW-FR-062..063`;
- `GW-DOC-WORKBENCH-UX-V1` §22 / `GW-FR-064`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1` §30 / `GW-TR-036..038`;
- `GW-DOC-CANONICAL-CONTRACTS-V1` §32.

This status note prevents the earlier P7 package from acting as stale implementation authority. A refreshed P7 task set is required after design review; this document does not independently restate the new contracts.

## 3. Current proven defects

Current implementation evidence establishes:

- `WorkItemContext` labels the action `Start R1 run`;
- Documents exposes raw R1/R2/DESIGN/PLAN/R3 labels;
- `StageDialogue` selects only active STAGE Runs and filters event rendering to messages/questions/proposals;
- terminal `PROVIDER_FAILED`, `CONFORMANCE_FAILED`, `STAGE_BLOCKED` and `STAGE_COMPLETED` are therefore hidden from the ordinary pre-signoff activity surface;
- a terminal failed STAGE Run can result in `No active interactive run`;
- `ExecutionWorkspace` contains fuller Run/event inspection but is only available for post-signoff execution/candidate states;
- `WorkItemWorkspace` automatically moves Documents → Dialogue when an active Run appears but has no symmetric terminal/stage-transition reconciliation;
- the daemon maps every thrown `/api/*` error to HTTP 400 `INVALID_REQUEST`;
- source diagnostics exist canonically but are not preserved through the failing source request as a typed actionable response;
- OpenCode process stderr is drained with a no-op callback;
- there is no direct title-edit interaction;
- there is no governed remove/archive/restore interaction.

## 4. Placement and sizing implementation map

Implement exactly against `GW-DOC-WORKBENCH-UX-V1` §21 and `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1` §20.

| Interaction | Owning surface | Size/placement |
|---|---|---|
| current workflow step + full progression | WorkItem header | compact orientation row; never another full-width content tab bar |
| current agent status | Activity summary | primary-canvas compact summary above timeline |
| current status mirror | Context | concise only; no logs/timeline |
| Run/attempt selection | Activity | 14–18 rem master on wide; compact selector/drawer on medium/narrow |
| RunEvent timeline | Activity | flexible remaining width and remaining viewport height |
| pending question/composer | Activity | attached/sticky bottom of selected Activity detail only while input accepted |
| proposal diff | Review | full Review-class primary canvas |
| exact raw logs/provider diagnostics | Evidence | full Evidence-class primary canvas |
| exact IDs/raw payloads | Activity Technical details | secondary disclosure/drawer; no permanent third column |
| source blocker | current primary WorkItem surface + compact Context mirror | visible before productive action; link to Work request/Activity/Technical details |
| edit title | WorkItem header/title affordance | compact input/popover/dialog |
| remove/archive/restore | WorkItem header overflow or compact management section | secondary action + confirmation; never primary workflow CTA |
| signed implementation tasks | Implementation | existing task-centric master/detail workspace |
| chronological agent history during Implementation | Activity | remains separately accessible |

Context must collapse before Activity detail is compressed below the P3/P4 functional minimum. Activity owns the viewport; debug material never gets squeezed into the Context rail.

## 5. Workflow interaction sequence

### Work request / Research entry

- WorkItem opens with user-facing workflow orientation.
- Work request remains the canonical source document.
- primary action is `Start research`, not `Start R1 run`.
- starting Research opens Activity unless blocked by unsaved Markdown.

### Research/Requirements/Solution design/Implementation planning

- Activity shows the selected Run immediately with Running state.
- WAITING_FOR_INPUT keeps Activity primary and exposes the pending question/composer.
- proposed document changes appear as timeline events and open Proposal Review.
- after adoption/rejection, return to the owning Activity/state with the next allowed action explicit.
- direct document edits visibly return ownership to the corresponding workflow step and require revalidation through the canonical stage path.

### Failure

- failed/blocked/cancelled activity remains visible and selectable;
- primary failure receipt shows exact canonical detail and retry/recovery action;
- Technical details/evidence are optional deeper inspection, never the sole failure explanation.

### Successful transition

- canonical WorkItem transition immediately updates the workflow header;
- Activity history remains inspectable;
- browser-local mode cannot remain on an invalid/stale surface.

### Approval and Implementation

- Approval remains Review-class work;
- post-signoff user-facing mode is Implementation;
- task/candidate/validation inspection remains in Implementation;
- Activity remains the chronological agent-execution view for builder/reviewer/remediator Runs.

## 6. Documentation prerequisite phase

These changes are required before dependent code. They must amend canonical owners rather than this plan becoming their semantic authority.

### D1 — WorkItem management authority

Amend `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` and, where needed, `GW-DOC-MARKDOWN-WORKBENCH-V1` to own:

- direct user-facing title-edit semantics while preserving the WorkItem source H1 as canonical title owner;
- exact remove-from-active-work/restore semantics;
- portability/reconciliation consequence of removal/restoration;
- prohibition on an installation-local-only hide flag that would be lost on source rediscovery.

### D2 — Canonical P6 management contract

Amend `GW-DOC-CANONICAL-CONTRACTS-V1` to define the exact typed mutation/persistence/source grammar for D1.

No browser-local title/archive authority and no second WorkItem representation may be introduced.

### D3 — API failure classification

Amend `GW-DOC-TECHNICAL-ARCHITECTURE-V1` and `GW-DOC-CANONICAL-CONTRACTS-V1` so:

- malformed request/input is 400;
- absent canonical entity is 404;
- source/lifecycle/current-state conflict is 409;
- unexpected daemon defect is 500;
- source-boundary failures preserve the existing canonical `WorkItemSourceDiagnostic` code/path/workItem/detail instead of collapsing to generic `INVALID_REQUEST`.

### D4 — Provider diagnostic evidence

Amend P4/P6 to define Run-scoped diagnostic evidence for observable provider execution.

It must cover the observable information required to diagnose agent execution, including provider/model/session identity, turn timing/outcome, format-repair use, parse/admission failure, observable tool/action/result material supplied by the provider SDK, process stderr and transport/provider exception text.

It must explicitly exclude hidden model reasoning/chain-of-thought and secrets.

The implementation must reuse the existing Evidence architecture; no second logging database is authorized.

## 7. Code implementation phases

### I1 — Canonical presentation projection

Extend `ui/src/workbench-presentation.ts` as required by `GW-TR-027`.

Remove component-local internal-code presentation where replaced by the shared projection.

### I2 — Workflow orientation

Implement the compact WorkItem header workflow orientation under `GW-TR-028`.

Do not add another full-width mode/navigation row.

### I3 — Activity workspace

Create the Activity workspace under `GW-TR-029..031`.

Replace the current StageDialogue-only execution presentation rather than retaining two competing pre-signoff Run surfaces.

Activity must query all WorkItem Runs, select active when present else most-recent/history selection, and retain terminal Runs.

### I4 — Shared RunEvent rendering

Create one cohesive Run/event renderer under `GW-TR-030`.

It must render every canonical event material to understanding execution. Conversation, question and proposal events remain first-class, but failure/completion/conformance events are no longer filtered away.

Implementation may reuse the exact same renderer inside the task-centric Implementation workspace where semantics match.

### I5 — Failure/recovery receipts

Implement `GW-FR-055` / `GW-TR-033`.

Provider/conformance/stage/source failure detail is visible in the primary owning surface with the canonical recovery action.

### I6 — Presentation-mode reconciliation

Replace the one-way active-Run auto-navigation with the symmetric state reconciliation required by `GW-TR-035`.

Cover active → waiting/completed/failed/blocked/cancelled and WorkItem stage advancement/return.

Preserve dirty Markdown, focus and URL/history rules.

### I7 — API/source failure correction

Implement D3.

Update `ui/src/http.ts` to parse the canonical typed error response and make source diagnostic information available to primary UI surfaces.

### I8 — Provider diagnostic evidence

Implement D4 at the OpenCode shell/Run evidence boundary.

Stop discarding useful stderr.

Expose diagnostic evidence from Activity Technical details/Evidence.

### I9 — Technical details

Implement `GW-TR-032`.

Raw internal stage/role/status/ids/event payloads are visible on demand, not primary workflow language.

### I10 — Title management

Implement D1/D2 title semantics through the canonical source owner with expected-hash protection and canonical refetch.

Place the control according to `GW-TR-034`.

### I11 — Remove/restore management

Implement D1/D2 remove/restore semantics.

Place the control according to `GW-TR-034`.

Do not implement raw deletion or installation-local hiding unless the canonical D1/D2 authority explicitly chooses it.

### I12 — User-facing naming closure

Audit every primary browser surface and remove ordinary dependence on internal lifecycle/run/event code words.

Rename the user-facing post-signoff Execution workspace to Implementation while keeping canonical `EXECUTION` state unchanged.

## 8. Expected change surface

Documentation:

- `docs/31-work-item-document-system.md`;
- `docs/32-operator-markdown-workbench.md`;
- `docs/37-workbench-ux-information-architecture.md`;
- `docs/38-workbench-astryx-component-architecture.md`;
- `docs/12-technical-architecture.md`;
- `docs/13-canonical-contracts.md`.

Likely production surface:

- `src/core/contracts.ts`;
- `src/core/work-item-source.ts`;
- `src/daemon/server.ts`;
- `src/daemon/work-item-source.ts`;
- `src/daemon/run.ts`;
- `src/daemon/stage.ts` only where canonical diagnostic evidence/event binding requires it;
- `src/shell/opencode.ts`;
- `ui/src/workbench-presentation.ts`;
- `ui/src/WorkItemWorkspace.tsx`;
- `ui/src/WorkItemContext.tsx`;
- `ui/src/DocumentWorkspace.tsx`;
- current `ui/src/StageDialogue.tsx` replaced/deleted when Activity takes ownership;
- new Activity cohesive modules;
- `ui/src/ExecutionWorkspace.tsx`;
- `ui/src/ProposalReview.tsx`;
- `ui/src/WorkItemQueue.tsx`;
- `ui/src/http.ts`;
- `ui/src/theme.css`.

Verification:

- `tests/architecture.test.ts`;
- `tests/core.test.ts`;
- `tests/daemon.test.ts`;
- `tests/opencode.test.ts`;
- `tests/browser.spec.ts`.

This is a forecast, not authorization for unrelated changes.

## 9. Verification requirements

Permanent verification must prove:

1. no primary WorkItem surface requires `R1`, `R2`, `R3`, `STAGE` or raw RunEvent terminology to understand the workflow;
2. workflow orientation remains compact and does not create redundant navigation chrome;
3. Activity is available for active and terminal pre-signoff Runs;
4. provider failure remains visible after the Run becomes FAILED;
5. `CONFORMANCE_FAILED`, `STAGE_BLOCKED`, `STAGE_COMPLETED` and other material events are inspectable;
6. Activity wide geometry preserves a 14–18 rem Run master and flexible selected detail;
7. Context collapses before Activity detail violates its minimum useful width;
8. Activity timeline/composer own remaining viewport height on representative wide/medium/narrow sizes;
9. pending human input remains adjacent to the requesting Activity;
10. proposal Review and Evidence round-trips preserve selected activity;
11. workflow transition updates orientation and valid presentation mode without reload;
12. source-boundary failure is classified/actionable rather than generic unexplained 400;
13. Technical details exposes exact internal state without making it primary product language;
14. provider diagnostic evidence is retained/openable and no hidden reasoning or credential material is intentionally captured;
15. title edit changes the canonical source title and no second title authority exists;
16. remove/restore obeys the canonical D1/D2 semantics and remains secondary to lifecycle actions;
17. existing dirty-buffer, focus, URL/history, sign-off, validation and evidence-safety regressions remain green;
18. architecture tests retain FCIS/SoC/DRY/strict typing/no-DTO/no-second-store invariants.

## 10. Explicit exclusions

This remediation does not authorize:

- a new lifecycle or lifecycle ordering;
- browser-owned promotion/state;
- a second WorkItem/Run/RunEvent representation;
- DTO/view-model families;
- a second server-state store;
- WebSocket/SSE merely for Activity;
- hidden model reasoning/chain-of-thought capture;
- a generic observability/logging platform;
- arbitrary repository editing;
- a new IDE/file explorer;
- unrelated visual redesign.

## 11. Completion criterion

The package is finished when an operator can open any WorkItem and, without knowing Order's backend vocabulary:

- understand the current workflow step and what it means;
- see exactly whether an agent is running, waiting, complete, blocked or failed;
- inspect what happened in chronological order;
- inspect exact technical evidence when needed;
- recover from a failure through an explicit allowed action;
- manage the WorkItem title and active-queue presence through governed controls;
- continue through Approval and Implementation without presentation state becoming stale or ambiguous.
