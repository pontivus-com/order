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
| WorkItem mode navigation | compact `SegmentedControl`/selector/navigation primitive or Order semantic wrapper | available modes from canonical state; presentation-only selection integrated into the compact WorkItem toolbar/header |
| Lifecycle document navigation | `TabList` or compact `Outline` | Source/R1/R2/DESIGN/PLAN/R3 ordering/currentness |
| Editable Markdown | Order-owned `MarkdownSourceEditor` backed by CodeMirror 6 | exact source buffer, editor lifecycle, syntax-aware source editing; dirty/conflict/save semantics remain in `MarkdownEditor` |
| Read-only Markdown/raw content | `Markdown`, `CodeBlock`, `ScrollableArea` as appropriate | exact bytes remain canonical; rendering never becomes authority |
| Stage dialogue | `ChatLayout`, `ChatMessage`, `ChatSystemMessage`, `ChatToolCalls`, `ChatComposer` | Run/RunEvent projection and mutation commands |
| Artifact proposal | `Section`, `CodeBlock`, `Toolbar`, `Button` | proposal identity/rationale/disposition |
| Sign-off review | `Section`, `MetadataList`, `Badge`, `TextInput`, `Button` | exact package, source binding, tasks, sign-off command |
| Execution tasks | `Table`/`List`, `Badge`, `StatusDot` | ExecutionTask semantics |
| Runs/validation | `List`, `MetadataList`, `StatusDot`, `ProgressBar` only where semantically honest | Run/RunEvent/V0-V7 state |
| Evidence viewer | `CodeBlock`, `ScrollableArea`, `IconButton` | exact evidence bytes/content type |
| Theme | compact menu/utility control with icon support; `SegmentedControl` permitted only where it does not consume persistent premium toolbar width | System/Light/Dark browser-local preference |
| Global actions | `Toolbar`, `Button`, `IconButton` | action hierarchy and canonical mutations |
| Notifications | `Banner`, `Toast` | error/blocker semantics; no hidden critical state |

The implementation may choose the smallest Astryx primitive that satisfies the behavior. It must not use a larger composite merely because it exists.

## 6. Explicitly prohibited Astryx use

### 6.1 RichTextEditor

Astryx `RichTextEditor` is prohibited for governed WorkItem/lifecycle documents.

`GW-DOC-MARKDOWN-WORKBENCH-V1` requires the exact Markdown source to remain the editable authority. Order therefore uses a controlled exact-source editor path. CodeMirror may provide source-editing mechanics, but no Lexical/rich-text/AST/editor-state representation becomes document authority.

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
- appearance: compact utility/menu/icon treatment preserving explicit System/Light/Dark semantics; a `SegmentedControl` is acceptable only when its placement does not consume persistent premium toolbar width.

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
- the exact-source editor grows to the remaining height of the mode canvas;
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


### 17.13 UI architecture discipline: SoC, semantic DRY, strict typing and loose coupling

The spatial refactor must preserve the same P1 engineering constitution as the rest of Order. UI code is not exempt from `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP` or `GW-P1-EXPLICIT-FLOW`.

#### Responsibility ownership

Each production UI module owns one current presentation responsibility:

- `app.tsx` owns application-shell composition, queue-vs-WorkItem selection, URL selection, global presentation preference and top-level query/mutation orchestration only;
- `WorkItemWorkspace.tsx` owns selected-WorkItem presentation composition, mode selection, dirty-navigation admission and cross-mode presentation navigation only;
- each workspace module owns only its substantive interaction class;
- `MarkdownEditor.tsx` owns only exact editor-buffer/dirty/save/cancel/conflict presentation behavior;
- `ui/src/http.ts` owns browser HTTP transport/parsing only and must not become a presentation-policy or domain-policy owner;
- `ui/src/primitives/**` owns repeated Order UI semantics/layout mechanics only and must not own WorkItem lifecycle/domain policy.

If a module would acquire a second independently testable present responsibility during this refactor, P7 must perform the minimum same-layer decomposition rather than grow a catch-all component.

#### Canonical semantic ownership and DRY

UI modules consume canonical browser-safe Order contracts and policy functions directly where those semantics already have an owner.

The UI must not introduce:

- DTO/view-model/domain copies of WorkItem, Run, ExecutionTask, ArtifactRef, status, stage, outcome or other canonical semantic shapes;
- duplicated stage/status/outcome ordering, editability, sign-off, remediation or lifecycle policy in component-local switches when a canonical owner already exists;
- repeated screen-local mappings for the same semantic presentation rule when one cohesive pure presentation owner can serve them;
- duplicate query/cache/state representations of daemon-owned state.

Presentation-only values are legitimate when they represent **presentation state rather than domain meaning**, for example selected workspace mode, selected document, selected Run/evidence item, drawer visibility, dirty state or a resource-row visual variant. Such values remain local, typed and derived from canonical state; they do not become a parallel semantic model.

DRY is applied by **semantic ownership**, not by extracting every repeated JSX fragment. A shared primitive/helper is introduced only when the repeated behavior has one stable presentation meaning. Similar-looking markup with different semantics may remain separate.

#### Strict typed presentation boundaries

Meaningful UI boundaries use explicit static types.

Required rules:

- props and callbacks carry canonical types/IDs or small explicit presentation-only tagged unions;
- callbacks express semantic intent rather than passing untyped event/shape bags between owners;
- browser HTTP ingress is parsed/narrowed by the canonical contract boundary before workspace modules consume the value;
- no `any`, unchecked shape guessing, stringly typed lifecycle reconstruction or assertion-based coercion may substitute for a canonical type;
- `unknown` may exist only at genuine external/error ingress and must be narrowed before semantic use;
- component-local mode/selection unions are exhaustive and remain presentation-only;
- type-only imports are preferred when only a type dependency exists.

A typed presentation selection such as evidence/proposal selection is not a DTO when it contains only browser-local navigation identity and does not duplicate a canonical domain record.

#### Loose coupling and dependency direction

UI modules communicate through narrow typed data/callback boundaries and explicit composition.

- parent/composition owners may depend on child workspace modules;
- workspace siblings must not coordinate by importing each other's internal state or mutation implementation;
- cross-workspace navigation is requested upward through typed callbacks/presentation selections owned by the composition boundary;
- server state remains in TanStack Query; components must not mirror canonical server collections into a second persistent React store;
- presentation state lives at the lowest owner that must coordinate it and is lifted only when multiple child surfaces genuinely require the same state;
- generic Astryx components remain implementation dependencies, not state/semantic owners;
- circular UI dependencies are prohibited;
- a shared helper/primitive must not import a substantive workspace module;
- direct sibling imports are permitted only for a genuine cohesive child/subcomponent relationship, not as a shortcut for cross-workspace coordination.

