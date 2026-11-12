# 37 — Workbench UX and information architecture

**Status:** Binding functional design  
**Canonical concern ID:** `GW-DOC-WORKBENCH-UX`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-UX-V1`  
**Pyramid layer:** P3 functional requirements

## 1. Purpose

This document owns Order's **workbench information architecture, spatial allocation, interaction-surface selection and responsive presentation rules**.

It exists because a governed software-work application contains materially different information classes:

- compact queue/status data;
- small operator inputs;
- long-form governed Markdown;
- interactive stage dialogue;
- artifact proposals and diffs;
- exact sign-off packages;
- execution tasks;
- Run/RunEvent history;
- validation/evidence;
- terminal investigation/audit results.

Those classes are not interchangeable merely because they belong to one WorkItem. The workbench must allocate each class to a surface whose width, height, navigation model and interaction affordances make the information usable.

This document does **not** own lifecycle semantics, Markdown mutation rules, execution policy, sign-off semantics, source identity, daemon contracts, component-library choice or visual implementation. Those remain owned by `GW-DOC-WORK-LIFECYCLE-V1`, `GW-DOC-WORK-ITEM-DOCUMENT-SYSTEM-V1`, `GW-DOC-MARKDOWN-WORKBENCH-V1`, `GW-DOC-EXECUTION-CONTROL-PLANE-V1`, `GW-DOC-CANONICAL-CONTRACTS-V1` and the P4 technical design.

## 2. UX operating model

Order has one workbench with two presentation states:

```text
QUEUE STATE
toolbar
└── primary canvas: work queue / diagnostics / creation entry

