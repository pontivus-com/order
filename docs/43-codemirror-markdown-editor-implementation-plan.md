# 43 — CodeMirror exact-source Markdown editor implementation plan

**Status:** Active P7 implementation plan — ready for implementation  
**Target repository:** `pontivus-com/order`  
**Pyramid layer:** P7 implementation plan  
**Plan baseline:** `0daf814c3ddabc87cf6a69c98f51e87eec07faf8`  
**Purpose:** implement the governed exact-source CodeMirror Markdown editor extension defined by `GW-FR-051..055` and `GW-TR-027..032`, including a native Order formatting toolbar and fully Order-themed CodeMirror chrome/syntax presentation.

This plan is implementation authority only. It does not redefine the P3/P4 behavior owned by `GW-DOC-MARKDOWN-WORKBENCH-V1` and `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`.

## 1. Governing authority

### P1

- `GW-P1-FCIS`
- `GW-P1-SOC`
- `GW-P1-DRY`
- `GW-P1-STRICT-TYPING`
- `GW-P1-CANONICAL-OWNERSHIP`
- `GW-P1-EXPLICIT-FLOW`
- `GW-P1-MINIMUM-CHANGE`
- `GW-P1-DOC-CANONICALITY`

### P3

- `GW-FR-051-EXACT-SOURCE-MARKDOWN-EDITOR`
- `GW-FR-052-DOCUMENT-EDIT-PREVIEW-MODES`
- `GW-FR-053-MARKDOWN-AUTHORING-ERGONOMICS`
- `GW-FR-054-LIVE-SAFE-MARKDOWN-PREVIEW`
- `GW-FR-055-EDITOR-STATE-CONTINUITY`

### P4

- `GW-TR-027-CODEMIRROR-SOURCE-EDITOR-BOUNDARY`
- `GW-TR-028-EXACT-SOURCE-EDITOR-SYNCHRONIZATION`
- `GW-TR-029-MARKDOWN-PREVIEW-COMPOSITION`
- `GW-TR-030-DOCUMENT-EDITOR-ERGONOMIC-CONFIGURATION`
- `GW-TR-031-CODEMIRROR-THEME-SPATIAL-INTEGRATION`
- `GW-TR-032-EXACT-SOURCE-EDITOR-CERTIFICATION`

### Supporting canonical owners

- `GW-DOC-EXTERNAL-FACTS-V1-2026-11-12`
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1`
- `GW-DOC-CANONICAL-CONTRACTS-V1`
- `GW-DOC-WORKBENCH-UX-V1`
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1`

## 2. Implementation outcome

Replace the editable Astryx `TextArea` path inside `MarkdownEditor` with one Order-owned CodeMirror source-editor boundary while preserving the existing canonical Markdown buffer/save/conflict contract.

The completed interaction is:

```text
DocumentWorkspace
      |
      v
MarkdownEditor
  |-- title / dirty / conflict / save / cancel
  |-- Edit | Preview | Split presentation mode
  |-- Markdown formatting toolbar
  |
  +-- MarkdownSourceEditor
  |     |-- CodeMirror EditorView lifecycle
  |     |-- exact string value/onChange
  |     |-- source selection + transaction dispatch
  |     |-- Order CodeMirror chrome/syntax theme
  |     '-- no WorkItem/domain/save/query knowledge
  |
  '-- Astryx Markdown preview
        '-- same current buffer:string
```

There remains exactly one editable document value:

```text
buffer: string
```

CodeMirror state is ephemeral editor state only.

## 3. Cumulative execution representation

This work must be represented as **one cumulative Order ExecutionTask**. The phases below modify the same editor candidate and are not independently materializable tasks.

Execution order:

```text
I1 dependency + fitness boundary
        |
        v
I2 pure Markdown formatting commands
        |
        v
I3 MarkdownSourceEditor / CodeMirror lifecycle
        |
        v
I4 toolbar + Edit/Preview/Split composition
        |
        v
I5 Order theme + syntax theme + spatial integration
        |
        v
I6 exact-source/save/conflict/responsive tests
        |
        v
I7 full certification + deletion of old textarea path
```

