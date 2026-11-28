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
- `GW-DOC-TECHNICAL-ARCHITECTURE` for UI dependency/state/module boundaries;
- `GW-DOC-CANONICAL-CONTRACTS §27` for browser/server-state ownership;
- `GW-DOC-EXTERNAL-FACTS` for the exact pinned Astryx `0.7.13` public component/theme contract and audited best-practice guidance;
- `GW-P1-SOC`, `GW-P1-DRY`, `GW-P1-STRICT-TYPING`, `GW-P1-CANONICAL-OWNERSHIP` and `GW-P1-MINIMUM-CHANGE`.

## 3. Design thesis

Order has one visual system.

The theme system is semantic rather than feature-specific and follows the pinned Astryx public surface before Order-owned CSS:

```text
exact ThemePreference
        ↓
one root Astryx Theme(theme-neutral/built, mode)
        ↓
pinned public Astryx theme tokens
        ↓
Order brand/base public-token bridge
+ Order-only structural/readability tokens
        ↓
Workbench primitive/specialist presentation
        ↓
every rendered Workbench service
```

Order deliberately does **not** duplicate a complete second color/type/spacing/radius/motion token system beside Astryx. Where the pinned public token has the right semantic role, that token is canonical for presentation. An `--order-*` token exists only for an Order-specific semantic/structural value the foundation does not already own.

The following are prohibited:

- a feature-local light/dark palette;
- feature-owned raw color values;
- a second theme state/store/provider;
- theme-specific JSX/component trees;
- component-local typography or spacing scales;
- visual status meaning encoded only by color;
- direct consumption of Astryx private `--_` tokens, generated/internal selectors or raw foundation palette stops;
- an Order alias that merely renames an equivalent public Astryx token;
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

The Astryx `Theme` substrate is mounted exactly once around the application root using the already-pinned built Neutral theme (`@astryxdesign/theme-neutral/built`). Its `mode` receives the canonical `ThemePreference`.

Pinned Astryx `Theme` itself owns the root `data-theme` / `data-astryx-theme` synchronization and removes the explicit `data-theme` in System mode. Order does not maintain a second theme attribute/effect. Feature/service modules do not mount another `Theme`, set an independent theme attribute, or maintain a local theme preference.

The application theme control is one small `SegmentedControl` peer-mode choice in the global toolbar. It is not a Settings-domain value and does not change workflow/navigation state.

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

Order-authored CSS keys from the root theme signal that Astryx already owns. Explicit Light/Dark mappings use the root `[data-theme="light"]` / `[data-theme="dark"]` selectors established by Astryx `Theme`; System has no explicit `data-theme`, so the Order bridge's System branch uses `@media (prefers-color-scheme: dark)` with light as the default. No second JS effective-theme state or attribute is introduced.

No descendant feature may set `data-theme` or mount a theme island.

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

### 6.1 Foundation-first ownership

The exact Order semantic roles are implemented through **public Astryx theme tokens** wherever Astryx already owns the role. Order-authored selectors do not create a parallel `--order-color-*` family.

Canonical mapping:

| Order semantic meaning | Public Astryx token(s) consumed by Order/foundation |
|---|---|
| application canvas | `--color-background-body` |
| persistent surface | `--color-background-surface` |
| subtle/secondary surface | `--color-background-muted` |
| ordinary foundation component boundary | `--color-border` inherited from the pinned built Neutral theme |
| Order structural separation | `--color-border-emphasized` with the exact Order bridge value in §6.2 |
| primary text | `--color-text-primary` |
| muted/secondary text | `--color-text-secondary` |
| current/selected/link/focus accent | `--color-text-accent`, `--color-icon-accent`, `--focus-outline-color` |
| primary filled action | `--color-accent` + `--color-on-accent` |
| selected/accent-muted surface | `--color-accent-muted` |
| information | `--color-info[-muted]`, `--color-on-info[-muted]`, `--color-text-info` |
| success/ready/complete | `--color-success[-muted]`, `--color-on-success[-muted]`, `--color-text-success` |
| warning/waiting/stale | `--color-warning[-muted]`, `--color-on-warning[-muted]`, `--color-text-warning` |
| danger/failed/blocked/destructive | Astryx `error` family: `--color-error[-muted]`, `--color-on-error[-muted]`, `--color-text-error` |