Loose coupling does not mean adding interfaces, service objects, dependency-injection containers or wrapper layers. The preferred boundary is explicit typed function/prop composition over canonical data.

#### Pure presentation projections

Non-trivial derived presentation logic should be expressed as small pure functions colocated with its semantic presentation owner or, when reused with exactly the same meaning, in one shared presentation helper.

Examples include:

- canonical state -> available workspace modes;
- canonical status -> semantic badge/action presentation;
- RunEvent -> human-readable event detail/evidence links;
- canonical resource -> shared resource-row presentation.

These functions must not persist alternate state, reinterpret domain rules, or manufacture DTO/view-model families.

#### Architecture fitness obligations

The P7 refactor must extend the existing permanent architecture sensor where the current mechanical checks are insufficient. At minimum it must mechanically protect:

- the required cohesive UI owner set;
- no class/service/repository/controller/DTO/view-model architecture in UI production code;
- no `any` or unchecked semantic casts/shape guessing at UI boundaries;
- canonical lifecycle/policy functions are consumed rather than locally reimplemented where mechanically identifiable;
- no circular or unauthorized sibling-workspace dependency path;
- TanStack Query remains the sole server-state owner;
- `app.tsx` and `WorkItemWorkspace.tsx` do not reclaim substantive workspace responsibilities;
- primitives do not import substantive workspace modules or domain orchestration;
- no second UI state/store/framework owner is introduced.

Architecture tests should enforce stable ownership/dependency propositions, not freeze incidental JSX structure or exact line/file counts.

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

### GW-TR-023-UI-SEPARATION-OF-CONCERNS

**Required behavior:** each UI production module remains cohesive to one current presentation responsibility, with application/workspace composition separated from substantive workspace behavior, transport and reusable primitives.

**Acceptance criterion:** `app.tsx`, `WorkItemWorkspace.tsx`, workspace modules, `MarkdownEditor.tsx`, `ui/src/http.ts` and primitives retain the ownership boundaries in §17.13; any new independently testable responsibility is decomposed at the same layer rather than accumulated in a catch-all.

**Failure/negative behavior:** the spatial refactor must not concentrate unrelated queue, navigation, document, review, execution, transport or domain-policy responsibilities into one component/module merely to minimize file count.

### GW-TR-024-UI-CANONICAL-SEMANTIC-OWNERSHIP

**Required behavior:** UI code consumes canonical Order semantic types/policy owners and shares repeated presentation semantics through one cohesive owner without creating parallel semantic representations.

**Acceptance criterion:** no DTO/view-model/domain copies, duplicate lifecycle policy tables, duplicate daemon-state caches or screen-local copies of the same presentation rule are introduced; presentation-only state remains explicitly local and derived.

**Failure/negative behavior:** DRY must not be implemented by either duplicating canonical meaning across screens or by creating a generic abstraction layer that erases distinct semantics.

### GW-TR-025-UI-STRICT-TYPED-BOUNDARIES

**Required behavior:** props, callbacks, selections and browser-ingress values use canonical types or explicit small presentation-only tagged unions with exhaustive narrowing.

**Acceptance criterion:** UI production code contains no `any`, unchecked semantic casts, lifecycle/status shape guessing or stringly reconstruction at meaningful boundaries; external `unknown` values are narrowed before use.

**Failure/negative behavior:** type assertions, mapper-owned DTO shapes or untyped event/shape bags must not be used to bypass canonical contracts or avoid modelling a real presentation state explicitly.

### GW-TR-026-UI-LOOSE-COUPLING-DEPENDENCY-DIRECTION

**Required behavior:** UI owners communicate through narrow typed props/callbacks and explicit parent composition with server state owned only by TanStack Query and presentation state owned by the lowest coordinating component.

**Acceptance criterion:** workspace siblings do not coordinate through each other's internal modules/state, primitives do not depend on substantive workspaces, circular dependencies are absent, and cross-mode navigation is requested through the owning composition boundary.

**Failure/negative behavior:** loose coupling must not be simulated through service objects, dependency-injection containers, global stores, wrapper proliferation or cross-module internal-state imports.

## 19. Technical addendum — CodeMirror exact-source Markdown editor (2026-11-13)

This addendum realizes `GW-DOC-MARKDOWN-WORKBENCH-V1` §§17-18 inside the existing React/Astryx workbench architecture.

The selected editor substrate is **CodeMirror 6**. CodeMirror is used only as an ephemeral browser source-editor engine. The canonical persisted value remains the Markdown `string`.

### 19.1 Dependency decision

Order adds exactly these direct runtime dependencies:

```text
codemirror                    6.0.2
@codemirror/lang-markdown    6.5.2
@codemirror/language         6.13.1
@codemirror/commands         6.11.1
@codemirror/state            6.7.6
@lezer/highlight             1.2.5
```

`@codemirror/language` is a deliberate direct dependency because Order imports `HighlightStyle` / `syntaxHighlighting` for its owned Markdown syntax theme. `@codemirror/commands` is a deliberate direct dependency because toolbar Undo/Redo invoke the canonical CodeMirror history commands. `@codemirror/state` is a deliberate direct dependency because the source-editor owner uses `Compartment` to reconfigure editability without rebuilding editor state. `@lezer/highlight` is a deliberate direct dependency because Order imports semantic highlight tags for that same theme. Although these are reachable transitively through CodeMirror packages, Order does not directly import undeclared transitives.

The `codemirror` package supplies the supported CodeMirror 6 basic editor configuration and typed editor APIs through its dependency graph. `@codemirror/lang-markdown` supplies Markdown language support and Markdown-specific key behavior.

Order does not add:

- `@uiw/react-codemirror`;
- Monaco;
- ProseMirror;
- Lexical;
- MDXEditor;
- Milkdown;
- another Markdown renderer;
- another React state store.

The direct integration is intentionally small so Order owns one editor boundary rather than depending on a wrapper's state/lifecycle abstraction.

### 19.2 Cross-application reference and adopted pattern

A prior Markdown-document editor implementation was inspected before this design.

Its Markdown-document editor is currently **ProseMirror-based**, with:

- `useMarkdownDocumentEditor.ts` owning EditorView mount/destroy, editability, external Markdown synchronization and command dispatch;
- feature-specific editor components owning toolbar/presentation;
- `markdown-serialization.ts` parsing Markdown into a ProseMirror document and serializing editor state back to Markdown.

Order adopts the **ownership decomposition** only:

```text
feature/editor shell
        ↓
single editor lifecycle owner
        ↓
third-party editor mechanics
```

Order rejects the ProseMirror serialization model because `defaultMarkdownSerializer.serialize(...)` creates Markdown from an editor document. That is suitable for Legal's wire-as-Markdown feature but does not satisfy Order's stricter byte/source-fidelity rule.

CodeMirror avoids that authority mismatch because the editor document itself is text; `view.state.doc.toString()` is the current source rather than a serialization of a separate rich document model.

