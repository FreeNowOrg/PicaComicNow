import { ref } from 'vue'
import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import type { PicaBookListItem, PicaLeaderboardItem } from '~/types'

export const useHomeStore = defineStore('home', () => {
  const leaderboard = ref<PicaLeaderboardItem[]>([])
  const latestComics = ref<PicaBookListItem[]>([])
  const randomComics = ref<PicaBookListItem[]>([])
  const topError = ref('')
  const topLoaded = ref(false)

  const seenIds = new Set<string>()

  async function loadTop() {
    if (topLoaded.value) return
    try {
      const [lb, latest] = await Promise.all([
        picaClient.fetchLeaderboard('H24'),
        picaClient.fetchAllComics(1, 'dd'),
      ])
      leaderboard.value = lb.slice(0, 5)
      latestComics.value = latest.docs.slice(0, 10)
      topLoaded.value = true
    } catch (e: any) {
      topError.value = '加载首页数据失败'
      console.warn(e)
    }
  }

  const randomLoading = ref(false)

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

  return {
    leaderboard,
    latestComics,
    randomComics,
    topError,
    topLoaded,
    randomLoading,
    loadTop,
    loadRandomBatch,
    refreshRandom,
  }
})
