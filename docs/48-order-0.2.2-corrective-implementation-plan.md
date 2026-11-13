# 48 — Order 0.2.2 corrective workspace, trusted-integration and workbench implementation plan

**Canonical concern ID:** GW-P7-ORDER-0.2.2-CORRECTIVE-IMPLEMENTATION  
**Versioned concern ID:** GW-P7-ORDER-0.2.2-CORRECTIVE-IMPLEMENTATION-V1-2026-11-13  
**Status:** Implementation-ready P7 plan  
**Target repository:** pontivus-com/order  
**Target public release:** 0.2.2  
**Pyramid layer:** P7 implementation plan  
**Production implementation baseline:** af5a83e104b9d6690406cbc4eed8161d06efa4da  
**Prepared:** 2026-11-13  
**Purpose:** realize the complete 0.2.2 corrective P3/P4/P6 baseline as one cumulative repository transition: deterministic productive OpenCode workspaces and exact repository-instruction closure; explicit trusted Console/skill/MCP integration admission; accurate local-vs-provider failure classification and STAGE freshness; and the remaining Workbench/Settings/editor UX corrections.

This document is execution authority only. It does not redefine product requirements, architecture or canonical contracts. If implementation evidence contradicts P1-P6, the work returns to the owning layer instead of inventing an implementation-local policy.

## 1. Governing authority

### P1

The implementation inherits and must preserve:

- GW-P1-FCIS;
- GW-P1-SOC;
- GW-P1-DRY;
- GW-P1-STRICT-TYPING;
- GW-P1-CANONICAL-OWNERSHIP;
- GW-P1-EXPLICIT-FLOW;
- GW-P1-MINIMUM-CHANGE;
- GW-P1-DOC-CANONICALITY;
- GW-P1-AUTHORITY-BEFORE-INFERENCE.

### Product/functional authority

The task implements the applicable behavior in:

- GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1, including GW-FR-099..105;
- GW-DOC-WORKBENCH-UX-V1, especially GW-FR-051, GW-FR-053..057, GW-FR-059, GW-FR-083..086, GW-FR-094, GW-FR-096..097;
- GW-DOC-MARKDOWN-WORKBENCH-V1, especially GW-FR-067 and GW-FR-069;
- GW-DOC-INSTALLATION-READINESS-V1, especially GW-FR-092.

### Technical/contract authority

The task implements:

- GW-DOC-OPENCODE-INTEGRATION-V1;
- GW-DOC-TECHNICAL-ARCHITECTURE-V1;
- GW-DOC-CANONICAL-CONTRACTS-V1 §36;
- GW-TR-073..081;
- GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1, especially GW-TR-063..066;
- the existing CodeMirror/editor contracts in GW-TR-039..044;
- the existing saved-account, configuration, repository and validation contracts where not changed by 0.2.2;
- GW-DOC-EXTERNAL-FACTS-V1-2026-11-12 as the exact external dependency fact owner.

No implementation step may reinterpret a selected trusted integration as canonical Order authority.

## 2. Baseline findings that the implementation must actually change

The P7 is based on the current production source, not on inferred gaps.

1. src/daemon/stage.ts still starts productive OpenCode directly against workItem.repositoryRoot. This exposes ignored physical material to direct reads and causes the observed dependency-owned AGENTS.md failure class.
2. src/shell/repository.ts already owns the correct Git primitives for fresh checkout and current-delta/candidate capture. It uses Git itself and does not parse ignore files. This owner must be reused/generalized; there must not be a second Git/copy engine.
3. src/shell/opencode.ts currently enumerates AGENTS.md paths only and compares them with resolved P1 paths. It does not prove exact bytes, missing expected instructions, symlink instruction entries or future AGENTS.md changeSurface paths.
4. STAGE and post-signoff execution independently call startOpenCodeServer/createOpenCodeSession. Productive admission therefore has multiple orchestration paths.
5. src/daemon/stage.ts and src/daemon/execution.ts still route provider setup/admission exceptions into failRunForProvider, even when no provider-origin failure occurred.
6. src/core/contracts.ts does not yet expose PRODUCTIVE_INVOCATION_FAILED and does not reject a changeSurface path whose final segment is AGENTS.md.
7. src/daemon/runtime.ts ActiveProvider currently binds only server + session. It does not carry the transient STAGE material identity or selected trusted-account identity required for live-session freshness.
8. OpenCode process bootstrap already uses Order-private HOME/XDG/database roots and disables project/Claude compatibility configuration, but it does not yet supply the Run-specific OPENCODE_CONFIG_CONTENT required by GW-TR-080/081.
9. OpenCode 2.2.6 exposes skill.list and mcp.list. Skill permission uses action "skill" with the exact skill id as resource. MCP tool permission actions use the normalized server namespace plus normalized tool name; with execute denied, permitted MCP tools are exposed directly. The implementation may use these pinned behaviors, but must permanently certify them.
10. WorkItemWorkspace currently mixes identity, workflow progression and workspace-view selection into one top header.
11. WorkbenchLayout renders a permanent wide context rail whenever an inspector exists; Context is therefore not closed by default.
12. ActivityWorkspace duplicates selected-Run state in an outer summary and an inner selected-run heading.
13. WorkItemQueue and DocumentWorkspace still leak raw lifecycle identifiers such as R1/R2/DESIGN/PLAN/R3 in ordinary presentation.
14. SettingsWorkspace still renders an always-open "Connect target repository" input and disconnects immediately without the required destructive confirmation.
15. CodeMirror itself owns content scrolling, but the remaining-height/flex chain and permanent browser evidence do not yet prove exact final-line reach/edit with Save/Cancel retained at wide and narrow viewports.