### 19.3 Component ownership

Add one production owner:

```text
ui/src/MarkdownSourceEditor.tsx
```

Its sole responsibility is CodeMirror mechanics:

- mount/destroy one `EditorView`;
- initialize from a caller-owned Markdown `string`;
- emit caller-visible source changes as `string`;
- apply editable/read-only configuration;
- reconfigure light/dark presentation;
- synchronize an externally replaced source value without creating a second source owner;
- preserve editor-local selection/scroll/undo state when an update does not require replacement;
- expose focus only if the parent needs it for existing focus continuity.

It must not know about:

- WorkItem or ArtifactRef;
- lifecycle stage/editability policy;
- SHA-256 values;
- Save/Cancel/conflict rules;
- TanStack Query;
- HTTP;
- sign-off/freshness;
- Markdown preview mode ownership.

`MarkdownEditor.tsx` remains the one interaction owner for:

- loaded SHA/source baseline;
- editable buffer;
- dirty state;
- Save;
- Cancel;
- stale/conflict handling;
- editor presentation mode;
- composition of source and preview.

`DocumentWorkspace.tsx` remains the document/lifecycle selection owner.

### 19.4 Controlled source synchronization

The integration must distinguish two directions explicitly.

#### Editor -> parent

For a user transaction with `docChanged`:

```text
EditorView.state.doc.toString()
        ↓
onChange(markdown: string)
        ↓
MarkdownEditor buffer
```

No parser/serializer or intermediate domain shape is introduced.

#### Parent -> editor

When the caller supplies a genuinely replaced canonical/buffer value:

- compare the external string with the current CodeMirror document string;
- if equal, do nothing;
- if replacement is required, dispatch one explicit full-document change or recreate editor state only when the integration proves that is necessary;
- tag/suppress the programmatic update so it does not re-emit itself as a user edit;
- do not replace a dirty buffer merely because a query refetched.

The existing `MarkdownEditor` remains responsible for deciding when an external canonical value is admissible. `MarkdownSourceEditor` only synchronizes the value it is given.

### 19.5 CodeMirror configuration

The initial Order configuration should remain document-oriented and minimum sufficient:

- `basicSetup`;
- `markdown()` from `@codemirror/lang-markdown`;
- soft line wrapping;
- Markdown keymap behavior supplied by the Markdown language package;
- search/replace from the standard CodeMirror setup;
- undo/redo/history;
- active selection/cursor accessibility;
- fenced-code syntax recognition available through the Markdown language support.

Line numbers may be retained from `basicSetup` only if browser UX review confirms they support document navigation rather than dominate the prose surface. P7 may remove that one extension without changing this architecture.

### 19.5.1 Markdown formatting command owner

Formatting buttons do not come from CodeMirror as a rich-text toolbar. Order owns a small typed Markdown-source command layer colocated with the source-editor feature.

P7 should introduce one pure command owner, for example:

```text
ui/src/markdown-source-formatting.ts
```

It owns deterministic selection/block transformations only.

The command surface is a closed typed union:

```ts
type MarkdownFormatCommand =
  | "UNDO"
  | "REDO"
  | "HEADING_1"
  | "HEADING_2"
  | "HEADING_3"
  | "BOLD"
  | "ITALIC"
  | "INLINE_CODE"
  | "BLOCKQUOTE"
  | "BULLET_LIST"
  | "NUMBERED_LIST"
  | "LINK"
  | "FENCED_CODE"
  | "HORIZONTAL_RULE";
```

Responsibilities are split as follows:

- `MarkdownSourceEditor` owns CodeMirror `EditorView`, selection access and transaction dispatch;
- the pure formatting owner calculates the exact text replacement/selection result for source-format commands;
- `MarkdownEditor` owns toolbar composition and decides whether actions are available from the current editable/read-only state;
- shared `WorkbenchAction`/Astryx button/icon primitives provide button presentation.

Formatting helpers must receive/return plain source positions/text or a small presentation-only result. They must not expose CodeMirror state as a domain model and must not create a Markdown AST/DTO.

Required deterministic transformations:

- Bold -> wrap/toggle `**selection**`;
- Italic -> wrap/toggle `*selection*`;
- Inline code -> wrap/toggle backticks;
- H1/H2/H3 -> replace/toggle the current line's ATX heading prefix;
- Blockquote -> add/remove `> ` for selected lines;
- Bullet list -> add/remove `- ` for selected lines;
- Numbered list -> add/remove ordered-list markers across selected lines with deterministic sequential numbering;
- Link -> wrap selection as `[label](url)` or insert a deterministic empty-link template with the URL portion selected;
- Fenced code -> wrap/toggle the selected block with triple backticks without inventing a language identifier;
- Horizontal rule -> insert a standalone `---` block at a valid line boundary;
- Undo/Redo -> dispatch CodeMirror's existing history commands rather than reimplementing history.

Source transformations must preserve unrelated bytes and line endings outside the affected selection/range.

### 19.5.2 Formatting toolbar presentation

The toolbar is part of `MarkdownEditor`, immediately associated with the editable source surface and above the source/preview body.

It uses the existing Order action grammar:

- icon + accessible label/title for compact actions;
- grouped Undo/Redo;
- grouped block structure (H1/H2/H3, quote, lists, code block, rule);
- grouped inline formatting (bold, italic, inline code, link);
- responsive overflow/collapse for low-frequency actions on narrow widths.

Toolbar actions are disabled when the document is read-only, saving/conflicted where mutation is not admissible, or when a command cannot apply safely to the current selection.

The toolbar must not become a second global application toolbar and must not consume a permanent row in Preview-only read-only presentation.

### 19.5.3 Order CodeMirror theme

Order owns a dedicated CodeMirror editor theme rather than shipping the raw CodeMirror default appearance.

The theme has two coordinated parts:

1. **editor chrome theme** — implemented with `EditorView.theme(...)`, covering:
   - editor/background surface;
   - foreground text;
   - caret;
   - active line;
   - selection;
   - search match/current search match;
   - gutters/line numbers when enabled;
   - focus boundary;
   - tooltip/search-panel surfaces;
   - scroller/content sizing.

2. **Markdown syntax theme** — CodeMirror syntax highlighting must visibly distinguish at minimum:
   - headings;
   - emphasis/strong emphasis;
   - links/URLs;
   - inline/fenced code;
   - block quotes;
   - list markers;
   - Markdown punctuation/markers;
   - comments/HTML tokens where the language mode exposes them.

The theme follows the existing Order System/Light/Dark preference. It is reconfigured when the effective theme changes; it does not create another persisted preference.

Order/Astryx semantic variables remain the color authority. CodeMirror-specific theme values are derived from those variables or from one colocated Order theme mapping. Light and Dark must each provide intentional syntax contrast; a raw upstream default theme is not the finished UI.

