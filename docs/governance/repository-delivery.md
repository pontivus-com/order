# Public repository delivery and release standard

**Status:** Binding repository-delivery governance  
**Canonical concern ID:** `GW-DOC-PUBLIC-REPOSITORY-DELIVERY`  
**Versioned concern ID:** `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`  
**Pyramid layer:** P1 repository governance

## 1. Purpose

Order is a public GitHub repository. Public changes must be reviewable, attributable, versioned and releasable without treating the default branch as an unversioned distribution channel.

This document owns:

- pull-request-only delivery to `master`;
- semantic version policy;
- changelog ownership;
- release-PR semantics;
- immutable version tags;
- GitHub Release/build-asset publication;
- public install/update distribution from releases rather than arbitrary `master`;
- repository ruleset/status-check expectations.

It does not redefine product lifecycle, implementation architecture, runtime Git behavior inside target WorkItems, or OpenCode semantics.

## 2. Public delivery invariant

No repository content change is delivered directly to `master`.

This includes:

- production code;
- tests;
- documentation;
- governance/authority files;
- dependency or lock changes;
- CI/release configuration;
- version/changelog metadata;
- emergency/revert corrections.

Every change is made on a short-lived branch and ultimately delivered through a pull request targeting `master`. When the operator explicitly designates one existing working branch for an in-flight release campaign, supporting work for that campaign may use stacked pull requests targeting that branch. All such work converges through the campaign's single integration PR to `master`; it must not be delivered independently to `master` or delivered twice. The same PR audit, exact-candidate verification, scope/authority and operator decision boundaries apply to stacked integration. An integration target does not itself confer execution authority or waive an existing sign-off.

The PR is the durable review/audit boundary. Chat approval, an agent plan, a successful local test run or write access does not create a direct-push exception.

Permitted branch prefixes are:

```text
feat/
fix/
docs/
chore/
release/
revert/
```

Branches are deleted after merge/closure unless a specific release/recovery investigation requires retention.

### GW-P1-PUBLIC-REPOSITORY-DELIVERY

**Required behavior:** every change to the public repository reaches `master` through a pull request.

**Acceptance:** repository operating instructions, contributor guidance and repository protection all prohibit ordinary direct `master` delivery.

**Failure:** direct commits/pushes to `master`, force-push delivery or bypassing the PR audit trail are nonconformant.

## 3. Pull request contract

Every non-release PR must:

1. start from current `master`, or from the explicitly designated in-flight campaign integration target under §2; stale supporting candidates must reconcile the current target before merge;
2. contain one cohesive change/work package;
3. identify the governing authority/work item where applicable;
4. update `CHANGELOG.md` under `[Unreleased]`;
5. declare a release impact:
   - `patch`;
   - `minor`;
   - `major`;
6. declare the intended release train/version when one is already established;
7. list verification performed;
8. pass the repository's required PR status checks before merge.
9. preserve the PR as the durable review/audit boundary and resolve any material review discussion before merge. Order does not require a second human reviewer when no independent reviewer exists; merge readiness is established by the exact current candidate, required verification evidence, traceable governing authority and explicit operator decision.

For Order while `MAJOR = 0`:

- compatible bug fixes, documentation corrections and release/tooling corrections are `patch`;
- new user-visible capability, material behavior expansion, storage/config migration, or compatibility-breaking change is `minor`;
- `major` is reserved for the intentional transition to/stable evolution after `1.0.0`.

After `1.0.0`, ordinary Semantic Versioning 2.0.0 MAJOR/MINOR/PATCH semantics apply.

The highest release impact among unreleased merged PRs determines the minimum next release increment.

PRs delivering to `master` use squash merge so one merged PR maps to one default-branch commit/audit unit. The squash title should retain the PR number. Stacked integration retains attributable PR provenance and preserves existing campaign ancestry; its final public delivery remains the single squash PR.

## 4. Version ownership

`package.json.version` is the sole repository release-version source.

The version is exactly:

```text
MAJOR.MINOR.PATCH
```

with no leading `v`.

Runtime/build surfaces must derive from that value rather than maintain another hand-edited version constant.

Required externally observable equality:

```text
package.json.version
= order --version
= GET /api/health .version
= release bundle version
= Git tag without leading "v"
= GitHub Release version
```

Git tags use:

```text
vMAJOR.MINOR.PATCH
```

A published version is immutable. An existing version/tag is never rebuilt, moved or overwritten; corrections require a new version.

