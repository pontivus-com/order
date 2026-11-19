# Phase 1 OpenCode interaction and transparency audit

**Status:** P1-T07 complete  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Branch:** `version/0.5.0`  
**Consumes:** `application-interaction-map.md` through P1-T05 and `workflow-state-audit.md`  
**Governing authority:** `GW-DOC-OPENCODE-INTEGRATION-V1`, `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-WORKBENCH-UX-V2`, `GW-DOC-CANONICAL-CONTRACTS-V1`

## 1. Purpose and overall verdict

This audit establishes what the pinned OpenCode integration actually does, what Order currently persists/presents, what additional provider facts the exact pinned integration can expose, and which facts cannot be treated as reliable product truth without a deliberate P4/P6 change.

The current integration is **authority-bounded and operationally conservative**, but it is too opaque for the 0.5.0 product objective if the operator is expected to understand meaningful agent activity while work is processing.

The important factual boundary is:

~~~text
canonical Order context
        |
        v
OpenCode session + exact model + permissions
        |
        v
serialized provider turn
        |
        +--> provider-internal execution/tool activity
        |
        v
terminal session projection
        |
        v
session.context
        |
        v
Order extracts final assistant TEXT only
        |
        v
canonical RunEventPayload[]
        |
        v
Order RunEvents / state / UI
~~~

Order therefore currently exposes the **Order-semantic result of the agent turn**, not the provider's operational activity during the turn.

## 2. Pinned integration facts

| OC | Fact | Evidence | Verdict |
|---|---|---|---|
| OC-001 | productive OpenCode is exact pinned server/client v2.2.6 | P4 integration standard + external-facts pin | FACT |
| OC-002 | provider is a private foreground loopback process owned by Order | `opencode serve --hostname 127.0.0.1 --port 0`, private HOME/XDG/database | FACT |
| OC-003 | embedded OpenCode web UI is not an Order product surface | private listener is never forwarded/linked by Order | FACT |
| OC-004 | OpenCode is not lifecycle/task/approval/completion authority | explicit P4 ownership rule | FACT |
| OC-005 | every Order Run begins with a fresh OpenCode session | integration §4 | FACT |
| OC-006 | STAGE may reuse one session across turns only under the same Run/stage/context/model/permissions/material identity | integration §4 + `stageMaterialIdentity` | FACT |
| OC-007 | BUILDER/REVIEWER/REMEDIATOR role boundaries use fresh sessions | integration §4 and execution orchestration | FACT |
| OC-008 | exact model and permission rules are installed/read back before prompt admission | `createBoundOpenCodeSession` | FACT |
| OC-009 | productive prompts are serialized and correlated by deterministic prompt id | integration §7 + shell implementation | FACT |
| OC-010 | current completion authority is terminal `Session.Info.time.idle/outcome`, not provider event streaming | integration §8 + `runPromptToText` | FACT |

## 3. Productive role/context path

### 3.1 STAGE

~~~text
WorkItem + source + resolved lifecycle authority
        |
        v
resolveStageContextState
        |
        v
materialize admitted inspection workspace
        |
        v
admitProductiveOpenCode(STAGE)
  - exact account/model
  - exact permissions
  - exact references/instructions
        |
        v
stagePrompt
        |
        v
runOpenCodeTurn
        |
        v
canonical provider payloads
        |
        v
validateStageProviderTurn
        |
        v
persist + lifecycle reaction
~~~

STAGE receives read/glob/grep in the admitted provider workspace and exact configured external reference roots under read-only external-directory permission. It does not receive provider edit authority for canonical lifecycle documents; proposed mutation remains the Order proposal/adoption boundary.

### 3.2 BUILDER

BUILDER receives the signed ExecutionTask and resolved approved authority. It may edit only exact signed `changeSurface` paths and may read/glob/grep the admitted target workspace. Shell/execute, arbitrary external mutation, web and schedule capabilities are not ambient provider capabilities.

The coordinator, not OpenCode, owns checkout creation, candidate capture, changed-path verification and execution state.

### 3.3 REVIEWER

REVIEWER receives the replayed candidate, signed task, authority and mechanical validation evidence. It is read-only and emits REVIEW_PASSED/REVIEW_FAILED canonical events. Candidate replay/verification and later validation stages remain Order-owned.

### 3.4 REMEDIATOR

REMEDIATOR is a new Run/session against a reconstructed candidate and one proven triggering failure. Its mutation boundary remains the signed `changeSurface`.

## 4. Session continuity, loss and restart

