<!-- Order template: change-r2-v2; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V2, GW-DOC-SPECIFICATION-STANDARD-V2, GW-FR-096-LIFECYCLE-AUTHORITY-DISPOSITION -->

## P2 intent and R1 factual basis

P2 intent is the current Order product authority resolved through `GW-DOC-SYSTEM-BRIEF` and `GW-DOC-PRODUCT-IDENTITY`. The factual basis is the closed campaign R1 artifact `research.md` and its 113/113 P2/P3 coverage proof.

The 0.6.0 functional design reconstructs the required product from canonical authority. It does not preserve released 0.5.0 behavior by default and does not promote implementation observations into requirements.

R1 found two classes of downstream work:

1. minimal P2/P3 wording corrections needed to remove contradictions/ambiguity already disproved by the canonical lifecycle; and
2. current implementation violations or technical ownership gaps where existing functional authority is already sufficient.

## Functional authority disposition ledger

| Requirement | Disposition | Canonical owner |
|---|---|---|
| C01 canonical lifecycle versus internal execution/validation taxonomy | DELTA | GW-DOC-SYSTEM-BRIEF |
| C01 lifecycle-context decision-boundary taxonomy | DELTA | GW-DOC-LIFECYCLE-CONTEXT |
| C02 intake/kind/concern authoring semantics | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM |
| C02 ordinary Create presentation and linked-remediation same-project semantics | REFERENCE | GW-DOC-WORKBENCH-UX |
| C03 queue/archive/project/search semantics | REFERENCE | GW-DOC-WORKBENCH-UX |
| C04 portable source/authoring/durability semantics | REFERENCE | GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM |
| C05 workspace/navigation/context semantics | REFERENCE | GW-DOC-WORKBENCH-UX |
| C06 Research interaction/factual-closure semantics | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| C07 Requirements interaction/authority-disposition semantics | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| C08 Solution-design interaction semantics | REFERENCE | GW-DOC-WORKBENCH-UX |
| C09 Implementation-plan interaction and planning semantics | REFERENCE | GW-DOC-SPECIFICATION-STANDARD |
| C10 Readiness Review verdict hierarchy and return routing | REFERENCE | GW-DOC-WORKBENCH-UX |
| C11 Approval exact-package/currentness/readiness hierarchy | REFERENCE | GW-DOC-WORKBENCH-UX |
| C12 signed-task execution/validation semantics | REFERENCE | GW-DOC-VALIDATION-STANDARD |
| C13 terminal result/Complete semantics | REFERENCE | GW-DOC-WORK-LIFECYCLE |
| C14 governed material/proposal/evidence/dialogue semantics | REFERENCE | GW-DOC-MARKDOWN-WORKBENCH |
| C15 provider/session/activity semantics | REFERENCE | GW-DOC-OPENCODE-INTEGRATION |
| C16 Settings/readiness/repository/account/model hierarchy | REFERENCE | GW-DOC-INSTALLATION-READINESS |
| C17 current-attention/recovery/convergence semantics | REFERENCE | GW-DOC-WORKBENCH-UX |
| C18 responsive/accessibility semantic continuity | REFERENCE | GW-DOC-WORKBENCH-UX |
| C19 component/visual/theme functional language | REFERENCE | GW-DOC-WORKBENCH-UX |
| C20 end-to-end certification/transition closure | REFERENCE | GW-DOC-SPECIFICATION-STANDARD |
| C21 verified terminal-result and no-intent-invention product language | DELTA | GW-DOC-PRODUCT-IDENTITY |
| C22 project governance/authority/verification integration | REFERENCE | GW-DOC-PROJECT-GOVERNANCE-INTEGRATION |

## Required observable outcome/delta

### C01 and C21 — authority clarifications

The permanent product authority must make the already-governing semantics unambiguous:

- the canonical WorkItem lifecycle is distinct from the internal post-sign-off implementation/validation sequence;
- IMPLEMENT, mechanical validation and independent review are boundaries/roles under canonical EXECUTION, not extra WorkItem stages;
- Audit is a governed work kind/evaluation boundary, not an additional WorkStage;
- Order’s umbrella terminal outcome is a **verified result**;
- executed delivery work may produce a **verified candidate**, while Investigation/Audit/disproven/duplicate/already-satisfied work can validly terminate without a candidate;
- Order establishes facts and carries **explicit product intent** into requirements/design; it never “works out” missing product intent by inference.

These clarifications are now applied at `GW-DOC-SYSTEM-BRIEF`, `GW-DOC-LIFECYCLE-CONTEXT` and `GW-DOC-PRODUCT-IDENTITY`. They do not change the canonical lifecycle state machine.

### C02 — intake/create

Existing authority applies unchanged:

- ordinary authoring presents **Concerns** as user-facing choices; raw concern identifiers remain technical metadata;
- a linked-remediation WorkItem remains in the originating project. The ordinary remediation flow derives/fixes Project rather than inviting a predictably invalid cross-project edit.

The implementation correction is required by existing authority; no new persisted intake/remediation state is authorized.

### C03 — queue

