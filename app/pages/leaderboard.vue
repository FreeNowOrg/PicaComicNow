<template lang="pug">
#leaderboard-container
  .bread-crumb
    NuxtLink.pica-btn.bg-cream(to='/')
      i.i-fa6-solid-arrow-left
      |  首页

  h1 排行榜

  .time-tabs
    PicaButton(
      v-for='tab in tabs',
      :key='tab.value',
      :variant='currentTab === tab.value ? "primary" : "default"',
      size='sm',
      @click='switchTab(tab.value)'
    ) {{ tab.label }}

  PicaMbox(v-if='error', type='error', header='加载排行榜失败')
    p {{ error }}

  .loading.align-center(v-if='loading')
    Placeholder

  books-list(v-if='comics.length', :data='comics', backTo='/leaderboard')
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { picaClient } from '~/utils/pica-client'
import type { PicaLeaderboardItem } from '~/types'

setTitle('排行榜')

type TimeRange = 'H24' | 'D7' | 'D30'

const tabs = [
  { label: '24小时', value: 'H24' as TimeRange },
  { label: '7天', value: 'D7' as TimeRange },
  { label: '30天', value: 'D30' as TimeRange },
]

const currentTab = ref<TimeRange>('H24')
const comics = ref<PicaLeaderboardItem[]>([])
const loading = ref(false)
const error = ref('')

async function loadData() {
  loading.value = true
  error.value = ''
  comics.value = []

  try {
    comics.value = await picaClient.fetchLeaderboard(currentTab.value)
  } catch (e: any) {
    error.value = e.message || 'Unknown error'
    console.warn(e)
  } finally {
    loading.value = false
  }
}

function switchTab(tab: TimeRange) {
  currentTab.value = tab
  loadData()
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.time-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
</style>
