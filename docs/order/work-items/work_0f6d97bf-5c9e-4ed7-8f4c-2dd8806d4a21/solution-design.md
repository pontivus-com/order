<!-- Order template: change-design-v2; authority: GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-TECHNICAL-ARCHITECTURE-V2 -->

# Order 0.6.0 integrated technical solution design

## Exact design basis

This DESIGN is regenerated after G-F10 from the exact requirement-level factual/functional package, not from concern membership or current-state preservation.

- R1 `research.md`: blob `ce49b87222a9594c82be2995eaa89a4a648385d0` — 112/112 stable requirements with exact realization evidence.
- R2 `requirements.md`: blob `d2246f070f1748661b5c670952461612834def9c` — 112/112 stable requirements, all canonical `REFERENCE`, plus package consequences including FR007 installer closure.
- P4 Technical Architecture: `8f3a15e0363f0055fbddc08ae829585f9bc8e556`.
- P4 Workbench: `7ccbe98886effd8169b1d8700ef9cab257e37bd4`.
- P4 Workbench Theme: `f8aa4ce3d453f59cd2cd607c80e58b334d8a563c`.
- P4 OpenCode Integration: `1a02c3730a82c43b310fd0ebba1f4ac4285b24a8`.
- P4 Execution Control Plane: `93f4fddbf2be3af97c8300b5c7692403a39cfb22`.
- P6 Canonical Contracts: corrected blob `54198ef2d3e1d9ed7483a4de96e4c8c0086e9568`.

Current implementation/tests/UI are used only through the exact R1 evidence cited below. A `POSITIVE_NO_CHANGE` is therefore an explicit technical decision backed by that evidence; it is never an implicit preservation target.

## DESIGN disposition vocabulary

- `POSITIVE_NO_CHANGE`: exact R1 evidence positively proves the requirement's current P4-P6 realization; no implementation task is created for that requirement.
- `DEPENDENCY_DELTA`: the requirement's own realization remains, but it consumes a separately owned technical correction.
- `TECHNICAL_DELTA`: the requirement's direct realization must change.
- `MIXED_TECHNICAL_DELTA`: only the exact violated sub-obligation changes; conforming remainder is preserved by authority.
- `VERIFICATION_DELTA`: behavior is conforming but binding permanent proof is incomplete.
- `MIXED_TECHNICAL_AND_VERIFICATION_DELTA`: both an exact behavioral sub-obligation and permanent proof require correction.

## Technical change solution catalog

