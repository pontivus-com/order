# Execution control plane

**Status:** Design baseline
**Canonical concern ID:** `GW-DOC-EXECUTION-CONTROL-PLANE`  
**Versioned concern ID:** `GW-DOC-EXECUTION-CONTROL-PLANE-V1`  

## 1. Execution boundary

Once a task reaches `TODO`, Order becomes intentionally boring.

The task has already been researched, specified, designed, planned, reviewed for readiness, and explicitly authorized.

The implementation loop is governed by [GW-DOC-VALIDATION-STANDARD-V1](../requirements/validation-standard.md):

```text
claim approved task
        |
        v
V0 package / approval validation
        |
        v
V1 repository / governance preflight
        |
        v
fresh OpenCode implementation
        |
        v
V2 scope/diff validation
        |
        v
V3 mechanical behavior validation
        |
        v
V4 fresh read-only semantic review
        |
        v
V5 architecture/governance validation
        |
        v
V6 minimum-change / anti-bloat validation
        |
        v
V7 final invalidated gates
        |
        v
candidate done
```

The LLM does engineering work inside the task. It does not own queue state, validation branching, retry policy, task selection, approval validity, or final completion state.

Concrete workspace, provider, event/reaction, project-manifest, and candidate-handoff hooks are defined by [GW-DOC-TECHNICAL-ARCHITECTURE](technical-architecture.md).

## 2. v1 execution topology

Initial topology:

- one Order host;
- one persistent `orderd` daemon;
- one loopback browser UI plus a thin CLI client of that daemon;
- one target repository executing at a time;
- one repository writer at a time;
- fresh isolated checkout per post-signoff execution run under a Order factory root;
- SQLite durable state;
- an in-process Order coordinator scheduler owned by `orderd`;
- a Order-owned, loopback-only OpenCode V2 server process as the only coding-agent execution provider;
- bounded interactive OpenCode sessions for pre-signoff stage Runs;
- fresh separate implementation and review sessions post-signoff;
- prescribed project-specific verification commands;
- no automatic commit, push, PR, merge, or deploy.

The daemon owns the periodic wake-up. After startup recovery it performs one coordinator tick, then repeats the same non-overlapping coordinator tick every 3600 seconds while the daemon remains running. The scheduler never prompts OpenCode directly.

```text
orderd
     |
     +-- startup recovery
     |
     +-- immediate coordinator tick
     |
     +-- every 3600s, if no tick is already active
             |
             +-- no eligible ordinary task or queued Acceptance correction -> NO_WORK
             |
             +-- eligible ordinary task or queued Acceptance correction -> atomic admission -> execute
```

`order tick` remains a manual thin-client command for invoking the same global coordinator operation on demand.

The Workbench Implementation action is distinct: **Start current task** submits the exact current approved WorkItem/task identity. That command does not scan the global queue; after exact admission/claim it enters the same coordinator execution loop used by scheduled/tick work. There is still one task/run control plane and one global RUNNING-task exclusion.

No executable task means no model call.

## 3. Durable state

The durable control plane is external to OpenCode sessions.

Initial persisted concepts:

- `work_items`;
- `artifact_refs`;
- `approvals`;
- `execution_tasks`;
- `runs`;
- `run_events`.

SQLite in WAL mode is sufficient for the initial single-host/single-writer design.

A later distributed-worker requirement would justify revisiting storage. It does not justify PostgreSQL, Redis, or a workflow platform in v1.

## 4. Atomic task start

An ordinary task is eligible only when:

- state is `TODO`;
- approval is current;
- dependencies are complete;
- target repository is available;
- no other post-signoff task is `RUNNING`;
- preconditions remain valid.

v1 has one daemon and one state writer, so it does not implement worker leases or a separate claim state.

Ordinary task start has two admission modes over the **same** canonical task/run transition:

- an automatic/tick start selects the single globally eligible `TODO`;
- an operator Start current task command supplies a WorkItem/task id and must prove that task is exactly the current eligible execution owner for that WorkItem.

In both modes one SQLite transaction:

1. proves/identifies the single exact eligible `TODO`;
2. creates its `Run`;
3. changes that exact task directly to `RUNNING`;
4. commits before OpenCode is invoked.