Order calls the product semantic role **danger**; the foundation token family is named **error**. This is a deliberate adapter, not two status systems.

### 6.2 Order brand/base overrides

The fixed Order identity needs a neutral work surface and deep navy / Order-blue accent. The following public Astryx roles are the only color values Order must override directly for the 0.4 Workbench target:

| Public token role | Light | Dark | Order meaning |
|---|---:|---:|---|
| `--color-background-body` | `#FFFFFF` | `#111A29` | application canvas |
| `--color-background-surface` | `#FFFFFF` | `#111A29` | persistent surface |
| `--color-background-muted` | `#F8FAFC` | `#172233` | subtle/selected-neutral surface |
| `--color-border-emphasized` | `#D9DEE8` | `#344256` | Order structural separation; ordinary foundation component boundaries continue to use inherited `--color-border` |
| `--color-text-primary` | `#0F172A` | `#EDF3FA` | primary text |
| `--color-text-secondary` | `#657187` | `#A9B8CD` | secondary/technical text |
| `--color-accent` | `#1E3A8A` | `#385AC1` | filled primary action/current emphasis |
| `--color-on-accent` | `#FFFFFF` | `#FFFFFF` | content on primary fill |
| `--color-text-accent` / `--color-icon-accent` | `#1E3A8A` | `#93B4FF` | selected/current/link/focus foreground |
| `--color-accent-muted` | `#EFF6FF` | `#203554` | selected/information-adjacent subtle surface |

Semantic info/success/warning/error colors otherwise inherit the **pinned built Neutral theme**. They are foundation-owned semantic roles rather than an Order-specific palette. Because Astryx is exact-pinned, those values cannot drift without an explicit dependency upgrade and P4 visual re-audit.

If browser certification proves one inherited status pairing cannot satisfy Order's contrast/visual-hierarchy contract on the Order base surfaces, the correction is made through the corresponding **public Astryx semantic token** in this owner. A feature-level status color is never the remedy.

### 6.3 Public-token bridge law

The Order bridge in `ui/src/theme.css` may override only public token names verified in the pinned Astryx contract. It may not set:

- private Astryx variables prefixed `--_`;
- generated/internal class selectors;
- arbitrary palette stops that bypass semantic tokens;
- undocumented component custom properties;
- a hex-derived `--order-color-*` alias family.

Exact Order color literals appear only in the root public-token bridge. Production primitive/specialist selectors consume public Astryx semantic tokens.

Pinned Astryx guidance prefers a generated/built custom theme when an application introduces a full custom Astryx theme or component overrides. Order does **not** add `@astryxdesign/cli` for this remediation because the current design requires only a bounded fixed override of already-public tokens over the already-installed built Neutral theme and no custom Astryx variants/component-theme rules. This is the minimum-change path.

If P7 discovers that a required Order visual behavior needs an Astryx component override/custom variant, JS-resolved custom theme value, or private foundation target, implementation stops and returns to DESIGN. The compliant next decision is whether to authorize a built custom Order theme/CLI—not to target private internals.

### 6.4 Semantic role mapping

- current/selected/link/focus -> accent plus readable structural/text indication;
- ordinary component boundaries -> inherited `--color-border`; Order structural separators -> bridged `--color-border-emphasized`;
- processing/information -> info;
- ready/success/complete -> success;
- waiting/stale/attention -> warning;
- failure/block/destructive -> danger/error;
- historical/secondary/technical -> primary/secondary neutral roles;
- primary command -> accent/on-accent.

Color never determines workflow meaning alone.

## 7. Typography system

Astryx typography tokens are the default owner. Order does not recreate a complete type scale.

### 7.1 Families

The root public foundation families are set to the system stacks required by Order:

```css
--font-family-body:
  ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;

--font-family-heading: var(--font-family-body);

--font-family-code:
  ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
  "Liberation Mono", monospace;
```

Order does not load the optional Neutral-theme Figtree font.

### 7.2 Role mapping

| Order role | Foundation/public token |
|---|---|
| secondary/help/row metadata | `--text-supporting-*` / `--font-size-sm` |
| body/control | `--text-body-*` / `--font-size-base` |
| ordinary label | `--text-label-*` |
| screen/work-item title | `--font-size-xl` + semibold |
| terminal result | `--font-size-2xl` + bold |
| code/technical identity | `--text-code-*` + `--font-family-code` |