WORKITEM STATE
toolbar
├── primary canvas: the selected WorkItem working surface
└── contextual inspector: concise status / metadata / compact inputs / current action
```

Selecting a WorkItem changes the **primary canvas** from queue-level work to the selected WorkItem workspace. It does not move the complete WorkItem into the contextual inspector.

The contextual inspector is a supporting surface. It must contain only information that remains usable in a narrow column:

- identity needed to establish context;
- lifecycle stage/status/outcome;
- project/kind/schema/concerns;
- source path/freshness summary;
- compact validation/blocker summaries;
- small scalar inputs;
- the current contextual action.

Content requiring sustained reading, editing, comparison, horizontal structure, evidence inspection or more than a few lines of narrative belongs in the primary canvas.

## 3. Space classes

The following approximate content budgets are functional usability constraints. P4 owns exact breakpoints/tokens.

| Space class | Intended material | Approximate usable width | Typical height |
|---|---|---:|---:|
| **Compact context** | metadata, status, small inputs, one action | 320–400 px | viewport-height rail/drawer |
| **Document** | Markdown reading/editing | minimum ~640 px; preferred 760–960 px | remaining viewport height |
| **Review** | diffs, sign-off package, task/scope comparison | minimum ~760 px; preferred 900–1200 px | remaining viewport height |
| **Operational table** | queue, tasks, diagnostics | preferred 900–1200+ px | content/viewport |
| **Dialogue** | stage conversation + composer | minimum ~680 px; preferred 760–960 px | remaining viewport height |
| **Evidence** | logs, raw text, patches, artifacts | minimum ~760 px; preferred 900–1200 px | remaining viewport height |

A surface may become wider than its preferred width. It must not be deliberately constrained to a narrower class merely to preserve a panel.

## 4. WorkItem workspace modes

The selected WorkItem primary canvas exposes only modes that are meaningful for the current canonical state.

The mode vocabulary is:

1. **Documents** — WorkItem source and lifecycle Markdown.
2. **Dialogue** — interactive STAGE dialogue and artifact proposals.
3. **Review** — R3/sign-off package inspection and explicit approval.
4. **Execution** — tasks, Runs and validation state.
5. **Evidence** — selected artifacts/evidence/raw material.
6. **Result** — terminal investigation/audit outcome and supporting evidence.

These are presentation modes over canonical Order state, not lifecycle stages and not a second state machine.

The workbench must preserve the selected WorkItem identity while the operator moves among these modes. Opening an evidence item from Execution may transition the primary canvas to Evidence without changing daemon-owned workflow state.

### 4.1 Deterministic workspace entry

Opening a WorkItem selects one initial primary mode from canonical state:

- an active interactive STAGE Run opens **Dialogue**;
- `AWAITING_SIGNOFF` opens **Review**;
- `EXECUTION` opens **Execution**;
- `COMPLETE / CANDIDATE_DONE` opens **Execution** for candidate/validation inspection;
- `COMPLETE` with `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED`, `INVESTIGATION_COMPLETE` or `AUDIT_COMPLETE` opens **Result**;
- all other pre-signoff states open **Documents**.

Within Documents, a newly created WorkItem opens **Source** as required by `GW-DOC-MARKDOWN-WORKBENCH-V1`. Otherwise the selector prefers the current lifecycle-stage document when one exists and falls back to Source.

Evidence is never the default entry mode; it is entered from an explicit evidence/artifact selection and provides a clear return to the originating mode.

### 4.2 Queue/workspace entry and browser history

The selected WorkItem remains represented by the existing browser URL selection so a refresh/deep link reopens that WorkItem and browser Back/Forward continues to traverse queue/WorkItem selection.

The WorkItem workspace provides an explicit **Back to work queue** action. Returning to the queue clears only presentation-local WorkItem selection; it does not mutate daemon state.

Mode/document/evidence selection is presentation-local and need not become additional URL routing in v1.

## 5. Screen and interaction allocation matrix

| Surface | Use case / content shape | Correct workbench location | Functional space requirement | Primary interactions |
|---|---|---|---|---|
| Global WorkItem queue | scan title/project/kind/stage/status/concerns across many items | primary canvas | operational table | search, open item, copy id |
| Source diagnostics | compare invalid/missing/duplicate/unsupported sources and actionable detail | primary canvas section/table | operational table | refresh, inspect diagnostic |
| Create WorkItem | controlled project/type/title/concern input | contextual creation drawer/inspector | compact context | choose project/type/concerns, create |
| WorkItem identity/status | stage/status/outcome/project/kind/schema/concerns/source summary | contextual inspector | compact context | inspect, invoke current action |
| WorkItem source Markdown | originating work definition, potentially long and editable | primary Documents canvas | document | edit/save/cancel/reload conflict |
| R1/R2/DESIGN/PLAN/R3 Markdown | governed lifecycle documents in lifecycle order | primary Documents canvas | document | navigate, edit when allowed, inspect read-only |
| Interactive STAGE dialogue | multi-turn messages, questions, operator response | primary Dialogue canvas | dialogue | respond/continue/cancel, inspect history |
| Artifact proposal | rationale + unified diff + disposition | primary Dialogue/Review canvas | review | inspect diff, adopt/reject |
| Sign-off package | hashes, source binding, signed tasks, exact documents | primary Review canvas | review | inspect package/docs, enter approver, sign off |
| Execution task overview | task objective/state/gates/change surface | primary Execution canvas | operational table/review | select task, inspect scope/state |
| Runs/validation history | run selection, chronological events, V0–V7, statuses | primary Execution canvas | review | select run/event/evidence |
| Evidence/artifact viewer | arbitrary text/log/patch/Markdown/binary preview | primary Evidence canvas | evidence | inspect, copy where useful, return to origin |
| Terminal non-delivery result | `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED`, investigation result or audit result with supporting evidence | primary Result canvas | document/review | inspect terminal classification/result/evidence |
| Investigation/audit remediation | linked follow-up from an evidence-backed investigation/audit result | contextual creation drawer/inspector | compact context | create separately governed linked CHANGE/DEFECT |
| Linked remediation creation | small seeded CHANGE/DEFECT creation form | contextual creation drawer/inspector | compact context | choose type/title/concerns, create |
| Global toolbar | navigation-independent app actions | top toolbar | full width | new item, refresh, search, appearance |
| Session/error/empty state | explain unavailable/local state | primary canvas | centered readable region | retry/recover |

## 6. Document workspace

Documents are first-class work surfaces.

The Documents mode presents the available canonical package in lifecycle order:

```text
Source → R1 → R2 → DESIGN → PLAN → R3
```

The document selector is a compact navigation strip/list; selecting a document changes the primary document canvas.

The document canvas must:

- provide readable line length and sustained vertical space;
- use the available viewport rather than an inspector-sized fixed block;
- preserve exact Markdown source when editing under `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- clearly expose editable/read-only/current/stale state;
- keep Save/Cancel/conflict recovery visible without reducing the document to a small text box;
- make R3 independence/read-only status obvious;
- avoid wrapping structured code/diff material in ways that destroy meaning.

A full governed document must never be placed in the compact contextual inspector.

## 7. Dialogue and proposal review

Interactive STAGE work is a conversation-oriented primary surface.

The dialogue view separates:

- persisted system/agent/operator messages;
- human-input requests;
- tool/evidence activity where relevant;
- artifact proposals;
- the operator composer.

The composer remains adjacent to the dialogue rather than being buried after unrelated metadata.

Artifact proposals are review content. Their rationale and unified diff require the Review space class. Adopt and Reject remain explicit, mutually understandable actions and follow the existing action hierarchy.

A streaming-capable presentation is permitted, but this requirement does not introduce token streaming, WebSocket or SSE semantics. The browser continues to render whatever canonical Run/RunEvent state the existing transport provides.

## 8. Review and sign-off

Sign-off is a deliberate package-review task, not a sidebar form.

The Review mode must allow the operator to understand:

- package/currentness state;
- originating source binding;
- exact signed tasks and objectives;
- relevant lifecycle documents;
- readiness/sign-off blockers;
- the explicit approval action.

Hashes remain available for exact identity but are secondary to understanding the package. The compact inspector may contain the approver input and final action only when the complete package remains visible in the primary Review canvas.

## 9. Execution and evidence

Execution is inspection-only under the existing lifecycle/Markdown contracts.

The Execution mode must support comparison and scanning of:

- task state;
- objective;
- gates;
- change surface;
- Runs and attempts;
- validation events;
- candidate state.

Run events are chronological operational information and should use a list/timeline with sufficient width for multi-line event detail.

Evidence selected from a task, run or validation event opens in the Evidence mode. Raw text, logs and patches use the full primary workspace and retain their formatting. Evidence must not be constrained to a short fixed-height preformatted block inside the inspector.

## 10. Result presentation

The Result mode covers every successful terminal WorkItem that does not represent a delivered candidate: `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED`, `INVESTIGATION_COMPLETE`, and `AUDIT_COMPLETE`.

The primary Result canvas gives the terminal classification and its available conclusion/verdict/findings/evidence appropriate reading space. It must not imply that a duplicate, disproven or already-satisfied item failed merely because no implementation occurred.

For `INVESTIGATION_COMPLETE` and `AUDIT_COMPLETE`, the contextual inspector additionally exposes the linked-remediation action owned by `GW-DOC-MARKDOWN-WORKBENCH-V1`. Other terminal outcomes do not acquire an invented remediation action.

Creating remediation opens a compact creation surface while preserving visible lineage to the completed parent.

## 11. Control-selection rules

Control form must match the decision being made.

| Decision | Required interaction pattern |
|---|---|
| Appearance: System / Light / Dark | direct segmented choice with semantic icon + label; not a generic select |
| WorkItem type | direct icon + label single-choice options; not a text-only select |
| Project | selector/typeahead/select because this is an entity choice |
| Concerns | searchable/toggleable multi-choice chips/list; not native multi-select |
| Document/mode navigation | tabs/navigation items with icon + label where useful |
| Boolean/toggle state | checkbox/switch/toggle according to semantics |
| Destructive disposition | explicit destructive action, never hidden in a generic menu when immediately consequential |

Native/select-style controls remain valid when the choice is genuinely an arbitrary entity list rather than a small semantic mode set.

## 12. Icon semantics

Icons are part of the Order interaction language.

They are required where they materially improve recognition of:

- global actions: add, refresh, search, copy;
- appearance modes;
- WorkItem kinds;
- lifecycle/document roles;
- read-only/locked state;
- dialogue/tool activity;
- proposal/diff review;
- validation success/warning/failure;
- evidence/artifact identity;
- terminal investigation/audit outcomes.

Rules:

1. critical lifecycle actions retain visible text labels; icons supplement them;
2. icon-only controls are reserved for conventional utility actions where the accessible name remains explicit;
3. one semantic meaning uses one icon convention across the workbench;
4. color is never the sole state discriminator;
5. icons do not create a competing decorative language or increase chrome density without informational value.

## 13. Responsive behavior

Responsive behavior preserves the primary task.

### Wide desktop

The primary canvas and compact contextual inspector may be visible simultaneously. The inspector must not reduce the primary canvas below the minimum usable width for the active content class.

### Medium viewport

The primary canvas remains the dominant surface. The contextual inspector becomes a dismissible drawer/overlay or equivalent temporary secondary surface rather than being appended below the primary content.

### Narrow/mobile viewport

The application becomes one primary pane at a time. Context/status/actions remain reachable through an explicit control. Long-form documents, dialogue, review and evidence retain the viewport instead of sharing it with a permanent rail.

