# 28 — GitHub Spec Kit reference facts for agentic software-work processes

**Status:** Binding factual reference  
**Canonical concern ID:** `GW-DOC-REF-SPEC-KIT`  
**Versioned concern ID:** `GW-DOC-REF-SPEC-KIT-V1-2026-11-12`  
**Verified:** 2026-11-12  
**Observed upstream source:** `github/spec-kit@979b0a3c1277283371c9901ad0eed04b64a99997`

## 1. Purpose

This document owns only the external GitHub Spec Kit facts that Order is allowed to rely on as prior-art evidence for coding-agent software-development processes.

It does not own Order lifecycle semantics, work kinds, templates, sign-off, execution or verification. Order documents cite `GW-DOC-REF-SPEC-KIT-V1-2026-11-12` when these facts are relevant.

## 2. Verified official sources

Official documentation:

- https://github.github.io/spec-kit/
- https://github.github.io/spec-kit/quickstart.html
- https://github.github.io/spec-kit/guides/bugfix.html
- https://github.github.io/spec-kit/guides/assessment.html
- https://github.github.io/spec-kit/reference/agentic-assessment.html
- https://github.github.io/spec-kit/reference/overview.html

Pinned official repository source:

- https://github.com/github/spec-kit/tree/979b0a3c1277283371c9901ad0eed04b64a99997

## 3. Relied-upon facts

### 3.1 Spec Kit exposes independent software-work entry processes

The official Spec Kit documentation presents Spec-Driven Development, Bug Fixing and Idea Assessment as independent entry processes rather than mandatory phases of one universal feature workflow.

Spec-Driven Development carries a specification through planning, implementation and convergence. Bug Fixing is intended for diagnosing and repairing broken existing behavior. Idea Assessment is intended for evidence-based decision making before committing to implementation.

### 3.2 The SDD path uses durable Markdown artifacts ahead of implementation

The documented core SDD flow is specify -> plan -> tasks -> implement -> converge, with optional clarification, checklist and cross-artifact analysis quality gates.

The specification, plan and task artifacts are durable inputs to later agent steps. Cross-artifact analysis is read-only and reports gaps or contradictions to be corrected at their source before implementation.

### 3.3 Bug fixing separates diagnosis, mutation and verification

The documented bug process is assess -> fix -> test. Assessment investigates the reported behavior and writes a diagnosis without changing source code. Fix is the mutation stage. Test re-exercises the original reproduction and relevant tests and records verification without editing source code to make failures pass.

Each bug is grouped under one stable slug directory and retains assessment, fix and test artifacts together. A passing generic test suite is not considered sufficient when the original reproduction was not exercised.

### 3.4 Idea assessment may terminate without implementation

The documented assessment process is intake -> research -> define -> shape -> decide. It produces evidence-backed `go`, `needs-clarification` or `kill` outcomes and does not automatically start software delivery.

The research stage records supporting and opposing evidence; uncited assumptions are not treated as established facts. A decision to stop is an explicit successful outcome.

## 4. Explicit limits

Order does not inherit Spec Kit commands, directory names, slugs, extension runtime, branch conventions, convergence behavior or assessment scoring.

The relied-upon fact is the demonstrated separation of different coding-agent work intents and the use of durable evidence/specification artifacts before mutation.
