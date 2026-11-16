# Phase 1 workflow/state audit

**Status:** P1-T06 complete  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Branch:** `version/0.5.0`  
**Consumes:** `application-interaction-map.md` through P1-T05  
**Governing authority:** `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-WORKBENCH-UX-V2`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-CANONICAL-CONTRACTS-V1`

## 1. Purpose and overall verdict

This audit derives the current workflow/state model from the user-interaction map and tests whether every mapped UI condition/action is explainable by canonical facts and one admitted transition.

**Overall verdict: INCOMPLETE end-to-end, but the orthogonal state architecture is fundamentally correct.**

The implementation does **not** need another persisted workflow-state aggregate. It already separates:

- WorkItem lifecycle position;
- reached history;
- STAGE Run interaction;
- lifecycle proposal decision;
- material currentness;
- execution owner;
- validation boundary;
- recovery disposition;
- observation coherence;
- current attention;
- workflow-rail summary.

That shape is consistent with FCIS, SoC, semantic DRY and canonical ownership.

P1-T06 confirms six material closure findings:

1. **STATE-F01 — unresolved proposal + Cancel can produce a CLOSED Run with an unresolved proposal.**
2. **STATE-F02 — the task-local Implementation command invokes an unscoped global coordinator tick.**
3. **STATE-F03 — the STAGE provider producer contract omits the closed batch grammar enforced by the consumer.**
4. **STATE-F04 — the browser convergence barrier is not closed over independently refetched WorkItem/Run observations.**
5. **STATE-F05 — browser document/source mutation availability does not enforce the canonical active-Run exclusion.**
6. **STATE-F06 — P3 wording is ambiguous about whether a contradictory provider batch may terminalize the Run as provider failure.**

The first five are current design/implementation closure defects. STATE-F06 is an authority wording ambiguity that Phase 2A must resolve before Phase 2B can certify one exact failure behavior.

## 2. State-owner map

| STATE | Semantic owner | Canonical inputs | Persisted separately? | UI use | Verdict |
|---|---|---|---:|---|---|
| STATE-001 lifecycle | `transitionWorkItem`, `evaluateStageCompletion` | WorkItem + one transition cause | no second lifecycle object | current workflow owner | CORRECT |
| STATE-002 reached history | `deriveReachedStages` | WorkItem + Runs + RunEvents + ArtifactRefs + tasks | no | CURRENT / REACHED_HISTORICAL / UNREACHED | CORRECT |
| STATE-003 STAGE interaction | `stageRunInteraction` | one STAGE Run + ordered RunEvents | no | PROCESSING / OPEN / REQUIRED_INPUT / CLOSED | CORRECT |
| STATE-004 proposal decision | `deriveProposalDecision` | proposal/adoption/disposition events | no | proposal current action | derivation CORRECT; cancel closure STATE-F01 |
| STATE-005 material currentness | `normalizeMaterialCurrentness` | typed changed-owner facts | no | CURRENT / STALE(owner) | CORRECT |
| STATE-006 recovery | `deriveRecoveryDisposition` | WorkItem + current-stage Runs + currentness | no | retry/resume/reconcile | CORRECT |
| STATE-007 execution owner | `deriveExecutionOwner` | tasks + Runs | no | current/blocked task | derivation CORRECT; manual command scope STATE-F02 |
| STATE-008 validation boundary | `deriveValidationBoundary` | execution owner + task Runs/events | no | current validation state | CORRECT |
| STATE-009 observation coherence | `deriveObservationCoherence` + browser transport barrier | WorkItem + Runs + events + tasks + query state | no | mutation suppression while observations converge | semantic derivation CORRECT; browser barrier INCOMPLETE STATE-F04 |
| STATE-010 current attention | `deriveCurrentAttention` | coherence/conflict/interaction/proposal/currentness/recovery/execution | no | one current action owner | CORRECT |
| STATE-011 rail marker | `deriveWorkflowRail` | WorkItem + reached + attention + recovery + selection | no | lifecycle summary only | CORRECT |

**Architectural conclusion:** preserve these canonical owners. No new DTO/state-store/state-machine layer is justified.

## 3. Closed WorkItem lifecycle relation

| Current condition | Cause | Result | Interaction-map relation | Verdict |
|---|---|---|---|---|
| IDEA / ACTIVE | START_RESEARCH | R1 / ACTIVE | `FLOW-003`, `ACT-WI-009` | CORRECT |
| R1 / ACTIVE | STAGE_COMPLETED(CONFIRMED) | R2 / ACTIVE | pre-signoff flow | CORRECT |
| R1 / ACTIVE | schema-valid terminal outcome | COMPLETE / COMPLETE + outcome | terminal Audit/Investigation flow | CORRECT |
| R2 / ACTIVE | accepted completion | DESIGN / ACTIVE | pre-signoff flow | CORRECT |
| DESIGN / ACTIVE | accepted completion | PLAN / ACTIVE | pre-signoff flow | CORRECT |
| PLAN / ACTIVE | accepted completion | R3 / ACTIVE | pre-signoff flow | CORRECT |
| R3 / ACTIVE | READY_FOR_SIGNOFF | AWAITING_SIGNOFF / ACTIVE | `FLOW-008` | CORRECT |
| R3 / ACTIVE | RETURN_TO_RESEARCH | R1 / ACTIVE | governed backward return | CORRECT |
| R3 / ACTIVE | RETURN_TO_REQUIREMENTS | R2 / ACTIVE | governed backward return | CORRECT |
| R3 / ACTIVE | RETURN_TO_DESIGN | DESIGN / ACTIVE | governed backward return | CORRECT |
| R3 / ACTIVE | RETURN_TO_PLAN | PLAN / ACTIVE | governed backward return | CORRECT |
| IDEA source mutation | SOURCE_AUTHORITY_CHANGED | IDEA / ACTIVE | `ACT-DOC-003` | CORRECT |
| progressed pre-signoff / AWAITING_SIGNOFF source mutation | SOURCE_AUTHORITY_CHANGED | R1 / ACTIVE | `FLOW-007`, `FLOW-X04` | CORRECT |
| COMPLETE source mutation | SOURCE_AUTHORITY_CHANGED | COMPLETE unchanged | historical-integrity diagnostic only | CORRECT |
| reached lifecycle artifact mutation | LIFECYCLE_ARTIFACT_CHANGED(owner) | owner / ACTIVE | `ACT-DOC-004`, proposal adoption | CORRECT |
| current owner / ACTIVE | BLOCK_CURRENT_OWNER | same stage / BLOCKED | blocker flow | CORRECT |
| current owner / BLOCKED | RESUME_CURRENT_OWNER | same stage / ACTIVE | `ACT-WI-011`, `ACT-EXEC-005` | CORRECT |
| AWAITING_SIGNOFF / ACTIVE | SIGN_OFF | EXECUTION / ACTIVE | `ACT-APPROVAL-003` | CORRECT |
| AWAITING_SIGNOFF / ACTIVE | RECONCILE_AUTHORITY(owner) | owner / ACTIVE | `FLOW-X05` | CORRECT |
| EXECUTION | EXECUTION_RETURN(owner) | R1/R2/DESIGN/PLAN/R3 / ACTIVE | classified execution return | CORRECT |
| EXECUTION | EXECUTION_COMPLETED | COMPLETE / COMPLETE | `FLOW-008` | CORRECT |

Unlisted stage/status/cause combinations reject. Reached history is evidence-derived and monotonic; backward returns do not erase downstream historical reach.

## 4. STAGE interaction and proposal algebra

### 4.1 Run interaction

| Run/event condition | Derived interaction | Human action |
|---|---|---|
| RUNNING + latest trigger has no provider result | PROCESSING | no input |
| RUNNING + valid non-controlling result | OPEN | free continuation if no proposal owns attention |
| WAITING_FOR_INPUT + exactly one unresolved request Q | REQUIRED_INPUT(Q) | exact answer bound to Q |
| COMPLETED/BLOCKED/FAILED/CANCELLED | CLOSED | no input |
| RUNNING + unresolved required input | invalid history | reject |
| WAITING_FOR_INPUT without exact unresolved request | invalid history | reject |

`stageInputIsAdmitted` is exact:
- OPEN accepts only `requestEventId=null`;
- REQUIRED_INPUT(Q) accepts only Q;
- PROCESSING/CLOSED accept nothing.

Browser and daemon both consume the same core interaction derivation.

### 4.2 Proposal state

| Event history | Proposal state | Required action |
|---|---|---|
| no unresolved proposal | NONE | ordinary OPEN continuation may apply |
| one unresolved proposal | PENDING(P) | Adopt/Reject P |
| proposal + durable adoption intent | ADOPTION_IN_PROGRESS(P) | wait/reconcile exact adoption |
| adopted after adoption intent | NONE | re-resolve context/currentness |
| rejected before adoption intent | NONE | OPEN continuation may resume |

The derivation rejects unknown controls, control-before-proposal, duplicate disposition/adoption, adoption without durable intent, rejection after adoption intent and multiple unresolved proposals.

### STATE-F01 — Cancel can strand an unresolved proposal

**Verdict:** CONTRADICTORY, release blocker.

P4 §4.7 admits Cancel whenever the current STAGE Run is active in PROCESSING/OPEN/REQUIRED_INPUT. The daemon `cancelRunUnlocked` likewise checks only active Run status. It does not exclude a pending/adopting lifecycle proposal.

The normal browser currently suppresses Cancel while `PROPOSAL_DECISION` or `PROPOSAL_ADOPTION` owns attention, but the authoritative command boundary remains reachable and permits:

~~~text
RUNNING + OPEN + PENDING(P)
        |
        | cancelRun
        v
CANCELLED + CLOSED + PENDING(P)
~~~

`deriveProposalDecision` continues to see PENDING because no proposal disposition event was written, while proposal Adopt/Reject requires the Run interaction to remain OPEN. The state therefore has no valid proposal-resolution action.

**Minimum authority impact:** Phase 2 must close proposal-vs-cancel semantics at P3/P4/P6; this is not safely resolved as a browser-only patch.

## 5. STAGE provider-turn batch grammar

The current consumer grammar in `validateStageProviderTurn` is:

- non-empty batch;
- at most one HUMAN_INPUT_REQUESTED;
- at most one STAGE_BLOCKED;
- at most one STAGE_COMPLETED;
- input/block/completion mutually exclusive;
- at most one lifecycle proposal;
- proposal cannot coexist with input/block/completion;
- new proposal forbidden while another proposal remains unresolved;
- proposal role must match Run stage;
- completion stage must match Run stage;
- blocker owner must match Run stage.

A proposal-only turn is OPEN continuation with proposal attention. Messages/evidence/observations may accompany a valid controlling/open result where their own contracts permit.

### STATE-F03 — productive producer contract omits this batch grammar

**Verdict:** INCOMPLETE producer→consumer contract, release blocker.

Producer path:

- `stagePrompt` requests only a JSON array of canonical provider-emittable STAGE payloads plus stage work;
- `providerOutputContract("STAGE")` gives individual admitted tags, canonical JSON Schema and proposal diff formatting;
- `runOpenCodeTurn` parses `RunEventPayloadSchema.array()`;
- `validateProviderAdmission` validates individual event admission.

Consumer path:

- `persistAndReactStageBatch` later calls `validateStageProviderTurn` before any returned provider payload is persisted.

Thus an individually valid batch such as proposal + completion or proposal + required input is accepted by the producer-facing syntax/tag contract and rejected only after the provider turn finishes.

This exactly explains the observed failure:
`lifecycle proposal cannot coexist with a controlling event`.

**Required Phase 2 direction:** keep the closed consumer invariant; close the productive producer contract and producer→consumer certification.

## 6. Currentness, recovery and current-attention precedence

Material currentness remains only CURRENT or STALE(owner).

Recovery precedence:
1. stale material → RECONCILE_AUTHORITY;
2. WorkItem BLOCKED → RESUME_CURRENT_OWNER;
3. latest current-stage Run FAILED/CANCELLED/BLOCKED while WorkItem ACTIVE → RETRY_CURRENT_STAGE;
4. otherwise NONE.

Current-attention precedence in exact current source matches P3/P4:

1. CONVERGING
2. MUTATION_CONFLICT
3. REQUIRED_INPUT
4. PROPOSAL_DECISION
5. PROPOSAL_ADOPTION
6. BLOCKER
7. STALE_AUTHORITY
8. RECOVERY
9. PROCESSING
10. ACTIONABLE
11. ORDINARY

The permanent core test explicitly verifies stale currentness + RECONCILE_AUTHORITY → STALE_AUTHORITY.

**Verdict:** CORRECT. No stale-attention defect.

## 7. Execution owner, validation boundary and manual command scope

`deriveExecutionOwner` correctly derives current task ownership independently from historical selection:

1. blocked task → BLOCKED_TASK;
2. RUNNING/current active task → CURRENT_TASK;
3. next eligible TODO task with successful dependencies → CURRENT_TASK;
4. otherwise NONE.

`deriveValidationBoundary` likewise uses only the current task/candidate chain.

### STATE-F02 — task-local UI action invokes global unscoped coordinator work

**Verdict:** CONTRADICTORY operator/control-plane semantics, release blocker.

The Implementation UI presents a task-local current owner and a command equivalent to “Run next implementation step”, but:

~~~text
ui/src/http.ts::tick()
  -> POST /api/tick
  -> settings.runReadyCoordinatorTick(...)
  -> runCoordinatorTick(runtime, readyRepositoryRoots)
  -> currentRunningTask(...) or startEligibleTask(...) globally
~~~

No selected WorkItem id or ExecutionTask id is submitted.

Therefore the UI's visible `CURRENT_TASK(task A)` is not the scope of the command. Another globally runnable/current task can own the coordinator tick.

**Phase 2A obligation:** define the actual operator semantics of manual execution.  
**Phase 2B obligation:** make the command boundary match that functional decision.  
Phase 1 does not choose whether the future action becomes task-scoped, scheduler-scoped/renamed, relocated or removed.

## 8. Observation coherence and transport convergence

### 8.1 Pure semantic coherence

`deriveObservationCoherence` correctly detects loaded contradictions including:

- active STAGE Run belongs to a different WorkItem stage;
- active STAGE completion observed before WorkItem stage reaction;
- active STAGE block observed before WorkItem BLOCKED status;
- active execution Run without matching EXECUTION/RUNNING task;
- terminal execution Run while task remains RUNNING;
- RUNNING task without active Run;
- BLOCKED task while WorkItem still ACTIVE;
- EXECUTION/BLOCKED WorkItem without blocked task.

### 8.2 Browser transport barrier

The browser additionally suppresses mutation while several dependent observations are unavailable/refetching through `transportConverging`, including terminal drain, mutation refresh, missing initial collections, execution task/event fetch, stage-event fetch and sign-off package fetch.

### STATE-F04 — independent WorkItem/Run refetch can escape the convergence barrier for one render

**Verdict:** INCOMPLETE implementation + certification, high severity.

Evidence:

- `App` passes `selectedWorkItemFetching` into `WorkItemWorkspace`;
- `WorkItemWorkspace` declares that prop but never uses it;
- `runsQuery.isFetching` is not included in `transportConverging`;
- terminal drain is enabled in an effect after a render observes an active→terminal Run change.

Possible observation order:

~~~text
server atomically reacts:
  Run terminal + WorkItem stage/status updated

browser Runs query observes terminal first
  +
browser WorkItem prop still older
  +
terminalDrainPending still false until post-render effect
        |
        v
one render derives attention/action from mixed-generation facts
        |
        v
effect starts drain and later suppresses/refetches
~~~

The pure coherence function's STAGE completion/block mismatch branches examine the current Run while it is active; they do not cover every terminal-STAGE + older-WorkItem combination.

**Server safety:** daemon commit-time admission remains authoritative, so this does not prove invalid lifecycle mutation can commit. It does prove P3 `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` / P4 convergence presentation is not fully guaranteed.

**Do not fix by:** persisting an aggregate browser/workflow state.

## 9. Active-Run source/document authority exclusion

P3 `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` and P4 §4.7 require source/lifecycle Save only with **no active Run**.

Daemon enforcement is correct:

- WorkItem source/body save rejects while a Run is RUNNING/WAITING_FOR_INPUT;
- lifecycle artifact save rejects while any Run is active and rechecks transactionally;
- canonical bytes remain protected.

### STATE-F05 — browser still offers canonical source/document mutations while a Run is active

**Verdict:** INCOMPLETE browser admission, high severity.

Current browser predicates are:

~~~ts
mutationsDisabled =
  currentAttention === "CONVERGING";

documentMutationsDisabled =
  mutationsDisabled ||
  currentAttention === "MUTATION_CONFLICT";

workflowMutationsDisabled =
  documentMutationsDisabled ||
  (currentness.tag === "STALE" && !runs.some(runIsActive));
~~~

Neither document predicate directly disables writes for `runs.some(runIsActive)`.

Consequences:

- Work request Save receives `documentMutationsDisabled`;
- lifecycle document Save receives `workflowMutationsDisabled`;
- title edit/save, which mutates the Work request H1/source, is guarded by convergence but not the active-Run exclusion;
- archive is correctly stricter and explicitly checks active Runs.

So the browser can offer a command the daemon is guaranteed to reject.

**Required Phase 2 direction:** retain server recheck and make browser availability consume the same active-interaction fact; do not weaken the daemon exclusion.

## 10. Historical selection and inspection

Historical workflow-step/task/attempt/material selection is browser-local presentation state. Current attention, current stage, proposal ownership, execution owner, currentness and validation boundary are derived before historical selection and remain canonical.

Evidence/Context navigation uses explicit return origins but does not mutate lifecycle state.

**Verdict:** CORRECT.

## 11. Provider batch rejection outcome ambiguity

### STATE-F06 — P3 wording does not uniquely define Run state after a grammar-invalid provider batch

**Verdict:** CONTRADICTORY/AMBIGUOUS authority wording; Phase 2A decision required.

P3 §21.2 states provider/invocation failure results in a terminal FAILED Run at the same lifecycle stage.

P3 certification scenario 20 states a provider turn containing contradictory controlling events is rejected “without changing Run/WorkItem state.”

Current implementation:

1. returned payloads parse and pass individual role admission;
2. `validateStageProviderTurn` rejects the contradictory batch before any returned member is persisted;
3. `runStageTurn` catches the exception;
4. `failRunForProvider` persists PROVIDER_FAILED;
5. Run becomes FAILED / PROVIDER_FAILURE;
6. WorkItem remains at the same lifecycle stage.

So the invalid batch does **not** cause its requested proposal/input/block/completion effects, but the Run itself changes to FAILED.

Phase 1 will not infer which reading P3 intended. Phase 2A must make this observable failure semantic explicit; Phase 2B must then align failure classification and permanent certification.

## 12. Negative/impossible combination matrix

| Combination | Current handling | Verdict |
|---|---|---|
| multiple active Runs for one WorkItem | start/transaction guard | CORRECT |
| concurrent provider turns for one Run | serialized stage orchestration/input admission | CORRECT |
| free continuation while required input unresolved | rejects | CORRECT |
| stale/duplicate required-input answer | rejects | CORRECT |
| multiple unresolved proposals | rejects | CORRECT |
| proposal + input/block/completion same provider batch | consumer rejects | consumer CORRECT; producer incomplete F03 |
| duplicate input/block/completion controls | consumer rejects | CORRECT |
| proposal/completion/block owner differs from Run stage | rejects | CORRECT |
| adopted proposal without adoption intent | rejects | CORRECT |
| reject after adoption intent | rejects | CORRECT |
| Cancel while unresolved proposal exists | command permits terminalization | **CONTRADICTORY F01** |
| source/lifecycle write stale expected SHA | STALE/reject | CORRECT |
| source/lifecycle write during active Run | daemon rejects; browser may still offer | **INCOMPLETE F05** |
| signoff over stale package | recompute/reject | CORRECT |
| historical selection authorizes current action | not used as owner | CORRECT |
| execution active Run vs wrong/non-running task | CONVERGING/reject | CORRECT |
| terminal execution Run while task still RUNNING | CONVERGING | CORRECT |
| terminal STAGE observation + older WorkItem projection | not guaranteed to suppress first mixed render | **INCOMPLETE F04** |
| visible current task A + manual global tick starts B | reachable by scheduler scope | **CONTRADICTORY F02** |
| grammar-invalid batch leaves Run unchanged | authority wording not unique | **AMBIGUOUS F06** |
| COMPLETE WorkItem mutable transition | rejects | CORRECT |

## 13. Interaction-map cross-reference

| Interaction-map item | Required state | Verdict |
|---|---|---|
| `ACT-WI-007/008` inspection | local selection only | CORRECT |
| `ACT-WI-009/010/011/012` Start/Retry/Resume/Reconcile | lifecycle + recovery + attention | server CORRECT; browser observation affected by F04 |
| `ACT-DOC-003/004` canonical Markdown Save | expected hash + direct-edit eligibility + no active Run | server CLOSED; browser availability F05 |
| `ACT-ACT-001` Cancel | active Run + proposal/current attention | proposal closure F01 |
| `ACT-ACT-002/003` free/required input | exact StageRunInteraction | CORRECT |
| `ACT-PROP-001/002` proposal disposition | OPEN + PENDING exact proposal | CORRECT unless F01 created CLOSED+PENDING |
| `ACT-APPROVAL-003` signoff | current exact package + SIGN_OFF transition | CORRECT |
| `ACT-EXEC-003` Run next implementation step | WorkItem-local ExecutionOwner | command scope F02 |
| `ACT-EXEC-004/005` cancel/resume execution | active/block owner | CORRECT |
| `FLOW-X03` optimistic conflict | MUTATION_CONFLICT + refresh | CORRECT |
| `FLOW-X04/X05` source/stale authority | currentness + reconcile | CORRECT |
| `FLOW-X06/X07` retry/resume | recovery | CORRECT |
| `FLOW-X08` provider failure | provider failure + batch contract | F03/F06 |
| all transition-sensitive surfaces | coherent canonical observation | F04 |

## 14. Producer→consumer closure matrix

| Contract | Producer | Consumer | Verdict |
|---|---|---|---|
| human input | composer + current attention | `submitRunInput` + `stageInputIsAdmitted` | CLOSED |
| source Save | browser expected SHA/eligibility | daemon source mutation guard | **consumer closed; producer availability incomplete F05** |
| lifecycle doc Save | browser expected SHA/eligibility | daemon artifact mutation guard | **consumer closed; producer availability incomplete F05** |
| proposal disposition | ProposalReview/current history | daemon exact proposal/open-run guard | **not closed under Cancel F01** |
| signoff | displayed package hash | recomputed package/currentness | CLOSED |
| execution Resume | current BLOCKED_TASK | daemon exact blocked task/current Approval | CLOSED |
| manual execution advance | visible CURRENT_TASK | global coordinator tick | **not closed F02** |
| STAGE provider turn | prompt + individual payload schema/tag contract | whole-batch validator | **not closed F03** |
| canonical browser observation | independent query producers | current-attention/action projection | **not fully closed F04** |
| grammar-invalid provider failure outcome | P3 requirement/certification wording | daemon provider failure reaction | **authority ambiguous F06** |

## 15. Consolidated state findings

### STATE-F01 — unresolved proposal cancellation dead state
- **Severity:** release blocker.
- **Affected:** R1/R2/DESIGN/PLAN/R3 proposal flows.
- **Root:** P3/P4/P6 cancel/proposal transition closure.
- **Phase 2 owner:** 2A behavior + 2B exact admission/recovery contract.

### STATE-F02 — WorkItem-local execution owner vs global manual tick
- **Severity:** release blocker.
- **Affected:** Implementation current action.
- **Root:** functional command meaning/control-plane scope mismatch.
- **Phase 2 owner:** 2A manual-execution semantics, then 2B command boundary.

### STATE-F03 — STAGE producer/consumer grammar mismatch
- **Severity:** release blocker.
- **Affected:** all pre-signoff STAGE provider turns.
- **Root:** productive prompt/output contract and certification.
- **Phase 2 owner:** 2B after 2A confirms failure/interaction behavior.

### STATE-F04 — incomplete browser convergence barrier
- **Severity:** high.
- **Affected:** transition-sensitive action availability after asynchronous Run/WorkItem reaction.
- **Root:** browser canonical-observation reconciliation.
- **Phase 2 owner:** 2B Workbench projection/reconciliation design.

### STATE-F05 — active-Run browser authoring exclusion incomplete
- **Severity:** high.
- **Affected:** Work request/title and editable R1/R2/DESIGN/PLAN Markdown.
- **Root:** browser action admission differs from canonical/daemon exclusion.
- **Phase 2 owner:** 2A retains/changes functional exclusion; 2B aligns projection.

### STATE-F06 — invalid provider-batch failure outcome ambiguity
- **Severity:** medium but blocks exact Phase-2 contract closure.
- **Affected:** grammar-invalid STAGE provider response.
- **Root:** P3 §21.2 vs certification scenario wording.
- **Phase 2 owner:** 2A exact observable failure semantics.

## 16. Certification obligations carried to P1-T09

P1-T09 must distinguish existing positive tests from missing integrated proof:

1. consumer tests of `validateStageProviderTurn` do not prove the productive provider producer receives the same grammar;
2. browser tests must exercise Run/WorkItem refetch ordering, not only final converged states;
3. daemon active-Run write rejection does not prove the browser suppresses the same Save/title actions;
4. proposal/cancel certification must include the currently reachable canonical command state, not only normal UI visibility;
5. manual Implementation action must prove that visible current-owner semantics and actual command scope are identical;
6. invalid provider-batch test wording must be corrected before one permanent expected outcome can be authoritative.

## 17. P1-T06 completion verdict

**P1-T06: COMPLETE.**

The Phase-1 state fact set is now sufficient for downstream investigation:

- canonical state owners and transitions are mapped;
- the normal lifecycle relation is closed;
- STAGE interaction/input/proposal state is mapped;
- currentness/recovery/current-attention precedence is confirmed;
- execution owner/validation state is mapped independently from historical selection;
- impossible/contradictory combinations are enumerated;
- browser/daemon/core ownership is explicit;
- five concrete end-to-end closure defects and one P3 semantic ambiguity are isolated without inventing replacement behavior.

P1-T07 must now determine the exact pinned OpenCode/session/observability facts behind agent interaction and failure recovery. P1-T08 must consume STATE-004/005 plus STATE-F01/F05 when auditing document/material maturity.