Responsive transitions are presentation changes only and must not reset selected WorkItem, document, Run, unsaved editor buffer or other presentation-local task context unnecessarily.

## 14. Queue and diagnostics density

The queue remains dense and scan-first.

Requirements:

- one row represents one WorkItem;
- title is the dominant row field;
- project/kind/stage/status/concerns remain secondary scan fields;
- lower-priority columns may collapse responsively;
- statuses use compact semantic indicators;
- row-local utility actions do not hijack row selection;
- diagnostics should be comparable as structured rows/list entries instead of repeated large alert cards when more than one is present.

## 15. Interaction safety, accessibility and state feedback

### Unsaved governed Markdown

A navigation action that would unmount or replace a dirty editable Markdown buffer must never discard it silently.

- responsive rail/drawer changes and opening/closing contextual information must preserve the buffer without prompting;
- switching to another WorkItem, another governed document, another primary mode, or returning to the queue while dirty is blocked by an explicit confirmation;
- the confirmation offers **Continue editing** and **Discard unsaved changes**; it does not silently save;
- Save remains the canonical explicit write action and retains the stale-write/conflict behavior owned by `GW-DOC-MARKDOWN-WORKBENCH-V1`;
- Cancel remains the explicit in-editor revert to the loaded snapshot.

### Keyboard and focus continuity

Every workbench action and navigation path must be operable by keyboard.

- queue rows remain keyboard activatable;
- opening a WorkItem moves focus into the new primary workspace context;
- Back to work queue returns focus to the originating row when it still exists, otherwise to the queue heading/search;
- mode and document navigation use the expected keyboard semantics of their control type;
- opening contextual drawers or confirmation surfaces gives them meaningful focus and closing returns focus to the opener;
- icon-only utility actions retain an explicit accessible name;
- focus indication must remain visible in both light and dark appearances.

### Loading, empty and failure states

Every primary workspace mode must retain its spatial shell while loading and expose an explicit empty or error state when canonical data is unavailable. A missing document, Run, evidence item or package must not collapse into an unexplained blank region.

## 16. Functional requirements

### GW-FR-030-WORKBENCH-PRIMARY-CANVAS

**Required behavior:** selecting a WorkItem opens its substantive working material in the primary workbench canvas while preserving a separate compact contextual inspector.

**Acceptance criterion:** long-form documents, dialogue, review packages, execution detail and evidence are readable/operable without being constrained to the inspector width.

**Failure/negative behavior:** the complete WorkItem workspace must not be mounted into the inspector or another compact auxiliary surface.

### GW-FR-031-CONTEXT-INSPECTOR-BOUNDARY

**Required behavior:** the inspector contains only compact identity, status, metadata, small inputs and contextual actions.

**Acceptance criterion:** every inspector section remains understandable at compact-context width without sustained document reading or horizontally structured content.

**Failure/negative behavior:** Markdown documents, diffs, task packages, run histories or raw evidence must not be placed in the inspector.

### GW-FR-032-SURFACE-SPACE-FIT

**Required behavior:** each workbench information class is rendered in a surface whose space class fits its reading, authoring, comparison and interaction needs.

**Acceptance criterion:** the allocation matrix in §5 is respected for all current application surfaces.

**Failure/negative behavior:** visual consistency must not be achieved by forcing materially different content into one universal panel size.

### GW-FR-033-RESPONSIVE-WORKSPACE-CONTINUITY

**Required behavior:** responsive layout changes preserve the operator's primary work and presentation-local context.

**Acceptance criterion:** narrower viewports collapse/move contextual surfaces without demoting the active document/review/dialogue/evidence task below unrelated content or losing unsaved buffers/selection.

**Failure/negative behavior:** the inspector must not simply move below the primary canvas when doing so makes the current task effectively unusable.

### GW-FR-034-SEMANTIC-CONTROL-AFFORDANCES

**Required behavior:** the control type reflects the semantics of the decision, with direct icon+label controls for small semantic mode/type sets and selector-style controls for entity collections.

**Acceptance criterion:** appearance, WorkItem type, project and concerns follow §11.

**Failure/negative behavior:** generic selects or native multi-selects must not be used where a direct semantic choice or multi-category interaction is required.

### GW-FR-035-DOCUMENT-REVIEW-READABILITY

**Required behavior:** governed documents, diffs, sign-off packages and result narratives receive primary-canvas reading/review space.

**Acceptance criterion:** the operator can read/edit/review these materials at the minimum space budgets in §3 without structural information being destroyed by wrapping or fixed-height truncation.

