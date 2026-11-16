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

Every material claim must cite direct evidence. Phase 1 uses two mandatory evidence lanes for UI/application-map work.

**A. Source/contract evidence**

For every mapped surface, information item and interaction, Phase 1 must trace the exact production source that makes the behavior possible:

- current production UI renderer/component on `version/0.5.0`;
- exact typed model/schema/contract fields consumed by that renderer;
- query/API response or locally derived projection supplying those fields;
- pure derivation/presentation function where applicable;
- exact conditional predicate controlling whether the surface/item/action is rendered, hidden, enabled or disabled;
- event handler/mutation/read owner for interactions;
- downstream daemon/core/shell/provider owner where the interaction crosses the browser boundary;
- current canonical authority and permanent tests relevant to the behavior.

A screenshot alone is never sufficient evidence for a UI fact because it cannot prove the data owner, type, conditional rule or downstream effect.

**B. Rendered/runtime evidence**

For each materially distinct visual/application condition, Phase 1 must capture the actual rendered product state. Where the required browser/runtime execution cannot be performed through the available local runtime/connectors, the rendered evidence **must be produced through temporary GitHub Actions operational scaffolding** under the repository's temporary-workflow rules.

Temporary screenshot workflows must:

- run only on `version/0.5.0`;
- use the repository's pinned runtime/package manager/browser dependencies and existing productive/e2e startup path;
- create no production behavior or alternate application path;
- capture only ordinary verification evidence;
- identify the exact commit SHA under audit;
- be removed from the branch immediately after the required evidence is collected;
- leave no temporary workflow YAML in the release candidate tree.

Rendered evidence must record the workflow run/commit, viewport, theme where material, fixture/runtime state, `SURF-` id and screenshot/evidence filename so the image can be correlated back to source evidence.

Other direct evidence may also include:

- current daemon/core/shell/provider integration source;
- current permanent tests and architecture sensors;
- reproducible runtime logs/diagnostics;
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

## 6. Executable Phase 1 task set

The Phase 1 work is executed through the following tasks. A task is complete only when its declared output exists in the owning artifact and satisfies the stated completion criteria. Later tasks may consume only completed upstream outputs or explicitly marked `UNPROVEN` facts; they may not silently fill missing evidence.

### P1-T01 — establish authority, code and evidence baseline

**Depends on:** none.

**Inputs:**

- this WorkItem and Phase 1 plan;
- current `version/0.5.0` repository tree;
- canonical authority resolved through `pontivus-order.toml [refs]`;
- current permanent tests and browser/e2e harness;
- current pinned OpenCode integration facts.

**Work:**

1. resolve the authority graph relevant to Workbench UX, lifecycle, WorkItem documents, contracts, OpenCode, validation and architecture;
2. enumerate the productive UI root/render graph;
3. enumerate browser API/query dependencies reachable from those roots;
4. enumerate daemon/core/shell/provider owners behind those APIs;
5. enumerate current permanent test owners;
6. identify which facts require rendered/runtime evidence rather than source inspection alone;
7. create the evidence-source registry used by all later tasks.

**Produces:**

- `application-interaction-map.md` skeleton containing the evidence/source registry and application root topology;
- `certification-evidence-map.md` skeleton containing the permanent-test/evidence registry.

**Done means:**

- every productive UI root has a source owner;
- every governing concern used later has a resolved authority owner;
- every browser→backend boundary has an identified entry point;
- every permanent test family relevant to the audit is registered;
- no later task needs to rediscover where its evidence should come from.

---

### P1-T02 — build the complete surface and state-scenario census

**Depends on:** P1-T01.

**Inputs:**

- productive render graph from P1-T01;
- canonical workflow stages and Workbench interaction classes;
- current renderer composition and conditional branches.

**Work:**

1. enumerate every top-level and nested productive surface;
2. assign stable `SURF-` identifiers;
3. record parent/child composition and route/selection conditions;
4. enumerate every modal, drawer, popover, confirmation, task panel, inspector and materially distinct overlapping surface reachable from each screen;
5. record trigger, close/return and resulting navigation/focus relationships;
6. define the minimal state-scenario coverage needed for each surface, including materially distinct combinations of lifecycle state, Run state, proposal state, material currentness, blocker/failure/recovery, attempt/history selection, loading/error/empty state and responsive class;
7. explicitly mark impossible/equivalent scenario combinations so coverage does not become an uncontrolled Cartesian product.

