# Order Workbench 0.5.0 visual reference pack

**Status:** Reviewed derived visual reference set — application-wide Phase 2A UX/UI baseline  
**Scope:** every application/workflow/material/confirmation surface identified by the completed Phase 1 `SURF-*` registry, plus materially distinct interaction/state grammars  
**Authority:** derived visual reference only; semantic authority remains with the canonical owners below

These SVGs are reproducible design references for the 0.5.0 application. They are not runtime screenshots and they are not a second product specification.

If a visual conflicts with canonical authority, the authority wins and the SVG must be corrected.

## Evidence rule — no fabricated product state

Permanent references follow this rule:

1. **Repository-backed value where one exists.**  
   Example: the Queue reference uses the actual repository WorkItems/titles/kinds; Work request/Research/Requirements references use the actual linked Change material.
2. **Canonical typed/template field name where no runtime value exists.**  
   Example: Proposal review shows `ARTIFACT_PROPOSAL_CREATED.targetPath/rationale/unifiedDiff`; Approval task detail shows `SignedTaskDefinition` fields.
3. **Canonical state pattern where the reference demonstrates a condition.**  
   Example: PROCESSING / open-for-continuation / required-input dialogue states come directly from the closed interaction algebra.
4. **Never invent lifecycle history or business evidence.**  
   The pack does not invent Runs, agent conclusions, proposals, findings, signed tasks, evidence resources, approvals, deployment claims, validation results or terminal outcomes.

Each schematic SVG is visibly marked as a **Reference composition** or **Reference state sheet** and must not be interpreted as persisted runtime evidence.

## Governing source basis

The reference pack is derived from and checked against:

- `GW-DOC-WORKBENCH-UX-V2`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- `GW-DOC-WORK-LIFECYCLE-V1`;
- `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- `GW-DOC-INSTALLATION-READINESS-V1`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`;
- `GW-DOC-WORKBENCH-THEME-V1`;
- parent Audit `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`, especially `application-interaction-map.md`, `workflow-state-audit.md`, `opencode-interaction-audit.md`, `document-material-maturity-audit.md`, `certification-evidence-map.md`, and `research.md`;
- linked Change `work_2778105b-d919-4fcd-91e7-dd9b23812aac/requirements.md`.

## Canonical visual invariants

Workbench workflow surfaces use:

```text
application toolbar
work-item identity row
workflow rail
current-attention / current-task region
primary interaction surface
[explicit Context only when opened]
```

The references preserve:

- completed lifecycle step = success/green plus non-color completion mark;
- current lifecycle step = Order blue plus semantic current indication;
- unreached lifecycle step = neutral;
- one compact stable WorkItem identity row;
- one current-attention owner;
- flat, neutral-first, low-chrome presentation;
- deep navy / Order-blue identity;
- border/spacing hierarchy rather than decorative card-dashboard styling;
- technical identity on demand;
- one primary command per current task;
- no persistent second pre-signoff navigation rail;
- supporting material subordinate to current work;
- human/agent dialogue distinct from workflow events and operational activity;
- Implementation as the only persistent workflow master/detail geometry.

## Complete audited surface coverage

Every Phase 1 surface from `application-interaction-map.md §8` maps to a repository reference.

