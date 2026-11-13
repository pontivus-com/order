# 45 — Installation readiness and configuration continuity

**Status:** Binding functional design  
**Canonical concern ID:** `GW-DOC-INSTALLATION-READINESS`  
**Versioned concern ID:** `GW-DOC-INSTALLATION-READINESS-V1`  
**Pyramid layer:** P3 functional requirements

## 1. Purpose

This document owns the functional behavior for **installation readiness, upgrade continuity and recoverable configuration**.

It defines what Order must preserve, migrate, prompt for and expose when an installation is created or updated. It does not own credential storage mechanics, filesystem layouts, daemon process topology, HTTP contracts or migration implementation. Those remain downstream concerns.

The design objective is:

> An install or upgrade must preserve valid productive state when it can be proven, surface unresolved state explicitly when it cannot, and never make the operator rediscover missing configuration through a failed workflow.

This concern covers:

- OpenCode saved-account continuity;
- target-repository configuration continuity;
- repository-native WorkItem/lifecycle-document migration continuity;
- first-run and post-upgrade readiness;
- recovery when required configuration is missing or ambiguous.

## 2. Productive installation readiness

Installation completion and productive readiness are distinct concepts.

Order may be successfully installed while still requiring operator configuration. The application must never represent such an installation as fully ready for productive agent work.

Productive readiness requires, at minimum:

1. at least one valid configured target repository;
2. a valid configured model/provider selection;
3. when the selected productive model requires an authenticated OpenCode account, at least one usable saved OpenCode account in Order's private OpenCode namespace;
4. repository-local project/WorkItem configuration required by the selected target repository to be valid or to have an explicit recovery path.

Readiness is derived from canonical configuration and integration state. It is not a second lifecycle state and need not be persisted as an independent status value.

A missing readiness condition blocks only the productive behavior that requires it. The workbench remains available so the operator can complete/recover configuration.

## 3. Installation and upgrade continuity policy

Order follows **preserve first, prompt second**.

On install/update:

1. valid current configuration is retained;
2. supported predecessor configuration is migrated when it can be mapped unambiguously to the current contract;
3. repository-native WorkItem/lifecycle documents are retained or migrated according to their canonical document owner;
4. existing OpenCode saved-account state is retained when it already resides in the installation-owned private OpenCode namespace being preserved/migrated;
5. configuration that cannot be proven or mapped safely is not guessed.

Order must not silently reset productive repository/model/account choices during an update.

An upgrade may require operator input only for a concern that cannot be resolved deterministically from existing valid state.

## 4. OpenCode account continuity

OpenCode remains the credential owner under `GW-DOC-OPENCODE-INTEGRATION-V1`.

Order therefore distinguishes two upgrade cases.

### 4.1 Retainable account state

If the previous productive installation already owns the private OpenCode namespace that is being retained or moved into the current Order state root, the saved accounts in that namespace are part of installation continuity.

The update must preserve them as OpenCode-owned credential state. The user must not be required to authenticate again merely because Order itself was upgraded.

### 4.2 Non-retainable or absent account state

If the current Order private OpenCode namespace contains no usable saved account, Order must not copy credential secrets from an ambient/global OpenCode installation, another application namespace or an unknown predecessor store merely to make the UI appear configured.

Instead:

- installation may complete into a clear **OpenCode account required** condition;
- the normal workbench immediately exposes the Add OpenCode account flow;
- productive OpenCode-backed Runs are blocked until a usable account exists;
- the blocker explains the required recovery action in ordinary language.

The operator must not discover this state through an internal daemon error or a provider failure after starting work.

## 5. Repository configuration continuity

Configured target repositories are productive installation state.

On an update from a supported prior configuration:

- exact repository roots that still satisfy the current repository contract are retained;
- supported predecessor roots are converted to current exact repository roots where that conversion is deterministic;
- repository-local project manifests and WorkItem documentation remain authoritative;
- existing current repository selection/default context is retained where it is still valid.

If a predecessor repository root is ambiguous under the current exact-repository contract, Order must ask the operator to resolve it rather than choosing by filesystem search or path proximity.

A fresh installation that points to a repository containing valid Order project/WorkItem documentation must rediscover that repository-owned state without requiring re-entry of WorkItems.