| Solution | Owned defect/outcome | Canonical technical owner | Expected implementation surface | Technical decision | Permanent proof |
|---|---|---|---|---|---|
| SD01 | C21 product-language realization | P2 Product Identity + P4 Workbench presentation | README.md; ui/src/TerminalResult.tsx; ui/src/workbench-presentation.ts | Use verified result as umbrella product outcome and Verified candidate only for executed delivery; reuse the canonical P4 terminal-result projection and replace local enum prettification; no lifecycle/state/contract change. | tests/workbench-presentation.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| SD02 | C22 authority resolution | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-OPENCODE-INTEGRATION-V1 | src/core/governance.ts; src/daemon/authority.ts; src/daemon/stage.ts | Purely resolve same-layer precedence plus P1 default/override/extension/fitness bindings before productive provider context; unresolved material relation blocks before inference. | tests/core.test.ts; tests/daemon.test.ts; tests/certification.test.ts |
| SD03 | C02 authoring presentation | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/CreateWorkItem.tsx | Ordinary label is Concerns; linked remediation project is fixed parent-project context. Preserve canonical kind/schema/body/metadata owners. | tests/browser.spec.ts |
| SD04 | C02/C04 singular source admission | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/daemon/work-item-source.ts | Factor one new-source QueuePlan producer and persist both created/discovered sources through existing applyPlan; remove direct create-path WorkItem store. | tests/daemon.test.ts |
| SD05 | C03 archived queue filtering | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/app.tsx; ui/src/WorkItemQueue.tsx | App selects active/include-archived canonical dataset then applies project/search once; queue does not replace filtering semantics. | tests/browser.spec.ts |
| SD06 | C04 documentation-Git exact review | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | ui/src/DocumentWorkspace.tsx | Render exact canonical changed-path/state set in confirmation before existing bounded commit command; no second Git-status owner. | tests/browser.spec.ts |
| SD07 | C05/C17 current-attention visibility | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ActivityWorkspace.tsx; ui/src/WorkItemWorkspace.tsx; ui/src/workbench-presentation.ts | Keep historical/supporting inspection while exact higher-priority current owner/reason/action remains visible and directly reachable; do not create browser workflow state. | tests/workbench-presentation.test.ts; tests/browser.spec.ts |
| SD08 | C06 durable authority-changing input | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/lifecycle.ts; src/daemon/stage.ts | After answered STAGE_CHOICE/AUTHORITY_DECISION/AUTHORITY_CONFLICT that changes durable authority, stage completion requires later adopted canonical authority; INFORMATION/EVIDENCE unchanged. | tests/core.test.ts; tests/daemon.test.ts |
| SD09 | C07/C08 permanent authority proposal/adoption | GW-DOC-TECHNICAL-ARCHITECTURE-V2 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/contracts.ts; src/core/governance.ts; src/daemon/authority.ts; src/daemon/stage.ts | Extend the one proposal/adoption owner: R2 admits current P2/P3 targets; DESIGN current P4/P5/P6 targets; re-resolve role/layer/path/base hash before adoption. No new proposal model. | tests/core.test.ts; tests/daemon.test.ts |
| SD10 | C09 non-vacuous signed task | GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/contracts.ts; src/core/execution.ts; src/daemon/authority.ts | Reject implementation-required SignedTaskBlock with zero/materially empty tasks using the existing task representation and validator. | tests/core.test.ts; tests/daemon.test.ts |
| SD11 | C10 Readiness judgment | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ReadinessWorkspace.tsx; ui/src/workbench-presentation.ts | Dominant verdict derives from typed R3 completion outcome; material maturity/currentness is supporting state. | tests/workbench-presentation.test.ts; tests/browser.spec.ts |
| SD12 | C11 Approval identity and hierarchy | GW-DOC-CANONICAL-CONTRACTS-V2 + GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | src/core/contracts.ts; src/daemon/authority.ts; ui/src/SignoffReview.tsx | Trim/reject blank approvedBy at canonical ingress and show readiness/currentness before technical package identity; browser validation remains feedback. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts |
| SD13 | C12 signed in-task checkpoint | GW-DOC-EXECUTION-CONTROL-PLANE-V1 + GW-DOC-CANONICAL-CONTRACTS-V2 | src/core/contracts.ts; src/core/execution.ts; src/daemon/execution.ts; src/daemon/validation.ts | BUILDER may request exactly one signed gate checkpoint as terminal turn action; coordinator executes existing gate owner, records existing evidence/result and continues same Run/session; provider shell remains denied. | tests/core.test.ts; tests/daemon.test.ts |
| SD14 | C16 Settings hierarchy | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/SettingsWorkspace.tsx | Keep one canonical Settings/config owner but demote exact roots/endpoints/credential-like identities to Technical details except active configuration input. | tests/browser.spec.ts |
| SD15 | C18 required-input focus | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | ui/src/ActivityComposer.tsx; ui/src/ActivityWorkspace.tsx | Focus Workbench-owned composer once for each newly current required-input event id; rerender/polling does not refocus; no private Astryx DOM policy. | tests/browser.spec.ts |
| SD16 | C19 exhaustive renderer fitness | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | tests/certification.test.ts | Under immutable architecture-gate material rule, add exhaustive production-renderer classification proof to existing test gate, including ActivityComposer; do not mutate tests/architecture.test.ts inside T1. | tests/certification.test.ts |
| SD17 | C20 scenario-41 certification | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | tests/browser.spec.ts | Certify all four work-kind Work request + Research information contracts and distinct Change/Defect downstream obligations. | tests/browser.spec.ts |
| SD18 | C20 component/theme parity certification | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 + GW-DOC-WORKBENCH-THEME-V1 | tests/browser.spec.ts; tests/workbench-presentation.test.ts | Certify representative Queue/Create/Settings/document/dialogue/review/Implementation/evidence/result/Context/overlay semantic roles under System/Light/Dark. | tests/browser.spec.ts; tests/workbench-presentation.test.ts |
| SD19 | C16 guided productive installer | GW-TR-007-GUIDED-PRODUCTIVE-BOOTSTRAP + corrected GW-DOC-CANONICAL-CONTRACTS-V2 | src/shell/setup.ts; new tests/installer.test.ts | Remove fresh-install success/defer branch. `runInstallerGuidedSetup` reuses existing login/model/repository/reference collection and returns success only after productive choices exist. Preserve incomplete v4 as daemon/Settings recovery state and preserve update/migration/rollback behavior. No config schema or installer-orchestrator duplication. | new tests/installer.test.ts; tests/order-migration.test.ts |

## A01 corrected-upstream no-code dispositions

These rows are **trace dispositions, not new semantic requirements**. They retain material R2 consequences that have already been applied to their canonical authority owners and therefore require no T1 production mutation. They remain explicit so corrected authority cannot disappear between R2, DESIGN and PLAN merely because the code delta is zero.

| Trace key | R2 consequence | Current canonical owner/evidence | DESIGN disposition | Technical consequence | Permanent proof |
|---|---|---|---|---|---|
| `A01-NC01` | C01 product-level success distinguishes verified terminal result from implementation-required verified candidate and preserves valid no-code terminal success. | `GW-DOC-SYSTEM-BRIEF` blob `a1784be23293cb65b4a70952e45e5e16a0515ca1`, §8 | `ALREADY_CORRECTED_NO_CODE` | No runtime/lifecycle mutation. DESIGN consumes the corrected P2 meaning as the product-level invariant for terminal presentation and lifecycle acceptance. | authority-byte/hash freshness + R1 C01-O06/O13/O14 recheck + V4 semantic review |
| `A01-NC02` | C01 clause-level P3 DELTA points `GW-P2-CONTROLLED-WORK` to its actual System Brief §9 declaration. | `GW-DOC-WORK-LIFECYCLE` blob `013bc1297c3d167b776e115f428517b7cedbea57`, §7 | `ALREADY_CORRECTED_NO_CODE` | Documentation authority correction only; no runtime contract/state behavior changes. | exact authority-byte/hash freshness + R1 C01-O14 recheck + V4 semantic review |
| `A01-NC03` | C21 canonical product language preserves verified-result/verified-candidate distinction, explicit product intent, conditional implementation and the bounded operator-triggered WorkItem documentation-Git allowance without implying automatic delivery commits. | `GW-DOC-PRODUCT-IDENTITY` blob `f45ee2ea00cf91c5b861c59d3d19f72b3e39611f` | `ALREADY_CORRECTED_NO_CODE` | No additional P2 mutation in T1. SD01 changes only the still-violating README/terminal projections; corrected canonical identity remains the source. | authority-byte/hash freshness + R1 C21 corrected-finding recheck + V4 semantic review |

