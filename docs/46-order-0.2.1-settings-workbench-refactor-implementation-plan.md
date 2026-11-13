# 46 — Order 0.2.1 centralized Settings, installation-readiness and workbench UX refactor implementation plan

**Status:** Implementation-ready P7 plan  
**Target repository:** `pontivus-com/order`  
**Target public release:** `0.2.1`  
**Pyramid layer:** P7 implementation plan  
**Plan baseline:** `7da540aeb201b7206aae2e87769edef4ebeaad2e`  
**Prepared:** 2026-11-13  
**Purpose:** implement the merged P3 functional baseline `GW-FR-079..098` and merged P4/P6 technical baseline `GW-TR-058..071` as one bounded patch-release refactor without introducing parallel configuration, repository, account, source or UI authorities.

This plan is execution authority only. It does not redefine the functional or technical design. A contradiction discovered during implementation stops the affected task and returns to the defective P3/P4/P6 authority rather than being resolved by an implementation-local workaround.

## 1. Governing authority

Implementation must conform to:

### P1

- `GW-P1-FCIS`;
- `GW-P1-SOC`;
- `GW-P1-DRY`;
- `GW-P1-STRICT-TYPING`;
- `GW-P1-CANONICAL-OWNERSHIP`;
- `GW-P1-EXPLICIT-FLOW`;
- `GW-P1-MINIMUM-CHANGE`;
- `GW-P1-DOC-CANONICALITY`.

### P3

- `GW-DOC-INSTALLATION-READINESS-V1`, `GW-FR-079..082`, `GW-FR-091..093`, `GW-FR-095`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, `GW-FR-087..088`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-FR-089..090`;
- `GW-DOC-WORKBENCH-UX-V1`, `GW-FR-083..086`, `GW-FR-094`, `GW-FR-096..098`.

### P4/P6

- `GW-DOC-TECHNICAL-ARCHITECTURE-V1 §34`, including `GW-TR-058..062`, `GW-TR-070..071`;
- `GW-DOC-CANONICAL-CONTRACTS-V1 §35`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1 §22`, including `GW-TR-063..069`;
- existing repository-native WorkItem, Git, OpenCode-account and CodeMirror contracts that remain authoritative where not superseded.

### Delivery

- `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1`.

Every ordinary implementation PR:

- branches from current `master`;
- targets release `0.2.1`;
- declares SemVer impact `patch`;
- updates `CHANGELOG.md [Unreleased]`;
- leaves `package.json.version` at `0.2.0`;
- passes permanent PR verification;
- is squash-merged.

The final version bump is isolated to P7-T08.

## 2. Required end state

The package is complete only when all of the following are true.

1. Order can start in a valid but incomplete configuration state and open authenticated Settings.
2. `OrderConfig v4` is the only ordinary runtime configuration contract; v3 is migration input.
3. Existing valid v3 repository/model/reference-root choices migrate exactly to v4.
4. A missing or drifted configured repository/reference root does not prevent daemon startup; Settings exposes the repair/disconnect state.
5. Settings is the one ordinary application-level configuration home for target repositories/document locations, STAGE reference roots, OpenCode accounts and model/runtime selection.
6. Repository connection/disconnection does not create a second repository registry or delete repository-owned data.
7. A repository document-root change is a bounded migration that updates filesystem, manifest and persisted current WorkItem source paths consistently.
8. OpenCode account-control waits for the pinned `opencode` integration to register before querying accounts.
9. Full OpenCode account management lives in Settings; the application shell exposes only concise current-account state and navigation.
10. Productive readiness is one daemon-derived projection, not persisted/browser-reconstructed state.
11. WorkItem Source ordinary authoring edits the human Markdown body only; exact complete source remains available for technical inspection.
12. Body save preserves the exact current metadata envelope and uses complete-file optimistic concurrency.
13. Workflow progression is clickable for inspection/navigation but cannot mutate lifecycle state.
14. WorkItem orientation uses one compact top rail.
15. Document/editor chrome no longer stacks redundant state/format/action bars.
16. System/Light/Dark is a direct compact mode switcher, not a select.
17. Responsive presentation preserves the semantic role of Settings navigation, primary content, context and utilities.
18. No new DTO/view-model/service/repository/global-store architecture is introduced.
19. Permanent tests certify fresh install, upgrade, migration, configuration recovery, account readiness, source-body fidelity and browser geometry/interaction.
20. Release `0.2.1` is published only after the complete package is merged and certified.

## 3. Refactor-necessity matrix

The following refactors are mandatory because the current implementation cannot satisfy the merged functional requirements through local UI/CSS changes.