**Produces:**

- `application-interaction-map.md` surface registry;
- originating-surface→overlay graph;
- per-surface conditional-render/state-scenario matrix;
- preliminary cross-artifact closure ledger with one row per `SURF-`.

**Done means:**

- no production renderer branch can create a user-visible productive surface without a `SURF-` row;
- every materially distinct overlay is represented;
- every surface has a defined scenario coverage set;
- omitted scenario combinations are justified as impossible or semantically equivalent.

---

### P1-T03 — capture rendered/runtime evidence for the surface census

**Depends on:** P1-T02.

**Inputs:**

- `SURF-` registry and state-scenario matrix;
- existing e2e/browser harness and fixtures;
- repository temporary GitHub Actions rules.

**Work:**

1. determine which scenarios already have reproducible runtime fixture support;
2. create temporary GitHub Actions scaffolding when the required browser execution cannot be produced through available local/runtime connectors;
3. run the exact `version/0.5.0` commit under audit;
4. capture rendered evidence for every primary surface and every materially distinct conditional/overlay state;
5. capture wide/medium/narrow variants when layout class changes composition;
6. capture light/dark/system-theme evidence where theme materially affects readability, hierarchy or state meaning;
7. include representative and stress data where density affects usability: long titles, long Markdown, multiple attempts, multiple tasks, evidence/history volume, provider messages and diagnostic/error conditions;
8. record the exact commit, workflow run, fixture condition, viewport, theme, `SURF-` id and evidence filename;
9. remove all temporary workflow YAML immediately after evidence collection and prove the branch tree is clean of scaffolding.

**Produces:**

- rendered evidence files/artifacts for the audited commit;
- rendered-evidence manifest in `application-interaction-map.md`;
- runtime-evidence entries in `certification-evidence-map.md`.

**Done means:**

- every required `SURF-` scenario has rendered evidence or is explicitly `UNPROVEN` with a blocking reason;
- screenshots are correlated to exact source commit and fixture state;
- temporary GitHub Actions scaffolding does not remain in the branch tree.

---

### P1-T04 — map every presented datum to its typed source and presentation rule

**Depends on:** P1-T02 and P1-T03.

**Inputs:**

- surface registry;
- rendered evidence;
- UI source and typed contracts;
- browser queries/API contracts and presentation derivations.

**Work:**

For every `SURF-`:

1. enumerate every materially distinct visible datum/region as `INFO-`;
2. identify the exact TypeScript/domain model type and field(s) supplying it;
3. trace the query/API/selector/projection path that supplies the value;
4. identify the canonical producer/owner;
5. identify any pure derivation/presentation function;
6. record the exact show/render predicate and the values that suppress the information;
7. classify authority/currentness and information category;
8. record placement, hierarchy and duplication;
9. record the operator question/decision the information supports, if any;
10. link the `ACT-`/`FLOW-` interactions that consume that information;
11. compare actual rendered placement against current governing Workbench authority;
12. record source and rendered evidence references.

**Produces:**

- complete per-surface typed data/model/schema input map in `application-interaction-map.md`;
- complete `INFO-` inventory;
- actual-rendering versus current-authority comparison for information hierarchy;
- duplication/technical-leak/debug-leak inventory.

**Done means:**

- every persistent visible datum is accounted for;
- every presented value has a typed source lineage;
- every conditional absence has an exact predicate;
- every item has a semantic class and authority/currentness classification;
- nothing is justified merely because the runtime happened to have the data.

---

### P1-T05 — map every interaction, business rule, overlay and destination

**Depends on:** P1-T04.

**Inputs:**

- `SURF-` and `INFO-` inventories;
- UI handlers and browser mutation/query code;
- daemon/core/shell/provider command paths;
- lifecycle/configuration business rules.

**Work:**

For every interactive control:

1. assign an `ACT-` id;
2. record the originating surface;
3. record visible-when and enabled-when predicates;
4. trace the exact typed fields/derived facts used by those predicates;
5. identify the `INFO-` entries required for the operator to understand the decision;
6. identify the governing business/lifecycle/configuration rule;
7. trace handler → HTTP/query/mutation → daemon/core/shell/provider owner;
8. record server-side/commit-time revalidation;
9. record canonical mutation or explicit non-mutating effect;
10. record lifecycle/Run/proposal/material/configuration consequences;
11. record destination `SURF-`, selection, focus and overlay behavior;
12. record pending, success, failure, stale/conflict and recovery behavior;
13. compare actual action availability with current governing authority.

