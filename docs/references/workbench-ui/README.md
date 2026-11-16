# Order Workbench 0.5.0 visual reference pack

**Status:** Reviewed derived visual reference set — Phase 2A complete  
**Scope:** wide-layout WorkItem workflow surfaces only  
**Authority:** derived reference only; semantic authority remains with the canonical owners listed below

These SVGs are reproducible visual references for the reviewed 0.5.0 Workbench functional model. They are deliberately not a second functional or technical specification. If a visual conflicts with a canonical owner, the canonical owner wins and the visual must be corrected.

## Governing source basis

The reference pack was checked against:

- `GW-DOC-WORKBENCH-UX-V2` — canonical Workbench product behavior, information hierarchy, interaction classes, lifecycle rail, dialogue/reply context and per-step screen contracts;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` — Change / Defect / Investigation / Audit intake and progressive document semantics;
- `GW-DOC-MARKDOWN-WORKBENCH-V1` — governed document editing/currentness behavior;
- `GW-DOC-WORK-LIFECYCLE-V1` and `GW-DOC-LIFECYCLE-CONTEXT-V1` — lifecycle ownership and stage decision boundaries;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` — already-binding stable shell, rail, interaction-space and responsive composition constraints;
- `GW-DOC-WORKBENCH-THEME-V1` — already-binding visual character, Order color/token posture, density and theme rules;
- parent Audit `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`, especially:
  - `application-interaction-map.md`;
  - `workflow-state-audit.md`;
  - `opencode-interaction-audit.md`;
  - `document-material-maturity-audit.md`;
  - `certification-evidence-map.md`;
  - `research.md`;
- linked Change `work_2778105b-d919-4fcd-91e7-dd9b23812aac/requirements.md` — reviewed Phase 2A functional model.

## Visual-system invariants demonstrated by every reference

The reference set uses the stable Workbench topology:

```text
application toolbar
work-item identity
workflow rail
current-attention / current-task region
primary interaction surface
[optional Context only when explicitly opened]
```

The references intentionally demonstrate:

- one persistent lifecycle rail with **completed = success/green**, **current = Order blue**, **unreached = neutral**;
- one compact WorkItem identity region;
- one current-attention owner;
- flat, neutral-first, low-chrome surfaces;
- deep navy / Order-blue product identity;
- structural borders and spacing rather than dashboard-card decoration;
- technical details collapsed/on demand;
- no raw paths, hashes, provider-session ids or other technical identity in premium task space;
- no additional persistent pre-signoff navigation rail;
- no content-count-driven geometry changes;
- one visually primary task/action;
- supporting authority/evidence subordinate to current work.

The SVGs are desktop/wide-layout references. Medium/narrow recomposition remains governed by `GW-DOC-WORKBENCH-UX-V2` and `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`; this pack does not create another responsive contract.

## Workflow screen references

| Reference | Primary interaction class | Required visual purpose | Phase 1 / Phase 2 closure represented |
|---|---|---|---|
| [Work request](work-request.svg) | Document | sparse kind-specific intake; no invented downstream authority | Defect intake semantics; source-first hierarchy; Start Research only when ready |
| [Research](research.svg) | Dialogue | visible human/agent discussion with reply context; OpenCode activity secondary | OC-F01/OC-F02 transparency; persisted agent/human messages; dialogue/reply requirement; evidence and attempt history subordinate |
| [Requirements](requirements.svg) | Document | observable behavioral contract dominates; Defect invariants remain close | kind-specific Defect context; acceptance/scope/failure/preservation; Research supporting |
| [Solution design](solution-design.svg) | Document | broad technical solution and requirement coverage | accepted Requirements first; root cause/preservation remains relevant; architecture content gets broad working width |
| [Implementation plan](implementation-plan.svg) | Document | exact executable delivery authority | task/dependency/change/verification structure; no premature execution master/detail |
| [Readiness review](readiness-review.svg) | Review | verdict → finding → defective owner → relevant material | judgment-first hierarchy; read-only; no sign-off action; exact upstream return ownership |
| [Approval](approval.svg) | Review | understand and authorize exact current package | package currentness → signed task meaning → documents → explicit sign-off; technical identity on demand |
| [Implementation](implementation.svg) | Operational master/detail | scan approved tasks and act on canonical current task | only persistent master/detail workflow step; task-scoped manual execution; blocker/validation/evidence detail |
| [Complete](complete.svg) | Terminal result | final governed outcome first | substantive result/evidence before history; no automatic reopen; follow-up governed separately |

## Work-type variation reference

[Work type variants](work-type-variants.svg) records the content/authority differences that must remain visible while using the same product visual language:

- **Change** — requested outcome → proven current state/absence → changed behavior → delivery;
- **Defect** — observed/expected/preserved behavior → reproduction/root cause → corrected behavior + preservation → delivery;
- **Investigation** — question → evidence-backed conclusion → Complete;
- **Audit** — target/criteria → evidence/findings/verdict → Complete.

Investigation and Audit do not acquire empty Requirements / Solution design / Implementation plan authority merely to fill the workspace.

## Completion check

The pack was reviewed against the four Phase 2A closure gates and the UI-specific findings from Phase 1.

| Check | Result |
|---|---|
| every user-facing workflow step has a reference | PASS |
| Change / Defect / Investigation / Audit progression is represented without flattening semantics | PASS |
| current task / current attention is visually dominant | PASS |
| reply-capable interaction contains visible substantive agent context | PASS |
| OpenCode operational activity is visible but cannot replace conversation | PASS |
| pre-signoff screens avoid a permanent second navigation rail | PASS |
| Readiness is verdict/finding-first and cannot sign off | PASS |
| Approval is authorization-first and does not expose technical package identity as primary | PASS |
| Implementation alone uses persistent master/detail | PASS |
| Complete is result-first rather than an artifact index | PASS |
| technical metadata is disclosure-only | PASS |
| no unreached downstream document is shown as current authority | PASS |
| reference content does not invent runtime history/conformance/approval | PASS |
| visuals use the reviewed Order visual character and stable lifecycle rail | PASS |

## Rejected exploratory-image elements

The earlier generated concept images were useful for direction but were **not** stored as the final reference because they contained generated details that contradicted or exceeded the facts.

The reviewed pack removes/rejects:

- the generated persistent left application sidebar inside the Workbench; the canonical shell has no additional persistent outer navigation axis;
- a Readiness-review sign-off button; sign-off belongs only to Approval;
- Work request references to downstream Requirements/Solution design that do not yet legitimately exist;
- generated deployment/production claims in Complete that were not established by the functional model;
- generated owner/estimate fields in Implementation plan that are not required by Phase 2A;
- raw paths/hashes/ids as ordinary primary information;
- event-feed presentation as a substitute for the human/agent conversation;
- persistent pre-signoff material/history sidebars that would change geometry with collection size.

## Solution-design handoff

Phase 2B may choose the exact Astryx primitive composition and technical projection required to realize these references. It must preserve the semantics and visual hierarchy above without introducing a parallel state model, DTO/view-model family, browser workflow store, or feature-local visual system.

The references therefore answer **what the screen must communicate and look/feel like**; Solution design answers **how the existing canonical data, lifecycle policy, OpenCode integration and Astryx primitives realize it**.
