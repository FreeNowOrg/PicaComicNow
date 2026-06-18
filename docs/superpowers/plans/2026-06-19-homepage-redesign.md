# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder homepage with a content-rich landing page featuring a leaderboard carousel, latest uploads list, user card, and infinite-scroll random discovery.

**Architecture:** Grid-based responsive layout. Parent page (`index.vue`) fetches data and passes props to three new child components (`HeroCarousel`, `LatestComics`, `UserCard`). Random discovery is implemented inline in the page using existing `BooksList`/`BookCard`. All API calls go through `PicaComicClient`.

**Tech Stack:** Nuxt 4, Vue 3, Pug, SCSS, UnoCSS (Neubrutalism `pica-*` shortcuts)

## Global Constraints

- All Vue components use `lang="pug"` for templates, `lang="ts"` for scripts, `lang="scss"` for styles
- UnoCSS shortcuts use `pica-*` prefix
- No test framework — verification is via `pnpm dev` and visual inspection
- Pug dot-shorthand cannot contain `[]`, `:`, `/` — use string `class` attribute or attributify for arbitrary values
- Code comments in English
- Commit messages in English, Conventional Commits format
- No third-party carousel library

## File Structure

### New files

```
app/components/HeroCarousel.vue    — Leaderboard top-5 carousel with auto-rotate
app/components/LatestComics.vue    — 10-item compact list of newest uploads
app/components/UserCard.vue        — User profile bar with punch-in and favourites
```

### Modified files

```
app/utils/pica-client.ts           — Add fetchLeaderboard, fetchLatestComics, fetchRandomComics
app/types/Api.ts                   — Add PicaLeaderboardItem, response types
app/pages/index.vue                — Full rewrite: grid layout, data fetching, random discovery
```

---

### Task 1: API Client + Types

**Files:**
- Modify: `app/types/Api.ts`
- Modify: `app/utils/pica-client.ts`

**Interfaces:**
- Consumes: existing `PicaComicClient` class, `PicaBookListItem` type
- Produces: `PicaLeaderboardItem` type, `picaClient.fetchLeaderboard(tt)`, `picaClient.fetchLatestComics(page?)`, `picaClient.fetchRandomComics()`

- [ ] **Step 1: Add types to `app/types/Api.ts`**

Add after the `PicaBookListItem` interface (around line 34):

```ts
export interface PicaLeaderboardItem extends PicaBookListItem {
  leaderboardCount: number
  viewsCount: number
}

export type ApiResponseLeaderboard = ApiResponse<{
  comics: PicaLeaderboardItem[]
}>

export type ApiResponseRandomComics = ApiResponse<{
  comics: PicaBookListItem[]
}>
```

- [ ] **Step 2: Add three methods to `app/utils/pica-client.ts`**

Add the import for the new types at the top:

```ts
import type {
  ApiResponseBookEps,
  ApiResponseBookList,
  ApiResponseBookMeta,
  ApiResponseBookPages,
  ApiResponseCategories,
  ApiResponseLeaderboard,
  ApiResponseRandomComics,
  ApiResponseUserProfile,
  PicaListSortType,
} from '~/types'
```

Add three methods to `PicaComicClient` class, before the closing `}`:

```ts
  async fetchLeaderboard(tt: 'H24' | 'D7' | 'D30' = 'H24') {
    const { data } = await this.http.get<ApiResponseLeaderboard>(
      '/comics/leaderboard',
      { params: { tt, ct: 'VC' } }
    )
    return data.body.comics
  }

  async fetchLatestComics(page: number = 1) {
    const { data } = await this.http.get<ApiResponseBookList>('/comics', {
      params: { page, s: 'dd' },
    })
    return data.body.comics
  }

  async fetchRandomComics() {
    const { data } = await this.http.get<ApiResponseRandomComics>('/comics/random')
    return data.body.comics
  }
```

- [ ] **Step 3: Verify build**

```bash
pnpm dev
```

Expected: Dev server starts, no type errors.

- [ ] **Step 4: Commit**

```bash
git add app/types/Api.ts app/utils/pica-client.ts
git commit -m "feat: add leaderboard, latest, and random API methods"
```

---

### Task 2: HeroCarousel Component

**Files:**
- Create: `app/components/HeroCarousel.vue`

