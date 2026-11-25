<!-- Order template: change-plan-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-CANONICAL-CONTRACTS-V2, GW-DOC-SPECIFICATION-STANDARD-V2 -->

# Order 0.6.0 implementation plan

## Canonical PLAN authority

This file is the single deterministic P7 artifact and sole normative execution authority for WorkItem `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21`. The directory `implementation-plan/` is only its maintainable authoring decomposition. The complete source content is compiled below and this root becomes executable only after the canonical campaign gates and operator sign-off bind these exact bytes.

This PLAN is regenerated for C19-F09/C20-F11/G-F38 from current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`, corrected P4 Workbench `8fccbe031436a9eb54da8ae493b614e94cc957b1` and corrected DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`. Historical PLAN structure, implementation/UI/tests, prior 68-path forecasts, RZ16 acceptance and prior sign-off are evidence only.

This PLAN carries no campaign gate state and no implementation authority by itself. Campaign §17A/§18 exclusively govern current gates, bounded authorization and sign-off; these exact PLAN bytes remain a candidate until those controls establish the required authorization.

## Current Workbench implementation plan

The governing correction is the missing semantic component/composition layer between P3 information semantics and feature renderers. Permanent component responsibilities/APIs live only in P4; SD21/F6B owns the 0.6.0 realization; `implementation-plan/12-action-catalog.md` owns every IA mutation/disposition. No other PLAN source may redefine those responsibilities or actions.

Bounded IA27 realizes only the compile-closed shell/Context + Section/Facts foundation slice and keeps generic workflow owners required-absent; IA28 accepts that bounded slice in Queue/Create. After explicit sign-off, IA27 completes the all-caller ResourceRow/ResourceList cutover. Priority-0 then executes IA29 Document first, IA31 Proposal/Readiness/Approval Review second, IA30 productive stages third, and the HUX-09 same-scope reference-fidelity closure across those owners fourth; IA32-IA34 are blocked until HUX-01 through HUX-09 are explicitly accepted. IA32 then rebuilds Implementation, IA33 creates/cuts over Result for Complete/Evidence, and IA34 rebuilds Settings. No compatibility API bridges phases.

IA20/IA26 certify component API/consumer/physical-SoC closure in addition to the existing 37-SURF schema/UX/visual evidence. Current implementation may survive only where the catalog records a fresh `CONFORMING_NO_EDIT` or bounded disposition; no prior PASS is inherited.

## Exact modular source manifest

| Source component | Git blob |
|---|---|
| `implementation-plan/00-governance.md` | `2e0d3a53286b7d1695b9c03790b36875a470d119` |
| `implementation-plan/01-a01-lifecycle-product.md` | `faa288baf93c3a718578f513dadd6e1a9b8c2e41` |
| `implementation-plan/02-a02-governance-intake.md` | `2d2c36ae4b44ad8db982cbda6fc681e710579cc8` |
| `implementation-plan/03-a03-queue-source.md` | `445b78a56193b81220acb0ef7d33a08758925740` |
| `implementation-plan/04-a04-workbench-research.md` | `7ec1fd05fafaf46db54084fb69009176aa4537cb` |
| `implementation-plan/05-a05-requirements-design.md` | `5971caf8a6866b53945cfb4b85086adebb8f96cb` |
| `implementation-plan/06-a06-plan-readiness.md` | `1a4e4e830ac6649d3bc41c50959b2a55ef025dc4` |
| `implementation-plan/07-a07-approval-execution.md` | `0be72fd9db0f62741197287e56e49b5dbcf52034` |
| `implementation-plan/08-a08-complete-materials.md` | `ae51148c9692db79916b0cfbe94e4fc4f89ef528` |
| `implementation-plan/09-a09-provider-settings.md` | `2efdef951cee6d5955392c57f80f1d924537a75b` |
| `implementation-plan/10-a10-recovery-accessibility.md` | `1ee8fdc4d2aa45e684d444428c054b42c14ec574` |
| `implementation-plan/11-a11-component-certification.md` | `538fc145f3058277d74496939aa15777317eecd5` |
| `implementation-plan/12-action-catalog.md` | `6a416b20686e315acff0c78f8a2ec38ee11b0828` |
| `implementation-plan/13-verification-closeout.md` | `9431acc1e3c30b6334d7630c0e4f363c5bbc59d3` |

A source component hash mismatch makes PLAN non-current until this root is regenerated. Directory files contain no `order-tasks` block and own no independent lifecycle state or executable action definition.

## Semantic coverage versus execution ownership

A01-A11 are exhaustive semantic coverage phases, not executable tasks. IA01-IA34 in `12-action-catalog.md` are the single action definitions. Phase files retain requirement/atom-specific consequence and proof mappings only. `13-verification-closeout.md` owns checkpoints/proof only.

## Candidate execution scope

T1 is one cumulative task candidate. Its hard `scope` is exactly the same **76 repository paths** as `changeSurface`; it becomes signed/executable only after fresh campaign closure. The eight C19-F09 additions are seven semantic primitives plus `DocumentChangeView.tsx`. A newly required path outside this set returns to DESIGN/PLAN.

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "T1",
      "objective": "Implement the corrected authority-driven Order 0.6.0 candidate only after fresh G4-G6/sign-off. Consume P4/SD21/F6B as closed component authority. The bounded IA27 realizes the compile-closed shell/Context foundation and IA28 accepts it in Queue/Create; post-signoff IA27 completes the ResourceRow/ResourceList cutover. Priority-0 remediation then executes IA29 reconstructs Document composition, IA31 atomically cuts over Proposal/Readiness/Approval Review with DocumentChangeView, then IA30 reconstructs productive stages excluding Proposal Review without redesigning the accepted Review owner; HUX-09 then requires a same-scope reference-fidelity closure across the exact operator-rejected IA29-IA31 surfaces before later screen families resume. IA32 rebuilds Implementation, IA33 rebuilds Complete around WorkbenchResult, and IA34 rebuilds Settings. IA20-IA23/IA26 certify physical SoC, all 37 governed surfaces, closed component ownership and exact-candidate rendered acceptance. No prior RZ16/IA27-IA34 PASS, compatibility path or implementation-derived design is inherited.",
      "dependsOn": [],
      "scope": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/setup.ts",
        "ui/src/primitives/WorkbenchAttention.tsx",
        "ui/src/primitives/WorkbenchConfirmation.tsx",
        "ui/src/primitives/WorkbenchContextPanel.tsx",
        "ui/src/primitives/WorkbenchDocument.tsx",
        "ui/src/primitives/WorkbenchFacts.tsx",
        "ui/src/primitives/WorkbenchDialogue.tsx",
        "ui/src/primitives/WorkbenchForm.tsx",
        "ui/src/primitives/WorkbenchIdentity.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchMasterDetail.tsx",
        "ui/src/primitives/WorkbenchRail.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/primitives/WorkbenchResourceList.tsx",
        "ui/src/primitives/WorkbenchResult.tsx",
        "ui/src/primitives/WorkbenchReview.tsx",
        "ui/src/primitives/WorkbenchReviewSection.tsx",
        "ui/src/primitives/WorkbenchReviewVerdict.tsx",
        "ui/src/primitives/WorkbenchSection.tsx",
        "ui/src/primitives/WorkbenchSectionHeader.tsx",
        "ui/src/primitives/WorkbenchSelector.tsx",
        "ui/src/primitives/WorkbenchSettingsLayout.tsx",
        "ui/src/primitives/WorkbenchSurface.tsx",
        "ui/src/primitives/WorkbenchTable.tsx",
        "ui/src/primitives/WorkbenchTaskPanel.tsx",
        "ui/src/primitives/WorkbenchTimeline.tsx",
        "ui/src/primitives/WorkbenchToolbar.tsx",
        "ui/src/primitives/WorkbenchState.tsx",
        "ui/src/primitives/WorkbenchUtilityLink.tsx",
        "ui/src/primitives/WorkbenchAppShell.tsx",
        "ui/src/primitives/WorkbenchWorkItemShell.tsx",
        "ui/src/primitives/workbench-responsive.ts",
        "ui/src/app.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/DocumentChangeView.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/installer.test.ts",
        "tests/opencode.test.ts",
        "tests/workbench-presentation.test.ts",
        ".github/workflows/ci.yml",
        "CHANGELOG.md"
      ],
      "exclusions": [
        "src/daemon/execution.ts",
        "src/daemon/validation.ts",
        "src/daemon/server.ts",
        "src/shell/config.ts",
        "src/shell/file-write.ts",
        "src/shell/opencode.ts",
        "src/shell/process.ts",
        "src/shell/project-config.ts",
        "src/shell/project.ts",
        "src/shell/repository.ts",
        "src/shell/runtime.ts",
        "src/shell/sqlite.ts",
        "src/shell/work-item-source.ts",
        "ui/src/primitives/WorkbenchAction.tsx",
        "ui/src/primitives/WorkbenchDisclosure.tsx",
        "ui/src/primitives/WorkbenchField.tsx",
        "ui/src/primitives/WorkbenchIcon.tsx",
        "ui/src/primitives/WorkbenchNotice.tsx",
        "ui/src/primitives/WorkbenchStatus.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/workbench-presentation.ts",
        "ui/src/http.ts",
        "ui/src/query-keys.ts",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/theme.ts",
        "ui/src/main.tsx",
        "tests/architecture.test.ts"
      ],
      "acceptanceRefs": [
        "GW-DOC-WORK-LIFECYCLE-V1",
        "GW-DOC-LIFECYCLE-CONTEXT-V2",
        "GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V2",
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE",
        "GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP",
        "GW-DOC-WORKBENCH-UX-V2",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-VALIDATION-STANDARD-V1",
        "GW-FR-214-STABLE-WORKBENCH-GEOMETRY",
        "GW-FR-217-PRIMARY-INFORMATION-ECONOMY",
        "GW-FR-218-SPACE-CLASS-CONSISTENCY",
        "GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY",
        "GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1",
        "GW-DOC-SPECIFICATION-STANDARD-V2",
        "GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION"
      ],
      "changeSurface": [
        "README.md",
        "src/core/contracts.ts",
        "src/core/execution.ts",
        "src/core/governance.ts",
        "src/core/lifecycle.ts",
        "src/daemon/authority.ts",
        "src/daemon/stage.ts",
        "src/daemon/work-item-source.ts",
        "src/shell/setup.ts",
        "ui/src/primitives/WorkbenchAttention.tsx",
        "ui/src/primitives/WorkbenchConfirmation.tsx",
        "ui/src/primitives/WorkbenchContextPanel.tsx",
        "ui/src/primitives/WorkbenchDocument.tsx",
        "ui/src/primitives/WorkbenchFacts.tsx",
        "ui/src/primitives/WorkbenchDialogue.tsx",
        "ui/src/primitives/WorkbenchForm.tsx",
        "ui/src/primitives/WorkbenchIdentity.tsx",
        "ui/src/primitives/WorkbenchLayout.tsx",
        "ui/src/primitives/WorkbenchMasterDetail.tsx",
        "ui/src/primitives/WorkbenchRail.tsx",
        "ui/src/primitives/WorkbenchResourceRow.tsx",
        "ui/src/primitives/WorkbenchResourceList.tsx",
        "ui/src/primitives/WorkbenchResult.tsx",
        "ui/src/primitives/WorkbenchReview.tsx",
        "ui/src/primitives/WorkbenchReviewSection.tsx",
        "ui/src/primitives/WorkbenchReviewVerdict.tsx",
        "ui/src/primitives/WorkbenchSection.tsx",
        "ui/src/primitives/WorkbenchSectionHeader.tsx",
        "ui/src/primitives/WorkbenchSelector.tsx",
        "ui/src/primitives/WorkbenchSettingsLayout.tsx",
        "ui/src/primitives/WorkbenchSurface.tsx",
        "ui/src/primitives/WorkbenchTable.tsx",
        "ui/src/primitives/WorkbenchTaskPanel.tsx",
        "ui/src/primitives/WorkbenchTimeline.tsx",
        "ui/src/primitives/WorkbenchToolbar.tsx",
        "ui/src/primitives/WorkbenchState.tsx",
        "ui/src/primitives/WorkbenchUtilityLink.tsx",
        "ui/src/primitives/WorkbenchAppShell.tsx",
        "ui/src/primitives/WorkbenchWorkItemShell.tsx",
        "ui/src/primitives/workbench-responsive.ts",
        "ui/src/app.tsx",
        "ui/src/WorkItemWorkspace.tsx",
        "ui/src/WorkItemIdentityRow.tsx",
        "ui/src/WorkflowRail.tsx",
        "ui/src/WorkflowStepFrame.tsx",
        "ui/src/styles.css",
        "ui/src/theme.css",
        "ui/src/OpenCodeAccountControl.tsx",
        "ui/src/WorkItemQueue.tsx",
        "ui/src/CreateWorkItem.tsx",
        "ui/src/DocumentWorkspace.tsx",
        "ui/src/DocumentChangeView.tsx",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/PreSignoffStageWorkspace.tsx",
        "ui/src/ActivityWorkspace.tsx",
        "ui/src/ActivityComposer.tsx",
        "ui/src/WorkflowMaterialSelector.tsx",
        "ui/src/ProposalReview.tsx",
        "ui/src/RunEventTimeline.tsx",
        "ui/src/ReadinessWorkspace.tsx",
        "ui/src/SignoffReview.tsx",
        "ui/src/ExecutionWorkspace.tsx",
        "ui/src/TerminalResult.tsx",
        "ui/src/EvidenceViewer.tsx",
        "ui/src/WorkItemContext.tsx",
        "ui/src/SettingsWorkspace.tsx",
        "ui/src/OpenCodeAccountSettings.tsx",
        "tests/browser.spec.ts",
        "tests/certification.test.ts",
        "tests/core.test.ts",
        "tests/daemon.test.ts",
        "tests/installer.test.ts",
        "tests/opencode.test.ts",
        "tests/workbench-presentation.test.ts",
        ".github/workflows/ci.yml",
        "CHANGELOG.md"
      ],
      "gateIds": [
        "dependency-lock",
        "typecheck",
        "architecture",
        "test",
        "build",
        "browser"
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
        "GW-DOC-CANONICAL-CONTRACTS-V2",
        "GW-DOC-OPENCODE-INTEGRATION-V1",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2",
        "GW-DOC-WORKBENCH-THEME-V1",
        "GW-DOC-INSTALLATION-READINESS-V1",
        "GW-DOC-EXECUTION-CONTROL-PLANE-V1",
        "GW-DOC-PRODUCT-IDENTITY-V1"
      ],
      "concernIds": [
        "core",
        "daemon",
        "foundation",
        "shell",
        "verification",
        "ui"
      ]
    }
  ]
}
```

### Positively retained UI capability

The retained atomic adapters remain `WorkbenchAction.tsx`, `WorkbenchDisclosure.tsx`, `WorkbenchField.tsx`, `WorkbenchIcon.tsx`, `WorkbenchNotice.tsx`, `WorkbenchStatus.tsx`. Their retention does not authorize region/topology ownership. Retained specialist/infrastructure helpers remain outside T1 as listed in the task exclusions.

## Exact candidate implementation surface

The exact cumulative mutable forecast is T1's single `changeSurface`: **76 unique paths**.

### Non-UI production (9)
- `README.md`
- `src/core/contracts.ts`
- `src/core/execution.ts`
- `src/core/governance.ts`
- `src/core/lifecycle.ts`
- `src/daemon/authority.ts`
- `src/daemon/stage.ts`
- `src/daemon/work-item-source.ts`
- `src/shell/setup.ts`

### UI foundation / semantic-component / shell surface (38)
- `ui/src/primitives/WorkbenchAttention.tsx`
- `ui/src/primitives/WorkbenchConfirmation.tsx`
- `ui/src/primitives/WorkbenchContextPanel.tsx`
- `ui/src/primitives/WorkbenchDocument.tsx`
- `ui/src/primitives/WorkbenchFacts.tsx`
- `ui/src/primitives/WorkbenchDialogue.tsx`
- `ui/src/primitives/WorkbenchForm.tsx`
- `ui/src/primitives/WorkbenchIdentity.tsx`
- `ui/src/primitives/WorkbenchLayout.tsx`
- `ui/src/primitives/WorkbenchMasterDetail.tsx`
- `ui/src/primitives/WorkbenchRail.tsx`
- `ui/src/primitives/WorkbenchResourceRow.tsx`
- `ui/src/primitives/WorkbenchResourceList.tsx`
- `ui/src/primitives/WorkbenchResult.tsx`
- `ui/src/primitives/WorkbenchReview.tsx`
- `ui/src/primitives/WorkbenchReviewSection.tsx`
- `ui/src/primitives/WorkbenchReviewVerdict.tsx`
- `ui/src/primitives/WorkbenchSection.tsx`
- `ui/src/primitives/WorkbenchSectionHeader.tsx`
- `ui/src/primitives/WorkbenchSelector.tsx`
- `ui/src/primitives/WorkbenchSettingsLayout.tsx`
- `ui/src/primitives/WorkbenchSurface.tsx`
- `ui/src/primitives/WorkbenchTable.tsx`
- `ui/src/primitives/WorkbenchTaskPanel.tsx`
- `ui/src/primitives/WorkbenchTimeline.tsx`
- `ui/src/primitives/WorkbenchToolbar.tsx`
- `ui/src/primitives/WorkbenchState.tsx`
- `ui/src/primitives/WorkbenchUtilityLink.tsx`
- `ui/src/primitives/WorkbenchAppShell.tsx`
- `ui/src/primitives/WorkbenchWorkItemShell.tsx`
- `ui/src/primitives/workbench-responsive.ts`
- `ui/src/app.tsx`
- `ui/src/WorkItemWorkspace.tsx`
- `ui/src/WorkItemIdentityRow.tsx`
- `ui/src/WorkflowRail.tsx`
- `ui/src/WorkflowStepFrame.tsx`
- `ui/src/styles.css`
- `ui/src/theme.css`

### UI material-screen owners (20)
- `ui/src/OpenCodeAccountControl.tsx`
- `ui/src/WorkItemQueue.tsx`
- `ui/src/CreateWorkItem.tsx`
- `ui/src/DocumentWorkspace.tsx`
- `ui/src/DocumentChangeView.tsx`
- `ui/src/MarkdownEditor.tsx`
- `ui/src/PreSignoffStageWorkspace.tsx`
- `ui/src/ActivityWorkspace.tsx`
- `ui/src/ActivityComposer.tsx`
- `ui/src/WorkflowMaterialSelector.tsx`
- `ui/src/ProposalReview.tsx`
- `ui/src/RunEventTimeline.tsx`
- `ui/src/ReadinessWorkspace.tsx`
- `ui/src/SignoffReview.tsx`
- `ui/src/ExecutionWorkspace.tsx`
- `ui/src/TerminalResult.tsx`
- `ui/src/EvidenceViewer.tsx`
- `ui/src/WorkItemContext.tsx`
- `ui/src/SettingsWorkspace.tsx`
- `ui/src/OpenCodeAccountSettings.tsx`

### Verification (7)
- `tests/browser.spec.ts`
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/installer.test.ts`
- `tests/opencode.test.ts`
- `tests/workbench-presentation.test.ts`