## SD01 complete technical realization — product-language projection

**Canonical owner and reuse:** `GW-DOC-PRODUCT-IDENTITY` owns product language. `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §16.3` already owns the technical terminal-result projection rule: `CANDIDATE_DONE` renders **Verified candidate**, while other `WorkOutcome` variants use canonical product-facing labels rather than prettified internal enum names. SD01 reuses that owner; it does not create a second presentation policy.

**Producer → carrier → consumer path:**

```text
canonical WorkItem.outcome (P6/core lifecycle result)
  -> existing WorkItem browser projection
  -> one pure product-facing outcome-label mapping in ui/src/workbench-presentation.ts
  -> ui/src/TerminalResult.tsx attention + final-governed-outcome presentation

P2 Product Identity canonical reusable descriptions
  -> README.md public projection
```

**Required replacement/removal:**

- remove the feature-local `TerminalResult.tsx::outcomeLabel` enum-prettification policy;
- make `TerminalResult` consume the shared pure canonical product-label mapping;
- correct README hero/intro/result-boundary language so implementation is conditional and verified result is the umbrella outcome;
- remove the absolute public claim that Order simply “does not commit” where it would erase the governed operator-triggered WorkItem documentation-Git capability; preserve the prohibition on automatic implementation/candidate commit/push/merge/deploy.

**Invariants / negative behavior:**

- no `WorkStage`, `WorkOutcome`, persistence, HTTP, provider, task or lifecycle semantic changes;
- `CANDIDATE_DONE` alone maps to **Verified candidate**;
- every other current `WorkOutcome` maps explicitly to its canonical operator-facing product label; no fallback enum prettification may leak internal codes;
- non-candidate outcomes must not render candidate resources or imply implementation occurred;
- README must not imply that every WorkItem executes or that all terminal results are candidates;
- no new DTO/view-model/state owner or presentation service is introduced.

**Failure/recovery:** malformed/unknown outcome values remain a canonical contract/type violation; presentation does not guess a label. Resource-load failures remain existing TerminalResult supporting-state behavior and do not alter outcome classification.

**Rejected alternatives:** keep local enum prettification (rejected: leaks internal state language); introduce a second product-label table inside `TerminalResult` (rejected: duplicate owner); change `WorkOutcome` values to match display copy (rejected: presentation concern leaking into canonical state contract).

**Permanent proof propositions:**

- `tests/workbench-presentation.test.ts`: exhaustive current `WorkOutcome` → canonical product-facing label mapping, including `CANDIDATE_DONE -> Verified candidate`, and no generic underscore/title prettification path;
- `tests/browser.spec.ts`: terminal candidate presentation uses **Verified candidate** and a representative non-candidate terminal result uses its canonical non-candidate label without candidate resources;
- `tests/certification.test.ts`: README retains **verified result** umbrella language, conditions implementation/candidate language, preserves the explicit documentation-Git exception, and does not restore universal candidate/delivery wording.

## Exhaustive stable-requirement technical ledger

