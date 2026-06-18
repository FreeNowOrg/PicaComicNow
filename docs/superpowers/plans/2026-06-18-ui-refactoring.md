# UI Refactoring Implementation Plan: Neubrutalism + UnoCSS

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove naive-ui, adopt UnoCSS with Neubrutalism visual style, convert sass→scss, and create custom Pica* UI components.

**Architecture:** Three-phase migration — infrastructure setup (UnoCSS + scss), component replacement (custom Pica* components replacing naive-ui), then visual refresh (Neubrutalism styling across all 23 Vue files). Each phase leaves the project runnable.

**Tech Stack:** Nuxt 4, Vue 3, UnoCSS (preset-wind4 + preset-attributify + preset-icons), SCSS, Pug, TypeScript

## Global Constraints

- All Vue components use `lang="pug"` for templates, `lang="ts"` for scripts, `lang="scss"` for styles
- UnoCSS shortcuts use `pica-` prefix for Neubrutalism patterns
- Custom components use `Pica` prefix and live in `app/components/ui/`
- Composables live in `app/composables/`
- No test framework exists — verification is via `pnpm dev` and visual inspection
- SSR is disabled (`ssr: false`)
- Node >= 24.11.0, pnpm 11.7.0
- Code comments in English
- Commit messages in English, Conventional Commits format
- **Pug + UnoCSS compatibility:** Pug's dot-shorthand class syntax (`.foo`) cannot handle classes containing `[]`, `:`, or `/`. Rules:
  - Safe: `.pica-card`, `.flex`, `.gap-4` (no special characters)
  - Unsafe: `.w-[12px]`, `.hover:bg-red` (contains brackets/colons)
  - For arbitrary values, use string class attribute: `div(class='w-[12px]')` or attributify: `div(w='[12px]')`
  - For CSS variables via UnoCSS: `div(bg='[--theme-background-color]')`
  - Prefer `pica-*` shortcuts (safe names) and `<style scoped>` over raw arbitrary-value classes in templates

## File Structure

### New files to create

```
uno.config.ts                              — UnoCSS configuration with theme, shortcuts, extractors
app/components/ui/PicaButton.vue           — Button component with variants and sizes
app/components/ui/PicaCard.vue             — Card component with color variants
app/components/ui/PicaTag.vue              — Tag component
app/components/ui/PicaMbox.vue             — Message box component (info/success/warning/error)
app/components/ui/PicaDialog.vue           — Dialog/modal component
app/components/ui/PicaToast.vue            — Toast notification component
app/components/ui/PicaSelect.vue           — Custom select dropdown
app/components/ui/PicaPagination.vue       — Pagination component
app/components/ui/PicaProvider.vue         — Global provider (Dialog + Toast containers)
app/composables/useDialog.ts               — Composable for imperative dialog API
app/composables/useToast.ts                — Composable for imperative toast API
```

### Files to modify

```
nuxt.config.ts                             — Add @unocss/nuxt module, remove naive-ui optimizeDeps
package.json                               — Add UnoCSS deps, remove naive-ui/vicons deps
app/assets/styles/index.sass → index.scss  — Rename + convert syntax
app/assets/styles/variables.sass → .scss   — Rename + convert syntax
app/assets/styles/elements.sass → .scss    — Rename + convert + Neubrutalism restyle
app/assets/styles/formats.sass → .scss     — Rename + convert + remove UnoCSS-replaced utilities
app/assets/styles/states.sass → .scss      — Rename + convert syntax
app/app.vue                                — Replace NaiveuiProvider with PicaProvider
app/plugins/global-components.ts           — Remove @vicons/utils Icon registration
app/components/BookListPaginator.vue       — Replace naive-ui NPagination/NSelect with Pica*
app/components/BookCard.vue                — Replace @vicons, apply Neubrutalism
app/components/GlobalHeader.vue            — Replace @vicons, apply Neubrutalism
app/components/GlobalSideNav.vue           — Replace @vicons, apply Neubrutalism
app/components/GlobalFooter.vue            — Apply Neubrutalism
app/components/ExternalLink.vue            — Replace @vicons icon with UnoCSS icon
app/components/BooksList.vue               — Apply Neubrutalism
app/components/Lazyload.vue                — Update styles to scss
app/components/Placeholder.vue             — Update styles to scss, brand colors
app/components/NProgress.vue               — Update styles to scss
app/pages/*.vue (all 12 pages)             — Replace @vicons, update CSS classes, apply Neubrutalism
```

### Files to delete

```
app/components/NaiveuiProvider.vue         — Replaced by PicaProvider
app/components/MBox.vue                    — Replaced by PicaMbox
```

---

### Task 1: UnoCSS Infrastructure + sass→scss Conversion

**Files:**
- Create: `uno.config.ts`
- Modify: `nuxt.config.ts`
- Modify: `package.json` (via pnpm add)
- Rename+Modify: `app/assets/styles/*.sass` → `*.scss` (5 files)

**Interfaces:**
- Consumes: nothing
- Produces: UnoCSS configured and available globally; all `pica-*` shortcuts usable in templates; `*.scss` files imported in nuxt config

- [ ] **Step 1: Install UnoCSS packages**

```bash
pnpm add -D unocss @unocss/nuxt @unocss/extractor-pug @iconify-json/fa6-solid @iconify-json/fa6-regular
```

- [ ] **Step 2: Create `uno.config.ts`**

```ts
import { defineConfig, presetWind4, presetAttributify, presetIcons } from 'unocss'
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: false,
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  extractors: [extractorPug()],
  theme: {
    colors: {
      cream: '#FFF8DC',
      brand: {
        pink: '#FF5C8A',
        pinkHot: '#FF6B9D',
        purple: '#A78BFA',
        green: '#7FD957',
        yellow: '#FFE066',
      },
      danger: '#FF5555',
      link: '#3F51B5',
      bookmark: '#FF69B4',
    },
    fontFamily: {
      sans: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif',
      display: '"Archivo Black", "Noto Sans SC", system-ui, sans-serif',
      mono: '"Space Grotesk", ui-monospace, monospace',
    },
    animation: {
      'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
      'fade-in': 'fadeIn 0.6s ease-out forwards',
      'bounce-in': 'bounceIn 0.8s ease-out forwards',
    },
    keyframes: {
      fadeInUp: {
        '0%': { opacity: '0', transform: 'translateY(50px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeInDown: {
        '0%': { opacity: '0', transform: 'translateY(-50px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      bounceIn: {
        '0%': { opacity: '0', transform: 'scale(0.3) translateY(50px)' },
        '50%': { opacity: '0.8', transform: 'scale(1.05) translateY(-10px)' },
        '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
      },
    },
  },
  shortcuts: {
    'pica-border': 'border-3 border-solid border-black',
    'pica-border-sm': 'border-2 border-solid border-black',
    'pica-shadow': 'shadow-[6px_6px_0_0_#000]',
    'pica-shadow-sm': 'shadow-[4px_4px_0_0_#000]',
    'pica-shadow-lg': 'shadow-[8px_8px_0_0_#000]',
    'pica-card': 'pica-border pica-shadow rounded-lg bg-white transition-all duration-150',
    'pica-press':
      'hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-[0_0_0_0_#000] active:translate-x-1.5 active:translate-y-1.5 active:shadow-[0_0_0_0_#000]',
    'pica-btn':
      'pica-border pica-shadow rounded-lg px-6 py-3 font-black inline-flex items-center gap-2 transition-all duration-150 hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-[0_0_0_0_#000] active:translate-x-1.5 active:translate-y-1.5 active:shadow-[0_0_0_0_#000]',
    'pica-tag':
      'pica-border-sm shadow-[3px_3px_0_0_#000] rounded-md px-3 py-1 font-bold text-sm inline-flex items-center gap-1 bg-white',
    'pica-input':
      'w-full pica-border-sm rounded-md px-4 py-3 bg-white text-black font-medium focus:outline-0 focus:border-brand-pink focus:shadow-[4px_4px_0_0_#FF5C8A] transition-all duration-150',
  },
  safelist: [
    'bg-brand-pink',
    'bg-brand-pinkHot',
    'bg-brand-purple',
    'bg-brand-green',
    'bg-brand-yellow',
    'bg-cream',
  ],
})
```

