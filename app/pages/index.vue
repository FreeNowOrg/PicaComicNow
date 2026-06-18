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