| Stable requirement | Exact R1 evidence | R1 verdict | DESIGN disposition | Delta solution(s) | Canonical P4-P6 owner(s) | Technical realization / correction | Verification ownership |
|---|---|---|---|---|---|---|---|
| `GW-FR-001-GOVERNED-LIFECYCLE` | `C01-O03`, `C01-O05`, `C01-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-002-REPRODUCIBLE-AUTHORITY` | `C01-O01`, `C01-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-003-DURABLE-BOUNDED-EXECUTION` | `C12-O01`, `C12-O02`, `C12-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-004-INDEPENDENT-VALIDATION` | `C12-O08`, `C12-O09`, `C12-O10`, `C12-O11`, `C12-O12`, `C20-O10` | `CONFORMS_WITH_DEPENDENCY` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-005-LOCAL-WORKBENCH` | `C05-O01`, `C05-O04`, `C05-O12`, `C19-O06`, `C19-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-006-MINIMUM-VERIFIED-CANDIDATE` | `C12-O12`, `C12-O13`, `C12-O19` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-007-GUIDED-PRODUCTIVE-BOOTSTRAP` | `DIRECT-FR007` | `VIOLATES` | `TECHNICAL_DELTA` | `SD19` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Fresh-install success path violates FR007 and corrected P6; remove deferred-Settings success branch while preserving upgrade/recovery non-productive config capability. | new `tests/installer.test.ts`; existing `tests/order-migration.test.ts` |
| `GW-FR-008-GOVERNED-REPOSITORY-ACCESS` | `C16-O02`, `C16-O05`, `C22-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/core.test.ts; tests/daemon.test.ts; tests/browser.spec.ts; tests/certification.test.ts |
| `GW-FR-009-PORTABLE-WORK-ITEM-SOURCE` | `C04-O01`, `C04-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-010-GOVERNED-WORK-KIND-CATALOG` | `C02-O01` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-011-VERSIONED-AUTHORING-SCHEMAS` | `C02-O02`, `C02-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-012-CATALOG-DRIVEN-AUTHORING` | `C02-O04`, `C02-O05`, `C02-O07` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD03` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Kind/project/system-metadata behavior remains; ordinary concern language must change from raw Concern IDs to Concerns. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-013-PORTABLE-QUEUE-RECONCILIATION` | `C03-O01`, `C03-O02`, `C03-O03`, `C03-O05`, `C03-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-014-SOURCE-FRESHNESS` | `C04-O14`, `C02-O12` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-015-SOURCE-CONTEXT-PROJECTION` | `C06-O02`, `C22-O06` | `CONFORMS_WITH_DEPENDENCY` | `DEPENDENCY_DELTA` | `SD02` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Source/schema projection itself remains; productive context must consume the corrected resolved-authority ordering rather than raw same-layer ambiguity. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-016-SOURCE-CONFORMANCE-IDENTITY` | `C06-O15`, `C22-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-017-SOURCE-SIGNOFF-BINDING` | `C11-O01`, `C11-O03`, `C12-O20` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-018-SOURCE-CONSUMER-CLOSURE` | `C04-O07`, `C04-O14` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD04` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Freshness/read-side consumers remain; UI-created and discovered source admission must converge on one QueuePlan/applyPlan owner. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-019-SOURCE-CLARIFICATION-DURABILITY` | `C06-O13` | `VIOLATES` | `TECHNICAL_DELTA` | `SD08` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Authority-changing clarification must require later adopted canonical authority before completion; conversation remains evidence only. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-020-WORKBENCH-SOURCE-OPERATIONS` | `C03-O04`, `C03-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-021-MARKDOWN-WORKSPACE` | `C04-O15`, `C05-O02`, `C05-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-022-GOVERNED-MARKDOWN-EDITING` | `C04-O03`, `C04-O08`, `C04-O14` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-023-MARKDOWN-SOURCE-FIDELITY` | `C04-O01`, `C04-O02` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-024-LIFECYCLE-FRESHNESS-VISIBILITY` | `C17-O02`, `C17-O05`, `C17-O09` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Canonical stale/current derivation remains; explicit inspected material must not hide the exact current owner/recovery action. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-025-DURABLE-INTENT-INTERACTION` | `C06-O13` | `VIOLATES` | `TECHNICAL_DELTA` | `SD08` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Durable-intent replies require governed authority mutation/adoption before downstream progression. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-026-SOURCE-BOUND-SIGNOFF-INTEGRATION` | `C11-O01`, `C11-O02`, `C11-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-027-READONLY-EXECUTION-EDITOR-BOUNDARY` | `C04-O15`, `C12-O03`, `C12-O17` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts  |
| `GW-FR-028-NONDELIVERY-TERMINAL-VIEW` | `C13-O01`, `C13-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-029-NO-IDE-SCOPE` | `C04-O15` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-060-PROJECT-LOCAL-WORKITEM-DOCUMENTATION` | `C04-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-061-DETERMINISTIC-WORKITEM-DOCUMENT-LAYOUT` | `C04-O04`, `C04-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-062-EXPLICIT-DOCUMENTATION-GIT-SAVE` | `C04-O08`, `C04-O10`, `C04-O13` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-063-DOCUMENTATION-GIT-STATUS` | `C04-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-065-EXACT-SOURCE-MARKDOWN-EDITOR` | `C04-O02`, `C04-O15` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-066-DOCUMENT-EDIT-PREVIEW-MODES` | `DIRECT-FR066` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-067-MARKDOWN-AUTHORING-ERGONOMICS` | `C18-O11`, `DIRECT-FR067` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-068-LIVE-SAFE-MARKDOWN-PREVIEW` | `DIRECT-FR068` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-069-EDITOR-STATE-CONTINUITY` | `C05-O07`, `C18-O04`, `C18-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-070-REPOSITORY-LIFECYCLE-DRAFT-REDISCOVERY` | `C04-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-071-DOCUMENTATION-GIT-ELIGIBILITY` | `C04-O12`, `C04-O13` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-072-REPOSITORY-LOCAL-GIT-IDENTITY` | `C04-O12` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-073-OPENCODE-ACCOUNT-VISIBILITY` | `C16-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-074-OPENCODE-SAVED-ACCOUNT-SWITCHING` | `C16-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-075-OPENCODE-ACCOUNT-LOGIN` | `C16-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-076-OPENCODE-ACCOUNT-MUTATION-SAFETY` | `C16-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-077-DIRECT-WORKITEM-TITLE-EDIT` | `C04-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-078-PORTABLE-WORKITEM-ARCHIVE` | `C03-O06`, `C03-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-079-PRODUCTIVE-INSTALLATION-READINESS` | `C16-O09`, `C16-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-080-CONFIGURATION-CONTINUITY` | `DIRECT-FR080` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-081-OPENCODE-ACCOUNT-CONTINUITY` | `C16-O06`, `DIRECT-FR081` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-082-REPOSITORY-AND-DOCUMENT-CONTINUITY` | `C16-O04`, `DIRECT-FR082` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-087-WORKITEM-AUTHORING-OWNERSHIP` | `C02-O07`, `C02-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-088-WORKITEM-METADATA-PRESERVATION` | `C04-O02`, `C04-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-089-HUMAN-FIRST-WORKITEM-SOURCE-EDITOR` | `C04-O02`, `C04-O15` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-090-WORKITEM-BODY-CONFLICT-SAFETY` | `C04-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-091-FIRST-CLASS-INSTALLATION-CONFIGURATION` | `C16-O01`, `C16-O06`, `C16-O08`, `C16-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-092-CONNECTED-REPOSITORY-CONFIGURATION` | `C16-O02`, `C16-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-093-DOCUMENT-ROOT-MIGRATION-SAFETY` | `C16-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts |
| `GW-FR-095-CENTRALIZED-APPLICATION-SETTINGS` | `C16-O01`, `C16-O02`, `C16-O06`, `C16-O08`, `DIRECT-FR095` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/certification.test.ts; tests/order-migration.test.ts  |
| `GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION` | `C07-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/browser.spec.ts; tests/markdown-source-formatting.test.ts; tests/certification.test.ts |
| `GW-FR-097-STAGE-CONFORMANCE-OUTPUT-CLOSURE` | `C06-O14`, `C07-O07`, `C08-O09`, `C09-O09`, `C10-O03` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-098-READINESS-AUTHORITY-TOPOLOGY-REVIEW` | `C10-O01`, `C10-O09`, `C10-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/architecture.test.ts; tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-099-PRODUCTIVE-PROVIDER-WORKSPACE-CONTAINMENT` | `C15-O02`, `C15-O08`, `C15-O15`, `DIRECT-FR099` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts  |
| `GW-FR-100-COMPLETE-REPOSITORY-INSTRUCTION-CLOSURE` | `C22-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-101-PRODUCTIVE-OPENCODE-PATH-CONSISTENCY` | `C15-O03`, `C15-O04`, `C15-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-102-FAILURE-ORIGIN-CLASSIFICATION` | `C15-O12`, `C15-O13` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-103-OPENCODE-INTEGRATION-CERTIFICATION-COVERAGE` | `DIRECT-FR103` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-104-STAGE-WORKSPACE-FRESHNESS` | `C15-O03`, `C15-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-105-PRODUCTIVE-MODEL-CONTEXT-AUTHORITY-CLOSURE` | `C22-O06`, `C22-O09`, `C22-O10`, `C15-O15` | `CONFORMS_WITH_DEPENDENCY` | `DEPENDENCY_DELTA` | `SD02` | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-CANONICAL-CONTRACTS-V2 | Trusted integration/context classification remains; Order-governed authority must first be deterministically resolved under C22-F01. | tests/daemon.test.ts; tests/certification.test.ts |
| `GW-FR-200-CANONICAL-WORKFLOW-OBSERVATION` | `C05-O05`, `C05-O06`, `C05-O11` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Observation derivation remains; presentation must preserve the exact current attention owner while historical/supporting material is inspected. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-201-OBSERVATIONAL-READS` | `C05-O03`, `C05-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-202-ATOMIC-COMMAND-OUTCOME` | `C17-O04`, `C17-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-203-SERIALIZED-RUN-TURNS` | `C15-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-204-EXACT-HUMAN-INPUT-OWNERSHIP` | `C06-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-205-MONOTONIC-REACH-HISTORY` | `C01-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-206-CURRENT-ATTENTION-PRECEDENCE` | `C17-O05` | `VIOLATES` | `TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Current attention owner/action must remain visible and directly reachable regardless of inspected historical material. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-207-PROPOSAL-AUTHORITY-BOUNDARY` | `C14-O05`, `C14-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-208-ACTIVE-RUN-AUTHORITY-EXCLUSION` | `C14-O09`, `C05-O09` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-209-SOURCE-BLOCKER-ADMISSION` | `C03-O04`, `C04-O14` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-210-ASYNC-WORKFLOW-CONVERGENCE` | `C17-O07` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-211-READINESS-RETURN-CONTINUITY` | `C10-O04`, `C01-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-212-APPROVAL-PURITY-AND-CURRENTNESS` | `C11-O02`, `C11-O03`, `C11-O10`, `C11-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-213-EXECUTION-BLOCKER-PRECEDENCE` | `C12-O17`, `C17-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-214-STABLE-WORKBENCH-GEOMETRY` | `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-215-STABLE-WORKFLOW-RAIL` | `C05-O01`, `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-216-NO-CONDITIONAL-PRESIGNOFF-RAIL` | `C05-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-217-PRIMARY-INFORMATION-ECONOMY` | `C05-O10`, `C05-O12`, `C19-O03` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD11`, `SD12`, `SD14` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | General geometry remains; Readiness, Approval and Settings local hierarchies must stop promoting maturity/technical identity over the governed judgment/action. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-218-SPACE-CLASS-CONSISTENCY` | `C05-O12`, `C19-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-219-EXPLICIT-CONTEXT` | `C05-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-220-PRESIGNOFF-CONTINUITY` | `C05-O05`, `C05-O06`, `C05-O12` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD07` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Shared interaction grammar remains; current-attention visibility must remain continuous through explicit material selection. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-221-READINESS-REVIEW-HIERARCHY` | `C10-O06`, `C10-O07` | `VIOLATES` | `TECHNICAL_DELTA` | `SD11` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Typed R3 outcome becomes dominant Readiness verdict; maturity/currentness remains supporting state. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-222-APPROVAL-REVIEW-HIERARCHY` | `C11-O06`, `C11-O07` | `MIXED` | `MIXED_TECHNICAL_DELTA` | `SD12` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Package/task semantics remain; readiness/currentness becomes primary before technical identity. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-223-IMPLEMENTATION-MASTER-DETAIL` | `C12-O17` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-224-TERMINAL-RESULT-PRIMACY` | `C13-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-225-RESPONSIVE-SEMANTIC-CONTINUITY` | `C18-O01`, `C18-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-226-WORKFLOW-CRITICAL-FEEDBACK` | `C17-O08` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-227-CERTIFICATION-MATRIX` | `C20-O12` | `VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD15`, `SD16`, `SD17`, `SD18` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Permanent certification must add required-input focus, renderer completeness, scenario-41 and cross-application theme/component parity coverage. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-228-FUNCTIONAL-STATE-TRANSITION-CLOSURE` | `C01-O05` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-229-PROVIDER-TURN-CONTROL-EXCLUSIVITY` | `C15-O05`, `C15-O07`, `C15-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-230-CLOSED-WORKBENCH-INTERACTION-GRAMMAR` | `C05-O08`, `C05-O12`, `C19-O01` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE` | `C19-O01`, `C19-O03`, `C19-O04`, `C19-O07`, `C19-O09`, `C19-O10`, `C19-O12` | `MIXED` | `MIXED_TECHNICAL_AND_VERIFICATION_DELTA` | `SD11`, `SD12`, `SD14`, `SD16` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Canonical component/theme system remains; local information-hierarchy violations and missing exhaustive renderer fitness are corrected. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-232-CLOSED-WORKFLOW-STATE-LANGUAGE` | `C01-O03`, `C01-O11` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-TECHNICAL-ARCHITECTURE-V2; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-233-CANONICAL-WORKFLOW-RAIL-PROJECTION` | `C05-O01`, `C05-O02` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION` | `C19-O04`, `C19-O10`, `C19-O11`, `C19-O12` | `CONFORMS_WITH_VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD16` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Current presentation behavior is positively conforming; exhaustive renderer-to-primitive certification is incomplete. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-235-GLOBAL-THEME-PARITY` | `C19-O06`, `C19-O08`, `C19-O11`, `C20-O12` | `CONFORMS_WITH_VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD18` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Theme behavior is positively conforming; required representative cross-application parity certification is incomplete. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-236-WORK-TYPE-AWARE-TASK-INFORMATION` | `C06-O03`, `C06-O04`, `C06-O05`, `C06-O06`, `C20-O07` | `CONFORMS_WITH_VERIFICATION_GAP` | `VERIFICATION_DELTA` | `SD17` | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-WORKBENCH-THEME-V1 | Kind-specific behavior is structurally conforming; scenario-41 end-to-end Research/downstream proof is incomplete. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-237-BOUNDED-AGENT-ACTIVITY` | `C15-O09`, `C15-O10` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-238-PROPOSAL-CANCEL-CLOSURE` | `C14-O05`, `C14-O06` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-239-TASK-SCOPED-MANUAL-IMPLEMENTATION` | `C12-O16` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-EXECUTION-CONTROL-PLANE-V1; GW-DOC-CANONICAL-CONTRACTS-V2; GW-DOC-TECHNICAL-ARCHITECTURE-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-240-REJECTED-PROVIDER-RESULT-FAILURE` | `C15-O01`, `C15-O07`, `C15-O12` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-OPENCODE-INTEGRATION-V1; GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-241-DERIVED-MATERIAL-MATURITY` | `C14-O03`, `C14-O04` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |
| `GW-FR-242-DIALOGUE-REPLY-CONTEXT` | `C14-O08`, `DIRECT-FR242` | `CONFORMS` | `POSITIVE_NO_CHANGE` | — | GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2; GW-DOC-CANONICAL-CONTRACTS-V2 | Exact R1 realization is positively conforming; preserve the current canonical producer→carrier→consumer owner/path and do not create implementation work for this requirement. | tests/browser.spec.ts; tests/workbench-presentation.test.ts; tests/certification.test.ts |

