<!-- Order template: delivery-r2-v1; authority: GW-DOC-WORK-LIFECYCLE-V1, GW-DOC-SPECIFICATION-STANDARD-V1 -->

# 0.5.0 integrated workflow task experience — functional requirements

**Status:** Functional design complete draft — pending review/acceptance  
**WorkItem:** `work_2778105b-d919-4fcd-91e7-dd9b23812aac`  
**Derived factual authority:** parent Audit `work_9d07ce7e-83e4-4f8c-bc77-1c31c20198d2`  
**Functional design model:** workflow step → primary task → subtasks → information/input/interaction requirements → observable outcome

## Required observable outcome

### 1. Purpose and governing product model

Order 0.5.0 must present the lifecycle as a sequence of **operator tasks**, not as a browser over the domain objects and implementation state that happen to exist at each stage.

For every current WorkItem condition, the Workbench must make three facts immediately intelligible:

1. **Where is this work now?**
2. **What task or subtask requires attention now?**
3. **What can the operator validly do next?**

Every lifecycle step therefore owns:

- one primary task;
- an explicit completion outcome;
- the material subtasks required to complete that task;
- the information needed for each subtask;
- the human input or decision accepted by each subtask;
- the interaction available in each canonical condition;
- a current-attention rule that determines which subtask owns the primary action;
- a post-action orientation rule;
- supporting context/history/evidence that remains inspectable without becoming workflow authority.

The browser remains a client of canonical Order state. It does not infer eligibility, lifecycle ownership or material authority merely from what is selected or visible.

Phase 1 established that the existing separation between WorkItem lifecycle, Run interaction state, proposal state, material currentness, recovery ownership, execution ownership, validation boundary, observation coherence and current attention is materially sound. This functional design preserves that separation and does not introduce another workflow or document-status state model.

### 2. Cross-workflow task sequence

The ordinary lifecycle is experienced as:

~~~text
Work request
  define and validate originating intent
        |
        v
Research
  establish what is true and why
        |
        v
Requirements
  define the observable outcome and behavioral contract
        |
        v
Solution design
  define the technical solution that satisfies the requirements
        |
        v
Implementation plan
  define the exact executable repository transition
        |
        v
Readiness review
  adversarially determine whether the package is executable without material inference
        |
        v
Approval
  understand and explicitly authorize the exact package
        |
        v
Implementation
  execute, review, remediate and validate the approved tasks
        |
        v
Complete
  understand the governed final result and any permitted follow-up
~~~

A return upstream changes the **current task owner**. It does not erase reached/historical work. Historical material remains inspectable but never becomes current mutation authority merely because the operator selects it.

#### 2.1 The workflow has two information dimensions

The Workbench must resolve both of these before deciding what the operator sees:

1. **Work type** — Change, Defect, Investigation or Audit.
2. **Workflow step** — Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation or Complete.

The current interaction condition — processing, required input, proposal review, document editing, blocker, recovery, history inspection and so on — then determines which subtask owns attention inside that work-type/workflow-step combination.

The product model is therefore:

~~~text
work type
   ×
workflow step
   ×
current interaction
   =
task purpose + available information + expected output + valid actions
~~~

The product must not render a generic Research or Requirements experience without also respecting the selected WorkItem kind and the kind-specific information that must remain relevant downstream.

#### 2.2 Existing governed WorkItem kinds and progressive source documents

The existing governed authoring catalog already defines four user-facing work types with different starting documents.

| Work type | Initial operator intent | Work request starts with | What Research must establish | Delivery consequence |
|---|---|---|---|---|
| **Change** | introduce or change behavior/capability | requested outcome; current context; known constraints/non-goals; references/evidence | current state/absence; evidence; governing authority; affected path; downstream invariants; unresolved facts; factual verdict | confirmed work continues through Requirements, Solution design, Implementation plan, Readiness review, Approval and Implementation |
| **Defect** | correct behavior that appears wrong | observed behavior; expected behavior; reproduction/evidence if known; behavior that must remain unchanged; impact/context | symptom/reproduction; proven root cause; producer→carrier→consumer path; downstream effects/invariants; governing authority; unresolved facts; factual verdict | confirmed work continues through Requirements, Solution design, Implementation plan, Readiness review, Approval and Implementation |
| **Investigation** | establish a technical fact or answer a software-engineering question | question; why it matters; known evidence/context; investigation boundary | evidence for/against; findings; unresolved questions; conclusion | successful investigation can complete directly; delivery work becomes a separate linked Change or Defect |
| **Audit** | evaluate an artifact, implementation or change against explicit criteria | target under audit; governing authority/criteria; scope/exclusions; requested evidence/verdict | evidence by criterion; findings; verdict | successful audit can complete directly; remediation becomes a separate linked Change or Defect |

These are progressive authoring templates, not intake completeness gates. A new WorkItem may begin with partial information. Empty or incomplete intake sections are valid when the operator does not yet know the answer. The owning workflow step resolves missing facts or decisions; the product must not force the operator to pretend the work is more mature than it is.

The initial Work request remains the canonical originating narrative for the selected work type. Later documents add authority; they do not rewrite the original request into a generic form.

#### 2.3 Work-type progression through the workflow

~~~text
CHANGE
Change request
  -> Research: prove current state/absence and constraints
  -> Requirements: define required changed behavior
  -> Solution design: define the technical solution
  -> Implementation plan: define exact delivery work
  -> Readiness review
  -> Approval
  -> Implementation
  -> Complete

DEFECT
Bug/defect report
  -> Research: reproduce and prove root cause + preserved invariants
  -> Requirements: define corrected behavior + behavior that must remain unchanged
  -> Solution design: define root-cause-correct remediation
  -> Implementation plan: define exact remediation + regression verification
  -> Readiness review
  -> Approval
  -> Implementation
  -> Complete

INVESTIGATION
Question / investigation brief
  -> Research: evidence-backed answer
  -> Complete
  -> optional separate linked Change/Defect for delivery

AUDIT
Audit brief / target / criteria
  -> Research: evidence by criterion + findings/verdict
  -> Complete
  -> optional separate linked Change/Defect for remediation
~~~

Change and Defect deliberately converge onto the same later workflow steps, but they do not lose their kind-specific semantics.

A Defect Requirements task must continue to carry the proven defect, expected corrected behavior and preserved-behavior invariants. A Change Requirements task must continue to carry the requested outcome, proven current state/absence and relevant constraints. The shared document shape does not make those two contexts interchangeable.

#### 2.4 Information maturity by workflow step

