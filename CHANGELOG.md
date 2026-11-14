# Changelog

All notable public changes to Order are recorded here.

Versioning and release governance are owned by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1`.

## [Unreleased]

### Changed

- Define the Order 0.2.2 corrective functional/P4/P6 design for productive OpenCode workspace containment and model-context admission across every productive agent role, including local-vs-provider failure classification, adversarial certification of ignored dependencies/direct reads/symlink and metadata escape/external references/mutation safety/freshness/restart behavior, a Run-specific `OPENCODE_CONFIG_CONTENT` agent environment, and an explicit trusted-integration boundary for the selected OpenCode Console account, skills and MCP semantics without promoting them into canonical Order authority.
- Redesign the canonical WorkItem information architecture around one lifecycle workflow-step navigation axis: each step owns its dialogue, governed document, proposal review, evidence and current action using the appropriate space class, while the superseded global Documents / Activity / Review / Result destination hierarchy is removed.
- Strengthen Markdown editor geometry requirements with final-line long-document scrolling certification and clarify repository Settings around explicit Add repository plus confirmed, non-destructive Disconnect.
- Add the governed Order 0.2.2 P7 implementation plan as one cumulative signed task with exact code/test change surface, trusted Console/skill/MCP admission mechanics, workspace/instruction/failure/freshness implementation steps, and the complete dependency-lock/typecheck/architecture/test/build/browser gate union.
- Add the governed 0.3.0 workflow-centric Workbench foundational P7 plan with explicit per-step implementation ownership, deletion obligations, Research → Requirements progression certification, proposal/evidence return continuity, exhaustive presentation-policy certification, and complete wide/narrow browser coverage.
- Specify the complete workflow-step panel grammar, deterministic primary-material rules, exhaustive Run/OpenCode feedback presentation, mutation pending/success/failure behavior, and the explicit boundary that browser feedback uses canonical Runs/RunEvents rather than invented provider streaming.
- Define complete functional screen contracts for all nine workflow steps and bind each region/material/action to the exact shared Order/Astryx primitive composition used by the corresponding P4 technical design.


### Fixed

- Enforce the 0.2.2 productive-invocation contract end to end: materialize STAGE from the exact Git-visible baseline/delta instead of the physical tree, prove exact P1 `AGENTS.md` bytes and workspace containment, isolate productive OpenCode configuration, bind the live READY Console account plus exact skill/MCP permissions, classify local admission/freshness failures separately from provider failures, and independently reject repository-instruction mutation.
- Establish the 0.3.0 WorkItem workflow-centric interaction foundation: make lifecycle steps the single persistent navigation model, keep Context on-demand, keep task-local actions with their owning material, eliminate navigation reconstruction around proposal/evidence review, and preserve next-stage action continuity after terminal Runs.
- Correct the `0.2.1` release history so it describes only work shipped in that version, removes stale `0.2.0` publication residue, and records the complete Settings/account/readiness, repository migration, Source-authoring, workbench and certification scope.

## [0.2.1] - 2026-11-13

### Added

- Add centralized browser Settings with stable native-history destinations for connected repositories and WorkItem document roots, STAGE reference roots, OpenCode accounts, and model/runtime selection.
- Add complete OpenCode account management in Settings, including Add, Switch, Rename and safe Remove flows; final-account removal transitions immediately to account-required readiness while active Runs continue to block account mutation.
- Add browser-first installation completion from a valid incomplete OrderConfig v4 state, with daemon-owned readiness that keeps Settings available for repository, model, account and reference-root recovery.
- Add bounded repository-owned WorkItem document-root migration with exact-byte tree staging, minimal manifest mutation, transactional current-source path updates, rollback, restart/reconcile coverage and lifecycle draft rediscovery.
- Add human-first WorkItem Source authoring that edits only body Markdown while preserving exact portable metadata bytes, complete-file optimistic concurrency and read-only technical source disclosure.
- Add non-mutating workflow-step inspection/navigation across lifecycle documents, Review, Execution and Result, including explicit unreached presentation.
- Add a direct accessible System/Light/Dark appearance switcher while preserving the existing theme preference and persistence owner.

### Changed

- Introduce OrderConfig v4 as the current runtime configuration contract, with nullable model, zero-or-more repositories, deterministic v3→v4 migration, persisted config SHA identity, expected-hash replacement and drift-tolerant stored path reads.
- Replace fail-fast configuration startup with a canonical Settings/readiness daemon owner that supports valid-incomplete v4 boot, READY/ATTENTION repository projection, focused configuration mutations and serialized immutable runtime activation/rollback.
- Move full OpenCode account management out of the application shell; the shell account control now exposes only concise current-account/attention state and navigation to Settings.
- Consolidate WorkItem identity, workflow progression, workspace modes and contextual actions into one compact top rail, and fold document Git state plus Markdown editing controls into a coherent editor/document control surface.
- Establish and close the governed 0.2.1 functional, technical and implementation-plan baseline for centralized Settings, installation continuity/readiness, repository/document migration, human-first Source authoring and compact workbench interaction.

### Fixed

- Wait for the pinned OpenCode account integration to finish registering before querying saved accounts, preventing clean installation from surfacing a transient upstream 404 as an internal daemon error.

### Internal

- Add permanent cross-boundary architecture and installed-state certification for configuration/runtime ownership, repository recovery and migration, OpenCode account readiness/removal, Source metadata fidelity, workbench navigation/chrome, direct appearance control and obsolete-path absence.
- Strengthen final ownership sensors so canonical config writing remains singular, CoordinatorRuntime configuration remains immutable, browser configuration/metadata shadow owners remain absent, and ordinary Source authoring stays on the body-only command path.

## [0.2.0] - 2026-11-13

### Added

- Added permanent public-repository PR verification, governed release publication, package-derived runtime versioning, and reproducible release bundle/checksum tooling for the 0.2.0 release train.

### Changed

- Define the Order software-factory product identity, aperture-based brand assets, and public README messaging around ideas becoming verified results.
- Add structured GitHub issue intake for bug reports, feature requests, and private security reporting.
- Add adversarial cross-boundary certification for repository-native Git admission, three-account OpenCode identity switching, and canonical UI/runtime ownership.
- Add a responsive global OpenCode saved-account utility for safe switching, rename, external device sign-in, auth attention, and active-Run mutation blocking.
- Integrate repository-native documentation Git state/save, direct title management, archive/restore, archived queue visibility, and project-local creation paths into the existing CodeMirror workbench.
- Add installation-global saved OpenCode account discovery, activation, rename, and retained device-login control behind the authenticated daemon API without exposing credential secrets.
- Replace active-only Dialogue with an all-Run Activity workspace and human workflow orientation across the WorkItem surface.
- Persist bounded, secret-safe provider turn diagnostics as canonical Run evidence with failure linkage.
- Add the canonical typed HTTP failure boundary with actionable source/current-state diagnostics.
- Add canonical WorkItem documentation Git status and exact path-scoped commit persistence.
- Add canonical WorkItem title editing and repository-native archive/restore projection semantics.
- Cut productive WorkItem configuration, source discovery, lifecycle drafts, and persistence to repository-native v3 semantics with bounded v2 migration.
- Formalized public-repository delivery through pull requests, semantic release impact, changelog entries, versioned release PRs, immutable tags, GitHub Releases and certified release artifacts.
- Extended the implementation-ready repository-native workbench plan to include permanent CI/release automation and a target `0.2.0` public release.
- Reorder the public README around product value, lifecycle, result semantics, installation, operating context, and repository documentation; remove contradictory pre-release/release installation copy.

### Fixed

- Finalize publication recovery for the first public release from the certified replacement `0.2.0` candidate.
- Ensure repository-triggered exact release retries execute the full publication path even when the certified replacement candidate keeps the same package version as its parent.
- Replace the incorrect Order logo construction with the approved six-blade aperture mark across every repository brand asset.
- Correct the horizontal Order logo canvas crop so the visible mark and wordmark render centered in the GitHub README and other fixed-width placements.
- Force GitHub to render the corrected centered README logo plate from a new asset path instead of a stale cached SVG.
- Make the first certified `0.2.0` release archive directly installable without Git metadata while preserving exact release commit/version provenance and the packaged production build.
- Corrected the canonical public-release governance document path so it participates in active documentation ownership checks.
- Make release publication race-safe by validating the immutable release commit remains reachable from `master` instead of requiring it to remain the moving branch tip, preserving exact retries after later merges.
- Add a governed PR-triggered exact release retry request so failed publication can be resumed through the same release workflow when workflow dispatch is unavailable.
- Permit a failed unpublished release candidate to be replaced at the same version only while its tag is absent and the replacement re-freezes current unreleased changes through the normal release PR gates.
