<template lang="pug">
mixin pagenator
  book-list-paginator(
    v-model:page='page',
    v-model:sort='sort',
    :total-pages='totalPages'
  )

#favourite-container
  .bread-crumb
    NuxtLink(to='/') 首页
    NuxtLink(to='/profile') 个人资料
    span 收藏夹

  h1 我的收藏

  PicaMbox(v-if='error', type='error', header='Failed to get list')
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    +pagenator
    books-list(:data='comics', :backTo='"/favourite"')
    +pagenator
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { setTitle } from '~/utils/setTitle'
import { getErrMsg } from '~/utils/getErrMsg'
import { type PicaBookListItem, PicaListSort } from '~/types'
import { useUserStore } from '~/stores/user'

definePageMeta({
  alias: ['/bookmark', '/bookmarks', '/favorite', '/favourites'],
})

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const page = ref(1)
const sort = ref<PicaListSort>(PicaListSort.DATE_DESC)
const totalPages = ref(1)

const comics = ref<PicaBookListItem[]>([])

onMounted(() => {
  setTitle('Favourites')

  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as PicaListSort) || PicaListSort.DATE_DESC

  loadData()
})

watch([page, sort], loadData)

const loading = ref(false)
const error = ref('')
function loadData() {
  if (loading.value) return

  router.replace({
    query: {
      page: page.value,
      sort: sort.value,
    },
  })

  loading.value = true
  error.value = ''

  user
    .fetchFavoriteBooks({
      sort: sort.value,
      page: page.value,
    })
    .then(
      (data) => {
        comics.value = data.comics.docs
        totalPages.value = data.comics.pages
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
</script>

<style scoped lang="scss">
// Breadcrumb spacing
</style>
