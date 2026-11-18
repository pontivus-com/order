<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Plan authority and modular package

This file is the deterministic canonical P7 lifecycle artifact for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. It remains the sole carrier of the canonical `order-tasks` block required by the lifecycle contract.

The exhaustive implementation specification is modularized under `implementation-plan/`. Those files are not parallel plans: they are subordinate phase components of this one PLAN and acquire P7 meaning only through the exact blob manifest below. A current phase file whose blob differs from this manifest makes the PLAN package non-current and blocks R3/sign-off until this root artifact is regenerated.

This PLAN consumes the exhaustive R2 functional package `requirements.md`, the regenerated requirement-level DESIGN `solution-design.md`, the resolved P1-P6 authority graph and the current WorkItem source. Current implementation/UI/tests/0.5.0/history remain evidence only.

## Exact phase-component manifest

| Component | Exact Git blob |
|---|---|
| `implementation-plan/00-governance.md` | `501912214a2e58f433cb7e1e4bb25be92bc3e26a` |
| `implementation-plan/01-a01-lifecycle-product.md` | `4aac2e36f01d03631cec2654647a0b6d0f5a9f53` |
| `implementation-plan/02-a02-governance-intake.md` | `9c4b1b1abf14c7cfd5495c65d9849d27bb714804` |
| `implementation-plan/03-a03-queue-source.md` | `655ecefda7ba57e040ceb8982de118e0fd6cc77c` |
| `implementation-plan/04-a04-workbench-research.md` | `d68868090575b8dbed4099de93cbed58ac60cffa` |
| `implementation-plan/05-a05-requirements-design.md` | `331667dde4ecaf965bf46dcebb9653e9e63422a1` |
| `implementation-plan/06-a06-plan-readiness.md` | `88e0228ada9fd1acd4627203e84ddd90cb2a3edd` |
| `implementation-plan/07-a07-approval-execution.md` | `269d5c51d6bec3f8a9636b705441c33a91e2880f` |
| `implementation-plan/08-a08-complete-materials.md` | `597296ca51904323fd181f5d6c6e80e6b5f96c77` |
| `implementation-plan/09-a09-provider-settings.md` | `d5c15589f939b883fa2cf02a3c28a210c0b5a9f1` |
| `implementation-plan/10-a10-recovery-accessibility.md` | `c0bdc7fdd261c4dd0850919b845636cd83415418` |
| `implementation-plan/11-a11-component-certification.md` | `89b8d728101d36b65a3467a6afae1aee89e3c652` |
| `implementation-plan/12-action-catalog.md` | `124cf4deb441888532e1083e4aad556e0ca37053` |
| `implementation-plan/13-verification-closeout.md` | `0374716b657e3a3b87687721c3e84fdfd3848886` |

R3 must verify every listed current path resolves to the exact blob above. The phase components contain no independent lifecycle status and no second `order-tasks` block.

## T1 topology

There is exactly one cumulative execution task, **T1**. The eleven A01-A11 phase files are ordered implementation phases inside T1, not independently signed ExecutionTasks. This preserves the canonical single-Approval-baseline execution model.

Detailed action definitions are owned by `implementation-plan/12-action-catalog.md`; verification/checkpoint allocation is owned by `implementation-plan/13-verification-closeout.md`.

Implementation order:

1. A01 lifecycle/product
2. A02 governance/intake
3. A03 queue/source
4. A04 Workbench/Research
5. A05 Requirements/DESIGN authority mutation
6. A06 PLAN/R3
7. A07 Approval/Execution
8. A08 Complete/materials
9. A09 Provider/Settings
10. A10 Recovery/accessibility
11. A11 component/certification
12. shared regression closure and candidate closeout

A phase may reuse an action defined earlier/later only as explicitly referenced in its requirement rows. Architecture-feedback checkpoints A-E remain mandatory at the boundaries defined in the verification component.

## Exhaustive traceability invariant

The package is incomplete unless all of the following are true:

- all **112** stable P3 requirements in R2 occur exactly once across phase files 01-11;
- every package-local/non-stable R2 consequence has a phase row;
- every requirement/consequence maps to one or more `SDxx` DESIGN solutions;
- every technical/verification delta maps to one or more `IAxx` actions;
- every positive no-code disposition has explicit final verification and an upstream return rule if disproved;
- every IA action maps upward to accepted DESIGN/R2 authority;
- no material P1-P6 choice is left to implementation.

## Exact signed implementation surface

### Production
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/execution.ts`
- `src/daemon/stage.ts`
- `src/daemon/validation.ts`
- `src/daemon/work-item-source.ts`
- `ui/src/ActivityComposer.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/app.tsx`
- `ui/src/workbench-presentation.ts`

### Verification
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`

### Delivery metadata
- `CHANGELOG.md`

### Explicit exclusions
- `.github/**`
- `AGENTS.md`
- `bun.lock`
- `docs/**`
- `package.json`
- `pontivus-order.toml`
- `src/shell/**`
- `src/daemon/server.ts`
- `tests/architecture.test.ts`
- `ui/src/http.ts`
- `ui/src/query-keys.ts`
- `ui/src/theme.css`

Discovery of a materially required excluded/new surface is a stop and return to DESIGN/PLAN. The signed file list must never force duplicate responsibility.

## Minimum-change and architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no-OOP/no-DTO, authority-before-inference and minimum change remain binding. Existing owners/capabilities are reused only where DESIGN positively selected them. No compatibility shim, shadow model, service/repository/controller family, new persistence/API family, dependency, lifecycle state, provider capability or feature-local UI/theme system is authorized.

New runtime concepts remain limited to the two already-designed concepts:

1. one transient pure resolved-authority projection;
2. one typed `GATE_CHECKPOINT_REQUESTED { gateId }` BUILDER event.

## Completion evidence

T1 is complete only when every phase row and every IA action has its required positive/negative proof, the exact final changed surface is authorized, Checkpoints A-E are satisfied, the six signed logical gates pass on the final candidate, and V0-V7 complete with fresh V4/V5/V6 evidence.

Public PR merge/release/version bump remains outside T1.

## Open questions

Implementation-blocking questions: **NONE in the signed design; PLAN is currently under fresh revalidation after requirement-level traceability regeneration.**
Architecture questions: **NONE in the signed design.**
Authority conflicts: **NONE in R2/DESIGN; any newly discovered conflict returns upstream.**

## Canonical order-tasks block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the complete fresh Order 0.6.0 authority-driven corrective design as one cumulative candidate, executing every requirement-level technical delta and verification delta in the signed modular PLAN package while preserving each positive no-code disposition and introducing no parallel semantic owner, DTO, lifecycle state, persistence/API family, dependency or implementation-derived product semantics.",
      "dependsOn": [],
      "scope": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/execution.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/work-item-source.ts",
        "ui/src/ActivityComposer.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/app.tsx",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts",
        "CHANGELOG.md"
      ],
      "exclusions": [
        ".github/**",
        "AGENTS.md",
        "bun.lock",
        "docs/**",
        "package.json",
        "pontivus-order.toml",
        "src/shell/**",
        "src/daemon/server.ts",
        "tests/architecture.test.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/theme.css"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-DOC-PROJECT-GOVERNANCE-INTEGRATION",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1",
        "GW-DOC-SYSTEM-BRIEF-V1"
      ],
      "changeSurface": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/execution.ts",
        "src/daemon/stage.ts",
        "src/daemon/validation.ts",
        "src/daemon/work-item-source.ts",
        "ui/src/ActivityComposer.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/app.tsx",
        "ui/src/workbench-presentation.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/browser.spec.ts",
        "tests/workbench-presentation.test.ts",
        "CHANGELOG.md"
      ],
      "gateIds": [
        "architecture",
        "browser",
        "build",
        "dependency-lock",
        "test",
        "typecheck"
      ],
      "authorityRefs": [
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-MINIMUM-CHANGE",
        "GW-P1-AUTHORITY-BEFORE-INFERENCE",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V2"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "ui",
        "verification"
      ]
    }
  ]
}
```