### Permanent verification infrastructure (1)
- `.github/workflows/ci.yml`

### Delivery metadata (1)
- `CHANGELOG.md`

## Exhaustive traceability invariants

- exactly one T1 candidate and exactly one IA01-IA34 definition owner;
- every stable/package-local obligation maps to DESIGN and one IA/no-code proof owner;
- P4 alone owns permanent component responsibilities/APIs; SD21/F6B alone owns the 0.6.0 realization; PLAN does not derive either;
- the immutable cumulative forecast is exactly the 76-path `scope == changeSurface`;
- all seven required-new semantic primitives plus `DocumentChangeView.tsx` are explicit forecast members;
- bounded IA27 executes only the compile-closed F6B shell/Context slice; IA28 accepts that slice; post-signoff IA27 and IA29/IA31/IA33 perform the exact consumer-atomic Resource/Document/Review/Result cutovers; remaining phases execute their exact renderer dispositions;
- the IA27-IA34 rendered-face ledger remains exactly 37 unique `SURF-*` rows;
- IA20/IA26 prove component API closure, consumer allowlists, physical SoC, absence of feature-local substitute grammar and the existing semantic/rendered contracts;
- no compatibility alias/wrapper/hidden old DOM/dual path, second shell/responsive/Context owner, DTO/view-model/state family or implementation-derived product semantics is authorized.

## Compiled modular phase specification

### Compiled component: `implementation-plan/00-governance.md`

#### 0.6.0 modular PLAN governance

This directory is the maintainable authoring decomposition of the **single** canonical P7 artifact at `../implementation-plan.md`. The root PLAN compiles these files in full and lists their exact Git blob SHAs. Directory files own no independent lifecycle state, Approval material or executable task block.

This decomposition is revalidated under C19-F09/C20-F11 after the prior G4-G6 closure was invalidated. Historical PLAN structure, current implementation/UI/tests, prior releases, prior RZ16 acceptance and prior task forecasts are evidence only. They do not define 0.6.0 task scope, preservation targets, compatibility targets, fallback behavior or regression contracts.

##### Exact upstream package

- R1 `research.md`: `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`.
- R2 `requirements.md`: `b44b65a15af709751c6a1d8f0a566285b6e8bcce`.
- DESIGN `solution-design.md`: `69858deb399556d5c9404fc49452885b583ff1e6` — owns the closed 0.6.0 datum→semantic-component→composition mapping, F6B physical component realization and 76-path forecast.
- Corrected P3 `GW-DOC-INSTALLATION-READINESS`: `9c2ec83a9552b7583f90e91080c014df4d6870df`.
- P3 `GW-DOC-WORKBENCH-UX-V2`: `64184232833b59a9e6db5e1a28b841f48b3217cd` — §11.4A/§12/§13/§14 own semantic information classes, state-is-not-interface behavior, direct primary interaction composition, no generic workflow-material selector, continuous Dialogue semantics, Terminal-result primacy, singular technical inspection, task anatomy and composition invariants.
- P3 `GW-DOC-MARKDOWN-WORKBENCH-V1`: `da89bd08e4f78f353d7b3062758e9d78e21375b2` — §17.4 owns one compact Markdown editor-control region, overflow-before-wrap formatting and control→canvas adjacency.
- P4 `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`: `8fccbe031436a9eb54da8ae493b614e94cc957b1` — sole permanent owner of structural + semantic Workbench component responsibilities/APIs, consumer boundaries, composition laws and remediation disposition semantics.
- P4 `GW-DOC-WORKBENCH-THEME-V1`: `03dfc6be3600a1128b5639d011f4c0159d3497dd` — owns the corrected semantic-disclosure, technical-inspection and task-panel visual roles.
- P6 `GW-DOC-CANONICAL-CONTRACTS-V2`: `71f829cff8824db18194689eccdec83da6f5d19f`.
- SD13 checkpoint and SD10 scope/forecast/V4-V6 realization are consumed only because current DESIGN positively proves those canonical capabilities; T1 does not reimplement them.

##### Traceability law

Every stable P3 requirement and every package-local atomic obligation follows:

```text
canonical P3 / package consequence
 -> exact current R1 evidence
 -> exact current R2 consequence
 -> exact DESIGN disposition
 -> one IA implementation owner, one DESIGN-positive-reuse proof owner, or POSITIVE_NO_CHANGE
 -> exact verification owner
```

A positive no-change or baseline-reuse disposition is an implementation instruction: **do not edit for that obligation** and revalidate the named evidence/proof. If execution disproves it, return upstream.

##### Execution ownership

`12-action-catalog.md` is the **single definition owner** for every IA01-IA34 implementation/proof action. Semantic phase files may map requirements/atoms to an IA and state their local consequence or completion evidence, but they must not restate that IA's mutation procedure, disposition table or API design. `13-verification-closeout.md` owns checkpoints/proof only and likewise references the catalog.

This PLAN carries no implementation authority by itself. Current campaign gate state, bounded authorization and sign-off are owned only by campaign §17A/§18. These bytes remain a candidate until those registers establish the required gates and explicit authorization; any bounded pre-sign-off grant must bind the exact current P4/DESIGN/PLAN package.

For the Workbench tranche, SD21/F6B already closes every component responsibility/API and consumer mapping. Physical breaking cutover is consumer-atomic: bounded IA27 realizes only the compile-closed shell/Context + Section/Facts slice; IA28 accepts that bounded slice in Queue/Create; after explicit sign-off IA27 completes the all-caller ResourceRow/ResourceList cutover; IA29/IA31/IA33 atomically cut over Document/Review/Result with their complete consumer sets. IA30 excludes Proposal Review so WorkbenchReview changes only once, in IA31 with Proposal/Readiness/Approval together. No phase derives component architecture and IA26 remains terminal exact-candidate acceptance.

##### Candidate scope and forecast law
##### Signed scope and forecast law

The canonical PLAN contains exactly one cumulative execution-task **candidate**. It becomes signed/executable only after the campaign-required gates and operator sign-off bind these exact bytes. The candidate uses:

- the exact same **76 repository paths** for `scope` and `changeSurface`; these include the eight authority-required new semantic component/specialist paths in DESIGN F6B; no directory-wide `src/**`, `ui/src/**` or `tests/**` mutation envelope is authorized;
- explicit `exclusions` for DESIGN-positive-reuse paths, positively retained atomic UI adapters and approved non-screen helpers that must remain unchanged;
- IA01-IA34 as ordered internal implementation/proof phases. IA phase ownership constrains what a phase may change but is not a second P6 task/scope representation.

The baseline V4/V5/V6 forecast-variance capability remains canonical execution machinery, but the 76-path candidate already includes every currently required physical decomposition owner. A newly required path outside this set returns to DESIGN/PLAN; implementation may not suppress a required component split merely to preserve the forecast.
##### Architecture constraints

FCIS, SoC, DRY/canonical ownership, strict typing, no OOP/DTO/service/repository/controller families, authority-before-inference and minimum change remain binding. Current implementation/tests are evidence only.

For SD02, manifest authority selection is the reachable source set; IA02 must project only the lifecycle-applicable stable/versioned material selected by the pinned schema/stage/explicit refs. A retained historical source may remain reachable without entering current v2 context by raw layer membership.

Published `change-v1`/`defect-v1` schema semantics remain immutable. SD10 may add only the current-v2 mechanical non-vacuity admission and matching PLAN/R3 authoring instruction while reusing the one existing SignedTaskBlock shape/parser. Material task sufficiency remains owned by PLAN semantic conformance and independent R3.

##### Workbench presentation realization law

The authority-driven target is current P4 plus SD21-SD30/F6B. Current UI bytes and historical IA27-IA34 results are evidence only; no prior `CONFORMING_NO_EDIT`, RZ16 acceptance or screen reconstruction status is inherited.

The complete Workbench mutation/disposition procedure is defined once in `12-action-catalog.md` IA27-IA34. In summary only: bounded IA27 realizes the compile-closed shell/Context slice; IA28 accepts only that slice; post-signoff IA27 performs the all-caller ResourceRow/ResourceList cutover; IA29/IA31/IA33 own Document/Review/Result breaking cutovers; the remaining phases revalidate their owned renderers and execute their catalogued dispositions. Phase files cannot redefine these decisions or introduce compatibility paths.

`ui/src/styles.css` / `ui/src/theme.css` remain shared physical owners. Bounded IA27 owns shell/Context/Section/Facts foundation selectors; later component cutover checkpoints may add their canonical ResourceList/Document/Review/Result treatments and remove only the corresponding migrated feature selectors. No phase may recreate shared semantic grammar locally.

No IA27-IA34 phase may resurrect a required-absent generic owner, widen a corrected component API for compatibility, introduce DTO/view-model/browser-state families, duplicate shell/responsive/Context ownership, or treat current JSX/SVG shape as product authority.

##### Visual-language → foundation execution law
##### Visual-language → foundation execution law

SD21's realization ledger is **DESIGN authority for this package**, not implementation-derived evidence and not a runtime schema. IA27 consumes it and may realize a recurring visual/composition role only through the P4 owner, canonical theme/token role and the exact SD21/F6B consumer mapping.

After bounded IA27 readiness PASS, IA28 consumes the shell/Context candidate in the first real screen family. IA28 accepts/finalizes only the bounded foundation slice it exercises. Shared breaking semantic APIs are frozen separately when their complete consumer sets cut over at post-signoff IA27 (ResourceList/Row), IA29 (Document), IA31 (Review) and IA33 (Result). Screen phases may not add or locally vary recurring color/token meaning, typography/spacing/density scales, control/button/action treatments, status/notice chrome, progressive-disclosure lanes, overlay mechanics, shell/region hierarchy, foundation geometry or breakpoint/responsive grammar. A screen that appears to require a new recurring role returns to DESIGN/PLAN rather than solving it locally.

##### Information visibility / disclosure execution law

Every UI phase consumes the canonical P3 §11.4A classification and P4 §8.12A technical ownership. The implementation may not infer visibility from whichever fields are available in a query or from historical UI/SVG layout.

For every rendered datum/action in IA27-IA34, DESIGN already records semantic datum/action, P3 class, semantic component owner, exact section/collection position, default visibility, authorized inspection owner, responsive order and negative rendering rules. Implementation records only authority-conformance evidence. Physical-owner dispositions are owned once by `12-action-catalog.md`; they are not reclassified in phase files or verification prose.

The implementation rule is exact:

- Primary information is visible without entering Context/Technical details;
- Supporting/Operational information remains subordinate and cannot create another persistent navigation axis;
- Technical information is absent from the ordinary surface and appears only through the authorized WorkItem Context, Settings-diagnostics, Evidence or confirmation owner;
- Diagnostic/console detail is absent from ordinary UX and appears only through an already-authorized Context/Settings-diagnostics/Evidence inspection surface where legitimate inspection requires it;
- when a technical condition blocks progress, only its human-readable meaning/consequence/action is promoted; raw code/path/hash/session/payload remains technical/evidence-owned;
- exact mutation-consent facts may become decision-primary only inside the owning confirmation;
- responsive recomposition never changes classification/default visibility.

Presence-only browser assertions are nonconforming when they force technical/diagnostic text into ordinary UI. Every affected test is rewritten to prove both default-hidden and authorized post-disclosure visibility.

##### Stop conditions

Return to DESIGN/PLAN before editing when execution requires a new semantic owner, public contract, state meaning, persistence/transport/effect boundary, dependency direction or external dependency, validation contract, provider capability, verification authority, authorized behavior, or any path outside signed scope/exclusions.

Because the current T1 candidate sets `scope` equal to the same exact 76-path `changeSurface`, any newly required physical path outside that set returns upstream for DESIGN/PLAN correction. The eight new semantic component/specialist files are already governed members of the candidate and are not variance.

### Compiled component: `implementation-plan/01-a01-lifecycle-product.md`

#### A01 — Lifecycle and product identity

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C01 + C21.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O03`, `C01-O05`, `C01-O08` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O01`, `C01-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C01-O03`, `C01-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **5**.

##### Corrected-upstream authority no-code dispositions

These rows carry material R2 consequences that are already corrected in canonical authority. They authorize **no T1 edit** but remain explicit execution/proof instructions so the correction cannot disappear from the package.

| Trace key | DESIGN disposition | Execution owner | Exact current authority | Required proof |
|---|---|---|---|---|
| `A01-NC01` — C01 verified-terminal success/no-code distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1`, §8 | Recheck exact authority identity plus R1 C01-O06/O13/O14 under V4; any contradiction returns to R2/DESIGN. |
| `A01-NC02` — C01 `GW-P2-CONTROLLED-WORK` cross-reference | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-WORK-LIFECYCLE` blob `013bc1297c3d167b776e115f428517b7cedbea57`, §7 → System Brief §9 | Recheck exact authority identity plus R1 C01-O14 under V4; do not edit runtime behavior for this documentation correction. |
| `A01-NC03` — C21 canonical product-language/commit boundary | `ALREADY_CORRECTED_NO_CODE` | NONE — no additional P2 edit in T1 | `GW-DOC-PRODUCT-IDENTITY` blob `f45ee2ea00cf91c5b861c59d3d19f72b3e39611f` | Recheck exact authority identity and corrected C21-F01/F02/F04 semantics under V4; IA19 changes only the still-violating README/terminal projections. |
| `A01-NC04` — C01 WorkItem-stage vs execution-subflow distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1` | Recheck C01-F01/C01-O03/O05/O08 and exact authority identity under V4; no new lifecycle/state mutation. |
| `A01-NC05` — C01 lifecycle-context stage/role/work-kind distinction | `ALREADY_CORRECTED_NO_CODE` | NONE — no T1 edit | `GW-DOC-LIFECYCLE-CONTEXT` blob `4ce2b49b9eb57e60ddd2b1e3664fdd4e11cbbbc7` | Recheck C01-F02/X-C01-C22-01 and exact authority identity under V4; no new stage/role/work-kind state. |

No-code rows in phase: **5**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | `SD01`, `SD27` | `IA19`, `IA33` | — | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim; IA33 owns the rebuilt terminal-result composition. |

Package atoms in phase: **1**.

##### Referenced actions

- **IA19** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA33** — consume the single Complete/Evidence destructive replacement definition for terminal-result composition.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every corrected-upstream no-code row remains byte-current and receives no T1 mutation;
5. every package atom is satisfied by its one execution owner;
6. action-specific exact proof propositions plus `13-verification-closeout.md` pass;
7. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/02-a02-governance-intake.md`

#### A02 — Project governance and WorkItem intake

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C22 + C02.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `C16-O02`, `C16-O05`, `C22-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O02`, `C16-O05`, `C22-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `C02-O01` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O01` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `C02-O02`, `C02-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O02`, `C02-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `C02-O04`, `C02-O05`, `C02-O07` | `MIXED_TECHNICAL_DELTA` | `SD03`, `SD22` | `IA11`, `IA28` | — | Preserve catalog/body/metadata semantics while rebuilding Create onto the canonical Form/configuration composition; verify daemon/browser plus rendered acceptance. |
| `GW-FR-029-NO-IDE-SCOPE` | `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `C02-O07`, `C02-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C02-O07`, `C02-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `C22-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C22-O09` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Prove the reachable authority graph is resolved before provider use and the productive stage materializes only the pinned-schema/stage/explicit-ref applicable stable/versioned subset; retained V1 reachability alone must not inject V1 into current v2 context. Recheck via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **8**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C22-01` | C22-F01/C22-F02 | `SD02` | `IA01`, `IA02` | — | Resolve same-layer precedence/default/override/extension and fitness bindings over the reachable graph, then derive stage materiality from the pinned schema/stage/explicit refs so retained semantic versions remain live by exact versioned ref without leaking into unrelated current-schema context; IA02 owns the production-path proof. |
| `PL-C02-01` | C02-F01 | `SD03`, `SD22` | `IA11`, `IA28` | — | Ordinary Create language is Concerns and the rebuilt Create composition realizes the controlled authoring hierarchy. |
| `PL-C02-02` | C02-F02 | `SD03`, `SD22` | `IA11`, `IA28` | — | Linked remediation project is fixed to parent project and the rebuilt remediation task panel exposes no editable cross-project choice. |
| `PL-C02-03` | C02-F03/C04-F01 | `SD04` | `IA09`, `IA10` | — | Created and discovered sources share one productive admission/persistence owner. |

Package atoms in phase: **4**.

##### Referenced actions

- **IA11** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single Queue/Create resumed-baseline revalidation/remediation definition; C02 owns authoring semantics, not shared primitive implementation.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. SD02 certification is owned by IA02 and proves the productive production path, including stable-current versus explicit-versioned materiality with both retained and current sources selected/reachable, not only the pure helper/daemon unit boundary;
6. action-specific tests plus `13-verification-closeout.md` pass;
7. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/03-a03-queue-source.md`

#### A03 — Queue, source admission and documentation Git

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C03 + C04.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `C04-O01`, `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O01`, `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-014-SOURCE-FRESHNESS` | `C04-O14`, `C02-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O14`, `C02-O12` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `C04-O07`, `C04-O14` | `MIXED_TECHNICAL_DELTA` | `SD04` | `IA09`, `IA10` | — | Recheck `C04-O07`, `C04-O14` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `C03-O04`, `C03-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O04`, `C03-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `C04-O03`, `C04-O08`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03`, `C04-O08`, `C04-O14` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `C04-O01`, `C04-O02` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O01`, `C04-O02` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `C04-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `C04-O04`, `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O04`, `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `C04-O08`, `C04-O10`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O08`, `C04-O10`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `C04-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `DIRECT-FR066` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR066` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `C18-O11`, `DIRECT-FR067` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C18-O11`, `DIRECT-FR067` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `DIRECT-FR068` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR068` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `C05-O07`, `C18-O04`, `C18-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O07`, `C18-O04`, `C18-O11` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `C04-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O05` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `C04-O12`, `C04-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O12`, `C04-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `C04-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O12` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `C03-O06`, `C03-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O06`, `C03-O08` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `C04-O02`, `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O03` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `C04-O02`, `C04-O15` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O02`, `C04-O15` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `C04-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O03` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `C03-O04`, `C04-O14` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C03-O04`, `C04-O14` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **25**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C03-01` | C03-F01 | `SD05`, `SD22` | `IA12`, `IA28` | — | Including archived work expands the candidate set without bypassing project/search filters; IA28 owns the Operational-scan presentation and must keep Queue heading/controls/notices/table inside the scan material with semantic attention absent. |
| `PL-C04-01` | C04-F01 | `SD04` | `IA09`, `IA10` | — | Source-admission owner is singular across creation/discovery. |
| `PL-C04-02` | C04-F02 | `SD06`, `SD23` | `IA13`, `IA29` | — | Documentation-Git confirmation shows the exact governed paths/states before commit inside the rebuilt WorkItem/document composition. |

