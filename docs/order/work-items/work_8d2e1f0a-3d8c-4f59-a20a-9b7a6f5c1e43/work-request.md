---
{
  "formatVersion": 1,
  "id": "work_8d2e1f0a-3d8c-4f59-a20a-9b7a6f5c1e43",
  "projectId": "order",
  "concernIds": [
    "foundation",
    "verification"
  ],
  "schemaId": "defect-v2"
}
---
# Restore dated external-facts snapshot lineage

## Observed behavior

The canonical factual owner `GW-DOC-EXTERNAL-FACTS` currently declares versioned identity `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` while the same live file declares `Verified: 2026-11-16` and contains factual refreshes from 2026-11-13 through 2026-11-16.

Root `pontivus-order.toml` maps both the stable owner ID and the dated 2026-11-12 version ID to the same mutable live file. Git history proves the failure mechanism: commit `cfc738beda9281928c22d6255992a56cc6608d21` briefly registered a 2026-11-13 snapshot, `98d2e6539c52d1149df6d3ac8846ea46d585e77e` changed the live header back to the 2026-11-12 ID while retaining later verification facts, and `9f90014cf27e481cd7f7daacb35e79a699858804` removed the later alias.

Current permanent consumers also cite the dated 2026-11-12 ID as if it were the live owner. The repository's own documentation-fitness rule states the intended opposite: current permanent documents depend on the stable concern ID; exact version IDs are for exact semantic snapshots and retained historical evidence.

## Expected behavior

- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` resolves to the exact immutable factual source that existed immediately before the 2026-11-13 refresh.
- the live `GW-DOC-EXTERNAL-FACTS` owner retains all current facts and declares a dated version identity matching its actual `Verified` date;
- current permanent consumers cite stable `GW-DOC-EXTERNAL-FACTS`, not a historical dated snapshot;
- retained historical consumers may continue to carry their exact dated identity;
- permanent documentation fitness understands retained dated snapshots and rejects a dated version ID whose declared verification date does not match its identity.

## Reproduction/evidence

The exact 2026-11-12 source is recoverable as `docs/14-external-version-facts.md` at commit `f5be1ee9e4f2a003d030a0f019b90acaf41e6a33`, blob `da866ffe75c54e16d9a98b64db880fd64a7b07d6`. Comparing that commit with `60e250ea1b41b92457df6ec427a421573e4f0c95` proves the latter is the first 2026-11-13 external-facts refresh.

## Behavior that must remain unchanged

No dependency pin, upstream fact, product requirement, architecture decision, P6 runtime contract, implementation behavior or historical source byte is changed by this remediation. Existing provenance content remains legitimate in its owning domain.

## Impact/context

This is campaign finding G-F11, a Phase-0 broken-reference-lineage defect under the campaign's foundational defect rule. G0 is reopened before remediation. Downstream R1/R2/DESIGN conclusions are freshness-revalidated after the corrected authority graph is integrated; they are not wholesale reconstructed unless the corrected factual source changes a governed conclusion.
