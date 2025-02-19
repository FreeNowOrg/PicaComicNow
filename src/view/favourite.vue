<template lang="pug">
mixin pagenator
  book-list-paginator(
    v-model:page='page',
    v-model:sort='sort',
    :total-pages='totalPages'
  )

#favourite-container
  .bread-crumb
    router-link.button(to='/profile') 
      icon
        arrow-left
      |
      | Profile

  h1 My Favourites

  .mbox.error(v-if='error')
    .title Failed to get list
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
import { ArrowLeft, ArrowRight } from '@vicons/fa'
import BooksList from '../components/BooksList.vue'
import BookListPaginator from '../components/BookListPaginator.vue'
import { setTitle } from '../utils/setTitle'
import { getErrMsg } from '../utils/getErrMsg'
import { useRoute, useRouter } from 'vue-router'
import { type PicaBookListItem, PicaListSort } from '@/types'
import { useUserStore } from '@/stores/user'

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

  router.push({
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

<style scoped lang="sass">
.pagenator
  text-align: center
  > *
    display: inline-block
  .page
    margin-left: 1rem
    margin-right: 1rem
    background-color: var(--theme-accent-color)
    color: #fff
    padding: 0.25rem 0.6rem
    border-radius: 1em
    display: inline-flex
    gap: 0.4rem
    cursor: pointer
</style>
