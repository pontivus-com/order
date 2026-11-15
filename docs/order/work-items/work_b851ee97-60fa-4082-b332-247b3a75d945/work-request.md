---
{
  "formatVersion": 1,
  "id": "work_b851ee97-60fa-4082-b332-247b3a75d945",
  "projectId": "order",
  "concernIds": [
    "core",
    "daemon",
    "foundation",
    "ui",
    "verification"
  ],
  "schemaId": "change-v1"
}
---
# Implement closed Workbench workflow state and UI architecture

<!-- Order template: change-intake-v1; authority: GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1, GW-DOC-WORK-LIFECYCLE-V1 -->

## Requested outcome

Implement the current closed Workbench functional and technical design as one coherent runtime transition: the canonical workflow-state/transition policy, daemon command/read boundaries, selected-WorkItem browser observation, complete Workbench primitive/component language, Astryx-conformant theme/styling, and every production renderer must conform to the signed P3/P4/P6 authority without feature-local reinterpretation.

## Current context

PR #59 closes the Workbench design authority in `GW-DOC-WORKBENCH-UX-V2`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, the global technical architecture and canonical contracts. The current implementation still contains the superseded workflow-policy, query-ownership, layout, component and CSS mechanisms identified by those owners. This WorkItem is the governed implementation vehicle for replacing that implementation evidence with the closed design.

## Constraints/non-goals

- Preserve FCIS, SoC, semantic DRY, strict typing, canonical ownership and minimum sufficient change.
- Do not introduce DTO/view-model families, persisted/browser workflow state, a generic state-machine framework, OOP/service/repository/controller architecture, another browser state store, or another canonical workflow owner.
- Do not add or upgrade runtime/build dependencies; use the exact pinned Astryx and toolchain contracts.
- Do not change P3/P4/P6 authority during implementation. A material design gap returns to DESIGN rather than being decided in P7/P8.
- Do not preserve superseded side-index, queue/inspector, feature-local component/theme, raw palette, duplicate breakpoint or content-count topology behavior as compatibility paths.

## Evidence/references

- `GW-DOC-WORKBENCH-UX-V2`
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`
- `GW-DOC-WORKBENCH-THEME-V1`
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`
- `GW-DOC-CANONICAL-CONTRACTS-V1`
- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`
- `GW-DOC-MARKDOWN-WORKBENCH-V1`
- `GW-DOC-INSTALLATION-READINESS-V1`
