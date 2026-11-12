# 02 — Execution control plane

**Status:** Design baseline
**Canonical concern ID:** `GW-DOC-EXECUTION-CONTROL-PLANE`  
**Versioned concern ID:** `GW-DOC-EXECUTION-CONTROL-PLANE-V1`  

## 1. Execution boundary

Once a task reaches `TODO`, Order becomes intentionally boring.

The task has already been researched, specified, designed, planned, reviewed for readiness, and explicitly authorized.

The implementation loop is governed by [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md):

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

Concrete workspace, provider, event/reaction, project-manifest, and candidate-handoff hooks are defined by [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md).

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
             +-- no eligible TODO -> NO_WORK
             |
             +-- eligible TODO -> claim -> execute
```

`order tick` remains a manual thin-client command for invoking the same coordinator operation on demand.

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

A task is eligible only when:

- state is `TODO`;
- approval is current;
- dependencies are complete;
- target repository is available;
- no other post-signoff task is `RUNNING`;
- preconditions remain valid.

v1 has one daemon and one state writer, so it does not implement worker leases or a separate claim state.

One SQLite transaction:

1. selects the single eligible `TODO`;
2. creates its `Run`;
3. changes the task directly to `RUNNING`;
4. commits before OpenCode is invoked.

If the daemon stops while a post-signoff Run is `RUNNING`, startup recovery marks that Run `FAILED / COORDINATOR_INTERRUPTED`, abandons its workspace, and applies the bounded operational-action retry policy in [GW-DOC-CANONICAL-CONTRACTS-V1 §§8,21](13-canonical-contracts.md). When the single automatic replacement is permitted the ExecutionTask remains `RUNNING` and the coordinator creates the same-role/same-trigger continuation Run; otherwise task and WorkItem block. Automatic recovery never routes through `TODO`.

A task remains `RUNNING` across builder/reviewer/remediator Run boundaries. When no Run is active for that task, the coordinator first reconciles the last durable RunEvent and starts the uniquely required continuation Run, if any, before considering another `TODO` task. Exact continuation eligibility/atomicity is owned by [GW-DOC-CANONICAL-CONTRACTS-V1 §§17,23](13-canonical-contracts.md).

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

OpenCode integration follows [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md).

v1 uses the released OpenCode V2 server API through the exactly matching `@opencode/client` package. Order owns the OpenCode server process, its isolated configuration/data namespace, authentication secret, stage permissions and session lifecycle.

Order does not subscribe to OpenCode's live event stream in v1. Prompt admission, completion proof, uncertain-admission handling and foreground-provider recovery use only the OpenCode contract, pinned by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` and defined by [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md); experimental event/wait APIs are not correctness dependencies. Provider-process loss follows Order's role-specific recovery policy below rather than an assumed hidden provider resume.

Three post-signoff Run roles are required:

### Builder

Purpose: implement exactly one approved task with the minimum sufficient change.

### Reviewer

Purpose: independently prove or disprove semantic completion, architecture/governance compliance, scope compliance, and anti-bloat compliance. The reviewer is read-only with respect to candidate source changes.

### Remediator

Purpose: apply only one already-classified repairable failure to the exact triggering candidate under the existing signed task. A remediator is mutating but owns no new scope, requirement, architecture, contract or failure classification.

A provider failure during a mutating builder/remediator Run abandons that execution workspace. Post-signoff replacement is governed only by the bounded operational-action policy in [GW-DOC-CANONICAL-CONTRACTS-V1 §21](13-canonical-contracts.md), and every permitted replacement starts from a fresh isolated checkout. Pre-signoff read-only stage Runs may replace a lost provider session from canonical Order/repository state; post-signoff reviewer replacement is likewise bounded by [GW-DOC-CANONICAL-CONTRACTS-V1 §21](13-canonical-contracts.md).

## 7. Mechanical verification

Verification is owned by Order and the target project, not by the coding agent.

The approved task declares logical validation gates. The target project's integration resolves them to exact commands and required environment under [GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1](09-project-governance-integration.md).

The agent cannot weaken, replace, or omit required gates.

## 8. Bounded remediation

Only failure classes explicitly marked repairable by [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md) may enter automatic remediation.

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

Execution effects are normalized into the semantic `RunEvent` contract owned by [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md), under the technical architecture in [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md).

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

`CANDIDATE_DONE` means every applicable validation stage passed. It does not authorize commit, PR, merge, deployment, or production mutation.
