# Workbench theme and styling architecture

**Status:** Binding P4 technical design  
**Canonical concern ID:** `GW-DOC-WORKBENCH-THEME`  
**Versioned concern ID:** `GW-DOC-WORKBENCH-THEME-V1`  
**Pyramid layer:** P4 technical architecture  
**Implementation owner:** `ui/src/theme.css` for Order-authored presentation rules; root `App` composition for theme preference/effective-theme activation

## 1. Purpose and canonical ownership

This document is the sole technical owner for the Order Workbench **theme, visual-token and stylesheet governance concern**.

It realizes the visual/theme behavior required by `GW-DOC-WORKBENCH-UX-V2`, especially:

- `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE`;
- `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION`;
- `GW-FR-235-GLOBAL-THEME-PARITY`.

`GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` remains the canonical owner for component/primitive responsibilities, screen composition and renderer-to-primitive coverage. This document does **not** define another component system. It defines how every approved primitive, leaf and specialist renderer is styled and themed.

The ownership boundary is therefore:

```text
P3 Workbench UX meaning
        |
        +--> P4 Workbench component architecture
        |      component responsibilities/composition
        |
        +--> P4 Workbench theme architecture  <-- this document
               visual roles/tokens/theme/CSS governance
```

A component cannot override the theme contract, and the theme contract cannot invent a component responsibility.

## 2. Governing authority

This design conforms to:

- `GW-DOC-WORKBENCH-UX-V2` for observable visual/theme behavior;
- `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` for the closed primitive/approved-leaf vocabulary;
- `GW-DOC-PRODUCT-IDENTITY-V1` for the aperture/focus identity and deep navy / Order-blue posture;
- `GW-DOC-TECHNICAL-ARCHITECTURE-V1` for UI dependency/state/module boundaries;
- `GW-DOC-CANONICAL-CONTRACTS-V1 §27` for browser/server-state ownership;
- `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-MINIMUM-CHANGE`.

## 3. Design thesis

Order has one visual system.

The theme system is semantic rather than feature-specific:

```text
exact theme preference
        ↓
one effective root theme
        ↓
semantic visual tokens
        ↓
primitive/specialist CSS
        ↓
every rendered Workbench service
```

The following are prohibited:

- a feature-local light/dark palette;
- feature-owned raw color values;
- a second theme state/store/provider;
- theme-specific JSX/component trees;
- component-local typography or spacing scales;
- visual status meaning encoded only by color;
- direct consumption of private palette tokens by feature/primitive selectors;
- a specialist renderer with an independent theme;
- styling the same semantic component differently because it appears in another feature;
- retaining legacy CSS values/selectors as a parallel visual system after migration.

Theme is presentation state only. It is not WorkItem/domain state, daemon state, a transport contract or an OrderConfig field.

## 4. Theme preference and effective-theme ownership

### 4.1 Preference vocabulary

The only theme preferences are:

```ts
type ThemePreference = "system" | "light" | "dark";
```

This type is UI-local and does not enter `src/core/contracts.ts`.

### 4.2 Root owner

`App` is the sole theme-preference owner.

The Astryx `Theme` substrate is mounted exactly once around the application root. Its `mode` receives the same `ThemePreference` used by Order styling. Feature/service modules do not mount another `Theme`, set an independent theme attribute, or maintain a local theme preference.

The application theme control is one small peer-choice control in the global toolbar. It is not a Settings-domain value and does not change workflow/navigation state.

### 4.3 Browser-local persistence

The canonical browser-local preference key is:

```text
pontivus-order-theme
```

Persistence law:

- stored `"light"` -> Light;
- stored `"dark"` -> Dark;
- absent/invalid/unreadable -> System;
- selecting System removes the explicit preference;
- storage read/write failure is non-fatal and does not change the live selected preference.

No daemon API, SQLite row, cookie or Order config field stores theme preference.

### 4.4 Effective theme

System follows `prefers-color-scheme`.

The effective visual theme is always one of:

```text
LIGHT
DARK
```

Changing effective theme changes token values/foundation rendering only. It does not remount workflow services, alter hierarchy, clear local editor state, change selected material, mutate URL state or initiate daemon activity.