Package atoms in phase: **3**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA09** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA10** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA12** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA13** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single IA28 definition in `12-action-catalog.md`.
- **IA29** — consume the single IA29 definition in `12-action-catalog.md`.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/04-a04-workbench-research.md`

#### A04 — Workbench current attention and Research input

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C05 + C06.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD29`, `SD30` | `IA27`, `IA29`, `IA26` | — | Re-prove the local Workbench only after IA27 realizes the SD21/F6B semantic component foundation; IA29 proves WorkbenchDocument/Facts/Section composition and IA26 performs global component-ownership plus rendered acceptance. |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `DEPENDENCY_DELTA` | `SD02` | — | `IA01`, `IA02` | Recheck `C06-O02`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15`, `C05-O02`, `C05-O10` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `TECHNICAL_DELTA` | `SD08` | `IA04` | `IA03` | Recheck `C06-O13` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O03`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD23`, `SD24`, `SD26`, `SD29`, `SD30` | `IA27`, `IA29`, `IA30`, `IA32`, `IA26` | — | Bounded IA27 realizes the compile-closed shell/Context + Section/Facts slice and required-absent generic owners; post-signoff IA27 completes the all-caller ResourceRow/ResourceList cutover, while IA29/IA31/IA33 atomically cut over Document/Review/Result with their complete consumer sets. Downstream screens consume only already cut-over canonical geometry/responsive owners. |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `TECHNICAL_DELTA` | `SD21`, `SD22`, `SD23`, `SD24`, `SD25`, `SD26`, `SD27`, `SD28` | `IA27`-`IA34` | — | Canonical state selects the interaction composition; it is not rendered as generic stage/status/material chrome. IA27 removes the generic summary/selector APIs; IA29-IA34 compose only task-relevant Primary/Supporting information and route Technical/Diagnostic identity to its singular owner. |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Rebuild the shared spatial grammar at the closed primitive level with no compatibility adapters; consumers that no longer fit must be rewritten to their canonical interaction class before any screen acceptance. |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C05-O05`, `C05-O06`, `C05-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Delete WorkflowStepFrame/WorkflowStepSummary/WorkflowStepIndex/PrimaryMaterialFrame workflow composition and WorkflowMaterialSelector; direct Document/Dialogue/Review/Evidence/State composition is mandatory, and architecture fitness rejects aliases/wrappers/unauthorized primitive consumers. |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C05-O01`, `C05-O02` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `VERIFICATION_DELTA` | `SD17` | `IA21` | — | Recheck `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **18**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C05-01` | C05-F01 | `SD07`, `SD21`, `SD24` | `IA14`, `IA27`, `IA30` | — | Exact current owner/reason/action remains visible when required, but no generic state tuple is rendered as a current-attention strip. Historical inspection uses at most one human return-to-current-work affordance; productive screens use direct interaction classes. |
| `PL-C06-01` | C06-F01 | `SD08` | `IA04` | `IA03` | Authority-changing input is not sufficient durable authority until a later adopted canonical proposal exists. |

Package atoms in phase: **2**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA01** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA02** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA04** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27** — consume the single IA27 definition in `12-action-catalog.md`.
- **IA29** — consume the single IA29 definition in `12-action-catalog.md`.
- **IA30** — consume the single IA30 definition in `12-action-catalog.md`.
- **IA32** — consume the single IA32 definition in `12-action-catalog.md`.
- **IA26** — consume scope-valid rendered evidence plus explicit three-dimension acceptance; capture generation alone is not PASS.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/05-a05-requirements-design.md`

#### A05 — Requirements and DESIGN authority mutation

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C07 + C08.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `C07-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C07-O04` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **1**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C07-01` | C07-F01 | `SD09` | `IA03` | — | R2 can propose/adopt validated current P2/P3 canonical-owner amendments through the one proposal mechanism. |
| `PL-C08-01` | C08-F01 | `SD09` | `IA03` | — | DESIGN can propose/adopt validated current P4/P5/P6 canonical-owner amendments through the same mechanism. |

Package atoms in phase: **2**.

##### Cross-domain presentation reconstruction dependency

Requirements and Solution design retain their authority/proposal semantics. IA30 fresh-authors the non-Proposal productive-stage presentation against corrected SD24: the governed document is primary without generic workflow summary/material-selector chrome or duplicate outer headings; Dialogue/Evidence replace the primary interaction when canonically selected. Proposal selection remains routed but its `ProposalReview` composition is cut over in IA31 together with every WorkbenchReview consumer, because the Review API cannot change compile-safely in an earlier phase. Existing runtime composition is failure evidence only and supplies no compatibility/preservation target.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA03** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the single non-Proposal productive-stage definition in `12-action-catalog.md`.
- **IA31** — consume the single atomic Proposal/Readiness/Approval Review-cutover definition in `12-action-catalog.md`.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/06-a06-plan-readiness.md`

#### A06 — PLAN contract and R3 readiness

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C09 + C10.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O01`, `C10-O09`, `C10-O10` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C10-O04`, `C01-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `TECHNICAL_DELTA` | `SD11`, `SD25` | `IA16`, `IA31` | — | Typed R3 outcome drives one human verdict inside direct Review. IA31 maps actual findings/return owner into the Review body, does not embed the full R3 Markdown document under Findings, does not duplicate Readiness/verdict headings, print raw `READY_FOR_SIGNOFF`, or expose a generic Readiness-material selector; REQUIRED_INPUT Dialogue replaces Review for that turn. |

Stable rows in phase: **3**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C09-01` | C09-F01 | `SD10` | `IA05` | — | Current-v2 Change/Defect task packages must satisfy P6 §37.4 mechanical non-vacuity through the one schema-aware admission owner while published v1 validation semantics remain unchanged; material task sufficiency remains owned by PLAN semantic conformance and independent R3. |
| `PL-C10-01` | C10-F01 | `SD11`, `SD25` | `IA16`, `IA31` | — | Readiness dominant verdict is the human projection of typed R3 outcome; findings/return owner are mapped once into direct Review, supporting package/history is subordinate, and no generic workflow frame/selector or raw typed enum is ordinary UI. |

Package atoms in phase: **2**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA05** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA30** — consume the single IA30 definition in `12-action-catalog.md`.
- **IA31** — consume the single IA31 definition in `12-action-catalog.md`.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/07-a07-approval-execution.md`

#### A07 — Approval and execution

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C11 + C12.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `C12-O01`, `C12-O02`, `C12-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O01`, `C12-O02`, `C12-O07` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `C12-O12`, `C12-O13`, `C12-O19` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O12`, `C12-O13`, `C12-O19` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `C11-O01`, `C11-O03`, `C12-O20` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C11-O01`, `C11-O03`, `C12-O20` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `C11-O01`, `C11-O02`, `C11-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C11-O01`, `C11-O02`, `C11-O07` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `C04-O15`, `C12-O03`, `C12-O17` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C04-O15`, `C12-O03`, `C12-O17` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `C12-O17`, `C17-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O17`, `C17-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED_TECHNICAL_DELTA` | `SD12`, `SD25` | `IA17`, `IA31` | — | Preserve Approval identity/currentness semantics while rebuilding one direct `WorkbenchReview` composition so readiness/task meaning precede technical identity; no outer `WorkflowStepFrame`/Surface/Attention is permitted; semantic + rendered proof required. |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O17` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `C12-O16` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O16` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **10**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C11-01` | C11-F01 | `SD12`, `SD25` | `IA17`, `IA31` | — | Approval presents readiness/currentness before technical identity and IA31 owns the single direct Review composition without outer workflow framing. |
| `PL-C11-02` | C11-F02 | `SD12` | `IA06` | — | Canonical approval identity is trimmed/nonblank at ingress. |
| `PL-C12-01` | C12-F01 | `SD13` | `IA07` — DESIGN-positive-reuse proof only | — | Signed in-task architecture checkpoint remains coordinator-executable without provider shell permission; T1 consumes the existing capability and does not implement it. |
| `PL-C12-02` | C12-F02 | `SD10` | `IA08` — DESIGN-positive-reuse proof only | — | Signed scope/exclusions remain the hard execution boundary; `changeSurface` is exact forecast evidence; admissible in-scope unforecast decomposition is governed by existing V4/V5/V6 and is not reimplemented by T1. |

Package atoms in phase: **4**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA17** — consume the single implementation definition in `12-action-catalog.md`.
- **IA06** — consume the single implementation definition in `12-action-catalog.md`.
- **IA07** — consume the single baseline-checkpoint proof definition; authorize no checkpoint-protocol production edit.
- **IA08** — consume the single scope/forecast/V4-V6 baseline proof definition; authorize no execution-foundation production edit.
- **IA31** — consume the single IA31 definition in `12-action-catalog.md`.
- **IA32** — consume the single IA32 definition in `12-action-catalog.md`.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/08-a08-complete-materials.md`

#### A08 — Complete and governed materials

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C13 + C14.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | `C13-O01`, `C13-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C13-O01`, `C13-O05` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | `C14-O05`, `C14-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O05`, `C14-O06` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | `C14-O09`, `C05-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O09`, `C05-O09` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `C13-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C13-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | `C14-O05`, `C14-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O05`, `C14-O06` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | `C14-O03`, `C14-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O03`, `C14-O04` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | `C14-O08`, `DIRECT-FR242` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C14-O08`, `DIRECT-FR242` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| — | — | — | — | — | No package-local atom beyond stable-requirement coverage. |

Package atoms in phase: **0**.

##### Cross-domain presentation reconstruction dependency

C13/C14 domain semantics remain stable. Complete and Evidence are rebuilt by SD27/IA33 under PL-C19-02. Complete is one attention-free Terminal-result composition: canonical product-facing outcome/status, substantive result/evidence/resources and permitted linked-remediation action without duplicate outcome/attention copy or architecture/container terminology. Evidence is one attention-free primary inspection composition and replaces rather than nests inside the owning workflow material. WorkItem technical Context is no longer deferred to IA33: SD21/IA27 establishes the singular selection-aware Context inspection owner and the one-primary-composition router before document/productive/review/execution consumers migrate. This phase consumes those owners and does not preserve the current feature-card/layout implementation as a baseline.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA27** — consume the single IA27 definition in `12-action-catalog.md`.
- **IA33** — consume the single IA33 definition in `12-action-catalog.md`.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/09-a09-provider-settings.md`

#### A09 — Provider, installation and Settings

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C15 + C16.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007` | `TECHNICAL_DELTA` | `SD19` | `IA25` | — | Recheck `DIRECT-FR007` via new `tests/installer.test.ts`; existing `tests/order-migration.test.ts` + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `DEPENDENCY_DELTA` | `SD22` | `IA28` | `IA34` owns full account management only | Rebuild the global active-account quick-access renderer with the application shell; prove `SURF-APP-001` active-account visibility/routes to Settings plus tests/browser.spec.ts and tests/certification.test.ts; no second account-management owner |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `C16-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `C16-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O07` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `C16-O09`, `C16-O10`, `C16-F04` | `TECHNICAL_DELTA` | `SD19` | `IA25` | — | Recheck corrected fresh-install readiness via new `tests/installer.test.ts`; retain existing Settings/recovery proof in tests/browser.spec.ts, tests/certification.test.ts and tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `DIRECT-FR080` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `DIRECT-FR080` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `C16-O06`, `DIRECT-FR081` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O06`, `DIRECT-FR081` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `C16-O04`, `DIRECT-FR082` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O04`, `DIRECT-FR082` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `C16-O02`, `C16-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O02`, `C16-O03` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `C16-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O04` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` via tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `C15-O03`, `C15-O04`, `C15-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O03`, `C15-O04`, `C15-O08` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `C15-O12`, `C15-O13` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O12`, `C15-O13` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `C15-O03`, `C15-O04` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O03`, `C15-O04` via tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `C15-O05` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O05`, `C15-O07`, `C15-O11` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `C15-O09`, `C15-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O09`, `C15-O10` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `C15-O01`, `C15-O07`, `C15-O12` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C15-O01`, `C15-O07`, `C15-O12` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **21**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C16-01` | C16-F01 | `SD14`, `SD28` | `IA18`, `IA34` | — | Settings primary hierarchy is operator readiness/meaning/action, with exact technical identity secondary except task-required; IA34 owns the rebuilt Settings/account/configuration presentation. |
| `PL-C16-02` | C16-F02 | `SD19` | `IA25` | — | Fresh productive install cannot succeed with mandatory repository/account/model setup deferred to Settings. |
| `PL-C16-03` | C16-F03 | `SD19` | `IA25` | `PRE_T1_P6_CORRECTION_DONE` | P6 must preserve incomplete-v4 recovery capability while forbidding productive installer success at that state. |

Package atoms in phase: **3**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA25** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA28** — consume the single IA28 definition in `12-action-catalog.md`.
- **IA34** — consume the single IA34 definition in `12-action-catalog.md`.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/10-a10-recovery-accessibility.md`

#### A10 — Recovery, current attention and accessibility

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C17 + C18.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O15`, `C22-O06` via tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED_TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O02`, `C17-O05`, `C17-O09` via tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O04`, `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `TECHNICAL_DELTA` | `SD07` | `IA14` | — | Recheck `C17-O05` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O07` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD29`, `SD30` | `IA27`-`IA34`, `IA26` | — | Preserve semantic continuity through the single foundation responsive owner while every IA28-IA34 renderer is freshly revalidated against the new semantic component set; feature-local breakpoint-specific section/review/resource topology is forbidden and every domain receives rendered responsive proof. |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C17-O08` via tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C18-01` | C18-F01 | `SD15` | `IA15` | — | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. |

Package atoms in phase: **1**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA14** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the single IA27-IA34 definitions in `12-action-catalog.md`; this phase owns no duplicate renderer/component implementation procedure.
- **IA26** — consume the exact-candidate responsive rendered acceptance owner.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/11-a11-component-certification.md`

#### A11 — Component/theme consistency and certification

**Role:** semantic coverage phase inside the single 0.6.0 P7 package.
**Concerns:** C19 + C20.
**Upstream:** current R1 `e37ef7d7b54f6c344274d4dfb71a3992f92271a4`; current R2 `b44b65a15af709751c6a1d8f0a566285b6e8bcce`; current DESIGN `69858deb399556d5c9404fc49452885b583ff1e6`.

##### Stable requirement execution dispositions