CodeMirror's documented theming model uses `EditorView.theme` for editor chrome and syntax highlighters for token styling; the implementation may use the language package's supported highlight facilities, but any package imported directly by Order production code must be deliberately pinned as a direct dependency rather than relied on through an undeclared transitive import.

The editor theme must preserve the spatial contract already closed by `GW-TR-015`: CodeMirror root/scroller/content fill the available authoring region rather than introducing their own page width or fixed height.

### 19.6 Preview composition

No new preview dependency is added.

`MarkdownEditor` renders the current source buffer using the already-owned Astryx Markdown renderer:

```tsx
<Markdown>{buffer}</Markdown>
```

Presentation state is a small typed local union:

```ts
type MarkdownPresentationMode = "EDIT" | "PREVIEW" | "SPLIT";
```

This union is presentation-only and does not duplicate a canonical domain record.

Wide layout may offer all three modes. Medium/narrow layouts may omit or collapse Split while preserving the current buffer and selected document.

### 19.7 Read-only documents

Read-only governed documents continue to use the rendered Astryx Markdown surface as the normal presentation.

CodeMirror read-only mode is not required merely to display an R3 document. Exact source inspection may reuse the source editor in a non-editable presentation only if a concrete UX need is proven; it must not create a second default read-only document surface.

### 19.8 SoC, DRY, typing and coupling

The existing UI architecture rules remain binding.

Specific consequences:

- only `MarkdownSourceEditor.tsx` imports CodeMirror production APIs;
- `MarkdownEditor.tsx` consumes a narrow typed `value/onChange/disabled` source-editor boundary;
- no CodeMirror `EditorState` or `EditorView` escapes as application/domain state;
- no CodeMirror state is stored in TanStack Query or another store;
- no Markdown AST/view-model/DTO is introduced;
- preview consumes the same `buffer: string`;
- editor commands/extensions are defined once at the source-editor owner, not repeated by document screens;
- app/workspace/document components must not import CodeMirror directly.

### 19.9 Theme and CSS integration

CodeMirror is visually integrated through the Order source-editor owner and `ui/src/theme.css`.

Required behavior:

- editor background, foreground, selection, caret, gutters and syntax colors remain legible in System/Light/Dark;
- colors derive from Order/Astryx semantic variables where possible;
- editor content uses a source-appropriate monospace stack;
- the CodeMirror root/scroller/content fill the existing flexing primary editor region;
- no fixed page-width or fixed-height CodeMirror wrapper reintroduces the spatial defects closed by `GW-TR-015`.

### 19.10 Permanent verification

P7 must add permanent tests proving the editor is an exact-source integration rather than merely proving that CodeMirror mounted.

Architecture/certification must prove:

- the two exact approved direct dependency pins;
- no prohibited rich-text/WYSIWYG/editor framework is introduced;
- CodeMirror production imports are isolated to `MarkdownSourceEditor.tsx`;
- no React CodeMirror wrapper is introduced;
- the existing no-DTO/no-`any`/dependency-direction rules continue to hold.

Behavior/browser tests must prove:

1. initial Markdown appears byte-for-byte in the source editor;
2. user edits update the parent buffer without parse/serialize normalization;
3. Edit -> Preview -> Edit preserves unsaved source exactly;
4. Split preview renders the same current buffer;
5. Save sends the exact edited string through the existing expected-hash mutation;
6. Cancel restores the exact loaded source;
7. external canonical change while dirty produces the existing conflict state instead of replacing the buffer;
8. successful save/refetch does not manufacture a conflict;
9. read-only R3 still exposes no mutation path;
10. responsive mode changes do not lose the buffer;
11. keyboard search/undo/redo and Markdown list continuation operate;
12. every required formatting toolbar action applies the specified exact-source transformation and leaves unrelated source unchanged;
13. toolbar actions preserve/update selection and dirty state correctly and remain disabled for read-only documents;
14. the CodeMirror viewport consumes the primary authoring canvas;
15. light/dark/system theme changes produce the explicit editor-chrome and Markdown-syntax theme with readable contrast;
16. selection, caret, search matches, gutters and focus treatment remain legible in both explicit Light/Dark and System-derived modes.

### 19.11 Stop conditions

Return to P3/P4 instead of expanding implementation if:

- CodeMirror requires Markdown normalization to support the selected behavior;
- exact buffer preservation cannot be maintained across controlled React synchronization;
- Split requires a second document state rather than rendering the same buffer;
- an implementation needs domain/API/persistence changes;
- a proposed toolbar/extension expands the product into repository/IDE editing;
- editor state must become a global/store/server-owned value.

## 20. Markdown editor extension technical requirements

### GW-TR-039-CODEMIRROR-SOURCE-EDITOR-BOUNDARY

**Required behavior:** CodeMirror 6 is encapsulated by one Order-owned `MarkdownSourceEditor` that exchanges Markdown strings only with `MarkdownEditor`.

**Acceptance criterion:** CodeMirror lifecycle/configuration/imports are isolated to that owner and application/domain components do not depend on CodeMirror state or APIs.

**Failure/negative behavior:** CodeMirror must not become an application-state, domain-model or cross-workspace dependency.

### GW-TR-040-EXACT-SOURCE-EDITOR-SYNCHRONIZATION

**Required behavior:** user and external source synchronization operates directly on Markdown text without Markdown parse/serialize normalization or feedback loops.

**Acceptance criterion:** user edits emit `view.state.doc.toString()`; equal external values are no-ops; explicit replacements do not re-emit as user changes; dirty canonical refresh remains governed by `MarkdownEditor`.

**Failure/negative behavior:** the integration must not silently reformat source, overwrite dirty content or create a second synchronized Markdown representation.

### GW-TR-041-MARKDOWN-PREVIEW-COMPOSITION

**Required behavior:** Edit/Preview/Split are composed by `MarkdownEditor` from one `buffer: string` using CodeMirror for source and existing Astryx `Markdown` for rendered preview.

**Acceptance criterion:** all presentation modes resolve from the same buffer and mode switching is presentation-only.

**Failure/negative behavior:** no second Markdown renderer, AST store or persisted preview representation may be introduced.

### GW-TR-042-DOCUMENT-EDITOR-ERGONOMIC-CONFIGURATION

**Required behavior:** the CodeMirror configuration supplies Markdown language support, soft wrapping, history, search and Markdown-aware key behavior, and `MarkdownEditor` exposes the §19.5.2 formatting toolbar backed by one deterministic Markdown-source command owner.

**Acceptance criterion:** configuration and formatting command semantics each have one owner; toolbar actions operate on the exact CodeMirror source selection/buffer, preserve unrelated bytes and remain accessible without adding repository/code-intelligence behavior.

**Failure/negative behavior:** editor extensions/toolbar actions must not expand Order into an IDE, create rich-text/AST authority, normalize unrelated source or duplicate command/configuration owners across screens.