| Refactor | Current constraint / defect | Governing requirement | Why a superficial patch is insufficient | Required owner-boundary change |
|---|---|---|---|---|
| **R1 — Config v4** | v3 requires one model and ≥1 repository; daemon therefore cannot start to repair missing configuration in Settings | FR-079/091/095; TR-070 | An empty-state page cannot exist if config parsing/startup fails first | evolve canonical `OrderConfig` to v4; preserve v3 only as migration input |
| **R2 — Immutable runtime activation** | daemon/server consumers close over one startup `CoordinatorRuntime.config` | FR-091/092; TR-058/060 | Writing `config.json` from a page would leave live consumers on stale config or require ad-hoc reload logic | process-level current-runtime handoff over immutable runtime snapshots |
| **R3 — Central Settings ownership** | repository/model setup is CLI/installer-centric; account management is toolbar-centric; no Settings workspace exists | FR-091/095/096; TR-063/064/069 | Adding more drawers/popovers would preserve scattered ownership | one Settings presentation owner + canonical settings daemon query/command owner |
| **R4 — Repository/document-root management** | target roots are config state; document root is repository-manifest state; current UI exposes neither coherently | FR-082/092/093; TR-059/061 | A path input cannot safely move governed documents or update persisted source paths | canonical connected-repository projection + bounded manifest/filesystem/SQLite migration |
| **R5 — OpenCode account readiness/placement** | generic OpenCode readiness can precede `opencode` integration registration; full manager lives in shell utility | FR-081/095; TR-071/069 | Retrying UI calls or moving JSX does not fix upstream readiness or ownership | account-control integration readiness + move full presentation to Settings while reusing canonical backend |
| **R6 — Human-first Source authoring** | browser edits full technical `work-request.md`, including system JSON metadata | FR-087..090; TR-062/067 | CSS hiding/front-matter stripping in browser would create invisible mutation/concurrency hazards | core body projection/recomposition + body-specific daemon save over full-file hash |
| **R7 — Workbench chrome/navigation** | separate WorkItem header, workflow row, document state strip, editor heading/format/action rows consume primary space | FR-084..086/094/096/097; TR-064..066 | CSS compression alone preserves duplicated context and ownership | recompose into one WorkItem top rail + compact document/editor control ownership; delete old rows |
| **R8 — Appearance affordance** | fixed three-state appearance uses a select field | FR-098; TR-068 | Styling the select does not change its wrong interaction grammar | replace only the presentation control; preserve the existing browser-local preference owner |
| **R9 — Certification boundary** | current tests largely certify the old UI/config/install assumptions and missed the real account startup race | FR-079..098; TR-058..071 | Unit tests around individual components cannot prove installed-state migration/recovery or geometry | permanent migration, daemon, architecture and Chromium coverage across the complete boundaries |

No refactor above authorizes broad cleanup outside the stated owner boundary.

## 4. Execution graph and PR boundaries

Implementation is delivered as serial governed work PRs where a later task depends on merged bytes from an earlier task.

```text
P7-T00  OpenCode account-control readiness (independent prerequisite)

P7-T01  config v4 + migration foundation
   | \
   |  \
   v   v
P7-T02 daemon Settings/readiness     P7-T05 source-body authoring
   |
   v
P7-T03 document-root backend
   |
   v
P7-T04 centralized Settings + install/browser setup
   |                              |
   +--------------+---------------+
                  v
          P7-T06 workbench UX/chrome/appearance
                  |
                  v
          P7-T07 cross-boundary certification/cleanup
                  |
                  v
          P7-T08 release/v0.2.1
```

T05 may proceed after T01 independently of the T02→T03→T04 Settings/backend chain. T06 starts only after both T04 and T05 are merged. Every PR branches from current `master` and may not depend on unmerged sibling bytes.

P7-T00 is the already-proven account readiness defect. Existing PR #31 may be rebased/refreshed and reused after this plan is approved if its implementation still matches T00 exactly; do not recreate equivalent code merely to obtain a new task branch.

## 5. P7-T00 — OpenCode account integration readiness prerequisite

### Why this refactor is required

The pinned OpenCode server can report generic HTTP readiness before plugin/provider initialization registers integration id `opencode`. The current account-control path can therefore query the integration during that window and surface an upstream 404 as an Order internal daemon error.

This defect is independent of the Settings refactor: moving account UI without repairing the account-control readiness boundary would preserve the failure.

### Required implementation

In `src/shell/opencode.ts`:

1. keep generic provider-process startup unchanged for ordinary provider uses;
2. make `startOpenCodeAccountControl()` additionally wait until the released integration-list operation contains exactly the required `opencode` integration;
3. reuse the existing bounded startup deadline;
4. sleep only through the established bounded readiness poll;
5. terminate the account-control process if integration readiness fails/times out;
6. do not treat a missing integration during startup as “no saved account”.

### Tests

In `tests/opencode.test.ts`:

- fake server delays `opencode` registration for multiple integration-list calls and then succeeds;
- clean account state returns `[]`, not an error;
- when `PONTIVUS_ORDER_OPENCODE_BIN` is present, start the real pinned OpenCode binary against fresh isolated state and prove account listing succeeds;
- timeout/failure terminates the child.

### Exit criterion

Account query on a clean installation is deterministic after process startup and no transient integration-registration 404 reaches the daemon/browser.

### Non-goals

- no Settings UI;
- no account schema redesign;
- no provider/model changes;
- no retry loop around normal account API failures.

## 6. P7-T01 — OrderConfig v4 and deterministic configuration migration foundation

### Why this refactor is required

v3 cannot encode the functional state “Order is installed and Settings is available, but repository/model configuration is incomplete”. The daemon currently also canonicalizes roots by live filesystem resolution during config read, so a previously connected repository that later disappears can prevent the application from starting to repair it.

### Required implementation

#### 6.1 Canonical contracts — `src/core/contracts.ts`

1. rename/retain the current v3 schema as `LegacyOrderConfigV3Schema`;
2. define current `OrderConfigSchema` v4:
   - `version: 4`;
   - `model: OpenCodeModelRef | null`;
   - unique `repositoryRoots` with zero allowed;
   - unique `referenceRoots`;
3. add canonical types/schemas required by P6 §35:
   - `OrderConfigState`;
   - `ConnectedRepositoryState`;
   - `InstallationReadiness`;
   - focused connect/disconnect/model/reference-root/document-root commands;
4. preserve v1/v2 legacy schemas only for migration;
5. do not add DTO copies in shell/daemon/UI.

#### 6.2 Config effects — `src/shell/config.ts`

1. separate **stored path identity validation** from **live root proof**:
   - existing v4 config read validates absolute path syntax, uniqueness and state-root separation;
   - it must not require every external root to currently exist;
2. new/changed repository/reference paths are live-proven before being persisted;
3. expose canonical persisted config bytes/SHA;
4. add expected-hash atomic replacement through the same file owner;
5. preserve 0600/no-follow/fsync/atomic-rename guarantees;
6. no second writer.

#### 6.3 Guided setup/migration — `src/shell/setup.ts`

1. accept v1/v2/v3/v4 at the installer upgrade boundary;
2. deterministically convert v3→v4 preserving model/repository/reference values exactly;
3. retain the existing v1/v2 exact-repository/document migration behavior;
4. guided `order setup` remains able to produce a complete v4;
5. ordinary runtime accepts only v4.

For this task, **do not yet change fresh public installer UX to depend on browser Settings**. Intermediate master must remain installable before P7-T04 lands.

### Primary files

- `src/core/contracts.ts`;
- `src/shell/config.ts`;
- `src/shell/setup.ts`;
- affected config/setup tests;
- `tests/architecture.test.ts`.

### Tests

Prove:

- v4 accepts `model=null`, zero repositories and zero reference roots;
- malformed stored paths/duplicates still fail;
- previously configured unavailable paths remain readable as stored identities;
- adding a new invalid/non-Git target is rejected before write;
- v3→v4 preserves all values;
- stale expected config hash mutates nothing;
- file mode/ownership/atomicity remain;
- v1/v2 migrations remain closed and deterministic.

### Exit criterion

One current v4 config owner exists and can represent valid-but-incomplete state without weakening path/security invariants.

### Non-goals

- no browser Settings yet;
- no daemon live runtime swap yet;
- no repository document migration yet.

## 7. P7-T02 — Daemon Settings/readiness owner and immutable runtime activation

### Why this refactor is required

The current daemon creates one `CoordinatorRuntime` at startup and `startDaemonServer()` closes over it permanently. Merely writing a new config file would produce a split-brain process: disk state changes while scheduler/API/provider/source consumers continue using the old immutable config.

Mutating `runtime.config` in place would spread reconfiguration logic into every consumer and violate the canonical immutable-snapshot design.

### Required implementation

#### 7.1 Cohesive Settings owner

Add one daemon module, e.g. `src/daemon/settings.ts`, responsible for:

- current `OrderConfigState`;
- connected-repository projection;
- installation readiness;
- focused repository/model/reference-root commands;
- configuration mutation admission;
- candidate-runtime activation.

It must not become a service class.

#### 7.2 Process-level runtime handoff