| Workflow step | Information normally available on entry | Information created/closed here | Primary task-area information | Supporting information |
|---|---|---|---|---|
| **Work request** | originating request/observation/question/audit brief; project/work type/concerns; references already known | durable originating intent in the work-type-specific source document | source narrative and immediate validity/conflict state | project/work-type metadata, supplied references, source/Git status; technical identity on demand |
| **Research** | Work request; applicable governing principles/authority; repository/runtime evidence; known product intent | validated facts/evidence; root cause or current-state absence; affected path; governing authority; unresolved factual questions; verdict/conclusion | current investigation, required evidence/input and emerging Research result | Work request, repository/runtime evidence, authority, previous attempts |
| **Requirements** | confirmed Change/Defect Research; originating intent; existing product/domain authority; binding constraints | required observable behavior, acceptance, scope/exclusions, failure behavior, compatibility/security/performance constraints | Requirements contract for the selected work type | Research facts/evidence, Work request, binding product/technical constraints |
| **Solution design** | accepted Requirements; Research facts; engineering principles; existing architecture, ADRs, contracts/state owners; relevant repository evidence | technical requirements/architecture, canonical ownership, affected boundaries, data/control flow, necessary contract decisions, alternatives and validation obligations | technical solution and its coverage of accepted Requirements | Requirements first; Research evidence and existing architecture/contracts/ADRs |
| **Implementation plan** | accepted Solution design and Requirements; applicable governing authority; repository structure; verification authority | exact task decomposition, dependencies, change surface, deletions/additions/modifications, validation sequence and executable task definitions | Plan as current delivery authority | Solution design first; Requirements and relevant Research/evidence for traceability |
| **Readiness review** | complete current Work request/Research/Requirements/Solution design/Implementation plan package plus current repository evidence | readiness verdict, adversarial findings, exact defective workflow step when not ready | verdict/findings and package material necessary to judge them | complete package on demand, emphasizing the defective layer rather than all files equally |
| **Approval** | exact current package and signed task definitions | explicit authorization of that frozen package | package currentness, task meaning/scope/gates and sign-off decision | governed documents needed for judgment; hashes/commit/package identity on demand |
| **Implementation** | signed package, exact approved task definitions and current execution state | candidate changes, execution/review/remediation/validation evidence | current approved task, active role, blocker/next action and current validation boundary | signed Plan/Design/Requirements as read-only authority; prior attempts/evidence |
| **Complete** | terminal result/candidate and reached history/evidence | final governed result and any separately governed follow-up | substantive outcome/result | evidence and earlier lifecycle documents as history |

#### 2.5 Kind-specific information obligations in shared delivery steps

Because Change and Defect share the same Requirements, Solution design and Implementation plan workflow steps, the task area must preserve the differences established by their Work request and Research documents.

**Change — Requirements**
- requested outcome;
- proven current state/absence;
- affected behavior/users/system capability;
- required new/changed observable behavior;
- acceptance criteria;
- scope/exclusions;
- relevant compatibility/security/performance constraints.

**Defect — Requirements**
- proven defect and reproduction;
- expected corrected behavior;
- behavior/invariants that must remain unchanged;
- downstream effects that must be restored or preserved;
- acceptance criteria that prove the original defect is corrected;
- regression/preservation expectations;
- scope/exclusions and relevant constraints.

**Change — Solution design**
- requirement-to-solution mapping for the changed/new behavior;
- affected ownership/boundaries;
- technical requirements and architecture;
- necessary contract/state/data-flow changes;
- compatibility and validation obligations.

**Defect — Solution design**
- proven root cause and producing boundary;
- correction mechanism at the correct owner;
- explicit preservation of unaffected behavior/invariants;
- downstream consumers affected by the root cause;
- regression/verification obligations tied to the original reproduction;
- minimum-sufficient remediation rather than symptom patching.

**Change — Implementation plan**
- exact tasks required to realize the accepted change;
- traceability to Requirements and Solution design;
- change surface and verification.

**Defect — Implementation plan**
- exact root-cause remediation tasks;
- required deletion/replacement of incorrect behavior;
- reproduction/regression verification;
- preservation tests for unchanged behavior;
- traceability to the proven defect and accepted remediation design.

The Workbench must expose this kind-specific context in the task area and supporting material rather than forcing the operator to reconstruct it mentally from the original Work request.

#### 2.6 Functional requirements versus technical solution

The **Requirements** workflow step answers **what must be true observably**. It owns functional requirements and records applicable binding constraints such as compatibility, security and performance.

It does not choose architecture, canonical ownership, data/control flow, API/schema shape or implementation mechanism merely to make the document appear technically complete.

The **Solution design** workflow step answers **how the accepted functional contract is correctly realized technically**. It combines the accepted functional requirements, proven Research facts, existing engineering/architecture constraints and relevant repository boundaries into the technical requirements, architecture, ownership, contracts and validation obligations required by the solution.

~~~text
Research facts + originating intent
              |
              v
Requirements
observable behavior + acceptance + binding constraints
              |
              v
Solution design
technical requirements + architecture + contracts
              |
              v
Implementation plan
exact executable tasks + verification
~~~

This prevents Requirements from prematurely inventing a solution and prevents Solution design from inventing missing product behavior.

#### 2.7 Workflow-screen information rules

- **Work request:** use the correct kind-specific intake structure. A Change request must not look like a bug report; a Defect must foreground observed/expected/preserved behavior; an Investigation its question/boundary; an Audit its target/criteria/scope.
- **Research:** use the kind-specific Research purpose and expected result. Defect Research is diagnosis/root-cause work; Change Research proves current state/absence; Investigation answers its question; Audit evaluates against criteria.
- **Requirements:** only Change and Defect reach this step. Foreground the kind-specific Requirements contract. Research and Work request are supporting authority.
- **Solution design:** foreground the technical solution and requirement coverage; for Defects, keep root cause and preservation/regression obligations directly available.
- **Implementation plan:** foreground the exact Plan and traceability to accepted Solution design/Requirements; Defect plans make remediation and regression proof explicit.
- **Readiness review:** foreground verdict/findings and exact defective workflow step; use the accumulated package as evidence, not as a flat file browser.
- **Approval:** foreground package currentness, signed-task meaning and authorization; inspect prior documents only as required for the decision.
- **Implementation:** foreground the current approved task and validation; upstream documents are read-only governing authority.
- **Complete:** foreground the result. For Investigation/Audit, linked remediation is separate work rather than continuation of the completed item.

Unreached downstream documents are absent as productive authority. The interface must not present empty Requirements/Solution design/Implementation plan placeholders merely because deterministic filenames exist.

#### 2.8 User-facing terminology

Product-facing functional documentation and Workbench copy use these workflow names:

- Work request
- Research
- Requirements
- Solution design
- Implementation plan
- Readiness review
- Approval
- Implementation
- Complete

Internal lifecycle codes may appear only where needed for implementation traceability, schema/template identifiers, contracts or diagnostics. They must not be the primary language used to explain the workflow to operators, define task purpose, label screens/actions, or describe expected outputs.

Work-type language is likewise user-facing: **Change**, **Defect**, **Investigation**, and **Audit**.

### 3. Stable Workbench composition

The ordinary selected-WorkItem experience uses one stable product topology:

~~~text
application toolbar
work-item identity
workflow rail
current-attention / current-action region
primary task surface
[explicit secondary Context when opened]
~~~

The application toolbar contains application-level utilities. The identity region contains WorkItem identity and WorkItem-level utilities. The workflow rail is the single persistent lifecycle navigation control.

The current-attention region explains the highest-priority current condition and owns the current action when one exists. It must not be displaced by historical selection or supporting material.

The primary task surface is selected from the existing closed interaction classes:

- Operational scan;
- Form/configuration;
- Document;
- Dialogue;
- Review;
- Operational master/detail;
- Evidence;
- Terminal result.

Auxiliary classes remain:

- Compact context;
- Task panel;
- Safety/exception.

No workflow step creates another persistent navigation axis, card/dashboard grammar or feature-local interaction language merely because it has unique content.

### 4. Shared subtask contract

Every material subtask must satisfy the following functional contract:

| Element | Required meaning |
|---|---|
| Trigger/current condition | canonical condition that makes the subtask relevant or current |
| Operator goal | what the operator is trying to achieve |
| Required information | information necessary to understand and perform the task |
| Human input/decision | what the operator may supply or decide |
| Interaction | the valid operator interaction |
| Canonical effect | mutation or explicit non-mutating result |
| Post-action orientation | what becomes primary/current after the interaction |
| Supporting material | context/history/evidence available without displacing current work |
| Technical detail | exact identity/diagnostics available on demand when not task-essential |

A control is not considered functionally valid merely because a backend endpoint exists. Its visible meaning, eligibility, command scope and resulting effect must refer to the same semantic operation.

### 5. Current-attention precedence

For a coherent canonical observation, current attention is resolved in this order:

1. mutation conflict that prevents safe continuation;
2. exact required human input;
3. pending proposal decision;
4. proposal adoption/reconciliation already in progress;
5. canonical blocker;
6. stale authority/material currentness requiring explicit recovery;
7. retry/resume recovery owner;
8. active processing;
9. current startable/continuable/sign-off/execution action;
10. ordinary current task material;
11. historical inspection.

Only the highest-precedence mutation action is presented as the current workflow action.

Historical selection may remain visible, but levels 1–9 remain directly visible and reachable. Historical selection cannot suppress, replace or retarget current mutation authority.

While the browser is still converging after an asynchronous canonical transition, mutation controls are suppressed and the Workbench presents neutral updating/processing continuity. The browser does not locally invent the missing result.

### 6. Information hierarchy

Every visible datum belongs to one functional information class:

1. **Primary work** — information/material necessary to perform the current task.
2. **Current attention/action** — the condition that currently requires action or explains why progress cannot continue.
3. **Supporting context** — upstream/context material useful to the task but not itself current work.
4. **Agent activity/conversation** — human-facing agent interaction and accepted bounded operational activity.
5. **History/evidence** — prior attempts, evidence and exact material explicitly selected for inspection.
6. **Technical/debug** — raw paths, hashes, ids, commit identity, provider/session identity, raw event data and diagnostic detail.

Technical/debug information is on demand unless that exact identity is necessary to perform the current task. The existence of a canonical field does not justify persistent presentation.

Information required for a decision must be available with that decision. The operator must not be required to open Context merely to discover the current blocker, required input, proposal decision or primary action.

### 7. Operator-facing material maturity

Lifecycle stage and material maturity are separate.

The following user-facing material vocabulary is required:

| User-facing state | Functional meaning | Ordinary behavior |
|---|---|---|
| **Draft** | material exists but has not yet become current conformed authority for its owning stage | inspect/edit when stage rules permit; cannot imply stage completion |
| **Updated — validation required** | current material bytes were saved/adopted and downstream conformance/currentness must be re-established | material is current editable work; progression is not available until required validation/conformance completes |
| **Current** | material is the current conformed authority for its owning stage | ordinary downstream consumption is allowed subject to lifecycle rules |
| **Stale** | material was valid/current but upstream authority changed and it cannot authorize downstream progress | inspectable; not signable/promotable; exact owning recovery/return is shown |
| **Historical** | prior reached/superseded material retained for inspection | read-only inspection; never current mutation authority |
| **Signed & locked** | material is part of the exact signed execution package | read-only; mutation invalidates/returns through governed authority rather than editing the signed package in place |

Two transient change states are presented separately from material maturity:

- **Proposed change** — a pending change intent requiring explicit Adopt/Reject;
- **Applying change** — proposal adoption/reconciliation is in progress and competing mutation actions are unavailable.

A proposal does not itself make the target document current authority. Git recording is also not a maturity state and must remain orthogonal to conformance/readiness.

A terminal result is presented as the result of the WorkItem, not as another editable material maturity state.

### 8. Agent operational activity and conversation

#### 8.1 Functional objective

When an Order agent is performing productive work, the operator must be able to tell:

- that work is active;
- what **kind of operational activity** is occurring;
- which safe resource or task area is being acted on when material to understanding progress;
- whether the agent is retrying/recovering;
- when the turn has completed, failed, blocked or requires input.

This requirement exists to remove black-box execution without exposing hidden reasoning or provider internals.

#### 8.2 Product-visible activity vocabulary

While a provider turn is active, the Workbench may present bounded operational activity using ordinary-language categories such as:

- Preparing context;
- Reading/inspecting;
- Searching;
- Editing/preparing a proposed change;
- Running checks;
- Reviewing results;
- Retrying/recovering;
- Waiting on an external/provider operation.

Where safe and useful, an activity entry may include a bounded resource summary such as a repository-relative file/resource name or a named test/check. It must not expose raw unbounded tool input/output.

The activity experience shows:

- the current activity;
- a bounded recent sequence sufficient to establish useful progress;
- elapsed/turn timing where useful;
- a user-facing completion/failure result.

The operator does not need raw OpenCode event names, protocol identifiers, provider session ids or tool JSON to understand ordinary progress.

#### 8.3 Live and post-turn behavior

Operational activity is required **live while processing** when the reliable integration surface can provide it under the accepted technical design.

After the turn completes, a bounded activity summary remains inspectable with that Run when it materially helps explain the work performed or a failure. The functional design does not require every transient progress pulse to become durable workflow authority.

Canonical Order messages, required questions, proposals, blockers, completions and validation outcomes remain the authoritative workflow-semantic history.

#### 8.4 Conversation admission

While a provider turn is actively processing:

- the operator may inspect activity/context/history;
- the operator may cancel when cancellation is canonically allowed;
- the free-form composer does **not** queue a concurrent message into the active turn.

When the Run is OPEN and no higher-priority proposal/input/blocker owns attention, the operator may continue free-form collaboration.

When exact required input owns attention, the composer is bound to that question and submits only the response to that request.

When a proposal decision owns attention, the free-form composer is unavailable until the proposal is dispositioned.

#### 8.5 Failure

A provider/agent failure must present:

1. the human-facing stage/task that failed;
2. a concise product-facing failure summary;
3. the last useful bounded operational context when available;
4. the valid next action: Retry, Resume, Reconcile/Return, or no action where the failure is terminal;
5. technical diagnostic detail on demand.

The product must distinguish provider execution failure from a later Order contract/admission failure even if both occur after the same visible agent turn. Exact diagnostic transport is a Solution design decision.

Hidden chain-of-thought/reasoning, credentials, secrets, raw unbounded tool output and raw provider-native metadata remain closed.

### 9. Shared pre-signoff task grammar

Research, Requirements, Solution design and Implementation plan use one recognizable interaction grammar while retaining different task purposes.

The ordinary loop is:

~~~text
current governed material + supporting context
        |
        v
start / continue agent work
        |
        v
processing + bounded operational activity
        |
        +--> required question
        |       -> human answer
        |       -> continue agent work
        |
        +--> proposed change
        |       -> Review
        |       -> Adopt or Reject
        |
        +--> failure/blocker
        |       -> owning recovery action
        |
        v
current governed document
        |
        +--> direct human edit/save where permitted
        |
        v
material becomes Updated — validation required
        |
        v
conformance/currentness is re-established
        |
        v
continue / promote / return / block
~~~

Attempt, current document, supporting document, proposal, evidence and historical material selection use one compact material-selection treatment. Adding more attempts/documents does not create a new persistent rail or change the primary canvas geometry.

#### 9.1 Proposal ownership and cancellation