**Failure/negative behavior:** document/review material must not be treated as a small status/detail field.

### GW-FR-036-DIALOGUE-EXECUTION-EVIDENCE-PRESENTATION

**Required behavior:** dialogue, execution state and evidence are distinct primary workspace modes optimized for their respective interaction shapes.

**Acceptance criterion:** conversation has adjacent composition, execution supports task/run/event scanning, and evidence uses full read-only inspection space.

**Failure/negative behavior:** these surfaces must not be concatenated into one indefinitely scrolling inspector column.

### GW-FR-037-WORKBENCH-NAVIGATION-CONTINUITY

**Required behavior:** WorkItem mode/document/evidence navigation preserves selected WorkItem identity and does not create a second workflow state machine.

**Acceptance criterion:** presentation navigation changes only browser-local presentation state while daemon-owned lifecycle state remains canonical.

**Failure/negative behavior:** tabs/modes must not imply lifecycle promotion or mutate Order domain state merely by navigation.

### GW-FR-038-ICON-AND-ACTION-SEMANTICS

**Required behavior:** icons consistently reinforce recognized actions, document/type identity and status while critical actions retain explicit text.

**Acceptance criterion:** the icon rules in §12 are applied consistently and accessibly.

**Failure/negative behavior:** icon use must not become decorative noise, hide consequential actions behind ambiguous glyphs or rely on color alone.

### GW-FR-039-WORKSPACE-ENTRY-EXIT-HISTORY

**Required behavior:** WorkItem selection has deterministic entry-mode behavior, an explicit return to the queue, and preserves the existing URL/browser-history selection contract.

**Acceptance criterion:** refresh/deep-link and browser Back/Forward reopen/leave the selected WorkItem correctly, and entry mode follows §4.1 without mutating daemon state.

**Failure/negative behavior:** the redesign must not strand the operator inside a WorkItem, discard the existing deep-link behavior, or invent a router/state machine to implement presentation navigation.

### GW-FR-040-UNSAVED-MARKDOWN-NAVIGATION-SAFETY

**Required behavior:** navigation that would destroy a dirty governed-Markdown buffer requires explicit discard confirmation.

**Acceptance criterion:** Continue editing leaves the buffer intact; Discard performs only the requested presentation navigation; responsive/context changes preserve the buffer without prompting.

**Failure/negative behavior:** dirty Markdown must never disappear because a WorkItem/mode/document/queue navigation unmounted its editor, and navigation must never auto-save.

### GW-FR-041-KEYBOARD-FOCUS-CONTINUITY

**Required behavior:** the complete queue/workspace/context/navigation/action surface remains keyboard-operable with deterministic focus transfer for major surface changes.

**Acceptance criterion:** the focus behavior in §15 is observable with keyboard-only interaction and focus remains visible in both appearances.

**Failure/negative behavior:** replacing the inspector architecture must not create unreachable actions, lost focus, hidden icon names or focus traps.

### GW-FR-042-WORKSPACE-STATE-FEEDBACK

**Required behavior:** each primary mode provides explicit loading, empty and failure feedback without collapsing the workbench geometry.

**Acceptance criterion:** unavailable documents, Runs, packages, evidence and result material produce an actionable/understandable state in the owning primary region.

**Failure/negative behavior:** canonical missing/error states must not render as blank or ambiguous primary workspaces.

## 17. Non-goals

This functional design does not introduce:

- a new lifecycle stage or daemon state;
- a new transport, token-streaming contract, WebSocket or SSE;
- an IDE/file explorer;
- arbitrary code editing;
- a dashboard/card grammar competing with the workbench;
- rich-text authority;
- a component-library requirement;
- mobile-specific domain behavior;
- another browser state store.

## 18. Downstream technical obligations

P4 must implement this design while preserving:

- the local workbench/FCIS/state-ownership architecture;
- the compact Order-owned workbench panel grammar;
- canonical Markdown-source fidelity;
- one action hierarchy;
- accessible semantic controls and icon registry;
- the existing TanStack Query/server-state boundary;
- current polling/HTTP semantics unless separately changed by authority;
- deterministic entry/exit and existing WorkItem URL/history behavior;
- dirty-buffer navigation protection without implicit saves;
- keyboard/focus continuity and per-mode state feedback;
- permanent browser verification for spatial allocation, responsive continuity and semantic control behavior.

## 19. Improvement addendum — interaction-pattern and spatial-efficiency closure (2026-11-12)

