# Order documentation

**Status:** Current documentation index

Order documentation is organized by semantic concern rather than document sequence.

Canonical semantic authority is identified by stable `GW-DOC-*` / requirement / technical-requirement identifiers resolved through root `pontivus-order.toml`. Filenames and directories are navigation only.

## Documentation rules

The live `docs/` design set contains only:

- current durable P1-P6 authority;
- current architecture decisions;
- current factual/reference material;
- repository-native Order WorkItem documents under `docs/order/work-items/**` when such WorkItems exist.

It does **not** retain completed release implementation plans, superseded functional designs, superseded component mappings or compatibility indexes merely for history. Git history, merged pull requests, releases and `CHANGELOG.md` are the implementation/provenance record.

New canonical documentation files use semantic names. Ordinal prefixes such as `00-`, `37-` or `50-` are prohibited.

Change-specific Research / Requirements / Solution design / Implementation plan / Readiness material belongs to the repository-native WorkItem document system owned by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM`, ordinarily:

```text
docs/order/work-items/<WorkItemId>/
  work-request.md
  research.md
  requirements.md
  solution-design.md
  implementation-plan.md
  readiness-review.md
```

## Active 0.6.0 design campaign

The sole active campaign/work point for Order 0.6.0 design is WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`:

- [Work request](order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/work-request.md)
- [Design campaign plan](order/work-items/work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21/0.6.0-design-campaign-plan.md)

The WorkItem is the campaign tracking and lifecycle package, not a replacement for P1-P6 canonical semantic owners. Normative design changes remain owned by the canonical documents identified through `pontivus-order.toml [refs]`.

## Governance

- [Systems governance](governance/systems-governance.md) — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`
- [Minimum change](governance/minimum-change.md) — `GW-DOC-MINIMUM-CHANGE-V1`
- [Repository delivery and release](governance/repository-delivery.md) — `GW-DOC-PUBLIC-REPOSITORY-DELIVERY`

## Product

- [System brief](product/system-brief.md) — `GW-DOC-SYSTEM-BRIEF-V1`
- [Product identity](product/product-identity.md) — `GW-DOC-PRODUCT-IDENTITY-V1`

## Functional requirements

- [Work lifecycle](requirements/work-lifecycle.md) — `GW-DOC-WORK-LIFECYCLE-V1`
- [Specification standard](requirements/specification-standard.md) — `GW-DOC-SPECIFICATION-STANDARD`
- [Validation standard](requirements/validation-standard.md) — `GW-DOC-VALIDATION-STANDARD-V1`
- [Project governance integration](requirements/project-governance-integration.md) — `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`
- [Lifecycle context](requirements/lifecycle-context.md) — `GW-DOC-LIFECYCLE-CONTEXT`
- [WorkItem documents](requirements/work-item-documents.md) — `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM`
- [Markdown workbench](requirements/markdown-workbench.md) — `GW-DOC-MARKDOWN-WORKBENCH-V1`
- [Workbench](requirements/workbench.md) — `GW-DOC-WORKBENCH-UX-V2`
- [Installation readiness](requirements/installation-readiness.md) — `GW-DOC-INSTALLATION-READINESS-V1`

## Technical architecture

- [Technical architecture](architecture/technical-architecture.md) — `GW-DOC-TECHNICAL-ARCHITECTURE`
- [Execution control plane](architecture/execution-control-plane.md) — `GW-DOC-EXECUTION-CONTROL-PLANE-V1`
- [OpenCode integration](architecture/opencode-integration.md) — `GW-DOC-OPENCODE-INTEGRATION-V1`
- [Workbench technical architecture](architecture/workbench.md) — `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`
- [Workbench theme and styling architecture](architecture/workbench-theme.md) — `GW-DOC-WORKBENCH-THEME-V1`

The Workbench P4 design is split by concern: the component owner defines state/transition/observation/spatial/component composition and renderer coverage, while the theme owner defines exact System/Light/Dark behavior, semantic tokens, cross-component visual parity, foundation bridging and `theme.css`/stylesheet governance. Runtime remediation remains unimplemented; the next lifecycle activity is a P7 implementation plan derived from the closed P3/P4/P6 authority.

## Decisions

- [Technical decisions](decisions/technical-decisions.md) — `GW-DOC-TECHNICAL-DECISIONS-V1`

## Canonical contracts

- [Canonical contracts](contracts/canonical-contracts.md) — `GW-DOC-CANONICAL-CONTRACTS`

## Derived visual references

- [Workbench 0.5.0 visual reference pack](references/workbench-ui/README.md) — reviewed SVG references derived from the parent Audit, the Phase 2A functional model and the canonical Workbench owners; not an independent semantic authority.

## External facts and references

- [External facts](references/external-facts.md) — `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`
- [OpenSpec](references/openspec.md) — `GW-DOC-REF-OPENSPEC-V1-2026-11-12`
- [GitHub Spec Kit](references/spec-kit.md) — `GW-DOC-REF-SPEC-KIT-V1-2026-11-12`
- [Kiro Specs](references/kiro-specs.md) — `GW-DOC-REF-KIRO-SPECS-V1-2026-11-12`
- [BMAD](references/bmad.md) — `GW-DOC-REF-BMAD-V1-2026-11-12`

## Canonical registry

The machine-resolvable authority registry is root `pontivus-order.toml`.

Each current canonical semantic owner declares one stable `GW-DOC-*` concern identifier and one current version-specific identifier. Documents reference those identifiers rather than creating shadow specifications.

The repository architecture fitness test recursively validates this documentation tree, excludes repository-native WorkItem lifecycle documents from canonical-owner discovery, rejects ordinal-prefixed canonical filenames, and verifies registry ownership/path consistency.
