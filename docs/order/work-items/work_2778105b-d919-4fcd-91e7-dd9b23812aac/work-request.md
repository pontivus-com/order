---
{
  "formatVersion": 1,
  "id": "work_2778105b-d919-4fcd-91e7-dd9b23812aac",
  "projectId": "order",
  "concernIds": [
    "core",
    "daemon",
    "foundation",
    "ui",
    "verification"
  ],
  "schemaId": "change-v1",
  "derivedFromWorkItemId": "work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2"
}
---
# Deliver the integrated 0.5.0 workflow task experience

<!-- Order template: change-intake-v1; authority: GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1, GW-DOC-WORK-LIFECYCLE-V1 -->

## Requested outcome

Deliver the 0.5.0 Workbench as one coherent operator workflow in which every lifecycle step is organized around the task that step exists to accomplish.

For every workflow step, define and ultimately realize:

- the primary operator task and its completion outcome;
- the material subtasks required to complete that task;
- the information each subtask requires;
- the human input or decision each subtask accepts;
- the interaction available in each canonical condition;
- the current-attention and recovery behavior;
- the information hierarchy separating primary work, supporting context, agent activity, history/evidence and technical/debug detail;
- the observable result and next orientation after each interaction.

The design must use the existing Workbench interaction paradigm and closed interaction classes unless the functional analysis proves that a required task cannot be expressed by them.

## Current context

The parent AUDIT, `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`, completed the 0.5.0 Phase 1 investigation and returned `AUDIT_COMPLETE`.

Its canonical R1 synthesis is:

`docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/research.md`

Phase 1 established the complete current application surface/overlay topology, typed information lineage, interaction/business-rule/effect paths, workflow/state algebra, OpenCode integration/capability facts, document/material maturity facts and certification gaps. It concluded that the underlying state architecture is largely sound, while the operator interaction contract is incomplete or contradictory at specific boundaries.

The Phase 1 prerequisite package identifies six functional decisions that this WorkItem must close in R2:

1. complete per-screen information hierarchy and interaction contract;
2. operator-visible OpenCode activity model;
3. manual Implementation action semantics;
4. proposal versus cancellation/terminalization semantics;
5. operator-facing document/material maturity;
6. integrated pre-signoff conversation/document loop.

The Phase 1 audit is immutable factual provenance. This WorkItem must consume it rather than rediscovering 0.4.0 behavior.

## Constraints/non-goals

- Preserve one canonical WorkItem lifecycle owner and the existing separation between lifecycle position, Run interaction state, proposal state, material currentness, recovery ownership, execution ownership, validation boundary, observation coherence and current attention.
- Do not introduce a duplicate persisted workflow/document-maturity state model merely to simplify presentation.
- Preserve FCIS, SoC, semantic DRY, strict typing, canonical ownership, explicit flow and minimum sufficient change.
- Phase 2A defines observable product behavior only. It does not choose HTTP shapes, persistence structures, provider event sources, React component graphs or implementation tasks.
- Existing Workbench interaction classes and foundational components are the default product language. A new interaction class requires a demonstrated functional need and an explicit amendment of its canonical owner.
- Do not expose hidden model reasoning, credentials, raw unbounded provider payloads or provider-native protocol detail as ordinary product transparency.
- Do not weaken the existing STAGE consumer grammar to accommodate an incomplete producer contract.
- Do not manufacture Run/conformance history to make repository lifecycle drafts visible.
- Do not treat Git recording as conformance, readiness or approval.
- Do not redesign behavior that Phase 1 proved correct unless a downstream functional contradiction is discovered and explicitly returned upstream.

## Evidence/references

- Parent AUDIT: `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`
- Parent Phase 1 synthesis: `docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/research.md`
- Parent application interaction map: `docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/application-interaction-map.md`
- Parent workflow/state audit: `docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/workflow-state-audit.md`
- Parent OpenCode interaction audit: `docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/opencode-interaction-audit.md`
- Parent document/material maturity audit: `docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/document-material-maturity-audit.md`
- Parent certification evidence map: `docs/order/work-items/work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2/certification-evidence-map.md`
- `GW-DOC-WORK-LIFECYCLE-V1`
- `GW-DOC-LIFECYCLE-CONTEXT-V1`
- `GW-DOC-WORKBENCH-UX-V2`
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`
- `GW-DOC-MARKDOWN-WORKBENCH-V1`
- `GW-DOC-INSTALLATION-READINESS-V1`
- `GW-DOC-OPENCODE-INTEGRATION-V1`
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`
- `GW-DOC-CANONICAL-CONTRACTS-V1`