| Requirement | R1 evidence | DESIGN disposition | Solution(s) | Execution owner | Consumer dependency | Required proof |
|---|---|---|---|---|---|---|
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` via tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `POSITIVE_NO_CHANGE` | — | NONE — no implementation mutation; authority-backed realization already satisfied | — | Recheck `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` via tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103`, `C20-F04` | `VERIFICATION_DELTA` | `SD20` | `IA23` | — | Permanently prove the actual OpenCode 2.2.6 process/session boundary through `tests/opencode.test.ts` and `.github/workflows/ci.yml`, using exact isolated `opencode-drive@2.4.1` + `effect@4.0.1` deterministic model simulation; retain existing daemon/certification fake-provider fixtures as complementary proof and explicitly exclude remote-provider/OAuth/model-quality claims + V4/V5/V6 requirement-specific semantic review |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18`, `SD30` | `IA15`, `IA20`, `IA21`, `IA22`, `IA26` | — | Permanent certification proves required absence of generic workflow frame/material-selector APIs, closed primitive consumer allowlists, no compatibility/deprecated/dual paths, direct interaction-class ownership, continuous Dialogue semantics, explicit capture scope and independent row-level schema/UX/visual acceptance. Evidence generation success alone cannot satisfy IA26. |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12`, `C19-F03`, `C19-F04`, `C19-F05` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | SD21/F6B remains the closed semantic-component design. Bounded IA27 realizes only the compile-closed shell/Context + Section/Facts slice and required-absent generic owners; post-signoff IA27 atomically cuts over ResourceRow/ResourceList across all callers; IA29/IA31/IA33 cut over Document/Review/Result with complete consumer sets. IA28-IA34 realize their exact renderer dispositions. Compatibility adapters remain forbidden and current bytes are evidence only. |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `TECHNICAL_DELTA` | `SD21`-`SD29` | `IA27`-`IA34` | — | Equivalent roles resolve through one closed primitive API with an explicit production-consumer allowlist. A consumer that cannot fit is rewritten to the correct interaction class; no wrapper/alias/adapter may make a superseded composition fit. |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD21`, `SD29`, `SD30` | `IA27`, `IA28`-`IA34`, `IA26` | — | Root theme preference semantics remain; the corrected semantic component foundation consumes the same canonical theme roles and every affected renderer is freshly revalidated. Parity is re-proved through semantic + rendered evidence with no feature-local component styling grammar. |

Stable rows in phase: **7**.

##### Package-local atomic obligations

| Atom | Finding | Solution | Execution owner | Consumer dependency | Required consequence |
|---|---|---|---|---|---|
| `PL-C19-01` | C19-F01 | `SD16` | `IA20` | — | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. |
| `PL-C19-02` | C19-F02/C19-F03/C19-F04/C19-F05/C19-F06/C19-F07/C19-F08/C19-F09 | `SD21`-`SD29` | `IA27`-`IA34` | — | Consume the SD21/F6B semantic component architecture through the one IA27-IA34 catalog. Required-new/decompose/destructive/absent dispositions are explicit there; every affected renderer is revalidated and feature-local substitute grammar is removed. Current bytes never become preservation authority. |
| `PL-C20-01` | C20-F02 | `SD17` | `IA21` | — | Permanent browser certification proves complete four-kind Research/downstream scenario 41. |
| `PL-C20-02` | C20-F03 | `SD18` | `IA22` | — | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. |
| `PL-C20-03` | C20-F05/C20-F06/C20-F07/C20-F08/C20-F09/C20-F10/C20-F11 | `SD30` | `IA26` | — | IA26 proves the 37-SURF rendered union plus semantic-component API/consumer/physical-SoC closure. Evidence rows retain explicit governed scope and separate schema_information/ux_interaction/visual_ui verdicts; a green capture job alone is not acceptance. |

Package atoms in phase: **5**.

##### Referenced actions

Action mutation/disposition semantics are owned only by `12-action-catalog.md`; the bullets below are dependency/traceability references, not alternate IA definitions.

- **IA15** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA20** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA21** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA22** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA16** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA17** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA18** — consume the single definition in `12-action-catalog.md`; this phase does not redefine it.
- **IA27**-**IA34** — consume the single IA27-IA34 definitions in `12-action-catalog.md`; this phase owns no duplicate renderer/component implementation procedure.
- **IA26** — consume the exact-candidate rendered acceptance definition for PL-C20-03.

##### Completion proof

1. every stable row above retains its exact R1 evidence and DESIGN disposition;
2. `POSITIVE_NO_CHANGE` rows receive no implementation edit for that requirement and their named proof is revalidated;
3. dependency-only rows consume the named IA action without duplicating its implementation;
4. every package atom is satisfied by its one execution owner;
5. action-specific tests plus `13-verification-closeout.md` pass;
6. any evidence contradiction returns upstream rather than broadening scope.

### Compiled component: `implementation-plan/12-action-catalog.md`

#### 0.6.0 implementation action catalog

Each IA action below has one execution owner. Semantic phase files may reference the action as consumers; they never duplicate implementation responsibility. The catalog is revalidated against current DESIGN SD01-SD30 under post-rendered-evidence reconstruction; historical action existence is not justification for retaining an action.

##### Signed-task audit ledger

This is a trace/readability view of the one canonical `order-tasks` block in the root PLAN. It is **not** another executable task representation. A mismatch with the root block makes PLAN non-current.

| Task | DESIGN / IA ownership | Depends on | Primary implementation owner | Mandatory removal/replacement evidence | Closure evidence |
|---|---|---|---|---|---|
| T1 | SD01-SD30; IA01-IA34 | — | one cumulative 76-path 0.6.0 candidate; internal waves below own ordered mutation/proof responsibilities | C19-F09/C20-F11 reset: IA27 consumes the closed SD21 component ledger and realizes required-new/decompose/destructive/absent foundation dispositions; IA28 freshly re-accepts the foundation; IA29-IA34 fully revalidate every affected renderer and apply the exact owner disposition below | final V0-V7 + SD16-SD18/SD29 certification + IA26/SD30 exact-candidate 37-SURF and component-architecture acceptance |

**Audit rule:** T1 is the only P6 ExecutionTask. Wave/IA ordering below is internal implementation sequencing and never relies on candidate-byte promotion between tasks. A later phase discovering a foundation defect returns to IA27/DESIGN rather than patching around it; T1 cannot close until every owned phase obligation and final candidate proof is satisfied.

##### Execution waves

**Pre-sign-off realization boundary:** this catalog confers no bounded or signed implementation authority. Under `GW-DOC-SYSTEMS-GOVERNANCE-PYRAMID-V1` bounded acceptance-evidence realization may begin only after current R3 has closed the tranche and returned `READY_FOR_SIGNOFF`; current eligibility, G6 state and any exact-package bounded grant are then owned by `0.6.0-design-campaign-plan.md §17A/§18`. The catalog is only the candidate execution definition.


0. **Preflight 0 — DESIGN-positive reuse proof:** IA07-IA08. No production mutation.
1. **Wave 1 — authority/source/task/runtime corrections:** IA01-IA10 plus IA25 where still unsatisfied.
2. **Wave 2 — bounded shell/Context foundation realization:** bounded IA27 consumes the closed SD21/F6B ledger and realizes only the compile-closed AppShell/WorkItem-shell/Context/responsive/theme + Section/Facts slice and required-absent generic owners. Breaking APIs with later consumers remain unchanged **except** the application-only `WorkbenchToolbar` cutover, whose complete current consumer set is migrated atomically: `app.tsx` consumes the closed application API and `MarkdownEditor.tsx` is dependency-decoupled into its already-authorized Markdown-P3 specialist editor-control region. That narrow dependency migration does not accept IA29; no compatibility path is introduced.
3. **Wave 3 — fresh Queue/Create/account-utility consumer revalidation + bounded foundation acceptance:** IA11, IA12, IA28 consume that IA27 bounded slice. The Toolbar breaking checkpoint includes the IA28-local Queue search dependency migration from `WorkbenchToolbarSearch` to the DESIGN-authorized Astryx `TextInput` Operational-scan leaf so the obsolete Toolbar export can be deleted without a bridge. Queue/Create production bytes may otherwise remain only after fresh authority proof. The grant stops after evidence review; IA29 remains blocked until explicit normal sign-off.
4. **Post-signoff IA27 completion — shared resource collection atomic cutover:** after normal sign-off and before IA29, create `WorkbenchResourceList`, atomically migrate every current `WorkbenchResourceRow` caller, then narrow `WorkbenchResourceRow`. The candidate must typecheck at the same checkpoint; no caller is left on the old API.
5. **Wave 4 / P0.1 — Work request/document/editor reconstruction:** IA13, IA14, IA29 create/cut over WorkbenchDocument/Facts/Section with the complete Document consumer set and close HUX-01/HUX-02/HUX-05/HUX-07.
6. **Wave 5 / P0.2 — atomic Proposal/Readiness/Approval Review reconstruction:** IA16, IA17, IA31 create ReviewVerdict/ReviewSection/DocumentChangeView and destructively replace WorkbenchReview in the same change set that migrates **all** current Review consumers: ProposalReview, ReadinessWorkspace and SignoffReview; close HUX-03/HUX-04/HUX-05/HUX-08.
7. **Wave 6 / P0.3 — productive pre-signoff-stage reconstruction excluding Proposal Review:** IA15, IA30 reconstruct R1/R2/DESIGN/PLAN Document/Dialogue/Evidence/State routing and activity/timeline behavior, remove historical/current-owner composition collisions and close HUX-05/HUX-06/HUX-08. Proposal Review is already owned by the completed IA31 atomic Review cutover and IA30 may not redesign it.
8. **Wave 7 — Implementation reconstruction:** IA32 consumes Section/Facts/ResourceList inside the canonical MasterDetail topology.
9. **Wave 8 — Complete/Evidence reconstruction:** IA19, IA33 create/cut over WorkbenchResult with TerminalResult; Complete consumes Section/ResourceList, Evidence remains the exact-byte owner.
10. **Wave 9 — Settings/account-management/configuration reconstruction:** IA18, IA34 consumes Section/Facts/ResourceList while preserving one Settings diagnostics owner.
11. **Wave 10 — permanent semantic/component certification:** IA20-IA22.
12. **Wave 11 — cross-solution regression closure:** IA23.
13. **Wave 12 — rendered product acceptance:** IA26.
14. **Wave 13 — candidate closeout:** IA24.

Before any bounded Wave 2/3 UI mutation, the exact corrected P4/DESIGN/PLAN package must have current R3/G6 `READY_FOR_SIGNOFF` and an explicit exact-package §17A operator grant. That bounded grant authorizes only the compile-closed IA27 shell/Context slice plus IA28 consumers; it never authorizes ResourceRow/ResourceList, Review, Document or Result cutovers. Normal post-evidence execution requires ordinary human sign-off. After sign-off, IA27 first completes the all-caller ResourceRow/ResourceList atomic cutover; IA29/IA31/IA33 own the Document/Review/Result breaking cutovers with their complete consumer sets. Each action consumes SD21/F6B rather than deriving component roles. IA29-IA34 revalidate their complete owned renderer set before editing and execute the catalogued disposition: `DECOMPOSE_REFACTOR` when semantic responsibility is valid but physically overloaded, `DESTRUCTIVE_REPLACEMENT` when hierarchy/API ownership is materially wrong, `BOUNDED_RESIDUAL` only for a strictly local defect, `CONFORMING_NO_EDIT` only after fresh proof, `REQUIRED_NEW` for missing canonical owners and `REQUIRED_ABSENT` for forbidden owners. The 37 SURF rows remain partitioned once across IA27-IA34 and IA26 rechecks the exact-candidate union plus the component-ownership/SoC invariants.
##### IA01 — pure project-authority resolution

**Solution:** SD02.  
**Owner/anchors:** `src/core/governance.ts`, existing authority-layer/concern/material/freshness pure functions.  
**Required mutation:** add the minimum pure resolved-authority projection over validated manifest inputs and shell-expanded selected paths, preserving the selected P1-P6 set as authority reachability, exact stable/versioned ref-to-source identity, same-layer precedence plus inherited P1 default/override/extension and fitness bindings. IA01 does not decide stage materiality.  
**Forbidden:** filesystem/provider I/O; semantic contradiction inference; DTO/service/repository/class family; parallel authority graph.  
**Proof:** `tests/core.test.ts` ordering/default/override/extension/invalid-input cases.

##### IA02 — consume resolved authority before productive context

**Solution:** SD02. Depends on IA01.  
**Anchors:** `src/daemon/authority.ts::resolveStageContextState/resolveStageContext`; `src/daemon/stage.ts::stagePrompt` and stage admission.  
**Required mutation:** consume IA01 result before provider context/conformance/sign-off dependency construction, then derive the applicable material-authority subset from the pinned WorkItem schema/template, mandatory stage policy and explicit upstream/signed authority refs plus dependencies. Stable refs bind current canonical owners; explicit versioned refs bind exact retained snapshots. A selected/reachable retained source must not become stage material merely because it shares an authority layer. Invalid/unresolved applicable bindings block before provider use.  
**Forbidden:** provider interpretation of raw manifest order as precedence; daemon-owned second authority graph; include-every-selected-source context projection; implicit promotion of retained historical sources into current-schema context; context construction that bypasses the IA01 resolved projection or the canonical lifecycle-context applicability rule.  
**Proof:**
- `tests/daemon.test.ts` — productive-context admission consumes the resolved projection, derives the schema/stage-applicable material subset, excludes an unrelated retained V1 source from a current-v2 context, includes the exact retained source when a pinned historical schema or explicit versioned ref requires it, and blocks unresolved applicable bindings before provider use;
- `tests/certification.test.ts` — representative production project manifest with both current and retained semantic sources plus same-layer precedence/default/override/extension reaches the real STAGE context with only the applicable material set in resolved order. Current-v2 and historical exact-version cases are both proved, and an equivalent unresolved simultaneously-applicable relation fails before any provider turn. The certification must fail if production falls back to raw manifest array/filesystem order, include-every-selected-source projection, or provider interpretation.

##### IA03 — one GOVERNANCE proposal/adoption mechanism

**Solution:** SD09.  
**Anchors:** `src/core/contracts.ts` proposal/ArtifactRef contracts; `src/core/governance.ts`; `src/daemon/stage.ts::proposalDisposition/proposalAdoptionRequest/adoptArtifactProposal/reconcilePendingArtifactProposals`; `src/daemon/authority.ts`.  
**Required mutation:** R2 admits only current manifest-resolved P2/P3 targets; DESIGN only P4/P5/P6; exact role/layer/path/base-hash re-resolution before adoption.  
**Forbidden:** stage-specific proposal DTOs/direct provider writes/second decision store.  
**Proof:** core/daemon wrong-layer/path/hash/stale/adoption/freshness cases.

##### IA04 — durable-decision completion admission

**Solution:** SD08. Consumer dependency on IA03 when the durable target is permanent governance.  
**Anchors:** `src/core/lifecycle.ts::evaluateStageCompletion/validateStageProviderTurn`; `src/daemon/stage.ts::runStageTurn/submitRunInput`.  
**Required mutation:** after latest answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, reject stage completion until later adopted authority exists. INFORMATION/EVIDENCE remains unchanged.  
**Proof:** core/daemon chronology cases for adopted/rejected/cancelled/stale and ordinary information input.

##### IA05 — schema-aware current-v2 task admission

**Solution:** SD10.  
**Owners/anchors:** existing `SignedTaskBlockSchema` remains unchanged in `src/core/contracts.ts`; `src/core/execution.ts::parseSignedTaskBlockFromPlan` remains the one structural parser and gains one pure schema-aware admission helper over the parsed block; `src/daemon/stage.ts` owns PLAN/R3 authoring/conformance invocation; `src/daemon/authority.ts::validateTaskDefinitions` owns R3/sign-off deterministic task validation.  
**Required mutation:** for `change-v2`/`defect-v2` only, enforce P6 §37.4 mechanical non-vacuity: non-empty task list; trimmed non-empty id/objective; non-empty scope, acceptanceRefs, changeSurface, gateIds, authorityRefs and concernIds. Keep `dependsOn`/exclusions optionally empty. The PLAN/R3 provider contract states these same v2-only mechanical clauses alongside the unchanged shared JSON Schema. PLAN conformance and R3/sign-off call the same pure admission owner. Published `change-v1`/`defect-v1` parsing/validation meaning is unchanged.  
**Semantic boundary:** mechanical presence is not material task sufficiency. Existing PLAN conformance questions still prove objective/dependencies/traceability, module ownership/decomposition, checkpoint placement, surfaces, deletions/replacements, completion evidence, minimum-change forecast and verification contract; R3 independently challenges complete P1-P7 traceability/readiness.  
**Forbidden:** tightening the shared SignedTaskBlock schema globally; a v2-only shadow task schema/parser; a second semantic-review path.  
**Proof:** `tests/core.test.ts` preserves v1 cases and proves v2 positive/negative mechanical admission; `tests/daemon.test.ts` proves PLAN and READY_FOR_SIGNOFF/sign-off cannot bypass v2 admission; `tests/certification.test.ts` binds the single parser/admission/prompt path and rejects duplicate task schema/parser ownership.

##### IA06 — canonical Approval identity normalization

**Solution:** SD12.  
**Anchors:** `src/core/contracts.ts` Approval schema; `src/daemon/authority.ts::signOffWorkItem`.  
**Required mutation:** trim and reject whitespace-only `approvedBy` before persistence.  
**Proof:** core/daemon direct-ingress negative tests plus browser feedback.

##### IA07 — signed-checkpoint DESIGN-positive reuse proof

**Solution:** SD13; package atom `PL-C12-01`.  
**Existing realization evidence owners:** existing `src/core/contracts.ts`, `src/core/execution.ts`, `src/daemon/execution.ts`, `src/daemon/validation.ts` and `src/shell/opencode.ts`.  
**Required action:** no T1 production mutation. Before Wave 1, revalidate that BUILDER alone may emit one terminal signed `GATE_CHECKPOINT_REQUESTED`, the coordinator checks freshness/current V2 scope before the effect, executes the signed gate, records existing GATE_PASSED/GATE_FAILED evidence, continues the same Run/provider session and never grants provider shell/execute. The implementation waves then consume this DESIGN-positive capability exactly as scheduled by `13-verification-closeout.md`.  
**Failure:** if current evidence cannot prove the DESIGN-required capability, stop before mutation and return upstream; do not self-bootstrap the checkpoint protocol.  
**Proof:** existing core/daemon/certification checkpoint success, failure, unsigned, out-of-scope and same-session cases plus exact current realization verification.

##### IA08 — signed-scope/forecast DESIGN-positive reuse proof

**Solution:** SD10; package atom `PL-C12-02`.  
**Existing realization evidence owners:** existing `src/shell/opencode.ts`, `src/daemon/validation.ts` and `src/daemon/execution.ts`.  
**Required action:** no T1 production mutation. Revalidate that signed scope/exclusions are the hard reach boundary, `changeSurface` is immutable forecast evidence, forecast absence alone is not V2 `SCOPE_BREACH`, and in-scope unforecast decomposition can proceed only through independent V4, architecture/governance V5 and coordinator-owned V6 minimum-change evidence.  
**Failure:** any contradiction blocks execution and returns to the owning pre-signoff layer; do not modify execution-foundation owners from this T1 to make the candidate admissible.  
**Proof:** existing daemon/certification in-scope-unforecast, out-of-scope/exclusion/protected-path, V6 `CHANGE_BLOAT` and architecture-fitness cases.

##### IA09 — singular new-source planner

**Solution:** SD04.  
**Anchor:** `src/daemon/work-item-source.ts::reconcileWorkItemSources/createWorkItemFromSource`.  
**Required mutation:** factor one daemon-local new-source planner returning the existing REGISTERED QueuePlan from a validated source snapshot.  
**Proof:** created/discovered inputs produce equivalent admission plans except provenance.

##### IA10 — converge created/discovered persistence

**Solution:** SD04. Depends on IA09.  
**Anchor:** `src/daemon/work-item-source.ts`.  
**Required mutation:** route UI-created and discovered source snapshots through IA09 + existing applyPlan; delete direct create-path WorkItem construction/store.  
**Proof:** daemon one-persistence-owner, read-back, diagnostics and freshness tests.

##### IA11 — canonical Create interaction

**Solution:** SD03.  
**Anchor:** `ui/src/CreateWorkItem.tsx`.  
**Required mutation:** ordinary vocabulary is Concerns; linked remediation shows fixed parent project context and no invalid cross-project selector. Preserve metadata/body ownership.  
**Proof:** browser ordinary creation, metadata ownership and linked-remediation tests.

##### IA12 — one archive/project/search derivation

**Solution:** SD05.  
**Anchors:** `ui/src/app.tsx::App`; `ui/src/WorkItemQueue.tsx::WorkItemQueue`.  
**Required mutation:** App selects active/include-archived canonical dataset then applies project/search exactly once; queue does not own alternate filtering.  
**Proof:** browser active/archived × project × search matrix while archive identity/history remains unchanged.

##### IA13 — exact documentation-Git review

**Solution:** SD06.  
**Anchor:** `ui/src/DocumentWorkspace.tsx::DocumentationGitConfirmation`.  
**Required mutation:** list exact canonical governed changed paths/states before commit; reuse existing Git status owner.  
**Proof:** browser exact-path/state review plus blocker cases. Do not alter save/status/eligibility semantics already proven conforming.

##### IA14 — current attention survives inspection

**Solution:** SD07.  
**Anchors:** canonical `src/core/lifecycle.ts::deriveCurrentAttention` remains unchanged owner; UI `ActivityWorkspace.tsx`, `WorkItemWorkspace.tsx`, `workbench-presentation.ts`.  
**Required mutation:** when inspected material differs from current owner, render exact higher-priority owner/reason/action and direct return while preserving legitimate inspection.  
**Proof:** presentation/browser required-input/proposal/blocker/stale/recovery with historical selection.

##### IA15 — focus once per required-input request

**Solution:** SD15.  
**Anchors:** `ui/src/ActivityComposer.tsx::ActivityComposer`; `ui/src/ActivityWorkspace.tsx::StageRunMaterial`.  
**Required mutation:** new current required-input event id moves focus once to Workbench composer; rerender/polling does not refocus.  
**Proof:** browser focus-once/rerender/responsive cases.

##### IA16 — canonical Readiness verdict

**Solution:** SD11.  
**Anchor:** `ui/src/ReadinessWorkspace.tsx::ReadinessWorkspace` plus existing presentation helper.  
**Required mutation:** dominant verdict is typed R3 completion outcome; maturity/currentness separate.  
**Proof:** READY_FOR_SIGNOFF/RETURN_TO_*/BLOCKED + stale material cases.

##### IA17 — Approval readiness/currentness hierarchy

**Solution:** SD12.  
**Anchor:** `ui/src/SignoffReview.tsx::SignoffReview`.  
**Required mutation:** readiness + package currentness precede task/technical identity; stale/history cannot fabricate readiness.  
**Proof:** browser/presentation current/stale package cases.

##### IA18 — operator-first Settings hierarchy

**Solution:** SD14.  
**Anchors:** `ui/src/SettingsWorkspace.tsx::SettingsWorkspace/RepositorySettings/ModelRuntimeSettings`.  
**Required mutation:** readiness/meaning/actions primary; exact roots/endpoints/model source/credential-like identity in the one Settings diagnostics/technical-inspection region except when the exact value is the active configuration input.  
**Proof:** browser normal Settings, blockers, Add/Move/configuration cases.

##### IA19 — product-language projection

**Solution:** SD01.  
**Anchors:** `README.md`; `ui/src/TerminalResult.tsx::TerminalResult`; `ui/src/workbench-presentation.ts`.  
**Required mutation:** reuse the P4 terminal-result projection by adding/using one pure exhaustive product-facing `WorkOutcome` label mapping in `workbench-presentation.ts`; remove `TerminalResult.tsx` local enum prettification; make `TerminalResult` consume the shared mapping; correct README hero/intro/result-boundary copy so verified result is the umbrella outcome and implementation/candidate language is conditional; preserve the explicit operator-triggered WorkItem documentation-Git exception while prohibiting automatic implementation/candidate commit/push/merge/deploy.  
**Forbidden:** lifecycle/state/WorkOutcome contract changes; second product-label table in `TerminalResult`; generic enum prettification fallback; new DTO/view-model/service/state owner; candidate resources for non-candidate outcomes.  
**Proof:**
- `tests/workbench-presentation.test.ts` — exhaustive current `WorkOutcome` → canonical product-facing label cases, including `CANDIDATE_DONE -> Verified candidate`, and no underscore/title prettification fallback;
- `tests/browser.spec.ts` — Complete/TerminalResult candidate case renders **Verified candidate** and candidate resources; representative no-code terminal case renders its canonical non-candidate label and no candidate resources;
- `tests/certification.test.ts` — README contains verified-result umbrella + conditional implementation/candidate wording + explicit documentation-Git exception, and rejects universal candidate/delivery wording or an absolute no-commit claim that erases that exception.

##### IA20 — exhaustive renderer classification certification

**Binding intermediate-layer finding:** C19-F09/C20-F11/G-F38. Certification must prove semantic ownership, not component-name presence: wrapping feature-authored hierarchy in a canonical outer component is a failure.

**Solution:** SD16.  
**Owner:** `tests/certification.test.ts`.  
**Required mutation:** check complete production renderer coverage against canonical P4 §8.17 and certify the P4/F6B semantic-component boundary: required-new component modules exist with only allowlisted consumers; `WorkbenchReview` has no arbitrary `body` escape; repeated resources route through `WorkbenchResourceList`; Document/Result/Review/Context consumers do not recreate Section/Facts/resource/review grammar in feature-local structural CSS/JSX; forbidden generic workflow owners remain absent; no production renderer is unclassified or nests/synthesizes another primary composition.
**Forbidden:** edit `tests/architecture.test.ts` inside T1 or create second UI registry.  
**Proof:** certification negative/positive fixture including deliberate forbidden Queue/Review/Terminal/Evidence attention usage, Proposal/Readiness/Approval outer-frame wrapping, and nested-primary-surface composition.

##### IA21 — scenario-41 work-kind certification

**Solution:** SD17.  
**Owner:** `tests/browser.spec.ts`.  
**Required mutation:** certify all four kinds' Work request + Research information contracts and distinct Change/Defect downstream obligations.  
**Proof:** explicit four-kind semantic matrix.

##### IA22 — System/Light/Dark component-semantic parity

**Solution:** SD18.  
**Owners:** `tests/browser.spec.ts`, `tests/workbench-presentation.test.ts`.  
**Required mutation:** representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay states preserve canonical semantic roles under all effective themes; theme changes may not change which interaction classes own current attention or create an attention band on Queue/Evidence/Terminal result.  
**Proof:** semantic role/component assertions; no pixel-snapshot substitute.

##### IA23 — cross-solution regression closure

**Upstream:** all SD01-SD30.  
**Owners:** existing targeted core/daemon/presentation/browser/certification suites plus `tests/opencode.test.ts` and `.github/workflows/ci.yml` for SD20.  
**Required mutation:** fill any integration-level positive/negative gaps needed to prove the composed solutions without duplicating action-specific tests. Explicitly prove no compatibility fallback, shadow owner or implementation-derived semantics. For SD20 specifically, add one permanent exact-pin OpenCode integration tier: PR verification installs exact `opencode-drive@2.4.1` + `effect@4.0.1` into runner-temporary verification space, `tests/opencode.test.ts` launches the actual supported OpenCode `2.2.6` process through Order's production OpenCode environment/admission/session path, and deterministic model responses are supplied through the Drive simulation provider/controller. Existing `fake-opencode` fixtures remain lower-level doubles and do not satisfy this exact-pin proposition. Do not add the simulation tooling to Order's product/runtime package graph, lockfiles, release bundle, configuration or state, and do not claim remote-provider availability, Console OAuth/account connectivity or model quality from simulated responses.  
**Proof:** exact-pin SD20 integration case passes in permanent PR verification; all targeted suites green; V4/V5/V6 trace every added assertion/tooling change to an SD/requirement/atom.

##### IA24 — exact candidate closeout

**Upstream:** complete T1 with IA26 rendered UX/UI acceptance PASS.  
**Owner:** `CHANGELOG.md` plus coordinator-owned validation evidence.  
**Required mutation:** record user-visible/correctness consequences under Unreleased; run exact final six-gate union and V0-V7 with fresh V4/V5/V6, and bind closeout to the exact GitHub Actions rendered-acceptance run/evidence package accepted under IA26.  
**Terminal:** only CANDIDATE_DONE or valid ALREADY_SATISFIED. PR merge/release/version bump remain outside T1.

##### IA25 — guided productive installer completion

**Solution:** SD19.  
**Canonical authority:** P3 FR007 plus corrected P3 FR079 / Installation Readiness `9c2ec83a9552b7583f90e91080c014df4d6870df`, P4 GW-TR-007 and corrected P6.  
**Owner/anchor:** `src/shell/setup.ts::runInstallerGuidedSetup/runGuidedSetupInternal`; `src/installer.ts::configureOrder/runInstaller` is the existing caller and is not expected to change.  
**Required mutation:** remove/replace the fresh `configured === null` success/defer branch so installer-owned setup continues through existing private OpenCode login, model selection, exact target repository validation/selection and reference-root choices before returning success and proving productive daemon/readiness. Preserve valid incomplete v4 only as post-install/update daemon/Settings recovery and transient rollback-safe installer state. Preserve existing upgrade/migration retention and rollback.  
**Forbidden:** new config schema; second setup owner; mandatory post-install Settings/provider-login step; speculative `src/installer.ts` edit. If setup.ts alone cannot realize SD19, return to DESIGN/PLAN.  
**Proof:** create `tests/installer.test.ts` covering fresh productive setup success/failure/cancel and deferred-Settings rejection; existing `tests/order-migration.test.ts` must continue proving migration/rollback/continuity.


##### IA27 — realize the compile-closed Workbench shell/Context foundation and post-signoff resource cutover

**Solution:** SD21 + F6B, with SD29 responsive/accessibility containment.  
**Authority boundary:** P4 defines permanent component responsibilities/APIs; SD21/F6B defines this package's exact realization and consumer-atomic cutover. IA27 does not derive either.

**Cutover law:** a breaking component API changes only in a checkpoint that simultaneously migrates its complete current compile-time consumer set. No compatibility props, overloads, aliases, translators, hidden legacy DOM or old/new dual path are permitted.

| Owner / responsibility | Disposition | Cutover checkpoint | Required consequence |
|---|---|---|---|
| new `WorkbenchSection.tsx` | `REQUIRED_NEW` | bounded IA27 | canonical bounded semantic section used by Context; no feature-local substitute section/card grammar |
| new `WorkbenchFacts.tsx` | `REQUIRED_NEW` | bounded IA27 | canonical structured-facts owner used by Context |
| `WorkbenchContextPanel.tsx` | `DESTRUCTIVE_REPLACEMENT` | bounded IA27 | replace arbitrary children escape with canonical section composition while preserving conforming docked/Drawer mechanics |
| `WorkItemContext.tsx` | `DECOMPOSE_REFACTOR` | bounded IA27 | project selection-aware technical data into Section/Facts; remove recurring local section/facts layout |
| `WorkbenchToolbar.tsx`, `WorkbenchAppShell.tsx`, application-header composition in `app.tsx`, header-owned `theme.css` selectors | `DESTRUCTIVE_REPLACEMENT` | bounded IA27 | atomically migrate the complete current Toolbar consumer set: `app.tsx` to the closed application-only API and remove superseded header DOM/CSS composition; no `start`/`end`/group compatibility API survives |
| `MarkdownEditor.tsx` consumption of `WorkbenchToolbar` | `DEPENDENCY_DELTA` only | bounded IA27 consumer-atomic dependency migration | replace only the superseded application Toolbar/group wrapper with the Markdown-P3-owned compact editor-control region, preserving existing formatting/mode/Save/Cancel mechanics and direct controls→canvas adjacency; no WorkbenchDocument/facts/layout reconstruction and no IA29 acceptance |
| `WorkItemQueue.tsx` consumption of `WorkbenchToolbarSearch` | `DEPENDENCY_DELTA` only | same bounded IA27/IA28 compile-atomic Toolbar cutover | delete the obsolete Toolbar-module search export and render the existing `SURF-QUEUE-001` search/filter through the P4-approved Astryx `TextInput` Operational-scan leaf; preserve query/filter semantics, label/test identity and Queue composition; no additional Queue redesign |
| `WorkItemWorkspace.tsx` shell integration | `BOUNDED_RESIDUAL` | bounded IA27 | preserve canonical routing/shell ownership; correct title-edit action precedence and consume the new Context API |
| `WorkbenchLayout.tsx`, `WorkbenchSelector.tsx`, `WorkflowStepFrame.tsx`, `WorkflowMaterialSelector.tsx` responsibilities | `REQUIRED_ABSENT` | bounded IA27 | delete/keep absent with zero aliases, wrappers, CSS shims, hidden DOM or renamed equivalents |
| `WorkbenchSectionHeader.tsx` and conforming narrow primitives | `CONFORMING_NO_EDIT` after fresh audit | bounded IA27 | retain only after corrected P4 responsibility/API proof; no inherited PASS |
| new `WorkbenchResourceList.tsx` | `REQUIRED_NEW` | **post-signoff IA27 completion** | create the canonical repeated-resource collection only when every existing ResourceRow caller is authorized to migrate |
| `WorkbenchResourceRow.tsx` | `DECOMPOSE_REFACTOR` | **post-signoff IA27 completion** | atomically migrate every current caller to ResourceList/canonical Row API and narrow Row in the same typecheck-clean checkpoint |
| `theme.css` semantic-component selectors | `DECOMPOSE_REFACTOR` | owning cutover checkpoint | add only selectors for components actually cut over at that checkpoint; delete corresponding feature-local recurring grammar only as its consumer migrates |
| `tests/certification.test.ts`, `tests/browser.spec.ts` | `BOUNDED_RESIDUAL` verification | bounded IA27 and later checkpoints | prove exact API/consumer/SoC behavior; tests are not design authority |

**Not owned by the bounded IA27 checkpoint:** `WorkbenchDocument` and the full `DocumentWorkspace`/`MarkdownEditor` Document/editor reconstruction and acceptance (IA29), `WorkbenchReviewVerdict` / `WorkbenchReviewSection` / destructive `WorkbenchReview` + `DocumentChangeView` (IA31), and `WorkbenchResult` (IA33). The only bounded MarkdownEditor mutation is the compile-atomic removal of its invalid application-Toolbar dependency; all IA29-owned information/layout/API reconstruction remains deferred.

**Bounded IA27 ordered mutation:** create/validate Section/Facts; destructively cut over ContextPanel + WorkItemContext together; keep required-absent generic owners absent; atomically re-author AppShell/Toolbar/header/root integration and migrate the complete Toolbar-module consumer set by moving MarkdownEditor controls off the application Toolbar into the existing Markdown-owned editor-control region and moving Queue search off `WorkbenchToolbarSearch` into its DESIGN-authorized Operational-scan `TextInput` leaf; apply bounded theme selectors and the WorkItemWorkspace shell residual; update only bounded proof. The Markdown dependency migration preserves all IA29 semantics and is not IA29 acceptance. The candidate must pass typecheck/build without otherwise touching IA29-IA34 consumer semantics.

**Post-signoff IA27 completion:** after explicit normal sign-off and before IA29, create ResourceList, migrate **all** current direct ResourceRow consumers to ResourceList/canonical Row usage, narrow ResourceRow in the same change set, and prove type/API/consumer closure. No consumer may remain compiled against the superseded Row API.

**Proof:** bounded checkpoint proves Section/Facts/Context API closure, required-absent owners, shell/Context consumer allowlists, one AppShell/WorkItemShell/responsive/Context owner, accessibility/focus/theme and IA27 SURF rows. Post-signoff completion separately proves ResourceList/ResourceRow exact API closure and all-caller migration. Neither checkpoint claims Review/Document/Result cutover before its owning phase.

###### Priority-0 operator-rejected semantic-UI remediation tranche

This tranche is the immediate implementation priority after the corrected P3/P4/DESIGN/P7 package is revalidated. It exists because the rendered evidence proved that the already-governing C19-F09 intermediate semantic-component architecture was not actually completed on the surfaces the operator repeatedly rejected.

**Priority law:**
- this tranche preempts IA32-IA34 and any non-blocking polish/refactor;
- no later screen-family work may be used to defer, hide or amortize these defects;
- each step starts from the complete DESIGN SURF information inventory and records the exact `datum/action -> P3 class -> semantic component -> placement/visibility/action` mapping before JSX mutation;
- no feature-local substitute grammar, generic prose slab or “close enough” component wrapper is permitted;
- each step ends with targeted wide/narrow rendered proof and HUX disposition before advancing;
- semantic/component correctness is necessary but not sufficient: the same-scope exact-candidate render must also materially conform to the authority-bound Workbench reference atlas for hierarchy, density, spacing, alignment, typography, component anatomy, action prominence and responsive recomposition;
- a failure in the shared component owner is fixed at that owner and re-proven across its complete consumer set rather than patched screen-by-screen.

| Priority | Owning phase | Blocking operator findings | Required correction before advance |
|---|---|---|---|
| **P0.1** | **IA29** | HUX-01, HUX-02, HUX-05, HUX-07 | Finish the Document intermediate schema exactly: Work request/editable/read-only lifecycle documents are owned by `WorkbenchDocument`; Markdown/editor is first dominant content; `Work request context` / `Document location` are subordinate named disclosures using `WorkbenchFacts`; narrow editor controls remain readable; Document-family geometry follows the flat semantic grammar. |
| **P0.2** | **IA31** | HUX-03, HUX-04, HUX-05, HUX-08 | Finish the Review intermediate schema exactly: one `WorkbenchReview` + one `WorkbenchReviewVerdict` + DESIGN-declared `WorkbenchReviewSection` children; repeated package/task/evidence/history objects use `WorkbenchResourceList`; Proposal uses `DocumentChangeView` with visible in-context change marks and exact diff secondary; Approval task detail remains Review detail rather than inventing a second independent Review hierarchy. |
| **P0.3** | **IA30** | HUX-05, HUX-06, HUX-08 | Remove the remaining productive-stage feature grammar and current-action collision: R1/R2/DESIGN/PLAN route directly to Document/Dialogue/Evidence/State; historical/current-owner return remains bounded navigation and cannot create a competing header/attention composition; local productive card/context grammar is deleted. |
| **P0.4** | **IA29 + IA30 + IA31, verified by IA20/IA26** | **HUX-09** plus unresolved visual consequences of HUX-05/HUX-08 | Perform a dedicated reference-fidelity closure over the exact operator-rejected surfaces. For every same-scope SURF/state/theme capture, compare the exact candidate against the active authority-bound Workbench reference atlas and close all material hierarchy, density, spacing, typography, facts/resources/decision anatomy, alignment, action-prominence and responsive differences using only the existing canonical semantic owners. This is not optional polish and must not introduce feature-local substitute UI. |
| **P0 exit** | IA20 + IA26 targeted proof | HUX-01 through HUX-09 | Certification proves semantic ownership rather than import/name presence, targeted exact-candidate rendered evidence shows the corrected rejected surfaces, the HUX-09 same-scope fidelity comparison records no unexplained material divergence, and every HUX row reaches explicit operator `ACCEPTED`. Only then may IA32-IA34 resume. |

**Ordering rationale:** IA29 lands first because IA30 and Approval supporting-document inspection consume the Document owner. IA31 follows because the rejected Review/Proposal/Approval surfaces are independent of the remaining IA30 productive-stage reconstruction once the Document owner is correct. IA30 then removes the historical/current-attention and productive-stage substitute grammar. This is an execution-priority change only; it does not change the 37-SURF ownership partition or the P4 semantic-component responsibilities.


###### Exact IA27-IA34 rendered face ownership


###### Binding operator UI findings — human acceptance ledger

**Upstream provenance:** every HUX row below is a concrete rendered/implementation manifestation of the already-governing `C19-F09` intermediate semantic-component/composition finding and its `C20-F11` governance/acceptance closure. The HUX ledger does **not** create a second architecture. `C19-F09` remains the root technical finding: feature renderers may not own recurring Review/facts/resource/Document/Result anatomy. `C20-F11` remains the proof/governance finding: prior PASS/acceptance cannot establish completion of that architecture. HUX rows preserve the operator-observed instances until the owning IA phase proves the exact DESIGN/P4 mapping and receives explicit rendered acceptance.

This ledger records direct operator findings from rendered 0.6.0 review. It is **binding P7 acceptance input**, not commentary and not implementation advice. These rows exist specifically so repeated human review findings cannot disappear between implementation passes, test rewrites or regenerated evidence.

**State law:**
- every row begins OPEN_BLOCKING;
- typecheck, architecture, unit/browser success, screenshot generation or an IA26 machine PASS **cannot** close a row;
- implementation may close the technical defect, but the row remains PROOF_REQUIRED until a fresh exact-candidate capture demonstrates the corrected state;
- only explicit operator disposition of that fresh rendered evidence may set ACCEPTED;
- explicit operator rejection of fresh evidence keeps or returns the affected row to OPEN_BLOCKING regardless of typecheck/browser/IA26 generation success; the rejection rationale becomes a required proposition for the next exact-candidate proof;
- an unchanged or materially equivalent rejected presentation is not new proof and must not be re-presented as if the finding were unresolved/unknown;
- if implementation cannot satisfy a row using the stated canonical component owner, return to DESIGN/P4 instead of inventing feature-local UI.

| Finding | Operator finding / non-negotiable UX consequence | Affected governed UI | Canonical component realization required | Forbidden presentation | Owning phase | Current state / required proof |
|---|---|---|---|---|---|---|
| HUX-01 | Work-request context does not belong permanently exposed before the Markdown. The actual Work request document is the task; work type, Project, Concerns and repository/document location are subordinate context. | SURF-STEP-WR-001, SURF-MAT-SOURCE-001; evidence: ia26-work-request-step-wide-light, ia26-source-document-editor-wide-dark, ia26-source-document-editor-narrow-light | WorkbenchDocument owns document-first order; WorkbenchDisclosure is the one specifically named same-task **Work request context** expansion; its structured values use WorkbenchFacts; compact Git status/action remains adjacent to the document action. | always-open facts/metadata slab before Markdown; feature-local metadata rows; generic “details” drawer; hiding the document below context | **IA29** | OPEN_BLOCKING until wide+narrow source/read/editor proof shows Markdown immediately after document header and Work request context closed by default below it |
| HUX-02 | Lifecycle/read-only documents have the same hierarchy requirement: the governed document is primary; repository placement is supporting and must not dominate the surface. | SURF-MAT-DOC-001, SURF-MAT-DOC-RO-001; evidence: ia26-lifecycle-document-editor-wide-light, ia26-lifecycle-document-readonly-wide-light | WorkbenchDocument + specifically named **Document location** WorkbenchDisclosure + WorkbenchFacts; document title/currentness/action remain header-owned. | path/directory facts before document body; duplicate document shell; nested card/panel around the document | IA29 | OPEN_BLOCKING until editable/read-only wide+narrow proof demonstrates identical document-first information order |
| HUX-03 | Readiness and Approval are not prose documents or “text-branded” slabs. Their typed information must be rendered through the component schema: verdict/currentness, named review responsibilities, task/package/evidence resources and the decision. “Open X” copy must not substitute for a resource UI. | SURF-STEP-R3-001, SURF-STEP-APPROVAL-001, SURF-MAT-APPROVAL-TASK-001; evidence: ia26-readiness-review-wide-light, ia26-readiness-review-narrow-light, ia26-approval-wide-light, ia26-approval-narrow-light, ia26-approval-task-wide-light, ia26-approval-task-wide-dark | exactly one WorkbenchReview with one WorkbenchReviewVerdict; each DESIGN-declared responsibility uses WorkbenchReviewSection; structured facts use WorkbenchFacts; repeated package/task/evidence/history objects use WorkbenchResourceList/WorkbenchResourceRow; task action uses WorkbenchAction; selecting a governed document replaces Review with WorkbenchDocument and bounded Back navigation. | arbitrary Review body; screen-local order-review-* section/card/grid grammar; repeated explanatory prose describing objects already represented by components; textual “Open readiness review / Open solution design / Open requirements …” navigation rows; nesting a full Document inside Review | **IA31** | OPEN_BLOCKING until Readiness ready/return, Approval current/stale and task-detail rendered proof shows componentized information with no slab-text substitute |
| HUX-04 | Proposal review is a **document change review**, not a Git-diff text viewer. The human must review the proposed document in document context; exact unified diff is secondary inspection. | SURF-MAT-PROPOSAL-001; evidence: ia26-proposal-review-wide-light, ia26-proposal-review-wide-dark, adopted/adopting/rejected variants | WorkbenchReview + Review sections; DocumentChangeView derives current/proposed document presentation from current target bytes + canonical unified diff and visibly marks changed regions in context; rationale/target meaning occupy their declared Review responsibility; exact diff is a secondary intentional inspection. | raw CodeBlock(unifiedDiff) as sole/dominant review; Git patch syntax as the default human proposal UI; second proposal state/model | IA31 | OPEN_BLOCKING until pending/adopting/adopted/rejected proof shows document-first change review with visibly changed regions and collapsed/secondary exact diff |
| HUX-05 | Mixed rounded-card and flat/straight container treatment is visually inconsistent and has been rejected repeatedly. Semantic grouping must come from component anatomy/spacing, not arbitrary cards. | cross-cutting Document/Review/productive surfaces, explicitly the lifecycle read-only/editor and Review families in the rejected IA26 corpus | current P3/P4/theme component roles only; persistent primary WorkbenchDocument/WorkbenchReview surfaces remain flat; radii/borders appear only where the canonical component role owns a real control/container boundary. | feature-local card chrome; rounded outer Review/Document/page panels; inconsistent nested rounded-versus-square surface framing; tokenized radius used merely because a token exists | IA29/IA30/IA31 + SD29 visual verification | OPEN_BLOCKING until affected proof surfaces show one coherent flat Workbench grammar and certification proves semantic role, not merely radius-token use |
| HUX-06 | Current-action/historical-return UI must not collide with or overlay the selected lifecycle document. The selected primary composition keeps its own geometry. | SURF-STEP-R1-001, SURF-STEP-R2-001, SURF-STEP-DESIGN-001, SURF-STEP-PLAN-001, SURF-MAT-DOC-RO-001; evidence: ia26-lifecycle-document-editor-wide-light (“Approval is ready for your action / Return to Approval” collision) | direct primary composition selected by IA30; historical-return/current-owner navigation is a bounded action outside the Document content geometry and cannot create a second attention/header layer over it. | overlapping attention text/button on document heading; generic current-attention strip inserted into historical Document; two competing primary headers | **IA30** | OPEN_BLOCKING until current/historical document captures demonstrate non-overlapping ownership and stable document geometry |
| HUX-07 | Narrow Markdown editing controls must remain readable/discoverable. Truncated mode labels and compressed Save/Cancel are not acceptable responsive behavior. | SURF-MAT-SOURCE-001, SURF-MAT-DOC-001; evidence: ia26-source-document-editor-narrow-light | Markdown specialist editor-control region retains Edit/Preview/Split, formatting and Save/Cancel semantics with P4/Markdown-contract responsive recomposition/overflow while preserving direct controls→canvas adjacency. | clipped “E. / P… / S.” labels; unreadable or collapsed Save/Cancel; controls hidden by width without an intentional overflow mechanism | IA29 + SD29 | OPEN_BLOCKING until narrow rendered/browser proof establishes all mode and mutation controls remain discoverable and operable |
| HUX-08 | No screen may replace the granular information/component contract with undifferentiated prose. Every information area must be projected into the canonical semantic owner defined by DESIGN/P4; implementation does not invent ad-hoc slabs. | all 37 governed SURF-* rows, with immediate blocking focus on IA29-IA31 rejected surfaces | enforce the closed mapping canonical datum/action -> P3 class -> DESIGN row -> semantic component owner -> exact composition position; Section/Facts/ResourceList/ReviewVerdict/ReviewSection/Document/Dialogue/Evidence/Result are mandatory where assigned. | “slab text”, explanatory copy used as structure, local recurring section/facts/resource/review grammar, component wrappers whose arbitrary ReactNode body lets the feature rebuild the UI hierarchy | IA20 certification + each owning implementation phase + IA26 | OPEN_BLOCKING globally until all affected phase proofs and final IA26 ledger have zero unresolved human findings |
| HUX-09 | The latest Priority-0 candidate is a material structural improvement but remains a minimal-effort visual realization and does **not** meet the fidelity required by the governed Workbench visual target. Semantic correctness alone does not accept a surface. | exact rejected/re-reviewed set: SURF-STEP-WR-001; SURF-MAT-SOURCE-001; SURF-MAT-DOC-001; SURF-MAT-DOC-RO-001; SURF-STEP-R1-001; SURF-MAT-PROPOSAL-001; SURF-STEP-R3-001; SURF-STEP-APPROVAL-001; SURF-MAT-APPROVAL-TASK-001; evidence ids: ia26-work-request-step-wide-light, ia26-source-document-editor-wide-dark, ia26-source-document-editor-narrow-light, ia26-lifecycle-document-editor-wide-light, ia26-lifecycle-document-readonly-wide-light, ia26-research-wide-light, ia26-proposal-review-wide-light, ia26-readiness-review-wide-light, ia26-approval-wide-light, ia26-approval-task-wide-light | retain the current P3/P4/DESIGN semantic owners, but realize their full visual hierarchy against the active same-scope comparison corpus in `docs/references/workbench-ui/reference-atlas.html`: Review header/eyebrow/title/description/verdict hierarchy; bounded named Review sections; structured Facts where the target carries fact anatomy; ResourceList row boundaries/action affordances; coherent decision region; Document content measure/header/control rhythm; Dialogue conversation/activity proportions; target spacing, density, alignment, typography and responsive recomposition. The reference corpus is derived comparison evidence, so newer current authority wins on conflict. | treating a technically valid primitive tree as sufficient visual acceptance; skeletal/bare-text realization with large unowned whitespace; flattening target section/fact/resource/decision anatomy; icon-only/bare action placement that materially changes target scan hierarchy; generic “polish later”; using machine PASS as a substitute for same-scope human visual comparison; copying superseded historical SVG details when they conflict with current P3/P4/DESIGN/theme authority | IA29/IA30/IA31 + IA20/IA26 | **OPEN_BLOCKING — operator rejected exact-candidate visual fidelity after the green Priority-0 capture.** Re-prove only with a fresh exact-candidate set restricted to these operator-rejected screens and a same-scope reference comparison showing no unexplained material visual divergence, then obtain explicit operator ACCEPTED disposition |

**No-loss rule:** IA29, IA30 and IA31 may not be recorded complete while any finding owned by that phase remains OPEN_BLOCKING or PROOF_REQUIRED. IA26 final acceptance additionally requires every HUX-* row to be ACCEPTED. The implementation team must reference the relevant HUX-* ids in commits/tests/proof notes for the corrected surfaces so a future session can trace each rendered correction back to the exact operator finding.

**C19-F09 implementation-completion matrix:** the intermediate semantic layer is complete only when every applicable consumer has stopped owning the recurring anatomy assigned to the canonical component. A component import or wrapper is not completion.

| Phase | Required C19-F09 realization | Current audit disposition |
|---|---|---|
| **IA29** | Work request/editable/read-only document consumers are fully owned by `WorkbenchDocument`; structured subordinate context uses `WorkbenchFacts` only in the DESIGN-authorized named same-task disclosure; Markdown specialist owns only editor mechanics. | **TECHNICALLY REMEDIATED / OPERATOR NOT ACCEPTED** — the fresh candidate corrected the document-first/context/narrow-control defects, but HUX-05/HUX-09 visual fidelity remains OPEN_BLOCKING. |
| **IA30** | productive Research/Requirements/DESIGN/PLAN renderers route directly to Document/Dialogue/Evidence/State and contain no recurring feature-owned section/context/card grammar. | **TECHNICALLY REMEDIATED / OPERATOR NOT ACCEPTED** — the historical-return collision and substitute productive grammar are corrected in the fresh candidate; HUX-05/HUX-09 visual fidelity remains OPEN_BLOCKING. |
| **IA31** | Proposal/Readiness/Approval use the closed Review schema: one ReviewVerdict, DESIGN-declared ReviewSections, Facts only for classified structured facts, ResourceList for repeated resources, DocumentChangeView for proposal document mutation; no local Review hierarchy. | **TECHNICALLY REMEDIATED / OPERATOR NOT ACCEPTED** — Proposal/Readiness/Approval now use the closed semantic owners and pass browser/architecture checks, but the rendered Review family remains materially below the authority-bound visual target; HUX-08/HUX-09 remain OPEN_BLOCKING. |
| **IA32** | Implementation detail uses MasterDetail + Section/Facts/ResourceList; no local `order-implementation-*` section/list/card system recreates semantic anatomy. | **NOT COMPLETE** — current renderer still owns recurring section/list anatomy. |
| **IA33** | Complete uses `WorkbenchResult` + canonical Section/ResourceList; no local terminal-result hierarchy owns outcome/resources/content grouping. | **NOT COMPLETE** — current renderer still owns local terminal section grammar. |
| **IA34** | Settings/account/model/repository surfaces use SettingsLayout + Section/Facts/ResourceList/Form owners; no feature-local pane/resource/facts/diagnostic grouping except the one authorized diagnostics owner. | **NOT COMPLETE** — current renderers still own substantial recurring pane/section/resource anatomy. |

**Completion test:** for every affected SURF row, review the complete datum/action inventory and record exactly one chain `canonical datum/action -> P3 class -> DESIGN SURF row -> canonical semantic component -> exact placement/visibility/action`. If the feature renderer must invent recurring hierarchy, grouping, resource grammar, responsive behavior, border/background/radius or explanatory prose to make the information understandable, the C19-F09 realization is not complete and the phase cannot PASS.



The 37 governed `SURF-*` rows declared by current `solution-design.md` remain partitioned exactly once across IA27-IA34. G-F30 changes only physical cutover timing and moves Proposal Review acceptance to IA31 so the WorkbenchReview API can change atomically with all Review consumers.

| Phase | Exact owned SURF rows | Required state/reference sheets before phase advance |
|---|---|---|
| IA27 | `SURF-WI-001`, `SURF-WI-CONTEXT-001` | bounded WorkItem shell + singular technical Context + shell/responsive readiness only; no claim that later shared APIs are cut over |
| IA28 | `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` | fresh rendered acceptance of the bounded shell/Context foundation slice through application-shell/Queue/Create |
| IA29 | `SURF-STEP-WR-001`, `SURF-MAT-SOURCE-001`, `SURF-MAT-DOC-001`, `SURF-MAT-DOC-RO-001`, `SURF-CONF-DIRTY-DEST-001`, `SURF-CONF-DIRTY-MATERIAL-001`, `SURF-CONF-ARCHIVE-001`, `SURF-CONF-DOC-GIT-001` | Work request/WorkbenchDocument/Facts/editor states and owned confirmations |
| IA30 | `SURF-STEP-R1-001`, `SURF-STEP-R2-001`, `SURF-STEP-DESIGN-001`, `SURF-STEP-PLAN-001`, `SURF-MAT-ACTIVITY-001` | productive-stage Document/Dialogue/Evidence/State routing and four-kind Research differences; Proposal Review remains IA31 |
| IA31 | `SURF-MAT-PROPOSAL-001`, `SURF-STEP-R3-001`, `SURF-STEP-APPROVAL-001`, `SURF-MAT-APPROVAL-TASK-001` | atomic Proposal/Readiness/Approval WorkbenchReview cutover: ReviewVerdict/ReviewSections/Facts/ResourceList + DocumentChangeView; required-input; current/stale/task detail |
| IA32 | `SURF-STEP-EXEC-001`, `SURF-MAT-EXEC-TASK-001` | Implementation MasterDetail/Section/Facts/ResourceList; current-vs-historical selection; blocker/action/validation |
| IA33 | `SURF-STEP-COMPLETE-001`, `SURF-MAT-EVIDENCE-001` | Complete WorkbenchResult/Section/ResourceList; linked remediation; candidate/non-candidate terminal states; Evidence |
| IA34 | `SURF-SET-001`, `SURF-SET-REPO-001`, `SURF-SET-REPO-ADD-001`, `SURF-SET-REPO-MOVE-001`, `SURF-SET-OC-001`, `SURF-SET-OC-RENAME-001`, `SURF-SET-OC-ADD-001`, `SURF-SET-OC-LOGIN-001`, `SURF-SET-MODEL-001`, `SURF-CONF-REPO-DISCONNECT-001`, `SURF-CONF-OC-REMOVE-001` | Settings repository/account/model readiness and active tasks; login terminal states; destructive confirmations |

The IA27-IA34 union remains exactly **37 unique SURF rows** with no duplicate or unowned row. Each phase records independent `schema_information`, `ux_interaction`, and `visual_ui` verdicts. The bounded IA27/IA28 evidence accepts only the shell/Context foundation slice it exercises. Later component cutovers are independently accepted at their owning phase and globally rechecked by IA20/IA26.

**Audit invariants:** No prior phase PASS is inherited. IA27 does not derive either P4 component contracts or SD21/F6B consumer mapping. Do not add compatibility props or temporary old/new paths. A breaking API cutover must include its complete current compile-time consumer set.

##### IA28 — freshly revalidate Queue and Create and accept the bounded shell/Context foundation slice

**Solution:** SD22.  
**Owners:** `ui/src/OpenCodeAccountControl.tsx` non-rendering account presentation/query adapter, `ui/src/WorkItemQueue.tsx`, `ui/src/CreateWorkItem.tsx`.  
**Disposition:** `CONFORMING_NO_EDIT` is permitted only after a fresh source + rendered audit against corrected P4/SD21/SD22; any exact consumer migration required by the new foundation is `BOUNDED_RESIDUAL`. No prior RZ16 PASS is inherited.  
**Required action:** consume the bounded IA27 shell/Context candidate, prove Queue remains attention-free Operational scan, Create remains TaskPanel→Form, and prove active-account presentation is projected by the non-rendering `OpenCodeAccountControl.tsx` adapter into the single Toolbar-owned Settings navigation/status slot with no second renderer. No local section/facts grammar may appear. Correct only a proven IA28-local residual; a recurring shell/Context defect returns to bounded IA27/DESIGN. ResourceList/Review/Document/Result are outside this pre-signoff checkpoint.  
**Proof:** `SURF-APP-001`, `SURF-QUEUE-001`, `SURF-CREATE-001` plus IA27 shell/Context evidence independently PASS schema/information, UX/interaction, visual/UI, component-ownership and bounded-foundation-realization checks. The bounded grant then stops. IA29 remains blocked until normal explicit sign-off and post-signoff IA27 ResourceList/ResourceRow completion.

##### IA29 — reconstruct Work request and governed Document composition

**Binding operator findings:** HUX-01, HUX-02, HUX-07; HUX-05 applies to the Document family visual grammar. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD23.  
**Owner dispositions:** `DocumentWorkspace.tsx` = `DECOMPOSE_REFACTOR`; `MarkdownEditor.tsx` = `DECOMPOSE_REFACTOR` at its outer Document composition/API boundary while preserving its specialist editing mechanics. Its earlier bounded removal of the invalid application-Toolbar dependency is a prerequisite dependency delta only and carries no IA29 PASS.  
**Required mutation:** create `WorkbenchDocument` and atomically migrate its complete Work request/editable/read-only consumer set to that one canonical Document composition. Governed Markdown/editor content follows document identity/currentness/actions immediately. Work type/Project/Concerns/repository path/WorkItem document directory remain available through `WorkbenchFacts` only inside the specifically named same-task `Work request context` (source) or `Document location` (lifecycle document) disclosure placed after the primary content and closed by default; compact Git state/action remains adjacent to the document action. Remove local `WorkRequestFacts`/aside/`dl` layout ownership, any always-open metadata slab and any generic workflow chrome. Remove MarkdownEditor structural props that exist only to host feature-owned document layout; retain one compact editor-control region and direct control→canvas adjacency. Technical identity remains Context-owned.  
**Proof:** all IA29 SURF rows PASS wide/narrow; the Markdown/editor is the first dominant content after the document header; `Work request context` / `Document location` are closed by default and expand through the one named disclosure; no always-open pre-document metadata slab, local document/facts grammar, duplicate heading, raw internal enum/technical identity or generic frame/selector remains; Context and Git consent paths remain exact.

##### IA30 — reconstruct productive stages excluding Proposal Review

**Binding operator findings:** HUX-06; HUX-05 applies to productive-stage surface grammar. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD24.  
**Owner dispositions:** `PreSignoffStageWorkspace.tsx` and `RunEventTimeline.tsx` = `DECOMPOSE_REFACTOR` where they own recurring section/timeline grammar; `ActivityWorkspace.tsx`/`ActivityComposer.tsx` = fresh `CONFORMING_NO_EDIT` or bounded migration only after P4 audit. Proposal Review is deliberately excluded from IA30 because its complete consumer-atomic Review cutover is owned by the preceding Priority-0 IA31 step; **do not change `ProposalReview.tsx`** in IA30. IA30 may preserve routing to that owner but may not redesign or wrap it.  
**Required mutation:** route non-Proposal canonical productive-stage states directly to WorkbenchDocument/Dialogue/Evidence/State. Consume the post-signoff ResourceList cutover where repeated resources occur. Preserve Proposal selection/routing but do not change `ProposalReview.tsx` or WorkbenchReview in this phase.  
**Proof:** all IA30-owned SURF rows PASS; no generic frame/selector or local recurring section/resource grammar in those rows; continuous Dialogue behavior and Context/Evidence inspection remain correct; Proposal Review remains byte/ownership-stable from the accepted IA31 cutover and IA30 introduces no alternate wrapper, selector or local Review grammar.

##### IA31 — destructively rebuild Proposal, Readiness and Approval Review composition

**Binding operator findings:** HUX-03, HUX-04; HUX-05 applies to Review-family visual grammar. HUX-08 is the cross-cutting no-slab/component-ownership constraint. These findings remain blocking until fresh rendered proof is explicitly accepted.

**Solution:** SD25 plus IA16/IA17 semantic inputs.  
**Owners:** `ProposalReview.tsx`, `ReadinessWorkspace.tsx`, `SignoffReview.tsx` = `DESTRUCTIVE_REPLACEMENT` of Review presentation composition; new `WorkbenchReviewVerdict.tsx`, `WorkbenchReviewSection.tsx` and `DocumentChangeView.tsx` = `REQUIRED_NEW`; existing `WorkbenchReview.tsx` = `DESTRUCTIVE_REPLACEMENT`. Domain/query/mutation semantics are reused only where independently conforming.  
**Required mutation:** in one compile-atomic change set, create ReviewVerdict/ReviewSection/DocumentChangeView, destructively replace WorkbenchReview with its closed P4 API, and migrate **all three** current WorkbenchReview consumers. Proposal Review renders the proposed governed document through DocumentChangeView with changed regions marked in context and keeps canonical unified diff secondary; no duplicate proposal state/model. Readiness and Approval use exactly one WorkbenchReview, one ReviewVerdict and DESIGN-declared ReviewSections. Findings/return owner, package material and evidence/history use named sections; structured facts use Facts; repeated resources use ResourceList. Remove all `order-review-*` local structural/card/grid systems once migrated. Required-input Dialogue replaces Review for that turn. Approval uses the same Review anatomy and keeps sign-off decision primary; technical identities remain Context-owned.  
**Proof:** Proposal mutation review plus ready/return/required-input and Approval current/stale/sign-off matrices PASS with one verdict, canonical sections/facts/resources, in-context DocumentChangeView, no raw-diff-dominant Proposal surface, whole-R3-under-findings duplication, local review grammar, raw enum, generic selector or technical leakage. Typecheck proves no old WorkbenchReview consumer remains.

##### IA32 — destructively rebuild Implementation on canonical semantic components

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA32 is not complete while `ExecutionWorkspace.tsx` or its feature CSS owns recurring task-contract/section/facts/resource anatomy that P4 assigns to MasterDetail/Section/Facts/ResourceList.

**Solution:** SD26.  
**Owner:** `ExecutionWorkspace.tsx` = `DESTRUCTIVE_REPLACEMENT` presentation composition.  
**Required mutation:** purge the old stacked/card/task-detail presentation and fresh-author canonical MasterDetail using Section/Facts/ResourceList for task detail, supporting history/resources and validation grouping. Preserve canonical execution/query/mutation owners; technical task/approval/plan/Run/baseline/context/provider identity routes to Context; exact evidence bytes route to Evidence. Same-task validation expansion alone may use Disclosure.  
**Proof:** purge provenance + IA32 SURF rows PASS wide/narrow; no local recurring card/section/resource grammar, generic technical drawer or current-attention theft by historical selection.

##### IA33 — destructively rebuild Complete/Evidence and consume refactored Context

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA33 is not complete while `TerminalResult.tsx` owns recurring outcome/section/resource hierarchy instead of `WorkbenchResult` + canonical Section/ResourceList.

**Solution:** SD27 plus IA19 product-language projection.  
**Owner dispositions:** `TerminalResult.tsx` = `DESTRUCTIVE_REPLACEMENT`; `EvidenceViewer.tsx` = fresh audit then `BOUNDED_RESIDUAL` only if required; WorkItem Context foundation migration is IA27-owned and consumed here.  
**Required mutation:** create `WorkbenchResult` and atomically migrate `TerminalResult` so Complete becomes one attention-free Surface containing one WorkbenchResult: canonical product-facing status/outcome, ordered Sections, ResourceList for repeated resources, permitted result action. Remove local terminal section/resource/status grammar and generic container-taxonomy headings. Evidence remains the one exact-byte primary surface and replaces rather than nests.  
**Proof:** candidate/non-candidate/linked-remediation + Evidence rows PASS; no synthetic attention, duplicated outcome, local result/resource grammar, internal enum/event identity or nested primary Surface.

##### IA34 — destructively rebuild Settings/account/configuration presentation

**Binding intermediate-layer finding:** C19-F09/G-F38 plus HUX-08. IA34 is not complete while Settings/account/model/repository renderers own recurring pane/section/facts/resource grammar outside SettingsLayout/Section/Facts/ResourceList/Form and the one authorized diagnostics owner.

**Solution:** SD28 plus IA18 semantic inputs.  
**Owners:** `SettingsWorkspace.tsx`, `OpenCodeAccountSettings.tsx` = `DESTRUCTIVE_REPLACEMENT` presentation composition.  
**Required mutation:** rebuild operator-first Settings using Section/Facts/ResourceList plus canonical Form/fields. Required repository roots/context facts remain default-visible Supporting information; task-required exact values become Primary only in the active task; all remaining technical provider/config identity is grouped under the single Settings diagnostics owner. Remove feature-local card/row/section systems and per-section technical disclosures.  
**Proof:** all eleven IA34 rows PASS wide/narrow/theme; canonical component ownership, one diagnostics owner, required facts/active inputs and destructive confirmations are correct.
##### IA26 — rendered 0.6.0 UX/UI acceptance evidence

**Binding human-review prerequisite:** every HUX-* row in the operator UI findings ledger must be ACCEPTED. Mechanical evidence generation, browser success and row-level machine checks cannot substitute for that explicit human disposition.

**Solution/authority:** existing SD16-SD18 verification and Workbench realization, current `GW-DOC-WORKBENCH-UX`, `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, `GW-DOC-WORKBENCH-THEME-V1`, and current DESIGN SD21-SD30. The authority-bound comparison corpus under `docs/references/workbench-ui/` is downstream evidence only and is valid only when its manifest pins these exact current owners.  
**Owners/anchors:** `tests/browser.spec.ts` for deterministic rendered-state capture and coverage assertions; `.github/workflows/ci.yml` for exact-candidate execution and evidence publication; `tests/certification.test.ts` for the exact CI supply-chain rule permitting only the pinned first-party artifact uploader required by this acceptance path.  
**Required mutation:** extend the existing Playwright/GitHub Actions verification path so the exact PR merge candidate proves both the complete governed Workbench surface/state set and the C19-F09 component architecture after the ordinary `browser` gate is green. Evidence generation and acceptance remain separate. The implementation must:
- certify required-new semantic component modules and exact allowlisted consumers; reject duplicate feature-local owners for section/facts/resource/review/document/result responsibilities;
- certify `WorkbenchReview` exposes no arbitrary body compatibility shape, `WorkbenchContextPanel` exposes no generic hierarchy escape, repeated resources use ResourceList, and required-absent generic workflow owners/aliases remain zero;
- certify the affected route renderers satisfy the DESIGN physical-SoC dispositions and no migrated feature selector family recreates the shared semantic component grammar;
- capture every one of the nine lifecycle steps — Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete — from populated deterministic canonical fixtures, not empty shells;
- capture every one of the 37 `SURF-*` contracts declared by current `solution-design.md`, including Queue, Create, Settings/repositories, Settings/OpenCode/accounts, model/runtime Settings, Context, document authoring/read-only, dialogue/activity, proposal review, evidence, approval-task detail, execution-task detail and all confirmation/destructive overlays;
- capture all materially distinct DESIGN/P3 states needed to prove current-attention precedence, dialogue interaction, proposal, document, Implementation task, Queue, application notices, installation readiness, linked-remediation Create/Complete branches, OpenCode login terminal states, safety confirmations, responsive composition and theme parity;
- prove all four WorkItem kinds represented by the reference pack — Change, Defect, Investigation and Audit — at the information-contract surfaces where the kinds materially differ;
- capture every primary workflow step at a wide desktop viewport and at a narrow viewport; additionally capture Light and Dark representatives for every primary interaction class and System against both mocked effective schemes, preserving the existing semantic theme assertions;
- emit an evidence manifest for every capture containing exact checked-out commit SHA, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, runtime route/selection, corresponding authority-bound reference-manifest entry, governing current authority refs, and mandatory `captureScope` identifying the governed region (for example full-workbench, primary-composition, component-reference);
- reject comparison pairs whose governed scope is not equivalent: a component crop may not be presented beside a full-screen reference as if it were full-screen acceptance; generate/capture a matching governed scope instead;
- place the actual PNG captures, manifest and generated comparison index into one GitHub Actions artifact, and produce a review ledger keyed by capture id with independent `schema_information`, `ux_interaction`, `visual_ui` PASS/FAIL values, rationale and authority/capture reference;
- fail evidence generation when a required surface/state/reference/scope mapping is missing or duplicated, fixture state is wrong, runtime errors occur, capture is absent/empty, or coverage is incomplete. Evidence generation success is **not** acceptance success; IA24 remains blocked until the explicit three-dimension review ledger has zero FAIL.

