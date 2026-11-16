<!-- Order template: delivery-r2-v1; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-SPECIFICATION-STANDARD-V1 -->

# 0.5.0 integrated workflow task experience — functional requirements

**Status:** R2 functional-design draft — initial task model  
**WorkItem:** `work_2778105b-d919-4fcd-91e7-dd9b23812aac`  
**Derived factual authority:** parent AUDIT `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`

## Required observable outcome

### 1. Functional organizing principle

The Workbench is organized around the **task owned by the selected workflow step**, not around the database/domain objects available at that step.

For every current workflow condition, the product must make three facts immediately intelligible:

1. where the WorkItem is;
2. what task or subtask requires attention now;
3. what the operator can validly do next.

Each workflow step therefore owns:

- one **primary task**;
- zero or more **subtasks** required to complete it;
- an explicit **completion outcome**;
- an information hierarchy that supplies only the information required to perform the current task/subtask by default;
- a current-attention rule that can temporarily replace ordinary work with required input, proposal review, conflict, blocker or recovery;
- one primary interaction class at a time from the existing closed Workbench interaction vocabulary.

The UI may expose supporting history, evidence, context and technical identity, but those do not compete with the current task for primary hierarchy.

### 2. Cross-workflow task model

The ordinary task sequence is:

~~~text
Work request
  define and validate originating intent
        |
        v
Research
  establish the facts and evidence needed to decide what is true
        |
        v
Requirements
  define the observable outcome and behavioral contract
        |
        v
Solution design
  define the technical solution that satisfies the accepted requirements
        |
        v
Implementation plan
  define the exact executable repository transition
        |
        v
Readiness review
  adversarially judge whether the package is executable without material inference
        |
        v
Approval
  understand and explicitly authorize the exact package
        |
        v
Implementation
  execute, review, remediate and validate approved tasks
        |
        v
Complete
  understand the governed terminal result and permitted follow-up
~~~

A return upstream changes current task ownership but does not erase reached/historical work.

### 3. Shared task/subtask contract

Every material subtask must define:

| Contract element | Required meaning |
|---|---|
| Trigger/current condition | the canonical condition that makes this subtask relevant or current |
| Operator goal | what the human is trying to accomplish |
| Required information | information necessary to understand and perform the subtask |
| Human input/decision | what the operator may supply or decide |
| Interaction | the action or interaction made available |
| Result | canonical effect or explicit non-mutating result |
| Orientation after result | what becomes primary/current next |
| Supporting material | history/context/evidence available without displacing the task |
| Technical detail | exact identity/diagnostics available on demand when not task-essential |

Current-attention conditions override ordinary task presentation in this order: unsafe mutation conflict; required human input; proposal decision; proposal adoption/reconciliation in progress; canonical blocker; stale authority/currentness; retry/resume recovery; active processing; startable/current action; ordinary task material; historical inspection.

### 4. Work request — define and validate originating intent

**Primary task:** establish the durable originating request sufficiently clearly and validly to begin governed Research.

**Primary interaction class:** Document.

| Subtask | Trigger/current condition | Operator goal | Required information | Human input/decision | Observable interaction/result |
|---|---|---|---|---|---|
| Author/refine request | Work request editable and no higher-priority conflict/blocker | express requested change/defect/investigation/audit intent | current source Markdown, work kind/project/concerns where useful | Markdown edits | Save writes exact governed source; Cancel restores loaded source |
| Resolve source invalidity/conflict | invalid source, stale expected hash or source diagnostic owns attention | restore a valid current source | human-readable invalidity/conflict and affected source | edit/reload/reconcile as canonically permitted | source becomes current or remains blocked with exact reason |
| Inspect source status | operator requests supporting detail | understand save/Git/currentness state | concise material state; exact path/hash/Git identity on demand | none | non-mutating inspection |
| Start Research | source valid/current and canonical Start is allowed | hand the durable request to R1 | readiness to begin and any blocking prerequisite | explicit Start Research | Research becomes current and the first R1 activity owns attention |

**Information hierarchy:** source Markdown first; current source blocker/conflict second when present; Save/Cancel or Start Research as the single current action; Git/path/hash/schema identity technical/on-demand.

### 5. Research — establish facts and evidence

**Primary task:** determine what is true about the requested work and establish sufficient evidence/root cause/context for downstream requirements.

**Primary interaction classes:** Dialogue while active interaction owns attention; Review for proposal disposition; Document when governed Research material owns ordinary attention; Evidence for selected evidence.

