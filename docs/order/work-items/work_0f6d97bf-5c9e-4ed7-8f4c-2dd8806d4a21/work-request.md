---
{
  "formatVersion": 1,
  "id": "work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21",
  "projectId": "order",
  "concernIds": [
    "core",
    "daemon",
    "foundation",
    "shell",
    "ui",
    "verification"
  ],
  "schemaId": "change-v2"
}
---
# Design Order 0.6.0 through exhaustive concern closure

<!-- Order template: change-intake-v2; authority: GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM, GW-DOC-WORK-LIFECYCLE -->

## Requested outcome

Reconstruct the complete intended Order functional design that the 0.5.0 work was supposed to realize, using canonical P2/P3 product and functional authority—not the released 0.5.0 implementation—as the normative source. Then derive the complete 0.6.0 technical solution design and final implementation plan from that reconstructed functional design. **Campaign sequencing is not defined in this Work request.** The sole normative campaign progression is owned by `0.6.0-design-campaign-plan.md` and must be followed exactly as current there.

The work must be controlled by that one campaign plan, which proves complete concern coverage, marks the explicit start and end of each investigation, records findings and cross-concern dependencies, tracks every concern through functional design, technical design and final plan coverage, and owns the mandatory final cross-layer alignment/readiness progression.

### Operator clarification — final human QA/QC and acceptance (2026-11-27)

The desired product separates one exact-package implementation authorization from acceptance of the produced solution. After normal sign-off the complete authorized implementation, validation, independent QA and bounded remediation run autonomously; no routine intermediate human approval. A verified candidate is technical production completion, not human acceptance or delivery.

At the final handoff the operator must be able to interact with the candidate in a coherent QA/QC review: inspect the exact candidate, approved acceptance criteria and corresponding verification evidence; perform manual/exploratory evaluation; record feedback and bug reports against the exact reviewed candidate with expected versus observed behavior, reproduction information and supporting evidence; review corrected candidates and retest; explicitly accept/sign off the exact verified candidate for delivery. A blocking finding or rejection prevents acceptance of that candidate. Corrected candidate evidence and acceptance must bind the new exact candidate, not be inherited from a rejected or superseded one. A repair that can be performed under a still-valid existing authorization should run autonomously; material requirement/design/scope/authority changes return to the existing upstream authorization boundary. The human does not approve individual remediation steps. Acceptance is attributable, reviewable and distinct from technical validation; never infer it from a green gate, silence or candidate creation. Acceptance must not silently commit, push, merge or deploy.

This is an explicit operator-requested addition to the native Order product scope, not an implementation observation or a claim that the current package already realizes it. At the operator clarification baseline, the lifecycle/P3/P4/P6 contracts terminated at CANDIDATE_DONE/COMPLETE and restricted linked remediation to completed Investigation/Audit parents. Treat that observation as historical evidence. The affected authoritative requirements and technical contract must be reconciled and independently revalidated before the 0.6.0 package can be declared ready for implementation of this feature; resolve current semantics through the canonical owners. Preserve exact verified-candidate evidence and historical integrity; do not infer a new lifecycle stage, persisted carrier, command, relationship or delivery automation from this request alone. Existing external PR final QA/acceptance can use the canonical GitHub review boundary without pretending to supply the native product feature.

## Current context

This WorkItem coordinates the existing Order 0.6.0 authority-first reconstruction campaign. The detailed campaign-control, lifecycle-package and implementation observations below are context for that requested outcome; they do not replace the canonical P1-P6 owners or the campaign's sole current-state register.

### Canonical 0.6.0 campaign work point

This WorkItem is the sole active coordination/work point for the Order 0.6.0 design campaign. All campaign status, concern coverage, design-stage progress and readiness disposition must resolve back to `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21` and its lifecycle artifacts.

This does not make the WorkItem a permanent semantic authority. P1-P6 meaning remains with the canonical concern owners; this WorkItem owns only the governed change package and its campaign progression. Parallel 0.6.0 plans or design streams must not become competing status/decision owners.

## Constraints/non-goals

The work must remain authority-driven and single-owned. It must not infer desired 0.6.0 behavior from current implementation/tests/history, create competing campaign or implementation plans, duplicate canonical semantic owners, bypass explicit sign-off, or introduce compatibility/fallback behavior absent from current authority. The detailed constraints below refine these non-goals.

### Single campaign-plan and lifecycle-plan authority law

This WorkItem has exactly one campaign-control plan and exactly one canonical P7 implementation-plan artifact:

- `0.6.0-design-campaign-plan.md` is the sole authority for campaign sequencing, concern batching, mandatory pair audits, campaign findings/dependencies, concern/gate status and progression rules;
- `implementation-plan.md` is the deterministic canonical P7 artifact, sole normative execution authority and sole `order-tasks` carrier. Its content may be authored through phase source files under `implementation-plan/`, but the complete phase/action/verification text must be compiled into the root artifact and the root must list the exact source-component Git blob SHAs. The directory files are not parallel plans and own no lifecycle status or independent execution authority. Executable task authority exists only after fresh DESIGN closure, root regeneration, source-hash/compiled-content verification and G5 closure; while G5 is not passed the PLAN is non-current and cannot authorize implementation.

No second prerequisite plan, remediation plan, completion plan, handover plan, audit plan or alternative implementation plan may be created for this WorkItem. The `implementation-plan/` files are modular authoring sources only: they may not carry a second `order-tasks` block, lifecycle status or independent execution authority, and any source edit requires regeneration of the canonical root PLAN. A needed process/audit-rule change is made in `0.6.0-design-campaign-plan.md`. A needed executable-task/package change is made by regenerating the root PLAN from its phase sources after the required upstream gates.

The remaining WorkItem artifacts have bounded roles and cannot override either plan:

- `0.6.0-concern-coverage-ledger.md` — inventory/coverage evidence only;
- `research.md` — canonical R1 factual synthesis;
- `requirements.md` — canonical R2 functional requirements;
- `solution-design.md` — canonical DESIGN technical solution, including the exhaustive requirement-level technical-disposition ledger;
- `readiness-review.md` — canonical R3 adversarial verdict.

PR bodies, CI/test output, implementation observations, historical START/END records, prior lifecycle versions, handovers, prompts, model/chat output and external summaries are evidence/provenance only. They cannot change campaign status, bypass a pair audit, authorize the next pair, restore a stale downstream artifact, alter P7 scope or override current canonical P1-P6 authority.

If any such information conflicts with the current campaign-control plan or the current lifecycle-stage authority, the conflict is recorded and routed to the owning canonical document. The conflicting lower-authority material never controls by default.

## Why this change is required

The 0.6.0 redesign must not repeat the failure mode where a large integrated design is treated as complete while individual product concerns, state interactions, authority dependencies or downstream implementation consequences remain unexamined.

Phase 0 establishes the corrected documentation/authority/conformance foundation. The 0.6.0 campaign then uses that foundation to reconstruct the complete functional design intended by the canonical product authority, close the omissions and contradictions that allowed 0.5.0 to diverge, derive the technical solution design, and produce the implementation plan that will make 0.6.0 realize that design. This is corrective design reconstruction, not preservation or incremental evolution of the released 0.5.0 application.

The campaign therefore requires:

- a complete concern inventory derived from current canonical P2/P3 authority before substantive redesign begins;
- explicit concern START and END records so no investigation is silently skipped or left half-resolved;
- evidence-first R1 investigation before future-state decisions;
- exact finding ownership and cross-concern dependency tracking;
- functional-design closure before technical-design decisions;
- technical-design closure before executable planning;
- complete P1 -> P2 -> P3 -> P4/P5/P6 -> P7 traceability;
- complete horizontal integration coverage under the canonical campaign plan;
- no implementation work until the **sole campaign progression owned by `0.6.0-design-campaign-plan.md`** has reached its implementation-authorizing boundary and the exact package has explicit sign-off. This Work request does not maintain a parallel readiness sequence.

## Evidence/references

The governing and evidentiary basis for this request is:

- current P1-P6 authority and stable/versioned references resolved through root `pontivus-order.toml`;
- `0.6.0-design-campaign-plan.md` as the sole campaign sequencing/status owner;
- `research.md`, `requirements.md`, `solution-design.md`, `implementation-plan.md` and `readiness-review.md` as the governed lifecycle artifacts for this WorkItem;
- repository implementation, tests, PR/CI output and historical package material only as evidence/provenance subject to the authority rules above.

### Phase 0 prerequisite

The campaign depends on the factual/governance baseline produced by the Phase 0 authority/conformance remediation in PR #69.

G0 establishes one exact Phase 0 candidate commit as evidence that the campaign's authority, document-authoring and conformance machinery is trustworthy enough to perform the reconstruction. PR merge state, browser certification, release packaging and other delivery verification are delivery provenance, not prerequisites to R1/R2/DESIGN reconstruction. A delivery/test failure may block the campaign only when it demonstrates a defect in the canonical authority topology or in the lifecycle/authoring/conformance machinery required to produce trustworthy campaign artifacts. If the Phase 0 candidate changes materially in one of those campaign-foundation concerns, G0 and every affected downstream concern are revalidated against the new exact candidate before relying on prior conclusions.

## In scope