| Condition | Current behavior | Verdict |
|---|---|---|
| ordinary next STAGE turn with unchanged context/material identity | reuse active provider session | CORRECT |
| context hash changes after human input/adoption | stop active provider; clear providerSessionId; next turn creates replacement session | CORRECT |
| project HEAD/material identity changes during active STAGE session | fail PRECONDITION_FAILED; do not silently continue | CORRECT |
| terminal STAGE Run | provider stopped | CORRECT |
| execution role turn | fresh role-specific session | CORRECT |
| provider process loss during post-signoff role | current Run fails under bounded operational policy; no hidden provider resumption | CORRECT |
| daemon restart with persisted RUNNING Run | `recoverInterruptedRuns` marks Run FAILED / COORDINATOR_INTERRUPTED unless exact mutating-candidate reconciliation succeeds | CORRECT |
| later retry after interruption | new Order Run/session reconstructs from current canonical state | CORRECT |

**OC-F05:** session/restart semantics are bounded and do not make OpenCode conversation hidden workflow authority.

## 5. What Order currently observes from OpenCode

### 5.1 Released session projection used by Order

Current `runPromptToText`:

1. reads `session.get`;
2. admits `session.prompt`;
3. polls `session.get` until `time.idle` advances;
4. requires terminal `outcome === succeeded`;
5. reads `session.context`;
6. locates the completed assistant message after the admitted prompt;
7. concatenates only assistant content parts whose `type === "text"`.

The semantic parser therefore **discards provider assistant tool/reasoning parts** and only parses the final assistant text into canonical Order RunEventPayload values.

### 5.2 What Order persists

Order persists:

- Run role/stage/attempt/status/timestamps;
- providerSessionId while material;
- canonical RunEvents produced from admitted provider output;
- canonical failure events such as PROVIDER_FAILED or PRODUCTIVE_INVOCATION_FAILED;
- bounded EvidenceRefs;
- one ProviderDiagnosticRecord per provider turn;
- optional bounded provider stderr evidence.

The ProviderDiagnosticRecord contains:

- provider/model id;
- provider session id;
- prompt id;
- start/end time;
- outcome;
- format-repair attempted/succeeded;
- failure phase;
- redacted exception message.

### 5.3 Current product-visible versus technical information

**Current product-facing:**

- Order Run role/attempt/status;
- Processing / Waiting for you / failed / blocked / completed semantics;
- AGENT_MESSAGE_FINAL;
- HUMAN_INPUT_REQUESTED;
- proposals/disposition;
- stage blockers/completions;
- review/validation outcomes;
- provider failure as an Order failure event;
- evidence resources explicitly attached to canonical events.

**Current technical/on-demand:**

- Run id;
- raw stage/role/status;
- baseline commit;
- context hash;
- provider session id;
- terminal classification;
- raw RunEvent tag/payload JSON;
- ProviderDiagnosticRecord;
- stderr.

**Not currently persisted/projected as product activity:**

- provider tool calls;
- tool running/completed/failed state;
- tool input/output/metadata;
- provider step boundaries;
- provider retry events;
- provider file-read/edit activity as an activity feed;
- provider reasoning.

## 6. Exact capabilities of pinned OpenCode v2.2.6

Phase 1 verified these directly from the immutable `anomalyco/opencode@v2.2.6` source.

### 6.1 Released `session.context`

The released session context contains typed assistant content:

- `text`;
- `reasoning`;
- `tool`.

A tool part includes:

- tool id/name;
- executed flag where present;
- status: streaming/running/completed/error;
- input;
- result content where completed;
- error/content where failed;
- optional metadata/native values;
- created/ran/completed times.

The assistant message also carries agent/model identity, snapshots/files where present, finish state, retry, cost/token and timing data.

**Fact:** the exact current provider can expose richer **post-turn** activity through a released API without an OpenCode upgrade.

**Constraint:** raw tool input/content/native metadata can contain sensitive, irrelevant or unbounded information. Their availability is not evidence that Order should render them directly.

### 6.2 Global event stream

`GET /api/event` is an experimental SSE stream.

The pinned provider explicitly describes it as **volatile**:
- a slow consumer can overflow/fail;
- events during disconnection are missed.

It is therefore not suitable as the sole correctness/history source for a product activity model.

### 6.3 Experimental durable session log

The pinned provider also exposes an experimental durable session event log:
`GET /api/experimental/session/:sessionID/log`.

Durable events include, among others:

- execution started/succeeded/failed/interrupted;
- step started/streamed/ended/failed;
- text start/end;
- reasoning start/end;
- tool input start/end;
- tool called/success/failed;
- retry scheduled;
- compaction/instruction/skill activity.

Some deltas/progress remain ephemeral.

**Fact:** the pin provides a richer durable provider event source.

**Constraint:** it is experimental and not part of Order's current authorized correctness contract. Using it productively requires explicit P4/P6 integration and certification work.

### 6.4 Released session diff

