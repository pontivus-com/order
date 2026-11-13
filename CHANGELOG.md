# Changelog

All notable public changes to Order are recorded here.

Versioning and release governance are owned by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1`.

## [Unreleased]

### Changed

- Make normal WorkItem Source authoring body-only while preserving exact portable metadata bytes, complete-file concurrency identity, and read-only technical source disclosure.

- Add bounded repository-owned WorkItem document-root migration with exact-byte tree staging, minimal manifest mutation, transactional current-source path updates, rollback, and lifecycle draft rediscovery.

- Add the canonical Settings/readiness daemon owner with drift-safe repository projection, valid-incomplete v4 daemon boot, focused configuration mutations, and serialized immutable runtime activation/rollback.
- Introduce `OrderConfig` v4 with valid incomplete configuration, deterministic v3→v4 migration, persisted config SHA identity, expected-hash replacement, and drift-tolerant stored path reads as the foundation for centralized Settings.

### Fixed

- Wait for the pinned OpenCode account integration to finish registering before querying saved accounts, preventing a clean installation from surfacing a transient upstream 404 as an internal daemon error.

### Changed

- Establish the governed 0.2.1 functional design for first-class connected-repository/document-location and OpenCode-account configuration, installation continuity/readiness, navigable workflow inspection, compact information placement, and human-first WorkItem Markdown authoring with preserved system metadata.
- Define the 0.2.1 technical refactor architecture for centralized Settings, immutable runtime configuration activation, repository/document-root migration, canonical readiness, human-first Source recomposition, compact semantic viewport composition, and direct appearance switching.
- Define the bounded 0.2.1 implementation plan with explicit refactor necessity, owner-boundary changes, ordered work PRs, permanent verification and release closure.
- Close the 0.2.1 design/plan audit gaps by governing safe OpenCode account removal and explicitly certifying current-version update continuity, ambiguous repository recovery, installer rollback, and unresolved-readiness update reporting.

### Internal

- Trigger governed publication of the final certified `0.2.0` release candidate.

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
