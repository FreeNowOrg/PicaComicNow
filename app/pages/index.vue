<template lang="pug">
#index-container
  UserCard

  .top-grid
    HeroCarousel(v-if='home.leaderboard.length', :comics='home.leaderboard')
    .top-grid-placeholder(v-else)
      Placeholder
    LatestComics(v-if='home.latestComics.length', :comics='home.latestComics')
    .top-grid-placeholder(v-else)
      Placeholder

  PicaMbox(v-if='home.topError', type='error', :header='home.topError')

  .search-bar
    input.search-input(
      type='text',
      placeholder='搜索漫画...',
      v-model='searchInput',
      @keydown.enter='handleSearch'
    )
    PicaButton(variant='primary', size='sm', @click='handleSearch')
      i.i-fa6-solid-magnifying-glass
    NuxtLink(to='/categories')
      PicaButton(size='sm')
        i.i-fa6-solid-folder
        | 分类列表

  section.random-section
    .random-header
      h2
        i.i-fa6-solid-dice
        |  随机推荐
      PicaButton(size='sm', @click='home.refreshRandom()') 换一批
    books-list(v-if='home.randomComics.length', :data='home.randomComics', backTo='/')
    .random-loading(v-if='home.randomLoading')
      Placeholder
    .random-sentinel(ref='sentinelRef')
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { useHomeStore } from '~/stores/home'

setTitle()

const home = useHomeStore()
const router = useRouter()
const searchInput = ref('')
const sentinelRef = ref<HTMLElement>()
let observer: IntersectionObserver | null = null

function handleSearch() {
  if (searchInput.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchInput.value.trim() } })
  }
}

onMounted(async () => {
  await home.loadTop()
  if (!home.randomComics.length) {
    await home.loadRandomBatch()
  }
  setupObserver()
})

function setupObserver() {
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        home.loadRandomBatch()
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

.search-bar {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  a { text-decoration: none; display: flex; }

  .search-input {
    flex: 1;
    border: 3px solid #000;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    background: #fff;
    box-shadow: 4px 4px 0 0 #000;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
      outline: none;
      border-color: #FF5C8A;
      box-shadow: 4px 4px 0 0 #FF5C8A;
    }
  }
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