- [ ] **Step 3: Update `nuxt.config.ts` — add UnoCSS module**

Add `'@unocss/nuxt'` to the modules array. Update the CSS entry from `index.sass` to `index.scss`. The file should become:

```ts
export default defineNuxtConfig({
  ssr: false,

  modules: ['@unocss/nuxt', '@pinia/nuxt'],

  css: ['~/assets/styles/index.scss'],

  runtimeConfig: {
    picaS3Base: '',
  },

  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
    optimizeDeps: {
      include: [
        '@vicons/fa',
        '@vicons/utils',
        'axios',
        'localforage',
        'naive-ui',
        'nprogress',
      ],
    },
  },

  compatibilityDate: '2026-06-18',
})
```

Note: naive-ui and @vicons entries in optimizeDeps are kept for now — they will be removed in Task 7 when the dependencies are deleted.

- [ ] **Step 4: Convert global styles from sass (indented) to scss (braces/semicolons)**

Rename all 5 files and convert syntax. The conversion is mechanical:
- Add `{` `}` braces for nesting
- Add `;` semicolons at end of property declarations
- `@use './variables.sass'` → `@use './variables.scss'`
- Mixin syntax stays the same (already uses `@mixin`/`@include`)

**`app/assets/styles/variables.scss`** (rename from `.sass`):

```scss
:root {
  font-size: 16px;
  --theme-accent-color: #ef76a3;
  --theme-accent-color--rgb: 239, 118, 163;
  --theme-accent-color-darken: #cc5985;
  --theme-accent-link-color: #fff;
  --theme-secondary-color: #e02080;
  --theme-secondary-color--rgb: 224, 32, 128;
  --theme-text-color: #2c3e50;
  --theme-link-color: #3f51b5;
  --theme-link-color--rgb: 63, 81, 181;
  --theme-background-color: #ffedf0;
  --theme-text-shadow-color: #fff;
  --theme-box-shadow-color: #eee;
  --theme-box-shadow-color-hover: #ccc;
  --theme-border-color: #888;
  --theme-box-shadow: 0 0 8px var(--theme-box-shadow-color);
  --theme-box-shadow-hover: 0 0 14px var(--theme-box-shadow-color-hover);
  --theme-tag-color: rgb(214, 228, 255);
  --theme-danger-color: #f55;
  --theme-bookmark-color: #ff69b4;
}
```

**`app/assets/styles/elements.scss`** (rename from `.sass`):

```scss
// Header
@mixin header-shared($font-size, $shadow-color) {
  display: inline-block;
  position: relative;
  font-size: $font-size;
  text-shadow: 1px 1px 0 var(--theme-text-shadow-color), -1px -1px 0 var(--theme-text-shadow-color), 1px -1px 0 var(--theme-text-shadow-color), -1px 1px 0 var(--theme-text-shadow-color);
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 50%;
    background-color: $shadow-color;
    position: absolute;
    left: 0;
    bottom: -0.1em;
    border-radius: 9999px;
    z-index: -1;
  }
}

h1 {
  font-size: 2.2rem;
}

h2 {
  @include header-shared(1.4rem, #ef76a3);
  left: 50%;
  transform: translateX(-50%);
  padding: 0 1rem;
}

.align-center {
  h2 {
    left: unset;
    transform: unset;
  }
}

// Links
a {
  --color: var(--theme-link-color);
  color: var(--color);
  text-decoration: none;
  position: relative;
  display: inline-block;

  &.plain {
    display: unset;
  }

  &:not(.plain)::after {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 0.1em;
    bottom: -0.1em;
    left: 0;
    background-color: var(--color);
    visibility: hidden;
    transform: scaleX(0);
    transition: all 0.4s ease-in-out;
  }

  &:not(.plain):hover::after,
  &.router-link-active::after,
  &.tab-active::after,
  &.is-active::after {
    visibility: visible;
    transform: scaleX(1);
  }

  &.button {
    padding: 0.2rem 0.4rem;
    background-color: var(--theme-tag-color);
    transition: all .4s ease;
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--theme-link-color--rgb), 1);
      color: var(--theme-accent-link-color);
    }
  }
}

// Button
button {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: rgb(54, 151, 231);
  color: #fff;
  cursor: pointer;

  &:hover {
    background-color: rgb(69, 162, 238);
  }

  &:focus {
    background-color: rgb(32, 125, 201);
    box-shadow: 0 0 0 2px #fff inset, 0 0 0 2px rgb(32, 125, 201);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;

    &:active {
      box-shadow: 0 0 0 2px #fff inset, 0 0 0 2px #ccc;
    }
  }
}

// Card
.card {
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: box-shadow .6s ease;
  border: 1px solid #ddd;

  &.gap {
    margin-top: 1rem;
    margin-bottom: 1.4rem;
  }
}

// Tags
.tags-list {
  line-height: 1.6;
  .tag {
    line-height: 1em;
    display: inline-block;
    padding: 2px 4px;
    margin-right: 0.4rem;
    background-color: aliceblue;
    &[data-tag="生肉"] {
      color: #fff;
      background-color: #dd8221;
    }
    &.router-link-active {
      color: #fff;
      background-color: var(--theme-link-color);
    }
  }
}

input,
textarea {
  padding: 4px 0.75rem;
  font-size: 1rem;
  line-height: 1em;
  border: none;
  border-radius: 1em;
  background-color: rgba(0, 0, 0, 0.05);
  outline: none;
  &:hover {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25);
  }
  &:focus {
    box-shadow: 0 0 0 2px var(--theme-accent-color);
  }
}

// Responsive
.responsive {
  padding-left: 5%;
  padding-right: 5%;
}

@media (max-width: 800px) {
  .responsive {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

// Loading
.loading-cover {
  position: relative;
  &::before, &::after {
    content: "";
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
  }
  &::before {
    background-image: url(/images/spinner.svg);
    background-size: 75px;
    background-repeat: no-repeat;
    background-position: center;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 6;
  }
  &::after {
    top: 0;
    left: 0;
    background-color: rgba(200, 200, 200, 0.2);
    z-index: 5;
  }
}

// Code
pre {
  overflow: auto;
  background: rgba(172, 232, 255, 0.2);
  padding: 0.4rem;
  border: 1px solid #cccccc;
  border-radius: 6px;
}

code {
  background-color: #efefef;
  display: inline;
  border-radius: 2px;
  padding: .1rem .2rem;
  color: #e02080;
  word-break: break-word;
}

// Tabber
.tabber {
  .tabber-tabs {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    a {
      cursor: pointer;
    }
  }
}
```

**`app/assets/styles/formats.scss`** (rename from `.sass`):

