---
{
  "formatVersion": 1,
  "id": "work_2591ffb8-9b32-480c-9f70-e705aa0159d6",
  "projectId": "order",
  "concernIds": [
    "core",
    "daemon",
    "foundation",
    "shell",
    "ui",
    "verification"
  ],
  "schemaId": "change-v2"
}
---
# Formalize and prove Order functional-pyramid conformance

<!-- Order template: change-intake-v2; authority: GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2, GW-DOC-WORK-LIFECYCLE-V1 -->

## Requested outcome

Formally establish the governance principles needed for Order's existing P0-P8 authority pyramid to satisfy a rigorous functional-pyramid discipline, then audit and prove the repository's conformance without replacing Order's authority model or introducing Span runtime integration.

The work must:

- preserve Order's existing P0-P8 pyramid and canonical concern ownership;
- make statement placement, higher-to-lower authority, downward derivation, no-restatement, and upstream traceability explicit at the canonical pyramid owner;
- close the system-wide rule that a semantic fact has one canonical meaning and only expressly authorized producers, transformations, decision uses, consumers, mutation paths and presentation locations;
- prove that technical availability of a canonical field or carrier does not itself authorize another semantic use;
- maintain one canonical conformance register for this exercise;
- audit P1-P8 documentation, architecture and implementation against those principles;
- route every discovered defect to its actual canonical owner rather than applying downstream compensating fixes; and
- add proportionate permanent conformance proof where a mechanically checkable proposition exists.

## Current context

Order already has a mature authority pyramid in `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`, canonical concern ownership through `GW-P1-DOC-CANONICALITY`, stage-context resolution through `GW-DOC-LIFECYCLE-CONTEXT-V2`, one canonical typed-contract posture through `GW-DOC-CANONICAL-CONTRACTS-V2`, and architecture fitness through the existing verification system.

A comparison with the current Span requirements-pyramid design showed that Order is structurally aligned but does not state two parts with sufficient system-wide precision:

1. the proposition-level placement/derivation law: each normative statement belongs to one owning layer, higher authority constrains lower derivation, and a lower layer does not become higher authority by working or by restating it; and
2. semantic-lifecycle closure/noninterference: canonical data availability is not semantic authorization, and every material use of meaning must have an authorized place in the fact's producer-to-consumer lifecycle.

The concrete Workbench account-readiness defect discussed during the 0.6.0 campaign is evidence of the second weakness: a canonical state carrier can legitimately contain several facts while a lower presentation adapter can still consume a field whose meaning belongs to another surface unless the semantic boundary is explicitly designed and proven.

PR #83 currently changes `docs/governance/systems-governance.md` for the separate 0.6.0 campaign. This WorkItem is intentionally separate from that campaign. Its branch begins at current `master`; any overlapping canonical file must be revalidated against the eventual merged state rather than treating another branch as authority.

## Constraints/non-goals

- Do not install, configure, activate or otherwise integrate Span MCP or Span Functional Pyramid runtime machinery.
- Do not add `.span/functional-pyramid.json`, Span participation state, Span authority bindings, or Span-specific runtime dependencies.
- Do not replace or renumber Order's P0-P8 pyramid with Span's P0/P1/P2S/P2W/P3/P4 vocabulary.
- Span material is comparative design evidence only. Order adopts principles at Order-owned canonical concerns; Span prose must not become a second authority source.
- Preserve `GW-P1-DOC-CANONICALITY`: the WorkItem and conformance register own change-specific intent, findings and status only; permanent normative meaning remains at the existing canonical owner.
- Prefer strengthening `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW` when they already own the semantic concern; do not create a new P1 rule identity merely to restate them.
- Do not turn an audit discovery into unplanned production mutation. A newly discovered implementation defect is recorded and routed to its owning layer; material remediation requires the appropriate governed task/WorkItem before mutation.
- Do not use current implementation, current tests, the open 0.6.0 PR, or prior release behavior as desired-product authority.
- Do not weaken existing fitness, validation or typing checks to obtain conformance.

## Evidence/references

Order authority:

- `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`
- `GW-P1-CANONICAL-OWNERSHIP`
- `GW-P1-EXPLICIT-FLOW`
- `GW-P1-DOC-CANONICALITY`
- `GW-DOC-LIFECYCLE-CONTEXT-V2`
- `GW-DOC-SPECIFICATION-STANDARD-V2`
- `GW-DOC-VALIDATION-STANDARD-V1`
- `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`
- `GW-DOC-TECHNICAL-ARCHITECTURE-V2`
- `GW-DOC-CANONICAL-CONTRACTS-V2`
- `GW-DOC-TECHNICAL-DECISIONS-V1` D7

Comparative evidence only:

- `pontivus-com/span` `docs/requirements-pyramid.md` — layer placement, authority/derivation direction and no-restatement discipline;
- `pontivus-com/span` `docs/foundations.md` F11-F12 — explicit applicability and canonical-owner references without copied authority;
- `pontivus-com/span` `docs/functional-design.md` FD-61-FD-74 — deterministic governance resolution and canonical owner separation;
- Span 1.0.0b4 changelog — explicit contract-sublayer derivation correction, used only as evidence that layer validity and presentation order are distinct concerns.