Stable-ledger cardinality: **112 / 112**, missing **0**, duplicate **0**.

Every `POSITIVE_NO_CHANGE` row explicitly consumes its named R1 producer→carrier→consumer evidence and canonical P4-P6 owner. If implementation later disproves such evidence, execution returns upstream; it does not silently broaden T1.

## Package-local atomic technical obligations

| Atom | Factual owner | Exact functional consequence | Solution |
|---|---|---|---|
| `PL-C21-01` | C21-F03/C21-F05 | Public README and terminal result must realize verified-result/Verified-candidate product language without universal execution/delivery overclaim. | `SD01` |
| `PL-C22-01` | C22-F01 | Resolve same-layer precedence/default/override/extension and fitness bindings before productive interpretation. | `SD02` |
| `PL-C02-01` | C02-F01 | Ordinary Create language is Concerns, not raw Concern IDs. | `SD03` |
| `PL-C02-02` | C02-F02 | Linked remediation project is fixed to parent project and not offered as invalid editable choice. | `SD03` |
| `PL-C02-03` | C02-F03/C04-F01 | Created and discovered sources share one productive admission/persistence owner. | `SD04` |
| `PL-C03-01` | C03-F01 | Including archived work expands the candidate set without bypassing project/search filters. | `SD05` |
| `PL-C04-01` | C04-F01 | Source-admission owner is singular across creation/discovery. | `SD04` |
| `PL-C04-02` | C04-F02 | Documentation-Git confirmation shows the exact governed paths/states before commit. | `SD06` |
| `PL-C05-01` | C05-F01 | Exact current attention owner/reason/action remains visible/reachable while other material is inspected. | `SD07` |
| `PL-C06-01` | C06-F01 | Authority-changing input is not sufficient durable authority until a later adopted canonical proposal exists. | `SD08` |
| `PL-C07-01` | C07-F01 | R2 can propose/adopt validated current P2/P3 canonical-owner amendments through the one proposal mechanism. | `SD09` |
| `PL-C08-01` | C08-F01 | DESIGN can propose/adopt validated current P4/P5/P6 canonical-owner amendments through the same mechanism. | `SD09` |
| `PL-C09-01` | C09-F01 | Implementation-required signed task package is materially non-vacuous. | `SD10` |
| `PL-C10-01` | C10-F01 | Readiness dominant verdict is typed R3 outcome. | `SD11` |
| `PL-C11-01` | C11-F01 | Approval presents readiness and package currentness before technical identity. | `SD12` |
| `PL-C11-02` | C11-F02 | Canonical approval identity is trimmed/nonblank at ingress. | `SD12` |
| `PL-C12-01` | C12-F01 | Signed in-task architecture checkpoint is coordinator-executable without provider shell permission. | `SD13` |
| `PL-C16-01` | C16-F01 | Settings primary hierarchy is operator readiness/meaning/action, with exact technical identity secondary except task-required. | `SD14` |
| `PL-C16-02` | C16-F02 | Fresh productive install cannot succeed with mandatory repository/account/model setup deferred to Settings. | `SD19` |
| `PL-C16-03` | C16-F03 | P6 must preserve incomplete-v4 recovery capability while forbidding productive installer success at that state. | `SD19` |
| `PL-C18-01` | C18-F01 | New required input moves focus once to its Workbench composer and polling does not steal it repeatedly. | `SD15` |
| `PL-C19-01` | C19-F01 | Permanent fitness proves exhaustive production-renderer classification without mutating signed architecture material during T1. | `SD16` |
| `PL-C20-01` | C20-F02 | Permanent browser certification proves complete four-kind Research/downstream scenario 41. | `SD17` |
| `PL-C20-02` | C20-F03 | Permanent certification proves representative cross-application System/Light/Dark component/semantic-role parity. | `SD18` |