A pending proposal is an explicit review subtask and owns current attention.

While a proposal is pending:

- Adopt and Reject are the only proposal mutation decisions;
- free-form continuation is unavailable;
- Run Cancel is unavailable;
- unrelated current-stage mutations that would orphan the proposal are unavailable.

To abandon the proposed change and then abandon the Run, the operator first Rejects the proposal; once the Run is again in an ordinary cancellable interaction state, Cancel may be used.

Once adoption has begun:

- the state is **Applying change**;
- Reject, Cancel and competing edits are unavailable;
- the system must either finish adoption/reconciliation or expose the exact recovery owner.

Successful adoption:

- dispositions the proposal;
- updates the target canonical material;
- keeps the WorkItem at the same owning lifecycle stage;
- makes the affected material **Updated — validation required** until currentness/conformance is re-established;
- requires context re-resolution before another productive agent turn;
- never promotes the lifecycle by itself.

This closes the Phase 1 dead state in which a Run could terminalize while leaving an unresolved proposal without a valid disposition owner.

#### 9.2 Direct human authoring

Direct Save of an authorized Work request, Research, Requirements, Solution design or Implementation plan Markdown document is an explicit canonical human mutation.

It is not converted into a synthetic proposal.

Save:

- uses conflict-safe current expected content;
- returns/reorients to the appropriate owning stage according to existing lifecycle rules;
- makes affected material Updated — validation required;
- invalidates affected downstream conformance/readiness;
- never implies that validation/conformance has already passed.

### 10. Work request — define and validate originating intent

**Primary task:** establish the durable originating request sufficiently clearly and validly to begin governed Research.

**Completion outcome:** valid current Work request plus explicit Start Research.

**Primary interaction class:** Document.

| Subtask | Trigger/current condition | Operator goal | Required information | Human input/decision | Interaction/result | Post-action orientation |
|---|---|---|---|---|---|---|
| Author/refine request | editable current source, no higher-priority conflict | express originating intent accurately | current Markdown; work kind/project/concerns as supporting identity | Markdown edits | Save current source or Cancel edits | remain on Work request; saved source status visible |
| Resolve invalid source/conflict | source diagnostic or expected-content conflict owns attention | restore valid current source | concise cause, affected source, safe recovery | reload/edit/reconcile where permitted | conflict is resolved or remains explicitly blocked | Work request remains owning task |
| Inspect source/Git state | operator requests supporting detail | understand repository recording/currentness | concise save/Git state; exact path/hash/branch/HEAD on demand | none | non-mutating inspection | return to same document |
| Start Research | source valid/current and lifecycle allows Start | hand durable intent to Research | clear ready-to-start state and no unresolved blocker | explicit Start Research | Research becomes current and the first Research activity begins | Research current-attention surface |

Default information hierarchy:

1. Work request Markdown;
2. current source conflict/diagnostic if present;
3. Save/Cancel while editing or Start Research when eligible;
4. concise source/Git state;
5. technical path/hash/schema/Git identity on demand.

There is no Run-history rail on Work request.

### 11. Research — establish what is true

**Primary task:** establish evidence-backed facts, root cause/producing boundary, affected path and governing authority sufficient to decide what downstream behavior is required.

**Completion outcome:** validated Research factual closure, or a governed non-delivery terminal Research outcome where the selected work type permits it.

**Primary interaction classes:** Dialogue, Review, Document and Evidence according to current attention.

| Subtask | Trigger/current condition | Operator goal | Required information | Human input/decision | Interaction/result | Post-action orientation |
|---|---|---|---|---|---|---|
| Start/retry Research | Research is current and start/retry owns attention | begin/restart investigation | originating request, Research purpose, blocker/retry reason where applicable | Start/Retry | new/current Research Run begins | Dialogue/activity |
| Observe investigation | provider turn processing | understand useful progress and detect stuck/failure conditions | Processing + bounded operational activity | none | live progress | remain Dialogue/activity |
| Answer required question | exact required input owns attention | provide missing fact/decision | exact question plus relevant current context | answer | accepted input starts next turn | processing/activity |
| Continue collaboration | Run OPEN and no proposal/input/blocker | refine investigation inside authorized intent | current dialogue, current Research material/context | free-form continuation | next provider turn | processing/activity |
| Review proposed Research change | proposal owns attention | decide whether proposed canonical Research change is acceptable | rationale, substantive diff, target/current material state | Adopt/Reject | proposal disposition | adopted material or open dialogue |
| Inspect/edit Research | no higher-priority interaction and current document selected | understand/refine governed Research | Research Markdown + maturity state | direct edit where allowed | Save updates canonical material | document with Updated — validation required |
| Inspect evidence | explicit evidence selection | verify basis for a fact/finding | evidence identity and exact content | none | read-only evidence | return to originating Research material |
| Inspect history | historical attempt/material selected | understand prior work without changing authority | attempt status, messages/activity, historical material | none | non-mutating | current attention remains reachable |

Research must not present raw repository paths, hashes or provider session identity as primary work. Evidence resource identity may be shown where necessary to identify the evidence being inspected.

### 12. Requirements — define the observable behavioral contract

**Primary task:** convert validated facts and supplied product intent into complete observable behavior that Solution design can implement without inventing product decisions.

**Completion outcome:** accepted, current/conformed Requirements that close observable outcome, scope, exclusions, acceptance, failure behavior and material product constraints.

**Primary interaction classes:** same pre-signoff Dialogue/Review/Document/Evidence grammar.

| Subtask | Trigger/current condition | Operator goal | Required information | Human input/decision | Interaction/result |
|---|---|---|---|---|---|
| Start/retry Requirements work | Requirements is current and action owner | begin/continue functional definition | accepted Research facts, supplied product intent, current Requirements | Start/Retry | active Requirements dialogue |
| Observe agent work | processing | understand functional-analysis progress | bounded operational activity | none | live progress |
| Answer product question | required input | close a missing product decision that Requirements is allowed to decide/clarify | exact question, affected requirement/context | answer | next provider turn |
| Continue functional collaboration | OPEN | refine observable behavior | current Requirements/dialogue and supporting Research | free-form continuation | next provider turn |
| Review proposed Requirements change | proposal pending | accept/reject canonical requirement changes | rationale/diff/affected requirements | Adopt/Reject | canonical material update or continued dialogue |
| Directly edit Requirements | document owns ordinary attention | refine exact functional authority | current Requirements + maturity | edit/save | Updated — validation required |
| Inspect Research/source/evidence | explicit supporting selection | verify basis without displacing Requirements | selected supporting material | none | read-only inspection |
| Determine readiness for Solution design | current Requirements validated/conformed | ensure no material product decision remains delegated downstream | completeness of outcome/scope/acceptance/failure semantics | continue work or accept progression | Solution design becomes eligible only when Requirements is complete |

Default hierarchy: current question/proposal/blocker first when present; otherwise Requirements document; Research/source/evidence supporting; technical identities on demand.

### 13. Solution design — define the technical solution

**Primary task:** define a technically coherent solution that satisfies the accepted Requirements and governing engineering authority without changing product intent.

**Completion outcome:** current/conformed Solution design containing the necessary P4/P5/P6 decisions and downstream validation obligations.

**Primary interaction classes:** Dialogue/Review/Document/Evidence using the shared pre-signoff grammar.