**Acceptance review:** the Actions artifact is evidence, not authority. Every manifest row must receive an explicit `PASS` or `FAIL` against three independent dimensions before IA24:
1. **schema/information fidelity** — every rendered datum/action maps to exactly one current DESIGN `SURF-*` contract row for that surface/state; every applicable DESIGN row is realized with the declared source/class/placement/disclosure rule; required Primary information is present and correctly named/grouped/prioritized; Supporting/Operational information is present only where explicitly authorized; Technical/Diagnostic information is absent from the ordinary surface; the authorized WorkItem Context/Settings-diagnostics/Evidence/confirmation owner exposes exactly its owned value only after explicit entry; close/return restores the ordinary hierarchy without losing current attention. Any rendered datum/action without a DESIGN row, or any missing applicable DESIGN row, is `FAIL` and returns upstream to DESIGN rather than being inferred in implementation;
2. **UX/interaction fidelity** — the owning interaction grammar, current-attention owner, semantic-slot meaning, exactly-one-primary-composition invariant, action precedence, navigation/material hierarchy, state/recovery semantics and responsive composition match current authority; Queue/Review/Evidence/Terminal result do not gain synthetic outer attention, Proposal Review/Readiness/Approval remain direct `WorkbenchReview` primary compositions, and transient Proposal Review/Evidence replace rather than nest;
3. **visual/UI fidelity** — hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, truncation/wrapping, overlays and theme behavior materially conform to current authority and the authority-bound derived comparison reference for the same SURF/state/scope.