| SURF id | Reference |
|---|---|
| `SURF-APP-001` | [Queue/application shell](queue.svg), [application notices/states](application-notices-states.svg), [installation readiness](installation-readiness.svg), [theme parity](theme-parity.svg) |
| `SURF-QUEUE-001` | [Queue](queue.svg), [queue states](queue-states.svg) |
| `SURF-CREATE-001` | [Create WorkItem](create-work-item.svg), [linked remediation variant](create-linked-remediation.svg) |
| `SURF-SET-001` | [Repositories settings](settings-repositories.svg), [OpenCode settings](settings-opencode.svg), [Model/runtime settings](settings-model.svg) |
| `SURF-SET-REPO-001` | [Repositories settings](settings-repositories.svg) |
| `SURF-SET-REPO-ADD-001` | [Add repository](settings-repository-add.svg) |
| `SURF-SET-REPO-MOVE-001` | [Move WorkItem documents](settings-repository-move.svg) |
| `SURF-SET-OC-001` | [OpenCode accounts](settings-opencode.svg) |
| `SURF-SET-OC-RENAME-001` | [Rename OpenCode account](settings-opencode-rename.svg) |
| `SURF-SET-OC-ADD-001` | [Add OpenCode account](settings-opencode-add.svg) |
| `SURF-SET-OC-LOGIN-001` | [OpenCode sign-in](settings-opencode-login.svg), [login terminal states](settings-opencode-login-states.svg) |
| `SURF-SET-MODEL-001` | [Model & runtime](settings-model.svg) |
| `SURF-WI-001` | [WorkItem shell controls](workitem-shell-controls.svg), all workflow-step references, [current-attention states](current-attention-states.svg) |
| `SURF-WI-CONTEXT-001` | [Technical Context](workitem-context.svg) |
| `SURF-STEP-WR-001` | [Work request](work-request.svg) |
| `SURF-STEP-R1-001` | [Research](research.svg), [dialogue states](dialogue-states.svg) |
| `SURF-STEP-R2-001` | [Requirements](requirements.svg), [dialogue states](dialogue-states.svg) |
| `SURF-STEP-DESIGN-001` | [Solution design](solution-design.svg), [dialogue states](dialogue-states.svg) |
| `SURF-STEP-PLAN-001` | [Implementation plan](implementation-plan.svg), [dialogue states](dialogue-states.svg) |
| `SURF-STEP-R3-001` | [Readiness review](readiness-review.svg), [dialogue states](dialogue-states.svg) for legitimate input interaction |
| `SURF-STEP-APPROVAL-001` | [Approval](approval.svg) |
| `SURF-STEP-EXEC-001` | [Implementation](implementation.svg), [Implementation states](implementation-states.svg) |
| `SURF-STEP-COMPLETE-001` | [Complete](complete.svg), [Audit/Investigation linked-remediation branch](complete-linked-remediation.svg) |
| `SURF-MAT-SOURCE-001` | [Document authoring](document-authoring.svg), [document states](document-states.svg) |
| `SURF-MAT-DOC-001` | [Document authoring](document-authoring.svg), [document states](document-states.svg) |
| `SURF-MAT-DOC-RO-001` | [Read-only document](document-readonly.svg), [document states](document-states.svg) |
| `SURF-MAT-ACTIVITY-001` | [Research dialogue/activity](research.svg), [dialogue states](dialogue-states.svg) |
| `SURF-MAT-PROPOSAL-001` | [Proposal review](proposal-review.svg), [proposal states](proposal-states.svg) |
| `SURF-MAT-EVIDENCE-001` | [Evidence viewer](evidence-viewer.svg) |
| `SURF-MAT-APPROVAL-TASK-001` | [Approval task detail](approval-task-detail.svg) |
| `SURF-MAT-EXEC-TASK-001` | [Implementation](implementation.svg), [Implementation states](implementation-states.svg) |
| `SURF-CONF-DIRTY-DEST-001` | [Safety confirmations](safety-confirmations.svg) |
| `SURF-CONF-DIRTY-MATERIAL-001` | [Safety confirmations](safety-confirmations.svg) |
| `SURF-CONF-ARCHIVE-001` | [Safety confirmations](safety-confirmations.svg) |
| `SURF-CONF-DOC-GIT-001` | [Safety confirmations](safety-confirmations.svg) |
| `SURF-CONF-REPO-DISCONNECT-001` | [Safety confirmations](safety-confirmations.svg) |
| `SURF-CONF-OC-REMOVE-001` | [Safety confirmations](safety-confirmations.svg) |

## Workflow-step reference set

