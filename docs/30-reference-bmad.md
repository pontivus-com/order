# 30 — BMAD Method reference facts for agentic implementation, review and testing

**Status:** Binding factual reference  
**Canonical concern ID:** `GW-DOC-REF-BMAD`  
**Versioned concern ID:** `GW-DOC-REF-BMAD-V1-2026-11-12`  
**Verified:** 2026-11-12  
**Observed upstream source:** `bmad-code-org/BMAD-METHOD@a867e1604b365d48ea03cbd109da1066ba0c84bc`

## 1. Purpose

This document owns only the external BMAD Method facts that Order is allowed to rely on as prior-art evidence for coding-agent implementation, review and testing separation.

It does not own Order agent roles, lifecycle stages, remediation policy, validation branches or completion semantics. Order documents cite `GW-DOC-REF-BMAD-V1-2026-11-12` when these facts are relevant.

## 2. Verified official sources

Pinned official repository documentation:

- https://github.com/bmad-code-org/BMAD-METHOD/blob/a867e1604b365d48ea03cbd109da1066ba0c84bc/docs/build/build-a-change.md
- https://github.com/bmad-code-org/BMAD-METHOD/blob/a867e1604b365d48ea03cbd109da1066ba0c84bc/docs/build/review-a-change.md
- https://github.com/bmad-code-org/BMAD-METHOD/blob/a867e1604b365d48ea03cbd109da1066ba0c84bc/docs/build/test-completed-work.md
- https://github.com/bmad-code-org/BMAD-METHOD/blob/a867e1604b365d48ea03cbd109da1066ba0c84bc/docs/reference/skills-and-agents.md

## 3. Relied-upon facts

### 3.1 Implementation can start from an intent artifact and resolves upstream context first

BMAD's documented build flow accepts a request, issue, specification or ticket as intent, investigates the codebase and upstream planning context, records a plan where required, then implements and reviews the result.

Its documentation explicitly distinguishes cases where upstream intent/design is weak from local implementation defects and directs work back to the upstream layer rather than relying only on patching the produced diff.

### 3.2 Code review is a distinct activity with explicit intent context

The documented standalone code-review workflow can review a diff, pull request, branch, file or other change artifact. Review quality is stronger when the change is evaluated with the governing plan/specification or other statement of intent rather than against the diff alone.

The review can use independent review layers and triages verified findings instead of treating every model observation as an accepted defect.

### 3.3 Test generation is distinct from code review

BMAD documents generated API/end-to-end testing as a separate activity from code review. The testing flow identifies scenarios, learns the project's existing test approach, writes tests, executes them and reports coverage/bugs.

A test-generation run does not substitute for implementation review.

## 4. Explicit limits

Order does not inherit BMAD personas, planning paths, commit behavior, ticket tree, review-depth policy, automated patching, test-generation policy or module system.

The relied-upon facts are the separation of intent/plan, implementation, independent review and testing, and the use of explicit intent context during review.
