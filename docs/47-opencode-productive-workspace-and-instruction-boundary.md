# OpenCode productive workspace and instruction boundary — functional and technical design

**Canonical concern ID:** GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE  
**Versioned concern ID:** GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1  
**Target correction train:** Order 0.2.2  
**Authority layers:** P3 functional requirements + P4 technical architecture  
**Status:** functional/P4/P6 boundary design complete; productive connected-account implementation is blocked until the pinned OpenCode integration provides a certifiable external-instruction isolation capability

## 1. Purpose

This document closes the productive OpenCode workspace/instruction-boundary gap exposed by the Order 0.2.1 Research failure in which a dependency-owned AGENTS.md beneath an ignored node_modules tree was enumerated as if it were project P1 authority.

The problem is broader than one dependency directory.

OpenCode 2.2.6 can introduce repository instructions through file reads. Order therefore needs a deterministic answer to all of the following before any productive provider session is admitted:

1. what exact repository bytes the provider can inspect;
2. what AGENTS.md files are reachable from those bytes;
3. which reachable instruction files are canonical resolved P1 authority;
4. whether the provider can escape that workspace through ignored material, symlinks, repository metadata or external paths;
5. whether the same boundary holds for every productive role and lifecycle path;
6. whether failures before provider admission are classified separately from failures of an admitted provider;
7. what permanent tests prove these propositions against the exact pinned OpenCode build.

This concern is narrower than the complete OpenCode integration owned by GW-DOC-OPENCODE-INTEGRATION-V1. It owns only productive provider workspace materialization, repository-instruction closure, admission classification and the associated certification matrix. General OpenCode process/session/model/account semantics remain with their existing canonical owners.

## 2. Governing authority

This design conforms to:

- GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1;
- GW-DOC-LIFECYCLE-CONTEXT-V1;
- GW-DOC-EXECUTION-CONTROL-PLANE-V1;
- GW-DOC-VALIDATION-STANDARD-V1;
- GW-DOC-OPENCODE-INTEGRATION-V1;
- GW-DOC-TECHNICAL-ARCHITECTURE-V1;
- GW-DOC-CANONICAL-CONTRACTS-V1;
- GW-DOC-EXTERNAL-FACTS-V1-2026-11-12;
- GW-P1-FCIS;
- GW-P1-SOC;
- GW-P1-DRY;
- GW-P1-STRICT-TYPING;
- GW-P1-CANONICAL-OWNERSHIP;
- GW-P1-EXPLICIT-FLOW;
- GW-P1-MINIMUM-CHANGE.

No requirement below authorizes a second workflow engine, provider abstraction, repository model, DTO family, permission service, Git implementation, agent framework or parallel authority resolver.

## 3. Confirmed failure mechanism

Order 0.2.1 currently performs productive STAGE work with the configured repository root as the OpenCode workspace.

Before creating the OpenCode session, Order calls repository-instruction admission. The shell helper currently enumerates AGENTS.md through an unrestricted filesystem glob over the physical repository directory. That scan does not distinguish project material from ignored installation/dependency material.

The observed repository contained:

~~~text
node_modules/.pnpm/recharts@.../node_modules/recharts/AGENTS.md
~~~

That file was discovered by Order, was not part of the resolved project P1 authority set, and therefore caused the Run to fail before an OpenCode session was created.

The failure was then persisted as PROVIDER_FAILED / PROVIDER_FAILURE even though the provider had not performed the failing action.

Two independent defects are therefore present:

1. **workspace/instruction-set defect** — the physical repository directory is larger than the project material that may safely participate in productive provider execution;
2. **failure-origin defect** — Order conflates local productive-invocation admission failure with provider operational failure.

## 4. Exact pinned-provider facts that constrain the design

The exact OpenCode 2.2.6 source establishes the following relevant behavior. The dated external-facts owner must record these facts; this document owns only the Order consequence.

### 4.1 Direct read

The OpenCode read tool authorizes a requested path and reads it directly. It does not first filter the path through Git/ripgrep ignore semantics.

After a successful **internal** read, OpenCode walks upward from the read file/directory toward the active Location root and loads discovered AGENTS.md files as durable synthetic session instructions. External-directory reads skip this nearby-instruction injection path.

Therefore:

- an ignored file that the model can name directly may still be read;
- a successful read beneath an ignored dependency subtree can activate a dependency-owned AGENTS.md;
- relying only on glob/grep ignore behavior cannot close the instruction boundary.