Two compact Order roles are not exact foundation text roles and may remain explicit Order-only tokens:

```css
--order-font-size-technical-xs: 0.6875rem;
--order-font-size-section: 1rem;
```

Those are role tokens, not a second scale. Feature selectors may not invent intermediate `.72rem/.78rem/.85rem/.9rem/.95rem` values.

## 8. Spacing, density and geometry tokens

### 8.1 Spacing

Interior spacing uses Astryx's public 4px-derived spacing scale directly:

```text
--spacing-0-5 = 0.125rem
--spacing-1   = 0.25rem
--spacing-2   = 0.5rem
--spacing-3   = 0.75rem
--spacing-4   = 1rem
--spacing-6   = 1.5rem
--spacing-8   = 2rem
```

No `--order-space-*` aliases are introduced for one-to-one values.

The Astryx layout law is binding inside Workbench composition: the container owns region padding, children do not recreate the same inset with margins, tight and generous gaps express grouping, and a row uses one control size. Raw pixel/rem values are reserved for truly structural/Order-specific geometry rather than ordinary interior spacing.

### 8.2 Density and Order-specific geometry

Astryx element-size/density props own ordinary controls and collections. Pinned foundation sizes (`--size-element-*`) are used through component `size`/`density` props before CSS.

Order owns only the structural/readability dimensions that the foundation cannot infer. These are **target semantic geometry values**, not evidence that the current selectors/component APIs implementing them are reusable:

```css
--order-toolbar-height: 3.25rem;
--order-identity-height: 3rem;
--order-context-width: 22rem;
--order-context-max-width: 24rem;
--order-master-width: 18rem;
--order-prose-max-width: 52rem;
--order-review-max-width: 72rem;
```

During the current 0.6.0 destructive foundation reconstruction, the old structural selectors that consume these tokens are removed before fresh composition primitives are authored. A token value may reappear only because this canonical theme owner requires it for the reconstructed P3/P4 geometry; no current CSS rule, class name, DOM hierarchy or primitive API is preserved merely because it currently consumes the same token.

Operational tables/lists choose foundation `compact | balanced | spacious` density from the interaction frequency; they do not invent per-feature row heights. The Workbench target normally uses compact for high-volume operational/event data and balanced for ordinary review/settings collections unless the owning P3 interaction requires otherwise.

The structural breakpoint contract remains owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`: wide `>=1280px`, medium `800-1279px`, narrow `<800px`. Foundation components may have their own internal responsive behavior, but that behavior cannot create a second Workbench topology breakpoint.

## 9. Borders, radii, focus, elevation and motion

Astryx public tokens own ordinary component radii, focus and motion. Order does not override them merely to create a slightly different number.

Canonical usage:

```text
component/internal radius -> --radius-inner / --radius-element
container/dialog radius   -> --radius-container
pill/segmented semantics  -> --radius-full
focus                     -> --focus-outline-width/style/color/offset
ordinary transition       -> --duration-fast / foundation component motion
```

Rules:

- semantic grouping is spacing/component-anatomy first; a horizontal line is not a generic section separator. Use the foundation border role only for a real owner-defined structural boundary, table/resource-row separation, control boundary or overlay boundary; repeated full-width section `border-bottom`/`<hr>` grammar is prohibited;
- pill radius is reserved for actual pill/segmented/status semantics, not arbitrary feature chrome;
- persistent Workbench surfaces do not use decorative box shadows;
- temporary overlays use the foundation-owned elevation behavior; feature CSS does not recreate it;
- focus remains visibly distinct from selected/current state;
- hover/press/loading/disabled behavior is owned by the foundation component where one exists;
- reduced-motion behavior is inherited from Astryx/components and any Order-only motion obeys `prefers-reduced-motion`;
- normal text targets at least 4.5:1 contrast, large text 3:1, and meaningful non-text/focus boundaries 3:1.

A future product requirement for a different radius/focus/motion character is a theme-design change and must be expressed through **public** Astryx tokens/theme configuration rather than private component variables.

## 10. Component visual parity contract

Component structure is owned by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`; this section owns the visual-role mapping that makes those components one design family.

