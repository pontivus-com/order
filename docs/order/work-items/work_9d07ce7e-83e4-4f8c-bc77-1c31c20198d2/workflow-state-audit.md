# Phase 1 workflow/state audit

**Status:** P1-T06 complete  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Branch:** `version/0.5.0`  
**Consumes:** `application-interaction-map.md` through P1-T05  
**Governing authority:** `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-WORKBENCH-UX-V2`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-CANONICAL-CONTRACTS-V1`

## 1. Purpose and verdict

This audit derives the current workflow/state model from the complete user-interaction map and tests whether every mapped UI condition/action is explainable by one canonical state predicate and one admitted transition.

The current implementation already has the correct **orthogonal-state architecture**. It does not reduce the product to one overloaded `WorkItem.stage` value. The browser-safe pure owner in `src/core/lifecycle.ts` separately derives:

- lifecycle position and reached history;
- STAGE Run interaction;
- lifecycle proposal decision state;
- material currentness;
- execution owner;
- validation boundary;
- recovery disposition;
- observation coherence;
- current attention;
- workflow-rail summary.

That decomposition is consistent with FCIS, SoC, semantic DRY and the no-duplicate-state requirement.

However, the state/control system is **not closed end-to-end**. P1-T06 confirms three material defects:

1. **STATE-F01 — unresolved proposal can be terminalized by Cancel, producing a dead proposal state.**
2. **STATE-F02 — task-local Implementation action invokes an unscoped global coordinator tick, so UI current ownership is not the command scope.**
3. **STATE-F03 — STAGE provider producer contract does not state the closed batch grammar enforced by the consumer, allowing individually valid provider payloads to fail the productive turn after provider completion.**

STATE-F01 also exposes a contradiction in current P4 authority: the action-admission matrix admits Cancel for any active `OPEN` STAGE Run, while the proposal statechart defines `OPEN + PENDING(P)` as a subordinate proposal state whose resolution requires that same Run to remain OPEN.

## 2. State-owner map

| STATE | Semantic owner | Canonical inputs | Persisted separately? | UI use | Verdict |
|---|---|---|---|---|---|
| STATE-001 WorkItem lifecycle | `transitionWorkItem`, `evaluateStageCompletion` | `WorkItem.stage/status/outcome` + one `WorkItemTransitionCause` | WorkItem lifecycle fields only | current lifecycle step/action eligibility | CORRECT |
| STATE-002 reached history | `deriveReachedStages`, `reachStateForStage` | WorkItem + Runs + RunEvents + ArtifactRefs + ExecutionTasks | no | rail reached/current/unreached | CORRECT |
| STATE-003 STAGE interaction | `stageRunInteraction` | one STAGE Run + ordered RunEvents | no | PROCESSING / OPEN / REQUIRED_INPUT / CLOSED | CORRECT |
| STATE-004 proposal decision | `deriveProposalDecision` | proposal/adoption/disposition RunEvents | no | proposal current action and adoption progress | CORRECT derivation; transition closure defect STATE-F01 |
| STATE-005 material currentness | `normalizeMaterialCurrentness` | typed currentness result + changed-material owner(s) | no | current/stale + reconcile owner | CORRECT |
| STATE-006 recovery | `deriveRecoveryDisposition` | WorkItem + current-stage Runs + material currentness | no | retry/resume/reconcile | CORRECT |
| STATE-007 execution owner | `deriveExecutionOwner` | selected WorkItem's ExecutionTasks + Runs | no | current/blocked task attention | CORRECT derivation; command-scope defect STATE-F02 |
| STATE-008 validation boundary | `deriveValidationBoundary` | execution owner + task Runs + RunEvents | no | current validation state | CORRECT |
| STATE-009 observation coherence | `deriveObservationCoherence` | WorkItem + Runs + events + tasks | no | transient suppression during dependent-observation convergence | CORRECT |
| STATE-010 current attention | `deriveCurrentAttention` | coherence, conflict, interaction, proposal, blocker, currentness, recovery, execution owner, automatic work | no | one current action/attention owner | CORRECT |
| STATE-011 rail marker | `deriveWorkflowRail` | WorkItem + reached + current attention + recovery + selected stage | no | nine-stage lifecycle summary only | CORRECT |

No new persisted workflow-state model is justified by the evidence.

## 3. Lifecycle transition matrix

The following is the current closed WorkItem lifecycle relation implemented by `transitionWorkItem`.

| Current condition | Cause | Result | Interaction-map relation | Verdict |
|---|---|---|---|---|
| IDEA / ACTIVE | START_RESEARCH | R1 / ACTIVE | FLOW-003 / ACT-STAGE-001 | CORRECT |
| R1 / ACTIVE | STAGE_COMPLETED(CONFIRMED) | R2 / ACTIVE | FLOW-004 | CORRECT |
| R1 / ACTIVE | schema-valid terminal outcome | COMPLETE / COMPLETE / outcome | FLOW-004, FLOW-008 | CORRECT |
| R2 / ACTIVE | STAGE_COMPLETED | DESIGN / ACTIVE | FLOW-004 | CORRECT |
| DESIGN / ACTIVE | STAGE_COMPLETED | PLAN / ACTIVE | FLOW-004 | CORRECT |
| PLAN / ACTIVE | STAGE_COMPLETED | R3 / ACTIVE | FLOW-004 | CORRECT |
| R3 / ACTIVE | READY_FOR_SIGNOFF | AWAITING_SIGNOFF / ACTIVE | FLOW-006 | CORRECT |
| R3 / ACTIVE | RETURN_TO_RESEARCH | R1 / ACTIVE | backward flow | CORRECT |
| R3 / ACTIVE | RETURN_TO_REQUIREMENTS | R2 / ACTIVE | backward flow | CORRECT |
| R3 / ACTIVE | RETURN_TO_DESIGN | DESIGN / ACTIVE | backward flow | CORRECT |
| R3 / ACTIVE | RETURN_TO_PLAN | PLAN / ACTIVE | backward flow | CORRECT |
| IDEA source mutation | SOURCE_AUTHORITY_CHANGED | IDEA / ACTIVE | ACT-DOC-002 | CORRECT |
| progressed pre-signoff/AWAITING_SIGNOFF source mutation | SOURCE_AUTHORITY_CHANGED | R1 / ACTIVE | FLOW-005/X04 | CORRECT |
| COMPLETE source mutation | SOURCE_AUTHORITY_CHANGED | COMPLETE unchanged | historical integrity diagnostic | CORRECT |
| reached lifecycle artifact mutation | LIFECYCLE_ARTIFACT_CHANGED(owner) | owner / ACTIVE | ACT-DOC-003 / proposal adoption | CORRECT |
| current ACTIVE owner | BLOCK_CURRENT_OWNER | same stage / BLOCKED | FLOW-X03 | CORRECT |
| current BLOCKED owner | RESUME_CURRENT_OWNER | same stage / ACTIVE | ACT-STAGE-002 / ACT-EXEC-004 | CORRECT |
| AWAITING_SIGNOFF / ACTIVE | SIGN_OFF | EXECUTION / ACTIVE | ACT-APR-004 | CORRECT |
| AWAITING_SIGNOFF / ACTIVE | RECONCILE_AUTHORITY(owner) | owner / ACTIVE | FLOW-X04/X07 | CORRECT |
| EXECUTION | EXECUTION_RETURN(owner) | owner / ACTIVE | classified execution failure | CORRECT |
| EXECUTION | EXECUTION_COMPLETED(CANDIDATE_DONE/ALREADY_SATISFIED) | COMPLETE / COMPLETE | FLOW-007 | CORRECT |

Unlisted stage/status/cause combinations reject.

### 3.1 Reached-history law

`deriveReachedStages` correctly keeps lifecycle position separate from history. It derives reached stages from canonical evidence including Runs, lifecycle artifacts, STAGE completion destinations and ExecutionTasks. A backward return does not erase downstream reached history.

This satisfies `GW-FR-205-MONOTONIC-REACH-HISTORY` and prevents the UI from using ordinal `selectedStage < currentStage` logic as history authority.

## 4. STAGE Run interaction and proposal matrix

### 4.1 Run interaction

| Run/event condition | Derived interaction | Allowed human action | Verdict |
|---|---|---|---|
| RUNNING + exactly one STAGE_STARTED + no result after latest trigger | PROCESSING | none | CORRECT |
| RUNNING + provider result exists, no terminal control, no unresolved input | OPEN | free continuation unless proposal owns attention | CORRECT |
| WAITING_FOR_INPUT + exactly one unresolved request | REQUIRED_INPUT(Q) | exact response bound to Q | CORRECT |
| COMPLETED/BLOCKED/FAILED/CANCELLED | CLOSED | no continuation/input | CORRECT |
| RUNNING + unresolved required input | invalid history | reject/throw | CORRECT |
| WAITING_FOR_INPUT without unresolved request | invalid history | reject/throw | CORRECT |
| active STAGE Run with STAGE_BLOCKED/STAGE_COMPLETED already in event history | invalid/converging history | mutation suppressed until dependent owner converges | CORRECT |

`stageInputIsAdmitted` is exact:
- OPEN accepts only `requestEventId=null`;
- REQUIRED_INPUT accepts only the exact current request id;
- PROCESSING/CLOSED accept nothing.

Browser `ActivityWorkspace` and daemon `submitRunInput` consume the same derivation, and the daemon repeats admission at commit time.

### 4.2 Proposal state

| Event history | ProposalDecision | Required current action |
|---|---|---|
| no unresolved proposal | NONE | normal OPEN continuation may apply |
| exactly one proposal, no disposition/adoption intent | PENDING(P) | Adopt or Reject P |
| proposal + durable adoption intent, no disposition | ADOPTION_IN_PROGRESS(P) | wait/reconcile exact adoption |
| disposition ADOPTED after adoption intent | NONE | OPEN continuation after context re-resolution |
| disposition REJECTED and no adoption intent | NONE | OPEN continuation |

The derivation rejects:
- proposal controls for unknown proposals;
- control before proposal;
- duplicate disposition;
- duplicate adoption intent;
- ADOPTED without adoption intent;
- REJECTED with adoption intent;
- multiple unresolved proposals.

### 4.3 STATE-F01 — Cancel can strand an unresolved proposal

**Canonical facts:**

1. P3 proposal statechart defines `OPEN + PENDING(P)` and `OPEN + ADOPTION_IN_PROGRESS(P)`.
2. P3 current-attention precedence gives `PROPOSAL_DECISION` / `PROPOSAL_ADOPTION` higher priority than ordinary actions.
3. P4 action-admission matrix currently states: “Cancel STAGE Run — current Run active in PROCESSING/OPEN/REQUIRED_INPUT”.
4. `src/daemon/coordinator.ts::cancelRunUnlocked` checks only active Run status; it does not reject unresolved proposal/adoption state.
5. `stageRunInteraction` maps CANCELLED to CLOSED.
6. `deriveProposalDecision` derives proposal state solely from proposal-control events and still returns PENDING/ADOPTION_IN_PROGRESS for a closed Run.
7. WorkItem UI derives `proposalDecision` from the latest current-stage Run even when that Run is terminal, therefore the proposal remains the current attention owner.
8. Proposal Adopt/Reject daemon admission requires the Run interaction to be OPEN.

**Resulting reachable contradiction:**

~~~text
RUNNING + OPEN + PENDING(P)
        |
        | Cancel through canonical HTTP/daemon command
        v
CANCELLED + CLOSED + PENDING(P)
        |
        +--> UI derives PROPOSAL_DECISION
        +--> Adopt rejects because Run is not OPEN
        +--> Reject rejects because Run is not OPEN
        +--> input rejects because CLOSED
        +--> proposal remains unresolved
~~~

The ordinary UI currently suppresses Cancel while proposal attention owns the surface, which reduces normal-browser reachability but does not close the canonical command/state algebra. The HTTP command and daemon function remain valid for the state.

**Verdict:** `CONTRADICTORY`, release-blocking.  
**Minimum authority impact:** P3/P4/P6 behavior must be made internally closed in Phase 2; implementation-only patching is insufficient because current P4 explicitly admits Cancel for OPEN without excluding proposal ownership.

## 5. Provider-turn closed grammar

`validateStageProviderTurn` is a strong consumer-side batch validator.

For one RUNNING/PROCESSING STAGE provider turn:

- payload array must be non-empty;
- maximum one HUMAN_INPUT_REQUESTED;
- maximum one STAGE_BLOCKED;
- maximum one STAGE_COMPLETED;
- input/block/completion are mutually exclusive;
- maximum one lifecycle proposal;
- a lifecycle proposal cannot coexist with input/block/completion;
- a new proposal is forbidden while an unresolved proposal already exists;
- proposal role must equal Run stage;
- STAGE_COMPLETED stage must equal Run stage;
- STAGE_BLOCKED owner must equal Run stage.

This correctly implements the consumer-side intent of `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` and `GW-TR-084-STAGE-TURN-BATCH-ATOMICITY`.

### 5.1 Provider-turn matrix

| Proposal | Input request | Block | Completion | Valid? |
|---:|---:|---:|---:|---|
| 0 | 0 | 0 | 0 | yes, if batch contains at least one admitted non-control event |
| 0 | 1 | 0 | 0 | yes |
| 0 | 0 | 1 | 0 | yes |
| 0 | 0 | 0 | 1 | yes |
| 1 | 0 | 0 | 0 | yes, iff no prior unresolved proposal and role matches |
| 1 | 1 | 0 | 0 | **no** |
| 1 | 0 | 1 | 0 | **no** |
| 1 | 0 | 0 | 1 | **no** |
| 0 | 1 | 1 | 0 | **no** |
| 0 | 1 | 0 | 1 | **no** |
| 0 | 0 | 1 | 1 | **no** |
| any duplicate control | — | — | — | **no** |
| >1 proposal | — | — | — | **no** |

### 5.2 STATE-F03 — producer contract does not state the closed batch grammar

The productive producer path does not provide the model with the consumer grammar above.

Current producer instructions:

- `stagePrompt` says only: return a JSON array of canonical provider-emittable STAGE `RunEventPayload` values, plus output-path and stage content requirements.
- `providerOutputContract("STAGE")` lists admitted individual event tags and canonical JSON Schema and gives proposal unified-diff formatting guidance.
- `parseCanonicalProviderEvents` and provider admission validate individual payload syntax/tag admission.
- only later does `persistAndReactStageBatch` call `validateStageProviderTurn` and reject invalid cross-event combinations.

Therefore a provider can emit individually schema-valid/admitted events such as:

~~~text
ARTIFACT_PROPOSAL_CREATED + STAGE_COMPLETED
~~~

or:

~~~text
ARTIFACT_PROPOSAL_CREATED + HUMAN_INPUT_REQUESTED
~~~

and only discover the illegal combination after the OpenCode turn completes.

This is the proven mechanism behind the observed runtime failure:

`lifecycle proposal cannot coexist with a controlling event`.

**Verdict:** `INCOMPLETE producer→consumer contract`, release-blocking.  
**Authority:** current P3/P4 consumer semantics are directionally correct; producer-side technical contract/certification is incomplete. Phase 2B must close the producer→carrier→consumer contract without weakening the validator.

## 6. Material currentness, recovery and current attention

### 6.1 Material currentness

`normalizeMaterialCurrentness` correctly represents only:

- CURRENT
- STALE(owner)

The owner is the earliest governing upstream stage from typed changed-material owners. It does not invent another persisted currentness status.

### 6.2 Recovery

`deriveRecoveryDisposition` precedence:

1. stale material -> RECONCILE_AUTHORITY;
2. WorkItem BLOCKED -> RESUME_CURRENT_OWNER;
3. latest current-stage Run FAILED/CANCELLED/BLOCKED while WorkItem ACTIVE -> RETRY_CURRENT_STAGE;
4. otherwise NONE.

This matches the current closed recovery vocabulary.

### 6.3 Current attention precedence

Current implementation exactly follows the declared ordering:

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

This is structurally correct because a lower-priority action cannot become primary while a higher-priority owner exists.

STATE-F01 is notable precisely because it creates a logically impossible **high-priority proposal owner whose required action is no longer admissible**.

## 7. Execution owner and validation-state derivation

### 7.1 Execution owner

`deriveExecutionOwner` is WorkItem-local and follows:

1. BLOCKED task -> BLOCKED_TASK(task);
2. RUNNING task -> CURRENT_TASK(task);
3. active execution Run's task -> CURRENT_TASK(task);
4. first TODO task whose dependencies are all successful -> CURRENT_TASK(task);
5. otherwise NONE.

Historical explicit task selection is not part of this derivation.

**Verdict:** state derivation is CORRECT.

### 7.2 STATE-F02 — current execution owner is not the command scope

The UI uses the WorkItem-local `ExecutionOwner` to render ACT-EXEC-005 “Run next implementation step”.

But `ui/src/http.ts::tick()` sends only:

~~~text
POST /api/tick
{}
~~~

The daemon's `runCoordinatorTick` then chooses global current/runnable work across configured repository roots. The visible `WorkItem.id`, `ExecutionTask.id` and derived `CURRENT_TASK(task)` are not command inputs.

Thus:

~~~text
selected WorkItem A
  -> deriveExecutionOwner(A) = CURRENT_TASK(A1)
  -> UI says "Run next implementation step"
  -> POST /api/tick
  -> daemon may admit globally selected runnable task B1
~~~

This violates the semantic expectation that a task-local command performs the action whose owner is visibly selected/current. It also undermines `GW-FR-003-DURABLE-BOUNDED-EXECUTION` from the operator boundary even though the scheduler itself remains bounded to an approved task.

**Verdict:** `CONTRADICTORY`, release-blocking.  
**Minimum authority impact:** Phase 2A must decide the intended operator semantics of manual execution; Phase 2B must align the control boundary accordingly. Phase 1 does not choose whether the eventual action is task-scoped, scheduler-scoped, renamed, relocated or removed.

### 7.3 Validation boundary

`deriveValidationBoundary` is correctly tied to the current execution owner and its current candidate chain.

It:

- uses current task Runs only;
- handles the latest own validation failure;
- treats candidate recording as a new current-candidate boundary;
- requires REMEDIATOR failure trigger to belong to same current task;
- requires REVIEWER candidate trigger from BUILDER/REMEDIATOR of same task;
- derives reviewer validation only from reviewer Runs for the same candidate.

Historical task selection cannot become validation authority.

**Verdict:** CORRECT.

## 8. Observation coherence and asynchronous transition closure

`deriveObservationCoherence` correctly marks CONVERGING only when already-loaded canonical facts expose a controlling reaction not yet reflected by the dependent owner, including:

- active STAGE Run for a different stage than current WorkItem;
- STAGE_COMPLETED observed before WorkItem stage changes;
- STAGE_BLOCKED observed while WorkItem remains ACTIVE;
- active execution Run not aligned with EXECUTION/RUNNING task;
- RUNNING task without active Run;
- BLOCKED task while EXECUTION WorkItem still ACTIVE;
- EXECUTION/BLOCKED WorkItem without BLOCKED task.

The browser additionally treats query/refetch pending as transport convergence and suppresses mutations until the canonical observation is coherent.

**Verdict:** CORRECT and consistent with `GW-FR-210` / `GW-TR-088`.

## 9. Interaction-map cross-reference

| Interaction-map item | Required state proposition | State verdict |
|---|---|---|
| FLOW-003 Start Research | STATE-001 lifecycle + STATE-010 attention | CORRECT |
| FLOW-004 interactive loop | STATE-003 interaction + STATE-004 proposal + STATE-010 attention | CORRECT except STATE-F01/STATE-F03 |
| ACT-ACTIVITY-002 input | STATE-003 exact input ownership | CORRECT |
| ACT-PROP-002/003 proposal disposition | STATE-003 OPEN + STATE-004 PENDING | **CONTRADICTORY when Cancel created CLOSED+PENDING** |
| ACT-DOC-002/003 direct Save | STATE-001 lifecycle + active-Run exclusion + material owner | CORRECT |
| FLOW-X03 retry/resume | STATE-006 recovery | CORRECT |
| FLOW-X04/X07 stale authority | STATE-005 currentness + STATE-006 reconcile | CORRECT |
| ACT-APR-004 Sign off | STATE-001 exact AWAITING_SIGNOFF + package currentness | CORRECT |
| ACT-EXEC-004 execution resume | STATE-007 BLOCKED_TASK + current material | CORRECT |
| ACT-EXEC-005 next implementation step | STATE-007 CURRENT_TASK | **state correct, command scope contradictory STATE-F02** |
| workflow rail | STATE-002 reach + STATE-010 attention | CORRECT |
| historical selection | local presentation only | CORRECT |

## 10. Impossible/contradictory-combination audit

| Combination | Intended status | Current enforcement |
|---|---|---|
| two active Runs for one WorkItem | impossible | rejected at stage start/commit and mutation guards |
| RUNNING STAGE with unresolved required input | impossible | `stageRunInteraction` rejects |
| WAITING_FOR_INPUT without exact unresolved request | impossible | rejects |
| two unresolved proposals in one Run | impossible | `deriveProposalDecision` / provider-turn validator reject |
| proposal + input/block/completion in one provider batch | impossible | consumer rejects; **producer contract incomplete STATE-F03** |
| proposal role != Run stage | impossible | provider-turn + proposal disposition reject |
| active source/document Save during Run | impossible | browser suppresses; daemon rejects/rechecks |
| stale expected source/artifact hash silently overwrites | impossible | STALE result |
| AWAITING_SIGNOFF sign-off over changed package | impossible | recomputed package/hash/bytes reject |
| historical task becomes execution owner | impossible | execution owner ignores selection |
| multiple blocked execution tasks for resume | invalid for resume | daemon requires exactly one |
| CLOSED STAGE Run + unresolved proposal | **should be impossible or explicitly recoverable** | **currently reachable through Cancel; dead state STATE-F01** |
| task-local current owner + global unscoped manual command | **semantic contradiction** | **currently reachable STATE-F02** |

## 11. State/UI mismatch findings

### STATE-F01 — terminal proposal dead state

- **Affected:** ACT-PROP-002/003, FLOW-X05, R1/R2/DESIGN/PLAN/R3 current proposal states.
- **Root boundary:** P3/P4 cancel/proposal algebra plus daemon Cancel admission.
- **Severity:** release blocker.
- **Classification:** missing/contradictory P3/P4/P6 state transition closure.
- **Phase 2 decision:** define one coherent proposal-vs-cancel behavior; do not solve locally in UI.

### STATE-F02 — execution owner/control-scope mismatch

- **Affected:** ACT-EXEC-005, FLOW-007, Implementation.
- **Root boundary:** UI command semantics vs global coordinator scheduler command.
- **Severity:** release blocker.
- **Classification:** functional/control-plane ambiguity plus technical boundary mismatch.
- **Phase 2 decision:** Phase 2A defines what manual operator action means; Phase 2B defines matching command ownership.

### STATE-F03 — STAGE producer/consumer batch-contract mismatch

- **Affected:** every R1/R2/DESIGN/PLAN/R3 provider turn; observed provider failure.
- **Root boundary:** `stagePrompt` / `providerOutputContract` producer contract vs `validateStageProviderTurn` consumer.
- **Severity:** release blocker.
- **Classification:** missing P4/P6 producer contract/certification; current consumer invariant should remain.
- **Phase 2 decision:** technical design must close the productive producer→carrier→consumer grammar and proof.

## 12. Producer→consumer contract closure verdicts

| Contract | Producer | Consumer | Verdict |
|---|---|---|---|
| human input OPEN/REQUIRED_INPUT | Activity composer/current-attention derivation | `submitRunInput` + `stageInputIsAdmitted` | CLOSED |
| direct source Save | Markdown Workbench expected SHA | source daemon revalidation/write | CLOSED |
| lifecycle doc Save | artifact editability + expected SHA | coordinator artifact save | CLOSED |
| proposal disposition | ProposalReview current local event history | daemon `requireCurrentProposalDecision` | **NOT CLOSED because Cancel can preserve unresolved proposal after Run closes** |
| sign-off | current displayed package hash | recomputed package/material/baseline | CLOSED |
| execution Resume | current BLOCKED_TASK | daemon exact blocked task + fresh Approval | CLOSED |
| manual execution advance | WorkItem-local CURRENT_TASK | global scheduler tick | **NOT CLOSED** |
| STAGE provider turn | prompt + individual payload schema/tag contract | closed batch validator | **NOT CLOSED** |

## 13. P1-T06 completion verdict

**P1-T06: COMPLETE.**

The audit establishes:

- the current derived state vocabulary is structurally appropriate and should not be replaced by a new persisted aggregate state machine;
- the normal WorkItem lifecycle relation is closed and largely correctly implemented;
- required-input, currentness, recovery, reached-history, current-attention and validation-boundary derivations are sound;
- three release-blocking end-to-end closure defects remain: STATE-F01, STATE-F02 and STATE-F03;
- STATE-F01 requires authority correction because current P4 itself admits the contradictory Cancel condition;
- STATE-F02 requires a Phase 2 functional decision before technical resolution;
- STATE-F03 requires producer-contract/certification closure, not a weakened consumer invariant.

P1-T07 may now consume this state audit to evaluate the OpenCode execution/session/transparency boundary. P1-T08 must consume STATE-004/005 and STATE-F01 when auditing document/material maturity.