**Interfaces:**
- Consumes: `PicaLeaderboardItem` type from Task 1
- Produces: `<HeroCarousel :comics="PicaLeaderboardItem[]" />` component

- [ ] **Step 1: Create `app/components/HeroCarousel.vue`**

```vue
<template lang="pug">
.hero-carousel(
  @mouseenter='pause',
  @mouseleave='resume'
)
  .slides
    NuxtLink.slide(
      v-for='(comic, i) in comics',
      :key='comic._id',
      :class='{ active: i === current }',
      :to='"/book/" + comic._id'
    )
      Lazyload.slide-bg(:src='comic.thumb.fileUrl')
      .slide-overlay
      .slide-content
        .rank \#{{ i + 1 }}
        .slide-title {{ comic.title }}
        .slide-meta
          span.author @{{ comic.author }}
          span.views
            i.i-fa6-solid-eye
            | {{ formatCount(comic.viewsCount || comic.totalViews) }}
  .controls
    button.arrow.prev(@click='prev')
      i.i-fa6-solid-chevron-left
    .dots
      button.dot(
        v-for='(_, i) in comics',
        :key='i',
        :class='{ active: i === current }',
        @click='goTo(i)'
      )
    button.arrow.next(@click='next')
      i.i-fa6-solid-chevron-right
  .ranking-link
    NuxtLink(to='/comics') 查看完整排行榜 →
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { PicaLeaderboardItem } from '~/types'

defineProps<{ comics: PicaLeaderboardItem[] }>()

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  current.value = (current.value + 1) % 5
}

function prev() {
  current.value = (current.value - 1 + 5) % 5
}

function goTo(i: number) {
  current.value = i
}

function startTimer() {
  timer = setInterval(next, 5000)
}

function pause() {
  if (timer) { clearInterval(timer); timer = null }
}

function resume() {
  if (!timer) startTimer()
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

onMounted(startTimer)
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped lang="scss">
.hero-carousel {
  border: 3px solid #000;
  box-shadow: 6px 6px 0 0 #000;
  position: relative;
  overflow: hidden;
  min-height: 320px;
  background: #000;
}

.slides {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  align-items: flex-end;
  text-decoration: none;
  color: #fff;

  &.active {
    opacity: 1;
    z-index: 1;
  }
}

.slide-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.slide-content {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  width: 100%;

  .rank {
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1;
    color: #FFE066;
    text-shadow: 3px 3px 0 #000;
  }

  .slide-title {
    font-size: 1.25rem;
    font-weight: 900;
    margin: 0.25rem 0;
    text-shadow: 1px 1px 0 #000;
  }

  .slide-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    opacity: 0.9;

    .views {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
}

.arrow {
  background: none;
  border: 2px solid #fff;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
  box-shadow: none;
  transition: background 0.15s;

  &:hover {
    background: #FF5C8A;
    border-color: #FF5C8A;
    translate: 0;
    box-shadow: none;
  }
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  background: transparent;
  padding: 0;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.15s;

  &.active {
    background: #FF5C8A;
    border-color: #FF5C8A;
  }

  &:hover {
    background: #fff;
    translate: 0;
    box-shadow: none;
  }
}

.ranking-link {
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  z-index: 3;
  font-size: 0.8rem;
  font-weight: 700;

  a {
    color: #FFE066;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
```

- [ ] **Step 2: Verify component compiles**

```bash
pnpm dev
```

Temporarily add `<HeroCarousel :comics="[]" />` to any page to verify it mounts without error. Remove after.

- [ ] **Step 3: Commit**

```bash
git add app/components/HeroCarousel.vue
git commit -m "feat: add HeroCarousel component for leaderboard display"
```

---

### Task 3: LatestComics Component

**Files:**
- Create: `app/components/LatestComics.vue`

**Interfaces:**
- Consumes: `PicaBookListItem` type
- Produces: `<LatestComics :comics="PicaBookListItem[]" />` component

- [ ] **Step 1: Create `app/components/LatestComics.vue`**