| Subtask | Operator goal | Required information | Input/decision | Result |
|---|---|---|---|---|
| Start/retry design | begin or recover technical design | accepted Requirements, applicable architecture/contracts, current repository evidence | Start/Retry | design Run |
| Observe agent work | understand useful design activity | bounded reading/search/check activity | none | live activity |
| Answer required clarification | close exact technical/product clarification within accepted Requirements authority | question plus relevant requirement/authority | answer | next turn |
| Continue design dialogue | refine design within constraints | current design/dialogue | continuation | next turn |
| Review proposed design change | accept/reject canonical design change | rationale/diff/authority implications | Adopt/Reject | updated design or continued dialogue |
| Inspect/edit Solution design | work directly on canonical technical design | design document + maturity | edit/save | Updated — validation required |
| Inspect authority/evidence | verify constraints/facts | selected authority/evidence | none | non-mutating |
| Determine readiness for Implementation plan | ensure no technical architecture/contract decision is delegated to Implementation plan | complete design/validation obligations | continue or progress | Implementation plan becomes eligible only when Solution design closure is complete |

The Solution design document receives broad primary width suitable for architecture, contracts, diagrams and technical material. Supporting authority is secondary until selected.

### 14. Implementation plan — define exact executable delivery authority

**Primary task:** convert accepted design into the exact minimum repository transition that implementation can execute without material P1–P6 inference.

**Completion outcome:** current/conformed Plan with task units, dependencies, traceability, exact change surface and verification sequence.

**Primary interaction classes:** Dialogue/Review/Document/Evidence using the shared pre-signoff grammar.

| Subtask | Operator goal | Required information | Input/decision | Result |
|---|---|---|---|---|
| Start/retry planning | begin/recover plan authoring | accepted design, repository structure, verification authority | Start/Retry | Plan Run |
| Observe planning work | understand progress | bounded operational activity | none | live progress |
| Answer required planning question | close exact missing decomposition/scope issue | exact question and affected design authority | answer | next turn |
| Continue plan dialogue | refine execution contract | current Plan/dialogue | continuation | next turn |
| Review proposed Plan change | accept/reject canonical Plan change | diff/rationale/task implications | Adopt/Reject | updated Plan or continued dialogue |
| Inspect/edit Plan | directly refine execution authority | Plan + maturity | edit/save | Updated — validation required |
| Inspect Design/Requirements/evidence | verify traceability and feasibility | selected supporting authority/evidence | none | non-mutating |
| Confirm implementation readiness of Plan | ensure tasks/dependencies/change surface/validation are exact | complete Plan | continue or progress | Readiness review becomes eligible only when the Plan is executable without material inference |

Derived task/change-surface summaries may be shown for inspection but never become a second Plan authority.

### 15. Readiness review — adversarially judge the exact package

**Primary task:** determine whether the complete current package can be executed correctly without implementation-time material inference.

**Completion outcome:** READY_FOR_SIGNOFF or an exact classified return to the owning defective stage.

**Primary interaction class:** Review. Required input may temporarily become the current subtask without reclassifying the workspace as general Dialogue.

Primary hierarchy:

1. current readiness/verdict state;
2. findings and exact defective/owning upstream stage;
3. package material required to understand the verdict;
4. evidence;
5. Run/attempt history.

| Subtask | Trigger | Operator goal | Required information | Interaction/result |
|---|---|---|---|---|
| Observe review in progress | Readiness review Run processing | know review is actively progressing | Review in progress + bounded agent activity | inspect; Cancel only if canonically allowed |
| Answer readiness question | exact required input | resolve missing evidence/decision permitted during Readiness review | question + relevant package context | answer; review continues |
| Inspect findings/verdict | review result exists | understand whether/why package is ready | verdict, findings, defective owner, evidence refs | non-mutating Review |
| Inspect package material | selected document/task/evidence | understand finding/verdict | selected governed material | non-mutating |
| Follow return/recovery | not-ready/stale/blocker owns attention | return to exact owning stage or recover | reason + exact destination/owner | explicit return/recovery |
| Inspect completed Readiness review | historical/current readiness result | understand immutable readiness result | Readiness review material | read-only |

Readiness review material is read-only. Attempts/package/evidence use compact subordinate selection. Repository paths/hashes are technical unless needed to identify exact selected evidence.

### 16. Approval — understand and explicitly authorize the exact package

**Primary task:** understand exactly what will be authorized and make one explicit sign-off decision.

**Completion outcome:** explicit sign-off of the exact current package, creating execution authority; or no sign-off when the package is stale/returned/not ready.

**Primary interaction class:** Review.

Primary hierarchy:

1. package currentness/signability;
2. signed task meaning, scope, exclusions, dependencies, gates and acceptance;
3. governed documents needed for judgment;
4. approver identity and **Sign off exact package**;
5. technical package identity on demand.

| Subtask | Operator goal | Required information | Interaction/result |
|---|---|---|---|
| Establish package currentness | know whether sign-off is valid now | Current / Stale / Returned and concise reason | inspect or invoke exact reconciliation/return action |
| Scan signed tasks | understand what implementation is being authorized | task objective/state-independent meaning, scope/exclusions/dependencies/gates/acceptance | table/list selection |
| Inspect task detail | judge one signed task | complete task definition and relevant authority | read-only detail |
| Inspect governed documents | inspect Work request/Research/Requirements/Solution design/Implementation plan/Readiness review material needed for judgment | selected document + maturity/currentness | read-only |
| Sign off | explicitly authorize the exact package | package currentness, task/package meaning, approver identity | Sign off exact package |
| Inspect technical identity | diagnose/verify exact package identity | package hash, source hash, baseline commit, ids | on-demand disclosure/Context |

Large collections remain scan-efficient rows/tables inside the same Review surface. Approval never becomes persistent master/detail merely because it contains many tasks/documents.

Package hash, source SHA, baseline commit and Approval id do not occupy default primary hierarchy.

A stale package remains inspectable but is not signable. A reached-but-unsigned historical Approval view must not be labelled approved.

### 17. Implementation — execute, review, remediate and validate approved tasks

**Primary task:** execute the exact currently authorized implementation task through builder/reviewer/remediation/validation while preserving signed scope and making the real current owner/blocker obvious.

**Completion outcome:** all approved tasks reach successful governed terminal state, or execution blocks/returns upstream according to canonical validation classification.

**Primary interaction class:** Operational master/detail.

The master exists to scan approved tasks and their attempts. The detail owns the selected task material. Current task ownership is derived independently from historical operator selection.

#### 17.1 Manual execution semantics

The manual Implementation action means exactly:

> **Start the canonical current approved task shown as the current execution owner for this WorkItem.**

It does **not** mean “ask the global scheduler to run any eligible work”.

The current action is task-scoped. Its label, displayed owner and actual command semantics must refer to the same WorkItem/task.

If the operator is inspecting a non-current or historical task:

- that task remains read-only inspection;
- the current-attention region continues to identify the actual current task/blocker;
- the product offers a direct orientation action such as **View current task** when useful;
- the operator cannot accidentally start the inspected historical/non-current task.

Automatic/background scheduler behavior may still exist as a separate system mechanism, but it is not represented by the task-local manual command.

#### 17.2 Implementation subtasks