## 5. Changelog ownership

Root `CHANGELOG.md` is the canonical human release-history owner.

It contains a top `[Unreleased]` section. Every merged work PR adds at least one concise entry under the applicable heading:

- Added
- Changed
- Fixed
- Deprecated
- Removed
- Security
- Internal

Entries describe observable/relevant change, not commit mechanics.

A release PR:

1. requires non-empty `[Unreleased]` content;
2. chooses the next version from §3;
3. moves those entries under `[X.Y.Z] - YYYY-MM-DD`;
4. recreates an empty `[Unreleased]` section;
5. updates comparison links where maintained.

GitHub Release notes are generated from that exact version section, optionally supplemented with contributor/PR links. They must not contradict the committed changelog.

## 6. Release pull request

A release is prepared through a dedicated branch:

```text
release/vX.Y.Z
```

and a PR to `master`.

A release PR contains no new product behavior. It is limited to release metadata/distribution documentation required for that already-merged candidate:

- `package.json` version;
- `CHANGELOG.md` release section/date;
- install/release documentation that must name or point at the new release;
- generated release metadata when owned by the canonical release tooling.

The release PR must prove:

- selected version is greater than the latest published version;
- selected increment is at least the highest unreleased PR impact;
- package/changelog target version agree;
- complete configured verification gates pass on the release candidate;
- no unrelated code change is present.

Merge of the release PR creates the exact release candidate commit. Tags/releases are created **after** that merge and point to that exact `master` commit.

Before any tag exists, a failed or invalid release candidate may be replaced at the same version through a new dedicated `release/vX.Y.Z` PR. That replacement is permitted only when `vX.Y.Z` is absent, the base already declares `X.Y.Z`, non-empty `[Unreleased]` content is re-frozen into the matching release section, and the replacement candidate passes the complete release gates. Once the tag exists, same-version replacement is prohibited.

## 7. Tag and GitHub Release contract

Release automation runs only for a merged release/version change on `master`.

Before creating a tag it must:

1. prove `HEAD` is the intended `master` release-PR merge commit and remains reachable from `master`; a later `master` commit must not invalidate that immutable release candidate or an exact retry;
2. read/validate `package.json.version`;
3. prove `CHANGELOG.md` contains the matching released section;
4. prove tag `vX.Y.Z` does not point at another commit;
5. run the full configured release gates;
6. produce and verify the release bundle and checksum.

Only after those proofs may it create annotated tag `vX.Y.Z`.

The release process then creates a draft GitHub Release for that tag, uploads all required assets, and publishes only when the assets are complete. If immutable GitHub Releases are enabled, the draft-first sequence is mandatory.

A published tag/release is never moved or repurposed.

A failed release after tag creation must be resumed idempotently against the same tag/commit or superseded by a later version; the tag must not be moved to a repair commit.

## 8. Build artifact contract

Every published release provides:

```text
pontivus-order.tar.gz
pontivus-order.tar.gz.sha256
```

The bundle is built from the exact release commit after all gates pass and contains the source/install material required by the supported installer plus the production `dist/` build produced by that exact candidate.

The bundle contains a version/commit manifest sufficient to prove:

- release version;
- exact Git commit.

The checksum file is SHA-256 of the exact uploaded archive bytes.

GitHub's automatically generated source archives are useful provenance, but the supported public installation path uses the Order-owned release bundle because it is the certified built candidate.

## 9. Public installation/update channel

Public installation and update documentation must not instruct normal users to install arbitrary `master`.

The supported channels are:

- latest stable release asset;
- explicit immutable version release asset.

The stable latest URL may use GitHub's `/releases/latest/download/<asset>` facility. Version-pinned instructions use `/releases/download/vX.Y.Z/<asset>`.

Development-from-`master` instructions, if retained at all, are explicitly marked contributor/development-only and unsupported as a release installation channel.

## 10. Permanent CI and release automation

The repository maintains permanent GitHub Actions workflows for:

### Pull request verification

Triggered for PRs targeting `master` and explicitly designated active campaign integration targets. Maintain the allowed target list in the existing permanent verification workflow; do not add a second verification workflow, broaden to arbitrary branch targets, or skip any required gate. Retire an integration target from the list when its supporting integration work is finished and include that change in final exact-candidate verification. The target's current base, PR head and exact tested merge candidate remain explicit evidence; a previous master-targeted run cannot certify a different stacked merge candidate.