### GW-TR-043-CODEMIRROR-THEME-SPATIAL-INTEGRATION

**Required behavior:** CodeMirror uses the explicit Order editor-chrome and Markdown-syntax theme in §19.5.3, derived from Order/Astryx theme authority, and fills the existing primary-canvas editor region.

**Acceptance criterion:** System/Light/Dark produce intentional editor chrome and Markdown syntax contrast; selection/caret/search/gutter/focus states remain legible and the CodeMirror root/scroller/content participate in the existing flex-height/width contract.

**Failure/negative behavior:** CodeMirror must not ship as an unthemed/default-looking surface, create a second product theme, fixed page container or independent preference owner.

### GW-TR-044-EXACT-SOURCE-EDITOR-CERTIFICATION

**Required behavior:** permanent architecture, unit/browser and certification tests prove exact-source preservation, dependency isolation, save/conflict continuity, presentation-mode continuity and usable editor geometry.

**Acceptance criterion:** the test set in §19.10 passes on the final candidate alongside all existing workbench regressions.

**Failure/negative behavior:** a mount-only or syntax-highlighting-only test is insufficient evidence that the governed Markdown contract remains intact.

## 20. User-facing workflow and Activity technical realization (2026-11-13)

This addendum is the P4 realization of `GW-DOC-WORKBENCH-UX-V1` §21. It changes presentation architecture only where possible and requires explicit P6 changes only for error/diagnostic/WorkItem-management contracts identified by the implementation plan. It does not introduce a second lifecycle, browser workflow store, DTO/view-model family, transport protocol or agent framework.

### 20.1 Canonical workflow presentation projection

`ui/src/workbench-presentation.ts` remains the one pure presentation-policy owner and is extended to map canonical WorkItem/Run/RunEvent values to:

- user-facing workflow label and purpose;
- user-facing Run status/role label;
- user-facing event label/detail;
- presentation eligibility for Activity/Implementation/Review/Result modes.

Components consume those projections. They must not duplicate lifecycle label/status/event tables locally.

The projection does not persist state and does not determine lifecycle eligibility/promotion.

### 20.2 WorkItem header geometry

`WorkItemWorkspace` retains one compact orientation header.

The header may use at most two compact intrinsic rows before the primary mode canvas:

1. title/back/context/mode-management row;
2. workflow-orientation row containing current step/purpose/progression.

Documents may then use their existing one within-mode document navigation strip. Activity uses its own internal master/detail selection and must not add another full-width outer navigation row.

Exact hash, project/schema/concern/source metadata and Technical details do not expand this header.

### 20.3 Activity workspace ownership and decomposition

Add a substantive `ActivityWorkspace` owner.

Its responsibility is Run selection + chronological activity inspection + current human interaction. It consumes existing canonical `Run` and `RunEvent` values through TanStack Query.

The current pre-signoff `StageDialogue` responsibility is absorbed/replaced rather than retained as a second competing Run presentation.

Shared cohesive child ownership should be decomposed only where required, for example:

- `ActivityRunList` — compact Run/attempt master;
- `RunTimeline` — shared canonical RunEvent rendering usable by Activity and Implementation where the semantic presentation is identical;
- `ActivityComposer` — pending human-input interaction only;
- `TechnicalDetails` — secondary exact canonical state/raw event disclosure.

Names are illustrative; P7 may choose equivalent cohesive module names while preserving the responsibilities.

### 20.4 Activity wide-layout geometry

On wide workbench layouts, the Activity primary canvas uses:

```text
Activity canvas
├── activity summary / current state        intrinsic compact row
└── master-detail                           min-height: 0; flex: 1
    ├── Run/attempt master                  minmax(14rem, 18rem)
    └── selected activity detail            minmax(0, 1fr)
        ├── event timeline                  min-height: 0; flex: 1
        └── composer/current action          intrinsic/sticky bottom when applicable
```

Requirements:

- the selected detail region has `min-width: 0` and `min-height: 0`;
- Activity owns remaining mode-canvas height;
- the event list scrolls inside the detail region rather than forcing the whole WorkItem page to grow indefinitely;
- if persistent Context plus the Run master would reduce selected detail below approximately 640 px usable width, the existing responsive Context mechanism must switch Context to drawer/overlay before Activity is compressed further;
- a normal wide desktop target should leave approximately 760–960+ px for selected activity detail where the viewport permits;
- Technical details must not reserve a permanent third column.

### 20.5 Medium and narrow Activity geometry

Below the width where master + detail + optional Context remain usable:

- Context becomes temporary under the existing workbench rule;
- the Run/attempt master collapses to a compact selector, drawer or temporary master pane;
- selected Activity detail remains the primary viewport;
- timeline and composer keep remaining-height ownership;
- Technical details opens as disclosure/drawer/full secondary pane and does not permanently split the Activity detail;
- proposal/evidence navigation retains the selected Run identity when returning.

No mobile-only domain state is introduced.

### 20.6 Workflow/status/action placement

The WorkItem composition owner derives current presentation from canonical state.

- workflow orientation is always in the WorkItem header;
- Activity summary owns running/waiting/failed/blocked/completed agent status;
- a compact Context summary may mirror state but does not duplicate a task-specific primary action;
- start/retry/continue actions are rendered by the primary owning surface when that surface is visible;
- proposal Review owns Adopt/Reject;
- document reconformance action is associated with the edited document/current workflow step;
- Approval owns sign-off;
- Implementation owns signed task operations.

Cross-mode navigation is requested upward through typed callbacks/selections; sibling workspaces do not import each other's state.

### 20.7 Terminal Run retention and mode reconciliation

`WorkItemWorkspace` must derive Activity availability from **Run history**, not only active Run presence.

Presentation reconciliation must handle:

- active Run appearing;
- active Run becoming waiting;
- active Run completing;
- active Run failing;
- active Run blocking/cancelling;
- WorkItem advancing or returning to another lifecycle stage.

A terminal Run keeps Activity valid and selectable.

The current one-way Documents → Dialogue switch is replaced with a symmetric projection that cannot leave the browser in a mode no longer valid for canonical state. Dirty Markdown guards remain authoritative and may defer automatic mode movement until the operator resolves the buffer.

### 20.8 Failure and source-blocker presentation

Known canonical failure detail is rendered in the owning primary workspace.

Activity must render persisted provider/conformance/stage failure events without an allow-list that drops terminal semantics.

A WorkItem source failure may render a compact blocker strip in the current primary surface plus Context summary, with an action to open the Work request/source or Activity/Technical details as appropriate.

Generic HTTP failure text is a fallback only when the daemon has no more specific canonical classification.

### 20.9 Technical details and Evidence promotion

Technical details uses compact disclosure for small exact values:

- Run id;
- internal stage/role/status;
- attempt;
- baseline/context identities;
- provider session id;
- terminal classification;
- exact raw RunEvent tag/payload.

Large provider diagnostics/logs/tool traces are Evidence resources and open the existing Evidence primary workspace. They are never rendered in the Context rail or a permanently visible Activity side column.

### 20.10 WorkItem management controls

The WorkItem header owns management entry points because title/removal apply to the WorkItem independently of current mode.

- title editing is an inline/popover/dialog interaction anchored to the title, sized as compact structured input;
- remove/archive/restore is a secondary overflow/management action with confirmation;
- neither control creates another primary-canvas mode;
- actual mutation semantics and typed transport remain P6-owned.

### 20.11 Browser verification geometry

Permanent browser tests must prove at representative wide/medium/narrow sizes:

1. the workflow header remains compact and does not create a third full-width navigation band;
2. Activity detail receives the majority of remaining mode-canvas height;
3. wide Activity uses a bounded 14–18 rem Run master and flexible detail;
4. Context collapses before Activity detail becomes narrower than the functional minimum;
5. medium/narrow Activity keeps timeline + pending input in the primary viewport;
6. terminal failed Runs remain visible/selectable;
7. Technical details does not permanently consume primary width;
8. proposal Review/Evidence round-trips preserve the selected activity;
9. lifecycle transition updates workflow orientation without stale mode presentation;
10. existing dirty-buffer, focus, URL/history and responsive regressions continue to pass.

### 20.12 Technical requirements

#### GW-TR-027-WORKFLOW-PRESENTATION-PROJECTION

**Required behavior:** one pure presentation owner maps canonical lifecycle/Run/RunEvent state to user-facing workflow/status/event language.

**Acceptance criterion:** substantive UI modules consume the shared projection and canonical types directly.

**Failure/negative behavior:** screen-local workflow/status/event mapping tables or browser-owned lifecycle DTOs are prohibited.

#### GW-TR-028-WORKFLOW-HEADER-GEOMETRY

**Required behavior:** user-facing workflow orientation fits within the compact WorkItem header without adding another full-width primary navigation row.

**Acceptance criterion:** header geometry follows §20.2 and leaves the primary task with remaining viewport space.

**Failure/negative behavior:** workflow explanation must not become page-like chrome above every workspace.

#### GW-TR-029-ACTIVITY-MASTER-DETAIL-LAYOUT

**Required behavior:** Activity uses the remaining-height master/detail geometry in §§20.4–20.5.

**Acceptance criterion:** Run selection stays scan-efficient while the selected event timeline receives flexible width/height.

**Failure/negative behavior:** activity history must not become an unbounded vertical stack before the selected Run detail.

#### GW-TR-030-SINGLE-RUN-EVENT-PRESENTATION

**Required behavior:** one cohesive Run/event presentation owner renders canonical events wherever the same operational meaning is shown.

**Acceptance criterion:** Activity and Implementation do not maintain divergent event-label/detail/evidence logic.

**Failure/negative behavior:** pre-signoff failure/completion events must not be hidden by a narrower Dialogue-specific allow-list.

#### GW-TR-031-ACTIVITY-INPUT-PLACEMENT

**Required behavior:** pending human input is attached to the selected Activity detail and consumes intrinsic/sticky bottom space only while input is accepted.

**Acceptance criterion:** questions and composer remain adjacent to the event context that requested them across responsive layouts.

**Failure/negative behavior:** the composer must not appear active for terminal/non-input Runs or move below unrelated metadata.

#### GW-TR-032-TECHNICAL-DETAILS-PRESENTATION

**Required behavior:** exact internal state is available through secondary disclosure while large diagnostics promote to Evidence-class primary space.

**Acceptance criterion:** ordinary Activity retains its width while exact raw identifiers/payloads remain inspectable on demand.

**Failure/negative behavior:** a permanent debug column or Context-rail log viewer is prohibited.

#### GW-TR-033-PRIMARY-FAILURE-PRESENTATION

**Required behavior:** known agent/source/conformance failures are rendered in the primary owning surface from canonical state.

**Acceptance criterion:** failed terminal Runs remain selectable and display persisted failure detail plus recovery action.

**Failure/negative behavior:** terminalization must not collapse the failed activity into an empty/no-active-run state.

#### GW-TR-034-WORKITEM-MANAGEMENT-CONTROL-PLACEMENT

**Required behavior:** title and remove/archive/restore controls are WorkItem-header/management interactions using compact input/safety patterns.

**Acceptance criterion:** the controls remain discoverable from every WorkItem mode without taking over the primary canvas.

**Failure/negative behavior:** management must not require raw Markdown structure manipulation or compete with the current lifecycle action.

#### GW-TR-035-CANONICAL-MODE-RECONCILIATION

**Required behavior:** browser-local mode selection is reconciled against changing canonical WorkItem/Run state while preserving dirty-buffer and focus/history protections.

**Acceptance criterion:** Run completion/failure/stage advancement cannot strand the operator in an invalid or misleading primary mode.

**Failure/negative behavior:** presentation-local mode state must not outlive the canonical eligibility/state it is meant to display.

## 21. Global OpenCode account-control component architecture (2026-11-13)

This section is the P4 UI realization of `GW-FR-073..076` and the daemon/account contracts in `GW-DOC-TECHNICAL-ARCHITECTURE-V1 §31` / `GW-DOC-CANONICAL-CONTRACTS-V1 §33`.

### 21.1 Application-shell ownership

OpenCode account **current-state access** is owned by the application shell, while full account configuration is owned by the Settings surface. Queue, WorkItemWorkspace, Activity, Documents and provider/model components own neither.

One compact shell control renders the active-account/current-attention projection in queue and WorkItem states and navigates to Settings for full management. It may move into an application-level utilities menu on narrow viewports, but full Add/Switch/Rename management does not live in that utility or WorkItem Context.

### 21.2 Query/mutation ownership

One cohesive OpenCode-account UI owner consumes:

- `GET /api/opencode/accounts`;
- Add-account login start/status/cancel;
- Activate account;
- Rename account.

TanStack Query owns server state. There is no separate React context/global store for active-account identity.

Successful Activate/Rename and terminal successful Add invalidate/refetch the account-state query. Account state is never inferred from prior mutation arguments.

### 21.3 Account manager composition

The complete manager is rendered in **Settings → OpenCode accounts**. Shell account UI is limited to concise active-account/attention state plus navigation to that Settings area.

Recommended composition:

```text
OpenCodeAccountControl
  └── OpenCodeAccountManager
        ├── active-account summary
        ├── saved-account rows
        │     ├── label
        │     ├── active / needs-auth state
        │     ├── Switch
        │     └── Rename
        └── AddOpenCodeAccountFlow
```

Names are illustrative; the ownership boundaries are binding.