| Step | Reference | Information source used |
|---|---|---|
| Work request | [work-request.svg](work-request.svg) | actual `work_2778105b.../work-request.md` |
| Research | [research.svg](research.svg) | actual Research artifact plus canonical RunEvent/dialogue fields; no invented transcript |
| Requirements | [requirements.svg](requirements.svg) | actual reviewed `requirements.md` |
| Solution design | [solution-design.svg](solution-design.svg) | canonical `delivery-design-v1` template; no Solution-design artifact is claimed to exist yet |
| Implementation plan | [implementation-plan.svg](implementation-plan.svg) | canonical `delivery-plan-v1` template; no Plan artifact is claimed for this WorkItem |
| Readiness review | [readiness-review.svg](readiness-review.svg) | canonical `delivery-r3-v1` template and Review hierarchy; no verdict/finding is fabricated |
| Approval | [approval.svg](approval.svg) | canonical `SignoffPackage` / signed-task behavior; no package is fabricated |
| Implementation | [implementation.svg](implementation.svg) | canonical `ExecutionTask[]`, Run and validation projection fields; no task list is fabricated |
| Complete | [complete.svg](complete.svg) | canonical terminal-result branches; no outcome/deployment is fabricated |

## Work-type progression

[work-type-variants.svg](work-type-variants.svg) records the canonical information differences across:

- Change;
- Defect;
- Investigation;
- Audit.

The visual system is shared. The work-type-specific input/Research semantics and downstream obligations are not flattened.

## State and interaction reference sheets

- [Current-attention precedence](current-attention-states.svg)
- [Dialogue interaction states](dialogue-states.svg)
- [Proposal states](proposal-states.svg)
- [Document mutation states](document-states.svg)
- [Implementation task states](implementation-states.svg)
- [Queue states](queue-states.svg)
- [Application notices/shared states](application-notices-states.svg)
- [Installation readiness](installation-readiness.svg)
- [Create linked remediation](create-linked-remediation.svg)
- [Audit/Investigation linked-remediation terminal branch](complete-linked-remediation.svg)
- [OpenCode login-attempt terminal states](settings-opencode-login-states.svg)
- [Safety/confirmation surfaces](safety-confirmations.svg)
- [Responsive composition](responsive-composition.svg)
- [Theme parity](theme-parity.svg)

## Rejected exploratory-image elements

The earlier image-generation concepts were useful only to establish direction. They are not the repository reference standard.

The reviewed SVG pack rejects:

- a generated persistent application/sidebar axis inside the Workbench;
- a Readiness sign-off action;
- invented downstream Work request authority;
- invented agent dialogue;
- invented proposal/evidence/findings/tasks/validation;
- invented deployment/production results;
- generated owner/estimate fields not required by accepted behavior;
- primary raw ids/paths/hashes;
- an event feed as a substitute for human/agent dialogue;
- content-count-driven pre-signoff sidebars;
- any UI element whose field/action cannot be traced to a canonical contract, template, current renderer, or accepted Phase 2A requirement.

## Completion criteria

The application-wide reference baseline is complete only while all of the following remain true:

| Check | Result |
|---|---|
| every Phase 1 `SURF-*` id maps to a reference | PASS |
| every user-facing workflow step maps to a reference | PASS |
| supporting Queue/Create/Settings/Context/Evidence services map to references | PASS |
| proposal/document/dialogue/execution materially distinct state grammars are represented | PASS |
| all confirmation/dirty/destructive overlays are represented | PASS |
| responsive recomposition is represented | PASS |
| light/dark semantic parity is represented | PASS |
| references use repository-backed values or canonical field/template/state labels only | PASS |
| no reference claims unobserved lifecycle/runtime facts | PASS |

## Solution-design handoff

Phase 2B chooses the exact Astryx primitive composition and technical projection required to realize these references.

It must not use the SVGs to invent a second state model, DTO/view-model family, browser workflow store, event bus, parallel document owner or feature-local theme. The SVGs constrain **presentation, hierarchy and interaction composition**; canonical P3/P4/P6 owners constrain semantics and technical ownership.