Do not parallelize phases that depend on candidate bytes from an earlier phase.

## 4. I1 — Materialize the approved dependency and certification boundary

### Objective

Add only the explicitly approved CodeMirror dependencies and update the permanent package/certification boundary before production UI code imports them.

### Required package changes

Add exact runtime pins to `dependencies`:

```text
codemirror                 6.0.2
@codemirror/lang-markdown 6.5.2
@codemirror/language      6.13.1
@codemirror/commands      6.11.1
@codemirror/state         6.7.6
@lezer/highlight          1.2.5
```

Update `bun.lock` with Bun 1.4.4.

No ranges, tags or caret versions.

### Certification changes

Update `tests/certification.test.ts` so the exact dependency inventory includes those four packages.

The forbidden dependency assertions must continue to reject:

- Lexical;
- ProseMirror;
- MDXEditor/Milkdown;
- Monaco;
- `@uiw/react-codemirror`;
- Zustand/another state store;
- any second Markdown renderer.

### Architecture sensor changes

Extend `tests/architecture.test.ts` to establish the eventual boundary before later phases complete:

- only `ui/src/MarkdownSourceEditor.tsx` may import `codemirror`, `@codemirror/lang-markdown`, `@codemirror/language`, `@codemirror/commands`, `@codemirror/state` or `@lezer/highlight` in production code;
- no CodeMirror import in `app.tsx`, `WorkItemWorkspace.tsx`, `DocumentWorkspace.tsx`, `MarkdownEditor.tsx`, primitives or other workspaces;
- no `EditorState` / `EditorView` application-state ownership outside `MarkdownSourceEditor`;
- the new modules in this plan must be registered in the permanent cohesive-owner set when they are created.

### Gate

Run:

```text
bun ci
bun run tsc --noEmit
architecture
certification
```

Do not continue if package/certification ownership is inconsistent.

## 5. I2 — Implement one pure Markdown formatting-command owner

### New file

```text
ui/src/markdown-source-formatting.ts
```

### Responsibility

Pure exact-source transformations only.

It must not import React, CodeMirror, Astryx, TanStack Query, WorkItem contracts or HTTP.

### Required typed model

Use a closed union equivalent to:

```ts
export type MarkdownFormatCommand =
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

Undo/Redo are CodeMirror history commands and do not belong to this source-transform union.

The pure function boundary should accept plain source plus selection offsets and return only the next source and next selection:

```ts
type MarkdownSourceSelection = Readonly<{
  from: number;
  to: number;
}>;

