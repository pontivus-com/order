<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Order 0.6.0 integrated technical solution design

## Design basis and authority boundary

This DESIGN consumes the post-governance, exhaustive R2 functional package at commit `981944c902b52911fbf86c6b9ca439cd0e9dc406`: `requirements.md` blob `92cad7491a89e3c498826ae697b37d00e7568532`, current canonical P1-P6 owners and the current R1 findings only. G3 is mechanically closed over 112/112 manifest-canonical stable P3 dispositions plus the separately owned non-ID clause delta.

Current implementation, UI, tests, 0.5.0 release behavior, prior DESIGN and the former T1 plan are evidence only. Reuse below is authorized only when an existing canonical owner/capability independently fits the fresh requirements.

No DTO, OOP/service layer, shadow lifecycle/source/readiness/task/proposal model, new persistence table, new public API family, dependency upgrade or feature-local UI system is introduced.

## Requirement-to-solution map

| Concerns/findings | Technical realization |
|---|---|
| C01/C21 product language | No lifecycle/runtime-state change. Correct README and terminal-result product-facing projection only; canonical P2/P3 semantics are already corrected. |
| C22-F01 | Extend pure `src/core/governance.ts` to resolve same-layer precedence and P1 default/override/extension/gate bindings from validated manifest inputs; shell expands patterns, daemon consumes the pure resolved projection before provider context. |
| C02-F01/F02 | Correct existing Create renderer: **Concerns** label; linked remediation renders fixed parent project context. No command/schema change. |
| C02-F03/C04-F01 | In `src/daemon/work-item-source.ts`, factor one new-source planner that returns the existing REGISTERED `QueuePlan`; both create and repository discovery persist through existing `applyPlan`. Delete direct create-path WorkItem construction/store. |
| C03-F01 | Move include-archived query/toggle ownership into `app.tsx`; run one project/search derivation over the selected canonical dataset; `WorkItemQueue` receives filtered rows/toggle callback. |
| C04-F02 | Reuse `DocumentationGitStatus.paths` / `changedGitPaths`; confirmation displays exact paths/states before the existing commit command. |
| C05-F01 | Keep current-attention resolver canonical and independent from explicit inspected material; step summary renders compact exact attention owner/action when selected material differs. No new browser state model. |
| C06-F01 | Keep input events; classify STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT as decision inputs whose reply is non-authoritative. Stage completion requires a later adopted proposal after the latest such reply. |
| C07-F01/C08-F01 | Extend the existing artifact proposal/adoption owner to admitted GOVERNANCE proposals: R2 only current P2/P3 paths, DESIGN only current P4-P6 paths, exact layer/path/base hash, current re-resolution, one pending proposal grammar. |
| C09-F01 | Strengthen the existing SignedTaskBlock schema/validator with non-vacuity constraints; no second task representation. |
| C10-F01 | `ReadinessWorkspace` derives the dominant verdict from typed R3 completion outcome; material maturity remains separate. |
| C11-F01/F02 | Approval projection shows Ready for sign-off + Current first; canonical Approval schema trims/requires nonblank `approvedBy`. |
| C12-F01 | Add one BUILDER-only typed `GATE_CHECKPOINT_REQUESTED` event; coordinator executes signed gate via existing validation effect owner and records existing gate result/evidence; provider shell remains denied. |
| C13/C14/C15/C17 | No technical delta beyond integration with the corrections above; existing canonical owners already realize fresh R2 behavior. |
| C16-F01 | Recompose Settings with exact roots/endpoint/model-list source under Technical details except active configuration tasks. |
| C18-F01 | Workbench-owned composer region focuses once per new required-input event id; no private Astryx DOM/API dependence and no polling focus theft. |
| C19-F01 | Add exhaustive renderer-matrix certification to `tests/certification.test.ts`, because `tests/architecture.test.ts` is signed architecture-gate material and remains immutable to implementation. |
| C20-F02/F03 | Extend existing browser certification for complete scenario 41 kind/Research/downstream matrix and representative System/Light/Dark cross-application semantic-role parity. |
| C21-F03/F05 | README follows current Product Identity; terminal CANDIDATE_DONE primary label is **Verified candidate**, with explicit mapping rather than enum prettification. |

## Existing capability/reuse and behavior to replace