| Subtask | Trigger/current condition | Operator goal | Required information | Human input/decision | Observable interaction/result |
|---|---|---|---|---|---|
| Start/retry research activity | R1 current and start/retry action owns attention | begin or resume governed investigation | Research purpose, current durable request, prior relevant result/blocker | Start/Retry | active Research activity becomes primary |
| Observe agent work | provider turn processing | understand that productive investigation is occurring and, to the degree functionally required, what category of work is occurring | canonical Processing state plus accepted bounded operational activity | normally none | activity updates without exposing hidden reasoning or raw provider plumbing |
| Answer a research question | exact required input owns attention | provide a missing fact/decision necessary to continue | exact question, relevant current context/material | answer | accepted input is visible and provider work continues |
| Continue open collaboration | Run OPEN and no proposal/input/blocker owns attention | clarify or direct work within current authorized intent | current dialogue and relevant Research context | free-form continuation | provider work continues in same governed Run/context |
| Review proposed Research change | pending proposal owns attention | decide whether proposed canonical material change is acceptable | target material, rationale, substantive diff/currentness | Adopt or Reject | proposal is dispositioned; adopted material becomes current at R1 without silently promoting stage |
| Inspect/edit Research document | no higher-priority current interaction owns attention and governed Research material exists | understand/refine canonical Research | current document and material maturity | direct edit where allowed | expected-hash Save updates canonical material and normal conformance/currentness rules apply |
| Inspect evidence/history | operator explicitly selects evidence or prior attempt | verify basis or understand prior activity | evidence bytes or historical attempt/timeline | none | non-mutating inspection; current blocker/action remains directly reachable |

**Open functional decision FD-02:** define the exact bounded agent operational activity needed during processing and whether each class is live, post-turn or both. Candidate information already proven available includes turn timing, action/tool category, safe resource/read/change summary, retry/recovery activity and bounded progress. Hidden reasoning, secrets, raw unbounded tool I/O and provider-native protocol data remain closed.

### 6. Requirements — define the observable behavioral contract

**Primary task:** convert validated intent and Research facts into complete observable requirements that downstream design can implement without inventing product behavior.

**Primary interaction classes:** same stable pre-signoff Dialogue/Review/Document/Evidence grammar as Research.

Required subtasks are the same interaction mechanics as Research but with different task information:

- establish/inspect the current Requirements document;
- collaborate with the requirements agent;
- answer required product questions;
- review/adopt/reject proposed requirement changes;
- directly edit current Requirements where allowed;
- inspect Research/source/evidence as supporting context;
- decide whether observable outcome, scope, exclusions, acceptance, failure behavior and material constraints are complete enough for DESIGN.

**Information hierarchy:** the Requirements content and any current question/proposal/blocker dominate. Research and Work request remain supporting authority; raw repository paths/hashes/session identity remain technical/on-demand.

### 7. Solution design — define the technical solution

**Primary task:** create a technically coherent solution that satisfies accepted Requirements while respecting governing architecture and ownership constraints.

**Primary interaction classes:** stable pre-signoff Dialogue/Review/Document/Evidence grammar.

Required subtasks:

- start/retry design activity;
- collaborate with the design agent while processing/open;
- answer exact required technical/product clarification when current;
- review proposed design changes;
- inspect/edit the governed Solution design;
- inspect Requirements and relevant authority/evidence as supporting material;
- resolve blockers/returns;
- determine when the design is complete enough to proceed to PLAN.

The Solution design document receives broad primary working width appropriate to architecture, contracts, diagrams and technical reasoning. Supporting authority does not become a permanent competing navigation axis.

### 8. Implementation plan — define exact executable delivery authority

**Primary task:** convert accepted design into an implementation plan that an implementation worker can execute without material product/design inference.

**Primary interaction classes:** stable pre-signoff Dialogue/Review/Document/Evidence grammar.

Required subtasks:

- start/retry planning activity;
- collaborate with the planning agent;
- answer required planning clarification;
- review proposed Plan changes;
- inspect/edit the governed Plan;
- inspect Design/Requirements/evidence as subordinate authority;
- verify task boundaries, dependencies, change surface and validation sequence are explicit;
- progress only when the Plan is an exact downstream execution contract.

Derived task/change-surface summaries may assist inspection but never become a second plan authority.

### 9. Integrated pre-signoff interaction loop

