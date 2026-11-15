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

Change-specific Research / Requirements / Solution design / Implementation plan / Readiness material belongs to the repository-native WorkItem document system owned by `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, ordinarily:

```text
docs/order/work-items/<WorkItemId>/
  work-request.md
  research.md
  requirements.md
  solution-design.md
  implementation-plan.md
  readiness-review.md
```

## Governance

- [Systems governance](governance/systems-governance.md) — `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`
- [Minimum change](governance/minimum-change.md) — `GW-DOC-MINIMUM-CHANGE-V1`
- [Repository delivery and release](governance/repository-delivery.md) — `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V1`

## Product

- [System brief](product/system-brief.md) — `GW-DOC-SYSTEM-BRIEF-V1`
- [Product identity](product/product-identity.md) — `GW-DOC-PRODUCT-IDENTITY-V1`

## Functional requirements

- [Work lifecycle](requirements/work-lifecycle.md) — `GW-DOC-WORK-LIFECYCLE-V1`
- [Specification standard](requirements/specification-standard.md) — `GW-DOC-SPECIFICATION-STANDARD-V1`
- [Validation standard](requirements/validation-standard.md) — `GW-DOC-VALIDATION-STANDARD-V1`
- [Project governance integration](requirements/project-governance-integration.md) — `GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1`
- [Lifecycle context](requirements/lifecycle-context.md) — `GW-DOC-LIFECYCLE-CONTEXT-V1`
- [WorkItem documents](requirements/work-item-documents.md) — `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`
- [Markdown workbench](requirements/markdown-workbench.md) — `GW-DOC-MARKDOWN-WORKBENCH-V1`
- [Workbench](requirements/workbench.md) — `GW-DOC-WORKBENCH-UX-V2`
- [Installation readiness](requirements/installation-readiness.md) — `GW-DOC-INSTALLATION-READINESS-V1`

## Technical architecture

- [Technical architecture](architecture/technical-architecture.md) — `GW-DOC-TECHNICAL-ARCHITECTURE-V1`
- [Execution control plane](architecture/execution-control-plane.md) — `GW-DOC-EXECUTION-CONTROL-PLANE-V1`
- [OpenCode integration](architecture/opencode-integration.md) — `GW-DOC-OPENCODE-INTEGRATION-V1`
- [Workbench technical architecture](architecture/workbench.md) — `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`

The Workbench technical owner is intentionally not yet implementation-ready: its detailed state-machine/transition/observation realization must be completed from the current V2 functional design before remediation implementation begins.

## Decisions

- [Technical decisions](decisions/technical-decisions.md) — `GW-DOC-TECHNICAL-DECISIONS-V1`

## Canonical contracts

- [Canonical contracts](contracts/canonical-contracts.md) — `GW-DOC-CANONICAL-CONTRACTS-V1`

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
