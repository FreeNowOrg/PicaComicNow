# UI Refactoring Design: Neubrutalism + UnoCSS

## Goals

- Remove naive-ui dependency entirely, replace with custom Pica* components
- Adopt UnoCSS (preset-wind4 + preset-attributify + preset-icons) as atomic CSS framework
- Switch all styling from sass (indented syntax) to scss
- Apply Neubrutalism visual style across all components
- Keep existing ts + pug template convention
- Preserve current layout and interaction logic (visual refresh, not redesign)

## Design Tokens & UnoCSS Configuration

Based on existing config from another project, adapted for PicaComicNow.

### UnoCSS Stack

- `preset-wind4` — Tailwind v4 compatible atomic classes
- `preset-attributify` — attribute-based class syntax in pug templates
- `preset-icons` — icon system replacing @vicons/fa
- `@unocss/extractor-pug` — pug template class extraction

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `cream` | `#FFF8DC` | Page background |
| `brand-pink` | `#FF5C8A` | Primary color |
| `brand-pinkHot` | `#FF6B9D` | Primary hover state |
| `brand-purple` | `#A78BFA` | Accent |
| `brand-green` | `#7FD957` | Success / accent |
| `brand-yellow` | `#FFE066` | Warning / accent |
| `danger` | `#FF5555` | Error/danger — add to UnoCSS theme colors |
| `link` | `#3F51B5` | Link color — add to UnoCSS theme colors |
| `bookmark` | `#FF69B4` | Bookmark color — add to UnoCSS theme colors |

### Neubrutalism Visual Parameters

| Parameter | Value |
|---|---|
| Border width | `3px` (standard) / `2px` (small) |
| Border color | `#000` (black) |
| Shadow offset | `6px 6px 0` (standard) / `4px 4px 0` (small) / `8px 8px 0` (large) |
| Shadow color | `#000` |
| Border radius | `rounded-lg` (cards) / `rounded-md` (buttons, inputs) |
| Press effect | `translate 1.5/1.5` + shadow collapse to `0 0 0 0` |

### UnoCSS Shortcuts (from existing config)

```
nb-border:    border-3 border-solid border-black
nb-border-sm: border-2 border-solid border-black
nb-shadow:    shadow-[6px_6px_0_0_#000]
nb-shadow-sm: shadow-[4px_4px_0_0_#000]
nb-shadow-lg: shadow-[8px_8px_0_0_#000]
nb-card:      nb-border nb-shadow rounded-lg bg-white transition-all duration-150
nb-press:     hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-[0_0_0_0_#000] ...
nb-btn:       nb-border nb-shadow rounded-lg px-6 py-3 font-black ... nb-press
nb-tag:       nb-border-sm shadow-[3px_3px_0_0_#000] rounded-md px-3 py-1 font-bold ...
nb-input:     w-full nb-border-sm rounded-md px-4 py-3 ... focus:border-brand-pink ...
```

### Font Families

- `sans`: "Noto Sans SC", "PingFang SC", system-ui — body text
- `display`: "Archivo Black", "Noto Sans SC", system-ui — headings
- `mono`: "Space Grotesk", ui-monospace — code
- `hand`: "Caveat", "Permanent Marker", cursive — decorative

### Animations

Keep fade-in variants (fadeInUp/Down/Left/Right, fadeIn) and bounceIn from the source config. Remove scroll-animate-* shortcuts and safelist entries — those are specific to the source project's scroll-triggered animations and not needed here. Animations will be available for page transitions and component entry effects as needed.

## Custom Component System

All components use `Pica` prefix. Location: `app/components/ui/`.

### PicaDialog

Replaces naive-ui `NDialog`.

- Renders via `<Teleport to="body">`
- Backdrop overlay + centered nb-card panel
- Slots: header, default (body), footer
- Driven by composable `useDialog()` in `app/composables/useDialog.ts`
- API: `useDialog().open({ title, content, onConfirm, onCancel })`
- Body scroll lock while open

### PicaToast

Replaces naive-ui `NMessage`.

- Fixed-position container (top-center)
- Auto-dismiss with configurable duration (default 3s)
- Types: info, success, warning, error (colored with brand palette)
- Driven by composable `useToast()` in `app/composables/useToast.ts`
- API: `useToast().success('message')`, `.error('message')`, etc.

### PicaPagination

Replaces naive-ui `NPagination`.

- Page number button group with nb-btn styling
- First/prev/next/last navigation
- Quick jump input (nb-input styled)
- Ellipsis for large page ranges
- Props: `page`, `pageCount`, `pageSlot`
- Emits: `update:page`

### PicaSelect

Replaces naive-ui `NSelect`.

- Trigger: nb-input styled button showing current value
- Dropdown: nb-card panel with option list
- Click-outside to close
- Props: `options`, `value`, `size`
- Emits: `update:value`

### PicaButton

Replaces global `<button>` styling in elements.sass.