Any `FAIL` creates a blocking remediation item owned by the defective implementation/authority layer and requires a fresh post-fix exact-candidate Actions capture for the affected row plus regression revalidation. No aggregate pass may hide a failed row.

**Forbidden:** treating any derived reference corpus as semantic/product authority; pixel-diff threshold as the sole acceptance criterion; screenshot approval in place of existing semantic/browser assertions; generated screenshots blessed from the current implementation without comparison; a new visual-regression SaaS/platform dependency; committing runtime screenshots as a second design system; changing product behavior merely to match a superseded SVG.  
**Proof:** required PR Verification rendered-evidence step succeeds on the exact candidate, publishes exhaustive scope-valid evidence, and the separately reviewable screen-by-screen acceptance ledger has no unresolved `FAIL`; capture generation/coverage alone cannot satisfy IA26.

### Compiled component: `implementation-plan/13-verification-closeout.md`

#### 0.6.0 verification and closeout contract

This component allocates proof across the one canonical T1 candidate and its ordered IA01-IA34 implementation/proof phases. It does not define implementation actions, component APIs or another task representation; those are owned by `12-action-catalog.md`, P4 and DESIGN respectively.

##### In-task architecture and reconstruction checkpoints

This verification component declares no campaign gate or authorization state. Eligibility for signed execution or any bounded IA27/IA28 grant is governed only by the campaign register and the P0 bounded acceptance-evidence rule. A bounded grant is eligible only after current R3/G6 has returned `READY_FOR_SIGNOFF`; this file owns only the evidence/checkpoint requirements.


