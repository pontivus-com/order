# Workbench technical architecture

**Status:** Current P4 boundary; detailed state-machine/component realization pending  
**Canonical concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`  
**Pyramid layer:** P4 technical architecture

## 1. Purpose

This document is the current technical owner for the Order Workbench boundary under `GW-DOC-WORKBENCH-UX-V2`.

It intentionally does **not** preserve the superseded 0.3.0 component/spatial specification. The current production implementation is evidence to be evaluated during redesign; it is not technical authority where it conflicts with the V2 functional design.

No implementation task may infer missing workflow semantics from the existing React components, CSS, query behavior or historical V1 documentation.

## 2. Governing authority

The Workbench realization must conform to:

- `GW-DOC-WORKBENCH-UX-V2` for observable workflow, messaging, attention, history and spatial behavior;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1` for FCIS/SoC topology, daemon/browser ownership and dependency direction;
- `GW-DOC-CANONICAL-CONTRACTS-V1` for canonical state, persistence and transport contracts;
- `GW-P1-FCIS`, `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-EXPLICIT-FLOW`.

## 3. Retained implementation boundaries

The following technical boundaries remain valid unless the state-machine investigation proves that a higher authority requires their revision:

1. Order remains a React/Vite client over the loopback daemon.
2. TanStack Query remains the client mechanism for daemon-owned server state.
3. Reusable project-neutral interaction primitives remain under `ui/src/primitives/**`.
4. Astryx remains an implementation substrate beneath Order's local semantic UI boundary; it does not own lifecycle, information architecture or canonical state.
5. Browser-local state is limited to presentation concerns. The browser must not own a parallel workflow state machine, mutation eligibility model or duplicate canonical domain representation.
6. Canonical domain data is consumed directly through typed contracts and pure presentation functions; no DTO/view-model family is introduced for the same semantic state.
7. The exact-source Markdown boundary remains owned by `GW-DOC-MARKDOWN-WORKBENCH-V1`.
8. Existing production components and CSS may be reused only when they conform to V2; historical component names or layout structure create no preservation requirement.

## 4. Required state-machine investigation

Before the Workbench remediation is implementation-ready, this owner must be completed with a technical design that resolves at least:

- the canonical WorkItem workflow state machine and legal transition relation;
- backward-transition and monotonic reached-history representation;
- Run lifecycle versus provider-turn occupancy versus operator-input eligibility;
- exact unresolved-human-input ownership and idempotence;
- proposal ownership/adoption admission;
- document mutation exclusion while active work owns authority;
- command serialization and atomicity;
- side-effect-free read/query boundaries;
- asynchronous Run-to-WorkItem convergence;
- terminal RunEvent drain/observation semantics;
- current-attention/current-action derivation;
- execution-blocker ownership;
- browser query invalidation/reconciliation rules;
- stable Workbench layout realization for wide/medium/narrow classes;
- permanent transition, concurrency, recovery and geometry fitness tests.

These concerns must be represented through existing canonical semantic owners and pure functions where possible. A generic workflow-framework dependency, service/object graph, browser state store, DTO layer or duplicate lifecycle model is not authorized.

## 5. Implementation gate

Until §4 is resolved and this P4 owner plus any required P6 contract changes are complete:

- the existing Workbench implementation may be inspected and tested;
- correctness defects may be documented;
- no implementation task may choose new workflow states, transition rules, message admission policy, recovery semantics or canonical browser state locally;
- no V1 Workbench section, release-specific implementation plan or superseded component mapping is standing implementation authority.

The next design activity is therefore the state-machine/transition/observation investigation required by `GW-DOC-WORKBENCH-UX-V2`.