This addendum strengthens the existing workbench information architecture after implementation review. It does not introduce a new workflow, lifecycle state, domain contract, browser state owner or visual-design system. It makes the existing UX contract explicit at the **interaction-pattern** level so that equivalent work receives one consistent spatial/view solution across the application.

### 19.1 Canonical interaction-pattern set

Order's current workbench interactions fall into the following presentation classes:

| Pattern | Current examples | Required view solution |
|---|---|---|
| **Global scanning** | WorkItem queue, source diagnostics | dense full-width operational table/list; title/current state remain scan-dominant |
| **Compact structured input** | create WorkItem, linked remediation | bounded drawer/sheet/form; no primary-canvas takeover |
| **Context/status/action** | WorkItem metadata, source health, current lifecycle action, approver input | compact inspector on wide layouts, temporary drawer/sheet when the inspector cannot coexist without stealing task space |
| **Long-form authoring** | Source, R1, R2, DESIGN, PLAN Markdown | primary canvas; nearly all available width and remaining viewport height; exact Markdown remains visible/editable |
| **Long-form reading** | R3, governed read-only Markdown, conclusion/verdict narratives | primary canvas with a readable inner prose measure; outer workspace may remain full-width |
| **Conversation** | interactive STAGE Run | primary canvas with message history and an adjacent/anchored composer using remaining height |
| **Review/comparison** | proposal rationale/diff, sign-off package, task/scope review | primary review canvas with enough horizontal width for structural comparison; concise decision controls remain adjacent without constraining the review material |
| **Operational inspection** | execution tasks, Runs, V0-V7 events | dense master/detail primary workspace optimized for task/run/event scanning rather than a long stack of cards |
| **Raw evidence** | logs, patches, exact bytes, arbitrary evidence | full primary canvas; read-only monospaced/raw viewer consuming remaining height and preserving formatting |
| **Terminal result** | disproven/duplicate/already-satisfied/investigation/audit outcomes | compact terminal classification plus readable result narrative and full evidence/material area where applicable |
| **Safety/exception** | unsaved-navigation confirmation, stale-write conflict, errors | dialog/inline state tied to the owning action; never a competing primary workflow surface |

A new UI treatment is justified only when the interaction shape is materially different from these classes. Similar interactions must not receive screen-specific one-off layout grammars.

### 19.2 Spatial-efficiency invariant

The workbench is a productivity surface. The dominant task must consume the available primary canvas after only the minimum persistent chrome needed for orientation, navigation and the current action.

The following are binding consequences:

- **Editable Markdown, raw evidence, diffs and operational detail must not inherit prose-reading width caps.**
- A prose line-length constraint may exist **inside** a full-width reading surface; it must not cap the entire primary workspace.
- Long-lived primary surfaces use **remaining viewport height**, not merely a fixed/minimum content height.
- Persistent global/workspace/document chrome must not accumulate into multiple redundant rows when the same hierarchy can be represented more compactly.
- Metadata, hashes and paths remain available for exactness but are secondary to the work being authored/reviewed/inspected.
- A control must not occupy persistent premium toolbar space when it does not act on the currently visible primary task.
- Responsive behavior may recompose the same information, but it must preserve the interaction class and primary-task priority.

### 19.3 Navigation hierarchy and chrome economy

The current WorkItem workspace has two presentation hierarchies:

1. primary workspace **mode**: Documents, Dialogue, Review, Execution, Evidence, Result;
2. selection **within** a mode, such as Source/R1/R2/DESIGN/PLAN/R3 or selected Run/evidence.

These hierarchies must remain semantically distinct but must not default to two stacked full-width tab bars.

Required presentation rules:

- only one content-edge tab/list navigation strip should normally occupy the primary canvas at a time;
- WorkItem mode switching belongs in the compact WorkItem toolbar/header or an equivalently economical mode control;
- document tabs/list remain the Documents-mode content navigation;
- the WorkItem header contains only orientation-critical state and actions; detailed project/schema/concern/source metadata belongs in Context;
- Context toggle is shown only when Context is not already persistently visible;
- exact SHA-256/path metadata remains accessible but must not force the authoring/review header to grow materially.

### 19.4 Scope-local toolbar controls

Toolbar controls follow the scope of the surface they affect.

