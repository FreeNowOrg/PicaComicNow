# Homepage Redesign Design Spec

## Goal

Replace the placeholder homepage with a content-rich landing page that surfaces leaderboard, latest uploads, user profile, and random discovery — all in Neubrutalism style.

## Layout

CSS Grid, responsive. Desktop (>800px) uses a 2-column top row; mobile (≤800px) stacks everything vertically.

```
Desktop (>800px):
┌──────────────────────────┬─────────────────┐
│  HeroCarousel (60%)       │ LatestComics     │
│  24h leaderboard top 5    │ (40%)            │
│  auto-rotate 5s           │ 10 newest comics │
│  dots + arrows            │ compact list     │
├──────────────────────────┴─────────────────┤
│  UserCard                                    │
│  avatar + name + level | punch-in | fav link │
├──────────────────────────────────────────────┤
│  Random Discovery (infinite scroll)          │
│  BookCard grid, IntersectionObserver,        │
│  client-side dedup by _id                    │
└──────────────────────────────────────────────┘

Mobile (≤800px):
Single column, same order top→bottom.
```

## Components

### 1. HeroCarousel

**File:** `app/components/HeroCarousel.vue`

**Data source:** `GET /comics/leaderboard?tt=H24&ct=VC`, take first 5 items.

**Visual:**
- Each slide: comic cover as large background image (object-fit cover, dimmed overlay), rank number (large bold), title, author, view count overlaid.
- Click anywhere on slide → `/book/{_id}`.
- Bottom bar: 5 dot indicators (clickable), left/right arrow buttons.
- Below dots: "查看完整排行榜→" link (points to a future ranking page, or `/comics/leaderboard` route — for now just an anchor placeholder).

**Behavior:**
- Auto-rotate every 5 seconds.
- Pause on hover.
- Left/right arrows cycle prev/next.
- Dot click jumps to that slide.
- CSS transitions for slide change (opacity crossfade or translateX slide).
- No third-party carousel library — pure CSS + Vue reactivity.

**Styling:** 3px black border, offset shadow. Full-height to match LatestComics. Minimum height ~300px.

**Props:** `comics: ComicListItem[]` (parent fetches data, passes in).

### 2. LatestComics

**File:** `app/components/LatestComics.vue`

**Data source:** `GET /comics?page=1&s=dd`, take first 10 items from `docs` array.

**Visual:**
- Header bar: "最新上传" title (bold, display font).
- List of 10 rows, each row: small thumbnail (40×53px, 3:4 ratio, 2px black border), title (single line, text-overflow ellipsis), author name (muted color).
- Each row clickable → `/book/{_id}`.
- Bottom: "更多新作→" link → `/comics?s=dd` (or a dedicated route).

**Styling:** 3px black border, offset shadow. Same height as HeroCarousel (use CSS to match or allow natural height with min-height). Internal rows separated by 1px border or subtle divider.

**Props:** `comics: ComicListItem[]` (parent fetches data, passes in).

### 3. UserCard

**File:** `app/components/UserCard.vue`

**Data source:** Uses `useUserStore()` for profile data.

**Visual — logged in:**
- Horizontal layout: avatar (48×48px, 2px border) + name + level/title badge → right side: "签到" PicaButton (calls punch-in API if available, or placeholder) + "我的收藏" PicaButton → `/favourite`.

**Visual — not logged in:**
- "请先登录以使用完整功能" + PicaButton(variant="primary") "登录" → `/auth`.

**Styling:** Subtle — 2px border (pica-border-sm), no offset shadow, blends with page background. Full width.

**Props:** None (reads from store internally).

### 4. Random Discovery Section

**Not a separate component** — implemented directly in `app/pages/index.vue`.

**Data source:** `GET /comics/random` (~20 items per call, no pagination).

**Behavior:**
- On mount: fetch first batch.
- `IntersectionObserver` on a sentinel `<div>` at the bottom of the list.
- When sentinel enters viewport: fetch another batch, deduplicate by `_id` using a `Set<string>`, append new items to the reactive array.
- Loading state: show Placeholder spinner below the list.
- "换一批" PicaButton above the list to manually clear and re-fetch.
- Section title: "随机推荐" with a dice icon (`i-fa6-solid-dice`).

**Rendering:** Reuses existing `BooksList` + `BookCard` components.

**Dedup logic:**
```ts
const seenIds = new Set<string>()
function appendComics(newComics: ComicListItem[]) {
  const fresh = newComics.filter(c => !seenIds.has(c._id))
  fresh.forEach(c => seenIds.add(c._id))
  comics.value.push(...fresh)
}
```

## Data Flow

All API calls happen in `app/pages/index.vue` on mount (parallel fetch):

```ts
const [leaderboard, latest] = await Promise.all([
  picaClient.fetchLeaderboard('H24'),  // new method
  picaClient.fetchLatestComics(),       // new method
])
```

Results passed as props to `HeroCarousel` and `LatestComics`. Random comics fetched separately with lazy loading.

**New PicaClient methods needed:**

```ts
async fetchLeaderboard(tt: 'H24' | 'D7' | 'D30'): Promise<ComicListItem[]>
async fetchLatestComics(page?: number): Promise<PaginatedResult<ComicListItem>>
async fetchRandomComics(): Promise<ComicListItem[]>
```

## Error Handling

- If leaderboard/latest APIs fail: show PicaMbox(type="error") in that section, rest of page still renders.
- If random API fails: show error message below list, retry button.
- If user not logged in: UserCard shows login prompt, rest of page still works (all comic APIs require auth, so the page redirects to /auth anyway via existing middleware).

## Responsive Breakpoints

- `>800px`: 2-column grid top row (60/40 split via `grid-template-columns: 3fr 2fr`).
- `≤800px`: single column, HeroCarousel full width, LatestComics full width below it.

## Files Changed

| File | Action |
|---|---|
| `app/pages/index.vue` | Rewrite |
| `app/components/HeroCarousel.vue` | Create |
| `app/components/LatestComics.vue` | Create |
| `app/components/UserCard.vue` | Create |
| `app/utils/pica-client.ts` | Add 3 new methods |
| `app/types/Api.ts` | Add leaderboard types if needed |
