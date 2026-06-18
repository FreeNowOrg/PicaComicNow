<template lang="pug">
mixin pagenator
  book-list-paginator(v-model:page='page', v-model:sort='sort', :total-pages)

#comics-container
  .bread-crumb
    NuxtLink(to='/') 首页
    span 全部漫画

  h1 全部漫画

  PicaMbox(v-if='error', type='error', header='Failed to get comics data')
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    +pagenator
    books-list(:data='comics', backTo='/comics')
    +pagenator
</template>

<script setup lang="ts">
import { computed, effect, onMounted, ref, watch } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { getErrMsg } from '~/utils/getErrMsg'
import { type PicaBookListItem, PicaListSort } from '~/types'
import { picaClient } from '~/utils/pica-client'

definePageMeta({ name: 'comics-index' })

const route = useRoute()
const router = useRouter()

const page = ref(1)
const totalPages = ref(1)
const sort = ref<PicaListSort>(PicaListSort.DEFAULT)

const comics = ref<PicaBookListItem[]>([])
const loading = ref(false)
const error = ref('')

onMounted(() => {
  setTitle('全部漫画')

  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.s as PicaListSort) || (route.query.sort as PicaListSort) || PicaListSort.DEFAULT

  loadData()
})

async function loadData() {
  if (loading.value) return

  setTitle(`全部漫画 (第 ${page.value} 页)`)
  router.push({
    query: { page: page.value, s: sort.value },
  })

  loading.value = true
  error.value = ''

  return picaClient
    .fetchAllComics(page.value, sort.value)
    .then(
      (data) => {
        comics.value = data.docs
        totalPages.value = data.pages
      },
      (err) => {
        console.warn('Failed to get comics data', err)
        error.value = getErrMsg(err)
      }
    )
    .finally(() => {
      loading.value = false
    })
}

watch([page, sort], () => {
  loadData()
})
</script>

<style scoped lang="scss">
</style>