Account rows receive only canonical Order safe-account values. Components never receive raw OpenCode connection/credential objects.

### 21.4 Add-account interaction

`AddOpenCodeAccountFlow` is a bounded stateful UI over one daemon login attempt:

1. collect validated account label;
2. call start-login;
3. display OpenCode external authorization URL/instructions;
4. poll the Order attempt status;
5. on terminal success, close/refresh account manager;
6. on failed/expired/cancelled, preserve the human-readable terminal detail and allow retry.

The browser opens the external authorization URL using normal safe external navigation. It does not navigate to or embed the private OpenCode loopback server.

No access/refresh token, OAuth provider attempt id, private provider URL/password or OpenCode credential metadata enters component props/state.

### 21.5 Mutation blocking presentation

The account-state query's mutation blockers drive disabled Add/Switch/Rename controls.

When `ACTIVE_RUN` is present, the manager renders the functional explanation owned by P3 and may use existing Run/WorkItem queries to provide navigation to the blocking activity. It does not reproduce Run-state logic in the account component.

A pending login attempt keeps other account mutations disabled until terminal/cancelled.

### 21.6 Account/provider distinction

The account control must remain visually and semantically distinct from model/provider selection.

The compact label is account-oriented, for example:

```text
OpenCode: user@example.com
```

not:

```text
Provider: OpenCode Go
```

A configured-model surface may separately show `OpenCode Go / <model>`. Switching account does not optimistically alter that surface.

### 21.7 Browser certification

Permanent browser tests prove:

- the global account control is reachable from queue and WorkItem states;
- wide/narrow recomposition preserves the same account state and in-progress login UI;
- three saved labels render without exposing credential values;
- active account is visually unambiguous;
- A -> B -> A switching updates only after daemon-confirmed account state;
- Add account keeps authorization instructions/status visible through polling;
- active-Run blocker disables Add/Switch/Rename and remains understandable;
- model/provider UI does not change when account selection changes;
- no account-manager interaction steals primary WorkItem canvas space.

### 21.8 Technical requirement

#### GW-TR-053-OPENCODE-ACCOUNT-CONTROL-UI

**Required behavior:** one application-shell-owned account-control component tree renders canonical safe account state and drives Add/Switch/Rename exclusively through daemon endpoints/TanStack Query.

**Acceptance criterion:** account management remains globally reachable and responsive without a second client-state owner or leakage of raw OpenCode credential/provider shapes.

**Failure/negative behavior:** account switching must not be implemented inside provider/model selection, WorkItem Context, a global ad-hoc store or browser-direct OpenCode API access.



## 22. 0.2.1 Settings and information-architecture refactor

This section is the P4 UI realization of `GW-FR-083..098` plus the Settings/readiness contracts in `GW-DOC-CANONICAL-CONTRACTS-V1 §35`.

### 22.1 Application-shell decomposition

`app.tsx` remains the top application composition owner but must stop owning substantive configuration UI.

Target composition:

```text
App
├── application shell / top rail
│   ├── Order identity + queue/WorkItem orientation
│   ├── current repository/project mirror
│   ├── current OpenCode account mirror
│   ├── direct appearance mode switcher
│   └── Settings entry
├── Queue / selected WorkItem primary surface
└── Settings surface (when selected)
    ├── Repositories
    ├── OpenCode accounts
    └── Model & runtime
```

Settings is an application-level presentation state/route, not a WorkItem mode and not a drawer owned by queue/work-item content.

The shell may mirror concise current state, but every full application-level mutation navigates to the owning Settings section.

### 22.2 Settings component ownership

Create one cohesive Settings composition boundary. Illustrative filenames are not binding; responsibilities are.

```text
SettingsWorkspace
  ├── SettingsNavigation
  ├── RepositorySettings
  │   ├── connected target-repository inventory
  │   ├── connect/disconnect controls
  │   ├── repository document-root migration interaction
  │   └── STAGE reference-root configuration
  ├── OpenCodeAccountSettings
  │   └── existing canonical account-management flow
  └── ModelRuntimeSettings
      └── configured model selection/preflight
```

TanStack Query remains the sole browser owner of daemon settings/account/readiness state.

No Settings context/global store, repository view-model family, configuration service class or mirrored config object is introduced.

### 22.3 Settings navigation and viewport zoning

Settings uses the semantic zoning defined by `GW-FR-096/097`:

- global/top rail retains application orientation;
- Settings navigation occupies the local navigation region;
- selected Settings concern owns the primary canvas;
- secondary technical detail/help uses disclosure/context rather than another persistent top band;
- operational blockers may appear in the relevant Settings content because they affect the current action.

The main workbench and Settings do not share a generic content dump. Entering Settings replaces the primary application work surface; it does not stack settings controls above the queue/WorkItem.

### 22.4 Repository Settings realization

Repository Settings consumes canonical `ConnectedRepositoryState[]`, `OrderConfigState` and `InstallationReadiness`. The same Settings section also exposes `OrderConfig.referenceRoots` as a clearly separate STAGE-only reference-context list.

Settings must render valid empty/unconfigured states as first-class setup states. Zero connected repositories and `model = null` are not transport errors; they produce the relevant setup action in the owning Settings section.

Each repository row/card remains compact and exposes:

- project identity;
- connection/readiness state;
- effective WorkItem document root;
- exact Git root as secondary technical detail;
- current queue/creation context where applicable;
- Connect/Disconnect/document-root actions.

The UI never concatenates repository paths, parses `pontivus-order.toml`, derives document roots or infers readiness. Reference roots are never presented as productive/connected repositories.

Document-root migration is a deliberate modal/dialog/review interaction because it changes repository-owned files and configuration. It must present current root, proposed root, blockers and explicit confirmation before invoking the canonical migration command.

### 22.5 OpenCode account Settings realization

The existing account manager interaction is reused as the content of Settings → OpenCode accounts.

Refactor goals:

- retain existing canonical query/mutation/login hooks and state;
- move full manager presentation out of the shell utility;
- keep the shell utility as active-account/attention summary + Settings navigation;
- preserve in-progress login state if the user remains inside the Settings account surface;
- do not duplicate account logic between shell and Settings.

### 22.6 Model/runtime Settings realization

Model selection becomes a Settings concern backed by canonical model/config queries.

The component consumes the currently configured `OpenCodeModelRef` and a canonical list/preflight source. It does not invent provider semantics.

Changing model invokes the focused Settings command and reflects success only after the daemon returns the activated config/readiness state.

### 22.7 WorkItem top-rail and workflow navigation refactor

`WorkItemWorkspace` is refactored so persistent WorkItem orientation is one compact top rail.

The rail composes:

- Back;
- title + concise current state;
- compact clickable workflow-step inspection navigation;
- current workspace-mode control;
- contextual WorkItem actions.

The former separate `.order-workflow-orientation` row is removed after equivalent orientation/navigation is integrated.