| Subtask | Trigger/current condition | Operator goal | Required information | Interaction/result |
|---|---|---|---|---|
| Scan approved tasks | Implementation workspace | understand task set/state | task objective + state + concise current marker | select task |
| Start current task | canonical current task TODO and startable | explicitly begin that exact approved task | objective/scope/currentness and clear current-owner state | Start current task |
| Observe active role | builder/reviewer/remediator Run processing | understand useful progress | role + bounded operational activity | inspect; Cancel where allowed |
| Inspect blocker/current action | blocker/review/validation condition | know why task cannot continue and what to do | exact classification, owning task/role, next action | Retry/Resume/return as governed |
| Inspect validation boundary | validation active/recorded | understand what has been proved and what is next | current validation boundary + recorded results | inspect |
| Inspect timeline/evidence | explicit selection | understand work/review/failure basis | chronological events + evidence/resources | read-only evidence/history |
| Cancel active attempt | cancellable active Run | stop current attempt | consequence and owning task | Cancel; task/WorkItem follow canonical blocked behavior |
| Resume blocked task | exact blocker resolved | restart same approved task | blocker resolution + fresh approval authority | Resume |
| Inspect historical task/attempt | historical selection | learn from prior work without changing authority | prior role/status/events/evidence | read-only |

Before validation evidence exists, the UI shows a concise state such as **Validation not started** rather than a large empty matrix. Recorded/current validation stages become scan-visible as evidence exists; the complete matrix may remain inspectable on demand.

### 18. Complete — understand the governed terminal result

**Primary task:** understand what the WorkItem finally produced and what follow-up is valid.

**Completion outcome:** clear terminal classification with substantive result/evidence and permitted follow-up.

**Primary interaction class:** Terminal result.

Primary hierarchy:

1. terminal outcome/classification;
2. substantive governed result or verified-candidate result;
3. evidence/resources needed to understand that result;
4. permitted follow-up;
5. prior reached workflow history.

For AUDIT/INVESTIGATION outcomes, linked remediation appears only when canonically allowed and creates a separately governed WorkItem. The completed source WorkItem remains terminal provenance.

Complete must not become a generic artifact index with the result buried underneath.

### 19. Supporting application tasks

#### 19.1 Queue

**Task:** scan and select WorkItems.

The queue uses Operational scan. It presents ordinary WorkItem identity, kind, lifecycle/status and concise attention/readiness information necessary to decide which WorkItem to open. Search/filter/archive controls are secondary scan tools.

The queue does not become lifecycle authority and does not reproduce the selected WorkItem's full technical state.

#### 19.2 Create WorkItem

**Task:** create one valid portable WorkItem.

Create uses one bounded Form/configuration task panel. The operator supplies only human-owned inputs such as project, title, WorkItem kind and concerns, plus linked-remediation parent where canonically applicable.

Derived process identifiers are not free-text fields.

Successful creation orients directly to the created WorkItem/Work request.

#### 19.3 Settings

**Task:** establish and maintain productive installation configuration.

Settings remains one application-level configuration home for repositories, OpenCode accounts, model/runtime and readiness. Configuration tasks use one form/field/error grammar.

A configuration problem that blocks workflow progress may be linked/oriented from the owning workflow blocker, but Settings does not become a workflow stage.

#### 19.4 Context

**Task:** inspect compact secondary metadata/diagnostics.

Context is explicit and closed by default. It contains supporting/technical information such as exact ids, paths, hashes, selected Run identity and diagnostics.

Context never owns the sole current blocker or action.

#### 19.5 Evidence

**Task:** inspect exact evidence/resource content.

Evidence uses the Evidence class, is read-only unless another authority explicitly defines editing, and records/returns to its originating workflow selection. Exact resource identity is visible where needed to know what evidence is being read.

### 20. Post-action orientation

Every consequential interaction must leave the operator oriented to the resulting task.

Required examples:

- **Start Research** → Research Dialogue/activity.
- **Submit required input** → same stage, Processing/activity.
- **Free-form continuation** → same stage, Processing/activity.
- **Reject proposal** → owning Run returns to ordinary OPEN/current dialogue state unless another higher-priority condition exists.
- **Adopt proposal** → owning stage document/current material with Applying change until completion, then Updated — validation required; next productive agent action requires fresh context.
- **Direct Save** → same/returned owning stage document with Updated — validation required and downstream stale/currentness effects visible.
- **Retry** → new/current attempt activity.
- **Resume** → same owning stage/task ACTIVE and current action recalculated.
- **Readiness return** → exact defective owning stage and its current attention.
- **Sign off exact package** → Implementation and canonical current task.
- **Start current task** → selected current task detail and active role/activity.
- **Execution validation return** → exact upstream owning stage and reason.
- **Terminal completion** → Complete result.

No successful mutation may leave the operator on a stale surface that still presents an invalid action.

### 21. Responsive and accessibility continuity

Responsive recomposition may change geometry but not semantics.

Across wide, medium and narrow layouts:

- WorkItem identity remains available;
- workflow rail/current lifecycle orientation remains available;
- current-attention owner remains visible;
- primary action priority is unchanged;
- selected material/task meaning is preserved;
- Context remains secondary;
- Implementation's task master becomes temporary/drawer representation where required without changing task ownership;
- focus is moved/restored predictably after overlays, material selection and completed actions;
- keyboard users can reach every material interaction;
- focus state is distinguishable from selection/current state;
- disabled actions have an available reason where that reason matters;
- processing/status/error changes are announced without duplicate competing live regions;
- color is never the only carrier of workflow meaning.

Long titles, long Markdown, multiple attempts/tasks, dense evidence, diagnostics and long agent activity must not create a different semantic hierarchy.

### 22. Functional decision closure

The six Phase 1 functional decisions are closed as follows:

| Decision | R2 resolution |
|---|---|
| FD-01 — per-screen information/action hierarchy | **CLOSED:** task-first hierarchy and per-step contracts in §§10–19; primary/current/supporting/activity/history/technical classes in §6 |
| FD-02 — operator-visible OpenCode activity | **CLOSED:** bounded live operational activity + bounded post-turn inspectability in §8; no hidden reasoning/raw provider plumbing |
| FD-03 — manual Implementation action semantics | **CLOSED:** explicit start of the canonical current approved task; never an unscoped global-scheduler meaning (§17.1) |
| FD-04 — proposal vs cancellation/terminalization | **CLOSED:** pending proposal owns attention; Cancel unavailable until proposal disposition; adoption in progress has no competing terminalization (§9.1) |
| FD-05 — material maturity | **CLOSED:** Draft / Updated — validation required / Current / Stale / Historical / Signed & locked, with proposal/adoption transient states (§7) |
| FD-06 — integrated pre-signoff loop | **CLOSED:** one Dialogue/Review/Document/Evidence task grammar with exact post-action orientation (§9 and §§11–14) |

No material product decision identified by the investigative baseline is delegated to Solution design.

### 23. Functional requirement identities

The following stable requirement identities are owned by this functional design for downstream traceability:

