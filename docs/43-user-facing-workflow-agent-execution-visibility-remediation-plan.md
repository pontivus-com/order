# 43 — Repository-native workbench, execution visibility, OpenCode accounts and public release implementation plan

**Status:** Implementation-ready P7 plan  
**Target repository:** `pontivus-com/order`  
**Target public release:** `0.2.0`  
**Pyramid layer:** P7 implementation plan  
**Prepared:** 2026-11-13  
**Purpose:** implement the closed P3/P4/P6 product design and deliver it through the public-repository PR/version/changelog/tag/release process.

This plan is execution authority only. It does not redefine the functional, technical or public-release contracts it cites.

## 1. Governing authority

Implementation must conform to:

- `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1` / `GW-P1-PUBLIC-REPOSITORY-DELIVERY`;
- `GW-DOC-WORK-LIFECYCLE-V1`;
- `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, including `GW-FR-060..061`, `GW-FR-070`, `GW-FR-077..078`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`, including `GW-FR-062..063`, `GW-FR-065..069`, `GW-FR-071..072`;
- `GW-DOC-WORKBENCH-UX-V1`, including `GW-FR-051..059`, `GW-FR-064`, `GW-FR-073..076`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`, including `GW-TR-027..035`, `GW-TR-039..044`, `GW-TR-053`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`, including `GW-TR-036..038`, `GW-TR-045..057`;
- `GW-DOC-CANONICAL-CONTRACTS-V1 §§32–34`;
- `GW-DOC-OPENCODE-INTEGRATION-V1 §12`;
- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`;
- D18, D19 and D20;
- `GW-P1-FCIS`, `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW`, `GW-P1-MINIMUM-CHANGE`.

There are no remaining design prerequisites. A contradiction stops implementation and returns to the defective authority layer.

## 2. Public-repository delivery model for this package

No task in this plan may be committed directly to `master`.

The existing temporary GitHub Actions exception remains available during any task PR. Temporary workflow YAML may be committed to the task branch solely to execute already-authorized implementation/verification when local/runtime/connectors are insufficient, but it must be removed from the PR tree before merge. This is separate from the permanent CI/release workflows introduced by P7-T00.

### 2.1 Work PRs

Each implementation task is delivered through a short-lived PR to `master`.

Every work PR:

- starts from current `master`;
- updates `CHANGELOG.md [Unreleased]`;
- declares `Target release: 0.2.0`;
- declares the applicable SemVer impact (this package is globally a `minor` release);
- includes its targeted tests in the same PR;
- passes permanent PR CI before merge;
- is squash-merged after review/conversation resolution.

`package.json.version` stays `0.1.0` throughout ordinary P7 work PRs.

### 2.2 Release PR

After P7-T00 through P7-T10 are merged and complete, P7-T11 creates:

```text
release/v0.2.0
```

The release PR:

- changes `package.json.version` to `0.2.0`;
- moves `CHANGELOG.md [Unreleased]` entries into `[0.2.0] - <date>`;
- performs only release metadata/distribution-documentation changes;
- passes the complete verification gates.

Its merge commit is the sole candidate for tag `v0.2.0`.

### 2.3 Tag/release

After the release PR merges, the release workflow:

1. re-verifies the exact merge commit;
2. builds the release bundle;
3. computes checksum;
4. creates annotated `v0.2.0`;
5. creates/uploads a draft GitHub Release;
6. publishes when complete.

The public supported install/update channel then uses that release asset, not `master`.

## 3. Required end state

The package is complete only when:

1. every new WorkItem and normal lifecycle Markdown lives at its deterministic selected-project repository path;
2. productive config/database behavior is v3 and external `workItemRoot` is migration input only;
3. lifecycle Markdown is rediscovered as drafts without fabricated runtime history;
4. Documents distinguishes editor-dirty, working-tree and Git-persisted state;
5. exact WorkItem documentation can be committed without unrelated repository state;
6. Git identity/branch/operation blockers are enforced;
7. title editing changes only the canonical H1;
8. archive/restore uses the portable `.order-archived` marker;
9. primary UI uses human workflow language rather than R1/R2/R3;
10. all Runs and material events remain inspectable in Activity;
11. provider diagnostic evidence is available without developer tools or secret/reasoning leakage;
12. API failures retain canonical 400/404/409/500 meaning and source diagnostics;
13. CodeMirror remains the exact-source Markdown editor;
14. the global shell exposes the active saved OpenCode login;
15. multiple OpenCode logins remain saved and switch A→B→A without model/provider changes;
16. account Add uses the pinned external OpenCode device/OAuth flow without credential leakage;
17. account mutations cannot overlap active Runs;
18. every repository change is PR-delivered with changelog/release-impact metadata;
19. permanent CI verifies PRs;
20. version is single-source and externally consistent;
21. release `0.2.0` is represented by changelog + exact tag + GitHub Release + certified archive/checksum;
22. public install/update no longer consumes arbitrary `master`.

## 4. Preservation/non-regression constraints

Implementation must not:

- deliver directly to `master`;
- bump package version in ordinary work PRs;
- reintroduce productive external `workItemRoot`;
- create DTO/domain/view-model duplicates or a second state store;
- replace CodeMirror;
- make account switching a provider/model selector;
- use OpenCode `credential.list` for browser account presentation;
- capture hidden reasoning;
- create a generic logging platform;
- use broad/destructive Git commands for WorkItem documentation commits;
- delete WorkItem history as Remove semantics;
- make browser state lifecycle authority;
- publish releases from unmerged PR heads;
- move/rebuild an existing release tag/version;
- retain unpinned GitHub Action dependencies;
- leave temporary GitHub Actions scaffolding in a merge candidate or use it as a PR/release-governance bypass.

## 5. Ordered implementation tasks

### P7-T00 — Public repository delivery/release foundation

Implement the delivery infrastructure before product implementation PRs proceed.

Required:

- permanent PR CI workflow;
- permanent release workflow;
- deterministic release metadata verifier;
- deterministic release packager;
- one canonical package-version adapter used by runtime;
- `order --version`;
- health version from same owner;
- PR template/contributor instructions integrated with CI;
- release asset packaging/checksum contract;
- public install/update documentation prepared for release assets;
- repository `master` and `v*` rulesets applied/admin-evidenced;
- immutable-pinned/certified workflow action dependencies.

This task does **not** bump `package.json.version`.

### P7-T01 — Repository-native v3 source/config/database cutover

- remove productive `workItemRoot`;
- add/consume project `[workItems].root`;
- implement deterministic source/lifecycle paths;
- repository-bounded source creation/discovery/revalidation;
- lifecycle-draft rediscovery to ArtifactRefs without fabricated state;
- SQLite/config v3 semantics;
- bounded v2→v3 migration with active-execution refusal and revalidation;
- preserve historical runtime records.

### P7-T02 — Canonical title/archive management

- canonical H1 rewrite helper;
- expected-hash title command;
- deterministic archive marker;
- derive/persist `WorkItem.archived`;
- default active list + include-archived query;
- archive/restore eligibility and no lifecycle mutation.

### P7-T03 — Documentation Git status and exact path-scoped commit

- governed WorkItem path set including archive marker;
- MATCHES_HEAD/MODIFIED/UNTRACKED/DELETED/MISSING/IGNORED/UNMERGED;
- expected HEAD/path/hash proof;
- repository-local Git identity;
- attached `refs/heads/*`;
- in-progress Git-operation blockers;
- path-scoped dry-run/commit;
- exact intent-to-add and tracked-deletion handling;
- normal hooks;
- post-commit blob/hash proof and query invalidation.

### P7-T04 — Typed API failure boundary

- one canonical HTTP error classifier;
- preserve source diagnostics on 409;
- 400 malformed / 404 absent / 409 known conflict / 500 unexpected defect;
- browser parses one canonical error shape;
- primary UI receives actionable detail.

### P7-T05 — Run-scoped provider diagnostic evidence

Across STAGE/BUILDER/REVIEWER/REMEDIATOR:

- bounded/redacted stderr;
- provider/model/session/prompt/timing/outcome diagnostics;
- format-repair and parse/transport failure detail;
- coordinator-owned diagnostic event;
- failure event references causal evidence;
- no hidden reasoning/secrets/second log store.

### P7-T06 — Human workflow projection and Activity workspace

- one user-facing workflow/status language owner;
- compact workflow orientation;
- Activity replaces active-only pre-signoff dialogue ownership;
- all current/terminal Runs;
- one RunEvent presentation path;
- pending input attached to Activity;
- proposal-review round trip;
- terminal failure recovery;
- symmetric mode reconciliation;
- user-facing Implementation label while backend `EXECUTION` remains;
- Technical details secondary.

### P7-T07 — Documents/Git/title/archive UI with CodeMirror preservation

- preserve CodeMirror exact-source editor;
- project-first creation shows repository-local location;
- editor/working-tree/Git state strip;
- Save documentation to Git interaction;
- header title edit through daemon;
- archive/restore management;
- Show archived queue;
- no browser Markdown authority duplication;
- preserve dirty/focus/history/preview behavior.

### P7-T08 — OpenCode saved-account daemon/shell

- safe account projection from `integration.get("opencode")`;
- no secret-bearing account-list API;
- private exact-version control process;
- fixed `opencode/device` OAuth login;
- authorization URL validation;
- login start/status/cancel;
- activate/rename;
- unique labels;
- global mutation serialization with no active Runs;
- prove active account after Add/Switch;
- never modify `OrderConfig.model`.

### P7-T09 — Global OpenCode account UI

- shell-level active-account control;
- queue + WorkItem availability;
- saved account list;
- Active / needs-auth state;
- Switch/Rename/Add;
- external sign-in flow/polling;
- active-Run blocker;
- responsive application-utility placement;
- TanStack Query as sole browser server-state owner.

### P7-T10 — Full product/architecture certification

Add/complete permanent tests across:

- v3 storage/migration;
- deterministic lifecycle rediscovery;
- title/archive behavior;
- exact documentation Git isolation;
- Git eligibility/identity;
- typed HTTP failures;
- provider diagnostics;
- Activity and responsive workflow;
- CodeMirror regression;
- three-account OpenCode switching/login;
- FCIS/SoC/DRY/strict typing/no DTO/no second store;
- all six configured verification gates.

No task is considered mergeable until its own targeted tests and PR CI are green. T10 is the final cross-cutting/adversarial closure, not the first point at which earlier behavior receives tests.

### P7-T11 — Prepare and publish release 0.2.0

After T00–T10 are merged:

- create `release/v0.2.0` from current `master`;
- set `package.json.version = 0.2.0`;
- freeze all `[Unreleased]` entries under `[0.2.0] - YYYY-MM-DD`;
- leave empty `[Unreleased]`;
- update release/install docs only where required;
- run full gates;
- open/merge release PR;
- allow release workflow to create `v0.2.0`, build/checksum, draft/upload/publish GitHub Release;
- verify released bundle version/commit, `order --version`, health version and tag all agree;
- verify public latest/pinned install URLs consume release asset;
- delete release branch after successful publication.

## 6. Exact change map

### T00

Add:

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `scripts/verify-release.ts`
- `scripts/package-release.ts`
- `src/version.ts`

Modify:

- `.github/pull_request_template.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `package.json` (scripts/config only; version unchanged)
- `tsconfig.json` only if required by the canonical version adapter
- `src/cli.ts`
- `src/daemon/server.ts`
- `tests/architecture.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/certification.test.ts`

Administrative evidence: apply the `master`/`v*` rulesets owned by the public-delivery standard.

### T01

Modify:

- `src/installer.ts`
- `src/core/contracts.ts`
- `src/core/work-item-source.ts`
- `src/shell/config.ts`
- `src/shell/setup.ts`
- `src/shell/sqlite.ts`
- `src/shell/work-item-source.ts`
- `src/daemon/runtime.ts`
- `src/daemon/work-item-source.ts`
- `pontivus-order.toml.example`
- targeted core/shell/sqlite/daemon/migration tests.

### T02

Modify:

- `src/core/contracts.ts`
- `src/core/lifecycle.ts`
- `src/core/work-item-source.ts`
- `src/shell/sqlite.ts`
- `src/shell/work-item-source.ts`
- `src/daemon/work-item-source.ts`
- `src/daemon/server.ts`
- targeted core/shell/sqlite/daemon tests.

### T03

Add:

- `src/daemon/work-item-documentation.ts`

Modify:

- `src/core/contracts.ts`
- `src/shell/repository.ts`
- `src/daemon/runtime.ts`
- `src/daemon/server.ts`
- targeted shell/daemon tests.

### T04

Modify:

- `src/core/contracts.ts`
- `src/daemon/server.ts`
- `src/daemon/work-item-source.ts`
- `ui/src/http.ts`
- targeted daemon/browser tests.

### T05

Modify:

- `src/core/contracts.ts`
- `src/shell/opencode.ts`
- `src/daemon/run.ts`
- `src/daemon/stage.ts`
- `src/daemon/execution.ts`
- targeted OpenCode/daemon tests.

### T06

Add:

- `ui/src/ActivityWorkspace.tsx`
- `ui/src/RunEventTimeline.tsx`

Modify/delete as appropriate:

- `ui/src/workbench-presentation.ts`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/StageDialogue.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/query-keys.ts`
- `ui/src/styles.css`
- `ui/src/theme.css`
- browser tests.

`StageDialogue.tsx` is deleted once Activity owns its responsibilities.

### T07

Modify:

- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/MarkdownEditor.tsx`
- `ui/src/MarkdownSourceEditor.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/styles.css`
- `ui/src/theme.css`
- browser and Markdown-formatting tests.

CodeMirror is preservation authority; this task may integrate actions/state but not replace the editor substrate or duplicate Markdown state.

### T08

Add:

- `src/daemon/opencode-account.ts`

Modify:

- `src/core/contracts.ts`
- `src/shell/opencode.ts`
- `src/daemon/runtime.ts`
- `src/daemon/server.ts`
- OpenCode/daemon tests.

### T09

Add:

- `ui/src/OpenCodeAccountControl.tsx`

Modify:

- `ui/src/app.tsx`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`
- browser tests.

### T10

May modify only the permanent verification surface required to close cross-cutting/adversarial gaps:

- `tests/architecture.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/e2e-server.ts`
- `tests/shell.test.ts`
- `tests/sqlite.test.ts`
- `tests/order-migration.test.ts`
- `tests/opencode.test.ts`
- `tests/browser.spec.ts`
- `tests/certification.test.ts`
- `tests/markdown-source-formatting.test.ts`

### T11

Modify only release metadata/distribution documentation:

- `package.json`
- `CHANGELOG.md`
- `README.md` only if release URL/documentation requires final version-specific correction.

No production behavior change is permitted in the release PR.

## 7. Required deletions/replacements

Remove obsolete productive behavior rather than retain compatibility branches:

- external productive `workItemRoot`;
- global-root-relative/movable source semantics;
- one-way Documents→Dialogue reconciliation;
- active-only pre-signoff Run UI;
- RunEvent filtering that hides terminal/conformance/provider events;
- generic unexpected→400 API behavior;
- stderr no-op discard where diagnostics require capture;
- raw R1/R2/R3 primary UI terminology;
- public install/update instructions that clone `master`;
- direct-`master` repository operating instructions.

No dual v2/v3 source path, dual StageDialogue/Activity surface, duplicate OpenCode account store, or master/release dual distribution channel remains.

## 8. Migration execution order

For an existing Order installation:

1. quiesce old daemon;
2. preflight v2 source/runtime state;
3. refuse migration during active execution;
4. resolve project document roots;
5. preflight deterministic destinations;
6. copy source/current lifecycle bytes and verify hashes;
7. migrate SQLite/config to v3;
8. activate application;
9. reconcile repository-native drafts;
10. require health/source reconciliation;
11. retain old source root only as backup.

No live dual-read transition.

## 9. Verification gates

Every PR is subject to permanent CI.

The configured gates are:

1. dependency-lock
2. typecheck
3. architecture
4. test
5. build
6. browser

T00 establishes the retained CI enforcement. T11 re-runs the complete set before tag/publication.

Tests/checks are fixed at their owning layer; they are not weakened to accept old behavior.

## 10. Release acceptance

Release `0.2.0` is complete only when all are true:

- P7 T00–T10 implementation PRs are merged through the public-delivery process;
- release PR merged from `release/v0.2.0`;
- `package.json.version === "0.2.0"`;
- `CHANGELOG.md` contains released `0.2.0` section;
- annotated `v0.2.0` points to the exact release-PR merge commit;
- GitHub Release `v0.2.0` is published;
- `pontivus-order.tar.gz` and checksum are attached;
- bundle manifest identifies exact version/commit;
- `order --version` and `GET /api/health` report `0.2.0`;
- latest and pinned installation paths install the release asset;
- no unsupported master-clone path is presented as normal public installation.

## 11. Completion criterion

After publication, an operator can use the complete repository-native workflow, Git documentation persistence, Activity, CodeMirror authoring and saved OpenCode-account switching from a certified public `0.2.0` release.

A contributor can also prove exactly how any public change reached users:

```text
work PR(s)
 -> CHANGELOG [Unreleased]
 -> green CI
 -> master
 -> release/v0.2.0 PR
 -> package/changelog 0.2.0
 -> green full CI
 -> master release commit
 -> v0.2.0
 -> GitHub Release
 -> built archive + checksum
 -> public install/update
```

There are no open design/release decisions in this plan.

## 12. Canonical task block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "P7-T00",
      "objective": "Establish permanent public-repository PR verification, semantic release metadata, single-source runtime versioning, release packaging/publication and repository protection for target release 0.2.0.",
      "dependsOn": [],
      "scope": [".github/**", "CHANGELOG.md", "CONTRIBUTING.md", "README.md", "package.json", "scripts/**", "src/version.ts", "src/cli.ts", "src/daemon/server.ts", "tests/**"],
      "exclusions": ["docs/**", "pontivus-order.toml"],
      "acceptanceRefs": ["GW-P1-PUBLIC-REPOSITORY-DELIVERY", "GW-TR-057-PUBLIC-REPOSITORY-RELEASE-AUTOMATION"],
      "changeSurface": [".github/workflows/ci.yml", ".github/workflows/release.yml", ".github/pull_request_template.md", "CHANGELOG.md", "CONTRIBUTING.md", "README.md", "package.json", "scripts/verify-release.ts", "scripts/package-release.ts", "src/version.ts", "src/cli.ts", "src/daemon/server.ts", "tests/architecture.test.ts", "tests/core.test.ts", "tests/daemon.test.ts", "tests/certification.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1", "GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["foundation", "daemon", "verification"]
    },
    {
      "id": "P7-T01",
      "objective": "Cut productive Order configuration, persistence, source discovery and installer migration to repository-native WorkItem v3 semantics.",
      "dependsOn": ["P7-T00"],
      "scope": ["src/installer.ts", "src/core/**", "src/shell/**", "src/daemon/**", "pontivus-order.toml.example", "tests/**"],
      "exclusions": ["docs/**", "ui/**", "pontivus-order.toml"],
      "acceptanceRefs": ["GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION", "GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT", "GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-TR-036-REPOSITORY-NATIVE-WORKITEM-DOCUMENTS", "GW-TR-038-PROJECT-SCOPED-SOURCE-DISCOVERY", "GW-TR-045-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-TR-048-V2-V3-APPROVAL-MIGRATION-SAFETY"],
      "changeSurface": ["src/installer.ts", "src/core/contracts.ts", "src/core/work-item-source.ts", "src/shell/config.ts", "src/shell/setup.ts", "src/shell/sqlite.ts", "src/shell/work-item-source.ts", "src/daemon/runtime.ts", "src/daemon/work-item-source.ts", "pontivus-order.toml.example", "tests/core.test.ts", "tests/shell.test.ts", "tests/sqlite.test.ts", "tests/daemon.test.ts", "tests/order-migration.test.ts", "tests/architecture.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["foundation", "core", "shell", "daemon", "verification"]
    },
    {
      "id": "P7-T02",
      "objective": "Implement canonical WorkItem title editing and repository-native archive/restore semantics.",
      "dependsOn": ["P7-T01"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**", "tests/**"],
      "exclusions": ["docs/**", "ui/**"],
      "acceptanceRefs": ["GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT", "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE", "GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY"],
      "changeSurface": ["src/core/contracts.ts", "src/core/lifecycle.ts", "src/core/work-item-source.ts", "src/shell/sqlite.ts", "src/shell/work-item-source.ts", "src/daemon/work-item-source.ts", "src/daemon/server.ts", "tests/core.test.ts", "tests/shell.test.ts", "tests/sqlite.test.ts", "tests/daemon.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon", "verification"]
    },
    {
      "id": "P7-T03",
      "objective": "Implement WorkItem documentation Git status and exact path-scoped commits including archive-marker add/deletion.",
      "dependsOn": ["P7-T01", "P7-T02"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**", "tests/**"],
      "exclusions": ["docs/**", "ui/**"],
      "acceptanceRefs": ["GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE", "GW-FR-063-DOCUMENTATION-GIT-STATUS", "GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY", "GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY", "GW-TR-037-PATH-SCOPED-DOCUMENTATION-GIT-PERSISTENCE", "GW-TR-046-DOCUMENTATION-GIT-ELIGIBILITY", "GW-TR-047-REPOSITORY-LOCAL-GIT-IDENTITY"],
      "changeSurface": ["src/core/contracts.ts", "src/shell/repository.ts", "src/daemon/work-item-documentation.ts", "src/daemon/runtime.ts", "src/daemon/server.ts", "tests/shell.test.ts", "tests/daemon.test.ts", "tests/architecture.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon", "verification"]
    },
    {
      "id": "P7-T04",
      "objective": "Implement the canonical typed HTTP failure boundary and preserve source/current-state diagnostics through the browser.",
      "dependsOn": ["P7-T01"],
      "scope": ["src/core/**", "src/daemon/**", "ui/src/http.ts", "tests/**"],
      "exclusions": ["docs/**"],
      "acceptanceRefs": ["GW-FR-055-ACTIONABLE-FAILURE-RECOVERY", "GW-TR-055-TYPED-API-FAILURE-CLASSIFICATION"],
      "changeSurface": ["src/core/contracts.ts", "src/daemon/server.ts", "src/daemon/work-item-source.ts", "ui/src/http.ts", "tests/daemon.test.ts", "tests/browser.spec.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "daemon", "ui", "verification"]
    },
    {
      "id": "P7-T05",
      "objective": "Persist bounded secret-safe provider diagnostics as existing Run evidence for pre-signoff and post-signoff provider turns.",
      "dependsOn": ["P7-T04"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**", "tests/**"],
      "exclusions": ["docs/**", "ui/**"],
      "acceptanceRefs": ["GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY", "GW-FR-055-ACTIONABLE-FAILURE-RECOVERY", "GW-FR-057-TECHNICAL-DETAILS-BOUNDARY", "GW-TR-056-RUN-SCOPED-PROVIDER-DIAGNOSTIC-EVIDENCE"],
      "changeSurface": ["src/core/contracts.ts", "src/shell/opencode.ts", "src/daemon/run.ts", "src/daemon/stage.ts", "src/daemon/execution.ts", "tests/opencode.test.ts", "tests/daemon.test.ts", "tests/certification.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon", "verification"]
    },
    {
      "id": "P7-T06",
      "objective": "Replace backend-code/active-only dialogue presentation with the canonical human workflow and all-Run Activity workspace.",
      "dependsOn": ["P7-T04", "P7-T05"],
      "scope": ["ui/**", "tests/browser.spec.ts"],
      "exclusions": ["docs/**", "src/**"],
      "acceptanceRefs": ["GW-FR-051-USER-FACING-WORKFLOW-LANGUAGE", "GW-FR-052-WORKFLOW-ORIENTATION", "GW-FR-053-ACTIVITY-WORKSPACE", "GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY", "GW-FR-055-ACTIONABLE-FAILURE-RECOVERY", "GW-FR-056-WORKFLOW-ACTION-PLACEMENT", "GW-FR-057-TECHNICAL-DETAILS-BOUNDARY", "GW-FR-059-RESPONSIVE-ACTIVITY-CONTINUITY", "GW-TR-027-WORKFLOW-PRESENTATION-PROJECTION", "GW-TR-028-WORKFLOW-HEADER-GEOMETRY", "GW-TR-029-ACTIVITY-MASTER-DETAIL-LAYOUT", "GW-TR-030-SINGLE-RUN-EVENT-PRESENTATION", "GW-TR-031-ACTIVITY-INPUT-PLACEMENT", "GW-TR-032-TECHNICAL-DETAILS-PRESENTATION", "GW-TR-033-PRIMARY-FAILURE-PRESENTATION", "GW-TR-035-CANONICAL-MODE-RECONCILIATION"],
      "changeSurface": ["ui/src/ActivityWorkspace.tsx", "ui/src/RunEventTimeline.tsx", "ui/src/workbench-presentation.ts", "ui/src/WorkItemWorkspace.tsx", "ui/src/WorkItemContext.tsx", "ui/src/StageDialogue.tsx", "ui/src/ExecutionWorkspace.tsx", "ui/src/ProposalReview.tsx", "ui/src/EvidenceViewer.tsx", "ui/src/query-keys.ts", "ui/src/styles.css", "ui/src/theme.css", "tests/browser.spec.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["ui", "verification"]
    },
    {
      "id": "P7-T07",
      "objective": "Integrate repository-native document/Git state and WorkItem management into the existing CodeMirror workbench without replacing its source model.",
      "dependsOn": ["P7-T02", "P7-T03", "P7-T04", "P7-T06"],
      "scope": ["ui/**", "tests/browser.spec.ts", "tests/markdown-source-formatting.test.ts"],
      "exclusions": ["docs/**", "src/**"],
      "acceptanceRefs": ["GW-FR-058-WORKITEM-MANAGEMENT-DISCOVERABILITY", "GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE", "GW-FR-063-DOCUMENTATION-GIT-STATUS", "GW-FR-064-DOCUMENTATION-GIT-CONTROL-PLACEMENT", "GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR", "GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES", "GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS", "GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW", "GW-FR-069-EDITOR-STATE-CONTINUITY", "GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT", "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE", "GW-TR-034-WORKITEM-MANAGEMENT-CONTROL-PLACEMENT", "GW-TR-039-CODEMIRROR-SOURCE-EDITOR-BOUNDARY", "GW-TR-040-EXACT-SOURCE-EDITOR-SYNCHRONIZATION", "GW-TR-041-MARKDOWN-PREVIEW-COMPOSITION", "GW-TR-042-DOCUMENT-EDITOR-ERGONOMIC-CONFIGURATION", "GW-TR-043-CODEMIRROR-THEME-SPATIAL-INTEGRATION", "GW-TR-044-EXACT-SOURCE-EDITOR-CERTIFICATION", "GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY"],
      "changeSurface": ["ui/src/CreateWorkItem.tsx", "ui/src/DocumentWorkspace.tsx", "ui/src/MarkdownEditor.tsx", "ui/src/MarkdownSourceEditor.tsx", "ui/src/WorkItemQueue.tsx", "ui/src/WorkItemWorkspace.tsx", "ui/src/WorkItemContext.tsx", "ui/src/http.ts", "ui/src/query-keys.ts", "ui/src/styles.css", "ui/src/theme.css", "tests/browser.spec.ts", "tests/markdown-source-formatting.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["ui", "verification"]
    },
    {
      "id": "P7-T08",
      "objective": "Implement safe installation-global OpenCode saved-account listing, Add/Switch/Rename and mutation serialization without provider/model changes.",
      "dependsOn": ["P7-T04"],
      "scope": ["src/core/**", "src/shell/**", "src/daemon/**", "tests/**"],
      "exclusions": ["docs/**", "ui/**"],
      "acceptanceRefs": ["GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY", "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING", "GW-FR-075-OPENCODE-ACCOUNT-LOGIN", "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY", "GW-TR-049-OPENCODE-SAFE-ACCOUNT-PROJECTION", "GW-TR-050-OPENCODE-ACCOUNT-CONTROL-PROCESS", "GW-TR-051-OPENCODE-ACCOUNT-MUTATION-SERIALIZATION", "GW-TR-052-OPENCODE-BROWSER-OAUTH-ACCOUNT-LOGIN"],
      "changeSurface": ["src/core/contracts.ts", "src/shell/opencode.ts", "src/daemon/opencode-account.ts", "src/daemon/runtime.ts", "src/daemon/server.ts", "tests/opencode.test.ts", "tests/daemon.test.ts", "tests/certification.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["core", "shell", "daemon", "verification"]
    },
    {
      "id": "P7-T09",
      "objective": "Expose saved OpenCode login accounts through one global application-shell account control and browser OAuth flow.",
      "dependsOn": ["P7-T08"],
      "scope": ["ui/**", "tests/browser.spec.ts"],
      "exclusions": ["docs/**", "src/**"],
      "acceptanceRefs": ["GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY", "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING", "GW-FR-075-OPENCODE-ACCOUNT-LOGIN", "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY", "GW-TR-053-OPENCODE-ACCOUNT-CONTROL-UI"],
      "changeSurface": ["ui/src/OpenCodeAccountControl.tsx", "ui/src/app.tsx", "ui/src/http.ts", "ui/src/query-keys.ts", "ui/src/primitives/WorkbenchToolbar.tsx", "ui/src/styles.css", "ui/src/theme.css", "tests/browser.spec.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["ui", "verification"]
    },
    {
      "id": "P7-T10",
      "objective": "Close cross-cutting/adversarial certification for repository-native workbench, Git persistence, Activity, CodeMirror preservation and OpenCode multi-account behavior.",
      "dependsOn": ["P7-T01", "P7-T02", "P7-T03", "P7-T04", "P7-T05", "P7-T06", "P7-T07", "P7-T08", "P7-T09"],
      "scope": ["tests/**"],
      "exclusions": ["docs/**", "src/**", "ui/**"],
      "acceptanceRefs": ["GW-FR-051-USER-FACING-WORKFLOW-LANGUAGE", "GW-FR-053-ACTIVITY-WORKSPACE", "GW-FR-054-EXACT-AGENT-EXECUTION-VISIBILITY", "GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION", "GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE", "GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR", "GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY", "GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING", "GW-FR-075-OPENCODE-ACCOUNT-LOGIN", "GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY", "GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT", "GW-FR-078-PORTABLE-WORKITEM-ARCHIVE", "GW-TR-037-PATH-SCOPED-DOCUMENTATION-GIT-PERSISTENCE", "GW-TR-044-EXACT-SOURCE-EDITOR-CERTIFICATION", "GW-TR-045-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY", "GW-TR-048-V2-V3-APPROVAL-MIGRATION-SAFETY", "GW-TR-049-OPENCODE-SAFE-ACCOUNT-PROJECTION", "GW-TR-051-OPENCODE-ACCOUNT-MUTATION-SERIALIZATION", "GW-TR-053-OPENCODE-ACCOUNT-CONTROL-UI", "GW-TR-054-WORKITEM-MANAGEMENT-CANONICALITY", "GW-TR-055-TYPED-API-FAILURE-CLASSIFICATION", "GW-TR-056-RUN-SCOPED-PROVIDER-DIAGNOSTIC-EVIDENCE"],
      "changeSurface": ["tests/architecture.test.ts", "tests/core.test.ts", "tests/daemon.test.ts", "tests/e2e-server.ts", "tests/shell.test.ts", "tests/sqlite.test.ts", "tests/order-migration.test.ts", "tests/opencode.test.ts", "tests/browser.spec.ts", "tests/certification.test.ts", "tests/markdown-source-formatting.test.ts"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-FCIS", "GW-P1-SOC", "GW-P1-DRY", "GW-P1-STRICT-TYPING", "GW-P1-CANONICAL-OWNERSHIP"],
      "concernIds": ["verification"]
    },
    {
      "id": "P7-T11",
      "objective": "Prepare and publish the certified public Order 0.2.0 release from the exact merged implementation candidate.",
      "dependsOn": ["P7-T00", "P7-T10"],
      "scope": ["package.json", "CHANGELOG.md", "README.md"],
      "exclusions": ["src/**", "ui/**", "tests/**", "docs/**", ".github/**", "scripts/**", "pontivus-order.toml"],
      "acceptanceRefs": ["GW-P1-PUBLIC-REPOSITORY-DELIVERY", "GW-TR-057-PUBLIC-REPOSITORY-RELEASE-AUTOMATION"],
      "changeSurface": ["package.json", "CHANGELOG.md", "README.md"],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": ["GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1", "GW-P4-V1-ARCHITECTURE", "GW-P6-V1-CONTRACTS", "GW-P1-MINIMUM-CHANGE"],
      "concernIds": ["foundation", "verification"]
    }
  ]
}
```
