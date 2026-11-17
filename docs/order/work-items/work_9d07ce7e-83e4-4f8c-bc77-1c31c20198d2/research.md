# Order 0.5.0 foundational interaction audit

## Target/criteria

### Audit target

This R1 AUDIT evaluates the released Order 0.4.0 production implementation that forms the 0.5.0 starting baseline.

The audited production implementation is:

`a4fca0d5771ecbf3af6f932649d3811bed750cd5`

Phase 1 documentation and rendered-evidence scaffolding were developed on the single `version/0.5.0` branch without changing the audited production source.

The audit target is the application as one integrated user-interaction system:

~~~text
canonical data / workflow / provider facts
        |
        v
information presented and its hierarchy
        |
        v
interaction availability
        |
        v
operator action
        |
        v
browser -> daemon/core/shell/provider path
        |
        v
canonical state/material/provider consequence
        |
        v
resulting screen / attention / recovery
~~~

### Audit criteria

The audit is governed by the current Order authority graph, especially:

- `GW-DOC-WORK-LIFECYCLE-V1`;
- `GW-DOC-LIFECYCLE-CONTEXT-V1`;
- `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`;
- `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- `GW-DOC-WORKBENCH-UX-V2`;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`;
- `GW-DOC-OPENCODE-INTEGRATION-V1`;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`;
- `GW-DOC-CANONICAL-CONTRACTS-V1`;
- `GW-DOC-EXECUTION-CONTROL-PLANE-V1`;
- `GW-DOC-VALIDATION-STANDARD-V1`;
- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`.

The Phase 1 completion criterion is not “all current tests pass”. It is:

> Phase 2 can make functional and technical design decisions without rediscovering how the current product works or guessing current capability, ownership, state, data flow or provider behavior.

Phase 1 does not choose the replacement UX, new lifecycle semantics, final OpenCode transparency design or implementation architecture.

## Evidence by criterion

### E1 — complete application interaction map

Canonical supporting artifact:

[application-interaction-map.md](application-interaction-map.md)

It contains:

- complete application/navigation topology;
- `SURF-` surface registry including nested overlays;
- state-scenario coverage;
- rendered evidence manifest;
- `INFO-` typed information lineage;
- `ACT-` interaction/business-rule/effect paths;
- `FLOW-` normal and exceptional user journeys;
- overlay/confirmation graph;
- information leakage/duplication inventory;
- completed cross-artifact closure ledger.

Rendered evidence was captured against one fixed production implementation using temporary GitHub Actions scaffolding and the repository's real browser/e2e path. The temporary workflow was removed after evidence collection.

The retained evidence corpus contains 44 rendered scenarios across the registered application/workflow/overlay surfaces, including Queue, Create, Settings, Work request, R1/R2/DESIGN/PLAN, R3, Approval, Implementation, Complete, Context, proposal review, evidence, confirmations, responsive states, density conditions and theme states.

### E2 — workflow/state model

Canonical supporting artifact:

[workflow-state-audit.md](workflow-state-audit.md)

The audit proves that the existing pure state decomposition is structurally appropriate and does **not** justify a second persisted aggregate workflow state.

Current state is already correctly separated into:

- WorkItem lifecycle;
- reached history;
- STAGE Run interaction;
- proposal decision;
- material currentness;
- recovery disposition;
- execution owner;
- validation boundary;
- observation coherence;
- current attention;
- workflow-rail projection.

The normal lifecycle relation, required-input admission, source/currentness invalidation, sign-off freshness, execution validation ownership and current-attention precedence are substantially closed.

### E3 — OpenCode integration and transparency

Canonical supporting artifact:

[opencode-interaction-audit.md](opencode-interaction-audit.md)

The exact pinned OpenCode v2.2.6 integration was audited from both Order source/authority and the immutable pinned upstream source.

Facts established include:

