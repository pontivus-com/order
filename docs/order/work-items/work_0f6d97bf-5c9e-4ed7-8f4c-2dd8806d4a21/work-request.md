---
{
  "formatVersion": 1,
  "id": "work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21",
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
# Design Order 0.6.0 through exhaustive concern closure

<!-- Order template: change-intake-v2; authority: GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM, GW-DOC-WORK-LIFECYCLE -->

## Requested change

Establish the complete, implementation-ready Order 0.6.0 product/design package by reviewing the product concern-by-concern from a closed factual baseline and progressing only through the governed lifecycle:

```text
R1 prerequisite investigation
  -> R2 functional requirements / functional design
  -> DESIGN technical solution design
  -> PLAN final implementation plan
  -> R3 adversarial readiness review
```

The work must be controlled by one campaign plan that proves complete concern coverage, marks the explicit start and end of each investigation, records findings and cross-concern dependencies, and tracks every concern through functional design, technical design and final plan coverage.

## Canonical 0.6.0 campaign work point

This WorkItem is the sole active coordination/work point for the Order 0.6.0 design campaign. All campaign status, concern coverage, design-stage progress and readiness disposition must resolve back to `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21` and its lifecycle artifacts.

This does not make the WorkItem a permanent semantic authority. P1-P6 meaning remains with the canonical concern owners; this WorkItem owns only the governed change package and its campaign progression. Parallel 0.6.0 plans or design streams must not become competing status/decision owners.

## Why this change is required

The 0.6.0 redesign must not repeat the failure mode where a large integrated design is treated as complete while individual product concerns, state interactions, authority dependencies or downstream implementation consequences remain unexamined.

Phase 0 establishes the corrected documentation/authority/conformance foundation. 0.6.0 must now validate that foundation through actual design use while producing the next product baseline.

The campaign therefore requires:

- a complete concern inventory derived from current canonical P2/P3 authority before substantive redesign begins;
- explicit concern START and END records so no investigation is silently skipped or left half-resolved;
- evidence-first R1 investigation before future-state decisions;
- exact finding ownership and cross-concern dependency tracking;
- functional-design closure before technical-design decisions;
- technical-design closure before executable planning;
- complete P1 -> P2 -> P3 -> P4/P5/P6 -> P7 traceability;
- one final horizontal integration audit after individual concerns close;
- no implementation work until the complete design/plan package passes R3 and explicit sign-off.

## Phase 0 prerequisite

The campaign depends on the factual/governance baseline produced by the Phase 0 authority/conformance remediation in PR #69.

G0 establishes one exact Phase 0 candidate commit as the factual baseline for this campaign. PR merge state is delivery provenance, not a prerequisite to fact gathering. If the Phase 0 candidate changes materially, G0 and every affected downstream concern are revalidated against the new exact candidate before relying on prior conclusions.

## In scope

The entire user-visible and workflow-relevant Order product surface needed to establish the 0.6.0 design, including lifecycle semantics, WorkItem/source behavior, queue/create/workspace interaction, every pre-signoff stage, approval, execution, completion, governed materials, OpenCode interaction, Settings/readiness, recovery/current-attention behavior, responsive/accessibility mechanics, visual/component/theme consistency and end-to-end certification obligations.

Current implementation, 0.5.0 references, tests and runtime evidence are evidence of present state. They do not override canonical product/design authority.

## Explicit exclusions

This WorkItem does not itself authorize implementation while R1/R2/DESIGN/PLAN are incomplete.

The campaign-control document does not become a second product specification, architecture, contract or P7 task owner. Normative outcomes are written only to the canonical lifecycle artifacts and permanent concern owners at the appropriate stage.

Unrelated defects or features discovered during the campaign are recorded and routed to their own governed WorkItem rather than silently expanding 0.6.0 scope.

## Completion condition

This WorkItem is ready for implementation sign-off only when:

1. the complete concern register has been proven against current canonical authority;
2. every concern investigation has a closed factual verdict;
3. every material finding has a disposition;
4. functional design is complete across all concerns and passes a horizontal integration audit;
5. technical solution design completely realizes the functional design without unresolved material choices;
6. the final implementation plan covers every required design obligation with no orphan task or uncovered requirement;
7. R3 adversarially returns `READY_FOR_SIGNOFF`;
8. the exact package is explicitly approved.

The detailed execution and coverage rules are owned by `0.6.0-design-campaign-plan.md` in this WorkItem directory.