Existing queue authority applies unchanged. Project/search filtering has one semantic meaning whether archived work is excluded or included. Including archived items expands the candidate set; it does not switch to a different filter/search rule or create another queue-state owner.

### C04 — source path

Existing functional source semantics apply unchanged. UI-created and repository-authored WorkItems must both become productive through the one canonical portable source/reconciliation contract. R2 does not select the technical owner; C04-F01 is carried to DESIGN for canonical owner consolidation.

### C05-C09, C12-C15, C17-C20, C22

No functional delta is required. The current canonical P2/P3 owners are sufficient and remain the complete functional specification for these concerns.

A later technical or implementation layer may correct non-conformance, but it may not restate these referenced concerns as local requirements or preserve current implementation structure by default.

### C10 — Readiness

`GW-FR-221-READINESS-REVIEW-HIERARCHY` applies unchanged. The primary Readiness judgment must expose the canonical R3 verdict/current readiness state and findings/defective owner before package evidence/history. Material maturity/currentness must not substitute for the readiness verdict.

### C11 — Approval

Existing Approval Review hierarchy applies unchanged. The exact package’s **currentness and readiness** must be directly legible as the primary judgment, followed by signed task meaning/scope/gates and governed documents; hashes/commit/provider/runtime identity remain secondary technical detail.

No second readiness field/state is authorized: the UI projects the canonical R3/package facts.

### C16 — Settings

`GW-DOC-INSTALLATION-READINESS` applies unchanged. Settings prioritizes operator decisions, readiness/attention and relevant actions. Exact Git/document paths, API identity, credential IDs and diagnostic identifiers are secondary/on-demand except where the active configuration task requires them to disambiguate or enter a value.

## Acceptance criteria

1. The product/lifecycle documentation distinguishes canonical WorkItem stages from execution/validation roles without changing the canonical transition relation.
2. Product identity consistently uses **verified result** as the umbrella terminal outcome and **verified candidate** only for executed delivery outcomes.
3. Product language never implies Order invents missing product intent or forces valid no-code work through implementation.
4. Create presents ordinary concern choices without making raw concern IDs the primary authoring vocabulary.
5. Linked remediation derives/fixes the originating project and does not offer an ordinary invalid cross-project edit.
6. Queue project/search behavior is semantically identical before and after archived items are included.
7. Readiness Review’s dominant verdict is the canonical R3 readiness judgment, not lifecycle-document maturity.
8. Approval directly communicates exact-package currentness and canonical readiness before technical package identity.
9. Settings keeps readiness/decision/action information primary; paths/API/credential identifiers are secondary unless required by the active task.
10. UI-created and repository-authored WorkItems satisfy one functional source/reconciliation contract; DESIGN identifies the singular technical owner without introducing a second source representation.
11. Every other C01-C22 concern continues to satisfy its referenced P2/P3 owner with no local weakening or shadow copy.
12. End-to-end flow remains valid for both implementation-producing and no-code terminal WorkItems, including every canonical upstream return, stale-authority path, blocker/retry/resume path and provider-failure path.

## Scope/exclusions

In scope:

- the functional/product-language corrections above;
- projection/presentation corrections required by existing P3 hierarchy;
- queue/intake behavior corrections already required by existing authority;
- the functional obligation for singular source reconciliation.

Out of scope at R2:

- choosing module/file boundaries or source-reconciliation implementation ownership;
- changing persistence, transport or canonical contract shapes;
- introducing DTOs, alternate source models, alternate readiness/currentness state or browser-owned workflow policy;
- preserving current 0.5.0 UI composition or code structure where canonical authority does not require it;
- unrelated feature additions.

## Failure/negative behavior

The 0.6.0 functional design is non-compliant if any downstream layer:

- treats IMPLEMENT/TEST/REVIEW/AUDIT labels as additional canonical WorkItem stages;
- presents every successful terminal result as a candidate or routes no-code terminal work into execution;
- invents missing product intent;
- promotes raw IDs/paths/hashes/API identity over the ordinary operator task without a task-specific need;
- allows a linked-remediation Project choice that canonical lineage will reject;
- applies different queue/search semantics only because archived items are visible;
- substitutes document maturity for the actual Readiness verdict;
- creates a second readiness/currentness/source/queue state owner to fix a presentation defect;
- duplicates source semantics into UI/transport/persistence DTO families;
- weakens any referenced P2/P3 obligation because the current implementation differs.

## Material compatibility/security/performance constraints

No new compatibility, security or performance requirement is introduced by R2.

Existing canonical constraints remain binding, including:

- explicit sign-off and exact-package freshness before productive execution;
- isolated/pinned OpenCode integration and provider permissions;
- project-governance/verification authority;
- responsive/accessibility requirements;
- strict typing, FCIS, SoC, DRY/canonical ownership and minimum sufficient change.

The design must remain usable for the existing valid WorkItem kinds and terminal outcomes. This is semantic continuity, not a requirement to preserve incidental 0.5.0 implementation/UI structure.

## Open product/authority questions

NONE.

All R1 findings have a functional disposition. The remaining C04-F01 source-owner question is intentionally technical and belongs to DESIGN; it is not an unresolved product/authority decision.
