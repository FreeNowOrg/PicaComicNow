# Nuxt.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate PicaComicNow from Vite SPA + Vercel Serverless to Nuxt 4, removing all Vercel coupling while preserving API structure and UI.

**Architecture:** Nuxt 4 with `ssr: false` (SPA mode). Frontend code moves into `app/` directory (Nuxt 4 default `srcDir`). Server API routes move into `server/api/` using H3 event handlers. A unified `PicaComicClient` replaces scattered axios calls.

**Tech Stack:** Nuxt 4, Vue 3.5, Pinia (@pinia/nuxt), H3, Naive UI, Pug, Sass, axios

## Global Constraints

- Nuxt 4 directory convention: frontend in `app/`, server in `server/` at root
- SPA mode only (`ssr: false`) — no SSR guards strictly required but keep code SSR-friendly for future
- Retain Pug templates as-is (install `pug` as devDependency)
- Retain Sass (indented syntax) as-is
- Retain Naive UI with existing theme config
- All `router-link` → `NuxtLink`, `router-view` → `NuxtPage`
- Deployment target: Cloudflare Workers (primary), Docker (secondary)
- `@l2studio/picacomic-api` is a devDependency (server-side only, used at build/runtime in server routes)

---

### Task 1: Nuxt project scaffold and dependency cleanup

Set up nuxt.config.ts, update package.json, create the `app/` and `server/` directory structure.

**Files:**
- Create: `nuxt.config.ts`
- Create: `app/app.vue` (placeholder)
- Modify: `package.json` (deps and scripts)
- Modify: `.gitignore` (add `.nuxt`, `.output`)
- Delete: `vite.config.ts`
- Delete: `vercel.json`
- Delete: `.vercel/` directory
- Delete: `index.html`
- Delete: `tsconfig.json` (Nuxt generates its own)
- Delete: `tsconfig.node.json`
- Delete: `src/vue-app-env.d.ts`

**Interfaces:**
- Produces: working `nuxt dev` that shows a blank page

- [ ] **Step 1: Update package.json**

Remove Vercel-related deps, add Nuxt deps, update scripts:

```json
{
  "name": "pica-comic-now",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "axios": "^1.8.2",
    "fish-store": "^1.0.1",
    "js-cookie": "^3.0.5",
    "localforage": "^1.10.0",
    "naive-ui": "^2.41.0",
    "nprogress": "0.2.0",
    "pinia": "^3.0.1",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.22.0",
    "@l2studio/picacomic-api": "0.1.13",
    "@pinia/nuxt": "^0.10.0",
    "@prettier/plugin-pug": "^3.2.1",
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^22.13.10",
    "@types/nprogress": "^0.2.3",
    "@vicons/fa": "^0.13.0",
    "@vicons/utils": "^0.1.4",
    "@vue/language-plugin-pug": "^2.2.8",
    "eslint": "^9.22.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-vue": "^10.0.0",
    "globals": "^16.0.0",
    "nuxt": "^4.4.0",
    "prettier": "^3.5.3",
    "pug": "^3.0.3",
    "sass": "^1.85.1",
    "typescript": "^5.8.2",
    "typescript-eslint": "^8.26.0",
    "vue-eslint-parser": "^10.1.1"
  },
  "packageManager": "pnpm@10.6.1"
}
```

Key changes:
- Removed: `@vercel/node`, `serverless-kit`, `vercel`, `@vitejs/plugin-vue`, `@vue/tsconfig`
- Added: `nuxt`, `@pinia/nuxt`
- Scripts: `start`/`serve`/`build` → `dev`/`build`/`generate`/`preview`/`postinstall`

- [ ] **Step 2: Create nuxt.config.ts**

```ts
export default defineNuxtConfig({
  ssr: false,

  modules: ['@pinia/nuxt'],

  css: ['~/assets/styles/index.sass'],

  runtimeConfig: {
    picaS3Base: '',
  },

  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
  },

  compatibilityDate: '2025-05-01',
})
```

- [ ] **Step 3: Create placeholder app/app.vue**

```vue
<template lang="pug">
div
  h1 Nuxt Migration in Progress
  NuxtPage
</template>
```

- [ ] **Step 4: Delete old files**

```bash
rm vite.config.ts vercel.json index.html tsconfig.json tsconfig.node.json src/vue-app-env.d.ts
rm -rf .vercel
```

- [ ] **Step 5: Update .gitignore**

Add these entries (some may already exist):

```
.nuxt
.output
```

- [ ] **Step 6: Create directory structure**

```bash
mkdir -p app/assets/styles app/components app/middleware app/pages app/plugins app/stores app/types app/utils
mkdir -p server/api/auth server/api/users server/utils
```

