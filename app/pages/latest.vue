<template lang="pug">
#latest-container
  .bread-crumb
    NuxtLink.pica-btn.bg-cream(to='/')
      i.i-fa6-solid-arrow-left
      |  首页

  h1 最新作品

  PicaMbox(v-if='error', type='error', header='加载失败')
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    Placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    book-list-paginator(
      v-model:page='page',
      :total-pages='totalPages',
      v-model:sort='sort'
    )
    books-list(:data='comics', backTo='/latest')
    book-list-paginator(
      v-model:page='page',
      :total-pages='totalPages',
      v-model:sort='sort'
    )
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { picaClient } from '~/utils/pica-client'
import { PicaListSort, type PicaBookListItem } from '~/types'

setTitle('最新作品')

const route = useRoute()
const router = useRouter()

const page = ref(1)
const totalPages = ref(1)
const sort = ref<PicaListSort>(PicaListSort.DATE_DESC)
const comics = ref<PicaBookListItem[]>([])
const loading = ref(false)
const error = ref('')

onMounted(() => {
  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as PicaListSort) || PicaListSort.DATE_DESC
  loadData()
})

watch([page, sort], loadData)

async function loadData() {
  if (loading.value) return
  loading.value = true
  error.value = ''

  router.push({ query: { page: page.value, sort: sort.value } })

  try {
    const data = await picaClient.fetchLatestComics(page.value)
    comics.value = data.docs
    totalPages.value = data.pages
  } catch (e: any) {
    error.value = e.message || 'Unknown error'
    console.warn(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
</style>
