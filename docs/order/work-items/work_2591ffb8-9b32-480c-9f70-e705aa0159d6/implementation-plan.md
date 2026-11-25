<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Functional-pyramid conformance implementation plan

## Exact task units/dependencies/objectives

The conformance exercise is intentionally split between **pre-sign-off authority correction/audit** and one narrow downstream fitness task.

### T1 — establish the canonical governance foundation and tracker

**State:** COMPLETE_PENDING_REVALIDATION.

**Objective:** clarify the existing P0/P1 owner without creating a second pyramid or P1 rule, and establish the WorkItem-local current-state register.

Completed authority work:

1. add proposition-level placement/authority/derivation law to `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`;
2. strengthen `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` with semantic-lifecycle closure/noninterference;
3. retain all existing P0-P8 identities and stable `GW-P1-*` ids;
4. keep `conformance-register.md` as state/evidence only;
5. update `CHANGELOG.md [Unreleased]`.

PR #83 independently changes the same permanent owner, so T1 is not CLOSED until the exact stacked/reconciled candidate is verified.

### T2 — execute C02/C03 conformance audit

**State:** COMPLETE_WITH_FINDINGS.

**Depends on:** T1 authority semantics.

The audit covered:

- proposition placement/restatement across material P1-P6 owners;
- material producer→meaning→projection→consumer/presentation/mutation paths;
- negative/noninterference proof at mechanically checkable boundaries.

The audit initially ran against `master` while PR #83 was concurrently correcting authority materiality. Exact-head revalidation establishes FP-F06/FP-F07 as stale-baseline findings already resolved by PR #83 G-F13/C22-F02; no duplicate implementation is authorized here.

### T3 — correct P2/P5 documentation ownership

**State:** COMPLETE_PENDING_REVALIDATION.

**Depends on:** T2.

Pre-sign-off authority corrections:

1. reduce `GW-DOC-SYSTEM-BRIEF-V1` §6 to P2 product intent and references to P3 lifecycle/validation owners;
2. correct D19 so the shell owns active-account identity/navigation while Settings owns full saved-account management;
3. change no product lifecycle, account runtime behavior or canonical data contract.

### T4 — add permanent governance fitness for the new P0/P1 law

**State:** AUTHORIZED_DOWNSTREAM_TASK.

**Depends on:** T1-T3 and the exact PR #83 foundation.

**Objective:** mechanically protect only the checkable ownership propositions introduced by T1 without copying product/architecture semantic field lists into tests.

Exact implementation:

- update `tests/architecture.test.ts` only;
- prove `docs/governance/systems-governance.md` remains the owner of the proposition-placement law and semantic-lifecycle/noninterference clarification;
- prove the existing stable ids `GW-P1-CANONICAL-OWNERSHIP`, `GW-P1-EXPLICIT-FLOW` and `GW-P1-DOC-CANONICALITY` remain present;
- prove no new duplicate `GW-P1-*` rule identity was introduced for semantic lifecycle;
- do **not** encode surface-specific allowed-field lists or duplicate P3/P4/DESIGN authority in this sensor.

### T5 — reconcile the separate 0.6.0 Workbench dependency

**State:** PARTIAL_CURRENT_CANDIDATE_PASS.

This is verification/dependency tracking, not a PR #84 UI mutation.

On PR #83 head `5f56cfa72150e4b7d62ae9d1f402471209404404`:

- FP-F08 account noninterference is corrected and negatively proven;
- FP-F09 source diagnostic language is corrected;
- FP-F10 Settings account language is corrected;
- IA33 terminal-resource FP-F11 is corrected;
- PR Verification run 2780 proves the exact bounded/current candidate.

The remaining shared `STAGE_COMPLETED` outcome-language FP-F11 path is owned by post-signoff IA30 and remains deliberately ROUTED because §17A does not authorize IA30.

### T6 — exact-candidate closure

After #84 is stacked on the exact #83 foundation:

1. run the complete required gate set;
2. revalidate FP-F01/FP-F02 on the merged systems-governance bytes;
3. revalidate FP-F04/FP-F05 documentation ownership;
4. confirm G-F13/C22-F02 authority reachability/materiality remains unchanged and green;
5. revalidate FP-F08-F10 and IA33 FP-F11 against the exact inherited #83 bytes;
6. leave the IA30 FP-F11 dependency explicitly routed rather than falsely closing it;
7. close C06 only if every finding owned by this WorkItem is corrected/proven and every external dependency is explicitly represented.

## Requirement/design traceability

| Requirement | Design | Task/disposition |
|---|---|---|
| Proposition placement/derivation law | Design A / R4 | T1 + T4 |
| Semantic lifecycle closure/noninterference | Design B / R4 | T1 + T4 |
| Single current-state register | Canonical owner boundary | T1/T2/T5/T6 |
| P1-P6 placement audit | C02 | T2 |
| Producer→consumer semantic audit | C03 | T2 |
| P2/P5 restatement correction | R1 | T3 |
| Reachable vs material authority | R2 | REUSE PR #83 G-F13/C22-F02; NO CHANGE |
| Workbench semantic findings | R3 | T5 dependency / IA30 routing |
| Permanent noninterference proof | Design C/R4 | consumer-owned proof + T4 governance sensor |
| No Span runtime integration | D2 | all tasks |

## Module ownership/decomposition constraints

- no production module is added or decomposed by PR #84;
- no canonical runtime state, HTTP contract, persistence schema, dependency or process changes;
- no `pontivus-order.toml`, P6 authority-materiality, shell resolver or daemon context mutation is authorized by this revised plan;
- PR #83's reachable-authority/material-authority implementation is a required preserved dependency, not a replacement target;
- the only downstream implementation surface is `tests/architecture.test.ts`;
- no UI mutation is authorized by PR #84;
- a newly discovered material defect outside this exact surface returns to its owning layer/WorkItem.

## Required deletions/replacements

The stacked PR #84 candidate must remove the stale-baseline remediation that attempted to:

- remove retained semantic-version/reference-fact owners from `authority.p1-p6`;
- let `refs` escape the reachable authority graph;
- add a second task-ref materiality rule in `validateTaskDefinitions`;
- replace G-F13/C22-F02 architecture/core/shell/daemon proof.

Those changes are superseded by exact-current #83 evidence and must not survive the stacked tree.

No Span declaration/configuration/runtime file is introduced.

## Verification contract

Exact stacked-candidate verification requires:

1. PR release metadata;
2. dependency-lock;
3. typecheck;
4. architecture;
5. full test;
6. build;
7. release packager;
8. browser;
9. any campaign-specific diagnostic/bounded/rendered evidence gates inherited from #83;
10. exact diff review showing no stale FP-F06/FP-F07 runtime/manifest/P6 mutation;
11. architecture proof that the new P0/P1 rule stays at the canonical systems-governance owner;
12. current-v2/historical-v1 authority-materiality tests from #83 remain unchanged and green;
13. no `.span/**`, dependency/package/lock, runtime schema or UI change from PR #84.

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T4-GOVERNANCE-FITNESS",
      "objective": "Add narrow architecture fitness proving the new proposition-placement and semantic-lifecycle laws remain at the existing systems-governance/P1 owner without creating a duplicate rule or shadow product specification.",
      "dependsOn": [],
      "scope": [
        "tests/architecture.test.ts"
      ],
      "exclusions": [
        "docs/**",
        "pontivus-order.toml",
        "src/**",
        "ui/**",
        ".span/**",
        "package.json",
        "bun.lock"
      ],
      "acceptanceRefs": [
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-EXPLICIT-FLOW",
        "GW-P1-DOC-CANONICALITY"
      ],
      "changeSurface": [
        "tests/architecture.test.ts"
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
        "verification"
      ]
    }
  ]
}
```