It validates at minimum:

- changelog updated;
- release-impact metadata present/valid;
- no forbidden version/tag mutation in ordinary work PRs;
- all required Order verification gates against the exact current PR merge candidate.

A submitted review may provide additional evidence, but review presence or reviewer identity is not a required status gate. A material push invalidates earlier verification evidence because the workflow reruns against the new exact candidate.

### Milestone-driven implementation CI cadence

For repository implementation work, schedule remote PR verification at the relevant implementation/evidence milestones, not at every intermediate commit, correction, or conversational handoff.

- Derive milestones from the governing implementation plan and its mandatory checkpoint, dependency, and acceptance boundaries. For ordinary work without a prescribed sequence, use coherent implementation batches and exact-candidate pre-merge verification. Do not add arbitrary verification stops between those boundaries.
- Complete related authorized implementation and test changes as a batch. Create coherent intermediate commits without advancing the PR branch ref; publish the accumulated fast-forward commit sequence once at the next required milestone. Preserve the exact signed scope and ordinary PR audit trail.
- Perform source review, diff/scope checks and available focused local checks during implementation. Do not substitute source review for a required executable check. A mandatory P7 in-task checkpoint or phase-local evidence/acceptance dependency must still be satisfied before the dependent work begins; when remote execution is necessary, that boundary is a valid CI milestone.
- Do not dispatch or rerun full CI solely to verify every small edit or poll an unfinished run as an implementation activity. Continue independent authorized work while verification runs where the governing dependencies permit. Consolidate related failure analysis and corrections into a single repair batch before rerunning the applicable verification; do not weaken tests or knowingly advance past a failed prerequisite.
- Retain results against the exact candidate and milestone. Any change invalidating required evidence must be reverified at the next applicable boundary; never carry a stale PASS forward as current proof. Final PR verification, explicit human acceptance where required, and release verification remain mandatory against the exact admitted candidate.

This is a publication and execution-cadence rule, not a new product gate or permission to alter signed plans, skip mandatory checks, bypass review, or disable the permanent PR workflow. The target admission rule above governs PR triggers; required status checks remain unchanged.

### Release verification/publication

Triggered only by the merged release-version change on `master` or an equivalent exact retry bound to the same commit/version. An exact retry may be requested through `workflow_dispatch` or, when dispatch is unavailable, by merging an ordinary governed PR that adds exactly one `.github/release-retries/*.txt` request containing the 40-character release commit SHA; that request invokes the same permanent release workflow and does not create a second release path.

It:

- re-runs the complete release gates;
- builds/checksums the release bundle;
- creates/verifies tag;
- creates/uploads/publishes GitHub Release;
- fails closed on version/changelog/tag disagreement.

Workflow dependencies/actions must be immutable-pinned and added to the external-facts/certification owner before productive reliance.



## 10.1 Temporary GitHub Actions scaffolding during PR work

The agent-only temporary GitHub Actions exception owned by `GW-DOC-AGENT-OPERATING-RULES-V1` remains valid under this public-delivery model.

Temporary workflows may be added to the current PR branch when an already-authorized implementation or verification action cannot be performed through the available local/runtime/connectors.

They are distinct from the permanent `.github/workflows/ci.yml` and `.github/workflows/release.yml` owned by this standard:

- temporary workflows may execute only the already-authorized task/verification;
- they must not broaden implementation scope or create a second build/release path;
- they must not contain secrets in workflow source;
- they are removed from the branch tree before the PR is ready to merge;
- their historical branch commits/evidence may remain as PR provenance;
- the final merge candidate must contain only permanent workflows explicitly authorized by canonical architecture/P7.

Using temporary Actions does not permit direct commits to `master`, bypass the required PR/status-check boundary, or publish a release outside the governed release workflow.

## 11. Repository protection

The public repository should maintain active GitHub rulesets for:

### `master`

- require a pull request before merge;
- require the canonical PR verification status for the exact current candidate;
- require conversation resolution where review/discussion exists;
- require branch to be current with the target before merge where practical;
- disallow force pushes;
- disallow deletion;
- preserve linear/squash-merge delivery.

### release tags

Pattern:

```text
v*
```

Published release tags must not be deleted or moved through ordinary contributor workflows.

If repository-administration permissions prevent automation from creating these rules, the missing administrative rule is reported explicitly; the repository operating rules still prohibit bypassing the process.