The pinned released `session.diff` can return structured per-file diffs by turn.

Order currently does not use it as its mutation/evidence authority; post-signoff candidate state is captured and verified through Order's own workspace/evidence boundary.

## 7. Operator-relevant transparency capability matrix

This table is factual input to Phase 2A. “Candidate” means the fact can materially help the operator; it is **not** a decision that it must be shown.

| OC | Fact/activity | Current reliable source | Currently shown? | Capability status | Phase 2 classification question |
|---|---|---|---|---|---|
| OC-020 | owning Order role/agent class | Run.role | yes | reliable/persisted | likely product-visible; final hierarchy is Phase 2A |
| OC-021 | Order processing/waiting/open/closed interaction | Run + RunEvents pure derivation | yes | reliable/persisted | product-visible |
| OC-022 | final agent message | AGENT_MESSAGE_FINAL | yes | reliable/persisted | product-visible |
| OC-023 | required human question | HUMAN_INPUT_REQUESTED | yes | reliable/persisted | product-visible/current action |
| OC-024 | proposal creation/disposition | canonical RunEvents | yes | reliable/persisted | product-visible/current action |
| OC-025 | provider/session failure | failure RunEvents + diagnostics | partly | reliable; detailed diagnostics technical | determine primary summary vs technical detail |
| OC-026 | turn start/end/duration | Order RunEvent trigger + ProviderDiagnostic timestamps | partly | reliable | decide whether useful operational activity |
| OC-027 | provider tool name/category after turn | released session.context tool parts | no | available but discarded | decide whether bounded category is useful |
| OC-028 | provider tool running/live state | no current Order capture; volatile event stream or experimental durable log required | no | not available under current Order contract | Phase 2A need first; Phase 2B source/certification if required |
| OC-029 | read/affected resource summary | tool input/context or session log; Order candidate/evidence sources post-turn | no ordinary STAGE view | potentially available, requires bounded safe projection | decide usefulness/safety |
| OC-030 | provider retry event | released assistant retry / durable session event log | no | available post-turn / experimental durable stream | decide whether operationally useful |
| OC-031 | raw tool input/output/native metadata | provider context/log | no | available but potentially sensitive/unbounded | presumptively technical/closed unless specifically justified |
| OC-032 | assistant reasoning text | provider assistant reasoning parts | no | technically retrievable | **closed/private; not product transparency** |
| OC-033 | credentials/tokens/provider secrets | provider-private namespace | no | must remain closed | closed |
| OC-034 | raw protocol/session ids/hashes | Run/diagnostics | technical disclosure only | reliable | technical/on-demand |

## 8. Failure taxonomy and current evidence

| Failure class | Producing boundary | Order representation | Verdict |
|---|---|---|---|
| missing model/readiness/preflight | Order productive admission | PRODUCTIVE_INVOCATION_FAILED / PRECONDITION_FAILED or ENVIRONMENT_BLOCKED | CORRECT |
| provider server/session/model/permission setup failure | shell admission | productive invocation/provider failure according to classification | CORRECT |
| prompt admission transport uncertainty | shell prompt reconciliation | deterministic same prompt id retry, then TRANSPORT_ERROR | CORRECT |
| provider timeout | completion poll | interrupt; PROVIDER_FAILURE if success cannot be proved | CORRECT |
| provider failed/interrupted outcome | provider terminal projection | PROVIDER_FAILURE | CORRECT |
| invalid final JSON/output | parse + one format repair | PROVIDER_FAILURE / INVALID_OUTPUT | CORRECT |
| daemon restart | coordinator | COORDINATOR_INTERRUPTED, not provider failure | CORRECT |
| STAGE cross-event grammar rejection after successful provider turn | Order batch consumer after shell turn | PROVIDER_FAILED detail | **semantically Order contract failure, not OpenCode transport/model failure; diagnostics insufficient OC-F03** |

## 9. P1-T07 findings

### OC-F01 — ordinary provider execution is operationally opaque

During a provider turn, the ordinary UI can show that Order is Processing, but it cannot show bounded facts such as which tool/action category is executing, whether the provider is reading or editing, or meaningful provider progress.

This is not because OpenCode is workflow authority; it is because Order intentionally does not ingest provider activity beyond terminal/session result processing.

**Affected:** R1/R2/DESIGN/PLAN interactive work and post-signoff agent Runs.  
**Verdict:** `INCOMPLETE` relative to the 0.5.0 usability objective.  
**Authority impact:** current P3 Workbench language treats provider/session mechanics as technical unless provider failure owns the blocker. If Phase 2A determines that bounded agent operational activity is required product information, P3 must be clarified/amended to distinguish operator-relevant activity from provider plumbing.