- OpenCode is a narrow execution provider, not workflow authority;
- STAGE session reuse is strictly bounded by one Order Run/context/material identity;
- BUILDER/REVIEWER/REMEDIATOR use fresh bounded sessions;
- model and permission binding is proved before productive prompting;
- current Order completion uses `session.get` + terminal `session.context`, not a live event subscription;
- Order currently extracts only assistant text from the terminal context;
- canonical RunEvents, not provider-native messages, own workflow semantics;
- the released pinned provider already contains typed post-turn tool parts;
- its global event stream is experimental/volatile;
- its experimental durable session log contains richer tool/step/retry events but is not currently an authorized Order correctness source;
- hidden assistant reasoning is not product transparency and remains out of scope.

No OpenCode upgrade is factually required merely to obtain additional provider activity data.

### E4 — document/material maturity

Canonical supporting artifact:

[document-material-maturity-audit.md](document-material-maturity-audit.md)

The audit proves that useful material maturity can be derived from current canonical facts without introducing another persisted status model.

Existing facts distinguish:

- absent material;
- repository draft;
- pending proposal;
- adoption in progress;
- current but unconformed bytes;
- current conformed material;
- stale authority;
- historical material;
- committed sign-off closure;
- signed/locked execution material;
- terminal result.

Git recording is correctly orthogonal to conformance/readiness.

### E5 — certification/proof status

Canonical supporting artifact:

[certification-evidence-map.md](certification-evidence-map.md)

The current permanent suite strongly proves many local and end-to-end invariants, but Phase 1 identifies six classes where green tests are incomplete or misleading:

1. STAGE consumer grammar is tested, producer agreement is not;
2. proposal state and Cancel are separately tested, their contradictory combination is not;
3. task-local execution UI is tested against an unscoped global tick only in a fixture where the visible task happens to be runnable;
4. lifecycle-draft materialization is certified, no-Run draft consumption is not;
5. technical information hierarchy is not comprehensively enforced;
6. provider diagnostics are tested for boundedness, not causal sufficiency after downstream batch rejection.

The cross-artifact evidence ledger is closed. No productive surface family remains outside the audit.

## Findings

The findings below are consolidated by **upstream producing boundary**. Repeated screen symptoms are not separate root causes.

### F-01 — Workbench information governance is not consistently enforced

**Evidence:** INFO-F01, INFO-F02, INFO-F03, INFO-F04; CERT-GAP-05.

The current UI correctly keeps many exact identities in Context or explicit technical disclosures, but this rule is not consistently applied.

Confirmed examples:

- lifecycle-document primary headings expose raw repository paths;
- pre-signoff/R3/Approval selectors expose raw paths persistently;
- Approval's primary review body exposes package hash, source SHA and baseline commit despite the current Approval contract explicitly making those technical/on-demand;
- historical Approval metadata exposes exact Approval id.

These are not missing data-model facts. They are failures to apply the existing information hierarchy consistently.

**Affected:** document surfaces, R1/R2/DESIGN/PLAN, R3, Approval, historical task inspection.

**Verdict:** `CONTRADICTORY` where current P3 explicitly forbids the placement; otherwise `INCOMPLETE`.

**Severity:** 0.5.0 blocker for usable screen redesign.

**Minimum authority impact:** current P3 already resolves some cases; Phase 2A must complete the per-screen information contract and remove ambiguity across all surfaces.

---

### F-02 — proposal ownership and Run terminalization are not a closed state algebra

**Evidence:** STATE-F01, MAT-F05, CERT-006/CERT-GAP-03.

Current authority and implementation allow:

~~~text
OPEN + PENDING(proposal)
        |
        | Cancel Run
        v
CANCELLED + CLOSED + PENDING(proposal)
~~~

The proposal remains current attention, but Adopt/Reject require an OPEN owning Run. The state is therefore reachable through the command boundary and has no valid disposition path.

The ordinary UI currently suppresses Cancel while proposal attention owns the current surface, but that does not close the canonical HTTP/daemon/state algebra.

**Affected:** R1/R2/DESIGN/PLAN/R3 proposal lifecycle.

**Verdict:** `CONTRADICTORY`.

**Severity:** release blocker.

