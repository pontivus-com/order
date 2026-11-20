<!-- Order template: defect-r1-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2 -->

# External-facts lineage defect research

## Current state/absence

CONFIRMED.

The live factual owner conflates stable-current identity with an exact dated snapshot. This is not a disagreement about the factual content itself.

## Exact evidence

- current live file: `docs/references/external-facts.md`;
- live header: `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` with `Verified: 2026-11-16`;
- manifest: stable and 2026-11-12 IDs both resolve to the live file;
- exact pre-refresh source: commit `f5be1ee9e4f2a003d030a0f019b90acaf41e6a33`, blob `da866ffe75c54e16d9a98b64db880fd64a7b07d6`;
- first later refresh: commit `60e250ea1b41b92457df6ec427a421573e4f0c95`;
- history mechanism: `cfc738b` registered a later snapshot, `98d2e65` reset the live version ID to 2026-11-12, and `9f90014` removed the later alias.

## Governing authority

- `GW-P1-DOC-CANONICALITY`: dated factual snapshots may use dated version IDs and exact historical bytes must remain independently resolvable when retained as authority.
- `GW-DOC-EXTERNAL-FACTS`: owns external facts and their provenance.
- the existing permanent documentation-fitness rule: current permanent documents use stable concern IDs; exact version IDs are reserved for exact snapshots/historical evidence.

## Current permanent consumers requiring rebinding

The complete permanent-fitness audit found live dated-ID references in:
- root `AGENTS.md`;
- `docs/README.md`;
- `docs/architecture/opencode-integration.md`;
- `docs/architecture/technical-architecture.md`;
- `docs/architecture/workbench-theme.md`;
- `docs/architecture/workbench.md`;
- `docs/contracts/canonical-contracts.md`;
- `docs/decisions/technical-decisions.md`.

The first exact-head PR Verification #1426 / run `44479533124` proved the new fitness rule was active and failed architecture specifically on the three initially missed current consumers in `workbench-theme.md` and `workbench.md`. Those references are part of the same G-F11 correction; the invariant was not weakened.

Retained `.v1.md` historical sources are intentionally not rewritten.

## Root cause

The repository treated a dated factual identifier as if it were the stable canonical identifier during refresh. The permanent fitness sensor could detect retained semantic versions named `.vN.md` but had no representation for retained dated snapshots such as `V1-YYYY-MM-DD`; consequently the invalid alias remained mechanically legal.

## Unresolved facts

NONE.

The original 2026-11-12 bytes, current owner, affected live consumers and missing mechanical invariant are all identified.
