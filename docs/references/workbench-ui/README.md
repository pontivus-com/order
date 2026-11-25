# Order 0.6.0 Workbench comparison corpus

**Status:** active derived comparison evidence  
**Semantic authority:** none  
**Surface owner:** current 0.6.0 DESIGN declares the 37 governed `SURF-*` contracts.

This directory is a deterministic visual projection of the current Workbench authority. It is not a product requirement, component specification, design decision, lifecycle record, or implementation baseline.

## Exact authority binding

The active corpus is valid only for these exact inputs:

- `GW-DOC-WORKBENCH-UX-V2` — blob `865800890eaf8da1e7fa581e092aa8b9d072eab9`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` — blob `4366cc2c79c22262438f0a3e66889c61b4fd5c40`;
- `GW-DOC-WORKBENCH-THEME-V1` — blob `03dfc6be3600a1128b5639d011f4c0159d3497dd`;
- current 0.6.0 DESIGN — blob `f54ead6381f2ffe77e26e0f31022f008c93de26e`.

These are the exact current authority versions projected by this corpus. If any bound owner changes, this corpus is stale until regenerated and reviewed. The owner wins on every conflict.

## Files

- `reference-manifest.json` is the machine-readable 37-SURF mapping, state/view/theme coverage and exact authority binding.
- `reference-atlas.html` is the deterministic render source. Open one surface with `?surf=SURF-...&state=...&theme=light|dark|system`.
- Git history is the only retained provenance for the superseded 0.5.0 SVG pack. Those SVGs are not live comparison material.

## Evidence integrity

Reference fixtures are canonical semantic placeholders. They demonstrate information hierarchy, component anatomy, geometry, responsive recomposition and visual hierarchy without claiming that a runtime event occurred.

The corpus must never fabricate or be cited as evidence of persisted Runs, agent conclusions, proposals, findings, signed tasks, approvals, evidence resources, validation results, deployment state or terminal outcomes. Runtime acceptance uses separately captured exact-candidate evidence.

## Acceptance use

The runtime capture and reference must identify the same SURF, state, governed scope, viewport class and effective theme. A component reference cannot be compared as if it were a full-workbench reference.

A reference mismatch never authorizes implementation to change product behavior. The reviewer resolves the discrepancy against the exact bound authority first.

The 37-SURF universe is derived from current DESIGN, never from this directory.