These atoms are the non-stable/package-local obligations that the earlier 22-row concern summary compressed too aggressively. They are downstream of R2 and do not create new permanent P3 identifiers.

## C01-C22 complete technical coverage

| Concern | Technical coverage |
|---|---|
| C01 | Stable rows + explicit A01-NC01/A01-NC02 corrected-upstream no-code dispositions; no T1 lifecycle-state delta. |
| C02 | Stable rows + PL-C02-01/02/03 -> SD03/SD04. |
| C03 | Stable rows + PL-C03-01 -> SD05. |
| C04 | Stable rows + PL-C04-01/02 -> SD04/SD06. |
| C05 | Stable rows + PL-C05-01 -> SD07. |
| C06 | Stable rows + PL-C06-01 -> SD08. |
| C07 | Stable FR096 + PL-C07-01 -> SD09. |
| C08 | PL-C08-01 -> SD09; package technical consequence only. |
| C09 | PL-C09-01 -> SD10. |
| C10 | Stable FR221 + PL-C10-01 -> SD11. |
| C11 | Stable FR222 + PL-C11-01/02 -> SD12. |
| C12 | Stable rows + PL-C12-01 -> SD13. |
| C13 | Stable rows; positive no technical delta. |
| C14 | Stable rows; positive no technical delta, with SD09 affecting only newly admitted permanent-governance proposal targets. |
| C15 | Stable rows; positive no provider/session technical delta. |
| C16 | Stable rows + PL-C16-01 -> SD14; PL-C16-02/03 -> SD19; P6 contradiction already corrected in canonical owner. |
| C17 | Stable rows + imported PL-C05-01 -> SD07. |
| C18 | Stable FR225 + PL-C18-01 -> SD15. |
| C19 | Stable rows + PL-C19-01 -> SD16; local hierarchy dependencies SD11/12/14. |
| C20 | Stable rows + PL-C20-01/02 -> SD17/SD18; imported focus/renderer verification SD15/16. |
| C21 | PL-C21-01 -> SD01 plus explicit A01-NC03 corrected-upstream no-code disposition. |
| C22 | Stable dependency rows + PL-C22-01 -> SD02. |