Workflow-step click maps to browser-local presentation targets only. A pure typed presentation projection maps each canonical user-facing step to its available Documents/Review/Execution/Result target or explicit unreached state.

No click path imports or calls lifecycle promotion/start/sign-off mutations.

### 22.8 Document/editor chrome refactor

`DocumentWorkspace` retains one within-Documents selector.

The separate document Git-state strip and Markdown action/footer rows are consolidated into the smallest coherent editor/document toolbar set:

- Edit / Preview / Split;
- formatting actions;
- compact dirty/save/cancel state;
- actionable documentation Git save;
- compact document/Git state;
- technical details disclosure for exact SHA/path/HEAD.

Old state/action bars are deleted once their controls move.

The center document/editor region remains the flexible-height owner; chrome is intrinsic/compact.

### 22.9 Human-first Source editor realization

For WorkItem Source:

- `MarkdownEditor` receives `bodyMarkdown` as its ordinary editable buffer;
- Save sends `expectedSha256 + bodyMarkdown`;
- Preview/Split render the human-authored body;
- Technical source disclosure renders the exact complete `snapshot.markdown` read-only;
- after save, canonical query refetch replaces both full-source and body projections.

For lifecycle documents, `MarkdownEditor` continues to receive/edit the exact full Markdown.

The editor does not contain logic for detecting/removing front matter or JSON metadata.

### 22.10 Appearance control realization

Theme preference ownership remains browser-local and unchanged.

Replace the current select with a compact direct mode switcher using the pinned Astryx/local segmented/toggle primitive that best represents exactly three semantic states:

- System;
- Light;
- Dark.

All three states are directly understandable from the control. Icons may supplement labels/accessible names.

There is no theme Settings form unless future functional requirements create additional appearance settings. This utility remains globally reachable because it is a frequent reversible presentation preference.

### 22.11 Responsive semantics

Responsive recomposition preserves semantic ownership:

- Settings navigation may collapse into a local menu/drawer but remains Settings navigation;
- contextual inspector may become a drawer but remains WorkItem context;
- shell account/repository mirrors may collapse into utilities but continue to link to Settings;
- appearance switcher may compact its visual representation without becoming a generic select;
- primary Markdown/work content remains dominant.

### 22.12 Required UI refactors

The following current implementation structures are explicitly superseded and must not remain as parallel paths:

1. full `OpenCodeAccountControl` manager behavior in the global toolbar;
2. theme `<select>` in `app.tsx`;
3. implicit first-project/repository context as the only global repository indication;
4. separate WorkItem heading + workflow-orientation persistent rows;
5. separate document-state + editor-format + editor-action persistent full-width bars when controls can be composed coherently;
6. complete WorkItem source technical Markdown as the normal editable buffer;
7. any configuration mutation retained only in installer/CLI after equivalent Settings support is implemented.

Guided setup remains a supported install/recovery entry, but it calls the same canonical configuration owner and does not remain an exclusive configuration capability.

### 22.13 Browser/architecture certification

Permanent verification must prove:

- Settings is reachable from queue and WorkItem states without becoming a WorkItem mode;
- Repositories/OpenCode accounts/Model-runtime each have stable Settings navigation targets;
- full account management is absent from the WorkItem/queue shell while active account state remains visible;
- current repository context is visible globally and repository mutation lives only in Settings;
- appearance control is not a select and changes System/Light/Dark correctly;
- workflow steps navigate without lifecycle mutation;
- one WorkItem top rail replaces the old orientation stack;
- document/editor chrome uses fewer persistent rows and preserves reachable Save/Git actions;
- Source editor excludes system metadata in ordinary authoring but technical source shows complete bytes;
- body save preserves metadata bytes and stale complete-file conflicts;
- responsive layout preserves semantic zoning;
- no second browser server-state/config store or DTO/view-model layer appears.

### 22.14 Technical requirements

#### GW-TR-063-CENTRALIZED-SETTINGS-COMPOSITION

**Required behavior:** one application-level Settings surface owns full repository, OpenCode-account and model/runtime configuration presentation.

**Acceptance criterion:** global shell utilities provide only current-state mirrors/navigation; full mutation flows live under stable Settings navigation.

**Failure/negative behavior:** configuration management must not remain scattered across toolbar popovers, WorkItem context, queue-only controls or installer-only UI.

#### GW-TR-064-SEMANTIC-VIEWPORT-COMPOSITION

**Required behavior:** shell, Settings, WorkItem, inspector and task-local controls map to stable semantic viewport regions and preserve those roles responsively.

**Acceptance criterion:** placement remains predictable and primary content retains dominant width/height.

**Failure/negative behavior:** generic bars/rails or responsive moves must not mix unrelated semantic roles.

#### GW-TR-065-NONMUTATING-WORKFLOW-INSPECTION-NAVIGATION

**Required behavior:** workflow steps use one pure typed presentation projection to navigate to canonical material/unreached presentation without invoking lifecycle mutations.

**Acceptance criterion:** every workflow step is inspectable/clickable while lifecycle state is unchanged.

**Failure/negative behavior:** step clicks must not start/promote/sign off/execute or duplicate lifecycle policy.

#### GW-TR-066-CONSOLIDATED-WORKITEM-DOCUMENT-CHROME

**Required behavior:** WorkItem orientation and document/editor controls are consolidated into semantically owned compact rails with old redundant rows removed.

**Acceptance criterion:** primary document/work space increases while all required actions/state remain reachable.

**Failure/negative behavior:** old and new chrome grammars must not coexist or duplicate context.

#### GW-TR-067-HUMAN-FIRST-SOURCE-EDITOR-COMPOSITION

**Required behavior:** Source editing uses canonical `bodyMarkdown` while exact complete source remains read-only technical inspection.

**Acceptance criterion:** the browser performs no metadata parsing/recomposition and complete-file concurrency semantics remain intact.

**Failure/negative behavior:** hidden CSS/front-matter stripping in the editor or a second source buffer authority is prohibited.

#### GW-TR-068-DIRECT-APPEARANCE-MODE-CONTROL

**Required behavior:** the browser-local theme preference is presented through one compact direct three-state System/Light/Dark switcher.

**Acceptance criterion:** mode is identifiable/changeable without a select/dropdown and still drives the single Astryx Theme owner.

**Failure/negative behavior:** appearance must not use a generic select field or acquire a second preference owner.

#### GW-TR-069-SETTINGS-ACCOUNT-PRESENTATION-OWNERSHIP

**Required behavior:** Settings owns full OpenCode account-management presentation while the shell owns only active-account/attention mirroring and navigation.

**Acceptance criterion:** one canonical account query/mutation implementation serves both contexts without duplicate management logic.

**Failure/negative behavior:** parallel account managers or browser-direct OpenCode access are prohibited.