type MarkdownSourceTransform = Readonly<{
  markdown: string;
  selection: MarkdownSourceSelection;
}>;
```

No DTO/domain semantics are implied by these presentation-only types.

### Required transformations

Implement and unit-test:

- H1/H2/H3 — replace/toggle only the current selected line(s) ATX prefix;
- Bold — wrap/toggle `**…**`;
- Italic — wrap/toggle `*…*`;
- Inline code — wrap/toggle backticks;
- Blockquote — add/remove `> ` across selected lines;
- Bullet list — add/remove `- ` across selected lines;
- Numbered list — add/remove deterministic sequential `1. `, `2. `… markers;
- Link — wrap non-empty selection as `[label](url)`; with empty selection insert a deterministic template and return the URL selection;
- Fenced code — wrap/toggle a selected block in triple backticks, without inventing a language identifier;
- Horizontal rule — insert standalone `---` at a valid line boundary.

### Source-fidelity rules

Every transform must:

- preserve bytes outside the affected range;
- preserve existing line-ending style outside inserted content;
- not parse/serialize the whole document;
- not normalize whitespace unrelated to the command;
- return deterministic selection/caret positions;
- be reversible/toggleable where mechanically safe.

### New permanent unit test

```text
tests/markdown-source-formatting.test.ts
```

Cover every command with:

- non-empty selection;
- empty selection where applicable;
- toggle/remove behavior;
- multiline selection where applicable;
- source-before/source-after exact equality;
- unaffected-prefix/suffix preservation.

## 6. I3 — Implement the CodeMirror lifecycle owner

### New file

```text
ui/src/MarkdownSourceEditor.tsx
```

### Narrow props

Use a boundary equivalent to:

```ts
type MarkdownSourceEditorProps = Readonly<{
  value: string;
  disabled: boolean;
  ariaLabel: string;
  effectiveTheme: "light" | "dark";
  onChange: (markdown: string) => void;
  onReady?: (...) => void; // only if toolbar command dispatch genuinely requires it
}>;
```

Do not pass WorkItem, SHA, ArtifactRef, lifecycle state, query objects or save callbacks.

If toolbar integration needs an imperative editor command surface, expose the smallest typed semantic interface possible, for example:

```ts
type MarkdownSourceEditorHandle = Readonly<{
  focus: () => void;
  undo: () => void;
  redo: () => void;
  format: (command: MarkdownFormatCommand) => void;
}>;
```

Do not expose raw `EditorView` or `EditorState` to `MarkdownEditor`.

### Mount/destroy

- create exactly one `EditorView` for the mounted host;
- destroy it on unmount;
- keep latest `onChange` callback in a ref or equivalent safe owner;
- do not recreate the view on every React render;
- reconfigure editable/theme extensions rather than reconstructing the document unnecessarily.

### Editor -> parent synchronization

For user document transactions:

```text
view.state.doc.toString()
        |
        v
onChange(markdown)
```

Only `docChanged` transactions emit source changes.

No Markdown parser/serializer.

### Parent -> editor synchronization

When `value` changes:

1. compare with `view.state.doc.toString()`;
2. equal -> no transaction;
3. different -> one explicit whole-document replacement transaction;
4. mark/suppress that programmatic replacement so it does not echo through `onChange`;
5. preserve selection where meaningful and clamp it to the new document;
6. never decide whether a canonical refresh may replace a dirty buffer — `MarkdownEditor` remains that owner.

### Base extensions

Configure:

- `basicSetup`;
- `markdown()`;
- `EditorView.lineWrapping`;
- editable compartment/configuration;
- theme compartment/configuration;
- update listener;
- accessible content attributes.

Do not add IDE/LSP/autocomplete/repository extensions.

## 7. I4 — Integrate toolbar and document presentation modes in MarkdownEditor

### Existing owner to change

```text
ui/src/MarkdownEditor.tsx
```

### Delete/replace

Remove the editable Astryx `TextArea` import and editable TextArea branch.

Do not remove Astryx `Markdown`; it remains the preview/read-only renderer.

Remove obsolete `.order-markdown-field` / `.order-markdown-textarea` CSS after the CodeMirror path is verified.

### Presentation state

Add one local typed union:

```ts
type MarkdownPresentationMode = "EDIT" | "PREVIEW" | "SPLIT";
```

Ownership remains local to `MarkdownEditor`.

Rules:

- editable documents default to EDIT;
- read-only documents default to PREVIEW;
- PREVIEW renders the current `buffer`;
- SPLIT renders the same `buffer` in source + preview;
- switching modes must not modify `buffer`, `loadedMarkdown`, SHA, dirty or conflict state;
- narrow layouts may hide SPLIT, but must not reset the selected mode/source unexpectedly.

### Formatting toolbar

Toolbar belongs inside `MarkdownEditor`, above the source/preview body and below the compact document heading.

Use `WorkbenchAction` and `WorkbenchIcon` / verified Astryx icons. Do not introduce another toolbar library.

Required visible actions/groups:

```text
history:
  Undo
  Redo

structure:
  H1
  H2
  H3
  Blockquote
  Bulleted list
  Numbered list
  Fenced code
  Horizontal rule