The entire user-visible and workflow-relevant Order product surface needed to establish the 0.6.0 design, including lifecycle semantics, WorkItem/source behavior, queue/create/workspace interaction, every pre-signoff stage, approval, execution, completion, governed materials, OpenCode interaction, Settings/readiness, recovery/current-attention behavior, responsive/accessibility mechanics, visual/component/theme consistency and end-to-end certification obligations.

Current implementation, prior releases, tests, rendered UI and historical design material may be inspected only as evidence of a gap, ownership issue, reusable capability or completed correction. They are not campaign deliverables and must not be documented as the desired 0.6.0 application/design baseline, fallback behavior, preservation target or regression contract. Absence of a finding is not proof of conformance and never means "keep the current application by default." Existing canonical authority may remain the semantic owner, but the campaign must still prove the complete consequence of that authority and the complete producer -> carrier -> consumer realization before declaring a concern satisfied.

**Campaign precedence rule:** if a campaign status note, PR/CI result, test, implementation observation, historical concern record, handover or lower-level document can be read as requiring preservation of current 0.5.0 behavior or as blocking design reconstruction for reasons unrelated to authority/authoring/conformance trustworthiness, this WorkItem rule controls. Such evidence must be reclassified to its proper delivery or defect role and must not redefine the 0.6.0 design objective.

## Mandatory exhaustive prerequisite review

Before R1 may close again, the campaign must perform an exhaustive authority-to-realization audit of the complete system definition. This is not limited to UI, workflow, schemas, data, prompts, provider behavior or any other single layer.

The review must cover every applicable variable and every interface between variables, including product intent, functional requirements, information design, information ownership, authoring schemas/templates, prompt/context input, generated output, canonical carriers, lifecycle/Run/attention/material/proposal/approval/execution state, transitions, daemon/core/shell ownership, persistence, transport, browser query/state ownership, rendered information hierarchy, interaction/action behavior, failures, recovery, responsive/accessibility behavior, verification and the lifecycle-document authoring/conformance machinery itself.

For every material canonical obligation, the campaign must prove all three independently:

1. **Authority coverage** — the exact canonical owner and normative clause were examined.
2. **Semantic/information coverage** — the exact required behavior, information, hierarchy, work-kind/stage variation, state/action/failure/recovery and prohibited behavior were derived.
3. **Realization coverage** — the complete producer -> carrier -> consumer path was inspected and classified against current implementation evidence as `CONFORMS`, `VIOLATES` or `UNPROVEN`.

`UNPROVEN` is an open R1 state and prevents closure.

A stable requirement ID, concern ID, document, schema, passing test or prior review is never sufficient proof by itself. `REFERENCE`, `no functional delta`, `no technical change`, `already satisfied` and `no implementation change` are conclusions that require evidence; they are never defaults.

The existing 0.6.0 work is an evidence set to recover and revalidate, not a discard-by-default set and not a trusted baseline. Valid authority facts, foundational corrections, implementation evidence and candidate solutions should be reused where independently re-proven. Unsupported closure conclusions must be replaced in the existing canonical lifecycle documents rather than copied into a parallel documentation set.

## Mandatory exhaustive review and revalidation cadence

The campaign must retain complete concern, phase and cross-layer audit coverage, without treating each two-concern audit as a separate serial revalidation milestone. As directed by the operator on 2026-11-27, the existing package is to be revalidated in one integrated batch across G2–G6, with consolidated findings and corrections, positive evidence reuse, and no repetitive per-pair publication or CI. The campaign-control document §8.4 exclusively owns the review cadence, pair definitions, detailed checks, evidence and current verdicts. Preserve the logical lifecycle prerequisites, independent R3, exact-candidate fitness and explicit sign-off. No weakening of exhaustive semantic coverage or acceptance criteria is authorized.

## Explicit exclusions

This WorkItem does not itself authorize implementation while R1/R2/DESIGN/PLAN are incomplete.

The campaign-control document does not become a second product specification, architecture, contract or P7 task owner. Normative outcomes are written only to the canonical lifecycle artifacts and permanent concern owners at the appropriate stage.

Unrelated defects or features discovered during the campaign are recorded and routed to their own governed WorkItem rather than silently expanding 0.6.0 scope.

## Completion condition

This Work request owns **no independent campaign-completion, readiness or sign-off checklist**.

The WorkItem's campaign completion, final alignment, R3 eligibility, readiness and implementation-authorizing progression are determined exclusively by the current gate/progression/completion rules in `0.6.0-design-campaign-plan.md`. Other lifecycle artifacts provide their bounded R1/R2/DESIGN/PLAN/R3 content or verdicts but must not restate or maintain a competing campaign progression.

The exact package still requires explicit Approval/sign-off at the canonical lifecycle boundary.