Reuse:
- current `ProjectManifestSchema`, refs/precedence/governance grammar and project-pattern matcher;
- existing immutable ArtifactRef/GOVERNANCE role/context hashing/freshness graph;
- current artifact proposal/adoption event family and exact patch application;
- current HumanInput events;
- current SignedTaskBlock/ExecutionTask/Approval/Run/RunEvent types;
- current `runVerificationGate`, V0-V7 validation and gate evidence owner;
- existing QueuePlan/applyPlan source reconciliation;
- existing Workbench current-attention/material primitives, Git-status projection, R3 RunEvents, SignoffPackage, Settings queries, WorkOutcome;
- pinned Astryx 0.7.13 public Chat surface.

Replace/delete:
- create-path direct `WorkItemSchema.parse + storeWorkItem` registration branch;
- queue-local include-archived dataset ownership that bypasses app filtering;
- raw “Concern IDs” ordinary label and editable remediation Project selector;
- generic documentation-Git confirmation without exact path list;
- current-attention/material resolution that lets explicit selection hide the exact current owner;
- treatment of durable-decision reply as sufficient continuation without an adopted authority artifact;
- lifecycle-only proposal admission for R2/DESIGN;
- vacuous SignedTaskBlock acceptance;
- whitespace-only canonical approval identity;
- impossible builder instruction to execute shell gates directly;
- Readiness maturity-as-verdict, Approval missing readiness, Settings primary technical identity, Candidate done copy;
- incomplete renderer/scenario/theme certification.

Necessary new concepts are limited to:
1. a transient pure resolved-authority projection;
2. one new typed BUILDER checkpoint-request event.

Neither is a new domain state model.

## Technical architecture and data/control flow

### D1 — project authority resolution

```text
validated ProjectManifest
+ shell-expanded authority paths
+ validated literal precedence paths
        |
        v
core pure authority resolver
  - selected P1-P6
  - explicit same-layer precedence relation
  - inherited/override/extension bindings
  - resolved fitness gates
        |
        v
daemon authority context
        |
        +-> immutable current ArtifactRefs / manifest bytes
        +-> ordered resolved provider context
        +-> conformance/sign-off dependency closure
```

Semantic contradiction detection remains a stage responsibility because document meaning is semantic. The core does not infer which documents contradict. It supplies the exact explicit precedence/override relation so the stage cannot invent one.

### D2 — permanent authority proposal/adoption

```text
R2 or DESIGN provider
 -> ARTIFACT_PROPOSAL_CREATED
 -> pure target admission
      lifecycle proposal
      OR GOVERNANCE existing current authority path/layer allowed for this stage
 -> one pending proposal review
 -> explicit user ADOPT
 -> re-resolve target + base hash
 -> exact patch
 -> immutable ArtifactRef
 -> existing dependency invalidation/context refresh
 -> continue/re-conform owning stage
```

R2 target layers: P2/P3. DESIGN target layers: P4/P5/P6. No P1 mutation and no new permanent file through this path.

### D3 — durable-decision input

```text
HUMAN_INPUT_REQUESTED durable category
 -> HUMAN_INPUT_RECEIVED (decision input only)
 -> provider prepares lifecycle/permanent authority proposal
 -> explicit adoption
 -> later STAGE_COMPLETED permitted
```

A durable-category answer with no later adopted proposal cannot reach stage completion. Information/evidence categories are unchanged.

### D4 — signed checkpoint

```text
BUILDER provider turn
 -> GATE_CHECKPOINT_REQUESTED(gateId)
 -> coordinator validates signed task + current manifest + freshness
 -> existing runVerificationGate(current builder workspace)
 -> GATE_PASSED / GATE_FAILED + evidence
 -> same Run/session next provider turn
```

No checkpoint result substitutes for V3/V5/V7.

### D5 — source admission

```text
UI creation -> create source -> read/validate exact source --+
                                                            |
repository scan -> read/validate exact source --------------+-> one new-source QueuePlan -> applyPlan
```

The existing `origin = CREATED | DISCOVERED` value remains provenance only.

### D6 — queue and presentation

```text
active query + include-archived query
        |
app-selected canonical dataset
        |
project filter -> search filter
        |
WorkItemQueue rows
```

All other UI corrections remain projections of existing typed state.

## Canonical owner / affected boundaries