### 4.2 Glob and grep

The pinned glob and grep tools delegate to OpenCode's ripgrep adapter.

The adapter excludes .git from ordinary search results and does not set a no-ignore mode. Search therefore uses ripgrep's normal ignore behavior. This is useful discovery behavior but is not a sufficient security/governance boundary because direct read remains independent.

### 4.3 Permissions

The pinned permission evaluator uses the last matching permission rule. Order can therefore add more-specific denies after broad read/edit allows where a narrow deny is required, but path permissions do not by themselves define which ignored physical files exist in the provider workspace.

### 4.4 External reference roots

STAGE external reference reads use the external_directory boundary. The pinned read tool skips nearby AGENTS.md injection for those external reads. External reference material remains evidence/context and never becomes project P1 merely because the model reads it.

## 4.5 Complete effective instruction ingress audit

Repository `AGENTS.md` is only one instruction source in the pinned provider.

The exact OpenCode 2.2.6 request-context assembly combines multiple instruction owners before model inference:

1. Code Mode/tool-catalog instructions;
2. MCP-server instructions;
3. OpenCode reference instructions;
4. skill instructions;
5. `InstructionDiscovery` sources;
6. built-in date/environment instructions;
7. API-managed per-session `InstructionEntry` values.

Read-triggered nested `AGENTS.md` is an additional synthetic-message path after internal reads.

For Order, only provider-internal invariant framing that has been explicitly capability-certified may remain ambient. Project/user/remote semantic instructions must either resolve through Order authority before inference or be absent.

The exact OpenCode Console plugin creates a separate critical ingress. When a saved Console connection is active, it can download workspace Library instructions and add their bytes directly to `InstructionDiscovery`. This contribution is independent of repository `AGENTS.md` and is not exposed through the session instruction-entry API.

The pinned public API exposes API-managed `/api/experimental/session/:id/instructions/entries`, but no pre-inference endpoint that returns the complete effective `InstructionDiscovery`/MCP/reference/skill/Console instruction set with exact source bytes. The pinned configuration API does not expose Console Library instruction bytes.

The Console integration can be withheld only by `integration.use` managed policy. In the pinned config implementation, ordinary user/project/private config cannot act as that managed-policy lockdown. Order's foreground-server contract does not expose a supported per-process option that disables Console Library instructions while retaining the connected account/provider authentication.

A forward check against OpenCode 2.3.0, released 2026-11-13, does not close this gap: it still loads connected-workspace Console instructions into `InstructionDiscovery`, and its public session protocol still exposes only API-managed instruction entries rather than a complete pre-inference effective-instruction manifest. A pin bump to 2.3.0 is therefore not, by itself, a remediation.

This is a release-critical provider-capability gap. Order must not claim complete productive instruction authority while this ingress is unbounded.

## 5. Functional design

### GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT

**Required behavior:** every productive OpenCode Run operates inside a deterministic Order-admitted provider workspace whose internal file population is limited to project material for that Run; ambient ignored dependency/build/cache/install material from the user's physical repository must not become provider-visible merely because it exists below the repository root.

**Acceptance criterion:** adding an ignored directory containing arbitrary files and nested AGENTS.md beneath the user's repository does not change the provider-visible project file set, resolved instruction set, context hash, productive prompt or successful outcome of a Run whose actual project material is unchanged.

**Failure/negative behavior:** Order must not solve this requirement by hard-coding node_modules, .venv, dist, target, vendor or another ecosystem-specific directory list. The boundary is repository/project material, not a package-manager blacklist.

### GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE

**Required behavior:** before productive provider admission, every AGENTS.md that can be activated by an internal provider read in the admitted workspace is known to Order and resolves through the canonical P1 authority mechanism with exact bytes.

**Acceptance criterion:** for a provider-admitted workspace, every regular AGENTS.md present anywhere in that workspace is represented by current resolved P1 material; a missing, extra, stale, ambiguous, symlinked or otherwise unresolved instruction file blocks productive provider admission before the provider session is used.

**Failure/negative behavior:** Order must not silently ignore a provider-visible project AGENTS.md, treat filesystem proximity/order as authority precedence, auto-promote an instruction file into P1, or accept an instruction merely because OpenCode would have loaded it.

### GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY

**Required behavior:** the same workspace/instruction admission law applies to every productive OpenCode role: Research, Requirements, Solution design, Implementation plan and Readiness review STAGE Runs, plus Builder, Reviewer and Remediator execution Runs.