- **WF-FR-001 TASK-FIRST-WORKFLOW** — each workflow step is organized around its primary task and subtasks, not its available domain objects.
- **WF-FR-002 CURRENT-ATTENTION-OWNERSHIP** — the highest-priority current subtask owns the current action and cannot be hidden by history/context.
- **WF-FR-003 INFORMATION-HIERARCHY** — primary/current/supporting/activity/history/technical information classes are enforced across every workflow surface.
- **WF-FR-004 MATERIAL-MATURITY-LANGUAGE** — the operator-facing maturity vocabulary and behavior in §7 is consistent and independent from lifecycle stage.
- **WF-FR-005 BOUNDED-AGENT-ACTIVITY** — live/product-relevant operational activity is visible without exposing hidden reasoning or raw provider plumbing.
- **WF-FR-006 SERIAL-HUMAN-AGENT-DIALOGUE** — active provider processing does not accept concurrent free-form input; OPEN/REQUIRED_INPUT interaction is explicit.
- **WF-FR-007 PROPOSAL-ATTENTION-CLOSURE** — unresolved proposal/adoption owns attention and cannot be orphaned by Cancel/terminalization.
- **WF-FR-008 DIRECT-AUTHORING** — authorized human Markdown Save remains explicit canonical mutation with conflict safety and downstream invalidation.
- **WF-FR-009 PRESIGNOFF-GRAMMAR** — Research, Requirements, Solution design and Implementation plan use one coherent Dialogue/Review/Document/Evidence task loop.
- **WF-FR-010 WORK-REQUEST-TASK** — Work request supports author/validate/start-Research behavior in §10.
- **WF-FR-011 RESEARCH-TASK** — Research supports evidence-backed investigation behavior in §11.
- **WF-FR-012 REQUIREMENTS-TASK** — Requirements supports closure of observable product behavior in §12.
- **WF-FR-013 DESIGN-TASK** — Solution design supports technical closure without changing accepted product intent in §13.
- **WF-FR-014 PLAN-TASK** — Plan supports exact executable delivery authority in §14.
- **WF-FR-015 READINESS-TASK** — Readiness review supports adversarial verdict/defective-owner/evidence behavior in §15.
- **WF-FR-016 APPROVAL-TASK** — Approval supports current-package understanding and explicit sign-off in §16.
- **WF-FR-017 TASK-SCOPED-MANUAL-EXECUTION** — manual Implementation start is scoped to the canonical current approved task.
- **WF-FR-018 IMPLEMENTATION-TASK** — Implementation supports task scanning, active role, blockers, validation, evidence and recovery in §17.
- **WF-FR-019 TERMINAL-RESULT-TASK** — Complete presents the governed outcome/result first and permitted follow-up second.
- **WF-FR-020 POST-ACTION-ORIENTATION** — every material interaction reorients the operator to the resulting current task.
- **WF-FR-021 RESPONSIVE-SEMANTIC-CONTINUITY** — responsive layout changes representation only, not task/state/action meaning.
- **WF-FR-022 ACCESSIBLE-INTERACTION-CONTINUITY** — material interactions, focus, state and failure feedback remain keyboard/assistive-technology usable.
- **WF-FR-023 SUPPORTING-SERVICE-BOUNDARIES** — Queue/Create/Settings/Context/Evidence support workflow tasks without becoming workflow authority.
- **WF-FR-024 NO-DUPLICATE-PRODUCT-STATE** — required presentation/maturity behavior is derived from canonical facts unless Solution design proves a genuinely missing fact.
- **WF-FR-025 LIFECYCLE-INFORMATION-MATURITY** — each stage consumes only the authoritative information legitimately available at that point and adds only the semantic layer it owns.
- **WF-FR-026 CURRENT-STAGE-DOCUMENT-PRIMACY** — the current stage-owned task/output is primary; upstream documents remain supporting authority/evidence and unreached downstream documents are not presented as empty productive artifacts.
- **WF-FR-027 REQUIREMENT-TO-SOLUTION-BOUNDARY** — Requirements closes observable functional requirements plus applicable binding constraints; Solution design resolves the technical requirements/architecture/contracts that realize them without inventing product behavior.
- **WF-FR-028 WORK-TYPE-AWARE-DOCUMENTATION** — Change, Defect, Investigation and Audit retain their governed intake and Research semantics, and shared later delivery steps preserve the kind-specific facts and invariants required to perform their task.
- **WF-FR-029 PROGRESSIVE-DOCUMENTATION** — a WorkItem may begin with incomplete kind-specific intake information and progressively accumulate authoritative facts, Requirements, Solution design, Implementation plan, review and evidence without fabricating unreached documents.
- **WF-FR-030 USER-FACING-WORKFLOW-LANGUAGE** — operator-facing workflow documentation and UI use Work request, Research, Requirements, Solution design, Implementation plan, Readiness review, Approval, Implementation and Complete rather than internal lifecycle codes.
- **WF-FR-031 TASK-AREA-CONTEXT-CLOSURE** — each workflow task area exposes the current step-owned output together with the minimum kind-specific upstream information needed to perform the task without reconstructing context from unrelated files.

## Acceptance criteria

The functional design is satisfied only when all of the following observable criteria are met.

### A. Cross-workflow

1. Every lifecycle step has one explicit primary task and completion outcome.
2. Every material subtask has a trigger, goal, required information, accepted human input/decision, valid interaction, effect and post-action orientation.
3. Every current workflow condition has one intelligible attention owner or explicit no-action processing state.
4. Historical selection never changes current mutation authority.
5. The operator does not need provider/session/runtime knowledge to understand ordinary workflow ownership.
6. Technical ids/hashes/paths do not displace task meaning/current action.
7. All material mutations expose pending, success, conflict/failure and valid recovery behavior.
8. After asynchronous transition, no new mutation is offered until the browser has observed a coherent canonical result.

### B. Pre-signoff

9. Research, Requirements, Solution design and Implementation plan share one recognizable interaction grammar.
10. Processing shows bounded useful operational activity.
11. OPEN allows free continuation only when no higher-priority input/proposal/blocker owns attention.
12. REQUIRED_INPUT shows the exact question and binds the response to it.
13. Pending proposal removes free continuation and Cancel until explicit disposition.
14. Adoption in progress removes competing Reject/Cancel/edit mutation actions.
15. Successful adoption keeps lifecycle ownership at the same stage, updates material, invalidates affected conformance and requires fresh context before productive continuation.
16. Direct human Save does not become a synthetic proposal.
17. Historical attempts/evidence remain inspectable without hiding current attention.

### C. Readiness and Approval

18. Readiness leads with verdict/currentness, findings and defective owner before history.
19. Readiness can temporarily surface exact required input without becoming a generic chat-first screen.
20. Approval leads with package currentness and signed-task meaning before technical package identity.
21. Stale/returned Approval material remains inspectable but cannot be signed or represented as approved.
22. Large Approval collections remain Review-class and do not become persistent master/detail.
23. Sign-off is one explicit action over the exact current package.

### D. Implementation

24. Implementation alone uses persistent operational master/detail.
25. Manual start always identifies and starts the canonical current approved task for the current WorkItem.
26. Inspecting another task cannot retarget the current action.
27. Active builder/reviewer/remediator work shows bounded operational activity.
28. Current blocker/recovery overrides historical selection for attention.
29. Validation shows current/recorded proof first and does not lead with unreached empty stages.
30. Cancel/Resume behavior remains attached to the exact current execution owner.

### E. Material and terminal behavior

31. Draft, Updated — validation required, Current, Stale, Historical and Signed & locked are distinguishable where the distinction changes what the operator can do.
32. Proposal pending/Applying change are interaction states, not duplicate persisted document status.
33. Git save/recording does not imply conformance/currentness.
34. Signed material is not directly edited in place.
35. Complete presents terminal outcome/substantive result before generic history/artifacts.
36. Linked remediation appears only for canonically eligible completed AUDIT/INVESTIGATION results and creates a distinct governed WorkItem.