The manual command cannot cause another globally eligible task to be selected. It does not create a second queue, scheduler or claim state.

Queued Acceptance correction is a second eligibility branch of the same automatic scan, not a second scheduler or manual task-start mode. P6 §§17/23/38.3 own exact selection, precedence, admission and transaction semantics. It admits the exact previously successful candidate-producing task directly into REVIEWER, with the linked REVIEW_STARTED and WorkItem return to EXECUTION committed together. Ordinary BUILDER admission remains TODO-only; no synthetic TODO, second approval or unrelated task start.

If the daemon stops while a post-signoff Run is `RUNNING`, startup recovery marks that Run `FAILED / COORDINATOR_INTERRUPTED`, abandons its workspace, and applies the bounded operational-action retry policy in [GW-DOC-CANONICAL-CONTRACTS §§8,21](../contracts/canonical-contracts.md). When the single automatic replacement is permitted the ExecutionTask remains `RUNNING` and the coordinator creates the same-role/same-trigger continuation Run; otherwise task and WorkItem block. Automatic recovery never routes through `TODO`.

A task remains `RUNNING` across builder/reviewer/remediator Run boundaries. When no Run is active for that task, the coordinator first reconciles the last durable RunEvent and starts the uniquely required continuation Run, if any, before considering another ordinary task or queued Acceptance correction under P6 §23. Exact continuation eligibility/atomicity is owned by [GW-DOC-CANONICAL-CONTRACTS §§17,23](../contracts/canonical-contracts.md).

## 5. Preflight

Before editing, V0/V1 prove:

- approval package is still current;
- specification is valid;
- referenced governance is still current;
- dependencies are complete;
- repository baseline is the expected one;
- the claimed problem/required change has not already been satisfied by intervening work;
- the authorized and forecast change surface remains plausible.

Preflight may terminate without code:

- `ALREADY_SATISFIED`;
- `APPROVAL_STALE`;
- `SPEC_INVALID`;
- `PRECONDITION_FAILED`;
- `BLOCKED_FOR_REANALYSIS`.

No-op is a valid successful control-plane decision.

## 6. OpenCode invocation

OpenCode integration follows [GW-DOC-OPENCODE-INTEGRATION-V1](opencode-integration.md).

v1 uses the released OpenCode V2 server API through the exactly matching `@opencode/client` package. Order owns the OpenCode server process, its isolated configuration/data namespace, authentication secret, stage permissions and session lifecycle.

Order does not depend on OpenCode's live event stream for prompt admission, completion proof, uncertain-admission handling, recovery or any lifecycle/task decision. The pinned integration may consume that stream **best-effort** only to derive the bounded/redacted operator-visible activity defined by [GW-DOC-OPENCODE-INTEGRATION-V1](opencode-integration.md) and P6. Missing/disconnected live activity changes no correctness behavior. Terminal completion still uses the released `session.get` outcome/idle projection plus successful `session.context`; experimental wait/event APIs remain non-authoritative. Provider-process loss follows Order's role-specific recovery policy below rather than an assumed hidden provider resume.

Three post-signoff Run roles are required:

### Builder

Purpose: implement exactly one approved task with the minimum sufficient change.

### Reviewer

Purpose: independently prove or disprove semantic completion, architecture/governance compliance, scope compliance, and anti-bloat compliance. The reviewer is read-only with respect to candidate source changes.

### Remediator

Purpose: apply only one already-classified repairable failure to the exact triggering candidate under the existing signed task. A remediator is mutating but owns no new scope, requirement, architecture, contract or failure classification.

A provider failure during a mutating builder/remediator Run abandons that execution workspace. Post-signoff replacement is governed only by the bounded operational-action policy in [GW-DOC-CANONICAL-CONTRACTS §21](../contracts/canonical-contracts.md), and every permitted replacement starts from a fresh isolated checkout. Pre-signoff read-only stage Runs may replace a lost provider session from canonical Order/repository state; post-signoff reviewer replacement is likewise bounded by [GW-DOC-CANONICAL-CONTRACTS §21](../contracts/canonical-contracts.md).

## 7. Mechanical verification

Verification is owned by Order and the target project, not by the coding agent.