**Acceptance criterion:** no productive role has a weaker instruction boundary, alternate repository scan, role-local exception or untested provider-start path. Format repair remains deny-all and cannot acquire repository tools. OpenCode account/model control remains non-productive and does not inherit project repository instructions.

**Failure/negative behavior:** passing the Research path alone is insufficient certification.

### GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION

**Required behavior:** Order classifies a failure according to the boundary that actually failed.

At minimum:

- repository/workspace materialization, repository-instruction closure and canonical-authority admission failures are PRECONDITION_FAILED;
- unavailable or invalid required local runtime/provider configuration that prevents productive provider admission is ENVIRONMENT_BLOCKED where the existing classification contract applies;
- PROVIDER_FAILURE is reserved for an OpenCode provider/process/session/turn failure after Order has successfully completed its own deterministic productive-invocation admission for that action.

**Acceptance criterion:** a nested unresolved project AGENTS.md produces an actionable repository/governance precondition failure; an ignored dependency AGENTS.md does not produce any failure; a real admitted OpenCode transport/session/turn failure remains PROVIDER_FAILURE and follows the existing bounded operational retry policy.

**Failure/negative behavior:** an exception thrown by a function located in opencode.ts is not sufficient evidence that the provider failed.

### GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE

**Required behavior:** permanent certification proves the productive OpenCode boundary through positive, negative and adversarial fixtures representative of the actual installed application, not only minimal temporary workspaces.

**Acceptance criterion:** the matrix in §11 is implemented at the appropriate shell/unit/integration/browser levels and every productive role has at least one real productive-path proof plus shared boundary proofs.

**Failure/negative behavior:** a test that creates only root AGENTS.md plus one intentionally nested project AGENTS.md is insufficient certification of the installed-workspace boundary.

### GW-FR-104-STAGE-WORKSPACE-FRESHNESS

**Required behavior:** an interactive STAGE provider session is bound to the exact admitted repository snapshot and resolved canonical context from which it started.

**Acceptance criterion:** a subsequent productive turn may continue the same provider session only while the current source/context and provider-workspace material identity still match the admitted snapshot. Material repository drift requires normal re-resolution/retry rather than letting the old provider session inspect a different repository state. Changes only to excluded ambient ignored material do not invalidate the admitted project snapshot.

**Failure/negative behavior:** Order must not keep a provider conversation alive while silently changing the internal repository bytes or instruction set beneath that session.


### GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE

**Required behavior:** before any productive model inference, Order can prove the complete semantic instruction context that may influence the model. Every non-invariant instruction source is either (a) exact Order-resolved authority/rendering admitted for this Run or (b) absent.

The closure covers, at minimum:

- repository/read-triggered `AGENTS.md`;
- configured/global/project instruction discovery;
- OpenCode Console workspace/Library instructions;
- API-managed session instruction entries;
- MCP instructions;
- reference instructions;
- skill instructions.

Provider-internal built-in date/environment/tool-catalog framing may remain only where its exact behavior is part of the pinned capability contract and does not introduce project/product authority.

**Acceptance criterion:** Order has a pre-inference proof for each instruction channel. A connected account or provider configuration that can inject semantic instructions whose exact bytes/source cannot be disabled or inspected before inference makes productive readiness false. No productive prompt is sent in that state.

**Failure/negative behavior:** successful model output, an empty current Console Library observed manually, denial of model tools, `OPENCODE_DISABLE_PROJECT_CONFIG`, `OPENCODE_PURE`, or the absence of repository `AGENTS.md` is not proof of complete instruction closure.


## 6. Technical design overview

The reliable boundary is an **Order-materialized provider workspace**.

Order must not attempt to make the user's physical repository safe by guessing every directory that should be excluded. Instead, the provider runs against a separate workspace containing the exact project state Order has admitted.

~~~text
configured repository
        |
        | prove Git root + current HEAD
        | capture current project-visible working-tree delta
        v
Order materialization boundary
        |
        +-- isolated checkout at exact HEAD
        +-- replay exact admitted current delta
        +-- verify paths/bytes
        +-- reject workspace escapes
        +-- enumerate AGENTS.md
        +-- prove every instruction is resolved P1
        |
        v
productive provider workspace
        |
        +-- STAGE: read/glob/grep only
        +-- BUILDER/REMEDIATOR: read/glob/grep + exact edits
        +-- REVIEWER: read/glob/grep only
        |
        v