- [ ] **Step 7: Install dependencies and verify**

```bash
pnpm install
npx nuxt prepare
```

Run: `pnpm dev`
Expected: Nuxt dev server starts, shows placeholder page at http://localhost:3000

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Nuxt 4 project, remove Vercel dependencies"
```

---

### Task 2: Server API routes migration

Convert all 4 Vercel serverless handlers to Nuxt H3 event handlers.

**Files:**
- Create: `server/utils/pica.ts` (from `api/utils.ts`)
- Create: `server/api/[...path].ts` (from `api/index.ts`)
- Create: `server/api/auth/sign-in.post.ts` (from `api/auth/sign-in.ts`)
- Create: `server/api/users/password.put.ts` (from `api/users/password.ts`)
- Delete: `api/` directory (after migration)

**Interfaces:**
- Produces: `getTokenFromReq(event: H3Event): string | null`
- Produces: `replaceFileUrl(obj: Record<string, any>): Record<string, any>`
- Produces: server routes matching original API paths

- [ ] **Step 1: Create server/utils/pica.ts**

Port `getTokenFromReq` and `replaceFileUrl` to use H3 helpers:

```ts
import type { H3Event } from 'h3'

export function getTokenFromReq(event: H3Event): string | null {
  const query = getQuery(event)
  return (
    (query.token as string) ||
    getHeader(event, 'authorization')?.replace(/^Bearer\s+/, '') ||
    getCookie(event, 'PICA_TOKEN') ||
    null
  )
}

export function replaceFileUrl(obj: Record<string, any>): Record<string, any> {
  const config = useRuntimeConfig()
  const PICA_S3_BASE = config.picaS3Base || 'https://s3.picacomic.com'

  for (const key in obj) {
    const val = obj[key]

    if (typeof val === 'string') {
      if (val.startsWith('https://')) {
        obj[key] = val
          .replace('https://storage1.picacomic.com', PICA_S3_BASE)
          .replace('https://storage-b.picacomic.com', PICA_S3_BASE)
          .replace('https://img.picacomic.com', PICA_S3_BASE)
          .replace(
            'https://www.picacomic.com',
            'https://pica-pica.wikawika.xyz'
          )
      }
    } else if (typeof val === 'object' && val !== null) {
      obj[key] = replaceFileUrl(val)
      if (val.fileServer && val.path) {
        obj[key].fileUrl = `${val.fileServer.replace(
          /\/$/,
          ''
        )}/static/${val.path.replace(/^\//, '')}`.replace(
          '/static/static',
          '/static'
        )
      }
    }
  }

  return obj
}
```

Note: `getQuery`, `getHeader`, `getCookie`, `useRuntimeConfig` are auto-imported by Nuxt in `server/utils/`.

- [ ] **Step 2: Create server/api/[...path].ts**

The catch-all API proxy:

```ts
import { PicaComicAPI } from '@l2studio/picacomic-api'

