# 29 — Kiro Specs reference facts for feature and defect workflows

**Status:** Binding factual reference  
**Canonical concern ID:** `GW-DOC-REF-KIRO-SPECS`  
**Versioned concern ID:** `GW-DOC-REF-KIRO-SPECS-V1-2026-11-12`  
**Verified:** 2026-11-12

## 1. Purpose

This document owns only the external Kiro Specs facts that Order is allowed to rely on as prior-art evidence for coding-agent feature and defect specification workflows.

It does not own Order requirements syntax, lifecycle, task execution, testing policy or template text. Order documents cite `GW-DOC-REF-KIRO-SPECS-V1-2026-11-12` when these facts are relevant.

## 2. Verified official sources

Official Kiro documentation:

- https://kiro.dev/docs/specs/
- https://kiro.dev/docs/specs/feature-specs/
- https://kiro.dev/docs/specs/feature-specs/requirements-first/
- https://kiro.dev/docs/specs/bugfix-specs/
- https://kiro.dev/docs/specs/best-practices/
- https://kiro.dev/docs/ide/editor/markdown-review/

The Bugfix Specs page observed during this verification records a page update date of 2026-08-04.

## 3. Relied-upon facts

### 3.1 Kiro distinguishes feature specs from bugfix specs

Kiro documents separate Feature Specs and Bugfix Specs. Both use structured Markdown artifacts, but their first-phase content differs according to whether the work is new/changed capability or broken existing behavior.

Feature Specs can use a requirements-first path that proceeds requirements -> design -> tasks. Bugfix Specs use bug analysis -> design -> tasks.

### 3.2 Bugfix analysis records defect, correction and preserved behavior separately

The official Bugfix Specs structure captures current incorrect behavior, expected correct behavior and unchanged behavior that must continue to work.

The design phase includes root-cause analysis and a proposed fix approach. Kiro's documented validation properties cover proving the defect exists, proving the corrected behavior and proving unchanged behavior remains intact.

### 3.3 Tasks are discrete executable units with dependencies

Kiro documents `tasks.md` as a set of discrete implementation tasks with clear outcomes. Its task execution surface analyzes dependencies, forms dependency waves and may execute independent tasks concurrently.

### 3.4 Spec Markdown is reviewable as a coherent document set

Kiro's Markdown Review treats `requirements.md`, `design.md`, `tasks.md` and `bugfix.md` under the same spec as related documents, allowing review against sibling spec context.

## 4. Explicit limits

Order does not inherit Kiro's EARS syntax, requirements-first/design-first choice, property-based-testing mechanism, task execution UI, parallel execution policy or spec directory format.

The relied-upon facts are the work-type-specific document variants, explicit preservation of unchanged defect behavior, and dependency-aware executable task representation.