OpenCode session
~~~

Post-signoff execution already uses fresh isolated checkouts and candidate replay. The correction therefore primarily closes the STAGE path and moves shared instruction/workspace admission to one common boundary used by all roles.

## 7. Technical requirements

### GW-TR-073-STAGE-INSPECTION-WORKSPACE-MATERIALIZATION

**Required behavior:** pre-signoff STAGE Runs use an Order-owned isolated inspection workspace rather than the configured repository directory as the OpenCode Location.

The shell materializes that workspace from:

1. the exact current Git HEAD commit;
2. the current tracked working-tree content relative to that commit;
3. current non-ignored untracked repository files admitted by Git's normal project visibility;
4. no ignored untracked dependency/cache/build/install material.

The implementation reuses the existing Git/process owners and existing isolated checkout/current-delta mechanics. If a physical helper must be generalized so the same byte/patch mechanics serve candidate and inspection materialization, that is an architecture-preserving same-layer refactor; a second Git patch/copy engine is prohibited.

The materializer must verify the final workspace against the captured project delta before provider admission.

**Required negative behavior:**

- do not recursively copy the source repository;
- do not copy node_modules or any other ignored tree merely because it exists;
- do not parse .gitignore in application code;
- do not introduce a Git library;
- do not mutate the user's Git index;
- do not initialize/fetch gitlinks/submodules;
- do not use the resulting workspace as a second canonical repository authority.

The source repository remains canonical. The inspection workspace is an ephemeral execution projection only.

### GW-TR-074-PROVIDER-INSTRUCTION-CLOSURE

After workspace materialization and before OpenCode session creation, one shell-owned instruction-admission operation:

1. enumerates regular AGENTS.md files inside the admitted provider workspace without following symlinks;
2. canonicalizes each path as RepositoryPath;
3. proves every enumerated path exists in the already resolved P1 material set for the Run;
4. proves the bytes/hash in the provider workspace equal the resolved ArtifactRef bytes/hash;
5. rejects any provider-visible AGENTS.md missing from resolved P1;
6. rejects any resolved repository instruction expected for that workspace that is missing or byte-different;
7. rejects symlink/non-regular AGENTS.md rather than following it;
8. rejects an ExecutionTask whose changeSurface names an AGENTS.md path whether or not that path exists before execution.

The final change-surface rule is path-semantic, not existence-dependent. A Builder must not be able to create a new instruction file simply because the pre-run enumerator could not see a file that did not yet exist.

Candidate validation additionally fails any Builder/Remediator result that adds, deletes or mutates an AGENTS.md outside the signed instruction material closure.

No separate instruction model is introduced. The operation consumes canonical RepositoryPath/ArtifactRef/P1 resolution already owned elsewhere.

### GW-TR-075-PROVIDER-WORKSPACE-ESCAPE-PREVENTION

Before productive provider admission, the materialized workspace is checked for provider-visible escape paths.

At minimum:

- a symlink that resolves outside the provider workspace blocks the Run;
- an AGENTS.md symlink blocks the Run regardless of target;
- provider direct read/listing of repository metadata at `.git` or below `.git/*` is denied because it is not productive project material;
- non-STAGE roles have no external_directory permission;
- STAGE external_directory permissions are exactly the configured reference roots and retain the pinned external-read no-instruction-injection behavior; canonical configuration keeps target repositories and reference roots path-disjoint so an external reference cannot bypass the isolated target workspace by pointing back into the physical target repository;
- the provider workspace must not contain or resolve into Order's state/evidence/account-control directories except as its own isolated run workspace;
- no provider tool receives ambient HOME/XDG project content through the private OpenCode namespace.

Internal repository symlinks may remain only when their resolved target stays inside the admitted workspace and existing repository/scope rules permit the relevant operation. A mutating signed path must not use a symlink to cause a write to a different semantic path.

### GW-TR-076-SHARED-PRODUCTIVE-PROVIDER-ADMISSION

One shared orchestration boundary prepares every productive OpenCode session.

Conceptually:

~~~text
prepareProductiveProvider(...)
  -> prove productive readiness required by this role
  -> prove/materialize exact workspace
  -> prove workspace escape constraints
  -> prove repository instruction closure
  -> derive exact role permissions
  -> start/verify pinned provider
  -> create session
  -> bind exact model + permissions
  -> return admitted provider/session
~~~