**Minimum authority impact:** current P3/P4 behavior must be amended; this is not an implementation-only defect.

---

### F-03 — Implementation's visible task owner is not the scope of its manual execution command

**Evidence:** ACT-F01, STATE-F02, CERT-013/CERT-GAP-02.

The Workbench derives one WorkItem-local `CURRENT_TASK` and presents:

> Run next implementation step

But the action calls:

`POST /api/tick`

with no WorkItem or task identity.

The daemon then runs the global scheduler and may choose another globally runnable WorkItem/task.

Current browser proof uses a fixture where the intended task happens to be the runnable task; it does not establish task-local command semantics.

**Affected:** Implementation.

**Verdict:** `CONTRADICTORY`.

**Severity:** release blocker.

**Minimum authority impact:** Phase 2A must define what this operator action means; Phase 2B must make the command boundary match that meaning.

---

### F-04 — STAGE provider producer and consumer contracts are not closed

**Evidence:** STATE-F03, OC-F03, OC-F07, CERT-004/005/CERT-GAP-01/CERT-GAP-06.

The consumer correctly enforces a closed provider-turn grammar:

- one controlling input/block/completion at most;
- those controls mutually exclusive;
- one lifecycle proposal at most;
- proposal cannot coexist with input/block/completion;
- proposal stage/role ownership must match;
- no new proposal over unresolved proposal.

But the productive producer contract tells OpenCode only the admitted individual event schema/tags. It does not state the cross-event batch grammar.

Therefore a provider can return individually valid events such as proposal + completion and only fail after the provider turn succeeds.

This is the proven upstream mechanism for:

> lifecycle proposal cannot coexist with a controlling event

Diagnostics also lack a bounded summary of the rejected returned event shape, so the exact invalid combination cannot be reconstructed from provider diagnostic evidence alone.

**Affected:** all STAGE roles: Research, Requirements, Solution design, Implementation plan, Readiness.

**Verdict:** `INCOMPLETE / CONTRADICTORY producer→consumer contract`.

**Severity:** release blocker.

**Minimum authority impact:** P4/P6 producer contract + diagnostics + permanent certification. The consumer validator is directionally correct and must not be weakened.

---

### F-05 — OpenCode agent work is too opaque for the stated 0.5.0 usability objective, but provider capability is not the root limitation

**Evidence:** OC-F01, OC-F02, OC-F04, INFO-F07, CERT-019.

Current ordinary UI exposes:

- owning Order role;
- Order processing/open/waiting/failure state;
- final canonical agent messages;
- required questions;
- proposals;
- blockers/completions;
- review/validation outcomes.

It does **not** expose bounded provider operational activity such as tool/action category, safe read/affected-resource summaries, or provider progress.

The current pin can already provide richer post-turn tool structure. Richer live/replay activity has different reliability surfaces and would require deliberate integration/certification.

**Affected:** R1/R2/DESIGN/PLAN interactive collaboration and potentially execution roles.

**Verdict:** `INCOMPLETE PRODUCT SEMANTICS` for 0.5.0.

**Severity:** major usability requirement; blocks Phase 2 design closure, not Phase 1 factual closure.

**Minimum authority impact:** Phase 2A must define the operator-visible activity requirement and boundary between operational activity, technical detail and closed provider internals. Phase 2B then selects a reliable bounded source.

---

### F-06 — repository lifecycle drafts are not fully portable through the current consumer projection

**Evidence:** MAT-F01, CERT-021/CERT-GAP-04.

Source reconciliation correctly finds deterministic lifecycle Markdown and stores ArtifactRefs without fabricating Runs/conformance.

But `currentLifecycleArtifacts()` obtains candidates only through STAGE Run history. On a fresh runtime with repository lifecycle drafts and zero historical Runs, the drafts can be materialized but omitted from the normal lifecycle-document projection.

This contradicts the existing P3 portability requirement.

**Affected:** R1/R2/DESIGN/PLAN/R3 lifecycle documents on rediscovery/fresh installation.