```scss
.align-center {
  text-align: center;
}

.align-left {
  text-align: left;
}

.align-right {
  text-align: right;
}

.position-center {
  text-align: left;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.flex-center {
  display: flex;
  align-items: center;
}

.pre,
.poem {
  white-space: pre-wrap;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.gap-1 {
  gap: 1rem;
}

.flex-list {
  .list-item {
    display: flex;
    gap: 0.5rem;

    &:not(:first-of-type) {
      margin-top: 4px;
    }

    &.header {
      position: sticky;
      top: 50px;
      background-color: #f8f8f8;
      font-weight: 600;
      font-size: 1.24rem;
      z-index: 10;

      > div:not(:last-of-type) {
        box-shadow: 2px 0 #dedede;
      }
    }

    > div {
      flex: 1;
    }

    .key {
      font-weight: 600;
      box-shadow: 2px 0 #dedede;
    }
  }
}

.pointer {
  cursor: pointer;
}

.bread-crumb {
  margin-bottom: 1.5rem;
}

// Info
.mbox {
  --border-color: rgba(0, 0, 0, 0.1);
  --bg-color: rgba(0, 0, 0, 0.04);
  background-color: #fff;
  border: 1px solid var(--bg-color);
  border-left: 0.5rem solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  & > * {
    padding: 1rem;
    margin: 0;
  }
  & .title {
    font-weight: 600;
    font-size: 1.2rem;
    padding: 0.4rem 1rem;
    background-color: var(--bg-color);
  }
  &.info {
    --border-color: #30a0ff;
    --bg-color: rgba(0, 140, 255, 0.1);
  }
  &.success {
    --border-color: #00a000;
    --bg-color: rgba(0, 160, 0, 0.1);
  }
  &.warning {
    --border-color: #ffa500;
    --bg-color: rgba(231, 139, 0, 0.1);
  }
  &.error {
    --border-color: #e00000;
    --bg-color: rgba(233, 0, 0, 0.1);
  }
}
```

**`app/assets/styles/states.scss`** (rename from `.sass`):

```scss
.lock-scroll {
  overflow: hidden;
}
```

**`app/assets/styles/index.scss`** (rename from `.sass`):

```scss
@use './variables.scss';
@use './elements.scss';
@use './formats.scss';
@use './states.scss';

html,
body {
  margin: 0;
  padding: 0;
  position: relative;
}

* {
  box-sizing: border-box;
}

#app {
  font-family: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--theme-text-color);
}
```

- [ ] **Step 5: Delete old `.sass` files**

```bash
rm app/assets/styles/variables.sass app/assets/styles/elements.sass app/assets/styles/formats.sass app/assets/styles/states.sass app/assets/styles/index.sass
```

- [ ] **Step 6: Verify project builds and runs**

```bash
pnpm dev
```

Expected: Project runs at localhost:3000 with no errors. Existing styles still work. UnoCSS classes are now available.

- [ ] **Step 7: Commit**

```bash
git add uno.config.ts nuxt.config.ts app/assets/styles/
git commit -m "feat: add UnoCSS infrastructure and convert sass to scss"
```

---

### Task 2: Base UI Components (PicaButton, PicaCard, PicaTag)

**Files:**
- Create: `app/components/ui/PicaButton.vue`
- Create: `app/components/ui/PicaCard.vue`
- Create: `app/components/ui/PicaTag.vue`

**Interfaces:**
- Consumes: UnoCSS `pica-*` shortcuts from Task 1
- Produces: `<PicaButton>`, `<PicaCard>`, `<PicaTag>` components, auto-imported by Nuxt

- [ ] **Step 1: Create `app/components/ui/PicaButton.vue`**

```vue
<template lang="pug">
button.pica-button(
  :class='[variantClass, sizeClass]',
  :disabled='disabled',
  @click='$emit("click", $event)'
)
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    variant: 'default',
    size: 'md',
    disabled: false,
  }
)

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClass = computed(() => `variant-${props.variant}`)
const sizeClass = computed(() => `size-${props.size}`)
</script>

<style scoped lang="scss">
.pica-button {
  border: 3px solid #000;
  border-radius: 0.5rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 150ms;
  box-shadow: 4px 4px 0 0 #000;
  background-color: #fff;
  color: #000;

  &:hover {
    translate: 1.5px 1.5px;
    box-shadow: 0 0 0 0 #000;
  }

  &:active {
    translate: 3px 3px;
    box-shadow: 0 0 0 0 #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover, &:active {
      translate: 0;
      box-shadow: 4px 4px 0 0 #000;
    }
  }

  // Variants
  &.variant-primary {
    background-color: #FF5C8A;
    color: #fff;
  }

  &.variant-danger {
    background-color: #FF5555;
    color: #fff;
  }

  // Sizes
  &.size-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  &.size-md {
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
  }

  &.size-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
}
</style>
```

- [ ] **Step 2: Create `app/components/ui/PicaCard.vue`**

```vue
<template lang="pug">
div.pica-card(:class='[colorClass]')
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    color?: 'white' | 'pink' | 'yellow' | 'green' | 'blue'
  }>(),
  { color: 'white' }
)

const colorClass = computed(() => `color-${props.color}`)
</script>

<style scoped lang="scss">
.pica-card {
  border: 3px solid #000;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 6px 6px 0 0 #000;
  transition: all 150ms;
  background-color: #fff;

  &.color-pink {
    background-color: #FFD6E0;
  }
  &.color-yellow {
    background-color: #FFF3C7;
  }
  &.color-green {
    background-color: #D4EDDA;
  }
  &.color-blue {
    background-color: #D6E4FF;
  }
}
</style>
```

- [ ] **Step 3: Create `app/components/ui/PicaTag.vue`**

```vue
<template lang="pug">
span.pica-tag(:class='{ active }', :style='colorStyle')
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color?: string
  active?: boolean
}>()

const colorStyle = computed(() =>
  props.color ? { backgroundColor: props.color } : undefined
)
</script>

<style scoped lang="scss">
.pica-tag {
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.125rem 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #fff;
  box-shadow: 3px 3px 0 0 #000;
  line-height: 1.4;

  &.active {
    background-color: #FF5C8A;
    color: #fff;
  }
}
</style>
```

- [ ] **Step 4: Verify components render**

```bash
pnpm dev
```

Open browser, add a temporary test in any page (e.g., `app/pages/about.vue`) to verify the components render:
```pug
PicaButton(variant="primary") Test Button
PicaCard(color="pink") Test Card Content
PicaTag Tag Text
```

Remove the test code after verification.

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/
git commit -m "feat: add PicaButton, PicaCard, PicaTag base components"
```

---

### Task 3: PicaMbox Component

**Files:**
- Create: `app/components/ui/PicaMbox.vue`

**Interfaces:**
- Consumes: nothing
- Produces: `<PicaMbox>` component with props `type: 'info' | 'error' | 'warning' | 'success' | 'default'`, `header?: string`, `content?: string` and slots `header`, `default`

Note: The existing `MBox.vue` will be replaced later (in Task 7) when all usages are updated. For now, both components coexist.

- [ ] **Step 1: Create `app/components/ui/PicaMbox.vue`**

```vue
<template lang="pug">
div.pica-mbox(:class='[type || "default"]')
  .pica-mbox-title(v-if='header || $slots.header')
    slot(name='header')
      | {{ header }}
  .pica-mbox-content
    slot
      p(v-if='content') {{ content }}
</template>

<script setup lang="ts">
defineProps<{
  type?: 'info' | 'error' | 'warning' | 'success' | 'default'
  header?: string
  content?: string
}>()
</script>

