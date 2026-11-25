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
| Owner-level remediation only | Design D5/failure behavior + post-audit R1/R2 | T3 pre-sign-off owner correction + T4 implementation |
| Permanent noninterference/applicability proof | Design C + post-audit R4 | T4 implementation / T5 revalidation |
| No Span runtime integration | D2 | T1/T2 negative acceptance |

## Module ownership/decomposition constraints and architecture-feedback checkpoints

- No production module is added or decomposed.
- No canonical domain/runtime state, HTTP contract, persistence schema, dependency or process is added.
- P0/P1, P2, P5, P6 and root-manifest corrections are pre-sign-off authority/configuration work and are **not** executable P7 mutation targets.
- The only downstream production implementation is the existing shell manifest-resolution owner `src/shell/project.ts` plus the existing daemon signed-task validation owner `src/daemon/authority.ts`.
- Existing core authority projection is reused unchanged; tests prove its active-authority-only behavior.
- The WorkItem register is not permanent authority.
- A newly discovered requirement for another production owner remains an architecture/authority feedback checkpoint and is not admitted by this plan.
- A concurrent change to an audited owner creates `REVALIDATION_REQUIRED`, not silent merge-by-reasoning.

## Expected production and test/validation surface

Pre-sign-off authority/configuration surface:

- `docs/governance/systems-governance.md`
- `docs/product/system-brief.md`
- `docs/decisions/technical-decisions.md`
- `docs/contracts/canonical-contracts.md`
- `pontivus-order.toml`
- this WorkItem document/register set;
- `CHANGELOG.md`.

Downstream production implementation surface:

- `src/shell/project.ts`
- `src/daemon/authority.ts`

Validation surface:

- `tests/architecture.test.ts`
- `tests/core.test.ts`
- `tests/shell.test.ts`
- `tests/daemon.test.ts`
- complete configured gates required by the affected shell/daemon/verification concerns.

No UI source/test mutation is authorized on this branch.

## Required deletions/replacements

- Replace ambiguity in the pyramid owner; do not delete or renumber P0-P8.
- Remove lower-layer lifecycle/account-management restatements at their existing owners.
- Remove retained semantic-version and prior-art evidence sources from the root manifest's **active** authority arrays while retaining their exact `[refs]` identities/files.
- Replace the architecture assertion that every ref must be active authority with identity/applicability separation proof.
- Replace no canonical semantic carrier, task schema or authority registry.
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

T3 completion requires FP-F04/FP-F05 owner text to conform to existing P3 authority without product-behavior changes.

T4 completion requires FP-F06/FP-F07 to be corrected at P6/manifest/shell/daemon owners with the R4 positive/negative proof green.

C04-C06 remain open until T5/T6 reconcile PR #83 and exact-candidate verification.

## Minimum-change forecast

The minimum sufficient implementation adds **no new schema or abstraction**. It changes one existing P6 rule, narrows the root active-authority lists, replaces one shell validation rule, adds one daemon task-materiality check, and updates focused proof. No UI/runtime dependency/persistence/transport change is justified.

## Verification contract

Required for the exact candidate:

1. inspect the diff for unauthorized permanent authority duplication or another reference/applicability carrier;
2. prove stable/current and retained versioned `GW-DOC-*` refs still resolve to their exact canonical files;
3. prove retained/reference-only sources are absent from ordinary resolved stage authority/context;
4. prove a missing ref source fails manifest resolution;
5. prove a signed task ref whose exact source is non-material fails R3 task validation;
6. run dependency-lock, typecheck, architecture, test, build and browser gates required by affected concerns;
7. confirm no `.span/**`, dependency/package/lock, UI, HTTP, SQLite or canonical runtime-schema change;
8. revalidate FP-F01/FP-F02/FP-F08-F11 against the exact eventual PR #83/reconciled candidate before C06 closure.

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
      "id": "T4-IMPLEMENTATION",
      "objective": "Implement the already-adopted P6 separation between exact AuthorityRef identity and active authority applicability, and prove non-material refs cannot enter signed execution authority.",
      "dependsOn": [],
      "scope": [
        "src/shell/project.ts",
        "src/daemon/authority.ts",
        "tests/architecture.test.ts",
        "tests/core.test.ts",
        "tests/shell.test.ts",
        "tests/daemon.test.ts"
      ],
      "exclusions": [
        "docs/**",
        "pontivus-order.toml",
        "ui/**",
        ".span/**",
        "package.json",
        "bun.lock"
      ],
      "acceptanceRefs": [
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "changeSurface": [
        "src/shell/project.ts",
        "src/daemon/authority.ts",
        "tests/architecture.test.ts",
        "tests/core.test.ts",
        "tests/shell.test.ts",
        "tests/daemon.test.ts"
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
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2"
      ],
      "concernIds": [
        "daemon",
        "shell",
        "verification"
      ]
    }
  ]
}
```