| Component role | Canonical visual treatment |
|---|---|
| application toolbar | persistent-surface treatment in both light and dark; brand blue/deep navy is an identity/interaction accent, not a mandatory full-width filled header. Orientation, Project context and global utilities remain one compact row. |
| primary action | Astryx `Button` primary variant with accent/on-accent foundation treatment, one dominant primary command, and foundation hover/press/loading/focus behavior |
| secondary action | Astryx secondary variant with foundation surface/border/state behavior and the same size family as peer controls |
| ghost action | Astryx ghost variant; no feature-restyled chrome |
| destructive action | foundation destructive/error treatment plus explicit destructive label semantics; irreversible actions are confirmed through AlertDialog |
| field | Astryx field-owning control where available; otherwise WorkbenchField/Astryx Field with canonical label/help/status wiring; one control size per row |
| status | compact neutral/info/success/warning/danger treatment; text/icon accompanies color |
| notice | inline semantic info/success/warning/danger surface; action remains subordinate unless it is the current workflow action |
| table/resource row | dense row height, border separation, consistent current/selected treatment |
| section/material heading | heading token + stable subordinate description/action alignment |
| workflow rail | component architecture owns geometry; theme owns accent/current/historical/unreached visual roles without changing cell size |
| semantic disclosure | compact subordinate expansion for a specifically named same-task detail only; never generic Technical-details/Supporting-history chrome |
| technical inspection | Context/Settings-diagnostics inspection uses secondary/technical typography and bounded code treatment inside the explicit inspection surface, not as a productive-surface strip |
| task panel / Context overlay / confirmation | Task panel = Dialog with stable header/body/footer regions and footer-owned Cancel + one primary command; medium/narrow Context = Drawer; `WorkbenchConfirmation kind="safety"` = Dialog for explicitly authorized informed-consent safety mutations; `kind="destructive"` = AlertDialog for destructive/irreversible consent. The semantic kind fixes substrate/action role; callers do not choose arbitrary variants. Each inherits pinned foundation focus/dismissal/elevation mechanics |
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

Astryx leaves inherit the root `Theme`. Order consumes supported component props/variants first and public Astryx theme tokens second. The §13 bridge overrides only the audited public tokens required for Order brand/base parity.

Feature selectors do not target foundation internals, private `--_` variables or generated/internal class names to create local variants.

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

1. **root public-Astryx-token bridge** containing only the exact Order brand/base overrides in §6.2 plus the system/light/dark selector mapping;
2. **Order-only structural/readability tokens** from §§7-8 that have no equivalent foundation role;
3. **reconstructed closed Workbench primitive selectors** consuming component props/public Astryx tokens/Order-only tokens; current design-bearing primitive selectors are not migration baselines;
4. **specialist content/editor selectors** consuming the same semantic roles;
5. **responsive overrides at canonical Workbench breakpoints only**.

There is no second private Order color palette layer and no generic foundation-token alias layer.

A feature-by-feature chronological append log is prohibited.

### 13.3 Raw-value containment

Outside the root bridge:

- no raw hex/rgb/hsl/color-mix semantic value;
- no Tailwind/private foundation palette stop;
- no private Astryx variable prefixed `--_`;
- no generated/internal Astryx class selector;
- no hex-derived Order variable;
- no one-to-one alias of a public Astryx token;
- no feature-local font-size scale;
- no feature-local recurring spacing/radius/control-height value where a foundation prop/token exists;
- no feature-owned box shadow;
- no feature structural breakpoint.

Selectors use public Astryx semantic tokens plus the small §7-§8 Order-only token set.

### 13.4 Foundation bridge

The root bridge is the only place Order may override Astryx theme variables. It assigns the exact §6.2 values directly to **verified public Astryx semantic tokens**.

It is deliberately not a custom component theme:

- no private `--_` token;
- no component-internal selector;
- no custom Astryx prop variant;
- no JS theme-value lookup requirement;
- no duplicate Order color-token namespace.

Architecture fitness keeps an explicit allowlist of the public token names Order overrides. A newly required public token is a theme-design change when it introduces new semantic meaning. A required component override/custom variant returns to DESIGN for an explicit built-theme/CLI decision.

### 13.5 Selector ownership