Names are illustrative. The implementation must preserve current FCIS/SoC ownership rather than create a service object or second runtime abstraction.

STAGE, BUILDER, REVIEWER and REMEDIATOR orchestration must call this same boundary. Role-specific prompt assembly and task/candidate handling remain with their current owners.

Format repair remains a separate deny-all turn on an already admitted session and receives no repository tools.

### GW-TR-077-PRODUCTIVE-INVOCATION-FAILURE-BOUNDARY

The daemon must stop routing every setup/admission exception through failRunForProvider.

P6 must expose enough canonical RunEvent semantics to persist the actual failure origin and human-actionable detail without inventing a browser-only error taxonomy.

The implementation classification boundary is:

| Failure point | Terminal classification | Provider failure event? |
|---|---|---|
| current repository cannot be materialized/proven | PRECONDITION_FAILED | No |
| provider workspace contains unresolved/stale instruction | PRECONDITION_FAILED | No |
| provider workspace contains escaping/symlinked instruction path | PRECONDITION_FAILED | No |
| signed task attempts to mutate/create AGENTS.md | PRECONDITION_FAILED or existing signed-package invalid classification, according to P6 owner | No |
| required model/account/runtime is unavailable before productive admission | ENVIRONMENT_BLOCKED where applicable | No |
| OpenCode process readiness/version/session/model/permission binding fails after local admission | PROVIDER_FAILURE unless the canonical P6 classification assigns an existing environment class | Yes only when provider is the failing boundary |
| admitted productive turn transport/timeout/invalid provider output fails | PROVIDER_FAILURE | Yes |
| coordinator/process interruption | COORDINATOR_INTERRUPTED | No |

The exact RunEvent shape belongs in GW-DOC-CANONICAL-CONTRACTS-V1. This P4 design requires semantic accuracy; it does not introduce a duplicate event contract.

### GW-TR-078-PRODUCTIVE-PROVIDER-WORKSPACE-FRESHNESS

For STAGE, the admitted inspection workspace has a deterministic material identity derived from existing canonical primitives:

- exact baseline Git commit;
- exact captured current-project delta bytes/hash;
- resolved context hash.

The same productive session may continue only while those facts remain current.

Before a resumed productive STAGE turn, Order re-proves the current source/context and current project-delta identity. If material state changed, Order does not silently update the provider workspace. The Run returns through the existing stale/precondition path with an actionable retry/re-resolution instruction.

Ignored ambient material excluded from the workspace is not part of this identity and therefore cannot create false staleness.

Post-signoff Runs retain their existing immutable baseline + fresh-checkout/candidate-replay behavior.

### GW-TR-079-OPENCODE-INSTRUCTION-BOUNDARY-CERTIFICATION

Certification is layered:

- pure/core tests for deterministic classification/reaction decisions;
- shell tests for Git-visible material capture, workspace materialization, symlink/regular-file constraints and instruction enumeration;
- OpenCode integration tests against the exact pinned 2.2.6 server/client behavior;
- daemon tests for persisted Run/RunEvent classification and bounded recovery;
- browser tests for human-readable failure/retry presentation where the failure is user-visible;
- architecture tests proving one shared productive admission owner and absence of alternate direct productive session paths.

Tests must exercise the actual production functions. Copying the intended algorithm into a test helper and proving the copy is prohibited.


### GW-TR-080-EFFECTIVE-INSTRUCTION-PREFLIGHT

The productive-provider admission boundary must prove all model-context instruction channels before the first productive inference.

The approved technical contract is capability-based:

1. **repository instruction channel** — closed by GW-TR-073..075;
2. **ordinary OpenCode config instruction channel** — Order's private provider namespace contains no configured `instructions`; project/global compatibility discovery remains disabled and is capability-certified;
3. **API-managed session instruction channel** — immediately after session creation Order proves the session instruction-entry list is empty; Order production code has no path that writes instruction entries;
4. **MCP/reference/skill instruction channels** — the effective productive role configuration proves these channels contribute no semantic instructions unless a future governed design explicitly adopts them;
5. **Console/workspace instruction channel** — the provider pin must offer one of the following before productive connected-account use is legal:
   - a supported per-process/configuration capability that disables Console/workspace instruction contribution while retaining the selected provider/account authentication; or
   - a supported pre-inference API that returns the complete effective external instruction manifest with stable source identity and exact bytes, allowing Order to admit only explicitly resolved authority and fail closed otherwise.

