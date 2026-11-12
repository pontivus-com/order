# 38 — Workbench component architecture and Astryx integration

**Status:** Binding technical design  
**Canonical concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`  
**Pyramid layer:** P4 technical architecture

## 1. Purpose

This document owns the technical realization of `GW-DOC-WORKBENCH-UX-V1`.

Order retains its existing React/Vite/TanStack Query application architecture and local semantic workbench boundary. It adopts a pinned subset of **Astryx** as an interaction/component implementation dependency where doing so replaces substantial generic accessibility/layout/control machinery without transferring Order domain semantics or information architecture to the library.

The architecture is:

```text
canonical Order state / HTTP contracts
                │
                ▼
Order application composition
WorkItem/lifecycle/execution semantics
                │
                ▼
Order local semantic UI boundary
ui/src/primitives/** + cohesive workspace modules
                │
                ▼
pinned Astryx interaction primitives
                │
                ▼
DOM/CSS
```

Astryx is therefore an implementation substrate, not a product authority, workflow engine, state owner, transport layer or replacement Order design system.

## 2. External dependency boundary

The designed direct UI dependency additions are:

- `@astryxdesign/core` — exact pin owned by `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`;
- `@astryxdesign/theme-neutral` — exact fixed-group pin owned by the same factual snapshot, used only as the supported built theme/icon baseline;
- `@stylexjs/stylex` — exact pin owned by the same factual snapshot because Astryx declares/requires it for the supported package path.

Order uses Astryx's **precompiled distribution**. It does not add `@astryxdesign/build`, a StyleX compiler path, Babel configuration, PostCSS configuration or the Astryx CLI to productive dependencies merely to consume the components.

The existing Vite/Tailwind build remains authoritative.

Astryx is currently beta. Order therefore:

- pins exact versions;
- does not consume canary tags;
- treats upgrades as material dependency/integration changes;
- verifies relied-upon component behavior through browser tests before accepting an upgrade.

## 3. Local ownership boundary

`ui/src/primitives/**` remains Order's project-neutral local UI boundary.

Rules:

1. Order application/workspace modules depend on local semantic primitives when Order adds layout/action/status semantics.
2. Local primitives may compose Astryx primitives.
3. A local wrapper is not created merely to rename an Astryx component with no Order semantic or styling responsibility.
4. Astryx types are not copied into DTO/domain/UI model families.
5. Order canonical types continue to cross application boundaries directly.
6. TanStack Query remains the sole owner of daemon/server state.
7. React/URL component state continues to own presentation-local selection, open drawers, selected document/run/evidence and editor buffers.
8. No Astryx store/context becomes a second workflow/domain state owner.

## 4. Spatial architecture

### 4.1 Wide desktop

At the wide-desktop breakpoint the shell is:

```text
┌──────────────────────────────────────────────────────────┐
│ Order toolbar                                         │
├───────────────────────────────────┬──────────────────────┤
│ primary canvas                    │ context inspector    │
│ flex: 1                           │ 22rem target width   │
│ min-width governed by active mode │ max 24rem           │
└───────────────────────────────────┴──────────────────────┘
```

The inspector is resizable only if the final implementation proves that resizing improves the functional space budget without adding avoidable complexity. Its maximum width remains bounded so it cannot consume review/document space.

### 4.2 Medium viewport

Below the persistent-rail breakpoint, the primary canvas remains full width and contextual information moves to an Astryx `Drawer` or equivalent local primitive backed by it.

The existing behavior that appends the inspector below the primary canvas is removed.

### 4.3 Narrow/mobile

The primary work surface occupies the viewport. Context opens as a temporary full/near-full-width drawer/sheet and closes without losing the primary mode/document/editor buffer.

### 4.4 Presentation navigation and dirty-state boundary

The existing `workItem` URL query parameter remains the sole browser-history identity for selected WorkItem navigation; no routing dependency is introduced.

A pure UI projection chooses the initial mode exactly as specified by `GW-FR-039-WORKSPACE-ENTRY-EXIT-HISTORY`. Mode/document/evidence selection remains React presentation state.

The governed Markdown editor reports dirty state upward through a typed presentation callback. Any transition that would replace the dirty editor is admitted only through one local navigation guard. The guard opens a confirmation `Dialog` (or equivalent Astryx confirmation surface) with Continue editing / Discard unsaved changes; it never invokes the save mutation. Responsive layout/context-drawer transitions do not pass through the destructive-navigation guard because the editor remains mounted.

Focus transfer is explicit presentation behavior: workspace entry focuses the workspace heading/back control, queue return restores the originating row when available, and Astryx Drawer/Dialog focus-return behavior is used rather than reimplemented.

Exact breakpoint values are implementation tokens; the initial design targets approximately:

- persistent rail: >= 1200 px;
- drawer: 800–1199 px;
- single-pane/narrow behavior: < 800 px.

Browser verification must validate behavior rather than merely CSS class presence.

## 5. Astryx component mapping

| Functional surface | Astryx implementation candidates | Order responsibility |
|---|---|---|
| Workbench shell | `Layout`, `Stack`, `ScrollableArea`, optionally `ResizeHandle` | mode ownership, space budgets, toolbar/inspector semantics |
| Medium/narrow context | `Drawer` | what contextual information/actions exist |
| WorkItem queue | `Table`, `StatusDot`, `Badge`, `IconButton` | canonical rows/columns/status mapping |
| Diagnostics | `Table`/ `List`, `Banner`, `StatusDot` | diagnostic meaning/actionability |
| Creation | `Drawer`, `Selector`/`Typeahead`, `RadioList` or `SelectableCard`, `MultiSelector`, `TextInput` | project/type/concern semantics and canonical create mutation |
| WorkItem mode navigation | `TabList` | available modes from canonical state; presentation-only selection |
| Lifecycle document navigation | `TabList` or compact `Outline` | Source/R1/R2/DESIGN/PLAN/R3 ordering/currentness |
| Editable Markdown | `TextArea` within Order editor composition | exact source buffer, dirty/conflict/save semantics |
| Read-only Markdown/raw content | `Markdown`, `CodeBlock`, `ScrollableArea` as appropriate | exact bytes remain canonical; rendering never becomes authority |
| Stage dialogue | `ChatLayout`, `ChatMessage`, `ChatSystemMessage`, `ChatToolCalls`, `ChatComposer` | Run/RunEvent projection and mutation commands |
| Artifact proposal | `Section`, `CodeBlock`, `Toolbar`, `Button` | proposal identity/rationale/disposition |
| Sign-off review | `Section`, `MetadataList`, `Badge`, `TextInput`, `Button` | exact package, source binding, tasks, sign-off command |
| Execution tasks | `Table`/`List`, `Badge`, `StatusDot` | ExecutionTask semantics |
| Runs/validation | `List`, `MetadataList`, `StatusDot`, `ProgressBar` only where semantically honest | Run/RunEvent/V0-V7 state |
| Evidence viewer | `CodeBlock`, `ScrollableArea`, `IconButton` | exact evidence bytes/content type |
| Theme | `SegmentedControl`, icon support | System/Light/Dark browser-local preference |
| Global actions | `Toolbar`, `Button`, `IconButton` | action hierarchy and canonical mutations |
| Notifications | `Banner`, `Toast` | error/blocker semantics; no hidden critical state |

The implementation may choose the smallest Astryx primitive that satisfies the behavior. It must not use a larger composite merely because it exists.

## 6. Explicitly prohibited Astryx use

### 6.1 RichTextEditor

Astryx `RichTextEditor` is prohibited for governed WorkItem/lifecycle documents.

`GW-DOC-MARKDOWN-WORKBENCH-V1` requires the exact Markdown source to remain the editable authority. Order therefore uses a controlled semantic textarea path; Astryx `TextArea` may provide the input primitive, but no Lexical/rich-text/AST representation becomes document authority.

### 6.2 State/transport invention

Astryx chat/streaming-capable components are presentation components only.

They must not introduce:

- provider-token forwarding;
- WebSocket/SSE;
- a new Run/event protocol;
- speculative local workflow events;
- automatic chat-to-Markdown authority;
- a second application state store.

Current HTTP polling and canonical Run/RunEvent behavior remain unchanged unless separately authorized.

### 6.3 Design-system takeover

Order must not:

- import Astryx components ad hoc throughout application composition without the local ownership rules above;
- accept Astryx default page/card grammar where it conflicts with `GW-DOC-WORKBENCH-UX-V1`;
- replace the Order information architecture with an Astryx template;
- let Astryx theme defaults redefine Order lifecycle/status meaning;
- adopt unrelated components merely to increase library usage.

## 7. Theme and icon integration

Order retains one visual identity and one semantic icon vocabulary.

### 7.1 Theme provider and preference ownership

The supported integration uses Astryx's built CSS/theme distribution rather than source compilation.

Exactly one root Astryx `Theme` provider wraps the workbench using the pinned `neutralTheme` built export. Order's existing browser-local preference remains the single preference owner and is passed directly as Astryx `mode="system" | "light" | "dark"`.

Astryx's root Theme is the ongoing owner of root `data-theme` and `data-astryx-theme` synchronization. The current independent React-time DOM theme mutation path is removed so two runtime owners cannot race. A minimal pre-render bootstrap may set the stored explicit `data-theme` before React mounts solely to avoid first-paint flash; it must read the same storage key/value and the Theme provider immediately becomes authoritative after mount.

System mode remains represented by absence of a root `data-theme` override and follows `prefers-color-scheme`. Explicit Light/Dark remain the only persisted overrides.

Order's `ui/src/theme.css` remains the final owner of application visual identity by overriding the Astryx semantic surface/text/border/accent/status/radius/typography tokens required by the workbench in light/dark/system modes. It must not create a second Astryx theme object or another preference.

The neutral theme's optional `fonts.css` / Google-hosted Figtree font is **not imported**. Order retains its system font stack unless a separate local-font decision is authorized.

### 7.2 Icons

Astryx's theme/icon mechanism becomes the generic icon implementation source.

Order defines one local semantic icon map for the meanings required by `GW-FR-038-ICON-AND-ACTION-SEMANTICS`, including at minimum:

- add;
- refresh;
- search;
- copy;
- system/light/dark;
- CHANGE/DEFECT/INVESTIGATION/AUDIT;
- source/document/design/plan/readiness;
- lock/read-only;
- dialogue/tool;
- diff/review;
- success/warning/failure;
- evidence;
- investigation/audit result.

Application modules request semantic Order meanings; they do not select arbitrary glyphs independently.

### 7.3 CSS cascade and Tailwind coexistence

The consumer uses the pinned precompiled CSS path. `ui/src/styles.css` declares the cascade layer order before imports and then imports, in this order:

```css
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;
@import "tailwindcss";
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
/* Order local composition CSS, if retained */
@import "./theme.css";
```

No Astryx build plugin, Babel plugin, PostCSS path or CLI-generated runtime layer is added.

`@astryxdesign/core/tailwind-theme.css` is not required merely to consume Astryx. If P7 can remove existing ad-hoc Tailwind color utilities as surfaces move to Astryx primitives, it should do so rather than introduce another semantic color bridge. Order layout utilities may remain where they do not duplicate Astryx component behavior.

Local Order CSS comes after the Astryx layers and owns only the residual workbench composition/theme differences required by `GW-DOC-WORKBENCH-UX-V1`.

## 8. Markdown editor architecture

The existing editor responsibility remains cohesive:

```text
canonical snapshot
    ↓