The Order CSS theme signal and Astryx root theme must resolve from the same preference. If the foundation does not expose a usable root selector for Order CSS, `App` may maintain one root `data-theme` attribute derived from the same preference/effective-theme calculation; that attribute is a rendering projection, not another state owner.

No descendant feature may set `data-theme`.

## 5. Canonical visual character

Order's aperture/focus identity is expressed through controlled emphasis and information clarity rather than repeated decorative motifs.

The Workbench is:

- neutral-first, with deep navy / Order blue as the controlled brand/interaction accent;
- flat and low-chrome;
- compact, professional and scan-efficient;
- border/spacing-driven rather than card/shadow-driven;
- visually quiet until current action, selection, blocker or exceptional state requires emphasis;
- semantically identical in light and dark.

Persistent surfaces use no decorative elevation. Temporary overlays/dialogs may use one foundation-owned overlay elevation.

Gradients, feature accent palettes, dashboard-card styling and decorative motion are outside the canonical language.

## 6. Canonical semantic color system

### 6.1 Public semantic token names

These are the complete public Order color roles consumed by Order-authored selectors:

```text
--order-color-canvas
--order-color-surface
--order-color-subtle
--order-color-border
--order-color-text
--order-color-muted
--order-color-accent
--order-color-primary
--order-color-primary-hover
--order-color-on-primary
--order-color-info-bg
--order-color-info-fg
--order-color-success-bg
--order-color-success-fg
--order-color-warning-bg
--order-color-warning-fg
--order-color-danger-bg
--order-color-danger-fg
```

No additional semantic color token is introduced in P7 without DESIGN authority demonstrating a genuinely new semantic role.

Aliases such as editor background may exist only when an external/specialist API requires a dedicated variable; every alias must resolve directly to one of these semantic roles and may not contain an independent color value.

### 6.2 Exact light/dark values

| Semantic role | Light | Dark | Meaning |
|---|---:|---:|---|
| canvas | `#FFFFFF` | `#111A29` | application background |
| surface | `#FFFFFF` | `#111A29` | primary persistent surface |
| subtle | `#F8FAFC` | `#172233` | secondary/selected-neutral surface |
| border | `#D9DEE8` | `#344256` | ordinary separation |
| text | `#0F172A` | `#EDF3FA` | primary text |
| muted | `#657187` | `#A9B8CD` | secondary/technical text |
| accent | `#1E3A8A` | `#93B4FF` | current/selected/link/focus identity |
| primary | `#1E3A8A` | `#385AC1` | primary filled action |
| primary-hover | `#1D4ED8` | `#4D6ED5` | primary-action hover |
| on-primary | `#FFFFFF` | `#FFFFFF` | content on primary action |
| info-bg | `#EFF6FF` | `#203554` | processing/information surface |
| info-fg | `#1D4ED8` | `#BAD0FF` | processing/information foreground |
| success-bg | `#D1FAE5` | `#173B31` | ready/success/complete surface |
| success-fg | `#047857` | `#73E5B1` | success foreground |
| warning-bg | `#FEF3C7` | `#463923` | waiting/stale/attention surface |
| warning-fg | `#A16207` | `#FACC77` | warning foreground |
| danger-bg | `#FEF2F2` | `#44282F` | failed/blocked/destructive surface |
| danger-fg | `#B91C1C` | `#FFADB0` | danger foreground |

### 6.3 Private palette declaration law

Exact color literals occur only in the initial theme-token block of `ui/src/theme.css`.

The preferred implementation declares the exact light/dark role values once as private role palette values, then maps the public semantic tokens to the effective theme. Private palette identifiers are not consumed outside that block.

A compliant shape is conceptually:

```css
:root {
  --order-palette-light-canvas: #ffffff;
  --order-palette-dark-canvas: #111a29;
  /* complete exact light/dark role values */

  --order-color-canvas: var(--order-palette-light-canvas);
  /* complete light semantic mapping */
}

:root[data-theme="dark"] {
  --order-color-canvas: var(--order-palette-dark-canvas);
  /* complete dark semantic mapping */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --order-color-canvas: var(--order-palette-dark-canvas);
    /* complete dark semantic mapping */
  }
}
```