- WorkItem search is a queue operation and must not remain a prominent active-looking control while the queue is hidden.
- Source refresh is a queue/source-management operation and should be colocated with queue/source context rather than permanently consuming deep-work toolbar space.
- WorkItem creation must remain globally reachable, but its presentation may compact when a selected WorkItem owns the primary task.
- appearance/theme is a low-frequency utility and must not consume more persistent toolbar area than high-frequency workflow controls.

The application may retain one shell toolbar, but its contents must be state-aware so visible controls remain relevant to the current primary surface.

### 19.5 Authoring pattern

Governed Markdown authoring uses one reusable workspace pattern:

- compact document identity/navigation/action chrome;
- editable textarea occupying nearly all available primary width;
- editor body flexing to remaining viewport height;
- Save/Cancel/dirty/conflict controls kept visible through a compact sticky/anchored action region or equivalent;
- read-only rendered Markdown may constrain its **inner prose measure** while preserving the outer workspace;
- hash/path identity is available as secondary metadata, not as dominant heading content.

A governed editor must feel like the primary work surface, not a large form field placed inside a conventional content page.

### 19.6 Review pattern

All structurally significant material being judged uses the same review-space principle.

For artifact proposals:

- the dialogue records that a proposal exists and preserves conversational context;
- the rationale and unified diff are review-class content;
- substantive diff inspection must not be constrained to a chat bubble or short fixed-height block;
- adopting/rejecting remains explicit and associated with that proposal.

For sign-off:

- package identity remains available but secondary;
- governed documents, task objectives, gates, change surface and blockers are the primary review information;
- repeated tasks use a scan-efficient list/table/master-detail treatment when card stacking would make comparison or access to later material inefficient.

### 19.7 Operational inspection pattern

Execution must optimize scanning rather than page-length accumulation.

- task selection/summary is compact;
- the selected operational context receives detail space;
- Run selection and chronological event detail form a master/detail region;
- the master/detail region consumes the remaining primary height where practical;
- evidence/resource references use a structured resource-list pattern rather than an unstructured wrapping set of buttons;
- task cards must not form an arbitrarily long barrier above the active Run/event workspace.

No new task/run domain relationship is introduced by this presentation rule.

### 19.8 Queue responsive pattern

The queue remains a dense operational list at every supported width.

On narrower viewports:

- title remains dominant;
- stage/status remain immediately scannable;
- project/kind remain secondary;
- concerns and low-priority metadata may collapse into the dominant row cell or a secondary line;
- row utility actions remain available without forcing a desktop six-column geometry;
- essential information must not be clipped by an `overflow: hidden` container or unreadably compressed merely to preserve all desktop columns.

Horizontal scrolling is acceptable only where preserving tabular structure is more usable than responsive recomposition; it is not the default substitute for a deliberate narrow-row design.

### 19.9 Shared control/resource grammar

Equivalent actions use one consistent visual/interaction grammar:

- selection/navigation;
- secondary utility;
- primary mutation;
- destructive mutation.

Evidence/artifact/resource links use a repeatable structured row/list treatment with role/type, identity/path and open action. Screen-specific raw buttons must not create a second action hierarchy.

### 19.10 Current implementation issues this addendum closes

The next implementation package must close the following observed deficiencies without redesigning the domain model:

1. the editable Markdown workspace is capped by the current `72rem` outer editor width;
2. the editor uses a fixed/minimum-height approach instead of owning remaining viewport height;
3. Save/Cancel can fall below long editable content instead of remaining immediately available;
4. full-width workspace-mode tabs are stacked above full-width document tabs;
5. the WorkItem header duplicates metadata already owned by Context;
6. Context remains presented as an action even when the wide inspector is already visible;
7. queue Search remains prominent while a selected WorkItem hides the queue;
8. Refresh sources remains persistent during unrelated deep-work modes;
9. low-frequency appearance controls consume persistent premium toolbar space;
10. global-toolbar, WorkItem-header, mode-navigation, document-navigation and document-heading chrome accumulate excessive vertical height;
11. SHA/path metadata is more visually prominent than its diagnostic role requires;
12. artifact proposal diff review is constrained inside the conversation presentation instead of receiving review-class space;
13. sign-off identity metadata uses more card/grid area than its importance warrants relative to the package meaning;
14. repeated execution tasks stack vertically ahead of the Run/event workspace;
15. execution artifacts/evidence are exposed as an unstructured wrapping button collection;
16. queue rows retain desktop column geometry without an explicit narrow-view composition and the queue container may clip constrained content;
17. terminal result presentation uses more decorative vertical whitespace than necessary before substantive material;
18. repeated navigation/resource/mutation controls are not consistently expressed through the shared action grammar;
19. primary-mode loading states may collapse to small placeholders instead of retaining the owning workspace geometry.