Order must not read OpenCode credential secrets, call Console private endpoints using copied credentials, scrape internal provider databases, infer Library emptiness from UI state, or patch hidden provider state to manufacture this proof.

For the currently pinned OpenCode 2.2.6—and for the audited 2.3.0 forward candidate—neither permitted Console capability is available. Therefore **productive use with an active OpenCode Console connection is a known blocked condition under this design** until the external provider capability changes or a separately governed provider-integration decision replaces the current constraint.

Unconnected/free-provider execution may remain eligible only when the complete channel matrix above is mechanically proven for that exact process state.


## 8. Provider-visible file-set law

The productive internal workspace is intentionally narrower than the physical source directory.

### Included

- tracked repository files at the exact admitted baseline;
- current tracked modifications/deletions represented by the admitted current delta;
- current non-ignored untracked files represented by that delta;
- repository-owned WorkItem/lifecycle Markdown when it belongs to that admitted project state.

### Excluded

- ignored untracked dependency trees;
- ignored build/cache/generated/install trees;
- unrelated filesystem content adjacent to or beneath the configured source root that is not in the admitted project projection;
- Order state/evidence/provider-account runtime state;
- fetched submodule contents not present in the admitted repository projection.

A tracked file is project material even when a later ignore rule matches its path. Git tracking, not a directory-name heuristic, owns that fact.

An untracked ignored file is not provider-visible project material merely because the provider could guess its physical source path.

## 9. Instruction semantics

Repository AGENTS.md is not a second authority mechanism.

Its productive semantics are:

~~~text
provider-visible AGENTS.md
        |
        v
must already resolve as P1
        |
        +-- exact path
        +-- exact bytes/hash
        +-- normal P1 precedence/override rules
        |
        v
provider may receive it as OpenCode instruction rendering
~~~

OpenCode's synthetic instruction message is therefore only a provider rendering of authority Order has already resolved.

If an AGENTS.md is legitimate project instruction material but is not declared/resolved at P1, the correct result is an actionable precondition failure telling the project to resolve its authority map. Order does not make the file authoritative automatically.

## 10. Role matrix

| Role/path | Internal workspace | Internal tools | External refs | Instruction closure |
|---|---|---|---|---|
| Research STAGE | materialized inspection snapshot | read/glob/grep | configured STAGE refs only | required |
| Requirements STAGE | same | read/glob/grep | configured STAGE refs only | required |
| Solution design STAGE | same | read/glob/grep | configured STAGE refs only | required |
| Implementation plan STAGE | same | read/glob/grep | configured STAGE refs only | required |
| Readiness review STAGE | same | read/glob/grep | configured STAGE refs only | required |
| Builder | fresh exact execution checkout | read/glob/grep + exact changeSurface edit | none | required |
| Reviewer | fresh replayed candidate checkout | read/glob/grep | none | required |
| Remediator | fresh replayed candidate checkout | read/glob/grep + exact changeSurface edit | none | required |
| Format repair | already admitted session | no tools | none | inherits admitted session |
| Account/model control | private non-project control workspace | non-productive integration operations | none | project instruction closure not applicable |

## 11. Required permanent test matrix

The following cases are minimum certification, not examples to sample from.

### 11.1 Instruction discovery/materialization

1. root tracked AGENTS.md resolved as P1 -> admitted;
2. nested tracked AGENTS.md resolved as P1 -> admitted and exact bytes present;
3. nested tracked AGENTS.md not resolved as P1 -> PRECONDITION_FAILED before provider session use;
4. nested non-ignored untracked AGENTS.md -> included in inspection snapshot and requires P1 resolution;
5. modified tracked AGENTS.md -> snapshot contains current bytes and stale P1 hash is rejected;
6. deleted resolved AGENTS.md -> admission fails as stale/missing material;
7. symlink AGENTS.md -> admission fails without following target;
8. duplicate/ambiguous authority resolution -> admission fails through canonical authority resolution;
9. ignored arbitrary directory containing AGENTS.md -> excluded and does not affect instruction closure;
10. real regression fixture with node_modules/.pnpm/.../recharts/AGENTS.md -> excluded and Research reaches provider invocation;
11. ignored directory name unrelated to JavaScript package managers -> same behavior, proving no node_modules special case;
12. tracked file inside an otherwise ignored-looking path -> remains included as tracked project material.

### 11.2 Provider read/search containment