These findings define the required transition. They do not authorize cleanup elsewhere.

## 3. Required end state

The implementation is complete only when all of the following are simultaneously true.

1. Every productive OpenCode role runs in an admitted workspace, never directly against the physical target repository.
2. STAGE sees exact Git-visible current project material: baseline tracked files + tracked working changes + non-ignored untracked files; ignored untracked dependency/build/cache/install material is absent without any ecosystem blacklist.
3. Every provider-visible repository AGENTS.md is a regular file, already resolved as P1, and byte-identical to its resolved ArtifactRef. Expected resolved repository instructions cannot be silently absent.
4. A provider workspace has no symlink escape outside its workspace. AGENTS.md symlinks always fail. Internal symlinks are permitted only when their resolved targets remain inside the admitted workspace and mutating paths cannot redirect writes.
5. .git and .git/* remain denied provider read resources.
6. ExecutionTask changeSurface cannot name AGENTS.md whether or not the file currently exists, and V2 candidate validation independently rejects any candidate adding, deleting or modifying an AGENTS.md path.
7. STAGE, BUILDER, REVIEWER and REMEDIATOR enter OpenCode through one shared procedural productive-admission owner in src/shell/opencode.ts. Format repair remains deny-all on an already admitted session.
8. Local workspace/authority/admission failure is persisted as PRODUCTIVE_INVOCATION_FAILED with PRECONDITION_FAILED or ENVIRONMENT_BLOCKED. PROVIDER_FAILED is reserved for the provider boundary after local admission.
9. A live STAGE provider is bound to baselineCommit + exact current project-delta hash + contextHash. A material delta change stops reuse and returns through the existing stale/precondition retry path; ignored excluded bytes do not cause false staleness.
10. Productive OpenCode keeps the existing private account namespace and receives one deterministic Run-specific OPENCODE_CONFIG_CONTENT. For 0.2.2 this projects configured STAGE reference roots as explicit local references and otherwise remains minimal; no new Order skill/MCP registry or OrderConfig field is introduced.
11. The active selected Console account is the trusted integration identity. The live provider records its safe account id transiently, and existing account-mutation blocking preserves identity for the Run.
12. After provider startup, Order lists visible skill ids and MCP server names. It grants skill only to the listed ids and grants each trusted MCP server namespace its generated tool-action wildcard. execute stays denied. Because ambient config is disabled, the visible set is attributable only to the selected trusted Console integration plus any explicit Run config.
13. Provider-native Console Library/skill/MCP semantics may influence the model but never become P1-P7 authority, enlarge changeSurface, mutate AGENTS.md, bypass session permissions, adopt artifacts or satisfy validation/signoff.
14. WorkItem identity/header, workflow process rail, workspace-view selector and within-view selector are four distinct presentation layers.
15. Context/Details is closed by default. Wide screens may open a collapsible trailing inspector only when usable detail width is retained; otherwise Context uses the existing drawer/overlay behavior.
16. Activity remains history + one selected-Run detail. One selected-Run header owns status, role/attempt/time, actions and technical disclosure; the duplicate summary/heading is removed.
17. Ordinary queue, workflow, document and Activity labels use the shared human workflow projection. Raw canonical enum values are confined to Technical details.
18. Documents has one coherent selected-document control surface containing edit/preview/split, formatting, dirty/current state, Save/Cancel, Git state, Save documentation to Git and Details/Technical. Redundant bars are removed rather than restyled.
19. Long Source and lifecycle Markdown can scroll to, edit and save the exact final line while Save/Cancel remain reachable at wide and narrow supported viewports.
20. Repository Settings shows inventory first. Add repository explicitly opens the bounded add flow. Disconnect requires a destructive confirmation naming the repository and explicitly stating that repository Markdown, Git history and project authority are not deleted.
21. The 73-case productive OpenCode matrix and the required browser/architecture regression coverage are permanent, production-function tests.
22. No new dependency, database table/version, OrderConfig version/field, provider framework, repository abstraction, DTO/ViewModel family, global store, Git library or ignore parser is introduced.

## 4. One cumulative signed task

This correction must be implemented and validated as one repository state. Order's P7 contract does not compose candidate bytes from dependent execution tasks. Therefore this plan deliberately contains exactly one signed implementation task.

The worker may execute the ordered internal phases below and run intermediate checks, but they are checkpoints inside one task, not independent signed task candidates.

## 5. Internal phase A — canonical contracts and pure invariants

### A1. Run event contract

In src/core/contracts.ts:

- add PRODUCTIVE_INVOCATION_FAILED to the canonical RunEventPayload union;
- fields are:
  - tag;
  - classification limited to PRECONDITION_FAILED | ENVIRONMENT_BLOCKED;
  - non-empty human-actionable detail;
  - existing immutable EvidenceRef array, default/empty where no evidence artifact is required;
- do not create a second failure taxonomy or browser-specific event model.

In ui/src/workbench-presentation.ts:

- add the human presentation mapping for PRODUCTIVE_INVOCATION_FAILED;
- keep raw classification/detail available only where the current technical/evidence UI already exposes it.

### A2. Instruction-path immutability

In src/core/contracts.ts:

- apply one shared path-semantic predicate to the signed task definition/changeSurface parsing and ExecutionTaskSchema;
- reject any changeSurface value whose final RepositoryPath segment is exactly AGENTS.md;
- do not test filesystem existence to make this decision.

In src/daemon/validation.ts:

- make V2 validateChangedPaths independently reject any changed path whose final segment is AGENTS.md before ordinary scope acceptance can pass;
- preserve existing SCOPE_BREACH validation ownership rather than inventing another candidate-validation event.

### A3. Intermediate checkpoint

Run typecheck + architecture + core/unit tests that cover the new event and both independent AGENTS.md mutation sensors before proceeding.

## 6. Internal phase B — exact Git-visible inspection workspace

All Git mechanics remain in src/shell/repository.ts.

### B1. Generalize, do not duplicate, current-delta capture

The existing candidate capture mechanics are the canonical implementation for "HEAD plus Git-visible working delta":

- temporary isolated GIT_INDEX_FILE;
- read-tree HEAD;
- intent-to-add --all;
- binary/full-index Git diff;
- changed path projection.

Factor only as required so candidate capture and STAGE inspection materialization call the same underlying Git-visible delta operation. Preserve the public candidate semantics used by execution. Do not add a second patch shape/domain model.

### B2. Materialize STAGE inspection workspace

Add one repository-shell operation used by STAGE that:

1. proves the source Git root and exact current HEAD equals run.baselineCommit;
2. captures the current Git-visible delta using B1;
3. creates the run workspace from the exact baseline through existing createFreshCheckout;
4. applies the captured binary delta;
5. re-captures the workspace delta and requires exact patch hash + changed-path equality with the source capture;
6. returns the captured delta SHA-256 needed for transient material identity;
7. never copies ignored physical directories, never parses .gitignore, never mutates the user's index and never initializes/fetches submodules.

The source repository remains canonical; the run workspace is transient execution projection.

### B3. Workspace escape proof

Before provider startup:

- walk admitted workspace entries without following symlinks;
- any symlink resolving outside the admitted workspace fails PRECONDITION_FAILED;
- AGENTS.md symlink/non-regular entry fails regardless of target;
- internal symlinks may remain only when realpath remains inside the workspace;
- for BUILDER/REMEDIATOR, every signed edit path must resolve to its own semantic path inside the workspace rather than traverse a symlink redirect;
- no path may resolve into Order state/evidence/account-control storage except the run workspace itself.

Do not add an ecosystem directory blacklist.

## 7. Internal phase C — exact repository instructions and one productive provider admission

### C1. Exact AGENTS.md closure

Replace the current path-only assertAgentInstructionsResolved behavior in src/shell/opencode.ts.

The operation must consume existing canonical ArtifactRef values from ResolvedContext.artifacts; do not introduce ProviderInstruction or another authority representation.

For each admitted workspace:

- enumerate every directory entry named AGENTS.md without following it;
- require it to be a regular non-symlink file;
- canonicalize its workspace-relative path as RepositoryPath;
- require a matching resolved P1 ArtifactRef whose repositoryPath is that path;
- SHA-256 current workspace bytes and require exact equality to ArtifactRef.sha256;
- for every resolved P1 ArtifactRef whose final path segment is AGENTS.md, require that exact file to exist in the admitted workspace with matching bytes;
- reject task changeSurface AGENTS.md paths independently of the enumerated current file set.

### C2. Run-specific OpenCode configuration

Extend the existing private provider environment builder in src/shell/opencode.ts to accept an optional deterministic inline JSON configuration and set OPENCODE_CONFIG_CONTENT only for that process.

For 0.2.2:

- STAGE projects runtime.config.referenceRoots into local OpenCode references;
- sort roots deterministically and assign deterministic aliases such as order-reference-001, order-reference-002;
- each entry is local/path-based with a concise non-authoritative read-only description;
- BUILDER/REVIEWER/REMEDIATOR omit external references;
- do not copy credentials into this configuration;
- do not add OrderConfig fields for skills or MCPs;
- do not create an Order skill/MCP registry;
- ambient project/global/Claude skill/config discovery remains disabled exactly as today.

### C3. Trusted skill and MCP admission

After the exact provider process is ready and before session creation:

- query the released skill.list operation at the admitted workspace and obtain the exact visible skill ids;
- query the released mcp.list operation and obtain the exact visible MCP server names;
- because host/project/global config is excluded, treat these visible objects as contributed by the selected trusted Console integration plus explicit Run config;
- add exact permission allow rules action="skill", resource=<skill id> for each visible skill;
- derive each MCP namespace exactly as pinned OpenCode 2.2.6 does: replace every character outside [A-Za-z0-9_-] in the server name with "_" and allow action "<normalized-server>_*", resource="*";
- retain deny-all as the first rule and rely on the pinned last-match-wins evaluator for subsequent explicit allows;
- retain read/glob/grep;
- add explicit read denies for .git and .git/* after the broad read allow;
- retain exact STAGE external_directory roots only for STAGE;
- retain exact edit rules only for BUILDER/REMEDIATOR task.changeSurface;
- do not add an execute allow; execute remains denied, so trusted MCP tools are direct provider tools rather than a shell/Code Mode escape;
- do not infer "read-only" or "mutating" from MCP tool names. Selection of the trusted integration/server set is the trust decision.

Permanent integration tests must prove the normalization/wildcard behavior against the exact 2.2.6 semantics.

### C4. Selected Console account identity

On the productive provider process itself, query the released opencode integration projection and determine the active credential id through the same safe connection semantics already used for saved-account presentation.

- require a usable active account where current readiness says one is required;
- bind only the safe account id transiently to ActiveProvider;
- do not persist credential bytes/tokens or create a new account table/model;
- existing active-Run account-mutation guards remain the concurrency owner.

### C5. Shared productive admission

Keep the shared procedural owner in src/shell/opencode.ts; do not add a provider service/class/module.

Every STAGE/BUILDER/REVIEWER/REMEDIATOR provider session must call the same productive admission operation after its role-specific workspace has been materialized/replayed.

The shared operation owns, in order:

1. workspace escape proof;
2. exact repository instruction closure;
3. Run-specific inline config selection;
4. start/version/model readiness of pinned OpenCode;
5. visible trusted skill/MCP/account preflight;
6. exact role permission derivation;
7. session creation/model switch/permission update;
8. exact model + permission read-back binding.

Only this shared operation may create a productive session. Account-control/model-listing non-productive processes remain separate and must not run project instruction admission.

Format repair continues on the already admitted session with deny-all tools.

## 8. Internal phase D — correct failure origin and STAGE freshness

### D1. Local productive failure persistence

In src/daemon/run.ts add the coordinator-owned helper that persists PRODUCTIVE_INVOCATION_FAILED and terminalizes the Run with the event's existing canonical classification.

It must:

- use PRECONDITION_FAILED for repository materialization/proof, workspace escape, unresolved/stale instruction and equivalent local project-admission failure;
- use ENVIRONMENT_BLOCKED only where the existing readiness/integration owner classifies a required local runtime/account/model prerequisite that way;
- never write PROVIDER_FAILED for those conditions.

### D2. Provider boundary

PROVIDER_FAILED remains unchanged for:

- pinned process readiness/version/model/session binding failures after local workspace/instruction admission where the provider is the failing boundary;
- admitted turn transport/provider/completion/format/parse failures as already governed.

The daemon may use a minimal shell-local error marker carrying the existing canonical terminal class to preserve origin across the shared admission call. It must not introduce a persisted/public failure model or duplicate classification enum.

### D3. STAGE live material identity

Extend ActiveProvider only with transient fields needed by P6:

- stageMaterialIdentity: Sha256 | null;
- trustedAccountId: OpenCodeAccountId | null.

For STAGE, compute stageMaterialIdentity through the existing canonical JSON/hash owner from:

- run.baselineCommit;
- captured currentProjectDeltaSha256;
- current run.contextHash.

Before every resumed productive STAGE turn:

1. re-resolve current context as today;
2. re-capture the physical repository's Git-visible current delta using the shared repository owner without mutating the active workspace;
3. recompute material identity;
4. if it differs, stop the old provider/session and terminalize through PRODUCTIVE_INVOCATION_FAILED/PRECONDITION_FAILED with an actionable retry/re-resolution message;
5. if only excluded ignored ambient bytes changed, identity remains equal and the session may continue;
6. context changes already handled by canonical context re-resolution must never result in an old session reading new workspace bytes.

Post-signoff candidate/baseline freshness remains under the existing V0-V7 execution path.

## 9. Internal phase E — WorkItem hierarchy, Context and Activity

### E1. WorkItem hierarchy

In WorkItemWorkspace:

- identity/header row contains Back, title/current state, actual WorkItem actions and Context/Details affordance;
- move workflow progression into its own dedicated process rail below/adjacent as a separate semantic region;
- move workspace-view segmented control to the primary canvas boundary;
- do not combine document selection into either of those rows;
- preserve non-mutating workflow-step inspection and dirty-buffer safety.

### E2. Context/Details

In WorkbenchLayout + app + WorkItemContext:

- Context is closed by default and consumes no width while closed;
- expose Context/Details action on wide as well as narrow WorkItem views;
- when sufficiently wide and opened, use the existing trailing inspector composition only if the primary detail remains at least the canonical usable width; otherwise use the existing Drawer;
- medium/narrow always uses the Drawer;
- WorkItemContext becomes selected-view context/technical inspection, not a duplicate identity/status summary;
- Documents context focuses selected document path/SHA/Git technical data;
- Activity context focuses selected Run technical/diagnostic detail where applicable;
- large evidence remains in Evidence/technical primary surfaces.

Do not create a global context state store.

### E3. Activity

In ActivityWorkspace:

- keep the history master on the left and selected Run detail on the right;
- remove the duplicated outer Activity summary + inner run heading;
- one selected-Run header owns step/role, status, attempt, start time, Retry/Cancel and Technical details;
- timeline owns the remaining vertical detail height;
- input composer remains attached to the selected live STAGE Run;
- do not add a third permanent debug/context column.

### E4. Human lifecycle labels

Use workbench-presentation.ts as the only ordinary-language workflow projection.

- WorkItemQueue stage column + accessible row text use workflowPresentation;
- DocumentWorkspace lifecycle tabs/titles use the same shared mapping rather than artifact.role;
- Activity headings/actions continue through shared workflow/run presentation;
- raw enum values remain only inside Technical details.

If a small artifact-role-to-workflow projection is required, add it to workbench-presentation.ts using canonical role values; do not create a ViewModel type hierarchy.

## 10. Internal phase F — document controls, editor geometry and repository Settings

### F1. One document control surface

DocumentWorkspace + MarkdownEditor must render one selected-document control surface that contains:

- Edit / Preview / Split;
- formatting controls;
- dirty/current state;
- Save / Cancel;
- documentation Git state;
- Save documentation to Git;
- Details/Technical containing selected path, exact SHA where available, branch and HEAD.

Delete redundant status/action strips or headings after transferring their unique function. Do not duplicate Git state in Context and the editor control surface.

Narrow layouts may wrap/compact this same semantic surface; they do not create a second action bar.

### F2. Long Markdown scroll ownership

Preserve CodeMirror's .cm-scroller overflow ownership.

Correct the flex/min-height chain in theme/layout CSS and only the minimum component hooks needed so:

- the editor receives remaining available height;
- .cm-scroller scrolls content;
- surrounding selected-document controls remain reachable;
- no page-level fixed-height hack masks the problem.

Permanent Chromium tests must create both a long WorkItem Source document and a long lifecycle Markdown document and, at wide + narrow supported viewport widths:

1. enter edit mode;
2. scroll CodeMirror to the exact final line;
3. put the caret in that final line;
4. modify it;
5. prove Save and Cancel remain reachable;
6. save and reload;
7. prove the exact final-line edit persisted.

A bounding-box-only or "Save is visible" assertion is insufficient.

### F3. Repository Settings interaction

RepositorySettings retains the existing canonical backend commands.

Change presentation only:

- repository inventory remains first;
- replace the permanently open connect form with an explicit Add repository action;
- Add repository opens a bounded form/dialog/section for one exact Git root;
- existing connected root is displayed as identity, not as an editable field;
- Disconnect repository opens AlertDialog;
- the dialog title/body names the repository/root and states that Order removes the connection only; repository Markdown, Git history and project authority are not deleted;
- Cancel/dismiss performs no mutation;
- active productive-work/config blockers continue to come from the daemon;
- document-root migration remains a separate governed action.

No new repository API or config writer is authorized.

## 11. Internal phase G — permanent certification

The implementation must convert the full §11 matrix of GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1 into permanent tests at their correct owners.

### Core/contract tests

At minimum:

- PRODUCTIVE_INVOCATION_FAILED schema accepts only the two canonical local classifications;
- signed-task/changeSurface AGENTS.md path rejection is existence-independent;
- no readiness schema reintroduces PROVIDER_INSTRUCTION_ISOLATION_UNAVAILABLE.

### Repository/shell tests

Cover matrix cases 1-23 and relevant 47-55:

- root/nested tracked/untracked/modified/deleted/symlink AGENTS;
- exact byte mismatch;
- ignored arbitrary directories;
- real node_modules/.pnpm/.../recharts/AGENTS.md regression fixture;
- tracked file in ignored-looking path remains;
- direct-read source ignored dependency absent;
- glob/grep cannot discover absent physical ignored bytes;
- .git/.git/* permission denial;
- internal and escaping symlinks;
- STAGE reference root disjointness/non-authority;
- workspace materialization exact patch replay;
- source drift vs ignored ambient drift;
- restart semantics.

### OpenCode integration tests

Against exact v2.2.6:

- one productive session owner;
- OPENCODE_CONFIG_CONTENT reaches the provider process and project/global/Claude ambient sources remain excluded;
- STAGE reference projection appears as expected;
- exact skill.list ids become exact skill permission resources;
- MCP server names become the pinned normalized namespace wildcard;
- execute remains denied and admitted MCP tools are directly reachable;
- Console selected account identity is the provider identity bound for the Run;
- Console Library/skills are treated as trusted integration context, not copied into Order authority;
- API instruction-entry list is empty and production source contains no instruction-entry mutation;
- no host/global skill fixture becomes available.

### Daemon tests

Cover matrix cases 28-52:

- Research/R1, Requirements/R2, DESIGN, PLAN, R3 all use inspection workspace + shared admission;
- BUILDER/REVIEWER/REMEDIATOR all use shared admission;
- local failures persist PRODUCTIVE_INVOCATION_FAILED, never PROVIDER_FAILED;
- real provider setup/turn failures remain PROVIDER_FAILED;
- STAGE material-identity drift stops/requires retry;
- ignored excluded drift does not;
- account control remains non-project and account mutation is blocked while Run active;
- format repair remains deny-all.

### Architecture/certification sensors

Extend the existing architecture/certification suites to prove:

- stage.ts never starts provider on workItem.repositoryRoot;
- productive session creation has one production owner in src/shell/opencode.ts and stage/execution do not call released session.create directly;
- there is no .gitignore parser, ecosystem blacklist or recursive physical repository copy;
- no new repository/Git/provider service/class/domain family exists;
- no new OrderConfig skill/MCP registry/field exists;
- production code contains no session-instruction-entry writer;
- no browser lifecycle-label duplication/raw R1/R2/R3 presentation path remains outside Technical details;
- no permanent wide Context rail is rendered while closed;
- no always-open Connect target repository form remains;
- disconnect mutation is reachable only through confirmed action.

### Browser tests

Cover:

- four-level WorkItem hierarchy and workflow inspection;
- Context closed by default, wide opened inspector behavior, drawer behavior at narrower viewport;
- Activity one-header master/detail geometry and action placement;
- human lifecycle labels in queue/document/activity;
- one coherent document control surface;
- long Source and lifecycle final-line edit/save at wide and narrow;
- Add repository bounded flow;
- destructive, non-delete Disconnect confirmation and cancel/no-mutation.

Tests must exercise production components/functions, not copied algorithms.

## 12. Exact change-surface forecast

### Production modules expected to change

Core:
- src/core/contracts.ts

Shell:
- src/shell/repository.ts
- src/shell/opencode.ts

Daemon:
- src/daemon/runtime.ts
- src/daemon/run.ts
- src/daemon/stage.ts
- src/daemon/execution.ts
- src/daemon/validation.ts

Browser:
- ui/src/primitives/WorkbenchLayout.tsx
- ui/src/app.tsx
- ui/src/WorkItemWorkspace.tsx
- ui/src/WorkItemContext.tsx
- ui/src/DocumentWorkspace.tsx
- ui/src/ActivityWorkspace.tsx
- ui/src/WorkItemQueue.tsx
- ui/src/workbench-presentation.ts
- ui/src/SettingsWorkspace.tsx
- ui/src/MarkdownEditor.tsx
- ui/src/MarkdownSourceEditor.tsx
- ui/src/theme.css

Verification:
- tests/core.test.ts
- tests/shell.test.ts
- tests/opencode.test.ts
- tests/daemon.test.ts
- tests/architecture.test.ts
- tests/certification.test.ts
- tests/browser.spec.ts
- tests/e2e-server.ts

Delivery:
- CHANGELOG.md

### Explicitly not forecast

No change is authorized to:

- package.json or bun.lock;
- SQLite schema/version or src/shell/sqlite.ts;
- OrderConfig schema/version/fields beyond the event/task changes already owned in src/core/contracts.ts;
- src/shell/config.ts;
- src/daemon/settings.ts or its canonical repository/config commands;
- src/daemon/server.ts or public HTTP routes;
- ui/src/http.ts;
- AGENTS.md;
- pontivus-order.toml during P8;
- other P1-P7 docs during P8;
- GitHub workflow/release infrastructure.

If implementation proves one of these exclusions must change to satisfy the signed behavior, stop and return to PLAN/DESIGN as applicable. Do not silently broaden the task.

## 13. No-new-abstraction constraints

The worker/reviewer must enforce these specific minimum-change constraints.

- No ProviderWorkspace DTO/domain/persistence family.
- No ProductiveAgentEnvironment DTO/domain/persistence family.
- No provider service/class.
- No second Git implementation/library.
- No .gitignore parser.
- No hard-coded node_modules/.venv/dist/vendor/target blacklist.
- No full source-tree copy followed by deletion.
- No new sandbox/container infrastructure.
- No new OpenCode fork/patch.
- No new Order skill or MCP registry/config field.
- No duplicated workflow-label map.
- No browser readiness/failure taxonomy.
- No new repository API for Settings Add/Disconnect.
- No global browser state store.
- No lifecycle enum changes solely for presentation.

A same-layer helper extraction inside repository.ts or opencode.ts is allowed only when it is the minimum way to reuse the existing owner and avoid duplication. It must not become a new semantic authority.

## 14. Ordered implementation checkpoints

The single signed task should execute in this order:

1. **Contracts checkpoint:** A complete; typecheck + core + architecture.
2. **Workspace checkpoint:** B + C1 complete; shell tests for Git-visible material/instruction closure/escape.
3. **Provider checkpoint:** C2-C5 complete; pinned OpenCode integration tests prove trusted skill/MCP/account/config admission.
4. **Failure/freshness checkpoint:** D complete; daemon tests prove exact event origin and STAGE drift behavior.
5. **Workbench checkpoint:** E complete; focused browser/unit presentation tests.
6. **Document/Settings checkpoint:** F complete; focused long-document and repository-settings browser tests.
7. **Certification checkpoint:** G complete; architecture/certification matrix and full required gates.
8. **Diff-reduction review:** remove obsolete code/duplicated presentation created unnecessary by the transition, then rerun full gates.

A checkpoint failure may be repaired only within the already resolved P1-P7 semantics. A required new product behavior, canonical state, external dependency, effect boundary or validation contract returns upstream.

## 15. Verification contract

The signed task requires the complete gate union:

1. dependency-lock
2. typecheck
3. architecture
4. test
5. build
6. browser

All must pass on the same candidate repository state.

In addition, the reviewer must explicitly verify:

- all 73 productive-provider matrix cases are represented by permanent executable evidence or a clearly identified equivalent grouped test that proves every proposition;
- no old direct productive session path remains;
- no obsolete provider-isolation readiness blocker remains in productive code/UI;
- trusted integration semantics are not represented as canonical ArtifactRef/P1 material;
- no raw workflow enum leaks remain in ordinary surfaces covered by the design;
- no redundant document/activity/context presentation remains;
- actual diff stays within the forecast or any same-layer file movement is explicitly justified by the existing P7 decomposition rule.

## 16. Delivery

This task implements the 0.2.2 package but does not itself perform the final public version bump/release publication.

After this single implementation candidate is independently reviewed and merged:

- the ordinary PR must declare SemVer impact patch and target release 0.2.2;
- CHANGELOG [Unreleased] must describe the implemented corrective behavior;
- the repository's existing governed release flow may create the separate release/version PR for 0.2.2;
- no implementation task may modify release infrastructure merely to publish this correction.

## 17. Machine-readable signed task

The following is the only machine-readable P7 task authority in this document.

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "P7-T01",
      "objective": "Implement the complete Order 0.2.2 corrective productive OpenCode workspace/trusted-integration boundary and Workbench/Settings/editor UX corrections as one cumulative repository state.",
      "dependsOn": [],
      "scope": [
        "CHANGELOG.md",
        "src/core/contracts.ts",
        "src/shell/repository.ts",
        "src/shell/opencode.ts",
        "src/daemon/**",
        "ui/src/**",
        "tests/**"
      ],
      "exclusions": [
        "AGENTS.md",
        "package.json",
        "bun.lock",
        "pontivus-order.toml",
        "docs/**",
        ".github/**",
        "src/shell/sqlite.ts",
        "src/shell/config.ts",
        "src/daemon/server.ts",
        "src/daemon/settings.ts",
        "ui/src/http.ts"
      ],
      "acceptanceRefs": [
        "GW-FR-051-USER-FACING-WORKFLOW-LANGUAGE",
        "GW-FR-053-ACTIVITY-WORKSPACE",
        "GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY",
        "GW-FR-055-ACTIONABLE-FAILURE-RECOVERY",
        "GW-FR-057-TECHNICAL-DETAILS-BOUNDARY",
        "GW-FR-059-RESPONSIVE-ACTIVITY-CONTINUITY",
        "GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS",
        "GW-FR-069-EDITOR-STATE-CONTINUITY",
        "GW-FR-083-CURRENT-REPOSITORY-CONTEXT",
        "GW-FR-084-WORKFLOW-STEP-INSPECTION-NAVIGATION",
        "GW-FR-085-WORKBENCH-CHROME-CONSOLIDATION",
        "GW-FR-086-PRIMARY-TECHNICAL-DETAIL-ECONOMY",
        "GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION",
        "GW-FR-094-INFORMATION-PLACEMENT-ECONOMY",
        "GW-FR-096-SEMANTIC-VIEWPORT-ZONING",
        "GW-FR-097-LOGICAL-READING-FLOW",
        "GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT",
        "GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE",
        "GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY",
        "GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION",
        "GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE",
        "GW-FR-104-STAGE-WORKSPACE-FRESHNESS",
        "GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE"
      ],
      "changeSurface": [
        "CHANGELOG.md",
        "src/core/contracts.ts",
        "src/shell/repository.ts",
        "src/shell/opencode.ts",
        "src/daemon/runtime.ts",
        "src/daemon/run.ts",
        "src/daemon/stage.ts",
        "src/daemon/execution.ts",
        "src/daemon/validation.ts",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/app.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/theme.css",
        "tests/core.test.ts",
        "tests/shell.test.ts",
        "tests/opencode.test.ts",
        "tests/daemon.test.ts",
        "tests/architecture.test.ts",
        "tests/certification.test.ts",
        "tests/browser.spec.ts",
        "tests/e2e-server.ts"
      ],
      "gateIds": [
        "dependency-lock",
        "typecheck",
        "architecture",
        "test",
        "build",
        "browser"
      ],
      "authorityRefs": [
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-EXPLICIT-FLOW",
        "GW-P1-MINIMUM-CHANGE",
        "GW-P1-DOC-CANONICALITY",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-OPENCODE-PRODUCTIVE-WORKSPACE-V1",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V1",
        "GW-DOC-WORKBENCH-UX-V1",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1",
        "GW-DOC-MARKDOWN-WORKBENCH-V1",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-TR-039-CODEMIRROR-SOURCE-EDITOR-BOUNDARY",
        "GW-TR-040-EXACT-SOURCE-EDITOR-SYNCHRONIZATION",
        "GW-TR-044-EXACT-SOURCE-EDITOR-CERTIFICATION",
        "GW-TR-063-CENTRALIZED-SETTINGS-COMPOSITION",
        "GW-TR-064-SEMANTIC-VIEWPORT-COMPOSITION",
        "GW-TR-065-NONMUTATING-WORKFLOW-INSPECTION-NAVIGATION",
        "GW-TR-066-CONSOLIDATED-WORKITEM-DOCUMENT-CHROME",
        "GW-TR-073-STAGE-INSPECTION-WORKSPACE-MATERIALIZATION",
        "GW-TR-074-PROVIDER-INSTRUCTION-CLOSURE",
        "GW-TR-075-PROVIDER-WORKSPACE-ESCAPE-PREVENTION",
        "GW-TR-076-SHARED-PRODUCTIVE-PROVIDER-ADMISSION",
        "GW-TR-077-PRODUCTIVE-INVOCATION-FAILURE-BOUNDARY",
        "GW-TR-078-PRODUCTIVE-PROVIDER-WORKSPACE-FRESHNESS",
        "GW-TR-079-OPENCODE-INSTRUCTION-BOUNDARY-CERTIFICATION",
        "GW-TR-080-EFFECTIVE-INSTRUCTION-PREFLIGHT",
        "GW-TR-081-RUN-SPECIFIC-PRODUCTIVE-AGENT-ENVIRONMENT"
      ],
      "concernIds": [
        "foundation",
        "core",
        "shell",
        "daemon",
        "ui",
        "verification"
      ]
    }
  ]
}
```

## 18. Completion predicate

R3 may mark this P7 READY_FOR_SIGNOFF only if:

1. every machine-task ref resolves through pontivus-order.toml;
2. every listed changeSurface path is sufficient for the current production defects above and no required P8 change is already known outside it;
3. the task contains every concern-required gate;
4. the trusted-integration decision is internally consistent across docs 07/12/13/14/45/47;
5. no future OpenCode feature or version bump is required to implement the design;
6. the implementation team has no unresolved choice about workspace materialization, instruction authority, skill/MCP admission, failure classification, freshness, Workbench hierarchy, editor scrolling or repository interaction;
7. the P7 adds no architecture beyond P1-P6;
8. PR verification for this documentation/plan branch is green.

After sign-off, P8 must execute this task exactly.