<style scoped lang="scss">
.pica-mbox {
  border: 3px solid #000;
  border-left: 6px solid #000;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 4px 4px 0 0 #000;
  background-color: #fff;

  .pica-mbox-title {
    font-weight: 700;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-bottom: 2px solid #000;
  }

  .pica-mbox-content {
    padding: 1rem;

    > :first-child {
      margin-top: 0;
    }
    > :last-child {
      margin-bottom: 0;
    }
  }

  &.info {
    border-left-color: #3B82F6;
    .pica-mbox-title {
      background-color: rgba(59, 130, 246, 0.1);
    }
  }
  &.success {
    border-left-color: #7FD957;
    .pica-mbox-title {
      background-color: rgba(127, 217, 87, 0.1);
    }
  }
  &.warning {
    border-left-color: #FFE066;
    .pica-mbox-title {
      background-color: rgba(255, 224, 102, 0.15);
    }
  }
  &.error {
    border-left-color: #FF5555;
    .pica-mbox-title {
      background-color: rgba(255, 85, 85, 0.1);
    }
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ui/PicaMbox.vue
git commit -m "feat: add PicaMbox component"
```

---

### Task 4: PicaDialog + useDialog Composable

**Files:**
- Create: `app/composables/useDialog.ts`
- Create: `app/components/ui/PicaDialog.vue`

**Interfaces:**
- Consumes: nothing
- Produces: `useDialog()` composable returning `{ open(options): void, close(): void }` where `options: { title?: string, content?: string, confirmText?: string, cancelText?: string, onConfirm?: () => void, onCancel?: () => void }`; `<PicaDialog>` component (used internally by PicaProvider)

- [ ] **Step 1: Create `app/composables/useDialog.ts`**

```ts
import { ref, type Component, shallowRef } from 'vue'

export interface DialogOptions {
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const visible = ref(false)
const options = ref<DialogOptions>({})

export function useDialog() {
  function open(opts: DialogOptions) {
    options.value = opts
    visible.value = true
  }

  function close() {
    visible.value = false
    options.value = {}
  }

  function confirm() {
    options.value.onConfirm?.()
    close()
  }

  function cancel() {
    options.value.onCancel?.()
    close()
  }

  return {
    visible,
    options,
    open,
    close,
    confirm,
    cancel,
  }
}
```

- [ ] **Step 2: Create `app/components/ui/PicaDialog.vue`**

```vue
<template lang="pug">
Teleport(to='body')
  Transition(name='dialog')
    .pica-dialog-overlay(v-if='dialog.visible.value', @click.self='dialog.cancel()')
      .pica-dialog
        .pica-dialog-header(v-if='dialog.options.value.title')
          h3 {{ dialog.options.value.title }}
        .pica-dialog-body(v-if='dialog.options.value.content')
          p {{ dialog.options.value.content }}
        .pica-dialog-footer
          PicaButton(
            @click='dialog.cancel()',
            size='sm'
          ) {{ dialog.options.value.cancelText || 'Cancel' }}
          PicaButton(
            variant='primary',
            @click='dialog.confirm()',
            size='sm'
          ) {{ dialog.options.value.confirmText || 'OK' }}
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()

watch(dialog.visible, (val) => {
  if (val) {
    document.body.classList.add('lock-scroll')
  } else {
    document.body.classList.remove('lock-scroll')
  }
})
</script>

<style scoped lang="scss">
.pica-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
}

.pica-dialog {
  border: 3px solid #000;
  border-radius: 0.75rem;
  box-shadow: 8px 8px 0 0 #000;
  background-color: #fff;
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
}

.pica-dialog-header {
  padding: 1rem 1.25rem 0;
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 900;
  }
}

.pica-dialog-body {
  padding: 1rem 1.25rem;
  p {
    margin: 0;
  }
}

.pica-dialog-footer {
  padding: 0 1.25rem 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

// Transitions
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add app/composables/useDialog.ts app/components/ui/PicaDialog.vue
git commit -m "feat: add PicaDialog component and useDialog composable"
```

---

### Task 5: PicaToast + useToast Composable

**Files:**
- Create: `app/composables/useToast.ts`
- Create: `app/components/ui/PicaToast.vue`

**Interfaces:**
- Consumes: nothing
- Produces: `useToast()` composable returning `{ info(msg), success(msg), warning(msg), error(msg) }`; `<PicaToast>` component (used internally by PicaProvider)

- [ ] **Step 1: Create `app/composables/useToast.ts`**

```ts
import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

function addToast(message: string, type: ToastItem['type'], duration = 3000) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

function removeToast(id: number) {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  return {
    toasts,
    info: (msg: string) => addToast(msg, 'info'),
    success: (msg: string) => addToast(msg, 'success'),
    warning: (msg: string) => addToast(msg, 'warning'),
    error: (msg: string) => addToast(msg, 'error'),
    remove: removeToast,
  }
}
```

- [ ] **Step 2: Create `app/components/ui/PicaToast.vue`**

```vue
<template lang="pug">
Teleport(to='body')
  .pica-toast-container
    TransitionGroup(name='toast')
      .pica-toast(
        v-for='toast in toasts.toasts.value',
        :key='toast.id',
        :class='toast.type',
        @click='toasts.remove(toast.id)'
      )
        span {{ toast.message }}
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const toasts = useToast()
</script>

<style scoped lang="scss">
.pica-toast-container {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  pointer-events: none;
}

.pica-toast {
  border: 2px solid #000;
  border-radius: 0.5rem;
  padding: 0.75rem 1.25rem;
  box-shadow: 4px 4px 0 0 #000;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
  max-width: 90vw;
  overflow: hidden;
  text-overflow: ellipsis;

  &.info {
    background-color: #D6E4FF;
  }
  &.success {
    background-color: #D4EDDA;
  }
  &.warning {
    background-color: #FFF3C7;
  }
  &.error {
    background-color: #FFD6D6;
  }
}

// Transitions
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add app/composables/useToast.ts app/components/ui/PicaToast.vue
git commit -m "feat: add PicaToast component and useToast composable"
```

---

### Task 6: PicaSelect + PicaPagination

**Files:**
- Create: `app/components/ui/PicaSelect.vue`
- Create: `app/components/ui/PicaPagination.vue`

**Interfaces:**
- Consumes: nothing
- Produces: `<PicaSelect>` with props `options: Array<{label: string, value: string}>`, `value: string`, emits `update:value`; `<PicaPagination>` with props `page: number`, `pageCount: number`, `pageSlot?: number`, emits `update:page`

- [ ] **Step 1: Create `app/components/ui/PicaSelect.vue`**

```vue
<template lang="pug">
.pica-select(:class='{ open }', ref='selectRef')
  button.pica-select-trigger(@click='open = !open')
    span.pica-select-label {{ currentLabel }}
    span.pica-select-arrow(:class='{ flipped: open }') ▼
  Transition(name='select-dropdown')
    .pica-select-dropdown(v-if='open')
      .pica-select-option(
        v-for='opt in options',
        :key='opt.value',
        :class='{ selected: opt.value === modelValue }',
        @click='select(opt.value)'
      ) {{ opt.label }}
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  options: Array<{ label: string; value: string | number }>
  modelValue: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const open = ref(false)
const selectRef = ref<HTMLElement>()

const currentLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label ?? String(props.modelValue)
})

function select(value: string | number) {
  emit('update:modelValue', value)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.pica-select {
  position: relative;
  display: inline-block;
  min-width: 7rem;
}

.pica-select-trigger {
  width: 100%;
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  background-color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 3px 3px 0 0 #000;
  transition: all 150ms;

  &:hover {
    translate: 1px 1px;
    box-shadow: 1px 1px 0 0 #000;
  }
}

.pica-select-arrow {
  font-size: 0.6rem;
  transition: transform 0.2s;
  &.flipped {
    transform: rotate(180deg);
  }
}

.pica-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  border: 2px solid #000;
  border-radius: 0.375rem;
  background-color: #fff;
  box-shadow: 4px 4px 0 0 #000;
  z-index: 50;
  overflow: hidden;
}