13. direct read of a guessed ignored dependency path that exists only in the physical source repo -> unavailable from provider workspace;
14. glob cannot return physical-source ignored dependency material absent from workspace;
15. grep cannot match physical-source ignored dependency material absent from workspace;
16. a repository .ignore/ripgrep rule cannot resurrect bytes that are physically absent from the admitted provider workspace;
17. direct read/listing of `.git` and direct read below `.git/*` -> denied;
18. internal symlink resolving outside workspace -> precondition failure before session;
19. internal symlink resolving inside workspace -> allowed only within ordinary role/scope rules;
20. external STAGE reference file is readable when explicitly configured;
21. external reference root containing AGENTS.md does not add that file to project P1/instruction closure and does not trigger nearby instruction injection;
22. Builder/Reviewer/Remediator external-directory access remains denied.

### 11.3 Mutating-role instruction safety

23. existing AGENTS.md path in ExecutionTask.changeSurface -> rejected before productive execution;
24. nonexistent future path ending in AGENTS.md in changeSurface -> rejected before productive execution;
25. candidate adding AGENTS.md through any admitted mutation route -> candidate rejected;
26. candidate deleting/modifying signed AGENTS.md -> candidate rejected;
27. remediation cannot broaden a task to instruction-file mutation.

### 11.4 Every productive role

28. Research productive session succeeds on a realistic installed repository with ignored dependencies;
29. Requirements productive session succeeds through the same shared admission;
30. Solution design productive session succeeds through the same shared admission;
31. Implementation plan productive session succeeds through the same shared admission;
32. Readiness review productive session succeeds through the same shared admission;
33. Builder productive session uses shared admission and exact edit permission;
34. Reviewer productive session uses shared admission and remains read-only;
35. Remediator productive session uses shared admission and exact edit permission;
36. format-repair turn has deny-all tools after an otherwise admitted session.

### 11.5 Failure-origin classification

37. unresolved project AGENTS.md -> PRECONDITION_FAILED, never PROVIDER_FAILED;
38. workspace materialization failure -> PRECONDITION_FAILED, never PROVIDER_FAILED;
39. escaping instruction symlink -> PRECONDITION_FAILED, never PROVIDER_FAILED;
40. model/account readiness missing before productive start -> blocked by readiness or ENVIRONMENT_BLOCKED according to canonical owner, never mislabeled provider turn failure;
41. OpenCode process cannot become ready after local admission -> provider/environment classification required by P6 and persisted with actual detail;
42. session creation/model binding/permission binding failure -> correct provider-origin classification;
43. productive turn transport failure -> PROVIDER_FAILURE;
44. productive turn timeout -> PROVIDER_FAILURE with existing bounded replacement policy;
45. invalid provider output after the one permitted format-repair path -> PROVIDER_FAILURE;
46. coordinator restart/interruption -> COORDINATOR_INTERRUPTED, not PROVIDER_FAILURE.

### 11.6 Freshness and restart

47. repository project-visible bytes unchanged, ignored dependency bytes changed -> same admitted STAGE material identity;
48. tracked/non-ignored project byte changes during an interactive STAGE session -> resumed productive turn detects staleness and does not use a silently changed workspace;
49. P1 AGENTS bytes change during STAGE -> context/instruction freshness fails before continuation;
50. adopted lifecycle/document proposal invalidates the affected old provider context before the next productive turn;
51. daemon restart does not reuse a lost provider process/session as hidden correctness state;
52. retried Run reconstructs provider workspace/instruction closure from canonical current state.

### 11.7 Account/control isolation

53. OpenCode account-control workspace contains no target-repository project instructions;
54. saved-account listing/login/switch/rename/remove do not enumerate target repository AGENTS.md;
55. account-control failure cannot be confused with productive repository-instruction admission.

### 11.8 Architecture/certification sensors

56. architecture test proves STAGE and execution productive paths both call the shared admission owner;
57. architecture test rejects a second unrestricted AGENTS.md filesystem scanner in productive source;
58. architecture test rejects direct productive createOpenCodeSession usage outside the approved shared boundary;
59. architecture test proves task instruction-path mutation rejection remains wired;
60. release/certification run executes the full opencode integration test set on the final candidate.

### 11.9 Complete model-context instruction closure

