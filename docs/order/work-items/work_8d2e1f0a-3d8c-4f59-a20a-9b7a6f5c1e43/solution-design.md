<!-- Order template: defect-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Dated external-facts lineage correction design

## Design basis

The correction preserves the existing documentation provenance architecture. It does not relocate legitimate domain provenance or strip release/design history from canonical owners.

## Requirement-to-solution map

| Requirement | Technical realization |
|---|---|
| G-F11-R01 | materialize the exact historical blob at semantic retained path `docs/references/external-facts.v1-2026-11-12.md`; map the 2026-11-12 ID to it; make the live owner declare `GW-DOC-EXTERNAL-FACTS-V1-2026-11-16` and map that version to the live file |
| G-F11-R02 | replace the historical dated ID with stable `GW-DOC-EXTERNAL-FACTS` only in current permanent consumers; do not edit retained `.v1.md` sources |
| G-F11-R03 | extend the existing canonical-documentation assertion in `tests/architecture.test.ts`; no new checker or registry |

## Exact pre-signoff correction surface

- `docs/references/external-facts.v1-2026-11-12.md` — exact historical bytes;
- `docs/references/external-facts.md` — identity metadata only;
- `pontivus-order.toml` — stable/current and exact historical version resolution;
- `AGENTS.md`;
- `docs/README.md`;
- `docs/architecture/opencode-integration.md`;
- `docs/architecture/technical-architecture.md`;
- `docs/contracts/canonical-contracts.md`;
- `docs/decisions/technical-decisions.md`;
- `tests/architecture.test.ts`;
- `CHANGELOG.md`;
- active campaign and this WorkItem documentation.

## Sensor design

Use one retained-version parser for:
- `.vN.md`;
- `.vN-YYYY-MM-DD.md`.

For retained paths, derive the expected version suffix directly from filename components and compare it with the declared version ID.

For every document whose version ID ends in `-Vn-YYYY-MM-DD`, parse `**Verified:** YYYY-MM-DD` and require exact equality.

When validating a Markdown navigation link to a concern, accept any declared ID for the same concern in retained historical source text. The existing separate current-consumer rule remains responsible for rejecting exact-version references in current permanent documents once a retained version exists.

## Rejected alternatives

- Mutating the 2026-11-12 bytes to fit the current file layout: rejected; historical bytes must remain exact.
- Deleting provenance sections from P4/P6: rejected; they are legitimate owner provenance and unrelated to the defect.
- Mapping both dated IDs to the live file: rejected; it repeats the defect.
- Adding a second documentation checker: rejected; existing permanent fitness is the owner.

## Failure behavior

Any identity/date/path mismatch fails architecture fitness. If the exact historical bytes cannot be recovered, the correction must stop rather than fabricate a snapshot.
