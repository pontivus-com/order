<!-- Order template: defect-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Dated external-facts lineage correction plan

## Plan authority and timing

The authority/reference and permanent verification-material corrections are performed pre-signoff because they establish the trustworthy authority graph and verification material that any later Approval would bind. A signed task must not rewrite the authority or verification material that authorizes itself.

Post-signoff execution therefore has no mutation surface and may only prove the approved baseline already contains G-F11-R01/R02/R03.

## Pre-signoff actions

1. retain exact 2026-11-12 external-facts blob under the dated retained semantic path;
2. assign the live external-facts owner its actual 2026-11-16 version ID;
3. update manifest resolution for stable current, exact 2026-11-12 and exact 2026-11-16 identities;
4. rebind current permanent consumers to stable `GW-DOC-EXTERNAL-FACTS`;
5. extend existing architecture fitness for dated retained versions and Verified-date equality;
6. update ordinary delivery metadata;
7. verify no retained historical source was modified.

## Verification

Required gates:
- dependency-lock;
- typecheck;
- architecture;
- test;
- build;
- browser.

The architecture gate must additionally prove:
- one current external-facts owner;
- exact current and historical version resolution;
- no dated-ID/date mismatch;
- no current permanent consumer pinned to retained external-facts version IDs.

## Post-signoff task

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Prove that the approved baseline already contains the complete G-F11 external-facts lineage correction and emit TASK_ALREADY_SATISFIED only with zero repository mutation.",
      "dependsOn": [],
      "scope": [],
      "exclusions": [],
      "acceptanceRefs": [
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2"
      ],
      "changeSurface": [],
      "gateIds": [
        "architecture",
        "browser",
        "build",
        "dependency-lock",
        "test",
        "typecheck"
      ],
      "authorityRefs": [
        "GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1",
        "GW-DOC-EXTERNAL-FACTS",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": [
        "foundation",
        "verification"
      ]
    }
  ]
}
```

## Minimum-change forecast

No production source, runtime contract, dependency or user-facing behavior changes. The correction is limited to documentation identity/reference lineage, its existing permanent sensor, and lifecycle/delivery records.