```vue
<template lang="pug">
.latest-comics
  .latest-header
    h3 最新上传
  .latest-list
    NuxtLink.latest-item(
      v-for='comic in comics',
      :key='comic._id',
      :to='"/book/" + comic._id'
    )
      .latest-thumb
        Lazyload(:src='comic.thumb.fileUrl')
      .latest-info
        .latest-title {{ comic.title }}
        .latest-author @{{ comic.author }}
  .latest-footer
    NuxtLink(to='/comics') 更多新作 →
</template>

<script setup lang="ts">
import type { PicaBookListItem } from '~/types'

defineProps<{ comics: PicaBookListItem[] }>()
</script>

<style scoped lang="scss">
.latest-comics {
  border: 3px solid #000;
  box-shadow: 6px 6px 0 0 #000;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.latest-header {
  padding: 0.75rem 1rem;
  border-bottom: 3px solid #000;
  background: #FFE066;

  h3 {
    margin: 0;
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 900;
  }
}

.latest-list {
  flex: 1;
  overflow-y: auto;
}

.latest-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #eee;
  transition: background 0.1s;

  &:hover {
    background: #FFF0F3;
    text-decoration: none;
  }

  &:last-child {
    border-bottom: none;
  }
}

.latest-thumb {
  width: 40px;
  height: 53px;
  flex-shrink: 0;
  border: 2px solid #000;
  overflow: hidden;

  :deep(.lazyload) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.latest-info {
  flex: 1;
  min-width: 0;
}

.latest-title {
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-author {
  font-size: 0.75rem;
  color: #888;
  font-weight: 600;
}

.latest-footer {
  padding: 0.5rem 1rem;
  border-top: 2px solid #000;
  text-align: right;

  a {
    font-size: 0.8rem;
    font-weight: 700;
    color: #FF5C8A;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/LatestComics.vue
git commit -m "feat: add LatestComics component for newest uploads list"
```

---

### Task 4: UserCard Component

**Files:**
- Create: `app/components/UserCard.vue`

**Interfaces:**
- Consumes: `useUserStore()` from `~/stores/user`, `DEFAULT_AVATAR` from `~/utils/config`
- Produces: `<UserCard />` component (no props)

- [ ] **Step 1: Create `app/components/UserCard.vue`**

```vue
<template lang="pug">
.user-card
  template(v-if='user.profile')
    .user-info
      img.user-avatar(:src='user.profile.avatar?.fileUrl || DEFAULT_AVATAR')
      .user-details
        .user-name {{ user.profile.name }}
        .user-level
          span.badge {{ user.profile.title }}
          span.level Lv.{{ user.profile.level }}
    .user-actions
      PicaButton(
        size='sm',
        :variant='user.profile.isPunched ? "default" : "primary"',
        :disabled='user.profile.isPunched',
        @click='handlePunch'
      ) {{ user.profile.isPunched ? '已签到' : '签到' }}
      NuxtLink(to='/favourite')
        PicaButton(size='sm') 我的收藏
  template(v-else)
    .user-info
      img.user-avatar(:src='DEFAULT_AVATAR')
      .user-details
        .user-name 请先登录以使用完整功能
    .user-actions
      NuxtLink(to='/auth')
        PicaButton(size='sm', variant='primary') 登录
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { DEFAULT_AVATAR } from '~/utils/config'
import { picaClient } from '~/utils/pica-client'

const user = useUserStore()

async function handlePunch() {
  try {
    await picaClient.http.post('/users/punch-in')
    await user.fetchProfile()
  } catch (e) {
    console.warn('Punch-in failed', e)
  }
}
</script>

<style scoped lang="scss">
.user-card {
  border: 2px solid #000;
  background: #fff;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border: 2px solid #000;
  display: block;
  object-fit: cover;
}

.user-details {
  .user-name {
    font-weight: 900;
    font-size: 1rem;
  }

  .user-level {
    display: flex;
    gap: 0.5rem;
    margin-top: 2px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .badge {
    background: #FF5C8A;
    color: #fff;
    padding: 0 6px;
    border: 1px solid #000;
  }

  .level {
    color: #888;
  }
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  a {
    text-decoration: none;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/UserCard.vue
git commit -m "feat: add UserCard component with punch-in and favourites"
```

---

### Task 5: Rewrite Homepage (index.vue)

**Files:**
- Modify: `app/pages/index.vue` (full rewrite)