**Verdict:** `CONTRADICTORY IMPLEMENTATION`.

**Severity:** release blocker.

**Minimum authority impact:** P3 is already explicit. Phase 2B must define/confirm the correct current-material projection without fabricating history or adding a duplicate persisted document state.

---

### F-07 — document maturity exists in canonical facts but lacks a complete operator-facing semantic contract

**Evidence:** MAT-F02 plus application map.

Current facts can already distinguish repository draft, proposal/adoption, current/unconformed, conformed, stale, historical and signed/locked conditions.

The Workbench does not expose one complete, consistent user-facing vocabulary for those distinctions.

Lifecycle stage and material maturity are therefore too easy to conflate in the current UX, even though the underlying model is capable of keeping them separate.

**Affected:** all governed document steps, Approval and execution inspection.

**Verdict:** `INCOMPLETE P3 PRODUCT SEMANTICS`.

**Severity:** major Phase 2 functional-design input.

**Minimum authority impact:** Phase 2A. A new persisted state model is not justified by Phase 1 evidence.

---

### F-08 — the current state architecture is largely sound and should be preserved

Phase 1 explicitly did **not** find justification to replace the current pure state-derivation architecture.

The following are materially correct and should be treated as constraints rather than presumed rewrite targets:

- one WorkItem lifecycle owner;
- monotonic reached history;
- exact OPEN/REQUIRED_INPUT input ownership;
- source/currentness invalidation;
- recovery ownership;
- observation coherence;
- current-attention precedence;
- WorkItem-local execution-owner derivation;
- candidate-scoped validation boundary;
- exact sign-off package freshness;
- strict STAGE session continuity;
- coordinator-interruption semantics;
- Git recording separate from conformance;
- signed execution material locked against direct Markdown mutation.

**Verdict:** `CORRECT`.

## Verdict

### Phase 1 audit verdict

**AUDIT_COMPLETE is justified.**

Phase 1 has established a closed current-state fact model sufficient to begin Phase 2 without re-investigating the released implementation.

The audit confirms material product defects and missing design semantics; AUDIT_COMPLETE does **not** mean the product is correct.

### Phase 1 → Phase 2 gate

| Gate | Verdict | Basis |
|---|---|---|
| application-map closure | **PASS** | all productive surfaces/overlays, information and interactions mapped; cross-artifact ledger closed |
| workflow/state closure | **PASS as factual closure** | correct state model identified; F-02/F-03/F-04 precisely located; no unresolved ownership fact |
| OpenCode fact closure | **PASS** | current integration, pin capability, reliability and safety boundaries established |
| material-maturity closure | **PASS** | all governed material fact sources and gaps established |
| evidence/certification closure | **PASS** | exact proof/missing-proof matrix complete |
| decision-readiness closure | **PASS** | remaining questions are functional/technical design decisions, not missing facts |

There are **zero identified material unresolved factual questions** that require reopening 0.4.0 implementation discovery before Phase 2 begins.

### Phase 2 prerequisite package

#### A. Current-product fact register

Phase 2 may rely on these Phase 1 owners instead of rediscovering current behavior:

| Fact domain | Canonical Phase 1 source |
|---|---|
| complete surface/overlay topology | `application-interaction-map.md` §§8–11 |
| complete typed information lineage and hierarchy findings | `application-interaction-map.md` §12, §18 |
| complete interaction/business-rule/effect paths | `application-interaction-map.md` §§13–17 |
| workflow/state algebra and defects | `workflow-state-audit.md` |
| OpenCode role/session/capability/transparency/failure facts | `opencode-interaction-audit.md` |
| document/material maturity/currentness facts | `document-material-maturity-audit.md` |
| current proof and certification gaps | `certification-evidence-map.md` |
| root-cause findings | this document, F-01…F-08 |

#### B. Functional-decision register for Phase 2A

##### FD-01 — complete per-screen information hierarchy and interaction contract

**Affected:** every `SURF-`, especially F-01.