Preflight IA07 re-proves the existing coordinator-owned signed-checkpoint capability; no candidate byte is relied upon to create it.

Before T1 mutation begins, the execution harness provides the exact Playwright-owned Chromium runtime required by P6 and the BUILDER requests the signed `dependency-lock` gate. Exact `bun ci` must `GATE_PASSED`.

T1 carries the same six logical gate IDs through final validation. During the live BUILDER Run, coherent phase boundaries may request already-signed gates through SD13; those checkpoints provide feedback and continuation inside the same task/Run and never substitute for final V3/V5/V7.

| Completed phase | Before next phase | Required retained evidence |
|---|---|---|
| applicable IA01-IA25 non-UI work | IA27 | non-UI baseline proof; no protected execution-foundation mutation |
| bounded IA27 | IA28 | Compile-closed shell/Context proof is complete: Section/Facts exist, ContextPanel + WorkItemContext are atomically cut over, required-absent generic owners remain zero, shell/header/responsive/theme consumer allowlists pass, and IA27 SURF rows PASS. Review/Resource/Document/Result breaking APIs remain untouched. |
| IA28 | **HUMAN EVIDENCE ACCEPTANCE → HUMAN SIGN-OFF; then post-signoff IA27 completion** | Fresh Queue/Create/application-shell proof against the bounded IA27 candidate + actual production-browser captures independently PASS `schema_information`, `ux_interaction`, `visual_ui`, `component_ownership` and bounded-foundation realization. Current R3/G6 `READY_FOR_SIGNOFF` is the prerequisite for this tranche. The bounded grant terminates here. |
| post-signoff IA27 completion | IA29 | ResourceList is created, every current ResourceRow caller is migrated, ResourceRow is narrowed in the same typecheck-clean checkpoint, and no superseded Row API consumer remains. |
| IA29 | IA31 | WorkbenchDocument/Facts/Section composition proof; required repository/document/Git supporting facts visible; no screen-local document-facts/aside grammar, generic workflow chrome, duplicate heading or technical leakage; all IA29 rows PASS. |
| IA31 | IA30 | Proposal/Readiness/Approval atomically cut over the single WorkbenchReview API with ReviewVerdict + ReviewSections/Facts/ResourceList; Proposal uses DocumentChangeView with raw diff secondary; no local `order-review-*` structural grammar, whole-R3-under-Findings duplication, raw enum or selector; all IA31 rows PASS. |
| IA30 | P0.4 HUX-09 / IA20+IA26 targeted fidelity proof | direct Document/Dialogue/Evidence/State resolution for productive stages excluding Proposal Review; continuous Dialogue semantics; all IA30-owned rows PASS; the IA31 Review owner remains unchanged. |
| P0.4 HUX-09 / IA20+IA26 targeted fidelity proof | IA32 | Same-SURF/state/theme/viewport comparison for the ten operator-rejected captures records no unexplained material hierarchy, density, spacing, alignment, typography, Facts/ResourceList/Review-section/decision, action-prominence, content-measure or responsive divergence; HUX-01 through HUX-09 are explicitly operator `ACCEPTED`. |
| IA32 | IA33 | Implementation purge/rebuild proof + canonical MasterDetail/Section/Facts/ResourceList ownership + both IA32 rows PASS; no local recurring card/section/resource grammar. |
| IA33 | IA34 | Complete uses WorkbenchResult/Section/ResourceList and Evidence remains exact-byte owner; no local terminal/resource grammar; all IA33 rows PASS. |
| IA34 | IA20-IA23 integrated certification | Settings uses Section/Facts/ResourceList with one diagnostics owner; all eleven IA34 rows PASS; 37/37 IA27-IA34 SURF union complete. |
| IA20-IA23 | IA26 | complete semantic/component/theme/responsive/scenario/regression certification PASS |
| IA26 | IA24 | exhaustive exact-candidate **scope-valid** evidence artifact + separately reviewable per-row `schema_information` / `ux_interaction` / `visual_ui` PASS/FAIL ledger with rationale + zero unresolved FAIL |