Research, Requirements, Solution design and Implementation plan must behave as one recognizable task grammar rather than unrelated chat/document/artifact features.

The required observable loop is:

~~~text
current governed material + supporting context
        |
        v
start / continue agent work
        |
        v
processing + bounded operational activity
        |
        +--> exact required question -> human response -> continue
        |
        +--> proposal -> Review -> adopt/reject -> material/currentness refresh
        |
        +--> blocker/failure -> owning recovery action
        |
        v
current governed document
        |
        +--> direct human edit/save where allowed
        |
        v
conformance/currentness
        |
        v
continue / promote / return / block
~~~

Attempt, document, proposal, evidence and supporting-material selection must remain compact and must not create a second persistent navigation system or change the primary canvas geometry merely because more objects exist.

**Open functional decision FD-04:** proposal/cancellation semantics must guarantee that an unresolved proposal always has a valid disposition owner. R2 must choose one explicit behavior before closure; a terminalized owning Run with an unresolved proposal is prohibited.

### 10. Readiness review — adversarially judge the exact package

**Primary task:** determine whether the exact current package is ready for explicit authorization without requiring implementation-time inference.

**Primary interaction class:** Review. Dialogue may temporarily own current attention only for legitimate required input.

Required hierarchy and subtasks:

1. understand current readiness/verdict state;
2. inspect findings and the exact upstream owner responsible for each material defect;
3. inspect the package material required to understand the verdict;
4. inspect evidence;
5. inspect attempt/history only as supporting information;
6. answer a required readiness question when one is legitimately current;
7. follow the canonical return/recovery action when not ready;
8. inspect the immutable governed R3 result when complete.

R3 material is read-only. Repository paths and exact technical artifact identity are on-demand unless required to identify specific evidence.

### 11. Approval — understand and authorize the exact package

**Primary task:** understand the exact package being authorized and make one explicit sign-off decision.

**Primary interaction class:** Review.

Required subtasks and hierarchy:

| Order | Subtask | Required primary information | Interaction |
|---|---|---|---|
| 1 | Establish package currentness | whether the package is current/signable or stale/returned and why | inspect or follow exact reconciliation owner |
| 2 | Understand signed tasks | objectives, scope, exclusions, dependencies, gates, acceptance and relevant authority | select/scan task detail |
| 3 | Inspect governed documents needed for judgment | relevant R1/R2/DESIGN/PLAN/R3 material | select/read document |
| 4 | Make authorization decision | current package meaning and approver identity | explicit Sign off exact package |
| 5 | Inspect exact technical identity | package hash/source SHA/baseline/ids | on-demand disclosure/Context |

Large task/document collections remain inside the same Review workspace using scan-efficient rows/tables; count alone never changes Approval into persistent master/detail.

A stale or returned package remains inspectable but is not signable and must not be represented as approved.

### 12. Implementation — execute and validate approved tasks

**Primary task:** execute the currently authorized implementation task through build/review/remediation/validation while preserving the exact signed scope and surfacing the true current owner/blocker.

**Primary interaction class:** Operational master/detail.

**Master responsibility:** scan approved tasks and subordinate attempts/history without becoming workflow authority.

**Detail responsibility:** show the selected task's objective/scope, current task state, current owner/attempt, blocker or next action, validation boundary, events and evidence/resources.

Required subtasks:

- identify the canonical current task owner independently from historical selection;
- explicitly start/continue the current executable unit according to the product semantics closed below;
- observe bounded builder/reviewer/remediator activity;
- cancel an active attempt when canonically allowed;
- inspect review/validation failure and evidence;
- resume a blocked task after the owning blocker is resolved;
- inspect prior attempts and evidence without hiding the actual current action;
- understand validation progress without filling primary space with unreached empty validation rows.

**Open functional decision FD-03:** the manual action must have one unambiguous semantic meaning. R2 must decide whether it means “start the visible/current approved task” or “ask the global scheduler to run any eligible work” (or another explicit behavior). The displayed label, current-task hierarchy and command semantics must be identical in meaning.

### 13. Complete — understand the governed terminal outcome

**Primary task:** understand what the WorkItem finally produced and what follow-up, if any, is valid.

**Primary interaction class:** Terminal result.

Required subtasks:

- understand terminal classification/outcome first;
- inspect the substantive governed result or verified candidate evidence;
- inspect prior reached workflow steps as history without displacing the outcome;
- for completed AUDIT/INVESTIGATION only, create separately governed linked remediation when permitted;
- inspect evidence/result artifacts on demand.