### F. Accessibility/responsive

37. Wide/medium/narrow representations preserve current task, action priority and state meaning.
38. Focus returns to the correct originating/current control after modal/overlay/material transitions.
39. Material actions are keyboard reachable and have accessible names.
40. Workflow-semantic state is never communicated by color alone.
41. Actionable failures remain visible until resolved and asynchronous state is announced without duplicate competing notifications.

### G. Phase 1 traceability

42. Every productive Phase 1 `SURF-` family maps to one task/subtask contract in this document.
43. Every material investigative-baseline `ACT-` interaction is either preserved with explicit semantics, superseded by an explicit functional requirement, or prohibited by a negative requirement.
44. F-01 is closed functionally by the information hierarchy.
45. F-02 is closed functionally by proposal-attention/cancellation semantics.
46. F-03 is closed functionally by task-scoped manual execution.
47. F-05 is closed functionally by bounded agent activity.
48. F-07 is closed functionally by the material-maturity language.
49. F-04/F-06 and the certification gaps remain technical realization obligations for Solution design; this functional design does not weaken or reinterpret the required behavior to fit current implementation.

### H. Lifecycle information maturity

50. Work request presents the originating source as the primary productive document and does not imply that Research/Requirements/Design/Plan authority already exists.
51. Research consumes the Work request plus applicable authority/evidence and produces factual closure without inventing Requirements, architecture or implementation.
52. Requirements consumes accepted Research/product intent and produces observable functional requirements plus applicable binding constraints without choosing technical architecture or lower-level contracts.
53. Solution design consumes accepted Requirements plus technical authority/evidence and explicitly resolves the requirement-to-solution relationship before Implementation plan begins.
54. Implementation plan consumes accepted Design/Requirements and is the sole current executable delivery authority; it does not require implementation to reconstruct design from earlier documents.
55. Readiness, Approval, Implementation and Complete present the accumulated package according to their own task purpose rather than rendering every lifecycle document with equal default prominence.
56. Unreached downstream lifecycle documents are not represented as current productive authority merely to fill the workspace.
57. Every later stage can trace its owned output to the minimum sufficient upstream authority without copying that authority into a second normative source.
58. Change, Defect, Investigation and Audit each open with their governed kind-specific Work request structure rather than a generic intake document.
59. Research presents and produces the kind-specific factual result required by the selected work type.
60. Investigation and Audit can terminate successfully after Research without empty Requirements, Solution design or Implementation plan artifacts.
61. Confirmed Change and Defect work continue into shared delivery steps while preserving their distinct upstream semantics.
62. Defect Requirements explicitly preserve expected corrected behavior and unchanged-behavior/regression obligations derived from Work request and Research.
63. Defect Solution design and Implementation plan remain traceable to the proven root cause and original reproduction rather than degrading into generic change work.
64. Change Requirements, Solution design and Implementation plan remain traceable to the requested outcome and proven current-state/absence.
65. Operator-facing workflow documentation and UI use user-facing workflow names; internal lifecycle codes appear only in technical traceability contexts.
66. The task area for every workflow step shows the current step-owned output plus the kind-specific upstream information needed to perform that task without mental reconstruction from unrelated documents.

## Scope/exclusions

### In scope

- all nine lifecycle workflow steps;
- shared WorkItem shell/current-attention behavior needed by those tasks;
- complete pre-signoff human-agent/document/proposal interaction;
- product-visible bounded agent activity, failure and recovery behavior;
- document/material maturity presentation and interaction;
- proposal disposition/cancellation semantics;
- manual Implementation execution meaning;
- per-step information hierarchy and post-action orientation;
- lifecycle information maturity, stage-entry documentation expectations and stage-owned output boundaries;
- work-type-specific intake/Research semantics and their downstream information obligations;
- user-facing workflow terminology for operator-facing functional documentation and UI;
- Queue/Create/Settings/Context/Evidence where they support the workflow task model;
- responsive/accessibility continuity;
- functional acceptance and downstream traceability.

### Excluded from functional design

Functional design does not choose:

- provider event/log APIs or exact observability transport;
- HTTP request/response shapes;
- persistence schema;
- TypeScript/Zod contract structures;
- React component/file ownership;
- exact browser query architecture;
- database transaction/locking mechanics;
- prompt serialization/parsing mechanics;
- implementation task decomposition/change surface;
- dependency upgrades unless Solution design proves the accepted functional requirements cannot be met with the pinned provider;
- another persisted material/workflow state merely to simplify rendering.

## Failure/negative behavior

The accepted product must not:

- present domain objects merely because data exists when they do not support the current task;
- require the operator to infer lifecycle ownership from provider/session/runtime internals;
- allow raw paths/hashes/ids to occupy persistent primary space unless task-essential;
- hide a current blocker/input/proposal/recovery owner behind Context, history or another secondary surface;
- allow historical selection to become current mutation authority;
- accept concurrent free-form human input into an active provider turn;
- terminalize/cancel a Run while leaving an unresolved proposal without a valid disposition owner;
- allow competing Reject/Cancel/edit actions while proposal adoption is in progress;
- present a task-local Implementation action whose actual scope is a global scheduler action;
- silently promote conversation into canonical authority;
- silently overwrite changed governed Markdown;
- treat Git recording as conformance/readiness;
- fabricate Run or conformance history to surface repository drafts;
- weaken STAGE consumer validation to accommodate an incomplete producer contract;
- expose hidden model reasoning, credentials, raw unbounded tool I/O or provider-native protocol metadata as ordinary transparency;
- create a second persistent navigation system for pre-signoff attempts/documents;
- convert Approval into master/detail based on collection size;
- fill Implementation primary space with unreached/empty validation rows;
- let responsive recomposition change task meaning/action priority;
- delegate any material product behavior in this document back to Solution design or implementation.
- flatten Change, Defect, Investigation and Audit into one generic document progression that loses their distinct intake/Research semantics;
- require a new WorkItem to contain information that legitimately belongs to a later workflow step;
- render unreached downstream documents as if they were current productive authority;
- use internal lifecycle codes as ordinary operator-facing screen labels, task descriptions or workflow explanations.

## Material compatibility/security/performance constraints

- Existing canonical WorkItem, Run, RunEvent, ArtifactRef, Approval and ExecutionTask ownership remains authoritative unless downstream Solution design proves a contract change required to realize these accepted behaviors.
- Conversation remains non-canonical until an authorized explicit source/artifact mutation adopts the material change.
- Source freshness, expected-content conflict safety, exact sign-off binding and signed-material locking are preserved.
- Material maturity is derived from canonical facts; no duplicate persisted maturity owner is authorized by this functional design.
- Provider transparency is bounded/redacted and must not expose secrets or hidden reasoning.
- Order remains a local browser client over daemon-owned state; no browser-local workflow authority or second transport/state machine is authorized.
- Long Markdown, long titles, multiple attempts/tasks, dense evidence/history and lengthy activity must preserve the same hierarchy and usable task orientation.
- Live agent activity and asynchronous workflow updates must not require page reload to discover current progress or completion.
- The accepted activity design must tolerate missing/late provider telemetry by preserving truthful canonical Processing/Failure state; unavailable optional activity detail must never be fabricated.
- Technical detail disclosure must not become a correctness dependency for ordinary operation.