**Closed facts:**
- current information/data lineage;
- current Workbench interaction classes;
- existing primary/secondary/technical rules;
- exact leakage/duplication points;
- all current controls and state conditions.

**Phase 2A must decide:**
- one explicit screen contract for every workflow/application surface;
- what is primary work;
- what owns current attention;
- what remains supporting context;
- what agent activity is visible;
- what is technical/debug/on-demand;
- which control is primary in each material state;
- exact visibility/enabled conditions and post-action orientation.

No implementation mechanism is selected here.

##### FD-02 — operator-visible OpenCode activity model

**Affected:** F-05, R1/R2/DESIGN/PLAN and potentially Implementation.

**Closed facts:**
- current product-visible canonical activity;
- provider capabilities at exact pin;
- current non-observability;
- reliability limits of provider event sources;
- reasoning/secrets/raw metadata closure requirements.

**Phase 2A must decide:**
- which bounded agent operational facts the operator needs;
- when they are primary, secondary or technical;
- whether activity must be live, post-turn, or both;
- what interaction the operator may perform while the agent is processing;
- which provider facts must remain closed.

##### FD-03 — manual Implementation action semantics

**Affected:** F-03.

**Closed facts:** visible owner is one WorkItem-local current task; current command is a global scheduler tick.

**Phase 2A must decide:**
- whether the operator is explicitly starting the visible task;
- asking the global scheduler to run any eligible work;
- or whether manual execution control should have another product meaning.

The label, placement and command semantics must agree.

##### FD-04 — proposal versus cancellation/terminalization semantics

**Affected:** F-02.

**Closed facts:** pending proposal requires current OPEN owner; current Cancel can close the Run while leaving the proposal unresolved.

**Phase 2A must decide:**
- whether Cancel is unavailable while proposal disposition owns attention;
- whether Cancel implies an explicit proposal disposition;
- or another single recoverable semantic.

No dead proposal state is acceptable.

##### FD-05 — operator-facing document/material maturity

**Affected:** F-07 and MAT-F01.

**Closed facts:** existing canonical facts already distinguish the relevant maturity conditions.

**Phase 2A must decide:**
- which distinctions the operator must see;
- their user-facing names;
- how maturity is shown independently of lifecycle stage;
- edit/save/conformance/proposal/history/lock behavior for each material condition.

##### FD-06 — integrated pre-signoff conversation/document loop

**Affected:** R1/R2/DESIGN/PLAN; F-05/F-07.

**Closed facts:** conversation is non-authoritative; document/proposal mutation is canonical; current input/proposal ownership semantics are known.

**Phase 2A must close the complete user behavior:**

~~~text
document/context
 -> agent processing/activity
 -> message/question/proposal/open continuation
 -> human response/review/edit
 -> canonical material change
 -> conformance/currentness
 -> continue/promote/return/block
~~~

This must produce one coherent screen interaction rather than independent chat and document features.

#### C. Technical-decision register for Phase 2B

##### TD-01 — close proposal terminalization algebra

**Affected:** F-02 / STATE-F01 / MAT-F05.

After FD-04, define exact P4/P6 command/event rules and permanent negative certification so no admitted command leaves an unresolved proposal without an owner.

##### TD-02 — align manual execution command ownership

**Affected:** F-03 / STATE-F02.

After FD-03, make browser command scope and daemon control-plane scope identical. Permanent tests must include competing runnable WorkItems/tasks.

##### TD-03 — close STAGE producer→consumer turn contract

**Affected:** F-04 / STATE-F03 / OC-F07.

Define the closed batch grammar in the productive provider contract, parsing/admission boundary and certification. Do not weaken `validateStageProviderTurn`.

##### TD-04 — make provider admission failure evidence causally sufficient

**Affected:** F-04 / OC-F03.

Define a bounded/redacted diagnostic projection sufficient to distinguish successful provider execution from later Order batch rejection and identify rejected event classes without persisting raw unbounded output.

##### TD-05 — realize accepted OpenCode operational transparency

**Affected:** F-05.

