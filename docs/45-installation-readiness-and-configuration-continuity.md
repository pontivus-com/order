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

## 7. First-run and recovery experience

The first productive workbench experience must make readiness obvious.

When configuration is incomplete, the workbench presents a bounded setup/recovery surface identifying each unresolved concern and its direct action. At minimum:

- **OpenCode account required** → Add OpenCode account;
- **Target repository required** → configure/select target repository;
- **Repository configuration needs attention** → inspect and resolve the specific repository/project problem.

Setup/recovery is not a separate product or alternate configuration authority. It is a guided presentation over the same canonical configuration/account/repository state used by normal operation.

The workbench must not expose an empty queue as if the installation were ready when the reason for the empty/failed experience is unresolved configuration.

## 8. Update behavior

An update must be non-destructive by default.

For every governed configuration concern, the update outcome is exactly one of:

- **retained** — current valid state remains current;
- **migrated** — supported prior state is deterministically converted;
- **requires operator action** — the state cannot be safely inferred and is surfaced explicitly;
- **blocked** — continuing would risk loss/corruption or create ambiguous authority.

Order must not silently fall back to a new default when a previously configured productive value becomes unresolved.

A successful update reports any configuration that still requires operator action before productive use.

## 9. Functional requirements

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

## 10. Explicit non-goals

This functional design does not authorize:

- copying OpenCode credential secrets into Order configuration or SQLite;
- importing credentials from arbitrary global/ambient OpenCode installations;
- recursive filesystem guessing to discover target repositories;
- preserving obsolete configuration merely by supporting two productive configuration models indefinitely;
- reconstructing Run/approval/execution history from migrated Markdown;
- a second setup/configuration store owned by the browser;
- changing the WorkItem lifecycle.

## 11. Downstream design obligations

P4/P6 and implementation work must resolve, without changing the functional behavior above:

1. the exact readiness projection exposed by daemon/API/UI;
2. the exact supported account-state retention/migration boundaries;
3. the exact supported repository/config versions and deterministic upgrade mapping;
4. the installer rollback boundary for configuration/document migration;
5. the UI setup/recovery composition;
6. the repository-context selector/presentation behavior owned by `GW-DOC-WORKBENCH-UX-V1`;
7. tests covering fresh install, current-version update, predecessor update, retained account, missing account, exact repository retention, ambiguous repository recovery, repository-document migration and post-install productive blocking.
