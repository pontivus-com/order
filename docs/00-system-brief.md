# 00 — System brief

**Status:** Design baseline
**Canonical concern ID:** `GW-DOC-SYSTEM-BRIEF`  
**Versioned concern ID:** `GW-DOC-SYSTEM-BRIEF-V1`  

## 1. Problem

Repeated coding-agent execution is easy to automate and easy to misuse.

A timer that periodically sends an agent a prompt creates an implicit production pressure: every invocation is encouraged to produce something. Ambiguous work, stale assumptions, adjacent observations, and self-certified completion then become code churn.

Order solves the control problem around agentic software work.

It must ensure that:

- ambiguous ideas cannot silently become executable work;
- current-state claims are verified before implementation;
- requirements, design, implementation planning, and readiness are distinct stages;
- implementation authority exists only after explicit sign-off;
- implementation agents cannot broaden their own scope;
- verification is external to the implementation agent;
- retries are bounded;
- execution state is durable outside model sessions;
- doing nothing is a correct outcome when no authorized work exists.

## 2. Product identity

Current public naming, endorsed identity, category, proposition, family wording and approved product-language hierarchy are owned by `GW-DOC-PRODUCT-IDENTITY-V1`.

The former name **Gateweft** is retained only as migration/provenance terminology. Stable `GW-*` machine identifiers are intentionally unchanged and are not current public product naming.

## 3. Product boundary

Order owns:

- a local interactive workbench for investigation, requirements, design, planning, authority/evidence inspection, sign-off and candidate review;
- work-item lifecycle state;
- references to authoritative project artifacts;
- explicit approval records;
- executable task contracts derived from approved work;
- task eligibility, dependencies, and run state;
- coding-agent invocation;
- deterministic verification orchestration;
- independent review invocation;
- bounded remediation policy;
- run evidence and terminal result classification.

Order does **not** own:

- product strategy;
- project architecture;
- repository domain semantics;
- ADR authority;
- workflow contracts;
- source-code architecture rules;
- project-specific test semantics;
- deployment policy;
- merge authority;
- production mutation authority.

Those remain owned by the project being changed.

## 4. Relationship to project repositories

A project repository is the engineering authority.

Order references project artifacts rather than replacing them. A work item may reference, for example:

- investigations;
- requirements documents;
- ADRs;
- design reports;
- implementation plans;
- agentic contracts;
- test contracts;
- repository instructions such as `AGENTS.md`.

Order records stable references and content hashes so approval applies to an exact package.

Order is project-neutral. Its domain model must contain no consumer-project-specific concepts.

## 5. Relationship to Span

The canonical Pontivus-family relationship and approved public wording are owned by `GW-DOC-PRODUCT-IDENTITY-V1`.

At the product-boundary level, Span may be consumed as semantic context or agent tooling, but Span owns none of Order's lifecycle, approval, execution or verification state, and Order must remain usable without project-specific semantic tooling.

The integration boundary is therefore:

```text
project authority + semantic context
              |
              v
          Order
   lifecycle / authorization
              |
              v
        coding agent
              |
              v
      verified candidate
```

## 6. Desired lifecycle

```text
IDEA
  |
  v
R1 RESEARCH
  |
  v
R2 REQUIREMENTS
  |
  v
DESIGN
  |
  v
PLAN
  |
  v
R3 READINESS REVIEW
  |
  v
AWAITING SIGN-OFF
  |
  | explicit human authorization
  v
=============================
 EXECUTION AUTHORITY BOUNDARY
=============================
  |
  v
TODO
  |
  v
IMPLEMENT
  |
  v
MECHANICAL VERIFY
  |
  v
INDEPENDENT REVIEW
  |
  v
MECHANICAL VERIFY
  |
  v
CANDIDATE DONE
```

## 7. Non-goals for v1

Order v1 will not provide:

- a remotely hosted or multi-user web service;
- a Kanban product;
- a general workflow DSL;
- a generalized multi-agent framework;
- autonomous task invention;
- autonomous architecture decisions;
- agent-generated priority changes;
- automatic commits, pull requests, merges, or deployments;
- multi-repository parallel execution;
- distributed workers;
- Redis, Kafka, Celery, or Temporal;
- dynamic model routing;
- a plugin ecosystem;
- compatibility with every coding CLI.

The v1 user interface is a local browser application served by the Order daemon. It is a control surface over canonical Order/project state, not another source of authority.

The initial execution provider is OpenCode.

## 8. Success criterion

A successful Order run is not "the agent produced a patch."

It is:

> An exact, approved execution task was still valid against the current repository, was implemented without exceeding its authorized boundary, and passed both prescribed deterministic verification and independent semantic review.

Anything less remains incomplete or blocked.

## 9. Stable product-intent reference

**GW-P2-CONTROLLED-WORK** — Order exists so repeated coding-agent work progresses to implementation only when the work is factually grounded, explicitly specified, architecture-consistent, independently judged ready, explicitly authorized, and independently verified afterward.

This is the stable P2 reference for the v1 functional requirements in [GW-DOC-WORK-LIFECYCLE-V1 §7](01-work-lifecycle.md). It does not add behavior beyond §§1–7; it gives that already-approved product intent a machine-resolvable identity.