Permanent technical semantics changed only at:
- `GW-DOC-TECHNICAL-ARCHITECTURE` — authority resolution/module boundary;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE` — current attention, durable input presentation/focus, renderer certification;
- `GW-DOC-EXECUTION-CONTROL-PLANE` — in-task checkpoint orchestration;
- `GW-DOC-CANONICAL-CONTRACTS` — proposal, task, approval and checkpoint exact contracts.

No P5 ADR is required: these decisions refine the existing declared architecture and do not introduce an alternative architecture.

## Exact expected implementation surface

Production:
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

Verification:
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`

Delivery metadata:
- `CHANGELOG.md`

Explicitly not implementation surface:
- `tests/architecture.test.ts` (architecture gate material);
- `pontivus-order.toml`;
- `package.json`, `bun.lock`;
- `.github/**`;
- P1-P6 documentation changed by DESIGN itself;
- persistence schema/migrations;
- HTTP API files unless implementation proves an already-designed browser transport is missing. Such discovery returns to DESIGN/PLAN; it is not inferred by the builder.

## Contract/state changes

- no WorkStage, WorkItem status/outcome, ArtifactRole, task state, persistence or HTTP shape change;
- SignedTaskBlock existing fields become non-vacuous under the exact constraints in P6;
- Approval `approvedBy` canonical string normalization becomes trim + nonblank;
- RunEventPayload gains one `GATE_CHECKPOINT_REQUESTED { gateId }` variant;
- artifact proposals gain exact non-lifecycle admission for current P2/P3 in R2 and P4-P6 in DESIGN; same event shape/state;
- HumanInputCategory shape unchanged; completion admission consumes category history.

## Decisions, rationale and rejected alternatives

1. **Pure resolved-authority projection, not provider inference.** Rejected: rely on manifest text in prompt. That reproduces C22.
2. **Reuse artifact proposal/adoption.** Rejected: P2/P3/P4/P6-specific proposal DTOs or direct agent writes.
3. **Durable decision input requires later adoption.** Rejected: chat transcript as authority or a new decision database.
4. **One checkpoint request event.** Rejected: grant shell/execute, parse natural-language requests, or create a second verification subsystem.
5. **Strengthen SignedTaskBlock.** Rejected: parallel PLAN task model.
6. **App owns queue dataset/filtering.** Rejected: duplicate filters in queue component.
7. **Focus Workbench-owned region.** Rejected: query pinned Astryx private textarea/contenteditable implementation or invent a non-existent public focus prop.
8. **Supplement certification outside architecture material.** Rejected: allow the signed implementation task to edit `tests/architecture.test.ts`, which would let it mutate a verification source that authorizes itself.

## Compatibility and preservation

Only canonical semantic invariants are preserved. No incidental 0.5.0 UI/code behavior is a compatibility target.

Historical schema pins, approvals and WorkItems remain interpretable under their pinned semantics. No data migration or API compatibility layer is required by this DESIGN.

## Failure/recovery behavior

- unresolved authority source/ref/precedence/override binding -> stage precondition/conformance block, never provider choice;
- semantic same-layer contradiction with no explicit precedence -> `CONTRADICTORY_AUTHORITY`;
- invalid permanent proposal target/layer/base hash -> reject before mutation;
- durable-decision answer without later adopted proposal -> stage completion rejected;
- vacuous signed package -> PLAN/R3 mechanical conformance failure;
- blank approval identity -> sign-off request rejected before persistence;
- unsigned/unresolved checkpoint gate -> provider result rejected;
- checkpoint gate failure -> correction only inside signed scope or upstream block; no candidate success;
- source/queue/UI failures retain existing canonical recovery owners;
- focus effect failure cannot alter workflow authority; browser certification covers intended behavior.

## Verification obligations

Before G4:
- DESIGN-A01..A11 pair audits PASS;
- H3 PASS;
- all C01-C22 DESIGN columns TECHNICAL_CLOSED;
- no material technical decision delegated to PLAN.

P7 must require:
- typecheck;
- architecture (read-only material);
- full test;
- build;
- browser;
- dependency-lock;
- exact tests for authority resolution/precedence/override, proposal target admission, durable-decision completion, signed-task non-vacuity, approval identity, checkpoint request/result, source singularity, queue filtering, Git path review, current attention, Readiness/Approval/Settings/result copy, focus-once, renderer coverage, scenario 41 and theme/component parity.

## Open technical questions

NONE.

Any implementation discovery requiring another production module, public transport/persistence shape, dependency, verification-material mutation or changed semantic owner is a DESIGN/PLAN stop, not builder discretion.