.pica-select-option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background-color: #FFF3C7;
  }

  &.selected {
    background-color: #FF5C8A;
    color: #fff;
    font-weight: 700;
  }
}

// Transitions
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: all 0.15s ease;
}
.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
```

- [ ] **Step 2: Create `app/components/ui/PicaPagination.vue`**

```vue
<template lang="pug">
nav.pica-pagination(v-if='pageCount > 1')
  button.page-btn(
    :disabled='modelPage <= 1',
    @click='goTo(modelPage - 1)'
  ) ‹
  template(v-for='item in pageItems', :key='item')
    span.page-ellipsis(v-if='item === "..."') …
    button.page-btn(
      v-else,
      :class='{ active: item === modelPage }',
      @click='goTo(item as number)'
    ) {{ item }}
  button.page-btn(
    :disabled='modelPage >= pageCount',
    @click='goTo(modelPage + 1)'
  ) ›
  .page-jump
    | Go to
    input.jump-input(
      type='number',
      :min='1',
      :max='pageCount',
      :value='modelPage',
      @keydown.enter='handleJump($event)'
    )
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelPage: number
    pageCount: number
    pageSlot?: number
  }>(),
  { pageSlot: 7 }
)

const emit = defineEmits<{
  'update:modelPage': [page: number]
}>()

function goTo(page: number) {
  if (page >= 1 && page <= props.pageCount) {
    emit('update:modelPage', page)
  }
}

