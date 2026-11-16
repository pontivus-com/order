<!-- Order template: change-r1-v1; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-LIFECYCLE-CONTEXT-V1 -->

# 0.5.0 integrated workflow task experience — factual closure

**Status:** Research factual closure — CONFIRMED from completed parent Audit  
**WorkItem:** `work_2778105b-d919-4fcd-91e7-dd9b23812aac`  
**Derived from:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`

## Current state/absence

The current Workbench contains the canonical data and most of the interaction primitives required to operate the lifecycle, but it does not consistently organize the product around the operator task owned by each workflow step.

The parent AUDIT establishes that:

- the underlying state decomposition is largely sound;
- the Workbench information hierarchy is inconsistently enforced;
- pre-signoff agent/document/proposal interaction is not yet one coherent task experience;
- provider operational activity is too opaque for the 0.5.0 usability objective;
- proposal cancellation can create a terminalized Run with an unresolved proposal;
- Implementation presents a task-local manual action whose current command is global scheduler execution;
- deterministic repository lifecycle drafts can be materialized but omitted from the normal current-material projection;
- existing canonical facts already distinguish the material maturity conditions needed by the product, but the operator-facing vocabulary/behavior is incomplete.

The absence this CHANGE addresses is therefore a complete functional task contract for every workflow step and the technical realization required to make the product conform to that contract.

## Evidence

Canonical factual evidence is owned by the completed parent AUDIT and is not duplicated here.

The relevant evidence owners are:

- `application-interaction-map.md` — complete `SURF-`, `INFO-`, `ACT-` and `FLOW-` current-state map, including rendered evidence;
- `workflow-state-audit.md` — lifecycle/Run/proposal/currentness/recovery/execution state facts and contradictions;
- `opencode-interaction-audit.md` — exact pinned provider/session/capability/transparency facts;
- `document-material-maturity-audit.md` — current material fact sources and maturity derivation;
- `certification-evidence-map.md` — current proof coverage and named proof gaps;
- parent `research.md` — consolidated findings F-01 through F-08 and Phase 2 decision registers FD-01 through FD-06 / TD-01 through TD-08.

The parent gate explicitly records zero unresolved material factual questions requiring renewed 0.4.0 discovery.

## Governing authority

The functional change is constrained by:

- `GW-DOC-WORK-LIFECYCLE-V1` — lifecycle task boundaries and promotion/return semantics;
- `GW-DOC-LIFECYCLE-CONTEXT-V1` — interactive stage behavior, canonical versus conversational authority and context/conformance;
- `GW-DOC-WORKBENCH-UX-V2` — information hierarchy, current-attention precedence, closed interaction classes and per-step screen behavior;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1` and `GW-DOC-MARKDOWN-WORKBENCH-V1` — source/lifecycle document ownership and direct authoring;
- `GW-DOC-INSTALLATION-READINESS-V1` — application-level readiness/configuration behavior;
- `GW-DOC-OPENCODE-INTEGRATION-V1` — provider authority boundary;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1` and `GW-DOC-CANONICAL-CONTRACTS-V1` — downstream technical constraints.

The investigative baseline found the existing product information-hierarchy direction to be substantially correct. Functional design should preserve it and close the missing/contradictory product behavior rather than replace it wholesale.

## Affected producer→consumer path

The affected product path is application-wide:

~~~text
canonical lifecycle / material / provider facts
        |
        v
workflow-step task ownership
        |
        v
information hierarchy + current attention
        |
        v
subtask-specific interaction
        |
        v
operator input / decision / command
        |
        v
canonical mutation or provider continuation
        |
        v
resulting state / maturity / attention / next task
        |
        v
re-oriented Workbench presentation
~~~

The primary affected workflow steps are Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete. Queue/Create/Settings/Context/Evidence are supporting application services that must remain coherent with the same task model.

## Downstream invariants

Requirements, Solution design and Implementation plan must preserve at minimum:

1. one canonical WorkItem lifecycle owner;
2. browser presentation does not become workflow authority;
3. conversation is not canonical authority by itself;
4. required input, proposal disposition, blockers and recovery have explicit current owners;
5. direct governed Markdown Save remains an explicit canonical human mutation with expected-hash safety;
6. material maturity is derived from canonical facts unless a genuinely missing fact is proven;
7. technical/debug identity remains on demand unless it is itself required to perform the current task;
8. hidden reasoning/secrets/raw unbounded provider detail remain closed;
9. Git recording remains orthogonal to conformance/readiness;
10. sign-off remains explicit over one exact current package;
11. Implementation execution remains bounded by approved task authority;
12. historical inspection cannot steal current-attention ownership;
13. responsive representation may change geometry but not task meaning, action priority or state semantics.

## Unresolved facts

None material to starting functional design.

The remaining unresolved items are **product decisions**, not missing current-state facts:

- exact bounded operational agent activity that should be visible and whether it must be live, post-turn or both;
- exact proposal/cancellation behavior;
- exact semantic meaning of manual Implementation execution;
- final operator-facing labels and behavior for material maturity;
- detailed per-step information/action hierarchy where current P3 is incomplete;
- the complete integrated pre-signoff task flow.

These are product decisions owned by the functional design. They are now closed in `requirements.md`.

## Verdict

**CONFIRMED.**

The change is required and factually grounded. The parent Audit provides sufficient current-state evidence to proceed through functional design without re-investigating the released implementation.

The reviewed `requirements.md` converted those closed facts into the complete workflow-task functional model. The reviewed `solution-design.md` has now closed the corresponding technical realization and certification design.

## Design-package handoff

The documentation package has completed both Phase 2 design layers:

- Phase 2A — functional-design closure;
- Phase 2B — Solution-design closure, including canonical P4/P6 amendments and permanent verification obligations.

The next document-level activity is **Implementation plan**. This note records package consistency only; it does not fabricate runtime lifecycle events, conformance, approval, sign-off or execution state.