### OC-F02 — richer activity capability exists at the current pin

The released provider context already contains typed tool parts after turn completion. The exact pin also has experimental durable session-log events for richer/live-ish execution history.

Therefore an OpenCode version upgrade is **not established as necessary** merely to obtain activity data.

**Verdict:** FACTUAL CAPABILITY.  
**Phase 2:** functional need first; technical design then chooses a source and bounded projection.

### OC-F03 — provider diagnostics cannot reconstruct the rejected STAGE batch

The known lifecycle-proposal/control-event failure occurs after `runOpenCodeTurn` succeeds and returns canonical individual payloads.

The ProviderDiagnosticRecord may therefore say `SUCCEEDED`, while later `validateStageProviderTurn` rejects the batch and Order records PROVIDER_FAILED.

Current diagnostics do not record a bounded/redacted summary of returned event tags or the rejected batch shape. Consequently the diagnostic evidence cannot prove which controlling event coexisted with the proposal.

**Verdict:** `INCOMPLETE`, release blocker for failure diagnosability/certification.  
**Relation:** STATE-F03.  
**Phase 2B question:** define the minimum bounded evidence required to diagnose producer/consumer admission failure without persisting raw/unbounded model output.

### OC-F04 — current integration has no correctness-grade live activity feed

Order does not subscribe to OpenCode events. The global event stream is volatile by provider contract. The richer durable session log is experimental and not currently authorized.

Therefore Phase 2 cannot simply “turn on live OpenCode events” as an implementation detail.

**Verdict:** `INCOMPLETE DESIGN CAPABILITY` if live activity becomes a functional requirement.  
**Authority impact:** P4/P6 and certification.

### OC-F05 — session/restart behavior is bounded and correct

Strict STAGE session reuse, current material identity, fresh execution-role sessions and COORDINATOR_INTERRUPTED restart behavior prevent hidden provider state from becoming workflow authority.

**Verdict:** `CORRECT`.

### OC-F06 — provider failure classification is mostly sound

Transport/provider/timeout/output failures are distinguished from Order readiness/precondition and coordinator-interruption failures.

The principal exception is not misclassification of OpenCode itself but insufficient evidence around post-provider Order batch rejection (OC-F03).

**Verdict:** `CORRECT WITH DIAGNOSTIC GAP`.

### OC-F07 — STAGE producer contract is incomplete

OpenCode receives the individual canonical event contract but not the closed cross-event turn grammar enforced later by Order.

This is the same producer/consumer defect proven as STATE-F03.

**Verdict:** `INCOMPLETE`, release blocker.  
**Resolution boundary:** Phase 2B producer contract + permanent certification; do not weaken consumer validation.

## 10. Transparency boundary established for Phase 2

Phase 1 can now distinguish three factual classes.

### 10.1 Already product-semantic

These are canonical Order facts and can remain product-facing without exposing provider internals:

- role/attempt;
- Processing/Open/Waiting/Closed interaction;
- final agent messages;
- required questions;
- proposals;
- blockers/failures;
- validation/review outcomes;
- evidence resources;
- recovery owner.

### 10.2 Potential bounded operational activity

These facts are available or potentially available and may be useful, but Phase 2 must decide the functional requirement:

- turn start/end/duration;
- tool/action category;
- safe read/affected-resource summary;
- retry/recovery activity;
- bounded progress/state.

Their final data source, retention and redaction are Phase 2B matters.

### 10.3 Closed/internal

These should not be conflated with product transparency:

- hidden assistant reasoning / chain of thought;
- credentials/secrets;
- raw provider-native metadata;
- raw unbounded tool input/output;
- provider protocol identifiers except on-demand technical diagnosis;
- volatile provider events as correctness authority.

## 11. Upgrade verdict

The Phase 1 evidence does **not** justify upgrading OpenCode to solve the transparency problem.

The current pin can already expose meaningful additional post-turn tool structure, and has a richer experimental durable event surface if a later design deliberately accepts/certifies it.

A dependency upgrade remains a separate P4/P6 decision only if Phase 2 requirements cannot be satisfied reliably with the pinned supported/explicitly governed capability set.

## 12. P1-T07 completion verdict

**P1-T07: COMPLETE.**

The audit now provides Phase 2 with:

- the exact role/context/session/provider path;
- exact continuity/restart behavior;
- current persisted/product-visible OpenCode information;
- exact additional capability available from the pinned provider;
- reliability distinctions between released context, volatile events and experimental durable events;
- failure taxonomy;
- transparency/safety boundary;
- release blockers OC-F03 and OC-F07;
- the product/design questions created by OC-F01/OC-F04.

Phase 2 does not need to rediscover the current OpenCode integration before deciding its functional transparency and interaction model.