Reusable recurring visual mechanics belong to primitive selectors owned by the **current canonical primitive responsibilities**. Existing selector names/declarations have no preservation authority: when their owning design-bearing primitive is in the §16.6 destructive set of `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2`, those selectors are removed at the foundation purge checkpoint and recreated only as required by the new primitive implementation.

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

P7 therefore replaces these mechanisms rather than preserving them behind aliases. For 0.6.0 this includes the old design-bearing Workbench structural/composition selectors themselves: they are purged with the old primitive implementation and are not retained as hidden compatibility CSS for the reconstructed foundation.

The implementation migration must:

1. establish the §6.2 public-Astryx-token bridge over the already-installed built Neutral theme;
2. establish only the Order-specific typography/structural/readability tokens retained by §§7-8;
3. destructively reconstruct the design-bearing primitive subset defined by `GW-DOC-WORKBENCH-COMPONENT-ARCHITECTURE-V2 §16.6` over pinned Astryx props/variants/density/layout, then add public-token styling only for residual Order semantics; the retained atomic subset is positively revalidated rather than rewritten;
4. migrate specialist Markdown/CodeMirror/evidence rendering onto the same public semantic roles;
5. migrate every renderer in the component-architecture coverage matrix;
6. remove legacy raw palette variables, raw selector colors and one-to-one `--order-color-*` aliases;
7. remove ad-hoc type/spacing/radius/control values that duplicate foundation props/public tokens;
8. remove duplicate/dead/obsolete visual selectors, every superseded structural selector owned by the destructive primitive set, and any targeting of Astryx internals;
9. reduce `styles.css` to its §13.1 ownership;
10. prove light/dark/system and cross-component parity on the real SPA.

A compatibility alias may exist only transiently inside one implementation commit while migrating call sites and must be absent from the final candidate. A permanent legacy token alias is not an accepted completion state.

## 15. Verification and architecture fitness

### 15.1 Token completeness

Mechanical tests prove:

- every §6.2 Order override targets an audited public Astryx token and has the exact Light/Dark value;
- inherited info/success/warning/error roles resolve from the pinned built Neutral theme in both modes;
- every retained Order-only token in §§7-8 exists with the exact value and does not duplicate a public foundation token;
- no private Astryx token/internal selector is referenced;
- no duplicate semantic token owner exists.

### 15.2 Raw-value and selector containment

Architecture fitness proves:

- raw semantic color literals occur only in the root public-token bridge;
- `--order-color-<hex>` and redundant `--order-color-*` alias families are absent;
- Order primitive/specialist selectors consume public Astryx semantic tokens directly where the role is foundation-owned;
- private Astryx `--_` variables, internal/generated selectors and undocumented component custom properties are absent;
- non-tokenized feature font-size/recurring spacing/radius/control-height/shadow values are absent where a foundation prop/token owns the mechanic;
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

**Required behavior:** `ui/src/theme.css` implements the §6-§9 foundation-first token contract: exact Order brand/base values override only audited public Astryx tokens, foundation-owned status/spacing/radius/focus/motion roles remain canonical, and `--order-*` tokens exist only for genuinely Order-specific roles/geometry.

**Acceptance:** token-completeness/containment fitness passes; no redundant Order color/palette namespace, private Astryx token/internal selector or feature/specialist palette/type/spacing/control system exists.

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

**Required behavior:** Order-authored CSS obeys §13 and the pinned Astryx public styling contract: component props/layout/density own mechanics first, public theme tokens own shared visual values second, Order CSS owns only residual semantic/structural presentation, and feature-era competing systems are deleted.

**Acceptance:** permanent architecture fitness proves one presentation stylesheet, a bounded public-token bridge, no private/internal Astryx dependencies, no redundant legacy/Order palette aliases, canonical breakpoints and no feature-local component/theme system.

## 17. Non-goals

This design does not authorize:

- user-defined themes;
- arbitrary accent-color selection;
- per-project theming;
- per-feature dark-mode variants;
- a CSS-in-JS theme layer;
- `@astryxdesign/cli` or another design-token build/generator package solely for the current bounded public-token bridge; if component overrides/custom variants later require a built Order theme, that is a new P4/dependency decision;
- another global browser state store;
- a visual regression platform dependency as a prerequisite for correctness;
- keeping legacy token families for compatibility;
- replacing Astryx as the approved foundation.

Any future requirement for those capabilities returns to DESIGN.
