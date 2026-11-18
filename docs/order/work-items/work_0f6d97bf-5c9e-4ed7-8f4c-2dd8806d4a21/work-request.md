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

## Requested change

Reconstruct the complete intended Order functional design that the 0.5.0 work was supposed to realize, using canonical P2/P3 product and functional authority—not the released 0.5.0 implementation—as the normative source. Then derive the complete 0.6.0 technical solution design and final implementation plan from that reconstructed functional design, progressing only through the governed lifecycle:

```text
R1 prerequisite investigation
  -> R2 functional requirements / functional design
  -> DESIGN technical solution design
  -> PLAN final implementation plan
  -> R3 adversarial readiness review
```

The work must be controlled by one campaign plan that proves complete concern coverage, marks the explicit start and end of each investigation, records findings and cross-concern dependencies, and tracks every concern through functional design, technical design and final plan coverage.

## Canonical 0.6.0 campaign work point

This WorkItem is the sole active coordination/work point for the Order 0.6.0 design campaign. All campaign status, concern coverage, design-stage progress and readiness disposition must resolve back to `work_0f6d97bf-5c9e-4ed7-8f4c-2dd8806d4a21` and its lifecycle artifacts.

This does not make the WorkItem a permanent semantic authority. P1-P6 meaning remains with the canonical concern owners; this WorkItem owns only the governed change package and its campaign progression. Parallel 0.6.0 plans or design streams must not become competing status/decision owners.

## Single campaign-plan and lifecycle-plan authority law

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
- one final horizontal integration audit after individual concerns close;
- no implementation work until the complete design/plan package passes R3 and explicit sign-off.

## Phase 0 prerequisite

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

## Mandatory two-part audit cadence

The exhaustive restart must be executed in bounded two-concern batches. After any two concerns have been reported complete at a lifecycle phase, those two completed parts must be audited against the full detailed phase requirements before a third concern may begin at that phase.

This cadence applies independently to:

- R1 factual/realization revalidation;
- R2 functional closure;
- DESIGN technical closure;
- PLAN coverage.

The audit is not a summary review. It must reopen the exact two completed parts, challenge every applicable detailed obligation, verify their evidence and cross-layer paths, and return `PASS` or `FAIL`.

A `FAIL` reopens the defective concern(s) at the exact owning phase. A missing audit is equivalent to `FAIL` for progression purposes.

The campaign-control document owns the pair definitions, detailed audit checklist, audit record format and current audit status. No lifecycle artifact or model output may claim later-pair progress when the preceding pair audit has not passed.

## Explicit exclusions

This WorkItem does not itself authorize implementation while R1/R2/DESIGN/PLAN are incomplete.

The campaign-control document does not become a second product specification, architecture, contract or P7 task owner. Normative outcomes are written only to the canonical lifecycle artifacts and permanent concern owners at the appropriate stage.

Unrelated defects or features discovered during the campaign are recorded and routed to their own governed WorkItem rather than silently expanding 0.6.0 scope.

## Completion condition

This WorkItem is ready for implementation sign-off only when:

1. the complete concern register has been proven against current canonical authority;
2. every applicable canonical normative obligation has been atomized and has explicit authority, semantic/information and realization coverage;
3. every realization path is classified `CONFORMS` or `VIOLATES`, with zero material `UNPROVEN` obligations;
4. every concern investigation has a closed factual verdict supported by obligation-level proof rather than concern/ID coverage alone;
5. every material finding has a disposition;
6. functional design is complete across all concerns and every applicable workflow-step/work-kind information contract, and passes a horizontal integration audit;
7. technical solution design completely realizes the functional design without unresolved material choices or unsupported `no technical change` assertions;
8. the final implementation plan covers every required design obligation with no orphan task or uncovered requirement;
9. R3 adversarially returns `READY_FOR_SIGNOFF`;
10. the exact package is explicitly approved.

The detailed execution and coverage rules are owned by `0.6.0-design-campaign-plan.md` in this WorkItem directory.