The implementation may combine selectors/mappings more compactly, but:

- each exact light/dark color value has one declaration owner;
- public selectors consume only `--order-color-*` semantic roles;
- a hex-derived variable family such as `--order-color-fef3c7` is prohibited;
- no selector after the token/bridge blocks contains raw hex/rgb/hsl/color-mix semantic styling.

### 6.4 Semantic role mapping

- current/selected/link/focus -> accent, plus structural/text indication;
- processing/information -> info;
- ready/success/complete -> success;
- waiting/stale/attention -> warning;
- failure/block/destructive -> danger;
- historical/secondary/technical -> neutral text/muted/subtle;
- primary action -> primary/on-primary.

Color never determines workflow meaning alone.

## 7. Typography system

### 7.1 Canonical families

```css
--order-font-sans:
  ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;

--order-font-mono:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
  "Liberation Mono", monospace;
```

### 7.2 Canonical type tokens

| Token | Value | Role |
|---|---:|---|
| `--order-font-size-xs` | `0.6875rem` | technical/caption |
| `--order-font-size-sm` | `0.75rem` | secondary/help/row metadata |
| `--order-font-size-md` | `0.875rem` | body/control |
| `--order-font-size-heading` | `1rem` | section/material heading |
| `--order-font-size-title` | `1.25rem` | application/work-item/screen title |
| `--order-font-size-result` | `1.5rem` | terminal result only |
| `--order-font-weight-regular` | `400` | ordinary text |
| `--order-font-weight-semibold` | `600` | labels/headings/current emphasis |
| `--order-font-weight-bold` | `700` | terminal/rare strong emphasis |
| `--order-line-height-body` | `1.5` | prose/body |
| `--order-line-height-compact` | `1.35` | compact controls/metadata |

Order selectors use these tokens rather than feature-local `.72rem`, `.78rem`, `.8rem`, `.85rem`, `.9rem`, `.95rem` scales.

Technical ids/hashes/paths/code use the mono family only in technical/content roles.

## 8. Spacing, density and geometry tokens

### 8.1 Spacing scale

```css
--order-space-05: 0.125rem;
--order-space-1:  0.25rem;
--order-space-2:  0.5rem;
--order-space-3:  0.75rem;
--order-space-4:  1rem;
--order-space-6:  1.5rem;
--order-space-8:  2rem;
```

Recurring component padding/gap/margin uses only this scale.

Layout mechanics may still use semantic percentages, `fr`, `minmax()`, `auto`, `0` and other non-design arithmetic where required by component topology. They may not introduce a second recurring spacing scale.

### 8.2 Density/geometry

```css
--order-control-height-compact: 2rem;
--order-control-height-standard: 2.25rem;
--order-row-height-dense: 2.25rem;
--order-toolbar-height: 3.25rem;
--order-identity-height: 3rem;
--order-context-width: 22rem;
--order-context-max-width: 24rem;
--order-master-width: 18rem;
--order-prose-max-width: 52rem;
--order-review-max-width: 72rem;
```

The structural breakpoint contract remains owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`: wide `>=1280px`, medium `800-1279px`, narrow `<800px`. Theme/style code may consume those boundaries; it may not invent another structural breakpoint.

## 9. Borders, radii, focus, elevation and motion

Canonical tokens:

```css
--order-border-width: 1px;
--order-radius-control: 0.375rem;
--order-radius-internal: 0.25rem;
--order-radius-pill: 999px;

--order-focus-width: 2px;
--order-focus-offset: 2px;

--order-motion-fast: 120ms;
--order-motion-standard: 180ms;
```

Rules:

- persistent region separation uses the border token plus semantic border color;
- pill radius is reserved for actual pill/segmented/status semantics, not arbitrary feature chrome;
- persistent Workbench surfaces do not use decorative box shadows;
- one foundation-owned overlay elevation is allowed for drawers/dialogs;
- focus uses accent and remains visibly distinct from selected/current state;
- hover may change semantic surface/foreground but cannot move geometry;
- reduced-motion disables non-essential transitions;
- normal text targets at least 4.5:1 contrast, large text 3:1, and meaningful non-text/focus boundaries 3:1.

## 10. Component visual parity contract

Component structure is owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`; this section owns the visual-role mapping that makes those components one design family.