Then create `FLOW-` traces for every normal and material exceptional journey.

**Produces:**

- complete `ACT-` inventory in `application-interaction-map.md`;
- global business-rule interaction matrix;
- normal-flow map;
- exceptional/recovery-flow map;
- complete overlay/modal/drawer/popover/confirmation interaction graph;
- actual-interaction versus current-authority comparison.

**Done means:**

- every operator control has an explained visibility rule, enablement rule, business owner, data predicate, downstream path and destination;
- every material user journey is traceable end-to-end;
- there is no interaction whose product meaning must be inferred from its component label alone.

---

### P1-T06 — derive and audit the workflow/state model from the interaction map

**Depends on:** P1-T05.

**Inputs:**

- closed `SURF/INFO/ACT/FLOW` map;
- canonical lifecycle/context authority;
- core/daemon persistence and transition implementation;
- current tests.

**Work:**

1. derive the exact canonical state predicate required to explain each material UI condition and action;
2. map WorkItem lifecycle state separately from Run interaction state, proposal state, material currentness/maturity, current-attention ownership and execution/validation state;
3. construct the full lifecycle transition matrix;
4. construct the STAGE interaction/proposal/control matrix;
5. enumerate impossible/negative combinations;
6. trace browser→daemon→core ownership for each eligibility rule;
7. identify duplicated/contradictory state ownership;
8. identify canonical states with no coherent UI representation;
9. identify UI conditions/actions with no valid canonical state explanation;
10. factually close the known proposal/control-event producer→consumer mismatch and search for same-class failures.

**Produces:**

- complete `workflow-state-audit.md` with `STATE-` propositions and findings;
- state/UI cross-reference back to the interaction map.

**Done means:**

- every material `SURF/ACT/FLOW` condition is explained by one canonical state predicate/transition or recorded as an explicit finding;
- every negative combination relevant to productive behavior is classified;
- no Phase 2 state decision depends on rediscovering current state ownership.

---

### P1-T07 — derive and audit OpenCode execution, interaction and transparency facts

**Depends on:** P1-T05.

**Inputs:**

- interaction map;
- pinned OpenCode integration authority/facts;
- shell/daemon provider code;
- runtime diagnostics/logs where required;
- current OpenCode tests.

**Work:**

1. trace STAGE, BUILDER, REVIEWER and REMEDIATOR context/workspace construction;
2. trace authority/instruction projection;
3. trace account/model/session creation, continuation and loss;
4. trace prompt/output contracts, tools/permissions and trusted integrations;
5. trace provider response extraction/repair/admission and downstream batch validation/reaction;
6. enumerate provider/session failure classes and current recovery behavior;
7. enumerate every potentially operator-relevant provider/agent fact;
8. prove whether each fact is available, unavailable or unreliable under the pinned integration;
9. classify persistence/transience and safety/sensitivity;
10. link each fact to the `SURF/INFO/ACT/FLOW` decisions that need it;
11. identify what current UI exposes and what it leaves opaque;
12. distinguish factual capability from the later Phase 2 product decision about whether the fact should be product-visible, technical/on-demand or closed.

**Produces:**

- complete `opencode-interaction-audit.md` with `OC-` propositions;
- provider/session error taxonomy;
- current observability/capability matrix;
- exact factual inputs needed for Phase 2A transparency/conversation decisions.

**Done means:**

- every OpenCode fact needed by a mapped interaction is proven available/unavailable/unreliable;
- every observed provider/session failure path has an upstream classification or is an explicit unresolved blocker;
- Phase 2 does not need to re-investigate the pinned integration to decide product transparency.

---

### P1-T08 — derive and audit document/material maturity facts

**Depends on:** P1-T05 and consumes relevant completed P1-T06 findings.

**Inputs:**

- interaction map;
- WorkItem document system;
- lifecycle/context authority;
- ArtifactRef/Run/RunEvent/Approval/execution facts;
- persistence/currentness implementation.

**Work:**

For Work request, Research, Requirements, Solution design, Implementation plan, Readiness material, Approval package and signed execution material:

1. identify creation/existence facts;
2. identify editability/direct-save rules;
3. identify proposal/adoption ownership;
4. identify conformance/currentness facts;
5. identify stale/historical causes;
6. identify locking/sign-off conditions;
7. identify consuming lifecycle stages;
8. identify UI representation/actions for every material condition;
9. determine which conditions are derivable from existing canonical facts;
10. identify ambiguous/missing maturity distinctions without inventing a replacement state model.

**Produces:**

- complete `document-material-maturity-audit.md` with `MAT-` propositions;
- material→UI→action cross-reference;
- factual distinction between lifecycle position and material maturity/currentness.

**Done means:**

- every governed material has a complete current-state fact matrix or explicit missing-semantics finding;
- Phase 2 can decide the future maturity model without first reconstructing current document behavior.

---

### P1-T09 — close evidence, certification and cross-artifact coverage

**Depends on:** P1-T03 through P1-T08.

**Inputs:**

- all `SURF/INFO/ACT/FLOW/STATE/OC/MAT` propositions;
- permanent tests and sensors;
- rendered/runtime evidence;
- current runtime diagnostics.

**Work:**

1. assign `CERT-` rows to every material invariant/proposition;
2. record current proof owner/layer;
3. record positive, negative and contradictory-path coverage;
4. record producer and consumer coverage separately;
5. record browser-visible integrated coverage;
6. record runtime evidence coverage;
7. classify proof as proven, partial, absent or misleading;
8. finish the `application-interaction-map.md` cross-artifact closure ledger;
9. verify that every productive `SURF-` resolves to its required `INFO/ACT/FLOW/STATE/OC/MAT/CERT` coverage or a justified not-applicable entry;
10. identify all remaining factual unknowns.

**Produces:**

- completed `certification-evidence-map.md`;
- completed cross-artifact closure ledger in `application-interaction-map.md`;
- explicit unresolved-fact list.

**Done means:**

- every material proposition has known proof status;
- there are no silently uncovered productive surfaces or interactions;
- any remaining unknown is explicit and can be judged against the Phase 1 gate.

---

### P1-T10 — synthesize the canonical R1 result and Phase 2 prerequisite package

**Depends on:** P1-T09 and all preceding tasks.

**Inputs:**

- completed Phase 1 supporting artifacts;
- Phase 1 gate criteria in §10.

**Work:**

1. synthesize the audit under the canonical `audit-r1-v1` headings in `research.md`;
2. consolidate repeated symptoms into upstream/root-cause `F-` findings;
3. classify each finding by severity, affected surfaces/flows/states/roles, authority layer and Phase 2 ownership;
4. decide whether every Phase 1 → Phase 2 gate is satisfied;
5. if not satisfied, return the unresolved factual gap to the exact owning Phase 1 task rather than weakening the gate;
6. if satisfied, produce the final **Phase 2 prerequisite package** inside `research.md`.

The Phase 2 prerequisite package must contain exactly these registers:

**A. Current-product fact register**

- complete surface/overlay topology reference;
- complete information/data-lineage reference;
- complete interaction/business-rule/flow reference;
- current state-model findings;
- current OpenCode capability/failure/transparency facts;
- current document/material maturity facts;
- current certification/proof status.

**B. Functional-decision register for Phase 2A**

For every unresolved product question, record:

- decision id;
- affected `SURF/INFO/ACT/FLOW/F-` ids;
- closed Phase 1 facts constraining the decision;
- governing current authority and whether it is correct/incomplete/contradictory/absent;
- the exact functional decision Phase 2A must make;
- acceptance questions Phase 2A must close;
- no proposed solution.

**C. Technical-decision register for Phase 2B**

For every technical question that remains after the functional behavior is chosen, record:

- decision id;
- affected `STATE/OC/MAT/CERT/F-` ids;
- current owner/path;
- proven technical constraints;
- authority layer requiring amendment, if any;
- the exact technical decision Phase 2B must make after consuming the accepted Phase 2A decision;
- no implementation task.

**D. Authority-amendment register**

- exact P3/P4/P5/P6 concern owner;
- Phase 1 finding proving amendment is required;
- whether the problem is missing, contradictory or obsolete authority;
- which Phase 2A/2B decision must resolve it.

**E. Phase 2 WorkItem boundary**

- recommended linked `CHANGE`/`DEFECT` WorkItem or WorkItems;
- exact `derivedFromWorkItemId`;
- scope assigned to each;
- reason the boundary preserves one coherent delivery authority;
- explicit statement that the completed AUDIT remains immutable provenance.

**F. Gate verdict**

