# Order design

**Status:** Canonical design baseline  
**Purpose:** Canonical design set for Order.

Order is a governed software work system. It owns the lifecycle that moves work from an untrusted idea or observation to an explicitly authorized execution task, and then through bounded implementation and independent verification.

It is deliberately not a software-development methodology, ticket system, autonomous product manager, or general agent framework. Project repositories retain authority for their product intent, requirements, architecture, contracts, ADRs, tests, plans, and domain semantics within the Order systems governance pyramid.

## Governing status

Canonical semantic authority is held only by documents that declare a `GW-DOC-*` canonical concern identifier and are selected by the project authority map. Reference indexes, historical plans and review records are not additional semantic owners.

`GW-P1-DOC-CANONICALITY` is owned by `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1`. Stable and versioned concern identifiers resolve through root `pontivus-order.toml [refs]`; filenames and document numbers are navigation only.

Order must fail closed when it cannot resolve the canonical owner required for a governed concern. It must not duplicate or weaken a rule merely to keep work moving.

## Design set

1. [GW-DOC-SYSTEM-BRIEF-V1](00-system-brief.md) — product boundary, goals, non-goals, and relationship to project repositories and Span.
2. [GW-DOC-WORK-LIFECYCLE-V1](01-work-lifecycle.md) — Idea → R1 → R2 → Design → Plan → R3 → Sign-off → TODO.
3. [GW-DOC-EXECUTION-CONTROL-PLANE-V1](02-execution-control-plane.md) — queue, OpenCode execution, verification, retry, evidence, and scheduling.
4. [Architecture invariant reference index](03-architecture-invariants.md) — navigation-only compatibility index; it owns no architecture semantics.
5. [GW-DOC-TECHNICAL-DECISIONS-V1](04-open-decisions.md) — resolved v1 architecture/integration decisions and implementation gate.
6. [GW-DOC-SPECIFICATION-STANDARD-V1](05-specification-standard.md) — mandatory contents and readiness rules for work packages.
7. [GW-DOC-VALIDATION-STANDARD-V1](06-validation-standard.md) — validation gates, branches, failure classes, and terminal evidence.
8. [GW-DOC-OPENCODE-INTEGRATION-V1](07-opencode-integration-standard.md) — constrained builder/reviewer execution and session management.
9. [GW-DOC-MINIMUM-CHANGE-V1](08-minimum-change-standard.md) — minimum sufficient implementation and change-surface control.
10. [GW-DOC-PROJECT-GOVERNANCE-INTEGRATION-V1](09-project-governance-integration.md) — how projects plug their own authority into Order defaults.
11. [GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1](10-systems-governance-pyramid.md) — the complete P0-P8 authority model from principles and user intent through requirements, architecture, ADRs, contracts, plans, implementation, and evidence.
12. [GW-DOC-LIFECYCLE-CONTEXT-V1](11-lifecycle-context-resolution.md) — stage-specific minimum context, decision boundaries, boundary conformance, freshness, and promotion rules.
13. [GW-DOC-TECHNICAL-ARCHITECTURE-V1](12-technical-architecture.md) — locked TypeScript/Bun/React architecture, local daemon/UI, FCIS topology, code layout, project integration, interactive/provider hooks, execution and candidate handoff.
14. [GW-DOC-CANONICAL-CONTRACTS-V1](13-canonical-contracts.md) — exact canonical semantic types, task/manifest grammar, SQLite schema and local HTTP contracts.
15. [GW-DOC-EXTERNAL-FACTS-V1-2026-11-12](14-external-version-facts.md) — dated factual baseline for the complete v1 direct dependency/runtime set, relied-upon vendor capabilities, Order pins, upstream snapshots and runtime actuals.
16. [GW-DOC-REF-OPENSPEC-V1-2026-11-12](27-reference-openspec.md) — dated OpenSpec prior-art facts for change metadata, schema-driven artifact graphs, templates and dependencies.
17. [GW-DOC-REF-SPEC-KIT-V1-2026-11-12](28-reference-spec-kit.md) — dated GitHub Spec Kit prior-art facts for SDD, bug-fix and idea-assessment agentic processes.
18. [GW-DOC-REF-KIRO-SPECS-V1-2026-11-12](29-reference-kiro-specs.md) — dated Kiro Specs prior-art facts for feature/defect document variants and executable task dependencies.
19. [GW-DOC-REF-BMAD-V1-2026-11-12](30-reference-bmad.md) — dated BMAD prior-art facts for intent-grounded implementation, independent review and separate testing.
20. [GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1](31-work-item-document-system.md) — binding P3 functional design for portable Markdown WorkItems, governed work-kind/schema/templates, catalog-driven authoring and queue reconciliation.
21. [GW-DOC-MARKDOWN-WORKBENCH-V1](32-operator-markdown-workbench.md) — binding P3 functional design for governed source/lifecycle Markdown authoring, source diagnostics/freshness visibility, lifecycle document navigation, source-bound sign-off integration and the read-only execution/editor boundary.
22. [GW-DOC-WORKBENCH-UX-V1](37-workbench-ux-information-architecture.md) — binding P3 UX/information-architecture design for primary-canvas versus contextual-inspector allocation, screen/use-case space budgets, responsive continuity, semantic controls and icon/action behavior across all workbench surfaces.
23. [GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1](38-workbench-astryx-component-architecture.md) — binding P4 technical design mapping the workbench UX onto the local UI boundary and a selectively adopted, pinned Astryx component substrate.
24. [GW-DOC-PRODUCT-IDENTITY-V1](40-order-product-identity.md) — canonical Order / Pontivus Order naming, descriptor, proposition, product-language hierarchy, positioning boundaries and Span-family wording.
25. [GW-DOC-ORDER-TECHNICAL-IDENTITY-V1](41-order-technical-identity-cutover.md) — binding P4 owner for the Order live technical namespace, one-way predecessor cutover and repository-migration boundary.

## Canonical concern registry

The machine-resolvable concern registry is root `pontivus-order.toml [refs]`. Each canonical semantic owner declares:

- one stable `GW-DOC-*` concern identifier;
- one current version-specific identifier;
- exactly one owning document path for each identifier.

The governing reference law is `GW-P1-DOC-CANONICALITY`. Other documents reference these identifiers rather than reproducing the owner's normative semantics. A document may describe only the local consequence or integration obligation that it itself owns.

The design-set list above is navigation, not a second semantic registry. `docs/03-architecture-invariants.md` is reference-only.

The root `AGENTS.md` is itself the canonical owner of agent operating rules under `GW-DOC-AGENT-OPERATING-RULES-V1`; it references all other governed concerns by identifier.

## Governing principle

> Order is not paid for producing code. It is paid for retiring proven, authorized work with the smallest independently verified change that fully satisfies governing product intent, requirements, architecture and contracts.

Accordingly, `NO_WORK`, `ALREADY_SATISFIED`, `DUPLICATE`, `BLOCKED`, and `REJECTED` are valid and often desirable outcomes.

A smaller change is not automatically better. The required target is the **minimum sufficient change**: nothing unnecessary, nothing missing.