## Detailed data/control flows

### F1 — resolved project authority (SD02)

```text
validated ProjectManifest + shell-expanded selected authority paths
        -> pure core resolver
        -> selected P1-P6 + same-layer precedence/default/override/extension + fitness bindings
        -> daemon immutable resolved projection
        -> stage/provider context + conformance/sign-off closure
```

Semantic contradiction remains stage-owned; the resolver supplies explicit relation/ordering and blocks unresolved structural ambiguity before provider interpretation.

### F2 — permanent authority proposal/adoption (SD09)

```text
R2/DESIGN provider proposal
 -> existing ARTIFACT_PROPOSAL_CREATED
 -> stage-specific canonical target/layer admission
 -> one pending proposal review
 -> explicit ADOPT
 -> re-resolve current target + base hash
 -> exact patch + immutable ArtifactRef
 -> existing freshness/context invalidation
```

R2 targets only current P2/P3 owners; DESIGN only P4/P5/P6. No P1 mutation, no new proposal DTO/state machine.

### F3 — durable decision input (SD08)

```text
durable HUMAN_INPUT_REQUESTED
 -> HUMAN_INPUT_RECEIVED (input/evidence only)
 -> governed lifecycle/permanent-authority proposal
 -> explicit adoption
 -> later stage completion admitted
```