61. fresh productive session has zero API-managed instruction entries before first prompt;
62. production source has no instruction-entry write/remove call path;
63. private provider config contains no configured `instructions` source and project/global instruction discovery stays disabled;
64. no productive MCP configuration contributes server instructions;
65. no productive reference configuration contributes OpenCode reference instructions;
66. denied/absent skill capability contributes no skill instructions, including Console-downloaded skills;
67. mock connected Console account with non-empty Library instructions is rejected before productive inference by the certified provider-isolation mechanism;
68. mock connected Console account with empty Library still passes only because the same mechanism proves the channel, not because a test fixture happens to be empty;
69. provider refresh/config polling cannot introduce a new external instruction after initial admission without invalidating/halting productive use before the next inference;
70. the exact installed provider pin exposes the certified disable or complete pre-inference manifest capability required by GW-TR-080;
71. a pin candidate lacking that capability fails provider certification and cannot be released as productive;
72. OpenCode 2.2.6 regression fixture proves connected-account productive readiness is blocked rather than silently executing with an unprovable instruction context;
73. OpenCode 2.3.0 forward-candidate fixture/contract audit proves a version bump alone does not satisfy GW-TR-080.

## 12. Browser/operator consequence

The workbench already requires human-readable execution visibility under GW-FR-054..057.

For this concern:

- ignored dependency instructions are invisible because they are not project material and do not cause a Run failure;
- unresolved real project instructions surface as a repository/governance precondition with the actual repository-relative instruction path and a recovery direction to resolve project authority;
- raw internal ids/hashes remain Technical details;
- Retry is offered only when retry can meaningfully re-run the corrected admission path;
- the UI must not say "Agent execution failed" for a deterministic local admission failure.

No new browser-only failure state is introduced.

## 13. Canonical-contract realization

GW-DOC-CANONICAL-CONTRACTS-V1 §36 now owns the exact P6 realization of this P3/P4 design:

1. exact persisted RunEvent representation for non-provider productive-invocation failure detail;
2. exact mapping from admission failure origin to existing Run terminal classifications;
3. exact STAGE provider-workspace material identity/evidence needed for resumed-turn freshness;
4. exact prohibition on ExecutionTask changeSurface paths naming AGENTS.md independent of current existence;
5. exact certification assertions added to the external integration matrix.

The P6 realization reuses existing canonical Run/RunEvent/ArtifactRef/RepositoryPath/Sha256 contracts and introduces no ProductiveWorkspace DTO/domain model family.

## 14. Existing canonical-owner alignment

The following canonical owners are aligned with this concern on the current design branch:

- GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 records the exact pinned direct-read versus ripgrep-search behavior that motivates the workspace boundary;
- GW-DOC-OPENCODE-INTEGRATION-V1 delegates productive workspace/instruction closure to this concern and no longer treats the physical configured source directory as the provider-visible project-material boundary;
- GW-DOC-TECHNICAL-ARCHITECTURE-V1 requires the isolated STAGE inspection-workspace architecture;
- GW-DOC-CANONICAL-CONTRACTS-V1 §36 owns the exact P6 contracts from §13;
- the remaining downstream artifact is the P7 0.2.2 implementation plan, which must translate this design plus the separately owned workbench/settings corrections into exact tasks and gates.

## 15. Explicit non-goals

This design does not authorize:

- changing the pinned OpenCode version;
- patching/forking OpenCode;
- a proxy around OpenCode file tools;
- parsing .gitignore in Order;
- hard-coded ecosystem ignore lists;
- copying the whole physical repository and deleting guessed directories afterward;
- container/sandbox infrastructure solely for this defect;
- enabling shell/execute tools for agents;
- importing OpenCode's internal instruction representation into Order;
- making external reference roots authoritative;
- allowing agent mutation of AGENTS.md;
- changing lifecycle stage semantics;
- changing the existing one-provider-per-Run control-plane ownership;
- a second repository registry, source model or authority resolver.

## 16. Design completion criteria

The functional/P4/P6 design baseline is complete because:

1. the new FR/TR identifiers are registered in `pontivus-order.toml`;
2. the existing canonical owners listed in §14 are aligned with this concern;
3. the P6 failure/workspace identity consequences are exact;
4. complete model-context instruction ingress is enumerated and governed by GW-FR-105 / GW-TR-080.

Implementation readiness additionally requires (a) a provider pin/capability that satisfies GW-TR-080 for the intended authenticated productive path and (b) a P7 0.2.2 plan that maps every requirement and every test family to bounded tasks and leaves no implementer decision about provider-visible project material, `AGENTS.md` authority, failure origin, workspace freshness or verification coverage.