Order Markdown editor state
    ↓
Astryx TextArea
    ↓
expected-hash save command
    ↓
canonical refetch / conflict recovery
```

Requirements:

- exact Markdown string remains the buffer;
- no HTML/rich-text normalization;
- dirty state remains local;
- stale save preserves the unsaved buffer;
- Cancel restores the loaded canonical snapshot;
- Reload current is explicit after conflict;
- the editor consumes primary-canvas height and is not embedded in the inspector.

Read-only rendering may use Astryx `Markdown` for canonical Markdown legibility only when the exact source/raw bytes remain available and rendering is never used as mutation authority. The pinned Astryx Markdown parser does not expose raw HTML as executable markup; Order nevertheless retains browser XSS regression coverage.

Arbitrary evidence/log/patch bytes are **not** sent through Markdown rendering merely because they are textual. They remain escaped read-only text/`CodeBlock` content so evidence cannot acquire markup semantics.

## 9. Dialogue architecture

Order projects canonical RunEvents into Astryx chat components.

Example presentation mapping:

| Canonical event/material | Presentation |
|---|---|
| agent final message | `ChatMessage` |
| human input requested | system/request message + focused composer |
| human input received | operator `ChatMessage` |
| tool/evidence activity | `ChatToolCalls` or compact structured event |
| stage status | `ChatSystemMessage` / status strip |
| artifact proposal | dedicated Order proposal review block, not flattened into plain chat |

The chat component tree is derived presentation. It does not persist an alternate conversation model.

## 10. Queue/create/control architecture

The current text-select-heavy creation surface is replaced according to `GW-FR-034-SEMANTIC-CONTROL-AFFORDANCES`:

- project: `Selector` or `Typeahead`;
- WorkItem type: `RadioList` or compact `SelectableCard` group with semantic icon + label;
- concerns: `MultiSelector` or equivalent searchable multi-choice control;
- title: `TextInput`;
- appearance: `SegmentedControl` with System/Light/Dark icons/labels.

The browser continues to consume the existing canonical project/schema/concern catalogs. No local duplicated option tables are introduced.

## 10.1 Terminal result projection

The Result workspace handles every terminal non-delivery outcome defined by `GW-FR-039-WORKSPACE-ENTRY-EXIT-HISTORY`: `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED`, `INVESTIGATION_COMPLETE`, and `AUDIT_COMPLETE`. Only the investigation/audit outcomes receive the existing linked-remediation control.

`CANDIDATE_DONE` remains in the Execution/candidate inspection workspace rather than being projected into the non-delivery Result surface.

## 11. Module decomposition

The current `WorkItemWorkspace.tsx` and `ExecutionInspector.tsx` combine distinct presentation responsibilities that the new functional design separates.

P7 should forecast a same-layer decomposition approximately along these responsibilities:

- WorkItem shell/navigation;
- compact WorkItem context inspector;
- document workspace/editor;
- stage dialogue/proposal review;
- sign-off review;
- execution workspace;
- evidence viewer;
- terminal result view;
- creation surface.

Exact filenames are P7 concerns, but no resulting module may own multiple unrelated present responsibilities merely to minimize file count.

`app.tsx` remains composition/router-like browser presentation orchestration; it must not absorb the detailed workspace implementations.

## 12. Replacement/deletion obligations

Implementation is incomplete if it adds Astryx while retaining conflicting duplicate paths.

The final implementation must remove or replace:

- the complete WorkItem workspace mounted as `WorkbenchLayout.inspector`;
- inspector-contained Markdown editors;
- inspector-contained proposal diff/evidence viewers;
- inspector-contained sign-off package/task review;
- inspector-contained execution task/run/evidence workspace;
- the below-main inspector fallback on medium widths;
- Theme text `<select>`;
- WorkItem-type text `<select>`;
- native `<select multiple>` concerns control;
- duplicate custom primitive behavior that Astryx now canonically supplies, where removal does not erase Order semantics.

Existing custom primitives that continue to own Order-specific semantics/layout may remain and compose Astryx.

## 13. Verification contract

Permanent browser verification must cover:

1. selecting a WorkItem changes the primary canvas and leaves only compact context in the inspector;
2. source/lifecycle editors are primary-canvas surfaces with usable width/height;
3. proposal diff, sign-off package, execution state and evidence are not rendered inside the compact inspector;
4. medium/narrow layouts use drawer/single-pane behavior and never append the complete inspector below the active task;
5. unsaved Markdown survives allowed presentation changes and responsive transitions;
6. System/Light/Dark uses the direct semantic control and preserves existing persistence behavior;
7. WorkItem type uses direct icon+label single-choice controls;
8. concerns use a multi-choice control rather than native multi-select;
9. project remains catalog-driven;
10. icon-only utility actions expose accessible names;
11. Run/RunEvent polling semantics remain unchanged;
12. no rich-text editor, WebSocket/SSE or second browser state store exists;
13. dark/light rendering remains complete after Astryx integration;
14. dependency-lock/typecheck/architecture/test/build/browser gates pass;
15. root Astryx Theme mode stays synchronized with the existing System/Light/Dark preference and no second runtime theme owner remains;
16. CSS imports/cascade follow §7.3 with no Astryx build/CLI dependency;
17. URL refresh/deep-link and browser Back/Forward preserve queue/WorkItem selection;
18. dirty-document navigation is blocked until explicit discard or continued editing;
19. keyboard/focus transitions follow `GW-FR-041-KEYBOARD-FOCUS-CONTINUITY`;
20. every workspace mode exposes loading/empty/error states;
21. terminal `DISPROVEN`, `DUPLICATE`, `ALREADY_SATISFIED`, investigation/audit and `CANDIDATE_DONE` presentations route to the correct owning mode;
22. canonical Markdown rendering and arbitrary raw evidence remain non-executable, retaining the XSS regression.

Architecture tests must continue to enforce:

- no class/service/repository/controller/DTO architecture;
- UI import restrictions;
- TanStack Query server-state ownership;
- no prohibited rich-text/editor dependency;
- the authorized Astryx dependency surface only.

## 14. Technical requirements

### GW-TR-009-WORKBENCH-SPATIAL-ARCHITECTURE

**Required behavior:** Order implements `GW-DOC-WORKBENCH-UX-V1` as primary-canvas working modes plus a bounded compact contextual inspector/drawer.

**Acceptance criterion:** long-form/review/evidence content is physically composed in the primary workspace and the rail remains within the compact-context budget.

**Failure/negative behavior:** the complete WorkItem workspace must not be technically mounted into an inspector component.

### GW-TR-010-ASTRYX-INTERACTION-BOUNDARY

**Required behavior:** the pinned Astryx core is used selectively behind Order's semantic/composition ownership for generic layout, control, accessibility, chat and presentation mechanics.

**Acceptance criterion:** Order state/types/actions remain canonical and Astryx components receive already-resolved presentation data/actions.

**Failure/negative behavior:** Astryx must not become a domain model, workflow state store, transport, page-information-architecture owner or replacement application framework.

### GW-TR-011-ASTRYX-THEME-ICON-INTEGRATION

**Required behavior:** Astryx built CSS/theme/icon infrastructure is integrated beneath Order-owned light/dark visual tokens and semantic icon mapping.

**Acceptance criterion:** existing Order appearance semantics remain intact, no external font request is required, and one icon meaning is rendered consistently.

**Failure/negative behavior:** Astryx defaults must not silently redefine Order visual/state semantics or introduce an independent theme preference.

### GW-TR-012-WORKBENCH-RESPONSIVE-COMPONENT-ARCHITECTURE

**Required behavior:** persistent rail, drawer and narrow single-pane variants implement the responsive continuity defined by `GW-FR-033-RESPONSIVE-WORKSPACE-CONTINUITY`.

**Acceptance criterion:** the active primary task remains the viewport owner at every supported width and context can be opened/closed without domain mutation.

**Failure/negative behavior:** context must not be appended below the active work merely because the rail breakpoint is crossed.

### GW-TR-013-ASTRYX-THEME-CASCADE-INTEGRATION

**Required behavior:** one root Astryx Theme consumes Order's existing System/Light/Dark preference and the precompiled Astryx CSS participates in the exact cascade defined by §7.

**Acceptance criterion:** root theme attributes, portal/theme scope, dark/light/system appearance, first-paint behavior and Order token overrides remain consistent without a second runtime preference/theme owner.

**Failure/negative behavior:** implementation must not retain competing theme mutation paths, import the optional remote font, or add Astryx source-build tooling.

### GW-TR-014-WORKSPACE-PRESENTATION-NAVIGATION-SAFETY

**Required behavior:** WorkItem URL/history selection, deterministic mode projection, dirty-buffer admission and focus transfer are implemented as typed browser presentation behavior above unchanged canonical HTTP/domain state.

**Acceptance criterion:** the behaviors required by `GW-FR-039-WORKSPACE-ENTRY-EXIT-HISTORY`, `GW-FR-040-UNSAVED-MARKDOWN-NAVIGATION-SAFETY`, `GW-FR-041-KEYBOARD-FOCUS-CONTINUITY` and `GW-FR-042-WORKSPACE-STATE-FEEDBACK` pass browser verification without a router/global store.

**Failure/negative behavior:** navigation must not mutate lifecycle state, lose dirty buffers silently, create a second state owner, or require a transport/domain contract change.

## 15. Rejected alternatives

1. **Keep the current inspector and only widen it** — rejected because documents/diffs/evidence still compete with status/action content and the information architecture remains wrong.
2. **Use Astryx templates wholesale** — rejected because Order owns the workbench semantics and spatial model.
3. **Replace all local primitives with direct Astryx imports** — rejected because Order still needs a semantic/local ownership boundary.
4. **Continue hand-building every accessible interaction** — rejected because it duplicates substantial generic behavior already available in the selected component set.
5. **Use Astryx RichTextEditor** — rejected by exact Markdown-source authority.
6. **Add live streaming transport because Chat components support it** — rejected because presentation capability does not authorize protocol/state changes.
7. **Use the Astryx source-build/StyleX compiler path** — rejected as unnecessary for the precompiled consumer integration.

## 16. Downstream P7 obligations

A P7 implementation plan must:

- materialize this cumulative UX/UI replacement as **one Order ExecutionTask with ordered internal implementation phases**, because `GW-DOC-TECHNICAL-ARCHITECTURE-V1` §11 does not compose dependent task candidate workspaces;
- enumerate the exact Astryx pins from the current external-facts snapshot;
- identify the exact existing custom primitives/modules to retain, adapt, replace or delete;
- define dependency order so shell/layout and local primitive integration land before workspace decomposition;
- include architecture feedback after the dependency/primitive boundary is established;
- preserve all canonical API/domain contracts unless a separate P6 change is proven necessary;
- include permanent browser coverage for every changed interaction class;
- forecast package/lockfile, UI, tests and documentation surfaces explicitly;
- implement and verify the root Astryx Theme/cascade contract rather than retaining dual theme owners;
- preserve the existing WorkItem URL/history contract and add the local dirty-navigation/focus behavior without a router/global store;
- retain safe escaped rendering for arbitrary evidence and the existing XSS regression;
- stop if implementation requires a new daemon/HTTP semantic contract, new state owner or rich-text authority.

## 17. Improvement addendum — interaction-pattern technical realization (2026-11-12)

This addendum is the P4 realization of `GW-DOC-WORKBENCH-UX-V1` §§19-20. It refines the current React/Astryx presentation architecture only. It does not authorize daemon/HTTP/domain changes, a new router/global store, rich-text authority, new lifecycle semantics or a second UI framework.

### 17.1 Shell and primary-canvas sizing

The WorkItem shell must use a viewport-sized flex/grid composition in which:

- application/workspace chrome occupies only intrinsic compact rows;
- the primary mode canvas is `min-width: 0`, `min-height: 0` and owns remaining width/height;
- wide Context remains bounded to the existing compact-context budget and is removed from flow below the rail breakpoint;
- primary-mode workspaces may establish their own internal master/detail grids but must not introduce another persistent outer rail;
- document/evidence/execution bodies use flex/grid remaining-height ownership rather than fixed `min-height` values as the main sizing mechanism.

The current `.order-markdown-editor { max-width: 72rem; }` outer cap must be removed or relocated to read-only prose content only. Full-width authoring/review/raw-material surfaces retain modest workstation gutters rather than centered page-width containers.

### 17.2 Compact WorkItem toolbar and navigation

`WorkItemWorkspace` keeps one compact orientation/navigation header that owns:

- Back to work queue;
- WorkItem title;
- concise stage/status orientation;
- the mode selector/control;
- Context toggle only in drawer/single-pane layouts.

Detailed project/schema/concern/source metadata remains in `WorkItemContext`.

The full-width mode `TabList` must not remain stacked above the Documents `TabList`. P7 may use an Astryx segmented/navigation/selector primitive or a small Order semantic wrapper, but mode choice remains typed browser-local presentation state and must preserve the existing dirty-navigation guard.

Documents retain their Source/R1/R2/DESIGN/PLAN/R3 content navigation as the normal content-edge strip.

### 17.3 State-aware application toolbar

`app.tsx` may retain one toolbar composition owner, but toolbar content must be derived from the current presentation state:

- queue state exposes queue Search and Refresh sources;
- selected-WorkItem state removes or demotes queue-only controls;
- New WorkItem remains reachable but may use a compact global action in deep-work state;
- appearance moves to a compact utility/menu/icon treatment while preserving the existing System/Light/Dark preference and `pontivus-order-theme` persistence.

No new global browser store is introduced. Existing React state is sufficient.

### 17.4 Markdown workspace realization

`DocumentWorkspace` + `MarkdownEditor` implement one reusable full-canvas authoring shell:

- the document navigation row is compact;
- the editor wrapper fills available width;
- the textarea/control grows to the remaining height of the mode canvas;
- editor actions/state use a sticky or otherwise persistently reachable compact action bar;
- exact hash/path metadata is available through secondary metadata/context disclosure rather than forcing a wide/tall primary heading;
- read-only `Markdown` retains a ~readable-prose inner content width while its outer container remains full-canvas;
- stale/conflict and dirty-buffer semantics remain unchanged.

This is a presentation-only change; save contracts and expected-hash behavior remain canonical and unchanged.

### 17.5 Proposal-review realization

`StageDialogue` continues to render the persisted proposal event in conversation, but the full proposal review must use Review-class primary space.

P7 must implement a typed presentation selection that can open proposal review without changing Run/RunEvent/domain state. The review surface contains:

- target identity;
- rationale;
- full-width diff/code viewer using remaining height where practical;
- current disposition;
- explicit Adopt/Reject controls.

The existing proposal mutation APIs remain unchanged. The proposal's diff must no longer be limited by the current chat-bubble `maxHeight="28rem"` treatment as its only substantive review surface.

### 17.6 Sign-off review realization

`SignoffReview` remains a primary Review workspace.

Implementation should replace identity-card-style layout for package hash/source binding/baseline with a compact metadata list/strip/disclosure. The visual priority is:

1. package currentness/blockers;
2. governed documents;
3. signed task objective/scope/gates;
4. exact identity metadata.

Repeated tasks use a compact selectable/expandable list/table or equivalent scan-efficient treatment rather than unbounded stacked cards when multiple tasks exist. Approver input and final sign-off action remain in Context where the complete review surface is simultaneously visible.

### 17.7 Execution master/detail realization

`ExecutionWorkspace` becomes a bounded operational layout rather than a long vertical page:

- task summaries use a compact selector/list/table;
- selected task/operational summary occupies only the detail needed for orientation;
- Run selection remains a compact master list;
- selected Run/event timeline receives the flexible remaining region;
- task/Run/event regions must not be separated by arbitrary vertical card stacks;
- artifact/evidence references use a shared structured resource-row/list primitive or semantic component;
- opening evidence continues to move the primary canvas into Evidence mode.

The current `15rem + minmax(0, 1fr)` Run/detail concept may be retained, but it must participate in remaining-height layout rather than sit below all task cards.

### 17.8 Queue responsive realization

`WorkItemQueue` remains table-like on wide operational widths. Below the width where all columns remain useful, P7 must recompose lower-priority data rather than depend on uncontrolled table compression.

Acceptable implementation shapes include:

- responsive column hiding plus secondary metadata inside the WorkItem cell; or
- an Astryx/local compact row/list presentation below the breakpoint.

Title, stage/status and row activation remain immediately available. Project/kind remain discoverable. Concerns and utilities may move to secondary row content. The queue container must not use clipping as a substitute for responsive composition.

### 17.9 Shared action/resource primitives

P7 should extend existing Order semantic primitives only where they remove repeated divergent presentation behavior.

At minimum:

- recurring mutations/utilities continue through `WorkbenchAction` or a same-owner extension;
- Run/task/resource selection uses a consistent selected-state treatment;
- evidence/artifact resources use one small structured row/list primitive where repeated;
- raw `<button>` use is retained only where native semantics are intentionally sufficient and it does not create another action hierarchy.

This does not authorize a generic design-system abstraction layer.

### 17.10 Compact terminal/loading presentation

`TerminalResult` uses a compact outcome header; investigation/audit material remains the substantive content below it. Decorative vertical margin must not materially reduce evidence space.

Each primary mode retains its owning shell while loading/error/empty content changes. Loading placeholders fill or preserve the expected workspace region rather than collapsing the mode into a small unrelated block.

### 17.11 CSS/layout deletion obligations

The implementation package must remove or supersede conflicting rules rather than layer new exceptions over them, including as applicable:

- the outer `.order-markdown-editor max-width: 72rem` authoring cap;
- the `.order-markdown-textarea min-height: 34rem` rule as the primary height strategy;
- stacked full-width WorkItem-mode + document navigation;
- always-visible Context action on persistent-rail layouts;
- queue `overflow: hidden` behavior that clips constrained content;
- page-like spacing that exists only to compensate for the old stacked chrome;
- proposal diff height constraints that make chat the only usable review surface;
- execution task-card stacking that blocks access to the Run/event workspace.

Do not retain old and new spatial grammars simultaneously.

### 17.12 Permanent browser geometry verification

Browser verification must assert observable geometry/behavior, not only element presence.

At representative widths/heights it must prove:

1. editable Markdown width closely tracks the available primary canvas rather than a centered 72rem cap;
2. editor/evidence/operational bodies consume the remaining usable viewport height within reasonable toolbar/nav gutters;
3. Documents does not render stacked full-width mode and document tab rows;
4. queue Search/Refresh are absent or demoted from active deep-work toolbar state;
5. Context toggle is absent when the persistent Context rail is already visible and present when Context is drawer-owned;
6. proposal diff review opens in Review-class primary space and remains associated with its Adopt/Reject actions;
7. multiple execution tasks do not push Run/event detail below an arbitrarily long card stack;
8. narrow queue presentation keeps title and stage/status visible without clipped essential content;
9. sticky/reachable editor actions remain available while editing long Markdown;
10. loading states preserve the owning mode's spatial shell;
11. existing dirty-buffer, focus, URL/history, light/dark, XSS and read-only execution regressions continue to pass.

Tests should compare bounding boxes/visibility or equivalent stable geometry signals where appropriate; they must avoid pixel-perfect screenshot coupling to incidental styling.

## 18. Addendum technical requirements

### GW-TR-015-PRIMARY-CANVAS-FLEX-SIZING

**Required behavior:** primary workspaces use intrinsic compact chrome plus flexible remaining-width/height task regions.

**Acceptance criterion:** Markdown authoring, raw evidence, proposal diff review and operational detail use the available canvas; only inner prose rendering retains a readable line-length cap.

**Failure/negative behavior:** fixed/max-width page containers or fixed/minimum-height substitutes must not leave substantial usable primary-canvas area idle.

### GW-TR-016-COMPACT-WORKITEM-NAVIGATION

**Required behavior:** WorkItem mode navigation is integrated into the compact WorkItem toolbar/header while Documents retains its own within-mode document navigation.

**Acceptance criterion:** the active Documents surface presents one normal content-edge navigation strip and preserves existing typed mode/document state, dirty guards and focus behavior.

**Failure/negative behavior:** full-width mode tabs must not remain stacked directly above full-width document tabs.

### GW-TR-017-STATE-AWARE-TOOLBAR-COMPOSITION

**Required behavior:** application-toolbar contents are projected from queue versus selected-WorkItem presentation state.

**Acceptance criterion:** queue-only Search/Refresh controls do not remain prominent while the queue is hidden; creation remains reachable; appearance is compact; no domain/global-store change is introduced.

**Failure/negative behavior:** persistent controls must not imply an actionable scope that is absent from the visible primary canvas.

### GW-TR-018-PROPOSAL-REVIEW-PRIMARY-SURFACE

**Required behavior:** proposal events remain part of Dialogue history while full rationale/diff/disposition review is renderable in Review-class primary space.

**Acceptance criterion:** the proposal can be opened from conversation, inspected at full review width/height and adopted/rejected through the existing mutation boundary.

**Failure/negative behavior:** a chat bubble with a fixed-height diff must not remain the sole substantive proposal-review surface.

### GW-TR-019-EXECUTION-MASTER-DETAIL-LAYOUT

**Required behavior:** Execution uses compact task and Run masters plus a flexible selected operational detail/event region.

**Acceptance criterion:** multiple tasks/runs remain scan-efficient, the active event timeline receives remaining workspace height, and resource references use structured rows/lists.

**Failure/negative behavior:** repeated task cards must not create an unbounded vertical preamble before Run/event inspection.

### GW-TR-020-RESPONSIVE-QUEUE-COMPOSITION

**Required behavior:** WorkItem queue columns/secondary fields recompose below operational-table width.

**Acceptance criterion:** title and stage/status remain visible and usable on narrow/tablet viewports without clipping essential meaning.

**Failure/negative behavior:** `overflow: hidden` or uncontrolled table compression must not be relied upon as the responsive strategy.

### GW-TR-021-SHARED-ACTION-RESOURCE-PRESENTATION

**Required behavior:** recurring actions and evidence/artifact resources use Order-owned shared semantic presentation primitives where doing so removes divergent screen-local behavior.

**Acceptance criterion:** selection, utility, primary/destructive mutation and resource-opening affordances remain consistent and accessible across Review, Execution, Evidence entry points and Documents.

**Failure/negative behavior:** the remediation must not create a generic abstraction layer, DTO/view-model family or second design system merely to normalize controls.

### GW-TR-022-GEOMETRY-REGRESSION-CERTIFICATION

**Required behavior:** permanent browser tests certify the interaction-space invariants in §17.12 in addition to existing semantic/browser regressions.

**Acceptance criterion:** representative wide, medium and narrow viewport runs prove primary-canvas utilization, navigation/chrome economy, responsive queue behavior, reachable authoring actions and stable mode shells.

**Failure/negative behavior:** presence-only tests must not be treated as sufficient evidence that space allocation and interaction-pattern realization remain correct.