function handleJump(e: KeyboardEvent) {
  const value = parseInt((e.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    goTo(Math.min(Math.max(1, value), props.pageCount))
  }
}

const pageItems = computed(() => {
  const total = props.pageCount
  const current = props.modelPage
  const slot = props.pageSlot
  const items: (number | '...')[] = []

  if (total <= slot) {
    for (let i = 1; i <= total; i++) items.push(i)
    return items
  }

  const half = Math.floor(slot / 2)
  let start = Math.max(2, current - half + 1)
  let end = Math.min(total - 1, current + half - 1)

  if (current <= half) {
    end = slot - 1
  }
  if (current > total - half) {
    start = total - slot + 2
  }

  items.push(1)
  if (start > 2) items.push('...')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push('...')
  items.push(total)

  return items
})
</script>

<style scoped lang="scss">
.pica-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.page-btn {
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.25rem 0.625rem;
  background-color: #fff;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 2rem;
  text-align: center;
  box-shadow: 2px 2px 0 0 #000;
  transition: all 150ms;

  &:hover:not(:disabled):not(.active) {
    translate: 1px 1px;
    box-shadow: 0 0 0 0 #000;
    background-color: #FFF3C7;
  }

  &.active {
    background-color: #FF5C8A;
    color: #fff;
    translate: 2px 2px;
    box-shadow: 0 0 0 0 #000;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.page-ellipsis {
  padding: 0.25rem 0.25rem;
  font-weight: 700;
}

.page-jump {
  margin-left: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.jump-input {
  width: 3.5rem;
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.25rem 0.375rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.875rem;
  background-color: #fff;

  &:focus {
    outline: none;
    border-color: #FF5C8A;
    box-shadow: 3px 3px 0 0 #FF5C8A;
  }
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ui/PicaSelect.vue app/components/ui/PicaPagination.vue
git commit -m "feat: add PicaSelect and PicaPagination components"
```

---

### Task 7: PicaProvider + Icon Migration + Dependency Removal

This is the integration task. Replace NaiveuiProvider, migrate all @vicons icons to UnoCSS Icons, update BookListPaginator, and remove naive-ui dependencies.

**Files:**
- Create: `app/components/ui/PicaProvider.vue`
- Modify: `app/app.vue`
- Modify: `app/plugins/global-components.ts`
- Modify: `app/components/BookListPaginator.vue`
- Modify: `app/components/BookCard.vue`
- Modify: `app/components/GlobalHeader.vue`
- Modify: `app/components/GlobalSideNav.vue`
- Modify: `app/components/ExternalLink.vue`
- Modify: `app/pages/search.vue`
- Modify: `app/pages/favourite.vue`
- Modify: `app/pages/categories.vue`
- Modify: `app/pages/comics/index.vue`
- Modify: `app/pages/comics/[category].vue`
- Modify: `app/pages/book/[bookid]/index.vue`
- Modify: `app/pages/book/[bookid]/[epsid].vue`
- Delete: `app/components/NaiveuiProvider.vue`
- Delete: `app/components/MBox.vue`

**Interfaces:**
- Consumes: PicaDialog (Task 4), PicaToast (Task 5), PicaSelect (Task 6), PicaPagination (Task 6), PicaMbox (Task 3)
- Produces: All naive-ui and @vicons dependencies removed; project runs purely on custom components

- [ ] **Step 1: Create `app/components/ui/PicaProvider.vue`**

```vue
<template lang="pug">
div
  slot
  PicaDialog
  PicaToast
</template>

<script setup lang="ts">
</script>
```

- [ ] **Step 2: Update `app/app.vue` — replace NaiveuiProvider with PicaProvider**

Replace `NaiveuiProvider#app-container` with `PicaProvider#app-container` in the template. The rest stays the same:

```vue
<template lang="pug">
PicaProvider#app-container
  main.flex-1
    article.responsive
      NuxtPage

  NProgress
  GlobalHeader
  GlobalSideNav
  GlobalFooter
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  background-color: var(--theme-background-color);
}

article {
  margin-top: 50px;
  padding-top: 2rem;
  padding-bottom: 4rem;
}
</style>
```

- [ ] **Step 3: Delete `app/components/NaiveuiProvider.vue`**

```bash
rm app/components/NaiveuiProvider.vue
```

- [ ] **Step 4: Update `app/plugins/global-components.ts` — remove @vicons/utils Icon**

The `Icon` wrapper component from `@vicons/utils` is used throughout the project to wrap icon components. With UnoCSS Icons, icons are rendered as CSS classes on `<i>` or `<span>` elements, so this global component is no longer needed.

```ts
import ExternalLink from '~/components/ExternalLink.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ELink', ExternalLink)
})
```

- [ ] **Step 5: Update `app/components/BookListPaginator.vue` — use PicaSelect + PicaPagination**

Replace naive-ui NPagination and NSelect with Pica components. Note the prop name mapping: PicaPagination uses `v-model:model-page` and PicaSelect uses `v-model`.

```vue
<template lang="pug">
.book-list-paginator
  .sort-selector
    PicaSelect(
      :options='PICA_LIST_SORT_OPTIONS',
      :model-value='sort',
      @update:model-value='emit("update:sort", $event)'
    )
  .page-selector
    PicaPagination(
      :model-page='page',
      :page-count='totalPages',
      :page-slot='7',
      @update:model-page='emit("update:page", $event)'
    )
</template>

<script setup lang="ts">
import { PicaListSort, PICA_LIST_SORT_OPTIONS } from '~/types'
import { effect } from 'vue'
const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    sort?: PicaListSort
  }>(),
  {
    page: 1,
    totalPages: 1,
    sort: PicaListSort.DEFAULT,
  }
)
const emit = defineEmits<{
  'update:page': [number]
  'update:sort': [PicaListSort]
}>()

effect(() => {
  if (!props.page || isNaN(props.page) || props.page < 1) {
    console.warn('Invalid page value', props.page)
    emit('update:page', 1)
  } else if (props.page > props.totalPages) {
    console.warn('Page value exceeds total pages', props.page, props.totalPages)
    emit('update:page', props.totalPages)
  }
})
effect(() => {
  if (!Object.values(PicaListSort).includes(props.sort)) {
    console.warn('Invalid sort value', props.sort, PicaListSort)
    emit('update:sort', PicaListSort.DEFAULT)
  }
})
</script>

<style scoped lang="scss">
.book-list-paginator {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  .sort-selector {
    min-width: 7rem;
  }
}
</style>
```

- [ ] **Step 6: Migrate icons in all components and pages**

Replace every `<icon>IconName</icon>` pattern with a UnoCSS icon `<i>` element. The icon name mapping from @vicons/fa to UnoCSS preset-icons:

| @vicons/fa Name | UnoCSS Icon Class |
|---|---|
| `Heart` | `i-fa6-solid-heart` |
| `Eye` | `i-fa6-solid-eye` |
| `ExternalLinkAlt` | `i-fa6-solid-up-right-from-square` |
| `Github` | `i-fa6-brands-github` (need `@iconify-json/fa6-brands`) |
| `Bars` | `i-fa6-solid-bars` |
| `UserCircle` | `i-fa6-solid-circle-user` |
| `AngleDown` | `i-fa6-solid-angle-down` |
| `Home` | `i-fa6-solid-house` |
| `Folder` | `i-fa6-solid-folder` |
| `User` / `IconUser` | `i-fa6-solid-user` |
| `Fingerprint` | `i-fa6-solid-fingerprint` |
| `Bookmark` | `i-fa6-solid-bookmark` |
| `BookmarkRegular` | `i-fa6-regular-bookmark` |
| `ArrowLeft` | `i-fa6-solid-arrow-left` |
| `ArrowRight` | `i-fa6-solid-arrow-right` |
| `CheckCircle` | `i-fa6-solid-circle-check` |
| `PenNib` | `i-fa6-solid-pen-nib` |
| `ChevronLeft` | `i-fa6-solid-chevron-left` |
| `ChevronRight` | `i-fa6-solid-chevron-right` |

Note: `Github`, `UserCircle`, and `AngleDown` are imported in `GlobalHeader.vue` but never used in its template — they are dead code that will be cleaned up when the import is removed.

For each file, remove the `@vicons/fa` import and replace `icon` wrapper + icon component with a simple `<i>` tag with the UnoCSS icon class.

**Pattern — before:**
```pug
icon
  Heart
```

**Pattern — after:**
```pug
i.i-fa6-solid-heart
```

Apply this to every file listed. For each file, also remove the `import { ... } from '@vicons/fa'` line from the `<script>` block.

Files to update (apply the icon mapping table above to each):

- `app/components/BookCard.vue`: `Heart` → `i.i-fa6-solid-heart`, `Eye` → `i.i-fa6-solid-eye`
- `app/components/ExternalLink.vue`: `ExternalLinkAlt` → `i.i-fa6-solid-up-right-from-square`
- `app/components/GlobalHeader.vue`: `Bars` → `i.i-fa6-solid-bars` (Github, UserCircle, AngleDown are imported but only Bars is used in template)
- `app/components/GlobalSideNav.vue`: `Home` → `i.i-fa6-solid-house`, `Folder` → `i.i-fa6-solid-folder`, `IconUser` → `i.i-fa6-solid-user`, `Fingerprint` → `i.i-fa6-solid-fingerprint`, `Bookmark` → `i.i-fa6-solid-bookmark`, `Heart` → `i.i-fa6-solid-heart`
- `app/pages/search.vue`: Remove `import { ArrowLeft, ArrowRight } from '@vicons/fa'` (these icons are not used in the template — they were for an old paginator)
- `app/pages/favourite.vue`: Same as search.vue — remove unused import
- `app/pages/categories.vue`: `ExternalLinkAlt` → `i.i-fa6-solid-up-right-from-square`
- `app/pages/comics/index.vue`: Remove unused `ArrowLeft, ArrowRight` import
- `app/pages/comics/[category].vue`: Remove unused `ArrowLeft, ArrowRight` import
- `app/pages/book/[bookid]/index.vue`: `CheckCircle` → `i.i-fa6-solid-circle-check`, `PenNib` → `i.i-fa6-solid-pen-nib`, `Bookmark` → `i.i-fa6-solid-bookmark`, `BookmarkRegular` → `i.i-fa6-regular-bookmark`
- `app/pages/book/[bookid]/[epsid].vue`: `ChevronLeft` → `i.i-fa6-solid-chevron-left`, `ChevronRight` → `i.i-fa6-solid-chevron-right`, `ArrowLeft` → `i.i-fa6-solid-arrow-left`

- [ ] **Step 7: Replace MBox usages with PicaMbox**

In page templates, replace `.mbox.info` / `.mbox.error` patterns with `PicaMbox` component. Also replace the component usage where `MBox` component is used directly.

**Pattern — before:**
```pug
.mbox.info
  .title Tips
  p Some message
```

**Pattern — after:**
```pug
PicaMbox(type='info', header='Tips')
  p Some message
```

Apply to:
- `app/pages/index.vue`: `.mbox.info` → `PicaMbox(type='info')`
- `app/pages/auth.vue`: `.mbox.info` and `.mbox.error` → `PicaMbox(type='info')` / `PicaMbox(type='error')`
- `app/pages/search.vue`: `.mbox.error` → `PicaMbox(type='error')`
- `app/pages/favourite.vue`: `.mbox.error` → `PicaMbox(type='error')`
- `app/pages/categories.vue`: `.mbox.error` → `PicaMbox(type='error')`
- `app/pages/comics/index.vue`: `.mbox.error` → `PicaMbox(type='error')`
- `app/pages/comics/[category].vue`: `.mbox.error` → `PicaMbox(type='error')`

Then delete `app/components/MBox.vue`:

```bash
rm app/components/MBox.vue
```

- [ ] **Step 8: Remove naive-ui and @vicons dependencies**

```bash
pnpm remove naive-ui @vicons/fa @vicons/utils
```

- [ ] **Step 9: Update `nuxt.config.ts` — remove naive-ui from optimizeDeps**

Remove `naive-ui`, `@vicons/fa`, `@vicons/utils` from `vite.optimizeDeps.include`:

```ts
export default defineNuxtConfig({
  ssr: false,

  modules: ['@unocss/nuxt', '@pinia/nuxt'],

  css: ['~/assets/styles/index.scss'],

  runtimeConfig: {
    picaS3Base: '',
  },

  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
    optimizeDeps: {
      include: [
        'axios',
        'localforage',
        'nprogress',
      ],
    },
  },

  compatibilityDate: '2026-06-18',
})
```

- [ ] **Step 10: Verify project builds and all pages work**

```bash
pnpm dev
```

Check every page: `/`, `/auth`, `/search`, `/categories`, `/favourite`, `/profile`, `/about`, `/comics/*`, `/book/*`. Verify:
- No console errors about missing imports
- Icons render correctly
- Pagination and select components work
- Dialog and toast composables are available
- MBox messages display correctly

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: replace naive-ui and @vicons with custom Pica components and UnoCSS icons"
```

---

### Task 8: Visual Refresh — Layout Components

Apply Neubrutalism styling to layout components. This changes the visual appearance while preserving existing layout structure and interaction logic.

**Files:**
- Modify: `app/components/GlobalHeader.vue`
- Modify: `app/components/GlobalSideNav.vue`
- Modify: `app/components/GlobalFooter.vue`
- Modify: `app/app.vue`

**Interfaces:**
- Consumes: UnoCSS shortcuts, brand colors from Task 1
- Produces: Neubrutalism-styled layout shell

- [ ] **Step 1: Restyle `app/app.vue`**

Update background to cream, use UnoCSS font:

```vue
<template lang="pug">
PicaProvider#app-container
  main.flex-1
    article.responsive
      NuxtPage

  NProgress
  GlobalHeader
  GlobalSideNav
  GlobalFooter
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  background-color: #FFF8DC;
}

article {
  margin-top: 60px;
  padding-top: 2rem;
  padding-bottom: 4rem;
}
</style>
```

- [ ] **Step 2: Restyle `app/components/GlobalHeader.vue`**

The header gets a Neubrutalism treatment: solid background, bottom border instead of shadow, bold typography.

Update the `<style scoped lang="scss">` block. Key changes:
- White background with thick bottom border (`border-bottom: 3px solid #000`)
- Remove old box-shadow
- Search input gets pica-input styling
- User dropdown gets pica-card styling
- Increase header height to 60px
- Navigation links get bold font weight

The implementer should read the current file and restyle every selector with Neubrutalism aesthetics, keeping the same selectors and structure but updating colors, borders, shadows, and border-radius values to match the pica-* design tokens.

- [ ] **Step 3: Restyle `app/components/GlobalSideNav.vue`**

Key changes:
- `.inner` panel: white background with right border (`border-right: 3px solid #000`) instead of the invisible edge
- `.group .title`: uppercase, letter-spacing, bold
- `li a`: on hover use brand-yellow background instead of transparent
- `.backdrop`: slightly darker overlay
- Active link: brand-pink background with white text

- [ ] **Step 4: Restyle `app/components/GlobalFooter.vue`**

Key changes:
- Use brand-pink background for `.top` section (currently uses CSS variable)
- `.bottom`: darker pink / brand-pinkHot
- Section headings: display font, bold, with bottom border
- Links: white/cream color with underline on hover
- Apply pica-border between sections

- [ ] **Step 5: Verify layout renders correctly**

```bash
pnpm dev
```

Check all pages to verify header, sidebar, and footer render with Neubrutalism styling. Check responsive behavior at mobile widths.

- [ ] **Step 6: Commit**

```bash
git add app/app.vue app/components/GlobalHeader.vue app/components/GlobalSideNav.vue app/components/GlobalFooter.vue
git commit -m "feat: apply Neubrutalism styling to layout components"
```

---

### Task 9: Visual Refresh — Data Display + Utility Components

**Files:**
- Modify: `app/components/BookCard.vue`
- Modify: `app/components/BooksList.vue`
- Modify: `app/components/Lazyload.vue`
- Modify: `app/components/ExternalLink.vue`
- Modify: `app/components/Placeholder.vue`
- Modify: `app/components/NProgress.vue`

**Interfaces:**
- Consumes: UnoCSS shortcuts from Task 1
- Produces: Neubrutalism-styled data display and utility components

- [ ] **Step 1: Restyle `app/components/BookCard.vue`**

Key changes:
- Apply pica-card styling to `li.book-card` (thick border, solid shadow, rounded corners)
- Image thumbnail: pica-border with hover lift effect
- Stats icons: brand colors
- Tags: use PicaTag styling or pica-tag shortcut
- Convert `<style lang="sass">` to `<style lang="scss">`

- [ ] **Step 2: Restyle `app/components/BooksList.vue`**

Convert sass→scss. The layout (flex wrap) stays the same.

```vue
<style lang="scss">
ul.books-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
```

- [ ] **Step 3: Restyle `app/components/Lazyload.vue`**

Convert sass→scss. Update loading animation to use brand colors:

```vue
<style scoped lang="scss">
.lazyload {
  &[data-lazy-state="pending"] {
    background-color: #e8e8e8;
  }
  &[data-lazy-state="loading"],
  &[data-lazy-state="retry"] {
    animation: img-loading 0.6s ease infinite alternate;
    border: 0;
  }
  &[data-lazy-state="failed"] {
    background: #fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAGElEQVQYV2N4DwX/oYBhgARgDJjEAAkAAEC99wFuu0VFAAAAAElFTkSuQmCC) repeat;
  }
}

@keyframes img-loading {
  from { background-color: #FFD6E0; }
  to { background-color: #FFF3C7; }
}
</style>
```

- [ ] **Step 4: Restyle `app/components/ExternalLink.vue`**

Convert sass→scss. The icon is now a UnoCSS `<i>` element (from Task 7):

```vue
<style scoped lang="scss">
.external-icon {
  font-size: 0.75em;
  margin-left: 4px;
}

.no-icon {
  .external-icon {
    display: none;
  }
}
</style>
```

- [ ] **Step 5: Restyle `app/components/Placeholder.vue`**

Convert sass→scss. Update spinner color to brand-pink:

```vue
<style scoped lang="scss">
.svgspinner {
  max-width: 100%;

  .spincircle {
    animation: loading-round 1.2s infinite linear, loading-dash 2s infinite linear alternate;
    stroke-dasharray: 236;
    stroke: #FF5C8A;
  }
}

@keyframes loading-round {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(720deg); }
}

@keyframes loading-dash {
  0% { stroke-dashoffset: 236; }
  100% { stroke-dashoffset: 0; }
}
</style>
```

- [ ] **Step 6: Restyle `app/components/NProgress.vue`**

Convert sass→scss. Update progress bar to brand-pink:

```vue
<style lang="scss">
#nprogress {
  .bar {
    background-color: #FF5C8A;
    top: 61px;
    .peg {
      display: none;
    }
  }

  .spinner {
    top: 70px;

    .spinner-icon {
      border-top-color: #FF5C8A;
      border-left-color: #FF5C8A;
    }
  }
}
</style>
```

- [ ] **Step 7: Verify data display components**

```bash
pnpm dev
```

Check `/categories` (BookCard grid), any comics list page, ensure loading spinners and lazy images work correctly.

- [ ] **Step 8: Commit**

```bash
git add app/components/BookCard.vue app/components/BooksList.vue app/components/Lazyload.vue app/components/ExternalLink.vue app/components/Placeholder.vue app/components/NProgress.vue
git commit -m "feat: apply Neubrutalism styling to data display and utility components"
```

---

### Task 10: Visual Refresh — Simple Pages

**Files:**
- Modify: `app/pages/index.vue`
- Modify: `app/pages/auth.vue`
- Modify: `app/pages/about.vue`
- Modify: `app/pages/[...slug].vue`
- Modify: `app/pages/profile.vue`

**Interfaces:**
- Consumes: PicaCard, PicaButton, PicaMbox from Tasks 2-3; UnoCSS shortcuts
- Produces: Neubrutalism-styled simple pages

- [ ] **Step 1: Restyle `app/pages/index.vue`**

Replace `.card` with `PicaCard`, `.button` links with `PicaButton` or pica-btn classes. Convert empty scss block. Use UnoCSS utility classes for layout (replace `.flex`, `.gap-1`, `.flex-1` with UnoCSS attributify or class equivalents since the global CSS still has these — but start using UnoCSS where adding new styles).

- [ ] **Step 2: Restyle `app/pages/auth.vue`**

Key changes:
- Login form `.card` → `PicaCard`
- `button` → `PicaButton(variant="primary")`
- Input fields: apply pica-input styling
- `.loading-cover`: keep existing (global style)
- Convert sass→scss

- [ ] **Step 3: Restyle `app/pages/about.vue`**

Wrap content in `PicaCard`. Convert empty sass→scss.

- [ ] **Step 4: Restyle `app/pages/[...slug].vue`**

Style 404 page with Neubrutalism: centered layout, large bold heading, brand-pink accent. Convert empty sass→scss.

- [ ] **Step 5: Restyle `app/pages/profile.vue`**

Key changes:
- Profile card: `PicaCard` with Neubrutalism styling
- Avatar: pica-border with circular clip
- Slogan edit area: pica-input for textarea, PicaButton for submit/cancel
- Convert sass→scss

- [ ] **Step 6: Verify all simple pages**

```bash
pnpm dev
```

Check `/`, `/auth`, `/about`, `/profile`, and any 404 path.

- [ ] **Step 7: Commit**

```bash
git add app/pages/index.vue app/pages/auth.vue app/pages/about.vue "app/pages/[...slug].vue" app/pages/profile.vue
git commit -m "feat: apply Neubrutalism styling to simple pages"
```

---

### Task 11: Visual Refresh — List Pages

**Files:**
- Modify: `app/pages/search.vue`
- Modify: `app/pages/favourite.vue`
- Modify: `app/pages/categories.vue`
- Modify: `app/pages/comics/index.vue`
- Modify: `app/pages/comics/[category].vue`

**Interfaces:**
- Consumes: PicaButton, PicaMbox, PicaCard; UnoCSS shortcuts
- Produces: Neubrutalism-styled list pages

- [ ] **Step 1: Restyle `app/pages/search.vue`**

Key changes:
- `.bread-crumb` → use PicaButton or pica-btn for back link
- Remove old `.pagenator` scoped styles (pagination is now handled by PicaPagination)
- Convert sass→scss

- [ ] **Step 2: Restyle `app/pages/favourite.vue`**

Same pattern as search.vue — near-identical template. Remove `.pagenator` styles. Convert sass→scss.

- [ ] **Step 3: Restyle `app/pages/categories.vue`**

Key changes:
- Category grid cards: apply pica-card styling with image hover effect
- `.title` overlay: keep the position absolute overlay but update colors/typography
- Convert sass→scss (this file uses unscoped `<style lang="sass">`)

- [ ] **Step 4: Restyle `app/pages/comics/index.vue` and `app/pages/comics/[category].vue`**

Same pattern as search.vue. Remove `.pagenator` styles. Convert sass→scss. These two files are nearly identical.

- [ ] **Step 5: Verify list pages**

```bash
pnpm dev
```

Check `/search?keyword=test`, `/favourite`, `/categories`, `/comics/妹妹系`.

- [ ] **Step 6: Commit**

```bash
git add app/pages/search.vue app/pages/favourite.vue app/pages/categories.vue app/pages/comics/
git commit -m "feat: apply Neubrutalism styling to list pages"
```

---

### Task 12: Visual Refresh — Book Pages + Global Styles Cleanup

**Files:**
- Modify: `app/pages/book/[bookid]/index.vue`
- Modify: `app/pages/book/[bookid]/[epsid].vue`
- Modify: `app/assets/styles/elements.scss`
- Modify: `app/assets/styles/formats.scss`
- Modify: `app/assets/styles/variables.scss`

**Interfaces:**
- Consumes: All Pica components, UnoCSS shortcuts
- Produces: Fully Neubrutalism-styled book pages; cleaned up global styles

- [ ] **Step 1: Restyle `app/pages/book/[bookid]/index.vue`**

Key changes:
- Book info card: PicaCard or pica-card styling
- Thumbnail: pica-border with rounded corners
- Episode links: pica-tag or pica-btn styling (replace current `box-shadow: 0 0 0 1px` pattern)
- Tags: PicaTag styling
- Stats: icon + text with brand colors
- Bookmark button: brand-bookmark color with pica-press effect
- Convert sass→scss (unscoped styles)

- [ ] **Step 2: Restyle `app/pages/book/[bookid]/[epsid].vue`**

Key changes:
- Page number tags: pica-tag with brand-pink background
- Navigation buttons: PicaButton or pica-btn
- Episode list at bottom: same as book index (pica-tag/pica-btn for ep links)
- `.pages-list` reader area: clean white background, pica-border on container
- Convert sass→scss (unscoped styles)

- [ ] **Step 3: Clean up `app/assets/styles/elements.scss`**

Apply Neubrutalism to remaining global element styles:

Key changes:
- `h1`: use display font family, larger size, bold
- `h2`: replace the gradient underline mixin with a Neubrutalism highlight (solid brand-yellow background behind text, or thick bottom border)
- `a.button`: apply pica-btn-like styling (thick border, solid shadow)
- `button`: apply pica-btn styling as global default
- `.card`: apply pica-card styling (thick border, solid shadow) — this catches any remaining `.card` usage not yet converted to `PicaCard`
- `.tags-list .tag`: apply pica-tag styling
- `input, textarea`: apply pica-input styling
- `pre, code`: pica-border-sm, brand colors
- `.loading-cover`: keep functionality, update colors

- [ ] **Step 4: Clean up `app/assets/styles/formats.scss`**

Remove utility classes that are now provided by UnoCSS:
- Delete: `.align-center`, `.align-left`, `.align-right` (use `text-center`, `text-left`, `text-right`)
- Delete: `.flex` (use `flex`)
- Delete: `.flex-1` (use `flex-1`)
- Delete: `.gap-1` (use `gap-4`)
- Delete: `.flex-center` (use `flex items-center`)
- Delete: `.pointer` (use `cursor-pointer`)
- Keep: `.position-center`, `.pre`/`.poem`, `.flex-list`, `.bread-crumb`, `.mbox` (for any remaining usage)

**Important:** Before deleting utility classes from global styles, update all templates that still use them. Search the entire project for each class name and replace with UnoCSS equivalents. If a class is used in many files, it may be more practical to keep it in globals and remove it in a separate cleanup pass.

Recommended approach: Keep the utility classes in this task, mark them for removal. A follow-up cleanup can systematically replace them with UnoCSS attributify syntax in templates.

- [ ] **Step 5: Update `app/assets/styles/variables.scss`**

Slim down to only variables that are still referenced. Many can be removed since colors are now in UnoCSS theme:
- Keep: `--theme-accent-color` and friends (still referenced by some components)
- Keep: `--theme-text-color`, `--theme-background-color` (referenced by global styles)
- Remove any variables that have no remaining consumers (check with grep)

- [ ] **Step 6: Verify book pages and global styles**

```bash
pnpm dev
```

Check `/book/[any-book-id]` and `/book/[bookid]/[epsid]` pages. Verify:
- Book detail page renders with Neubrutalism cards
- Reader page shows pages correctly
- Episode links are styled
- All headings, links, buttons across the site are consistently styled

- [ ] **Step 7: Commit**

```bash
git add app/pages/book/ app/assets/styles/
git commit -m "feat: apply Neubrutalism styling to book pages and clean up global styles"
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `pnpm dev` runs without errors
- [ ] `pnpm build` completes successfully
- [ ] No `naive-ui` or `@vicons` in `package.json` or `node_modules`
- [ ] No `import ... from 'naive-ui'` or `import ... from '@vicons'` anywhere in source
- [ ] No `lang="sass"` anywhere in `.vue` files (all converted to `lang="scss"`)
- [ ] All pages render: `/`, `/auth`, `/about`, `/profile`, `/search`, `/favourite`, `/categories`, `/comics/*`, `/book/*`, 404
- [ ] Icons display correctly on all pages
- [ ] Pagination and select components work
- [ ] Responsive layout works at mobile widths
- [ ] Header hide/show on scroll works
- [ ] Side navigation opens/closes correctly