**Interfaces:**
- Consumes: `HeroCarousel` (Task 2), `LatestComics` (Task 3), `UserCard` (Task 4), `picaClient.fetchLeaderboard()`, `picaClient.fetchLatestComics()`, `picaClient.fetchRandomComics()` (Task 1), `BooksList` + `BookCard` (existing)
- Produces: Complete homepage with grid layout and infinite scroll

- [ ] **Step 1: Rewrite `app/pages/index.vue`**

```vue
<template lang="pug">
#index-container
  .top-grid
    HeroCarousel(v-if='leaderboard.length', :comics='leaderboard')
    .top-grid-placeholder(v-else)
      Placeholder
    LatestComics(v-if='latestComics.length', :comics='latestComics')
    .top-grid-placeholder(v-else)
      Placeholder

  PicaMbox(v-if='topError', type='error', :header='topError')

  UserCard

  section.random-section
    .random-header
      h2
        i.i-fa6-solid-dice
        |  随机推荐
      PicaButton(size='sm', @click='refreshRandom') 换一批
    books-list(v-if='randomComics.length', :data='randomComics', backTo='/')
    .random-loading(v-if='randomLoading')
      Placeholder
    .random-sentinel(ref='sentinelRef')
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { picaClient } from '~/utils/pica-client'
import type { PicaBookListItem, PicaLeaderboardItem } from '~/types'

setTitle()

const leaderboard = ref<PicaLeaderboardItem[]>([])
const latestComics = ref<PicaBookListItem[]>([])
const topError = ref('')

const randomComics = ref<PicaBookListItem[]>([])
const randomLoading = ref(false)
const seenIds = new Set<string>()
const sentinelRef = ref<HTMLElement>()
let observer: IntersectionObserver | null = null

onMounted(async () => {
  try {
    const [lb, latest] = await Promise.all([
      picaClient.fetchLeaderboard('H24'),
      picaClient.fetchLatestComics(),
    ])
    leaderboard.value = lb.slice(0, 5)
    latestComics.value = latest.docs.slice(0, 10)
  } catch (e: any) {
    topError.value = 'Failed to load homepage data'
    console.warn(e)
  }

  await loadRandomBatch()
  setupObserver()
})

async function loadRandomBatch() {
  if (randomLoading.value) return
  randomLoading.value = true
  try {
    const comics = await picaClient.fetchRandomComics()
    const fresh = comics.filter((c) => !seenIds.has(c._id))
    fresh.forEach((c) => seenIds.add(c._id))
    randomComics.value.push(...fresh)
  } catch (e) {
    console.warn('Failed to load random comics', e)
  } finally {
    randomLoading.value = false
  }
}

function refreshRandom() {
  seenIds.clear()
  randomComics.value = []
  loadRandomBatch()
}

function setupObserver() {
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadRandomBatch()
      }
    },
    { rootMargin: '200px' }
  )
  observer.observe(sentinelRef.value)
}

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.top-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.top-grid-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  border: 3px solid #000;
  background: #fff;
}

.random-section {
  margin-top: 1.25rem;
}

.random-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h2 {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    background: none;
    border: none;
    transform: none;
    left: unset;
    padding: 0;
  }
}

.random-loading {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.random-sentinel {
  height: 1px;
}

@media (max-width: 800px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Step 2: Verify full homepage**

```bash
pnpm dev
```

Open http://localhost:3000 in the browser. Verify:
- Carousel displays 5 leaderboard comics with auto-rotation
- Latest comics list shows 10 items with thumbnails
- User card shows profile or login prompt
- Scrolling down loads random comics
- Random comics deduplicate across batches

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: redesign homepage with leaderboard, latest, user card, and random discovery"
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `pnpm dev` runs without errors
- [ ] `pnpm build` completes successfully
- [ ] Carousel auto-rotates every 5 seconds, pauses on hover
- [ ] Left/right arrows and dot indicators work
- [ ] Latest comics list shows 10 items with correct thumbnails
- [ ] User card shows profile when logged in, login prompt when not
- [ ] Scrolling to bottom triggers random comic loading
- [ ] Random comics deduplicate across multiple loads
- [ ] "换一批" button clears and reloads random comics
- [ ] Responsive: single column on screens ≤800px
- [ ] All links navigate correctly (`/book/{id}`, `/favourite`, `/auth`, `/comics`)
