<template lang="pug">
mixin pagenator
  book-list-paginator(
    v-model:page='page',
    v-model:sort='sort',
    :total-pages='totalPages'
  )

#search-container
  .bread-crumb
    NuxtLink.button(to='/categories')
      i.i-fa6-solid-arrow-left
      |
      | Categories Index

  h1(v-if='keyword') Search『{{ keyword }}』comics (page {{ page }})
  h1(v-else) Advanced Search

  PicaMbox(v-if='error', type='error', header='Failed to get comics data')
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    +pagenator
    books-list(:data='comics', :backTo='"/search?keyword=" + keyword')
    +pagenator
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getErrMsg } from '~/utils/getErrMsg'
import { setTitle } from '~/utils/setTitle'
import { picaClient } from '~/utils/pica-client'
import {
  PicaListSort,
  type ApiResponseBookList,
  type PicaBookListItem,
} from '~/types'

const route = useRoute()
const router = useRouter()

const keyword = ref((route.query.keyword as string) || '')
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
    path: '/search',
    query: {
      keyword: keyword.value,
      page: page.value,
      sort: sort.value,
      category: category.value,
    },
  })

  loading.value = true
  error.value = ''

  if (!keyword.value) {
    loading.value = false
    return
  }

  picaClient
    .searchComics(keyword.value, {
      category: category.value || undefined,
      page: page.value,
      sort: sort.value,
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

watch(
  () => route.query.keyword,
  (val) => {
    keyword.value = (val as string) || ''
  }
)

watch(
  [keyword, category, page, sort],
  ([kw, cat], [oldKw, oldCat]) => {
    if (kw !== oldKw || cat !== oldCat) {
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