- Variants: `default`, `primary` (brand-pink bg), `danger`
- Sizes: `sm`, `md`, `lg`
- Uses nb-btn shortcut as base
- Supports icon slot

### PicaCard

Replaces global `.card` class.

- Color variants: `white` (default), `pink`, `yellow`, `green`
- Uses nb-card shortcut as base
- Slots: default

### PicaTag

Replaces global `.tag` class.

- Uses nb-tag shortcut
- Color prop for background
- Special styling for `data-tag="生肉"` (preserved)

### PicaMbox

Replaces global `.mbox` class.

- Types: info, success, warning, error
- Neubrutalism styled: nb-border-sm + colored left border (4px)
- Slots: title, default

### PicaProvider

Replaces `NaiveuiProvider.vue`.

- Mounts Dialog and Toast global containers via Teleport
- No theme configuration logic (theme managed by UnoCSS + CSS variables)

## Global Styles Migration

Retain file split structure, convert syntax from sass (indented) to scss (braces/semicolons).

### variables.scss

Most CSS custom properties migrate to UnoCSS theme config. This file becomes minimal — only variables that cannot be expressed as UnoCSS theme tokens (e.g. values consumed by third-party CSS or dynamically toggled at runtime) remain as CSS custom properties. If none qualify, this file is deleted.

### elements.scss

Significantly reduced. Button/card/tag/input styles move into Pica components. Remaining:

- `h1`, `h2` base styling (Neubrutalism: display font, bold, with colored underline or highlight)
- `a` link styling (preserve animated underline, update colors)
- `pre`, `code` styling (nb-border-sm + brand colors)
- `.tabber` styling (update to nb aesthetic)

### formats.scss

- DELETE utility classes replaced by UnoCSS: `.align-center`, `.align-left`, `.align-right`, `.flex`, `.flex-1`, `.gap-1`, `.flex-center`, `.pointer`
- MIGRATE `.mbox` to PicaMbox component
- KEEP and restyle: `.flex-list`, `.bread-crumb`, `.pre`/`.poem`

### states.scss

- KEEP `.lock-scroll` as-is

### index.scss

- Update imports to `.scss` extensions
- Simplify reset (preset-wind4 preflight handles most of it)
- Keep `#app` font-family declaration (update to use theme font)

## Icon Migration

Replace @vicons/fa + @vicons/utils with UnoCSS preset-icons.

- Install: `@iconify-json/fa6-solid`, `@iconify-json/fa6-regular`
- Usage in pug: `i.i-fa6-solid-search` or attributify `i(class="i-fa6-solid-search")`
- Map all existing @vicons icon usages to equivalent fa6 icon names
- Remove: `@vicons/fa`, `@vicons/utils` dependencies

## Migration Phases

### Phase 1: Infrastructure Setup

No functional changes. Project remains runnable with old and new systems coexisting.

1. Install UnoCSS and icon packages
2. Create `uno.config.ts` with theme, shortcuts, extractors
3. Add `@unocss/nuxt` to nuxt.config.ts modules
4. Convert global style files: `.sass` -> `.scss` (syntax only, no content changes)
5. Update `nuxt.config.ts` CSS entry to `index.scss`
6. Verify project builds and runs

### Phase 2: Component Replacement

Remove all naive-ui usage. Project runs on custom components.

1. Create `app/components/ui/` directory
2. Implement PicaDialog + useDialog composable
3. Implement PicaToast + useToast composable
4. Implement PicaPagination, PicaSelect
5. Implement PicaButton, PicaCard, PicaTag, PicaMbox
6. Create PicaProvider to replace NaiveuiProvider
7. Update BookListPaginator to use PicaPagination + PicaSelect
8. Replace all @vicons usage with UnoCSS Icons across all components
9. Remove naive-ui, @vicons/fa, @vicons/utils from package.json
10. Remove naive-ui from vite.optimizeDeps in nuxt.config.ts
11. Verify all features work

### Phase 3: Visual Refresh

Apply Neubrutalism styling to all components, one module at a time.

1. Layout components: GlobalHeader, GlobalSideNav, GlobalFooter
2. Data display: BookCard, BooksList, BookListPaginator
3. Utility components: Lazyload, ExternalLink, MBox, Placeholder
4. Page components: all 11 pages
5. Global styles: rewrite elements.scss, formats.scss with Neubrutalism aesthetic
6. Clean up: remove unused CSS variables, delete redundant utility classes
7. Final verification of all pages

## Component Naming Convention

- UI primitives: `Pica` prefix (PicaButton, PicaCard, PicaDialog, etc.)
- Location: `app/components/ui/`
- Auto-imported by Nuxt component resolution

## Dependencies Change

### Add

- `unocss`
- `@unocss/nuxt`
- `@unocss/extractor-pug`
- `@iconify-json/fa6-solid`
- `@iconify-json/fa6-regular`

### Remove

- `naive-ui`
- `@vicons/fa`
- `@vicons/utils`

### Keep

- `sass` (supports both .sass and .scss)
- `pug`
