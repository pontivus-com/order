<!-- Order template: defect-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

# External-facts lineage correction requirements

## Functional authority disposition ledger

This remediation creates no product behavior. The requirements below are LOCAL foundation/documentation-conformance consequences of existing P1 authority.

| Requirement | Disposition | Canonical P3 owner |
|---|---|---|
| G-F11-R01 exact dated-snapshot identity | LOCAL | — |
| G-F11-R02 stable-current consumer binding | LOCAL | — |
| G-F11-R03 dated-snapshot fitness | LOCAL | — |

## Required outcome

### G-F11-R01

The exact 2026-11-12 external-facts bytes are retained immutably and the manifest version ID `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12` resolves to that retained source.

The live external-facts owner keeps stable ID `GW-DOC-EXTERNAL-FACTS` and declares a versioned ID matching its actual verified snapshot date.

### G-F11-R02

Every current permanent documentation consumer of the external-facts concern references stable `GW-DOC-EXTERNAL-FACTS`. Retained historical sources are not rewritten merely to modernize their references.

### G-F11-R03

Permanent documentation fitness must:
- recognize both retained semantic versions (`.vN.md`) and retained dated versions (`.vN-YYYY-MM-DD.md`);
- require a retained filename's semantic/date suffix to match the declared versioned concern ID;
- require any dated versioned concern ID to match the document's declared `Verified` date;
- continue requiring stable manifest refs to select exactly one current owner and versioned refs to select their exact sources;
- continue rejecting current permanent consumers that cite exact version IDs once retained versions exist;
- permit immutable historical documents to carry their historical version ID even when an accompanying navigation link still points at the current concern path.

## Scope/exclusions

In scope:
- external-facts identity/manifest lineage;
- stable-current references in current permanent documentation;
- the existing documentation ownership fitness test;
- campaign/WorkItem provenance for G-F11.

Out of scope:
- changing any external dependency fact or pin;
- product, runtime, UI, persistence, transport or provider behavior;
- rewriting retained historical P4/P6 sources;
- broad documentation cleanup;
- changing the authority/provenance model.

## Acceptance

The exact historical blob is retained byte-for-byte, current factual content is unchanged except identity metadata, all current permanent consumers resolve through the stable owner, and architecture fitness fails on synthetic dated-ID/date or retained-path mismatches.