Refactor daemon composition so:

- each `CoordinatorRuntime.config` remains readonly;
- the process owns exactly one replaceable reference to the current runtime;
- server route handling obtains the current runtime for each request rather than closing forever over the initial object;
- scheduler belongs to the runtime that is currently active;
- runtime replacement is serialized.

#### 7.3 Admission

Block settings activation while:

- coordinator tick is active;
- any Run is `RUNNING` or `WAITING_FOR_INPUT`;
- OpenCode login attempt is active;
- OpenCode account mutation is active;
- another Settings activation/document-root migration is active.

Add only the transient runtime flag(s) necessary to enforce this. Do not persist a settings-mutating lifecycle.

Account mutation admission must symmetrically reject while Settings activation is active.

#### 7.4 Candidate activation

Implement `GW-TR-058` exactly:

1. expected config hash proof;
2. build proposed immutable config;
3. live-preflight newly required repositories/reference roots/model;
4. quiesce old scheduler;
5. construct candidate runtime over the same database/state root;
6. reconcile sources for READY repositories;
7. atomically persist config;
8. swap current runtime reference;
9. start candidate scheduler;
10. return canonical config/readiness.

On failure before successful activation, old config/runtime remains/resumes. If candidate reconciliation modified projection state before failure, reconcile the old runtime before resuming.

#### 7.5 Configuration-capable daemon boot

Refactor `startOrderDaemon()`:

- structurally valid incomplete v4 starts HTTP/auth/UI;
- zero repositories skips repository source reconciliation;
- `model=null` skips provider/model preflight;
- unavailable/drifted configured repositories/reference roots are classified into Settings/readiness, not startup failure;
- productive commands verify readiness at their owning boundary.

#### 7.6 Canonical API

Add authenticated same-origin endpoints matching P6 §35, including:

- `GET /api/settings/config`;
- `GET /api/settings/readiness`;
- `GET /api/settings/repositories`;
- `GET /api/settings/models`;
- focused connect/disconnect/model/reference-root mutations.

`server.ts` remains transport-only.

#### 7.7 Disconnected repository visibility

Ordinary productive work queries return WorkItems whose exact repository remains in current configured/READY targets. Historical SQLite records are retained and may reappear after reconnect/reconciliation. No deletion/second registry.

### Primary files

- `src/daemon/settings.ts` — new;
- `src/daemon/runtime.ts`;
- `src/daemon/server.ts`;
- `src/daemon/coordinator.ts`;
- existing account admission owner where symmetric blocker is needed;
- `ui/src/http.ts` only if transport schema parsing is required for test harnesses at this stage;
- daemon/architecture tests.

### Tests

Prove:

- daemon starts with empty v4 and reports repository/model readiness blockers;
- daemon starts when a formerly valid target is missing/broken and Settings projection identifies it;
- config activation changes the runtime observed by subsequent requests;
- stale config hash changes nothing;
- active tick/Run/login/account mutation blocks activation;
- failed model/repository candidate activation leaves old runtime/config authoritative;
- scheduler belongs to one runtime only;
- disconnect hides productive WorkItems but retains history;
- reconnect restores canonical discovery;
- no mutable `CoordinatorRuntime.config`.

### Exit criterion

Settings commands can change canonical productive configuration without process split-brain, manual restart requirements or secondary state.

### Non-goals

- no Settings React UI yet;
- no document-root move yet;
- no WorkItem body editor change.

## 8. P7-T03 — Repository document-root migration backend

### Why this refactor is required

`workItems.root` is repository-owned in `pontivus-order.toml`, not installation config. Changing it after documents exist moves every deterministic WorkItem path. Current SQLite also persists `workItemSources.sourcePath`, and current reconciliation deliberately rejects a source found at a path different from that persisted deterministic path.

A simple manifest edit or filesystem move would therefore immediately make the migrated WorkItems invalid.

### Required implementation

#### 8.1 Narrow project-manifest mutation effect

Add one narrow shell owner (e.g. `src/shell/project-config.ts`, unless the existing project owner can absorb the operation without violating SoC) that owns:

- exact manifest byte read/hash;
- target root validation;
- a **minimal textual mutation** of the effective `[workItems].root`;
- before/after parse + semantic equality proof for unrelated fields;
- atomic manifest replacement.

Do not parse and reserialize the full TOML as the correctness path if doing so changes unrelated bytes/semantics.

If the manifest representation cannot be safely minimally mutated, reject the operation rather than guessing.

#### 8.2 Migration admission

Before mutation prove:

- expected manifest hash;
- target path is valid repository-contained non-Git path;
- repository is currently valid;
- no WorkItem in that repository is in `EXECUTION`;
- no active Run belongs to the repository;
- destination governed paths are absent or byte-identical as allowed by the technical contract;
- no unsafe Git/filesystem operation is in progress.

#### 8.3 Bounded move/rollback

Move the complete governed WorkItem tree as one migration:

1. stage/copy exact directories/files;
2. verify bytes/hashes;
3. prepare minimal manifest mutation;
4. activate new tree + manifest;
5. transactionally update only affected `workItemSources.sourcePath` rows through the SQLite owner;
6. remove old productive tree only after tree/manifest/database paths agree;
7. parse/read back;
8. reconcile and rediscover current lifecycle files at new deterministic paths.

Historical ArtifactRefs, Approvals, Runs and evidence are not rewritten.

On failure, restore the old root/manifest/current source paths as the sole productive state.

#### 8.4 Daemon/API command

Expose the focused migration command from the Settings owner and authenticated endpoint.

### Primary files

- `src/shell/project.ts` and/or new narrow project-config sibling;
- `src/shell/work-item-source.ts` only for deterministic path facts;
- `src/shell/sqlite.ts` for the focused source-path transaction;
- `src/shell/repository.ts` only for existing Git-operation facts;
- `src/daemon/settings.ts`;
- `src/daemon/server.ts`.

### Tests

Prove:

- successful root migration preserves every source/lifecycle byte and WorkItem id;
- persisted source paths move to the new deterministic root;
- normal reconciliation no longer reports moved sources invalid;
- current lifecycle files rediscover as drafts at new paths;
- historical ArtifactRefs remain unchanged;
- unrelated manifest bytes/semantics are preserved;
- stale manifest hash rejects before mutation;
- target conflict rejects;
- EXECUTION/active Run blocks;
- injected failure at each activation boundary rolls back to one old productive root;
- no dual-root success state.

### Exit criterion

Document-root changes are safe repository migrations, not configuration-value edits.

### Non-goals

- no repository move/rename feature;
- no arbitrary TOML editor;
- no historical ArtifactRef path rewriting.

## 9. P7-T04 — Centralized Settings UI, application navigation and browser-first setup cutover

### Why this refactor is required

The app currently has no Settings workspace. Repository/model setup is terminal-guided, OpenCode account management is a global drawer, and repository context is implicit in first-project selection. Adding additional popovers would directly violate the centralized Settings and semantic viewport contracts.

This task also completes the fresh-install experience only after the backend/config v4/Settings capabilities required to support it are already merged.

### Required implementation

#### 9.1 Typed application destination

Introduce the minimum browser-local presentation owner needed to distinguish:

- Queue;
- selected WorkItem;
- Settings section.

Use native history/path handling; do not add a routing framework dependency merely for these destinations.

Stable Settings paths:

- `/settings/repositories`;
- `/settings/opencode`;
- `/settings/model`.

Preserve existing WorkItem deep-link behavior and browser Back/Forward. Dirty WorkItem Markdown admission applies when leaving the WorkItem for Settings.

#### 9.2 Settings composition

Add a cohesive component tree:

```text
SettingsWorkspace
  SettingsNavigation
  RepositorySettings
  OpenCodeAccountSettings
  ModelRuntimeSettings
```

No global Settings store/context. TanStack Query remains server-state owner.

#### 9.3 Repository Settings

Render canonical connected-repository state:

- project identity when valid;
- READY/ATTENTION;
- exact Git root as secondary detail;
- effective WorkItem document root;
- connect;
- disconnect;
- current queue/creation context;
- explicit document-root migration dialog;
- STAGE reference roots as a clearly separate context list.

The browser does not parse manifests, concatenate document paths or infer readiness.

For multiple READY target repositories, expose one explicit queue/creation context selector. This is presentation/creation scope only; opening an existing WorkItem always uses its canonical repository owner.

#### 9.4 OpenCode account Settings

Refactor the existing account UI so:

- full Add/Switch/Rename/login flow lives in Settings;
- existing canonical TanStack Query/mutation behavior is reused;
- shell utility becomes only active-account/attention summary + navigation to `/settings/opencode`;
- no parallel account manager remains.

#### 9.5 Model/runtime Settings

Render configured model and available canonical model choices. Mutation is daemon-confirmed; no optimistic provider/model identity.

#### 9.6 Readiness/setup presentation

When installation readiness is incomplete:

- queue shell remains available;
- primary entry directs to the owning Settings concern;
- actionable blocker identifies repository/model/account/reference-root problem;
- empty queue is not presented as if productive setup were complete.

#### 9.7 Fresh installer cutover

Only after Settings works:

- fresh installation may write the canonical empty v4 state and start the service without forcing repository/model/account terminal setup;
- browser Settings becomes the preferred completion path;
- `order setup` remains a supported CLI alternative over the same canonical config owner;
- upgrade preserves deterministic existing choices;
- v1/v2 ambiguity may still require explicit installer input where the old state cannot be represented without guessing;
- predecessor state-root movement retains the complete installation-owned private OpenCode state subtree;
- never import ambient/global OpenCode secrets.

### Primary files

- `ui/src/app.tsx`;
- new Settings components;
- `ui/src/http.ts`;
- `ui/src/query-keys.ts`;
- `ui/src/OpenCodeAccountControl.tsx` refactored/thinned or replaced by semantically named shell summary + Settings owner;
- `src/installer.ts`;
- `src/shell/setup.ts`;
- browser/e2e/migration tests.

### Tests

Browser:

- Settings reachable from Queue and WorkItem;
- stable Settings section navigation/back-forward;
- shell mirrors account/repository but contains no full manager;
- connect/disconnect repository interaction;
- invalid configured repository appears in ATTENTION and can be disconnected;
- reference roots are visually distinct from target repositories;
- account Add/Switch/Rename occurs only in Settings;
- model mutation reflects daemon-confirmed state;
- incomplete readiness enters relevant Settings;
- multiple repository queue/creation context is explicit.

Installed-state:

- fresh empty v4 → healthy daemon → Settings setup;
- v3 upgrade preserves choices;
- predecessor/private OpenCode state retained;
- missing account yields account-required Settings state, not daemon error;
- v1/v2 document migration still runs before final v4 activation.

### Exit criterion

All application-level configuration has one predictable Settings home and fresh/upgrade installs can recover configuration without scattered UI or terminal-only setup.

### Non-goals

- no general preferences framework;
- no arbitrary file browser;
- no credential import from ambient OpenCode.

## 10. P7-T05 — Human-first WorkItem Source authoring

### Why this refactor is required

The current Source editor receives and saves the complete technical `work-request.md`, including strict JSON system metadata. Hiding those lines in CodeMirror would leave the browser silently mutating a full buffer it no longer shows and would weaken concurrency semantics.

The correct owner is the core source parser, because it already understands the metadata/body boundary and validates the canonical source.

### Required implementation

#### 10.1 Canonical contracts

Implement P6 §35.8:

- extend `WorkItemSourceSnapshot` with exact `bodyMarkdown`;
- add `ExpectedHashWorkItemBodyWrite`.

#### 10.2 Pure core source operations

In `src/core/work-item-source.ts`:

- project exact body bytes from a validated full source;
- validate proposed body using existing title/required-section rules;
- preserve the current exact metadata envelope bytes;
- recompose metadata envelope + proposed body without metadata regeneration/reordering/normalization.

External full-file parsing remains unchanged.

#### 10.3 Daemon source command

Add body-specific save:

1. load current exact source;
2. verify complete-file expected SHA;
3. core validate/recompose;
4. persist complete bytes through existing source write effect;
5. read back/reconcile;
6. return existing expected-hash result.

Expose a focused source-body HTTP mutation.

#### 10.4 Browser

For Source only:

- `MarkdownEditor` receives `bodyMarkdown`;
- Preview/Split render body;
- Save posts body command;
- Technical source disclosure shows exact complete `markdown` read-only.

Lifecycle Markdown continues exact full-file editing.

No browser front-matter parser or metadata string manipulation.

### Primary files

- `src/core/contracts.ts`;
- `src/core/work-item-source.ts`;
- `src/daemon/work-item-source.ts`;
- `src/daemon/coordinator.ts`;
- `src/daemon/server.ts`;
- `ui/src/http.ts`;
- `ui/src/DocumentWorkspace.tsx`;
- relevant tests.

### Tests

- body projection is byte-exact;
- body save preserves metadata envelope bytes exactly;
- invalid required body sections reject without mutation;
- stale complete-file hash after external metadata/body change returns conflict;
- externally edited metadata remains visible in Technical source but is not silently overwritten;
- lifecycle-document exact editing remains unchanged;
- browser has no metadata parser/recomposer.

### Exit criterion

Normal Source authoring contains only human Markdown while repository portability, exact-source authority and complete-file concurrency remain intact.

### Non-goals

- no rich-text editor;
- no separate metadata database;
- no change to external repository editing rights.

## 11. P7-T06 — Workbench workflow/navigation/chrome and appearance refactor

### Why this refactor is required

Current WorkItem presentation has several independently reasonable rows that collectively duplicate context and consume the primary vertical workspace. The workflow strip is display-only, document Git state is a separate strip, and the Markdown editor has separate heading, formatting and bottom action rows. Theme selection also uses the wrong control grammar.