These are presentation defects only. Their correction must preserve all existing lifecycle, mutation, polling, HTTP, evidence-safety, approval and state-ownership semantics.

## 20. Addendum functional requirements

### GW-FR-043-INTERACTION-PATTERN-CONSISTENCY

**Required behavior:** every current workbench interaction is projected through the canonical interaction class in §19.1, and materially equivalent interactions reuse the same spatial/view grammar.

**Acceptance criterion:** authoring, reading, conversation, review, operational inspection, evidence, compact input/context and safety interactions are recognizably consistent across all WorkItem states without screen-specific layout inventions.

**Failure/negative behavior:** individual screens must not create one-off panel/card/tab structures that contradict the interaction class merely for local convenience.

### GW-FR-044-PRIMARY-CANVAS-SPACE-EFFICIENCY

**Required behavior:** the active primary task consumes the available horizontal width and remaining viewport height appropriate to its interaction class.

**Acceptance criterion:** editable Markdown, raw evidence, diffs and operational detail are not capped by prose-reading widths; prose itself retains a readable inner measure; persistent chrome does not materially crowd out the task.

**Failure/negative behavior:** a fixed/max-width page container, fixed/minimum-height substitute, or unrelated permanent control must not leave substantial usable primary-canvas space idle.

### GW-FR-045-NAVIGATION-CHROME-ECONOMY

**Required behavior:** WorkItem mode navigation and within-mode navigation remain distinct without stacking redundant full-width navigation rows.

**Acceptance criterion:** the selected WorkItem retains orientation and mode access while the active mode exposes at most one normal content-edge navigation strip; Context and metadata controls appear only where they perform useful work.

**Failure/negative behavior:** mode tabs, document tabs, duplicate metadata headers and diagnostic identity rows must not accumulate into avoidable vertical chrome before the active task.

### GW-FR-046-SCOPE-LOCAL-CONTROLS

**Required behavior:** persistent controls are displayed according to the surface whose state/action they affect.

**Acceptance criterion:** queue search/source refresh are queue-scoped, Context toggle appears only when Context is hidden, global creation remains reachable without dominating deep work, and appearance remains a low-priority utility.

**Failure/negative behavior:** a prominent control must not remain active-looking while its affected surface is absent or while it performs no visible action on the current task.

### GW-FR-047-REVIEW-MATERIAL-PROMOTION

**Required behavior:** proposal diffs, sign-off package meaning and other structurally significant review material receive Review-class primary space independent of the compact decision control that acts on them.

**Acceptance criterion:** proposal conversation remains visible as context but full diff inspection is not constrained to a chat bubble; sign-off/task review prioritizes objectives/scope/gates/documents over hash-card chrome.

**Failure/negative behavior:** large review material must not be embedded inside compact conversation/context containers merely because the action originated there.

### GW-FR-048-EXECUTION-MASTER-DETAIL-EFFICIENCY

**Required behavior:** Execution presents tasks, Runs, chronological events and evidence references as a scan-efficient operational workspace.

**Acceptance criterion:** repeated task summaries do not create an arbitrarily long vertical barrier before active Run/event detail; Run selection/detail receives remaining workspace space; resources use structured rows/lists.

**Failure/negative behavior:** operational inspection must not degrade into sequential card stacks followed by an unrelated event section and loose button collection.

### GW-FR-049-RESPONSIVE-QUEUE-EFFICIENCY

**Required behavior:** queue presentation recomposes lower-priority fields on constrained widths while preserving title, current state and row activation.

**Acceptance criterion:** narrow/tablet views remain scan-usable without clipping essential fields or preserving all desktop columns at unreadable widths.

**Failure/negative behavior:** `overflow: hidden`, uncontrolled compression or a desktop-only column layout must not silently hide or destroy queue meaning.

### GW-FR-050-SHARED-ACTION-RESOURCE-GRAMMAR

**Required behavior:** navigation/selection, secondary utility, primary mutation, destructive mutation and resource-opening interactions use consistent reusable affordances across modes.

**Acceptance criterion:** equivalent controls have consistent hierarchy, accessibility and focus behavior, and evidence/artifact resources expose a structured identity plus open action.

**Failure/negative behavior:** raw screen-specific buttons must not create conflicting action priorities or make resource identity/actions materially different between Review, Execution and Evidence entry points.