The approved task declares logical validation gates. The target project's integration resolves them to exact commands and required environment under [GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1](../requirements/project-governance-integration.md).

The agent cannot weaken, replace, or omit required gates.

## 8. Bounded remediation

Only failure classes explicitly marked repairable by [GW-DOC-VALIDATION-STANDARD-V1](../requirements/validation-standard.md) may enter automatic remediation.

Initial semantic repair budget is one targeted remediation per repairable failure class.

Scope, governance, specification, or approval failures return upstream rather than being "fixed" by improvisation.

Environment/provider failures are operationally distinct and do not consume semantic remediation budget.

## 9. Evidence

Each run records compact durable evidence:

- run id;
- task id;
- validation stage;
- attempt;
- repository baseline;
- OpenCode session reference;
- start/end timestamps;
- files/symbols changed;
- validation commands and statuses;
- reviewer verdict;
- governance result;
- minimum-change result;
- terminal classification;
- blocking fact where applicable.

Large raw transcripts/logs are not canonical task state. v1 defines no automated raw-log retention or cleanup subsystem; only bounded evidence required by the canonical contracts is retained by Order.

## 10. Semantic event/reaction path

Execution effects are normalized into the semantic `RunEvent` contract owned by [GW-DOC-CANONICAL-CONTRACTS](../contracts/canonical-contracts.md), under the technical architecture in [GW-DOC-TECHNICAL-ARCHITECTURE](technical-architecture.md).

The functional core classifies each semantic event into the next allowed reaction: promotion, bounded remediation, operational retry, invalidation, upstream return, linked IDEA creation, or block.

Raw OpenCode/project logs do not directly mutate lifecycle state.

## 11. Terminal execution outcomes

Initial terminal outcomes include:

- `CANDIDATE_DONE`;
- `ALREADY_SATISFIED`;
- `BLOCKED_FOR_REANALYSIS`;
- `APPROVAL_STALE`;
- `SPEC_INVALID`;
- `SCOPE_BREACH`;
- `GOVERNANCE_BREACH`;
- `CHANGE_BLOAT`;
- `ENVIRONMENT_BLOCKED`;
- `PROVIDER_FAILURE`.

`CANDIDATE_DONE` means every applicable validation stage passed for an execution task. When the current Approval has at least one such task and all tasks succeeded, enter final human Acceptance, not terminal WorkItem completion; all-no-op completes directly. Human findings are durable observations against exact candidates, not provider output or synthetic validation failures. The existing scheduler admits a submitted QA review only under current Approval, exact candidate and global single-running-task exclusion; a new read-only REVIEWER replays the exact candidate and evaluates findings against signed criteria. A real repairable V4 failure invokes existing bounded REMEDIATOR and fresh V0–V7 proof; a genuine specification or authority defect follows existing upstream return; exhausted retry blocks. Existing budgets are not reset. Final human acceptance is a separate atomic WorkItem completion decision, not a Run or gate. Neither technical success nor acceptance authorizes commit, PR, merge, deployment, or production mutation.


## 12. Signed in-task verification checkpoints

A P7 architecture-feedback checkpoint is executable through the coordinator; productive providers remain denied ambient shell/execute authority.

### 12.1 Request/result split

The canonical provider event set gains exactly one BUILDER-only request:

```text
GATE_CHECKPOINT_REQUESTED { gateId }
```

The request is not verification proof. The coordinator accepts it only when:

- the current Run role is `BUILDER`;
- `gateId` is in the current signed ExecutionTask `gateIds`;
- the gate still resolves from the current validated ProjectManifest;
- approval/task/context freshness remains valid.

The coordinator executes the exact gate in the current isolated builder workspace through the existing `runVerificationGate` / validation effect owner and records the existing coordinator-owned `GATE_PASSED` or `GATE_FAILED` event plus ordinary immutable gate evidence.

### 12.2 Continuation

After a checkpoint result the same BUILDER Run/provider session may continue with the exact result as its next trigger/context:

- pass -> continue the signed task;
- fail -> only correction within the signed semantic scope/accepted design is allowed, including an S9-authorized minimum same-layer physical decomposition when required to preserve an already-resolved responsibility/effect boundary; otherwise block for upstream resolution. A physical path absent from the forecast is not by itself an upstream-return condition.

