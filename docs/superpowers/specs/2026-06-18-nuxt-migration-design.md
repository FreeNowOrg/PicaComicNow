# Nuxt.js Migration Design

Migrate PicaComicNow from Vite SPA + Vercel Serverless to Nuxt.js, removing all Vercel coupling.

## Constraints

- Minimal viable migration: preserve API structure and UI as much as possible
- SPA mode (`ssr: false`) to avoid SSR issues in this phase
- Retain Pug templates, Naive UI, Pinia, Sass
- Retain axios (wrapped in a unified PicaComicClient)
- Deployment target: Cloudflare Workers (primary), Docker (secondary)

## Project Structure Mapping

```
src/main.ts              → DELETE (Nuxt handles app bootstrap)
src/router.ts            → DELETE (file-based routing + middleware)
src/App.vue              → app.vue
src/config.ts            → composables/config.ts
src/view/*.vue           → pages/*.vue
src/components/*.vue     → components/*.vue (auto-imported)
src/stores/*.vue         → stores/*.vue (@pinia/nuxt)
src/styles/              → assets/styles/
src/types/               → types/
src/utils/               → utils/
src/assets/              → public/
api/                     → server/api/ (H3 handlers)
index.html               → DELETE (Nuxt generates)
vite.config.ts           → DELETE (nuxt.config.ts takes over)
vercel.json              → DELETE
.vercel/                 → DELETE
tsconfig.json            → DELETE (Nuxt generates)
tsconfig.node.json       → DELETE
```

## Page Route Mapping

| Original route | Page file | Notes |
|---|---|---|
| `/` | `pages/index.vue` | |
| `/categories` | `pages/categories.vue` | |
| `/comics` | `pages/comics/index.vue` | |
| `/comics/:category` | `pages/comics/[category].vue` | |
| `/book/:bookid` | `pages/book/[bookid]/index.vue` | |
| `/book/:bookid/:epsid` | `pages/book/[bookid]/[epsid].vue` | |
| `/auth` | `pages/auth.vue` | |
| `/profile` | `pages/profile.vue` | |
| `/favourite` | `pages/favourite.vue` | aliases: `/bookmark`, `/bookmarks`, `/favorite`, `/favourites` via `definePageMeta` |
| `/search?keyword=X` | `pages/search.vue` | Changed from `/search/:keyword?` to query param |
| `/about` | `pages/about.vue` | |
| `/:pathMatch(.*)*` | `pages/[...slug].vue` | 404 catch-all |

Route alias `/read/:bookid/:epsid` → `/book/:bookid/:epsid` via `definePageMeta`.

Scroll behavior config in `app/router.options.ts`.

## Server API Migration

| Original | New | Notes |
|---|---|---|
| `api/index.ts` (catch-all) | `server/api/[...path].ts` | `event.context.params.path` replaces `__PATH` |
| `api/auth/sign-in.ts` | `server/api/auth/sign-in.post.ts` | `.post.ts` enforces POST |
| `api/users/password.ts` | `server/api/users/password.put.ts` | `.put.ts` enforces PUT |
| `api/utils.ts` | `server/utils/pica.ts` | Auto-imported in server context |

Key changes:
- `@vercel/node` types → H3 `H3Event` + helpers (`getQuery`, `readBody`, `getHeader`, `getCookie`, `setCookie`)
- `serverless-kit` `HandleResponse` → direct `return` or `throw createError()`
- `process.env.VITE_PICA_S3_BASE` → `useRuntimeConfig().picaS3Base`
- `@l2studio/picacomic-api` client reused as-is
- `replaceFileUrl` pure function reused as-is

## Frontend Adaptation

### App entry & layout

- `src/App.vue` → `app.vue`, same layout structure (NaiveuiProvider wrapping GlobalHeader/GlobalSideNav/GlobalFooter)
- `<router-view>` → `<NuxtPage>`
- `<router-link>` → `<NuxtLink>` (batch replace across all components)

### Route middleware

- `userAuthGuard` (beforeEach) → `middleware/auth.global.ts` using `navigateTo()`
- `afterEach` body `data-route` → Nuxt plugin with `router.afterEach` hook

### Global components

- `ExternalLink`, `Lazyload`, `Placeholder` → auto-imported from `components/`
- `Icon` from `@vicons/utils` → registered via Nuxt plugin

### Pinia stores

- `@pinia/nuxt` module handles setup
- Direct `import router` → `useRouter()` or `navigateTo()` inside functions
- `localStorage`/`window` access guarded with `import.meta.client`

### HTTP Client: PicaComicClient

New `utils/pica-client.ts` — unified axios wrapper replacing scattered direct axios calls:

- Encapsulates axios instance + interceptors (auth token, 401 handling, NProgress)
- Typed convenience methods for all API endpoints:
  - `signIn(email, password)`
  - `fetchProfile()`
  - `fetchFavoriteBooks(page, sort)`
  - `fetchBookMeta(bookid)`
  - `fetchBookEps(bookid, page)`
  - `fetchBookPages(bookid, epsid, page)`
  - `toggleBookmark(bookid)`
  - `searchComics(keyword, category?, page?, sort?)`
  - `updateSlogan(slogan)`
  - `changePassword(old, new)`
  - Generic `get<T>(path, params?)` / `post<T>(path, body?)` / `put<T>(path, body?)` for catch-all proxy calls
- Stores and page components call `picaClient.xxx()` instead of `axios.get(API_BASE + '...')`
- `NProgress.vue` only handles router-level progress; axios-level progress moves into `pica-client.ts`

### Styles

- `src/styles/index.sass` → `assets/styles/index.sass`, referenced in `nuxt.config.ts` `css` array
- Component `<style lang="sass">` unchanged

### setTitle utility

- `document.title = ...` works in SPA mode
- No change needed; can migrate to `useHead()` if SSR is enabled later

## Dependencies

### Add
- `nuxt`
- `@pinia/nuxt`

### Remove
- `@vercel/node`
- `serverless-kit`
- `vercel`
- `@vitejs/plugin-vue` (Nuxt bundles this)
- `@vue/tsconfig`
- `vue-router` (Nuxt bundles this, but keep if types are needed)

### Keep
- `vue`, `pinia`, `axios`, `naive-ui`, `pug`, `sass`
- `@l2studio/picacomic-api`
- `localforage`, `js-cookie`, `nprogress`
- `@vicons/fa`, `@vicons/utils`
- `fish-store`
- ESLint / Prettier toolchain

## nuxt.config.ts Skeleton

```ts
export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/styles/index.sass'],
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    picaS3Base: '',  // NUXT_PICA_S3_BASE env var
  },
  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
  },
  compatibilityDate: '2025-05-01',
})
```

## Out of Scope

- SSR enablement (future phase)
- Migration from axios to `$fetch`/`useFetch` (future phase)
- Pug to HTML template conversion (future phase)
- `useHead()` adoption (future phase)
