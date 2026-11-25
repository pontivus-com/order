<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Functional-pyramid conformance implementation plan

## Exact task units/dependencies/objectives

T1/T2 established the governance foundation and completed the evidence-producing audit. This amendment authorizes only the now-known owner-level remediation T3/T4 plus exact revalidation/closure obligations. Unknown additional production remediation remains unauthorized.

### T1 — establish the canonical governance foundation and tracker

**Objective:** clarify the existing P0/P1 owner without creating a second pyramid or P1 rule, and establish the WorkItem-local current-state register.

**Depends on:** none.

**Exact work:**

1. add proposition placement/authority/derivation law to `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
2. strengthen `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` with semantic-lifecycle closure/noninterference;
3. retain all existing P0-P8 identities and existing stable `GW-P1-*` ids;
4. keep `conformance-register.md` as state/evidence only;
5. update `CHANGELOG.md [Unreleased]`;
6. perform documentation/architecture fitness relevant to the changed governance owner.

### T2 — execute C02/C03 conformance audit and record exact findings

**Objective:** produce the complete evidence-backed defect set before any unknown remediation surface is authorized.

**Depends on:** T1.

**Exact work:**

1. audit the C02 canonical corpus inventory;
2. audit all priority C03 semantic-lifecycle domains;
3. record findings only in `conformance-register.md` using the closed finding shapes;
4. classify each finding to its exact owner/layer and required proof;
5. mark any finding requiring material mutation outside T1 as `ROUTED`/open for a plan amendment or separate governed remediation;
6. do not modify production source merely because the audit exposes a defect;
7. revalidate any evidence affected by concurrent/merged authority changes, including PR #83 overlap.

A later plan amendment may add exact owner-level remediation and permanent sensors only after T2 closes the finding set and their precise change surfaces are known.

## Requirement/design traceability

| Requirement | Design | Task |
|---|---|---|
| Proposition placement/derivation law | Design A | T1 |
| Semantic lifecycle closure/noninterference | Design B | T1 |
| Single current-state register | Canonical owner/affected boundaries | T1/T2 |
| P1-P6 corpus audit | Design D / C02 | T2 |
| Producer→consumer semantic audit | Design B/D / C03 | T2 |
| Owner-level remediation only | Design D5/failure behavior | T2 disposition; later exact plan |
| Permanent noninterference proof | Design C | Classified by T2; later exact plan |
| No Span runtime integration | D2 | T1/T2 negative acceptance |

## Module ownership/decomposition constraints and architecture-feedback checkpoints

- No production module is added or decomposed in this tranche.
- No canonical data contract or runtime state is added.
- The permanent governance delta is owned solely by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`.
- The WorkItem register is not a permanent authority.
- T2 is evidence-producing. A discovered need for P3/P4/P5/P6 or production mutation is an architecture/authority feedback checkpoint and stops mutation until an exact amendment/remediation is governed.
- A concurrent change to an audited owner creates `REVALIDATION_REQUIRED`, not silent merge-by-reasoning.

## Expected production and test/validation surface

Production runtime surface: **none** in this tranche.

Governance/documentation surface:

- `docs/governance/systems-governance.md`
- `docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/**`
- `CHANGELOG.md`

Validation surface:

- existing `architecture` gate for canonical documentation/ownership fitness;
- additional read-only source inspection during T2;
- no test-file mutation is authorized until T2 identifies an exact mechanically checkable finding and a later plan authorizes its owner.

## Required deletions/replacements

- Replace ambiguity in the pyramid owner; do not delete or renumber P0-P8.
- Replace no permanent document other than the exact wording necessary at the existing owner.
- Delete no test, rule, requirement, contract or authority.
- Introduce no Span declaration/configuration/runtime file.

## Completion evidence

T1 completion requires:

- exact diff shows only the bounded governance/WorkItem/changelog surface;
- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` contains the new Order-owned placement/derivation law;
- existing P1 IDs remain unchanged and semantic-lifecycle closure is owned by canonical ownership + explicit flow;
- no new `DefaultRuleId`, manifest contract, runtime dependency or `.span/**` surface exists;
- architecture/documentation fitness passes.

T2 completion requires:

- every C02 corpus inventory row marked audited;
- every priority C03 domain marked audited;
- every finding has exact evidence, layer/owner and disposition;
- no unknown material remediation has been performed;
- branch-overlap evidence has been revalidated where necessary.

This tranche does **not** imply C04-C06 completion. Those require exact follow-on remediation/proof after T2.

## Minimum-change forecast

Expected change is documentation-only: one permanent governance owner, this WorkItem package/register, and changelog. No P6 schema, manifest grammar, source module, UI, runtime, dependency or persistence change is justified by the current design.

If T2 proves that permanent automated proof must be added, that is a planned next tranche after its exact proposition and test owner are known.

## Verification contract

Required for this tranche:

1. inspect the exact diff for unauthorized permanent authority duplication;
2. prove all existing stable pyramid/P1 identifiers remain resolvable;
3. run the existing architecture gate;
4. run documentation/manifest fitness covered by that gate;
5. confirm no `.span/**`, dependency, package/lock or production source change;
6. for T2, independently review each recorded finding against its cited source and canonical authority;
7. after any reconciliation with PR #83, repeat affected governance/documentation fitness and finding evidence before closure.

## Post-audit exact remediation tasks

### T3 — correct P2/P5 documentation ownership

**Objective:** close FP-F04/FP-F05 at the documents that currently contain the lower-layer restatement/contradiction.

**Depends on:** T2.

**Exact work:**

1. reduce `GW-DOC-SYSTEM-BRIEF-V1` §6 to P2 product intent and references to the P3 lifecycle/validation owners;
2. correct D19 so the shell owns active-account identity/navigation while Settings owns full saved-account management under the existing P3 requirements;
3. do not change product lifecycle, account behavior, contracts or runtime implementation.

### T4 — separate exact reference identity from active authority applicability

**Objective:** close FP-F06/FP-F07 without introducing a second registry or a new authority carrier.

**Depends on:** T2.

**Exact work:**

1. amend `GW-DOC-CANONICAL-CONTRACTS-V2 §14` so `refs` grants exact identity resolution only and is not required to be active authority;
2. preserve validation that every ref points at an exact readable regular repository file;
3. require signed task `acceptanceRefs`/`authorityRefs` to resolve to sources already present in the current R3 material set;
4. remove retained semantic-version owners and OpenSpec/Spec Kit/Kiro/BMAD prior-art evidence documents from root `authority.p1-p6` while retaining their exact `[refs]` mappings;
5. preserve `ResolvedProjectAuthority.authorityRefs` as active-authority-only;
6. update architecture/core/shell/daemon proof to establish the identity/applicability separation and reject non-material task refs.

No HTTP, SQLite, WorkItem, ArtifactRef, SignedTaskBlock, dependency, process or UI schema changes are authorized.

### T5 — reconcile separate 0.6.0 Workbench findings

**Objective:** avoid a competing UI implementation.

**Depends on:** T3/T4 and the exact current PR #83 candidate.

This task is a verification/dependency obligation, not a production mutation on this branch:

- revalidate FP-F09, FP-F10 and the terminal-resource portion of FP-F11 against the exact eventual PR #83 candidate;
- require FP-F08 and the remaining shared-event FP-F11 path to be corrected by the 0.6.0 owner before this WorkItem can claim C06 closure;
- revalidate FP-F01/FP-F02 against the reconciled `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
- record exact results in the conformance register.

### T6 — final conformance verification

Run the full configured verification required by the changed concerns, inspect the exact diff for shadow specifications/unauthorized scope, and close only findings supported by exact-candidate evidence.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Establish Order's functional-pyramid governance foundation at the existing canonical owner and create the WorkItem-local conformance state register without introducing Span runtime integration or a duplicate P1 rule.",
      "dependsOn": [],
      "scope": [
        "CHANGELOG.md",
        "docs/governance/systems-governance.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/**"
      ],
      "exclusions": [".span/**", "package.json", "bun.lock", "src/**", "ui/**", "tests/**"],
      "acceptanceRefs": [
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-EXPLICIT-FLOW",
        "GW-P1-DOC-CANONICALITY",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE"
      ],
      "changeSurface": [
        "CHANGELOG.md",
        "docs/governance/systems-governance.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/conformance-register.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/implementation-plan.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/requirements.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/research.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/solution-design.md",
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/work-request.md"
      ],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-DOC-TECHNICAL-DECISIONS-V1"
      ],
      "concernIds": ["foundation", "verification"]
    },
    {
      "id": "T2",
      "objective": "Audit the current canonical P1-P6 corpus and material semantic producer-to-consumer paths, recording complete evidence-backed findings and owner dispositions without performing unknown production remediation.",
      "dependsOn": ["T1"],
      "scope": ["docs/**", "pontivus-order.toml", "src/**", "ui/**", "tests/**"],
      "exclusions": [".span/**"],
      "acceptanceRefs": [
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-EXPLICIT-FLOW",
        "GW-P1-DOC-CANONICALITY",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE"
      ],
      "changeSurface": [
        "docs/order/work-items/work_2591ffb8-9b32-480c-9f70-e705aa0159d6/conformance-register.md"
      ],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": ["core", "daemon", "foundation", "shell", "ui", "verification"]
    },
    {
      "id": "T3",
      "objective": "Correct the P2 System Brief lifecycle restatement and P5 D19 account-management contradiction without changing the underlying product behavior.",
      "dependsOn": ["T2"],
      "scope": [
        "docs/product/system-brief.md",
        "docs/decisions/technical-decisions.md"
      ],
      "exclusions": ["src/**", "ui/**", "tests/**", ".span/**"],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-INSTALLATION-READINESS-V1"
      ],
      "changeSurface": [
        "docs/product/system-brief.md",
        "docs/decisions/technical-decisions.md"
      ],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build"],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-SYSTEM-BRIEF-V1",
        "GW-DOC-TECHNICAL-DECISIONS-V1"
      ],
      "concernIds": ["foundation"]
    },
    {
      "id": "T4",
      "objective": "Separate exact AuthorityRef identity from automatic stage applicability, remove historical/prior-art evidence from Order's default active authority sets, and prove task refs cannot self-promote non-material sources.",
      "dependsOn": ["T2"],
      "scope": [
        "docs/contracts/canonical-contracts.md",
        "pontivus-order.toml",
        "src/shell/project.ts",
        "src/daemon/authority.ts",
        "tests/architecture.test.ts",
        "tests/core.test.ts",
        "tests/shell.test.ts",
        "tests/daemon.test.ts"
      ],
      "exclusions": ["ui/**", ".span/**", "package.json", "bun.lock"],
      "acceptanceRefs": [
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "changeSurface": [
        "docs/contracts/canonical-contracts.md",
        "pontivus-order.toml",
        "src/shell/project.ts",
        "src/daemon/authority.ts",
        "tests/architecture.test.ts",
        "tests/core.test.ts",
        "tests/shell.test.ts",
        "tests/daemon.test.ts"
      ],
      "gateIds": ["dependency-lock", "typecheck", "architecture", "test", "build", "browser"],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2"
      ],
      "concernIds": ["daemon", "foundation", "shell", "verification"]
    }
  ]
}
```
