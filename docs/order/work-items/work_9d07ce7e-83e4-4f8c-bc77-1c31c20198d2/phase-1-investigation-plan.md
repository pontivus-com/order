# Phase 1 investigation plan — Order 0.5.0

**Status:** Phase 1 execution plan  
**WorkItem:** `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Branch:** `version/0.5.0`  
**Lifecycle role:** supporting R1 investigation document; **not** the P7 `implementation-plan.md`  
**Governing lifecycle authority:** `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-LIFECYCLE-CONTEXT-V1`, `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`

## 1. Purpose

Phase 1 exists to establish the complete factual basis required before Order 0.5.0 makes functional-design or technical-design decisions.

The Phase 1 investigation must reconstruct the current product as one user-interaction system:

~~~text
current application condition
        |
        v
information presented + presentation hierarchy
        |
        v
interaction options + visibility/enabled rules
        |
        v
business/workflow/provider rule
        |
        v
read / command / provider turn / canonical mutation
        |
        v
resulting lifecycle / Run / material / provider condition
        |
        v
resulting screen / focus / recovery
~~~

That map is then used to establish three derived fact sets:

1. whether the current workflow/state machine correctly explains every user-visible condition and interaction;
2. what the current OpenCode integration actually exposes, what it can reliably expose, and which provider/agent facts are required for useful operator transparency;
3. how governed documents/materials currently mature, become current/stale/historical/locked, and interact with lifecycle progression.

Phase 1 does **not** choose the replacement UX, invent new product behavior, select a technical architecture, or write the implementation plan. Those decisions belong to Phase 2 and Phase 3 after the factual gate in §10 is satisfied.

## 2. Relationship to the Order lifecycle

This WorkItem uses `audit-v1`.

Under `GW-DOC-WORK-LIFECYCLE-V1`, an AUDIT completes at R1 with `AUDIT_COMPLETE`; it does not itself progress into R2, DESIGN, PLAN, R3 or EXECUTION.

Therefore:

- this Phase 1 plan governs only the R1 factual investigation;
- `research.md` is the canonical R1 lifecycle artifact and final Phase 1 synthesis;
- supporting Phase 1 documents remain evidence/detail behind `research.md`;
- after `AUDIT_COMPLETE`, any 0.5.0 product redesign/remediation proceeds through one or more separately governed same-project `CHANGE` or `DEFECT` WorkItems linked through `derivedFromWorkItemId`;
- the Phase 1 result must define the evidence and decision inputs those Phase 2 WorkItems require, but must not make their R2/DESIGN decisions on their behalf.

## 3. Investigation rules

### 3.1 Current state before future state

Every Phase 1 finding must first establish what exists now.

A statement such as "the agent activity should appear beside the document" is not a Phase 1 fact unless it is merely quoting existing authority. Phase 1 instead establishes facts such as:

- what agent activity is currently visible;
- where it is currently visible;
- what information source produces it;
- what interaction depends on it;
- whether existing authority requires something different;
- whether the current integration can expose additional bounded facts.

The replacement presentation is a Phase 2 decision.

### 3.2 One evidence backbone

`application-interaction-map.md` is the canonical Phase 1 owner for the current UI surface/information/interaction inventory.

Derived audits must reference its stable identifiers instead of copying its full rows into parallel documents.

### 3.3 Evidence before inference

Every material claim must cite direct evidence from one or more of:

- current production UI source on `version/0.5.0`;
- current daemon/core/shell/provider integration source;
- current canonical Order authority;
- current permanent tests and architecture sensors;
- reproducible runtime behavior/logs/diagnostics;
- exact pinned OpenCode facts and integration evidence.

Where evidence is unavailable, the fact remains `UNPROVEN`; it is not filled with design inference.

### 3.4 Business-rule ownership

The browser may derive presentation from canonical facts but must not be presumed to own workflow policy.

For every conditional interaction, the investigation traces:

~~~text
visible/enabled UI rule
-> source facts
-> governing authority/business rule
-> command/read/provider boundary
-> commit-time validation
-> canonical effect
~~~

A browser-only rule that materially changes eligibility is a finding, not a valid source of product truth.

### 3.5 No Phase 2 leakage

Phase 1 may identify:

- missing behavior definition;
- contradictory authority;
- missing state distinctions;
- missing transparency;
- incorrect ownership;
- incorrect current implementation;
- technical feasibility constraints.

Phase 1 must not decide:

- the final screen composition;
- the final information hierarchy;
- new lifecycle semantics;
- the final document-maturity model;
- new API/event shapes;
- the implementation abstraction;
- the final OpenCode observability design.

Those are Phase 2A/2B decisions.

## 4. Artifact set and ownership

Phase 1 produces the following documents in this WorkItem directory.

| Artifact | Owns | Why it exists | Primary Phase 2 consumer |
|---|---|---|---|
| `phase-1-investigation-plan.md` | investigation sequence, artifact boundaries, completeness rules, Phase 2 gate | prevents the investigation from becoming an unstructured collection of findings or prematurely turning into design | Phase 1 execution/review |
| `application-interaction-map.md` | complete current-state UI surface, information, interaction and user-flow inventory | provides the single factual application map from which UX, state and OpenCode questions are derived | Phase 2A functional requirements; Phase 2B UI/integration design |
| `workflow-state-audit.md` | workflow/state predicates and transitions required to explain the interaction map | proves whether current lifecycle/Run/proposal/recovery semantics are closed and user-representable | Phase 2A workflow behavior; Phase 2B state/contract design |
| `opencode-interaction-audit.md` | current provider/session path, agent interaction, observability capability, failure classes and transparency facts | establishes what Order/OpenCode currently knows and what information can safely/reliably support operator interaction | Phase 2A transparency/conversation behavior; Phase 2B OpenCode integration |
| `document-material-maturity-audit.md` | current facts governing Work request and lifecycle-document existence, editability, proposal/adoption, conformance, staleness, history and locking | separates document/material condition from WorkItem lifecycle position before Phase 2 decides the required product model | Phase 2A material behavior; Phase 2B state derivation/contracts |
| `certification-evidence-map.md` | mapping from each material invariant/finding to current tests/runtime evidence and missing proof | prevents green tests from being mistaken for end-to-end proof and defines the verification gaps Phase 2 design must close | Phase 2B certification design; Phase 3 verification plan |
| `research.md` | canonical R1 synthesis: criteria, evidence summary, findings, verdict and Phase 2 prerequisite closure | provides the lifecycle-owned Phase 1 result and determines whether `AUDIT_COMPLETE` is justified | Phase 2 work-item intake/context |

No supporting artifact may redefine canonical Order requirements. It records current-state evidence, derived facts, findings, or investigation control only.

## 5. Stable cross-document identifiers

To keep the artifacts traceable without semantic duplication, Phase 1 uses local evidence identifiers.

| Prefix | Meaning | Canonical owner inside Phase 1 |
|---|---|---|
| `SURF-` | rendered application surface or materially distinct surface state | `application-interaction-map.md` |
| `INFO-` | visible information item/region | `application-interaction-map.md` |
| `ACT-` | operator interaction/control | `application-interaction-map.md` |
| `FLOW-` | end-to-end user flow | `application-interaction-map.md` |
| `STATE-` | audited canonical state predicate/transition proposition | `workflow-state-audit.md` |
| `OC-` | OpenCode/provider/session proposition | `opencode-interaction-audit.md` |
| `MAT-` | document/material maturity proposition | `document-material-maturity-audit.md` |
| `CERT-` | certification/evidence proposition | `certification-evidence-map.md` |
| `F-` | consolidated Phase 1 finding/root cause | `research.md` |

Derived documents reference `SURF/INFO/ACT/FLOW` identifiers rather than recreating their current-state UI definitions.

## 6. Investigation sequence

### Step 1 — authority and production-boundary census

**Question:** What sources are allowed to tell Phase 1 what the product currently is and what it is supposed to mean?

**Work:**

- resolve the current canonical authority graph relevant to UI, lifecycle, WorkItem documents, OpenCode, contracts, validation and technical architecture;
- enumerate the productive UI render graph;
- enumerate the browser HTTP calls and daemon/core/shell owners reachable from those surfaces;
- enumerate permanent tests that claim to certify those paths;
- identify runtime evidence needed where source inspection is insufficient.

**Recorded in:**

- evidence/source section of `application-interaction-map.md`;
- test/evidence source registry in `certification-evidence-map.md`.

**Why:** all later rows need a fixed evidence basis. Without this step, current implementation behavior, intended behavior and provider capability can be accidentally conflated.

**Exit condition:** every productive UI root and every governing concern relevant to the audit has an identified source.

### Step 2 — complete application surface census

**Question:** What can the operator actually reach or see?

**Work:**

Enumerate every:

- route and top-level service;
- workflow-step workspace;
- nested task/work area;
- toolbar/action area;
- context inspector/drawer;
- editor;
- conversation/timeline;
- proposal/review view;
- evidence/code view;
- dialog/confirmation/task panel;
- empty/loading/processing/waiting/blocked/failed/stale/historical/terminal variant;
- responsive representation that materially changes interaction.

Each surface receives a `SURF-` id and records:

- parent/child composition;
- route/selection condition;
- workflow/application condition;
- source renderer(s);
- canonical facts needed to render it;
- current operator purpose if supported by authority;
- surfaces it can enter/return to.

**Artifact:** `application-interaction-map.md`.

**Why:** Phase 2 cannot design the complete product if Phase 1 has not first proven what the complete product surface currently contains.

**Exit condition:** the production render graph has no unclassified productive surface.

### Step 3 — information and presentation inventory

**Question:** What information is presented, what kind of information is it, and why is it there?

**Work:**

For every `SURF-`, enumerate every materially distinct visible information item as `INFO-` and record:

- exact content/label/value class;
- semantic category;
- canonical producer/owner;
- raw vs derived presentation;
- current vs historical vs diagnostic authority;
- current placement and hierarchy;
- display condition;
- duplication elsewhere;
- whether current authority explains why it belongs there;
- current-state verdict: correct, misplaced, duplicated, noisy, ambiguous, missing, technical leak, debug leak or ungoverned.

Information categories include at minimum:

- identity/navigation;
- primary work;
- current attention/action;
- workflow progress/state;
- document/material maturity/currentness;
- conversation;
- operational agent activity;
- proposal/review;
- evidence;
- supporting domain/context;
- history;
- configuration/readiness;
- technical detail;
- developer/debug diagnostic.

**Artifact:** `application-interaction-map.md`.

**Why:** this is the factual input Phase 2A needs to decide the future information architecture instead of merely rearranging current components.

**Exit condition:** no persistent visible datum on a productive surface is unclassified.

### Step 4 — interaction, business-rule and destination inventory

**Question:** What can the operator do, when can they do it, what rule allows it, and where does it lead?

**Work:**

Assign every operator action an `ACT-` id and record:

- visible-when condition;
- enabled-when condition;
- disabled explanation if any;
- interaction class;
- source facts;
- governing business/lifecycle/configuration rule;
- current UI handler;
- HTTP/daemon/core/provider path;
- commit-time recheck;
- canonical mutation or non-mutating effect;
- resulting lifecycle/Run/proposal/material/configuration effect;
- destination/selection/focus result;
- pending state;
- success orientation;
- error presentation and recovery;
- stale/conflict behavior.

Then construct `FLOW-` traces for ordinary and exceptional journeys, including forward workflow progression, backward returns, chat continuation, required input, proposal review/adoption/rejection, document save/currentness changes, reconciliation, Approval, Implementation, provider failure, retry/resume and Settings/readiness changes.

**Artifact:** `application-interaction-map.md`.

**Why:** this is the bridge between UX and business rules. It exposes interactions whose current availability cannot be justified by canonical state and state transitions that have no usable operator path.

**Exit condition:** every interactive control and every material workflow path has a traced rule and destination.

### Step 5 — workflow/state derivation

**Question:** Can the current canonical state model explain every mapped condition and interaction without contradiction or duplicate ownership?

**Work:**

Starting from `SURF/INFO/ACT/FLOW` rows, derive:

- required WorkItem lifecycle predicates;
- Run interaction conditions;
- proposal conditions;
- current-attention ownership;
- material currentness;
- recovery ownership;
- execution ownership/validation boundaries;
- state transitions and negative/impossible combinations;
- stale/current/reconciliation behavior;
- UI-visible states with no canonical explanation;
- canonical states with no coherent presentation;
- business rules duplicated in browser/daemon/core;
- the known proposal/control-event producer/consumer mismatch and any same-class failures.

Each proposition receives a `STATE-` id and cites the interaction-map ids that require it.

**Artifact:** `workflow-state-audit.md`.

**Why:** Phase 2 must know whether it is designing on a valid underlying state model or whether P3/P4/P6 state semantics themselves require correction.

**Exit condition:** every mapped material interaction condition is either explained by one canonical state predicate/transition or recorded as a finding.

### Step 6 — OpenCode integration, interaction and transparency derivation

**Question:** What does Order currently know about agent work, what can the pinned OpenCode integration expose reliably, and which facts are relevant to mapped operator decisions?

**Work:**

Trace the productive OpenCode path for STAGE, BUILDER, REVIEWER and REMEDIATOR:

- context/workspace construction;
- authority/instruction projection;
- account/model/session creation and continuation;
- prompt and output contract;
- tools/permissions/trusted integrations;
- provider turn;
- response extraction/repair/admission;
- batch validation/persistence/reaction;
- diagnostics and failure classification;
- restart/session-loss behavior.

For every potentially observable agent/provider fact, create an `OC-` proposition recording:

- exact source;
- reliability under the pinned integration;
- transient/persisted status;
- safety/sensitivity;
- current UI exposure;
- interaction-map decisions that need it;
- whether current evidence supports classifying it as product-relevant, secondary technical, or closed/internal;
- gaps where Phase 2 must decide the final transparency treatment.

Do not request or expose hidden model reasoning.

**Artifact:** `opencode-interaction-audit.md`.

**Why:** Phase 2 needs facts about actual provider capability and current interaction needs before it can decide what "agent transparency" should mean in the product.

**Exit condition:** every OpenCode fact required by a mapped interaction is proven available/unavailable/unreliable, and every current provider/session failure path has an evidence-backed origin classification or an explicit unresolved fact.

### Step 7 — document/material maturity derivation

**Question:** What facts currently determine the condition of each governed document/material independently of WorkItem lifecycle position?

**Work:**

For Work request, Research, Requirements, Solution design, Implementation plan, Readiness material, Approval package and signed execution material, create `MAT-` propositions covering:

- existence/source;
- draft/editable condition;
- proposal ownership;
- adoption state;
- conformance/currentness;
- stale/historical condition;
- direct-edit lock;
- consuming lifecycle stage;
- current UI representation/actions;
- current derivation source;
- missing/ambiguous maturity distinctions.

The audit tests whether each condition can be derived from existing canonical facts. It does not introduce a new persisted material-state machine.

**Artifact:** `document-material-maturity-audit.md`.

**Why:** Phase 2 must know which material conditions are real facts, which are missing distinctions, and which are merely UI labels before defining the future workflow/document experience.

**Exit condition:** every governed material has a complete current-state condition matrix or an explicit factual gap.

### Step 8 — certification and evidence closure

**Question:** What current tests/evidence actually prove the mapped behavior, and what remains unproven?

**Work:**

For each material `ACT/STATE/OC/MAT` proposition, create a `CERT-` row recording:

- expected invariant;
- current test/evidence owner;
- layer tested;
- positive path covered;
- negative/contradictory path covered;
- producer covered;
- consumer covered;
- browser-visible integrated behavior covered;
- runtime evidence available;
- verdict: proven, partial, absent or misleading.

**Artifact:** `certification-evidence-map.md`.

**Why:** Phase 2 technical design and Phase 3 planning need to know which permanent sensors can be retained, which need expansion, and where current green tests do not establish real productive correctness.

**Exit condition:** every material Phase 1 proposition has known proof status.

### Step 9 — R1 synthesis and Phase 2 readiness gate

**Question:** Is the fact set complete enough to make product and technical decisions without guessing?

**Work:**

Synthesize the supporting artifacts into the canonical `audit-r1-v1` structure in `research.md`:

- **Target/criteria** — identify the audited 0.4.0/0.5.0-baseline product and governing criteria;
- **Evidence by criterion** — summarize the supporting artifacts and direct evidence without duplicating their full matrices;
- **Findings** — consolidate upstream root causes as `F-` findings, with severity, affected surfaces/flows/states/roles and authority layer implicated;
- **Verdict** — state whether `AUDIT_COMPLETE` is justified and whether the Phase 2 prerequisite gate is satisfied.

The synthesis must also include a Phase 2 input register containing:

- closed factual decisions Phase 2 may rely on;
- explicit product questions Phase 2A must decide;
- explicit technical questions Phase 2B must decide after Phase 2A;
- any current authority that must be amended because Phase 1 proved it incomplete/contradictory;
- recommended linked `CHANGE`/`DEFECT` WorkItem boundary for the 0.5.0 design/delivery work;
- zero material unresolved factual questions that would force Phase 2 to guess.

**Artifact:** `research.md`.

**Why:** `research.md` is the lifecycle-owned boundary between evidence collection and design. Supporting artifacts make the audit complete; `research.md` makes the result governable.

**Exit condition:** the Phase 1 gate in §10 passes or the audit remains open.

## 7. Artifact content contracts

### 7.1 `application-interaction-map.md`

Required sections:

1. evidence/source registry;
2. application/navigation topology;
3. surface registry;
4. per-surface information inventory;
5. per-surface interaction inventory;
6. global/business-rule interaction matrix;
7. cross-surface normal flows;
8. cross-surface exceptional/recovery flows;
9. duplication/leakage inventory;
10. current-state gaps requiring derived audit.

This artifact owns **what the current user can see and do**. It does not own the lifecycle correctness verdict, OpenCode capability verdict, or future UX design.

### 7.2 `workflow-state-audit.md`

Required sections:

1. state-owner map;
2. lifecycle transition matrix;
3. STAGE interaction/proposal matrix;
4. current-attention/recovery derivation;
5. execution-owner/validation-state derivation;
6. interaction-map cross-reference matrix;
7. impossible/contradictory combination tests;
8. state/UI mismatch findings;
9. producer→consumer contract-closure findings.

This artifact owns **whether current state/business rules can validly explain the interaction map**.

### 7.3 `opencode-interaction-audit.md`

Required sections:

1. pinned integration facts and evidence;
2. productive role/context path;
3. session/account/model continuation behavior;
4. prompt/output/admission path;
5. available provider/agent observability facts;
6. current UI exposure;
7. transparency relevance by `SURF/INFO/ACT/FLOW`;
8. provider/session error taxonomy and recovery evidence;
9. restart/session-loss behavior;
10. integration/transparency findings.

This artifact owns **what the current integration actually does and can expose**, not the final product transparency design.

### 7.4 `document-material-maturity-audit.md`

Required sections:

1. governed material registry;
2. fact-source/owner matrix;
3. existence/editability matrix;
4. proposal/adoption matrix;
5. conformance/currentness/staleness matrix;
6. historical/locked/sign-off matrix;
7. UI representation/action cross-reference;
8. ambiguity/missing-distinction findings.

This artifact owns **the factual current material lifecycle**, not a new persistence model.

### 7.5 `certification-evidence-map.md`

Required sections:

1. evidence-source registry;
2. invariant-to-test matrix;
3. producer/consumer coverage;
4. positive/negative coverage;
5. browser/integration coverage;
6. runtime-evidence coverage;
7. misleading or insufficient current sensors;
8. missing certification obligations for Phase 2B.

This artifact owns **proof status**, not product behavior.

### 7.6 `research.md`

Required canonical template:

~~~text
## Target/criteria
## Evidence by criterion
## Findings
## Verdict
~~~

Within that template, `research.md` must synthesize—not duplicate—the supporting artifacts and explicitly record the Phase 1 → Phase 2 gate result.

## 8. Phase 1 dependency order

~~~text
Step 1 authority/production census
        |
        v
Step 2 surface census
        |
        v
Step 3 information inventory
        |
        v
Step 4 interaction/business-rule inventory
        |
        +-------------------+
        |                   |
        v                   v
Step 5 state audit     Step 6 OpenCode audit
        |                   |
        +---------+---------+
                  |
                  v
        Step 7 material maturity
                  |
                  v
        Step 8 certification/evidence
                  |
                  v
        Step 9 research.md synthesis/gate
~~~

Steps 5 and 6 may proceed in parallel only after Step 4 has established stable interaction-map identifiers. Step 7 may begin earlier for obvious document facts, but it cannot close until the state and interaction derivations are available.

## 9. Phase 1 finding discipline

Every consolidated finding in `research.md` must state:

- finding id;
- observed symptom or gap;
- direct evidence;
- upstream/root producing boundary;
- affected `SURF/INFO/ACT/FLOW` ids;
- affected `STATE/OC/MAT/CERT` ids;
- governing authority/criterion;
- verdict: `CORRECT`, `INCOMPLETE`, `CONTRADICTORY`, `UNPROVEN` or `OBSOLETE`;
- severity;
- whether it blocks Phase 2 factual closure;
- minimum authority layer implicated;
- whether Phase 2A, Phase 2B or later implementation must resolve it.

Findings must be grouped by upstream root cause, not by repeated screen symptom.

## 10. Phase 1 → Phase 2 entry gate

Phase 2 may start only when all of the following are true.

### 10.1 Application-map closure

- every productive UI surface is inventoried;
- every persistent visible information class is mapped to a source/owner and presentation role;
- every operator interaction has visibility and enablement conditions;
- every interaction has a traced command/read/provider path and destination;
- every ordinary and material exceptional flow is mapped;
- no known productive surface or interaction remains unclassified.

### 10.2 Workflow/state closure

- every mapped material UI condition has one explainable canonical state predicate or an explicit finding;
- every mapped canonical mutation has a valid transition/result or an explicit finding;
- negative/impossible combinations are enumerated;
- browser/daemon/core ownership conflicts are identified;
- document/material state is not silently conflated with WorkItem lifecycle state;
- the known STAGE proposal/control-event mismatch and same-class producer/consumer gaps are factually closed.

### 10.3 OpenCode fact closure

- the exact productive integration path is mapped for every role;
- session/account/model/context continuity is understood;
- each operator-relevant provider/agent fact is proven available, unavailable or unreliable under the pinned integration;
- current execution/session errors have evidence-backed origin classification or are explicitly blocking unresolved facts;
- the boundary between useful operational evidence and closed/private provider detail is factually understood well enough for Phase 2A to make the product decision.

### 10.4 Material-maturity closure

- every governed document/material has a current fact-source matrix;
- editability, proposal/adoption, conformance/currentness, stale/history and locking facts are known or explicitly identified as missing semantics;
- current UI representation/action consequences are mapped.

### 10.5 Evidence/certification closure

- every material proposition has known proof status;
- current test coverage is distinguished from actual end-to-end productive proof;
- missing certification obligations are explicit.

### 10.6 Decision-readiness closure

- there are no material unresolved **factual** questions that would force Phase 2 to guess current behavior, capability or ownership;
- every remaining open question is correctly classified as a **Phase 2 product decision** or **Phase 2 technical decision**;
- the minimum P3/P4/P5/P6 authority needing amendment is identified;
- the recommended linked Phase 2 WorkItem boundary is explicit;
- `research.md` can truthfully return the audit's canonical R1 verdict.

Failure of any gate keeps Phase 1 open.

## 11. Exact information Phase 2 must receive

### 11.1 Inputs required by Phase 2A — functional requirements / functional design

Phase 2A must receive, without re-investigating current implementation:

- complete current application surface topology;
- complete information inventory and current hierarchy problems;
- complete interaction inventory and current visibility/enabled business rules;
- current user-flow/recovery map;
- state/UI mismatch findings;
- OpenCode facts that affect user-facing transparency and conversation;
- document/material maturity facts;
- known usability/correctness root causes;
- explicit functional questions that existing authority does not answer;
- affected screens/states/flows for every finding.

That fact set allows Phase 2A to decide:

- future per-screen purpose and composition;
- future information hierarchy;
- future interaction visibility/enabled behavior;
- future conversation model;
- future operator-visible OpenCode transparency;
- future material-maturity behavior;
- future failure/recovery behavior;
- functional acceptance criteria.

### 11.2 Inputs required by Phase 2B — technical design

After Phase 2A has made those product decisions, Phase 2B must receive from Phase 1:

- current canonical state/transition owners and defects;
- current producer→carrier→consumer paths;
- current OpenCode integration/session capability and failure facts;
- current persistence/currentness sources;
- current API/daemon/core/browser ownership boundaries;
- current certification coverage/gaps;
- exact technical facts that constrain feasible implementation.

Combined with accepted Phase 2A requirements, that fact set allows Phase 2B to decide:

- corrected state algebra and canonical ownership;
- event/command/provider contracts;
- OpenCode session/context/observability realization;
- browser projection/composition ownership;
- API/transport changes where required;
- persistence/non-persistence decisions;
- permanent certification architecture.

## 12. Completion definition

Phase 1 is complete only when:

1. all supporting artifacts defined in §4 exist and satisfy their content contracts;
2. every material current-state claim is evidence-backed or explicitly `UNPROVEN`;
3. cross-document identifiers resolve without contradictory duplicate definitions;
4. `research.md` contains the canonical R1 synthesis and verdict;
5. the §10 gate is satisfied;
6. Phase 2 can begin without needing to rediscover how 0.4.0 currently works;
7. the remaining questions are design decisions, not missing facts.

A large quantity of audit text is not evidence of completion. Phase 1 is complete when the fact model is closed enough that Phase 2 can make deliberate product and technical decisions without guessing.