## 6. Repository-native document continuity

Repository-owned WorkItem and lifecycle Markdown must survive installation migration independently of installation-local projection state.

Where a supported older Order version stored governed WorkItem/lifecycle documentation outside the current project-local layout, the update must provide one bounded migration into the current deterministic repository-owned layout.

Migration must:

- preserve canonical WorkItem identity;
- preserve human-authored source/lifecycle content;
- avoid inventing Run, approval, sign-off or execution history;
- avoid creating a second productive document location;
- retain sufficient rollback/recovery evidence until installation succeeds.

If document migration cannot map an item unambiguously to a configured target repository/project, that item must be reported as unresolved rather than silently assigned.

## 7. Settings as the single application-level configuration home

Order exposes one globally reachable **Settings** area for application-level configuration.

Application-level configuration must not be scattered across workflow pages, WorkItem inspectors, account popovers, installer-only prompts or unrelated drawers. Those surfaces may show concise current state or a shortcut into Settings, but they do not own the configuration itself.

Settings is the expected home for:

1. **Repositories** — connected exact Git repositories, project identity, repository-owned WorkItem/lifecycle document location and repository readiness.
2. **OpenCode accounts** — saved OpenCode login accounts in Order's private namespace, active account and account-management actions.
3. **Model/provider configuration** — the productive model/provider selection and any future installation-global runtime choices owned by canonical configuration.

The same canonical state powers installer/update readiness, Settings, shell current-state mirrors and first-run/recovery guidance. Settings must not introduce a browser-local duplicate configuration authority.

First-run and recovery do not create a separate wizard-owned configuration model. They deep-link or route the operator directly to the relevant Settings concern, with the unresolved state already identified.

### 7.1 Settings information architecture

Settings is a distinct application area with stable navigation.

Its primary sub-areas are:

- **Repositories**
- **OpenCode accounts**
- **Model & runtime** (or the equivalent current provider/model concern)

These concerns are related because they determine installation-level productive capability, but they are not mixed into one long undifferentiated form.

The Settings navigation remains in the settings/navigation region of the shell. Selecting a Settings sub-area changes only the primary settings content; it does not create WorkItem lifecycle state or alter unrelated configuration.

The shell/header may expose concise status such as the current repository and active OpenCode account. Activating a management/settings affordance from those mirrors routes to the owning Settings area rather than opening a competing full-management implementation in-place.

### 7.2 Connected repositories

Each connected repository entry shows, in ordinary operator language:

- project identity/name;
- readiness/attention state;
- the exact connected Git repository root as secondary technical detail;
- the resolved repository-owned WorkItem documentation root;
- whether it is the current queue/creation context;
- actions appropriate to that repository's state.

A repository is connected only when Order has validated an exact Git top-level root and its current Order project manifest/configuration.

Connecting a repository is an explicit operator action. In a configured installation the repository inventory exposes **Add repository** as the action for adding another target; it does not leave an always-open field labeled "Connect target repository" that can be mistaken for editing/replacing the current repository. Activating Add repository opens the bounded add flow, and Order validates the candidate root before adding it to productive configuration. Filesystem search, parent-directory guessing and implicit adoption are not acceptable connection mechanisms.

Existing repository entries expose their own current state/details/actions. The exact Git root is not presented as an ordinary editable text field after connection; a different repository is added explicitly and the existing one may be disconnected explicitly.

Disconnecting a repository removes it from the installation's productive repository set only. It must not delete repository-owned WorkItem/lifecycle Markdown, Git history or project authority. Every disconnect mutation requires an explicit destructive confirmation that identifies the selected repository and states this non-deletion consequence before mutation. Cancelling/dismissing confirmation performs no mutation. Disconnect remains blocked while productive work in that repository is active. Reconnecting the same valid repository rediscovers its portable WorkItems and lifecycle documents through the normal canonical source path.

### 7.3 Repository-owned document location

The WorkItem/lifecycle document destination is a **repository-owned project setting**, not a second installation-global folder preference.

The Settings repository detail exposes the effective document root resolved from the repository's canonical project manifest, including the default when no explicit override exists.

For a repository with no governed WorkItem/lifecycle documents yet, an operator may choose a valid repository-contained document root through the repository configuration flow.