| Component role | Canonical visual treatment |
|---|---|
| primary action | primary background + on-primary foreground; primary-hover on hover; canonical control height/radius/focus |
| secondary action | surface/text/border; subtle hover; canonical control height/radius/focus |
| ghost action | transparent/text; subtle hover; canonical focus; no private chrome |
| destructive action | danger role with explicit destructive label/icon semantics; canonical action geometry |
| field | canonical label/help/error typography and spacing; standard control height; surface/text/border/focus |
| status | compact neutral/info/success/warning/danger treatment; text/icon accompanies color |
| notice | inline semantic info/success/warning/danger surface; action remains subordinate unless it is the current workflow action |
| table/resource row | dense row height, border separation, consistent current/selected treatment |
| section/material heading | heading token + stable subordinate description/action alignment |
| workflow rail | component architecture owns geometry; theme owns accent/current/historical/unreached visual roles without changing cell size |
| disclosure/technical detail | secondary/technical typography, muted role, bounded code treatment |
| task panel/confirmation/overlay | same surface/text/border/action language as underlying app plus foundation-owned elevation |
| Markdown/code/evidence | content mechanics may differ; surrounding type/color/focus remains canonical |
| source editor | specialist mechanics only; all colors/type/focus derive from canonical roles |

The same primitive variant therefore looks the same in every feature. Feature CSS may not restyle a primitive descendant to make it locally distinctive.

## 11. Semantic status and feedback mapping

Only `WorkbenchStatus` and `WorkbenchNotice` own reusable semantic status/feedback visual treatment above the foundation.

Canonical tones:

```text
neutral
info
success
warning
danger
```

Domain/workflow adapters select a semantic tone; they do not select colors.

`WorkbenchAttention` may compose one status/notice/action region but does not create a sixth color/status system.

A raw `Badge` is not a status owner in feature code. A badge-like foundation leaf is allowed only inside the canonical Status implementation.

## 12. Specialist renderer theming

### 12.1 Markdown

Markdown inherits the containing surface, text, muted, accent/link, typography and readable-measure roles. It does not define a second document theme.

### 12.2 Code/evidence

Code/evidence uses the canonical mono family, surface/subtle/text/muted/border roles and bounded scrolling. Syntax/highlight color cannot be used to imply workflow status.

### 12.3 CodeMirror source editor

The exact source editor maps:

- editor background -> surface;
- editor text -> text;
- gutter background -> subtle;
- gutter text -> muted;
- border -> border;
- selection -> info-bg;
- active line -> subtle;
- search match -> warning-bg with warning-fg boundary;
- link -> accent/info-fg;
- focus -> canonical accent focus;
- code/syntax emphasis -> text/muted unless the syntax renderer needs a non-semantic readability distinction that is explicitly mapped in this document.

No independent CodeMirror light/dark palette is allowed.

### 12.4 Astryx/foundation leaves

Astryx leaves inherit the root `Theme`. Where Astryx/Tailwind exposes foundation CSS variables that must be overridden to achieve Order parity, those overrides live only in the §13 foundation bridge and are mapped from Order semantic tokens.

Feature selectors do not target foundation internals to create local variants.

## 13. Stylesheet and foundation-bridge governance

### 13.1 File ownership

Order-authored application styling has exactly two CSS files with distinct responsibilities:

`ui/src/styles.css`
- owns CSS layer declaration/import order;
- imports Tailwind/Astryx foundation CSS and `theme.css`;
- owns only irreducible document/root reset necessary before the theme stylesheet;
- does **not** own feature/primitive visual selectors.

`ui/src/theme.css`
- sole Order-owned design-token and presentation stylesheet;
- owns theme tokens, foundation bridge, primitive selectors, specialist selectors and canonical responsive overrides.

A new Order-authored CSS file requires DESIGN authority. CSS modules or feature stylesheets are not introduced as a convenience escape from this owner.

### 13.2 Canonical `theme.css` section order

The target stylesheet is ordered:

1. **private exact light/dark role palette**;
2. **public semantic theme tokens and effective-theme mapping**;
3. **typography/spacing/geometry/focus/motion tokens**;
4. **bounded Astryx/Tailwind foundation bridge**;
5. **closed Workbench primitive selectors**;
6. **specialist content/editor selectors**;
7. **responsive overrides at canonical breakpoints only**.

A feature-by-feature chronological append log is prohibited.

### 13.3 Raw-value containment

Outside sections 1-4:

- no raw hex/rgb/hsl/color-mix semantic value;
- no foundation palette variable such as Tailwind `--color-*`;
- no hex-derived Order variable;
- no feature-local font-size scale;
- no feature-local recurring spacing/radius/control-height value;
- no feature-owned box shadow;
- no feature structural breakpoint.

Selectors use semantic tokens.

### 13.4 Foundation bridge

The foundation bridge is the only place Order may assign Astryx/Tailwind theme variables.

Every bridge assignment must resolve from an Order semantic token or the exact private theme-role palette. It is an adapter, not another theme.

Architecture fitness keeps an explicit allowlist of bridge variable names. A newly required foundation variable is a theme-design change when it introduces new semantic meaning; a direct one-to-one bridge for an already-owned role is an implementation detail.

### 13.5 Selector ownership

Reusable recurring visual mechanics belong to primitive selectors.

Feature/service selectors are permitted only for semantic content layout that is genuinely feature-specific and not already primitive-owned. Such selectors:

- consume only canonical tokens;
- do not style primitive internals;
- do not redefine actions/fields/status/notices/tables/timeline/overlays;
- do not introduce new responsive topology.

The end-state target is that most current feature-era selectors disappear as renderers migrate to the closed primitive set.

## 14. Current CSS audit and required migration

The existing `ui/src/theme.css` is implementation evidence, not authority.

At the design head audited for this document it contains approximately 1,480 lines and materially violates the target system:

- hex-derived `--order-color-*` palette variables are publicly consumable by later selectors;
- light/dark exact values are duplicated across multiple root/media blocks;
- semantic Workbench roles cover only a subset of the required status/action roles;
- editor aliases consume legacy hex-derived palette variables instead of the closed semantic role set;
- raw warning/danger colors remain in production selectors;
- `color-mix()` remains in a feature selector;
- dozens of local font sizes form a parallel type scale;
- many arbitrary fractional spacing/geometry values form parallel feature scales;
- the obsolete `999px`/content-era layout system and feature-era visual selectors remain alongside newer Workbench styles;
- `styles.css` still contains Order feature styling that belongs in `theme.css`.

P7 therefore replaces these mechanisms rather than preserving them behind aliases.

The implementation migration must:

1. establish the exact semantic token blocks in §§6-9;
2. establish the bounded foundation bridge;
3. migrate completed primitives to token-only selectors;
4. migrate specialist Markdown/CodeMirror/evidence rendering;
5. migrate every renderer in the component-architecture coverage matrix;
6. remove legacy raw palette variables and raw selector colors;
7. remove ad-hoc type/spacing/radius/control values that duplicate canonical tokens;
8. remove duplicate/dead/obsolete visual selectors;
9. reduce `styles.css` to its §13.1 ownership;
10. prove light/dark/system parity on the real SPA.

A compatibility alias may exist only transiently inside one implementation commit while migrating call sites and must be absent from the final candidate. A permanent legacy token alias is not an accepted completion state.

## 15. Verification and architecture fitness

### 15.1 Token completeness

Mechanical tests prove:

- every public semantic color token exists;
- every exact light/dark role value matches §6.2;
- every typography/spacing/geometry/focus/motion token exists with the exact value in §§7-9;
- every semantic role has both light/dark effective values;
- no duplicate public semantic token owner exists.

### 15.2 Raw-value and selector containment

Architecture fitness proves:

- raw semantic color literals occur only in the allowed token/bridge blocks;
- `--order-color-<hex>` variables are absent;
- Order selectors outside the token/bridge blocks do not consume foundation `--color-*` variables;
- non-tokenized feature font-size/recurring spacing/radius/control-height/shadow values are absent;
- structural media queries use only the component architecture's canonical breakpoints;
- `styles.css` contains no Order feature/primitive selector.