Ordinary INFORMATION/EVIDENCE continuation is unchanged.

### F4 — signed checkpoint (SD13)

```text
BUILDER turn -> GATE_CHECKPOINT_REQUESTED(gateId)
 -> coordinator validates signed task/gate/freshness
 -> existing validation effect in current builder workspace
 -> existing GATE_PASSED/GATE_FAILED evidence
 -> same Run/session next provider turn
```

No ambient provider shell, no second gate registry/state, no substitution for V3/V5/V7.

### F5 — singular source admission (SD04)

```text
UI create -> write/read validated source --+
                                         +-> one new-source QueuePlan -> existing applyPlan
repository discovery --------------------+
```

`origin=CREATED|DISCOVERED` remains provenance only.

### F6 — queue/presentation (SD05-SD07, SD11-SD15)

Canonical daemon facts are projected once; browser selection never becomes workflow authority. Include-archived selects a dataset before project/search filtering. Historical/supporting material selection never hides current attention. Readiness/Approval/Settings/product labels/focus are projections of existing typed state.

### F7 — productive installer closure (SD19)

```text
install.sh bootstrap
 -> src/installer.ts staged install
 -> configureOrder
 -> runInstallerGuidedSetup
 -> existing private OpenCode login/model selection
 -> existing exact target-repository/reference collection
 -> canonical config writer
 -> service activation + health proof
 -> success
```

The former fresh `configured === null` success/defer branch in `runGuidedSetupInternal` is removed/replaced so the existing later guided path executes. Incomplete config v4 remains a canonical daemon/Settings recovery state and may exist transiently during rollback-safe install, but productive installer success cannot terminate on it. Update/migration retention/rollback paths are unchanged.

## Exact implementation surface forecast

### Production paths expected to change
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
- `src/shell/setup.ts`
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

### Verification paths expected to change/create
- `tests/certification.test.ts`
- `tests/core.test.ts`
- `tests/daemon.test.ts`
- `tests/browser.spec.ts`
- `tests/workbench-presentation.test.ts`
- `tests/installer.test.ts`

### Delivery metadata
- `CHANGELOG.md`

Total P7 candidate surface forecast: **30 paths** (23 production + 6 verification + 1 delivery).

`docs/**`, `pontivus-order.toml`, package/lock/workflow metadata and `tests/architecture.test.ts` are not T1 implementation surface. P6 was corrected during DESIGN. G-F10 structural campaign fitness may update immutable architecture verification material **before sign-off**, followed by downstream revalidation; it is not an implementation task.

## Contract/state/persistence/transport consequences

- No WorkStage/status/outcome/ArtifactRole/task-state/persistence-table/public-HTTP family is added.
- Existing proposal, HumanInput, SignedTaskBlock, Approval, Run/RunEvent and validation representations are extended only where SD09/SD10/SD12/SD13 already require.
- New runtime concepts remain limited to the already-designed transient pure resolved-authority projection and typed BUILDER checkpoint request.
- SD19 changes no OrderConfig schema. It changes only when the productive installer is allowed to return success.
- No new dependency is required.

## Failure and recovery

- invalid/unresolved authority relation -> owning pre-signoff stage blocks before productive inference;
- stale/wrong governance proposal -> reject/reconcile through existing proposal owner;
- durable decision with no later adopted authority -> stage remains blocked;
- vacuous task / blank Approval identity / unsigned checkpoint -> reject at canonical ingress;
- checkpoint failure -> only signed-scope correction or explicit block;
- source-admission conflict -> existing QueuePlan/source diagnostics/recovery;
- installer setup cancellation/provider/model/repository failure -> installer fails and existing rollback restores prior installation/config/service state; fresh install does not claim success;
- any implementation discovery requiring a new semantic owner, state, persistence/transport shape, dependency or unlisted production path -> return to DESIGN/PLAN.

## Rejected alternatives

- treating concern membership as a requirement-level delta — rejected by G-F10;
- generic `NO_CODE / IA24` without positive realization evidence — rejected;
- granting BUILDER shell to satisfy checkpoints — rejected;
- new proposal/task/source/readiness/config DTO/service/state models — rejected;
- preserving deferred-Settings fresh-install success because current P6/code did so — rejected by higher P3/P4 authority; P6 is corrected;
- changing OrderConfig schema to solve FR007 — unnecessary; existing incomplete-config state remains useful for recovery;
- modifying `src/installer.ts` preemptively — unnecessary under current evidence because it already calls the canonical guided setup owner; if SD19 cannot be realized solely in `src/shell/setup.ts`, return to DESIGN rather than broadening scope;
- modifying `tests/architecture.test.ts` inside T1 — rejected because it is signed verification material.

## Open technical questions

NONE.

Every stable requirement and every material package-local outcome now has an explicit technical realization/no-change/verification disposition. PLAN must decompose only the delta solutions above and must carry exact positive-no-change proof obligations without inventing implementation work for conforming requirements.