- each §10 gate marked PASS/FAIL;
- zero material unresolved factual questions when PASS;
- canonical R1 verdict, including whether `AUDIT_COMPLETE` is justified.

**Produces:**

- completed canonical `research.md`;
- the exact Phase 2 prerequisite package that downstream R2/DESIGN work consumes.

**Done means:**

- Phase 2 can begin without reopening 0.4.0 implementation merely to understand current behavior;
- every remaining question is explicitly a product decision or technical decision, not a missing fact;
- every Phase 2 decision traces back to Phase 1 evidence and affected user interactions;
- no functional or technical solution has been prematurely selected in Phase 1.

## 6.1 Task dependency graph

~~~text
P1-T01  authority/code/evidence baseline
   |
   v
P1-T02  surface + scenario census
   |
   v
P1-T03  rendered/runtime evidence
   |
   v
P1-T04  information + typed data lineage
   |
   v
P1-T05  interactions + business rules + flows
   |
   +--------------------+
   |                    |
   v                    v
P1-T06 state audit   P1-T07 OpenCode audit
   |                    |
   +---------+----------+
             |
             v
P1-T08 material maturity audit
             |
             v
P1-T09 certification + closure
             |
             v
P1-T10 research.md + Phase 2 prerequisite package
~~~

P1-T06 and P1-T07 may execute in parallel after P1-T05. P1-T08 may begin early for obvious document facts but cannot close until the relevant state derivations from P1-T06 are available. P1-T09 is the only task allowed to declare cross-artifact evidence closure. P1-T10 is the only task allowed to declare the Phase 1 → Phase 2 gate satisfied.

## 7. Artifact content contracts

### 7.1 `application-interaction-map.md`

Required sections:

1. evidence/source registry, separating source/contract evidence from rendered/runtime evidence;
2. application/navigation topology;
3. surface registry, including parent/child and originating-surface/overlay relationships;
4. per-surface typed data/model/schema input map;
5. per-surface conditional-render/state-scenario matrix;
6. per-surface rendered evidence manifest (commit/run/fixture/viewport/theme/`SURF-`/evidence file);
7. per-surface information inventory with `INFO-` → typed field → source owner → predicate → rendered-evidence trace;
8. per-surface interaction inventory with `ACT-` → required information → predicate → handler → downstream owner → destination/overlay trace;
9. global/business-rule interaction matrix;
10. cross-surface normal flows;
11. cross-surface exceptional/recovery flows;
12. overlay/modal/drawer/popover/confirmation interaction graph;
13. duplication/leakage inventory;
14. cross-artifact closure ledger;
15. current-state gaps requiring derived audit.

The cross-artifact closure ledger must have one row per `SURF-` and prove that every materially distinct surface/condition has:

- source renderer evidence;
- typed data/schema evidence;
- conditional-render evidence;
- rendered evidence;
- all `INFO-` rows;
- all `ACT-` rows;
- relevant `FLOW-` rows;
- required `STATE-`, `OC-`, `MAT-` and `CERT-` derivations or an explicit not-applicable reason;
- closure status.

A surface cannot be marked closed merely because its React component has been read.

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

- every productive UI surface, including every materially distinct modal/drawer/popover/confirmation/task-panel/inspector state, is inventoried;
- every surface has both source/contract evidence and rendered/runtime evidence;
- every persistent visible information item is mapped to the exact typed model/schema/contract fields that supply it, its source/derivation owner, presentation role and render predicate;
- every material absence/conditional presentation is explained by the exact state/data predicate that suppresses it;
- every operator interaction has visibility and enablement conditions backed by exact typed source facts;
- every interaction identifies the information the operator needs to make that decision;
- every interaction has a traced handler, command/read/provider path, commit-time recheck, canonical effect and destination/overlay/return path;
- every ordinary and material exceptional flow is mapped;
- representative state/data-density scenarios have rendered evidence at the viewport/theme combinations that materially alter composition;
- the cross-artifact closure ledger has no open productive `SURF-` rows;
- no known productive surface, information item or interaction remains unclassified.

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

- complete current application surface topology, including nested and overlapping UI;
- rendered evidence for every materially distinct screen/overlay condition needed to judge actual hierarchy, density and composition;
- complete information inventory with exact typed model/schema fields, source/derivation owners, render predicates and current hierarchy problems;
- complete interaction inventory with exact typed predicate facts, information prerequisites and current visibility/enabled business rules;
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