inline:
  Bold
  Italic
  Inline code
  Link

presentation:
  Edit
  Preview
  Split (when available)
```

The UI may collapse lower-frequency format actions into a compact overflow on narrow widths, but labels remain accessible.

### Toolbar command flow

```text
button
  -> semantic MarkdownFormatCommand
  -> MarkdownSourceEditor handle
  -> read source + selection
  -> pure markdown-source-formatting transform
  -> one CodeMirror transaction
  -> normal onChange(buffer)
```

No toolbar action mutates React buffer independently of CodeMirror while the source editor is active.

Undo/Redo invoke CodeMirror history commands directly.

### Editability

Formatting actions must be disabled when:

- `readOnly`;
- `conflicted`;
- save/conflict state otherwise makes editing inadmissible.

Preview mode may keep the toolbar compact but formatting mutation buttons are unavailable when no active editable source view is mounted. If the implementation retains the source editor mounted but visually hidden, it must preserve accessibility/focus correctness and not create hidden duplicate interactive controls.

## 8. I5 — Implement a fully Order-themed CodeMirror surface

This phase is mandatory. A functioning but raw/default CodeMirror surface is a failed implementation.

### Existing theme authority

Use existing Order tokens in `ui/src/theme.css`:

```text
--order-workbench-bg
--order-workbench-surface
--order-workbench-subtle
--order-workbench-border
--order-workbench-text
--order-workbench-muted
--order-workbench-accent
--order-primary-bg
--order-primary-bg-hover
--order-color-dbeafe
--order-color-f8fbff
--order-color-fef3c7
--order-color-a16207
--order-color-047857
--order-color-1d4ed8
```

These already resolve separately for explicit Dark and System-derived dark mode.

### Add editor semantic aliases

Add editor-specific aliases in `theme.css` rather than hard-coding default CodeMirror colors:

```css
--order-editor-bg: var(--order-workbench-surface);
--order-editor-text: var(--order-workbench-text);
--order-editor-muted: var(--order-workbench-muted);
--order-editor-border: var(--order-workbench-border);
--order-editor-gutter-bg: var(--order-workbench-subtle);
--order-editor-gutter-text: var(--order-workbench-muted);
--order-editor-accent: var(--order-workbench-accent);
--order-editor-selection-bg: var(--order-color-dbeafe);
--order-editor-active-line-bg: var(--order-color-f8fbff);
--order-editor-search-bg: var(--order-color-fef3c7);
--order-editor-search-outline: var(--order-color-a16207);
--order-editor-link: var(--order-color-1d4ed8);
--order-editor-code: var(--order-color-047857);
```

The exact aliases may be renamed for consistency, but there must be one Order-owned mapping and no duplicated Light/Dark color tables in TypeScript.

### CodeMirror chrome theme

In `MarkdownSourceEditor`, create an `EditorView.theme(...)` mapping for:

- root background/text;
- focused root outline/border;
- scroller;
- content/caret;
- selection;
- active line;
- gutters;
- active line gutter;
- search panel;
- search match;
- current search match;
- tooltips where present.

CSS values must reference the Order CSS variables using `var(--order-editor-...)`.

Do **not** use raw CodeMirror black/gray defaults as the finished visual surface.

### Markdown syntax theme

Use:

```text
@codemirror/language 6.13.1
@codemirror/commands 6.11.1
@codemirror/state    6.7.6
@lezer/highlight      1.2.5
```

to create one `HighlightStyle` and install it with `syntaxHighlighting(...)`.

Use semantic tags and Order variables. Minimum mappings:

| Markdown semantic | Order presentation |
|---|---|
| heading | accent; visually stronger weight |
| strong | normal text; bold weight |
| emphasis | normal text; italic |
| link / URL | `--order-editor-link` |
| inline/fenced code | `--order-editor-code` |
| quote | muted text |
| list marker | accent or muted-accent presentation |
| Markdown punctuation/meta | muted |
| comment/HTML token | muted, clearly secondary |

Do not hard-code an independent dark palette in TypeScript.

### Effective theme

The editor must follow the existing root Order theme.

Preferred implementation:

- CSS variable-based `EditorView.theme` and syntax style values where supported;
- only reconfigure CodeMirror when effective light/dark semantics require CodeMirror's dark-mode flag or non-CSS behavior.

Do not create another localStorage key or theme preference.

### Spatial CSS

Add CodeMirror layout rules so:

- host fills `.order-editor-body`;
- `.cm-editor` height is 100%;
- `.cm-scroller` fills and scrolls;
- `.cm-content` retains source-appropriate monospace text and document-oriented line height;
- no CodeMirror max-width/fixed-height rule;
- Split uses a two-column minmax grid on sufficiently wide viewports;
- Preview retains readable inner prose measure;
- narrow mode becomes one pane without horizontal compression.

## 9. I6 — Permanent verification

### Architecture

Extend `tests/architecture.test.ts` to enforce:

- one CodeMirror production owner;
- one pure source-formatting owner;
- no raw CodeMirror imports elsewhere;
- no rich-text/AST/DTO/state-store additions;
- `MarkdownEditor` remains save/conflict/presentation composition owner;
- `DocumentWorkspace` remains lifecycle-document owner.

### Certification

Update `tests/certification.test.ts` exact package inventory to include the six approved dependencies.

Add explicit forbidden checks for likely architecture regressions:

```text
@uiw/react-codemirror
monaco-editor
prosemirror-*
lexical
@lexical/*
@mdxeditor/editor
@milkdown/*
```

### Unit tests

`tests/markdown-source-formatting.test.ts` as specified in I2.

If a small CodeMirror lifecycle unit test can run without introducing jsdom/testing-library dependencies, add it. Otherwise browser coverage owns DOM/editor lifecycle verification; do not add a testing framework solely for this component.

### Browser tests

Extend `tests/browser.spec.ts` to prove all of the following:

1. CodeMirror is the editable source control; the old textarea is absent for editable Markdown.
2. initial source equals the canonical Markdown exactly.
3. a direct source edit marks dirty and Save submits exact text.
4. Cancel restores exact loaded source.
5. Edit -> Preview -> Edit retains unsaved source exactly.
6. Split renders the same current unsaved buffer.
7. dirty canonical refresh creates the existing conflict state without source replacement.
8. successful Save/refetch remains conflict-free.
9. R3 remains read-only and has no formatting mutation controls.
10. every formatting toolbar action produces its exact specified Markdown source result.
11. Undo/Redo operate through editor history.
12. search/replace is available from the CodeMirror editor.
13. Markdown list continuation works.
14. responsive transition does not lose dirty source.
15. source editor and Split layout use the primary canvas geometry.
16. formatting toolbar remains reachable and does not push Save/Cancel out of the viewport.
17. Light mode computed styles are derived from Order editor variables and are not raw CodeMirror defaults.
18. Dark mode computed styles change coherently with Order theme and preserve readable source/syntax/selection/caret/search/gutters.
19. System mode follows the existing Order system-theme behavior; no editor-specific preference exists.
20. Preview continues using the safe Astryx Markdown path.

Theme browser assertions should inspect stable semantic/computed behavior, not pixel-perfect screenshots.

## 10. I7 — Deletion obligations and final closure

Before final verification, prove the candidate no longer retains the superseded editable-textarea implementation.

Delete/supersede:

- editable `TextArea` import/use from `MarkdownEditor.tsx`;
- `.order-markdown-field`;
- `.order-markdown-textarea`;
- obsolete textarea-specific browser expectations;
- any temporary toolbar/source transform duplicated inside React components;
- any provisional CodeMirror theme using raw upstream/default black/gray values.

Do not leave old and new editing paths simultaneously.

Read-only Astryx Markdown remains intentionally retained.

## 11. Exact implementation surface

### Production

```text
package.json
bun.lock
ui/src/MarkdownEditor.tsx
ui/src/MarkdownSourceEditor.tsx          new
ui/src/markdown-source-formatting.ts     new
ui/src/primitives/WorkbenchIcon.tsx      only if verified toolbar icon mappings are needed
ui/src/theme.css
```

`DocumentWorkspace.tsx` should not need semantic changes. It may change only if a minimal prop is required to preserve an existing presentation/theme value; prefer keeping the new editor composition entirely inside `MarkdownEditor`.

### Verification

```text
tests/architecture.test.ts
tests/certification.test.ts
tests/browser.spec.ts
tests/markdown-source-formatting.test.ts new
```

### Expected non-change surface

```text
src/core/**
src/shell/**
src/daemon/**
ui/src/http.ts
ui/src/query-keys.ts
database schema
HTTP contracts
lifecycle contracts
sign-off/task/run semantics
provider/OpenCode integration
router/global browser state
```

If implementation requires any of those changes, stop and return to design.

## 12. Requirement-to-phase traceability

| Requirement | Phase(s) |
|---|---|
| `GW-FR-051-EXACT-SOURCE-MARKDOWN-EDITOR` | I1, I3, I4, I6, I7 |
| `GW-FR-052-DOCUMENT-EDIT-PREVIEW-MODES` | I4, I5, I6 |
| `GW-FR-053-MARKDOWN-AUTHORING-ERGONOMICS` | I2, I3, I4, I6 |
| `GW-FR-054-LIVE-SAFE-MARKDOWN-PREVIEW` | I4, I6 |
| `GW-FR-055-EDITOR-STATE-CONTINUITY` | I3, I4, I6 |
| `GW-TR-027-CODEMIRROR-SOURCE-EDITOR-BOUNDARY` | I1, I3, I6 |
| `GW-TR-028-EXACT-SOURCE-EDITOR-SYNCHRONIZATION` | I3, I6 |
| `GW-TR-029-MARKDOWN-PREVIEW-COMPOSITION` | I4, I6 |
| `GW-TR-030-DOCUMENT-EDITOR-ERGONOMIC-CONFIGURATION` | I2, I3, I4, I6 |
| `GW-TR-031-CODEMIRROR-THEME-SPATIAL-INTEGRATION` | I5, I6 |
| `GW-TR-032-EXACT-SOURCE-EDITOR-CERTIFICATION` | I1, I6, I7 |

No FR/TR is documentation-only.

## 13. Final verification sequence

The final candidate must run, in this order:

```text
bun ci
bun run tsc --noEmit
node node_modules/vitest/vitest.mjs run tests/architecture.test.ts
node node_modules/vitest/vitest.mjs run tests/certification.test.ts
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build
node node_modules/@playwright/test/cli.js test
```

The browser gate must use the existing governed fake-OpenCode harness and representative wide/narrow viewports.

Do not claim completion from typecheck/unit tests alone.

## 14. Stop conditions

Stop implementation and return to P3/P4 if any of the following becomes necessary:

- saving a serialized Markdown AST rather than CodeMirror text;
- a second source buffer or editor-owned persisted document representation;
- a new HTTP/domain/persistence/lifecycle contract;
- a new global state store;
- a second Markdown renderer;
- rich-text/WYSIWYG authority;
- repository/LSP/code-intelligence functionality;
- direct CodeMirror imports outside the one editor owner;
- raw/default CodeMirror theme colors that cannot be mapped cleanly to the Order theme authority;
- duplicated formatting logic between toolbar and editor key handling.

## 15. Completion predicate

The work is complete only when all of these are true:

- editable governed Markdown is CodeMirror-backed;
- exact-source Save/Cancel/conflict behavior is unchanged;
- Edit/Preview/Split use one buffer;
- the required formatting toolbar is implemented through deterministic source transforms;
- CodeMirror chrome and Markdown syntax are visibly and mechanically Order-themed in Light/Dark/System;
- no default black/gray CodeMirror surface remains;
- the old editable TextArea path is deleted;
- architecture/certification/unit/build/browser gates all pass;
- no temporary verification scaffolding remains.

## 16. Canonical task block

```order-tasks
{
  "version": 1,
  "tasks": [
    {
      "id": "MARKDOWN-EDITOR-T1",
      "objective": "Replace the governed Markdown textarea with one exact-source CodeMirror editor, add deterministic Markdown formatting controls and Edit/Preview/Split presentation, integrate CodeMirror chrome and syntax fully with the existing Order System/Light/Dark theme, and permanently certify source fidelity, architecture boundaries, save/conflict continuity and responsive editor geometry.",
      "dependsOn": [],
      "scope": [
        "package.json",
        "bun.lock",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/primitives/WorkbenchIcon.tsx",
        "ui/src/theme.css",
        "tests/architecture.test.ts",
        "tests/certification.test.ts",
        "tests/browser.spec.ts",
        "tests/markdown-source-formatting.test.ts"
      ],
      "exclusions": [
        "src/core/**",
        "src/shell/**",
        "src/daemon/**",
        "ui/src/http.ts",
        "database schema",
        "HTTP/domain/lifecycle contract changes",
        "provider/OpenCode behavior",
        "router/global browser state store",
        "rich-text/AST authority",
        "second Markdown renderer",
        "repository/LSP/code-intelligence behavior"
      ],
      "acceptanceRefs": [
        "GW-FR-051-EXACT-SOURCE-MARKDOWN-EDITOR",
        "GW-FR-052-DOCUMENT-EDIT-PREVIEW-MODES",
        "GW-FR-053-MARKDOWN-AUTHORING-ERGONOMICS",
        "GW-FR-054-LIVE-SAFE-MARKDOWN-PREVIEW",
        "GW-FR-055-EDITOR-STATE-CONTINUITY",
        "GW-TR-027-CODEMIRROR-SOURCE-EDITOR-BOUNDARY",
        "GW-TR-028-EXACT-SOURCE-EDITOR-SYNCHRONIZATION",
        "GW-TR-029-MARKDOWN-PREVIEW-COMPOSITION",
        "GW-TR-030-DOCUMENT-EDITOR-ERGONOMIC-CONFIGURATION",
        "GW-TR-031-CODEMIRROR-THEME-SPATIAL-INTEGRATION",
        "GW-TR-032-EXACT-SOURCE-EDITOR-CERTIFICATION"
      ],
      "changeSurface": [
        "package.json",
        "bun.lock",
        "ui/src/MarkdownEditor.tsx",
        "ui/src/MarkdownSourceEditor.tsx",
        "ui/src/markdown-source-formatting.ts",
        "ui/src/primitives/WorkbenchIcon.tsx",
        "ui/src/theme.css",
        "tests/architecture.test.ts",
        "tests/certification.test.ts",
        "tests/browser.spec.ts",
        "tests/markdown-source-formatting.test.ts"
      ],
      "gateIds": [
        "dependency-lock",
        "typecheck",
        "architecture",
        "test",
        "build",
        "browser"
      ],
      "authorityRefs": [
        "GW-P1-FCIS",
        "GW-P1-SOC",
        "GW-P1-DRY",
        "GW-P1-STRICT-TYPING",
        "GW-P1-CANONICAL-OWNERSHIP",
        "GW-P1-EXPLICIT-FLOW",
        "GW-P1-MINIMUM-CHANGE",
        "GW-DOC-EXTERNAL-FACTS-V1-2026-11-12",
        "GW-DOC-TECHNICAL-ARCHITECTURE-V1",
        "GW-DOC-CANONICAL-CONTRACTS-V1",
        "GW-DOC-MARKDOWN-WORKBENCH-V1",
        "GW-DOC-WORKBENCH-UX-V1",
        "GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V1"
      ],
      "concernIds": [
        "ui",
        "verification"
      ]
    }
  ]
}
```