For a repository that already contains governed WorkItem/lifecycle documents, changing the document root is not a simple field edit. It is an explicit migration operation that must:

- show the current and proposed repository-relative document roots before mutation;
- move the governed document set as one bounded operation;
- preserve WorkItem identities and document bytes;
- update the repository-owned project configuration atomically with the move;
- avoid leaving two productive document roots;
- provide rollback/recovery if the migration cannot complete.

If those guarantees cannot be satisfied, Order must block the root change rather than update configuration and strand existing documents.

### 7.4 OpenCode account configuration

The Settings OpenCode accounts area exposes the complete saved-account inventory from Order's private OpenCode namespace.

It shows:

- active account;
- other saved accounts;
- authentication attention state;
- Add account;
- Switch;
- Rename;
- any safe disconnect/removal capability only when supported by the pinned OpenCode contract.

The compact account control in the application shell is a current-state/quick-access affordance, not a second account-management implementation. Full account configuration belongs to Settings.

Account configuration does not change repository selection or configured model/provider identity.

### 7.5 Configuration information hierarchy

Settings uses a compact settings/inventory presentation:

- persistent chrome contains only identity, state and actions needed for the current decision;
- routine explanatory guidance is available on demand rather than repeated as permanent instructional bands;
- exact filesystem paths, credential ids and other diagnostic identifiers are secondary details unless required to disambiguate;
- actionable blockers remain visible and explicit;
- the same fact has one primary presentation location, with shell mirrors limited to concise current-state context.

This keeps setup discoverable without turning Settings into a vertically stacked collection of explanatory panels.

## 8. First-run and recovery experience

The first productive workbench experience must make readiness obvious.

When configuration is incomplete, the workbench presents a bounded setup/recovery surface identifying each unresolved concern and its direct action. At minimum:

- **OpenCode account required** → Add OpenCode account;
- **Target repository required** → configure/select target repository;
- **Repository configuration needs attention** → inspect and resolve the specific repository/project problem.

Setup/recovery is not a separate product or alternate configuration authority. It is a guided presentation over the same canonical configuration/account/repository state used by normal operation.

The workbench must not expose an empty queue as if the installation were ready when the reason for the empty/failed experience is unresolved configuration.

## 9. Update behavior

An update must be non-destructive by default.

For every governed configuration concern, the update outcome is exactly one of:

- **retained** — current valid state remains current;
- **migrated** — supported prior state is deterministically converted;
- **requires operator action** — the state cannot be safely inferred and is surfaced explicitly;
- **blocked** — continuing would risk loss/corruption or create ambiguous authority.

Order must not silently fall back to a new default when a previously configured productive value becomes unresolved.

A successful update reports any configuration that still requires operator action before productive use.

## 10. Functional requirements

### GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS

**Required behavior:** Order distinguishes successful installation from productive readiness and surfaces missing required account/repository/model configuration before productive work is attempted.

**Acceptance criterion:** an installation lacking a required OpenCode account or valid target repository opens a usable setup/recovery experience and cannot start affected productive Runs.

**Failure/negative behavior:** unresolved setup must not appear only as an internal daemon error, empty unexplained workbench, or downstream provider/workflow failure.

### GW-FR-080-CONFIGURATION-CONTINUITY

**Required behavior:** install/update retains valid current configuration and deterministically migrates supported predecessor configuration before asking for replacement input.

**Acceptance criterion:** upgrading a valid configured installation preserves its model, repository and other still-valid productive choices without unnecessary re-entry.

**Failure/negative behavior:** updates must not reset valid configuration to defaults or prompt for data that can be proven from canonical existing state.

### GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY

**Required behavior:** saved OpenCode accounts are preserved when they already belong to the retained/migrated Order private OpenCode namespace; otherwise Order requires explicit account setup without copying secrets from unrelated namespaces.

**Acceptance criterion:** a retainable saved account survives upgrade and remains selectable; an installation with no retainable account enters an explicit Add-account-required condition before productive OpenCode work.

**Failure/negative behavior:** Order must not silently import ambient credential secrets, fabricate account state, or require re-authentication when the installation-owned OpenCode state was validly preserved.

### GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY

**Required behavior:** configured target repositories and repository-owned WorkItem/lifecycle documents survive supported upgrades through retention or bounded deterministic migration.

**Acceptance criterion:** after upgrade, previously configured valid repositories remain configured and their portable WorkItems/lifecycle Markdown are discoverable at the current repository-owned locations with the same WorkItem identities.

**Failure/negative behavior:** upgrade must not silently drop repository configuration, strand governed documents in a second productive location, guess an ambiguous target repository or fabricate missing runtime history.


### GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION

**Required behavior:** Order provides one globally reachable Settings area as the sole ordinary application-level home for connected repositories/document locations, saved OpenCode accounts and model/provider configuration, backed by the same canonical state used by install/update/runtime readiness.

**Acceptance criterion:** an operator can predictably inspect and configure installation-level productive settings from one application area without returning to installer-only terminal flows, hunting across workflow screens or editing hidden state files.

**Failure/negative behavior:** essential configuration must not be split across unrelated drawers, WorkItem screens, implicit defaults, installer-only prompts, shell popovers with competing management logic or browser-local duplicate state.

### GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS

**Required behavior:** every installation-global configurable concern has one primary owner under Settings; other surfaces may display current state or navigate to Settings but do not provide duplicate full-management flows.

**Acceptance criterion:** repository, account and model/runtime management are discoverable from a stable Settings navigation structure, and a user can predict where future application-level configuration belongs.

**Failure/negative behavior:** application-level settings must not be independently managed from WorkItem inspectors, workflow pages, transient popovers, first-run-only screens or duplicated settings dialogs.

### GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION

**Required behavior:** connected repositories are explicitly manageable as exact validated Git roots, each showing its repository-owned effective WorkItem document root and current readiness/context. Additional targets are added through an explicit Add repository flow; disconnect is a confirmed destructive configuration action.

**Acceptance criterion:** an operator can add a valid repository, inspect existing repository state, request disconnect, review a confirmation that identifies the repository and explains that repository-owned Markdown/Git history are retained, cancel without mutation, or confirm the disconnect; current context remains distinguishable from repository ownership without relying on `repositoryRoots[0]` or filesystem inspection.

**Failure/negative behavior:** Order must not infer repository connections recursively, hide document destination, expose an ambiguous always-open "Connect target repository" field as if it edited the existing connection, disconnect on one click without confirmation, delete repository-owned documents when disconnecting, or treat a presentation selection as ownership mutation.

### GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY

**Required behavior:** changing the repository-owned WorkItem document root after governed documents exist is a bounded explicit migration, not an ordinary path-value update.

**Acceptance criterion:** the operator sees source/destination before migration; successful completion leaves one productive document root with identities/content preserved and repository project configuration aligned to that root.

**Failure/negative behavior:** document-root changes must not create dual productive roots, orphan existing WorkItems, silently re-identify work or update configuration without moving the governed document set.

## 11. Explicit non-goals

This functional design does not authorize:

- copying OpenCode credential secrets into Order configuration or SQLite;
- importing credentials from arbitrary global/ambient OpenCode installations;
- recursive filesystem guessing to discover target repositories;
- preserving obsolete configuration merely by supporting two productive configuration models indefinitely;
- reconstructing Run/approval/execution history from migrated Markdown;
- a second setup/configuration store owned by the browser;
- changing the WorkItem lifecycle.

## 12. Downstream design obligations

P4/P6 and implementation work must resolve, without changing the functional behavior above:

1. the exact readiness projection exposed by daemon/API/UI;
2. the exact supported account-state retention/migration boundaries;
3. the exact supported repository/config versions and deterministic upgrade mapping;
4. the installer rollback boundary for configuration/document migration;
5. the single Configuration surface and its repository/account mutation commands;
6. the exact connected-repository add/remove safety rules and active-work blockers;
7. the exact repository-owned document-root update/migration transaction and rollback behavior;
8. the repository-context selector/presentation behavior owned by `GW-DOC-WORKBENCH-UX-V1`;
9. tests covering fresh install, current-version update, predecessor update, retained account, missing account, exact repository retention, repository connect/disconnect, document-root configuration/migration, ambiguous repository recovery, repository-document migration and post-install productive blocking.