After FD-02, select the reliable provider/Order data source, projection, retention/restart semantics and redaction. Use current pin if it satisfies the accepted requirement; do not upgrade by default.

##### TD-06 — close repository-draft projection

**Affected:** F-06 / MAT-F01.

Make deterministic repository drafts visible through the current-material query/UI without fabricating Run/conformance history and without introducing duplicate persisted maturity state.

##### TD-07 — enforce accepted information hierarchy structurally

**Affected:** F-01.

Define shared screen/composition/primitive ownership so technical/debug material cannot leak into primary workflow surfaces by feature-local convenience.

##### TD-08 — permanent integrated certification

Design the producer+consumer, browser, state, provider and material tests identified in `certification-evidence-map.md` §9.

#### D. Authority-amendment register

| Authority | Finding | Phase 2 obligation |
|---|---|---|
| P3 `GW-DOC-WORKBENCH-UX-V2` | F-05/F-07; current provider-activity and material-maturity product semantics incomplete | Phase 2A amend functional interaction/transparency/maturity requirements |
| P3/P4 proposal interaction/action rules | F-02 | Phase 2A choose behavior; Phase 2B close command/state algebra |
| P3/P4 execution manual-control semantics | F-03 | Phase 2A define operator meaning; Phase 2B align control-plane command |
| P4 `GW-DOC-OPENCODE-INTEGRATION-V1` | F-04/F-05 | close turn producer grammar; add accepted operational-observability source if required |
| P4 Workbench architecture | F-01/F-07 | define accepted screen/data/activity/maturity composition ownership |
| P6 `GW-DOC-CANONICAL-CONTRACTS-V1` | F-02/F-04/F-06 as required | close exact command/provider/diagnostic/current-material contracts without duplicate state |
| permanent certification authority/sensors | all blockers | add integrated producer→consumer and browser/state negative proof |

Current P3 information hierarchy itself is **directionally correct**; its existing rules should not be discarded merely because current implementation violates them. Phase 2A should preserve correct authority and amend only missing/contradictory behavior.

#### E. Phase 2 WorkItem boundary

Phase 1 recommends **one linked `CHANGE` WorkItem for the integrated 0.5.0 functional/design/delivery package**, derived from:

`work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`

Reason:

- the UX, lifecycle/material model and OpenCode interaction are one coupled operator interaction system;
- FD-01 through FD-06 must be decided together before technical design;
- splitting them into independent remediation WorkItems would recreate the current mismatch between UI, state and provider behavior;
- the release is feature-level usability/correctness work, not an isolated bug train.

Within that CHANGE WorkItem, the confirmed implementation defects F-01, F-04 and F-06 and the state/control defects F-02/F-03 remain traceable findings from this immutable AUDIT. Separate child DEFECT WorkItems are not required merely to duplicate those findings unless Phase 2 deliberately establishes an independently deliverable boundary.

The linked CHANGE must traverse:

`R2 functional requirements -> DESIGN -> PLAN -> R3 -> Approval -> Implementation`

under the existing lifecycle.

The AUDIT remains terminal immutable provenance.

#### F. Final gate verdict

| Requirement | Result |
|---|---|
| Phase 1 supporting artifacts exist | **PASS** |
| application interaction map complete | **PASS** |
| rendered evidence complete enough for current-state hierarchy assessment | **PASS** |
| state ownership/transitions factually closed | **PASS** |
| OpenCode pin/capability/failure facts closed | **PASS** |
| material maturity/currentness facts closed | **PASS** |
| certification/proof gaps explicitly mapped | **PASS** |
| cross-artifact ledger closed | **PASS** |
| unresolved material factual questions | **0** |
| remaining questions correctly classified as Phase 2 decisions | **PASS** |
| Phase 2 can start without rediscovering current implementation | **PASS** |

**Final R1 verdict: `AUDIT_COMPLETE`.**

The next governed artifact is therefore **not another Phase 1 investigation** and not an implementation plan. It is the linked CHANGE WorkItem's **R2 functional requirements / functional design**, using this prerequisite package as factual input.
