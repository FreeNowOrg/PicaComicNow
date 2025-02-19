<template lang="pug">
mixin pagenator
  book-list-paginator(
    v-model:page='page',
    v-model:sort='sort',
    :total-pages='totalPages'
  )

#search-container
  .bread-crumb
    router-link.button(to='/categories') 
      icon
        arrow-left
      |
      | Categories Index

  h1(v-if='keyword') Search『{{ keyword }}』comics (page {{ page }})
  h1(v-else) Advanced Search

  .mbox.error(v-if='error')
    .title Failed to get comics data
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    +pagenator
    books-list(:data='comics', :backTo='"/search/" + keyword')
    +pagenator
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrMsg } from '../utils/getErrMsg'
import { setTitle } from '../utils/setTitle'
import { ArrowLeft, ArrowRight } from '@vicons/fa'
import BooksList from '../components/BooksList.vue'
import { API_BASE } from '../config'
import {
  PicaListSort,
  type ApiResponseBookList,
  type PicaBookListItem,
} from '../types'
import BookListPaginator from '@/components/BookListPaginator.vue'
const route = useRoute()
const router = useRouter()

const keyword = computed(() => route.params.keyword as string)
const category = computed(() => route.query.category as string)
const page = ref(+(route.query.page || 1))
const totalPages = ref(1)
const sort = ref<PicaListSort>(
  (route.query.sort as PicaListSort) || PicaListSort.DEFAULT
)

const comics = ref<PicaBookListItem[]>([])
const loading = ref(false)
const error = ref('')

onMounted(() => {
  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as PicaListSort) || PicaListSort.DEFAULT

  loadData()
})

function loadData() {
  if (loading.value) return

  if (keyword.value) {
    setTitle(`${keyword.value} (page ${page.value})`, 'Search')
  } else {
    setTitle('Search')
  }

  router.push({
    params: { keyword: keyword.value },
    query: { page: page.value, sort: sort.value, category: category.value },
  })

  loading.value = true
  error.value = ''

  if (!keyword.value) {
    return
  }

  axios
    .post<ApiResponseBookList>(
      `${API_BASE}/comics/advanced-search`,
      {
        keyword: keyword.value,
        categories: category.value,
        s: sort.value,
      },
      {
        params: {
          page: page.value,
        },
      }
    )
    .then(
      ({ data }) => {
        comics.value = data.body?.comics.docs
        totalPages.value = data.body?.comics.pages
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

watch(
  [keyword, category, page, sort],
  ([keyword, category], [oldKeyword, oldCategory]) => {
    if (keyword !== oldKeyword || category !== oldCategory) {
      page.value = 1
    }
    loadData()
  }
)
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