Complete does not become another generic artifact browser.

### 14. Material maturity as a cross-workflow task input

Lifecycle position and material maturity are separate product concepts.

The Workbench must provide a consistent operator-facing material vocabulary derived from canonical facts sufficient to distinguish, at minimum, the functional meanings of:

- repository draft / material exists but is not current conformed authority;
- proposal pending;
- adoption/reconciliation in progress;
- current but not conformed;
- current and conformed;
- stale;
- historical;
- signed/locked;
- terminal result.

**Open functional decision FD-05:** R2 must choose the final user-facing names and exact edit/save/proposal/conformance/history/lock behavior that must be visible for each distinction. The design must not require a duplicate persisted document-status owner.

### 15. Information hierarchy contract

Every workflow task must classify information into the following product roles:

1. **primary work** — material necessary to perform the current task;
2. **current attention/action** — the one condition currently requiring the operator or explaining why progress is blocked;
3. **supporting context** — upstream material/context that assists the task;
4. **agent activity/conversation** — human-facing interaction and accepted bounded operational activity;
5. **history/evidence** — prior attempts and exact evidence selected for inspection;
6. **technical/debug** — hashes, raw paths, exact ids, provider/session identity and raw diagnostic detail.

Technical/debug information is available on demand but must not occupy persistent premium space unless that exact technical identity is itself necessary to perform the current task.

### 16. Interaction-space contract

The existing closed interaction classes remain sufficient for the known task model:

| Interaction class | Functional use in this change |
|---|---|
| Operational scan | Queue and task scanning |
| Form/configuration | Create and Settings |
| Document | Work request and governed R1/R2/DESIGN/PLAN material |
| Dialogue | active pre-signoff human-agent interaction |
| Review | proposal, Readiness and Approval |
| Operational master/detail | Implementation only |
| Evidence | exact evidence/bytes |
| Terminal result | Complete |
| Compact context | secondary metadata/diagnostics |
| Task panel | bounded Create/configuration subtasks |
| Safety/exception | conflicts and destructive confirmations |

Phase 2A must not invent another screen grammar merely for feature-specific convenience. If a newly discovered functional requirement cannot be expressed by this set, that is an explicit R2 question requiring an authority amendment before DESIGN.

### 17. Supporting application tasks

Queue, Create, Settings, Context and Evidence remain supporting services rather than lifecycle stages.

They must preserve their existing task purposes:

- **Queue:** scan/select work requiring attention; filter/search without becoming workflow authority;
- **Create:** create a valid portable WorkItem, including linked remediation, through a bounded Form task;
- **Settings:** resolve repositories, OpenCode accounts, model/runtime and installation-readiness configuration through one application-level configuration home;
- **Context:** reveal compact secondary metadata/diagnostics explicitly and remain closed by default;
- **Evidence:** inspect exact bytes/resources without turning evidence identity into the primary workflow hierarchy.

Any supporting service that identifies a current blocker must route the operator to the owning task/recovery action rather than become a competing workflow state owner.

### 18. Explicit R2 decision register

The following decisions remain open in this initial draft and must be closed before R2 promotion:

- **R2-D01 / FD-02:** exact operator-visible OpenCode operational activity, reliability expectations and live/post-turn requirement;
- **R2-D02 / FD-04:** proposal cancellation/terminalization behavior;
- **R2-D03 / FD-03:** manual Implementation action semantics;
- **R2-D04 / FD-05:** final material-maturity vocabulary and visible behavior;
- **R2-D05 / FD-01:** final per-step information/action hierarchy details where existing P3 remains incomplete;
- **R2-D06 / FD-06:** detailed integrated pre-signoff transitions/orientation after document edits, proposals, required input and provider completion.

These are product decisions. They must not be deferred to technical DESIGN or implementation.

## Acceptance criteria

R2 is functionally complete only when all of the following are true:

