---
{
  "formatVersion": 1,
  "id": "work_3a125974-0fba-431b-a7f2-365d3e38b0dd",
  "projectId": "order",
  "concernIds": [
    "core",
    "daemon",
    "foundation",
    "verification"
  ],
  "schemaId": "defect-v2"
}
---
# Prevent lifecycle documentation authority drift before 0.6.0

## Observed behavior

Release 0.5.0 was declared complete even though its change-local Requirements became a parallel functional specification, canonical P3 obligations were omitted or weakened downstream, stage conformance could promote with no lifecycle output artifact, and the release PR had no independent review.

## Expected behavior

All live permanent authority consumers—including AGENTS.md, governance, lifecycle, Workbench and integration documentation—must reference each advanced concern through its stable canonical identifier when they mean the current owner. Exact V1/V2 identifiers remain only where a specific semantic snapshot is intentionally required; immutable V1 sources remain available for historical/pinned use.

Order must make its documented authority hierarchy executable: lifecycle authoring must preserve one canonical owner per concern, stage promotion must require one current deterministic lifecycle artifact conforming to the pinned schema, R3 must independently challenge authority topology and traceability, and public delivery must require independent review.

## Reproduction/evidence

The released 0.5.0 WorkItem introduced a parallel WF-FR requirement family; src/core/governance.ts had no implementation of the architecture-prescribed conformance evaluator; persistStageCompletionBatch accepted an empty artifactRefIds array; the daemon test fixture emitted that empty array as a successful R1 completion; the completed 0.5.0 WorkItem has no readiness-review.md; PR #66 has no submitted review.

## Behavior that must remain unchanged

Preserve the P0-P8 authority pyramid, FCIS/SoC/DRY/strict typing, existing lifecycle stages, existing Run/RunEvent/ArtifactRef ownership, explicit proposal/adoption flow, exact-package sign-off, v1 schema historical interpretation, investigation/audit no-code terminal behavior and post-signoff V0-V7 validation.

## Impact/context

This is a Phase 0 release-blocking governance defect. 0.6.0 functional-design reconstruction must not proceed until this failure class is mechanically and semantically closed.