The fix must recompose and delete obsolete rows rather than add another overlay.

### Required implementation

#### 11.1 Workflow inspection projection

In `ui/src/workbench-presentation.ts`, add one pure typed mapping from each user-facing workflow step to:

- a specific lifecycle document in Documents when available;
- Review;
- Execution;
- Result;
- or explicit unreached presentation.

It is browser presentation state only.

#### 11.2 Dirty-safe cross-document navigation

Lift only the minimum document-selection request state needed so a workflow-step click can ask Documents to select the correct lifecycle material while preserving the existing unsaved-buffer guard.

No step click may call start/promotion/sign-off/execution mutations.

#### 11.3 One WorkItem top rail

Refactor `WorkItemWorkspace` so one compact rail owns:

- Back;
- WorkItem title/current state;
- clickable workflow progression;
- workspace-mode control;
- contextual WorkItem actions.

Delete the separate `.order-workflow-orientation` row after equivalent information/navigation is present.

#### 11.4 Consolidated document/editor chrome

Keep one Documents selector.

Delete the independent `.order-document-state-strip`. Compose its useful state/actions into the editor/document control surface:

- compact Git/working-tree state;
- Save documentation to Git when actionable;
- Technical details disclosure for directory/path/branch/HEAD/SHA.

Refactor `MarkdownEditor` so:

- Edit/Preview/Split;
- formatting;
- dirty/current;
- Save/Cancel;
- identity/technical disclosure

occupy one coherent compact sticky toolbar/control region instead of a separate formatting bar plus bottom actionbar.

Keep Git semantics outside the generic editor. Use a narrow presentation slot/subcomponent/callback boundary from Documents rather than teaching `MarkdownEditor` repository policy.

Delete superseded CSS and compensating spacing.

#### 11.5 Direct appearance control

In `app.tsx`:

- preserve current `ThemePreference`, localStorage key and Astryx `Theme` owner;
- replace the `<select>` with one compact direct System/Light/Dark segmented/switcher control;
- keep keyboard/accessibility semantics explicit.

### Primary files

- `ui/src/workbench-presentation.ts`;
- `ui/src/WorkItemWorkspace.tsx`;
- `ui/src/DocumentWorkspace.tsx`;
- `ui/src/MarkdownEditor.tsx`;
- `ui/src/app.tsx`;
- `ui/src/theme.css`;
- browser/architecture tests.

### Browser verification

Prove:

- every workflow step is clickable and produces the correct inspection target/unreached state;
- lifecycle state and network mutation calls remain unchanged by workflow navigation;
- dirty Source/lifecycle buffer blocks navigation until explicit discard;
- one top rail replaces old workflow/header stack;
- Documents has one selector and no old document-state strip;
- Save/Cancel/Git save remain reachable while editing long content;
- technical paths/SHA/HEAD are secondary;
- primary editor vertical area increases and consumes remaining viewport;
- appearance control is not a select and System/Light/Dark all work/persist as before;
- responsive semantic zones remain intact.

### Exit criterion

The workbench follows the merged information-placement/reading-order design with measurably less persistent chrome and no loss of functionality.

### Non-goals

- no lifecycle redesign;
- no new theme preference;
- no generic component-system rewrite.

## 12. P7-T07 — Cross-boundary certification and obsolete-path cleanup

### Why this task is required

The previous release passed existing tests while the account-control startup race and installation/configuration UX gaps still existed. The new package crosses installer, config, daemon, filesystem, OpenCode and browser boundaries and therefore needs permanent certification at those seams.

### Architecture sensors

Extend permanent architecture checks to prove:

- `src/shell/config.ts` is the only productive `config.json` writer;
- current `CoordinatorRuntime.config` is readonly and never reassigned/mutated;
- no configuration/repository/account DTO/ViewModel/service/repository layer;
- no browser configuration global store;
- no browser WorkItem metadata parser/recomposer;
- only the authorized project-config owner mutates project manifest workItems root;
- shell account utility cannot own full manager/mutation UI;
- Settings account owner reuses canonical account APIs;
- no theme `select`;
- source write ownership remains one shell path;
- UI substantive modules/primitives retain existing dependency-direction rules.

### Installed-state certification matrix

At minimum:

1. fresh install with empty v4:
   - service healthy;
   - browser Settings reachable;
   - repository/model/account blockers explicit;
2. v3→v4:
   - model/repositories/reference roots unchanged;
3. predecessor/v2 migration:
   - repository-native documents migrated;
   - private OpenCode state subtree retained;
   - final config v4;