export default defineEventHandler(async (event) => {
  const client = new PicaComicAPI({})
  const path = event.context.params?.path
  const query = { ...getQuery(event) }
  const method = event.method as 'GET' | 'POST' | 'PUT'

  const authorization = getTokenFromReq(event) || undefined

  let body: any = undefined
  if (method === 'POST' || method === 'PUT') {
    body = await readBody(event).catch(() => undefined)
  }

  console.info(`[${method}] ${path}`, query, body)

  try {
    const { data } = await client
      .fetch(path as string, {
        headers: { authorization },
        method,
        searchParams: query as Record<string, string>,
        json:
          typeof body === 'object' && body && Object.keys(body).length > 0
            ? body
            : undefined,
      })
      .json<any>()

    return {
      code: 200,
      message: 'ok',
      body: replaceFileUrl({
        ...data,
        debug: { body, params: query },
      }),
    }
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
```

- [ ] **Step 3: Create server/api/auth/sign-in.post.ts**

```ts
import { PicaComicAPI } from '@l2studio/picacomic-api'

export default defineEventHandler(async (event) => {
  const client = new PicaComicAPI({})
  const body = await readBody<{ email?: string; password?: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  }

  try {
    const token = await client.signIn({
      email: body.email,
      password: body.password,
    })

    setResponseHeader(event, 'cache-control', 'no-cache')
    return { code: 200, message: 'ok', body: { token } }
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
```

- [ ] **Step 4: Create server/api/users/password.put.ts**

```ts
import { PicaComicAPI } from '@l2studio/picacomic-api'

export default defineEventHandler(async (event) => {
  const client = new PicaComicAPI({})
  const authorization = getTokenFromReq(event)

  if (!authorization) {
    throw createError({ statusCode: 403, statusMessage: 'Please login' })
  }

  const body = await readBody(event)

  try {
    const { message } = await client
      .fetch('users/password', {
        headers: { authorization },
        method: 'PUT',
        body,
      })
      .json<any>()

    setResponseHeader(event, 'cache-control', 'no-cache')
    setCookie(event, 'PICA_TOKEN', '', {
      expires: new Date(0),
      path: '/',
      secure: true,
    })
    setResponseHeader(event, 'refresh', '0;URL=/auth')

    return { code: 200, message }
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
```

- [ ] **Step 5: Delete old api/ directory**

```bash
rm -rf api/
```

- [ ] **Step 6: Verify server routes**

Run: `pnpm dev`

Test with curl:
```bash
curl http://localhost:3000/api/categories
```

Expected: JSON response from PicaComic upstream API (may require auth, but should not 500).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: migrate server API routes from Vercel to Nuxt H3"
```

---

### Task 3: PicaComicClient and shared utilities

Create the unified HTTP client, and move shared utilities into their Nuxt 4 locations.

**Files:**
- Create: `app/utils/pica-client.ts` (new unified client)
- Move: `src/utils/LRUMap.ts` → `app/utils/LRUMap.ts`
- Move: `src/utils/PicaCache.ts` → `app/utils/PicaCache.ts`
- Move: `src/utils/setTitle.ts` → `app/utils/setTitle.ts`
- Move: `src/utils/getErrMsg.ts` → `app/utils/getErrMsg.ts`
- Move: `src/config.ts` → `app/utils/config.ts`
- Move: `src/types/` → `app/types/`
- Move: `src/styles/` → `app/assets/styles/`

**Interfaces:**
- Produces: `picaClient` singleton with typed API methods
- Produces: all utilities available via Nuxt auto-import from `app/utils/`
- Produces: types available from `~/types`

- [ ] **Step 1: Move utility files**

```bash
cp src/utils/LRUMap.ts app/utils/LRUMap.ts
cp src/utils/PicaCache.ts app/utils/PicaCache.ts
cp src/utils/setTitle.ts app/utils/setTitle.ts
cp src/utils/getErrMsg.ts app/utils/getErrMsg.ts
cp src/config.ts app/utils/config.ts
cp -r src/types app/types
cp -r src/styles/* app/assets/styles/
```

- [ ] **Step 2: Fix import paths in moved files**

In `app/utils/PicaCache.ts` — no changes needed (imports `./LRUMap` which is in the same directory).

In `app/utils/setTitle.ts` — update import:

```ts
import { PROJECT_NAME } from './config'

export function setTitle(...title: any[]) {
  document.title = [...title, PROJECT_NAME]
    .filter(Boolean)
    .map(String)
    .join(' | ')
  return document.title
}
```

In `app/utils/config.ts` — remove package.json import (use runtimeConfig instead), keep as simple constants:

```ts
export const ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
export const PROJECT_NAME = 'Pica Comic Now'

export const GITHUB_OWNER = 'FreeNowOrg'
export const GITHUB_REPO = 'PicaComicNow'
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
const year = new Date().getFullYear()
export const COPYRIGHT_YEAR = 2021
export const COPYRIGHT_STR =
  year === COPYRIGHT_YEAR ? String(COPYRIGHT_YEAR) : `${COPYRIGHT_YEAR} - ${year}`
```

Note: `VERSION` is removed — it was imported from `package.json` which is fragile. Use `useAppConfig()` or `useRuntimeConfig().public` if needed later.

- [ ] **Step 3: Create app/utils/pica-client.ts**

```ts
import axios, { type AxiosInstance } from 'axios'
import nprogress from 'nprogress'
import type {
  ApiResponseBookEps,
  ApiResponseBookList,
  ApiResponseBookMeta,
  ApiResponseBookPages,
  ApiResponseCategories,
  ApiResponseUserProfile,
  PicaListSortType,
} from '~/types'

const TOKEN_KEY = 'pica:user/token'

class PicaComicClient {
  readonly http: AxiosInstance

  constructor() {
    this.http = axios.create({ baseURL: '/api' })

    this.http.interceptors.request.use((config) => {
      nprogress.start()
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers['authorization'] = token
      }
      return config
    })

    this.http.interceptors.response.use(
      (response) => {
        nprogress.done()
        return response
      },
      (error) => {
        nprogress.done()
        if (error.response?.status === 401) {
          console.warn('Axios Error: 401 unauthorized. Clear user data!')
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem('pica:user/profile')
          const currentPath = window.location.pathname
          if (currentPath !== '/auth') {
            navigateTo({
              path: '/auth',
              query: { from: currentPath, tips: '1' },
            })
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async signIn(email: string, password: string) {
    const { data } = await this.http.post('/auth/sign-in', { email, password }, {
      headers: { 'cache-control': 'no-cache' },
    })
    return data.body.token as string
  }

  async fetchProfile() {
    const { data } = await this.http.get<ApiResponseUserProfile>('/users/profile')
    return data.body.user
  }

  async fetchFavoriteBooks(page: number, sort: PicaListSortType) {
    const { data } = await this.http.get<ApiResponseBookList>('/users/favourite', {
      params: { s: sort, page },
    })
    return data.body
  }

  async fetchCategories() {
    const { data } = await this.http.get<ApiResponseCategories>('/categories')
    return data.body.categories
  }

  async fetchBookMeta(bookid: string) {
    const { data } = await this.http.get<ApiResponseBookMeta>(`/comics/${bookid}`)
    return data.body.comic
  }

  async fetchBookEps(bookid: string, page: number) {
    const { data } = await this.http.get<ApiResponseBookEps>(`/comics/${bookid}/eps`, {
      params: { page, limit: 100 },
    })
    return data.body.eps
  }

  async fetchBookPages(bookid: string, epsid: string, page: number) {
    const { data } = await this.http.get<ApiResponseBookPages>(
      `/comics/${bookid}/order/${epsid}/pages`,
      { params: { page, limit: 30 } }
    )
    return data.body
  }

  async toggleBookmark(bookid: string) {
    const { data } = await this.http.post(`/comics/${bookid}/favourite`)
    if (data.body.action === 'favourite') return true
    if (data.body.action === 'un_favourite') return false
    throw new Error('Invalid action')
  }

  async searchComics(keyword: string, params?: {
    category?: string
    page?: number
    sort?: PicaListSortType
  }) {
    const { data } = await this.http.post<ApiResponseBookList>(
      '/comics/advanced-search',
      {
        keyword,
        categories: params?.category ? [params.category] : undefined,
        sort: params?.sort,
      },
      { params: { page: params?.page } }
    )
    return data.body
  }

  async updateSlogan(slogan: string) {
    const { data } = await this.http.put('/users/profile', { slogan })
    return data
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const { data } = await this.http.put('/users/password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return data
  }

  async fetchBooksInCategory(category: string, page: number, sort: PicaListSortType) {
    const { data } = await this.http.get<ApiResponseBookList>('/comics', {
      params: { c: category, page, s: sort },
    })
    return data.body
  }
}

export const picaClient = new PicaComicClient()
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: create PicaComicClient and migrate shared utilities"
```

---

### Task 4: Pinia stores migration

Move stores to `app/stores/`, rewrite to use `picaClient` instead of direct axios calls.

**Files:**
- Create: `app/stores/user.ts` (rewrite from `src/stores/user.ts`)
- Create: `app/stores/book.ts` (rewrite from `src/stores/book.ts`)
- Create: `app/stores/category.ts` (rewrite from `src/stores/category.ts`)
- Create: `app/stores/sidenav.ts` (copy from `src/stores/sidenav.ts`)

**Interfaces:**
- Consumes: `picaClient` from `~/utils/pica-client`
- Consumes: `PicaCache` from `~/utils/PicaCache`
- Consumes: `LRUMap` from `~/utils/LRUMap`
- Produces: `useUserStore()` with `profile`, `isLoggedIn`, `login()`, `logout()`, `fetchProfile()`, `fetchFavoriteBooks()`
- Produces: `useBookStore()` with `getBookMeta()`, `getBookEps()`, `getBookPages()`, `toggleBookmark()`
- Produces: `useCategoryStore()` with `categoriesIndex`, `fetchCategoriesIndex()`, `fetchBooksInCategory()`
- Produces: `useSidenavStore()` with `isShow`, `toggle()`

- [ ] **Step 1: Create app/stores/user.ts**

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import type { PicaListSortType, PicaUserProfile } from '~/types'

enum StorageKey {
  TOKEN = 'pica:user/token',
  PROFILE = 'pica:user/profile',
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<PicaUserProfile | null>(null)
  const isLoggedIn = computed(() => !!profile.value)

  async function login(email: string, password: string) {
    const token = await picaClient.signIn(email, password)
    localStorage.setItem(StorageKey.TOKEN, token)
    return fetchProfile()
  }

  async function logout() {
    profile.value = null
    localStorage.removeItem(StorageKey.PROFILE)
    localStorage.removeItem(StorageKey.TOKEN)
  }

  let _fetchProfilePromise: Promise<PicaUserProfile> | null = null
  async function fetchProfile(): Promise<PicaUserProfile> {
    if (!localStorage.getItem(StorageKey.TOKEN)) {
      throw new Error('Not logged in')
    }
    if (
      localStorage.getItem(StorageKey.TOKEN) &&
      localStorage.getItem(StorageKey.PROFILE)
    ) {
      try {
        profile.value = JSON.parse(localStorage.getItem(StorageKey.PROFILE)!)
        return profile.value!
      } catch (e) {
        console.error('Failed to parse user info from localStorage', e)
      }
    }

    if (!_fetchProfilePromise) {
      _fetchProfilePromise = picaClient
        .fetchProfile()
        .catch((err) => {
          _fetchProfilePromise = null
          logout()
          return Promise.reject(err) as any
        })
    }

    const user = await _fetchProfilePromise
    if (!user) {
      _fetchProfilePromise = null
      logout()
      throw new Error('Failed to get user profile, please log in again')
    }
    profile.value = user
    localStorage.setItem(StorageKey.PROFILE, JSON.stringify(user))
    return user
  }

  async function fetchFavoriteBooks(payload: {
    sort: PicaListSortType
    page: number
  }) {
    return picaClient.fetchFavoriteBooks(payload.page, payload.sort)
  }

  return {
    profile,
    isLoggedIn,
    login,
    logout,
    fetchProfile,
    fetchFavoriteBooks,
  }
})
```

Key changes vs original:
- No `import axios` — uses `picaClient`
- No `import { router }` — 401 redirect handled by `picaClient` interceptor
- No axios interceptors setup — handled by `picaClient`

- [ ] **Step 2: Create app/stores/book.ts**

```ts
import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import { PicaCache } from '~/utils/PicaCache'
import type { PicaBookMeta, PicaBookEp, PicaBookPage } from '~/types'

export interface BookPagesStoreState {
  docs: PicaBookPage[]
  totalDocs: number
  pagination: number
  totalPagination: number
}

export const useBookStore = defineStore('book', () => {
  const noCacheMode =
    typeof window !== 'undefined' &&
    (location.search.includes('noCache') || location.hash.includes('noCache'))

  const bookMetaCache = new PicaCache<PicaBookMeta>('book/meta')
  async function getBookMeta(bookid: string, noCache: boolean = noCacheMode) {
    if (!noCache) {
      const cached = await bookMetaCache.get(bookid)
      if (cached) return cached
    }
    const data = await picaClient.fetchBookMeta(bookid)
    await bookMetaCache.set(bookid, data)
    return data
  }

  const bookEpsCache = new PicaCache<PicaBookEp[]>('book/eps')
  async function getBookEps(bookid: string, noCache: boolean = noCacheMode) {
    if (!noCache) {
      const cached = await bookEpsCache.get(bookid)
      if (cached) return cached
    }
    const list: PicaBookEp[] = []
    const fetchOnePage = async (page: number): Promise<void> => {
      const eps = await picaClient.fetchBookEps(bookid, page)
      list.push(...eps.docs)
      if (eps.page < eps.pages) {
        return fetchOnePage(eps.page + 1)
      }
    }
    await fetchOnePage(1)
    await bookEpsCache.set(bookid, list)
    return list
  }

  async function toggleBookmark(bookid: string) {
    return picaClient.toggleBookmark(bookid)
  }

  const bookPagesCache = new PicaCache<BookPagesStoreState>('book/pages')
  async function getBookPages(
    bookid: string,
    epsid: string,
    pagination: number,
    noCache: boolean = noCacheMode
  ) {
    pagination = Math.max(1, pagination)
    const cacheKey = `${bookid}/${epsid}/${pagination}`
    if (!noCache) {
      const cached = await bookPagesCache.get(cacheKey)
      if (cached) return cached
    }
    const result = await picaClient.fetchBookPages(bookid, epsid, pagination)
    const state: BookPagesStoreState = {
      docs: result.pages.docs,
      totalDocs: result.pages.total,
      pagination,
      totalPagination: result.pages.pages,
    }
    await bookPagesCache.set(cacheKey, state)
    return state
  }

  // Cleanup legacy localStorage caches
  if (typeof window !== 'undefined' && window.localStorage.length) {
    const keys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith('pica:book')
    )
    keys.forEach((key) => window.localStorage.removeItem(key))
  }

  return {
    getBookMeta,
    getBookEps,
    getBookPages,
    toggleBookmark,
  }
})
```

- [ ] **Step 3: Create app/stores/category.ts**

```ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import { LRUMap } from '~/utils/LRUMap'
import type {
  ApiResponseBookList,
  PicaCategory,
  PicaListSort,
  PicaListSortType,
} from '~/types'

export const useCategoryStore = defineStore('category', () => {
  const categoriesIndex = ref<PicaCategory[]>([])

  async function fetchCategoriesIndex() {
    if (categoriesIndex.value.length) {
      return categoriesIndex.value
    }
    const categories = await picaClient.fetchCategories()
    categoriesIndex.value = categories
    return categories
  }

  const booksInCategoryMemoryCache = new LRUMap<
    string,
    ApiResponseBookList['body']
  >()

  async function fetchBooksInCategory(
    category: string,
    pagination: number,
    sort: PicaListSortType = 'dd'
  ) {
    const validSorts: PicaListSortType[] = ['ua', 'dd', 'da', 'ld', 'vd']
    if (!validSorts.includes(sort)) {
      sort = 'ua'
    }
    const key = `${category}-${sort}-${pagination}`
    if (booksInCategoryMemoryCache.has(key)) {
      return booksInCategoryMemoryCache.get(key)!.comics
    }
    const body = await picaClient.fetchBooksInCategory(category, pagination, sort)
    booksInCategoryMemoryCache.set(key, body)
    return body.comics
  }

  return {
    categoriesIndex,
    fetchCategoriesIndex,
    fetchBooksInCategory,
  }
})
```

- [ ] **Step 4: Create app/stores/sidenav.ts**

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidenavStore = defineStore('sidenav', () => {
  const isShow = ref<boolean>(false)
  const toggle = (force?: boolean) => {
    isShow.value = typeof force === 'boolean' ? force : !isShow.value
  }
  return { isShow, toggle }
})
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: migrate Pinia stores with PicaComicClient integration"
```

---

### Task 5: Components migration

Move all components to `app/components/`, replacing `router-link` with `NuxtLink`. Rework NProgress to only handle router-level progress (axios progress is now in PicaComicClient).

**Files:**
- Move + adapt: all 12 components from `src/components/` → `app/components/`

**Interfaces:**
- Consumes: stores from `~/stores/*`, config from `~/utils/config`, types from `~/types`
- Produces: all components auto-imported by Nuxt

- [ ] **Step 1: Copy and adapt components**

Copy all component files:
```bash
cp src/components/*.vue app/components/
```

Then apply these changes to each file:

**app/components/BookCard.vue** — update import path:
- `@/types` → `~/types`
- `router-link` → `NuxtLink` in pug template

**app/components/BookListPaginator.vue** — update import path:
- `@/types` → `~/types`

**app/components/BooksList.vue** — update import paths:
- `@/types` → `~/types`
- Remove explicit `import BookCard` (auto-imported)

**app/components/ExternalLink.vue** — no changes needed (no `@/` imports).

**app/components/GlobalFooter.vue** — update imports:
- `../config` → `~/utils/config`
- `router-link` → `NuxtLink` in template

**app/components/GlobalHeader.vue** — update imports:
- `@/stores/user` → `~/stores/user`
- `@/stores/sidenav` → `~/stores/sidenav`
- Remove `import GlobalSideNav` (auto-imported)
- `useRouter` from `vue-router` → `useRouter` from `#imports` (auto-imported in Nuxt, so just remove the import line)
- `router-link` → `NuxtLink` in template
- `$route.path` → `useRoute().path` (already using `useRoute` likely — check usage)

**app/components/GlobalSideNav.vue** — update imports:
- `../config` → `~/utils/config`
- `@/stores/user` → `~/stores/user` (if referenced — check)
- Remove `useRouter` import (auto-imported)
- `router-link` → `NuxtLink` in template

**app/components/Lazyload.vue** — no import path changes needed.

**app/components/MBox.vue** — no changes needed.

**app/components/NaiveuiProvider.vue** — no changes needed.

**app/components/NProgress.vue** — rewrite to only handle router-level progress:

```vue
<template lang="pug">
</template>

<script setup lang="ts">
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

const router = useRouter()

router.beforeEach(() => {
  nprogress.start()
})

router.afterEach(() => {
  nprogress.done()
})
</script>

<style lang="sass">
#nprogress
  .bar
    background-color: var(--theme-secondary-color)
    top: 51px
    .peg
      display: none

  .spinner
    top: 60px

    .spinner-icon
      border-top-color: var(--theme-secondary-color)
      border-left-color: var(--theme-secondary-color)
</style>
```

Key change: removed axios interceptors (now in `pica-client.ts`), converted from Options API to `<script setup>`, removed direct `import { router }` (use auto-imported `useRouter()`).

**app/components/Placeholder.vue** — no changes needed.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: migrate components to app/components with NuxtLink"
```

---

### Task 6: Plugins and middleware

Create Nuxt plugin for global component registration and route middleware for auth.

**Files:**
- Create: `app/plugins/global-components.ts`
- Create: `app/plugins/route-attrs.client.ts`
- Create: `app/middleware/auth.global.ts`
- Create: `app/router.options.ts`

**Interfaces:**
- Consumes: `useUserStore()` from `~/stores/user`
- Produces: global `Icon` component registration
- Produces: auth redirect middleware
- Produces: scroll behavior config

- [ ] **Step 1: Create app/plugins/global-components.ts**

Register `Icon` from `@vicons/utils` as a global component:

```ts
import { Icon } from '@vicons/utils'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Icon', Icon)
})
```

Note: `ExternalLink`, `Lazyload`, `Placeholder` are auto-imported from `app/components/` — no need to register them. But they were registered with aliases (`ELink` for `ExternalLink`). To keep the `e-link` / `ELink` alias working in templates, either:
- Rename the component file to `ELink.vue`, or
- Add an alias in the plugin:

```ts
import { Icon } from '@vicons/utils'
import ExternalLink from '~/components/ExternalLink.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Icon', Icon)
  nuxtApp.vueApp.component('ELink', ExternalLink)
})
```

- [ ] **Step 2: Create app/plugins/route-attrs.client.ts**

Handle the `data-route` body attribute and `lock-scroll` cleanup:

```ts
export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach(({ name }) => {
    document.body.setAttribute('data-route', name as string)
    document.body.classList.remove('lock-scroll')
  })
})
```

- [ ] **Step 3: Create app/middleware/auth.global.ts**

```ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useUserStore()

  if (!user.isLoggedIn && to.name !== 'auth') {
    try {
      await user.fetchProfile()
    } catch {
      console.warn('[App]', 'Verification information has expired')
      return navigateTo({
        path: '/auth',
        query: { from: to.fullPath, tips: '1' },
      })
    }
  }
})
```

- [ ] **Step 4: Create app/app/router.options.ts**

Wait — in Nuxt 4, `router.options.ts` should be at `app/router.options.ts` (inside the srcDir):

```ts
import type { RouterConfig } from 'nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Nuxt plugins and auth middleware"
```

---

### Task 7: Pages migration

Move all views to `app/pages/` with Nuxt file-based routing conventions.

**Files:**
- Create: `app/pages/index.vue` (from `src/view/index.vue`)
- Create: `app/pages/categories.vue` (from `src/view/categories.vue`)
- Create: `app/pages/comics/index.vue` and `app/pages/comics/[category].vue` (from `src/view/comics.vue`)
- Create: `app/pages/book/[bookid]/index.vue` (from `src/view/book.vue`)
- Create: `app/pages/book/[bookid]/[epsid].vue` (from `src/view/read.vue`)
- Create: `app/pages/auth.vue` (from `src/view/auth.vue`)
- Create: `app/pages/profile.vue` (from `src/view/profile.vue`)
- Create: `app/pages/favourite.vue` (from `src/view/favourite.vue`)
- Create: `app/pages/search.vue` (from `src/view/search.vue`)
- Create: `app/pages/about.vue` (from `src/view/about.vue`)
- Create: `app/pages/[...slug].vue` (from `src/view/404.vue`)

**Interfaces:**
- Consumes: stores, utils, components (all auto-imported)
- Produces: all pages with correct routing

- [ ] **Step 1: Copy view files to pages**

```bash
cp src/view/index.vue app/pages/index.vue
cp src/view/categories.vue app/pages/categories.vue
cp src/view/book.vue app/pages/book/\[bookid\]/index.vue
cp src/view/read.vue app/pages/book/\[bookid\]/\[epsid\].vue
cp src/view/auth.vue app/pages/auth.vue
cp src/view/profile.vue app/pages/profile.vue
cp src/view/favourite.vue app/pages/favourite.vue
cp src/view/search.vue app/pages/search.vue
cp src/view/about.vue app/pages/about.vue
cp src/view/404.vue app/pages/\[...slug\].vue
```

For `comics.vue`, copy it to both locations (same component handles both routes):
```bash
cp src/view/comics.vue app/pages/comics/index.vue
cp src/view/comics.vue app/pages/comics/\[category\].vue
```

- [ ] **Step 2: Update all pages — common changes**

Apply to every page file:
- `@/stores/*` → `~/stores/*` (or remove import since Nuxt auto-imports from `stores/` with `@pinia/nuxt`)
- `@/utils/*` → `~/utils/*`
- `@/types` → `~/types`
- `../config` → `~/utils/config`
- `useRoute` / `useRouter` / `onBeforeRouteUpdate` from `vue-router` — remove import lines (auto-imported by Nuxt)
- `router-link` → `NuxtLink` in pug templates
- Remove explicit component imports for auto-imported components (`BooksList`, `BookListPaginator`, `MBox`, etc.)

- [ ] **Step 3: Page-specific changes**

**app/pages/favourite.vue** — add page meta for aliases:
```vue
<script setup lang="ts">
definePageMeta({
  alias: ['/bookmark', '/bookmarks', '/favorite', '/favourites'],
})
// ... rest of script
</script>
```

**app/pages/book/[bookid]/[epsid].vue** — add page meta for `/read` alias:
```vue
<script setup lang="ts">
definePageMeta({
  alias: ['/read/:bookid/:epsid'],
})
// ... rest of script
</script>
```

**app/pages/search.vue** — change from route param to query param:

In the original, keyword came from `route.params.keyword`. Change to:
```ts
const route = useRoute()
const keyword = ref((route.query.keyword as string) || '')
```

And where the router was used to push with param:
```ts
// old: router.push({ name: 'search', params: { keyword: keyword.value } })
// new:
router.push({ path: '/search', query: { keyword: keyword.value } })
```

Watch the query instead of param:
```ts
// old: watch(() => route.params.keyword, ...)
// new:
watch(() => route.query.keyword, (val) => {
  keyword.value = (val as string) || ''
})
```

**app/pages/search.vue** — replace direct axios call with `picaClient`:
```ts
// old: axios.post(`${API_BASE}/comics/advanced-search`, ...)
// new:
import { picaClient } from '~/utils/pica-client'
const result = await picaClient.searchComics(keyword.value, {
  category: category.value || undefined,
  page: page.value,
  sort: sort.value,
})
```

**app/pages/profile.vue** — replace direct axios call with `picaClient`:
```ts
// old: axios.put(`${API_BASE}/users/profile`, { slogan })
// new:
import { picaClient } from '~/utils/pica-client'
await picaClient.updateSlogan(slogan.value)
```

**app/pages/categories.vue** — remove direct axios import (was used alongside store), replace with store call only.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: migrate all pages to Nuxt file-based routing"
```

---

### Task 8: Root app.vue and cleanup

Finalize `app/app.vue`, delete `src/` directory and old files.

**Files:**
- Modify: `app/app.vue` (from placeholder to final version)
- Delete: `src/` directory entirely
- Modify: `eslint.config.js` (update for Nuxt if needed)

**Interfaces:**
- Consumes: all components, middleware, plugins
- Produces: fully working Nuxt application

- [ ] **Step 1: Write final app/app.vue**

```vue
<template lang="pug">
NaiveuiProvider#app-container
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

<style scoped lang="sass">
#app-container
  display: flex
  flex-direction: column
  min-height: 100vh

main
  background-color: var(--theme-background-color)

article
  margin-top: 50px
  padding-top: 2rem
  padding-bottom: 4rem
</style>
```

Key changes vs original:
- `router-view` → `NuxtPage`
- Removed all imports (auto-imported by Nuxt)
- Removed `onMounted` auth logic (handled by `middleware/auth.global.ts`)
- Removed `window.Cookies = Cookies` debug hack

- [ ] **Step 2: Update eslint.config.js**

Add `.nuxt` and `.output` to ignores:

```js
{
  ignores: ['*.d.ts', '**/dist', '*.dev.*', '.nuxt', '.output'],
}
```

- [ ] **Step 3: Delete src/ directory**

```bash
rm -rf src/
```

- [ ] **Step 4: Verify the full application**

Run: `pnpm dev`

Expected:
- Dev server starts at http://localhost:3000
- Home page loads with layout (header, footer, sidenav)
- Navigation works between pages
- Auth flow works (redirect to /auth when not logged in)

Test key flows:
1. Visit `/` — should redirect to `/auth` if not logged in
2. Login at `/auth`
3. Browse `/categories`
4. Open a comic `/book/:id`
5. Read pages `/book/:id/:epsid`
6. Search `/search?keyword=test`
7. View `/favourite`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: finalize app.vue and remove legacy src/ directory"
```

---

### Task 9: Final polish and verification

Address any remaining issues, verify all routes work, ensure build succeeds.

**Files:**
- Possibly modify: various files for bug fixes discovered during testing
- Modify: `app/utils/config.ts` (add VERSION back via runtimeConfig if needed)

**Interfaces:**
- Produces: a clean, buildable Nuxt application

- [ ] **Step 1: Verify build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Preview production build**

```bash
pnpm preview
```

Test the same flows as Task 8 Step 4.

- [ ] **Step 3: Fix any remaining import issues**

Common issues to watch for:
- `@/` alias no longer works — must be `~/` in Nuxt
- Components using `import { router }` directly — must use `useRouter()`
- `window`/`document`/`localStorage` used at module top level in stores — needs guards or client-only initialization
- Pug mixin usage in templates — verify it still works with Nuxt's Vue compiler

- [ ] **Step 4: Clean up package.json**

Verify no unused dependencies remain. Check that `vue-router` can be removed from explicit deps (Nuxt bundles it). Keep it if type imports reference it directly.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final polish and build verification"
```