A checkpoint result does not substitute for V3/V5/V7 and does not mark a task/candidate successful. Final validation continues to execute the signed gate set independently at its existing stages.

A request for an unsigned/unresolved gate is invalid provider output. No second gate registry, validation state machine, provider shell permission or persisted checkpoint status is introduced.

### 12.3 Execution-control baseline precondition

Checkpoint capability is part of the coordinator that owns the Run, not part of candidate repository state.

If a signed P7 task requires an in-task architecture-feedback checkpoint, the exact coordinator/runtime governing that Run must already implement this §12 contract **before sign-off and before the first BUILDER turn**. A task cannot satisfy this precondition by modifying its own candidate bytes:

- every execution Run starts from the immutable Approval baseline;
- the coordinator process, provider-event admission and turn/reaction loop are outside the candidate workspace;
- dependency tasks in the same Approval change eligibility only and do not promote candidate bytes into another task baseline.

Therefore a change to checkpoint event grammar, provider admission, coordinator gate execution or same-Run continuation that is required to govern a later package is a **prerequisite execution-control change**. It must be completed through a separately governed WorkItem, integrated into the repository/runtime baseline, and the dependent package must then be freshly reconstructed/revalidated against that exact baseline. A PLAN must not place the checkpoint-control implementation inside the same signed task whose ordered steps depend on that capability.

This is a bootstrap constraint, not a second task-dependency model.

## 13. Signed scope, change-surface forecast and architecture-preserving variance

The signed task has two distinct boundaries:

- `scope` / `exclusions` define the signed repository reach within which implementation may operate;
- `changeSurface` records the exact **expected physical path forecast** reviewed at PLAN/sign-off.

`changeSurface` is not an independent semantic authority and is not an exhaustive physical whitelist. The implementation remains bounded by the task objective, acceptance/authority references, signed concerns, scope/exclusions and the resolved P1-P6 design.

V2 must fail closed for:

- any changed path outside signed `scope`;
- any changed path admitted by `exclusions`;
- repository instructions such as `AGENTS.md`;
- signed material authority, project-manifest/governance sources, or immutable verification sources that the task is not permitted to modify;
- any deterministic protected path class owned by the Approval/project-governance closure.

For an otherwise admitted path that is absent from `changeSurface`, V2 records no automatic scope breach merely because the forecast omitted that physical path. The resulting diff proceeds through the ordinary V3-V6 path. V4/V5/V6 must then positively prove that the variance is exactly the minimum same-layer physical decomposition required to preserve an already-resolved responsibility/effect boundary and that canonical semantic ownership, public contracts, state meaning, dependency direction, external dependencies, validation contract and authorized behavior are unchanged. Productive BUILDER/REMEDIATOR native edit permission is therefore derived from a transient signed-scope capability envelope rather than the forecast; immutable authority/instruction/Git/symlink paths remain hard-denied. The envelope is not semantic authorization and may be broader than Bun.Glob when the pinned provider wildcard cannot encode the signed pattern exactly.

If those propositions cannot be proved, classification is the existing appropriate `SCOPE_BREACH`, `GOVERNANCE_BREACH`, `BLOCKED_SPEC_OR_DESIGN` or `CHANGE_BLOAT` path; execution does not invent a design. Before a BUILDER checkpoint gate is allowed to observe the mutable workspace, the coordinator captures the current diff and applies the exact V2 signed-scope/exclusion/protected-path validator; an invalid intermediate diff blocks through the existing scope path and the gate is not executed.

V6 is not an unconditional evidence-recording pass. A V4 `REVIEW_PASSED` includes the independent reviewer's structured minimum-change proposition. After V5 passes, the coordinator alone maps that proposition to V6: `MINIMUM_SUFFICIENT` passes; `CHANGE_BLOAT` emits `VALIDATION_FAILED / V6 / CHANGE_BLOAT` with the review evidence and removable-surface summary and may consume only the existing bounded reduction entitlement.

The actual changed-path set is retained in the existing candidate/Run evidence. No new persisted “variance” DTO/state, dynamic scope mutation or second authorization list is introduced.