4. configured repository removed or manifest corrupted:
   - daemon remains healthy;
   - Settings shows ATTENTION;
   - disconnect/recovery works;
5. connect/reconnect:
   - repository WorkItems rediscover;
   - no duplicate registry/history;
6. document-root migration:
   - exact bytes/ids preserved;
   - persisted paths updated;
   - restart/reconcile remains correct;
7. retained account upgrade:
   - existing account inventory remains;
8. no account:
   - account-required state, no internal error;
9. account-control startup:
   - real pinned OpenCode clean-state integration readiness;
10. source body:
   - metadata bytes preserved;
   - external-change conflict;
11. browser:
   - Settings ownership, workflow navigation, chrome geometry, direct theme switcher.

### Full gates

Run and require success:

- dependency-lock;
- typecheck;
- architecture;
- complete Vitest suite;
- build;
- release packager verification;
- complete Chromium browser suite.

### Cleanup

Remove all superseded production paths/styles/test assumptions, including as applicable:

- old v3 current-runtime schema path;
- old full account-manager toolbar drawer;
- old workflow-orientation row;
- old document-state strip;
- old Markdown bottom actionbar;
- select-specific theme CSS/tests;
- complete-source ordinary Source editor path;
- any installer-only configuration path that duplicates the canonical Settings/config owner.

Do not remove migration readers needed for supported v1/v2/v3 upgrades.

### Exit criterion

All `GW-FR-079..098` and `GW-TR-058..071` are mechanically or behaviorally certified, and no superseded parallel implementation remains.

## 13. P7-T08 — Dedicated release/v0.2.1

Only after P7-T00..T07 are merged and current `master` passes the complete certification set:

1. create `release/v0.2.1`;
2. change package version from `0.2.0` to `0.2.1`;
3. move the complete relevant `[Unreleased]` entries into `[0.2.1] - 2026-11-13` (or the actual release date if different);
4. make no production-behavior changes;
5. run the complete release verification;
6. squash merge;
7. allow the governed release workflow to publish exact immutable `v0.2.1` assets/checksum.

A failed publication retries the same exact candidate under existing release governance; it is not rebuilt under a moved tag.

## 14. Traceability matrix

| Functional requirement | Technical requirement(s) | Implementation task(s) |
|---|---|---|
| FR-079 readiness | TR-059, TR-070 | T01, T02, T04, T07 |
| FR-080 config continuity | TR-058, TR-060, TR-070 | T01, T02, T04, T07 |
| FR-081 account continuity | TR-071, existing account owner | T00, T04, T07 |
| FR-082 repository/document continuity | TR-059..061 | T01..T04, T07 |
| FR-083 current repository context | TR-063/064 | T04, T06 |
| FR-084 workflow navigation | TR-065 | T06 |
| FR-085 chrome consolidation | TR-066 | T06 |
| FR-086 technical-detail economy | TR-064/066 | T04, T06 |
| FR-087/088 authoring ownership/metadata | TR-062 | T05 |
| FR-089/090 human-first editor/conflict | TR-062/067 | T05, T07 |
| FR-091/095 Settings centralization | TR-058..060, TR-063 | T01, T02, T04 |
| FR-092 repository configuration | TR-059/060 | T02, T04 |
| FR-093 document-root migration | TR-061 | T03, T07 |
| FR-094 information economy | TR-064/066 | T04, T06 |
| FR-096/097 viewport/read flow | TR-064/066 | T04, T06, T07 |
| FR-098 appearance direct control | TR-068 | T06 |

## 15. Explicit exclusions

This package does **not** authorize:

- a generic settings/preferences framework;
- mutable in-place daemon config;
- a second repository registry/database;
- a browser config cache/store outside TanStack Query;
- automatic ambient credential import;
- arbitrary project TOML editing;
- repository discovery by recursive filesystem crawling;
- repository relocation/rename;
- rewriting historical ArtifactRefs/Approvals/Runs during document-root migration;
- lifecycle-stage semantic changes;
- a rich-text Markdown authority;
- React Router or another navigation dependency unless an independently proven necessity appears and returns to P4/P6;
- a design-system rewrite;
- unrelated cleanup/refactoring.

## 16. Completion evidence

Before the package is declared complete, the implementation record must identify:

- PR/merge commit for every T00–T07 work package;
- exact verification run for each merged candidate;
- final full-certification run on master;
- exact `release/v0.2.1` candidate commit;
- published tag/release/assets/checksum.

No task is “complete” solely because its local code path works. Completion requires the owner-boundary refactor, deletion of superseded parallel behavior, and the task's stated permanent verification.