These are **in-task phase boundaries**, not ExecutionTask dependencies. P6 does not promote candidate bytes between tasks; all phases mutate and inspect the same T1 candidate from the one Approval baseline. A phase advances only after its own coherent implementation and required proof are available. IA27 is not accepted/frozen merely by crossing into IA28; IA28 is the consumer-proven acceptance gate. After IA28 acceptance, a later phase discovering a foundation responsibility/semantic defect returns to IA27/DESIGN rather than patching the accepted foundation locally.

A failed in-task checkpoint permits only correction inside T1's signed semantic scope/accepted design or an explicit execution block. It does not grant provider shell/execute or authorize redesign. Checkpoints never substitute for V3/V5/V7 or T1's complete logical gate union.

##### UI reconstruction evidence law

`12-action-catalog.md` is the single owner of IA27-IA34 mutation procedures and physical dispositions. Verification records evidence against those dispositions; it does not restate or reinterpret them.

For every affected physical owner, retained evidence records: canonical P4/SD/F6B authority; catalogued disposition; pre-mutation evidence where destructive/decompose work is required; exact resulting API/consumer set; removed obsolete selectors/owners; and the phase-local semantic/browser/rendered result. A final-looking screen is insufficient if a forbidden owner, compatibility API, duplicate semantic component responsibility or feature-local substitute grammar remains.

Bounded IA27 proof demonstrates only the catalogued compile-closed shell/Context dispositions. Post-signoff IA27 completion proves the all-caller ResourceRow/ResourceList cutover. IA29/IA31/IA33 prove Document/Review/Result breaking semantic-component cutovers with their complete consumer sets; IA28-IA34 prove the remaining catalogued renderer dispositions and owned SURF rows. Historical purge/RZ16 evidence may explain the defect but never satisfies the new proof.

Phase-local rendered proof remains bounded to each IA's owned SURF rows plus shared invariants exercised there. After all owning phases, IA20/IA26 prove the global component API/consumer/SoC matrix, no local substitute semantic grammar, no nested/synthetic primary composition, and the complete 37-SURF union.

##### Requirement-level proof law
##### Requirement-level proof law

For every stable requirement row in phases 01-11:

- `POSITIVE_NO_CHANGE`: no production edit is authorized for that requirement. Revalidate its exact R1 evidence and named verification owner under V4/V5/V6; a contradiction returns upstream.
- `DEPENDENCY_DELTA`: no duplicate edit is authorized; prove the requirement's own realization still conforms after the named dependency action lands.
- technical/mixed delta: execute only the exact IA owner and prove the authority-defined remainder still conforms; do not infer a preservation target from current implementation.
- verification delta: add only the missing proof; do not infer a behavioral rewrite.

Every package atom must have exactly one execution owner. Shared IA references are consumer dependencies.

A01 corrected-upstream no-code rows `A01-NC01`-`A01-NC05` are also binding proof instructions: verify their exact canonical authority identities and stated R1 semantic propositions under V4, authorize no T1 production mutation for those corrections, and return upstream if any authority/evidence contradiction is found.

##### Exact proof owners

Action-specific proof is defined in `12-action-catalog.md`. Cross-solution IA23 may add only missing integration assertions. IA26 has two distinct obligations: automated exact-candidate rendered evidence generation and explicit rendered acceptance review. A green Actions capture job proves evidence generation only and carries no automatic schema/UX/visual PASS. IA24 runs the final validation contract only after the separate row-level IA26 acceptance ledger is complete with zero FAIL. The binding operator UI findings in `12-action-catalog.md` (`HUX-01` through `HUX-09`) are additional hard acceptance rows: no machine result may disposition them, every affected fresh capture must reference the applicable HUX id, and IA24 remains blocked until every HUX row is explicitly `ACCEPTED` by the operator.

SD20 exact-pin OpenCode proof is a mandatory IA23 precondition to IA26 and IA24: permanent PR verification must execute the actual supported OpenCode 2.2.6 process through Order's production OpenCode boundary while deterministic model output is supplied by the exact isolated simulation tooling authorized by SD20. A fake OpenCode executable, a removed temporary workflow, or a simulated response path that does not launch the exact supported OpenCode process cannot satisfy this proposition. The evidence must state the simulation boundary and must not be reused as proof of remote provider availability, Console OAuth/account connectivity or model quality.

###### Pre-Approval structural-sensor correction

The permanent package sensor is pre-signoff campaign material, not signed implementation surface. Before G5/G5A/R3 may return to PASS it must validate the current **76-path** DESIGN forecast against the exact one-task PLAN `changeSurface`; exactly one task candidate with empty `dependsOn`; the seven required-new semantic primitives plus `DocumentChangeView`; the P4/F6B disposition set; one application-shell, WorkItem-shell, Context and structural-responsive owner; exact IA27-IA34 owner/SURF allocation; and zero duplicate/shadow IA definitions outside `12-action-catalog.md`. It derives the 37-surface universe directly from current `solution-design.md`; the derived reference manifest must match that universe but cannot define it.

This sensor correction is campaign/package fitness only: `tests/architecture.test.ts` remains outside signed implementation tasks. Re-run architecture and root/modular compilation checks on the corrected package before G5 may return to PASS.

##### 0.6.0 implementation delivery branch

The original 0.6.0 implementation branch was deleted after its unauthorized squash delivery to `master`. Remediation continues on the surviving 0.6.0 continuation branch/PR `fix/0.6.0-post-squash-campaign-fitness` / PR #83, which is based on that accidentally integrated candidate. This is a repository-delivery fact only; it does not treat `master` as authorization to release, does not alter Order's Approval/execution semantics, and does not authorize another merge.

- all remaining 0.6.0 remediation, verification and `[Unreleased]` changelog changes continue on PR #83 until the implementation and governed closeout are complete;
- do not split the signed T1 across additional work branches/PRs solely for organizational convenience; any material need to change signed scope, design, ownership or task semantics returns upstream through the normal lifecycle while remaining on this governed work branch unless repository governance itself requires otherwise;
- do not use `release/v0.6.0` for product implementation; that branch name remains reserved for the later metadata-only release PR governed by `GW-DOC-PUBLIC-REPOSITORY-DELIVERY-V2`;
- no further direct or PR-mediated `master` delivery is permitted without explicit user authorization, and the exact current PR candidate must pass the repository's required verification before it can even become merge-ready.

##### Final logical gate union and order

The signed task's `gateIds` order is executable order for each fresh REVIEWER workspace and for final V3/V7. `dependency-lock` must be first so later Node-based gates see the exact lockfile-installed dependency graph. The execution harness must have provisioned the pinned Playwright Chromium runtime before execution starts.

1. dependency-lock
2. typecheck
3. architecture
4. test
5. build
6. browser

The six logical gates remain the canonical signed task gate union. IA26 is an additional terminal PR acceptance obligation executed by GitHub Actions after those gates; it does not introduce a seventh P6 gate or replace any V0-V7 proposition.

##### Bounded pre-sign-off IA27/IA28 evidence lane

The pre-sign-off IA27/IA28 lane is conditional evidence machinery only. It is eligible only after the exact current package has passed R3/G6 as `READY_FOR_SIGNOFF`. Whether a grant is active is then owned exclusively by campaign §17A/§18; without exact-package authorization from that owner, this lane confers no mutation authority. When authorized, it must remain capable of producing IA27/IA28 evidence while later-phase UI obligations are open:

1. PR verification first runs dependency-lock, typecheck, architecture, the complete non-browser test gate and build on the exact merge candidate;
2. before the ordinary full browser step, a dedicated Playwright scenario/capture lane runs only the IA27/IA28 proof set: `SURF-WI-001`, `SURF-WI-CONTEXT-001`, `SURF-APP-001`, `SURF-QUEUE-001` and `SURF-CREATE-001`, plus the exact semantic/browser states declared by IA27/IA28;
3. that lane uploads a separately named artifact bound to the exact candidate SHA and records only phase-local evidence; it does not emit or imply `GATE_PASSED(browser)`;
4. the ordinary full browser suite then runs unchanged. Failures owned by IA29-IA34 remain visible and blocking for their owning phases/final validation, but they do not retroactively suppress the already-generated IA27/IA28 artifact;
5. final IA26 remains after a green ordinary browser gate and still captures/reviews the complete 37-SURF exact-candidate union.

The bounded lane is not a waiver, test skip or alternate browser gate. It exists solely to make the campaign's phase-local pre-sign-off evidence boundary executable without authorizing downstream implementation.

##### First rendered foundation acceptance — IA28

SD21/F6B's closed ledger plus IA27 implementation/disposition evidence, semantic checks, browser proof and `SURF-WI-001` render establish **foundation readiness**, not product acceptance. Foundation correctness must be demonstrated through a real consumer screen family.

IA28 is therefore the first acceptance test for the Workbench foundation. Before IA29 may begin, the exact IA28 candidate must produce actual browser-rendered evidence for `SURF-APP-001`, `SURF-QUEUE-001` and `SURF-CREATE-001`, covering the Queue/application shell, Queue states, application notices/readiness, Create WorkItem, linked remediation and active-account utility states required by the IA28 face ledger. This evidence is produced only after R3/G6 `READY_FOR_SIGNOFF` by the bounded phase-local lane above and is reviewed for the subsequent human evidence-acceptance/sign-off decision even when the ordinary browser suite remains red solely on explicitly later-phase obligations; such red results remain recorded blockers and cannot be reclassified as pass. The review uses current P3/P4/DESIGN/theme authority as normative truth and only authority-bound reference entries whose manifest pins those exact owners as derived visual comparison material.

The reviewer must record for every IA28 SURF row:

- `schema_information = PASS | FAIL`;
- `ux_interaction = PASS | FAIL`;
- `visual_ui = PASS | FAIL`.

The checkpoint must also record one **foundation-realization PASS/FAIL** covering the shared hierarchy, geometry, primitive composition, action/status treatment, typography/spacing/density, disclosure behavior, theme realization and responsive behavior actually visible in those screens. This is review evidence only; it is not a runtime schema or second design specification.

Failure routing is exact:

- recurring primitive/token/shell/hierarchy/disclosure/theme/responsive defect → IA27;
- Queue/Create/application-utility-local defect → IA28;
- missing, ambiguous or contradictory product/information/interaction classification → DESIGN;
- no IA29 advance while any IA28 row or foundation-realization verdict is FAIL/unreviewed.

Only this checkpoint accepts the bounded shell/Context foundation slice. It does not freeze Review/Resource/Document/Result APIs that have not yet cut over; each is frozen only after its consumer-atomic checkpoint. IA26 remains the separate final exhaustive 37-SURF exact-candidate acceptance and can still reopen any defective owner.

##### Final exhaustive rendered 0.6.0 UX/UI acceptance — IA26

The exact PR merge candidate must pass a dedicated GitHub Actions rendered-acceptance step before IA24 closeout. This step uses the existing Playwright production Workbench harness and the authority-bound derived comparison corpus at `docs/references/workbench-ui/reference-manifest.json`; it does not create a second visual specification.

###### Evidence generation contract

GitHub Actions must:

1. execute only after dependency-lock, typecheck, architecture, test, build and the ordinary browser suite have passed;
2. run the IA26 capture cases in `tests/browser.spec.ts` against the exact checked-out PR merge candidate;
3. capture actual PNG output for every IA26-required workflow/surface/state/view/theme row;
4. generate a machine-readable manifest and comparison index containing the exact candidate SHA and, for every capture, WorkItem kind, workflow step/surface/state, fixture identity, viewport, effective theme, route/selection, current authority refs, corresponding reference path and mandatory governed `captureScope`;
5. prove exhaustive coverage **and scope equivalence**: a runtime crop may be compared only with a reference governing the same composition scope; a component crop may not stand beside a full-screen reference as equivalent acceptance evidence;
6. fail evidence generation on missing/duplicate mappings, missing/invalid captureScope, unreachable declared state, runtime error, missing/empty capture or incomplete manifest/index;
7. upload the actual captures plus manifest/index as one PR-run artifact using `actions/upload-artifact` pinned to commit `ea165f8d65b6e75b540449e92b4886f43607fa02` (the current `v4` ref at PLAN correction time), with artifact identity including the exact checked-out candidate SHA.

The capture harness may add deterministic fixture setup and screenshot calls inside the signed `tests/browser.spec.ts` verification owner. The CI mutation remains inside the signed `.github/workflows/ci.yml` owner. Rendered acceptance is carried by its own verification task and does not authorize presentation changes.

###### Acceptance review contract

The GitHub Actions artifact is then reviewed row by row. Automated capture/coverage success is not a review verdict. Every review record is bound to the exact capture, governed scope and current authority and includes explicit rationale.

Every manifest row records three independent verdicts:

- `schema_information`: every rendered datum/action maps to exactly one current DESIGN `SURF-*` row and every applicable DESIGN row is realized with its declared source/class/placement/disclosure rule; all authority-required Primary information is present with correct labels/grouping/hierarchy/prominence; Supporting/Operational information appears only where explicitly authorized; generic workflow-state/material chrome and raw typed/technical vocabulary are absent from ordinary UI; singular Context/Settings-diagnostics/Evidence ownership and correct return behavior are preserved. An unmapped rendered datum/action or missing applicable DESIGN row is `FAIL` and returns upstream to DESIGN rather than being inferred by implementation;
- `ux_interaction`: the direct owning interaction class is correct; required-absent WorkflowStepFrame/WorkflowMaterialSelector equivalents are absent; Dialogue remains continuous across OPEN/REQUIRED_INPUT/PROCESSING turns; Review/Evidence/Terminal primaries are not wrapped/nested; current-attention/action precedence, recovery and responsive composition conform;
- `visual_ui`: rendered hierarchy, density, spacing, alignment, geometry, typography, component consistency, affordances, clipping/wrapping, overlays and theme behavior materially conform.

For **HUX-09**, `visual_ui` review is a mandatory same-scope reference-fidelity comparison, not a gestalt or machine-only judgment. The reviewer must compare the fresh exact candidate for each operator-rejected capture against the corresponding current `SURF-*`/state/theme composition in `docs/references/workbench-ui/reference-atlas.html` / `reference-manifest.json` and record any material difference in hierarchy, density, spacing, alignment, typography, Facts/ResourceList/Review-section/decision anatomy, action prominence, content measure or responsive recomposition. An automated browser/render PASS cannot satisfy this row. The re-review evidence set is restricted to the ten HUX-09 capture ids unless a shared-owner correction materially changes another same-owner surface; any such additional surface is diagnostic evidence and must not dilute the operator's targeted acceptance set.

Each dimension is `PASS` or `FAIL`; no `PARTIAL`, aggregate-only pass or unreviewed row may reach IA24. An unexplained material divergence from the same-scope authority-bound reference composition is `FAIL`. A divergence required by newer current authority is `PASS` only when the exact superseding authority is recorded.

Any failed row blocks closeout, opens remediation at the defective implementation/authority owner, and requires a fresh exact-candidate GitHub Actions capture and review for the affected row after correction. Existing semantic/browser tests remain mandatory and cannot be replaced by screenshot acceptance.


##### V0-V7 final review obligations

V4/V5/V6 explicitly verify:
- all 112 stable rows retain their exact current R1 evidence and DESIGN disposition;
- all 27 package-local atoms, including `PL-C12-02`, are satisfied by their one implementation or DESIGN-positive-reuse proof owner;
- every `POSITIVE_NO_CHANGE` and DESIGN-positive-reuse obligation remains true;
- T1 retains the exact 76-path `changeSurface`, including the eight C19-F09 component/specialist paths; it remains the cumulative immutable forecast for the corrected package;
- every actual changed path is inside signed `scope`, outside exclusions/protected material, and either forecast or positively proven as minimum same-layer responsibility-preserving variance;
- forecast variance changes no semantic owner, public contract, state meaning, effect boundary, dependency direction/external dependency, validation contract or authorized behavior;
- current-v2 task non-vacuity is enforced without changing published v1 task semantics or creating a second task schema/parser/review owner;
- bootstrap `dependency-lock` passed before T1 mutation; IA27 realized every catalogued REQUIRED_NEW/DECOMPOSE_REFACTOR/DESTRUCTIVE_REPLACEMENT/REQUIRED_ABSENT outcome and freshly proved any retained no-edit/bounded owner; IA28 freshly accepted the foundation in real consumers; IA29-IA34 completed their exact renderer dispositions and SURF proofs; IA20-IA23/IA26 proved global component ownership/SoC plus integrated/final acceptance before IA24;
- FCIS/SoC/DRY/canonical ownership/strict typing/no-OOP/no-DTO;
- no compatibility/fallback/shadow state/owner, deprecated prop/alias, translation adapter, hidden legacy DOM, dual old/new path, feature-flagged superseded topology or CSS shim;
- corrected productive installer semantics without loss of incomplete-config recovery or upgrade continuity;
- no implementation-derived product semantics.
- IA26 exact-candidate rendered evidence is exhaustive and scope-valid; the Actions artifact is bound to the reviewed candidate; the separate acceptance ledger records PASS with rationale for every required schema/information, UX/interaction and visual/UI dimension; zero unresolved discrepancy remains. Capture generation success alone is not acceptance. Required-absent generic composition, direct Review/Dialogue ownership and zero legacy/adapter paths are proven; no parent-SURF PASS hides a visibly nonconforming descendant.

`tests/architecture.test.ts`, `pontivus-order.toml`, P1-P6 docs, package/lock metadata and workflow metadata other than the explicitly signed `.github/workflows/ci.yml` SD20 verification change remain outside T1. The pre-signoff campaign/traceability sensor may change only before Approval; any such change must be included in the exact G5/G5A/R3 evidence package before sign-off and is never a T1 candidate edit.