### 15.3 Component parity browser matrix

Browser tests render representative instances of each reusable primitive role across at least two materially different services and prove the same computed semantic design values for:

- action variants;
- fields;
- status/notice tones;
- operational rows;
- headings;
- disclosure;
- confirmation/task panel/overlay.

The test compares semantic roles/computed CSS properties, not screenshot pixels alone.

### 15.4 Theme parity browser matrix

The real SPA is certified in Light and Dark, and System is certified against both mocked effective color schemes.

Coverage includes:

- queue;
- creation task panel;
- Settings;
- workflow rail/current attention;
- document/Markdown;
- Dialogue;
- Review/Approval;
- Implementation table/master/detail/timeline;
- evidence/code;
- terminal result;
- Context;
- confirmation/overlay;
- CodeMirror source editor.

For every representative state, tests prove semantic meaning and visible focus/selection/error distinction remain intact.

Theme change also proves:

- no reload;
- selected destination/WorkItem/material retained;
- dirty Markdown buffer retained;
- no workflow mutation/query reset caused solely by theme choice;
- overlay/content rendered under the same effective theme.

### 15.5 Contrast and accessibility

Automated/browser checks cover the canonical token pairings used by ordinary text, large text, focus and meaningful boundaries. Any pairing that cannot meet the §9 contrast contract must be corrected in this canonical theme owner rather than overridden by a feature.

## 16. Technical requirements

### GW-TR-099-CANONICAL-THEME-TOKEN-OWNERSHIP

**Realizes:** `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE`, `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION`, `GW-FR-235-GLOBAL-THEME-PARITY`.

**Required behavior:** `ui/src/theme.css` owns one closed semantic token system with the exact light/dark color, typography, spacing, geometry, focus and motion roles in §§6-9; production selectors consume those roles rather than raw/private palette values.

**Acceptance:** token-completeness/containment fitness passes and no feature/specialist renderer defines another palette/type/spacing/control system.

### GW-TR-100-GLOBAL-THEME-ACTIVATION-AND-PARITY

**Realizes:** `GW-FR-235-GLOBAL-THEME-PARITY`.

**Required behavior:** one root `ThemePreference` owner and one Astryx `Theme` substrate control System/Light/Dark for the complete SPA; browser-local preference is non-domain presentation state and effective theme changes only rendering tokens/foundation theme.

**Acceptance:** System/Light/Dark browser certification covers every representative surface without reload, theme island, workflow-state change, selection loss or dirty-buffer loss.

### GW-TR-101-COMPONENT-VISUAL-PARITY

**Realizes:** `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE`, `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION`.

**Required behavior:** the complete primitive/approved-leaf set from `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2` consumes this theme language so the same semantic primitive variant has the same visual treatment in every service.

**Acceptance:** cross-service component-parity certification proves equivalent roles use the same semantic tokens/computed treatment and architecture fitness rejects feature overrides of primitive internals.

### GW-TR-102-THEME-STYLESHEET-GOVERNANCE

**Realizes:** `GW-FR-231-CANONICAL-WORKBENCH-VISUAL-LANGUAGE`, `GW-FR-234-UNIFIED-WORKBENCH-COMPONENT-PRESENTATION`, `GW-FR-235-GLOBAL-THEME-PARITY`.

**Required behavior:** Order-authored CSS obeys the §13 ownership model and canonical `theme.css` section order; raw values/foundation bridge variables are contained, feature-era competing style systems are deleted, and no new stylesheet bypasses the canonical owner.

**Acceptance:** permanent architecture fitness proves one token/presentation stylesheet, token-only production selectors outside the bounded bridge, canonical breakpoints, no legacy hex-derived palette family and no feature-local component/theme system.

## 17. Non-goals

This design does not authorize:

- user-defined themes;
- arbitrary accent-color selection;
- per-project theming;
- per-feature dark-mode variants;
- a CSS-in-JS theme layer;
- a design-token build/generator package;
- another global browser state store;
- a visual regression platform dependency as a prerequisite for correctness;
- keeping legacy token families for compatibility;
- replacing Astryx as the approved foundation.

Any future requirement for those capabilities returns to DESIGN.