1. every workflow step has one explicit primary task and completion outcome;
2. every material subtask has trigger, required information, allowed human input/decision, valid interaction, result and post-action orientation;
3. every material current-attention state maps to exactly one owning task/interaction or explicit no-action processing state;
4. every user-facing information class is assigned to primary work, current attention, supporting context, agent activity, history/evidence or technical/debug;
5. Research/Requirements/Solution design/Plan share one coherent pre-signoff interaction grammar while retaining their distinct task purpose;
6. a required question, proposal decision, blocker, conflict or recovery cannot be hidden by historical/material selection;
7. exact technical identity is on demand unless task-essential;
8. Approval leads with currentness, task/package meaning and sign-off rather than hashes/commit identity;
9. Implementation preserves task scanning plus stable detail and never lets historical selection hide the current owner/blocker;
10. Complete leads with terminal outcome/result rather than generic artifact navigation;
11. proposal terminalization has no admitted unresolved-owner dead state;
12. manual Implementation execution semantics and visible label/action refer to the same unit of work;
13. material maturity is visibly distinguishable from lifecycle stage without adding a second persisted maturity state owner;
14. accepted OpenCode transparency exposes only bounded product-relevant operational facts and never hidden reasoning/secrets/raw unbounded provider data;
15. responsive representation preserves task meaning, current action, focus continuity and state meaning across wide/medium/narrow;
16. every material mutation has comprehensible pending, success, conflict/failure and recovery behavior;
17. the Phase 1 `SURF/INFO/ACT/FLOW` registry can be traced to the accepted task/subtask contracts without leaving a productive current-state interaction unclassified;
18. all R2-D01 through R2-D06 decisions are closed before DESIGN begins.

## Scope/exclusions

### In scope

- all nine lifecycle workflow steps;
- the shared pre-signoff human-agent/document/proposal interaction model;
- current-attention and post-action orientation;
- operator-visible agent activity requirements;
- material maturity presentation/behavior;
- proposal/cancellation behavior;
- manual Implementation action meaning;
- information hierarchy for every material workflow surface;
- Queue/Create/Settings/Context/Evidence behavior where needed to support the workflow task model;
- responsive/accessibility continuity and functional acceptance.

### Excluded from R2

- choosing provider event/log APIs or persistence mechanics;
- choosing HTTP request/response shapes;
- defining new TypeScript/Zod contracts;
- choosing React component ownership or file boundaries;
- implementation task planning;
- adding a persisted material-maturity state merely for presentation;
- dependency upgrades unless later DESIGN proves the accepted R2 requirement cannot be satisfied by the current pinned provider;
- exposing hidden reasoning or unrestricted provider internals;
- redesigning unrelated repository/configuration functionality that Phase 1 did not identify as part of the 0.5.0 workflow-task problem.

## Failure/negative behavior

The final behavior must not:

- require the operator to infer lifecycle ownership from provider/session/runtime mechanics;
- present domain objects merely because data is available when they do not support the current task;
- allow technical hashes/paths/ids to displace task meaning/current action;
- create a proposal that remains unresolved after its only valid owner has terminalized;
- present a task-local action whose actual semantic scope is global or unrelated;
- let historical selection become current mutation authority;
- silently promote conversational input into canonical authority;
- silently overwrite changed governed Markdown;
- treat Git commit state as conformance/readiness;
- fabricate Run/conformance history to surface repository drafts;
- hide current blocker/input/proposal/recovery behind Context or another secondary surface;
- expose hidden reasoning, credentials, raw unbounded provider payloads or unstable provider metadata as normal product transparency;
- create another persistent navigation axis for pre-signoff object collections;
- turn Approval into master/detail because it contains many tasks/documents;
- fill Implementation's primary surface with empty/unreached validation rows;
- allow responsive recomposition to change task semantics or action priority;
- delegate any unresolved R2-D01..R2-D06 product decision to DESIGN or implementation.

## Material compatibility/security/performance constraints

- Existing canonical WorkItem/document/proposal/Run/Approval/ExecutionTask identities and authority semantics remain compatible unless R2 explicitly amends observable behavior and DESIGN proves a contract change is required.
- Conversation remains non-canonical unless explicitly adopted into governed authority through an existing authorized mutation path.
- Existing expected-hash conflict safety, sign-off exactness, source freshness and signed-material locking are preserved.
- Provider transparency must be bounded/redacted and must not expose secrets or hidden model reasoning.
- The UI must remain a local browser client of daemon-owned canonical state; no browser-local workflow authority is introduced.
- Task-focused presentation must remain responsive and usable under the documented long-content, multiple-attempt/task, failure, evidence and history density conditions established by Phase 1.
- Asynchronous provider/execution work must remain observable without requiring page reload and without exposing a next mutation before canonical observation has cohered.
- Technical-detail disclosure and additional bounded agent activity must not make ordinary workflow operation depend on provider-native identity or volatile event ordering.
